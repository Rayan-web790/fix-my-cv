require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const OpenAI = require('openai');
const admin = require('firebase-admin');
const { getPayPalAccessToken, createProduct, createPlan, verifySubscription } = require('./paypal');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
}) : null;

if (!openai && !groq) {
  console.warn("⚠️ No AI API keys found. Generation will fail.");
}


try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } else {
    admin.initializeApp({ projectId: 'fixmycv-auth' });
    console.warn("⚠️ Using Firebase projectId for token verification. Provide FIREBASE_SERVICE_ACCOUNT for full admin privileges.");
  }
} catch (e) {
  console.log("Firebase Admin Error:", e.message);
}

const db = admin.firestore();

// Centralized Error Logging
const logError = async (type, error, context = {}) => {
  console.error(`[${type}] Error:`, error.message || error);
  try {
    await db.collection('errors').add({
      type,
      message: error.message || String(error),
      context,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error("Critical: Failed to log error to Firestore", e.message);
  }
};

// Abuse Monitoring
const monitorAbuse = async (uid, action) => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  // Truly simple query - no composite index needed
  const snapshot = await db.collection('generations')
    .where('uid', '==', uid)
    .limit(20)
    .get();

  const recentRequests = snapshot.docs.filter(doc => {
    const data = doc.data();
    return data.created_at && data.created_at.toMillis() > fiveMinutesAgo;
  });

  if (recentRequests.length >= 10) {
    await db.collection('usage_alerts').add({
      uid,
      reason: 'High frequency requests (>10 in 5min)',
      count: snapshot.size,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }
};
const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split('Bearer ')[1];
  
  try {
    // Validate the token cryptographically via Firebase to guarantee authenticity
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    // Admin check via environment variable
    req.user.isAdmin = req.user.email === process.env.ADMIN_EMAIL;
    
    next();
  } catch (err) {
    await logError('AUTH_VERIFICATION', err, { tokenSnippet: token.substring(0, 10) });
    res.status(401).json({ error: 'Invalid or Expired Token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
};

// Helper to clean messages for AI providers (prevents errors from extra fields like 'timestamp')
const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  return messages.map(m => ({
    role: (m.role === 'assistant' || m.role === 'system') ? m.role : 'user',
    content: String(m.content || "")
  }));
};

const app = express();
const PORT = process.env.PORT || 7860;

app.use(cors({
  origin: true, // Allow any origin in development
  credentials: true
}));

// Webhook needs raw body
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    await logError('STRIPE_WEBHOOK_SIG', err);
    return res.sendStatus(400);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.client_reference_id; 
    if (uid) {
      await db.collection('users').doc(uid).set({ 
        is_premium: 1,
        subscription_id: session.subscription
      }, { merge: true });
      console.log(`✅ User ${uid} marked as PREMIUM via Webhook`);
    }
  }

  // Handle subscription cancellations
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const snapshot = await db.collection('users').where('subscription_id', '==', subscription.id).get();
    if (!snapshot.empty) {
      const uid = snapshot.docs[0].id;
      await db.collection('users').doc(uid).set({ is_premium: 0 }, { merge: true });
      console.log(`❌ User ${uid} premium subscription expired/cancelled.`);
    }
  }

  res.json({ received: true });
});

app.use(express.json());
app.use(cookieParser());

// Mock databases removed


// Removed fallback Improve CV logic 
// API Endpoints
app.get('/api/usage', verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const userRef = db.collection('users').doc(uid);
  let doc = await userRef.get();
  
  if (!doc.exists) {
    await userRef.set({ usage_count: 0, premium_usage_count: 0, is_premium: 0, last_text: '', last_reset: new Date() });
    doc = await userRef.get();
  }
  
  const userData = doc.data();
  
  // Daily Reset Check
  const last_reset = userData.last_reset ? userData.last_reset.toDate() : new Date();
  const now = new Date();
  if (now.toDateString() !== last_reset.toDateString()) {
    await userRef.update({ usage_count: 0, premium_usage_count: 0, last_reset: admin.firestore.FieldValue.serverTimestamp() });
    userData.usage_count = 0;
    userData.premium_usage_count = 0;
  }
  
  const isPremium = !!userData.is_premium;
  const limits = { used: isPremium ? (userData.premium_usage_count || 0) : (userData.usage_count || 0), total: isPremium ? 75 : 3 };
  
  res.json({ used: limits.used, total: limits.total, isPremium, isAdmin: !!userData.is_admin || req.user.isAdmin });
});

// Admin Endpoints
app.get('/api/admin/stats', verifyUser, isAdmin, async (req, res) => {
  try {
    const usersCount = (await db.collection('users').count().get()).data().count;
    const premiumUsersCount = (await db.collection('users').where('is_premium', '==', 1).count().get()).data().count;
    const generationsCount = (await db.collection('generations').count().get()).data().count;
    
    res.json({
      totalUsers: usersCount,
      premiumUsers: premiumUsersCount,
      totalGenerations: generationsCount
    });
  } catch (err) {
    await logError('ADMIN_STATS_FETCH', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

app.get('/api/admin/users', verifyUser, isAdmin, async (req, res) => {
  try {
    const { email } = req.query;
    let query = db.collection('users').orderBy('email');
    
    if (email) {
      // Simple search logic
      query = query.where('email', '>=', email).where('email', '<=', email + '\uf8ff');
    }
    
    const snapshot = await query.limit(50).get();
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    
    res.json({ users });
  } catch (err) {
    await logError('ADMIN_USERS_FETCH', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/toggle-premium', verifyUser, isAdmin, async (req, res) => {
  try {
    const { uid, isPremium } = req.body;
    await db.collection('users').doc(uid).set({ is_premium: isPremium ? 1 : 0 }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    await logError('ADMIN_TOGGLE_PREMIUM', err);
    res.status(500).json({ error: 'Failed to toggle premium status' });
  }
});

app.get('/api/admin/feedback', verifyUser, isAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('feedback').orderBy('timestamp', 'desc').limit(100).get();
    const feedback = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
    }));
    res.json({ feedback });
  } catch (err) {
    await logError('ADMIN_FEEDBACK_FETCH', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

app.get('/api/admin/errors', verifyUser, isAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('errors').orderBy('timestamp', 'desc').limit(100).get();
    const errors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
    }));
    res.json({ errors });
  } catch (err) {
    console.error("Critical: Failed to fetch errors", err);
    res.status(500).json({ error: 'Failed to fetch errors' });
  }
});

app.post('/api/create-checkout-session', verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5176';

  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return res.json({ 
        url: `${frontendUrl}/success?simulated=true&cid=${uid}`,
        simulated: true 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'FixMyCV Premium Subscription' },
          unit_amount: 500,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancel`,
      client_reference_id: uid,
    });

    res.json({ url: session.url });
  } catch (err) {
    await logError('STRIPE_CHECKOUT_CREATION', err, { uid });
    res.status(500).json({ error: err.message });
  }
});

// PayPal Configuration & Plan Initialization
app.get('/api/paypal/config', async (req, res) => {
  try {
    let planId = process.env.PAYPAL_PLAN_ID;
    
    // Auto-setup Plan if missing (simplifies user experience)
    if (!planId || planId === '') {
      console.log("🚀 Initializing PayPal Plan...");
      const token = await getPayPalAccessToken();
      const productId = await createProduct(token);
      planId = await createPlan(token, productId);
      console.log("✅ Created PayPal Plan:", planId);
      console.log("👉 Please add this to your .env: PAYPAL_PLAN_ID=" + planId);
    }

    res.json({ 
      clientId: process.env.PAYPAL_CLIENT_ID,
      planId: planId 
    });
  } catch (err) {
    await logError('PAYPAL_CONFIG_ERROR', err);
    res.status(500).json({ error: 'Failed to fetch PayPal config' });
  }
});

// PayPal Subscription Verification
app.post('/api/paypal/verify-subscription', verifyUser, async (req, res) => {
  const { subscriptionID } = req.body;
  const uid = req.user.uid;

  try {
    const subscription = await verifySubscription(subscriptionID);
    
    // Check if subscription is ACTIVE
    if (subscription.status === 'ACTIVE' || subscription.status === 'APPROVED') {
       await db.collection('users').doc(uid).set({ 
         is_premium: 1,
         paypal_subscription_id: subscriptionID,
         premium_until: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000) // Default 32 days padding
       }, { merge: true });
       
       res.json({ success: true, status: subscription.status });
    } else {
       res.status(400).json({ error: 'Subscription is not active', status: subscription.status });
    }
  } catch (err) {
    await logError('PAYPAL_VERIFY_ERROR', err, { subscriptionID, uid });
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
});


app.get('/api/verify-simulation', verifyUser, async (req, res) => {
  const uid = req.user.uid;
  if (uid) {
    await db.collection('users').doc(uid).set({ is_premium: 1 }, { merge: true });
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Missing UID' });
  }
});

const generateWithOpenAI = async (text, tone = 'Professional', modifier = null, jobDescription = '') => {
  let prompt = `You are an expert resume writer. Rewrite the following CV bullet points to be professional, concise, and results-oriented. Do not use first-person pronouns. Do not invent fake metrics. Improve clarity, grammar, and impact.
  
You MUST return your output in valid JSON format matching this EXACT schema:
{
  "improvedText": "The finalized markup string containing the rewritten CV bullets, each on a new line prefixed with a dash.",
  "feedback": ["A specific 4-7 word string analyzing the primary improvement you made", "Another specific 4-7 word string analyzing a secondary improvement you made"]`;

  let userContext = `Voice Tone: ${tone}\n`;
  if (jobDescription) {
    userContext += `Target Job Description:\n${jobDescription}\n`;
    prompt += `,\n  "matchScore": <Number between 0-100 indicating how well the rewritten text matches the job description>,\n  "missingSkills": ["Array of 1-3 critical skills from the JD that are STILL missing from the rewritten text"],\n  "matchedKeywords": ["Array of 1-5 required skills successfully embedded into the text"]`;
    prompt += `\n}\nReturn EXACTLY 2 strings in the feedback array. Do not return plain text.`;
    prompt += ` Analyze the Target Job Description. Extract the core technical skills, soft skills, and keywords required for the role. Naturally weave these exact keywords into the rewritten resume bullets. Base your matchScore STRICTLY on keyword overlap and the presence of required skills (do not invent a random score). You MUST wrap any job-description-matched keywords you insert in markdown bold syntax (like **keyword**) to highlight them visually.`;
  } else {
    prompt += `\n}\nReturn EXACTLY 2 strings in the feedback array. Do not return plain text.`;
  }
  
  if (modifier === 'stronger') {
    prompt += ` MAKE IT EXTREMELY STRONG AND IMPACTFUL. Use powerful action verbs and confidently frame achievements.`;
  } else if (modifier === 'shorter') {
    prompt += ` Keep it as concise and short as possible without losing the core achievement.`;
  } else if (modifier === 'tailor' && jobDescription) {
    prompt += ` Heavily tailor the wording specifically to fit the exact requirements and tone of the Job Description.`;
  }

  let attempt = 0;
  const maxAttempts = 3;
  while (attempt < maxAttempts) {
    try {
      // Try Groq first for speed/cost if available
      if (groq) {
        console.log(`[AI] Attempting generation with Groq (Attempt ${attempt + 1})...`);
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-70b-versatile",
          response_format: { type: "json_object" },
          messages: sanitizeMessages([
            { role: "system", content: prompt },
            { role: "user", content: `${userContext}\nOriginal Text:\n${text}` }
          ]),
          temperature: 0.7,
        });
        console.log("[AI] Groq generation successful.");
        return JSON.parse(completion.choices[0].message.content.trim());
      }
    } catch (e) {
      console.error(`[AI] Groq attempt ${attempt + 1} failed:`, e.message);
    }

    try {
      // Fallback to OpenAI if Groq fails or is not configured
      if (openai) {
        console.log(`[AI] Attempting fallback with OpenAI GPT-4o-mini (Attempt ${attempt + 1})...`);
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: sanitizeMessages([
            { role: "system", content: prompt },
            { role: "user", content: `${userContext}\nOriginal Text:\n${text}` }
          ]),
          temperature: 0.7,
        });
        console.log("[AI] OpenAI generation successful.");
        return JSON.parse(completion.choices[0].message.content.trim());
      }
    } catch (e) {
      console.error(`[AI] OpenAI attempt ${attempt + 1} failed:`, e.message);
    }

    attempt++;
    if (attempt >= maxAttempts) {
      throw new Error("All AI providers failed. Please check your API keys and quotas.");
    }
    await new Promise(res => setTimeout(res, 1000 * attempt));
  }
};

app.post('/api/improve', verifyUser, async (req, res) => {
  console.log(`[API] /api/improve request received from user: ${req.user.uid}`);
  const uid = req.user.uid;
  const { text, tone, modifier, jobDescription } = req.body;
  const currentText = text.trim();
  
  const userRef = db.collection('users').doc(uid);
  let userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    await userRef.set({ usage_count: 0, premium_usage_count: 0, last_text: '', is_premium: 0, last_reset: new Date() });
    userDoc = await userRef.get();
  }
  
  const userData = userDoc.data();
  
  const last_reset = userData.last_reset ? userData.last_reset.toDate() : new Date();
  const now = new Date();
  if (now.toDateString() !== last_reset.toDateString()) {
    await userRef.update({ usage_count: 0, premium_usage_count: 0, last_reset: admin.firestore.FieldValue.serverTimestamp() });
    userData.usage_count = 0;
    userData.premium_usage_count = 0;
  }
  
  const isSameText = userData.last_text === currentText;
  const isPremium = !!userData.is_premium;

  if (!isPremium && (userData.usage_count || 0) >= 3 && !isSameText) {
    return res.status(403).json({ error: 'Limit reached' });
  }
  
  // Premium Soft limits to prevent API bot abuse (75 calls per day per UID max)
  if (isPremium && (userData.premium_usage_count || 0) >= 75 && !isSameText) {
    await db.collection('usage_alerts').add({ uid, reason: 'Daily limit reached', timestamp: admin.firestore.FieldValue.serverTimestamp() });
    return res.status(429).json({ error: "You've reached today's fair usage limit of 75 API calls to protect our service. Please try again tomorrow." });
  }

  let improvedText;
  let feedbackData;
  let matchScore = null;
  let missingSkills = [];
  let matchedKeywords = [];
  try {
     console.log(`[AI] Starting generation for user ${uid}...`);
     const result = await generateWithOpenAI(text, tone, modifier, jobDescription);
     improvedText = result.improvedText;
     feedbackData = result.feedback;
     if (jobDescription) {
         matchScore = result.matchScore;
         missingSkills = result.missingSkills || [];
         matchedKeywords = result.matchedKeywords || [];
     }
  } catch (err) {
     await logError('OPENAI_GENERATION', err, { uid, tone, modifier });
     return res.status(503).json({ error: err.message || "AI is currently busy, please try again" });
  }
  
  if (!isSameText) {
    if (!isPremium) {
      await userRef.update({ 
        usage_count: admin.firestore.FieldValue.increment(1), 
        last_text: currentText 
      });
    } else {
      await userRef.update({ 
        premium_usage_count: admin.firestore.FieldValue.increment(1), 
        last_text: currentText 
      });
    }
  }
  
  // Save generation history
  await db.collection('generations').add({
    uid: uid,
    original_text: text,
    improved_text: improvedText,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  // Silent Monitoring
  await monitorAbuse(uid, 'improve');

  res.json({ improved: improvedText, feedback: feedbackData, matchScore, missingSkills, matchedKeywords, isPremium });
});

app.get('/api/history', verifyUser, async (req, res) => {
  const uid = req.user.uid;
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    const isPremium = userDoc.exists ? !!userDoc.data().is_premium : false;
    
    // Free users see only their top 5 recent generations, premium see all history
    let query = db.collection('generations').where('uid', '==', uid).orderBy('created_at', 'desc');
    if (!isPremium) {
      query = query.limit(5);
    }

    const snapshot = await query.get();
    const generations = snapshot.docs.map(doc => {
       const data = doc.data();
       return {
         ...data,
         id: doc.id,
         created_at: data.created_at ? data.created_at.toDate() : new Date()
       }
    });

    res.json({ generations, isPremium });
  } catch (err) {
    console.error("Failed to fetch history", err);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

// AI Career Coach Endpoints
app.get('/api/chat/history', verifyUser, async (req, res) => {
  const uid = req.user.uid;
  try {
    const snapshot = await db.collection('users').doc(uid).collection('chats')
      .orderBy('timestamp', 'asc')
      .limit(50)
      .get();
    
    const messages = snapshot.docs.map(doc => doc.data());
    res.json({ messages });
  } catch (err) {
    await logError('CHAT_HISTORY_FETCH', err, { uid });
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

app.post('/api/chat', verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { message, context, history } = req.body;

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    const isPremium = userDoc.exists ? !!userDoc.data().is_premium : false;

    if (!isPremium) {
      return res.status(403).json({ error: 'Pro feature only' });
    }

    const systemPrompt = `You are the FixMyCV AI Career Architect, an elite expert in resume strategy and job hunt psychology. 
    You are professional, punchy, and results-oriented.
    
    CURRENT USER CV CONTEXT:
    Original: ${context?.originalText || "Not provided"}
    Improved: ${context?.improvedText || "Not provided"}
    
    INSTRUCTIONS:
    1. Help the user optimize their career presence.
    2. Be technical and specific.
    3. If they ask about their CV, refer to the "Current Context" provided above.
    4. Keep responses high-impact and under 150 words unless asked for a deep dive.`;

    // Clean history to only include role and content (prevents API errors from extra fields like 'timestamp')
    const cleanedHistory = history.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...cleanedHistory.slice(-6), // Keep context of last 6 messages
      { role: "user", content: message }
    ];

    let aiMessage;
    try {
      if (groq) {
        console.log(`[CHAT] Attempting Groq generation...`);
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-70b-versatile",
          messages: sanitizeMessages(messages),
          temperature: 0.7,
          max_tokens: 500
        });
        aiMessage = completion.choices[0].message.content;
        console.log("[CHAT] Groq response successful.");
      } else {
        throw new Error("Groq not configured");
      }
    } catch (err) {
      console.error("[CHAT] Groq failed, trying OpenAI fallback:", err.message);
      if (openai) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: sanitizeMessages(messages),
          temperature: 0.7,
          max_tokens: 500
        });
        aiMessage = completion.choices[0].message.content;
        console.log("[CHAT] OpenAI fallback successful.");
      } else {
        throw new Error("No AI providers available for chat");
      }
    }

    // Save to Firestore
    const chatRef = db.collection('users').doc(uid).collection('chats');
    await chatRef.add({ role: 'user', content: message, timestamp: admin.firestore.FieldValue.serverTimestamp() });
    await chatRef.add({ role: 'assistant', content: aiMessage, timestamp: admin.firestore.FieldValue.serverTimestamp() });

    res.json({ response: aiMessage });
  } catch (err) {
    await logError('CHAT_AI_ERROR', err, { uid });
    res.status(500).json({ error: err.message });
  }
});

const path = require('path');
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


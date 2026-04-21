import React, { useState, useEffect, useContext, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Sparkles, Copy, FileDown, RefreshCw, AlertCircle, Check, Loader2, Wand2, Info, X, Crown, ArrowRight, Target, Briefcase, Zap, CheckCircle2, MousePointer2, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../utils/analytics';
import Scene3D from '../components/Scene3D';

const API_BASE = '/api';

const UpgradeModal = ({ isOpen, onClose, reason }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative glass-card bg-white dark:bg-slate-900 w-full max-w-md p-8 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
            <Crown size={32} />
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight text-center">
            {reason === 'limit' ? 'Unlock Your Unfair Advantage' : 'Elite Access Required'}
          </h2>
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl mb-6 text-center border border-primary-100 dark:border-primary-900/30">
             <p className="text-primary-700 dark:text-primary-300 text-xs font-black uppercase tracking-widest">
                New: AI Career Architect 24/7
             </p>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-center text-sm">
            {reason === 'limit' 
              ? 'You’ve reached the free limit. Join thousands of high-earners who use our Elite AI Coach to land $100k+ roles. Cancel anytime.' 
              : 'The AI Career Architect is an exclusive Pro feature that analyzes your career gaps and prepares you for interviews in real-time.'}
          </p>
          
          <div className="space-y-4">
            <Link 
              to="/pricing" 
              className="btn-primary w-full py-4 text-center flex items-center justify-center gap-2 group shadow-xl shadow-primary-500/20"
            >
              <span>Upgrade to Pro</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={onClose}
              className="w-full py-4 text-center text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const SkeletonLoader = () => (
  <div className="space-y-6 w-full px-4 animate-in fade-in duration-500">
    <div className="h-6 bg-slate-200/50 dark:bg-slate-800/50 rounded-full w-3/4 animate-pulse" />
    <div className="space-y-3">
      <div className="h-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-full w-full animate-pulse" />
      <div className="h-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-full w-5/6 animate-pulse" />
      <div className="h-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-full w-4/6 animate-pulse" />
    </div>
    <div className="h-6 bg-slate-200/50 dark:bg-slate-800/50 rounded-full w-2/3 animate-pulse" />
  </div>
);

export default function ToolPage() {
  const { isPremium, setCurrentCVContext } = useContext(AppContext);
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [output, setOutput] = useState('');
  const [successMessage, setSuccessMessage] = useState([]);
  const [matchScore, setMatchScore] = useState(null);
  const [missingSkills, setMissingSkills] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [loadingText, setLoadingText] = useState('Optimizing...');
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState({ used: 0, total: 3 });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalReason, setModalReason] = useState('limit');
  const [lastAttemptInput, setLastAttemptInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [shared, setShared] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentCVContext({ originalText: input, improvedText: output });
  }, [input, output, setCurrentCVContext]);

  const applyTemplate = (type) => {
    if (type === 'developer') {
      setInput('I worked at a big tech company and fixed some bugs and helped with code reviews. Also did some backend stuff.');
      setJobDescription('Looking for a Senior Software Engineer proficient in Node.js, distributed systems, and CI/CD.');
      setTone('Professional');
    } else if (type === 'marketing') {
      setInput('I supervised a team and managed a budget of some money. We ran ads on social media.');
      setJobDescription('Seeking a Marketing Director to oversee $500k+ budgets and lead high-performing teams.');
      setTone('Executive');
    } else if (type === 'student') {
      setInput('was president of the computer club and organized a hackathon for 50 people.');
      setJobDescription('Entry-level analyst role requiring strong leadership, event coordination, and proactive problem-solving skills.');
      setTone('Professional');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsage();
    } else {
      navigate('/signup');
    }
  }, [isPremium, currentUser, navigate]);

  const fetchUsage = async () => {
    try {
      const res = await axios.get(`${API_BASE}/usage`);
      setUsage(res.data);
    } catch (err) {
      console.error("Failed to fetch usage", err);
    }
  };

  const handleImprove = async (modifier = null) => {
    if (!input.trim()) {
      setError("Please paste some text first.");
      return;
    }

    if (!isPremium && usage.used >= usage.total) {
      setModalReason('limit');
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const loadTexts = ['Analyzing impact...', 'Rewriting for clarity...', 'Consulting ATS matrices...'];
    setLoadingText(loadTexts[Math.floor(Math.random() * loadTexts.length)]);

    // Perceived Performance: Delayed secondary loading message
    const secondaryLoadTimer = setTimeout(() => {
      setLoadingText("Still working... AI and ATS matrices take a few more seconds to align.");
    }, 8000);

    if (!modifier) setOutput(''); // Clear only on pure generation, not iterations
    if (!modifier) {
      setSuccessMessage([]);
      setMatchScore(null);
      setMissingSkills([]);
      setMatchedKeywords([]);
    }

    try {
      const res = await axios.post(`${API_BASE}/improve`, { 
        text: input,
        tone: tone,
        modifier: modifier,
        jobDescription: jobDescription,
        isPremium: isPremium 
      });
      setOutput(res.data.improved);
      setLastAttemptInput(input);
      // Use the newly engineered AI feedback directly
      setSuccessMessage(res.data.feedback || []);
      setMatchScore(res.data.matchScore || null);
      setMissingSkills(res.data.missingSkills || []);
      setMatchedKeywords(res.data.matchedKeywords || []);

      clearTimeout(secondaryLoadTimer);
      setShowFeedback(true);
      setFeedbackSubmitted(false);
      setFeedbackText('');

      setMatchedKeywords(res.data.matchedKeywords || []);

      trackEvent('cv_generated', { 
        tone, 
        isPremium, 
        hasJD: !!jobDescription,
        modifier: modifier || 'initial'
      });

      fetchUsage();
    } catch (err) {
      if (err.response?.status === 403) {
        setModalReason('limit');
        setShowUpgradeModal(true);
      } else {
        setError(err.response?.data?.message || "Generation failed. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!isPremium) {
      setModalReason('premium');
      setShowUpgradeModal(true);
      return;
    }
    
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("Professional Experience", 20, 30);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Optimized via FixMyCV", 20, 38);
    
    // Line separator
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85); // Slate-700
    
    const points = output.split('\n').filter(p => p.trim() !== '');
    let yPos = 55;
    const bulletIndent = 20;
    const textIndent = 26;
    const maxWidth = 190 - textIndent;

    points.forEach((point) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }

      let cleanPoint = point.trim();
      if (cleanPoint.startsWith('•') || cleanPoint.startsWith('-')) {
        cleanPoint = cleanPoint.substring(1).trim();
      }

      // Draw custom violet bullet
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(124, 58, 237); // Primary Violet
      doc.text("•", bulletIndent, yPos + 1);

      // Draw standard text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // Slate-700
      
      const lines = doc.splitTextToSize(cleanPoint, maxWidth);
      doc.text(lines, textIndent, yPos);
      
      yPos += (lines.length * 6) + 4; // Dynamic vertical spacing based on line wrapping
    });
    
    doc.save("FixMyCV_Optimized.pdf");
  };

  const handleShare = () => {
    const shareMessage = `This AI turned my bad CV into something actually hire-worthy 😳 Try it: ${window.location.origin}`;
    navigator.clipboard.writeText(shareMessage);
    setShared(true);
    trackEvent('share_result_clicked');
    setTimeout(() => setShared(false), 2000);
  };

  const submitFeedback = async (rating) => {
    try {
      await addDoc(collection(db, 'feedback'), {
        uid: currentUser?.uid,
        rating,
        message: feedbackText,
        timestamp: serverTimestamp(),
      });
      setFeedbackSubmitted(true);
      trackEvent('feedback_submitted', { rating });
    } catch (e) {
      console.error("Feedback error", e);
    }
  };

  return (
    <div className="relative w-full min-h-[85vh]">
      {/* Immersive 3D Background Spanning Full Width */}
      <div className="fixed inset-0 z-0 w-full h-full opacity-80 pointer-events-none">
        <Suspense fallback={null}>
          <Scene3D wide={true} />
        </Suspense>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)} 
          reason={modalReason}
        />

      {/* Modal Analytics */}
      {useEffect(() => {
        if (showUpgradeModal) {
          trackEvent('upgrade_modal_shown', { reason: modalReason });
        }
      }, [showUpgradeModal])}

      <div className="premium-blur top-0 right-1/4 w-[600px] h-[600px] bg-primary-500/5" />
      
      <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8 relative z-10">
        <div className="max-w-xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-4">
              Optimizer 
              {isPremium ? (
                 <span className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-black tracking-widest uppercase">
                    <Crown size={14} /> PRO
                 </span>
              ) : (
                <span className="text-primary-600">v2.0</span>
              )}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Turn basic CV lines into job-winning bullet points in seconds.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-full inline-flex items-center gap-2 border border-slate-200 dark:border-slate-800 shadow-sm">
                <Check size={14} className="text-primary-500" /> Built specifically for job seekers
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-full inline-flex items-center gap-2 border border-slate-200 dark:border-slate-800 shadow-sm">
                <Zap size={14} className="text-amber-500" /> Optimized for ATS systems
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-full inline-flex items-center gap-2 border border-slate-200 dark:border-slate-800 shadow-sm">
                <Wand2 size={14} className="text-indigo-500" /> No prompting required
              </p>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="glass-card flex items-center p-1 px-4 pr-1 gap-6 border-slate-200/60 dark:bg-white/5"
        >
          <div className="flex items-center gap-3 py-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                {isPremium ? 'Account Status' : 'Daily Balance'}
              </span>
              <span className="text-sm font-bold dark:text-white">
                {isPremium ? (
                  <span className="text-amber-600">Unlimited</span>
                ) : (
                  <>
                    <span className={usage.used >= usage.total ? 'text-red-500' : 'text-primary-600'}>{usage.total - usage.used}</span>
                    <span className="text-slate-300 dark:text-slate-700 mx-1">/</span>
                    <span className="text-slate-500">{usage.total} left</span>
                  </>
                )}
              </span>
            </div>
          </div>
          {!isPremium && (
            <Link to="/pricing" className="btn-primary py-2.5 px-5 text-xs h-full flex items-center font-bold tracking-tight">
              Unlock unlimited CV improvements for $5
            </Link>
          )}
        </motion.div>
      </div>

      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Quick Start Templates</span>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => applyTemplate('developer')} className="py-2.5 px-4 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-slate-600 dark:text-slate-300 shadow-sm">
            👨‍💻 Software Engineer
          </button>
          <button onClick={() => applyTemplate('marketing')} className="py-2.5 px-4 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-all text-slate-600 dark:text-slate-300 shadow-sm">
            📈 Marketing Manager
          </button>
          <button onClick={() => applyTemplate('student')} className="py-2.5 px-4 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-slate-600 dark:text-slate-300 shadow-sm">
            🎓 Entry Level / Student
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              Raw Input
            </span>
            <span className="text-[10px] font-bold text-slate-400">{input.length} chars</span>
          </div>
          
          <div className="relative group flex-grow">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your CV bullet point to get started..."
              className="w-full h-[360px] p-8 glass-card bg-white dark:bg-slate-900/40 border-2 border-transparent focus:border-primary-500 outline-none resize-none dark:text-white text-xl leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all duration-300 shadow-none hover:shadow-2xl hover:shadow-primary-500/5 group-focus-within:shadow-2xl group-focus-within:shadow-primary-500/10"
            />
            {!input && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none opacity-40 select-none">
                 <MousePointer2 size={40} className="text-primary-400 mb-4 animate-bounce" />
                 <p className="text-center text-slate-400 font-bold max-w-[200px]">Copy a bullet from your current CV and paste it here</p>
                 <button 
                   onClick={() => {
                    setInput('I worked at a grocery store and handled customers and stocked shelves. Also did some inventory.');
                    trackEvent('try_example_clicked');
                  }}
                  className="mt-6 pointer-events-auto bg-slate-100 dark:bg-slate-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all flex items-center gap-2 group"
                 >
                   <Sparkles size={14} className="group-hover:text-primary-500" />
                   Try an Example
                 </button>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Voice Tone</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Professional', 'Simple', 'Aggressive', 'Executive'].map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${tone === t ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-md shadow-primary-500/10' : 'border-transparent bg-slate-50 dark:bg-slate-900/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2 flex items-center gap-1.5"><Briefcase size={12}/> Paste Job Description (Optional)</span>
            <textarea 
              value={jobDescription} 
              onChange={(e) => setJobDescription(e.target.value)} 
              placeholder="Paste the full job description here. The AI will weave in exact keywords to match requirements..." 
              className="w-full min-h-[140px] max-h-[300px] p-4 glass-card bg-white dark:bg-slate-900/40 border-2 border-transparent focus:border-primary-500 outline-none resize-y dark:text-white text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all rounded-xl shadow-none hover:shadow-lg hover:shadow-primary-500/5 focus:shadow-xl focus:shadow-primary-500/10"
            />
          </div>

          
          <button
            onClick={() => handleImprove(null)}
            disabled={isLoading}
            className={`mt-6 w-full py-5 rounded-2xl flex items-center justify-center space-x-3 font-bold text-lg transition-all duration-500 ${
              isLoading
                ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                : 'btn-primary shadow-2xl hover:-translate-y-1 ' + (input && !output ? 'ring-4 ring-primary-500/20' : '')
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <Wand2 size={22} className={`${input && !output ? 'animate-pulse' : ''} group-hover:rotate-12 transition-transform`} />
                <span>Fix My CV</span>
                {input && !output && (
                  <motion.span 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full"
                  >
                    Click to start
                  </motion.span>
                )}
              </>
            )}
          </button>
          
          <div className="mt-4 text-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Designed to match real hiring manager expectations
            </span>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 flex items-start space-x-3 text-red-500 bg-red-50/50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100/50 dark:border-red-900/30 font-medium"
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Output Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
              AI Result
            </span>
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  // Clean formatting: remove double spaces, artifacts, and ensure clean line breaks
                  const cleanOutput = output
                    .split('\n')
                    .map(line => line.replace(/^[•-]\s*/, '• ').trim())
                    .filter(line => line.length > 0)
                    .join('\n');
                  navigator.clipboard.writeText(cleanOutput);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                disabled={!output}
                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary-600 transition-colors disabled:opacity-30"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </motion.button>
              <div className="relative group">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDownloadPDF}
                  disabled={!output}
                  className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary-600 transition-colors disabled:opacity-30 flex items-center gap-2"
                >
                  <FileDown size={18} />
                  {!isPremium && output && (
                    <Crown size={12} className="text-amber-500 absolute -top-1 -right-1 fill-amber-500" />
                  )}
                </motion.button>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                disabled={!output}
                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary-600 transition-colors disabled:opacity-30 relative"
              >
                {shared ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
                {shared && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">Message Copied!</span>
                )}
              </motion.button>
            </div>
          </div>

          <div className={`w-full h-[536px] p-8 lg:p-10 glass-card bg-slate-50/50 dark:bg-slate-950/40 relative overflow-auto border-dashed border-2 flex-grow ${!output ? 'flex items-center justify-center' : ''}`}>
             {output ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                {successMessage && successMessage.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-3 text-sm font-bold border-b border-slate-200 dark:border-slate-800 pb-5">
                    {successMessage.map((msg, i) => (
                      <span key={i} className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1.5">
                        <Check size={14}/> {msg}
                      </span>
                    ))}
                  </div>
                )}

                {(matchScore !== null) && (
                  <div className="mb-6 flex flex-col sm:flex-row gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 min-w-max">
                       <Target className={matchScore >= 80 ? "text-emerald-500" : (matchScore >= 60 ? "text-amber-500" : "text-red-500")} size={28} />
                       <div>
                         <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">JD Match Score</div>
                         <div className={`text-2xl font-extrabold ${matchScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : (matchScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")} leading-none`}>{matchScore}%</div>
                       </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      {matchedKeywords && matchedKeywords.length > 0 && (
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <div className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider flex items-center gap-1.5 mb-1.5"><CheckCircle2 size={10}/> Successfully Matched Keywords</div>
                          <div className="flex flex-wrap gap-1.5">
                             {matchedKeywords.map((skill, i) => (
                               <span key={i} className="text-[10px] font-bold bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 px-1.5 py-0.5 rounded shadow-sm">
                                 {skill}
                               </span>
                             ))}
                          </div>
                        </div>
                      )}
                      {missingSkills && missingSkills.length > 0 && (
                        <div className="bg-red-50/50 dark:bg-red-950/20 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                          <div className="text-[9px] uppercase font-bold text-red-500 tracking-wider flex items-center gap-1.5 mb-1.5"><AlertCircle size={10}/> Critical Missing Skills</div>
                          <div className="flex flex-wrap gap-1.5">
                             {missingSkills.map((skill, i) => (
                               <span key={i} className="text-[10px] font-bold bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-1.5 py-0.5 rounded shadow-sm">
                                 {skill}
                               </span>
                             ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                   {/* Left: Original */}
                   <div className="flex flex-col">
                      <div className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 mb-2 px-1">Original Input</div>
                      <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 line-through decoration-slate-300 dark:decoration-slate-700 italic font-medium leading-relaxed">
                         {lastAttemptInput}
                      </div>
                   </div>
                   
                   {/* Right: Improved */}
                   <div className="flex flex-col">
                      <div className="text-[10px] font-bold uppercase tracking-[2px] text-primary-500 mb-2 px-1 flex items-center gap-1.5"><Sparkles size={10}/> FixMyCV Optimized</div>
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary-100 dark:border-primary-900/30 shadow-xl shadow-primary-500/5 min-h-[140px]">
                        <ul className="space-y-4 font-sans text-lg font-medium">
                          {output.split('\n').map((line, idx) => {
                            const cleanLine = line.replace(/^[•-]\s*/, '');
                            if (!cleanLine.trim()) return null;
                            const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                            return (
                              <li key={idx} className="flex items-start gap-3 text-slate-900 dark:text-white">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 mt-2.5" />
                                <span className="leading-relaxed">
                                  {parts.map((p, i) => {
                                    if (p.startsWith('**') && p.endsWith('**')) {
                                      return <strong key={i} className="text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-900/20 px-1 rounded mx-0.5">{p.slice(2, -2)}</strong>
                                    }
                                    return p;
                                  })}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-full">
                {isLoading ? (
                  <SkeletonLoader />
                ) : (
                  <div className="text-center space-y-4 max-w-xs mx-auto opacity-30">
                    <Sparkles size={60} className="mx-auto text-slate-400" />
                    <p className="text-lg font-bold text-slate-400 tracking-tight leading-snug">Generate to see professional results here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <AnimatePresence>
            {output && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-wrap gap-3 w-full"
              >
                <button 
                  onClick={() => handleImprove('stronger')} 
                  disabled={isLoading}
                  className="py-3 px-4 rounded-xl text-sm font-bold flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500 shadow-sm transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50 hover:text-orange-500"
                >
                  🔥 Make it stronger
                </button>
                <button 
                  onClick={() => handleImprove('shorter')} 
                  disabled={isLoading}
                  className="py-3 px-4 rounded-xl text-sm font-bold flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500 shadow-sm transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50 hover:text-primary-500"
                >
                  ✂️ Make it shorter
                </button>
                <button 
                  onClick={() => handleImprove('tailor')} 
                  disabled={isLoading}
                  className="py-3 px-4 rounded-xl text-sm font-bold flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50 hover:text-blue-500"
                >
                  🎯 Tailor for job
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Section */}
          <AnimatePresence>
            {output && showFeedback && !feedbackSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 glass-card p-6 border-slate-200/60"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight">Was this optimization helpful?</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => submitFeedback('yes')}
                      className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 transition-all flex items-center gap-2"
                    >
                      <ThumbsUp size={18} />
                    </button>
                    <button 
                      onClick={() => submitFeedback('no')}
                      className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 hover:bg-red-100 transition-all flex items-center gap-2"
                    >
                      <ThumbsDown size={18} />
                    </button>
                  </div>
                </div>
                {/* Optional Text input for "no" or general feedback */}
                <div className="mt-4">
                   <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Any suggestions for us? (Optional)"
                    className="w-full p-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary-500 transition-all"
                   />
                </div>
              </motion.div>
            )}
            {feedbackSubmitted && (
               <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-8 p-4 text-center text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
               >
                 Thanks for your feedback! 🚀
               </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-8 flex items-center justify-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
             <span className="flex items-center gap-1.5"><Check size={12} className="text-green-500"/> ATS Friendly</span>
             <span className="flex items-center gap-1.5"><Check size={12} className="text-green-500"/> Action-Oriented</span>
             <span className="flex items-center gap-1.5"><Check size={12} className="text-green-500"/> Measurable Impact</span>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}

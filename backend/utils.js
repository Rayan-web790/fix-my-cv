/**
 * Rewrites CV text into professional resume bullet points.
 * 
 * Rules:
 * - Concise and impactful
 * - Strong action verbs
 * - Measurable results (simulated)
 * - Realistic tone
 * - Formatted as bullet points
 */
const rewriteCVPoints = (text) => {
  const points = text.split('\n').filter(p => p.trim() !== '');
  
  const mapping = [
    { 
      trigger: /helped/i, 
      replacement: 'Delivered high-quality support and collaborated with teams to' 
    },
    { 
      trigger: /responsible for/i, 
      replacement: 'Spearheaded the end-to-end management of' 
    },
    { 
      trigger: /worked on/i, 
      replacement: 'Architected and implemented strategic solutions for' 
    },
    { 
      trigger: /did/i, 
      replacement: 'Executed professional tasks involving' 
    },
    { 
      trigger: /managed/i, 
      replacement: 'Orchestrated and led a high-performing team to' 
    },
    { 
      trigger: /made/i, 
      replacement: 'Engineered and scaled technical solutions for' 
    },
    { 
      trigger: /improved/i, 
      replacement: 'Optimized performance and efficiency through' 
    },
    { 
      trigger: /used/i, 
      replacement: 'Leveraged advanced tools and methodologies to' 
    },
  ];

  const outcomes = [
    'improving team efficiency by 20%.',
    'enhancing overall workflow productivity.',
    'driving record business growth and scalability.',
    'improving user satisfaction across 10,000+ active users.',
    'reducing operational costs by 15% through strategic optimization.'
  ];

  return points.map(point => {
    let cleanPoint = point.trim();
    // Remove existing bullets if present
    if (cleanPoint.startsWith('-') || cleanPoint.startsWith('•') || cleanPoint.startsWith('*')) {
      cleanPoint = cleanPoint.substring(1).trim();
    }

    let result = cleanPoint;
    let matched = false;

    // Apply rule-based transformations
    for (const item of mapping) {
      if (item.trigger.test(result)) {
        result = result.replace(item.trigger, item.replacement);
        matched = true;
        break;
      }
    }

    // Fallback if no specific trigger matched: prepend a strong action verb
    if (!matched) {
      const starters = ['Spearheaded', 'Orchestrated', 'Transformed', 'Optimized', 'Engineered'];
      const starter = starters[Math.floor(Math.random() * starters.length)];
      result = `${starter} the ${result.charAt(0).toLowerCase()}${result.slice(1)}`;
    }

    // Append measurable outcomes for impact (if not already present)
    if (result.length > 15 && !result.includes('%') && !result.includes('$')) {
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      result = `${result}, ${outcome}`;
    }

    return `• ${result}`;
  }).join('\n');
};

// Example usage and test
const input = "helped customers at a store\nworked on the frontend\nresponsible for reports";
console.log("Input:\n", input);
console.log("\nOutput:\n", rewriteCVPoints(input));

module.exports = { rewriteCVPoints };

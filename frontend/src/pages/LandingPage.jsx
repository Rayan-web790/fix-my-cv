import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { FileText, Zap, Shield, ChevronRight, CheckCircle2, TrendingUp, Sparkles, Target, Wand2, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import Scene3D from '../components/Scene3D';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  })
};

const Hero = () => (
  <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-8 border border-primary-100 dark:border-primary-800 shadow-sm">
            <Sparkles size={14} className="mr-2 animate-pulse" />
            <span className="uppercase tracking-widest">Powered by GPT-4 Optimization</span>
          </span>
          <h1 className="heading-hero mb-8 leading-[1.1]">
            Get hired faster with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500 animate-gradient-x">
              better CV bullet points
            </span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Stop struggling with bullet points. Our AI transforms your experience into high-impact, professional achievements that grab recruiters' attention.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/tool" className="btn-primary py-4 px-10 text-lg group w-full sm:w-auto shadow-2xl shadow-primary-500/30">
              Professionalize Now
              <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/pricing" className="btn-secondary py-4 px-10 text-lg w-full sm:w-auto">
              Compare Plans
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm font-bold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Shield size={16} className="text-emerald-500" />
              <span>Built specifically for job seekers</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Zap size={16} className="text-amber-500" />
              <span>Optimized for ATS systems</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Wand2 size={16} className="text-indigo-500" />
              <span>Zero prompting required</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Before/After Preview */}
      <motion.div 
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mt-24 max-w-5xl mx-auto relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
        <div className="glass-card relative grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-10 relative bg-white/40 dark:bg-transparent">
            <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2" />
              Before Optimization
            </h3>
            <p className="text-slate-500 dark:text-slate-400 italic text-lg opacity-70">"I was responsible for helping customers and working on projects at my store."</p>
          </div>
          <div className="p-10 relative bg-gradient-to-br from-primary-50/30 to-indigo-50/30 dark:from-primary-900/10 dark:to-indigo-900/10">
            <h3 className="text-primary-600 dark:text-primary-400 font-bold text-[10px] uppercase tracking-widest mb-6 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mr-2 animate-ping" />
              After FixMyCV
            </h3>
            <p className="text-slate-900 dark:text-white font-semibold text-lg leading-relaxed">
              "Orchestrated cross-functional projects and collaborated with diverse teams to optimize customer engagement, resulting in a 25% improvement in satisfaction ratings."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
    {/* 3D Interactive Background */}
    <Suspense fallback={<div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -z-10" />}>
      <Scene3D />
    </Suspense>
    {/* Fallback glow for structure */}
    <div className="premium-blur top-0 right-0 w-[800px] h-[800px] bg-primary-500/5 -z-20" />
  </section>
);

const Feature = ({ icon: Icon, title, desc, index }) => (
  <motion.div 
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeIn}
    className="glass-card p-10 hover:border-primary-400 dark:hover:border-primary-500 group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary-500/10 transition-colors" />
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-8 group-hover:rotate-6 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Senior Engineer at Google",
    quote: "I was skeptical of AI writing, but FixMyCV actually captured the nuance of my backend work. It saved me hours of frustration and helped me land L5.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Marcus Chen",
    role: "Product Manager at Stripe",
    quote: "The ATS optimization feature is a game-changer. I went from getting zero callbacks to having three interviews lined up in the same week.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Elena Rodriguez",
    role: "UX Researcher at Spotify",
    quote: "FixMyCV took my vague bullet points and turned them into powerful impact statements. The results speak for themselves.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "David Kim",
    role: "Data Scientist at Meta",
    quote: "I'm good at numbers, not writing. This tool beautifully summarized my complex data projects into digestible value propositions for recruiters.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80"
  }
];

export default function LandingPage() {
  return (
    <div className="pb-32">
      <Hero />
      
      <section className="relative py-32 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight"
            >
              Built for high-ambition careers
            </motion.h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              We leverage proprietary AI models trained on thousands of successful resumes from Google, Apple, and McKinsey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <Feature 
              index={0}
              icon={Zap} 
              title="Impact Starters" 
              desc="Forget 'responsible for'. Our AI injects powerful action verbs that command attention and denote leadership." 
            />
            <Feature 
              index={1}
              icon={Shield} 
              title="ATS Optimization" 
              desc="Our rewrites are engineered to satisfy Applicant Tracking Systems while remaining deeply human and authentic." 
            />
            <Feature 
              index={2}
              icon={Sparkles} 
              title="Expert Heuristics" 
              desc="Every optimization follows the Google XYZ formula: accomplished [X] as measured by [Y], by doing [Z]." 
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <span className="text-primary-600 font-bold uppercase tracking-widest text-xs mb-4 block">Success Stories</span>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">Trusted by global talent</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                Professionals using FixMyCV have seen a 65% increase in recruiter reach-outs within the first month.
              </p>
              <div className="flex -space-x-3">
                {testimonials.slice(0, 4).map((t, i) => (
                  <img key={i} src={t.image} alt={t.name} className="w-12 h-12 rounded-full border-4 object-cover border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800" />
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-950 bg-primary-600 flex items-center justify-center text-white text-xs font-bold z-10">
                  +2k
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -8 }}
                  className="glass-card p-10 relative"
                >
                  <Quote size={40} className="absolute top-6 right-6 text-primary-500/10" />
                  <div className="flex items-center space-x-4 mb-8">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800" />
                    <div>
                      <h4 className="font-bold dark:text-white tracking-tight">{t.name}</h4>
                      <p className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 italic font-medium leading-[1.8]">
                    "{t.quote}"
                  </p>
                  <div className="flex text-yellow-400 mt-8 gap-1">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 px-4 mb-20">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto glass-card bg-slate-900 border-none p-16 md:p-24 text-center text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">Ready for the upgrade?</h2>
            <p className="text-slate-400 mb-12 max-w-xl mx-auto text-xl font-medium">Join 10,000+ professionals who have already professionalized their career stories.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/tool" className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-xl font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-500 transition-all duration-300 shadow-2xl shadow-primary-500/30 active:scale-95 w-full sm:w-auto">
                Get Started for Free
              </Link>
              <Link to="/pricing" className="inline-flex items-center justify-center px-10 py-5 border border-slate-700 text-xl font-bold rounded-xl text-white hover:bg-slate-800 transition-all duration-300 w-full sm:w-auto">
                Compare Plans
              </Link>
            </div>
            
            <div className="mt-12 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-sm text-slate-300 font-medium">
                More features coming soon to continuously upgrade your professional life.
              </p>
            </div>
          </div>
          
          {/* Abstract background for CTA */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
             <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] bg-primary-600/40 rounded-full blur-[160px]" />
             <div className="absolute bottom-[-30%] right-[-10%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[120px]" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}

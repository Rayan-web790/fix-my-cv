import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Clock, Copy, Check, Lock, Sparkles, ArrowRight, FileText, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:5002/api';

export default function HistoryPage() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/history`);
        setGenerations(res.data.generations);
        setIsPremium(res.data.isPremium);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser, navigate]);

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto relative z-10">
      
      {/* Header section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 font-semibold tracking-wide uppercase text-sm mb-2">
            <Clock size={16} />
            <span>Activity Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your CV Asset Library
          </h1>
        </div>
        
        <Link to="/tool" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5">
          <Sparkles size={18} />
          <span>New Generation</span>
        </Link>
      </div>

      {/* Dashboard Metrics */}
      {!loading && generations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Assets</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{isPremium ? generations.length : (generations.length === 5 ? '5+' : generations.length)}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">ATS Ready</div>
            <div className="text-3xl font-extrabold text-emerald-500">100%</div>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/10 p-5 rounded-2xl shadow-sm border border-primary-100 dark:border-primary-900/30 col-span-2 md:col-span-2 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Pro Tip</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">Continuous editing builds the perfect resume. Paste your Job Description to instantly boost ATS match scores!</div>
            </div>
            <Sparkles className="text-primary-400/50 shrink-0 hidden sm:block" size={40} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading history...</p>
        </div>
      ) : generations.length === 0 ? (
        <div className="glass-card bg-white/50 dark:bg-slate-900/50 p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">It's pretty quiet here</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
            You haven't generated any AI resume bullets yet. Start optimizing your CV to see your history populated here.
          </p>
          <Link to="/tool" className="btn-primary inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl">
            Go to Optimizer <ArrowRight size={20} />
          </Link>
        </div>
      ) : (
        <div className="relative">
          <div className="space-y-6">
            {generations.map((gen, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={gen.id} 
                className="glass-card bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-200 dark:border-slate-800 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {formatDate(gen.created_at)}
                  </span>
                  
                  <button 
                    onClick={() => copyToClipboard(gen.id, gen.improved_text)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {copiedId === gen.id ? (
                      <><Check size={16} className="text-green-500" /> <span className="text-green-500">Copied!</span></>
                    ) : (
                      <><Copy size={16} /> <span>Copy</span></>
                    )}
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 relative">
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center text-slate-400 z-10 border border-white dark:border-slate-900">
                    <ChevronRight size={18} />
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original input</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{gen.original_text}</p>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-950/20 p-5 rounded-xl border border-primary-100 dark:border-primary-900/30">
                    <h3 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles size={12} /> Optimized Output
                    </h3>
                    <p className="text-slate-900 dark:text-white font-medium leading-relaxed">{gen.improved_text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium Lock Overlay for Free Users */}
          {!isPremium && generations.length >= 5 && (
             <div className="relative mt-8 text-center pt-16 pb-8">
               <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none -mt-40 z-10" />
               <div className="relative z-20">
                 <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30 rotate-3">
                   <Lock className="text-white relative z-10" size={28} />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unlock Your Full History</h3>
                 <p className="text-slate-500 font-medium mb-6 max-w-sm mx-auto">
                   Free accounts only retain the last 5 generations. Upgrade to Premium to save unlimited outputs.
                 </p>
                 <Link to="/pricing" className="btn-primary px-8 py-3.5 rounded-xl font-bold">
                   Upgrade to Premium
                 </Link>
               </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

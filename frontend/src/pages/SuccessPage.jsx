import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Crown, ArrowRight, PartyPopper, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../App';

const API_BASE = '/api';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const { checkPremium } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const cid = searchParams.get('cid');
    const simulated = searchParams.get('simulated');

    if (simulated === 'true' && cid) {
      const verify = async () => {
        try {
          await axios.get(`${API_BASE}/verify-simulation?cid=${cid}`);
          await checkPremium();
          setIsVerifying(false);
        } catch (err) {
          console.error("Verification failed", err);
          setIsVerifying(false);
        }
      };
      verify();
    } else {
      // For real Stripe, we just wait for the webhook or check status
      setTimeout(async () => {
        await checkPremium();
        setIsVerifying(false);
      }, 2000);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="glass-card max-w-2xl mx-auto p-16 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isVerifying ? (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="animate-spin text-primary-600 mb-6" size={64} />
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Verifying Payment...</h1>
              <p className="text-slate-500">Almost there! We're upgrading your account.</p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
                <CheckCircle size={48} />
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="text-amber-500 fill-amber-500" size={20} />
                <span className="text-amber-600 font-black tracking-widest uppercase text-sm">Pro Unlocked</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
                Welcome to the ELITE!
              </h1>
              
              <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 font-medium leading-relaxed">
                Your account has been upgraded to **PRO**. You now have unlimited AI optimizations and full PDF export access.
              </p>
              
              <Link to="/tool" className="btn-primary py-5 px-12 text-xl group inline-flex items-center gap-3">
                Start Optimizing
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Background Sparkles */}
        {!isVerifying && (
          <div className="absolute inset-0 pointer-events-none">
             <PartyPopper size={40} className="absolute top-10 left-10 text-primary-500/20 rotate-12" />
             <PartyPopper size={40} className="absolute bottom-10 right-10 text-indigo-500/20 -rotate-12" />
          </div>
        )}
      </div>
    </div>
  );
}

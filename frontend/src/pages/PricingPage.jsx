import React, { useState } from 'react';
import { Check, Zap, Crown, Shield, Star, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { trackEvent } from '../utils/analytics';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";


const API_BASE = '/api';

const PricingCard = ({ tier, price, features, highlighted, cta, icon: Icon, delay, onCheckout, isLoading, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    whileHover={{ y: -10, scale: 1.01 }}
    className={`glass-card p-10 flex flex-col relative overflow-hidden group ${highlighted ? 'ring-2 ring-primary-500 scale-105 z-10 shadow-2xl shadow-primary-500/10' : ''}`}
  >
    {highlighted && (
      <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-[10px] font-bold px-6 py-1.5 rounded-b-xl uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20">
        Most Popular
      </div>
    )}

    {highlighted && (
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/20 transition-colors" />
    )}
    
    <div className="mb-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 duration-500 ${highlighted ? 'bg-primary-600 text-white shadow-primary-500/30' : 'bg-slate-50 dark:bg-slate-900/60 text-primary-600 dark:text-primary-400'}`}>
        <Icon size={28} />
      </div>
      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">{tier}</h3>
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter">${price}</span>
        <span className="text-slate-400 font-bold text-sm tracking-wide">/MONTH</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium leading-relaxed">
        {tier === 'Free Plan' ? 'Perfect for trying the engine.' : 'For serious job seekers looking for an edge.'}
      </p>
    </div>

    <ul className="space-y-5 mb-12 flex-grow">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start space-x-4 text-slate-600 dark:text-slate-300 text-sm font-medium leading-tight">
          <div className={`mt-0.5 rounded-full p-0.5 ${highlighted ? 'bg-primary-500/20 text-primary-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Check size={14} className="stroke-[3px]" />
          </div>
          <span className="opacity-90">{feature}</span>
        </li>
      ))}
    </ul>
    
    {children ? children : (
      <button 
        onClick={() => onCheckout(tier)}
        disabled={isLoading}
        className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${highlighted ? 'btn-primary group-hover:shadow-[0_20px_40px_rgb(124,58,237,0.3)]' : 'btn-secondary border-2'}`}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            {cta}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    )}
  </motion.div>
);


export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState(null);
  const [paypalConfig, setPaypalConfig] = useState(null);

  useState(() => {
    // Fetch PayPal Config (ClientId and PlanId) on mount
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/paypal/config`);
        setPaypalConfig(res.data);
      } catch (err) {
        console.error("Failed to load PayPal config", err);
      }
    };
    fetchConfig();
  }, []);

  const handleCheckout = async (tier) => {
    if (tier === 'Free Plan') {
      window.location.href = '/tool';
      return;
    }
    // Standard button click (if not handled by PayPalButtons directly)
    setLoadingTier(tier);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-28 relative">
      <div className="premium-blur top-0 left-1/2 -translate-x-1/2 w-4/5 h-4/5 bg-primary-500/5" />
      
      <div className="text-center mb-28 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 mb-8 border border-slate-200 dark:border-slate-800 tracking-[0.2em] uppercase">
            Monthly Membership
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tighter">
            One simple <span className="text-primary-600">investment</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Join thousands of professionals who improved their hire-ability with a premium career toolkit.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto relative z-10">
        <PricingCard 
          delay={0.2}
          tier="Free Plan"
          price="0"
          icon={Zap}
          features={[
             "3 Premium AI optimizations per day",
             "Standard PDF formatting",
             "Email support (24h response)",
             "General career advice library",
             "Basic ATS compatibility check"
          ]}
          cta="Start Optimizing"
          onCheckout={handleCheckout}
          isLoading={loadingTier === 'Free Plan'}
        />
        <PricingCard 
          delay={0.4}
          tier="Premium Plan"
          price="5"
          highlighted={true}
          icon={Crown}
          features={[
             "75 Premium Optimizations per day",
             "Priority AI processing (faster)",
             "Premium export templates",
             "Action verb intensity control",
             "Industry-specific keyword injection",
             "Elite AI Career Architect (24/7)",
             "Context-aware interview preparation"
          ]}
          cta="Go Premium"
          onCheckout={handleCheckout}
          isLoading={loadingTier === 'Premium Plan'}
        >
           {paypalConfig && (
             <div className="mt-4">
               <PayPalScriptProvider options={{ 
                 "client-id": paypalConfig.clientId,
                 vault: true,
                 intent: "subscription"
               }}>
                 <PayPalButtons 
                   style={{ 
                     shape: 'pill',
                     color: 'blue',
                     layout: 'vertical',
                     label: 'subscribe'
                   }}
                   createSubscription={(data, actions) => {
                     return actions.subscription.create({
                       plan_id: paypalConfig.planId
                     });
                   }}
                   onApprove={async (data, actions) => {
                      setLoadingTier('Premium Plan');
                      try {
                        const res = await axios.post(`${API_BASE}/paypal/verify-subscription`, {
                          subscriptionID: data.subscriptionID
                        });
                        if (res.data.success) {
                          trackEvent('payment_success', { subscriptionID: data.subscriptionID });
                          window.location.href = '/success';
                        }
                      } catch (err) {
                        alert("Verification failed. Please contact support.");
                        console.error(err);
                      } finally {
                        setLoadingTier(null);
                      }
                   }}
                 />
               </PayPalScriptProvider>
             </div>
           )}
        </PricingCard>
      </div>


      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-32 pt-20 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
         <div className="flex items-center space-x-3 group">
            <Shield size={24} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
            <span className="font-bold text-xs uppercase tracking-widest">PayPal Secured</span>
         </div>
         <span className="font-extrabold text-xl tracking-tighter">Forbes</span>
         <span className="font-extrabold text-xl tracking-tighter">TechCrunch</span>
         <span className="font-extrabold text-xl tracking-tighter">NY Times</span>
         <div className="flex items-center space-x-2">
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-sm">4.9/5 by Users</span>
         </div>
      </motion.div>
    </div>
  );
}

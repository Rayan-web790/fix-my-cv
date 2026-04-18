import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CancelPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="glass-card max-w-xl mx-auto p-16 border-red-100 dark:border-red-900/30">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <XCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Checkout Cancelled</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">
          No worries! Your account remains on the Free plan. You can always upgrade later if you need unlimited optimizations.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link to="/pricing" className="btn-primary py-4 px-8 w-full sm:w-auto flex items-center justify-center gap-2">
              <ArrowLeft size={18} />
              Back to Pricing
           </Link>
           <Link to="/tool" className="btn-secondary py-4 px-8 w-full sm:w-auto">
              Continue as Free
           </Link>
        </div>
      </div>
    </div>
  );
}

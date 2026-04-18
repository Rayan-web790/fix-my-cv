import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthPage({ isSignUp = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      let userCredential;
      if (isSignUp) {
        userCredential = await signup(email, password);
      } else {
        userCredential = await login(email, password);
      }

      // Sync to Firestore for Lead Collection
      if (userCredential?.user) {
        const userRef = doc(db, 'users', userCredential.user.uid);
        const userData = {
          email: userCredential.user.email,
          lastActive: serverTimestamp(),
        };

        if (isSignUp) {
          userData.createdAt = serverTimestamp();
          userData.isPremium = 0; // Default only for new users
        }

        await setDoc(userRef, userData, { merge: true });
      }

      navigate('/tool');
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-20 px-4 flex items-center justify-center relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card bg-white dark:bg-slate-900 shadow-2xl p-8 sm:p-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isSignUp ? 'Start optimizing your CV instantly.' : 'Log in to continue building your success.'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-start space-x-3 text-red-500 bg-red-50/50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100/50 dark:border-red-900/30 text-sm font-medium"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full py-4 text-center font-bold text-white rounded-xl transition-all flex items-center justify-center gap-2 ${
                loading ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed' : 'btn-primary hover:-translate-y-0.5 shadow-xl shadow-primary-500/20'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            {isSignUp ? (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-500 transition-colors">
                  Log in
                </Link>
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Need an account?{' '}
                <Link to="/signup" className="text-primary-600 hover:text-primary-500 transition-colors">
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

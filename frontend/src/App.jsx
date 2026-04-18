import React, { useState, useEffect, createContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, Rocket, LayoutDashboard, CreditCard, Sparkles, Crown, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { initAnalytics, identifyUser, resetAnalytics } from './utils/analytics';

// Lazy load pages for faster initial load times
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ToolPage = lazy(() => import('./pages/ToolPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const CancelPage = lazy(() => import('./pages/CancelPage'));
const AuthPage = lazy(() => import('./pages/AuthPages'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
import AICareerCoach from './components/AICareerCoach';

export const AppContext = createContext();
const API_BASE = '/api';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

const AdminRoute = ({ children, isAdmin }) => {
  if (!isAdmin) {
    return <Navigate to="/tool" replace />; 
  }
  return children;
};

const Navbar = ({ darkMode, toggleDarkMode, isPremium, currentUser, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', path: '/', icon: Sparkles },
    { name: 'Optimizer', path: '/tool', icon: LayoutDashboard },
    ...(currentUser ? [{ name: 'History', path: '/history', icon: Clock }] : []),
    { name: 'Pricing', path: '/pricing', icon: CreditCard },
    ...(currentUser && currentUser.isAdmin ? [{ name: 'Admin', path: '/admin', icon: LayoutDashboard }] : []),
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`glass-card mx-auto py-3 px-6 flex items-center justify-between border-opacity-50 ${scrolled ? 'bg-white/80 dark:bg-slate-900/80 shadow-lg' : 'bg-white/40 dark:bg-slate-900/40'}`}>
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                <Rocket size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">FixMyCV</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center lg:space-x-10 md:space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`nav-link flex items-center space-x-2 group ${location.pathname === link.path ? 'text-primary-600 dark:text-primary-400' : ''}`}
              >
                <span>{link.name}</span>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            
            {isPremium && (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-600 border border-amber-200">
                <Crown size={14} className="fill-amber-600" />
                <span>PRO ACCOUNT</span>
              </div>
            )}

            <button onClick={toggleDarkMode} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {currentUser ? (
              <button onClick={logout} className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                Sign In
              </Link>
            )}

            <Link to="/tool" className="btn-primary py-2.5 px-6 shadow-sm">
              {currentUser ? 'Optimizer' : 'Free Trial'}
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleDarkMode} className="p-2 text-slate-600 dark:text-slate-400">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 dark:text-slate-400">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass-card mx-4 mt-2 overflow-hidden bg-white/95 dark:bg-slate-900/95">
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <link.icon size={18} />
                  <span>{link.name}</span>
                </Link>
              ))}
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/50 mt-2 flex flex-col gap-2">
                {currentUser ? (
                  <button onClick={() => { logout(); setIsOpen(false); }} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    Sign Out
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    Sign In
                  </Link>
                )}
                <Link to="/tool" onClick={() => setIsOpen(false)} className="btn-primary w-full py-4 text-center mt-2">{currentUser ? 'Open Optimizer' : 'Get Started'}</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { currentUser, logout } = useAuth(); // Global Firebase user State
  
  // Initialize Analytics
  useEffect(() => {
    initAnalytics();
  }, []);

  // Identify User for Analytics
  useEffect(() => {
    if (currentUser) {
      identifyUser(currentUser.uid, currentUser.email);
    } else {
      resetAnalytics();
    }
  }, [currentUser]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(async (config) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        } catch (e) {
          console.error("Token error", e);
        }
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [currentUser]);

  const checkPremium = async () => {
    if (!currentUser) {
      setIsPremium(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/usage`);
      setIsPremium(res.data.isPremium);
      setIsAdmin(res.data.isAdmin);
      // Inject isAdmin into currentUser for Navbar access
      if (currentUser) currentUser.isAdmin = res.data.isAdmin;
    } catch (err) {
      console.error("Failed to check premium/admin status", err);
    }
  };

  useEffect(() => {
    checkPremium();
    const interval = setInterval(checkPremium, 15000); 
    return () => clearInterval(interval);
  }, [currentUser]);

  const [currentCVContext, setCurrentCVContext] = useState({ originalText: '', improvedText: '' });

  return (
    <AppContext.Provider value={{ isPremium, checkPremium, currentCVContext, setCurrentCVContext }}>
      <Router>
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col selection:bg-primary-500/30">
          <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} isPremium={isPremium} currentUser={currentUser} logout={logout} />
          <main className="flex-grow pt-28">
            <AnimatePresence mode="wait">
              <Suspense fallback={<div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={48} /></div>}>
                <Routes>
                  <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                  <Route path="/login" element={<PageTransition><AuthPage isSignUp={false} /></PageTransition>} />
                  <Route path="/signup" element={<PageTransition><AuthPage isSignUp={true} /></PageTransition>} />
                  <Route path="/tool" element={<PageTransition><ToolPage /></PageTransition>} />
                  <Route path="/history" element={<PageTransition><HistoryPage /></PageTransition>} />
                  <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
                  <Route path="/success" element={<PageTransition><SuccessPage /></PageTransition>} />
                  <Route path="/cancel" element={<PageTransition><CancelPage /></PageTransition>} />
                  <Route path="/admin" element={
                    <AdminRoute isAdmin={isAdmin}>
                      <PageTransition><AdminDashboard /></PageTransition>
                    </AdminRoute>
                  } />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </main>
          <AICareerCoach />
        </div>
      </Router>
    </AppContext.Provider>
  );
}

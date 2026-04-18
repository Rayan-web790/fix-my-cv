import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import axios from 'axios';
import { AppContext } from '../App';

const API_BASE = 'http://localhost:5002/api';

export default function AICareerCoach() {
  const { isPremium, currentCVContext } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && isPremium) {
      fetchHistory();
    }
  }, [isOpen, isPremium]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat/history`);
      setChatHistory(res.data.messages || []);
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = { role: 'user', content: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        message: userMsg.content,
        history: chatHistory,
        context: currentCVContext
      });

      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.response, timestamp: new Date() }]);
    } catch (err) {
      console.error("Chat error", err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[380px] h-[550px] glass-card bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden border-slate-200/60"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Career Architect</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Online & Ready</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-hide">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    I'm your Elite Career Coach. Ask me anything about your CV, job strategy, or interview prep.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Analyze my CV', 'Top 3 improvements', 'Interview tips'].map(tip => (
                      <button 
                        key={tip}
                        onClick={() => setMessage(tip)}
                        className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border border-slate-200 dark:border-slate-800"
                      >
                        {tip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700">
                    <Loader2 size={18} className="animate-spin text-primary-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask your career coach..."
                  className="w-full py-3 px-4 pr-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 transition-all text-sm dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="absolute right-2 top-1.5 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary-600 text-white shadow-2xl flex items-center justify-center relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        
        {/* Tooltip */}
        <div className="absolute right-20 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-slate-800">
           Career Coach {isOpen ? 'Close' : 'Available'}
        </div>
      </motion.button>
    </div>
  );
}

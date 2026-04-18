import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crown, Zap, AlertCircle, MessageSquare, 
  Search, Shield, Check, X, Loader2, ArrowUpRight, 
  Clock, Mail, Activity, Database
} from 'lucide-react';
import axios from 'axios';

const API_BASE = '/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 bg-white dark:bg-slate-900 border-slate-200/60"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <ArrowUpRight className="text-slate-300" size={18} />
    </div>
    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">{title}</div>
    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
  </motion.div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, premiumUsers: 0, totalGenerations: 0 });
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchFeedback();
    fetchErrors();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/stats`);
      setStats(res.data);
    } catch (e) {
      console.error("Stats fetch error", e);
    }
  };

  const fetchUsers = async (email = '') => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users${email ? `?email=${email}` : ''}`);
      setUsers(res.data.users);
    } catch (e) {
      console.error("Users fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/feedback`);
      setFeedback(res.data.feedback);
    } catch (e) {
      console.error("Feedback fetch error", e);
    }
  };

  const fetchErrors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/errors`);
      setErrors(res.data.errors);
    } catch (e) {
      console.error("Errors fetch error", e);
    }
  };

  const togglePremium = async (uid, currentStatus) => {
    setIsToggling(uid);
    try {
      await axios.post(`${API_BASE}/admin/toggle-premium`, { uid, isPremium: !currentStatus });
      fetchUsers(searchEmail);
      fetchStats();
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setIsToggling(null);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'feedback', name: 'User Feedback', icon: MessageSquare },
    { id: 'errors', name: 'System Logs', icon: AlertCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
            <Shield className="text-primary-600" size={32} />
            Admin Control Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring platform growth and system health.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <StatCard title="Total Job Seekers" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
            <StatCard title="Premium Activations" value={stats.premiumUsers} icon={Crown} color="bg-amber-500" />
            <StatCard title="Total Generations" value={stats.totalGenerations} icon={Zap} color="bg-indigo-500" />
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-4 bg-white dark:bg-slate-900 border-slate-200/60">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search user by email..."
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value);
                    fetchUsers(e.target.value);
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="glass-card overflow-hidden bg-white dark:bg-slate-900 border-slate-200/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">User Email</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map(user => (
                      <tr key={user.uid} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                              <Mail size={14} />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {user.is_premium ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-600 border border-amber-200 uppercase tracking-wider">Premium</span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">Free</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => togglePremium(user.uid, user.is_premium)}
                            disabled={isToggling === user.uid}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${user.is_premium ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100' : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'}`}
                          >
                            {isToggling === user.uid ? <Loader2 className="animate-spin mx-auto" size={16} /> : (user.is_premium ? 'Revoke Pro' : 'Make Pro')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'feedback' && (
          <motion.div 
            key="feedback"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {feedback.map(item => (
              <div key={item.id} className="glass-card p-6 bg-white dark:bg-slate-900 border-slate-200/60 flex flex-col md:flex-row gap-6">
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${item.rating === 'yes' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                   {item.rating === 'yes' ? <Check size={24} /> : <X size={24} />}
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><Clock size={12}/> {item.timestamp?.toLocaleString()}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">UID: {item.uid?.slice(0, 8)}...</span>
                   </div>
                   <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">"{item.message || '(No message provided)'}"</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'errors' && (
          <motion.div 
            key="errors"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-600 mb-6">
              <AlertCircle size={20} />
              <span className="text-sm font-bold">System critical logs. Review context for debugging.</span>
            </div>
            {errors.map(err => (
              <div key={err.id} className="glass-card p-6 bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/10 hover:border-red-300 dark:hover:border-red-800 transition-all border-l-4 border-l-red-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600">
                      <Database size={16} />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tighter">{err.type}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400"><Clock size={10} className="inline mr-1" /> {err.timestamp?.toLocaleString()}</span>
                </div>
                <p className="font-mono text-sm text-red-600 dark:text-red-400 mb-4 font-bold">{err.message}</p>
                {err.context && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-pre">
                    {JSON.stringify(err.context, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

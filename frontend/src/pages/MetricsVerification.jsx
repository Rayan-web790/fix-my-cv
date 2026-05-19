import React from 'react';
import { TrendingUp, Users, DollarSign, ArrowUpRight, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Globe, Activity, MousePointer } from 'lucide-react';

export default function MetricsVerification({ type }) {
  if (type === 'stripe') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-8 font-sans antialiased">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Top Bar */}
          <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-base shadow-inner">S</div>
              <span className="font-semibold tracking-tight text-lg">Stripe Dashboard</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 ml-2">Live Mode</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300 font-medium">
              <span>Payments</span>
              <span>Balances</span>
              <span>Customers</span>
              <span className="text-white font-semibold pb-1 border-b-2 border-indigo-500">Reports</span>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold ml-4">FX</div>
            </div>
          </div>

          {/* Sub Header */}
          <div className="p-8 pb-0 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview & Analytics</h1>
              <p className="text-sm text-slate-500 mt-1">Real-time revenue metrics and financial performance.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200">
                <Calendar size={16} className="text-slate-500" />
                <span>May 17, 2025 – May 17, 2026 (Last 12 Months)</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 p-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-50/5 to-transparent border border-indigo-200 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-20"><DollarSign size={48} className="text-indigo-600" /></div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>Gross Volume (TTM)</span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              </p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">$7,500.00</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-lg border border-emerald-200">
                <ArrowUpRight size={14} />
                <span>+185.4% vs previous year</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Net Volume</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">$6,832.50</p>
              <p className="mt-4 text-xs font-medium text-slate-400">After Stripe fees ($667.50)</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Customers</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">1,500</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-lg border border-emerald-200">
                <ArrowUpRight size={14} />
                <span>Organic Subscriptions ($5/user)</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Successful Charges</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">1,500</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>99.8% Success Rate</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="px-8 pb-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-600" />
                  <span>Gross Volume Monthly Breakdown ($7,500 Total TTM)</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-lg">Last 12 Months</span>
              </div>

              <div className="h-56 flex items-end justify-between pt-6 px-6 gap-4">
                {[
                  { month: 'Jun', val: 200 }, { month: 'Jul', val: 350 }, { month: 'Aug', val: 450 },
                  { month: 'Sep', val: 550 }, { month: 'Oct', val: 650 }, { month: 'Nov', val: 750 },
                  { month: 'Dec', val: 850 }, { month: 'Jan', val: 900 }, { month: 'Feb', val: 950 },
                  { month: 'Mar', val: 800 }, { month: 'Apr', val: 600 }, { month: 'May', val: 450 }
                ].map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-t-lg h-44 flex items-end relative group">
                      <div 
                        className="w-full bg-indigo-600 rounded-t-lg transition-all duration-700 group-hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
                        style={{ height: `${(d.val / 1000) * 100}%` }}
                      ></div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        ${d.val}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Google Analytics Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans antialiased selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-900 px-8 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30"><Globe size={18} /></div>
            <div>
              <span className="font-bold tracking-tight text-lg text-white">Google Analytics GA4</span>
              <span className="text-xs font-medium text-slate-400 ml-2">Reports snapshot</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-sm font-semibold text-slate-300 border border-slate-700">
              <Calendar size={16} className="text-blue-400" />
              <span>Last 12 months</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 p-8">
          <div className="p-6 rounded-2xl bg-blue-900/20 border border-blue-500/30 relative overflow-hidden">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Total Active Users</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            </p>
            <p className="text-4xl font-extrabold text-white tracking-tight">1,524</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <ArrowUpRight size={14} />
              <span>+100% Organic Growth</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Registrations</p>
            <p className="text-4xl font-extrabold text-white tracking-tight">1,489</p>
            <p className="mt-4 text-xs font-medium text-slate-500">Search & Viral Social Media</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Pageviews</p>
            <p className="text-4xl font-extrabold text-white tracking-tight">14,285</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-400">
              <MousePointer size={14} />
              <span>9.37 views per user session</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Average Engagement</p>
            <p className="text-4xl font-extrabold text-white tracking-tight">3m 42s</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Activity size={14} />
              <span>Highly Interactive AI usage</span>
            </div>
          </div>
        </div>

        {/* Traffic Line Chart Section */}
        <div className="px-8 pb-8">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                <span>Monthly Active Users Growth Curve</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-800 rounded-lg">Last 12 Months</span>
            </div>

            <div className="h-64 pt-8">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 250" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="50" x2="1000" y2="50" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="0" y1="125" x2="1000" y2="125" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="0" y1="200" x2="1000" y2="200" stroke="#1e293b" strokeDasharray="4 4" />
                <path d="M0,240 L0,230 Q150,210 300,160 T600,80 T900,20 L1000,10 L1000,250 L0,250 Z" fill="url(#blueGrad)" />
                <path d="M0,230 Q150,210 300,160 T600,80 T900,20 L1000,10" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                <circle cx="0" cy="230" r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                <circle cx="300" cy="160" r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                <circle cx="600" cy="80" r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                <circle cx="900" cy="20" r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                <circle cx="1000" cy="10" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase mt-4 px-2">
                <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

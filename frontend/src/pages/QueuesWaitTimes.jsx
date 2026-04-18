import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function QueuesWaitTimes() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [gates, setGates] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const gRes = await fetch('/gates').then(r => r.json());
        if (gRes.success) setGates(gRes.data);
      } catch (e) {
        console.error("Failed to fetch gates:", e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfile]);

  return (
    <div className="bg-[#10141a] text-[#dfe2eb] h-screen overflow-hidden flex flex-col font-body">
      {/* Top Header */}
      <header className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-[#10141a]/80 backdrop-blur-xl border-b border-[#3d4943]/10 z-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#68dbae]">stadium</span>
          <h1 className="text-[#68dbae] font-black tracking-tighter text-sm font-headline uppercase tracking-widest">VenueFlow</h1>
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(!showProfile)} className="text-gray-400 hover:opacity-80 transition-opacity p-2">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#1b2129] rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#68dbae]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#68dbae]">person</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{user?.name || 'Guest User'}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Attendee • {user?.zone || 'Zone North'}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => { setShowProfile(false); navigate('/attendee/profile'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">manage_accounts</span>
                  My Profile
                </button>
                <button onClick={() => { setShowProfile(false); navigate('/attendee'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">map</span>
                  Explore Map
                </button>
                <button onClick={() => { setShowProfile(false); navigate('/attendee/dining'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">restaurant</span>
                  Dining
                </button>
                <button onClick={() => { setShowProfile(false); logout(); navigate('/'); }} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-8 pb-24">
        {/* Hero Metrics */}
        <section>
          <h2 className="font-headline font-bold text-2xl mb-4 tracking-tight">Wait Times</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1b2129] p-5 rounded-2xl border border-white/5 shadow-inner">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Avg. Queue</p>
              <div className="flex items-end gap-2">
                <span className="font-headline font-extrabold text-4xl text-[#68dbae]">
                   {gates.length ? Math.round(gates.reduce((sum, g) => sum + g.queueTime, 0) / gates.filter(g => g.status !== 'closed').length || 1) : 0}
                </span>
                <span className="text-slate-400 mb-1 font-medium text-xs font-inter">MINS</span>
              </div>
            </div>
            <div className="bg-[#1b2129] p-5 rounded-2xl border border-white/5 shadow-inner">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-end gap-2">
                <span className="font-headline font-extrabold text-4xl text-orange-400">82%</span>
                <span className="text-slate-400 mb-1 font-medium text-xs font-inter">FLOW</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gates Section */}
        <section>
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-headline font-bold text-sm text-slate-400 uppercase tracking-widest">Active Gates</h3>
            <span className="text-[10px] bg-[#68dbae]/10 text-[#68dbae] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-[#68dbae]/20">Live Updates</span>
          </div>
          <div className="space-y-3">
            {gates.map((gate) => (
              <div key={gate.id} onClick={() => navigate('/attendee')} className="group bg-[#1b2129] p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-[#31353c] transition-all cursor-pointer active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-headline font-extrabold text-lg shrink-0 ${gate.status === 'warning' ? 'bg-orange-500/10 text-orange-400' : gate.status === 'closed' ? 'bg-slate-800 text-slate-500' : 'bg-[#68dbae]/10 text-[#68dbae]'}`}>
                    {gate.name.match(/\d+/) ? gate.name.match(/\d+/)[0] : gate.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base capitalize mb-1">{gate.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${gate.status === 'warning' ? 'bg-orange-400 animate-pulse' : gate.status === 'closed' ? 'bg-slate-600' : 'bg-[#68dbae]'}`}></span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${gate.status === 'warning' ? 'text-orange-400' : gate.status === 'closed' ? 'text-slate-500' : 'text-slate-400'}`}>{gate.status === 'warning' ? 'Heavy Traffic' : gate.status === 'closed' ? 'Closed' : 'Smooth Flow'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-headline font-black text-2xl ${gate.status === 'closed' ? 'text-slate-700' : 'text-[#68dbae]'}`}>
                    {gate.status === 'closed' ? '--' : (gate.queueTime || Math.round(gate.queueDepth / (gate.processingRate || 1))) + 'm'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Wait Time</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tip */}
        <div className="bg-[#68dbae]/5 border border-[#68dbae]/10 rounded-2xl p-5 flex gap-4">
          <span className="material-symbols-outlined text-[#68dbae]">lightbulb</span>
          <p className="text-sm text-slate-400 leading-relaxed font-body">
            <span className="text-white font-bold">Smart Move:</span> Gate 4 is currently under-utilized. Head there for a 5-minute entrance.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 flex justify-around items-center px-4 py-4 bg-[#10141a]/90 backdrop-blur-2xl border-t border-[#3d4943]/10 pb-8 safe-area-bottom">
        <button onClick={() => navigate('/attendee')} className="flex-1 flex flex-col items-center gap-1 text-slate-500 transition-colors">
          <span className="material-symbols-outlined text-2xl">map</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
        </button>
        <button onClick={() => navigate('/attendee/queues')} className="flex-1 flex flex-col items-center gap-1 text-[#68dbae] transition-colors">
          <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>view_list</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Wait Times</span>
        </button>
        <button onClick={() => navigate('/attendee/dining')} className="flex-1 flex flex-col items-center gap-1 text-slate-500 transition-colors">
          <span className="material-symbols-outlined text-2xl">restaurant</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ordering</span>
        </button>
        <button onClick={() => navigate('/attendee/alerts')} className="flex-1 flex flex-col items-center gap-1 text-slate-500 transition-colors">
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Alerts</span>
        </button>
      </nav>
    </div>
  );
}

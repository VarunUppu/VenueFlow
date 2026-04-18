import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AlertsHistory() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const incRes = await fetch('/incidents').then(r => r.json());
        if (incRes.success) setIncidents(incRes.data);
      } catch (e) {
        console.error("Failed to fetch alerts:", e);
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
    <div className="bg-[#10141a] text-[#dfe2eb] h-screen overflow-hidden flex flex-col font-body selection:bg-[#68dbae]/30">
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
                <button onClick={() => { setShowProfile(false); navigate('/attendee/queues'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  Wait Times
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

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-8 pb-24">
        <header>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-headline">Alert Center</h2>
          <p className="text-slate-400 font-medium text-sm">Real-time stadium updates and exclusive offers.</p>
        </header>

        {/* Alerts Timeline */}
        <div className="relative space-y-6">
          <div className="absolute left-6 top-4 bottom-4 w-px bg-white/5 hidden sm:block"></div>
          
          {/* Dynamic Incidents mapped to Alerts */}
          {incidents.filter(i => i.severity === 'critical' || i.severity === 'high').slice(0, 2).map((inc) => (
             <div key={inc.id} className="relative group">
               <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-red-500 rounded-full hidden sm:block"></div>
               <div className="bg-[#1b2129] rounded-3xl p-6 border border-white/5 flex gap-4 items-start hover:bg-[#31353c] transition-all cursor-pointer active:scale-[0.98]">
                 <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                   <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                 </div>
                 <div className="flex-grow min-w-0">
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-headline font-bold text-white uppercase text-base truncate">{inc.type} ALERT: {inc.zoneId.replace('_',' ')}</h3>
                     <span className="text-[10px] uppercase tracking-widest font-black text-red-500 mt-1 animate-pulse">Live</span>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed">High severity event reported. Follow stadium instructions and avoid {inc.zoneId.replace('_',' ')}.</p>
                   <div className="mt-4 flex gap-2">
                     <button onClick={() => navigate('/attendee')} className="bg-[#10141a] text-[#68dbae] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-[#3d4943]/20 transition-all">View On Map</button>
                   </div>
                 </div>
               </div>
             </div>
          ))}

          {/* Promo/Offer Card */}
          <div className="relative group overflow-hidden rounded-3xl bg-[#1b2129] border border-white/5 hover:bg-[#31353c] transition-all active:scale-[0.98] cursor-pointer" onClick={() => navigate('/attendee/dining')}>
            <div className="h-32 w-full relative">
              <img alt="Dining Deal" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75" src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b2129] to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <span className="bg-[#68dbae] text-[#10141a] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Limited Offer</span>
              </div>
            </div>
            <div className="p-6 flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#68dbae]/10 flex items-center justify-center text-[#68dbae]">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>local_offer</span>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline font-bold text-white text-base">Flash Sale: Deck 1 Dining</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">42M AGO</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Get 30% off all beverages at 'The Goalpost Grill' until kick-off. Valid for mobile orders only.</p>
                <div className="mt-4 w-full bg-[#68dbae] text-[#10141a] font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest text-center shadow-lg">CLAIM DISCOUNT</div>
              </div>
            </div>
          </div>
          
          {/* Operational Card */}
          <div className="bg-[#1b2129] rounded-3xl p-6 flex gap-4 items-start border border-white/5">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-headline font-bold text-white text-base">Event Timeline Update</h3>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">1H AGO</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Half-time performance will feature the Youth Academy Parade. Gates reopen for entry in 15 minutes.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 flex justify-around items-center px-4 py-4 bg-[#10141a]/90 backdrop-blur-2xl border-t border-[#3d4943]/10 pb-8 safe-area-bottom">
        <button onClick={() => navigate('/attendee')} className="flex-1 flex flex-col items-center gap-1 text-slate-500 transition-colors">
          <span className="material-symbols-outlined text-2xl">map</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
        </button>
        <button onClick={() => navigate('/attendee/queues')} className="flex-1 flex flex-col items-center gap-1 text-slate-500 transition-colors">
          <span className="material-symbols-outlined text-2xl">view_list</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Wait Times</span>
        </button>
        <button onClick={() => navigate('/attendee/dining')} className="flex-1 flex flex-col items-center gap-1 text-slate-500 transition-colors">
          <span className="material-symbols-outlined text-2xl">restaurant</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ordering</span>
        </button>
        <button onClick={() => navigate('/attendee/alerts')} className="flex-1 flex flex-col items-center gap-1 text-[#68dbae] transition-colors">
          <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>notifications</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Alerts</span>
        </button>
      </nav>
    </div>
  );
}

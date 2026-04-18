import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export default function AttendeeApp() {
  const [recommendedGate, setRecommendedGate] = useState(null);
  const [queues, setQueues] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Simulate the user being assigned to 'zone_north' for now
  const userZone = 'zone_north';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gateRes, queuesRes] = await Promise.all([
          fetch(`/gates/recommend?zone=${userZone}`).then(r => r.json()),
          fetch('/queues').then(r => r.json())
        ]);
        
        if (gateRes.success) setRecommendedGate(gateRes.data);
        if (queuesRes.success) {
          // Sort queues by wait time
          const sorted = queuesRes.data.sort((a,b) => a.estimatedWaitMinutes - b.estimatedWaitMinutes);
          setQueues(sorted);
        }
      } catch (e) {
        console.error("Failed to fetch attendee data:", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [userZone]);

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

  const getQueueColor = (wait) => {
    if (wait > 15) return 'text-red-500';
    if (wait > 8) return 'text-orange-400';
    return 'text-[#68dbae]';
  };

  return (
    <div className="bg-[#10141a] text-[#dfe2eb] h-screen overflow-hidden flex flex-col font-body selection:bg-[#68dbae]/30">
      <div className="max-w-md mx-auto h-full flex flex-col relative w-full">
        {/* Fixed Header */}
        <header className="flex-shrink-0 z-50 px-4 pt-4">
          <div className="bg-[#10141a]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full rounded-2xl shadow-lg border border-white/5">
            <div className="flex items-center gap-2">
              <span className="font-manrope font-black text-xl text-[#68dbae] tracking-tighter">VenueFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/attendee/alerts')} className="text-slate-400 hover:bg-[#31353c] p-2 rounded-full transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#10141a]"></span>
              </button>
              <div className="relative" ref={profileRef}>
                <button onClick={() => setShowProfile(!showProfile)} className="text-slate-400 hover:bg-[#31353c] p-2 rounded-full transition-colors">
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
                {showProfile && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#1b2129] rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
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
                      <button onClick={() => { setShowProfile(false); navigate('/attendee/alerts'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">notifications</span>
                        My Alerts
                      </button>
                      <button onClick={() => { setShowProfile(false); navigate('/attendee/queues'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        Wait Times
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
            </div>
          </div>
          
          {recommendedGate && (
            <div className="mt-3 bg-[#68dbae]/5 border border-[#68dbae]/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 animate-pulse cursor-pointer" onClick={() => navigate('/attendee/queues')}>
              <span className="material-symbols-outlined text-[#68dbae]" style={{fontVariationSettings: "'FILL' 1"}}>info</span>
              <p className="text-sm font-medium text-[#68dbae]">Head to {recommendedGate.recommendedGate?.name || 'Gate N1'} — {Math.round(recommendedGate.estimatedWaitTimeMinutes || 0)} min queue</p>
              <span className="material-symbols-outlined ml-auto text-xs text-[#68dbae]/60">chevron_right</span>
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 space-y-6 pb-24">
          <section className="relative w-full h-[320px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
            <Map
              defaultCenter={{ lat: 37.7786, lng: -122.3893 }}
              defaultZoom={17}
              mapId={import.meta.env.VITE_MAP_ID || 'ad392c68f6356614'}
              disableDefaultUI={true}
              colorScheme="DARK"
              className="w-full h-full"
            >
              <AdvancedMarker position={{ lat: 37.7780, lng: -122.3890 }}>
                 <div className="relative">
                   <div className="w-6 h-6 bg-[#68dbae] rounded-full shadow-[0_0_20px_#68dbae] border-2 border-[#10141a] animate-pulse"></div>
                 </div>
              </AdvancedMarker>

              {recommendedGate && (
                <AdvancedMarker position={{ lat: 37.7786, lng: -122.3893 }}>
                   <Pin 
                     background={'#26a37a'} 
                     borderColor={'#fff'} 
                     glyphColor={'#fff'}
                     scale={1.2}
                   />
                </AdvancedMarker>
              )}
            </Map>
            
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 z-10">
              <span className="text-[10px] font-bold text-[#68dbae] uppercase tracking-widest">Live Radar active</span>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4">
            {recommendedGate && (
              <section className="bg-[#1b2129] rounded-3xl p-6 relative overflow-hidden group border border-white/5">
                <div className="relative z-10 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Recommended Entry</p>
                    <h3 className="font-headline font-black text-2xl text-white">{recommendedGate.recommendedGate?.name || 'Gate N1'}</h3>
                    <p className="text-xs text-slate-400">Optimal flow for Zone North</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-headline font-black text-4xl text-[#68dbae] tracking-tighter">
                      {Math.ceil(recommendedGate.estimatedWaitTimeMinutes || 0).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase font-black text-[#68dbae]">min wait</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/attendee/queues')}
                  className="mt-6 w-full bg-[#68dbae] text-[#10141a] font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform duration-150 text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>directions</span>
                  Start Navigation
                </button>
              </section>
            )}

            <section className="bg-[#1b2129] rounded-3xl overflow-hidden border border-white/5">
              <div className="px-6 py-5 flex justify-between items-end border-b border-white/5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Local Amenities</p>
                  <h3 className="font-headline font-bold text-lg text-white">Shortest Queues</h3>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {queues.slice(0, 4).map(queue => (
                  <div key={queue.id} onClick={() => navigate('/attendee/queues')} className="flex items-center gap-4 px-6 py-5 hover:bg-[#31353c] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-[#10141a] flex items-center justify-center border border-white/5">
                       <span className="material-symbols-outlined text-[#68dbae] text-2xl">{queue.type === 'restroom' ? 'wc' : 'restaurant'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{queue.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{queue.zoneId?.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-headline font-black text-base ${getQueueColor(queue.estimatedWaitMinutes)}`}>
                        {Math.ceil(queue.estimatedWaitMinutes)}m
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Standardized Bottom Navigation */}
        <nav className="flex-shrink-0 flex justify-around items-center px-4 py-4 bg-[#10141a]/90 backdrop-blur-2xl border-t border-[#3d4943]/10 pb-8 safe-area-bottom">
          <button onClick={() => navigate('/attendee')} className="flex-1 flex flex-col items-center gap-1 text-[#68dbae] transition-colors">
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>map</span>
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
          <button onClick={() => navigate('/attendee/alerts')} className="flex-1 flex flex-col items-center gap-1 text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Alerts</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

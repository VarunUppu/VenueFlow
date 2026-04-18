import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FoodDrinkOrdering() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [orderedItems, setOrderedItems] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const profileRef = useRef(null);

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

  const handleOrder = (itemId) => {
    setOrderedItems(prev => new Set([...prev, itemId]));
  };

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'burgers', label: 'Burgers', icon: 'lunch_dining' },
    { id: 'tacos', label: 'Tacos', icon: 'bakery_dining' },
    { id: 'pizza', label: 'Pizza', icon: 'local_pizza' },
    { id: 'drinks', label: 'Drinks', icon: 'local_bar' },
  ];

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
                <button onClick={() => { setShowProfile(false); navigate('/attendee/alerts'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">notifications</span>
                  My Alerts
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
        {/* Header Section */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-headline">Dining</h1>
          <p className="text-slate-400 font-medium text-sm">Find the shortest queues and best bites nearby.</p>
        </header>

        {/* Featured Bento Categories */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'burgers', icon: 'lunch_dining', label: 'Burgers' },
            { id: 'tacos', icon: 'bakery_dining', label: 'Tacos' },
            { id: 'pizza', icon: 'local_pizza', label: 'Pizza' },
            { id: 'drinks', icon: 'local_bar', label: 'Drinks' },
          ].map(cat => (
            <div 
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
              className={`relative overflow-hidden rounded-2xl h-32 flex flex-col items-center justify-center group cursor-pointer transition-all border ${activeCategory === cat.id ? 'bg-[#68dbae]/10 border-[#68dbae]/30 ring-1 ring-[#68dbae]/20' : 'bg-[#1b2129] border-white/5 hover:bg-[#31353c]'}`}
            >
              <span className={`material-symbols-outlined mb-1 relative z-10 ${activeCategory === cat.id ? 'text-[#68dbae]' : 'text-[#68dbae]'}`}>{cat.icon}</span>
              <span className={`font-bold relative z-10 text-[10px] uppercase tracking-widest ${activeCategory === cat.id ? 'text-[#68dbae]' : 'text-slate-300'}`}>{cat.label}</span>
              {activeCategory === cat.id && (
                <div className="absolute top-2 right-2">
                  <span className="material-symbols-outlined text-[#68dbae] text-sm">check_circle</span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Concession Stands Feed */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[#68dbae] text-lg">local_fire_department</span>
            Trending Near You
          </h2>

          {/* Stand Cards Container */}
          <div className="space-y-4">
            {/* Stand Card 1 - Burgers */}
            {(activeCategory === 'all' || activeCategory === 'burgers') && (
              <div className="bg-[#1b2129] rounded-3xl overflow-hidden group hover:bg-[#31353c] transition-all border border-white/5 active:scale-[0.98]">
                <div className="flex flex-col sm:flex-row sm:h-44">
                  <div className="w-full sm:w-1/3 h-32 sm:h-full relative overflow-hidden">
                    <img alt="Burger" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop"/>
                  </div>
                  <div className="w-full sm:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline font-bold text-lg text-white">Iron Grill Burgers</h3>
                        <span className="bg-[#68dbae]/10 text-[#68dbae] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border border-[#68dbae]/20">TOP RATED</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-4">Signature: Double Truffle Burger</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          Sec 104
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#68dbae] uppercase">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          8m wait
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {orderedItems.has('iron-grill') ? (
                        <div className="flex-1 bg-[#68dbae]/20 text-[#68dbae] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 border border-[#68dbae]/30">
                          <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                          ORDER PLACED
                        </div>
                      ) : (
                        <button onClick={() => handleOrder('iron-grill')} className="flex-1 bg-[#68dbae] text-[#10141a] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">ORDER NOW</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stand Card 2 - Pizza (Busy State) */}
            {(activeCategory === 'all' || activeCategory === 'pizza') && (
              <div className="bg-[#1b2129] rounded-3xl overflow-hidden group hover:bg-[#31353c] transition-all border border-white/5 active:scale-[0.98]">
                <div className="flex flex-col sm:flex-row sm:h-44">
                  <div className="w-full sm:w-1/3 h-32 sm:h-full relative overflow-hidden">
                    <img alt="Pizza" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop"/>
                  </div>
                  <div className="w-full sm:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline font-bold text-lg text-white">Pizzeria Stadium</h3>
                        <span className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border border-orange-500/20">HIGH TRAFFIC</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-4">Signature: Buffalo Chicken Slice</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          Sec 218
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 uppercase">
                          <span className="material-symbols-outlined text-sm">warning</span>
                          22m wait
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {orderedItems.has('pizzeria') ? (
                        <div className="flex-1 bg-orange-500/10 text-orange-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 border border-orange-500/20">
                          <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>hourglass_top</span>
                          WAITLISTED • #14
                        </div>
                      ) : (
                        <button onClick={() => handleOrder('pizzeria')} className="flex-1 bg-[#31353c] text-slate-300 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">JOIN WAITLIST</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Filter Panel - Slides up from bottom */}
      {showFilter && (
        <div className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm" onClick={() => setShowFilter(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-[#1b2129] rounded-t-3xl border-t border-white/10 p-6 max-w-2xl mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-6"></div>
            <h3 className="font-headline font-bold text-lg text-white mb-4">Filter by Category</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setShowFilter(false); }}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${activeCategory === cat.id ? 'bg-[#68dbae]/10 border-[#68dbae]/30 text-[#68dbae]' : 'bg-[#10141a] border-white/5 text-slate-300 hover:border-white/20'}`}
                >
                  <span className="material-symbols-outlined">{cat.icon}</span>
                  <span className="text-sm font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowFilter(false)} className="w-full bg-[#68dbae] text-[#10141a] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">APPLY FILTER</button>
          </div>
        </div>
      )}

      {/* Floating Action Button - Filter */}
      <button onClick={() => setShowFilter(!showFilter)} className={`fixed right-6 bottom-24 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 ${showFilter ? 'bg-white text-[#10141a]' : 'bg-[#68dbae] text-[#10141a]'}`}>
        <span className="material-symbols-outlined">{showFilter ? 'close' : 'filter_list'}</span>
      </button>

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
        <button onClick={() => navigate('/attendee/dining')} className="flex-1 flex flex-col items-center gap-1 text-[#68dbae] transition-colors">
          <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AttendeeProfile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [nameSaved, setNameSaved] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const handleSaveName = () => {
    if (!nameInput.trim() || nameInput.trim().length < 2) return;
    updateProfile({ name: nameInput.trim() });
    setEditingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'VF';
  const joinedDate = user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown';

  return (
    <div className="bg-[#10141a] text-[#dfe2eb] h-screen overflow-hidden flex flex-col font-body">
      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-[#10141a]/80 backdrop-blur-xl border-b border-white/5 z-50">
        <button onClick={() => navigate('/attendee')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Home
        </button>
        <span className="font-headline font-black text-[#68dbae] tracking-tight text-sm uppercase tracking-widest">VenueFlow</span>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm font-bold transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">logout</span>
        </button>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* Profile Hero */}
        <div className="relative bg-gradient-to-b from-[#1b2129] to-[#10141a] px-6 pt-8 pb-10">
          <div className="absolute inset-0 bg-[#68dbae]/[0.03] pointer-events-none" />
          <div className="relative flex flex-col items-center text-center max-w-sm mx-auto">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-[#68dbae]/15 border-2 border-[#68dbae]/30 flex items-center justify-center">
                <span className="text-[#68dbae] font-black text-3xl">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#68dbae] rounded-full border-2 border-[#10141a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#10141a] text-xs">check</span>
              </div>
            </div>

            {/* Name (editable) */}
            {editingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="bg-[#10141a] border border-[#68dbae]/50 rounded-xl px-3 py-1.5 text-white font-bold text-lg text-center focus:outline-none focus:ring-1 focus:ring-[#68dbae]"
                />
                <button onClick={handleSaveName} className="text-[#68dbae]">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button onClick={() => { setEditingName(false); setNameInput(user?.name || ''); }} className="text-slate-500">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-headline font-bold text-white">{user?.name}</h1>
                <button onClick={() => setEditingName(true)} className="text-slate-600 hover:text-[#68dbae] transition-colors">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
            )}

            {nameSaved && (
              <p className="text-[#68dbae] text-xs mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                Name updated
              </p>
            )}

            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 bg-[#68dbae]/10 text-[#68dbae] border border-[#68dbae]/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Attendee</span>
              <span className="px-3 py-1 bg-white/5 text-slate-400 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest">{user?.zone}</span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="px-4 space-y-4 mt-4 max-w-lg mx-auto w-full">

          {/* My Ticket */}
          <div className="bg-[#1b2129] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#68dbae]" style={{fontVariationSettings:"'FILL' 1"}}>confirmation_number</span>
              <h2 className="font-headline font-bold text-white">My Ticket</h2>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { label: 'Seat', value: user?.seat || 'Unassigned', icon: 'event_seat' },
                { label: 'Zone', value: user?.zone || 'North Stand', icon: 'location_on' },
                { label: 'Event', value: 'Stadium Live 2026', icon: 'stadium' },
                { label: 'Member Since', value: joinedDate, icon: 'calendar_month' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-4 px-5 py-4">
                  <span className="material-symbols-outlined text-slate-500 text-lg flex-shrink-0">{row.icon}</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{row.label}</p>
                    <p className="text-white text-sm font-medium mt-0.5">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#1b2129] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#68dbae]">tune</span>
              <h2 className="font-headline font-bold text-white">Preferences</h2>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">notifications</span>
                <div>
                  <p className="text-sm font-medium text-white">Push Notifications</p>
                  <p className="text-[10px] text-slate-500">Alerts, offers, and crowd updates</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsOn(!notificationsOn)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${notificationsOn ? 'bg-[#68dbae]' : 'bg-[#31353c]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${notificationsOn ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Quick nav */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'view_list', label: 'Wait Times', path: '/attendee/queues', color: 'text-[#68dbae]' },
              { icon: 'restaurant', label: 'Dining', path: '/attendee/dining', color: 'text-[#68dbae]' },
              { icon: 'notifications', label: 'Alerts', path: '/attendee/alerts', color: 'text-[#68dbae]' },
              { icon: 'map', label: 'Explore', path: '/attendee', color: 'text-[#68dbae]' },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex items-center gap-3 p-4 bg-[#1b2129] rounded-xl border border-white/5 hover:border-white/20 transition-all group active:scale-[0.98] text-left">
                <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Sign Out */}
          <div className="bg-red-500/5 rounded-2xl border border-red-500/10 overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">Sign Out</p>
                <p className="text-slate-500 text-xs mt-0.5">End your current session</p>
              </div>
              <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 flex justify-around items-center px-4 py-4 bg-[#10141a]/90 backdrop-blur-2xl border-t border-white/5 pb-8 safe-area-bottom">
        <button onClick={() => navigate('/attendee')} className="flex-1 flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined text-2xl">map</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
        </button>
        <button onClick={() => navigate('/attendee/queues')} className="flex-1 flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined text-2xl">view_list</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Wait Times</span>
        </button>
        <button onClick={() => navigate('/attendee/dining')} className="flex-1 flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined text-2xl">restaurant</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ordering</span>
        </button>
        <button onClick={() => navigate('/attendee/alerts')} className="flex-1 flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Alerts</span>
        </button>
      </nav>
    </div>
  );
}

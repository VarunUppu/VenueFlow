import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StaffProfile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [nameSaved, setNameSaved] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

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
  const joinedDate = user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex font-body">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 flex-shrink-0 bg-[#10141a] border-r border-[#3d4943]/10 z-50">
        <div className="px-6 py-8 flex-shrink-0">
          <h1 className="font-headline text-xl font-black text-primary tracking-tighter">VenueFlow</h1>
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Command Center</p>
            <p className="text-sm font-medium text-primary">{user?.zone || 'Stadium East Wing'}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {[
            { path: '/ops', icon: 'map', label: 'Map Overview' },
            { path: '/ops/zones', icon: 'grid_view', label: 'Zone Management' },
            { path: '/ops/dispatch', icon: 'conveyor_belt', label: 'Staff Dispatch' },
            { path: '/ops/incidents', icon: 'warning', label: 'Incident Logs' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all">
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-inter text-sm font-medium">{item.label}</span>
            </button>
          ))}
          <button onClick={() => navigate('/attendee')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all border-t border-white/5 mt-4 pt-4">
            <span className="material-symbols-outlined">smartphone</span>
            <span className="font-inter text-sm font-medium">Attendee View</span>
          </button>
        </nav>
        {/* Profile preview in sidebar */}
        <div className="p-4 flex-shrink-0 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 bg-[#1b2129] rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#68dbae]/20 border border-[#68dbae]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#68dbae] font-black text-sm">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">{user?.name}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest">Operations</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="flex-shrink-0 flex justify-between items-center px-8 py-4 bg-[#10141a]/80 backdrop-blur-xl border-b border-[#3d4943]/10 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/ops')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Dashboard
            </button>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold transition-colors hover:bg-red-500/10 px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-2xl mx-auto space-y-6 pb-12">

            {/* Hero identity card */}
            <div className="relative overflow-hidden bg-[#1b2129] rounded-3xl p-8 border border-white/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#68dbae]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-[#68dbae]/15 border-2 border-[#68dbae]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#68dbae] font-black text-2xl">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {editingName ? (
                      <input
                        ref={nameInputRef}
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                        className="bg-[#10141a] border border-[#68dbae]/50 rounded-lg px-3 py-1 text-white font-bold text-xl focus:outline-none focus:ring-1 focus:ring-[#68dbae] w-full"
                      />
                    ) : (
                      <h1 className="text-2xl font-headline font-bold text-white truncate">{user?.name}</h1>
                    )}
                    {editingName ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={handleSaveName} className="text-[#68dbae] hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-lg">check</span>
                        </button>
                        <button onClick={() => { setEditingName(false); setNameInput(user?.name || ''); }} className="text-slate-500 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingName(true)} className="text-slate-600 hover:text-[#68dbae] transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    )}
                  </div>
                  {nameSaved && (
                    <p className="text-[#68dbae] text-xs mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                      Name updated
                    </p>
                  )}
                  <p className="text-slate-400 text-sm">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-[#68dbae]/10 text-[#68dbae] border border-[#68dbae]/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Operations Staff</span>
                    <span className="px-3 py-1 bg-white/5 text-slate-400 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest">{user?.zone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shift Info */}
            <div className="bg-[#1b2129] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Credentials & Shift</h2>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { icon: 'badge', label: 'Badge / Employee ID', value: user?.badgeId || 'Not assigned', mono: true },
                  { icon: 'location_on', label: 'Assigned Zone', value: user?.zone || 'Stadium East Wing' },
                  { icon: 'calendar_month', label: 'Member Since', value: joinedDate },
                  { icon: 'verified_user', label: 'Account Role', value: 'Operations Staff' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-4 px-6 py-4">
                    <span className="material-symbols-outlined text-slate-500 text-lg flex-shrink-0">{row.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{row.label}</p>
                      <p className={`text-white text-sm mt-0.5 ${row.mono ? 'font-mono' : 'font-medium'}`}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1b2129] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Quick Actions</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { icon: 'warning', label: 'Incident Logs', path: '/ops/incidents', color: 'text-red-400' },
                  { icon: 'conveyor_belt', label: 'Staff Dispatch', path: '/ops/dispatch', color: 'text-[#68dbae]' },
                  { icon: 'grid_view', label: 'Zone Management', path: '/ops/zones', color: 'text-[#68dbae]' },
                  { icon: 'map', label: 'Map Overview', path: '/ops', color: 'text-[#68dbae]' },
                ].map(action => (
                  <button key={action.path} onClick={() => navigate(action.path)} className="flex items-center gap-3 p-4 bg-[#10141a] rounded-xl border border-white/5 hover:border-white/20 transition-all group active:scale-[0.98] text-left">
                    <span className={`material-symbols-outlined ${action.color}`}>{action.icon}</span>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 rounded-2xl border border-red-500/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-500/10">
                <h2 className="font-headline font-bold text-red-400 text-sm uppercase tracking-widest">Sign Out</h2>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">End current session</p>
                  <p className="text-slate-500 text-xs mt-0.5">You'll be returned to the home screen</p>
                </div>
                <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Sign Out
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

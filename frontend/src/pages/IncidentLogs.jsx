import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function IncidentDetailModal({ incident, onClose, onResolve }) {
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);

  if (!incident) return null;

  const handleResolve = async () => {
    setResolving(true);
    try {
      // Mark resolved in local state since backend has no PATCH endpoint
      setResolved(true);
      setTimeout(() => {
        onResolve(incident.id);
        onClose();
      }, 800);
    } catch {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1b2129] rounded-2xl border border-white/10 p-8 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${incident.severity === 'critical' || incident.severity === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-[#68dbae]/10 text-[#68dbae]'}`}>{incident.severity}</span>
            <h2 className="text-xl font-headline font-bold text-white mt-2 capitalize">{incident.type} Incident</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between py-3 border-b border-white/5">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Incident ID</span>
            <span className="font-mono text-slate-300">#{incident.id.substring(0,12).toUpperCase()}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/5">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Zone</span>
            <span className="text-white capitalize">{incident.zoneId.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/5">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Reported By</span>
            <span className="font-mono text-slate-300">{incident.reportedBy.substring(0,12)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/5">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Timestamp</span>
            <span className="text-slate-300">{new Date(incident.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${resolved ? 'bg-[#68dbae]' : incident.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-400'}`}></span>
              <span className="text-white font-medium">{resolved ? 'Resolved' : 'Active'}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          {resolved ? (
            <div className="flex-1 bg-[#68dbae]/20 text-[#68dbae] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 border border-[#68dbae]/30">
              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              Resolved
            </div>
          ) : (
            <button 
              onClick={handleResolve} 
              disabled={resolving}
              className="flex-1 bg-[#68dbae] text-[#10141a] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
            >
              {resolving ? 'Resolving...' : 'Resolve'}
            </button>
          )}
          <button onClick={onClose} className="flex-1 bg-[#10141a] text-slate-400 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-white/5 hover:text-white transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DeclareIncidentModal({ zones, onClose, onDeclare }) {
  const [zoneId, setZoneId] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!zoneId) newErrors.zoneId = 'Please select a zone';
    if (!type) newErrors.type = 'Please select an incident type';
    if (!severity) newErrors.severity = 'Please select a severity level';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    try {
      const resp = await fetch('/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer dummy-token' },
        body: JSON.stringify({ zoneId, type, severity })
      });
      const data = await resp.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onDeclare();
          onClose();
        }, 1200);
      } else {
        setErrors({ submit: data.error || 'Failed to declare incident' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-[#1b2129] rounded-2xl border border-white/10 p-8 w-full max-w-md mx-4 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-[#68dbae]/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#68dbae] text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
          </div>
          <h2 className="text-xl font-headline font-bold text-white mb-2">Incident Declared</h2>
          <p className="text-sm text-slate-400">{type} incident logged for {zones.find(z => z.id === zoneId)?.name || zoneId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1b2129] rounded-2xl border border-white/10 p-8 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-headline font-bold text-white">Declare Incident</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400 text-sm">error</span>
            <p className="text-sm text-red-400">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Zone <span className="text-red-400">*</span></label>
            <select 
              value={zoneId} 
              onChange={e => { setZoneId(e.target.value); setErrors(prev => ({...prev, zoneId: undefined})); }}
              className={`w-full bg-[#10141a] border rounded-xl text-white text-sm p-3 focus:outline-none focus:ring-1 focus:ring-[#68dbae] transition-colors ${errors.zoneId ? 'border-red-500/50' : 'border-white/10'}`}
            >
              <option value="">Select a zone...</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            {errors.zoneId && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.zoneId}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Type <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {['security', 'medical', 'overcrowding'].map(t => (
                <button key={t} type="button" onClick={() => { setType(t); setErrors(prev => ({...prev, type: undefined})); }} className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${type === t ? 'bg-[#68dbae] text-[#10141a] border-[#68dbae]' : errors.type ? 'bg-[#10141a] text-slate-400 border-red-500/30 hover:border-[#68dbae]/40' : 'bg-[#10141a] text-slate-400 border-white/5 hover:border-[#68dbae]/40'}`}>{t}</button>
              ))}
            </div>
            {errors.type && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.type}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Severity <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {[{v:'low',c:'text-[#68dbae]'},{v:'high',c:'text-orange-400'},{v:'critical',c:'text-red-400'}].map(({v,c}) => (
                <button key={v} type="button" onClick={() => { setSeverity(v); setErrors(prev => ({...prev, severity: undefined})); }} className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${severity === v ? `${c} bg-white/5 border-current` : errors.severity ? 'bg-[#10141a] text-slate-400 border-red-500/30 hover:border-white/20' : 'bg-[#10141a] text-slate-400 border-white/5 hover:border-white/20'}`}>{v}</button>
              ))}
            </div>
            {errors.severity && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.severity}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#68dbae] text-[#10141a] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50 mt-2">
            {loading ? 'Submitting...' : 'Confirm Incident'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function IncidentLogs() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDeclare, setShowDeclare] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const { user, logout } = useAuth();

  const fetchData = async () => {
    try {
      const [incRes, zoneRes] = await Promise.all([
        fetch('/incidents').then(r => r.json()),
        fetch('/zones').then(r => r.json()),
      ]);
      if (incRes.success) setIncidents(incRes.data);
      if (zoneRes.success) setZones(zoneRes.data);
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    if (showProfile || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfile, showNotifications]);

  const handleResolve = (incidentId) => {
    setIncidents(prev => prev.filter(i => i.id !== incidentId));
  };

  const filtered = incidents.filter(inc => {
    const matchesSearch = !searchQuery || inc.type.includes(searchQuery.toLowerCase()) || inc.zoneId.includes(searchQuery.toLowerCase()) || inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex font-body">
      {selectedIncident && <IncidentDetailModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} onResolve={handleResolve} />}
      {showDeclare && <DeclareIncidentModal zones={zones} onClose={() => setShowDeclare(false)} onDeclare={fetchData} />}

      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 flex-shrink-0 bg-[#10141a] border-r border-[#3d4943]/10 z-50 transition-all duration-200">
        <div className="px-6 py-8 flex-shrink-0">
          <h1 className="font-headline text-xl font-black text-primary tracking-tighter">VenueFlow</h1>
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Command Center</p>
            <p className="text-sm font-medium text-primary">Stadium East Wing</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          <button onClick={() => navigate('/ops')} className="w-full flex items-center space-x-4 px-4 py-3 text-slate-400 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined">map</span>
            <span className="font-inter text-sm font-medium">Map Overview</span>
          </button>
          <button onClick={() => navigate('/ops/zones')} className="w-full flex items-center space-x-4 px-4 py-3 text-slate-400 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="font-inter text-sm font-medium">Zone Management</span>
          </button>
          <button onClick={() => navigate('/ops/dispatch')} className="w-full flex items-center space-x-4 px-4 py-3 text-slate-400 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined">conveyor_belt</span>
            <span className="font-inter text-sm font-medium">Staff Dispatch</span>
          </button>
          <button onClick={() => navigate('/ops/incidents')} className="w-full flex items-center space-x-4 bg-[#1b2129] text-primary rounded-lg px-4 py-3 transition-all duration-200">
            <span className="material-symbols-outlined">warning</span>
            <span className="font-inter text-sm font-medium">Incident Logs</span>
          </button>
          <div className="pt-4 border-t border-outline-variant/10 mt-4 px-2">
             <button onClick={() => navigate('/attendee')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 transition-all hover:bg-[#31353c] rounded-lg">
                <span className="material-symbols-outlined">smartphone</span>
                <span className="font-inter text-sm font-medium">Attendee View</span>
             </button>
          </div>
        </nav>
        <div className="p-6 flex-shrink-0">
          <button onClick={() => setShowDeclare(true)} className="w-full bg-gradient-to-br from-[#68dbae] to-[#26a37a] text-[#10141a] font-bold py-3 rounded-xl transition-all active:scale-95 duration-150">
            Declare Incident
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="flex-shrink-0 flex justify-between items-center px-8 py-4 w-full bg-[#10141a]/80 backdrop-blur-xl border-b border-[#3d4943]/10 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black text-primary tracking-tighter font-headline">VenueFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowDeclare(true)} className="bg-[#1b2129] text-[#68dbae] px-4 py-2 rounded-lg font-manrope font-bold tracking-tight hover:bg-[#31353c] transition-colors active:scale-95 duration-150 border border-white/5">
              Declare Incident
            </button>
            <div className="flex gap-2">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} className="p-2 text-slate-400 hover:bg-[#31353c] rounded-full transition-colors relative">
                  <span className="material-symbols-outlined">notifications</span>
                  {incidents.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#1b2129] rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <h3 className="font-bold text-white text-sm">Notifications</h3>
                      <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">{incidents.length} Active</span>
                    </div>
                    <div className="overflow-y-auto max-h-72 divide-y divide-white/5">
                      {incidents.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No active incidents</div>
                      ) : (
                        incidents.slice(0, 5).map(inc => (
                          <div key={inc.id} onClick={() => { setSelectedIncident(inc); setShowNotifications(false); }} className="p-4 hover:bg-[#31353c] transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[10px] font-bold uppercase ${inc.severity === 'critical' ? 'text-red-400' : inc.severity === 'high' ? 'text-orange-400' : 'text-[#68dbae]'}`}>{inc.severity}</span>
                              <span className="text-[10px] text-slate-500">{new Date(inc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-sm text-white capitalize">{inc.type} • {inc.zoneId.replace('_', ' ')}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} className="p-2 text-slate-400 hover:bg-[#31353c] rounded-full transition-colors">
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
                          <p className="font-bold text-white text-sm">{user?.name || 'Alex Morgan'}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Operations Lead</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setShowProfile(false); navigate('/ops/profile'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">manage_accounts</span>
                        My Profile
                      </button>
                      <button onClick={() => { setShowProfile(false); navigate('/ops'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">dashboard</span>
                        Dashboard
                      </button>
                      <button onClick={() => { setShowProfile(false); navigate('/ops/dispatch'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">conveyor_belt</span>
                        Staff Dispatch
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
        </header>

        {/* Scrollable Sub-layout */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Page Header / Stats Bento */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 flex flex-col justify-center">
                <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Incident Registry</h1>
                <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">Real-time audit trail of all security and logistical events. Ensure all critical items are resolved before egress begins.</p>
              </div>
              <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                <div className="bg-[#1b2129] p-4 rounded-xl border border-white/5 shadow-inner">
                  <span className="block text-[#ff544e] font-label text-[10px] uppercase tracking-widest mb-1 font-bold">Active Alerts</span>
                  <span className="text-2xl font-headline font-bold text-white">{incidents.length}</span>
                </div>
                <div className="bg-[#1b2129] p-4 rounded-xl border border-white/5 shadow-inner">
                  <span className="block text-[#68dbae] font-label text-[10px] uppercase tracking-widest mb-1 font-bold">Critical</span>
                  <span className="text-2xl font-headline font-bold text-white">{incidents.filter(i => i.severity === 'critical').length}</span>
                </div>
              </div>
            </section>

            {/* Filter Controls */}
            <section className="bg-[#1b2129] rounded-2xl p-4 flex flex-wrap items-center gap-4 border border-white/5">
              <div className="flex-1 min-w-[280px] relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#10141a] border-none outline-none rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-[#68dbae] transition-all"
                  placeholder="Search by ID, zone or type..."
                  type="text"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                  <button key={s} onClick={() => setSeverityFilter(s)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${severityFilter === s ? 'bg-[#68dbae] text-[#10141a]' : 'bg-[#31353c] text-slate-300 hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Data Table */}
            <section className="bg-[#1b2129] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#10141a]">
                      <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-slate-500">Incident ID</th>
                      <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-slate-500">Type</th>
                      <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-slate-500">Severity</th>
                      <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-slate-500">Location</th>
                      <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-slate-500">Time</th>
                      <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((inc) => (
                      <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedIncident(inc)}>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">#{inc.id.substring(0,8).toUpperCase()}</td>
                        <td className="px-6 py-4 text-sm text-white capitalize">{inc.type}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${inc.severity === 'critical' || inc.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-[#68dbae]/10 text-[#68dbae]'}`}>{inc.severity}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 capitalize">{inc.zoneId.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(inc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="px-6 py-4">
                          <button onClick={e => { e.stopPropagation(); setSelectedIncident(inc); }} className="text-[#68dbae] hover:underline text-[10px] font-bold uppercase tracking-widest">Detail</button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                       <tr><td colSpan="6" className="text-center p-12 text-slate-500">No incidents match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useAuth } from '../context/AuthContext';

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
        body: JSON.stringify({ zoneId, type, severity }),
      });
      const data = await resp.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => { onDeclare(); onClose(); }, 1400);
      } else {
        setErrors({ submit: data.error || 'Failed to declare incident' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-[#1b2129] rounded-2xl border border-white/10 p-10 w-full max-w-md mx-4 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-[#68dbae]/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#68dbae] text-3xl" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
          </div>
          <h2 className="text-xl font-headline font-bold text-white mb-2">Incident Declared</h2>
          <p className="text-sm text-slate-400 capitalize">{type} incident logged for {zones.find(z => z.id === zoneId)?.name || zoneId}</p>
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
              onChange={e => { setZoneId(e.target.value); setErrors(p => ({...p, zoneId: undefined})); }}
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
                <button key={t} type="button"
                  onClick={() => { setType(t); setErrors(p => ({...p, type: undefined})); }}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${type === t ? 'bg-[#68dbae] text-[#10141a] border-[#68dbae]' : errors.type ? 'bg-[#10141a] text-slate-400 border-red-500/30' : 'bg-[#10141a] text-slate-400 border-white/5 hover:border-[#68dbae]/40'}`}
                >{t}</button>
              ))}
            </div>
            {errors.type && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.type}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Severity <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {[{v:'low',c:'text-[#68dbae]'},{v:'high',c:'text-orange-400'},{v:'critical',c:'text-red-400'}].map(({v,c}) => (
                <button key={v} type="button"
                  onClick={() => { setSeverity(v); setErrors(p => ({...p, severity: undefined})); }}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${severity === v ? `${c} bg-white/5 border-current` : errors.severity ? 'bg-[#10141a] text-slate-400 border-red-500/30' : 'bg-[#10141a] text-slate-400 border-white/5 hover:border-white/20'}`}
                >{v}</button>
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

function CCTVModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-white font-bold uppercase tracking-widest text-sm">Live — Hotzone B Camera Array</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <img
            alt="CCTV Feed Hotzone B"
            className="w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWJloJ4FoGy3XIMigT71e6jn3UUxZyJKuD5D0Q1Ol27nOE0DOxedPSrI9ZeLd04G0oii08Z-cM6ZfKI8tYvTYzAL4v9WRG70dygx8ZpSYWeGx_f2IWqLvJQWWGT35c76s0KJjF22TdNyy5yHdLgZof58JUq6XYTvR-kYUqckN2xAUxcqGVoDvQg47T4WBxCgJDnnYNMCZMldRtelEAqmLuGj2PFt8PY2Ow3yPxn-R5YWPibcsncbg_n3Dv_IljeYIU1-RlsO-jXMSW"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-300 font-bold">Hotzone B — <span className="text-orange-400">Elevated Activity</span></p>
              <p className="text-[10px] text-slate-500 mt-0.5">Updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OpsDashboard() {
  const [zones, setZones] = useState([]);
  const [gates, setGates] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showDeclare, setShowDeclare] = useState(false);
  const [showCCTV, setShowCCTV] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const fetchData = async () => {
    try {
      const [zonesRes, gatesRes, incRes] = await Promise.all([
        fetch('/zones').then(r => r.json()),
        fetch('/gates').then(r => r.json()),
        fetch('/incidents').then(r => r.json()),
      ]);
      if (zonesRes.success) setZones(zonesRes.data);
      if (gatesRes.success) setGates(gatesRes.data);
      if (incRes.success) setIncidents(incRes.data);
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'bg-tertiary-container/20 text-tertiary';
      case 'warning':  return 'bg-secondary-container/20 text-secondary';
      default:         return 'bg-primary-container/20 text-primary';
    }
  };

  const getIncidentBorder = (severity) => {
    switch(severity) {
      case 'critical': return 'border-tertiary-container border-l-4';
      case 'high':     return 'border-tertiary-container border-l-4';
      case 'medium':   return 'border-secondary-container border-l-4';
      default:         return 'border-primary border-l-4';
    }
  };

  const criticalCount = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;

  return (
    <div className="text-on-surface bg-surface font-body overflow-hidden flex flex-row">

      {/* Modals */}
      {showDeclare && <DeclareIncidentModal zones={zones} onClose={() => setShowDeclare(false)} onDeclare={fetchData} />}
      {showCCTV && <CCTVModal onClose={() => setShowCCTV(false)} />}

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
          <button onClick={() => navigate('/ops')} className="w-full flex items-center space-x-4 bg-[#1b2129] text-primary rounded-lg px-4 py-3 transition-all duration-200">
            <span className="material-symbols-outlined" data-icon="map">map</span>
            <span className="font-inter text-sm font-medium">Map Overview</span>
          </button>
          <button onClick={() => navigate('/ops/zones')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
            <span className="font-inter text-sm font-medium">Zone Management</span>
          </button>
          <button onClick={() => navigate('/ops/dispatch')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined" data-icon="conveyor_belt">conveyor_belt</span>
            <span className="font-inter text-sm font-medium">Staff Dispatch</span>
          </button>
          <button onClick={() => navigate('/ops/incidents')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined" data-icon="warning">warning</span>
            <span className="font-inter text-sm font-medium">Incident Logs</span>
          </button>
          <div className="pt-4 border-t border-outline-variant/10 mt-4 px-2">
            <button onClick={() => navigate('/attendee')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 transition-all hover:bg-[#31353c] rounded-lg">
              <span className="material-symbols-outlined" data-icon="smartphone">smartphone</span>
              <span className="font-inter text-sm font-medium">Attendee View</span>
            </button>
          </div>
        </nav>
        <div className="p-6 flex-shrink-0">
          <button
            onClick={() => navigate('/ops/incidents')}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-3 rounded-xl scale-95 active:scale-90 transition-transform"
          >
            Clear Zone
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* TopAppBar */}
        <header className="flex justify-between items-center px-8 py-4 w-full bg-[#10141a]/80 backdrop-blur-xl z-40 sticky top-0 border-b border-[#3d4943]/10">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Live Event</span>
              <span className="text-lg font-headline font-bold text-on-surface">Data Simulator Mode</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/20"></div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Attendee Count</span>
              <span className="text-lg font-headline font-bold text-primary">
                {zones.reduce((s, z) => s + (z.currentCount || 0), 0)} / {zones.reduce((s, z) => s + (z.capacity || 0), 0)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right mr-4">
              <p className="text-xs font-medium text-slate-400 uppercase">Live Ping</p>
              <p className="text-sm font-bold font-headline">{new Date().toLocaleTimeString()}</p>
            </div>

            {/* Declare Incident — opens modal */}
            <button
              onClick={() => setShowDeclare(true)}
              className="bg-tertiary-container text-on-tertiary-container px-6 py-2.5 rounded-full font-headline font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Declare Incident
            </button>

            <div className="flex flex-row items-center space-x-2 ml-4">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                  className="material-symbols-outlined p-2 hover:bg-[#31353c] rounded-full transition-colors cursor-pointer relative"
                  data-icon="notifications"
                >notifications</button>
                {criticalCount > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#1b2129] rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <h3 className="font-bold text-white text-sm">Live Incident Feed</h3>
                      {criticalCount > 0 && (
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">{criticalCount} Critical</span>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-72 divide-y divide-white/5">
                      {incidents.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No active incidents</div>
                      ) : (
                        incidents.slice(0, 6).map(inc => (
                          <div
                            key={inc.id}
                            onClick={() => { navigate('/ops/incidents'); setShowNotifications(false); }}
                            className="p-4 hover:bg-[#31353c] transition-colors cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[10px] font-bold uppercase ${inc.severity === 'critical' ? 'text-red-400' : inc.severity === 'high' ? 'text-orange-400' : 'text-[#68dbae]'}`}>{inc.severity}</span>
                              <span className="text-[10px] text-slate-500">{new Date(inc.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-sm text-white capitalize">{inc.type} • {zones.find(z => z.id === inc.zoneId)?.name || inc.zoneId}</p>
                          </div>
                        ))
                      )}
                      {incidents.length > 0 && (
                        <div className="p-3">
                          <button onClick={() => { navigate('/ops/incidents'); setShowNotifications(false); }} className="w-full text-center text-[10px] font-bold text-[#68dbae] uppercase tracking-widest hover:underline py-1">
                            View All Incidents →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                  className="material-symbols-outlined p-2 hover:bg-[#31353c] rounded-full transition-colors cursor-pointer"
                  data-icon="account_circle"
                >account_circle</button>
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
                      <button onClick={() => { setShowProfile(false); navigate('/ops/zones'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                        Zone Management
                      </button>
                      <button onClick={() => { setShowProfile(false); navigate('/ops/dispatch'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">conveyor_belt</span>
                        Staff Dispatch
                      </button>
                      <button onClick={() => { setShowProfile(false); navigate('/ops/incidents'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        Incident Logs
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

        {/* Dashboard Layout: Asymmetric Bento Grid */}
        <div className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-y-auto pb-24">

          {/* Left Panel: Zone Status */}
          <div className="col-span-3 space-y-6">
            <section className="bg-surface-container rounded-xl p-6 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Zones Monitoring</h3>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => navigate('/ops/zones')}
                    className="flex items-center justify-between group p-2 hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{zone.name}</span>
                      <span className="text-xs text-slate-500">Occupancy: {zone.occupancy}%</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(zone.status)}`}>
                      {zone.status}
                    </span>
                  </div>
                ))}
                {zones.length === 0 && <p className="text-xs text-slate-500">Waiting for sensor data...</p>}
              </div>
            </section>

            <section className="bg-surface-container rounded-xl p-6 h-[400px] flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Gate Flow Metrics</h3>
              <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {gates.map((gate) => (
                  <div
                    key={gate.id}
                    onClick={() => navigate('/attendee/queues')}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium">{gate.name}</span>
                      <span className="text-slate-400">{gate.processingRate} people/min</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${gate.queueDepth > 100 ? 'bg-tertiary-container' : gate.queueDepth > 50 ? 'bg-secondary-container' : 'bg-primary'}`}
                        style={{ width: `${Math.min((gate.queueDepth / 200) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-right mt-1 text-slate-500">Queue: {gate.queueDepth}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Main Panel: Interactive Google Map */}
          <div className="col-span-6">
            <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden h-[calc(100vh-180px)] border border-outline-variant/10 shadow-2xl">
              <Map
                defaultCenter={{ lat: 37.7786, lng: -122.3893 }}
                defaultZoom={17}
                mapId={import.meta.env.VITE_MAP_ID || 'ad392c68f6356614'}
                disableDefaultUI={true}
                colorScheme="DARK"
                className="w-full h-full"
              >
                {incidents.map((incident, idx) => {
                  const latOffset = (idx % 3 - 1) * 0.001;
                  const lngOffset = (idx % 2 - 0.5) * 0.002;
                  return (
                    <AdvancedMarker
                      key={incident.id}
                      position={{ lat: 37.7786 + latOffset, lng: -122.3893 + lngOffset }}
                    >
                      <Pin
                        background={incident.severity === 'critical' ? '#ff544e' : '#26a37a'}
                        glyphColor={'#000'}
                        borderColor={'#fff'}
                      />
                    </AdvancedMarker>
                  );
                })}

                {zones.map((zone, idx) => {
                  const latPos = 37.7786 + (idx * 0.0005) - 0.001;
                  const lngPos = -122.3893 + (idx * 0.0005) - 0.001;
                  return (
                    <AdvancedMarker key={`zone-${zone.id}`} position={{ lat: latPos, lng: lngPos }}>
                      <div className={`p-2 rounded-lg backdrop-blur-md border border-white/20 shadow-xl cursor-pointer ${zone.status === 'critical' ? 'bg-tertiary-container/80 text-on-tertiary-container' : 'bg-surface-container/80 text-primary'}`} onClick={() => navigate('/ops/zones')}>
                        <p className="text-[10px] font-black uppercase text-center leading-none">{zone.occupancy}%</p>
                        <p className="text-[9px] font-bold whitespace-nowrap">{zone.name}</p>
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </Map>

              <div className="absolute bottom-4 left-4 flex space-x-2 pointer-events-none">
                <div className="flex items-center space-x-2 bg-surface-container/90 px-3 py-2 rounded-lg text-xs font-medium border border-outline-variant/10 shadow-lg pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span>Live GIS Feed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Logs & Feeds */}
          <div className="col-span-3 space-y-6 flex flex-col h-[calc(100vh-180px)]">
            <section className="bg-surface-container rounded-xl p-6 shadow-sm flex-1 flex flex-col overflow-hidden">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex justify-between items-center">
                Incident Feed
                <span className="text-[10px] text-tertiary bg-tertiary-container/10 px-2 py-0.5 rounded">{incidents.length} Active</span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => navigate('/ops/incidents')}
                    className={`p-3 bg-surface-container-low rounded-lg ${getIncidentBorder(incident.severity)} cursor-pointer hover:bg-surface-container-highest transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold uppercase ${incident.severity === 'critical' ? 'text-tertiary' : 'text-primary'}`}>
                        {incident.severity}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(incident.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight">{incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} • {zones.find(z => z.id === incident.zoneId)?.name || incident.zoneId}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Reported by Staff ID: {incident.reportedBy.substring(0,8)}</p>
                  </div>
                ))}
                {incidents.length === 0 && <p className="text-xs text-slate-500">No active incidents.</p>}
              </div>
            </section>

            {/* CCTV Quick-View — click opens modal */}
            <section
              className="bg-surface-container-highest rounded-xl p-6 h-48 flex items-center justify-center relative overflow-hidden group cursor-pointer"
              onClick={() => setShowCCTV(true)}
            >
              <img
                alt="CCTV Feed"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWJloJ4FoGy3XIMigT71e6jn3UUxZyJKuD5D0Q1Ol27nOE0DOxedPSrI9ZeLd04G0oii08Z-cM6ZfKI8tYvTYzAL4v9WRG70dygx8ZpSYWeGx_f2IWqLvJQWWGT35c76s0KJjF22TdNyy5yHdLgZof58JUq6XYTvR-kYUqckN2xAUxcqGVoDvQg47T4WBxCgJDnnYNMCZMldRtelEAqmLuGj2PFt8PY2Ow3yPxn-R5YWPibcsncbg_n3Dv_IljeYIU1-RlsO-jXMSW"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/20 to-transparent"></div>
              <div className="relative text-center">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block mb-2"></span>
                <span className="material-symbols-outlined text-tertiary mb-2 block" data-icon="videocam">videocam</span>
                <p className="text-xs font-bold uppercase tracking-widest">Live View: Hotzone B</p>
                <p className="text-[10px] text-slate-400 mt-1">Click to expand</p>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useAuth } from '../context/AuthContext';

export default function ZoneManagement() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [zones, setZones] = useState([]);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [lightingMode, setLightingMode] = useState('standard'); // 'standard' | 'event' | 'emergency'
  const [showCCTV, setShowCCTV] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const fetchData = async () => {
    try {
      const zRes = await fetch('/zones').then(r => r.json());
      if (zRes.success) setZones(zRes.data);
    } catch (e) {
      console.error("Failed to fetch zone data:", e);
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

  const handleCalibrate = async () => {
    if (calibrating) return;
    setCalibrating(true);
    setCalibrated(false);
    try {
      await fetchData();
    } finally {
      setCalibrating(false);
      setCalibrated(true);
      setTimeout(() => setCalibrated(false), 3000);
    }
  };

  const cycleLighting = () => {
    const modes = ['standard', 'event', 'emergency'];
    const next = modes[(modes.indexOf(lightingMode) + 1) % modes.length];
    setLightingMode(next);
  };

  const lightingConfig = {
    standard: { label: 'Standard', color: 'text-slate-300', bg: 'bg-[#1b2129]', icon: 'lightbulb' },
    event: { label: 'Event Mode', color: 'text-[#68dbae]', bg: 'bg-[#68dbae]/10', icon: 'theater_comedy' },
    emergency: { label: 'Emergency', color: 'text-red-400', bg: 'bg-red-500/10', icon: 'emergency' },
  };

  const totalOccupancy = zones.reduce((sum, z) => sum + (z.currentCount || 0), 0);
  const totalCapacity = zones.reduce((sum, z) => sum + (z.capacity || 0), 0);
  const overallPercentage = totalCapacity ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex font-body">

      {/* CCTV Full-Screen Modal */}
      {showCCTV && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowCCTV(false)}>
          <div className="relative w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-white font-bold uppercase tracking-widest text-sm">Live — CAM-NC-04 · Sector B4</span>
              </div>
              <button onClick={() => setShowCCTV(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img
                alt="CCTV surveillance feed"
                className="w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7zJsUMNDahYMwBpFLm9xrASyok4MS4sRGi5sWsg12RUzv61bHCshZPkdOqzTUcA5LIDilRLSfXsevfGGuhWSgwQmwdZduXWKgx9PNLmCMo6pWM558a6_rqy1u0mdj6q6vKZiZJ-Kg5mFn66A8t1ZbgOj721669u1ASeHw9bHM82nbOsrlWLvI_EkCokEZ8f-mYMtAmhfbeQTs0HDT_l2cPNpXtVScXoTpzG-7yNOd3L_DJPEfe8pFumLd3_J8D9d2Gz5R5GHkqtJs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-300 font-bold">Density Check: <span className="text-[#68dbae]">Optimal</span></p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-black/50 border border-white/20 text-white px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                    CAM-NC-04
                  </button>
                  <button className="bg-black/50 border border-white/20 text-slate-400 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors" onClick={() => {}}>
                    CAM-NC-05
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Detail Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedZone(null)}>
          <div className="bg-[#1b2129] rounded-2xl border border-white/10 p-8 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${selectedZone.status === 'critical' ? 'bg-red-500/10 text-red-400' : selectedZone.status === 'warning' ? 'bg-orange-500/10 text-orange-400' : 'bg-[#68dbae]/10 text-[#68dbae]'}`}>{selectedZone.status}</span>
                <h2 className="text-xl font-headline font-bold text-white mt-2">{selectedZone.name}</h2>
              </div>
              <button onClick={() => setSelectedZone(null)} className="text-slate-400 hover:text-white p-1 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Occupancy</span>
                <span className="font-bold text-white">{selectedZone.occupancy ?? 0}%</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Current Count</span>
                <span className="text-white">{(selectedZone.currentCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Capacity</span>
                <span className="text-white">{(selectedZone.capacity || 0).toLocaleString()}</span>
              </div>
              <div className="py-3">
                <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${selectedZone.status === 'critical' ? 'bg-red-500' : selectedZone.status === 'warning' ? 'bg-orange-400' : 'bg-[#68dbae]'}`}
                    style={{ width: `${Math.min(selectedZone.occupancy ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedZone(null); navigate('/ops/incidents'); }} className="flex-1 bg-[#68dbae] text-[#10141a] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">
                Clear Zone
              </button>
              <button onClick={() => { setSelectedZone(null); navigate('/ops/dispatch'); }} className="flex-1 bg-[#10141a] text-slate-400 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-white/5 hover:text-white transition-colors">
                Dispatch Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 flex-shrink-0 bg-[#10141a] border-r border-[#3d4943]/10 z-50">
        <div className="px-6 py-8 flex-shrink-0">
          <h1 className="font-headline text-xl font-black text-primary tracking-tighter">VenueFlow</h1>
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Command Center</p>
            <p className="text-sm font-medium text-primary">Stadium East Wing</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          <button onClick={() => navigate('/ops')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined text-xl">map</span>
            <span className="font-inter text-sm font-medium">Map Overview</span>
          </button>
          <button onClick={() => navigate('/ops/zones')} className="w-full flex items-center space-x-4 bg-[#1b2129] text-primary rounded-lg px-4 py-3 transition-all duration-200">
            <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
            <span className="font-inter text-sm font-medium">Zone Management</span>
          </button>
          <button onClick={() => navigate('/ops/dispatch')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined text-xl">conveyor_belt</span>
            <span className="font-inter text-sm font-medium">Staff Dispatch</span>
          </button>
          <button onClick={() => navigate('/ops/incidents')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined text-xl">warning</span>
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
          <button onClick={() => navigate('/ops/incidents')} className="w-full bg-[#1b2129] text-[#68dbae] py-3 rounded-xl border border-[#68dbae]/20 font-bold hover:bg-[#26a37a] hover:text-white transition-colors">
            Clear Zone
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="flex-shrink-0 flex justify-between items-center px-8 py-4 w-full bg-[#10141a]/80 backdrop-blur-xl border-b border-[#3d4943]/10 z-40 sticky top-0">
          <div className="flex items-center gap-8">
            <div className="text-xl font-black text-primary tracking-tighter font-headline">VenueFlow</div>
          </div>
          <div className="flex items-center gap-4">
            {/* Calibrate Sensors */}
            <button
              onClick={handleCalibrate}
              disabled={calibrating}
              className={`px-4 py-2 rounded-xl font-bold font-headline text-sm active:scale-95 duration-150 transition-all flex items-center gap-2 ${
                calibrated
                  ? 'bg-[#68dbae]/20 text-[#68dbae] border border-[#68dbae]/30'
                  : 'bg-[#26a37a] text-[#003121]'
              } disabled:opacity-70`}
            >
              <span className={`material-symbols-outlined text-sm ${calibrating ? 'animate-spin' : ''}`}>
                {calibrated ? 'check_circle' : calibrating ? 'refresh' : 'sensors'}
              </span>
              {calibrating ? 'Calibrating...' : calibrated ? 'Calibrated!' : 'Calibrate Sensors'}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} className="material-symbols-outlined text-slate-400 cursor-pointer p-2 hover:bg-[#31353c] rounded-full transition-colors">
                notifications
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#1b2129] rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="font-bold text-white text-sm">Zone Notifications</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {zones.filter(z => z.status === 'critical' || z.status === 'warning').length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">No critical zone notifications</div>
                    ) : (
                      zones.filter(z => z.status === 'critical' || z.status === 'warning').map(z => (
                        <div key={z.id} onClick={() => { setSelectedZone(z); setShowNotifications(false); }} className="p-4 hover:bg-[#31353c] transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold uppercase ${z.status === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>{z.status}</span>
                            <span className="text-[10px] text-slate-500">{z.occupancy}% full</span>
                          </div>
                          <p className="text-sm text-white">{z.name}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} className="material-symbols-outlined text-slate-400 cursor-pointer p-2 hover:bg-[#31353c] rounded-full transition-colors">
                account_circle
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
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Zone Controller</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setShowProfile(false); navigate('/ops'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">dashboard</span>
                      Dashboard
                    </button>
                    <button onClick={() => { setShowProfile(false); navigate('/ops/dispatch'); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-[#31353c] rounded-lg transition-colors flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">conveyor_belt</span>
                      Staff Dispatch
                    </button>
                    <button onClick={() => { setShowProfile(false); navigate('/attendee'); }} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Scroll Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-primary-fixed-dim text-xs font-bold uppercase tracking-widest text-[#68dbae]">Sector B4</span>
                  <span className="w-2 h-2 rounded-full bg-[#68dbae] animate-pulse"></span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface">Global Venue Control</h1>
              </div>
              <div className="flex gap-3">
                {/* Adjust Lighting — cycles between modes */}
                <button
                  onClick={cycleLighting}
                  className={`px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all border ${lightingConfig[lightingMode].bg} ${lightingConfig[lightingMode].color} border-current/20 hover:opacity-80`}
                >
                  <span className="material-symbols-outlined text-sm">{lightingConfig[lightingMode].icon}</span>
                  {lightingConfig[lightingMode].label}
                </button>
              </div>
            </div>

            {/* Calibration banner */}
            {calibrated && (
              <div className="mb-6 bg-[#68dbae]/10 border border-[#68dbae]/20 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#68dbae]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                <div>
                  <p className="text-[#68dbae] font-bold text-sm">All sensors recalibrated</p>
                  <p className="text-[#68dbae]/60 text-xs">Zone data refreshed successfully at {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            )}

            {/* Lighting mode banner */}
            {lightingMode !== 'standard' && (
              <div className={`mb-6 rounded-xl p-4 flex items-center gap-3 border ${lightingMode === 'emergency' ? 'bg-red-500/10 border-red-500/20' : 'bg-[#68dbae]/10 border-[#68dbae]/20'}`}>
                <span className={`material-symbols-outlined ${lightingMode === 'emergency' ? 'text-red-400' : 'text-[#68dbae]'}`} style={{fontVariationSettings: "'FILL' 1"}}>
                  {lightingConfig[lightingMode].icon}
                </span>
                <div>
                  <p className={`font-bold text-sm ${lightingMode === 'emergency' ? 'text-red-400' : 'text-[#68dbae]'}`}>
                    Lighting: {lightingConfig[lightingMode].label} Active
                  </p>
                  <p className={`text-xs ${lightingMode === 'emergency' ? 'text-red-400/60' : 'text-[#68dbae]/60'}`}>
                    {lightingMode === 'event' ? 'Venue lighting updated to event mode.' : 'Emergency lighting protocol engaged across all zones.'}
                  </p>
                </div>
                <button onClick={() => setLightingMode('standard')} className="ml-auto text-slate-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-6 pb-12">

              {/* Live CCTV Feed */}
              <div
                className="col-span-12 md:col-span-5 lg:col-span-4 bg-[#1b2129] rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5"
                onClick={() => setShowCCTV(true)}
              >
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Live: CAM-NC-04</span>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">fullscreen</span>
                  </span>
                </div>
                <img
                  alt="CCTV surveillance"
                  className="w-full h-full object-cover aspect-video md:aspect-square opacity-80 group-hover:opacity-100 transition-opacity"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7zJsUMNDahYMwBpFLm9xrASyok4MS4sRGi5sWsg12RUzv61bHCshZPkdOqzTUcA5LIDilRLSfXsevfGGuhWSgwQmwdZduXWKgx9PNLmCMo6pWM558a6_rqy1u0mdj6q6vKZiZJ-Kg5mFn66A8t1ZbgOj721669u1ASeHw9bHM82nbOsrlWLvI_EkCokEZ8f-mYMtAmhfbeQTs0HDT_l2cPNpXtVScXoTpzG-7yNOd3L_DJPEfe8pFumLd3_J8D9d2Gz5R5GHkqtJs"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Density Check: <span className="text-[#68dbae]">Optimal</span></span>
                  </div>
                </div>
              </div>

              {/* Occupancy Graph */}
              <div className="col-span-12 md:col-span-7 lg:col-span-8 bg-[#1b2129] rounded-2xl p-6 flex flex-col border border-white/5">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-lg font-bold">Occupancy Flow</h3>
                    <p className="text-xs text-slate-400">Live Global Count</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#68dbae]">{totalOccupancy.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">At {overallPercentage}% Capacity</div>
                  </div>
                </div>
                <div className="flex-1 w-full relative min-h-[200px]">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                    <defs>
                      <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#68dbae" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#68dbae" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0,80 Q50,70 100,40 T200,60 T300,20 T400,30 L400,100 L0,100 Z" fill="url(#lineGradient)"></path>
                    <path d="M0,80 Q50,70 100,40 T200,60 T300,20 T400,30" fill="none" stroke="#68dbae" strokeWidth="2"></path>
                    <circle cx="100" cy="40" fill="#68dbae" r="3"></circle>
                    <circle cx="300" cy="20" fill="#68dbae" r="3"></circle>
                  </svg>
                  <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>-2 HOURS</span>
                    <span>-1 HOUR</span>
                    <span>30 MINS</span>
                    <span>NOW</span>
                  </div>
                </div>
              </div>

              {/* Zone Cards — clickable */}
              <div className="col-span-12 md:col-span-8 bg-[#1b2129] rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Zone Status</h3>
                  <span className="px-3 py-1 bg-[#26a37a]/20 text-[#68dbae] rounded-full text-[10px] font-bold uppercase">{zones.length} Zones</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className="flex items-center gap-4 p-3 bg-black/20 rounded-xl hover:bg-[#31353c] transition-colors cursor-pointer border border-white/5 group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${zone.status === 'critical' ? 'bg-red-500/20 text-red-400' : zone.status === 'warning' ? 'bg-orange-500/20 text-orange-400' : 'bg-[#68dbae]/10 text-[#68dbae]'}`}>
                        <span className="material-symbols-outlined">
                          {zone.status === 'critical' ? 'warning' : zone.status === 'warning' ? 'report_problem' : 'check_circle'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{zone.name}</div>
                        <div className="w-full bg-black/30 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${zone.status === 'critical' ? 'bg-red-500' : zone.status === 'warning' ? 'bg-orange-400' : 'bg-[#68dbae]'}`}
                            style={{ width: `${Math.min(zone.occupancy ?? 0, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-tight mt-0.5">{zone.occupancy ?? 0}% capacity</div>
                      </div>
                      <span className="material-symbols-outlined text-slate-600 group-hover:text-slate-400 transition-colors text-sm">chevron_right</span>
                    </div>
                  ))}
                  {zones.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-slate-500 text-sm">
                      <span className="material-symbols-outlined text-3xl block mb-2 opacity-30">sensors</span>
                      Waiting for sensor data...
                    </div>
                  )}
                </div>
              </div>

              {/* Density Mini-Map */}
              <div className="col-span-12 md:col-span-4 bg-[#1b2129] rounded-2xl p-6 relative overflow-hidden flex flex-col border border-white/5">
                <h3 className="text-lg font-bold mb-4">Venue Pressure</h3>
                <div className="flex-1 w-full min-h-[160px] rounded-xl overflow-hidden mb-4 border border-white/5">
                  <Map
                    defaultCenter={{ lat: 37.7788, lng: -122.3892 }}
                    defaultZoom={16}
                    mapId={import.meta.env.VITE_MAP_ID || 'ad392c68f6356614'}
                    disableDefaultUI={true}
                    colorScheme="DARK"
                    className="w-full h-full"
                  >
                    {zones.map((zone, idx) => {
                      const lat = 37.7788 + (idx * 0.0006) - 0.001;
                      const lng = -122.3892 + (idx * 0.0006) - 0.001;
                      return (
                        <AdvancedMarker key={`mini-${zone.id}`} position={{ lat, lng }}>
                          <div className={`w-3 h-3 rounded-full blur-[2px] ${zone.status === 'critical' ? 'bg-red-500' : 'bg-[#68dbae]'}`}></div>
                        </AdvancedMarker>
                      );
                    })}
                  </Map>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Entry Velocity</span>
                    <span className="text-sm font-bold text-[#68dbae]">Flowing</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[#68dbae] w-[75%]"></div>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    System monitoring all gateways. All entrances operating within safety parameters.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useAuth } from '../context/AuthContext';

// Defined OUTSIDE StaffDispatch so React doesn't recreate the component type
// on every parent render — which would cause the textarea to lose focus.
function DispatchForm({ priority, setPriority, assignedTeam, setAssignedTeam,
                        instructions, setInstructions, formErrors, setFormErrors,
                        dispatchSuccess, onSubmit }) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Priority Level <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => { setPriority('routine'); setFormErrors(p => ({...p, priority: undefined})); }} className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all ${priority === 'routine' ? 'bg-[#68dbae]/10 border-[#68dbae]/30 text-[#68dbae] font-bold' : formErrors.priority ? 'bg-[#1b2129] border-red-500/30 text-slate-400' : 'bg-[#1b2129] border-white/5 text-slate-400 hover:border-[#68dbae]'}`}>Routine</button>
          <button type="button" onClick={() => { setPriority('urgent'); setFormErrors(p => ({...p, priority: undefined})); }} className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${priority === 'urgent' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : formErrors.priority ? 'bg-[#1b2129] border-red-500/30 text-slate-400' : 'bg-[#1b2129] border-white/5 text-slate-400 hover:border-orange-400'}`}>Urgent</button>
          <button type="button" onClick={() => { setPriority('critical'); setFormErrors(p => ({...p, priority: undefined})); }} className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${priority === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' : formErrors.priority ? 'bg-[#1b2129] border-red-500/30 text-slate-400' : 'bg-[#1b2129] border-white/5 text-slate-400 hover:border-red-400'}`}>Critical</button>
        </div>
        {formErrors.priority && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{formErrors.priority}</p>}
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assign Team <span className="text-red-400">*</span></label>
        <select value={assignedTeam} onChange={e => { setAssignedTeam(e.target.value); setFormErrors(p => ({...p, team: undefined})); }} className={`w-full bg-[#1b2129] border rounded-xl text-white font-inter text-sm p-3 focus:outline-none focus:ring-1 focus:ring-[#68dbae] ${formErrors.team ? 'border-red-500/50' : 'border-white/5'}`}>
          <option>Select available unit...</option>
          <option>Unit Alpha 7 (Security)</option>
          <option>Med-Unit 2 (Medical)</option>
        </select>
        {formErrors.team && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{formErrors.team}</p>}
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Instruction Details <span className="text-red-400">*</span></label>
        <textarea
          value={instructions}
          onChange={e => { setInstructions(e.target.value); setFormErrors(p => ({...p, instructions: undefined})); }}
          className={`w-full bg-[#1b2129] border rounded-xl text-white font-inter text-sm p-3 focus:outline-none focus:ring-1 focus:ring-[#68dbae] resize-none ${formErrors.instructions ? 'border-red-500/50' : 'border-white/5'}`}
          placeholder="Describe the task..."
          rows={4}
        />
        {formErrors.instructions && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{formErrors.instructions}</p>}
      </div>
      <div className="pt-4">
        {dispatchSuccess ? (
          <div className="w-full bg-[#68dbae]/20 text-[#68dbae] py-4 rounded-xl font-black font-headline tracking-tighter text-center flex items-center justify-center gap-2 border border-[#68dbae]/30">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            DISPATCHED SUCCESSFULLY
          </div>
        ) : (
          <button type="submit" className="w-full bg-[#68dbae] text-[#10141a] font-black py-4 rounded-xl text-sm uppercase tracking-widest active:scale-[0.98] transition-all">
            Dispatch Task
          </button>
        )}
      </div>
    </form>
  );
}

export default function StaffDispatch() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [recentering, setRecentering] = useState(false);
  
  // Dispatch form state
  const [priority, setPriority] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('');
  const [instructions, setInstructions] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incRes = await fetch('/incidents').then(r => r.json());
        if (incRes.success) setIncidents(incRes.data);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      }
    };
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

  const handleRecenter = () => {
    setRecentering(true);
    setTimeout(() => setRecentering(false), 1500);
  };

  const validateDispatch = () => {
    const errors = {};
    if (!priority) errors.priority = 'Select a priority level';
    if (!assignedTeam || assignedTeam === 'Select available unit...') errors.team = 'Select a team to assign';
    if (!instructions.trim()) errors.instructions = 'Enter task instructions';
    if (instructions.trim().length > 0 && instructions.trim().length < 10) errors.instructions = 'Instructions must be at least 10 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!validateDispatch()) return;
    
    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      setPriority('');
      setAssignedTeam('');
      setInstructions('');
      setFormErrors({});
    }, 2500);
  };

  const staffUnits = [
    { id: 1, name: 'Unit Alpha 1', zone: 'Zone B4, Gate 11', status: 'On Guard', progress: 75 },
    { id: 2, name: 'Unit Alpha 2', zone: 'Zone B4, Gate 12', status: 'On Guard', progress: 60 },
    { id: 3, name: 'Unit Alpha 3', zone: 'Zone B4, Gate 13', status: 'On Guard', progress: 85 },
    { id: 4, name: 'Unit Alpha 4', zone: 'Zone B4, Gate 14', status: 'On Guard', progress: 50 },
    { id: 5, name: 'Unit Alpha 5', zone: 'Zone B4, Gate 15', status: 'On Guard', progress: 70 },
  ];

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex font-body">
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
          <button onClick={() => navigate('/ops')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined">map</span>
            <span className="font-inter text-sm font-medium">Map Overview</span>
          </button>
          <button onClick={() => navigate('/ops/zones')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="font-inter text-sm font-medium">Zone Management</span>
          </button>
          <button onClick={() => navigate('/ops/dispatch')} className="w-full flex items-center space-x-4 bg-[#1b2129] text-primary rounded-lg px-4 py-3 transition-all duration-200">
            <span className="material-symbols-outlined">conveyor_belt</span>
            <span className="font-inter text-sm font-medium">Staff Dispatch</span>
          </button>
          <button onClick={() => navigate('/ops/incidents')} className="w-full flex items-center space-x-4 text-slate-400 px-4 py-3 hover:bg-[#31353c] rounded-lg transition-all duration-200">
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
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="flex-shrink-0 flex justify-between items-center px-8 py-4 w-full bg-[#10141a]/80 backdrop-blur-xl border-b border-[#3d4943]/10 z-40 sticky top-0">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black text-primary tracking-tighter font-headline">VenueFlow</span>
            <nav className="hidden md:flex gap-6">
              <button onClick={() => navigate('/ops')} className="font-headline font-bold tracking-tight text-primary border-b-2 border-primary px-3 py-1">Operations</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/ops/incidents')} className="bg-[#26a37a] text-[#003121] px-4 py-2 rounded-xl font-bold font-headline text-sm active:scale-95 duration-150 transition-all">
              Declare Incident
            </button>
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <span onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} className="material-symbols-outlined text-slate-400 cursor-pointer p-2 hover:bg-[#31353c] rounded-full transition-colors relative">notifications
              </span>
              {incidents.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#1b2129] rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm">Dispatch Alerts</h3>
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">{incidents.length} Active</span>
                  </div>
                  <div className="overflow-y-auto max-h-72 divide-y divide-white/5">
                    {incidents.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">No alerts in dispatch queue</div>
                    ) : (
                      incidents.slice(0, 5).map(inc => (
                        <div key={inc.id} onClick={() => { navigate('/ops/incidents'); setShowNotifications(false); }} className="p-4 hover:bg-[#31353c] transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold uppercase ${inc.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>{inc.severity}</span>
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
              <span onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} className="material-symbols-outlined text-slate-400 cursor-pointer p-2 hover:bg-[#31353c] rounded-full transition-colors">account_circle</span>
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#1b2129] rounded-2xl border border-white/10 shadow-2xl z-[60] overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#68dbae]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#68dbae]">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{user?.name || 'Alex Morgan'}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Dispatch Commander</p>
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
        </header>

        {/* Console Hub (Triple Column Layout) */}
        <main className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-surface">
          {/* Left: Staff List Panel */}
          <section className="w-full md:w-80 flex-shrink-0 flex flex-col bg-surface-container-low border-r border-outline-variant/10">
            <div className="p-6 flex-shrink-0">
              <h3 className="text-white font-headline font-bold text-xl mb-4">Active Personnel</h3>
              <div className="flex gap-2 mb-6">
                <span className="bg-[#68dbae] text-[#003121] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">All (24)</span>
                <span className="bg-[#1b2129] text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-white border border-white/5">Security</span>
              </div>
            </div>
            
            {/* Scrollable list area */}
            <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
              {staffUnits.map((unit) => (
                <div 
                  key={unit.id} 
                  onClick={() => setSelectedStaff(selectedStaff === unit.id ? null : unit.id)} 
                  className={`p-4 rounded-xl transition-all cursor-pointer group border ${selectedStaff === unit.id ? 'bg-[#68dbae]/10 border-[#68dbae]/30 ring-1 ring-[#68dbae]/20' : 'bg-[#1b2129] border-white/5 hover:bg-[#31353c]'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[#68dbae] font-bold font-headline">{unit.name}</span>
                    <span className="text-[10px] text-[#68dbae] bg-[#68dbae]/10 px-2 py-0.5 rounded-full font-label uppercase">{unit.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>{unit.zone}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-1.5 w-24 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#68dbae]" style={{width: `${unit.progress}%`}}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">PATROL</span>
                  </div>
                  {selectedStaff === unit.id && (
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Shift Start</span>
                        <span className="text-white">06:00 AM</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Last Report</span>
                        <span className="text-[#68dbae]">2 min ago</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); navigate('/ops/incidents'); }} className="w-full mt-2 bg-[#10141a] text-[#68dbae] py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-[#31353c] transition-colors">
                        Assign Task
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Center: Tactical Map View */}
          <section className="flex-1 relative bg-surface-container-lowest overflow-hidden min-h-[300px] md:min-h-0">
            <Map
              defaultCenter={{ lat: 37.7788, lng: -122.3892 }}
              defaultZoom={17.5}
              mapId={import.meta.env.VITE_MAP_ID || 'ad392c68f6356614'}
              disableDefaultUI={true}
              colorScheme="DARK"
              className="w-full h-full"
            >
              {/* Unit Alpha 7 (Security) */}
              <AdvancedMarker position={{ lat: 37.7786, lng: -122.3893 }} title="Unit Alpha 7">
                 <Pin background={'#68dbae'} glyphColor={'#003121'} borderColor={'#fff'}>
                   <span className="material-symbols-outlined text-[14px]">shield</span>
                 </Pin>
              </AdvancedMarker>

              {/* Med-Unit 2 (Medical) */}
              <AdvancedMarker position={{ lat: 37.7790, lng: -122.3885 }} title="Med-Unit 2">
                 <Pin background={'#ff544e'} glyphColor={'#fff'} borderColor={'#fff'}>
                   <span className="material-symbols-outlined text-[14px]">medical_services</span>
                 </Pin>
              </AdvancedMarker>

              {/* Active Incidents */}
              {incidents.map((incident, idx) => {
                 const lat = 37.7788 + (idx * 0.0004) - 0.0008;
                 const lng = -122.3892 + (idx * 0.0004) - 0.0008;
                 return (
                   <AdvancedMarker key={`inc-${incident.id}`} position={{ lat, lng }}>
                     <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
                   </AdvancedMarker>
                 )
              })}
            </Map>

            {/* Map UI Overlays */}
            <div className="absolute inset-x-0 bottom-0 p-8 pointer-events-none z-10">
              <div className="flex justify-between items-end w-full">
                <div className="bg-[#10141a]/90 backdrop-blur-md p-4 rounded-2xl pointer-events-auto border border-white/10 shadow-2xl">
                  <h4 className="font-headline font-bold text-sm mb-1 text-[#68dbae]">Tactical Overlay Active</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-[#68dbae] rounded-full animate-pulse"></span>
                     Tracking Active Response Units
                  </p>
                </div>
                <button 
                  onClick={handleRecenter} 
                  className={`bg-[#1b2129] p-3 rounded-full border border-white/10 shadow-lg pointer-events-auto hover:bg-[#31353c] transition-all ${recentering ? 'text-[#68dbae] ring-2 ring-[#68dbae]/50 scale-110' : 'text-[#68dbae]'}`}
                >
                  <span className={`material-symbols-outlined ${recentering ? 'animate-spin' : ''}`}>center_focus_strong</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right: Dispatch Form */}
          <section className="hidden lg:flex w-96 flex-shrink-0 flex-col bg-[#10141a]/40 p-6 border-l border-[#3d4943]/10 overflow-y-auto">
            <h3 className="text-white font-headline font-bold text-xl mb-6">Dispatch New Task</h3>
            <DispatchForm
              onSubmit={handleDispatchSubmit}
              priority={priority} setPriority={setPriority}
              assignedTeam={assignedTeam} setAssignedTeam={setAssignedTeam}
              instructions={instructions} setInstructions={setInstructions}
              formErrors={formErrors} setFormErrors={setFormErrors}
              dispatchSuccess={dispatchSuccess}
            />
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="bg-[#1b2129] p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-[#68dbae]/10 rounded-full flex items-center justify-center text-[#68dbae]">
                  <span className="material-symbols-outlined">info</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">System Intelligence</p>
                  <p className="text-[10px] text-slate-500">Unit Alpha 7 is currently 120m from Gate 4 surged status.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Mobile Dispatch Panel */}
      {showMobileForm && (
        <div className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setShowMobileForm(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-[#1b2129] rounded-t-3xl border-t border-white/10 p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-white font-headline font-bold text-xl mb-6">Dispatch New Task</h3>
            <DispatchForm
              onSubmit={(e) => { handleDispatchSubmit(e); setTimeout(() => setShowMobileForm(false), 2500); }}
              priority={priority} setPriority={setPriority}
              assignedTeam={assignedTeam} setAssignedTeam={setAssignedTeam}
              instructions={instructions} setInstructions={setInstructions}
              formErrors={formErrors} setFormErrors={setFormErrors}
              dispatchSuccess={dispatchSuccess}
            />
          </div>
        </div>
      )}

      {/* Floating Action (Mobile Only) */}
      <button onClick={() => setShowMobileForm(true)} className="fixed bottom-24 right-6 md:hidden w-14 h-14 bg-[#68dbae] rounded-full shadow-2xl flex items-center justify-center text-[#10141a] z-50 active:scale-90 transition-transform">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}

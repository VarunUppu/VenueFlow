import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to correct dashboard
  React.useEffect(() => {
    if (user) navigate(user.role === 'staff' ? '/ops' : '/attendee', { replace: true });
  }, [user, navigate]);

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#0b0f14] flex flex-col items-center justify-center relative font-body py-10 sm:py-0">
      {/* Ambient background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#68dbae]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#26a37a]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-[#68dbae]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo */}
      <div className="mb-16 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#68dbae]/20 flex items-center justify-center border border-[#68dbae]/30">
            <span className="material-symbols-outlined text-[#68dbae] text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>stadium</span>
          </div>
          <h1 className="font-headline text-4xl font-black tracking-tight text-white">VenueFlow</h1>
        </div>
        <p className="text-slate-400 text-sm tracking-wide">Smart stadium crowd management</p>
      </div>

      {/* Role selection cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-6">
        
        {/* Staff Card */}
        <button
          onClick={() => navigate('/login?role=staff')}
          className="group relative overflow-hidden bg-[#1b2129] border border-white/5 rounded-3xl p-8 text-left hover:border-[#68dbae]/30 transition-all duration-300 hover:shadow-[0_0_60px_rgba(104,219,174,0.1)] active:scale-[0.98]"
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#68dbae]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#68dbae]/10 border border-[#68dbae]/20 flex items-center justify-center mb-6 group-hover:bg-[#68dbae]/20 transition-colors">
              <span className="material-symbols-outlined text-[#68dbae] text-3xl" style={{fontVariationSettings:"'FILL' 1"}}>badge</span>
            </div>
            <div className="mb-6">
              <h2 className="font-headline font-bold text-2xl text-white mb-2">For Staff</h2>
              <p className="text-slate-400 text-sm leading-relaxed">Access the command center — manage zones, dispatch personnel, and monitor incidents in real time.</p>
            </div>
            <div className="space-y-2">
              {['Zone & crowd management', 'Staff dispatch control', 'Incident reporting'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#68dbae] flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-2 text-[#68dbae] font-bold text-sm group-hover:gap-3 transition-all">
              <span>Staff Login</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </button>

        {/* Attendee Card */}
        <button
          onClick={() => navigate('/login?role=attendee')}
          className="group relative overflow-hidden bg-[#1b2129] border border-white/5 rounded-3xl p-8 text-left hover:border-[#68dbae]/30 transition-all duration-300 hover:shadow-[0_0_60px_rgba(104,219,174,0.1)] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#68dbae]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#68dbae]/10 border border-[#68dbae]/20 flex items-center justify-center mb-6 group-hover:bg-[#68dbae]/20 transition-colors">
              <span className="material-symbols-outlined text-[#68dbae] text-3xl" style={{fontVariationSettings:"'FILL' 1"}}>confirmation_number</span>
            </div>
            <div className="mb-6">
              <h2 className="font-headline font-bold text-2xl text-white mb-2">For Attendees</h2>
              <p className="text-slate-400 text-sm leading-relaxed">Navigate the venue with ease — find the best gates, explore dining options, and track wait times.</p>
            </div>
            <div className="space-y-2">
              {['Real-time queue & wait times', 'Food & beverage ordering', 'Live venue alerts'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#68dbae] flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-2 text-[#68dbae] font-bold text-sm group-hover:gap-3 transition-all">
              <span>Attendee Login</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </button>
      </div>

      {/* Demo credentials hint */}
      <div className="relative z-10 mt-10 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center max-w-sm mx-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Demo Accounts</p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-[#68dbae] font-bold">Staff</p>
            <p className="text-slate-400">staff@venueflow.com</p>
            <p className="text-slate-500">demo1234</p>
          </div>
          <div>
            <p className="text-[#68dbae] font-bold">Attendee</p>
            <p className="text-slate-400">attendee@venueflow.com</p>
            <p className="text-slate-500">demo1234</p>
          </div>
        </div>
      </div>

      <p className="relative z-10 text-slate-600 text-xs mt-8">
        © 2026 VenueFlow · Smart Crowd Intelligence
      </p>
    </div>
  );
}

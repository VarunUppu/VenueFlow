import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultRole = searchParams.get('role') === 'attendee' ? 'attendee' : 'staff';
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) navigate(user.role === 'staff' ? '/ops' : '/attendee', { replace: true });
  }, [user, navigate]);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      if (loggedIn.role !== role) {
        setApiError(`This account is registered as a ${loggedIn.role}. Please switch to the ${loggedIn.role} tab.`);
        setLoading(false);
        return;
      }
      navigate(loggedIn.role === 'staff' ? '/ops' : '/attendee', { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(role === 'staff' ? 'staff@venueflow.com' : 'attendee@venueflow.com');
    setPassword('demo1234');
    setErrors({});
    setApiError('');
  };

  return (
    /* h-screen + overflow-y-auto creates an internally-scrollable viewport,
       working around the global overflow:hidden on body */
    <div className="h-screen overflow-y-auto bg-[#0b0f14] font-body relative overflow-x-hidden">
      {/* Ambient blobs — smaller on mobile */}
      <div className="absolute top-0 right-0 w-[220px] sm:w-[500px] h-[220px] sm:h-[500px] bg-[#68dbae]/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[180px] sm:w-[400px] h-[180px] sm:h-[400px] bg-[#26a37a]/10 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-6 group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to home
        </button>

        <div className="bg-[#1b2129] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-5 sm:mb-7">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#68dbae]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#68dbae] text-base sm:text-lg" style={{fontVariationSettings:"'FILL' 1"}}>stadium</span>
            </div>
            <span className="font-headline font-black text-base sm:text-lg text-[#68dbae] tracking-tight">VenueFlow</span>
          </div>

          <h1 className="font-headline font-bold text-xl sm:text-2xl text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-5 sm:mb-7">Sign in to continue to your dashboard</p>

          {/* Role Toggle */}
          <div className="flex p-1 bg-[#10141a] rounded-xl mb-5 border border-white/5">
            {['staff', 'attendee'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setApiError(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-lg text-sm font-bold transition-all ${role === r ? 'bg-[#68dbae] text-[#10141a]' : 'text-slate-400 hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: role === r ? "'FILL' 1" : "'FILL' 0"}}>
                  {r === 'staff' ? 'badge' : 'confirmation_number'}
                </span>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-400 text-sm mt-0.5 flex-shrink-0">error</span>
              <p className="text-sm text-red-400 leading-snug">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
              <input
                type="text"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }}
                placeholder="you@example.com"
                className={`w-full bg-[#10141a] border rounded-xl text-white text-sm px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#68dbae] transition-all placeholder:text-slate-600 ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>{errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }}
                  placeholder="••••••••"
                  className={`w-full bg-[#10141a] border rounded-xl text-white text-sm px-4 py-3 pr-12 focus:outline-none focus:ring-1 focus:ring-[#68dbae] transition-all placeholder:text-slate-600 ${errors.password ? 'border-red-500/50' : 'border-white/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>{errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#68dbae] text-[#10141a] font-black py-3.5 sm:py-4 rounded-xl text-sm uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo autofill */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full mt-2.5 bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            Use Demo Credentials
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to={`/register?role=${role}`} className="text-[#68dbae] font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-6" />
      </div>
    </div>
  );
}

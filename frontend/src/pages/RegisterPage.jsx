import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultRole = searchParams.get('role') === 'attendee' ? 'attendee' : 'staff';
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [seat, setSeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) navigate(user.role === 'staff' ? '/ops' : '/attendee', { replace: true });
  }, [user, navigate]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required';
    else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (role === 'staff' && !badgeId.trim()) e.badgeId = 'Employee badge ID is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const newUser = await register({ name, email, password, role, badgeId, seat });
      navigate(newUser.role === 'staff' ? '/ops' : '/attendee', { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reusable field wrapper
  const Field = ({ label, error, required, children }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>{error}
        </p>
      )}
    </div>
  );

  const inputCls = (err) =>
    `w-full bg-[#10141a] border rounded-xl text-white text-sm px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#68dbae] transition-all placeholder:text-slate-600 ${err ? 'border-red-500/50' : 'border-white/10'}`;

  return (
    /* h-screen + overflow-y-auto scrolls within the locked viewport */
    <div className="h-screen overflow-y-auto bg-[#0b0f14] font-body relative overflow-x-hidden">
      {/* Ambient blobs — smaller on mobile */}
      <div className="absolute top-0 left-0 w-[200px] sm:w-[500px] h-[200px] sm:h-[500px] bg-[#68dbae]/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -translate-y-1/3 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-[180px] sm:w-[400px] h-[180px] sm:h-[400px] bg-[#26a37a]/10 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none translate-y-1/3 translate-x-1/3" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Back link */}
        <button
          onClick={() => navigate(`/login?role=${role}`)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-6 group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to sign in
        </button>

        <div className="bg-[#1b2129] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-5 sm:mb-7">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#68dbae]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#68dbae] text-base sm:text-lg" style={{fontVariationSettings:"'FILL' 1"}}>stadium</span>
            </div>
            <span className="font-headline font-black text-base sm:text-lg text-[#68dbae] tracking-tight">VenueFlow</span>
          </div>

          <h1 className="font-headline font-bold text-xl sm:text-2xl text-white mb-1">Create account</h1>
          <p className="text-slate-400 text-sm mb-5 sm:mb-7">Join VenueFlow and get started in seconds</p>

          {/* Role Toggle */}
          <div className="flex p-1 bg-[#10141a] rounded-xl mb-5 border border-white/5">
            {['staff', 'attendee'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setErrors({}); setApiError(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-lg text-sm font-bold transition-all ${role === r ? 'bg-[#68dbae] text-[#10141a]' : 'text-slate-400 hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: role === r ? "'FILL' 1" : "'FILL' 0"}}>
                  {r === 'staff' ? 'badge' : 'confirmation_number'}
                </span>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-400 text-sm mt-0.5 flex-shrink-0">error</span>
              <p className="text-sm text-red-400 leading-snug">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <Field label="Full Name" error={errors.name} required>
              <input
                type="text" autoComplete="name" value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: undefined})); }}
                placeholder="Jane Smith" className={inputCls(errors.name)}
              />
            </Field>

            {/* Email */}
            <Field label="Email" error={errors.email} required>
              <input
                type="text" autoComplete="email" value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }}
                placeholder="you@example.com" className={inputCls(errors.email)}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password} required>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }}
                  placeholder="Min. 8 characters"
                  className={`${inputCls(errors.password)} pr-12`}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPassword} required>
              <input
                type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: undefined})); }}
                placeholder="Repeat password" className={inputCls(errors.confirmPassword)}
              />
            </Field>

            {/* Role-specific fields */}
            {role === 'staff' && (
              <Field label="Employee / Badge ID" error={errors.badgeId} required>
                <input
                  type="text" value={badgeId}
                  onChange={e => { setBadgeId(e.target.value); setErrors(p => ({...p, badgeId: undefined})); }}
                  placeholder="e.g. VF-STAFF-042" className={inputCls(errors.badgeId)}
                />
              </Field>
            )}

            {role === 'attendee' && (
              <Field label="Seat Number">
                <input
                  type="text" value={seat} onChange={e => setSeat(e.target.value)}
                  placeholder="e.g. Block G · Row 12 · Seat 7"
                  className={inputCls(false)}
                />
              </Field>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#68dbae] text-[#10141a] font-black py-3.5 sm:py-4 rounded-xl text-sm uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="text-[#68dbae] font-bold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Bottom safe-area padding */}
        <div className="h-6" />
      </div>
    </div>
  );
}

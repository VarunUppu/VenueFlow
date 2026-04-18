import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Shape ────────────────────────────────────────────────────────────────────
// user: { id, name, email, role: 'staff'|'attendee', zone, badgeId, seat, joinedAt }

const AuthContext = createContext(null);

// ─── Simple SHA-256 hash (Web Crypto API) ─────────────────────────────────────
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
const USERS_KEY = 'vf_users';
const SESSION_KEY = 'vf_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function saveSession(user) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

// ─── Seed demo accounts (run once on first load) ──────────────────────────────
async function seedDemoAccounts() {
  const existing = getUsers();
  const hasStaff = existing.some(u => u.email === 'staff@venueflow.com');
  const hasAttendee = existing.some(u => u.email === 'attendee@venueflow.com');
  
  const toAdd = [];
  if (!hasStaff) {
    toAdd.push({
      id: 'demo-staff-001',
      name: 'Alex Morgan',
      email: 'staff@venueflow.com',
      passwordHash: await hashPassword('demo1234'),
      role: 'staff',
      zone: 'Stadium East Wing',
      badgeId: 'VF-STAFF-001',
      seat: null,
      joinedAt: new Date('2025-01-01').toISOString(),
    });
  }
  if (!hasAttendee) {
    toAdd.push({
      id: 'demo-attendee-001',
      name: 'Guest User',
      email: 'attendee@venueflow.com',
      passwordHash: await hashPassword('demo1234'),
      role: 'attendee',
      zone: 'North Stand',
      badgeId: null,
      seat: 'Block G · Row 12 · Seat 7',
      joinedAt: new Date('2026-03-15').toISOString(),
    });
  }
  if (toAdd.length) saveUsers([...existing, ...toAdd]);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());

  // Seed demo accounts asynchronously on startup
  React.useEffect(() => { seedDemoAccounts(); }, []);

  const login = useCallback(async (email, password) => {
    const users = getUsers();
    const hash = await hashPassword(password);
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hash);
    if (!found) throw new Error('Invalid email or password.');
    // Strip the hash before storing in session
    const { passwordHash: _, ...safeUser } = found;
    saveSession(safeUser);
    setUser(safeUser);
    return safeUser;
  }, []);

  const register = useCallback(async ({ name, email, password, role, badgeId, seat }) => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: await hashPassword(password),
      role,
      zone: role === 'staff' ? 'Stadium East Wing' : 'North Stand',
      badgeId: role === 'staff' ? (badgeId?.trim() || `VF-${Date.now()}`) : null,
      seat: role === 'attendee' ? (seat?.trim() || 'Unassigned') : null,
      joinedAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const { passwordHash: _, ...safeUser } = newUser;
    saveSession(safeUser);
    setUser(safeUser);
    return safeUser;
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user?.id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    const { passwordHash: _, ...safeUser } = users[idx];
    saveSession(safeUser);
    setUser(safeUser);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

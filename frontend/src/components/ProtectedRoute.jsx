import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route and redirects to /login if not authenticated.
 * If requiredRole is given, also checks the user's role matches.
 * Staff trying to hit /attendee/* gets sent to /ops, and vice versa.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Preserve the intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Wrong role — send to their correct home
    return <Navigate to={user.role === 'staff' ? '/ops' : '/attendee'} replace />;
  }

  return children;
}

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * AuthGuard strictly enforces authentication and role-based access control (RBAC).
 * - If not logged in -> redirects to /login.
 * - If logged in but role is unauthorized -> strictly denies access and redirects to the user's authorized portal.
 */
export function AuthGuard({ children, allowedRoles }) {
  const location = useLocation();
  const session = localStorage.getItem('grabit_session');

  if (!session) {
    // Not logged in -> Redirect to /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strict role verification
  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const userStr = localStorage.getItem('grabit_user');
      if (!userStr) {
        // Missing user details -> clear invalid session and redirect to /login
        localStorage.removeItem('grabit_session');
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      const user = JSON.parse(userStr);
      const userRole = user?.role;

      // If user has no role or role is not in allowedRoles list
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect strictly to their authorized home/portal
        if (userRole === 'admin') return <Navigate to="/admin" replace />;
        if (userRole === 'seller') return <Navigate to="/seller/dashboard" replace />;
        if (userRole === 'delivery_agent') return <Navigate to="/delivery/dashboard" replace />;
        // Default customer or unauthorized role
        return <Navigate to="/" replace />;
      }
    } catch {
      localStorage.removeItem('grabit_session');
      localStorage.removeItem('grabit_user');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
}

/**
 * PublicOnlyGuard ensures logged-in users on /login are redirected to their portal,
 * while allowing unauthenticated visitors to log in.
 */
export function PublicOnlyGuard({ children }) {
  const session = localStorage.getItem('grabit_session');

  if (session) {
    try {
      const userStr = localStorage.getItem('grabit_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
        if (user.role === 'delivery_agent') return <Navigate to="/delivery/dashboard" replace />;
        return <Navigate to="/" replace />;
      }
    } catch {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AuthGuard;

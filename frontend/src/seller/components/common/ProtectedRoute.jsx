import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const session = localStorage.getItem('grabit_session');
  const userStr = localStorage.getItem('grabit_user');

  if (!session || !userStr) {
    // Remember where the user was trying to go so we can redirect back after login
    sessionStorage.setItem('grabit_intended_path', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      sessionStorage.setItem('grabit_intended_path', window.location.pathname);
      return <Navigate to="/login" replace />;
    }
  } catch {
    sessionStorage.setItem('grabit_intended_path', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

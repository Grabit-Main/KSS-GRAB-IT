import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const session = localStorage.getItem('grabit_session');
  const userStr = localStorage.getItem('grabit_user');

  if (!session || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      if (user?.role === 'delivery_agent') return <Navigate to="/delivery/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

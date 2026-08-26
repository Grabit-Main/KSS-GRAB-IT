import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const session = localStorage.getItem('grabit_session');
  const userStr = localStorage.getItem('grabit_user');

  if (!session || !userStr) {
    return <Navigate to="/seller/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return <Navigate to="/seller/login" replace />;
    }
  } catch {
    return <Navigate to="/seller/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

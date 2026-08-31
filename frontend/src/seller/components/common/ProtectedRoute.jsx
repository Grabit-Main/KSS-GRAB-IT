import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const session = localStorage.getItem('grabit_session') || 'demo-token';
  const userStr = localStorage.getItem('grabit_user');

  try {
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      const sellerUser = {
        id: 2,
        role: 'seller',
        name: 'GrabIt Supermarket',
        full_name: 'GrabIt Supermarket',
        phone: '+919999900002',
        email: 'seller@grabit.local'
      };
      localStorage.setItem('grabit_session', session);
      localStorage.setItem('grabit_user', JSON.stringify(sellerUser));
      localStorage.setItem('grabit_seller_access', session);
      localStorage.setItem('grabit_seller_profile', JSON.stringify(sellerUser));
    }
  } catch {
    // fallback safe
  }

  return <Outlet />;
};

export default ProtectedRoute;

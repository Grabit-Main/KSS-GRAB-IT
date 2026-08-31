import React, { createContext, useContext, useState, useEffect } from 'react';

const SellerAuthContext = createContext(null);

export const SellerAuthProvider = ({ children }) => {
  const [seller, setSeller] = useState(() => {
    try {
      const userStr = localStorage.getItem('grabit_user');
      const session = localStorage.getItem('grabit_session');
      if (userStr && session) {
        const u = JSON.parse(userStr);
        if (u.role === 'seller' || u.role === 'admin') {
          return {
            id: u.id || 1,
            email: u.email || '',
            store_name: u.store_name || u.full_name || u.name || 'Seller Store',
            phone: u.phone || '',
            business_address: u.business_address || '',
            status: 'approved',
            role: u.role,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('grabit_user');
      const session = localStorage.getItem('grabit_session') || 'demo-token';
      const u = userStr ? JSON.parse(userStr) : null;
      if (!u || (u.role !== 'seller' && u.role !== 'admin')) {
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
        setSeller({
          id: 2,
          email: 'seller@grabit.local',
          store_name: 'GrabIt Supermarket',
          phone: '+919999900002',
          business_address: 'GrabIt Flagship, Koramangala',
          status: 'approved',
          role: 'seller',
        });
      } else {
        setSeller({
          id: u.id || 2,
          email: u.email || 'seller@grabit.local',
          store_name: u.store_name || u.full_name || u.name || 'GrabIt Supermarket',
          phone: u.phone || '+919999900002',
          business_address: u.business_address || 'GrabIt Flagship, Koramangala',
          status: 'approved',
          role: u.role,
        });
      }
    } catch {
      setSeller(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('grabit_session');
    localStorage.removeItem('grabit_user');
    localStorage.removeItem('grabit_seller_access');
    setSeller(null);
  };

  const value = {
    seller,
    loading,
    isAuthenticated: !!seller,
    logout,
  };

  return (
    <SellerAuthContext.Provider value={value}>
      {children}
    </SellerAuthContext.Provider>
  );
};

export const useSellerAuth = () => {
  const context = useContext(SellerAuthContext);
  if (!context) {
    throw new Error('useSellerAuth must be used within a SellerAuthProvider');
  }
  return context;
};

export default SellerAuthProvider;

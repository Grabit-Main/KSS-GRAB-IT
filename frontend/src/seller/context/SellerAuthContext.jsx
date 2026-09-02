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
      const session = localStorage.getItem('grabit_session');
      if (userStr && session) {
        const u = JSON.parse(userStr);
        if (u.role === 'seller' || u.role === 'admin') {
          setSeller({
            id: u.id || 1,
            email: u.email || '',
            store_name: u.store_name || u.full_name || u.name || 'Seller Store',
            phone: u.phone || '',
            business_address: u.business_address || '',
            status: 'approved',
            role: u.role,
          });
        } else {
          setSeller(null);
        }
      } else {
        setSeller(null);
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

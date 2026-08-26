import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Truck, Store, KeyRound, Layers, ChevronUp, ChevronDown } from 'lucide-react';

export function PortalSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const currentPath = location.pathname;
  const isDelivery = currentPath.startsWith('/delivery') || currentPath.startsWith('/dashboard') || currentPath.startsWith('/active-delivery');
  const isSeller = currentPath.startsWith('/seller');
  const isLogin = currentPath === '/login';
  const isCustomer = !isDelivery && !isSeller && !isLogin;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: collapsed ? '8px 14px' : '10px 14px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 0,
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '700',
            padding: '4px 6px',
          }}
          title="Toggle Portal Switcher"
        >
          <Layers size={15} color="#38BDF8" />
          <span style={{ color: '#F8FAFC' }}>Switch Portal</span>
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: isCustomer ? '#0066FF' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 0,
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
              }}
            >
              <ShoppingBag size={13} /> Customer Store
            </button>

            <button
              type="button"
              onClick={() => navigate('/delivery/dashboard')}
              style={{
                background: isDelivery ? '#10B981' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 0,
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
              }}
            >
              <Truck size={13} /> Delivery Agent
            </button>

            <button
              type="button"
              onClick={() => navigate('/seller/dashboard')}
              style={{
                background: isSeller ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 0,
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
              }}
            >
              <Store size={13} /> Seller Portal
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: isLogin ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 0,
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
              }}
            >
              <KeyRound size={13} /> Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortalSwitcher;

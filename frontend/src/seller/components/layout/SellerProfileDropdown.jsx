import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Store,
  ChevronDown,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Package,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { useSellerAuth } from '../../context/SellerAuthContext';
import { useToast } from '../../context/ToastContext';
import { logoutUser } from '../../../api';

export const SellerProfileDropdown = () => {
  const { seller, logout } = useSellerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    logoutUser();
    showToast({ type: 'info', message: 'Signed out of Seller Portal.' });
    navigate('/login', { replace: true });
  };

  const handleSwitchPortal = (role, path) => {
    setIsOpen(false);
    if (role === 'customer') {
      const userObj = {
        id: 4,
        role: 'customer',
        name: 'Rahul Sharma',
        full_name: 'Rahul Sharma',
        phone: '+919999900004',
        email: 'customer@grabit.local'
      };
      localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      navigate('/');
    } else if (role === 'delivery_agent') {
      const userObj = {
        id: 3,
        role: 'delivery_agent',
        name: 'Speedy Express Delivery',
        full_name: 'Speedy Express Delivery',
        phone: '+919999900003',
        email: 'rider@grabit.local'
      };
      localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      navigate('/delivery/dashboard');
    } else if (role === 'admin') {
      const userObj = {
        id: 1,
        role: 'admin',
        name: 'Admin Supervisor',
        full_name: 'Admin Supervisor',
        phone: '+919999900001',
        email: 'admin@grabit.local'
      };
      localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      localStorage.setItem('grabit_seller_access', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_seller_profile', JSON.stringify(userObj));
      navigate('/admin');
    }
  };

  const storeName = seller?.store_name || seller?.full_name || seller?.name || 'Seller Store';
  const initial = storeName.charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Seller Profile Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="seller-profile-trigger-btn"
        title="Seller Profile & Account Options"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 10px 4px 5px',
          borderRadius: '24px',
          border: isOpen ? '1.5px solid #0071E3' : '1px solid #CBD5E1',
          backgroundColor: isOpen ? '#EFF6FF' : '#FFFFFF',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Avatar Circle */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0071E3 0%, #0284C7 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,113,227,0.3)',
            position: 'relative',
          }}
        >
          {initial}
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '1.5px solid #FFFFFF',
            }}
          />
        </div>

        {/* Store Name label on desktop */}
        <span
          className="seller-profile-btn-name"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#0F172A',
            maxWidth: 120,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {storeName}
        </span>

        <ChevronDown
          size={14}
          color="#64748B"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Profile Dropdown Popup Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 270,
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E2E8F0',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'modalSlideUpMobile 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header Card */}
          <div style={{ padding: '16px 16px 14px', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0071E3 0%, #0284C7 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,113,227,0.25)',
                }}
              >
                {initial}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {storeName}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{seller?.phone || '+91 99999 00002'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px dashed #CBD5E1' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={11} color="#059669" /> VERIFIED MERCHANT
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>
                ID: VENDOR-892
              </span>
            </div>
          </div>

          {/* Quick Actions List */}
          <div style={{ padding: '8px' }}>
            <div style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Store Management
            </div>

            <button
              type="button"
              onClick={() => { setIsOpen(false); navigate('/seller/profile'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: '10px', border: 'none', background: 'none',
                color: '#1E293B', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <User size={16} color="#8B5CF6" />
              <span>Store Profile & Settings</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsOpen(false); navigate('/seller/products'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: '10px', border: 'none', background: 'none',
                color: '#1E293B', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Package size={16} color="#0071E3" />
              <span>Products & Inventory</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsOpen(false); navigate('/seller/orders'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: '10px', border: 'none', background: 'none',
                color: '#1E293B', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <ShoppingBag size={16} color="#059669" />
              <span>Live Fulfillment Queue</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyBetween: 'space-between',
                padding: '9px 10px', borderRadius: '10px', border: 'none', background: 'none',
                color: '#1E293B', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                textDecoration: 'none', boxSizing: 'border-box', transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Store size={16} color="#D97706" />
                <span>Customer Storefront</span>
              </div>
              <ExternalLink size={12} color="#94A3B8" style={{ marginLeft: 'auto' }} />
            </a>
          </div>

          <div style={{ height: 1, backgroundColor: '#E2E8F0', margin: '0 8px' }} />

          {/* Switch Role / Portal Section */}
          <div style={{ padding: '8px' }}>
            <div style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Switch Portal
            </div>

            <button
              type="button"
              onClick={() => handleSwitchPortal('customer', '/')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: '10px', border: 'none', background: 'none',
                color: '#334155', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <ShoppingBag size={15} color="#34C759" />
              <span>Customer App</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchPortal('delivery_agent', '/delivery/dashboard')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: '10px', border: 'none', background: 'none',
                color: '#334155', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Truck size={15} color="#06B6D4" />
              <span>Delivery Partner Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchPortal('admin', '/admin')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: '10px', border: 'none', background: 'none',
                color: '#334155', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <ShieldCheck size={15} color="#8B5CF6" />
              <span>Admin Console</span>
            </button>
          </div>

          {/* Footer Sign Out Button */}
          <div style={{ padding: 8, background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '9px 12px', borderRadius: '10px', border: '1px solid #FECACA',
                background: '#FEF2F2', color: '#EF4444', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; }}
            >
              <LogOut size={15} color="#EF4444" strokeWidth={2} />
              <span>Sign Out of Seller Portal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfileDropdown;

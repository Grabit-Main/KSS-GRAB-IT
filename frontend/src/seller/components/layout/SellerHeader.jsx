import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogIn, ShoppingCart, Bike, KeyRound, X } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
const grabitLogoImg = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

export const SellerHeader = ({ onMenuClick, title = 'Seller Overview' }) => {
  const navigate = useNavigate();
  const [showPortalModal, setShowPortalModal] = useState(false);

  const [isOnline, setIsOnline] = useState(() => {
    const s = localStorage.getItem('grabit_store_status');
    return s !== 'paused';
  });

  const toggleStoreStatus = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    localStorage.setItem('grabit_store_status', nextState ? 'online' : 'paused');
    window.dispatchEvent(new Event('grabit_store_status_updated'));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <header className="seller-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '56px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 1 }}>


          {/* Grabit Logo */}
          <Link
            to="/seller/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              flexShrink: 0,
              lineHeight: 0,
            }}
          >
            <img
              src={grabitLogoImg}
              alt="Grabit"
              className="header-brand-logo"
              style={{
                height: 40,
                width: 'auto',
                maxHeight: 44,
                maxWidth: 150,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>

          {/* Subtle Separator */}
          <span
            className="seller-header-separator"
            style={{
              width: 1,
              height: 18,
              backgroundColor: '#CBD5E1',
              display: 'inline-block',
              margin: '0 4px',
            }}
          />

          {/* Page Title */}
          <h1
            className="seller-header-title"
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.3px',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Executive Live Store Status Interactive Switch */}
          <button
            type="button"
            onClick={toggleStoreStatus}
            title={isOnline ? 'Store status: Online & Active (Accepting customer orders). Click to pause.' : 'Store status: Temporarily Paused. Click to turn online.'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isOnline ? '#F0FDF4' : '#FFFBEB',
              border: isOnline ? '1.5px solid #86EFAC' : '1.5px solid #FCD34D',
              borderRadius: '9999px',
              padding: '5px 12px 5px 9px',
              fontSize: '12px',
              fontWeight: 800,
              color: isOnline ? '#15803D' : '#B45309',
              cursor: 'pointer',
              boxShadow: isOnline ? '0 2px 8px rgba(34, 197, 94, 0.15)' : '0 2px 8px rgba(245, 158, 11, 0.12)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = isOnline ? '0 4px 12px rgba(34, 197, 94, 0.22)' : '0 4px 12px rgba(245, 158, 11, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isOnline ? '0 2px 8px rgba(34, 197, 94, 0.15)' : '0 2px 8px rgba(245, 158, 11, 0.12)';
            }}
          >
            {/* Live Indicator Dot with Pulse Halo */}
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '10px',
                height: '10px',
              }}
            >
              {isOnline && (
                <span
                  style={{
                    position: 'absolute',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#22C55E',
                    opacity: 0.6,
                    animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />
              )}
              <span
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '7.5px',
                  height: '7.5px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#16A34A' : '#D97706',
                  boxShadow: isOnline ? '0 0 5px #16A34A' : 'none',
                }}
              />
            </span>

            <span style={{ letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
              {isOnline ? 'Active' : 'Paused'}
            </span>
          </button>

          {/* Portal Switcher / Exit Button */}
          <button
            type="button"
            onClick={() => setShowPortalModal(true)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 113, 227, 0.1)',
              cursor: 'pointer',
              color: '#0071E3',
              padding: 0,
              transition: 'all 0.15s ease',
            }}
            title="Switch Portals & Login"
          >
            <LogIn size={17} color="#0071E3" />
          </button>

          {/* Interactive Notification Dropdown */}
          <NotificationDropdown />
        </div>
      </header>

      {/* 🔐 CONFIRMATION MODAL BEFORE REDIRECTING TO LOGIN */}
      {showPortalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowPortalModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPortalModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: '#0071E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                border: '1.5px solid #BFDBFE',
              }}
            >
              <LogIn size={24} color="#0071E3" />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Redirect to Login Page?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to open the Login & Authentication portal?
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPortalModal(false)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPortalModal(false);
                  navigate('/login');
                }}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  background: '#0071E3',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,113,227,0.3)',
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

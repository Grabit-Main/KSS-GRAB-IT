import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { AgentStatusPill } from './AgentStatusPill';
import {
  LayoutDashboard,
  Navigation,
  History,
  BarChart2,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { logoutUser } from '../../api';

export const Sidebar: React.FC = () => {
  const { state, resetDemo, unreadCount } = useDelivery();
  const { agentStatus } = state;
  const navigate = useNavigate();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const navItems = [
    { to: '/delivery/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      to: '/delivery/active-delivery',
      label: 'Active Delivery',
      icon: Navigation,
      hasActiveOrder: agentStatus === 'ON_DELIVERY'
    },
    { to: '/delivery/delivery-history', label: 'History', icon: History },
    { to: '/delivery/performance', label: 'Performance', icon: BarChart2 },
    {
      to: '/delivery/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { to: '/delivery/support', label: 'Support', icon: HelpCircle },
    { to: '/delivery/settings', label: 'Settings', icon: Settings },
    { to: '/delivery/profile', label: 'Profile', icon: User }
  ];

  const handleSignOut = () => {
    resetDemo();
    setShowSignOutConfirm(false);
    logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Desktop Left Frosted Glass Sidebar (>=760px) */}
      <aside className="app-sidebar">
        {/* Brand & Logo Section */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--glass-border-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            <img
              src="https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png"
              alt="GrabIt Logo"
              style={{
                height: '52px',
                width: 'auto',
                maxWidth: '200px',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-blue)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              Delivery Partner Portal
            </div>
          </div>

          {/* Quick Agent Status Pill */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <AgentStatusPill />
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} />
                  {item.hasActiveOrder && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-blue)',
                        border: '1.5px solid #FFFFFF',
                        boxShadow: '0 0 6px rgba(0, 113, 227, 0.7)'
                      }}
                    />
                  )}
                </div>

                <span style={{ flex: 1 }}>{item.label}</span>

                {item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: 'var(--color-red)',
                      color: '#FFFFFF',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(255, 59, 48, 0.35)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Sign Out Bar */}
        <div style={{ padding: '14px', borderTop: '1px solid var(--glass-border-subtle)' }}>
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="sidebar-signout-btn"
          >
            <LogOut size={16} color="var(--color-red)" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sign Out Confirmation Modal (Level 3 Glass) */}
      {showSignOutConfirm && (
        <div className="modal-overlay" style={{ padding: '16px' }}>
          <div
            className="modal-content glass-strong"
            style={{
              maxWidth: '400px',
              padding: '26px',
              borderRadius: '24px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 59, 48, 0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid rgba(255, 59, 48, 0.25)'
              }}
            >
              <LogOut size={24} color="var(--color-red)" />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--color-graphite)', margin: '0 0 8px' }}>
              Sign Out from Portal?
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-soft-gray)', margin: '0 0 22px', lineHeight: '1.4' }}>
              Signing out will end your active session and return you to the login screen.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="btn-secondary"
                style={{ padding: '12px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="btn-danger-solid"
                style={{ padding: '12px' }}
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

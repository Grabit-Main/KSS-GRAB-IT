import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { state, unreadCount } = useDelivery();
  const { agentStatus, currentOrder } = state;

  const isVerifiedRider = true;

  const isOnDeliveryWithOrder = isVerifiedRider && agentStatus === 'ON_DELIVERY' && currentOrder !== null;

  const navItems = [
    { to: '/delivery/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      to: '/delivery/active-delivery',
      label: 'Active Delivery',
      icon: Navigation,
      hasActiveOrder: isOnDeliveryWithOrder
    },
    { to: '/delivery/delivery-history', label: 'History', icon: History },
    {
      to: '/delivery/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { to: '/delivery/settings', label: 'Settings', icon: Settings },
    { to: '/delivery/profile', label: 'Profile', icon: User }
  ];

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
                        top: '-3px',
                        right: '-3px',
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
      </aside>
    </>
  );
};

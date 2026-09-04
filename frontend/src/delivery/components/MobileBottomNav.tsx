import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import {
  Home,
  Bike,
  User,
  History,
  Calendar
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { state } = useDelivery();
  const { agentStatus, currentOrder } = state;

  const isVerifiedRider = true;

  const isOnDeliveryWithOrder = isVerifiedRider && agentStatus === 'ON_DELIVERY' && currentOrder !== null;

  const mainTabs = [
    { to: '/delivery/dashboard', label: 'Dashboard', icon: Home },
    {
      to: '/delivery/active-delivery',
      label: 'Active Order',
      icon: Bike,
      hasActiveOrder: isOnDeliveryWithOrder
    },
    { to: '/delivery/attendance', label: 'Attendance', icon: Calendar },
    { to: '/delivery/delivery-history', label: 'History', icon: History },
    { to: '/delivery/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {mainTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} />
              {tab.hasActiveOrder && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-4px',
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
            <span style={{ fontSize: '11px', marginTop: '2px' }}>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { mockDb } from '../../services/mockData';

export const MobileBottomNav = () => {
  const pendingOrdersCount = (mockDb.getOrders() || []).filter(
    (o) => o.status === 'preparing' || o.status === 'ready'
  ).length;

  const navItems = [
    { label: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
    { label: 'Categories', path: '/seller/categories', icon: FolderTree },
    { label: 'Products', path: '/seller/products', icon: Package },
    { label: 'Live Orders', path: '/seller/orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #E5E5EA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 6px calc(env(safe-area-inset-bottom, 0px) + 2px)',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              textDecoration: 'none',
              color: isActive ? 'var(--color-blue)' : '#8E8E93',
              position: 'relative',
              transition: 'color 0.15s ease, transform 0.15s ease',
              padding: '4px 0',
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    color={isActive ? 'var(--color-blue)' : '#8E8E93'}
                  />
                  {item.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -3,
                        right: -7,
                        backgroundColor: 'var(--color-red)',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 800,
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid #FFFFFF',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 500,
                    marginTop: 3,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      width: 24,
                      height: 3,
                      borderRadius: '0 0 3px 3px',
                      backgroundColor: 'var(--color-blue)',
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

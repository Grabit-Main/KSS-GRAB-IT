import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingBag,
  Store,
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useSellerAuth } from '../../context/SellerAuthContext';
import { useToast } from '../../context/ToastContext';
import { logoutUser } from '../../../api';
const grabitLogoImg = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

export const SellerSidebar = ({ isOpen, onClose }) => {
  const { seller, logout } = useSellerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    logoutUser();
    showToast({ type: 'info', message: 'You have been logged out successfully.' });
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
    { label: 'Categories', path: '/seller/categories', icon: FolderTree },
    { label: 'Products', path: '/seller/products', icon: Package },
    { label: 'Live Orders', path: '/seller/orders', icon: ShoppingBag },
  ];

  return (
    <aside className={`seller-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="seller-sidebar-header" style={{ padding: '20px 20px 14px', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <img
            src={grabitLogoImg}
            alt="Grabit"
            style={{ height: '52px', width: 'auto', maxWidth: '200px', objectFit: 'contain' }}
          />
          <button
            type="button"
            onClick={onClose}
            className="seller-mobile-close-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: 4,
              color: 'var(--color-graphite)',
              cursor: 'pointer',
            }}
            title="Close Menu"
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingLeft: 2 }}>
          <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            Vendor Dashboard
          </span>
          <span style={{ fontSize: '10px', backgroundColor: 'var(--color-green-light)', color: 'var(--color-green)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
            PARTNER
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="seller-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `seller-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    backgroundColor: 'var(--color-warm-white)',
                    borderRadius: '4px',
                    color: 'var(--color-soft-gray)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="seller-sidebar-footer">
        <div className="seller-profile-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div className="seller-profile-avatar">
              {seller?.store_name ? seller.store_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-graphite)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {seller?.store_name || 'My Store'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-green)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                Active Vendor
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-icon btn-secondary"
            title="Log Out"
            style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)' }}
          >
            <LogOut size={13} color="var(--color-soft-gray)" />
          </button>
        </div>
      </div>
    </aside>
  );
};

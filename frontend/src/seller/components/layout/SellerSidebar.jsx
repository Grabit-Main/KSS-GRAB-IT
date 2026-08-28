import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingBag,
  Store,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import { useSellerAuth } from '../../context/SellerAuthContext';
import { useToast } from '../../context/ToastContext';
import { logoutUser } from '../../../api';
const grabitLogoImg = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

const isValidRealOrder = (o) => {
  if (!o) return false;
  const addr = (o.delivery_address || o.address || '').trim().toLowerCase();
  if (!addr || addr === 'enter your delivery address' || addr.length < 5) return false;
  const custName = (o.customer_name || '').trim().toLowerCase();
  if (custName.includes('fresh mart supermarket')) return false;
  let itemsList = [];
  if (Array.isArray(o.items)) itemsList = o.items;
  else if (typeof o.items === 'string') {
    try { itemsList = JSON.parse(o.items); } catch {}
  }
  if (!Array.isArray(itemsList) || itemsList.length === 0) return false;
  const total = Number(o.total_amount || o.total || 0);
  if (total <= 0) return false;
  return true;
};

const isPackingQueueOrder = (o) => {
  if (!isValidRealOrder(o)) return false;
  const st = String(o.status || '').toLowerCase();
  if (st === 'delivered' || st === 'cancelled' || st === 'out_for_delivery' || st === 'out-for-delivery') {
    return false;
  }
  if (o.delivery_agent_id) return false;
  return ['placed', 'preparing', 'ready', 'ready_for_pickup'].includes(st);
};

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

  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    const calculateCount = () => {
      try {
        const sharedOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        const activeShared = sharedOrders.filter(isPackingQueueOrder);
        setPendingCount(activeShared.length);
      } catch {
        setPendingCount(0);
      }
    };

    calculateCount();
    window.addEventListener('storage', calculateCount);
    window.addEventListener('grabit_orders_updated', calculateCount);
    const interval = setInterval(calculateCount, 1000);

    return () => {
      window.removeEventListener('storage', calculateCount);
      window.removeEventListener('grabit_orders_updated', calculateCount);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
    { label: 'Products & Stock', path: '/seller/products', icon: Package },
    { label: 'Live Orders', path: '/seller/orders', icon: ShoppingBag, badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Categories', path: '/seller/categories', icon: FolderTree },
    { label: 'Store Profile', path: '/seller/profile', icon: User },
  ];

  return (
    <aside className={`seller-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="seller-sidebar-header" style={{ padding: '20px 20px 14px', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <img
            src={grabitLogoImg}
            alt="Grabit"
            style={{ height: '44px', width: 'auto', maxWidth: '180px', objectFit: 'contain' }}
          />
          <button
            type="button"
            onClick={onClose}
            className="seller-mobile-close-btn"
            style={{
              background: '#F1F5F9',
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: '50%',
              color: '#0F172A',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close Menu"
          >
            <X size={16} strokeWidth={2.5} />
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
            type="button"
            onClick={handleLogout}
            title="Log Out of Seller Portal"
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              color: '#EF4444',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; }}
          >
            <LogOut size={15} color="#EF4444" strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
};

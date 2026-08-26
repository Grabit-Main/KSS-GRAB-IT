import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  ShoppingBag,
  AlertTriangle,
  Package,
  Truck,
  Sparkles,
  Inbox
} from 'lucide-react';
import { get } from '../../../api';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Dynamically build real-time notifications from active orders and inventory
  const syncLiveNotifications = useCallback(async () => {
    try {
      let orders = [];
      try {
        const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        orders = stored;
      } catch {}

      let prods = [];
      try {
        const res = await get('/products/');
        if (Array.isArray(res)) prods = res;
      } catch {}

      const realNotifs = [];

      // 1. Real Order Notifications
      orders.forEach((o, idx) => {
        const itemNames = (o.items || []).map((it) => `${it.qty || 1}x ${it.name}`).join(', ') || 'Grocery items';
        const isPreparing = o.status === 'preparing' || o.status === 'placed';
        realNotifs.push({
          id: `order-${o.id || o.rawId || idx}`,
          type: 'order',
          title: `New Order #${o.id || `GB-${idx + 1000}`}`,
          message: `${itemNames} • ₹${o.total_amount || o.total || 0} (${o.customer_name || 'Customer'})`,
          time: o.date ? `${o.date} ${o.time || ''}` : 'Just now',
          unread: isPreparing,
          link: '/seller/orders',
        });
      });

      // 2. Real Low Stock Alerts from catalog
      prods.forEach((p) => {
        const stockNum = parseInt(p.stock || p.stock_quantity, 10);
        if (!isNaN(stockNum) && stockNum === 0) {
          realNotifs.push({
            id: `stock-out-${p.id}`,
            type: 'out_of_stock',
            title: 'Out of Stock Alert',
            message: `${p.name} has 0 units left in inventory.`,
            time: 'Inventory Alert',
            unread: true,
            link: '/seller/products',
          });
        } else if (!isNaN(stockNum) && stockNum > 0 && stockNum <= 5) {
          realNotifs.push({
            id: `stock-low-${p.id}`,
            type: 'low_stock',
            title: `Low Stock: ${stockNum} Left`,
            message: `${p.name} is running critically low.`,
            time: 'Inventory Alert',
            unread: false,
            link: '/seller/products',
          });
        }
      });

      setNotifications(realNotifs);
    } catch (e) {
      console.warn('Failed to sync live notifications:', e);
    }
  }, []);

  useEffect(() => {
    syncLiveNotifications();
    window.addEventListener('storage', syncLiveNotifications);
    window.addEventListener('grabit_orders_updated', syncLiveNotifications);
    const interval = setInterval(syncLiveNotifications, 3000);

    return () => {
      window.removeEventListener('storage', syncLiveNotifications);
      window.removeEventListener('grabit_orders_updated', syncLiveNotifications);
      clearInterval(interval);
    };
  }, [syncLiveNotifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => n.unread)
      : notifications;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="notification-trigger-btn"
        title="Store Notifications & Live Alerts"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: isOpen ? '1.5px solid #0071E3' : '1px solid #E2E8F0',
          backgroundColor: isOpen ? '#EFF6FF' : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Bell size={18} color={isOpen ? '#0071E3' : '#475569'} />

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10.5px',
              fontWeight: 800,
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Notification Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 0,
            width: 360,
            maxHeight: 480,
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'modalSlideIn 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Store Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  fontSize: '11.5px',
                  color: '#0071E3',
                  fontWeight: 700,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                }}
                title="Mark all as read"
              >
                <CheckCheck size={13} /> Mark read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: activeTab === 'all' ? '#0F172A' : '#F1F5F9',
                  color: activeTab === 'all' ? '#FFFFFF' : '#64748B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: activeTab === 'unread' ? '#0F172A' : '#F1F5F9',
                  color: activeTab === 'unread' ? '#FFFFFF' : '#64748B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ overflowY: 'auto', maxHeight: 320 }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#94A3B8' }}>
                  <Inbox size={22} />
                </div>
                <p style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>No new notifications</p>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  Real-time alerts for customer orders and low stock will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: item.unread ? '#F0F7FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = item.unread ? '#E0EFFF' : '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.unread ? '#F0F7FF' : '#FFFFFF')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: item.unread ? 800 : 700, color: '#0F172A', lineHeight: 1.3 }}>
                      {item.title}
                    </span>
                    {item.unread && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0071E3', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 4px', lineHeight: 1.4 }}>
                    {item.message}
                  </p>

                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid #F1F5F9',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  fontSize: '12px',
                  color: '#64748B',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                  fontWeight: 600
                }}
              >
                <Trash2 size={13} /> Clear all
              </button>

              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                Live Cloud Alerts
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

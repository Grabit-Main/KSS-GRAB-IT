import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'order',
    title: 'New Fast Order #GB-9821',
    message: '2x Organic Hass Avocados received. Dispatch in 10 mins!',
    time: '2 mins ago',
    unread: true,
    link: '/seller/orders',
  },
  {
    id: 2,
    type: 'low_stock',
    title: 'Critical Stock: 1 Unit Left',
    message: 'Organic Hass Avocados is about to run out of stock.',
    time: '8 mins ago',
    unread: true,
    link: '/seller/products',
  },
  {
    id: 3,
    type: 'out_of_stock',
    title: 'Product Out of Stock',
    message: 'Valencia Orange Juice 250ml reached 0 inventory.',
    time: '22 mins ago',
    unread: true,
    link: '/seller/products',
  },
  {
    id: 4,
    type: 'delivery',
    title: 'Rider Assigned for Dispatch',
    message: 'Delivery rider Suresh Gowda is on the way for pickup.',
    time: '45 mins ago',
    unread: false,
    link: '/seller/orders',
  },
  {
    id: 5,
    type: 'payout',
    title: 'Daily Payout Settled',
    message: '₹4,850.00 deposited into your registered bank account.',
    time: 'Yesterday',
    unread: false,
    link: '/seller/dashboard',
  },
];

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('grabit_seller_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('grabit_seller_notifications', JSON.stringify(notifications));
  }, [notifications]);

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

  const filteredNotifications = notifications.filter((n) =>
    activeTab === 'unread' ? n.unread : true
  );

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon btn-secondary"
        title="Notifications"
        style={{
          width: 38,
          height: 38,
          borderRadius: 'var(--radius-sm)',
          position: 'relative',
          border: isOpen ? '1px solid var(--color-blue)' : '1px solid var(--color-border-gray)',
          backgroundColor: isOpen ? '#F5F9FF' : 'var(--color-pure-white)',
          cursor: 'pointer',
        }}
      >
        <Bell size={17} color={isOpen ? 'var(--color-blue)' : 'var(--color-graphite)'} />

        {/* Unread Pill Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              backgroundColor: 'var(--color-red)',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              width: 18,
              height: 18,
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 4px rgba(255, 59, 48, 0.4)',
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
            maxHeight: 500,
            backgroundColor: 'var(--color-pure-white)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--color-border-gray)',
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
              borderBottom: '1px solid var(--color-border-gray)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAFAFC',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-graphite)', margin: 0 }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-red)',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {unreadCount} New
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-blue)',
                    fontWeight: 600,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: 0,
                  }}
                  title="Mark all as read"
                >
                  <CheckCheck size={13} /> Mark read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid #EDEDF0',
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
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: activeTab === 'all' ? 'var(--color-graphite)' : 'transparent',
                  color: activeTab === 'all' ? '#FFFFFF' : 'var(--color-soft-gray)',
                  cursor: 'pointer',
                }}
              >
                All ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: activeTab === 'unread' ? 'var(--color-graphite)' : 'transparent',
                  color: activeTab === 'unread' ? '#FFFFFF' : 'var(--color-soft-gray)',
                  cursor: 'pointer',
                }}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List without left icons */}
          <div style={{ overflowY: 'auto', maxHeight: 340 }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-soft-gray)' }}>
                <p style={{ fontSize: '13px', fontWeight: 500 }}>No notifications to display</p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid #F0F0F2',
                    backgroundColor: item.unread ? '#F7FAFF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = item.unread ? '#EEF5FF' : '#FAFAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.unread ? '#F7FAFF' : '#FFFFFF')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: item.unread ? 700 : 600, color: 'var(--color-graphite)' }}>
                        {item.title}
                      </span>
                      {item.unread && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-blue)', flexShrink: 0, marginLeft: 8 }} />
                      )}
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: '3px 0 4px', lineHeight: 1.4 }}>
                      {item.message}
                    </p>

                    <span style={{ fontSize: '11px', color: '#A1A1A6', fontWeight: 500 }}>
                      {item.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '10px 18px',
                borderTop: '1px solid var(--color-border-gray)',
                backgroundColor: '#FAFAFC',
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
                  color: 'var(--color-soft-gray)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                }}
              >
                <Trash2 size={12} /> Clear all
              </button>

              <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>
                10-Min Fast Alerts
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import {
  Bell,
  CheckCheck,
  Zap,
  Info,
  ShieldAlert,
  Clock,
  Sparkles,
  X
} from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { state, markNotificationRead, markAllNotificationsRead, deleteNotification } = useDelivery();
  const { notifications, unreadCount } = state;

  const getIcon = (type: string) => {
    switch (type) {
      case 'DISPATCH':
        return <Zap size={18} color="var(--color-blue)" />;
      case 'STATUS':
        return <CheckCheck size={18} color="var(--color-green)" />;
      case 'ADMIN':
        return <Sparkles size={18} color="#D4A000" />;
      case 'SYSTEM':
        return <Info size={18} color="var(--color-soft-gray)" />;
      default:
        return <Bell size={18} color="var(--color-blue)" />;
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0, letterSpacing: '-0.3px' }}>
            Notifications & Dispatch Alerts
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: '2px 0 0' }}>
            Live dispatch notices, customer updates, and partner system announcements
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 16px', gap: '6px', fontWeight: '700' }}
          >
            <CheckCheck size={16} /> Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Notifications Frosted Glass List */}
      {notifications.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Bell size={36} color="var(--color-soft-gray)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-graphite)', margin: '0 0 4px' }}>
            No notifications right now
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: 0 }}>
            You're completely caught up! New dispatch alerts will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className="glass-card"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                cursor: 'pointer',
                background: notif.isRead
                  ? 'rgba(255, 255, 255, 0.65)'
                  : 'rgba(255, 255, 255, 0.88)',
                border: notif.isRead
                  ? '1px solid var(--glass-border-subtle)'
                  : '1.5px solid rgba(0, 113, 227, 0.35)',
                boxShadow: notif.isRead
                  ? 'var(--shadow-glass-subtle)'
                  : '0 6px 24px rgba(0, 113, 227, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 200px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: notif.isRead ? 'rgba(134, 134, 139, 0.08)' : 'rgba(0, 113, 227, 0.1)',
                    border: '1px solid var(--glass-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getIcon(notif.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0, wordBreak: 'break-word' }}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-blue)',
                          boxShadow: '0 0 8px rgba(0, 113, 227, 0.8)',
                          flexShrink: 0
                        }}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-graphite)', margin: '0 0 4px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {notif.description}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {notif.timestamp}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
                {!notif.isRead ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(notif.id);
                    }}
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--color-blue)',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0, 113, 227, 0.08)',
                      border: '1px solid rgba(0, 113, 227, 0.25)',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                  >
                    Mark read
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#64748B',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(148, 163, 184, 0.1)',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ✓ Read
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    padding: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                    e.currentTarget.style.color = '#EF4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }}
                  title="Delete notification"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

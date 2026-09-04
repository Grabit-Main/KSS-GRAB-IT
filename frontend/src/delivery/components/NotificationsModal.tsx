import React from 'react';
import ReactDOM from 'react-dom';
import { useDelivery } from '../context/DeliveryContext';
import {
  Bell,
  CheckCheck,
  Zap,
  Info,
  Sparkles,
  X,
  Trash2
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { state, markNotificationRead, markAllNotificationsRead, deleteNotification, clearAllNotifications } = useDelivery();
  const { notifications, unreadCount } = state;

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'DISPATCH':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={16} color="#0071E3" />
          </div>
        );
      case 'STATUS':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCheck size={16} color="#10B981" />
          </div>
        );
      case 'ADMIN':
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={16} color="#D97706" />
          </div>
        );
      case 'SYSTEM':
      default:
        return (
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Info size={16} color="#64748B" />
          </div>
        );
    }
  };

  const modalContent = (
    <>
      <style>{`
        @keyframes notifSlideDownMobile {
          0% {
            opacity: 0;
            transform: translate(-50%, -10px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .grabit-notif-dialog {
          position: fixed !important;
          top: 68px !important;
          left: 50% !important;
          transform: translate(-50%, 0) !important;
          width: calc(100vw - 24px) !important;
          max-width: 390px !important;
          max-height: calc(100dvh - 85px) !important;
          z-index: 9999999 !important;
          animation: notifSlideDownMobile 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          box-sizing: border-box !important;
          background: #FFFFFF !important;
          border-radius: 22px !important;
          border: 1px solid #E2E8F0 !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24) !important;
          padding: 16px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        @media (min-width: 760px) {
          @keyframes notifSlideDownDesktop {
            0% {
              opacity: 0;
              transform: translateY(-8px) scale(0.97);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .grabit-notif-dialog {
            left: auto !important;
            right: 24px !important;
            top: 72px !important;
            transform: none !important;
            width: 380px !important;
            max-width: 380px !important;
            animation: notifSlideDownDesktop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }
        }
      `}</style>

      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999998,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease-out'
        }}
      />

      {/* Mobile-Responsive Glass Dialog Popover */}
      <div
        className="grabit-notif-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
              <Bell size={15} color="#0F172A" />
            </div>
            <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{ background: '#0071E3', color: '#FFFFFF', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                {unreadCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                style={{
                  background: '#EFF6FF',
                  border: 'none',
                  color: '#0071E3',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px'
                }}
              >
                Mark all read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#64748B',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Clear all notifications"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}

            {/* Modal Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: '2px'
              }}
              title="Close notifications"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Notifications List Content */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '2px', maxHeight: 'calc(100vh - 200px)' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} color="#94A3B8" />
              </div>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#0F172A' }}>No notifications yet</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.4, maxWidth: '240px' }}>
                  All order updates, dispatch notices, and announcements will stay here.
                </div>
              </div>
            </div>
          ) : (
            notifications.map((notif) => {
              const isRead = Boolean(notif.isRead || (notif as any).read);
              const title = notif.title || 'Notification';
              const message = notif.description || (notif as any).message || '';
              const time = notif.timestamp || (notif as any).time || 'Just now';

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: isRead ? '#F8FAFC' : '#F0F7FF',
                    border: isRead ? '1px solid #F1F5F9' : '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    boxShadow: isRead ? 'none' : '0 2px 8px rgba(0, 113, 227, 0.06)'
                  }}
                >
                  {getIcon(notif.type)}

                  <div style={{ flex: 1, minWidth: 0, paddingRight: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        {!isRead && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0071E3', flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {title}
                        </span>
                      </div>
                      <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#94A3B8', flexShrink: 0 }}>
                        {time}
                      </span>
                    </div>

                    {message && (
                      <p style={{ fontSize: '12px', color: isRead ? '#64748B' : '#334155', margin: 0, lineHeight: 1.35, fontWeight: isRead ? '400' : '500', wordBreak: 'break-word' }}>
                        {message}
                      </p>
                    )}
                  </div>

                  {/* Individual Delete X Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    style={{
                      width: '22px',
                      height: '22px',
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
                      marginTop: '1px',
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
                    title="Delete this notification"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
};

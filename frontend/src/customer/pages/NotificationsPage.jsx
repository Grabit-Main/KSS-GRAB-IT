import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Truck,
  Flame,
  Wallet,
  CheckCheck,
  ChevronRight,
  ArrowRight,
  Package,
  Sparkles,
  ShoppingBag,
  Clock
} from 'lucide-react';
import useWindowWidth from '../hooks/useWindowWidth';
import { getRealUserNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../utils/userNotifications';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const w = useWindowWidth();
  const isMobile = w <= 768;

  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState(getRealUserNotifications);

  useEffect(() => {
    const refresh = () => setNotifications(getRealUserNotifications());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('grabit_orders_updated', refresh);
    window.addEventListener('grabit_notifications_updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('grabit_orders_updated', refresh);
      window.removeEventListener('grabit_notifications_updated', refresh);
    };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;
  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeTab);

  const markAllRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getRealUserNotifications());
  };

  const handleNotificationClick = (item) => {
    markNotificationAsRead(item.id);
    setNotifications(getRealUserNotifications());
    if (item.link) navigate(item.link);
  };

  return (
    <div className="container section" style={{
      paddingTop: isMobile ? '36px' : '44px',
      paddingBottom: isMobile ? '100px' : '60px',
      maxWidth: '680px',
      margin: '0 auto',
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>

      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '20px',
        marginTop: isMobile ? '8px' : '14px'
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: 900,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span style={{
                background: '#EFF6FF',
                color: '#0071E3',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #BFDBFE',
                whiteSpace: 'nowrap'
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <p style={{
            fontSize: isMobile ? '12px' : '13px',
            color: '#64748B',
            margin: '3px 0 0',
            fontWeight: 500
          }}>
            Live order tracking, delivery status & refund updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            style={{
              background: '#F0F7FF',
              border: '1px solid #BFDBFE',
              color: '#0071E3',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 12px',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0, 113, 227, 0.08)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
            onMouseLeave={e => e.currentTarget.style.background = '#F0F7FF'}
          >
            <CheckCheck size={14} strokeWidth={2.4} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {[
          { id: 'all', label: `All Important (${notifications.length})` },
          { id: 'active', label: 'Live Orders' },
          { id: 'completed', label: 'Completed' },
          { id: 'refunds', label: 'Refunds' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? '#0F172A' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                border: isActive ? '1px solid #0F172A' : '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 8px rgba(15,23,42,0.15)' : 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notification Cards */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: '#94A3B8' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#F1F5F9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 14px'
            }}>
              <Bell size={26} color="#94A3B8" />
            </div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '16px', color: '#0F172A' }}>
              No notifications yet
            </h3>
            <p style={{ margin: '6px auto 16px', fontSize: '13px', color: '#64748B', maxWidth: '320px', lineHeight: 1.5 }}>
              When you place an order, live delivery tracking and order updates will appear here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: '#0071E3',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Browse Products</span>
              <ArrowRight size={14} strokeWidth={2.4} />
            </button>
          </div>
        ) : (
          filteredNotifications.map((item, idx) => {
            const isUnread = item.unread;
            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: isMobile ? '14px 16px' : '16px 20px',
                  background: isUnread ? '#F8FAFC' : '#FFFFFF',
                  borderLeft: isUnread ? '4px solid #0071E3' : '4px solid transparent',
                  borderBottom: idx === filteredNotifications.length - 1 ? 'none' : '1px solid #F1F5F9',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = isUnread ? '#F1F5F9' : '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = isUnread ? '#F8FAFC' : '#FFFFFF'}
              >
                {/* Icon */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  background: item.iconType === 'truck' ? '#EFF6FF' : item.iconType === 'refund' ? '#ECFDF5' : '#F1F5F9',
                  border: `1px solid ${item.iconType === 'truck' ? '#DBEAFE' : item.iconType === 'refund' ? '#A7F3D0' : '#E2E8F0'}`
                }}>
                  {item.iconType === 'truck' && <Truck size={19} color="#0071E3" strokeWidth={2.2} />}
                  {item.iconType === 'refund' && <Wallet size={19} color="#059669" strokeWidth={2.2} />}
                  {item.iconType === 'package' && <Package size={19} color="#475569" strokeWidth={2.2} />}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {item.title}
                      </span>
                      {item.tag && (
                        <span style={{
                          fontSize: '9.5px', fontWeight: 800, padding: '2px 6px',
                          borderRadius: '4px',
                          background: item.iconType === 'truck' ? '#DBEAFE' : item.iconType === 'refund' ? '#D1FAE5' : '#E2E8F0',
                          color: item.iconType === 'truck' ? '#1E40AF' : item.iconType === 'refund' ? '#065F46' : '#334155',
                          letterSpacing: '0.3px'
                        }}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, flexShrink: 0 }}>
                      {item.time}
                    </span>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#475569', margin: '2px 0 0', lineHeight: 1.5 }}>
                    {item.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    {item.statusBadge && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: item.statusColor || '#0071E3',
                        background: item.statusBg || '#EFF6FF',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {item.statusBadge}
                      </span>
                    )}

                    {item.actionText && (
                      <span style={{
                        fontSize: '12px', fontWeight: 800, color: '#0071E3',
                        display: 'inline-flex', alignItems: 'center', gap: '3px'
                      }}>
                        {item.actionText} <ArrowRight size={12} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Dot */}
                {isUnread && (
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#0071E3', flexShrink: 0, marginTop: '6px'
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

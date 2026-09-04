import React, { useLayoutEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AgentStatusPill } from './components/AgentStatusPill';
import { Bell, LogIn } from 'lucide-react';

// Screens
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ActiveDeliveryScreen } from './components/screens/ActiveDeliveryScreen';
import { DeliveryHistoryScreen } from './components/screens/DeliveryHistoryScreen';
import { PerformanceScreen } from './components/screens/PerformanceScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { SupportScreen } from './components/screens/SupportScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AttendanceScreen } from './components/screens/AttendanceScreen';

// Modals
import { ProofOfDeliveryModal } from './components/ProofOfDeliveryModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { MockCallModal } from './components/MockCallModal';
import { MockChatModal } from './components/MockChatModal';
import { SOSModal } from './components/SOSModal';
import { DeliverySuccessModal } from './components/DeliverySuccessModal';
import { IncentiveDetailsModal } from './components/IncentiveDetailsModal';
import { ShiftSummaryModal } from './components/ShiftSummaryModal';
import { NewOrderPopup } from './components/NewOrderPopup';
import { NotificationsModal } from './components/NotificationsModal';
import { AlertModal } from './components/AlertModal';

import './index.css';
import './App.css';
import { forceScrollToTop } from '../utils/scrollToTop';

function DeliveryAppLayout() {
  const { state, unreadCount, confirmGoOffline } = useDelivery();
  const { activeModal } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [showPortalModal, setShowPortalModal] = React.useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = React.useState(false);

  // Scroll to top on every delivery sub-route change
  useLayoutEffect(() => {
    forceScrollToTop();
  }, [location.pathname, location.search, location.hash]);

  React.useEffect(() => {
    try {
      const userStr = localStorage.getItem('grabit_user');
      const sessionStr = localStorage.getItem('grabit_session');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || (user.role !== 'delivery_agent' && user.role !== 'delivery_partner' && user.role !== 'rider')) {
        const riderUser = {
          id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a',
          role: 'delivery_agent',
          name: user?.name || user?.full_name || 'Karthik Rider',
          full_name: user?.full_name || user?.name || 'Karthik Rider',
          phone: user?.phone || '+919999900003',
          email: user?.email || 'delivery@grabit.local',
          partnerVerified: true,
          biometricsDone: true,
          verification_status: 'VERIFIED',
          verified_by_admin: true,
          clearances: {
            dlVerified: true,
            insuranceVerified: true,
            pucVerified: true,
            bgCheckVerified: true
          }
        };
        localStorage.setItem('grabit_session', sessionStr || 'demo-delivery-token');
        localStorage.setItem('grabit_user', JSON.stringify(riderUser));
      }
    } catch {}
  }, []);

  return (
    <div className="portal-layout">
      {/* Ambient Glassmorphism Glow Blobs */}
      <div className="ambient-glow-container" aria-hidden="true">
        <div className="ambient-blob-blue" />
        <div className="ambient-blob-green" />
        <div className="ambient-blob-gray" />
      </div>

      {/* Persistent Left Frosted Glass Sidebar on Desktop (>=760px) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="portal-main-area">
        {/* Mobile Frosted Glass Header (<760px) */}
        <header className="mobile-top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png" alt="GrabIt Logo" style={{ height: '42px', width: 'auto', maxWidth: '170px', objectFit: 'contain' }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-blue)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Partner
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AgentStatusPill />

            <button
              type="button"
              onClick={() => setShowNotificationsModal(true)}
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--glass-border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                color: 'var(--color-graphite)',
                flexShrink: 0,
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: 'var(--color-red)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(255, 59, 48, 0.4)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route index element={<DashboardScreen />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="active-delivery" element={<ActiveDeliveryScreen />} />
            <Route path="delivery-history" element={<DeliveryHistoryScreen />} />
            <Route path="performance" element={<Navigate to="/delivery/dashboard" replace />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="support" element={<Navigate to="/delivery/dashboard" replace />} />
            <Route path="attendance" element={<AttendanceScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Floating Glass Bottom Navigation (<760px) */}
      <MobileBottomNav />

      {/* Global Glass Modals */}
      {activeModal === 'POD' && <ProofOfDeliveryModal />}
      {activeModal === 'REPORT_ISSUE' && <ReportIssueModal />}
      {activeModal === 'CALL' && <MockCallModal type="CUSTOMER" />}
      {activeModal === 'MERCHANT_CALL' && <MockCallModal type="MERCHANT" />}
      {activeModal === 'CHAT' && <MockChatModal />}
      {activeModal === 'SOS' && <SOSModal />}
      {activeModal === 'DELIVERY_SUCCESS' && <DeliverySuccessModal />}
      {activeModal === 'INCENTIVE_DETAILS' && <IncentiveDetailsModal />}
      {activeModal === 'SHIFT_SUMMARY' && <ShiftSummaryModal onConfirmGoOffline={confirmGoOffline} />}

      {/* New Order Assigned Popup */}
      <NewOrderPopup />

      {/* Mobile Responsive Alert & Warning Modal */}
      <AlertModal />

      {/* Top Right Notifications Glass Modal */}
      <NotificationsModal isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} />

      {/* 🔐 CONFIRMATION MODAL BEFORE REDIRECTING TO LOGIN */}
      {showPortalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowPortalModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPortalModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: '#0071E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                border: '1.5px solid #BFDBFE',
              }}
            >
              <LogIn size={24} color="#0071E3" />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Redirect to Login Page?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to open the Login & Authentication portal?
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPortalModal(false)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPortalModal(false);
                  navigate('/login');
                }}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  background: '#0071E3',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,113,227,0.3)',
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DeliveryPortalApp() {
  return (
    <DeliveryProvider>
      <DeliveryAppLayout />
    </DeliveryProvider>
  );
}

export default DeliveryPortalApp;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AgentStatusPill } from './components/AgentStatusPill';
import { Bell } from 'lucide-react';

// Screens
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ActiveDeliveryScreen } from './components/screens/ActiveDeliveryScreen';
import { DeliveryHistoryScreen } from './components/screens/DeliveryHistoryScreen';
import { PerformanceScreen } from './components/screens/PerformanceScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { SupportScreen } from './components/screens/SupportScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

// Modals
import { ProofOfDeliveryModal } from './components/ProofOfDeliveryModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { MockCallModal } from './components/MockCallModal';
import { MockChatModal } from './components/MockChatModal';
import { SOSModal } from './components/SOSModal';
import { DeliverySuccessModal } from './components/DeliverySuccessModal';
import { IncentiveDetailsModal } from './components/IncentiveDetailsModal';
import { NewOrderPopup } from './components/NewOrderPopup';

function AppLayout() {
  const { state, unreadCount } = useDelivery();
  const { activeModal } = state;
  const navigate = useNavigate();

  return (
    <div className="portal-layout">
      {/* Ambient Glassmorphism Glow Blobs (Fixed Behind UI) */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="https://res.cloudinary.com/hmx3azp6/image/upload/v1787645102/grabit_media/logo.png" alt="GrabIt Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-graphite)', letterSpacing: '-0.3px' }}>
              GrabIt Partner
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AgentStatusPill />
            <button
              type="button"
              onClick={() => navigate('/notifications')}
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
                flexShrink: 0
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
                    boxShadow: '0 2px 6px rgba(255, 59, 48, 0.4)'
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/active-delivery" element={<ActiveDeliveryScreen />} />
            <Route path="/delivery-history" element={<DeliveryHistoryScreen />} />
            <Route path="/performance" element={<PerformanceScreen />} />
            <Route path="/notifications" element={<NotificationsScreen />} />
            <Route path="/support" element={<SupportScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

      {/* New Order Assigned Popup */}
      <NewOrderPopup />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DeliveryProvider>
        <AppLayout />
      </DeliveryProvider>
    </BrowserRouter>
  );
}

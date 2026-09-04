import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import {
  Navigation,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Power,
  LogIn,
  ShoppingCart,
  Store,
  KeyRound,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { state, setAgentStatus, toggleMute, openModal, showAlert } = useDelivery();
  const { agentStatus, isMuted, stats } = state;
  const [showPortalModal, setShowPortalModal] = useState(false);

  const isOnline = agentStatus !== 'OFFLINE';

  const handleToggleOnline = () => {
    if (agentStatus === 'ON_DELIVERY') {
      showAlert({
        title: 'Active Delivery in Progress',
        message: 'Cannot go offline while on an active delivery. Please complete or transfer the delivery first.',
        type: 'warning',
        buttonText: 'Understood'
      });
      return;
    }
    setAgentStatus(isOnline ? 'OFFLINE' : 'AVAILABLE');
  };

  return (
    <>
      <header style={{ backgroundColor: 'var(--color-graphite)', color: 'var(--color-pure-white)', borderBottom: '1px solid #2C2C2E', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Brand & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px', color: '#FFFFFF' }}>GrabIt Partner</span>
                <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px', color: '#FFFFFF' }}>PRO</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-soft-gray)', margin: 0 }}>Driver ID: #AG-4492 • Hub East</p>
            </div>
          </div>

          {/* Live Performance Stats (Navbar Summary) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }} className="nav-stats-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-pure-white)' }}>
              <CheckCircle2 size={15} color="var(--color-green)" />
              <span style={{ fontWeight: '600' }}>{stats.completedToday}</span>
              <span style={{ color: 'var(--color-soft-gray)', fontSize: '12px' }}>Delivered</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-pure-white)' }}>
              <Star size={14} color="#FFD60A" fill="#FFD60A" />
              <span style={{ fontWeight: '600' }}>{stats.rating.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-pure-white)' }}>
              <Clock size={14} color="var(--color-soft-gray)" />
              <span style={{ fontWeight: '600' }}>{stats.onTimePercentage}%</span>
              <span style={{ color: 'var(--color-soft-gray)', fontSize: '12px' }}>On-Time</span>
            </div>
          </div>

          {/* Status Badge & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Agent Status Badge */}
            {agentStatus === 'AVAILABLE' && (
              <div className="badge badge-green" style={{ padding: '6px 12px', fontSize: '13px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green)', display: 'inline-block' }} />
                Active
              </div>
            )}

            {agentStatus === 'ON_DELIVERY' && (
              <div className="badge badge-blue" style={{ padding: '6px 12px', fontSize: '13px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'inline-block' }} />
                On Delivery
              </div>
            )}

            {agentStatus === 'OFFLINE' && (
              <div className="badge badge-gray" style={{ padding: '6px 12px', fontSize: '13px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-soft-gray)', display: 'inline-block' }} />
                Offline
              </div>
            )}

            {/* Portal Switcher Button */}
            <button
              onClick={() => setShowPortalModal(true)}
              title="Switch Portals & Login"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0071E3',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 113, 227, 0.2)',
                transition: 'all 0.15s ease'
              }}
            >
              <LogIn size={17} color="#0071E3" />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute audio alerts' : 'Mute audio alerts'}
              style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', transition: 'var(--transition-smooth)' }}
            >
              {isMuted ? <VolumeX size={17} color="var(--color-soft-gray)" /> : <Volume2 size={17} color="#FFFFFF" />}
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => openModal('SOS')}
              title="Emergency SOS / Dispatch Support"
              style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255, 59, 48, 0.18)', border: '1px solid rgba(255, 59, 48, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-red)' }}
            >
              <AlertTriangle size={17} />
            </button>

            {/* Shift Toggle */}
            <button
              onClick={handleToggleOnline}
              disabled={agentStatus === 'ON_DELIVERY'}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: isOnline ? 'rgba(255, 255, 255, 0.12)' : 'var(--color-green)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: agentStatus === 'ON_DELIVERY' ? 0.4 : 1,
                cursor: agentStatus === 'ON_DELIVERY' ? 'not-allowed' : 'pointer'
              }}
            >
              <Power size={14} />
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

        </div>
      </header>

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
                  window.location.href = '/login';
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
    </>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../../context/DeliveryContext';
import { AppSettings } from '../../types/delivery';
import {
  Bell,
  Volume2,
  MapPin,
  RotateCcw,
  User,
  CheckCircle2,
  Moon,
  Wifi,
  Shield,
  ChevronRight,
  Zap,
  AlertTriangle
} from 'lucide-react';

const Toggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  label?: string;
}> = ({ checked, onChange }) => (
  <button
    type="button"
    className="toggle-btn"
    onClick={onChange}
    aria-pressed={checked}
    style={{
      position: 'relative',
      width: '56px',
      height: '28px',
      minHeight: '28px',
      maxHeight: '28px',
      borderRadius: '999px',
      border: checked ? '2px solid #0071E3' : '2px solid #1D1D1F',
      cursor: 'pointer',
      padding: 0,
      backgroundColor: checked ? 'rgba(0, 113, 227, 0.12)' : '#FFFFFF',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      flexShrink: 0,
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      boxShadow: checked ? '0 2px 10px rgba(0, 113, 227, 0.20)' : '0 1px 4px rgba(0, 0, 0, 0.04)',
      WebkitTapHighlightColor: 'transparent',
      boxSizing: 'border-box'
    }}
  >
    <span
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        border: checked ? '2px solid #0071E3' : '2px solid #1D1D1F',
        boxSizing: 'border-box',
        marginLeft: '2px',
        transform: checked ? 'translateX(28px)' : 'translateX(0px)',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, background-color 0.25s ease',
        pointerEvents: 'none',
        flexShrink: 0
      }}
    />
  </button>
);

/* ── Row helper ───────────────────────────────────────────── */
const SettingsRow: React.FC<{
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
  border?: boolean;
}> = ({ icon, label, sub, right, danger, onClick, border = true }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '13px',
      paddingTop: '13px',
      paddingBottom: '13px',
      borderTop: border ? '1px solid var(--glass-border-subtle)' : 'none',
      cursor: onClick ? 'pointer' : 'default',
      transition: onClick ? 'background 0.15s' : undefined,
      borderRadius: onClick ? '8px' : undefined,
      WebkitTapHighlightColor: 'transparent'
    }}
  >
    {icon && (
      <div style={{
        width: '34px',
        height: '34px',
        borderRadius: '9px',
        backgroundColor: danger ? 'rgba(255,59,48,0.10)' : 'rgba(0,113,227,0.09)',
        color: danger ? 'var(--color-red)' : 'var(--color-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{
        fontSize: '14px',
        fontWeight: '700',
        color: danger ? 'var(--color-red)' : 'var(--color-graphite)',
        display: 'block'
      }}>
        {label}
      </span>
      {sub && (
        <span style={{ fontSize: '11.5px', color: 'var(--color-soft-gray)', marginTop: '1px', display: 'block' }}>
          {sub}
        </span>
      )}
    </div>
    {right}
  </div>
);

/* ── Main Screen ─────────────────────────────────────────── */
export const SettingsScreen: React.FC = () => {
  const { state, updateSettings, resetDemo } = useDelivery();
  const { settings } = state;
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);

  const handleToggle = (key: keyof AppSettings) => {
    if (typeof settings[key] === 'boolean') {
      updateSettings({ [key]: !settings[key] });
    }
  };

  const handleZoneChange = (zone: AppSettings['mockLocationZone']) => {
    updateSettings({ mockLocationZone: zone });
  };

  const handleReset = () => {
    resetDemo();
    setShowResetModal(false);
    navigate('/delivery/dashboard');
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0, letterSpacing: '-0.5px' }}>
          Settings
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: '3px 0 0' }}>
          App preferences, notifications & demo controls
        </p>
      </div>

      {/* ── Notifications Card ────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Bell size={15} color="var(--color-soft-gray)" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-soft-gray)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Notifications
          </span>
        </div>

        <SettingsRow
          icon={<Bell size={18} />}
          label="Delivery Dispatch Alerts"
          sub="Pop-up alert when a new order is assigned"
          right={
            <Toggle
              checked={settings.deliveryNotifications}
              onChange={() => handleToggle('deliveryNotifications')}
            />
          }
          border={false}
        />
        <SettingsRow
          icon={<Zap size={18} />}
          label="Support & Announcement Alerts"
          sub="Ticket replies and system announcements"
          right={
            <Toggle
              checked={settings.supportNotifications}
              onChange={() => handleToggle('supportNotifications')}
            />
          }
        />
      </div>

      {/* ── Sound Card ───────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Volume2 size={15} color="var(--color-soft-gray)" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-soft-gray)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Sound & Audio
          </span>
        </div>

        <SettingsRow
          icon={<Volume2 size={18} />}
          label="Incoming Order Chime"
          sub="Play alert tone when a delivery arrives"
          right={
            <Toggle
              checked={settings.deliveryAlertSound}
              onChange={() => handleToggle('deliveryAlertSound')}
            />
          }
          border={false}
        />
        <SettingsRow
          icon={<Zap size={18} />}
          label="Delivery Success Fanfare"
          sub="Celebratory chime on completing POD"
          right={
            <Toggle
              checked={settings.notificationSound}
              onChange={() => handleToggle('notificationSound')}
            />
          }
        />
      </div>

      {/* ── Location Card ────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <MapPin size={15} color="var(--color-soft-gray)" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-soft-gray)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Location & GPS
          </span>
        </div>

        <SettingsRow
          icon={<Wifi size={18} />}
          label="Browser Geolocation"
          sub="Used for doorstep GPS verification in POD"
          right={
            <span className="badge badge-green" style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}>
              <CheckCircle2 size={12} /> Active
            </span>
          }
          border={false}
        />

        <div style={{ paddingTop: '14px', borderTop: '1px solid var(--glass-border-subtle)' }}>
          <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-graphite)', display: 'block', marginBottom: '10px' }}>
            Dispatch Simulation Zone — Bengaluru
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '9px' }}>
            {(['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout'] as AppSettings['mockLocationZone'][]).map((zone) => {
              const isActive = settings.mockLocationZone === zone;
              return (
                <button
                  key={zone}
                  onClick={() => handleZoneChange(zone)}
                  style={{
                    padding: '11px 10px',
                    borderRadius: '13px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textAlign: 'center',
                    border: isActive ? '2px solid var(--color-blue)' : '1.5px solid var(--glass-border-subtle)',
                    backgroundColor: isActive ? 'rgba(0,113,227,0.11)' : 'rgba(255,255,255,0.55)',
                    color: isActive ? 'var(--color-blue)' : 'var(--color-graphite)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isActive && <CheckCircle2 size={13} />}
                  {zone}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Account Card ─────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Shield size={15} color="var(--color-soft-gray)" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-soft-gray)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Account
          </span>
        </div>

        <SettingsRow
          icon={<User size={18} />}
          label="View Partner Profile"
          sub="Documents, vehicle info, and verifications"
          right={<ChevronRight size={18} color="var(--color-soft-gray)" />}
          onClick={() => navigate('/delivery/profile')}
          border={false}
        />
        <SettingsRow
          icon={<Moon size={18} />}
          label="App Version"
          sub="GrabIt Partner Portal v2.4.1 — Demo Build"
          border
        />
      </div>

      {/* ── Danger Zone Card ─────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '20px', border: '1px solid rgba(255,59,48,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <AlertTriangle size={15} color="var(--color-red)" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-red)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Demo Controls
          </span>
        </div>

        <SettingsRow
          icon={<RotateCcw size={18} />}
          label="Reset Demo State"
          sub="Clears all orders, history & stats to defaults"
          right={
            <button
              onClick={() => setShowResetModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                backgroundColor: 'rgba(255,59,48,0.10)',
                border: '1.5px solid rgba(255,59,48,0.28)',
                color: 'var(--color-red)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '36px'
              }}
            >
              Reset
            </button>
          }
          border={false}
          danger
        />
      </div>

      {/* ── Reset Confirmation Modal ──────────────────────────── */}
      {showResetModal && (
        <div className="modal-overlay" style={{ padding: '16px' }}>
          <div
            className="modal-content glass-strong"
            style={{ maxWidth: '400px', padding: '28px 24px', textAlign: 'center', borderRadius: '26px' }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,59,48,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid rgba(255,59,48,0.25)'
              }}
            >
              <RotateCcw size={26} color="var(--color-red)" />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-graphite)', margin: '0 0 8px' }}>
              Reset Demo State?
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-soft-gray)', margin: '0 0 24px', lineHeight: '1.5' }}>
              This will clear all orders, delivery history, notifications, and stats — restoring the app to its initial state.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowResetModal(false)}
                className="btn-secondary"
                style={{ padding: '13px', fontWeight: '700' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="btn-danger-solid"
                style={{ padding: '13px', fontWeight: '700' }}
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

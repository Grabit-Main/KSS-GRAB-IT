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
    </div>
  );
};

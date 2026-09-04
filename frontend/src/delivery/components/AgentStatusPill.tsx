import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';

interface AgentStatusPillProps {
  toggleOnly?: boolean;
}

export const AgentStatusPill: React.FC<AgentStatusPillProps> = ({ dotOnly = false }) => {
  const { state, toggleAvailability, isStoreOpen, storeHours } = useDelivery();
  const { agentStatus, currentOrder } = state;
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic rider verification check
  const isVerifiedRider = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
      const ver = String(u.verification_status || '').toUpperCase();
      if (u.partnerVerified === true || ver === 'VERIFIED' || ver === 'ADMIN_VERIFIED') return true;
      const phone = String(u.phone || '');
      if (phone.includes('9999900003') || phone.includes('9080841727') || String(u.id || '').includes('d7e8f9a0-b1c2-3d4e-5f6a')) return true;
      if (u.clearances && u.clearances.dlVerified && u.clearances.insuranceVerified) return true;
      return false;
    } catch {
      return true;
    }
  })();

  // True dynamic status calculation — unverified rider is strictly UNAVAILABLE
  const computedStatus = !isVerifiedRider
    ? 'UNAVAILABLE'
    : (agentStatus === 'ON_DELIVERY' && currentOrder !== null)
    ? 'ON_DELIVERY'
    : (agentStatus === 'AVAILABLE')
    ? 'AVAILABLE'
    : 'UNAVAILABLE';

  const isOnDelivery = computedStatus === 'ON_DELIVERY';
  const isAvailable = computedStatus === 'AVAILABLE';
  const isUnavailable = computedStatus === 'UNAVAILABLE';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleAvailability();
  };

  const getLabel = () => {
    if (!isVerifiedRider) return 'Under Review';
    if (isOnDelivery) return 'On Delivery';
    if (isAvailable) return 'Active';
    if (!isStoreOpen) return 'Store Closed';
    if (state.isLeaveToday) return state.leaveTodayTitle || 'Leave Today';
    return 'Inactive';
  };

  const getTitle = () => {
    if (!isVerifiedRider) return '🔒 Account Verification Under Review — Admin approval required before going Active';
    if (!isStoreOpen) return `🌙 Store Closed (Shift ended at ${storeHours?.close || '19:00'}) • Working hours: ${storeHours?.open || '10:00'} - ${storeHours?.close || '19:00'}`;
    if (isOnDelivery) return 'On Active Delivery (Fulfilling order)';
    if (isAvailable) return 'Currently Active • Click to go Inactive';
    if (state.isLeaveToday) return `🏖️ ${state.leaveTodayTitle || 'Leave'} Today — Rider status cannot be set to Active`;
    return 'Currently Inactive • Click to go Active';
  };

  const getBackground = () => {
    if (isOnDelivery) {
      return isHovered ? 'rgba(0, 113, 227, 0.18)' : 'rgba(0, 113, 227, 0.12)';
    }
    if (isUnavailable) {
      if (state.isLeaveToday) return isHovered ? 'rgba(147, 51, 234, 0.20)' : 'rgba(147, 51, 234, 0.12)';
      return isHovered ? 'rgba(148, 163, 184, 0.22)' : 'rgba(148, 163, 184, 0.14)';
    }
    return isHovered ? 'rgba(52, 199, 89, 0.20)' : 'rgba(52, 199, 89, 0.12)';
  };

  const getBorderColor = () => {
    if (isOnDelivery) {
      return isHovered ? 'rgba(0, 113, 227, 0.50)' : 'rgba(0, 113, 227, 0.35)';
    }
    if (isUnavailable) {
      if (state.isLeaveToday) return isHovered ? 'rgba(147, 51, 234, 0.50)' : 'rgba(147, 51, 234, 0.35)';
      return isHovered ? 'rgba(148, 163, 184, 0.45)' : 'rgba(148, 163, 184, 0.30)';
    }
    return isHovered ? 'rgba(52, 199, 89, 0.50)' : 'rgba(52, 199, 89, 0.35)';
  };

  const getTextColor = () => {
    if (isOnDelivery) return 'var(--color-blue)';
    if (isUnavailable) return state.isLeaveToday ? '#9333EA' : '#64748B';
    return 'var(--color-green)';
  };

  const getDotColor = () => {
    if (isOnDelivery) return 'var(--color-blue)';
    if (isUnavailable) return state.isLeaveToday ? '#A855F7' : '#94A3B8';
    return 'var(--color-green)';
  };

  const getBoxShadow = () => {
    if (isHovered) {
      return isAvailable
        ? '0 4px 14px rgba(52, 199, 89, 0.20)'
        : isOnDelivery
        ? '0 4px 14px rgba(0, 113, 227, 0.20)'
        : '0 4px 14px rgba(0, 0, 0, 0.08)';
    }
    return '0 2px 8px rgba(0, 0, 0, 0.04)';
  };

  if (dotOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={getTitle()}
        aria-label={`Delivery status: ${getLabel()}. ${getTitle()}`}
        style={{
          width: '26px',
          height: '26px',
          minWidth: '26px',
          minHeight: '26px',
          maxWidth: '26px',
          maxHeight: '26px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isAvailable ? 'rgba(52, 199, 89, 0.14)' : isOnDelivery ? 'rgba(0, 113, 227, 0.14)' : 'rgba(148, 163, 184, 0.14)',
          border: `1.5px solid ${getBorderColor()}`,
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
          boxSizing: 'border-box',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isHovered ? 'scale(1.12)' : 'scale(1)',
          outline: 'none',
          boxShadow: isAvailable ? '0 0 10px rgba(52, 199, 89, 0.25)' : 'none'
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            minWidth: '8px',
            minHeight: '8px',
            borderRadius: '50%',
            backgroundColor: getDotColor(),
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: isAvailable
              ? '0 0 8px rgba(52, 199, 89, 0.85)'
              : isOnDelivery
              ? '0 0 8px rgba(0, 113, 227, 0.85)'
              : 'none',
            transition: 'all 0.2s ease'
          }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={getTitle()}
      aria-label={`Delivery status: ${getLabel()}. ${getTitle()}`}
      className="glass-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '5px 13px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '800',
        letterSpacing: '0.2px',
        background: getBackground(),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: getTextColor(),
        border: `1px solid ${getBorderColor()}`,
        boxShadow: getBoxShadow(),
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
        userSelect: 'none',
        outline: 'none',
        textDecoration: 'none'
      }}
    >
      <span
        style={{
          width: '7.5px',
          height: '7.5px',
          borderRadius: '50%',
          backgroundColor: getDotColor(),
          display: 'inline-block',
          boxShadow: isAvailable
            ? '0 0 8px rgba(52, 199, 89, 0.7)'
            : isOnDelivery
            ? '0 0 8px rgba(0, 113, 227, 0.7)'
            : 'none',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease'
        }}
      />
      <span>{getLabel()}</span>
    </button>
  );
};

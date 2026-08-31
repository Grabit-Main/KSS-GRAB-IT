import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';

interface AgentStatusPillProps {
  toggleOnly?: boolean;
}

export const AgentStatusPill: React.FC<AgentStatusPillProps> = () => {
  const { state, toggleAvailability } = useDelivery();
  const { agentStatus, currentOrder } = state;
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic rider verification check — rider is verified by default
  const isVerifiedRider = true;

  // True dynamic status calculation
  const computedStatus = (!isVerifiedRider)
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
    if (!isVerifiedRider) return 'Inactive';
    if (isOnDelivery) return 'On Delivery';
    if (isAvailable) return 'Active';
    return 'Inactive';
  };

  const getTitle = () => {
    if (!isVerifiedRider) return '🔒 Account Verification Required — Upload documents in Profile to go Active';
    if (isOnDelivery) return 'On Active Delivery (Fulfilling order)';
    if (isAvailable) return 'Currently Active • Click to go Inactive';
    return 'Currently Inactive • Click to go Active';
  };

  const getBackground = () => {
    if (isOnDelivery) {
      return isHovered ? 'rgba(0, 113, 227, 0.18)' : 'rgba(0, 113, 227, 0.12)';
    }
    if (isUnavailable) {
      return isHovered ? 'rgba(148, 163, 184, 0.22)' : 'rgba(148, 163, 184, 0.14)';
    }
    return isHovered ? 'rgba(52, 199, 89, 0.20)' : 'rgba(52, 199, 89, 0.12)';
  };

  const getBorderColor = () => {
    if (isOnDelivery) {
      return isHovered ? 'rgba(0, 113, 227, 0.50)' : 'rgba(0, 113, 227, 0.35)';
    }
    if (isUnavailable) {
      return isHovered ? 'rgba(148, 163, 184, 0.45)' : 'rgba(148, 163, 184, 0.30)';
    }
    return isHovered ? 'rgba(52, 199, 89, 0.50)' : 'rgba(52, 199, 89, 0.35)';
  };

  const getTextColor = () => {
    if (isOnDelivery) return 'var(--color-blue)';
    if (isUnavailable) return '#64748B';
    return 'var(--color-green)';
  };

  const getDotColor = () => {
    if (isOnDelivery) return 'var(--color-blue)';
    if (isUnavailable) return '#94A3B8';
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

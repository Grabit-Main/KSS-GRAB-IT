import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';

interface AgentStatusPillProps {
  toggleOnly?: boolean;
}

export const AgentStatusPill: React.FC<AgentStatusPillProps> = ({ toggleOnly = false }) => {
  const { state, toggleAvailability } = useDelivery();
  const { agentStatus } = state;
  const [isHovered, setIsHovered] = useState(false);

  const isUnavailable = agentStatus === 'UNAVAILABLE';
  const isOnDelivery = !toggleOnly && agentStatus === 'ON_DELIVERY';
  const isAvailable = toggleOnly ? !isUnavailable : agentStatus === 'AVAILABLE';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleAvailability();
  };

  const getLabel = () => {
    if (isOnDelivery) return 'On Delivery';
    if (isUnavailable) return 'Inactive';
    return 'Active';
  };

  const getTitle = () => {
    if (isOnDelivery) return 'On Active Delivery (Fulfilling order)';
    if (isUnavailable) return 'Currently Inactive • Click to go Active';
    return 'Currently Active • Click to go Inactive';
  };

  const getBackground = () => {
    if (isOnDelivery) {
      return isHovered ? 'rgba(0, 113, 227, 0.18)' : 'rgba(0, 113, 227, 0.12)';
    }
    if (isUnavailable) {
      return isHovered ? 'rgba(134, 134, 139, 0.22)' : 'rgba(134, 134, 139, 0.14)';
    }
    return isHovered ? 'rgba(52, 199, 89, 0.20)' : 'rgba(52, 199, 89, 0.12)';
  };

  const getBorderColor = () => {
    if (isOnDelivery) {
      return isHovered ? 'rgba(0, 113, 227, 0.50)' : 'rgba(0, 113, 227, 0.35)';
    }
    if (isUnavailable) {
      return isHovered ? 'rgba(134, 134, 139, 0.45)' : 'rgba(134, 134, 139, 0.30)';
    }
    return isHovered ? 'rgba(52, 199, 89, 0.50)' : 'rgba(52, 199, 89, 0.35)';
  };

  const getTextColor = () => {
    if (isOnDelivery) return 'var(--color-blue)';
    if (isUnavailable) return 'var(--color-graphite)';
    return 'var(--color-green)';
  };

  const getDotColor = () => {
    if (isOnDelivery) return 'var(--color-blue)';
    if (isUnavailable) return 'rgba(134, 134, 139, 0.85)';
    return 'var(--color-green)';
  };

  const getBoxShadow = () => {
    if (isHovered && !isOnDelivery) {
      return isAvailable
        ? '0 4px 14px rgba(52, 199, 89, 0.20), 0 2px 6px rgba(0, 0, 0, 0.04)'
        : '0 4px 14px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)';
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

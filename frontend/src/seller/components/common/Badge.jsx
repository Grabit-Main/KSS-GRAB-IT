import React from 'react';

export const Badge = ({
  variant = 'default', // 'active' | 'inactive' | 'info' | 'danger' | 'default'
  children,
  size = 'md',
  className = '',
  style = {}
}) => {
  const stylesByVariant = {
    active: {
      backgroundColor: 'var(--color-green-light)',
      color: 'var(--color-green)',
      border: '1px solid rgba(52, 199, 89, 0.3)',
    },
    inactive: {
      backgroundColor: '#EFEFEF',
      color: 'var(--color-soft-gray)',
      border: '1px solid var(--color-border-gray)',
    },
    info: {
      backgroundColor: '#EAF2FC',
      color: 'var(--color-blue)',
      border: '1px solid rgba(0, 113, 227, 0.2)',
    },
    danger: {
      backgroundColor: 'var(--color-red-light)',
      color: 'var(--color-red)',
      border: '1px solid rgba(255, 59, 48, 0.2)',
    },
    default: {
      backgroundColor: '#F5F5F7',
      color: 'var(--color-graphite)',
      border: '1px solid var(--color-border-gray)',
    }
  };

  const sizeStyles = {
    sm: { padding: '2px 6px', fontSize: '11px', borderRadius: '4px' },
    md: { padding: '3px 10px', fontSize: '12px', borderRadius: 'var(--radius-full)' },
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontWeight: 600,
        ...stylesByVariant[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </span>
  );
};

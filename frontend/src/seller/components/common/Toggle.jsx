import React from 'react';

export const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}) => {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, userSelect: 'none' }}>
      <label className="apple-toggle" htmlFor={toggleId} style={{ opacity: disabled ? 0.5 : 1 }}>
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
        />
        <span className="apple-toggle-slider" />
      </label>
      {label && (
        <label
          htmlFor={toggleId}
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-graphite)',
            cursor: disabled ? 'default' : 'pointer'
          }}
        >
          {label}
        </label>
      )}
    </div>
  );
};

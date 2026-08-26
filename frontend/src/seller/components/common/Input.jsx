import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  hint,
  required = false,
  id,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: 12, color: 'var(--color-soft-gray)', pointerEvents: 'none' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
          style={Icon ? { paddingLeft: 38 } : {}}
          {...props}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';

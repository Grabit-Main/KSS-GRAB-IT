import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({
  label,
  error,
  hint,
  required = false,
  id,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={selectId}
          ref={ref}
          className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
          style={{ appearance: 'none', paddingRight: 36 }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div style={{ position: 'absolute', right: 12, color: 'var(--color-soft-gray)', pointerEvents: 'none' }}>
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
});

Select.displayName = 'Select';

import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({
  label,
  error,
  hint,
  required = false,
  id,
  className = '',
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        style={{ resize: 'vertical' }}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

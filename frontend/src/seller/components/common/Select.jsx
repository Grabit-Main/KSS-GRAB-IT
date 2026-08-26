import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const Select = forwardRef(({
  label,
  error,
  hint,
  required = false,
  id,
  options = [],
  placeholder = 'Select an option',
  value,
  onChange,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const selectedOpt = options.find((o) => String(o.value) === String(value));

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val, name: props.name || selectId } });
    }
    setIsOpen(false);
  };

  return (
    <div className="form-group" style={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
      {label && (
        <label htmlFor={selectId} className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{label}</span>
          {required && <span className="required" style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}

      <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
        {/* Custom Responsive Select Trigger Button */}
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
          style={{
            height: '42px',
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: selectedOpt ? '#0F172A' : '#94A3B8',
            backgroundColor: '#FFFFFF',
            border: error ? '1.5px solid #EF4444' : isOpen ? '1.5px solid #0071E3' : '1px solid #CBD5E1',
            borderRadius: '10px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            boxShadow: isOpen ? '0 0 0 3px rgba(0, 113, 227, 0.12)' : 'none',
            transition: 'all 0.15s ease',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
            {selectedOpt ? selectedOpt.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            color={isOpen ? '#0071E3' : '#64748B'}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          />
        </button>

        {/* Custom Mobile-Contained Dropdown Menu */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              width: '100%',
              maxWidth: '100%',
              zIndex: 99999,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.16), 0 6px 12px -3px rgba(0, 0, 0, 0.08)',
              padding: '6px',
              maxHeight: '230px',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {placeholder && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: !value ? '#EFF6FF' : 'transparent',
                  color: !value ? '#0071E3' : '#64748B',
                  fontSize: '13px',
                  fontWeight: !value ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
              >
                <span>{placeholder}</span>
                {!value && <Check size={15} color="#0071E3" />}
              </button>
            )}

            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                    color: isSelected ? '#0071E3' : '#1E293B',
                    fontSize: '13px',
                    fontWeight: isSelected ? 800 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s ease',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                    {opt.label}
                  </span>
                  {isSelected && <Check size={15} color="#0071E3" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
});

Select.displayName = 'Select';

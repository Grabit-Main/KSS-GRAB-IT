import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { AlertTriangle, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const AlertModal: React.FC = () => {
  const { state, closeAlert } = useDelivery();
  const { alertDialog } = state;

  if (!alertDialog || !alertDialog.isOpen) return null;

  const { title, message, type, buttonText } = alertDialog;

  const getTheme = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertTriangle size={28} color="#D97706" />,
          iconBg: '#FEF3C7',
          iconBorder: '#FDE68A',
          btnBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          btnShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
        };
      case 'error':
        return {
          icon: <AlertCircle size={28} color="#E11D48" />,
          iconBg: '#FFE4E6',
          iconBorder: '#FECDD3',
          btnBg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
          btnShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={28} color="#059669" />,
          iconBg: '#ECFDF5',
          iconBorder: '#A7F3D0',
          btnBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          btnShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
        };
      case 'info':
      default:
        return {
          icon: <Info size={28} color="#0071E3" />,
          iconBg: '#EFF6FF',
          iconBorder: '#BFDBFE',
          btnBg: 'linear-gradient(135deg, #0071E3 0%, #005bb5 100%)',
          btnShadow: '0 4px 14px rgba(0, 113, 227, 0.35)',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={closeAlert}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '380px',
          padding: '24px 20px 20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          position: 'relative',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Button */}
        <button
          type="button"
          onClick={closeAlert}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F1F5F9',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'background 0.15s ease',
          }}
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Icon Badge */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: theme.iconBg,
            border: `1.5px solid ${theme.iconBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {theme.icon}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0 0 10px',
            letterSpacing: '-0.3px',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          style={{
            fontSize: '13.5px',
            color: '#475569',
            margin: '0 0 22px',
            lineHeight: 1.55,
            padding: '0 6px',
            fontWeight: 500,
          }}
        >
          {message}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={closeAlert}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '14px',
            background: theme.btnBg,
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: theme.btnShadow,
            transition: 'transform 0.1s ease, filter 0.15s ease',
            outline: 'none',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {buttonText || 'Understood'}
        </button>
      </div>
    </div>
  );
};

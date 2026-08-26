import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { AlertTriangle, Phone, ShieldAlert, X, LifeBuoy } from 'lucide-react';

export const SOSModal: React.FC = () => {
  const { closeModal } = useDelivery();

  const handleDial = (service: string) => {
    alert(`Connecting to ${service}... (Simulated emergency protocol activated)`);
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content glass-strong"
        style={{
          maxWidth: '440px',
          padding: '24px',
          borderRadius: '24px',
          border: '1px solid var(--glass-border-strong)',
          boxShadow: 'var(--shadow-glass-modal)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 59, 48, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={22} color="var(--color-red)" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-red)', margin: 0 }}>
                Safety SOS & Support
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0 }}>
                Instant Emergency & Dispatch Helpline
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-warm-white)',
              border: '1px solid var(--color-border-gray)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-graphite)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--color-graphite)', marginBottom: '16px', lineHeight: '1.4' }}>
          If you are facing a physical emergency, medical concern, or serious road accident, tap below to contact the nearest emergency services or our 24/7 Safety Command Center.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => handleDial('GrabIt 24/7 Safety Dispatch')}
            className="btn-danger-solid"
            style={{ width: '100%', padding: '14px', justifyContent: 'flex-start', gap: '12px' }}
          >
            <ShieldAlert size={20} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>Call Safety Response Team</div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>Priority line for partner roadside emergencies</div>
            </div>
          </button>

          <button
            onClick={() => handleDial('Local Police & Ambulance (911)')}
            className="btn-secondary"
            style={{ width: '100%', padding: '14px', justifyContent: 'flex-start', gap: '12px', border: '1px solid var(--color-border-gray)' }}
          >
            <Phone size={18} color="var(--color-red)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-graphite)' }}>Call Police / Ambulance</div>
              <div style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>Dial standard emergency helpline (911)</div>
            </div>
          </button>

          <button
            onClick={() => handleDial('Merchant & Order Resolution Desk')}
            className="btn-secondary"
            style={{ width: '100%', padding: '14px', justifyContent: 'flex-start', gap: '12px' }}
          >
            <LifeBuoy size={18} color="var(--color-blue)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-graphite)' }}>Dispatch Support Desk</div>
              <div style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>For restaurant delays and app route issues</div>
            </div>
          </button>
        </div>

        <button
          onClick={closeModal}
          className="btn-secondary"
          style={{ width: '100%', padding: '10px', fontSize: '13px' }}
        >
          Dismiss & Return
        </button>
      </div>
    </div>
  );
};

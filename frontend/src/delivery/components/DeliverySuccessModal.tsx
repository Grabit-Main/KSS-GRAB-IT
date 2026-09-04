import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { CheckCircle2, PackageCheck, MapPin, Store, Navigation2, ArrowRight } from 'lucide-react';

export const DeliverySuccessModal: React.FC = () => {
  const { state, closeModal } = useDelivery();
  const { successOrderSummary } = state;
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  const handleDone = () => {
    closeModal();
    navigate('/delivery/dashboard');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [closeModal]);

  if (!successOrderSummary) return null;

  return (
    <div className="modal-overlay" style={{ padding: '16px' }}>
      <div
        className="modal-content glass-strong"
        style={{
          maxWidth: '460px',
          borderRadius: '24px',
          border: '1px solid var(--glass-border-strong)',
          textAlign: 'center',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-glass-modal)'
        }}
      >
        {/* Top Green Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-green)',
            color: '#FFFFFF',
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(52, 199, 89, 0.3)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}
          >
            <CheckCircle2 size={38} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
            Delivery Completed!
          </h2>
          <p style={{ fontSize: '13px', margin: 0, opacity: 0.95 }}>
            Handover verified via OTP • Proof saved successfully
          </p>
        </div>

        {/* Order Summary Details */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div
            style={{
              backgroundColor: 'var(--color-warm-white)',
              border: '1px solid var(--color-border-gray)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-graphite)' }}>
                {successOrderSummary.orderNumber}
              </span>
              <span className="badge badge-green">Delivered</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--color-soft-gray)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Store size={14} color="var(--color-blue)" />
                <span>{successOrderSummary.merchant.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--color-green)" />
                <span>{successOrderSummary.customer.name} ({successOrderSummary.customer.address})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation2 size={14} color="var(--color-graphite)" />
                <span>{successOrderSummary.distanceKm} km trip • Completed at {successOrderSummary.deliveredAt}</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0 }}>
            Returning to Dashboard radar in <b style={{ color: 'var(--color-graphite)' }}>{countdown}s</b>...
          </p>

          <button
            onClick={handleDone}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: '700' }}
          >
            Return to Dashboard Now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

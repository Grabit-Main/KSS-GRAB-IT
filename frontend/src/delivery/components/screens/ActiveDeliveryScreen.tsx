import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../../context/DeliveryContext';
import { ActiveDeliveryView } from '../ActiveDeliveryView';
import { Navigation, ArrowRight } from 'lucide-react';

export const ActiveDeliveryScreen: React.FC = () => {
  const { state } = useDelivery();
  const { agentStatus, currentOrder } = state;
  const navigate = useNavigate();

  const isVerifiedRider = (() => {
    try {
      const u = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('grabit_user') || '{}' : '{}');
      if (u.partnerVerified === true) return true;
      const clearances = u.clearances || {};
      const ts = u.clearanceTimestamps || u.clearance_timestamps || {};
      const ONE_HOUR = 60 * 60 * 1000;
      const now = Date.now();
      const biometricsDone = !!(u.biometricsDone || u.selfieImage || u.avatar_url || u.selfie_image);
      const dlSubmitted = !!(u.drivingLicense || u.driving_license || u.vehicle || u.plate);
      const dlTs = ts.dl;
      const dlVerified = dlSubmitted && dlTs && (now - dlTs >= ONE_HOUR);
      return biometricsDone && dlVerified;
    } catch {
      return false;
    }
  })();

  if (!isVerifiedRider || agentStatus !== 'ON_DELIVERY' || !currentOrder) {
    return (
      <div
        className="card page-enter"
        style={{
          textAlign: 'center',
          padding: '60px 24px',
          backgroundColor: 'var(--color-pure-white)'
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-blue-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1px solid rgba(0, 113, 227, 0.2)'
          }}
        >
          <Navigation size={32} color="var(--color-blue)" />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '8px' }}>
          No Active Delivery
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-soft-gray)', maxWidth: '420px', margin: '0 auto 24px' }}>
          You currently have zero active deliveries. When an order is accepted, live navigation and delivery progress will appear here.
        </p>

        <button
          onClick={() => navigate('/delivery/dashboard')}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '700' }}
        >
          Go to Dashboard <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <ActiveDeliveryView />
    </div>
  );
};

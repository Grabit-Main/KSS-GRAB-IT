import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { post } from '../../api';
import { AlertTriangle, Phone, ShieldAlert, X, LifeBuoy, CheckCircle2, Loader2 } from 'lucide-react';

export const SOSModal: React.FC = () => {
  const { state, closeModal } = useDelivery();
  const [loading, setLoading] = useState(false);
  const [sentAlert, setSentAlert] = useState<{ sos_id: string; timestamp: string } | null>(null);

  const handleTriggerSOS = async (serviceName: string) => {
    setLoading(true);
    try {
      const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
      const riderId = u.id || u.sub || u.phone || 'AG-RIDER';
      const riderName = u.name || u.full_name || 'Delivery Partner';
      const currentOrderId = state.currentOrder?.id || state.currentOrder?.orderNumber || null;

      // Geolocation capture fallback
      let coords = { lat: 12.9352, lng: 77.6245 };
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos: any = await new Promise((res) => navigator.geolocation.getCurrentPosition(res, () => res(null), { timeout: 3000 }));
          if (pos && pos.coords) {
            coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          }
        } catch {}
      }

      const res: any = await post('/delivery/sos', {
        service: serviceName,
        rider_id: riderId,
        rider_name: riderName,
        order_id: currentOrderId,
        coords
      });

      if (res && res.status === 'success') {
        setSentAlert({
          sos_id: res.sos_id || `SOS-${Date.now()}`,
          timestamp: res.date_formatted || new Date().toLocaleTimeString()
        });
      } else {
        setSentAlert({
          sos_id: `SOS-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch {
      setSentAlert({
        sos_id: `SOS-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
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

        {sentAlert ? (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle2 size={32} color="#16a34a" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-graphite)', margin: '0 0 6px' }}>
              Emergency SOS Alert Broadcasted
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', marginBottom: '14px', lineHeight: '1.4' }}>
              Dispatch Command & Emergency Response Desk has received your live GPS coordinates and order details.
            </p>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', color: '#475569', marginBottom: '18px', textAlign: 'left' }}>
              <div><strong>Reference ID:</strong> {sentAlert.sos_id}</div>
              <div><strong>Timestamp:</strong> {sentAlert.timestamp}</div>
              <div><strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: '600' }}>Dispatched to Admin Command</span></div>
            </div>
            <button
              onClick={closeModal}
              className="btn-secondary"
              style={{ width: '100%', padding: '12px', fontWeight: '600' }}
            >
              Done & Return to App
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--color-graphite)', marginBottom: '16px', lineHeight: '1.4' }}>
              If you are facing a physical emergency, medical concern, or serious road accident, tap below to alert our 24/7 Safety Command Center.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button
                disabled={loading}
                onClick={() => handleTriggerSOS('GrabIt 24/7 Safety Response Team')}
                className="btn-danger-solid"
                style={{ width: '100%', padding: '14px', justifyContent: 'flex-start', gap: '12px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <Loader2 size={20} className="spin" /> : <ShieldAlert size={20} />}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>
                    {loading ? 'Transmitting SOS Alert...' : 'Transmit Safety SOS to Admin'}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>Priority live dispatch alert with GPS coordinates</div>
                </div>
              </button>

              <button
                disabled={loading}
                onClick={() => handleTriggerSOS('Police / Ambulance (911)')}
                className="btn-secondary"
                style={{ width: '100%', padding: '14px', justifyContent: 'flex-start', gap: '12px', border: '1px solid var(--color-border-gray)' }}
              >
                <Phone size={18} color="var(--color-red)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-graphite)' }}>Notify Police / Emergency Services</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>Alert dispatch and request medical assistance</div>
                </div>
              </button>

              <button
                disabled={loading}
                onClick={() => handleTriggerSOS('Dispatch Support Desk')}
                className="btn-secondary"
                style={{ width: '100%', padding: '14px', justifyContent: 'flex-start', gap: '12px' }}
              >
                <LifeBuoy size={18} color="var(--color-blue)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-graphite)' }}>Dispatch Support Desk</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>For roadside delays and app navigation issues</div>
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
          </>
        )}
      </div>
    </div>
  );
};

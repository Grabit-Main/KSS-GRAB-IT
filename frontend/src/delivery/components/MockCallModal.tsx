import React, { useState, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { soundEngine } from '../utils/audio';
import { Phone, PhoneOff, Mic, MicOff, Volume2, User, Store, ShieldCheck, Smartphone } from 'lucide-react';

interface MockCallModalProps {
  type: 'CUSTOMER' | 'MERCHANT';
}

export const MockCallModal: React.FC<MockCallModalProps> = ({ type }) => {
  const { state, closeModal } = useDelivery();
  const { currentOrder } = state;
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callState, setCallState] = useState<'RINGING' | 'CONNECTED'>('RINGING');

  const contactName =
    type === 'CUSTOMER'
      ? currentOrder?.customer.name || 'Rahul Sharma'
      : currentOrder?.merchant.name || 'GrabIt Supermarket (Dispatch Bay 3)';

  const contactPhone =
    type === 'CUSTOMER'
      ? currentOrder?.customer.phone || '+91 98450 12891'
      : currentOrder?.merchant.phone || '+91 (080) 4120-8800';

  // Ringing audio and 2-second connection
  useEffect(() => {
    soundEngine.playOutgoingRingtone();
    const ringTimer = setTimeout(() => {
      setCallState('CONNECTED');
    }, 2000);

    return () => clearTimeout(ringTimer);
  }, []);

  // Call duration counter
  useEffect(() => {
    if (callState === 'CONNECTED') {
      const interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDialCellular = () => {
    const cleanNum = contactPhone.replace(/[^0-9+]/g, '');
    if (cleanNum) {
      window.location.href = `tel:${cleanNum}`;
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '380px',
          backgroundColor: '#1C1C1E',
          color: '#FFFFFF',
          padding: '28px 20px',
          textAlign: 'center',
          borderRadius: '24px',
          border: '1px solid #2C2C2E',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
        }}
      >
        {/* In-App Call Privacy Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(52, 199, 89, 0.15)', border: '1px solid rgba(52, 199, 89, 0.3)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, color: '#34C759', marginBottom: '16px' }}>
          <ShieldCheck size={13} />
          <span>In-App Masked Call (VoIP HD)</span>
        </div>

        {/* Avatar */}
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: type === 'CUSTOMER' ? '#34C759' : '#0071E3',
            margin: '0 auto 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}
        >
          {type === 'CUSTOMER' ? <User size={38} color="#FFFFFF" /> : <Store size={38} color="#FFFFFF" />}
        </div>

        <h3 style={{ fontSize: '19px', fontWeight: '800', margin: '0 0 4px', color: '#FFFFFF' }}>{contactName}</h3>
        <p style={{ fontSize: '12.5px', color: '#8E8E93', margin: '0 0 8px' }}>{contactPhone}</p>

        {/* Call State / Duration */}
        <div style={{ marginBottom: '24px' }}>
          {callState === 'RINGING' ? (
            <span style={{ fontSize: '13.5px', color: '#0A84FF', fontWeight: '700' }} className="animate-pulse">
              ● Ringing customer...
            </span>
          ) : (
            <span style={{ fontSize: '14.5px', color: '#34C759', fontWeight: '800' }}>
              {formatTime(seconds)} • HD Voice Connected
            </span>
          )}
        </div>

        {/* Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: isMuted ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
              color: isMuted ? '#1C1C1E' : '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setIsSpeaker(!isSpeaker)}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: isSpeaker ? '#0A84FF' : 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Toggle Speaker"
          >
            <Volume2 size={20} />
          </button>

          <button
            type="button"
            onClick={handleDialCellular}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Dial via Phone Carrier"
          >
            <Smartphone size={20} />
          </button>
        </div>

        {/* End Call Button */}
        <button
          type="button"
          onClick={closeModal}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#FF3B30',
            color: '#FFFFFF',
            border: 'none',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255, 59, 48, 0.4)'
          }}
        >
          <PhoneOff size={26} />
        </button>
        <span style={{ display: 'block', marginTop: '8px', fontSize: '11.5px', color: '#8E8E93', fontWeight: 600 }}>
          End Call
        </span>
      </div>
    </div>
  );
};

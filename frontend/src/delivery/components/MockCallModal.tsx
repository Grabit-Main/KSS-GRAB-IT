import React, { useState, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { Phone, PhoneOff, Mic, MicOff, Volume2, User, Store } from 'lucide-react';

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
      ? currentOrder?.customer.name || 'Customer'
      : currentOrder?.merchant.name || 'GrabIt Supermarket (Dispatch Bay 3)';

  const contactPhone =
    type === 'CUSTOMER'
      ? currentOrder?.customer.phone || '+91 98450 12891'
      : currentOrder?.merchant.phone || '+91 (080) 4120-8800';

  // Ringing for 2 seconds then connect
  useEffect(() => {
    const ringTimer = setTimeout(() => {
      setCallState('CONNECTED');
    }, 1800);

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

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: '380px',
          backgroundColor: 'var(--color-graphite)',
          color: '#FFFFFF',
          padding: '32px 24px',
          textAlign: 'center',
          borderRadius: '24px',
          border: '1px solid #3A3A3C'
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: type === 'CUSTOMER' ? 'var(--color-green)' : 'var(--color-blue)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}
        >
          {type === 'CUSTOMER' ? <User size={40} color="#FFFFFF" /> : <Store size={40} color="#FFFFFF" />}
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px', color: '#FFFFFF' }}>{contactName}</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: '0 0 12px' }}>{contactPhone}</p>

        {/* Call State / Duration */}
        <div style={{ marginBottom: '32px' }}>
          {callState === 'RINGING' ? (
            <span style={{ fontSize: '14px', color: 'var(--color-blue)', fontWeight: '600' }} className="animate-pulse">
              Ringing...
            </span>
          ) : (
            <span style={{ fontSize: '15px', color: 'var(--color-green)', fontWeight: '700' }}>
              {formatTime(seconds)} • HD Voice Connected
            </span>
          )}
        </div>

        {/* Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '32px' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: isMuted ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
              color: isMuted ? 'var(--color-graphite)' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: isSpeaker ? 'var(--color-blue)' : 'rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Volume2 size={22} />
          </button>
        </div>

        {/* End Call Button */}
        <button
          onClick={closeModal}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-red)',
            color: '#FFFFFF',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(255, 59, 48, 0.4)'
          }}
        >
          <PhoneOff size={28} />
        </button>
        <span style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: 'var(--color-soft-gray)' }}>
          End Call
        </span>
      </div>
    </div>
  );
};

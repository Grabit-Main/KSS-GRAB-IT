import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import {
  Package,
  MapPin,
  Clock,
  IndianRupee,
  Navigation,
  X,
  Zap,
  Map
} from 'lucide-react';

/**
 * NewOrderPopup
 * Slides up from the bottom whenever a new order is assigned (agentStatus becomes ON_DELIVERY).
 * Dismisses when the user taps "View Order" (navigates to /active-delivery) or the X button.
 */
export const NewOrderPopup: React.FC = () => {
  const { state, acceptOrder, rejectOffer } = useDelivery();
  const { pendingOffer, offerSecondsRemaining } = state;
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (pendingOffer) {
      setVisible(true);
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setVisible(false), 340);
      return () => clearTimeout(timer);
    }
  }, [pendingOffer]);

  if (!visible || !pendingOffer) {
    return null;
  }

  const dismiss = () => {
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 340);
  };

  const handleAccept = async () => {
    if (!pendingOffer) return;
    const targetOffer = pendingOffer;
    setVisible(false);
    setAnimateIn(false);
    await acceptOrder(targetOffer);
    navigate('/delivery/active-delivery');
  };

  const handleReject = async () => {
    if (!pendingOffer) return;
    dismiss();
    await rejectOffer(pendingOffer);
  };

  const handleOpenInMaps = () => {
    if (!pendingOffer) return;
    const address = pendingOffer.customer.address;
    const coords = pendingOffer.customer.coordinates;
    let url: string;
    if (address) {
      const dest = encodeURIComponent(address);
      url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    } else if (coords?.lat && coords?.lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pendingOffer.customer.name)}`;
    }
    window.open(url, '_blank');
  };

  if (!visible || !pendingOffer) return null;

  return (
    <>
      {/* Dim backdrop */}
      <div
        onClick={handleReject}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 9000,
          opacity: animateIn ? 1 : 0,
          transition: 'opacity 0.3s ease',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Popup card */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: animateIn
            ? 'translate(-50%, 0)'
            : 'translate(-50%, 110%)',
          transition: 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 9001,
          width: '100%',
          maxWidth: '480px',
          padding: '0 0 env(safe-area-inset-bottom)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #0D1B3E 0%, #0A2463 50%, #1251A3 100%)',
            borderRadius: '28px 28px 0 0',
            padding: '28px 24px 32px',
            boxShadow: '0 -8px 60px rgba(0, 0, 0, 0.45)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative glow blobs */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(33,150,243,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(100,220,120,0.1)', filter: 'blur(30px)', pointerEvents: 'none' }} />

          {/* Close / Reject button */}
          <button
            onClick={handleReject}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <X size={15} />
          </button>

          {/* Header badge with countdown timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(50, 215, 75, 0.2)',
                border: '1px solid rgba(50, 215, 75, 0.4)',
                borderRadius: '20px',
                padding: '5px 12px',
              }}
            >
              <Zap size={13} color="#32D74B" />
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#32D74B', letterSpacing: '0.5px' }}>
                NEW OFFER • EXPIRES IN {offerSecondsRemaining}s
              </span>
            </div>
          </div>

          {/* Order number */}
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {pendingOffer.orderNumber}
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 22px' }}>
            GrabIt Supermarket → {pendingOffer.customer.name}
          </p>

          {/* Info pills row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
            {[
              { icon: <MapPin size={13} />, text: `${pendingOffer.distanceKm} km away` },
              { icon: <Clock size={13} />, text: `~${pendingOffer.estimatedMinutes ?? 20} min` },
              { icon: <IndianRupee size={13} />, text: `₹${pendingOffer.totalAmount.toFixed(0)}` },
              { icon: <Package size={13} />, text: `${pendingOffer.items.length} items` },
            ].map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                {icon}
                {text}
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '22px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <MapPin size={16} color="#32D74B" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: '700' }}>
                Deliver to
              </p>
              <p style={{ fontSize: '13px', color: '#FFFFFF', margin: 0, fontWeight: '600' }}>
                {pendingOffer.customer.address}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Open in Maps */}
            <button
              onClick={handleOpenInMaps}
              style={{
                flex: '0 0 auto',
                padding: '16px 14px',
                background: 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
              title="Open destination in Google Maps"
            >
              <Map size={16} />
              Maps
            </button>

            {/* Reject Button */}
            <button
              onClick={handleReject}
              style={{
                flex: 1,
                padding: '16px 12px',
                background: 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '900',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                letterSpacing: '-0.2px',
                boxShadow: '0 4px 24px rgba(255, 59, 48, 0.4)',
              }}
            >
              <X size={16} />
              Reject
            </button>

            {/* Accept Button */}
            <button
              onClick={handleAccept}
              style={{
                flex: 1.2,
                padding: '16px 14px',
                background: 'linear-gradient(135deg, #32D74B 0%, #28C240 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '900',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                letterSpacing: '-0.2px',
                boxShadow: '0 4px 24px rgba(50, 215, 75, 0.4)',
              }}
            >
              <Navigation size={16} />
              Accept Offer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

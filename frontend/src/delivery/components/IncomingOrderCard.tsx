import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import {
  MapPin,
  Store,
  Clock,
  Navigation2,
  Zap,
  Check,
  Package,
  ShoppingBag,
  Info
} from 'lucide-react';

export const IncomingOrderCard: React.FC = () => {
  const { state, acceptOrder } = useDelivery();
  const { incomingOrder, incomingCountdown } = state;
  const navigate = useNavigate();

  if (!incomingOrder) return null;

  const isCOD = incomingOrder.paymentMethod === 'COD';

  const handleAccept = () => {
    acceptOrder();
    navigate('/delivery/active-delivery');
  };

  return (
    <div
      className="glass-card card-pop"
      style={{
        padding: 0,
        borderRadius: '24px',
        border: '1.5px solid rgba(0, 113, 227, 0.4)',
        boxShadow: '0 16px 48px rgba(0, 113, 227, 0.16), 0 4px 12px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        maxWidth: '560px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.86)',
        backdropFilter: 'blur(28px) saturate(190%)',
        WebkitBackdropFilter: 'blur(28px) saturate(190%)'
      }}
    >
      {/* Top Banner with 30s Circular Countdown */}
      <div
        style={{
          background: 'rgba(29, 29, 31, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: 'var(--color-pure-white)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0, 113, 227, 0.4)'
            }}
          >
            <ShoppingBag size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                New Delivery Request
              </h3>
              {incomingOrder.isPriority && (
                <span
                  style={{
                    backgroundColor: 'var(--color-red)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <Zap size={10} fill="#FFFFFF" /> PRIORITY
                </span>
              )}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-soft-gray)', margin: '1px 0 0' }}>
              Order {incomingOrder.orderNumber} • Assigned to you ({incomingOrder.createdAt})
            </p>
          </div>
        </div>

        {/* 30s Countdown Ring */}
        <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="3.5"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke={incomingCountdown <= 10 ? 'var(--color-red)' : 'var(--color-blue)'}
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={2 * Math.PI * 20 - (incomingCountdown / 30) * (2 * Math.PI * 20)}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: '800', color: incomingCountdown <= 10 ? 'var(--color-red)' : '#FFFFFF' }}>
              {incomingCountdown}s
            </span>
          </div>
        </div>
      </div>

      {/* Body: Compact Frosted Glass Layout */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* 3-Column Stats Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            padding: '10px 12px',
            borderRadius: '14px',
            border: '1px solid var(--glass-border-subtle)'
          }}
        >
          <div>
            <span style={{ fontSize: '10.5px', color: 'var(--color-soft-gray)', fontWeight: '600', display: 'block' }}>Trip Distance</span>
            <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-graphite)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Navigation2 size={13} color="var(--color-blue)" /> {incomingOrder.distanceKm} km
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10.5px', color: 'var(--color-soft-gray)', fontWeight: '600', display: 'block' }}>Estimated ETA</span>
            <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-graphite)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="var(--color-blue)" /> {incomingOrder.estimatedMinutes} mins
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10.5px', color: 'var(--color-soft-gray)', fontWeight: '600', display: 'block' }}>Payment</span>
            {isCOD ? (
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-red)' }}>
                COD (₹{incomingOrder.codAmount?.toFixed(2)})
              </span>
            ) : (
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-green)' }}>
                Prepaid Online
              </span>
            )}
          </div>
        </div>

        {/* Route Details Box */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid var(--glass-border-medium)',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {/* Pickup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 113, 227, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Store size={14} color="var(--color-blue)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--color-blue)', textTransform: 'uppercase' }}>
                  Pickup:
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-graphite)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  GrabIt Supermarket (Bay 3, Koramangala)
                </span>
              </div>
            </div>
          </div>

          {/* Connecting dashed line */}
          <div style={{ marginLeft: '13px', height: '6px', borderLeft: '1.5px dashed var(--color-border-gray)' }} />

          {/* Deliver */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: 'rgba(52, 199, 89, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <MapPin size={14} color="var(--color-green)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--color-green)', textTransform: 'uppercase' }}>
                  Deliver:
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-graphite)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {incomingOrder.customer.name}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-soft-gray)', margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {incomingOrder.customer.address}
              </p>
            </div>
          </div>
        </div>

        {/* Grocery Items Summary */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            borderRadius: '10px',
            padding: '8px 12px',
            border: '1px solid var(--glass-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <Package size={14} color="var(--color-soft-gray)" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: '600', color: 'var(--color-graphite)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {incomingOrder.items.length} items: {incomingOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
            </span>
          </div>
          <span style={{ fontWeight: '800', color: 'var(--color-graphite)', marginLeft: '8px', flexShrink: 0 }}>
            ₹{incomingOrder.totalAmount.toFixed(2)}
          </span>
        </div>

        {incomingOrder.specialInstructions && (
          <div
            style={{
              padding: '7px 12px',
              borderRadius: '9px',
              backgroundColor: isCOD ? 'rgba(255, 59, 48, 0.08)' : 'rgba(0, 113, 227, 0.08)',
              border: `1px solid ${isCOD ? 'rgba(255, 59, 48, 0.25)' : 'rgba(0, 113, 227, 0.25)'}`,
              fontSize: '11.5px',
              color: isCOD ? 'var(--color-red)' : 'var(--color-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Info size={13} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {incomingOrder.specialInstructions}
            </span>
          </div>
        )}

        {/* Solid Blue High-Tactility Accept Button (Reject Removed) */}
        <button
          onClick={handleAccept}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '15.5px',
            fontWeight: '700',
            borderRadius: '14px',
            marginTop: '2px'
          }}
        >
          <Check size={20} /> Accept Delivery
        </button>

      </div>
    </div>
  );
};

import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { OrderStatus } from '../types/delivery';
import { RouteMapVisualizer } from './RouteMapVisualizer';
import {
  CheckCircle2,
  MapPin,
  Store,
  Phone,
  MessageSquare,
  AlertCircle,
  Package,
  Navigation,
  Zap,
  Info,
  ShieldCheck,
  ChevronRight,
  Truck,
  CreditCard
} from 'lucide-react';

/* ─── Step icon mapping (matching reference image style) ─── */
const stepIcons: Record<string, React.ReactNode> = {
  ASSIGNED: <Package size={16} color="currentColor" />,
  PICKED_UP: <Truck size={16} color="currentColor" />,
  OUT_FOR_DELIVERY: <MapPin size={16} color="currentColor" />,
  ARRIVED: <Navigation size={16} color="currentColor" />,
  DELIVERED: <CheckCircle2 size={16} color="currentColor" />,
};

export const ActiveDeliveryView: React.FC = () => {
  const { state, advanceStatus, openModal } = useDelivery();
  const { currentOrder } = state;

  if (!currentOrder) return null;

  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'OUT_FOR_DELIVERY', label: 'On Route' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  let currentStepIndex = steps.findIndex((s) => s.key === currentOrder.status);
  if (currentStepIndex === -1) currentStepIndex = 0;

  const isCOD = currentOrder.paymentMethod === 'COD';

  /* Current step instruction text */
  const stepInstructions: Record<string, string> = {
    ASSIGNED: `Head to GrabIt Supermarket Dispatch Bay 3\n(80 Feet Road)`,
    PICKED_UP: `Head to customer location\n${currentOrder.customer.address}`,
    OUT_FOR_DELIVERY: `On route to ${currentOrder.customer.name}\n${currentOrder.customer.address}`,
    ARRIVED: `You have arrived at the doorstep\nAsk customer for 4-digit OTP to confirm delivery`,
    DELIVERED: `Delivery completed successfully!`,
  };

  const currentInstruction = stepInstructions[currentOrder.status] ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '40px' }}>

      {/* ── 1. Order Header Card — Light Blue Glassmorphism ── */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(219, 234, 254, 0.85) 0%, rgba(191, 219, 254, 0.70) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '22px',
          border: '1px solid rgba(147, 197, 253, 0.5)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.10)',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative 3D box in top-right corner */}
        <div
          style={{
            position: 'absolute',
            right: '-10px',
            top: '-10px',
            width: '110px',
            height: '110px',
            opacity: 0.18,
            pointerEvents: 'none',
          }}
        >
          <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" width="110" height="110">
            <rect x="20" y="35" width="55" height="55" rx="6" fill="#3B82F6" />
            <rect x="35" y="15" width="55" height="55" rx="6" fill="#60A5FA" />
            <rect x="35" y="15" width="55" height="8" rx="4" fill="#93C5FD" />
            <path d="M35 15 L20 35" stroke="#93C5FD" strokeWidth="2" />
            <path d="M90 15 L75 35" stroke="#93C5FD" strokeWidth="2" />
          </svg>
        </div>

        {/* Order number + priority row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          {/* Blue box icon */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              flexShrink: 0,
            }}
          >
            <Package size={22} color="#FFFFFF" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontSize: '19px',
                  fontWeight: '800',
                  color: '#1D1D1F',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
              >
                Order {currentOrder.orderNumber}
              </h2>
              {currentOrder.isPriority && (
                <span
                  style={{
                    backgroundColor: '#FF3B30',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    letterSpacing: '0.3px',
                  }}
                >
                  <Zap size={9} fill="#FFFFFF" /> PRIORITY
                </span>
              )}
            </div>
            <p style={{ fontSize: '12.5px', color: '#60A5FA', margin: '2px 0 0', fontWeight: '600' }}>
              {currentOrder.distanceKm} km · ~{currentOrder.estimatedMinutes} min
            </p>
          </div>
        </div>

        {/* Payment badge */}
        <div style={{ marginTop: '12px' }}>
          {isCOD ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 59, 48, 0.12)',
                color: '#FF3B30',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '20px',
                padding: '5px 14px',
                fontSize: '13px',
                fontWeight: '700',
              }}
            >
              💰 Cash on Delivery: ₹{currentOrder.codAmount?.toFixed(2)}
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(52, 199, 89, 0.15)',
                color: '#16A34A',
                border: '1px solid rgba(52, 199, 89, 0.35)',
                borderRadius: '20px',
                padding: '5px 14px',
                fontSize: '13px',
                fontWeight: '700',
              }}
            >
              <CreditCard size={13} /> Prepaid Online (₹{currentOrder.totalAmount.toFixed(2)})
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Interactive Route Map ── */}
      <RouteMapVisualizer
        orderStatus={currentOrder.status}
        merchantName="GrabIt Supermarket (Hub)"
        customerName={currentOrder.customer.name}
        customerAddress={currentOrder.customer.address}
        distanceKm={currentOrder.distanceKm}
        estimatedMinutes={currentOrder.estimatedMinutes}
        hubCoords={currentOrder.merchant.coordinates}
        customerCoords={currentOrder.customer.coordinates}
      />

      {/* ── 3. Grocery Items Card ── */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: '22px',
          border: '1px solid rgba(210, 210, 215, 0.6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={17} color="#1D1D1F" />
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1D1D1F', margin: 0 }}>
              Grocery Items ({currentOrder.items.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F' }}>
            ₹{currentOrder.totalAmount.toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentOrder.items.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(245, 245, 247, 0.8)',
                borderRadius: '12px',
                border: '1px solid rgba(210, 210, 215, 0.5)',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #D2D2D7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                  {item.quantity}
                </span>
                <span style={{ fontWeight: '600', color: '#1D1D1F', flex: 1, minWidth: 0, lineHeight: '1.35' }}>{item.name}</span>
                <span style={{ fontWeight: '700', color: '#1D1D1F', flexShrink: 0 }}>₹{item.price.toFixed(2)}</span>
              </div>
              {(item.category || item.temperature) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px', paddingLeft: '32px' }}>
                  {item.category && (
                    <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', backgroundColor: 'rgba(0,113,227,0.08)', color: '#0071E3', fontWeight: '600' }}>
                      {item.category}
                    </span>
                  )}
                  {item.temperature && (
                    <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', backgroundColor: item.temperature === 'Hot' ? 'rgba(255,59,48,0.10)' : 'rgba(0,113,227,0.10)', color: item.temperature === 'Hot' ? '#FF3B30' : '#0071E3' }}>
                      {item.temperature}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Action Buttons Container ── */}
      <div
        className="sticky-step-footer"
        style={{
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          boxShadow: '0 4px 24px rgba(29, 29, 31, 0.10)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          borderRadius: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          {(currentOrder.status === 'ASSIGNED' || currentOrder.status === 'ACCEPTED' || currentOrder.status === 'REACHED_PICKUP') && (
            <button onClick={() => advanceStatus('PICKED_UP')} className="btn-primary" style={{ flex: 1, padding: '13px 14px', fontSize: '14px', fontWeight: '700' }}>
              Confirm Pickup at Bay 3 <ChevronRight size={17} />
            </button>
          )}
          {currentOrder.status === 'PICKED_UP' && (
            <button onClick={() => advanceStatus('OUT_FOR_DELIVERY')} className="btn-primary" style={{ flex: 1, padding: '13px 14px', fontSize: '14px', fontWeight: '700' }}>
              Start Delivery to Customer <ChevronRight size={17} />
            </button>
          )}
          {currentOrder.status === 'OUT_FOR_DELIVERY' && (
            <>
              <button onClick={() => openModal('REPORT_ISSUE')} className="btn-danger" style={{ padding: '13px 14px', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                <AlertCircle size={15} /> Issue
              </button>
              <button onClick={() => advanceStatus('ARRIVED')} className="btn-primary" style={{ flex: 1, padding: '13px 14px', fontSize: '14px', fontWeight: '700' }}>
                Arrived at Doorstep <ChevronRight size={17} />
              </button>
            </>
          )}
          {currentOrder.status === 'ARRIVED' && (
            <>
              <button onClick={() => openModal('REPORT_ISSUE')} className="btn-danger" style={{ padding: '13px 14px', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                <AlertCircle size={15} /> Issue
              </button>
              <button onClick={() => openModal('POD')} className="btn-success" style={{ flex: 1, padding: '13px 14px', fontSize: '14px', fontWeight: '700' }}>
                <ShieldCheck size={16} /> Complete — Enter OTP
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 5. Delivery Progress Tracker ── */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: '22px',
          border: '1px solid rgba(210, 210, 215, 0.6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          padding: '20px 20px 16px',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#1D1D1F' }}>
              Delivery Progress
            </span>
            <span style={{ fontSize: '12px', color: '#86868B' }}>· Live Updates</span>
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#0071E3',
              backgroundColor: 'rgba(0, 113, 227, 0.08)',
              border: '1px solid rgba(0, 113, 227, 0.2)',
              borderRadius: '12px',
              padding: '3px 10px',
            }}
          >
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Steps row */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* Icon circle */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.4s ease',
                      backgroundColor: isCompleted
                        ? '#0071E3'
                        : isCurrent
                        ? '#0071E3'
                        : '#F3F4F6',
                      color: isCompleted || isCurrent ? '#FFFFFF' : '#9CA3AF',
                      boxShadow: isCurrent
                        ? '0 0 0 4px rgba(0, 113, 227, 0.15)'
                        : isCompleted
                        ? 'none'
                        : 'none',
                      border: isCompleted
                        ? 'none'
                        : isCurrent
                        ? 'none'
                        : '1.5px solid #D1D5DB',
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={16} color="#FFFFFF" />
                    ) : (
                      <span style={{ color: 'currentColor' }}>
                        {stepIcons[step.key]}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: isCurrent ? '800' : isCompleted ? '600' : '500',
                        color: isCurrent
                          ? '#0071E3'
                          : isCompleted
                          ? '#1D1D1F'
                          : '#9CA3AF',
                        display: 'block',
                        lineHeight: '1.2',
                      }}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: '9px', color: '#86868B', display: 'block', marginTop: '1px' }}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {!isCurrent && (
                      <span style={{ fontSize: '9px', color: '#D1D5DB', display: 'block', marginTop: '1px' }}>
                        –:––
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 6. Delivery Destination & Special Instructions Note ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Customer Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            borderRadius: '22px',
            border: '1px solid rgba(210, 210, 215, 0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #34C759',
            padding: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(52,199,89,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(52,199,89,0.25)' }}>
                <MapPin size={17} color="#34C759" />
              </div>
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#34C759', textTransform: 'uppercase' }}>Delivery Destination</span>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F', margin: 0 }}>{currentOrder.customer.name}</h4>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => openModal('CHAT')} style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(0,113,227,0.08)', border: '1px solid rgba(0,113,227,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <MessageSquare size={15} color="#0071E3" />
              </button>
              <button onClick={() => openModal('CALL')} style={{ padding: '7px 12px', fontSize: '12px', fontWeight: '700', backgroundColor: 'rgba(52,199,89,0.10)', border: '1px solid rgba(52,199,89,0.25)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', cursor: 'pointer' }}>
                <Phone size={13} /> Call
              </button>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#86868B', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 2px', color: '#1D1D1F', fontWeight: '600' }}>{currentOrder.customer.address}</p>
            {currentOrder.customer.apartment && <p style={{ margin: 0 }}>{currentOrder.customer.apartment}</p>}
          </div>

          {/* 1-Tap Google Maps External Navigation Launcher */}
          <button
            type="button"
            onClick={() => {
              const query = encodeURIComponent(currentOrder.customer.address || 'Bengaluru, Karnataka');
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              color: '#0071E3',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(0, 113, 227, 0.08)',
              transition: 'all 0.15s ease'
            }}
          >
            <Navigation size={15} color="#0071E3" />
            <span>Open in Google Maps (Turn-by-Turn GPS)</span>
          </button>

          {/* Customer Doorstep Instruction Badges */}
          <div style={{ backgroundColor: 'rgba(52,199,89,0.06)', borderRadius: '12px', padding: '12px 14px', fontSize: '12.5px', border: '1px solid rgba(52,199,89,0.2)', color: '#1D1D1F' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#16A34A', marginBottom: '6px' }}>
              <ShieldCheck size={15} /> Customer Doorstep Instructions
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              <span style={{ backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(52,199,89,0.3)', fontSize: '11px', fontWeight: '700', color: '#16A34A' }}>
                🚪 Leave at Doorstep
              </span>
              <span style={{ backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(52,199,89,0.3)', fontSize: '11px', fontWeight: '700', color: '#16A34A' }}>
                🔕 Do Not Ring Bell
              </span>
              <span style={{ backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(52,199,89,0.3)', fontSize: '11px', fontWeight: '700', color: '#16A34A' }}>
                🏢 Lift Available
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#4B5563' }}>
              <b>Note:</b> {currentOrder.customer.deliveryNotes || 'Please handle groceries carefully.'}
            </p>
          </div>
        </div>

        {/* Special Instructions Info Box */}
        {currentOrder.specialInstructions && (
          <div style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: isCOD ? 'rgba(255,59,48,0.08)' : 'rgba(0,113,227,0.08)', border: `1px solid ${isCOD ? 'rgba(255,59,48,0.25)' : 'rgba(0,113,227,0.25)'}`, fontSize: '12.5px', color: isCOD ? '#FF3B30' : '#0071E3', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Info size={18} style={{ flexShrink: 0 }} /><span>{currentOrder.specialInstructions}</span>
          </div>
        )}
      </div>

    </div>
  );
};

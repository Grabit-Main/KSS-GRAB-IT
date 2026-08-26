import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { AgentStatusPill } from './AgentStatusPill';
import { IncentiveCard } from './IncentiveCard';
import {
  Radio,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Navigation,
  ShieldCheck,
  History,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Store,
  MapPin,
  Bike
} from 'lucide-react';

export const DashboardAvailable: React.FC = () => {
  const { state, forceDispatchNow, toggleAvailability } = useDelivery();
  const { stats, history, agentStatus, orderPool, currentOrder } = state;
  const navigate = useNavigate();

  const isUnavailable = agentStatus === 'UNAVAILABLE';
  const isOnDelivery = agentStatus === 'ON_DELIVERY' && currentOrder !== null;

  const getStepText = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
      case 'ACCEPTED':
      case 'REACHED_PICKUP':
        return 'Step 1 of 5: Assigned • Head to GrabIt Supermarket (Bay 3)';
      case 'PICKED_UP':
        return 'Step 2 of 5: Groceries Picked Up • Ready to Depart';
      case 'OUT_FOR_DELIVERY':
        return 'Step 3 of 5: On Route to Customer Destination';
      case 'ARRIVED':
        return 'Step 4 of 5: Arrived at Customer Doorstep • Awaiting OTP';
      case 'DELIVERED':
        return 'Step 5 of 5: Delivery Completed';
      default:
        return 'Active Delivery in Progress';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Dashboard Greeting Header */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', margin: '0 0 3px', letterSpacing: '-0.4px' }}>
          Good afternoon, Alex
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--color-soft-gray)', margin: 0 }}>
          {isOnDelivery
            ? `You have an active delivery in progress (${currentOrder?.orderNumber}).`
            : isUnavailable
            ? 'You are currently Unavailable. Toggle to Available to receive deliveries.'
            : 'Ready for your next delivery from GrabIt Supermarket Central Hub?'}
        </p>
      </div>

      {/* Main Top Section: Active Delivery Banner OR Incoming Request Card OR Waiting Radar */}
      {isOnDelivery ? (
        /* Ongoing Delivery Hero Glass Card */
        <div
          className="glass-card"
          style={{
            padding: '24px',
            borderLeft: '5px solid var(--color-blue)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(0, 113, 227, 0.12)',
                  border: '1px solid rgba(0, 113, 227, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Navigation size={24} color="var(--color-blue)" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0 }}>
                    Active Delivery: {currentOrder.orderNumber}
                  </h2>
                  <span className="badge badge-blue">In Progress</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--color-soft-gray)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Store size={14} color="var(--color-blue)" /> {currentOrder.merchant.name}
                  </span>
                  <span>➔</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--color-green)" /> {currentOrder.customer.name} ({currentOrder.distanceKm} km)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/delivery/active-delivery')}
              className="btn-primary"
              style={{
                padding: '12px 22px',
                fontSize: '14px',
                fontWeight: '800',
                gap: '8px',
                borderRadius: '14px',
                boxShadow: '0 4px 16px rgba(0, 113, 227, 0.35)'
              }}
            >
              <Navigation size={16} /> Open Live Map & Stepper <ArrowRight size={16} />
            </button>
          </div>

          {/* Current Step Status Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              borderRadius: '12px',
              border: '1px solid var(--glass-border-subtle)',
              fontSize: '13px',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bike size={16} color="var(--color-blue)" />
              <span style={{ color: 'var(--color-graphite)', fontWeight: '700' }}>
                Status: <span style={{ color: 'var(--color-blue)' }}>On Delivery</span>
              </span>
            </div>

            <span style={{ fontSize: '12px', color: 'var(--color-soft-gray)', fontWeight: '600' }}>
              {currentOrder.items.length} items • ₹{currentOrder.totalAmount.toFixed(2)} ({currentOrder.paymentMethod})
            </span>
          </div>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '44px 24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated Sonar Rings */}
          <div
            style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!isUnavailable && (
              <>
                <div
                  className="animate-pulse-ring"
                  style={{
                    position: 'absolute',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(52, 199, 89, 0.16)',
                    border: '1.5px solid rgba(52, 199, 89, 0.4)'
                  }}
                />
                <div
                  className="animate-pulse-ring"
                  style={{
                    position: 'absolute',
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 113, 227, 0.10)',
                    border: '1.5px solid rgba(0, 113, 227, 0.35)',
                    animationDelay: '0.9s'
                  }}
                />
              </>
            )}

            {/* Central Glass Hub Icon */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: isUnavailable ? 'rgba(134, 134, 139, 0.15)' : 'var(--color-graphite)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(29, 29, 31, 0.18)',
                border: isUnavailable ? '2px solid rgba(134, 134, 139, 0.4)' : '2px solid rgba(255, 255, 255, 0.4)'
              }}
            >
              {isUnavailable ? (
                <Radio size={28} color="var(--color-soft-gray)" />
              ) : (
                <Radio size={32} color="var(--color-green)" />
              )}
            </div>
          </div>

          {/* Title & Pulse Subtext */}
          {isUnavailable ? (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span className="badge badge-gray" style={{ background: 'rgba(134, 134, 139, 0.14)', color: 'var(--color-graphite)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-soft-gray)' }} />
                  Currently Unavailable (Offline)
                </span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                Dispatch Radar Paused
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-soft-gray)', maxWidth: '440px', margin: '0 auto 22px', lineHeight: '1.45' }}>
                You are currently offline and will not receive delivery assignments. Click below to go Available whenever you are ready!
              </p>

              <button
                onClick={toggleAvailability}
                className="btn-success"
                style={{
                  fontSize: '14px',
                  padding: '12px 28px',
                  fontWeight: '800',
                  borderRadius: '14px',
                  boxShadow: '0 4px 16px rgba(52, 199, 89, 0.35)',
                  cursor: 'pointer'
                }}
              >
                Go Available (Start Receiving Orders)
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span className="badge badge-green">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                  Online & Dispatch Ready
                </span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                Waiting for direct assignment
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-soft-gray)', maxWidth: '480px', margin: '0 auto 20px', lineHeight: '1.45' }}>
                Orders from GrabIt Supermarket are assigned directly to you without any manual accept step.
              </p>

              {/* Pulsing Dots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '22px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', opacity: 0.8 }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', opacity: 0.5 }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', opacity: 0.3 }} />
              </div>

              {/* Manual push trigger */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={forceDispatchNow}
                  disabled={orderPool.length === 0}
                  className="btn-secondary"
                  style={{
                    fontSize: '13px',
                    padding: '10px 18px',
                    border: '1px solid rgba(0, 113, 227, 0.35)',
                    color: 'var(--color-blue)',
                    fontWeight: '700'
                  }}
                >
                  <Zap size={15} color="var(--color-blue)" /> Simulate Immediate Order Assignment ({orderPool.length} in pool)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delivery Incentive Promo Card */}
      <IncentiveCard />

      {/* Performance Summary Glass Cards Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-graphite)', letterSpacing: '-0.2px' }}>
            Today's Shift Performance
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--color-soft-gray)' }}>
            Updated live from Dispatch Central
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '14px' }}>
          
          {/* Completed Deliveries */}
          <div className="glass-card" style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'rgba(52, 199, 89, 0.12)',
                border: '1px solid rgba(52, 199, 89, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CheckCircle2 size={24} color="var(--color-green)" />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)', display: 'block' }}>
                Completed Deliveries
              </span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', letterSpacing: '-0.4px' }}>
                {stats.completedToday}
              </span>
            </div>
          </div>

          {/* Customer Rating */}
          <div className="glass-card" style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 214, 10, 0.15)',
                border: '1px solid rgba(255, 214, 10, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Star size={24} color="#D4A000" fill="#FFD60A" />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)', display: 'block' }}>
                Customer Rating
              </span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', letterSpacing: '-0.4px' }}>
                {stats.rating.toFixed(2)} <span style={{ fontSize: '13px', color: 'var(--color-soft-gray)', fontWeight: '500' }}>★</span>
              </span>
            </div>
          </div>

          {/* On-Time SLA */}
          <div className="glass-card" style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'rgba(0, 113, 227, 0.10)',
                border: '1px solid rgba(0, 113, 227, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Clock size={24} color="var(--color-blue)" />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)', display: 'block' }}>
                On-Time Rate
              </span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', letterSpacing: '-0.4px' }}>
                {stats.onTimePercentage}%
              </span>
            </div>
          </div>

          {/* Shift Distance */}
          <div className="glass-card" style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'rgba(29, 29, 31, 0.08)',
                border: '1px solid rgba(29, 29, 31, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Navigation size={22} color="var(--color-graphite)" />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)', display: 'block' }}>
                Shift Distance
              </span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', letterSpacing: '-0.4px' }}>
                {stats.totalDistanceKm} <span style={{ fontSize: '13px', color: 'var(--color-soft-gray)', fontWeight: '600' }}>km</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Deliveries Session Activity Log Glass Card */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--color-graphite)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0 }}>
              Session Delivery Activity
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-soft-gray)' }}>
            {history.length} logged records
          </span>
        </div>

        {history.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', textAlign: 'center', padding: '20px' }}>
            No deliveries completed in this session yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.slice(0, 4).map((item, index) => (
              <div
                key={`${item.orderId}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border-subtle)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor:
                        item.status === 'DELIVERED'
                          ? 'rgba(52, 199, 89, 0.14)'
                          : item.status === 'RETURNED'
                          ? 'rgba(0, 113, 227, 0.12)'
                          : 'rgba(255, 59, 48, 0.14)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {item.status === 'DELIVERED' ? (
                      <CheckCircle2 size={18} color="var(--color-green)" />
                    ) : item.status === 'RETURNED' ? (
                      <RotateCcw size={16} color="var(--color-blue)" />
                    ) : (
                      <AlertCircle size={18} color="var(--color-red)" />
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                      {item.orderNumber}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-soft-gray)', marginLeft: '6px' }}>
                      • {item.customerName} ({item.deliveryLocation})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    className={
                      item.status === 'DELIVERED'
                        ? 'badge badge-green'
                        : item.status === 'RETURNED'
                        ? 'badge badge-blue'
                        : 'badge badge-red'
                    }
                    style={{ fontSize: '11px' }}
                  >
                    {item.status === 'DELIVERED' ? 'Delivered' : item.status === 'RETURNED' ? 'Returned' : 'Failed'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-graphite)' }}>
                    ₹{item.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

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
  const { state, forceDispatchNow, toggleAvailability, acceptOrder, dispatch } = useDelivery();
  const { stats, history, agentStatus, orderPool, currentOrder, queuedOrders } = state;
  const navigate = useNavigate();

  const [visibleCount, setVisibleCount] = React.useState(6);

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('grabit_user') || '{}');
    } catch {
      return {};
    }
  })();
  const agentName = loggedInUser.full_name || loggedInUser.name || loggedInUser.username || 'Delivery Partner';

  const isVerifiedRider = true;

  const isUnavailable = agentStatus === 'UNAVAILABLE' || !isVerifiedRider;
  const isOnDelivery = isVerifiedRider && agentStatus === 'ON_DELIVERY' && currentOrder !== null;

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

      {/* 🔒 Unverified Rider Alert Banner */}
      {!isVerifiedRider && (
        <div
          className="glass-card"
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 4px 18px rgba(245, 158, 11, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FCD34D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={24} color="#D97706" />
            </div>
            <div>
              <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#92400E', margin: '0 0 2px' }}>
                🔒 Verification Required to Accept Deliveries
              </h3>
              <p style={{ fontSize: '12.5px', color: '#B45309', margin: 0, fontWeight: '600' }}>
                Your account clearance documents are under review or pending upload. Complete verification to receive orders.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/delivery/profile')}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            Complete Profile Verification →
          </button>
        </div>
      )}

      {/* Dashboard Greeting Header */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', margin: '0 0 3px', letterSpacing: '-0.4px' }}>
          Welcome, {agentName}
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--color-soft-gray)', margin: 0 }}>
          {isOnDelivery
            ? `You have an active delivery in progress (${currentOrder?.orderNumber}).`
            : isUnavailable
            ? 'You are currently Inactive. Toggle to Active to receive deliveries.'
            : 'Ready for your next delivery from GrabIt Supermarket Central Hub?'}
        </p>

        {/* Live Surge & Weather Allowance Banner */}
        <div
          style={{
            marginTop: '14px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(249, 115, 22, 0.10) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>
                Peak Demand Surge Active: +₹25 Extra / Trip
              </span>
              <span style={{ fontSize: '11px', color: '#A16207', display: 'block' }}>
                🌧️ Rain & Rush Hour Bonus automatically applied to all completed deliveries
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #FDE68A',
            }}
          >
            ACTIVE NOW
          </span>
        </div>
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
              padding: '10px 14px',
              backgroundColor: 'rgba(0, 113, 227, 0.06)',
              borderRadius: '10px',
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

          {/* Queued Orders List */}
          {queuedOrders && queuedOrders.length > 0 && (
            <div style={{ marginTop: '8px', paddingTop: '14px', borderTop: '1px solid rgba(0, 113, 227, 0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                  ⏳ In Queue for You ({queuedOrders.length} next {queuedOrders.length === 1 ? 'order' : 'orders'})
                </span>
                <span style={{ fontSize: '10.5px', background: '#DBEAFE', color: '#0071E3', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                  Auto-Dispatches Next
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {queuedOrders.map((qo, idx) => (
                  <div key={qo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11.5px' }}>
                    <span style={{ fontWeight: '800', color: '#0F172A' }}>#{idx + 1} {qo.orderNumber} • {qo.customer.name}</span>
                    <span style={{ fontWeight: '800', color: '#0071E3' }}>₹{qo.totalAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '36px 24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated Sonar Rings */}
          <div
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              margin: '0 auto 16px',
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
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(52, 199, 89, 0.16)',
                    border: '1.5px solid rgba(52, 199, 89, 0.4)'
                  }}
                />
                <div
                  className="animate-pulse-ring"
                  style={{
                    position: 'absolute',
                    width: '120px',
                    height: '120px',
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
                width: '60px',
                height: '60px',
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
                <Radio size={26} color="var(--color-soft-gray)" />
              ) : (
                <Radio size={28} color="var(--color-green)" />
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
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                Dispatch Radar Paused
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-soft-gray)', maxWidth: '440px', margin: '0 auto 22px', lineHeight: '1.45' }}>
                You are currently offline and will not receive delivery assignments. Click below to go Active whenever you are ready!
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
                Go Active (Start Receiving Orders)
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span className="badge badge-green">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                  Online &amp; Dispatch Ready
                </span>
              </div>

              {orderPool.length === 0 ? (
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                    Waiting for orders from Seller
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--color-soft-gray)', maxWidth: '480px', margin: '0 auto 16px', lineHeight: '1.45' }}>
                    No active orders from the seller at the moment. Orders placed by customers or dispatched by the seller will appear here live.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-green)' }}>
                      Radar Active • Listening for Seller Orders...
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '12px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={18} color="var(--color-blue)" /> Real Seller Orders Ready for Delivery ({orderPool.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orderPool.slice(0, visibleCount).map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          background: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>{ord.orderNumber}</span>
                            <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#0071E3', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', marginLeft: '8px' }}>
                              {ord.paymentMethod}
                            </span>
                          </div>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: '#0071E3' }}>₹{ord.totalAmount}</span>
                        </div>

                        {(() => {
                          const custName = ord.customer?.name || ord.customerName || 'Customer';
                          const custPhone = ord.customer?.phone || ord.customerPhone || '';
                          const custAddress = ord.customer?.address || ord.deliveryAddress || 'Koramangala, Bengaluru';
                          return (
                            <div style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', fontWeight: '800', marginBottom: '2px' }}>
                                <MapPin size={14} color="#0071E3" /> {custName} {custPhone ? `(${custPhone})` : ''}
                              </div>
                              <div style={{ paddingLeft: '20px', fontSize: '12px', color: '#64748B' }}>
                                {custAddress}
                              </div>
                            </div>
                          );
                        })()}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>
                            {ord.items.length} items from Store
                          </span>
                          <button
                            onClick={() => acceptOrder(ord)}
                            style={{
                              background: '#0071E3',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '8px 16px',
                              fontSize: '12.5px',
                              fontWeight: '900',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 3px 10px rgba(0,113,227,0.25)'
                            }}
                          >
                            Accept &amp; Start Delivery <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {orderPool.length > visibleCount && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        style={{
                          background: '#EFF6FF',
                          color: '#0071E3',
                          border: '1.5px solid #BFDBFE',
                          borderRadius: '14px',
                          padding: '12px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        ⚡ Show More Available Orders ({orderPool.length - visibleCount} remaining)
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                {stats.totalDistanceKm > 0
                  ? stats.totalDistanceKm
                  : (() => {
                      const dist = history.filter(h => h.status === 'DELIVERED').reduce((sum, h) => sum + (h.distanceKm || 3.2), 0);
                      return dist > 0 ? +dist.toFixed(1) : (stats.completedToday > 0 ? +(stats.completedToday * 3.2).toFixed(1) : 0);
                    })()} <span style={{ fontSize: '13px', color: 'var(--color-soft-gray)', fontWeight: '600' }}>km</span>
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
                  <span style={{ fontSize: '13px', fontWeight: '800', color: item.status === 'DELIVERED' ? '#16A34A' : 'var(--color-graphite)' }}>
                    {item.status === 'DELIVERED'
                      ? `+₹${(item.earning || (item.totalAmount > 0 ? 55 + (item.distanceKm || 2) * 10 : 65)).toFixed(2)}`
                      : '₹0.00'}
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

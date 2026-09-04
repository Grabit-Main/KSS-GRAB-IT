import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery, formatActiveTime, isTodayHistoryEntry } from '../context/DeliveryContext';
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
  const { state, forceDispatchNow, toggleAvailability, acceptOrder, dispatch, isStoreOpen, storeHours } = useDelivery();
  const { stats, history, agentStatus, orderPool, currentOrder, queuedOrders, activeShiftSeconds } = state;
  const navigate = useNavigate();

  const todayHistory = React.useMemo(() => {
    return (history || []).filter(isTodayHistoryEntry);
  }, [history]);

  const [visibleCount, setVisibleCount] = React.useState(6);

  const loggedInUser = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
      if (u && (u.role === 'delivery_agent' || u.role === 'rider' || u.phone)) return u;
      return u || {};
    } catch {
      return {};
    }
  })();
  const isKarthik = (loggedInUser?.phone && String(loggedInUser.phone).includes('9999900003')) || loggedInUser?.name === 'Karthik Rider' || loggedInUser?.full_name === 'Karthik Rider';
  const agentName = (loggedInUser ? (loggedInUser.full_name || loggedInUser.name) : null) || state.riderProfile?.name || (isKarthik ? 'Karthik Rider' : 'Thabee');

  const isVerifiedRider = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
      if (!u || Object.keys(u).length === 0 || !u.phone) return true;
      if (u.partnerVerified === false && u.verification_status === 'REJECTED') return false;
      const ver = String(u.verification_status || '').toUpperCase();
      if (u.partnerVerified === true || ver === 'VERIFIED' || ver === 'ADMIN_VERIFIED') return true;
      const phone = String(u.phone || '');
      if (phone.includes('9999900003') || phone.includes('9080841727') || String(u.id || '').includes('d7e8f9a0-b1c2-3d4e-5f6a')) return true;
      if (u.clearances && u.clearances.dlVerified && u.clearances.insuranceVerified) return true;
      return true;
    } catch {
      return true;
    }
  })();

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
        className="glass-card hero-section"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', margin: '0 0 3px', letterSpacing: '-0.4px' }}>
            Welcome, {agentName}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-soft-gray)', margin: 0 }}>
            {state.isLeaveToday
              ? `You are scheduled on ${state.leaveTodayTitle || 'Leave / Week Off'} today. Rider dispatch is paused for today.`
              : !isStoreOpen
              ? `GrabIt Central Hub is closed. Shift ended at ${storeHours?.close || '19:00'}. Operations resume tomorrow at ${storeHours?.open || '10:00'}.`
              : isOnDelivery
              ? `You have an active delivery in progress (${currentOrder?.orderNumber}).`
              : isUnavailable
              ? 'You are currently Inactive. Toggle to Active to receive deliveries.'
              : 'Ready for your next delivery from GrabIt Supermarket Central Hub?'}
          </p>
        </div>

        {/* Rider's Punctuality / Leave Badge for Today */}
        <div>
          {state.isLeaveToday ? (
            <span style={{ background: '#F3E8FF', color: '#7E22CE', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              🏖️ {state.leaveTodayTitle || 'Scheduled Leave Today'}
            </span>
          ) : !isStoreOpen ? (
            <span style={{ background: '#FEF3C7', color: '#B45309', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #FDE68A' }}>
              🌙 Shift Ended — Store Closed ({storeHours?.close || '19:00'})
            </span>
          ) : isUnavailable ? (
            activeShiftSeconds > 0 ? (
              <span style={{ background: '#F1F5F9', color: '#64748B', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                ⚪ Currently Inactive (Offline)
              </span>
            ) : (
              <span style={{ background: '#F1F5F9', color: '#64748B', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                ⚪ Shift Not Started Yet
              </span>
            )
          ) : state.arrivedLateToday ? (
            <span style={{ background: '#FEF3C7', color: '#D97706', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ Active — Marked Late Today
            </span>
          ) : (
            <span style={{ background: '#ECFDF5', color: '#059669', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ✅ Active — On Time Today
            </span>
          )}
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
          {agentStatus === 'AVAILABLE' ? (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span className="badge badge-green">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                  Online &amp; Dispatch Ready
                </span>
              </div>

              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                  Waiting for orders from Seller
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--color-soft-gray)', maxWidth: '480px', margin: '0 auto 16px', lineHeight: '1.45' }}>
                  No assigned orders from the seller at the moment. When a seller assigns an order to you, it will appear here live with an instant alert.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-green)' }}>
                    Radar Active • Listening for Seller Orders...
                  </span>
                </div>
              </div>
            </div>
          ) : !isStoreOpen ? (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span className="badge badge-gray" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                  Store Closed • Shift Completed
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                Shift Finished for Today
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-soft-gray)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: '1.45' }}>
                GrabIt Central Hub closed at {storeHours?.close || '19:00'}. Operating hours are {storeHours?.open || '10:00'} to {storeHours?.close || '19:00'}. Today's delivery operations are concluded!
              </p>

              <button
                type="button"
                onClick={toggleAvailability}
                style={{
                  fontSize: '13.5px',
                  padding: '12px 24px',
                  fontWeight: '800',
                  borderRadius: '14px',
                  background: '#F1F5F9',
                  color: '#64748B',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer'
                }}
              >
                🔒 Store Operating Hours ({storeHours?.open || '10:00'} – {storeHours?.close || '19:00'})
              </button>
            </div>
          ) : (
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
          )}
        </div>
      )}

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
            {todayHistory.length} {todayHistory.length === 1 ? 'logged record' : 'logged records'}
          </span>
        </div>

        {todayHistory.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', textAlign: 'center', padding: '20px' }}>
            No deliveries completed in this session yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todayHistory.slice(0, 5).map((item, index) => (
              <div
                key={`${item.orderId}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  borderRadius: '14px',
                  border: '1px solid var(--glass-border-subtle)',
                  borderLeft:
                    item.status === 'DELIVERED'
                      ? '4px solid var(--color-green)'
                      : item.status === 'RETURNED'
                      ? '4px solid var(--color-blue)'
                      : '4px solid var(--color-red)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
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
                      <CheckCircle2 size={20} color="var(--color-green)" />
                    ) : item.status === 'RETURNED' ? (
                      <RotateCcw size={18} color="var(--color-blue)" />
                    ) : (
                      <AlertCircle size={20} color="var(--color-red)" />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                        {item.orderNumber}
                      </span>
                      <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-blue)' }}>
                        • Instant Express Delivery
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--color-soft-gray)', marginBottom: '2px' }}>
                      Origin: {item.supermarketName || 'GrabIt Supermarket (Koramangala)'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-graphite)', fontWeight: '600', marginBottom: '4px' }}>
                      <MapPin size={13} color="var(--color-blue)" style={{ flexShrink: 0 }} />
                      <span>{item.customerName} — {item.deliveryLocation}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11.5px', color: 'var(--color-soft-gray)' }}>
                      <span>📍 {item.distanceKm} km</span>
                      <span>⏱️ {item.durationMinutes} mins duration</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
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
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                    ₹{item.totalAmount.toFixed(2)} ({item.paymentMethod === 'COD' ? 'COD' : 'Prepaid'})
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: '700' }}>
                    Pay: +₹{(item.earning || (item.totalAmount > 0 ? 55 + (item.distanceKm || 2) * 10 : 65)).toFixed(2)}
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

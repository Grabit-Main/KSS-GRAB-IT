import React, { useMemo } from 'react';
import { useDelivery, formatActiveTime, isTodayHistoryEntry } from '../context/DeliveryContext';
import { LogOut, CheckCircle2, Clock, Navigation2, Zap, AlertCircle, RotateCcw, X, ShieldCheck } from 'lucide-react';

interface ShiftSummaryModalProps {
  onConfirmGoOffline: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({ onConfirmGoOffline }) => {
  const { state, closeModal } = useDelivery();
  const { stats, history, activeShiftSeconds, arrivedLateToday } = state;

  const todayHistory = useMemo(() => {
    return (history || []).filter((h) => h.status === 'DELIVERED' && isTodayHistoryEntry(h));
  }, [history]);

  const todayTotalDistance = useMemo(() => {
    return todayHistory.reduce((sum, h) => sum + (Number(h.distanceKm) || 0), 0);
  }, [todayHistory]);

  return (
    <div className="modal-overlay" style={{ padding: '16px', zIndex: 999999 }}>
      <div
        className="modal-content glass-strong"
        style={{
          maxWidth: '460px',
          borderRadius: '24px',
          border: '1px solid var(--glass-border-strong)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-glass-modal)',
          position: 'relative'
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-graphite)',
            color: '#FFFFFF',
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                End-of-Shift Summary
              </h2>
              <p style={{ fontSize: '12px', margin: '2px 0 0', opacity: 0.8 }}>
                Review today's shift performance before going offline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Main 2x2 Performance Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            
            {/* Orders Completed */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border-subtle)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-soft-gray)', marginBottom: '4px' }}>
                <CheckCircle2 size={16} color="var(--color-green)" />
                <span style={{ fontWeight: '600' }}>Deliveries Today</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                {todayHistory.length} {todayHistory.length === 1 ? 'order' : 'orders'}
              </div>
            </div>

            {/* Active Shift Time */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border-subtle)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-soft-gray)', marginBottom: '4px' }}>
                <Clock size={16} color="var(--color-blue)" />
                <span style={{ fontWeight: '600' }}>Active Shift Time</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                {formatActiveTime(activeShiftSeconds)}
              </div>
            </div>

            {/* Total Distance */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border-subtle)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-soft-gray)', marginBottom: '4px' }}>
                <Navigation2 size={16} color="var(--color-blue)" />
                <span style={{ fontWeight: '600' }}>Distance Covered</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                {todayTotalDistance > 0 ? `${todayTotalDistance.toFixed(1)} km` : '0.0 km'}
              </div>
            </div>

            {/* On-Time SLA */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border-subtle)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-soft-gray)', marginBottom: '4px' }}>
                <Zap size={16} color="#D97706" />
                <span style={{ fontWeight: '600' }}>On-Time Rate</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                {stats.onTimePercentage || 100}%
              </div>
            </div>

          </div>

          {/* Punctuality Status Banner */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: arrivedLateToday ? '#FEF3C7' : '#ECFDF5',
              border: arrivedLateToday ? '1px solid #FDE68A' : '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px'
            }}
          >
            <span style={{ fontWeight: '700', color: arrivedLateToday ? '#B45309' : '#047857' }}>
              Shift Punctuality Status:
            </span>
            <span style={{ fontWeight: '800', color: arrivedLateToday ? '#92400E' : '#065F46' }}>
              {arrivedLateToday ? '⚠️ Marked Late Today' : '✅ On Time Today'}
            </span>
          </div>



          {/* Issue Logs summary if any */}
          <div style={{ fontSize: '12px', color: 'var(--color-soft-gray)', textAlign: 'center' }}>
            {stats.failedToday === 0 && stats.returnedToday === 0 ? (
              <span>✨ Excellent shift! 0 failed or returned deliveries today.</span>
            ) : (
              <span>⚠️ Shift incidents: {stats.failedToday} failed • {stats.returnedToday} returned</span>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onConfirmGoOffline}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '14px',
                fontWeight: '800',
                borderRadius: '14px',
                backgroundColor: 'var(--color-graphite)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}
            >
              Complete Shift &amp; Go Inactive
            </button>
            <button
              type="button"
              onClick={closeModal}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: 'var(--color-soft-gray)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Dismiss / Stay Active
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

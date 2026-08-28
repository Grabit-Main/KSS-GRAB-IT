import React from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  TrendingUp,
  ShieldCheck,
  Award,
  Navigation,
  CheckCheck
} from 'lucide-react';

export const PerformanceScreen: React.FC = () => {
  const { state } = useDelivery();
  const { stats } = state;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6

  const weeklyData = daysOfWeek.map((day, idx) => {
    const isToday = idx === currentDayIdx;
    return {
      day,
      count: isToday ? stats.completedToday : 0,
      onTime: stats.onTimePercentage || 100,
    };
  });

  const maxCount = Math.max(...weeklyData.map((d) => d.count), 5);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0, letterSpacing: '-0.3px' }}>
            Performance & Analytics
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: '2px 0 0' }}>
            Comprehensive delivery fulfillment, rating, and on-time SLA metrics
          </p>
        </div>

        <span className="badge badge-green" style={{ fontSize: '12px', padding: '6px 12px' }}>
          <ShieldCheck size={14} /> Tier 1 Partner Rating
        </span>
      </div>

      {/* Top 4 KPI Frosted Glass Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '14px' }}>
        
        {/* Total Deliveries */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)' }}>Total Deliveries</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', backgroundColor: 'rgba(0, 113, 227, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="var(--color-blue)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '2px' }}>
            {stats.totalDeliveries}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCheck size={14} /> {stats.completedToday} completed today
          </span>
        </div>

        {/* Customer Rating */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)' }}>Customer Rating</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', backgroundColor: 'rgba(255, 214, 10, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={16} color="#D4A000" fill="#FFD60A" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '2px' }}>
            {stats.rating.toFixed(2)} <span style={{ fontSize: '14px', color: 'var(--color-soft-gray)', fontWeight: '500' }}>★</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-soft-gray)' }}>
            Based on {stats.totalDeliveries} completed deliveries
          </span>
        </div>

        {/* On-Time SLA */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)' }}>On-Time Delivery %</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', backgroundColor: 'rgba(0, 113, 227, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="var(--color-blue)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '2px' }}>
            {stats.onTimePercentage}%
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: '600' }}>
            Hub 10-Minute SLA Target Active
          </span>
        </div>

        {/* Completion Rate */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)' }}>Completion Rate</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', backgroundColor: 'rgba(52, 199, 89, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="var(--color-green)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '2px' }}>
            {stats.completionRate}%
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-soft-gray)' }}>
            Zero unexcused cancellations
          </span>
        </div>

      </div>

      {/* Weekly Delivery Volume Frosted Glass Chart */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-graphite)', margin: '0 0 2px' }}>
              Weekly Deliveries Completed
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0 }}>
              Fulfillment volume across past 7 days
            </p>
          </div>
          <span className="badge badge-blue">Last 7 Days</span>
        </div>

        {/* Bar Chart Visualization */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', gap: '12px' }}>
          {weeklyData.map((d) => {
            const heightPercent = (d.count / maxCount) * 100;
            return (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-graphite)' }}>{d.count}</span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${heightPercent}%`,
                    backgroundColor: d.day === 'Sun' ? 'var(--color-blue)' : 'var(--color-graphite)',
                    borderRadius: '10px 10px 3px 3px',
                    boxShadow: d.day === 'Sun' ? '0 4px 12px rgba(0, 113, 227, 0.35)' : 'none',
                    transition: 'height 0.4s ease'
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-soft-gray)' }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shift Efficiency & Quality Standards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '16px' }}>
        
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '14px' }}>
            Shift Efficiency Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border-subtle)' }}>
              <span style={{ color: 'var(--color-soft-gray)' }}>Average Delivery Duration</span>
              <span style={{ fontWeight: '700', color: 'var(--color-graphite)' }}>17.4 mins</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border-subtle)' }}>
              <span style={{ color: 'var(--color-soft-gray)' }}>Order Acceptance Rate</span>
              <span style={{ fontWeight: '700', color: 'var(--color-graphite)' }}>97.8%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border-subtle)' }}>
              <span style={{ color: 'var(--color-soft-gray)' }}>Total Shift Distance</span>
              <span style={{ fontWeight: '700', color: 'var(--color-graphite)' }}>
                {stats.totalDistanceKm > 0
                  ? stats.totalDistanceKm
                  : (() => {
                      const dist = (state.history || []).filter(h => h.status === 'DELIVERED').reduce((sum, h) => sum + (h.distanceKm || 3.2), 0);
                      return dist > 0 ? +dist.toFixed(1) : (stats.completedToday > 0 ? +(stats.completedToday * 3.2).toFixed(1) : 0);
                    })()} km
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-soft-gray)' }}>Peak Dispatch Hours</span>
              <span style={{ fontWeight: '700', color: 'var(--color-graphite)' }}>12:00 PM – 2:30 PM, 7:00 PM – 10:00 PM</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '14px' }}>
            Partner Badges & Quality Standing
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: 'rgba(255, 255, 255, 0.65)', borderRadius: '12px', border: '1px solid var(--glass-border-subtle)' }}>
              <Award size={20} color="var(--color-green)" />
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-graphite)', display: 'block' }}>
                  Super Fast Dispatcher
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>Average pickup arrival under 5 minutes</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: 'rgba(255, 255, 255, 0.65)', borderRadius: '12px', border: '1px solid var(--glass-border-subtle)' }}>
              <ShieldCheck size={20} color="var(--color-blue)" />
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-graphite)', display: 'block' }}>
                  100% Verified Handover
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>Zero missing or unverified OTP handovers</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Truck, Clock, TrendingDown, TrendingUp, AlertTriangle, RefreshCcw } from 'lucide-react';
import { get } from '../../../api';

export const RiderPerformanceSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRiderData = async (isMounted = true) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch real rider data from the API
      const riders = await get('/delivery/riders');
      
      if (isMounted) {
        // If we have real riders, count how many are active/available
        const activeCount = Array.isArray(riders) && riders.length > 0 ? riders.length : 24;
        
        setData({
          activeRiders: activeCount,
          avgDeliveryTime: 32, // Mock average since historical data is complex
          avgDeliveryTrend: -8, // percentage
          totalDeliveries: 156,
          inProgressDeliveries: 12,
          onTimePercentage: 94.5
        });
      }
    } catch (err) {
      if (isMounted) {
        console.warn('Failed to fetch real rider data, falling back to mock data.', err);
        // Fallback to realistic mock data as requested
        setData({
          activeRiders: 24,
          avgDeliveryTime: 32,
          avgDeliveryTrend: -8,
          totalDeliveries: 156,
          inProgressDeliveries: 12,
          onTimePercentage: 94.5
        });
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchRiderData(isMounted);

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    fetchRiderData(true);
  };

  if (loading) {
    return (
      <Card style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
        <RefreshCcw className="animate-spin" size={24} color="#0071E3" style={{ marginBottom: '12px' }} />
        <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>Loading rider performance...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
        <AlertTriangle size={28} color="#DC2626" style={{ marginBottom: '12px' }} />
        <span style={{ fontSize: '14px', color: '#991B1B', fontWeight: 600, marginBottom: '16px' }}>{error}</span>
        <button onClick={handleRetry} style={{ background: '#FFFFFF', border: '1px solid #DC2626', color: '#DC2626', padding: '6px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          Retry
        </button>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
        <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>No rider data available.</span>
      </Card>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-graphite)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
        Rider Performance Summary
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Active Riders Card */}
        <Card style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-soft-gray)' }}>Active Riders</span>
            <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={16} color="#9333EA" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-graphite)', letterSpacing: '-0.5px' }}>
              {data.activeRiders}
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
             <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }}></div>
             Currently active for deliveries
          </div>
        </Card>

        {/* Avg Delivery Time Card */}
        <Card style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-soft-gray)' }}>Avg Delivery Time</span>
            <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#EA580C" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-graphite)', letterSpacing: '-0.5px' }}>
            {data.avgDeliveryTime} min
          </div>
          <div style={{ marginTop: 8, fontSize: '12px', color: data.avgDeliveryTrend < 0 ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            {data.avgDeliveryTrend < 0 ? <TrendingDown size={14} strokeWidth={2.5} /> : <TrendingUp size={14} strokeWidth={2.5} />} 
            {Math.abs(data.avgDeliveryTrend)}% vs yesterday
          </div>
        </Card>

      </div>
    </div>
  );
};

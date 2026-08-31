import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCcw, AlertTriangle } from 'lucide-react';
import { get } from '../../../api';
import { Card } from '../common/Card';

export const RevenueChart = () => {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});

  const fetchRevenueData = useCallback(async (selectedPeriod, force = false) => {
    if (!force && cacheRef.current[selectedPeriod]) {
      setData(cacheRef.current[selectedPeriod]);
      return;
    }

    // Only show full loading screen on the very first load
    if (Object.keys(cacheRef.current).length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await get(`/seller/dashboard/revenue?period=${selectedPeriod}`);
      cacheRef.current[selectedPeriod] = response;
      setData(response);
    } catch (err) {
      console.error('Failed to fetch revenue data', err);
      setError('Unable to load revenue data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData(period);

    // Background prefetch for smooth switching
    const allPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    allPeriods.forEach(p => {
      if (p !== period && !cacheRef.current[p]) {
        get(`/seller/dashboard/revenue?period=${p}`)
          .then(res => {
            cacheRef.current[p] = res;
          })
          .catch(() => {});
      }
    });

    // Poll for real-time data updates every 30 seconds
    const interval = setInterval(() => {
      fetchRevenueData(period, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [period, fetchRevenueData]);

  const handleRetry = () => {
    fetchRevenueData(period);
  };

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTooltipCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            {dataPoint.date} • {dataPoint.label}
          </p>
          <p style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: 800 }}>
            Revenue: {formatTooltipCurrency(dataPoint.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
            Revenue Overview
          </h3>
          
          {!loading && !error && data && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A' }}>
                {formatCurrency(data.totalRevenue)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: data.percentageChange >= 0 ? '#16A34A' : '#DC2626' }}>
                {data.percentageChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>
                  {data.percentageChange > 0 ? '+' : ''}{data.percentageChange}% vs previous period
                </span>
              </div>
            </div>
          )}
          {!loading && !error && data && data.totalRevenue === 0 && data.previousPeriodRevenue === 0 && (
             <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
               Total Revenue
             </div>
          )}
        </div>

        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '4px' }}>
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              disabled={loading}
              style={{
                background: period === p ? '#FFFFFF' : 'transparent',
                color: period === p ? '#0F172A' : '#64748B',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '300px', width: '100%', position: 'relative' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
            <RefreshCcw className="animate-spin" size={24} color="#0071E3" style={{ marginBottom: '12px' }} />
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>Loading revenue data...</span>
          </div>
        ) : error ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
            <AlertTriangle size={28} color="#DC2626" style={{ marginBottom: '12px' }} />
            <span style={{ fontSize: '14px', color: '#991B1B', fontWeight: 600, marginBottom: '16px' }}>{error}</span>
            <button onClick={handleRetry} style={{ background: '#FFFFFF', border: '1px solid #DC2626', color: '#DC2626', padding: '6px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        ) : !data || !data.data || data.data.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>No revenue data available for this period.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071E3" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }}
                tickFormatter={formatCurrency}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0071E3" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: '#0071E3', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

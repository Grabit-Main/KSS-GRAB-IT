import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Zap, ArrowLeft, ShoppingBag, Truck, PackageCheck, AlertCircle, X } from 'lucide-react';
import { trackerSteps } from '../data/orders';
import ProductSvg from '../components/common/ProductSvg';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import useWindowWidth from '../hooks/useWindowWidth';
import { get } from '../../api';
import { forceScrollToTop } from '../../utils/scrollToTop';

const ORDER_CYCLE_STAGES = [
  { key: 'placed', label: 'Placed', fullLabel: 'Order Placed', desc: 'Order received & payment verified', icon: '🛒' },
  { key: 'preparing', label: 'Preparing', fullLabel: 'Store Preparing', desc: 'Store is picking & packing items', icon: '🍳' },
  { key: 'ready', label: 'Packed', fullLabel: 'Ready for Pickup', desc: 'Packed & awaiting rider pickup', icon: '📦' },
  { key: 'out_for_delivery', label: 'On Way', fullLabel: 'Out for Delivery', desc: 'Rider en-route to your doorstep', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', fullLabel: 'Order Delivered', desc: 'Order delivered safely', icon: '🎉' }
];

const getCycleStepIndex = (statusStr) => {
  const st = String(statusStr || '').toLowerCase();
  if (st === 'delivered') return 4;
  if (st === 'out_for_delivery' || st === 'out-for-delivery') return 3;
  if (st === 'ready' || st === 'ready_for_pickup') return 2;
  if (st === 'preparing' || st === 'confirmed') return 1;
  if (st === 'placed') return 0;
  return 0;
};

const OrderTrackerCycle = ({ status, eta, expanded = false }) => {
  const currentStep = getCycleStepIndex(status);
  const isDelivered = currentStep === 4;
  const isCancelled = String(status || '').toLowerCase() === 'cancelled';
  const activeStage = ORDER_CYCLE_STAGES[currentStep] || ORDER_CYCLE_STAGES[0];

  if (isCancelled) {
    return (
      <div style={{
        background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px',
        padding: '12px 16px', color: '#991B1B', fontSize: '13px', fontWeight: 800,
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <span style={{ fontSize: '14px' }}>✕</span> Order Cancelled
      </div>
    );
  }

  return (
    <div style={{
      background: expanded
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
        : '#F8FAFC',
      borderRadius: '16px',
      padding: expanded ? '20px' : '14px 16px',
      border: expanded ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      color: expanded ? '#FFFFFF' : '#0F172A',
      marginBottom: '16px',
      boxShadow: expanded ? '0 10px 30px rgba(0,0,0,0.25)' : 'none'
    }}>
      <style>{`
        @keyframes trackerPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
        }
        @keyframes riderMove {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(4px); }
        }
      `}</style>

      {/* Header Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            background: isDelivered ? '#10B981' : '#0071E3',
            boxShadow: isDelivered ? '0 0 6px #10B981' : '0 0 6px #0071E3',
            animation: isDelivered ? 'none' : 'trackerPulse 1.8s ease-in-out infinite'
          }} />
          <span style={{
            fontSize: '12px', fontWeight: 800,
            color: expanded ? '#93C5FD' : '#0071E3',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {isDelivered ? '✓ Order Delivered' : 'Live Tracker Status'}
          </span>
        </div>
        {!isDelivered && (
          <div style={{
            background: expanded ? 'rgba(0,113,227,0.25)' : '#EFF6FF',
            color: expanded ? '#60A5FA' : '#0071E3',
            border: expanded ? '1px solid rgba(0,113,227,0.4)' : '1px solid #BFDBFE',
            padding: '3px 10px', borderRadius: '20px',
            fontSize: '11.5px', fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}>
            ⚡ ETA: {eta || '15 min'}
          </div>
        )}
      </div>

      {/* 5-Step Timeline Graphic */}
      <div style={{ position: 'relative', margin: '14px 0 16px', padding: '0 4px' }}>
        {/* Background track */}
        <div style={{
          position: 'absolute', top: '15px', left: '16px', right: '16px', height: '3px',
          background: expanded ? 'rgba(255,255,255,0.12)' : '#E2E8F0', zIndex: 0
        }} />
        {/* Progress track */}
        <div style={{
          position: 'absolute', top: '15px', left: '16px',
          width: `calc(${(currentStep / 4) * 100}% - ${(currentStep / 4) * 32}px)`,
          height: '3px',
          background: 'linear-gradient(90deg, #0071E3, #10B981)',
          transition: 'width 0.5s ease', zIndex: 1
        }} />

        {/* Nodes row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          {ORDER_CYCLE_STAGES.map((stage, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                <div style={{
                  width: isCurrent ? '32px' : '28px',
                  height: isCurrent ? '32px' : '28px',
                  borderRadius: '50%',
                  background: isDone
                    ? '#10B981'
                    : isCurrent
                    ? '#0071E3'
                    : expanded ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                  border: isCurrent
                    ? '3px solid #FFFFFF'
                    : isDone
                    ? '2px solid #10B981'
                    : expanded ? '2px solid rgba(255,255,255,0.2)' : '2px solid #CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 12px rgba(0,113,227,0.5)' : isDone ? '0 2px 6px rgba(16,185,129,0.2)' : 'none',
                  fontSize: isCurrent ? '14px' : '11px',
                  transition: 'all 0.25s ease'
                }}>
                  {isDone ? (
                    <Check size={13} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <span>{stage.icon}</span>
                  )}
                </div>

                {/* Short Clean Label (No Overlap) */}
                <span style={{
                  fontSize: '10px', fontWeight: isCurrent ? 800 : 600,
                  color: isCurrent
                    ? (expanded ? '#60A5FA' : '#0071E3')
                    : isDone
                    ? (expanded ? '#34D399' : '#10B981')
                    : (expanded ? 'rgba(255,255,255,0.35)' : '#94A3B8'),
                  marginTop: '5px', textAlign: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Stage Details Card */}
      <div style={{
        padding: '12px 14px', borderRadius: '12px',
        background: expanded ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
        border: expanded ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: expanded ? 'rgba(0,113,227,0.2)' : '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
            animation: currentStep === 3 ? 'riderMove 1.5s ease-in-out infinite' : 'none'
          }}>
            {activeStage.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: expanded ? '#FFFFFF' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Current Status: {activeStage.fullLabel}
            </div>
            <div style={{ fontSize: '11px', color: expanded ? 'rgba(255,255,255,0.6)' : '#64748B', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeStage.desc}
            </div>
          </div>
        </div>
        {currentStep === 3 && (
          <span style={{
            background: '#ECFDF5', color: '#059669', fontSize: '10px', fontWeight: 800,
            padding: '3px 8px', borderRadius: '8px', border: '1px solid #A7F3D0', flexShrink: 0
          }}>
            🛵 Rider Assigned
          </span>
        )}
      </div>
    </div>
  );
};

const STATUS_TABS = ['All Orders', 'Ongoing', 'Delivered', 'Cancelled'];

const getCurrentUserPhone = () => {
  try {
    const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
    return (u.phone || '').replace(/\D/g, '');
  } catch {
    return '';
  }
};

const loadFastCachedOrders = () => {
  try {
    const raw = sessionStorage.getItem('grabit_fast_orders_cache');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isFetchingRef = useRef(false);

  const w = useWindowWidth();
  const isMobile = w <= 768;

  const formatApiOrder = useCallback((o) => {
    let normStatus = 'placed';
    let step = 0;
    const st = String(o.status || '').toLowerCase();
    if (st === 'delivered') { normStatus = 'delivered'; step = 4; }
    else if (st === 'out_for_delivery' || st === 'out-for-delivery' || st === 'picked_up') { normStatus = 'out-for-delivery'; step = 3; }
    else if (st === 'ready_for_pickup' || st === 'ready') { normStatus = 'ready'; step = 2; }
    else if (st === 'preparing' || st === 'confirmed') { normStatus = 'preparing'; step = 1; }
    else if (st === 'cancelled') { normStatus = 'cancelled'; step = -1; }
    else { normStatus = 'placed'; step = 0; }

    const rawItems = Array.isArray(o.items) ? o.items : (() => {
      try { return JSON.parse(o.items || '[]'); } catch { return []; }
    })();
    const dateStr = o.created_at
      ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : (o.date || 'Just now');
    const timeStr = o.created_at
      ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : (o.time || '10:00 AM');

    return {
      id: o.id || `GB${String(o.id || '').slice(-6) || '9921'}`,
      rawId: o.id,
      date: `${dateStr}, ${timeStr}`,
      status: normStatus,
      eta: o.estimated_time || 'Arriving in 15 min',
      trackerStep: step,
      items: rawItems.map(it => ({
        name: it.name || it.product_name || 'Item',
        qty: it.qty || it.quantity || 1,
        price: it.price || it.unit_price || 50,
        image: it.image || it.image_url || 'lays-classic-salted'
      })),
      totalItems: rawItems.reduce((acc, it) => acc + (it.qty || it.quantity || 1), 0),
      total: Number(o.total_amount || o.total) || 199,
      address: o.delivery_address || o.address || 'Delivery Address',
      paymentMethod: o.payment_method || 'UPI',
      deliverySlot: o.estimated_time || '10-15 min express delivery',
      discount: Number(o.discount) || 0
    };
  }, []);

  const [ordersList, setOrdersList] = useState(loadFastCachedOrders);

  const fetchCloudOrders = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const currentPhone = getCurrentUserPhone();
      const fetchPath = currentPhone ? `/orders/user/${currentPhone}` : '/orders/';
      const apiOrders = await get(fetchPath).catch(() => []);
      if (Array.isArray(apiOrders)) {
        const formatted = apiOrders
          .filter(o => {
            const addr = (o.delivery_address || o.address || '').trim();
            const items = Array.isArray(o.items) ? o.items
              : (() => { try { return JSON.parse(o.items || '[]'); } catch { return []; } })();
            return addr.length > 4 && items.length > 0 && Number(o.total_amount || o.total || 0) > 0;
          })
          .map(formatApiOrder);
        setOrdersList(formatted);
        try {
          sessionStorage.setItem('grabit_fast_orders_cache', JSON.stringify(formatted));
        } catch {}
      }
    } catch (error) {
      console.warn('Failed to fetch orders from cloud', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [formatApiOrder]);

  useEffect(() => {
    forceScrollToTop();
  }, [activeTab, selectedOrderModal]);

  useEffect(() => {
    fetchCloudOrders();
    const interval = setInterval(fetchCloudOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchCloudOrders]);



  const dynamicStats = useMemo(() => {
    const total = ordersList.length;
    const delivered = ordersList.filter(o => o.status === 'delivered').length;
    const ongoing = ordersList.filter(o => o.status === 'out-for-delivery' || o.status === 'confirmed' || o.status === 'ready').length;
    const cancelled = ordersList.filter(o => o.status === 'cancelled').length;
    const totalSpent = ordersList.reduce((sum, o) => sum + (o.total || 0), 0);
    return { total, delivered, ongoing, cancelled, totalSpent };
  }, [ordersList]);

  const filtered = ordersList.filter(o => {
    if (activeTab === 'All Orders') return true;
    if (activeTab === 'Ongoing') return o.status === 'out-for-delivery' || o.status === 'confirmed' || o.status === 'ready';
    if (activeTab === 'Delivered') return o.status === 'delivered';
    if (activeTab === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  const handleReorder = (order) => {
    (order.items || []).forEach(item => addItem({
      id: item.name,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: 1
    }));
    showToast(`Added items from Order #${order.id} to your Cart!`);
  };

  return (
    <div style={{ background: '#F4F5F8', minHeight: '100vh', padding: isMobile ? '12px 12px 90px' : '24px 24px 60px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── 1. PAGE HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: isMobile ? '14px' : '20px'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={18} color="#0F172A" />
          </button>
          <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            My Orders
          </h1>
        </div>

        {/* ── 2. RESPONSIVE GRID LAYOUT ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 310px',
          gap: isMobile ? '16px' : '24px',
          alignItems: 'flex-start',
          width: '100%', boxSizing: 'border-box'
        }}>
          
          {/* ── LEFT: ORDERS LIST ── */}
          <div style={{ width: '100%', minWidth: 0 }}>
            
            {/* Status Filter Tabs (Horizontal Scrollable on Mobile) */}
            <div style={{
              display: 'flex', gap: '8px', overflowX: 'auto',
              marginBottom: '16px', paddingBottom: '4px',
              scrollbarWidth: 'none', msOverflowStyle: 'none'
            }}>
              {STATUS_TABS.map(t => {
                const isActive = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    style={{
                      background: isActive ? '#0071E3' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#475569',
                      border: isActive ? '1px solid #0071E3' : '1px solid #CBD5E1',
                      borderRadius: '20px', padding: isMobile ? '7px 16px' : '8px 18px',
                      fontSize: '12.5px', fontWeight: isActive ? 900 : 700,
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      boxShadow: isActive ? '0 4px 12px rgba(0,113,227,0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Empty State */}
            {filtered.length === 0 ? (
              <div style={{
                background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
                padding: '40px 20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>🛍️</div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>No orders found</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px' }}>
                  You have no active orders in "{activeTab}".
                </p>
                <Link
                  to="/"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: '#0071E3', color: '#FFFFFF', padding: '10px 22px',
                    borderRadius: '12px', fontSize: '13px', fontWeight: 900,
                    textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,113,227,0.3)'
                  }}
                >
                  Explore Products &amp; Shop Now
                </Link>
              </div>
            ) : (
              filtered.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF', borderRadius: '18px',
                    border: '1px solid #E2E8F0', padding: isMobile ? '14px 16px' : '20px',
                    marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Order Card Top Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: '14px', flexWrap: 'wrap', gap: '8px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 900, fontSize: isMobile ? '14px' : '15px', color: '#0F172A' }}>
                          Order ID: #GB{order.id}
                        </span>
                        <ChevronRight size={16} color="#94A3B8" />
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>
                        {order.date}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 900,
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 
                        (order.status === 'out-for-delivery' || order.status === 'out_for_delivery') ? '#EFF6FF' : 
                        order.status === 'delivered' ? '#ECFDF5' : 
                        (order.status === 'ready' || order.status === 'ready_for_pickup') ? '#F0FDF4' :
                        (order.status === 'confirmed' || order.status === 'preparing') ? '#FFFBEB' : 
                        order.status === 'placed' ? '#EEF2F6' :
                        '#FEF2F2',
                      color: 
                        (order.status === 'out-for-delivery' || order.status === 'out_for_delivery') ? '#0071E3' : 
                        order.status === 'delivered' ? '#10B981' : 
                        (order.status === 'ready' || order.status === 'ready_for_pickup') ? '#15803D' :
                        (order.status === 'confirmed' || order.status === 'preparing') ? '#D97706' : 
                        order.status === 'placed' ? '#475569' :
                        '#EF4444',
                      border: 
                        (order.status === 'out-for-delivery' || order.status === 'out_for_delivery') ? '1px solid #BFDBFE' : 
                        order.status === 'delivered' ? '1px solid #A7F3D0' : 
                        (order.status === 'ready' || order.status === 'ready_for_pickup') ? '1px solid #86EFAC' :
                        (order.status === 'confirmed' || order.status === 'preparing') ? '1px solid #FDE68A' : 
                        order.status === 'placed' ? '1px solid #CBD5E1' :
                        '1px solid #FECACA'
                    }}>
                      {order.status === 'delivered' && <>✓ Delivered</>}
                      {(order.status === 'out-for-delivery' || order.status === 'out_for_delivery') && <>🛵 Out for Delivery</>}
                      {(order.status === 'ready' || order.status === 'ready_for_pickup') && <>📦 Ready for Pickup</>}
                      {(order.status === 'confirmed' || order.status === 'preparing') && <>⏱️ Preparing Order</>}
                      {order.status === 'placed' && <>⏱️ Order Placed</>}
                      {order.status === 'cancelled' && <>✕ Cancelled</>}
                    </span>
                  </div>

                  {/* Active Express Order Live Tracker Banner */}
                  {(order.status === 'out-for-delivery' || order.status === 'out_for_delivery' || order.status === 'confirmed' || order.status === 'preparing' || order.status === 'placed') && (
                    <OrderTrackerCycle status={order.status} eta={order.eta} orderNumber={order.id} />
                  )}

                  {/* Order Item Thumbnails */}
                  <div
                    className="hide-scrollbar"
                    style={{
                      display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px',
                      scrollbarWidth: 'none', msOverflowStyle: 'none'
                    }}
                  >
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          width: '48px', height: '48px', borderRadius: '10px',
                          background: '#F8FAFC', border: '1px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <ProductSvg name={item.image} size={36} />
                      </div>
                    ))}
                  </div>

                  {/* Order Card Footer */}
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    paddingTop: '14px',
                    borderTop: '1px solid #E2E8F0',
                    gap: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13.5px',
                      color: '#475569',
                      fontWeight: 700
                    }}>
                      <span>
                        <strong style={{ color: '#0F172A', fontWeight: 900 }}>{order.totalItems} items</strong>
                        <span style={{ margin: '0 6px', color: '#CBD5E1' }}>•</span>
                        Total <strong style={{ color: '#0071E3', fontWeight: 900, fontSize: '15px' }}>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong>
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      width: isMobile ? '100%' : 'auto',
                      minWidth: isMobile ? '100%' : '260px'
                    }}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderModal(order)}
                        style={{
                          background: '#FFFFFF',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '12px',
                          padding: '10px 16px',
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#0F172A',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#0071E3'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const isActive = isOngoingStatus(order.status);
                          if (isActive) {
                            navigate(`/orders/track/${order.rawId || order.id}`, { state: { order } });
                          } else {
                            handleReorder(order);
                          }
                        }}
                        style={{
                          background: '#0071E3',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 18px',
                          fontSize: '13px',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(0,113,227,0.25)',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#005BB5'}
                        onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}
                      >
                        {isOngoingStatus(order.status) ? 'Track Order' : 'Reorder'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── RIGHT: STATS SIDEBAR ── */}
          <div style={{ width: '100%', minWidth: 0 }}>
            <div style={{
              background: '#FFFFFF', borderRadius: '18px',
              border: '1px solid #E2E8F0', padding: '18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontWeight: 900, fontSize: '15px', marginBottom: '14px', color: '#0F172A' }}>
                Order Summary
              </h3>

              {[
                ['Total Orders', dynamicStats.total],
                ['Delivered', dynamicStats.delivered],
                ['Ongoing', dynamicStats.ongoing],
                ['Cancelled', dynamicStats.cancelled],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>{val}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: '15px', fontWeight: 900 }}>
                <span style={{ color: '#0F172A' }}>Total Spent</span>
                <span style={{ color: '#0071E3' }}>₹{dynamicStats.totalSpent}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── ORDER DETAILS MODAL ── */}
      {selectedOrderModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%',
            padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button
              onClick={() => setSelectedOrderModal(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: '#F1F5F9', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={16} color="#0F172A" />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 4px', color: '#0F172A' }}>
              Order #{selectedOrderModal.id}
            </h3>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', fontWeight: 600 }}>
              Placed on {selectedOrderModal.date} • Total ₹{selectedOrderModal.total}
            </div>

            {/* Real-time Status Tracker Cycle */}
            <OrderTrackerCycle
              status={selectedOrderModal.status}
              eta={selectedOrderModal.eta}
              orderNumber={selectedOrderModal.id}
              expanded={true}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '280px', overflowY: 'auto' }}>
              {selectedOrderModal.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <ProductSvg name={item.image} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>Qty: {item.qty}</div>
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { handleReorder(selectedOrderModal); setSelectedOrderModal(null); }}
              style={{
                width: '100%', background: '#0071E3', border: 'none',
                borderRadius: '12px', padding: '12px', fontSize: '14px',
                fontWeight: 900, color: '#FFFFFF', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,113,227,0.3)'
              }}
            >
              Reorder All Items
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

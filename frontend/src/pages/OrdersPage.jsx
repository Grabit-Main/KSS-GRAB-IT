import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Zap, ArrowLeft, ShoppingBag, Truck, PackageCheck, AlertCircle, X, RefreshCw } from 'lucide-react';
import { trackerSteps } from '../data/orders';
import { products } from '../data/products';
import ProductSvg from '../components/common/ProductSvg';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import useWindowWidth from '../hooks/useWindowWidth';
import { get, patch } from '../api';
import { forceScrollToTop } from '../utils/scrollToTop';
import { notifyOrdersUpdated, subscribeOrdersUpdated } from '../utils/orderSync';

const canCancelOrder = (statusStr) => {
  const st = String(statusStr || '').toLowerCase();
  return st === 'placed' || st === 'preparing' || st === 'confirmed' || st === 'pending' || st === 'packed' || st === 'ready' || st === 'ready_for_pickup';
};

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
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
      borderRadius: '18px',
      padding: expanded ? '18px 20px' : '14px 16px',
      border: '1.5px solid #DBEAFE',
      color: '#0F172A',
      marginBottom: '16px',
      boxShadow: '0 4px 16px rgba(0, 113, 227, 0.06)'
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
            fontSize: '12px', fontWeight: 900,
            color: '#0071E3',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {isDelivered ? '✓ Order Delivered' : 'LIVE TRACKER STATUS'}
          </span>
        </div>
        {!isDelivered && (
          <div style={{
            background: '#DBEAFE',
            color: '#1E40AF',
            border: '1px solid #93C5FD',
            padding: '4px 12px', borderRadius: '20px',
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
          background: '#CBD5E1', zIndex: 0
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
                    : '#FFFFFF',
                  border: isCurrent
                    ? '3px solid #0071E3'
                    : isDone
                    ? '2px solid #10B981'
                    : '2px solid #94A3B8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 10px rgba(0,113,227,0.35)' : isDone ? '0 2px 6px rgba(16,185,129,0.2)' : 'none',
                  fontSize: isCurrent ? '14px' : '11px',
                  transition: 'all 0.25s ease'
                }}>
                  {isDone ? (
                    <Check size={13} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <span style={{ color: isCurrent ? '#FFFFFF' : '#475569' }}>{stage.icon}</span>
                  )}
                </div>

                {/* Short Clean Label */}
                <span style={{
                  fontSize: '10.5px', fontWeight: isCurrent ? 900 : 700,
                  color: isCurrent
                    ? '#0071E3'
                    : isDone
                    ? '#059669'
                    : '#64748B',
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
        padding: '12px 14px', borderRadius: '14px',
        background: '#FFFFFF',
        border: '1px solid #BFDBFE',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        boxShadow: '0 2px 8px rgba(0,113,227,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
            animation: currentStep === 3 ? 'riderMove 1.5s ease-in-out infinite' : 'none'
          }}>
            {activeStage.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Current Status: {activeStage.fullLabel}
            </div>
            <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '1px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

const safeParseItems = (rawItems) => {
  if (Array.isArray(rawItems)) return rawItems;
  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
};

const formatOrderId = (id) => {
  if (!id) return 'GB-9921';
  let str = String(id).trim();
  if (str.startsWith('#')) str = str.slice(1);
  if (/^GB-?\d+$/i.test(str)) {
    return str.replace(/^GB-?/i, 'GB-');
  }
  if (str.includes('-') && str.length > 15) {
    const parts = str.split('-');
    const lastPart = parts[parts.length - 1];
    return `GB-${lastPart.slice(-5).toUpperCase()}`;
  }
  if (str.length > 10) {
    return `GB-${str.slice(-5).toUpperCase()}`;
  }
  return str.startsWith('GB-') ? str : `GB-${str}`;
};

const isValidRealOrder = (o) => {
  if (!o) return false;
  const addr = (o.delivery_address || o.address || '').trim().toLowerCase();
  if (!addr || addr === 'enter your delivery address' || addr.length < 5) return false;
  const custName = (o.customer_name || '').trim().toLowerCase();
  if (custName.includes('fresh mart supermarket')) return false;
  const itemsList = safeParseItems(o.items);
  if (!Array.isArray(itemsList) || itemsList.length === 0) return false;
  const total = Number(o.total_amount || o.total || 0);
  if (total <= 0) return false;
  return true;
};

const getCurrentUserPhone = () => {
  try {
    const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
    const digits = (u.phone || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
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
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [isCancelling, setIsCancelling] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleConfirmCancelOrder = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    const targetId = cancellingOrder.rawId || cancellingOrder.id;
    const finalReason = cancelReason || 'Cancelled by customer';

    try {
      try {
        await patch(`/orders/${targetId}/status`, {
          status: 'cancelled',
          cancellation_reason: finalReason
        });
      } catch (err) {
        console.warn('Backend patch failed, updating local stores:', err);
      }

      const updateList = (list) => {
        if (!Array.isArray(list)) return [];
        return list.map(o => {
          if (o.id === cancellingOrder.id || o.rawId === targetId || o.id === targetId) {
            return {
              ...o,
              status: 'cancelled',
              cancellation_reason: finalReason,
              cancelled_at: new Date().toISOString()
            };
          }
          return o;
        });
      };

      try {
        const global = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        localStorage.setItem('grabit_orders', JSON.stringify(updateList(global)));

        const digits = (cancellingOrder.customer_phone || '').replace(/\D/g, '');
        const custPhone = digits.length >= 10 ? digits.slice(-10) : digits;
        if (custPhone) {
          const userOrders = JSON.parse(localStorage.getItem(`grabit_orders_${custPhone}`) || '[]');
          localStorage.setItem(`grabit_orders_${custPhone}`, JSON.stringify(updateList(userOrders)));
        }

        const cached = JSON.parse(sessionStorage.getItem('grabit_fast_orders_cache') || '[]');
        sessionStorage.setItem('grabit_fast_orders_cache', JSON.stringify(updateList(cached)));
      } catch (storageErr) {
        console.warn('Local store update error:', storageErr);
      }

      setOrdersList(prev => updateList(prev));
      if (selectedOrderModal && (selectedOrderModal.id === cancellingOrder.id || selectedOrderModal.rawId === targetId)) {
        setSelectedOrderModal(prev => ({
          ...prev,
          status: 'cancelled',
          cancellation_reason: finalReason
        }));
      }

      notifyOrdersUpdated({ orderId: targetId, status: 'cancelled' });
      window.dispatchEvent(new Event('grabit_notifications_updated'));

      showToast(`Order #${cancellingOrder.id} has been cancelled.`);
      setCancellingOrder(null);
    } catch (e) {
      console.error('Failed to cancel order:', e);
      showToast('Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const isFetchingRef = useRef(false);

  const w = useWindowWidth();
  const isMobile = w <= 768;

  // ─ Format a raw API order into the display shape used by the UI ─
  const formatApiOrder = useCallback((o) => {
    let normStatus = 'placed';
    let step = 0;
    const st = String(o.status || '').toLowerCase();
    if (st === 'delivered') { normStatus = 'delivered'; step = 4; }
    else if (st === 'out_for_delivery' || st === 'out-for-delivery' || st === 'picked_up') { normStatus = 'out-for-delivery'; step = 3; }
    else if (st === 'ready' || st === 'ready_for_pickup') { normStatus = 'ready'; step = 2; }
    else if (st === 'preparing' || st === 'confirmed') { normStatus = 'preparing'; step = 1; }
    else if (st === 'cancelled') { normStatus = 'cancelled'; step = -1; }
    else { normStatus = 'placed'; step = 0; }

    const rawItemList = safeParseItems(o.items);
    const parsedItems = rawItemList.map(it => ({
      name: it.name || 'Product Item',
      qty: Number(it.qty || it.quantity) || 1,
      price: Number(it.price || it.unit_price) || 0,
      image: it.image || it.image_url || it.name || 'lays-classic-salted'
    }));

    const totalItemCount = parsedItems.reduce((acc, it) => acc + it.qty, 0);
    const displayId = formatOrderId(o.id || o.rawId || o.orderNumber);
    const dateStr = o.created_at
      ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : (o.date || 'Just now');
    const timeStr = o.created_at
      ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : (o.time || '');

    return {
      id: o.id || o.rawId || displayId,
      displayId,
      rawId: o.rawId || o.id,
      canonicalId: o.rawId || o.id || displayId,
      date: timeStr ? `${dateStr}, ${timeStr}` : dateStr,
      status: normStatus,
      rawStatus: o.status,
      eta: o.estimated_time || 'Arriving in 15 min',
      trackerStep: step,
      items: parsedItems,
      totalItems: totalItemCount > 0 ? totalItemCount : 1,
      total: Number(o.total_amount || o.total) || 199,
      address: o.delivery_address || o.address || 'Customer Delivery Address',
      paymentMethod: (o.payment_method || 'UPI').toUpperCase(),
      deliverySlot: o.estimated_time || '10-15 min express delivery',
      discount: Number(o.discount) || 0,
      mrp_total: Number(o.mrp_total) || 0,
      subtotal: Number(o.subtotal) || 0,
      coupon_discount: Number(o.coupon_discount) || 0,
      delivery_fee: Number(o.delivery_fee) || 0
    };
  }, []);

  const [ordersList, setOrdersList] = useState(loadFastCachedOrders);

  // ─ Fetch all orders for this customer from cloud ─
  const fetchCloudOrders = useCallback(async () => {
    if (document.hidden) return; // Pause polling when browser tab is in background
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const currentPhone = getCurrentUserPhone();
      const fetchPath = currentPhone ? `/orders/user/${currentPhone}` : '/orders/';
      const apiOrders = await get(fetchPath).catch(() => []);
      if (Array.isArray(apiOrders)) {
        const valid = apiOrders.filter(isValidRealOrder);
        const formatted = valid.map(formatApiOrder);
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
    let isMounted = true;
    isFetchingRef.current = false;

    // Initial fetch on mount
    fetchCloudOrders();

    // Relaxed smart polling every 20s when tab is active
    const interval = setInterval(() => {
      if (isMounted && !document.hidden) {
        fetchCloudOrders();
      }
    }, 20000);

    // Refresh immediately when returning to tab
    const handleVisibilityChange = () => {
      if (isMounted && !document.hidden) {
        fetchCloudOrders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh immediately on local orders/notification updates without waiting for polling
    const unsubscribeOrders = subscribeOrdersUpdated(() => {
      if (isMounted) fetchCloudOrders();
    });

    return () => {
      isMounted = false;
      isFetchingRef.current = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribeOrders();
    };
  }, [fetchCloudOrders]);


  const isOngoingStatus = (status) =>
    status === 'confirmed' || status === 'out-for-delivery' || status === 'ready' || status === 'placed' || status === 'preparing';

  const dynamicStats = useMemo(() => {
    const total = ordersList.length;
    const delivered = ordersList.filter(o => o.status === 'delivered').length;
    const ongoing = ordersList.filter(o => isOngoingStatus(o.status)).length;
    const cancelled = ordersList.filter(o => o.status === 'cancelled').length;
    const totalSpent = ordersList.reduce((sum, o) => sum + (o.total || 0), 0);
    return { total, delivered, ongoing, cancelled, totalSpent };
  }, [ordersList]);

  const filtered = ordersList.filter(o => {
    if (activeTab === 'All Orders') return true;
    if (activeTab === 'Ongoing') return isOngoingStatus(o.status);
    if (activeTab === 'Delivered') return o.status === 'delivered';
    if (activeTab === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  const handleReorder = (order) => {
    const itemList = safeParseItems(order?.items);
    itemList.forEach(item => {
      const matchedProd = products.find(p => 
        (item.id && String(p.id) === String(item.id)) ||
        (item.product_id && String(p.id) === String(item.product_id)) ||
        (p.name && item.name && p.name.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
        (p.name && item.name && item.name.toLowerCase().startsWith(p.name.toLowerCase()))
      );

      const targetId = item.id || item.product_id || matchedProd?.id || item.name;
      addItem({
        id: targetId,
        name: matchedProd?.name || item.name,
        price: Number(item.price) || Number(matchedProd?.price) || 50,
        mrp: Number(item.mrp) || Number(matchedProd?.mrp) || Math.round((Number(item.price) || 50) * 1.15),
        image: item.image || matchedProd?.image || 'lays-classic-salted',
        weight: item.weight || matchedProd?.weight || ''
      }, Number(item.qty || item.quantity) || 1);
    });
    showToast(`Added items from Order #${order.displayId || order.id} to your Cart!`);
  };

  return (
    <div style={{ background: '#F4F5F8', minHeight: '100vh', padding: isMobile ? '24px 12px 90px' : '36px 24px 60px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── 1. PAGE HEADER ── */}
        <div style={{
          marginTop: isMobile ? '8px' : '12px',
          marginBottom: isMobile ? '16px' : '24px'
        }}>
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
            
            {/* Status Filter Tabs */}
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
              filtered.map(order => {
                const itemList = safeParseItems(order.items);
                const displayId = order.displayId || formatOrderId(order.id);
                return (
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
                          <span style={{ fontWeight: 900, fontSize: isMobile ? '14px' : '15px', color: '#0F172A', letterSpacing: '-0.01em' }}>
                            Order #{displayId}
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
                      <OrderTrackerCycle status={order.status} eta={order.eta} orderNumber={displayId} />
                    )}

                    {/* Order Item Thumbnails */}
                    <div
                      className="hide-scrollbar"
                      style={{
                        display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px',
                        scrollbarWidth: 'none', msOverflowStyle: 'none'
                      }}
                    >
                      {itemList.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            width: '48px', height: '48px', borderRadius: '10px',
                            background: '#F8FAFC', border: '1px solid #E2E8F0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <ProductSvg name={item.image || item.name} size={36} />
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: isMobile ? 'stretch' : 'flex-end'
                      }}>
                        {canCancelOrder(order.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingOrder(order);
                              setCancelReason('Placed order by mistake');
                            }}
                            style={{
                              background: '#FEF2F2',
                              border: '1.5px solid #FECACA',
                              borderRadius: '12px',
                              padding: '10px 14px',
                              fontSize: '13px',
                              fontWeight: 800,
                              color: '#DC2626',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              flex: isMobile ? 1 : 'none'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#F87171'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; }}
                          >
                            <X size={14} strokeWidth={2.4} />
                            <span>Cancel Order</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrderModal(order)}
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #CBD5E1',
                            borderRadius: '12px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#0F172A',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: isMobile ? 1 : 'none',
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
                            justifyContent: 'center',
                            flex: isMobile && canCancelOrder(order.status) ? '1 1 100%' : (isMobile ? 1 : 'none')
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#005BB5'}
                          onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}
                        >
                          {isOngoingStatus(order.status) ? 'Track Order' : 'Reorder'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
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
                <span style={{ color: '#0071E3' }}>₹{dynamicStats.totalSpent.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── ORDER DETAILS MODAL ── */}
      {selectedOrderModal && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '480px', width: '100%',
            padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
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

            {/* Modal Header */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0F172A' }}>
                  Order #{selectedOrderModal.displayId || formatOrderId(selectedOrderModal.id)}
                </h3>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                Placed on {selectedOrderModal.date} • {selectedOrderModal.paymentMethod}
              </div>
            </div>

            {/* Expanded Real-Time Order Cycle Tracker */}
            <OrderTrackerCycle
              status={selectedOrderModal.status}
              eta={selectedOrderModal.eta}
              orderNumber={selectedOrderModal.displayId || formatOrderId(selectedOrderModal.id)}
              expanded={true}
            />

            {/* Delivery Address Box */}
            <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Delivery Address</div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.4 }}>{selectedOrderModal.address}</div>
            </div>

            {/* Items List */}
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
              Ordered Items ({selectedOrderModal.totalItems})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '240px', overflowY: 'auto' }}>
              {(safeParseItems(selectedOrderModal.items)).map((item, idx) => {
                const p = Number(item.price || item.unit_price) || 0;
                const q = Number(item.qty || item.quantity) || 1;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ProductSvg name={item.image || item.name} size={32} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Qty: {q} × ₹{p}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A', flexShrink: 0, whiteSpace: 'nowrap' }}>₹{p * q}</span>
                  </div>
                );
              })}
            </div>

            {/* Total Summary */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Item Total</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>
                  ₹{selectedOrderModal.mrp_total || (Number(selectedOrderModal.total || 0) + Number(selectedOrderModal.discount || 0) + Number(selectedOrderModal.coupon_discount || 0) - Number(selectedOrderModal.delivery_fee || 0))}
                </span>
              </div>
              {Number(selectedOrderModal.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Product Discount</span>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>-₹{selectedOrderModal.discount}</span>
                </div>
              )}
              {Number(selectedOrderModal.coupon_discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Coupon Discount</span>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>-₹{selectedOrderModal.coupon_discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee</span>
                <span style={{ color: (Number(selectedOrderModal.delivery_fee) || 0) === 0 ? '#10B981' : '#0F172A', fontWeight: 800 }}>
                  {(Number(selectedOrderModal.delivery_fee) || 0) === 0 ? 'FREE' : `₹${selectedOrderModal.delivery_fee}`}
                </span>
              </div>
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Total Paid</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#0071E3' }}>₹{selectedOrderModal.total}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {canCancelOrder(selectedOrderModal.status) && (
                <button
                  type="button"
                  onClick={() => {
                    const orderToCancel = selectedOrderModal;
                    setSelectedOrderModal(null);
                    setCancellingOrder(orderToCancel);
                    setCancelReason('Placed order by mistake');
                  }}
                  style={{
                    flex: 1,
                    background: '#FEF2F2',
                    border: '1.5px solid #FECACA',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: '#DC2626',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                >
                  <X size={14} strokeWidth={2.4} />
                  <span>Cancel Order</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (isOngoingStatus(selectedOrderModal.status)) {
                    const o = selectedOrderModal;
                    setSelectedOrderModal(null);
                    navigate(`/orders/track/${o.rawId || o.id}`, { state: { order: o } });
                  } else {
                    handleReorder(selectedOrderModal);
                    setSelectedOrderModal(null);
                  }
                }}
                style={{
                  flex: 1,
                  background: '#0071E3',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,113,227,0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#005BB5'}
                onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}
              >
                {isOngoingStatus(selectedOrderModal.status) ? 'Track Live Order' : 'Reorder All Items'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── CANCEL ORDER CONFIRMATION MODAL ── */}
      {cancellingOrder && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%',
            padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative'
          }}>
            {/* Header Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: '#FEE2E2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, border: '1px solid #FECACA'
              }}>
                <AlertCircle size={24} color="#DC2626" strokeWidth={2.4} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                  Cancel Order #{String(cancellingOrder.id || cancellingOrder.rawId || '').startsWith('ORD-') ? (cancellingOrder.id || cancellingOrder.rawId) : `ORD-${String(cancellingOrder.id || cancellingOrder.rawId || '').slice(0, 8).toUpperCase()}`}?
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  Are you sure you want to cancel this order? Once cancelled, this action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isCancelling && setCancellingOrder(null)}
                style={{
                  background: '#F1F5F9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748B', flexShrink: 0
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Refund notice banner */}
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px',
              padding: '12px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Check size={18} color="#16A34A" strokeWidth={2.5} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12.5px', color: '#166534', fontWeight: 600, lineHeight: 1.4 }}>
                A 100% full refund of <strong style={{ fontWeight: 800 }}>₹{Number(cancellingOrder.total || 0).toLocaleString('en-IN')}</strong> will be credited to your original payment source within 15-30 minutes.
              </div>
            </div>

            {/* Reason selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                Reason for cancellation:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Placed order by mistake',
                  'Need to change delivery address or phone',
                  'Forgot to add essential items',
                  'Delivery time is taking too long',
                  'Other reason'
                ].map((reason) => {
                  const isChecked = cancelReason === reason;
                  return (
                    <label
                      key={reason}
                      onClick={() => setCancelReason(reason)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: isChecked ? '#EFF6FF' : '#F8FAFC',
                        border: isChecked ? '1.5px solid #0071E3' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isChecked ? 700 : 500,
                        color: isChecked ? '#0071E3' : '#334155',
                        transition: 'all 0.12s ease',
                        textAlign: 'left'
                      }}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={isChecked}
                        onChange={() => setCancelReason(reason)}
                        style={{ accentColor: '#0071E3', margin: 0, width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }}
                      />
                      <span style={{ textAlign: 'left', margin: 0 }}>{reason}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellingOrder(null)}
                style={{
                  background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '12px',
                  padding: '12px', fontSize: '13.5px', fontWeight: 800, color: '#334155',
                  cursor: isCancelling ? 'not-allowed' : 'pointer'
                }}
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancelOrder}
                style={{
                  background: '#DC2626', border: 'none', borderRadius: '12px',
                  padding: '12px', fontSize: '13.5px', fontWeight: 900, color: '#FFFFFF',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  opacity: isCancelling ? 0.7 : 1
                }}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

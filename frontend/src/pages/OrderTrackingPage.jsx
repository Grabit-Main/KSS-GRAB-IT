import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, MapPin, Phone, MessageSquare, ShieldCheck, CheckCircle2,
  Package, ShoppingBag, Truck, AlertCircle, RefreshCw, ChevronRight, HelpCircle,
  X, Send, PhoneCall, Check, ExternalLink, Sparkles, Zap
} from 'lucide-react';
import { get } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductSvg from '../components/common/ProductSvg';
import useWindowWidth from '../hooks/useWindowWidth';
import { forceScrollToTop } from '../utils/scrollToTop';
import CustomerReviewSection from '../components/common/CustomerReviewSection';

const ORDER_CYCLE_STAGES = [
  { key: 'placed', label: 'Placed', fullLabel: 'Order Placed', desc: 'Order received & verified', icon: '🛒' },
  { key: 'preparing', label: 'Preparing', fullLabel: 'Store Packing', desc: 'Fresh Mart is packing your items', icon: '🍳' },
  { key: 'ready', label: 'Ready', fullLabel: 'Ready for Pickup', desc: 'Packed & awaiting rider pickup', icon: '📦' },
  { key: 'out_for_delivery', label: 'On the Way', fullLabel: 'Out for Delivery', desc: 'Rider is on the way to your door', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', fullLabel: 'Order Delivered', desc: 'Delivered safely to your doorstep', icon: '🎉' }
];

const getStepIndex = (statusStr) => {
  const st = String(statusStr || '').toLowerCase();
  if (st === 'delivered') return 4;
  if (st === 'out_for_delivery' || st === 'out-for-delivery' || st === 'picked_up') return 3;
  if (st === 'ready' || st === 'ready_for_pickup') return 2;
  if (st === 'preparing' || st === 'confirmed') return 1;
  if (st === 'cancelled') return -1;
  return 0;
};

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const w = useWindowWidth();
  const isMobile = w <= 768;

  const [order, setOrder] = useState(() => {
    if (location.state?.order) return location.state.order;
    try {
      const cached = sessionStorage.getItem('grabit_fast_orders_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const found = parsed.find(o => String(o.id) === String(orderId) || String(o.rawId) === String(orderId));
        if (found) return found;
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(!order);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'agent', text: 'Hello! 👋 I am your GrabIt Support Assistant. How can I help you with this order today?', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [issueSubmitted, setIssueSubmitted] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    forceScrollToTop();
  }, []);

  // Safe parse helper
  const safeParseItems = (raw) => {
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw || '[]'); } catch { return []; }
  };

  // Fetch or sync order live
  const fetchOrder = useCallback(async () => {
    try {
      let activeUserPhone = '';
      try {
        const u = localStorage.getItem('grabit_user');
        if (u) activeUserPhone = JSON.parse(u).phone || '';
      } catch {}

      const hasToken = localStorage.getItem('grabit_session') || localStorage.getItem('grabit_seller_access') || localStorage.getItem('grabit_jwt');
      const fetchPath = (activeUserPhone && hasToken) ? `/orders/user/${activeUserPhone}` : (hasToken ? '/orders/' : '');
      const apiOrders = fetchPath ? await get(fetchPath).catch(() => []) : [];
      if (Array.isArray(apiOrders)) {
        const found = apiOrders.find(o => String(o.id) === String(orderId) || String(o.id).slice(0, 8) === String(orderId).slice(0, 8));
        if (found) {
          const st = String(found.status || '').toLowerCase();
          let step = getStepIndex(st);

          const rawItems = safeParseItems(found.items);
          const formatted = {
            id: found.id,
            rawId: found.id,
            displayId: `ORD-${String(found.id).slice(0, 8).toUpperCase()}`,
            date: found.created_at ? new Date(found.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently',
            status: st,
            normStatus: st === 'out_for_delivery' ? 'out-for-delivery' : st,
            statusLabel: st.replace(/_/g, ' ').toUpperCase(),
            eta: found.estimated_time || '10-15 min express delivery',
            trackerStep: step,
            items: rawItems.map(it => ({
              name: it.name || it.product_name || 'Item',
              qty: it.qty || it.quantity || 1,
              price: it.price || it.unit_price || 50,
              image: it.image || it.image_url || 'lays-classic-salted'
            })),
            totalItems: rawItems.reduce((acc, it) => acc + (it.qty || it.quantity || 1), 0),
            total: Number(found.total_amount || found.total) || 199,
            address: found.delivery_address || found.address || 'Delivery Address',
            paymentMethod: found.payment_method || 'UPI',
            deliverySlot: found.estimated_time || '10-15 min express delivery',
            discount: Number(found.discount) || 0
          };
          setOrder(formatted);
        }
      }
    } catch (err) {
      console.warn('Live order fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: chatInput.trim(), time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    const inputClean = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let replyText = "Our customer support team has logged your query. An agent will contact you shortly if needed!";
      if (inputClean.includes('rider') || inputClean.includes('driver') || inputClean.includes('location')) {
        replyText = "🛵 Your rider Karthik is currently 1.2 km away and moving towards your delivery location. Estimated arrival in ~8 mins.";
      } else if (inputClean.includes('cancel')) {
        replyText = "⚠️ Orders currently out for delivery cannot be cancelled automatically. Please call our toll-free support at +91 1800-419-4722 for immediate cancellation help.";
      } else if (inputClean.includes('item') || inputClean.includes('missing') || inputClean.includes('wrong')) {
        replyText = "📦 We're sorry for any issue! We've flagged item inspection for your order. If any item is damaged or missing upon delivery, full instant refund will be issued to your wallet.";
      }
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'agent', text: replyText, time: 'Just now' }]);
    }, 800);
  };

  const handleReorder = () => {
    if (!order || !order.items) return;
    order.items.forEach(it => {
      addItem({
        id: it.name.replace(/\s+/g, '-').toLowerCase(),
        name: it.name,
        price: it.price,
        mrp: Math.round(it.price * 1.15),
        image: it.image
      }, it.qty);
    });
    showToast(`${order.items.length} items added back to your cart! 🛒`);
    navigate('/cart');
  };

  if (loading && !order) {
    return (
      <div className="container section" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <RefreshCw size={36} className="animate-spin" color="#0071E3" />
        <p style={{ fontWeight: 600, color: '#64748B' }}>Fetching live order tracking details...</p>
      </div>
    );
  }

  const currentStepIndex = order ? getStepIndex(order.status) : 0;
  const isDelivered = order?.status === 'delivered';
  const isCancelled = order?.status === 'cancelled';
  const isRiderAssigned = Boolean(
    (order?.delivery_agent_id && String(order.delivery_agent_id).toLowerCase() !== 'unassigned' && String(order.delivery_agent_id).toLowerCase() !== 'none') ||
    order?.deliveryAgent ||
    order?.delivery_agent ||
    currentStepIndex >= 3 ||
    ['out_for_delivery', 'out-for-delivery', 'picked_up', 'delivered'].includes(String(order?.status || '').toLowerCase())
  );

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: isMobile ? '90px' : '60px' }}>
      
      {/* ── TOP NAV BAR ── */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: isMobile ? '12px 16px' : '16px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: '#F1F5F9', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#0F172A'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Order Tracking
              </div>
              <h1 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                {order?.displayId || `Order #${orderId}`}
              </h1>
            </div>
          </div>

          <button
            onClick={() => setSupportModalOpen(true)}
            style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#0071E3',
              borderRadius: '20px', padding: '8px 14px', fontSize: '13px', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            <HelpCircle size={16} />
            Need Help?
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '20px' }}>
        
        {/* ── HERO LIVE ETA CARD ── */}
        <div style={{
          background: isCancelled ? '#FEF2F2' : isDelivered ? '#F0FDF4' : 'linear-gradient(135deg, #0071E3 0%, #0056B3 100%)',
          borderRadius: '24px',
          padding: isMobile ? '20px' : '28px 36px',
          color: isCancelled ? '#991B1B' : isDelivered ? '#166534' : '#FFFFFF',
          boxShadow: '0 12px 30px rgba(0,113,227,0.18)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle bg glow */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: isCancelled ? '#FEE2E2' : isDelivered ? '#DCFCE7' : 'rgba(255,255,255,0.2)',
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '10px'
              }}>
                <Zap size={14} color={isCancelled ? '#DC2626' : isDelivered ? '#16A34A' : '#FFD700'} />
                {isCancelled ? 'ORDER CANCELLED' : isDelivered ? 'DELIVERED SUCCESSFULLY' : 'EXPRESS DELIVERY IN PROGRESS'}
              </div>

              <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                {isCancelled ? 'Order Was Cancelled' : isDelivered ? 'Delivered To Your Door' : 'Arriving in 10 - 15 Mins'}
              </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', fontWeight: 500 }}>
                {isCancelled ? 'Refund issued to your payment account.' : isDelivered ? `Delivered on ${order?.date}` : 'Store partner Fresh Mart is fulfilling your order en-route.'}
              </p>
            </div>

            {!isCancelled && !isDelivered && (
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '12px 20px',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Clock size={28} />
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>Estimated Arrival</div>
                  <div style={{ fontSize: '18px', fontWeight: 900 }}>10:45 AM</div>
                </div>
              </div>
            )}
          </div>

          {/* ── LIVE STEPPER TIMELINE ── */}
          {!isCancelled && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: isDelivered ? '1px solid #DCFCE7' : '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ORDER_CYCLE_STAGES.length}, 1fr)`, gap: '8px', position: 'relative' }}>
                {ORDER_CYCLE_STAGES.map((stg, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={stg.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{
                        width: isCurrent ? '36px' : '28px',
                        height: isCurrent ? '36px' : '28px',
                        borderRadius: '50%',
                        background: isDone
                          ? (isDelivered ? '#16A34A' : '#FFFFFF')
                          : 'rgba(255,255,255,0.3)',
                        color: isDone
                          ? (isDelivered ? '#FFFFFF' : '#0071E3')
                          : 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '13px',
                        marginBottom: '8px',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(255,255,255,0.35)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        {isDone ? <Check size={isCurrent ? 18 : 14} /> : idx + 1}
                      </div>
                      <div style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: isCurrent ? 900 : 700, opacity: isDone ? 1 : 0.6 }}>
                        {stg.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: '20px' }}>
          
          {/* ── LEFT COLUMN: RIDER + MAP + PRODUCTS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* 🛵 LIVE RIDER CARD & MAP (Only show after delivery partner is assigned) */}
            {!isCancelled && (
              isRiderAssigned ? (
                <>
                  <div style={{
                    background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
                    padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Assigned Delivery Partner
                      </div>
                      <span style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                        🟢 Verified Partner
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '54px', height: '54px', borderRadius: '50%', background: '#EFF6FF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid #0071E3', fontSize: '24px', fontWeight: 900, color: '#0071E3'
                        }}>
                          🛵
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
                            Karthik Rider
                          </h4>
                          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                            Speedy Express • Hero Electric (KA 01 EQ 4421)
                          </div>
                          <div style={{ fontSize: '12px', color: '#0071E3', fontWeight: 800, marginTop: '2px' }}>
                            ⭐ 4.9 Rating (420+ deliveries)
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a
                          href="tel:+919999900003"
                          onClick={() => showToast('Calling rider Karthik (+91 9999900003)... 📞')}
                          style={{
                            background: '#10B981', color: '#FFFFFF', borderRadius: '14px',
                            padding: '10px 16px', fontSize: '13px', fontWeight: 800,
                            display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none'
                          }}
                        >
                          <PhoneCall size={16} />
                          Call
                        </a>
                        <button
                          onClick={() => setChatModalOpen(true)}
                          style={{
                            background: '#0071E3', color: '#FFFFFF', borderRadius: '14px', border: 'none',
                            padding: '10px 16px', fontSize: '13px', fontWeight: 800,
                            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                          }}
                        >
                          <MessageSquare size={16} />
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 🗺️ LIVE SIMULATED ROUTE MAP */}
                  <div style={{
                    background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
                    padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>Live Route View</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0071E3' }}>1.2 km away</span>
                    </div>

                    <div style={{
                      height: '180px', borderRadius: '14px', background: '#EEF2FF',
                      position: 'relative', overflow: 'hidden', border: '1px solid #CBD5E1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {/* SVG Route Visual */}
                      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                        <path d="M 40 140 Q 150 40 320 120" stroke="#0071E3" strokeWidth="4" fill="none" strokeDasharray="6 6" />
                      </svg>

                      {/* Store Pin */}
                      <div style={{ position: 'absolute', left: '30px', bottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ background: '#1E293B', color: '#FFF', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>Store</div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3B82F6', border: '2px solid #FFF' }} />
                      </div>

                      {/* Moving Rider Pin */}
                      <div style={{ position: 'absolute', left: '48%', top: '38%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ background: '#0071E3', color: '#FFF', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 900, boxShadow: '0 4px 12px rgba(0,113,227,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🛵 Rider
                        </div>
                      </div>

                      {/* Customer Pin */}
                      <div style={{ position: 'absolute', right: '30px', bottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ background: '#10B981', color: '#FFF', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>Home</div>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#10B981', border: '2px solid #FFF' }} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
                  padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  display: 'flex', alignItems: 'center', gap: '14px'
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
                  }}>
                    ⏳
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                      Assigning Nearby Delivery Partner...
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                      Store is packing your items. Live partner details and GPS route will show as soon as a delivery partner is assigned.
                    </p>
                  </div>
                </div>
              )
            )}

            {/* 📦 ORDER ITEMS DETAILS */}
            <div style={{
              background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
              padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
                Order Items ({order?.items?.length || 0})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order?.items?.map((it, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingBottom: '12px', borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid #F1F5F9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '10px', background: '#F8FAFC',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0'
                      }}>
                        <ProductSvg name={it.image || it.name} size={28} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>{it.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Qty: {it.qty}</div>
                      </div>
                    </div>

                    <div style={{ fontWeight: 900, fontSize: '14px', color: '#0F172A' }}>
                      ₹{it.price * it.qty}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleReorder}
                  style={{
                    background: '#EFF6FF', color: '#0071E3', border: '1px solid #BFDBFE',
                    borderRadius: '12px', padding: '10px 18px', fontSize: '13px', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <RefreshCw size={15} />
                  Reorder All Items
                </button>
              </div>
            </div>

            {/* ⭐ SHARE YOUR EXPERIENCE REVIEW CARD */}
            <CustomerReviewSection storeName="Fresh Mart Supermarket" />

          </div>

          {/* ── RIGHT COLUMN: ADDRESS & PAYMENT BREAKDOWN & SUPPORT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* 📍 DELIVERY ADDRESS */}
            <div style={{
              background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
              padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapPin size={18} color="#0071E3" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>Delivery Address</h4>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                Home
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                {order?.address || 'Flat 402, Green Acres Apartment, Koramangala, Bengaluru 560034'}
              </div>
            </div>

            {/* 💰 PAYMENT BREAKDOWN */}
            <div style={{
              background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
              padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>Payment Details</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Item Subtotal</span>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>₹{order?.total || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Fee</span>
                  <span style={{ color: '#16A34A', fontWeight: 800 }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9', fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                  <span>Total Amount Paid</span>
                  <span style={{ color: '#0071E3' }}>₹{order?.total || 0}</span>
                </div>
              </div>

              <div style={{
                marginTop: '12px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '12px',
                border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 700, color: '#475569',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>Payment Method</span>
                <span style={{ textTransform: 'uppercase', color: '#0F172A' }}>{order?.paymentMethod || 'UPI'} ✓</span>
              </div>
            </div>

            {/* 🎧 QUICK CUSTOMER SUPPORT CARD */}
            <div style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              borderRadius: '20px', padding: '20px', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(15,23,42,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <HelpCircle size={22} color="#38BDF8" />
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>Need Help with Order?</h4>
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                Our 24/7 GrabIt Customer Care is here to assist with order changes, delays, or issues.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => setChatModalOpen(true)}
                  style={{
                    background: '#0071E3', color: '#FFF', border: 'none', borderRadius: '12px',
                    padding: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <MessageSquare size={16} />
                  Live Chat Support Assistant
                </button>
                <a
                  href="tel:+9118004194722"
                  style={{
                    background: 'rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '12px',
                    padding: '12px', fontSize: '13px', fontWeight: 800, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <Phone size={16} />
                  Call Support (+91 1800-419-4722)
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── LIVE CHAT SUPPORT MODAL ── */}
      {chatModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: isMobile ? '0' : '20px'
        }}>
          <div style={{
            background: '#FFFFFF', width: isMobile ? '100%' : '440px', height: isMobile ? '85vh' : '560px',
            borderRadius: isMobile ? '24px 24px 0 0' : '24px', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ background: '#0071E3', color: '#FFF', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ADE80' }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: '15px' }}>GrabIt Live Support</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>Online • Typically replies instantly</div>
                </div>
              </div>
              <button
                onClick={() => setChatModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: msg.sender === 'user' ? '#0071E3' : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Actions Chips */}
            <div style={{ padding: '8px 12px', background: '#FFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {['Where is rider?', 'Missing item', 'Cancel order', 'Talk to human agent'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => { setChatInput(opt); }}
                  style={{
                    whiteSpace: 'nowrap', background: '#EFF6FF', border: '1px solid #BFDBFE',
                    color: '#0071E3', borderRadius: '16px', padding: '6px 12px', fontSize: '12px',
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ padding: '12px 16px', background: '#FFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                style={{
                  flex: 1, border: '1px solid #CBD5E1', borderRadius: '20px', padding: '10px 16px',
                  fontSize: '13px', outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  background: '#0071E3', color: '#FFF', border: 'none', borderRadius: '50%',
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMER HELP & ISSUE MODAL ── */}
      {supportModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF', width: '100%', maxWidth: '460px', borderRadius: '24px',
            padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '18px', color: '#0F172A' }}>Need Help with Order?</h3>
              <button onClick={() => setSupportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {issueSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={48} color="#16A34A" style={{ marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 900 }}>Ticket Submitted!</h4>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
                  Our GrabIt resolution team is reviewing your report. You will receive an update in under 5 minutes.
                </p>
                <button
                  onClick={() => { setIssueSubmitted(false); setSupportModalOpen(false); }}
                  style={{ background: '#0071E3', color: '#FFF', border: 'none', borderRadius: '14px', padding: '12px 24px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Back to Tracking
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
                  Select an issue regarding <strong>{order?.displayId}</strong>:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {[
                    'Late Delivery / Delay',
                    'Missing or Incorrect Item',
                    'Damaged / Spilled Product',
                    'Driver Behavior Issue',
                    'Other Inquiry'
                  ].map((issue, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIssueType(issue)}
                      style={{
                        padding: '12px 16px', borderRadius: '14px',
                        border: selectedIssueType === issue ? '2px solid #0071E3' : '1px solid #E2E8F0',
                        background: selectedIssueType === issue ? '#EFF6FF' : '#FFFFFF',
                        color: '#0F172A', fontWeight: 700, fontSize: '13px', textAlign: 'left',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      {issue}
                      {selectedIssueType === issue && <Check size={16} color="#0071E3" />}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setSupportModalOpen(false)}
                    style={{ flex: 1, background: '#F1F5F9', border: 'none', borderRadius: '14px', padding: '12px', fontSize: '14px', fontWeight: 800, color: '#475569', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedIssueType) {
                        showToast('Please select an issue type first!');
                        return;
                      }
                      setIssueSubmitted(true);
                    }}
                    style={{ flex: 1, background: '#0071E3', border: 'none', borderRadius: '14px', padding: '12px', fontSize: '14px', fontWeight: 800, color: '#FFF', cursor: 'pointer' }}
                  >
                    Submit Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

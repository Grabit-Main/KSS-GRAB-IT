import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  User,
  MapPin,
  Phone,
  Printer,
  Search,
  CheckCheck,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Package,
  Layers
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useSellerAuth } from '../context/SellerAuthContext';
import { useToast } from '../context/ToastContext';
import { get, patch } from '../../api';
import { PackingSlipModal } from '../components/orders/PackingSlipModal';
import { playNewOrderChime } from '../utils/orderAudioAlert';

export const SellerOrdersPage = () => {
  const { seller } = useSellerAuth();

  // ✅ FIX: Seed from localStorage immediately so orders appear with zero delay.
  // The network fetch will merge in and update with fresh data when it arrives.
  const [orders, setOrders] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      return Array.isArray(local) ? local : [];
    } catch { return []; }
  });
  const hasLocalOrders = orders.length > 0;
  const [loading, setLoading] = useState(!hasLocalOrders); // skip spinner if we already have data
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlipOrder, setSelectedSlipOrder] = useState(null);
  const prevCountRef = useRef(0);
  const isInitialFetchRef = useRef(true);
  const isFetchingRef = useRef(false); // ✅ FIX: prevent overlapping poll requests

  const { showToast } = useToast();
  const storeName = seller?.store_name || seller?.full_name || seller?.name || 'Dark Store Supermarket';

  const fetchOrders = useCallback(async (isInitial = false) => {
    // ✅ FIX: Skip this poll cycle if the previous request is still in-flight.
    // Prevents request stacking when the backend is slow (> 2.5s response time).
    if (isFetchingRef.current && !isInitial) return;
    isFetchingRef.current = true;
    // Only show spinner if we have no data yet to display
    if (isInitial && orders.length === 0) setLoading(true);
    try {
      let apiOrders = [];
      try {
        const data = await get('/orders/');
        if (Array.isArray(data)) apiOrders = data;
      } catch {}

      // Also read shared local orders placed by customers
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      } catch {}

      const allRaw = [...localOrders, ...apiOrders];
      // Deduplicate strictly by ID and order details fingerprint
      const seenKeys = new Set();
      const seenFingerprints = new Set();
      const unique = [];

      for (const o of allRaw) {
        const key = o.rawId || o.id;
        const totalAmt = Number(o.total_amount || o.total || 0);
        const custName = (o.customer_name || 'Customer').toLowerCase().trim();
        const itemLen = Array.isArray(o.items) ? o.items.length : 0;
        const fingerprint = `${custName}_${totalAmt}_${itemLen}`;

        if (key && seenKeys.has(key)) continue;
        if (fingerprint && seenFingerprints.has(fingerprint)) continue;

        if (key) seenKeys.add(key);
        if (fingerprint) seenFingerprints.add(fingerprint);
        unique.push(o);
      }

      const formatted = unique.map((o) => {
        let itemsList = [];
        if (Array.isArray(o.items) && o.items.length > 0) {
          itemsList = o.items.map((it) => ({
            name: it.name || it.product_name || 'Express Grocery Item',
            quantity: it.qty || it.quantity || 1,
            price: it.price || 0,
          }));
        }

        const totalAmt = Number(o.total_amount || o.total || 0) || 0;

        return {
          id: o.id?.slice?.(0, 8) || o.id,
          orderNumber: o.id || o.orderNumber,
          rawId: o.rawId || o.id,
          customer_name: o.customer_name || 'Customer',
          customer_phone: o.customer_phone || '',
          delivery_address: o.delivery_address || o.address || 'Delivery Address',
          items: itemsList,
          total_amount: totalAmt,
          status: o.status || 'placed',
          delivery_agent_id: o.delivery_agent_id || null,
          created_at: o.created_at || new Date().toISOString(),
          date: o.date || new Date(o.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: o.time || new Date(o.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          payment_method: o.payment_method || 'UPI (Paid)',
        };
      });

      // Only display orders with real products and amount > 0
      const validOrders = formatted.filter((o) => o.items && o.items.length > 0 && o.total_amount > 0);

      // Acoustic chime on newly received customer orders
      const activeCount = validOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
      if (!isInitialFetchRef.current && activeCount > prevCountRef.current) {
        playNewOrderChime();
        showToast({ type: 'info', message: '🔔 New Customer Order received in Packing Queue!' });
      }
      prevCountRef.current = activeCount;
      isInitialFetchRef.current = false;

      setOrders(validOrders);
    } catch (err) {
      console.warn('Orders real-time sync fallback:', err);
    } finally {
      isFetchingRef.current = false;
      if (isInitial) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 2500);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, rawId, nextStatus, deliveryAgentId = null) => {
    // Optimistically update local React state immediately so button changes at once
    setOrders((prev) =>
      prev.map((o) =>
        o.rawId === rawId || o.id === rawId || o.id === orderId 
          ? { ...o, status: nextStatus, ...(deliveryAgentId ? { delivery_agent_id: deliveryAgentId } : {}) } 
          : o
      )
    );

    // 1. Update shared localStorage so Customer and Delivery portal see the change too.
    //    NOTE: orderId is the short 8-char display ID; rawId is always the full UUID.
    //    Orders in localStorage store the full UUID in both o.id and o.rawId, so we must
    //    match by rawId (full UUID) to reliably find the correct entry.
    try {
      const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      const updated = stored.map((o) => {
        if (
          o.rawId === rawId ||
          o.id === rawId ||           // full-UUID match (covers orders without rawId field)
          o.id === orderId ||         // 8-char fallback (rarely hits but harmless)
          o.orderNumber === rawId ||
          o.orderNumber === orderId
        ) {
          return { ...o, status: nextStatus, ...(deliveryAgentId ? { delivery_agent_id: deliveryAgentId } : {}) };
        }
        return o;
      });
      localStorage.setItem('grabit_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('grabit_orders_updated'));
    } catch {}

    // 2. Persist to backend API (best-effort — failure doesn't revert UI)
    try {
      const payload = { status: nextStatus };
      if (deliveryAgentId) {
        payload.delivery_agent_id = deliveryAgentId;
      }
      await patch(`/orders/${rawId}/status`, payload);
    } catch (err) {
      console.warn('Backend status update failed (will retry on next sync):', err);
    }

    showToast({ type: 'success', message: `Order #${orderId} marked as ${nextStatus.replace(/_/g, ' ')}!` });
  };

  const getStatusBadge = (status, deliveryAgentId = null) => {
    switch (status) {
      case 'placed':
        return <Badge variant="info">Placed</Badge>;
      case 'preparing':
        return <Badge variant="info">Preparing Order</Badge>;
      case 'ready':
      case 'ready_for_pickup':
        return deliveryAgentId 
          ? <Badge variant="active">Dispatched to Rider</Badge>
          : <Badge variant="active">Ready for Pickup</Badge>;
      case 'out_for_delivery':
        return <Badge variant="active">Out for Delivery (10 min)</Badge>;
      case 'delivered':
        return <Badge variant="default">Delivered</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Filter Active vs Completed/History
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  }, [orders]);

  const historyOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');
  }, [orders]);

  const totalHistoryRevenue = useMemo(() => {
    return historyOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  }, [historyOrders]);

  const displayedOrders = useMemo(() => {
    const pool = activeTab === 'active' ? activeOrders : historyOrders;
    if (!searchQuery.trim()) return pool;
    const q = searchQuery.toLowerCase().trim();
    return pool.filter(
      (o) =>
        String(o.id).toLowerCase().includes(q) ||
        String(o.customer_name).toLowerCase().includes(q) ||
        String(o.customer_phone).includes(q) ||
        o.items.some((it) => it.name.toLowerCase().includes(q))
    );
  }, [activeTab, activeOrders, historyOrders, searchQuery]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', margin: 0 }}>
              Live Orders &amp; Fulfillment Queue
            </h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ECFDF5', color: '#065F46', fontSize: '11.5px', fontWeight: 800, padding: '3px 10px', borderRadius: 20, border: '1px solid #A7F3D0' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> REALTIME SYNC
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '13.5px', marginTop: 4, margin: 0 }}>
            Manage instant 10-minute grocery packing, rider handovers, and delivered dispatch history.
          </p>
        </div>
      </div>

      {/* ── Tabs & Search Filter Bar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          backgroundColor: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          marginBottom: 20,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Filter Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: activeTab === 'active' ? '#0071E3' : '#F1F5F9',
              color: activeTab === 'active' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'active' ? '0 2px 8px rgba(0, 113, 227, 0.3)' : 'none',
            }}
          >
            <Package size={15} />
            <span>Live Packing Queue ({activeOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: activeTab === 'history' ? '#0F172A' : '#F1F5F9',
              color: activeTab === 'history' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'history' ? '0 2px 8px rgba(15, 23, 42, 0.25)' : 'none',
            }}
          >
            <CheckCheck size={15} />
            <span>Dispatched &amp; Delivered History ({historyOrders.length})</span>
          </button>
        </div>

        {/* Real-time Order Search */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '360px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search Order #, customer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#0F172A',
            }}
          />
        </div>
      </div>

      {/* ── Completed Orders Revenue Highlight Banner (History Mode) ── */}
      {activeTab === 'history' && historyOrders.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#34D399" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Total Fulfilled Revenue</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF' }}>₹{totalHistoryRevenue.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Total Dispatched</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#38BDF8' }}>{historyOrders.length} Orders</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Cards List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayedOrders.length === 0 ? (
          <Card style={{ padding: '56px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShoppingBag size={28} color="#64748B" />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
              {activeTab === 'active' ? 'No Active Store Orders' : 'No Fulfilled Orders in History'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '13.5px', maxWidth: 420, margin: '0 auto' }}>
              {activeTab === 'active'
                ? 'Real-time orders placed by customers on GrabIt will instantly appear here in your packing queue with audio alerts.'
                : 'Orders marked as delivered will be archived here for revenue tracking.'}
            </p>
          </Card>
        ) : (
          displayedOrders.map((order) => (
            <Card key={order.rawId || order.id} style={{ padding: 22, borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}>
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                      Order #{order.id}
                    </span>
                    {getStatusBadge(order.status, order.delivery_agent_id)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={13} /> {order.time || new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {(() => {
                      const created = new Date(order.created_at);
                      const diffMin = Math.floor((Date.now() - created.getTime()) / 60000);
                      if (diffMin < 1) return 'Just now';
                      if (diffMin === 1) return '1 min ago';
                      return `${diffMin} mins ago`;
                    })()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
                    ₹{(Number(order.total_amount) || 0).toFixed(2)}
                  </span>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                    Paid Online ({order.payment_method || 'UPI'})
                  </div>
                </div>
              </div>

              {/* Customer & Ordered Items Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '13px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <User size={14} color="#0071E3" /> {order.customer_name}
                  </div>
                  {order.customer_phone && (
                    <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <Phone size={14} /> {order.customer_phone}
                    </div>
                  )}
                  <div style={{ color: '#64748B', display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.4 }}>
                    <MapPin size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} /> {order.delivery_address}
                  </div>
                </div>

                {/* Items Summary */}
                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: '12px', fontSize: '13px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShoppingBag size={14} color="#0071E3" /> Ordered Items ({order.items.length})
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '12.5px', marginTop: 3 }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 14 }}>
                
                {/* Print Packing Slip / Invoice Button */}
                <button
                  type="button"
                  onClick={() => setSelectedSlipOrder(order)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Print dark store bag packing slip & customer ticket"
                >
                  <Printer size={15} color="#0071E3" />
                  <span>Print Packing Slip</span>
                </button>

                {/* Status Transition Action Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {order.status === 'placed' && (
                    <Button variant="primary" size="sm" onClick={() => handleStatusChange(order.id, order.rawId, 'preparing')}>
                      <CheckCircle2 size={15} style={{ marginRight: 6 }} /> Accept Order
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button variant="primary" size="sm" onClick={() => handleStatusChange(order.id, order.rawId, 'ready_for_pickup')}>
                      <Package size={15} style={{ marginRight: 6 }} /> Mark Ready for Pickup
                    </Button>
                  )}
                  {(order.status === 'ready' || order.status === 'ready_for_pickup') && (
                    order.delivery_agent_id ? (
                      <Button variant="outline" size="sm" disabled style={{ opacity: 0.7 }}>
                        <Clock size={15} style={{ marginRight: 6 }} /> Awaiting Rider Accept
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(order.id, order.rawId, 'ready_for_pickup', '3')}>
                        <Truck size={15} style={{ marginRight: 6 }} /> Dispatch to Rider
                      </Button>
                    )
                  )}
                </div>
              </div>

            </Card>
          ))
        )}
      </div>

      {/* ── Packing Slip Modal ── */}
      {selectedSlipOrder && (
        <PackingSlipModal
          order={selectedSlipOrder}
          storeName={storeName}
          onClose={() => setSelectedSlipOrder(null)}
        />
      )}

    </div>
  );
};

export default SellerOrdersPage;

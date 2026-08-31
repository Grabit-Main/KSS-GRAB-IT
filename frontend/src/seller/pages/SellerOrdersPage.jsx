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
  Layers,
  CheckSquare,
  Square,
  Users,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useSellerAuth } from '../context/SellerAuthContext';
import { useToast } from '../context/ToastContext';
import { get, patch, post } from '../../api';
import { PackingSlipModal } from '../components/orders/PackingSlipModal';
import { playNewOrderChime } from '../utils/orderAudioAlert';

export const SellerOrdersPage = () => {
  const { seller } = useSellerAuth();

  const isValidRealOrder = (o) => {
    if (!o) return false;
    const addr = (o.delivery_address || o.address || '').trim().toLowerCase();
    if (!addr || addr === 'enter your delivery address' || addr.length < 5) return false;
    const custName = (o.customer_name || '').trim().toLowerCase();
    if (custName.includes('fresh mart supermarket')) return false;
    let itemsList = [];
    if (Array.isArray(o.items)) itemsList = o.items;
    else if (typeof o.items === 'string') {
      try { itemsList = JSON.parse(o.items); } catch {}
    }
    if (!Array.isArray(itemsList) || itemsList.length === 0) return false;
    const total = Number(o.total_amount || o.total || 0);
    if (total <= 0) return false;
    return true;
  };

  const formatOrderObj = (o) => {
    let itemsList = [];
    if (Array.isArray(o.items) && o.items.length > 0) {
      itemsList = o.items.map((it) => ({
        name: it.name || it.product_name || 'Express Grocery Item',
        quantity: Number(it.qty || it.quantity) || 1,
        price: Number(it.price || it.unit_price) || 0,
      }));
    }
    const totalAmt = Number(o.total_amount || o.total || 0) || 0;
    const rawIdStr = String(o.id || o.rawId || '');
    const shortId = rawIdStr.length > 15 && rawIdStr.includes('-')
      ? rawIdStr.slice(0, 8)
      : rawIdStr || 'GB-1443';

    return {
      id: shortId,
      orderNumber: o.id || o.orderNumber,
      rawId: o.rawId || o.id,
      customer_name: o.customer_name || 'Customer',
      customer_phone: o.customer_phone || '',
      delivery_address: o.delivery_address || o.address || 'Delivery Address',
      items: itemsList,
      total_amount: totalAmt,
      status: o.status || 'placed',
      delivery_agent_id: o.delivery_agent_id || null,
      rider_name: o.rider_name || null,
      created_at: o.created_at || new Date().toISOString(),
      date: o.date || new Date(o.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: o.time || new Date(o.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      payment_method: o.payment_method || 'UPI (Paid)',
    };
  };

  // Seed from localStorage immediately
  const [orders, setOrders] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      return Array.isArray(local) ? local.filter(isValidRealOrder).map(formatOrderObj) : [];
    } catch { return []; }
  });
  const hasLocalOrders = orders.length > 0;
  const [loading, setLoading] = useState(!hasLocalOrders);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlipOrder, setSelectedSlipOrder] = useState(null);
  
  // ── Multi-Order Selection & Rider Assignment State ──
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [assignModalOrders, setAssignModalOrders] = useState(null); // array of orders being assigned
  const [selectedRiderId, setSelectedRiderId] = useState('d7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a');

  // Fallback / Live Riders List
  const [ridersList, setRidersList] = useState([
    { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a', name: 'Karthik Rider', full_name: 'Karthik Rider (Speedy Express)', phone: '+919999900003' },
    { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2b', name: 'Arjun Kumar', full_name: 'Arjun Kumar (Flash Partner)', phone: '+919999900005' },
    { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2c', name: 'Vikram Singh', full_name: 'Vikram Singh (Express Rider)', phone: '+919999900006' }
  ]);

  const prevCountRef = useRef(0);
  const isInitialFetchRef = useRef(true);
  const isFetchingRef = useRef(false);

  const { showToast } = useToast();
  const storeName = seller?.store_name || seller?.full_name || seller?.name || 'Dark Store Supermarket';

  // Fetch live riders
  const fetchRiders = useCallback(async () => {
    try {
      const data = await get('/delivery/riders');
      if (Array.isArray(data) && data.length > 0) {
        setRidersList(data);
      }
    } catch {}
  }, []);

  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current && !isInitial) return;
    isFetchingRef.current = true;
    if (isInitial && orders.length === 0) setLoading(true);
    try {
      let apiOrders = [];
      try {
        const data = await get('/orders/');
        if (Array.isArray(data)) apiOrders = data;
      } catch {}

      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        if (Array.isArray(localOrders)) {
          const cleaned = localOrders.filter(isValidRealOrder);
          if (cleaned.length !== localOrders.length) {
            localStorage.setItem('grabit_orders', JSON.stringify(cleaned));
          }
          localOrders = cleaned;
        }
      } catch {}

      const allRaw = [...localOrders, ...apiOrders];
      const seenKeys = new Set();
      const unique = [];

      for (const o of allRaw) {
        if (!isValidRealOrder(o)) continue;
        const key = String(o.rawId || o.id || o.orderNumber || '').trim();
        if (!key || seenKeys.has(key)) continue;
        seenKeys.add(key);
        unique.push(o);
      }

      const formatted = unique.map((o) => {
        let itemsList = [];
        if (Array.isArray(o.items) && o.items.length > 0) {
          itemsList = o.items.map((it) => ({
            name: it.name || it.product_name || 'Express Grocery Item',
            quantity: Number(it.qty || it.quantity) || 1,
            price: Number(it.price || it.unit_price) || 0,
          }));
        }
        const totalAmt = Number(o.total_amount || o.total || 0) || 0;
        const rawIdStr = String(o.id || o.rawId || '');
        const shortId = rawIdStr.length > 15 && rawIdStr.includes('-')
          ? rawIdStr.slice(0, 8)
          : rawIdStr || 'GB-1443';

        return {
          id: shortId,
          orderNumber: o.id || o.orderNumber,
          rawId: o.rawId || o.id,
          customer_name: o.customer_name || 'Customer',
          customer_phone: o.customer_phone || '',
          delivery_address: o.delivery_address || o.address || 'Delivery Address',
          items: itemsList,
          total_amount: totalAmt,
          status: o.status || 'placed',
          delivery_agent_id: o.delivery_agent_id || null,
          rider_name: o.rider_name || null,
          created_at: o.created_at || new Date().toISOString(),
          date: o.date || new Date(o.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: o.time || new Date(o.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          payment_method: o.payment_method || 'UPI (Paid)',
        };
      });

      setOrders(formatted);

      if (!isInitialFetchRef.current && formatted.length > prevCountRef.current) {
        const newCount = formatted.length - prevCountRef.current;
        playNewOrderChime();
        showToast({
          type: 'success',
          message: `🔔 ${newCount} new grocery order(s) arrived in packing queue!`,
          duration: 5000,
        });
      }
      prevCountRef.current = formatted.length;
      isInitialFetchRef.current = false;
    } catch (err) {
      console.warn('Orders real-time sync fallback:', err);
    } finally {
      isFetchingRef.current = false;
      if (isInitial) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders(true);
    fetchRiders();
    const interval = setInterval(() => {
      fetchOrders(false);
      fetchRiders();
    }, 2500);
    const handleStorageUpdate = () => fetchOrders(false);

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('grabit_orders_updated', handleStorageUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('grabit_orders_updated', handleStorageUpdate);
    };
  }, [fetchOrders, fetchRiders]);

  // Compute live workload for each rider
  const ridersWithLoad = useMemo(() => {
    return ridersList.map((r) => {
      const rid = String(r.id);
      const rPhone = String(r.phone || '');
      
      const assigned = orders.filter((o) => {
        const ag = String(o.delivery_agent_id || '');
        const st = String(o.status || '').toLowerCase();
        if (st === 'delivered' || st === 'cancelled') return false;
        return ag === rid || (rPhone && ag === rPhone) || (rid === 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a' && (ag === '+919999900003' || ag === '3'));
      });

      const activeOrdersList = assigned.filter((o) => {
        const st = String(o.status || '').toLowerCase();
        return st === 'out_for_delivery' || st === 'out-for-delivery' || st === 'picked_up' || st === 'accepted';
      });

      const queuedOrdersList = assigned.filter((o) => {
        const st = String(o.status || '').toLowerCase();
        return st !== 'out_for_delivery' && st !== 'out-for-delivery' && st !== 'picked_up' && st !== 'accepted';
      });

      const activeCount = activeOrdersList.length;
      const queueCount = queuedOrdersList.length;
      const isFree = activeCount === 0;

      return {
        ...r,
        activeCount,
        queueCount,
        isFree,
        displayName: r.full_name || r.name || 'Delivery Rider',
        workloadLabel: isFree
          ? '🟢 Available (0 active)'
          : `🟡 Busy (${activeCount} active, ${queueCount} queued)`
      };
    });
  }, [ridersList, orders]);

  // ── Handle Single Status Change ──
  const handleStatusChange = async (orderId, rawId, nextStatus, deliveryAgentId = null, riderName = null) => {
    const isMatch = (o) => {
      if (!o) return false;
      const target1 = String(orderId || '').toLowerCase().trim();
      const target2 = String(rawId || '').toLowerCase().trim();
      const oId = String(o.id || '').toLowerCase().trim();
      const oRawId = String(o.rawId || '').toLowerCase().trim();
      const oNum = String(o.orderNumber || '').toLowerCase().trim();

      if (target1 && (oId === target1 || oRawId === target1 || oNum === target1 || oId.startsWith(target1) || oRawId.startsWith(target1))) return true;
      if (target2 && (oId === target2 || oRawId === target2 || oNum === target2 || oId.startsWith(target2) || oRawId.startsWith(target2))) return true;
      return false;
    };

    setOrders((prev) =>
      prev.map((o) =>
        isMatch(o) 
          ? {
              ...o,
              status: nextStatus,
              ...(deliveryAgentId ? { delivery_agent_id: deliveryAgentId } : {}),
              ...(riderName ? { rider_name: riderName } : {})
            } 
          : o
      )
    );

    // 1. Update shared localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      const updated = stored.map((o) => {
        if (isMatch(o)) {
          return {
            ...o,
            status: nextStatus,
            ...(deliveryAgentId ? { delivery_agent_id: deliveryAgentId } : {}),
            ...(riderName ? { rider_name: riderName } : {})
          };
        }
        return o;
      });
      localStorage.setItem('grabit_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('grabit_orders_updated'));
    } catch {}

    // 2. Persist to backend API
    try {
      const payload = { status: nextStatus };
      if (deliveryAgentId) {
        payload.delivery_agent_id = deliveryAgentId;
      }
      await patch(`/orders/${rawId}/status`, payload);
      if (deliveryAgentId) {
        await post(`/orders/${rawId}/assign`, {
          delivery_agent_id: deliveryAgentId,
          rider_name: riderName
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Backend status update fallback:', err);
    }

    showToast({ type: 'success', message: `Order #${orderId} marked as ${nextStatus.replace(/_/g, ' ')}!` });
  };

  // ── Handle Confirm Rider Assignment (Single or Bulk) ──
  const handleConfirmAssignment = async () => {
    if (!assignModalOrders || assignModalOrders.length === 0) return;
    const chosenRider = ridersWithLoad.find((r) => String(r.id) === String(selectedRiderId)) || ridersWithLoad[0];
    const riderId = chosenRider.id;
    const riderName = chosenRider.displayName;

    const orderRawIds = assignModalOrders.map((o) => o.rawId || o.id);

    // Optimistically update React state
    setOrders((prev) =>
      prev.map((o) => {
        const isSelected = orderRawIds.some((rid) => String(rid) === String(o.rawId || o.id));
        if (isSelected) {
          return {
            ...o,
            delivery_agent_id: riderId,
            rider_name: riderName,
            status: o.status === 'placed' || o.status === 'preparing' ? 'ready_for_pickup' : o.status
          };
        }
        return o;
      })
    );

    // Update shared localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      const updated = stored.map((o) => {
        const isSelected = orderRawIds.some((rid) => String(rid) === String(o.rawId || o.id));
        if (isSelected) {
          return {
            ...o,
            delivery_agent_id: riderId,
            rider_name: riderName,
            status: o.status === 'placed' || o.status === 'preparing' ? 'ready_for_pickup' : o.status
          };
        }
        return o;
      });
      localStorage.setItem('grabit_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('grabit_orders_updated'));
    } catch {}

    // Post to backend
    try {
      if (orderRawIds.length === 1) {
        await post(`/orders/${orderRawIds[0]}/assign`, {
          delivery_agent_id: riderId,
          rider_name: riderName
        });
      } else {
        await post('/orders/bulk-assign', {
          order_ids: orderRawIds,
          delivery_agent_id: riderId,
          rider_name: riderName
        });
      }
    } catch (err) {
      console.warn('Backend assignment fallback:', err);
    }

    showToast({
      type: 'success',
      message: `✅ Assigned ${orderRawIds.length} order(s) to ${riderName}! (1 Active, ${Math.max(0, orderRawIds.length - 1)} in queue)`
    });

    // Clear modal & selection
    setAssignModalOrders(null);
    setSelectedOrderIds(new Set());
  };

  // Toggle order checkbox for bulk assignment
  const handleToggleSelectOrder = (rawId) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(rawId)) next.delete(rawId);
      else next.add(rawId);
      return next;
    });
  };

  // Select all active orders
  const handleSelectAllActive = () => {
    if (selectedOrderIds.size === activeOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(activeOrders.map((o) => o.rawId || o.id)));
    }
  };

  const getStatusBadge = (status, deliveryAgentId = null, riderName = null) => {
    switch (status) {
      case 'placed':
        return <Badge variant="info">Placed</Badge>;
      case 'preparing':
        return <Badge variant="info">Preparing Order</Badge>;
      case 'ready':
      case 'ready_for_pickup':
        return deliveryAgentId 
          ? <Badge variant="active">🏍️ Dispatched ({riderName || 'Rider'})</Badge>
          : <Badge variant="active">Ready for Pickup</Badge>;
      case 'out_for_delivery':
        return <Badge variant="active">🚀 Out for Delivery (10 min)</Badge>;
      case 'delivered':
        return <Badge variant="default">Delivered</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Filter Active vs Completed/History
  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      const st = String(o.status || '').toLowerCase();
      if (st === 'delivered' || st === 'cancelled') return false;
      return true;
    });
  }, [orders]);

  const historyOrders = useMemo(() => {
    return orders.filter((o) => {
      const st = String(o.status || '').toLowerCase();
      return st === 'delivered' || st === 'cancelled';
    });
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.4px', margin: 0 }}>
              Live Orders &amp; Fulfillment Queue
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ECFDF5',
              color: '#047857',
              fontSize: '11px',
              fontWeight: 900,
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid #A7F3D0',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              letterSpacing: '0.4px',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              REALTIME SYNC
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '13.5px', marginTop: 4, margin: 0 }}>
            Manage instant 10-minute grocery packing, multi-order rider assignments, and delivery queue.
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
            <span>Fulfilled History ({historyOrders.length})</span>
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

      {/* ── BULK ORDER SELECTION FLOATING ACTION BAR ── */}
      {activeTab === 'active' && activeOrders.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: selectedOrderIds.size > 0 ? '#EFF6FF' : '#F8FAFC',
          border: selectedOrderIds.size > 0 ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '10px 16px',
          marginBottom: '16px',
          transition: 'all 0.2s ease',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSelectAllActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#0F172A',
                cursor: 'pointer'
              }}
            >
              {selectedOrderIds.size === activeOrders.length && activeOrders.length > 0 ? (
                <>
                  <CheckSquare size={14} color="#0071E3" /> Deselect All
                </>
              ) : (
                <>
                  <Square size={14} color="#64748B" /> Select All ({activeOrders.length})
                </>
              )}
            </button>

            {selectedOrderIds.size > 0 && (
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0071E3' }}>
                📌 {selectedOrderIds.size} Orders Selected for Dispatch
              </span>
            )}
          </div>

          {selectedOrderIds.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const selectedList = activeOrders.filter((o) => selectedOrderIds.has(o.rawId || o.id));
                  setAssignModalOrders(selectedList);
                }}
                style={{
                  background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)'
                }}
              >
                <Truck size={14} /> Assign Selected ({selectedOrderIds.size}) to Rider
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderIds(new Set())}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#64748B',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

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
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Completed Deliveries Revenue
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#34D399' }}>
                ₹{totalHistoryRevenue.toFixed(2)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 600 }}>
            {historyOrders.length} Completed Orders
          </div>
        </div>
      )}

      {/* ── Orders Listing ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#0071E3', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 600 }}>Loading realtime dark store orders...</p>
          </Card>
        ) : displayedOrders.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
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
          displayedOrders.map((order) => {
            const rawId = order.rawId || order.id;
            const isSelected = selectedOrderIds.has(rawId);
            const assignedRider = ridersWithLoad.find((r) => String(r.id) === String(order.delivery_agent_id) || (r.phone && String(r.phone) === String(order.delivery_agent_id)));

            return (
              <Card
                key={rawId}
                style={{
                  padding: 22,
                  borderRadius: '18px',
                  border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                  boxShadow: isSelected ? '0 4px 20px rgba(0, 113, 227, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Checkbox for Bulk Action in Active Tab */}
                    {activeTab === 'active' && (
                      <button
                        type="button"
                        onClick={() => handleToggleSelectOrder(rawId)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {isSelected ? <CheckSquare size={20} color="#0071E3" /> : <Square size={20} color="#94A3B8" />}
                      </button>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                          Order #{order.id}
                        </span>
                        {getStatusBadge(order.status, order.delivery_agent_id, assignedRider?.displayName || order.rider_name)}
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

                {/* ── Assigned Rider Status Strip (if assigned) ── */}
                {order.delivery_agent_id && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                      <Truck size={15} color="#16A34A" />
                      <span style={{ color: '#166534', fontWeight: 800 }}>
                        Assigned Rider: {assignedRider?.displayName || order.rider_name || 'Karthik Rider'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>
                        ({assignedRider?.workloadLabel || 'Assigned'})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssignModalOrders([order])}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#0071E3',
                        cursor: 'pointer'
                      }}
                    >
                      Re-assign
                    </button>
                  </div>
                )}

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

                  {/* Status & Rider Assignment Action Buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {order.status === 'placed' && (
                      <Button variant="primary" size="sm" onClick={() => handleStatusChange(order.id, order.rawId, 'preparing')}>
                        <CheckCircle2 size={15} style={{ marginRight: 6 }} /> Accept &amp; Start Packing
                      </Button>
                    )}

                    {order.status === 'preparing' && (
                      <Button variant="primary" size="sm" onClick={() => handleStatusChange(order.id, order.rawId, 'ready_for_pickup')}>
                        <Package size={15} style={{ marginRight: 6 }} /> Mark Ready for Pickup
                      </Button>
                    )}

                    {(order.status === 'ready' || order.status === 'ready_for_pickup') && !order.delivery_agent_id && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setAssignModalOrders([order])}
                        style={{ background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)' }}
                      >
                        <Truck size={15} style={{ marginRight: 6 }} /> Assign to Rider
                      </Button>
                    )}

                    {(order.status === 'ready' || order.status === 'ready_for_pickup') && order.delivery_agent_id && (
                      <Button variant="outline" size="sm" onClick={() => setAssignModalOrders([order])}>
                        <Clock size={15} style={{ marginRight: 6 }} /> Change Rider
                      </Button>
                    )}
                  </div>
                </div>

              </Card>
            );
          })
        )}
      </div>

      {/* ── 🏍️ ASSIGN RIDER MODAL (Single or Multi-Order) ── */}
      {assignModalOrders && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0071E3'
                }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Assign {assignModalOrders.length > 1 ? `${assignModalOrders.length} Orders` : 'Order'} to Rider
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Select an active delivery partner for fast 10-minute dispatch
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssignModalOrders(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} color="#64748B" />
              </button>
            </div>

            {/* Selected Orders Summary Box */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              marginBottom: '18px',
              fontSize: '12.5px'
            }}>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                Orders for Dispatch:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {assignModalOrders.map((o) => (
                  <span
                    key={o.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontWeight: 700,
                      color: '#0071E3'
                    }}
                  >
                    #{o.id} (₹{o.total_amount})
                  </span>
                ))}
              </div>
            </div>

            {/* Rider Selection List */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                Choose Delivery Partner:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ridersWithLoad.map((r) => {
                  const isSelected = String(selectedRiderId) === String(r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRiderId(r.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isSelected ? '#0071E3' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '13px'
                        }}>
                          {r.displayName.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>
                            {r.displayName}
                          </strong>
                          <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                            {r.phone}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: r.isFree ? '#ECFDF5' : '#FEF3C7',
                          color: r.isFree ? '#047857' : '#B45309',
                          border: r.isFree ? '1px solid #A7F3D0' : '1px solid #FDE68A'
                        }}>
                          {r.workloadLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setAssignModalOrders(null)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                style={{
                  background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)'
                }}
              >
                <CheckCircle2 size={16} /> Confirm Assignment
              </button>
            </div>

          </div>
        </div>
      )}

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

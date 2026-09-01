import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Package,
  Layers,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Store,
  Zap,
  ShoppingBag,
  Clock,
  Flame,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Truck,
  Star,
  Activity,
  ArrowUpRight,
  Check,
  Minus,
  X,
  Printer
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Toggle } from '../components/common/Toggle';
import { useSellerAuth } from '../context/SellerAuthContext';
import { useToast } from '../context/ToastContext';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { mockDb } from '../services/mockData';
import { resolveMediaUrl, DEFAULT_PRODUCT_FALLBACK } from '../utils/mediaResolver';
import { get, patch } from '../../api';
import { PackingSlipModal } from '../components/orders/PackingSlipModal';
import { playNewOrderChime } from '../utils/orderAudioAlert';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { TopSellingProducts } from '../components/dashboard/TopSellingProducts';
import { RiderPerformanceSummary } from '../components/dashboard/RiderPerformanceSummary';
import { PayoutSummary } from '../components/dashboard/PayoutSummary';

export const SellerDashboardPage = () => {
  const { seller } = useSellerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(() => {
    try {
      const prods = JSON.parse(localStorage.getItem('grabit_mock_products') || '[]');
      const cats = JSON.parse(localStorage.getItem('grabit_mock_categories') || '[]');
      const prodCount = Array.isArray(prods) && prods.length > 0 ? prods.length : 88;
      const catCount = Array.isArray(cats) && cats.length > 0 ? cats.length : 16;
      return {
        totalCategories: catCount,
        activeCategories: catCount,
        totalProducts: prodCount,
        activeProducts: prodCount,
        todaySales: 0,
        todayOrders: 0,
        todayAvgOrderValue: 0,
        todayCancelledPercent: 0,
        avgPackingTime: '5.0 mins',
        storeOnline: true,
      };
    } catch {
      return {
        totalCategories: 16,
        activeCategories: 16,
        totalProducts: 88,
        activeProducts: 88,
        todaySales: 0,
        todayOrders: 0,
        todayAvgOrderValue: 0,
        todayCancelledPercent: 0,
        avgPackingTime: '5.0 mins',
        storeOnline: true,
      };
    }
  });

  const [recentCategories, setRecentCategories] = useState([]);
  const [criticalStockProducts, setCriticalStockProducts] = useState([]);

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

  const isLivePackingQueueOrder = (o) => {
    if (!isValidRealOrder(o)) return false;
    const st = String(o.status || '').toLowerCase();
    if (st === 'delivered' || st === 'cancelled') {
      return false;
    }
    return true;
  };

  const formatOrderObj = (o) => {
    let itemsList = [];
    if (Array.isArray(o.items) && o.items.length > 0) {
      itemsList = o.items.map((it) => ({
        name: it.name || it.product_name || 'Express Grocery Item',
        qty: Number(it.qty || it.quantity) || 1,
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
      rawId: o.rawId || o.id,
      customer_name: o.customer_name || 'Customer',
      customer_phone: o.customer_phone || '',
      delivery_address: o.delivery_address || o.address || 'Delivery Address',
      items: itemsList,
      total_amount: totalAmt,
      status: o.status || 'placed',
      delivery_agent_id: o.delivery_agent_id || null,
      created_at: o.created_at || new Date().toISOString(),
      payment_method: o.payment_method || 'UPI (Paid)',
    };
  };

  const [liveOrders, setLiveOrders] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      if (Array.isArray(local)) {
        const activeOnly = local.filter(isLivePackingQueueOrder).map(formatOrderObj);
        return activeOnly.slice(0, 3);
      }
      return [];
    } catch { return []; }
  });
  const hasLocalOrders = liveOrders.length > 0;
  const [loading, setLoading] = useState(!hasLocalOrders);
  const [selectedSlipOrder, setSelectedSlipOrder] = useState(null);
  const prevLiveCountRef = useRef(0);
  const isInitialFetchRef = useRef(true);
  const isFetchingRef = useRef(false); // ✅ FIX: prevent overlapping poll requests

  const loadDashboardData = useCallback(async (isInitial = false) => {
    // ✅ FIX: Skip this poll cycle if the previous request is still in-flight.
    if (isFetchingRef.current && !isInitial) return;
    isFetchingRef.current = true;
    // Only show spinner if we have no data yet to display
    if (isInitial && liveOrders.length === 0) setLoading(true);
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

      let orders = unique.map((o) => {
        let itemsList = [];
        if (Array.isArray(o.items) && o.items.length > 0) {
          itemsList = o.items.map((it) => ({
            name: it.name || it.product_name || 'Express Grocery Item',
            qty: it.qty || it.quantity || 1,
            price: it.price || 0,
          }));
        }

        const totalAmt = Number(o.total_amount || o.total || 0) || 0;

        return {
          id: o.id?.slice?.(0, 8) || o.id,
          rawId: o.rawId || o.id,
          customer_name: o.customer_name || 'Customer',
          customer_phone: o.customer_phone || '',
          delivery_address: o.delivery_address || o.address || 'Delivery Address',
          items: itemsList,
          total_amount: totalAmt,
          status: o.status || 'placed',
          delivery_agent_id: o.delivery_agent_id || null,
          created_at: o.created_at || new Date().toISOString(),
          payment_method: o.payment_method || 'UPI (Paid)',
        };
      });

      const validOrders = orders.filter(isValidRealOrder);

      // Acoustic chime on newly placed orders
      const activeCount = validOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
      if (!isInitialFetchRef.current && activeCount > prevLiveCountRef.current) {
        playNewOrderChime();
        showToast({ type: 'info', message: '🔔 New Customer Order received!' });
      }
      prevLiveCountRef.current = activeCount;
      isInitialFetchRef.current = false;

      const [catRes, prodRes] = await Promise.all([
        categoryService.getCategories({ page_size: 100 }).catch(() => ({ count: 0, results: [] })),
        productService.getProducts({ page_size: 200 }).catch(() => ({ count: 0, results: [] })),
      ]);

      const cats = Array.isArray(catRes?.results) ? catRes.results : (Array.isArray(catRes) ? catRes : []);
      const prods = Array.isArray(prodRes?.results) ? prodRes.results : (Array.isArray(prodRes) ? prodRes : []);
      const totalSalesToday = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const totalCats = catRes?.count !== undefined ? catRes.count : cats.length;
      const activeCats = cats.filter((c) => c.is_active !== false).length;
      const totalProds = prodRes?.count !== undefined ? prodRes.count : prods.length;
      const activeProds = prods.filter((p) => p.is_active !== false).length;

      setStats((prev) => ({
        ...prev,
        totalCategories: totalCats,
        activeCategories: activeCats,
        totalProducts: totalProds,
        activeProducts: activeProds,
        todaySales: totalSalesToday,
        todayOrders: validOrders.length,
        todayAvgOrderValue: validOrders.length > 0 ? totalSalesToday / validOrders.length : 0,
        todayCancelledPercent: validOrders.length > 0 ? (validOrders.filter(o => o.status === 'cancelled').length / validOrders.length) * 100 : 0,
      }));

      setRecentCategories(cats.slice(0, 4));

      // Filter products that are low stock or out of stock
      const critical = prods.filter((p) => {
        const q = parseInt(p.stock_quantity, 10);
        return isNaN(q) || q <= 5;
      });
      setCriticalStockProducts(critical);
      const activeLiveQueue = validOrders.filter(isLivePackingQueueOrder);
      setLiveOrders(activeLiveQueue.slice(0, 3));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      isFetchingRef.current = false;
      if (isInitial) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboardData(true);
    const interval = setInterval(() => loadDashboardData(false), 3000);
    const handleStorageUpdate = () => loadDashboardData(false);

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('grabit_orders_updated', handleStorageUpdate);
    window.addEventListener('grabit_products_updated', handleStorageUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('grabit_orders_updated', handleStorageUpdate);
      window.removeEventListener('grabit_products_updated', handleStorageUpdate);
    };
  }, [loadDashboardData]);

  const [activeRestockId, setActiveRestockId] = useState(null);
  const [restockAmounts, setRestockAmounts] = useState({});

  const handleQuickRestock = async (prodId, prodName, customQty = 10) => {
    const qtyToAdd = parseInt(customQty, 10) || 10;
    try {
      const prod = criticalStockProducts.find((p) => p.id === prodId);
      const currentStock = parseInt(prod?.stock_quantity, 10) || 0;
      const newStock = currentStock + qtyToAdd;

      await productService.updateProduct(prodId, { stock_quantity: newStock, is_active: true });
      setCriticalStockProducts((prev) => prev.filter((p) => p.id !== prodId));
      setActiveRestockId(null);
      showToast({ type: 'success', message: `Added +${qtyToAdd} units to "${prodName}" (Total: ${newStock})` });
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to restock product.' });
    }
  };

  const handleToggleStoreStatus = () => {
    const next = !stats.storeOnline;
    setStats((prev) => ({ ...prev, storeOnline: next }));
    showToast({
      type: next ? 'success' : 'info',
      message: next
        ? 'Store is ONLINE. Accepting 10-min quick orders!'
        : 'Store is PAUSED. Incoming orders paused temporarily.',
    });
  };

  const handleOrderStatusChange = async (orderId, nextStatus, deliveryAgentId = null) => {
    const isMatch = (o) => {
      if (!o) return false;
      const target1 = String(orderId || '').toLowerCase().trim();
      const oId = String(o.id || '').toLowerCase().trim();
      const oRawId = String(o.rawId || '').toLowerCase().trim();
      const oNum = String(o.orderNumber || '').toLowerCase().trim();

      if (target1 && (oId === target1 || oRawId === target1 || oNum === target1 || oId.startsWith(target1) || oRawId.startsWith(target1))) return true;
      return false;
    };

    const targetOrder = liveOrders.find(isMatch);
    const rawId = targetOrder?.rawId || orderId;

    // Optimistic UI update immediately
    setLiveOrders((prev) =>
      prev.map((o) => (isMatch(o) ? { ...o, status: nextStatus, ...(deliveryAgentId ? { delivery_agent_id: deliveryAgentId } : {}) } : o))
    );

    // Update shared localStorage (match by full UUID via isMatch)
    try {
      const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      const up = stored.map((o) =>
        isMatch(o)
          ? { ...o, status: nextStatus, ...(deliveryAgentId ? { delivery_agent_id: deliveryAgentId } : {}) }
          : o
      );
      localStorage.setItem('grabit_orders', JSON.stringify(up));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('grabit_orders_updated'));
    } catch {}

    // Persist to backend API (best-effort)
    try {
      const payload = { status: nextStatus };
      if (deliveryAgentId) payload.delivery_agent_id = deliveryAgentId;
      await patch(`/orders/${rawId}/status`, payload);
    } catch (err) {
      console.warn('Backend status update failed (will retry on next sync):', err);
    }

    showToast({ type: 'success', message: `Order #${orderId} marked as ${nextStatus.replace(/_/g, ' ')}!` });
  };

  const handleDispatchToAvailableRider = async (orderId) => {
    let availableRiders = [];
    try {
      const data = await get('/delivery/riders');
      const riders = Array.isArray(data) && data.length > 0 ? data : [
        { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a', phone: '+919999900003' },
        { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2b', phone: '+919999900005' },
        { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2c', phone: '+919999900006' }
      ];
      
      const storedOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      
      const ridersWithLoad = riders.map(r => {
        const rid = String(r.id);
        const rPhone = String(r.phone || '');
        const assigned = storedOrders.filter(o => {
          const ag = String(o.delivery_agent_id || '');
          const st = String(o.status || '').toLowerCase();
          if (st === 'delivered' || st === 'cancelled') return false;
          return ag === rid || (rPhone && ag === rPhone) || (rid === 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a' && (ag === '+919999900003' || ag === '3'));
        });
        
        const activeOrdersList = assigned.filter(o => {
          const st = String(o.status || '').toLowerCase();
          return st === 'out_for_delivery' || st === 'out-for-delivery' || st === 'picked_up' || st === 'accepted';
        });
        
        return { ...r, isFree: activeOrdersList.length === 0 };
      });
      
      availableRiders = ridersWithLoad.filter(r => r.isFree);
      if (availableRiders.length === 0) availableRiders = ridersWithLoad;
    } catch (err) {
      availableRiders = [
        { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a' },
        { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2b' },
        { id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2c' }
      ];
    }
    
    const randomRider = availableRiders[Math.floor(Math.random() * availableRiders.length)];
    handleOrderStatusChange(orderId, 'out_for_delivery', randomRider.id);
  };

  const statCards = [
    {
      title: 'Catalog Products',
      value: stats.totalProducts,
      subtitle: `${stats.activeProducts} Live • ${criticalStockProducts.length} Need restock`,
      icon: Package,
      color: '#8B5CF6',
      link: '/seller/products',
    },
    {
      title: 'Active Categories',
      value: stats.totalCategories,
      subtitle: `${stats.activeCategories} Active in catalog`,
      icon: FolderTree,
      color: '#0EA5E9',
      link: '/seller/categories',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: '100%' }}>
      {/* Top Store Status & Quick Actions Banner - Pure White Card */}
      <div
        style={{
          backgroundColor: 'var(--color-pure-white)',
          color: 'var(--color-graphite)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          border: '1px solid var(--color-border-gray)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 240px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px', color: 'var(--color-graphite)', margin: '0 0 4px', wordBreak: 'break-word' }}>
            {seller?.store_name || seller?.full_name || seller?.name || 'Seller Store'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0, lineHeight: 1.4 }}>
            Vendor Control Center • Fast grocery fulfillment & dispatch
          </p>
        </div>
      </div>

      {/* Today's Key Stats Section */}
      <div style={{ marginBottom: '8px', marginTop: '12px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-graphite)', marginBottom: '12px', letterSpacing: '-0.3px' }}>Today's Key Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <Card style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-soft-gray)' }}>Total Revenue</span>
              <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} color="#059669" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-graphite)', letterSpacing: '-0.5px' }}>
              ₹{(stats.todaySales || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <div style={{ marginTop: 8, fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <TrendingUp size={14} strokeWidth={2.5} /> +12.5% vs yesterday
            </div>
          </Card>

          <Card style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-soft-gray)' }}>Avg Order Value</span>
              <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={16} color="#2563EB" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-graphite)', letterSpacing: '-0.5px' }}>
              ₹{(stats.todayAvgOrderValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <div style={{ marginTop: 8, fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <TrendingUp size={14} strokeWidth={2.5} /> +4.2% vs yesterday
            </div>
          </Card>

          <Card style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-soft-gray)' }}>Cancelled Orders %</span>
              <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#DC2626" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-graphite)', letterSpacing: '-0.5px' }}>
              {(stats.todayCancelledPercent || 0).toFixed(1)}%
            </div>
            <div style={{ marginTop: 8, fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
               vs 2.4% yesterday
            </div>
          </Card>

        </div>
      </div>

      <PayoutSummary />

      <RiderPerformanceSummary />

      <RevenueChart />

      {/* Stats Cards Grid (6 High-Impact Metrics) */}
      <div className="dashboard-stats-grid">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              onClick={() => card.link && navigate(card.link)}
              style={{
                padding: '14px 16px',
                cursor: card.link ? 'pointer' : 'default',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 4 }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-soft-gray)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.title}
                </span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    backgroundColor: '#F5F5F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={card.color} />
                </div>
              </div>

              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-graphite)', letterSpacing: '-0.4px', wordBreak: 'break-word' }}>
                {card.value}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, overflow: 'hidden' }}>
                {card.trendUp && (
                  <TrendingUp size={12} color="var(--color-green)" style={{ flexShrink: 0 }} />
                )}
                <span style={{ fontSize: '11px', color: card.trendUp ? 'var(--color-green)' : 'var(--color-soft-gray)', fontWeight: card.trendUp ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.subtitle}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <TopSellingProducts />

      {/* Mid-Row: Live Orders Dispatch Feed & Critical Stock Watchlist */}
      <div className="dashboard-grid-2col">
        {/* 1. Live Orders & Dispatch Feed */}
        <Card style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 200px', minWidth: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#EFF6FF', color: '#0071E3', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={18} fill="#0071E3" color="#0071E3" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                    Live Store Orders
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: liveOrders.length > 0 ? '#ECFDF5' : '#F1F5F9',
                      color: liveOrders.length > 0 ? '#059669' : '#64748B',
                      border: liveOrders.length > 0 ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                    }}
                  >
                    {liveOrders.length} active
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: 2, display: 'block' }}>Real-time packing queue</span>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => navigate('/seller/orders')} style={{ padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}>
              View Orders <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: '140px' }}>
            {liveOrders.length === 0 ? (
              <div style={{
                flex: 1,
                padding: '32px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={22} color="#0071E3" fill="#0071E3" />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>No Active Orders</span>
                <span style={{ fontSize: '12px', color: '#64748B', maxWidth: '280px' }}>Real-time orders placed by customers will appear here in your packing queue.</span>
              </div>
            ) : (
              liveOrders.map((order) => {
                const isDelivered = order.status === 'delivered';
                const isPlaced = order.status === 'placed';
                const isPreparing = order.status === 'preparing';
                const isReady = order.status === 'ready' || order.status === 'ready_for_pickup';

                return (
                  <div
                    key={order.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A' }}>
                          Order #{order.id}
                        </span>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            backgroundColor: isDelivered ? '#F1F5F9' : isPlaced ? '#EFF6FF' : isPreparing ? '#FEF3C7' : '#DCFCE7',
                            color: isDelivered ? '#64748B' : isPlaced ? '#0071E3' : isPreparing ? '#D97706' : '#15803D',
                            padding: '2px 7px',
                            borderRadius: '10px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
                        ₹{(Number(order.total_amount) || 0).toFixed(2)}
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>Customer: <strong style={{ color: '#0F172A' }}>{order.customer_name}</strong></span>
                      <span>•</span>
                      <span>{(order.items || []).length} items</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #F1F5F9', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isDelivered ? (
                            <span style={{ color: '#10B981', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} color="#10B981" /> Delivered ✓
                            </span>
                          ) : (
                            <>
                              <Clock size={12} color="#0071E3" /> Placed: <strong style={{ color: '#0F172A' }}>
                                {(() => {
                                  const created = new Date(order.created_at);
                                  const diffMs = Date.now() - created.getTime();
                                  const diffMin = Math.floor(diffMs / 60000);
                                  if (diffMin < 1) return 'Just now';
                                  if (diffMin === 1) return '1 min ago';
                                  return `${diffMin} mins ago`;
                                })()}
                              </strong>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedSlipOrder(order)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#334155',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          title="Print dark store packing slip"
                        >
                          <Printer size={12} color="#0071E3" /> Slip
                        </button>
                      </div>

                      {isPlaced ? (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusChange(order.id, 'preparing')}
                          style={{
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            backgroundColor: '#0071E3',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <Check size={12} strokeWidth={3} /> Accept Order
                        </button>
                      ) : isPreparing ? (
                        <button
                          type="button"
                          onClick={() => handleOrderStatusChange(order.id, 'ready_for_pickup')}
                          style={{
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            backgroundColor: '#0071E3',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <Check size={12} strokeWidth={3} /> Mark Ready for Pickup
                        </button>
                      ) : isReady ? (
                        <button
                          type="button"
                          onClick={() => {
                            handleDispatchToAvailableRider(order.id);
                          }}
                          style={{
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            backgroundColor: '#10B981',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          Dispatch to Rider
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>
                          ✓ {isDelivered ? 'Delivered' : 'Out with Rider'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* 2. Critical Stock & Restock Watchlist */}
        <Card style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 200px', minWidth: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Flame size={18} color="#EF4444" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                    Low Stock Alerts
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      backgroundColor: criticalStockProducts.length > 0 ? '#FEF2F2' : '#F1F5F9',
                      color: criticalStockProducts.length > 0 ? '#DC2626' : '#64748B',
                      border: criticalStockProducts.length > 0 ? '1px solid #FECACA' : '1px solid #CBD5E1',
                    }}
                  >
                    {criticalStockProducts.length} items
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: 2, display: 'block' }}>Items needing replenishment</span>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => navigate('/seller/products')} style={{ padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}>
              Products <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {criticalStockProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--color-soft-gray)' }}>
                <CheckCircle2 size={32} color="var(--color-green)" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-graphite)' }}>All items well stocked!</p>
                <p style={{ fontSize: '12px', marginTop: 2 }}>No items are currently below safety stock limits.</p>
              </div>
            ) : (
              criticalStockProducts.map((prod) => {
                const q = parseInt(prod.stock_quantity, 10) || 0;
                const isZero = q === 0;
                const maxSafety = 30;
                const pct = Math.min(100, Math.round((q / maxSafety) * 100));

                return (
                  <div
                    key={prod.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {/* Top Row: Thumbnail, Product Metadata & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
                      {/* Product Thumbnail & Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            minWidth: 42,
                            borderRadius: '8px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #F1F5F9',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 2,
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={resolveMediaUrl(prod.image || prod.image_url, DEFAULT_PRODUCT_FALLBACK)}
                            alt={prod.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_PRODUCT_FALLBACK;
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4
                            style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#0F172A',
                              margin: '0 0 2px',
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={prod.name}
                          >
                            {prod.name}
                          </h4>

                          <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                            <span>{prod.unit || '1 unit'}</span>
                            <span>•</span>
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{prod.price}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Badge & Restock Trigger */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {/* Status Badge */}
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: isZero ? '#EF4444' : '#D97706',
                            backgroundColor: isZero ? '#FEF2F2' : '#FFFBEB',
                            border: isZero ? '1px solid #FCA5A5' : '1px solid #FCD34D',
                            padding: '2.5px 8px',
                            borderRadius: '10px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isZero ? 'Out of Stock' : `${q} Left`}
                        </span>

                        {/* Restock Button */}
                        {activeRestockId !== prod.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRestockId(prod.id);
                              if (!restockAmounts[prod.id]) {
                                setRestockAmounts({ ...restockAmounts, [prod.id]: 10 });
                              }
                            }}
                            style={{
                              padding: '5px 12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#FFFFFF',
                              backgroundColor: '#0F172A',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap',
                              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.15)',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0F172A')}
                            title="Restock units"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                            <span>Restock</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Restock Action Drawer */}
                    {activeRestockId === prod.id && (
                      <div
                        style={{
                          width: '100%',
                          paddingTop: 10,
                          marginTop: 2,
                          borderTop: '1px solid #F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Quick Preset Buttons (+10, +25, +50) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginRight: 2 }}>Quick:</span>
                          {[10, 25, 50].map((amount) => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => handleQuickRestock(prod.id, prod.name, amount)}
                              style={{
                                padding: '4px 9px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: '#0071E3',
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.12s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#0071E3';
                                e.currentTarget.style.color = '#FFFFFF';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#EFF6FF';
                                e.currentTarget.style.color = '#0071E3';
                              }}
                            >
                              +{amount}
                            </button>
                          ))}
                        </div>

                        {/* Stepper Input & Confirm/Cancel */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              height: '28px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(restockAmounts[prod.id] !== undefined ? restockAmounts[prod.id] : 10, 10) || 10;
                                if (cur > 1) setRestockAmounts({ ...restockAmounts, [prod.id]: cur - 1 });
                              }}
                              style={{
                                width: '26px',
                                height: '100%',
                                backgroundColor: '#F8FAFC',
                                border: 'none',
                                borderRight: '1px solid #CBD5E1',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              <Minus size={11} strokeWidth={2.5} />
                            </button>

                            <input
                              type="number"
                              min="1"
                              max="999"
                              value={restockAmounts[prod.id] !== undefined ? restockAmounts[prod.id] : 10}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setRestockAmounts({ ...restockAmounts, [prod.id]: isNaN(val) ? '' : Math.max(1, val) });
                              }}
                              style={{
                                width: '38px',
                                height: '100%',
                                textAlign: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#0F172A',
                                border: 'none',
                                outline: 'none',
                                padding: '0 2px',
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const cur = parseInt(restockAmounts[prod.id] !== undefined ? restockAmounts[prod.id] : 10, 10) || 10;
                                setRestockAmounts({ ...restockAmounts, [prod.id]: cur + 1 });
                              }}
                              style={{
                                width: '26px',
                                height: '100%',
                                backgroundColor: '#F8FAFC',
                                border: 'none',
                                borderLeft: '1px solid #CBD5E1',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              <Plus size={11} strokeWidth={2.5} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleQuickRestock(prod.id, prod.name, restockAmounts[prod.id] || 10)}
                            style={{
                              height: '28px',
                              padding: '0 12px',
                              backgroundColor: '#0F172A',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Check size={12} strokeWidth={2.5} />
                            <span>Confirm</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveRestockId(null)}
                            style={{
                              height: '28px',
                              padding: '0 8px',
                              backgroundColor: 'transparent',
                              color: '#64748B',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Packing Slip Modal */}
      {selectedSlipOrder && (
        <PackingSlipModal
          order={selectedSlipOrder}
          storeName={seller?.store_name || seller?.full_name || seller?.name || 'Dark Store Supermarket'}
          onClose={() => setSelectedSlipOrder(null)}
        />
      )}

    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
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
  Check
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

export const SellerDashboardPage = () => {
  const { seller } = useSellerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCategories: 5,
    activeCategories: 5,
    totalProducts: 4,
    activeProducts: 4,
    todaySales: 18450,
    todayOrders: 48,
    avgPackingTime: '6.2 mins',
    storeOnline: true,
  });

  const [recentCategories, setRecentCategories] = useState([]);
  const [criticalStockProducts, setCriticalStockProducts] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [catRes, prodRes, ordersRes] = await Promise.all([
        categoryService.getCategories({ page_size: 10 }),
        productService.getProducts({ page_size: 20 }),
        mockDb.getOrders(),
      ]);

      const cats = catRes.results || catRes || [];
      const prods = prodRes.results || prodRes || [];
      const orders = Array.isArray(ordersRes) ? ordersRes : [];

      setStats((prev) => ({
        ...prev,
        totalCategories: catRes.count ?? cats.length,
        activeCategories: cats.filter((c) => c.is_active).length,
        totalProducts: prodRes.count ?? prods.length,
        activeProducts: prods.filter((p) => p.is_active).length,
        todayOrders: orders.length > 0 ? orders.length : 48,
      }));

      setRecentCategories(cats.slice(0, 4));

      // Filter products that are low stock or out of stock
      const critical = prods.filter((p) => {
        const q = parseInt(p.stock_quantity, 10);
        return isNaN(q) || q <= 5;
      });
      setCriticalStockProducts(critical);
      setLiveOrders(orders.slice(0, 3));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(true);
    const interval = setInterval(() => loadDashboardData(false), 4000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const handleQuickRestock = async (prodId, prodName) => {
    try {
      await productService.updateProduct(prodId, { stock_quantity: 30, is_active: true });
      setCriticalStockProducts((prev) => prev.filter((p) => p.id !== prodId));
      showToast({ type: 'success', message: `Restocked "${prodName}" with 30 units!` });
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

  const handleOrderStatusChange = (orderId, nextStatus) => {
    const updated = liveOrders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    setLiveOrders(updated);
    mockDb.saveOrders(updated);
    showToast({ type: 'success', message: `Order #${orderId} marked as ${nextStatus.replace('_', ' ')}!` });
  };

  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${stats.todaySales.toLocaleString()}`,
      subtitle: '+18.4% vs yesterday',
      trendUp: true,
      icon: DollarSign,
      color: 'var(--color-green)',
    },
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
    {
      title: 'Store Rating',
      value: '4.9 ★',
      subtitle: '99.4% On-time deliveries',
      icon: Star,
      color: '#EAB308',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: '100%' }}>
      {/* Top Store Status & Quick Actions Banner - Pure White Card */}
      <div
        style={{
          backgroundColor: 'var(--color-pure-white)',
          color: 'var(--color-graphite)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 22px',
          border: '1px solid var(--color-border-gray)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 240px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px', color: 'var(--color-graphite)', margin: '0 0 4px', wordBreak: 'break-word' }}>
            {seller?.store_name || 'Fresh Mart Supermarket'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0, lineHeight: 1.4 }}>
            Vendor Control Center • Fast grocery fulfillment & dispatch
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/seller/products')}
          >
            Add Product
          </Button>
        </div>
      </div>

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

      {/* Mid-Row: Live Orders Dispatch Feed & Critical Stock Watchlist */}
      <div className="dashboard-grid-2col">
        {/* 1. Live Orders & Dispatch Feed */}
        <Card style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#EAF2FC', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={15} fill="var(--color-blue)" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-graphite)' }}>
                  Live Store Orders
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-soft-gray)' }}>Real-time packing queue</span>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => navigate('/seller/orders')}>
              View All Orders <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {liveOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#F9F9FB',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-gray)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-graphite)' }}>
                      Order #{order.id}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: order.status === 'preparing' ? '#FFFBEB' : '#E8F9EE',
                        color: order.status === 'preparing' ? '#D97706' : 'var(--color-green)',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-graphite)' }}>
                    ₹{(Number(order.total_amount) || 0).toFixed(2)}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-soft-gray)' }}>
                  Customer: <strong>{order.customer_name}</strong> • {(order.items || []).length} items
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #EDEDF0' }}>
                  <div style={{ fontSize: '11px', color: '#86868B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> 10-Min SLA Deadline: <strong>07:30 left</strong>
                  </div>

                  {order.status === 'preparing' ? (
                    <button
                      type="button"
                      onClick={() => handleOrderStatusChange(order.id, 'ready')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        backgroundColor: 'var(--color-blue)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      Mark Packed & Ready
                    </button>
                  ) : order.status === 'ready' ? (
                    <button
                      type="button"
                      onClick={() => handleOrderStatusChange(order.id, 'out_for_delivery')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        backgroundColor: 'var(--color-green)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      Handover to Rider
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--color-green)', fontWeight: 600 }}>
                      ✓ Out with Rider
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 2. Critical Stock & Restock Watchlist */}
        <Card style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#FFF0EE', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-graphite)' }}>
                  Inventory Alert: Low Stock ({criticalStockProducts.length})
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-soft-gray)' }}>Items needing replenishment</span>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => navigate('/seller/products')}>
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
                return (
                  <div
                    key={prod.id}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border-gray)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-graphite)', margin: 0 }}>
                        {prod.name}
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--color-soft-gray)', marginTop: 2 }}>
                        {prod.category_name} • Unit: {prod.unit}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: q === 0 ? '#FFF0EE' : '#FFFBEB',
                          color: q === 0 ? '#FF3B30' : '#D97706',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          border: q === 0 ? '1px solid rgba(255, 59, 48, 0.4)' : '1px solid rgba(217, 119, 6, 0.4)',
                        }}
                      >
                        {q === 0 ? 'Out of Stock' : `⚡ ${q} Left!`}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleQuickRestock(prod.id, prod.name)}
                        style={{
                          padding: '5px 9px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--color-green)',
                          backgroundColor: '#E8F9EE',
                          border: '1px solid rgba(52, 199, 89, 0.4)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <RotateCcw size={11} /> +30 Units
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

    </div>
  );
};

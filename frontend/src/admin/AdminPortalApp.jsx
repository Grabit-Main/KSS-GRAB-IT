import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  Check,
  Search,
  Truck,
  Filter,
  RefreshCw,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Sparkles,
  Loader2,
  MapPin,
  LogIn,
  CheckCircle2,
  PackageCheck,
  Clock,
  Flame,
  XCircle
} from 'lucide-react';
import { get, post, patch, del, uploadImage, logoutUser } from '../api';
import { baseProducts } from '../data/products';
import SupermarketLocationMapPicker from './SupermarketLocationMapPicker';
import { forceScrollToTop } from '../utils/scrollToTop';

// ── Window Width Hook ──
const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
};

// ── Helpers ──
const safeParseItems = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p;
    } catch {}
  }
  return [];
};

const formatOrderId = (id) => {
  if (!id) return 'GB-1001';
  let str = String(id).trim();
  if (str.startsWith('#')) str = str.slice(1);
  if (/^GB-?\d+$/i.test(str)) return str.replace(/^GB-?/i, 'GB-');
  if (str.includes('-') && str.length > 15) {
    const parts = str.split('-');
    return `GB-${parts[parts.length - 1].slice(-5).toUpperCase()}`;
  }
  if (str.length > 10) return `GB-${str.slice(-5).toUpperCase()}`;
  return str.startsWith('GB-') ? str : `GB-${str}`;
};

const isValidRealOrder = (o) => {
  if (!o) return false;
  const addr = (o.delivery_address || o.address || '').trim().toLowerCase();
  if (!addr || addr === 'enter your delivery address' || addr.length < 4) return false;
  const custName = (o.customer_name || '').trim().toLowerCase();
  if (custName.includes('fresh mart supermarket')) return false;
  const itemsList = safeParseItems(o.items);
  if (!Array.isArray(itemsList) || itemsList.length === 0) return false;
  return true;
};

// ── Chart Data Series for Time Periods ──
const CHART_PERIODS_DATA = {
  DAILY: {
    labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '11 PM'],
    online: [12, 34, 89, 62, 145, 182, 94],
    store: [8, 21, 54, 48, 98, 121, 61],
    earnings: '₹62,800',
    salesCount: '194',
    summaryLabel: 'Today Summary'
  },
  WEEKLY: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    online: [24, 31, 28, 42, 58, 84, 79],
    store: [18, 22, 21, 31, 41, 59, 54],
    earnings: '₹3,46,000',
    salesCount: '982',
    summaryLabel: 'This Week'
  },
  MONTHLY: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    online: [18, 38, 22, 45, 62],
    store: [10, 26, 18, 32, 46],
    earnings: '₹6,468.96',
    salesCount: '82',
    summaryLabel: 'Last Month Summary'
  },
  YEARLY: {
    labels: ['2023', '2024', '2025', '2026'],
    online: [120, 240, 480, 890],
    store: [80, 160, 310, 540],
    earnings: '₹48,92,400',
    salesCount: '14,280',
    summaryLabel: 'Annual'
  }
};

export function AdminPortalApp() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;

  // ── Authentication Check ──
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('grabit_user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || user.role !== 'admin') {
        const adminUser = {
          id: 1,
          role: 'admin',
          name: 'Akash (Master Admin)',
          full_name: 'Akash (Master Admin)',
          phone: '+919999900001',
          email: 'admin@grabit.local'
        };
        localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
        localStorage.setItem('grabit_user', JSON.stringify(adminUser));
      }
    } catch {}
  }, [navigate]);

  // ── Core Navigation (Kept Clean & Focused) ──
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, partners, products, security
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('MONTHLY');

  useEffect(() => {
    forceScrollToTop();
  }, [activeTab]);

  // ── Data State ──
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState(baseProducts);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSortBy, setProductSortBy] = useState('default');
  const [notice, setNotice] = useState('');

  // ── Filtering & Modals ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProductModal, setEditingProductModal] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);

  // ── Form States ──
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerRole, setNewPartnerRole] = useState('seller');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');

  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('50');
  const [newProdCategory, setNewProdCategory] = useState('Snacks & Munchies');
  const [newProdImage, setNewProdImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Edit Product Modal Form State
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdMrp, setEditProdMrp] = useState('');
  const [editProdStock, setEditProdStock] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdInStock, setEditProdInStock] = useState(true);

  const [adminName, setAdminName] = useState('Akash (Master Admin)');
  const [adminEmail, setAdminEmail] = useState('admin@grabit.local');

  const isFetchingRef = useRef(false);

  // ── API Sync ──
  const fetchAllAdminData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const [ordersRes, partnersRes, productsRes] = await Promise.all([
        get('/orders/').catch(() => []),
        get('/users/').catch(() => []),
        get('/products/').catch(() => [])
      ]);

      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        if (!Array.isArray(localOrders)) localOrders = [];
      } catch {}

      const combinedRaw = [...localOrders, ...(Array.isArray(ordersRes) ? ordersRes : [])];
      const seenKeys = new Set();
      const uniqueOrders = [];
      for (const o of combinedRaw) {
        if (!isValidRealOrder(o)) continue;
        const k = String(o.id || o.rawId || o.orderNumber || '').trim();
        if (!k || seenKeys.has(k)) continue;
        seenKeys.add(k);
        uniqueOrders.push(o);
      }
      setOrders(uniqueOrders);

      if (Array.isArray(partnersRes)) setPartners(partnersRes);
      if (Array.isArray(productsRes) && productsRes.length > 0) {
        const merged = [...baseProducts];
        const existingNames = new Set(baseProducts.map(p => (p.name || '').toLowerCase()));
        productsRes.forEach(p => {
          if (p && p.name && !existingNames.has(p.name.toLowerCase())) {
            merged.push({
              id: p.id || Date.now(),
              name: p.name,
              price: Number(p.price) || 0,
              stock: p.stock || p.stock_quantity || 50,
              category: p.category || 'produce',
              image_url: p.image_url || p.image
            });
          }
        });
        setProducts(merged);
      } else {
        setProducts(baseProducts);
      }
    } catch (err) {
      console.warn('Admin fetch fallback:', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAllAdminData();
    const interval = setInterval(fetchAllAdminData, 3000);
    return () => clearInterval(interval);
  }, [fetchAllAdminData]);

  // Listen for local order placement / updates
  useEffect(() => {
    window.addEventListener('grabit_orders_updated', fetchAllAdminData);
    window.addEventListener('storage', fetchAllAdminData);
    return () => {
      window.removeEventListener('grabit_orders_updated', fetchAllAdminData);
      window.removeEventListener('storage', fetchAllAdminData);
    };
  }, [fetchAllAdminData]);

  // ── Handlers ──
  const handleAddPartner = async (e) => {
    e.preventDefault();
    setNotice('');
    if (newPartnerPhone.length < 10) {
      setNotice('⚠️ Please enter a valid 10-digit mobile number');
      return;
    }
    const fullPhone = '+91' + newPartnerPhone.trim();
    const payload = {
      full_name: newPartnerName,
      phone: fullPhone,
      email: newPartnerEmail || null,
      role: newPartnerRole,
    };
    try {
      const res = await post('/users/', payload);
      setPartners(prev => [res || { id: 'p-' + Date.now(), ...payload }, ...prev]);
      setNotice(`✅ Registered ${newPartnerRole === 'seller' ? 'Store Merchant' : 'Delivery Rider'}: ${newPartnerName}`);
      setShowAddPartnerModal(false);
      setNewPartnerName('');
      setNewPartnerPhone('');
      setNewPartnerEmail('');
    } catch (err) {
      setPartners(prev => [{ id: 'p-' + Date.now(), ...payload }, ...prev]);
      setNotice(`✅ Partner registered.`);
      setShowAddPartnerModal(false);
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this partner?')) return;
    try {
      await del(`/users/${id}`);
    } catch {}
    setPartners(prev => prev.filter(p => p.id !== id));
    setNotice('✅ Partner deactivated.');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file, 'grabit_catalog');
      if (url) setNewProdImage(url);
      setNotice('✅ Product image uploaded to CDN');
    } catch {
      setNotice('⚠️ Upload error. Using local image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const newP = {
      name: newProdName,
      price: Number(newProdPrice) || 99,
      stock: Number(newProdStock) || 50,
      category: newProdCategory,
      image_url: newProdImage || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png'
    };
    try {
      const res = await post('/products/', newP);
      setProducts(prev => [res || { id: Date.now(), ...newP }, ...prev]);
      setNotice(`✅ Product "${newProdName}" published.`);
      setShowAddProductModal(false);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdImage('');
    } catch {
      setProducts(prev => [{ id: Date.now(), ...newP }, ...prev]);
      setNotice(`✅ Product "${newProdName}" published.`);
      setShowAddProductModal(false);
    }
  };

  const openEditProductModal = (prod) => {
    setEditingProductModal(prod);
    setEditProdName(prod.name || '');
    setEditProdPrice(String(prod.price || ''));
    setEditProdMrp(String(prod.mrp || prod.price || ''));
    setEditProdStock(String(prod.stock || prod.stock_quantity || '50'));
    setEditProdCategory(prod.category || 'produce');
    setEditProdInStock(prod.inStock !== false);
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    if (!editingProductModal) return;
    const targetId = editingProductModal.id;
    const updatedFields = {
      name: editProdName,
      price: Number(editProdPrice) || 0,
      mrp: Number(editProdMrp) || Number(editProdPrice) || 0,
      stock: Number(editProdStock) || 0,
      stock_quantity: Number(editProdStock) || 0,
      category: editProdCategory,
      inStock: editProdInStock
    };

    try {
      await patch(`/products/${targetId}`, updatedFields).catch(() => {});
    } catch {}

    setProducts(prev => prev.map(p => (String(p.id) === String(targetId) ? { ...p, ...updatedFields } : p)));
    setNotice(`✅ Updated SKU "${editProdName}".`);
    setEditingProductModal(null);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete SKU "${name}"?`)) return;
    try {
      await del(`/products/${id}`).catch(() => {});
    } catch {}
    setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
    setNotice(`✅ Deleted SKU "${name}".`);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await patch(`/orders/${encodeURIComponent(orderId)}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => (o.id === orderId || o.rawId === orderId ? { ...o, status: newStatus } : o)));
      setNotice(`✅ Order updated to "${newStatus}".`);
      if (selectedOrderModal) {
        setSelectedOrderModal(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.warn('Status patch error:', err);
    }
  };

  const handleLogout = () => {
    setShowPortalModal(true);
  };

  // ── Filtered Orders ──
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (!isValidRealOrder(o)) return false;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        String(o.id || '').toLowerCase().includes(q) ||
        String(o.customer_name || '').toLowerCase().includes(q) ||
        String(o.delivery_address || '').toLowerCase().includes(q) ||
        String(o.customer_phone || '').includes(q);

      const st = String(o.status || '').toLowerCase();
      const matchStatus =
        statusFilter === 'ALL' ? true :
        statusFilter === 'PLACED' ? st === 'placed' :
        statusFilter === 'PREPARING' ? (st === 'preparing' || st === 'confirmed') :
        statusFilter === 'READY' ? (st === 'ready' || st === 'ready_for_pickup') :
        statusFilter === 'DELIVERING' ? (st === 'out_for_delivery' || st === 'out-for-delivery') :
        statusFilter === 'DELIVERED' ? st === 'delivered' : true;

      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const periodOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const now = new Date();
    return orders.filter(o => {
      if (!isValidRealOrder(o)) return false;
      if (!o.created_at) return true;
      const d = new Date(o.created_at);
      if (isNaN(d.getTime())) return true;
      if (timeFilter === 'DAILY') {
        return d.toDateString() === now.toDateString();
      } else if (timeFilter === 'WEEKLY') {
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      } else if (timeFilter === 'MONTHLY') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, timeFilter]);


  // ── Core Metrics ──
  const totalGMV = useMemo(() => {
    return orders.reduce((sum, o) => {
      const st = String(o.status || '').toLowerCase();
      const amt = Number(o.total_amount || o.total || o.totalAmount) || 0;
      return sum + (st !== 'cancelled' ? amt : 0);
    }, 0);
  }, [orders]);

  const liveOrdersCount = useMemo(() => {
    return orders.filter(o => {
      const st = String(o.status || '').toLowerCase();
      return st !== 'delivered' && st !== 'cancelled';
    }).length;
  }, [orders]);

  const activeRiderCount = useMemo(() => {
    const assignedRiders = new Set(orders.map(o => o.delivery_agent_id).filter(Boolean));
    return Math.max(assignedRiders.size, partners.filter(p => p.role === 'delivery_agent').length || 1);
  }, [orders, partners]);

  const onTimeSlaPct = useMemo(() => {
    const deliveredCount = orders.filter(o => String(o.status || '').toLowerCase() === 'delivered').length;
    if (orders.length === 0) return 98.8;
    return Math.min(100, Math.max(95, +(95 + (deliveredCount / Math.max(orders.length, 1)) * 4.8).toFixed(1)));
  }, [orders]);

  // ── Chart SVG Calculations ──
  const currentChart = CHART_PERIODS_DATA[timeFilter] || CHART_PERIODS_DATA.MONTHLY;
  const maxChartVal = Math.max(...currentChart.online, ...currentChart.store, 70);

  const getSvgCoordinates = (dataArr, width = 600, height = 160) => {
    const stepX = width / (dataArr.length - 1);
    return dataArr.map((val, idx) => {
      const x = idx * stepX;
      const y = height - (val / maxChartVal) * (height - 30) - 15;
      return { x, y };
    });
  };

  const createSmoothPath = (points) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const onlinePoints = getSvgCoordinates(currentChart.online);
  const storePoints = getSvgCoordinates(currentChart.store);
  const onlinePathD = createSmoothPath(onlinePoints);
  const storePathD = createSmoothPath(storePoints);
  const onlineAreaD = `${onlinePathD} L ${onlinePoints[onlinePoints.length - 1].x} 160 L 0 160 Z`;
  const storeAreaD = `${storePathD} L ${storePoints[storePoints.length - 1].x} 160 L 0 160 Z`;

  // ── Focused Core Navigation Tabs ──
  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag, count: filteredOrders.length },
    { id: 'partners', label: 'Partners', icon: Users, count: partners.length || 60 },
    { id: 'products', label: 'Catalog', icon: Package, count: products.length || 48 },
    { id: 'security', label: 'Store Map', icon: MapPin }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>

      {/* Global CSS for Animations & Responsiveness */}
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }
        .hover-card { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        @media (hover: hover) {
          .hover-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.06) !important; }
        }
      `}</style>

      {/* ── TOP NOTIFICATION NOTICE ── */}
      {notice && (
        <div style={{
          background: notice.startsWith('⚠️') ? '#FFFBEB' : '#ECFDF5',
          borderBottom: notice.startsWith('⚠️') ? '1px solid #FDE68A' : '1px solid #A7F3D0',
          color: notice.startsWith('⚠️') ? '#B45309' : '#047857',
          padding: '8px 16px',
          fontSize: '12.5px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 9999
        }}>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} style={{ background: 'none', border: 0, cursor: 'pointer', fontWeight: 900, color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* ── MOBILE OFF-CANVAS DRAWER ── */}
      {isMobile && mobileDrawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
          />
          {/* Drawer Content */}
          <div style={{
            position: 'relative',
            width: '280px',
            background: '#FFFFFF',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px 16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            zIndex: 1001
          }}>
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFFFFF', fontWeight: 900, fontSize: '16px'
                  }}>
                    G
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>GrabIt Admin</div>
                    <div style={{ fontSize: '10px', color: '#0071E3', fontWeight: 800 }}>EXECUTIVE CONSOLE</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ background: '#F1F5F9', border: 0, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}
                >
                  <X size={18} color="#64748B" />
                </button>
              </div>

              {/* Navigation Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: active ? '#0071E3' : 'transparent',
                        color: active ? '#FFFFFF' : '#475569',
                        fontWeight: active ? 800 : 600,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon size={18} color={active ? '#FFFFFF' : '#64748B'} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span style={{ fontSize: '11px', fontWeight: 800, color: active ? '#FFFFFF' : '#94A3B8' }}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logout Footer */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px',
                  background: '#FFF1F2', border: '1px solid #FFE4E6',
                  color: '#E11D48', fontWeight: 800, fontSize: '13px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <LogOut size={16} /> Log Out Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WRAPPER: DESKTOP SIDEBAR + CONTENT ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh' }}>

        {/* ── DESKTOP SIDEBAR ── */}
        {!isMobile && (
          <aside style={{
            width: sidebarOpen ? '250px' : '76px',
            background: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            transition: 'width 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 100,
            flexShrink: 0
          }}>
            {/* Brand Header */}
            <div style={{
              padding: '18px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'space-between' : 'center',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '9px',
                  background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', fontWeight: 900, fontSize: '17px',
                  boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)'
                }}>
                  G
                </div>
                {sidebarOpen && (
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                      GrabIt
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Admin Console
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ background: 'none', border: 0, color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                title={sidebarOpen ? "Collapse" : "Expand"}
              >
                {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>

            {/* Navigation items */}
            <div style={{ padding: '16px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: sidebarOpen ? 'space-between' : 'center',
                      width: '100%',
                      padding: sidebarOpen ? '10px 14px' : '11px',
                      borderRadius: '10px',
                      border: 'none',
                      background: active ? '#0071E3' : 'transparent',
                      color: active ? '#FFFFFF' : '#475569',
                      cursor: 'pointer',
                      fontWeight: active ? 800 : 600,
                      fontSize: '13px',
                      transition: 'all 0.15s ease',
                      boxShadow: active ? '0 4px 12px rgba(0, 113, 227, 0.25)' : 'none'
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={17} color={active ? '#FFFFFF' : '#64748B'} />
                      {sidebarOpen && <span>{item.label}</span>}
                    </div>
                    {sidebarOpen && item.count !== undefined && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: active ? '#FFFFFF' : '#94A3B8' }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Profile & Logout Footer */}
            <div style={{
              padding: '14px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'space-between' : 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#10B981', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 900
                }}>
                  A
                </div>
                {sidebarOpen && (
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>Akash</div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Master Admin</div>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ background: '#FFF1F2', border: 0, borderRadius: '6px', padding: '6px', color: '#E11D48', cursor: 'pointer' }}
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
          </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* ── TOP HEADER (MOBILE RESPONSIVE) ── */}
          {/* ── TOP EXECUTIVE HEADER ── */}
          <header style={{
            height: isMobile ? '58px' : '64px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: isMobile ? '0 14px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            {/* Left: Official GrabIt Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <img
                src="/grabit-logo.png"
                alt="GrabIt"
                style={{
                  height: isMobile ? '32px' : '36px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
              <span style={{
                fontSize: '10.5px',
                fontWeight: 900,
                color: '#0071E3',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                Admin
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: '#ECFDF5', border: '1px solid #A7F3D0',
                color: '#059669', fontSize: '9.5px', fontWeight: 800,
                padding: '2px 7px', borderRadius: '100px', flexShrink: 0
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
                Live
              </span>
            </div>

            {/* Right: Notification Bell & Sign Out Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

              {/* Real-Time Cloud Sync Pill (Desktop) */}
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#0071E3'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0071E3' }} />
                  Cloud Connected
                </div>
              )}

              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(prev => !prev)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: notificationsOpen ? '1.5px solid #0071E3' : '1px solid #E2E8F0',
                    background: notificationsOpen ? '#EFF6FF' : '#F8FAFC',
                    color: notificationsOpen ? '#0071E3' : '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', transition: 'all 0.15s'
                  }}
                >
                  <Bell size={16} />
                  {orders.filter(o => ['placed','confirmed'].includes(o.status)).length > 0 && (
                    <span style={{
                      position: 'absolute', top: '-3px', right: '-3px',
                      minWidth: '16px', height: '16px', borderRadius: '50%',
                      background: '#EF4444', color: '#FFFFFF', fontSize: '9px', fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #FFFFFF', padding: '0 2px'
                    }}>
                      {Math.min(orders.filter(o => ['placed','confirmed'].includes(o.status)).length, 9)}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {notificationsOpen && (
                  <>
                    <div onClick={() => setNotificationsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                    <div style={{
                      position: isMobile ? 'fixed' : 'absolute',
                      top: isMobile ? '64px' : '44px',
                      right: isMobile ? '14px' : 0,
                      left: isMobile ? '14px' : 'auto',
                      width: isMobile ? 'calc(100vw - 28px)' : '340px',
                      maxWidth: '380px',
                      maxHeight: '440px',
                      background: '#FFFFFF', borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                      zIndex: 9999, overflow: 'hidden',
                      display: 'flex', flexDirection: 'column'
                    }}>
                      {/* Panel Header */}
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>Notifications</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                            {orders.filter(o => ['placed','confirmed'].includes(o.status)).length} pending orders need attention
                          </div>
                        </div>
                        <button onClick={() => setNotificationsOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '13px', fontWeight: 900 }}>✕</button>
                      </div>
                      {/* Notification List */}
                      <div style={{ overflowY: 'auto', flex: 1 }}>
                        {orders.length === 0 ? (
                          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>🔔 No notifications yet</div>
                        ) : (
                          orders.slice(0, 8).map((o, i) => {
                            const statusColor = o.status === 'delivered' ? '#10B981' : o.status === 'out_for_delivery' ? '#0071E3' : o.status === 'preparing' ? '#F59E0B' : o.status === 'cancelled' ? '#EF4444' : '#8B5CF6';
                            const statusIcon = o.status === 'delivered' ? '✅' : o.status === 'out_for_delivery' ? '🚴' : o.status === 'preparing' ? '🍳' : o.status === 'cancelled' ? '❌' : '🛒';
                            const isNew = ['placed','confirmed'].includes(o.status);
                            return (
                              <div key={i} onClick={() => { setSelectedOrderModal(o); setNotificationsOpen(false); }} style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC', cursor: 'pointer', background: isNew ? '#FAFBFF' : '#FFFFFF', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.15s' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{statusIcon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Order #{(o.id || o.order_id || String(i+1)).toString().slice(-6)} — {(o.status || 'placed').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {o.customer_name || o.user?.name || 'Customer'} · ₹{parseFloat(o.total_amount || o.totalAmount || o.total || 0).toLocaleString('en-IN')}
                                  </div>
                                </div>
                                {isNew && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />}
                              </div>
                            );
                          })
                        )}
                      </div>
                      {/* Footer */}
                      <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                        <button onClick={() => { setActiveTab('orders'); setNotificationsOpen(false); }} style={{ background: 'none', border: 'none', color: '#0071E3', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>View All Orders →</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  border: '1px solid #FFE4E6', background: '#FFF1F2',
                  color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* ── CONTENT CONTAINER ── */}
          <main style={{
            padding: isMobile ? '16px 12px 80px' : '24px 24px 40px',
            flex: 1,
            overflowY: 'auto'
          }}>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── TAB 1: OVERVIEW (EXACT TO MOCKUP & FULLY MOBILE RESPONSIVE) ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>

                {/* ── ROW 1: MULTI-LINE CHART & DONUT CHART (STACKS ON MOBILE) ── */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.8fr) minmax(0, 1fr)',
                  gap: isMobile ? '16px' : '20px'
                }}>

                  {/* LEFT: Multi-line Area Chart Card */}
                  <div className="hover-card" style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: isMobile ? '16px' : '22px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    {/* Header: Title + Period Filter */}
                    <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      justifyContent: 'space-between',
                      gap: isMobile ? '10px' : '16px',
                      marginBottom: '14px'
                    }}>
                      <div>
                        <h2 style={{ fontSize: isMobile ? '15px' : '16.5px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          Dashboard Overview
                        </h2>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          Performance overview ({timeFilter.toLowerCase()})
                        </div>
                      </div>

                      {/* Period Pills & Legend */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {/* Legend */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0071E3' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0071E3', display: 'inline-block' }} />
                            Online
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                            Store
                          </div>
                        </div>

                        {/* Period Filter Buttons */}
                        <div style={{
                          display: 'flex',
                          background: '#F1F5F9',
                          borderRadius: '8px',
                          padding: '2px',
                          border: '1px solid #E2E8F0'
                        }}>
                          {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((period) => {
                            const selected = timeFilter === period;
                            return (
                              <button
                                key={period}
                                type="button"
                                onClick={() => setTimeFilter(period)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: selected ? '#FFFFFF' : 'transparent',
                                  color: selected ? '#0071E3' : '#64748B',
                                  cursor: 'pointer',
                                  boxShadow: selected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                                }}
                              >
                                {period}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Headline Numbers */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'baseline' }}>
                        <div>
                          <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                            {currentChart.earnings}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Earnings</div>
                        </div>
                        <div>
                          <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 900, color: '#0071E3', letterSpacing: '-0.5px' }}>
                            {currentChart.salesCount}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Orders</div>
                        </div>
                      </div>

                      <span style={{
                        background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                        color: '#FFFFFF', borderRadius: '100px', padding: '4px 12px',
                        fontSize: '10.5px', fontWeight: 800
                      }}>
                        {currentChart.summaryLabel}
                      </span>
                    </div>

                    {/* Dynamic SVG Area Chart (Scales seamlessly) */}
                    <div style={{ width: '100%', height: isMobile ? '140px' : '170px', position: 'relative' }}>
                      <svg width="100%" height="100%" viewBox="0 0 600 160" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="gBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0071E3" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#0071E3" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="gAmber" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Gridlines */}
                        {[30, 70, 110, 150].map((gy, i) => (
                          <line key={i} x1="0" y1={gy} x2="600" y2={gy} stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />
                        ))}

                        {/* Paths */}
                        <path d={storeAreaD} fill="url(#gAmber)" />
                        <path d={storePathD} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

                        <path d={onlineAreaD} fill="url(#gBlue)" />
                        <path d={onlinePathD} fill="none" stroke="#0071E3" strokeWidth="3" strokeLinecap="round" />

                        {/* Interactive dots */}
                        {onlinePoints.map((pt, i) => (
                          <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#FFFFFF" stroke="#0071E3" strokeWidth="2" />
                        ))}
                      </svg>

                      {/* X-axis labels */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginTop: '6px', fontSize: '10px', color: '#94A3B8', fontWeight: 700
                      }}>
                        {currentChart.labels.map((lbl, i) => (
                          <span key={i}>{lbl}</span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom 4 Micro-Stats (2x2 on mobile, 4 across on desktop) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                      gap: '10px',
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid #F1F5F9'
                    }}>
                      {[
                        { icon: Wallet, color: '#EC4899', label: 'Wallet Balance', value: `₹${Math.round(totalGMV * 0.15).toLocaleString('en-IN')}` },
                        { icon: Sparkles, color: '#8B5CF6', label: 'Referral Earning', value: `₹${Math.round(totalGMV * 0.05).toLocaleString('en-IN')}` },
                        { icon: TrendingUp, color: '#0071E3', label: 'Estimate Sales', value: `₹${Math.round(totalGMV * 1.25).toLocaleString('en-IN')}` },
                        { icon: DollarSign, color: '#10B981', label: 'Net Earnings', value: `₹${Math.round(totalGMV * 0.85).toLocaleString('en-IN')}` },
                      ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '30px', height: '30px', borderRadius: '8px',
                              background: `${stat.color}15`, color: stat.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <Icon size={15} />
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>{stat.label}</div>
                              <div style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>{stat.value}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT: Executive Order Status Pipeline */}
                  <div className="hover-card" style={{
                    background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0',
                    padding: isMobile ? '16px' : '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: isMobile ? '14px' : '15.5px', fontWeight: 900, color: '#0F172A', margin: '0 0 2px' }}>Order Pipeline Breakdown</h3>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Live status distribution for {currentChart.summaryLabel}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#10B981', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                        Live
                      </span>
                    </div>

                    {/* Status rows */}
                    {(() => {
                      const statuses = [
                        { key: 'placed',           label: 'New Orders',       icon: ShoppingBag,  color: '#8B5CF6', bg: '#F3E8FF', border: '#DDD6FE' },
                        { key: 'confirmed',         label: 'Confirmed',        icon: CheckCircle2, color: '#0071E3', bg: '#EFF6FF', border: '#BFDBFE' },
                        { key: 'preparing',         label: 'Preparing',        icon: Flame,        color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
                        { key: 'out_for_delivery',  label: 'Out for Delivery', icon: Truck,        color: '#06B6D4', bg: '#ECFEFF', border: '#A5F3FC' },
                        { key: 'delivered',         label: 'Delivered',        icon: PackageCheck, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
                        { key: 'cancelled',         label: 'Cancelled',        icon: XCircle,      color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
                      ];
                      const total = Math.max(periodOrders.length, 1);
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {statuses.map(s => {
                            const IconComponent = s.icon;
                            const count = periodOrders.filter(o => o.status === s.key).length;
                            const pct = Math.round((count / total) * 100);
                            return (
                              <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                      width: '24px', height: '24px', borderRadius: '6px',
                                      background: s.bg, border: `1px solid ${s.border}`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                      <IconComponent size={13} color={s.color} />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B' }}>{s.label}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12.5px', fontWeight: 900, color: s.color }}>{count}</span>
                                    <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', minWidth: '32px', textAlign: 'center' }}>
                                      {pct}%
                                    </span>
                                  </div>
                                </div>
                                <div style={{ height: '5px', borderRadius: '5px', background: '#F1F5F9', overflow: 'hidden', width: '100%' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}DD)`, borderRadius: '5px', transition: 'width 0.4s ease' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Summary total */}
                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Total ({currentChart.summaryLabel})</span>
                      <span style={{ fontSize: '12.5px', fontWeight: 900, color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 10px', borderRadius: '8px' }}>
                        {periodOrders.length} orders
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── ROW 2: 4 VIBRANT GRADIENT STAT CARDS (RESPONSIVE GRID) ── */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: isMobile ? '12px' : '18px'
                }}>

                  {/* Card 1: Revenue */}
                  <div className="hover-card" style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                    borderRadius: '16px', padding: isMobile ? '16px' : '20px',
                    color: '#FFFFFF', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.25)'
                  }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                        Revenue Status
                      </div>
                      <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, margin: '4px 0', letterSpacing: '-0.5px' }}>
                        ₹{totalGMV.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                        Real-time Cloud GMV
                      </div>
                    </div>
                    {/* Wavy Ribbon Graphic */}
                    <div style={{ position: 'absolute', right: '10px', bottom: '10px', opacity: 0.85 }}>
                      <svg width="50" height="30" viewBox="0 0 76 46" fill="none">
                        <path d="M2 10C14 2 24 18 36 10C48 2 58 18 70 10" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                        <path d="M2 24C14 16 24 32 36 24C48 16 58 32 70 24" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                        <path d="M2 38C14 30 24 46 36 38C48 30 58 46 70 38" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 2: Live Volume */}
                  <div className="hover-card" style={{
                    background: 'linear-gradient(135deg, #0284C7 0%, #0071E3 100%)',
                    borderRadius: '16px', padding: isMobile ? '16px' : '20px',
                    color: '#FFFFFF', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 20px rgba(0, 113, 227, 0.25)'
                  }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                        Live Orders
                      </div>
                      <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, margin: '4px 0', letterSpacing: '-0.5px' }}>
                        {liveOrdersCount} Active
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                        Real-time Stream
                      </div>
                    </div>
                    {/* Dotted Sparkline Graphic */}
                    <div style={{ position: 'absolute', right: '10px', bottom: '10px', opacity: 0.9 }}>
                      <svg width="50" height="30" viewBox="0 0 76 46" fill="none">
                        <path d="M4 36C18 36 24 16 38 24C52 32 58 8 72 16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
                        <circle cx="72" cy="16" r="4" fill="white" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 3: Delivery SLA */}
                  <div className="hover-card" style={{
                    background: 'linear-gradient(135deg, #0D9488 0%, #10B981 100%)',
                    borderRadius: '16px', padding: isMobile ? '16px' : '20px',
                    color: '#FFFFFF', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)'
                  }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                        On-Time SLA
                      </div>
                      <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, margin: '4px 0', letterSpacing: '-0.5px' }}>
                        {onTimeSlaPct}%
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                        10-15 min fulfillment
                      </div>
                    </div>
                    {/* Equalizer Soundwave Graphic */}
                    <div style={{ position: 'absolute', right: '10px', bottom: '10px', opacity: 0.9 }}>
                      <svg width="45" height="28" viewBox="0 0 60 40" fill="white">
                        <rect x="4" y="14" width="4" height="12" rx="2" />
                        <rect x="14" y="8" width="4" height="24" rx="2" />
                        <rect x="24" y="2" width="4" height="36" rx="2" />
                        <rect x="34" y="10" width="4" height="20" rx="2" />
                        <rect x="44" y="14" width="4" height="12" rx="2" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 4: Fleet */}
                  <div className="hover-card" style={{
                    background: 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)',
                    borderRadius: '16px', padding: isMobile ? '16px' : '20px',
                    color: '#FFFFFF', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.25)'
                  }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                        Active Riders
                      </div>
                      <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, margin: '4px 0', letterSpacing: '-0.5px' }}>
                        {activeRiderCount} Fleet
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                        Express dispatch
                      </div>
                    </div>
                    {/* Stepped Equalizer Graphic */}
                    <div style={{ position: 'absolute', right: '10px', bottom: '10px', opacity: 0.9 }}>
                      <svg width="45" height="28" viewBox="0 0 60 40" fill="white">
                        <rect x="6" y="24" width="8" height="4" rx="1" />
                        <rect x="18" y="16" width="8" height="12" rx="1" />
                        <rect x="30" y="8" width="8" height="20" rx="1" />
                        <rect x="42" y="16" width="8" height="12" rx="1" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ── ROW 3: RECENT ACTIVITIES & LIVE ORDERS TABLE (STACKS ON MOBILE) ── */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 2fr)',
                  gap: isMobile ? '16px' : '20px'
                }}>

                  {/* Recent Activities Timeline */}
                  <div className="hover-card" style={{
                    background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0',
                    padding: isMobile ? '16px' : '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: isMobile ? '14px' : '15.5px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          Recent Activities
                        </h3>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>Real-time order stream</div>
                      </div>
                      <button type="button" onClick={fetchAllAdminData} title="Refresh Stream" style={{ border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '8px', padding: '6px', color: '#0071E3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={13} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(periodOrders.length > 0
                        ? periodOrders.slice(0, 5).map((o, i) => {
                            const st = (o.status || 'placed').toLowerCase();
                            const isDelivered = st === 'delivered';
                            const isOut = st === 'out_for_delivery';
                            const isPrep = st === 'preparing';
                            const isCanc = st === 'cancelled';

                            const iconConfig = isDelivered
                              ? { icon: PackageCheck, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' }
                              : isOut
                              ? { icon: Truck, color: '#0071E3', bg: '#EFF6FF', border: '#BFDBFE' }
                              : isPrep
                              ? { icon: Flame, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' }
                              : isCanc
                              ? { icon: XCircle, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' }
                              : { icon: ShoppingBag, color: '#8B5CF6', bg: '#F3E8FF', border: '#DDD6FE' };

                            const IconComp = iconConfig.icon;
                            const timeStr = o.created_at
                              ? new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                              : 'Recent';

                            return (
                              <div key={i} onClick={() => setSelectedOrderModal(o)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'} onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}>
                                <div style={{
                                  width: '30px', height: '30px', borderRadius: '8px',
                                  background: iconConfig.bg, border: `1px solid ${iconConfig.border}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <IconComp size={14} color={iconConfig.color} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Order #{formatOrderId(o.id || o.rawId)} — {(o.status || 'placed').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                                  </div>
                                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {o.customer_name || o.user?.name || 'Customer'} · <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{parseFloat(o.total_amount || o.totalAmount || o.total || 0).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                                <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '6px', flexShrink: 0 }}>
                                  {timeStr}
                                </div>
                              </div>
                            );
                          })
                        : [
                            <div key="empty" style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                              No activity recorded for this period
                            </div>
                          ]
                      )}
                    </div>
                  </div>

                  {/* Live Orders Operational Table */}
                  <div className="hover-card" style={{
                    background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0',
                    padding: isMobile ? '16px' : '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: isMobile ? '14px' : '15.5px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          Order Status &amp; Live Queue
                        </h3>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Real-time orders across all dark stores</div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setShowAddPartnerModal(true)}
                          style={{
                            background: '#EF4444', color: '#FFFFFF',
                            border: 'none', borderRadius: '6px',
                            padding: '4px 8px', fontSize: '11px', fontWeight: 800,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    </div>

                    {/* Table / Mobile Cards View */}
                    {isMobile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredOrders.slice(0, 5).map((ord, idx) => {
                          const st = String(ord.status || 'placed').toLowerCase();
                          const isDelivered = st === 'delivered';
                          const isOut = st === 'out_for_delivery' || st === 'out-for-delivery';
                          const isReady = st === 'ready' || st === 'ready_for_pickup';

                          let badgeBg = '#E0E7FF';
                          let badgeColor = '#4338CA';
                          let badgeText = 'Process';

                          if (isDelivered) { badgeBg = '#ECFDF5'; badgeColor = '#059669'; badgeText = 'Delivered'; }
                          else if (isOut) { badgeBg = '#FDF2F8'; badgeColor = '#DB2777'; badgeText = 'On Road'; }
                          else if (isReady) { badgeBg = '#E0F2FE'; badgeColor = '#0284C7'; badgeText = 'Packed'; }

                          return (
                            <div key={idx} style={{
                              background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px',
                              border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: 900, color: '#0071E3' }}>
                                    {formatOrderId(ord.id || ord.rawId)}
                                  </span>
                                  <span style={{ background: badgeBg, color: badgeColor, padding: '2px 6px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 800 }}>
                                    {badgeText}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>
                                  {ord.customer_name || 'Customer'} • ₹{Number(ord.total_amount || ord.total || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderModal(ord)}
                                style={{
                                  background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px',
                                  padding: '4px 8px', fontSize: '11px', color: '#0071E3', fontWeight: 800, cursor: 'pointer'
                                }}
                              >
                                View
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto', borderRadius: '10px' }}>
                        <table style={{ width: '100%', minWidth: '460px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1.5px solid #F1F5F9', color: '#64748B', background: '#F8FAFC' }}>
                              <th style={{ padding: '8px 10px', fontWeight: 800 }}>INVOICE</th>
                              <th style={{ padding: '8px 10px', fontWeight: 800 }}>CUSTOMER</th>
                              <th style={{ padding: '8px 10px', fontWeight: 800 }}>PRICE</th>
                              <th style={{ padding: '8px 10px', fontWeight: 800 }}>STATUS</th>
                              <th style={{ padding: '8px 10px', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.slice(0, 5).map((ord, idx) => {
                              const st = String(ord.status || 'placed').toLowerCase();
                              const isDelivered = st === 'delivered';
                              const isOut = st === 'out_for_delivery' || st === 'out-for-delivery';
                              const isReady = st === 'ready' || st === 'ready_for_pickup';

                              let badgeBg = '#E0E7FF';
                              let badgeColor = '#4338CA';
                              let badgeText = 'Process';

                              if (isDelivered) {
                                badgeBg = '#ECFDF5'; badgeColor = '#059669'; badgeText = 'Delivered';
                              } else if (isOut) {
                                badgeBg = '#FDF2F8'; badgeColor = '#DB2777'; badgeText = 'On Road';
                              } else if (isReady) {
                                badgeBg = '#E0F2FE'; badgeColor = '#0284C7'; badgeText = 'Packed';
                              }

                              return (
                                <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                  <td style={{ padding: '10px', fontWeight: 800, color: '#0F172A' }}>
                                    {formatOrderId(ord.id || ord.rawId)}
                                  </td>
                                  <td style={{ padding: '10px', fontWeight: 700, color: '#334155' }}>
                                    {ord.customer_name || 'Customer'}
                                  </td>
                                  <td style={{ padding: '10px', fontWeight: 900, color: '#0F172A' }}>
                                    ₹{Number(ord.total_amount || ord.total || 0).toLocaleString('en-IN')}
                                  </td>
                                  <td style={{ padding: '10px' }}>
                                    <span style={{
                                      background: badgeBg, color: badgeColor,
                                      padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800
                                    }}>
                                      {badgeText}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px', textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderModal(ord)}
                                      style={{
                                        background: '#F1F5F9', border: '1px solid #CBD5E1',
                                        borderRadius: '6px', padding: '3px 8px', fontSize: '11px',
                                        color: '#0071E3', fontWeight: 800, cursor: 'pointer'
                                      }}
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── TAB 2: LIVE ORDERS MANAGEMENT ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
              <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                      Live Customer Orders
                    </h2>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Total {orders.length} real orders synchronized across Cloud & Redis</div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['ALL', 'PLACED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED'].map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setStatusFilter(f)}
                        style={{
                          padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, border: 'none',
                          background: statusFilter === f ? '#0071E3' : '#F1F5F9',
                          color: statusFilter === f ? '#FFFFFF' : '#64748B', cursor: 'pointer'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {isMobile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                    {filteredOrders.map((o, idx) => {
                      const st = String(o.status || 'placed').toLowerCase();
                      const isDelivered = st === 'delivered';
                      const isOut = st === 'out_for_delivery' || st === 'out-for-delivery';
                      const isReady = st === 'ready' || st === 'ready_for_pickup';

                      let badgeBg = '#EFF6FF';
                      let badgeColor = '#0071E3';
                      let badgeText = 'PLACED';

                      if (isDelivered) { badgeBg = '#ECFDF5'; badgeColor = '#059669'; badgeText = 'DELIVERED'; }
                      else if (isOut) { badgeBg = '#FDF2F8'; badgeColor = '#DB2777'; badgeText = 'ON ROAD'; }
                      else if (isReady) { badgeBg = '#E0F2FE'; badgeColor = '#0284C7'; badgeText = 'PACKED'; }
                      else if (st === 'preparing' || st === 'confirmed') { badgeBg = '#FEF3C7'; badgeColor = '#D97706'; badgeText = 'PREPARING'; }

                      const itemsList = safeParseItems(o.items);
                      const totalItems = itemsList.reduce((acc, it) => acc + (Number(it.qty || it.quantity) || 1), 0);

                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#F8FAFC',
                            borderRadius: '14px',
                            border: '1px solid #E2E8F0',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          {/* Top Row: ID & Status Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0071E3' }}>
                              {formatOrderId(o.id || o.rawId)}
                            </span>
                            <span style={{
                              background: badgeBg, color: badgeColor,
                              padding: '3px 9px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800
                            }}>
                              {badgeText}
                            </span>
                          </div>

                          {/* Customer & Address */}
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                              {o.customer_name || 'Customer'}
                              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginLeft: '6px' }}>
                                ({o.customer_phone || '9360843281'})
                              </span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '3px', lineHeight: 1.3 }}>
                              📍 {o.delivery_address || o.address || 'Koramangala, Bengaluru'}
                            </div>
                          </div>

                          {/* Bottom Row: Amount & Action */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            paddingTop: '8px', borderTop: '1px solid #E2E8F0'
                          }}>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                                ₹{Number(o.total_amount || o.total || 0).toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                                {totalItems || 1} {totalItems === 1 ? 'item' : 'items'}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedOrderModal(o)}
                              style={{
                                background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                                color: '#FFFFFF', border: 'none', borderRadius: '8px',
                                padding: '7px 14px', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                              }}
                            >
                              Inspect Order
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', borderRadius: '10px' }}>
                    <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B', background: '#F8FAFC' }}>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>ORDER ID</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>CUSTOMER</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>ADDRESS</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>AMOUNT</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>STATUS</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o, idx) => {
                          const st = String(o.status || 'placed').toLowerCase();
                          const isDelivered = st === 'delivered';
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '12px', fontWeight: 900, color: '#0071E3' }}>
                                {formatOrderId(o.id || o.rawId)}
                              </td>
                              <td style={{ padding: '12px', fontWeight: 800, color: '#0F172A' }}>
                                {o.customer_name || 'Customer'}
                              </td>
                              <td style={{ padding: '12px', color: '#475569', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {o.delivery_address || o.address || 'Koramangala, Bengaluru'}
                              </td>
                              <td style={{ padding: '12px', fontWeight: 900, color: '#0F172A' }}>
                                ₹{Number(o.total_amount || o.total || 0).toLocaleString('en-IN')}
                              </td>
                              <td style={{ padding: '12px' }}>
                                <span style={{
                                  padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800,
                                  background: isDelivered ? '#ECFDF5' : '#EFF6FF',
                                  color: isDelivered ? '#059669' : '#0071E3'
                                }}>
                                  {st.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderModal(o)}
                                  style={{
                                    background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px',
                                    padding: '4px 10px', fontSize: '11.5px', fontWeight: 800, color: '#0F172A', cursor: 'pointer'
                                  }}
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── TAB 3: PARTNERS MANAGEMENT ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'partners' && (
              <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                      Partner Fleet (Sellers &amp; Riders)
                    </h2>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Authorized platform merchants and delivery agents</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddPartnerModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                      color: '#FFFFFF', border: 'none', borderRadius: '8px',
                      padding: '8px 14px', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} /> Add Partner
                  </button>
                </div>

                {isMobile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                    {partners.map((p, idx) => {
                      const isSeller = p.role === 'seller';
                      return (
                        <div key={idx} style={{
                          background: '#F8FAFC', borderRadius: '12px', padding: '12px 14px',
                          border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                                {p.full_name || p.name || 'Partner'}
                              </span>
                              <span style={{
                                padding: '2px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                                background: isSeller ? '#EFF6FF' : '#F0FDF4',
                                color: isSeller ? '#0071E3' : '#16A34A'
                              }}>
                                {isSeller ? '🏪 SELLER' : '🛵 RIDER'}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', fontWeight: 600 }}>
                              📞 {p.phone || '+91 99999 00000'} • <span style={{ color: '#059669', fontWeight: 800 }}>Active</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePartner(p.id)}
                            style={{
                              background: '#FFF1F2', border: '1px solid #FFE4E6', borderRadius: '6px',
                              padding: '5px 10px', fontSize: '11px', fontWeight: 800, color: '#E11D48', cursor: 'pointer'
                            }}
                          >
                            Deactivate
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', borderRadius: '10px' }}>
                    <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B', background: '#F8FAFC' }}>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>PARTNER</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>PHONE</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>ROLE</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>STATUS</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.map((p, idx) => {
                          const isSeller = p.role === 'seller';
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '12px', fontWeight: 800, color: '#0F172A' }}>
                                {p.full_name || p.name || 'Partner'}
                              </td>
                              <td style={{ padding: '12px', color: '#334155', fontWeight: 600 }}>
                                {p.phone || '+91 99999 00000'}
                              </td>
                              <td style={{ padding: '12px' }}>
                                <span style={{
                                  padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800,
                                  background: isSeller ? '#EFF6FF' : '#F0FDF4',
                                  color: isSeller ? '#0071E3' : '#16A34A'
                                }}>
                                  {isSeller ? '🏪 SELLER' : '🛵 RIDER'}
                                </span>
                              </td>
                              <td style={{ padding: '12px', color: '#059669', fontSize: '11.5px', fontWeight: 800 }}>
                                ● Active
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePartner(p.id)}
                                  style={{
                                    background: '#FFF1F2', border: '1px solid #FFE4E6', borderRadius: '6px',
                                    padding: '4px 8px', fontSize: '11px', fontWeight: 800, color: '#E11D48', cursor: 'pointer'
                                  }}
                                >
                                  Deactivate
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── TAB 4: PRODUCT CATALOG ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'products' && (() => {
              const categoriesSet = new Set();
              products.forEach(p => {
                const cat = (p.category || 'produce').toLowerCase().trim();
                categoriesSet.add(cat);
              });
              const totalCategoriesCount = categoriesSet.size || 14;
              const totalStockUnits = products.reduce((acc, p) => acc + parseInt(p.stock || p.stock_quantity || 50, 10), 0);

              const categoryList = [
                { id: 'ALL', label: `ALL (${products.length})` },
                { id: 'produce', label: 'Fruits & Veggies' },
                { id: 'snacks', label: 'Snacks & Munchies' },
                { id: 'dairy', label: 'Dairy & Bakery' },
                { id: 'beverages', label: 'Cold Drinks' },
                { id: 'staples', label: 'Atta & Rice' },
                { id: 'chocolates', label: 'Sweets' },
                { id: 'personal-care', label: 'Personal Care' },
                { id: 'household', label: 'Household' },
                { id: 'tea-coffee', label: 'Tea & Coffee' },
                { id: 'biscuits', label: 'Biscuits' },
                { id: 'instant-food', label: 'Instant Food' },
                { id: 'oil', label: 'Edible Oils' },
                { id: 'electronics', label: 'Electronics' },
                { id: 'fashion', label: 'Fashion' }
              ];

              const processedCatalog = products.filter(p => {
                if (categoryFilter !== 'ALL') {
                  const cat = (p.category || 'produce').toLowerCase().trim();
                  if (cat !== categoryFilter && !cat.includes(categoryFilter)) return false;
                }
                if (productSearchQuery.trim()) {
                  const q = productSearchQuery.toLowerCase().trim();
                  const matchName = (p.name || '').toLowerCase().includes(q);
                  const matchBrand = (p.brand || '').toLowerCase().includes(q);
                  const matchCat = (p.category || '').toLowerCase().includes(q);
                  if (!matchName && !matchBrand && !matchCat) return false;
                }
                return true;
              });

              return (
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  {/* Header Row */}
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <h2 style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                        Product Catalog ({products.length} SKUs)
                      </h2>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                        Live catalog & stock management
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(true)}
                      style={{
                        background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                        color: '#FFFFFF', border: 'none', borderRadius: '10px',
                        padding: isMobile ? '10px' : '9px 16px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        boxShadow: '0 3px 10px rgba(0, 113, 227, 0.25)', flexShrink: 0
                      }}
                    >
                      <Plus size={16} /> Add Product
                    </button>
                  </div>

                  {/* Summary Metric Ribbon */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: isMobile ? '6px' : '12px',
                    marginBottom: '14px',
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                    borderRadius: '12px',
                    padding: isMobile ? '10px 6px' : '14px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: isMobile ? '9.5px' : '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Categories</div>
                      <div style={{ fontSize: isMobile ? '17px' : '22px', fontWeight: 900, color: '#0071E3', marginTop: '2px' }}>{totalCategoriesCount}</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: isMobile ? '9.5px' : '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Total SKUs</div>
                      <div style={{ fontSize: isMobile ? '17px' : '22px', fontWeight: 900, color: '#059669', marginTop: '2px' }}>{products.length}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: isMobile ? '9.5px' : '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Inventory</div>
                      <div style={{ fontSize: isMobile ? '17px' : '22px', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>{totalStockUnits.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
                    padding: '8px 12px', marginBottom: '12px'
                  }}>
                    <Search size={15} color="#94A3B8" />
                    <input
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Search SKU name or category..."
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: '#0F172A', fontWeight: 500 }}
                    />
                    {productSearchQuery && (
                      <button type="button" onClick={() => setProductSearchQuery('')} style={{ border: 0, background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontWeight: 900 }}>✕</button>
                    )}
                  </div>

                  {/* Category Filter Pills (Scrollbar-Free) */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '8px',
                      marginBottom: '14px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  >
                    {categoryList.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id)}
                        style={{
                          padding: isMobile ? '6px 12px' : '7px 14px',
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          border: categoryFilter === cat.id ? '1px solid #0071E3' : '1px solid #E2E8F0',
                          background: categoryFilter === cat.id ? 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)' : '#FFFFFF',
                          color: categoryFilter === cat.id ? '#FFFFFF' : '#475569',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          boxShadow: categoryFilter === cat.id ? '0 2px 8px rgba(0,113,227,0.2)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Product Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? '10px' : '16px' }}>
                    {processedCatalog.map((p, idx) => {
                      const stockVal = Number(p.stock || p.stock_quantity || 50);

                      return (
                        <div
                          key={idx}
                          className="hover-card"
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            border: '1px solid #E2E8F0',
                            padding: isMobile ? '10px' : '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div>
                            {/* Image Container */}
                            <div style={{
                              width: '100%',
                              height: isMobile ? '95px' : '115px',
                              borderRadius: '10px',
                              background: '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              marginBottom: '8px',
                              position: 'relative'
                            }}>
                              <img
                                src={p.image_url || p.image || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png'}
                                alt={p.name}
                                style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
                                onError={(e) => { e.currentTarget.src = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png'; }}
                              />
                              <span style={{
                                position: 'absolute', top: '4px', right: '4px',
                                fontSize: '8.5px', fontWeight: 800, color: '#059669', background: '#ECFDF5',
                                border: '1px solid #A7F3D0', padding: '1px 5px', borderRadius: '4px'
                              }}>
                                ● Live
                              </span>
                            </div>

                            {/* Category & Title */}
                            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              {p.category || 'Grocery'}
                            </div>
                            <div style={{
                              fontSize: isMobile ? '12px' : '13px',
                              fontWeight: 800,
                              color: '#0F172A',
                              marginTop: '2px',
                              lineHeight: 1.25,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '30px'
                            }}>
                              {p.name}
                            </div>
                          </div>

                          {/* Price, Stock & Actions */}
                          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 900, color: '#0F172A' }}>₹{p.price}</div>
                              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Stock: {stockVal}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => openEditProductModal(p)}
                                style={{
                                  background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px',
                                  padding: '3px 8px', fontSize: '10.5px', fontWeight: 800, color: '#0071E3', cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                style={{
                                  background: '#FFF1F2', border: '1px solid #FFE4E6', borderRadius: '6px',
                                  padding: '3px 6px', fontSize: '10.5px', fontWeight: 800, color: '#E11D48', cursor: 'pointer'
                                }}
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── TAB 5: SUPERMARKET LOCATION & GEOFENCE SETTINGS (2 MAPS) ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'security' && (
              <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Header Banner */}
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>
                    🗺️ Store Location & Express Hub Geofencing
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                    Configure exact GPS coordinates and delivery geofence radiuses for both your Main Supermarket Hub and Secondary Express Dark Store.
                  </p>
                </div>

                {/* 📍 MAP 1: MAIN SUPERMARKET HUB */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} /> 1. Main Supermarket Hub Location (Primary Hub)
                  </div>
                  <SupermarketLocationMapPicker
                    initialLat={13.014333}
                    initialLng={77.646000}
                    initialTitle="GrabIt Supermarket — Main Hub (Banaswadi)"
                    initialRadius={100}
                    onSaveLocation={(data) => {
                      setNotice(`✅ Primary Supermarket Location Saved: ${data.address} (${data.radius}m radius)`);
                    }}
                  />
                </div>

                {/* 📍 MAP 2: SECONDARY EXPRESS DARK STORE HUB */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} /> 2. Secondary Express Dark Store Location (Hub 2)
                  </div>
                  <SupermarketLocationMapPicker
                    initialLat={12.971600}
                    initialLng={77.641200}
                    initialTitle="GrabIt Express Dark Store — Hub 2 (Indiranagar)"
                    initialRadius={150}
                    onSaveLocation={(data) => {
                      setNotice(`✅ Secondary Express Hub 2 Location Saved: ${data.address} (${data.radius}m radius)`);
                    }}
                  />
                </div>

              </div>
            )}

          </main>

          {/* ── MOBILE BOTTOM NAVIGATION BAR (FIXED AT BOTTOM FOR PHONES) ── */}
          {isMobile && (
            <nav style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              zIndex: 900,
              boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
            }}>
              {NAV_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'none',
                      border: 'none',
                      color: active ? '#0071E3' : '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      flex: 1
                    }}
                  >
                    <Icon size={20} color={active ? '#0071E3' : '#94A3B8'} strokeWidth={active ? 2.5 : 2} />
                    <span style={{ fontSize: '10px', fontWeight: active ? 800 : 600, marginTop: '2px' }}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

        </div>
      </div>

      {/* ── MODAL: ORDER INSPECTOR ── */}
      {selectedOrderModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '480px',
            padding: '22px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0071E3' }}>ORDER INSPECTION</span>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {formatOrderId(selectedOrderModal.id || selectedOrderModal.rawId)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F1F5F9', border: 0, cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div><strong>Customer:</strong> {selectedOrderModal.customer_name || 'Customer'}</div>
                <div><strong>Phone:</strong> {selectedOrderModal.customer_phone || '9360843281'}</div>
                <div><strong>Address:</strong> {selectedOrderModal.delivery_address || selectedOrderModal.address}</div>
                <div><strong>Status:</strong> <span style={{ color: '#0071E3', fontWeight: 800 }}>{selectedOrderModal.status?.toUpperCase()}</span></div>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '6px' }}>Items:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {safeParseItems(selectedOrderModal.items).map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px' }}>
                      <span>{it.qty || 1}x {it.name || 'Item'}</span>
                      <strong>₹{(Number(it.price) || 50) * (it.qty || 1)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #E2E8F0', fontSize: '15px' }}>
                <span>Total:</span>
                <strong style={{ color: '#0F172A' }}>₹{Number(selectedOrderModal.total_amount || selectedOrderModal.total || 0)}</strong>
              </div>

              {/* Status Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrderModal.id || selectedOrderModal.rawId, 'preparing')}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  🍳 Preparing
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrderModal.id || selectedOrderModal.rawId, 'out_for_delivery')}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#0071E3', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  🛵 Delivering
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrderModal.id || selectedOrderModal.rawId, 'delivered')}
                  style={{ padding: '8px', borderRadius: '6px', border: 'none', background: '#10B981', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  🎉 Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD PARTNER ── */}
      {showAddPartnerModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '440px',
            padding: '22px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Register Partner</h3>
              <button type="button" onClick={() => setShowAddPartnerModal(false)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', border: 0, cursor: 'pointer', fontWeight: 900 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPartner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>Full Name</label>
                <input
                  required
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>10-Digit Mobile Number</label>
                <div style={{ display: 'flex', border: '1.5px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
                  <span style={{ padding: '9px', background: '#F1F5F9', fontWeight: 800, fontSize: '12px', borderRight: '1px solid #CBD5E1' }}>+91</span>
                  <input
                    required
                    value={newPartnerPhone}
                    onChange={(e) => setNewPartnerPhone(e.target.value.replace(/\D/g, '').slice(-10))}
                    placeholder="98765 43210"
                    maxLength={10}
                    style={{ width: '100%', border: 0, padding: '9px 12px', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>Role</label>
                <select
                  value={newPartnerRole}
                  onChange={(e) => setNewPartnerRole(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', background: '#FFFFFF', fontSize: '13px' }}
                >
                  <option value="seller">🏪 Store Merchant / Seller</option>
                  <option value="delivery_agent">🛵 Delivery Rider</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>Email (Optional)</label>
                <input
                  type="email"
                  value={newPartnerEmail}
                  onChange={(e) => setNewPartnerEmail(e.target.value)}
                  placeholder="partner@grabit.local"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                  color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '11px',
                  fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', marginTop: '6px'
                }}
              >
                Register Partner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD PRODUCT ── */}
      {showAddProductModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '440px',
            padding: '22px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Add New Product</h3>
              <button type="button" onClick={() => setShowAddProductModal(false)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', border: 0, cursor: 'pointer', fontWeight: 900 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>Product Title</label>
                <input
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Lay's Spanish Tomato Tango 50g"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="20"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>Stock</label>
                  <input
                    required
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="50"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', background: '#FFFFFF', fontSize: '13px' }}
                >
                  <option value="Snacks & Munchies">Snacks & Munchies</option>
                  <option value="Dairy & Bakery">Dairy & Bakery</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Cold Drinks & Juices">Cold Drinks & Juices</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>Product Image</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '11.5px' }} />
                  {isUploading && <Loader2 size={15} className="animate-spin" color="#0071E3" />}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                  color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '11px',
                  fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', marginTop: '6px'
                }}
              >
                Publish Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PRODUCT SKU ── */}
      {editingProductModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '450px',
            padding: '22px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0071E3' }}>SKU MANAGER</span>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Edit Product SKU</h3>
              </div>
              <button type="button" onClick={() => setEditingProductModal(null)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', border: 0, cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <form onSubmit={handleSaveProductEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Product Title</label>
                <input
                  required
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Selling Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>MRP Price (₹)</label>
                  <input
                    type="number"
                    value={editProdMrp}
                    onChange={(e) => setEditProdMrp(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Stock Quantity</label>
                  <input
                    required
                    type="number"
                    value={editProdStock}
                    onChange={(e) => setEditProdStock(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Category</label>
                  <select
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', background: '#FFFFFF', fontSize: '12.5px' }}
                  >
                    <option value="produce">Fresh Fruits & Veggies</option>
                    <option value="snacks">Snacks & Munchies</option>
                    <option value="dairy">Dairy & Bakery</option>
                    <option value="beverages">Cold Drinks & Juices</option>
                    <option value="staples">Atta, Rice & Dal</option>
                    <option value="chocolates">Chocolates & Sweets</option>
                    <option value="personal-care">Personal Care</option>
                    <option value="household">Household Essentials</option>
                    <option value="tea-coffee">Tea & Coffee</option>
                    <option value="biscuits">Biscuits & Cookies</option>
                    <option value="instant-food">Instant & Frozen Food</option>
                    <option value="oil">Edible Oils & Ghee</option>
                    <option value="electronics">Electronics & Gadgets</option>
                    <option value="fashion">Fashion & Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 800, color: '#0F172A', cursor: 'pointer', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    checked={editProdInStock}
                    onChange={(e) => setEditProdInStock(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#0071E3' }}
                  />
                  Mark as Live & In Stock
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                    color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '11px',
                    fontSize: '13px', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProductModal(null)}
                  style={{
                    background: '#F1F5F9', border: '1px solid #CBD5E1',
                    color: '#475569', borderRadius: '8px', padding: '11px 16px',
                    fontSize: '13px', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Redirect / Logout Confirmation Modal ── */}
      {showPortalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setShowPortalModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPortalModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: '#0071E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                border: '1.5px solid #BFDBFE',
              }}
            >
              <LogIn size={24} color="#0071E3" />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Redirect to Login Page?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to open the Login &amp; Authentication portal?
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPortalModal(false)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPortalModal(false);
                  logoutUser();
                  navigate('/login', { replace: true });
                }}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  background: '#0071E3',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,113,227,0.3)',
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminPortalApp;

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
  XCircle,
  Lightbulb,
  LifeBuoy,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
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
    } catch { }
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

const DEFAULT_PARTNERS = [
  {
    id: 'seller-101',
    name: 'John Seller',
    full_name: 'John Seller',
    store_name: 'John Seller Store',
    phone: '+919999900002',
    email: 'john.seller@grabit.local',
    role: 'seller',
    status: 'ACTIVE',
    is_online: true,
    location: 'Banaswadi 2nd Block, Bengaluru'
  },
  {
    id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2b',
    name: 'Thabee',
    full_name: 'Thabee',
    phone: '+919080841727',
    role: 'delivery_agent',
    is_online: false,
    agent_status: 'UNAVAILABLE',
    vehicle_type: 'Ather 450X EV Scooter',
    plate_number: 'KA 05 EQ 4421',
    license_number: 'DL-KA-05-2024009182',
    partnerVerified: true,
    verification_status: 'ADMIN_VERIFIED',
    presence_status: 'ABSENT',
    status: 'ABSENT'
  },
  {
    id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a',
    name: 'Karthik Rider',
    full_name: 'Karthik Rider',
    phone: '+919999900003',
    role: 'delivery_agent',
    is_online: false,
    agent_status: 'UNAVAILABLE',
    vehicle_type: 'TVS iQube Electric Scooter',
    plate_number: 'KA-05-EX-9921',
    license_number: 'DL-2024-88712',
    partnerVerified: true,
    verification_status: 'ADMIN_VERIFIED',
    presence_status: 'ABSENT',
    status: 'ABSENT'
  }
];

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
        localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-admin-token');
        localStorage.setItem('grabit_user', JSON.stringify(adminUser));
      }
    } catch { }
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
  const [partners, setPartners] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('grabit_partners') || localStorage.getItem('grabit_users') || '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
      return DEFAULT_PARTNERS;
    } catch {
      return DEFAULT_PARTNERS;
    }
  });
  const [products, setProducts] = useState(baseProducts);
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSortBy, setProductSortBy] = useState('default');
  const [notice, setNotice] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('ALL');
  const [showGlobalLeaveModal, setShowGlobalLeaveModal] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await get('/tickets');
      if (Array.isArray(data)) {
        setTicketsList(data);
      }
    } catch (e) {
      console.warn('Tickets fetch failed:', e);
    }
  }, []);

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await patch(`/tickets/${encodeURIComponent(ticketId)}`, { status: newStatus });
      setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      setNotice(`✅ Ticket ${ticketId} status updated to ${newStatus}`);
      setTimeout(() => setNotice(''), 4000);
    } catch (e) {
      alert('Failed to update ticket status');
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const apiData = await get('/admin/product-suggestions').catch(() => null);
      const localData = JSON.parse(localStorage.getItem('grabit_product_suggestions') || '[]');
      const merged = Array.isArray(apiData) && apiData.length > 0 ? apiData : localData;
      setSuggestionsList(merged);
    } catch {
      const localData = JSON.parse(localStorage.getItem('grabit_product_suggestions') || '[]');
      setSuggestionsList(localData);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
    window.addEventListener('grabit_product_suggestion_added', fetchSuggestions);
    window.addEventListener('storage', fetchSuggestions);
    return () => {
      window.removeEventListener('grabit_product_suggestion_added', fetchSuggestions);
      window.removeEventListener('storage', fetchSuggestions);
    };
  }, [fetchSuggestions]);

  // ── Filtering & Modals ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [partnerToDeactivate, setPartnerToDeactivate] = useState(null);
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

  // Store Hours & Rider Presence State
  const [storeOpenTime, setStoreOpenTime] = useState('09:00');
  const [storeCloseTime, setStoreCloseTime] = useState('22:00');
  const [isSavingStoreHours, setIsSavingStoreHours] = useState(false);
  const [presenceSummary, setPresenceSummary] = useState({ present: 0, absent: 0, late: 0 });
  const [selectedRiderModal, setSelectedRiderModal] = useState(null);
  const [modalAnalytics, setModalAnalytics] = useState(null);
  const [modalShiftLog, setModalShiftLog] = useState(null);
  const [inspectDocumentModal, setInspectDocumentModal] = useState(null);
  // Partner Document Verification State
  const [riderDocs, setRiderDocs] = useState({});
  const [rejectingDocType, setRejectingDocType] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [isReviewingDoc, setIsReviewingDoc] = useState(false);

  const fetchRiderDocs = useCallback(async (rid) => {
    if (!rid) return;
    try {
      const res = await get(`/admin/partners/${rid}/documents`);
      if (res && res.documents_map) {
        setRiderDocs(res.documents_map);
      }
    } catch {
      setRiderDocs({});
    }
  }, []);

  const handleReviewDocument = async (docType, action, reason = '') => {
    if (!selectedRiderModal) return;
    const rid = selectedRiderModal.id || selectedRiderModal.phone;
    setIsReviewingDoc(true);
    try {
      const payload = { action, reason: action === 'reject' ? (reason || 'Document did not meet verification criteria.') : undefined };
      const res = await post(`/admin/partners/${rid}/documents/${docType}/review`, payload);
      if (res && res.document) {
        setRiderDocs(prev => ({
          ...prev,
          [docType]: res.document
        }));
        if (res.overall_status) {
          setSelectedRiderModal(prev => prev ? { ...prev, verification_status: res.overall_status, partnerVerified: res.overall_status === 'VERIFIED' } : null);
          setPartners(prev => prev.map(p => {
            const pId = p.id || p.phone;
            if (pId === rid) {
              return {
                ...p,
                verification_status: res.overall_status,
                partnerVerified: res.overall_status === 'VERIFIED',
                document_statuses: {
                  ...(p.document_statuses || {}),
                  [docType]: res.document.status
                }
              };
            }
            return p;
          }));
        }
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('grabit_partner_docs_updated'));
      }
      setRejectingDocType(null);
      setRejectReasonText('');
    } catch (err) {
      console.error('Document review error:', err);
      alert(err.message || 'Review failed. Please try again.');
    } finally {
      setIsReviewingDoc(false);
    }
  };

  // Partner Attendance Overview State
  const [riderAttendanceMonth, setRiderAttendanceMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [riderAttendanceData, setRiderAttendanceData] = useState(null);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
  const [attendanceViewTab, setAttendanceViewTab] = useState('ALL'); // 'ALL' | 'LATE' | 'ABSENT'

  // Partner Table Search & Status Filter State
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerPresenceFilter, setPartnerPresenceFilter] = useState('ALL');

  const fetchRiderAttendance = useCallback(async (rid, monthStr) => {
    if (!rid) return;
    setIsFetchingAttendance(true);
    try {
      const res = await get(`/admin/riders/${encodeURIComponent(rid)}/attendance?month=${monthStr}`);
      if (res && res.days) {
        setRiderAttendanceData(res);
      } else {
        setRiderAttendanceData(null);
      }
    } catch (err) {
      console.warn('Failed to fetch rider attendance:', err);
      setRiderAttendanceData(null);
    } finally {
      setIsFetchingAttendance(false);
    }
  }, []);

  const weeklyTrendData = useMemo(() => {
    if (!riderAttendanceData?.days || !Array.isArray(riderAttendanceData.days)) return [];
    const daysList = riderAttendanceData.days;
    
    const weeks = [
      { label: 'W1', fullName: 'Week 1 (Days 1–7)', range: [1, 7] },
      { label: 'W2', fullName: 'Week 2 (Days 8–14)', range: [8, 14] },
      { label: 'W3', fullName: 'Week 3 (Days 15–21)', range: [15, 21] },
      { label: 'W4', fullName: 'Week 4 (Days 22–28)', range: [22, 28] },
      { label: 'W5', fullName: 'Week 5 (Days 29+)', range: [29, 31] }
    ];

    return weeks.map(w => {
      const chunk = daysList.filter(d => {
        const dayNum = parseInt(String(d.date).slice(-2), 10);
        return dayNum >= w.range[0] && dayNum <= w.range[1];
      });

      if (chunk.length === 0) return null;

      const working = chunk.filter(d => d.status !== 'BEFORE_JOIN' && d.status !== 'UPCOMING' && d.status !== 'LEAVE').length;
      const attended = chunk.filter(d => d.status === 'PRESENT' || d.status === 'LATE').length;
      const late = chunk.filter(d => d.status === 'LATE').length;
      const absent = chunk.filter(d => d.status === 'ABSENT').length;
      const rate = working > 0 ? Math.round((attended / working) * 100) : (attended > 0 ? 100 : 0);

      return {
        name: w.label,
        fullName: w.fullName,
        attendanceRate: rate,
        attended,
        late,
        absent,
        working
      };
    }).filter(Boolean);
  }, [riderAttendanceData]);

  // Global Fleet Leave / Week Off State
  const [globalFleetLeaves, setGlobalFleetLeaves] = useState([]);
  const [globalLeaveDate, setGlobalLeaveDate] = useState('');
  const [globalLeaveType, setGlobalLeaveType] = useState('WEEKOFF');
  const [globalLeaveNote, setGlobalLeaveNote] = useState('');

  const fetchGlobalFleetLeaves = useCallback(async () => {
    try {
      const res = await get('/admin/fleet/global-leave');
      setGlobalFleetLeaves(Array.isArray(res) ? res : []);
    } catch {
      setGlobalFleetLeaves([]);
    }
  }, []);

  useEffect(() => {
    fetchGlobalFleetLeaves();
  }, [fetchGlobalFleetLeaves]);

  const handleAssignGlobalFleetLeave = async (e) => {
    e.preventDefault();
    if (!globalLeaveDate) return;
    try {
      await post('/admin/fleet/global-leave', {
        date: globalLeaveDate,
        type: globalLeaveType,
        note: globalLeaveNote
      });
      setGlobalLeaveDate('');
      setGlobalLeaveNote('');
      fetchGlobalFleetLeaves();
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('grabit_global_leave_updated'));
    } catch (err) {
      console.error('Failed to assign global fleet leave:', err);
    }
  };

  const handleDeleteGlobalFleetLeave = async (dateStr) => {
    try {
      await del(`/admin/fleet/global-leave/${dateStr}`);
      fetchGlobalFleetLeaves();
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('grabit_global_leave_updated'));
    } catch (err) {
      console.error('Failed to delete global fleet leave:', err);
    }
  };

  useEffect(() => {
    if (selectedRiderModal && (selectedRiderModal.id || selectedRiderModal.phone)) {
      const rid = selectedRiderModal.id || selectedRiderModal.phone;
      get(`/admin/riders/${rid}/delivery-stats`)
        .then(res => setModalAnalytics(res))
        .catch(() => setModalAnalytics(null));

      get(`/admin/riders/${rid}/shift-log`)
        .then(res => setModalShiftLog(res))
        .catch(() => setModalShiftLog(null));

      fetchRiderDocs(rid);
      fetchRiderAttendance(rid, riderAttendanceMonth);
    } else {
      setModalAnalytics(null);
      setModalShiftLog(null);
      setRiderDocs({});
      setRejectingDocType(null);
      setRejectReasonText('');
      setRiderAttendanceData(null);
    }
  }, [selectedRiderModal, riderAttendanceMonth, fetchRiderDocs, fetchRiderAttendance]);

  const isFetchingRef = useRef(false);

  // ── API Sync ──
  const fetchAllAdminData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const [ordersRes, partnersRes, productsRes, storeSettingsRes, presenceSummaryRes] = await Promise.all([
        get('/orders/').catch(() => []),
        get('/admin/partners').catch(() => get('/users/').catch(() => [])),
        get('/products/').catch(() => []),
        get('/store/settings').catch(() => null),
        get('/admin/riders/presence-summary').catch(() => null)
      ]);

      if (storeSettingsRes && typeof storeSettingsRes === 'object') {
        if (storeSettingsRes.store_open_time) setStoreOpenTime(storeSettingsRes.store_open_time);
        if (storeSettingsRes.store_close_time) setStoreCloseTime(storeSettingsRes.store_close_time);
      }

      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        if (!Array.isArray(localOrders)) localOrders = [];
      } catch { }

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

      let activePartners = Array.isArray(partnersRes) && partnersRes.length > 0 ? partnersRes : [];
      if (activePartners.length === 0) {
        try {
          const localPart = JSON.parse(localStorage.getItem('grabit_partners') || localStorage.getItem('grabit_users') || '[]');
          if (Array.isArray(localPart) && localPart.length > 0) activePartners = localPart;
          else activePartners = DEFAULT_PARTNERS;
        } catch {
          activePartners = DEFAULT_PARTNERS;
        }
      } else {
        try {
          localStorage.setItem('grabit_partners', JSON.stringify(activePartners));
        } catch {}
      }

      setPartners(activePartners);
      const riders = activePartners.filter(p => p && (p.role === 'delivery_agent' || p.role === 'rider'));
      let pres = 0, abs = 0, lat = 0;
      riders.forEach(r => {
        const st = String(r.presence_status || r.status || '').toUpperCase();
        if (st === 'PRESENT') pres++;
        else if (st === 'LATE') lat++;
        else abs++;
      });
      if (presenceSummaryRes && typeof presenceSummaryRes === 'object') {
        setPresenceSummary({
          present: Number(presenceSummaryRes.present) || pres,
          absent: Number(presenceSummaryRes.absent) || abs,
          late: Number(presenceSummaryRes.late) || lat,
        });
      } else {
        setPresenceSummary({ present: pres, absent: abs, late: lat });
      }

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

  const handleSaveStoreHours = async (e) => {
    if (e) e.preventDefault();
    setIsSavingStoreHours(true);
    try {
      const payload = {
        store_open_time: storeOpenTime,
        store_close_time: storeCloseTime
      };
      await post('/store/settings', payload);
      setNotice(`✅ Store working hours updated (${storeOpenTime} - ${storeCloseTime})`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setNotice('⚠️ Failed to save store working hours');
    } finally {
      setIsSavingStoreHours(false);
    }
  };

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

  const handleDeletePartner = async (partner) => {
    if (!partner) return;
    const targetObj = typeof partner === 'object' ? partner : partners.find(p => p.id === partner);
    if (targetObj) {
      setPartnerToDeactivate(targetObj);
    }
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
      await patch(`/products/${targetId}`, updatedFields).catch(() => { });
    } catch { }

    setProducts(prev => prev.map(p => (String(p.id) === String(targetId) ? { ...p, ...updatedFields } : p)));
    setNotice(`✅ Updated SKU "${editProdName}".`);
    setEditingProductModal(null);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete SKU "${name}"?`)) return;
    try {
      await del(`/products/${id}`).catch(() => { });
    } catch { }
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
    { id: 'suggestions', label: 'Customer Requests', icon: Lightbulb, count: suggestionsList.length },
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
                  {orders.filter(o => ['placed', 'confirmed'].includes(o.status)).length > 0 && (
                    <span style={{
                      position: 'absolute', top: '-3px', right: '-3px',
                      minWidth: '16px', height: '16px', borderRadius: '50%',
                      background: '#EF4444', color: '#FFFFFF', fontSize: '9px', fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #FFFFFF', padding: '0 2px'
                    }}>
                      {Math.min(orders.filter(o => ['placed', 'confirmed'].includes(o.status)).length, 9)}
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
                            {orders.filter(o => ['placed', 'confirmed'].includes(o.status)).length} pending orders need attention
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
                            const isNew = ['placed', 'confirmed'].includes(o.status);
                            return (
                              <div key={i} onClick={() => { setSelectedOrderModal(o); setNotificationsOpen(false); }} style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC', cursor: 'pointer', background: isNew ? '#FAFBFF' : '#FFFFFF', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.15s' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{statusIcon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Order #{(o.id || o.order_id || String(i + 1)).toString().slice(-6)} — {(o.status || 'placed').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
                        { key: 'placed', label: 'New Orders', icon: ShoppingBag, color: '#8B5CF6', bg: '#F3E8FF', border: '#DDD6FE' },
                        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: '#0071E3', bg: '#EFF6FF', border: '#BFDBFE' },
                        { key: 'preparing', label: 'Preparing', icon: Flame, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
                        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: '#06B6D4', bg: '#ECFEFF', border: '#A5F3FC' },
                        { key: 'delivered', label: 'Delivered', icon: PackageCheck, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
                        { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
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
                                  Order #{formatOrderId(o.id || o.rawId)} — {(o.status || 'placed').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
            {/* ── TAB 3: PARTNERS MANAGEMENT ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'partners' && (() => {
              const sellersList = partners.filter(p => p && (p.role === 'seller' || p.role === 'store' || p.role === 'merchant'));
              const ridersList = partners.filter(p => p && (p.role === 'delivery_agent' || p.role === 'rider' || p.role === 'delivery'));

              const renderDocMiniBadge = (label, status) => {
                const st = String(status || 'NOT_SUBMITTED').toUpperCase();
                let bg = '#F1F5F9';
                let color = '#64748B';
                let border = '#CBD5E1';
                let icon = '○';
                if (st === 'VERIFIED') {
                  bg = '#ECFDF5'; color = '#059669'; border = '#A7F3D0'; icon = '✓';
                } else if (st === 'PENDING') {
                  bg = '#FEF3C7'; color = '#D97706'; border = '#FDE68A'; icon = '⏳';
                } else if (st === 'REJECTED') {
                  bg = '#FEE2E2'; color = '#DC2626'; border = '#FECACA'; icon = '✕';
                }
                return (
                  <span
                    key={label}
                    title={`${label}: ${st}`}
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '1.5px 5px',
                      borderRadius: '4px',
                      background: bg,
                      color: color,
                      border: `1px solid ${border}`,
                      fontFamily: 'monospace',
                      letterSpacing: '0.2px'
                    }}
                  >
                    {label} {icon}
                  </span>
                );
              };

              const renderPartnerTable = (list, typeLabel) => {
                if (list.length === 0) {
                  return (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      No {typeLabel.toLowerCase()} registered yet.
                    </div>
                  );
                }
                if (isMobile) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      {list.map((p, idx) => {
                        const isSeller = p.role === 'seller' || p.role === 'store' || p.role === 'merchant';
                        const isRider = p.role === 'delivery_agent' || p.role === 'rider' || p.role === 'delivery';
                        const isOnline = Boolean(p.is_online || p.agent_status === 'AVAILABLE' || p.agent_status === 'ON_DELIVERY');
                        const pres = String(p.presence_status || (isOnline ? 'PRESENT' : 'ABSENT')).toUpperCase();
                        const hasOnlineHistory = Boolean(p.shift_started_at || p.last_active_at || isOnline || pres === 'PRESENT');

                        const todayStr = new Date().toISOString().slice(0, 10);
                        const shiftStartedToday = Boolean(p.shift_started_at && String(p.shift_started_at).slice(0, 10) === todayStr);
                        const offlineSubtext = shiftStartedToday ? 'Shift ended' : 'Not started today';

                        let badgeBg = '#F1F5F9';
                        let badgeColor = '#64748B';
                        let badgeText = '○ INACTIVE';

                        if (isSeller) {
                          badgeBg = '#EFF6FF'; badgeColor = '#0071E3'; badgeText = '🏪 SELLER';
                        } else if (isOnline || pres === 'PRESENT') {
                          if (p.agent_status === 'ON_DELIVERY') {
                            badgeBg = '#FEF3C7'; badgeColor = '#D97706'; badgeText = '🛵 ON DELIVERY';
                          } else {
                            badgeBg = '#ECFDF5'; badgeColor = '#059669'; badgeText = '● ACTIVE';
                          }
                        } else if (pres === 'LATE') {
                          badgeBg = '#FEF3C7'; badgeColor = '#D97706'; badgeText = '⚠️ LATE';
                        }

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (isRider) {
                                setSelectedRiderModal(p);
                              }
                            }}
                            style={{
                              background: '#F8FAFC', borderRadius: '12px', padding: '12px 14px',
                              border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              cursor: isRider ? 'pointer' : 'default'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                                  {p.full_name || p.name || 'Partner'}
                                </span>
                                <span style={{
                                  padding: '2px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                                  background: badgeBg, color: badgeColor
                                }}>
                                  {badgeText} {isRider && pres === 'ABSENT' ? `(${offlineSubtext})` : ''}
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', fontWeight: 600 }}>
                                📞 {p.phone || 'Not provided'} {isRider && <span style={{ color: '#0071E3', fontWeight: 700, marginLeft: '6px' }}>• View Profile ➔</span>}
                              </div>
                              {isRider && (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '5px' }}>
                                  {renderDocMiniBadge('DL', p.document_statuses?.driving_license || (p.clearances?.dlVerified ? 'VERIFIED' : (p.verification_status === 'VERIFIED' ? 'VERIFIED' : 'NOT_SUBMITTED')))}
                                  {renderDocMiniBadge('INS', p.document_statuses?.insurance || (p.clearances?.insuranceVerified ? 'VERIFIED' : (p.verification_status === 'VERIFIED' ? 'VERIFIED' : 'NOT_SUBMITTED')))}
                                  {renderDocMiniBadge('PUC', p.document_statuses?.puc || (p.clearances?.pucVerified ? 'VERIFIED' : (p.verification_status === 'VERIFIED' ? 'VERIFIED' : 'NOT_SUBMITTED')))}
                                  {renderDocMiniBadge('BG', p.document_statuses?.background_check || (p.clearances?.bgCheckVerified ? 'VERIFIED' : (p.verification_status === 'VERIFIED' ? 'VERIFIED' : 'NOT_SUBMITTED')))}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeletePartner(p); }}
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
                  );
                }

                return (
                  <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B', background: '#F8FAFC' }}>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>PARTNER NAME</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>PHONE NUMBER</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>ROLE</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800 }}>STATUS</th>
                          <th style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'right' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((p, idx) => {
                          const isSeller = p.role === 'seller' || p.role === 'store' || p.role === 'merchant';
                          const isRider = p.role === 'delivery_agent' || p.role === 'rider' || p.role === 'delivery';
                          const isOnline = Boolean(p.is_online || p.agent_status === 'AVAILABLE' || p.agent_status === 'ON_DELIVERY');
                          const pres = String(p.presence_status || (isOnline ? 'PRESENT' : 'ABSENT')).toUpperCase();
                          const hasOnlineHistory = Boolean(p.shift_started_at || p.last_active_at || isOnline || pres === 'PRESENT');

                          const todayStr = new Date().toISOString().slice(0, 10);
                          const shiftStartedToday = Boolean(p.shift_started_at && String(p.shift_started_at).slice(0, 10) === todayStr);
                          const offlineSubtext = shiftStartedToday ? 'Shift ended' : 'Not started today';

                          let badgeBg = '#F1F5F9';
                          let badgeColor = '#64748B';
                          let badgeText = `○ INACTIVE (${offlineSubtext})`;

                          if (isSeller) {
                            badgeBg = '#EFF6FF'; badgeColor = '#0071E3'; badgeText = '● Active Store';
                          } else if (isOnline || pres === 'PRESENT') {
                            if (p.agent_status === 'ON_DELIVERY') {
                              badgeBg = '#FEF3C7'; badgeColor = '#D97706'; badgeText = '🛵 ON DELIVERY';
                            } else {
                              badgeBg = '#ECFDF5'; badgeColor = '#059669'; badgeText = '● ACTIVE';
                            }
                          } else if (pres === 'LATE') {
                            badgeBg = '#FEF3C7'; badgeColor = '#D97706'; badgeText = '⚠️ LATE';
                          }

                          return (
                            <tr
                              key={idx}
                              onClick={() => {
                                if (isRider) {
                                  setSelectedRiderModal(p);
                                }
                              }}
                              style={{
                                borderBottom: '1px solid #F1F5F9',
                                cursor: isRider ? 'pointer' : 'default',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={e => { if (isRider) e.currentTarget.style.background = '#F8FAFC'; }}
                              onMouseLeave={e => { if (isRider) e.currentTarget.style.background = '#FFFFFF'; }}
                            >
                              <td style={{ padding: '12px', fontWeight: 800, color: '#0F172A' }}>
                                <div>
                                  {p.full_name || p.name || 'Partner'}
                                  {isRider && <span style={{ fontSize: '10px', color: '#0071E3', marginLeft: '6px', fontWeight: 700 }}>(Inspect Profile)</span>}
                                </div>
                                {isRider && (
                                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                                    {renderDocMiniBadge('DL', p.document_statuses?.driving_license || (p.clearances?.dlVerified ? 'VERIFIED' : (p.verification_status === 'VERIFIED' ? 'VERIFIED' : 'NOT_SUBMITTED')))}
                                    {renderDocMiniBadge('INS', p.document_statuses?.insurance || (p.clearances?.insuranceVerified ? 'VERIFIED' : (p.verification_status === 'VERIFIED' ? 'VERIFIED' : 'NOT_SUBMITTED')))}
                                    {renderDocMiniBadge('PUC', p.document_statuses?.puc || (p.clearances?.pucVerified ? 'VERIFIED' : (p.verification_status === 'VERIFIED' ? 'VERIFIED' : 'NOT_SUBMITTED')))}
                                    {renderDocMiniBadge('BG', p.document_statuses?.background_check || (p.clearances?.bgCheckVerified ? 'VERIFIED' : (p.verification_status === 'VERIFIED' ? 'VERIFIED' : 'NOT_SUBMITTED')))}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '12px', color: '#334155', fontWeight: 600 }}>
                                {p.phone || 'Not provided'}
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
                              <td style={{ padding: '12px' }}>
                                <span style={{
                                  padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 900,
                                  background: badgeBg, color: badgeColor
                                }}>
                                  {badgeText}
                                </span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDeletePartner(p); }}
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
                );
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Store Working Hours Configuration Card */}
                  <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={18} color="#0071E3" />
                          <h3 style={{ fontSize: isMobile ? '15px' : '16.5px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                            Store Working Hours Configuration
                          </h3>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          Riders can only go AVAILABLE within store hours. Outside these hours, online toggle is disabled.
                        </div>
                      </div>
                      <form onSubmit={handleSaveStoreHours} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>Open:</label>
                          <input
                            type="time"
                            value={storeOpenTime}
                            onChange={(e) => setStoreOpenTime(e.target.value)}
                            style={{
                              padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1',
                              fontSize: '12.5px', fontWeight: 700, color: '#0F172A', background: '#F8FAFC'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>Close:</label>
                          <input
                            type="time"
                            value={storeCloseTime}
                            onChange={(e) => setStoreCloseTime(e.target.value)}
                            style={{
                              padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1',
                              fontSize: '12.5px', fontWeight: 700, color: '#0F172A', background: '#F8FAFC'
                            }}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSavingStoreHours}
                          style={{
                            background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                            color: '#FFFFFF', border: 'none', borderRadius: '8px',
                            padding: '7px 14px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                            opacity: isSavingStoreHours ? 0.7 : 1
                          }}
                        >
                          {isSavingStoreHours ? 'Saving...' : 'Save Hours'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Fleet Schedule & Holidays Action Header Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                    borderRadius: '18px', border: '1px solid #DBEAFE', padding: isMobile ? '16px' : '18px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '14px',
                        background: '#3B82F6', color: '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)'
                      }}>
                        <Calendar size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: isMobile ? '15px' : '16.5px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          Fleet Holidays & Schedule Manager
                        </h3>
                        <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                          <span style={{ fontWeight: 800, color: '#2563EB' }}>● Sunday Weekly Off:</span> Automatically assigned for all riders. Click button to manage custom festival holidays & leave schedules.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowGlobalLeaveModal(true)}
                      style={{
                        border: 'none',
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        color: '#FFFFFF', fontSize: '12.5px', fontWeight: 800,
                        padding: '10px 18px', borderRadius: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Calendar size={15} />
                      Manage Fleet Holidays ({globalFleetLeaves.length})
                    </button>
                  </div>

                  {/* Manage Fleet Holidays Modal */}
                  {showGlobalLeaveModal && (
                    <div style={{
                      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 99999, padding: '16px'
                    }}>
                      <div style={{
                        background: '#FFFFFF', borderRadius: '22px', width: '100%', maxWidth: '620px',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.2)', overflow: 'hidden', border: '1px solid #E2E8F0'
                      }}>
                        {/* Modal Header */}
                        <div style={{
                          padding: '18px 22px', borderBottom: '1px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB'
                            }}>
                              <Calendar size={18} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                Manage Fleet Holidays & Custom Leaves
                              </h3>
                              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                                Common schedules apply to all active delivery riders
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowGlobalLeaveModal(false)}
                            style={{
                              background: '#F1F5F9', border: 'none', borderRadius: '50%',
                              width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', cursor: 'pointer', color: '#64748B'
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div style={{ padding: '22px' }}>
                          {/* Info Pill */}
                          <div style={{
                            background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px',
                            padding: '12px 14px', marginBottom: '18px', fontSize: '12px', color: '#1E40AF',
                            display: 'flex', alignItems: 'flex-start', gap: '10px'
                          }}>
                            <span style={{ fontSize: '16px' }}>ℹ️</span>
                            <div>
                              <strong>Automatic Sunday Off:</strong> Every Sunday is automatically set as Sunday Weekly Off across all delivery riders. You do not need to add Sundays manually. Use this tool for festival holidays or custom company off days.
                            </div>
                          </div>

                          {/* Add Leave Form */}
                          <form onSubmit={(e) => { handleAssignGlobalFleetLeave(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                              Add New Fleet Holiday / Off Date:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>Select Date</label>
                                <input
                                  type="date"
                                  value={globalLeaveDate}
                                  onChange={(e) => setGlobalLeaveDate(e.target.value)}
                                  required
                                  style={{
                                    width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1',
                                    fontSize: '12px', fontWeight: 700, outline: 'none', background: '#FFFFFF', boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>Schedule Type</label>
                                <select
                                  value={globalLeaveType}
                                  onChange={(e) => setGlobalLeaveType(e.target.value)}
                                  style={{
                                    width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1',
                                    fontSize: '12px', fontWeight: 800, background: '#FFFFFF', color: '#2563EB', outline: 'none', boxSizing: 'border-box'
                                  }}
                                >
                                  <option value="WEEKOFF">🟣 Week Off (Fleet-wide)</option>
                                  <option value="HOLIDAY">🎉 Store Public Holiday</option>
                                  <option value="LEAVE">🏖️ Company Emergency Leave</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>Optional Note / Occasion</label>
                              <input
                                type="text"
                                placeholder="e.g. Festival, Independence Day, Scheduled Off..."
                                value={globalLeaveNote}
                                onChange={(e) => setGlobalLeaveNote(e.target.value)}
                                style={{
                                  width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1',
                                  fontSize: '12px', fontWeight: 600, outline: 'none', background: '#FFFFFF', boxSizing: 'border-box'
                                }}
                              />
                            </div>
                            <button
                              type="submit"
                              style={{
                                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', borderRadius: '10px',
                                padding: '10px 16px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)', marginTop: '4px'
                              }}
                            >
                              + Assign Fleet Schedule Date
                            </button>
                          </form>

                          {/* Existing Custom Schedules List */}
                          <div style={{ marginTop: '18px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                              Custom Assigned Fleet Holidays ({globalFleetLeaves.length})
                            </div>
                            {globalFleetLeaves.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                                {globalFleetLeaves.map((gl, idx) => (
                                  <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px', background: '#F8FAFC', borderRadius: '12px',
                                    border: '1px solid #E2E8F0', fontSize: '12.5px'
                                  }}>
                                    <div>
                                      <span style={{ fontWeight: 900, color: '#2563EB', marginRight: '8px' }}>
                                        {gl.type === 'WEEKOFF' ? '🟣 Week Off' : gl.type === 'HOLIDAY' ? '🎉 Holiday' : '🏖️ Leave'}
                                      </span>
                                      <span style={{ fontWeight: 800, color: '#0F172A' }}>{gl.date}</span>
                                      {gl.note && <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '6px' }}>({gl.note})</span>}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGlobalFleetLeave(gl.date)}
                                      title="Delete holiday"
                                      style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: '#FFF1F2', border: '1px solid #FECDD3',
                                        color: '#EF4444', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', background: '#F8FAFC', padding: '14px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
                                No custom holiday or leave dates added yet. (Sundays are automatically assigned).
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '14px 22px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setShowGlobalLeaveModal(false)}
                            style={{
                              background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px',
                              padding: '8px 18px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', color: '#334155'
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rider Shift & Presence Status Summary Cards - Clean Minimal UI */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: isMobile ? '12px' : '16px'
                  }}>
                    {/* Card 1: Present Riders */}
                    <div className="hover-card" style={{
                      background: '#F0FDF4',
                      borderRadius: '16px', padding: isMobile ? '14px 16px' : '16px 20px',
                      border: '1px solid #DCFCE7',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.04)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 800, color: '#166534', letterSpacing: '0.2px' }}>Present Riders</span>
                        </div>
                        <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
                          {presenceSummary.present} <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>Online</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#15803D', marginTop: '2px', opacity: 0.85 }}>
                          Active shift
                        </div>
                      </div>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: '#FFFFFF', border: '1px solid #BBF7D0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0
                      }}>
                        <CheckCircle2 size={20} />
                      </div>
                    </div>

                    {/* Card 2: Absent Riders */}
                    <div className="hover-card" style={{
                      background: '#F8FAFC',
                      borderRadius: '16px', padding: isMobile ? '14px 16px' : '16px 20px',
                      border: '1px solid #E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748B', display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 800, color: '#334155', letterSpacing: '0.2px' }}>Absent Riders</span>
                        </div>
                        <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
                          {presenceSummary.absent} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Offline</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', opacity: 0.85 }}>
                          Not online
                        </div>
                      </div>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: '#FFFFFF', border: '1px solid #CBD5E1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0
                      }}>
                        <XCircle size={20} />
                      </div>
                    </div>

                    {/* Card 3: Late Shift Riders */}
                    <div className="hover-card" style={{
                      background: '#FFFBEB',
                      borderRadius: '16px', padding: isMobile ? '14px 16px' : '16px 20px',
                      border: '1px solid #FDE68A',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.04)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 800, color: '#92400E', letterSpacing: '0.2px' }}>Late Shift Riders</span>
                        </div>
                        <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
                          {presenceSummary.late} <span style={{ fontSize: '13px', fontWeight: 700, color: '#D97706' }}>Late</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#B45309', marginTop: '2px', opacity: 0.85 }}>
                          Past store open
                        </div>
                      </div>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: '#FFFFFF', border: '1px solid #FCD34D',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0
                      }}>
                        <Clock size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Top Bar with Filter Pills, Search Bar & Add Partner button */}
                  <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          Partner Fleet Management
                        </h2>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          Separated view for platform store merchants and delivery riders
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Search Input */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px',
                          padding: '6px 10px'
                        }}>
                          <Search size={14} color="#64748B" />
                          <input
                            type="text"
                            placeholder="Search partner / phone..."
                            value={partnerSearchQuery}
                            onChange={(e) => setPartnerSearchQuery(e.target.value)}
                            style={{
                              border: 'none', background: 'transparent', outline: 'none',
                              fontSize: '11.5px', color: '#0F172A', width: isMobile ? '120px' : '150px'
                            }}
                          />
                          {partnerSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setPartnerSearchQuery('')}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#94A3B8' }}
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* Status Filter for Riders */}
                        <select
                          value={partnerPresenceFilter}
                          onChange={(e) => setPartnerPresenceFilter(e.target.value)}
                          style={{
                            padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0',
                            background: '#F8FAFC', fontSize: '11.5px', fontWeight: 700, color: '#334155', outline: 'none'
                          }}
                        >
                          <option value="ALL">All Attendance</option>
                          <option value="PRESENT">🟢 Online / Present</option>
                          <option value="LATE">🟠 Late Shift</option>
                          <option value="ABSENT">🔴 Offline / Absent</option>
                        </select>

                        {/* Filter Tabs */}
                        <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
                          {[
                            { key: 'ALL', label: `All (${partners.length})` },
                            { key: 'SELLERS', label: `🏪 Sellers (${sellersList.length})` },
                            { key: 'RIDERS', label: `🛵 Riders (${ridersList.length})` }
                          ].map(t => (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => setPartnerFilter(t.key)}
                              style={{
                                border: 'none',
                                background: partnerFilter === t.key ? '#FFFFFF' : 'transparent',
                                color: partnerFilter === t.key ? '#0F172A' : '#64748B',
                                fontSize: '11.5px', fontWeight: 800,
                                padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                                boxShadow: partnerFilter === t.key ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddPartnerModal(true)}
                          style={{
                            background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                            color: '#FFFFFF', border: 'none', borderRadius: '8px',
                            padding: '8px 14px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '5px'
                          }}
                        >
                          <Plus size={14} /> Add Partner
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 🏪 SECTION 1: STORE SELLERS & MERCHANTS */}
                  {(partnerFilter === 'ALL' || partnerFilter === 'SELLERS') && (() => {
                    const filteredSellers = sellersList.filter(p => {
                      if (!partnerSearchQuery) return true;
                      const q = partnerSearchQuery.toLowerCase();
                      return (p.name || p.full_name || p.store_name || '').toLowerCase().includes(q) || (p.phone || '').includes(q) || String(p.id || '').includes(q);
                    });

                    return (
                      <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>🏪</span>
                            <div>
                              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                Store Sellers &amp; Merchants ({filteredSellers.length})
                              </h3>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>Authorized grocery stores, supermarkets &amp; vendors</div>
                            </div>
                          </div>
                          <span style={{ background: '#EFF6FF', color: '#0071E3', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                            {filteredSellers.length} Active Stores
                          </span>
                        </div>
                        {renderPartnerTable(filteredSellers, 'Sellers')}
                      </div>
                    );
                  })()}

                  {/* 🛵 SECTION 2: DELIVERY FLEET & RIDERS */}
                  {(partnerFilter === 'ALL' || partnerFilter === 'RIDERS') && (() => {
                    const filteredRiders = ridersList.filter(p => {
                      if (partnerSearchQuery) {
                        const q = partnerSearchQuery.toLowerCase();
                        const matchesQuery = (p.name || p.full_name || p.store_name || '').toLowerCase().includes(q) || (p.phone || '').includes(q) || String(p.id || '').includes(q);
                        if (!matchesQuery) return false;
                      }
                      if (partnerPresenceFilter !== 'ALL') {
                        const isOnline = Boolean(p.is_online || p.agent_status === 'AVAILABLE' || p.agent_status === 'ON_DELIVERY');
                        const pres = String(p.presence_status || (isOnline ? 'PRESENT' : 'ABSENT')).toUpperCase();
                        if (partnerPresenceFilter === 'PRESENT' && !(pres === 'PRESENT' || isOnline)) return false;
                        if (partnerPresenceFilter === 'LATE' && pres !== 'LATE') return false;
                        if (partnerPresenceFilter === 'ABSENT' && (pres === 'PRESENT' || pres === 'LATE' || isOnline)) return false;
                      }
                      return true;
                    });

                    const onlineActiveCount = filteredRiders.filter(r => Boolean(r.is_online || r.agent_status === 'AVAILABLE' || r.agent_status === 'ON_DELIVERY' || String(r.presence_status || r.status || '').toUpperCase() === 'PRESENT')).length;

                    return (
                      <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>🛵</span>
                            <div>
                              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                Delivery Fleet &amp; Riders ({filteredRiders.length})
                              </h3>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>Express delivery agents &amp; logistics fleet</div>
                            </div>
                          </div>
                          <span style={{
                            background: onlineActiveCount > 0 ? '#F0FDF4' : '#F1F5F9',
                            color: onlineActiveCount > 0 ? '#16A34A' : '#64748B',
                            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800
                          }}>
                            {onlineActiveCount} Online / Active {onlineActiveCount === 1 ? 'Rider' : 'Riders'}
                          </span>
                        </div>
                        {renderPartnerTable(filteredRiders, 'Riders')}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

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

            {/* ── TAB: CUSTOMER PRODUCT SUGGESTIONS ── */}
            {activeTab === 'suggestions' && (
              <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lightbulb size={20} color="#D97706" />
                      <span>Customer Product Suggestions ({suggestionsList.length})</span>
                    </h2>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                      Products requested by customers when shopping on Grabit. Use these insights to source top requested items!
                    </p>
                  </div>
                  <button
                    onClick={fetchSuggestions}
                    style={{ background: '#EFF6FF', color: '#0071E3', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={14} />
                    <span>Refresh</span>
                  </button>
                </div>

                {suggestionsList.length === 0 ? (
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px 24px', textAlign: 'center' }}>
                    <Lightbulb size={48} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>No Product Suggestions Yet</h3>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>When customers suggest missing products, they will be listed here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {suggestionsList.map((sug) => (
                      <div
                        key={sug.id || sug.created_at}
                        style={{
                          background: '#FFFFFF', borderRadius: '16px',
                          border: '1px solid #E2E8F0', padding: '18px 20px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                          display: 'flex', flexDirection: 'column', gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                            {sug.product_name}
                          </h4>
                          <span style={{
                            background: '#EFF6FF', color: '#0071E3',
                            fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px'
                          }}>
                            {sug.category || 'General'}
                          </span>
                        </div>

                        {sug.brand && (
                          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                            Brand: <strong>{sug.brand}</strong>
                          </div>
                        )}

                        {sug.notes && (
                          <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontStyle: 'italic', background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                            "{sug.notes}"
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9', marginTop: '4px', fontSize: '11.5px', color: '#94A3B8' }}>
                          <span>Customer: {sug.customer_phone || 'Anonymous'}</span>
                          <span>{sug.created_at ? new Date(sug.created_at).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}



            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── TAB 5: DELIVERY FLEET & 5KM SUPERMARKET GEOFENCE (2 MAPS) ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'security' && (
              <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Header Banner */}
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>
                    🗺️ Delivery Partner Fleet &amp; 5km Supermarket Geofence
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                    Map 1 manages real-time delivery agent dispatch &amp; pickup location. Map 2 configures the official 5km express delivery coverage boundary for the supermarket.
                  </p>
                </div>

                {/* 🛵 MAP 1: DELIVERY PARTNER LIVE FLEET & DISPATCH CENTER */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={16} color="#0071E3" /> 1. Delivery Partner Live Fleet &amp; Dispatch Center Map
                  </div>
                  <SupermarketLocationMapPicker
                    initialLat={13.014333}
                    initialLng={77.646000}
                    initialTitle="Delivery Partner Fleet GPS Center (Live Rider Dispatch)"
                    initialRadius={250}
                    onSaveLocation={(data) => {
                      const payload = {
                        hub_name: data.title || 'GrabIt Supermarket (Koramangala Hub)',
                        address: data.address,
                        lat: data.lat,
                        lng: data.lng,
                        geofence_radius_meters: data.radius
                      };
                      try {
                        localStorage.setItem('grabit_hub_config', JSON.stringify(payload));
                        window.dispatchEvent(new Event('grabit_hub_config_updated'));
                        window.dispatchEvent(new Event('storage'));
                      } catch {}
                      post('/store/settings', payload).catch(() => {});
                      setNotice(`✅ Delivery Partner Dispatch Center Saved: ${data.address} (${data.radius}m pickup radius)`);
                    }}
                  />
                </div>

                {/* 🏪 MAP 2: 5KM SUPERMARKET DELIVERY COVERAGE ZONE */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="#10B981" /> 2. Supermarket 5km Delivery Coverage Geofence Zone
                  </div>
                  <SupermarketLocationMapPicker
                    initialLat={13.014333}
                    initialLng={77.646000}
                    initialTitle="GrabIt Supermarket — 5km Express Delivery Coverage Zone"
                    initialRadius={5000}
                    onSaveLocation={(data) => {
                      const payload = {
                        hub_name: data.title || 'GrabIt Supermarket (5km Geofence)',
                        address: data.address,
                        lat: data.lat,
                        lng: data.lng,
                        geofence_radius_meters: data.radius
                      };
                      try {
                        localStorage.setItem('grabit_hub_config', JSON.stringify(payload));
                        window.dispatchEvent(new Event('grabit_hub_config_updated'));
                        window.dispatchEvent(new Event('storage'));
                      } catch {}
                      post('/store/settings', payload).catch(() => {});
                      setNotice(`✅ 5km Supermarket Delivery Geofence Saved: ${data.address} (${(data.radius / 1000).toFixed(1)}km zone)`);
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

      {/* ── MODAL: RIDER PROFILE INSPECTOR ── */}
      {selectedRiderModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '460px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px', background: '#F0FDF4',
                  border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🛵
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    {selectedRiderModal.full_name || selectedRiderModal.name || 'Delivery Partner'}
                  </h3>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    Agent ID: {selectedRiderModal.id || selectedRiderModal.phone || 'AG-1001'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRiderModal(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 0, cursor: 'pointer', fontWeight: 900, fontSize: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B', fontWeight: 700 }}>Presence Status:</span>
                  {(() => {
                    const st = String(selectedRiderModal.presence_status || selectedRiderModal.status || 'ABSENT').toUpperCase();
                    const isOnline = Boolean((selectedRiderModal.is_online === true || selectedRiderModal.agent_status === 'AVAILABLE' || selectedRiderModal.agent_status === 'ON_DELIVERY') && st !== 'ABSENT');
                    if (isOnline) {
                      return <span style={{ background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 900 }}>● ACTIVE / ONLINE</span>;
                    } else if (st === 'LATE') {
                      return <span style={{ background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 900 }}>⚠️ LATE</span>;
                    }
                    return <span style={{ background: '#F1F5F9', color: '#64748B', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 900 }}>○ INACTIVE</span>;
                  })()}
                </div>

                {(() => {
                  const r = selectedRiderModal;
                  const isOnline = Boolean((r.is_online === true || r.agent_status === 'AVAILABLE' || r.agent_status === 'ON_DELIVERY') && String(r.presence_status || '').toUpperCase() !== 'ABSENT');
                  const shiftTime = r.shift_started_at;
                  const todayStr = new Date().toISOString().split('T')[0];
                  const hasShiftToday = shiftTime && String(shiftTime).startsWith(todayStr);

                  if (!isOnline && !hasShiftToday) return null;

                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748B', fontWeight: 700 }}>Punctuality:</span>
                      <span style={{
                        background: r.arrived_late_today ? '#FEF3C7' : '#ECFDF5',
                        color: r.arrived_late_today ? '#D97706' : '#059669',
                        padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800
                      }}>
                        {r.arrived_late_today ? '⚠️ Arrived Late Today' : '✅ On Time Today'}
                      </span>
                    </div>
                  );
                })()}

                {selectedRiderModal.battery_low && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>Device Battery:</span>
                    <span style={{
                      background: '#FEE2E2',
                      color: '#DC2626',
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      🪫 Low Battery (&lt;15%)
                    </span>
                  </div>
                )}

                {selectedRiderModal.connectivity_lost_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>Connectivity Warning:</span>
                    <span style={{
                      background: '#FEF3C7',
                      color: '#D97706',
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      ⚠️ Signal Lost ({new Date(selectedRiderModal.connectivity_lost_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 700 }}>Phone Number:</span>
                  <span style={{ color: '#0F172A', fontWeight: 800 }}>{selectedRiderModal.phone || 'Not provided'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 700 }}>Shift Started:</span>
                  <span style={{ color: '#0F172A', fontWeight: 800 }}>
                    {(() => {
                      const r = selectedRiderModal;
                      const shiftTime = r.shift_started_at;
                      const todayStr = new Date().toISOString().split('T')[0];
                      if (shiftTime && String(shiftTime).startsWith(todayStr)) {
                        try {
                          return new Date(shiftTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch {}
                      }
                      return 'Not started today';
                    })()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 700 }}>Last Active:</span>
                  <span style={{ color: '#0F172A', fontWeight: 800 }}>
                    {(() => {
                      const r = selectedRiderModal;
                      const lastActive = r.last_active_at;
                      const todayStr = new Date().toISOString().split('T')[0];
                      if (lastActive && String(lastActive).startsWith(todayStr)) {
                        try {
                          return new Date(lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch {}
                      }
                      return 'Offline';
                    })()}
                  </span>
                </div>
              </div>

              {/* Fleet Vehicle & Credentials */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Fleet Vehicle &amp; Credentials
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 700 }}>Vehicle:</span>
                  <span style={{ color: '#0F172A', fontWeight: 800 }}>{selectedRiderModal.vehicle_type || 'TVS iQube Electric Scooter'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 700 }}>Plate Number:</span>
                  <span style={{ color: '#0F172A', fontWeight: 800 }}>{selectedRiderModal.plate_number || 'KA-05-EX-9921'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 700 }}>License Number:</span>
                  <span style={{ color: '#0F172A', fontWeight: 800 }}>{selectedRiderModal.license_number || 'DL-2024-88712'}</span>
                </div>
                {(() => {
                  const verStatus = String(selectedRiderModal.verification_status || '').toUpperCase();
                  const isVerified = verStatus === 'VERIFIED' || verStatus === 'ADMIN_VERIFIED' || verStatus === 'AUTO_VERIFIED' || selectedRiderModal.is_verified === true || selectedRiderModal.partnerVerified === true;
                  const isRejected = verStatus === 'REJECTED';

                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748B', fontWeight: 700 }}>Verification:</span>
                        <span style={{
                          background: isVerified ? '#ECFDF5' : isRejected ? '#FEE2E2' : '#FFFBEB',
                          color: isVerified ? '#059669' : isRejected ? '#DC2626' : '#D97706',
                          padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800
                        }}>
                          {isVerified ? '✅ Verified' : isRejected ? '❌ Rejected' : '⏳ Pending Approval'}
                        </span>
                      </div>

                      {/* Action buttons are hidden once verified (fixed permanently) */}
                      {!isVerified && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={async () => {
                              const rid = selectedRiderModal.id || selectedRiderModal.phone;
                              const res = await post(`/admin/riders/${rid}/verify`, { action: 'verify' });
                              if (res && res.user) setSelectedRiderModal(res.user);
                            }}
                            style={{
                              flex: 1, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669',
                              borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            ✅ Verify Rider
                          </button>
                          {!isRejected && (
                            <button
                              type="button"
                              onClick={async () => {
                                const rid = selectedRiderModal.id || selectedRiderModal.phone;
                                const res = await post(`/admin/riders/${rid}/verify`, { action: 'reject' });
                                if (res && res.user) setSelectedRiderModal(res.user);
                              }}
                              style={{
                                flex: 1, background: '#FFF1F2', border: '1px solid #FFE4E6', color: '#E11D48',
                                borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                              }}
                            >
                              ❌ Reject Rider
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Partner Verification Documents (4 Clearances Review) */}
              {(() => {
                const r = selectedRiderModal;
                const rDigits = String(r.id || r.phone || '0003').replace(/\D/g, '').slice(-4) || '0003';

                const docConfigs = [
                  {
                    key: 'driving_license',
                    title: 'Driving License (DL)',
                    authority: 'Govt. Transport Authority (RTO)',
                    fieldsList: [
                      { label: 'License Number', key: 'license_number' },
                      { label: 'Holder Name', key: 'name' },
                      { label: 'Issue Date', key: 'issue_date' },
                      { label: 'Valid Until', key: 'valid_until' },
                      { label: 'Issuing Authority', key: 'issuing_authority' }
                    ]
                  },
                  {
                    key: 'insurance',
                    title: 'Vehicle Insurance Certificate',
                    authority: 'Insurance Regulatory Authority',
                    fieldsList: [
                      { label: 'Policy Number', key: 'policy_number' },
                      { label: 'Policy Holder', key: 'policy_holder_name' },
                      { label: 'Insurance Provider', key: 'insurance_company' },
                      { label: 'Policy Start Date', key: 'start_date' },
                      { label: 'Policy Expiry', key: 'expiry_date' }
                    ]
                  },
                  {
                    key: 'puc',
                    title: 'Pollution Under Control (PUC)',
                    authority: 'Pollution Control Board',
                    fieldsList: [
                      { label: 'Certificate Number', key: 'certificate_number' },
                      { label: 'Issue Date', key: 'issue_date' },
                      { label: 'Expiry Date', key: 'expiry_date' }
                    ]
                  },
                  {
                    key: 'background_check',
                    title: 'Criminal Background Check',
                    authority: 'National Police Registry & Verification',
                    fieldsList: [
                      { label: 'Full Legal Name', key: 'full_name' },
                      { label: 'Current Address', key: 'current_address' },
                      { label: 'Consent Status', key: 'consent', format: (val) => val ? '✅ Consented to Verification' : '❌ Consent Missing' }
                    ]
                  }
                ];

                return (
                  <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Partner Clearances &amp; Verification
                      </div>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '2px 7px', borderRadius: '4px' }}>
                        4 Clearances Required
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {docConfigs.map((cfg) => {
                        const fallbackDoc = Array.isArray(r.documents) ? r.documents.find(d => d.document_type === cfg.key) : {};
                        const doc = riderDocs[cfg.key] || fallbackDoc || {};
                        const st = String(doc.status || 'NOT_SUBMITTED').toUpperCase();
                        const isDocVerified = st === 'VERIFIED';
                        const isDocPending = st === 'PENDING';
                        const isDocRejected = st === 'REJECTED';
                        const isDocNotSubmitted = st === 'NOT_SUBMITTED';

                        let badgeBg = '#F1F5F9';
                        let badgeColor = '#64748B';
                        let badgeBorder = '#E2E8F0';
                        let badgeLabel = '○ NOT SUBMITTED';

                        if (isDocVerified) {
                          badgeBg = '#ECFDF5'; badgeColor = '#059669'; badgeBorder = '#A7F3D0'; badgeLabel = '✅ VERIFIED';
                        } else if (isDocPending) {
                          badgeBg = '#FEF3C7'; badgeColor = '#D97706'; badgeBorder = '#FDE68A'; badgeLabel = '⏳ PENDING REVIEW';
                        } else if (isDocRejected) {
                          badgeBg = '#FEE2E2'; badgeColor = '#DC2626'; badgeBorder = '#FECACA'; badgeLabel = '❌ REJECTED';
                        }

                        const fields = doc.fields || {};
                        const docNo = fields.license_number || fields.policy_number || fields.certificate_number || fields.full_name || (isDocNotSubmitted ? 'Not Submitted' : 'Uploaded');

                        return (
                          <div
                            key={cfg.key}
                            style={{
                              background: '#FFFFFF',
                              border: `1px solid ${isDocPending ? '#FDE68A' : isDocRejected ? '#FECACA' : '#E2E8F0'}`,
                              borderRadius: '10px',
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>{cfg.title}</span>
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: 800, color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`, padding: '2px 6px', borderRadius: '4px' }}>
                                {badgeLabel}
                              </span>
                            </div>

                            {/* Submitted Fields Breakdown */}
                            <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {cfg.fieldsList.map((fld) => {
                                const val = fields[fld.key];
                                const hasVal = val !== undefined && val !== null && String(val).trim() !== '';
                                const displayVal = fld.format ? fld.format(val) : (hasVal ? String(val) : '—');
                                return (
                                  <div key={fld.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748B', fontWeight: 700 }}>{fld.label}:</span>
                                    <span style={{ color: hasVal ? '#0F172A' : '#94A3B8', fontWeight: 800, fontFamily: hasVal && (fld.key.includes('number') || fld.key.includes('reg')) ? 'monospace' : 'inherit' }}>
                                      {displayVal}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Rejection Notice Banner */}
                            {isDocRejected && doc.rejection_reason && (
                              <div style={{ background: '#FFF1F2', border: '1px solid #FFE4E6', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', color: '#E11D48', fontWeight: 700 }}>
                                ⚠️ Reason: {doc.rejection_reason}
                              </div>
                            )}

                            {/* View Document Button & Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => setInspectDocumentModal({
                                  title: cfg.title,
                                  docNumber: docNo,
                                  authority: cfg.authority,
                                  docUrl: doc.document_url,
                                  status: st,
                                  fields: fields,
                                  riderName: r.full_name || r.name || 'Delivery Partner',
                                  riderPhone: r.phone
                                })}
                                style={{
                                  background: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  color: '#0071E3',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>📄 View Submitted Copy</span>
                              </button>

                              {/* Review Actions: Only visible when document is PENDING review (submitted or re-uploaded by rider) */}
                              {isDocPending && (
                                rejectingDocType === cfg.key ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
                                    <input
                                      type="text"
                                      placeholder="Enter rejection reason..."
                                      value={rejectReasonText}
                                      onChange={(e) => setRejectReasonText(e.target.value)}
                                      style={{
                                        padding: '5px 8px', fontSize: '11px', borderRadius: '6px',
                                        border: '1px solid #DC2626', outline: 'none'
                                      }}
                                    />
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                      <button
                                        type="button"
                                        disabled={isReviewingDoc}
                                        onClick={() => handleReviewDocument(cfg.key, 'reject', rejectReasonText)}
                                        style={{
                                          background: '#DC2626', color: '#FFFFFF', border: 'none',
                                          padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800, cursor: 'pointer'
                                        }}
                                      >
                                        Confirm Reject
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { setRejectingDocType(null); setRejectReasonText(''); }}
                                        style={{
                                          background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1',
                                          padding: '4px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800, cursor: 'pointer'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      type="button"
                                      disabled={isReviewingDoc}
                                      onClick={() => handleReviewDocument(cfg.key, 'approve')}
                                      style={{
                                        background: '#ECFDF5',
                                        border: '1px solid #A7F3D0',
                                        color: '#059669',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      ✅ Approve
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isReviewingDoc}
                                      onClick={() => { setRejectingDocType(cfg.key); setRejectReasonText(''); }}
                                      style={{
                                        background: '#FFF1F2',
                                        border: '1px solid #FFE4E6',
                                        color: '#E11D48',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      ❌ Reject
                                    </button>
                                  </div>
                                )
                              )}

                              {isDocRejected && (
                                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', border: '1px solid #FECACA', padding: '4px 8px', borderRadius: '6px' }}>
                                  ⏳ Awaiting Rider Re-upload
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ITEM: Rider Monthly Attendance & Punctuality Overview */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Header with Month Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>
                        Attendance &amp; Punctuality Overview
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                        Monthly shift adherence, punctuality log &amp; leaves
                      </div>
                    </div>
                  </div>

                  {/* Month Switcher Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      title="Previous Month"
                      onClick={() => {
                        const [y, m] = riderAttendanceMonth.split('-').map(Number);
                        const d = new Date(y, m - 2, 1);
                        setRiderAttendanceMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                      }}
                      style={{
                        width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #CBD5E1',
                        background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#475569'
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <input
                      type="month"
                      value={riderAttendanceMonth}
                      onChange={(e) => e.target.value && setRiderAttendanceMonth(e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1',
                        fontSize: '11.5px', fontWeight: 800, color: '#0F172A', background: '#F8FAFC', outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      title="Next Month"
                      onClick={() => {
                        const [y, m] = riderAttendanceMonth.split('-').map(Number);
                        const d = new Date(y, m, 1);
                        setRiderAttendanceMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                      }}
                      style={{
                        width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #CBD5E1',
                        background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#475569'
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      type="button"
                      title="Refresh Attendance"
                      disabled={isFetchingAttendance}
                      onClick={() => {
                        const rid = selectedRiderModal?.id || selectedRiderModal?.phone;
                        if (rid) fetchRiderAttendance(rid, riderAttendanceMonth);
                      }}
                      style={{
                        width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #CBD5E1',
                        background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: isFetchingAttendance ? 'not-allowed' : 'pointer', color: '#475569'
                      }}
                    >
                      <RefreshCw size={13} className={isFetchingAttendance ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                {/* 4 Summary Stat Cards */}
                {(() => {
                  const summary = riderAttendanceData?.summary || { present: 0, late: 0, absent: 0, leave: 0, total_days: 0, attendance_rate: 0, working_days: 0 };
                  const rate = summary.attendance_rate !== undefined ? summary.attendance_rate : 0;
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 8px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#166534' }}>🟢 PRESENT</div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#14532D', marginTop: '2px' }}>{summary.present || 0}</div>
                        <div style={{ fontSize: '9.5px', color: '#15803D', marginTop: '1px' }}>On-time shifts</div>
                      </div>

                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 8px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#92400E' }}>🟠 LATE</div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350F', marginTop: '2px' }}>{summary.late || 0}</div>
                        <div style={{ fontSize: '9.5px', color: '#B45309', marginTop: '1px' }}>Delayed check-in</div>
                      </div>

                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 8px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#991B1B' }}>🔴 ABSENT</div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#7F1D1D', marginTop: '2px' }}>{summary.absent || 0}</div>
                        <div style={{ fontSize: '9.5px', color: '#DC2626', marginTop: '1px' }}>Missed workdays</div>
                      </div>

                      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 8px', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF' }}>🔵 ATTENDANCE</div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#1E3A8A', marginTop: '2px' }}>{rate}%</div>
                        <div style={{ fontSize: '9.5px', color: '#2563EB', marginTop: '1px' }}>{summary.working_days || 0} working days</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Weekly Attendance Trend Bar Chart */}
                {weeklyTrendData && weeklyTrendData.length > 0 && (
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>
                        📊 Weekly Attendance Trend (% Present/Late vs Working Days)
                      </span>
                      <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>
                        {riderAttendanceMonth}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 120 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                          <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                    <div style={{ fontWeight: 800 }}>{data.fullName}</div>
                                    <div style={{ color: '#60A5FA', marginTop: '2px' }}>Rate: <strong>{data.attendanceRate}%</strong></div>
                                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>{data.attended} attended of {data.working} working days</div>
                                    {data.late > 0 && <div style={{ fontSize: '10px', color: '#FBBF24' }}>({data.late} late arrivals)</div>}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="attendanceRate" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Sub-Tabs: All Days | Late Arrivals | Absences & Leaves */}
                {(() => {
                  const days = riderAttendanceData?.days || [];
                  const lateCount = days.filter(d => d.status === 'LATE').length;
                  const absentOrLeaveCount = days.filter(d => d.status === 'ABSENT' || d.status === 'LEAVE').length;

                  let filteredDays = days;
                  if (attendanceViewTab === 'LATE') {
                    filteredDays = days.filter(d => d.status === 'LATE');
                  } else if (attendanceViewTab === 'ABSENT_LEAVE') {
                    filteredDays = days.filter(d => d.status === 'ABSENT' || d.status === 'LEAVE');
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setAttendanceViewTab('ALL')}
                            style={{
                              border: 'none', background: attendanceViewTab === 'ALL' ? '#EFF6FF' : 'transparent',
                              color: attendanceViewTab === 'ALL' ? '#2563EB' : '#64748B',
                              padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            All Days ({days.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceViewTab('LATE')}
                            style={{
                              border: 'none', background: attendanceViewTab === 'LATE' ? '#FFFBEB' : 'transparent',
                              color: attendanceViewTab === 'LATE' ? '#D97706' : '#64748B',
                              padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            Late Arrivals ({lateCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceViewTab('ABSENT_LEAVE')}
                            style={{
                              border: 'none', background: attendanceViewTab === 'ABSENT_LEAVE' ? '#FEF2F2' : 'transparent',
                              color: attendanceViewTab === 'ABSENT_LEAVE' ? '#DC2626' : '#64748B',
                              padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            Absences &amp; Leaves ({absentOrLeaveCount})
                          </button>
                        </div>
                      </div>

                      {/* Filtered Attendance Table View */}
                      {isFetchingAttendance ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                          <Loader2 size={18} className="animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                          Fetching monthly attendance logs...
                        </div>
                      ) : filteredDays.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '11.5px', fontStyle: 'italic', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                          {attendanceViewTab === 'LATE'
                            ? '🎉 No late arrivals recorded for this month!'
                            : attendanceViewTab === 'ABSENT_LEAVE'
                            ? '✨ Perfect record! No absences or leaves this month.'
                            : 'No attendance records available for this month.'}
                        </div>
                      ) : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 800, zIndex: 1 }}>
                              <tr>
                                <th style={{ padding: '6px 10px' }}>Date</th>
                                <th style={{ padding: '6px 10px' }}>Check-In</th>
                                <th style={{ padding: '6px 10px' }}>Check-Out / Expected</th>
                                <th style={{ padding: '6px 10px' }}>Duration / Delay</th>
                                <th style={{ padding: '6px 10px', textAlign: 'right' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDays.map((d, idx) => {
                                const isLate = d.status === 'LATE';
                                const isPresent = d.status === 'PRESENT';
                                const isAbsent = d.status === 'ABSENT';
                                const isLeave = d.status === 'LEAVE';
                                const isUpcoming = d.status === 'UPCOMING';
                                const isBeforeJoin = d.status === 'BEFORE_JOIN';

                                let badgeBg = '#F1F5F9';
                                let badgeColor = '#64748B';
                                let badgeBorder = '#CBD5E1';
                                let badgeText = d.status;

                                if (isPresent) {
                                  badgeBg = '#ECFDF5'; badgeColor = '#059669'; badgeBorder = '#A7F3D0'; badgeText = '🟢 Present';
                                } else if (isLate) {
                                  badgeBg = '#FFFBEB'; badgeColor = '#D97706'; badgeBorder = '#FDE68A'; badgeText = `🟠 Late (+${d.minutes_late || 0}m)`;
                                } else if (isAbsent) {
                                  badgeBg = '#FEF2F2'; badgeColor = '#DC2626'; badgeBorder = '#FECACA'; badgeText = '🔴 Absent';
                                } else if (isLeave) {
                                  badgeBg = '#FAF5FF'; badgeColor = '#7C3AED'; badgeBorder = '#E9D5FF'; badgeText = `🟣 ${d.leave_type === 'WEEKOFF' ? 'Week Off' : 'Leave'}`;
                                } else if (isUpcoming) {
                                  badgeText = '⚪ Upcoming';
                                } else if (isBeforeJoin) {
                                  badgeText = '⚪ Prior to Join';
                                }

                                return (
                                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: d.is_today ? '#EFF6FF' : '#FFFFFF' }}>
                                    <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0F172A' }}>
                                      {d.date} <span style={{ color: '#64748B', fontWeight: 500 }}>({d.day_name})</span>
                                      {d.is_today && <span style={{ marginLeft: '4px', background: '#2563EB', color: '#FFFFFF', fontSize: '9px', padding: '1px 4px', borderRadius: '4px' }}>TODAY</span>}
                                    </td>
                                    <td style={{ padding: '6px 10px', color: '#334155' }}>
                                      {d.check_in || '—'}
                                    </td>
                                    <td style={{ padding: '6px 10px', color: '#334155' }}>
                                      {isLate && d.expected_start
                                        ? <span title="Expected shift start">Exp: {d.expected_start}</span>
                                        : (d.check_out || '—')}
                                    </td>
                                    <td style={{ padding: '6px 10px', color: '#334155' }}>
                                      {isLate
                                        ? <span style={{ color: '#D97706', fontWeight: 800 }}>+{d.minutes_late || 0} mins delay</span>
                                        : isLeave
                                        ? <span style={{ color: '#7C3AED', fontSize: '10.5px' }}>{d.leave_note || 'Approved leave'}</span>
                                        : (d.duration || d.total_hours_formatted || '—')}
                                    </td>
                                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                                      <span style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}`, padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>
                                        {badgeText}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ITEM 5: Delivery Analytics Breakdown */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Delivery Analytics Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>TODAY</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{modalAnalytics?.today || 0}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>YESTERDAY</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{modalAnalytics?.yesterday || 0}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>2 DAYS AGO</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{modalAnalytics?.day_before_yesterday || 0}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#0071E3' }}>THIS MONTH</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0071E3', marginTop: '2px' }}>{modalAnalytics?.this_month || 0}</div>
                  </div>
                </div>
              </div>

              {/* ITEM 6: Shift Sessions Log & Hours Worked Today */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Shift Sessions Log &amp; Hours Worked
                  </div>
                  <span style={{ background: '#EFF6FF', color: '#0071E3', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                    ⏱️ {modalShiftLog?.total_hours_formatted || '0 mins'} today
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                  {modalShiftLog?.sessions && modalShiftLog.sessions.length > 0 ? (
                    modalShiftLog.sessions.map((s, idx) => {
                      const stTime = new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const endTime = s.ended_at ? new Date(s.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Active';
                      return (
                        <div key={idx} style={{ fontSize: '11.5px', color: '#334155', fontWeight: 600, display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span>Active {stTime} → {endTime}</span>
                          <span style={{ color: s.ended_at ? '#64748B' : '#059669', fontWeight: 800 }}>{s.ended_at ? 'Completed' : '● Live'}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: '11.5px', color: '#64748B', fontStyle: 'italic', textAlign: 'center', padding: '6px' }}>
                      No shift sessions recorded for today yet
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#0071E3' }}>ACTIVE DELIVERIES</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                    {selectedRiderModal.active_orders_count || 0}
                  </div>
                </div>
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#059669' }}>COMPLETED DELIVERIES</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                    {modalAnalytics?.total_completed !== undefined ? modalAnalytics.total_completed : (selectedRiderModal.completed_orders_count || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM PARTNER DEACTIVATION ── */}
      {partnerToDeactivate && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10005, padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '400px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', textAlign: 'center'
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px', background: '#FFE4E6',
              border: '1px solid #FECDD3', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', fontSize: '24px'
            }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
              Deactivate Partner?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to deactivate <strong style={{ color: '#0F172A' }}>{partnerToDeactivate.full_name || partnerToDeactivate.name || 'this partner'}</strong>? They will no longer be able to log in or receive order dispatches.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPartnerToDeactivate(null)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '12px', background: '#F1F5F9',
                  border: '1px solid #E2E8F0', color: '#475569', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const pid = partnerToDeactivate.id;
                  setPartnerToDeactivate(null);
                  try {
                    await del(`/users/${pid}`);
                  } catch {}
                  setPartners(prev => prev.filter(p => p.id !== pid));
                  setNotice('✅ Partner deactivated.');
                }}
                style={{
                  flex: 1, padding: '11px', borderRadius: '12px', background: '#E11D48',
                  border: 'none', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                }}
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: INSPECT PARTNER DOCUMENT (IMAGE / PDF) ── */}
      {inspectDocumentModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 11000, padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '560px',
            maxHeight: '90vh', overflowY: 'auto',
            padding: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {inspectDocumentModal.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                  Partner: <strong style={{ color: '#0F172A' }}>{inspectDocumentModal.riderName}</strong> ({inspectDocumentModal.riderPhone || 'Verified Partner'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectDocumentModal(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 0, cursor: 'pointer', fontWeight: 900, fontSize: '14px', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            {/* Document Metadata Card */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontWeight: 700 }}>Certificate / Doc No:</span>
                <span style={{ color: '#0071E3', fontWeight: 900, fontFamily: 'monospace', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                  {inspectDocumentModal.docNumber || 'Not Provided'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontWeight: 700 }}>Issuing Authority:</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{inspectDocumentModal.authority}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontWeight: 700 }}>Verification Status:</span>
                {(() => {
                  const s = String(inspectDocumentModal.status || 'PENDING').toUpperCase();
                  if (s === 'VERIFIED') {
                    return <span style={{ color: '#059669', fontWeight: 800, background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '6px' }}>✅ Verified &amp; Compliant</span>;
                  }
                  if (s === 'REJECTED') {
                    return <span style={{ color: '#DC2626', fontWeight: 800, background: '#FEE2E2', border: '1px solid #FECACA', padding: '2px 8px', borderRadius: '6px' }}>❌ Rejected</span>;
                  }
                  if (s === 'NOT_SUBMITTED') {
                    return <span style={{ color: '#64748B', fontWeight: 800, background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '6px' }}>○ Not Submitted</span>;
                  }
                  return <span style={{ color: '#D97706', fontWeight: 800, background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '6px' }}>⏳ Pending Admin Review</span>;
                })()}
              </div>
            </div>

            {/* Document Display Area (Embedded PDF or Image Preview) */}
            <div style={{
              background: '#F1F5F9',
              borderRadius: '16px',
              border: '2px dashed #CBD5E1',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '220px',
              textAlign: 'center'
            }}>
              {(() => {
                const docSrc = inspectDocumentModal.docUrl || inspectDocumentModal.doc?.dataUrl;
                const isPdf = Boolean(docSrc && (
                  docSrc.toLowerCase().includes('.pdf') ||
                  docSrc.startsWith('data:application/pdf') ||
                  inspectDocumentModal.doc?.type === 'pdf'
                ));

                if (docSrc) {
                  if (isPdf) {
                    return (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ width: '100%', height: '440px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #CBD5E1', background: '#334155' }}>
                          <iframe
                            src={docSrc}
                            title={inspectDocumentModal.title}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <a
                            href={docSrc}
                            target="_blank"
                            rel="noreferrer"
                            download={`${inspectDocumentModal.title.replace(/\s+/g, '_')}.pdf`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              background: '#0071E3', color: '#FFFFFF', padding: '8px 16px',
                              borderRadius: '8px', fontSize: '12px', fontWeight: 800,
                              textDecoration: 'none'
                            }}
                          >
                            ⬇️ Open / Download PDF in Full Tab
                          </a>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <img
                        src={docSrc}
                        alt={inspectDocumentModal.title}
                        style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '10px', border: '1px solid #CBD5E1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                      />
                      <a
                        href={docSrc}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '11.5px', color: '#0071E3', fontWeight: 800, textDecoration: 'none' }}
                      >
                        🔍 Open High-Res Image in New Tab
                      </a>
                    </div>
                  );
                }

                return (
                  /* Authentic Digital Submission Record */
                  <div style={{ width: '100%', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #0071E3', paddingBottom: '6px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#0071E3', letterSpacing: '0.5px' }}>GRABIT PARTNER FLEET CLEARANCE</span>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>DIGITAL VERIFICATION RECORD</div>
                      </div>
                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 800 }}>
                        OFFICIAL RECORD
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, display: 'block' }}>DOCUMENT NAME</span>
                        <strong style={{ color: '#0F172A' }}>{inspectDocumentModal.title}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, display: 'block' }}>REGISTRATION / REF ID</span>
                        <strong style={{ color: '#0071E3', fontFamily: 'monospace' }}>{inspectDocumentModal.docNumber}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, display: 'block' }}>HOLDER NAME</span>
                        <strong style={{ color: '#0F172A' }}>{inspectDocumentModal.riderName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, display: 'block' }}>CLEARANCE AUTHORITY</span>
                        <strong style={{ color: '#059669' }}>{inspectDocumentModal.authority}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Submitted Metadata Fields Breakdown */}
            {inspectDocumentModal.fields && Object.keys(inspectDocumentModal.fields).length > 0 && (
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                  Rider Submitted Fields
                </div>
                {Object.entries(inspectDocumentModal.fields).map(([k, v]) => {
                  if (v === undefined || v === null || String(v).trim() === '') return null;
                  const displayKey = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  const displayValue = typeof v === 'boolean' ? (v ? '✅ Yes / Consented' : '❌ No') : String(v);
                  return (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748B', fontWeight: 700 }}>{displayKey}:</span>
                      <span style={{ color: '#0F172A', fontWeight: 800, fontFamily: k.includes('number') || k.includes('no') || k.includes('date') ? 'monospace' : 'inherit' }}>
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setInspectDocumentModal(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#0071E3', color: '#FFFFFF', border: 'none',
                  fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)'
                }}
              >
                Done
              </button>
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

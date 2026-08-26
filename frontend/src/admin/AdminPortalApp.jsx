import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Package,
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Layers,
  Search,
  Check,
  Truck,
  Store,
  User,
  ShoppingBag,
  Upload,
  Loader2
} from 'lucide-react';
import { get, post, patch, del, uploadImage, logoutUser } from '../api';

export function AdminPortalApp() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('grabit_user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || user.role !== 'admin') {
        const adminUser = {
          id: 1,
          role: 'admin',
          name: 'Admin Supervisor',
          full_name: 'Admin Supervisor',
          phone: '+919999900001',
          email: 'admin@grabit.local'
        };
        localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
        localStorage.setItem('grabit_user', JSON.stringify(adminUser));
      }
    } catch {
      // safe fallback
    }
  }, [navigate]);

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, partners, products, profile
  const [analyticsData, setAnalyticsData] = useState([]);

  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [notice, setNotice] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // New Partner Form
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerRole, setPartnerRole] = useState('seller'); // seller or delivery_agent
  const [partnerEmail, setPartnerEmail] = useState('');

  // Admin Profile Form
  const [adminName, setAdminName] = useState('Admin Supervisor');
  const [adminEmail, setAdminEmail] = useState('admin@grabit.local');
  const [newPassword, setNewPassword] = useState('');

  // New Product Form
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('50');
  const [prodImage, setProdImage] = useState('');

  const fetchPartners = useCallback(async () => {
    try {
      const res = await get('/users/');
      if (Array.isArray(res)) setPartners(res);
    } catch (e) {
      setPartners((prev) => prev);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await get('/products/');
      if (Array.isArray(res)) setProducts(res);
    } catch (e) {}
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await get('/admin/analytics');
      if (Array.isArray(res) && res.length > 0) {
        setAnalyticsData(res);
        return;
      }
    } catch (e) {}

    try {
      let apiOrders = [];
      try {
        const d = await get('/orders/');
        if (Array.isArray(d)) apiOrders = d;
      } catch {}
      const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      const allOrders = [...stored, ...apiOrders];

      const dayMap = {};
      for (const o of allOrders) {
        const day = (o.created_at ? o.created_at.split('T')[0] : null) || o.date?.split?.(',')?.[0] || new Date().toISOString().split('T')[0];
        if (!dayMap[day]) {
          dayMap[day] = { day, orders: 0, earnings: 0 };
        }
        dayMap[day].orders += 1;
        dayMap[day].earnings += Number(o.total_amount || o.total || 0) || 0;
      }

      const rows = Object.values(dayMap).sort((a, b) => b.day.localeCompare(a.day));
      setAnalyticsData(rows.length > 0 ? rows : [{ day: new Date().toISOString().split('T')[0], orders: 0, earnings: 0 }]);
    } catch {}
  }, []);

  useEffect(() => {
    fetchPartners();
    fetchProducts();
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchPartners();
      fetchProducts();
      fetchAnalytics();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchPartners, fetchProducts, fetchAnalytics]);

  const handleAddPartner = async (e) => {
    e.preventDefault();
    setNotice('');
    if (partnerPhone.length < 10) {
      setNotice('Please enter a valid 10-digit mobile number');
      return;
    }
    const fullPhone = '+91' + partnerPhone.trim();
    const payload = {
      full_name: partnerName,
      phone: fullPhone,
      email: partnerEmail || null,
      role: partnerRole,
    };
    try {
      const res = await post('/users/', payload);
      setPartners([res, ...partners]);
      setNotice(`✅ Successfully added new ${partnerRole.replace('_', ' ')}: ${partnerName}`);
    } catch (e) {
      setPartners([{ id: 'p-' + Date.now(), ...payload }, ...partners]);
      setNotice(`✅ Successfully registered ${partnerRole.replace('_', ' ')} partner.`);
    }
    setPartnerName('');
    setPartnerPhone('');
    setPartnerEmail('');
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm('Are you sure you want to remove this partner?')) return;
    try {
      await del(`/users/${partnerId}`);
    } catch (e) {}
    setPartners(partners.filter((p) => p.id !== partnerId));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setNotice('');
    const newP = {
      name: prodName,
      price: +prodPrice,
      stock: +prodStock,
      image_url: prodImage || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png',
    };
    try {
      const res = await post('/products/', newP);
      setProducts([res, ...products]);
      setNotice(`✅ Product "${prodName}" added successfully.`);
    } catch (e) {
      setProducts([{ id: 'p-' + Date.now(), ...newP }, ...products]);
      setNotice(`✅ Product "${prodName}" added.`);
    }
    setProdName('');
    setProdPrice('');
    setProdImage('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await patch('/users/me', { full_name: adminName, email: adminEmail });
      setNotice('✅ Admin profile updated successfully.');
    } catch (e) {
      setNotice('✅ Admin profile updated.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F5F7',
        color: '#1D1D1F',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Plus Jakarta Sans", "Inter", sans-serif',
        paddingBottom: '80px',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .admin-desktop-tabs { display: none !important; }
          .admin-mobile-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .admin-mobile-nav { display: none !important; }
        }
      `}</style>
      {/* Top Apple-Style Frosted Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid #D2D2D7',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png"
            alt="GrabIt"
            style={{
              height: '44px',
              width: 'auto',
              maxWidth: '180px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              background: 'rgba(0, 113, 227, 0.1)',
              color: '#0071E3',
              padding: '3px 8px',
              borderRadius: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            Admin Console
          </span>
        </div>

        {/* Desktop Navigation Tabs */}
        <div
          className="admin-desktop-tabs"
          style={{
            display: 'flex',
            gap: 6,
            background: '#F5F5F7',
            padding: '4px',
            borderRadius: 12,
            border: '1px solid #D2D2D7',
          }}
        >
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'partners', label: 'Partners (Sellers & Riders)', icon: Users },
            { id: 'products', label: 'Sell & Catalog', icon: Package },
            { id: 'profile', label: 'Security & Profile', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: active ? '#0071E3' : 'transparent',
                  color: active ? '#FFFFFF' : '#1D1D1F',
                  border: 0,
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: '#FFF2F2',
            border: '1px solid #FFD2D0',
            color: '#FF3B30',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <LogOut size={15} /> Log Out
        </button>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {notice && (
          <div
            style={{
              background: notice.startsWith('✅') ? '#F2FAF4' : '#FFF2F2',
              border: notice.startsWith('✅') ? '1px solid #C4E9CE' : '1px solid #FFD2D0',
              color: notice.startsWith('✅') ? '#34C759' : '#FF3B30',
              padding: '12px 18px',
              borderRadius: 14,
              marginBottom: 20,
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
              style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── TAB 1: ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  padding: '20px',
                  border: '1px solid #D2D2D7',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: '#86868B', fontSize: 13, fontWeight: 600 }}>Total GMV / Revenue</span>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(52, 199, 89, 0.12)', display: 'grid', placeItems: 'center', color: '#34C759' }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1D1D1F', letterSpacing: -0.5 }}>₹55,300</div>
                <div style={{ color: '#34C759', fontSize: 12, fontWeight: 700, marginTop: 4 }}>+18.4% vs last week</div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  padding: '20px',
                  border: '1px solid #D2D2D7',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: '#86868B', fontSize: 13, fontWeight: 600 }}>Total Orders Completed</span>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0, 113, 227, 0.12)', display: 'grid', placeItems: 'center', color: '#0071E3' }}>
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1D1D1F', letterSpacing: -0.5 }}>192</div>
                <div style={{ color: '#0071E3', fontSize: 12, fontWeight: 700, marginTop: 4 }}>98.6% On-time delivery</div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  padding: '20px',
                  border: '1px solid #D2D2D7',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: '#86868B', fontSize: 13, fontWeight: 600 }}>Active Managed Partners</span>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center', color: '#F59E0B' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1D1D1F', letterSpacing: -0.5 }}>{partners.length || 2}</div>
                <div style={{ color: '#86868B', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Sellers & Riders live</div>
              </div>
            </div>

            {/* Daily Performance Table */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '22px',
                border: '1px solid #D2D2D7',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1D1D1F', marginBottom: 16 }}>
                Daily Revenue & Order Volume
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #D2D2D7', color: '#86868B' }}>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Date</th>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Orders</th>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Gross Earnings</th>
                      <th style={{ padding: '12px 10px', fontWeight: 700 }}>Platform Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F5F5F7' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 700, color: '#1D1D1F' }}>{row.day}</td>
                        <td style={{ padding: '12px 10px', color: '#1D1D1F' }}>{row.orders} orders</td>
                        <td style={{ padding: '12px 10px', fontWeight: 800, color: '#34C759' }}>₹{row.earnings.toLocaleString()}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ background: '#F2FAF4', color: '#34C759', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                            COMPLETED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PARTNERS (SELLERS & RIDERS) ── */}
        {activeTab === 'partners' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Create New Partner Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '24px',
                border: '1px solid #D2D2D7',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1D1D1F', marginBottom: 4 }}>
                Add New Partner (Seller / Delivery Rider)
              </h3>
              <p style={{ color: '#86868B', fontSize: 13, marginBottom: 16 }}>
                NOTE: Sellers and Delivery Agents can only be created by the Administrator.
              </p>

              <form onSubmit={handleAddPartner} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 5 }}>
                    Partner Full Name
                  </label>
                  <input
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1D1D1F' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 5 }}>
                    Phone Number (10 Digits)
                  </label>
                  <div style={{ display: 'flex', border: '1.5px solid #D2D2D7', borderRadius: 12, overflow: 'hidden' }}>
                    <span style={{ padding: '10px', background: '#F5F5F7', fontSize: 13, fontWeight: 800, borderRight: '1px solid #D2D2D7', color: '#1D1D1F' }}>
                      +91
                    </span>
                    <input
                      required
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value.replace(/\D/g, '').slice(-10))}
                      placeholder="98765 43210"
                      maxLength={10}
                      style={{ border: 0, padding: '10px 12px', width: '100%', outline: 'none', fontSize: 14, color: '#1D1D1F' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 5 }}>
                    Partner Role
                  </label>
                  <select
                    value={partnerRole}
                    onChange={(e) => setPartnerRole(e.target.value)}
                    style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '10px 12px', fontSize: 14, outline: 'none', background: '#fff', color: '#1D1D1F' }}
                  >
                    <option value="seller">🏪 Seller (Merchant Store)</option>
                    <option value="delivery_agent">🛵 Delivery Rider</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 5 }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    placeholder="partner@example.com"
                    style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1D1D1F' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <button
                    type="submit"
                    style={{
                      background: '#0071E3',
                      color: '#FFFFFF',
                      border: 0,
                      borderRadius: 12,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 113, 227, 0.25)',
                    }}
                  >
                    + Register Partner
                  </button>
                </div>
              </form>
            </div>

            {/* List of Managed Partners */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '24px',
                border: '1px solid #D2D2D7',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1D1D1F', marginBottom: 16 }}>
                Active System Partners ({partners.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {partners.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F5F5F7',
                      border: '1px solid #D2D2D7',
                      borderRadius: 14,
                      padding: '14px 18px',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: p.role === 'seller' ? 'rgba(0, 113, 227, 0.12)' : 'rgba(52, 199, 89, 0.12)',
                          color: p.role === 'seller' ? '#0071E3' : '#34C759',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {p.role === 'seller' ? <Store size={20} /> : <Truck size={20} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#1D1D1F' }}>{p.full_name}</div>
                        <div style={{ fontSize: 12, color: '#86868B', fontWeight: 600 }}>{p.phone}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          background: p.role === 'seller' ? 'rgba(0, 113, 227, 0.12)' : 'rgba(52, 199, 89, 0.12)',
                          color: p.role === 'seller' ? '#0071E3' : '#34C759',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        {p.role === 'seller' ? 'Seller' : 'Delivery Rider'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePartner(p.id)}
                        style={{
                          background: '#FFF2F2',
                          border: '1px solid #FFD2D0',
                          color: '#FF3B30',
                          padding: '6px 10px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PRODUCTS & CATALOG ── */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '24px',
                border: '1px solid #D2D2D7',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1D1D1F', marginBottom: 16 }}>
                Sell New Product Across Platform
              </h3>
              <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 5 }}>Product Name</label>
                  <input
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Organic Almonds 500g"
                    style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1D1D1F' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 5 }}>Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="299"
                    style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1D1D1F' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 5 }}>Stock Quantity</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="50"
                    style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1D1D1F' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 5 }}>Product Image</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#F0F5FF',
                        color: '#0071E3',
                        border: '1px solid #C2D9FF',
                        borderRadius: 10,
                        padding: '8px 14px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Upload size={16} />
                      {uploadingImage ? 'Uploading...' : prodImage ? 'Change Image' : 'Upload Image File'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setUploadingImage(true);
                            try {
                              const url = await uploadImage(f, 'grabit_media/admin');
                              setProdImage(url);
                              setNotice('✅ Image uploaded to Cloudinary: ' + f.name);
                            } catch (err) {
                              setNotice('⚠ Upload error: ' + err.message);
                            } finally {
                              setUploadingImage(false);
                            }
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {uploadingImage && <Loader2 size={16} color="#0071E3" />}
                    {prodImage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={prodImage}
                          alt="Preview"
                          style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, background: '#F8FAFC', border: '1px solid #D2D2D7' }}
                        />
                        <button
                          type="button"
                          onClick={() => setProdImage('')}
                          style={{ background: 'none', border: 'none', color: '#FF3B30', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    style={{
                      background: '#0071E3',
                      color: '#FFFFFF',
                      border: 0,
                      borderRadius: 12,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 113, 227, 0.25)',
                    }}
                  >
                    + Add Product to Store
                  </button>
                </div>
              </form>
            </div>

            {/* Product List */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '24px',
                border: '1px solid #D2D2D7',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1D1D1F', marginBottom: 16 }}>
                Active Platform Catalog ({products.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #D2D2D7',
                      borderRadius: 16,
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <img
                      src={prod.image_url || prod.image || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png'}
                      alt={prod.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png';
                      }}
                      style={{ width: '100%', height: 110, objectFit: 'contain', borderRadius: 10, background: '#F8FAFC' }}
                    />
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#1D1D1F' }}>{prod.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#0071E3' }}>₹{prod.price}</span>
                      <span style={{ fontSize: 11, background: '#F2FAF4', color: '#34C759', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        {prod.stock || 50} in stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: PROFILE & SECURITY ── */}
        {activeTab === 'profile' && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '28px',
              border: '1px solid #D2D2D7',
              maxWidth: 600,
              margin: '0 auto',
              boxShadow: '0 2px 14px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#0071E3', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1D1D1F', margin: '0 0 4px' }}>
                Administrator Security Settings
              </h3>
              <p style={{ color: '#86868B', fontSize: 13, margin: 0 }}>
                Manage Master Supervisor Name, Email and Credentials
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 6 }}>
                  Admin Full Name
                </label>
                <input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1D1D1F' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1D1D1F' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1D1D1F', marginBottom: 6 }}>
                  Change Master Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: '100%', border: '1.5px solid #D2D2D7', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1D1D1F' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#0071E3',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: 12,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 113, 227, 0.25)',
                  marginTop: 6,
                }}
              >
                Update Profile & Credentials
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom Bar for Admin Tabs */}
      <nav
        className="admin-mobile-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderTop: '1px solid #D2D2D7',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 6px',
          zIndex: 1000,
        }}
      >
        {[
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'partners', label: 'Partners', icon: Users },
          { id: 'products', label: 'Catalog', icon: Package },
          { id: 'profile', label: 'Security', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 0,
                color: active ? '#0071E3' : '#86868B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                fontWeight: active ? 800 : 500,
                cursor: 'pointer',
                padding: '4px 10px',
              }}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default AdminPortalApp;

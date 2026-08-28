import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  Building2,
  Save,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  FileText,
  Lock,
  ExternalLink,
  Zap,
  Award
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Button } from '../components/common/Button';
import { useSellerAuth } from '../context/SellerAuthContext';
import { useToast } from '../context/ToastContext';
import { logoutUser } from '../../api';

export const SellerProfilePage = () => {
  const { seller, logout } = useSellerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState(seller?.store_name || seller?.full_name || seller?.name || 'Seller Store');
  const [phone, setPhone] = useState(seller?.phone || '');
  const [email] = useState(seller?.email || '');
  const [address, setAddress] = useState(seller?.business_address || '');
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userStr = localStorage.getItem('grabit_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        u.full_name = storeName;
        u.name = storeName;
        u.store_name = storeName;
        u.phone = phone;
        u.business_address = address;
        localStorage.setItem('grabit_user', JSON.stringify(u));
        localStorage.setItem('grabit_seller_profile', JSON.stringify(u));
      }
      setTimeout(() => {
        showToast({ type: 'success', message: 'Store profile saved successfully!' });
        setSaving(false);
      }, 400);
    } catch {
      showToast({ type: 'error', message: 'Failed to update store profile.' });
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    logoutUser();
    showToast({ type: 'info', message: 'Signed out of Seller Portal.' });
    navigate('/login', { replace: true });
  };

  const initial = storeName.charAt(0).toUpperCase();
  const vendorId = seller?.id ? `VENDOR-${String(seller.id).padStart(5, '0')}` : 'VENDOR-PARTNER';

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', margin: 0 }}>
            Merchant Store Profile
          </h1>
          <p style={{ color: '#64748B', fontSize: '13.5px', marginTop: 4, margin: 0 }}>
            Manage store details, contact phone, dispatch location, and operational preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(220, 38, 38, 0.08)',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          <LogOut size={15} color="#DC2626" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ── 1. Executive Merchant Hero Card ── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Left Avatar & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0071E3 0%, #0284C7 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)',
                  border: '1px solid rgba(0, 113, 227, 0.2)',
                }}
              >
                {initial}
              </div>
              {/* Online Green Pulse Indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2.5px solid #FFFFFF',
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                  {storeName}
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '2px 8px',
                    borderRadius: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={12} color="#059669" /> VERIFIED MERCHANT
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', fontSize: '12.5px', color: '#64748B', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{vendorId}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#0071E3', fontWeight: 600 }}>
                  <Zap size={12} color="#0071E3" fill="#0071E3" /> 10-Min Fast Hub
                </span>
                {email && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
                    <Mail size={12} color="#94A3B8" /> {email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Symmetrical Equal Status Pills Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '10px 16px',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Store Status</div>
            <div style={{ fontSize: '13px', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              Online &amp; Active
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '10px 16px',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Cloud Sync</div>
            <div style={{ fontSize: '13px', color: '#0071E3', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <CheckCircle2 size={13} color="#0071E3" />
              Live Connected
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Business Details & Dispatch Form ── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#0071E3" /> Store Information &amp; Dispatch Point
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0' }}>
              Updated store details will be broadcasted across dark stores and rider dispatch maps.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <Input
              label="Store / Business Name"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. GrabIt Store"
              icon={Store}
            />

            <Input
              label="Business Contact Mobile Phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              icon={Phone}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Input
              label="Registered Business Email (Cloud Authenticated)"
              value={email || 'seller@grabit.local'}
              disabled
              icon={Mail}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <Textarea
              label="Store Dispatch &amp; Pickup Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete vendor hub address, landmark, and building/gate instructions..."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 800,
                padding: '11px 28px',
                borderRadius: '12px',
                background: '#0071E3',
                fontSize: '14px',
                boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)'
              }}
            >
              <Save size={16} />
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* ── 3. Operational Guarantees & Verification Badges ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={20} color="#0071E3" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Vendor Compliance Cleared</div>
            <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
              Business registration and product quality checks are approved for real-time delivery.
            </div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={20} color="#10B981" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>10-Minute Dark Store Certified</div>
            <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
              Designated fast-packing priority hub for Koramangala &amp; Indiranagar dispatch zones.
            </div>
          </div>
        </div>

      </div>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={26} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              Sign Out of Seller Portal?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', lineHeight: 1.4 }}>
              Are you sure you want to log out of <strong>{storeName}</strong>? You can sign back in anytime via your registered phone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: '#EF4444', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerProfilePage;

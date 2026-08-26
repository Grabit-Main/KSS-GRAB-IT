import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../../context/DeliveryContext';
import { agentProfile } from '../../data/mockData';
import { AgentStatusPill } from '../AgentStatusPill';
import {
  User,
  ShieldCheck,
  Star,
  Bike,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileCheck,
  LogOut,
  CheckCircle2,
  Award,
  ChevronRight,
  Clock,
  BarChart2,
  Headphones,
  Package
} from 'lucide-react';

/* ─── Palette ─────────────────────────────────────────────── */
const C = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  graphite: '#1D1D1F',
  gray: '#8E8E93',
  border: '#E5E5EA',
  blue: '#0071E3',
  green: '#34C759',
  red: '#FF3B30',
  purple: '#AF52DE',
  orange: '#FF9500',
};

/* ─── Reusable row inside a card ──────────────────────────── */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  noBorder?: boolean;
}> = ({ icon, label, value, noBorder }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    paddingBottom: '12px',
    borderTop: noBorder ? 'none' : `1px solid ${C.border}`,
    gap: '12px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
      {icon}
      <span style={{ fontSize: '13px', color: C.gray, fontWeight: '600' }}>{label}</span>
    </div>
    <div style={{ fontSize: '13px', fontWeight: '700', color: C.graphite, textAlign: 'right', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {value}
    </div>
  </div>
);

/* ─── Card Section Header ─────────────────────────────────── */
const CardHeader: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  chevron?: boolean;
  onPress?: () => void;
}> = ({ icon, iconBg, title, chevron, onPress }) => (
  <div
    onClick={onPress}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '4px',
      cursor: onPress ? 'pointer' : 'default',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        backgroundColor: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '15px', fontWeight: '800', color: C.graphite, lineHeight: '1.2' }}>{title}</span>
    </div>
    {chevron && <ChevronRight size={18} color={C.border} />}
  </div>
);

/* ─── Green Verified Badge ────────────────────────────────── */
const VerifiedBadge = () => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: `${C.green}1A`,
    color: C.green,
    padding: '4px 10px',
    borderRadius: '20px',
    border: `1px solid ${C.green}40`,
    whiteSpace: 'nowrap',
  }}>
    <CheckCircle2 size={12} /> Verified
  </span>
);

/* ─── Main Screen ─────────────────────────────────────────── */
import { logoutUser } from '../../../api';

export const ProfileScreen: React.FC = () => {
  const { state, resetDemo } = useDelivery();
  const { stats } = state;
  const navigate = useNavigate();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('grabit_user') || '{}');
    } catch {
      return {};
    }
  })();
  const displayName = loggedInUser.name || loggedInUser.full_name || 'Delivery Partner';
  const displayPhone = loggedInUser.phone || agentProfile.phone;
  const displayEmail = loggedInUser.email || agentProfile.email;

  const handleSignOut = () => {
    resetDemo();
    setShowSignOutModal(false);
    logoutUser();
    navigate('/login', { replace: true });
  };

  const navCards = [
    { to: '/delivery/delivery-history', label: 'Delivery\nHistory', Icon: Clock, color: C.green, bg: `${C.green}18` },
    { to: '/delivery/performance',      label: 'Performance', Icon: BarChart2, color: C.green, bg: `${C.green}18` },
    { to: '/delivery/support',          label: 'Support',     Icon: Headphones, color: C.purple, bg: `${C.purple}18` },
  ];

  return (
    <div
      className="page-enter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: C.bg,
        minHeight: '100%',
      }}
    >

      {/* ── Profile Hero Card ──────────────────────────────── */}
      <div style={{ backgroundColor: C.card, borderRadius: '22px', padding: '22px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', position: 'relative' }}>

        {/* Dynamic Status Toggle Button — top right */}
        <div style={{ position: 'absolute', top: '18px', right: '18px', zIndex: 10 }}>
          <AgentStatusPill toggleOnly={true} />
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', marginTop: '6px' }}>
            <div style={{
              width: '84px', height: '84px', borderRadius: '50%',
              backgroundColor: C.graphite,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            }}>
              <User size={46} color="#FFFFFF" />
            </div>
            {/* Verified tick */}
            <div style={{
              position: 'absolute', bottom: '2px', right: '2px',
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: C.green, border: `2.5px solid ${C.card}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle2 size={14} color="#FFF" />
            </div>
          </div>

          {/* Name & badges */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: C.graphite, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              {displayName}
            </h1>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: `${C.blue}12`, border: `1px solid ${C.blue}28`, borderRadius: '20px', padding: '5px 14px', fontSize: '12.5px', fontWeight: '700', color: C.blue, marginBottom: '10px' }}>
              <CheckCircle2 size={13} /> Partner Verified
            </div>

            <p style={{ fontSize: '12.5px', color: C.gray, margin: '3px 0', fontWeight: '600' }}>
              Partner ID: <span style={{ color: C.graphite, fontWeight: '800' }}>{agentProfile.agentId}</span>
            </p>
            <p style={{ fontSize: '12px', color: C.gray, margin: '3px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <MapPin size={12} color={C.gray} />
              {agentProfile.hub}
            </p>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────── */}
        <div style={{ display: 'flex', marginTop: '20px', paddingTop: '18px', borderTop: `1px solid ${C.border}` }}>
          {/* Rating */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '3px' }}>
              <Star size={20} color="#D4A000" fill="#FFD60A" />
              <span style={{ fontSize: '26px', fontWeight: '800', color: C.graphite, letterSpacing: '-0.5px' }}>
                {stats.rating.toFixed(2)}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: C.gray, fontWeight: '600' }}>Rating</span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', backgroundColor: C.border, margin: '4px 0' }} />

          {/* Deliveries */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '3px' }}>
              <Package size={20} color={C.blue} />
              <span style={{ fontSize: '26px', fontWeight: '800', color: C.graphite, letterSpacing: '-0.5px' }}>
                {stats.totalDeliveries}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: C.gray, fontWeight: '600' }}>Lifetime Deliveries</span>
          </div>
        </div>
      </div>

      {/* ── Registered Vehicle Card ────────────────────────── */}
      <div style={{ backgroundColor: C.card, borderRadius: '22px', padding: '18px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <CardHeader
          iconBg={`${C.blue}14`}
          icon={<Bike size={20} color={C.blue} />}
          title="Registered Vehicle & Fleet"
          chevron
        />

        <InfoRow noBorder icon={<Bike size={16} color={C.gray} />} label="Vehicle" value={agentProfile.vehicle} />
        <InfoRow icon={<FileCheck size={16} color={C.gray} />} label="License Plate" value={agentProfile.plate} />
        <InfoRow icon={<Award size={16} color={C.gray} />} label="Driving License" value={agentProfile.drivingLicense} />
        <InfoRow
          icon={<ShieldCheck size={16} color={C.green} />}
          label="Commercial Permit"
          value={
            <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: `${C.green}18`, color: C.green, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${C.green}40` }}>
              Active & Compliant
            </span>
          }
        />
      </div>

      {/* ── Partner Verification Card ──────────────────────── */}
      <div style={{ backgroundColor: C.card, borderRadius: '22px', padding: '18px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <CardHeader
          iconBg={`${C.blue}14`}
          icon={<ShieldCheck size={20} color={C.blue} />}
          title="Partner Verification & Background Clearances"
        />

        {[
          { label: 'Driving License Check', sub: 'Govt. Transport Authority' },
          { label: 'Vehicle Insurance & Pollution', sub: 'Valid through Dec 2027' },
          { label: 'Criminal Background Check', sub: 'National Police Registry' },
          { label: 'Identity & Facial Biometrics', sub: 'GrabIt Trust & Safety ID' },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '12px', paddingBottom: '12px',
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: C.graphite, display: 'block' }}>{row.label}</span>
              <span style={{ fontSize: '11.5px', color: C.gray, marginTop: '1px', display: 'block' }}>{row.sub}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <VerifiedBadge />
              <ChevronRight size={15} color={C.border} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Contact & Operations Card ──────────────────────── */}
      <div style={{ backgroundColor: C.card, borderRadius: '22px', padding: '18px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <CardHeader
          iconBg={`${C.purple}18`}
          icon={<Headphones size={20} color={C.purple} />}
          title="Contact & Operations Info"
        />

        {/* Phone */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={16} color={C.gray} />
            <span style={{ fontSize: '13px', color: C.gray, fontWeight: '600' }}>Phone</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: C.graphite }}>{displayPhone}</span>
            <button
              id="profile-call-btn"
              onClick={() => window.open(`tel:${displayPhone.replace(/\s/g, '')}`)}
              style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `${C.blue}12`, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Phone size={15} color={C.blue} />
            </button>
          </div>
        </div>

        {/* Email */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={16} color={C.gray} />
            <span style={{ fontSize: '13px', color: C.gray, fontWeight: '600' }}>Email</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: C.graphite }}>{displayEmail}</span>
            <button
              id="profile-email-btn"
              onClick={() => window.open(`mailto:${displayEmail}`)}
              style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `${C.blue}12`, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Mail size={15} color={C.blue} />
            </button>
          </div>
        </div>

        {/* Member Since */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} color={C.gray} />
            <span style={{ fontSize: '13px', color: C.gray, fontWeight: '600' }}>Member Since</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: C.graphite }}>18 Jan 2024</span>
        </div>
      </div>

      {/* ── Quick Shortcuts Grid ──────────────────────────────── */}
      <div style={{
        backgroundColor: C.card, borderRadius: '22px', padding: '16px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
        justifyContent: 'center'
      }}>
        {navCards.map(({ to, label, Icon, color, bg }) => (
          <button
            key={to}
            id={`shortcut-${to.replace('/', '')}`}
            onClick={() => navigate(to)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '14px 6px',
              borderRadius: '16px', border: `1px solid ${color}20`,
              backgroundColor: bg, cursor: 'pointer',
              minHeight: '82px',
              transition: 'transform 0.12s, box-shadow 0.12s',
            }}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Icon size={26} color={color} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: C.graphite, textAlign: 'center', lineHeight: '1.25', whiteSpace: 'pre-line' }}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Sign Out Account Card ────────────────────────────── */}
      <div style={{ backgroundColor: C.card, borderRadius: '22px', padding: '16px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <button
          id="profile-signout-btn"
          onClick={() => setShowSignOutModal(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '14px',
            border: `1.5px solid ${C.red}30`,
            backgroundColor: `${C.red}08`,
            color: C.red,
            fontSize: '14.5px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${C.red}15`;
            e.currentTarget.style.borderColor = C.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `${C.red}08`;
            e.currentTarget.style.borderColor = `${C.red}30`;
          }}
        >
          <LogOut size={16} />
          <span>Sign Out of Delivery Session</span>
        </button>
      </div>

      {/* ── Sign Out Confirmation Modal ───────────────────────── */}
      {showSignOutModal && (
        <div className="modal-overlay" style={{ padding: '20px' }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '360px', width: '100%',
              padding: '28px 24px', textAlign: 'center',
              borderRadius: '28px',
              backgroundColor: C.card,
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: `${C.red}14`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px', border: `1.5px solid ${C.red}30`,
            }}>
              <LogOut size={28} color={C.red} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: C.graphite, margin: '0 0 8px' }}>
              Sign Out from Portal?
            </h3>
            <p style={{ fontSize: '14px', color: C.gray, margin: '0 0 26px', lineHeight: '1.55' }}>
              Are you sure you want to sign out from your active delivery partner session? You will be returned to the login screen.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowSignOutModal(false)}
                style={{
                  padding: '14px', borderRadius: '14px',
                  backgroundColor: '#F2F2F7', border: `1px solid ${C.border}`,
                  fontSize: '15px', fontWeight: '700', color: C.graphite, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                id="signout-confirm-btn"
                onClick={handleSignOut}
                style={{
                  padding: '14px', borderRadius: '14px',
                  backgroundColor: C.red, border: 'none',
                  fontSize: '15px', fontWeight: '700', color: '#FFFFFF', cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

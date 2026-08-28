import React from 'react';
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
export const ProfileScreen: React.FC = () => {
  const { state } = useDelivery();
  const { stats } = state;
  const navigate = useNavigate();

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('grabit_user') || '{}');
    } catch {
      return {};
    }
  })();
  const displayName = (loggedInUser.name && loggedInUser.name !== 'Speedy Express Delivery' && loggedInUser.name !== 'Delivery Partner')
    ? loggedInUser.name
    : agentProfile.name;
  const displayPhone = loggedInUser.phone || agentProfile.phone;
  const displayEmail = loggedInUser.email || agentProfile.email;

  const navCards = [
    { to: '/delivery/performance', label: 'Performance Analytics', Icon: BarChart2, color: C.blue, bg: 'rgba(0, 113, 227, 0.1)' },
    { to: '/delivery/support',     label: 'Partner Support & Help', Icon: Headphones, color: C.purple, bg: 'rgba(175, 82, 222, 0.1)' },
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
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: C.graphite, margin: '0 0 2px', letterSpacing: '-0.5px' }}>
              {displayName}
            </h1>
            <span style={{ fontSize: '13px', color: C.gray, fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              {displayPhone} • {displayEmail}
            </span>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: `${C.blue}12`, border: `1px solid ${C.blue}28`, borderRadius: '20px', padding: '5px 14px', fontSize: '12.5px', fontWeight: '700', color: C.blue, marginBottom: '10px' }}>
              <CheckCircle2 size={13} /> Partner Verified
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
              <p style={{ fontSize: '12.5px', color: C.gray, margin: 0, fontWeight: '600' }}>
                Partner ID: <span style={{ color: C.graphite, fontWeight: '800' }}>{agentProfile.agentId}</span>
              </p>
              <p style={{ fontSize: '12px', color: C.gray, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <MapPin size={12} color={C.gray} />
                {agentProfile.hub}
              </p>
              <p style={{ fontSize: '12px', color: C.gray, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Bike size={12} color={C.gray} />
                {agentProfile.vehicle} • {agentProfile.plate}
              </p>
            </div>
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

      {/* ── Quick Action Shortcuts ──────────────────────────────── */}
      <div style={{
        backgroundColor: C.card, borderRadius: '22px', padding: '6px 18px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column'
      }}>
        {navCards.map(({ to, label, Icon, color, bg }, idx) => (
          <button
            key={to}
            id={`shortcut-${to.replace('/', '')}`}
            onClick={() => navigate(to)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: idx < navCards.length - 1 ? `1px solid ${C.border}` : 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={20} color={color} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: C.graphite }}>
                {label}
              </span>
            </div>

            <ChevronRight size={18} color={C.gray} />
          </button>
        ))}
      </div>

    </div>
  );
};

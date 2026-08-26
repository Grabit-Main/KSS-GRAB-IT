import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Flame, Truck, Gift, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import useWindowWidth from '../../hooks/useWindowWidth';

const ANNOUNCEMENTS = [
  { text: '⚡ 15-Min Express Delivery Active in Banaswadi', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', icon: <Zap size={13} fill="#16A34A" color="#16A34A" /> },
  { text: '🎁 Code: GRABIT50 for 50% OFF on 1st Order', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', icon: <Gift size={13} color="#D97706" /> },
  { text: '🚚 FREE Delivery on All Orders Above ₹199', bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE', icon: <Truck size={13} color="#2563EB" /> },
  { text: '🪢 Raksha Bandhan & Onam Festival Deals Live!', bg: '#FCE7F3', color: '#9D174D', border: '#FBCFE8', icon: <Sparkles size={13} color="#DB2777" /> },
];

export default function FestiveSubHeader() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % ANNOUNCEMENTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const currentTicker = ANNOUNCEMENTS[tickerIndex];

  const pills = [
    {
      id: 'rakhi',
      label: 'Raksha Bandhan Store',
      icon: '🪢',
      bg: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
      color: '#9F1239',
      border: '#FECDD3',
      badge: 'SPECIAL',
      badgeBg: '#E11D48',
      link: '/festival/raksha-bandhan',
      glow: 'rgba(225, 29, 72, 0.25)'
    },
    {
      id: 'onam',
      label: 'Onam Sadya Store',
      icon: '🌾',
      bg: 'linear-gradient(135deg, #FEFCE8 0%, #FEF08A 100%)',
      color: '#854D0E',
      border: '#FDE047',
      badge: 'FESTIVAL',
      badgeBg: '#D97706',
      link: '/festival/onam',
      glow: 'rgba(217, 119, 6, 0.25)'
    },
    {
      id: 'under99',
      label: 'Under ₹99 Store',
      icon: '⚡',
      bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      color: '#065F46',
      border: '#A7F3D0',
      badge: 'BUDGET',
      badgeBg: '#059669',
      action: () => scrollToSection('grabit-deals-section'),
      glow: 'rgba(5, 150, 105, 0.25)'
    },
    {
      id: 'super-savers',
      label: 'Super Savers (Up to 50% OFF)',
      icon: '🔥',
      bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
      color: '#9A3412',
      border: '#FDBA74',
      badge: 'HOT',
      badgeBg: '#EA580C',
      action: () => scrollToSection('grabit-deals-section'),
      glow: 'rgba(234, 88, 12, 0.25)'
    },
    {
      id: 'dairy-fresh',
      label: 'Dairy & Fresh Produce',
      icon: '🥛',
      bg: '#F0F9FF',
      color: '#0369A1',
      border: '#BAE6FD',
      link: '/category/dairy-bakery'
    },
    {
      id: 'snacks-munchies',
      label: 'Snacks & Drinks',
      icon: '🍿',
      bg: '#FAF5FF',
      color: '#6B21A8',
      border: '#E9D5FF',
      link: '/category/snacks-munchies'
    },
    {
      id: 'buy-again',
      label: 'Buy Again',
      icon: '🔁',
      bg: '#F8FAFC',
      color: '#0F172A',
      border: '#CBD5E1',
      link: '/orders'
    }
  ];

  return (
    <div style={{
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
      padding: isMobile ? '8px 10px' : '9px 0',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', flexWrap: isMobile ? 'nowrap' : 'nowrap'
        }}>
          
          {/* ⚡ LEFT ZONE: LIVE ANIMATED TICKER (DESKTOP & TABLET) */}
          {!isMobile && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: currentTicker.bg, color: currentTicker.color,
              border: `1px solid ${currentTicker.border}`,
              padding: '6px 14px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap',
              flexShrink: 0, transition: 'all 0.4s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {currentTicker.icon}
              </div>
              <span className="animate-ticker-fade" key={tickerIndex}>
                {currentTicker.text}
              </span>
            </div>
          )}

          {/* 🪢 RIGHT ZONE: HORIZONTAL SCROLLING CURATED PILLS */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px',
            overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
            flex: 1, paddingBottom: isMobile ? '2px' : '0'
          }}>
            {pills.map((pill) => {
              const Content = (
                <div
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: pill.bg, color: pill.color,
                    border: `1.5px solid ${pill.border}`,
                    padding: isMobile ? '6px 12px' : '6px 14px',
                    borderRadius: '20px',
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = pill.glow ? `0 6px 18px ${pill.glow}` : '0 6px 16px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                  }}
                  onClick={pill.action ? pill.action : undefined}
                >
                  <span style={{ fontSize: isMobile ? '12px' : '14px' }}>{pill.icon}</span>
                  <span>{pill.label}</span>
                  {pill.badge && (
                    <span style={{
                      background: pill.badgeBg, color: '#FFFFFF',
                      fontSize: '8px', fontWeight: 900,
                      padding: '2px 5px', borderRadius: '8px',
                      letterSpacing: '0.04em'
                    }} className="animate-badge-pulse">
                      {pill.badge}
                    </span>
                  )}
                </div>
              );

              if (pill.link) {
                return (
                  <Link key={pill.id} to={pill.link} style={{ textDecoration: 'none' }}>
                    {Content}
                  </Link>
                );
              }

              return <div key={pill.id}>{Content}</div>;
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

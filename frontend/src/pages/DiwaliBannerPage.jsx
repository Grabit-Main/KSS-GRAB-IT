import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShoppingBag, Zap, Flame } from 'lucide-react';
import useWindowWidth from '../hooks/useWindowWidth';

export default function DiwaliBannerPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;

  return (
    <div style={{ background: '#0B0F19', color: '#FFFFFF', minHeight: '100vh', padding: isMobile ? '16px 12px 60px' : '40px 24px 80px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link to="/" style={{ color: '#FDE047', textDecoration: 'none', fontSize: '14px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={18} /> Back to Grabit
          </Link>
          <div style={{ background: 'rgba(253, 224, 71, 0.15)', border: '1px solid rgba(253, 224, 71, 0.3)', color: '#FEF08A', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#FDE047" /> OFFICIAL DIWALI 2026 HERO BANNER
          </div>
        </div>

        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: isMobile ? '24px' : '36px', fontWeight: 900, color: '#FFD700', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            🪔 Grabit Diwali Festive Banner
          </h1>
          <p style={{ color: '#94A3B8', fontSize: isMobile ? '13px' : '16px', maxWidth: '600px', margin: '0 auto' }}>
            Animated Deepak (Diya) fire glow, ornate gold filigree details, and Grabit company logo branding.
          </p>
        </div>

        {/* MAIN ANIMATED BANNER DISPLAY CONTAINER */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(212, 175, 55, 0.25)',
          border: '2px solid #D4AF37',
          background: '#280106'
        }}>
          <embed
            src="/diwali-banner-grabit.svg"
            type="image/svg+xml"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginTop: '36px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}>
              <Flame size={20} /> Animated Deepak Fire Flame
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              Realistic CSS keyframe flickering and radial glow animation on the traditional terracotta diya wick.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ color: '#FDE047', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}>
              <Sparkles size={20} /> Ornate Gold &amp; Maroon Aesthetic
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              Rich royal burgundy background with gold filigree corner borders, hanging diyas, and glowing mandala art.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}>
              <Zap size={20} /> Grabit Quick Commerce Branding
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              Includes official Grabit logo typography, "Express 10-Min Delivery" badge, and "Shop Diwali Offers" CTA button.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '36px', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            background: 'linear-gradient(135deg, #F5B041 0%, #D4AC0D 100%)',
            color: '#3B0209',
            padding: '14px 28px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 900,
            fontSize: '15px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(245, 176, 65, 0.4)'
          }}>
            <ShoppingBag size={18} /> Shop Diwali Sweets &amp; Gifts
          </Link>

          <a href="/diwali-banner-grabit.svg" download="diwali-banner-grabit.svg" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '14px 28px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '15px'
          }}>
            📥 Download SVG Vector
          </a>
        </div>

      </div>
    </div>
  );
}

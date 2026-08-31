import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Zap, MapPin, Tag, Shield, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import ProductSvg from '../components/common/ProductSvg';
import ProductSuggestionModal from '../../components/common/ProductSuggestionModal';
import Suggest3dGraphic from '../../components/common/Suggest3dGraphic';
import { products } from '../data/products';
import { categories, getCanonicalSlug } from '../data/categories';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import useWindowWidth from '../hooks/useWindowWidth';

import AnimatedCombosSection from '../components/home/AnimatedCombosSection';
import CustomerReviewSection from '../../components/common/CustomerReviewSection';

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { wishlistItems } = useWishlist();
  const { items, addItem, updateQty, getItemQty } = useCart();
  const [addedBundleId, setAddedBundleId] = useState(null);
  const [selectedComboModal, setSelectedComboModal] = useState(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide(prev => (prev + 1) % 3), 5000);
    return () => clearInterval(timer);
  }, []);

  const popularProducts = useMemo(() => {
    return products.filter(p => ['snacks','dairy','beverages','staples','household'].includes(p.category)).slice(0, isMobile ? 6 : 12);
  }, [isMobile]);

  const snackProducts = useMemo(() => {
    return products.filter(p => p.category === 'snacks').slice(0, isMobile ? 6 : 12);
  }, [isMobile]);

  const dealProducts = useMemo(() => {
    return products.filter(p => p.discount >= 18).slice(0, isMobile ? 6 : 12);
  }, [isMobile]);
  const wishlistProducts = products.filter(p => ['dairy','beverages','staples','personal-care'].includes(p.category)).slice(0, isMobile ? 6 : 12);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Responsive grid columns
  const prodCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)';
  const catCols  = isMobile ? 'repeat(4, 1fr)' : isTablet ? 'repeat(5, 1fr)' : 'repeat(7, 1fr)';

  // Image-Color Matched Hero Banners with Soft Light Pastel Backgrounds
  const slides = [
    {
      // 1. LIGHT ICE BLUE PASTEL GRADIENT
      bg: 'linear-gradient(135deg, #EEF4FF 0%, #E0EDFF 50%, #C7DDFE 100%)',
      border: '#BFDBFE',
      badge: '⚡ 30-45 MIN EXPRESS DELIVERY',
      badgeBg: '#FFFFFF', badgeBorder: '#93C5FD', badgeColor: '#0066FF',
      textColor: '#0F172A', subtextColor: '#334155',
      title: <>Discover. <span style={{ color: '#0066FF' }}>Shop.</span> Save More.</>,
      subtitle: 'Top brands, best prices & exclusive hyperlocal offers on everything you love.',
      btn1: { label: 'Shop Now', bg: '#0066FF', color: '#FFFFFF', shadow: '0 4px 16px rgba(0,102,255,0.35)', action: () => scrollToSection('categories-grid'), icon: <ArrowRight size={16} /> },
      btn2: { label: 'Explore Offers', bg: '#FFFFFF', color: '#0066FF', border: '1.5px solid #93C5FD', action: () => scrollToSection('grabit-deals-section') },
      img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645109/grabit_media/savings_basket_clock_transparent.png',
      imgAlt: '3D Blue Grabit Savings Basket with Clock & 5km Pin',
      imgFilter: 'drop-shadow(0 12px 24px rgba(0,102,255,0.15))',
      discountVal: '50%',
      discountColor: '#0066FF',
    },
    {
      // 2. LIGHT MINT GREEN PASTEL GRADIENT
      bg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)',
      border: '#A7F3D0',
      badge: '🍃 FARM FRESH GUARANTEED',
      badgeBg: '#FFFFFF', badgeBorder: '#86EFAC', badgeColor: '#059669',
      textColor: '#0F172A', subtextColor: '#334155',
      title: <>Fresh Groceries, <span style={{ color: '#059669' }}>Delivered Fresh</span></>,
      subtitle: 'Handpicked organic fruits, vegetables & daily essentials delivered to your doorstep.',
      btn1: { label: 'Shop Groceries', bg: '#059669', color: '#FFFFFF', shadow: '0 4px 16px rgba(5,150,105,0.35)', link: '/category/produce', icon: <ArrowRight size={16} /> },
      btn2: { label: 'Explore Deals', bg: '#FFFFFF', color: '#059669', border: '1.5px solid #86EFAC', link: '/category/produce' },
      img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png',
      imgAlt: 'Fresh Produce Basket',
      imgFilter: 'drop-shadow(0 12px 24px rgba(5,150,105,0.15))',
      discountVal: '30%',
      discountColor: '#059669',
    },
    {
      // 3. RICH WARM AMBER GOLDEN SNACK FEAST GRADIENT
      bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)',
      border: '#FDBA74',
      badge: '⭐ CRUNCHY. TASTY. IRRESISTIBLE.',
      badgeBg: '#FFFFFF', badgeBorder: '#FDBA74', badgeColor: '#D97706',
      textColor: '#1D1D1F', subtextColor: '#475569',
      title: <>Snacks for <span style={{ color: '#D97706' }}>Every Craving</span></>,
      subtitle: 'From popcorn & crunchy chips to cookies, nachos & treats – we\'ve got it all.',
      btn1: { label: 'Shop Snacks', bg: '#D97706', color: '#FFFFFF', shadow: '0 4px 16px rgba(217,119,6,0.35)', link: '/category/snacks-munchies', icon: <ArrowRight size={16} /> },
      btn2: { label: 'View All', bg: '#FFFFFF', color: '#D97706', border: '1.5px solid #FDBA74', link: '/category/snacks-munchies' },
      img: '/category-snacks-banner.png',
      imgAlt: 'Lay\'s Classic Salted, Pringles & Bowl of Chips',
      imgFilter: 'drop-shadow(0 14px 28px rgba(217,119,6,0.25))',
      discountVal: '40%',
      discountColor: '#D97706',
    },
  ];

  const CRAVING_BUNDLES = [
    {
      id: 'bundle-chai',
      title: '☕ Chai & Snack Pack',
      subtitle: "Lay's Chips + Haldiram Bhujia",
      itemIds: [4, 10],
      comboPrice: 70,
      oldPrice: 80,
      saveText: 'SAVE ₹10',
      img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645123/grabit_media/combo_chai.jpg',
      bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
      border: '#FDBA74',
      badgeColor: '#D97706',
      btnBg: '#D97706'
    },
    {
      id: 'bundle-movie',
      title: '🍿 Movie Night Chill Combo',
      subtitle: "Doritos Chips + Coca-Cola",
      itemIds: [2, 47],
      comboPrice: 80,
      oldPrice: 95,
      saveText: 'SAVE ₹15',
      img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645116/grabit_media/combo_movie.jpg',
      bg: 'linear-gradient(135deg, #EEF4FF 0%, #E0EDFF 100%)',
      border: '#BFDBFE',
      badgeColor: '#0066FF',
      btnBg: '#0066FF'
    },
    {
      id: 'bundle-fresh',
      title: '🍎 Healthy Breakfast Combo',
      subtitle: "Amul Butter + Toned Milk",
      itemIds: [24, 25],
      comboPrice: 120,
      oldPrice: 136,
      saveText: 'SAVE ₹16',
      img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645103/grabit_media/combo_fresh.jpg',
      bg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
      border: '#A7F3D0',
      badgeColor: '#059669',
      btnBg: '#059669'
    },
    {
      id: 'bundle-sweet',
      title: '🍫 Chocolate Craving Combo',
      subtitle: "Cadbury Silk + KitKat Bar",
      itemIds: [95, 97],
      comboPrice: 175,
      oldPrice: 215,
      saveText: 'SAVE ₹40',
      img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645077/grabit_media/combo_sweet.jpg',
      bg: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
      border: '#E9D5FF',
      badgeColor: '#7E22CE',
      btnBg: '#7E22CE'
    }
  ];

  const handleAddBundle = (bundle) => {
    bundle.itemIds.forEach(id => {
      const prod = products.find(p => p.id === id);
      if (prod) addItem(prod);
    });
    setAddedBundleId(bundle.id);
    setTimeout(() => setAddedBundleId(null), 2500);
  };

  return (
    <div className="professional-design-background" style={{ minHeight: '100vh', paddingBottom: '48px', position: 'relative' }}>
      {/* 🌟 LUXURY AMBIENT FLOATING DESIGN LIGHTS */}
      <div className="ambient-bg-orb-top" />
      <div className="ambient-bg-orb-mid" />
      <div className="ambient-bg-orb-bottom" />

      {/* ── 1. HERO CAROUSEL ─────────────────────── */}
      <div className="container" style={{ paddingTop: isMobile ? '0px' : '24px', marginBottom: isMobile ? '16px' : '36px', position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'relative',
          borderRadius: isMobile ? '16px' : '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          background: slides[activeSlide].bg,
          border: `1px solid ${slides[activeSlide].border}`,
          transition: 'background 0.4s ease',
          minHeight: isMobile ? '260px' : '400px',
        }}>
          {slides.map((slide, idx) => (
            <div
              key={idx}
              style={{
                position: isMobile ? 'relative' : 'absolute', inset: 0,
                opacity: activeSlide === idx ? 1 : 0,
                display: activeSlide === idx ? 'flex' : 'none',
                pointerEvents: activeSlide === idx ? 'all' : 'none',
                transition: 'opacity 0.4s ease-in-out',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '16px 14px 28px' : '36px 64px',
                gap: isMobile ? '12px' : '24px',
                overflow: 'hidden'
              }}
            >
              {/* Left text with slide-up animation */}
              <div
                className={activeSlide === idx ? 'animate-text-appear' : ''}
                style={{
                  maxWidth: isMobile ? '100%' : '520px',
                  width: isMobile ? '100%' : 'auto',
                  flexShrink: 0,
                  zIndex: 5,
                  textAlign: isMobile ? 'center' : 'left'
                }}
              >
                {slide.badge && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: slide.badgeBg, border: `1px solid ${slide.badgeBorder}`, color: slide.badgeColor,
                    padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800,
                    marginBottom: isMobile ? '6px' : '14px', letterSpacing: '0.5px', backdropFilter: 'blur(4px)'
                  }}>
                    {slide.badge}
                  </div>
                )}
                <h1 style={{
                  fontSize: isMobile ? '20px' : '36px',
                  fontWeight: 900, lineHeight: 1.15, color: slide.textColor || '#0F172A',
                  marginBottom: isMobile ? '6px' : '14px',
                  letterSpacing: '-0.03em'
                }}>
                  {slide.title}
                </h1>
                <p style={{
                  fontSize: isMobile ? '12px' : '15px',
                  color: slide.subtextColor || '#334155', marginBottom: isMobile ? '14px' : '28px',
                  lineHeight: 1.5, fontWeight: 500
                }}>
                  {slide.subtitle}
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                  {slide.btn1.link ? (
                    <Link to={slide.btn1.link} style={{ textDecoration: 'none' }}>
                      <button style={{
                        background: slide.btn1.bg, color: slide.btn1.color,
                        fontSize: isMobile ? '12px' : '14px', fontWeight: 800,
                        padding: isMobile ? '9px 18px' : '12px 30px',
                        borderRadius: '10px', border: 'none',
                        boxShadow: slide.btn1.shadow || 'none', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                      >
                        {slide.btn1.label} {slide.btn1.icon}
                      </button>
                    </Link>
                  ) : (
                    <button onClick={slide.btn1.action} style={{
                      background: slide.btn1.bg, color: slide.btn1.color,
                      fontSize: isMobile ? '12px' : '14px', fontWeight: 800,
                      padding: isMobile ? '9px 18px' : '12px 30px',
                      borderRadius: '10px', border: 'none',
                      boxShadow: slide.btn1.shadow || 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      {slide.btn1.label}
                    </button>
                  )}
                  {slide.btn2.link ? (
                    <Link to={slide.btn2.link} style={{ textDecoration: 'none' }}>
                      <button style={{
                        background: slide.btn2.bg, color: slide.btn2.color,
                        fontSize: isMobile ? '12px' : '14px', fontWeight: 800,
                        padding: isMobile ? '9px 18px' : '12px 30px',
                        borderRadius: '10px', border: slide.btn2.border || 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = slide.btn2.bg; e.currentTarget.style.transform = 'none'; }}
                      >
                        {slide.btn2.label}
                      </button>
                    </Link>
                  ) : (
                    <button onClick={slide.btn2.action} style={{
                      background: slide.btn2.bg, color: slide.btn2.color,
                      fontSize: isMobile ? '12px' : '14px', fontWeight: 800,
                      padding: isMobile ? '9px 18px' : '12px 30px',
                      borderRadius: '10px', border: slide.btn2.border || 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                      backdropFilter: 'blur(4px)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = slide.btn2.bg; e.currentTarget.style.transform = 'none'; }}
                    >
                      {slide.btn2.label}
                    </button>
                  )}
                </div>
              </div>

              {/* Right image container */}
              <div style={{
                flexShrink: 0, zIndex: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                width: isMobile ? '100%' : 'auto',
                marginTop: isMobile ? '4px' : '0'
              }}>

                {/* 🚀 ADVANCED ANIMATION OVERLAYS FOR SLIDE 1 (EXPRESS BASKET & CLOCK) */}
                {idx === 0 && (
                  <>
                    {/* ⚡ Animated Express Speed Dash Trails */}
                    <div style={{
                      position: 'absolute', left: isMobile ? '-20px' : '-40px', bottom: isMobile ? '30px' : '70px',
                      display: 'flex', flexDirection: 'column', gap: '8px',
                      zIndex: 3, pointerEvents: 'none'
                    }}>
                      {[
                        { width: isMobile ? '45px' : '70px', height: '4px', delay: '0s' },
                        { width: isMobile ? '60px' : '95px', height: '5px', delay: '0.3s' },
                        { width: isMobile ? '40px' : '60px', height: '3px', delay: '0.6s' },
                        { width: isMobile ? '55px' : '80px', height: '4px', delay: '0.9s' }
                      ].map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className="animate-speed-line"
                          style={{
                            width: line.width, height: line.height,
                            borderRadius: '3px',
                            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(56,189,248,0.9) 60%, rgba(255,255,255,0.95) 100%)',
                            boxShadow: '0 0 10px rgba(56,189,248,0.8)',
                            animationDelay: line.delay
                          }}
                        />
                      ))}
                    </div>

                    {/* 📍 Floating Sonar Pulse Beacon over 5km Location Pin */}
                    <div style={{
                      position: 'absolute', right: isMobile ? '15px' : '31px', top: isMobile ? '110px' : '168px',
                      width: '32px', height: '32px',
                      zIndex: 5, pointerEvents: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div className="animate-sonar-beacon" style={{
                        position: 'absolute', width: '36px', height: '36px',
                        borderRadius: '50%', background: 'rgba(56, 189, 248, 0.4)',
                        border: '2px solid rgba(255, 255, 255, 0.8)'
                      }} />
                    </div>
                  </>
                )}

                {/* 🍅 🥕 🥑 🌽 REVOLVING ORBITAL RING WITH EXTRACTED VEGETABLE CUTOUTS (Slide 2) */}
                {idx === 1 && (
                  <>
                    <div
                      className="animate-stage-glow"
                      style={{
                        position: 'absolute',
                        width: isMobile ? '230px' : '360px', height: isMobile ? '230px' : '360px',
                        background: 'radial-gradient(circle, rgba(74, 222, 128, 0.28) 0%, rgba(15, 157, 88, 0.14) 50%, rgba(0,0,0,0) 75%)',
                        borderRadius: '50%',
                        filter: 'blur(16px)',
                        zIndex: 1, pointerEvents: 'none'
                      }}
                    />

                    <div
                      className="animate-orbit-ring"
                      style={{
                        position: 'absolute',
                        width: isMobile ? '210px' : '320px', height: isMobile ? '210px' : '320px',
                        borderRadius: '50%',
                        zIndex: 4, pointerEvents: 'none'
                      }}
                    >
                      {[
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645150/grabit_media/veg_1.png', size: isMobile ? 22 : 32, top: '-10px', left: '50%', transform: 'translateX(-50%)' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645148/grabit_media/veg_2.png', size: isMobile ? 19 : 28, top: '12%', right: '0px' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645146/grabit_media/veg_4.png', size: isMobile ? 21 : 30, top: '45%', right: '-10px' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645146/grabit_media/veg_5.png', size: isMobile ? 19 : 28, bottom: '12%', right: '2px' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645150/grabit_media/veg_3.png', size: isMobile ? 18 : 26, bottom: '-10px', left: '50%', transform: 'translateX(-50%)' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645147/grabit_media/veg_6.png', size: isMobile ? 19 : 28, bottom: '12%', left: '2px' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645147/grabit_media/veg_7.png', size: isMobile ? 18 : 26, top: '45%', left: '-10px' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645156/grabit_media/veg_8.png', size: isMobile ? 18 : 26, top: '12%', left: '0px' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645157/grabit_media/veg_9.png', size: isMobile ? 17 : 24, top: '0px', left: '24%' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645155/grabit_media/veg_10.png', size: isMobile ? 17 : 25, top: '0px', right: '24%' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645155/grabit_media/veg_11.png', size: isMobile ? 17 : 24, bottom: '2px', left: '26%' },
                        { src: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645156/grabit_media/veg_12.png', size: isMobile ? 17 : 24, bottom: '2px', right: '26%' },
                      ].map((veg, vIdx) => (
                        <div
                          key={vIdx}
                          style={{
                            position: 'absolute',
                            top: veg.top, left: veg.left, right: veg.right, bottom: veg.bottom,
                            transform: veg.transform || 'none',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                          }}
                        >
                          <div className="animate-orbit-item">
                            <img src={veg.src} alt="Fresh Veg" style={{ width: `${veg.size}px`, height: 'auto', objectFit: 'contain' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* 🔥 HIGH-ENERGY DYNAMIC SNACK ANIMATIONS FOR SLIDE 3 */}
                {idx === 2 && (
                  <>
                    {/* Fiery Pulsating Energy Aura */}
                    <div
                      className="animate-flame-aura"
                      style={{
                        position: 'absolute',
                        width: isMobile ? '260px' : '420px', height: isMobile ? '200px' : '320px',
                        background: 'radial-gradient(circle, rgba(253, 224, 71, 0.45) 0%, rgba(239, 68, 68, 0.3) 40%, rgba(185, 28, 28, 0.1) 75%)',
                        borderRadius: '50%',
                        zIndex: 1, pointerEvents: 'none'
                      }}
                    />

                    {/* ✨ Ascending Golden Sparkle Particles */}
                    {[
                      { top: '80%', left: '15%', delay: '0s' },
                      { top: '70%', left: '80%', delay: '0.6s' },
                      { top: '85%', left: '45%', delay: '1.2s' },
                      { top: '60%', left: '90%', delay: '1.8s' },
                    ].map((p, pIdx) => (
                      <div key={pIdx} className="animate-particle-up" style={{
                        position: 'absolute', top: p.top, left: p.left,
                        animationDelay: p.delay, zIndex: 5, pointerEvents: 'none'
                      }}>
                        <Sparkles size={isMobile ? 14 : 18} color="#FDE047" />
                      </div>
                    ))}
                  </>
                )}

                {/* ✨ Pulsing Glowing Stage Base */}
                <div
                  className="animate-stage-glow"
                  style={{
                    position: 'absolute', bottom: '-15px',
                    width: '300px', height: '40px',
                    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    filter: 'blur(12px)', zIndex: 1
                  }}
                />

                {/* 🏷️ Pulsing Floating Discount Badge */}
                {slide.discountVal && !isMobile && (
                  <div
                    className="animate-badge-pulse"
                    style={{
                      position: 'absolute', top: '10px', left: '-30px',
                      width: '76px', height: '76px', borderRadius: '50%',
                      background: '#FFFFFF', color: '#0F172A',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10, textAlign: 'center', padding: '4px'
                    }}
                  >
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>UP TO</span>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: slide.discountColor, lineHeight: 1 }}>{slide.discountVal}</span>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#0F172A' }}>OFF</span>
                  </div>
                )}

                {/* 🎈 Floating Central Hero Image */}
                <img
                  src={slide.img}
                  alt={slide.imgAlt}
                  className="animate-hero-float"
                  style={{
                    height: isMobile ? '145px' : isTablet ? '260px' : '310px',
                    width: 'auto', objectFit: 'contain',
                    filter: slide.imgFilter,
                    position: 'relative', zIndex: 2
                  }}
                />
              </div>
            </div>
          ))}

          {/* ⬅️ LEFT NAVIGATION ARROW */}
          <button
            aria-label="Previous Slide"
            onClick={() => setActiveSlide(prev => (prev - 1 + slides.length) % slides.length)}
            style={{
              position: 'absolute', left: isMobile ? '8px' : '20px', top: '50%', transform: 'translateY(-50%)',
              width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 20, color: '#0F172A',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
            }}
          >
            <ChevronLeft size={isMobile ? 18 : 24} color="#0F172A" />
          </button>

          {/* ➡️ RIGHT NAVIGATION ARROW */}
          <button
            aria-label="Next Slide"
            onClick={() => setActiveSlide(prev => (prev + 1) % slides.length)}
            style={{
              position: 'absolute', right: isMobile ? '8px' : '20px', top: '50%', transform: 'translateY(-50%)',
              width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 20, color: '#0F172A',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
            }}
          >
            <ChevronRight size={isMobile ? 18 : 24} color="#0F172A" />
          </button>

          {/* 🔴 PAGINATION DOTS STRIP */}
          <div style={{
            position: 'absolute', bottom: isMobile ? '8px' : '14px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: '6px', zIndex: 20,
            padding: '4px 10px', borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            boxSizing: 'border-box'
          }}>
            {slides.map((s, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                aria-label={`Go to slide ${dotIdx + 1}`}
                onClick={() => setActiveSlide(dotIdx)}
                style={{
                  border: 'none', padding: 0, margin: 0, cursor: 'pointer',
                  width: activeSlide === dotIdx ? '20px' : '6px',
                  height: '6px',
                  minHeight: '6px',
                  maxHeight: '6px',
                  borderRadius: '6px',
                  background: activeSlide === dotIdx ? (s.discountColor || '#0066FF') : 'rgba(15, 23, 42, 0.22)',
                  boxShadow: activeSlide === dotIdx ? `0 1px 4px ${s.discountColor}55` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'block',
                  flexShrink: 0
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div id="categories-grid" className="container" style={{ paddingTop: isMobile ? '12px' : '16px', marginBottom: isMobile ? '20px' : '32px', position: 'relative', zIndex: 2 }}>
        <div className="professional-card" style={{
          borderRadius: isMobile ? '18px' : '22px',
          padding: isMobile ? '18px 12px' : '26px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '14px' : '18px' }}>
            <h2 style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 900, color: '#1D1D1F', margin: 0, letterSpacing: '-0.02em' }}>
              Categories
            </h2>
            <Link to="/categories" style={{ fontSize: '13px', color: '#0071E3', fontWeight: 800, textDecoration: 'none' }}>
              View all
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: catCols, gap: isMobile ? '8px' : '14px' }}>
            {categories.slice(0, isMobile ? 8 : 12).map((cat, idx) => {
              const catSlug = getCanonicalSlug(cat.slug || cat.name || cat.id);
              return (
                <Link
                  key={cat.id || cat.slug || idx}
                  to={`/category/${catSlug}`}
                  className="category-tile-modern"
                  style={{
                    textDecoration: 'none',
                    borderRadius: isMobile ? '12px' : '14px',
                    padding: isMobile ? '12px 6px 10px' : '16px 12px 14px',
                    textAlign: 'center',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <div style={{ height: isMobile ? '48px' : '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '5px' : '8px' }}>
                    <ProductSvg name={cat.image_url || cat.image || cat.icon || cat.slug} size={isMobile ? 42 : 65} />
                  </div>
                  <span style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 700, color: '#1D1D1F', lineHeight: 1.2 }}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. PROMO BANNERS ─────────────────────── */}
      <div className="container" style={{ paddingTop: '4px', marginBottom: isMobile ? '20px' : '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? '10px' : '16px' }}>

          {[
            { bg: '#EEF4FF', border: '#DBEAFE', title: 'Pharmacy at\nyour doorstep!', sub: 'Cough, syrups, pain relief.', btnColor: '#34C759', img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645058/grabit_media/promo_pharmacy.png', link: '/category/personal-care' },
            { bg: '#FFF9F0', border: '#FFEAD0', title: 'Pet care supplies\nat your door', sub: 'Food, treats, toys & more.', btnColor: '#FF9500', img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645066/grabit_media/promo_petcare.png', link: '/category/household' },
            { bg: '#F0FFF4', border: '#DCFCE7', title: 'No time for\na diaper run?', sub: 'Get baby care essentials.', btnColor: '#0071E3', img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645081/grabit_media/promo_baby.png', link: '/category/personal-care' },
          ].map((promo, i) => (
            <div key={i} style={{
              background: promo.bg, borderRadius: '14px',
              padding: isMobile ? '16px' : '20px 18px',
              border: `1px solid ${promo.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '120px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ maxWidth: '160px', zIndex: 2 }}>
                <h3 style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 800, color: '#1D1D1F', marginBottom: '4px', whiteSpace: 'pre-line' }}>
                  {promo.title}
                </h3>
                <p style={{ fontSize: '11px', color: '#86868B', marginBottom: '12px' }}>{promo.sub}</p>
                <Link to={promo.link}>
                  <button style={{
                    background: 'white', border: `1px solid ${promo.btnColor}`, color: promo.btnColor,
                    borderRadius: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                  }}>
                    Order Now
                  </button>
                </Link>
              </div>
              <img src={promo.img} alt={promo.title} style={{ height: isMobile ? '90px' : '110px', width: 'auto', objectFit: 'contain' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. POPULAR NEAR YOU ──────────────────── */}
      <div className="container" style={{ paddingTop: '4px', marginBottom: isMobile ? '20px' : '32px' }}>
        <div style={{
          background: '#FFFFFF', borderRadius: isMobile ? '14px' : '16px',
          border: '1px solid #D2D2D7', padding: isMobile ? '16px 12px' : '24px',
          boxShadow: '0 1px 3px rgba(29,29,31,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '14px' : '18px' }}>
            <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: '#1D1D1F', margin: 0 }}>Popular Near You</h2>
            <Link to="/search?q=trending" style={{ fontSize: '13px', color: '#0071E3', fontWeight: 700, textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: prodCols, gap: isMobile ? '10px' : '14px' }}>
            {popularProducts.map((product, i) => (
              <ProductCard key={i} product={product} badge={i < 3 ? '10% OFF' : '15% OFF'} badgeColor={i < 3 ? '#34C759' : '#FF3B30'} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. SNACKS & MUNCHIES ─────────────────── */}
      <div className="container" style={{ paddingTop: '4px', marginBottom: isMobile ? '20px' : '32px' }}>
        <div style={{
          background: '#FFFFFF', borderRadius: isMobile ? '14px' : '16px',
          border: '1px solid #D2D2D7', padding: isMobile ? '16px 12px' : '24px',
          boxShadow: '0 1px 3px rgba(29,29,31,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '14px' : '18px' }}>
            <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: '#1D1D1F', margin: 0 }}>Snacks &amp; Munchies</h2>
            <Link to="/category/snacks-munchies" style={{ fontSize: '13px', color: '#0071E3', fontWeight: 700, textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: prodCols, gap: isMobile ? '10px' : '14px' }}>
            {snackProducts.map((product, i) => (
              <ProductCard key={i} product={product} badge={`${product.discount}% OFF`} badgeColor="#FF3B30" />
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. GRABIT DEALS & SUPER SAVERS (6 CARDS IN 2 ROWS) ──────────────────────── */}
      <div id="grabit-deals-section" className="container" style={{ paddingTop: '4px', marginBottom: isMobile ? '20px' : '32px' }}>
        
        {/* Top Showcase: 6 High-Impact Zepto/Blinkit Style Deal Offer Banners in 2 Rows */}
        <div style={{
          background: '#FFFFFF', borderRadius: isMobile ? '14px' : '16px',
          border: '1px solid #D2D2D7', padding: isMobile ? '16px 12px' : '24px',
          boxShadow: '0 1px 3px rgba(29,29,31,0.03)',
          marginBottom: isMobile ? '16px' : '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#FFE5E5', color: '#FF3B30', fontSize: '11px', fontWeight: 900, padding: '3px 8px', borderRadius: '6px' }}>⚡ SUPER SAVERS</span>
              <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: '#1D1D1F', margin: 0 }}>Exclusive Deal Offers</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? '12px' : '16px' }}>
            {[
              { img: '/deal-banner-snacks-vibrant.jpg', title: 'Snacks Bonanza', tag: 'Up to 35% OFF', link: '/category/snacks-munchies' },
              { img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645106/grabit_media/deal_banner_beverages.jpg', title: 'Fresh Beverages', tag: 'Flat 30% OFF', link: '/category/beverages' },
              { img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645065/grabit_media/deal_banner_dryfruits.jpg', title: 'Premium Dry Fruits', tag: 'Starting ₹99', link: '/category/produce' },
              { img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645097/grabit_media/deal_banner_dairy.jpg', title: 'Farm Fresh Dairy', tag: 'Up to 25% OFF', link: '/category/dairy-bakery' },
              { img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645124/grabit_media/deal_banner_chocolates.jpg', title: 'Chocolates & Sweets', tag: 'Flat 20% OFF', link: '/category/chocolates' },
              { img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645056/grabit_media/deal_banner_household.jpg', title: 'Household Essentials', tag: 'Up to 40% OFF', link: '/category/household' },
            ].map((deal, idx) => (
              <Link key={idx} to={deal.link} style={{ textDecoration: 'none' }}>
                <div style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  border: '1px solid #D2D2D7',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  background: '#fff'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)'; }}
                >
                  <img src={deal.img} alt={deal.title} style={{ width: '100%', height: isMobile ? '140px' : '170px', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', bottom: '12px', left: '12px', right: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    zIndex: 2
                  }}>
                    <span style={{
                      background: 'rgba(29, 29, 31, 0.85)', backdropFilter: 'blur(4px)',
                      color: '#FFFFFF', fontSize: '11px', fontWeight: 800,
                      padding: '4px 10px', borderRadius: '20px'
                    }}>
                      {deal.tag}
                    </span>
                    <button style={{
                      background: '#FFFFFF', color: '#1D1D1F', border: 'none',
                      padding: '6px 14px', borderRadius: '20px', fontSize: '11px',
                      fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                      Order Now →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Grabit Deals Product Cards Grid */}
        <div style={{
          background: '#FFFFFF', borderRadius: isMobile ? '14px' : '16px',
          border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '14px' : '20px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: '#0F172A' }}>Grabit Deals</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                <span>Ends in</span>
                {['02', '45', '18'].map((t, i) => (
                  <span key={i} style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0F172A' }}>
                    {t}{i < 2 ? ':' : ''}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/category/electronics" style={{ fontSize: '13px', color: '#0066FF', fontWeight: 700, textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: prodCols, gap: isMobile ? '10px' : '14px' }}>
            {dealProducts.map((product, i) => (
              <ProductCard key={i} product={product} badge={`${product.discount}% OFF`} badgeColor="#E53935" />
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. WISHLIST ──────────────────────────── */}
      <div className="container" style={{ paddingTop: '4px', marginBottom: isMobile ? '20px' : '32px' }}>
        <div style={{
          background: '#FFFFFF', borderRadius: isMobile ? '14px' : '16px',
          border: '1px solid #E2E8F0', padding: isMobile ? '16px' : '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '14px' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>My Saved Wishlist</h2>
              {wishlistItems.length > 0 && (
                <span style={{ background: '#FFEBEE', color: '#E53935', fontSize: '11px', fontWeight: 900, padding: '2px 8px', borderRadius: '12px' }}>
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
                </span>
              )}
            </div>
            <Link to="/wishlist" style={{ fontSize: '13px', color: '#0066FF', fontWeight: 700, textDecoration: 'none' }}>View all</Link>
          </div>

          {wishlistItems.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: prodCols, gap: isMobile ? '10px' : '14px' }}>
              {wishlistItems.map((product, i) => (
                <ProductCard key={i} product={product} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '28px 16px', background: '#F8FAFC',
              borderRadius: '12px', border: '1px stroke #E2E8F0'
            }}>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px', fontWeight: 500 }}>
                Your wishlist is empty. Tap the heart icon (❤️) on any product to save items for later!
              </p>
              <Link
                to="/categories"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#0066FF', color: '#FFFFFF', padding: '8px 16px',
                  borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                  textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,102,255,0.2)'
                }}
              >
                Browse Categories →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── 8. PIXEL-PERFECT CLEAN TRUST BADGES SHOWCASE ──────────────────────── */}
      <div className="container" style={{ paddingTop: isMobile ? '16px' : '36px' }}>
        {isMobile ? (
          /* Mobile View: 4-Column Fitted Grid Strip (Zero Cutoff, Zero Overflow) */
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 6px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            {[
              { icon: <Zap size={16} color="#0066FF" fill="#0066FF" />, t1: 'Fast 30-Min', t2: 'Delivery' },
              { icon: <MapPin size={16} color="#0F9D58" fill="#0F9D58" />, t1: 'Within 5 km', t2: 'Hyperlocal' },
              { icon: <Shield size={16} color="#FF6B00" fill="#FF6B00" />, t1: '100% Quality', t2: 'Guaranteed' },
              { icon: <Tag size={16} color="#7C3AED" fill="#7C3AED" />, t1: 'Instant 1-Tap', t2: 'Refunds' },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid #F1F5F9' : 'none',
                padding: '0 2px'
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: '#F8FAFC', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '4px'
                }}>
                  {t.icon}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#0F172A', lineHeight: 1.15 }}>{t.t1}</div>
                <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 500, marginTop: '1px' }}>{t.t2}</div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop View: 4 High-Impact Glassmorphic Cards */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              {
                icon: <Zap size={22} color="#0066FF" fill="#0066FF" />,
                bg: 'linear-gradient(135deg, #EEF4FF 0%, #DBEAFE 100%)',
                border: '#BFDBFE',
                title: 'Lightning 30-Min Delivery',
                sub: 'Express dark store delivery',
                glow: 'rgba(0,102,255,0.15)'
              },
              {
                icon: <MapPin size={22} color="#0F9D58" fill="#0F9D58" />,
                bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '#A7F3D0',
                title: 'Within 5 km Radius',
                sub: 'Hyperlocal sourced fresh',
                glow: 'rgba(15,157,88,0.15)'
              },
              {
                icon: <Shield size={22} color="#FF6B00" fill="#FF6B00" />,
                bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                border: '#FED7AA',
                title: '100% Quality Checked',
                sub: 'Hygienic cold storage',
                glow: 'rgba(255,107,0,0.15)'
              },
              {
                icon: <Tag size={22} color="#7C3AED" fill="#7C3AED" />,
                bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                border: '#DDD6FE',
                title: 'Secure & Instant Refund',
                sub: 'PCI-DSS 256-bit encrypted',
                glow: 'rgba(124,58,237,0.15)'
              },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  background: t.bg,
                  border: `1.5px solid ${t.border}`,
                  borderRadius: '16px',
                  padding: '18px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'default'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 28px ${t.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: '#FFFFFF', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', lineHeight: 1.25 }}>{t.title}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px', fontWeight: 500 }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 9. PIXEL-PERFECT CLEAN VIP DEALS BANNER ────────────────────────── */}
      <div className="container" style={{ paddingTop: isMobile ? '14px' : '32px', paddingBottom: isMobile ? '85px' : '0px' }}>
        {isMobile ? (
          /* Mobile View: Clean, Modern Light-Blue Quick Commerce Card */
          <div style={{
            background: '#EEF6FF',
            border: '1px solid #D2D2D7',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 10px rgba(0,113,227,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            {/* 3D Isolated VIP Coupon Gift Box Image on Left (No Box Background) */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="https://res.cloudinary.com/hmx3azp6/image/upload/v1787645128/grabit_media/vip_gift_box_cutout.jpg"
                alt="VIP Coupon Gift Box Cutout"
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply'
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#0071E3', color: '#FFFFFF', fontSize: '9px', fontWeight: 900, padding: '3px 8px', borderRadius: '10px', marginBottom: '6px' }}>
                🎁 VIP SAVINGS
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1D1D1F', margin: '0 0 4px 0' }}>
                Get Flat ₹100 OFF Coupon
              </h3>
              <p style={{ fontSize: '11.5px', color: '#86868B', margin: '0 0 12px 0', lineHeight: 1.35 }}>
                Subscribe to get secret weekly flash deal alerts in your inbox.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert('🎉 Congratulations! ₹100 Coupon Code GRABIT100 sent to your email!'); }} style={{ display: 'flex', width: '100%' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter email address..."
                  style={{
                    flex: 1, height: '38px', padding: '0 12px', minWidth: 0,
                    borderRadius: '8px 0 0 8px', border: '1px solid #D2D2D7',
                    fontSize: '12px', background: '#FFFFFF', outline: 'none', color: '#1D1D1F'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: '38px', padding: '0 14px', borderRadius: '0 8px 8px 0',
                    fontSize: '12px', fontWeight: 900, background: '#0071E3',
                    color: '#FFFFFF', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  Claim ₹100
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Desktop View: Full-Fledged Glassmorphic VIP Banner */
          <div style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #0043A8 50%, #0066FF 100%)',
            borderRadius: '28px',
            padding: '36px 48px',
            border: '1.5px solid #003380',
            boxShadow: '0 16px 40px rgba(0,67,168,0.3)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            color: 'white'
          }}>
            <div style={{ maxWidth: '520px', zIndex: 2 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FEF08A', fontSize: '11px', fontWeight: 900,
                padding: '4px 12px', borderRadius: '20px', marginBottom: '10px'
              }}>
                🎁 VIP SAVINGS CLUB
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, marginBottom: '8px' }}>
                Claim Flat ₹100 OFF <span style={{ color: '#38BDF8' }}>+ Secret Deals!</span>
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontWeight: 500 }}>
                Join over 50,000+ happy shoppers! Get instant cashback coupons and weekly flash deal notifications straight to your inbox.
              </p>
            </div>

            <div style={{ width: '380px', zIndex: 2, flexShrink: 0 }}>
              <form onSubmit={(e) => { e.preventDefault(); alert('🎉 Congratulations! ₹100 Coupon Code GRABIT100 sent to your email!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    style={{
                      flex: 1, height: '48px', padding: '0 18px',
                      borderRadius: '12px', border: '2px solid #38BDF8',
                      fontSize: '13px', background: '#FFFFFF', color: '#0F172A',
                      outline: 'none', fontWeight: 600, boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      height: '48px', padding: '0 24px', borderRadius: '12px',
                      fontSize: '13px', fontWeight: 900,
                      background: 'linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)',
                      color: 'white', border: 'none', cursor: 'pointer',
                      whiteSpace: 'nowrap', boxShadow: '0 6px 18px rgba(255,107,0,0.4)',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    Claim ₹100 Offer
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontWeight: 500 }}>
                  🔒 100% Privacy Protected • No Spam • Unsubscribe Anytime
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 💡 CUSTOMER PRODUCT SUGGESTION BANNER CARD */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          padding: isMobile ? '20px 16px' : '24px 32px',
          marginTop: '24px',
          marginBottom: '24px',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '260px' }}>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/suggest-product-3d.png"
                alt="Suggest Product 3D Asset"
                style={{
                  width: isMobile ? '76px' : '92px',
                  height: isMobile ? '76px' : '92px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 18px rgba(0, 113, 227, 0.22))'
                }}
              />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EFF6FF', color: '#0071E3', fontSize: '10px', fontWeight: 900, padding: '3px 10px', borderRadius: '12px', marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                💡 CAN'T FIND AN ITEM?
              </div>
              <h3 style={{ fontSize: isMobile ? '16px' : '19px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                Suggest a Product to Stock
              </h3>
              <p style={{ fontSize: isMobile ? '12px' : '13.5px', color: '#64748B', margin: 0, fontWeight: 500, lineHeight: 1.45 }}>
                Tell us what product you're looking for and our sourcing team will endeavor to stock it in your local dark store!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSuggestionModalOpen(true)}
            style={{
              background: '#0071E3', color: '#FFFFFF', border: 'none',
              borderRadius: '14px', padding: '13px 26px', fontSize: '13.5px',
              fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0, 113, 227, 0.28)',
              display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              width: isMobile ? '100%' : 'auto', justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#005BB5';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 22px rgba(0, 113, 227, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0071E3';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 113, 227, 0.28)';
            }}
          >
            <Sparkles size={16} color="#FFFFFF" />
            <span>Suggest a Product</span>
          </button>
        </div>

        {/* 🌟 CUSTOMER REVIEW SECTION */}
        <CustomerReviewSection storeName="GrabIt Supermarket" />
      </div>

      {/* 💡 Product Suggestion Modal */}
      <ProductSuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
      />
    </div>
  );
}

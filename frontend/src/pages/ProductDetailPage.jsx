import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ChevronLeft, ChevronRight, Zap, MapPin, Plus, Minus, ShoppingCart, Tag, Shield, ShoppingBag, Truck, CheckCircle2, Clock, Share2, ThumbsUp, HelpCircle, Award, Check, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import ProductSvg from '../components/common/ProductSvg';
import { products, getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDeliveryLocation } from '../context/LocationContext';
import { useWishlist } from '../context/WishlistContext';
import useWindowWidth from '../hooks/useWindowWidth';

const TABS = ['Product Details', 'Nutritional Info', 'About Brand', 'Storage & Safety'];

const getProductVariants = (p) => {
  if (p.variants && p.variants.length > 0) return p.variants;
  
  const wLower = (p.weight || '').toLowerCase();
  const cat = (p.category || '').toLowerCase();
  
  if (cat === 'snacks' || (wLower.includes('g') && !wLower.includes('kg'))) {
    const baseW = parseInt(p.weight) || 52;
    return [
      { label: `${baseW} g`, weight: `${baseW}g`, price: p.price, mrp: p.mrp },
      { label: `${Math.round(baseW * 1.7)} g`, weight: `${Math.round(baseW * 1.7)}g`, price: Math.round(p.price * 1.65), mrp: Math.round(p.mrp * 1.65) },
      { label: `${Math.round(baseW * 3.4)} g Party Pack`, weight: `${Math.round(baseW * 3.4)}g`, price: Math.round(p.price * 3.0), mrp: Math.round(p.mrp * 3.2) },
    ];
  }
  
  if (cat === 'staples' || wLower.includes('kg')) {
    return [
      { label: '1 kg', weight: '1kg', price: p.price, mrp: p.mrp },
      { label: '5 kg Value Pack', weight: '5kg', price: Math.round(p.price * 4.4), mrp: Math.round(p.mrp * 4.5) },
      { label: '10 kg Mega Pack', weight: '10kg', price: Math.round(p.price * 8.3), mrp: Math.round(p.mrp * 8.5) },
    ];
  }

  if (cat === 'beverages' || wLower.includes('ml') || wLower.includes('l')) {
    return [
      { label: '250 ml Can', weight: '250ml', price: p.price, mrp: p.mrp },
      { label: '750 ml Bottle', weight: '750ml', price: Math.round(p.price * 2.2), mrp: Math.round(p.mrp * 2.2) },
      { label: '1.25 L Family Pack', weight: '1.25L', price: Math.round(p.price * 3.5), mrp: Math.round(p.mrp * 3.6) },
    ];
  }

  if (cat === 'produce') {
    return [
      { label: '500 g', weight: '500g', price: p.price, mrp: p.mrp },
      { label: '1 kg', weight: '1kg', price: Math.round(p.price * 1.85), mrp: Math.round(p.mrp * 1.9) },
      { label: '2 kg Value Pack', weight: '2kg', price: Math.round(p.price * 3.5), mrp: Math.round(p.mrp * 3.6) },
    ];
  }

  return [
    { label: p.weight || 'Single Unit', weight: p.weight || 'Standard', price: p.price, mrp: p.mrp },
    { label: '2 Pack Combo', weight: '2 Units', price: Math.round(p.price * 1.9), mrp: Math.round(p.mrp * 2.0) },
  ];
};

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = getProductById(id) || products[0];
  const { addItem, updateQty, getItemQty } = useCart();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const { location, setIsModalOpen } = useDeliveryLocation();
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  const variants = getProductVariants(product);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const currentVariant = variants[selectedVariantIdx] || variants[0];

  const activePrice = currentVariant.price;
  const activeMrp = currentVariant.mrp;
  const activeWeight = currentVariant.label || currentVariant.weight;
  const activeDiscount = activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : product.discount;

  const [activeTab, setActiveTab] = useState(0);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showMoreHighlights, setShowMoreHighlights] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 35) {
      if (diffX > 0) {
        // Swipe left -> Next image
        setSelectedThumb(prev => (prev + 1) % 4);
      } else {
        // Swipe right -> Previous image
        setSelectedThumb(prev => (prev - 1 + 4) % 4);
      }
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    setSelectedVariantIdx(0);
    setSelectedThumb(0);
  }, [id]);
  
  // Custom cart item id for variant
  const cartItemId = `${product.id}-${selectedVariantIdx}`;
  const qty = getItemQty(product.id);

  // Bundle Items for Frequently Bought Together
  const bundleItems = [
    product,
    { id: 16, name: 'Pepsi 500ml', price: 45, mrp: 50, image: 'coca-cola', weight: '500ml' },
    { id: 31, name: 'Cadbury Dairy Milk 36g', price: 25, mrp: 30, image: 'dairy-milk-silk', weight: '36g' },
  ];
  const bundlePrice = bundleItems.reduce((s, i) => s + i.price, 0);
  const bundleMrp = bundleItems.reduce((s, i) => s + (i.mrp || i.price + 5), 0);

  // Related recommendations
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, isMobile ? 4 : 6);
  const sidebarRecommendations = products.filter(p => p.id !== product.id).slice(0, 5);

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      price: activePrice,
      mrp: activeMrp,
      weight: activeWeight,
      name: `${product.name} (${activeWeight})`
    };
    addItem(itemToAdd);
  };

  const handleAddBundle = () => {
    bundleItems.forEach(item => addItem(item));
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Grabit!`,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        showToast('Product link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        showToast('Product link copied to clipboard!');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: isMobile ? '145px' : '60px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sticky Top Header Bar with ONLY Back Arrow & Product Title */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: isMobile ? '12px 0' : '14px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Go Back"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '38px', height: '38px', borderRadius: '12px',
                background: '#F1F5F9', color: '#0F172A',
                border: '1px solid #E2E8F0',
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'none'; }}
            >
              <ArrowLeft size={20} color="#0F172A" />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '15px' : '18px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? '230px' : '500px'
              }}>
                {product.name}
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
                {product.brand || 'Grabit Store'} • {product.weight || 'Standard Unit'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
      
      {/* ── MAIN ADVANCED PRODUCT SHOWCASE ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '480px 1fr',
        gap: isMobile ? '20px' : '36px',
        background: '#FFFFFF',
        borderRadius: isMobile ? '16px' : '24px',
        padding: isMobile ? '16px' : '32px',
        marginBottom: '28px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        boxSizing: 'border-box',
        maxWidth: '100%'
      }}>
        
        {/* LEFT COLUMN: Premium Dynamic Image Stage */}
        <div>
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: isMobile ? '260px' : '360px',
              marginBottom: '16px',
              position: 'relative',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)',
              userSelect: 'none',
              touchAction: 'pan-y'
            }}
          >
            {/* Top Badges */}
            <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 3 }}>
              {activeDiscount > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
                  color: 'white', borderRadius: '8px', padding: '5px 12px',
                  fontSize: '11px', fontWeight: 900, boxShadow: '0 2px 8px rgba(229,57,53,0.35)'
                }}>
                  SAVE {activeDiscount}%
                </div>
              )}
            </div>

            {/* Left Chevron Arrow Button */}
            <button
              onClick={() => setSelectedThumb(prev => (prev - 1 + 4) % 4)}
              aria-label="Previous Image"
              style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer', zIndex: 4,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%)'}
            >
              <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
            </button>

            {/* Right Chevron Arrow Button */}
            <button
              onClick={() => setSelectedThumb(prev => (prev + 1) % 4)}
              aria-label="Next Image"
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)', cursor: 'pointer', zIndex: 4,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%)'}
            >
              <ChevronRight size={20} color="#0F172A" strokeWidth={2.5} />
            </button>

            {/* Right Action Icons (Wishlist & Share) */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 5 }}>
              <button
                onClick={handleWishlist}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: '#FFFFFF', border: '1px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <Heart size={18} fill={wishlisted ? '#E53935' : 'none'} color={wishlisted ? '#E53935' : '#64748B'} />
              </button>
              
              <button
                onClick={handleShare}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: '#FFFFFF', border: '1px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <Share2 size={17} color="#64748B" />
              </button>
            </div>

            {/* Center Product Illustration */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: `scale(${1 + (selectedThumb * 0.02)}) rotate(${selectedThumb * 1.5 - 2.2}deg)`
            }}>
              <ProductSvg name={product.image} size={isMobile ? 180 : 250} />
            </div>

            {/* Slide Position Counter Badge */}
            <div style={{
              position: 'absolute', bottom: '12px', right: '14px',
              background: 'rgba(15, 23, 42, 0.75)', color: '#FFFFFF',
              borderRadius: '12px', padding: '3px 9px', fontSize: '11px',
              fontWeight: 800, backdropFilter: 'blur(4px)', zIndex: 3
            }}>
              {selectedThumb + 1} / 4
            </div>

            {/* Glowing Base Shadow */}
            <div style={{
              position: 'absolute', bottom: '15px', width: '220px', height: '24px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 70%)',
              borderRadius: '50%', pointerEvents: 'none'
            }} />
          </div>

          {/* Interactive Thumbnails Carousel */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                onClick={() => setSelectedThumb(idx)}
                style={{
                  width: isMobile ? '54px' : '68px',
                  height: isMobile ? '54px' : '68px',
                  border: selectedThumb === idx ? '2.5px solid #0066FF' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: selectedThumb === idx ? '0 4px 12px rgba(0,102,255,0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <ProductSvg name={product.image} size={isMobile ? 40 : 50} />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Advanced Product Info & Buying Controls */}
        <div>


          {/* Product Title */}
          <h1 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 900, color: '#0F172A', marginBottom: '6px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {product.name}
          </h1>

          {/* Rating & Review Badge Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px',
            background: '#F8FAFC', border: '1px solid #F1F5F9', padding: '8px 14px', borderRadius: '10px',
            width: 'fit-content'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#0F9D58', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 900 }}>
              <span>{product.rating}</span>
              <Star size={11} fill="white" color="white" />
            </div>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>
              98 Verified Ratings &amp; 42 Reviews
            </span>
          </div>

          {/* 🏷️ PACK SIZE / WEIGHT VARIANT SELECTOR PILLS SECTION */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px',
            padding: '12px 14px', marginBottom: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Select Pack Size
              </span>
              <span style={{ fontSize: '11px', color: '#0071E3', fontWeight: 800, background: '#EFF6FF', padding: '2px 8px', borderRadius: '10px' }}>
                {activeWeight}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {variants.map((v, vIdx) => {
                const isSelected = selectedVariantIdx === vIdx;
                const vDiscount = v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
                return (
                  <button
                    key={vIdx}
                    onClick={() => setSelectedVariantIdx(vIdx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 13px', borderRadius: '10px',
                      background: isSelected ? '#EFF6FF' : '#F8FAFC',
                      border: isSelected ? '1.5px solid #0071E3' : '1px solid #E2E8F0',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,113,227,0.15)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#0071E3' : '#0F172A' }}>
                      {v.label || v.weight}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 900, color: isSelected ? '#0071E3' : '#334155' }}>
                      ₹{v.price}
                    </span>
                    {vDiscount > 0 && (
                      <span style={{
                        fontSize: '9px', fontWeight: 900, color: '#059669',
                        background: '#ECFDF5', padding: '1px 5px', borderRadius: '4px'
                      }}>
                        {vDiscount}% OFF
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Discount Card */}
          <div style={{
            background: '#F0F7FF', border: '1px solid #CCE3FF', borderRadius: '14px',
            padding: '16px 20px', marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
              <span style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>₹{activePrice}</span>
              <span style={{ fontSize: '16px', color: '#94A3B8', textDecoration: 'line-through' }}>MRP ₹{activeMrp}</span>
              {activeDiscount > 0 && (
                <span style={{ background: '#FFE5E5', color: '#E53935', fontSize: '12px', fontWeight: 900, padding: '3px 8px', borderRadius: '6px' }}>
                  SAVE ₹{activeMrp - activePrice} ({activeDiscount}% OFF)
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
              Inclusive of all taxes • Best Price Guaranteed for {activeWeight}
            </div>
          </div>

          {/* ⚡ Live Express Delivery Guarantee Card */}
          <div
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px',
              padding: '12px 16px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0F9D58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="white" fill="white" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Superfast 30-45 Min Express Delivery
                </div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                  Delivering to {location.area}, {location.city} • Tap to change
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="#0F9D58" />
          </div>

          {/* Action Add to Cart Controls */}
          <div style={{ marginBottom: '24px' }}>
            {qty === 0 ? (
              <button
                className="animate-cta-swap"
                onClick={handleAddToCart}
                style={{
                  width: '100%', height: '54px',
                  background: 'linear-gradient(135deg, #0071E3 0%, #0057B8 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '0 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 10px 28px rgba(0, 113, 227, 0.35), 0 2px 8px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 14px 34px rgba(0, 113, 227, 0.45)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(0, 113, 227, 0.35)';
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShoppingBag size={19} color="#FFFFFF" strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.5px', color: '#FFFFFF' }}>
                  ADD TO CART
                </span>
              </button>
            ) : (
              /* Clean Full-Width Blue Quantity Selector */
              <div
                className="animate-cta-swap"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                  color: '#FFFFFF',
                  borderRadius: '16px', padding: '0 12px',
                  height: '54px', width: '100%',
                  boxShadow: '0 10px 28px rgba(0, 113, 227, 0.35)', boxSizing: 'border-box',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <button
                  onClick={() => updateQty(product.id, qty - 1)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.22)', border: 'none', color: '#FFFFFF',
                    width: '38px', height: '38px', borderRadius: '12px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Minus size={20} strokeWidth={3} />
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>
                    {qty}
                  </span>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '0.3px' }}>
                    IN CART
                  </span>
                </div>

                <button
                  onClick={() => updateQty(product.id, qty + 1)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.22)', border: 'none', color: '#FFFFFF',
                    width: '38px', height: '38px', borderRadius: '12px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* Key Product Assurance Badges Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '10px',
            borderTop: '1px solid #E2E8F0', paddingTop: '20px'
          }}>
            {[
              { icon: <Shield size={18} color="#0066FF" />, label: '100% Original', sub: 'Directly from brand', bg: '#EEF4FF' },
              { icon: <Award size={18} color="#0F9D58" />, label: 'Freshness Guaranteed', sub: 'Hygienically packed', bg: '#ECFDF5' },
              { icon: <Clock size={18} color="#FF6B00" />, label: 'Easy Returns', sub: 'Instant refund to wallet', bg: '#FFF7ED' },
            ].map((b, bIdx) => (
              <div key={bIdx} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                padding: '10px 12px', borderRadius: '12px'
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                    {b.label}
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>{b.sub}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── LOWER SECTION: TABS & SIDEBAR RECOMMENDATIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: w <= 960 ? '1fr' : '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Detailed Spec Tabs & Frequently Bought Bundle */}
        <div style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
          
          {/* Spec Tabs */}
          <div style={{
            background: '#FFFFFF', borderRadius: isMobile ? '16px' : '24px', border: '1px solid #E2E8F0',
            padding: isMobile ? '14px 12px' : '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            boxSizing: 'border-box', maxWidth: '100%', overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex', gap: '8px', borderBottom: '2px solid #F1F5F9',
              paddingBottom: '12px', marginBottom: '20px', overflowX: 'auto',
              scrollbarWidth: 'none', msOverflowStyle: 'none', whiteSpace: 'nowrap'
            }}>
              {TABS.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    background: activeTab === idx ? '#EEF4FF' : '#F8FAFC',
                    color: activeTab === idx ? '#0066FF' : '#475569',
                    border: activeTab === idx ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                    padding: isMobile ? '8px 14px' : '8px 16px', borderRadius: '10px',
                    fontSize: isMobile ? '12.5px' : '13px', fontWeight: 800, cursor: 'pointer',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    transition: 'all 0.15s'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab 0: Product Details (EXACT MATCH FOR USER SCREENSHOT) */}
            {activeTab === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '8px' }}>
                
                {/* ── HIGHLIGHTS SECTION ── */}
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Highlights</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '115px 1fr' : '140px 1fr', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Brand</span>
                      <span style={{ color: '#0F172A', fontWeight: 800 }}>{product.brand || "Lay's"}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '115px 1fr' : '140px 1fr', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Product Type</span>
                      <span style={{ color: '#0F172A', fontWeight: 800 }}>{product.category || "Snacks & Munchies"}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '115px 1fr' : '140px 1fr', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Dietary Preference</span>
                      <span style={{ color: '#0F172A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '12px', height: '12px', border: '1.5px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                        </span>
                        Veg
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '115px 1fr' : '140px 1fr', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Flavour</span>
                      <span style={{ color: '#0F172A', fontWeight: 800 }}>{product.flavor || "American Style Cream & Onion"}</span>
                    </div>

                    {showMoreHighlights && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '115px 1fr' : '140px 1fr', gap: '8px', fontSize: '13px' }}>
                          <span style={{ color: '#64748B', fontWeight: 600 }}>Pack Size</span>
                          <span style={{ color: '#0F172A', fontWeight: 800 }}>{activeWeight}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '115px 1fr' : '140px 1fr', gap: '8px', fontSize: '13px' }}>
                          <span style={{ color: '#64748B', fontWeight: 600 }}>Country of Origin</span>
                          <span style={{ color: '#0F172A', fontWeight: 800 }}>India</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '115px 1fr' : '140px 1fr', gap: '8px', fontSize: '13px' }}>
                          <span style={{ color: '#64748B', fontWeight: 600 }}>FSSAI License</span>
                          <span style={{ color: '#0F172A', fontWeight: 800 }}>10014011001895</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '115px 1fr' : '140px 1fr', gap: '8px', fontSize: '13px' }}>
                          <span style={{ color: '#64748B', fontWeight: 600 }}>Shelf Life</span>
                          <span style={{ color: '#0F172A', fontWeight: 800 }}>6 Months from MFD</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* View More Pill Button */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <button
                      onClick={() => setShowMoreHighlights(!showMoreHighlights)}
                      style={{
                        background: '#FFF0F5', color: '#FF3366', border: 'none',
                        padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
                        fontWeight: 800, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '4px', transition: 'all 0.15s'
                      }}
                    >
                      <span>{showMoreHighlights ? 'View Less' : 'View More'}</span>
                      <span style={{ fontSize: '10px' }}>{showMoreHighlights ? '▲' : '▼'}</span>
                    </button>
                  </div>
                </div>

                {/* ── INFORMATION SECTION ── */}
                <div style={{ paddingTop: '8px', maxWidth: '100%', boxSizing: 'border-box', paddingRight: isMobile ? '4px' : '0px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Information</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%', boxSizing: 'border-box' }}>
                      <div style={{ color: '#64748B', fontWeight: 700, fontSize: '12.5px' }}>Disclaimer</div>
                      <p style={{
                        color: '#334155', fontWeight: 500, fontSize: '12.5px', lineHeight: 1.6,
                        wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%',
                        boxSizing: 'border-box', margin: 0, paddingRight: isMobile ? '6px' : '0px'
                      }}>
                        All images are for representational purposes only. It is advised that you read the batch and manufacturing details, directions for use, allergen information, health and nutritional claims (wherever applicable), and other details mentioned on the label before consuming the product. For combo items, individual prices can be viewed on the page.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%', boxSizing: 'border-box' }}>
                      <div style={{ color: '#64748B', fontWeight: 700, fontSize: '12.5px' }}>Customer Care Details</div>
                      <p style={{
                        color: '#334155', fontWeight: 500, fontSize: '12.5px', lineHeight: 1.6,
                        wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%',
                        boxSizing: 'border-box', margin: 0, paddingRight: isMobile ? '6px' : '0px'
                      }}>
                        In case of any issue, contact us<br />
                        E-mail address: <a href="mailto:support@grabitnow.com" style={{ color: '#0071E3', textDecoration: 'none', fontWeight: 700 }}>support@grabitnow.com</a>
                      </p>
                    </div>

                    {showMoreInfo && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%', boxSizing: 'border-box' }}>
                          <div style={{ color: '#64748B', fontWeight: 700, fontSize: '12.5px' }}>Seller Name</div>
                          <p style={{
                            color: '#0F172A', fontWeight: 800, fontSize: '12.5px', lineHeight: 1.6,
                            wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%',
                            boxSizing: 'border-box', margin: 0, paddingRight: isMobile ? '6px' : '0px'
                          }}>
                            Grabit Convenience Private Limited
                          </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%', boxSizing: 'border-box' }}>
                          <div style={{ color: '#64748B', fontWeight: 700, fontSize: '12.5px' }}>Seller Address</div>
                          <p style={{
                            color: '#334155', fontWeight: 500, fontSize: '12.5px', lineHeight: 1.6,
                            wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%',
                            boxSizing: 'border-box', margin: 0, paddingRight: isMobile ? '6px' : '0px'
                          }}>
                            Grabit Convenience Private Limited, Unit 508, Sakti Statesman, 5th floor, Green Glen Layout, No.37/301/34/1, SY.NO.34, Iblur Village, Begur Hobli, Bangalore, Karnataka-560103
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* View More Pill Button */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <button
                      onClick={() => setShowMoreInfo(!showMoreInfo)}
                      style={{
                        background: '#FFF0F5', color: '#FF3366', border: 'none',
                        padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
                        fontWeight: 800, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '4px', transition: 'all 0.15s'
                      }}
                    >
                      <span>{showMoreInfo ? 'View Less' : 'View More'}</span>
                      <span style={{ fontSize: '10px' }}>{showMoreInfo ? '▲' : '▼'}</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 1: Nutritional Info */}
            {activeTab === 1 && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>Nutritional Values (per 100g approx.)</h3>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  {[
                    { label: 'Energy', val: '535 kcal' },
                    { label: 'Protein', val: '6.7 g' },
                    { label: 'Total Carbohydrates', val: '54.2 g' },
                    { label: 'Total Fat', val: '33.1 g' },
                    { label: 'Sodium', val: '740 mg' },
                  ].map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', fontSize: '13px' }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>{row.label}</span>
                      <span style={{ color: '#0F172A', fontWeight: 800 }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: About Brand */}
            {activeTab === 2 && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>About the Brand</h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  Grabit brings you trusted authentic products from top Indian and international brands. Every item is quality checked and stored under temperature-controlled conditions to ensure maximum freshness.
                </p>
              </div>
            )}

            {/* Tab 3: Storage & Safety */}
            {activeTab === 3 && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>Storage Guidelines</h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  Store in a cool, dry and hygienic place away from direct sunlight. Once opened, keep in an airtight container to retain crispness and flavor.
                </p>
              </div>
            )}
          </div>

          {/* 📦 Frequently Bought Together Smart Combo Card */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFFFF 100%)',
            borderRadius: isMobile ? '16px' : '24px', border: '1.5px solid #FFE0B2',
            padding: isMobile ? '14px 12px' : '20px', marginBottom: '28px', boxShadow: '0 4px 16px rgba(255,152,0,0.06)',
            boxSizing: 'border-box', maxWidth: '100%', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ background: '#FF6B00', color: 'white', fontSize: '10px', fontWeight: 900, padding: '3px 8px', borderRadius: '6px' }}>SMART BUNDLE</span>
              <h3 style={{ fontSize: isMobile ? '14.5px' : '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Frequently Bought Together</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {bundleItems.map((bItem, bIdx) => (
                <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: isMobile ? '56px' : '70px', height: isMobile ? '56px' : '70px',
                    borderRadius: '12px', background: '#FFFFFF',
                    border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '4px', flexShrink: 0
                  }}>
                    <ProductSvg name={bItem.image} size={isMobile ? 36 : 46} />
                  </div>
                  {bIdx < bundleItems.length - 1 && (
                    <span style={{
                      fontSize: '14px', fontWeight: 900, color: '#FF6B00',
                      background: '#FFF3E0', width: '22px', height: '22px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      +
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Bundle Price (3 Items)</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>₹{bundlePrice}</span>
                  <span style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{bundleMrp}</span>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 800 }}>Save ₹{bundleMrp - bundlePrice}</span>
                </div>
              </div>
              
              <div style={{ width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}>
                <button
                  onClick={() => {
                    bundleItems.forEach(it => addItem(it));
                  }}
                  style={{
                    width: '100%', maxWidth: '100%', background: '#FF6B00', color: 'white', border: 'none',
                    borderRadius: '12px', padding: isMobile ? '11px 10px' : '12px 16px',
                    fontSize: isMobile ? '12.5px' : '13.5px',
                    fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
                    boxSizing: 'border-box', textAlign: 'center', display: 'block'
                  }}
                >
                  Add 3 Items to Cart (₹{bundlePrice})
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: Recommended Products */}
        {!isMobile && (
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0',
            padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', marginBottom: '16px', borderBottom: '2px solid #F1F5F9', paddingBottom: '8px' }}>
              Recommended For You
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sidebarRecommendations.map((recProd, rIdx) => (
                <Link
                  key={rIdx}
                  to={`/product/${recProd.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none',
                    padding: '8px', borderRadius: '10px', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '54px', height: '54px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ProductSvg name={recProd.image} size={36} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {recProd.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{recProd.weight}</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                      ₹{recProd.price} <span style={{ fontSize: '10px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{recProd.mrp}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      {/* ── RELATED PRODUCTS ROW ── */}
      <div style={{ marginTop: '20px', marginBottom: isMobile ? '30px' : '0px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>Similar Products You Might Like</h2>
          <Link to={`/category/${product.category}`} style={{ fontSize: '13px', color: '#0066FF', fontWeight: 800, textDecoration: 'none' }}>View All</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: '14px' }}>
          {relatedProducts.map((p, i) => (
            <ProductCard key={i} product={p} badge={`${p.discount}% OFF`} badgeColor="#E53935" />
          ))}
        </div>
      </div>

    </div>
    </div>
    </div>
  );
}

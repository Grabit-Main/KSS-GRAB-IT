import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShoppingCart, Tag, Zap, CheckCircle2, Shield, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';
import ProductSvg from '../components/common/ProductSvg';
import useWindowWidth from '../hooks/useWindowWidth';

export default function FestivalPage() {
  const { festivalId } = useParams();
  const festivalType = festivalId === 'onam' ? 'onam' : 'raksha-bandhan';
  
  const { addItem } = useCart();
  const { showToast } = useToast();
  const w = useWindowWidth();
  const isMobile = w <= 640;

  const [activeTab, setActiveTab] = useState('all');
  const [selectedPin, setSelectedPin] = useState(null);

  // Products Data for Raksha Bandhan
  const rakhiProducts = [
    { id: 8001, name: "Handcrafted Designer Golden & Red Kundan Rakhi", price: 239, mrp: 1049, discount: 77, weight: "1 Unit", image: "rakhi-designer-gold", category: "rakhi", isBestseller: true },
    { id: 8002, name: "Royal Blue Peacock Feather Enamel Stone Rakhi", price: 189, mrp: 599, discount: 68, weight: "1 Unit", image: "rakhi-peacock-stone", category: "rakhi" },
    { id: 8003, name: "Sacred Sterling Silver Om & Rudraksha Rakhi Thread", price: 199, mrp: 699, discount: 71, weight: "1 Unit", image: "rakhi-silver-rudraksha", category: "rakhi" },
    { id: 8004, name: "Cute Superhero Star Cartoon Kids Soft Rakhi", price: 129, mrp: 349, discount: 63, weight: "1 Unit", image: "rakhi-kids-cartoon", category: "rakhi" },
    { id: 8005, name: "Cadbury Celebrations Rich Dry Fruit Gift Box", price: 349, mrp: 450, discount: 22, weight: "177 g", image: "fest-chocolates.jpg", category: "chocolates" },
    { id: 8006, name: "Haldiram's Pure Desi Ghee Kaju Katli 400g", price: 399, mrp: 500, discount: 20, weight: "400 g", image: "https://res.cloudinary.com/hmx3azp6/image/upload/v1787645105/grabit_media/fest_mithai.jpg", category: "sweets" },
    { id: 8007, name: "Traditional Brass Pooja Thali Set with Diya & Roli", price: 299, mrp: 699, discount: 57, weight: "1 Set", image: "pooja-thali-brass", category: "pooja" },
    { id: 8008, name: "Park Avenue Premium Men's Grooming Gift Kit", price: 449, mrp: 899, discount: 50, weight: "Pack of 5", image: "mens-grooming-kit", category: "gifts" },
  ];

  // Products Data for Onam Sadhya
  const onamProducts = [
    { id: 9001, name: "Kerala Special Nendran Banana Chips in Coconut Oil", price: 135, mrp: 180, discount: 25, weight: "200 g", image: "banana-chips-kerala", category: "chips", isBestseller: true },
    { id: 9002, name: "MTR Palada Payasam Dessert Mix", price: 85, mrp: 110, discount: 22, weight: "300 g", image: "mtr-payasam-mix", category: "payasam" },
    { id: 9003, name: "Traditional Kerala Kasavu Cotton Saree & Mundu", price: 899, mrp: 1999, discount: 55, weight: "1 Unit", image: "kerala-kasavu-saree", category: "wear" },
    { id: 9004, name: "Handcrafted Brass Nilavilakku Puja Oil Lamp", price: 349, mrp: 750, discount: 53, weight: "1 Unit", image: "brass-nilavilakku-lamp", category: "puja" },
    { id: 9005, name: "Fresh Farm Organic Green Banana Leaves", price: 49, mrp: 75, discount: 34, weight: "5 Leaves", image: "fresh-produce-hero-green", category: "fresh" },
    { id: 9006, name: "Amul Pure Cow Ghee for Sadhya Prep", price: 285, mrp: 320, discount: 10, weight: "500 ml", image: "amul-ghee-tin", category: "sadhya" },
    { id: 9007, name: "Eastern Kerala Sambar & Rasam Spice Powder Combo", price: 115, mrp: 150, discount: 23, weight: "200 g", image: "eastern-sambar-powder", category: "sadhya" },
    { id: 9008, name: "Kerala Rice Pappadam Pack", price: 45, mrp: 60, discount: 25, weight: "100 g", image: "kerala-rice-pappadam", category: "chips" },
  ];

  const currentProducts = festivalType === 'raksha-bandhan' ? rakhiProducts : onamProducts;

  // Filter products based on active tab
  const filteredProducts = currentProducts.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'under199') return p.price <= 199;
    if (activeTab === 'combos') return p.discount >= 25;
    return p.category === activeTab;
  });

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. RAKSHA BANDHAN HERO SHOWCASE (COMPACT MOBILE VIEW FIT)                 */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {festivalType === 'raksha-bandhan' ? (
        <div style={{
          background: 'linear-gradient(135deg, #4A040D 0%, #7A0A19 50%, #9B1123 100%)',
          color: 'white',
          padding: isMobile ? '12px 10px 14px' : '32px 24px 40px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '3px solid #FDE047'
        }}>
          {/* Back Navigation Bar */}
          <div className="container" style={{ marginBottom: isMobile ? '6px' : '20px' }}>
            <Link to="/" style={{ color: '#FEF08A', textDecoration: 'none', fontSize: isMobile ? '11px' : '13px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={isMobile ? 13 : 16} /> Back to Home
            </Link>
          </div>

          <div className="container" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 125px' : '1fr 1fr',
            gap: isMobile ? '8px' : '24px',
            alignItems: 'center'
          }}>
            
            {/* Left Header Title */}
            <div>
              <div style={{
                background: 'rgba(253, 224, 71, 0.15)', border: '1px solid rgba(253, 224, 71, 0.4)',
                color: '#FEF08A', fontSize: isMobile ? '9px' : '12px', fontWeight: 900,
                padding: isMobile ? '2px 8px' : '4px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}>
                <Sparkles size={isMobile ? 11 : 14} color="#FDE047" /> RAKSHA BANDHAN 2026
              </div>

              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: isMobile ? '18px' : '42px', fontWeight: 900,
                color: '#FDE047', lineHeight: 1.1, marginTop: '4px',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}>
                Festive Ritual <span style={{ color: '#FFFFFF' }}>ESSENTIALS</span>
              </h1>

              {!isMobile && (
                <p style={{ fontSize: '15px', color: '#FEE2E2', marginTop: '8px', lineHeight: 1.4 }}>
                  Handcrafted Designer Rakhis, Desi Ghee Sweets, Gift Hampers &amp; Pooja Thali delivered to your doorstep in 25 mins!
                </p>
              )}

              <div style={{ display: 'flex', gap: '6px', marginTop: isMobile ? '6px' : '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(253,224,71,0.3)', padding: isMobile ? '2px 6px' : '6px 12px', borderRadius: '6px', fontSize: isMobile ? '9px' : '11px', fontWeight: 800, color: '#FEF08A' }}>
                  ⚡ 25-Min Delivery
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(253,224,71,0.3)', padding: isMobile ? '2px 6px' : '6px 12px', borderRadius: '6px', fontSize: isMobile ? '9px' : '11px', fontWeight: 800, color: '#FEF08A' }}>
                  🎁 Free Gift Packaging
                </div>
              </div>
            </div>

            {/* Right Interactive Pooja Thali Graphic (COMPACT FIT FOR MOBILE) */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(254,252,232,0.1) 0%, rgba(254,249,195,0.05) 100%)',
              border: '1.5px solid rgba(253,224,71,0.3)', borderRadius: isMobile ? '12px' : '20px',
              padding: isMobile ? '8px 4px' : '24px',
              textAlign: 'center', position: 'relative'
            }}>
              {!isMobile && (
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#FEF08A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ✨ Traditional Golden Pooja Thali
                </div>
              )}

              <div style={{ position: 'relative', width: isMobile ? '110px' : '300px', height: isMobile ? '110px' : '300px', margin: '0 auto' }}>
                <img
                  src="https://res.cloudinary.com/hmx3azp6/image/upload/v1787645105/grabit_media/fest_mithai.jpg"
                  alt="Raksha Bandhan Pooja Thali"
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%',
                    border: isMobile ? '2px solid #FDE047' : '4px solid #FDE047', boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                  }}
                />

                {/* Interactive Annotation Tags */}
                {[
                  { title: 'Thali', top: '5%', left: '-12%' },
                  { title: 'Rakhi', top: '45%', right: '-15%' },
                  { title: 'Sweets', top: '80%', left: '-10%' },
                ].map((pin, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: pin.top, left: pin.left, right: pin.right,
                    background: 'rgba(92, 6, 18, 0.95)', border: '1px solid #FDE047',
                    color: '#FDE047', fontSize: isMobile ? '7px' : '11px', fontWeight: 900,
                    padding: isMobile ? '1px 4px' : '3px 8px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    whiteSpace: 'nowrap', zIndex: 3
                  }}>
                    {pin.title}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ────────────────────────────────────────────────────────────────────────── */
        /* 2. ONAM SADHYA HERO SHOWCASE (COMPACT MOBILE VIEW FIT)                    */
        /* ────────────────────────────────────────────────────────────────────────── */
        <div style={{
          background: 'linear-gradient(135deg, #023829 0%, #045C43 50%, #057A59 100%)',
          color: 'white',
          padding: isMobile ? '12px 10px 14px' : '32px 24px 40px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '3px solid #10B981'
        }}>
          {/* Back Navigation Bar */}
          <div className="container" style={{ marginBottom: isMobile ? '6px' : '20px' }}>
            <Link to="/" style={{ color: '#A7F3D0', textDecoration: 'none', fontSize: isMobile ? '11px' : '13px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={isMobile ? 13 : 16} /> Back to Home
            </Link>
          </div>

          <div className="container" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 125px' : '1fr 1fr',
            gap: isMobile ? '8px' : '24px',
            alignItems: 'center'
          }}>
            
            {/* Left Header Title */}
            <div>
              <div style={{
                background: 'rgba(167, 243, 208, 0.15)', border: '1px solid rgba(167, 243, 208, 0.4)',
                color: '#A7F3D0', fontSize: isMobile ? '9px' : '12px', fontWeight: 900,
                padding: isMobile ? '2px 8px' : '4px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}>
                <Sparkles size={isMobile ? 11 : 14} color="#6EE7B7" /> KERALA ONAM 2026
              </div>

              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: isMobile ? '18px' : '42px', fontWeight: 900,
                color: '#FDE047', lineHeight: 1.1, marginTop: '4px',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}>
                Grand Onam <span style={{ color: '#FFFFFF' }}>SADHYA</span>
              </h1>

              {!isMobile && (
                <p style={{ fontSize: '15px', color: '#D1FAE5', marginTop: '8px', lineHeight: 1.4 }}>
                  Fresh Nendran Banana Chips, Palada Payasam, Organic Banana Leaves, Sambar Spices &amp; Kasavu Wear delivered in 25 mins!
                </p>
              )}

              <div style={{ display: 'flex', gap: '6px', marginTop: isMobile ? '6px' : '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167,243,208,0.3)', padding: isMobile ? '2px 6px' : '6px 12px', borderRadius: '6px', fontSize: isMobile ? '9px' : '11px', fontWeight: 800, color: '#A7F3D0' }}>
                  ⚡ 25-Min Delivery
                </div>
              </div>
            </div>

            {/* Right Interactive Sadhya Banana Leaf Diagram (COMPACT FIT FOR MOBILE) */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(240,253,244,0.1) 0%, rgba(220,252,231,0.05) 100%)',
              border: '1.5px solid rgba(110,231,183,0.3)', borderRadius: isMobile ? '12px' : '20px',
              padding: isMobile ? '6px 4px' : '24px',
              textAlign: 'center'
            }}>
              {/* 3 Circular Dishes Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? '4px' : '12px' }}>
                {[
                  { name: 'Sambar', img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645121/grabit_media/oil_real.jpg' },
                  { name: 'Payasam', img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645105/grabit_media/fest_mithai.jpg' },
                  { name: 'Chips', img: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645065/grabit_media/deal_banner_dryfruits.jpg' },
                ].map((dish, idx) => (
                  <div key={idx} style={{
                    background: '#034E39', border: '1px solid #10B981', borderRadius: '8px',
                    padding: isMobile ? '3px 2px' : '6px 4px', textAlign: 'center'
                  }}>
                    <div style={{ width: isMobile ? '24px' : '36px', height: isMobile ? '24px' : '36px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 2px', border: '1px solid #FDE047' }}>
                      <img src={dish.img} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontSize: isMobile ? '8px' : '10px', fontWeight: 900, color: '#FDE047' }}>{dish.name}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 3. FILTER TABS & PRODUCT LISTINGS ("Rakhi For Every Budget" / "Sadhya Items") */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="container" style={{ marginTop: '24px' }}>
        
        {/* Filter Pills */}
        <div style={{
          display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px',
          marginBottom: '20px', msOverflowStyle: 'none', scrollbarWidth: 'none'
        }}>
          {[
            { id: 'all', label: festivalType === 'raksha-bandhan' ? 'All Festive Essentials' : 'All Sadhya Essentials' },
            { id: 'under199', label: 'Under ₹199 Store' },
            { id: 'combos', label: 'Super Saver Combos' },
            { id: 'rakhi', label: festivalType === 'raksha-bandhan' ? 'Designer Rakhis' : 'Payasam & Sweets' },
            { id: 'sweets', label: festivalType === 'raksha-bandhan' ? 'Mithai & Chocolates' : 'Puja & Brass Lamps' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? (festivalType === 'raksha-bandhan' ? '#850A1A' : '#046A4D') : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                border: `1.5px solid ${activeTab === tab.id ? (festivalType === 'raksha-bandhan' ? '#850A1A' : '#046A4D') : '#CBD5E1'}`,
                borderRadius: '20px', padding: '8px 18px', fontSize: '13px', fontWeight: 800,
                cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section Headline */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 900, color: '#0F172A' }}>
            {festivalType === 'raksha-bandhan' ? '🛍️ Rakhi Specials & Gift Packs' : '🌴 Onam Sadhya & Puja Items'}
          </h2>
          <span style={{ fontSize: '12px', color: '#0F9D58', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={14} /> 25 Min Delivery
          </span>
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px'
        }}>
          {filteredProducts.map((prod, idx) => (
            <ProductCard
              key={prod.id}
              product={prod}
              badge={`${prod.discount}% OFF`}
              badgeColor={festivalType === 'raksha-bandhan' ? '#850A1A' : '#046A4D'}
            />
          ))}
        </div>

      </div>

    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useWishlist } from '../../context/WishlistContext';
import ProductSvg from './ProductSvg';

export default function ProductCard({ product, badge, badgeColor = '#E53935', initialQty = 0 }) {
  const { addItem, updateQty, getItemQty } = useCart();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const cartQty = getItemQty(product.id);
  
  const [localQty, setLocalQty] = useState(initialQty);
  const qty = cartQty > 0 ? cartQty : localQty;

  const handleAdd = (e) => {
    e.preventDefault();
    if (initialQty > 0) setLocalQty(1);
    addItem(product);
  };

  const handleMinus = (e) => {
    e.preventDefault();
    if (qty > 1) {
      if (initialQty > 0) setLocalQty(qty - 1);
      updateQty(product.id, qty - 1);
    } else {
      if (initialQty > 0) setLocalQty(0);
      updateQty(product.id, 0);
    }
  };

  const handlePlus = (e) => {
    e.preventDefault();
    if (initialQty > 0) setLocalQty(qty + 1);
    updateQty(product.id, qty + 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #D2D2D7',
      borderRadius: '12px',
      padding: '12px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(29,29,31,0.03)',
      transition: 'all 0.15s'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(29,29,31,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(29,29,31,0.03)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Top Left Discount Badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          background: badgeColor === '#E53935' ? '#FF3B30' : badgeColor, color: 'white',
          fontSize: '9px', fontWeight: 800, padding: '2px 6px',
          borderRadius: '4px', zIndex: 2
        }}>
          {badge}
        </div>
      )}

      {/* Top Right Wishlist Heart */}
      <button
        type="button"
        onClick={handleWishlist}
        aria-label="Add to Wishlist"
        style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          width: '26px', height: '26px',
          minWidth: '26px', maxWidth: '26px',
          minHeight: '26px', maxHeight: '26px',
          padding: 0, margin: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
          zIndex: 3, cursor: 'pointer',
          transition: 'transform 0.15s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <Heart
          size={13}
          fill={wishlisted ? '#FF3B30' : 'none'}
          color={wishlisted ? '#FF3B30' : '#8E8E93'}
          strokeWidth={2}
        />
      </button>

      {/* Product Image Box */}
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          background: '#F8FAFC',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 4px',
          marginBottom: '8px',
          height: '105px'
        }}>
          <ProductSvg name={product.image} size={88} />
        </div>
      </Link>

      {/* Product Details */}
      <div>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#1D1D1F',
            lineHeight: 1.3,
            marginBottom: '3px',
            height: '28px',
            overflow: 'hidden'
          }}>
            {product.name}
          </div>
        </Link>

        {/* Price Line */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#1D1D1F' }}>
            ₹{product.price}
          </span>
          {product.mrp > product.price && (
            <span style={{ fontSize: '10px', color: '#86868B', textDecoration: 'line-through' }}>
              ₹{product.mrp}
            </span>
          )}
        </div>

        {/* Rating Line & Add Button / Qty Selector in Single Line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '4px' }}>
          {/* Rating Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            background: '#FFF8E1', border: '1px solid #FFE082',
            padding: '4px 6px', borderRadius: '6px', flexShrink: 0
          }}>
            <Star size={11} fill="#FF9500" color="#FF9500" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1D1D1F' }}>
              {product.rating}
            </span>
          </div>

          {/* Add Button or Qty Selector */}
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              style={{
                flex: 1,
                background: 'white',
                border: '1.5px solid #0071E3',
                color: '#0071E3',
                borderRadius: '6px',
                padding: '5px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0071E3'; }}
            >
              Add to Cart
            </button>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#0071E3',
              borderRadius: '6px',
              padding: '3px 8px',
              height: '28px',
              boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)'
            }}>
              <button
                onClick={handleMinus}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <Minus size={12} strokeWidth={2.5} />
              </button>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{qty}</span>
              <button
                onClick={handlePlus}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

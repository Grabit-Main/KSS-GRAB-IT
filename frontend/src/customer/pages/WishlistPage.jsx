import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';
import useWindowWidth from '../hooks/useWindowWidth';

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addItem, getItemQty } = useCart();
  const { showToast } = useToast();
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  const handleAddAllToCart = () => {
    if (!wishlistItems || wishlistItems.length === 0) return;

    let addedCount = 0;
    let outOfStockCount = 0;
    let alreadyInCartCount = 0;

    wishlistItems.forEach(item => {
      // 1. Stock / availability validation
      const isOutOfStock = item.inStock === false || item.stock_quantity === 0 || item.isOutOfStock === true;
      if (isOutOfStock) {
        outOfStockCount++;
        return;
      }

      // 2. Deduplication check against cart
      const currentQty = getItemQty(item.id);
      if (currentQty > 0) {
        alreadyInCartCount++;
        return;
      }

      addItem(item);
      addedCount++;
    });

    if (addedCount > 0) {
      let msg = `Added ${addedCount} saved ${addedCount === 1 ? 'item' : 'items'} to Cart!`;
      if (alreadyInCartCount > 0) msg += ` (${alreadyInCartCount} already in cart)`;
      if (outOfStockCount > 0) msg += ` (${outOfStockCount} out of stock)`;
      showToast(msg);
    } else if (alreadyInCartCount > 0 && outOfStockCount === 0) {
      showToast('All available items are already in your cart.');
    } else if (outOfStockCount > 0) {
      showToast('Saved items could not be added because they are out of stock.');
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: isMobile ? '28px 12px 90px' : '40px 24px 60px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header Title */}
        <div style={{
          marginTop: isMobile ? '12px' : '16px',
          background: '#FFFFFF', borderRadius: isMobile ? '16px' : '20px',
          border: '1px solid #E2E8F0', padding: isMobile ? '18px 16px' : '28px 36px',
          marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Heart size={22} color="#E53935" fill="#E53935" />
              <h1 style={{ fontSize: isMobile ? '22px' : '30px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                My Saved Wishlist
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 500 }}>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#0F9D58', color: '#FFFFFF',
                padding: '10px 20px', borderRadius: '10px',
                border: 'none', fontSize: '13px', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,157,88,0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <ShoppingBag size={16} color="#FFFFFF" />
              <span>Add All to Cart</span>
            </button>
          )}
        </div>

        {/* Wishlist Items Grid / Empty State */}
        {wishlistItems.length === 0 ? (
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
            padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#FFEBEE',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <Heart size={40} color="#E53935" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              Tap the heart icon on any product to save items you love for later.
            </p>
            <Link
              to="/categories"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#0066FF', color: '#FFFFFF',
                padding: '12px 24px', borderRadius: '12px',
                fontSize: '14px', fontWeight: 800, textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,102,255,0.25)'
              }}
            >
              <ArrowLeft size={16} />
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '12px' : '20px'
          }}>
            {wishlistItems.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

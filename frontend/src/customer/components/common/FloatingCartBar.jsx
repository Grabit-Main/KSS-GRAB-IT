import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import useWindowWidth from '../../hooks/useWindowWidth';

export default function FloatingCartBar() {
  const cart = useCart() || {};
  const totalItems = cart.totalItems || 0;
  const toPay = cart.toPay || 0;
  const location = useLocation() || { pathname: '/' };
  const w = useWindowWidth();
  const isMobile = w <= 768;

  // Do not show on cart or checkout pages
  const isCartOrCheckout = location.pathname === '/cart' || location.pathname === '/checkout';

  if (!totalItems || totalItems === 0 || isCartOrCheckout) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '82px' : '36px',
      left: 0,
      right: 0,
      margin: '0 auto',
      zIndex: 999,
      width: isMobile ? 'calc(100% - 64px)' : '290px',
      maxWidth: '320px',
      boxSizing: 'border-box',
      animation: 'floatingCartSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <Link to="/cart" style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
          borderRadius: '16px',
          padding: '8px 14px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 14px 32px rgba(0, 113, 227, 0.45), 0 4px 14px rgba(0, 0, 0, 0.14)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          cursor: 'pointer',
          boxSizing: 'border-box',
          animation: 'floatingLevitatePulse 3.2s ease-in-out infinite',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.animationPlayState = 'paused';
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 20px 44px rgba(0, 113, 227, 0.55)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.animationPlayState = 'running';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 14px 32px rgba(0, 113, 227, 0.45)';
        }}
        >
          {/* Left: Cart Icon Badge + Item Count & Total */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', flexShrink: 0
            }}>
              <ShoppingBag size={17} color="#FFFFFF" />
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#34C759', color: '#FFFFFF',
                fontSize: '9.5px', fontWeight: 900,
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #FFFFFF', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {totalItems}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px', textTransform: 'uppercase', lineHeight: 1 }}>
                {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
                ₹{toPay}
              </div>
            </div>
          </div>

          {/* Right: View Cart Button with Arrow */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(255, 255, 255, 0.22)',
            padding: '7px 12px', borderRadius: '10px',
            color: '#FFFFFF', fontSize: '12px', fontWeight: 900,
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <span>View Cart</span>
            <ArrowRight size={14} color="#FFFFFF" />
          </div>
        </div>
      </Link>
    </div>
  );
}

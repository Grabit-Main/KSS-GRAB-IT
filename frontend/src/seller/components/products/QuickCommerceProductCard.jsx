import React, { useState } from 'react';
import {
  Heart,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Edit2,
  Trash2,
} from 'lucide-react';

export const QuickCommerceProductCard = ({
  product,
  onEdit,
  onDelete,
  onQuickStockAdjust,
  onQuickStockToggle,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const stock = parseInt(product.stock_quantity, 10) || 0;
  const isOutOfStock = stock <= 0;

  return (
    <div
      className="quick-commerce-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: isOutOfStock ? '1px solid rgba(255, 59, 48, 0.3)' : '1px solid #EBEBED',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* 1. Media Image Container (Full bleed rounded container matching reference) */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#F7F6F3',
          borderRadius: '12px',
          height: '145px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={product.image && !product.image.includes('\\') && !product.image.startsWith('C:') ? product.image : 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&auto=format&fit=crop&q=80'}
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&auto=format&fit=crop&q=80';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isOutOfStock ? 'grayscale(40%)' : 'none',
          }}
        />

        {/* Heart Wishlist Button (Top-Right) */}
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          title="Wishlist"
        >
          <Heart
            size={13}
            color={isFavorite ? 'var(--color-red)' : '#8E8E93'}
            fill={isFavorite ? 'var(--color-red)' : 'none'}
          />
        </button>

        {/* Stock Alert Badge (Top-Left) */}
        {stock === 1 ? (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#FF3B30',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            ⚡ 1 Left!
          </span>
        ) : stock === 2 ? (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            ⚡ 2 Left!
          </span>
        ) : isOutOfStock ? (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#FF3B30',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            Sold Out
          </span>
        ) : null}

        {/* Image Pagination Dots (Bottom-Left) */}
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)' }} />
          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.5)' }} />
          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.5)' }} />
        </div>
      </div>

      {/* 2. Unit Label & ADD / Stepper Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
          marginBottom: 4,
        }}
      >
        {/* Unit */}
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-graphite)' }}>
          {product.unit || '1 unit'}
        </span>

        {/* ADD Button / Stepper */}
        {isOutOfStock ? (
          <button
            type="button"
            onClick={() => onQuickStockToggle(product)}
            style={{
              border: '1.5px solid var(--color-green)',
              backgroundColor: '#E8F9EE',
              color: 'var(--color-green)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            RESTOCK
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1.5px solid #279A48',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                padding: '2px 4px',
                gap: 4,
              }}
            >
              <button
                type="button"
                onClick={() => onQuickStockAdjust(product, -1)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#0C831F',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1px 3px',
                }}
                title="Decrease Stock"
              >
                <Minus size={11} strokeWidth={3} />
              </button>

              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0C831F', minWidth: 16, textAlign: 'center' }}>
                {stock}
              </span>

              <button
                type="button"
                onClick={() => onQuickStockAdjust(product, 1)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#0C831F',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1px 3px',
                }}
                title="Increase Stock"
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
            {product.options_text && (
              <span style={{ fontSize: '9px', color: '#64748B', marginTop: 1 }}>
                {product.options_text}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Pricing Row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, margin: '2px 0 3px' }}>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-graphite)' }}>
          ₹{(parseFloat(product?.discount_price || product?.price) || 0).toFixed(0)}
        </span>
        {product?.discount_price && (
          <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)', textDecoration: 'line-through' }}>
            ₹{(parseFloat(product?.price) || 0).toFixed(0)}
          </span>
        )}
      </div>

      {/* 4. Product Name */}
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-graphite)',
          lineHeight: '1.25',
          margin: '0 0 5px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '32px',
        }}
      >
        {product.name}
      </h3>

      {/* 5. Delivery Time SLA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: 5 }}>
        <Clock size={11} color="#64748B" />
        <span>{product.delivery_time || '8 mins'}</span>
      </div>

      {/* 6. Recipe Pill (from reference image) */}
      {product.recipes_count && (
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              backgroundColor: '#EDF9F1',
              color: '#0C831F',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <span>{product.recipes_count} recipes</span>
            <ChevronRight size={10} />
          </span>
        </div>
      )}

      {/* 7. Seller Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 4,
          marginTop: 'auto',
          paddingTop: 8,
          borderTop: '1px solid #F0F0F2',
        }}
      >
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}
          title="Edit"
        >
          <Edit2 size={11} />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(product)}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '4px 6px',
            fontSize: '11px',
            color: 'var(--color-red)',
            borderColor: 'rgba(255, 59, 48, 0.25)',
            backgroundColor: '#FFF9F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
          title="Delete"
        >
          <Trash2 size={11} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

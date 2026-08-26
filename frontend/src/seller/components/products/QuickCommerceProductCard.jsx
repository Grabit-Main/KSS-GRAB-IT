import React from 'react';
import {
  Clock,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Star,
} from 'lucide-react';
import { resolveMediaUrl, DEFAULT_PRODUCT_FALLBACK } from '../../utils/mediaResolver';

export const QuickCommerceProductCard = ({
  product,
  onEdit,
  onDelete,
  onQuickStockAdjust,
  onQuickStockToggle,
}) => {
  const stock = parseInt(product.stock_quantity, 10) || 0;
  const isOutOfStock = stock <= 0;
  const discount = product.discount || (product.mrp && product.price && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);

  return (
    <div
      className="quick-commerce-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: isOutOfStock ? '1.5px dashed #CBD5E1' : '1px solid #E2E8F0',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: isOutOfStock ? 'none' : '0 1px 4px rgba(0,0,0,0.03)',
        opacity: isOutOfStock ? 0.85 : 1,
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* 1. Media Image Container */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          height: '135px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
        }}
      >
        <img
          src={resolveMediaUrl(product.image || product.image_url, DEFAULT_PRODUCT_FALLBACK)}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_PRODUCT_FALLBACK;
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: isOutOfStock ? 'grayscale(60%)' : 'none',
          }}
        />

        {/* Stock Status Badge (Top-Left) */}
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: isOutOfStock ? '#EF4444' : stock <= 5 ? '#F59E0B' : '#10B981',
            color: '#FFFFFF',
            fontSize: '9.5px',
            fontWeight: 800,
            padding: '2.5px 7px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            zIndex: 2,
          }}
        >
          {isOutOfStock ? '🔴 Out of Stock' : stock <= 5 ? `⚡ Low (${stock})` : `🟢 In Stock (${stock})`}
        </span>

        {/* Discount Badge (Top-Right) */}
        {discount > 0 && !isOutOfStock && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#FF3B30',
              color: '#FFFFFF',
              fontSize: '9.5px',
              fontWeight: 800,
              padding: '2.5px 6px',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              zIndex: 2,
            }}
          >
            {discount}% OFF
          </span>
        )}
      </div>

      {/* 2. Content Body */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: 10 }}>
        {/* Product Title */}
        <h3
          style={{
            fontSize: '12.5px',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: '1.3',
            margin: '0 0 4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '33px',
          }}
        >
          {product.name}
        </h3>

        {/* Unit, Brand & Category Subtitle */}
        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.unit || '1 unit'} • {product.brand || product.category_name || 'Grocery'}
        </div>

        {/* Price, SLA, & Customer Rating Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
              ₹{(parseFloat(product?.price) || 0).toFixed(0)}
            </span>
            {product?.mrp && parseFloat(product.mrp) > parseFloat(product.price) && (
              <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                ₹{(parseFloat(product.mrp) || 0).toFixed(0)}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Customer Rating */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: '#FFF8E1',
                border: '1px solid #FFE082',
                borderRadius: '4px',
                padding: '1px 4px',
                fontSize: '10px',
                fontWeight: 800,
                color: '#854D0E',
              }}
            >
              <Star size={10} fill="#EAB308" color="#EAB308" />
              <span>{product.rating || '4.8'}</span>
            </div>

            {/* Delivery Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '10.5px', color: '#64748B', fontWeight: 700 }}>
              <Clock size={11} color="#0071E3" />
              <span>{product.delivery_time || '10m'}</span>
            </div>
          </div>
        </div>

        {/* Quick Stock Management Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #F1F5F9',
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#475569' }}>
            Stock Qty:
          </span>

          {isOutOfStock ? (
            <button
              type="button"
              onClick={() => onQuickStockToggle(product)}
              style={{
                border: '1px solid #A7F3D0',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '10.5px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + Add Stock
            </button>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #CBD5E1',
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
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1px 2px',
                }}
                title="Decrease Stock"
              >
                <Minus size={11} strokeWidth={3} />
              </button>

              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', minWidth: 18, textAlign: 'center' }}>
                {stock}
              </span>

              <button
                type="button"
                onClick={() => onQuickStockAdjust(product, 1)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1px 2px',
                }}
                title="Increase Stock"
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>

        {/* Actions: Edit & Delete */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            marginTop: 'auto',
            paddingTop: 6,
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '5px 8px', fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: '8px' }}
            title="Edit Product"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '5px 8px',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#EF4444',
              borderColor: '#FECACA',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              borderRadius: '8px',
            }}
            title="Delete Product"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickCommerceProductCard;

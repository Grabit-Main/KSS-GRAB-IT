import React, { useState } from 'react';
import {
  Folder,
  Layers,
  Package,
  Edit2,
  Trash2,
  CornerDownRight,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { resolveMediaUrl, DEFAULT_CATEGORY_FALLBACK } from '../../utils/mediaResolver';

export const CategoryCard = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (e) => {
    if (e) e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      await onToggleStatus(category.id);
    } finally {
      setToggling(false);
    }
  };

  const isActive = Boolean(category.is_active);
  const imageUrl = resolveMediaUrl(category.image || category.image_url || category.icon || category.slug, DEFAULT_CATEGORY_FALLBACK);

  return (
    <div
      className="category-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: isActive ? '1px solid #E2E8F0' : '1px dashed #CBD5E1',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
        opacity: isActive ? 1 : 0.85,
        transition: 'all 0.15s ease',
      }}
    >
      {/* 1. Category Image Thumbnail */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          height: '140px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        }}
      >
        <img
          src={imageUrl}
          alt={category.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: isActive ? 'none' : 'grayscale(70%)',
            transition: 'filter 0.2s ease',
          }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_CATEGORY_FALLBACK;
          }}
        />





        {/* 🌟 INTERACTIVE STATUS PILL (Top-Left of Image) */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          title={isActive ? "Click to set category Inactive (Hide from customer store)" : "Click to set category Active (Show in customer store)"}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: isActive ? '#ECFDF5' : '#F1F5F9',
            border: isActive ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
            color: isActive ? '#059669' : '#64748B',
            fontSize: '10.5px',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
          }}
        >
          {toggling ? (
            <Loader2 size={11} className="spin" />
          ) : isActive ? (
            <CheckCircle2 size={11} color="#059669" />
          ) : (
            <XCircle size={11} color="#64748B" />
          )}
          <span>{isActive ? 'Active' : 'Inactive'}</span>
        </button>

        {/* Image Pagination Dots */}
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
        </div>
      </div>

      {/* 2. Content Body */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: 8 }}>
        {/* Parent Category Link Tag */}
        {category.parent_details && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: '11px',
              color: '#0071E3',
              backgroundColor: '#EFF6FF',
              padding: '1px 6px',
              borderRadius: '4px',
              marginBottom: 4,
              alignSelf: 'flex-start',
              fontWeight: 600,
            }}
            title={`Parent Category: ${category.parent_details.name}`}
          >
            <CornerDownRight size={10} />
            <span>{category.parent_details.name}</span>
          </div>
        )}

        {/* Category Name */}
        <h3
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: '1.3',
            margin: '2px 0 4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '32px',
          }}
        >
          {category.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '11px',
            color: '#64748B',
            lineHeight: '1.3',
            margin: '0 0 8px',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {category.description || 'Grocery & daily essential items'}
        </p>

        {/* 🌟 METRICS BAR & INTERACTIVE SLIDER SWITCH */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTop: '1px solid #F1F5F9',
            fontSize: '11px',
            color: '#64748B',
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span title="Subcategories count" style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#334155', fontWeight: 700 }}>
              <Layers size={12} color="#94A3B8" />
              {category.subcategory_count || 0}
            </span>
            <span title="Products count" style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#334155', fontWeight: 700 }}>
              <Package size={12} color="#94A3B8" />
              {category.product_count || 0}
            </span>
          </div>

          {/* 🌟 Sleek Custom Pill Switch */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            title={isActive ? "Deactivate Category" : "Activate Category"}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: isActive ? '#ECFDF5' : '#F1F5F9',
              border: isActive ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
              borderRadius: '20px',
              padding: '3px 8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: 24,
                height: 14,
                borderRadius: '10px',
                backgroundColor: isActive ? '#10B981' : '#CBD5E1',
                position: 'relative',
                transition: 'background-color 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: 2,
                  left: isActive ? 12 : 2,
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: isActive ? '#065F46' : '#64748B' }}>
              {isActive ? 'Active' : 'Hidden'}
            </span>
          </button>
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
            onClick={() => onEdit(category)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '5px 8px', fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: '8px' }}
            title="Edit Category Details"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
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
            title="Delete Category"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;

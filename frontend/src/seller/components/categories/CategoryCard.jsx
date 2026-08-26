import React, { useState } from 'react';
import {
  Folder,
  Layers,
  Package,
  Edit2,
  Trash2,
  CornerDownRight,
  Heart,
} from 'lucide-react';
import { Toggle } from '../common/Toggle';

export const CategoryCard = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [toggling, setToggling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggle = async (newStatus) => {
    setToggling(true);
    try {
      await onToggleStatus(category.id);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className="category-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #EBEBED',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* 1. Media Image Container (Matching Quick-Commerce Cards) */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#F7F6F3',
          borderRadius: '12px',
          height: '135px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {category.image_url || category.image ? (
          <img
            src={category.image_url || category.image}
            alt={category.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: category.is_active ? 'none' : 'grayscale(40%)',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className="no-image-placeholder"
          style={{
            display: category.image_url || category.image ? 'none' : 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 4,
            color: 'var(--color-soft-gray)',
          }}
        >
          <Folder size={28} color="var(--color-soft-gray)" />
          <span style={{ fontSize: '11px' }}>No image</span>
        </div>

        {/* Heart Wishlist Icon (Top-Right) */}
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
          title="Favorite"
        >
          <Heart
            size={13}
            color={isFavorite ? 'var(--color-red)' : '#8E8E93'}
            fill={isFavorite ? 'var(--color-red)' : 'none'}
          />
        </button>

        {/* Status Pill Badge on Top-Left */}
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: category.is_active ? 'var(--color-green)' : 'var(--color-soft-gray)',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 'var(--radius-full)',
            letterSpacing: '0.2px',
          }}
        >
          {category.is_active ? 'Active' : 'Inactive'}
        </span>

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
              color: 'var(--color-blue)',
              backgroundColor: 'var(--color-blue-light)',
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
            fontWeight: 700,
            color: 'var(--color-graphite)',
            lineHeight: '1.25',
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
            color: 'var(--color-soft-gray)',
            lineHeight: '1.3',
            margin: '0 0 6px',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {category.description || 'Grocery & essential items category'}
        </p>

        {/* Metrics Bar & Active Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 6,
            borderTop: '1px solid #F0F0F2',
            fontSize: '11px',
            color: 'var(--color-soft-gray)',
            marginBottom: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span title="Subcategories count" style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--color-graphite)', fontWeight: 600 }}>
              <Layers size={11} color="var(--color-soft-gray)" />
              {category.subcategory_count || 0}
            </span>
            <span title="Products count" style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--color-graphite)', fontWeight: 600 }}>
              <Package size={11} color="var(--color-soft-gray)" />
              {category.product_count || 0}
            </span>
          </div>

          <Toggle
            checked={category.is_active}
            onChange={handleToggle}
            disabled={toggling}
            id={`toggle-cat-${category.id}`}
          />
        </div>

        {/* Actions: Edit & Delete */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
            marginTop: 'auto',
            paddingTop: 6,
            borderTop: '1px solid #F0F0F2',
          }}
        >
          <button
            onClick={() => onEdit(category)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}
            title="Edit"
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(category)}
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
    </div>
  );
};

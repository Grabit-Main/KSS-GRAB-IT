import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Edit2,
  Trash2
} from 'lucide-react';

const TreeItem = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
  level = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const children = category.children || category.subcategories || [];
  const hasChildren = children.length > 0;

  return (
    <div style={{ marginLeft: level * 20, width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          marginBottom: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                flexShrink: 0,
              }}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div style={{ width: 24, flexShrink: 0 }} />
          )}

          {expanded && hasChildren ? (
            <FolderOpen size={18} color="#0071E3" style={{ flexShrink: 0 }} />
          ) : (
            <Folder size={18} color="#64748B" style={{ flexShrink: 0 }} />
          )}

          <span
            style={{
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#0F172A',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {category.name}
          </span>

          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(category.id)}
            style={{
              background: category.is_active ? '#ECFDF5' : '#F1F5F9',
              border: category.is_active ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
              color: category.is_active ? '#059669' : '#64748B',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
              marginLeft: 4,
            }}
            title={category.is_active ? 'Click to set Inactive' : 'Click to set Active'}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: category.is_active ? '#10B981' : '#94A3B8',
              }}
            />
            {category.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(category)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#0071E3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
            title="Edit Category"
          >
            <Edit2 size={14} color="#0071E3" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
            title="Delete Category"
          >
            <Trash2 size={14} color="#EF4444" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div style={{ borderLeft: '2px dashed #CBD5E1', marginLeft: 12, paddingLeft: 8 }}>
          {children.map((child) => (
            <TreeItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTreeView = ({
  treeData = [],
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (!treeData.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
        No categories found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {treeData.map((rootCategory) => (
        <TreeItem
          key={rootCategory.id}
          category={rootCategory}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

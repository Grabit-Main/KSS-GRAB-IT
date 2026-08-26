import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Layers,
  Edit2,
  Trash2
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Toggle } from '../common/Toggle';

const TreeItem = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
  level = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.subcategories && category.subcategories.length > 0;

  return (
    <div style={{ marginLeft: level * 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: 'var(--color-pure-white)',
          border: '1px solid var(--color-border-gray)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 8,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-soft-gray)',
                cursor: 'pointer',
                display: 'flex',
                padding: 2,
              }}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div style={{ width: 20 }} />
          )}

          {expanded && hasChildren ? (
            <FolderOpen size={18} color="var(--color-blue)" />
          ) : (
            <Folder size={18} color="var(--color-soft-gray)" />
          )}

          <div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-graphite)' }}>
              {category.name}
            </span>
          </div>

          <Badge variant={category.is_active ? 'active' : 'inactive'} size="sm">
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onEdit(category)}
            className="btn-icon btn-secondary"
            style={{ width: 30, height: 30 }}
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="btn-icon btn-secondary"
            style={{ width: 30, height: 30 }}
            title="Delete"
          >
            <Trash2 size={13} color="var(--color-red)" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div style={{ borderLeft: '2px solid #E5E5EA', marginLeft: 10, paddingLeft: 4 }}>
          {category.subcategories.map((child) => (
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
      <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-soft-gray)' }}>
        No categories found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {treeData.map((rootCategory) => (
        <TreeItem
          key={rootCategory.id}
          category={rootCategory}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          level={0}
        />
      ))}
    </div>
  );
};

import React from 'react';
import { Search, Plus, X, LayoutGrid, Network } from 'lucide-react';
import { Button } from '../common/Button';

export const CategoryFilterBar = ({
  searchQuery,
  onSearchChange,
  statusFilter, // 'all' | 'active' | 'inactive'
  onStatusFilterChange,
  viewMode, // 'grid' | 'tree'
  onViewModeChange,
  onAddClick,
  totalCount = 0,
}) => {
  return (
    <div className="category-filter-wrapper" style={{ marginBottom: 20 }}>
      {/* Search Input Row (Full Width on mobile, flexible on desktop) */}
      <div className="category-search-box" style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-soft-gray)',
            pointerEvents: 'none',
            display: 'flex',
          }}
        >
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="form-control"
          style={{
            paddingLeft: 36,
            paddingRight: searchQuery ? 32 : 12,
            height: 40,
            fontSize: '13px',
            borderRadius: 'var(--radius-sm)',
            width: '100%',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--color-soft-gray)',
              cursor: 'pointer',
              display: 'flex',
              padding: 4,
            }}
            title="Clear Search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Controls Row: Status Filter Tabs + Grid/Tree Toggle + Create Button */}
      <div className="category-controls-row">
        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'inline-flex',
            padding: 3,
            backgroundColor: '#EBEBED',
            borderRadius: 'var(--radius-sm)',
            gap: 2,
          }}
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusFilterChange(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-pure-white)' : 'transparent',
                  color: isActive ? 'var(--color-graphite)' : 'var(--color-soft-gray)',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle (Grid vs Tree) */}
        <div
          style={{
            display: 'inline-flex',
            padding: 3,
            backgroundColor: '#EBEBED',
            borderRadius: 'var(--radius-sm)',
            gap: 2,
          }}
        >
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? 'var(--color-pure-white)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-graphite)' : 'var(--color-soft-gray)',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewModeChange('tree')}
            title="Hierarchy Tree View"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'tree' ? 'var(--color-pure-white)' : 'transparent',
              color: viewMode === 'tree' ? 'var(--color-graphite)' : 'var(--color-soft-gray)',
              boxShadow: viewMode === 'tree' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Network size={15} />
          </button>
        </div>

        {/* Create Category Action */}
        <Button
          variant="primary"
          icon={Plus}
          onClick={onAddClick}
          className="create-cat-btn"
          style={{ marginLeft: 'auto' }}
        >
          Create Category
        </Button>
      </div>
    </div>
  );
};

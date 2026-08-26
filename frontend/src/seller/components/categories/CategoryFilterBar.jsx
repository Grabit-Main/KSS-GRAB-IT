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
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '12px 14px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Top Search Input */}
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748B',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            height: '40px',
            paddingLeft: '38px',
            paddingRight: searchQuery ? '36px' : '12px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#0F172A',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.15s ease',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0071E3';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.backgroundColor = '#F8FAFC';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#E2E8F0',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            title="Clear Search"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Single Fixed Row: Filter Pills (Left) + View Mode & Add Action (Right) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
        }}
      >
        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'inline-flex',
            padding: '3px',
            backgroundColor: '#F1F5F9',
            borderRadius: '9px',
            border: '1px solid #E2E8F0',
            gap: '2px',
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
                type="button"
                onClick={() => onStatusFilterChange(tab.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 600,
                  border: 'none',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#0071E3' : '#64748B',
                  boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Section: View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '3px',
              backgroundColor: '#F1F5F9',
              borderRadius: '9px',
              border: '1px solid #E2E8F0',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? '#0071E3' : '#64748B',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('tree')}
              title="Hierarchy Tree View"
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'tree' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'tree' ? '#0071E3' : '#64748B',
                boxShadow: viewMode === 'tree' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <Network size={15} />
            </button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={onAddClick}
            style={{
              height: '32px',
              padding: '0 10px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '7px',
              whiteSpace: 'nowrap',
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

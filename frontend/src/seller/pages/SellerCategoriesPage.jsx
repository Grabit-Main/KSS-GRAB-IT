import React, { useState, useEffect, useCallback } from 'react';
import { FolderTree, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryCard } from '../components/categories/CategoryCard';
import { CategoryModal } from '../components/categories/CategoryModal';
import { DeleteConfirmModal } from '../components/categories/DeleteConfirmModal';
import { CategoryFilterBar } from '../components/categories/CategoryFilterBar';
import { CategoryTreeView } from '../components/categories/CategoryTreeView';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { categoryService } from '../services/categoryService';

export const SellerCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'tree'
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const { showToast } = useToast();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'tree') {
        const tree = await categoryService.getCategoryTree();
        setTreeData(tree);
        setTotalCount(tree.length);
      } else {
        const params = {
          page_size: 1000,
        };
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (statusFilter === 'active') {
          params.is_active = true;
        } else if (statusFilter === 'inactive') {
          params.is_active = false;
        }

        const res = await categoryService.getCategories(params);
        if (res.results) {
          setCategories(res.results);
          setTotalCount(res.count);
        } else if (Array.isArray(res)) {
          setCategories(res);
          setTotalCount(res.length);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      showToast({ type: 'error', message: 'Failed to load categories. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, viewMode, showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Reset pagination when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (cat) => {
    setDeletingCategory(cat);
  };

  const handleSaved = (savedCategory, isEdit) => {
    showToast({
      type: 'success',
      message: isEdit
        ? `Category "${savedCategory.name}" updated successfully!`
        : `Category "${savedCategory.name}" created successfully!`,
    });
    loadCategories();
  };

  const handleDeleted = (deletedId) => {
    showToast({
      type: 'success',
      message: 'Category deleted successfully.',
    });
    loadCategories();
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await categoryService.toggleStatus(id);
      showToast({
        type: 'success',
        message: res.message || 'Category status updated.',
      });
      // Update locally
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: res.is_active } : c))
      );
      if (viewMode === 'tree') {
        loadCategories();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast({ type: 'error', message: 'Failed to update category status.' });
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-graphite)', letterSpacing: '-0.4px' }}>
          Categories Catalog
        </h2>
        <p style={{ color: 'var(--color-soft-gray)', fontSize: '14px', marginTop: 4 }}>
          Manage your grocery & daily essential categories, nesting structures, and catalog visibility.
        </p>
      </div>

      {/* Filter & Action Bar */}
      <CategoryFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={handleAddCategory}
        totalCount={totalCount}
      />

      {/* Main Content Area */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            color: 'var(--color-soft-gray)',
          }}
        >
          <Loader2 className="animate-spin" size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <span>Loading catalog categories...</span>
        </div>
      ) : viewMode === 'tree' ? (
        <CategoryTreeView
          treeData={treeData}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onToggleStatus={handleToggleStatus}
        />
      ) : categories.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'var(--color-pure-white)',
            border: '1px dashed var(--color-border-gray)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#F5F5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <FolderTree size={28} color="var(--color-soft-gray)" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-graphite)', marginBottom: 6 }}>
            {searchQuery ? 'No matching categories found' : 'No categories created yet'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', maxWidth: 380, margin: '0 auto 20px' }}>
            {searchQuery
              ? `No categories match "${searchQuery}". Try a different keyword or reset filters.`
              : 'Add your first product category (e.g. Dairy, Fruits & Veggies, Beverages) to start selling on Grabit.'}
          </p>
          <Button variant="primary" icon={Plus} onClick={handleAddCategory}>
            Create First Category
          </Button>
        </div>
      ) : (
        <>
          {/* Category Cards Grid */}
          <div className="category-grid">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </>
      )}

      {/* Create / Update Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSaved={handleSaved}
        onDeleteRequest={handleDeleteCategory}
      />

      {/* Delete Category Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        category={deletingCategory}
        onDeleted={handleDeleted}
      />
    </div>
  );
};

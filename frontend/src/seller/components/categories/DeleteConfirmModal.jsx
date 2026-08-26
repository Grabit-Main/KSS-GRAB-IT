import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { categoryService } from '../../services/categoryService';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  category,
  onDeleted,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!category) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage(null);

    try {
      await categoryService.deleteCategory(category.id);
      onDeleted(category.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete category:', err);
      const detail = err.response?.data?.detail || err.response?.data?.error || 'Failed to delete category.';
      setErrorMessage(detail);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Category"
      maxWidth="460px"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Delete Category
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-red-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} color="var(--color-red)" />
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-graphite)', marginBottom: 6 }}>
              Are you sure you want to delete "{category.name}"?
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', lineHeight: '1.4' }}>
              This action cannot be undone. All configuration for this category will be removed.
            </p>
          </div>
        </div>

        {category.subcategory_count > 0 && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FFFBEA',
              border: '1px solid #FFE58F',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: '#874D00',
            }}
          >
            <strong>Note:</strong> This category currently contains {category.subcategory_count} subcategories. Deleting this parent category will convert its subcategories to top-level categories.
          </div>
        )}

        {category.product_count > 0 && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-red-light)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--color-red)',
            }}
          >
            <strong>Warning:</strong> This category has {category.product_count} linked products. You must reassign or remove them before deleting this category.
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-red-light)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--color-red)',
              fontWeight: 500,
            }}
          >
            {errorMessage}
          </div>
        )}
      </div>
    </Modal>
  );
};

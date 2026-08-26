import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, AlertCircle, Folder, Layers, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { Toggle } from '../common/Toggle';
import { Button } from '../common/Button';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { compressImageFile } from '../../utils/imageCompressor';

export const CategoryModal = ({
  isOpen,
  onClose,
  category = null, // null for create, object for edit
  onSaved,
  onDeleteRequest,
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [categoryType, setCategoryType] = useState('category'); // 'category' | 'subcategory'
  const [subCategoryName, setSubCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [parentOptions, setParentOptions] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  // Initialize or reset form when modal opens or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setParentId(category.parent ? String(category.parent) : '');
        setCategoryType(category.parent ? 'subcategory' : 'category');
        setSubCategoryName('');
        setDescription(category.description || '');
        setIsActive(category.is_active ?? true);
        setImagePreview(category.image_url || category.image || null);
        setImageFile(null);
      } else {
        setName('');
        setParentId('');
        setCategoryType('category');
        setSubCategoryName('');
        setDescription('');
        setIsActive(true);
        setImageFile(null);
        setImagePreview(null);
      }
      setErrors({});
      loadParents();
    }
  }, [isOpen, category]);

  const loadParents = async () => {
    setLoadingParents(true);
    try {
      const parents = await categoryService.getParentsList(category?.id);
      setParentOptions(
        parents.map((p) => ({
          value: String(p.id),
          label: p.parent_name ? `${p.parent_name} › ${p.name}` : p.name,
        }))
      );
    } catch (err) {
      console.error('Failed to load parent categories:', err);
    } finally {
      setLoadingParents(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file (PNG, JPG, WebP).' }));
        showToast({ type: 'error', message: 'Please select a valid image file.' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast({ type: 'error', message: 'Image file size must be under 10MB.' });
        return;
      }
      setImageFile(file);
      const compressed = await compressImageFile(file, 450, 450, 0.78);
      setImagePreview(compressed || URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const effectiveName = name.trim() || subCategoryName.trim();
    const errs = {};
    if (!effectiveName) {
      errs.name = 'Please enter a Category Name.';
      showToast({ type: 'error', message: 'Please enter a Category Name.' });
    } else if (effectiveName.length < 2) {
      errs.name = 'Category name must be at least 2 characters.';
      showToast({ type: 'error', message: 'Category name must be at least 2 characters.' });
    }
    if (categoryType === 'subcategory' && !parentId) {
      errs.parent = 'Please select a parent category for the sub-category.';
      showToast({ type: 'error', message: 'Please select a parent category.' });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    const effectiveName = name.trim() || subCategoryName.trim();

    try {
      const formData = new FormData();
      formData.append('name', effectiveName);
      formData.append('description', description.trim());
      formData.append('is_active', isActive);

      if (categoryType === 'subcategory' && parentId) {
        formData.append('parent', parentId);
      } else if (parentId) {
        formData.append('parent', parentId);
      } else {
        formData.append('parent', '');
      }

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview) {
        formData.append('image_url', imagePreview);
      }

      let result;
      if (category?.id) {
        result = await categoryService.updateCategory(category.id, formData);
      } else {
        result = await categoryService.createCategory(formData);

        // If user also provided a nested subcategory name during creation, create it under this parent
        if (subCategoryName.trim() && subCategoryName.trim() !== effectiveName && result?.id) {
          try {
            const subFormData = new FormData();
            subFormData.append('name', subCategoryName.trim());
            subFormData.append('parent', result.id);
            subFormData.append('is_active', true);
            await categoryService.createCategory(subFormData);
          } catch (subErr) {
            console.warn('Subcategory creation note:', subErr);
          }
        }
      }

      onSaved(result, !!category);
      onClose();
    } catch (err) {
      console.error('Failed to save category:', err);
      const respErrors = err.response?.data;
      if (respErrors && typeof respErrors === 'object') {
        const fieldErrors = {};
        for (const [key, val] of Object.entries(respErrors)) {
          fieldErrors[key] = Array.isArray(val) ? val.join(' ') : String(val);
        }
        setErrors(fieldErrors);
        const firstMsg = Object.values(fieldErrors)[0];
        if (firstMsg) {
          showToast({ type: 'error', message: firstMsg });
        }
      } else {
        const msg = err.message || 'An error occurred while saving the category.';
        setErrors({ general: msg });
        showToast({ type: 'error', message: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Update Category' : 'Create Category'}
      maxWidth="560px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
          <div>
            {category && onDeleteRequest && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteRequest(category);
                }}
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#E0352A',
                  backgroundColor: '#FFF2F1',
                  border: '1px solid rgba(255, 59, 48, 0.25)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={13} />
                <span>Delete Category</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ height: 36, fontSize: '13px', borderRadius: 8, padding: '0 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary"
              style={{ height: 36, fontSize: '13px', borderRadius: 8, padding: '0 18px' }}
            >
              {submitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-red-light)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-red)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} />
            <span>{errors.general}</span>
          </div>
        )}

        {/* 1. Category Name */}
        <Input
          label="Category Name"
          required
          placeholder="e.g. Dairy & Breakfast, Fresh Fruits, Beverages"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        {/* 🌟 Category Visibility Status (Active / Inactive) */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: 6 }}>
            <span>Category Status &amp; Visibility</span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>(Controls customer storefront visibility)</span>
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              padding: 4,
              backgroundColor: '#F1F5F9',
              borderRadius: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setIsActive(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 12px',
                borderRadius: '8px',
                border: isActive ? '1px solid #A7F3D0' : 'none',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#059669' : '#64748B',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle2 size={15} color={isActive ? '#059669' : '#94A3B8'} />
              <span>🟢 Active (Visible)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsActive(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 12px',
                borderRadius: '8px',
                border: !isActive ? '1px solid #CBD5E1' : 'none',
                backgroundColor: !isActive ? '#FFFFFF' : 'transparent',
                color: !isActive ? '#475569' : '#64748B',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: !isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <XCircle size={15} color={!isActive ? '#64748B' : '#94A3B8'} />
              <span>⚪ Inactive (Hidden)</span>
            </button>
          </div>
        </div>

        {/* 2. Parent Category (Optional) */}
        <Select
          label="Parent Category (Optional)"
          hint="Leave empty for a top-level category, or choose a parent to nest under."
          placeholder="None (Top Level Root Category)"
          options={parentOptions}
          value={parentId}
          onChange={(e) => {
            setParentId(e.target.value);
            if (e.target.value) {
              setCategoryType('subcategory');
            }
          }}
          error={errors.parent}
          disabled={loadingParents}
        />

        {/* 3. Category Classification Level: Main Category vs Sub Category */}
        <div className="form-group">
          <label className="form-label">Category Classification</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              padding: 4,
              backgroundColor: '#F5F5F7',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setCategoryType('category');
                setParentId('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: categoryType === 'category' ? 'var(--color-pure-white)' : 'transparent',
                color: categoryType === 'category' ? 'var(--color-graphite)' : 'var(--color-soft-gray)',
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: categoryType === 'category' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Folder size={15} />
              Main Category
            </button>

            <button
              type="button"
              onClick={() => setCategoryType('subcategory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: categoryType === 'subcategory' ? 'var(--color-pure-white)' : 'transparent',
                color: categoryType === 'subcategory' ? 'var(--color-blue)' : 'var(--color-soft-gray)',
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: categoryType === 'subcategory' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Layers size={15} />
              Sub Category
            </button>
          </div>
        </div>

        {/* 4. Sub Category (Optional nested subcategory creation) */}
        {!category && categoryType === 'category' && (
          <Input
            label="Sub Category (Optional)"
            placeholder="e.g. Milk & Cream, Exotic Fruits, Cold Drinks"
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
            hint="Optionally create an initial sub-category nested directly inside this category."
          />
        )}

        {/* Description */}
        <Textarea
          label="Description (Optional)"
          placeholder="Short summary of items included under this category..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={2}
        />

        {/* Category Image Upload */}
        <div className="form-group">
          <label className="form-label">Category Image (Optional)</label>
          
          {imagePreview ? (
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-border-gray)',
                height: 120,
                backgroundColor: '#F5F5F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(29, 29, 31, 0.8)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Remove Image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--color-border-gray)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#FAFAFC',
                transition: 'all var(--transition-fast)',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--color-blue)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-gray)';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--color-border-gray)';
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const fakeEvent = { target: { files: [file] } };
                  handleFileChange(fakeEvent);
                }
              }}
            >
              <Upload size={20} color="var(--color-soft-gray)" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-graphite)' }}>
                Click or drag & drop image here
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-soft-gray)', marginTop: 2 }}>
                PNG, JPG or WebP (max 5MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {errors.image && <span className="form-error">{errors.image}</span>}
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Clock,
  Tag,
  Zap,
  Timer,
  Flame,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Minus,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  ChevronDown,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Toggle } from '../components/common/Toggle';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { DealCountdownTimer } from '../components/common/DealCountdownTimer';
import { QuickCommerceProductCard } from '../components/products/QuickCommerceProductCard';
import { compressImageFile } from '../utils/imageCompressor';

export const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('10 MINS');
  const [discountTime, setDiscountTime] = useState('Today Only');
  const [stockStatus, setStockStatus] = useState('in_stock'); // 'in_stock' | 'out_of_stock'
  const [stockQuantity, setStockQuantity] = useState('50');
  const [unit, setUnit] = useState('1 pc');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [rawFile, setRawFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  const { showToast } = useToast();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast({ type: 'error', message: 'Please select an image file (PNG, JPG, WebP).' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast({ type: 'error', message: 'Image size should be under 10MB.' });
        return;
      }
      setRawFile(file);
      const compressed = await compressImageFile(file, 450, 450, 0.78);
      setImage(compressed || URL.createObjectURL(file));
    }
  };

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
        }),
        categoryService.getCategories({ page_size: 100 }),
      ]);

      const prods = prodRes.results || prodRes || [];
      const cats = catRes.results || catRes || [];

      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Compute stock counts for filter pills
  const stockCounts = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      const q = parseInt(p.stock_quantity, 10);
      if (isNaN(q) || q <= 0) {
        outOfStock++;
      } else if (q <= 5) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return {
      all: products.length,
      in_stock: inStock,
      low_stock: lowStock,
      out_of_stock: outOfStock,
    };
  }, [products]);

  // Filtered products based on stock tab
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      const q = parseInt(p.stock_quantity, 10);
      const isZero = isNaN(q) || q <= 0;
      const isLow = !isZero && q <= 5;
      const isAvailable = !isZero && q > 5;

      if (stockFilter === 'in_stock') return isAvailable;
      if (stockFilter === 'low_stock') return isLow;
      if (stockFilter === 'out_of_stock') return isZero;
      return true;
    });
  }, [products, stockFilter]);

  const renderStockBadge = (prod) => {
    if (!prod.is_active) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '11px',
            fontWeight: 600,
            color: '#86868B',
            backgroundColor: '#F0F0F2',
            border: '1px solid #D2D2D7',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          Inactive
        </span>
      );
    }

    const stock = parseInt(prod.stock_quantity, 10);
    if (isNaN(stock) || stock <= 0) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '11px',
            fontWeight: 700,
            color: '#FF3B30',
            backgroundColor: '#FFF0EE',
            border: '1px solid rgba(255, 59, 48, 0.4)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <XCircle size={11} /> Out of Stock
        </span>
      );
    }

    if (stock === 1) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '11px',
            fontWeight: 800,
            color: '#FF3B30',
            backgroundColor: '#FFF0EE',
            border: '1px solid rgba(255, 59, 48, 0.5)',
            padding: '2px 9px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 1px 4px rgba(255, 59, 48, 0.2)',
          }}
        >
          <Flame size={12} fill="#FF3B30" color="#FF3B30" /> ⚡ Only 1 Left!
        </span>
      );
    }

    if (stock === 2) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '11px',
            fontWeight: 700,
            color: '#D97706',
            backgroundColor: '#FFFBEB',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <AlertTriangle size={11} /> ⚡ Only 2 Left!
        </span>
      );
    }

    if (stock <= 5) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '11px',
            fontWeight: 700,
            color: '#D97706',
            backgroundColor: '#FFFBEB',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <AlertTriangle size={11} /> Low Stock ({stock} left)
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '11px',
          fontWeight: 600,
          color: '#34C759',
          backgroundColor: '#E8F9EE',
          border: '1px solid rgba(52, 199, 89, 0.4)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
        }}
      >
        <CheckCircle2 size={11} /> In Stock ({stock})
      </span>
    );
  };

  const getProductDealSeconds = (prod) => {
    if (prod.deal_seconds && typeof prod.deal_seconds === 'number') {
      return prod.deal_seconds;
    }
    const idNum = typeof prod.id === 'number' ? prod.id : parseInt(String(prod.id).replace(/\D/g, ''), 10) || 1;
    const presets = [6432, 11867, 1845, 19430, 4820, 14200, 8950, 3120];
    return presets[idNum % presets.length];
  };

  const getProductRating = (prod) => {
    if (prod.rating) return prod.rating;
    const idNum = typeof prod.id === 'number' ? prod.id : 1;
    const ratings = ['4.8', '4.9', '4.7', '4.6', '5.0', '4.5'];
    return ratings[idNum % ratings.length];
  };

  const getProductReviews = (prod) => {
    if (prod.reviews) return prod.reviews;
    const idNum = typeof prod.id === 'number' ? prod.id : 1;
    const revs = [420, 305, 189, 95, 512, 240];
    return revs[idNum % revs.length];
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId(categories.length > 0 ? String(categories[0].id) : '1');
    setPrice('');
    setDiscountPrice('');
    setDeliveryTime('8 mins');
    setDiscountTime('2 Hours Left');
    setStockStatus('in_stock');
    setStockQuantity('50');
    setUnit('1 unit');
    setImage('');
    setIsActive(true);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    if (!prod) return;
    setEditingProduct(prod);
    setName(prod.name || '');
    setDescription(prod.description || '');
    const catVal = typeof prod.category === 'object' && prod.category !== null
      ? String(prod.category.id)
      : prod.category
      ? String(prod.category)
      : (categories.length > 0 ? String(categories[0].id) : '1');
    setCategoryId(catVal);
    setPrice(prod.price != null ? String(prod.price) : '');
    setDiscountPrice(prod.discount_price != null ? String(prod.discount_price) : '');
    setDeliveryTime(prod.delivery_time || '8 mins');
    setDiscountTime(prod.discount_time || '2 Hours Left');
    const q = parseInt(prod.stock_quantity, 10);
    setStockStatus(q > 0 ? 'in_stock' : 'out_of_stock');
    setStockQuantity(String(isNaN(q) ? 50 : q));
    setUnit(prod.unit || '1 unit');
    setImage(prod.image || '');
    setIsActive(prod.is_active ?? true);
    setErrors({});
    setIsModalOpen(true);
  };

  const calculateDiscountPercent = (p, dp) => {
    const original = parseFloat(p);
    const disc = parseFloat(dp);
    if (!original || !disc || disc >= original) return null;
    return Math.round(((original - disc) / original) * 100);
  };

  const handleSaveProduct = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const prodName = name.trim();
    if (!prodName) {
      setErrors({ name: 'Product name is required.' });
      showToast({ type: 'error', message: 'Please enter a Product Name.' });
      return;
    }
    
    const effectiveCategory = categoryId || (categories.length > 0 ? String(categories[0].id) : '1');
    const effectivePrice = price && !isNaN(Number(price)) && Number(price) > 0 ? String(price) : '40.00';

    setSubmitting(true);
    try {
      const finalStock = stockStatus === 'out_of_stock' ? 0 : parseInt(stockQuantity, 10) || 50;

      const payload = {
        name: prodName,
        description: description.trim(),
        category: effectiveCategory,
        price: effectivePrice,
        discount_price: discountPrice || null,
        delivery_time: deliveryTime || '8 mins',
        discount_time: discountPrice ? (discountTime || '2 Hours Left') : null,
        stock_quantity: finalStock,
        unit: unit.trim() || '1 unit',
        image: image || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png',
        imageFile: rawFile,
        is_active: isActive,
      };

      if (editingProduct?.id) {
        await productService.updateProduct(editingProduct.id, payload);
        showToast({ type: 'success', message: `Product "${prodName}" updated successfully!` });
      } else {
        await productService.createProduct(payload);
        showToast({ type: 'success', message: `Product "${prodName}" added to catalog!` });
      }

      setRawFile(null);
      setIsModalOpen(false);
      loadData(false);
    } catch (err) {
      console.error('Failed to save product:', err);
      showToast({ type: 'error', message: 'Failed to save product. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick 1-click stock change (Mark Out of Stock / Restock)
  const handleQuickStockToggle = async (prod) => {
    const currentStock = parseInt(prod.stock_quantity, 10) || 0;
    const newStock = currentStock > 0 ? 0 : 25;

    try {
      await productService.updateProduct(prod.id, {
        stock_quantity: newStock,
        is_active: true,
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, stock_quantity: newStock, is_active: true } : p))
      );

      if (newStock === 0) {
        showToast({ type: 'info', message: `"${prod.name}" marked as Out of Stock.` });
      } else {
        showToast({ type: 'success', message: `"${prod.name}" restocked with 25 units!` });
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to update stock status.' });
    }
  };

  const handleQuickStockAdjust = async (prod, delta) => {
    const currentStock = parseInt(prod.stock_quantity, 10) || 0;
    const newStock = Math.max(0, currentStock + delta);

    try {
      await productService.updateProduct(prod.id, { stock_quantity: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, stock_quantity: newStock } : p))
      );
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to adjust stock.' });
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await productService.deleteProduct(deletingProduct.id);
      showToast({ type: 'success', message: 'Product deleted successfully.' });
      setDeletingProduct(null);
      loadData();
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to delete product.' });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await productService.toggleStatus(id);
      showToast({ type: 'success', message: res.message || 'Product status updated.' });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: res.is_active } : p))
      );
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to update product status.' });
    }
  };

  const discountPresets = ['⚡ Flash 10 Mins', '⏳ 30 Mins Left', '⏳ 2 Hours Left', '🔥 Today Only', 'Limited Stock Offer'];
  const deliveryPresets = ['⚡ 10 MINS', '⚡ 8-12 MINS', '⚡ 15 MINS', '⚡ 20 MINS'];

  return (
    <div>
      {/* Header with Title and Add Product Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-graphite)', letterSpacing: '-0.3px', margin: 0 }}>
            Products & Inventory
          </h2>
          <p style={{ color: 'var(--color-soft-gray)', fontSize: '13px', margin: '3px 0 0' }}>
            Live quick-commerce catalog, stock alerts, and deals
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
          disabled={categories.length === 0}
          style={{ height: 38, fontSize: '13px' }}
        >
          Add Product
        </Button>
      </div>

      {/* Top Filter Bar: Search + Side-by-Side Category & Stock Dropdowns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-soft-gray)', pointerEvents: 'none', display: 'flex' }}>
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: 36, height: 40, fontSize: '13px', width: '100%', borderRadius: 'var(--radius-md)' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-soft-gray)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Side-by-Side Dropdown Row: All Categories (Left) + All Stock Status (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
          {/* Custom Styled 'All Categories' Dropdown Selector */}
          <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control"
              style={{
                height: 40,
                fontSize: '12px',
                fontWeight: 600,
                color: selectedCategory ? 'var(--color-blue)' : 'var(--color-graphite)',
                backgroundColor: '#FFFFFF',
                border: selectedCategory ? '1px solid var(--color-blue)' : '1px solid var(--color-border-gray)',
                borderRadius: 'var(--radius-md)',
                padding: '0 26px 0 10px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                color: selectedCategory ? 'var(--color-blue)' : 'var(--color-graphite)',
              }}
            >
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Stock Status Dropdown Filter */}
          <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="form-control"
              style={{
                height: 40,
                fontSize: '12px',
                fontWeight: 600,
                color: stockFilter !== 'all' ? 'var(--color-green)' : 'var(--color-graphite)',
                backgroundColor: '#FFFFFF',
                border: stockFilter !== 'all' ? '1px solid var(--color-green)' : '1px solid var(--color-border-gray)',
                borderRadius: 'var(--radius-md)',
                padding: '0 26px 0 10px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <option value="all">All Stock Status ({stockCounts.all})</option>
              <option value="in_stock">In Stock ({stockCounts.in_stock})</option>
              <option value="low_stock">Low Stock ({stockCounts.low_stock})</option>
              <option value="out_of_stock">Out of Stock ({stockCounts.out_of_stock})</option>
            </select>
            <div
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                color: stockFilter !== 'all' ? 'var(--color-green)' : 'var(--color-graphite)',
              }}
            >
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Products list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-soft-gray)' }}>
          <Loader2 className="animate-spin" size={30} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : displayedProducts.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Package size={36} color="var(--color-soft-gray)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-graphite)' }}>
            No products match this filter
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', marginTop: 4, marginBottom: 16 }}>
            {stockFilter !== 'all'
              ? `There are currently no items under the "${stockFilter.replace('_', ' ')}" filter.`
              : 'Add your first product under an existing category to start taking orders.'}
          </p>
          {stockFilter !== 'all' ? (
            <Button variant="secondary" onClick={() => setStockFilter('all')}>
              Show All Products
            </Button>
          ) : (
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal} disabled={categories.length === 0}>
              Add First Product
            </Button>
          )}
        </Card>
      ) : (
        <div className="product-grid">
          {displayedProducts.map((prod) => (
            <QuickCommerceProductCard
              key={prod.id}
              product={prod}
              dealSeconds={getProductDealSeconds(prod)}
              onEdit={handleOpenEditModal}
              onDelete={setDeletingProduct}
              onQuickStockAdjust={handleQuickStockAdjust}
              onQuickStockToggle={handleQuickStockToggle}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Update Product & Stock' : 'Add New Product'}
        maxWidth="560px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProduct} loading={submitting}>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProduct}>
          <Input
            label="Product Name"
            required
            placeholder="e.g. Amul Taaza Milk 1L, Organic Avocado 500g"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <Select
            label="Category"
            required
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            error={errors.category}
          />

          {/* Pricing & Discount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Standard Price (₹)"
              required
              type="number"
              step="0.01"
              placeholder="e.g. 75.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
            />
            <Input
              label="Discount Price (₹, optional)"
              type="number"
              step="0.01"
              placeholder="e.g. 68.00"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              icon={Tag}
            />
          </div>

          {/* Stock Status Selector: In Stock vs Out of Stock */}
          <div className="form-group">
            <label className="form-label">Inventory & Stock Availability</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 4, backgroundColor: '#F5F5F7', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setStockStatus('in_stock');
                  if (stockQuantity === '0') setStockQuantity('50');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: stockStatus === 'in_stock' ? 'var(--color-pure-white)' : 'transparent',
                  color: stockStatus === 'in_stock' ? 'var(--color-green)' : 'var(--color-soft-gray)',
                  fontWeight: 700,
                  fontSize: '13px',
                  boxShadow: stockStatus === 'in_stock' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <CheckCircle2 size={15} />
                Available In Stock
              </button>

              <button
                type="button"
                onClick={() => {
                  setStockStatus('out_of_stock');
                  setStockQuantity('0');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: stockStatus === 'out_of_stock' ? 'var(--color-pure-white)' : 'transparent',
                  color: stockStatus === 'out_of_stock' ? 'var(--color-red)' : 'var(--color-soft-gray)',
                  fontWeight: 700,
                  fontSize: '13px',
                  boxShadow: stockStatus === 'out_of_stock' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <XCircle size={15} />
                Out of Stock (0)
              </button>
            </div>

            {stockStatus === 'in_stock' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Available Units in Dark Store"
                  type="number"
                  placeholder="e.g. 50"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
                <Input
                  label="Unit / Measurement"
                  placeholder="e.g. 500g, 1L, 1 packet"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Product Image Section: File Upload + URL + Preview */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Product Image</span>
              {image && (
                <button
                  type="button"
                  onClick={() => {
                    setImage('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-red)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Remove Image
                </button>
              )}
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Image Preview or Upload Dropzone */}
            {image ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 140,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#FAFAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #EBEBED',
                  marginBottom: 10,
                }}
              >
                <img
                  src={image}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png';
                  }}
                />
                <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      backgroundColor: '#0071E3',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,113,227,0.3)',
                    }}
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImage('');
                      setRawFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={{
                      backgroundColor: 'rgba(255, 59, 48, 0.9)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  height: 110,
                  border: '2px dashed #0071E3',
                  borderRadius: '10px',
                  backgroundColor: '#F5F9FF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginBottom: 10,
                  transition: 'all 0.15s ease',
                  padding: 10,
                }}
              >
                <Upload size={24} color="#0071E3" style={{ marginBottom: 6 }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0071E3' }}>
                  Upload Product Image
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)', marginTop: 3 }}>
                  Click to select PNG, JPG, WebP from your device
                </span>
              </div>
            )}
          </div>

          <Textarea
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>
      </Modal>

      {/* Delete Product Modal */}
      <Modal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Delete Product"
        maxWidth="420px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProduct}>
              Delete Product
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '14px', color: 'var(--color-graphite)' }}>
          Are you sure you want to delete <strong>"{deletingProduct?.name}"</strong>?
        </p>
      </Modal>
    </div>
  );
};

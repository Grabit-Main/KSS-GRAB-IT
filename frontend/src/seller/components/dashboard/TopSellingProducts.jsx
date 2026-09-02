import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ArrowRight, TrendingUp, AlertCircle, ShoppingBag } from 'lucide-react';
import { get } from '../../../api';
import { resolveMediaUrl, DEFAULT_PRODUCT_FALLBACK } from '../../utils/mediaResolver';
import { productService } from '../../services/productService';

export const TopSellingProducts = () => {
  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Fetch real data from backend
  useEffect(() => {
    let isMounted = true;
    
    const fetchTopProducts = async () => {
      setLoading(true);
      try {
        const data = await get(`/seller/dashboard/top-products?period=${period}`);
        
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopProducts();

    return () => { isMounted = false; };
  }, [period]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', marginTop: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Top-Selling Products</h3>
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>Highest performing items by volume</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Filters */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '4px' }}>
            {['today', '7days', '30days'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  background: period === p ? '#FFFFFF' : 'transparent',
                  color: period === p ? '#0F172A' : '#64748B',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {p === 'today' ? 'Today' : p === '7days' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
            View All <ArrowRight size={13} style={{ marginLeft: 4 }} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', minHeight: '200px' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Loading top products...</span>
          </div>
        ) : null}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Product</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Units Sold</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Revenue</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '14px', fontWeight: 600 }}>
                    No sales data available for this period.
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => (
                  <tr key={product.id} style={{ borderBottom: idx === products.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', width: '20px' }}>#{idx + 1}</span>
                        <div style={{ width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                          <img 
                            src={resolveMediaUrl(product.image, DEFAULT_PRODUCT_FALLBACK)} 
                            alt={product.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.src = DEFAULT_PRODUCT_FALLBACK; }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>{product.name}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{product.unitsSold}</div>
                      <div style={{ fontSize: '11px', color: product.trend.startsWith('+') ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', marginTop: '2px', fontWeight: 600 }}>
                        {product.trend.startsWith('+') && <TrendingUp size={10} strokeWidth={3} />} {product.trend}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      {formatCurrency(product.revenue)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {product.stock <= 5 ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: '6px', backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '12px', fontWeight: 700 }}>
                          <AlertCircle size={14} /> {product.stock} left
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>{product.stock} in stock</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Zap, ArrowLeft, ShoppingBag, Truck, PackageCheck, AlertCircle, X } from 'lucide-react';
import { orders, orderStats, trackerSteps } from '../data/orders';
import ProductSvg from '../components/common/ProductSvg';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import useWindowWidth from '../hooks/useWindowWidth';

const STATUS_TABS = ['All Orders', 'Ongoing', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const w = useWindowWidth();
  const isMobile = w <= 768;

  const filtered = orders.filter(o => {
    if (activeTab === 'All Orders') return true;
    if (activeTab === 'Ongoing') return o.status === 'out-for-delivery' || o.status === 'confirmed';
    if (activeTab === 'Delivered') return o.status === 'delivered';
    if (activeTab === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  const handleReorder = (order) => {
    order.items.forEach(item => addItem(item));
    showToast(`Added items from Order #GB${order.id} to your Cart!`);
  };

  return (
    <div style={{ background: '#F4F5F8', minHeight: '100vh', padding: isMobile ? '12px 12px 90px' : '24px 24px 60px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── 1. PAGE HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: isMobile ? '14px' : '20px'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={18} color="#0F172A" />
          </button>
          <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            My Orders
          </h1>
        </div>

        {/* ── 2. RESPONSIVE GRID LAYOUT ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 310px',
          gap: isMobile ? '16px' : '24px',
          alignItems: 'flex-start',
          width: '100%', boxSizing: 'border-box'
        }}>
          
          {/* ── LEFT: ORDERS LIST ── */}
          <div style={{ width: '100%', minWidth: 0 }}>
            
            {/* Status Filter Tabs (Horizontal Scrollable on Mobile) */}
            <div style={{
              display: 'flex', gap: '8px', overflowX: 'auto',
              marginBottom: '16px', paddingBottom: '4px',
              scrollbarWidth: 'none', msOverflowStyle: 'none'
            }}>
              {STATUS_TABS.map(t => {
                const isActive = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    style={{
                      background: isActive ? '#0071E3' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#475569',
                      border: isActive ? '1px solid #0071E3' : '1px solid #CBD5E1',
                      borderRadius: '20px', padding: isMobile ? '7px 16px' : '8px 18px',
                      fontSize: '12.5px', fontWeight: isActive ? 900 : 700,
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      boxShadow: isActive ? '0 4px 12px rgba(0,113,227,0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Empty State */}
            {filtered.length === 0 ? (
              <div style={{
                background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
                padding: '40px 20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>🛍️</div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>No orders found</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px' }}>
                  You have no active orders in "{activeTab}".
                </p>
                <Link
                  to="/"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: '#0071E3', color: '#FFFFFF', padding: '10px 22px',
                    borderRadius: '12px', fontSize: '13px', fontWeight: 900,
                    textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,113,227,0.3)'
                  }}
                >
                  Explore Products &amp; Shop Now
                </Link>
              </div>
            ) : (
              filtered.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF', borderRadius: '18px',
                    border: '1px solid #E2E8F0', padding: isMobile ? '14px 16px' : '20px',
                    marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Order Card Top Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: '14px', flexWrap: 'wrap', gap: '8px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 900, fontSize: isMobile ? '14px' : '15px', color: '#0F172A' }}>
                          Order ID: #GB{order.id}
                        </span>
                        <ChevronRight size={16} color="#94A3B8" />
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>
                        {order.date}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 900,
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: order.status === 'out-for-delivery' ? '#EFF6FF' : order.status === 'delivered' ? '#ECFDF5' : '#FEF2F2',
                      color: order.status === 'out-for-delivery' ? '#0071E3' : order.status === 'delivered' ? '#10B981' : '#EF4444',
                      border: order.status === 'out-for-delivery' ? '1px solid #BFDBFE' : order.status === 'delivered' ? '1px solid #A7F3D0' : '1px solid #FECACA'
                    }}>
                      {order.status === 'delivered' && <>✓ Delivered</>}
                      {order.status === 'out-for-delivery' && <>🛵 Out for Delivery</>}
                      {order.status === 'cancelled' && <>✕ Cancelled</>}
                    </span>
                  </div>

                  {/* Active Express Order Live Tracker Banner */}
                  {order.status === 'out-for-delivery' && (
                    <div style={{
                      background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)',
                      borderRadius: '14px', padding: '14px 16px', marginBottom: '16px',
                      border: '1px solid #BFDBFE'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Zap size={16} color="#0071E3" fill="#0071E3" />
                        <span style={{ fontWeight: 900, fontSize: '13.5px', color: '#0071E3' }}>
                          Arriving in {order.eta || '15 min'}
                        </span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 14px 0', fontWeight: 500 }}>
                        Our delivery partner is on the way to deliver your order
                      </p>

                      {/* Tracker Progress Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {trackerSteps.map((s, i) => {
                          const isDone = i <= (order.trackerStep || 2);
                          return (
                            <div key={s} style={{ flex: i < trackerSteps.length - 1 ? 1 : 'none', display: 'flex', alignItems: 'center' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
                                <div style={{
                                  width: '24px', height: '24px', borderRadius: '50%',
                                  background: isDone ? '#0071E3' : '#CBD5E1',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: isDone ? '0 2px 6px rgba(0,113,227,0.3)' : 'none'
                                }}>
                                  <Check size={13} color="white" strokeWidth={3} />
                                </div>
                                <span style={{ fontSize: '9px', fontWeight: 800, color: isDone ? '#0F172A' : '#94A3B8', whiteSpace: 'nowrap' }}>
                                  {s}
                                </span>
                              </div>
                              {i < trackerSteps.length - 1 && (
                                <div style={{
                                  flex: 1, height: '3px', borderRadius: '2px',
                                  background: i < (order.trackerStep || 2) ? '#0071E3' : '#E2E8F0',
                                  margin: '0 2px', marginBottom: '16px'
                                }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Item Thumbnails */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          width: '48px', height: '48px', borderRadius: '10px',
                          background: '#F8FAFC', border: '1px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <ProductSvg name={item.image} size={36} />
                      </div>
                    ))}
                  </div>

                  {/* Order Card Footer */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '12px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px'
                  }}>
                    <div style={{ fontSize: '12.5px', color: '#475569' }}>
                      <strong style={{ color: '#0F172A', fontWeight: 900 }}>{order.totalItems} items</strong> • Total <strong style={{ color: '#0071E3', fontWeight: 900 }}>₹{order.total}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedOrderModal(order)}
                        style={{
                          background: '#FFFFFF', border: '1px solid #CBD5E1',
                          borderRadius: '10px', padding: '6px 12px', fontSize: '12px',
                          fontWeight: 800, color: '#0F172A', cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleReorder(order)}
                        style={{
                          background: '#0071E3', border: 'none',
                          borderRadius: '10px', padding: '6px 14px', fontSize: '12px',
                          fontWeight: 900, color: '#FFFFFF', cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,113,227,0.25)'
                        }}
                      >
                        {order.status === 'out-for-delivery' ? 'Track Order' : 'Reorder'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── RIGHT: STATS SIDEBAR ── */}
          <div style={{ width: '100%', minWidth: 0 }}>
            <div style={{
              background: '#FFFFFF', borderRadius: '18px',
              border: '1px solid #E2E8F0', padding: '18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontWeight: 900, fontSize: '15px', marginBottom: '14px', color: '#0F172A' }}>
                Order Summary
              </h3>

              {[
                ['Total Orders', orderStats.total],
                ['Delivered', orderStats.delivered],
                ['Ongoing', orderStats.ongoing],
                ['Cancelled', orderStats.cancelled],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>{val}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: '15px', fontWeight: 900 }}>
                <span style={{ color: '#0F172A' }}>Total Spent</span>
                <span style={{ color: '#0071E3' }}>₹{orderStats.totalSpent.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── ORDER DETAILS MODAL ── */}
      {selectedOrderModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%',
            padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button
              onClick={() => setSelectedOrderModal(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: '#F1F5F9', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={16} color="#0F172A" />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 4px', color: '#0F172A' }}>
              Order #GB{selectedOrderModal.id}
            </h3>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', fontWeight: 600 }}>
              Placed on {selectedOrderModal.date} • Total ₹{selectedOrderModal.total}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '280px', overflowY: 'auto' }}>
              {selectedOrderModal.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <ProductSvg name={item.image} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>Qty: {item.qty}</div>
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { handleReorder(selectedOrderModal); setSelectedOrderModal(null); }}
              style={{
                width: '100%', background: '#0071E3', border: 'none',
                borderRadius: '12px', padding: '12px', fontSize: '14px',
                fontWeight: 900, color: '#FFFFFF', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,113,227,0.3)'
              }}
            >
              Reorder All Items
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

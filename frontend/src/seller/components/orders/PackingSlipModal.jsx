import React from 'react';
import { Printer, X, CheckCircle2, ShieldCheck, Zap, MapPin, Phone, User, Store } from 'lucide-react';

export const PackingSlipModal = ({ order, storeName, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderNum = order.id || order.orderNumber || 'GB-0000';
  const orderTime = order.date ? `${order.date} ${order.time || ''}` : new Date().toLocaleString();
  const items = Array.isArray(order.items) ? order.items : [];
  const totalAmount = Number(order.total_amount || order.total || 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Header (Excluded in print via CSS) */}
        <div
          className="no-print"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="#0071E3" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Order Packing Slip &amp; Dispatch Ticket
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '10px',
                backgroundColor: '#0071E3',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 113, 227, 0.3)',
              }}
            >
              <Printer size={15} />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Ticket Content */}
        <div
          id="printable-packing-slip"
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#0F172A',
          }}
        >
          {/* Slip Brand & Order Barcode Header */}
          <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '2px dashed #CBD5E1' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '1px', color: '#0071E3', textTransform: 'uppercase' }}>
              GRABIT 10-MIN EXPRESS
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', letterSpacing: '0.5px' }}>
              DARK STORE DISPATCH PACKING SLIP
            </div>

            {/* Visual Simulated Barcode */}
            <div style={{ marginTop: '12px', padding: '6px', backgroundColor: '#F8FAFC', borderRadius: '8px', display: 'inline-block' }}>
              <div style={{ fontFamily: 'monospace', letterSpacing: '3px', fontWeight: 800, fontSize: '20px' }}>
                |||||| | | |||| | ||| |||| |
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', marginTop: '2px' }}>
                #{orderNum}
              </div>
            </div>
          </div>

          {/* Key Order Meta Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '14px 0', borderBottom: '1px solid #E2E8F0', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Store Hub</span>
              <strong style={{ fontSize: '13px', color: '#0F172A' }}>{storeName || 'Dark Store Supermarket'}</strong>
              <div style={{ color: '#64748B', fontSize: '11.5px', marginTop: '2px' }}>Bangalore Fast Fulfillment</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Order Placed</span>
              <strong style={{ fontSize: '12px' }}>{orderTime}</strong>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700, fontSize: '11px', marginTop: '2px' }}>
                <Zap size={11} fill="#059669" /> Priority Dispatch
              </div>
            </div>
          </div>

          {/* Customer & Delivery Destination */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid #E2E8F0', fontSize: '12px' }}>
            <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Customer &amp; Delivery Destination
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px' }}>
              <User size={13} color="#0071E3" />
              <span>{order.customer_name || 'Customer'}</span>
              {order.customer_phone && (
                <span style={{ color: '#64748B', fontWeight: 600, marginLeft: '6px' }}>
                  ({order.customer_phone})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#334155', marginTop: '4px', lineHeight: 1.4 }}>
              <MapPin size={13} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{order.delivery_address || order.address || 'Address provided in customer order'}</span>
            </div>
          </div>

          {/* Items Checklist Table */}
          <div style={{ padding: '14px 0', borderBottom: '2px dashed #CBD5E1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
              <span>Item Description</span>
              <span>Qty x Price</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '1.5px solid #CBD5E1', borderRadius: '4px', display: 'inline-block' }} />
                    <span style={{ fontWeight: 600 }}>{it.name || 'Grocery Item'}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>
                    {it.qty || it.quantity || 1} x ₹{it.price || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div style={{ padding: '14px 0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Items Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Delivery Fee:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>FREE (Express)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, color: '#0F172A', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
              <span>Total Bill (Paid {order.payment_method || 'UPI'}):</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Bag Packing Seal Guarantee Notice */}
          <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center', fontSize: '11px', color: '#64748B' }}>
            🔒 <strong>Packer Note:</strong> Ensure all items are verified &amp; sealed with GrabIt security tape before handing to rider.
          </div>
        </div>
      </div>
    </div>
  );
};
export default PackingSlipModal;

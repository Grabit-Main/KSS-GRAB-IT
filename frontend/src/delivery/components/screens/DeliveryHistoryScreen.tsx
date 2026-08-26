import React, { useState } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import {
  History,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  MapPin,
  Clock,
  Navigation2
} from 'lucide-react';

export const DeliveryHistoryScreen: React.FC = () => {
  const { state } = useDelivery();
  const { history } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DELIVERED' | 'FAILED_DELIVERY' | 'RETURNED'>('ALL');

  const filteredHistory = history.filter((item) => {
    const storeText = item.supermarketName || (item as any).merchantName || 'GrabIt Supermarket';
    const matchesSearch =
      item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storeText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'ALL' ||
      item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0, letterSpacing: '-0.3px' }}>
            Delivery History
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: '2px 0 0' }}>
            Read-only archive of completed, returned, and failed past deliveries from GrabIt Supermarket
          </p>
        </div>

        <span className="badge badge-gray" style={{ fontSize: '12px' }}>
          {history.length} Total Records
        </span>
      </div>

      {/* Frosted Glass Search & Filter Bar */}
      <div
        className="glass-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
          <Search
            size={16}
            color="var(--color-soft-gray)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by Order ID, customer, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--glass-border-subtle)',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Frosted Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`btn-secondary ${activeFilter === 'ALL' ? 'btn-primary' : ''}`}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '20px',
              backgroundColor: activeFilter === 'ALL' ? 'var(--color-blue)' : 'rgba(255, 255, 255, 0.65)',
              color: activeFilter === 'ALL' ? '#FFFFFF' : 'var(--color-graphite)'
            }}
          >
            All ({history.length})
          </button>

          <button
            onClick={() => setActiveFilter('DELIVERED')}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '20px',
              border: '1px solid var(--glass-border-subtle)',
              backgroundColor: activeFilter === 'DELIVERED' ? 'var(--color-green)' : 'rgba(255, 255, 255, 0.65)',
              color: activeFilter === 'DELIVERED' ? '#FFFFFF' : 'var(--color-graphite)',
              cursor: 'pointer'
            }}
          >
            Delivered ({history.filter((h) => h.status === 'DELIVERED').length})
          </button>

          <button
            onClick={() => setActiveFilter('FAILED_DELIVERY')}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '20px',
              border: '1px solid var(--glass-border-subtle)',
              backgroundColor: activeFilter === 'FAILED_DELIVERY' ? 'var(--color-red)' : 'rgba(255, 255, 255, 0.65)',
              color: activeFilter === 'FAILED_DELIVERY' ? '#FFFFFF' : 'var(--color-graphite)',
              cursor: 'pointer'
            }}
          >
            Failed ({history.filter((h) => h.status === 'FAILED_DELIVERY').length})
          </button>

          <button
            onClick={() => setActiveFilter('RETURNED')}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '20px',
              border: '1px solid var(--glass-border-subtle)',
              backgroundColor: activeFilter === 'RETURNED' ? 'var(--color-graphite)' : 'rgba(255, 255, 255, 0.65)',
              color: activeFilter === 'RETURNED' ? '#FFFFFF' : 'var(--color-graphite)',
              cursor: 'pointer'
            }}
          >
            Returned ({history.filter((h) => h.status === 'RETURNED').length})
          </button>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <History size={36} color="var(--color-soft-gray)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-graphite)', margin: '0 0 4px' }}>
            No past deliveries found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: 0 }}>
            {searchQuery ? 'Try adjusting your search query or filter.' : 'Completed and logged orders will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredHistory.map((item) => (
            <div
              key={item.orderId}
              className="glass-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                borderLeft:
                  item.status === 'DELIVERED'
                    ? '4px solid var(--color-green)'
                    : item.status === 'RETURNED'
                    ? '4px solid var(--color-blue)'
                    : '4px solid var(--color-red)'
              }}
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor:
                      item.status === 'DELIVERED'
                        ? 'rgba(52, 199, 89, 0.14)'
                        : item.status === 'RETURNED'
                        ? 'rgba(0, 113, 227, 0.12)'
                        : 'rgba(255, 59, 48, 0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {item.status === 'DELIVERED' ? (
                    <CheckCircle2 size={22} color="var(--color-green)" />
                  ) : item.status === 'RETURNED' ? (
                    <RotateCcw size={20} color="var(--color-blue)" />
                  ) : (
                    <AlertCircle size={22} color="var(--color-red)" />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                      {item.orderNumber}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-graphite)' }}>
                      • {item.customerName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-soft-gray)', flexWrap: 'wrap' }}>
                    <span>Origin: {item.supermarketName || (item as any).merchantName || 'GrabIt Supermarket (Koramangala)'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={12} /> {item.deliveryLocation}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Navigation2 size={12} /> {item.distanceKm} km
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {item.durationMinutes} mins duration
                    </span>
                  </div>

                  {item.failureReason && (
                    <p style={{ fontSize: '12px', color: 'var(--color-red)', fontWeight: '600', margin: '4px 0 0' }}>
                      Reason: {item.failureReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Status & Amount */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div>
                  {item.status === 'DELIVERED' && (
                    <span className="badge badge-green">Delivered</span>
                  )}
                  {item.status === 'RETURNED' && (
                    <span className="badge badge-blue">Returned to Supermarket</span>
                  )}
                  {item.status === 'FAILED_DELIVERY' && (
                    <span className="badge badge-red">Failed Delivery</span>
                  )}
                </div>

                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                  ₹{item.totalAmount.toFixed(2)} ({item.paymentMethod === 'COD' ? 'COD' : 'Prepaid'})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

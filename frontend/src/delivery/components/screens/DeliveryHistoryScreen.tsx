import React, { useState } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import confetti from 'canvas-confetti';
import {
  History,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  MapPin,
  Clock,
  Navigation2,
  Wallet,
  Zap,
  ArrowDownLeft,
  X,
  Building,
  Check
} from 'lucide-react';

export const DeliveryHistoryScreen: React.FC = () => {
  const { state } = useDelivery();
  const { history, stats } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DELIVERED' | 'FAILED_DELIVERY' | 'RETURNED'>('ALL');
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [isProcessingCashout, setIsProcessingCashout] = useState(false);
  const [cashoutDone, setCashoutDone] = useState(false);

  const deliveredCount = history.filter((item) => item.status === 'DELIVERED').length || stats.completedToday;
  const totalPayout = history
    .filter((item) => item.status === 'DELIVERED')
    .reduce((sum, item) => sum + (item.totalAmount > 0 ? 55 + (item.distanceKm || 2) * 10 : 65), 0) || (stats.completedToday > 0 ? stats.completedToday * 65 : 0);

  const handleCashout = () => {
    setIsProcessingCashout(true);
    setTimeout(() => {
      setIsProcessingCashout(false);
      setCashoutDone(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }, 1500);
  };

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
            Delivery History & Earnings
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: '2px 0 0' }}>
            Shift payout records and completed delivery archives from GrabIt Hub
          </p>
        </div>

        <span className="badge badge-gray" style={{ fontSize: '12px' }}>
          {history.length} Total Records
        </span>
      </div>

      {/* 💰 Instant Shift Earnings & Payout Card */}
      <div
        className="glass-card"
        style={{
          padding: '20px 22px',
          background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(219, 234, 254, 0.85) 100%)',
          border: '1.5px solid rgba(191, 219, 254, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#0071E3',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
              flexShrink: 0,
            }}
          >
            <Wallet size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Available Shift Balance
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '26px', fontWeight: '900', color: '#1D1D1F', letterSpacing: '-0.5px' }}>
                ₹{totalPayout.toFixed(2)}
              </span>
              <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: '700' }}>
                • {deliveredCount} trips completed
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (totalPayout === 0) return;
            setCashoutDone(false);
            setShowCashoutModal(true);
          }}
          disabled={totalPayout === 0}
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            backgroundColor: totalPayout > 0 ? '#0071E3' : '#94A3B8',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: '800',
            cursor: totalPayout > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: totalPayout > 0 ? '0 4px 14px rgba(0, 113, 227, 0.35)' : 'none',
            transition: 'all 0.15s ease',
            opacity: totalPayout > 0 ? 1 : 0.75,
          }}
        >
          <Zap size={16} fill="#FFFFFF" />
          <span>{totalPayout > 0 ? 'Instant Cashout to Bank (UPI)' : 'No Balance to Cashout'}</span>
        </button>
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

      {/* 💸 Instant Bank Payout (UPI) Modal */}
      {showCashoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowCashoutModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '400px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCashoutModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>

            {!cashoutDone ? (
              <>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#EFF6FF',
                    color: '#0071E3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '1.5px solid #BFDBFE',
                  }}
                >
                  <Building size={26} color="#0071E3" />
                </div>

                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1D1D1F', margin: '0 0 6px' }}>
                  Instant Bank Payout (UPI)
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px' }}>
                  Transfer your earned shift balance directly to your registered bank account via UPI.
                </p>

                {/* Account Details Box */}
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#64748B' }}>Beneficiary:</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Speedy Express (Partner)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#64748B' }}>Bank / UPI ID:</span>
                    <span style={{ fontWeight: 700, color: '#0071E3' }}>speedy@okaxis (HDFC)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #CBD5E1', fontSize: '14px' }}>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>Payout Amount:</span>
                    <span style={{ fontWeight: 900, color: '#16A34A', fontSize: '16px' }}>₹{totalPayout.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCashout}
                  disabled={isProcessingCashout}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '14px',
                    background: '#0071E3',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: isProcessingCashout ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 113, 227, 0.35)',
                  }}
                >
                  {isProcessingCashout ? (
                    <span>Processing UPI Transfer...</span>
                  ) : (
                    <>
                      <Zap size={16} fill="#FFFFFF" />
                      <span>Confirm & Transfer ₹{totalPayout.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Success Receipt View */
              <div>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '1.5px solid #86EFAC',
                  }}
                >
                  <Check size={32} color="#16A34A" />
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#16A34A', margin: '0 0 6px' }}>
                  ₹{totalPayout.toFixed(2)} Transferred!
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px' }}>
                  Instant IMPS/UPI transfer has been credited to your HDFC Bank account.
                </p>

                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: '12.5px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#166534' }}>Transaction Ref:</span>
                    <span style={{ fontWeight: 800, color: '#14532D' }}>UPI/{Math.floor(1000000000 + Math.random() * 9000000000)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#166534' }}>Status:</span>
                    <span style={{ fontWeight: 800, color: '#16A34A' }}>SUCCESS (Instant)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#166534' }}>Date & Time:</span>
                    <span style={{ fontWeight: 700, color: '#14532D' }}>{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCashoutModal(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

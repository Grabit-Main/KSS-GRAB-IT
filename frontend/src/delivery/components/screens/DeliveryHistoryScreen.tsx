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
  Check,
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';

export const DeliveryHistoryScreen: React.FC = () => {
  const { state, transferPayout } = useDelivery();
  const { history, stats, payoutTransfers = [], incentiveCampaigns = [] } = state;

  const [mainTab, setMainTab] = useState<'WALLET_HISTORY' | 'DELIVERY_LOGS'>('WALLET_HISTORY');
  const [walletPeriod, setWalletPeriod] = useState<'THIS_WEEK' | 'THIS_MONTH' | 'ALL'>('THIS_WEEK');

  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DELIVERED' | 'FAILED_DELIVERY' | 'RETURNED'>('ALL');
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [isProcessingCashout, setIsProcessingCashout] = useState(false);
  const [cashoutDone, setCashoutDone] = useState(false);
  const [lastTransferredAmount, setLastTransferredAmount] = useState(0);

  // Calculate gross shift earnings from delivered orders
  const deliveredOrders = history.filter((item) => item.status === 'DELIVERED');
  const grossEarningsFromHistory = deliveredOrders.reduce(
    (sum, item) => sum + (item.earning || (item.totalAmount > 0 ? Math.round(55 + (item.distanceKm || 2) * 10) : 65)),
    0
  );
  const baseEarnings = grossEarningsFromHistory;

  const redeemedIncentivesBonus = (incentiveCampaigns || [])
    .filter((c) => c.isRedeemed)
    .reduce((sum, c) => sum + c.bonusAmount, 0);

  const grossEarnings = baseEarnings + redeemedIncentivesBonus;

  // Calculate total transferred payouts (actual user cashout transfers)
  const totalTransferred = (payoutTransfers || []).reduce((sum, t) => sum + t.amount, 0);

  // Available Shift Balance (deducted after payouts)
  const totalPayout = Math.max(0, grossEarnings - totalTransferred);
  const deliveredCount = deliveredOrders.length || stats.completedToday;

  const handleCashout = () => {
    if (totalPayout <= 0) return;
    const cashoutAmt = totalPayout;
    setLastTransferredAmount(cashoutAmt);
    setIsProcessingCashout(true);
    setTimeout(() => {
      transferPayout(cashoutAmt, 'speedy@okaxis (HDFC)');
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

  // ── Date Filtering Helpers for Wallet History ────────────────────────────
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    setSelectedMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayNumber(null);
  };

  const handleNextMonth = () => {
    setSelectedMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayNumber(null);
  };

  const handlePrevWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => Math.min(0, prev + 1));
  };

  const getWeekInfo = (offset: number) => {
    const n = new Date();
    const dayIdx = (n.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const monday = new Date(n);
    monday.setDate(n.getDate() - dayIdx + (offset * 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const formatWeekDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const startStr = formatWeekDate(monday);
    const endStr = formatWeekDate(sunday);

    let label = 'This Week';
    if (offset === -1) label = 'Previous Week';
    else if (offset === -2) label = '2 Weeks Ago';
    else if (offset < -2) label = `${Math.abs(offset)} Weeks Ago`;
    else if (offset > 0) label = `Week +${offset}`;

    return { monday, sunday, startStr, endStr, label };
  };

  const getMonthCalendarDays = () => {
    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  };

  const parseEntryDate = (isoOrStr: string) => {
    if (!isoOrStr) return new Date();
    try {
      const d = new Date(isoOrStr);
      if (!isNaN(d.getTime())) return d;
    } catch {}
    return new Date();
  };

  const filterByPeriod = (dateObj: Date) => {
    if (!dateObj || isNaN(dateObj.getTime())) return true;
    if (walletPeriod === 'THIS_WEEK') {
      const weekInfo = getWeekInfo(weekOffset);
      return dateObj >= weekInfo.monday && dateObj <= weekInfo.sunday;
    }
    if (walletPeriod === 'THIS_MONTH') {
      const matchesMonth =
        dateObj.getMonth() === selectedMonthDate.getMonth() &&
        dateObj.getFullYear() === selectedMonthDate.getFullYear();
      if (selectedDayNumber !== null) {
        return matchesMonth && dateObj.getDate() === selectedDayNumber;
      }
      return matchesMonth;
    }
    return true; // ALL
  };

  // Total earnings for the currently selected month in calendar
  const selectedMonthGrossEarnings = (() => {
    const monthDelivered = history.filter((item) => {
      if (item.status !== 'DELIVERED') return false;
      const d = parseEntryDate(item.completedAtISO || item.timestamp);
      return d.getMonth() === selectedMonthDate.getMonth() && d.getFullYear() === selectedMonthDate.getFullYear();
    });

    const isCurrentMonth =
      selectedMonthDate.getMonth() === now.getMonth() &&
      selectedMonthDate.getFullYear() === now.getFullYear();

    if (monthDelivered.length > 0) {
      return monthDelivered.reduce(
        (sum, item) => sum + (item.earning || (item.totalAmount > 0 ? Math.round(55 + (item.distanceKm || 2) * 10) : 65)),
        0
      ) + (isCurrentMonth ? redeemedIncentivesBonus : 0);
    }
    return isCurrentMonth ? grossEarnings : 0;
  })();

  const filteredPayoutTransfers = (payoutTransfers || []).filter((t) => {
    const d = parseEntryDate(t.timestamp);
    return filterByPeriod(d);
  });

  const isCurrentSelectedMonth =
    selectedMonthDate.getMonth() === now.getMonth() &&
    selectedMonthDate.getFullYear() === now.getFullYear();

  const periodDeliveredHistory = history
    .filter((h) => h.status === 'DELIVERED')
    .filter((h) => filterByPeriod(parseEntryDate(h.completedAtISO || h.timestamp)));

  // Calculate Total Earned directly by summing every trip amount in the history list
  const periodTripEarningsSum = periodDeliveredHistory.reduce((sum, h) => {
    const earningAmt = h.earning || (h.totalAmount > 0 ? Math.round(55 + (h.distanceKm || 2) * 10) : 65);
    return sum + earningAmt;
  }, 0);

  const periodIncentiveBonus = (incentiveCampaigns || [])
    .filter((c) => c.isRedeemed)
    .reduce((sum, c) => sum + c.bonusAmount, 0);

  const periodGrossEarnings = periodTripEarningsSum + ((isCurrentSelectedMonth || walletPeriod === 'ALL') ? periodIncentiveBonus : 0);

  // Total Withdrawn dynamically calculated from actual cashout transfers
  const periodTransferred = filteredPayoutTransfers.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0, letterSpacing: '-0.3px' }}>
            Delivery History & Wallet
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: '2px 0 0' }}>
            Shift balance payouts, instant UPI transfers, and completed trip archives
          </p>
        </div>

        {/* Mode Switcher Tabs: Wallet History vs Delivery Logs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(241, 245, 249, 0.9)',
            padding: '4px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0'
          }}
        >
          <button
            type="button"
            onClick={() => setMainTab('WALLET_HISTORY')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mainTab === 'WALLET_HISTORY' ? '#0071E3' : 'transparent',
              color: mainTab === 'WALLET_HISTORY' ? '#FFFFFF' : '#64748B',
              boxShadow: mainTab === 'WALLET_HISTORY' ? '0 2px 8px rgba(0,113,227,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            💳 Wallet History
          </button>
          <button
            type="button"
            onClick={() => setMainTab('DELIVERY_LOGS')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mainTab === 'DELIVERY_LOGS' ? '#0071E3' : 'transparent',
              color: mainTab === 'DELIVERY_LOGS' ? '#FFFFFF' : '#64748B',
              boxShadow: mainTab === 'DELIVERY_LOGS' ? '0 2px 8px rgba(0,113,227,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            📦 Trip Archives ({history.length})
          </button>
        </div>
      </div>

      {/* 💰 Available Shift Earnings & Payout Card */}
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
            backgroundColor: totalPayout > 0 ? '#0071E3' : '#64748B',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: '800',
            cursor: totalPayout > 0 ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: totalPayout > 0 ? '0 4px 14px rgba(0, 113, 227, 0.35)' : 'none',
            transition: 'all 0.15s ease',
            opacity: totalPayout > 0 ? 1 : 0.85,
          }}
        >
          <Zap size={16} fill="#FFFFFF" />
          <span>{totalPayout > 0 ? 'Instant Cashout to Bank (UPI)' : '✓ Fully Cashed Out to Bank'}</span>
        </button>
      </div>

      {/* ── MAIN TAB: WALLET HISTORY PER WEEK / PER MONTH ──────────────── */}
      {mainTab === 'WALLET_HISTORY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Time Period Filter Pills */}
          <div
            className="glass-card"
            style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '8px',
              overflowX: 'auto'
            }}
          >
            <button
              type="button"
                onClick={() => setWalletPeriod('THIS_WEEK')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: '1px solid var(--glass-border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: walletPeriod === 'THIS_WEEK' ? '#0071E3' : 'rgba(255,255,255,0.7)',
                  color: walletPeriod === 'THIS_WEEK' ? '#FFFFFF' : 'var(--color-graphite)',
                  transition: 'all 0.15s ease'
                }}
              >
                📅 This Week
              </button>

              <button
                type="button"
                onClick={() => setWalletPeriod('THIS_MONTH')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: '1px solid var(--glass-border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: walletPeriod === 'THIS_MONTH' ? '#0071E3' : 'rgba(255,255,255,0.7)',
                  color: walletPeriod === 'THIS_MONTH' ? '#FFFFFF' : 'var(--color-graphite)',
                  transition: 'all 0.15s ease'
                }}
              >
                🗓️ This Month
              </button>

              <button
                type="button"
                onClick={() => setWalletPeriod('ALL')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: '1px solid var(--glass-border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: walletPeriod === 'ALL' ? '#0071E3' : 'rgba(255,255,255,0.7)',
                  color: walletPeriod === 'ALL' ? '#FFFFFF' : 'var(--color-graphite)',
                  transition: 'all 0.15s ease'
                }}
              >
                📜 All Time
              </button>
            </div>

          {/* 📅 Week-by-Week Selector Bar */}
          {walletPeriod === 'THIS_WEEK' && (() => {
            const weekInfo = getWeekInfo(weekOffset);
            return (
              <div
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }}
              >
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#0F172A'
                  }}
                >
                  <ChevronLeft size={20} />
                </button>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <Calendar size={18} color="#0071E3" />
                    <span style={{ fontSize: '17px', fontWeight: '800', color: '#1D1D1F' }}>
                      {weekInfo.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                    Showing weekly earnings & withdrawal summary
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextWeek}
                  disabled={weekOffset >= 0}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: weekOffset >= 0 ? '#F8FAFC' : '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: weekOffset >= 0 ? 'not-allowed' : 'pointer',
                    color: weekOffset >= 0 ? '#94A3B8' : '#0F172A',
                    opacity: weekOffset >= 0 ? 0.5 : 1
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            );
          })()}

          {/* 🗓️ Month-by-Month Selector Bar */}
          {walletPeriod === 'THIS_MONTH' && (
            <div
              className="glass-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#0F172A'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <Calendar size={18} color="#0071E3" />
                  <span style={{ fontSize: '17px', fontWeight: '800', color: '#1D1D1F' }}>
                    {selectedMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                  Showing monthly earnings & withdrawal summary
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#0F172A'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Sleek Unified Period Summary Row (2 Columns: Earned & Withdrawn) */}
          <div
            className="glass-card"
            style={{
              padding: '14px 16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            {/* Monthly / Weekly / Total Earned */}
            <div style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#F0FDF4', borderRadius: '14px', border: '1px solid #DCFCE7' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.2px', display: 'block', marginBottom: '4px' }}>
                {walletPeriod === 'THIS_MONTH' ? 'Monthly Earned' : walletPeriod === 'THIS_WEEK' ? 'Weekly Earned' : 'Total Earned'}
              </span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#16A34A' }}>
                +₹{periodGrossEarnings.toFixed(2)}
              </span>
            </div>

            {/* Monthly / Weekly / Total Withdrawn */}
            <div style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#FEF2F2', borderRadius: '14px', border: '1px solid #FEE2E2' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.2px', display: 'block', marginBottom: '4px' }}>
                {walletPeriod === 'THIS_MONTH' ? 'Monthly Withdrawn' : walletPeriod === 'THIS_WEEK' ? 'Weekly Withdrawn' : 'Total Withdrawn'}
              </span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#DC2626' }}>
                -₹{periodTransferred.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Wallet Activity Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-graphite)', margin: '8px 0 2px' }}>
              Wallet Transactions ({
                filteredPayoutTransfers.length +
                ((walletPeriod === 'ALL' || isCurrentSelectedMonth) ? (incentiveCampaigns || []).filter(c => c.isRedeemed).length : 0) +
                periodDeliveredHistory.length
              })
            </h3>

            {/* Empty State when no transactions exist for the selected month */}
            {filteredPayoutTransfers.length === 0 && periodDeliveredHistory.length === 0 && (!isCurrentSelectedMonth || (incentiveCampaigns || []).filter(c => c.isRedeemed).length === 0) && (
              <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>
                  No transactions logged for {selectedMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Use the month arrows above to inspect activity from active months.
                </p>
              </div>
            )}

            {/* List Payout Transfers (Cashouts Out) */}
            {filteredPayoutTransfers.length > 0 ? (
              filteredPayoutTransfers.map((t) => (
                <div
                  key={t.id}
                  className="glass-card"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderLeft: '4px solid #DC2626',
                    backgroundColor: 'rgba(254, 242, 242, 0.7)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        backgroundColor: '#FEE2E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#DC2626',
                        flexShrink: 0
                      }}
                    >
                      <Building size={20} color="#DC2626" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F' }}>
                          Instant Bank Payout (UPI)
                        </span>
                        <span className="badge badge-red" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          Transferred Out
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        To {t.bankUpi} • {t.dateFormatted}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#DC2626' }}>
                      -₹{t.amount.toFixed(2)}
                    </span>
                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', marginTop: '2px' }}>
                      ✓ IMPS Success
                    </div>
                  </div>
                </div>
              ))
            ) : null}

            {/* List ONLY REDEEMED Incentive Campaigns */}
            {(walletPeriod === 'ALL' || isCurrentSelectedMonth) && (incentiveCampaigns || []).filter(c => c.isRedeemed).map((c) => (
              <div
                key={`inc-${c.id}`}
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  borderLeft: '4px solid #34C759',
                  backgroundColor: 'rgba(240, 253, 244, 0.7)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: '#DCFCE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#16A34A',
                      flexShrink: 0
                    }}
                  >
                    <Award size={20} color="#16A34A" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F' }}>
                        Incentive Reward ({c.title})
                      </span>
                      <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {c.isRedeemed ? 'Credited' : 'Milestone Bonus'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      10 Deliveries Milestone Bonus • {c.isRedeemed ? 'Credited to Wallet' : 'Target Unlocked'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#16A34A' }}>
                    +₹{c.bonusAmount.toFixed(2)}
                  </span>
                  <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', marginTop: '2px' }}>
                    ✓ {c.isRedeemed ? 'Bonus Credited' : 'Earned Bonus'}
                  </div>
                </div>
              </div>
            ))}

            {/* List Period-Specific Trip Earnings */}
            {periodDeliveredHistory.map((h) => {
                const earningAmt = h.totalAmount > 0 ? 55 + (h.distanceKm || 2) * 10 : 65;
                return (
                  <div
                    key={h.orderId}
                    className="glass-card"
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      borderLeft: '4px solid #16A34A'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          backgroundColor: '#DCFCE7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#16A34A',
                          flexShrink: 0
                        }}
                      >
                        <Wallet size={20} color="#16A34A" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F' }}>
                            Trip Earning ({h.orderNumber})
                          </span>
                          <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>
                            Credited
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {h.supermarketName || 'GrabIt Supermarket'} • {h.timestamp}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#16A34A' }}>
                        +₹{earningAmt.toFixed(2)}
                      </span>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginTop: '2px' }}>
                        Trip Fee
                      </div>
                    </div>
                  </div>
                );
              })}

            {filteredPayoutTransfers.length === 0 && history.filter(h => h.status === 'DELIVERED').length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '32px' }}>
                <Wallet size={32} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  No wallet transactions recorded for this period.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN TAB: TRIP ARCHIVES ────────────────────────────────────────── */}
      {mainTab === 'DELIVERY_LOGS' && (
        <>
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
        </>
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
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '36px 16px 16px',
            overflowY: 'auto',
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
                  ₹{(lastTransferredAmount || totalPayout).toFixed(2)} Transferred!
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

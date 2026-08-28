import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { ChevronRight, Gift } from 'lucide-react';

export const IncentiveCard: React.FC = () => {
  const { state, openModal } = useDelivery();
  const { incentiveCampaigns, stats } = state;

  const activeCampaign = incentiveCampaigns.find((c) => c.isActive);
  if (!activeCampaign) return null;

  const isRedeemed = activeCampaign.isRedeemed;
  const rawCompletedCount = activeCampaign.completedCount ?? stats.completedToday;
  const targetCount = activeCampaign.targetCount;
  const bonusAmount = activeCampaign.bonusAmount;
  const completedCount = isRedeemed ? Math.min(targetCount, rawCompletedCount) : rawCompletedCount;
  const isCompleted = completedCount >= targetCount;
  const progressPercentage = Math.min(100, Math.round((completedCount / targetCount) * 100));

  return (
    <div
      className="card-pop"
      style={{
        background: isRedeemed
          ? 'linear-gradient(130deg, #047857 0%, #059669 40%, #10B981 100%)'
          : 'linear-gradient(130deg, #1565C0 0%, #1976D2 40%, #2196F3 100%)',
        borderRadius: '20px',
        padding: '18px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isRedeemed
          ? '0 8px 28px rgba(5, 150, 105, 0.35)'
          : '0 8px 28px rgba(21, 101, 192, 0.40)',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      {/* Decorative confetti dots */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Top-left sparkles */}
        <div style={{ position: 'absolute', top: '14px', left: '140px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,235,59,0.70)' }} />
        <div style={{ position: 'absolute', top: '28px', left: '155px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,138,101,0.65)' }} />
        <div style={{ position: 'absolute', top: '8px', left: '170px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.5)' }} />
        {/* Right side behind gift */}
        <div style={{ position: 'absolute', top: '18px', right: '60px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255,235,59,0.6)' }} />
        <div style={{ position: 'absolute', top: '38px', right: '80px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(255,138,101,0.55)' }} />
        <div style={{ position: 'absolute', top: '50px', right: '55px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.45)' }} />
        <div style={{ position: 'absolute', bottom: '28px', right: '70px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255,235,59,0.5)' }} />
      </div>

      {/* Gift box illustration — right side */}
      <div
        style={{
          position: 'absolute',
          right: '-6px',
          top: '0px',
          bottom: '0px',
          width: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* SVG Gift Box */}
        <svg viewBox="0 0 100 110" width="105" height="110" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Box body */}
          <rect x="12" y="48" width="76" height="54" rx="5" fill={isRedeemed ? '#86EFAC' : '#FFC107'} />
          {/* Box lid */}
          <rect x="8" y="35" width="84" height="18" rx="4" fill={isRedeemed ? '#BBF7D0' : '#FFD54F'} />
          {/* Ribbon vertical */}
          <rect x="44" y="35" width="12" height="67" rx="3" fill={isRedeemed ? '#15803D' : '#EF5350'} />
          {/* Ribbon horizontal on lid */}
          <rect x="8" y="41" width="84" height="12" rx="3" fill={isRedeemed ? '#15803D' : '#EF5350'} />
          {/* Bow left loop */}
          <ellipse cx="34" cy="33" rx="14" ry="9" fill={isRedeemed ? '#15803D' : '#EF5350'} transform="rotate(-25 34 33)" />
          {/* Bow right loop */}
          <ellipse cx="66" cy="33" rx="14" ry="9" fill={isRedeemed ? '#15803D' : '#EF5350'} transform="rotate(25 66 33)" />
          {/* Bow center knot */}
          <circle cx="50" cy="35" r="7" fill={isRedeemed ? '#166534' : '#E53935'} />
          {/* Shine on lid */}
          <rect x="18" y="38" width="18" height="5" rx="2.5" fill="rgba(255,255,255,0.25)" />
        </svg>
      </div>

      {/* Left content area */}
      <div style={{ paddingRight: '100px' }}>
        {/* Top row: tag + expiry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: isRedeemed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              fontSize: '10.5px',
              fontWeight: '800',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '3px 9px',
              borderRadius: '10px',
              border: isRedeemed ? '1px solid rgba(255,255,255,0.40)' : '1px solid rgba(255,255,255,0.30)',
            }}
          >
            {isRedeemed ? '🔒 COMPLETED & REDEEMED' : '🔥 LIMITED TIME'}
          </span>
        </div>

        {/* Headline */}
        <h3
          style={{
            fontSize: '17px',
            fontWeight: '800',
            color: '#FFFFFF',
            margin: '0 0 6px',
            lineHeight: '1.25',
            letterSpacing: '-0.2px',
          }}
        >
          {isRedeemed
            ? `Completed ${targetCount} Deliveries Milestone!`
            : isCompleted
            ? `You completed ${targetCount} deliveries!`
            : `Complete ${targetCount} deliveries & earn ₹${bonusAmount} extra!`}
        </h3>

        {/* Progress text */}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.90)', margin: '0 0 10px', fontWeight: '600' }}>
          {isRedeemed
            ? `${targetCount} / ${targetCount} completed (100%) • ₹${bonusAmount} Credited to Wallet`
            : `${completedCount} / ${targetCount} completed`}
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercentage}%`,
              backgroundColor: '#69F0AE',
              borderRadius: '4px',
              transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* View Incentive Details button */}
        <button
          type="button"
          onClick={() => openModal('INCENTIVE_DETAILS')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isRedeemed ? '#DCFCE7' : isCompleted ? '#69F0AE' : '#FFFFFF',
            color: isRedeemed ? '#15803D' : isCompleted ? '#1D1D1F' : '#1565C0',
            fontSize: '13px',
            fontWeight: '800',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 18px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            letterSpacing: '-0.1px',
          }}
        >
          {isRedeemed ? '🔒 Locked (Reward Claimed)' : isCompleted ? '🎉 View Reward' : 'View Incentive Details'} <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

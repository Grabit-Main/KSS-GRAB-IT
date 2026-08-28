import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { Target, X, CheckCircle2, Award, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const IncentiveDetailsModal: React.FC = () => {
  const { state, closeModal, redeemIncentive } = useDelivery();
  const { activeModal, incentiveCampaigns, stats } = state;
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (activeModal !== 'INCENTIVE_DETAILS') return null;

  const activeCampaign = incentiveCampaigns.find((c) => c.isActive) || incentiveCampaigns[0];

  if (!activeCampaign) return null;

  const rawCount = activeCampaign.completedCount ?? stats.completedToday;
  const targetCount = activeCampaign.targetCount;
  const bonusAmount = activeCampaign.bonusAmount;
  const isCompleted = rawCount >= targetCount;
  const isRedeemed = !!activeCampaign.isRedeemed;

  // Cap display count to targetCount (e.g. 10 / 10 instead of 24 / 10)
  const displayCount = Math.min(targetCount, rawCount);
  const progressPercentage = Math.min(100, Math.round((displayCount / targetCount) * 100));

  const handleRedeem = () => {
    if (isRedeemed || !isCompleted || isRedeeming) return;
    setIsRedeeming(true);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
    redeemIncentive(activeCampaign.id, bonusAmount);
    setTimeout(() => {
      setIsRedeeming(false);
      closeModal();
    }, 1200);
  };

  return (
    <div className="modal-overlay" style={{ padding: '16px' }}>
      <div
        className="modal-content glass-strong"
        style={{
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #D2D2D7',
          boxShadow: '0 24px 64px rgba(29, 29, 31, 0.16)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #D2D2D7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F5F5F7'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: isRedeemed ? 'rgba(142, 142, 147, 0.15)' : isCompleted ? 'rgba(52, 199, 89, 0.12)' : 'rgba(0, 113, 227, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isRedeemed ? '1px solid #8E8E93' : isCompleted ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid rgba(0, 113, 227, 0.3)'
              }}
            >
              {isRedeemed ? <Lock size={20} color="#8E8E93" /> : isCompleted ? <Award size={20} color="#34C759" /> : <Target size={20} color="#0071E3" />}
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1D1D1F', margin: 0 }}>
                {activeCampaign.title}
              </h3>
              <span style={{ fontSize: '11.5px', color: isRedeemed ? '#8E8E93' : '#FF3B30', fontWeight: '700' }}>
                {isRedeemed ? '🔒 Completed & Redeemed' : activeCampaign.expiresAt}
              </span>
            </div>
          </div>

          <button
            onClick={closeModal}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D2D2D7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} color="#1D1D1F" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          {/* Campaign Status Banner */}
          <div
            style={{
              backgroundColor: isRedeemed ? 'rgba(142, 142, 147, 0.1)' : isCompleted ? 'rgba(52, 199, 89, 0.1)' : '#F5F5F7',
              borderRadius: '16px',
              padding: '16px 18px',
              border: isRedeemed ? '1px solid #8E8E93' : isCompleted ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid #D2D2D7'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '700', color: isRedeemed ? '#8E8E93' : isCompleted ? '#16A34A' : '#86868B' }}>
              {isRedeemed ? '🔒 Locked — Campaign Completed' : isCompleted ? '🎉 Milestone Achieved — Ready to Redeem' : 'Campaign Overview'}
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1D1D1F', margin: '4px 0 2px' }}>
              {isRedeemed ? `₹${bonusAmount} Bonus Redeemed to Wallet` : `Earn ₹${bonusAmount} Extra Bonus`}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
              {isRedeemed
                ? `You have already completed your 10 orders target and successfully redeemed your ₹${bonusAmount} incentive reward directly to your wallet balance.`
                : isCompleted
                ? `Congratulations! You completed ${targetCount} verified deliveries. Redeem your ₹${bonusAmount} bonus to your wallet now.`
                : `Complete ${targetCount} verified grocery deliveries today to unlock your incentive reward.`}
            </p>
          </div>

          {/* Progress Tracker Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ fontWeight: '700', color: '#1D1D1F' }}>Delivery Completion Progress</span>
              <span style={{ fontWeight: '800', color: isRedeemed ? '#8E8E93' : isCompleted ? '#34C759' : '#0071E3' }}>
                {displayCount} / {targetCount} ({progressPercentage}%)
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#F5F5F7',
                border: '1px solid #D2D2D7',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercentage}%`,
                  backgroundColor: isRedeemed ? '#8E8E93' : isCompleted ? '#34C759' : '#0071E3',
                  borderRadius: '8px',
                  transition: 'width 0.6s ease'
                }}
              />
            </div>
          </div>

          {/* Tiered Reward Breakdown */}
          {activeCampaign.tierBreakdown && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F', marginBottom: '10px' }}>
                Tiered Reward Milestone Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeCampaign.tierBreakdown.map((tier) => {
                  const reached = rawCount >= tier.targetCount;
                  return (
                    <div
                      key={tier.level}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: isRedeemed ? 'rgba(142, 142, 147, 0.08)' : reached ? 'rgba(52, 199, 89, 0.08)' : '#F5F5F7',
                        border: isRedeemed ? '1px solid #D2D2D7' : reached ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid #D2D2D7'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: isRedeemed ? '#8E8E93' : reached ? '#34C759' : '#86868B',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}
                        >
                          {isRedeemed ? <CheckCircle2 size={14} color="#FFF" /> : reached ? <CheckCircle2 size={14} color="#FFF" /> : tier.level}
                        </div>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1D1D1F', display: 'block' }}>
                            Level {tier.level}: {tier.targetCount} Deliveries
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#86868B' }}>
                            {isRedeemed ? 'Milestone completed & redeemed' : reached ? 'Milestone achieved' : `${tier.targetCount - rawCount} more needed`}
                          </span>
                        </div>
                      </div>

                      <span style={{ fontSize: '14px', fontWeight: '800', color: isRedeemed ? '#8E8E93' : reached ? '#34C759' : '#0071E3' }}>
                        +₹{tier.bonusAmount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1D1D1F', marginBottom: '8px' }}>
              Campaign Terms & Rules
            </h4>
            <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: '#86868B', lineHeight: '1.5' }}>
              {activeCampaign.terms.map((term, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Action Button */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid #D2D2D7', backgroundColor: '#F5F5F7' }}>
          {isRedeemed ? (
            <button
              disabled
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14.5px',
                fontWeight: '800',
                borderRadius: '14px',
                backgroundColor: '#8E8E93',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Lock size={16} /> Locked — You Already Completed & Redeemed This
            </button>
          ) : isCompleted ? (
            <button
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '800',
                borderRadius: '14px',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)'
              }}
            >
              <Sparkles size={18} /> {isRedeeming ? 'Crediting Reward...' : `Redeem ₹${bonusAmount} Bonus to Wallet`}
            </button>
          ) : (
            <button
              onClick={closeModal}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14.5px', fontWeight: '700', borderRadius: '14px', backgroundColor: '#0071E3' }}
            >
              Got It
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

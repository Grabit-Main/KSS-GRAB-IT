import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { Target, X, CheckCircle2, Award, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

export const IncentiveDetailsModal: React.FC = () => {
  const { state, closeModal } = useDelivery();
  const { activeModal, incentiveCampaigns, stats } = state;

  if (activeModal !== 'INCENTIVE_DETAILS') return null;

  const activeCampaign = incentiveCampaigns.find((c) => c.isActive) || incentiveCampaigns[0];

  if (!activeCampaign) return null;

  const completedCount = activeCampaign.completedCount ?? stats.completedToday;
  const targetCount = activeCampaign.targetCount;
  const bonusAmount = activeCampaign.bonusAmount;
  const isCompleted = completedCount >= targetCount;
  const progressPercentage = Math.min(100, Math.round((completedCount / targetCount) * 100));

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
                backgroundColor: isCompleted ? 'rgba(52, 199, 89, 0.12)' : 'rgba(0, 113, 227, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isCompleted ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid rgba(0, 113, 227, 0.3)'
              }}
            >
              {isCompleted ? <Award size={20} color="#34C759" /> : <Target size={20} color="#0071E3" />}
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1D1D1F', margin: 0 }}>
                {activeCampaign.title}
              </h3>
              <span style={{ fontSize: '11.5px', color: '#FF3B30', fontWeight: '700' }}>
                {activeCampaign.expiresAt}
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
          
          {/* Main Campaign Offer Banner */}
          <div
            style={{
              backgroundColor: '#F5F5F7',
              borderRadius: '16px',
              padding: '16px 18px',
              border: '1px solid #D2D2D7'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#86868B' }}>Campaign Overview</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1D1D1F', margin: '4px 0 2px' }}>
              Earn ₹{bonusAmount} Extra Bonus
            </h2>
            <p style={{ fontSize: '13px', color: '#86868B', margin: 0, lineHeight: '1.4' }}>
              Complete {targetCount} verified grocery deliveries today to unlock your incentive reward.
            </p>
          </div>

          {/* Progress Tracker Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ fontWeight: '700', color: '#1D1D1F' }}>Delivery Completion Progress</span>
              <span style={{ fontWeight: '800', color: isCompleted ? '#34C759' : '#0071E3' }}>
                {completedCount} / {targetCount} ({progressPercentage}%)
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
                  backgroundColor: isCompleted ? '#34C759' : '#0071E3',
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
                  const reached = completedCount >= tier.targetCount;
                  return (
                    <div
                      key={tier.level}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: reached ? 'rgba(52, 199, 89, 0.08)' : '#F5F5F7',
                        border: reached ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid #D2D2D7'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: reached ? '#34C759' : '#86868B',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}
                        >
                          {reached ? <CheckCircle2 size={14} color="#FFF" /> : tier.level}
                        </div>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1D1D1F', display: 'block' }}>
                            Level {tier.level}: {tier.targetCount} Deliveries
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#86868B' }}>
                            {reached ? 'Milestone achieved' : `${tier.targetCount - completedCount} more needed`}
                          </span>
                        </div>
                      </div>

                      <span style={{ fontSize: '14px', fontWeight: '800', color: reached ? '#34C759' : '#0071E3' }}>
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
          <button
            onClick={closeModal}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14.5px', fontWeight: '700', borderRadius: '14px', backgroundColor: '#0071E3' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { ChevronRight, Award, Flame, CheckCircle2 } from 'lucide-react';

export const IncentiveCard: React.FC = () => {
  const { state, openModal } = useDelivery();
  const { incentiveCampaigns, stats } = state;

  const activeCampaign = incentiveCampaigns.find((c) => c.isActive) || incentiveCampaigns[0];
  if (!activeCampaign) return null;

  const isRedeemed = !!activeCampaign.isRedeemed;
  const rawCompletedCount = activeCampaign.completedCount ?? stats.completedToday;
  const targetCount = activeCampaign.targetCount;
  const bonusAmount = activeCampaign.bonusAmount;
  const completedCount = isRedeemed ? Math.min(targetCount, rawCompletedCount) : rawCompletedCount;
  const isCompleted = completedCount >= targetCount;
  const progressPercentage = Math.min(100, Math.round((completedCount / targetCount) * 100));

  return (
    <>
      <style>{`
        @keyframes trophyFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .grabit-incentive-banner {
          background: radial-gradient(circle at 85% 50%, rgba(255, 214, 0, 0.15) 0%, transparent 60%), linear-gradient(135deg, #0047FF 0%, #002299 100%) !important;
          border-radius: 24px !important;
          padding: 24px 32px !important;
          position: relative !important;
          overflow: hidden !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 10px 32px rgba(0, 70, 226, 0.28) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 24px !important;
          transition: transform 0.25s ease, box-shadow 0.25s ease !important;
        }

        .grabit-incentive-banner:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(0, 70, 226, 0.38) !important;
        }

        .incentive-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 9px !important;
          background: #FFFFFF !important;
          color: #0038FF !important;
          font-size: 14.5px !important;
          font-weight: 800 !important;
          border: none !important;
          border-radius: 14px !important;
          padding: 11px 22px !important;
          cursor: pointer !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18) !important;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease !important;
          letter-spacing: -0.1px !important;
        }

        .incentive-btn:hover {
          transform: translateY(-2px) scale(1.01) !important;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28) !important;
          background-color: #F8FAFC !important;
        }

        .incentive-btn:active {
          transform: scale(0.98) !important;
        }

        /* Responsive Mobile Compact Layout (< 680px) */
        @media (max-width: 680px) {
          .grabit-incentive-banner {
            padding: 14px 16px !important;
            border-radius: 18px !important;
            position: relative !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .incentive-left-content {
            width: 100% !important;
            padding-right: 155px !important;
            box-sizing: border-box !important;
          }
          .incentive-pill-tag {
            font-size: 10px !important;
            padding: 3.5px 10px !important;
            letter-spacing: 0.4px !important;
          }
          .incentive-headline-text {
            font-size: 16px !important;
            margin-bottom: 4px !important;
            line-height: 1.22 !important;
          }
          .incentive-subtitle-text {
            font-size: 11.5px !important;
            margin-bottom: 6px !important;
          }
          .incentive-progress-bar-container {
            height: 7px !important;
            margin-bottom: 12px !important;
          }
          .incentive-btn {
            padding: 8px 14px !important;
            font-size: 12px !important;
            border-radius: 11px !important;
            gap: 6px !important;
            width: fit-content !important;
          }
          .incentive-graphic-container {
            position: absolute !important;
            top: 50% !important;
            right: -8px !important;
            transform: translateY(-50%) !important;
            width: 170px !important;
            height: 170px !important;
            margin: 0 !important;
          }
          .incentive-graphic-container img {
            width: 165px !important;
            height: 165px !important;
          }
        }
      `}</style>

      <div className="grabit-incentive-banner">
        {/* Left Column: Information & Controls */}
        <div className="incentive-left-content" style={{ flex: '1 1 auto', zIndex: 2, maxWidth: '620px' }}>
          {/* Top Pill Tag */}
          <div style={{ marginBottom: '8px' }}>
            <span
              className="incentive-pill-tag"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                padding: '5px 12px',
                borderRadius: '26px',
                border: '1.5px solid rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {isRedeemed ? (
                <>
                  <CheckCircle2 size={13} color="#86EFAC" /> LOCKED & REDEEMED
                </>
              ) : (
                <>
                  <Flame size={14} color="#FFD600" fill="#FFD600" /> LIMITED TIME INCENTIVE
                </>
              )}
            </span>
          </div>

          {/* Main Headline with Yellow Highlight */}
          <h2
            className="incentive-headline-text"
            style={{
              fontSize: '25px',
              fontWeight: '900',
              color: '#FFFFFF',
              margin: '0 0 6px',
              lineHeight: '1.25',
              letterSpacing: '-0.4px',
            }}
          >
            {isRedeemed ? (
              `Completed ${targetCount} Deliveries Milestone!`
            ) : isCompleted ? (
              <>Target Reached! Claim <span style={{ color: '#FFD600', fontSize: '1.08em' }}>₹{bonusAmount}</span> Extra Bonus</>
            ) : (
              <>Complete {targetCount} deliveries & earn <span style={{ color: '#FFD600', fontSize: '1.08em' }}>₹{bonusAmount}</span> extra!</>
            )}
          </h2>

          {/* Subtitle Progress */}
          <p
            className="incentive-subtitle-text"
            style={{
              fontSize: '13.5px',
              color: 'rgba(255, 255, 255, 0.88)',
              margin: '0 0 10px',
              fontWeight: '600'
            }}
          >
            {isRedeemed
              ? `${targetCount} of ${targetCount} completed (100%) • ₹${bonusAmount} Credited`
              : `${completedCount} of ${targetCount} completed (${progressPercentage}%)`}
          </p>

          {/* Glass Progress Bar with Yellow/Gold Progress Fill */}
          <div
            className="incentive-progress-bar-container"
            style={{
              width: '100%',
              maxWidth: '420px',
              height: '8.5px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercentage}%`,
                background: isRedeemed
                  ? 'linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)'
                  : 'linear-gradient(90deg, #FFD600 0%, #FF9100 100%)',
                borderRadius: '10px',
                transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 10px rgba(255, 214, 0, 0.5)',
              }}
            />
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="incentive-btn"
            onClick={() => openModal('INCENTIVE_DETAILS')}
          >
            <Award size={17} color="#0038FF" />
            <span>{isRedeemed ? 'View Reward Summary' : isCompleted ? 'Claim ₹500 Bonus Now' : 'View Incentive Details'}</span>
            <ChevronRight size={17} color="#0038FF" />
          </button>
        </div>

        {/* Right Column: Floating Transparent 3D Trophy & Gold Coins */}
        <div
          className="incentive-graphic-container"
          style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            animation: 'trophyFloat 4s ease-in-out infinite',
            width: '220px',
            height: '200px',
            marginRight: '-4px'
          }}
        >
          <img
            src="/assets/incentive_trophy_transparent.png"
            alt="Gold Trophy & Coins"
            style={{
              width: '215px',
              height: '215px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.30))',
              position: 'relative',
              zIndex: 2,
            }}
          />
        </div>
      </div>
    </>
  );
};

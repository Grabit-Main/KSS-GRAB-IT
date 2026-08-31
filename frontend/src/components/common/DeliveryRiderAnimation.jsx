import { useState, useEffect } from 'react';

// In-memory flag that resets ONLY when the browser reloads / refreshes the JS bundle
let hasPlayedThisSession = false;

export default function DeliveryRiderAnimation() {
  const [visible, setVisible] = useState(() => !hasPlayedThisSession);

  useEffect(() => {
    if (visible) {
      hasPlayedThisSession = true;
      const timer = setTimeout(() => {
        setVisible(false);
      }, 6200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: 0,
      width: '100vw',
      height: '180px',
      pointerEvents: 'none',
      zIndex: 99999,
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes driveAcross {
          0% {
            transform: translateX(-300px);
          }
          100% {
            transform: translateX(calc(100vw + 300px));
          }
        }

        @keyframes flagWave {
          0%, 100% {
            transform: rotate(0deg) translateY(0px);
          }
          50% {
            transform: rotate(-6deg) translateY(-5px);
          }
        }

        .scooter-driver-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 210px;
          height: 138px;
          animation: driveAcross 5.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          will-change: transform;
        }

        .mounted-3d-flag {
          position: absolute;
          top: -38px;
          left: -40px;
          width: 90px;
          height: auto;
          z-index: 2;
          animation: flagWave 1.4s ease-in-out infinite;
          transform-origin: center right;
          filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.3));
        }
      `}</style>

      {/* Scooter Driver Container */}
      <div className="scooter-driver-container">
        
        {/* 3D FAST DELIVERY Waving Flag (Stick Removed) */}
        <img
          src="/grabit-fast-delivery-flag.png"
          alt="FAST DELIVERY Flag"
          className="mounted-3d-flag"
        />

        {/* Main Clean Rider Scooter Image */}
        <img
          src="/grabit-rider-scooter.png"
          alt="Grabit Fast Delivery Rider"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.22))'
          }}
        />
      </div>
    </div>
  );
}

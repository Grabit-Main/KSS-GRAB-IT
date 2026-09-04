import React, { useState, useEffect } from 'react';

const DOODLE_BG = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787653733/grabit_media/eu9h4icihrmbgxevh0z9.jpg';
const FAVICON_3D = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787646563/grabit_media/ckpo0cpaoydv5zt8yyj0.png';
const LOGO_PNG = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

export function SplashScreen({ minDuration = 1800, onFinish }) {
  const [show] = useState(() => {
    try {
      return !sessionStorage.getItem('grabit_splash_displayed');
    } catch {
      return true;
    }
  });
  const [stage, setStage] = useState('animate'); // 'animate', 'exit', 'hidden'

  useEffect(() => {
    if (!show) {
      if (onFinish) onFinish();
      return;
    }
    const tExit = setTimeout(() => setStage('exit'), minDuration);
    const tHidden = setTimeout(() => {
      setStage('hidden');
      try {
        sessionStorage.setItem('grabit_splash_displayed', 'true');
      } catch {}
      if (onFinish) onFinish();
    }, minDuration + 500);

    return () => {
      clearTimeout(tExit);
      clearTimeout(tHidden);
    };
  }, [minDuration, onFinish, show]);

  if (!show || stage === 'hidden') return null;

  return (
    <div
      onClick={() => {
        setStage('hidden');
        if (onFinish) onFinish();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 999999,
        backgroundColor: '#EBF3FC',
        backgroundImage: `url(${DOODLE_BG})`,
        backgroundSize: '580px 580px',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Plus Jakarta Sans", sans-serif',
        opacity: stage === 'exit' ? 0 : 1,
        transform: stage === 'exit' ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: stage === 'exit' ? 'none' : 'auto',
        userSelect: 'none',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        cursor: 'pointer',
      }}
    >
      <style>{`
        @keyframes popFavicon {
          0% {
            opacity: 0;
            transform: scale(0.55);
          }
          65% {
            transform: scale(1.06);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes emergeFromInside {
          0% {
            opacity: 0;
            max-width: 0px;
            transform: translateX(-50px) scale(0.85);
            clip-path: inset(0 100% 0 0);
          }
          35% {
            opacity: 0.8;
          }
          100% {
            opacity: 1;
            max-width: 360px;
            transform: translateX(0px) scale(1);
            clip-path: inset(0 0% 0 0);
          }
        }
      `}</style>

      {/* Seamless Favicon + Logo Lockup (Directly on Background, Zero Enclosing Box) */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0',
          maxWidth: '94vw',
        }}
      >
        {/* 1. Favicon (Enlarged 3D Box, pops in smoothly) */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            animation: 'popFavicon 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <img
            src={FAVICON_3D}
            alt="GrabIt Favicon"
            style={{
              width: '96px',
              height: '96px',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.08))',
            }}
          />
        </div>

        {/* 2. Main Logo (Enlarged, emerges smoothly from inside the 3D box with zero gap) */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            marginLeft: '-4px', // Zero gap touch
            animation: 'emergeFromInside 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards',
            opacity: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <img
            src={LOGO_PNG}
            alt="GrabIt"
            style={{
              height: '82px',
              width: 'auto',
              maxWidth: '340px',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.06))',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;

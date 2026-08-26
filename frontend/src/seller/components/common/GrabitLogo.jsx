import React from 'react';
const grabitLogoPng = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

export const GrabitLogo = ({ height = 38, showTagline = false, className = '' }) => {
  return (
    <div
      className={`grabit-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        userSelect: 'none',
      }}
    >
      {/* High-Resolution Crisp SVG Icon & Typography */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height,
        }}
      >
        {/* Crisp Vector Fast Delivery Box Icon */}
        <svg
          width={height * 0.95}
          height={height * 0.95}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(79, 70, 229, 0.25))' }}
        >
          <defs>
            <linearGradient id="grabitGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="grabitFlap" x1="12" y1="6" x2="36" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
          {/* Main 3D Box Body */}
          <path
            d="M8 18L24 9L40 18V34L24 43L8 34V18Z"
            fill="url(#grabitGrad)"
          />
          {/* Top Flaps */}
          <path
            d="M8 18L24 27L40 18L24 9L8 18Z"
            fill="url(#grabitFlap)"
            opacity="0.9"
          />
          {/* Box Seam Lines */}
          <path
            d="M24 27V43"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Motion Fast Speed Lines (Left) */}
          <path
            d="M2 14H6M0 24H5M3 34H7"
            stroke="#4F46E5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Lightning Zap on Box */}
          <path
            d="M26 15L20 25H25L22 33L30 22H24L26 15Z"
            fill="#FBBF24"
            stroke="#F59E0B"
            strokeWidth="0.5"
          />
        </svg>

        {/* Brand Text */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
            <span
              style={{
                fontSize: `${height * 0.58}px`,
                fontWeight: 900,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.8px',
                color: '#1D1D1F',
              }}
            >
              Grab
            </span>
            <span
              style={{
                fontSize: `${height * 0.58}px`,
                fontWeight: 900,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.8px',
                color: '#4F46E5',
              }}
            >
              it
            </span>
          </div>
          {showTagline && (
            <span
              style={{
                fontSize: `${height * 0.22}px`,
                fontWeight: 700,
                letterSpacing: '0.4px',
                color: '#4F46E5',
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              10-Min Fast Delivery
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

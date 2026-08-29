import React from 'react';

export default function Suggest3dGraphic({ size = 84 }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0px 8px 16px rgba(0, 113, 227, 0.25))' }}
      >
        <defs>
          {/* Bulb Body Gradient */}
          <linearGradient id="bulbGrad" x1="20" y1="10" x2="100" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="40%" stopColor="#0071E3" />
            <stop offset="100%" stopColor="#0043A8" />
          </linearGradient>

          {/* Golden Glow Accent */}
          <radialGradient id="goldGlow" cx="60" cy="40" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          {/* Metallic Screw Base Gradient */}
          <linearGradient id="metallicBase" x1="45" y1="75" x2="75" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Basket Gradient */}
          <linearGradient id="basketGrad" x1="20" y1="65" x2="100" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0071E3" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Soft Shadow */}
          <filter id="softShadow" x="0" y="0" width="120" height="120" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0071E3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="60" cy="45" r="40" fill="url(#goldGlow)" />

        {/* 3D Floating Shopping Basket Base */}
        <path
          d="M 25,70 L 32,102 C 33,106 36,108 40,108 L 80,108 C 84,108 87,106 88,102 L 95,70 Z"
          fill="url(#basketGrad)"
          stroke="#FFFFFF"
          strokeWidth="2"
          opacity="0.95"
        />
        <path d="M 20,70 L 100,70" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <path d="M 40,70 L 45,104 M 60,70 L 60,104 M 80,70 L 75,104" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* 3D Glass Lightbulb Sphere */}
        <circle cx="60" cy="44" r="28" fill="url(#bulbGrad)" filter="url(#softShadow)" />

        {/* Inner Highlight / Glass Reflection */}
        <ellipse cx="50" cy="32" rx="10" ry="6" fill="#FFFFFF" opacity="0.5" transform="rotate(-25 50 32)" />

        {/* Glowing 3D Filament Starburst */}
        <path
          d="M 60,30 L 63,38 L 71,39 L 65,45 L 67,53 L 60,48 L 53,53 L 55,45 L 49,39 L 57,38 Z"
          fill="#FDE047"
          stroke="#FFFFFF"
          strokeWidth="1"
        />

        {/* Screw Base & Contact Point */}
        <rect x="50" y="70" width="20" height="6" rx="3" fill="url(#metallicBase)" stroke="#FFFFFF" strokeWidth="1" />
        <rect x="52" y="76" width="16" height="5" rx="2" fill="url(#metallicBase)" />
        <path d="M 55,81 Q 60,85 65,81" fill="#475569" />

        {/* Sparkles / Magic Stars */}
        <path d="M 22,25 L 24,31 L 30,33 L 24,35 L 22,41 L 20,35 L 14,33 L 20,31 Z" fill="#FDE047" />
        <path d="M 96,28 L 97,32 L 101,33 L 97,34 L 96,38 L 95,34 L 91,33 L 95,32 Z" fill="#38BDF8" />
        <path d="M 88,52 L 89,55 L 92,56 L 89,57 L 88,60 L 87,57 L 84,56 L 87,55 Z" fill="#FDE047" />
      </svg>
    </div>
  );
}

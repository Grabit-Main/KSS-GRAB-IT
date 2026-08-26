import React from 'react';
import { Link } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';
const grabitLogoImg = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

export const SellerHeader = ({ onMenuClick, title = 'Seller Overview' }) => {
  return (
    <header className="seller-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 1 }}>
        {/* Perfectly Aligned Grabit Logo */}
        <Link
          to="/seller/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flexShrink: 0,
            lineHeight: 0,
          }}
        >
          <img
            src={grabitLogoImg}
            alt="Grabit"
            className="header-brand-logo"
            style={{
              height: 48,
              width: 'auto',
              maxHeight: 52,
              maxWidth: 190,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Link>

        {/* Subtle Separator */}
        <span
          style={{
            width: 1,
            height: 20,
            backgroundColor: 'var(--color-border-gray)',
            display: 'inline-block',
            margin: '0 2px',
          }}
        />

        {/* Page Title */}
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--color-graphite)',
            letterSpacing: '-0.3px',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Interactive Notification Dropdown */}
        <NotificationDropdown />
      </div>
    </header>
  );
};

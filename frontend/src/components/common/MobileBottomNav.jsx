import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, TrendingUp, User } from 'lucide-react';
import useWindowWidth from '../../hooks/useWindowWidth';

export default function MobileBottomNav() {
  const w = useWindowWidth();
  const isMobile = w <= 768;
  const routerLocation = useLocation();

  if (!isMobile) return null;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
      padding: '6px 8px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)'
    }}>
      {[
        { label: 'Home', path: '/', icon: Home, match: p => p === '/' },
        { label: 'Categories', path: '/categories', icon: LayoutGrid, match: p => p.startsWith('/categor') },
        { label: 'Trending', path: '/search?q=trending', icon: TrendingUp, match: p => p.includes('trending') },
        { label: 'Profile', path: '/profile', icon: User, match: p => p === '/profile' }
      ].map(navItem => {
        const IconComponent = navItem.icon;
        const currentFullUrl = routerLocation.pathname + routerLocation.search;
        const isActive = navItem.match(currentFullUrl);
        const activeColor = '#0071E3'; // Primary Blue
        return (
          <Link
            key={navItem.label}
            to={navItem.path}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '3px', flex: 1, textDecoration: 'none',
              position: 'relative', padding: '4px 0'
            }}
          >
            <div style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '4px 16px', borderRadius: '16px',
              background: isActive ? '#EFF6FF' : 'transparent',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <IconComponent
                size={20}
                color={isActive ? activeColor : '#64748B'}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 800 : 600,
              color: isActive ? activeColor : '#64748B',
              letterSpacing: '-0.2px',
              transition: 'color 0.2s ease, font-weight 0.2s ease'
            }}>
              {navItem.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

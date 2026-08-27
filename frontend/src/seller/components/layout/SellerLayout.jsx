import React, { useState, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SellerSidebar } from './SellerSidebar';
import { SellerHeader } from './SellerHeader';
import { MobileBottomNav } from './MobileBottomNav';

export const SellerLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll to top synchronously before paint on every seller sub-route change
  useLayoutEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const getPageTitle = (pathname) => {
    if (pathname.includes('/categories')) return 'Category Management';
    if (pathname.includes('/products')) return 'Product Management';
    if (pathname.includes('/orders')) return 'Orders & Deliveries';
    return 'Seller Overview';
  };

  return (
    <div className="seller-app-container">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <SellerSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="seller-main-wrapper">
        <SellerHeader
          title={getPageTitle(location.pathname)}
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="seller-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

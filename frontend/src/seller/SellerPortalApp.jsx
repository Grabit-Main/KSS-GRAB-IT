import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SellerAuthProvider } from './context/SellerAuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { SellerLayout } from './components/layout/SellerLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SellerCategoriesPage } from './pages/SellerCategoriesPage';
import { SellerProductsPage } from './pages/SellerProductsPage';
import { SellerOrdersPage } from './pages/SellerOrdersPage';
import { SellerProfilePage } from './pages/SellerProfilePage';
import './seller-theme.css';

export function SellerPortalApp() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SellerAuthProvider>
          <Routes>
            {/* Protected Seller Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<SellerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SellerDashboardPage />} />
                <Route path="categories" element={<SellerCategoriesPage />} />
                <Route path="products" element={<SellerProductsPage />} />
                <Route path="orders" element={<SellerOrdersPage />} />
                <Route path="profile" element={<SellerProfilePage />} />
              </Route>
            </Route>

            {/* Fallback to main unified login */}
            <Route path="login" element={<Navigate to="/login" replace />} />
            <Route path="signup" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </SellerAuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default SellerPortalApp;

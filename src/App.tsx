import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { RootLayout } from './components/layout/RootLayout';

// Domain Feature Pages
import { CatalogPage } from './features/catalog/CatalogPage';
import { ProductDetailPage } from './features/catalog/ProductDetailPage';
import { CartPage } from './features/checkout/CartPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { OrderConfirmationPage } from './features/checkout/OrderConfirmationPage';
import { OrderTrackingPage } from './features/checkout/OrderTrackingPage';
import { MerchantPortalPage } from './features/merchant/MerchantPortalPage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            {/* Catalog & Product Discovery */}
            <Route index element={<CatalogPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />

            {/* Cart & Localized Checkout */}
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
            <Route path="tracking" element={<OrderTrackingPage />} />
            <Route path="tracking/:id" element={<OrderTrackingPage />} />

            {/* Partner & Management Portals */}
            <Route path="merchant/*" element={<MerchantPortalPage />} />
            <Route path="admin/*" element={<AdminDashboardPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ShopProvider>
    </BrowserRouter>
  );
}

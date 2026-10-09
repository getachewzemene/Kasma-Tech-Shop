import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { RootLayout } from './components/layout/RootLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Domain Feature Pages with Code-Splitting
const CatalogPage = React.lazy(() => import('./features/catalog/CatalogPage').then(m => ({ default: m.CatalogPage })));
const ProductDetailPage = React.lazy(() => import('./features/catalog/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = React.lazy(() => import('./features/checkout/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./features/checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = React.lazy(() => import('./features/checkout/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const OrderTrackingPage = React.lazy(() => import('./features/checkout/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));
const MerchantPortalPage = React.lazy(() => import('./features/merchant/MerchantPortalPage').then(m => ({ default: m.MerchantPortalPage })));
const AdminDashboardPage = React.lazy(() => import('./features/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-10 h-10 border-3 border-gray-200 dark:border-zinc-800 border-t-[#0052FF] rounded-full animate-spin" />
    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 font-mono">
      Loading...
    </span>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <Suspense fallback={<PageLoadingFallback />}>
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
              <Route 
                path="merchant/*" 
                element={
                  <ProtectedRoute requiredRole="merchant">
                    <MerchantPortalPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin/*" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ShopProvider>
    </BrowserRouter>
  );
}

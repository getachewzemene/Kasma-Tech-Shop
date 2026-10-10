import React from 'react';
import { useShop } from '../../context/ShopContext';
import CustomerWeb from '../../components/CustomerWeb';
import { CustomerWebSkeleton } from '../../components/Skeletons';
import { FloatingCompareDock } from '../../components/catalog/FloatingCompareDock';
import { TechSpecsComparisonModal } from '../../components/catalog/TechSpecsComparisonModal';
import { QrCodeScannerOverlay } from '../../components/QrCodeScannerOverlay';
import ProductTour from '../../components/ProductTour';

export const CatalogPage: React.FC = () => {
  const { 
    products, 
    categories, 
    language, 
    searchQuery, 
    setSearchQuery, 
    cart,
    setCart,
    favorites,
    setFavorites,
    theme,
    orders,
    offlineOrders,
    isOfflineSimulated,
    setIsOfflineSimulated,
    isSyncing,
    handleForceSync,
    priceAlerts,
    setPriceAlerts,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isPriceAlertsOpen,
    setIsPriceAlertsOpen,
    isQrScannerOpen,
    setIsQrScannerOpen,
    isProductTourOpen,
    setIsProductTourOpen,
    selectedProduct,
    setSelectedProduct,
    promoCodes,
    addOrder,
    updateProductStock,
    showToast,
    comparedProductIds,
    toggleCompare,
    isCompareModalOpen,
    setIsCompareModalOpen,
    openCompareWith,
    isInitializing
  } = useShop();

  if (isInitializing && products.length === 0) {
    return <CustomerWebSkeleton />;
  }

  return (
    <div className="w-full relative">
      {/* Complete Rich Storefront Experience */}
      <CustomerWeb
        products={products}
        categories={categories}
        language={language}
        onAddOrder={addOrder}
        onUpdateProductStock={updateProductStock}
        cart={cart}
        setCart={setCart}
        favorites={favorites}
        setFavorites={setFavorites}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        isWishlistOpen={isWishlistOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        theme={theme}
        orders={orders}
        offlineOrders={offlineOrders}
        isOfflineSimulated={isOfflineSimulated}
        isSyncing={isSyncing}
        onForceSync={handleForceSync}
        onToggleOfflineSimulated={() => setIsOfflineSimulated(!isOfflineSimulated)}
        priceAlerts={priceAlerts}
        setPriceAlerts={setPriceAlerts}
        isPriceAlertsOpen={isPriceAlertsOpen}
        setIsPriceAlertsOpen={setIsPriceAlertsOpen}
        promoCodes={promoCodes}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenProductTour={() => setIsProductTourOpen(true)}
        isOnline={navigator.onLine}
      />

      {/* Floating Side-by-Side Specs Comparison Dock */}
      <FloatingCompareDock
        comparedProductIds={comparedProductIds}
        products={products}
        language={language}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onRemoveProduct={(id) => toggleCompare(id)}
      />

      {/* Side-by-Side Tech Specs Comparison Modal */}
      <TechSpecsComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        productIds={comparedProductIds}
        products={products}
        language={language}
        onRemoveProduct={(id) => toggleCompare(id)}
      />

      {/* Global QR Code Scanner Overlay */}
      <QrCodeScannerOverlay
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsQrScannerOpen(false);
        }}
        onApplySearchQuery={(q) => {
          setSearchQuery(q);
          setIsQrScannerOpen(false);
        }}
        language={language}
        showToast={showToast}
      />

      {/* Interactive Guided Product Tour Popover */}
      <ProductTour
        isOpen={isProductTourOpen}
        onClose={() => setIsProductTourOpen(false)}
        language={language}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
      />
    </div>
  );
};

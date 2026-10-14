import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { UserProfileView } from '../UserProfileView';
import { MyOrdersView } from '../MyOrdersView';
import { PwaInstallPrompt } from '../pwa/PwaInstallPrompt';
import { ResponsiveDeviceTester } from '../dev/ResponsiveDeviceTester';
import { useShop } from '../../context/ShopContext';

export const RootLayout: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const { 
    language, 
    customerName, 
    setCustomerName, 
    customerPhone, 
    setCustomerPhone, 
    customerEmail, 
    setCustomerEmail,
    isCustomerLoggedIn,
    loginCustomer,
    loginWithSocial,
    logoutCustomer,
    addresses,
    addAddress,
    deleteAddress,
    orders,
    showToast
  } = useShop();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#0052FF]/20 selection:text-[#0052FF] dark:selection:bg-[#0052FF]/30 dark:selection:text-blue-200 transition-colors duration-200">
      <Navbar 
        onOpenProfile={() => setIsProfileOpen(true)} 
        onOpenMyOrders={() => setIsOrdersOpen(true)}
      />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      <Footer />

      {/* Global User Profile Modal */}
      <UserProfileView
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        isLoggedIn={isCustomerLoggedIn}
        onLogin={(phone, name) => {
          loginCustomer(phone, name);
          setIsProfileOpen(false);
        }}
        onLoginWithSocial={async (provider) => {
          await loginWithSocial(provider);
          setIsProfileOpen(false);
        }}
        onLogout={logoutCustomer}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setPhone => setCustomerPhone(setPhone)}
        customerEmail={customerEmail}
        setCustomerEmail={setEmail => setCustomerEmail(setEmail)}
        addresses={addresses}
        onAddAddress={addAddress}
        onDeleteAddress={deleteAddress}
        onSetDefaultAddress={() => {}}
        paymentMethods={[]}
        onAddPaymentMethod={() => {}}
        onDeletePaymentMethod={() => {}}
        onSetDefaultPaymentMethod={() => {}}
        kasmaPoints={150}
        onAddPoints={() => {}}
        pointsLogs={[]}
        onRedeemReward={() => {}}
        onOpenMyOrders={() => {
          setIsProfileOpen(false);
          setIsOrdersOpen(true);
        }}
        orders={orders}
        showToast={showToast}
      />

      {/* Global Customer Orders & Warranty Certificate Modal */}
      <MyOrdersView
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        language={language}
        customerPhone={customerPhone}
        showToast={showToast}
      />

      {/* Mobile & Tablet Progressive Web App (PWA) Install Banner */}
      <PwaInstallPrompt language={language} />

      {/* Developer Real-Time Mobile Responsiveness Inspector (Dev Only) */}
      <ResponsiveDeviceTester />
    </div>
  );
};

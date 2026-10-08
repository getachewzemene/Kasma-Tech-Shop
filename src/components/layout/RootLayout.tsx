import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { UserProfileView } from '../UserProfileView';
import { useShop } from '../../context/ShopContext';

export const RootLayout: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
    logoutCustomer,
    addresses,
    addAddress,
    deleteAddress,
    orders,
    showToast
  } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-[#EFF1F5] dark:bg-[#08090B] text-gray-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="flex-1 w-full">
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
        orders={orders}
        showToast={showToast}
      />
    </div>
  );
};

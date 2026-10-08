import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import AdminDashboard from '../../components/AdminDashboard';
import { Lock, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { 
    products, 
    merchants, 
    orders, 
    auditLogs, 
    language, 
    approveProduct, 
    rejectProduct, 
    approveMerchantKyc, 
    toggleMerchantStatus, 
    approvePayout,
    updateOrderStatus,
    showToast 
  } = useShop();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kasma_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('kasma-admin');
  const [password, setPassword] = useState('kasma_admin123');
  const [authError, setAuthError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'kasma-admin' && password === 'kasma_admin123') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('kasma_admin_auth', 'true');
      showToast('Administrator session authenticated', 'success');
    } else {
      setAuthError('Invalid administrator credentials.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('kasma_admin_auth');
    showToast('Administrator logged out', 'info');
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-black dark:bg-zinc-800 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-gray-150 dark:border-zinc-700">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">
            {language === 'en' ? 'Administrator Authentication' : 'አስተዳዳሪ ማረጋገጫ'}
          </h1>
          <p className="text-xs text-gray-400">
            {language === 'en'
              ? 'Authorize access to CBE/Awash escrow wires, catalog listings, and merchant audits.'
              : 'የCBE/አዋሽ ማስተላለፍያዎች፣ ካታሎጎች እና የስርዓት መቆጣጠሪያዎች ፍቃድ ማረጋገጫ።'}
          </p>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-3 flex items-center justify-between text-xs gap-2">
          <div className="space-y-0.5">
            <div className="font-extrabold text-[#0052FF] dark:text-blue-400 text-[11px] uppercase tracking-wider">
              Default Credentials:
            </div>
            <div className="font-mono text-[11px] text-gray-700 dark:text-zinc-300">
              User: <span className="font-bold">kasma-admin</span> | Pass: <span className="font-bold">kasma_admin123</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsername('kasma-admin');
              setPassword('kasma_admin123');
              setAuthError('');
            }}
            className="px-3 py-1.5 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold rounded-xl shrink-0 cursor-pointer text-[11px] shadow-xs"
          >
            Auto-Fill
          </button>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Administrator Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setAuthError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-2 focus:ring-[#0052FF]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono outline-none focus:ring-2 focus:ring-[#0052FF]"
              required
            />
          </div>

          {authError && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Authorize Access</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AdminDashboard
        products={products}
        merchants={merchants}
        orders={orders}
        auditLogs={auditLogs}
        onApproveProduct={approveProduct}
        onRejectProduct={rejectProduct}
        onApproveMerchantKyc={approveMerchantKyc}
        onToggleMerchantStatus={toggleMerchantStatus}
        onApprovePayout={approvePayout}
        language={language}
        promoCodes={[]}
        onAddPromoCode={() => {}}
        onRemovePromoCode={() => {}}
        onUpdateOrderStatus={updateOrderStatus}
        onLogout={handleAdminLogout}
      />
    </div>
  );
};

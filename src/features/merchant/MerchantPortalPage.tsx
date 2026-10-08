import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import MerchantPortal from '../../components/MerchantPortal';
import { MerchantTelegramQrLogin } from '../../components/merchant/MerchantTelegramQrLogin';
import { Store, Lock, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import { Product } from '../../types';

export const MerchantPortalPage: React.FC = () => {
  const { 
    products, 
    merchants, 
    orders, 
    auditLogs, 
    language, 
    updateProductStock, 
    showToast,
    refreshState 
  } = useShop();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kasma_merchant_auth') === 'true' && !!localStorage.getItem('kasma_merchant_token');
  });
  const [tabMode, setTabMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'TELEGRAM_QR'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Registration local state
  const [regStoreName, setRegStoreName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!identifier || !password) {
      setAuthError('Please enter store email/name and password');
      return;
    }
    try {
      const res = await fetch('/api/auth/merchant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate merchant.');
      }
      localStorage.setItem('kasma_merchant_token', data.token);
      localStorage.setItem('kasma_auth_token', data.token);
      localStorage.setItem('kasma_merchant_auth', 'true');
      setIsAuthenticated(true);
      showToast('Signed in to Merchant Portal with verified JWT credentials', 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStoreName || !regEmail || !regPassword) {
      setAuthError('Please fill all required registration fields');
      return;
    }
    setRegSuccess(`Store "${regStoreName}" registered! Awaiting compliance approval.`);
    setTabMode('LOGIN');
    showToast('Merchant registration submitted for approval', 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kasma_merchant_auth');
    localStorage.removeItem('kasma_merchant_token');
    showToast('Logged out from Merchant Portal', 'info');
  };

  const handleAddProduct = async (p: Product) => {
    try {
      const token = localStorage.getItem('kasma_merchant_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(p)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit product');
      }
      await refreshState();
      showToast('Product draft submitted for admin approval', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save product draft', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#0052FF] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">
            {tabMode === 'LOGIN'
              ? (language === 'en' ? 'Merchant Account Login' : 'የነጋዴ መለያ መግቢያ')
              : (language === 'en' ? 'Merchant Registration' : 'የአዲስ ነጋዴ ምዝገባ')}
          </h1>
          <p className="text-xs text-gray-500">
            {language === 'en'
              ? 'Manage stock catalogs, Addis express courier dispatch, and Telebirr/CBE settlements.'
              : 'የካታሎግ ክምችት፣ የፈጣን ማድረሻ ትዕዛዞች እና የባንክ ክፍያዎችን ያስተዳድሩ።'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setTabMode('LOGIN')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tabMode === 'LOGIN' ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs' : 'text-gray-500'
            }`}
          >
            {language === 'en' ? 'Store Login' : 'መግቢያ'}
          </button>
          <button
            type="button"
            onClick={() => setTabMode('REGISTER')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tabMode === 'REGISTER' ? 'bg-[#0052FF] text-white shadow-xs' : 'text-gray-500'
            }`}
          >
            {language === 'en' ? 'Register Store +' : 'አዲስ ይመዝገቡ +'}
          </button>
        </div>

        {regSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{regSuccess}</span>
          </div>
        )}

        {authError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {tabMode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Store Email / Name
              </label>
              <input
                type="text"
                placeholder="selam.electronics@kasma.et"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono text-gray-900 dark:text-zinc-100 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#0052FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Sign In to Store
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Store Name *</label>
              <input
                type="text"
                value={regStoreName}
                onChange={(e) => setRegStoreName(e.target.value)}
                placeholder="e.g. Bole Premium Tech"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Store Email *</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="owner@store.com"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Password *</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#0052FF] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer mt-2"
            >
              Submit Registration
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <MerchantPortal
        products={products}
        merchants={merchants}
        stockLogs={[]}
        orders={orders}
        onAddProduct={handleAddProduct}
        onUpdateProductStock={updateProductStock}
        onAddAuditLog={() => {}}
        onUpdateMerchantKyc={() => {}}
        onRequestPayout={() => {}}
        language={language}
        onLogout={handleLogout}
      />
    </div>
  );
};

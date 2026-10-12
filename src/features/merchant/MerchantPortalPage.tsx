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
    const isMerch = localStorage.getItem('kasma_merchant_auth') === 'true' && !!localStorage.getItem('kasma_merchant_token');
    const isAdmin = localStorage.getItem('kasma_admin_auth') === 'true' && !!localStorage.getItem('kasma_admin_token');
    return isMerch || isAdmin;
  });
  const [tabMode, setTabMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'TELEGRAM_QR'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setAuthError(language === 'en' ? 'Please enter store email/name and password' : 'እባክዎ የሱቅ ኢሜይል/ስም እና የይለፍ ቃል ያስገቡ');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/merchant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (language === 'en' ? 'Failed to authenticate merchant.' : 'የነጋዴ ማረጋገጫ አልተሳካም።'));
      }
      localStorage.setItem('kasma_merchant_token', data.token);
      localStorage.setItem('kasma_auth_token', data.token);
      localStorage.setItem('kasma_merchant_auth', 'true');
      if (data.merchant?.id) {
        sessionStorage.setItem('kasma_merchant_id', data.merchant.id);
        localStorage.setItem('kasma_merchant_id', data.merchant.id);
      }
      setIsAuthenticated(true);
      await refreshState();
      showToast(
        language === 'en'
          ? `Welcome back, ${data.merchant?.storeName || 'Merchant'}!`
          : `እንኳን ደህና መጡ ${data.merchant?.storeName || 'ነጋዴ'}!`,
        'success'
      );
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!regStoreName || !regEmail || !regPassword) {
      setAuthError(language === 'en' ? 'Please fill all required registration fields' : 'እባክዎ ሁሉንም አስፈላጊ የመመዝገቢያ መስኮች ይሙሉ');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/merchant-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: regStoreName,
          ownerName: regOwnerName || regStoreName,
          email: regEmail,
          phone: regPhone,
          password: regPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (language === 'en' ? 'Failed to register merchant account.' : 'የነጋዴ ምዝገባ አልተሳካም።'));
      }

      // Successful registration: automatically log in and open merchant dashboard
      localStorage.setItem('kasma_merchant_token', data.token);
      localStorage.setItem('kasma_auth_token', data.token);
      localStorage.setItem('kasma_merchant_auth', 'true');
      if (data.merchant?.id) {
        sessionStorage.setItem('kasma_merchant_id', data.merchant.id);
        localStorage.setItem('kasma_merchant_id', data.merchant.id);
      }
      setIsAuthenticated(true);
      await refreshState();
      showToast(
        language === 'en'
          ? `Welcome to Kasma! Store "${regStoreName}" registered successfully.`
          : `እንኳን ወደ ካስማ በደህና መጡ! ሱቅዎ "${regStoreName}" በተሳካ ሁኔታ ተመዝግቧል።`,
        'success'
      );
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTelegramQrLoginSuccess = (merchant: any) => {
    const dummyToken = `kasma_tg_token_${merchant.id}_${Date.now()}`;
    localStorage.setItem('kasma_merchant_token', dummyToken);
    localStorage.setItem('kasma_auth_token', dummyToken);
    localStorage.setItem('kasma_merchant_auth', 'true');
    sessionStorage.setItem('kasma_merchant_id', merchant.id);
    localStorage.setItem('kasma_merchant_id', merchant.id);
    setIsAuthenticated(true);
    showToast(
      language === 'en'
        ? `Authenticated via Telegram as ${merchant.storeName}`
        : `በቴሌግራም በኩል እንደ ${merchant.storeName} ገብተዋል`,
      'success'
    );
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kasma_merchant_auth');
    localStorage.removeItem('kasma_merchant_token');
    localStorage.removeItem('kasma_merchant_id');
    sessionStorage.removeItem('kasma_merchant_id');
    showToast(language === 'en' ? 'Logged out from Merchant Portal' : 'ከነጋዴ መድረክ ወጥተዋል', 'info');
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
      <div className="max-w-md mx-auto my-12 px-4 sm:px-0">
        <div className="p-7 sm:p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#0052FF] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              {tabMode === 'LOGIN'
                ? (language === 'en' ? 'Merchant Portal Sign In' : 'የነጋዴ መለያ መግቢያ')
                : (language === 'en' ? 'Register New Merchant Store' : 'የአዲስ ነጋዴ ሱቅ ምዝገባ')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {language === 'en'
                ? 'Manage stock catalogs, Addis express courier dispatch, and Telebirr/CBE settlements.'
                : 'የካታሎግ ክምችት፣ የፈጣን ማድረሻ ትዕዛዞች እና የባንክ ክፍያዎችን ያስተዳድሩ።'}
            </p>
          </div>

          {/* Mode Toggle (Login vs Register) */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
            <button
              type="button"
              onClick={() => { setTabMode('LOGIN'); setAuthError(''); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tabMode === 'LOGIN' ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'en' ? 'Store Login' : 'መግቢያ'}
            </button>
            <button
              type="button"
              onClick={() => { setTabMode('REGISTER'); setAuthError(''); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tabMode === 'REGISTER' ? 'bg-[#0052FF] text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'en' ? 'Register Store +' : 'አዲስ ይመዝገቡ +'}
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 border border-rose-200 dark:border-rose-900/60">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {tabMode === 'LOGIN' ? (
            <div className="space-y-4">
              {/* Optional Login Method Switcher */}
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMethod(authMethod === 'PASSWORD' ? 'TELEGRAM_QR' : 'PASSWORD')}
                  className="text-[11px] font-bold text-[#0052FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {authMethod === 'PASSWORD' ? (
                    <>
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Or Sign in with Telegram QR' : 'በቴሌግራም QR ይግቡ'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Switch to Password Login' : 'በይለፍ ቃል ይግቡ'}</span>
                    </>
                  )}
                </button>
              </div>

              {authMethod === 'PASSWORD' ? (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                      {language === 'en' ? 'Store Email or Store Name' : 'የሱቅ ኢሜይል ወይም ስም'}
                    </label>
                    <input
                      type="text"
                      placeholder="abebe.gadgets@yahoo.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                      {language === 'en' ? 'Password' : 'የይለፍ ቃል'}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#0052FF] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>{language === 'en' ? 'Verifying Credentials...' : 'በማረጋገጥ ላይ...'}</span>
                    ) : (
                      <span>{language === 'en' ? 'Sign In to Store' : 'ወደ ሱቅ ይግቡ'}</span>
                    )}
                  </button>

                  {/* Demo Credentials Helper */}
                  <div className="pt-2 text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                    <p className="font-bold text-slate-700 dark:text-zinc-300">
                      {language === 'en' ? 'Demo Store Credentials:' : 'የሙከራ ሱቅ መለያዎች:'}
                    </p>
                    <p className="font-mono text-[10px]">Email: <span className="text-[#0052FF]">abebe.gadgets@yahoo.com</span></p>
                    <p className="font-mono text-[10px]">Pass: <span className="text-[#0052FF]">merchant123</span></p>
                  </div>
                </form>
              ) : (
                <MerchantTelegramQrLogin
                  merchants={merchants}
                  onSuccessLogin={handleTelegramQrLoginSuccess}
                  language={language}
                />
              )}
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'Store Name *' : 'የሱቅ ስም *'}
                </label>
                <input
                  type="text"
                  value={regStoreName}
                  onChange={(e) => setRegStoreName(e.target.value)}
                  placeholder="e.g. Bole Premium Tech"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'Owner / Manager Full Name' : 'የባለቤት ወይም ሥራ አስኪያጅ ሙሉ ስም'}
                </label>
                <input
                  type="text"
                  value={regOwnerName}
                  onChange={(e) => setRegOwnerName(e.target.value)}
                  placeholder="e.g. Dawit Bekele"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'Store Email *' : 'የሱቅ ኢሜይል *'}
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="owner@store.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'Phone Number' : 'ስልክ ቁጥር'}
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+251 91 122 3344"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'Create Password *' : 'የይለፍ ቃል ይፍጠሩ *'}
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#0052FF] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer mt-2 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <span>{language === 'en' ? 'Registering Store...' : 'በመመዝገብ ላይ...'}</span>
                ) : (
                  <span>{language === 'en' ? 'Register & Enter Merchant Portal' : 'ይመዝገቡ እና ወደ መድረክ ይግቡ'}</span>
                )}
              </button>
            </form>
          )}
        </div>
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
        onOrderUpdated={async () => { await refreshState(); }}
      />
    </div>
  );
};

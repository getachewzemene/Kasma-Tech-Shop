import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone,
  KeyRound,
  User,
  AlertCircle
} from 'lucide-react';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectPath?: string;
}

export const CheckoutAuthModal: React.FC<CheckoutAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    language, 
    loginCustomer, 
    loginWithSocial, 
    showToast,
    cartCount,
    cartSubtotal 
  } = useShop();

  const [activeTab, setActiveTab] = useState<'SMS_OTP' | 'PASSWORD' | 'REGISTER'>('SMS_OTP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phone SMS OTP State
  const [phoneInput, setPhoneInput] = useState('+251 9');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Password Login State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+251 9');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  if (!isOpen) return null;

  // 1. Social Logins: Google & Facebook
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithSocial('google', {
        name: 'Kasma Google Shopper',
        email: 'shopper@gmail.com',
        phone: '+251 91 188 9900'
      });
      if (result.success) {
        onSuccess?.();
        onClose();
      }
    } catch {
      showToast(language === 'en' ? 'Google Sign-In failed. Please try again.' : 'የጉግል መግቢያ አልተሳካም። እባክዎ እንደገና ይሞክሩ።', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithSocial('facebook', {
        name: 'Kasma Facebook Customer',
        email: 'shopper@facebook.com',
        phone: '+251 92 233 4455'
      });
      if (result.success) {
        onSuccess?.();
        onClose();
      }
    } catch {
      showToast(language === 'en' ? 'Facebook Sign-In failed. Please try again.' : 'የፌስቡክ መግቢያ አልተሳካም። እባክዎ እንደገና ይሞክሩ።', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Ethiopian Phone SMS OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phoneInput.trim().replace(/\s+/g, '');
    const isEthPhone = /^(\+2519|\+2517|09|07)\d{8}$/.test(cleanPhone);
    if (!isEthPhone) {
      showToast(
        language === 'en'
          ? 'Please enter a valid Ethiopian mobile number (09... or 07...).'
          : 'እባክዎን ትክክለኛ የኢትዮጵያ ስልክ ቁጥር (09... ወይም 07...) ያስገቡ።',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch SMS code');

      setOtpSent(true);
      setResendCountdown(60);
      if (data.devOtp) {
        setOtpInput(data.devOtp);
      }
      showToast(
        language === 'en'
          ? `SMS verification code dispatched to ${cleanPhone}${data.devOtp ? ` (Demo Code: ${data.devOtp})` : ''}`
          : `የማረጋገጫ ኮድ ወደ ${cleanPhone} በኤስኤምኤስ ተልኳል`,
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'SMS dispatch failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 4) {
      showToast(language === 'en' ? 'Please enter the 4-to-6 digit SMS code.' : 'እባክዎን የኤስኤምኤስ ኮዱን ያስገቡ።', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = phoneInput.trim().replace(/\s+/g, '');
      const res = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: otpInput.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Invalid or expired SMS code');

      loginCustomer(cleanPhone, data.user?.name || 'Verified Shopper');
      showToast(language === 'en' ? 'Phone verified! Proceeding to checkout.' : 'ስልክዎ ተረጋግጧል! ወደ ክፍያ በመቀጠል ላይ።', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Email & Password Sign In
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      showToast(language === 'en' ? 'Please enter your email or phone and password.' : 'እባክዎን ኢሜይል/ስልክ እና የምስጢር ቃል ያስገቡ።', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: emailInput.trim(),
          password: passwordInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Invalid login credentials');

      if (data.token) {
        localStorage.setItem('kasma_auth_token', data.token);
      }
      if (data.user) {
        loginCustomer(data.user.phone || emailInput.trim(), data.user.name, data.user.email);
      } else {
        loginCustomer(emailInput.trim(), 'Kasma Shopper', emailInput.trim());
      }

      showToast(language === 'en' ? 'Signed in successfully!' : 'በተሳካ ሁኔታ ገብተዋል!', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || (!regPhone.trim() && !regEmail.trim()) || regPassword.length < 6) {
      showToast(language === 'en' ? 'Please complete all required fields (password min. 6 chars).' : 'እባክዎን ሁሉንም አስፈላጊ መረጃዎች በትክክል ይሙሉ (የምስጢር ቃል ቢያንስ 6 ፊደላት)።', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim().replace(/\s+/g, ''),
          email: regEmail.trim().toLowerCase() || `${regPhone.replace(/\D/g, '')}@kasma.et`,
          password: regPassword.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');

      if (data.token) {
        localStorage.setItem('kasma_auth_token', data.token);
      }
      loginCustomer(regPhone.trim(), regName.trim(), regEmail.trim());
      showToast(language === 'en' ? 'Account created! Welcome to Kasma.' : 'መለያዎ ተፈጥሯል! እንኳን ወደ ካስማ በደህና መጡ።', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Header Banner with Cart Summary */}
        <div className="bg-gradient-to-r from-blue-600 via-[#0052FF] to-indigo-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Lock className="w-4 h-4 text-white" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
              {language === 'en' ? 'Secure Checkout Verification' : 'ደህንነቱ የተጠበቀ የክፍያ ማረጋገጫ'}
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            {language === 'en' ? 'Sign In to Complete Order' : 'ትዕዛዝዎን ለማጠናቀቅ እባክዎ ይግቡ'}
          </h2>

          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            {language === 'en'
              ? 'Sign in to access 1-click Addis courier dispatch, live SMS tracking, and digital warranty protection.'
              : 'የአዲስ አበባ ፈጣን ማጓጓዣ፣ የቀጥታ ክትትል እና የዲጂታል ዋስትና ለማግኘት ይግቡ።'}
          </p>

          {cartCount > 0 && (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-blue-50">
              <span>{cartCount} {language === 'en' ? 'items in cart' : 'እቃዎች በጋሪዎ ውስጥ'}</span>
              <span className="text-sm font-black text-white">{cartSubtotal.toLocaleString()} ETB</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Quick Demo Buyer Shortcut: Abebe Kebede (No-Click Barrier) */}
          <button
            type="button"
            id="demo-abebe-buyer-login"
            onClick={() => {
              loginCustomer('+251911223344', 'Abebe Kebede', 'abebe@gmail.com');
              showToast(
                language === 'en' ? 'Welcome Abebe! Fast-tracked to checkout.' : 'እንኳን ደህና መጡ አበበ! ወደ ክፍያ ገጽ በመሸጋገር ላይ።',
                'success'
              );
              onSuccess?.();
              onClose();
            }}
            className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-[#0052FF]/10 to-indigo-600/15 hover:from-blue-600/20 hover:to-indigo-600/25 border border-blue-500/30 text-gray-900 dark:text-zinc-100 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-[0.99] group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#0052FF] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </span>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs text-[#0052FF] dark:text-blue-400">
                    {language === 'en' ? '⚡ 1-Tap Fast Sign In as Abebe' : '⚡ በ1-ጠቅታ እንደ አበበ (ገዢ) ይግቡ'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                    Buyer
                  </span>
                </div>
                <span className="block text-[10px] text-gray-500 dark:text-zinc-400 font-medium">
                  Abebe Kebede • +251 91 122 3344 • abebe@gmail.com
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0052FF] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Social Sign In Options: Google & Facebook */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl border border-gray-250 dark:border-zinc-750 hover:border-gray-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              <GoogleIcon className="w-4.5 h-4.5 shrink-0" />
              <span>{language === 'en' ? 'Continue with Google' : 'በጉግል (Google) ቀጥል'}</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              <FacebookIcon className="w-4.5 h-4.5 shrink-0" />
              <span>{language === 'en' ? 'Continue with Facebook' : 'በፌስቡክ (Facebook) ቀጥል'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] font-black uppercase text-gray-400 tracking-wider absolute">
              {language === 'en' ? 'or use Ethiopian phone / email' : 'ወይም በስልክ / ኢሜይል'}
            </span>
          </div>

          {/* Tabs for Direct Sign-In Methods */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-zinc-800 p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('SMS_OTP')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'SMS_OTP'
                  ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Phone SMS' : 'በስልክ ኮድ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PASSWORD')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'PASSWORD'
                  ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Password' : 'የምስጢር ቃል'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REGISTER')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'REGISTER'
                  ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Sign Up' : 'ተመዝገብ'}</span>
            </button>
          </div>

          {/* Tab 1: Ethiopian Phone SMS OTP */}
          {activeTab === 'SMS_OTP' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      {language === 'en' ? 'Ethiopian Mobile Number (Ethio Telecom / Safaricom)' : 'የኢትዮጵያ ስልክ ቁጥር'}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-black text-gray-500 dark:text-zinc-400">
                        🇪🇹
                      </span>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+251 91 123 4567"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {language === 'en' 
                        ? 'We will send a 4-to-6 digit SMS OTP via AfroMessage to verify your order.' 
                        : 'ትዕዛዝዎን ለማረጋገጥ የማረጋገጫ ኮድ በኤስኤምኤስ ይላካል።'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>{language === 'en' ? 'Send SMS Verification Code' : 'የማረጋገጫ ኮድ ላክ'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-900 dark:text-blue-200">
                        {language === 'en' ? 'Code dispatched to:' : 'ኮድ የተላከበት:'}
                      </p>
                      <p className="font-mono text-xs text-blue-700 dark:text-blue-300 font-bold">{phoneInput}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] font-bold text-[#0052FF] hover:underline cursor-pointer"
                    >
                      {language === 'en' ? 'Change' : 'ቀይር'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      {language === 'en' ? 'Enter SMS Code' : 'የኤስኤምኤስ ኮዱን ያስገቡ'}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="123456"
                      autoFocus
                      className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'en' ? 'Verify & Continue to Checkout' : 'አረጋግጥ እና ወደ ክፍያ ቀጥል'}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      disabled={resendCountdown > 0 || isSubmitting}
                      onClick={() => handleSendOtp()}
                      className="text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200 disabled:opacity-40 cursor-pointer"
                    >
                      {resendCountdown > 0
                        ? `${language === 'en' ? 'Resend code in' : 'ኮድ በድጋሚ ለመላክ'} ${resendCountdown}s`
                        : (language === 'en' ? 'Didn\'t receive code? Resend SMS' : 'ኮዱ አልደረሰዎትም? በድጋሚ ይላኩ')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Email & Password Sign In */}
          {activeTab === 'PASSWORD' && (
            <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Email or Mobile Phone' : 'ኢሜይል ወይም ስልክ ቁጥር'}
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="customer@kasma.et or 0911234567"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Password' : 'የምስጢር ቃል'}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{language === 'en' ? 'Sign In & Continue to Checkout' : 'ይግቡ እና ወደ ክፍያ ቀጥል'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Tab 3: Sign Up / Register */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Full Name' : 'ሙሉ ስም'}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Mobile Phone' : 'ስልክ ቁጥር'}
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-mono font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Email (Optional)' : 'ኢሜይል (አስፈላጊ ከሆነ)'}
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="abebe@example.et"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Create Password (min. 6 characters)' : 'የምስጢር ቃል ይፍጠሩ'}
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{language === 'en' ? 'Create Account & Checkout' : 'መለያ ፍጠር እና ወደ ክፍያ ቀጥል'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Privacy & Trust Assurance */}
          <div className="pt-2 border-t border-gray-150 dark:border-zinc-800 text-[10px] text-gray-400 flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'en' ? '256-Bit SSL Encrypted' : 'ደህንነቱ የተጠበቀ'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              <span>Addis Ababa Fleet</span>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

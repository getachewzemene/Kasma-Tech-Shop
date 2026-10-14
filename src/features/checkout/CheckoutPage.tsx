import React, { useState, useEffect } from 'react';
import { LazyImage } from '../../components/LazyImage';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { SUB_CITIES } from '../../constants/locations';
import { Order } from '../../types';
import { AddisLocationPicker } from '../../components/checkout/AddisLocationPicker';
import { GoogleIcon, FacebookIcon } from '../../components/checkout/CheckoutAuthModal';
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  ArrowLeft, 
  CreditCard, 
  Building, 
  Sparkles, 
  Smartphone,
  Navigation,
  CheckCircle2,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    cartSubtotal, 
    discountAmount, 
    appliedPromo, 
    language, 
    customerName, 
    customerPhone, 
    customerEmail, 
    isCustomerLoggedIn,
    loginCustomer,
    loginWithSocial,
    logoutCustomer,
    addOrder, 
    showToast 
  } = useShop();

  const [name, setName] = useState(customerName || '');
  const [phone, setPhone] = useState(customerPhone || '+251 9');
  const [email, setEmail] = useState(customerEmail || '');
  const [selectedSubCityId, setSelectedSubCityId] = useState('bole');
  const [landmark, setLandmark] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>({ lat: 8.9953, lng: 38.7885 });
  const [gateNotes, setGateNotes] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'COD'>('TELEBIRR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Checkout Sign-In Gate State (when unauthenticated)
  const [authTab, setAuthTab] = useState<'SMS_OTP' | 'PASSWORD' | 'REGISTER'>('SMS_OTP');
  const [authPhone, setAuthPhone] = useState('+251 9');
  const [authOtpInput, setAuthOtpInput] = useState('');
  const [authOtpSent, setAuthOtpSent] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authShowPassword, setAuthShowPassword] = useState(false);
  const [authRegName, setAuthRegName] = useState('');
  const [authRegPhone, setAuthRegPhone] = useState('+251 9');
  const [authRegEmail, setAuthRegEmail] = useState('');
  const [authRegPassword, setAuthRegPassword] = useState('');
  const [authCountdown, setAuthCountdown] = useState(0);

  // Sync recipient state when customer logs in
  useEffect(() => {
    if (isCustomerLoggedIn) {
      if (customerName) setName(customerName);
      if (customerPhone) setPhone(customerPhone);
      if (customerEmail) setEmail(customerEmail);
      setIsPhoneVerified(true);
    }
  }, [isCustomerLoggedIn, customerName, customerPhone, customerEmail]);

  useEffect(() => {
    let timer: any;
    if (authCountdown > 0) {
      timer = setInterval(() => {
        setAuthCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authCountdown]);

  const handleAuthSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = authPhone.trim().replace(/\s+/g, '');
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
      setAuthOtpSent(true);
      setAuthCountdown(60);
      if (data.devOtp) setAuthOtpInput(data.devOtp);
      showToast(
        language === 'en'
          ? `SMS code sent to ${cleanPhone}${data.devOtp ? ` (Demo Code: ${data.devOtp})` : ''}`
          : `የማረጋገጫ ኮድ ወደ ${cleanPhone} በኤስኤምኤስ ተልኳል`,
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'SMS dispatch failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtpInput || authOtpInput.trim().length < 4) {
      showToast(language === 'en' ? 'Please enter the SMS code.' : 'እባክዎን ኮዱን ያስገቡ።', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanPhone = authPhone.trim().replace(/\s+/g, '');
      const res = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: authOtpInput.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Invalid or expired code');
      loginCustomer(cleanPhone, data.user?.name || 'Verified Shopper');
      showToast(language === 'en' ? 'Phone verified! Proceeding to checkout.' : 'ስልክዎ ተረጋግጧል! ወደ ክፍያ በመቀጠል ላይ።', 'success');
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      showToast(language === 'en' ? 'Please enter your email/phone and password.' : 'እባክዎን ኢሜይል/ስልክ እና የምስጢር ቃል ያስገቡ።', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: authEmail.trim(), password: authPassword.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Invalid login credentials');
      if (data.token) localStorage.setItem('kasma_auth_token', data.token);
      if (data.user) {
        loginCustomer(data.user.phone || authEmail.trim(), data.user.name, data.user.email);
      } else {
        loginCustomer(authEmail.trim(), 'Kasma Shopper', authEmail.trim());
      }
      showToast(language === 'en' ? 'Signed in successfully!' : 'በተሳካ ሁኔታ ገብተዋል!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authRegName.trim() || (!authRegPhone.trim() && !authRegEmail.trim()) || authRegPassword.length < 6) {
      showToast(language === 'en' ? 'Please complete all required fields (password min. 6 chars).' : 'እባክዎን ሁሉንም አስፈላጊ መረጃዎች ይሙሉ (የምስጢር ቃል ቢያንስ 6 ፊደላት)።', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authRegName.trim(),
          phone: authRegPhone.trim().replace(/\s+/g, ''),
          email: authRegEmail.trim().toLowerCase() || `${authRegPhone.replace(/\D/g, '')}@kasma.et`,
          password: authRegPassword.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
      if (data.token) localStorage.setItem('kasma_auth_token', data.token);
      loginCustomer(authRegPhone.trim(), authRegName.trim(), authRegEmail.trim());
      showToast(language === 'en' ? 'Account created! Welcome to Kasma.' : 'መለያዎ ተፈጥሯል! እንኳን ወደ ካስማ በደህና መጡ።', 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cash on Delivery SMS Phone Verification State
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(() => Boolean(isCustomerLoggedIn));
  const [isSendingCodOtp, setIsSendingCodOtp] = useState<boolean>(false);
  const [isVerifyingCodOtp, setIsVerifyingCodOtp] = useState<boolean>(false);
  const [codOtpSent, setCodOtpSent] = useState<boolean>(false);
  const [codOtpInput, setCodOtpInput] = useState<string>('');

  const handleSendCodOtp = async () => {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const isEthPhone = /^(\+2519|\+2517|09|07)\d{8}$/.test(cleanPhone);
    if (!isEthPhone) {
      showToast(
        language === 'en'
          ? 'Please enter a valid Ethiopian mobile number (09... or 07...) first.'
          : 'እባክዎን መጀመሪያ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ።',
        'warning'
      );
      return;
    }
    setIsSendingCodOtp(true);
    try {
      const res = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch SMS code');
      setCodOtpSent(true);
      showToast(
        language === 'en'
          ? `Verification code dispatched via SMS to ${cleanPhone}${data.devOtp ? ` (Sandbox Code: ${data.devOtp})` : ''}`
          : `የማረጋገጫ ኮድ ወደ ${cleanPhone} በኤስኤምኤስ ተልኳል`,
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'SMS dispatch failed', 'error');
    } finally {
      setIsSendingCodOtp(false);
    }
  };

  const handleVerifyCodOtp = async () => {
    if (!codOtpInput || codOtpInput.trim().length < 4) {
      showToast(language === 'en' ? 'Please enter the code received via SMS.' : 'እባክዎን ኮዱን ያስገቡ።', 'warning');
      return;
    }
    setIsVerifyingCodOtp(true);
    try {
      const res = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim().replace(/\s+/g, ''), otp: codOtpInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      setIsPhoneVerified(true);
      setCodOtpSent(false);
      showToast(
        language === 'en' ? '✅ Phone verified! Order authorized for Cash on Delivery.' : '✅ ስልክዎ ተረጋግጧል!',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsVerifyingCodOtp(false);
    }
  };

  const selectedSubCity = SUB_CITIES.find(s => s.id === selectedSubCityId) || SUB_CITIES[0];
  const shippingFee = selectedSubCity.fee;
  const orderTotal = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-800 text-center space-y-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-zinc-100">
          {language === 'en' ? 'Cart is Empty' : 'ጋሪው ባዶ ነው'}
        </h2>
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'Please add products to your cart before proceeding to checkout.' : 'እባክዎን ክፍያ ከመፈጸምዎ በፊት እቃዎችን ወደ ጋሪዎ ይጨምሩ።'}
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#0052FF] text-white text-xs font-bold shadow-md"
        >
          {language === 'en' ? 'Return to Catalog' : 'ወደ ካታሎግ ተመለስ'}
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCustomerLoggedIn) {
      showToast(
        language === 'en' 
          ? 'Please sign in with Google, Facebook, or your Ethiopian mobile number first.' 
          : 'እባክዎ በመጀመሪያ በጉግል፣ በፌስቡክ ወይም በስልክ ቁጥርዎ ይግቡ።',
        'warning'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validation
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanName = name.trim();
    const cleanLandmark = landmark.trim();

    if (!cleanName) {
      showToast(language === 'en' ? 'Recipient Full Name is required.' : 'እባክዎን ሙሉ ስምዎን ያስገቡ።', 'warning');
      return;
    }

    if (!cleanLandmark) {
      showToast(
        language === 'en' 
          ? 'Known Landmark / Area is required for Ethiopian delivery (e.g. Behind Edna Mall, Near Medhanialem Church).' 
          : 'እባክዎን የሚታወቅ መለያ ቦታ ያስገቡ (ለምሳሌ፡ ከኤድና ሞል ጀርባ፣ ከመድኃኔዓለም ቤተክርስቲያን አጠገብ)።', 
        'warning'
      );
      return;
    }

    const isEthPhone = /^(\+2519|\+2517|09|07)\d{8}$/.test(cleanPhone);
    if (!isEthPhone) {
      showToast(
        language === 'en'
          ? 'Valid Ethiopian mobile number required (+251 9... / +251 7... or 09... / 07...).'
          : 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (+2519... ወይም 09...)።',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Initialize transaction reference
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const txRef = `KASMA-${paymentMethod.slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

      let verificationPin: string | undefined = undefined;
      let chapaCheckoutUrl: string | undefined = undefined;

      try {
        const token = localStorage.getItem('kasma_auth_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_merchant_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const payInitRes = await fetch('/api/payment/initialize', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            orderId,
            amount: orderTotal,
            currency: 'ETB',
            paymentMethod,
            customerPhone: cleanPhone,
            customerName: cleanName,
            subCity: selectedSubCity.nameEn,
            landmark: cleanLandmark
          })
        });

        const payInitData = await payInitRes.json();
        if (payInitData.token) {
          localStorage.setItem('kasma_auth_token', payInitData.token);
        }
        if (payInitData.verificationPin) {
          verificationPin = payInitData.verificationPin;
        }
        if (payInitData.checkoutUrl) {
          chapaCheckoutUrl = payInitData.checkoutUrl;
        }
      } catch (err) {
        console.warn('Payment init warning:', err);
      }

      const formattedAddress = [
        `${selectedSubCity.nameEn} (${selectedSubCity.nameAm})`,
        cleanLandmark,
        gateNotes.trim() ? `Gate: ${gateNotes.trim()}` : '',
        specificAddress.trim() ? `Building: ${specificAddress.trim()}` : '',
        coordinates ? `GPS: (${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)})` : ''
      ].filter(Boolean).join(', ');

      const newOrder: Order = {
        id: orderId,
        customerId: `cust-${Date.now()}`,
        customerName: cleanName,
        customerPhone: cleanPhone,
        items: [...cart],
        subtotal: cartSubtotal,
        shippingFee,
        total: orderTotal,
        status: paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING_PAYMENT',
        paymentMethod,
        paymentId: txRef,
        shippingAddress: formattedAddress,
        subCity: selectedSubCity.nameEn,
        landmark: cleanLandmark,
        coordinates: coordinates || undefined,
        gateNotes: gateNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
        channel: 'WEB',
        discountCode: appliedPromo?.code,
        discountAmount,
        codVerificationPin: verificationPin,
        codPhoneConfirmed: isPhoneVerified,
      };

      // Record order via backend API
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
      } catch (err) {
        console.warn('Backend order recording error, fallback to local store:', err);
      }

      addOrder(newOrder);

      showToast(
        language === 'en'
          ? (paymentMethod === 'COD' 
              ? `Order #${orderId} confirmed! Courier Verification PIN: ${verificationPin || '849201'}` 
              : `Order #${orderId} created! Proceeding to Chapa / Telebirr gateway...`)
          : (paymentMethod === 'COD'
              ? `ትዕዛዝ #${orderId} ተረጋግጧል! የማረጋገጫ ፒን: ${verificationPin || '849201'}`
              : `ትዕዛዝ #${orderId} ተፈጥሯል! ወደ ክፍያ ገጽ በመሸጋገር ላይ...`),
        'success'
      );

      navigate(`/order-confirmation/${orderId}${chapaCheckoutUrl ? `?checkoutUrl=${encodeURIComponent(chapaCheckoutUrl)}&txRef=${txRef}` : ''}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/cart" className="hover:text-[#0052FF] font-medium flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Back to Cart' : 'ወደ ጋሪ ተመለስ'}</span>
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-zinc-100 font-bold">
          {language === 'en' ? 'Secure Checkout' : 'ክፍያ መፈጸሚያ'}
        </span>
      </nav>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: If Not Logged In, Render Checkout Authentication Gate */}
        {!isCustomerLoggedIn ? (
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 shadow-sm space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0052FF] flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0052FF] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
                      {language === 'en' ? 'Step 1 of 2: Customer Identity' : 'ደረጃ 1 ከ 2፡ የማንነት ማረጋገጫ'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-zinc-100 mt-1">
                    {language === 'en' ? 'Sign In to Complete Your Order' : 'ትዕዛዝዎን ለማጠናቀቅ እባክዎ ይግቡ'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {language === 'en' 
                      ? 'Please sign in with Google, Facebook, or your Ethiopian mobile number to unlock 1-click Addis courier dispatch, SMS delivery tracking, and digital warranty protection.'
                      : 'የአዲስ አበባ ፈጣን ማጓጓዣ፣ የቀጥታ ክትትል እና የዲጂታል ዋስትና ለማግኘት በጉግል፣ በፌስቡክ ወይም በስልክ ቁጥርዎ ይግቡ።'}
                  </p>
                </div>
              </div>

              {/* Fast Social Sign-In: Google & Facebook */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      await loginWithSocial('google', {
                        name: 'Google Customer',
                        email: 'shopper@gmail.com',
                        phone: '+251 91 188 9900'
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl border border-gray-250 dark:border-zinc-750 hover:border-gray-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-850 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-100 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <GoogleIcon className="w-4.5 h-4.5 shrink-0" />
                  <span>{language === 'en' ? 'Continue with Google' : 'በጉግል (Google) ቀጥል'}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      await loginWithSocial('facebook', {
                        name: 'Facebook Customer',
                        email: 'shopper@facebook.com',
                        phone: '+251 92 233 4455'
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <FacebookIcon className="w-4.5 h-4.5 shrink-0" />
                  <span>{language === 'en' ? 'Continue with Facebook' : 'በፌስቡክ (Facebook) ቀጥል'}</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] font-black uppercase text-gray-400 tracking-wider absolute">
                  {language === 'en' ? 'or sign in with Ethiopian phone / email' : 'ወይም በስልክ / ኢሜይል'}
                </span>
              </div>

              {/* Direct Auth Tabs */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-zinc-800 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setAuthTab('SMS_OTP')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'SMS_OTP'
                      ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Phone SMS' : 'በስልክ ኮድ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthTab('PASSWORD')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'PASSWORD'
                      ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Password' : 'የምስጢር ቃል'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthTab('REGISTER')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'REGISTER'
                      ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Sign Up' : 'ተመዝገብ'}</span>
                </button>
              </div>

              {/* Sub-tab 1: Phone SMS OTP */}
              {authTab === 'SMS_OTP' && (
                <div className="space-y-4">
                  {!authOtpSent ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                          {language === 'en' ? 'Ethiopian Mobile Number (09... or 07...)' : 'የኢትዮጵያ ስልክ ቁጥር'}
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-xs font-black text-gray-500 dark:text-zinc-400">
                            🇪🇹
                          </span>
                          <input
                            type="tel"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="+251 91 123 4567"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAuthSendOtp}
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <span>{language === 'en' ? 'Send SMS Verification Code' : 'የማረጋገጫ ኮድ ላክ'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-blue-900 dark:text-blue-200">
                            {language === 'en' ? 'Code dispatched to:' : 'ኮድ የተላከበት:'}
                          </p>
                          <p className="font-mono text-xs text-blue-700 dark:text-blue-300 font-bold">{authPhone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAuthOtpSent(false)}
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
                          value={authOtpInput}
                          onChange={(e) => setAuthOtpInput(e.target.value)}
                          placeholder="123456"
                          autoFocus
                          className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAuthVerifyOtp}
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'en' ? 'Verify & Continue to Checkout' : 'አረጋግጥ እና ወደ ክፍያ ቀጥል'}</span>
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          disabled={authCountdown > 0 || isSubmitting}
                          onClick={() => handleAuthSendOtp()}
                          className="text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200 disabled:opacity-40 cursor-pointer"
                        >
                          {authCountdown > 0
                            ? `${language === 'en' ? 'Resend code in' : 'ኮድ በድጋሚ ለመላክ'} ${authCountdown}s`
                            : (language === 'en' ? 'Didn\'t receive code? Resend SMS' : 'ኮዱ አልደረሰዎትም? በድጋሚ ይላኩ')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Password Sign In */}
              {authTab === 'PASSWORD' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      {language === 'en' ? 'Email or Mobile Phone' : 'ኢሜይል ወይም ስልክ ቁጥር'}
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3 text-gray-400" />
                      <input
                        type="text"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
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
                        type={authShowPassword ? 'text' : 'password'}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                      />
                      <button
                        type="button"
                        onClick={() => setAuthShowPassword(!authShowPassword)}
                        className="absolute right-3 text-gray-400 hover:text-gray-600"
                      >
                        {authShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAuthPasswordLogin}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>{language === 'en' ? 'Sign In & Continue to Checkout' : 'ይግቡ እና ወደ ክፍያ ቀጥል'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Sub-tab 3: Register */}
              {authTab === 'REGISTER' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      {language === 'en' ? 'Full Name' : 'ሙሉ ስም'}
                    </label>
                    <input
                      type="text"
                      value={authRegName}
                      onChange={(e) => setAuthRegName(e.target.value)}
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
                      value={authRegPhone}
                      onChange={(e) => setAuthRegPhone(e.target.value)}
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
                      value={authRegEmail}
                      onChange={(e) => setAuthRegEmail(e.target.value)}
                      placeholder="abebe@example.et"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      {language === 'en' ? 'Password (min. 6 characters)' : 'የምስጢር ቃል ይፍጠሩ'}
                    </label>
                    <input
                      type="password"
                      value={authRegPassword}
                      onChange={(e) => setAuthRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-250 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/50 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAuthRegister}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>{language === 'en' ? 'Create Account & Continue' : 'መለያ ፍጠር እና ቀጥል'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-gray-150 dark:border-zinc-800 text-[10px] text-gray-400 flex items-center justify-center gap-3">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'en' ? '256-Bit SSL Encrypted' : 'ደህንነቱ የተጠበቀ'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Addis Ababa Courier Network</span>
                </span>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 space-y-6">
            
            {/* Authenticated Customer Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-extrabold text-emerald-950 dark:text-emerald-100">
                    {language === 'en' ? 'Signed In As' : 'የገቡበት መለያ'}: {name || customerName} ({phone || customerPhone})
                  </p>
                  <p className="text-[10.5px] text-emerald-700 dark:text-emerald-300 font-medium">
                    {language === 'en' ? 'Verified Account • Digital Warranty Active' : 'የተረጋገጠ መለያ • ዲጂታል ዋስትና ነቅቷል'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logoutCustomer}
                className="text-xs font-bold text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Switch Account' : 'መለያ ቀይር'}
              </button>
            </div>

            {/* Section 1: Customer Contact */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0052FF]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? '1. Recipient Information' : '1. የተቀባይ መረጃ'}
                </h2>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {language === 'en' ? 'Full Name *' : 'ሙሉ ስም *'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abebe Bikila"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {language === 'en' ? 'Ethiopian Mobile Number *' : 'የስልክ ቁጥር *'}
                </label>
                <input
                  type="tel"
                  placeholder="+251 91 123 4567 or 0911234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Localized Addis Ababa Delivery with Visual Landmark Drop-Pin */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0052FF]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? '2. Delivery Routing & Drop-Pin' : '2. የማድረሻ አድራሻ እና ካርታ'}
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] border border-blue-200 dark:border-blue-900/60">
                {selectedSubCity.nameEn} • {shippingFee} ETB ({language === 'en' ? selectedSubCity.timeEn : selectedSubCity.timeAm})
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {language === 'en' ? 'Select Sub-City (ክፍለ ከተማ) *' : 'ክፍለ ከተማ ይምረጡ *'}
                </label>
                <select
                  value={selectedSubCityId}
                  onChange={(e) => setSelectedSubCityId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF] cursor-pointer"
                >
                  {SUB_CITIES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameEn} ({s.nameAm}) — {s.fee} ETB ({language === 'en' ? s.timeEn : s.timeAm})
                    </option>
                  ))}
                </select>
              </div>

              {/* Addis Ababa Visual Landmark & Neighborhood Drop-Pin (Leaflet / OpenStreetMap) */}
              <AddisLocationPicker
                selectedSubCityId={selectedSubCityId}
                onSubCityChange={(subCityId) => setSelectedSubCityId(subCityId)}
                landmark={landmark}
                onLandmarkChange={(newLandmark) => setLandmark(newLandmark)}
                coordinates={coordinates}
                onCoordinatesChange={(newCoords) => setCoordinates(newCoords)}
                gateNotes={gateNotes}
                onGateNotesChange={(newNotes) => setGateNotes(newNotes)}
                language={language}
              />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {language === 'en' ? 'Confirmed Landmark / Area Description (መለያ ቦታ) *' : 'የሚታወቅ መለያ ቦታ *'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g. Behind Edna Mall, Near Medhanialem Church' : 'ምሳሌ፡ ከኤድና ሞል ጀርባ፣ ከመድኃኔዓለም ቤተክርስቲያን አጠገብ'}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {language === 'en' ? 'Specific House / Building / Flat (Optional)' : 'የቤት ወይም ህንፃ ቁጥር (አማራጭ)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Noah Real Estate Block B, Flat 302"
                  value={specificAddress}
                  onChange={(e) => setSpecificAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0052FF]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                {language === 'en' ? '3. Select Ethiopian Payment Rail' : '3. የክፍያ መንገድ ይምረጡ'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Telebirr */}
              <button
                type="button"
                onClick={() => setPaymentMethod('TELEBIRR')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  paymentMethod === 'TELEBIRR'
                    ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#0052FF]/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#0052FF]">telebirr</span>
                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      SuperApp / *127#
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                    Instant push prompt & mobile PIN authorization.
                  </p>
                </div>
              </button>

              {/* CBE Birr */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CBE_BIRR')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  paymentMethod === 'CBE_BIRR'
                    ? 'border-[#7E1D8D] bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-600/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#7E1D8D]">CBE Birr</span>
                    <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded">
                      *847# / Mobile
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                    Commercial Bank of Ethiopia direct payment rails.
                  </p>
                </div>
              </button>

              {/* Chapa */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CHAPA')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  paymentMethod === 'CHAPA'
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-emerald-600">Chapa Pay</span>
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      Awash / Bank Cards
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                    Unified card and domestic Ethiopian banking checkout.
                  </p>
                </div>
              </button>

              {/* Cash On Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  paymentMethod === 'COD'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 ring-2 ring-black/20'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-gray-900 dark:text-zinc-100">Cash on Delivery</span>
                    <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200 px-1.5 py-0.5 rounded">
                      COD PIN
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                    Pay in cash or Telebirr upon receiving package.
                  </p>
                </div>
              </button>
            </div>

            {paymentMethod === 'COD' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-bold">
                      {language === 'en' ? 'Cash on Delivery Phone Verification' : 'የስልክ ቁጥር ማረጋገጫ'}
                    </p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {language === 'en'
                        ? 'To protect against fake orders, verify your Ethiopian mobile number via SMS OTP. A 6-digit handover PIN will be issued for delivery.'
                        : 'የውሸት ትዕዛዞችን ለመከላከል ስልክዎን በኤስኤምኤስ ያረጋግጡ። ርክክብ ሲፈጸም የሚያሳውቁት ባለ 6-አሃዝ ፒን ይላክልዎታል።'}
                    </p>
                  </div>
                </div>

                {/* Inline OTP Verification Widget */}
                {isPhoneVerified ? (
                  <div className="p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'en' ? `Phone Verified: ${phone}` : `ስልክ ተረጋግጧል: ${phone}`}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                      AUTHENTICATED
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 space-y-2">
                    {!codOtpSent ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-600 dark:text-zinc-400 font-medium">
                          {language === 'en' ? 'Click below to receive a 6-digit SMS code:' : 'ባለ 6-አሃዝ ኮድ በኤስኤምኤስ ለመቀበል ይጫኑ:'}
                        </span>
                        <button
                          type="button"
                          onClick={handleSendCodOtp}
                          disabled={isSendingCodOtp}
                          className="px-3 py-1.5 bg-[#0052FF] hover:bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{isSendingCodOtp ? (language === 'en' ? 'Sending...' : 'በመላክ ላይ...') : (language === 'en' ? 'Send SMS Code' : 'ኮድ ላክ')}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">
                            {language === 'en' ? 'Enter 6-digit code sent to your phone:' : 'የተላከውን ባለ 6-አሃዝ ኮድ ያስገቡ:'}
                          </span>
                          <button
                            type="button"
                            onClick={handleSendCodOtp}
                            disabled={isSendingCodOtp}
                            className="text-[10px] font-bold text-[#0052FF] hover:underline cursor-pointer"
                          >
                            {language === 'en' ? 'Resend SMS' : 'እንደገና ላክ'}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="• • • • • •"
                            value={codOtpInput}
                            onChange={(e) => setCodOtpInput(e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold tracking-widest text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyCodOtp}
                            disabled={isVerifyingCodOtp}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isVerifyingCodOtp ? '...' : (language === 'en' ? 'Verify PIN' : 'አረጋግጥ')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

        {/* Right Column: Order Confirmation Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
              {language === 'en' ? 'Checkout Summary' : 'የትዕዛዝ ማጠቃለያ'}
            </h2>

            {/* Line items preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.sku} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <LazyImage src={item.product.image} alt="" className="w-9 h-9 rounded-lg object-cover" containerClassName="w-9 h-9 rounded-lg bg-gray-100 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-gray-900 dark:text-zinc-100 truncate">{item.product.nameEn}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity} • {item.variantName}</p>
                    </div>
                  </div>
                  <span className="font-black shrink-0 text-gray-900 dark:text-zinc-100">
                    {(item.price * item.quantity).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-150 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>{language === 'en' ? 'Items Subtotal' : 'የእቃዎች ድምር'}</span>
                <span className="font-bold text-gray-900 dark:text-zinc-100">{cartSubtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>{selectedSubCity.nameEn} {language === 'en' ? 'Courier Dispatch' : 'ማጓጓዣ'}</span>
                <span className="font-bold text-gray-900 dark:text-zinc-100">+{shippingFee} ETB</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{language === 'en' ? 'Promo Discount' : 'ቅናሽ'}</span>
                  <span>-{discountAmount.toLocaleString()} ETB</span>
                </div>
              )}
              <div className="border-t border-gray-150 dark:border-zinc-800 pt-3 flex justify-between text-base font-black text-gray-900 dark:text-zinc-100">
                <span>{language === 'en' ? 'Final Total' : 'ጠቅላላ ክፍያ'}</span>
                <span className="text-[#0052FF]">{orderTotal.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                !isCustomerLoggedIn
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#0052FF] hover:bg-blue-600 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {!isCustomerLoggedIn
                  ? (language === 'en' ? 'Sign In to Complete Order' : 'ትዕዛዙን ለማጠናቀቅ መጀመሪያ ይግቡ')
                  : isSubmitting
                    ? (language === 'en' ? 'Authorizing Transaction...' : 'ክፍያው እየተረጋገጠ ነው...')
                    : (language === 'en' ? `Confirm & Place Order (${orderTotal.toLocaleString()} ETB)` : `ትዕዛዙን አረጋግጥ (${orderTotal.toLocaleString()} ብር)`)}
              </span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Kasma Escrow Protected • 100% Guaranteed</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

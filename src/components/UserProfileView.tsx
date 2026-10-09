import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Gift, 
  X, 
  Phone, 
  Mail, 
  Trophy, 
  Clock, 
  Key, 
  Zap, 
  RefreshCw, 
  Tag, 
  LogOut, 
  Send, 
  CheckCircle, 
  Truck, 
  Package, 
  ShoppingBag, 
  ArrowLeft,
  ChevronRight,
  Shield,
  Smartphone,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  KeyRound,
  Globe,
  Building,
  Check,
  HelpCircle,
  Info
} from 'lucide-react';
import { 
  DeliveryAddress, 
  SavedPaymentMethod, 
  KasmaPointsReward, 
  KasmaPointsLog, 
  Order 
} from '../types';
import { TelegramIntegrationModule } from './TelegramIntegrationModule';
import { OrderTrackingVisualizer } from './OrderTrackingVisualizer';

export interface UserProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
  isLoggedIn: boolean;
  onLogin: (phone: string, name?: string) => void;
  onLogout: () => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail?: string;
  setCustomerEmail?: (email: string) => void;
  addresses: DeliveryAddress[];
  onAddAddress: (addr: Omit<DeliveryAddress, 'id'>) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  paymentMethods: SavedPaymentMethod[];
  onAddPaymentMethod: (pm: Omit<SavedPaymentMethod, 'id'>) => void;
  onDeletePaymentMethod: (id: string) => void;
  onSetDefaultPaymentMethod: (id: string) => void;
  kasmaPoints: number;
  onAddPoints: (amount: number, reasonEn: string, reasonAm: string, type?: 'EARNED' | 'REDEEMED' | 'BONUS') => void;
  pointsLogs: KasmaPointsLog[];
  onRedeemReward: (reward: KasmaPointsReward) => void;
  onOpenMyOrders?: () => void;
  onOpenTrackShipment?: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  orders?: Order[];
  initialAuthMode?: 'SIGN_IN' | 'REGISTER';
}

const SUB_CITIES = [
  { id: 'bole', nameEn: 'Bole', nameAm: 'ቦሌ' },
  { id: 'yeka', nameEn: 'Yeka', nameAm: 'የካ' },
  { id: 'kirkos', nameEn: 'Kirkos', nameAm: 'ኪርቆስ' },
  { id: 'arada', nameEn: 'Arada', nameAm: 'አራዳ' },
  { id: 'lemi_kura', nameEn: 'Lemi Kura', nameAm: 'ለሚ ኩራ' },
  { id: 'nifas_silk', nameEn: 'Nifas Silk-Lafto', nameAm: 'ነፋስ ስልክ ላፍቶ' },
  { id: 'kolfe', nameEn: 'Kolfe Keranio', nameAm: 'ኮልፌ ቀራኒዮ' },
  { id: 'gullele', nameEn: 'Gullele', nameAm: 'ጉለሌ' },
  { id: 'addis_ketema', nameEn: 'Addis Ketema', nameAm: 'አዲስ ከተማ' },
  { id: 'akaki_kality', nameEn: 'Akaki Kality', nameAm: 'አቃቂ ቃሊቲ' },
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  isOpen,
  onClose,
  language,
  isLoggedIn,
  onLogin,
  onLogout,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail = 'customer@kasma.et',
  setCustomerEmail,
  addresses,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  paymentMethods,
  onAddPaymentMethod,
  onDeletePaymentMethod,
  onSetDefaultPaymentMethod,
  kasmaPoints,
  onAddPoints,
  pointsLogs,
  onRedeemReward,
  onOpenMyOrders,
  onOpenTrackShipment,
  showToast,
  orders,
  initialAuthMode = 'SIGN_IN'
}) => {
  const [activeTab, setActiveTab] = useState<'TRACKING' | 'POINTS' | 'ADDRESSES' | 'PAYMENTS' | 'PROFILE' | 'TELEGRAM'>('TRACKING');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Sample fallback demo order for tracking visualization if customer has no active orders
  const sampleDemoOrder: Order = useMemo(() => ({
    id: 'ORD-8842-ETB',
    customerId: 'cust-demo',
    customerName: customerName || 'Abebe Bikila',
    customerPhone: customerPhone || '+251911223344',
    items: [
      {
        product: {
          id: 'prod-demo-1',
          nameEn: 'Anker Prime 20,000mAh Power Bank (100W)',
          nameAm: 'አንከር ፕራይም 20,000mAh ፓወር ባንክ (100 ዋት)',
          descriptionEn: 'High-speed fast charging power bank',
          descriptionAm: 'ፈጣን ኃይል መሙያ ፓወር ባንክ',
          price: 5400,
          category: 'mobiles',
          brand: 'Anker',
          image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80',
          variants: [],
          status: 'APPROVED',
          lowStockThreshold: 3,
          merchantId: 'm-1',
          merchantName: 'Kasma Flagship Store'
        },
        sku: 'ANK-PWR-20K',
        variantName: 'Black 100W',
        quantity: 1,
        price: 5400
      }
    ],
    subtotal: 5400,
    shippingFee: 150,
    total: 5550,
    status: 'PROCESSING', // Packed stage
    paymentMethod: 'TELEBIRR',
    paymentId: 'TLB-9988231',
    shippingAddress: 'Bole Sub City, Woreda 03, House #12, Addis Ababa',
    createdAt: new Date().toISOString(),
    channel: 'WEB'
  }), [customerName, customerPhone]);

  // Combine real user orders or fallback demo order
  const displayOrders = useMemo(() => {
    if (orders && orders.length > 0) return orders;
    return [sampleDemoOrder];
  }, [orders, sampleDemoOrder]);

  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      const found = displayOrders.find(o => o.id === selectedOrderId);
      if (found) return found;
    }
    return displayOrders[0];
  }, [selectedOrderId, displayOrders]);

  // Auth Mode State: SIGN_IN vs REGISTER vs FORGOT_PASSWORD
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'REGISTER' | 'FORGOT_PASSWORD'>(initialAuthMode || 'SIGN_IN');

  useEffect(() => {
    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
    }
  }, [initialAuthMode, isOpen]);

  // Login Form Local State (Username / Email / Phone + Password)
  const [loginIdentifierInput, setLoginIdentifierInput] = useState(customerPhone || customerEmail || '');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Phone SMS OTP Sign In State
  const [signInMethod, setSignInMethod] = useState<'SMS_OTP' | 'PASSWORD'>('SMS_OTP');
  const [otpPhoneInput, setOtpPhoneInput] = useState(customerPhone || '+251 91 122 3344');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');

  // International Country Codes
  const COUNTRY_CODES = useMemo(() => [
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
    { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+971', country: 'UAE / Dubai', flag: '🇦🇪' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
  ], []);

  const [selectedCountryCode, setSelectedCountryCode] = useState('+251');
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-gray-200 dark:bg-zinc-700' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  // Forgot Password / Recovery Local State
  const [recoveryMethod, setRecoveryMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [recoveryTargetInput, setRecoveryTargetInput] = useState('');
  const [recoveryOtpSent, setRecoveryOtpSent] = useState(false);
  const [recoveryOtpCode, setRecoveryOtpCode] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Registration Form Local State
  const [regNameInput, setRegNameInput] = useState('');
  const [regPhoneInput, setRegPhoneInput] = useState('');
  const [regEmailInput, setRegEmailInput] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');
  const [regSubCityInput, setRegSubCityInput] = useState('Bole');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addrLabel, setAddrLabel] = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');
  const [addrFullName, setAddrFullName] = useState(customerName || '');
  const [addrPhone, setAddrPhone] = useState(customerPhone || '');
  const [addrSubCity, setAddrSubCity] = useState('Bole');
  const [addrWoreda, setAddrWoreda] = useState('Woreda 03');
  const [addrStreet, setAddrStreet] = useState('');

  // Payment Method Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pmType, setPmType] = useState<'TELEBIRR' | 'CHAPA' | 'BANK_CARD' | 'CBE_BIRR'>('TELEBIRR');
  const [pmTitle, setPmTitle] = useState('My Telebirr Mobile Wallet');
  const [pmAccountInput, setPmAccountInput] = useState('');
  const [pmCardExpiry, setPmCardExpiry] = useState('12/28');
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Daily Check-In State
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Reward Catalog
  const REWARDS: KasmaPointsReward[] = useMemo(() => [
    {
      id: 'rw-1',
      titleEn: '50 ETB Flat Voucher',
      titleAm: 'የ 50 ብር ቅናሽ ኩፖን',
      pointsCost: 500,
      discountValue: 50,
      type: 'FLAT_DISCOUNT',
      code: 'KASMA50PTS'
    },
    {
      id: 'rw-2',
      titleEn: '120 ETB Super Voucher',
      titleAm: 'የ 120 ብር ትልቅ ቅናሽ',
      pointsCost: 1000,
      discountValue: 120,
      type: 'FLAT_DISCOUNT',
      code: 'KASMA120PTS'
    },
    {
      id: 'rw-3',
      titleEn: 'FREE Express Delivery',
      titleAm: 'ነፃ የፈጣን ማጓጓዣ ኩፖን',
      pointsCost: 800,
      discountValue: 150,
      type: 'FREE_SHIPPING',
      code: 'FREESHIPPTS'
    },
    {
      id: 'rw-4',
      titleEn: '250 ETB VIP Privilege Pass',
      titleAm: 'የ 250 ብር የቪ.አይ.ፒ ቅናሽ',
      pointsCost: 2000,
      discountValue: 250,
      type: 'FLAT_DISCOUNT',
      code: 'KASMA250VIP'
    }
  ], []);

  // Calculate Tier Progress
  const tierInfo = useMemo(() => {
    if (kasmaPoints >= 3000) {
      return {
        currentTier: 'PLATINUM',
        nameEn: 'Platinum VIP Member',
        nameAm: 'ፕላቲነም ቪ.አይ.ፒ አባል',
        badgeColor: 'bg-zinc-900 text-amber-300 border-amber-500/40',
        perksEn: 'Free priority shipping on all orders • 10% Kasma Points cashback • Dedicated support',
        perksAm: 'ነፃ ፈጣን ማጓጓዣ • 10% ነጥብ ተመላሽ • ልዩ ድጋፍ',
        progressPct: 100,
        nextTierPts: 0,
        nextTierNameEn: 'Maximum Tier Achieved',
        nextTierNameAm: 'ከፍተኛው ደረጃ ደርሰዋል',
        nextTierPerksEn: 'You enjoy maximum privileges across Kasma Shop!',
        nextTierPerksAm: 'በሁሉም ግዢዎች ላይ ከፍተኛ ጥቅሞችን ያገኛሉ!',
        spendNeededETB: 0
      };
    } else if (kasmaPoints >= 1200) {
      const nextPts = 3000 - kasmaPoints;
      return {
        currentTier: 'GOLD',
        nameEn: 'Gold VIP Member',
        nameAm: 'ወርቅ ቪ.አይ.ፒ አባል',
        badgeColor: 'bg-amber-500 text-slate-950 border-amber-300',
        perksEn: 'Free shipping over 2,000 ETB • 5% Kasma Points cashback • Early flash sales',
        perksAm: 'ነፃ ማጓጓዣ ከ2000 ብር በላይ • 5% ነጥብ ተመላሽ • ቀደምት ቅናሾች',
        progressPct: Math.min(100, Math.round(((kasmaPoints - 1200) / 1800) * 100)),
        nextTierPts: nextPts,
        nextTierNameEn: 'Platinum VIP Member',
        nextTierNameAm: 'ፕላቲነም ቪ.አይ.ፒ አባል',
        nextTierPerksEn: '10% Cashback on all orders • Free Express Shipping on ALL orders • 24/7 Priority Support',
        nextTierPerksAm: '10% ነጥብ ተመላሽ • ነፃ የፈጣን ማጓጓዣ በሁሉም ትዕዛዞች • የ24/7 የቅድሚያ ድጋፍ',
        spendNeededETB: nextPts * 10
      };
    } else if (kasmaPoints >= 500) {
      const nextPts = 1200 - kasmaPoints;
      return {
        currentTier: 'SILVER',
        nameEn: 'Silver Club Member',
        nameAm: 'ብር ክለብ አባል',
        badgeColor: 'bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 border-slate-300',
        perksEn: '3% Kasma Points cashback • Standard order tracking priority',
        perksAm: '3% ነጥብ ተመላሽ • ቅድሚያ የሚሰጠው ትዕዛዝ',
        progressPct: Math.min(100, Math.round(((kasmaPoints - 500) / 700) * 100)),
        nextTierPts: nextPts,
        nextTierNameEn: 'Gold VIP Member',
        nextTierNameAm: 'ወርቅ ቪ.አይ.ፒ አባል',
        nextTierPerksEn: '5% Cashback on orders • Free Shipping on orders over 2,000 ETB • VIP Flash Sale Invites',
        nextTierPerksAm: '5% ነጥብ ተመላሽ • ነፃ ማጓጓዣ ከ2000 ብር በላይ • የቪ.አይ.ፒ ቅናሽ ግብዣዎች',
        spendNeededETB: nextPts * 10
      };
    } else {
      const nextPts = 500 - kasmaPoints;
      return {
        currentTier: 'BRONZE',
        nameEn: 'Bronze Starter Member',
        nameAm: 'ብሮንዝ መነሻ አባል',
        badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300',
        perksEn: 'Earn 1 Kasma Point for every 10 ETB spent',
        perksAm: 'በየ 10 ብር ግዢ 1 የካስማ ነጥብ ያግኙ',
        progressPct: Math.min(100, Math.round((kasmaPoints / 500) * 100)),
        nextTierPts: nextPts,
        nextTierNameEn: 'Silver Club Member',
        nextTierNameAm: 'ብር ክለብ አባል',
        nextTierPerksEn: '3% Cashback on all purchases • Standard order tracking priority • Special Birthday Vouchers',
        nextTierPerksAm: '3% ነጥብ ተመላሽ • ቅድሚያ የሚሰጠው ትዕዛዝ • የልደት ቀን ልዩ ኩፖኖች',
        spendNeededETB: nextPts * 10
      };
    }
  }, [kasmaPoints]);

  // Calculate Points Earned from Previous Purchases
  const purchasePointsInfo = useMemo(() => {
    const validOrders = orders && orders.length > 0 
      ? orders.filter(o => o.status !== 'CANCELLED') 
      : [];

    const breakdown = validOrders.map(o => {
      const totalAmount = o.total || 0;
      const points = Math.round(totalAmount / 10);
      return {
        id: o.id,
        date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: totalAmount,
        pointsEarned: points,
        status: o.status || 'PAID',
        itemCount: o.items ? o.items.length : 1
      };
    });

    const totalSpentETB = breakdown.reduce((sum, b) => sum + b.total, 0);
    const totalPointsFromPurchases = breakdown.reduce((sum, b) => sum + b.pointsEarned, 0);

    return {
      breakdown,
      totalSpentETB,
      totalPointsFromPurchases
    };
  }, [orders]);

  if (!isOpen) return null;

  const handleSendSmsOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpPhoneInput.trim()) {
      showToast(language === 'en' ? 'Please enter your Ethiopian mobile phone number' : 'እባክዎን የስልክ ቁጥርዎን ያስገቡ', 'warning');
      return;
    }
    setIsSendingOtp(true);
    setOtpNotice('');
    try {
      const res = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhoneInput.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch SMS verification code');
      }
      setIsOtpSent(true);
      setResendCountdown(60);
      if (data.devOtp) {
        setOtpCodeInput(data.devOtp);
      }
      setOtpNotice(language === 'en' 
        ? `Verification code dispatched to ${data.phone || otpPhoneInput} via AfroMessage/Ethio Telecom.` 
        : `የማረጋገጫ ኮድ ወደ ${data.phone || otpPhoneInput} ተልኳል።`);
      showToast(
        language === 'en' ? 'SMS verification code sent!' : 'የማረጋገጫ ኮድ በኤስኤምኤስ ተልኳል!',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error sending SMS', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeInput.trim()) {
      showToast(language === 'en' ? 'Please enter the 6-digit verification code' : 'እባክዎን 6-አሃዝ የማረጋገጫ ኮዱን ያስገቡ', 'warning');
      return;
    }
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: otpPhoneInput.trim(), 
          otp: otpCodeInput.trim(),
          name: customerName 
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code');
      }
      if (data.token) {
        localStorage.setItem('kasma_auth_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('kasma_auth_user', JSON.stringify(data.user));
        if (data.user.name) setCustomerName(data.user.name);
        if (data.user.phone) setCustomerPhone(data.user.phone);
        if (setCustomerEmail && data.user.email) setCustomerEmail(data.user.email);
      }
      onLogin(data.user?.phone || otpPhoneInput.trim(), data.user?.name || customerName);
      showToast(
        language === 'en' ? 'Verified phone successfully! Signed in to Kasma.' : 'ስልክዎ ተረጋግጧል! ወደ ካስማ ገብተዋል።',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'OTP verification failed', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifierInput.trim() || !loginPasswordInput.trim()) {
      showToast(
        language === 'en' 
          ? 'Please enter your username, email, or phone and password' 
          : 'እባክዎን የተጠቃሚ ስም/ኢሜይል/ስልክ እና የምስጢር ቃል ያስገቡ', 
        'warning'
      );
      return;
    }

    setIsAuthenticating(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifierInput.trim(),
          password: loginPasswordInput.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Persist auth token and user
      if (data.token) {
        localStorage.setItem('kasma_auth_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('kasma_auth_user', JSON.stringify(data.user));
        if (data.user.name) setCustomerName(data.user.name);
        if (data.user.phone) setCustomerPhone(data.user.phone);
        if (setCustomerEmail && data.user.email) setCustomerEmail(data.user.email);
      }

      const displayName = data.user?.name || customerName || loginIdentifierInput.trim();
      const displayPhone = data.user?.phone || customerPhone || loginIdentifierInput.trim();

      onLogin(displayPhone, displayName);

      showToast(
        language === 'en' 
          ? `Welcome back, ${displayName}! Signed in successfully.` 
          : `እንኳን ደህና መጡ ${displayName}! በተሳካ ሁኔታ ገብተዋል።`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSendRecoveryCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = recoveryTargetInput.trim() || loginIdentifierInput.trim();
    if (!target) {
      showToast(
        language === 'en'
          ? `Please enter your ${recoveryMethod === 'PHONE' ? 'mobile phone number' : 'email address'}`
          : `እባክዎን ${recoveryMethod === 'PHONE' ? 'የስልክ ቁጥርዎን' : 'የኢሜይል አድራሻዎን'} ያስገቡ`,
        'warning'
      );
      return;
    }

    setRecoveryTargetInput(target);
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setRecoveryOtpSent(true);
      setRecoveryOtpCode('8842');
      setResendCountdown(60);
      showToast(
        language === 'en'
          ? `Recovery verification code sent to ${target}! Code: 8842`
          : `የማገገሚያ ኮድ ወደ ${target} ተልኳል! ኮድ: 8842`,
        'info'
      );
    }, 600);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryOtpCode || recoveryOtpCode !== '8842') {
      showToast(
        language === 'en' ? 'Invalid security code. Please use: 8842' : 'የተሳሳተ የማረጋገጫ ኮድ። ይምረጡ: 8842',
        'warning'
      );
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 4) {
      showToast(
        language === 'en' ? 'Password must be at least 4 characters long' : 'የምስጢር ቃል ቢያንስ 4 ፊደላት መሆን አለበት',
        'warning'
      );
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      showToast(
        language === 'en' ? 'Passwords do not match!' : 'የምስጢር ቃላቶቹ አይመሳሰሉም!',
        'warning'
      );
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      const userIdent = recoveryTargetInput || customerName || 'User';
      onLogin(customerPhone || '+251911223344', userIdent);
      
      setRecoveryOtpSent(false);
      setAuthMode('SIGN_IN');

      showToast(
        language === 'en'
          ? '🎉 Password reset successfully! Logged in with new credentials.'
          : '🎉 የምስጢር ቃልዎ በተሳካ ሁኔታ ተቀይሯል! አሁን ገብተዋል።',
        'success'
      );
    }, 700);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNameInput.trim() || !regPhoneInput.trim()) {
      showToast(language === 'en' ? 'Please fill in name and phone number' : 'እባክዎን ስም እና ስልክ ቁጥር ያስገቡ', 'warning');
      return;
    }
    if (!regPasswordInput || regPasswordInput.length < 6) {
      showToast(
        language === 'en' ? 'Password must be at least 6 characters long' : 'የምስጢር ቃል ቢያንስ 6 ፊደላት መሆን አለበት',
        'warning'
      );
      return;
    }

    setIsAuthenticating(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regNameInput.trim(),
          phone: regPhoneInput.trim(),
          email: regEmailInput.trim() || undefined,
          password: regPasswordInput.trim(),
          role: 'customer',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.token) {
        localStorage.setItem('kasma_auth_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('kasma_auth_user', JSON.stringify(data.user));
        if (data.user.name) setCustomerName(data.user.name);
        if (data.user.phone) setCustomerPhone(data.user.phone);
        if (setCustomerEmail && data.user.email) setCustomerEmail(data.user.email);
      }

      onLogin(regPhoneInput.trim(), regNameInput.trim());
      onAddPoints(200, 'Welcome Account Registration Bonus (+200 PTS)', 'የመለያ ምዝገባ የጉርሻ ነጥብ (+200 ነጥብ)', 'BONUS');

      if (addresses.length === 0) {
        onAddAddress({
          label: 'HOME',
          fullName: regNameInput,
          phone: regPhoneInput,
          subCity: regSubCityInput,
          woreda: 'Woreda 01',
          streetAddress: `${regSubCityInput} Main Road`,
          isDefault: true
        });
      }

      showToast(
        language === 'en' 
          ? `Account created successfully! Welcome ${regNameInput}! 🎉 +200 Welcome Points added.` 
          : `መለያዎ በተሳካ ሁኔታ ተፈጥሯል! እንኳን ደህና መጡ ${regNameInput}! 🎉 +200 ነጥብ ተሰጥቶዎታል።`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSelectDemoUser = async (name: string, phone: string) => {
    setIsAuthenticating(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: phone,
          password: 'demo_password',
        }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('kasma_auth_token', data.token);
        if (data.user) {
          localStorage.setItem('kasma_auth_user', JSON.stringify(data.user));
        }
      }
    } catch {}

    setCustomerName(name);
    setCustomerPhone(phone);
    onLogin(phone, name);
    setIsAuthenticating(false);
    showToast(
      language === 'en' 
        ? `Signed in as ${name}` 
        : `እንደ ${name} በተሳካ ሁኔታ ገብተዋል`,
      'success'
    );
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName || !addrPhone || !addrStreet) {
      showToast(language === 'en' ? 'Please fill in address details' : 'እባክዎን አድራሻውን ይሙሉ', 'warning');
      return;
    }
    onAddAddress({
      label: addrLabel,
      fullName: addrFullName,
      phone: addrPhone,
      subCity: addrSubCity,
      woreda: addrWoreda,
      streetAddress: addrStreet,
      isDefault: addresses.length === 0
    });
    setIsAddressModalOpen(false);
    showToast(
      language === 'en' ? 'New delivery address saved!' : 'አዲስ አድራሻ በተሳካ ሁኔታ ተመዝግቧል!',
      'success'
    );
  };

  const handleCreatePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmAccountInput) {
      showToast(language === 'en' ? 'Please enter payment account details' : 'እባክዎን የክፍያ መረጃ ያስገቡ', 'warning');
      return;
    }

    setIsEncrypting(true);
    setTimeout(() => {
      setIsEncrypting(false);

      let masked = pmAccountInput;
      if (pmAccountInput.length > 6) {
        const start = pmAccountInput.substring(0, 4);
        const end = pmAccountInput.substring(pmAccountInput.length - 3);
        masked = `${start} *** ${end}`;
      }

      const fakeToken = `enc_aes256_${Math.random().toString(36).substring(2, 10)}`;

      onAddPaymentMethod({
        type: pmType,
        title: pmTitle || `${pmType} Account`,
        accountMasked: masked,
        encryptedToken: fakeToken,
        isDefault: paymentMethods.length === 0,
        expiryDate: pmType === 'BANK_CARD' ? pmCardExpiry : undefined
      });

      setIsPaymentModalOpen(false);
      setPmAccountInput('');
      showToast(
        language === 'en' 
          ? 'Payment method encrypted and saved!' 
          : 'የክፍያ ዘዴው በተሳካ ሁኔታ ተመስጥሮ ተቀምጧል!',
        'success'
      );
    }, 800);
  };

  const handleDailyCheckIn = () => {
    if (hasCheckedInToday) {
      showToast(
        language === 'en' ? 'You have already collected today’s bonus check-in points!' : 'የዛሬውን የጉርሻ ነጥብ አስቀድመው ወስደዋል!',
        'info'
      );
      return;
    }
    setHasCheckedInToday(true);
    onAddPoints(
      50, 
      'Daily Bonus Check-In Reward (+50 PTS)', 
      'የዕለታዊ መግቢያ የጉርሻ ነጥብ (+50 ነጥብ)',
      'BONUS'
    );
    showToast(
      language === 'en' ? '🎉 +50 Kasma Points claimed for daily check-in!' : '🎉 +50 የካስማ ነጥቦች ለዛሬው መግቢያ ተሰጥተዎታል!',
      'success'
    );
  };

  const handleRedeem = (reward: KasmaPointsReward) => {
    if (kasmaPoints < reward.pointsCost) {
      showToast(
        language === 'en' 
          ? `Need ${reward.pointsCost - kasmaPoints} more points to claim voucher` 
          : `በቂ ነጥብ የለዎትም። ${reward.pointsCost - kasmaPoints} ተጨማሪ ነጥቦች ያስፈልጋሉ።`,
        'warning'
      );
      return;
    }

    onRedeemReward(reward);
    showToast(
      language === 'en' 
        ? `Claimed ${reward.titleEn}! Voucher Code: ${reward.code}` 
        : `${reward.titleAm} ተወስዷል! ኩፖን ኮድ: ${reward.code}`,
      'success'
    );
  };

  // Extract initials for user avatar badge
  const userInitials = (customerName || 'Abebe Bikila')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Dialog Frame Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative">
        
        {/* Top Sticky Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gray-50/90 dark:bg-zinc-850/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-200/60 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0"
              title={language === 'en' ? 'Back' : 'ተመለስ'}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#0052FF] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {isLoggedIn ? userInitials : (authMode === 'SIGN_IN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-gray-950 dark:text-white truncate tracking-tight">
                  {isLoggedIn 
                    ? (customerName || 'My Account') 
                    : (authMode === 'SIGN_IN' 
                        ? (language === 'en' ? 'Sign In' : 'መለያ መግቢያ') 
                        : (language === 'en' ? 'Create Account' : 'አዲስ መለያ መፍጠሪያ'))}
                </h2>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium truncate">
                  {isLoggedIn 
                    ? `${customerPhone} • ${tierInfo.nameEn}` 
                    : (language === 'en' ? 'Access your Kasma profile & orders' : 'ወደ ካስማ መለያዎ ይግቡ')}
                </p>
              </div>
            </div>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn && onOpenMyOrders && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMyOrders();
                }}
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold items-center gap-1.5 transition-all cursor-pointer hover:bg-emerald-100"
              >
                <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'en' ? 'My Orders' : 'የእኔ ትዕዛዞች'}</span>
              </button>
            )}

            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-xs font-bold items-center gap-1.5 transition-all cursor-pointer hover:bg-red-100"
                title={language === 'en' ? 'Sign Out' : 'ውጣ'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Sign Out' : 'ውጣ'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-200/60 dark:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* NON-LOGGED IN SEPARATE SIGN IN VS CREATE ACCOUNT FORMS */}
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto py-2 sm:py-4 space-y-5 text-left">
              
              {/* Segmented Auth Form Switcher Tabs */}
              <div className="flex bg-gray-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-gray-200 dark:border-zinc-700/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => { setAuthMode('SIGN_IN'); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'SIGN_IN'
                      ? 'bg-white dark:bg-zinc-900 text-[#0052FF] dark:text-blue-400 shadow-xs font-black'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'en' ? 'Sign In' : 'ይግቡ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('REGISTER'); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'REGISTER'
                      ? 'bg-white dark:bg-zinc-900 text-[#0052FF] dark:text-blue-400 shadow-xs font-black'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{language === 'en' ? 'Create Account' : 'መለያ ፍጠር'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('FORGOT_PASSWORD'); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'FORGOT_PASSWORD'
                      ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs font-black'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{language === 'en' ? 'Recovery' : 'መመለሻ'}</span>
                </button>
              </div>

              {authMode === 'SIGN_IN' && (
                /* FORM 1: USERNAME / EMAIL / PHONE + PASSWORD SIGN IN FORM */
                <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-5 shadow-xs">
                  
                  <div>
                    <h3 className="text-lg font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
                      <LogIn className="w-5 h-5 text-[#0052FF]" />
                      <span>{language === 'en' ? 'Sign In to Kasma' : 'ወደ ካስማ ይግቡ'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium">
                      {language === 'en' 
                        ? 'Sign in with your mobile phone number via SMS OTP or password' 
                        : 'በስልክ ቁጥርዎ በኤስኤምኤስ ኮድ ወይም በምስጢር ቃል ይግቡ'}
                    </p>
                  </div>

                  {/* Phone OTP vs Password Sub-tabs */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSignInMethod('SMS_OTP')}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        signInMethod === 'SMS_OTP'
                          ? 'bg-white dark:bg-zinc-900 text-[#0052FF] dark:text-blue-400 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Phone SMS OTP' : 'የስልክ ኤስኤምኤስ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignInMethod('PASSWORD')}
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        signInMethod === 'PASSWORD'
                          ? 'bg-white dark:bg-zinc-900 text-[#0052FF] dark:text-blue-400 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Password' : 'የምስጢር ቃል'}</span>
                    </button>
                  </div>

                  {signInMethod === 'SMS_OTP' ? (
                    <div className="space-y-4">
                      {/* Phone Number Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center justify-between">
                          <span>{language === 'en' ? 'Ethiopian Mobile Number' : 'የኢትዮጵያ ሞባይል ስልክ ቁጥር'}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">AfroMessage / Ethio Telecom</span>
                        </label>
                        <div className="relative flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-300">
                            🇪🇹 +251
                          </span>
                          <input
                            type="text"
                            value={otpPhoneInput.replace(/^\+251\s?/, '')}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setOtpPhoneInput(val.startsWith('+') ? val : `+251 ${val}`);
                            }}
                            placeholder="91 122 3344"
                            disabled={isOtpSent}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-r-xl text-xs font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF] disabled:opacity-75"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {language === 'en' ? 'Supports all 09... (Ethio Telecom) and 07... (Safaricom) numbers.' : 'ሁሉንም የ09... እና 07... የኢትዮጵያ ስልኮች ይደግፋል።'}
                        </p>
                      </div>

                      {otpNotice && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                          <Smartphone className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                          <span>{otpNotice}</span>
                        </div>
                      )}

                      {!isOtpSent ? (
                        <button
                          type="button"
                          onClick={handleSendSmsOtp}
                          disabled={isSendingOtp}
                          className="w-full py-3 bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSendingOtp ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>{language === 'en' ? 'Dispatching SMS...' : 'ኤስኤምኤስ በመላክ ላይ...'}</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>{language === 'en' ? 'Send 6-Digit SMS Code' : 'የ6-አሃዝ ማረጋገጫ ኮድ ላክ'}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <form onSubmit={handleVerifySmsOtp} className="space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                                {language === 'en' ? '6-Digit Verification Code' : 'የ6-አሃዝ ማረጋገጫ ኮድ'}
                              </label>
                              {resendCountdown > 0 ? (
                                <span className="text-[10px] font-mono text-gray-400">
                                  {language === 'en' ? `Resend in ${resendCountdown}s` : `በ${resendCountdown}ሰከንድ ውስጥ`}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendSmsOtp}
                                  className="text-[10px] font-bold text-[#0052FF] hover:underline cursor-pointer"
                                >
                                  {language === 'en' ? 'Resend SMS Code' : 'ኮድ በድጋሚ ላክ'}
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCodeInput}
                              onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                              placeholder="849201"
                              className="w-full text-center tracking-[0.4em] text-lg font-mono font-black py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                              required
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => { setIsOtpSent(false); setOtpCodeInput(''); }}
                              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-50 cursor-pointer"
                            >
                              {language === 'en' ? 'Change Phone' : 'ስልክ ቀይር'}
                            </button>
                            <button
                              type="submit"
                              disabled={isAuthenticating}
                              className="flex-1 py-2.5 bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {isAuthenticating ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>{language === 'en' ? 'Verifying...' : 'በማረጋገጥ ላይ...'}</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{language === 'en' ? 'Verify & Sign In' : 'አረጋግጥና ግባ'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                  <form onSubmit={handlePasswordSignIn} className="space-y-4">
                    {/* Identifier Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center justify-between">
                        <span>{language === 'en' ? 'Username, Email or Phone' : 'የተጠቃሚ ስም፣ ኢሜይል ወይም ስልክ'}</span>
                        <span className="text-[10px] text-gray-400 font-normal">Required</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-gray-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={loginIdentifierInput}
                          onChange={(e) => setLoginIdentifierInput(e.target.value)}
                          placeholder={language === 'en' ? 'e.g. abebe.bikila, user@example.com, or +251911...' : 'ምሳሌ፡ abebe.bikila, user@example.com, ወይም +251911...'}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input with Toggle */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          {language === 'en' ? 'Password' : 'የምስጢር ቃል'}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('FORGOT_PASSWORD');
                            setRecoveryTargetInput(loginIdentifierInput);
                          }}
                          className="text-xs font-bold text-[#0052FF] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>{language === 'en' ? 'Forgot Password?' : 'የምስጢር ቃል ረሱት?'}</span>
                        </button>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-gray-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPasswordInput}
                          onChange={(e) => setLoginPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer p-0.5"
                          title={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full py-3 bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {isAuthenticating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{language === 'en' ? 'Signing In...' : 'በመግባት ላይ...'}</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>{language === 'en' ? 'Sign In to Account' : 'ወደ መለያ ግባ'}</span>
                        </>
                      )}
                    </button>
                  </form>
                  )}

                  {/* Demo Quick Auto-Fill credentials buttons */}
                  <div className="p-3.5 bg-gray-50 dark:bg-zinc-850/70 rounded-xl border border-gray-200/80 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>{language === 'en' ? 'Quick Test Sign In Options:' : 'ፈጣን የሙከራ መግቢያዎች:'}</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifierInput('abebe.bikila');
                          setLoginPasswordInput('kasma1234');
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 rounded-lg text-[10px] font-mono font-bold border border-gray-200 dark:border-zinc-700 hover:border-[#0052FF] cursor-pointer flex items-center justify-between transition-all"
                      >
                        <span>abebe.bikila</span>
                        <span className="text-[9px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded font-sans">Username</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifierInput('+251911223344');
                          setLoginPasswordInput('kasma1234');
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 rounded-lg text-[10px] font-mono font-bold border border-gray-200 dark:border-zinc-700 hover:border-[#0052FF] cursor-pointer flex items-center justify-between transition-all"
                      >
                        <span>+251911223344</span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded font-sans">Phone</span>
                      </button>
                    </div>
                  </div>

                  {/* Security badge */}
                  <div className="flex items-center justify-between pt-2 text-[11px] text-gray-400 dark:text-zinc-500 border-t border-gray-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      256-Bit Encrypted Session
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('REGISTER')}
                      className="font-extrabold text-[#0052FF] hover:underline cursor-pointer"
                    >
                      {language === 'en' ? 'Create Account →' : 'መለያ ይፍጠሩ →'}
                    </button>
                  </div>

                </div>
              )}

              {authMode === 'FORGOT_PASSWORD' && (
                /* FORM 2: ENHANCED PASSWORD RECOVERY WIZARD */
                <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-5 shadow-xs">
                  
                  <div>
                    <h3 className="text-lg font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-500" />
                      <span>{language === 'en' ? 'Account Password Recovery' : 'የምስጢር ቃል መመለሻ'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium">
                      {language === 'en' 
                        ? 'Recover access to your account via Mobile Phone SMS or Email verification' 
                        : 'በስልክ ቁጥር ወይም በኢሜይል መለያዎን ይመልሱ'}
                    </p>
                  </div>

                  {/* Step Progress Tracker */}
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-extrabold">
                    <div className={`py-1.5 rounded-lg border flex items-center justify-center gap-1 ${
                      !recoveryOtpSent 
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' 
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    }`}>
                      <span>1. Recovery Target</span>
                      {recoveryOtpSent && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </div>

                    <div className={`py-1.5 rounded-lg border flex items-center justify-center gap-1 ${
                      recoveryOtpSent 
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' 
                        : 'bg-gray-50 dark:bg-zinc-800 text-gray-400 border-gray-200 dark:border-zinc-700'
                    }`}>
                      <span>2. Verify Code & Reset</span>
                    </div>
                  </div>

                  {!recoveryOtpSent ? (
                    <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                      {/* Method Selection: Phone vs Email */}
                      <div className="flex bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
                        <button
                          type="button"
                          onClick={() => setRecoveryMethod('PHONE')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            recoveryMethod === 'PHONE'
                              ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs font-black'
                              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-500" />
                          <span>Phone SMS</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecoveryMethod('EMAIL')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            recoveryMethod === 'EMAIL'
                              ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs font-black'
                              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5 text-purple-500" />
                          <span>Email Address</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          {recoveryMethod === 'PHONE' 
                            ? (language === 'en' ? 'Mobile Phone Number' : 'የስልክ ቁጥር') 
                            : (language === 'en' ? 'Email Address' : 'የኢሜይል አድራሻ')}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-gray-400">
                            {recoveryMethod === 'PHONE' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                          </span>
                          <input
                            type={recoveryMethod === 'PHONE' ? 'tel' : 'email'}
                            value={recoveryTargetInput}
                            onChange={(e) => setRecoveryTargetInput(e.target.value)}
                            placeholder={recoveryMethod === 'PHONE' ? '+251 911 223 344' : 'user@example.com'}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        {isAuthenticating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                            <span>{language === 'en' ? 'Sending Recovery Code...' : 'ኮድ በመላክ ላይ...'}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-slate-950" />
                            <span>{language === 'en' ? 'Send Verification Code' : 'የማረጋገጫ ኮድ ላክ'}</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Code sent to <strong className="font-mono">{recoveryTargetInput}</strong></span>
                        </span>
                        <span className="font-mono font-bold text-amber-600 bg-amber-200/80 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-300">8842</span>
                      </div>

                      {/* Code Input & Resend Button */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                            {language === 'en' ? '4-Digit Verification Code' : 'የማረጋገጫ ኮድ'}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleSendRecoveryCode()}
                            disabled={resendCountdown > 0}
                            className="text-[11px] font-bold text-amber-600 hover:underline disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {resendCountdown > 0 ? `Resend Code (${resendCountdown}s)` : 'Resend Code Now'}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={recoveryOtpCode}
                          onChange={(e) => setRecoveryOtpCode(e.target.value)}
                          placeholder="8842"
                          maxLength={4}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-center text-xl font-mono font-black tracking-widest text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      {/* New Password & Strength Gauge */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          {language === 'en' ? 'New Password' : 'አዲስ የምስጢር ቃል'}
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Password Strength Meter */}
                        {newPasswordInput && (
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-gray-500">Strength:</span>
                              <span className={getPasswordStrength(newPasswordInput).score === 3 ? 'text-emerald-500' : 'text-amber-500'}>
                                {getPasswordStrength(newPasswordInput).label}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${getPasswordStrength(newPasswordInput).color}`}
                                style={{ width: `${(getPasswordStrength(newPasswordInput).score / 3) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          {language === 'en' ? 'Confirm New Password' : 'አዲስ የምስጢር ቃል ያረጋግጡ'}
                        </label>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmNewPasswordInput}
                          onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>{language === 'en' ? 'Reset Password & Sign In' : 'የምስጢር ቃል ይቀይሩ እና ይግቡ'}</span>
                      </button>
                    </form>
                  )}

                  {/* Back Link */}
                  <div className="pt-2 text-center text-xs text-gray-500 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAuthMode('SIGN_IN')}
                      className="font-extrabold text-[#0052FF] hover:underline cursor-pointer"
                    >
                      ← {language === 'en' ? 'Back to Sign In' : 'ወደ መግቢያ ተመለስ'}
                    </button>
                  </div>

                </div>
              )}

              {authMode === 'REGISTER' && (
                /* FORM 3: CLEAN CREATE ACCOUNT REGISTRATION FORM WITH GLOBAL PHONE & ADDRESS */
                <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-5 shadow-xs">
                  
                  <div>
                    <h3 className="text-lg font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-[#0052FF]" />
                      <span>{language === 'en' ? 'Create an Account' : 'አዲስ መለያ ይፍጠሩ'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium">
                      {language === 'en' 
                        ? 'Join Kasma worldwide to save delivery destinations and track orders' 
                        : 'የማድረሻ አድራሻ ለማስቀመጥ እና ትዕዛዝ ለመከታተል ይመዝገቡ'}
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                        {language === 'en' ? 'Full Name' : 'ሙሉ ስም'}
                      </label>
                      <input
                        type="text"
                        value={regNameInput}
                        onChange={(e) => setRegNameInput(e.target.value)}
                        placeholder={language === 'en' ? 'Enter your full name' : 'ሙሉ ስምዎን ያስገቡ'}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                        required
                      />
                    </div>

                    {/* Mobile Phone Number with Country Code Picker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                        {language === 'en' ? 'Mobile Phone Number' : 'የስልክ ቁጥር'}
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedCountryCode}
                          onChange={(e) => setSelectedCountryCode(e.target.value)}
                          className="px-2.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF] cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code} ({c.country})
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={regPhoneInput.replace(/^\+\d+\s?/, '')}
                          onChange={(e) => setRegPhoneInput(`${selectedCountryCode} ${e.target.value}`)}
                          placeholder="912 345 678"
                          className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          {language === 'en' ? 'Email Address' : 'ኢሜይል አድራሻ'}
                        </label>
                        <input
                          type="email"
                          value={regEmailInput}
                          onChange={(e) => setRegEmailInput(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          {language === 'en' ? 'City / Region / Country' : 'ከተማ / ክልል / አገር'}
                        </label>
                        <input
                          type="text"
                          value={regSubCityInput}
                          onChange={(e) => setRegSubCityInput(e.target.value)}
                          placeholder={language === 'en' ? 'e.g. Addis Ababa, Hawassa, London, Dubai' : 'ምሳሌ፡ አዲስ አበባ፣ ሐዋሳ፣ ለንደን፣ ዱባይ'}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                        {language === 'en' ? 'Create Account Password' : 'የምስጢር ቃል ፍጠር'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-gray-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={regPasswordInput}
                          onChange={(e) => setRegPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer p-0.5"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {regPasswordInput && (
                        <div className="pt-1">
                          <div className="w-full bg-gray-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getPasswordStrength(regPasswordInput).color}`}
                              style={{ width: `${(getPasswordStrength(regPasswordInput).score / 3) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="regTerms"
                        checked={regAgreeTerms}
                        onChange={(e) => setRegAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0052FF] accent-[#0052FF] cursor-pointer"
                      />
                      <label htmlFor="regTerms" className="text-xs text-gray-600 dark:text-zinc-400 font-medium cursor-pointer">
                        {language === 'en' ? 'I agree to the Terms of Service & Privacy Policy' : 'በአገልግሎት ደንብ እና ውል እስማማለሁ'}
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthenticating || !regAgreeTerms}
                      className="w-full py-3 bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                    >
                      {isAuthenticating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{language === 'en' ? 'Creating Account...' : 'መለያ እየተፈጠረ ነው...'}</span>
                        </>
                      ) : (
                        <span>{language === 'en' ? 'Create Free Account' : 'መለያ ፍጠር'}</span>
                      )}
                    </button>
                  </form>

                  {/* Trust footer */}
                  <div className="pt-3 flex items-center justify-between text-[10px] text-gray-400 dark:text-zinc-500 border-t border-gray-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Zero-Spam Guarantee
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('SIGN_IN')}
                      className="font-extrabold text-[#0052FF] hover:underline cursor-pointer text-xs"
                    >
                      {language === 'en' ? 'Already have an account? Sign In' : 'አስቀድመው መለያ አለዎት? ይግቡ'}
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* LOGGED IN ACCOUNT DASHBOARD */
            <div className="space-y-6">

              {/* Profile Overview Bar */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-zinc-900 to-slate-900 text-white rounded-2xl border border-zinc-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0052FF] to-blue-600 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0 border border-blue-400/30">
                    {userInitials}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-white truncate">{customerName}</h3>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${tierInfo.badgeColor}`}>
                        {tierInfo.nameEn}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">{customerPhone} • {customerEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  {onOpenTrackShipment && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTrackShipment();
                      }}
                      className="flex-1 sm:flex-none px-3 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-zinc-700"
                    >
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      <span>{language === 'en' ? 'Track Shipment' : 'ጭነት ይከታተሉ'}</span>
                    </button>
                  )}

                  <button
                    onClick={onLogout}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-red-500/20 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Sign Out' : 'ውጣ'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-gray-50 dark:bg-zinc-850/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{language === 'en' ? 'Kasma Points' : 'የካስማ ነጥቦች'}</span>
                  </span>
                  <p className="text-lg font-black text-gray-900 dark:text-white font-mono">
                    {kasmaPoints.toLocaleString()} <span className="text-xs text-amber-500 font-bold">PTS</span>
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">≈ {(kasmaPoints * 0.1).toFixed(0)} ETB Value</p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-zinc-850/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-blue-500" />
                    <span>{language === 'en' ? 'Discount Tier' : 'የቅናሽ ደረጃ'}</span>
                  </span>
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                    {tierInfo.currentTier} VIP
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium truncate">{tierInfo.progressPct}% to Next Level</p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-zinc-850/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span>{language === 'en' ? 'Destinations' : 'አድራሻዎች'}</span>
                  </span>
                  <p className="text-lg font-black text-gray-900 dark:text-white font-mono">
                    {addresses.length}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium">Addis Ababa Saved</p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-zinc-850/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-500" />
                    <span>{language === 'en' ? 'Payment Methods' : 'የክፍያ መንገዶች'}</span>
                  </span>
                  <p className="text-lg font-black text-gray-900 dark:text-white font-mono">
                    {paymentMethods.length}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium">AES-256 Encrypted</p>
                </div>
              </div>

              {/* Nav Tabs Ribbon */}
              <div className="flex items-center gap-1.5 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'TRACKING', labelEn: 'Track Order', labelAm: 'ትዕዛዝ መከታተያ', icon: Truck, count: displayOrders.length, badge: (orders && orders.length > 0) ? 'LIVE' : 'DEMO' },
                  { id: 'POINTS', labelEn: 'Rewards & Perks', labelAm: 'የካስማ ነጥቦች', icon: Sparkles, badge: `${kasmaPoints} PTS` },
                  { id: 'ADDRESSES', labelEn: 'Saved Destinations', labelAm: 'የመድረሻ አድራሻዎች', icon: MapPin, count: addresses.length },
                  { id: 'PAYMENTS', labelEn: 'Payment Options', labelAm: 'የክፍያ መንገዶች', icon: CreditCard, count: paymentMethods.length },
                  { id: 'PROFILE', labelEn: 'Account Settings', labelAm: 'የግል መረጃ', icon: User },
                  { id: 'TELEGRAM', labelEn: 'Telegram Alerts', labelAm: 'ቴሌግራም ማገናኛ', icon: Send, badge: 'BOT' },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        isSelected 
                          ? 'bg-[#0052FF] text-white shadow-xs' 
                          : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <TabIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                      <span>{language === 'en' ? tab.labelEn : tab.labelAm}</span>
                      {tab.badge && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                      {tab.count !== undefined && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TAB 0: DEDICATED TRACK ORDER STEPPER VISUALIZATION */}
              {activeTab === 'TRACKING' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  {/* Order Selector Strip (If multiple orders exist) */}
                  {displayOrders.length > 1 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        {language === 'en' ? 'Select Active Order to Track:' : 'መከታተል የሚፈልጉትን ትዕዛዝ ይምረጡ:'}
                      </p>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar-x">
                        {displayOrders.map((ord) => {
                          const isSel = selectedOrder.id === ord.id;
                          return (
                            <button
                              key={ord.id}
                              type="button"
                              onClick={() => setSelectedOrderId(ord.id)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-2 cursor-pointer shrink-0 ${
                                isSel
                                  ? 'bg-[#0052FF] text-white border-2 border-[#0052FF] shadow-md ring-2 ring-[#0052FF]/30'
                                  : 'bg-gray-50 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 border-gray-200/80 dark:border-zinc-700/80 hover:bg-gray-100'
                              }`}
                            >
                              <Package className={`w-3.5 h-3.5 ${isSel ? 'text-white' : 'text-gray-400'}`} />
                              <span>#{ord.id.substring(0, 12)}</span>
                              {isSel && (
                                <span className="bg-white text-[#0052FF] text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full shadow-xs">
                                  ★ SELECTED
                                </span>
                              )}
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                                isSel
                                  ? 'bg-white/20 text-white'
                                  : ord.status === 'DELIVERED' 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : ord.status === 'SHIPPED'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {ord.status}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Card with Header & Visualizer */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
                    
                    {/* Header Info Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-gray-950 dark:text-white">
                            {language === 'en' ? 'Order Reference' : 'የትዕዛዝ መለያ'}: #{selectedOrder.id}
                          </span>
                          {selectedOrder.id === 'ORD-8842-ETB' && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {language === 'en' ? 'Demo Live Tracking' : 'የሙከራ መከታተያ'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 font-medium">
                          {language === 'en' ? 'Placed on' : 'የተመዘገበበት ቀን'}: {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {selectedOrder.items.length} {language === 'en' ? 'item(s)' : 'ዕቃዎች'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-sm font-black text-[#0052FF] dark:text-blue-400 font-mono block">
                          {selectedOrder.total.toLocaleString()} ETB
                        </span>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium font-mono">
                          Method: {selectedOrder.paymentMethod}
                        </p>
                      </div>
                    </div>

                    {/* Order Tracking Stepper Visualizer */}
                    <OrderTrackingVisualizer 
                      order={selectedOrder}
                      language={language}
                      showItemsSummary={false}
                    />

                    {/* Order Item Thumbnails Summary */}
                    <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        {language === 'en' ? 'Package Contents:' : 'በትዕዛዙ ውስጥ ያሉ ዕቃዎች:'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-zinc-850/60 border border-gray-200/60 dark:border-zinc-800">
                            <img 
                              src={item.product.image} 
                              alt={item.product.nameEn} 
                              className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-200 dark:border-zinc-700"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {language === 'en' ? item.product.nameEn : item.product.nameAm}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">
                                Qty: {item.quantity} • {item.variantName}
                              </p>
                            </div>
                            <span className="text-xs font-black text-gray-900 dark:text-white font-mono shrink-0">
                              {(item.price * item.quantity).toLocaleString()} ETB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}
              {activeTab === 'POINTS' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  {/* Daily Check-In Bonus Banner */}
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                          <span>{language === 'en' ? 'Daily Check-In Reward' : 'የዕለታዊ መግቢያ ጉርሻ'}</span>
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.2 rounded">+50 PTS</span>
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                          {language === 'en' ? 'Claim +50 Kasma Points every 24 hours just for opening the store!' : 'በየቀኑ መተግበሪያውን በመክፈት +50 ነጥብ ያግኙ!'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDailyCheckIn}
                      disabled={hasCheckedInToday}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        hasCheckedInToday
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs active:scale-98'
                      }`}
                    >
                      {hasCheckedInToday ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{language === 'en' ? 'Claimed Today (+50 PTS)' : 'ተወስዷል'}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                          <span>{language === 'en' ? 'Claim +50 Points' : '+50 ነጥብ ውሰድ'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Tier Progress Card */}
                  <div className="p-4 bg-gray-50 dark:bg-zinc-850/60 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>{language === 'en' ? 'Tier Progression:' : 'የደረጃ እድገት:'} {tierInfo.nameEn}</span>
                      </span>
                      {tierInfo.nextTierPts > 0 ? (
                        <span className="font-mono text-[11px] font-bold text-[#0052FF]">
                          {tierInfo.nextTierPts} PTS Needed ({tierInfo.progressPct}%)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Max Tier Reached</span>
                      )}
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, tierInfo.progressPct)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                      <strong>Current Perks:</strong> {language === 'en' ? tierInfo.perksEn : tierInfo.perksAm}
                    </p>
                  </div>

                  {/* Rewards Catalog */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-[#0052FF]" />
                      <span>{language === 'en' ? 'Redeem Points for Vouchers' : 'ነጥቦችን ወደ ቅናሽ ኩፖን ይለውጡ'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {REWARDS.map((rw) => {
                        const canAfford = kasmaPoints >= rw.pointsCost;
                        return (
                          <div
                            key={rw.id}
                            className={`p-3.5 bg-white dark:bg-zinc-850 rounded-xl border transition-all flex items-center justify-between gap-3 shadow-2xs ${
                              canAfford 
                                ? 'border-amber-300 dark:border-amber-800/60' 
                                : 'border-gray-200 dark:border-zinc-800 opacity-70'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                {rw.pointsCost} PTS
                              </span>
                              <h5 className="font-bold text-xs text-gray-900 dark:text-white">{rw.titleEn}</h5>
                              <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {rw.type === 'FREE_SHIPPING' ? 'FREE EXPRESS SHIPPING' : `-${rw.discountValue} ETB DISCOUNT`}
                              </p>
                            </div>

                            <button
                              onClick={() => handleRedeem(rw)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                                canAfford
                                  ? 'bg-[#0052FF] hover:bg-[#003ecf] text-white shadow-2xs'
                                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {canAfford ? (language === 'en' ? 'Redeem' : 'ውሰድ') : (language === 'en' ? 'Need PTS' : 'ነጥብ የለም')}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Points Activity Log */}
                  <div className="p-4 bg-gray-50 dark:bg-zinc-850/60 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{language === 'en' ? 'Points Log' : 'የነጥቦች ታሪክ'}</span>
                    </h4>

                    <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {pointsLogs.length === 0 ? (
                        <p className="py-2 text-xs text-gray-400 text-center font-medium">No recent point activity</p>
                      ) : (
                        pointsLogs.slice(0, 5).map((log) => (
                          <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-zinc-100">{log.titleEn}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleDateString()}</p>
                            </div>
                            <span className={`font-mono font-bold ${log.points > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                              {log.points > 0 ? `+${log.points}` : log.points} PTS
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: SAVED ADDRESSES */}
              {activeTab === 'ADDRESSES' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span>{language === 'en' ? 'Saved Delivery Addresses' : 'የተቀመጡ የመድረሻ አድራሻዎች'}</span>
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                        {language === 'en' ? 'Default address is pre-filled during Checkout for worldwide shipping.' : 'በመክፈያ ገጽ ላይ በራስ ሰር የሚሞላ አድራሻ።'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="px-3 py-1.5 bg-[#0052FF] hover:bg-[#003ecf] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Add Address' : 'አዲስ አድራሻ'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.length === 0 ? (
                      <div className="sm:col-span-2 p-8 text-center bg-gray-50 dark:bg-zinc-850/60 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
                        <MapPin className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="text-xs text-gray-500 font-bold">No saved addresses found</p>
                      </div>
                    ) : (
                      addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-xl border transition-all space-y-2 relative bg-white dark:bg-zinc-850 ${
                            addr.isDefault 
                              ? 'border-2 border-[#0052FF] ring-2 ring-[#0052FF]/30 shadow-md bg-blue-50/20 dark:bg-blue-950/20' 
                              : 'border-gray-200 dark:border-zinc-750 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-gray-900 dark:text-white uppercase bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-black text-white bg-[#0052FF] px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                                ★ SELECTED DEFAULT
                              </span>
                            )}
                          </div>

                          <div className="text-xs space-y-0.5 text-gray-700 dark:text-zinc-300">
                            <p className="font-bold text-gray-950 dark:text-white">{addr.fullName}</p>
                            <p className="font-mono text-gray-500 text-[11px]">{addr.phone}</p>
                            <p className="text-[11px] text-gray-600 dark:text-zinc-400">
                              <span className="font-semibold text-gray-800 dark:text-zinc-200">{addr.subCity}</span>
                              {addr.woreda ? ` • ${addr.woreda}` : ''} • {addr.streetAddress}
                            </p>
                          </div>

                          <div className="pt-1 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 text-[11px]">
                            {!addr.isDefault ? (
                              <button
                                onClick={() => onSetDefaultAddress(addr.id)}
                                className="text-[#0052FF] font-bold hover:underline cursor-pointer"
                              >
                                Set as Default
                              </button>
                            ) : <span />}

                            <button
                              onClick={() => onDeleteAddress(addr.id)}
                              className="text-gray-400 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PAYMENT METHODS */}
              {activeTab === 'PAYMENTS' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-purple-500" />
                        <span>{language === 'en' ? 'Saved Payment Vault' : 'የተቀመጡ የክፍያ መንገዶች'}</span>
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                        {language === 'en' ? 'AES-256 encrypted payment credentials for 1-click checkout.' : 'በAES-256 የተመስጠሩ የክፍያ መረጃዎች።'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="px-3 py-1.5 bg-[#0052FF] hover:bg-[#003ecf] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Add Method' : 'አዲስ መንገድ'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.length === 0 ? (
                      <div className="sm:col-span-2 p-8 text-center bg-gray-50 dark:bg-zinc-850/60 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
                        <CreditCard className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="text-xs text-gray-500 font-bold">No saved payment methods</p>
                      </div>
                    ) : (
                      paymentMethods.map((pm) => (
                        <div
                          key={pm.id}
                          className={`p-4 rounded-xl border transition-all space-y-2 relative bg-white dark:bg-zinc-850 ${
                            pm.isDefault 
                              ? 'border-[#0052FF] ring-1 ring-[#0052FF]/20' 
                              : 'border-gray-200 dark:border-zinc-750'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-sky-600 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                              {pm.type}
                            </span>
                            {pm.isDefault && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                Default
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="font-bold text-xs text-gray-950 dark:text-white">{pm.title}</p>
                            <p className="font-mono text-xs font-bold text-gray-700 dark:text-zinc-300">{pm.accountMasked}</p>
                            <p className="text-[9px] font-mono text-gray-400 truncate">Token: {pm.encryptedToken}</p>
                          </div>

                          <div className="pt-1 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 text-[11px]">
                            {!pm.isDefault ? (
                              <button
                                onClick={() => onSetDefaultPaymentMethod(pm.id)}
                                className="text-[#0052FF] font-bold hover:underline cursor-pointer"
                              >
                                Set Default
                              </button>
                            ) : <span />}

                            <button
                              onClick={() => onDeletePaymentMethod(pm.id)}
                              className="text-gray-400 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ACCOUNT SETTINGS */}
              {activeTab === 'PROFILE' && (
                <div className="p-5 bg-gray-50 dark:bg-zinc-850/60 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-4 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#0052FF]" />
                    <span>{language === 'en' ? 'Personal Information' : 'የግል መረጃዎች'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 dark:text-zinc-400">Full Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 dark:text-zinc-400">Phone Number (+251)</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-gray-600 dark:text-zinc-400">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail && setCustomerEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => showToast(language === 'en' ? 'Profile details saved!' : 'መረጃዎ ተቀምጧል!', 'success')}
                    className="px-5 py-2 bg-[#0052FF] hover:bg-[#003ecf] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {language === 'en' ? 'Save Profile' : 'መረጃ አስቀምጥ'}
                  </button>
                </div>
              )}

              {/* TAB 5: TELEGRAM ALERTS */}
              {activeTab === 'TELEGRAM' && (
                <div className="animate-in fade-in duration-150">
                  <TelegramIntegrationModule language={language} showToast={showToast} />
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-zinc-850/80 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 font-medium text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Kasma Encrypted Session Protocol</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            {language === 'en' ? 'Close' : 'ዝጋ'}
          </button>
        </div>

      </div>

      {/* Add Address Modal Sub-Dialog */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-2xl w-full max-w-md p-5 space-y-4 border border-gray-200 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>{language === 'en' ? 'Add Delivery Destination' : 'አዲስ የመድረሻ አድራሻ'}</span>
            </h3>

            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs font-bold">
              <div className="grid grid-cols-3 gap-2">
                {(['HOME', 'OFFICE', 'OTHER'] as const).map((lbl) => (
                  <button
                    type="button"
                    key={lbl}
                    onClick={() => setAddrLabel(lbl)}
                    className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      addrLabel === lbl
                        ? 'bg-[#0052FF] text-white border-[#0052FF]'
                        : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500">Contact Person Name</label>
                <input
                  type="text"
                  value={addrFullName}
                  onChange={(e) => setAddrFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500">Phone Number</label>
                  <input
                    type="text"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500">{language === 'en' ? 'City / Region / Country' : 'ከተማ / ክልል / አገር'}</label>
                  <input
                    type="text"
                    value={addrSubCity}
                    onChange={(e) => setAddrSubCity(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Addis Ababa, Hawassa, London, Dubai' : 'ምሳሌ፡ አዲስ አበባ፣ ሐዋሳ፣ ለንደን፣ ዱባይ'}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500">Woreda / Area</label>
                <input
                  type="text"
                  value={addrWoreda}
                  onChange={(e) => setAddrWoreda(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                  placeholder="Woreda 03"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500">Street / Landmark Address</label>
                <textarea
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium"
                  placeholder="Atlas Road, Near Skylight Hotel, House #402"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0052FF] hover:bg-[#003ecf] text-white font-bold text-xs uppercase rounded-xl shadow-xs cursor-pointer"
              >
                Save Destination
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Method Sub-Dialog */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 rounded-2xl w-full max-w-sm p-5 space-y-4 border border-gray-200 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>Encrypt & Save Payment</span>
            </h3>

            <form onSubmit={handleCreatePaymentMethod} className="space-y-3 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500">Provider</label>
                <select
                  value={pmType}
                  onChange={(e) => setPmType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <option value="TELEBIRR">Telebirr Wallet</option>
                  <option value="CHAPA">Chapa Card / Bank</option>
                  <option value="BANK_CARD">CBE / Visa / Mastercard</option>
                  <option value="CBE_BIRR">CBE Birr</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500">Account Label</label>
                <input
                  type="text"
                  value={pmTitle}
                  onChange={(e) => setPmTitle(e.target.value)}
                  placeholder="My Telebirr Account"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500">Account / Mobile Number</label>
                <input
                  type="text"
                  value={pmAccountInput}
                  onChange={(e) => setPmAccountInput(e.target.value)}
                  placeholder="+251 911 223 344"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isEncrypting}
                className="w-full py-2.5 bg-[#0052FF] hover:bg-[#003ecf] text-white font-bold text-xs uppercase rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isEncrypting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Encrypting Token...</span>
                  </>
                ) : (
                  <span>Save Encrypted Token</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfileView;

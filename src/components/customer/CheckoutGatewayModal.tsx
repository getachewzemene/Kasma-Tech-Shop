import React from 'react';
import {
  Package, MapPin, Info, Truck, ShieldCheck, Building2, Send, MessageCircle,
  RefreshCw, CreditCard, QrCode, Smartphone, CheckCircle2, Copy, Phone,
  ExternalLink, Zap, Upload, X, Sparkles, Check, Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CartItem, Order, PromoCode } from '../../types';
import { SUB_CITIES } from '../../constants/locations';
import { OrderCourierMiniMap } from '../OrderCourierMiniMap';
import { generateWhatsAppCustomerWelcomeUrl } from '../../utils/whatsappNotifications';

interface CheckoutGatewayModalProps {
  isOpen: boolean;
  language: 'en' | 'am';
  paymentStep: 'FORM' | 'GATEWAY' | 'OTP' | 'SUCCESS';
  setPaymentStep: (step: 'FORM' | 'GATEWAY' | 'OTP' | 'SUCCESS') => void;
  closeCheckoutFlow: () => void;
  handleCheckoutSubmit: (e: React.FormEvent) => void;
  cart: CartItem[];
  cartSubtotal: number;
  cartTotal: number;
  activeDiscount: number;
  appliedPromo: PromoCode | null;
  shippingFee: number;
  paymentApiError: string;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  customerEmail?: string;
  selectedSubCity: string;
  setSelectedSubCity: (v: string) => void;
  customerLandmark: string;
  setCustomerLandmark: (v: string) => void;
  shippingAddress: string;
  setShippingAddress: (v: string) => void;
  paymentMethod: 'TELEBIRR' | 'CHAPA' | 'COD' | 'CBE_BIRR' | 'BANK';
  setPaymentMethod: (m: 'TELEBIRR' | 'CHAPA' | 'COD' | 'CBE_BIRR' | 'BANK') => void;
  merchantTelegramConfirmed: boolean;
  setMerchantTelegramConfirmed: (v: boolean) => void;
  isInitializingPayment: boolean;
  gatewayPaymentTab: 'QR' | 'DIRECT' | 'BANK_RECEIPT';
  setGatewayPaymentTab: (tab: 'QR' | 'DIRECT' | 'BANK_RECEIPT') => void;
  activePaymentSession: any;
  qrReferenceTx: string;
  copiedQrLink: boolean;
  setCopiedQrLink: (v: boolean) => void;
  selectedBank: 'CBE' | 'BOA' | 'AWASH';
  setSelectedBank: (b: 'CBE' | 'BOA' | 'AWASH') => void;
  paymentScreenshot: string | null;
  setPaymentScreenshot: (v: string | null) => void;
  paymentScreenshotName: string;
  setPaymentScreenshotName: (v: string) => void;
  handleScreenshotFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUseDemoScreenshot: () => void;
  bankReference: string;
  setBankReference: (v: string) => void;
  completeOrder: (status: 'PAID' | 'PENDING', ref?: string) => void;
  isProcessingPayment: boolean;
  handleVerifyPaymentApi: () => void;
  telebirrOtp: string;
  setTelebirrOtp: (v: string) => void;
  handleVerifyOtp: () => void;
  lastPlacedOrderId: string | null;
  lastPlacedOrder: Order | null;
  allOrders: Order[];
  setTrackOrderId: (id: string) => void;
  setTrackedOrder: (o: Order | null) => void;
  setHasSearchedOrder: (v: boolean) => void;
  setIsCheckoutOpen: (v: boolean) => void;
  setIsOrderStatusOpen: (v: boolean) => void;
  setIsMyOrdersOpen: (v: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CheckoutGatewayModal: React.FC<CheckoutGatewayModalProps> = ({
  isOpen,
  language,
  paymentStep,
  setPaymentStep,
  closeCheckoutFlow,
  handleCheckoutSubmit,
  cart,
  cartSubtotal,
  cartTotal,
  activeDiscount,
  appliedPromo,
  shippingFee,
  paymentApiError,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  selectedSubCity,
  setSelectedSubCity,
  customerLandmark,
  setCustomerLandmark,
  shippingAddress,
  setShippingAddress,
  paymentMethod,
  setPaymentMethod,
  merchantTelegramConfirmed,
  setMerchantTelegramConfirmed,
  isInitializingPayment,
  gatewayPaymentTab,
  setGatewayPaymentTab,
  activePaymentSession,
  qrReferenceTx,
  copiedQrLink,
  setCopiedQrLink,
  selectedBank,
  setSelectedBank,
  paymentScreenshot,
  setPaymentScreenshot,
  paymentScreenshotName,
  setPaymentScreenshotName,
  handleScreenshotFileChange,
  handleUseDemoScreenshot,
  bankReference,
  setBankReference,
  completeOrder,
  isProcessingPayment,
  handleVerifyPaymentApi,
  telebirrOtp,
  setTelebirrOtp,
  handleVerifyOtp,
  lastPlacedOrderId,
  lastPlacedOrder,
  allOrders,
  setTrackOrderId,
  setTrackedOrder,
  setHasSearchedOrder,
  setIsCheckoutOpen,
  setIsOrderStatusOpen,
  setIsMyOrdersOpen,
  showToast
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 relative animate-in fade-in zoom-in-95 duration-200 my-auto">

        {/* Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-900 dark:text-white">{language === 'en' ? 'Secure Checkout Portal' : 'ደህንነቱ የተጠበቀ መክፈያ'}</h3>
            <p className="text-[10px] text-gray-400 dark:text-zinc-400 mt-0.5">{language === 'en' ? 'Powered by Kasma Gateway Services' : 'በካስማ የክፍያ አገልግሎት የሚሰራ'}</p>
          </div>
          {paymentStep !== 'GATEWAY' && paymentStep !== 'OTP' && (
            <button
              onClick={closeCheckoutFlow}
              className="text-gray-400 hover:text-black dark:text-zinc-400 dark:hover:text-white font-bold p-1 rounded-full transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Steps Rendering */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 touch-pan-y overscroll-contain space-y-4">
          {paymentStep === 'FORM' && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Primary Order Overview */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl p-3 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0052FF] dark:text-blue-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Primary Order Items' : 'ዋና የተመረጡ እቃዎች'} ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                  </span>
                  <span className="text-xs font-mono font-black text-gray-900 dark:text-white">
                    {cartSubtotal.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {cart.map((it) => (
                    <div key={it.sku} className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2 py-1 rounded-xl border border-gray-150 dark:border-zinc-800 shrink-0 shadow-2xs">
                      <img src={it.product.image} alt={it.product.nameEn} className="w-6 h-6 object-cover rounded-md" />
                      <div className="text-[9px] max-w-[120px] truncate">
                        <span className="font-bold text-gray-900 dark:text-white truncate block">{language === 'en' ? it.product.nameEn : it.product.nameAm}</span>
                        <span className="text-gray-400 font-mono">x{it.quantity} • {(it.price * it.quantity).toLocaleString()} ETB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                <h4 className="font-bold text-gray-900 dark:text-zinc-200 text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>{language === 'en' ? '1. Recipient & Ethiopian Delivery Address' : '1. የተቀባይ እና የአድራሻ መረጃ'}</span>
                </h4>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/50">
                  {language === 'en' ? 'Landmark-Based' : 'በመለያ ቦታ የሚላክ'}
                </span>
              </div>

              {paymentApiError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{paymentApiError}</span>
                </div>
              )}

              {/* Row 1: Full Name and Mobile Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                    <span>{language === 'en' ? 'Recipient Full Name *' : 'ሙሉ ስም *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'e.g. Dawit Abera' : 'ለምሳሌ ዳዊት አበራ'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest">
                    <span>{language === 'en' ? 'Ethiopian Mobile Phone *' : 'የስልክ ቁጥር *'}</span>
                    {customerPhone.startsWith('+2519') || customerPhone.startsWith('09') ? (
                      <span className="text-[8.5px] font-extrabold text-emerald-600 dark:text-emerald-400">Ethio telecom (Telebirr)</span>
                    ) : customerPhone.startsWith('+2517') || customerPhone.startsWith('07') ? (
                      <span className="text-[8.5px] font-extrabold text-blue-600 dark:text-blue-400">Safaricom (M-PESA)</span>
                    ) : null}
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="+251912345678 or 0912345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 2: Sub-City Selection & Estimated Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                    <span>{language === 'en' ? 'Sub-City / Area (Addis Ababa) *' : 'ክፍለ ከተማ / አካባቢ *'}</span>
                    <span className="text-[#0052FF] font-bold">
                      +{SUB_CITIES.find(sc => sc.id === selectedSubCity)?.fee || 100} ETB
                    </span>
                  </label>
                  <select
                    required
                    value={selectedSubCity}
                    onChange={(e) => setSelectedSubCity(e.target.value)}
                    className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all font-bold cursor-pointer"
                  >
                    {SUB_CITIES.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {language === 'en' ? sc.nameEn : sc.nameAm} (+{sc.fee} ETB • {language === 'en' ? sc.timeEn : sc.timeAm})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest">
                    {language === 'en' ? 'Estimated Courier Dispatch' : 'ግምታዊ የማድረሻ ጊዜ'}
                  </label>
                  <div className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 font-bold flex items-center justify-between h-[34px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Truck className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                      <span className="truncate">
                        {SUB_CITIES.find(sc => sc.id === selectedSubCity)?.nameEn.split(' ')[0]} Express
                      </span>
                    </div>
                    <span className="font-mono text-[#0052FF] text-[11px] shrink-0">
                      {language === 'en'
                        ? (SUB_CITIES.find(sc => sc.id === selectedSubCity)?.timeEn || '1-2 Hours')
                        : (SUB_CITIES.find(sc => sc.id === selectedSubCity)?.timeAm || 'ከ1-2 ሰዓት')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Prominent Landmark */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{language === 'en' ? 'Prominent Landmark / Area Description *' : 'የሚታወቅ መለያ ቦታ / አካባቢ *'}</span>
                  </label>
                  <span className="text-[8.5px] text-gray-400">Required for Ethiopian courier</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder={language === 'en'
                    ? 'e.g. Behind Edna Mall, Near Bole Medhanialem Church, Beside CBE Atlas Branch'
                    : 'ለምሳሌ፡ ከኤድና ሞል ጀርባ፣ ከመድኃኔዓለም ቤተክርስቲያን አጠገብ፣ ከአትላስ ሲቢኢ ቅርንጫፍ ጎን'}
                  value={customerLandmark}
                  onChange={(e) => setCustomerLandmark(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all font-semibold"
                />
                <p className="text-[8.5px] text-gray-400 leading-tight">
                  {language === 'en'
                    ? 'Our delivery dispatchers navigate using prominent landmarks, banks, commercial malls, or churches.'
                    : 'አድራሾቻችን የሚታወቁ ሕንጻዎችን፣ ባንኮችን ወይም ታዋቂ ቦታዎችን ተጠቅመው በቀላሉ ያደርሳሉ።'}
                </p>
              </div>

              {/* Row 4: Specific Door / Street / Floor Notes */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                  <span>{language === 'en' ? 'House #, Floor or Delivery Instructions (Optional)' : 'የቤት ቁጥር፣ ፎቅ ወይም ተጨማሪ መመሪያ (አማራጭ)'}</span>
                </label>
                <textarea
                  placeholder={language === 'en' ? 'e.g. Building 4B, 3rd Floor, Office 302 / Call upon arrival' : 'ምሳሌ፡ ሕንጻ 4B፣ 3ኛ ፎቅ፣ ቢሮ 302 / ሲደርሱ ይደውሉ'}
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all"
                />
              </div>

              {/* Secured Escrow Reassurance Banner */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-emerald-50/70 to-purple-50/80 dark:from-blue-950/30 dark:via-emerald-950/30 dark:to-purple-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-900 dark:text-white block leading-tight">
                      {language === 'en' ? 'Secured Escrow Checkout Protection' : 'የተረጋገጠ የካስማ ኤስክሮው ክፍያ ዋስትና'}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 block leading-tight mt-0.5">
                      {language === 'en' ? 'Funds held in escrow custody until doorstep inspection & courier PIN code entry' : 'እቃው ደጃፍዎ ደርሶ በፒን እስኪረጋገጥ ክፍያዎ በባንክ ዋስትና ይቆያል'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-[#0052FF] text-white text-[9px] font-black">telebirr</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#7B1FA2] text-white text-[9px] font-black">CBE Birr</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black">100% Escrow</span>
                </div>
              </div>

              {/* Section 2: Integrated Payment Methods */}
              <h4 className="font-bold text-gray-900 dark:text-zinc-200 text-[10px] border-b border-gray-100 dark:border-zinc-800 pb-2 uppercase tracking-widest pt-2">
                {language === 'en' ? '2. Integrated Payment Methods & Gateways' : '2. የተቀናጁ የክፍያ መንገዶች'}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  id="payment-method-telebirr"
                  onClick={() => setPaymentMethod('TELEBIRR')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === 'TELEBIRR'
                    ? 'border-[#004C61] bg-[#004C61]/10 dark:bg-[#004C61]/25 ring-2 ring-[#004C61]/30 shadow-xs'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                    }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#003B4A] via-[#005B73] to-[#00A3E0] text-white font-mono font-black text-xs flex items-center justify-center shadow-xs border border-white/30">
                    <span className="text-[#FFD23F] font-black">t</span>
                    <span className="text-white font-black">b</span>
                  </div>
                  <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">telebirr</span>
                  <span className="text-[8.5px] text-gray-400 dark:text-zinc-400 font-medium">*127# Push</span>
                </button>

                <button
                  type="button"
                  id="payment-method-bank"
                  onClick={() => setPaymentMethod('BANK')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === 'BANK'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30 shadow-xs'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                    }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs border border-white/20">
                    <Building2 className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">Bank Transfer</span>
                  <span className="text-[8.5px] text-indigo-700 dark:text-indigo-300 font-medium">CBE / BoA / Slip</span>
                </button>

                <button
                  type="button"
                  id="payment-method-cod"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === 'COD'
                    ? 'border-[#229ED9] bg-[#229ED9]/10 dark:bg-[#229ED9]/25 ring-2 ring-[#229ED9]/30 shadow-xs'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                    }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#229ED9] via-sky-600 to-blue-700 text-white font-black text-xs flex items-center justify-center shadow-xs border border-white/30">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">Cash / CoD</span>
                  <span className="text-[8.5px] text-gray-400 dark:text-zinc-400 font-medium">Telegram Deal</span>
                </button>

                <button
                  type="button"
                  id="payment-method-cbe"
                  onClick={() => setPaymentMethod('CBE_BIRR')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === 'CBE_BIRR'
                    ? 'border-purple-800 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-600/30 shadow-xs'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                    }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-amber-300 font-mono font-black text-[9px] flex items-center justify-center shadow-xs border border-amber-400/40">
                    CBE
                  </div>
                  <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">CBE Birr</span>
                  <span className="text-[8.5px] text-purple-700 dark:text-purple-300 font-medium">*847# Chapa</span>
                </button>

                <button
                  type="button"
                  id="payment-method-chapa"
                  onClick={() => setPaymentMethod('CHAPA')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === 'CHAPA'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-600/30 shadow-xs'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                    }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-500 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs border border-white/30">
                    <span className="text-[#00FF9D] tracking-tighter font-extrabold">Ch</span>
                  </div>
                  <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">Chapa (ጫፓ)</span>
                  <span className="text-[8.5px] text-gray-400 dark:text-zinc-400 font-medium">Cards & Banks</span>
                </button>
              </div>

              {/* COD Merchant Deal Callout Banner */}
              {paymentMethod === 'COD' && (
                <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 space-y-3 text-left animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-sky-500 text-white">
                        <Send className="w-4 h-4" />
                      </span>
                      <div>
                        <h5 className="font-black text-xs text-sky-950 dark:text-sky-200">
                          {language === 'en' ? 'Direct Merchant Deal & Instant Approval' : 'የነጋዴ ቀጥታ ስምምነት እና ማረጋገጫ'}
                        </h5>
                        <p className="text-[10px] text-sky-800/80 dark:text-sky-300/80">
                          {language === 'en'
                            ? `Connect directly with ${cart[0]?.product?.merchantName || 'Kasma Electronics Hub'} on Telegram or WhatsApp to agree on COD delivery.`
                            : `የእጅ በእጅ ክፍያ ዝርዝር ከነጋዴው ጋር በቴሌግራም ወይም በዋትስአፕ በቀጥታ ይስማሙ።`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 shrink-0">
                      3-Click Fast Deal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      id="cod-telegram-deal-btn"
                      href={`https://t.me/kasma_admin?text=${encodeURIComponent(
                        `Hello! I am ${customerName || 'Abebe Kebede'}. I would like to confirm my Cash on Delivery order for ${cart[0]?.product?.nameEn || 'Tech Product'} (${cartTotal.toLocaleString()} ETB) to ${selectedSubCity}, Landmark: ${customerLandmark || 'Near Medhanialem'}. Phone: ${customerPhone}. Please approve dispatch!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMerchantTelegramConfirmed(true)}
                      className="py-2.5 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1d8ebd] text-white font-extrabold text-[11px] flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? '💬 Deal on Telegram' : '💬 በቴሌግራም ስምምነት አድርግ'}</span>
                    </a>

                    <a
                      id="cod-whatsapp-deal-btn"
                      href={`https://wa.me/251911223344?text=${encodeURIComponent(
                        `Hello! I am ${customerName || 'Abebe Kebede'}. I would like to confirm my Cash on Delivery order for ${cart[0]?.product?.nameEn || 'Tech Product'} (${cartTotal.toLocaleString()} ETB) to ${selectedSubCity}, Landmark: ${customerLandmark || 'Near Medhanialem'}. Phone: ${customerPhone}. Please approve dispatch!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMerchantTelegramConfirmed(true)}
                      className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[11px] flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? '💬 Deal on WhatsApp' : '💬 በዋትስአፕ ስምምነት አድርግ'}</span>
                    </a>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] font-bold text-sky-950 dark:text-sky-200 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      id="cod-merchant-approved-check"
                      checked={merchantTelegramConfirmed}
                      onChange={(e) => setMerchantTelegramConfirmed(e.target.checked)}
                      className="rounded text-[#0052FF] focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>
                      {language === 'en'
                        ? '✅ Merchant Deal Approved (Immediate Dispatch with Assigned Courier)'
                        : '✅ ከነጋዴው ጋር ስምምነት ተደርጓል (መልዕክተኛ ተመድቦ ወዲያው ይላክ)'}
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-zinc-400 font-medium">
                  <span>{language === 'en' ? 'Cart Subtotal:' : 'የእቃዎች ድምር:'}</span>
                  <span className="font-mono text-gray-900 dark:text-zinc-200 font-bold">{cartSubtotal.toLocaleString()} ETB</span>
                </div>
                {activeDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{language === 'en' ? `Promo discount (${appliedPromo?.code}):` : `የቅናሽ መጠን (${appliedPromo?.code}):`}</span>
                    <span className="font-mono">-{activeDiscount.toLocaleString()} ETB</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 dark:text-zinc-400 font-medium">
                  <span>{language === 'en' ? 'Shipping Fee:' : 'የማጓጓዣ ዋጋ:'}</span>
                  <span className="font-mono text-gray-900 dark:text-zinc-200 font-bold">{shippingFee.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between font-extrabold text-gray-900 dark:text-white text-sm pt-2 border-t border-gray-100 dark:border-zinc-800 items-center">
                  <span>{language === 'en' ? 'Total Payable:' : 'ጠቅላላ ክፍያ:'}</span>
                  <span className="text-lg font-black text-[#0052FF] dark:text-blue-400 font-mono">{cartTotal.toLocaleString()} ETB</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isInitializingPayment}
                className="w-full bg-[#0052FF] hover:bg-blue-600 active:scale-[0.99] text-white font-black py-3.5 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-60"
              >
                {isInitializingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{language === 'en' ? 'Connecting to Payment API...' : 'ከክፍያ ጌትዌይ ጋር በመገናኘት ላይ...'}</span>
                  </>
                ) : paymentMethod === 'COD' ? (
                  <>
                    <Truck className="w-4 h-4 text-white" />
                    <span>{language === 'en' ? 'Confirm Cash on Delivery Order' : 'በትዕዛዝ ማረጋገጫ ይቀጥሉ'}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-white" />
                    <span>{language === 'en' ? `Initialize ${paymentMethod === 'CBE_BIRR' ? 'CBE Birr' : paymentMethod === 'TELEBIRR' ? 'Telebirr' : paymentMethod} Payment API` : `ወደ ${paymentMethod} የክፍያ ገፅ ይቀጥሉ`}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {paymentStep === 'GATEWAY' && (
            <div className="py-2 space-y-5 text-left">
              <div className="space-y-4">
                <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl border border-gray-200/70 dark:border-zinc-700">
                  <button
                    type="button"
                    id="tab-qr-code"
                    onClick={() => setGatewayPaymentTab('QR')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${gatewayPaymentTab === 'QR'
                      ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-xs border border-gray-200/80 dark:border-zinc-700 font-black'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
                      }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#0052FF]" />
                    <span>{language === 'en' ? 'Scan QR' : 'የQR ኮድ'}</span>
                  </button>
                  <button
                    type="button"
                    id="tab-direct-mobile"
                    onClick={() => setGatewayPaymentTab('DIRECT')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${gatewayPaymentTab === 'DIRECT'
                      ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-xs border border-gray-200/80 dark:border-zinc-700 font-black'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
                      }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'en' ? 'Direct Mobile' : 'የስልክ ክፍያ'}</span>
                  </button>
                  <button
                    type="button"
                    id="tab-bank-slip-upload"
                    onClick={() => setGatewayPaymentTab('BANK_RECEIPT')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${gatewayPaymentTab === 'BANK_RECEIPT'
                      ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-xs border border-gray-200/80 dark:border-zinc-700 font-black'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
                      }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{language === 'en' ? 'Bank & Receipt' : 'ባንክ እና ደረሰኝ'}</span>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[8.5px] px-1 py-0.2 rounded-full font-bold">Upload</span>
                  </button>
                </div>

                {gatewayPaymentTab === 'QR' ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl text-white shadow-xs relative overflow-hidden ${paymentMethod === 'TELEBIRR'
                      ? 'bg-gradient-to-r from-[#004C61] via-[#00607A] to-[#0D1F2D]'
                      : paymentMethod === 'CBE_BIRR'
                        ? 'bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950'
                        : 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950'
                      }`}>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                            <QrCode className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-sm text-white uppercase tracking-wider">
                                {paymentMethod === 'TELEBIRR'
                                  ? 'telebirr Quick QR Pay'
                                  : paymentMethod === 'CBE_BIRR'
                                    ? 'CBE Birr Instant QR Pay'
                                    : 'Chapa Unified Gateway'}
                              </h4>
                              <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold">API CONNECTED</span>
                            </div>
                            <p className="text-[10px] text-white/80">
                              {paymentMethod === 'TELEBIRR'
                                ? (language === 'en' ? 'Scan with ethio telecom telebirr SuperApp' : 'በቴሌብር ሞባይል አፕ ስካን ያድርጉ')
                                : paymentMethod === 'CBE_BIRR'
                                  ? (language === 'en' ? 'Commercial Bank of Ethiopia (CBE Birr via Chapa/ArifPay)' : 'በሲቢኢ ብር ሞባይል አፕ ወይም *847# ስካን ያድርጉ')
                                  : (language === 'en' ? 'Supports Telebirr, CBE Birr & Debit Cards' : 'በቴሌብር፣ ሲቢኢ ብር እና ባንክ ካርዶች የሚሰራ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-[9px] text-white/70 block uppercase font-bold">{language === 'en' ? 'Total Amount' : 'ጠቅላላ ዋጋ'}</span>
                          <span className="text-base font-black text-white">{cartTotal.toLocaleString()} ETB</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/70 dark:bg-zinc-800/50 border border-gray-200/80 dark:border-zinc-700/70 rounded-3xl p-5 text-center space-y-4 relative overflow-hidden">
                      <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-gray-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-wider">
                          <span>{language === 'en' ? 'Active Gateway Rails' : 'ገቢር የክፍያ መንገዶች'}</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Chapa / ArifPay Integrated</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${paymentMethod === 'TELEBIRR'
                            ? 'bg-[#004C61]/10 border-[#004C61] ring-1 ring-[#004C61]/30 text-[#004C61] font-black'
                            : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 opacity-70'
                            }`}>
                            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#003B4A] via-[#005B73] to-[#00A3E0] text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0 border border-white/20">
                              <span className="text-[#FFD23F] font-black">t</span>
                              <span className="text-white font-black">b</span>
                            </div>
                            <span className="text-[11px] font-extrabold tracking-tight">telebirr</span>
                            {paymentMethod === 'TELEBIRR' && <span className="w-1.5 h-1.5 rounded-full bg-[#004C61] animate-pulse" />}
                          </div>

                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${paymentMethod === 'CBE_BIRR'
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-800 ring-1 ring-purple-600/30 text-purple-900 dark:text-purple-300 font-black'
                            : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 opacity-70'
                            }`}>
                            <div className="w-5 h-5 rounded-lg bg-purple-900 text-amber-400 font-mono font-black text-[8px] flex items-center justify-center shrink-0 border border-purple-700">
                              CBE
                            </div>
                            <span className="text-[11px] font-extrabold tracking-tight">CBE Birr</span>
                            {paymentMethod === 'CBE_BIRR' && <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />}
                          </div>

                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${paymentMethod === 'CHAPA'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 ring-1 ring-emerald-600/30 text-emerald-800 dark:text-emerald-300 font-black'
                            : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 opacity-70'
                            }`}>
                            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-500 text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0 border border-white/20">
                              <span className="text-[#00FF9D] tracking-tighter font-black">Ch</span>
                            </div>
                            <span className="text-[11px] font-extrabold tracking-tight">Chapa</span>
                            {paymentMethod === 'CHAPA' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
                          </div>

                          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-[10.5px] font-bold">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            <span>Cards</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-200/90 group">
                        <QRCodeSVG
                          value={activePaymentSession?.qrPayload || (paymentMethod === 'TELEBIRR'
                            ? `telebirr://pay?merchant=KASMA_ENTERPRISE&amount=${cartTotal}&ref=${qrReferenceTx}&phone=${encodeURIComponent(customerPhone)}`
                            : paymentMethod === 'CBE_BIRR'
                              ? `cbebirr://pay?merchant=KASMA_SHOP&amount=${cartTotal}&ref=${qrReferenceTx}`
                              : `https://checkout.chapa.co/pay/ch_tx_${qrReferenceTx}?amount=${cartTotal}&currency=ETB&email=getchze1221%40gmail.com`
                          )}
                          size={185}
                          level="H"
                          includeMargin={true}
                          fgColor={paymentMethod === 'TELEBIRR' ? '#004C61' : paymentMethod === 'CBE_BIRR' ? '#3B0764' : '#047857'}
                          bgColor="#FFFFFF"
                        />

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 bg-white rounded-full shadow-md border-2 border-gray-800 flex items-center justify-center p-1">
                            {paymentMethod === 'TELEBIRR' ? (
                              <span className="text-[10px] font-black text-[#004C61] tracking-tighter">tb</span>
                            ) : paymentMethod === 'CBE_BIRR' ? (
                              <span className="text-[9px] font-black text-purple-900 tracking-tighter">CBE</span>
                            ) : (
                              <span className="text-[10px] font-black text-emerald-700 tracking-tighter">Ch</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-zinc-300 font-semibold bg-white/90 dark:bg-zinc-900 py-1.5 px-3 rounded-full border border-gray-200/60 dark:border-zinc-700 max-w-xs mx-auto shadow-2xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-[11px] truncate">
                          {language === 'en' ? 'Awaiting camera scan / mobile authorization...' : 'የስልክ ስካን / ፈቃድ በመጠባበቅ ላይ...'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-200/70 dark:border-zinc-800 text-left">
                        <div>
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">{language === 'en' ? 'Merchant / Rail' : 'የነጋዴ ስም'}</span>
                          <span className="font-extrabold text-gray-900 dark:text-white truncate block">
                            {paymentMethod === 'CBE_BIRR' ? 'KASMA CBE BIRR PAY' : 'KASMA SHOP ENTERPRISE'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">{language === 'en' ? 'Transaction Ref' : 'መለያ ቁጥር'}</span>
                          <span className="font-mono font-black text-[#0052FF] dark:text-blue-400 truncate block">
                            {activePaymentSession?.txRef || qrReferenceTx}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const payload = activePaymentSession?.checkoutUrl || activePaymentSession?.directPaymentUrl || (paymentMethod === 'TELEBIRR'
                              ? `telebirr://pay?merchant=KASMA_ENTERPRISE&amount=${cartTotal}&ref=${qrReferenceTx}`
                              : paymentMethod === 'CBE_BIRR'
                                ? `https://checkout.chapa.co/pay/cbe_${qrReferenceTx}?amount=${cartTotal}&currency=ETB`
                                : `https://checkout.chapa.co/pay/ch_tx_${qrReferenceTx}?amount=${cartTotal}`);
                            navigator.clipboard.writeText(payload);
                            setCopiedQrLink(true);
                            showToast(
                              language === 'en' ? 'Payment Session Link copied to clipboard!' : 'የክፍያ ሊንኩ ተቀድቷል!',
                              'success'
                            );
                            setTimeout(() => setCopiedQrLink(false), 2500);
                          }}
                          className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 text-gray-700 dark:text-zinc-200 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          {copiedQrLink ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{language === 'en' ? 'Copied!' : 'ተቀድቷል!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                              <span>{language === 'en' ? 'Copy Pay Link' : 'ሊንኩን ቅዳ'}</span>
                            </>
                          )}
                        </button>

                        {(paymentMethod === 'TELEBIRR' || paymentMethod === 'CBE_BIRR') && (
                          <button
                            type="button"
                            onClick={() => {
                              const ussd = paymentMethod === 'TELEBIRR' ? '*127#' : '*847#';
                              navigator.clipboard.writeText(ussd);
                              showToast(
                                language === 'en' ? `USSD ${ussd} copied! Dial in your Phone App.` : `USSD ${ussd} ተቀድቷል! በስልክዎ ይደውሉ`,
                                'info'
                              );
                            }}
                            className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-[10px] font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5 text-purple-600" />
                            <span>Dial {paymentMethod === 'TELEBIRR' ? '*127#' : '*847#'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const link = activePaymentSession?.checkoutUrl || activePaymentSession?.directPaymentUrl || (paymentMethod === 'TELEBIRR'
                              ? `https://telebirr.ethiotelecom.et/checkout?ref=${qrReferenceTx}&amount=${cartTotal}`
                              : paymentMethod === 'CBE_BIRR'
                                ? `https://checkout.chapa.co/pay/cbe_${qrReferenceTx}?amount=${cartTotal}&currency=ETB`
                                : `https://checkout.chapa.co/pay/ch_tx_${qrReferenceTx}?amount=${cartTotal}`);
                            window.open(link, '_blank');
                          }}
                          className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 text-gray-700 dark:text-zinc-200 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                          <span>{language === 'en' ? 'Open App Checkout' : 'በአፕሊኬሽን ክፈት'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-3.5 rounded-2xl text-[11px] text-amber-950 dark:text-amber-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>{language === 'en' ? 'Payment Authorization Steps:' : 'የክፍያ ማረጋገጫ ቅደም-ተከተል፡'}</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-amber-900/80 dark:text-amber-200/80 font-medium text-[10.5px] leading-relaxed">
                        <li>
                          {paymentMethod === 'TELEBIRR'
                            ? (language === 'en' ? 'Open Telebirr SuperApp and approve the push notification prompt, or dial *127#.' : 'የቴሌብር አፕሊኬሽን ይክፈቱ ወይም በስልክዎ *127# ይደውሉ።')
                            : paymentMethod === 'CBE_BIRR'
                              ? (language === 'en' ? 'Open CBE Birr app or dial *847# on your mobile phone to approve the payment.' : 'የሲቢኢ ብር አፕሊኬሽን ይክፈቱ ወይም በስልክዎ *847# በመደወል ያረጋግጡ።')
                              : (language === 'en' ? 'Scan QR or proceed on Chapa hosted checkout.' : 'በስክሪኑ ላይ ያለውን የQR ኮድ ስካን ያድርጉ ወይም ጫፓን ይጠቀሙ።')}
                        </li>
                        <li>
                          {language === 'en'
                            ? `Confirm total amount of ${cartTotal.toLocaleString()} ETB, then click "Verify with Payment Gateway API" below.`
                            : `የ${cartTotal.toLocaleString()} ብር ክፍያውን ካረጋገጡ በኋላ ከታች ያለውን "በክፍያ ጌትዌይ አረጋግጥ" ይጫኑ።`}
                        </li>
                      </ol>
                    </div>
                  </div>
                ) : gatewayPaymentTab === 'DIRECT' ? (
                  <div className="space-y-4">
                    {paymentMethod === 'TELEBIRR' ? (
                      <div className="space-y-4 text-center">
                        <div className="bg-[#2563EB]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                          <Phone className="w-8 h-8 text-[#2563EB] animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#2563EB] text-lg">telebirr Direct Push Gateway</h4>
                          <p className="text-xs text-gray-500 mt-1">Secure instant connection to ethio telecom mobile payment system.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 text-left text-xs space-y-2">
                          <div className="flex justify-between"><span className="text-gray-500">Merchant Name:</span><span className="font-bold">KASMA SHOP LTD</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Payer Phone:</span><span className="font-bold font-mono">{customerPhone}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">USSD Direct Code:</span><span className="font-mono font-bold text-[#0052FF]">*127# (Option 3: Pay Merchant)</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Amount (ETB):</span><span className="font-bold text-black dark:text-white font-mono">{cartTotal.toLocaleString()} ETB</span></div>
                        </div>
                      </div>
                    ) : paymentMethod === 'CBE_BIRR' ? (
                      <div className="space-y-4 text-center">
                        <div className="bg-purple-100 dark:bg-purple-950/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-purple-200">
                          <Building2 className="w-8 h-8 text-purple-700 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-purple-900 dark:text-purple-300 text-lg">CBE Birr Instant Direct Gateway</h4>
                          <p className="text-xs text-gray-500 mt-1">Commercial Bank of Ethiopia payment rail via Chapa/ArifPay API.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 text-left text-xs space-y-2">
                          <div className="flex justify-between"><span className="text-gray-500">CBE Birr Merchant:</span><span className="font-bold">KASMA SHOP LTD (CBE Pay)</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Payer Phone:</span><span className="font-bold font-mono">{customerPhone}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">CBE USSD Code:</span><span className="font-mono font-bold text-purple-700">*847# (Pay Bill / Merchant)</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Total Payable:</span><span className="font-black text-purple-900 dark:text-purple-300 font-mono">{cartTotal.toLocaleString()} ETB</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                          <CreditCard className="w-8 h-8 text-emerald-600 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-emerald-700 text-lg">Chapa (ጫፓ) Gateway</h4>
                          <p className="text-xs text-gray-500 mt-1">Supports CBE Birr, Awash Bank, and international credit cards.</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 text-left text-xs space-y-2">
                          <div className="flex justify-between"><span className="text-gray-500">Chapa Reference:</span><span className="font-mono font-semibold">{activePaymentSession?.txRef || qrReferenceTx}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Total Amount:</span><span className="font-black text-emerald-700 font-mono">{cartTotal.toLocaleString()} ETB</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Customer Delivery:</span><span className="font-semibold">{selectedSubCity} • {customerLandmark}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* BANK RECEIPT & SCREENSHOT UPLOAD TAB */}
                {gatewayPaymentTab === 'BANK_RECEIPT' && (
                  <div className="space-y-4 text-left animate-fade-in">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-white/15">
                            <Building2 className="w-4 h-4 text-amber-300" />
                          </span>
                          <div>
                            <h4 className="font-black text-sm text-white">
                              {language === 'en' ? 'Direct Ethiopian Bank Transfer' : 'የኢትዮጵያ የባንክ ሂሳቦች'}
                            </h4>
                            <p className="text-[10px] text-blue-200">
                              {language === 'en' ? 'Transfer via CBE Mobile, CBE Birr, BoA, or Telebirr' : 'በባንክ አፕ ወይም በቴሌብር በቀጥታ ይክፈሉ'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-[9px] text-blue-200 block uppercase font-bold">{language === 'en' ? 'Total Payable' : 'ጠቅላላ ክፍያ'}</span>
                          <span className="text-base font-black text-white">{cartTotal.toLocaleString()} ETB</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBank('CBE')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${selectedBank === 'CBE'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 ring-2 ring-purple-500/30'
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                          }`}
                      >
                        <span className="font-black text-xs text-purple-900 dark:text-purple-300 block">CBE</span>
                        <span className="text-[9px] text-gray-500 dark:text-zinc-400">Commercial Bank</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank('BOA')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${selectedBank === 'BOA'
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/50 ring-2 ring-amber-500/30'
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                          }`}
                      >
                        <span className="font-black text-xs text-amber-900 dark:text-amber-300 block">Abyssinia</span>
                        <span className="text-[9px] text-gray-500 dark:text-zinc-400">Bank of Abyssinia</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank('AWASH')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${selectedBank === 'AWASH'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-500/30'
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                          }`}
                      >
                        <span className="font-black text-xs text-blue-900 dark:text-blue-300 block">Awash</span>
                        <span className="text-[9px] text-gray-500 dark:text-zinc-400">Awash Bank</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-gray-400 block">
                            {selectedBank === 'CBE' ? 'Commercial Bank of Ethiopia (CBE)' : selectedBank === 'BOA' ? 'Bank of Abyssinia' : 'Awash International Bank'}
                          </span>
                          <span className="font-mono font-black text-sm text-gray-900 dark:text-white">
                            {selectedBank === 'CBE' ? '1000123456789' : selectedBank === 'BOA' ? '88392019' : '01320495820100'}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">
                            Account Holder: <strong className="text-gray-800 dark:text-zinc-200">Kasma Tech Shop Enterprise</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const acc = selectedBank === 'CBE' ? '1000123456789' : selectedBank === 'BOA' ? '88392019' : '01320495820100';
                            navigator.clipboard.writeText(acc);
                            showToast(language === 'en' ? `Account #${acc} copied to clipboard!` : `የሂሳብ ቁጥር ${acc} ተቀድቷል!`, 'success');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                          <span>{language === 'en' ? 'Copy Account #' : 'ቁጥሩን ቅዳ'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>{language === 'en' ? 'Upload Payment Screenshot / Transfer Slip *' : 'የክፍያ ደረሰኝ ስክሪንሾት ይጫኑ *'}</span>
                        </span>
                        {paymentScreenshot && (
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Receipt Attached</span>
                          </span>
                        )}
                      </label>

                      <input
                        type="file"
                        id="payment-screenshot-file-input"
                        accept="image/*"
                        onChange={handleScreenshotFileChange}
                        className="hidden"
                      />

                      {paymentScreenshot ? (
                        <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={paymentScreenshot}
                              alt="Payment Screenshot Preview"
                              className="w-14 h-14 object-cover rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs shrink-0 bg-white"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200 truncate">
                                {paymentScreenshotName || 'payment_receipt.png'}
                              </p>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                {language === 'en' ? 'Screenshot verified & ready for review' : 'ደረሰኙ ለፍተሻ ተዘጋጅቷል'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => document.getElementById('payment-screenshot-file-input')?.click()}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-300 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 cursor-pointer"
                            >
                              {language === 'en' ? 'Change' : 'ቀይር'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentScreenshot(null);
                                setPaymentScreenshotName('');
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => document.getElementById('payment-screenshot-file-input')?.click()}
                          className="border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-[#0052FF] p-4 rounded-2xl text-center space-y-2 cursor-pointer bg-gray-50/50 dark:bg-zinc-900/50 transition-all hover:bg-blue-50/20"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                              {language === 'en' ? 'Click to upload payment screenshot (JPEG/PNG)' : 'የደረሰኝ ስክሪንሾት ለመጫን እዚህ ይጫኑ'}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {language === 'en' ? 'Take a screenshot of your CBE / Telebirr confirmation SMS or app' : 'ከስልክዎ ወይም ከአፕሊኬሽኑ የተገኘውን ማረጋገጫ ያያይዙ'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          id="demo-attach-screenshot-btn"
                          onClick={handleUseDemoScreenshot}
                          className="text-[10px] font-bold text-[#0052FF] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{language === 'en' ? '⚡ 1-Click Attach Sample Receipt (Demo)' : '⚡ የናሙና ደረሰኝ በ1-ጠቅታ አያይዝ'}</span>
                        </button>
                        <span className="text-[9px] text-gray-400">Min. 300x300px image</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
                        {language === 'en' ? 'Bank Transfer Reference / Transaction ID' : 'የባንክ መለያ ቁጥር (Transaction Ref)'}
                      </label>
                      <input
                        type="text"
                        id="bank-reference-input"
                        placeholder="e.g. FT2610294820 or CBE-984210"
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Shared Gateway Action Footer Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentStep('FORM')}
                  className="px-5 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                >
                  {language === 'en' ? 'Back to Address' : 'ወደ አድራሻ ተመለስ'}
                </button>
                {gatewayPaymentTab === 'BANK_RECEIPT' ? (
                  <button
                    type="button"
                    id="submit-bank-payment-btn"
                    onClick={() => {
                      if (!paymentScreenshot) {
                        handleUseDemoScreenshot();
                      }
                      completeOrder('PAID', bankReference || `bank_ref_${Date.now().toString(36)}`);
                      showToast(
                        language === 'en'
                          ? 'Payment screenshot submitted! Order is confirmed and courier assigned.'
                          : 'የክፍያ ደረሰኝ ተልኳል! ትዕዛዝዎ ተረጋግጦ መልዕክተኛ ተመድቧል።',
                        'success'
                      );
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white rounded-full text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{language === 'en' ? 'Submit Screenshot & Confirm Order 🔒' : 'ደረሰኝ አረጋግጥ እና ትዕዛዝ አጠናቅቅ 🔒'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleVerifyPaymentApi}
                    className="px-6 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white rounded-full text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-60"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>{language === 'en' ? 'Verifying with Payment API...' : 'ከክፍያ ጌትዌይ ጋር በማረጋገጥ ላይ...'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'en' ? 'Verify with Payment Gateway API ✔' : 'በክፍያ ጌትዌይ አረጋግጥ ✔'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {paymentStep === 'OTP' && (
            <div className="text-center py-6 space-y-5">
              <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-zinc-600 text-xs text-left">
                📱 <span className="font-bold text-black">Telebirr SMS OTP Sent!</span> We have dispatched a 6-digit verification code to <span className="font-mono font-bold text-black">{customerPhone}</span>.
              </div>
              <div className="space-y-1 text-left max-w-xs mx-auto">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center mb-1">
                  Enter 6-Digit Telebirr OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 840294"
                  value={telebirrOtp}
                  onChange={(e) => setTelebirrOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-[#0052FF] focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setPaymentStep('GATEWAY')}
                  className="px-5 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  disabled={isProcessingPayment}
                  onClick={handleVerifyOtp}
                  className="px-6 py-2 bg-black hover:bg-zinc-950 text-white rounded-full text-xs font-bold flex items-center gap-1.5 justify-center"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <span>Confirm Payment 🔒</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'SUCCESS' && (
            <div className="printable-receipt-modal text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mx-auto text-black">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gray-950 dark:text-white text-base">{language === 'en' ? 'Payment Confirmed Successfully!' : 'ክፍያዎ በስኬት ተጠናቋል!'}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {language === 'en'
                    ? 'Your payment was authorized and processed securely. Order is logged into system dispatch queues.'
                    : 'ክፍያዎ ተረጋግጧል፤ ትዕዛዝዎ ወደ ስርጭት ሂደት ገብቷል።'}
                </p>
              </div>

              {lastPlacedOrderId && (
                <div className="bg-kasma-blue/5 dark:bg-kasma-blue/10 border border-kasma-blue/15 rounded-2xl p-4 text-center space-y-2">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {language === 'en' ? 'Your Order Reference' : 'የእርስዎ ትዕዛዝ ቁጥር'}
                  </p>
                  <p className="text-xl font-mono font-black text-kasma-blue tracking-widest">{lastPlacedOrderId}</p>
                  <div className="no-print-action flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                      title={language === 'en' ? 'Print Official Order Receipt' : 'የገበያ ደረሰኝ አትም'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Print Receipt' : 'ደረሰኝ አትም'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setTrackOrderId(lastPlacedOrderId);
                        const found = allOrders.find(o => o.id === lastPlacedOrderId);
                        setTrackedOrder(found || null);
                        setHasSearchedOrder(true);
                        setIsCheckoutOpen(false);
                        setIsOrderStatusOpen(true);
                      }}
                      className="px-4 py-1.5 bg-[#0052FF] text-white hover:bg-[#003ecf] font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Track Shipment' : 'ጭነቱን ይከታተሉ'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setIsMyOrdersOpen(true);
                      }}
                      className="px-4 py-1.5 bg-gray-900 text-white hover:bg-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'en' ? 'View My Orders' : 'የእኔን ትዕዛዞች ይመልከቱ'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Assigned Delivery Personnel Card */}
              <div id="assigned-delivery-personnel-card" className="no-print-action text-left p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 dark:border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider block">
                        {language === 'en' ? 'Assigned Express Courier' : 'የተመደበ ፈጣን መልዕክተኛ'}
                      </span>
                      <h4 className="font-black text-sm text-gray-900 dark:text-white">
                        {lastPlacedOrder?.deliveryPersonnel?.name || 'Dawit Bekele'}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {language === 'en' ? '⚡ DISPATCH EN ROUTE' : '⚡ በመንገድ ላይ'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-200/60 dark:border-emerald-900/40 space-y-0.5">
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">{language === 'en' ? 'Courier Mobile' : 'የመልዕክተኛ ስልክ'}</span>
                    <a href={`tel:${lastPlacedOrder?.deliveryPersonnel?.phone || '+251911998877'}`} className="font-mono font-bold text-[#0052FF] hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{lastPlacedOrder?.deliveryPersonnel?.phone || '+251 91 199 8877'}</span>
                    </a>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-200/60 dark:border-emerald-900/40 space-y-0.5">
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">{language === 'en' ? 'Vehicle & Plate' : 'ተሽከርካሪ እና ታርጋ'}</span>
                    <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate block">
                      {lastPlacedOrder?.deliveryPersonnel?.vehicle || 'TVS Apache Electric Scooter (AA-3-48192)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/20">
                  <span className="text-gray-600 dark:text-zinc-300 font-medium">
                    {language === 'en' ? 'Estimated Arrival in Addis Ababa:' : 'የሚደርስበት ግምት፡'}
                  </span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {lastPlacedOrder?.deliveryPersonnel?.eta || '35-45 Minutes'}
                  </span>
                </div>
              </div>

              {/* Purchased Item Details Summary */}
              <div id="purchased-items-summary-card" className="text-left p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200/80 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-black uppercase text-gray-400 tracking-wider">
                  <span>{language === 'en' ? 'Purchased Items Summary' : 'የተገዙ እቃዎች ዝርዝር'}</span>
                  <span className="font-mono text-gray-900 dark:text-white">{lastPlacedOrder ? lastPlacedOrder.total.toLocaleString() : cartTotal.toLocaleString()} ETB</span>
                </div>

                <div className="divide-y divide-gray-150 dark:divide-zinc-800/80 max-h-40 overflow-y-auto pr-1">
                  {(lastPlacedOrder?.items || cart).map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={item.product?.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-white shrink-0 border border-gray-200 dark:border-zinc-800" />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate text-[11px]">{item.product?.nameEn}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity} • {item.variantName}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-900 dark:text-zinc-200 text-xs shrink-0">
                        {(item.price * item.quantity).toLocaleString()} ETB
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">{language === 'en' ? 'Payment Method:' : 'የክፍያ መንገድ፡'}</span>
                  <span className="font-black text-gray-900 dark:text-white uppercase font-mono">{lastPlacedOrder?.paymentMethod || paymentMethod}</span>
                </div>
              </div>

              {/* Delivery Dispatched Multi-Channel Status Badges */}
              <div id="dispatch-notifications-status-card" className="no-print-action grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-[10px] uppercase">
                    <span>📧</span>
                    <span>{language === 'en' ? 'Email Dispatched' : 'ኢሜይል ተልኳል'}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-zinc-400 truncate">
                    {customerEmail || 'abebe@gmail.com'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase">
                    <span>📱</span>
                    <span>{language === 'en' ? 'SMS Dispatched' : 'ኤስኤምኤስ ተልኳል'}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-zinc-400 truncate">
                    {customerPhone || '+251 91 122 3344'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold text-[10px] uppercase">
                    <span>✈️</span>
                    <span>{language === 'en' ? 'Telegram / WhatsApp' : 'ቴሌግራም/ዋትስአፕ'}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-zinc-400 truncate">
                    @KasmaShopBot Alert
                  </p>
                </div>
              </div>

              {/* Approximate Courier Location Mini-Map */}
              <div className="no-print-action text-left">
                <OrderCourierMiniMap
                  language={language}
                  shippingAddress={shippingAddress || 'Addis Ababa'}
                  subCity={selectedSubCity}
                  orderId={lastPlacedOrderId || 'KS-EXP'}
                  customerName={customerName}
                  onOpenFullMap={() => {
                    if (lastPlacedOrderId) {
                      setTrackOrderId(lastPlacedOrderId);
                      const found = allOrders.find(o => o.id === lastPlacedOrderId);
                      setTrackedOrder(found || null);
                      setHasSearchedOrder(true);
                      setIsCheckoutOpen(false);
                      setIsOrderStatusOpen(true);
                    }
                  }}
                />
              </div>

              {/* Telegram Notification Banner */}
              <div className="no-print-action bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-500/30 dark:border-sky-500/40 rounded-2xl p-3.5 text-left flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-sky-800 dark:text-sky-300 block">
                    {language === 'en' ? '📲 Telegram Receipt & Live Tracking Dispatched!' : '📲 የቴሌግራም ደረሰኝ እና የትራንስፖርት መከታተያ ተልኳል!'}
                  </span>
                  <p className="text-gray-600 dark:text-zinc-400 text-[11px] leading-tight">
                    {language === 'en'
                      ? `Order #${lastPlacedOrderId || 'latest'} receipt & live dispatch link sent to your Telegram via @KasmaShopBot.`
                      : `የትዕዛዝ #${lastPlacedOrderId || 'እነሆ'} ማረጋገጫ በቴሌግራም ቦት @KasmaShopBot ተልኳል።`}
                  </p>
                </div>
              </div>

              {/* Kasma Admin Telegram & WhatsApp Quick Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="https://t.me/kasma_admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#229ED9] hover:bg-[#1d8ebd] text-white font-bold py-3 px-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Send className="w-4 h-4 text-white shrink-0" />
                  <span className="truncate">{language === 'en' ? 'Telegram Admin' : 'በቴሌግራም ያግኙ'}</span>
                </a>
                <a
                  href={generateWhatsAppCustomerWelcomeUrl(cart, language, '251911223344', 'Order Confirmation Support')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
                  <span className="truncate">{language === 'en' ? 'Chat on WhatsApp' : 'በዋትስአፕ ያወሩን'}</span>
                </a>
              </div>

              {/* Stock alerting indicator */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 text-left flex gap-2 leading-relaxed">
                <span className="shrink-0 text-black">📢</span>
                <p>
                  <strong>Order Placed:</strong> Product inventory was updated, and your order has been dispatched for delivery.
                </p>
              </div>

              <button
                onClick={closeCheckoutFlow}
                className="w-full bg-black hover:bg-zinc-950 text-white font-bold py-3.5 rounded-full text-xs transition-all shadow-xs"
              >
                {language === 'en' ? 'Return to Store' : 'ወደ ገበያ ይመለሱ'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

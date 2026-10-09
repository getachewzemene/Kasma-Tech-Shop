import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Package, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Download,
  Star
} from 'lucide-react';
import { generateCustomerReceiptPDF } from '../../lib/pdfGenerator';
import { PostDeliveryReviewModal } from '../../components/orders/PostDeliveryReviewModal';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { orders, language } = useShop();

  const [orderIdInput, setOrderIdInput] = useState(id || '');
  const [phoneInput, setPhoneInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Perform search by Order ID and/or Phone
  const performLookup = useCallback(async (searchOrderId?: string, searchPhone?: string) => {
    const qOrderId = (searchOrderId !== undefined ? searchOrderId : orderIdInput).trim();
    const qPhone = (searchPhone !== undefined ? searchPhone : phoneInput).trim();

    if (!qOrderId && !qPhone) {
      if (orders && orders.length > 0) {
        setActiveOrder(orders[0]);
        setOrderIdInput(orders[0].id);
        setPhoneInput(orders[0].customerPhone);
      }
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const params = new URLSearchParams();
      if (qOrderId) params.append('orderId', qOrderId);
      if (qPhone) params.append('phone', qPhone);

      const res = await fetch(`/api/orders/track?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setActiveOrder(data.order);
          setOrderIdInput(data.order.id);
          setPhoneInput(data.order.customerPhone);
          return;
        }
      }

      // Fallback to local in-memory state lookup
      const cleanOrderId = qOrderId.toLowerCase();
      const cleanPhone = qPhone.replace(/[\s\-\+\(\)]/g, '');

      const found = orders.find(o => {
        const oId = (o.id || '').toLowerCase();
        const oPayId = (o.paymentId || '').toLowerCase();
        const oPhone = (o.customerPhone || '').replace(/[\s\-\+\(\)]/g, '');

        if (cleanOrderId && cleanPhone) {
          return (oId.includes(cleanOrderId) || oPayId.includes(cleanOrderId)) &&
                 (oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone));
        }
        if (cleanOrderId) {
          return oId.includes(cleanOrderId) || oPayId.includes(cleanOrderId);
        }
        if (cleanPhone) {
          return oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone);
        }
        return false;
      });

      if (found) {
        setActiveOrder(found);
      } else {
        setActiveOrder(null);
        setErrorMessage(
          language === 'en'
            ? 'No order found matching the provided Order ID and Phone number. Please check your confirmation SMS or Telegram message.'
            : 'በተሰጠው የትዕዛዝ መለያ እና ስልክ ቁጥር የተገኘ ትዕዛዝ የለም። እባክዎ የኤስኤምኤስ ወይም የቴሌግራም ማረጋገጫዎን ይመልከቱ።'
        );
      }
    } catch (err: any) {
      console.warn('Network lookup failed, falling back to local state:', err);
      const cleanOrderId = qOrderId.toLowerCase();
      const found = orders.find(o => o.id.toLowerCase().includes(cleanOrderId));
      if (found) {
        setActiveOrder(found);
      } else {
        setActiveOrder(null);
        setErrorMessage(language === 'en' ? 'Unable to reach tracking server.' : 'ከመከታተያ ሰርቨር ጋር መገናኘት አልተቻለም።');
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderIdInput, phoneInput, orders, language]);

  // Initial lookup on mount or route param change
  useEffect(() => {
    if (id) {
      setOrderIdInput(id);
      performLookup(id, '');
    } else if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
      setOrderIdInput(orders[0].id);
      setPhoneInput(orders[0].customerPhone);
    }
  }, [id, orders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      navigate(`/tracking/${encodeURIComponent(orderIdInput.trim())}`, { replace: true });
    }
    performLookup(orderIdInput, phoneInput);
  };

  const copyOrderId = () => {
    if (!activeOrder) return;
    navigator.clipboard.writeText(activeOrder.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getStepStatus = (stepIndex: number, currentStatus?: string) => {
    if (!currentStatus) return stepIndex === 0 ? 'completed' : 'pending';
    switch (currentStatus) {
      case 'DELIVERED':
        return 'completed';
      case 'SHIPPED':
        return stepIndex <= 2 ? 'completed' : 'pending';
      case 'PROCESSING':
        return stepIndex <= 1 ? 'completed' : 'pending';
      case 'PAID':
        return stepIndex <= 0 ? 'completed' : 'pending';
      case 'PENDING_PAYMENT':
      default:
        return stepIndex === 0 ? 'active' : 'pending';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Description */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[#0052FF] text-xs font-bold mb-1">
          <Truck className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Addis Ababa Express Logistics' : 'አዲስ አበባ ፈጣን ማድረስ'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">
          {language === 'en' ? 'Public Order & Courier Tracking' : 'የህዝብ ትዕዛዝ እና መልዕክተኛ መከታተያ'}
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-lg mx-auto">
          {language === 'en'
            ? 'Track real-time delivery status using your Ethiopian phone number and Order ID.'
            : 'የትዕዛዝዎን ሁኔታ በስልክ ቁጥርዎ እና በትዕዛዝ መለያ ቁጥርዎ በቀጥታ ይከታተሉ።'}
        </p>
      </div>

      {/* Dual Search Input Bar: Order ID + Phone */}
      <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Order ID Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Order ID (e.g. ord-1718...)' : 'የትዕዛዝ መለያ (ለምሳሌ ord-...)'}
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
            />
          </div>

          {/* Phone Number Input */}
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Phone (e.g. 0911223344)' : 'ስልክ ቁጥር (ለምሳሌ 0911...)'}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          <span>{language === 'en' ? 'Track Order Details' : 'ትዕዛዝ ፈልግ'}</span>
        </button>
      </form>

      {/* Error / Not Found Banner */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-bold">{language === 'en' ? 'Order Not Found' : 'ትዕዛዝ አልተገኘም'}</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Tracking Card Display */}
      {activeOrder && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-8 shadow-sm">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-150 dark:border-zinc-800 gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-black text-gray-900 dark:text-zinc-100 font-mono">
                  #{activeOrder.id}
                </span>
                <button
                  type="button"
                  onClick={copyOrderId}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 text-[10px] flex items-center gap-1 cursor-pointer"
                  title="Copy Order ID"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedId ? (language === 'en' ? 'Copied' : 'ተቀድቷል') : ''}</span>
                </button>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  activeOrder.status === 'DELIVERED'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                    : activeOrder.status === 'SHIPPED'
                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                    : activeOrder.status === 'PROCESSING'
                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                }`}>
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'en' ? 'Placed on' : 'የታዘዘበት ቀን'} {new Date(activeOrder.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} • {activeOrder.paymentMethod}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-xs text-gray-400 block">{language === 'en' ? 'Total Settlement' : 'ጠቅላላ ክፍያ'}</span>
              <span className="text-xl font-black text-[#0052FF]">{activeOrder.total.toLocaleString()} ETB</span>
              <button
                type="button"
                onClick={() => generateCustomerReceiptPDF(activeOrder, { language })}
                className="mt-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-gray-800 dark:text-zinc-200 font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group"
                title="Download Tax Receipt & Warranty PDF"
              >
                <Download className="w-3.5 h-3.5 text-[#0052FF] group-hover:-translate-y-0.5 transition-transform" />
                <span>{language === 'en' ? 'Tax Receipt & Warranty (PDF)' : 'የሽያጭ ደረሰኝ (PDF)'}</span>
              </button>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
              {language === 'en' ? 'Delivery Lifecycle Status' : 'የትዕዛዝ ጉዞ ደረጃዎች'}
            </h2>

            <div className="relative pl-7 sm:pl-9 border-l-2 border-gray-200 dark:border-zinc-800 space-y-8">
              {/* Step 1: Placed & Escrow Held */}
              <div className="relative">
                <div className="absolute -left-[32px] sm:-left-[40px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-900">
                  ✓
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Order Placed & Escrow Secured' : 'ትዕዛዝ ተረጋግጧል & ክፍያ ተይዟል'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    {language === 'en' 
                      ? `Protected checkout completed via ${activeOrder.paymentMethod}. Ref: ${activeOrder.paymentId || activeOrder.id}.`
                      : `በ${activeOrder.paymentMethod} የተረጋገጠ ክፍያ። መለያ: ${activeOrder.paymentId || activeOrder.id}`}
                  </p>
                </div>
              </div>

              {/* Step 2: Quality Inspection & Packing */}
              <div className="relative">
                <div className={`absolute -left-[32px] sm:-left-[40px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-900 ${
                  getStepStatus(1, activeOrder.status) === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                }`}>
                  {getStepStatus(1, activeOrder.status) === 'completed' ? '✓' : '2'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Merchant Quality Check & Packing' : 'የእቃ ጥራት ምርመራ እና ማሸግ'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    {activeOrder.packedAt
                      ? (language === 'en' ? `Packed on ${new Date(activeOrder.packedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with tamper-evident seal.` : `በፋብሪካ ማሸጊያ ታሽጓል።`)
                      : (language === 'en' ? 'Hardware serial logging & tamper-evident packaging by merchant.' : 'የምርት መለያ ተመዝግቦ በመታሸግ ላይ።')}
                  </p>
                </div>
              </div>

              {/* Step 3: Out for Delivery with Courier */}
              <div className="relative">
                <div className={`absolute -left-[32px] sm:-left-[40px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-900 ${
                  getStepStatus(2, activeOrder.status) === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : activeOrder.status === 'SHIPPED'
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                }`}>
                  {getStepStatus(2, activeOrder.status) === 'completed' ? '✓' : '3'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Addis Ababa Courier En Route' : 'መልዕክተኛው በማድረስ ላይ ነው'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    {activeOrder.courierName ? (
                      <span>
                        {language === 'en' ? 'Courier:' : 'መልዕክተኛ:'} <b>{activeOrder.courierName}</b> 
                        {activeOrder.courierPhone && ` (📞 ${activeOrder.courierPhone})`}
                        {activeOrder.trackingNotes && ` — ${activeOrder.trackingNotes}`}
                      </span>
                    ) : (
                      language === 'en' ? 'Express dispatch to recipient destination.' : 'ፈጣን ማድረስ ወደ ተመረጠው አድራሻ።'
                    )}
                  </p>
                </div>
              </div>

              {/* Step 4: Handover & Settlement */}
              <div className="relative">
                <div className={`absolute -left-[32px] sm:-left-[40px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-900 ${
                  getStepStatus(3, activeOrder.status) === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                }`}>
                  {getStepStatus(3, activeOrder.status) === 'completed' ? '✓' : '4'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Delivery Handover & Escrow Released' : 'እቃው ተረክቧል & ክፍያው ተጠናቋል'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    {activeOrder.deliveredAt
                      ? (language === 'en' ? `Delivered successfully on ${new Date(activeOrder.deliveredAt).toLocaleDateString()}. Warranty is active!` : `በስኬት ደርሷል! ኦፊሴላዊ ዋስትና ነቅቷል።`)
                      : (language === 'en' ? 'Customer PIN confirmation upon signature. Warranty takes effect.' : 'የማረጋገጫ ፒን ተቀብሎ እቃው ይረከባል።')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Courier Contact Card */}
          {activeOrder.courierPhone && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#0052FF]" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-zinc-100">
                    {activeOrder.courierName || 'Addis Express Courier'}
                  </p>
                  <p className="text-[11px] text-gray-500">{activeOrder.courierPhone}</p>
                </div>
              </div>
              <a
                href={`tel:${activeOrder.courierPhone.replace(/\s+/g, '')}`}
                className="px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Call Courier' : 'ለአሽከርካሪው ይደውሉ'}</span>
              </a>
            </div>
          )}

          {/* Post-Delivery Customer Review & Rating Banner (Exclusive to DELIVERED status) */}
          {activeOrder.status === 'DELIVERED' && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                    <Star className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                        {language === 'en' ? 'Verified Post-Delivery Review & Rating' : 'የተረጋገጠ የገዢ ደረጃ እና አስተያየት'}
                      </h3>
                      {activeOrder.reviewed && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{language === 'en' ? 'Reviewed' : 'ተገምግሟል'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-300 mt-0.5">
                      {activeOrder.reviewed
                        ? (language === 'en' 
                            ? 'Thank you! Your verified review helps other Ethiopian tech shoppers.' 
                            : 'እናመሰግናለን! የእርስዎ ግምገማ ሌሎች ኢትዮጵያውያን ሸማቾችን ይረዳል/ያበረታታል።')
                        : (language === 'en'
                            ? 'Your package has been delivered. Share your rating on product authenticity & courier speed.'
                            : 'እቃዎ ደርሷል። ስለ እቃው ጥራት እና ስለ ማድረሻ ፍጥነቱ ደረጃ ይስጡ።')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>
                    {activeOrder.reviewed
                      ? (language === 'en' ? 'View / Update Review' : 'ግምገማ ይመልከቱ/ያሻሽሉ')
                      : (language === 'en' ? 'Rate Delivered Items (⭐)' : 'ደረጃ ይስጡ (⭐)')}
                  </span>
                </button>
              </div>

              {activeOrder.orderReviews && activeOrder.orderReviews.length > 0 && (
                <div className="pt-2 border-t border-amber-500/20 space-y-2">
                  {activeOrder.orderReviews.map((rev, rIdx) => (
                    <div key={rIdx} className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-amber-200/50 dark:border-amber-900/30 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-gray-800 dark:text-zinc-200">
                          {rev.rating}/5
                        </span>
                        <span className="text-gray-500 italic truncate max-w-xs">
                          "{rev.comment.split('\n')[0]}"
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Destination Details */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#0052FF] shrink-0" />
              <div>
                <p className="font-bold text-gray-900 dark:text-zinc-100">{activeOrder.shippingAddress}</p>
                <p className="text-[11px] text-gray-500">
                  {language === 'en' ? 'Recipient:' : 'ተቀባይ:'} {activeOrder.customerName} ({activeOrder.customerPhone})
                </p>
              </div>
            </div>

            {activeOrder.coordinates && (
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                  {activeOrder.coordinates.lat.toFixed(4)}°N, {activeOrder.coordinates.lng.toFixed(4)}°E
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeOrder.coordinates.lat},${activeOrder.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-bold text-[#0052FF] hover:bg-blue-50 flex items-center gap-1 transition-all"
                  title="Open exact courier destination in Google Maps"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Items In Order Summary */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Items in Package' : 'የተካተቱ እቃዎች'}</span>
            </h3>
            <div className="space-y-2">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 text-xs">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-zinc-100">{item.product.nameEn}</p>
                    <p className="text-[11px] text-gray-400">
                      {item.variantName || 'Standard'} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-gray-900 dark:text-zinc-100">
                    {(item.price * item.quantity).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-150 dark:border-zinc-800 space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>{language === 'en' ? 'Subtotal' : 'የእቃ ዋጋ'}</span>
                <span>{activeOrder.subtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{language === 'en' ? 'Express Delivery Fee' : 'የማድረሻ ክፍያ'}</span>
                <span>{activeOrder.shippingFee.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-gray-950 dark:text-white pt-1">
                <span>{language === 'en' ? 'Total Paid' : 'ጠቅላላ ክፍያ'}</span>
                <span className="text-[#0052FF]">{activeOrder.total.toLocaleString()} ETB</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => generateCustomerReceiptPDF(activeOrder, { language })}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-gray-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer group"
              >
                <Download className="w-4 h-4 text-[#0052FF] group-hover:-translate-y-0.5 transition-transform" />
                <span>{language === 'en' ? 'Download Official Tax Receipt & Warranty (PDF)' : 'ህጋዊ የሽያጭ ደረሰኝ እና የዋስትና ሰነድ አውርድ (PDF)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Delivery Customer Review & Rating Modal */}
      {activeOrder && (
        <PostDeliveryReviewModal
          order={activeOrder}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          language={language}
        />
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
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
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { orders, language } = useShop();

  const [searchInput, setSearchInput] = useState(id || '');

  useEffect(() => {
    if (id) {
      setSearchInput(id);
    }
  }, [id]);

  const activeOrder = useMemo(() => {
    if (!searchInput.trim()) {
      return orders[0] || null;
    }
    const clean = searchInput.trim().toLowerCase();
    return orders.find(o => 
      o.id.toLowerCase().includes(clean) || 
      o.customerPhone.replace(/\s+/g, '').includes(clean) ||
      (o.paymentId && o.paymentId.toLowerCase().includes(clean))
    ) || orders[0] || null;
  }, [orders, searchInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/tracking/${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const getStepStatus = (stepIndex: number, currentStatus?: string) => {
    // 0: Placed, 1: Packed, 2: Dispatched, 3: Delivered
    if (!currentStatus) return stepIndex === 0 ? 'completed' : 'pending';
    switch (currentStatus) {
      case 'DELIVERED':
        return 'completed';
      case 'SHIPPED':
        return stepIndex <= 2 ? 'completed' : 'pending';
      case 'PROCESSING':
      case 'PAID':
        return stepIndex <= 1 ? 'completed' : 'pending';
      case 'PENDING_PAYMENT':
      default:
        return stepIndex === 0 ? 'completed' : 'pending';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">
          {language === 'en' ? 'Live Order & Courier Tracking' : 'የቀጥታ ትዕዛዝ እና መልዕክተኛ መከታተያ'}
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
          {language === 'en'
            ? 'Track your electronics dispatch in real-time across Addis Ababa sub-cities.'
            : 'የትዕዛዝዎን ሁኔታ በስልክ ቁጥር ወይም በትዕዛዝ መለያ በቀላሉ ይከታተሉ።'}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Enter Order ID (e.g. ORD-...) or Phone' : 'የትዕዛዝ መለያ (ORD-...) ወይም ስልክ ያስገቡ'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          {language === 'en' ? 'Track' : 'ፈልግ'}
        </button>
      </form>

      {/* Tracking Card */}
      {activeOrder ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-8 shadow-sm">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-150 dark:border-zinc-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-gray-900 dark:text-zinc-100 font-mono">
                  #{activeOrder.id}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Placed on {new Date(activeOrder.createdAt).toLocaleDateString()} • {activeOrder.paymentMethod}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-400 block">{language === 'en' ? 'Total Amount' : 'ጠቅላላ ክፍያ'}</span>
              <span className="text-lg font-black text-[#0052FF]">{activeOrder.total.toLocaleString()} ETB</span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
              {language === 'en' ? 'Shipment Progress Lifecycle' : 'የትዕዛዝ ጉዞ ደረጃዎች'}
            </h2>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-200 dark:border-zinc-800 space-y-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-900">
                  ✓
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Order Confirmed & Escrow Held' : 'ትዕዛዝ ተረጋግጧል & ክፍያ ተይዟል'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    Funds placed in protected escrow. Verified transaction reference: {activeOrder.paymentId || activeOrder.id}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-900 ${
                  getStepStatus(1, activeOrder.status) === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                }`}>
                  2
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Merchant Quality Check & Packing' : 'የእቃ ጥራት ምርመራ እና ማሸግ'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    Hardware serial logged, factory seal verified, packed in Kasma tamper-evident packaging.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-900 ${
                  getStepStatus(2, activeOrder.status) === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-600 text-white animate-pulse'
                }`}>
                  3
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Addis Ababa Courier Out for Delivery' : 'መልዕክተኛው በማድረስ ላይ ነው'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    Express motorcycle courier assigned. Routing to {activeOrder.shippingAddress}.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-900 ${
                  getStepStatus(3, activeOrder.status) === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                }`}>
                  4
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Delivery Handover & Escrow Released' : 'እቃው ተረክቧል & ክፍያው ተጠናቋል'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    Courier verification PIN entered upon recipient signature. Warranty takes effect.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Destination info */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#0052FF]" />
              <div>
                <p className="font-bold text-gray-900 dark:text-zinc-100">{activeOrder.shippingAddress}</p>
                <p className="text-[11px] text-gray-500">Contact: {activeOrder.customerPhone} ({activeOrder.customerName})</p>
              </div>
            </div>
            <a
              href={`tel:${activeOrder.customerPhone}`}
              className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-zinc-800 font-bold hover:bg-gray-300 transition-colors"
            >
              Call Courier
            </a>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
            {language === 'en' ? 'No Order Found' : 'ትዕዛዝ አልተገኘም'}
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {language === 'en'
              ? 'Please verify your Order ID reference or phone number and try again.'
              : 'እባክዎን የትዕዛዝ መለያ ቁጥርዎን ወይም ስልክዎን አረጋግጠው በድጋሚ ይሞክሩ።'}
          </p>
        </div>
      )}
    </div>
  );
};

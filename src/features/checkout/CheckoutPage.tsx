import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { SUB_CITIES } from '../../components/CustomerWeb';
import { Order } from '../../types';
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
  Sparkles
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
    addOrder,
    showToast 
  } = useShop();

  const [name, setName] = useState(customerName || '');
  const [phone, setPhone] = useState(customerPhone || '+251 9');
  const [email, setEmail] = useState(customerEmail || '');
  const [selectedSubCityId, setSelectedSubCityId] = useState('bole');
  const [landmark, setLandmark] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'COD'>('TELEBIRR');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const newOrder: Order = {
        id: orderId,
        customerId: `cust-${Date.now()}`,
        customerName: cleanName,
        customerPhone: cleanPhone,
        items: [...cart],
        subtotal: cartSubtotal,
        shippingFee,
        total: orderTotal,
        status: paymentMethod === 'COD' ? 'PROCESSING' : 'PAID',
        paymentMethod,
        paymentId: txRef,
        shippingAddress: `${selectedSubCity.nameEn}, ${cleanLandmark}${specificAddress ? ', ' + specificAddress : ''}`,
        subCity: selectedSubCity.nameEn,
        landmark: cleanLandmark,
        createdAt: new Date().toISOString(),
        channel: 'WEB',
        discountCode: appliedPromo?.code,
        discountAmount
      };

      // Call API
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
          ? `Order #${orderId} confirmed successfully!`
          : `ትዕዛዝ #${orderId} በተሳካ ሁኔታ ተረጋግጧል!`,
        'success'
      );

      navigate(`/order-confirmation/${orderId}`);
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
        {/* Left Column: Delivery Details & Payment */}
        <div className="lg:col-span-7 space-y-6">
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

          {/* Section 2: Localized Addis Ababa Delivery */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0052FF]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                {language === 'en' ? '2. Delivery Routing & Sub-City' : '2. የማድረሻ አድራሻ እና ክፍለ ከተማ'}
              </h2>
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
                      {s.nameEn} — {s.fee} ETB ({s.timeEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {language === 'en' ? 'Known Landmark / Area (መለያ ቦታ) *' : 'የሚታወቅ መለያ ቦታ *'}
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
                  {language === 'en' ? 'Specific House / Building (Optional)' : 'የቤት ወይም ህንፃ ቁጥር (አማራጭ)'}
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
          </div>
        </div>

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
                    <img src={item.product.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0" />
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
              className="w-full py-4 px-6 rounded-2xl bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
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

import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Download,
  Share2,
  Package,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateCustomerReceiptPDF } from '../../lib/pdfGenerator';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const checkoutUrl = searchParams.get('checkoutUrl');
  const { orders, language } = useShop();

  const order = orders.find(o => o.id === id) || orders[0];
  const verificationPin = order?.codVerificationPin || (order ? order.id.slice(-4) : '8492');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">
          {order?.paymentMethod === 'COD'
            ? (language === 'en' ? 'Cash On Delivery Order Confirmed!' : 'የእጅ በእጅ ክፍያ ትዕዛዝ ተረጋግጧል!')
            : (language === 'en' ? 'Order Confirmed & Escrow Secured!' : 'ትዕዛዝዎ ተረጋግጧል!')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          {language === 'en'
            ? 'Your purchase has been routed to the merchant. An Addis Ababa express courier has been assigned for fulfillment.'
            : 'ትዕዛዝዎ ወደ ነጋዴው ተልኳል። ፈጣን የማድረሻ መልዕክተኛ ተመድቦ ወደ እርስዎ ይላካል።'}
        </p>
      </div>

      {/* Chapa Hosted Payment Callout (if digital payment link exists) */}
      {checkoutUrl && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-black text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'Chapa Gateway Session Active' : 'የጫፓ ክፍያ ገጽ ዝግጁ ነው'}</span>
            </span>
            <p className="text-[11px] text-gray-600 dark:text-zinc-400">
              {language === 'en'
                ? 'Complete payment via Telebirr, CBE Birr, Awash, or Card on Chapa\'s secure hosted checkout.'
                : 'በቴሌብር፣ በሲቢኢ ብር፣ በአዋሽ ወይም በባንክ ካርድ በጫፓ ደህንነቱ በተጠበቀ ገጽ ይክፈሉ።'}
            </p>
          </div>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm shrink-0 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{language === 'en' ? 'Pay with Chapa' : 'በጫፓ ክፈል'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Main Order Voucher Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-6 shadow-sm">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-150 dark:border-zinc-800 gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Order Reference</span>
            <p className="text-base font-black text-gray-900 dark:text-zinc-100 font-mono">
              #{order ? order.id : id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Courier Verification PIN */}
            <div className="p-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
              <span className="text-[10px] font-black uppercase text-[#0052FF] tracking-wider block">Courier PIN</span>
              <span className="text-sm font-black font-mono text-gray-900 dark:text-zinc-100">{verificationPin}</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800">
              <QRCodeSVG value={`https://kasma.et/tracking/${order ? order.id : id}`} size={44} />
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 space-y-1">
            <span className="font-bold text-gray-500 uppercase text-[10px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>{language === 'en' ? 'Shipping Destination' : 'የማድረሻ አድራሻ'}</span>
            </span>
            <p className="font-bold text-gray-900 dark:text-zinc-100 mt-1">
              {order?.shippingAddress || 'Bole, Addis Ababa'}
            </p>
            {order?.coordinates && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                  📍 GPS: {order.coordinates.lat.toFixed(4)}°N, {order.coordinates.lng.toFixed(4)}°E
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.coordinates.lat},${order.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[#0052FF] hover:underline flex items-center gap-0.5"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
            <p className="text-[11px] text-gray-400">
              Recipient: {order?.customerName} (📞 {order?.customerPhone})
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 space-y-1">
            <span className="font-bold text-gray-500 uppercase text-[10px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'Estimated Delivery' : 'የሚደርስበት ግምት'}</span>
            </span>
            <p className="font-bold text-gray-900 dark:text-zinc-100 mt-1">
              2 - 4 Hours (Express Courier)
            </p>
            <p className="text-[11px] text-gray-400">
              Payment Rail: <span className="font-semibold text-gray-700 dark:text-zinc-300">{order?.paymentMethod || 'TELEBIRR'}</span>
            </p>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
            {language === 'en' ? 'Items in this Shipment' : 'በትዕዛዙ ውስጥ ያሉ እቃዎች'}
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {order?.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <img src={item.product.image} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-zinc-100">{item.product.nameEn}</p>
                    <p className="text-[10px] text-gray-400">Variant: {item.variantName} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-black text-gray-900 dark:text-zinc-100">
                  {(item.price * item.quantity).toLocaleString()} ETB
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-150 dark:border-zinc-800 flex justify-between text-sm font-black text-gray-900 dark:text-zinc-100">
            <span>{language === 'en' ? 'Total Paid Amount' : 'የተከፈለው ጠቅላላ'}</span>
            <span className="text-[#0052FF]">{order?.total ? order.total.toLocaleString() : '0'} ETB</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button
            type="button"
            onClick={() => order && generateCustomerReceiptPDF(order, { language })}
            className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-gray-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer group"
          >
            <Download className="w-4 h-4 text-[#0052FF] group-hover:-translate-y-0.5 transition-transform" />
            <span>{language === 'en' ? 'Download Official Tax Receipt & Warranty (PDF)' : 'ህጋዊ የሽያጭ ደረሰኝ እና የዋስትና ሰነድ አውርድ (PDF)'}</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/tracking/${order ? order.id : id}`}
              className="flex-1 py-3.5 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{language === 'en' ? 'Track Live Dispatch' : 'ትዕዛዙን ተከታተል'}</span>
            </Link>
            <Link
              to="/"
              className="flex-1 py-3.5 px-4 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'en' ? 'Continue Shopping' : 'ግዢ ቀጥል'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

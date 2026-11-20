import React from 'react';
import { Truck, Package, RefreshCw } from 'lucide-react';
import { Order } from '../../types';
import { OrderTrackingVisualizer } from '../OrderTrackingVisualizer';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
  trackOrderId: string;
  setTrackOrderId: (id: string) => void;
  allOrders: Order[];
  offlineOrders: Order[];
  trackedOrder: Order | null;
  setTrackedOrder: (order: Order | null) => void;
  hasSearchedOrder: boolean;
  setHasSearchedOrder: (searched: boolean) => void;
  handleUpdateTrackedOrderStatus: (status: Order['status']) => void;
  onForceSync?: () => void;
  isSyncing?: boolean;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  language,
  trackOrderId,
  setTrackOrderId,
  allOrders,
  offlineOrders,
  trackedOrder,
  setTrackedOrder,
  hasSearchedOrder,
  setHasSearchedOrder,
  handleUpdateTrackedOrderStatus,
  onForceSync,
  isSyncing
}) => {
  if (!isOpen) return null;

  return (
    <div className="order-status-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 text-left relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#0052FF]" />
            <h3 className="text-lg font-black tracking-tight text-gray-950 dark:text-white">
              {language === 'en' ? 'Track Shipment Status' : 'የትዕዛዝዎን ጭነት መከታተያ'}
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            {language === 'en'
              ? 'Enter your Kasma order reference number to view real-time transit telemetry.'
              : 'ትዕዛዝዎ የደረሰበትን ደረጃ ለማወቅ የእቃ መለያ ቁጥሩን ያስገቡ።'}
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={
                  language === 'en'
                    ? 'Enter Order Reference (e.g. KS-3829)'
                    : 'የትዕዛዝ መለያ ያስገቡ (ለምሳሌ KS-3829)'
                }
                value={trackOrderId}
                onChange={(e) => setTrackOrderId(e.target.value.toUpperCase())}
                className="w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/50 rounded-xl text-sm font-mono focus:outline-none focus:ring-1.5 focus:ring-blue-500 text-gray-900 dark:text-zinc-100"
              />
              <Package className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
            </div>
            <button
              onClick={() => {
                setHasSearchedOrder(true);
                const cleanedId = trackOrderId.trim();
                const found = allOrders.find((o) => o.id === cleanedId);
                setTrackedOrder(found || null);
              }}
              className="px-6 py-3 bg-black hover:bg-zinc-950 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {language === 'en' ? 'Track' : 'ፈልግ'}
            </button>
          </div>

          {/* Suggestions / Recent orders helper - Visual Order History & Progress */}
          {allOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                  {language === 'en' ? 'Your Order History' : 'የእርስዎ የትዕዛዝ ታሪክ'}
                </p>
                <span className="text-[9px] bg-blue-500/15 text-[#0052FF] px-2 py-0.5 rounded-full font-bold">
                  {allOrders.length} {language === 'en' ? 'Orders Found' : 'ትዕዛዞች'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allOrders.slice(0, 4).map((ord) => {
                  const isSelected = trackOrderId === ord.id;
                  const isOfflinePending = offlineOrders.some((o) => o.id === ord.id);

                  // Calculate step progress percentage for simple visualization
                  let progressPercent = 0;
                  let stepName = language === 'en' ? 'Processing' : 'በዝግጅት ላይ';
                  if (isOfflinePending) {
                    progressPercent = 0;
                    stepName = language === 'en' ? 'Offline (Pending Sync)' : 'ከመስመር ውጭ (ለመመሳሰል በመጠባበቅ ላይ)';
                  } else if (['PENDING_PAYMENT', 'PAID'].includes(ord.status)) {
                    progressPercent = 15;
                    stepName = language === 'en' ? 'Processing (Addis Hub)' : 'በዝግጅት ላይ (አዲስ አበባ)';
                  } else if (ord.status === 'PROCESSING') {
                    progressPercent = 45;
                    stepName = language === 'en' ? 'Dispatched' : 'በጉዞ ላይ';
                  } else if (ord.status === 'SHIPPED') {
                    progressPercent = 75;
                    stepName = language === 'en' ? 'Out for Delivery (Addis)' : 'ለመድረስ በጉዞ ላይ (አዲስ)';
                  } else if (ord.status === 'DELIVERED') {
                    progressPercent = 100;
                    stepName = language === 'en' ? 'Delivered' : 'ደርሷል';
                  }

                  return (
                    <button
                      key={ord.id}
                      onClick={() => {
                        setTrackOrderId(ord.id);
                        setTrackedOrder(ord);
                        setHasSearchedOrder(true);
                      }}
                      className={`w-full p-3.5 rounded-2xl text-left border transition-all space-y-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#0052FF] bg-blue-500/[0.03] dark:bg-blue-500/[0.01] ring-1.5 ring-blue-500 shadow-sm'
                          : 'border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-850/30 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="font-mono font-black text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-green-500'
                                  : isOfflinePending
                                    ? 'bg-amber-500 animate-pulse'
                                    : 'bg-blue-500 animate-pulse'
                              }`}
                            />
                            {ord.id}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">
                            {new Date(ord.createdAt).toLocaleDateString(
                              language === 'en' ? 'en-US' : 'am-ET',
                              { month: 'short', day: 'numeric', year: 'numeric' }
                            )}
                          </p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="font-mono font-extrabold text-[11px] text-gray-950 dark:text-white">
                            {ord.total.toLocaleString()} ETB
                          </p>
                          <span
                            className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                              isOfflinePending
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : ord.status === 'DELIVERED'
                                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                  : ord.status === 'SHIPPED'
                                    ? 'bg-blue-500/10 text-[#0052FF] dark:text-blue-400'
                                    : ord.status === 'CANCELLED'
                                      ? 'bg-red-500/10 text-red-600'
                                      : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {isOfflinePending
                              ? language === 'en'
                                ? 'Offline Pending'
                                : 'ከመስመር ውጭ በመጠባበቅ ላይ'
                              : ord.status === 'DELIVERED'
                                ? language === 'en'
                                  ? 'Delivered'
                                  : 'ደርሷል'
                                : ord.status === 'SHIPPED'
                                  ? language === 'en'
                                    ? 'In Transit'
                                    : 'በጉዞ ላይ'
                                  : ord.status === 'PROCESSING'
                                    ? language === 'en'
                                      ? 'Processing'
                                      : 'በዝግጅት ላይ'
                                    : ord.status === 'CANCELLED'
                                      ? language === 'en'
                                        ? 'Cancelled'
                                        : 'ተሰርዟል'
                                      : language === 'en'
                                        ? 'Paid'
                                        : 'ተከፍሏል'}
                          </span>
                        </div>
                      </div>

                      {/* Simple Progress Bar step-tracker */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-gray-400">
                          <span>{language === 'en' ? 'Progress' : 'ሂደት'}</span>
                          <span className="text-[#0052FF] font-black font-mono">{stepName}</span>
                        </div>
                        <div className="h-1 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0052FF] rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[7.5px] text-gray-400 font-bold uppercase tracking-widest">
                          <span>{language === 'en' ? 'Processing' : 'በማሸግ ላይ'}</span>
                          <span className="text-center">{language === 'en' ? 'Transit' : 'በጉዞ ላይ'}</span>
                          <span>{language === 'en' ? 'Out For Delivery' : 'ለመድረስ በጉዞ'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {hasSearchedOrder && (
          <div className="border-t border-gray-150 dark:border-zinc-800 pt-5 space-y-6">
            {trackedOrder ? (
              <div className="space-y-6">
                {/* Compact Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/50 dark:bg-zinc-850 p-4 rounded-2xl border border-gray-150/40 dark:border-zinc-800/40 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      {language === 'en' ? 'Recipient' : 'ተቀባይ'}
                    </span>
                    <p className="font-extrabold text-gray-900 dark:text-white truncate">
                      {trackedOrder.customerName}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      {language === 'en' ? 'Phone' : 'ስልክ ቁጥር'}
                    </span>
                    <p className="font-mono text-gray-600 dark:text-zinc-300">
                      {trackedOrder.customerPhone}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      {language === 'en' ? 'Total Amount' : 'ጠቅላላ ዋጋ'}
                    </span>
                    <p className="font-mono font-extrabold text-amber-500">
                      {trackedOrder.total.toLocaleString()} ETB
                    </p>
                  </div>
                  <div className="space-y-0.5 col-span-2 md:col-span-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      {language === 'en' ? 'Destination' : 'የመድረሻ አድራሻ'}
                    </span>
                    <p
                      className="text-gray-900 dark:text-white truncate font-medium"
                      title={trackedOrder.shippingAddress}
                    >
                      {trackedOrder.shippingAddress}
                    </p>
                  </div>
                </div>

                {/* Order Status Alerts (Cancelled / Refunded) */}
                {trackedOrder.status === 'CANCELLED' ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center space-y-1">
                    <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                      {language === 'en' ? 'Order Cancelled' : 'ትዕዛዙ ተሰርዟል'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {language === 'en'
                        ? 'This order was cancelled and will not be dispatched.'
                        : 'ይህ ትዕዛዝ ስለተሰረዘ ወደ ስርጭት አይወጣም።'}
                    </p>
                  </div>
                ) : trackedOrder.status === 'REFUNDED' ? (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center space-y-1">
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      {language === 'en' ? 'Order Refunded' : 'ክፍያ ተመላሽ ተደርጓል'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {language === 'en'
                        ? 'A full refund has been credited back to your payment method.'
                        : 'ሙሉ ክፍያው ወደ መክፈያ ካርድዎ ተመላሽ ተደርጓል።'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {offlineOrders.some((o) => o.id === trackedOrder.id) && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                        <div className="flex gap-3">
                          <span className="text-base leading-none shrink-0">⚠️</span>
                          <div>
                            <p className="font-extrabold uppercase tracking-wide text-[10px] mb-0.5">
                              {language === 'en' ? 'Offline Cache Active' : 'ከመስመር ውጭ ካሽ ገቢር ነው'}
                            </p>
                            <p>
                              {language === 'en'
                                ? 'This order was placed while connection was simulated offline. It is safely cached in your local browser and will start tracking once synchronization is forced or connection is restored.'
                                : 'ይህ ትዕዛዝ የተላለፈው ከመስመር ውጭ ሁነታ ላይ በነበሩበት ጊዜ ነው። በአሳሽዎ ውስጥ በሰላም የተቀመጠ ሲሆን አመሳስል ሲጫኑ ወደ ስርጭት ሂደት ይገባል።'}
                            </p>
                          </div>
                        </div>
                        {onForceSync && (
                          <button
                            type="button"
                            onClick={() => onForceSync()}
                            disabled={isSyncing}
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>{language === 'en' ? 'Sync Data Now' : 'አሁኑኑ አመሳስል'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Dedicated Interactive Tracking Visualizer Component */}
                    <OrderTrackingVisualizer
                      order={trackedOrder}
                      language={language}
                      onStatusChange={handleUpdateTrackedOrderStatus}
                    />

                    {/* Live Delivery Dispatch Status Widget */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-[#0052FF]" />
                          <span>
                            {language === 'en' ? 'Live Courier Dispatch Status' : 'የቀጥታ መልዕክተኞች ሁኔታ'}
                          </span>
                        </h4>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{language === 'en' ? 'Live Dispatch' : 'ገቢር'}</span>
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-zinc-100">
                            {trackedOrder?.courierName ||
                              (language === 'en' ? 'Express Addis Courier' : 'ፈጣን የአዲስ አበባ መልዕክተኛ')}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {trackedOrder?.courierPhone
                              ? `📞 ${trackedOrder.courierPhone}`
                              : language === 'en'
                                ? 'Addis Ababa City Fleet'
                                : 'የአዲስ አበባ መልዕክተኞች'}
                          </p>
                        </div>
                        {trackedOrder && (
                          <a
                            href={`/tracking/${trackedOrder.id}`}
                            className="px-3 py-1.5 rounded-xl bg-[#0052FF] text-white font-bold text-xs"
                          >
                            {language === 'en' ? 'Track' : 'መከታተያ'}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Telemetry Timeline Progress Indicator */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {language === 'en' ? 'Real-Time Transit Progress' : 'የጭነት መከታተያ ሂደት'}
                      </h4>

                      <div className="relative pl-6 border-l-2 border-gray-150 dark:border-zinc-800 space-y-6">
                        {/* Step 1: Placed */}
                        <div className="relative">
                          <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-green-500 border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs" />
                          <div className="space-y-1">
                            <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                              <span>{language === 'en' ? 'Order Placed' : 'ትዕዛዝ ተመዝግቧል'}</span>
                              <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                {language === 'en' ? 'Completed' : 'ተጠናቋል'}
                              </span>
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {language === 'en'
                                ? 'Payment was successfully verified and order is queued for processing.'
                                : 'ክፍያው ተረጋግጦ ትዕዛዙ ለመዘጋጀት ተመዝግቧል።'}
                            </p>
                            <p className="text-[9px] text-gray-400/80 font-mono">
                              {new Date(trackedOrder.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Step 2: Processing */}
                        {(() => {
                          const isCompleted = ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(
                            trackedOrder.status
                          );
                          const isActive = trackedOrder.status === 'PAID';
                          return (
                            <div className="relative">
                              <span
                                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs ${
                                  isCompleted
                                    ? 'bg-green-500'
                                    : isActive
                                      ? 'bg-blue-500 animate-pulse'
                                      : 'bg-gray-200 dark:bg-zinc-800'
                                }`}
                              />
                              <div className="space-y-1">
                                <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                                  <span>
                                    {language === 'en' ? 'Processing & Packaging' : 'ዝግጅት እና ማሸግ'}
                                  </span>
                                  {isCompleted ? (
                                    <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                      {language === 'en' ? 'Completed' : 'ተጠናቋል'}
                                    </span>
                                  ) : isActive ? (
                                    <span className="bg-blue-500/15 text-[#0052FF] dark:text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded animate-pulse">
                                      {language === 'en' ? 'In Progress' : 'በዝግጅት ላይ'}
                                    </span>
                                  ) : (
                                    <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                      {language === 'en' ? 'Pending' : 'በጥበቃ ላይ'}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {language === 'en'
                                    ? 'Merchant is packing the products and preparing secure delivery stickers.'
                                    : 'ሻጩ እቃውን በማዘጋጀት እና ጥራት ባለው ማሸጊያ እያዘጋጀው ነው።'}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Step 3: Shipped */}
                        {(() => {
                          const isCompleted = ['SHIPPED', 'DELIVERED'].includes(trackedOrder.status);
                          const isActive = trackedOrder.status === 'PROCESSING';
                          return (
                            <div className="relative">
                              <span
                                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs ${
                                  isCompleted
                                    ? 'bg-green-500'
                                    : isActive
                                      ? 'bg-blue-500 animate-pulse'
                                      : 'bg-gray-200 dark:bg-zinc-800'
                                }`}
                              />
                              <div className="space-y-1">
                                <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                                  <span>{language === 'en' ? 'Dispatched & In Transit' : 'በጉዞ ላይ'}</span>
                                  {isCompleted ? (
                                    <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                      {language === 'en' ? 'Completed' : 'ተጠናቋል'}
                                    </span>
                                  ) : isActive ? (
                                    <span className="bg-blue-500/15 text-[#0052FF] dark:text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded animate-pulse">
                                      {language === 'en' ? 'In Progress' : 'በጉዞ ላይ'}
                                    </span>
                                  ) : (
                                    <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                      {language === 'en' ? 'Pending' : 'በጥበቃ ላይ'}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {language === 'en'
                                    ? 'Shipment was dispatched and is currently in transit with Kasma Express.'
                                    : 'ዕቃው በካስማ የትራንስፖርት አገልግሎት ተጭኖ ወደ መድረሻው በመጓዝ ላይ ይገኛል።'}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Step 4: Arrived */}
                        {(() => {
                          const isCompleted = trackedOrder.status === 'DELIVERED';
                          const isActive = trackedOrder.status === 'SHIPPED';
                          return (
                            <div className="relative">
                              <span
                                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs ${
                                  isCompleted
                                    ? 'bg-green-500'
                                    : isActive
                                      ? 'bg-blue-500 animate-pulse'
                                      : 'bg-gray-200 dark:bg-zinc-800'
                                }`}
                              />
                              <div className="space-y-1">
                                <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                                  <span>
                                    {language === 'en' ? 'Safely Arrived & Delivered' : 'በስኬት ደርሷል'}
                                  </span>
                                  {isCompleted ? (
                                    <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                      {language === 'en' ? 'Delivered' : 'ደርሷል'}
                                    </span>
                                  ) : isActive ? (
                                    <span className="bg-blue-500/15 text-[#0052FF] dark:text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded animate-pulse">
                                      {language === 'en' ? 'Out For Delivery' : 'ለመድረስ ጥቂት ቀርቷል'}
                                    </span>
                                  ) : (
                                    <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                      {language === 'en' ? 'Pending' : 'በጥበቃ ላይ'}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {language === 'en'
                                    ? 'The courier has successfully delivered the parcel to your designated address.'
                                    : 'መልዕክተኛው እቃውን በተፈለገው አድራሻ ላይ በጥንቃቄ አስረክቧል።'}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items List Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {language === 'en' ? 'Items Ordered' : 'የታዘዙ ምርቶች ዝርዝር'}
                  </h4>
                  <div className="border border-gray-150/55 dark:border-zinc-800/55 rounded-2xl divide-y divide-gray-150/40 dark:divide-zinc-800/40 overflow-hidden">
                    {trackedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50/50 dark:hover:bg-zinc-850/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.nameEn}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-zinc-800 shrink-0"
                          />
                          <div className="text-left space-y-0.5">
                            <p className="font-bold text-gray-950 dark:text-white">
                              {language === 'en' ? item.product.nameEn : item.product.nameAm}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {item.variantName} • {item.sku}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-0.5 shrink-0">
                          <p className="font-mono font-extrabold text-gray-900 dark:text-white">
                            {(item.price * item.quantity).toLocaleString()} ETB
                          </p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2.5 text-gray-500">
                <span className="text-3xl">🔍</span>
                <p className="text-xs font-bold text-gray-950 dark:text-white">
                  {language === 'en' ? 'Order Reference Not Found' : 'የትዕዛዝ መለያ ቁጥሩ አልተገኘም'}
                </p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                  {language === 'en'
                    ? 'We could not match that reference code to our delivery records. Please double-check spelling or try again.'
                    : 'ያስገቡት የትዕዛዝ መለያ ቁጥር አልተገኘም። እባክዎን በትክክል መጻፉን ያረጋግጡ ወይም እንደገና ይሞክሩ።'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Back to store button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          {language === 'en' ? 'Close Tracker' : 'መከታተያውን ዝጋ'}
        </button>
      </div>
    </div>
  );
};

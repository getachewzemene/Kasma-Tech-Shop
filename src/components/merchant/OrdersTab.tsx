import React, { useState, useMemo } from 'react';
import { Order, Merchant } from '../../types';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  Send, 
  AlertCircle,
  ExternalLink,
  User,
  ShieldCheck,
  ChevronRight,
  Filter,
  Printer,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateCourierWaybillPDF, generateCustomerReceiptPDF } from '../../lib/pdfGenerator';

interface OrdersTabProps {
  orders: Order[];
  currentMerchant: Merchant;
  language: 'en' | 'am';
  onOrderUpdated?: (updatedOrder: Order) => void;
  showToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export default function OrdersTab({
  orders,
  currentMerchant,
  language,
  onOrderUpdated,
  showToast
}: OrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNFULFILLED' | 'SHIPPED' | 'DELIVERED'>('ALL');
  const [selectedOrderForShip, setSelectedOrderForShip] = useState<Order | null>(null);

  // Ship modal form state
  const [courierName, setCourierName] = useState('Abebe K. (Addis Express)');
  const [courierPhone, setCourierPhone] = useState('+251911002233');
  const [trackingNotes, setTrackingNotes] = useState('Dispatched via express motorcycle courier.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter orders relevant to this merchant
  const merchantOrders = useMemo(() => {
    return orders.filter(order => {
      // Check if any items belong to this merchant
      return order.items.some(i => (i.product.merchantId || 'm1') === currentMerchant.id);
    });
  }, [orders, currentMerchant]);

  // Apply search and status filters
  const filteredOrders = useMemo(() => {
    return merchantOrders.filter(order => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        order.id.toLowerCase().includes(q) || 
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.replace(/\s+/g, '').includes(q) ||
        order.shippingAddress.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'UNFULFILLED') {
        return order.status === 'PENDING_PAYMENT' || order.status === 'PAID' || order.status === 'PROCESSING';
      }
      if (statusFilter === 'SHIPPED') {
        return order.status === 'SHIPPED';
      }
      if (statusFilter === 'DELIVERED') {
        return order.status === 'DELIVERED';
      }
      return true;
    });
  }, [merchantOrders, searchQuery, statusFilter]);

  // Execute Fulfillment Action via backend API
  const handleFulfillmentAction = async (
    orderId: string, 
    newStatus: 'PROCESSING' | 'SHIPPED' | 'DELIVERED',
    extra?: { courierName?: string; courierPhone?: string; trackingNotes?: string }
  ) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('kasma_merchant_token') || 
                    localStorage.getItem('kasma_auth_token') || 
                    localStorage.getItem('kasma_admin_token');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/merchants/orders/${orderId}/fulfillment`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: newStatus,
          courierName: extra?.courierName,
          courierPhone: extra?.courierPhone,
          trackingNotes: extra?.trackingNotes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Fulfillment state update failed.');
      }

      if (onOrderUpdated && data.order) {
        onOrderUpdated(data.order);
      }

      const statusLabels = {
        PROCESSING: language === 'en' ? 'Packed & Serial Verified' : 'የታሸገ እና የተረጋገጠ',
        SHIPPED: language === 'en' ? 'Dispatched to Courier' : 'ለማድረሻ ተልኳል',
        DELIVERED: language === 'en' ? 'Delivered & Escrow Released' : 'ደርሷል & ክፍያው ተጠናቋል'
      };

      if (showToast) {
        showToast(
          language === 'en' 
            ? `Order #${orderId} marked as ${statusLabels[newStatus]}. Telegram alert dispatched!`
            : `የትዕዛዝ #${orderId} ሁኔታ ተቀይሯል። የቴሌግራም መልእክት ተልኳል!`,
          'success'
        );
      }

      setSelectedOrderForShip(null);
    } catch (err: any) {
      console.error('Fulfillment update error:', err);
      if (showToast) {
        showToast(err.message || 'Failed to update order fulfillment.', 'warning');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-150 dark:border-zinc-850">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#0052FF]" />
            <span>{language === 'en' ? 'Merchant Orders & Fulfillment' : 'የትዕዛዝ ማሟያ እና ማስተናገጃ'}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'en'
              ? 'Pack, dispatch couriers, and track live customer fulfillment in Addis Ababa.'
              : 'እቃዎችን ያሽጉ፣ ለመልዕክተኛ ያስረክቡ እና የቀጥታ ማድረስን ይከታተሉ።'}
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-900 p-1 rounded-2xl shrink-0 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-zinc-800 text-gray-950 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300'
            }`}
          >
            {language === 'en' ? 'All' : 'ሁሉም'} ({merchantOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNFULFILLED')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'UNFULFILLED'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300'
            }`}
          >
            {language === 'en' ? 'Pending & Pack' : 'ማሸግ ያለባቸው'}
          </button>
          <button
            onClick={() => setStatusFilter('SHIPPED')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'SHIPPED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300'
            }`}
          >
            {language === 'en' ? 'In Transit' : 'በጉዞ ላይ'}
          </button>
          <button
            onClick={() => setStatusFilter('DELIVERED')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'DELIVERED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300'
            }`}
          >
            {language === 'en' ? 'Delivered' : 'የደረሱ'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder={language === 'en' ? 'Search by Order ID, customer name, phone, address...' : 'የትዕዛዝ ቁጥር፣ ደንበኛ ወይም ስልክ ፈልግ...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-semibold outline-none focus:border-[#0052FF]"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-3">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
            {language === 'en' ? 'No orders matching current filter' : 'ምንም ትዕዛዝ አልተገኘም'}
          </h3>
          <p className="text-xs text-gray-400">
            {language === 'en' ? 'New customer orders will appear here automatically.' : 'አዳዲስ ትዕዛዞች እዚህ በራስ-ሰር ይታያሉ።'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => {
            const isDelivered = order.status === 'DELIVERED';
            const isShipped = order.status === 'SHIPPED';
            const isPacked = order.status === 'PROCESSING';
            const isPending = order.status === 'PENDING_PAYMENT' || order.status === 'PAID';

            return (
              <div 
                key={order.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 hover:border-gray-300 dark:hover:border-zinc-750 transition-all shadow-xs space-y-4"
              >
                {/* Top Row: Order ID, Status, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-gray-950 dark:text-white">
                      #{order.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isDelivered 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : isShipped
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        : isPacked
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {order.paymentMethod} {order.paymentMethod === 'COD' ? '(Cash on Delivery)' : '✅'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Middle Row: Customer Info & Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Customer & Address Details */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-zinc-100 font-bold">
                      <User className="w-3.5 h-3.5 text-[#0052FF]" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`tel:${order.customerPhone}`} className="hover:underline font-mono">
                        {order.customerPhone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600 dark:text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{order.shippingAddress} {order.subCity ? `(${order.subCity})` : ''}</span>
                    </div>
                    {order.courierName && (
                      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-zinc-800 text-[11px]">
                        <span className="text-gray-400 font-bold block">Assigned Courier:</span>
                        <span className="font-semibold text-gray-800 dark:text-zinc-200">{order.courierName}</span>
                        {order.courierPhone && (
                          <span className="text-gray-500 font-mono ml-2">({order.courierPhone})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Purchased Items List */}
                  <div className="space-y-2">
                    <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Store Items in Order' : 'የተገዙ እቃዎች'}
                    </p>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-zinc-100 line-clamp-1">
                              {item.product.nameEn}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.variantName || 'Standard'} • Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-gray-900 dark:text-zinc-100">
                            {(item.price * item.quantity).toLocaleString()} ETB
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 font-bold text-xs">
                      <span className="text-gray-500">{language === 'en' ? 'Order Total:' : 'ጠቅላላ:'}</span>
                      <span className="text-sm font-black text-[#0052FF]">{order.total.toLocaleString()} ETB</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Fulfillment Workflow Actions (PACK, SHIP, DELIVER) */}
                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 font-semibold">{language === 'en' ? 'Workflow Step:' : 'የስራ ደረጃ:'}</span>
                    <span className="font-bold text-gray-800 dark:text-zinc-200">
                      {isDelivered 
                        ? (language === 'en' ? '4/4 Completed' : '4/4 ተጠናቋል')
                        : isShipped
                        ? (language === 'en' ? '3/4 Out for Delivery' : '3/4 በጉዞ ላይ')
                        : isPacked
                        ? (language === 'en' ? '2/4 Packed & Ready' : '2/4 ተዘጋጅቷል')
                        : (language === 'en' ? '1/4 Awaiting Pack' : '1/4 ማሸግ ያስፈልጋል')}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    {/* Action 1: Pack */}
                    {isPending && (
                      <button
                        disabled={isSubmitting}
                        onClick={() => handleFulfillmentAction(order.id, 'PROCESSING')}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Pack Order' : 'እቃውን አሽግ'}</span>
                      </button>
                    )}

                    {/* Action 2: Ship (with courier modal) */}
                    {(isPending || isPacked) && (
                      <button
                        disabled={isSubmitting}
                        onClick={() => setSelectedOrderForShip(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Ship to Courier' : 'ለመልዕክተኛ ስጥ'}</span>
                      </button>
                    )}

                    {/* Action 3: Deliver */}
                    {isShipped && (
                      <button
                        disabled={isSubmitting}
                        onClick={() => handleFulfillmentAction(order.id, 'DELIVERED')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Confirm Delivery' : 'ማድረሱን አረጋግጥ'}</span>
                      </button>
                    )}

                    {/* Action 4: Print Courier Waybill & Packing Slip */}
                    <button
                      type="button"
                      onClick={() => generateCourierWaybillPDF(order, { merchantStoreName: currentMerchant.storeName })}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0052FF] dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title={language === 'en' ? 'Print Courier Waybill & Packing Slip (PDF)' : 'የማጓጓዣ ማረጋገጫ እና የማስረከቢያ ወረቀት አትም'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Print Waybill' : 'ማጓጓዣ አትም'}</span>
                    </button>

                    {/* Action 5: Print Official Customer Tax Receipt */}
                    <button
                      type="button"
                      onClick={() => generateCustomerReceiptPDF(order, { language })}
                      className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title={language === 'en' ? 'Download Official Customer Tax Receipt' : 'የደንበኛ ደረሰኝ አውርድ'}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Receipt' : 'ደረሰኝ'}</span>
                    </button>

                    {/* View Tracking Link */}
                    <a
                      href={`/tracking/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:border-black dark:hover:border-white transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{language === 'en' ? 'Track' : 'መከታተያ'}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Courier Dispatch Modal */}
      <AnimatePresence>
        {selectedOrderForShip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-150 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#0052FF]" />
                  <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">
                    {language === 'en' ? 'Dispatch Courier Assignment' : 'መልዕክተኛ መድብ እና ላክ'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrderForShip(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                    {language === 'en' ? 'Assigned Courier / Driver Name' : 'የአሽከርካሪ / መልዕክተኛ ስም'}
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. Abebe Kebede"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-semibold outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                    {language === 'en' ? 'Courier Phone Number' : 'የመልዕክተኛ ስልክ ቁጥር'}
                  </label>
                  <input
                    type="text"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    placeholder="+2519..."
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-semibold outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                    {language === 'en' ? 'Dispatch Notes / Zone' : 'የመላኪያ ማስታወሻ'}
                  </label>
                  <textarea
                    rows={2}
                    value={trackingNotes}
                    onChange={(e) => setTrackingNotes(e.target.value)}
                    placeholder="e.g. In transit from Bole hub"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-semibold outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    {language === 'en'
                      ? 'Submitting will automatically dispatch real SMS & Telegram alerts to the customer with driver contact details.'
                      : 'ይህን መላክ ለደንበኛው በኤስኤምኤስ እና በቴሌግራም የአሽከርካሪውን መረጃ በራስ-ሰር ይልካል!'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-150 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForShip(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'ይቅር'}
                </button>
                <button
                  type="button"
                  onClick={() => generateCourierWaybillPDF({ ...selectedOrderForShip, courierName, courierPhone }, { merchantStoreName: currentMerchant.storeName })}
                  className="px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer"
                  title="Print Waybill for physical parcel attachment"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Print Waybill' : 'ማጓጓዣ አትም'}</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFulfillmentAction(selectedOrderForShip.id, 'SHIPPED', { courierName, courierPhone, trackingNotes })}
                  className="px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Dispatch & Alert' : 'ላክ እና አሳውቅ'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShoppingBag, 
  Printer, 
  RotateCcw, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Phone,
  User,
  Check,
  FileText,
  ExternalLink,
  Tag,
  Filter,
  Send,
  Star
} from 'lucide-react';
import { Order, Product, CartItem } from '../types';
import { OrderTrackingVisualizer } from './OrderTrackingVisualizer';
import { OrderCourierMiniMap } from './OrderCourierMiniMap';
import { sendTelegramOrderConfirmation } from '../utils/telegramBot';
import { PostDeliveryReviewModal } from './orders/PostDeliveryReviewModal';

export interface MyOrdersViewProps {
  orders: Order[];
  offlineOrders?: Order[];
  language: 'en' | 'am';
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, variant: any, quantity: number) => void;
  onBuyAgain?: (items: CartItem[]) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: Order['status']) => void;
  customerPhone?: string;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  orders,
  offlineOrders = [],
  language,
  isOpen,
  onClose,
  onAddToCart,
  onBuyAgain,
  onUpdateOrderStatus,
  customerPhone = '+2519',
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED' | 'OFFLINE'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRICE_HIGH' | 'PRICE_LOW'>('NEWEST');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeTabPerOrder, setActiveTabPerOrder] = useState<Record<string, 'ITEMS' | 'TRACKING' | 'RECEIPT' | 'REVIEW'>>({});
  const [trackingViewMode, setTrackingViewMode] = useState<'SPLIT' | 'TIMELINE' | 'MAP'>('SPLIT');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);

  // Combine online and offline orders
  const allOrders = useMemo(() => {
    // Unique orders by ID
    const map = new Map<string, Order>();
    offlineOrders.forEach(o => map.set(o.id, o));
    orders.forEach(o => map.set(o.id, o));
    return Array.from(map.values());
  }, [orders, offlineOrders]);

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter(ord => {
      // Status filter
      const isOffline = offlineOrders.some(o => o.id === ord.id);
      if (selectedFilter === 'OFFLINE' && !isOffline) return false;
      if (selectedFilter === 'DELIVERED' && ord.status !== 'DELIVERED') return false;
      if (selectedFilter === 'CANCELLED' && ord.status !== 'CANCELLED' && ord.status !== 'REFUNDED') return false;
      if (selectedFilter === 'ACTIVE' && ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(ord.status) && !isOffline) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = ord.id.toLowerCase().includes(q);
        const matchesCustomer = ord.customerName.toLowerCase().includes(q) || ord.customerPhone.includes(q);
        const matchesItem = ord.items.some(it => 
          it.product.nameEn.toLowerCase().includes(q) || 
          it.product.nameAm.toLowerCase().includes(q) ||
          it.variantName.toLowerCase().includes(q)
        );
        return matchesId || matchesCustomer || matchesItem;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'PRICE_HIGH') return b.total - a.total;
      if (sortBy === 'PRICE_LOW') return a.total - b.total;
      return 0;
    });
  }, [allOrders, offlineOrders, selectedFilter, searchQuery, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const activeOrders = allOrders.filter(o => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status)).length;
    const totalSpent = allOrders.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + o.total : sum, 0);
    const totalSavings = allOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    return { totalOrders, activeOrders, totalSpent, totalSavings };
  }, [allOrders]);

  if (!isOpen) return null;

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderId(prev => {
      const next = prev === orderId ? null : orderId;
      if (next) {
        setTimeout(() => {
          const el = document.getElementById(`order-card-${orderId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      return next;
    });
  };

  const handleTabChange = (orderId: string, tab: 'ITEMS' | 'TRACKING' | 'RECEIPT' | 'REVIEW') => {
    setActiveTabPerOrder(prev => ({ ...prev, [orderId]: tab }));
    if (expandedOrderId !== orderId) {
      setExpandedOrderId(orderId);
    }
    setTimeout(() => {
      const el = document.getElementById(`order-card-${orderId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleBuyAgain = (ord: Order) => {
    if (onBuyAgain) {
      onBuyAgain(ord.items);
      showToast(
        language === 'en' 
          ? `Added ${ord.items.length} items from #${ord.id} to your cart!` 
          : `${ord.items.length} እቃዎች ከትዕዛዝ #${ord.id} ወደ ጋሪዎ ታክለዋል!`, 
        'success'
      );
    } else if (onAddToCart) {
      ord.items.forEach(item => {
        const variant = item.product.variants.find(v => v.sku === item.sku) || item.product.variants[0];
        if (variant) {
          onAddToCart(item.product, variant, item.quantity);
        }
      });
      showToast(
        language === 'en' 
          ? `Re-ordered items from #${ord.id}!` 
          : `ከትዕዛዝ #${ord.id} እቃዎች በድጋሚ ታዘዋል!`, 
        'success'
      );
    }
  };

  const handleStatusAdvance = (ord: Order) => {
    if (!onUpdateOrderStatus) return;
    const statusFlow: Order['status'][] = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = statusFlow.indexOf(ord.status);
    if (currentIdx !== -1 && currentIdx < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIdx + 1];
      onUpdateOrderStatus(ord.id, nextStatus);
      showToast(
        language === 'en'
          ? `Order #${ord.id} status updated to: ${nextStatus}`
          : `የትዕዛዝ #${ord.id} ሁኔታ ወደ ${nextStatus} ተቀይሯል`,
        'info'
      );
    } else if (ord.status === 'DELIVERED') {
      showToast(
        language === 'en' ? `Order #${ord.id} is already marked as Delivered!` : `ትዕዛዝ #${ord.id} አስቀድሞ ደርሷል!`,
        'info'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[92vh] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-left relative">
        
        {/* Header Ribbon */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-950 via-zinc-900 to-black text-white flex items-center justify-between shrink-0 border-b border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0052FF] text-white flex items-center justify-center shadow-md shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-base font-black uppercase tracking-tight text-white font-sans truncate">
                  {language === 'en' ? 'My Orders & Purchase History' : 'የእኔ ትዕዛዞች እና የገዙት ታሪክ'}
                </h2>
                <span className="bg-white/10 text-white text-[9px] sm:text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/10 shrink-0">
                  {allOrders.length} {language === 'en' ? 'Total' : 'በጠቅላላ'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate">
                {language === 'en' 
                  ? 'Track live deliveries, view receipts, and manage purchases.' 
                  : 'የቀጥታ ስርጭት መከታተያ፣ ደረሰኞችን እና የቀደሙ ትዕዛዞችዎን ይመልከቱ።'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/10 shrink-0 ml-2"
            title={language === 'en' ? 'Close' : 'ዝጋ'}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Compact Top Summary Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-gray-50/80 dark:bg-zinc-850/60 border-b border-gray-150 dark:border-zinc-800 shrink-0">
          <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-gray-150/60 dark:border-zinc-800/80 shadow-2xs flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>{language === 'en' ? 'Total Orders' : 'ትዕዛዞች'}</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-gray-950 dark:text-white font-mono">
              {stats.totalOrders}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-gray-150/60 dark:border-zinc-800/80 shadow-2xs flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'en' ? 'In Transit' : 'በጉዞ ላይ'}</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
              <span>{stats.activeOrders}</span>
              {stats.activeOrders > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-gray-150/60 dark:border-zinc-800/80 shadow-2xs flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'en' ? 'Total Spent' : 'ጠቅላላ ወጪ'}</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.totalSpent.toLocaleString()} ETB
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-gray-150/60 dark:border-zinc-800/80 shadow-2xs flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'en' ? 'Savings' : 'ተቆጠበ'}</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-amber-500 font-mono">
              {stats.totalSavings.toLocaleString()} ETB
            </p>
          </div>
        </div>

        {/* Compact Filter and Search Controls Bar */}
        <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800 shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search order ID, item name, phone...' : 'በትዕዛዝ መለያ፣ እቃ ስም፣ ስልክ ይፈልጉ...'}
                className="w-full pl-8 pr-8 py-1.5 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-750 rounded-xl text-xs font-medium focus:outline-none focus:ring-1.5 focus:ring-[#0052FF] text-gray-900 dark:text-zinc-100 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort selection */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider whitespace-nowrap">
                {language === 'en' ? 'Sort:' : 'ተከታተል:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-750 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-1.5 focus:ring-[#0052FF] cursor-pointer"
              >
                <option value="NEWEST">{language === 'en' ? 'Newest' : 'አዲስ'}</option>
                <option value="OLDEST">{language === 'en' ? 'Oldest' : 'ቆየት ያሉ'}</option>
                <option value="PRICE_HIGH">{language === 'en' ? 'Price High' : 'ከፍተኛ ዋጋ'}</option>
                <option value="PRICE_LOW">{language === 'en' ? 'Price Low' : 'ዝቅተኛ ዋጋ'}</option>
              </select>
            </div>
          </div>

          {/* Filter Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar-x text-xs font-bold no-scrollbar">
            {[
              { id: 'ALL', labelEn: 'All Orders', labelAm: 'ሁሉንም', icon: Package },
              { id: 'ACTIVE', labelEn: 'Active / Transit', labelAm: 'በጉዞ ላይ', icon: Truck },
              { id: 'DELIVERED', labelEn: 'Delivered', labelAm: 'የደረሱ', icon: CheckCircle2 },
              { id: 'CANCELLED', labelEn: 'Cancelled', labelAm: 'የተሰረዙ', icon: AlertCircle },
              { id: 'OFFLINE', labelEn: 'Offline Queued', labelAm: 'ከመስመር ውጭ', icon: RefreshCw }
            ].map((chip) => {
              const ChipIcon = chip.icon;
              const isSelected = selectedFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedFilter(chip.id as any)}
                  className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                    isSelected
                      ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-xs font-extrabold'
                      : 'bg-gray-50 dark:bg-zinc-850 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-750 hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <ChipIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  <span>{language === 'en' ? chip.labelEn : chip.labelAm}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Main Content List with Clean Padding and Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 space-y-4 bg-gray-50/50 dark:bg-zinc-950/50 min-h-0">
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 text-center border border-gray-150 dark:border-zinc-800 shadow-xs max-w-md mx-auto my-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-950 dark:text-white uppercase tracking-tight">
                  {language === 'en' ? 'No Orders Found' : 'ምንም ትዕዛዞች አልተገኙም'}
                </h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                  {searchQuery 
                    ? (language === 'en' ? 'Try adjusting your search terms or status filters.' : 'እባክዎን ፍለጋዎን ያስተካክሉ።')
                    : (language === 'en' ? 'You have not placed any purchases yet.' : 'እስካሁን ምንም ግዢ አልፈጸሙም።')}
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#0052FF] hover:bg-[#003ecf] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{language === 'en' ? 'Explore Products' : 'ምርቶችን ይመልከቱ'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isExpanded = expandedOrderId === ord.id;
              const isOfflinePending = offlineOrders.some(o => o.id === ord.id);
              const activeTab = activeTabPerOrder[ord.id] || 'ITEMS';

              return (
                <div
                  key={ord.id}
                  id={`order-card-${ord.id}`}
                  className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? 'border-2 border-[#0052FF] ring-2 ring-[#0052FF]/30 shadow-xl bg-blue-50/10 dark:bg-blue-950/10' 
                      : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-xs'
                  }`}
                >
                  {/* Order Main Summary Bar */}
                  <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    
                    {/* Left: ID & Metadata */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {isExpanded && (
                          <span className="bg-[#0052FF] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider shadow-xs flex items-center gap-1">
                            <span>★</span>
                            <span>{language === 'en' ? 'SELECTED' : 'የተመረጠ'}</span>
                          </span>
                        )}

                        <span className="font-mono font-black text-sm md:text-base text-gray-950 dark:text-white flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            ord.status === 'DELIVERED' ? 'bg-emerald-500' :
                            ord.status === 'CANCELLED' ? 'bg-red-500' :
                            isOfflinePending ? 'bg-amber-500 animate-pulse' :
                            'bg-[#0052FF] animate-pulse'
                          }`} />
                          #{ord.id}
                        </span>

                        {/* Status Badge */}
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isOfflinePending ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                          ord.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                          ord.status === 'SHIPPED' ? 'bg-[#0052FF]/10 text-[#0052FF] dark:text-blue-400 border border-blue-500/20' :
                          ord.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                          ord.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {isOfflinePending ? (language === 'en' ? 'Offline Queued' : 'ከመስመር ውጭ') :
                           ord.status === 'DELIVERED' ? (language === 'en' ? 'Delivered' : 'ደርሷል') :
                           ord.status === 'SHIPPED' ? (language === 'en' ? 'In Transit' : 'በጉዞ ላይ') :
                           ord.status === 'PROCESSING' ? (language === 'en' ? 'Processing' : 'በዝግጅት ላይ') :
                           ord.status === 'CANCELLED' ? (language === 'en' ? 'Cancelled' : 'ተሰርዟል') :
                           (language === 'en' ? 'Paid & Queued' : 'ተከፍሏል')}
                        </span>

                        {/* Payment Method Badge */}
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                          {ord.paymentMethod}
                        </span>

                        {/* Channel Badge */}
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-[#0052FF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                          {ord.channel || 'WEB'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium pt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(ord.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'am-ET', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {ord.customerName} ({ord.customerPhone})
                        </span>
                      </div>
                    </div>

                    {/* Right: Price Total & Quick Actions */}
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-zinc-800">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider block">
                          {language === 'en' ? 'Total Amount' : 'ጠቅላላ ክፍያ'}
                        </span>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {ord.total.toLocaleString()} ETB
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Telegram Receipt Dispatch Button */}
                        <button
                          onClick={async () => {
                            await sendTelegramOrderConfirmation(ord, language);
                            showToast(
                              language === 'en' 
                                ? `Order #${ord.id} receipt dispatched to Telegram!` 
                                : `የትዕዛዝ #${ord.id} ደረሰኝ በቴሌግራም ተልኳል!`,
                              'success'
                            );
                          }}
                          className="px-3 py-2 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title={language === 'en' ? 'Send Telegram receipt & tracking' : 'የቴሌግራም ደረሰኝ ላክ'}
                        >
                          <Send className="w-3.5 h-3.5 text-sky-500" />
                          <span className="hidden md:inline">{language === 'en' ? 'Telegram Receipt' : 'የቴሌግራም ደረሰኝ'}</span>
                        </button>

                        {/* Post-Delivery Customer Review & Rating Button (DELIVERED exclusive) */}
                        {ord.status === 'DELIVERED' && (
                          <button
                            onClick={() => setReviewingOrder(ord)}
                            className={`px-3 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                              ord.reviewed
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/20'
                            }`}
                            title={language === 'en' ? 'Review & Rate delivered items' : 'ደረጃ እና አስተያየት ይስጡ'}
                          >
                            <Star className={`w-3.5 h-3.5 ${ord.reviewed ? 'fill-amber-500 text-amber-500' : 'fill-white text-white'}`} />
                            <span className="hidden sm:inline">
                              {ord.reviewed ? (language === 'en' ? 'Reviewed ★' : 'ተገምግሟል ★') : (language === 'en' ? 'Review & Rate' : 'ደረጃ ይስጡ')}
                            </span>
                          </button>
                        )}

                        {/* Buy Again Button */}
                        <button
                          onClick={() => handleBuyAgain(ord)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-800 dark:text-zinc-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          title={language === 'en' ? 'Re-order these items' : 'በድጋሚ እዘዝ'}
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#0052FF]" />
                          <span className="hidden sm:inline">{language === 'en' ? 'Buy Again' : 'በድጋሚ እዘዝ'}</span>
                        </button>

                        {/* Toggle Details Expand */}
                        <button
                          onClick={() => toggleExpandOrder(ord.id)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isExpanded 
                              ? 'bg-[#0052FF] text-white border-[#0052FF]' 
                              : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-750 hover:border-gray-300'
                          }`}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item Thumbnails Bar (visible when collapsed for quick glance) */}
                  {!isExpanded && (
                    <div className="px-5 py-3 bg-gray-50/50 dark:bg-zinc-850/40 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-zinc-800/80">
                      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-gray-150 dark:border-zinc-800 shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.nameEn}
                              className="w-8 h-8 object-cover rounded-lg bg-gray-100 dark:bg-zinc-800"
                            />
                            <div className="text-[10px] pr-1">
                              <p className="font-extrabold text-gray-900 dark:text-white truncate max-w-[110px]">
                                {language === 'en' ? item.product.nameEn : item.product.nameAm}
                              </p>
                              <p className="text-gray-400 font-mono">
                                x{item.quantity} • {item.price.toLocaleString()} ETB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => toggleExpandOrder(ord.id)}
                        className="text-[11px] font-black text-[#0052FF] hover:underline shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <span>{language === 'en' ? 'View Details' : 'ዝርዝር ተመልከት'}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Expanded Order View Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-gray-50/70 dark:bg-zinc-950/60 space-y-4 border-t border-gray-150 dark:border-zinc-800">
                      
                      {/* Internal Sub-Tabs Navigation */}
                      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3 flex-wrap">
                        <button
                          onClick={() => handleTabChange(ord.id, 'ITEMS')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                            activeTab === 'ITEMS'
                              ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                              : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Purchased Items' : 'የተገዙ እቃዎች'} ({ord.items.length})</span>
                        </button>

                        <button
                          onClick={() => handleTabChange(ord.id, 'TRACKING')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                            activeTab === 'TRACKING'
                              ? 'bg-[#0052FF] text-white shadow-xs'
                              : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Live Courier Tracking' : 'የቀጥታ ስርጭት መከታተያ'}</span>
                          {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </button>

                        {/* Post-Delivery Review Sub-Tab (DELIVERED exclusive) */}
                        {ord.status === 'DELIVERED' && (
                          <button
                            onClick={() => handleTabChange(ord.id, 'REVIEW')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                              activeTab === 'REVIEW'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${activeTab === 'REVIEW' || ord.reviewed ? 'fill-current' : ''}`} />
                            <span>
                              {ord.reviewed 
                                ? (language === 'en' ? 'Verified Review ★' : 'የተረጋገጠ ግምገማ ★') 
                                : (language === 'en' ? 'Review & Rate' : 'ደረጃ ይስጡ')}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5 text-gray-500" />
                          <span>{language === 'en' ? 'Print Receipt' : 'ደረሰኝ አትም'}</span>
                        </button>
                      </div>

                      {/* SUB TAB 1: ITEMS BREAKDOWN */}
                      {activeTab === 'ITEMS' && (
                        <div className="space-y-4">
                          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-4 space-y-3">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-[#0052FF]" />
                              <span>{language === 'en' ? 'Order Contents' : 'የትዕዛዝ ይዘት'}</span>
                            </h4>

                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={item.product.image}
                                      alt={item.product.nameEn}
                                      className="w-12 h-12 object-cover rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 shrink-0"
                                    />
                                    <div className="min-w-0 space-y-0.5">
                                      <h5 className="font-extrabold text-xs text-gray-950 dark:text-white truncate">
                                        {language === 'en' ? item.product.nameEn : item.product.nameAm}
                                      </h5>
                                      <p className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                                        <span>SKU: {item.sku}</span>
                                        <span>•</span>
                                        <span>Variant: {item.variantName}</span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <p className="font-mono font-extrabold text-xs text-gray-950 dark:text-white">
                                      {(item.price * item.quantity).toLocaleString()} ETB
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-mono">
                                      {item.quantity} x {item.price.toLocaleString()} ETB
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping & Financial Breakdown Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Shipping Details */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-4 space-y-2.5">
                              <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                <span>{language === 'en' ? 'Delivery Destination' : 'የመድረሻ አድራሻ'}</span>
                              </h4>
                              
                              <div className="space-y-1 text-xs text-gray-700 dark:text-zinc-300">
                                <p className="font-extrabold text-gray-950 dark:text-white">{ord.customerName}</p>
                                <p className="font-mono text-gray-500 dark:text-zinc-400">{ord.customerPhone}</p>
                                <p className="font-medium text-gray-600 dark:text-zinc-300 leading-relaxed bg-gray-50 dark:bg-zinc-850 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800">
                                  {ord.shippingAddress}
                                </p>
                                <div className="pt-2">
                                  <OrderCourierMiniMap
                                    language={language}
                                    shippingAddress={ord.shippingAddress}
                                    orderId={ord.id}
                                    orderStatus={ord.status}
                                    customerName={ord.customerName}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-4 space-y-2 text-xs">
                              <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{language === 'en' ? 'Financial Summary' : 'የክፍያ ማጠቃለያ'}</span>
                              </h4>

                              <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                                  <span>{language === 'en' ? 'Subtotal' : 'የእቃዎች ዋጋ'}:</span>
                                  <span className="font-mono font-bold text-gray-900 dark:text-zinc-200">
                                    {ord.subtotal.toLocaleString()} ETB
                                  </span>
                                </div>

                                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                                  <span>{language === 'en' ? 'Shipping Fee' : 'የማጓጓዣ ክፍያ'}:</span>
                                  <span className="font-mono font-bold text-gray-900 dark:text-zinc-200">
                                    {ord.shippingFee === 0 ? 'FREE' : `${ord.shippingFee.toLocaleString()} ETB`}
                                  </span>
                                </div>

                                {ord.discountAmount && ord.discountAmount > 0 && (
                                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                                    <span className="flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {language === 'en' ? 'Discount Code' : 'የቅናሽ ኮድ'} ({ord.discountCode}):
                                    </span>
                                    <span className="font-mono">
                                      -{ord.discountAmount.toLocaleString()} ETB
                                    </span>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-sm font-black text-gray-950 dark:text-white">
                                  <span>{language === 'en' ? 'Net Paid' : 'ጠቅላላ የተከፈለ'}:</span>
                                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                                    {ord.total.toLocaleString()} ETB
                                  </span>
                                </div>
                              </div>

                              {/* Demo Status Advance Trigger */}
                              {onUpdateOrderStatus && (
                                <div className="pt-2">
                                  <button
                                    onClick={() => handleStatusAdvance(ord)}
                                    className="w-full py-2 bg-zinc-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    <span>{language === 'en' ? 'Simulate Next Status Step' : 'ቀጣዩን ደረጃ አስመስል'}</span>
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      )}

                      {/* SUB TAB 2: LIVE TRACKING & RADAR */}
                      {activeTab === 'TRACKING' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          
                          {/* Tracking Mode Selection Bar */}
                          <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                            <span className="text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-[#0052FF]" />
                              <span>{language === 'en' ? 'Tracking View Options:' : 'የመከታተያ እይታዎች:'}</span>
                            </span>

                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => setTrackingViewMode('SPLIT')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                  trackingViewMode === 'SPLIT'
                                    ? 'bg-[#0052FF] text-white shadow-xs'
                                    : 'text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                                }`}
                              >
                                {language === 'en' ? 'Side-By-Side' : 'ሁለቱንም'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setTrackingViewMode('TIMELINE')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                  trackingViewMode === 'TIMELINE'
                                    ? 'bg-[#0052FF] text-white shadow-xs'
                                    : 'text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                                }`}
                              >
                                {language === 'en' ? 'Timeline Stepper' : 'የደረጃ ሂደት'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setTrackingViewMode('MAP')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                  trackingViewMode === 'MAP'
                                    ? 'bg-[#0052FF] text-white shadow-xs'
                                    : 'text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                                }`}
                              >
                                {language === 'en' ? 'GPS Radar Map' : 'የጂፒኤስ ራዳር'}
                              </button>
                            </div>
                          </div>

                          {/* Tracking Content Grid */}
                          <div className={
                            trackingViewMode === 'SPLIT' 
                              ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 items-start' 
                              : 'space-y-4'
                          }>
                            
                            {/* Timeline Stepper */}
                            {(trackingViewMode === 'SPLIT' || trackingViewMode === 'TIMELINE') && (
                              <OrderTrackingVisualizer
                                order={ord}
                                language={language}
                                showItemsSummary={false}
                                onStatusChange={(newStatus) => {
                                  if (onUpdateOrderStatus) {
                                    onUpdateOrderStatus(ord.id, newStatus);
                                  }
                                }}
                              />
                            )}

                            {/* Live Courier Dispatch Status */}
                            {(trackingViewMode === 'SPLIT' || trackingViewMode === 'MAP') && (
                              <div className="space-y-2.5">
                                <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-gray-150 dark:border-zinc-800">
                                  <h4 className="text-[10px] uppercase font-black text-gray-700 dark:text-zinc-200 tracking-wider flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-[#0052FF]" />
                                    <span>{language === 'en' ? 'Courier Dispatch Status' : 'የመልዕክተኛ ሁኔታ'}</span>
                                  </h4>
                                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>{language === 'en' ? 'Active Dispatch' : 'ገቢር'}</span>
                                  </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 space-y-3 text-xs">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-bold text-gray-900 dark:text-zinc-100">
                                        {ord.courierName || (language === 'en' ? 'Assigned Express Courier' : 'የተመደበ ፈጣን መልዕክተኛ')}
                                      </p>
                                      <p className="text-[11px] text-gray-500">
                                        {ord.courierPhone ? `📞 ${ord.courierPhone}` : (language === 'en' ? 'Addis Ababa Courier Fleet' : 'የአዲስ አበባ መልዕክተኞች')}
                                      </p>
                                    </div>
                                    {ord.courierPhone && (
                                      <a
                                        href={`tel:${ord.courierPhone.replace(/\s+/g, '')}`}
                                        className="px-3 py-1.5 rounded-xl bg-[#0052FF] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>{language === 'en' ? 'Call' : 'ደውል'}</span>
                                      </a>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-gray-200 dark:border-zinc-850 flex items-center justify-between text-[11px]">
                                    <span className="text-gray-400">{language === 'en' ? 'Delivery SLA:' : 'የማድረሻ ጊዜ:'} <b>1 - 3 Hours</b></span>
                                    <a
                                      href={`/tracking/${ord.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-bold text-[#0052FF] hover:underline flex items-center gap-1"
                                    >
                                      <span>{language === 'en' ? 'Full Tracking Page' : 'ሙሉ መከታተያ'}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      {/* SUB TAB 3: POST-DELIVERY REVIEWS & RATINGS (DELIVERED exclusive) */}
                      {activeTab === 'REVIEW' && ord.status === 'DELIVERED' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                                  <Star className="w-6 h-6 fill-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-gray-950 dark:text-white">
                                      {language === 'en' ? 'Verified Post-Delivery Review' : 'የተረጋገጠ የገዢ ደረጃ እና አስተያየት'}
                                    </h4>
                                    {ord.reviewed && (
                                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>{language === 'en' ? 'Verified' : 'የተረጋገጠ'}</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1">
                                    {ord.reviewed
                                      ? (language === 'en'
                                          ? 'Your rating and feedback helps other Ethiopian shoppers shop with confidence.'
                                          : 'የሰጡት ደረጃ እና አስተያየት ሌሎች ኢትዮጵያውያን ሸማቾችን ይረዳል።')
                                      : (language === 'en'
                                          ? 'Rate your items and express courier delivery speed to earn verified buyer status.'
                                          : 'ስለ እቃው ጥራት እና ስለ ማድረሻ ፍጥነቱ ደረጃ ይስጡ።')}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => setReviewingOrder(ord)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
                              >
                                <Star className="w-4 h-4 fill-white" />
                                <span>
                                  {ord.reviewed
                                    ? (language === 'en' ? 'Edit / Add Review' : 'ግምገማ አሻሽል / ጨምር')
                                    : (language === 'en' ? 'Write Review (⭐)' : 'ደረጃ ይስጡ (⭐)')}
                                </span>
                              </button>
                            </div>

                            {/* List of reviews for this order */}
                            {ord.orderReviews && ord.orderReviews.length > 0 ? (
                              <div className="space-y-3 pt-2">
                                <h5 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                                  {language === 'en' ? 'Your Submitted Ratings' : 'ያስገቧቸው ግምገማዎች'}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {ord.orderReviews.map((rev, rIdx) => {
                                    const matchingItem = ord.items.find(it => it.product.id === rev.productId);
                                    return (
                                      <div key={rIdx} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1 text-amber-500">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                              <Star
                                                key={s}
                                                className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-gray-300 dark:text-zinc-700'}`}
                                              />
                                            ))}
                                            <span className="font-bold text-xs ml-1 text-gray-900 dark:text-white">{rev.rating}/5</span>
                                          </div>
                                          <span className="text-[10px] text-gray-400 font-mono">
                                            {new Date(rev.createdAt).toLocaleDateString()}
                                          </span>
                                        </div>

                                        {matchingItem && (
                                          <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">
                                            {language === 'en' ? matchingItem.product.nameEn : matchingItem.product.nameAm}
                                          </p>
                                        )}

                                        <p className="text-xs text-gray-600 dark:text-zinc-300 italic bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                                          "{rev.comment}"
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-dashed border-amber-300 dark:border-amber-800/60 text-center space-y-2">
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                  {language === 'en'
                                    ? 'No reviews submitted yet for this delivered order.'
                                    : 'ለዚህ የደረሰ ትዕዛዝ እስካሁን ምንም ግምገማ አልተሰጠም።'}
                                </p>
                                <button
                                  onClick={() => setReviewingOrder(ord)}
                                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                                >
                                  {language === 'en' ? 'Click here to rate your experience' : 'ደረጃ ለመስጠት እዚህ ይጫኑ'} →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Modal Sticky Bottom Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-150 dark:border-zinc-800 flex items-center justify-between shrink-0 text-xs z-10">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 font-medium min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              {language === 'en' 
                ? 'All purchases are backed by Kasma 100% Escrow Buyer Protection.' 
                : 'ሁሉም ግዢዎች በካስማ 100% የእምነት ዋስትና የተጠበቁ ናቸው።'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer shrink-0 ml-3"
          >
            {language === 'en' ? 'Close Window' : 'መስኮት ዝጋ'}
          </button>
        </div>

      </div>

      {/* Official Printable Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="printable-receipt-modal bg-white text-gray-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 text-left relative font-sans">
            
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="no-print-action absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Top Brand Header */}
            <div className="text-center space-y-1.5 border-b border-gray-200 pb-5">
              <div className="inline-flex items-center gap-2 text-[#0052FF] font-black text-xl tracking-tight uppercase">
                <ShoppingBag className="w-6 h-6" />
                <span>KASMA COMMERCE</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">
                {language === 'en' ? 'Official E-Commerce Tax Invoice & Receipt' : 'የገበያ ደረሰኝ እና የግብር ማረጋገጫ'}
              </p>
              <p className="text-[11px] font-mono text-gray-400">
                Addis Ababa, Ethiopia • Support: +251 911 223 344
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs font-mono">
              <div>
                <span className="text-[9px] text-gray-400 uppercase block font-bold">Order Reference</span>
                <span className="font-extrabold text-gray-900">#{selectedReceiptOrder.id}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 uppercase block font-bold">Date & Time</span>
                <span className="font-extrabold text-gray-900">
                  {new Date(selectedReceiptOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 uppercase block font-bold">Payment Method</span>
                <span className="font-extrabold text-[#0052FF]">{selectedReceiptOrder.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 uppercase block font-bold">Status</span>
                <span className="font-extrabold text-emerald-600">{selectedReceiptOrder.status}</span>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Customer Details</span>
              <p className="font-bold text-gray-900">{selectedReceiptOrder.customerName} ({selectedReceiptOrder.customerPhone})</p>
              <p className="text-gray-600 font-medium">{selectedReceiptOrder.shippingAddress}</p>
              
              <div className="no-print-action pt-2">
                <OrderCourierMiniMap
                  language={language}
                  shippingAddress={selectedReceiptOrder.shippingAddress}
                  orderId={selectedReceiptOrder.id}
                  orderStatus={selectedReceiptOrder.status}
                  customerName={selectedReceiptOrder.customerName}
                />
              </div>
            </div>

            {/* Line items table */}
            <div className="space-y-2 border-t border-b border-gray-200 py-3 text-xs">
              <div className="flex justify-between font-black text-[10px] text-gray-400 uppercase">
                <span>Item</span>
                <span>Total</span>
              </div>

              {selectedReceiptOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{item.product.nameEn}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.quantity} x {item.price.toLocaleString()} ETB ({item.variantName})</p>
                  </div>
                  <span className="font-mono font-bold text-gray-900">
                    {(item.price * item.quantity).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>

            {/* Total Math */}
            <div className="space-y-1 text-xs font-mono text-right">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{selectedReceiptOrder.subtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping:</span>
                <span>{selectedReceiptOrder.shippingFee === 0 ? 'FREE' : `${selectedReceiptOrder.shippingFee.toLocaleString()} ETB`}</span>
              </div>
              {selectedReceiptOrder.discountAmount && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({selectedReceiptOrder.discountCode}):</span>
                  <span>-{selectedReceiptOrder.discountAmount.toLocaleString()} ETB</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-600">{selectedReceiptOrder.total.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="no-print-action flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-grow py-3 bg-[#0052FF] hover:bg-[#003ecf] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Post-Delivery Customer Review & Rating Modal (DELIVERED exclusive) */}
      {reviewingOrder && (
        <PostDeliveryReviewModal
          order={reviewingOrder}
          isOpen={Boolean(reviewingOrder)}
          onClose={() => setReviewingOrder(null)}
          language={language}
        />
      )}
    </div>
  );
};

export default MyOrdersView;

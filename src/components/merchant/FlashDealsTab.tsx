import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Zap, 
  Sparkles, 
  Clock, 
  Tag, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  X, 
  ArrowRight,
  ShieldCheck,
  Percent,
  Calendar,
  Layers,
  ShoppingBag,
  Info,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Merchant, FlashDealNomination } from '../../types';

interface FlashDealsTabProps {
  products: Product[];
  currentMerchant: Merchant;
  flashDeals: FlashDealNomination[];
  language: 'en' | 'am';
  onNominateFlashDeal: (merchantId: string, data: {
    productId: string;
    discountPct: number;
    dealStock: number;
    durationHours?: number;
    bannerTag?: string;
    campaignTitle?: string;
    notes?: string;
  }) => Promise<{ success: boolean; flashDeal?: FlashDealNomination; error?: string }>;
  onCancelFlashDeal: (merchantId: string, dealId: string) => Promise<{ success: boolean; error?: string }>;
  showToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
  onNavigateToCatalog?: () => void;
  initialProductId?: string;
}

export const FlashDealsTab: React.FC<FlashDealsTabProps> = ({
  products,
  currentMerchant,
  flashDeals,
  language,
  onNominateFlashDeal,
  onCancelFlashDeal,
  showToast,
  onNavigateToCatalog,
  initialProductId
}) => {
  // Filter products belonging to this merchant
  const merchantProducts = useMemo(() => {
    return products.filter(p => p.merchantId === currentMerchant.id && p.status === 'APPROVED');
  }, [products, currentMerchant.id]);

  // Merchant nominations
  const merchantDeals = useMemo(() => {
    return flashDeals.filter(d => d.merchantId === currentMerchant.id);
  }, [flashDeals, currentMerchant.id]);

  // Form state
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(Boolean(initialProductId));
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || (merchantProducts[0]?.id || '')
  );
  const [discountPct, setDiscountPct] = useState<number>(15); // Default to 15% as specifically requested
  const [dealStock, setDealStock] = useState<number>(5);
  const [durationHours, setDurationHours] = useState<number>(48);
  const [bannerTag, setBannerTag] = useState<string>('15% OFF FLASH');
  const [campaignTitle, setCampaignTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state for nominations list
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CANCELLED'>('ALL');

  // Currently selected product details
  const selectedProduct = useMemo(() => {
    return merchantProducts.find(p => p.id === selectedProductId) || merchantProducts[0];
  }, [merchantProducts, selectedProductId]);

  // Total available stock for selected product
  const availableStock = useMemo(() => {
    if (!selectedProduct) return 0;
    return selectedProduct.variants.reduce((sum, v) => sum + (v.onHand || 0), 0);
  }, [selectedProduct]);

  // Calculated flash deal prices
  const originalPrice = selectedProduct?.price || 0;
  const flashPrice = Math.round(originalPrice * (1 - discountPct / 100));
  const customerSavings = originalPrice - flashPrice;

  // Sync banner tag when discount changes if tag is default
  const handleDiscountChange = (newDiscount: number) => {
    setDiscountPct(newDiscount);
    if (bannerTag.includes('% OFF')) {
      setBannerTag(`${newDiscount}% OFF FLASH`);
    }
  };

  const handleSubmitNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      showToast(
        language === 'en' ? 'Please select an approved product from your catalog.' : 'እባክዎ ከተፈቀዱ ምርቶችዎ ውስጥ ይምረጡ።',
        'warning'
      );
      return;
    }

    if (discountPct < 5 || discountPct > 75) {
      showToast(
        language === 'en' ? 'Discount percentage must be between 5% and 75%.' : 'የቅናሽ መቶኛ በ5% እና 75% መካከል መሆን አለበት።',
        'warning'
      );
      return;
    }

    if (dealStock < 1) {
      showToast(
        language === 'en' ? 'Deal inventory allocation must be at least 1 unit.' : 'ለቅናሽ የተመደበው እቃ ቢያንስ 1 መሆን አለበት።',
        'warning'
      );
      return;
    }

    if (dealStock > availableStock) {
      showToast(
        language === 'en'
          ? `Deal allocation (${dealStock}) exceeds available stock (${availableStock}).`
          : `የተመደበው እቃ (${dealStock}) ካለው ክምችት (${availableStock}) ይበልጣል።`,
        'warning'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onNominateFlashDeal(currentMerchant.id, {
        productId: selectedProduct.id,
        discountPct,
        dealStock,
        durationHours,
        bannerTag: bannerTag.trim() || `${discountPct}% OFF FLASH`,
        campaignTitle: campaignTitle.trim() || `${selectedProduct.nameEn} - ${discountPct}% Off Flash Deal`,
        notes: notes.trim()
      });

      if (result.success) {
        setIsNominateModalOpen(false);
        setCampaignTitle('');
        setNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDeal = async (dealId: string) => {
    if (confirm(language === 'en' ? 'Are you sure you want to cancel this Flash Deal on Kasma homepage?' : 'እርግጠኛ ነዎት ይህን የፈጣን ቅናሽ ዘመቻ ከዋናው ገጽ መሰረዝ ይፈልጋሉ?')) {
      await onCancelFlashDeal(currentMerchant.id, dealId);
    }
  };

  const filteredDeals = useMemo(() => {
    if (statusFilter === 'ACTIVE') return merchantDeals.filter(d => d.status === 'ACTIVE');
    if (statusFilter === 'CANCELLED') return merchantDeals.filter(d => d.status === 'CANCELLED' || d.status === 'EXPIRED');
    return merchantDeals;
  }, [merchantDeals, statusFilter]);

  // Statistics
  const activeDealsCount = useMemo(() => merchantDeals.filter(d => d.status === 'ACTIVE').length, [merchantDeals]);
  const totalUnitsAllocated = useMemo(() => merchantDeals.filter(d => d.status === 'ACTIVE').reduce((sum, d) => sum + d.dealStock, 0), [merchantDeals]);
  const totalUnitsClaimed = useMemo(() => merchantDeals.filter(d => d.status === 'ACTIVE').reduce((sum, d) => sum + d.claimedStock, 0), [merchantDeals]);

  return (
    <div className="space-y-6 max-w-full">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-600 via-amber-600 to-rose-600 dark:from-orange-950 dark:via-amber-950 dark:to-zinc-950 p-4 sm:p-7 text-white shadow-xl border border-orange-500/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-black/30 backdrop-blur-md text-amber-300 border border-white/20 shadow-xs flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-300 text-amber-300 animate-pulse" />
              </span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-200 bg-black/25 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                {language === 'en' ? 'Homepage Promotion Desk' : 'የዋናው ገጽ ቅናሽ ማዕከል'}
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              {language === 'en' ? 'Flash Deal Merchant Nominations' : 'የፈጣን ቅናሽ ምርት መረጣዎች'}
            </h1>
            
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
              {language === 'en'
                ? 'Nominate your products with authentic merchant discounts (e.g. 15% off) to be featured prominently on Kasma’s homepage Flash Deals banner.'
                : 'ምርቶችዎን በእውነተኛ የነጋዴ ቅናሾች (ለምሳሌ 15% ቅናሽ) በማቅረብ በካስማ ዋና ገጽ የፈጣን ሽያጭ ባነር ላይ በደማቁ እንዲታዩ ያድርጉ።'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
            <button
              onClick={() => setIsNominateModalOpen(true)}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-white text-orange-700 hover:bg-amber-50 active:scale-95 font-black text-xs sm:text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-white/50"
            >
              <Zap className="w-4 h-4 fill-orange-600 text-orange-600" />
              <span>{language === 'en' ? '+ Nominate Flash Deal' : '+ አዲስ ቅናሽ ምረጥ'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-5 relative z-10 border-t border-white/15 mt-5">
          <div className="bg-black/25 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Live on Homepage' : 'በዋና ገጽ ላይ የሚታዩ'}
              </p>
              <p className="text-xl font-black text-white">{activeDealsCount} <span className="text-xs font-semibold text-amber-300">{language === 'en' ? 'Active' : 'ቀጥታ'}</span></p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
              ✓
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Reserved Inventory' : 'ለቅናሽ የተመደበ ክምችት'}
              </p>
              <p className="text-xl font-black text-white">{totalUnitsAllocated} <span className="text-xs font-semibold text-amber-300">{language === 'en' ? 'Units' : 'ፍሬዎች'}</span></p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Customer Claims' : 'የተገዙ ቅናሾች'}
              </p>
              <p className="text-xl font-black text-white">{totalUnitsClaimed} <span className="text-xs font-semibold text-amber-300">{totalUnitsAllocated > 0 ? `${Math.round((totalUnitsClaimed / totalUnitsAllocated) * 100)}%` : '0%'}</span></p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Filter and Deal Nominations List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-4 sm:p-6 shadow-xs space-y-4">
        
        {/* Sub-header with Tabs & Help Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>{language === 'en' ? 'Your Nominated Flash Deals' : 'እርስዎ የመረጧቸው የፈጣን ቅናሾች'}</span>
            </h2>
            <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
              {merchantDeals.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-zinc-800'
              }`}
            >
              {language === 'en' ? 'All Deals' : 'ሁሉም'}
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'ACTIVE'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-zinc-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'en' ? 'Active on Homepage' : 'በዋና ገጽ ላይ'}</span>
            </button>
            <button
              onClick={() => setStatusFilter('CANCELLED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'CANCELLED'
                  ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-zinc-800'
              }`}
            >
              {language === 'en' ? 'Past / Inactive' : 'ያለፉ / የተሰረዙ'}
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-gray-50/50 dark:bg-zinc-950/40 border border-dashed border-gray-200 dark:border-zinc-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-inner">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white">
                {language === 'en' ? 'No Flash Deal Nominations Found' : 'ምንም የፈጣን ቅናሽ አልተገኘም'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-normal">
                {language === 'en'
                  ? 'Boost your store revenue by nominating products with discounts (e.g. 15% off) to appear on the homepage Flash Deals section.'
                  : 'ምርቶችዎን በቅናሽ (ለምሳሌ 15% ቅናሽ) በማቅረብ በዋናው ገጽ ላይ እንዲታዩ በማድረግ የሱቅ ገቢዎን ያሳድጉ።'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsNominateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {language === 'en' ? 'Nominate Product Now →' : 'አሁን ምርት ምረጥ →'}
              </button>
            </div>
          </div>
        )}

        {/* Flash Deals Cards / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredDeals.map((deal) => {
            const isActive = deal.status === 'ACTIVE';
            const claimProgress = deal.dealStock > 0 ? Math.min(100, Math.round((deal.claimedStock / deal.dealStock) * 100)) : 0;
            const savings = deal.originalPrice - deal.flashPrice;

            return (
              <div 
                key={deal.id}
                className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isActive 
                    ? 'bg-white dark:bg-zinc-950 border-orange-200 dark:border-orange-900/60 ring-1 ring-orange-500/10'
                    : 'bg-gray-50/60 dark:bg-zinc-900/40 border-gray-200 dark:border-zinc-800 opacity-80'
                }`}
              >
                {/* Card Top: Badges & Status */}
                <div className="p-3.5 sm:p-4 border-b border-gray-100 dark:border-zinc-850/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white shadow-xs shrink-0 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>{deal.bannerTag || `${deal.discountPct}% OFF`}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold truncate">
                      {deal.category}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                    isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span>{isActive ? (language === 'en' ? 'LIVE BANNER' : 'በቀጥታ') : deal.status}</span>
                  </span>
                </div>

                {/* Card Body: Product Info & Pricing */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  <div className="flex gap-3 items-start">
                    <img 
                      src={deal.productImage} 
                      alt={deal.productNameEn} 
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-gray-100 dark:bg-zinc-800 border border-gray-150 dark:border-zinc-800 shrink-0 shadow-xs" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {language === 'en' ? deal.productNameEn : deal.productNameAm}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono pt-1">
                        ID: {deal.productId}
                      </p>
                    </div>
                  </div>

                  {/* Financial Price Breakdown Box */}
                  <div className="bg-gradient-to-br from-orange-50/70 to-amber-50/70 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-3 border border-orange-100 dark:border-orange-900/40 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase">
                        {language === 'en' ? 'Flash Deal Price' : 'የፈጣን ቅናሽ ዋጋ'}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black font-mono text-orange-600 dark:text-orange-400">
                          {deal.flashPrice.toLocaleString()} <span className="text-[10px] font-sans">ETB</span>
                        </span>
                        <span className="text-[11px] font-mono text-gray-400 line-through">
                          {deal.originalPrice.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] pt-0.5 border-t border-orange-200/50 dark:border-orange-900/30">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {language === 'en' ? `Shopper Saves: ${savings.toLocaleString()} ETB` : `ገዢው የሚቆጥበው፡ ${savings.toLocaleString()} ብር`}
                      </span>
                      <span className="bg-orange-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded font-mono">
                        -{deal.discountPct}%
                      </span>
                    </div>
                  </div>

                  {/* Claimed Inventory Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-500 dark:text-zinc-400">
                        {language === 'en' ? 'Deal Stock Claimed:' : 'የተሸጠ መጠን:'}
                      </span>
                      <span className="text-gray-800 dark:text-zinc-200 font-mono">
                        {deal.claimedStock} / {deal.dealStock} units ({claimProgress}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${claimProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Duration Schedule */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span>{language === 'en' ? `Duration: ${deal.durationHours}h` : `ቆይታ፡ ${deal.durationHours} ሰዓት`}</span>
                    </span>
                    <span className="truncate">
                      {new Date(deal.endDate).toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-gray-50/80 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-850 flex items-center justify-between gap-2">
                  <a
                    href="/#featured-deals-section"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'View on Homepage' : 'በዋና ገጽ እይ'}</span>
                  </a>

                  {isActive && (
                    <button
                      onClick={() => handleCancelDeal(deal.id)}
                      className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer border border-red-200 dark:border-red-900/40"
                    >
                      {language === 'en' ? 'Cancel Deal' : 'ዘመቻውን ሰርዝ'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nomination Form Modal */}
      <AnimatePresence>
        {isNominateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-gray-150 dark:border-zinc-800 space-y-4 my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <Flame className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white">
                      {language === 'en' ? 'Nominate Product for Flash Deals' : 'ምርት ለፈጣን ቅናሽ ምረጥ'}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {language === 'en' ? 'Feature in Kasma’s top homepage banner with custom discounts' : 'በካስማ የፊት ገጽ ባነር ላይ በልዩ ቅናሽ እንዲታይ ያድርጉ'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNominateModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {merchantProducts.length === 0 ? (
                <div className="p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">
                    {language === 'en' ? 'No approved catalog products available.' : 'ምንም የተፈቀደ ካታሎግ ምርት የለም።'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === 'en' ? 'Add products to your catalog and ensure they are approved before nominating them for Flash Deals.' : 'ለፈጣን ቅናሽ ከመምረጥዎ በፊት ምርቶችን ወደ ካታሎግዎ ያስገቡ።'}
                  </p>
                  <button
                    onClick={() => {
                      setIsNominateModalOpen(false);
                      onNavigateToCatalog?.();
                    }}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black cursor-pointer"
                  >
                    {language === 'en' ? 'Go to Product Catalog' : 'ወደ ምርት ካታሎግ ሂድ'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitNomination} className="space-y-4">
                  {/* Step 1: Select Product */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black uppercase text-gray-700 dark:text-zinc-300">
                      {language === 'en' ? '1. Select Approved Product' : '1. የተፈቀደ ምርት ይምረጡ'}
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {merchantProducts.map(p => {
                        const stock = p.variants.reduce((acc, v) => acc + (v.onHand || 0), 0);
                        return (
                          <option key={p.id} value={p.id}>
                            {language === 'en' ? p.nameEn : p.nameAm} — {p.price.toLocaleString()} ETB ({stock} in stock)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Step 2: Set Discount Percentage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase text-gray-700 dark:text-zinc-300">
                        {language === 'en' ? '2. Discount Percentage' : '2. የቅናሽ መቶኛ'}
                      </label>
                      <span className="text-xs font-black font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                        -{discountPct}% OFF
                      </span>
                    </div>

                    {/* Quick percentage preset chips (including 15% requested) */}
                    <div className="flex flex-wrap gap-1.5">
                      {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleDiscountChange(pct)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            discountPct === pct
                              ? 'bg-orange-600 text-white shadow-xs scale-105'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {pct}% {pct === 15 ? '⭐' : ''}
                        </button>
                      ))}
                    </div>

                    {/* Range slider for smooth control */}
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={1}
                      value={discountPct}
                      onChange={(e) => handleDiscountChange(Number(e.target.value))}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>

                  {/* Live Financial Breakdown Box */}
                  <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent p-3.5 rounded-2xl border border-orange-300/40 dark:border-orange-800/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-zinc-400 font-bold">
                        {language === 'en' ? 'Original Retail Price:' : 'መደበኛ ዋጋ:'}
                      </span>
                      <span className="font-mono font-bold text-gray-700 dark:text-zinc-300">
                        {originalPrice.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-600 dark:text-orange-400 font-bold">
                        {language === 'en' ? `Nominated Discount (-${discountPct}%):` : `የተሰጠው ቅናሽ (-${discountPct}%):`}
                      </span>
                      <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                        -{customerSavings.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm font-black pt-1.5 border-t border-orange-200 dark:border-orange-850">
                      <span className="text-gray-900 dark:text-white">
                        {language === 'en' ? 'Promotional Flash Deal Price:' : 'የፈጣን ቅናሽ የመጨረሻ ዋጋ:'}
                      </span>
                      <span className="font-mono text-base text-orange-600 dark:text-orange-400">
                        {flashPrice.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Deal Stock & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-zinc-300">
                        {language === 'en' ? '3. Deal Stock Allocation' : '3. ለቅናሽ የሚመደብ ብዛት'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={availableStock || 100}
                        value={dealStock}
                        onChange={(e) => setDealStock(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                        placeholder="e.g. 5"
                        required
                      />
                      <p className="text-[10px] text-gray-400">
                        {language === 'en' ? `Available in inventory: ${availableStock} units` : `በክምችት ያለው፡ ${availableStock} ፍሬዎች`}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-zinc-300">
                        {language === 'en' ? '4. Campaign Duration' : '4. የዘመቻው ቆይታ'}
                      </label>
                      <select
                        value={durationHours}
                        onChange={(e) => setDurationHours(Number(e.target.value))}
                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                      >
                        <option value={24}>{language === 'en' ? '24 Hours (Lightning Drop)' : '24 ሰዓት (ፈጣን)'}</option>
                        <option value={48}>{language === 'en' ? '48 Hours (Standard Flash)' : '48 ሰዓት (መደበኛ)'}</option>
                        <option value={72}>{language === 'en' ? '72 Hours (3-Day Weekend)' : '72 ሰዓት (የሳምንት መጨረሻ)'}</option>
                        <option value={168}>{language === 'en' ? '7 Days (Weekly Special)' : '7 ቀናት (ሳምንታዊ)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Step 4: Banner Badge Tag */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-zinc-300">
                      {language === 'en' ? '5. Badge Headline Tag' : '5. በባነሩ ላይ የሚታይ ጽሁፍ'}
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {[`${discountPct}% OFF FLASH`, '🔥 MEGA DEAL', '⚡ LIMITED DROP', 'WEEKEND DROP'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setBannerTag(tag)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                            bannerTag === tag
                              ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={bannerTag}
                      onChange={(e) => setBannerTag(e.target.value)}
                      placeholder="e.g. 15% OFF FLASH"
                      className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white mt-1"
                    />
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsNominateModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                    >
                      {language === 'en' ? 'Cancel' : 'ተመለስ'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>{language === 'en' ? 'Submitting...' : 'በማስገባት ላይ...'}</span>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{language === 'en' ? 'Activate Flash Deal on Homepage →' : 'በዋና ገጽ ላይ አግብር →'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlashDealsTab;

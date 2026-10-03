import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Clock, 
  Sparkles, 
  Filter, 
  Tag, 
  ShoppingCart, 
  Heart, 
  X, 
  ChevronRight, 
  Bell, 
  ArrowUpDown, 
  Zap, 
  TrendingUp, 
  Percent, 
  Eye, 
  Gift, 
  ShieldCheck,
  Star,
  Check,
  Package
} from 'lucide-react';
import { Product, Variant } from '../types';
import { ProductCard } from './ProductCard';
import { GridContainer } from './GridContainer';

interface FlashDealsViewProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  language: 'en' | 'am';
  flashTimeLeft: { hours: number; minutes: number; seconds: number };
  simulatedClaimedQty: Record<string, number>;
  favorites: string[];
  onToggleFavorite: (productId: string, e: React.MouseEvent) => void;
  comparedProductIds?: string[];
  onToggleCompare?: (productId: string, e: React.MouseEvent) => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product, variant: Variant, quantity?: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const FlashDealsView: React.FC<FlashDealsViewProps> = ({
  isOpen,
  onClose,
  products,
  language,
  flashTimeLeft,
  simulatedClaimedQty,
  favorites,
  onToggleFavorite,
  comparedProductIds = [],
  onToggleCompare,
  onOpenProduct,
  onAddToCart,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'lightning' | 'weekly' | 'upcoming'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'discount' | 'priceAsc' | 'priceDesc' | 'claimed'>('discount');
  const [remindedItemIds, setRemindedItemIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Generate enriched flash sale items with calculated prices and discounts
  const flashSaleItems = products.map((p, idx) => {
    // Determine discount rate based on item index or category
    let discountPct = 30;
    if (idx % 3 === 0) discountPct = 40;
    if (idx % 5 === 0) discountPct = 50;
    if (idx % 2 === 0 && idx % 3 !== 0) discountPct = 35;

    const flashPrice = Math.round(p.price * (1 - discountPct / 100));
    const claimedPct = simulatedClaimedQty[p.id] || (45 + (idx * 8) % 50);
    const totalStock = p.variants.reduce((acc, v) => acc + v.onHand, 0);
    const remainingQty = Math.max(1, Math.round(totalStock * (1 - claimedPct / 100)));
    const isUpcoming = idx >= 6 && idx % 2 === 1;

    return {
      product: p,
      discountPct,
      flashPrice,
      originalPrice: p.price,
      claimedPct,
      remainingQty,
      isUpcoming,
      tag: discountPct >= 40 ? 'MEGA DEAL' : 'FLASH SALE'
    };
  });

  // Filter items based on active tab & category
  let filteredItems = flashSaleItems.filter(item => {
    // Category match
    if (selectedCategory !== 'all' && item.product.category !== selectedCategory) {
      return false;
    }

    // Tab match
    if (activeTab === 'lightning') {
      return item.claimedPct > 60 && !item.isUpcoming;
    }
    if (activeTab === 'weekly') {
      return item.product.featured || item.discountPct >= 40;
    }
    if (activeTab === 'upcoming') {
      return item.isUpcoming;
    }
    return !item.isUpcoming; // 'all' tab shows active deals
  });

  // Sort items
  filteredItems.sort((a, b) => {
    if (sortBy === 'discount') return b.discountPct - a.discountPct;
    if (sortBy === 'priceAsc') return a.flashPrice - b.flashPrice;
    if (sortBy === 'priceDesc') return b.flashPrice - a.flashPrice;
    if (sortBy === 'claimed') return b.claimedPct - a.claimedPct;
    return 0;
  });

  const categories = [
    { id: 'all', labelEn: 'All Deals', labelAm: 'ሁሉም ቅናሾች' },
    { id: 'mobiles', labelEn: 'Mobiles', labelAm: 'ስልኮች' },
    { id: 'laptops', labelEn: 'Laptops', labelAm: 'ላፕቶፖች' },
    { id: 'audio', labelEn: 'Audio', labelAm: 'ድምፅ' },
    { id: 'smartwatches', labelEn: 'Smartwatches', labelAm: 'ስማርት ሰዓቶች' },
    { id: 'gaming', labelEn: 'Gaming', labelAm: 'ጌሚንግ' },
    { id: 'accessories', labelEn: 'Accessories', labelAm: 'መለዋወጫዎች' }
  ];

  const handleToggleReminder = (productId: string, name: string) => {
    if (remindedItemIds.includes(productId)) {
      setRemindedItemIds(prev => prev.filter(id => id !== productId));
      showToast(
        language === 'en' ? `Reminder removed for ${name}` : `ለ ${name} ማስታወሻ ተነስቷል`,
        'info'
      );
    } else {
      setRemindedItemIds(prev => [...prev, productId]);
      showToast(
        language === 'en' ? `🔔 Reminder set for ${name}! We'll alert you when live.` : `🔔 ለ ${name} ማስታወሻ ተዘጋጅቷል! በቅርቡ እናሳውቅዎታለን።`,
        'success'
      );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white w-full max-w-7xl rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border-0 sm:border border-gray-200 dark:border-zinc-800 flex flex-col h-full sm:h-[92vh] sm:max-h-[92vh] min-h-0"
        >
          {/* Sleek Minimal Top Header Bar */}
          <div className="bg-zinc-900 text-white px-3.5 py-2.5 sm:px-5 sm:py-3.5 relative overflow-hidden shrink-0 border-b border-zinc-800 flex items-center justify-between gap-2 shadow-sm">
            {/* Left: Brand / Title / Up to 50% badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1.5 sm:p-2 rounded-xl text-black font-black shrink-0 shadow-md">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-black animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-white truncate font-sans">
                    {language === 'en' ? 'Flash Deals' : 'ፈጣን የቅናሽ ሽያጭ'}
                  </h2>
                  <span className="hidden sm:inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                    {language === 'en' ? 'Up to 50% OFF' : 'እስከ 50% ቅናሽ'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium truncate hidden sm:block">
                  {language === 'en'
                    ? 'Limited time authentic discounts • Free express delivery available'
                    : 'በከፍተኛ ደረጃ እቃዎች ላይ የተደረጉ ውስን ጊዜ ቅናሾች'}
                </p>
              </div>
            </div>

            {/* Right: Live Countdown & Close Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Compact Countdown Ticker */}
              <div className="flex items-center gap-1.5 bg-zinc-800/90 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-zinc-700/80 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" style={{ animationDuration: '8s' }} />
                <span className="text-[10px] font-bold text-zinc-400 hidden sm:inline uppercase tracking-wider">
                  {language === 'en' ? 'Ends in:' : 'የሚቀረው:'}
                </span>
                <div className="flex items-center font-mono font-black text-xs sm:text-sm text-amber-300">
                  <span>{String(flashTimeLeft.hours).padStart(2, '0')}</span>
                  <span className="animate-pulse px-0.5 text-amber-400/80">:</span>
                  <span>{String(flashTimeLeft.minutes).padStart(2, '0')}</span>
                  <span className="animate-pulse px-0.5 text-amber-400/80">:</span>
                  <span>{String(flashTimeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-1.5 sm:p-2 rounded-xl transition-all border border-zinc-700 cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Minimal Controls Bar: Combined Tabs & Quick Category Filter */}
          <div className="px-2.5 py-2 sm:px-5 sm:py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 space-y-2 shrink-0">
            {/* Row 1: Primary Tabs & Sort Selector */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-amber-500 text-black shadow-xs font-black'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'en' ? 'All Deals' : 'ሁሉም'}</span>
                  <span className="ml-1 bg-black/10 dark:bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                    {flashSaleItems.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('lightning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeTab === 'lightning'
                      ? 'bg-red-600 text-white shadow-xs font-black'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'en' ? 'Lightning' : 'ፈጣን'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeTab === 'weekly'
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Bundles' : 'የሳምንቱ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeTab === 'upcoming'
                      ? 'bg-purple-600 text-white shadow-xs font-black'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Upcoming' : 'በቅርቡ'}</span>
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="w-3 h-3 text-gray-400 hidden sm:inline" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white text-[11px] font-bold rounded-lg px-2.5 py-1 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="discount">{language === 'en' ? 'Highest Discount' : 'ከፍተኛ ቅናሽ'}</option>
                  <option value="claimed">{language === 'en' ? 'Most Claimed' : 'በብዛት የተያዘ'}</option>
                  <option value="priceAsc">{language === 'en' ? 'Price: Low-High' : 'ዋጋ፡ ዝቅ-ከፍተኛ'}</option>
                  <option value="priceDesc">{language === 'en' ? 'Price: High-Low' : 'ዋጋ፡ ከፍተኛ-ዝቅ'}</option>
                </select>
              </div>
            </div>

            {/* Row 2: Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
              <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-zinc-500 pr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {language === 'en' ? 'Filter:' : 'ማጣሪያ:'}
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-black shadow-2xs'
                      : 'bg-gray-100 dark:bg-zinc-800/80 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {language === 'en' ? cat.labelEn : cat.labelAm}
                </button>
              ))}
            </div>
          </div>

          {/* Single Unified Scroll Area for Products */}
          <div className="p-2.5 sm:p-5 overflow-y-auto min-h-0 flex-1 bg-gray-50/50 dark:bg-zinc-950 touch-pan-y overscroll-contain">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Package className="w-12 h-12 text-gray-400 mx-auto opacity-50" />
                <h3 className="font-bold text-gray-700 dark:text-zinc-300">
                  {language === 'en' ? 'No flash deals found in this filter' : 'በዚህ ማጣሪያ ምንም ቅናሾች አልተገኙም'}
                </h3>
                <p className="text-xs text-gray-400">
                  {language === 'en' ? 'Try switching categories or viewing all flash deals.' : 'እባክዎን ሌላ ምድብ ይምረጡ።'}
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('all'); setActiveTab('all'); }}
                  className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {language === 'en' ? 'Reset Filters' : 'ማጣሪያውን አጽዳ'}
                </button>
              </div>
            ) : (
              <GridContainer gap="spacious">
                {filteredItems.map(({ product: p, discountPct, flashPrice, claimedPct, remainingQty, isUpcoming, tag }) => {
                  const isFavorite = favorites.includes(p.id);
                  const isCompared = comparedProductIds.includes(p.id);

                  return (
                    <ProductCard
                      key={`deals-hub-${p.id}`}
                      product={p}
                      language={language}
                      isFavorite={isFavorite}
                      onToggleFavorite={onToggleFavorite}
                      isCompared={isCompared}
                      onToggleCompare={onToggleCompare}
                      onOpenProduct={onOpenProduct}
                      onQuickView={onOpenProduct}
                      onAddToCart={onAddToCart}
                      showToast={showToast}
                      flashDiscountPct={discountPct}
                      flashPrice={flashPrice}
                      claimedPct={isUpcoming ? undefined : claimedPct}
                      remainingQty={isUpcoming ? undefined : remainingQty}
                      isUpcoming={isUpcoming}
                      badgeText={isUpcoming ? (language === 'en' ? 'STARTS IN 2H' : 'በ 2 ሰዓት ይጀምራል') : tag}
                      badgeColor={isUpcoming ? 'purple' : 'amber'}
                      layout="grid"
                    />
                  );
                })}
              </GridContainer>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

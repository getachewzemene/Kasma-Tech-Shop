import React from 'react';
import { Zap, Clock, ChevronRight } from 'lucide-react';
import { Product, Variant, FlashDealNomination } from '../../types';
import { SectionHeader } from '../SectionHeader';
import { GridContainer } from '../GridContainer';
import { ProductCard } from '../ProductCard';

interface FlashDealsSectionProps {
  approvedProducts: Product[];
  flashDeals: FlashDealNomination[];
  flashTimeLeft: { hours: number; minutes: number; seconds: number };
  language: 'en' | 'am';
  favorites: string[];
  comparedProductIds: string[];
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onToggleCompare: (id: string, e?: React.MouseEvent) => void;
  onOpenProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, variant: Variant, quantity?: number) => void;
  onInstantBuy: (product: Product, variant: Variant, quantity?: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onOpenFlashDeals: () => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  approvedProducts,
  flashDeals,
  flashTimeLeft,
  language,
  favorites,
  comparedProductIds,
  onToggleFavorite,
  onToggleCompare,
  onOpenProduct,
  onQuickView,
  onAddToCart,
  onInstantBuy,
  showToast,
  onOpenFlashDeals
}) => {
  if (approvedProducts.length === 0) return null;

  const now = Date.now();
  const activeMerchantDeals = flashDeals.filter(
    d => d.status === 'ACTIVE' && (!d.endDate || new Date(d.endDate).getTime() > now)
  );

  const items: Array<{
    product: Product;
    originalPrice: number;
    flashPrice: number;
    flashDiscountPct: number;
    claimedPct: number;
    remainingQty: number;
    badgeText?: string;
    isMerchantNominated: boolean;
  }> = [];

  activeMerchantDeals.forEach(deal => {
    const prod = approvedProducts.find(p => p.id === deal.productId);
    if (prod) {
      const realTotalStock = prod.variants.reduce((acc, v) => acc + (v.onHand || 0), 0);
      const remainingQty = Math.max(0, Math.min(realTotalStock, deal.dealStock - (deal.claimedStock || 0)));
      const claimedPct = deal.dealStock > 0 ? Math.min(100, Math.round(((deal.claimedStock || 0) / deal.dealStock) * 100)) : 50;

      const originalPrice = deal.originalPrice || prod.price;
      const flashPrice = deal.flashPrice || Math.round(originalPrice * (1 - (deal.discountPct || 15) / 100));
      const flashDiscountPct = deal.discountPct || (originalPrice > flashPrice ? Math.round(((originalPrice - flashPrice) / originalPrice) * 100) : 15);

      items.push({
        product: { ...prod, price: originalPrice },
        originalPrice,
        flashPrice,
        flashDiscountPct,
        claimedPct: Math.max(15, claimedPct),
        remainingQty,
        badgeText: deal.bannerTag || `${flashDiscountPct}% OFF`,
        isMerchantNominated: true
      });
    }
  });

  if (items.length < 4) {
    const existingProductIds = new Set(items.map(it => it.product.id));
    approvedProducts.forEach((p, idx) => {
      if (items.length >= 4) return;
      if (!existingProductIds.has(p.id)) {
        const realTotalStock = p.variants.reduce((acc, v) => acc + (v.onHand || 0), 0);
        const originalPrice = p.price;
        const flashDiscountPct = 15;
        const flashPrice = Math.round(originalPrice * (1 - flashDiscountPct / 100));
        const remainingQty = Math.max(0, realTotalStock);
        const claimedPct = realTotalStock > 0 ? Math.min(90, Math.max(20, 50 + (idx * 12))) : 100;

        items.push({
          product: p,
          originalPrice,
          flashPrice,
          flashDiscountPct,
          claimedPct,
          remainingQty,
          badgeText: undefined,
          isMerchantNominated: false
        });
      }
    });
  }

  return (
    <section id="featured-deals-section" className="max-w-[1440px] mx-auto w-full px-2.5 xs:px-3 sm:px-6 lg:px-8 mt-12 lg:mt-16 scroll-mt-28">
      {/* Warm light-yellow/peach container (#FFF7ED) with subtle orange accents */}
      <div className="bg-[#FFF7ED] dark:bg-[#121620] p-2.5 xs:p-3 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xs border border-orange-200/80 dark:border-zinc-800 text-[#172033] dark:text-slate-100 relative overflow-hidden transition-all duration-300">
        {/* Subtle atmospheric warm glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-200/30 dark:bg-orange-950/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-100/50 dark:bg-amber-950/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <SectionHeader
            titleEn="Flash Deals"
            titleAm="ፈጣን ቅናሾች"
            subtitleEn="Supercharge your savings with authentic discounts and verified stock."
            subtitleAm="በእውነተኛ ቅናሾች እና አስተማማኝ ክምችት ቁጠባዎን ያሳድጉ።"
            language={language}
            icon={
              <div className="bg-[#F97316] text-white p-1.5 xs:p-2 rounded-xl shadow-md shadow-orange-500/25 shrink-0 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 fill-white text-white animate-pulse" />
              </div>
            }
            onViewAll={onOpenFlashDeals}
            viewAllText={language === 'en' ? 'View all' : 'ሁሉንም እይ'}
            viewAllClassName="!hidden sm:!inline-flex sm:bg-white sm:dark:bg-zinc-800/90 sm:text-[#EA580C] sm:dark:text-orange-400 sm:border sm:border-orange-200/90 sm:dark:border-zinc-700 sm:px-3.5 sm:py-2 sm:rounded-xl sm:shadow-xs sm:hover:bg-[#F97316] sm:hover:text-white sm:hover:border-[#F97316] sm:hover:no-underline sm:active:scale-95"
            rightContent={
              <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-zinc-800/90 px-1.5 py-0.5 xs:px-2 xs:py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-orange-200/90 dark:border-zinc-700 shadow-xs shrink-0">
                <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-[#F97316] shrink-0" />
                <span className="text-[9.5px] xs:text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-300 font-semibold sm:font-bold shrink-0 leading-none">
                  {language === 'en' ? 'Ends in:' : 'የሚቀረው:'}
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1 font-mono font-bold sm:font-black text-[10px] xs:text-[11px] sm:text-sm">
                  <span className="bg-[#FFF7ED] dark:bg-zinc-900 text-[#EA580C] dark:text-orange-400 px-1 xs:px-1.5 py-0.5 rounded-md border border-orange-200/90 dark:border-orange-900/60 shadow-2xs leading-none">
                    {String(flashTimeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[#EA580C] font-bold text-[9px] sm:text-sm leading-none animate-pulse">:</span>
                  <span className="bg-[#FFF7ED] dark:bg-zinc-900 text-[#EA580C] dark:text-orange-400 px-1 xs:px-1.5 py-0.5 rounded-md border border-orange-200/90 dark:border-orange-900/60 shadow-2xs leading-none">
                    {String(flashTimeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[#EA580C] font-bold text-[9px] sm:text-sm leading-none animate-pulse">:</span>
                  <span className="bg-[#FFF7ED] dark:bg-zinc-900 text-[#EA580C] dark:text-orange-400 px-1 xs:px-1.5 py-0.5 rounded-md border border-orange-200/90 dark:border-orange-900/60 shadow-2xs leading-none">
                    {String(flashTimeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            }
          />

          <GridContainer cols="auto-fill" gap="normal">
            {items.slice(0, 4).map((item) => {
              const p = item.product;
              return (
                <ProductCard
                  key={`flash-${p.id}`}
                  product={p}
                  language={language}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={onToggleFavorite}
                  isCompared={comparedProductIds.includes(p.id)}
                  onToggleCompare={onToggleCompare}
                  onOpenProduct={onOpenProduct}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  onInstantBuy={onInstantBuy}
                  showToast={showToast}
                  originalPrice={item.originalPrice}
                  flashDiscountPct={item.flashDiscountPct}
                  flashPrice={item.flashPrice}
                  claimedPct={item.claimedPct}
                  remainingQty={item.remainingQty}
                  badgeText={item.badgeText}
                  badgeColor="amber"
                  layout="grid"
                  className="w-full h-full"
                />
              );
            })}
          </GridContainer>

          {/* Mobile Bottom-Right "View all" trigger */}
          <div className="flex sm:hidden justify-end mt-2 xs:mt-2.5">
            <button
              type="button"
              onClick={onOpenFlashDeals}
              className="group inline-flex items-center gap-1 text-xs font-bold text-[#EA580C] dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline transition-all cursor-pointer whitespace-nowrap py-1 px-1 active:scale-95"
            >
              <span>{language === 'en' ? 'View all' : 'ሁሉንም እይ'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

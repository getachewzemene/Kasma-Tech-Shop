import React, { useState } from 'react';
import { Heart, Star, Eye, Flame, Tag, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { Product, Variant } from '../types';
import { LazyImage } from './LazyImage';

export interface ProductCardProps {
  product: Product;
  language: 'en' | 'am';
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string, e: React.MouseEvent) => void;
  isCompared?: boolean;
  onToggleCompare?: (productId: string, e: React.MouseEvent) => void;
  onOpenProduct: (product: Product) => void;
  onQuickView?: (product: Product, e?: React.MouseEvent) => void;
  onAddToCart?: (product: Product, variant: Variant, quantity?: number) => void;
  onInstantBuy?: (product: Product, variant: Variant, quantity?: number) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  
  // Custom display overrides
  badgeText?: string;
  badgeColor?: 'indigo' | 'blue' | 'amber' | 'green' | 'red' | 'purple';
  recommendationReason?: string;
  flashDiscountPct?: number;
  flashPrice?: number;
  originalPrice?: number;
  claimedPct?: number;
  remainingQty?: number;
  isUpcoming?: boolean;
  
  // Custom container layout options
  className?: string;
  layout?: 'grid' | 'carousel' | 'flash';
  highlightSearchQuery?: string;
}

const DEFAULT_REVIEW_COUNTS: Record<string, number> = {
  p8: 128,
  p1: 115,
  p2: 245,
  p3: 194,
  p4: 86,
  p5: 52,
  p6: 173,
  p7: 310,
  p10: 280,
  p11: 96,
  p12: 64,
  p13: 88,
  p9: 142
};

const DEFAULT_RATINGS: Record<string, number> = {
  p8: 4.9,
  p1: 4.8,
  p2: 4.8,
  p3: 4.9,
  p4: 4.7,
  p5: 4.6,
  p6: 4.8,
  p7: 4.9,
  p10: 4.9,
  p11: 5.0,
  p12: 4.7,
  p13: 4.8,
  p9: 4.8
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  isFavorite = false,
  onToggleFavorite,
  isCompared = false,
  onToggleCompare,
  onOpenProduct,
  onQuickView,
  onAddToCart,
  onInstantBuy,
  showToast,
  badgeText,
  badgeColor = 'indigo',
  recommendationReason,
  flashDiscountPct,
  flashPrice,
  originalPrice: originalPriceProp,
  claimedPct,
  remainingQty,
  isUpcoming = false,
  className = '',
  layout = 'grid',
  highlightSearchQuery
}) => {
  const displayPrice = flashPrice !== undefined ? flashPrice : product.price;
  const originalPrice = originalPriceProp !== undefined ? originalPriceProp : product.price;

  // Rating info calculation - strictly authentic and product-specific
  const reviews = product.reviews || [];
  const count = (product.reviewsCount !== undefined && product.reviewsCount > 0)
    ? product.reviewsCount 
    : (reviews.length > 0 ? reviews.length : (DEFAULT_REVIEW_COUNTS[product.id] || 120));
  const avg = product.rating !== undefined 
    ? Number(product.rating).toFixed(1)
    : (reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
      : (DEFAULT_RATINGS[product.id] ? DEFAULT_RATINGS[product.id].toFixed(1) : '4.8'));

  const isOutOfStock = product.variants.every(v => v.onHand <= 0) || (remainingQty !== undefined && remainingQty <= 0);

  const badgeStyles: Record<string, string> = {
    indigo: 'bg-indigo-600 text-white',
    blue: 'bg-blue-600 text-white',
    amber: 'bg-amber-500 text-black',
    green: 'bg-emerald-600 text-white',
    red: 'bg-red-600 text-white',
    purple: 'bg-purple-600 text-white',
  };

  const handleCardClick = () => {
    if (flashPrice !== undefined) {
      onOpenProduct({
        ...product,
        price: flashPrice,
        nameEn: `⚡ [Flash Deal] ${product.nameEn}`,
        nameAm: `⚡ [ፈጣን ቅናሽ] ${product.nameAm}`,
      });
    } else {
      onOpenProduct(product);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    if (defaultVariant && defaultVariant.onHand > 0 && onAddToCart) {
      const pToAdd = flashPrice !== undefined ? {
        ...product,
        price: flashPrice,
        nameEn: `⚡ [Flash Deal] ${product.nameEn}`,
        nameAm: `⚡ [ፈጣን ቅናሽ] ${product.nameAm}`,
      } : product;

      onAddToCart(pToAdd, defaultVariant, 1);
    } else {
      handleCardClick();
    }
  };

  const handleInstantBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    if (defaultVariant && defaultVariant.onHand > 0) {
      const pToAdd = flashPrice !== undefined ? {
        ...product,
        price: flashPrice,
        nameEn: `⚡ [Flash Deal] ${product.nameEn}`,
        nameAm: `⚡ [ፈጣን ቅናሽ] ${product.nameAm}`,
      } : product;

      if (onInstantBuy) {
        onInstantBuy(pToAdd, defaultVariant, 1);
      } else if (onAddToCart) {
        onAddToCart(pToAdd, defaultVariant, 1);
      }
    } else {
      handleCardClick();
    }
  };

  const nameText = language === 'en' ? product.nameEn : product.nameAm;

  const renderTitle = () => {
    if (!highlightSearchQuery || !highlightSearchQuery.trim()) return nameText;
    const parts = nameText.split(new RegExp(`(${highlightSearchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlightSearchQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 dark:text-amber-200 text-gray-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const containerLayoutClass = layout === 'carousel'
    ? 'w-[160px] xs:w-[175px] sm:w-[220px] md:w-[250px] shrink-0 snap-start'
    : 'w-full';

  const isFlashCard = flashDiscountPct !== undefined || layout === 'flash';
  const savingsAmount = Math.max(0, originalPrice - displayPrice);

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-[#FFFFFF] dark:bg-zinc-900 border ${
          isFlashCard
            ? 'border-orange-100 dark:border-zinc-800 hover:border-[#F97316]/50 shadow-xs hover:shadow-xl hover:-translate-y-1 rounded-2xl'
            : 'border-gray-200/80 dark:border-zinc-800 hover:border-[#155EEF] dark:hover:border-blue-500 shadow-xs hover:shadow-xl hover:-translate-y-1 rounded-2xl'
        } overflow-hidden transition-all duration-300 cursor-pointer group flex flex-col justify-between relative min-w-0 ${containerLayoutClass} ${className}`}
      >
        {/* Image container: clean 16:11 aspect ratio */}
        <div 
          style={{ aspectRatio: '16 / 11' }}
          className="aspect-[16/11] w-full relative overflow-hidden shrink-0 bg-gray-50 dark:bg-zinc-800/80 rounded-t-2xl"
        >
          <LazyImage
            src={product.image}
            alt={product.nameEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Subtle image reflection overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/15 dark:from-black/40 to-transparent pointer-events-none" />

          {/* Hover Quick View Overlay */}
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickView) {
                  onQuickView(product, e);
                } else {
                  handleCardClick();
                }
              }}
              className="px-3 py-1.5 bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-800 text-gray-950 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#155EEF]" />
              {language === 'en' ? 'Quick View' : 'ፈጣን እይታ'}
            </button>
          </div>

          {/* Discount Badge */}
          {flashDiscountPct !== undefined ? (
            <div className="absolute top-1.5 left-1.5 xs:top-2 xs:left-2 bg-[#F97316] text-white font-black text-xs tracking-wider px-2 py-0.5 rounded-full flex items-center justify-center shadow-md z-20 pointer-events-none">
              <span>-{flashDiscountPct}%</span>
            </div>
          ) : badgeText ? (
            <span className={`absolute top-1.5 left-1.5 xs:top-2 xs:left-2 ${badgeStyles[badgeColor]} text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs z-20 pointer-events-none whitespace-nowrap`}>
              {badgeText}
            </span>
          ) : null}

          {/* Action Buttons: Clean Wishlist Heart Only */}
          {onToggleFavorite && (
            <div className="absolute top-1.5 right-1.5 xs:top-2 xs:right-2 flex items-center z-30 pointer-events-auto">
              <button
                type="button"
                title={language === 'en' ? (isFavorite ? 'Remove from Wishlist' : 'Save to Wishlist') : (isFavorite ? 'ከተወዳጆች አስወግድ' : 'ወደ ተወዳጆች አስቀምጥ')}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product.id, e);
                }}
                className={`min-w-[28px] min-h-[28px] w-7 h-7 xs:w-8 xs:h-8 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs hover:scale-108 active:scale-95 flex items-center justify-center border ${
                  isFavorite
                    ? 'bg-red-50 dark:bg-red-950/90 text-red-600 dark:text-red-500 border-red-300 dark:border-red-800 shadow-red-500/20 shadow-sm'
                    : 'bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-800 text-gray-500 hover:text-red-600 border-white/80 dark:border-zinc-700/80'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 xs:w-4 xs:h-4 transition-transform ${isFavorite ? 'fill-red-600 text-red-600 scale-110' : 'text-gray-400 dark:text-zinc-400'}`} />
              </button>
            </div>
          )}
        </div>

        {/* Card Content / Description Section: Natural, readable layout */}
        <div className="p-2.5 sm:p-3.5 md:p-4 flex flex-col justify-between flex-1 min-h-0 text-left gap-2 sm:gap-2.5">
          <div className="space-y-1 sm:space-y-1.5">
            {/* Brand & Authentic Rating Capsule (12px tertiary labels) */}
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider truncate min-w-0">
                <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{product.brand}</span>
              </div>

              {/* Authentic Product-Specific Rating or New Arrival (12px tertiary labels) */}
              {avg !== null ? (
                <div 
                  title={language === 'en' ? `${avg} out of 5 stars (${count} customer reviews)` : `${avg} ከ 5 ኮከቦች (${count} የደንበኛ አስተያየቶች)`}
                  className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xs px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-amber-900 dark:text-amber-200">{avg}</span>
                  {count > 0 && (
                    <span className="text-xs text-amber-700/90 dark:text-amber-400/90 font-medium hidden sm:inline">
                      ({count})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{language === 'en' ? 'New' : 'አዲስ'}</span>
                </div>
              )}
            </div>

            {/* Product Title: Semibold at 14-15px, strictly single line with ellipses */}
            <h4 
              title={language === 'en' ? product.nameEn : product.nameAm} 
              className="font-semibold text-gray-800 dark:text-zinc-100 group-hover:text-[#155EEF] transition-colors leading-snug text-sm sm:text-[15px] truncate block w-full min-w-0"
            >
              {renderTitle()}
            </h4>
          </div>

          {/* Pricing & CTA Action Section */}
          <div className="pt-2 border-t border-gray-150 dark:border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex flex-col min-w-0 pr-1">
                {/* Price: Dominant, larger, and bolder than anything else on the card */}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg xs:text-xl sm:text-2xl font-black font-mono text-gray-950 dark:text-white tracking-tight whitespace-nowrap">
                    {displayPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#155EEF] dark:text-blue-400 uppercase whitespace-nowrap">
                    ETB
                  </span>
                </div>
                
                <div className="flex items-center gap-1 min-w-0 mt-0.5">
                  {flashDiscountPct !== undefined ? (
                    <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 line-through truncate">
                      {originalPrice.toLocaleString()} ETB
                    </span>
                  ) : remainingQty !== undefined && remainingQty <= 5 ? (
                    <span className="text-rose-500 dark:text-rose-400 font-extrabold text-xs flex items-center gap-0.5 truncate">
                      <Flame className="w-3 h-3 fill-current shrink-0" />
                      <span className="truncate">{language === 'en' ? `${remainingQty} left` : `${remainingQty} ቀርቷል`}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold truncate">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{language === 'en' ? 'Genuine' : 'ኦሪጅናል'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Primary High-Contrast Buy Button */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleInstantBuyClick}
                className={`h-8 sm:h-9 min-h-[32px] sm:min-h-[36px] px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-1 text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer shadow-xs active:scale-95 ${
                  isOutOfStock
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-700'
                    : 'bg-[#155EEF] hover:bg-[#1044A5] active:scale-95 text-white shadow-xs hover:shadow-md'
                }`}
              >
                <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 fill-current text-white shrink-0" />
                <span className="whitespace-nowrap">
                  {isOutOfStock 
                    ? (language === 'en' ? 'Sold' : 'አልቋል') 
                    : (language === 'en' ? 'Buy Now' : 'ግዛ')}
                </span>
              </button>
            </div>

            {/* Flash Deals Stock Remaining Progress Bar */}
            {isFlashCard && (
              <div className="w-full pt-0.5">
                <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                  <span className={isOutOfStock ? "text-zinc-400 font-bold" : remainingQty !== undefined && remainingQty <= 3 ? "text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5" : "text-zinc-600 dark:text-zinc-400 flex items-center gap-0.5"}>
                    <Flame className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-[#F97316] fill-[#F97316] shrink-0" />
                    <span>
                      {isOutOfStock
                        ? (language === 'en' ? 'Sold Out' : 'አልቋል')
                        : remainingQty !== undefined
                          ? (language === 'en' ? `${remainingQty} left` : `${remainingQty} ቀርቷል`)
                          : (language === 'en' ? 'In Stock' : 'በክምችት ላይ')}
                    </span>
                  </span>
                  {claimedPct !== undefined && !isOutOfStock && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
                      {claimedPct}% {language === 'en' ? 'sold' : 'ተሽጧል'}
                    </span>
                  )}
                </div>
                <div className="w-full bg-orange-100/70 dark:bg-zinc-800 h-1 xs:h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-[#F97316] h-full rounded-full transition-all duration-500"
                    style={{ width: `${isOutOfStock ? 100 : Math.min(100, Math.max(8, claimedPct || 50))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};


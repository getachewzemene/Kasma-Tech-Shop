import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, Eye, Flame, Share2, Copy, Check, X, Send, Facebook, MessageCircle, ExternalLink, Tag, Zap, GitCompare, Sparkles, ShieldCheck } from 'lucide-react';
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
  claimedPct?: number;
  remainingQty?: number;
  isUpcoming?: boolean;
  
  // Custom container layout options
  className?: string;
  layout?: 'grid' | 'carousel' | 'flash';
  highlightSearchQuery?: string;
}

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
  claimedPct,
  remainingQty,
  isUpcoming = false,
  className = '',
  layout = 'grid',
  highlightSearchQuery
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayPrice = flashPrice !== undefined ? flashPrice : product.price;
  const originalPrice = product.price;

  // Share details
  const shareUrl = `${window.location.origin}/?product=${product.id}`;
  const shareTitle = language === 'en' ? product.nameEn : product.nameAm;
  const shareText = language === 'en'
    ? `Check out ${product.nameEn} on KASMA Shop! Special Price: ${displayPrice.toLocaleString()} ETB.`
    : `በካስማ ሾፕ ${product.nameAm} ይመልከቱ! ልዩ ዋጋ፡ ${displayPrice.toLocaleString()} ETB።`;

  const handleCopyLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (showToast) {
      showToast(language === 'en' ? 'Product link copied to clipboard!' : 'የምርት ሊንክ ወደ clipboard ተገልብጧል!', 'success');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTiktok = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCopyLink();
    if (showToast) {
      showToast(language === 'en' ? 'Link copied! Opening TikTok...' : 'ሊንኩ ተገልብጧል! ቲክቶክ በመክፈት ላይ...', 'info');
    }
    setTimeout(() => {
      window.open('https://www.tiktok.com', '_blank', 'noopener,noreferrer');
    }, 600);
  };

  const handleShareWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // Rating info calculation
  const reviews = product.reviews || [];
  const count = reviews.length;
  const avg = count > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)
    : '4.8';

  const isOutOfStock = product.variants.every(v => v.onHand <= 0);

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

  const containerLayoutClass = layout === 'flash' || layout === 'carousel'
    ? 'w-[calc(50%-0.2rem)] sm:w-[220px] md:w-[250px] lg:w-full shrink-0 lg:shrink lg:min-w-0 snap-start h-full'
    : 'w-full h-full';

  const isFlashCard = flashDiscountPct !== undefined || layout === 'flash';
  const savingsAmount = Math.max(0, originalPrice - displayPrice);

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-white dark:bg-zinc-900 border ${
          isFlashCard
            ? 'border-amber-200/80 dark:border-zinc-800 hover:border-[#0052FF] dark:hover:border-blue-500 shadow-sm sm:shadow-md hover:shadow-xl hover:-translate-y-1 rounded-2xl h-full'
            : 'border-gray-200/80 dark:border-zinc-800 hover:border-[#0052FF] dark:hover:border-blue-500 shadow-sm sm:shadow-md hover:shadow-xl hover:-translate-y-1 rounded-2xl h-full'
        } overflow-hidden transition-all duration-300 cursor-pointer group flex flex-col justify-between relative ${containerLayoutClass} ${className}`}
      >
        {/* Image container: aspect 16/10 for flash cards (<= 50% height), aspect 4/3 for standard cards */}
        <div className={`${isFlashCard ? 'aspect-[16/10]' : 'aspect-[4/3]'} w-full relative overflow-hidden shrink-0 bg-gray-50 dark:bg-zinc-800/80 rounded-t-2xl`}>
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
              className="px-3 py-1.5 bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-800 text-gray-950 dark:text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#0052FF]" />
              {language === 'en' ? 'Quick View' : 'ፈጣን እይታ'}
            </button>
          </div>

          {/* Discount Badge */}
          {flashDiscountPct !== undefined ? (
            <div className="absolute top-2 left-2 bg-[#FF3B30] text-white font-black text-[9px] sm:text-[10px] tracking-wider px-2 py-0.5 rounded-full flex items-center justify-center shadow-md z-20 pointer-events-none">
              <span>-{flashDiscountPct}%</span>
            </div>
          ) : badgeText ? (
            <span className={`absolute top-2 left-2 ${badgeStyles[badgeColor]} text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs z-20 pointer-events-none whitespace-nowrap`}>
              {badgeText}
            </span>
          ) : null}

          {/* Action Buttons: Glassmorphism Compare, Share & Favorite */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-30 pointer-events-auto">
            {/* Compare Button - Desktop only */}
            {onToggleCompare && (
              <button
                type="button"
                title={language === 'en' ? 'Compare Product' : 'ምርቶችን ያነፃፅሩ'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(product.id, e);
                }}
                className={`hidden sm:flex p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs hover:scale-110 active:scale-95 z-30 min-w-[28px] min-h-[28px] items-center justify-center ${
                  isCompared
                    ? 'bg-blue-50 dark:bg-blue-950/90 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                    : 'bg-white/90 dark:bg-zinc-900/90 hover:bg-white text-gray-600 dark:text-zinc-300 hover:text-blue-600 border border-white/60 dark:border-zinc-700/60'
                }`}
              >
                <GitCompare className={`w-3.5 h-3.5 ${isCompared ? 'scale-110' : ''}`} />
              </button>
            )}

            {/* Share Button - Desktop only */}
            <button
              type="button"
              title={language === 'en' ? 'Share Product' : 'ምርቱን ያጋሩ'}
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              className="hidden sm:flex p-1.5 rounded-full backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#0052FF] border border-white/60 dark:border-zinc-700/60 transition-all cursor-pointer shadow-xs hover:scale-110 active:scale-95 z-30 min-w-[28px] min-h-[28px] items-center justify-center"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Favorite / Wishlist Button - Compact yet easily tapable */}
            {onToggleFavorite && (
              <button
                type="button"
                title={language === 'en' ? 'Save to Wishlist' : 'ወደ ተወዳጆች ያስቀምጡ'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product.id, e);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm hover:scale-110 active:scale-95 z-30 min-w-[30px] min-h-[30px] sm:min-w-[28px] sm:min-h-[28px] flex items-center justify-center ${
                  isFavorite
                    ? 'bg-orange-50 dark:bg-orange-950/90 text-orange-500 dark:text-orange-400 border border-orange-300 dark:border-orange-800'
                    : 'bg-white/95 dark:bg-zinc-900/95 hover:bg-white text-gray-500 hover:text-orange-500 border border-white/80 dark:border-zinc-700/80'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-orange-500 text-orange-500 scale-110' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Card Content / Description Section */}
        <div className={`${isFlashCard ? 'p-2 sm:p-3 gap-1' : 'p-2 sm:p-3.5 gap-1.5'} flex flex-col justify-between flex-1 min-h-0 text-left`}>
          <div className="space-y-1">
            {/* Brand & Capsule Rating */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-0.5 text-[8.5px] sm:text-[9.5px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                <Tag className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                <span className="truncate">{product.brand}</span>
              </div>

              {/* Capsule Rating */}
              <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[8.5px] sm:text-[9.5px] px-1.5 py-0.5 rounded-full shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{avg} <span className="text-[7.5px] sm:text-[8px] text-amber-600/80 font-normal">({count > 0 ? count : '1.2k'})</span></span>
              </div>
            </div>

            {/* Product Title */}
            <h4 
              title={typeof renderTitle() === 'string' ? (renderTitle() as string) : (language === 'en' ? product.nameEn : product.nameAm)} 
              className="font-bold text-gray-900 dark:text-white group-hover:text-[#0052FF] transition-colors leading-snug text-[11px] sm:text-xs md:text-sm line-clamp-2"
            >
              {renderTitle()}
            </h4>
          </div>

          {/* Pricing Section */}
          <div className={`${isFlashCard ? 'pt-1 mt-0.5' : 'pt-1.5 mt-1'} border-t border-gray-100 dark:border-zinc-800/80 flex flex-col gap-0.5`}>
            <div className="flex items-baseline justify-between gap-1 flex-wrap">
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className={`${isFlashCard ? 'text-xs sm:text-sm md:text-base' : 'text-xs sm:text-base md:text-[19px]'} font-bold font-mono text-[#1A1A1A] dark:text-white tracking-tight`}>
                  {displayPrice.toLocaleString()} <span className="text-[8.5px] sm:text-[10px] font-sans font-bold text-gray-500 dark:text-zinc-400">ETB</span>
                </span>
                {flashDiscountPct !== undefined && (
                  <span className="text-[9px] sm:text-[10px] font-medium font-mono text-gray-400 line-through">
                    {originalPrice.toLocaleString()} ETB
                  </span>
                )}
              </div>

              {/* Integrated Muted Savings Indicator */}
              {flashDiscountPct !== undefined && savingsAmount > 0 && (
                <span className="text-[8px] sm:text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  {language === 'en' ? `Save ${savingsAmount.toLocaleString()} ETB` : `${savingsAmount.toLocaleString()} ቁጠባ`}
                </span>
              )}
            </div>

            {/* CTA Button & Stock Status Row */}
            <div className="flex items-center justify-between gap-1 pt-1 min-w-0">
              {remainingQty !== undefined ? (
                <span className="text-rose-500 dark:text-rose-400 font-extrabold text-[8.5px] sm:text-[9.5px] flex items-center gap-0.5 shrink-0">
                  <Flame className="w-2.5 h-2.5 fill-current shrink-0" />
                  <span className="whitespace-nowrap">{language === 'en' ? `Only ${remainingQty} left` : `${remainingQty} ቀርቷል`}</span>
                </span>
              ) : (
                <span className="text-[8.5px] sm:text-[9.5px] text-gray-400 font-medium whitespace-nowrap">
                  {language === 'en' ? 'Authentic' : 'ኦሪጅናል'}
                </span>
              )}

              <div className="flex items-center gap-1 shrink-0">
                {/* Primary High-Contrast Buy Button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleInstantBuyClick}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 ease-out flex items-center justify-center gap-1 text-[11px] sm:text-xs font-black shrink-0 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                      : 'bg-[#0052FF] hover:bg-blue-600 active:scale-95 text-white shadow-xs hover:shadow-md focus:outline-none'
                  }`}
                >
                  <Zap className="w-3 h-3 fill-current text-amber-300 shrink-0" />
                  <span className="inline leading-none tracking-tight whitespace-nowrap">
                    {isOutOfStock 
                      ? (language === 'en' ? 'Sold Out' : 'አልቋል') 
                      : (language === 'en' ? 'Buy Now' : 'ግዛ')}
                  </span>
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Share Modal Dialog */}
      {isShareOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsShareOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 shadow-2xl max-w-sm w-full p-5 space-y-4 relative overflow-hidden text-left animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-900 dark:text-white">
                    {language === 'en' ? 'Share Product' : 'ምርቱን ያጋሩ'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    {language === 'en' ? 'Spread the word with friends' : 'ለጓደኞችዎ ያጋሩ'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Preview Snippet */}
            <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-zinc-850 rounded-xl border border-gray-100 dark:border-zinc-800">
              <img src={product.image} alt={product.nameEn} className="w-12 h-12 object-cover rounded-lg shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                  {shareTitle}
                </h4>
                <p className="text-[11px] font-mono font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {displayPrice.toLocaleString()} ETB
                </p>
              </div>
            </div>

            {/* Direct Copy Link Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">
                {language === 'en' ? 'Direct Product Link' : 'የምርት ሊንክ'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-800 dark:text-zinc-200 rounded-xl px-3 py-2 font-mono focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Copied' : 'ተገልብጧል'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Copy' : 'ቅዳ'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Sharing Grid */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">
                {language === 'en' ? 'Share via Social Media' : 'በማህበራዊ ሚዲያ ያጋሩ'}
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* Telegram */}
                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-400 font-bold text-xs transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-sky-500 transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </div>
                  <span>Telegram</span>
                </button>

                {/* TikTok */}
                <button
                  type="button"
                  onClick={handleShareTiktok}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 hover:bg-black hover:text-white text-zinc-900 dark:text-zinc-100 font-bold text-xs transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V5.86a6.37 6.37 0 0 0-1-.08A6.34 6.34 0 1 0 15.8 12V8.42a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.15z"/>
                    </svg>
                  </div>
                  <span>TikTok</span>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 font-bold text-xs transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    <Facebook className="w-4 h-4 fill-current" />
                  </div>
                  <span>Facebook</span>
                </button>

                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareWhatsapp}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2zm5.8 14.1c-.24.68-1.2 1.3-1.95 1.47-.51.11-1.18.2-3.44-.73-2.88-1.19-4.74-4.13-4.88-4.32-.14-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.27-.29.59-.36.79-.36.2 0 .4 0 .58.01.19.01.44-.07.69.53.25.6.86 2.09.93 2.24.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.32.39-.46.53-.15.15-.3.31-.13.61.17.3.77 1.27 1.66 2.06 1.14 1.01 2.1 1.33 2.4 1.48.3.15.48.13.66-.08.18-.21.77-.9.98-1.21.21-.31.41-.26.69-.15.28.11 1.78.84 2.09.99.31.15.52.23.59.36.07.13.07.76-.17 1.44z"/>
                    </svg>
                  </div>
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Native Device Share API Option */}
            {navigator.share && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'More Options...' : 'ተጨማሪ አማራጮች...'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};


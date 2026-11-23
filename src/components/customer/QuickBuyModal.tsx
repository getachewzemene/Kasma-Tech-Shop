import React, { useState, useEffect } from 'react';
import { Product, Variant } from '../../types';
import {
  Eye,
  ShieldCheck,
  X,
  Star,
  GitCompare,
  Share2,
  Heart,
  Truck,
  RotateCcw,
  Tag,
  Flame,
  Check,
  ShoppingCart,
  Zap,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { LazyImage } from '../LazyImage';
import { getProductGallery } from '../../utils/productSpecs';

interface QuickBuyModalProps {
  product: Product | null;
  onClose: () => void;
  language: 'en' | 'am';
  getProductRatingInfo: (product: Product) => { avg: number; count: number };
  comparedProductIds: string[];
  onToggleCompare: (id: string, e?: React.MouseEvent) => void;
  onShareProduct: (p: Product) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onAddToCart: (p: Product, v: Variant, qty: number) => void;
  onInstantBuy: (p: Product, v: Variant, qty: number) => void;
  onOpenProduct: (p: Product) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const QuickBuyModal: React.FC<QuickBuyModalProps> = ({
  product,
  onClose,
  language,
  getProductRatingInfo,
  comparedProductIds,
  onToggleCompare,
  onShareProduct,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onInstantBuy,
  onOpenProduct,
  showToast
}) => {
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);
  const [quickBuyVariant, setQuickBuyVariant] = useState<Variant | null>(null);
  const [quickBuyQuantity, setQuickBuyQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setQuickViewImageIndex(0);
      setQuickBuyQuantity(1);
      setQuickBuyVariant(product.variants?.[0] || null);
    }
  }, [product]);

  if (!product) return null;

  const gallery = getProductGallery(product);
  const currentImg = gallery[quickViewImageIndex] || product.image;
  const { avg, count } = getProductRatingInfo(product);

  const activeStock = quickBuyVariant
    ? quickBuyVariant.onHand
    : product.variants?.reduce((a, v) => a + v.onHand, 0) || 0;

  const unitPrice = quickBuyVariant ? product.price + quickBuyVariant.priceOffset : product.price;
  const totalPrice = unitPrice * quickBuyQuantity;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 z-55 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full shadow-2xl relative border-t sm:border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 my-0 sm:my-auto"
      >
        {/* Modal Fixed Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-[#0052FF] dark:text-blue-400 uppercase tracking-widest font-black">
                  {language === 'en' ? 'Quick Preview' : 'ፈጣን እይታ'}
                </span>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  {language === 'en' ? 'Verified' : 'የተረጋገጠ'}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-gray-950 dark:text-white truncate">
                {product.merchantName || 'KASMA Official Store'}
              </h3>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400 rounded-full p-1.5 sm:p-2 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-xs shrink-0 ml-2"
            title={language === 'en' ? 'Close Preview' : 'እይታ ዝጋ'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Inner Scroll Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 sm:space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start">
            {/* Left Column / Mobile Image Gallery */}
            <div className="md:col-span-5 flex flex-col gap-2.5">
              {/* Title & Rating (Mobile Only) */}
              <div className="md:hidden space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/40">
                    {product.brand}
                  </span>
                  {avg > 0 && (
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 px-2.5 py-0.5 rounded-full text-amber-800 dark:text-amber-300 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{avg}</span>
                      <span className="text-gray-400 font-normal">
                        ({count} {language === 'en' ? 'reviews' : 'ግምገማዎች'})
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-base font-black text-gray-950 dark:text-white leading-snug">
                  {language === 'en' ? product.nameEn : product.nameAm}
                </h2>
              </div>

              {/* Image Frame */}
              <div className="relative aspect-[4/3] sm:aspect-square h-44 xs:h-52 sm:h-auto w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 group shadow-inner">
                <LazyImage
                  src={currentImg}
                  alt={product.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Category Pill Tag */}
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
                  {product.category}
                </span>

                {/* Action Bar on Image */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                  {/* Compare Button */}
                  <button
                    type="button"
                    title={language === 'en' ? 'Compare Specs' : 'ዝርዝር አነጻጽር'}
                    onClick={(e) => onToggleCompare(product.id, e)}
                    className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95 border ${
                      comparedProductIds.includes(product.id)
                        ? 'bg-[#0052FF] text-white border-blue-400 shadow-blue-500/30'
                        : 'bg-white/90 dark:bg-zinc-900/90 text-gray-600 dark:text-zinc-300 hover:text-[#0052FF] border-white/80 dark:border-zinc-700'
                    }`}
                  >
                    <GitCompare
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        comparedProductIds.includes(product.id) ? 'scale-110' : ''
                      }`}
                    />
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    title={language === 'en' ? 'Share Product' : 'ምርቱን ያጋሩ'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareProduct(product);
                    }}
                    className="p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95 bg-white/90 dark:bg-zinc-900/90 text-gray-600 dark:text-zinc-300 hover:text-indigo-600 border border-white/80 dark:border-zinc-700"
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                  </button>

                  {/* Wishlist Heart Toggle Button */}
                  <button
                    type="button"
                    title={language === 'en' ? 'Save to Wishlist' : 'ወደ ተወዳጆች ያስቀምጡ'}
                    onClick={(e) => onToggleFavorite(product.id, e)}
                    className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95 border ${
                      favorites.includes(product.id)
                        ? 'bg-red-50 dark:bg-red-950/90 text-red-600 border-red-300 dark:border-red-800 shadow-sm shadow-red-500/20'
                        : 'bg-white/90 dark:bg-zinc-900/90 text-gray-500 hover:text-red-600 border border-white/80 dark:border-zinc-700'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                        favorites.includes(product.id) ? 'fill-red-600 text-red-600 scale-110' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery Switcher */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuickViewImageIndex(idx)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-gray-100 dark:bg-zinc-900 ${
                        quickViewImageIndex === idx
                          ? 'border-[#0052FF] scale-105 shadow-xs'
                          : 'border-gray-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <LazyImage src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust & Guarantee Badges (Desktop View) */}
              <div className="hidden md:block p-3 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-150 dark:border-zinc-855 space-y-2 mt-1">
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    {language === 'en'
                      ? '100% Authentic Quality Guarantee'
                      : '100% ኦሪጅናል ጥራት ዋስትና'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 text-xs font-bold">
                  <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>
                    {language === 'en'
                      ? 'Fast Express Delivery in Addis Ababa'
                      : 'ፈጣን ኤክስፕረስ ማድረሻ በአዲስ አበባ'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 text-xs font-bold">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {language === 'en' ? 'Easy Return & Protection' : 'ቀላል ተመላሽ እና ጥበቃ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Specs, Options, Pricing & CTAs */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3.5 sm:space-y-4 text-left min-w-0">
              <div className="space-y-3 min-w-0">
                {/* Brand & Rating Row (Desktop View) */}
                <div className="hidden md:flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                    <Tag className="w-3.5 h-3.5 inline mr-1" />
                    {product.brand}
                  </span>

                  {avg > 0 && (
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 px-2.5 py-1 rounded-full text-amber-800 dark:text-amber-300 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{avg}</span>
                      <span className="text-gray-400 font-normal text-xs">
                        ({count} {language === 'en' ? 'reviews' : 'ግምገማዎች'})
                      </span>
                    </div>
                  )}
                </div>

                {/* Title (Desktop View) */}
                <div className="hidden md:block">
                  <h2 className="text-base sm:text-lg font-black text-gray-950 dark:text-white leading-snug">
                    {language === 'en' ? product.nameEn : product.nameAm}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {language === 'en' ? product.nameAm : product.nameEn}
                  </p>
                </div>

                {/* Price Banner */}
                <div className="p-3 sm:p-3.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 rounded-2xl border border-blue-100/80 dark:border-zinc-800 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <span className="text-xs uppercase font-bold text-gray-400 tracking-wider block">
                      {language === 'en' ? 'Calculated Price' : 'የተሰላ ዋጋ'}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
                      <span className="font-mono text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
                        {totalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono text-[#0052FF] dark:text-blue-400 uppercase tracking-wider whitespace-nowrap">
                        ETB
                      </span>
                      {quickBuyQuantity > 1 && (
                        <span className="text-xs text-gray-500 font-bold font-mono ml-1 whitespace-nowrap">
                          ({unitPrice.toLocaleString()} ETB / {language === 'en' ? 'unit' : 'ፍሬ'})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="shrink-0">
                    {activeStock <= 0 ? (
                      <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl font-bold text-xs whitespace-nowrap">
                        {language === 'en' ? 'Out of Stock' : 'አልቋል'}
                      </span>
                    ) : activeStock <= 3 ? (
                      <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl font-bold text-xs flex items-center gap-1 whitespace-nowrap">
                        <Flame className="w-3 h-3 fill-current" />
                        {language === 'en' ? `Low Stock (${activeStock})` : `ጥቂት ቀርቷል (${activeStock})`}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-xs whitespace-nowrap">
                        ✓ {language === 'en' ? `In Stock (${activeStock})` : `አለ (${activeStock})`}
                      </span>
                    )}
                  </div>
                </div>

                {/* High Price Device Installment & Pay on Delivery Banner */}
                {totalPrice >= 30000 && (
                  <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{language === 'en' ? 'Flexible Installment Option' : 'የቀላል ወርሃዊ ክፍያ'}</span>
                      </span>
                      <span className="font-mono text-[11px] bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 font-black">
                        3x {(Math.round(totalPrice / 3)).toLocaleString()} ETB/mo
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                      <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'en' ? 'Pay on Delivery in Addis: Inspect & test before payment' : 'ሲደርስዎ ይክፈሉ፡ እቃውን ፈትሸውና ሞክረው ይክፈሉ'}</span>
                    </div>
                  </div>
                )}

                {/* Product Description Snippet: 14px minimum */}
                <div className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed bg-gray-50/50 dark:bg-zinc-950/50 p-2.5 sm:p-3 rounded-2xl border border-gray-100 dark:border-zinc-800/80 line-clamp-2 sm:line-clamp-3">
                  {language === 'en' ? product.descriptionEn : product.descriptionAm}
                </div>

                {/* Variant Selection Grid */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                      {language === 'en' ? 'Select Variant / Color' : 'አማራጭ / ቀለም ይምረጡ'}
                    </label>
                    <div
                      className={`grid gap-2 ${
                        product.variants.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}
                    >
                      {product.variants.map((v) => {
                        const isSelected = quickBuyVariant?.sku === v.sku;
                        const totalCost = product.price + v.priceOffset;
                        return (
                          <button
                            key={v.sku}
                            type="button"
                            onClick={() => {
                              setQuickBuyVariant(v);
                              setQuickBuyQuantity(1);
                            }}
                            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between min-w-0 ${
                              isSelected
                                ? 'border-[#0052FF] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#0052FF]'
                                : 'border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 min-w-0">
                              <span className="text-xs font-extrabold text-gray-950 dark:text-white truncate">
                                {v.name}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />}
                            </div>
                            <div className="flex justify-between items-center mt-1.5 gap-1">
                              <span className="text-xs font-mono font-bold text-gray-700 dark:text-zinc-300 whitespace-nowrap">
                                {totalCost.toLocaleString()} ETB
                              </span>
                              <span
                                className={`text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap ${
                                  v.onHand > 0
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                }`}
                              >
                                {v.onHand > 0 ? `${v.onHand} left` : 'Out'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Controller */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 border border-gray-150 dark:border-zinc-800 rounded-2xl">
                  <div>
                    <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                      {language === 'en' ? 'Select Quantity' : 'ብዛት ይምረጡ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-zinc-950 p-1 sm:p-1.5 rounded-xl border border-gray-200/60 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setQuickBuyQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-black text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-lg shadow-xs hover:bg-gray-50 transition-colors cursor-pointer select-none text-sm"
                    >
                      −
                    </button>
                    <span className="font-mono text-xs sm:text-sm font-black text-gray-950 dark:text-white px-1 sm:px-2">
                      {quickBuyQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const maxStock = quickBuyVariant ? quickBuyVariant.onHand : 99;
                        if (quickBuyQuantity + 1 > maxStock) {
                          showToast(
                            language === 'en'
                              ? `Cannot select more than ${maxStock} items.`
                              : `ከ ${maxStock} በላይ መምረጥ አይቻልም።`,
                            'warning'
                          );
                        } else {
                          setQuickBuyQuantity((prev) => prev + 1);
                        }
                      }}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-black text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-lg shadow-xs hover:bg-gray-50 transition-colors cursor-pointer select-none text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    disabled={!quickBuyVariant || quickBuyVariant.onHand <= 0}
                    onClick={() => {
                      if (!quickBuyVariant) return;
                      onAddToCart(product, quickBuyVariant, quickBuyQuantity);
                      onClose();
                      showToast(
                        language === 'en'
                          ? `Added ${quickBuyQuantity}x ${product.nameEn} to your cart!`
                          : `${quickBuyQuantity}x ${product.nameAm} ወደ ሱቅ ጋሪዎ ተጨምሯል!`,
                        'success'
                      );
                    }}
                    className={`h-11 sm:h-12 w-full px-2.5 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap ${
                      !quickBuyVariant || quickBuyVariant.onHand <= 0
                        ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed border border-gray-200 dark:border-zinc-800'
                        : 'bg-[#0052FF] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-[0.98]'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    <span className="truncate">{language === 'en' ? 'Add To Cart' : 'ወደ ጋሪ አስገባ'}</span>
                  </button>

                  {/* Instant Buy Button */}
                  <button
                    type="button"
                    disabled={!quickBuyVariant || quickBuyVariant.onHand <= 0}
                    onClick={() => {
                      if (!quickBuyVariant) return;
                      onInstantBuy(product, quickBuyVariant, quickBuyQuantity);
                      onClose();
                      showToast(
                        language === 'en' ? 'Proceeding to checkout...' : 'ወደ ክፍያ በመሄድ ላይ...',
                        'info'
                      );
                    }}
                    className={`h-11 sm:h-12 w-full px-2.5 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border whitespace-nowrap shadow-xs active:scale-[0.98] ${
                      !quickBuyVariant || quickBuyVariant.onHand <= 0
                        ? 'bg-gray-100 dark:bg-zinc-800 border-transparent text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                        : 'bg-amber-400 hover:bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-current text-black shrink-0" />
                    <span className="truncate">{language === 'en' ? 'Buy Now' : 'አሁኑኑ ግዛ'}</span>
                  </button>
                </div>

                {/* Compact Mobile Trust Ribbon */}
                <div className="md:hidden flex items-center justify-center flex-wrap gap-2 text-xs text-gray-500 dark:text-zinc-400 font-bold pt-1.5 border-t border-gray-100 dark:border-zinc-800/80">
                  <span>🛡️ 100% Authentic</span>
                  <span>·</span>
                  <span>🚚 Express Delivery</span>
                  <span>·</span>
                  <span>🔄 Easy Returns</span>
                </div>

                {/* Compare & Share Action Buttons in QuickView */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => onToggleCompare(product.id, e)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      comparedProductIds.includes(product.id)
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-[#0052FF] text-[#0052FF]'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5 text-[#0052FF]" />
                    <span>
                      {comparedProductIds.includes(product.id)
                        ? language === 'en'
                          ? 'Compared ✓'
                          : 'ተነጻጽሯል ✓'
                        : language === 'en'
                          ? 'Compare'
                          : 'አነጻጽር'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareProduct(product);
                    }}
                    className="py-2 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{language === 'en' ? 'Share' : 'አጋራ'}</span>
                  </button>
                </div>

                {/* View Full Page & Reviews button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProduct(product);
                  }}
                  className="w-full py-2.5 bg-gray-50 dark:bg-zinc-850 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-150 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>
                    {language === 'en' ? 'View Full Page & Reviews' : 'ሙሉ ገጽ እና ግምገማዎችን እይ'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

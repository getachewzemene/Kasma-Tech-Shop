import React from 'react';
import {
  GitCompare, Share2, Heart, ShieldCheck, Check, Truck, Lock, Sparkles,
  Package, RotateCcw, Star, Box, Scale, Battery, Wifi, MessageCircle,
  CreditCard, MapPin, Award, Send, ShoppingCart, Zap, MessageSquare,
  RefreshCw, HelpCircle, Camera
} from 'lucide-react';
import { Product, Variant, CartItem, Order, QAItem } from '../../types';
import { LazyImage } from '../LazyImage';
import DeliveryTimeEstimator from '../DeliveryTimeEstimator';
import { getProductGallery, getProductSpecs } from '../../utils/productSpecs';

const ADDIS_DELIVERY_AREAS = [
  { id: 'bole', nameEn: 'Bole, Addis Ababa', nameAm: 'ቦሌ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'megenagna', nameEn: 'Megenagna, Addis Ababa', nameAm: 'መገናኛ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'piassa', nameEn: 'Piassa, Addis Ababa', nameAm: 'ፒያሳ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'sarbet', nameEn: 'Sarbet / Mexico, Addis Ababa', nameAm: 'ሳርቤት / ሜክሲኮ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'kazanchis', nameEn: 'Kazanchis, Addis Ababa', nameAm: 'ካዛንቺስ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'cmc', nameEn: 'CMC / Ayat, Addis Ababa', nameAm: 'ሲኤምሲ / አያት፣ አዲስ አበባ', timeEn: 'Today within 3-5 Hours', timeAm: 'ዛሬ በ3-5 ሰዓታት ውስጥ', isToday: true },
  { id: 'adama', nameEn: 'Adama (Nazret)', nameAm: 'አዳማ (ናዝሬት)', timeEn: 'Tomorrow Morning', timeAm: 'ነገ ጠዋት', isToday: false },
  { id: 'hawassa', nameEn: 'Hawassa', nameAm: 'ሀዋሳ', timeEn: 'Tomorrow Afternoon', timeAm: 'ነገ ከሰዓት', isToday: false },
];

interface CategoryItem {
  id: string;
  nameEn: string;
  nameAm: string;
}

interface ProductDetailModalProps {
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  language: 'en' | 'am';
  categories: CategoryItem[];
  searchQuery: string;
  highlightText: (text: string, highlight: string) => React.ReactNode;
  comparedProductIds: string[];
  onToggleCompare: (id: string, e?: React.MouseEvent) => void;
  onShareProduct: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  activeGalleryIndex: number;
  setActiveGalleryIndex: (idx: number) => void;
  selectedVariant: Variant | null;
  setSelectedVariant: (variant: Variant | null) => void;
  selectedDeliveryArea: string;
  setSelectedDeliveryArea: (area: string) => void;
  getProductRatingInfo: (product: Product) => { avg: number; count: number };
  addToCart: (product: Product, variant: Variant, quantity?: number) => void;
  setIsCartOpen: (open: boolean) => void;
  handleInstantBuy: (product: Product, variant: Variant, quantity?: number) => void;
  fbtProducts: Product[];
  fbtSelectedIds: string[];
  setFbtSelectedIds: (ids: string[]) => void;
  addBundleToCart: (items: { product: Product; price: number }[]) => void;
  allOrders: Order[];
  onAddOrder: (order: Order) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  reviewError: string;
  handleReviewSubmit: (e: React.FormEvent, productId: string) => void;
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  revName: string;
  setRevName: (name: string) => void;
  revPhone: string;
  setRevPhone: (phone: string) => void;
  reviewComment: string;
  setReviewComment: (comment: string) => void;
  reviewPhotoUrl: string;
  setReviewPhotoUrl: (url: string) => void;
  isSubmittingReview: boolean;
  localQaMap: Record<string, QAItem[]>;
  handleQuestionSubmit: (e: React.FormEvent, productId: string) => void;
  newQuestionAskedBy: string;
  setNewQuestionAskedBy: (name: string) => void;
  newQuestionText: string;
  setNewQuestionText: (text: string) => void;
  activeReviewPhotoModal: string | null;
  setActiveReviewPhotoModal: (url: string | null) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  selectedProduct,
  setSelectedProduct,
  language,
  categories,
  searchQuery,
  highlightText,
  comparedProductIds,
  onToggleCompare,
  onShareProduct,
  favorites,
  onToggleFavorite,
  activeGalleryIndex,
  setActiveGalleryIndex,
  selectedVariant,
  setSelectedVariant,
  selectedDeliveryArea,
  setSelectedDeliveryArea,
  getProductRatingInfo,
  addToCart,
  setIsCartOpen,
  handleInstantBuy,
  fbtProducts,
  fbtSelectedIds,
  setFbtSelectedIds,
  addBundleToCart,
  allOrders,
  onAddOrder,
  showToast,
  reviewError,
  handleReviewSubmit,
  reviewRating,
  setReviewRating,
  revName,
  setRevName,
  revPhone,
  setRevPhone,
  reviewComment,
  setReviewComment,
  reviewPhotoUrl,
  setReviewPhotoUrl,
  isSubmittingReview,
  localQaMap,
  handleQuestionSubmit,
  newQuestionAskedBy,
  setNewQuestionAskedBy,
  newQuestionText,
  setNewQuestionText,
  activeReviewPhotoModal,
  setActiveReviewPhotoModal
}) => {
  return (
    <>
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-zinc-900 rounded-none sm:rounded-3xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl relative border-0 sm:border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 transition-colors">

            {/* Mobile Sticky Header Bar */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 py-2.5 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between sm:hidden gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 truncate flex-1 min-w-0">
                {language === 'en' ? selectedProduct.nameEn : selectedProduct.nameAm}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  title={language === 'en' ? 'Compare' : 'አነጻጽር'}
                  onClick={(e) => onToggleCompare(selectedProduct.id, e)}
                  className={`p-1.5 rounded-full border text-xs cursor-pointer transition-all ${comparedProductIds.includes(selectedProduct.id)
                    ? 'bg-[#0052FF] text-white border-blue-400'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
                    }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title={language === 'en' ? 'Share' : 'አጋራ'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareProduct(selectedProduct);
                  }}
                  className="p-1.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 cursor-pointer transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                </button>
                <button
                  type="button"
                  title={language === 'en' ? 'Wishlist' : 'ተወዳጆች'}
                  onClick={(e) => onToggleFavorite(selectedProduct.id, e)}
                  className={`p-1.5 rounded-full border text-xs cursor-pointer transition-all ${favorites.includes(selectedProduct.id)
                    ? 'bg-red-50 dark:bg-red-950/80 text-red-600 border-red-300 dark:border-red-800 shadow-sm shadow-red-500/20'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 transition-transform ${favorites.includes(selectedProduct.id) ? 'fill-red-600 text-red-600 scale-110' : ''}`} />
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-full p-1.5 text-xs font-bold w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all shrink-0 ml-1"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Desktop Floating Action Bar */}
            <div className="hidden sm:flex absolute top-4 right-4 items-center gap-2 z-50">
              <button
                type="button"
                title={language === 'en' ? 'Side-by-Side Specs Compare' : 'ዝርዝር ማነጻጸሪያ'}
                onClick={(e) => onToggleCompare(selectedProduct.id, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs border text-xs font-bold ${comparedProductIds.includes(selectedProduct.id)
                  ? 'bg-[#0052FF] text-white border-blue-400 shadow-blue-500/30'
                  : 'bg-white/95 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:text-[#0052FF] border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
                  }`}
              >
                <GitCompare className="w-3.5 h-3.5 text-[#0052FF]" />
                <span>{comparedProductIds.includes(selectedProduct.id) ? (language === 'en' ? 'Compared ✓' : 'ተነጻጽሯል ✓') : (language === 'en' ? 'Compare' : 'አነጻጽር')}</span>
              </button>

              <button
                type="button"
                title={language === 'en' ? 'Share Product' : 'ምርቱን ያጋሩ'}
                onClick={(e) => {
                  e.stopPropagation();
                  onShareProduct(selectedProduct);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs border bg-white/95 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:text-indigo-600 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 text-xs font-bold"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{language === 'en' ? 'Share' : 'አጋራ'}</span>
              </button>

              <button
                type="button"
                title={language === 'en' ? 'Save to Wishlist' : 'ወደ ተወዳጆች ያስቀምጡ'}
                onClick={(e) => onToggleFavorite(selectedProduct.id, e)}
                className={`p-2 rounded-full transition-all cursor-pointer shadow-xs border ${favorites.includes(selectedProduct.id)
                  ? 'bg-red-50 dark:bg-red-950/90 text-red-600 border-red-300 dark:border-red-800 shadow-sm shadow-red-500/20'
                  : 'bg-white/95 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-red-600 border-gray-200 dark:border-zinc-700'
                  }`}
              >
                <Heart className={`w-4 h-4 transition-transform ${favorites.includes(selectedProduct.id) ? 'fill-red-600 text-red-600 scale-110' : ''}`} />
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-500 dark:text-zinc-400 rounded-full p-2 text-sm font-bold w-9 h-9 flex items-center justify-center transition-all border border-gray-150 dark:border-zinc-800 cursor-pointer shadow-xs ml-1"
                title="Close"
              >
                ✕
              </button>
            </div>

            {(() => {
              const gallery = getProductGallery(selectedProduct);
              const mainImg = gallery[activeGalleryIndex] || selectedProduct.image;
              const activeStock = selectedVariant ? selectedVariant.onHand : selectedProduct.variants.reduce((acc, v) => acc + v.onHand, 0);
              const isOutOfStock = selectedVariant ? selectedVariant.onHand <= 0 : selectedProduct.variants.every(v => v.onHand <= 0);
              const isLowStock = selectedVariant
                ? (selectedVariant.onHand > 0 && selectedVariant.onHand <= selectedProduct.lowStockThreshold)
                : (activeStock > 0 && activeStock <= selectedProduct.lowStockThreshold * selectedProduct.variants.length);

              return (
                <div className="grid grid-cols-1 md:grid-cols-12 w-full min-w-0">
                  <div className="col-span-full md:col-span-5 w-full min-w-0 bg-gray-50 dark:bg-zinc-950 p-2.5 sm:p-6 flex flex-col space-y-2.5 sm:space-y-4 justify-between border-b md:border-b-0 md:border-r border-gray-150 dark:border-zinc-800">
                    <div className="space-y-2.5 sm:space-y-4 w-full min-w-0">
                      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs group flex items-center justify-center p-0">
                        <LazyImage
                          src={mainImg}
                          alt={selectedProduct.nameEn}
                          className="w-full h-full object-cover transition-all duration-300 transform group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg z-10 shadow-xs">
                          {language === 'en' ? 'High-Res Preview' : 'ከፍተኛ ጥራት ቅድመ-ዕይታ'}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full min-w-0">
                        {gallery.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveGalleryIndex(idx)}
                            className={`aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all relative cursor-pointer flex items-center justify-center bg-gray-100 dark:bg-zinc-900 ${activeGalleryIndex === idx
                              ? 'border-kasma-blue scale-102 shadow-xs'
                              : 'border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600'
                              }`}
                          >
                            <LazyImage src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            {activeGalleryIndex === idx && (
                              <div className="absolute inset-0 bg-kasma-blue/10 flex items-center justify-center">
                                <span className="bg-kasma-blue text-white text-[9px] font-extrabold px-1 rounded">✓</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="hidden md:block space-y-2 pt-1">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-3.5 space-y-2 shadow-2xs w-full min-w-0">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                            <span>{language === 'en' ? 'Verified Quality Guarantee' : 'የተረጋገጠ የጥራት ዋስትና'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs w-full min-w-0">
                            <div className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/90 border border-gray-150 dark:border-zinc-700/80 flex items-center gap-1.5 text-gray-700 dark:text-zinc-200 min-w-0">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="font-semibold text-xs truncate">{language === 'en' ? '100% Authentic' : '100% እውነተኛ'}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/90 border border-gray-150 dark:border-zinc-700/80 flex items-center gap-1.5 text-gray-700 dark:text-zinc-200 min-w-0">
                              <Truck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="font-semibold text-xs truncate">{language === 'en' ? 'Fast Shipping' : 'ፈጣን ማጓጓዣ'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DeliveryTimeEstimator language={language} />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-span-full md:col-span-7 w-full min-w-0 p-4 sm:p-6 md:p-8 flex flex-col space-y-4 sm:space-y-5">
                    <div className="space-y-3.5 sm:space-y-4 w-full min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-gray-500 dark:text-zinc-400 font-semibold truncate max-w-[200px]">
                          {selectedProduct.brand} • {categories.find(c => c.id === selectedProduct.category)?.nameEn}
                        </span>

                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-850 px-2.5 py-1 rounded-full border border-gray-150 dark:border-zinc-800 shrink-0">
                          <span className={`w-2 h-2 rounded-full relative flex shrink-0 ${isOutOfStock
                            ? 'bg-red-500'
                            : isLowStock
                              ? 'bg-orange-500 animate-pulse'
                              : 'bg-green-500 animate-pulse'
                            }`}>
                            {!isOutOfStock && (
                              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isLowStock ? 'bg-orange-400' : 'bg-green-400'}`} />
                            )}
                          </span>
                          <span className="text-xs font-bold text-gray-600 dark:text-zinc-300 whitespace-nowrap">
                            {isOutOfStock
                              ? (language === 'en' ? 'Out of Stock' : 'ክምችት አልቋል')
                              : isLowStock
                                ? (language === 'en' ? `Low Stock: Only ${activeStock} left` : `ክምችት ጥቂት፡ ${activeStock} ብቻ ቀሪ`)
                                : (language === 'en' ? `In Stock: ${activeStock} available` : `በክምችት ውስጥ፡ ${activeStock} አለ`)}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
                        {highlightText(language === 'en' ? selectedProduct.nameEn : selectedProduct.nameAm, searchQuery)}
                      </h3>

                      {/* Product Condition & Authenticity */}
                      <div className="bg-gray-50/90 dark:bg-zinc-850/80 p-3 sm:p-3.5 rounded-2xl border border-gray-200/80 dark:border-zinc-750/70 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedProduct.condition === 'SEALED' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{language === 'en' ? 'Factory Sealed' : 'በፋብሪካው የታሸገ'}</span>
                              </span>
                            ) : selectedProduct.condition === 'BRAND_NEW' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100/90 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>{language === 'en' ? 'Brand New' : 'አዲስ (ያልተከፈተ)'}</span>
                              </span>
                            ) : selectedProduct.condition === 'OPEN_BOX' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>{language === 'en' ? 'Open Box' : 'ክፍት ሳጥን'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100/90 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                <RotateCcw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                <span>{language === 'en' ? 'Certified Refurbished' : 'የታደሰ'}</span>
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 font-mono shadow-2xs">
                              <ShieldCheck className="w-3 h-3 text-[#0052FF]" />
                              <span>
                                {language === 'en'
                                  ? (selectedProduct.warrantyTextEn || `${selectedProduct.warrantyMonths || 12} Mo Official Warranty`)
                                  : (selectedProduct.warrantyTextAm || `የ${selectedProduct.warrantyMonths || 12} ወር ዋስትና`)}
                              </span>
                            </span>
                          </div>

                          <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                            {language === 'en' ? 'Condition Verified' : 'ሁኔታው የተረጋገጠ'}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-snug">
                          {selectedProduct.condition === 'SEALED'
                            ? (language === 'en'
                              ? '🔒 Factory Sealed: Manufacturer original box with intact tamper-evident holographic seal. Never opened, unsealed, or activated.'
                              : '🔒 በፋብሪካው የታሸገ፡ የፋብሪካው ኦሪጅናል ማሸጊያ ያልተከፈተና ያልበራ አዲስ እቃ።')
                            : selectedProduct.condition === 'BRAND_NEW'
                              ? (language === 'en'
                                ? '✨ Brand New: 100% brand new, zero operational hours, with all genuine accessories and factory documentation.'
                                : '✨ አዲስ እቃ፡ 100% አዲስ ያልተጠቀሙበት እቃ ከሙሉ ኦሪጅናል መለዋወጫዎች ጋር።')
                              : selectedProduct.condition === 'OPEN_BOX'
                                ? (language === 'en'
                                  ? '📦 Open Box: Original packaging opened for display or inspection. Device is in mint condition and 100% tested.'
                                  : '📦 ክፍት ሳጥን፡ ለማሳያ ወይም ምርመራ የተከፈተ ሳጥን፣ 100% የሚሰራ ያለ ምንም ጉድለት።')
                                : (language === 'en'
                                  ? '🔄 Certified Refurbished: Professionally inspected, repaired, and certified to meet original manufacturer standards.'
                                  : '🔄 የታደሰ፡ በካስማ ቴክኒሻኖች በሚገባ የተፈተሸ እና የተረጋገጠ።')}
                        </p>
                      </div>

                      {/* Average Rating Summary */}
                      {(() => {
                        const { avg, count } = getProductRatingInfo(selectedProduct);
                        return (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                            {count > 0 || avg > 0 ? (
                              <>
                                <div className="flex items-center text-amber-500 font-extrabold gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${s <= Math.round(avg)
                                        ? 'fill-amber-500 text-amber-500'
                                        : 'text-gray-200 dark:text-zinc-800'
                                        }`}
                                    />
                                  ))}
                                  <span className="ml-1 text-gray-900 dark:text-white font-mono">{avg}</span>
                                </div>
                                <span className="text-gray-350 dark:text-zinc-700">•</span>
                                <span
                                  className="font-bold underline cursor-pointer hover:text-black dark:hover:text-white transition-all text-xs"
                                  onClick={() => {
                                    const el = document.getElementById('reviews-section');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                >
                                  ({count} {language === 'en' ? 'reviews' : 'ግምገማዎች'})
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-bold text-xs border border-gray-200/60 dark:border-zinc-750">
                                <span>{language === 'en' ? 'No ratings yet' : 'እስካሁን ምንም ደረጃ አልተሰጠውም'}</span>
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Detailed Description */}
                      <div className="bg-gray-50/80 dark:bg-zinc-800/80 p-3.5 sm:p-4 rounded-2xl border border-gray-150 dark:border-zinc-700/80 space-y-1.5 shadow-2xs">
                        <span className="text-xs text-gray-500 dark:text-zinc-400 font-bold block">
                          {language === 'en' ? 'Product Overview' : 'የምርት አጠቃላይ መግለጫ'}
                        </span>
                        <p className="text-gray-700 dark:text-zinc-200 text-sm leading-relaxed">
                          {highlightText(language === 'en' ? selectedProduct.descriptionEn : selectedProduct.descriptionAm, searchQuery)}
                        </p>
                      </div>

                      {/* DETAILED PRODUCT SPECIFICATIONS GRID */}
                      {(() => {
                        const specs = getProductSpecs(selectedProduct);
                        if (!specs || specs.length === 0) return null;
                        return (
                          <div className="space-y-2">
                            <span className="text-xs text-gray-500 dark:text-zinc-400 font-bold flex items-center gap-1.5">
                              <Box className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              {language === 'en' ? 'Key Specifications' : 'ዋና ዋና መግለጫዎች'}
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {specs.map((spec, sIdx) => {
                                const isWeight = spec.labelEn.toLowerCase().includes('weight');
                                const isBattery = spec.labelEn.toLowerCase().includes('battery');
                                const isConn = spec.labelEn.toLowerCase().includes('connection') || spec.labelEn.toLowerCase().includes('wireless');
                                return (
                                  <div
                                    key={sIdx}
                                    className="p-2.5 sm:p-3 rounded-xl border bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 flex flex-col justify-between shadow-2xs"
                                  >
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-0.5">
                                      {isWeight ? (
                                        <Scale className="w-3 h-3 text-amber-500 shrink-0" />
                                      ) : isBattery ? (
                                        <Battery className="w-3 h-3 text-emerald-500 shrink-0" />
                                      ) : isConn ? (
                                        <Wifi className="w-3 h-3 text-blue-500 shrink-0" />
                                      ) : (
                                        <Box className="w-3 h-3 text-indigo-500 shrink-0" />
                                      )}
                                      <span>{language === 'en' ? spec.labelEn : spec.labelAm}</span>
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-zinc-100 text-xs sm:text-sm leading-snug">
                                      {language === 'en' ? spec.valueEn : spec.valueAm}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* SKU Options Selector */}
                      <div className="space-y-2 pt-1">
                        <span className="text-xs text-gray-500 dark:text-zinc-400 font-bold block">
                          {language === 'en' ? 'Select Option / SKU' : 'የእቃውን አይነት / SKU ይምረጡ'}
                        </span>
                        <div className={`grid gap-2 ${selectedProduct.variants.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                          {selectedProduct.variants.map(v => {
                            const isSelected = selectedVariant?.sku === v.sku;
                            const isVariantOutOfStock = v.onHand <= 0;
                            const isVariantLowStock = v.onHand > 0 && v.onHand <= selectedProduct.lowStockThreshold;
                            const totalCost = selectedProduct.price + v.priceOffset;
                            return (
                              <button
                                key={v.sku}
                                disabled={isVariantOutOfStock}
                                onClick={() => setSelectedVariant(v)}
                                className={`w-full p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left text-xs transition-all duration-200 flex justify-between items-center cursor-pointer min-w-0 ${isSelected
                                  ? 'border-kasma-blue bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-kasma-blue text-gray-950 dark:text-white shadow-xs'
                                  : isVariantOutOfStock
                                    ? 'border-gray-100 dark:border-zinc-850 bg-gray-50 dark:bg-zinc-900/50 text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                                    : 'border-gray-200 dark:border-zinc-800 hover:border-kasma-blue/70 dark:hover:border-kasma-blue/70 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200'
                                  }`}
                              >
                                <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="font-bold truncate text-gray-950 dark:text-white">{v.name}</p>
                                    <span className="text-[8px] sm:text-[9px] font-mono text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                                      {v.sku}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isVariantOutOfStock
                                      ? 'bg-red-400'
                                      : isVariantLowStock
                                        ? 'bg-orange-400'
                                        : 'bg-green-400'
                                      }`} />
                                    <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                                      {v.onHand} {language === 'en' ? 'available' : 'በእጅ ያለ'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end shrink-0 whitespace-nowrap ml-2">
                                  <p className="font-black text-gray-950 dark:text-white font-mono text-xs sm:text-sm whitespace-nowrap">
                                    {totalCost.toLocaleString()}{' '}
                                    <span className="text-[10px] sm:text-xs font-bold font-mono text-[#0052FF] dark:text-blue-400">ETB</span>
                                  </p>
                                  {isSelected && (
                                    <span className="text-[9px] sm:text-[10px] text-kasma-blue dark:text-blue-400 font-black flex items-center gap-0.5 whitespace-nowrap mt-0.5">
                                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Selected
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Low Stock WhatsApp Alert */}
                      {isLowStock && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-3 rounded-2xl flex items-center justify-between gap-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                            <p className="font-bold text-amber-900 dark:text-amber-200 text-[11px] leading-tight">
                              {language === 'en'
                                ? `⚡ Low Stock Alert: Only ${activeStock} units left!`
                                : `⚡ የአክሲዮን እጥረት፡ እጅ ላይ የቀረው ${activeStock} ፍሬ ብቻ ነው!`}
                            </p>
                          </div>
                          <a
                            href={`https://wa.me/251911223344?text=${encodeURIComponent(
                              `Hello Kasma Sales Team, I see "${selectedProduct.nameEn}" (${selectedVariant?.sku || 'Default SKU'}) is running low in stock (${activeStock} left). I would like to reserve/order it immediately!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all shrink-0 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>{language === 'en' ? 'Reserve on WhatsApp' : 'በዋትስአፕ ያዙ'}</span>
                          </a>
                        </div>
                      )}

                      {/* High-Value Device Financing */}
                      {((selectedVariant ? (selectedProduct.price + selectedVariant.priceOffset) : selectedProduct.price) >= 30000) && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-purple-50/70 to-emerald-50/80 dark:from-blue-950/40 dark:via-purple-950/30 dark:to-emerald-950/40 border border-blue-200/80 dark:border-blue-900/50 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                              <CreditCard className="w-4 h-4 text-[#0052FF]" />
                              <span>{language === 'en' ? 'High-Value Device Financing' : 'የውድ እቃዎች ክፍያ እና ዋስትና'}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-white/90 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700 shrink-0">
                              0% Interest • Telebirr / CBE
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-blue-100 dark:border-blue-950 flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-black text-[#0052FF] text-xs shrink-0">
                                3x
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white text-[11px] leading-tight">
                                  {language === 'en' ? '3 Monthly Installments' : 'የ3 ወር ተከፋይ ክፍያ'}
                                </p>
                                <p className="text-[11px] text-[#0052FF] dark:text-blue-400 font-mono font-black leading-tight mt-0.5">
                                  {Math.round((selectedVariant ? (selectedProduct.price + selectedVariant.priceOffset) : selectedProduct.price) / 3).toLocaleString()} ETB/mo
                                </p>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-emerald-100 dark:border-emerald-950 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white text-[11px] leading-tight">
                                  {language === 'en' ? 'Pay on Delivery in Addis' : 'አዲስ አበባ ደጃፍዎ ሲደርስ ይክፈሉ'}
                                </p>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight mt-0.5">
                                  {language === 'en' ? 'Inspect before payment' : 'እቃውን ፈትሸው ይክፈሉ'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delivery Estimate by Area Selector */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>{language === 'en' ? 'Delivery Estimate by Area' : 'የማድረሻ ግምት በአካባቢ'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <select
                              value={selectedDeliveryArea}
                              onChange={(e) => setSelectedDeliveryArea(e.target.value)}
                              className="text-[11px] font-bold bg-gray-50 dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 rounded-lg px-2.5 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0052FF]"
                            >
                              {ADDIS_DELIVERY_AREAS.map((area) => (
                                <option key={area.id} value={area.id}>
                                  {language === 'en' ? area.nameEn : area.nameAm}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {(() => {
                          const currentArea = ADDIS_DELIVERY_AREAS.find(a => a.id === selectedDeliveryArea) || ADDIS_DELIVERY_AREAS[0];
                          return (
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs">
                                {currentArea.isToday
                                  ? (language === 'en' ? `⚡ Arrives in ${currentArea.nameEn.split(',')[0]} today (${currentArea.timeEn})` : `⚡ ዛሬ ወደ ${currentArea.nameAm.split('፣')[0]} ይደርሳል (${currentArea.timeAm})`)
                                  : (language === 'en' ? `📦 Arrives in ${currentArea.nameEn} ${currentArea.timeEn} via Kasma Express` : `📦 ወደ ${currentArea.nameAm} ${currentArea.timeAm} በካስማ ኤክስፕረስ ይደርሳል`)}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Official Telebirr and CBE Birr Badges */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#0052FF] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-[10px]">
                            tb
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="text-[11px] font-black text-gray-900 dark:text-white leading-tight block truncate">telebirr</span>
                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 leading-tight block truncate">SuperApp Pay</span>
                          </div>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#7B1FA2] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-[10px]">
                            CBE
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="text-[11px] font-black text-gray-900 dark:text-white leading-tight block truncate">CBE Birr</span>
                            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 leading-tight block truncate">Bank Escrow</span>
                          </div>
                        </div>
                      </div>

                      {/* Verified Seller Trust Card */}
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-gray-50/90 dark:bg-zinc-850/80 border border-gray-200/80 dark:border-zinc-750/70 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-xs text-gray-950 dark:text-white truncate">
                                {selectedProduct.merchantName || 'Abyssinia Electronics'}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 shrink-0">
                                {language === 'en' ? (selectedProduct.sellerBadgeEn || 'Kasma Gold Merchant') : (selectedProduct.sellerBadgeAm || 'ወርቅ የተረጋገጠ ነጋዴ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
                              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>{selectedProduct.sellerRating || 4.9}</span>
                              </span>
                              <span>•</span>
                              <span>{selectedProduct.sellerOrderCount || 1420}+ {language === 'en' ? 'Orders Fulfilled' : 'የተጠናቀቁ ትዕዛዞች'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href="https://t.me/KasmaShopSupport"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                            title="Chat on Telegram"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Telegram</span>
                          </a>
                          <a
                            href="https://wa.me/251911223344"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-gray-150 dark:border-zinc-800 flex flex-col gap-3">
                      <div className="bg-gradient-to-b from-gray-50/95 via-gray-50/80 to-slate-50/90 dark:from-zinc-900/90 dark:via-zinc-900/80 dark:to-zinc-950/90 p-4 sm:p-5 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">
                              {language === 'en' ? 'Calculated Total' : 'የተሰላ ጠቅላላ ዋጋ'}
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white font-mono tracking-tight whitespace-nowrap">
                                {(selectedVariant
                                  ? (selectedProduct.price + selectedVariant.priceOffset)
                                  : selectedProduct.price).toLocaleString()}
                              </span>
                              <span className="text-xs sm:text-sm font-black font-mono text-[#0052FF] dark:text-blue-400 uppercase tracking-wider whitespace-nowrap">
                                ETB
                              </span>
                              {selectedProduct.originalPrice && selectedProduct.originalPrice > (selectedVariant ? selectedProduct.price + selectedVariant.priceOffset : selectedProduct.price) && (
                                <span className="text-xs font-mono line-through text-gray-400 dark:text-zinc-500 ml-1.5 whitespace-nowrap">
                                  {selectedProduct.originalPrice.toLocaleString()} ETB
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span>{language === 'en' ? 'Out of Stock' : 'ክምችት አልቋል'}</span>
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                <span>{language === 'en' ? `Only ${activeStock} left` : `${activeStock} ብቻ ቀሪ`}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{language === 'en' ? `${activeStock} available` : `${activeStock} በክምችት አለ`}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
                          <button
                            type="button"
                            disabled={!selectedVariant || selectedVariant.onHand <= 0}
                            onClick={() => {
                              if (selectedVariant) {
                                addToCart(selectedProduct, selectedVariant);
                                setSelectedProduct(null);
                                setIsCartOpen(true);
                              }
                            }}
                            className={`w-full h-11 sm:h-12 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs whitespace-nowrap border ${(!selectedVariant || selectedVariant.onHand <= 0)
                              ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed border-gray-200 dark:border-zinc-800'
                              : 'bg-white hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-900 dark:text-zinc-100 border-gray-250 dark:border-zinc-700 active:scale-[0.98]'
                              }`}
                          >
                            <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-700 dark:text-zinc-300 shrink-0" />
                            <span className="truncate">{language === 'en' ? 'Add To Cart' : 'ወደ ጋሪ አስገባ'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={!selectedVariant || selectedVariant.onHand <= 0}
                            onClick={() => {
                              if (selectedVariant) {
                                handleInstantBuy(selectedProduct, selectedVariant);
                              }
                            }}
                            className={`w-full h-11 sm:h-12 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-md shadow-blue-500/20 whitespace-nowrap active:scale-[0.98] ${(!selectedVariant || selectedVariant.onHand <= 0)
                              ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed border border-gray-200 dark:border-zinc-800'
                              : 'bg-[#0052FF] hover:bg-blue-600 text-white'
                              }`}
                          >
                            <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current text-amber-300 shrink-0" />
                            <span className="truncate">{language === 'en' ? '⚡ Buy Now' : '⚡ አሁን ግዛ'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1.5 text-[10.5px] sm:text-xs text-gray-500 dark:text-zinc-400 font-medium py-1 px-1 text-center">
                        <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{language === 'en' ? 'Doorstep Inspection' : 'ደጃፍ ላይ ፈትሾ መረከብ'}</span>
                        </span>
                        <span className="text-gray-300 dark:text-zinc-700 font-bold">•</span>
                        <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                          <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{language === 'en' ? 'Store Warranty' : 'የሱቅ ዋስትና'}</span>
                        </span>
                        <span className="text-gray-300 dark:text-zinc-700 font-bold">•</span>
                        <span className="font-semibold text-gray-700 dark:text-zinc-300">
                          telebirr / CBE Birr / Chapa / VISA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FREQUENTLY BOUGHT TOGETHER BUNDLE SYSTEM */}
                  {fbtProducts.length > 0 && (
                    <div className="col-span-full p-4 sm:p-6 md:p-8 bg-amber-500/[0.015] dark:bg-amber-500/[0.005] border-t border-gray-150 dark:border-zinc-800 transition-all">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2 text-left">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                        <span>{language === 'en' ? 'Frequently Bought Together' : 'ብዙ ጊዜ አብረው የሚገዙ ምርቶች'}</span>
                        <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded-full ml-1.5 shrink-0">
                          {language === 'en' ? 'Bundle Discount Active' : 'የጥቅል ቅናሽ አለ'}
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        <div className={`col-span-full lg:col-span-8 grid ${1 + fbtProducts.length >= 4
                          ? 'grid-cols-3 sm:grid-cols-4'
                          : 'grid-cols-3 sm:grid-cols-3'
                          } gap-1.5 sm:gap-4 items-stretch`}>
                          <div className="h-full flex flex-col justify-between p-2 sm:p-4 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-amber-500/40 shadow-2xs hover:shadow-xs transition-all min-w-0">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-3">
                                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg truncate">
                                  {language === 'en' ? 'This Item' : 'ይህ ምርት'}
                                </span>
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                              </div>
                              <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 mb-1.5 sm:mb-3">
                                <img
                                  src={selectedProduct.image}
                                  alt={selectedProduct.nameEn}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </div>
                            <div className="text-left space-y-0.5 sm:space-y-1 min-w-0">
                              <p className="font-extrabold text-[10px] sm:text-xs text-gray-900 dark:text-white line-clamp-1 truncate leading-tight">
                                {language === 'en' ? selectedProduct.nameEn : selectedProduct.nameAm}
                              </p>
                              <p className="font-mono text-[11px] sm:text-sm font-black text-gray-950 dark:text-white pt-0.5 sm:pt-1 truncate">
                                {selectedProduct.price.toLocaleString()} ETB
                              </p>
                            </div>
                          </div>

                          {fbtProducts.map((p) => {
                            const isChecked = fbtSelectedIds.includes(p.id);
                            return (
                              <div
                                key={`fbt-chain-${p.id}`}
                                onClick={() => {
                                  if (isChecked) {
                                    setFbtSelectedIds(fbtSelectedIds.filter(id => id !== p.id));
                                  } else {
                                    setFbtSelectedIds([...fbtSelectedIds, p.id]);
                                  }
                                }}
                                className={`group h-full flex flex-col justify-between p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer shadow-2xs min-w-0 ${isChecked
                                  ? 'bg-white dark:bg-zinc-900 border-amber-500/40 ring-1 ring-amber-500/20'
                                  : 'bg-gray-50/80 dark:bg-zinc-950/40 border-gray-200/80 dark:border-zinc-800 opacity-60 hover:opacity-100'
                                  }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-3">
                                    <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                      <div className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded sm:rounded-md border flex items-center justify-center shrink-0 transition-all ${isChecked
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-2xs'
                                        : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                        }`}>
                                        {isChecked && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                                      </div>
                                      <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider truncate ${isChecked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-400'}`}>
                                        {isChecked ? (language === 'en' ? 'INCLUDED' : 'ተካቷል') : (language === 'en' ? 'ADD ITEM' : 'ጨምር')}
                                      </span>
                                    </div>
                                    <span className="text-amber-500 font-black text-xs sm:text-sm shrink-0">+</span>
                                  </div>

                                  <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 mb-1.5 sm:mb-3">
                                    <img
                                      src={p.image}
                                      alt={p.nameEn}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                </div>

                                <div className="text-left space-y-0.5 sm:space-y-1 min-w-0">
                                  <div className="flex items-center gap-1 overflow-hidden">
                                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded truncate">
                                      {categories.find(c => c.id === p.category)?.nameEn || p.category}
                                    </span>
                                  </div>
                                  <p className="font-extrabold text-[10px] sm:text-xs text-gray-900 dark:text-white line-clamp-1 truncate leading-tight">
                                    {language === 'en' ? p.nameEn : p.nameAm}
                                  </p>
                                  <p className="font-mono text-[11px] sm:text-sm font-black text-gray-950 dark:text-white pt-0.5 sm:pt-1 truncate">
                                    {p.price.toLocaleString()} ETB
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {(() => {
                          let normalSum = selectedProduct.price;
                          const itemsList: { product: Product; price: number }[] = [{ product: selectedProduct, price: selectedProduct.price }];

                          fbtProducts.forEach(p => {
                            if (fbtSelectedIds.includes(p.id)) {
                              normalSum += p.price;
                              itemsList.push({ product: p, price: p.price });
                            }
                          });

                          const checkedCount = itemsList.length;
                          const discountPct = checkedCount === 3 ? 15 : checkedCount === 2 ? 10 : 0;
                          const savingsAmount = Math.round(normalSum * (discountPct / 100));
                          const discountedBundlePrice = normalSum - savingsAmount;

                          const finalItemsWithSaving = itemsList.map(item => ({
                            product: item.product,
                            price: Math.round(item.price * (1 - discountPct / 100))
                          }));

                          return (
                            <div className="col-span-full lg:col-span-4 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-2xs h-full">
                              <div className="text-left space-y-3">
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0052FF] bg-blue-50 dark:bg-zinc-800 px-2.5 py-1 rounded-md w-fit block">
                                  {language === 'en' ? 'Bundle Summary' : 'የጥቅል መግለጫ'}
                                </span>

                                <div className="pt-2 flex justify-between items-baseline gap-2">
                                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                                    {language === 'en' ? `Total (${checkedCount} items)` : `ድምር (${checkedCount} እቃዎች)`}
                                  </span>
                                  <div className="text-right shrink-0 whitespace-nowrap">
                                    {discountPct > 0 && (
                                      <span className="text-xs font-bold text-gray-400 font-mono line-through block whitespace-nowrap">
                                        {normalSum.toLocaleString()} ETB
                                      </span>
                                    )}
                                    <div className="flex items-baseline gap-1 justify-end whitespace-nowrap">
                                      <span className="text-xl sm:text-2xl font-black font-mono text-gray-950 dark:text-white">
                                        {discountedBundlePrice.toLocaleString()}
                                      </span>
                                      <span className="text-xs font-mono font-black text-[#0052FF] dark:text-blue-400 uppercase">
                                        ETB
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {discountPct > 0 && (
                                  <div className="pt-1 flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">
                                    <span>{language === 'en' ? 'Bundle Savings' : 'የጥቅል ቁጠባ'}:</span>
                                    <span className="bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 font-bold font-mono text-xs whitespace-nowrap">
                                      {savingsAmount.toLocaleString()} ETB ({discountPct}%)
                                    </span>
                                  </div>
                                )}
                              </div>

                              <button
                                disabled={checkedCount === 0}
                                onClick={() => addBundleToCart(finalItemsWithSaving)}
                                className={`w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md whitespace-nowrap active:scale-[0.98] ${checkedCount === 0
                                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed border border-gray-200 dark:border-zinc-800'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                                  }`}
                              >
                                <ShoppingCart className="w-4 h-4 shrink-0" />
                                <span className="truncate">
                                  {language === 'en'
                                    ? `Add All ${checkedCount} to Cart`
                                    : `ሁሉንም ${checkedCount} ጋሪ ውስጥ አስገባ`}
                                </span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Reviews & Ratings Section */}
                  <div id="reviews-section" className="col-span-full p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-zinc-950/40 border-t border-gray-150 dark:border-zinc-800 transition-all">
                    <h4 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white mb-6 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-kasma-blue" />
                      {language === 'en' ? 'Ratings & Reviews' : 'ደረጃዎች እና ግምገማዎች'}
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="col-span-full lg:col-span-7 space-y-6">
                        {(() => {
                          const { avg, count } = getProductRatingInfo(selectedProduct);
                          if (count === 0) {
                            return (
                              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-150 dark:border-zinc-800 text-center text-gray-500 dark:text-zinc-400">
                                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-zinc-700 mx-auto mb-2" />
                                <p className="font-extrabold text-xs">
                                  {language === 'en' ? 'No reviews yet' : 'እስካሁን ምንም ግምገማዎች የሉም'}
                                </p>
                                <p className="text-[11px] mt-1 text-gray-400">
                                  {language === 'en'
                                    ? 'Be the first to review this product after your purchase!'
                                    : 'ይህን ምርት ከገዙ በኋላ የመጀመሪያው ግምገማ ሰጪ ይሁኑ!'}
                                </p>
                              </div>
                            );
                          }

                          const distribution = [0, 0, 0, 0, 0];
                          selectedProduct.reviews?.forEach(r => {
                            if (r.rating >= 1 && r.rating <= 5) {
                              distribution[r.rating - 1]++;
                            }
                          });

                          return (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-150 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                              <div className="col-span-full sm:col-span-4 text-center sm:border-r border-gray-150 dark:border-zinc-800 sm:pr-6">
                                <p className="text-4xl font-black text-gray-950 dark:text-white font-mono">{avg}</p>
                                <div className="flex justify-center text-amber-500 my-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${s <= Math.round(avg) ? 'fill-amber-500 text-amber-500' : 'text-gray-205 dark:text-zinc-850'}`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                                  {count} {count === 1 ? 'Review' : 'Reviews'}
                                </p>
                              </div>
                              <div className="col-span-full sm:col-span-8 space-y-1.5">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                  const countForStar = distribution[stars - 1];
                                  const percentage = count > 0 ? (countForStar / count) * 100 : 0;
                                  return (
                                    <div key={stars} className="flex items-center gap-3 text-xs">
                                      <span className="w-3 text-right font-bold text-gray-600 dark:text-zinc-400 font-mono">{stars}</span>
                                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                      <div className="flex-grow bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                                      </div>
                                      <span className="w-8 text-right text-gray-400 font-mono text-[11px]">{countForStar}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
                          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                            {selectedProduct.reviews.map((rev) => (
                              <div
                                key={rev.id}
                                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-150 dark:border-zinc-800 space-y-2.5 transition-all shadow-2xs hover:shadow-xs"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-extrabold text-xs text-gray-950 dark:text-white">{rev.reviewerName}</p>
                                      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Check className="w-2.5 h-2.5" /> Verified Purchase
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-0.5">
                                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex text-amber-500 shrink-0">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200 dark:text-zinc-800'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 dark:text-zinc-300 text-xs leading-relaxed italic">
                                  "{rev.comment}"
                                </p>
                                {rev.photos && rev.photos.length > 0 && (
                                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    {rev.photos.map((photoUrl, pIdx) => (
                                      <button
                                        type="button"
                                        key={pIdx}
                                        onClick={() => setActiveReviewPhotoModal(photoUrl)}
                                        className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 hover:scale-105 transition-all shadow-2xs group relative cursor-pointer"
                                        title={language === 'en' ? 'Click to view photo' : 'ፎቶውን ለማየት ጠቅ ያድርጉ'}
                                      >
                                        <img src={photoUrl} alt="Review unboxing photo" className="w-full h-full object-cover" />
                                        <span className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                          🔍
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit Form */}
                      <div className="col-span-full lg:col-span-5 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-150 dark:border-zinc-800 h-fit space-y-4">
                        <div>
                          <h5 className="font-bold text-gray-950 dark:text-white text-sm">
                            {language === 'en' ? 'Write a Review' : 'ግምገማ ይጻፉ'}
                          </h5>
                          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 mb-3.5">
                            {language === 'en'
                              ? 'Share your experience to help other buyers. Verified purchase is required.'
                              : 'ሌሎች ገዢዎችን ለመርዳት የእርስዎን ተሞክሮ ያካፍሉ። የተረጋገጠ ግዢ ያስፈልጋል።'}
                          </p>

                          {(() => {
                            const productOrders = allOrders.filter(order =>
                              order.items.some(item => item.product.id === selectedProduct.id)
                            );
                            if (productOrders.length > 0) {
                              return (
                                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] rounded-2xl flex items-center justify-between gap-2.5 leading-normal">
                                  <span>
                                    {language === 'en'
                                      ? '💡 Demo Tip: Verified orders found for this product!'
                                      : '💡 ዲሞ ጠቃሚ ምክር፡ ለዚህ ምርት የተረጋገጠ ትዕዛዝ ተገኝቷል!'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRevPhone(productOrders[0].customerPhone);
                                      setRevName(productOrders[0].customerName);
                                    }}
                                    className="underline font-black uppercase tracking-wider text-xs hover:text-[#0052FF] dark:hover:text-blue-400 cursor-pointer shrink-0"
                                  >
                                    {language === 'en' ? 'Auto-fill' : 'ሙላ'}
                                  </button>
                                </div>
                              );
                            }
                            return (
                              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] rounded-2xl flex items-center justify-between gap-2.5 leading-normal">
                                <span>
                                  {language === 'en'
                                    ? 'No purchase history found for this product.'
                                    : 'ለዚህ ምርት የግዢ ታሪክ አልተገኘም።'}
                                </span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const mockOrder = {
                                      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
                                      customerId: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
                                      customerName: 'Dawit Abera',
                                      customerPhone: '+251912345678',
                                      items: [{
                                        product: selectedProduct,
                                        sku: selectedProduct.variants[0]?.sku || 'DEFAULT',
                                        variantName: selectedProduct.variants[0]?.name || 'Standard',
                                        quantity: 1,
                                        price: selectedProduct.price
                                      }],
                                      subtotal: selectedProduct.price,
                                      shippingFee: 150,
                                      total: selectedProduct.price + 150,
                                      status: 'DELIVERED',
                                      paymentMethod: 'TELEBIRR',
                                      createdAt: new Date().toISOString(),
                                      channel: 'WEB',
                                      shippingAddress: 'Bole, Addis Ababa'
                                    } as Order;
                                    await onAddOrder(mockOrder);
                                    setRevPhone('+251912345678');
                                    setRevName('Dawit Abera');
                                    showToast(
                                      language === 'en'
                                        ? 'Simulated purchase added! Info auto-filled.'
                                        : 'የተመሰለ ግዢ ተጨምሯል! መረጃው ተሞልቷል።',
                                      'success'
                                    );
                                  }}
                                  className="underline font-black uppercase tracking-wider text-[10px] hover:text-amber-900 dark:hover:text-amber-300 cursor-pointer shrink-0"
                                >
                                  {language === 'en' ? 'Simulate' : 'አስመስል'}
                                </button>
                              </div>
                            );
                          })()}
                        </div>

                        {reviewError && (
                          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-150 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                            <span>⚠️</span>
                            <span className="font-medium leading-relaxed">{reviewError}</span>
                          </div>
                        )}

                        <form onSubmit={(e) => handleReviewSubmit(e, selectedProduct.id)} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 dark:text-zinc-300 block">
                              {language === 'en' ? 'Your Rating' : 'የእርስዎ ደረጃ'}
                            </label>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  type="button"
                                  key={s}
                                  onClick={() => setReviewRating(s)}
                                  className="text-amber-500 hover:scale-110 transition-all p-0.5 cursor-pointer focus:outline-none"
                                >
                                  <Star
                                    className={`w-7 h-7 ${s <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-gray-200 dark:text-zinc-800'}`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 dark:text-zinc-300 block">
                              {language === 'en' ? 'Full Name' : 'ሙሉ ስም'}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={language === 'en' ? 'e.g. Dawit Abera' : 'ለምሳሌ ዳዊት አበራ'}
                              value={revName}
                              onChange={(e) => setRevName(e.target.value)}
                              className="w-full border border-gray-155 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue focus:bg-white dark:focus:bg-zinc-900 transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 dark:text-zinc-300 block">
                              {language === 'en' ? 'Checkout Mobile Phone' : 'ትእዛዝ የፈጸሙበት ስልክ'}
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="+251912345678"
                              value={revPhone}
                              onChange={(e) => setRevPhone(e.target.value)}
                              className="w-full border border-gray-155 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue focus:bg-white dark:focus:bg-zinc-900 transition-all font-mono"
                            />
                            <p className="text-[9px] text-gray-400 leading-normal">
                              {language === 'en'
                                ? 'We verify your purchase history against this phone number.'
                                : 'በዚህ ስልክ ቁጥር መሰረት የገዙበትን ታሪክ እናረጋግጣለን።'}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 dark:text-zinc-300 block">
                              {language === 'en' ? 'Review Comments' : 'የግምገማው ዝርዝር'}
                            </label>
                            <textarea
                              required
                              rows={3}
                              placeholder={language === 'en' ? 'Tell us what you loved or how we can improve...' : 'የወደዱትን ወይም እንድናሻሽል የሚፈልጉትን ይንገሩን...'}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="w-full border border-gray-155 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue focus:bg-white dark:focus:bg-zinc-900 transition-all leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                              <span>{language === 'en' ? 'Attach Unboxing Photo (Optional)' : 'የእቃውን ፎቶ ያያይዙ (አማራጭ)'}</span>
                              <span className="text-gray-400 font-mono text-[9px]">URL link</span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                placeholder="https://images.unsplash.com/..."
                                value={reviewPhotoUrl}
                                onChange={(e) => setReviewPhotoUrl(e.target.value)}
                                className="flex-1 border border-gray-155 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue focus:bg-white dark:focus:bg-zinc-900 transition-all font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setReviewPhotoUrl('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80')}
                                className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-200 cursor-pointer shrink-0"
                              >
                                {language === 'en' ? 'Sample Photo' : 'ናሙና ፎቶ'}
                              </button>
                            </div>
                            {reviewPhotoUrl && (
                              <div className="flex items-center gap-2 pt-1">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-2xs relative shrink-0">
                                  <img src={reviewPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setReviewPhotoUrl('')}
                                    className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                  {language === 'en' ? '✓ Unboxing photo ready' : '✓ ፎቶው ተያይዟል'}
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${isSubmittingReview
                              ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                              : 'bg-kasma-blue hover:bg-blue-600 text-white shadow-sm'
                              }`}
                          >
                            {isSubmittingReview ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>{language === 'en' ? 'Submitting...' : 'እየገባ ነው...'}</span>
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{language === 'en' ? 'Post Review' : 'ግምገማውን ይጻፉ'}</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Community Questions & Answers (Q&A) Section */}
                  <div id="qa-section" className="col-span-full p-4 sm:p-6 md:p-8 bg-white dark:bg-zinc-900 border-t border-gray-150 dark:border-zinc-800 transition-all">
                    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                        <HelpCircle className="w-4.5 h-4.5 text-[#0052FF]" />
                        <span>{language === 'en' ? 'Questions & Answers' : 'ጥያቄዎች እና መልሶች'}</span>
                      </h4>
                      <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700">
                        {((selectedProduct.qaItems || []).length + (localQaMap[selectedProduct.id] || []).length)} {language === 'en' ? 'Answered Questions' : 'የተመለሱ ጥያቄዎች'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="col-span-full lg:col-span-7 space-y-4">
                        {(() => {
                          const allQas = [...(localQaMap[selectedProduct.id] || []), ...(selectedProduct.qaItems || [])];
                          if (allQas.length === 0) {
                            return (
                              <div className="bg-gray-50 dark:bg-zinc-850 rounded-2xl p-6 border border-gray-150 dark:border-zinc-800 text-center text-gray-500 dark:text-zinc-400 space-y-2">
                                <HelpCircle className="w-8 h-8 text-gray-300 dark:text-zinc-700 mx-auto" />
                                <p className="font-bold text-xs">{language === 'en' ? 'Have a question about this item?' : 'ስለዚህ እቃ ጥያቄ አለዎት?'}</p>
                                <p className="text-[11px] text-gray-400">{language === 'en' ? 'Ask other customers and the verified seller below.' : 'ከዚህ በታች ሌሎች ገዢዎችን እና የተረጋገጠውን ሻጭ ይጠይቁ።'}</p>
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                              {allQas.map((qa) => (
                                <div key={qa.id} className="p-4 rounded-2xl bg-gray-50/80 dark:bg-zinc-850/80 border border-gray-200/80 dark:border-zinc-800 space-y-2.5 text-left">
                                  <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-md bg-[#0052FF] text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                                      Q
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug">
                                        {language === 'en' ? qa.questionEn : qa.questionAm}
                                      </p>
                                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-0.5">
                                        {language === 'en' ? `Asked by ${qa.askedBy}` : `የተጠየቀው በ${qa.askedBy}`} • {new Date(qa.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2 pl-3 border-l-2 border-emerald-500 ml-2.5">
                                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                                      A
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
                                        {language === 'en' ? qa.answerEn : qa.answerAm}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                          <Check className="w-3 h-3 text-emerald-500" />
                                          {qa.answeredBy}
                                        </span>
                                        {qa.verifiedAnswer && (
                                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                                            {language === 'en' ? 'Verified Merchant' : 'የተረጋገጠ ነጋዴ'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="col-span-full lg:col-span-5 bg-gray-50/90 dark:bg-zinc-850/90 rounded-3xl p-5 sm:p-6 border border-gray-150 dark:border-zinc-800 h-fit space-y-3.5 text-left">
                        <div>
                          <h5 className="font-bold text-gray-950 dark:text-white text-xs sm:text-sm">
                            {language === 'en' ? 'Ask a Question' : 'ጥያቄ ይጠይቁ'}
                          </h5>
                          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">
                            {language === 'en'
                              ? 'Get fast answers from the verified merchant and our technical team.'
                              : 'ከተረጋገጠው ነጋዴ እና ከቴክኒክ ቡድናችን ፈጣን መልስ ያግኙ።'}
                          </p>
                        </div>

                        <form onSubmit={(e) => handleQuestionSubmit(e, selectedProduct.id)} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-zinc-300 block">
                              {language === 'en' ? 'Your Name' : 'የእርስዎ ስም'}
                            </label>
                            <input
                              type="text"
                              placeholder={language === 'en' ? 'e.g. Henok T.' : 'ለምሳሌ ሄኖክ ተ.'}
                              value={newQuestionAskedBy}
                              onChange={(e) => setNewQuestionAskedBy(e.target.value)}
                              className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl px-3.5 py-2 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-zinc-300 block">
                              {language === 'en' ? 'Question' : 'ጥያቄዎ'}
                            </label>
                            <textarea
                              required
                              rows={3}
                              placeholder={language === 'en' ? 'Is this device compatible with Telebirr eSIM or standard nano-SIM?' : 'ይህ ስልክ ከቴሌብር ኢሲም ወይም ከተለመደው ሲም ካርድ ጋር ይሰራል?'}
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              className="w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl px-3.5 py-2 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue leading-relaxed"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-[#0052FF] dark:hover:bg-[#0052FF] dark:hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{language === 'en' ? 'Submit Question' : 'ጥያቄውን ላክ'}</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Customer Unboxing Photo Lightbox Modal */}
      {activeReviewPhotoModal && (
        <div
          onClick={() => setActiveReviewPhotoModal(null)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#0052FF]" />
                {language === 'en' ? 'Verified Buyer Unboxing Photo' : 'የተረጋገጠ ገዢ የተነሳው ፎቶ'}
              </span>
              <button
                onClick={() => setActiveReviewPhotoModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center hover:bg-gray-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center bg-black/5 dark:bg-black/40 p-2">
              <img
                src={activeReviewPhotoModal}
                alt="Customer unboxing photo"
                className="max-h-[65vh] max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

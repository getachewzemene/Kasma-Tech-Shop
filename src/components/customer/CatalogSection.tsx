import React from 'react';
import {
  Truck, SlidersHorizontal, ChevronDown, X, Trash2, Search, RotateCcw, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Variant } from '../../types';
import { PriceRangeSlider } from '../catalog/PriceRangeSlider';
import { ProductCardSkeleton } from '../Skeletons';
import { GridContainer } from '../GridContainer';
import { ProductCard } from '../ProductCard';

interface CategoryItem {
  id: string;
  nameEn: string;
  nameAm: string;
}

interface CatalogSectionProps {
  language: 'en' | 'am';
  isCustomerLoggedIn: boolean;
  onOpenOrderStatus: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: CategoryItem[];
  sortedAndFilteredProducts: Product[];
  paginatedProducts: Product[];
  approvedProducts: Product[];
  isAdvancedFilterOpen: boolean;
  setIsAdvancedFilterOpen: (open: boolean) => void;
  setFilterSectionFocus: (focus: 'all' | 'brand' | 'price' | 'rating' | 'availability' | 'features') => void;
  activeFiltersCount: number;
  sortBy: 'default' | 'priceAsc' | 'priceDesc' | 'newest';
  setSortBy: (sort: 'default' | 'priceAsc' | 'priceDesc' | 'newest') => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  availableBrands: string[];
  minPriceInput: string;
  setMinPriceInput: (val: string) => void;
  maxPriceInput: string;
  setMaxPriceInput: (val: string) => void;
  maxProductPriceInCatalog: number;
  selectedRatingFilter: number;
  setSelectedRatingFilter: (rating: number) => void;
  availabilityFilter: 'ALL' | 'IN_STOCK' | 'ON_SALE';
  setAvailabilityFilter: (avail: 'ALL' | 'IN_STOCK' | 'ON_SALE') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleClearAllFilters: () => void;
  isGridLoading: boolean;
  isLoadingMore: boolean;
  visibleProductCount: number;
  scrollSentinelRef: React.RefObject<HTMLDivElement | null>;
  favorites: string[];
  comparedProductIds: string[];
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onToggleCompare: (id: string, e?: React.MouseEvent) => void;
  onOpenQuickBuy: (product: Product) => void;
  onAddToCart: (product: Product, variant: Variant, quantity?: number) => void;
  onInstantBuy: (product: Product, variant: Variant, quantity?: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  language,
  isCustomerLoggedIn,
  onOpenOrderStatus,
  selectedCategory,
  setSelectedCategory,
  categories,
  sortedAndFilteredProducts,
  paginatedProducts,
  approvedProducts,
  isAdvancedFilterOpen,
  setIsAdvancedFilterOpen,
  setFilterSectionFocus,
  activeFiltersCount,
  sortBy,
  setSortBy,
  selectedBrands,
  setSelectedBrands,
  availableBrands,
  minPriceInput,
  setMinPriceInput,
  maxPriceInput,
  setMaxPriceInput,
  maxProductPriceInCatalog,
  selectedRatingFilter,
  setSelectedRatingFilter,
  availabilityFilter,
  setAvailabilityFilter,
  searchQuery,
  setSearchQuery,
  handleClearAllFilters,
  isGridLoading,
  isLoadingMore,
  visibleProductCount,
  scrollSentinelRef,
  favorites,
  comparedProductIds,
  onToggleFavorite,
  onToggleCompare,
  onOpenQuickBuy,
  onAddToCart,
  onInstantBuy,
  showToast
}) => {
  return (
    <div id="products-grid-section" className="max-w-[1440px] mx-auto w-full px-2.5 xs:px-3 sm:px-6 lg:px-8 mt-12 lg:mt-16 pb-12 lg:pb-16 space-y-6">
      {/* Category Header with Track shipment */}
      <div className="flex justify-between items-center pb-1">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-5 lg:w-2.5 lg:h-6 bg-[#0052FF] rounded-full" />
          <h3 className="text-sm sm:text-base lg:text-lg font-black text-gray-900 dark:text-zinc-100 font-sans">
            {language === 'en' ? 'Explore' : 'ምድቦች'}
          </h3>
        </div>

        {isCustomerLoggedIn && (
          <button
            onClick={onOpenOrderStatus}
            className="flex items-center gap-2 px-3.5 py-2 sm:px-4.5 sm:py-2.5 bg-[#0052FF] text-white hover:bg-blue-700 font-bold text-xs sm:text-sm rounded-xl lg:rounded-2xl transition-all shadow-xs cursor-pointer"
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>{language === 'en' ? 'Track Shipment' : 'ጭነት ይከታተሉ'}</span>
          </button>
        )}
      </div>

      {/* Sticky Product Control Bar */}
      <div className="sticky top-[56px] sm:top-[68px] lg:top-[74px] z-30 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md p-2.5 xs:p-3 sm:p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all space-y-2 sm:space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          {/* Left: Breadcrumb (hidden on mobile), Category Title & Product Count */}
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-zinc-500">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="hover:text-[#0052FF] transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Catalog' : 'ካታሎግ'}
              </button>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-extrabold truncate max-w-[200px]">
                {selectedCategory === 'all'
                  ? (language === 'en' ? 'All Products' : 'ሁሉም ምርቶች')
                  : selectedCategory === 'deals'
                    ? (language === 'en' ? 'Flash Deals' : 'ልዩ ቅናሾች')
                    : (language === 'en'
                      ? (categories.find(c => c.id === selectedCategory)?.nameEn || selectedCategory)
                      : (categories.find(c => c.id === selectedCategory)?.nameAm || selectedCategory))}
              </span>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight font-sans leading-tight truncate">
                {selectedCategory === 'all'
                  ? (language === 'en' ? 'All Tech Products' : 'ሁሉም ምርቶች')
                  : selectedCategory === 'deals'
                    ? (language === 'en' ? '⚡ Flash Deals' : '⚡ ልዩ ቅናሾች')
                    : (language === 'en'
                      ? (categories.find(c => c.id === selectedCategory)?.nameEn || selectedCategory)
                      : (categories.find(c => c.id === selectedCategory)?.nameAm || selectedCategory))}
              </h2>
              <span className="text-[11px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 shrink-0">
                {language === 'en'
                  ? `${sortedAndFilteredProducts.length} ${sortedAndFilteredProducts.length === 1 ? 'item' : 'items'}`
                  : `${sortedAndFilteredProducts.length} እቃዎች`}
              </span>
            </div>
          </div>

          {/* Right: Action Buttons - [ Filter ] & [ Sort ] */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setFilterSectionFocus('all');
                setIsAdvancedFilterOpen(true);
              }}
              className={`flex-1 sm:flex-initial justify-center h-8.5 xs:h-9 sm:h-11 px-3 sm:px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border flex items-center gap-2 shadow-2xs ${activeFiltersCount > 0
                ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-xs shadow-[#0052FF]/20'
                : 'bg-gray-100/90 dark:bg-zinc-800/90 text-gray-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 shrink-0" />
              <span>{language === 'en' ? 'Filter' : 'ማጣሪያ'}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-[#0052FF] font-mono text-[11px] sm:text-xs px-1.5 py-0.2 rounded-full font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto h-8.5 xs:h-9 sm:h-11 appearance-none bg-gray-100/90 dark:bg-zinc-800/90 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 rounded-xl sm:rounded-2xl pl-3 pr-7 sm:pl-4 sm:pr-9 text-xs sm:text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0052FF]/30 transition-all text-left truncate"
              >
                <option value="default">{language === 'en' ? 'Popular' : 'በተወዳጅነት'}</option>
                <option value="priceAsc">{language === 'en' ? 'Price: Low → High' : 'ዋጋ፡ ዝቅተኛ'}</option>
                <option value="priceDesc">{language === 'en' ? 'Price: High → Low' : 'ዋጋ፡ ከፍተኛ'}</option>
                <option value="newest">{language === 'en' ? 'Newest' : 'አዲስ የገቡ'}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Horizontal Filter Chips Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scroll-smooth touch-pan-x py-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => { setFilterSectionFocus('brand'); setIsAdvancedFilterOpen(true); }}
            className={`h-7.5 xs:h-8 sm:h-9 px-2.5 xs:px-3 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 active:scale-95 ${selectedBrands.length > 0
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 border-blue-200 dark:border-blue-900/60 font-bold shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 border-gray-250 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
          >
            <span>{selectedBrands.length > 0 ? `Brand (${selectedBrands.length})` : (language === 'en' ? 'Brand' : 'ብራንድ')}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setFilterSectionFocus('price'); setIsAdvancedFilterOpen(true); }}
            className={`h-7.5 xs:h-8 sm:h-9 px-2.5 xs:px-3 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 active:scale-95 ${minPriceInput !== '' || maxPriceInput !== ''
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 border-blue-200 dark:border-blue-900/60 font-bold shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 border-gray-250 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
          >
            <span>
              {minPriceInput !== '' || maxPriceInput !== ''
                ? `Price (${minPriceInput || '0'}-${maxPriceInput || '∞'})`
                : (language === 'en' ? 'Price' : 'ዋጋ')}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setFilterSectionFocus('rating'); setIsAdvancedFilterOpen(true); }}
            className={`h-7.5 xs:h-8 sm:h-9 px-2.5 xs:px-3 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 active:scale-95 ${selectedRatingFilter > 0
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 font-bold shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 border-gray-250 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
          >
            <span>{selectedRatingFilter > 0 ? `Rating (${selectedRatingFilter}★+)` : (language === 'en' ? 'Rating' : 'ደረጃ')}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setFilterSectionFocus('availability'); setIsAdvancedFilterOpen(true); }}
            className={`h-7.5 xs:h-8 sm:h-9 px-2.5 xs:px-3 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 active:scale-95 ${availabilityFilter !== 'ALL'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 font-bold shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 border-gray-250 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
          >
            <span>
              {availabilityFilter === 'IN_STOCK' ? (language === 'en' ? 'In Stock' : 'ያለ') : availabilityFilter === 'ON_SALE' ? (language === 'en' ? 'On Sale' : 'ቅናሽ') : '4★+ Rated'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => { setFilterSectionFocus('features'); setIsAdvancedFilterOpen(true); }}
            className="h-7.5 xs:h-8 sm:h-9 px-2.5 xs:px-3 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 border-gray-250 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95"
          >
            <span>{language === 'en' ? 'Features' : 'ባህሪያት'}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>
        </div>

        {/* Active Refinements Badges */}
        {(selectedCategory !== 'all' || searchQuery.trim() !== '' || minPriceInput !== '' || maxPriceInput !== '' || selectedBrands.length > 0 || availabilityFilter !== 'ALL' || selectedRatingFilter > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-slate-150 dark:border-slate-800/80">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-400 dark:text-zinc-500">
              {language === 'en' ? 'Active:' : 'የተመረጡ፡'}
            </span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs">
                <span>{categories.find(c => c.id === selectedCategory)?.nameEn || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-red-500 cursor-pointer p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  title={language === 'en' ? 'Clear category' : 'ምድብ አጽዳ'}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 shadow-2xs">
                <span>"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-500 cursor-pointer p-0.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(minPriceInput !== '' || maxPriceInput !== '') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs font-mono">
                <span>ETB {minPriceInput || '0'} - {maxPriceInput || '∞'}</span>
                <button
                  type="button"
                  onClick={() => { setMinPriceInput(''); setMaxPriceInput(''); }}
                  className="hover:text-red-500 cursor-pointer p-0.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBrands.map(b => (
              <span key={`active-b-${b}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 shadow-2xs">
                <span>{b}</span>
                <button
                  type="button"
                  onClick={() => setSelectedBrands(selectedBrands.filter(brand => brand !== b))}
                  className="hover:text-red-500 cursor-pointer p-0.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/40"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {availabilityFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
                <span>{availabilityFilter === 'IN_STOCK' ? (language === 'en' ? 'In Stock' : 'ያለ') : availabilityFilter === 'ON_SALE' ? (language === 'en' ? 'On Sale' : 'ቅናሽ') : '4★+ Rated'}</span>
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('ALL')}
                  className="hover:text-red-500 cursor-pointer p-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedRatingFilter > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
                <span>{selectedRatingFilter}★+</span>
                <button
                  type="button"
                  onClick={() => setSelectedRatingFilter(0)}
                  className="hover:text-red-500 cursor-pointer p-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline cursor-pointer ml-auto px-2 py-0.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all shadow-2xs shrink-0"
            >
              <Trash2 className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{language === 'en' ? 'Clear all' : 'ሁሉንም አጽዳ'}</span>
            </button>
          </div>
        )}
      </div>

      {/* FILTER Bottom Sheet Overlay Modal */}
      <AnimatePresence>
        {isAdvancedFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdvancedFilterOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[82vh] border border-gray-150 dark:border-zinc-800"
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

              <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-gray-150 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4.5 h-4.5 text-[#0052FF]" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-sans">
                    {language === 'en' ? 'Filters' : 'ማጣሪያ'}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearAllFilters}
                      className="text-xs sm:text-sm font-extrabold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      {language === 'en' ? 'Clear' : 'አጽዳ'}
                    </button>
                  )}
                  <button
                    onClick={() => setIsAdvancedFilterOpen(false)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar divide-y divide-gray-100 dark:divide-zinc-800">
                {/* 1. BRAND SECTION */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100">
                      {language === 'en' ? 'Brand' : 'ብራንድ'}
                    </span>
                    {selectedBrands.length > 0 && (
                      <button
                        onClick={() => setSelectedBrands([])}
                        className="text-xs text-[#0052FF] font-bold hover:underline cursor-pointer"
                      >
                        {language === 'en' ? 'Reset' : 'ቦረሽ'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {availableBrands.map((brand) => {
                      const isSelected = selectedBrands.includes(brand);
                      const count = approvedProducts.filter(p => p.brand === brand).length;
                      return (
                        <label
                          key={`sheet-brand-${brand}`}
                          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/50 border-[#0052FF] text-gray-900 dark:text-white font-black shadow-xs'
                            : 'bg-gray-50/50 dark:bg-zinc-850/50 border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                } else {
                                  setSelectedBrands([...selectedBrands, brand]);
                                }
                              }}
                              className="w-4.5 h-4.5 rounded text-[#0052FF] focus:ring-[#0052FF] border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs sm:text-sm font-bold">{brand}</span>
                          </div>
                          <span className="text-xs font-mono text-gray-400 font-bold">
                            ({count})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. PRICE SECTION */}
                <div className="space-y-3 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100">
                      {language === 'en' ? 'Price Range' : 'የዋጋ ክልል'}
                    </span>
                    {(minPriceInput !== '' || maxPriceInput !== '') && (
                      <button
                        type="button"
                        onClick={() => {
                          setMinPriceInput('');
                          setMaxPriceInput('');
                        }}
                        className="text-xs text-[#0052FF] font-bold hover:underline cursor-pointer"
                      >
                        {language === 'en' ? 'Reset' : 'ቦረሽ'}
                      </button>
                    )}
                  </div>

                  <PriceRangeSlider
                    min={0}
                    max={maxProductPriceInCatalog}
                    valueMin={minPriceInput ? Number(minPriceInput) : 0}
                    valueMax={maxPriceInput ? Number(maxPriceInput) : maxProductPriceInCatalog}
                    onChange={(newMin, newMax) => {
                      setMinPriceInput(newMin > 0 ? String(newMin) : '');
                      setMaxPriceInput(newMax < maxProductPriceInCatalog ? String(newMax) : '');
                    }}
                    language={language}
                  />
                </div>

                {/* 3. RATING SECTION */}
                <div className="space-y-3 pt-5">
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Rating' : 'ደረጃ'}
                  </span>

                  <div className="space-y-2">
                    {[
                      { label: 'All Ratings', value: 0 },
                      { label: '4★+', value: 4 },
                      { label: '3★+', value: 3 },
                    ].map((rOpt) => {
                      const isSelected = selectedRatingFilter === rOpt.value;
                      return (
                        <label
                          key={`sheet-rating-${rOpt.value}`}
                          className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${isSelected
                            ? 'bg-amber-50/70 dark:bg-amber-950/50 border-amber-500 text-gray-900 dark:text-white font-black shadow-xs'
                            : 'bg-gray-50/50 dark:bg-zinc-850/50 border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                          <input
                            type="radio"
                            name="sheet-rating-opt"
                            checked={isSelected}
                            onChange={() => setSelectedRatingFilter(rOpt.value)}
                            className="w-4.5 h-4.5 text-amber-500 focus:ring-amber-500 border-gray-300 cursor-pointer"
                          />
                          <span className="text-xs sm:text-sm font-bold">{rOpt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 4. AVAILABILITY SECTION */}
                <div className="space-y-3 pt-5">
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Availability' : 'አቅርቦት'}
                  </span>

                  <div className="space-y-2">
                    {[
                      { id: 'ALL', label: 'All Items' },
                      { id: 'IN_STOCK', label: 'In Stock Only' },
                      { id: 'ON_SALE', label: 'On Sale & Featured' },
                    ].map((aOpt) => {
                      const isSelected = availabilityFilter === aOpt.id;
                      return (
                        <label
                          key={`sheet-avail-${aOpt.id}`}
                          className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${isSelected
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-500 text-gray-900 dark:text-white font-black shadow-xs'
                            : 'bg-gray-50/50 dark:bg-zinc-850/50 border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                          <input
                            type="radio"
                            name="sheet-avail-opt"
                            checked={isSelected}
                            onChange={() => setAvailabilityFilter(aOpt.id as any)}
                            className="w-4.5 h-4.5 text-emerald-500 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                          />
                          <span className="text-xs sm:text-sm font-bold">{aOpt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-gray-50 dark:bg-zinc-950 border-t border-gray-150 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={handleClearAllFilters}
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Clear' : 'አጽዳ'}
                </button>

                <button
                  onClick={() => setIsAdvancedFilterOpen(false)}
                  className="flex-1 py-3 px-5 bg-[#0052FF] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md shadow-[#0052FF]/20 text-center cursor-pointer"
                >
                  {language === 'en'
                    ? `Show ${sortedAndFilteredProducts.length} products`
                    : `${sortedAndFilteredProducts.length} ምርቶችን አሳያቸው`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Grid Section */}
      <div id="products-catalog-grid" className="w-full mt-3 sm:mt-6">
        {isGridLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={`grid-skeleton-${i}`} />
            ))}
          </div>
        ) : sortedAndFilteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 sm:p-16 text-center border border-gray-150 dark:border-zinc-800 shadow-xs space-y-4">
            <Search className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto" />
            <div className="space-y-1">
              <p className="text-gray-950 dark:text-white font-extrabold text-base sm:text-lg">
                {language === 'en' ? 'No items matched your filters' : 'በተመረጡት ማጣሪያዎች ምንም ምርት አልተገኘም'}
              </p>
              <p className="text-gray-400 dark:text-zinc-500 text-xs sm:text-sm max-w-md mx-auto">
                {language === 'en'
                  ? 'Try broadening your search term, clearing brand or price restrictions, or resetting filters.'
                  : 'እባክዎን የፍለጋ ቃላትን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ።'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0052FF] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-blue-600 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'en' ? 'Reset All Filters' : 'ሁሉንም ማጣሪያዎች አጽዳ'}</span>
            </button>
          </div>
        ) : (
          <>
            <GridContainer cols="auto-fill" gap="normal">
              {paginatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  language={language}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={onToggleFavorite}
                  isCompared={comparedProductIds.includes(p.id)}
                  onToggleCompare={onToggleCompare}
                  onOpenProduct={onOpenQuickBuy}
                  onQuickView={onOpenQuickBuy}
                  onAddToCart={onAddToCart}
                  onInstantBuy={onInstantBuy}
                  showToast={showToast}
                  badgeColor="indigo"
                  highlightSearchQuery={searchQuery}
                  layout="grid"
                />
              ))}
              {isLoadingMore && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={`loading-more-${i}`} />
                  ))}
                </>
              )}
            </GridContainer>

            {visibleProductCount < sortedAndFilteredProducts.length && (
              <div ref={scrollSentinelRef} className="w-full py-6 flex justify-center items-center">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0052FF]" />
                    <span>{language === 'en' ? 'Loading more products...' : 'ተጨማሪ ምርቶችን በመጫን ላይ...'}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

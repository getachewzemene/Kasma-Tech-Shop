import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  User,
  X,
  Sparkles,
  Smartphone,
  Laptop,
  Gamepad2,
  Watch,
  Headphones,
  Tv,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenProfile: () => void;
  onOpenOrders?: () => void;
  isProfileOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenProfile,
  isProfileOpen = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    language,
    cartCount,
    isCustomerLoggedIn,
    selectedCategory,
    setSelectedCategory,
    categories,
    products,
    setIsCartOpen
  } = useShop();

  const [isCategoriesSheetOpen, setIsCategoriesSheetOpen] = useState(false);

  const isHomeActive = location.pathname === '/' && selectedCategory === 'all' && !isProfileOpen && !isCategoriesSheetOpen;
  const isCategoriesActive = (isCategoriesSheetOpen || (selectedCategory !== 'all' && selectedCategory !== 'deals')) && location.pathname === '/' && !isProfileOpen;
  const isCartActive = location.pathname === '/cart' && !isProfileOpen;

  const handleHomeClick = () => {
    setIsCategoriesSheetOpen(false);
    setSelectedCategory('all');
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoriesClick = () => {
    setIsCategoriesSheetOpen((prev) => !prev);
  };

  const handleSearchClick = () => {
    setIsCategoriesSheetOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const searchInput = (document.getElementById('mobile-search-input') || document.querySelector('input[type="text"]')) as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
      }
    }, 150);
  };

  const handleCartClick = () => {
    setIsCategoriesSheetOpen(false);
    if (location.pathname === '/') {
      setIsCartOpen(true);
    } else {
      navigate('/cart');
    }
  };

  const handleAccountClick = () => {
    setIsCategoriesSheetOpen(false);
    onOpenProfile();
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setIsCategoriesSheetOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const el = document.getElementById('products-grid-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'phones': return Smartphone;
      case 'laptops': return Laptop;
      case 'gaming': return Gamepad2;
      case 'wearables': return Watch;
      case 'audio': return Headphones;
      case 'tv_monitors': return Tv;
      case 'accessories': return Cpu;
      default: return Layers;
    }
  };

  return (
    <>
      {/* Category Bottom Sheet Modal for Mobile */}
      {isCategoriesSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsCategoriesSheetOpen(false)}
          />

          <div className="relative z-10 w-full bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-gray-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-5 max-h-[82vh] overflow-y-auto pb-24 space-y-4">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-150 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#0052FF]" />
                <h3 className="text-base font-black text-gray-950 dark:text-white">
                  {language === 'en' ? 'Shop by Category' : 'በምድብ ይፈልጉ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoriesSheetOpen(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 cursor-pointer active:scale-95"
                aria-label="Close categories sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories List */}
            <div className="space-y-1.5 pt-1">
              {/* All Products Option */}
              <button
                type="button"
                onClick={() => handleSelectCategory('all')}
                className={`w-full min-h-[48px] h-12 px-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border active:scale-98 ${
                  selectedCategory === 'all'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0052FF] dark:text-blue-400 border-blue-200 dark:border-blue-900/60 font-black shadow-2xs'
                    : 'bg-gray-50/70 dark:bg-zinc-850/60 text-gray-800 dark:text-zinc-200 border-gray-200/60 dark:border-zinc-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">{language === 'en' ? 'All Products' : 'ሁሉም ምርቶች'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-gray-200/60 dark:border-zinc-700">
                    {products.length}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>

              {/* Dynamic Catalog Categories */}
              {categories.map((cat) => {
                const CatIcon = getCategoryIcon(cat.id);
                const isSelected = selectedCategory === cat.id;
                const catCount = products.filter(p => p.category === cat.id).length;

                return (
                  <button
                    key={`sheet-cat-${cat.id}`}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full min-h-[48px] h-12 px-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border active:scale-98 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0052FF] dark:text-blue-400 border-blue-200 dark:border-blue-900/60 font-black shadow-2xs'
                        : 'bg-gray-50/70 dark:bg-zinc-850/60 text-gray-800 dark:text-zinc-200 border-gray-200/60 dark:border-zinc-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#0052FF] text-white' : 'bg-gray-200/70 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                      }`}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">{language === 'en' ? cat.nameEn : cat.nameAm}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-gray-200/60 dark:border-zinc-700">
                        {catCount}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global Bottom Navigation Bar (Home, Categories, Search, Cart, Account) */}
      <nav
        id="global-mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 py-1 flex items-center justify-around select-none min-h-[56px]"
        style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
        aria-label="Mobile Navigation"
      >
        {/* 1. HOME TAB */}
        <button
          type="button"
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[48px] h-12 flex-1 relative active:scale-95 ${
            isHomeActive
              ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
          }`}
          aria-label={language === 'en' ? 'Home' : 'ዋና ገጽ'}
        >
          <Home className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight leading-none">{language === 'en' ? 'Home' : 'ዋና ገጽ'}</span>
        </button>

        {/* 2. CATEGORIES TAB */}
        <button
          type="button"
          onClick={handleCategoriesClick}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[48px] h-12 flex-1 relative active:scale-95 ${
            isCategoriesActive
              ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
          }`}
          aria-label={language === 'en' ? 'Categories' : 'ምድቦች'}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight leading-none">{language === 'en' ? 'Categories' : 'ምድቦች'}</span>
        </button>

        {/* 3. SEARCH TAB */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[48px] h-12 flex-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium active:scale-95"
          aria-label={language === 'en' ? 'Search' : 'ፈልግ'}
        >
          <Search className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight leading-none">{language === 'en' ? 'Search' : 'ፈልግ'}</span>
        </button>

        {/* 4. CART TAB */}
        <button
          type="button"
          onClick={handleCartClick}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[48px] h-12 flex-1 relative active:scale-95 ${
            isCartActive
              ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
          }`}
          aria-label={language === 'en' ? 'Cart' : 'ጋሪ'}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[9px] font-mono font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white dark:border-zinc-900 animate-bounce">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none">{language === 'en' ? 'Cart' : 'ጋሪ'}</span>
        </button>

        {/* 5. ACCOUNT TAB */}
        <button
          type="button"
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer min-h-[48px] h-12 flex-1 relative active:scale-95 ${
            isProfileOpen
              ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
          }`}
          aria-label={language === 'en' ? 'Account' : 'መለያ'}
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
            {isCustomerLoggedIn && (
              <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-zinc-900 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none">{language === 'en' ? 'Account' : 'መለያ'}</span>
        </button>
      </nav>
    </>
  );
};

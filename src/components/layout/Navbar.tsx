import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ThemeToggle } from '../ThemeToggle';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  User, 
  Heart, 
  Menu, 
  X, 
  Bell, 
  QrCode, 
  Camera, 
  Mic, 
  Flame, 
  ChevronDown, 
  Layers, 
  Laptop, 
  Gamepad2, 
  Watch, 
  Smartphone, 
  Headphones, 
  Cpu, 
  Sparkles, 
  Phone, 
  Package, 
  LogIn
} from 'lucide-react';
import { isPwaStandalone, triggerPwaInstall } from '../../pwaRegister';

interface NavbarProps {
  onOpenProfile?: () => void;
  onOpenMyOrders?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, onOpenMyOrders }) => {
  const { 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    searchQuery, 
    setSearchQuery, 
    categories,
    selectedCategory,
    setSelectedCategory,
    cartCount,
    favorites,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    priceAlerts,
    isPriceAlertsOpen,
    setIsPriceAlertsOpen,
    isQrScannerOpen,
    setIsQrScannerOpen,
    showToast,
    customerName,
    isCustomerLoggedIn
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isMobileCatsExpanded, setIsMobileCatsExpanded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const el = document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setIsDeptDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const el = document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDealsClick = () => {
    setSelectedCategory('deals');
    setIsDeptDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const el = document.getElementById('featured-deals-section') || document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'computers': return Laptop;
      case 'gaming': return Gamepad2;
      case 'smartwatches': return Watch;
      case 'mobiles': return Smartphone;
      case 'headphones': return Headphones;
      case 'cameras': return Camera;
      case 'accessories': return Cpu;
      default: return Layers;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-4 md:px-5 lg:px-8 py-2 sm:py-2.5 lg:py-3.5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-5">
          
          {/* 1. Brand Logo & Category Explorer Dropdown */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-white rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/90 dark:border-zinc-800 transition-transform group-hover:scale-105 duration-200 p-0.5 sm:p-1 shrink-0">
                <img src="/favicon.png" alt="Kasma Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-base md:text-base lg:text-xl font-black tracking-wider sm:tracking-widest text-slate-900 dark:text-white leading-none font-sans uppercase">
                    KASMA <span className="text-amber-500 font-bold">SHOP</span>
                  </span>
                </div>
                <span className="hidden sm:block text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 dark:text-zinc-500 tracking-wider font-extrabold uppercase leading-none mt-1">
                  {language === 'en' ? 'PREMIUM MARKETPLACE' : 'ፕሪሚየም የገበያ ቦታ'}
                </span>
              </div>
            </Link>

            {/* "All Categories" Dropdown Trigger on Desktop (Hidden on mobile/tablet < lg) */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                className={`h-9 lg:h-10 px-3 lg:px-3.5 rounded-xl font-bold text-xs lg:text-[13px] flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isDeptDropdownOpen
                    ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800/90 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border-slate-200/80 dark:border-zinc-700/80'
                }`}
                title={language === 'en' ? 'Browse all categories' : 'ሁሉንም ምድቦች ይመልከቱ'}
              >
                <Layers className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isDeptDropdownOpen ? 'text-white' : 'text-[#0052FF] dark:text-blue-400'}`} />
                <span>{language === 'en' ? 'Categories' : 'ምድቦች'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Department Dropdown Menu */}
              {isDeptDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-[1px]" 
                    onClick={() => setIsDeptDropdownOpen(false)} 
                  />
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 mb-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#0052FF]" />
                        <span>{language === 'en' ? 'Electronics Catalog' : 'የኤሌክትሮኒክስ ዝርዝር'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsDeptDropdownOpen(false)}
                        className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCategorySelect('all')}
                      className={`w-full px-4 py-2.5 text-left text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] dark:text-blue-400 font-black'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-[#0052FF]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                        <span>{language === 'en' ? 'All Products' : 'ሁሉም ምርቶች'}</span>
                      </div>
                      {selectedCategory === 'all' && <div className="w-2 h-2 rounded-full bg-[#0052FF]" />}
                    </button>

                    {categories.map(cat => {
                      const CatIcon = getCategoryIcon(cat.id);
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`w-full px-4 py-2.5 text-left text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] dark:text-blue-400 font-black'
                              : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-[#0052FF]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CatIcon className={`w-4.5 h-4.5 ${isSelected ? 'text-[#0052FF]' : 'text-slate-400 dark:text-zinc-500'}`} />
                            <span>{language === 'en' ? cat.nameEn : cat.nameAm}</span>
                          </div>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#0052FF]" />}
                        </button>
                      );
                    })}

                    <hr className="border-slate-100 dark:border-zinc-800 my-2" />
                    
                    <button
                      type="button"
                      onClick={handleDealsClick}
                      className="w-full px-4 py-2.5 text-left text-sm font-black flex items-center gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Flame className="w-4.5 h-4.5 text-rose-500 fill-rose-500/20" />
                      <span>{language === 'en' ? 'Flash Deals & Discounts' : 'ልዩ ቅናሾች'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Global Search Field (Desktop & Tablet) */}
          <div className="flex-1 min-w-[200px] sm:min-w-[220px] md:min-w-[260px] max-w-2xl lg:max-w-3xl mx-2 sm:mx-2.5 md:mx-3 lg:mx-4 relative hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search smartphones, Arctis, PS5...' : 'ስልኮችን፣ ማዳመጫዎችን፣ ፒኤስ5 ይፈልጉ...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 lg:h-10 pl-9 pr-14 lg:pr-28 rounded-xl border border-slate-200/90 dark:border-zinc-700/80 bg-slate-100/70 dark:bg-zinc-800/80 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/30 focus:border-[#0052FF] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 text-slate-900 dark:text-zinc-100 transition-all shadow-2xs"
              />
              <div className="absolute right-1.5 flex items-center gap-0.5 sm:gap-1 text-slate-400">
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs font-bold rounded-lg cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="p-1 sm:p-1.5 bg-[#0052FF]/10 dark:bg-blue-500/20 text-[#0052FF] dark:text-blue-400 hover:bg-[#0052FF] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center"
                  title={language === 'en' ? 'Scan Product QR Tag' : 'የምርት QR ኮድ ያንብቡ'}
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Galaxy S24');
                    showToast(language === 'en' ? '📷 Image Search activated: Matches for "Galaxy S24"' : '📷 የምስል ፍለጋ ተከናውኗል!', 'info');
                  }}
                  className="hidden lg:flex p-1 sm:p-1.5 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                  title={language === 'en' ? 'Search by Image / Camera' : 'በምስል ይፈልጉ'}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Arctis Nova');
                    showToast(language === 'en' ? '🎙️ Listening... Recognized "Arctis Nova"' : '🎙️ ድምፅ ተሰምቷል፡ "Arctis Nova"', 'info');
                  }}
                  className="hidden lg:flex p-1 sm:p-1.5 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                  title={language === 'en' ? 'Search by Voice' : 'በድምፅ ይፈልጉ'}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* 3. Primary Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs lg:text-[13px] font-bold shrink-0">
            <button
              onClick={handleDealsClick}
              className={`h-9 lg:h-10 px-3 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedCategory === 'deals'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <span>{language === 'en' ? 'Deals' : 'ቅናሾች'}</span>
            </button>
            {isCustomerLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={onOpenMyOrders}
                  className="h-9 lg:h-10 px-3 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs lg:text-[13px] font-bold"
                >
                  <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'en' ? 'My Orders' : 'የእኔ ትዕዛዞች'}</span>
                </button>
                <Link
                  to="/tracking"
                  className="h-9 lg:h-10 px-3 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Truck className="w-4 h-4 text-[#0052FF]" />
                  <span>{language === 'en' ? 'Track Order' : 'ትዕዛዝ ተከታተል'}</span>
                </Link>
              </>
            )}
          </nav>

          {/* 4. Action Controls & Utilities (Strict Sequence: 1. Cart, 2. Wishlist, 3. Bell, 4. Sign In, 5. Language, 6. Theme) */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            
            {/* 1. Cart Button (Always visible) */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={language === 'en' ? 'Shopping Cart' : 'የገበያ ጋሪ'}
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0052FF]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#0052FF] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 2. Wishlist Button (Hidden on xs phones <420px, visible on larger phones & tablets/desktop) */}
            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="relative hidden min-[420px]:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={language === 'en' ? 'Wishlist' : 'ምኞት ዝርዝር'}
            >
              <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-rose-500" />
              {favorites.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* 3. Price Alerts Bell Button (Hidden on mobile <640px, visible on sm+) */}
            <button
              type="button"
              onClick={() => setIsPriceAlertsOpen(true)}
              className="relative hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={language === 'en' ? 'Notifications & Price Alerts' : 'የዋጋ ማንቂያዎች'}
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-500" />
              {priceAlerts.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-amber-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-xs">
                  {priceAlerts.length}
                </span>
              )}
            </button>

            {/* 4. Customer Account / Sign In Button (Always visible) */}
            <button
              type="button"
              onClick={onOpenProfile}
              className={`h-9 sm:h-10 px-2.5 lg:px-3.5 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer border shrink-0 ${
                isCustomerLoggedIn
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/80 hover:bg-amber-100'
                  : 'bg-[#0052FF] hover:bg-blue-600 text-white border-transparent shadow-xs hover:shadow-blue-600/20'
              }`}
              title={isCustomerLoggedIn ? (customerName || 'My Account') : (language === 'en' ? 'Sign In / Account' : 'ይግቡ / መለያ')}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline max-w-[120px] truncate">
                {isCustomerLoggedIn ? (customerName || (language === 'en' ? 'Account' : 'መለያ')) : (language === 'en' ? 'Sign In' : 'ይግቡ')}
              </span>
              {isCustomerLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              )}
            </button>

            {/* 5. Language Switch (Hidden on mobile/tablet < lg, visible on lg+ desktop) */}
            <div className="hidden lg:flex bg-slate-100 dark:bg-zinc-800 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  language === 'en' ? 'bg-white dark:bg-zinc-700 text-slate-950 dark:text-zinc-100 shadow-xs' : 'text-slate-400 hover:text-slate-950 dark:hover:text-zinc-100'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('am')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  language === 'am' ? 'bg-white dark:bg-zinc-700 text-slate-950 dark:text-zinc-100 shadow-xs' : 'text-slate-400 hover:text-slate-950 dark:hover:text-zinc-100'
                }`}
              >
                አማ
              </button>
            </div>

            {/* 6. Theme Toggle Switch (Hidden on mobile/tablet < lg, visible on lg+ desktop) */}
            <div className="hidden lg:flex items-center shrink-0">
              <ThemeToggle 
                theme={theme} 
                onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                language={language}
                size="sm"
              />
            </div>

            {/* Mobile/Tablet Hamburger Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-900 dark:text-white" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Bar Row (Clean, touch-friendly, responsive) */}
        <div className="pt-2 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search smartphones, laptops, PS5...' : 'ስልኮችን፣ ላፕቶፖችን፣ ፒኤስ5 ይፈልጉ...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-20 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 focus:border-[#0052FF] text-slate-900 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                  title="Clear"
                >
                  ✕
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="p-1.5 bg-[#0052FF]/10 text-[#0052FF] dark:text-blue-400 rounded-lg text-xs font-bold"
                title={language === 'en' ? 'Scan QR' : 'QR ኮድ'}
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('Galaxy S24');
                  showToast(language === 'en' ? '📷 Image Search activated' : '📷 የምስል ፍለጋ ተከናውኗል!', 'info');
                }}
                className="p-1.5 text-slate-400 hover:text-[#0052FF] rounded-lg text-xs"
                title={language === 'en' ? 'Image Search' : 'በምስል ይፈልጉ'}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="py-3 mt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2.5 xl:hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-120px)] overflow-y-auto pb-6">
            
            {/* Account Card inside Mobile Menu */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenProfile?.(); }}
              className="p-3 rounded-2xl text-xs font-bold flex items-center justify-between bg-slate-100 dark:bg-zinc-800/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer border border-slate-200/80 dark:border-zinc-700/80 transition-all text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCustomerLoggedIn ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-[#0052FF]/10 text-[#0052FF]'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-sm truncate">
                    {isCustomerLoggedIn ? (customerName || (language === 'en' ? 'Customer Profile' : 'የደንበኛ መገለጫ')) : (language === 'en' ? 'Sign In / Register' : 'ይግቡ / ይመዝገቡ')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    {isCustomerLoggedIn ? (language === 'en' ? 'Manage orders & rewards' : 'ትዕዛዞችንና ሽልማቶችን ይመልከቱ') : (language === 'en' ? 'Access tracking, points & wishlists' : 'የግል መረጃዎችንና ምኞቶችን ያግኙ')}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400 shrink-0" />
            </button>

            {/* Quick Action Grid (Cart, Wishlist, Notifications) */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {/* Cart */}
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-[#0052FF] dark:text-blue-400 cursor-pointer transition-transform active:scale-95"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#0052FF] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold mt-0.5">{language === 'en' ? 'Cart' : 'ጋሪ'}</span>
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); setIsWishlistOpen(true); }}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 cursor-pointer transition-transform active:scale-95"
              >
                <div className="relative">
                  <Heart className="w-5 h-5" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold mt-0.5">{language === 'en' ? 'Wishlist' : 'ምኞቶች'}</span>
              </button>

              {/* Price Alerts */}
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); setIsPriceAlertsOpen(true); }}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 cursor-pointer transition-transform active:scale-95"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {priceAlerts.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {priceAlerts.length}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold mt-0.5">{language === 'en' ? 'Alerts' : 'ማንቂያዎች'}</span>
              </button>
            </div>

            {/* Category Collapsible on Mobile */}
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setIsMobileCatsExpanded(!isMobileCatsExpanded)}
                className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#0052FF]" />
                  <span>{language === 'en' ? 'Shop by Category' : 'በምድብ ይፈልጉ'}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMobileCatsExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isMobileCatsExpanded && (
                <div className="p-2 pt-0 flex flex-col gap-1 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-[#0052FF] flex items-center gap-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'en' ? 'All Products' : 'ሁሉም ምርቶች'}</span>
                  </button>
                  {categories.map(cat => {
                    const CatIcon = getCategoryIcon(cat.id);
                    return (
                      <button
                        key={`mob-${cat.id}`}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-[#0052FF] flex items-center gap-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? cat.nameEn : cat.nameAm}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Flash Deals Link */}
            <button
              onClick={handleDealsClick}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 text-left border border-rose-200/50 dark:border-rose-900/40"
            >
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <span>{language === 'en' ? 'Flash Deals & Discounts' : 'ልዩ ቅናሾች'}</span>
            </button>

            {/* Track Order & My Orders (Conditional upon user sign-in) */}
            {isCustomerLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); onOpenMyOrders?.(); }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 border border-slate-200/80 dark:border-zinc-800 text-left cursor-pointer"
                >
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'en' ? 'My Orders & Warranties' : 'ትዕዛዞች እና ዋስትና'}</span>
                </button>
                <Link
                  to="/tracking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 border border-slate-200/80 dark:border-zinc-800"
                >
                  <Truck className="w-4 h-4 text-[#0052FF]" />
                  <span>{language === 'en' ? 'Track Order / Status' : 'ትዕዛዝ ተከታተል'}</span>
                </Link>
              </>
            )}


            {/* Mobile App Preferences Section (Language & Theme) */}
            <div className="p-3 bg-slate-100/80 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 flex flex-col gap-2.5 mt-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                {language === 'en' ? 'Preferences' : 'ምርጫዎች'}
              </span>
              
              <div className="flex items-center justify-between gap-2">
                {/* Language Switch */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {language === 'en' ? 'Language:' : 'ቋንቋ:'}
                  </span>
                  <div className="flex bg-white dark:bg-zinc-700 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-600">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        language === 'en' ? 'bg-[#0052FF] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-zinc-300'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('am')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        language === 'am' ? 'bg-[#0052FF] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-zinc-300'
                      }`}
                    >
                      አማርኛ
                    </button>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {language === 'en' ? 'Theme:' : 'ገጽታ:'}
                  </span>
                  <ThemeToggle 
                    theme={theme} 
                    onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                    language={language}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Install Kasma Mobile App Action (if not already running in PWA standalone mode) */}
            {!isPwaStandalone() && (
              <button
                type="button"
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  const res = await triggerPwaInstall();
                  if (res.outcome === 'unsupported') {
                    alert(
                      language === 'am'
                        ? 'መተግበሪያውን ለመጫን በአሳሽዎ (Browser) ሜኑ ውስጥ "Install App" ወይም "Add to Home Screen" የሚለውን ይምረጡ።'
                        : 'To install, open your browser menu (⋮ / ⎋) and select "Install app" or "Add to Home Screen".'
                    );
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-between shadow-xs cursor-pointer transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-white" />
                  <span>{language === 'en' ? 'Install Kasma App (PWA)' : 'ካስማ መተግበሪያን ጫን (PWA)'}</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
                  {language === 'en' ? '⚡ 0ms LOAD' : '⚡ ፈጣን'}
                </span>
              </button>
            )}

            {/* Support hotline */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
              <a
                href="tel:+251911223344"
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#0052FF] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{language === 'en' ? 'Customer Support Hotline' : 'የደንበኞች ድጋፍ ስልክ'}</span>
                </div>
                <span className="font-mono font-black">+251 911 223 344</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ThemeToggle } from '../ThemeToggle';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  ShieldCheck, 
  Bike,
  User, 
  Heart, 
  Menu, 
  X,
  Bell,
  QrCode,
  Camera,
  Mic,
  RefreshCw,
  Wifi,
  WifiOff,
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
  LogIn
} from 'lucide-react';

interface NavbarProps {
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile }) => {
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
    offlineOrders,
    isOfflineSimulated,
    setIsOfflineSimulated,
    isSyncing,
    handleForceSync,
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
      <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-5 md:px-8 py-2.5 sm:py-3 lg:py-3.5">
        <div className="flex items-center justify-between gap-2 md:gap-3 lg:gap-5">
          
          {/* 1. Brand Logo & Category Explorer Dropdown */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-white rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/90 dark:border-zinc-800 transition-transform group-hover:scale-105 duration-200 p-1 shrink-0">
                <img src="/favicon.png" alt="Kasma Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg lg:text-xl font-black tracking-widest text-slate-900 dark:text-white leading-none font-sans uppercase">
                    KASMA <span className="text-amber-500 font-bold">SHOP</span>
                  </span>
                </div>
                <span className="hidden sm:block text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 dark:text-zinc-500 tracking-wider font-extrabold uppercase leading-none mt-1">
                  {language === 'en' ? 'PREMIUM MARKETPLACE' : 'ፕሪሚየም የገበያ ቦታ'}
                </span>
              </div>
            </Link>

            {/* "All Categories" Dropdown Trigger on Desktop */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                className={`h-10 lg:h-11 px-3.5 lg:px-4 rounded-xl lg:rounded-2xl font-bold text-xs sm:text-sm lg:text-[13px] flex items-center gap-2 transition-all cursor-pointer border ${
                  isDeptDropdownOpen
                    ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800/90 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border-slate-200/80 dark:border-zinc-700/80'
                }`}
                title={language === 'en' ? 'Browse all categories' : 'ሁሉንም ምድቦች ይመልከቱ'}
              >
                <Layers className={`w-4 h-4 lg:w-4.5 lg:h-4.5 ${isDeptDropdownOpen ? 'text-white' : 'text-[#0052FF] dark:text-blue-400'}`} />
                <span>{language === 'en' ? 'Categories' : 'ምድቦች'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
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

          {/* 2. Global Search Field */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-3 relative hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3.5 w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search smartphones, Arctis, PS5...' : 'ስልኮችን፣ ማዳመጫዎችን፣ ፒኤስ5 ይፈልጉ...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 lg:h-11 pl-10 pr-28 sm:pr-32 rounded-xl lg:rounded-2xl border border-slate-200/90 dark:border-zinc-700/80 bg-slate-100/70 dark:bg-zinc-800/80 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/30 focus:border-[#0052FF] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 text-slate-900 dark:text-zinc-100 transition-all shadow-2xs"
              />
              <div className="absolute right-2 flex items-center gap-1 text-slate-400">
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs font-bold rounded-lg cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="p-1.5 lg:p-2 bg-[#0052FF]/10 dark:bg-blue-500/20 text-[#0052FF] dark:text-blue-400 hover:bg-[#0052FF] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center"
                  title={language === 'en' ? 'Scan Product QR Tag' : 'የምርት QR ኮድ ያንብቡ'}
                >
                  <QrCode className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Galaxy S24');
                    showToast(language === 'en' ? '📷 Image Search activated: Matches for "Galaxy S24"' : '📷 የምስል ፍለጋ ተከናውኗል!', 'info');
                  }}
                  className="p-1.5 lg:p-2 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                  title={language === 'en' ? 'Search by Image / Camera' : 'በምስል ይፈልጉ'}
                >
                  <Camera className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Arctis Nova');
                    showToast(language === 'en' ? '🎙️ Listening... Recognized "Arctis Nova"' : '🎙️ ድምፅ ተሰምቷል፡ "Arctis Nova"', 'info');
                  }}
                  className="p-1.5 lg:p-2 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                  title={language === 'en' ? 'Search by Voice' : 'በድምፅ ይፈልጉ'}
                >
                  <Mic className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* 3. Primary Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs sm:text-sm lg:text-[13px] font-bold shrink-0">
            <button
              onClick={handleDealsClick}
              className={`h-10 lg:h-11 px-3 lg:px-3.5 rounded-xl lg:rounded-2xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                selectedCategory === 'deals'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <Flame className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-rose-500 fill-rose-500/20" />
              <span>{language === 'en' ? 'Deals' : 'ቅናሾች'}</span>
            </button>
            <Link
              to="/tracking"
              className="h-10 lg:h-11 px-3 lg:px-3.5 rounded-xl lg:rounded-2xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Truck className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-[#0052FF]" />
              <span>{language === 'en' ? 'Track Order' : 'ትዕዛዝ ተከታተል'}</span>
            </Link>
            <Link
              to="/courier"
              className="h-10 lg:h-11 px-3 lg:px-3.5 rounded-xl lg:rounded-2xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Bike className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-amber-500" />
              <span>{language === 'en' ? 'Courier' : 'አሽከርካሪ'}</span>
            </Link>
          </nav>

          {/* 4. Action Controls & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="relative w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl lg:rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={language === 'en' ? 'Wishlist' : 'ምኞት ዝርዝር'}
            >
              <Heart className="w-5 h-5 text-rose-500" />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl lg:rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={language === 'en' ? 'Shopping Cart' : 'የገበያ ጋሪ'}
            >
              <ShoppingBag className="w-5 h-5 text-[#0052FF]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#0052FF] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Price Alerts Bell Button */}
            <button
              type="button"
              onClick={() => setIsPriceAlertsOpen(true)}
              className="relative w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl lg:rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={language === 'en' ? 'Notifications & Price Alerts' : 'የዋጋ ማንቂያዎች'}
            >
              <Bell className="w-5 h-5 text-amber-500" />
              {priceAlerts.length > 0 && (
                <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-xs">
                  {priceAlerts.length}
                </span>
              )}
            </button>

            {/* Customer Account / Sign In Button */}
            <button
              type="button"
              onClick={onOpenProfile}
              className={`h-10 lg:h-11 px-3.5 lg:px-4.5 rounded-xl lg:rounded-2xl text-xs sm:text-sm lg:text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                isCustomerLoggedIn
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/80 hover:bg-amber-100'
                  : 'bg-[#0052FF] hover:bg-blue-600 text-white border-transparent shadow-xs hover:shadow-blue-600/20'
              }`}
              title={isCustomerLoggedIn ? (customerName || 'My Account') : (language === 'en' ? 'Sign In / Account' : 'ይግቡ / መለያ')}
            >
              <User className="w-4 h-4 lg:w-4.5 lg:h-4.5 shrink-0" />
              <span className="hidden md:inline max-w-[100px] truncate">
                {isCustomerLoggedIn ? (customerName || (language === 'en' ? 'Account' : 'መለያ')) : (language === 'en' ? 'Sign In' : 'ይግቡ')}
              </span>
              {isCustomerLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              )}
            </button>

            {/* Theme Toggle Switch */}
            <ThemeToggle 
              theme={theme} 
              onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              language={language}
              size="md"
            />

            {/* Language Switch */}
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl lg:rounded-2xl border border-slate-200 dark:border-zinc-700 shrink-0">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl text-xs font-black transition-all cursor-pointer ${
                  language === 'en' ? 'bg-white dark:bg-zinc-700 text-slate-950 dark:text-zinc-100 shadow-xs' : 'text-slate-400 hover:text-slate-950 dark:hover:text-zinc-100'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('am')}
                className={`px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl text-xs font-black transition-all cursor-pointer ${
                  language === 'am' ? 'bg-white dark:bg-zinc-700 text-slate-950 dark:text-zinc-100 shadow-xs' : 'text-slate-400 hover:text-slate-950 dark:hover:text-zinc-100'
                }`}
              >
                አማ
              </button>
            </div>

            {/* Compact Sync & Connection Status Indicator */}
            <button
              type="button"
              onClick={() => {
                if (offlineOrders.length > 0 && !isOfflineSimulated) {
                  handleForceSync?.();
                } else {
                  setIsOfflineSimulated(!isOfflineSimulated);
                  showToast(
                    !isOfflineSimulated
                      ? (language === 'en' ? 'Simulated Offline Mode enabled' : 'ከመስመር ውጭ ሁነታ ተጀምሯል')
                      : (language === 'en' ? 'Connected to server' : 'ከሰርቨር ጋር ተገናኝቷል'),
                    'info'
                  );
                }
              }}
              className={`h-10 lg:h-11 px-2.5 lg:px-3 rounded-xl lg:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isOfflineSimulated
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/80'
                  : offlineOrders.length > 0
                  ? 'bg-[#0052FF] text-white border-blue-600 animate-pulse'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/80'
              }`}
              title={
                isOfflineSimulated
                  ? (language === 'en' ? 'Offline Mode active. Click to reconnect' : 'ከመስመር ውጭ ሁነታ። ለማገናኘት ይጫኑ')
                  : offlineOrders.length > 0
                  ? (language === 'en' ? `${offlineOrders.length} orders queued. Click to sync` : `${offlineOrders.length} ትዕዛዞች ተቀምጠዋል። ለማመሳሰል ይጫኑ`)
                  : (language === 'en' ? 'Connected (Live). Click to simulate offline' : 'የተገናኘ። ከመስመር ውጭ ለመሞከር ይጫኑ')
              }
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#0052FF]" />
              ) : isOfflineSimulated ? (
                <WifiOff className="w-4 h-4 text-amber-600" />
              ) : (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-500" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
              {offlineOrders.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-mono font-black px-1.5 rounded-full">
                  {offlineOrders.length}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="pt-2 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search smartphones, laptops, PS5...' : 'ስልኮችን፣ ላፕቶፖችን፣ ፒኤስ5 ይፈልጉ...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-12 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 focus:border-[#0052FF] text-slate-900 dark:text-zinc-100 outline-none"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 text-xs font-bold"
                >
                  ✕
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="p-1 text-[#0052FF] text-xs font-bold"
                  title="Scan QR"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="py-3 mt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-1.5 xl:hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Account CTA inside Mobile Menu */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenProfile?.(); }}
              className="px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between bg-slate-100 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0052FF]" />
                <span>{isCustomerLoggedIn ? (customerName || (language === 'en' ? 'My Profile' : 'የእኔ መገለጫ')) : (language === 'en' ? 'Sign In / Register' : 'ይግቡ / ይመዝገቡ')}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
            </button>

            {/* Category Collapsible on Mobile */}
            <button
              onClick={() => setIsMobileCatsExpanded(!isMobileCatsExpanded)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0052FF]" />
                <span>{language === 'en' ? 'Shop by Category' : 'በምድብ ይፈልጉ'}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMobileCatsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isMobileCatsExpanded && (
              <div className="pl-6 pr-2 py-1 flex flex-col gap-1 border-l-2 border-blue-500/30 ml-4">
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="py-1.5 text-left text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-[#0052FF] flex items-center gap-2"
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
                      className="py-1.5 text-left text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-[#0052FF] flex items-center gap-2"
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? cat.nameEn : cat.nameAm}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleDealsClick}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-left"
            >
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <span>{language === 'en' ? 'Flash Deals' : 'ልዩ ቅናሾች'}</span>
            </button>

            <Link
              to="/tracking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-[#0052FF]" />
              <span>{language === 'en' ? 'Track Order / Status' : 'ትዕዛዝ ተከታተል'}</span>
            </Link>

            <Link
              to="/courier"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 font-bold"
            >
              <Bike className="w-4 h-4 text-amber-500" />
              <span>{language === 'en' ? 'Courier Dispatch (/courier)' : 'የአዲስ አበባ አሽከርካሪ (/courier)'}</span>
            </Link>

            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>{language === 'en' ? 'Admin Console' : 'አስተዳዳሪ'}</span>
            </Link>

            {/* Support hotline */}
            <div className="pt-2 mt-1 border-t border-slate-200 dark:border-zinc-800">
              <a
                href="tel:+251911223344"
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#0052FF] dark:text-blue-400 flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+251 911 223 344</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

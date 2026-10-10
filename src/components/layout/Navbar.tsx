import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ThemeToggle } from '../ThemeToggle';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  Store, 
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
  WifiOff
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-150 dark:border-zinc-800 px-3 sm:px-4 md:px-8 py-2 sm:py-2.5 transition-colors shadow-xs">
      <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between gap-2 md:gap-4">
        
        {/* Logo & Brand Identity */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer select-none group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black rounded-xl flex items-center justify-center font-black text-base sm:text-lg tracking-tight shadow-md border border-zinc-800/80 transition-transform group-hover:scale-105 duration-200">
            <span className="text-[#0052FF]">K</span>
            <span className="text-amber-400 -ml-0.5">S</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black tracking-widest text-gray-950 dark:text-white leading-none font-sans uppercase">
                KASMA <span className="text-amber-500 font-bold">SHOP</span>
              </span>
            </div>
            <span className="hidden sm:block text-[7px] sm:text-[8px] text-gray-400 dark:text-zinc-500 tracking-wider font-extrabold uppercase leading-none mt-0.5 sm:mt-1">
              {language === 'en' ? 'PREMIUM MARKETPLACE' : 'ፕሪሚየም የገበያ ቦታ'}
            </span>
          </div>
        </Link>

        {/* Global Search Field in the middle */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4 relative hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search smartphones, Arctis, PS5...' : 'ስልኮችን፣ ማዳመጫዎችን፣ ፒኤስ5 ይፈልጉ...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-24 sm:pr-28 py-2 rounded-2xl border border-gray-200/90 dark:border-zinc-700/80 bg-gray-50 dark:bg-zinc-800/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/30 focus:border-[#0052FF] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-zinc-100 transition-all shadow-2xs"
            />
            <div className="absolute right-2 flex items-center gap-0.5 sm:gap-1 text-gray-400">
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-gray-400 hover:text-gray-950 dark:hover:text-white text-xs font-bold rounded-lg cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              {/* QR Code Scanner Overlay Button */}
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="p-1.5 bg-[#0052FF]/10 dark:bg-blue-500/20 text-[#0052FF] dark:text-blue-400 hover:bg-[#0052FF] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center"
                title={language === 'en' ? 'Scan Product QR Tag' : 'የምርት QR ኮድ ያንብቡ'}
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              {/* Camera Image Search Button */}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('Galaxy S24');
                  showToast(language === 'en' ? '📷 Image Search activated: Matches for "Galaxy S24"' : '📷 የምስል ፍለጋ ተከናውኗል!', 'info');
                }}
                className="p-1.5 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 text-gray-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                title={language === 'en' ? 'Search by Image / Camera' : 'በምስል ይፈልጉ'}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              {/* Voice Mic Search Button */}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('Arctis Nova');
                  showToast(language === 'en' ? '🎙️ Listening... Recognized "Arctis Nova"' : '🎙️ ድምፅ ተሰምቷል፡ "Arctis Nova"', 'info');
                }}
                className="p-1.5 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 text-gray-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                title={language === 'en' ? 'Search by Voice' : 'በድምፅ ይፈልጉ'}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Cart Button with Count Badge */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={language === 'en' ? 'Shopping Cart' : 'የገበያ ጋሪ'}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#0052FF] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Wishlist Button with Badge */}
          <button
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={language === 'en' ? 'Wishlist' : 'ምኞት ዝርዝር'}
          >
            <Heart className="w-4.5 h-4.5 text-rose-500" />
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Price Alerts Bell Button with Badge */}
          <button
            type="button"
            onClick={() => setIsPriceAlertsOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-950 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={language === 'en' ? 'Notifications & Price Alerts' : 'የዋጋ ማንቂያዎች'}
          >
            <Bell className="w-4.5 h-4.5 text-amber-500" />
            {priceAlerts.length > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                {priceAlerts.length}
              </span>
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
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-gray-200 dark:border-zinc-700 shrink-0">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                language === 'en' ? 'bg-white dark:bg-zinc-700 text-gray-950 dark:text-zinc-100 shadow-xs' : 'text-gray-400 hover:text-gray-950 dark:hover:text-zinc-100'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('am')}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                language === 'am' ? 'bg-white dark:bg-zinc-700 text-gray-950 dark:text-zinc-100 shadow-xs' : 'text-gray-400 hover:text-gray-950 dark:hover:text-zinc-100'
              }`}
            >
              አማ
            </button>
          </div>

          {/* Visual Sync Status Indicator Toggle */}
          <button
            type="button"
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            className={`hidden md:flex px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold items-center gap-1.5 transition-all cursor-pointer border ${
              isOfflineSimulated
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/80'
                : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/80'
            }`}
            title={isOfflineSimulated ? 'Offline Mode Active. Click to reconnect' : 'Connected to Server. Click to simulate Offline mode'}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOfflineSimulated ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOfflineSimulated ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </span>
            <span>{isOfflineSimulated ? (language === 'en' ? 'Offline' : 'ከመስመር ውጭ') : (language === 'en' ? 'Connected' : 'የተገናኘ')}</span>
          </button>

          {/* Manual 'Sync Data' Button */}
          <button
            type="button"
            onClick={handleForceSync}
            disabled={isSyncing}
            className={`hidden md:flex px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all items-center gap-1.5 cursor-pointer disabled:opacity-50 border ${
              offlineOrders.length > 0
                ? 'bg-[#0052FF] hover:bg-blue-600 text-white shadow-xs animate-pulse border-blue-600'
                : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 border-gray-200 dark:border-zinc-700'
            }`}
            title={language === 'en' ? 'Push queued orders and sync with server' : 'የተቀመጡ ትዕዛዞችን ላክ እና ዳታ አድስ'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#0052FF]' : ''}`} />
            <span>{language === 'en' ? 'Sync Data' : 'ዳታ አመሳስል'}</span>
            {offlineOrders.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono">
                {offlineOrders.length}
              </span>
            )}
          </button>

          {/* Mobile Search/Hamburger Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="pt-2 sm:hidden">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-gray-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Search smartphones, Arctis, PS5...' : 'ስልኮችን፣ ማዳመጫዎችን፣ ፒኤስ5 ይፈልጉ...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-1.5 rounded-xl text-xs bg-gray-100 dark:bg-zinc-900 border border-transparent focus:border-[#0052FF] text-gray-900 dark:text-zinc-100 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 text-gray-400 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="py-3 mt-2 border-t border-gray-150 dark:border-zinc-800 flex flex-col gap-1.5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900"
          >
            {language === 'en' ? 'Shop Catalog' : 'የእቃዎች ካታሎግ'}
          </Link>
          <Link
            to="/tracking"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 flex items-center gap-2"
          >
            <Truck className="w-4 h-4 text-[#0052FF]" />
            <span>{language === 'en' ? 'Track Order / Status' : 'ትዕዛዝ ተከታተል'}</span>
          </Link>
          <Link
            to="/merchant"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 flex items-center gap-2"
          >
            <Store className="w-4 h-4 text-emerald-600" />
            <span>{language === 'en' ? 'Merchant Portal' : 'የነጋዴ መድረክ'}</span>
          </Link>
          <Link
            to="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>{language === 'en' ? 'Admin Console' : 'አስተዳዳሪ'}</span>
          </Link>
          <Link
            to="/courier"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 font-bold"
          >
            <Bike className="w-4 h-4 text-amber-500" />
            <span>{language === 'en' ? 'Courier Dispatch (/courier)' : 'የአዲስ አበባ አሽከርካሪ (/courier)'}</span>
          </Link>
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { 
  ShoppingBag, 
  Search, 
  Sun, 
  Moon, 
  Globe, 
  Truck, 
  Store, 
  ShieldCheck, 
  Bike,
  User, 
  Heart, 
  Menu, 
  X,
  Sparkles
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
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-150 dark:border-zinc-800 transition-colors">
      {/* Top Banner */}
      <div className="bg-[#0052FF] text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>
          {language === 'en' 
            ? '🚀 Addis Ababa Express Delivery: Receive your tech within 2-4 Hours across all sub-cities!'
            : '🚀 የፈጣን ማጓጓዣ አገልግሎት፡ በአዲስ አበባ በሁሉም ክፍለ ከተሞች ከ2-4 ሰዓት ውስጥ ይቀበሉ!'}
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-gray-900 dark:text-zinc-100">KASMA</span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  SHOP
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium -mt-1 hidden sm:block">
                {language === 'en' ? 'Ethiopian Tech Marketplace' : 'የኢትዮጵያ ቴክኖሎጂ ገበያ'}
              </p>
            </div>
          </Link>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg hidden md:block relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-gray-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search iPhone, M3 MacBook, Sony ANC, PS5...' : 'አይፎን፣ ማክቡክ፣ ሶኒ የጆሮ ማዳመጫ፣ ፒኤስ5 ይፈልጉ...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-100 dark:bg-zinc-900 border border-transparent focus:border-[#0052FF] focus:bg-white dark:focus:bg-zinc-950 text-gray-900 dark:text-zinc-100 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500"
              />
            </div>
          </form>

          {/* Navigation Links & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
              <Link 
                to="/tracking" 
                className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5 text-[#0052FF]" />
                <span>{language === 'en' ? 'Track Order' : 'ትዕዛዝ ተከታተል'}</span>
              </Link>
              <Link 
                to="/merchant" 
                className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'en' ? 'Merchant Portal' : 'የነጋዴ መድረክ'}</span>
              </Link>
              <Link 
                to="/admin" 
                className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>{language === 'en' ? 'Admin' : 'አስተዳዳሪ'}</span>
              </Link>
              <Link 
                to="/courier" 
                className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <Bike className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'en' ? 'Courier' : 'አሽከርካሪ'}</span>
              </Link>
            </nav>

            <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block" />

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="p-2 rounded-xl text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1 cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile */}
            <button
              onClick={onOpenProfile}
              className="p-2 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Customer Account"
            >
              <User className="w-4 h-4" />
              <span className="text-xs font-semibold hidden md:inline truncate max-w-[80px]">
                {isCustomerLoggedIn ? customerName.split(' ')[0] : (language === 'en' ? 'Account' : 'መለያ')}
              </span>
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">
                {language === 'en' ? 'Cart' : 'ጋሪ'}
              </span>
              {cartCount > 0 && (
                <span className="bg-[#0052FF] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4 text-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 lg:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search tech in Kasma...' : 'የቴክኖሎጂ እቃዎችን ይፈልጉ...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-100 dark:bg-zinc-900 border border-transparent focus:border-[#0052FF] text-gray-900 dark:text-zinc-100 outline-none"
            />
          </form>
        </div>

        {/* Mobile Nav Links Dropdown */}
        {isMobileMenuOpen && (
          <div className="py-3 border-t border-gray-150 dark:border-zinc-800 flex flex-col gap-1.5 lg:hidden">
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
      </div>
    </header>
  );
};

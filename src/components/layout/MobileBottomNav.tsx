import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Home, Search, Flame, ShoppingBag, User } from 'lucide-react';

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
    setIsCartOpen
  } = useShop();

  const isHomeActive = location.pathname === '/' && selectedCategory !== 'deals' && !isProfileOpen;
  const isDealsActive = selectedCategory === 'deals' && location.pathname === '/' && !isProfileOpen;
  const isCartActive = location.pathname === '/cart' && !isProfileOpen;

  const handleHomeClick = () => {
    setSelectedCategory('all');
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = () => {
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

  const handleDealsClick = () => {
    setSelectedCategory('deals');
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const el = document.getElementById('featured-deals-section') || document.getElementById('products-grid-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleCartClick = () => {
    if (location.pathname === '/') {
      setIsCartOpen(true);
    } else {
      navigate('/cart');
    }
  };

  return (
    <nav
      id="global-mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1 flex items-center justify-around select-none min-h-[56px]"
      style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
      aria-label="Mobile Navigation"
    >
      {/* 1. HOME TAB */}
      <button
        type="button"
        onClick={handleHomeClick}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] relative ${
          isHomeActive
            ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 scale-102 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
        <span className="text-[10px] tracking-tight">{language === 'en' ? 'Home' : 'ዋና ገጽ'}</span>
      </button>

      {/* 2. SEARCH TAB */}
      <button
        type="button"
        onClick={handleSearchClick}
        className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium"
      >
        <Search className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
        <span className="text-[10px] tracking-tight">{language === 'en' ? 'Search' : 'ፈልግ'}</span>
      </button>

      {/* 3. DEALS TAB */}
      <button
        type="button"
        onClick={handleDealsClick}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] relative ${
          isDealsActive
            ? 'text-amber-500 dark:text-amber-400 font-black bg-amber-50/80 dark:bg-amber-950/60 scale-102 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-amber-500 before:rounded-full'
            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
        }`}
      >
        <Flame className="w-5 h-5 mb-0.5 text-amber-500 fill-amber-500/20 stroke-[2.2px]" />
        <span className="text-[10px] tracking-tight">{language === 'en' ? 'Deals' : 'ቅናሾች'}</span>
      </button>

      {/* 4. CART TAB */}
      <button
        type="button"
        onClick={handleCartClick}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] relative ${
          isCartActive
            ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 scale-102 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[9px] font-mono font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white dark:border-zinc-900 animate-bounce">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">{language === 'en' ? 'Cart' : 'ጋሪ'}</span>
      </button>

      {/* 5. PROFILE TAB */}
      <button
        type="button"
        onClick={onOpenProfile}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] relative ${
          isProfileOpen
            ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 scale-102 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
        }`}
      >
        <div className="relative">
          <User className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
          {isCustomerLoggedIn && (
            <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-zinc-900 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] tracking-tight">{language === 'en' ? 'Profile' : 'መለያ'}</span>
      </button>
    </nav>
  );
};


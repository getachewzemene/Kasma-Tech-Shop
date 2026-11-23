import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Search,
  Clock,
  Trash2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Layers,
  QrCode,
  Camera,
  Mic,
  X,
  Smartphone,
  Laptop,
  Gamepad2,
  Watch,
  Headphones,
  Tv,
  Cpu
} from 'lucide-react';
import { Product } from '../../types';

interface SearchAutocompleteProps {
  isCompact?: boolean;
  className?: string;
  onVoiceSearch?: () => void;
  onImageSearch?: () => void;
  isListening?: boolean;
  placeholder?: string;
  inputClassName?: string;
}

const STORAGE_KEY = 'kasma_recent_searches';
const DEFAULT_RECENT = ['Samsung S24', 'MacBook Pro', 'PlayStation 5', 'Sony WH-1000XM5', 'Marshall'];

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  isCompact = false,
  className = '',
  onVoiceSearch,
  onImageSearch,
  isListening = false,
  placeholder,
  inputClassName = ''
}) => {
  const {
    language,
    searchQuery,
    setSearchQuery,
    categories,
    products,
    setSelectedCategory,
    setIsQrScannerOpen
  } = useShop();

  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_RECENT;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation: Escape closes dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 7);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const removeRecentItem = (e: React.MouseEvent, item: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== item);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const executeSearch = (queryText: string) => {
    const clean = queryText.trim();
    if (clean) {
      saveRecentSearch(clean);
      setSearchQuery(clean);
    }
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate(`/?search=${encodeURIComponent(clean)}`);
    }
    setTimeout(() => {
      const el = document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSelectProduct = (product: Product) => {
    saveRecentSearch(product.nameEn);
    setIsOpen(false);
    navigate(`/product/${product.id}`);
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const el = document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Matching products (thumbnails, prices, categories)
  const matchingProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return (products || [])
      .filter(p =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameAm?.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, products]);

  // Matching categories
  const matchingCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories?.slice(0, 6) || [];
    return (categories || []).filter(c =>
      c.nameEn.toLowerCase().includes(q) ||
      c.nameAm.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [searchQuery, categories]);

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'mobiles': return Smartphone;
      case 'computers': return Laptop;
      case 'gaming': return Gamepad2;
      case 'smartwatches': return Watch;
      case 'headphones': return Headphones;
      case 'television': return Tv;
      case 'accessories': return Cpu;
      default: return Layers;
    }
  };

  const defaultPlaceholder = isListening
    ? (language === 'en' ? '🎙️ Listening... Speak now' : '🎙️ እያዳመጥን ነው... ይናገሩ')
    : (language === 'en' ? 'Search smartphones, Arctis, PS5...' : 'ስልኮችን፣ ማዳመጫዎችን፣ ፒኤስ5 ይፈልጉ...');

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Form */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center w-full">
        <Search className={`absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none transition-all ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className={`w-full rounded-xl border border-slate-200/90 dark:border-zinc-700/80 bg-slate-100/70 dark:bg-zinc-800/80 font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/30 focus:border-[#0052FF] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 text-slate-900 dark:text-zinc-100 transition-all shadow-2xs ${
            isCompact
              ? 'h-8.5 lg:h-9 pl-8.5 pr-20 text-xs'
              : 'h-9.5 lg:h-10 pl-9 pr-24 text-xs sm:text-sm'
          } ${inputClassName}`}
        />

        {/* Action icons on right */}
        <div className="absolute right-1.5 flex items-center gap-0.5 sm:gap-1 text-slate-400">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold rounded-lg cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="p-1 sm:p-1.5 bg-[#0052FF]/10 dark:bg-blue-500/20 text-[#0052FF] dark:text-blue-400 hover:bg-[#0052FF] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center shrink-0"
            title={language === 'en' ? 'Scan Product QR Tag' : 'የምርት QR ኮድ ያንብቡ'}
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          {onImageSearch && (
            <button
              type="button"
              onClick={onImageSearch}
              className="hidden sm:flex p-1 sm:p-1.5 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer shrink-0"
              title={language === 'en' ? 'Search by Image / Camera' : 'በምስል ይፈልጉ'}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}

          {onVoiceSearch && (
            <button
              type="button"
              onClick={onVoiceSearch}
              className={`hidden sm:flex p-1 sm:p-1.5 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isListening ? 'text-red-500 animate-pulse bg-red-50 dark:bg-red-950/40' : 'text-slate-500 hover:text-[#0052FF] dark:hover:text-blue-400'
              }`}
              title={language === 'en' ? 'Search by Voice' : 'በድምፅ ይፈልጉ'}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* AUTOCOMPLETE POPOVER DROPDOWN */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 dark:bg-[#0E131F]/98 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left divide-y divide-slate-100 dark:divide-zinc-800/80 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[75vh] sm:max-h-[500px] overflow-y-auto custom-scrollbar">
          
          {/* SECTION 1: MATCHING PRODUCTS WITH THUMBNAILS (When searching) */}
          {searchQuery.trim().length > 0 && matchingProducts.length > 0 && (
            <div className="p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between px-1 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>{language === 'en' ? 'Products' : 'ምርቶች'}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {matchingProducts.length} {language === 'en' ? 'matches' : 'ተገኝተዋል'}
                </span>
              </div>

              <div className="space-y-1">
                {matchingProducts.map((prod) => (
                  <button
                    key={`ac-prod-${prod.id}`}
                    type="button"
                    onClick={() => handleSelectProduct(prod)}
                    className="w-full flex items-center justify-between gap-3 p-2 sm:p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-all cursor-pointer group text-left border border-transparent hover:border-slate-200/60 dark:hover:border-zinc-700/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Product Thumbnail */}
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200/80 dark:border-zinc-700/80 shadow-2xs">
                        <img
                          src={prod.image}
                          alt={prod.nameEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 block truncate group-hover:text-[#0052FF] dark:group-hover:text-blue-400 transition-colors">
                          {language === 'en' ? prod.nameEn : prod.nameAm}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                          <span className="font-bold text-slate-700 dark:text-zinc-300">{prod.brand}</span>
                          <span>•</span>
                          <span className="truncate">{prod.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-xs sm:text-sm text-slate-950 dark:text-white">
                        {prod.price.toLocaleString()} ETB
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0052FF] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: RECENT SEARCHES */}
          {recentSearches.length > 0 && (
            <div className="p-3 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between px-1 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'en' ? 'Recent Searches' : 'የቅርብ ጊዜ ፍለጋዎች'}</span>
                </span>
                <button
                  type="button"
                  onClick={clearAllRecent}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{language === 'en' ? 'Clear' : 'አጽዳ'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {recentSearches.map((term, idx) => (
                  <span
                    key={`recent-${idx}`}
                    onClick={() => executeSearch(term)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-zinc-300 hover:text-[#0052FF] dark:hover:text-blue-400 text-xs font-bold transition-all cursor-pointer border border-slate-200/70 dark:border-zinc-700/60 shadow-2xs"
                  >
                    <Clock className="w-3 h-3 text-slate-400 group-hover:text-[#0052FF]" />
                    <span className="whitespace-nowrap">{term}</span>
                    <button
                      type="button"
                      onClick={(e) => removeRecentItem(e, term)}
                      className="p-0.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: CATEGORY SUGGESTIONS */}
          <div className="p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between px-1 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'en' ? 'Category Suggestions' : 'የምድብ ጥቆማዎች'}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {matchingCategories.slice(0, 6).map((cat) => {
                const CatIcon = getCategoryIcon(cat.id);
                return (
                  <button
                    key={`sugg-cat-${cat.id}`}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 dark:bg-zinc-850 dark:hover:bg-blue-950/30 border border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:text-[#0052FF] dark:hover:text-blue-400 text-xs font-bold transition-all cursor-pointer group text-left shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-500 group-hover:text-[#0052FF] shadow-2xs border border-slate-200/60 dark:border-zinc-700/60">
                      <CatIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate whitespace-nowrap">
                      {language === 'en' ? cat.nameEn : cat.nameAm}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: PRESS ENTER / VIEW ALL RESULTS */}
          {searchQuery.trim().length > 0 && (
            <div className="p-3 bg-slate-50/80 dark:bg-zinc-950/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => executeSearch(searchQuery)}
                className="w-full flex items-center justify-between text-xs sm:text-sm font-black text-[#0052FF] dark:text-blue-400 hover:underline p-1 cursor-pointer"
              >
                <span>
                  {language === 'en'
                    ? `See all results for "${searchQuery}"`
                    : `ሁሉንም የ"${searchQuery}" ውጤቶች ይመልከቱ`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

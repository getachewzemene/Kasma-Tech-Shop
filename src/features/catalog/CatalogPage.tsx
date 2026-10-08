import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../../components/ProductCard';
import { Product } from '../../types';
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  Sparkles, 
  Laptop, 
  Smartphone, 
  Headphones, 
  Watch, 
  Gamepad2, 
  Camera, 
  Layers, 
  Zap,
  ArrowUpDown
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    products, 
    categories, 
    language, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    addToCart,
    favorites,
    toggleFavorite,
    showToast
  } = useShop();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Extract unique brands from approved products
  const availableBrands = useMemo(() => {
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return ['all', ...brands];
  }, [products]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status === 'APPROVED' || !p.status);

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameAm.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      default:
        // featured
        break;
    }

    return result;
  }, [products, selectedCategory, selectedBrand, searchQuery, sortBy]);

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'mobiles': return <Smartphone className="w-4 h-4" />;
      case 'computers': return <Laptop className="w-4 h-4" />;
      case 'headphones': return <Headphones className="w-4 h-4" />;
      case 'smartwatches': return <Watch className="w-4 h-4" />;
      case 'gaming': return <Gamepad2 className="w-4 h-4" />;
      case 'cameras': return <Camera className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-zinc-950 text-white p-8 sm:p-12 shadow-xl border border-blue-800/40">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{language === 'en' ? 'Flagship Tech Marketplace' : 'የኢትዮጵያ ቴክኖሎጂ መገበያያ'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {language === 'en'
              ? 'Genuine Electronics. Delivered in Hours.'
              : 'ኦሪጅናል የቴክኖሎጂ እቃዎች። በሰዓታት ውስጥ ይደርሳል።'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
            {language === 'en'
              ? 'Explore factory sealed smartphones, high-performance laptops, noise-canceling headphones, and gaming consoles with official warranty & verified Telebirr escrow.'
              : 'በፋብሪካው የታሸጉ ስልኮች፣ ላፕቶፖች፣ የጆሮ ማዳመጫዎች እና የጨዋታ ኮንሶሎች በኦፊሴላዊ ዋስትና እና በቴሌብር ክፍያ ያግኙ።'}
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Pills Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            {language === 'en' ? 'Browse Categories' : 'የምድብ ምርጫ'}
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            {filteredProducts.length} {language === 'en' ? 'items available' : 'እቃዎች አሉ'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'All Products' : 'ሁሉም እቃዎች'}</span>
          </button>

          {categories.map(cat => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0052FF] text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{language === 'en' ? cat.nameEn : cat.nameAm}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Bar: Search feedback, Brand Filter & Sorting */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800">
        <div className="flex items-center gap-2 flex-wrap">
          {searchQuery && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 text-xs font-bold">
              <Search className="w-3.5 h-3.5" />
              <span>"{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery('')}
                className="hover:opacity-75 cursor-pointer ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-zinc-800 border border-transparent text-gray-700 dark:text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">{language === 'en' ? 'All Brands' : 'ሁሉም ብራንዶች'}</option>
            {availableBrands.filter(b => b !== 'all').map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">
            {language === 'en' ? 'Sort by:' : 'አደራድር፡'}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-zinc-800 border border-transparent text-gray-700 dark:text-zinc-300 outline-none cursor-pointer"
          >
            <option value="featured">{language === 'en' ? 'Featured / Popular' : 'ተወዳጅ'}</option>
            <option value="price-asc">{language === 'en' ? 'Price: Low to High' : 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ'}</option>
            <option value="price-desc">{language === 'en' ? 'Price: High to Low' : 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ'}</option>
            <option value="rating">{language === 'en' ? 'Highest Rated' : 'ከፍተኛ ደረጃ የተሰጠው'}</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-800">
          <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">
            {language === 'en' ? 'No products match your search or filter.' : 'ምንም የተገኘ እቃ የለም።'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedBrand('all');
            }}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-200 hover:bg-gray-200 transition-colors"
          >
            {language === 'en' ? 'Reset All Filters' : 'ሁሉንም ምርጫዎች መልስ'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              language={language}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
              onOpenProduct={(p) => navigate(`/product/${p.id}`)}
              onAddToCart={(p, v, q) => addToCart(p, v?.sku, q)}
              onInstantBuy={(p, v, q) => {
                addToCart(p, v?.sku, q);
                navigate('/checkout');
              }}
              showToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
};

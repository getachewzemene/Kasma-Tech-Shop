import React from 'react';
import {
  Gamepad2, Laptop, Camera, Tv, Watch, Smartphone, Headphones, Cpu,
  Layers, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import { Product } from '../../types';

interface CategoryNavSectionProps {
  approvedProducts: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  isCategoriesExpanded: boolean;
  setIsCategoriesExpanded: (expanded: boolean) => void;
  language: 'en' | 'am';
}

const ALL_CATEGORIES = [
  { id: 'computers', nameEn: 'Computers', nameAm: 'ላፕቶፕ', icon: Laptop, iconColor: 'text-blue-500', bgGlow: 'group-hover:bg-blue-500/10' },
  { id: 'mobiles', nameEn: 'Phones', nameAm: 'ሞባይል', icon: Smartphone, iconColor: 'text-purple-500', bgGlow: 'group-hover:bg-purple-500/10' },
  { id: 'headphones', nameEn: 'Headphones', nameAm: 'ማዳመጫ', icon: Headphones, iconColor: 'text-cyan-500', bgGlow: 'group-hover:bg-cyan-500/10' },
  { id: 'gaming', nameEn: 'Gaming', nameAm: 'ጌሚንግ', icon: Gamepad2, iconColor: 'text-rose-500', bgGlow: 'group-hover:bg-rose-500/10' },
  { id: 'smartwatches', nameEn: 'Watches', nameAm: 'ስማርት ሰዓት', icon: Watch, iconColor: 'text-emerald-500', bgGlow: 'group-hover:bg-emerald-500/10' },
  { id: 'cameras', nameEn: 'Cameras', nameAm: 'ካሜራ', icon: Camera, iconColor: 'text-amber-500', bgGlow: 'group-hover:bg-amber-500/10' },
  { id: 'television', nameEn: 'TV & Video', nameAm: 'ቴሌቪዥን', icon: Tv, iconColor: 'text-indigo-500', bgGlow: 'group-hover:bg-indigo-500/10' },
  { id: 'accessories', nameEn: 'Accessories', nameAm: 'መለዋወጫ', icon: Cpu, iconColor: 'text-teal-500', bgGlow: 'group-hover:bg-teal-500/10' }
];

export const CategoryNavSection: React.FC<CategoryNavSectionProps> = ({
  approvedProducts,
  selectedCategory,
  setSelectedCategory,
  isCategoriesExpanded,
  setIsCategoriesExpanded,
  language
}) => {
  const categoryCounts: Record<string, number> = {};
  approvedProducts.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const populatedCategories = ALL_CATEGORIES.filter(dept => (categoryCounts[dept.id] || 0) > 0).sort(
    (a, b) => (categoryCounts[b.id] || 0) - (categoryCounts[a.id] || 0)
  );
  const activeCategories = populatedCategories.length > 0 ? populatedCategories : ALL_CATEGORIES;

  const formatCount = (count: number) => {
    if (language === 'en') {
      return `${count} ${count === 1 ? 'item' : 'items'}`;
    }
    return `${count} ${count === 1 ? 'ዕቃ' : 'ዕቃዎች'}`;
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('products-grid-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16">
      <div className="w-full">
        {/* Category Header with Title, Dynamic Count & Reset */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
          <div className="flex items-center gap-2">
            <div className="p-1 sm:p-1.5 rounded-lg bg-[#0052FF]/10 text-[#0052FF] dark:bg-blue-500/15 dark:text-blue-400">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">
              {language === 'en' ? 'Shop by Category' : 'በምድብ ይግዙ'}
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200/80 dark:border-zinc-700">
              {activeCategories.length}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold text-[#0052FF] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 transition-all hover:scale-102"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'en' ? 'Clear Filter' : 'ሁሉንም አሳይ'}</span>
              </button>
            )}

            {/* Mobile View Toggle: Compact Horizontal Scroll Rail vs Expanded Grid */}
            <button
              type="button"
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="md:hidden text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-[#0052FF] dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200/70 dark:hover:bg-zinc-700 transition-colors"
              title={isCategoriesExpanded ? 'Collapse into scrollable rail' : 'Expand all categories'}
            >
              <span>
                {isCategoriesExpanded
                  ? (language === 'en' ? 'Compact' : 'ያነሱ')
                  : `${language === 'en' ? 'View Grid' : 'ሁሉንም'} (${activeCategories.length})`}
              </span>
              {isCategoriesExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#0052FF]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#0052FF]" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE DEFAULT: Ultra-Compact Single-Row Horizontal Scrolling Rail */}
        <div className={`${isCategoriesExpanded ? 'hidden' : 'flex md:hidden'} items-center gap-2 overflow-x-auto no-scrollbar scrollbar-touch py-1 px-0.5`}>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              scrollToCatalog();
            }}
            className={`inline-flex items-center gap-2 px-3.5 min-h-[44px] h-11 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border cursor-pointer active:scale-95 ${selectedCategory === 'all'
              ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-sm shadow-blue-500/25 ring-2 ring-[#0052FF]/30'
              : 'bg-white dark:bg-zinc-900 border-gray-200/90 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 hover:border-[#0052FF]/50'
              }`}
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'en' ? 'All' : 'ሁሉም'}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}>
              {approvedProducts.length}
            </span>
          </button>

          {activeCategories.map((dept) => {
            const DeptIcon = dept.icon;
            const isSelected = selectedCategory === dept.id;
            const count = categoryCounts[dept.id] || 0;

            return (
              <button
                key={`mobile-rail-${dept.id}`}
                type="button"
                onClick={() => {
                  setSelectedCategory(isSelected ? 'all' : dept.id);
                  scrollToCatalog();
                }}
                className={`inline-flex items-center gap-2 px-3.5 min-h-[44px] h-11 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-all border cursor-pointer active:scale-95 ${isSelected
                  ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-sm shadow-blue-500/25 ring-2 ring-[#0052FF]/30 scale-[1.02]'
                  : 'bg-white dark:bg-zinc-900 border-gray-200/90 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 hover:border-[#0052FF]/50'
                  }`}
              >
                <DeptIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : dept.iconColor}`} />
                <span>{language === 'en' ? dept.nameEn : dept.nameAm}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* GRID VIEW */}
        <div
          className={`w-full ${isCategoriesExpanded
            ? 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4'
            : 'hidden md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4'
            }`}
        >
          {activeCategories.map((dept) => {
            const DeptIcon = dept.icon;
            const isSelected = selectedCategory === dept.id;
            const count = categoryCounts[dept.id] || 0;

            return (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedCategory(isSelected ? 'all' : dept.id);
                  scrollToCatalog();
                }}
                className={`relative w-full flex flex-col items-center justify-center p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 group cursor-pointer focus:outline-none min-h-[72px] sm:min-h-[86px] md:min-h-[100px] text-center ${isSelected
                  ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-lg shadow-blue-500/25 ring-2 ring-[#0052FF]/30 -translate-y-1'
                  : 'bg-white dark:bg-zinc-900 border-gray-200/90 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 hover:border-[#0052FF]/70 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1'
                  }`}
              >
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center mb-1.5 transition-all duration-300 ${isSelected
                    ? 'bg-white/20 text-white shadow-inner'
                    : `bg-gray-100 dark:bg-zinc-800 ${dept.iconColor} ${dept.bgGlow} group-hover:scale-110 shadow-xs`
                    }`}
                >
                  <DeptIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
                </div>

                <span
                  className={`text-sm sm:text-[15px] md:text-base font-extrabold leading-tight tracking-tight whitespace-nowrap truncate max-w-full px-0.5 ${isSelected
                    ? 'text-white'
                    : 'text-gray-900 dark:text-zinc-100 group-hover:text-[#0052FF] dark:group-hover:text-blue-400'
                    }`}
                >
                  {language === 'en' ? dept.nameEn : dept.nameAm}
                </span>

                <span
                  className={`text-xs sm:text-sm font-medium leading-none mt-1 ${isSelected
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-zinc-300'
                    }`}
                >
                  {formatCount(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

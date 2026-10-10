import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Scale, ArrowRight, X, Trash2 } from 'lucide-react';

export const FloatingCompareDock: React.FC = () => {
  const { 
    comparedProductIds, 
    products, 
    language, 
    clearCompare, 
    removeFromCompare, 
    setIsCompareModalOpen 
  } = useShop();

  if (comparedProductIds.length === 0) return null;

  const comparedProducts = comparedProductIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  const isFull = comparedProductIds.length >= 2;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl animate-fade-in-up">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200/90 dark:border-zinc-750/90 rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
        {/* Device Badges Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0052FF] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Scale className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
                {language === 'en' ? 'Side-by-Side Comparison' : 'ጎን ለጎን ማነጻጸሪያ'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isFull 
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
              }`}>
                {comparedProductIds.length} / 2
              </span>
            </div>

            <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">
              {isFull 
                ? (language === 'en' ? '2 devices ready to compare side-by-side' : '2 እቃዎች ተመርጠዋል')
                : (language === 'en' ? 'Pick 1 more laptop or smartphone' : '1 ተጨማሪ እቃ ይምረጡ')}
            </p>
          </div>
        </div>

        {/* Selected Product Thumbnails */}
        <div className="flex items-center -space-x-2 shrink-0">
          {comparedProducts.map((p) => (
            <div 
              key={p!.id} 
              className="relative group w-9 h-9 rounded-full border-2 border-white dark:border-zinc-800 bg-white dark:bg-zinc-800 overflow-hidden shadow-xs shrink-0"
              title={language === 'en' ? p!.nameEn : p!.nameAm}
            >
              <img 
                src={p!.image} 
                alt={p!.nameEn} 
                className="w-full h-full object-cover" 
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCompare(p!.id);
                }}
                className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] cursor-pointer"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title={language === 'en' ? 'Clear' : 'አጽዳ'}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>{language === 'en' ? 'Compare' : 'አነጻጽር'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

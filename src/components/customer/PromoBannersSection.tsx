import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { LazyImage } from '../LazyImage';

interface PromoBannersSectionProps {
  approvedProducts: Product[];
  language: 'en' | 'am';
  onOpenProduct: (product: Product) => void;
  setSelectedCategory: (category: string) => void;
}

export const PromoBannersSection: React.FC<PromoBannersSectionProps> = ({
  approvedProducts,
  language,
  onOpenProduct,
  setSelectedCategory
}) => {
  const scrollToCatalog = () => {
    const el = document.getElementById('products-grid-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
      {/* Large Marshall Banner */}
      <div
        onClick={() => {
          const spProd = approvedProducts.find(p => p.id === 'p4');
          if (spProd) onOpenProduct(spProd);
        }}
        className="lg:col-span-7 bg-gradient-to-br from-[#003B46] via-[#07575B] to-[#001F24] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 flex flex-row justify-between items-center overflow-hidden border border-cyan-500/20 dark:border-zinc-800 hover:border-cyan-400/40 dark:hover:border-zinc-700 transition-all min-h-[190px] sm:min-h-[220px] md:min-h-[250px] relative group cursor-pointer shadow-lg"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />

        <div className="space-y-2.5 sm:space-y-4 z-10 text-left max-w-[58%] xs:max-w-[54%] sm:max-w-xs md:max-w-sm relative [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
          <span className="text-xs font-bold text-amber-300 bg-black/60 border border-white/15 px-2.5 py-1 rounded-lg w-fit block shadow-sm backdrop-blur-xs">
            {language === 'en' ? 'Rewards Club' : 'ሽልማት ያግኙ'}
          </span>
          <div className="space-y-1">
            <h2 className="text-base sm:text-2xl md:text-3xl font-black font-sans text-white leading-tight drop-shadow-md">
              {language === 'en' ? 'Super Cheap Price' : 'እጅግ ቅናሽ ዋጋ'}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/90 dark:text-zinc-200 font-medium line-clamp-2 sm:line-clamp-none leading-relaxed">
              {language === 'en' ? 'Earn 20% Back in Rewards points to spend on accessories' : 'አሁን ሲገዙ ተጨማሪ የ20% ነጥብ ያግኙ'}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const spProd = approvedProducts.find(p => p.id === 'p4');
              if (spProd) onOpenProduct(spProd);
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-gray-100 active:scale-95 text-black font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg inline-flex items-center gap-1.5 cursor-pointer mt-1"
          >
            <span>{language === 'en' ? 'Shop Now' : 'አሁን ይግዙ'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-1/2 h-[350px] w-[350px] -translate-y-1/2 rounded-full blur-3xl bg-cyan-400/20" />

        <div className="absolute inset-y-0 right-0 z-0 block h-full w-[65%] sm:w-[60%] md:w-[56%] overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 [&_img]:absolute [&_img]:inset-0 [&_img]:h-full [&_img]:w-full [&_img]:max-w-none [&_img]:object-cover [&_img]:object-center"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 30%, #000 60%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 30%, #000 60%)'
            }}
          >
            <LazyImage
              src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80"
              alt="Marshall Speaker"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              containerClassName="h-full w-full !bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Small Banners Side Panel */}
      <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-2 sm:gap-4 lg:gap-6">
        {/* Row 1: Power Bank */}
        <div className="bg-gray-100 dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex justify-between items-center border border-gray-150 dark:border-zinc-800 min-h-[85px] sm:min-h-[100px] hover:border-gray-250 transition-all relative group overflow-hidden">
          <div className="space-y-0.5 sm:space-y-1 text-left z-10 max-w-[62%] sm:max-w-[65%] min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-50 line-clamp-2 leading-tight">{language === 'en' ? 'Charger Power Bank' : 'ፖርቴብል ቻርጀር'}</h4>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 font-medium line-clamp-1">{language === 'en' ? 'Starting at 2,400 ETB' : 'ዋጋው ከ 2,400 ብር ጀምሮ'}</p>
            <button onClick={() => { setSelectedCategory('accessories'); scrollToCatalog(); }} className="text-xs font-bold text-[#0052FF] hover:underline block pt-0.5 sm:pt-1 cursor-pointer">{language === 'en' ? 'Discover »' : 'ይጎብኙ »'}</button>
          </div>
          <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200/80 dark:border-zinc-700/80 shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
            <LazyImage
              src="https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=300&q=80"
              alt="Power bank"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Row 2: Controller for Switch */}
        <div className="bg-gray-100 dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex justify-between items-center border border-gray-150 dark:border-zinc-800 min-h-[85px] sm:min-h-[100px] hover:border-gray-250 transition-all relative group overflow-hidden">
          <div className="space-y-0.5 sm:space-y-1 text-left z-10 max-w-[62%] sm:max-w-[65%] min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-50 tracking-tight line-clamp-2 leading-tight">{language === 'en' ? 'Controller for Switch' : 'የስዊች ጌም መቆጣጠሪያ'}</h4>
            <p className="text-xs text-gray-400 font-bold line-clamp-1">{language === 'en' ? 'Discount 30% Off' : '30% ቅናሽ'}</p>
            <button onClick={() => { setSelectedCategory('gaming'); scrollToCatalog(); }} className="text-xs font-bold text-[#0052FF] underline block pt-0.5 sm:pt-1 cursor-pointer">{language === 'en' ? 'Discover »' : 'ይጎብኙ »'}</button>
          </div>
          <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200/80 dark:border-zinc-700/80 shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
            <LazyImage
              src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=300&q=80"
              alt="Nintendo Switch controller"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

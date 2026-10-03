import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, Variant } from '../types';
import { ProductCard } from './ProductCard';

interface AutoCarouselProps {
  titleEn: string;
  titleAm: string;
  subtitleEn: string;
  subtitleAm: string;
  products: Product[];
  badgeColor: 'red' | 'blue' | 'green' | 'amber' | 'indigo';
  badgeTextEn: string;
  badgeTextAm: string;
  onProductClick: (p: Product) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  comparedProductIds?: string[];
  onToggleCompare?: (id: string, e: React.MouseEvent) => void;
  language: 'en' | 'am';
  timeLeft?: { hours: number; minutes: number; seconds: number };
  autoScrollInterval?: number;
  onAddToCart?: (product: Product, variant: Variant, quantity?: number) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AutoCarousel: React.FC<AutoCarouselProps> = ({
  titleEn,
  titleAm,
  subtitleEn,
  subtitleAm,
  products,
  badgeColor,
  badgeTextEn,
  badgeTextAm,
  onProductClick,
  favorites,
  onToggleFavorite,
  comparedProductIds = [],
  onToggleCompare,
  language,
  timeLeft,
  autoScrollInterval = 6500,
  onAddToCart,
  showToast
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || products.length <= 1) return;

    let intervalId: NodeJS.Timeout;

    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (!container) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const card = container.querySelector('.carousel-card');
          const cardWidth = card?.clientWidth || 160;
          const gap = 12;
          container.scrollBy({ left: (cardWidth + gap) * 2, behavior: 'smooth' });
        }
      }, autoScrollInterval);
    };

    startAutoScroll();

    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = startAutoScroll;

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [products, autoScrollInterval]);

  const scrollLeft = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cardWidth = container.querySelector('.carousel-card')?.clientWidth || 160;
      container.scrollBy({ left: -(cardWidth + 12), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cardWidth = container.querySelector('.carousel-card')?.clientWidth || 160;
      container.scrollBy({ left: cardWidth + 12, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  const dotClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-600'
  };

  return (
    <div className="border-0 sm:border border-gray-150 dark:border-zinc-800 rounded-none sm:rounded-3xl bg-transparent sm:bg-white dark:sm:bg-zinc-900 p-0 sm:p-5 shadow-none sm:shadow-xs w-full max-w-full overflow-hidden">
      {/* Container Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-2.5 pb-2 sm:pb-4 mb-1 sm:mb-0 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${dotClasses[badgeColor]} animate-pulse shrink-0`} />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-950 dark:text-white leading-tight truncate">
                {language === 'en' ? titleEn : titleAm}
              </h3>
            </div>
          </div>

          {badgeColor === 'red' && timeLeft && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-0 sm:pl-4 border-l-0 sm:border-l border-gray-200 dark:border-zinc-850 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                {language === 'en' ? 'Ends in:' : 'የቀረው ጊዜ:'}
              </span>
              <div className="flex items-center gap-1 font-mono">
                <span className="bg-black text-white dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-black text-[11px] sm:text-xs text-center min-w-[24px] sm:min-w-[28px]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-gray-400 font-bold text-xs">:</span>
                <span className="bg-black text-white dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-black text-[11px] sm:text-xs text-center min-w-[24px] sm:min-w-[28px]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-gray-400 font-bold text-xs">:</span>
                <span className="bg-black text-white dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-black text-[11px] sm:text-xs text-center min-w-[24px] sm:min-w-[28px] text-red-500 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-1.5 self-end sm:self-auto shrink-0 mt-0.5 sm:mt-0">
          <button 
            type="button"
            onClick={scrollLeft} 
            className="p-1 sm:p-1.5 rounded-full border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button 
            type="button"
            onClick={scrollRight} 
            className="p-1 sm:p-1.5 rounded-full border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div 
        ref={containerRef}
        className="flex gap-2.5 sm:gap-5 overflow-x-auto pb-1.5 pt-1.5 sm:pt-3 px-0.5 no-scrollbar scrollbar-none scroll-smooth snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((p) => {
          const isFavorite = favorites.includes(p.id);
          const isCompared = comparedProductIds.includes(p.id);

          return (
            <ProductCard
              key={p.id}
              product={p}
              language={language}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              isCompared={isCompared}
              onToggleCompare={onToggleCompare}
              onOpenProduct={onProductClick}
              onQuickView={onProductClick}
              onAddToCart={onAddToCart}
              showToast={showToast}
              badgeText={undefined}
              badgeColor={badgeColor}
              layout="carousel"
              className="carousel-card"
            />
          );
        })}
      </div>
    </div>
  );
};

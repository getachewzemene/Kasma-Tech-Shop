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
        if (maxScroll <= 5) return;
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

  const isGridOnDesktop = products.length <= 4;

  return (
    <div className="w-full max-w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full ${dotClasses[badgeColor]} animate-pulse shrink-0`} />
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-gray-950 dark:text-white leading-tight truncate">
              {language === 'en' ? titleEn : titleAm}
            </h3>
            {subtitleEn && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate hidden sm:block mt-0.5">
                {language === 'en' ? subtitleEn : subtitleAm}
              </p>
            )}
          </div>

          {badgeColor === 'red' && timeLeft && (
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-3 border-l border-gray-200 dark:border-zinc-800 shrink-0">
              <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                {language === 'en' ? 'Ends in:' : 'የቀረው ጊዜ:'}
              </span>
              <div className="flex items-center gap-1 font-mono">
                <span className="bg-black text-white dark:bg-zinc-800 px-1.5 py-0.5 rounded font-black text-xs text-center min-w-[24px]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-gray-400 font-bold text-xs">:</span>
                <span className="bg-black text-white dark:bg-zinc-800 px-1.5 py-0.5 rounded font-black text-xs text-center min-w-[24px]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-gray-400 font-bold text-xs">:</span>
                <span className="bg-black text-white dark:bg-zinc-800 px-1.5 py-0.5 rounded font-black text-xs text-center min-w-[24px] text-red-500 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Arrows */}
        <div className={`flex gap-1.5 shrink-0 ${isGridOnDesktop ? 'lg:hidden' : ''}`}>
          <button 
            type="button"
            onClick={scrollLeft} 
            className="p-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={scrollRight} 
            className="p-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors cursor-pointer shadow-xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div 
        ref={containerRef}
        className={`flex ${isGridOnDesktop ? 'lg:grid lg:grid-cols-4 lg:overflow-visible' : ''} items-stretch gap-3 sm:gap-4 lg:gap-5 overflow-x-auto pb-1.5 pt-1 px-0.5 no-scrollbar scrollbar-none scroll-smooth snap-x snap-mandatory w-full`}
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

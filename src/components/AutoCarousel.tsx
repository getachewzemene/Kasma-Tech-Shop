import React from 'react';
import { Product, Variant } from '../types';
import { ProductCard } from './ProductCard';
import { SectionHeader } from './SectionHeader';

interface AutoCarouselProps {
  titleEn: string;
  titleAm: string;
  subtitleEn?: string;
  subtitleAm?: string;
  products: Product[];
  badgeColor?: 'red' | 'blue' | 'green' | 'amber' | 'indigo';
  badgeTextEn?: string;
  badgeTextAm?: string;
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
  onViewAll?: () => void;
  viewAllText?: string;
}

export const AutoCarousel: React.FC<AutoCarouselProps> = ({
  titleEn,
  titleAm,
  subtitleEn,
  subtitleAm,
  products,
  badgeColor = 'indigo',
  onProductClick,
  favorites,
  onToggleFavorite,
  comparedProductIds = [],
  onToggleCompare,
  language,
  timeLeft,
  onAddToCart,
  showToast,
  onViewAll,
  viewAllText
}) => {
  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-full">
      {/* Unified Section Header */}
      <SectionHeader
        titleEn={titleEn}
        titleAm={titleAm}
        subtitleEn={subtitleEn}
        subtitleAm={subtitleAm}
        language={language}
        onViewAll={onViewAll}
        viewAllText={viewAllText}
        rightContent={
          timeLeft ? (
            <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">
                {language === 'en' ? 'Ends in:' : 'የቀረው:'}
              </span>
              <span className="bg-black text-white dark:bg-zinc-800 px-1.5 py-0.5 rounded font-black text-xs">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          ) : undefined
        }
      />

      {/* Responsive Layout: Horizontal-scroll product row on mobile (<sm), balanced grid on desktop (>=sm) */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch w-full min-w-0 overflow-x-auto sm:overflow-visible no-scrollbar pb-2.5 sm:pb-0 snap-x snap-mandatory touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {products.slice(0, 8).map((p) => {
          const isFavorite = favorites.includes(p.id);
          const isCompared = comparedProductIds.includes(p.id);

          return (
            <div key={p.id} className="w-[170px] xs:w-[195px] sm:w-auto shrink-0 snap-start sm:shrink flex flex-col">
              <ProductCard
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
                layout="grid"
                className="w-full h-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';

interface GridContainerProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto-fill';
  gap?: 'tight' | 'normal' | 'spacious';
  className?: string;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  cols = 'auto-fill',
  gap = 'normal',
  className = ''
}) => {
  const gapClasses = {
    tight: 'gap-1.5 sm:gap-3',
    normal: 'gap-2 sm:gap-4',
    spacious: 'gap-2 sm:gap-4.5'
  };

  const colClasses: Record<string | number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    'auto-fill': 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  };

  const gridClass = cols === 'auto-fill' || className.includes('grid-cols-[')
    ? (className.includes('grid-cols-[') ? className : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4')
    : (colClasses[cols] || colClasses[4]);

  return (
    <div className={`grid ${gridClass} ${gapClasses[gap]} w-full max-w-full min-w-0 ${className}`}>
      {children}
    </div>
  );
};

interface CarouselContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const CarouselContainer: React.FC<CarouselContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none scroll-smooth snap-x snap-mandatory w-full max-w-full min-w-0 ${className}`}>
      {children}
    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package } from 'lucide-react';
import { Shimmer } from './Skeletons';

// A persistent global client-side cache of successfully loaded image URLs to bypass loaders on revisit
const loadedImagesCache = new Set<string>();

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(() => loadedImagesCache.has(src));
  const [isInView, setIsInView] = useState<boolean>(() => loadedImagesCache.has(src));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    if (loadedImagesCache.has(src)) {
      setIsLoaded(true);
      setIsInView(true);
      return;
    }

    if ('IntersectionObserver' in window && containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '100px' }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, [src]);

  const handleLoadComplete = () => {
    loadedImagesCache.add(imgSrc);
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGE);
      setIsLoaded(true);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden w-full h-full ${containerClassName}`}
    >
      <AnimatePresence mode="popLayout">
        {!isLoaded && (
          <motion.div
            key="shimmer-placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/50 dark:bg-zinc-800/40"
          >
            <Shimmer className="w-full h-full rounded-none" />
            <Package className="w-6 h-6 text-gray-300 dark:text-zinc-600 absolute opacity-30 animate-pulse pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {isInView && (
        <motion.img
          src={imgSrc}
          alt={alt}
          initial={loadedImagesCache.has(imgSrc) ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onLoad={handleLoadComplete}
          onError={handleError}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

// Convenient alias for semantic readability across all components
export const ShimmerImage = LazyImage;


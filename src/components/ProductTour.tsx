import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  ShoppingBag, 
  X, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  titleEn: string;
  titleAm: string;
  subtitleEn: string;
  subtitleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  actionTextEn?: string;
  actionTextAm?: string;
  onAction?: () => void;
}

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
  onOpenQrScanner?: () => void;
  onOpenEscrowInfo?: () => void;
}

export default function ProductTour({
  isOpen,
  onClose,
  language,
  onOpenQrScanner,
  onOpenEscrowInfo
}: ProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = useMemo(() => [
    {
      id: 'welcome',
      targetId: 'tour-welcome-banner',
      titleEn: 'Welcome to Kasma Shop',
      titleAm: 'እንኳን ወደ ካስማ ሾፕ በደህና መጡ',
      subtitleEn: 'Hybrid Physical & Digital Marketplace',
      subtitleAm: 'የአካል መደብር እና የዲጂታል ገበያ ጥምረት',
      descriptionEn: 'Explore authentic electronics, laptops, and smartphones with instant Addis Ababa delivery, local bank escrow protections, and real-time stock verification.',
      descriptionAm: 'ኦሪጅናል የኤሌክትሮኒክስ፣ የላፕቶፕ እና የስልክ እቃዎችን በፈጣን የአዲስ አበባ ማድረሻ፣ በባንክ እግድ ጥበቃ እና በቅጽበት የእቃ ክምችት ማረጋገጫ ይግዙ።',
      icon: ShoppingBag,
      iconBg: 'bg-blue-100 dark:bg-blue-950/80',
      iconColor: 'text-[#0052FF] dark:text-blue-400'
    },
    {
      id: 'qr-scanner',
      targetId: 'tour-qr-scanner',
      titleEn: 'Instant Shelf QR & Barcode Scanner',
      titleAm: 'የመደብር QR እና ባርኮድ ማንበቢያ',
      subtitleEn: 'In-Store Physical Lookup & Serial Check',
      subtitleAm: 'በመደብር ውስጥ የእቃ እና የሴሪያል ቁጥር ማረጋገጫ',
      descriptionEn: 'Visiting our physical showroom? Scan any product shelf QR tag or serial barcode to immediately view live Addis Ababa stock, specifications, and place digital orders.',
      descriptionAm: 'በአካል መደብራችን ሲገኙ የምርቱን QR ኮድ ወይም ባርኮድ በማንበብ አሁናዊ የእቃ ብዛት፣ ዝርዝር መረጃዎችን ማየት እና ማዘዝ ይችላሉ።',
      icon: QrCode,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/80',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      actionTextEn: 'Try QR Scanner Now',
      actionTextAm: 'QR ማንበቢያውን አሁን ይሞክሩ',
      onAction: () => {
        if (onOpenQrScanner) {
          onOpenQrScanner();
        }
      }
    },
    {
      id: 'escrow-protection',
      targetId: 'tour-escrow-protection',
      titleEn: 'Safe Bank Escrow Protections',
      titleAm: 'የተጠበቀ የባንክ እና ቴሌብር ክፍያ ጥበቃ',
      subtitleEn: '100% Risk-Free Delivery & Inspection',
      subtitleAm: '100% አስተማማኝ የእቃ መረከቢያ ጥበቃ',
      descriptionEn: 'Your payment is locked in CBE or Telebirr Escrow. Funds are only released to the seller after you inspect your items upon courier delivery.',
      descriptionAm: 'ክፍያዎ በባንክ ወይም በቴሌብር እግድ (Escrow) ይጠበቃል። ገንዘቡ ለነጋዴው የሚለቀቀው እቃውን ተረክበው ሲያረጋግጡ ብቻ ነው።',
      icon: ShieldCheck,
      iconBg: 'bg-amber-100 dark:bg-amber-950/80',
      iconColor: 'text-amber-600 dark:text-amber-400',
      actionTextEn: 'View Escrow Terms',
      actionTextAm: 'የክፍያ ጥበቃ ደንቦችን ይመልከቱ',
      onAction: () => {
        if (onOpenEscrowInfo) {
          onOpenEscrowInfo();
        }
      }
    },
    {
      id: 'personalized-feed',
      targetId: 'tour-personalized-feed',
      titleEn: 'Personalized Smart Recommendations',
      titleAm: 'በእርስዎ ምርጫ የተበጀ ልዩ የምርት ዝርዝር',
      subtitleEn: '6 Real-Time Behavioral Signal Engine',
      subtitleAm: '6 የቀጥታ አሰሳ ታሪክ ምልክቶች',
      descriptionEn: 'Our recommendation algorithm analyzes 6 active signals (views, search queries, cart additions, wishlist, past orders, and category views) to tailor products specifically to your needs.',
      descriptionAm: 'የስርዓቱ ስልተ-ቀመር የእርስዎን የፍለጋ፣ የእይታ፣ የትዕዛዝ እና የምኞት ዝርዝር ታሪክ መሠረት በማድረግ ለየብቻ የተበጁ ምርቶችን ያቀርባል።',
      icon: Sparkles,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/80',
      iconColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'live-courier',
      targetId: 'tour-live-courier',
      titleEn: 'Live Courier Dispatch & Telegram Receipts',
      titleAm: 'የቀጥታ ሞተር መልእክተኛ መከታተያ እና የቴሌግራም ደረሰኝ',
      subtitleEn: 'Real-Time Delivery Visualizer',
      subtitleAm: 'የቀጥታ አዲስ አበባ የትራንስፖርት መከታተያ',
      descriptionEn: 'Track your motor courier in real time across all Addis Ababa sub-cities and automatically receive verified digital order receipts directly in your Telegram.',
      descriptionAm: 'ሞተር መልእክተኛውን በሁሉም የአዲስ አበባ ክፍለ ከተሞች በቀጥታ ካርታ ላይ ይከታተሉ እንዲሁም ዲጂታል ደረሰኞችን በቴሌግራምዎ ይቀበሉ።',
      icon: Truck,
      iconBg: 'bg-rose-100 dark:bg-rose-950/80',
      iconColor: 'text-rose-600 dark:text-rose-400'
    }
  ], [onOpenQrScanner, onOpenEscrowInfo]);

  const currentStep = steps[currentStepIndex] || steps[0];
  const targetId = currentStep?.targetId;

  // Update target bounding box on step change or scroll/resize
  const updateBoundingRect = useCallback(() => {
    if (!isOpen || !targetId) {
      setTargetRect(null);
      return;
    }

    const el = document.getElementById(targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(prev => {
        if (
          prev &&
          prev.top === rect.top &&
          prev.left === rect.left &&
          prev.width === rect.width &&
          prev.height === rect.height
        ) {
          return prev;
        }
        return rect;
      });
    } else {
      setTargetRect(null);
    }
  }, [isOpen, targetId]);

  useEffect(() => {
    if (!isOpen) return;

    updateBoundingRect();

    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }

    const handleScrollOrResize = () => {
      updateBoundingRect();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, currentStepIndex, targetId, updateBoundingRect]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      localStorage.setItem('kasma_tour_completed', 'true');
      onClose();
    }
  }, [currentStepIndex, steps.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  const IconComponent = currentStep.icon;

  // Calculate popover positioning relative to target or center screen fallback
  let popoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 60
  };

  if (targetRect) {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      popoverStyle = {
        position: 'fixed',
        bottom: '20px',
        left: '12px',
        right: '12px',
        zIndex: 60
      };
    } else if (spaceBelow > 260) {
      popoverStyle = {
        position: 'fixed',
        top: `${Math.min(targetRect.bottom + 14, window.innerHeight - 320)}px`,
        left: `${Math.max(16, Math.min(targetRect.left, window.innerWidth - 440))}px`,
        zIndex: 60
      };
    } else if (spaceAbove > 260) {
      popoverStyle = {
        position: 'fixed',
        top: `${Math.max(16, targetRect.top - 280)}px`,
        left: `${Math.max(16, Math.min(targetRect.left, window.innerWidth - 440))}px`,
        zIndex: 60
      };
    } else {
      popoverStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60
      };
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
        
        {/* Dark Dimmed Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        />

        {/* Target Element Highlight Box & Glow Ring */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed z-55 pointer-events-none rounded-2xl border-2 border-[#0052FF] dark:border-blue-400 bg-[#0052FF]/10 dark:bg-blue-500/15 shadow-[0_0_25px_rgba(0,82,255,0.4)] animate-pulse"
          />
        )}

        {/* Guided Tour Popover Card */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={popoverStyle}
          className="w-full max-w-[420px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden font-sans text-gray-900 dark:text-zinc-100"
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${currentStep.iconBg} ${currentStep.iconColor} shrink-0 shadow-xs`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block font-mono">
                  {language === 'en' ? `STEP ${currentStepIndex + 1} OF ${steps.length}` : `ደረጃ ${currentStepIndex + 1} ከ ${steps.length}`}
                </span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight font-sans">
                  {language === 'en' ? currentStep.titleEn : currentStep.titleAm}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title={language === 'en' ? 'Close Tour' : 'ጉብኝቱን ዝጋ'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtitle / Key Tag */}
          <div className="mb-2">
            <span className="inline-block text-[10.5px] font-bold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-gray-200/60 dark:border-zinc-700/60">
              {language === 'en' ? currentStep.subtitleEn : currentStep.subtitleAm}
            </span>
          </div>

          {/* Description Prose */}
          <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed font-medium mb-4">
            {language === 'en' ? currentStep.descriptionEn : currentStep.descriptionAm}
          </p>

          {/* Optional Direct Feature Action Button */}
          {currentStep.onAction && currentStep.actionTextEn && (
            <button
              type="button"
              onClick={() => {
                currentStep.onAction?.();
              }}
              className="w-full mb-3.5 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>{language === 'en' ? currentStep.actionTextEn : currentStep.actionTextAm}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Step Progress Dots & Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {steps.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentStepIndex 
                      ? 'w-6 bg-[#0052FF] dark:bg-blue-500' 
                      : 'w-1.5 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300'
                  }`}
                  aria-label={`Go to tour step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Back' : 'ተመለስ'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>
                  {currentStepIndex === steps.length - 1
                    ? (language === 'en' ? 'Got It!' : 'ተጠናቋል!')
                    : (language === 'en' ? 'Next →' : 'ቀጣይ →')}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </AnimatePresence>
  );
}

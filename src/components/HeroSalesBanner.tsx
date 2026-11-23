import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../types';
import {
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';
import { LazyImage } from './LazyImage';
import { getProductSpecs } from '../utils/productSpecs';

interface HeroSalesBannerProps {
  slide: Product;
  activeSlides: Product[];
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
  language: 'en' | 'am';
  onOpenProduct: (p: Product) => void;
  /** Time each slide stays on screen. Default 6000ms. */
  autoplayMs?: number;
}

type Lang = 'en' | 'am';

interface Campaign {
  brandTag: string;
  tagline: string;
  cta: string;
  /** RGB triplet used for the per-category glow, e.g. "99,102,241" */
  glow: string;
}

const CTA = (lang: Lang) => (lang === 'en' ? 'Shop now' : 'አሁኑኑ ይግዙ');

// Category-specific copy + glow color. Each category gets its own glow so the
// banner visibly changes personality from slide to slide.
const getSalesCampaign = (p: Product, lang: Lang): Campaign => {
  const cat = p.category || '';
  const lower = (p.nameEn || '').toLowerCase();

  if (
    cat === 'headphones' ||
    ['headphone', 'earbuds', 'sound', 'bose', 'sony'].some((k) => lower.includes(k))
  ) {
    return {
      brandTag: 'Audio',
      tagline: lang === 'en' ? 'Pure sound, audiophile grade' : 'ምርጥ የድምፅ ጥራት • ኦሪጅናል',
      cta: CTA(lang),
      glow: '139,92,246',
    };
  }
  if (cat === 'computers' || ['macbook', 'laptop', 'dell'].some((k) => lower.includes(k))) {
    return {
      brandTag: 'Computers',
      tagline: lang === 'en' ? 'Extreme performance for creators' : 'ከፍተኛ ብቃት • ለፈጣሪዎች የተዘጋጀ',
      cta: CTA(lang),
      glow: '6,182,212',
    };
  }
  if (cat === 'mobiles' || ['galaxy', 'iphone', 'phone'].some((k) => lower.includes(k))) {
    return {
      brandTag: 'Smartphones',
      tagline: lang === 'en' ? 'Flagship power with AMOLED and 5G' : 'የላቀ ስማርት ስልክ • AMOLED & 5G',
      cta: CTA(lang),
      glow: '37,99,235',
    };
  }
  if (cat === 'smartwatches' || lower.includes('watch')) {
    return {
      brandTag: 'Smartwatches',
      tagline: lang === 'en' ? 'Precision built for adventure' : 'ትክክለኛ ጀብዱ • ለስፖርት የተሰራ',
      cta: CTA(lang),
      glow: '16,185,129',
    };
  }
  if (cat === 'cameras' || ['camera', 'cctv'].some((k) => lower.includes(k))) {
    return {
      brandTag: 'CCTV & Cameras',
      tagline: lang === 'en' ? 'Sharp 4K vision, smart AI security' : 'የላቀ 4K ጥራት • አስተማማኝ ደህንነት',
      cta: CTA(lang),
      glow: '245,158,11',
    };
  }
  return {
    brandTag: 'Featured',
    tagline: lang === 'en' ? 'Authentic quality, verified stock' : 'ምርጥ ቴክኖሎጂ • የተረጋገጠ ጥራት',
    cta: CTA(lang),
    glow: '59,130,246',
  };
};

// Short spec chips (max 3)
const getSlideSpecChips = (p: Product, lang: Lang): string[] => {
  const specs = getProductSpecs(p);
  if (specs && specs.length > 0) {
    return specs.slice(0, 3).map((s) => {
      const val = lang === 'en' ? s.valueEn : s.valueAm;
      return val.split('(')[0].replace(/•.*/, '').trim();
    });
  }
  if (p.specs) {
    const chips: string[] = [];
    if (p.specs.display) chips.push(p.specs.display.split('(')[0].trim());
    if (p.specs.ram || p.specs.storage)
      chips.push(`${p.specs.ram || ''} ${p.specs.storage || ''}`.trim());
    if (p.specs.battery) chips.push(p.specs.battery.split('(')[0].trim());
    if (chips.length > 0) return chips.slice(0, 3);
  }
  return lang === 'en'
    ? ['Official warranty', 'Authentic brand', 'Fast delivery']
    : ['አስተማማኝ ዋስትና', 'ኦሪጅናል እቃ', 'ፈጣን ማድረሻ'];
};

const SWIPE_THRESHOLD = 50;

export const HeroSalesBanner: React.FC<HeroSalesBannerProps> = ({
  slide,
  activeSlides,
  currentSlide,
  setCurrentSlide,
  language,
  onOpenProduct,
  autoplayMs = 6000,
}) => {
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = activeSlides.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const goNext = () => setCurrentSlide((p) => (p + 1) % total);
  const goPrev = () => setCurrentSlide((p) => (p - 1 + total) % total);

  const campaign = getSalesCampaign(slide, language);
  const specChips = getSlideSpecChips(slide, language);
  const originalPrice = Math.round(slide.price * 1.15);
  const savingsAmount = originalPrice - slide.price;
  const discountPct = Math.round((savingsAmount / originalPrice) * 100);
  const productName = language === 'en' ? slide.nameEn : slide.nameAm || slide.nameEn;
  const autoplayOn = total > 1 && !reduceMotion;

  return (
    <section
      id="tour-welcome-banner"
      role="region"
      aria-roledescription="carousel"
      aria-label={language === 'en' ? 'Featured deals' : 'ልዩ ቅናሾች'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        setPaused(false);
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > SWIPE_THRESHOLD) (dx < 0 ? goNext : goPrev)();
      }}
      className="relative w-full max-w-none overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 text-white select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-2xl"
      style={{
        // Guard: stops any outside CSS (e.g. a #tour-welcome-banner rule) from insetting the banner
        width: '100%',
        maxWidth: 'none',
        marginLeft: 0,
        marginRight: 0,
        backgroundColor: '#050B18',
        backgroundImage:
          'radial-gradient(ellipse at 75% 40%, #0F2347 0%, #08142C 45%, #040814 100%)',
      }}
    >
      <style>{`
        @keyframes hero-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes hero-text-in  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes hero-img-in   { from { opacity: 0; transform: scale(.94) translateX(18px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .hero-anim { animation: none !important; }
        }
      `}</style>

      {/* Per-category ambient glow: color changes with each slide */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700"
        style={{ background: `radial-gradient(circle, rgba(${campaign.glow},0.35) 0%, transparent 65%)` }}
      />

      {/* Live region so screen readers hear slide changes */}
      <div className="sr-only" aria-live={paused ? 'polite' : 'off'}>
        {`${currentSlide + 1} / ${total}: ${productName}`}
      </div>

      {/* Static Top-Left Corner Badge & Brand: Exactly aligned with text column and progress bar */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-6 md:top-6 md:left-12 lg:top-7 lg:left-14 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold sm:gap-1.5 sm:px-3 sm:py-1 sm:text-sm shadow-md">
          <Zap className="h-3 w-3 fill-white sm:h-4 sm:w-4" />
          {language === 'en' ? `Limited offer · -${discountPct}%` : `ልዩ ቅናሽ · -${discountPct}%`}
        </span>
        <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-slate-200 backdrop-blur-xs px-2.5 py-0.5 rounded-full bg-black/35 border border-white/10 shadow-xs">
          Kasma · {campaign.brandTag}
        </span>
      </div>

      <div
        key={currentSlide}
        className="relative z-10 flex min-h-[200px] flex-row sm:min-h-0 sm:h-[300px] sm:items-center md:h-[400px] lg:h-[420px]"
      >
        {/* ---------- Text column (clean content flow with matching left alignment and comfortable top spacing) ---------- */}
        <div className="hero-anim relative z-10 flex w-[54%] flex-col [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] items-start justify-start pt-11 pb-8 sm:justify-center sm:w-[55%] sm:gap-3 px-3 sm:px-6 sm:pb-12 sm:pt-14 md:gap-3.5 md:py-8 md:pl-12 md:pr-6 lg:pl-14 [animation:hero-text-in_500ms_ease-out_both]">
          <div className="w-full">
            <h2 className="line-clamp-2 text-base font-black leading-snug tracking-tight sm:text-3xl sm:leading-tight lg:text-4xl">
              {productName}
            </h2>
            <p className="mt-1 line-clamp-1 hidden text-sm font-medium text-slate-300 sm:block sm:text-base">
              {campaign.tagline}
            </p>
          </div>

          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {specChips.map((chip, idx) => (
              <span
                key={`hero-chip-${idx}`}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-slate-100 backdrop-blur-sm"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {slide.price.toLocaleString()}
              <span className="ml-1 text-xs font-semibold text-slate-300 sm:ml-1.5 sm:text-lg">ETB</span>
            </span>
            <span className="text-xs font-medium text-slate-400 line-through sm:text-base">
              {originalPrice.toLocaleString()} ETB
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300 sm:px-2.5 sm:text-sm">
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {language === 'en'
                ? `Save ${savingsAmount.toLocaleString()} ETB`
                : `${savingsAmount.toLocaleString()} ብር ይቆጥቡ`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            <button
              type="button"
              onClick={() => onOpenProduct(slide)}
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#0052FF] px-4 text-sm font-bold sm:min-h-[48px] sm:gap-2 sm:px-6 sm:text-base shadow-lg shadow-blue-600/30 transition hover:bg-[#0047E0] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {campaign.cta}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="hidden items-center gap-4 text-sm font-medium text-slate-200 lg:flex">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                {language === 'en' ? 'Official warranty' : 'ዋስትና ያለው'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-blue-400" />
                {language === 'en' ? 'Fast Addis delivery' : 'ፈጣን ማድረሻ'}
              </span>
            </div>
          </div>
        </div>

        {/* ---------- Product stage: full-bleed right half on desktop ---------- */}
        <button
          type="button"
          onClick={() => onOpenProduct(slide)}
          aria-label={productName}
          className="hero-anim group/image absolute inset-y-0 right-0 z-0 block h-full w-[64%] cursor-pointer overflow-hidden focus-visible:outline-none sm:w-[62%] md:w-[60%] [animation:hero-img-in_600ms_ease-out_both]"
        >
          {/*
            Background layer: the photo runs edge to edge on the right and slides in behind the
            text. The mask only fades the photo's own left edge into the banner (no dark overlay
            on the product). Use object-contain for transparent cutouts.
          */}
          <div
            className="absolute inset-0 [&_img]:absolute [&_img]:inset-0 [&_img]:h-full [&_img]:w-full [&_img]:max-w-none [&_img]:object-cover [&_img]:object-center"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.9) 45%, #000 70%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.9) 45%, #000 70%)',
            }}
          >
            <LazyImage
              src={slide.image}
              alt={slide.nameEn}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover/image:scale-105"
              containerClassName="h-full w-full"
            />
          </div>
        </button>
      </div>

      {/* ---------- Progress segments: full width on phones, bottom-left on desktop ---------- */}
      {total > 1 && (
        <div
          className="absolute bottom-0 left-3 z-20 flex w-auto min-w-[200px] max-w-[85%] items-center sm:bottom-1 sm:left-6 sm:w-[220px] md:left-12 md:w-[260px] lg:left-14"
          role="tablist"
          aria-label="Slides"
        >
          <div className="flex w-full items-center gap-1.5">
            {activeSlides.map((_, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={`banner-seg-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${language === 'en' ? 'Go to slide' : 'ወደ ስላይድ'} ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`group/seg flex h-11 min-h-[44px] min-w-[44px] items-center justify-center py-2 px-1 cursor-pointer transition-all duration-300 ${isActive ? 'flex-[3]' : 'flex-1'
                    }`}
                >
                  <span className="relative block h-1.5 w-full overflow-hidden rounded-full bg-white/25 transition-colors group-hover/seg:bg-white/40">
                    {isActive && (
                      <span
                        className="hero-anim absolute inset-0 origin-left rounded-full bg-[#3B82F6]"
                        style={
                          autoplayOn
                            ? {
                              animation: `hero-progress ${autoplayMs}ms linear forwards`,
                              animationPlayState: paused ? 'paused' : 'running',
                            }
                            : undefined
                        }
                        onAnimationEnd={goNext}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- Arrows + counter: sits on the bottom of the image (phones) / bottom-right (desktop) ---------- */}
      {total > 1 && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center rounded-full border border-white/15 bg-black/55 p-0.5 backdrop-blur-md sm:bottom-5 sm:right-5 md:bottom-7 md:right-8 md:gap-0.5 md:p-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label={language === 'en' ? 'Previous slide' : 'ቀዳሚ'}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={language === 'en' ? 'Next slide' : 'ቀጣይ'}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}
    </section>
  );
};
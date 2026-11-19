import React from 'react';
import { Product } from '../types';
import { Zap, CheckCircle2, ArrowRight, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import { LazyImage } from './LazyImage';

interface HeroSalesBannerProps {
  slide: Product;
  activeSlides: Product[];
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
  language: 'en' | 'am';
  onOpenProduct: (p: Product) => void;
}

export const HeroSalesBanner: React.FC<HeroSalesBannerProps> = ({
  slide,
  activeSlides,
  currentSlide,
  setCurrentSlide,
  language,
  onOpenProduct
}) => {
  // Dynamic category-driven sales campaigns
  const getSalesCampaign = (p: Product, lang: 'en' | 'am') => {
    const cat = p.category || '';
    const lower = (p.nameEn || '').toLowerCase();

    if (cat === 'headphones' || lower.includes('headphone') || lower.includes('earbuds') || lower.includes('headset') || lower.includes('sound') || lower.includes('bose') || lower.includes('sony')) {
      return {
        brandTag: 'Kasma Shop • Audio Sale',
        headline1: lang === 'en' ? 'Unleash Pure Sound' : 'ምርጥ የድምፅ ጥራት',
        headline2: lang === 'en' ? 'With Style' : 'ከዘመናዊ ስታይል ጋር',
        cta: lang === 'en' ? 'Shop Now' : 'አሁኑኑ ይግዙ'
      };
    }
    if (cat === 'computers' || lower.includes('macbook') || lower.includes('laptop') || lower.includes('dell') || lower.includes('lenovo')) {
      return {
        brandTag: 'Kasma Shop • Pro Workstations',
        headline1: lang === 'en' ? 'Extreme Power' : 'ለፈጣሪዎች የተዘጋጀ',
        headline2: lang === 'en' ? 'For Creators' : 'ከፍተኛ ብቃት',
        cta: lang === 'en' ? 'Shop Now' : 'አሁኑኑ ይግዙ'
      };
    }
    if (cat === 'mobiles' || lower.includes('galaxy') || lower.includes('iphone') || lower.includes('phone')) {
      return {
        brandTag: 'Kasma Shop • Flagship Phones',
        headline1: lang === 'en' ? 'Next-Gen Mobile' : 'የላቀ ስማርት ስልክ',
        headline2: lang === 'en' ? 'Intelligence' : 'በእጅዎ ውስጥ',
        cta: lang === 'en' ? 'Shop Now' : 'አሁኑኑ ይግዙ'
      };
    }
    if (cat === 'smartwatches' || lower.includes('watch')) {
      return {
        brandTag: 'Kasma Shop • Smartwear',
        headline1: lang === 'en' ? 'Engineered for' : 'ለትክክለኛ ጀብዱ',
        headline2: lang === 'en' ? 'Extreme Precision' : 'እና ስፖርት የተሰራ',
        cta: lang === 'en' ? 'Shop Now' : 'አሁኑኑ ይግዙ'
      };
    }
    if (cat === 'cameras' || lower.includes('camera') || lower.includes('cctv')) {
      return {
        brandTag: 'Kasma Shop • Smart CCTV',
        headline1: lang === 'en' ? 'Intelligent 4K Vision' : 'የላቀ 4K ጥራት',
        headline2: lang === 'en' ? '& Smart Security' : 'እና አስተማማኝ ደህንነት',
        cta: lang === 'en' ? 'Shop Now' : 'አሁኑኑ ይግዙ'
      };
    }
    return {
      brandTag: 'Kasma Shop • Special Sale',
      headline1: lang === 'en' ? 'Unleash Flagship Tech' : 'ምርጥ ቴክኖሎጂ',
      headline2: lang === 'en' ? 'With Style' : 'ከዘመናዊ ስታይል ጋር',
      cta: lang === 'en' ? 'Shop Now' : 'አሁኑኑ ይግዙ'
    };
  };

  const campaign = getSalesCampaign(slide, language);
  const originalPrice = Math.round(slide.price * 1.15);
  const savingsAmount = originalPrice - slide.price;

  return (
    <div
      id="tour-welcome-banner"
      className="relative text-white rounded-2xl sm:rounded-3xl overflow-hidden h-[195px] xs:h-[210px] sm:h-[240px] md:h-[300px] lg:h-[330px] shadow-2xl border border-slate-800/90 group transition-all duration-300 flex flex-row items-stretch justify-between p-2.5 xs:p-3 sm:p-5 md:p-6 lg:p-7 gap-2 xs:gap-2.5 sm:gap-4 md:gap-6 select-none"
      style={{
        backgroundColor: '#060D1A',
        backgroundImage: 'radial-gradient(circle at 80% 50%, #0F2347 0%, #08142C 50%, #040814 100%)'
      }}
    >
      {/* Subtle marketing ambient glow backdrop */}
      <div className="absolute right-12 sm:right-24 top-1/2 -translate-y-1/2 w-72 sm:w-[420px] md:w-[480px] h-72 sm:h-[420px] md:h-[480px] bg-blue-600/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-6 -top-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Column: Clean, Compact Marketing Typography & Single Direct CTA */}
        <div className="relative z-10 w-[44%] xs:w-[46%] sm:w-[52%] md:w-[50%] lg:w-[48%] flex flex-col justify-between items-start text-left min-w-0 shrink-0 pb-5 xs:pb-6 sm:pb-0">

          {/* Top: Static Promotional Badge (Never changes across slides) */}
          <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 rounded-full bg-red-600 border border-red-500/80 text-white text-[8.5px] xs:text-[9.5px] sm:text-xs font-bold shadow-sm shadow-red-600/30 shrink-0">
                <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-white fill-white shrink-0" />
                <span>{language === 'en' ? 'Limited Offer • Up to 10% Off' : 'ልዩ ቅናሽ • እስከ 10% ቅናሽ'}</span>
              </span>
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-slate-400 truncate hidden sm:inline">
                {campaign.brandTag}
              </span>
          </div>

          {/* Center: Punchy, Clean Title & Pricing */}
          <div className="space-y-1 xs:space-y-1.5 sm:space-y-2 my-auto w-full py-1">
              <h2 className="text-[12px] xs:text-[13px] sm:text-lg md:text-2xl lg:text-[28px] font-black tracking-tight leading-tight text-white font-sans drop-shadow-sm line-clamp-2">
                {campaign.headline1} {campaign.headline2}
              </h2>

              {/* Pricing & Savings Display */}
                  <div className="flex items-baseline gap-1 xs:gap-1.5 sm:gap-2.5 flex-wrap">
                    <span className="text-[11px] xs:text-sm sm:text-lg md:text-2xl font-black text-white tracking-tight drop-shadow-sm whitespace-nowrap font-mono">
                      {slide.price.toLocaleString()} <span className="text-[8.5px] xs:text-[10px] sm:text-xs font-semibold text-slate-400">ETB</span>
                    </span>
                      <span className="text-[8.5px] xs:text-[10px] sm:text-xs text-slate-400 line-through font-medium whitespace-nowrap">
                        {originalPrice.toLocaleString()} ETB
                      </span>
                        <span className="text-[7.5px] xs:text-[8.5px] sm:text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1 xs:px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 whitespace-nowrap">
                          <CheckCircle2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-emerald-400 shrink-0" />
                          <span>{language === 'en' ? `Save ${savingsAmount.toLocaleString()} ETB` : `${savingsAmount.toLocaleString()} ብር`}</span>
                        </span>
                      </div>
                  </div>

                  {/* Bottom: Single Direct Action CTA (Shop Now) + Trust Highlights */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <button
                      onClick={() => onOpenProduct(slide)}
                      className="w-fit px-2.5 xs:px-3.5 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-[#0052FF] hover:bg-[#0047E0] active:scale-95 text-white font-bold text-[9.5px] xs:text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-md inline-flex items-center gap-1 sm:gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <span>{campaign.cta}</span>
                      <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {/* Trust Highlights (Desktop & Tablets) */}
                    <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-400 pl-2">
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>{language === 'en' ? 'Official Warranty' : 'ዋስትና ያለው'}</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="inline-flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-400" />
                        <span>{language === 'en' ? 'Fast Addis Delivery' : 'ፈጣን ማድረሻ'}</span>
                      </span>
                    </div>
                  </div>

              </div>

                {/* Right Column: Hero Product Showcase Stage (Expanded to Left on Small Devices) */}
                <div className="relative w-[56%] xs:w-[54%] sm:w-[48%] md:w-[50%] lg:w-[52%] h-full flex items-center justify-center select-none min-w-0">
                  <div
                    onClick={() => onOpenProduct(slide)}
                    className="relative w-full h-full rounded-xl xs:rounded-2xl md:rounded-3xl overflow-hidden border border-white/20 sm:border-slate-700/80 shadow-lg md:shadow-2xl bg-slate-900/80 backdrop-blur-sm group/image flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-white/40 hover:shadow-blue-500/15"
                  >
                    <LazyImage
                      src={slide.image}
                      alt={slide.nameEn}
                      className="w-full h-full object-cover object-center group-hover/image:scale-105 transition-transform duration-700 ease-out"
                      containerClassName="w-full h-full flex items-center justify-center"
                    />

                    {/* Subtle luxury edge vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Floating Glass Brand Badge */}
                    <div className="absolute top-1.5 right-1.5 xs:top-2 xs:right-2 sm:top-3 sm:right-3 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[8px] xs:text-[9px] sm:text-xs font-bold px-1.5 xs:px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg flex items-center gap-1 pointer-events-none z-10">
                      <Sparkles className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                      <span>{slide.brand || 'Kasma'}</span>
                    </div>
                  </div>
                </div>

                {/* Minimal Clean Carousel Navigation Indicators & Arrows */}
                <div className="absolute bottom-1.5 xs:bottom-2 sm:bottom-2.5 left-3 xs:left-3.5 sm:left-5 md:left-7 flex items-center gap-1 sm:gap-1.5 z-20">
                  {activeSlides.map((_, index) => (
                    <button
                      key={`banner-bullet-${index}`}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1 xs:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? 'w-4 xs:w-5 sm:w-6 bg-[#0052FF] shadow-sm shadow-blue-500/60' : 'w-1 xs:w-1.5 bg-white/30 hover:bg-white/60'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="absolute bottom-1.5 xs:bottom-2 sm:bottom-2.5 right-2 xs:right-2.5 sm:right-3 md:right-4 flex items-center gap-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
                    }}
                    className="p-1 xs:p-1.5 sm:p-2 bg-black/60 hover:bg-black/90 text-white/90 hover:text-white rounded-md xs:rounded-lg sm:rounded-xl transition-all cursor-pointer border border-white/20 backdrop-blur-md active:scale-95 shadow-lg min-w-[24px] xs:min-w-[26px] sm:min-w-[32px] min-h-[24px] xs:min-h-[26px] sm:min-h-[32px] flex items-center justify-center"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
                    }}
                    className="p-1 xs:p-1.5 sm:p-2 bg-black/60 hover:bg-black/90 text-white/90 hover:text-white rounded-md xs:rounded-lg sm:rounded-xl transition-all cursor-pointer border border-white/20 backdrop-blur-md active:scale-95 shadow-lg min-w-[24px] xs:min-w-[26px] sm:min-w-[32px] min-h-[24px] xs:min-h-[26px] sm:min-h-[32px] flex items-center justify-center"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

              </div>
              );
};

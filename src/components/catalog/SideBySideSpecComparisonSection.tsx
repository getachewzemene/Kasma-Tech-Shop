import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { 
  Scale, 
  ArrowRight, 
  Cpu, 
  HardDrive, 
  Battery, 
  Zap, 
  DollarSign, 
  Sparkles,
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react';

export interface SideBySideSpecComparisonSectionProps {
  currentProduct: Product;
  onOpenFullComparison: (rivalId: string) => void;
}

export const SideBySideSpecComparisonSection: React.FC<SideBySideSpecComparisonSectionProps> = ({
  currentProduct,
  onOpenFullComparison
}) => {
  const { products, language } = useShop();

  // Find comparable rivals (same category, e.g. computers or mobiles, or general electronics)
  const rivalCandidates = useMemo(() => {
    return products.filter(p => 
      p.id !== currentProduct.id && 
      (p.status === 'APPROVED' || !p.status) &&
      (p.category === currentProduct.category || (currentProduct.category === 'computers' || currentProduct.category === 'mobiles'))
    );
  }, [products, currentProduct]);

  const [selectedRivalId, setSelectedRivalId] = useState<string>(() => {
    return rivalCandidates[0]?.id || '';
  });

  // Keep selected rival updated if candidate list changes
  React.useEffect(() => {
    if (!selectedRivalId && rivalCandidates.length > 0) {
      setSelectedRivalId(rivalCandidates[0].id);
    }
  }, [rivalCandidates, selectedRivalId]);

  const rivalProduct = useMemo(() => {
    return products.find(p => p.id === selectedRivalId) || rivalCandidates[0] || null;
  }, [products, selectedRivalId, rivalCandidates]);

  if (!rivalProduct) return null;

  const currentSpecs = currentProduct.specs || {};
  const rivalSpecs = rivalProduct.specs || {};

  const priceDiff = currentProduct.price - rivalProduct.price;

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-[#0052FF] dark:text-blue-400 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Side-by-Side Comparison' : 'ጎን ለጎን ማነጻጸሪያ'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white tracking-tight">
            {language === 'en' 
              ? '⚖️ Side-by-Side Tech Specs Comparison Tool' 
              : '⚖️ ጎን ለጎን የቴክኖሎጂ ዝርዝር መግለጫ ማነጻጸሪያ'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {language === 'en'
              ? 'Compare key hardware specs (RAM, CPU, GPU, Battery, Price) against alternative options.'
              : 'ዋና ዋና የሃርድዌር ዝርዝሮችን (RAM፣ CPU፣ GPU፣ ባትሪ እና ዋጋ) ከተፎካካሪ እቃዎች ጋር ያነጻጽሩ።'}
          </p>
        </div>

        {/* Rival Quick Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-gray-400">
            {language === 'en' ? 'Compare with:' : 'ጋር አነጻጽር፡'}
          </span>
          {rivalCandidates.slice(0, 3).map(candidate => (
            <button
              key={candidate.id}
              onClick={() => setSelectedRivalId(candidate.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                candidate.id === rivalProduct.id
                  ? 'bg-[#0052FF] text-white border-blue-600 shadow-sm'
                  : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100'
              }`}
            >
              {candidate.brand} {candidate.nameEn.split('-')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Device Column */}
        <div className="p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shrink-0">
              <img 
                src={currentProduct.image} 
                alt={currentProduct.nameEn} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block tracking-wider">
                {language === 'en' ? 'This Device (Selected)' : 'ይህ እቃ'}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                {language === 'en' ? currentProduct.nameEn : currentProduct.nameAm}
              </h4>
              <span className="text-base font-black text-[#0052FF] dark:text-blue-400 font-mono">
                {currentProduct.price.toLocaleString()} ETB
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-blue-200/60 dark:border-blue-900/40 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-600" /> RAM:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{currentSpecs.ram || 'Standard'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-600" /> CPU:
              </span>
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={currentSpecs.cpu}>
                {currentSpecs.cpu || 'Multi-Core Processor'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> GPU:
              </span>
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={currentSpecs.gpu}>
                {currentSpecs.gpu || 'Hardware Accelerated'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-emerald-600" /> Battery:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{currentSpecs.battery || 'All-Day Battery'}</span>
            </div>
          </div>
        </div>

        {/* Rival Device Column */}
        <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-750 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shrink-0">
              <img 
                src={rivalProduct.image} 
                alt={rivalProduct.nameEn} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 block tracking-wider">
                {language === 'en' ? 'Alternative Rival' : 'ተፎካካሪ ምርት'}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                {language === 'en' ? rivalProduct.nameEn : rivalProduct.nameAm}
              </h4>
              <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                {rivalProduct.price.toLocaleString()} ETB
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-gray-200 dark:border-zinc-700 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-600" /> RAM:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{rivalSpecs.ram || 'Standard'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-600" /> CPU:
              </span>
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={rivalSpecs.cpu}>
                {rivalSpecs.cpu || 'Multi-Core Processor'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> GPU:
              </span>
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={rivalSpecs.gpu}>
                {rivalSpecs.gpu || 'Hardware Accelerated'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-emerald-600" /> Battery:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{rivalSpecs.battery || 'All-Day Battery'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-150 dark:border-zinc-800">
        <div className="text-xs text-gray-500 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>
            {priceDiff === 0
              ? (language === 'en' ? 'Both models have identical pricing.' : 'ሁለቱም ሞዴሎች እኩል ዋጋ አላቸው።')
              : priceDiff < 0
              ? (language === 'en' 
                  ? `This device is ${Math.abs(priceDiff).toLocaleString()} ETB more affordable.` 
                  : `ይህ መሳሪያ በ${Math.abs(priceDiff).toLocaleString()} ብር ቅናሽ አለው።`)
              : (language === 'en'
                  ? `Alternative rival is ${Math.abs(priceDiff).toLocaleString()} ETB more affordable.`
                  : `ተፎካካሪው ምርት በ${Math.abs(priceDiff).toLocaleString()} ብር ቅናሽ አለው።`)}
          </span>
        </div>

        <button
          onClick={() => onOpenFullComparison(rivalProduct.id)}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <span>
            {language === 'en' 
              ? 'Launch Full Side-by-Side Comparison Tool' 
              : 'ሙሉውን የጎን ለጎን ማነጻጸሪያ ክፈት'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

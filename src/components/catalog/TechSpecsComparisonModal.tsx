import React, { useState, useMemo } from 'react';
import { Product, TechSpecs } from '../../types';
import { useShop } from '../../context/ShopContext';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  Sparkles, 
  Cpu, 
  HardDrive, 
  Battery, 
  Monitor, 
  Zap, 
  ShieldCheck, 
  ShoppingCart, 
  ExternalLink,
  ChevronDown,
  Layers,
  Scale,
  DollarSign,
  Laptop,
  Smartphone,
  Eye,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface TechSpecsComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  productAId?: string;
  productBId?: string;
}

export const TechSpecsComparisonModal: React.FC<TechSpecsComparisonModalProps> = ({
  isOpen,
  onClose,
  productAId,
  productBId
}) => {
  const navigate = useNavigate();
  const { 
    products, 
    language, 
    addToCart, 
    showToast,
    comparedProductIds,
    removeFromCompare,
    clearCompare,
    openCompareWith
  } = useShop();

  const [highlightDiffsOnly, setHighlightDiffsOnly] = useState(false);

  // Identify product A and product B
  const effectiveIdA = productAId || comparedProductIds[0];
  const effectiveIdB = productBId || comparedProductIds[1];

  const [selectedIdA, setSelectedIdA] = useState<string>(effectiveIdA || '');
  const [selectedIdB, setSelectedIdB] = useState<string>(effectiveIdB || '');

  // Keep state synced when props or context change
  React.useEffect(() => {
    if (effectiveIdA) setSelectedIdA(effectiveIdA);
    if (effectiveIdB) setSelectedIdB(effectiveIdB);
  }, [effectiveIdA, effectiveIdB]);

  const productA = useMemo(() => products.find(p => p.id === selectedIdA) || null, [products, selectedIdA]);
  const productB = useMemo(() => products.find(p => p.id === selectedIdB) || null, [products, selectedIdB]);

  // Comparable candidates (prioritize same category: computers or mobiles)
  const availableCandidates = useMemo(() => {
    return products.filter(p => p.status === 'APPROVED' || !p.status);
  }, [products]);

  // Auto-suggest a 2nd product if only 1 is selected
  React.useEffect(() => {
    if (productA && !productB) {
      const rival = availableCandidates.find(p => 
        p.id !== productA.id && 
        (p.category === productA.category || (p.category === 'computers' || p.category === 'mobiles'))
      );
      if (rival) {
        setSelectedIdB(rival.id);
      }
    }
  }, [productA, productB, availableCandidates]);

  if (!isOpen) return null;

  // Swap devices A and B
  const handleSwap = () => {
    const temp = selectedIdA;
    setSelectedIdA(selectedIdB);
    setSelectedIdB(temp);
  };

  // Helper to extract or fallback specs
  const getSpecs = (p: Product | null): TechSpecs => {
    if (!p) return {};
    if (p.specs) return p.specs;
    // Fallback heuristic for devices without explicit specs object
    return {
      ram: p.category === 'computers' ? '16GB DDR5' : p.category === 'mobiles' ? '8GB RAM' : 'N/A',
      cpu: p.category === 'computers' ? 'Intel / Apple Silicon Processor' : p.category === 'mobiles' ? 'Octa-Core High-Efficiency Processor' : 'Integrated Audio Processor',
      gpu: p.category === 'computers' ? 'Dedicated / Integrated Studio Graphics' : 'Mobile GPU Accelerator',
      battery: p.category === 'computers' ? 'All-Day Battery (Up to 15h)' : p.category === 'mobiles' ? '4,500+ mAh Fast Charge' : 'Up to 24 Hours Audio',
      storage: p.variants[0]?.name || 'High-Speed SSD / Flash Storage',
      display: p.category === 'computers' ? 'Retina / Ultra HD Display' : p.category === 'mobiles' ? 'High-Refresh OLED / AMOLED' : 'N/A',
      os: p.brand === 'Apple' ? (p.category === 'computers' ? 'macOS' : 'iOS') : p.category === 'computers' ? 'Windows 11' : 'Android',
      weight: p.category === 'computers' ? '~1.8 kg' : p.category === 'mobiles' ? '~200g' : 'Ultra-light',
      charging: 'Fast USB-C / PD Charging'
    };
  };

  const specsA = getSpecs(productA);
  const specsB = getSpecs(productB);

  // Category badge
  const categoryLabel = useMemo(() => {
    if (productA?.category === 'computers' || productB?.category === 'computers') {
      return language === 'en' ? 'Laptops & Computers' : 'ላፕቶፖች እና ኮምፒውተሮች';
    }
    if (productA?.category === 'mobiles' || productB?.category === 'mobiles') {
      return language === 'en' ? 'Smartphones & Mobiles' : 'ስማርት ስልኮች';
    }
    return language === 'en' ? 'Tech Electronics' : 'የቴክኖሎጂ እቃዎች';
  }, [productA, productB, language]);

  // Price difference calculation
  const priceDiffInfo = useMemo(() => {
    if (!productA || !productB) return null;
    const diff = productA.price - productB.price;
    if (diff === 0) return { equal: true };
    const absDiff = Math.abs(diff);
    const cheaperProduct = diff > 0 ? productB : productA;
    const moreExpensive = diff > 0 ? productA : productB;
    const pct = Math.round((absDiff / moreExpensive.price) * 100);
    return {
      equal: false,
      cheaperName: language === 'en' ? cheaperProduct.nameEn : cheaperProduct.nameAm,
      absDiff,
      pct,
      cheaperId: cheaperProduct.id
    };
  }, [productA, productB, language]);

  interface SpecRowDef {
    id: string;
    labelEn: string;
    labelAm: string;
    icon: React.ReactNode;
    valA?: string;
    valB?: string;
    highlightA?: boolean;
    highlightB?: boolean;
  }

  const specRows: SpecRowDef[] = [
    {
      id: 'price',
      labelEn: 'Official Price (ETB)',
      labelAm: 'ኦፊሴላዊ ዋጋ (በብር)',
      icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
      valA: productA ? `${productA.price.toLocaleString()} ETB` : '—',
      valB: productB ? `${productB.price.toLocaleString()} ETB` : '—',
      highlightA: productA && productB ? productA.price < productB.price : false,
      highlightB: productA && productB ? productB.price < productA.price : false,
    },
    {
      id: 'ram',
      labelEn: 'Memory (RAM)',
      labelAm: 'የማህደረ-ትውስታ መጠን (RAM)',
      icon: <HardDrive className="w-4 h-4 text-blue-600" />,
      valA: specsA.ram || '—',
      valB: specsB.ram || '—',
    },
    {
      id: 'cpu',
      labelEn: 'Processor (CPU)',
      labelAm: 'ዋና ፕሮሰሰር (CPU)',
      icon: <Cpu className="w-4 h-4 text-purple-600" />,
      valA: specsA.cpu || '—',
      valB: specsB.cpu || '—',
    },
    {
      id: 'gpu',
      labelEn: 'Graphics Engine (GPU)',
      labelAm: 'የግራፊክስ ካርድ (GPU)',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      valA: specsA.gpu || '—',
      valB: specsB.gpu || '—',
    },
    {
      id: 'battery',
      labelEn: 'Battery & Runtime',
      labelAm: 'የባትሪ አቅም እና ቆይታ',
      icon: <Battery className="w-4 h-4 text-emerald-500" />,
      valA: specsA.battery || '—',
      valB: specsB.battery || '—',
    },
    {
      id: 'storage',
      labelEn: 'Storage (SSD / ROM)',
      labelAm: 'የማከማቻ መጠን (SSD/ROM)',
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
      valA: specsA.storage || '—',
      valB: specsB.storage || '—',
    },
    {
      id: 'display',
      labelEn: 'Display & Refresh Rate',
      labelAm: 'ስክሪን እና የፍጥነት መጠን',
      icon: <Monitor className="w-4 h-4 text-sky-500" />,
      valA: specsA.display || '—',
      valB: specsB.display || '—',
    },
    {
      id: 'os',
      labelEn: 'Operating System',
      labelAm: 'ኦፕሬቲንግ ሲስተም (OS)',
      icon: <Laptop className="w-4 h-4 text-zinc-500" />,
      valA: specsA.os || '—',
      valB: specsB.os || '—',
    },
    {
      id: 'charging',
      labelEn: 'Fast Charging',
      labelAm: 'ፈጣን የኃይል መሙያ (Charging)',
      icon: <Zap className="w-4 h-4 text-yellow-500" />,
      valA: specsA.charging || '—',
      valB: specsB.charging || '—',
    },
    {
      id: 'weight',
      labelEn: 'Weight & Form Factor',
      labelAm: 'ክብደት እና ቅርጽ',
      icon: <Scale className="w-4 h-4 text-slate-500" />,
      valA: specsA.weight || '—',
      valB: specsB.weight || '—',
    },
    {
      id: 'warranty',
      labelEn: 'Official Warranty',
      labelAm: 'ኦፊሴላዊ ዋስትና',
      icon: <ShieldCheck className="w-4 h-4 text-teal-600" />,
      valA: productA ? (language === 'en' ? `${productA.warrantyMonths || 12} Months Official Bole Hub Coverage` : `የ${productA.warrantyMonths || 12} ወራት ኦፊሴላዊ የቦሌ ማዕከል ዋስትና`) : '—',
      valB: productB ? (language === 'en' ? `${productB.warrantyMonths || 12} Months Official Bole Hub Coverage` : `የ${productB.warrantyMonths || 12} ወራት ኦፊሴላዊ የቦሌ ማዕከል ዋስትና`) : '—',
    },
    {
      id: 'condition',
      labelEn: 'Packaging & Condition',
      labelAm: 'የእቃው ሁኔታ',
      icon: <Check className="w-4 h-4 text-blue-500" />,
      valA: productA ? (language === 'en' ? (productA.conditionTextEn || 'Factory Sealed') : (productA.conditionTextAm || 'በፋብሪካው የታሸገ')) : '—',
      valB: productB ? (language === 'en' ? (productB.conditionTextEn || 'Factory Sealed') : (productB.conditionTextAm || 'በፋብሪካው የታሸገ')) : '—',
    }
  ];

  const displayedRows = highlightDiffsOnly 
    ? specRows.filter(r => r.valA !== r.valB)
    : specRows;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-gray-50/70 dark:bg-zinc-850/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0052FF] to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  {language === 'en' ? '⚖️ Side-by-Side Tech Specs Comparison Tool' : '⚖️ ጎን ለጎን የቴክኖሎጂ ዝርዝር መግለጫ ማነጻጸሪያ'}
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950/70 text-[#0052FF] dark:text-blue-400">
                  {categoryLabel}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {language === 'en' 
                  ? 'Compare 2 laptops or smartphones side-by-side (RAM, CPU, GPU, Battery, Price).' 
                  : 'ሁለት ላፕቶፖች ወይም ስልኮች ጎን ለጎን ያነጻጽሩ (RAM፣ CPU፣ GPU፣ ባትሪ እና ዋጋ)።'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Swap Button */}
            <button
              onClick={handleSwap}
              title={language === 'en' ? 'Swap Positions' : 'ቦታ ቀይር'}
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:text-[#0052FF] hover:border-blue-400 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* Differences Filter Toggle */}
            <button
              onClick={() => setHighlightDiffsOnly(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                highlightDiffsOnly 
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-[#0052FF] dark:text-blue-300 font-black' 
                  : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {highlightDiffsOnly 
                  ? (language === 'en' ? 'Showing Diffs Only' : 'ልዩነቶችን ብቻ') 
                  : (language === 'en' ? 'Show Differences Only' : 'ልዩነቶችን ብቻ አሳይ')}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price Advantage Alert Banner */}
        {priceDiffInfo && !priceDiffInfo.equal && (
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-b border-emerald-500/20 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'en'
                  ? `💡 Value Difference: ${priceDiffInfo.cheaperName} is ${priceDiffInfo.absDiff.toLocaleString()} ETB cheaper (-${priceDiffInfo.pct}%).`
                  : `💡 የዋጋ ልዩነት፡ ${priceDiffInfo.cheaperName} በ${priceDiffInfo.absDiff.toLocaleString()} ብር ቅናሽ አለው (-${priceDiffInfo.pct}%)።`}
              </span>
            </div>
            <button
              onClick={clearCompare}
              className="text-[11px] font-bold text-gray-500 hover:text-rose-600 cursor-pointer"
            >
              {language === 'en' ? 'Clear Selection' : 'ምርጫ አጽዳ'}
            </button>
          </div>
        )}

        {/* Scrollable Comparison Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Side-by-Side Product Header Columns */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* Device A Header Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gray-50/80 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-750 relative space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                  {language === 'en' ? 'Device 01' : 'መሳሪያ 1'}
                </span>
                
                {/* Device A Dropdown Switcher */}
                <select
                  value={selectedIdA}
                  onChange={(e) => setSelectedIdA(e.target.value)}
                  className="text-xs font-bold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-2.5 py-1 text-gray-700 dark:text-zinc-200 outline-none max-w-[140px] sm:max-w-[200px] truncate cursor-pointer"
                >
                  {availableCandidates.map(p => (
                    <option key={p.id} value={p.id}>
                      {language === 'en' ? p.nameEn : p.nameAm} ({p.price.toLocaleString()} ETB)
                    </option>
                  ))}
                </select>
              </div>

              {productA ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3.5 items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shrink-0">
                      <img 
                        src={productA.image} 
                        alt={productA.nameEn} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="space-y-1 text-center sm:text-left min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        {productA.brand}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-gray-950 dark:text-white line-clamp-2 leading-tight">
                        {language === 'en' ? productA.nameEn : productA.nameAm}
                      </h3>
                      <div className="text-base sm:text-lg font-black text-[#0052FF] dark:text-blue-400 font-mono">
                        {productA.price.toLocaleString()} ETB
                      </div>
                    </div>
                  </div>

                  {/* Actions for Device A */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        const defV = productA.variants[0];
                        if (defV) addToCart(productA, defV.sku, 1);
                      }}
                      className="flex-1 py-2 sm:py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Add to Cart' : 'ቅርጫት'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/product/${productA.id}`);
                      }}
                      className="p-2 sm:p-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 rounded-xl text-gray-600 dark:text-zinc-300 transition-all cursor-pointer"
                      title={language === 'en' ? 'View Details' : 'ዝርዝር እይ'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  {language === 'en' ? 'Select a device to compare' : 'መሳሪያ ይምረጡ'}
                </div>
              )}
            </div>

            {/* Device B Header Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gray-50/80 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-750 relative space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg">
                  {language === 'en' ? 'Device 02' : 'መሳሪያ 2'}
                </span>

                {/* Device B Dropdown Switcher */}
                <select
                  value={selectedIdB}
                  onChange={(e) => setSelectedIdB(e.target.value)}
                  className="text-xs font-bold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-2.5 py-1 text-gray-700 dark:text-zinc-200 outline-none max-w-[140px] sm:max-w-[200px] truncate cursor-pointer"
                >
                  {availableCandidates.map(p => (
                    <option key={p.id} value={p.id}>
                      {language === 'en' ? p.nameEn : p.nameAm} ({p.price.toLocaleString()} ETB)
                    </option>
                  ))}
                </select>
              </div>

              {productB ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3.5 items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shrink-0">
                      <img 
                        src={productB.image} 
                        alt={productB.nameEn} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="space-y-1 text-center sm:text-left min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        {productB.brand}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-gray-950 dark:text-white line-clamp-2 leading-tight">
                        {language === 'en' ? productB.nameEn : productB.nameAm}
                      </h3>
                      <div className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                        {productB.price.toLocaleString()} ETB
                      </div>
                    </div>
                  </div>

                  {/* Actions for Device B */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        const defV = productB.variants[0];
                        if (defV) addToCart(productB, defV.sku, 1);
                      }}
                      className="flex-1 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Add to Cart' : 'ቅርጫት'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/product/${productB.id}`);
                      }}
                      className="p-2 sm:p-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 rounded-xl text-gray-600 dark:text-zinc-300 transition-all cursor-pointer"
                      title={language === 'en' ? 'View Details' : 'ዝርዝር እይ'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  {language === 'en' ? 'Select a 2nd device to compare' : 'ሁለተኛ መሳሪያ ይምረጡ'}
                </div>
              )}
            </div>
          </div>

          {/* Side-by-Side Specs Matrix Table */}
          <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
            <div className="px-5 py-3.5 bg-gray-50 dark:bg-zinc-850/80 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                {language === 'en' ? 'Technical Specifications Matrix' : 'ዝርዝር ቴክኒካዊ መግለጫዎች'}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {displayedRows.length} {language === 'en' ? 'specs evaluated' : 'ዝርዝሮች'}
              </span>
            </div>

            <div className="divide-y divide-gray-150 dark:divide-zinc-800">
              {displayedRows.map((row) => (
                <div 
                  key={row.id} 
                  className={`grid grid-cols-1 md:grid-cols-12 p-3.5 sm:p-4 text-xs transition-colors hover:bg-gray-50/50 dark:hover:bg-zinc-850/40 items-start ${
                    row.valA !== row.valB ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                  }`}
                >
                  {/* Spec Name / Label */}
                  <div className="md:col-span-4 flex items-center gap-2.5 text-gray-600 dark:text-zinc-400 font-bold mb-2 md:mb-0">
                    <span className="p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 shrink-0">
                      {row.icon}
                    </span>
                    <div>
                      <span className="block text-gray-900 dark:text-white font-extrabold text-xs">
                        {language === 'en' ? row.labelEn : row.labelAm}
                      </span>
                      {row.valA !== row.valB && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                          {language === 'en' ? 'Differs' : 'የሚለያይ'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Device A Spec Value */}
                  <div className={`md:col-span-4 p-2.5 rounded-2xl md:border-l border-gray-150 dark:border-zinc-800 font-medium ${
                    row.highlightA ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-bold' : 'text-gray-800 dark:text-zinc-200'
                  }`}>
                    <span className="md:hidden block text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                      {productA ? productA.brand : 'Device 01'}:
                    </span>
                    <span className="leading-relaxed block">{row.valA}</span>
                    {row.highlightA && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 mt-1">
                        <Check className="w-3 h-3" /> {language === 'en' ? 'Advantage' : 'ብልጫ'}
                      </span>
                    )}
                  </div>

                  {/* Device B Spec Value */}
                  <div className={`md:col-span-4 p-2.5 rounded-2xl md:border-l border-gray-150 dark:border-zinc-800 font-medium ${
                    row.highlightB ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 font-bold' : 'text-gray-800 dark:text-zinc-200'
                  }`}>
                    <span className="md:hidden block text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                      {productB ? productB.brand : 'Device 02'}:
                    </span>
                    <span className="leading-relaxed block">{row.valB}</span>
                    {row.highlightB && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-600 mt-1">
                        <Check className="w-3 h-3" /> {language === 'en' ? 'Advantage' : 'ብልጫ'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-150 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/70 dark:bg-zinc-850/60 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'en'
                ? 'Both products inspected & warrantied with Bole Service Hub coverage.'
                : 'ሁለቱም እቃዎች በቦሌ የቴክኖሎጂ ማዕከል ኦፊሴላዊ ዋስትና የተረጋገጡ ናቸው።'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
          >
            {language === 'en' ? 'Close Comparison' : 'ማነጻጸሪያውን ዝጋ'}
          </button>
        </div>
      </div>
    </div>
  );
};

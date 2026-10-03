import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Clock, 
  Check, 
  RotateCcw,
  Sparkles,
  User,
  Phone,
  Calendar,
  ExternalLink,
  ChevronRight,
  Info,
  CheckSquare
} from 'lucide-react';
import { Order } from '../types';

export interface OrderTrackingVisualizerProps {
  order?: Order | null;
  language?: 'en' | 'am';
  onStatusChange?: (newStatus: Order['status']) => void;
  className?: string;
  showItemsSummary?: boolean;
}

export type TrackingStageKey = 'ORDERED' | 'VERIFIED' | 'SHIPPED' | 'DELIVERED';

interface TrackingStage {
  key: TrackingStageKey;
  stepNumber: number;
  titleEn: string;
  titleAm: string;
  subtitleEn: string;
  subtitleAm: string;
  icon: React.ElementType;
  timeEn: string;
  timeAm: string;
  locationEn: string;
  locationAm: string;
  detailsEn: string[];
  detailsAm: string[];
}

// Distinct Stage Color Themes: Yellow (Ordered) -> Blue (Packed) -> Indigo (Shipped) -> Green (Delivered)
const STAGE_COLOR_THEMES = [
  {
    name: 'ORDERED',
    pillBg: 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300',
    nodeActive: 'bg-amber-500 border-amber-200 text-slate-950 ring-4 ring-amber-500/50 shadow-xl shadow-amber-500/30 scale-110',
    nodeCompleted: 'bg-amber-500 border-amber-300 text-slate-950',
    stepText: 'text-amber-600 dark:text-amber-400 font-extrabold',
    cardBg: 'bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-700/80 ring-2 ring-amber-500/20',
    cardHeaderIcon: 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm',
    cardHeaderLabel: 'text-amber-800 dark:text-amber-300',
    simBtnActive: 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm ring-2 ring-amber-500/40',
  },
  {
    name: 'PACKED',
    pillBg: 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300',
    nodeActive: 'bg-blue-600 border-blue-200 text-white ring-4 ring-blue-500/50 shadow-xl shadow-blue-500/30 scale-110',
    nodeCompleted: 'bg-blue-600 border-blue-300 text-white',
    stepText: 'text-blue-600 dark:text-blue-400 font-extrabold',
    cardBg: 'bg-blue-50/80 dark:bg-blue-950/30 border-2 border-blue-500 dark:border-blue-700/80 ring-2 ring-blue-500/20',
    cardHeaderIcon: 'bg-blue-600 text-white border-blue-300 shadow-sm',
    cardHeaderLabel: 'text-blue-800 dark:text-blue-300',
    simBtnActive: 'bg-blue-600 text-white border-blue-600 font-black shadow-sm ring-2 ring-blue-500/40',
  },
  {
    name: 'SHIPPED',
    pillBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300',
    nodeActive: 'bg-indigo-600 border-indigo-200 text-white ring-4 ring-indigo-500/50 shadow-xl shadow-indigo-500/30 scale-110',
    nodeCompleted: 'bg-indigo-600 border-indigo-300 text-white',
    stepText: 'text-indigo-600 dark:text-indigo-400 font-extrabold',
    cardBg: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-2 border-indigo-500 dark:border-indigo-700/80 ring-2 ring-indigo-500/20',
    cardHeaderIcon: 'bg-indigo-600 text-white border-indigo-300 shadow-sm',
    cardHeaderLabel: 'text-indigo-800 dark:text-indigo-300',
    simBtnActive: 'bg-indigo-600 text-white border-indigo-600 font-black shadow-sm ring-2 ring-indigo-500/40',
  },
  {
    name: 'DELIVERED',
    pillBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
    nodeActive: 'bg-emerald-600 border-emerald-200 text-white ring-4 ring-emerald-500/50 shadow-xl shadow-emerald-500/30 scale-110',
    nodeCompleted: 'bg-emerald-600 border-emerald-300 text-white',
    stepText: 'text-emerald-600 dark:text-emerald-400 font-extrabold',
    cardBg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-500 dark:border-emerald-700/80 ring-2 ring-emerald-500/20',
    cardHeaderIcon: 'bg-emerald-600 text-white border-emerald-300 shadow-sm',
    cardHeaderLabel: 'text-emerald-800 dark:text-emerald-300',
    simBtnActive: 'bg-emerald-600 text-white border-emerald-600 font-black shadow-sm ring-2 ring-emerald-500/40',
  }
];

export function OrderTrackingVisualizer({
  order,
  language = 'en',
  onStatusChange,
  className = '',
  showItemsSummary = false
}: OrderTrackingVisualizerProps) {
  // Local simulated status state if no external callback provided
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null);
  const detailCardRef = useRef<HTMLDivElement>(null);

  // Map order.status string to our 4 standard stages
  const getCurrentStageIndex = (status?: string): number => {
    if (!status) return 0; // Default to Ordered
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'PAID':
        return 0; // Stage 0: Ordered (Yellow)
      case 'PROCESSING':
        return 1; // Stage 1: Packed (Blue)
      case 'SHIPPED':
        return 2; // Stage 2: Shipped (Indigo)
      case 'DELIVERED':
        return 3; // Stage 3: Delivered (Green)
      case 'CANCELLED':
      case 'REFUNDED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStageIndex = getCurrentStageIndex(order?.status);
  const activeStageIndex = selectedStageIndex !== null ? selectedStageIndex : Math.max(0, currentStageIndex);

  // Auto scroll into view when stage selection changes
  useEffect(() => {
    if (detailCardRef.current && selectedStageIndex !== null) {
      detailCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedStageIndex]);

  // Calculate percentage fill for progress bar (0%, 33.3%, 66.6%, 100%)
  const progressPercent = currentStageIndex < 0 ? 0 : Math.min(100, (currentStageIndex / 3) * 100);

  const stages: TrackingStage[] = [
    {
      key: 'ORDERED',
      stepNumber: 1,
      titleEn: 'Ordered',
      titleAm: 'ትዕዛዝ ተቀብለናል',
      subtitleEn: 'Order Placed & Payment Confirmed',
      subtitleAm: 'ትዕዛዙ ተመዝግቧል እና ክፍያው ተረጋግጧል',
      icon: Package,
      timeEn: order ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM',
      timeAm: '10:30 ጥዋት',
      locationEn: 'Kasma Online Gateway, Addis Ababa',
      locationAm: 'ካስማ የመስመር ላይ መድረክ፣ አዲስ አበባ',
      detailsEn: [
        'Order payload securely generated with reference ID',
        'Digital receipt & Telebirr/Chapa payment authorization verified',
        'Notification dispatched to merchant inventory system'
      ],
      detailsAm: [
        'የትዕዛዝ መለያ ቁጥር በደህንነት ተዘጋጅቷል',
        'የክፍያ ማረጋገጫ ተቀብለናል',
        'ወደ እቃ ማከማቻው ማሳወቂያ ተልኳል'
      ]
    },
    {
      key: 'VERIFIED',
      stepNumber: 2,
      titleEn: 'Packed',
      titleAm: 'ታሽጓል',
      subtitleEn: 'Quality Check & Packaging at Hub',
      subtitleAm: 'የእቃ ጥራት ምርመራ እና ማሸግ በአዲስ አበባ ማዕከል',
      icon: ShieldCheck,
      timeEn: 'Est. +15 Mins',
      timeAm: '+15 ደቂቃ',
      locationEn: 'Kasma Fulfillment Depot, Bole, Addis Ababa',
      locationAm: 'ካስማ ማዕከላዊ መጋዘን፣ ቦሌ፣ አዲስ አበባ',
      detailsEn: [
        'Serial numbers & warranty stickers registered',
        'Anti-tamper packaging applied with Kasma seal',
        'Assigned to dedicated Express Courier'
      ],
      detailsAm: [
        'የእቃው የመለያ ቁጥርና ዋስትና ተመዝግቧል',
        'ጥራቱ ተመርምሮ ማሸጊያ ተደርጎለታል',
        'ለፈጣን መልዕክተኛ ተረክቧል'
      ]
    },
    {
      key: 'SHIPPED',
      stepNumber: 3,
      titleEn: 'Shipped',
      titleAm: 'ተልኳል',
      subtitleEn: 'Out for Express Delivery with Courier',
      subtitleAm: 'በካስማ ኤክስፕረስ መልዕክተኛ በጉዞ ላይ',
      icon: Truck,
      timeEn: 'In Transit Now',
      timeAm: 'አሁን በጉዞ ላይ',
      locationEn: 'En-route to Destination Address',
      locationAm: 'ወደ ተቀባዩ አድራሻ በጉዞ ላይ',
      detailsEn: [
        'Courier dispatched on electric delivery bike',
        'Real-time GPS telemetry link active',
        'Direct phone call verification before final arrival'
      ],
      detailsAm: [
        'የካስማ ኤክስፕረስ መልዕክተኛ ተሰማርቷል',
        'የጂፒኤስ የቦታ መከታተያ ገቢር ነው',
        'እቃው ከመርሰሱ በፊት በስልክ ይደወላል'
      ]
    },
    {
      key: 'DELIVERED',
      stepNumber: 4,
      titleEn: 'Delivered',
      titleAm: 'ደርሷል',
      subtitleEn: 'Handed Over & Customer Confirmed',
      subtitleAm: 'ለተቀባዩ በስኬት ተረክቧል',
      icon: CheckCircle2,
      timeEn: 'Destination Reached',
      timeAm: 'ቦታው ደርሷል',
      locationEn: order?.shippingAddress || 'Customer Address, Addis Ababa',
      locationAm: order?.shippingAddress || 'የተቀባይ አድራሻ፣ አዲስ አበባ',
      detailsEn: [
        'OTP / Signature verification completed',
        'Customer inspected package content integrity',
        'Order status closed in Kasma global ledger'
      ],
      detailsAm: [
        'የስልክ ማረጋገጫ ኮድ ተረጋግጧል',
        'ደንበኛው እቃውን ተረክቦ አረጋግጧል',
        'ትዕዛዙ በስኬት ተጠናቋል'
      ]
    }
  ];

  const handleStageSelect = (idx: number) => {
    setSelectedStageIndex(idx);
  };

  const handleSimulateStatus = (stageKey: TrackingStageKey) => {
    let newStatus: Order['status'] = 'PAID';
    if (stageKey === 'ORDERED') newStatus = 'PAID';
    if (stageKey === 'VERIFIED') newStatus = 'PROCESSING';
    if (stageKey === 'SHIPPED') newStatus = 'SHIPPED';
    if (stageKey === 'DELIVERED') newStatus = 'DELIVERED';

    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setSelectedStageIndex(null);
  };

  const selectedStage = stages[activeStageIndex];
  const activeStageTheme = STAGE_COLOR_THEMES[activeStageIndex] || STAGE_COLOR_THEMES[0];
  const currentStageTheme = STAGE_COLOR_THEMES[Math.max(0, currentStageIndex)] || STAGE_COLOR_THEMES[0];

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 md:p-7 space-y-6 shadow-sm relative overflow-hidden ${className}`}>
      
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0052FF] animate-ping" />
            <h3 className="text-base font-black text-gray-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
              {language === 'en' ? 'Live Order Tracking Visualizer' : 'የቀጥታ ትዕዛዝ መከታተያ'}
            </h3>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
              {order ? order.id : 'KS-3829'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mt-1">
            {language === 'en'
              ? 'Click any step below to inspect stage telemetry & progress'
              : 'የትዕዛዝዎን ዝርዝር ሂደት ለማየት ከታች ያሉትን ደረጃዎች ይጫኑ'}
          </p>
        </div>

        {/* Current Status Pill with Stage-Specific Color */}
        <div className="flex items-center gap-2">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 ${currentStageTheme.pillBg}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
            <span>
              {language === 'en' 
                ? stages[Math.max(0, currentStageIndex)]?.titleEn 
                : stages[Math.max(0, currentStageIndex)]?.titleAm}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Progress Bar Component */}
      <div className="py-2 space-y-6">
        
        {/* Progress percent counter label */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {language === 'en' ? 'Fulfillment Progress Rate' : 'የትዕዛዝ ማጠናቀቂያ መጠን'}
          </span>
          <span className="font-mono font-black text-sm text-[#0052FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-900/40 shadow-2xs">
            {progressPercent.toFixed(0)}%
          </span>
        </div>

        {/* Progress Bar Track and Node Icons */}
        <div className="relative pt-3 pb-2 overflow-x-auto custom-scrollbar-x pb-4">
          
          {/* Track Background Line - Aligned perfectly with 48px circle centers (24px top) */}
          <div className="absolute top-6 left-8 right-8 h-2 bg-gray-200 dark:bg-zinc-800 rounded-full" />

          {/* Active Progress Line Fill with Distinct Multi-Color Gradient */}
          <div 
            className="absolute top-6 left-8 h-2 bg-gradient-to-r from-amber-500 via-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `calc(${progressPercent}% * 0.88)` }}
          />

          {/* 4 Interactive Stage Nodes */}
          <div className="relative flex justify-between items-center z-10 min-w-[320px]">
            {stages.map((stg, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isSelected = idx === activeStageIndex;
              const IconComp = stg.icon;
              const stgTheme = STAGE_COLOR_THEMES[idx];

              return (
                <div 
                  key={stg.key}
                  onClick={() => handleStageSelect(idx)}
                  className="flex flex-col items-center group cursor-pointer select-none"
                >
                  {/* Circular Node Button with Distinct Stage Colors */}
                  <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 transform-gpu relative ${
                    isSelected
                      ? `${stgTheme.nodeActive}`
                      : isCurrent
                      ? `${stgTheme.nodeActive}`
                      : isCompleted
                      ? `${stgTheme.nodeCompleted} shadow-md`
                      : 'bg-white dark:bg-zinc-850 border-gray-300 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 hover:border-gray-400'
                  }`}>
                    {isSelected && (
                      <span className="absolute -top-2 -right-1 bg-[#0052FF] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-md animate-bounce">
                        ★
                      </span>
                    )}
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white stroke-[3]" />
                    ) : (
                      <IconComp className="w-5 h-5" />
                    )}
                  </div>

                  {/* Stage Label & Number */}
                  <div className="mt-3 text-center space-y-0.5">
                    <span className={`text-[9px] font-mono uppercase tracking-widest block ${
                      isSelected || isCurrent ? stgTheme.stepText : 'text-gray-400 dark:text-zinc-500 font-bold'
                    }`}>
                      {isSelected ? '★ SELECTED' : `Step 0${stg.stepNumber}`}
                    </span>
                    <h5 className={`text-xs tracking-tight ${
                      isSelected || isCurrent 
                        ? 'font-black text-gray-950 dark:text-white' 
                        : isCompleted
                        ? 'font-bold text-gray-700 dark:text-zinc-300'
                        : 'font-medium text-gray-400 dark:text-zinc-500'
                    }`}>
                      {language === 'en' ? stg.titleEn : stg.titleAm}
                    </h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Controls / Simulation Bar */}
        <div className="bg-gray-100/80 dark:bg-zinc-850/80 p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-750 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-zinc-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#0052FF]" />
            {language === 'en' ? 'Quick Stage Switcher:' : 'ደረጃውን በሙከራ ይቀይሩ:'}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {stages.map((stg, stgIdx) => (
              <button
                key={`sim-${stg.key}`}
                onClick={() => handleSimulateStatus(stg.key)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                  stages[currentStageIndex]?.key === stg.key
                    ? STAGE_COLOR_THEMES[stgIdx].simBtnActive
                    : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 border-gray-250 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                {stg.stepNumber}. {language === 'en' ? stg.titleEn : stg.titleAm}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Detailed Stage Telemetry Card with High Contrast "SELECTED AREA" Badge */}
      {selectedStage && (
        <div 
          ref={detailCardRef}
          className={`${activeStageTheme.cardBg} rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-md relative`}
        >
          {/* Un-missable Selected Area Header Badge */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-black/10 dark:border-white/10">
            <span className="bg-[#0052FF] text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'SELECTED STAGE INSPECTION' : 'የተመረጠው ደረጃ ዝርዝር'}</span>
            </span>

            <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-zinc-300">
              Stage 0{selectedStage.stepNumber} of 04
            </span>
          </div>
          
          <div className="flex flex-wrap justify-between items-start gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${activeStageTheme.cardHeaderIcon}`}>
                <selectedStage.icon className="w-6 h-6" />
              </div>
              <div>
                <span className={`text-[9px] font-mono font-black uppercase tracking-widest block ${activeStageTheme.cardHeaderLabel}`}>
                  Active View
                </span>
                <h4 className="text-sm font-black text-gray-950 dark:text-white">
                  {language === 'en' ? selectedStage.titleEn : selectedStage.titleAm} — {language === 'en' ? selectedStage.subtitleEn : selectedStage.subtitleAm}
                </h4>
              </div>
            </div>

            <div className="text-right bg-white/80 dark:bg-zinc-850 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10">
              <span className="text-[9px] text-gray-500 dark:text-zinc-400 uppercase font-black block">
                {language === 'en' ? 'Timestamp' : 'ሰዓት'}
              </span>
              <span className="font-mono text-xs font-black text-gray-900 dark:text-zinc-100 flex items-center gap-1">
                <Clock className={`w-3.5 h-3.5 ${activeStageTheme.stepText}`} />
                {language === 'en' ? selectedStage.timeEn : selectedStage.timeAm}
              </span>
            </div>
          </div>

          {/* Location & Log Checkpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-black/10 dark:border-white/10 text-xs">
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-zinc-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {language === 'en' ? 'Hub / Checkpoint Location' : 'የአሁኑ መገኛ ቦታ'}
              </span>
              <p className="font-bold text-gray-900 dark:text-zinc-100 bg-white/90 dark:bg-zinc-850 p-3 rounded-xl border border-black/10 dark:border-white/10 shadow-2xs">
                {language === 'en' ? selectedStage.locationEn : selectedStage.locationAm}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-zinc-300">
                {language === 'en' ? 'Automated Log Checkpoints' : 'የተመዘገቡ ሂደት መረጃዎች'}
              </span>
              <ul className="space-y-1.5 bg-white/90 dark:bg-zinc-850 p-3 rounded-xl border border-black/10 dark:border-white/10 shadow-2xs">
                {(language === 'en' ? selectedStage.detailsEn : selectedStage.detailsAm).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-800 dark:text-zinc-200">
                    <span className={`font-black ${activeStageTheme.stepText}`}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* Order Item List Summary if order provided and requested */}
      {order && showItemsSummary && (
        <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400">
              {language === 'en' ? 'Package Contents & Destination' : 'የእቃው ዝርዝር እና መድረሻ'}
            </span>
            <span className="font-mono font-black text-xs text-gray-900 dark:text-zinc-100 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
              Total: {order.total.toLocaleString()} ETB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-gray-50 dark:bg-zinc-850 p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-1 text-xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 block">
                {language === 'en' ? 'Recipient Details' : 'የተቀባይ መረጃ'}
              </span>
              <p className="font-bold text-gray-900 dark:text-zinc-100">{order.customerName}</p>
              <p className="font-mono text-gray-500 dark:text-zinc-400 text-[11px]">{order.customerPhone}</p>
              <p className="text-gray-700 dark:text-zinc-300 text-[11px] truncate">{order.shippingAddress}</p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-850 p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-1 text-xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 block">
                {language === 'en' ? 'Items in Shipment' : 'በትዕዛዙ ውስጥ የሚገኙ እቃዎች'}
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] py-0.5 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                    <span className="truncate text-gray-800 dark:text-zinc-200 font-medium">
                      {it.quantity}x {it.product.nameEn}
                    </span>
                    <span className="font-mono text-gray-600 dark:text-zinc-400 shrink-0 font-bold ml-2">
                      {(it.price * it.quantity).toLocaleString()} ETB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

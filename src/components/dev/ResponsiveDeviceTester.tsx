import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Maximize2, 
  Minimize2,
  Sliders,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export const ResponsiveDeviceTester: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
  const [activeTier, setActiveTier] = useState<'small' | 'medium' | 'large'>('large');

  // Track window dimensions and calculate active Tailwind breakpoint
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewportWidth(w);
      setViewportHeight(h);

      if (w < 640) {
        setActiveTier('small');
      } else if (w < 1024) {
        setActiveTier('medium');
      } else {
        setActiveTier('large');
      }

      // Check if document has horizontal overflow
      const docWidth = document.documentElement.scrollWidth;
      setHasHorizontalOverflow(docWidth > w + 2); // 2px margin for subpixel precision
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpointLabel = () => {
    if (viewportWidth < 640) return '< sm (Mobile Phone)';
    if (viewportWidth < 768) return 'sm (Large Phone / Small Tablet)';
    if (viewportWidth < 1024) return 'md (Tablet Portrait)';
    if (viewportWidth < 1280) return 'lg (Tablet Landscape / Laptop)';
    if (viewportWidth < 1536) return 'xl (Desktop Monitor)';
    return '2xl (Ultra-wide Desktop)';
  };

  // Only render during development or when explicitly triggered
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans antialiased">
      {/* Floating Viewport Pill */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 dark:bg-zinc-900/90 hover:bg-[#0052FF] text-white shadow-2xl border border-white/20 backdrop-blur-md text-xs font-bold transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Open Mobile Responsiveness Inspector"
        >
          {activeTier === 'small' && <Smartphone className="w-3.5 h-3.5 text-blue-400" />}
          {activeTier === 'medium' && <Tablet className="w-3.5 h-3.5 text-amber-400" />}
          {activeTier === 'large' && <Monitor className="w-3.5 h-3.5 text-emerald-400" />}
          
          <span className="font-mono text-[11px]">{viewportWidth}×{viewportHeight}</span>
          
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
            activeTier === 'small' 
              ? 'bg-blue-500/20 text-blue-300' 
              : activeTier === 'medium' 
                ? 'bg-amber-500/20 text-amber-300' 
                : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {activeTier.toUpperCase()}
          </span>

          {hasHorizontalOverflow && (
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" title="Horizontal Overflow Detected!" />
          )}
        </button>
      ) : (
        /* Expanded Inspector Drawer */
        <div className="w-80 sm:w-96 bg-white dark:bg-[#111827] rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-[#0052FF]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Responsive Device Inspector
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">
                  {viewportWidth}px × {viewportHeight}px • {getBreakpointLabel()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Health Status */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Horizontal Overflow:</span>
              {hasHorizontalOverflow ? (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Overflow Detected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>No Overflow (100% Fluid)</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Viewport Scaling:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {activeTier === 'small' && '📱 Small (Mobile)'}
                {activeTier === 'medium' && '📟 Medium (Tablet)'}
                {activeTier === 'large' && '💻 Large (Desktop)'}
              </span>
            </div>
          </div>

          {/* Standard Target Device Viewports */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target Device Matrix (Small, Medium, Large)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {/* Small */}
              <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 text-center">
                <Smartphone className="w-4 h-4 text-[#0052FF] mx-auto mb-1" />
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Mobile</div>
                <div className="text-[9px] font-mono text-slate-500">360 - 430px</div>
              </div>

              {/* Medium */}
              <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-center">
                <Tablet className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Tablet</div>
                <div className="text-[9px] font-mono text-slate-500">640 - 1024px</div>
              </div>

              {/* Large */}
              <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 text-center">
                <Monitor className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Desktop</div>
                <div className="text-[9px] font-mono text-slate-500">&gt; 1024px</div>
              </div>
            </div>
          </div>

          {/* Mobile Responsiveness Principles Checklist */}
          <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Fluid widths &amp; no horizontal scroll blowout</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Touch targets &ge; 40px for comfortable mobile taps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Responsive grid breakdown (1 col mobile &rarr; 4 cols desktop)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Safe-area insets &amp; notched mobile screen support</span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      )}
    </div>
  );
};

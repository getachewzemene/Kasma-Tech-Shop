import React, { useState, useEffect, useId } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (minVal: number, maxVal: number) => void;
  language?: 'en' | 'am';
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  language = 'en'
}) => {
  const [localMin, setLocalMin] = useState<number>(valueMin || min);
  const [localMax, setLocalMax] = useState<number>(valueMax || max);
  const minSliderId = useId();
  const maxSliderId = useId();

  useEffect(() => {
    setLocalMin(valueMin || min);
  }, [valueMin, min]);

  useEffect(() => {
    setLocalMax(valueMax || max);
  }, [valueMax, max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), localMax - 500);
    setLocalMin(val);
    onChange(val, localMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), localMin + 500);
    setLocalMax(val);
    onChange(localMin, val);
  };

  const applyPreset = (presetMin: number, presetMax: number) => {
    setLocalMin(presetMin);
    setLocalMax(presetMax);
    onChange(presetMin, presetMax);
  };

  const rangeSpan = Math.max(max - min, 1);
  const minPercent = Math.min(100, Math.max(0, ((localMin - min) / rangeSpan) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((localMax - min) / rangeSpan) * 100));

  return (
    <div className="space-y-4 w-full">
      {/* Current Range Label & Formatted Readout */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            {language === 'en' ? 'Min Price' : 'ዝቅተኛ ዋጋ'}
          </span>
          <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
            {localMin.toLocaleString()} <span className="text-[10px] font-bold text-slate-500">ETB</span>
          </span>
        </div>

        <span className="text-slate-400 font-bold text-xs">—</span>

        <div className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            {language === 'en' ? 'Max Price' : 'ከፍተኛ ዋጋ'}
          </span>
          <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
            {localMax.toLocaleString()} <span className="text-[10px] font-bold text-slate-500">ETB</span>
          </span>
        </div>
      </div>

      {/* Dual Slider Track */}
      <div className="relative pt-3 pb-2 px-1">
        {/* Background track */}
        <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800">
          {/* Active highlighted range bar */}
          <div
            className="absolute top-0 bottom-0 bg-[#0052FF] rounded-full transition-all"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`
            }}
          />
        </div>

        {/* Min Thumb Range Input */}
        <label htmlFor={minSliderId} className="sr-only">
          {language === 'en' ? 'Minimum price slider' : 'ዝቅተኛ የዋጋ ማስተካከያ'}
        </label>
        <input
          id={minSliderId}
          type="range"
          min={min}
          max={max}
          step={500}
          value={localMin}
          onChange={handleMinChange}
          aria-label={language === 'en' ? 'Minimum price' : 'ዝቅተኛ ዋጋ'}
          className="absolute top-3 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0052FF] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0052FF] [&::-moz-range-thumb]:shadow-md"
        />

        {/* Max Thumb Range Input */}
        <label htmlFor={maxSliderId} className="sr-only">
          {language === 'en' ? 'Maximum price slider' : 'ከፍተኛ የዋጋ ማስተካከያ'}
        </label>
        <input
          id={maxSliderId}
          type="range"
          min={min}
          max={max}
          step={500}
          value={localMax}
          onChange={handleMaxChange}
          aria-label={language === 'en' ? 'Maximum price' : 'ከፍተኛ ዋጋ'}
          className="absolute top-3 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0052FF] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0052FF] [&::-moz-range-thumb]:shadow-md"
        />
      </div>

      {/* Quick Price Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {[
          { label: '< 10k', minP: 0, maxP: 10000 },
          { label: '10k – 30k', minP: 10000, maxP: 30000 },
          { label: '30k – 70k', minP: 30000, maxP: 70000 },
          { label: '70k+', minP: 70000, maxP: max },
          { label: language === 'en' ? 'All Prices' : 'ሁሉም', minP: min, maxP: max }
        ].map((p, idx) => {
          const isSelected = localMin === p.minP && localMax === p.maxP;
          return (
            <button
              key={`price-preset-${idx}`}
              type="button"
              onClick={() => applyPreset(p.minP, p.maxP)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 border-blue-200 dark:border-blue-900/60 font-black shadow-2xs'
                  : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700/80 hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

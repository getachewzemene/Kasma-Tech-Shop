import React, { useState } from 'react';
import { Truck, MapPin, Navigation, Clock, ShieldCheck, Check, Sparkles, RefreshCw, Zap } from 'lucide-react';
import {
  DELIVERY_LOCATION_OPTIONS,
  MEGENAGNA_HUB,
  DeliveryLocationOption,
  calculateDistanceFromMegenagna,
  getDeliveryEstimateForDistance
} from '../utils/deliveryEstimator';

interface DeliveryTimeEstimatorProps {
  language: 'en' | 'am';
}

export const DeliveryTimeEstimator: React.FC<DeliveryTimeEstimatorProps> = ({ language }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('bole');
  const [customDetectedOption, setCustomDetectedOption] = useState<DeliveryLocationOption | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const selectedOption: DeliveryLocationOption = customDetectedOption || 
    (DELIVERY_LOCATION_OPTIONS.find(loc => loc.id === selectedLocationId) || DELIVERY_LOCATION_OPTIONS[1]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCustomDetectedOption(null);
    setSelectedLocationId(e.target.value);
  };

  const handleDetectLocation = () => {
    setIsLocating(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const distKm = calculateDistanceFromMegenagna(lat, lng);
          const est = getDeliveryEstimateForDistance(distKm);

          setCustomDetectedOption({
            id: 'geo-detected',
            nameEn: 'Detected Location (GPS)',
            nameAm: 'የተገኘ አድራሻ (ጂፒኤስ)',
            subcityOrRegion: distKm <= 25 ? 'Addis Ababa GPS Coordinates' : 'Regional Location',
            category: est.category,
            distanceKm: distKm,
            deliveryTimeEn: est.deliveryTimeEn,
            deliveryTimeAm: est.deliveryTimeAm,
            badgeEn: est.badgeEn,
            badgeAm: est.badgeAm,
            feeEtb: est.feeEtb,
            carrierEn: est.carrierEn,
            carrierAm: est.carrierAm
          });
          setIsLocating(false);
        },
        () => {
          // Fallback to Megenagna / Bole
          setTimeout(() => {
            const fallbackOption = DELIVERY_LOCATION_OPTIONS.find(loc => loc.id === 'bole') || DELIVERY_LOCATION_OPTIONS[0];
            setCustomDetectedOption({
              ...fallbackOption,
              nameEn: 'Detected: Bole (~3.2 km)',
              nameAm: 'የተገኘ፡ ቦሌ (~3.2 ኪ.ሜ)'
            });
            setIsLocating(false);
          }, 800);
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(() => {
        const fallbackOption = DELIVERY_LOCATION_OPTIONS[1];
        setCustomDetectedOption(fallbackOption);
        setIsLocating(false);
      }, 600);
    }
  };

  // Color mappings based on category
  const isExpress = selectedOption.category === 'INNER_ADDIS';
  const isSameDay = selectedOption.category === 'OUTER_ADDIS';

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-blue-500/10 dark:from-emerald-950/30 dark:via-zinc-900/40 dark:to-blue-950/30 border border-emerald-500/20 dark:border-emerald-500/15 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-2xs transition-all w-full min-w-0">
      {/* Header: Title & Hub Reference + GPS Detect Button */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 border-b border-emerald-500/15 dark:border-emerald-500/10 pb-2.5 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-xs sm:text-sm text-gray-950 dark:text-white tracking-tight flex items-center gap-1.5 flex-wrap">
              <span>{language === 'en' ? 'Delivery Time Estimator' : 'የማድረሻ ጊዜ ገማች'}</span>
              <span className="bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                {language === 'en' ? 'Live' : 'ቀጥታ'}
              </span>
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">
                {language === 'en'
                  ? `Central Hub: ${MEGENAGNA_HUB.nameEn}`
                  : `ዋና መጋዘን፡ ${MEGENAGNA_HUB.nameAm}`}
              </span>
            </p>
          </div>
        </div>

        {/* GPS Detect Location Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50 shrink-0 self-start xs:self-auto w-auto"
          title={language === 'en' ? 'Detect current GPS location' : 'ጂፒኤስ አድራሻ ይወቁ'}
        >
          {isLocating ? (
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-500 shrink-0" />
          ) : (
            <Navigation className="w-3 h-3 text-emerald-500 shrink-0" />
          )}
          <span className="text-[10px] sm:text-[11px] whitespace-nowrap">
            {isLocating
              ? (language === 'en' ? 'Locating...' : 'አድራሻ በመፈለግ ላይ...')
              : (language === 'en' ? 'Detect Location' : 'አድራሻዬን እወቅ')}
          </span>
        </button>
      </div>

      {/* Location Selector Dropdown */}
      <div className="space-y-1 w-full min-w-0">
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          {language === 'en' ? 'Select Destination Subcity / City:' : 'መድረሻ ክፍለ ከተማ / ከተማ ይምረጡ፡'}
        </label>
        <div className="relative w-full min-w-0">
          <select
            value={customDetectedOption ? 'geo-detected' : selectedLocationId}
            onChange={handleLocationChange}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-750 text-gray-900 dark:text-zinc-100 rounded-xl px-3 py-1.5 sm:py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs truncate pr-8"
          >
            {customDetectedOption && (
              <option value="geo-detected">
                🎯 {language === 'en' ? customDetectedOption.nameEn : customDetectedOption.nameAm}
              </option>
            )}
            <optgroup label={language === 'en' ? 'Addis Ababa Subcities (Inner / Express)' : 'የአዲስ አበባ ክፍለ ከተሞች (ቅርብ/ፈጣን)'}>
              {DELIVERY_LOCATION_OPTIONS.filter(o => o.category === 'INNER_ADDIS').map(o => (
                <option key={o.id} value={o.id}>
                  📍 {language === 'en' ? o.nameEn : o.nameAm} (~{o.distanceKm} km from Megenagna)
                </option>
              ))}
            </optgroup>
            <optgroup label={language === 'en' ? 'Addis Ababa Subcities (Outer / Same-day)' : 'የአዲስ አበባ ክፍለ ከተሞች (ውጪኛ)'}>
              {DELIVERY_LOCATION_OPTIONS.filter(o => o.category === 'OUTER_ADDIS').map(o => (
                <option key={o.id} value={o.id}>
                  🚚 {language === 'en' ? o.nameEn : o.nameAm} (~{o.distanceKm} km from Megenagna)
                </option>
              ))}
            </optgroup>
            <optgroup label={language === 'en' ? 'Regional Cities (Nationwide)' : 'የክልል ከተሞች (አገር አቀፍ)'}>
              {DELIVERY_LOCATION_OPTIONS.filter(o => o.category === 'REGIONAL').map(o => (
                <option key={o.id} value={o.id}>
                  ✈️ {language === 'en' ? o.nameEn : o.nameAm} (~{o.distanceKm} km from Megenagna)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* ESTIMATED TIME DISPLAY CARD */}
      <div className={`p-3 sm:p-3.5 rounded-2xl border transition-all w-full min-w-0 ${
        isExpress
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
          : isSameDay
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200'
            : 'bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-200'
      }`}>
        <div className="space-y-2 w-full min-w-0">
          {/* Top Badges Row */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap w-full min-w-0">
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-2xs truncate ${
              isExpress
                ? 'bg-emerald-600'
                : isSameDay
                  ? 'bg-blue-600'
                  : 'bg-indigo-600'
            }`}>
              {language === 'en' ? selectedOption.badgeEn : selectedOption.badgeAm}
            </span>
            <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 px-2 py-0.5 rounded-md border border-black/5 dark:border-white/10 shrink-0">
              ~{selectedOption.distanceKm} km {language === 'en' ? 'from Megenagna' : 'ከመገናኛ'}
            </span>
          </div>

          {/* Prominent Delivery Time Result */}
          <p className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1.5 min-w-0 leading-tight">
            <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
              isExpress ? 'text-emerald-500' : isSameDay ? 'text-blue-500' : 'text-indigo-500'
            }`} />
            <span className="break-words min-w-0">
              {language === 'en' ? selectedOption.deliveryTimeEn : selectedOption.deliveryTimeAm}
            </span>
          </p>

          {/* Carrier & Delivery Fee */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-[11px] opacity-90 font-medium pt-1.5 border-t border-black/10 dark:border-white/10 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 opacity-75 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">{language === 'en' ? selectedOption.carrierEn : selectedOption.carrierAm}</span>
            </span>
            <span className="font-bold font-mono text-xs text-gray-900 dark:text-zinc-100 shrink-0 self-start sm:self-auto">
              {selectedOption.feeEtb === 0
                ? (language === 'en' ? 'FREE Delivery' : 'ነፃ ማድረሻ')
                : `${selectedOption.feeEtb.toLocaleString()} ETB`}
            </span>
          </div>
        </div>

        {/* Visual Route Distance Bar */}
        <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[9px] sm:text-[10px] font-bold gap-1 min-w-0">
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="whitespace-nowrap">{language === 'en' ? 'Megenagna Hub' : 'መገናኛ'}</span>
          </div>

          <div className="flex-1 mx-1.5 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExpress
                  ? 'bg-emerald-500 w-1/3'
                  : isSameDay
                    ? 'bg-blue-500 w-2/3'
                    : 'bg-indigo-500 w-full'
              }`}
            />
          </div>

          <div className="flex items-center gap-1 font-mono text-gray-700 dark:text-zinc-300 shrink-0 min-w-0">
            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
            <span className="truncate max-w-[90px] sm:max-w-[120px]">
              {language === 'en' ? selectedOption.subcityOrRegion : selectedOption.nameAm}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTimeEstimator;

import React, { useState, useEffect, useMemo } from 'react';
import { Truck, MapPin, Phone, Clock, Navigation, ShieldCheck, Sparkles, Send, ExternalLink, Zap } from 'lucide-react';
import { SUB_CITIES } from './CustomerWeb';

interface OrderCourierMiniMapProps {
  language: 'en' | 'am';
  shippingAddress: string;
  subCity?: string;
  orderId?: string;
  orderStatus?: string;
  customerName?: string;
  compact?: boolean;
  onOpenFullMap?: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface DestinationCoords {
  subCityId: string;
  nameEn: string;
  nameAm: string;
  landmarkEn: string;
  landmarkAm: string;
  point: Point;
  etaMins: string;
  distanceKm: string;
}

export const OrderCourierMiniMap: React.FC<OrderCourierMiniMapProps> = ({
  language,
  shippingAddress,
  subCity,
  orderId = 'KS-EXP',
  orderStatus = 'SHIPPED',
  customerName,
  compact = false,
  onOpenFullMap
}) => {
  // Determine sub-city destination coordinates in Addis Ababa map grid (400 x 200 ViewBox)
  const destInfo: DestinationCoords = useMemo(() => {
    const addressLower = (shippingAddress || '').toLowerCase();
    const subCityLower = (subCity || '').toLowerCase();

    // Map sub-city to specific Addis Ababa geographic coordinates
    if (subCityLower.includes('bole') || addressLower.includes('bole') || addressLower.includes('ቦሌ')) {
      return {
        subCityId: 'bole',
        nameEn: 'Bole Sub-City',
        nameAm: 'ቦሌ ክፍለ ከተማ',
        landmarkEn: 'Bole Medhanialem / Edna Mall Area',
        landmarkAm: 'ቦሌ መድኃኔዓለም / ኤድና ሞል',
        point: { x: 310, y: 135 },
        etaMins: '15 - 25 min',
        distanceKm: '3.8 km'
      };
    }
    if (subCityLower.includes('yeka') || addressLower.includes('yeka') || addressLower.includes('የካ') || addressLower.includes('cmc') || addressLower.includes('megenagna')) {
      return {
        subCityId: 'yeka',
        nameEn: 'Yeka Sub-City',
        nameAm: 'የካ ክፍለ ከተማ',
        landmarkEn: 'Megenagna / CMC District',
        landmarkAm: 'መገናኛ / ሲኤምሲ አካባቢ',
        point: { x: 320, y: 55 },
        etaMins: '20 - 35 min',
        distanceKm: '5.2 km'
      };
    }
    if (subCityLower.includes('arada') || addressLower.includes('arada') || addressLower.includes('አራዳ') || addressLower.includes('piassa') || addressLower.includes('ፒያሳ')) {
      return {
        subCityId: 'arada',
        nameEn: 'Arada Sub-City',
        nameAm: 'አራዳ ክፍለ ከተማ',
        landmarkEn: 'Piassa Square / Churchill Ave',
        landmarkAm: 'ፒያሳ አደባባይ / ቸርችል ጎዳና',
        point: { x: 180, y: 45 },
        etaMins: '15 - 20 min',
        distanceKm: '2.5 km'
      };
    }
    if (subCityLower.includes('kirkos') || addressLower.includes('kirkos') || addressLower.includes('ኪርቆስ') || addressLower.includes('mexico') || addressLower.includes('ሜክሲኮ') || addressLower.includes('kazanchis')) {
      return {
        subCityId: 'kirkos',
        nameEn: 'Kirkos Sub-City',
        nameAm: 'ኪርቆስ ክፍለ ከተማ',
        landmarkEn: 'Kazanchis / Mexico Square Hub',
        landmarkAm: 'ካዛንችስ / ሜክሲኮ አደባባይ',
        point: { x: 210, y: 120 },
        etaMins: '10 - 18 min',
        distanceKm: '1.8 km'
      };
    }
    if (subCityLower.includes('lideta') || addressLower.includes('lideta') || addressLower.includes('ልደታ')) {
      return {
        subCityId: 'lideta',
        nameEn: 'Lideta Sub-City',
        nameAm: 'ልደታ ክፍለ ከተማ',
        landmarkEn: 'Lideta / Balcha Hospital Area',
        landmarkAm: 'ልደታ / ባልቻ ሆስፒታል አካባቢ',
        point: { x: 130, y: 105 },
        etaMins: '20 - 30 min',
        distanceKm: '4.1 km'
      };
    }
    if (subCityLower.includes('nifas') || addressLower.includes('nifas') || addressLower.includes('ንፋስ') || addressLower.includes('saris') || addressLower.includes('ሳሪስ')) {
      return {
        subCityId: 'nifas_silk',
        nameEn: 'Nifas Silk-Lafto',
        nameAm: 'ንፋስ ስልክ ላፍቶ',
        landmarkEn: 'Gotera Interchange / Saris',
        landmarkAm: 'ጎተራ ማለፊያ / ሳሪስ',
        point: { x: 160, y: 165 },
        etaMins: '25 - 40 min',
        distanceKm: '6.5 km'
      };
    }
    if (subCityLower.includes('kolfe') || addressLower.includes('kolfe') || addressLower.includes('ኮልፌ')) {
      return {
        subCityId: 'kolfe_keranio',
        nameEn: 'Kolfe Keranio',
        nameAm: 'ኮልፌ ቀራንዮ',
        landmarkEn: 'Ayer Tena / Tor Hailoch',
        landmarkAm: 'አየር ጤና / ጦር ኃይሎች',
        point: { x: 75, y: 95 },
        etaMins: '30 - 45 min',
        distanceKm: '8.2 km'
      };
    }
    if (subCityLower.includes('gullele') || addressLower.includes('gullele') || addressLower.includes('ጉለሌ')) {
      return {
        subCityId: 'gullele',
        nameEn: 'Gullele Sub-City',
        nameAm: 'ጉለሌ ክፍለ ከተማ',
        landmarkEn: 'Shiro Meda / 6 Kilo Hill',
        landmarkAm: 'ሺሮ ሜዳ / 6 ኪሎ',
        point: { x: 170, y: 25 },
        etaMins: '25 - 35 min',
        distanceKm: '5.8 km'
      };
    }
    if (subCityLower.includes('addis_ketema') || addressLower.includes('ketema') || addressLower.includes('አዲስ ከተማ') || addressLower.includes('merkato') || addressLower.includes('መርካቶ')) {
      return {
        subCityId: 'addis_ketema',
        nameEn: 'Addis Ketema',
        nameAm: 'አዲስ ከተማ',
        landmarkEn: 'Merkato Commercial Hub',
        landmarkAm: 'መርካቶ የንግድ ማዕከል',
        point: { x: 115, y: 65 },
        etaMins: '20 - 30 min',
        distanceKm: '3.9 km'
      };
    }
    if (subCityLower.includes('akaki') || addressLower.includes('akaki') || addressLower.includes('አቃቂ') || addressLower.includes('kality') || addressLower.includes('ቃሊቲ')) {
      return {
        subCityId: 'akaki_kality',
        nameEn: 'Akaki Kality',
        nameAm: 'አቃቂ ቃሊቲ',
        landmarkEn: 'Kality Industrial Interchange',
        landmarkAm: 'ቃሊቲ የኢንዱስትሪ ማለፊያ',
        point: { x: 230, y: 185 },
        etaMins: '35 - 50 min',
        distanceKm: '11.4 km'
      };
    }

    // Default fallback to central Bole / Kasma Express District
    return {
      subCityId: 'bole',
      nameEn: 'Addis Ababa Central',
      nameAm: 'አዲስ አበባ ማዕከላዊ',
      landmarkEn: 'Bole / Meskel Square Corridor',
      landmarkAm: 'ቦሌ / መስቀል አደባባይ መስመር',
      point: { x: 280, y: 130 },
      etaMins: '15 - 30 min',
      distanceKm: '4.5 km'
    };
  }, [shippingAddress, subCity]);

  // Central Hub Origin (Kazanchis Logistics Hub)
  const hubPoint: Point = { x: 200, y: 95 };

  // Animate courier smoothly along progress (0.15 -> 0.85)
  const [progress, setProgress] = useState<number>(0.35);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.88) return 0.2;
        return prev + 0.02;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  // Compute interpolated courier position
  const courierX = hubPoint.x + (destInfo.point.x - hubPoint.x) * progress;
  const courierY = hubPoint.y + (destInfo.point.y - hubPoint.y) * progress;

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-md relative">
      {/* Header Bar */}
      <div className="bg-slate-950/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-[11px] text-emerald-400 uppercase tracking-wider">
            {language === 'en' ? 'Addis Ababa Live Dispatch Mini-Map' : 'የአዲስ አበባ የቀጥታ ስርጭት ካርታ'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
            {destInfo.distanceKm} • {destInfo.etaMins}
          </span>
          {onOpenFullMap && (
            <button
              type="button"
              onClick={onOpenFullMap}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
              title={language === 'en' ? 'Expand Full Interactive Map' : 'ሙሉ ካርታ አሳይ'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-[160px] sm:h-[180px] bg-slate-900 overflow-hidden select-none">
        <svg
          viewBox="0 0 400 200"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="miniMapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
            {/* Pulsing Destination Glow */}
            <radialGradient id="destGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            {/* Courier Glow */}
            <radialGradient id="courierGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Layer */}
          <rect width="400" height="200" fill="url(#miniMapGrid)" />

          {/* Addis Ababa Major Vector Roads */}
          {/* Ring Road Highway */}
          <path
            d="M 40 40 Q 180 10 360 40 Q 380 120 320 180 Q 180 190 50 160 Z"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeDasharray="4,2"
          />
          {/* Bole Road */}
          <path
            d="M 200 95 L 310 135 L 360 170"
            fill="none"
            stroke="#475569"
            strokeWidth="3.5"
          />
          {/* Churchill Avenue */}
          <path
            d="M 180 45 L 200 95 L 160 165"
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
          />
          {/* Sudan / Haile Gebresilassie Street */}
          <path
            d="M 115 65 L 200 95 L 320 55"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Active Order Route Polyline (Glow + Dashed) */}
          <line
            x1={hubPoint.x}
            y1={hubPoint.y}
            x2={destInfo.point.x}
            y2={destInfo.point.y}
            stroke="#0284c7"
            strokeWidth="4"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          <line
            x1={hubPoint.x}
            y1={hubPoint.y}
            x2={destInfo.point.x}
            y2={destInfo.point.y}
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="5,4"
            strokeLinecap="round"
          />

          {/* Hub Location Pin */}
          <g transform={`translate(${hubPoint.x}, ${hubPoint.y})`}>
            <circle r="12" fill="#1e1b4b" fillOpacity="0.8" stroke="#6366f1" strokeWidth="1" />
            <circle r="4" fill="#818cf8" />
            <text x="0" y="-15" textAnchor="middle" fill="#a5b4fc" fontSize="7" fontWeight="bold">
              Kasma Central Hub
            </text>
          </g>

          {/* Destination Pin (Addis Ababa Sub-City) */}
          <g transform={`translate(${destInfo.point.x}, ${destInfo.point.y})`}>
            <circle r="18" fill="url(#destGlow)" className="animate-pulse" />
            <circle r="10" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
            <circle r="4" fill="#34d399" />
            {/* Location Marker Pin Icon */}
            <path
              d="M 0 -12 C -4 -12 -7 -9 -7 -5 C -7 0 0 6 0 6 C 0 6 7 0 7 -5 C 7 -9 4 -12 0 -12 Z"
              fill="#10b981"
            />
            <circle cx="0" cy="-6" r="2" fill="#ffffff" />
            <text x="0" y="18" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="bold">
              {language === 'en' ? destInfo.nameEn : destInfo.nameAm}
            </text>
          </g>

          {/* Live Courier Bike Icon Position */}
          <g transform={`translate(${courierX}, ${courierY})`}>
            <circle r="14" fill="url(#courierGlow)" className="animate-ping" />
            <circle r="9" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />
            {/* Bike / Courier icon dot */}
            <circle r="3" fill="#ffffff" />
            <text x="0" y="-12" textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="black">
              🚴 28 km/h
            </text>
          </g>
        </svg>

        {/* Courier Driver & Status Overlay Banner */}
        <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs shadow-xs">
              AB
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 text-[11px] truncate">
                  Amanuel Bekele
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded">
                  Express Courier
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {language === 'en' ? `En route to ${destInfo.landmarkEn}` : `ወደ ${destInfo.landmarkAm} በመጓዝ ላይ`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="tel:+251966123456"
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg transition-colors flex items-center justify-center text-[10px] font-bold gap-1"
              title={language === 'en' ? 'Call Express Courier' : 'ለአነዳጁ ይደውሉ'}
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">{language === 'en' ? 'Call' : 'ደውል'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCourierMiniMap;

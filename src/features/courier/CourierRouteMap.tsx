import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Layers, 
  RefreshCw,
  Zap,
  Bike
} from 'lucide-react';
import { 
  CourierDriver, 
  DeliveryStop, 
  KASMA_CENTRAL_HUB, 
  projectAddisCoords 
} from './courierTypes';

interface CourierRouteMapProps {
  driver: CourierDriver;
  stops: DeliveryStop[];
  activeStopId?: string;
  onSelectStop: (stop: DeliveryStop) => void;
  language: 'en' | 'am';
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CourierRouteMap: React.FC<CourierRouteMapProps> = ({
  driver,
  stops,
  activeStopId,
  onSelectStop,
  language,
  isExpanded = false,
  onToggleExpand
}) => {
  // SVG Canvas dimensions
  const mapWidth = 600;
  const mapHeight = 360;

  // Zoom / Pan state
  const [zoom, setZoom] = useState(1);
  const [pulseTick, setPulseTick] = useState(0);

  // Pulse animation ticker for live GPS animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick(t => (t + 1) % 100);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Hub SVG coordinates
  const hubPoint = projectAddisCoords(KASMA_CENTRAL_HUB.lat, KASMA_CENTRAL_HUB.lng, mapWidth, mapHeight);

  // Driver SVG coordinates
  const driverPoint = projectAddisCoords(driver.currentLocation.lat, driver.currentLocation.lng, mapWidth, mapHeight);

  // Generate continuous route polyline through stops
  const routePoints = [hubPoint, ...stops.map(s => s.mapPoint)];
  const polylinePointsStr = routePoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={`relative bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden transition-all ${isExpanded ? 'h-[85vh]' : 'h-[320px] sm:h-[390px]'}`}>
      {/* Top Map HUD Bar */}
      <div className="absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent p-3 sm:p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wide">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>{language === 'en' ? 'LIVE ADDIS ROUTE' : 'የቀጥታ ስርጭት መስመር'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-full text-xs font-mono">
            <Bike className="w-3.5 h-3.5 text-blue-400" />
            <span>{driver.currentSpeedKmH} km/h • {driver.vehiclePlate}</span>
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setZoom(z => (z === 1 ? 1.25 : 1))}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60 shadow-md text-xs font-mono transition-colors cursor-pointer"
            title="Toggle Map Zoom"
          >
            <Compass className="w-4 h-4 text-slate-300" />
          </button>
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60 shadow-md text-xs transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize Map' : 'Full-Screen Map'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* SVG Vector Map Canvas */}
      <div className="w-full h-full relative overflow-hidden select-none bg-[#090d16]">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full object-cover transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: `${driverPoint.x}px ${driverPoint.y}px` }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="courierGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#162032" strokeWidth="0.6" />
            </pattern>

            {/* Glowing Driver Aura */}
            <radialGradient id="driverPulseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
            </radialGradient>

            {/* Active Destination Aura */}
            <radialGradient id="activeStopGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#d97706" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>

            {/* Hub Radial Glow */}
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width={mapWidth} height={mapHeight} fill="url(#courierGrid)" />

          {/* Addis Ababa Major Vector Arterial Roads Network */}
          {/* 1. Ring Road Outer Highway */}
          <path
            d="M 60 70 Q 240 15 520 70 Q 560 200 470 300 Q 280 340 90 280 Q 40 180 60 70 Z"
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M 60 70 Q 240 15 520 70 Q 560 200 470 300 Q 280 340 90 280 Q 40 180 60 70 Z"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="6,4"
          />

          {/* 2. Bole Road (Meskel Square -> Edna Mall / Airport) */}
          <path
            d="M 230 160 L 330 200 L 440 250"
            fill="none"
            stroke="#475569"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* 3. Sudan / Haile Gebresilassie / Megenagna / CMC Road */}
          <path
            d="M 170 120 L 260 140 L 410 125 L 530 145"
            fill="none"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* 4. Churchill Avenue (Piassa -> Mexico -> Gotera) */}
          <path
            d="M 230 70 L 210 160 L 190 230 L 260 300"
            fill="none"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* 5. Tor Hailoch / Ayer Tena Road */}
          <path
            d="M 210 160 L 120 180 L 70 230"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* 6. Entoto / 6 Kilo / Shiromeda Road */}
          <path
            d="M 230 70 L 245 40 L 255 15"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Subtle Key District Watermark Labels */}
          <text x="330" y="215" fill="#334155" fontSize="9" fontWeight="bold" letterSpacing="1">
            BOLE / EDNA
          </text>
          <text x="210" y="65" fill="#334155" fontSize="9" fontWeight="bold" letterSpacing="1">
            PIASSA
          </text>
          <text x="410" y="115" fill="#334155" fontSize="9" fontWeight="bold" letterSpacing="1">
            MEGENAGNA
          </text>
          <text x="495" y="165" fill="#334155" fontSize="9" fontWeight="bold" letterSpacing="1">
            CMC / AYAT
          </text>
          <text x="140" y="245" fill="#334155" fontSize="9" fontWeight="bold" letterSpacing="1">
            SARBET
          </text>
          <text x="110" y="125" fill="#334155" fontSize="9" fontWeight="bold" letterSpacing="1">
            MERKATO
          </text>

          {/* Dynamic Active Route Path Polyline */}
          <polyline
            points={polylinePointsStr}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeOpacity="0.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={polylinePointsStr}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Merchant Logistics Hub Pin (Kazanchis) */}
          <g transform={`translate(${hubPoint.x}, ${hubPoint.y})`} className="cursor-pointer">
            <circle r="18" fill="url(#hubGlow)" opacity="0.6" />
            <circle r="10" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
            <circle r="4" fill="#c7d2fe" />
            <text x="0" y="-14" textAnchor="middle" fill="#c7d2fe" fontSize="8" fontWeight="bold" className="drop-shadow">
              🏢 {language === 'en' ? 'Central Hub' : 'ማዕከላዊ መጋዘን'}
            </text>
          </g>

          {/* Delivery Stop Destination Pins */}
          {stops.map((stop) => {
            const isSelected = activeStopId === stop.order.id;
            const isDelivered = stop.status === 'DELIVERED';
            const isInTransit = stop.status === 'IN_TRANSIT';

            // Pin colors based on status
            const pinColor = isDelivered 
              ? '#10b981' // Emerald
              : isInTransit 
              ? '#f59e0b' // Amber
              : '#3b82f6'; // Blue

            return (
              <g
                key={stop.order.id}
                transform={`translate(${stop.mapPoint.x}, ${stop.mapPoint.y})`}
                onClick={() => onSelectStop(stop)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Active glow ring */}
                {isSelected && (
                  <circle r="22" fill="url(#activeStopGlow)" className="animate-pulse" />
                )}

                {/* Outer badge */}
                <circle
                  r={isSelected ? 14 : 11}
                  fill="#090d16"
                  stroke={pinColor}
                  strokeWidth={isSelected ? 3 : 2}
                  className="shadow-lg"
                />

                {/* Inner dot */}
                <circle
                  r={isSelected ? 6 : 4}
                  fill={pinColor}
                />

                {/* Stop Number Marker */}
                <text
                  x="0"
                  y={isSelected ? 4 : 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isSelected ? 9 : 8}
                  fontWeight="black"
                >
                  {stop.stopNumber}
                </text>

                {/* Floating Label */}
                <g transform="translate(0, 22)">
                  <rect
                    x={-50}
                    y={-10}
                    width={100}
                    height={16}
                    rx={8}
                    fill="#0f172a"
                    stroke={isSelected ? pinColor : '#334155'}
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="7"
                    fontWeight="bold"
                  >
                    {language === 'en' ? stop.landmark.nameEn.split('/')[0].trim() : stop.landmark.nameAm.split('/')[0].trim()}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Live Courier Motorbike Pin */}
          <g
            transform={`translate(${driverPoint.x}, ${driverPoint.y})`}
            className="cursor-pointer"
          >
            {/* Animated Pulsing Waves */}
            <circle
              r={16 + (pulseTick % 10) * 1.5}
              fill="url(#driverPulseGlow)"
              opacity={1 - (pulseTick % 10) * 0.08}
            />
            {/* Motorbike Core Circle */}
            <circle r="12" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2.5" />
            <circle r="4" fill="#ffffff" />

            {/* Courier Header Badge */}
            <g transform="translate(0, -18)">
              <rect
                x={-38}
                y={-9}
                width={76}
                height={16}
                rx={8}
                fill="#1e40af"
                stroke="#93c5fd"
                strokeWidth="1"
              />
              <text x="0" y="2" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="black">
                🛵 {driver.name.split(' ')[0]}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Map Legend Bar */}
      <div className="absolute bottom-2 inset-x-2 z-20 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800 flex items-center justify-between text-[10px] sm:text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-slate-300">{language === 'en' ? 'Driver' : 'አሽከርካሪ'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-slate-300">{language === 'en' ? 'In Transit' : 'በጉዞ ላይ'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-300">{language === 'en' ? 'Delivered' : 'የደረሰ'}</span>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[9px] sm:text-[10px]">
          {stops.filter(s => s.status !== 'DELIVERED').length} {language === 'en' ? 'Stops Remaining' : 'የቀሩ ማድረሻዎች'}
        </div>
      </div>
    </div>
  );
};

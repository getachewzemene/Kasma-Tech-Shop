import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  Truck, 
  Package, 
  Map as MapIcon, 
  User, 
  Check, 
  Navigation,
  Compass,
  Sparkles,
  Info
} from 'lucide-react';
import { Order } from '../types';

interface Point {
  x: number;
  y: number;
}

interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  avatarColor: string;
  rating: number;
  speed: number;
  heading: string;
  status: 'IDLE' | 'DELIVERING' | 'NEAR_DESTINATION' | 'DELIVERED';
  batteryLevel: number;
  activeOrderId?: string;
  destinationName: string;
  path: Point[];
  currentIdx: number;
}

interface Landmark {
  nameEn: string;
  nameAm: string;
  x: number;
  y: number;
  type: 'hub' | 'store' | 'point';
}

interface Road {
  nameEn: string;
  nameAm: string;
  points: Point[];
  type: 'highway' | 'avenue';
}

interface LiveCourierMapProps {
  language: 'en' | 'am';
  trackedOrder?: Order | null;
  onClose?: () => void;
}

export default function LiveCourierMap({ language, trackedOrder, onClose }: LiveCourierMapProps) {
  // Addis Ababa landmarks layout (X: 0-800, Y: 0-500)
  const landmarks: Landmark[] = useMemo(() => [
    { nameEn: 'Kasma Central Hub', nameAm: 'የካስማ ዋና ማዕከል', x: 400, y: 250, type: 'hub' },
    { nameEn: 'Girma Tech (Bole)', nameAm: 'ግርማ ቴክ (ቦሌ)', x: 580, y: 180, type: 'store' },
    { nameEn: 'Abebe Gadget Hub', nameAm: 'አበባ ጋጄት ሐብ', x: 280, y: 140, type: 'store' },
    { nameEn: 'Abyssinia Electronics', nameAm: 'አቢሲኒያ ኤሌክትሮኒክስ', x: 220, y: 350, type: 'store' },
    { nameEn: 'Piassa Square', nameAm: 'ፒያሳ አደባባይ', x: 240, y: 90, type: 'point' },
    { nameEn: 'Bole Medhane Alem', nameAm: 'ቦሌ መድኃኔዓለም', x: 620, y: 360, type: 'point' },
    { nameEn: 'Mexico Square', nameAm: 'ሜክሲኮ አደባባይ', x: 260, y: 260, type: 'point' },
    { nameEn: 'Megenagna Depot', nameAm: 'መገናኛ ዲፖ', x: 660, y: 160, type: 'point' },
    { nameEn: 'Saris Junction', nameAm: 'ሳሪስ መገንጠያ', x: 420, y: 440, type: 'point' },
    { nameEn: 'CMC Residential', nameAm: 'ሲኤምሲ የመኖሪያ መንደር', x: 720, y: 280, type: 'point' }
  ], []);

  // Main simulated road networks of Addis Ababa
  const roads: Road[] = useMemo(() => [
    {
      nameEn: 'Bole Road (Africa Avenue)',
      nameAm: 'ቦሌ መንገድ (አፍሪካ ጎዳና)',
      points: [{ x: 400, y: 250 }, { x: 500, y: 290 }, { x: 580, y: 180 }, { x: 620, y: 360 }],
      type: 'highway'
    },
    {
      nameEn: 'Ring Road Highway',
      nameAm: 'ሪንግ ሮድ ፈጣን መንገድ',
      points: [{ x: 240, y: 90 }, { x: 660, y: 160 }, { x: 720, y: 280 }, { x: 620, y: 360 }, { x: 420, y: 440 }, { x: 220, y: 350 }],
      type: 'highway'
    },
    {
      nameEn: 'Churchill Avenue',
      nameAm: 'ቸርችል ጎዳና',
      points: [{ x: 240, y: 90 }, { x: 280, y: 140 }, { x: 400, y: 250 }, { x: 420, y: 440 }],
      type: 'avenue'
    },
    {
      nameEn: 'Sudan Avenue (Mexico - Piassa)',
      nameAm: 'ሱዳን ጎዳና (ሜክሲኮ - ፒያሳ)',
      points: [{ x: 240, y: 90 }, { x: 260, y: 260 }, { x: 220, y: 350 }],
      type: 'avenue'
    },
    {
      nameEn: 'Haile Gebresilassie Street',
      nameAm: 'ኃይሌ ገብረሥላሴ መንገድ',
      points: [{ x: 400, y: 250 }, { x: 520, y: 200 }, { x: 660, y: 160 }],
      type: 'avenue'
    }
  ], []);

  // Preset couriers
  const [couriers, setCouriers] = useState<Courier[]>([
    {
      id: 'C-101',
      name: 'Girma Tesfaye',
      phone: '+251911456789',
      vehicle: 'Kasma TVS Dazz (Gasoline)',
      avatarColor: 'bg-blue-500',
      rating: 4.9,
      speed: 34,
      heading: 'North-East on Bole Rd',
      status: 'DELIVERING',
      batteryLevel: 85,
      activeOrderId: 'KS-5021',
      destinationName: 'Bole Medhane Alem',
      path: [
        { x: 400, y: 250 },
        { x: 450, y: 270 },
        { x: 500, y: 290 },
        { x: 580, y: 180 },
        { x: 600, y: 270 },
        { x: 620, y: 360 }
      ],
      currentIdx: 0
    },
    {
      id: 'C-102',
      name: 'Yohannes Kebede',
      phone: '+251912345678',
      vehicle: 'Lifan King 150 (Petrol)',
      avatarColor: 'bg-emerald-500',
      rating: 4.8,
      speed: 28,
      heading: 'South on Ring Road',
      status: 'DELIVERING',
      batteryLevel: 92,
      activeOrderId: 'KS-9832',
      destinationName: 'Saris Junction',
      path: [
        { x: 660, y: 160 },
        { x: 720, y: 280 },
        { x: 620, y: 360 },
        { x: 520, y: 400 },
        { x: 420, y: 440 }
      ],
      currentIdx: 1
    },
    {
      id: 'C-103',
      name: 'Selamawit Alene',
      phone: '+251944889900',
      vehicle: 'Kasma Eco-E2 (Electric Scooter)',
      avatarColor: 'bg-purple-500',
      rating: 4.95,
      speed: 18,
      heading: 'West near Mexico Square',
      status: 'NEAR_DESTINATION',
      batteryLevel: 42,
      activeOrderId: 'KS-1142',
      destinationName: 'Abebe Gadget Hub',
      path: [
        { x: 400, y: 250 },
        { x: 340, y: 255 },
        { x: 260, y: 260 },
        { x: 270, y: 200 },
        { x: 280, y: 140 }
      ],
      currentIdx: 2
    },
    {
      id: 'C-104',
      name: 'Yared Hailu',
      phone: '+251920112233',
      vehicle: 'Yadea Electric Bicycle',
      avatarColor: 'bg-amber-500',
      rating: 4.75,
      speed: 0,
      heading: 'Stationary at Megenagna Depot',
      status: 'IDLE',
      batteryLevel: 78,
      destinationName: 'Megenagna Depot',
      path: [
        { x: 660, y: 160 },
        { x: 660, y: 160 }
      ],
      currentIdx: 0
    }
  ]);

  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'MY_ORDER'>('ALL');
  const [mapType, setMapType] = useState<'vector' | 'satellite'>('vector');
  const [radarPulse, setRadarPulse] = useState(true);
  const [simulatedTime, setSimulatedTime] = useState<string>('');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  // Format real-time clock for local Addis Ababa
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSimulatedTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Setup order-specific custom courier if there is an active tracked order
  const orderCourier = useMemo(() => {
    if (!trackedOrder) return null;
    
    // Create a deterministic courier assigned to this customer's order
    const hasAddressBole = trackedOrder.shippingAddress.toLowerCase().includes('bole') || trackedOrder.shippingAddress.includes('ቦሌ');
    const hasAddressMexico = trackedOrder.shippingAddress.toLowerCase().includes('mexico') || trackedOrder.shippingAddress.includes('ሜክሲኮ');
    const hasAddressPiassa = trackedOrder.shippingAddress.toLowerCase().includes('piassa') || trackedOrder.shippingAddress.includes('ፒያሳ') || trackedOrder.shippingAddress.toLowerCase().includes('addis');
    
    let destination: Point = { x: 500, y: 380 }; // Default custom point
    let destName = trackedOrder.shippingAddress || 'Customer Destination';
    let path: Point[] = [];

    if (hasAddressBole) {
      destination = { x: 620, y: 360 };
      destName = 'Bole Medhane Alem Area';
      path = [
        { x: 400, y: 250 }, // Hub
        { x: 500, y: 290 },
        { x: 580, y: 180 }, // Girma Tech
        { x: 620, y: 360 }  // Bole
      ];
    } else if (hasAddressMexico) {
      destination = { x: 260, y: 260 };
      destName = 'Mexico Square District';
      path = [
        { x: 400, y: 250 }, // Hub
        { x: 330, y: 255 }, 
        { x: 260, y: 260 }  // Mexico
      ];
    } else if (hasAddressPiassa) {
      destination = { x: 240, y: 90 };
      destName = 'Piassa Square Boulevard';
      path = [
        { x: 400, y: 250 }, // Hub
        { x: 280, y: 140 }, // Abebe Gadget Hub
        { x: 240, y: 90 }   // Piassa
      ];
    } else {
      // Custom generic route
      destination = { x: 420, y: 440 };
      destName = 'Saris Junction Delivery';
      path = [
        { x: 400, y: 250 },
        { x: 410, y: 350 },
        { x: 420, y: 440 }
      ];
    }

    return {
      id: `CO-${trackedOrder.id}`,
      name: 'Amanuel Bekele (Express)',
      phone: '+251966123456',
      vehicle: 'Kasma Electric E-Bike (E3)',
      avatarColor: 'bg-indigo-600',
      rating: 4.95,
      speed: 25,
      heading: `Heading directly towards ${destName}`,
      status: trackedOrder.status === 'DELIVERED' ? 'DELIVERED' : trackedOrder.status === 'SHIPPED' ? 'DELIVERING' : 'IDLE',
      batteryLevel: trackedOrder.status === 'DELIVERED' ? 100 : 64,
      activeOrderId: trackedOrder.id,
      destinationName: destName,
      path: path.length > 0 ? path : [{ x: 400, y: 250 }, destination],
      currentIdx: 0
    } as Courier;
  }, [trackedOrder]);

  // Combine static and order-specific couriers
  const allCouriersList = useMemo(() => {
    if (orderCourier && trackedOrder) {
      // Filter out static ones if they share order details, insert order courier at front
      const filtered = couriers.filter(c => c.activeOrderId !== trackedOrder.id);
      return [orderCourier, ...filtered];
    }
    return couriers;
  }, [couriers, orderCourier, trackedOrder]);

  // Select order courier by default if tracked order is in transit
  useEffect(() => {
    if (trackedOrder && orderCourier && trackedOrder.status === 'SHIPPED') {
      setSelectedCourierId(orderCourier.id);
      setFilterStatus('MY_ORDER');
    }
  }, [trackedOrder, orderCourier]);

  // Active Real-Time Courier Movement Simulation (Smooth polyline interpolation)
  useEffect(() => {
    const interval = setInterval(() => {
      setCouriers(prevCouriers => {
        return prevCouriers.map(courier => {
          if (courier.status === 'IDLE' || courier.speed === 0) return courier;
          
          let nextIdx = courier.currentIdx + 0.05; // Increment fractional position
          let status = courier.status;
          let speed = courier.speed;
          
          if (nextIdx >= courier.path.length - 1) {
            nextIdx = 0; // Loop simulation
            status = 'DELIVERING';
            speed = Math.floor(Math.random() * 15) + 20;
          } else if (nextIdx >= courier.path.length - 1.5) {
            status = 'NEAR_DESTINATION';
            speed = Math.floor(Math.random() * 8) + 8;
          }

          return {
            ...courier,
            currentIdx: nextIdx,
            status,
            speed
          };
        });
      });

      // Also generate random simulated telemetry logs to feed the ticker
      if (Math.random() > 0.7) {
        const randomCourier = allCouriersList[Math.floor(Math.random() * allCouriersList.length)];
        const actionsEn = [
          `passed Bole Junction heading ${randomCourier.speed > 0 ? 'at ' + randomCourier.speed + ' km/h' : 'stationary'}`,
          `updating telemetry coords near ${randomCourier.destinationName}`,
          `dispatched from local logistics hub`,
          `reported optimal traffic conditions on road`
        ];
        const actionsAm = [
          `በቦሌ መንገድ ላይ በ${randomCourier.speed} ኪ.ሜ/ሰአት ፍጥነት በመጓዝ ላይ ነው`,
          `ከ${randomCourier.destinationName} አቅራቢያ የጂፒኤስ መረጃ ልኳል`,
          `ከዋናው የትራንስፖርት ማዕከል ተነስቷል`,
          `በመንገድ ላይ የተሻለ የትራፊክ ሁኔታ መኖሩን አስታውቋል`
        ];
        
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const log = language === 'en' 
          ? `[${timestamp}] Courier ${randomCourier.name}: ${actionsEn[Math.floor(Math.random() * actionsEn.length)]}`
          : `[${timestamp}] መልዕክተኛ ${randomCourier.name}: ${actionsAm[Math.floor(Math.random() * actionsAm.length)]}`;
        
        setTelemetryLogs(prev => [log, ...prev].slice(0, 5));
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [allCouriersList, language]);

  // Interpolate the actual position on screen
  const getInterpolatedPosition = (courier: Courier): Point => {
    const path = courier.path;
    const floatIdx = courier.currentIdx;
    const baseIdx = Math.floor(floatIdx);
    const fraction = floatIdx - baseIdx;

    if (baseIdx >= path.length - 1) {
      return path[path.length - 1];
    }

    const p1 = path[baseIdx];
    const p2 = path[baseIdx + 1];

    return {
      x: p1.x + (p2.x - p1.x) * fraction,
      y: p1.y + (p2.y - p1.y) * fraction
    };
  };

  // Filtering couriers based on selection
  const filteredCouriers = useMemo(() => {
    if (filterStatus === 'MY_ORDER') {
      return allCouriersList.filter(c => c.activeOrderId === trackedOrder?.id);
    }
    if (filterStatus === 'ACTIVE') {
      return allCouriersList.filter(c => c.status !== 'IDLE');
    }
    return allCouriersList;
  }, [allCouriersList, filterStatus, trackedOrder]);

  const activeCourierData = useMemo(() => {
    return allCouriersList.find(c => c.id === selectedCourierId) || null;
  }, [allCouriersList, selectedCourierId]);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-lg transition-colors flex flex-col md:flex-row h-[550px]">
      
      {/* Map Main Canvas (Left side) */}
      <div className="flex-1 relative bg-slate-100 dark:bg-zinc-900 overflow-hidden border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-850">
        
        {/* Map Header Status Tickers */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 flex items-center gap-2 shadow-xs text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-blue-400 animate-pulse" />
            <span>KASMA RADER {simulatedTime}</span>
          </div>
          {trackedOrder && (
            <div className="bg-indigo-600/95 dark:bg-blue-500/95 text-white backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs text-[10px] font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>{language === 'en' ? `ORDER ${trackedOrder.id}` : `ትዕዛዝ ${trackedOrder.id}`}</span>
            </div>
          )}
        </div>

        {/* Map Toggles (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex gap-1.5">
          <button 
            onClick={() => setMapType(mapType === 'vector' ? 'satellite' : 'vector')}
            className="p-2 bg-white/95 dark:bg-zinc-900/95 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-md transition-all cursor-pointer text-xs font-black text-gray-700 dark:text-zinc-300"
            title={language === 'en' ? 'Toggle Satellite Map' : 'የካርታ አይነት ይቀይሩ'}
          >
            <MapIcon className="w-4 h-4 text-[#0052FF]" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 bg-white/95 dark:bg-zinc-900/95 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-md transition-all cursor-pointer text-xs text-gray-700 dark:text-zinc-300 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* The Vector Map Render (SVG Graphic of Addis Ababa Streets) */}
        <div className="w-full h-full relative">
          <svg 
            viewBox="0 0 800 500" 
            className="w-full h-full transition-all duration-700 ease-in-out"
            style={{
              filter: mapType === 'satellite' ? 'contrast(1.1) brightness(0.85) saturate(1.2)' : 'none',
              background: mapType === 'satellite' 
                ? 'radial-gradient(circle, #1a2f1c 0%, #0d170e 100%)' 
                : 'transparent'
            }}
          >
            {/* Grid Pattern Background for Satellite */}
            {mapType === 'satellite' && (
              <defs>
                <pattern id="satellite-grid" width="40" width-units="userSpaceOnUse" height="40" height-units="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a452d" strokeWidth="0.5" strokeOpacity="0.2" />
                </pattern>
              </defs>
            )}

            {mapType === 'satellite' && (
              <rect width="100%" height="100%" fill="url(#satellite-grid)" />
            )}

            {/* City Grid Background features (Districts / parks) */}
            <g opacity={mapType === 'satellite' ? 0.35 : 1}>
              {/* Entoto Park Forest Area (Top) */}
              <path d="M 100,20 Q 400,-10 700,20 L 800,80 L 0,80 Z" fill={mapType === 'satellite' ? '#143419' : '#e2f0d9'} className="transition-all" />
              {/* National Palace Garden Area */}
              <circle cx="380" cy="220" r="45" fill={mapType === 'satellite' ? '#1c4524' : '#e2f0e0'} />
              {/* Bole Airport Runway area (Bottom Right) */}
              <rect x="580" y="380" width="180" height="40" transform="rotate(-15, 670, 400)" fill={mapType === 'satellite' ? '#2e2e2e' : '#f0f0f0'} rx="5" />
            </g>

            {/* Road Networks (Avenues & Highways) */}
            <g>
              {roads.map((road, index) => {
                const pointsStr = road.points.map(p => `${p.x},${p.y}`).join(' ');
                const isHighlighted = activeCourierData && road.points.some(rp => 
                  activeCourierData.path.some(cp => cp.x === rp.x && cp.y === rp.y)
                );

                return (
                  <g key={index}>
                    {/* Road Shadow glow */}
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke={
                        isHighlighted 
                          ? '#818cf8' 
                          : mapType === 'satellite' ? '#3d513e' : '#e2e8f0'
                      }
                      strokeWidth={road.type === 'highway' ? 8 : 5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                      opacity={isHighlighted ? 0.4 : 0.65}
                    />
                    {/* Main Road Line */}
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke={
                        isHighlighted 
                          ? '#4f46e5' 
                          : mapType === 'satellite' ? '#273b28' : '#ffffff'
                      }
                      strokeWidth={road.type === 'highway' ? 4 : 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={road.type === 'highway' ? 'none' : '4,4'}
                      className="transition-all duration-300"
                    />
                    {/* Road Label Text */}
                    {road.points.length >= 2 && (
                      <text
                        x={(road.points[0].x + road.points[1].x) / 2}
                        y={(road.points[0].y + road.points[1].y) / 2 - 6}
                        fontSize="8"
                        className="fill-gray-450 dark:fill-zinc-500 font-bold tracking-tight select-none pointer-events-none"
                        textAnchor="middle"
                      >
                        {language === 'en' ? road.nameEn : road.nameAm}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Highlighted Delivery Polyline for Active Order/Selected Courier */}
            {activeCourierData && activeCourierData.status !== 'IDLE' && (
              <g>
                <polyline
                  points={activeCourierData.path.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6,4"
                  className="animate-[dash_1.5s_linear_infinite]"
                  style={{
                    strokeDashoffset: 10,
                  }}
                />
              </g>
            )}

            {/* Render Landmarks & Hubs */}
            <g>
              {landmarks.map((mark, index) => {
                const isHub = mark.type === 'hub';
                const isStore = mark.type === 'store';
                const isTargetOfSelected = activeCourierData && activeCourierData.destinationName === mark.nameEn;

                return (
                  <g key={index} className="cursor-pointer" onClick={() => {
                    // Find courier delivering to this location if any
                    const matchedC = allCouriersList.find(c => c.destinationName === mark.nameEn);
                    if (matchedC) {
                      setSelectedCourierId(matchedC.id);
                    }
                  }}>
                    {/* Pulsing ring around landmarks of interest */}
                    {isTargetOfSelected && (
                      <circle cx={mark.x} cy={mark.y} r="22" fill="none" stroke="#e11d48" strokeWidth="2" className="animate-ping" opacity="0.3" />
                    )}

                    {/* Outer Circle Backdrop */}
                    <circle 
                      cx={mark.x} 
                      cy={mark.y} 
                      r={isHub ? 14 : isStore ? 10 : 8} 
                      className={`transition-colors duration-300 ${
                        isHub 
                          ? 'fill-indigo-600 stroke-white' 
                          : isTargetOfSelected 
                            ? 'fill-rose-500 stroke-white'
                            : isStore 
                              ? 'fill-indigo-50 dark:fill-zinc-800 stroke-indigo-500' 
                              : 'fill-white dark:fill-zinc-900 stroke-gray-400'
                      }`}
                      strokeWidth="2.5" 
                    />

                    {/* Landmark Vector Pins */}
                    {isHub ? (
                      <g transform={`translate(${mark.x - 7.5}, ${mark.y - 7.5})`}>
                        <path d="M4 1L1 4v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4L12 1H4z" fill="#ffffff" stroke="#4f46e5" strokeWidth="1.5" />
                        <path d="M1 4h14" stroke="#4f46e5" strokeWidth="1.5" />
                      </g>
                    ) : isStore ? (
                      <circle cx={mark.x} cy={mark.y} r="3.5" className={isTargetOfSelected ? 'fill-white' : 'fill-indigo-600'} />
                    ) : (
                      <circle cx={mark.x} cy={mark.y} r="2.5" className={isTargetOfSelected ? 'fill-white' : 'fill-gray-600'} />
                    )}

                    {/* Text Label Backdrop for eligibility */}
                    <rect
                      x={mark.x - 45}
                      y={mark.y + (isHub ? 18 : 14)}
                      width="90"
                      height="13"
                      rx="4"
                      fill={mapType === 'satellite' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.85)'}
                      className="dark:fill-zinc-900/90"
                    />

                    {/* Label Text */}
                    <text
                      x={mark.x}
                      y={mark.y + (isHub ? 27 : 23)}
                      fontSize="7.5"
                      className="fill-gray-900 dark:fill-zinc-200 font-extrabold select-none pointer-events-none"
                      textAnchor="middle"
                    >
                      {language === 'en' ? mark.nameEn : mark.nameAm}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Render Couriers Locations */}
            <g>
              {filteredCouriers.map((courier) => {
                const pos = getInterpolatedPosition(courier);
                const isSelected = selectedCourierId === courier.id;
                const isMyOrderCourier = trackedOrder && courier.activeOrderId === trackedOrder.id;

                return (
                  <g 
                    key={courier.id} 
                    transform={`translate(${pos.x}, ${pos.y})`} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedCourierId(courier.id)}
                  >
                    {/* Ring Pulse for Courier */}
                    {isSelected && (
                      <circle cx="0" cy="0" r="18" fill="none" stroke="#4f46e5" strokeWidth="2.5" className="animate-ping" opacity="0.45" />
                    )}

                    {/* Pulse highlight for current order */}
                    {isMyOrderCourier && !isSelected && (
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#10b981" strokeWidth="2" className="animate-pulse" opacity="0.6" />
                    )}

                    {/* Outer circle backdrop */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="10" 
                      className={`transition-all duration-300 ${
                        isSelected 
                          ? 'fill-[#0052FF] stroke-white scale-120' 
                          : isMyOrderCourier 
                            ? 'fill-emerald-500 stroke-white scale-110'
                            : 'fill-zinc-900 dark:fill-zinc-100 stroke-white'
                      }`} 
                      strokeWidth="2.5" 
                      style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
                    />

                    {/* Courier Bike Vector Icon inside */}
                    <g transform="translate(-5, -5) scale(0.8)">
                      <path 
                        d="M3 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M10 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" 
                        fill="none" 
                        stroke={isSelected || isMyOrderCourier ? '#ffffff' : '#4b5563'} 
                        strokeWidth="1" 
                      />
                      <path 
                        d="M3 6.5h7 M6.5 6.5l-1-3h-2" 
                        stroke={isSelected || isMyOrderCourier ? '#ffffff' : '#4b5563'} 
                        strokeWidth="1" 
                      />
                    </g>

                    {/* Small Mini Label when hovered */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <rect x="-35" y="-24" width="70" height="12" rx="3" fill="#18181b" />
                      <text x="0" y="-15" fontSize="7.5" fill="#ffffff" fontWeight="black" textAnchor="middle">
                        {courier.name.split(' ')[0]}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Bottom Ticker bar (Simulated live telemetry feeds) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/75 dark:bg-zinc-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-800/50 text-[10px] text-zinc-300 font-mono flex items-center justify-between pointer-events-auto shadow-lg">
          <div className="flex items-center gap-2 overflow-hidden w-[80%]">
            <Compass className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="truncate">
              {telemetryLogs.length > 0 ? (
                <span className="text-zinc-200">{telemetryLogs[0]}</span>
              ) : (
                <span className="text-zinc-400">
                  {language === 'en' 
                    ? 'Connecting live telemetry feeds... Radar operational.' 
                    : 'የቀጥታ ስርጭት መከታተያ እየተገናኘ ነው... የራዳር ግንኙነት በጥሩ ሁኔታ ላይ ነው።'}
                </span>
              )}
            </div>
          </div>
          <div className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
            {language === 'en' ? 'LIVE FEED' : 'ቀጥታ'}
          </div>
        </div>

      </div>

      {/* Courier/Delivering Detail Sidebar (Right side) */}
      <div className="w-full md:w-[320px] bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between overflow-y-auto text-left relative">
        
        <div className="space-y-4">
          {/* Sidebar Header */}
          <div className="space-y-1 border-b border-gray-150 dark:border-zinc-800 pb-3">
            <h4 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-indigo-600" />
              <span>{language === 'en' ? 'Nearby Couriers' : 'በቅርብ ያሉ መላኪያዎች'}</span>
            </h4>
            <p className="text-[10px] text-gray-400">
              {language === 'en' 
                ? 'Select a courier below to display direct routing polylines & delivery telemetry.' 
                : 'የመልዕክተኛውን የስርጭት መስመር እና መረጃ ለማየት ከታች አንዱን ይምረጡ።'}
            </p>
          </div>

          {/* Quick filter tabs */}
          <div className="flex gap-1.5 bg-gray-50 dark:bg-zinc-850 p-1 rounded-xl border border-gray-150/50 dark:border-zinc-800/60">
            {[
              { id: 'ALL', labelEn: 'All', labelAm: 'ሁሉንም' },
              { id: 'ACTIVE', labelEn: 'Active', labelAm: 'ገቢር' },
              { id: 'MY_ORDER', labelEn: 'My Order', labelAm: 'የእኔ' }
            ].map(tab => {
              const active = filterStatus === tab.id;
              if (tab.id === 'MY_ORDER' && !trackedOrder) return null;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterStatus(tab.id as any);
                    // Select first in filtered list automatically if none selected
                    const subList = tab.id === 'ALL' ? allCouriersList : allCouriersList.filter(c => tab.id === 'ACTIVE' ? c.status !== 'IDLE' : c.activeOrderId === trackedOrder?.id);
                    if (subList.length > 0) {
                      setSelectedCourierId(subList[0].id);
                    }
                  }}
                  className={`flex-1 text-center py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    active 
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-blue-400 shadow-xs border border-gray-150 dark:border-zinc-700/65' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {language === 'en' ? tab.labelEn : tab.labelAm}
                </button>
              );
            })}
          </div>

          {/* Couriers List */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {filteredCouriers.map(courier => {
              const isSelected = selectedCourierId === courier.id;
              const isMyOrder = trackedOrder && courier.activeOrderId === trackedOrder.id;

              return (
                <button
                  key={courier.id}
                  onClick={() => setSelectedCourierId(courier.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/50 dark:bg-zinc-850 border-indigo-500/80 ring-1.5 ring-indigo-500/40' 
                      : 'bg-gray-50/30 dark:bg-zinc-950/20 border-gray-150 dark:border-zinc-850/70 hover:border-gray-300 dark:hover:border-zinc-750'
                  }`}
                >
                  {/* Status Indicator */}
                  {isMyOrder && (
                    <span className="absolute top-1 right-2 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded-md">
                      {language === 'en' ? 'My Delivery' : 'የእኔ መላኪያ'}
                    </span>
                  )}

                  {/* Avatar Icon */}
                  <div className={`w-8 h-8 rounded-full ${courier.avatarColor} text-white flex items-center justify-center font-black text-xs shrink-0 relative`}>
                    {courier.name.split(' ')[0][0]}
                    {/* Pulsing small green status dot */}
                    {courier.status !== 'IDLE' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="min-w-0 flex-grow">
                    <p className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">
                      {courier.name}
                    </p>
                    <p className="text-[9px] font-mono text-gray-450 truncate">
                      {courier.vehicle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        courier.status === 'IDLE' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-550' :
                        courier.status === 'NEAR_DESTINATION' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' :
                        'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                      }`}>
                        {courier.status === 'IDLE' ? (language === 'en' ? 'Waiting' : 'በመጠባበቅ ላይ') :
                         courier.status === 'NEAR_DESTINATION' ? (language === 'en' ? 'Arriving' : 'ሊደርስ ቀርቧል') :
                         (language === 'en' ? 'In Transit' : 'በጉዞ ላይ')}
                      </span>
                      {courier.speed > 0 && (
                        <span className="text-[8.5px] font-mono text-zinc-500 font-bold">
                          {courier.speed} km/h
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredCouriers.length === 0 && (
              <div className="p-6 text-center border border-dashed border-gray-250 dark:border-zinc-800 rounded-xl">
                <Info className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
                <p className="text-[10px] text-gray-400 font-semibold">
                  {language === 'en' ? 'No couriers match the current filter.' : 'በዚህ ማጣሪያ የሚዛመድ መልዕክተኛ አልተገኘም።'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Courier Detail Card */}
        {activeCourierData ? (
          <div className="mt-4 pt-4 border-t border-gray-150 dark:border-zinc-800 space-y-4">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">
                  {language === 'en' ? 'Assigned Courier' : 'የተመደበ መልዕክተኛ'}
                </span>
                <p className="font-extrabold text-[13px] text-gray-950 dark:text-white">
                  {activeCourierData.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-yellow-500 text-xs font-bold font-mono">★</span>
                  <span className="text-[10px] text-gray-800 dark:text-zinc-200 font-black">{activeCourierData.rating}</span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[9px] text-gray-400 font-mono">{activeCourierData.id}</span>
                </div>
              </div>

              {/* Battery indicator */}
              <div className="text-right space-y-0.5">
                <span className="text-[8px] text-gray-400 font-bold block uppercase">{language === 'en' ? 'Battery' : 'ባትሪ'}</span>
                <span className={`text-[10px] font-mono font-black ${activeCourierData.batteryLevel < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                  {activeCourierData.batteryLevel}%
                </span>
              </div>
            </div>

            {/* Courier active delivery details */}
            <div className="bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-150/45 dark:border-zinc-850/60 p-3 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium text-[10px]">{language === 'en' ? 'Destination' : 'የመድረሻ ቦታ'}</span>
                <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px] text-[10px]" title={activeCourierData.destinationName}>
                  {activeCourierData.destinationName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium text-[10px]">{language === 'en' ? 'Speed/Heading' : 'አቅጣጫ'}</span>
                <span className="font-bold text-gray-800 dark:text-zinc-200 text-[10px] truncate max-w-[150px]">
                  {activeCourierData.speed > 0 ? `${activeCourierData.speed} km/h • ${activeCourierData.heading.split(' ')[0]}` : 'Stationary'}
                </span>
              </div>
              {activeCourierData.status !== 'IDLE' && (
                <div className="flex justify-between border-t border-gray-150/30 dark:border-zinc-800/40 pt-1.5">
                  <span className="text-indigo-600 dark:text-blue-400 font-black text-[9px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500 animate-pulse" />
                    <span>{language === 'en' ? 'Estimated Arrival' : 'ሊደርስ የሚችልበት ሰዓት'}</span>
                  </span>
                  <span className="font-black text-indigo-600 dark:text-blue-400 text-[10px]">
                    {activeCourierData.status === 'NEAR_DESTINATION' 
                      ? (language === 'en' ? 'Arriving' : 'አሁን ይደርሳል') 
                      : (language === 'en' ? '8-12 mins' : 'ከ8-12 ደቂቃ')}
                  </span>
                </div>
              )}
            </div>

            {/* Interactive communication CTA buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a 
                href={`tel:${activeCourierData.phone}`}
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-950 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'en' ? 'Call Courier' : 'ደውል'}</span>
              </a>
              <button 
                onClick={() => {
                  alert(language === 'en' 
                    ? `Simulated secure chat opened with ${activeCourierData.name} on order delivery.`
                    : `ከመልዕክተኛ ${activeCourierData.name} ጋር ጊዜያዊ መልዕክት መለዋወጫ ተከፍቷል።`
                  );
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-gray-55 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-800 dark:text-zinc-100 border border-gray-250 dark:border-zinc-700 font-extrabold text-[10px] uppercase rounded-xl transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{language === 'en' ? 'Message' : 'መልዕክት'}</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50/50 dark:bg-zinc-950/20 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2">
            <Compass className="w-8 h-8 text-indigo-400 dark:text-blue-500 animate-spin" style={{ animationDuration: '10s' }} />
            <p className="text-xs text-gray-400 font-semibold">
              {language === 'en' ? 'Select any courier marker on map' : 'ለመከታተል በካርታው ላይ ያለውን ምልክት ይጫኑ'}
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

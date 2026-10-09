import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  SUB_CITIES, 
  ADDIS_LANDMARKS, 
  AddisLandmark, 
  findNearestLandmark, 
  calculateDistanceKm 
} from '../../constants/locations';
import { 
  MapPin, 
  Crosshair, 
  Navigation, 
  ExternalLink, 
  Check, 
  Copy, 
  Info, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Building2,
  Compass
} from 'lucide-react';

interface AddisLocationPickerProps {
  selectedSubCityId: string;
  onSubCityChange: (subCityId: string) => void;
  landmark: string;
  onLandmarkChange: (landmark: string) => void;
  coordinates: { lat: number; lng: number } | null;
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void;
  gateNotes: string;
  onGateNotesChange: (notes: string) => void;
  language: 'en' | 'am';
}

// Custom Leaflet DivIcon with Kasma Blue Pin and Pulsing Radar Wave
const createCustomPinIcon = () => {
  return L.divIcon({
    className: 'kasma-custom-pin-container',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(0, 82, 255, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="position: relative; z-index: 10; width: 32px; height: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z" fill="#0052FF" stroke="#FFFFFF" stroke-width="1.8"/>
            <circle cx="12" cy="9" r="3.2" fill="#FFFFFF"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -32],
  });
};

export const AddisLocationPicker: React.FC<AddisLocationPickerProps> = ({
  selectedSubCityId,
  onSubCityChange,
  landmark,
  onLandmarkChange,
  coordinates,
  onCoordinatesChange,
  gateNotes,
  onGateNotesChange,
  language,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [activeTab, setActiveTab] = useState<'subcity' | 'all'>('subcity');
  const [geoError, setGeoError] = useState<string | null>(null);

  // Default coordinate: fallback to selected sub-city center or Bole Medhanialem
  const activeSubCity = useMemo(() => {
    return SUB_CITIES.find(s => s.id === selectedSubCityId) || SUB_CITIES[0];
  }, [selectedSubCityId]);

  const defaultCoords = useMemo(() => {
    return coordinates || {
      lat: activeSubCity.center[0],
      lng: activeSubCity.center[1]
    };
  }, [coordinates, activeSubCity]);

  // Filter landmarks by subcity or all
  const filteredLandmarks = useMemo(() => {
    let list = activeTab === 'subcity' 
      ? ADDIS_LANDMARKS.filter(l => l.subCityId === selectedSubCityId)
      : ADDIS_LANDMARKS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = ADDIS_LANDMARKS.filter(l => 
        l.nameEn.toLowerCase().includes(q) || 
        l.nameAm.includes(q) ||
        (l.hintEn && l.hintEn.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedSubCityId, activeTab, searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double initialization

    const initialLat = defaultCoords.lat;
    const initialLng = defaultCoords.lng;

    // Bounds for Greater Addis Ababa (Prevent drifting off-country)
    const addisBounds = L.latLngBounds(
      L.latLng(8.75, 38.60), // South-West
      L.latLng(9.18, 38.98)  // North-East
    );

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: addisBounds,
      maxBoundsViscosity: 0.8,
      zoomControl: true,
      scrollWheelZoom: false, // Don't trap scroll on mobile page
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create Draggable Pin
    const pinIcon = createCustomPinIcon();
    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 11px; padding: 2px;">
        <strong style="color: #0052FF;">📍 ${language === 'en' ? 'Delivery Pin' : 'የማድረሻ ቦታ'}</strong><br/>
        <span>${language === 'en' ? 'Drag directly onto your building gate' : 'ወደ ህንፃዎ ወይም በር ይጎትቱ'}</span>
      </div>
    `);

    // Handle marker drag end
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const newCoords = { lat: Number(pos.lat.toFixed(5)), lng: Number(pos.lng.toFixed(5)) };
      onCoordinatesChange(newCoords);

      // Auto-suggest nearest landmark if landmark field is empty or user is refining
      const nearest = findNearestLandmark(newCoords.lat, newCoords.lng);
      if (nearest) {
        if (!landmark) {
          const suggested = language === 'en' 
            ? `Near ${nearest.landmark.nameEn} (${nearest.distanceKm} km away)`
            : `${nearest.landmark.nameAm} አጠገብ (${nearest.distanceKm} ኪ.ሜ)`;
          onLandmarkChange(suggested);
        }
        if (nearest.landmark.subCityId !== selectedSubCityId) {
          onSubCityChange(nearest.landmark.subCityId);
        }
      }
    });

    // Handle map click (snap marker to click)
    map.on('click', (e: L.LeafletMouseEvent) => {
      const newLat = Number(e.latlng.lat.toFixed(5));
      const newLng = Number(e.latlng.lng.toFixed(5));
      marker.setLatLng([newLat, newLng]);
      onCoordinatesChange({ lat: newLat, lng: newLng });

      const nearest = findNearestLandmark(newLat, newLng);
      if (nearest) {
        if (!landmark) {
          const suggested = language === 'en' 
            ? `Near ${nearest.landmark.nameEn} (${nearest.distanceKm} km away)`
            : `${nearest.landmark.nameAm} አጠገብ (${nearest.distanceKm} ኪ.ሜ)`;
          onLandmarkChange(suggested);
        }
        if (nearest.landmark.subCityId !== selectedSubCityId) {
          onSubCityChange(nearest.landmark.subCityId);
        }
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate size once rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []); // Run on mount

  // Sync sub-city changes with map center (if coords not custom-dragged or when switching sub-city)
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    
    // If coordinates were explicitly set, pan to coordinates
    if (coordinates) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
    } else {
      // Pan to subcity center
      const [lat, lng] = activeSubCity.center;
      mapInstanceRef.current.flyTo([lat, lng], 14, { animate: true, duration: 0.8 });
      markerRef.current.setLatLng([lat, lng]);
      onCoordinatesChange({ lat, lng });
    }
  }, [selectedSubCityId]);

  // Recalculate container size on collapse/expand toggle
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isMapExpanded]);

  // Handle clicking a specific Addis landmark chip
  const handleSelectLandmark = (item: AddisLandmark) => {
    onSubCityChange(item.subCityId);
    onLandmarkChange(language === 'en' ? item.nameEn : item.nameAm);
    onCoordinatesChange({ lat: item.lat, lng: item.lng });

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([item.lat, item.lng]);
      mapInstanceRef.current.flyTo([item.lat, item.lng], 16, { animate: true, duration: 1 });
      markerRef.current.openPopup();
    }
  };

  // GPS Locate My Device
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError(language === 'en' ? 'Geolocation not supported by browser.' : 'የአሰሳ አካባቢ አገልግሎት በብሮውዘሩ አልተደገፈም።');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const lat = Number(latitude.toFixed(5));
        const lng = Number(longitude.toFixed(5));

        // Check if roughly in Addis Ababa / Ethiopia (Lat 8.5 to 9.5, Lng 38.3 to 39.2)
        const isNearAddis = lat >= 8.5 && lat <= 9.4 && lng >= 38.4 && lng <= 39.2;

        if (isNearAddis) {
          onCoordinatesChange({ lat, lng });
          const nearest = findNearestLandmark(lat, lng);
          if (nearest) {
            onSubCityChange(nearest.landmark.subCityId);
            onLandmarkChange(
              language === 'en'
                ? `GPS Pin (${nearest.distanceKm} km from ${nearest.landmark.nameEn})`
                : `የጂፒኤስ መለያ ቦታ (ከ${nearest.landmark.nameAm} ${nearest.distanceKm} ኪ.ሜ)`
            );
          }
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1 });
          }
        } else {
          // User is outside Addis Ababa (e.g. testing from overseas/another city)
          setGeoError(
            language === 'en'
              ? `Your GPS position (${lat}, ${lng}) is outside Addis Ababa. We placed your pin in ${activeSubCity.nameEn} for delivery testing.`
              : `የእርስዎ የጂፒኤስ አድራሻ ከአዲስ አበባ ውጭ ነው። ለሙከራ በ${activeSubCity.nameAm} ላይ ተቀምጧል።`
          );
          const [subLat, subLng] = activeSubCity.center;
          onCoordinatesChange({ lat: subLat, lng: subLng });
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([subLat, subLng]);
            mapInstanceRef.current.flyTo([subLat, subLng], 14, { animate: true, duration: 0.8 });
          }
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError(
          language === 'en'
            ? 'Location access denied or unavailable. You can click on the map or pick a landmark below.'
            : 'የቦታ መረጃ ማግኘት አልተቻለም። እባክዎ ከታች ካርታውን በመንካት ወይም መለያ በመምረጥ ያመልክቱ።'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Copy GPS Coordinates for SMS / Telegram courier dispatch
  const handleCopyCoords = () => {
    if (!coordinates) return;
    const text = `${coordinates.lat}, ${coordinates.lng}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Common quick compound cues
  const compoundCueOptions = [
    { en: 'Black Gate', am: 'ጥቁር በር' },
    { en: 'Blue Gate', am: 'ሰማያዊ በር' },
    { en: 'Near Awash Bank', am: 'ከአዋሽ ባንክ አጠገብ' },
    { en: 'Ground Floor / G+1', am: 'ምድር ቤት' },
    { en: 'Compound Security Guard', am: 'የጥበቃ በር' },
    { en: 'Condominium Block', am: 'ኮንዶሚኒየም ብሎክ' },
  ];

  const handleAppendCue = (cueText: string) => {
    if (!gateNotes) {
      onGateNotesChange(cueText);
    } else if (!gateNotes.includes(cueText)) {
      onGateNotesChange(`${gateNotes}, ${cueText}`);
    }
  };

  const currentLat = coordinates?.lat || defaultCoords.lat;
  const currentLng = coordinates?.lng || defaultCoords.lng;
  const nearestLandmarkInfo = findNearestLandmark(currentLat, currentLng);

  return (
    <div className="space-y-4">
      {/* Header with Sub-City Context and Live Map Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
            <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse"></span>
            <span>
              {language === 'en' 
                ? '📍 Addis Ababa Visual Landmark & Gate Pinpoint' 
                : '📍 የአዲስ አበባ መለያ ቦታ እና የግቢ በር ጠቋሚ'}
            </span>
          </label>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
            {language === 'en'
              ? 'Street numbers can be ambiguous. Drop the pin directly on your compound gate or building.'
              : 'ባህላዊ የጎዳና ቁጥሮች ግልጽ ስላልሆኑ እባክዎ ጠቋሚውን ትክክለኛ ግቢዎ ወይም መለያ ቦታዎ ላይ ያድርጉ።'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* GPS Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-bold text-gray-700 dark:text-zinc-200 hover:border-[#0052FF] hover:text-[#0052FF] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={language === 'en' ? 'Detect current GPS coordinates' : 'የአሁኑን ጂፒኤስ ቦታ ፈልግ'}
          >
            <Crosshair className={`w-3.5 h-3.5 text-[#0052FF] ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? (language === 'en' ? 'Locating...' : 'በመፈለግ ላይ...') : (language === 'en' ? 'My GPS' : 'የኔ ቦታ')}</span>
          </button>

          {/* Expand/Collapse Map */}
          <button
            type="button"
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-bold text-gray-700 dark:text-zinc-200 hover:border-gray-300 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            {isMapExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Compact' : 'አሳንስ'}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Expand Map' : 'ካርታ አሳድግ'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Geolocation feedback / warning alert */}
      {geoError && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-inner bg-gray-100 dark:bg-zinc-950 transition-all">
        {/* Top Floating Map Banner */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-400 pointer-events-none flex items-center justify-between">
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-2 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-bold text-gray-900 dark:text-zinc-100">
              {activeSubCity.nameEn} ({activeSubCity.nameAm})
            </span>
            <span className="text-[10px] text-gray-400">• Drag pin or tap map</span>
          </div>

          {/* Quick Google Maps Preview for Courier */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm text-[10px] font-bold text-[#0052FF] hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1 transition-all pointer-events-auto"
            title="Preview how courier driver navigates via Google Maps"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Leaflet DOM element */}
        <div 
          ref={mapContainerRef} 
          style={{ height: isMapExpanded ? '380px' : '230px', width: '100%', zIndex: 10 }}
          className="transition-all duration-300"
        />

        {/* Bottom Floating Coordinates Dispatch Bar */}
        <div className="p-2.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 truncate">
            <Compass className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
            <span className="text-gray-500 font-mono text-[10px]">
              GPS: {currentLat.toFixed(5)}°N, {currentLng.toFixed(5)}°E
            </span>
            {nearestLandmarkInfo && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-300 font-medium text-[10px] truncate">
                ~{nearestLandmarkInfo.distanceKm} km {language === 'en' ? 'from' : 'ከ'} {language === 'en' ? nearestLandmarkInfo.landmark.nameEn.split('/')[0] : nearestLandmarkInfo.landmark.nameAm.split('/')[0]}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyCoords}
            className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-[10px] font-bold text-gray-700 dark:text-zinc-200 hover:border-gray-300 flex items-center gap-1 cursor-pointer transition-all"
          >
            {copiedCoords ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCoords ? (language === 'en' ? 'Copied' : 'ተቀድቷል') : (language === 'en' ? 'Copy GPS' : 'ኮፒ')}</span>
          </button>
        </div>
      </div>

      {/* Quick Visual Landmark Selector Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#0052FF]" />
            <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300">
              {language === 'en' ? 'Addis Visual Landmark Presets:' : 'የሚታወቁ መለያ ቦታዎች፡'}
            </span>
          </div>

          {/* Subcity vs All Filter Tabs */}
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('subcity')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'subcity'
                  ? 'bg-[#0052FF] text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {activeSubCity.nameEn}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#0052FF] text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {language === 'en' ? 'All Addis' : 'ሁሉም አዲስ'}
            </button>
          </div>
        </div>

        {/* Search Landmark input if viewing all */}
        {activeTab === 'all' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search landmarks across Addis Ababa (e.g. Edna Mall, Piassa, Kazanchis)...' : 'መለያ ቦታ ይፈልጉ (ኤድና ሞል፣ ፒያሳ፣ ካዛንቺስ)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
            />
          </div>
        )}

        {/* Horizontal scrollable landmark chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {filteredLandmarks.slice(0, 10).map((lm) => {
            const isSelected = landmark.toLowerCase().includes(lm.nameEn.toLowerCase().split('/')[0].trim()) ||
                               landmark.includes(lm.nameAm.split('/')[0].trim());

            return (
              <button
                key={lm.id}
                type="button"
                onClick={() => handleSelectLandmark(lm)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'border-[#0052FF] bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-300 ring-2 ring-[#0052FF]/20 font-bold'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
                }`}
              >
                <MapPin className="w-3 h-3 text-[#0052FF] shrink-0" />
                <span>{language === 'en' ? lm.nameEn.split('/')[0] : lm.nameAm.split('/')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compound / Gate Identification Helper */}
      <div className="space-y-2 pt-1 border-t border-gray-150 dark:border-zinc-800/80">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
          {language === 'en' 
            ? 'Compound Gate & Building Cues (መለያ በር / ግቢ)' 
            : 'የግቢ በር ወይም የህንፃ መለያ ዝርዝር'}
        </label>
        
        {/* Quick append tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {compoundCueOptions.map((cue, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAppendCue(language === 'en' ? cue.en : cue.am)}
              className="px-2 py-1 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700 hover:border-[#0052FF] bg-gray-50/70 dark:bg-zinc-800/50 text-[10px] text-gray-600 dark:text-zinc-300 hover:text-[#0052FF] transition-all cursor-pointer"
            >
              + {language === 'en' ? cue.en : cue.am}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder={
            language === 'en'
              ? 'e.g. Black gate with guard, 2nd floor, opposite Awash Bank ATM'
              : 'ምሳሌ፡ ጥቁር በር ጥበቃ ያለው፣ 2ኛ ፎቅ፣ ከአዋሽ ባንክ ኤቲኤም ፊት ለፊት'
          }
          value={gateNotes}
          onChange={(e) => onGateNotesChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF]"
        />
      </div>
    </div>
  );
};

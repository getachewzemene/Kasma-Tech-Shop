import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  Filter, 
  Radio, 
  BatteryCharging, 
  RefreshCw, 
  Layers, 
  Globe, 
  Moon, 
  Sun,
  ShieldCheck,
  Package,
  AlertTriangle,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import { 
  CourierDriver, 
  DEFAULT_COURIER_DRIVER, 
  DeliveryStop, 
  buildCourierStops 
} from './courierTypes';
import { CourierRouteMap } from './CourierRouteMap';
import { CourierStopCard } from './CourierStopCard';
import { DeliveryCompletionModal } from './DeliveryCompletionModal';
import { CourierDelayModal } from './CourierDelayModal';

export const CourierDispatchPage: React.FC = () => {
  const { id: targetOrderId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { orders, language, setLanguage, theme, setTheme, updateCourierOrderStatus, refreshState } = useShop();

  // Courier Driver State
  const [driver, setDriver] = useState<CourierDriver>(DEFAULT_COURIER_DRIVER);
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'IN_TRANSIT' | 'PENDING' | 'DELIVERED' | 'COD'>('ALL');
  const [viewMode, setViewMode] = useState<'SPLIT' | 'MAP_FOCUS' | 'CARDS_ONLY'>('SPLIT');
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [selectedStopId, setSelectedStopId] = useState<string | undefined>(targetOrderId);

  // Modal states
  const [completionModalStop, setCompletionModalStop] = useState<DeliveryStop | null>(null);
  const [delayModalStop, setDelayModalStop] = useState<DeliveryStop | null>(null);

  // Build unified delivery stops from shop orders
  const allStops = useMemo(() => {
    return buildCourierStops(orders, driver.currentLocation);
  }, [orders, driver.currentLocation]);

  // Set target stop if specified in URL params
  useEffect(() => {
    if (targetOrderId) {
      setSelectedStopId(targetOrderId);
      // Auto-scroll to card
      setTimeout(() => {
        const el = document.getElementById(`stop-card-${targetOrderId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [targetOrderId]);

  // Filtered stops
  const filteredStops = useMemo(() => {
    return allStops.filter((stop) => {
      // Tab filter
      if (filterTab === 'IN_TRANSIT' && stop.status !== 'IN_TRANSIT') return false;
      if (filterTab === 'PENDING' && stop.status !== 'PENDING_PICKUP') return false;
      if (filterTab === 'DELIVERED' && stop.status !== 'DELIVERED') return false;
      if (filterTab === 'COD' && !stop.isCod) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = stop.order.customerName.toLowerCase().includes(q);
        const matchPhone = stop.order.customerPhone.includes(q);
        const matchId = stop.order.id.toLowerCase().includes(q);
        const matchLandmark = 
          stop.landmark.nameEn.toLowerCase().includes(q) || 
          stop.landmark.nameAm.includes(q) ||
          stop.subCity.nameEn.toLowerCase().includes(q);
        return matchName || matchPhone || matchId || matchLandmark;
      }

      return true;
    });
  }, [allStops, filterTab, searchQuery]);

  // Daily Run Metrics
  const metrics = useMemo(() => {
    const activeStops = allStops.filter(s => s.status !== 'DELIVERED');
    const deliveredCount = allStops.filter(s => s.status === 'DELIVERED').length;
    const totalCodToCollect = activeStops.filter(s => s.isCod).reduce((sum, s) => sum + s.codAmount, 0);
    const totalDistanceKm = activeStops.reduce((sum, s) => sum + s.distanceKm, 0);

    return {
      activeCount: activeStops.length,
      deliveredCount,
      totalCodToCollect,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10
    };
  }, [allStops]);

  // Handlers for driver actions
  const handleConfirmPickup = async (orderId: string) => {
    await updateCourierOrderStatus(orderId, 'SHIPPED', {
      courierName: driver.name,
      courierPhone: driver.phone,
      trackingNotes: 'Dispatched on motorbike. En route to destination.'
    });
  };

  const handleConfirmDelivery = async (details: { recipientName: string; codCollected: boolean; notes: string }) => {
    if (!completionModalStop) return;
    await updateCourierOrderStatus(completionModalStop.order.id, 'DELIVERED', {
      courierName: driver.name,
      courierPhone: driver.phone,
      trackingNotes: `Delivered to ${details.recipientName}. ${details.notes}`,
      deliveredAt: new Date().toISOString()
    });
  };

  const handleReportDelay = async (reason: string, extraNote: string) => {
    if (!delayModalStop) return;
    const notes = `${reason}${extraNote ? ` - ${extraNote}` : ''}`;
    await updateCourierOrderStatus(delayModalStop.order.id, 'SHIPPED', {
      courierName: driver.name,
      courierPhone: driver.phone,
      trackingNotes: `ROUTE DELAY: ${notes}`
    });
  };

  const handleSelectStop = (stop: DeliveryStop) => {
    setSelectedStopId(stop.order.id);
    const el = document.getElementById(`stop-card-${stop.order.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      {/* Top Driver Command Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Driver Identity & Vehicle Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-blue-950 text-sm">
                <Bike className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-white truncate">
                    {language === 'en' ? driver.name : driver.nameAm}
                  </h1>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30 shrink-0">
                    {driver.vehiclePlate}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {language === 'en' ? 'Addis Express Motorbike Dispatch' : 'የአዲስ አበባ ፈጣን የሞተር ሳይክል ስርጭት'}
                </p>
              </div>
            </div>

            {/* Quick Driver Controls & Duty Switch */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Duty Toggle */}
              <button
                type="button"
                onClick={() => setIsOnDuty(!isOnDuty)}
                className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOnDuty
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{isOnDuty ? (language === 'en' ? 'On Duty' : 'ንቁ') : (language === 'en' ? 'Off Duty' : 'እረፍት')}</span>
              </button>

              {/* Language Switch */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase transition-colors cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>

              {/* Refresh State */}
              <button
                type="button"
                onClick={() => refreshState()}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Sync Dispatch State"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-4 space-y-4">
        {/* Offline / Duty Warning if toggled off */}
        {!isOnDuty && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {language === 'en'
                ? 'Driver status is currently OFF-DUTY. Toggle ON-DUTY to receive new orders.'
                : 'የስራ ሁኔታዎ በእረፍት ላይ ነው። አዳዲስ ትዕዛዞችን ለመቀበል ወደ "ንቁ" ይቀይሩ።'}
            </span>
          </div>
        )}

        {/* Route Run Performance Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Active Stops */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'Active Stops' : 'ቀሪ ማድረሻዎች'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-white">
                {metrics.activeCount}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                / {allStops.length}
              </span>
            </div>
          </div>

          {/* Route Distance */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'Est. Route' : 'የጉዞ ርቀት'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-blue-400">
                {metrics.totalDistanceKm}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">km</span>
            </div>
          </div>

          {/* COD Cash to Collect */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              {language === 'en' ? 'COD Cash to Collect' : 'የሚሰበሰብ ጥሬ ገንዘብ'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-black text-amber-400 truncate">
                {metrics.totalCodToCollect.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-300 font-bold">ETB</span>
            </div>
          </div>

          {/* Delivered Count */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'Completed Today' : 'የደረሱ ትዕዛዞች'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                {metrics.deliveredCount}
              </span>
              <span className="text-[10px] text-emerald-400/80 font-bold">
                {language === 'en' ? 'Delivered' : 'የደረሱ'}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Filter Controls */}
        <div className="space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search by customer, phone, order ID, or landmark...' : 'በደንበኛ ስም፣ ስልክ፣ የትዕዛዝ ቁጥር ወይም መለያ ምልክት ይፈልጉ...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {language === 'en' ? `All Stops (${allStops.length})` : `ሁሉም (${allStops.length})`}
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('IN_TRANSIT')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors cursor-pointer ${
                filterTab === 'IN_TRANSIT'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {language === 'en' ? `In Transit (${allStops.filter(s => s.status === 'IN_TRANSIT').length})` : `በጉዞ ላይ (${allStops.filter(s => s.status === 'IN_TRANSIT').length})`}
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors cursor-pointer ${
                filterTab === 'PENDING'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {language === 'en' ? `Pickup (${allStops.filter(s => s.status === 'PENDING_PICKUP').length})` : `ተረካቢ (${allStops.filter(s => s.status === 'PENDING_PICKUP').length})`}
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('COD')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors cursor-pointer ${
                filterTab === 'COD'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {language === 'en' ? `COD Cash (${allStops.filter(s => s.isCod).length})` : `በእጅ ክፍያ (${allStops.filter(s => s.isCod).length})`}
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('DELIVERED')}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors cursor-pointer ${
                filterTab === 'DELIVERED'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {language === 'en' ? `Delivered (${metrics.deliveredCount})` : `የደረሱ (${metrics.deliveredCount})`}
            </button>
          </div>
        </div>

        {/* Interactive Addis Ababa Vector Route Map */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                {language === 'en' ? 'Interactive Addis Ababa Route Map' : 'የአዲስ አበባ የቀጥታ የካርታ መስመር'}
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              {driver.currentLocation.labelEn}
            </span>
          </div>

          <CourierRouteMap
            driver={driver}
            stops={allStops}
            activeStopId={selectedStopId}
            onSelectStop={handleSelectStop}
            language={language}
            isExpanded={isMapExpanded}
            onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
          />
        </section>

        {/* Delivery Stops Manifest List */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                {language === 'en' ? `Delivery Run Stops (${filteredStops.length})` : `የማድረሻ ዝርዝሮች (${filteredStops.length})`}
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {language === 'en' ? 'Tap card for full details' : 'ለሙሉ ዝርዝር ይጫኑ'}
            </span>
          </div>

          {filteredStops.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <Package className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                {language === 'en' ? 'No delivery stops match current filter.' : 'ከተመረጠው ማጣሪያ ጋር የሚስማማ ትዕዛዝ የለም።'}
              </p>
              <button
                type="button"
                onClick={() => { setFilterTab('ALL'); setSearchQuery(''); }}
                className="text-xs text-blue-400 hover:underline cursor-pointer"
              >
                {language === 'en' ? 'Reset Filters' : 'ማጣሪያዎችን አጽዳ'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStops.map((stop) => (
                <CourierStopCard
                  key={stop.order.id}
                  stop={stop}
                  driver={driver}
                  language={language}
                  isActive={selectedStopId === stop.order.id}
                  onFocusStop={() => setSelectedStopId(stop.order.id)}
                  onConfirmPickup={handleConfirmPickup}
                  onOpenDeliveryModal={(s) => setCompletionModalStop(s)}
                  onOpenDelayModal={(s) => setDelayModalStop(s)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delivery Handover Confirmation Modal */}
      {completionModalStop && (
        <DeliveryCompletionModal
          stop={completionModalStop}
          language={language}
          isOpen={Boolean(completionModalStop)}
          onClose={() => setCompletionModalStop(null)}
          onConfirmDelivery={handleConfirmDelivery}
        />
      )}

      {/* Route Delay Report Modal */}
      {delayModalStop && (
        <CourierDelayModal
          stop={delayModalStop}
          language={language}
          isOpen={Boolean(delayModalStop)}
          onClose={() => setDelayModalStop(null)}
          onSubmitDelay={handleReportDelay}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  ExternalLink, 
  Package, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Send,
  Building,
  Key,
  Compass,
  CornerDownRight
} from 'lucide-react';
import { 
  CourierDriver, 
  DeliveryStop, 
  generateCustomerCallUrl, 
  generateTelegramDriverChatUrl, 
  generateWhatsAppDriverChatUrl, 
  generateSmsEtaUrl, 
  generateGoogleMapsDirUrl, 
  generateWazeDirUrl 
} from './courierTypes';

interface CourierStopCardProps {
  stop: DeliveryStop;
  driver: CourierDriver;
  language: 'en' | 'am';
  isActive: boolean;
  onFocusStop: () => void;
  onConfirmPickup: (orderId: string) => void;
  onOpenDeliveryModal: (stop: DeliveryStop) => void;
  onOpenDelayModal: (stop: DeliveryStop) => void;
}

export const CourierStopCard: React.FC<CourierStopCardProps> = ({
  stop,
  driver,
  language,
  isActive,
  onFocusStop,
  onConfirmPickup,
  onOpenDeliveryModal,
  onOpenDelayModal
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);

  // Status badge styling
  const getStatusBadge = () => {
    switch (stop.status) {
      case 'DELIVERED':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          textEn: 'DELIVERED',
          textAm: 'ደርሷል'
        };
      case 'IN_TRANSIT':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          textEn: 'OUT FOR DELIVERY',
          textAm: 'በጉዞ ላይ'
        };
      default:
        return {
          bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          textEn: 'PENDING HUB PICKUP',
          textAm: 'ተረካቢ ከመጋዘን'
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      id={`stop-card-${stop.order.id}`}
      onClick={onFocusStop}
      className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? 'bg-slate-900 border-amber-500/70 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50'
          : stop.status === 'DELIVERED'
          ? 'bg-slate-950/70 border-slate-800/80 opacity-80'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Stop Number & Identity */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
              stop.status === 'DELIVERED'
                ? 'bg-emerald-600 text-white'
                : stop.status === 'IN_TRANSIT'
                ? 'bg-amber-500 text-black'
                : 'bg-blue-600 text-white'
            }`}>
              #{stop.stopNumber}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-white">
                  {stop.order.id}
                </span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {language === 'en' ? statusBadge.textEn : statusBadge.textAm}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-100 mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                {stop.order.customerName}
              </h3>
            </div>
          </div>

          {/* Subcity & Distance ETA badge */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? stop.subCity.nameEn : stop.subCity.nameAm}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-400 mt-0.5">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{stop.distanceKm} km • ~{stop.estimatedMins} min</span>
            </div>
          </div>
        </div>

        {/* Prominent Landmark Directions Box */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2">
          {/* Landmark Name */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {language === 'en' ? 'Key Addis Landmark' : 'ዋና መለያ ምልክት'}
              </span>
              <p className="text-xs sm:text-sm font-black text-white leading-tight">
                {language === 'en' ? stop.landmark.nameEn : stop.landmark.nameAm}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {language === 'en' ? stop.landmarkHintEn : stop.landmarkHintAm}
              </p>
            </div>
          </div>

          {/* Compound & Gate Notes */}
          {stop.gateNotes && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs">
              <Building className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider block">
                  {language === 'en' ? 'Compound Gate / Access Instructions' : 'የግቢው በር እና የመግቢያ ማስታወሻ'}
                </span>
                <p className="text-amber-100 font-medium text-[11px] leading-snug">
                  {stop.gateNotes}
                </p>
              </div>
            </div>
          )}

          {/* Shipping Address Text */}
          <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-0.5">
            <CornerDownRight className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{stop.order.shippingAddress}</span>
          </p>
        </div>

        {/* 1-Tap Customer Calling & Quick Messaging Bar */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {/* 1-Tap Phone Call */}
          <a
            href={generateCustomerCallUrl(stop.order.customerPhone)}
            className="col-span-2 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            title="Call Customer Directly"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>{language === 'en' ? 'Call Customer' : 'ደውል'}</span>
          </a>

          {/* Telegram Chat */}
          <a
            href={generateTelegramDriverChatUrl(stop.order, driver, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-2 rounded-2xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/40 active:scale-95 text-[#229ED9] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Open Telegram Chat"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="text-[11px]">Telegram</span>
          </a>

          {/* ETA SMS Alert */}
          <a
            href={generateSmsEtaUrl(stop.order, driver, stop.estimatedMins, language)}
            className="py-2.5 px-2 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 active:scale-95 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Send ETA SMS Alert"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[11px]">SMS ETA</span>
          </a>
        </div>

        {/* COD Cash Collection or Pre-Paid Banner */}
        <div className="mt-3">
          {stop.isCod ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider block">
                    {language === 'en' ? 'COD Payment To Collect' : 'የሚሰበሰብ ጥሬ ገንዘብ/ቴሌብር'}
                  </span>
                  <span className="text-sm font-black text-white">
                    {stop.codAmount.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {stop.order.codVerificationPin && (
                <div className="text-right">
                  <span className="text-[9px] text-amber-300 font-mono block">
                    {language === 'en' ? 'Verification PIN' : 'የማረጋገጫ ፒን'}
                  </span>
                  <span className="font-mono font-black text-xs text-white bg-slate-900 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    {stop.order.codVerificationPin}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-bold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'en'
                    ? `Pre-Paid (${stop.order.paymentMethod}) • Do Not Collect Cash`
                    : `በ${stop.order.paymentMethod} አስቀድሞ የተከፈለ • ጥሬ ገንዘብ አይቀበሉ`}
                </span>
              </div>
              <span className="font-mono text-emerald-200">
                {stop.order.total.toLocaleString()} ETB
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expand / Details Toggle Button */}
      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-wider border-t border-slate-800/60 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? (language === 'en' ? 'Hide Package Details' : 'ዝርዝር ደብቅ') : (language === 'en' ? 'View Package Items & Navigation' : 'የእቃ ዝርዝር እና ካርታ አሳይ')}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Section (Items List + GPS Nav Launchers + Status Action) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-1 bg-slate-950/60 border-t border-slate-800/80 space-y-3.5">
          {/* Items In Package */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'en' ? 'Package Manifest' : 'የእቃዎች ዝርዝር'}</span>
            </span>

            <div className="space-y-1.5">
              {stop.order.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.nameEn}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate text-[11px]">
                        {language === 'en' ? item.product.nameEn : item.product.nameAm}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.variantName || 'Standard'} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-slate-200 text-xs shrink-0">
                    {(item.price * item.quantity).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* External GPS Turn-by-Turn Navigation Launchers */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={generateGoogleMapsDirUrl(stop.coordinates.lat, stop.coordinates.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Maps</span>
            </a>

            <a
              href={generateWazeDirUrl(stop.coordinates.lat, stop.coordinates.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Waze GPS</span>
            </a>
          </div>

          {/* Driver Workflow Status Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
            {stop.status === 'PENDING_PICKUP' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirmPickup(stop.order.id);
                }}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs tracking-wide shadow-lg shadow-blue-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>{language === 'en' ? 'Confirm Hub Pickup (ተረከብ)' : 'ከመጋዘን መረከብ አረጋግጥ'}</span>
              </button>
            )}

            {stop.status === 'IN_TRANSIT' && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDelayModal(stop);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Delay' : 'መዘግየት'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDeliveryModal(stop);
                  }}
                  className="flex-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'en' ? 'Mark Delivered (ደርሷል)' : 'ደርሷል አረጋግጥ'}</span>
                </button>
              </>
            )}

            {stop.status === 'DELIVERED' && (
              <div className="w-full py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-black text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'en' ? 'Delivery Completed & Confirmed' : 'ማድረሱ በተሳካ ሁኔታ ተጠናቋል'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

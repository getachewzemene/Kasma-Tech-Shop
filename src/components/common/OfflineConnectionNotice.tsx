import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, RefreshCw, Package, Phone, CheckCircle2, Database, AlertCircle } from 'lucide-react';

interface OfflineConnectionNoticeProps {
  language?: 'en' | 'am';
  onOpenMyOrders?: () => void;
}

export const OfflineConnectionNotice: React.FC<OfflineConnectionNoticeProps> = ({
  language = 'en',
  onOpenMyOrders
}) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isWeakConnection, setIsWeakConnection] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // 1. Connection listeners
    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      setIsDismissed(false);
      const timer = setTimeout(() => setJustReconnected(false), 4500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Check Network Information API for weak connection (2G / slow-2g)
    const conn = (navigator as unknown as { connection?: { effectiveType?: string; addEventListener?: (type: string, listener: () => void) => void } }).connection;
    if (conn) {
      const checkSpeed = () => {
        const type = conn.effectiveType;
        setIsWeakConnection(type === '2g' || type === 'slow-2g');
      };
      checkSpeed();
      conn.addEventListener?.('change', checkSpeed);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualRecheck = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`/favicon.ico?_ping=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      if (res.ok || res.status < 400) {
        setIsOffline(false);
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 4500);
      } else {
        setIsOffline(true);
      }
    } catch {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  };

  const isEn = language === 'en';

  // If fully online, not weak connection, and not just reconnected, don't show
  if (!isOffline && !isWeakConnection && !justReconnected) {
    return null;
  }

  if (isDismissed && !justReconnected) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="sticky top-0 z-55 w-full shadow-md"
      >
        {justReconnected ? (
          // Reconnection Success Banner
          <div className="bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between gap-2 border-b border-emerald-500/40">
            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>
                  {isEn
                    ? '⚡ Back online! Live product inventory & courier tracking synchronized.'
                    : '⚡ ኢንተርኔት ተመልሷል! የቀጥታ እቃዎች ክምችት እና ትራኪንግ ዘምኗል።'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setJustReconnected(false)}
                className="text-emerald-200 hover:text-white px-1.5 py-0.5 rounded cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          // Offline / Weak Connection Banner
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-3 sm:px-6 py-2.5 text-xs shadow-lg border-b border-amber-500/40">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-950/40 border border-amber-400/40 flex items-center justify-center shrink-0">
                  {isOffline ? (
                    <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-200" />
                  )}
                </div>
                <div>
                  <span className="font-extrabold uppercase tracking-wide block leading-tight">
                    {isOffline
                      ? (isEn ? 'Offline Mode Active (0ms Speed)' : 'ከመስመር ውጭ ሁነታ (0ms ፍጥነት)')
                      : (isEn ? 'Slow / Weak Connection Detected' : 'ደካማ የኔትወርክ ግንኙነት ተገኝቷል')}
                  </span>
                  <span className="text-[11px] text-amber-100 block leading-tight mt-0.5">
                    {isEn
                      ? 'Browsing 100% verified local catalog cache & saved orders.'
                      : 'የተመዘገቡ የካታሎግ እቃዎች እና የቀደሙ ትዕዛዞችዎን ከመሸጎጫ ይመልከቱ።'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <button
                  type="button"
                  disabled={isChecking}
                  onClick={handleManualRecheck}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-400/50 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Check Internet Connection"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-200 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isEn ? 'Retry Connection' : 'እንደገና ሞክር'}</span>
                </button>

                {onOpenMyOrders && (
                  <button
                    type="button"
                    onClick={onOpenMyOrders}
                    className="px-2.5 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-amber-100 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isEn ? 'Offline Orders & Passes' : 'የተቀመጡ ትዕዛዞች'}</span>
                  </button>
                )}

                <a
                  href="tel:+251911223344"
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 border border-amber-300/40 text-[11px] font-bold flex items-center gap-1 text-white transition-all"
                  title="Call Phone Support"
                >
                  <Phone className="w-3 h-3 text-amber-200" />
                  <span className="hidden sm:inline">+251 911 22 33 44</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="w-6 h-6 rounded-lg hover:bg-amber-900/60 flex items-center justify-center text-amber-200 hover:text-white cursor-pointer ml-1"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

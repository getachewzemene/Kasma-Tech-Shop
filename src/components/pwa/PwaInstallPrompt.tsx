import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Zap, 
  CheckCircle2, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { 
  isPwaStandalone, 
  isIosDevice, 
  triggerPwaInstall, 
  subscribeToInstallPrompt 
} from '../../pwaRegister';

interface PwaInstallPromptProps {
  language?: 'en' | 'am';
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ language = 'en' }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default true until verified
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOfflineBadge, setShowOfflineBadge] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running standalone
    const standalone = isPwaStandalone();
    setIsStandalone(standalone);
    if (standalone) return;

    // 2. Check dismiss expiry (7 days)
    const dismissedTime = localStorage.getItem('kasma_pwa_prompt_dismissed');
    if (dismissedTime) {
      const elapsed = Date.now() - parseInt(dismissedTime, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (elapsed < sevenDays) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }

    // 3. Detect iOS device
    const ios = isIosDevice();
    setIsIos(ios);

    // 4. Subscribe to native install prompt listener
    const unsubscribe = subscribeToInstallPrompt((installable) => {
      setCanInstall(installable);
    });

    // 5. Connectivity listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBadge(true);
      setTimeout(() => setShowOfflineBadge(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBadge(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('kasma_pwa_prompt_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (canInstall) {
      const result = await triggerPwaInstall();
      if (result.outcome === 'accepted') {
        setIsDismissed(true);
      }
    } else {
      // Fallback instruction for browsers where prompt has not fired yet
      alert(
        language === 'am'
          ? 'እባክዎ በስልክዎ Browser ሜኑ (⋮) ውስጥ "Add to Home screen" ወይም "Install app" የሚለውን ይጫኑ።'
          : 'Tap your browser menu (⋮) and select "Install app" or "Add to Home screen" for instant app launch.'
      );
    }
  };

  // Do not show banner if app is already running standalone
  if (isStandalone) {
    return (
      <>
        {/* Offline notification badge for standalone app */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-950 text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 shadow-md">
            <WifiOff className="w-3.5 h-3.5" />
            <span>
              {language === 'am' 
                ? 'ከመስመር ውጭ (Offline) ሁነታ: የተሸመቱ እና የተቀመጡ እቃዎች መመልከት ይችላሉ' 
                : 'Offline Mode Active: Browsing saved catalog items from cache'}
            </span>
          </div>
        )}
      </>
    );
  }

  // If dismissed and no offline alert to show, return null
  if (isDismissed && !showOfflineBadge && isOnline) {
    return null;
  }

  return (
    <>
      {/* Offline/Online Status Pill */}
      {showOfflineBadge && (
        <div 
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            isOnline 
              ? 'bg-emerald-600/90 text-white border border-emerald-400/30' 
              : 'bg-amber-600/95 text-white border border-amber-400/30'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-emerald-200" />
              <span>{language === 'am' ? 'ኢንተርኔት ተገናኝቷል • መተግበሪያው ዘምኗል' : 'Back Online • Catalog Synchronized'}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-amber-200" />
              <span>{language === 'am' ? 'ከመስመር ውጭ • ከመሸጎጫ እየሰራ ነው' : 'Offline • Accelerated Cache Active'}</span>
            </>
          )}
        </div>
      )}

      {/* Mobile & Tablet App Install Bottom Bar */}
      {!isDismissed && (canInstall || isIos) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* App Branding & Pitch */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0052FF] to-blue-700 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
                <img 
                  src="/icon-192.png" 
                  alt="Kasma Tech App" 
                  className="w-full h-full object-cover rounded-[14px]"
                  onError={(e) => {
                    // Fallback to favicon if icon is not ready
                    (e.target as HTMLImageElement).src = '/favicon.png';
                  }}
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-black shadow">
                  ⚡
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {language === 'am' ? 'ካስማ ቴክ ሾፕ (Kasma App)' : 'Kasma Tech Shop App'}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-[#0052FF] dark:bg-blue-950 dark:text-blue-400">
                    PWA 2.0
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {language === 'am'
                    ? 'ፈጣን 0ms ጭነት • ከመስመር ውጭ ካታሎግ • የሞባይል መተግበሪያ'
                    : 'Instant 0ms load speed • Offline catalog • Zero storage'}
                </p>
              </div>

              {/* Close Button on Mobile Header */}
              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg sm:hidden"
                aria-label="Dismiss install prompt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleInstallClick}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isIos ? (
                  <>
                    <Share2 className="w-4 h-4 text-white" />
                    <span>{language === 'am' ? 'ወደ ስልክ ጫን' : 'Install on iPhone / iPad'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white animate-bounce" />
                    <span>{language === 'am' ? 'መተግበሪያውን ጫን' : 'Install App'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDismiss}
                className="hidden sm:flex p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Step-by-Step Installation Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-[#0052FF] dark:text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'am' ? 'በ iOS Safari ላይ መጫኛ' : 'Install on Safari (iOS)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'am' ? 'በሁለት ቅደም ተከተሎች ይጫኑ' : '2 quick taps to add Kasma to Home Screen'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-[#0B0F17] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs">
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-bold text-[#0052FF] dark:text-blue-400">
                  1
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {language === 'am' ? (
                    <>በ Safari ታችኛው ክፍል ላይ የሚገኘውን <strong>ማጋሪያ (Share <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />)</strong> ምልክት ይጫኑ።</>
                  ) : (
                    <>Tap the <strong>Share</strong> button (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) at the bottom toolbar of Safari.</>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-bold text-[#0052FF] dark:text-blue-400">
                  2
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {language === 'am' ? (
                    <>ወደ ታች ዝቅ ብለው <strong>"Add to Home Screen" (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-500" />)</strong> የሚለውን ይምረጡ።</>
                  ) : (
                    <>Scroll down the sheet and select <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-500" />).</>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {language === 'am'
                    ? 'ከዚያ በኋላ ካስማ መተግበሪያ እንደ ኦፊሴላዊ የሞባይል App በስልክዎ ገጽ ላይ ይቀመጣል!'
                    : 'Done! Kasma will launch full-screen with offline caching enabled.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {language === 'am' ? 'ገባኝ • ተረዳሁ' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

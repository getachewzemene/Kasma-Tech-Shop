import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Zap, 
  Wifi, 
  WifiOff, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { 
  isPwaStandalone, 
  isIosDevice, 
  isInAppBrowser,
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
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  
  // Display modes: 'banner' (full bottom bar), 'floating' (compact FAB pill), 'hidden'
  const [displayMode, setDisplayMode] = useState<'banner' | 'floating' | 'hidden'>('banner');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOfflineBadge, setShowOfflineBadge] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running standalone
    const standalone = isPwaStandalone();
    setIsStandalone(standalone);
    if (standalone) {
      setDisplayMode('hidden');
      return;
    }

    // 2. Check dismiss / minimize preferences
    const isBannerDismissed = localStorage.getItem('kasma_pwa_banner_dismissed') === 'true';
    const isFabDismissed = localStorage.getItem('kasma_pwa_fab_dismissed') === 'true';

    if (isFabDismissed) {
      setDisplayMode('hidden');
    } else if (isBannerDismissed) {
      setDisplayMode('floating');
    } else {
      setDisplayMode('banner');
    }

    // 3. Detect iOS and In-App WebViews (Telegram, Instagram, etc.)
    setIsIos(isIosDevice());
    setInAppBrowser(isInAppBrowser());

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

  // Minimize bottom banner into floating button
  const handleMinimizeToFloating = () => {
    setDisplayMode('floating');
    localStorage.setItem('kasma_pwa_banner_dismissed', 'true');
  };

  // Permanently close floating option for 7 days
  const handleDismissFab = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayMode('hidden');
    localStorage.setItem('kasma_pwa_fab_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (inAppBrowser) {
      setShowIosGuide(true);
      return;
    }

    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (canInstall) {
      const result = await triggerPwaInstall();
      if (result.outcome === 'accepted') {
        setDisplayMode('hidden');
        localStorage.setItem('kasma_pwa_banner_dismissed', 'true');
        localStorage.setItem('kasma_pwa_fab_dismissed', 'true');
      }
    } else {
      // Android / Desktop manual trigger guidance
      alert(
        language === 'am'
          ? 'እባክዎ በአሳሽዎ (Browser) ሜኑ (⋮) ውስጥ "Install app" ወይም "Add to Home screen" የሚለውን ይምረጡ።'
          : 'Tap your browser menu (⋮) and select "Install app" or "Add to Home screen" for instant app launch.'
      );
    }
  };

  // If app is running standalone, only render the offline/online network badge
  if (isStandalone) {
    return (
      <>
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

      {/* OPTION 1: Floating Action Pill (Compact Floating Option) */}
      {displayMode === 'floating' && (
        <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative group">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900/90 dark:bg-[#0052FF]/90 hover:bg-[#0052FF] text-white shadow-xl shadow-blue-500/25 border border-white/20 backdrop-blur-md text-xs font-bold transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Install Kasma App"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                {isIos ? (
                  <Share2 className="w-3 h-3 text-white" />
                ) : (
                  <Download className="w-3 h-3 text-white animate-pulse" />
                )}
              </div>
              <span>{language === 'am' ? 'ካስማ መተግበሪያን ጫን' : 'Install App'}</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                ⚡ 0ms
              </span>
            </button>

            {/* Floating Pill Mini Close Button */}
            <button
              onClick={handleDismissFab}
              className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 flex items-center justify-center text-[10px] border border-white/20 shadow-md cursor-pointer transition-colors"
              title="Hide"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* OPTION 2: Full Bottom Banner (Prominent Mobile Bar) */}
      {displayMode === 'banner' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* App Branding & Highlights */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0052FF] to-blue-700 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
                <img 
                  src="/icon-192.png" 
                  alt="Kasma Tech App" 
                  className="w-full h-full object-cover rounded-[14px]"
                  onError={(e) => {
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

              {/* Minimize to Floating Button (Mobile) */}
              <button
                onClick={handleMinimizeToFloating}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg sm:hidden"
                title="Minimize"
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
                    <span>{language === 'am' ? 'ወደ ስልክ ጫን (iOS)' : 'Install on iPhone / iPad'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white animate-bounce" />
                    <span>{language === 'am' ? 'መተግበሪያውን ጫን' : 'Install App'}</span>
                  </>
                )}
              </button>

              {/* Minimize to Floating Button (Desktop/Tablet) */}
              <button
                onClick={handleMinimizeToFloating}
                className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Minimize to Floating Button"
              >
                <span>{language === 'am' ? 'ቀንስ' : 'Minimize'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERCOMING IOS SAFARI ISSUES: Interactive Sheet & Pointer Overlay */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in slide-in-from-bottom duration-300 relative z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-[#0052FF] dark:text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {inAppBrowser
                      ? (language === 'am' ? 'ወደ Safari ይክፈቱ' : 'Open in Safari First')
                      : (language === 'am' ? 'በ iOS Safari ላይ መጫኛ' : 'Install on Safari (iOS)')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'am' ? 'በአፕል ስርዓት ፈጣን ጭነት' : 'Apple iOS Home Screen installation'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* IN-APP BROWSER OVERCOME (Telegram, Instagram, Facebook WebViews) */}
            {inAppBrowser ? (
              <div className="space-y-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs">
                <div className="flex items-start gap-2.5 text-amber-700 dark:text-amber-400 font-bold">
                  <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {language === 'am'
                      ? 'መተግበሪያውን በ Telegram ወይም በማህበራዊ ሚዲያ WebView ውስጥ ከፍተዋል'
                      : 'You are viewing inside Telegram or Social In-App Browser'}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {language === 'am' ? (
                    <>በቀኝ በኩል ከላይ የሚገኘውን <strong>(⋯ ወይም ⋮)</strong> ሜኑ በመጫን <strong>"Open in Safari"</strong> ወይም <strong>"በአሳሽ ክፈት"</strong> የሚለውን ይምረጡ። ከዚያ በኋላ ወደ ስልክዎ መጫን ይችላሉ።</>
                  ) : (
                    <>Apple blocks direct PWA installs inside Telegram/Instagram. Tap <strong>(⋯ or ⋮)</strong> in the top-right corner and select <strong>"Open in Safari"</strong> to install Kasma onto your Home Screen.</>
                  )}
                </p>
              </div>
            ) : (
              /* STANDARD SAFARI 2-STEP OVERCOME */
              <div className="space-y-3 bg-slate-50 dark:bg-[#0B0F17] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-bold text-[#0052FF] dark:text-blue-400">
                    1
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {language === 'am' ? (
                      <>በ Safari ታችኛው ክፍል ላይ የሚገኘውን <strong>ማጋሪያ (Share <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />)</strong> ምልክት ይጫኑ።</>
                    ) : (
                      <>Tap Safari's <strong>Share</strong> button (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) at the bottom toolbar of your screen.</>
                    )}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-bold text-[#0052FF] dark:text-blue-400">
                    2
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {language === 'am' ? (
                      <>ወደ ታች ዝቅ ብለው <strong>"Add to Home Screen" (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-500" />)</strong> የሚለውን ይምረጡና "Add" ይበሉ።</>
                    ) : (
                      <>Scroll down the sheet and select <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-500" />) &rarr; tap <strong>Add</strong>.</>
                    )}
                  </p>
                </div>

                {/* Outcome */}
                <div className="flex items-start gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    ✓
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {language === 'am'
                      ? 'ካስማ ልክ እንደ ኦፊሴላዊ የሞባይል መተግበሪያ 0ms በሆነ ፍጥነት በስልክዎ ላይ ይከፈታል!'
                      : 'Kasma will launch full-screen with offline caching enabled!'}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowIosGuide(false);
                handleMinimizeToFloating();
              }}
              className="w-full py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-colors cursor-pointer"
            >
              {language === 'am' ? 'ገባኝ • ተረዳሁ' : 'Got it!'}
            </button>
          </div>

          {/* ANIMATED POINTER: Points down directly to the Safari Share button on iPhone */}
          {!inAppBrowser && (
            <div className="sm:hidden flex flex-col items-center gap-1 text-white animate-bounce mt-4 z-20 pointer-events-none">
              <span className="text-xs font-bold bg-black/60 px-3 py-1 rounded-full border border-white/20">
                {language === 'am' ? 'የማጋሪያ ምልክቱ እዚህ ታች ይገኛል' : 'Tap the Share icon below'}
              </span>
              <ArrowDown className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
          )}
        </div>
      )}
    </>
  );
};

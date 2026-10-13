import React from 'react';
import { useShop } from '../../context/ShopContext';
import { RefreshCw, WifiOff } from 'lucide-react';

interface SyncStatusButtonProps {
  className?: string;
  showText?: boolean;
}

export const SyncStatusButton: React.FC<SyncStatusButtonProps> = ({ className = '', showText = true }) => {
  const {
    language,
    offlineOrders,
    isOfflineSimulated,
    setIsOfflineSimulated,
    isSyncing,
    handleForceSync,
    showToast
  } = useShop();

  return (
    <button
      type="button"
      onClick={() => {
        if (offlineOrders.length > 0 && !isOfflineSimulated) {
          handleForceSync?.();
        } else {
          setIsOfflineSimulated(!isOfflineSimulated);
          showToast(
            !isOfflineSimulated
              ? (language === 'en' ? 'Simulated Offline Mode enabled' : 'ከመስመር ውጭ ሁነታ ተጀምሯል')
              : (language === 'en' ? 'Connected to server' : 'ከሰርቨር ጋር ተገናኝቷል'),
            'info'
          );
        }
      }}
      className={`h-9 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
        isOfflineSimulated
          ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/80'
          : offlineOrders.length > 0
          ? 'bg-[#0052FF] text-white border-blue-600 animate-pulse'
          : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/80'
      } ${className}`}
      title={
        isOfflineSimulated
          ? (language === 'en' ? 'Offline Mode active. Click to reconnect' : 'ከመስመር ውጭ ሁነታ። ለማገናኘት ይጫኑ')
          : offlineOrders.length > 0
          ? (language === 'en' ? `${offlineOrders.length} orders queued. Click to sync` : `${offlineOrders.length} ትዕዛዞች ተቀምጠዋል። ለማመሳሰል ይጫኑ`)
          : (language === 'en' ? 'Connected (Live). Click to simulate offline' : 'የተገናኘ። ከመስመር ውጭ ለመሞከር ይጫኑ')
      }
    >
      {isSyncing ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0052FF]" />
      ) : isOfflineSimulated ? (
        <WifiOff className="w-3.5 h-3.5 text-amber-600" />
      ) : (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-500" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
      {showText && (
        <span className="font-mono text-[11px] font-extrabold hidden sm:inline">
          {isOfflineSimulated ? 'Offline' : 'Sync Live'}
        </span>
      )}
      {offlineOrders.length > 0 && (
        <span className="bg-rose-500 text-white text-[10px] font-mono font-black px-1.5 rounded-full">
          {offlineOrders.length}
        </span>
      )}
    </button>
  );
};

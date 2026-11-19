import React from 'react';
import { Product, PriceAlert } from '../../types';
import { Bell } from 'lucide-react';
import { LazyImage } from '../LazyImage';

export interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceAlerts: PriceAlert[];
  products: Product[];
  language: 'en' | 'am';
  onUpdateThresholdPrice: (productId: string, price: number) => void;
  onTogglePriceAlert: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  priceAlerts,
  products,
  language,
  onUpdateThresholdPrice,
  onTogglePriceAlert,
  onOpenProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Body */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-zinc-900 rounded-3xl flex flex-col shadow-2xl border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between bg-amber-500/[0.02] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 rounded-xl">
              <Bell className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-gray-950 dark:text-white">
                {language === 'en' ? 'Price Watch List' : 'የዋጋ ክትትል ዝርዝር'}
              </h3>
              <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
                {language === 'en'
                  ? 'Monitored items with target prices'
                  : 'የተመረጡ እቃዎች ከዒላማ ዋጋ ጋር'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-1.5 w-8 h-8 flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
            title={language === 'en' ? 'Close' : 'ዝጋ'}
          >
            ✕
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {priceAlerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="p-5 bg-amber-500/[0.04] rounded-full text-amber-500 max-w-max mx-auto shadow-xs">
                <Bell className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? 'No Price Alerts Configured' : 'ምንም የዋጋ ማንቂያ አልተዋቀረም'}
                </h4>
                <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-xs leading-relaxed">
                  {language === 'en'
                    ? 'Tap the bell icon on any product card or quick view to get notified of price drops!'
                    : 'ዋጋ ሲቀንስ ማንቂያ ለማግኘት በማንኛውም ምርት ካርድ ወይም ፈጣን እይታ ላይ የደወል ምልክቱን ይጫኑ!'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {priceAlerts.map((alert) => {
                const product = products.find((p) => p.id === alert.productId);
                if (!product) return null;

                const percentOfBase = Math.round((alert.thresholdPrice / product.price) * 100);
                const isBelowThreshold = product.price <= alert.thresholdPrice;

                return (
                  <div
                    key={alert.productId}
                    className="p-4 bg-gray-50/50 dark:bg-zinc-950/30 rounded-2xl border border-gray-150 dark:border-zinc-800/40 relative flex flex-col gap-3 group transition-all"
                  >
                    <div className="flex gap-3">
                      {/* Product Image with Shimmer */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-150 dark:border-zinc-850 shrink-0">
                        <LazyImage
                          src={product.image}
                          alt={product.nameEn}
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-zinc-100 truncate">
                          {language === 'en' ? product.nameEn : product.nameAm}
                        </h4>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                          {product.brand}
                        </p>

                        {/* Current vs Target Price Indicator */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <div>
                            <span className="text-[8px] text-gray-400 dark:text-zinc-500 uppercase font-black tracking-wider block">
                              {language === 'en' ? 'Current' : 'የአሁኑ'}
                            </span>
                            <span className="font-mono font-bold text-xs text-gray-900 dark:text-zinc-100">
                              {product.price.toLocaleString()} ETB
                            </span>
                          </div>
                          <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800" />
                          <div>
                            <span className="text-[8px] text-gray-400 dark:text-zinc-500 uppercase font-black tracking-wider block">
                              {language === 'en' ? 'Threshold' : 'ገደብ ዋጋ'}
                            </span>
                            <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                              {alert.thresholdPrice.toLocaleString()} ETB
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <div className="pt-2 border-t border-gray-150 dark:border-zinc-800/60 space-y-1.5">
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>{language === 'en' ? 'Adjust Target' : 'ዒላማ አስተካክል'}:</span>
                        <span className="font-mono text-amber-500">{percentOfBase}% of current</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={Math.floor(product.price * 0.5)}
                          max={product.price}
                          step={10}
                          value={alert.thresholdPrice}
                          onChange={(e) => onUpdateThresholdPrice(product.id, Number(e.target.value))}
                          className="flex-grow accent-amber-500 h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Footer Status & Actions */}
                    <div className="flex justify-between items-center gap-2 pt-1">
                      {isBelowThreshold ? (
                        <span className="bg-green-500/10 dark:bg-green-500/5 text-green-600 dark:text-green-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                          {language === 'en' ? 'Price Met! 🎉' : 'ዋጋ ደርሷል! 🎉'}
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {language === 'en' ? 'Waiting for Drop' : 'ቅናሽ በመጠባበቅ ላይ'}
                        </span>
                      )}

                      <div className="flex gap-2">
                        {/* View Product Detailed */}
                        <button
                          onClick={() => {
                            onOpenProduct(product);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 bg-gray-950 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          {language === 'en' ? 'View Details' : 'ዝርዝር እይ'}
                        </button>

                        {/* Remove Alert */}
                        <button
                          onClick={() => onTogglePriceAlert(product)}
                          className="p-1.5 bg-gray-100 hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 border border-gray-150 dark:border-zinc-700/60 rounded-lg transition-all cursor-pointer"
                          title={language === 'en' ? 'Remove Alert' : 'ማንቂያ አስወግድ'}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

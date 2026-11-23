import React from 'react';
import { Product, Variant, CartItem, PromoCode } from '../../types';
import { ShoppingCart, Share2, Package, Sparkles, Truck, ChevronRight } from 'lucide-react';
import { LazyImage } from '../LazyImage';

export interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  language: 'en' | 'am';
  removingSkus: string[];
  recentlyAddedSkus: string[];
  recentlyUpdatedSku: string | null;
  onRemoveFromCart: (sku: string) => void;
  onUpdateCartQty: (sku: string, qty: number) => void;
  onOpenShareCart: () => void;
  onOpenCheckout: () => void;
  cartSubtotal: number;
  cartTotal: number;
  shippingFee: number;
  activeDiscount: number;
  promoCodeInput: string;
  setPromoCodeInput: (val: string) => void;
  promoError: string | null;
  setPromoError: (val: string | null) => void;
  promoSuccessMessage: string | null;
  appliedPromo: PromoCode | null;
  promoCodes: PromoCode[];
  onApplyPromo: (code?: string) => void;
  onRemovePromo: () => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
  approvedProducts: Product[];
  onAddToCart: (product: Product, variant: Variant, quantity: number) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  language,
  removingSkus,
  recentlyAddedSkus,
  recentlyUpdatedSku,
  onRemoveFromCart,
  onUpdateCartQty,
  onOpenShareCart,
  onOpenCheckout,
  cartSubtotal,
  cartTotal,
  shippingFee,
  activeDiscount,
  promoCodeInput,
  setPromoCodeInput,
  promoError,
  setPromoError,
  promoSuccessMessage,
  appliedPromo,
  promoCodes,
  onApplyPromo,
  onRemovePromo,
  showToast,
  approvedProducts,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] rounded-3xl flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 overflow-hidden"
      >
        {/* 1. Header (Fixed top) */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 text-gray-950 dark:text-white border-b border-gray-150 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                <ShoppingCart className="w-5 h-5" />
              </div>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0052FF] text-white text-[9px] font-mono font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-gray-950 dark:text-white">
                {language === 'en' ? 'My Shopping Cart' : 'የእኔ ሱቅ ጋሪ'}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                {cart.length === 0
                  ? (language === 'en' ? '0 items' : '0 እቃዎች')
                  : cart.length === 1
                    ? (language === 'en' ? '1 unique item' : '1 ልዩ እቃ')
                    : (language === 'en' ? `${cart.length} unique items` : `${cart.length} ልዩ እቃዎች`)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onOpenShareCart}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#0052FF] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                title={language === 'en' ? 'Share Cart' : 'ጋሪ አጋራ'}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'en' ? 'Share Cart' : 'ጋሪ አጋራ'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-1.5 w-8 h-8 flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body: Cart Items & Promo Codes */}
        <div className="flex-grow overflow-y-auto p-3.5 sm:p-5 space-y-3.5 scrollbar-thin bg-gray-50/70 dark:bg-zinc-950/70">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-gray-400 dark:text-zinc-500 py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-3 border border-gray-200 dark:border-zinc-700/50 shadow-inner">
                <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-zinc-600" />
              </div>
              <p className="font-extrabold text-base text-gray-700 dark:text-zinc-300">
                {language === 'en' ? 'Your cart is empty' : 'ጋሪዎ ባዶ ነው'}
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed">
                {language === 'en' ? 'Explore our high quality products and add them to get started.' : 'እባክዎን ምርቶችን ይጎብኙና ወደ ጋሪ ያስገቡ።'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 px-6 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {language === 'en' ? 'Start Shopping' : 'ግዢ ጀምር'}
              </button>
            </div>
          ) : (
            <>
              {/* PRIMARY OBJECT: Ordered Cart Items */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#0052FF]" />
                    <span>{language === 'en' ? 'Primary Ordered Items' : 'ዋና የተመረጡ እቃዎች'} ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#0052FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 px-2 py-0.5 rounded-full">
                    {language === 'en' ? 'Primary Selection' : 'ዋና ምርጫ'}
                  </span>
                </div>

                {cart.map((item) => {
                  const isRemoving = removingSkus.includes(item.sku);
                  const isRecentlyAdded = recentlyAddedSkus.includes(item.sku);
                  const isRecentlyUpdated = recentlyUpdatedSku === item.sku;

                  return (
                    <div
                      key={item.sku}
                      className={`p-3 sm:p-4 rounded-2xl border flex gap-3 relative shadow-xs transition-all duration-300 transform-gpu ${isRemoving
                        ? 'opacity-0 scale-90 -translate-x-6 max-h-0 py-0 my-0 border-transparent overflow-hidden pointer-events-none'
                        : isRecentlyAdded
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-[#0052FF] shadow-md scale-[1.02] ring-2 ring-[#0052FF]/30 animate-in fade-in slide-in-from-right-6 duration-300'
                          : isRecentlyUpdated
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400/60 scale-[1.01] shadow-xs'
                            : 'bg-white dark:bg-zinc-855/80 border-gray-150 dark:border-zinc-800 hover:border-gray-250 dark:hover:border-zinc-700 animate-in fade-in slide-in-from-right-4 duration-250'
                        }`}
                    >
                      <LazyImage
                        src={item.product.image}
                        alt={item.product.nameEn}
                        className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-xl shrink-0 border border-gray-150 dark:border-zinc-800"
                        containerClassName="w-16 h-16 sm:w-18 sm:h-18 rounded-xl shrink-0"
                      />
                      <div className="flex-grow min-w-0 pr-6">
                        <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider">{item.product.brand}</p>
                        <h5 className="font-extrabold text-gray-950 dark:text-white text-xs sm:text-sm truncate">
                          {language === 'en' ? item.product.nameEn : item.product.nameAm}
                        </h5>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-400 font-medium mt-0.5 truncate">{item.variantName}</p>
                        <p className="text-xs sm:text-sm font-black text-[#0052FF] dark:text-blue-400 font-mono mt-1">
                          {(item.price * item.quantity).toLocaleString()} ETB
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal ml-1">
                              ({item.price.toLocaleString()} x {item.quantity})
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Absolute Top-Right Remove Button */}
                      <button
                        onClick={() => onRemoveFromCart(item.sku)}
                        title="Remove item"
                        className="absolute top-2.5 right-2.5 text-gray-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                      >
                        ✕
                      </button>

                      {/* Bottom-Right Quantity Selector */}
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 border border-gray-200 dark:border-zinc-750 bg-gray-50 dark:bg-zinc-900 rounded-xl p-0.5">
                        <button
                          onClick={() => onUpdateCartQty(item.sku, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className={`text-xs font-black w-5 text-center text-gray-950 dark:text-white font-mono transition-transform ${isRecentlyUpdated ? 'scale-125 text-[#0052FF]' : ''}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateCartQty(item.sku, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECONDARY OBJECTS: Delivery threshold incentives, promo coupons, and share tools */}
              <div className="space-y-3 pt-3 border-t border-gray-200/80 dark:border-zinc-800">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'en' ? 'Offers & Shipping Perks' : 'ልዩ ጥቅሞች እና ማጓጓዣ'}</span>
                  </span>
                </div>

                {/* Free Express Shipping Progress Bar */}
                {(() => {
                  const freeShippingThreshold = 25000;
                  const amountLeft = Math.max(0, freeShippingThreshold - cartSubtotal);
                  const progress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
                  return (
                    <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 dark:from-amber-500/20 dark:via-blue-500/20 dark:to-indigo-500/20 p-3 rounded-2xl border border-blue-200/60 dark:border-blue-800/50 shadow-2xs space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 text-[11px] sm:text-xs">
                          <Truck className="w-4 h-4 text-[#0052FF] shrink-0" />
                          {amountLeft > 0 ? (
                            language === 'en' ? (
                              <span>Add <span className="font-mono text-[#0052FF] dark:text-blue-400 font-black">{amountLeft.toLocaleString()} ETB</span> for FREE Express Shipping</span>
                            ) : (
                              <span>ነፃ ኤክስፕረስ ማጓጓዣ ለማግኘት <span className="font-mono text-[#0052FF] font-black">{amountLeft.toLocaleString()} ብር</span> ጨምሩ</span>
                            )
                          ) : (
                            language === 'en' ? '🎉 You unlocked FREE Kasma Express Shipping!' : '🎉 ነፃ የካስማ ኤክስፕረስ ማጓጓዣ አግኝተዋል!'
                          )}
                        </span>
                        <span className="text-[10px] font-mono font-black text-[#0052FF] dark:text-blue-400 shrink-0 ml-1">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Promo Code Input & Discount Coupons Block */}
              <div className="bg-white dark:bg-zinc-900 p-3 sm:p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800 space-y-2.5 shadow-xs">
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 block">
                  {language === 'en' ? '🏷️ PROMO CODE / DISCOUNT COUPON' : '🏷️ የቅናሽ ኩፖን ኮድ'}
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'e.g. KASMA10' : 'ምሳሌ KASMA10'}
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value);
                      setPromoError(null);
                    }}
                    disabled={!!appliedPromo}
                    className="flex-grow border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF] uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400 disabled:bg-gray-100 dark:disabled:bg-zinc-850 disabled:text-gray-400"
                  />
                  {appliedPromo ? (
                    <button
                      type="button"
                      onClick={onRemovePromo}
                      className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      {language === 'en' ? 'Remove' : 'አስወግድ'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onApplyPromo()}
                      className="bg-[#0052FF] hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
                    >
                      {language === 'en' ? 'Apply' : 'አስገባ'}
                    </button>
                  )}
                </div>

                {promoError && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold px-1">{promoError}</p>
                )}

                {promoSuccessMessage && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-1 leading-relaxed">{promoSuccessMessage}</p>
                )}

                {/* Available Offers Accordion */}
                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <details className="group">
                    <summary className="list-none flex items-center justify-between text-[10px] font-black text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white cursor-pointer select-none">
                      <span>{language === 'en' ? 'View Active Offers 💡' : 'የሚገኙ ልዩ ቅናሾች 💡'}</span>
                      <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform text-gray-450" />
                    </summary>
                    <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {promoCodes.map((promo) => {
                        const isEligible = !promo.minSubtotal || cartSubtotal >= promo.minSubtotal;
                        const minSub = promo.minSubtotal || 0;
                        return (
                          <div
                            key={promo.code}
                            onClick={() => {
                              if (isEligible && !appliedPromo) {
                                setPromoCodeInput(promo.code);
                                onApplyPromo(promo.code);
                              } else if (!isEligible) {
                                showToast(
                                  language === 'en'
                                    ? `Minimum order of ${minSub.toLocaleString()} ETB required for ${promo.code}`
                                    : `ለ${promo.code} ቢያንስ ${minSub.toLocaleString()} ብር ግዢ ያስፈልጋል`,
                                  'warning'
                                );
                              }
                            }}
                            className={`p-2 rounded-xl border transition-all text-left text-[11px] flex justify-between items-center ${appliedPromo?.code === promo.code
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                              : isEligible
                                ? 'bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-850 border-gray-150 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:text-black cursor-pointer'
                                : 'bg-gray-50/40 dark:bg-zinc-950/20 border-gray-100 dark:border-zinc-850 text-gray-400 dark:text-zinc-600 cursor-not-allowed opacity-60'
                              }`}
                          >
                            <div className="min-w-0 pr-1">
                              <span className="font-mono font-black border border-dashed border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[9px] mr-1 text-gray-950 dark:text-white">
                                {promo.code}
                              </span>
                              <span className="font-medium text-[10px] text-gray-600 dark:text-zinc-400 block mt-1">
                                {language === 'en' ? promo.descriptionEn : promo.descriptionAm}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 shrink-0 whitespace-nowrap">
                              {promo.minSubtotal ? `${promo.minSubtotal} ETB` : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              </div>

              {/* Recommended Add-Ons Section */}
              {approvedProducts.filter(p => !cart.some(c => c.product.id === p.id)).length > 0 && (
                <div className="bg-white dark:bg-zinc-900 p-3 sm:p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800 space-y-2.5 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 block">
                      {language === 'en' ? '✨ YOU MIGHT ALSO LIKE' : '✨ እነዚህንም ሊወዱ ይችላሉ'}
                    </span>
                    <span className="text-[9px] text-[#0052FF] dark:text-blue-400 font-bold uppercase tracking-wider">
                      {language === 'en' ? 'Quick Add' : 'ቀጥታ ጨምር'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {approvedProducts
                      .filter(p => !cart.some(c => c.product.id === p.id))
                      .slice(0, 3)
                      .map(product => {
                        const defaultVariant = product.variants[0];
                        if (!defaultVariant) return null;
                        const itemPrice = (product.price || 0) + (defaultVariant.priceOffset || 0);
                        return (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/60 hover:bg-gray-100/70 dark:hover:bg-zinc-850/70 transition-all gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={product.image}
                                alt={product.nameEn}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-150 dark:border-zinc-800"
                              />
                              <div className="min-w-0">
                                <p className="font-extrabold text-[11px] text-gray-900 dark:text-zinc-100 truncate">
                                  {language === 'en' ? product.nameEn : product.nameAm}
                                </p>
                                <p className="text-[10px] font-mono font-bold text-[#0052FF] dark:text-blue-400 leading-none mt-0.5">
                                  {itemPrice.toLocaleString()} ETB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onAddToCart(product, defaultVariant, 1)}
                              className="px-2.5 py-1 bg-[#0052FF]/10 hover:bg-[#0052FF] text-[#0052FF] hover:text-white border border-[#0052FF]/20 text-[10px] font-extrabold rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-0.5"
                            >
                              <span>+</span>
                              <span>{language === 'en' ? 'Add' : 'ጨምር'}</span>
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Guarantee & Trust Badges Strip */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-800 shadow-2xs">
                  <div className="text-base mb-0.5">🛡️</div>
                  <p className="text-[10px] font-semibold text-gray-800 dark:text-zinc-300">{language === 'en' ? 'Escrow Protected' : 'ኤስክሮው የተጠበቀ'}</p>
                  <p className="text-[8px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Inspected On Delivery' : 'በፍተሻ የሚለቀቅ'}</p>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-800 shadow-2xs">
                  <div className="text-base mb-0.5">⚡</div>
                  <p className="text-[10px] font-semibold text-gray-800 dark:text-zinc-300">{language === 'en' ? '1-2 Hr Express' : 'ፈጣን ማድረሻ'}</p>
                  <p className="text-[8px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Addis Ababa Wide' : 'በአዲስ አበባ አቀፍ'}</p>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-800 shadow-2xs">
                  <div className="text-base mb-0.5">🔄</div>
                  <p className="text-[10px] font-semibold text-gray-800 dark:text-zinc-300">{language === 'en' ? '7-Day Return' : '7-ቀን መመለሻ'}</p>
                  <p className="text-[8px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Money Back Guarantee' : 'ሙሉ ዋስትና'}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 3. Sticky Footer: Price Breakdown & Prominent Checkout Button */}
        {cart.length > 0 && (
          <div className="p-3.5 sm:p-5 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800/80 space-y-3 shrink-0 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                <span>{language === 'en' ? 'Subtotal' : 'ከፊል ድምር'}</span>
                <span className="font-mono font-bold text-gray-900 dark:text-zinc-200">{cartSubtotal.toLocaleString()} ETB</span>
              </div>
              {activeDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>{language === 'en' ? `Discount (${appliedPromo?.code})` : `የቅናሽ መጠን (${appliedPromo?.code})`}</span>
                  <span className="font-mono">-{activeDiscount.toLocaleString()} ETB</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                <span>{language === 'en' ? 'Shipping (Kasma Express)' : 'የማጓጓዣ ዋጋ (ካስማ ኤክስፕረስ)'}</span>
                <span className="font-mono font-bold text-gray-900 dark:text-zinc-200">{shippingFee.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-950 dark:text-white text-sm pt-1.5 border-t border-gray-200 dark:border-zinc-800/80">
                <span>{language === 'en' ? 'Grand Total' : 'ጠቅላላ ድምር'}</span>
                <span className="text-[#0052FF] dark:text-blue-400 font-mono font-black text-base">{cartTotal.toLocaleString()} ETB</span>
              </div>
            </div>

            <button
              id="cart-drawer-checkout-btn"
              onClick={onOpenCheckout}
              className="w-full bg-[#0052FF] hover:bg-blue-600 active:scale-[0.99] text-white py-3 sm:py-3.5 px-3.5 sm:px-5 rounded-2xl transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 text-left min-w-0">
                <span className="bg-white/20 text-white font-mono text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0">
                  {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? 'item' : 'items'}
                </span>
                <span className="text-xs sm:text-sm font-mono font-black text-white truncate">
                  {cartTotal.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold shrink-0 pl-2">
                <span>{language === 'en' ? 'Checkout' : 'ወደ መክፈያ'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

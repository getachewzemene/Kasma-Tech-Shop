import React from 'react';
import { Product, Variant, CartItem } from '../../types';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { LazyImage } from '../LazyImage';

export interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  products: Product[];
  language: 'en' | 'am';
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  setRecentlyAddedSkus: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product, variant: Variant) => void;
  onToggleFavorite: (productId: string, e?: React.MouseEvent) => void;
  onOpenCart: () => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  favorites,
  products,
  language,
  cart,
  setCart,
  setFavorites,
  setRecentlyAddedSkus,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  onOpenCart,
  showToast,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] rounded-3xl flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 overflow-hidden"
      >
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 text-black dark:text-white border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40">
              <Heart className="w-4.5 h-4.5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                {language === 'en' ? 'My Wishlist' : 'የእኔ ምኞት ዝርዝር'}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                {favorites.length === 0
                  ? (language === 'en' ? '0 saved items' : '0 የተቀመጡ እቃዎች')
                  : (language === 'en' ? `${favorites.length} saved ${favorites.length === 1 ? 'item' : 'items'}` : `${favorites.length} የተቀመጡ እቃዎች`)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-1.5 w-8 h-8 flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
            title={language === 'en' ? 'Close' : 'ዝጋ'}
          >
            ✕
          </button>
        </div>

        <div className="flex-grow overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-3 sm:space-y-4">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-gray-400 dark:text-zinc-500 py-10 sm:py-14">
              <Heart className="w-16 h-16 text-gray-200 dark:text-zinc-800 mb-2 stroke-1" />
              <p className="font-bold text-sm text-gray-700 dark:text-zinc-300">
                {language === 'en' ? 'Your wishlist is empty' : 'ምኞት ዝርዝርዎ ባዶ ነው'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                {language === 'en'
                  ? 'Tap the heart icon on any product to save it here for later.'
                  : 'ምርቶችን እዚህ ለማስቀመጥ በምርቶቹ ላይ ያለውን የልብ ምልክት ይጫኑ።'}
              </p>
            </div>
          ) : (
            products
              .filter((p) => favorites.includes(p.id))
              .map((product) => {
                const defaultVariant = product.variants?.find(v => (v.onHand ?? 0) > 0) || product.variants?.[0];
                const isOutOfStock = !product.variants?.length || product.variants.every(v => (v.onHand ?? 0) <= 0);
                return (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-zinc-850 p-3.5 sm:p-4 rounded-2xl border border-gray-150 dark:border-zinc-800 flex items-center gap-3 relative shadow-xs hover:border-gray-250 dark:hover:border-zinc-700 transition-all"
                  >
                    {/* Thumbnail image container strictly bounded to prevent flex blowout */}
                    <div
                      onClick={() => {
                        onClose();
                        onOpenProduct(product);
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-gray-150 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 cursor-pointer hover:opacity-90 transition-opacity"
                      title={language === 'en' ? 'View details' : 'ዝርዝር ይመልከቱ'}
                    >
                      <LazyImage
                        src={product.image}
                        alt={product.nameEn}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    </div>

                    {/* Product Info & Actions */}
                    <div className="flex-1 min-w-0 pr-7 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider truncate">
                            {product.brand}
                          </p>
                          {isOutOfStock ? (
                            <span className="text-[10px] sm:text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded leading-none">
                              {language === 'en' ? 'Out of Stock' : 'አልቋል'}
                            </span>
                          ) : (
                            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded leading-none">
                              {language === 'en' ? 'In Stock' : 'አለ'}
                            </span>
                          )}
                        </div>

                        <h5
                          onClick={() => {
                            onClose();
                            onOpenProduct(product);
                          }}
                          className="font-bold text-gray-950 dark:text-white text-xs sm:text-sm truncate hover:text-[#0052FF] cursor-pointer transition-colors"
                          title={language === 'en' ? product.nameEn : product.nameAm}
                        >
                          {language === 'en' ? product.nameEn : product.nameAm}
                        </h5>

                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-sm sm:text-base font-black font-mono text-gray-950 dark:text-white">
                            {product.price.toLocaleString()}
                          </span>
                          <span className="text-[10.5px] sm:text-xs font-bold text-[#0052FF] dark:text-blue-400 font-mono">
                            ETB
                          </span>
                        </div>
                      </div>

                      {/* Quick Add To Cart inside wishlist */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => {
                            if (defaultVariant) {
                              onAddToCart(product, defaultVariant);
                              showToast(
                                language === 'en'
                                  ? `Added ${product.nameEn} to cart!`
                                  : `${product.nameAm} ወደ ጋሪ ታክሏል!`,
                                'success'
                              );
                            }
                          }}
                          className={`py-1.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs active:scale-95 ${isOutOfStock
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-750 cursor-not-allowed'
                            : 'bg-[#0052FF] hover:bg-blue-600 text-white'
                            }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {isOutOfStock
                              ? (language === 'en' ? 'Out of Stock' : 'ክምችት አልቋል')
                              : (language === 'en' ? 'Add To Cart' : 'ወደ ጋሪ አስገባ')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => onToggleFavorite(product.id, e)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-full transition-all cursor-pointer"
                      title={language === 'en' ? 'Remove from Wishlist' : 'ከምኞት ዝርዝር አስወግድ'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
          )}
        </div>

        {favorites.length > 0 && (
          <div className="p-4 sm:p-5 bg-gray-50 dark:bg-zinc-950 border-t border-gray-150 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                // Add all available wishlisted items to cart in a single batch
                const wishlistProducts = products.filter(p => favorites.includes(p.id));
                if (wishlistProducts.length === 0) return;

                let tempCart = [...cart];
                let addedCount = 0;
                const newlyAddedSkus: string[] = [];
                const addedProductIds: string[] = [];

                wishlistProducts.forEach(product => {
                  const defaultVariant = product.variants?.find(v => (v.onHand ?? 0) > 0) || product.variants?.[0];
                  const isOutOfStock = !product.variants?.length || product.variants.every(v => (v.onHand ?? 0) <= 0);

                  if (defaultVariant && !isOutOfStock) {
                    const existingIndex = tempCart.findIndex(
                      item => item.product.id === product.id && item.sku === defaultVariant.sku
                    );
                    const currentQtyInCart = existingIndex > -1 ? tempCart[existingIndex].quantity : 0;

                    if (currentQtyInCart + 1 <= defaultVariant.onHand) {
                      if (existingIndex > -1) {
                        tempCart[existingIndex] = {
                          ...tempCart[existingIndex],
                          quantity: tempCart[existingIndex].quantity + 1
                        };
                      } else {
                        tempCart.push({
                          product,
                          sku: defaultVariant.sku,
                          variantName: defaultVariant.name,
                          quantity: 1,
                          price: product.price + defaultVariant.priceOffset
                        });
                      }
                      addedCount++;
                      newlyAddedSkus.push(defaultVariant.sku);
                      addedProductIds.push(product.id);
                    }
                  }
                });

                if (addedCount > 0) {
                  setCart(tempCart);
                  if (addedProductIds.length > 0) {
                    setFavorites(prev => prev.filter(id => !addedProductIds.includes(id)));
                  }

                  if (newlyAddedSkus.length > 0) {
                    setRecentlyAddedSkus(prev => [...prev, ...newlyAddedSkus]);
                    setTimeout(() => {
                      setRecentlyAddedSkus(prev => prev.filter(s => !newlyAddedSkus.includes(s)));
                    }, 1200);
                  }

                  onClose();
                  onOpenCart();
                  showToast(
                    language === 'en'
                      ? `Added ${addedCount} wishlist item${addedCount > 1 ? 's' : ''} to cart!`
                      : `${addedCount} እቃዎች ወደ ጋሪ ታክለዋል!`,
                    'success'
                  );
                } else {
                  showToast(
                    language === 'en'
                      ? 'No items could be added (all items out of stock or max quantity reached).'
                      : 'ምንም ምርት ማከል አልተቻለም (ክምችት አልቋል)።',
                    'warning'
                  );
                }
              }}
              className="w-full bg-rose-500 hover:bg-rose-600 active:scale-98 text-white text-xs sm:text-sm font-extrabold py-3.5 rounded-full transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>{language === 'en' ? 'Add All To Cart 🚀' : 'ሁሉንም ወደ ጋሪ አስገባ 🚀'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

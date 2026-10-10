import React, { useState } from 'react';
import { LazyImage } from '../../components/LazyImage';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Tag, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    cartCount,
    language,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    discountAmount
  } = useShop();

  const [promoInput, setPromoInput] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    if (applyPromoCode(promoInput)) {
      setPromoInput('');
    }
  };

  const estimatedShipping = cart.length > 0 ? 100 : 0;
  const grandTotal = Math.max(0, cartSubtotal + estimatedShipping - discountAmount);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-100">
            {language === 'en' ? 'Your Shopping Cart is Empty' : 'የግዢ ጋሪዎ ባዶ ነው'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {language === 'en'
              ? 'Discover Ethiopian tech listings including sealed smartphones, laptops, and original electronics.'
              : 'ኦሪጅናል ስልኮችን፣ ላፕቶፖችን እና የኤሌክትሮኒክስ እቃዎችን በመደብሩ ውስጥ ይፈልጉ።'}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Explore Catalog' : 'እቃዎችን አስስ'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">
            {language === 'en' ? 'Shopping Cart' : 'የግዢ ጋሪ'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            {cartCount} {language === 'en' ? 'items currently in your cart' : 'እቃዎች በጋሪዎ ውስጥ አሉ'}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
        >
          {language === 'en' ? 'Clear Cart' : 'ጋሪውን ባዶ አድርግ'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.sku}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 flex items-center gap-4 transition-all"
            >
              <LazyImage
                src={item.product.image}
                alt={item.product.nameEn}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shrink-0"
                containerClassName="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 bg-gray-100 dark:bg-zinc-800"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <Link
                  to={`/product/${item.product.id}`}
                  className="text-sm font-black text-gray-900 dark:text-zinc-100 hover:text-[#0052FF] transition-colors truncate block"
                >
                  {language === 'en' ? item.product.nameEn : item.product.nameAm}
                </Link>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Variant: <span className="font-semibold text-gray-700 dark:text-zinc-300">{item.variantName}</span>
                </p>
                <p className="text-xs font-black text-gray-900 dark:text-zinc-100">
                  {item.price.toLocaleString()} ETB
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.sku, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-gray-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-xs text-gray-900 dark:text-zinc-100">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.sku, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-gray-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.sku)}
                className="p-2 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Quick trust banner */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center gap-3 text-xs text-blue-900 dark:text-blue-300">
            <Truck className="w-5 h-5 shrink-0 text-[#0052FF]" />
            <p>
              {language === 'en'
                ? 'All Addis Ababa orders include 2-4 hour courier dispatch and verified Escrow coverage.'
                : 'ሁሉም የአዲስ አበባ ትዕዛዞች ከ2-4 ሰዓት የፈጣን ማድረሻ እና የክፍያ ዋስትና አላቸው።'}
            </p>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
              {language === 'en' ? 'Order Summary' : 'የትዕዛዝ ማጠቃለያ'}
            </h2>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase">
                {language === 'en' ? 'Promo Code' : 'የቅናሽ ኮድ'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. KASMA2026"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-gray-100 dark:bg-zinc-800 border border-transparent focus:border-[#0052FF] outline-none uppercase font-bold text-gray-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Apply' : 'ተግብር'}
                </button>
              </div>

              {appliedPromo && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{appliedPromo.code}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>

            <div className="border-t border-gray-150 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>{language === 'en' ? 'Subtotal' : 'ድምር'}</span>
                <span className="font-bold text-gray-900 dark:text-zinc-100">{cartSubtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>{language === 'en' ? 'Est. Courier Delivery' : 'የማጓጓዣ ግምት'}</span>
                <span className="font-bold text-gray-900 dark:text-zinc-100">+{estimatedShipping} ETB</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{language === 'en' ? 'Promo Discount' : 'የቅናሽ ቅነሳ'}</span>
                  <span>-{discountAmount.toLocaleString()} ETB</span>
                </div>
              )}
              <div className="border-t border-gray-150 dark:border-zinc-800 pt-3 flex justify-between text-sm font-black text-gray-900 dark:text-zinc-100">
                <span>{language === 'en' ? 'Grand Total' : 'ጠቅላላ ድምር'}</span>
                <span className="text-base text-[#0052FF]">{grandTotal.toLocaleString()} ETB</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'en' ? 'Proceed to Checkout' : 'ወደ ክፍያ ቀጥል'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

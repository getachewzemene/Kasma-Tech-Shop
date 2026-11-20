import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, Send, MessageCircle } from 'lucide-react';
import { CartItem } from '../../types';
import { generateShareableCartUrl } from '../../utils/cartSharing';

interface ShareCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  language: 'en' | 'am';
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShareCartModal: React.FC<ShareCartModalProps> = ({
  isOpen,
  onClose,
  cart,
  language,
  showToast
}) => {
  const [copiedSharedLink, setCopiedSharedLink] = useState(false);

  const handleCopyCartLink = () => {
    if (cart.length === 0) {
      if (showToast) {
        showToast(
          language === 'en' ? 'Cart is empty!' : 'የገበያ ጋሪዎ ባዶ ነው!',
          'error'
        );
      }
      return;
    }
    const shareUrl = generateShareableCartUrl(cart);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedSharedLink(true);
      if (showToast) {
        showToast(
          language === 'en'
            ? 'Cart share link copied to clipboard!'
            : 'የጋሪ ማጋሪያ ሊንክ ተቀድቷል!',
          'success'
        );
      }
      setTimeout(() => setCopiedSharedLink(false), 3000);
    });
  };

  const handleNativeShareCart = async () => {
    if (cart.length === 0) return;
    const shareUrl = generateShareableCartUrl(cart);
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'en' ? 'Kasma Tech Shop Cart' : 'የካስማ ቴክ ሾፕ ጋሪ',
          text: language === 'en' ? 'Check out my shopping cart on Kasma Tech Shop!' : 'የእኔን ካስማ የገበያ ጋሪ ይመልከቱ!',
          url: shareUrl
        });
      } catch {
        handleCopyCartLink();
      }
    } else {
      handleCopyCartLink();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 text-gray-900 dark:text-zinc-100 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/40">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-950 dark:text-white tracking-tight">
                    {language === 'en' ? 'Share Shopping Cart' : 'የገበያ ጋሪዎን ያጋሩ'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {language === 'en'
                      ? `Unique link with ${cart.length} item${cart.length > 1 ? 's' : ''}`
                      : `${cart.length} እቃዎችን የያዘ ልዩ ሊንክ`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-950 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Generated Link Input Box & Copy Button */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                {language === 'en' ? 'Shareable Cart URL' : 'የጋሪው ሊንክ'}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow min-w-0">
                  <input
                    type="text"
                    readOnly
                    value={generateShareableCartUrl(cart)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 dark:text-zinc-300 font-mono focus:outline-none truncate select-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyCartLink}
                  className="bg-[#0052FF] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedSharedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>{language === 'en' ? 'Copied!' : 'ተቀድቷል!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{language === 'en' ? 'Copy Link' : 'ሊንክ ቅዳ'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Messaging Share Channels */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(generateShareableCartUrl(cart))}&text=${encodeURIComponent(language === 'en' ? 'Check out my Kasma shopping cart!' : 'የእኔን ካስማ የገበያ ጋሪ ይመልከቱ!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-900/40 transition-all text-blue-600 dark:text-blue-400 cursor-pointer group"
              >
                <Send className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-extrabold">{language === 'en' ? 'Telegram' : 'ቴሌግራም'}</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent((language === 'en' ? 'Check out my Kasma shopping cart: ' : 'የካስማ የገበያ ጋሪዬን ይመልከቱ፡ ') + generateShareableCartUrl(cart))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-900/40 transition-all text-emerald-600 dark:text-emerald-400 cursor-pointer group"
              >
                <MessageCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-extrabold">{language === 'en' ? 'WhatsApp' : 'ዋትስአፕ'}</span>
              </a>

              <button
                type="button"
                onClick={handleNativeShareCart}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-750 border border-gray-200 dark:border-zinc-700 transition-all text-gray-700 dark:text-zinc-200 cursor-pointer group"
              >
                <Share2 className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-extrabold">{language === 'en' ? 'Native Share' : 'ማጋሪያ'}</span>
              </button>
            </div>

            {/* Items Summary list preview */}
            <div className="bg-gray-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800/80 space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
              <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                <span>{language === 'en' ? 'Cart Preview' : 'የጋሪ እቃዎች'}</span>
                <span className="font-mono">{cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()} ETB</span>
              </div>
              <div className="space-y-1.5">
                {cart.map((item) => (
                  <div key={item.sku} className="flex items-center justify-between text-xs py-1 border-b border-gray-150 dark:border-zinc-850/60 last:border-0">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <img src={item.product.image} alt={item.product.nameEn} className="w-7 h-7 object-cover rounded-lg shrink-0 border border-gray-200 dark:border-zinc-800" />
                      <span className="font-bold text-gray-900 dark:text-zinc-200 truncate">{language === 'en' ? item.product.nameEn : item.product.nameAm}</span>
                      <span className="text-[10px] text-gray-400">x{item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-[#0052FF] shrink-0">{(item.price * item.quantity).toLocaleString()} ETB</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { Share2, Copy, Check, X, Send, Facebook, MessageCircle, ExternalLink } from 'lucide-react';
import { Product } from '../types';

interface ShareProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({
  product,
  isOpen,
  onClose,
  language,
  showToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const shareTitle = language === 'en' ? product.nameEn : product.nameAm;
  const sharePrice = product.price.toLocaleString();
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/#product-${product.id}` 
    : `https://kasmatech.et/#product-${product.id}`;
  const shareText = `Check out "${shareTitle}" for ${sharePrice} ETB at Kasma Tech Shop! 🛒✨`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      if (showToast) {
        showToast(
          language === 'en' ? 'Product link copied to clipboard!' : 'የምርት ሊንክ ወደ ቅንጥብ ሰሌዳ ተገልብጧል!',
          'success'
        );
      }
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 shadow-2xl max-w-sm w-full p-5 space-y-4 relative overflow-hidden text-left animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-white">
                {language === 'en' ? 'Share Product' : 'ምርቱን ያጋሩ'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                {language === 'en' ? 'Spread the word with friends' : 'ለጓደኞችዎ ያጋሩ'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Preview Snippet */}
        <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-zinc-850 rounded-xl border border-gray-100 dark:border-zinc-800">
          <img src={product.image} alt={product.nameEn} className="w-12 h-12 object-cover rounded-lg shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
              {shareTitle}
            </h4>
            <p className="text-[11px] font-mono font-black text-[#0052FF] dark:text-blue-400 mt-0.5">
              {sharePrice} ETB
            </p>
          </div>
        </div>

        {/* Direct Copy Link Box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">
            {language === 'en' ? 'Direct Product Link' : 'የምርት ሊንክ'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-800 dark:text-zinc-200 rounded-xl px-3 py-2 font-mono focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0052FF] hover:bg-blue-600 text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Copied' : 'ተገልብጧል'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Copy' : 'ቅዳ'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Sharing Grid */}
        <div className="space-y-2 pt-1">
          <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">
            {language === 'en' ? 'Share via Social Media' : 'በማህበራዊ ሚዲያ ያጋሩ'}
          </label>

          <div className="grid grid-cols-2 gap-2">
            {/* Telegram */}
            <button
              type="button"
              onClick={handleShareTelegram}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-400 font-bold text-xs transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-sky-500 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </div>
              <span>Telegram</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsapp}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span>WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleShareFacebook}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 font-bold text-xs transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </div>
              <span>Facebook</span>
            </button>

            {/* Native OS Share */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 text-gray-800 dark:text-zinc-200 font-bold text-xs transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-300 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-gray-800 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-gray-900 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <span>{language === 'en' ? 'More...' : 'ተጨማሪ...'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

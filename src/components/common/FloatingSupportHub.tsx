import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, Phone, X, Headphones, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { generateWhatsAppCustomerWelcomeUrl } from '../../utils/whatsappNotifications';

export const FloatingSupportHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, language } = useShop();
  const hubRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hubRef.current && !hubRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const totalCartCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const isEn = language === 'en';

  const whatsappUrl = generateWhatsAppCustomerWelcomeUrl(cart, isEn ? 'en' : 'am');
  const telegramUrl = 'https://t.me/KasmaShopSupport';

  const quickTopics = [
    {
      labelEn: '🚚 Delivery & Tracking Status',
      labelAm: '🚚 የማድረስ ሁኔታ እና ትራኪንግ',
      msgEn: 'Hello Kasma Team, I would like to inquire about my delivery status.'
    },
    {
      labelEn: '🛡️ Warranty & Serial Inspection',
      labelAm: '🛡️ የዋስትና እና የሴሪያል ቁጥር ምርመራ',
      msgEn: 'Hello Kasma Team, I have a question regarding manufacturer warranty verification.'
    },
    {
      labelEn: '💳 Telebirr & CBE Payment Help',
      labelAm: '💳 የቴሌብር እና ሲቢኢ ክፍያ እርዳታ',
      msgEn: 'Hello Kasma Team, I need assistance with Telebirr / CBE Birr escrow payment.'
    }
  ];

  return (
    <div ref={hubRef} className="fixed bottom-20 sm:bottom-6 right-3.5 sm:right-6 z-40 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="mb-3 w-[300px] sm:w-[340px] bg-white dark:bg-[#111726] rounded-3xl border border-gray-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {/* Header Bar */}
            <div className="bg-gradient-to-r from-[#0052FF] via-blue-600 to-indigo-700 p-4 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black tracking-tight leading-tight">
                      {isEn ? 'Kasma Live Customer Care' : 'የካስማ የቀጥታ የደንበኞች ድጋፍ'}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-medium text-blue-100">
                        {isEn ? 'Online • Instant reply in Addis' : 'አሁን ክፍት ነው • ፈጣን ምላሽ'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {totalCartCount > 0 && (
                <div className="mt-3 px-2.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 text-[10.5px] text-white flex items-center justify-between">
                  <span>
                    {isEn ? `Cart auto-attached (${totalCartCount} item${totalCartCount > 1 ? 's' : ''})` : `የጋሪ እቃዎች ተያይዘዋል (${totalCartCount} እቃዎች)`}
                  </span>
                  <span className="font-mono font-bold text-amber-300">✓ Ready</span>
                </div>
              )}
            </div>

            {/* Quick Action Channels */}
            <div className="p-3.5 space-y-2.5 text-left">
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="group p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        WhatsApp Care
                      </span>
                      <span className="text-[9px] bg-[#25D366] text-white font-bold px-1.5 py-0.2 rounded-full">
                        Fastest
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                      {isEn ? 'Chat directly with support team' : 'ከድጋፍ ሰጪ ቡድኑ ጋር በቀጥታ ያውሩ'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Telegram Button */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="group p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 flex items-center justify-between transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Send className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        Telegram Official
                      </span>
                      <span className="text-[9px] bg-[#229ED9] text-white font-bold px-1.5 py-0.2 rounded-full">
                        Bot + Human
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                      @KasmaShopSupport
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Direct Phone Call */}
              <a
                href="tel:+251911223344"
                className="group p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700/80 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-800 dark:text-zinc-200 block">
                      {isEn ? 'Call Dispatch Hotline' : 'የስልክ ጥሪ መስመር'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      +251 911 22 33 44
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#0052FF] dark:text-blue-400">
                  {isEn ? 'Dial' : 'ደውል'}
                </span>
              </a>

              {/* Suggested Questions */}
              <div className="pt-1.5 border-t border-gray-150 dark:border-zinc-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block mb-1.5">
                  {isEn ? 'Common Inquiries' : 'ተደጋጋሚ ጥያቄዎች'}
                </span>
                <div className="space-y-1">
                  {quickTopics.map((topic, tIdx) => (
                    <a
                      key={tIdx}
                      href={`https://wa.me/251911223344?text=${encodeURIComponent(topic.msgEn)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="text-[10.5px] p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-700 dark:text-zinc-300 hover:text-[#0052FF] dark:hover:text-blue-400 block transition-colors truncate"
                    >
                      {isEn ? topic.labelEn : topic.labelAm}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Support' : 'Open WhatsApp and Telegram Support'}
        className="group relative flex items-center gap-2 p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-[#25D366] via-emerald-600 to-[#229ED9] text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-white/30 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform rotate-90" />
          ) : (
            <div className="flex items-center -space-x-1.5">
              <span className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shadow-xs">
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
              </span>
              <span className="w-6 h-6 rounded-full bg-[#229ED9] flex items-center justify-center shadow-xs">
                <Send className="w-3 h-3" />
              </span>
            </div>
          )}

          {/* Active Status Pulse Dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
        </div>

        {/* Text Pill on Desktop Hover / Idle */}
        <span className="hidden sm:inline-block font-extrabold text-xs pr-1 tracking-tight">
          {isEn ? 'Support' : 'ድጋፍ'}
        </span>

        {/* Cart Item Badge */}
        {totalCartCount > 0 && (
          <span className="absolute -top-1.5 -left-1.5 bg-amber-400 text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-xs">
            {totalCartCount}
          </span>
        )}
      </button>
    </div>
  );
};

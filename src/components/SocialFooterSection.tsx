import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Instagram, 
  Youtube, 
  Facebook, 
  MessageCircle, 
  ExternalLink, 
  Check, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { SOCIAL_PLATFORMS_CONFIG, SocialPlatformConfig, SocialIconKey } from '../config/socialLinks';
import { generateWhatsAppCustomerWelcomeUrl } from '../utils/whatsappNotifications';
import { CartItem } from '../types';

interface SocialFooterSectionProps {
  language?: 'en' | 'am';
  cart?: CartItem[];
}

const renderSocialIcon = (iconKey: SocialIconKey, className: string = "w-4 h-4") => {
  switch (iconKey) {
    case 'telegram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.07-.75 4.19-1.82 6.98-3.02 8.38-3.6 3.99-1.66 4.82-1.95 5.36-1.96.12 0 .38.03.55.17.14.12.18.28.2.41-.02.07-.02.21-.03.28z"/>
        </svg>
      );
    case 'instagram':
      return <Instagram className={className} />;
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.34V9.28a8.16 8.16 0 0 0 4.77 1.52V7.34a4.85 4.85 0 0 1-.86-.65z"/>
        </svg>
      );
    case 'youtube':
      return <Youtube className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'whatsapp':
      return <MessageCircle className={className} />;
    default:
      return <Share2 className={className} />;
  }
};

const getIconBadgeBg = (platform: SocialPlatformConfig) => {
  if (platform.brandColor === 'gradient') {
    return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white';
  }
  if (platform.brandColor === '#000000') {
    return 'bg-black dark:bg-zinc-950 text-white border border-zinc-700';
  }
  return `text-white`;
};

export const SocialFooterSection: React.FC<SocialFooterSectionProps> = ({ language = 'en', cart = [] }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyHandle = (e: React.MouseEvent, platform: SocialPlatformConfig) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(platform.handle);
    setCopiedId(platform.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const getAnimationVariants = (trigger?: string) => {
    switch (trigger) {
      case 'bounce':
        return {
          hover: { y: [0, -4, 0], transition: { repeat: Infinity, duration: 0.6 } }
        };
      case 'rotate':
        return {
          hover: { rotate: [0, -12, 12, -6, 0], transition: { duration: 0.5 } }
        };
      case 'pulse':
        return {
          hover: { scale: [1, 1.25, 1], transition: { repeat: Infinity, duration: 0.8 } }
        };
      case 'wave':
        return {
          hover: { x: [0, 3, -3, 3, 0], transition: { duration: 0.5 } }
        };
      case 'slide':
        return {
          hover: { x: 3, y: -3, transition: { duration: 0.2 } }
        };
      default:
        return {
          hover: { scale: 1.15 }
        };
    }
  };

  return (
    <div className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-[#0052FF]" />
          <span>{language === 'en' ? 'Social Media' : 'ማህበራዊ ሚዲያ'}</span>
        </h4>
        <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
          <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
          {SOCIAL_PLATFORMS_CONFIG.length} {language === 'en' ? 'Channels' : 'ቻናሎች'}
        </span>
      </div>

      <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-normal font-medium">
        {language === 'en' 
          ? 'Follow our official channels for flash deals & drops:' 
          : 'ለልዩ ቅናሾች እና መረጃዎች ይከተሉን:'}
      </p>

      {/* Grid of Horizontal Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2.5 pt-1">
        {SOCIAL_PLATFORMS_CONFIG.map((platform) => {
          const isCopied = copiedId === platform.id;
          const animVariants = getAnimationVariants(platform.animationTrigger);
          const currentLang = language === 'am' ? 'am' : 'en';
          const destinationUrl = platform.id === 'whatsapp'
            ? generateWhatsAppCustomerWelcomeUrl(cart, currentLang)
            : platform.url;

          return (
            <motion.a
              key={platform.id}
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              variants={{
                rest: { scale: 1, y: 0 },
                hover: { scale: 1.03, y: -2 },
                tap: { scale: 0.97 }
              }}
              className={`group relative flex flex-col sm:flex-row items-center sm:justify-between p-2 sm:p-2.5 rounded-xl bg-gray-50/90 dark:bg-zinc-900/90 border border-gray-200/80 dark:border-zinc-800 hover:border-[#0052FF]/50 transition-all duration-200 cursor-pointer overflow-hidden ${platform.hoverGlow} shadow-2xs hover:shadow-xs min-w-0 text-center sm:text-left`}
            >
              {/* Left Brand Icon and Info */}
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 min-w-0 w-full sm:flex-1">
                <motion.div 
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${getIconBadgeBg(platform)} flex items-center justify-center shrink-0 shadow-2xs border border-white/20`}
                  style={platform.brandColor !== 'gradient' && platform.brandColor !== '#000000' ? { backgroundColor: platform.brandColor } : {}}
                  variants={animVariants}
                >
                  {renderSocialIcon(platform.iconKey, "w-3.5 h-3.5 sm:w-4 sm:h-4 text-white")}
                </motion.div>

                <div className="min-w-0 w-full flex-1">
                  <span className="font-extrabold text-gray-900 dark:text-white text-[11px] sm:text-xs leading-tight block group-hover:text-[#0052FF] dark:group-hover:text-blue-400 transition-colors truncate">
                    {platform.name}
                  </span>
                  <span className="hidden sm:block text-[10px] text-gray-400 dark:text-zinc-500 font-mono truncate leading-tight mt-0.5">
                    {platform.handle}
                  </span>
                </div>
              </div>

              {/* Followers count badge on right */}
              <div className="flex items-center justify-center sm:justify-end gap-1 shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
                <span className={`text-[8px] sm:text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded-md ${platform.badgeClass} shadow-2xs`}>
                  {platform.followerCount}
                </span>
                
                <button
                  type="button"
                  onClick={(e) => handleCopyHandle(e, platform)}
                  className="hidden sm:inline-flex p-1 text-gray-300 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors rounded cursor-pointer"
                  title={`Copy ${platform.handle}`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Copy Toast Overlay */}
              <AnimatePresence>
                {isCopied && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center gap-1 z-20"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{language === 'en' ? 'Copied!' : 'ተገልበጠ!'}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

export default SocialFooterSection;

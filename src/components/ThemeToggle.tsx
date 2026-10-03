import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'switch' | 'icon';
  showLabel?: boolean;
  language?: 'en' | 'am';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  size = 'md',
  variant = 'switch',
  showLabel = false,
  language = 'en',
}) => {
  const isDark = theme === 'dark';
  const isEn = language === 'en';

  if (variant === 'icon') {
    return (
      <button
        onClick={onToggle}
        type="button"
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? (isEn ? 'Switch to Light Mode' : 'ወደ ብሩህ ሁነታ ቀይር') : (isEn ? 'Switch to Dark Mode' : 'ወደ ጨለማ ሁነታ ቀይር')}
        className="relative p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -16, opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            exit={{ y: 16, opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  // Animated Pill Switch with smooth spring layout transition & rotating icon transforms
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? (isEn ? 'Switch to Light Mode' : 'ወደ ብሩህ ሁነታ ቀይር') : (isEn ? 'Switch to Dark Mode' : 'ወደ ጨለማ ሁነታ ቀይር')}
        className={`relative inline-flex items-center rounded-full p-0.5 transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 select-none shadow-xs border ${
          size === 'sm'
            ? 'w-11 h-6'
            : size === 'lg'
            ? 'w-16 h-8'
            : 'w-13 h-7'
        } ${
          isDark
            ? 'bg-zinc-900 border-zinc-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
            : 'bg-gradient-to-r from-amber-100 via-sky-100 to-blue-100 border-amber-200/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'
        }`}
      >
        {/* Background track ambient details */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          {/* Day clouds/sunburst indicator */}
          <motion.div
            animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0.7 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-500/50"
          >
            <Sun className="w-3 h-3" />
          </motion.div>

          {/* Night stars indicator */}
          <motion.div
            animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 text-indigo-300/60"
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>
        </div>

        {/* Sliding Knob with Spring Physics */}
        <motion.div
          animate={{
            x: isDark 
              ? size === 'sm' ? 20 : size === 'lg' ? 32 : 24 
              : 0
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={`relative z-10 flex items-center justify-center rounded-full shadow-md transition-shadow ${
            size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'
          } ${
            isDark
              ? 'bg-gradient-to-tr from-indigo-900 to-zinc-800 text-indigo-300 border border-indigo-500/30 shadow-indigo-950/50'
              : 'bg-white text-amber-500 border border-amber-200/80 shadow-amber-500/20'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ scale: 0, rotate: isDark ? -180 : 180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: isDark ? 180 : -180, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              {isDark ? (
                <Moon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
              ) : (
                <Sun className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </button>

      {showLabel && (
        <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
          {isDark ? (isEn ? 'Dark' : 'ጨለማ') : (isEn ? 'Light' : 'ብርሃን')}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;

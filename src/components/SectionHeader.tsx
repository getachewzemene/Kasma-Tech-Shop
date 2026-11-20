import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface SectionHeaderProps {
  /** Section title (or use titleEn / titleAm for bilingual) */
  title?: string;
  titleEn?: string;
  titleAm?: string;

  /** Optional subtitle */
  subtitle?: string;
  subtitleEn?: string;
  subtitleAm?: string;

  /** Active language */
  language?: 'en' | 'am';

  /** Optional icon displayed beside title */
  icon?: React.ReactNode;

  /** Optional badge (e.g. count or status pill) */
  badge?: React.ReactNode;

  /** Click handler for the "View all" action */
  onViewAll?: () => void;

  /** Optional custom text for "View all" link */
  viewAllText?: string;

  /** Optional href if "View all" is a direct link */
  viewAllHref?: string;

  /** Additional right-side content (e.g. countdown timer, actions) */
  rightContent?: React.ReactNode;

  /** Additional container classes */
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  titleEn,
  titleAm,
  subtitle,
  subtitleEn,
  subtitleAm,
  language = 'en',
  icon,
  badge,
  onViewAll,
  viewAllText,
  viewAllHref,
  rightContent,
  className = ''
}) => {
  const displayTitle = title || (language === 'en' ? titleEn : titleAm) || '';
  const displaySubtitle = subtitle || (language === 'en' ? subtitleEn : subtitleAm);
  const defaultViewAllLabel = language === 'en' ? 'View all' : 'ሁሉንም እይ';
  const label = viewAllText || defaultViewAllLabel;

  return (
    <div className={`flex items-center justify-between gap-4 mb-4 sm:mb-6 w-full min-w-0 ${className}`}>
      {/* Left side: Icon + Title + Subtitle */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {icon && (
          <div className="shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-950 dark:text-white tracking-tight font-sans leading-tight">
              {displayTitle}
            </h2>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-medium mt-1 line-clamp-1">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Countdown / Extra content + "View all" Link */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {rightContent}
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0052FF] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{label}</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
        {!onViewAll && viewAllHref && (
          <a
            href={viewAllHref}
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0052FF] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{label}</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
    </div>
  );
};

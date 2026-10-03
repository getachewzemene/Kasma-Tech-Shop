import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  icon?: LucideIcon;
  iconColorClass?: string;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  icon: Icon,
  iconColorClass = 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900/40',
  actionText,
  onActionClick,
  className = '',
  children
}) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2.5 rounded-2xl border shadow-xs ${iconColorClass}`}>
            <Icon className="w-5 h-5 fill-current" />
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-lg sm:text-xl text-gray-900 dark:text-white font-sans uppercase tracking-tight">
              {title}
            </h3>
            {badgeText && (
              <span className="bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                {badgeText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls or Action Button */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {children}
        {actionText && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xs border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{actionText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

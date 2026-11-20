import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface RecommendationSignalCounts {
  product_view: number;
  search: number;
  wishlist: number;
  add_to_cart: number;
  purchase: number;
  category_view: number;
}

interface SignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
  recommendationSignalCounts: RecommendationSignalCounts;
}

export const SignalsModal: React.FC<SignalsModalProps> = ({
  isOpen,
  onClose,
  language,
  recommendationSignalCounts
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                    {language === 'en' ? 'Recommendation Intelligence' : 'የምክረ ሃሳብ ስልተ-ቀመር'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                    {language === 'en' ? '6 real-time behavioral signals driving your feed' : 'የእርስዎን ምርጫ የሚወስኑ 6 የቀጥታ ታሪክ ምልክቶች'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Signals Grid */}
            <div className="py-4 space-y-3">
              <p className="text-xs text-gray-600 dark:text-zinc-300 font-semibold">
                {language === 'en'
                  ? 'Our backend recommendation engine continuously scores items using the following signals:'
                  : 'የስርዓቱ ስልተ-ቀመር ምርቶችን ለመምረጥ የሚከተሉትን ምልክቶች ይጠቀማል፡'}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Signal 1: product_view */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">product_view</span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {recommendationSignalCounts.product_view}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                    {language === 'en' ? 'Product Views' : 'የተመለከቷቸው ምርቶች'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {language === 'en' ? 'Recent clicks & detail views' : 'የቅርብ ጊዜ የእይታ ታሪክ'}
                  </p>
                </div>

                {/* Signal 2: search */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">search</span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {recommendationSignalCounts.search}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                    {language === 'en' ? 'Search Queries' : 'የፍለጋ ቃላት'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {language === 'en' ? 'Keywords & search terms' : 'የፈለጓቸው ቃላት'}
                  </p>
                </div>

                {/* Signal 3: wishlist */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">wishlist</span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {recommendationSignalCounts.wishlist}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                    {language === 'en' ? 'Wishlist Items' : 'የተወደዱ እቃዎች'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {language === 'en' ? 'Saved favorite products' : 'በምኞት ዝርዝር ያሉ'}
                  </p>
                </div>

                {/* Signal 4: add_to_cart */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">add_to_cart</span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {recommendationSignalCounts.add_to_cart}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                    {language === 'en' ? 'Cart Items' : 'በጋሪ ያሉ እቃዎች'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {language === 'en' ? 'Active cart additions' : 'ወደ ጋሪ የታከሉ'}
                  </p>
                </div>

                {/* Signal 5: purchase */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">purchase</span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {recommendationSignalCounts.purchase}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                    {language === 'en' ? 'Past Purchases' : 'የቀደሙ ትዕዛዞች'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {language === 'en' ? 'Completed orders history' : 'የቀድሞ ግዢዎች'}
                  </p>
                </div>

                {/* Signal 6: category_view */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">category_view</span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {recommendationSignalCounts.category_view}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                    {language === 'en' ? 'Category Views' : 'የምድብ አሰሳ'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {language === 'en' ? 'Explored category tabs' : 'የተጎበኙ ምድቦች'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer mt-2"
            >
              {language === 'en' ? 'Got It' : 'ተረድቻለሁ'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

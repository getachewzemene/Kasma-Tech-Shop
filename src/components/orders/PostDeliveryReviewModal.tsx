import React, { useState } from 'react';
import { Order, CartItem, Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  X, 
  Sparkles, 
  MessageSquare, 
  AlertCircle,
  ThumbsUp,
  Package
} from 'lucide-react';

interface PostDeliveryReviewModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
}

export const PostDeliveryReviewModal: React.FC<PostDeliveryReviewModalProps> = ({
  order,
  isOpen,
  onClose,
  language
}) => {
  const { addProductReview, showToast } = useShop();

  const [selectedItemSku, setSelectedItemSku] = useState<string>(
    order.items[0]?.sku || ''
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Selected item to review
  const activeItem: CartItem | undefined = order.items.find(i => i.sku === selectedItemSku) || order.items[0];

  // Verified check: only allow for DELIVERED orders
  const isDelivered = order.status === 'DELIVERED';

  // Quick tag chips
  const quickTags = [
    { id: 'fast_delivery', en: '🚀 Fast Addis Delivery', am: '🚀 ፈጣን ማድረሻ' },
    { id: 'genuine_sealed', en: '🛡️ 100% Genuine Sealed', am: '🛡️ ኦርጅናል ማሸጊያ' },
    { id: 'serial_verified', en: '🏷️ Serial Verified', am: '🏷️ በመለያ ቁጥር የተረጋገጠ' },
    { id: 'good_packaging', en: '📦 Mint Packaging', am: '📦 ጥሩ ማሸጊያ' },
    { id: 'polite_courier', en: '🛵 Professional Courier', am: '🛵 ጥሩ አሽከርካሪ' },
    { id: 'tax_receipt', en: '📄 Official Tax Receipt', am: '📄 የግብር ደረሰኝ አለው' },
  ];

  const handleToggleTag = (tagText: string) => {
    setSelectedTags(prev => 
      prev.includes(tagText) ? prev.filter(t => t !== tagText) : [...prev, tagText]
    );
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5: return language === 'en' ? 'Exceptional (5/5)' : 'ምርጥ እቃ (5/5)';
      case 4: return language === 'en' ? 'Very Good (4/5)' : 'በጣም ጥሩ (4/5)';
      case 3: return language === 'en' ? 'Satisfactory (3/5)' : 'ጥሩ (3/5)';
      case 2: return language === 'en' ? 'Fair (2/5)' : 'መጠነኛ (2/5)';
      case 1: return language === 'en' ? 'Disappointed (1/5)' : 'ደካማ (1/5)';
      default: return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDelivered) {
      showToast(
        language === 'en'
          ? 'Reviews are only permitted for delivered packages.'
          : 'ግምገማ መስጠት የሚቻለው የደረሱ እቃዎች ላይ ብቻ ነው።',
        'warning'
      );
      return;
    }

    if (!activeItem) return;

    if (!comment.trim()) {
      showToast(
        language === 'en' ? 'Please write a brief comment.' : 'እባክዎ አስተያየትዎን ይጻፉ።',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const fullComment = selectedTags.length > 0 
        ? `${comment.trim()}\n\n[Highlights: ${selectedTags.join(', ')}]`
        : comment.trim();

      const success = await addProductReview({
        orderId: order.id,
        productId: activeItem.product.id,
        rating,
        comment: fullComment,
        reviewerName: order.customerName,
        reviewerPhone: order.customerPhone,
        deliveryRating,
        tags: selectedTags
      });

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>{language === 'en' ? 'Verified Customer Review' : 'የተረጋገጠ ገዢ ግምገማ'}</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                  DELIVERED
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Order #{order.id} • {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {!isDelivered ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{language === 'en' ? 'Package Not Yet Delivered' : 'እቃው ገና አልደረሰም'}</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {language === 'en'
                  ? `To ensure verified marketplace credibility, customer reviews can only be submitted once the package status is marked as DELIVERED by your courier. Current status: ${order.status}.`
                  : `የገበያውን ታማኝነት ለመጠበቅ ግምገማ መስጠት የሚቻለው እቃው በአሽከርካሪው መድረሱ ሲረጋገጥ ብቻ ነው። የአሁኑ ሁኔታ፡ ${order.status}።`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* If Multiple items in order: selector chips */}
              {order.items.length > 1 && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    {language === 'en' ? 'Select Product to Review:' : 'የሚገመግሙትን እቃ ይምረጡ፡'}
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {order.items.map((item) => (
                      <button
                        key={item.sku}
                        type="button"
                        onClick={() => setSelectedItemSku(item.sku)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                          selectedItemSku === item.sku
                            ? 'border-[#0052FF] bg-blue-50 dark:bg-blue-950/60 ring-2 ring-[#0052FF]/20 text-gray-900 dark:text-white font-bold'
                            : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300'
                        }`}
                      >
                        <img src={item.product.image} alt="" className="w-7 h-7 rounded-lg object-cover" />
                        <span className="truncate max-w-[140px] text-[11px]">{item.product.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Info Preview */}
              {activeItem && (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-850/60 border border-gray-150 dark:border-zinc-800 flex items-center gap-3">
                  <img
                    src={activeItem.product.image}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 dark:text-zinc-100 truncate text-xs">
                      {language === 'en' ? activeItem.product.nameEn : activeItem.product.nameAm}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {activeItem.variantName || 'Standard'} • Seller: {activeItem.product.merchantName || 'Verified Merchant'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Addis Handover</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Star Rating */}
              <div className="space-y-2 text-center py-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {language === 'en' ? 'Product Quality Rating *' : 'የእቃው ጥራት ደረጃ ይስጡ *'}
                </label>

                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                              : 'text-gray-300 dark:text-zinc-700'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {getRatingLabel(hoverRating || rating)}
                </p>
              </div>

              {/* Courier Delivery Satisfaction */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#0052FF]" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 dark:text-zinc-100">
                      {language === 'en' ? 'Addis Courier Speed' : 'የማድረሻ ፍጥነት'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {order.courierName ? `Driver: ${order.courierName}` : 'Express Courier Handover'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDeliveryRating(s)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          deliveryRating >= s
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Tag Pills */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {language === 'en' ? 'Feedback Highlights (Click to add):' : 'ዋና ዋና ነጥቦች (ጠቅ ያድርጉ)፡'}
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {quickTags.map((t) => {
                    const tagLabel = language === 'en' ? t.en : t.am;
                    const isSelected = selectedTags.includes(tagLabel);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleToggleTag(tagLabel)}
                        className={`px-2.5 py-1 rounded-xl text-[10.5px] font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0052FF] bg-[#0052FF] text-white shadow-xs font-bold'
                            : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
                        }`}
                      >
                        {tagLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Comment Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {language === 'en' ? 'Detailed Experience *' : 'ዝርዝር አስተያየት *'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    language === 'en'
                      ? 'Share your experience regarding device performance, factory seals, packaging, and courier arrival speed...'
                      : 'ስለ እቃው ጥራት፣ ማሸጊያ እና ስለ አሽከርካሪው አገልግሎት ያለዎትን ዝርዝር አስተያየት ያጋሩ...'
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-gray-900 dark:text-zinc-100 outline-none focus:border-[#0052FF] resize-none"
                  required
                />
              </div>

              {/* Submit Review Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>
                  {isSubmitting
                    ? (language === 'en' ? 'Submitting Verified Review...' : 'ግምገማው እየተላከ ነው...')
                    : (language === 'en' ? `Publish Verified Review (${rating} Stars)` : `ባለ ${rating}-ኮከብ ግምገማ ይለጥፉ`)}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

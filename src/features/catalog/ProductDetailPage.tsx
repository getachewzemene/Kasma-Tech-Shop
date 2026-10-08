import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  Share2, 
  ShoppingBag, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink,
  MessageCircle,
  Copy,
  Clock,
  Box,
  Building2,
  Heart
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    products, 
    language, 
    addToCart, 
    favorites, 
    toggleFavorite,
    showToast 
  } = useShop();

  const product = useMemo(() => {
    return products.find(p => p.id === id);
  }, [products, id]);

  const [selectedVariantSku, setSelectedVariantSku] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [newReviewAuthor, setNewReviewAuthor] = useState<string>('');

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto text-gray-400">
          <Box className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-zinc-100">
          {language === 'en' ? 'Product Not Found' : 'እቃው አልተገኘም'}
        </h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          {language === 'en'
            ? 'The electronic product you are looking for might have been sold out or unlisted.'
            : 'የፈለጉት የኤሌክትሮኒክስ እቃ ተሽጦ አልቆ ሊሆን ወይም ከመደብሩ ተሰርዞ ሊሆን ይችላል።'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052FF] text-white text-xs font-bold shadow-md hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Tech Catalog' : 'ወደ ካታሎግ ተመለስ'}</span>
        </Link>
      </div>
    );
  }

  const activeVariant = product.variants.find(v => v.sku === selectedVariantSku) || product.variants[0];
  const unitPrice = product.price + (activeVariant?.priceOffset || 0);
  const totalPrice = unitPrice * selectedQuantity;
  const isFavorite = favorites.includes(product.id);
  const onHand = activeVariant ? activeVariant.onHand : 0;
  const isOutOfStock = onHand <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, activeVariant?.sku, selectedQuantity);
  };

  const handleInstantBuy = () => {
    if (isOutOfStock) return;
    addToCart(product, activeVariant?.sku, selectedQuantity);
    navigate('/checkout');
  };

  const handleShareWhatsApp = () => {
    const shareText = `Check out "${product.nameEn}" on Kasma Tech Shop (${unitPrice.toLocaleString()} ETB): ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareTelegram = () => {
    const shareText = `Check out "${product.nameEn}" on Kasma Shop (${unitPrice.toLocaleString()} ETB)`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast(language === 'en' ? 'Product link copied to clipboard!' : 'የእቃው ሊንክ ተገልብጧል!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
        <Link to="/" className="hover:text-[#0052FF] font-medium transition-colors">
          {language === 'en' ? 'Home' : 'መነሻ'}
        </Link>
        <span>/</span>
        <span className="capitalize font-medium">{product.category}</span>
        <span>/</span>
        <span className="text-gray-900 dark:text-zinc-100 font-bold truncate max-w-xs">
          {language === 'en' ? product.nameEn : product.nameAm}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl bg-gray-100 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 overflow-hidden shadow-sm group">
            <img
              src={product.image}
              alt={product.nameEn}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            {/* Condition Badge */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-xl tracking-wider">
              {product.conditionTextEn || 'Factory Sealed'}
            </div>
            {/* Wishlist Button */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/80 dark:bg-zinc-900/80 text-gray-700 dark:text-zinc-300 hover:scale-110'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Value Badges Under Image */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-150 dark:border-zinc-800/80 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-gray-900 dark:text-zinc-100">
                  {product.warrantyTextEn || 'Official Warranty'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400">
                  {language === 'en' ? 'Serial-verified genuine unit' : 'በመለያ ቁጥር የተረጋገጠ'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-150 dark:border-zinc-800/80 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#0052FF] shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? '2-4h Addis Courier' : 'ከ2-4 ሰዓት ማድረሻ'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400">
                  {language === 'en' ? 'Bole, Kirkos, Yeka, Arada' : 'ቦሌ፣ ኪርቆስ፣ የካ፣ አራዳ'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400">
                {product.brand}
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-gray-700 dark:text-zinc-300">{product.rating || '4.9'}</span>
                <span>({product.reviews?.length || 18} reviews)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">
              {language === 'en' ? product.nameEn : product.nameAm}
            </h1>

            {language === 'en' && product.nameAm && (
              <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mt-1">
                {product.nameAm}
              </p>
            )}
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-150 dark:border-zinc-800 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-100">
                {unitPrice.toLocaleString()} ETB
              </span>
              <span className="text-xs text-gray-500 line-through">
                {Math.round(unitPrice * 1.12).toLocaleString()} ETB
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                Save 12%
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              {language === 'en' ? 'VAT included. Official invoice generated with QR receipt.' : 'ቫት ያካተተ። ኦፊሴላዊ የክፍያ ደረሰኝ ይሰጣል።'}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            {language === 'en' ? product.descriptionEn : product.descriptionAm}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                {language === 'en' ? 'Select Configuration / Variant:' : 'አማራጭ ይምረጡ፡'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map(v => {
                  const isSelected = (activeVariant?.sku === v.sku);
                  return (
                    <button
                      key={v.sku}
                      type="button"
                      onClick={() => setSelectedVariantSku(v.sku)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/30 text-gray-900 dark:text-zinc-100 font-bold ring-2 ring-[#0052FF]/30'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <p className="text-xs truncate font-bold">{v.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
                        {v.priceOffset !== 0 ? `+${v.priceOffset.toLocaleString()} ETB` : 'Base price'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-1">
                        {v.onHand} in stock
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {isOutOfStock ? (
              <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{language === 'en' ? 'Out of Stock' : 'አልቋል'}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>
                  {language === 'en' 
                    ? `In Stock (${onHand} units ready for immediate courier dispatch)`
                    : `በክምችት አለ (${onHand} እቃዎች ወዲያውኑ ለመላክ ዝግጁ)`}
                </span>
              </span>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  disabled={selectedQuantity <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-gray-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-xs text-gray-900 dark:text-zinc-100">
                  {selectedQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQuantity(Math.min(onHand, selectedQuantity + 1))}
                  disabled={selectedQuantity >= onHand || isOutOfStock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-gray-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'en' ? 'Add to Cart' : 'ወደ ጋሪ ጨምር'}</span>
              </button>

              {/* Instant Buy Now */}
              <button
                type="button"
                onClick={handleInstantBuy}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Zap className="w-4 h-4" />
                <span>{language === 'en' ? 'Instant Buy' : 'ወዲያውኑ ግዛ'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-4 border-t border-gray-150 dark:border-zinc-800/80 flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold mr-1">
              {language === 'en' ? 'Share Product:' : 'አጋራ፡'}
            </span>
            <button
              onClick={handleShareTelegram}
              className="px-3 py-1.5 rounded-lg bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Copy Link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Merchant Store Info Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  {product.merchantName || 'Kasma Verified Merchant'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Verified Ethiopian Seller • Kasma Escrow Protected
                </p>
              </div>
            </div>
            <Link
              to="/merchant"
              className="text-xs font-bold text-[#0052FF] hover:underline"
            >
              {language === 'en' ? 'View Store' : 'መደብሩን እይ'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

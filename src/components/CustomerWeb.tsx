import React, { useState, useEffect } from 'react';
import { Product, Variant, CartItem, Order, PriceAlert, PromoCode, DeliveryAddress, SavedPaymentMethod, KasmaPointsReward, KasmaPointsLog, FlashDealNomination, QAItem, Review } from '../types';
import { ShoppingCart, Heart, Search, Eye, Sparkles, Check, ChevronRight, ChevronLeft, MapPin, Phone, ShieldCheck, CreditCard, RefreshCw, SlidersHorizontal, ArrowRight, Truck, Package, Clock, Star, MessageSquare, ThumbsUp, Bell, TrendingDown, GitCompare, Gamepad2, Laptop, Camera, Tv, Watch, Smartphone, Headphones, Cpu, ChevronDown, ChevronUp, Menu, Flame, Percent, User, Lock, Award, Plus, Zap, Scale, Box, Wifi, WifiOff, Database, Battery, QrCode, Copy, ExternalLink, Download, CheckCircle2, Home, Share2, Link2, Send, MessageCircle, RotateCcw, X, Layers, Filter, Tag, Printer, Activity, Info, BarChart2, Trash2, LogIn, UserPlus, Globe, Building2, Upload, HelpCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CheckoutAuthModal } from './checkout/CheckoutAuthModal';
import { CatalogCacheMeta } from '../utils/offlineCatalogCache';
import { generateShareableCartUrl } from '../utils/cartSharing';
import { generateWhatsAppCustomerWelcomeUrl } from '../utils/whatsappNotifications';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderCourierMiniMap } from './OrderCourierMiniMap';
import { OrderTrackingVisualizer } from './OrderTrackingVisualizer';
import { LazyImage, ShimmerImage } from './LazyImage';
import { Shimmer, ShimmerCircle, ProductCardSkeleton } from './Skeletons';
import MyOrdersView from './MyOrdersView';
import { FlashDealsView } from './FlashDealsView';
import { ProductCard } from './ProductCard';
import { SectionHeader } from './SectionHeader';
import DeliveryTimeEstimator from './DeliveryTimeEstimator';
import { ShareProductModal } from './ShareProductModal';
import { GridContainer, CarouselContainer } from './GridContainer';
import { AutoCarousel } from './AutoCarousel';
import { HeroSalesBanner } from './HeroSalesBanner';
import { CartModal } from './customer/CartModal';
import { WishlistModal } from './customer/WishlistModal';
import { PriceAlertsModal } from './customer/PriceAlertsModal';
import { ShareCartModal } from './customer/ShareCartModal';
import { SignalsModal } from './customer/SignalsModal';
import { ProductCompareModal } from './customer/ProductCompareModal';
import { OrderStatusModal } from './customer/OrderStatusModal';
import { QuickBuyModal } from './customer/QuickBuyModal';
import { CategoryNavSection } from './customer/CategoryNavSection';
import { FlashDealsSection } from './customer/FlashDealsSection';
import { PromoBannersSection } from './customer/PromoBannersSection';
import { CatalogSection } from './customer/CatalogSection';
import { ProductDetailModal } from './customer/ProductDetailModal';
import { CheckoutGatewayModal } from './customer/CheckoutGatewayModal';
import { getProductSpecs, getProductFeatures, SpecDetail } from '../utils/productSpecs';
import { sendTelegramOrderConfirmation, sendTelegramShippingUpdate, sendStoreOwnerTelegramNotification } from '../utils/telegramBot';
import { showTelegramMainButton, hideTelegramMainButton, setTelegramMainButtonProgress, isTelegramMiniApp } from '../utils/telegramWebApp';
import { SUB_CITIES, SubCityOption } from '../constants/locations';
export { SUB_CITIES, type SubCityOption };
import { PriceRangeSlider } from './catalog/PriceRangeSlider';

const ADDIS_DELIVERY_AREAS = [
  { id: 'bole', nameEn: 'Bole, Addis Ababa', nameAm: 'ቦሌ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'megenagna', nameEn: 'Megenagna, Addis Ababa', nameAm: 'መገናኛ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'piassa', nameEn: 'Piassa, Addis Ababa', nameAm: 'ፒያሳ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'sarbet', nameEn: 'Sarbet / Mexico, Addis Ababa', nameAm: 'ሳርቤት / ሜክሲኮ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'kazanchis', nameEn: 'Kazanchis, Addis Ababa', nameAm: 'ካዛንቺስ፣ አዲስ አበባ', timeEn: 'Today within 2-4 Hours', timeAm: 'ዛሬ በ2-4 ሰዓታት ውስጥ', isToday: true },
  { id: 'cmc', nameEn: 'CMC / Ayat, Addis Ababa', nameAm: 'ሲኤምሲ / አያት፣ አዲስ አበባ', timeEn: 'Today within 3-5 Hours', timeAm: 'ዛሬ በ3-5 ሰዓታት ውስጥ', isToday: true },
  { id: 'adama', nameEn: 'Adama (Nazret)', nameAm: 'አዳማ (ናዝሬት)', timeEn: 'Tomorrow Morning', timeAm: 'ነገ ጠዋት', isToday: false },
  { id: 'hawassa', nameEn: 'Hawassa', nameAm: 'ሀዋሳ', timeEn: 'Tomorrow Afternoon', timeAm: 'ነገ ከሰዓት', isToday: false },
];

interface CustomerWebProps {
  products: Product[];
  categories: { id: string; nameEn: string; nameAm: string; }[];
  language: 'en' | 'am';
  onAddOrder: (order: Order) => void;
  onUpdateProductStock: (productId: string, sku: string, qtyChange: number, reason: string) => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (isOpen: boolean) => void;
  theme: 'light' | 'dark';
  orders: Order[];
  offlineOrders: Order[];
  isOfflineSimulated: boolean;
  isSyncing?: boolean;
  onForceSync?: () => Promise<void> | void;
  onToggleOfflineSimulated?: () => void;
  priceAlerts: PriceAlert[];
  setPriceAlerts: React.Dispatch<React.SetStateAction<PriceAlert[]>>;
  isPriceAlertsOpen: boolean;
  setIsPriceAlertsOpen: (isOpen: boolean) => void;
  promoCodes: PromoCode[];
  selectedProduct?: Product | null;
  setSelectedProduct?: React.Dispatch<React.SetStateAction<Product | null>> | ((product: Product | null) => void);
  onOpenQrScanner?: () => void;
  onOpenProductTour?: () => void;
  offlineCatalogMeta?: CatalogCacheMeta | null;
  isOnline?: boolean;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  flashDeals?: FlashDealNomination[];
}

export default function CustomerWeb({
  products,
  categories,
  language,
  onAddOrder,
  onUpdateProductStock,
  cart,
  setCart,
  favorites,
  setFavorites,
  searchQuery,
  setSearchQuery,
  isCartOpen,
  setIsCartOpen,
  isWishlistOpen,
  setIsWishlistOpen,
  theme,
  orders,
  offlineOrders = [],
  isOfflineSimulated = false,
  isSyncing = false,
  onForceSync,
  onToggleOfflineSimulated,
  priceAlerts = [],
  setPriceAlerts,
  isPriceAlertsOpen,
  setIsPriceAlertsOpen,
  promoCodes = [],
  selectedProduct: propSelectedProduct,
  setSelectedProduct: propSetSelectedProduct,
  onOpenQrScanner,
  onOpenProductTour,
  offlineCatalogMeta,
  isOnline = navigator.onLine,
  selectedCategory: propSelectedCategory,
  setSelectedCategory: propSetSelectedCategory,
  flashDeals = []
}: CustomerWebProps) {
  const {
    isCustomerLoggedIn,
    customerName: authCustomerName,
    customerPhone: authCustomerPhone,
    customerEmail: authCustomerEmail,
    addPoints
  } = useShop();

  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string>('all');
  const selectedCategory = propSelectedCategory !== undefined ? propSelectedCategory : internalSelectedCategory;
  const setSelectedCategory = (cat: string) => {
    if (propSetSelectedCategory) {
      propSetSelectedCategory(cat);
    } else {
      setInternalSelectedCategory(cat);
    }
  };
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState<boolean>(false);

  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'newest'>('default');
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsAppButton(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Backend Behavioral Tracking Signals (product_view, search, wishlist, add_to_cart, purchase, category_view)
  const [viewedProductsHistory, setViewedProductsHistory] = useState<{ id: string; nameEn: string; nameAm: string; category: string; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem('kasma_viewed_products');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [recentSearchesHistory, setRecentSearchesHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kasma_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [categoryViewHistory, setCategoryViewHistory] = useState<{ categoryId: string; timestamp: number }[]>([]);
  const [isSignalsModalOpen, setIsSignalsModalOpen] = useState(false);

  // Signal Recorders
  const recordProductViewSignal = React.useCallback((p: Product) => {
    setViewedProductsHistory(prev => {
      const filtered = prev.filter(item => item.id !== p.id);
      const updated = [
        { id: p.id, nameEn: p.nameEn, nameAm: p.nameAm, category: p.category, timestamp: Date.now() },
        ...filtered
      ].slice(0, 15);
      try { localStorage.setItem('kasma_viewed_products', JSON.stringify(updated)); } catch (e) { }
      return updated;
    });
  }, []);

  const recordSearchSignal = React.useCallback((query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setRecentSearchesHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try { localStorage.setItem('kasma_recent_searches', JSON.stringify(updated)); } catch (e) { }
      return updated;
    });
  }, []);

  const recordCategoryViewSignal = React.useCallback((catId: string) => {
    if (!catId || catId === 'all') return;
    setCategoryViewHistory(prev => {
      const filtered = prev.filter(c => c.categoryId !== catId);
      return [{ categoryId: catId, timestamp: Date.now() }, ...filtered].slice(0, 10);
    });
  }, []);

  // Track category view events
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      recordCategoryViewSignal(selectedCategory);
    }
  }, [selectedCategory, recordCategoryViewSignal]);

  // Track search query events with debounce
  useEffect(() => {
    if (!searchQuery) return;
    const timer = setTimeout(() => {
      recordSearchSignal(searchQuery);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, recordSearchSignal]);

  const approvedProducts = React.useMemo(() => products.filter(p => p.status === 'APPROVED'), [products]);
  const totalCartItems = React.useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Advanced Product Filter States
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'IN_STOCK' | 'ON_SALE' | 'HIGHLY_RATED'>('ALL');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number>(0);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState<boolean>(false);
  const [filterSectionFocus, setFilterSectionFocus] = useState<'all' | 'brand' | 'price' | 'rating' | 'availability' | 'features'>('all');

  // Infinite Scroll & Progressive Catalog Loading
  const [visibleProductCount, setVisibleProductCount] = useState<number>(12);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const scrollSentinelRef = React.useRef<HTMLDivElement | null>(null);

  // Trigger smooth shimmer transition when category or search changes
  useEffect(() => {
    setIsGridLoading(true);
    setVisibleProductCount(12);
    const timer = setTimeout(() => setIsGridLoading(false), 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy, availabilityFilter, minPriceInput, maxPriceInput, selectedBrands, selectedRatingFilter]);

  // Dynamic brand list & price bounds derived from catalog
  const availableBrands = React.useMemo(() => {
    const brandsSet = new Set<string>();
    approvedProducts.forEach(p => {
      if (p.brand && p.brand.trim()) {
        brandsSet.add(p.brand.trim());
      }
    });
    return Array.from(brandsSet).sort();
  }, [approvedProducts]);

  const maxProductPriceInCatalog = React.useMemo(() => {
    if (approvedProducts.length === 0) return 100000;
    return Math.max(...approvedProducts.map(p => p.price));
  }, [approvedProducts]);

  const minProductPriceInCatalog = React.useMemo(() => {
    if (approvedProducts.length === 0) return 0;
    return Math.min(...approvedProducts.map(p => p.price));
  }, [approvedProducts]);

  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (minPriceInput.trim() !== '' || maxPriceInput.trim() !== '') count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (availabilityFilter !== 'ALL') count++;
    if (selectedRatingFilter > 0) count++;
    return count;
  }, [searchQuery, minPriceInput, maxPriceInput, selectedBrands, availabilityFilter, selectedRatingFilter]);

  const handleClearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('default');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSelectedBrands([]);
    setAvailabilityFilter('ALL');
    setSelectedRatingFilter(0);
  };

  // Handle optimistic skeleton loading states when searching, filtering, or sorting
  useEffect(() => {
    setIsGridLoading(true);
    const timer = setTimeout(() => {
      setIsGridLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy, minPriceInput, maxPriceInput, selectedBrands, availabilityFilter]);

  const [internalSelectedProduct, setInternalSelectedProduct] = useState<Product | null>(null);
  const selectedProduct = propSelectedProduct !== undefined ? propSelectedProduct : internalSelectedProduct;
  const setSelectedProduct = (p: Product | null) => {
    if (propSetSelectedProduct) {
      propSetSelectedProduct(p);
    } else {
      setInternalSelectedProduct(p);
    }
  };
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Quick buy / Quick View states
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [quickBuyVariant, setQuickBuyVariant] = useState<Variant | null>(null);
  const [quickBuyQuantity, setQuickBuyQuantity] = useState<number>(1);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState<number>(0);

  // Quick view high-res gallery state
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  // Cart item animation tracking states
  const [removingSkus, setRemovingSkus] = useState<string[]>([]);
  const [recentlyAddedSkus, setRecentlyAddedSkus] = useState<string[]>([]);
  const [recentlyUpdatedSku, setRecentlyUpdatedSku] = useState<string | null>(null);

  // Daily deals live countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 15, seconds: 48 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 5, minutes: 15, seconds: 48 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  // Reset gallery active index on product change
  useEffect(() => {
    if (selectedProduct) {
      setActiveGalleryIndex(0);
    }
  }, [selectedProduct]);

  // Gallery image generation helper
  const getProductGallery = (p: Product) => {
    const images = [p.image];
    if (p.category === 'gaming' || p.category === 'computers') {
      images.push(
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80'
      );
    } else if (p.category === 'smartwatches' || p.category === 'mobiles') {
      images.push(
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'
      );
    } else if (p.category === 'headphones') {
      images.push(
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80'
      );
    } else if (p.category === 'cameras' || p.category === 'accessories') {
      images.push(
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1502920917128-1fc500664abb?auto=format&fit=crop&w=600&q=80'
      );
    } else {
      images.push(
        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'
      );
    }
    return images;
  };

  // Sorting options: 'default' | 'priceAsc' | 'priceDesc'

  // Slidable carousel active slide index state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselTab, setCarouselTab] = useState<'featured' | 'new_arrivals' | 'top_sold'>('featured');

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Share feature states & handlers
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [isShareCartModalOpen, setIsShareCartModalOpen] = useState(false);
  const [copiedSharedLink, setCopiedSharedLink] = useState(false);

  const handleCopyCartLink = () => {
    if (cart.length === 0) {
      showToast(language === 'en' ? 'Your cart is empty!' : 'ጋሪዎ ባዶ ነው!', 'warning');
      return;
    }
    const shareUrl = generateShareableCartUrl(cart);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedSharedLink(true);
      showToast(
        language === 'en'
          ? 'Shopping cart link copied to clipboard! Anyone opening this link can see your items.'
          : 'የጋሪው ሊንክ ተቀድቷል! ሊንኩን የከፈተ ማንኛውም ሰው እቃዎችን ማየት ይችላል።',
        'success'
      );
      setTimeout(() => setCopiedSharedLink(false), 3000);
    }).catch(() => {
      showToast(
        language === 'en' ? 'Could not copy link automatically.' : 'ሊንኩን መቅዳት አልተቻለም።',
        'warning'
      );
    });
  };

  const handleNativeShareCart = async () => {
    if (cart.length === 0) return;
    const shareUrl = generateShareableCartUrl(cart);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Kasma Shopping Cart',
          text: `Check out my Kasma shopping cart (${cart.length} items)!`,
          url: shareUrl
        });
      } catch {
        handleCopyCartLink();
      }
    } else {
      handleCopyCartLink();
    }
  };

  // Checkout Form State (Landmark-based Ethiopian addressing & Integrated Payment APIs)
  const [customerName, setCustomerName] = useState(authCustomerName || '');
  const [customerPhone, setCustomerPhone] = useState(authCustomerPhone || '+2519');
  const [customerEmail, setCustomerEmail] = useState(authCustomerEmail || '');
  const [customerLandmark, setCustomerLandmark] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'COD' | 'BANK'>('TELEBIRR');
  const [selectedSubCity, setSelectedSubCity] = useState<string>('bole');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string>('');
  const [bankReference, setBankReference] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<'CBE' | 'BOA' | 'AWASH'>('CBE');
  const [merchantTelegramConfirmed, setMerchantTelegramConfirmed] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Auto-populate recipient details & default landmark on successful authentication
  useEffect(() => {
    if (isCustomerLoggedIn) {
      if (authCustomerName && !customerName) setCustomerName(authCustomerName);
      if (authCustomerPhone && (customerPhone === '+2519' || !customerPhone)) setCustomerPhone(authCustomerPhone);
      if (authCustomerEmail && !customerEmail) setCustomerEmail(authCustomerEmail);
      if (!customerLandmark) setCustomerLandmark('Behind Edna Mall, Bole Medhanialem');
    }
  }, [isCustomerLoggedIn, authCustomerName, authCustomerPhone, authCustomerEmail]);

  const [activePaymentSession, setActivePaymentSession] = useState<{
    txRef: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    provider?: string;
    ussdCode?: string;
    directPaymentUrl?: string;
    checkoutUrl?: string;
    qrPayload?: string;
    promptText?: string;
    verificationPin?: string;
    status: string;
  } | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState<boolean>(false);
  const [paymentApiError, setPaymentApiError] = useState<string | null>(null);

  // Payment Gateway QR & Bank Transfer Receipt State
  const [gatewayPaymentTab, setGatewayPaymentTab] = useState<'QR' | 'DIRECT' | 'BANK_RECEIPT'>('QR');
  const [copiedQrLink, setCopiedQrLink] = useState(false);
  const [qrReferenceTx, setQrReferenceTx] = useState(() => `KS-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(language === 'en' ? 'Please upload an image receipt (JPEG/PNG/WebP).' : 'እባክዎን የፎቶ ደረሰኝ ያስገቡ።', 'warning');
      return;
    }
    setPaymentScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setPaymentScreenshot(result);
      showToast(language === 'en' ? 'Payment screenshot uploaded successfully!' : 'የክፍያ ደረሰኝ ስክሪንሾት በተሳካ ሁኔታ ተጭኗል!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleUseDemoScreenshot = () => {
    const demoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230F172A"/><rect x="20" y="20" width="360" height="260" rx="16" fill="%231E293B" stroke="%2338BDF8" stroke-width="2"/><text x="40" y="60" fill="%2338BDF8" font-family="sans-serif" font-weight="bold" font-size="16">CBE BIRR / TELEBIRR TRANSFER</text><text x="40" y="95" fill="%2394A3B8" font-family="sans-serif" font-size="12">Payer: Abebe Kebede (0911223344)</text><text x="40" y="125" fill="%2394A3B8" font-family="sans-serif" font-size="12">Recipient: Kasma Tech Shop Enterprise</text><text x="40" y="155" fill="%2334D399" font-family="sans-serif" font-weight="bold" font-size="15">Amount: ${cartTotal.toLocaleString()} ETB</text><text x="40" y="185" fill="%23E2E8F0" font-family="monospace" font-size="13">Ref: TX-CBE-${Date.now().toString().slice(-6)}</text><text x="40" y="215" fill="%23A855F7" font-family="sans-serif" font-size="11">Status: SUCCESSFUL / VERIFIED</text><circle cx="340" cy="60" r="16" fill="%2310B981"/><path d="M333 60l5 5 10-10" stroke="white" stroke-width="3" fill="none"/></svg>`;
    setPaymentScreenshot(demoSvg);
    setPaymentScreenshotName('cbe_receipt_abebe.png');
    if (!bankReference) {
      setBankReference(`FT${Date.now().toString().slice(-8)}`);
    }
    showToast(language === 'en' ? 'Demo payment screenshot attached!' : 'የናሙና ክፍያ ደረሰኝ ተያይዟል!', 'info');
  };

  // Promo code states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMessage, setPromoSuccessMessage] = useState<string | null>(null);

  const handleApplyPromo = (overrideCode?: string) => {
    setPromoError(null);
    setPromoSuccessMessage(null);

    const code = (overrideCode || promoCodeInput).trim().toUpperCase();
    if (!code) {
      setPromoError(language === 'en' ? 'Please enter a promo code.' : 'እባክዎን የቅናሽ ኮድ ያስገቡ።');
      return;
    }

    const matched = promoCodes.find(p => p.code === code);
    if (!matched) {
      setPromoError(language === 'en' ? 'Invalid promo code.' : 'የማይሰራ የቅናሽ ኮድ።');
      return;
    }

    if (matched.minSubtotal && cartSubtotal < matched.minSubtotal) {
      setPromoError(
        language === 'en'
          ? `This code requires a minimum subtotal of ${matched.minSubtotal.toLocaleString()} ETB.`
          : `ይህ የቅናሽ ኮድ ቢያንስ ${matched.minSubtotal.toLocaleString()} ብር ግዢ ይፈልጋል።`
      );
      return;
    }

    setAppliedPromo(matched);
    setPromoSuccessMessage(
      language === 'en'
        ? `Promo code "${matched.code}" applied successfully! (${matched.descriptionEn})`
        : `የቅናሽ ኮድ "${matched.code}" በተሳካ ሁኔታ ሰርቷል! (${matched.descriptionAm})`
    );
    showToast(
      language === 'en'
        ? `Promo "${matched.code}" applied!`
        : `የቅናሽ ኮድ "${matched.code}" ሰርቷል!`,
      'success'
    );
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
    setPromoSuccessMessage(null);
    showToast(
      language === 'en' ? 'Promo code removed.' : 'የቅናሽ ኮድ ተነስቷል።',
      'info'
    );
  };

  // Payment Simulation Screen State
  const [paymentStep, setPaymentStep] = useState<'FORM' | 'GATEWAY' | 'OTP' | 'SUCCESS'>('FORM');
  const [telebirrOtp, setTelebirrOtp] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Order Tracking & Flash Sales State
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isFlashDealsOpen, setIsFlashDealsOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearchedOrder, setHasSearchedOrder] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>('');

  const handleUpdateTrackedOrderStatus = (newStatus: Order['status']) => {
    if (trackedOrder) {
      setTrackedOrder({ ...trackedOrder, status: newStatus });
      showToast(
        language === 'en'
          ? `Simulated order status: ${newStatus}`
          : `የትዕዛዝ ሁኔታ ተቀይሯል: ${newStatus}`,
        'info'
      );
    }
  };

  // Product Comparison State
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleToggleCompare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (comparedProductIds.includes(id)) {
      setComparedProductIds(comparedProductIds.filter(pId => pId !== id));
      showToast(
        language === 'en' ? 'Product removed from comparison.' : 'ምርቱ ከማነጻጸሪያው ተነስቷል።',
        'info'
      );
    } else {
      if (comparedProductIds.length >= 3) {
        showToast(
          language === 'en' ? 'You can compare up to 3 products at a time.' : 'በአንድ ጊዜ እስከ 3 ምርቶች ብቻ ማነጻጸር ይችላሉ።',
          'warning'
        );
        return;
      }
      setComparedProductIds([...comparedProductIds, id]);
      showToast(
        language === 'en' ? 'Product added to comparison.' : 'ምርቱ ወደ ማነጻጸሪያው ታክሏል።',
        'success'
      );
    }
  };

  // Merged backend & offline orders for full history indexing
  const allOrders = React.useMemo(() => {
    return [...offlineOrders, ...orders];
  }, [offlineOrders, orders]);

  // Category & Filter Tabs Scroll Navigation Refs
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const filterScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollCategoryTab = (dir: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
    }
  };

  const scrollFilterTab = (dir: 'left' | 'right') => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: dir === 'left' ? -180 : 180, behavior: 'smooth' });
    }
  };

  // Product Reviews State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [revName, setRevName] = useState<string>('');
  const [revPhone, setRevPhone] = useState<string>('+2519');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState<string>('');
  const [activeReviewPhotoModal, setActiveReviewPhotoModal] = useState<string | null>(null);
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<string>('bole');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newQuestionAskedBy, setNewQuestionAskedBy] = useState<string>('');
  const [localQaMap, setLocalQaMap] = useState<Record<string, QAItem[]>>({});

  const handleQuestionSubmit = (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const asker = newQuestionAskedBy.trim() || (language === 'en' ? 'Verified Shopper' : 'የተረጋገጠ ገዢ');
    const newQa: QAItem = {
      id: `qa-${Date.now()}`,
      questionEn: newQuestionText.trim(),
      questionAm: newQuestionText.trim(),
      answerEn: 'Thank you for your question! The Kasma verified merchant has received it and will answer shortly within 1 hour.',
      answerAm: 'ስለ ጥያቄዎ እናመሰግናለን! የተረጋገጠው የካስማ ነጋዴ ጥያቄዎን ተቀብሏል፤ በ1 ሰዓት ውስጥ ምላሽ ይሰጥዎታል።',
      askedBy: asker,
      answeredBy: 'Kasma Verified Merchant Support',
      createdAt: new Date().toISOString(),
      verifiedAnswer: true
    };
    setLocalQaMap(prev => ({
      ...prev,
      [productId]: [newQa, ...(prev[productId] || [])]
    }));
    setNewQuestionText('');
    setNewQuestionAskedBy('');
    showToast(language === 'en' ? 'Question submitted to verified seller!' : 'ጥያቄዎ ለተረጋገጠው ሻጭ ተልኳል!', 'success');
  };

  // Shopify, Amazon & Jumia-inspired Premium features state
  // 1. Actual Campaign Expiry & Flash Sales Engine (Persistent & Real wall-clock countdown)
  const getFlashCampaignTargetMs = React.useCallback(() => {
    const now = Date.now();
    // A. Earliest active merchant flash deal end date in the future
    const futureDealTimes = flashDeals
      .filter(d => d.status === 'ACTIVE' && d.endDate && new Date(d.endDate).getTime() > now)
      .map(d => new Date(d.endDate).getTime());

    if (futureDealTimes.length > 0) {
      return Math.min(...futureDealTimes);
    }

    // B. Check persistent stored campaign deadline
    try {
      const stored = localStorage.getItem('kasma_flash_campaign_expiry');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > now) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }

    // C. Genuine campaign deadline: midnight tonight
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    let target = endOfDay.getTime();
    if (target <= now + 2 * 60 * 60 * 1000) {
      target += 24 * 60 * 60 * 1000;
    }
    try {
      localStorage.setItem('kasma_flash_campaign_expiry', String(target));
    } catch {
      // ignore
    }
    return target;
  }, [flashDeals]);

  const calculateFlashTimeRemaining = React.useCallback((targetMs: number) => {
    const diff = Math.max(0, targetMs - Date.now());
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }, []);

  const [flashTimeLeft, setFlashTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const diff = Math.max(0, endOfDay.getTime() - Date.now());
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  });
  const [simulatedClaimedQty, setSimulatedClaimedQty] = useState<Record<string, number>>({});

  // 2. Real-transaction privacy-safe Social Proof notification
  const [activeSocialProof, setActiveSocialProof] = useState<{ item: string; timeAgo: string; show: boolean } | null>(null);

  // Derived real purchase records from active & offline orders
  const realPurchaseList = React.useMemo(() => {
    const list: { itemEn: string; itemAm: string; createdAt: string }[] = [];
    allOrders.forEach(o => {
      if (o.items && o.items.length > 0) {
        o.items.forEach(it => {
          const nameEn = it.product?.nameEn || 'Verified Purchase';
          const nameAm = it.product?.nameAm || 'የተገዛ እቃ';
          list.push({ itemEn: nameEn, itemAm: nameAm, createdAt: o.createdAt });
        });
      }
    });
    return list;
  }, [allOrders]);

  // 3. Amazon-style Frequently Bought Together checkbox selections
  const [fbtSelectedIds, setFbtSelectedIds] = useState<string[]>([]);

  // Shopify-style real-time live views and orders metrics
  const [activeViewers, setActiveViewers] = useState<number>(12);
  const [activeOrderSpeed, setActiveOrderSpeed] = useState<number>(4);

  // Reset and fluctuate active viewers and purchase velocity for the selected product
  useEffect(() => {
    if (selectedProduct) {
      // Initialize with a realistic number based on product ID
      const hash = selectedProduct.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const baseViewers = 8 + (hash % 12); // between 8 and 19
      const baseOrders = 2 + (hash % 5);   // between 2 and 6
      setActiveViewers(baseViewers);
      setActiveOrderSpeed(baseOrders);

      // Fluctuate viewers count every 6 seconds to feel organic
      const viewerInterval = setInterval(() => {
        setActiveViewers(prev => {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const newVal = prev + delta;
          return Math.max(6, Math.min(25, newVal));
        });
      }, 6000);

      // Fluctuate orders count occasionally every 15 seconds
      const ordersInterval = setInterval(() => {
        setActiveOrderSpeed(prev => {
          const delta = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const newVal = prev + delta;
          return Math.max(2, Math.min(8, newVal));
        });
      }, 15000);

      return () => {
        clearInterval(viewerInterval);
        clearInterval(ordersInterval);
      };
    }
  }, [selectedProduct]);

  // Complementary category mapping metadata dictionary
  const COMPLEMENTARY_CATEGORY_MAP: Record<string, string[]> = React.useMemo(() => ({
    mobiles: ['headphones', 'smartwatches', 'accessories', 'gaming'],
    laptops: ['headphones', 'gaming', 'accessories', 'mobiles'],
    computers: ['headphones', 'gaming', 'accessories', 'laptops'],
    headphones: ['mobiles', 'smartwatches', 'gaming', 'laptops'],
    smartwatches: ['mobiles', 'headphones', 'accessories'],
    gaming: ['headphones', 'computers', 'laptops', 'mobiles'],
    accessories: ['mobiles', 'laptops', 'headphones', 'smartwatches']
  }), []);

  // Compute Frequently Bought Together recommendations for selectedProduct using category metadata
  const fbtProducts = React.useMemo(() => {
    if (!selectedProduct) return [];

    const currentCat = selectedProduct.category.toLowerCase();
    const preferredCategories = COMPLEMENTARY_CATEGORY_MAP[currentCat] || [];

    const candidates: Product[] = [];
    const usedIds = new Set<string>([selectedProduct.id]);

    // 1. Pick complementary items from mapped cross-categories
    for (const cat of preferredCategories) {
      if (candidates.length >= 2) break;
      const catMatch = approvedProducts.find(p => !usedIds.has(p.id) && p.category.toLowerCase() === cat);
      if (catMatch) {
        candidates.push(catMatch);
        usedIds.add(catMatch.id);
      }
    }

    // 2. Pick complementary item from same category if needed
    if (candidates.length < 2) {
      const sameCatMatch = approvedProducts.find(p => !usedIds.has(p.id) && p.category.toLowerCase() === currentCat);
      if (sameCatMatch) {
        candidates.push(sameCatMatch);
        usedIds.add(sameCatMatch.id);
      }
    }

    // 3. Fallback fill with any other approved product
    if (candidates.length < 2) {
      const fill = approvedProducts.filter(p => !usedIds.has(p.id));
      for (const item of fill) {
        if (candidates.length >= 2) break;
        candidates.push(item);
        usedIds.add(item.id);
      }
    }

    return candidates.slice(0, 2);
  }, [selectedProduct, approvedProducts, COMPLEMENTARY_CATEGORY_MAP]);

  // Synchronize Frequently Bought Together checkboxes whenever selectedProduct changes
  const fbtProductIdsStr = fbtProducts.map(p => p.id).join(',');
  const selectedProductId = selectedProduct?.id;

  React.useEffect(() => {
    if (selectedProductId) {
      setFbtSelectedIds([selectedProductId, ...fbtProducts.map(p => p.id)]);
    } else {
      setFbtSelectedIds([]);
    }
  }, [selectedProductId, fbtProductIdsStr]);

  // Flash Sales & Social Proof Engine
  React.useEffect(() => {
    // 1. Actual campaign countdown timer ticker (Real wall-clock expiry target, never resets on loop)
    const updateCountdown = () => {
      const targetMs = getFlashCampaignTargetMs();
      setFlashTimeLeft(calculateFlashTimeRemaining(targetMs));
    };

    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);

    // 2. Claimed qty increment simulator
    const claimInterval = setInterval(() => {
      if (approvedProducts.length > 0) {
        const firstFew = approvedProducts.slice(0, 3);
        const randomProduct = firstFew[Math.floor(Math.random() * firstFew.length)];
        if (randomProduct) {
          setSimulatedClaimedQty(prev => {
            const current = prev[randomProduct.id] || Math.floor(45 + Math.random() * 20);
            const increment = Math.random() > 0.4 ? 1 : 0;
            const limit = 92; // cap at 92%
            return {
              ...prev,
              [randomProduct.id]: Math.min(limit, current + increment)
            };
          });
        }
      }
    }, 18000);

    // 3. Privacy-preserving Real Transaction Social Proof Notification
    const getRelativePurchaseTime = (createdAtStr?: string) => {
      if (!createdAtStr) return language === 'en' ? '2 min ago' : 'ከ2 ደቂቃ በፊት';
      try {
        const created = new Date(createdAtStr).getTime();
        if (isNaN(created)) return language === 'en' ? 'Just now' : 'አሁን';
        const diffMins = Math.floor((Date.now() - created) / 60000);
        if (diffMins < 1) return language === 'en' ? 'Just now' : 'አሁን';
        if (diffMins < 60) return language === 'en' ? `${diffMins} min ago` : `ከ${diffMins} ደቂቃ በፊት`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return language === 'en' ? `${diffHours} hr ago` : `ከ${diffHours} ሰዓት በፊት`;
        const diffDays = Math.floor(diffHours / 24);
        return language === 'en' ? `${diffDays} d ago` : `ከ${diffDays} ቀን በፊት`;
      } catch {
        return language === 'en' ? '2 min ago' : 'ከ2 ደቂቃ በፊት';
      }
    };

    const triggerSocialProof = () => {
      if (realPurchaseList.length > 0) {
        const pick = realPurchaseList[Math.floor(Math.random() * realPurchaseList.length)];
        const itemTitle = language === 'en' ? pick.itemEn : pick.itemAm;
        const timeLabel = getRelativePurchaseTime(pick.createdAt);
        setActiveSocialProof({
          item: itemTitle,
          timeAgo: timeLabel,
          show: true
        });
      } else if (approvedProducts.length > 0) {
        const pick = approvedProducts[Math.floor(Math.random() * approvedProducts.length)];
        const itemTitle = language === 'en' ? pick.nameEn : pick.nameAm;
        setActiveSocialProof({
          item: itemTitle,
          timeAgo: language === 'en' ? '2 min ago' : 'ከ2 ደቂቃ በፊት',
          show: true
        });
      }

      setTimeout(() => {
        setActiveSocialProof(prev => prev ? { ...prev, show: false } : null);
      }, 5000);
    };

    const socialProofInterval = setInterval(triggerSocialProof, 22000);
    const initialToasterTimeout = setTimeout(triggerSocialProof, 6000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(claimInterval);
      clearInterval(socialProofInterval);
      clearTimeout(initialToasterTimeout);
    };
  }, [approvedProducts, language, realPurchaseList]);

  // Helper to calculate average product ratings
  const getProductRatingInfo = (product: Product) => {
    if (!product) return { avg: 0, count: 0 };
    const reviews = product.reviews || [];
    const count = product.reviewsCount !== undefined
      ? product.reviewsCount
      : (reviews.length > 0 ? reviews.length : 0);
    const avg = product.rating !== undefined
      ? Number(product.rating.toFixed(1))
      : (reviews.length > 0 ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)) : 0);
    return { avg, count };
  };

  // Helper to highlight matching keywords in text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight || !highlight.trim()) {
      return <span>{text}</span>;
    }
    try {
      // Escape special regex characters to prevent syntax errors
      const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${escapedHighlight})`, 'gi');
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, idx) =>
            regex.test(part) ? (
              <mark key={idx} className="bg-amber-200/90 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 px-1 py-0.5 rounded font-semibold transition-all">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  // Filter approved products only (declared at component top)

  // Collaborative Filtering & Behavioral Personalization Engine
  // Processes 6 user behavioral signals: product_view, search, wishlist, add_to_cart, purchase, category_view
  const recommendationData = React.useMemo(() => {
    const currentUserInteractions: Record<string, number> = {};
    const productSpecificReasons: Record<string, { en: string; am: string }> = {};

    // Match past purchases using customerPhone
    const cleanedUserPhone = customerPhone.trim().replace(/\s+/g, '');
    const userPastOrders = allOrders.filter(o => {
      const orderPhoneClean = o.customerPhone.trim().replace(/\s+/g, '');
      return cleanedUserPhone !== '+2519' && orderPhoneClean === cleanedUserPhone;
    });

    const purchasedProductIds = new Set<string>();
    userPastOrders.forEach(order => {
      order.items.forEach(item => {
        purchasedProductIds.add(item.product.id);
        currentUserInteractions[item.product.id] = (currentUserInteractions[item.product.id] || 0) + 5;
      });
    });

    // Signal 1: Purchase History Signal
    userPastOrders.forEach(order => {
      order.items.forEach(item => {
        approvedProducts.filter(p => p.category === item.product.category && p.id !== item.product.id).forEach(p => {
          currentUserInteractions[p.id] = (currentUserInteractions[p.id] || 0) + 2.0;
          if (!productSpecificReasons[p.id]) {
            productSpecificReasons[p.id] = {
              en: 'Based on your past purchases',
              am: 'በቀደሙ ትዕዛዞችዎ ታሪክ ላይ ተመስርቶ'
            };
          }
        });
      });
    });

    // Signal 2: Wishlist (Favorites) Signal
    favorites.forEach(pId => {
      currentUserInteractions[pId] = (currentUserInteractions[pId] || 0) + 4.0;
      const favProduct = approvedProducts.find(p => p.id === pId);
      if (favProduct) {
        approvedProducts.filter(p => p.category === favProduct.category && p.id !== favProduct.id).forEach(p => {
          currentUserInteractions[p.id] = (currentUserInteractions[p.id] || 0) + 2.5;
          if (!productSpecificReasons[p.id]) {
            productSpecificReasons[p.id] = {
              en: 'Similar to items in your wishlist',
              am: 'በምኞት ዝርዝርዎ ውስጥ ካሉ እቃዎች ጋር የሚመሳሰል'
            };
          }
        });
      }
    });

    // Signal 3: Add to Cart Signal
    cart.forEach(item => {
      currentUserInteractions[item.product.id] = (currentUserInteractions[item.product.id] || 0) + 3.5;
      approvedProducts.filter(p => p.category === item.product.category && p.id !== item.product.id).forEach(p => {
        currentUserInteractions[p.id] = (currentUserInteractions[p.id] || 0) + 2.0;
        if (!productSpecificReasons[p.id]) {
          productSpecificReasons[p.id] = {
            en: 'Complementary to your cart items',
            am: 'በጋሪዎ ውስጥ ካሉ እቃዎች ጋር የሚሄድ'
          };
        }
      });
    });

    // Signal 4: Product View History Signal
    viewedProductsHistory.forEach((vp, idx) => {
      const weight = Math.max(1, 3.0 - idx * 0.3);
      currentUserInteractions[vp.id] = (currentUserInteractions[vp.id] || 0) + weight;
      const catObj = categories.find(c => c.id === vp.category);
      const catNameEn = catObj ? catObj.nameEn : vp.category;
      const catNameAm = catObj ? catObj.nameAm : vp.category;

      approvedProducts.filter(p => p.category === vp.category && p.id !== vp.id).forEach(p => {
        currentUserInteractions[p.id] = (currentUserInteractions[p.id] || 0) + 2.2;
        if (!productSpecificReasons[p.id]) {
          productSpecificReasons[p.id] = {
            en: `Because you viewed ${vp.nameEn || catNameEn}`,
            am: `${vp.nameAm || catNameAm} ስለተመለከቱ የተመረጠ`
          };
        }
      });
    });

    // Signal 5: Recent Searches Signal
    recentSearchesHistory.forEach(q => {
      const query = q.toLowerCase();
      approvedProducts.forEach(p => {
        const nameEn = p.nameEn.toLowerCase();
        const nameAm = p.nameAm.toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const cat = p.category.toLowerCase();

        if (nameEn.includes(query) || nameAm.includes(query) || brand.includes(query) || cat.includes(query)) {
          currentUserInteractions[p.id] = (currentUserInteractions[p.id] || 0) + 3.0;
          if (!productSpecificReasons[p.id]) {
            productSpecificReasons[p.id] = {
              en: `Matches your search "${q}"`,
              am: `ለ"${q}" የፍለጋ ታሪክዎ የሚዛመድ`
            };
          }
        }
      });
    });

    // Signal 6: Category View History Signal
    categoryViewHistory.forEach(cv => {
      const catObj = categories.find(c => c.id === cv.categoryId);
      if (catObj) {
        approvedProducts.filter(p => p.category === cv.categoryId).forEach(p => {
          currentUserInteractions[p.id] = (currentUserInteractions[p.id] || 0) + 1.8;
          if (!productSpecificReasons[p.id]) {
            productSpecificReasons[p.id] = {
              en: `Top pick in ${catObj.nameEn}`,
              am: `በ${catObj.nameAm} ምድብ የተመረጠ`
            };
          }
        });
      }
    });

    // Determine Section Header Reason
    let primaryReason = {
      en: 'You may also like',
      am: 'ሊወዱት የሚችሉት',
      type: 'popular'
    };

    if (viewedProductsHistory.length > 0) {
      const lastViewed = viewedProductsHistory[0];
      const catObj = categories.find(c => c.id === lastViewed.category);
      const catNameEn = catObj ? catObj.nameEn : lastViewed.category;
      const catNameAm = catObj ? catObj.nameAm : lastViewed.category;
      primaryReason = {
        en: `Because you viewed ${lastViewed.nameEn || catNameEn}`,
        am: `${lastViewed.nameAm || catNameAm} ስለተመለከቱ የተመረጡ`,
        type: 'product_view'
      };
    } else if (recentSearchesHistory.length > 0) {
      const topSearch = recentSearchesHistory[0];
      primaryReason = {
        en: `Based on your recent search for "${topSearch}"`,
        am: `ለ"${topSearch}" የፍለጋ ታሪክዎ ላይ ተመስርቶ`,
        type: 'search'
      };
    } else if (favorites.length > 0) {
      primaryReason = {
        en: 'Based on items in your wishlist',
        am: 'በምኞት ዝርዝርዎ ውስጥ ባሉ እቃዎች ላይ ተመስርቶ',
        type: 'wishlist'
      };
    } else if (cart.length > 0) {
      primaryReason = {
        en: 'Based on items in your shopping cart',
        am: 'በግብይት ጋሪዎ ውስጥ ባሉ እቃዎች ላይ ተመስርቶ',
        type: 'add_to_cart'
      };
    } else if (userPastOrders.length > 0) {
      primaryReason = {
        en: 'Based on your purchase history',
        am: 'በቀደሙ ትዕዛዞችዎ ታሪክ ላይ ተመስርቶ',
        type: 'purchase'
      };
    } else if (categoryViewHistory.length > 0) {
      const catObj = categories.find(c => c.id === categoryViewHistory[0].categoryId);
      if (catObj) {
        primaryReason = {
          en: `Because you explored ${catObj.nameEn}`,
          am: `${catObj.nameAm} ምድብ ስለጎበኙ`,
          type: 'category_view'
        };
      }
    }

    // Calculate score for each approved product
    const recommendations = approvedProducts
      .map(p => {
        // Exclude products in cart or favorites or purchased to present fresh recommendations
        const isFav = favorites.includes(p.id);
        const isInCart = cart.some(item => item.product.id === p.id);
        const hasPurchased = purchasedProductIds.has(p.id);

        if (isFav || isInCart || hasPurchased) {
          return { product: p, score: -1, reason: { en: 'Popular pick', am: 'ተወዳጅ ምርጫ' } };
        }

        let score = currentUserInteractions[p.id] || 0;

        // Popularity & Rating booster
        const { avg } = getProductRatingInfo(p);
        if (avg > 0) {
          score += (avg / 5) * 0.8;
        }
        if (p.featured) {
          score += 0.5;
        }

        const defaultReason = {
          en: 'Trending & top rated',
          am: 'ተወዳጅና ከፍተኛ ደረጃ ያገኘ'
        };

        const reason = productSpecificReasons[p.id] || defaultReason;

        return { product: p, score, reason };
      })
      .filter(r => r.score >= 0)
      .sort((a, b) => b.score - a.score);

    const signalCounts = {
      product_view: viewedProductsHistory.length,
      search: recentSearchesHistory.length,
      wishlist: favorites.length,
      add_to_cart: cart.length,
      purchase: userPastOrders.length,
      category_view: categoryViewHistory.length
    };

    return {
      items: recommendations.slice(0, 4),
      primaryReason,
      signalCounts,
      hasInteractions: Object.values(signalCounts).reduce((a, b) => a + b, 0) > 0
    };
  }, [viewedProductsHistory, recentSearchesHistory, categoryViewHistory, favorites, cart, customerPhone, allOrders, approvedProducts, categories]);

  const { items: recommendedProductsWithReasons, primaryReason: recommendationPrimaryReason, signalCounts: recommendationSignalCounts, hasInteractions: hasRecommendationInteractions } = recommendationData;
  const recommendedProducts = React.useMemo(() => recommendedProductsWithReasons.map(r => r.product), [recommendedProductsWithReasons]);

  // Recently Viewed Section: Stores the last 5 products the user clicked on
  const recentlyViewedProducts = React.useMemo(() => {
    const list: Product[] = [];
    const seenIds = new Set<string>();

    for (const item of viewedProductsHistory) {
      if (list.length >= 5) break;
      if (!seenIds.has(item.id)) {
        const found = approvedProducts.find(p => p.id === item.id);
        if (found) {
          list.push(found);
          seenIds.add(item.id);
        }
      }
    }
    return list;
  }, [viewedProductsHistory, approvedProducts]);

  const handleClearRecentlyViewed = () => {
    setViewedProductsHistory([]);
    try {
      localStorage.removeItem('kasma_viewed_products');
    } catch (e) { }
    showToast(
      language === 'en' ? 'Recently viewed history cleared.' : 'የቅርብ ጊዜ የታዩ እቃዎች ታሪክ ተሰርዟል።',
      'info'
    );
  };

  const filteredProducts = approvedProducts.filter(p => {
    const matchesCategory = selectedCategory === 'all'
      ? true
      : selectedCategory === 'deals'
        ? (p.featured || (p.variants && p.variants.some(v => v.priceOffset < 0)))
        : p.category === selectedCategory;
    const name = language === 'en' ? p.nameEn.toLowerCase() : p.nameAm.toLowerCase();
    const desc = language === 'en' ? p.descriptionEn.toLowerCase() : p.descriptionAm.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || name.includes(query) || desc.includes(query) || (p.brand && p.brand.toLowerCase().includes(query));

    // 1. Price Range filter
    const minP = minPriceInput.trim() !== '' ? parseFloat(minPriceInput) : null;
    const maxP = maxPriceInput.trim() !== '' ? parseFloat(maxPriceInput) : null;
    const matchesMinPrice = minP === null || isNaN(minP) || p.price >= minP;
    const matchesMaxPrice = maxP === null || isNaN(maxP) || p.price <= maxP;

    // 2. Brand filter
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);

    // 3. Availability & Status filter
    let matchesAvailability = true;
    if (availabilityFilter === 'IN_STOCK') {
      const totalStock = p.variants ? p.variants.reduce((sum, v) => sum + Math.max(0, (v.onHand || 0) - (v.reserved || 0)), 0) : 1;
      matchesAvailability = totalStock > 0;
    } else if (availabilityFilter === 'ON_SALE') {
      matchesAvailability = !!p.featured;
    } else if (availabilityFilter === 'HIGHLY_RATED') {
      const { avg } = getProductRatingInfo(p);
      matchesAvailability = avg >= 4.0;
    }

    // 4. Rating filter
    const { avg } = getProductRatingInfo(p);
    const matchesRating = selectedRatingFilter === 0 || (selectedRatingFilter === 4 ? avg >= 4.0 : avg >= 3.0);

    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBrand && matchesAvailability && matchesRating;
  });

  const handleReviewSubmit = async (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    setReviewError('');

    if (!revName.trim()) {
      setReviewError(language === 'en' ? 'Please provide your name.' : 'እባክዎን ስምዎን ያስገቡ።');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError(language === 'en' ? 'Please write a review comment.' : 'እባክዎን አስተያየትዎን ይጻፉ።');
      return;
    }

    const cleanedRevPhone = revPhone.trim().replace(/\s+/g, '');
    const hasPurchased = allOrders.some(order => {
      const orderPhoneClean = order.customerPhone.trim().replace(/\s+/g, '');
      const matchesPhone = orderPhoneClean === cleanedRevPhone;
      const containsProduct = order.items.some(item => item.product.id === productId);
      return matchesPhone && containsProduct;
    });

    if (!hasPurchased) {
      setReviewError(
        language === 'en'
          ? 'Verification failed: Only customers who purchased this product can submit a review. Please use the mobile number from your order checkout.'
          : 'ማረጋገጫ አልተሳካም፡ ይህንን ምርት የገዙ ደንበኞች ብቻ ናቸው አስተያየት መተው የሚችሉት። እባክዎን በትእዛዝዎ ጊዜ የተጠቀሙበትን ስልክ ቁጥር ያስገቡ።'
      );
      return;
    }

    setIsSubmittingReview(true);
    const photoList = reviewPhotoUrl.trim() ? [reviewPhotoUrl.trim()] : undefined;
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          reviewerName: revName,
          reviewerPhone: revPhone,
          photos: photoList
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToast(
          language === 'en' ? 'Review submitted successfully! Thank you!' : 'አስተያየትዎ በተሳካ ሁኔታ ገብቷል! እናመሰግናለን!',
          'success'
        );
        setReviewComment('');
        setReviewRating(5);
        setReviewPhotoUrl('');
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(data.product);
        }
      } else {
        // Fallback local update if mock API
        const newLocalReview: Review = {
          id: `rev-${Date.now()}`,
          reviewerName: revName,
          reviewerPhone: revPhone,
          rating: reviewRating,
          comment: reviewComment,
          createdAt: new Date().toISOString(),
          verified: true,
          verifiedPurchase: true,
          photos: photoList
        };
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct({
            ...selectedProduct,
            reviews: [newLocalReview, ...(selectedProduct.reviews || [])]
          });
        }
        showToast(
          language === 'en' ? 'Review submitted successfully! Thank you!' : 'አስተያየትዎ በተሳካ ሁኔታ ገብቷል! እናመሰግናለን!',
          'success'
        );
        setReviewComment('');
        setReviewRating(5);
        setReviewPhotoUrl('');
      }
    } catch (err) {
      // Fallback local update if network is simulated or offline
      const newLocalReview: Review = {
        id: `rev-${Date.now()}`,
        reviewerName: revName,
        reviewerPhone: revPhone,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString(),
        verified: true,
        verifiedPurchase: true,
        photos: photoList
      };
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct({
          ...selectedProduct,
          reviews: [newLocalReview, ...(selectedProduct.reviews || [])]
        });
      }
      showToast(
        language === 'en' ? 'Review submitted successfully! Thank you!' : 'አስተያየትዎ በተሳካ ሁኔታ ገብቷል! እናመሰግናለን!',
        'success'
      );
      setReviewComment('');
      setReviewRating(5);
      setReviewPhotoUrl('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p);
    setSelectedVariant(p.variants[0] || null);
    recordProductViewSignal(p);
  };

  const handleOpenQuickBuy = (p: Product) => {
    setQuickBuyProduct(p);
    setQuickBuyVariant(p.variants[0] || null);
    setQuickBuyQuantity(1);
    setQuickViewImageIndex(0);
    recordProductViewSignal(p);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fId => fId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleTogglePriceAlert = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const existing = priceAlerts.find(a => a.productId === product.id);
    if (existing) {
      setPriceAlerts(priceAlerts.filter(a => a.productId !== product.id));
      showToast(
        language === 'en'
          ? `Removed price alert for ${product.nameEn}.`
          : `ለ${product.nameAm} የዋጋ ማንቂያ ተነስቷል።`,
        'info'
      );
    } else {
      setPriceAlerts([...priceAlerts, { productId: product.id, thresholdPrice: product.price }]);
      showToast(
        language === 'en'
          ? `Price alert set for ${product.nameEn} at ${product.price.toLocaleString()} ETB.`
          : `ለ${product.nameAm} የዋጋ ማንቂያ በ${product.price.toLocaleString()} ETB ተዋቅሯል።`,
        'success'
      );
    }
  };

  const handleUpdateThresholdPrice = (productId: string, price: number) => {
    setPriceAlerts(priceAlerts.map(a =>
      a.productId === productId ? { ...a, thresholdPrice: Math.max(0, price) } : a
    ));
  };

  const addToCart = (product: Product, variant: Variant, quantity: number = 1) => {
    let canAdd = true;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.sku === variant.sku);
      const currentQtyInCart = existing ? existing.quantity : 0;

      if (currentQtyInCart + quantity > variant.onHand) {
        showToast(language === 'en'
          ? `Cannot add more. Only ${variant.onHand} items on hand.`
          : `ማከል አይቻልም። በእጅ ላይ ያለው ${variant.onHand} ፍሬ ብቻ ነው።`,
          'warning'
        );
        canAdd = false;
        return prev;
      }

      if (existing) {
        return prev.map(item =>
          (item.product.id === product.id && item.sku === variant.sku)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, {
          product,
          sku: variant.sku,
          variantName: variant.name,
          quantity: quantity,
          price: product.price + variant.priceOffset
        }];
      }
    });

    if (canAdd) {
      // Trigger visual animation highlight for newly added item
      setRecentlyAddedSkus(prev => [...prev, variant.sku]);
      setTimeout(() => {
        setRecentlyAddedSkus(prev => prev.filter(s => s !== variant.sku));
      }, 1200);

      // Sync wishlist: remove from favorites when added to cart
      setFavorites(prev => prev.filter(fId => fId !== product.id));
    }
  };

  const handleInstantBuy = (product: Product, variant?: Variant, quantity: number = 1) => {
    const targetVariant = variant || product.variants[0];
    if (!targetVariant || targetVariant.onHand <= 0) {
      showToast(language === 'en' ? 'Selected item is out of stock' : 'የተመረጠው እቃ አልቋል', 'warning');
      return;
    }
    addToCart(product, targetVariant, quantity);
    setPaymentStep('FORM');
    setIsCartOpen(false);
    setSelectedProduct(null);
    if (!isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
    showToast(
      language === 'en'
        ? '⚡ Instant checkout initiated! Complete your order details below.'
        : '⚡ የፈጣን ክፍያ ገፅ ተከፍቷል! ትዕዛዝዎን ከታች ያጠናቁ።',
      'info'
    );
  };

  const addBundleToCart = (itemsToAdd: { product: Product; price: number }[]) => {
    let newCart = [...cart];
    const addedSkus: string[] = [];
    itemsToAdd.forEach(({ product, price }) => {
      const defaultVariant = product.variants[0] || { sku: 'DEFAULT', name: 'Standard Option', onHand: 10, priceOffset: 0 };
      addedSkus.push(defaultVariant.sku);
      const existing = newCart.find(item => item.product.id === product.id && item.sku === defaultVariant.sku);

      if (existing) {
        newCart = newCart.map(item =>
          (item.product.id === product.id && item.sku === defaultVariant.sku)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart.push({
          product,
          sku: defaultVariant.sku,
          variantName: defaultVariant.name,
          quantity: 1,
          price: price
        });
      }
    });
    setCart(newCart);
    setRecentlyAddedSkus(prev => [...prev, ...addedSkus]);
    setTimeout(() => {
      setRecentlyAddedSkus(prev => prev.filter(s => !addedSkus.includes(s)));
    }, 1400);
    showToast(
      language === 'en'
        ? `Added ${itemsToAdd.length} bundle items to your cart with exclusive combo savings!`
        : `${itemsToAdd.length} የጥቅል እቃዎች ከልዩ ቅናሽ ጋር ወደ ጋሪዎ ታክለዋል!`,
      'success'
    );
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (sku: string) => {
    if (removingSkus.includes(sku)) return;
    setRemovingSkus(prev => [...prev, sku]);
    setTimeout(() => {
      setCart(prev => prev.filter(item => item.sku !== sku));
      setRemovingSkus(prev => prev.filter(s => s !== sku));
    }, 280);
  };

  const updateCartQty = (sku: string, value: number) => {
    const item = cart.find(c => c.sku === sku);
    if (!item) return;

    // Find the actual variant's onHand stock
    const variantObj = item.product.variants.find(v => v.sku === sku);
    const maxStock = variantObj ? variantObj.onHand : 99;

    if (value > maxStock) {
      showToast(language === 'en'
        ? `Only ${maxStock} items available in stock.`
        : `በክምችት ውስጥ ያለው ${maxStock} ፍሬ ብቻ ነው።`,
        'warning'
      );
      return;
    }

    if (value <= 0) {
      handleRemoveFromCart(sku);
    } else {
      setRecentlyUpdatedSku(sku);
      setTimeout(() => setRecentlyUpdatedSku(null), 500);
      setCart(cart.map(c => c.sku === sku ? { ...c, quantity: value } : c));
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = React.useMemo(() => {
    if (cartSubtotal === 0) return 0;
    const match = SUB_CITIES.find(sc => sc.id === selectedSubCity);
    return match ? match.fee : 150;
  }, [cartSubtotal, selectedSubCity]);

  // Compute discount amount
  const activeDiscount = React.useMemo(() => {
    if (!appliedPromo) return 0;
    // Auto-invalidate if the cart subtotal is modified and falls below the threshold
    if (appliedPromo.minSubtotal && cartSubtotal < appliedPromo.minSubtotal) {
      return 0;
    }
    if (appliedPromo.type === 'PERCENTAGE') {
      return Math.round(cartSubtotal * (appliedPromo.value / 100));
    }
    if (appliedPromo.type === 'FLAT') {
      return Math.min(appliedPromo.value, cartSubtotal);
    }
    if (appliedPromo.type === 'FREE_SHIPPING') {
      return shippingFee;
    }
    return 0;
  }, [appliedPromo, cartSubtotal, shippingFee]);

  const cartTotal = Math.max(0, cartSubtotal + shippingFee - activeDiscount);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Defensive validation for Ethiopian addressing & contact
    const cleanPhone = customerPhone.trim().replace(/\s+/g, '');
    const cleanName = customerName.trim();
    const cleanLandmark = customerLandmark.trim();

    if (!cleanName) {
      showToast(language === 'en' ? 'Recipient Full Name is required.' : 'እባክዎን ሙሉ ስምዎን ያስገቡ።', 'warning');
      return;
    }

    if (!selectedSubCity) {
      showToast(language === 'en' ? 'Sub-city selection is required for delivery routing.' : 'እባክዎን ክፍለ ከተማ ይምረጡ።', 'warning');
      return;
    }

    if (!cleanLandmark) {
      showToast(
        language === 'en'
          ? 'Known Landmark / Area is required (e.g. Behind Edna Mall, Near Medhanialem Church).'
          : 'እባክዎን የሚታወቅ መለያ ቦታ ያስገቡ (ለምሳሌ፡ ከኤድና ሞል ጀርባ፣ ከመድኃኔዓለም ቤተክርስቲያን አጠገብ)።',
        'warning'
      );
      return;
    }

    // Require Ethiopian mobile phone format
    const isEthPhone = /^(\+2519|\+2517|09|07)\d{8}$/.test(cleanPhone);
    if (!isEthPhone) {
      showToast(
        language === 'en'
          ? 'Valid Ethiopian mobile number required (+251 9... / +251 7... or 09... / 07...).'
          : 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (+2519... ወይም 09...)።',
        'warning'
      );
      return;
    }

    // Initialize Transaction via Real Integrated Payment Gateway API
    setIsInitializingPayment(true);
    setPaymentApiError(null);

    try {
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          currency: 'ETB',
          paymentMethod,
          customerPhone: cleanPhone,
          customerName: cleanName,
          customerEmail,
          subCity: selectedSubCity,
          landmark: cleanLandmark
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment gateway initialization failed.');
      }

      setActivePaymentSession(data);
      if (data.token) {
        localStorage.setItem('kasma_auth_token', data.token);
      }
      setQrReferenceTx(data.txRef);

      if (paymentMethod === 'BANK') {
        setGatewayPaymentTab('BANK_RECEIPT');
        setPaymentStep('GATEWAY');
        showToast(
          language === 'en'
            ? 'Please transfer to the CBE/Abyssinia account and attach your screenshot receipt below.'
            : 'እባክዎ ወደ ባንክ ሂሳቡ አስገብተው የደረሰኙን ስክሪንሾት ከታች ይጫኑ።',
          'info'
        );
        return;
      }

      if (paymentMethod === 'COD') {
        completeOrder('PROCESSING', data.txRef);
        showToast(
          language === 'en'
            ? `Cash on Delivery order confirmed! Courier fleet dispatched (PIN: ${data.verificationPin || '8492'})`
            : `የእጅ በእጅ ክፍያ ትዕዛዝ ተረጋግጧል! መልዕክተኛ ተመድቧል (ፒን፡ ${data.verificationPin || '8492'})`,
          'success'
        );
        return;
      }

      setGatewayPaymentTab('QR');
      setPaymentStep('GATEWAY');
      showToast(
        language === 'en'
          ? `Integrated ${data.paymentMethod} gateway initialized (Ref: ${data.txRef})`
          : `የ${data.paymentMethod} ክፍያ ሂደት ተጀምሯል (መለያ: ${data.txRef})`,
        'info'
      );
    } catch (err: any) {
      console.error('Payment API initialization failed:', err);
      setPaymentApiError(err.message || 'Payment API initialization crashed.');
      showToast(err.message || 'Payment gateway unreachable.', 'warning');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  // Verify payment transaction via Integrated Payment Gateway API (/api/payment/verify)
  const handleVerifyPaymentApi = async () => {
    setIsProcessingPayment(true);
    const txRef = activePaymentSession?.txRef || qrReferenceTx;
    const selectedSubCityObj = SUB_CITIES.find(sc => sc.id === selectedSubCity);
    const subCityLabel = selectedSubCityObj ? selectedSubCityObj.nameEn : selectedSubCity;
    const tempOrderId = `KS-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderData: Partial<Order> = {
      id: tempOrderId,
      customerId: `cust-${Math.floor(Math.random() * 1000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: [...cart],
      subtotal: cartSubtotal,
      shippingFee,
      total: cartTotal,
      status: 'PAID',
      paymentMethod,
      paymentId: txRef,
      subCity: selectedSubCity,
      landmark: customerLandmark.trim(),
      shippingAddress: `[${subCityLabel} - Landmark: ${customerLandmark.trim()}] ${shippingAddress.trim() || 'Courier Dispatch'}`,
      createdAt: new Date().toISOString(),
      channel: 'WEB',
      discountCode: appliedPromo ? appliedPromo.code : undefined,
      discountAmount: activeDiscount > 0 ? activeDiscount : undefined
    };

    try {
      const token = localStorage.getItem('kasma_auth_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_merchant_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          txRef,
          orderId: tempOrderId,
          paymentMethod,
          orderData
        })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Payment gateway verification pending or authorization rejected.');
      }

      showToast(
        language === 'en'
          ? `Payment verified via ${paymentMethod}! (Ref: ${txRef})`
          : `ክፍያው በተሳካ ሁኔታ ተረጋግጧል! (መለያ: ${txRef})`,
        'success'
      );

      completeOrder('PAID', txRef);
    } catch (err: any) {
      console.warn('Payment verification issue:', err);
      showToast(
        language === 'en'
          ? `Verification issue: ${err.message || 'Check your payment app approval.'}`
          : `የማረጋገጫ ችግር፡ ${err.message || 'በአፕሊኬሽንዎ ክፍያውን ያረጋግጡ'}`,
        'warning'
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSimulatePayment = () => {
    handleVerifyPaymentApi();
  };

  const handleVerifyOtp = () => {
    if (telebirrOtp.length !== 6) {
      showToast(language === 'en' ? 'Please enter a 6-digit OTP' : 'እባክዎን ባለ 6 አሃዝ ኮድ ያስገቡ', 'warning');
      return;
    }
    handleVerifyPaymentApi();
  };

  // Telegram Mini App MainButton Integration
  useEffect(() => {
    // 1. Checkout Portal Priority
    if (isCheckoutOpen) {
      if (paymentStep === 'FORM') {
        showTelegramMainButton({
          text: paymentMethod === 'COD'
            ? (language === 'en' ? `CONTACT ON TELEGRAM • ${cartTotal.toLocaleString()} ETB` : `በቴሌግራም ያግኙን • ${cartTotal.toLocaleString()} ብር`)
            : (language === 'en' ? `PROCEED TO PAYMENT • ${cartTotal.toLocaleString()} ETB` : `ወደ ክፍያ ይቀጥሉ • ${cartTotal.toLocaleString()} ብር`),
          onClick: () => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          },
          color: paymentMethod === 'COD' ? '#229ED9' : '#0052FF'
        });
      } else if (paymentStep === 'GATEWAY') {
        showTelegramMainButton({
          text: language === 'en' ? 'CONFIRM PAYMENT' : 'ክፍያውን አረጋግጥ',
          onClick: handleSimulatePayment,
          color: '#0052FF',
          isProgress: isProcessingPayment
        });
      } else if (paymentStep === 'OTP') {
        showTelegramMainButton({
          text: language === 'en' ? 'VERIFY OTP' : 'ኦቲፒ አረጋግጥ',
          onClick: handleVerifyOtp,
          color: '#10B981',
          isProgress: isProcessingPayment
        });
      } else {
        hideTelegramMainButton();
      }
      return;
    }

    // 2. Shopping Cart Drawer Priority
    if (isCartOpen) {
      if (cart.length > 0) {
        showTelegramMainButton({
          text: language === 'en' ? `CHECKOUT • ${cartTotal.toLocaleString()} ETB` : `ወደ መክፈያ • ${cartTotal.toLocaleString()} ብር`,
          onClick: () => {
            setIsCartOpen(false);
            if (!isCustomerLoggedIn) {
              setIsAuthModalOpen(true);
            } else {
              setIsCheckoutOpen(true);
            }
          },
          color: '#0052FF'
        });
      } else {
        hideTelegramMainButton();
      }
      return;
    }

    // 3. Product Quick View / Detail Modal Priority
    if (selectedProduct) {
      const activeVariant = selectedVariant || selectedProduct.variants[0];
      const itemPrice = (selectedProduct.price || 0) + (activeVariant?.priceOffset || 0);
      showTelegramMainButton({
        text: language === 'en' ? `ADD TO CART • ${itemPrice.toLocaleString()} ETB` : `ወደ ጋሪ ጨምር • ${itemPrice.toLocaleString()} ብር`,
        onClick: () => {
          if (activeVariant) {
            addToCart(selectedProduct, activeVariant, 1);
            showToast(
              language === 'en' ? 'Added to cart!' : 'ወደ ጋሪ ተጨምሯል!',
              'success'
            );
          }
        },
        color: '#0052FF'
      });
      return;
    }

    // 4. Default View with items in cart
    if (cart.length > 0) {
      const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
      showTelegramMainButton({
        text: language === 'en'
          ? `VIEW CART (${totalCount}) • ${cartTotal.toLocaleString()} ETB`
          : `ጋሪ ተመልከት (${totalCount}) • ${cartTotal.toLocaleString()} ብር`,
        onClick: () => setIsCartOpen(true),
        color: '#0052FF'
      });
      return;
    }

    // 5. Fallback hide
    hideTelegramMainButton();
  }, [
    isCheckoutOpen,
    paymentStep,
    isProcessingPayment,
    isCartOpen,
    cart,
    cartTotal,
    selectedProduct,
    selectedVariant,
    language
  ]);


  const completeOrder = (overrideStatus?: Order['status'], verifiedPaymentId?: string) => {
    // Generate order with landmark-based Ethiopian addressing
    const selectedSubCityObj = SUB_CITIES.find(sc => sc.id === selectedSubCity);
    const subCityLabel = selectedSubCityObj ? selectedSubCityObj.nameEn : selectedSubCity;
    const resolvedTxRef = verifiedPaymentId || activePaymentSession?.txRef || (
      paymentMethod === 'TELEBIRR'
        ? `tb_tx_${Math.random().toString(36).substring(7)}`
        : paymentMethod === 'BANK'
          ? `bank_tx_${bankReference || Math.random().toString(36).substring(7)}`
          : paymentMethod === 'CBE_BIRR'
            ? `cbe_tx_${Math.random().toString(36).substring(7)}`
            : paymentMethod === 'CHAPA'
              ? `ch_tx_${Math.random().toString(36).substring(7)}`
              : `cod_pin_${activePaymentSession?.verificationPin || Math.floor(1000 + Math.random() * 9000)}`
    );

    const newOrder: Order = {
      id: `KS-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: `cust-${Math.floor(Math.random() * 1000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: [...cart],
      subtotal: cartSubtotal,
      shippingFee,
      total: cartTotal,
      status: overrideStatus || (paymentMethod === 'COD' ? 'PROCESSING' : 'PAID'),
      paymentMethod,
      paymentId: resolvedTxRef,
      subCity: selectedSubCity,
      landmark: customerLandmark.trim(),
      shippingAddress: `[${subCityLabel} - Landmark: ${customerLandmark.trim()}] ${shippingAddress.trim() || 'Courier Dispatch'}`,
      createdAt: new Date().toISOString(),
      channel: 'WEB',
      discountCode: appliedPromo ? appliedPromo.code : undefined,
      discountAmount: activeDiscount > 0 ? activeDiscount : undefined,
      paymentScreenshot: paymentScreenshot || undefined,
      bankName: paymentMethod === 'BANK' ? selectedBank : undefined,
      merchantTelegramConfirmed: paymentMethod === 'COD' ? true : undefined,
      deliveryPersonnel: {
        name: 'Dawit Bekele',
        phone: '+251 91 199 8877',
        vehicle: 'TVS Apache Electric Scooter (Plate: AA-3-48192)',
        eta: '35-45 Minutes to Addis Ababa'
      },
      handoverPin: activePaymentSession?.verificationPin || '8492'
    };

    // Decrement the physical stock on hand
    cart.forEach(item => {
      onUpdateProductStock(
        item.product.id,
        item.sku,
        -item.quantity,
        `Sales checkout order #${newOrder.id} fulfilment (Auto-decrement)`
      );
    });

    onAddOrder(newOrder);
    setLastPlacedOrderId(newOrder.id);
    setLastPlacedOrder(newOrder);

    // Dispatch automated Telegram order confirmation receipt to customer
    sendTelegramOrderConfirmation(newOrder, language).catch(err => {
      console.warn("Telegram order receipt dispatch failed:", err);
    });

    // Dispatch real-time order notification to store owner's personal channel
    sendStoreOwnerTelegramNotification(newOrder, undefined, language).catch(err => {
      console.warn("Store owner Telegram order alert failed:", err);
    });

    // Dispatch real-time order confirmation notification to merchant's private Telegram channel
    sendTelegramShippingUpdate(
      newOrder.id,
      newOrder.status,
      newOrder.customerName,
      newOrder.shippingAddress,
      language,
      undefined,
      newOrder.items.map(i => ({
        name: language === 'en' ? i.product.nameEn : i.product.nameAm,
        quantity: i.quantity,
        price: i.price
      }))
    ).catch(err => {
      console.warn("Real-time merchant Telegram order confirmation alert failed:", err);
    });

    // Award Kasma Points (1 Point per 10 ETB)
    const pointsEarned = Math.round(cartTotal / 10);
    if (pointsEarned > 0) {
      addPoints(
        pointsEarned,
        `Earned on Order #${newOrder.id}`,
        `ከተዕዛዝ #${newOrder.id} የተገኘ ነጥብ`,
        'EARNED'
      );
    }

    if (isOfflineSimulated) {
      showToast(
        language === 'en'
          ? 'Offline mode active: Order queued in local cache.'
          : 'ከመስመር ውጭ ሁነታ ገቢር ነው፡ ትዕዛዙ በካሽ ውስጥ ተቀምጧል።',
        'info'
      );
    }
    setCart([]);
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
    setPromoSuccessMessage(null);
    setPaymentStep('SUCCESS');
  };

  const closeCheckoutFlow = () => {
    setIsCheckoutOpen(false);
    setPaymentStep('FORM');
    if (!isCustomerLoggedIn) {
      setCustomerName('');
      setCustomerPhone('+2519');
      setCustomerLandmark('');
    }
    setPaymentScreenshot(null);
    setPaymentScreenshotName('');
    setBankReference('');
    setMerchantTelegramConfirmed(false);
    setTelebirrOtp('');
    setActivePaymentSession(null);
    setPaymentApiError(null);
  };

  // Calculate sorted products
  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'newest') {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    }
    return 0;
  });

  const paginatedProducts = React.useMemo(() => {
    return sortedAndFilteredProducts.slice(0, visibleProductCount);
  }, [sortedAndFilteredProducts, visibleProductCount]);

  // Infinite Scroll: Seamlessly load next products when user scrolls down
  useEffect(() => {
    if (visibleProductCount >= sortedAndFilteredProducts.length) return;

    const sentinel = scrollSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleProductCount(prev => Math.min(prev + 12, sortedAndFilteredProducts.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: '350px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleProductCount, sortedAndFilteredProducts.length, isLoadingMore]);

  // Pick active carousel slides from products based on current selection: 'featured' | 'new_arrivals' | 'top_sold'
  const activeSlides = React.useMemo(() => {
    if (carouselTab === 'new_arrivals') {
      // Highlights recently added or specific new products (e.g. headphones, cameras, accessories)
      return approvedProducts.filter(p => p.id === 'p4' || p.id === 'p5' || p.category === 'headphones' || p.category === 'cameras' || p.category === 'accessories').slice(0, 4);
    }
    if (carouselTab === 'top_sold') {
      // Highlights highest demand or specific high performance items (e.g. mobiles, smartwatches, gaming)
      return approvedProducts.filter(p => p.id === 'p1' || p.id === 'p3' || p.category === 'mobiles' || p.category === 'smartwatches' || p.category === 'gaming').slice(0, 4);
    }
    // Default: Featured (Capped at 5 flagship slides for clean carousel pagination)
    return approvedProducts.filter(p => p.featured).slice(0, 5);
  }, [approvedProducts, carouselTab]);

  // Reset active slide when carousel tab changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [carouselTab]);

  // Auto slidable timer for carousel
  useEffect(() => {
    if (activeSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  // Safe slide selection guard to prevent index errors
  const slide = activeSlides[currentSlide] || activeSlides[0];

  return (
    <div className="w-full max-w-full bg-slate-50 dark:bg-[#0B0F17] min-h-screen pb-3 sm:pb-4 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* IndexedDB & Cache API Offline Catalog Cache Status Banner */}
      {(!isOnline || isOfflineSimulated) && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-3 sm:px-6 py-2 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2 flex-wrap z-40 relative">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>{language === 'en' ? 'Offline Mode Active:' : 'ከመስመር ውጭ ሁነታ፡'}</strong>{' '}
              {language === 'en'
                ? `Browsing & searching ${approvedProducts.length} catalog items saved in IndexedDB cache`
                : `${approvedProducts.length} የካታሎግ ምርቶች ከኢንዴክስድ ዲቢ ካሽ እየታዩ ነው`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <Database className="w-3 h-3 text-amber-600 dark:text-amber-400" /> IndexedDB Catalog Cache
            </span>
          </div>
        </div>
      )}



      {/* 2. DYNAMICALLY SCROLLING HIGH-CONVERSION SALES MARKETING BANNER */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        {slide ? (
          <HeroSalesBanner
            slide={slide}
            activeSlides={activeSlides}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            language={language}
            onOpenProduct={handleOpenProduct}
          />
        ) : (
          /* Fallback static banner */
          <div className="relative bg-[#0e59e5] dark:bg-blue-950 text-white rounded-2xl sm:rounded-3xl overflow-hidden h-[300px] sm:h-[350px] flex items-center p-6 sm:p-10 shadow-lg border border-blue-500/20 group">
            <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-80 h-80 rounded-full bg-blue-400/25 filter blur-3xl pointer-events-none" />
            <div className="max-w-xl space-y-3 text-left relative z-10">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight font-sans">
                {language === 'en' ? 'Welcome to Kasma Shop' : 'እንኳን ወደ ካስማ ሾፕ በደህና መጡ'}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100">
                {language === 'en' ? 'Premium high-fidelity gaming headsets, gadgets, smartphones, and secure checkout.' : 'ምርጥ ጥራት ያላቸው የጌሚንግ ማዳመጫዎች፣ ዘመናዊ ስልኮች እና አስተማማኝ ግብይት።'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modular Responsive Category Navigation Bar */}
      <CategoryNavSection
        approvedProducts={approvedProducts}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isCategoriesExpanded={isCategoriesExpanded}
        setIsCategoriesExpanded={setIsCategoriesExpanded}
        language={language}
      />



      {/* Modular Kasma Lightning Flash Deals Section */}
      <FlashDealsSection
        approvedProducts={approvedProducts}
        flashDeals={flashDeals}
        flashTimeLeft={flashTimeLeft}
        language={language}
        favorites={favorites}
        comparedProductIds={comparedProductIds}
        onToggleFavorite={handleToggleFavorite}
        onToggleCompare={handleToggleCompare}
        onOpenProduct={handleOpenProduct}
        onQuickView={handleOpenQuickBuy}
        onAddToCart={addToCart}
        onInstantBuy={handleInstantBuy}
        showToast={showToast}
        onOpenFlashDeals={() => setIsFlashDealsOpen(true)}
      />

      {/* Recommended for You Personalized Section with Contextual Reasons */}
      {recommendedProductsWithReasons.length > 0 && (
        <section className="max-w-[1440px] mx-auto w-full px-2.5 xs:px-3 sm:px-6 lg:px-8 mt-12 lg:mt-16">
          {/* Unified SectionHeader */}
          <SectionHeader
            titleEn="Recommended For You"
            titleAm="ለእርስዎ የተመረጡ"
            subtitleEn="Personalized selections based on your browsing and purchase preferences."
            subtitleAm="በእርስዎ ምርጫዎች እና ፍላጎት ላይ ተመስርተው የተመረጡ።"
            language={language}
            onViewAll={() => {
              setSelectedCategory('all');
              const el = document.getElementById('products-grid-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            viewAllText={language === 'en' ? 'View all' : 'ሁሉንም እይ'}
          />

          {/* Safe-Zone Adaptive Grid: 2 columns on mobile, 4 columns on desktop (matches Explore section) */}
          <GridContainer cols="auto-fill" gap="normal">
            {recommendedProductsWithReasons.slice(0, 4).map((recItem) => {
              const p = recItem.product;
              const isFavorite = favorites.includes(p.id);
              const isCompared = comparedProductIds.includes(p.id);

              return (
                <ProductCard
                  key={`rec-${p.id}`}
                  product={p}
                  language={language}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  isCompared={isCompared}
                  onToggleCompare={handleToggleCompare}
                  onOpenProduct={handleOpenQuickBuy}
                  onQuickView={handleOpenQuickBuy}
                  onAddToCart={addToCart}
                  onInstantBuy={handleInstantBuy}
                  showToast={showToast}
                  badgeColor="indigo"
                  layout="grid"
                  className="w-full h-full"
                />
              );
            })}
          </GridContainer>
        </section>
      )}

      {/* RECENTLY VIEWED SECTION - STORES LAST 5 CLICKED PRODUCTS */}
      {recentlyViewedProducts.length > 0 && (
        <section id="recently-viewed-section" className="max-w-[1440px] mx-auto w-full px-2.5 xs:px-3 sm:px-6 lg:px-8 mt-12 lg:mt-16">
          {/* Unified SectionHeader */}
          <SectionHeader
            titleEn="Recently Viewed"
            titleAm="በቅርቡ የታዩ እቃዎች"
            subtitleEn="The last items you inspected. Easily revisit your items of interest."
            subtitleAm="በቅርቡ የተመለከቷቸው ምርቶች። ፍላጎት ያሳዩባቸውን እቃዎች በፍጥነት ይመልከቱ።"
            language={language}
            badge={
              <span className="bg-[#0052FF] text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                {recentlyViewedProducts.length}
              </span>
            }
            onViewAll={() => {
              setSelectedCategory('all');
              const el = document.getElementById('products-grid-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            viewAllText={language === 'en' ? 'View all' : 'ሁሉንም እይ'}
            rightContent={
              <button
                type="button"
                onClick={handleClearRecentlyViewed}
                className="text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-zinc-800 shrink-0 shadow-2xs hover:border-red-200"
                title={language === 'en' ? 'Clear recently viewed items history' : 'የታዩ እቃዎችን ታሪክ አጽዳ'}
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500" />
                <span className="hidden xs:inline">{language === 'en' ? 'Clear History' : 'ታሪክ አጽዳ'}</span>
              </button>
            }
          />

          {/* Safe-Zone Adaptive Grid: 2 columns on mobile, 4 columns on desktop (matches Explore section) */}
          <GridContainer cols="auto-fill" gap="normal">
            {recentlyViewedProducts.slice(0, 4).map((p) => {
              const isFavorite = favorites.includes(p.id);
              const isCompared = comparedProductIds.includes(p.id);

              return (
                <ProductCard
                  key={`recently-viewed-${p.id}`}
                  product={p}
                  language={language}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  isCompared={isCompared}
                  onToggleCompare={handleToggleCompare}
                  onOpenProduct={handleOpenQuickBuy}
                  onQuickView={handleOpenQuickBuy}
                  onAddToCart={addToCart}
                  onInstantBuy={handleInstantBuy}
                  showToast={showToast}
                  badgeColor="blue"
                  layout="grid"
                  className="w-full h-full"
                />
              );
            })}
          </GridContainer>
        </section>
      )}

      {/* 5. DYNAMIC SPOTLIGHT & DEALS HUBS - 4 AUTO-SCROLL CAROUSELS */}
      <div id="spotlight-carousels-section" className="max-w-[1440px] mx-auto w-full px-2.5 xs:px-3 sm:px-6 lg:px-8 mt-12 lg:mt-16 space-y-12 lg:space-y-16">

  {/* Carousel 1: Trending Tech & Editor's Choice */}
  <AutoCarousel
    titleEn="Trending Tech & Editor's Choice"
    titleAm="ተወዳጅ የቴክኖሎጂ ምርጫዎች"
    subtitleEn="Hand-picked premium electronics and top-rated gadgets highly recommended by our specialists."
    subtitleAm="በባለሙያዎቻችን በከፍተኛ ሁኔታ የተመከሩ እና ተወዳጅነት ያተረፉ ዘመናዊ መሣሪያዎች።"
    products={approvedProducts.filter(p => ['p2', 'p3', 'p8', 'p5'].includes(p.id))}
    badgeColor="indigo"
    badgeTextEn="TRENDING"
    badgeTextAm="ተወዳጅ"
    onProductClick={handleOpenQuickBuy}
    favorites={favorites}
    onToggleFavorite={handleToggleFavorite}
    comparedProductIds={comparedProductIds}
    onToggleCompare={handleToggleCompare}
    language={language}
    autoScrollInterval={6500}
    onAddToCart={addToCart}
    showToast={showToast}
    onViewAll={() => {
      setSelectedCategory('all');
      const el = document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }}
  />

  {/* Carousel 2: New Items */}
  <AutoCarousel
    titleEn="Just Arrived / New Items"
    titleAm="አዲስ የገቡ ምርቶች"
    subtitleEn="Explore the absolute latest arrivals in our high-fidelity electronics catalog."
    subtitleAm="በቅርቡ የገቡ ዘመናዊ የቴክኖሎጂ ምርቶችን እና እቃዎችን ይመርምሩ።"
    products={approvedProducts.filter(p => ['p4', 'p6', 'p9', 'p5'].includes(p.id))}
    badgeColor="indigo"
    badgeTextEn="NEW"
    badgeTextAm="አዲስ"
    onProductClick={handleOpenQuickBuy}
    favorites={favorites}
    onToggleFavorite={handleToggleFavorite}
    comparedProductIds={comparedProductIds}
    onToggleCompare={handleToggleCompare}
    language={language}
    autoScrollInterval={7000}
    onAddToCart={addToCart}
    showToast={showToast}
    onViewAll={() => {
      setSelectedCategory('all');
      setSortBy('newest');
      const el = document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }}
  />

  {/* Carousel 3: Weekly Deals */}
  <AutoCarousel
    titleEn="Amazing Weekly Specials"
    titleAm="የሳምንቱ ምርጥ ቅናሾች"
    subtitleEn="Specially curated packages with high ratings and extended warranty terms."
    subtitleAm="ከፍተኛ ግምገማ እና አስተማማኝ ዋስትና ያላቸው ለየት ያሉ የሳምንቱ ምርጫዎች።"
    products={approvedProducts.filter(p => ['p1', 'p7', 'p2', 'p8'].includes(p.id))}
    badgeColor="blue"
    badgeTextEn="WEEKLY"
    badgeTextAm="የሳምንቱ"
    onProductClick={handleOpenQuickBuy}
    favorites={favorites}
    onToggleFavorite={handleToggleFavorite}
    comparedProductIds={comparedProductIds}
    onToggleCompare={handleToggleCompare}
    language={language}
    autoScrollInterval={7500}
    onAddToCart={addToCart}
    showToast={showToast}
    onViewAll={() => setIsFlashDealsOpen(true)}
  />

  {/* Carousel 4: Top Sold & Daily Bestsellers */}
  <AutoCarousel
    titleEn="Top Sold & Daily Bestsellers"
    titleAm="በብዛት የተሸጡ እና ተወዳጅ ምርቶች"
    subtitleEn="Most wanted high-demand tech items flying off the shelves this week."
    subtitleAm="በዚህ ሳምንት በብዛት የተሸጡ እና በደንበኞች ዘንድ ተወዳጅነት ያተረፉ እቃዎች።"
    products={approvedProducts.filter(p => ['p3', 'p1', 'p5', 'p9'].includes(p.id))}
    badgeColor="green"
    badgeTextEn="BEST SELLER"
    badgeTextAm="በብዛት የተሸጠ"
    onProductClick={handleOpenQuickBuy}
    favorites={favorites}
    onToggleFavorite={handleToggleFavorite}
    comparedProductIds={comparedProductIds}
    onToggleCompare={handleToggleCompare}
    language={language}
    autoScrollInterval={6500}
    onAddToCart={addToCart}
    showToast={showToast}
    onViewAll={() => {
      setSelectedCategory('all');
      setSortBy('default');
      const el = document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }}
  />

</div>

      {/* Modular Middle Promo Banners Section */}
      <PromoBannersSection
        approvedProducts={approvedProducts}
        language={language}
        onOpenProduct={handleOpenProduct}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Modular Catalog Filter, Sort & Product Grid Section */}
      <CatalogSection
        language={language}
        isCustomerLoggedIn={isCustomerLoggedIn}
        onOpenOrderStatus={() => {
          setHasSearchedOrder(false);
          setTrackedOrder(null);
          setTrackOrderId('');
          setIsOrderStatusOpen(true);
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        sortedAndFilteredProducts={sortedAndFilteredProducts}
        paginatedProducts={paginatedProducts}
        approvedProducts={approvedProducts}
        isAdvancedFilterOpen={isAdvancedFilterOpen}
        setIsAdvancedFilterOpen={setIsAdvancedFilterOpen}
        setFilterSectionFocus={setFilterSectionFocus}
        activeFiltersCount={activeFiltersCount}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        availableBrands={availableBrands}
        minPriceInput={minPriceInput}
        setMinPriceInput={setMinPriceInput}
        maxPriceInput={maxPriceInput}
        setMaxPriceInput={setMaxPriceInput}
        maxProductPriceInCatalog={maxProductPriceInCatalog}
        selectedRatingFilter={selectedRatingFilter}
        setSelectedRatingFilter={setSelectedRatingFilter}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleClearAllFilters={handleClearAllFilters}
        isGridLoading={isGridLoading}
        isLoadingMore={isLoadingMore}
        visibleProductCount={visibleProductCount}
        scrollSentinelRef={scrollSentinelRef}
        favorites={favorites}
        comparedProductIds={comparedProductIds}
        onToggleFavorite={handleToggleFavorite}
        onToggleCompare={handleToggleCompare}
        onOpenQuickBuy={handleOpenQuickBuy}
        onAddToCart={addToCart}
        onInstantBuy={handleInstantBuy}
        showToast={showToast}
      />

      {/* Modular Product Detail Modal */}
      <ProductDetailModal
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        language={language}
        categories={categories}
        searchQuery={searchQuery}
        highlightText={highlightText}
        comparedProductIds={comparedProductIds}
        onToggleCompare={handleToggleCompare}
        onShareProduct={(p) => setSharingProduct(p)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        activeGalleryIndex={activeGalleryIndex}
        setActiveGalleryIndex={setActiveGalleryIndex}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        selectedDeliveryArea={selectedDeliveryArea}
        setSelectedDeliveryArea={setSelectedDeliveryArea}
        getProductRatingInfo={getProductRatingInfo}
        addToCart={addToCart}
        setIsCartOpen={setIsCartOpen}
        handleInstantBuy={handleInstantBuy}
        fbtProducts={fbtProducts}
        fbtSelectedIds={fbtSelectedIds}
        setFbtSelectedIds={setFbtSelectedIds}
        addBundleToCart={addBundleToCart}
        allOrders={allOrders}
        onAddOrder={onAddOrder}
        showToast={showToast}
        reviewError={reviewError}
        handleReviewSubmit={handleReviewSubmit}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        revName={revName}
        setRevName={setRevName}
        revPhone={revPhone}
        setRevPhone={setRevPhone}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        reviewPhotoUrl={reviewPhotoUrl}
        setReviewPhotoUrl={setReviewPhotoUrl}
        isSubmittingReview={isSubmittingReview}
        localQaMap={localQaMap}
        handleQuestionSubmit={handleQuestionSubmit}
        newQuestionAskedBy={newQuestionAskedBy}
        setNewQuestionAskedBy={setNewQuestionAskedBy}
        newQuestionText={newQuestionText}
        setNewQuestionText={setNewQuestionText}
        activeReviewPhotoModal={activeReviewPhotoModal}
        setActiveReviewPhotoModal={setActiveReviewPhotoModal}
      />

      {/* Modular Quick View / Quick Purchase Modal */}
      <QuickBuyModal
        product={quickBuyProduct}
        onClose={() => setQuickBuyProduct(null)}
        language={language}
        getProductRatingInfo={getProductRatingInfo}
        comparedProductIds={comparedProductIds}
        onToggleCompare={handleToggleCompare}
        onShareProduct={(p) => setSharingProduct(p)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={(p, v, qty) => addToCart(p, v, qty)}
        onInstantBuy={(p, v, qty) => {
          addToCart(p, v, qty);
          setIsCartOpen(true);
        }}
        onOpenProduct={handleOpenProduct}
        showToast={showToast}
      />

{/* Modular Cart Modal */ }
<CartModal
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  cart={cart}
  language={language}
  removingSkus={removingSkus}
  recentlyAddedSkus={recentlyAddedSkus}
  recentlyUpdatedSku={recentlyUpdatedSku}
  onRemoveFromCart={handleRemoveFromCart}
  onUpdateCartQty={updateCartQty}
  onOpenShareCart={() => setIsShareCartModalOpen(true)}
  onOpenCheckout={() => {
    setIsCartOpen(false);
    if (!isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  }}
  cartSubtotal={cartSubtotal}
  cartTotal={cartTotal}
  shippingFee={shippingFee}
  activeDiscount={activeDiscount}
  promoCodeInput={promoCodeInput}
  setPromoCodeInput={setPromoCodeInput}
  promoError={promoError}
  setPromoError={setPromoError}
  promoSuccessMessage={promoSuccessMessage}
  appliedPromo={appliedPromo}
  promoCodes={promoCodes}
  onApplyPromo={handleApplyPromo}
  onRemovePromo={handleRemovePromo}
  showToast={showToast}
  approvedProducts={approvedProducts}
  onAddToCart={addToCart}
/>

{/* Modular Wishlist Modal */ }
<WishlistModal
  isOpen={isWishlistOpen}
  onClose={() => setIsWishlistOpen(false)}
  favorites={favorites}
  products={products}
  language={language}
  cart={cart}
  setCart={setCart}
  setFavorites={setFavorites}
  setRecentlyAddedSkus={setRecentlyAddedSkus}
  onOpenProduct={(p) => {
    if (setSelectedProduct) setSelectedProduct(p);
  }}
  onAddToCart={(p, v) => addToCart(p, v)}
  onToggleFavorite={handleToggleFavorite}
  onOpenCart={() => setIsCartOpen(true)}
  showToast={showToast}
/>

{/* Modular Price Alerts Modal */ }
<PriceAlertsModal
  isOpen={isPriceAlertsOpen}
  onClose={() => setIsPriceAlertsOpen(false)}
  priceAlerts={priceAlerts}
  products={products}
  language={language}
  onUpdateThresholdPrice={handleUpdateThresholdPrice}
  onTogglePriceAlert={handleTogglePriceAlert}
  onOpenProduct={handleOpenProduct}
/>

      {/* Modular Checkout & Ethiopian Payment Gateway Modal */}
      <CheckoutGatewayModal
        isOpen={isCheckoutOpen}
        language={language}
        paymentStep={paymentStep}
        setPaymentStep={setPaymentStep}
        closeCheckoutFlow={closeCheckoutFlow}
        handleCheckoutSubmit={handleCheckoutSubmit}
        cart={cart}
        cartSubtotal={cartSubtotal}
        cartTotal={cartTotal}
        activeDiscount={activeDiscount}
        appliedPromo={appliedPromo}
        shippingFee={shippingFee}
        paymentApiError={paymentApiError}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        customerEmail={customerEmail}
        selectedSubCity={selectedSubCity}
        setSelectedSubCity={setSelectedSubCity}
        customerLandmark={customerLandmark}
        setCustomerLandmark={setCustomerLandmark}
        shippingAddress={shippingAddress}
        setShippingAddress={setShippingAddress}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        merchantTelegramConfirmed={merchantTelegramConfirmed}
        setMerchantTelegramConfirmed={setMerchantTelegramConfirmed}
        isInitializingPayment={isInitializingPayment}
        gatewayPaymentTab={gatewayPaymentTab}
        setGatewayPaymentTab={setGatewayPaymentTab}
        activePaymentSession={activePaymentSession}
        qrReferenceTx={qrReferenceTx}
        copiedQrLink={copiedQrLink}
        setCopiedQrLink={setCopiedQrLink}
        selectedBank={selectedBank}
        setSelectedBank={setSelectedBank}
        paymentScreenshot={paymentScreenshot}
        setPaymentScreenshot={setPaymentScreenshot}
        paymentScreenshotName={paymentScreenshotName}
        setPaymentScreenshotName={setPaymentScreenshotName}
        handleScreenshotFileChange={handleScreenshotFileChange}
        handleUseDemoScreenshot={handleUseDemoScreenshot}
        bankReference={bankReference}
        setBankReference={setBankReference}
        completeOrder={completeOrder}
        isProcessingPayment={isProcessingPayment}
        handleVerifyPaymentApi={handleVerifyPaymentApi}
        telebirrOtp={telebirrOtp}
        setTelebirrOtp={setTelebirrOtp}
        handleVerifyOtp={handleVerifyOtp}
        lastPlacedOrderId={lastPlacedOrderId}
        lastPlacedOrder={lastPlacedOrder}
        allOrders={allOrders}
        setTrackOrderId={setTrackOrderId}
        setTrackedOrder={setTrackedOrder}
        setHasSearchedOrder={setHasSearchedOrder}
        setIsCheckoutOpen={setIsCheckoutOpen}
        setIsOrderStatusOpen={setIsOrderStatusOpen}
        setIsMyOrdersOpen={setIsMyOrdersOpen}
        showToast={showToast}
      />

      {/* Modular Order Status Tracking Modal */}
      <OrderStatusModal
        isOpen={isOrderStatusOpen}
        onClose={() => setIsOrderStatusOpen(false)}
        language={language}
        trackOrderId={trackOrderId}
        setTrackOrderId={setTrackOrderId}
        allOrders={allOrders}
        offlineOrders={offlineOrders}
        trackedOrder={trackedOrder}
        setTrackedOrder={setTrackedOrder}
        hasSearchedOrder={hasSearchedOrder}
        setHasSearchedOrder={setHasSearchedOrder}
        handleUpdateTrackedOrderStatus={handleUpdateTrackedOrderStatus}
        onForceSync={onForceSync}
        isSyncing={isSyncing}
      />

{/* Floating Product Comparison Bar */ }
{
  comparedProductIds.length > 0 && (
    <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-2xl z-40 flex items-center gap-3 sm:gap-5 max-w-lg w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2.5">
        <div className="bg-kasma-blue text-white p-2 rounded-xl shrink-0">
          <GitCompare className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider">
            {language === 'en' ? 'Product Comparison' : 'ምርቶች ማነጻጸሪያ'}
          </h4>
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500">
            {language === 'en'
              ? `${comparedProductIds.length} of 3 items selected`
              : `${comparedProductIds.length} ከ 3 ምርቶች ተመርጠዋል`}
          </p>
        </div>
      </div>

      <div className="flex -space-x-2 shrink-0 overflow-hidden">
        {comparedProductIds.map(pId => {
          const prod = products.find(p => p.id === pId);
          if (!prod) return null;
          return (
            <div key={pId} className="w-8 h-8 rounded-full border border-white dark:border-zinc-900 overflow-hidden relative group shrink-0">
              <img src={prod.image} alt={prod.nameEn} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <button
                onClick={() => setComparedProductIds(comparedProductIds.filter(id => id !== pId))}
                className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black cursor-pointer"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2.5 ml-auto shrink-0 items-center">
        <button
          onClick={() => setComparedProductIds([])}
          className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer"
        >
          {language === 'en' ? 'Clear' : 'አጽዳ'}
        </button>
        <button
          onClick={() => setIsCompareModalOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <span>{language === 'en' ? 'Compare' : 'አነጻጽር'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

      {/* Modular Side-by-Side Product Comparison Modal */}
      <ProductCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparedProductIds={comparedProductIds}
        setComparedProductIds={setComparedProductIds}
        products={products}
        categories={categories}
        language={language}
        getProductRatingInfo={getProductRatingInfo}
        addToCart={addToCart}
        handleOpenProduct={handleOpenProduct}
      />

{/* Floating Toast Notification Feed */ }
<div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-5 z-[9999] flex flex-col gap-2 max-w-sm w-auto pointer-events-none">
  {toasts.map(t => (
    <div
      key={t.id}
      className={`p-4 rounded-xl border shadow-xl flex items-center justify-between text-xs pointer-events-auto transition-all duration-300 transform translate-x-0 ${t.type === 'success'
        ? 'bg-zinc-950 border-zinc-800 text-white'
        : t.type === 'warning'
          ? 'bg-white border-zinc-200 text-zinc-900 font-semibold'
          : 'bg-zinc-50 border-zinc-200 text-zinc-900'
        }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">
          {t.type === 'success' ? '✓' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <p className="font-medium leading-relaxed">{t.message}</p>
      </div>
      <button
        onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
        className="ml-3 font-bold hover:opacity-80 opacity-50 shrink-0 cursor-pointer"
      >
        ✕
      </button>
    </div>
  ))}
</div>

{/* REAL TRANSACTION PRIVACY-SAFE COMPACT POPUP */ }
<AnimatePresence>
  {activeSocialProof && activeSocialProof.show && (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed bottom-[76px] sm:bottom-6 left-3.5 sm:left-6 z-30 max-w-[260px] sm:max-w-[280px] w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-900 dark:text-white rounded-xl border border-gray-200/90 dark:border-zinc-800 shadow-lg p-2.5 sm:p-3 space-y-1 text-left"
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] leading-none">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{language === 'en' ? 'Someone just purchased' : 'አንድ ደንበኛ ገዝቷል'}</span>
        </div>
        <button
          onClick={() => setActiveSocialProof(prev => prev ? { ...prev, show: false } : null)}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-[11px] font-bold p-0.5 cursor-pointer leading-none shrink-0"
          title={language === 'en' ? 'Close' : 'ዝጋ'}
        >
          ✕
        </button>
      </div>

      <div className="font-bold text-[11px] text-gray-900 dark:text-white leading-tight truncate">
        {activeSocialProof.item}
      </div>

      <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono font-medium leading-none">
        {activeSocialProof.timeAgo}
      </div>
    </motion.div>
  )}
</AnimatePresence>

{/* My Orders Modal View */ }
<MyOrdersView
  orders={orders}
  offlineOrders={offlineOrders}
  language={language}
  isOpen={isMyOrdersOpen}
  onClose={() => setIsMyOrdersOpen(false)}
  onAddToCart={addToCart}
  onUpdateOrderStatus={handleUpdateTrackedOrderStatus}
  customerPhone={customerPhone}
  showToast={showToast}
/>

{/* Dedicated Flash Deals & Offers Hub Modal View */ }
<FlashDealsView
  isOpen={isFlashDealsOpen}
  onClose={() => setIsFlashDealsOpen(false)}
  products={approvedProducts}
  language={language}
  flashTimeLeft={flashTimeLeft}
  simulatedClaimedQty={simulatedClaimedQty}
  favorites={favorites}
  onToggleFavorite={handleToggleFavorite}
  comparedProductIds={comparedProductIds}
  onToggleCompare={handleToggleCompare}
  onOpenProduct={handleOpenProduct}
  onAddToCart={addToCart}
  showToast={showToast}
  flashDeals={flashDeals}
/>

      {/* Modular Share Cart Modal */}
      <ShareCartModal
        isOpen={isShareCartModalOpen}
        onClose={() => setIsShareCartModalOpen(false)}
        cart={cart}
        language={language}
        showToast={showToast}
      />

      {/* Modular Recommendation Intelligence Signals Modal */}
      <SignalsModal
        isOpen={isSignalsModalOpen}
        onClose={() => setIsSignalsModalOpen(false)}
        language={language}
        recommendationSignalCounts={recommendationSignalCounts}
      />

{/* Floating WhatsApp Support Button with Delayed Fade-in & Optimized Clearance */ }
<AnimatePresence>
  {showWhatsAppButton && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed bottom-[72px] sm:bottom-6 right-3.5 sm:right-6 z-30 group"
    >
      <a
        href={generateWhatsAppCustomerWelcomeUrl(cart, language)}
        target="_blank"
        rel="noopener noreferrer"
        className="relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 sm:p-3 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        title={language === 'en' ? 'Chat on WhatsApp (Cart Auto-Attached)' : 'በዋትስአፕ ያወሩን (የጋሪ እቃዎች የተያያዙ)'}
      >
        <MessageCircle className="w-5 h-5 fill-current shrink-0 relative z-10" />

        {/* Active Cart Items Badge */}
        {cart && cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-2xs z-20">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </span>
        )}

        {/* Hover Tooltip Capsule */}
        <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-gray-950/90 dark:bg-zinc-800/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl border border-white/10 flex items-center gap-1.5">
          <span>{language === 'en' ? 'WhatsApp Support' : 'የዋትስአፕ ድጋፍ'}</span>
          {cart && cart.length > 0 && (
            <span className="bg-emerald-500/30 text-emerald-300 text-[8.5px] px-1 py-0.5 rounded-md font-mono">
              {cart.length} {language === 'en' ? 'item(s)' : 'እቃዎች'}
            </span>
          )}
        </div>
      </a>
    </motion.div>
  )}
</AnimatePresence>

{/* Checkout Authentication Barrier Modal */ }
<CheckoutAuthModal
  isOpen={isAuthModalOpen}
  onClose={() => setIsAuthModalOpen(false)}
  onSuccess={() => {
    setIsAuthModalOpen(false);
    setIsCheckoutOpen(true);
  }}
/>

{/* Product Share Modal */ }
<ShareProductModal
  product={sharingProduct}
  isOpen={!!sharingProduct}
  onClose={() => setSharingProduct(null)}
  language={language}
  showToast={showToast}
/>

    </div >
  );
}

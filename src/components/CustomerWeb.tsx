import React, { useState, useEffect } from 'react';
import { SUB_CITIES, SubCityOption } from '../constants/locations';
export { SUB_CITIES, type SubCityOption };

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
}





interface SpecDetail {
  labelEn: string;
  labelAm: string;
  valueEn: string;
  valueAm: string;
}

function getProductSpecs(p: Product): SpecDetail[] {
  switch (p.id) {
    case 'p1':
      return [
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Unlimited (Hot-Swap dual battery)', valueAm: 'ያልተገደበ (ሁለት ባትሪ መቀያየሪያ ያለው)' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: '2.4GHz Wireless & Bluetooth 5.0 Dual', valueAm: '2.4GHz ገመድ አልባ እና ብሉቱዝ 5.0' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '339g', valueAm: '339 ግራም' },
        { labelEn: 'Drivers', labelAm: 'ድምፅ ማጉያ', valueEn: '40mm Neodymium Drivers', valueAm: '40ሚሜ ኒዮዲሚየም ድራይቨሮች' },
        { labelEn: 'Active Noise Cancellation', labelAm: 'የውጭ ድምፅ መከላከያ', valueEn: 'Yes (4-mic hybrid)', valueAm: 'አለው (ባለ 4-ማይክ ዲቃላ)' }
      ];
    case 'p2':
      return [
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Up to 24 hours (with case)', valueAm: 'እስከ 24 ሰዓት (ከቻርጅ ማድረጊያው ጋር)' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: 'Bluetooth 5.3 (Multipoint)', valueAm: 'ብሉቱዝ 5.3 (ብዙ መሳሪያዎች በአንድ ጊዜ)' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '5.9g (per earbud)', valueAm: '5.9 ግራም (እያንዳንዱ)' },
        { labelEn: 'Water Resistance', labelAm: 'የውሃ መከላከያ', valueEn: 'IPX4 Splash-proof', valueAm: 'IPX4 የውሃ መርጨት መቋቋም' },
        { labelEn: 'Active Noise Cancellation', labelAm: 'የውጭ ድምፅ መከላከያ', valueEn: 'Yes (Dual Processor V2)', valueAm: 'አለው (ባለ ሁለት ፕሮሰሰር V2)' }
      ];
    case 'p3':
      return [
        { labelEn: 'Display', labelAm: 'ማሳያ', valueEn: 'Retina LTPO OLED (3000 nits)', valueAm: 'ሬቲና OLED (3000 ኒትስ)' },
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Up to 36 hours (72 hours in low power)', valueAm: 'እስከ 36 ሰዓት (በሃይል ቆጣቢ 72 ሰዓት)' },
        { labelEn: 'Water Resistance', labelAm: 'የውሃ መከላከያ', valueEn: '100m Water Resistant, IP6X dust', valueAm: '100 ሜትር ውሃ መቋቋም፣ IP6X አቧራ መከላከያ' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '61.4g', valueAm: '61.4 ግራም' },
        { labelEn: 'Sensing/Health', labelAm: 'የጤና መከታተያ', valueEn: 'ECG, Blood Oxygen, Temp, Depth', valueAm: 'የልብ ምት፣ የደም ኦክስጅን፣ ሙቀት፣ ጥልቀት' }
      ];
    case 'p4':
      return [
        { labelEn: 'Power Output', labelAm: 'የኃይል መጠን', valueEn: '80 Watts (Class D amplifier)', valueAm: '80 ዋት (ክፍል D ድምፅ ማጉያ)' },
        { labelEn: 'Frequency Range', labelAm: 'የሞገድ ክልል', valueEn: '47–20,000 Hz', valueAm: '47-20,000 ኸርትዝ' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: 'Bluetooth 5.2, RCA, 3.5mm Aux', valueAm: 'ብሉቱዝ 5.2፣ RCA፣ 3.5ሚሜ Aux' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '4.25 kg', valueAm: '4.25 ኪሎግራም' },
        { labelEn: 'Mains Voltage', labelAm: 'ቮልቴጅ', valueEn: '100–240 V (A/C Power)', valueAm: '100–240 ቮልት (ኤሌክትሪክ ያስፈልገዋል)' }
      ];
    case 'p5':
      return [
        { labelEn: 'Resolution', labelAm: 'ጥራት', valueEn: '4K Ultra HD (8 Megapixel)', valueAm: '4K አልትራ HD (8 ሜጋፒክስል)' },
        { labelEn: 'Night Vision', labelAm: 'የምሽት እይታ', valueEn: 'Color night vision up to 30m', valueAm: 'የሌሊት ባለቀለም ምስል እስከ 30 ሜትር' },
        { labelEn: 'Water Resistance', labelAm: 'የውሃ መከላከያ', valueEn: 'IP66 Weather-proof', valueAm: 'IP66 የአየር ሁኔታ መቋቋም' },
        { labelEn: 'PTZ Range', labelAm: 'የመዞር ክልል', valueEn: '350° Pan, 90° Tilt, 5x Digital Zoom', valueAm: '350° መዞር፣ 90° ማዘንበል፣ 5x ማጉላት' },
        { labelEn: 'AI Capability', labelAm: 'የAI ብቃት', valueEn: 'Human & Vehicle Smart Tracking', valueAm: 'ሰው እና ተሽከርካሪን የመለየት ብቃት' }
      ];
    case 'p6':
      return [
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Up to 24 hours', valueAm: 'እስከ 24 ሰዓት' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: 'Bluetooth 5.3 (Multipoint support)', valueAm: 'ብሉቱዝ 5.3 (ብዙ ማገናኛ ያለው)' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '250g', valueAm: '250 ግራም' },
        { labelEn: 'Active Noise Cancellation', labelAm: 'የውጭ ድምፅ መከላከያ', valueEn: 'Yes (CustomTune Technology)', valueAm: 'አለው (CustomTune ቴክኖሎጂ)' },
        { labelEn: 'Spatial Audio', labelAm: 'ቦታ ኦዲዮ', valueEn: 'Bose Immersive Audio', valueAm: 'ቦስ እውነተኛ የድምፅ ስርጭት' }
      ];
    case 'p7':
      return [
        { labelEn: 'Processor', labelAm: 'ፕሮሰሰር', valueEn: 'Snapdragon 8 Gen 3 for Galaxy', valueAm: 'Snapdragon 8 Gen 3 ለጋላክሲ' },
        { labelEn: 'Display', labelAm: 'ማሳያ', valueEn: '6.8" Dynamic AMOLED 2X (120Hz)', valueAm: '6.8 ኢንች ዳይናሚክ AMOLED 2X (120Hz)' },
        { labelEn: 'Camera', labelAm: 'ካሜራ', valueEn: '200MP Main + 50MP + 12MP + 10MP Quad', valueAm: '200MP ዋና + 50MP + 12MP + 10MP አራት' },
        { labelEn: 'Battery', labelAm: 'ባትሪ', valueEn: '5000 mAh with 45W Fast Charging', valueAm: '5000 mAh ከ 45W ፈጣን ቻርጅ ጋር' },
        { labelEn: 'S-Pen Support', labelAm: 'ኤስ-ፔን', valueEn: 'Yes, Included (Built-in)', valueAm: 'አለው፣ አብሮ የተሰራ' }
      ];
    case 'p8':
      return [
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Up to 30 hours (with case)', valueAm: 'እስከ 30 ሰዓት (ከቻርጅ ማድረጊያው ጋር)' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: 'Bluetooth 5.4, Auracast, LE Audio', valueAm: 'ብሉቱዝ 5.4፣ Auracast፣ LE Audio' },
        { labelEn: 'Audio Codecs', labelAm: 'የድምጽ ኮዴክ', valueEn: 'aptX Adaptive, AAC, SBC, LC3', valueAm: 'aptX Adaptive, AAC, SBC, LC3' },
        { labelEn: 'Water Resistance', labelAm: 'የውሃ መከላከያ', valueEn: 'IP54 Dust & Splash-resistant', valueAm: 'IP54 አቧራ እና ውሃ መርጨት መቋቋም' },
        { labelEn: 'Active Noise Cancellation', labelAm: 'የውጭ ድምፅ መከላከያ', valueEn: 'Yes (Adaptive hybrid ANC)', valueAm: 'አለው (ተስማሚ ዲቃላ ANC)' }
      ];
    case 'p9':
      return [
        { labelEn: 'Capacity', labelAm: 'አቅም', valueEn: '20,000 mAh', valueAm: '20,000 ሚሊአምፔር ሰዓት' },
        { labelEn: 'Total Power Output', labelAm: 'የኃይል መጠን', valueEn: '200W Maximum Rapid Charging', valueAm: '200W ከፍተኛ ፈጣን ኃይል መሙያ' },
        { labelEn: 'Display', labelAm: 'ማሳያ', valueEn: 'Smart Digital Display (Watts, %)', valueAm: 'ስማርት ዲጂታል ማሳያ (ዋትስ፣ %)' },
        { labelEn: 'Input/Output Ports', labelAm: 'የመግቢያና መውጫ ፖርቶች', valueEn: '2x USB-C, 1x USB-A', valueAm: '2x USB-C, 1x USB-A' },
        { labelEn: 'Protection', labelAm: 'ደህንነት ጥበቃ', valueEn: 'ActiveShield 2.0 temperature monitoring', valueAm: 'ActiveShield 2.0 የሙቀት መቆጣጠሪያ' }
      ];
    default:
      return [
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: 'Compact / Lightweight', valueAm: 'ቀላል / ተንቀሳቃሽ' },
        { labelEn: 'Warranty', labelAm: 'ዋስትና', valueEn: '1-Year Local Warranty', valueAm: 'የ 1 ዓመት የአገር ውስጥ ዋስትና' },
        { labelEn: 'Quality Stamp', labelAm: 'የጥራት ደረጃ', valueEn: 'Verified Premium', valueAm: 'የተረጋገጠ ምርጥ ጥራት' }
      ];
  }
}

function getProductFeatures(p: Product): string[] {
  switch (p.id) {
    case 'p1':
      return ['Hot-Swappable Dual Battery', 'Multi-System Connection', 'Active Noise Cancellation (ANC)', 'Hi-Res Audio Certified', 'ClearCast Gen 2 Retractable Mic'];
    case 'p2':
      return ['Dynamic Driver X', 'Dual Processor V2 Noise Cancelling', 'Bone Conduction Sensor Calls', 'High-Res Lossless LDAC Codec', '360 Spatial Audio with Head Tracking'];
    case 'p3':
      return ['Military Grade Titanium Build', 'Dual Frequency GPS L1 + L5', 'Up to 36-Hour Battery life', 'ECG Heart Monitoring App', 'Emergency Siren and Fall Detection'];
    case 'p4':
      return ['Marshall Signature Sound Stage', 'Vintage Aesthetics and Brass Accents', 'Dynamic Loudness Sound Balance', 'RCA, AUX & Bluetooth Inputs', 'Sustainable Vegan PVC-Free Build'];
    case 'p5':
      return ['Ultra High Definition 4K Sensors', 'AI Person & Vehicle Auto Tracking', '360° Panoramic Pan and Tilt Rotation', 'Super Bright Color Night Vision LEDs', 'Two-Way Intercom Mic and Speaker'];
    case 'p6':
      return ['CustomTune Audio Adaptation', 'Bose Immersive Spatial Audio', 'World-Class Quiet/Aware Modes', 'Wind Block Active Filtering', 'Premium Leatherette Ultra Comfort Plushes'];
    case 'p7':
      return ['Integrated BLE Stylus S-Pen', 'Pro-Grade 200 Megapixel Quad Lens', 'Galaxy AI Live Call Voice Translator', 'Armor Titanium Heavy Duty Frame', 'Snapdragon 8 Gen 3 for Galaxy Chip'];
    case 'p8':
      return ['Personalized Adaptive ANC', 'Lossless Audio High Fidelity Streaming', 'Auracast & LE Next-Gen Bluetooth 5.4', 'Comfort Fit Sound Isolation Sleeves', 'Dual-Mic Speech Clarity Array'];
    case 'p9':
      return ['200W Combined Power Output', 'Dynamic Status Digital Monitor Screen', 'Ultra Compact Space-saving Build', 'Smart Power Distribution Control', 'ActiveShield 2.0 Temperature Guard'];
    default:
      return ['Original Premium Warranty', 'Verified Secure Dispatch packaging', 'Authenticity Certified Stamps', 'Ethiopian Standard Power Adaptor Included'];
  }
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
  isOnline = navigator.onLine
}: CustomerWebProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
      try { localStorage.setItem('kasma_viewed_products', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  }, []);

  const recordSearchSignal = React.useCallback((query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setRecentSearchesHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try { localStorage.setItem('kasma_recent_searches', JSON.stringify(updated)); } catch (e) {}
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
    if (selectedCategory !== 'all') count++;
    if (searchQuery.trim() !== '') count++;
    if (minPriceInput.trim() !== '') count++;
    if (maxPriceInput.trim() !== '') count++;
    if (selectedBrands.length > 0) count++;
    if (availabilityFilter !== 'ALL') count++;
    if (selectedRatingFilter > 0) count++;
    if (sortBy !== 'default') count++;
    return count;
  }, [selectedCategory, searchQuery, minPriceInput, maxPriceInput, selectedBrands, availabilityFilter, selectedRatingFilter, sortBy]);

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

  // Share Cart feature states & handlers
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
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+2519');
  const [customerLandmark, setCustomerLandmark] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'COD'>('TELEBIRR');
  const [selectedSubCity, setSelectedSubCity] = useState<string>('bole');
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

  // Payment Gateway QR Code State
  const [gatewayPaymentTab, setGatewayPaymentTab] = useState<'QR' | 'DIRECT'>('QR');
  const [copiedQrLink, setCopiedQrLink] = useState(false);
  const [qrReferenceTx, setQrReferenceTx] = useState(() => `KS-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileAuthMode, setProfileAuthMode] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');
  const [isFlashDealsOpen, setIsFlashDealsOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearchedOrder, setHasSearchedOrder] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>('');

  // User Profile & Vault State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('abebe.bikila@kasma.et');
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([
    {
      id: 'addr-1',
      label: 'HOME',
      fullName: 'Abebe Bikila',
      phone: '+251911223344',
      subCity: 'Bole',
      woreda: 'Woreda 03',
      streetAddress: 'Atlas Road, Near Skylight Hotel, House #402',
      isDefault: true
    },
    {
      id: 'addr-2',
      label: 'OFFICE',
      fullName: 'Abebe Bikila (Tech Hub)',
      phone: '+251911223344',
      subCity: 'Kirkos',
      woreda: 'Woreda 01',
      streetAddress: 'Kazanchis Commercial Building, 5th Floor',
      isDefault: false
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([
    {
      id: 'pm-1',
      type: 'TELEBIRR',
      title: 'Primary Telebirr Wallet',
      accountMasked: '+251 911 *** 344',
      encryptedToken: 'enc_aes256_tb_9f82a10c44',
      isDefault: true
    },
    {
      id: 'pm-2',
      type: 'BANK_CARD',
      title: 'CBE Platinum Visa Card',
      accountMasked: '4000 **** **** 8821',
      encryptedToken: 'enc_aes256_cbe_8821a7f0',
      isDefault: false,
      expiryDate: '12/28'
    }
  ]);

  const [kasmaPoints, setKasmaPoints] = useState<number>(1450);
  const [pointsLogs, setPointsLogs] = useState<KasmaPointsLog[]>([
    {
      id: 'pl-1',
      titleEn: 'Earned on Order #KS-8492 (+10% Cashback)',
      titleAm: 'ከተዕዛዝ #KS-8492 የተገኘ ነጥብ (+10% ተመላሽ)',
      points: 250,
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: 'EARNED'
    },
    {
      id: 'pl-2',
      titleEn: 'Welcome Registration Bonus',
      titleAm: 'የእንኳን ደህና መጡ የጉርሻ ነጥብ',
      points: 1200,
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
      type: 'BONUS'
    }
  ]);

  // Profile Handlers
  const handleAddAddress = (addr: Omit<DeliveryAddress, 'id'>) => {
    const newAddr: DeliveryAddress = {
      ...addr,
      id: `addr-${Date.now()}`
    };
    if (newAddr.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    showToast(language === 'en' ? 'Address removed' : 'አድራሻ ተሰርዟል', 'info');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    const found = addresses.find(a => a.id === id);
    if (found) {
      setShippingAddress(`[${found.subCity}] ${found.streetAddress}`);
      setCustomerPhone(found.phone);
      if (found.fullName) setCustomerName(found.fullName);
    }
    showToast(language === 'en' ? 'Default delivery address updated!' : 'ዋና የመድረሻ አድራሻ ተቀይሯል!', 'success');
  };

  const handleAddPaymentMethod = (pm: Omit<SavedPaymentMethod, 'id'>) => {
    const newPm: SavedPaymentMethod = {
      ...pm,
      id: `pm-${Date.now()}`
    };
    if (newPm.isDefault) {
      setPaymentMethods(prev => prev.map(p => ({ ...p, isDefault: false })).concat(newPm));
    } else {
      setPaymentMethods(prev => [...prev, newPm]);
    }
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    showToast(language === 'en' ? 'Payment method removed' : 'የክፍያ መንገድ ተሰርዟል', 'info');
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
    showToast(language === 'en' ? 'Default payment method set' : 'ዋና የክፍያ መንገድ ተዘጋጅቷል', 'success');
  };

  const handleAddPoints = (amount: number, reasonEn: string, reasonAm: string, type: 'EARNED' | 'REDEEMED' | 'BONUS' = 'EARNED') => {
    setKasmaPoints(prev => Math.max(0, prev + amount));
    const newLog: KasmaPointsLog = {
      id: `pl-${Date.now()}`,
      titleEn: reasonEn,
      titleAm: reasonAm,
      points: amount,
      timestamp: new Date().toISOString(),
      type
    };
    setPointsLogs(prev => [newLog, ...prev]);
  };

  const handleRedeemReward = (reward: KasmaPointsReward) => {
    handleAddPoints(-reward.pointsCost, `Redeemed ${reward.titleEn}`, `${reward.titleAm} ተወስዷል`, 'REDEEMED');
    if (appliedPromo === null) {
      setAppliedPromo({
        code: reward.code,
        type: reward.type,
        value: reward.discountValue,
        descriptionEn: reward.titleEn,
        descriptionAm: reward.titleAm
      });
      setPromoCodeInput(reward.code);
      setPromoSuccessMessage(language === 'en' ? `Applied reward code: ${reward.code}` : `የጉርሻ ኮድ ሰርቷል: ${reward.code}`);
    }
  };

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

  // Shopify, Amazon & Jumia-inspired Premium features state
  // 1. Jumia-style Flash Sales Countdown and claimed stats
  const [flashTimeLeft, setFlashTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 4, minutes: 12, seconds: 35 });
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
    // 1. Countdown timer ticker
    const timerInterval = setInterval(() => {
      setFlashTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset countdown to a fresh 6-hour window
          return { hours: 5, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

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
    if (!product.reviews || product.reviews.length === 0) {
      return { avg: 0, count: 0 };
    }
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    return { avg: Number((sum / product.reviews.length).toFixed(1)), count: product.reviews.length };
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
    } catch (e) {}
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
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          reviewerName: revName,
          reviewerPhone: revPhone
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
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(data.product);
        }
      } else {
        const errData = await response.json();
        setReviewError(errData.error || 'Server error submitting review.');
      }
    } catch (err) {
      setReviewError('Network error submitting review.');
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
    const existing = cart.find(item => item.product.id === product.id && item.sku === variant.sku);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (currentQtyInCart + quantity > variant.onHand) {
      showToast(language === 'en' 
        ? `Cannot add more. Only ${variant.onHand} items on hand.` 
        : `ማከል አይቻልም። በእጅ ላይ ያለው ${variant.onHand} ፍሬ ብቻ ነው።`,
        'warning'
      );
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        (item.product.id === product.id && item.sku === variant.sku)
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        sku: variant.sku,
        variantName: variant.name,
        quantity: quantity,
        price: product.price + variant.priceOffset
      }]);
    }

    // Trigger visual animation highlight for newly added item
    setRecentlyAddedSkus(prev => [...prev, variant.sku]);
    setTimeout(() => {
      setRecentlyAddedSkus(prev => prev.filter(s => s !== variant.sku));
    }, 1200);

    // Sync wishlist: remove from favorites when added to cart
    if (favorites.includes(product.id)) {
      setFavorites(favorites.filter(fId => fId !== product.id));
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
    setIsCheckoutOpen(true);
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

      if (paymentMethod === 'COD') {
        completeOrder('PENDING_PAYMENT', data.txRef);
        showToast(
          language === 'en' 
            ? `Cash on Delivery order registered! Courier Verification PIN: ${data.verificationPin || '8492'}` 
            : `የሲኦዲ ትዕዛዝ በማረጋገጫ ፒን ተመዝግቧል፡ ${data.verificationPin || '8492'}`, 
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
            setIsCheckoutOpen(true);
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
      status: overrideStatus || (paymentMethod === 'COD' ? 'PENDING_PAYMENT' : 'PAID'),
      paymentMethod,
      paymentId: resolvedTxRef,
      subCity: selectedSubCity,
      landmark: customerLandmark.trim(),
      shippingAddress: `[${subCityLabel} - Landmark: ${customerLandmark.trim()}] ${shippingAddress.trim() || 'Courier Dispatch'}`,
      createdAt: new Date().toISOString(),
      channel: 'WEB',
      discountCode: appliedPromo ? appliedPromo.code : undefined,
      discountAmount: activeDiscount > 0 ? activeDiscount : undefined
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
      handleAddPoints(
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
    setCustomerName('');
    setCustomerPhone('+2519');
    setCustomerLandmark('');
    setShippingAddress('');
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
    // Default: Featured
    return approvedProducts.filter(p => p.featured);
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
    <div className="w-full max-w-full bg-[#EFF1F5] dark:bg-zinc-950 min-h-screen pb-3 sm:pb-4 font-sans text-gray-900 dark:text-zinc-100 transition-colors duration-200">
      
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

      {/* 1. DIGITAZ SUB-HEADER & NAVIGATION RIBBON */}
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800 shadow-2xs sticky top-[48px] sm:top-[62px] z-39 w-full max-w-full transition-all relative">
        <div className="max-w-[1440px] mx-auto w-full px-2 sm:px-4 md:px-8 flex items-center justify-between gap-2 py-1 sm:py-1.5">
          
          {/* Left Section: Ultra-Sleek Category & Deals Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 py-0.5">
            
            {/* 1. Shop By Category Dropdown Button */}
            <button
              type="button"
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className="h-8.5 sm:h-9 px-2.5 sm:px-3.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-100 font-extrabold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 transition-all border border-gray-200/80 dark:border-zinc-700/80 cursor-pointer shrink-0 whitespace-nowrap active:scale-[0.98]"
            >
              <Menu className="w-4 h-4 text-[#0052FF] dark:text-blue-400 shrink-0" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'ALL CATEGORIES' : 'ሁሉም ምድቦች'}
              </span>
              <span className="sm:hidden">
                {language === 'en' ? 'Categories' : 'ምድቦች'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 2. Sleek Flash Deals Button */}
            <button 
              type="button"
              onClick={() => { 
                setSelectedCategory('deals'); 
                const el = document.getElementById('featured-deals-section'); 
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
              }} 
              className={`h-8.5 sm:h-9 px-2.5 sm:px-3.5 rounded-lg font-extrabold text-xs sm:text-sm transition-all border flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap active:scale-[0.98] ${
                selectedCategory === 'deals'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500/20 shrink-0" />
              <span>{language === 'en' ? 'Deals' : 'ቅናሾች'}</span>
            </button>

          </div>

          {/* Right Section: Secondary Navigation Items */}
          <div className="hidden md:flex items-center gap-2.5 lg:gap-3.5 text-xs shrink-0">
            
            {/* Track Shipment */}
            <button 
              id="tour-live-courier"
              onClick={() => setIsOrderStatusOpen(true)} 
              className="h-9 px-3 rounded-xl text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 text-xs"
            >
              <Truck className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400 shrink-0" />
              <span>{language === 'en' ? 'Track Shipment' : 'የትዕዛዝ መከታተያ'}</span>
            </button>

            {/* Promo Center */}
            <button 
              onClick={() => showToast(language === 'en' ? 'ADDISFREE applied! Code entered.' : 'ADDISFREE የቅናሽ ኮድ ሰርቷል!', 'success')} 
              className="h-9 px-3 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 text-xs"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{language === 'en' ? 'Promo Center' : 'የኩፖን ማዕከል'}</span>
            </button>

            {/* My Orders (If logged in) */}
            {isLoggedIn && (
              <button 
                onClick={() => setIsMyOrdersOpen(true)} 
                className="h-9 px-3 bg-[#0052FF]/10 hover:bg-[#0052FF]/20 text-[#0052FF] dark:text-blue-400 font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 text-xs"
              >
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'en' ? 'My Orders' : 'የእኔ ትዕዛዞች'}</span>
                <span className="bg-[#0052FF] text-white text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full">
                  {allOrders.length}
                </span>
              </button>
            )}

            {/* Sign In / Account Buttons */}
            {isLoggedIn ? (
              <button 
                onClick={() => { setProfileAuthMode('SIGN_IN'); setIsProfileOpen(true); }} 
                className="h-9 px-3.5 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 border shrink-0 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
              >
                <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{customerName || (language === 'en' ? 'My Account' : 'የእኔ መለያ')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 shrink-0">
                <button 
                  onClick={() => { setProfileAuthMode('SIGN_IN'); setIsProfileOpen(true); }} 
                  className="h-9 px-3 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 border bg-[#0052FF] hover:bg-blue-600 text-white border-transparent shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'en' ? 'Sign In' : 'ይግቡ'}</span>
                </button>
                <button 
                  onClick={() => { setProfileAuthMode('REGISTER'); setIsProfileOpen(true); }} 
                  className="h-9 px-3 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 border bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-800 dark:text-zinc-200 border-gray-200/80 dark:border-zinc-700/80"
                >
                  <UserPlus className="w-3.5 h-3.5 text-gray-600 dark:text-zinc-400 shrink-0" />
                  <span>{language === 'en' ? 'Create Account' : 'መለያ ፍጠር'}</span>
                </button>
              </div>
            )}

            {/* Support Hotline */}
            <a 
              href="tel:+251911223344"
              className="hidden xl:inline-flex items-center gap-1.5 text-[#0052FF] dark:text-blue-400 font-extrabold bg-[#0052FF]/10 hover:bg-[#0052FF]/20 h-9 px-3 rounded-full border border-[#0052FF]/20 shrink-0 transition-all cursor-pointer text-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">+251 911 223 344</span>
            </a>

          </div>

        </div>

        {/* Department Dropdown Menu Overlay (Positioned outside overflow-x-auto) */}
        {isDeptDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-[1px]" 
              onClick={() => setIsDeptDropdownOpen(false)} 
            />
            <div className="absolute top-full left-2.5 sm:left-4 md:left-8 mt-1 w-[calc(100vw-20px)] sm:w-72 max-w-xs sm:max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Menu className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>{language === 'en' ? 'Electronics Catalog' : 'የኤሌክትሮኒክስ ዝርዝር'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsDeptDropdownOpen(false)}
                  className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {categories.map(cat => {
                let CatIcon = Cpu;
                if (cat.id === 'computers') CatIcon = Laptop;
                if (cat.id === 'gaming') CatIcon = Gamepad2;
                if (cat.id === 'smartwatches') CatIcon = Watch;
                if (cat.id === 'mobiles') CatIcon = Smartphone;
                if (cat.id === 'headphones') CatIcon = Headphones;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsDeptDropdownOpen(false);
                      const el = document.getElementById('products-grid-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:text-[#0052FF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CatIcon className={`w-4 h-4 ${isSelected ? 'text-[#0052FF]' : 'text-gray-400'}`} />
                      <span>{language === 'en' ? cat.nameEn : cat.nameAm}</span>
                    </div>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0052FF]" />}
                  </button>
                );
              })}
              <hr className="border-gray-100 dark:border-zinc-800 my-1" />
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setIsDeptDropdownOpen(false);
                  const el = document.getElementById('products-grid-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full px-4 py-2.5 text-left text-xs font-black flex items-center gap-3 transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0052FF]'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-[#0052FF]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-kasma-gold" />
                <span>{language === 'en' ? 'View All Categories' : 'ሁሉንም ምድቦች ይመልከቱ'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 2. DYNAMICALLY SCROLLING HERO CAROUSEL */}
      <div className="max-w-[1440px] mx-auto w-full px-2.5 sm:px-4 md:px-8 mt-4 sm:mt-6">
        {slide ? (() => {
          // Parse brand & clean 2-line title without brand repetition
          const rawTitle = language === 'en' ? slide.nameEn : slide.nameAm;
          const brandName = (slide.brand || '').toUpperCase();
          let line1 = '';
          let line2 = '';

          if (language === 'en') {
            let clean = rawTitle;
            if (brandName && clean.toUpperCase().startsWith(brandName)) {
              clean = clean.slice(brandName.length).trim();
            }
            let lower = clean.toLowerCase();
            if (lower.includes('momentum true wireless')) {
              line1 = 'MOMENTUM TRUE';
              line2 = 'WIRELESS EARBUDS';
            } else if (lower.includes('stanmore')) {
              line1 = 'STANMORE III';
              line2 = 'BLUETOOTH SPEAKER';
            } else if (lower.includes('arctis nova pro')) {
              line1 = 'ARCTIS NOVA PRO';
              line2 = 'WIRELESS HEADSET';
            } else if (lower.includes('wf-1000xm5')) {
              line1 = 'WF-1000XM5 TRUE';
              line2 = 'WIRELESS EARBUDS';
            } else if (lower.includes('watch ultra 2')) {
              line1 = 'WATCH ULTRA 2';
              line2 = 'TITANIUM GPS';
            } else if (lower.includes('prime 20,000mah')) {
              line1 = 'PRIME 20,000mAh';
              line2 = 'POWER BANK';
            } else {
              const words = clean.split(' ');
              if (words.length <= 2) {
                line1 = clean.toUpperCase();
                line2 = '';
              } else {
                const mid = Math.ceil(words.length / 2);
                line1 = words.slice(0, mid).join(' ').toUpperCase();
                line2 = words.slice(mid).join(' ').toUpperCase();
              }
            }
          } else {
            line1 = rawTitle;
            line2 = '';
          }

          const originalPrice = Math.round(slide.price * 1.25);
          const savingsAmount = Math.round(slide.price * 0.25);

          return (
            <div id="tour-welcome-banner" className="relative bg-gradient-to-br from-[#021B24] via-[#052C38] to-[#0A1A28] dark:from-zinc-950 dark:via-[#032029] dark:to-zinc-950 text-white rounded-2xl sm:rounded-3xl overflow-hidden min-h-[240px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px] flex flex-col justify-center p-3.5 xs:p-4 sm:p-8 md:p-10 lg:p-12 shadow-2xl border border-cyan-500/25 dark:border-zinc-800/85 group transition-all duration-500">
              
              {/* Background ambient glow behind product */}
              <div className="absolute right-4 sm:right-16 top-1/2 -translate-y-1/2 w-48 sm:w-[360px] h-48 sm:h-[360px] bg-cyan-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Left Limited Offer Badge */}
              <div className="absolute top-2.5 left-2.5 sm:top-5 sm:left-7 z-20">
                <span className="text-[9px] xs:text-[10px] sm:text-xs font-black uppercase tracking-wider text-white bg-[#00925D] px-2 xs:px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full inline-flex items-center gap-1 shadow-md border border-emerald-400/40">
                  <Zap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white fill-current" />
                  <span>{language === 'en' ? 'LIMITED OFFER' : 'ልዩ ቅናሽ'}</span>
                </span>
              </div>

              {/* Top Right Discount Badge */}
              <div className="absolute top-2.5 right-2.5 sm:top-5 sm:right-7 z-20">
                <span className="text-[9px] xs:text-[10px] sm:text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 shadow-md border border-red-400/40 px-2 xs:px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full inline-flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-yellow-200 fill-current" />
                  <span>20% OFF</span>
                </span>
              </div>

              <div className="grid grid-cols-12 items-center gap-3 sm:gap-6 md:gap-8 lg:gap-12 relative z-10 w-full pt-6 xs:pt-7 sm:pt-4 pb-2">
                
                {/* Left Content Column (Balanced 6 Columns) */}
                <div 
                  key={`slide-info-${slide.id}`} 
                  className="col-span-6 xs:col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-6 space-y-1.5 xs:space-y-2 sm:space-y-3.5 text-left animate-in fade-in slide-in-from-left-6 duration-500 min-w-0 pr-1 sm:pr-0"
                >
                  {/* Brand Label */}
                  {brandName && (
                    <div className="text-[9px] xs:text-[10px] sm:text-xs font-extrabold text-cyan-200/90 tracking-widest uppercase font-sans">
                      {brandName}
                    </div>
                  )}
                  
                  {/* Product Title - Max 2 lines */}
                  <h1 className="text-xs xs:text-sm sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-snug text-white uppercase drop-shadow-sm font-sans line-clamp-2">
                    {line1} {line2}
                  </h1>
                  
                  {/* Price & Savings Hierarchy - STRICT ONE-LINER PRICE */}
                  <div className="space-y-0.5 sm:space-y-1 pt-0.5">
                    <div className="flex items-baseline gap-1.5 sm:gap-2.5 flex-nowrap overflow-hidden">
                      <span className="text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-amber-300 font-mono tracking-tight drop-shadow-sm whitespace-nowrap">
                        {slide.price.toLocaleString()} ETB
                      </span>
                      <span className="text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-300/80 font-mono line-through font-bold whitespace-nowrap">
                        {originalPrice.toLocaleString()} ETB
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-[8px] xs:text-[9px] sm:text-xs font-black uppercase text-emerald-300 bg-[#00925D]/30 border border-[#00925D]/60 px-2 py-0.5 rounded-md tracking-wider inline-block whitespace-nowrap">
                        {language === 'en' 
                          ? `SAVE ${savingsAmount.toLocaleString()} ETB` 
                          : `ከ${savingsAmount.toLocaleString()} ብር ይቆጥቡ`}
                      </span>
                    </div>
                  </div>
                  
                  {/* CTA Buttons - Compact Inline Horizontal Row */}
                  <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 pt-1 sm:pt-2 flex-row flex-nowrap">
                    <button
                      onClick={() => handleOpenProduct(slide)}
                      className="px-2.5 xs:px-3.5 sm:px-5 py-1.5 xs:py-2 sm:py-3 bg-[#0052FF] hover:bg-blue-600 text-white font-black text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md shadow-blue-600/30 inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 hover:scale-[1.02]"
                    >
                      <span>{language === 'en' ? 'BUY NOW' : 'አሁኑኑ ይግዙ'}</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (slide.variants && slide.variants[0]) {
                          addToCart(slide, slide.variants[0], 1);
                        }
                      }}
                      className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 bg-[#12313D]/90 hover:bg-[#1A4252] text-white font-extrabold text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider rounded-lg sm:rounded-xl transition-all border border-cyan-500/30 backdrop-blur-md inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 hover:scale-[1.02]"
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{language === 'en' ? '+ CART' : '+ ቅርጫት'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Side Product Image - Large Hero Main Character (6 Columns) */}
                <div className="col-span-6 xs:col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-6 flex justify-center items-center relative w-full">
                  <div 
                    key={`slide-img-${slide.id}`} 
                    className="relative w-full h-full max-w-full aspect-[4/3] xs:aspect-square max-h-[220px] xs:max-h-[270px] sm:max-h-[360px] md:max-h-[400px] lg:max-h-[440px] flex items-center justify-center group-hover:scale-[1.03] transition-all duration-500 animate-in fade-in zoom-in-95 z-10"
                  >
                    <LazyImage
                      src={slide.image}
                      alt={slide.nameEn}
                      className="w-full h-full object-cover filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] rounded-2xl sm:rounded-3xl"
                    />
                  </div>
                </div>

              </div>

              {/* Navigation Arrows & Bullet Indicators at Bottom */}
              <div className="absolute bottom-2.5 left-3.5 sm:bottom-4 sm:left-8 flex items-center gap-1.5 z-20">
                {activeSlides.map((_, index) => (
                  <button
                    key={`bullet-${index}`}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentSlide ? 'w-5 bg-white shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="absolute bottom-2.5 right-3 sm:bottom-4 sm:right-8 flex items-center gap-1.5 z-20">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
                  }}
                  className="p-1 sm:p-1.5 bg-black/40 hover:bg-black/75 text-white rounded-lg transition-all cursor-pointer border border-white/20 backdrop-blur-md active:scale-95 shadow-md"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
                  }}
                  className="p-1 sm:p-1.5 bg-black/40 hover:bg-black/75 text-white rounded-lg transition-all cursor-pointer border border-white/20 backdrop-blur-md active:scale-95 shadow-md"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

            </div>
          );
        })() : (
          /* Fallback static banner */
          <div className="relative bg-[#0e59e5] dark:bg-blue-950 text-white rounded-2xl sm:rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-center p-6 sm:p-10 shadow-lg border border-blue-500/20 group">
            <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-60 h-60 rounded-full bg-blue-400/25 filter blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center relative z-10 w-full">
              <div className="md:col-span-8 space-y-3 text-left">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight uppercase font-sans">
                  {language === 'en' ? 'Welcome to Kasma Electronics' : 'እንኳን ወደ ካስማ ኤሌክትሮኒክስ በደህና መጡ'}
                </h1>
                <p className="text-xs md:text-sm text-blue-100 max-w-xl">
                  {language === 'en' ? 'Premium high-fidelity gaming headsets, gadgets, smartphones, and secure checkout.' : 'ምርጥ ጥራት ያላቸው የጌሚንግ ማዳመጫዎች፣ ዘመናዊ ስልኮች እና አስተማማኝ ግብይት።'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. CATEGORIES SECTION WITH ELEGANT TILES & UNUNCATED LABELS */}
      <div className="max-w-[1440px] mx-auto w-full px-1.5 sm:px-4 md:px-8 mt-6 sm:mt-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0052FF]" />
              <span>{language === 'en' ? 'Browse Categories' : 'በምድብ ይፈልጉ'}</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 hidden sm:block mt-0.5">
              {language === 'en' ? 'Explore authentic electronics, devices & accessories' : 'ምርጥ የኤሌክትሮኒክስ እቃዎችን ይፈልጉ'}
            </p>
          </div>
          <button 
            onClick={() => {
              setIsCategoriesExpanded(prev => !prev);
            }}
            className="text-xs font-bold text-[#0052FF] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>
              {language === 'en' 
                ? (isCategoriesExpanded ? 'Show Less' : 'View All') 
                : (isCategoriesExpanded ? 'ያነሱ' : 'ሁሉንም')}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoriesExpanded ? 'rotate-90 md:rotate-0' : ''}`} />
          </button>
        </div>

        {/* Compact 4-Column Grid on Mobile (1 row default, expandable to 2 rows), Full 8-Column Grid on Desktop */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3 md:gap-3.5 items-stretch w-full">
          {[
            { id: 'computers', nameEn: 'Computers', nameAm: 'ላፕቶፕ', icon: Laptop },
            { id: 'cameras', nameEn: 'Cameras', nameAm: 'ካሜራ', icon: Camera },
            { id: 'television', nameEn: 'TV & Video', nameAm: 'ቴሌቪዥን', icon: Tv },
            { id: 'smartwatches', nameEn: 'Smartwatches', nameAm: 'ሰዓቶች', icon: Watch },
            { id: 'gaming', nameEn: 'Gaming', nameAm: 'ጌሚንግ', icon: Gamepad2 },
            { id: 'mobiles', nameEn: 'Phones', nameAm: 'ሞባይል', icon: Smartphone },
            { id: 'headphones', nameEn: 'Headphones', nameAm: 'ማዳመጫዎች', icon: Headphones },
            { id: 'accessories', nameEn: 'Accessories', nameAm: 'መለዋወጫዎች', icon: Cpu }
          ].map((dept, index) => {
            const DeptIcon = dept.icon;
            const isSelected = selectedCategory === dept.id;
            const isHiddenOnMobile = index >= 4 && !isCategoriesExpanded;

            return (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedCategory(dept.id);
                  const el = document.getElementById('products-grid-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`${isHiddenOnMobile ? 'hidden md:flex' : 'flex'} w-full flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all duration-300 group cursor-pointer focus:outline-none min-h-[80px] sm:min-h-[88px] ${
                  isSelected
                    ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-md shadow-blue-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800/90 text-gray-800 dark:text-zinc-200 hover:border-[#0052FF]/50 hover:shadow-md hover:shadow-blue-500/10 hover:-translate-y-0.5'
                }`}
              >
                <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-1 sm:mb-1.5 transition-transform duration-300 group-hover:scale-110 ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100/80 dark:bg-zinc-800/80 text-[#0052FF] dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60'
                }`}>
                  <DeptIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9.5px] xs:text-[10.5px] sm:text-xs font-bold text-center leading-tight tracking-tight w-full break-keep line-clamp-2 px-0.5 ${
                  isSelected ? 'text-white font-extrabold' : 'text-gray-900 dark:text-zinc-100 group-hover:text-[#0052FF] dark:group-hover:text-blue-400'
                }`}>
                  {language === 'en' ? dept.nameEn : dept.nameAm}
                </span>
              </button>
            );
          })}
        </div>
      </div>



      {/* KASMA LIGHTNING FLASH DEALS SECTION */}
      {approvedProducts.length > 0 && (
        <div id="featured-deals-section" className="max-w-[1440px] mx-auto w-full px-1.5 sm:px-4 md:px-8 mt-4 sm:mt-6 mb-3 sm:mb-4 scroll-mt-28">
          <div className="bg-gradient-to-br from-[#FF8A00] via-[#FF7500] to-[#FF5A00] dark:from-[#C75100] dark:via-[#B54200] dark:to-[#8E2C00] px-1.5 py-2 sm:px-6 sm:py-5 rounded-xl sm:rounded-[24px] shadow-[0_16px_40px_rgba(255,90,0,0.2)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-white relative overflow-hidden border border-amber-300/30 dark:border-amber-600/30">
            {/* Subtle radial glow behind section */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-300/25 dark:bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header with Title, Timer & View All - Single Row Header ("One Liner") */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-3 mb-2 sm:mb-3 relative z-10 w-full min-w-0 flex-nowrap px-0.5 sm:px-0">
              {/* Title & Icon */}
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
                <div className="bg-white/20 p-1 sm:p-2 rounded-lg sm:rounded-xl text-amber-300 border border-white/25 backdrop-blur-md shadow-inner shrink-0 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-amber-300 text-amber-300 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-base md:text-xl font-black uppercase tracking-tight font-sans text-white text-shadow-xs leading-none truncate">
                      <span className="xs:hidden">{language === 'en' ? 'FLASH DEALS' : 'ፈጣን ሽያጭ'}</span>
                      <span className="hidden xs:inline">{language === 'en' ? 'KASMA FLASH DEALS' : 'ካስማ ፈጣን ሽያጭ'}</span>
                    </h3>
                    <span className="hidden lg:inline-block bg-black/35 text-amber-300 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border border-amber-300/30">
                      {language === 'en' ? 'Limited Quantities' : 'ውስን እቃዎች'}
                    </span>
                  </div>
                  <p className="hidden md:block text-xs text-orange-50/90 font-medium mt-0.5">
                    {language === 'en'
                      ? 'Supercharge your savings with authentic discounts.'
                      : 'በእውነተኛ ቅናሾች ቁጠባዎን ያሳድጉ።'}
                  </p>
                </div>
              </div>

              {/* Timer and All Button */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Countdown Ticker Box */}
                <div className="flex items-center gap-1 sm:gap-1.5 bg-black/40 px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 backdrop-blur-md shadow-inner shrink-0">
                  <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-amber-200 font-bold uppercase tracking-tight shrink-0 leading-none">
                    {language === 'en' ? 'ENDS IN:' : 'የሚቀረው:'}
                  </span>
                  <div className="flex items-center gap-0.5 sm:gap-1 font-mono font-black text-[10px] xs:text-xs">
                    <span className="bg-black/60 text-white px-1 py-0.5 rounded border border-white/15 shadow-xs leading-none">
                      {String(flashTimeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-amber-300 animate-pulse font-bold leading-none">:</span>
                    <span className="bg-black/60 text-white px-1 py-0.5 rounded border border-white/15 shadow-xs leading-none">
                      {String(flashTimeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-amber-300 animate-pulse font-bold leading-none">:</span>
                    <span className="bg-black/60 text-white px-1 py-0.5 rounded border border-white/15 shadow-xs leading-none">
                      {String(flashTimeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* View All Button */}
                <button
                  type="button"
                  onClick={() => setIsFlashDealsOpen(true)}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-xs border border-white/30 flex items-center justify-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <span>{language === 'en' ? 'ALL →' : 'ሁሉም →'}</span>
                </button>
              </div>
            </div>

            {/* Flash Deals: 4-Column Responsive Grid on Desktop (no horizontal overflow/truncation), Scrollable Carousel on Mobile */}
            <div className="flex lg:grid overflow-x-auto lg:overflow-visible lg:grid-cols-4 gap-1.5 sm:gap-4 xl:gap-5 pb-0.5 pt-0.5 no-scrollbar scrollbar-none snap-x snap-mandatory w-full min-w-0 relative z-10">
              {approvedProducts.slice(0, 4).map((p, idx) => {
                const originalPrice = p.price;
                const flashDiscountPct = 30;
                const flashPrice = Math.round(originalPrice * (1 - flashDiscountPct / 100));
                
                // Get simulated claimed percentage
                const claimedPct = simulatedClaimedQty[p.id] || (55 + (idx * 11));
                const totalStock = p.variants.reduce((acc, v) => acc + v.onHand, 0);
                const remainingQty = Math.max(1, Math.round(totalStock * (1 - claimedPct / 100)));
                const isFavorite = favorites.includes(p.id);
                const isCompared = comparedProductIds.includes(p.id);

                return (
                  <ProductCard
                    key={`flash-${p.id}`}
                    product={p}
                    language={language}
                    isFavorite={isFavorite}
                    onToggleFavorite={handleToggleFavorite}
                    isCompared={isCompared}
                    onToggleCompare={handleToggleCompare}
                    onOpenProduct={handleOpenProduct}
                    onQuickView={handleOpenQuickBuy}
                    onAddToCart={addToCart}
                    onInstantBuy={handleInstantBuy}
                    showToast={showToast}
                    flashDiscountPct={flashDiscountPct}
                    flashPrice={flashPrice}
                    claimedPct={claimedPct}
                    remainingQty={remainingQty}
                    layout="flash"
                  />
                );
              })}

              {/* End Card on Mobile: View All Flash Deals */}
              <div 
                onClick={() => setIsFlashDealsOpen(true)}
                className="lg:hidden w-[120px] xs:w-[135px] sm:w-[180px] shrink-0 snap-start bg-white/15 hover:bg-white/25 border border-white/30 hover:border-amber-300 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300 shadow-md hover:-translate-y-1"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-amber-300/25 text-amber-200 flex items-center justify-center mb-1.5 sm:mb-3 group-hover:scale-110 transition-transform shadow-inner border border-white/20">
                  <Flame className="w-4 h-4 sm:w-6 sm:h-6 fill-current text-amber-300 animate-pulse" />
                </div>
                <h4 className="font-black text-[11px] sm:text-xs text-white group-hover:text-amber-200 transition-colors uppercase tracking-wider">
                  {language === 'en' ? 'View All →' : 'ሁሉንም ቅናሾች →'}
                </h4>
                <p className="text-[9.5px] sm:text-[10.5px] text-amber-100/90 mt-0.5 flex items-center gap-0.5 font-semibold">
                  <span>{language === 'en' ? 'Deals Hub' : 'ቅናሽ ማዕከል'}</span>
                  <ChevronRight className="w-3 h-3" />
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended for You Personalized Section with Contextual Reasons */}
      {recommendedProductsWithReasons.length > 0 && (
        <div className="max-w-[1440px] mx-auto w-full px-1.5 sm:px-4 md:px-8 mt-4 sm:mt-10">
          <div className="bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/30 dark:from-zinc-900/50 dark:via-zinc-900 dark:to-purple-950/20 p-3 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-indigo-100/80 dark:border-zinc-800 shadow-xs">
            
            {/* Header with Reason Context */}
            <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-indigo-100 dark:bg-indigo-950/80 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4 fill-current animate-pulse text-indigo-500" />
                </div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-indigo-950 dark:text-white font-sans">
                  {language === 'en' ? 'Recommended' : 'የተመረጡ'}
                </h3>
              </div>
            </div>

            {/* Product Grid */}
            <GridContainer cols={4}>
              {recommendedProductsWithReasons.map((recItem) => {
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
                  />
                );
              })}
            </GridContainer>
          </div>
        </div>
      )}

      {/* RECENTLY VIEWED SECTION - STORES LAST 5 CLICKED PRODUCTS */}
      {recentlyViewedProducts.length > 0 && (
        <div id="recently-viewed-section" className="max-w-[1440px] mx-auto w-full px-1.5 sm:px-4 md:px-8 mt-4 sm:mt-10">
          <div className="bg-gradient-to-br from-blue-50/40 via-white to-slate-50/30 dark:from-zinc-900/60 dark:via-zinc-900 dark:to-zinc-950 p-3 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-blue-100/80 dark:border-zinc-800 shadow-xs">
            
            {/* Header with Title, Count Badge & Clear History */}
            <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#0052FF]/10 dark:bg-blue-950/80 p-2 sm:p-2.5 rounded-xl text-[#0052FF] dark:text-blue-400 shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#0052FF] dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white font-sans">
                      {language === 'en' ? 'Recently Viewed' : 'በቅርቡ የታዩ እቃዎች'}
                    </h3>
                    <span className="bg-[#0052FF] text-white font-mono font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                      {recentlyViewedProducts.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium hidden sm:block">
                    {language === 'en' 
                      ? 'The last 5 products you clicked on or inspected. Easily revisit your items of interest.'
                      : 'በቅርቡ የተመለከቷቸው የመጨረሻዎቹ 5 ምርቶች። ፍላጎት ያሳዩባቸውን እቃዎች በፍጥነት ይመልከቱ።'}
                  </p>
                </div>
              </div>

              {/* Clear History Button */}
              <button
                type="button"
                onClick={handleClearRecentlyViewed}
                className="text-xs font-extrabold text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-zinc-700/80 shrink-0 shadow-2xs hover:border-red-200"
                title={language === 'en' ? 'Clear recently viewed items history' : 'የታዩ እቃዎችን ታሪክ አጽዳ'}
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500" />
                <span className="hidden xs:inline">{language === 'en' ? 'Clear History' : 'ታሪክ አጽዳ'}</span>
              </button>
            </div>

            {/* Recently Viewed Grid Container (Up to 5 Products) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {recentlyViewedProducts.map((p) => {
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
                  />
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* 5. DYNAMIC SPOTLIGHT & DEALS HUBS - 4 AUTO-SCROLL CAROUSELS */}
      <div id="featured-deals-section" className="max-w-[1440px] mx-auto w-full px-1.5 sm:px-4 md:px-8 mt-4 sm:mt-12 space-y-4 sm:space-y-12">
        
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
        />

      </div>

      {/* 6. MIDDLE BANNER LAYOUTS (MARSHALL SPEAKER PROMO BANNER GRID) */}
      <div className="max-w-[1440px] mx-auto w-full px-2.5 sm:px-4 md:px-8 mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Large Marshall Banner */}
        <div className="lg:col-span-7 bg-gradient-to-r from-[#004C61] via-[#00607A] to-[#0D1F2D] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-row justify-between items-center overflow-hidden border border-cyan-500/15 dark:border-zinc-800 hover:border-cyan-500/30 dark:hover:border-zinc-700 transition-all min-h-[160px] sm:min-h-[220px] relative group">
          <div className="space-y-2 sm:space-y-4 z-10 text-left max-w-[60%] sm:max-w-xs">
            <span className="text-[8px] sm:text-[9px] font-black text-kasma-gold bg-black/35 border border-white/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md uppercase tracking-widest w-fit block">
              {language === 'en' ? 'GET REWARDS' : 'ሽልማት ያግኙ'}
            </span>
            <div className="space-y-0.5 sm:space-y-1">
              <h2 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight font-sans text-white leading-tight">
                {language === 'en' ? 'Super Cheap Price' : 'እጅግ ቅናሽ ዋጋ'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-cyan-100/80 dark:text-zinc-400 font-medium line-clamp-2 sm:line-clamp-none">
                {language === 'en' ? 'Earn 20% Back in Rewards points to spend on accessories' : 'አሁን ሲገዙ ተጨማሪ የ20% ነጥብ ያግኙ'}
              </p>
            </div>
            <button
              onClick={() => {
                const spProd = approvedProducts.find(p => p.id === 'p4');
                if (spProd) handleOpenProduct(spProd);
              }}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2.5 bg-white hover:bg-gray-50 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-md inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer mt-1"
            >
              <span>{language === 'en' ? 'Shop Now' : 'አሁን ይግዙ'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          {/* Speaker image */}
          <img
            src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"
            alt="Marshall Speaker"
            referrerPolicy="no-referrer"
            className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain filter drop-shadow-2xl group-hover:scale-103 transition-transform duration-500 relative z-10 shrink-0"
          />
        </div>

        {/* Small Banners Side Panel - 2 Columns on Mobile for better horizontal spacing */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-2 sm:gap-4 lg:gap-6">
          
          {/* Row 1: Power Bank */}
          <div className="bg-gray-100 dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex justify-between items-center border border-gray-150 dark:border-zinc-800 min-h-[85px] sm:min-h-[100px] hover:border-gray-250 transition-all relative group overflow-hidden">
            <div className="space-y-0.5 sm:space-y-1 text-left z-10 max-w-[62%] sm:max-w-[65%] min-w-0">
              <h4 className="text-[10px] xs:text-[11px] sm:text-xs font-black text-gray-900 dark:text-zinc-50 uppercase tracking-tight line-clamp-2 leading-tight">{language === 'en' ? 'Charger Power Bank' : 'ፖርቴብል ቻርጀር'}</h4>
              <p className="text-[8px] xs:text-[9px] text-gray-400 font-bold uppercase line-clamp-1">{language === 'en' ? 'Starting at 2,400 ETB' : 'ዋጋው ከ 2,400 ብር ጀምሮ'}</p>
              <button onClick={() => { setSelectedCategory('accessories'); const el = document.getElementById('products-grid-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="text-[8px] xs:text-[9px] font-black text-[#0052FF] uppercase tracking-wider underline block pt-0.5 sm:pt-1 cursor-pointer">{language === 'en' ? 'Discover »' : 'ይጎብኙ »'}</button>
            </div>
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200/80 dark:border-zinc-700/80 shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=300&q=80"
                alt="Power bank"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Row 2: Controller for Switch */}
          <div className="bg-gray-100 dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex justify-between items-center border border-gray-150 dark:border-zinc-800 min-h-[85px] sm:min-h-[100px] hover:border-gray-250 transition-all relative group overflow-hidden">
            <div className="space-y-0.5 sm:space-y-1 text-left z-10 max-w-[62%] sm:max-w-[65%] min-w-0">
              <h4 className="text-[10px] xs:text-[11px] sm:text-xs font-black text-gray-900 dark:text-zinc-50 uppercase tracking-tight line-clamp-2 leading-tight">{language === 'en' ? 'Controller for Switch' : 'የስዊች ጌም መቆጣጠሪያ'}</h4>
              <p className="text-[8px] xs:text-[9px] text-gray-400 font-bold uppercase line-clamp-1">{language === 'en' ? 'Discount 30% Off' : '30% ቅናሽ'}</p>
              <button onClick={() => { setSelectedCategory('gaming'); const el = document.getElementById('products-grid-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="text-[8px] xs:text-[9px] font-black text-[#0052FF] uppercase tracking-wider underline block pt-0.5 sm:pt-1 cursor-pointer">{language === 'en' ? 'Discover »' : 'ይጎብኙ »'}</button>
            </div>
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200/80 dark:border-zinc-700/80 shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=300&q=80"
                alt="Nintendo Switch controller"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Category Pills & Filters Section */}
      <div id="products-grid-section" className="max-w-[1440px] mx-auto w-full px-2.5 sm:px-4 md:px-8 mt-8 space-y-4">
        
        {/* Category Header with Track shipment */}
        <div className="flex justify-between items-center pb-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#0052FF] rounded-full" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-900 dark:text-zinc-100 font-sans">
              {language === 'en' ? 'Explore' : 'ምድቦች'}
            </h3>
          </div>
          
          {isLoggedIn && (
            <button
              onClick={() => {
                setHasSearchedOrder(false);
                setTrackedOrder(null);
                setTrackOrderId('');
                setIsOrderStatusOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0052FF] text-white hover:bg-blue-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'en' ? 'Track Shipment' : 'ጭነት ይከታተሉ'}</span>
            </button>
          )}
        </div>

        {/* Sticky Product Control Bar: Title/Count on Left, [ FILTER ] & [ SORT ] on Right */}
        <div className="sticky top-[102px] sm:top-[108px] z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-xs transition-all space-y-2.5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Left: Category Title & Product Count */}
            <div className="flex items-center gap-2.5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight font-sans leading-tight">
                    {selectedCategory === 'all'
                      ? (language === 'en' ? 'All Products' : 'ሁሉም ምርቶች')
                      : selectedCategory === 'deals'
                      ? (language === 'en' ? 'Flash Deals' : 'ልዩ ቅናሾች')
                      : (language === 'en' 
                          ? (categories.find(c => c.id === selectedCategory)?.nameEn || selectedCategory)
                          : (categories.find(c => c.id === selectedCategory)?.nameAm || selectedCategory))}
                  </h2>
                  {selectedCategory !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-[#0052FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer border border-blue-200/80 dark:border-blue-800/80"
                      title={language === 'en' ? 'Reset category filter' : 'ሁሉንም ምርቶች አሳይ'}
                    >
                      <span>{language === 'en' ? 'Show All' : 'ሁሉንም አሳይ'}</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] font-extrabold text-gray-500 dark:text-zinc-400 mt-0.5 font-mono">
                  {language === 'en' 
                    ? `${sortedAndFilteredProducts.length} items found` 
                    : `${sortedAndFilteredProducts.length} ምርቶች ተገኝተዋል`}
                </p>
              </div>
            </div>

            {/* Right: Action Buttons - [ FILTER ] & [ SORT: Popular ] */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              
              {/* [ FILTER ] Button */}
              <button
                type="button"
                onClick={() => {
                  setFilterSectionFocus('all');
                  setIsAdvancedFilterOpen(true);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 shadow-2xs ${
                  activeFiltersCount > 0
                    ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-sm shadow-[#0052FF]/20'
                    : 'bg-gray-100/80 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Filter' : 'ማጣሪያ'}</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-[#0052FF] font-mono text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* [ SORT: Popular ] Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-gray-100/80 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 pr-7 text-xs font-black uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0052FF]/30 transition-all"
                >
                  <option value="default">{language === 'en' ? 'Sort: Popular' : 'በተወዳጅነት'}</option>
                  <option value="priceAsc">{language === 'en' ? 'Price: Low → High' : 'ዋጋ፡ ዝቅተኛ'}</option>
                  <option value="priceDesc">{language === 'en' ? 'Price: High → Low' : 'ዋጋ፡ ከፍተኛ'}</option>
                  <option value="newest">{language === 'en' ? 'Sort: Newest' : 'አዲስ የገቡ'}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

            </div>

          </div>

          {/* Horizontal Filter Chips Row (Brand, Price, Rating, Availability, Features) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scroll-smooth touch-pan-x py-0.5 no-scrollbar">
            
            {/* Brand Chip */}
            <button
              type="button"
              onClick={() => {
                setFilterSectionFocus('brand');
                setIsAdvancedFilterOpen(true);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 ${
                selectedBrands.length > 0
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 border-blue-200 dark:border-blue-900/60 font-black'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{selectedBrands.length > 0 ? `Brand (${selectedBrands.length})` : 'Brand'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Price Chip */}
            <button
              type="button"
              onClick={() => {
                setFilterSectionFocus('price');
                setIsAdvancedFilterOpen(true);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 ${
                minPriceInput !== '' || maxPriceInput !== ''
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 border-blue-200 dark:border-blue-900/60 font-black'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>
                {minPriceInput !== '' || maxPriceInput !== ''
                  ? `Price (${minPriceInput || '0'}-${maxPriceInput || '∞'})`
                  : 'Price'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Rating Chip */}
            <button
              type="button"
              onClick={() => {
                setFilterSectionFocus('rating');
                setIsAdvancedFilterOpen(true);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 ${
                selectedRatingFilter > 0
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 font-black'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{selectedRatingFilter > 0 ? `Rating (${selectedRatingFilter}★+)` : 'Rating'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Availability Chip */}
            <button
              type="button"
              onClick={() => {
                setFilterSectionFocus('availability');
                setIsAdvancedFilterOpen(true);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 ${
                availabilityFilter !== 'ALL'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 font-black'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>
                {availabilityFilter === 'IN_STOCK' ? 'In Stock' : availabilityFilter === 'ON_SALE' ? 'On Sale' : availabilityFilter === 'HIGHLY_RATED' ? '4★+ Rated' : 'Availability'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Features Chip */}
            <button
              type="button"
              onClick={() => {
                setFilterSectionFocus('features');
                setIsAdvancedFilterOpen(true);
              }}
              className="px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1 shrink-0 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <span>Features</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Reset All Filters Button (Shows when filters are active) */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-2.5 py-1 rounded-full text-[11px] font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                {language === 'en' ? 'Clear All' : 'ሁሉንም አጽዳ'}
              </button>
            )}

          </div>

        </div>

      </div>

      {/* FILTER Bottom Sheet Overlay Modal */}
      <AnimatePresence>
        {isAdvancedFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            {/* Click backdrop to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdvancedFilterOpen(false)}
              className="absolute inset-0"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[82vh] border border-gray-150 dark:border-zinc-800"
            >
              {/* Mobile handle bar */}
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

              {/* Bottom Sheet Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-150 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#0052FF]" />
                  <h3 className="text-base font-black uppercase tracking-wider text-gray-900 dark:text-white font-sans">
                    {language === 'en' ? 'FILTER' : 'ማጣሪያ'}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearAllFilters}
                      className="text-xs font-extrabold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      {language === 'en' ? 'Clear' : 'አጽዳ'}
                    </button>
                  )}
                  <button
                    onClick={() => setIsAdvancedFilterOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filter Options */}
              <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar divide-y divide-gray-100 dark:divide-zinc-800">

                {/* 1. BRAND SECTION */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                      {language === 'en' ? 'Brand' : 'ብራንድ'}
                    </span>
                    {selectedBrands.length > 0 && (
                      <button
                        onClick={() => setSelectedBrands([])}
                        className="text-[11px] text-[#0052FF] font-bold hover:underline cursor-pointer"
                      >
                        {language === 'en' ? 'Reset' : 'ቦረሽ'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {availableBrands.map((brand) => {
                      const isSelected = selectedBrands.includes(brand);
                      const count = approvedProducts.filter(p => p.brand === brand).length;
                      return (
                        <label
                          key={`sheet-brand-${brand}`}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 dark:bg-blue-950/50 border-[#0052FF] text-gray-900 dark:text-white font-black shadow-xs'
                              : 'bg-gray-50/50 dark:bg-zinc-850/50 border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                } else {
                                  setSelectedBrands([...selectedBrands, brand]);
                                }
                              }}
                              className="w-4 h-4 rounded text-[#0052FF] focus:ring-[#0052FF] border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs font-bold">{brand}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 font-bold">
                            ({count})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. PRICE SECTION */}
                <div className="space-y-3 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                      {language === 'en' ? 'Price' : 'ዋጋ'}
                    </span>
                    {(minPriceInput !== '' || maxPriceInput !== '') && (
                      <button
                        onClick={() => {
                          setMinPriceInput('');
                          setMaxPriceInput('');
                        }}
                        className="text-[11px] text-[#0052FF] font-bold hover:underline cursor-pointer"
                      >
                        {language === 'en' ? 'Reset' : 'ቦረሽ'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'All Prices', min: '', max: '' },
                      { label: '< 5,000 ETB', min: '', max: '5000' },
                      { label: '5,000 – 10,000 ETB', min: '5000', max: '10000' },
                      { label: '10,000+ ETB', min: '10000', max: '' },
                    ].map((preset, idx) => {
                      const isSelected = minPriceInput === preset.min && maxPriceInput === preset.max;
                      return (
                        <label
                          key={`sheet-price-preset-${idx}`}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 dark:bg-blue-950/50 border-[#0052FF] text-gray-900 dark:text-white font-black shadow-xs'
                              : 'bg-gray-50/50 dark:bg-zinc-850/50 border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sheet-price-preset"
                            checked={isSelected}
                            onChange={() => {
                              setMinPriceInput(preset.min);
                              setMaxPriceInput(preset.max);
                            }}
                            className="w-4 h-4 text-[#0052FF] focus:ring-[#0052FF] border-gray-300 cursor-pointer"
                          />
                          <span className="text-xs font-bold">{preset.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. RATING SECTION */}
                <div className="space-y-3 pt-5">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Rating' : 'ደረጃ'}
                  </span>

                  <div className="space-y-2">
                    {[
                      { label: 'All Ratings', value: 0 },
                      { label: '4★+', value: 4 },
                      { label: '3★+', value: 3 },
                    ].map((rOpt) => {
                      const isSelected = selectedRatingFilter === rOpt.value;
                      return (
                        <label
                          key={`sheet-rating-${rOpt.value}`}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/70 dark:bg-amber-950/50 border-amber-500 text-gray-900 dark:text-white font-black shadow-xs'
                              : 'bg-gray-50/50 dark:bg-zinc-850/50 border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sheet-rating-opt"
                            checked={isSelected}
                            onChange={() => setSelectedRatingFilter(rOpt.value)}
                            className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-gray-300 cursor-pointer"
                          />
                          <span className="text-xs font-bold">{rOpt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 4. AVAILABILITY SECTION */}
                <div className="space-y-3 pt-5">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                    {language === 'en' ? 'Availability' : 'አቅርቦት'}
                  </span>

                  <div className="space-y-2">
                    {[
                      { id: 'ALL', label: 'All Items' },
                      { id: 'IN_STOCK', label: 'In Stock Only' },
                      { id: 'ON_SALE', label: 'On Sale & Featured' },
                    ].map((aOpt) => {
                      const isSelected = availabilityFilter === aOpt.id;
                      return (
                        <label
                          key={`sheet-avail-${aOpt.id}`}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-500 text-gray-900 dark:text-white font-black shadow-xs'
                              : 'bg-gray-50/50 dark:bg-zinc-850/50 border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sheet-avail-opt"
                            checked={isSelected}
                            onChange={() => setAvailabilityFilter(aOpt.id as any)}
                            className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                          />
                          <span className="text-xs font-bold">{aOpt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom Sheet Footer Controls */}
              <div className="p-4 bg-gray-50 dark:bg-zinc-950 border-t border-gray-150 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={handleClearAllFilters}
                  className="px-5 py-3 rounded-2xl text-xs font-extrabold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Clear' : 'አጽዳ'}
                </button>

                <button
                  onClick={() => setIsAdvancedFilterOpen(false)}
                  className="flex-1 py-3 px-5 bg-[#0052FF] hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-[#0052FF]/20 text-center cursor-pointer"
                >
                  {language === 'en'
                    ? `Show ${sortedAndFilteredProducts.length} products`
                    : `${sortedAndFilteredProducts.length} ምርቶችን አሳያቸው`}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Active Filter Badges Ribbon */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-gray-150 dark:border-zinc-800">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 dark:text-zinc-500 tracking-wider">
              {language === 'en' ? 'Active Filters:' : 'ንቁ ማጣሪያዎች፡'}
            </span>

            {/* Category badge */}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40">
                <span>Category: {categories.find(c => c.id === selectedCategory)?.nameEn || selectedCategory}</span>
                <button onClick={() => setSelectedCategory('all')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search query badge */}
            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                <span>"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Price badge */}
            {(minPriceInput !== '' || maxPriceInput !== '') && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
                <span>
                  ETB {minPriceInput || '0'} - {maxPriceInput || '∞'}
                </span>
                <button onClick={() => { setMinPriceInput(''); setMaxPriceInput(''); }} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Brand badges */}
            {selectedBrands.map(b => (
              <span key={`active-b-${b}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
                <span>Brand: {b}</span>
                <button onClick={() => setSelectedBrands(selectedBrands.filter(brand => brand !== b))} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Availability badge */}
            {availabilityFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                <span>
                  {availabilityFilter === 'IN_STOCK' ? 'In Stock Only' : availabilityFilter === 'ON_SALE' ? 'On Sale' : 'Top Rated (4.0+ ★)'}
                </span>
                <button onClick={() => setAvailabilityFilter('ALL')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer ml-auto"
            >
              {language === 'en' ? 'Clear All' : 'ሁሉንም አጽዳ'}
            </button>
          </div>
        )}

      {/* Main Grid Section */}
      <div id="products-grid-section" className="max-w-[1440px] mx-auto w-full px-4 md:px-8 mt-6">
        
        {isGridLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`grid-shimmer-${i}`} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/60 rounded-2xl overflow-hidden flex flex-col h-full space-y-3">
                <Shimmer className="aspect-[3/2] w-full rounded-none" />
                <div className="p-4 sm:p-5 space-y-3 flex flex-col flex-1 justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Shimmer className="h-3.5 w-20" />
                      <Shimmer className="h-3.5 w-12" />
                    </div>
                    <Shimmer className="h-4 w-full rounded" />
                    <Shimmer className="h-4 w-3/4 rounded" />
                  </div>
                  <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/40 flex justify-between items-center mt-auto">
                    <Shimmer className="h-6 w-24" />
                    <Shimmer className="h-8 w-20 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedAndFilteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-16 text-center border border-gray-150 dark:border-zinc-800 shadow-xs">
            <Search className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-gray-950 dark:text-white font-extrabold mb-1">{language === 'en' ? 'No items matched' : 'ምንም ምርት አልተገኘም'}</p>
            <p className="text-gray-400 dark:text-zinc-500 text-xs">{language === 'en' ? 'Try adjusting your search query or filters.' : 'እባክዎን ፍለጋዎን ያስተካክሉ።'}</p>
          </div>
        ) : (
          <GridContainer cols="auto-fill" gap="normal">
            {sortedAndFilteredProducts.map((p) => {
              const isFavorite = favorites.includes(p.id);
              const isCompared = comparedProductIds.includes(p.id);

              return (
                <ProductCard
                  key={p.id}
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
                  highlightSearchQuery={searchQuery}
                  layout="grid"
                />
              );
            })}
          </GridContainer>
        )}
      </div>

      {/* Product Detail Modal / Quick View */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-zinc-900 rounded-none sm:rounded-3xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl relative border-0 sm:border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 transition-colors">
            
            {/* Mobile Sticky Header Bar with Close Button */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-3 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between sm:hidden">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 truncate max-w-[240px]">
                {language === 'en' ? selectedProduct.nameEn : selectedProduct.nameAm}
              </span>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-full p-1.5 text-xs font-bold w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all shrink-0"
                title="Close Quick View"
              >
                ✕
              </button>
            </div>

            {/* Desktop Floating Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="hidden sm:flex absolute top-4 right-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-500 dark:text-zinc-400 rounded-full p-2 text-sm font-bold w-9 h-9 items-center justify-center z-50 transition-all border border-gray-150 dark:border-zinc-800 cursor-pointer shadow-xs"
              title="Close Quick View"
            >
              ✕
            </button>
            
            {(() => {
              const gallery = getProductGallery(selectedProduct);
              const mainImg = gallery[activeGalleryIndex] || selectedProduct.image;
              const activeStock = selectedVariant ? selectedVariant.onHand : selectedProduct.variants.reduce((acc, v) => acc + v.onHand, 0);
              const isOutOfStock = selectedVariant ? selectedVariant.onHand <= 0 : selectedProduct.variants.every(v => v.onHand <= 0);
              const isLowStock = selectedVariant 
                ? (selectedVariant.onHand > 0 && selectedVariant.onHand <= selectedProduct.lowStockThreshold)
                : (activeStock > 0 && activeStock <= selectedProduct.lowStockThreshold * selectedProduct.variants.length);

              return (
                <div className="grid grid-cols-1 md:grid-cols-12 w-full min-w-0">
                  <div className="col-span-full md:col-span-5 w-full min-w-0 bg-gray-50 dark:bg-zinc-950 p-2.5 sm:p-6 flex flex-col space-y-2.5 sm:space-y-4 justify-between border-b md:border-b-0 md:border-r border-gray-150 dark:border-zinc-800">
                    <div className="space-y-2.5 sm:space-y-4 w-full min-w-0">
                      {/* Main Image Container */}
                      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs group flex items-center justify-center p-0">
                        <LazyImage 
                          src={mainImg} 
                          alt={selectedProduct.nameEn} 
                          className="w-full h-full object-cover transition-all duration-300 transform group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg z-10 shadow-xs">
                          {language === 'en' ? 'High-Res Preview' : 'ከፍተኛ ጥራት ቅድመ-ዕይታ'}
                        </div>
                      </div>

                      {/* Thumbnail Indicators */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full min-w-0">
                        {gallery.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveGalleryIndex(idx)}
                            className={`aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all relative cursor-pointer flex items-center justify-center bg-gray-100 dark:bg-zinc-900 ${
                              activeGalleryIndex === idx 
                                ? 'border-kasma-blue scale-102 shadow-xs' 
                                : 'border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600'
                            }`}
                          >
                            <LazyImage src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            {activeGalleryIndex === idx && (
                              <div className="absolute inset-0 bg-kasma-blue/10 flex items-center justify-center">
                                <span className="bg-kasma-blue text-white text-[9px] font-extrabold px-1 rounded">✓</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Trust Badges on Desktop */}
                      <div className="hidden md:block space-y-2 pt-1">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-3.5 space-y-2 shadow-2xs w-full min-w-0">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                            <span>{language === 'en' ? 'Verified Quality Guarantee' : 'የተረጋገጠ የጥራት ዋስትና'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] w-full min-w-0">
                            <div className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/90 border border-gray-150 dark:border-zinc-700/80 flex items-center gap-1.5 text-gray-700 dark:text-zinc-200 min-w-0">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="font-semibold text-[10px] truncate">{language === 'en' ? '100% Authentic' : '100% እውነተኛ'}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800/90 border border-gray-150 dark:border-zinc-700/80 flex items-center gap-1.5 text-gray-700 dark:text-zinc-200 min-w-0">
                              <Truck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="font-semibold text-[10px] truncate">{language === 'en' ? 'Fast Shipping' : 'ፈጣን ማጓጓዣ'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DYNAMIC DELIVERY TIME ESTIMATOR - Placed in left column to fill empty space */}
                      <DeliveryTimeEstimator language={language} />
                    </div>
                  </div>

                  {/* Right Column: Detailed Product Description, Specs & Checkout Trigger (7 cols) */}
                  <div className="col-span-full md:col-span-7 w-full min-w-0 p-4 sm:p-6 md:p-8 flex flex-col space-y-4 sm:space-y-5">
                    <div className="space-y-3.5 sm:space-y-4 w-full min-w-0">
                      {/* Category & Brand Breadcrumb + Stock Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold truncate max-w-[200px]">
                          {selectedProduct.brand} • {categories.find(c => c.id === selectedProduct.category)?.nameEn}
                        </span>
                        
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-850 px-2.5 py-1 rounded-full border border-gray-150 dark:border-zinc-800 shrink-0">
                          <span className={`w-2 h-2 rounded-full relative flex shrink-0 ${
                            isOutOfStock 
                              ? 'bg-red-500' 
                              : isLowStock 
                                ? 'bg-orange-500 animate-pulse' 
                                : 'bg-green-500 animate-pulse'
                          }`}>
                            {!isOutOfStock && (
                              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                                isLowStock ? 'bg-orange-400' : 'bg-green-400'
                              }`} />
                            )}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-300 whitespace-nowrap">
                            {isOutOfStock 
                              ? (language === 'en' ? 'Out of Stock' : 'ክምችት አልቋል') 
                              : isLowStock 
                                ? (language === 'en' ? `Low Stock: Only ${activeStock} left` : `ክምችት ጥቂት፡ ${activeStock} ብቻ ቀሪ`)
                                : (language === 'en' ? `In Stock: ${activeStock} available` : `በክምችት ውስጥ፡ ${activeStock} አለ`)}
                          </span>
                        </div>
                      </div>

                      {/* Product Title */}
                      <h3 className="text-lg sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
                        {highlightText(language === 'en' ? selectedProduct.nameEn : selectedProduct.nameAm, searchQuery)}
                      </h3>

                      {/* Product Condition & Authenticity Section on Detail Page */}
                      <div className="bg-gray-50/90 dark:bg-zinc-850/80 p-3 sm:p-3.5 rounded-2xl border border-gray-200/80 dark:border-zinc-750/70 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedProduct.condition === 'SEALED' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{language === 'en' ? 'Factory Sealed' : 'በፋብሪካው የታሸገ'}</span>
                              </span>
                            ) : selectedProduct.condition === 'BRAND_NEW' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-100/90 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>{language === 'en' ? 'Brand New' : 'አዲስ (ያልተከፈተ)'}</span>
                              </span>
                            ) : selectedProduct.condition === 'OPEN_BOX' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>{language === 'en' ? 'Open Box' : 'ክፍት ሳጥን'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-100/90 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                <RotateCcw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                <span>{language === 'en' ? 'Certified Refurbished' : 'የታደሰ'}</span>
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 font-mono shadow-2xs">
                              <ShieldCheck className="w-3 h-3 text-[#0052FF]" />
                              <span>
                                {language === 'en'
                                  ? (selectedProduct.warrantyTextEn || `${selectedProduct.warrantyMonths || 12} Mo Official Warranty`)
                                  : (selectedProduct.warrantyTextAm || `የ${selectedProduct.warrantyMonths || 12} ወር ዋስትና`)}
                              </span>
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                            {language === 'en' ? 'Condition Verified' : 'ሁኔታው የተረጋገጠ'}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-600 dark:text-zinc-400 leading-snug">
                          {selectedProduct.condition === 'SEALED'
                            ? (language === 'en' 
                                ? '🔒 Factory Sealed: Manufacturer original box with intact tamper-evident holographic seal. Never opened, unsealed, or activated.' 
                                : '🔒 በፋብሪካው የታሸገ፡ የፋብሪካው ኦሪጅናል ማሸጊያ ያልተከፈተና ያልበራ አዲስ እቃ።')
                            : selectedProduct.condition === 'BRAND_NEW'
                              ? (language === 'en' 
                                  ? '✨ Brand New: 100% brand new, zero operational hours, with all genuine accessories and factory documentation.' 
                                  : '✨ አዲስ እቃ፡ 100% አዲስ ያልተጠቀሙበት እቃ ከሙሉ ኦሪጅናል መለዋወጫዎች ጋር።')
                              : selectedProduct.condition === 'OPEN_BOX'
                                ? (language === 'en' 
                                    ? '📦 Open Box: Original packaging opened for display or inspection. Device is in mint condition and 100% tested.' 
                                    : '📦 ክፍት ሳጥን፡ ለማሳያ ወይም ምርመራ የተከፈተ ሳጥን፣ 100% የሚሰራ ያለ ምንም ጉድለት።')
                                : (language === 'en' 
                                    ? '🔄 Certified Refurbished: Professionally inspected, repaired, and certified to meet original manufacturer standards.' 
                                    : '🔄 የታደሰ፡ በካስማ ቴክኒሻኖች በሚገባ የተፈተሸ እና የተረጋገጠ።')}
                        </p>
                      </div>

                      {/* Average Rating Summary */}
                      {(() => {
                        const { avg, count } = getProductRatingInfo(selectedProduct);
                        return (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                            {count > 0 ? (
                              <>
                                <div className="flex items-center text-amber-500 font-extrabold gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${
                                        s <= Math.round(avg) 
                                          ? 'fill-amber-500 text-amber-500' 
                                          : 'text-gray-200 dark:text-zinc-800'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-1 text-gray-900 dark:text-white font-mono">{avg}</span>
                                </div>
                                <span className="text-gray-350 dark:text-zinc-700">•</span>
                                <span 
                                  className="font-bold underline cursor-pointer hover:text-black dark:hover:text-white transition-all text-[11px]" 
                                  onClick={() => {
                                    const el = document.getElementById('reviews-section');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                >
                                  {count === 1 
                                    ? (language === 'en' ? '1 Customer Review' : '1 ደንበኛ ግምገማ')
                                    : (language === 'en' ? `${count} Customer Reviews` : `${count} ደንበኞች ግምገማዎች`)}
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-bold text-[11px] border border-gray-200/60 dark:border-zinc-750">
                                <span>{language === 'en' ? 'No ratings yet' : 'እስካሁን ምንም ደረጃ አልተሰጠውም'}</span>
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Detailed Description */}
                      <div className="bg-gray-50/80 dark:bg-zinc-800/80 p-3.5 sm:p-4 rounded-2xl border border-gray-150 dark:border-zinc-700/80 space-y-1.5 shadow-2xs">
                        <span className="text-[10px] text-gray-400 dark:text-zinc-400 font-extrabold uppercase tracking-widest block">
                          {language === 'en' ? 'Product Overview' : 'የምርት አጠቃላይ መግለጫ'}
                        </span>
                        <p className="text-gray-700 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed">
                          {highlightText(language === 'en' ? selectedProduct.descriptionEn : selectedProduct.descriptionAm, searchQuery)}
                        </p>
                      </div>

                      {/* DETAILED PRODUCT SPECIFICATIONS GRID */}
                      {(() => {
                        const specs = getProductSpecs(selectedProduct);
                        if (!specs || specs.length === 0) return null;
                        return (
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                              <Box className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              {language === 'en' ? 'Key Specifications' : 'ዋና ዋና መግለጫዎች'}
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {specs.map((spec, sIdx) => {
                                const isWeight = spec.labelEn.toLowerCase().includes('weight');
                                const isBattery = spec.labelEn.toLowerCase().includes('battery');
                                const isConn = spec.labelEn.toLowerCase().includes('connection') || spec.labelEn.toLowerCase().includes('wireless');
                                return (
                                  <div 
                                    key={sIdx} 
                                    className="p-2.5 sm:p-3 rounded-xl border bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 flex flex-col justify-between shadow-2xs"
                                  >
                                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-0.5">
                                      {isWeight ? (
                                        <Scale className="w-3 h-3 text-amber-500 shrink-0" />
                                      ) : isBattery ? (
                                        <Battery className="w-3 h-3 text-emerald-500 shrink-0" />
                                      ) : isConn ? (
                                        <Wifi className="w-3 h-3 text-blue-500 shrink-0" />
                                      ) : (
                                        <Box className="w-3 h-3 text-indigo-500 shrink-0" />
                                      )}
                                      <span>{language === 'en' ? spec.labelEn : spec.labelAm}</span>
                                    </div>
                                    <div className="font-semibold text-gray-900 dark:text-zinc-100 text-xs leading-snug">
                                      {language === 'en' ? spec.valueEn : spec.valueAm}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* SKU Options Selector */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest block">
                          {language === 'en' ? 'Select Option / SKU' : 'የእቃውን አይነት / SKU ይምረጡ'}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedProduct.variants.map(v => {
                            const isSelected = selectedVariant?.sku === v.sku;
                            const isVariantOutOfStock = v.onHand <= 0;
                            const isVariantLowStock = v.onHand > 0 && v.onHand <= selectedProduct.lowStockThreshold;
                            const totalCost = selectedProduct.price + v.priceOffset;
                            return (
                              <button
                                key={v.sku}
                                disabled={isVariantOutOfStock}
                                onClick={() => setSelectedVariant(v)}
                                className={`w-full p-3 rounded-xl border text-left text-xs transition-all duration-200 flex justify-between items-center cursor-pointer ${
                                  isSelected 
                                    ? 'border-kasma-blue bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-kasma-blue text-gray-950 dark:text-white shadow-xs' 
                                    : isVariantOutOfStock 
                                      ? 'border-gray-100 dark:border-zinc-850 bg-gray-50 dark:bg-zinc-900/50 text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                                      : 'border-gray-200 dark:border-zinc-800 hover:border-kasma-blue/70 dark:hover:border-kasma-blue/70 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold">{v.name}</p>
                                    <span className="text-[8px] font-mono text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                                      {v.sku}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      isVariantOutOfStock 
                                        ? 'bg-red-400' 
                                        : isVariantLowStock 
                                          ? 'bg-orange-400' 
                                          : 'bg-green-400'
                                    }`} />
                                    <p className="text-[9px] text-gray-400 dark:text-zinc-500">
                                      {v.onHand} {language === 'en' ? 'available' : 'በእጅ ያለ'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                  <p className="font-black text-gray-950 dark:text-white font-mono text-xs">{totalCost.toLocaleString()} ETB</p>
                                  {isSelected && (
                                    <span className="text-[9px] text-kasma-blue font-black flex items-center gap-0.5">
                                      <Check className="w-2.5 h-2.5" /> Selected
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Low Stock WhatsApp Customer Alert Banner */}
                      {isLowStock && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-3 rounded-2xl flex items-center justify-between gap-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                            <p className="font-bold text-amber-900 dark:text-amber-200 text-[11px] leading-tight">
                              {language === 'en'
                                ? `⚡ Low Stock Alert: Only ${activeStock} units left!`
                                : `⚡ የአክሲዮን እጥረት፡ እጅ ላይ የቀረው ${activeStock} ፍሬ ብቻ ነው!`}
                            </p>
                          </div>
                          <a
                            href={`https://wa.me/251911223344?text=${encodeURIComponent(
                              `Hello Kasma Sales Team, I see "${selectedProduct.nameEn}" (${selectedVariant?.sku || 'Default SKU'}) is running low in stock (${activeStock} left). I would like to reserve/order it immediately!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-[10px] px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all shrink-0 uppercase tracking-wider cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>{language === 'en' ? 'Reserve on WhatsApp' : 'በዋትስአፕ ያዙ'}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions: Grand Total & Add to Cart */}
                    <div className="pt-3 border-t border-gray-150 dark:border-zinc-800 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/80 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800">
                        <div className="flex items-center justify-between sm:block">
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-extrabold tracking-wider">{language === 'en' ? 'Calculated Total' : 'የተሰላ ጠቅላላ ዋጋ'}</span>
                          <p className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white font-mono mt-0.5">
                            {selectedVariant 
                              ? (selectedProduct.price + selectedVariant.priceOffset).toLocaleString() 
                              : selectedProduct.price.toLocaleString()}{' '}
                            ETB
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                          <button
                            disabled={!selectedVariant || selectedVariant.onHand <= 0}
                            onClick={() => {
                              if (selectedVariant) {
                                addToCart(selectedProduct, selectedVariant);
                                setSelectedProduct(null);
                                setIsCartOpen(true);
                              }
                            }}
                            className={`w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              (!selectedVariant || selectedVariant.onHand <= 0)
                                ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed border border-gray-150 dark:border-zinc-750'
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
                            <span>{language === 'en' ? 'Add To Cart' : 'ወደ ጋሪ አስገባ'}</span>
                          </button>

                          <button
                            disabled={!selectedVariant || selectedVariant.onHand <= 0}
                            onClick={() => {
                              if (selectedVariant) {
                                handleInstantBuy(selectedProduct, selectedVariant);
                              }
                            }}
                            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                              (!selectedVariant || selectedVariant.onHand <= 0)
                                ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed border border-gray-150 dark:border-zinc-750'
                                : 'bg-[#0052FF] hover:bg-blue-600 hover:scale-[1.02] active:scale-95 text-white'
                            }`}
                          >
                            <Zap className="w-4 h-4 fill-current text-amber-300" />
                            <span>{language === 'en' ? '⚡ Buy Now' : '⚡ አሁን ግዛ'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Clean 1-Line Trust & Payment Ribbon */}
                      <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-zinc-400 font-medium py-1">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                          {language === 'en' ? 'Doorstep Inspection' : 'ደጃፍ ላይ ፈትሾ መረከብ'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-indigo-500 shrink-0" />
                          {language === 'en' ? 'Store Warranty' : 'የሱቅ ዋስትና'}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-gray-700 dark:text-zinc-300">
                          telebirr / CBE Birr / Chapa / VISA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AMAZON-STYLE FREQUENTLY BOUGHT TOGETHER BUNDLE SYSTEM */}
                  {fbtProducts.length > 0 && (
                    <div className="col-span-full p-4 sm:p-6 md:p-8 bg-amber-500/[0.015] dark:bg-amber-500/[0.005] border-t border-gray-150 dark:border-zinc-800 transition-all">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2 text-left">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                        <span>{language === 'en' ? 'Frequently Bought Together' : 'ብዙ ጊዜ አብረው የሚገዙ ምርቶች'}</span>
                        <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ml-1.5 shrink-0">
                          {language === 'en' ? 'Bundle Discount Active' : 'የጥቅል ቅናሽ አለ'}
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* Left Side: Product Bundle Cards Grid (8 cols) */}
                        <div className={`col-span-full lg:col-span-8 grid ${
                          1 + fbtProducts.length >= 4 
                            ? 'grid-cols-3 sm:grid-cols-4' 
                            : 'grid-cols-3 sm:grid-cols-3'
                        } gap-1.5 sm:gap-4 items-stretch`}>
                          {/* Main item */}
                          <div className="h-full flex flex-col justify-between p-2 sm:p-4 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-amber-500/40 shadow-2xs hover:shadow-xs transition-all min-w-0">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-3">
                                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg truncate">
                                  {language === 'en' ? 'THIS ITEM' : 'ይህ ምርት'}
                                </span>
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                              </div>
                              <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 mb-1.5 sm:mb-3">
                                <img 
                                  src={selectedProduct.image} 
                                  alt={selectedProduct.nameEn}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                                />
                              </div>
                            </div>
                            <div className="text-left space-y-0.5 sm:space-y-1 min-w-0">
                              <p className="font-extrabold text-[10px] sm:text-xs text-gray-900 dark:text-white line-clamp-1 truncate leading-tight">
                                {language === 'en' ? selectedProduct.nameEn : selectedProduct.nameAm}
                              </p>
                              <p className="font-mono text-[11px] sm:text-sm font-black text-gray-950 dark:text-white pt-0.5 sm:pt-1 truncate">
                                {selectedProduct.price.toLocaleString()} ETB
                              </p>
                            </div>
                          </div>

                          {/* Complementary items */}
                          {fbtProducts.map((p) => {
                            const isChecked = fbtSelectedIds.includes(p.id);
                            return (
                              <div 
                                key={`fbt-chain-${p.id}`}
                                onClick={() => {
                                  if (isChecked) {
                                    setFbtSelectedIds(fbtSelectedIds.filter(id => id !== p.id));
                                  } else {
                                    setFbtSelectedIds([...fbtSelectedIds, p.id]);
                                  }
                                }}
                                className={`group h-full flex flex-col justify-between p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer shadow-2xs min-w-0 ${
                                  isChecked 
                                    ? 'bg-white dark:bg-zinc-900 border-amber-500/40 ring-1 ring-amber-500/20' 
                                    : 'bg-gray-50/80 dark:bg-zinc-950/40 border-gray-200/80 dark:border-zinc-800 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-3">
                                    <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                      <div className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded sm:rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                        isChecked 
                                          ? 'bg-amber-500 border-amber-500 text-white shadow-2xs' 
                                          : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                      }`}>
                                        {isChecked && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                                      </div>
                                      <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider truncate ${
                                        isChecked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-400'
                                      }`}>
                                        {isChecked ? (language === 'en' ? 'INCLUDED' : 'ተካቷል') : (language === 'en' ? 'ADD ITEM' : 'ጨምር')}
                                      </span>
                                    </div>
                                    <span className="text-amber-500 font-black text-xs sm:text-sm shrink-0">+</span>
                                  </div>

                                  <div className="w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 mb-1.5 sm:mb-3">
                                    <img 
                                      src={p.image} 
                                      alt={p.nameEn}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    />
                                  </div>
                                </div>

                                <div className="text-left space-y-0.5 sm:space-y-1 min-w-0">
                                  <div className="flex items-center gap-1 overflow-hidden">
                                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded truncate">
                                      {categories.find(c => c.id === p.category)?.nameEn || p.category}
                                    </span>
                                  </div>
                                  <p className="font-extrabold text-[10px] sm:text-xs text-gray-900 dark:text-white line-clamp-1 truncate leading-tight">
                                    {language === 'en' ? p.nameEn : p.nameAm}
                                  </p>
                                  <p className="font-mono text-[11px] sm:text-sm font-black text-gray-950 dark:text-white pt-0.5 sm:pt-1 truncate">
                                    {p.price.toLocaleString()} ETB
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Right Side: Total Summary Panel (4 cols) */}
                        {(() => {
                          // Compute total calculation
                          let normalSum = selectedProduct.price;
                          let itemsList: { product: Product; price: number }[] = [{ product: selectedProduct, price: selectedProduct.price }];
                          
                          fbtProducts.forEach(p => {
                            if (fbtSelectedIds.includes(p.id)) {
                              normalSum += p.price;
                              itemsList.push({ product: p, price: p.price });
                            }
                          });

                          // Discount tiers: 3 checked -> 15% discount; 2 checked -> 10% discount; 1 checked -> 0%
                          const checkedCount = itemsList.length;
                          const discountPct = checkedCount === 3 ? 15 : checkedCount === 2 ? 10 : 0;
                          const savingsAmount = Math.round(normalSum * (discountPct / 100));
                          const discountedBundlePrice = normalSum - savingsAmount;

                          // Override the discounted prices for individual items inside bundle
                          const finalItemsWithSaving = itemsList.map(item => ({
                            product: item.product,
                            price: Math.round(item.price * (1 - discountPct / 100))
                          }));

                          return (
                            <div className="col-span-full lg:col-span-4 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-2xs h-full">
                              <div className="text-left space-y-3">
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0052FF] bg-blue-50 dark:bg-zinc-800 px-2.5 py-1 rounded-md w-fit block">
                                  {language === 'en' ? 'Bundle Summary' : 'የጥቅል መግለጫ'}
                                </span>
                                
                                <div className="pt-2 flex justify-between items-baseline">
                                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                                    {language === 'en' ? `Total (${checkedCount} items)` : `ድምር (${checkedCount} እቃዎች)`}
                                  </span>
                                  <div className="text-right">
                                    {discountPct > 0 && (
                                      <span className="text-xs font-bold text-gray-400 font-mono line-through block">
                                        {normalSum.toLocaleString()} ETB
                                      </span>
                                    )}
                                    <span className="text-xl font-black font-mono text-gray-950 dark:text-white block">
                                      {discountedBundlePrice.toLocaleString()} ETB
                                    </span>
                                  </div>
                                </div>

                                {discountPct > 0 && (
                                  <div className="pt-1 flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">
                                    <span>{language === 'en' ? 'Bundle Savings' : 'የጥቅል ቁጠባ'}:</span>
                                    <span className="bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 font-bold font-mono text-xs">
                                      -{savingsAmount.toLocaleString()} ETB ({discountPct}%)
                                    </span>
                                  </div>
                                )}
                              </div>

                              <button
                                disabled={checkedCount === 0}
                                onClick={() => addBundleToCart(finalItemsWithSaving)}
                                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                  checkedCount === 0 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border' 
                                    : 'bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-sm hover:scale-[1.01]'
                                }`}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>
                                  {language === 'en' 
                                    ? `Add All ${checkedCount} to Cart` 
                                    : `ሁሉንም ${checkedCount} ጋሪ ውስጥ አስገባ`}
                                </span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Reviews & Ratings Section */}
                  <div id="reviews-section" className="col-span-full p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-zinc-950/40 border-t border-gray-150 dark:border-zinc-800 transition-all">
                    <h4 className="text-sm font-extrabold text-gray-950 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-kasma-blue" />
                      {language === 'en' ? 'Ratings & Reviews' : 'ደረጃዎች እና ግምገማዎች'}
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Review statistics & Review list */}
                      <div className="col-span-full lg:col-span-7 space-y-6">
                        {/* Summary Block */}
                        {(() => {
                          const { avg, count } = getProductRatingInfo(selectedProduct);
                          if (count === 0) {
                            return (
                              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-150 dark:border-zinc-800 text-center text-gray-500 dark:text-zinc-400">
                                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-zinc-700 mx-auto mb-2" />
                                <p className="font-extrabold text-xs">
                                  {language === 'en' ? 'No reviews yet' : 'እስካሁን ምንም ግምገማዎች የሉም'}
                                </p>
                                <p className="text-[11px] mt-1 text-gray-400">
                                  {language === 'en' 
                                    ? 'Be the first to review this product after your purchase!' 
                                    : 'ይህን ምርት ከገዙ በኋላ የመጀመሪያው ግምገማ ሰጪ ይሁኑ!'}
                                </p>
                              </div>
                            );
                          }

                          // Calculate star distribution percentages
                          const distribution = [0, 0, 0, 0, 0];
                          selectedProduct.reviews?.forEach(r => {
                            if (r.rating >= 1 && r.rating <= 5) {
                              distribution[r.rating - 1]++;
                            }
                          });

                          return (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-150 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                              <div className="col-span-full sm:col-span-4 text-center sm:border-r border-gray-150 dark:border-zinc-800 sm:pr-6">
                                <p className="text-4xl font-black text-gray-950 dark:text-white font-mono">{avg}</p>
                                <div className="flex justify-center text-amber-500 my-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${
                                        s <= Math.round(avg) ? 'fill-amber-500 text-amber-500' : 'text-gray-205 dark:text-zinc-850'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                  {count} {count === 1 ? 'Review' : 'Reviews'}
                                </p>
                              </div>
                              <div className="col-span-full sm:col-span-8 space-y-1.5">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                  const countForStar = distribution[stars - 1];
                                  const percentage = count > 0 ? (countForStar / count) * 100 : 0;
                                  return (
                                    <div key={stars} className="flex items-center gap-3 text-xs">
                                      <span className="w-3 text-right font-bold text-gray-600 dark:text-zinc-400 font-mono">{stars}</span>
                                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                      <div className="flex-grow bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                        <div 
                                          className="bg-amber-500 h-full rounded-full" 
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                      <span className="w-8 text-right text-gray-400 font-mono text-[11px]">{countForStar}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {/* List of Reviews */}
                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
                          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                            {selectedProduct.reviews.map((rev) => (
                              <div 
                                key={rev.id} 
                                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-150 dark:border-zinc-800 space-y-2.5 transition-all shadow-2xs hover:shadow-xs"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-extrabold text-xs text-gray-950 dark:text-white">{rev.reviewerName}</p>
                                      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Check className="w-2.5 h-2.5" /> Verified Purchase
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-0.5">
                                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex text-amber-500 shrink-0">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-3.5 h-3.5 ${
                                          s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200 dark:text-zinc-800'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 dark:text-zinc-300 text-xs leading-relaxed italic">
                                  "{rev.comment}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Submit Form */}
                      <div className="col-span-full lg:col-span-5 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-150 dark:border-zinc-800 h-fit space-y-4">
                        <div>
                          <h5 className="font-bold text-gray-950 dark:text-white text-sm uppercase tracking-wider">
                            {language === 'en' ? 'Write a Review' : 'ግምገማ ይጻፉ'}
                          </h5>
                          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 mb-3.5">
                            {language === 'en' 
                              ? 'Share your experience to help other buyers. Verified purchase is required.' 
                              : 'ሌሎች ገዢዎችን ለመርዳት የእርስዎን ተሞክሮ ያካፍሉ። የተረጋገጠ ግዢ ያስፈልጋል።'}
                          </p>

                          {(() => {
                            const productOrders = allOrders.filter(order =>
                              order.items.some(item => item.product.id === selectedProduct.id)
                            );
                            if (productOrders.length > 0) {
                              return (
                                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] rounded-2xl flex items-center justify-between gap-2.5 leading-normal">
                                  <span>
                                    {language === 'en'
                                      ? '💡 Demo Tip: Verified orders found for this product!'
                                      : '💡 ዲሞ ጠቃሚ ምክር፡ ለዚህ ምርት የተረጋገጠ ትዕዛዝ ተገኝቷል!'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRevPhone(productOrders[0].customerPhone);
                                      setRevName(productOrders[0].customerName);
                                    }}
                                    className="underline font-black uppercase tracking-wider text-xs hover:text-[#0052FF] dark:hover:text-blue-400 cursor-pointer shrink-0"
                                  >
                                    {language === 'en' ? 'Auto-fill' : 'ሙላ'}
                                  </button>
                                </div>
                              );
                            } else {
                              return (
                                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] rounded-2xl flex items-center justify-between gap-2.5 leading-normal">
                                  <span>
                                    {language === 'en'
                                      ? 'No purchase history found for this product.'
                                      : 'ለዚህ ምርት የግዢ ታሪክ አልተገኘም።'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const mockOrder = {
                                        id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
                                        customerId: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
                                        customerName: 'Dawit Abera',
                                        customerPhone: '+251912345678',
                                        items: [{
                                          product: selectedProduct,
                                          sku: selectedProduct.variants[0]?.sku || 'DEFAULT',
                                          variantName: selectedProduct.variants[0]?.name || 'Standard',
                                          quantity: 1,
                                          price: selectedProduct.price
                                        }],
                                        subtotal: selectedProduct.price,
                                        shippingFee: 150,
                                        total: selectedProduct.price + 150,
                                        status: 'DELIVERED',
                                        paymentMethod: 'TELEBIRR',
                                        createdAt: new Date().toISOString(),
                                        channel: 'WEB',
                                        shippingAddress: 'Bole, Addis Ababa'
                                      };
                                      // @ts-ignore
                                      await onAddOrder(mockOrder);
                                      setRevPhone('+251912345678');
                                      setRevName('Dawit Abera');
                                      showToast(
                                        language === 'en'
                                          ? 'Simulated purchase added! Info auto-filled.'
                                          : 'የተመሰለ ግዢ ተጨምሯል! መረጃው ተሞልቷል።',
                                        'success'
                                      );
                                    }}
                                    className="underline font-black uppercase tracking-wider text-[10px] hover:text-amber-900 dark:hover:text-amber-300 cursor-pointer shrink-0"
                                  >
                                    {language === 'en' ? 'Simulate' : 'አስመስል'}
                                  </button>
                                </div>
                              );
                            }
                          })()}
                        </div>

                        {reviewError && (
                          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-150 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                            <span>⚠️</span>
                            <span className="font-medium leading-relaxed">{reviewError}</span>
                          </div>
                        )}

                        <form onSubmit={(e) => handleReviewSubmit(e, selectedProduct.id)} className="space-y-4">
                          {/* Stars Selector */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                              {language === 'en' ? 'Your Rating' : 'የእርስዎ ደረጃ'}
                            </label>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  type="button"
                                  key={s}
                                  onClick={() => setReviewRating(s)}
                                  className="text-amber-500 hover:scale-110 transition-all p-0.5 cursor-pointer focus:outline-none"
                                >
                                  <Star
                                    className={`w-7 h-7 ${
                                      s <= reviewRating 
                                        ? 'fill-amber-500 text-amber-500' 
                                        : 'text-gray-200 dark:text-zinc-800'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Reviewer Name */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                              {language === 'en' ? 'Full Name' : 'ሙሉ ስም'}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={language === 'en' ? 'e.g. Dawit Abera' : 'ለምሳሌ ዳዊት አበራ'}
                              value={revName}
                              onChange={(e) => setRevName(e.target.value)}
                              className="w-full border border-gray-155 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue focus:bg-white dark:focus:bg-zinc-900 transition-all"
                            />
                          </div>

                          {/* Reviewer Phone */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                              {language === 'en' ? 'Checkout Mobile Phone' : 'ትእዛዝ የፈጸሙበት ስልክ'}
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="+251912345678"
                              value={revPhone}
                              onChange={(e) => setRevPhone(e.target.value)}
                              className="w-full border border-gray-155 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue focus:bg-white dark:focus:bg-zinc-900 transition-all font-mono"
                            />
                            <p className="text-[9px] text-gray-400 leading-normal">
                              {language === 'en' 
                                ? 'We verify your purchase history against this phone number.' 
                                : 'በዚህ ስልክ ቁጥር መሰረት የገዙበትን ታሪክ እናረጋግጣለን።'}
                            </p>
                          </div>

                          {/* Comment */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                              {language === 'en' ? 'Review Comments' : 'የግምገማው ዝርዝር'}
                            </label>
                            <textarea
                              required
                              rows={3}
                              placeholder={language === 'en' ? 'Tell us what you loved or how we can improve...' : 'የወደዱትን ወይም እንድናሻሽል የሚፈልጉትን ይንገሩን...'}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="w-full border border-gray-155 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-kasma-blue focus:bg-white dark:focus:bg-zinc-900 transition-all leading-relaxed"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              isSubmittingReview
                                ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                                : 'bg-kasma-blue hover:bg-blue-600 text-white shadow-sm'
                            }`}
                          >
                            {isSubmittingReview ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>{language === 'en' ? 'Submitting...' : 'እየገባ ነው...'}</span>
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{language === 'en' ? 'Post Review' : 'ግምገማውን ይጻፉ'}</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Quick View / Quick Purchase Modal */}
      {quickBuyProduct && (
        <div 
          onClick={() => setQuickBuyProduct(null)}
          className="fixed inset-0 bg-black/75 z-55 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full shadow-2xl relative border-t sm:border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 my-0 sm:my-auto"
          >
            {/* Modal Fixed Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[#0052FF] dark:text-blue-400 uppercase tracking-widest font-black">
                      {language === 'en' ? 'Quick Preview' : 'ፈጣን እይታ'}
                    </span>
                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.2 rounded-full font-bold flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {language === 'en' ? 'Verified' : 'የተረጋገጠ'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-gray-950 dark:text-white truncate">
                    {quickBuyProduct.merchantName || 'KASMA Official Store'}
                  </h3>
                </div>
              </div>

              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setQuickBuyProduct(null)}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400 rounded-full p-1.5 sm:p-2 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-xs shrink-0 ml-2"
                title={language === 'en' ? 'Close Preview' : 'እይታ ዝጋ'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Inner Scroll Body */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 sm:space-y-6 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start">
                
                {/* Left Column / Mobile Image Gallery */}
                <div className="md:col-span-5 flex flex-col gap-2.5">
                  
                  {/* Title & Rating (Prominently displayed on top for Mobile) */}
                  <div className="md:hidden space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/40">
                        {quickBuyProduct.brand}
                      </span>
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 px-2 py-0.5 rounded-full text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>4.8</span>
                        <span className="text-gray-400 font-normal">
                          ({quickBuyProduct.reviews?.length || 18})
                        </span>
                      </div>
                    </div>
                    <h2 className="text-base font-black text-gray-950 dark:text-white leading-snug">
                      {language === 'en' ? quickBuyProduct.nameEn : quickBuyProduct.nameAm}
                    </h2>
                  </div>

                  {/* Image Frame: Compact height on mobile, full square on desktop */}
                  <div className="relative aspect-[4/3] sm:aspect-square h-44 xs:h-52 sm:h-auto w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 group shadow-inner">
                    {(() => {
                      const gallery = getProductGallery(quickBuyProduct);
                      const currentImg = gallery[quickViewImageIndex] || quickBuyProduct.image;
                      return (
                        <LazyImage
                          src={currentImg}
                          alt={quickBuyProduct.nameEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      );
                    })()}

                    {/* Category Pill Tag */}
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {quickBuyProduct.category}
                    </span>

                    {/* Wishlist Heart Toggle Button */}
                    <button
                      type="button"
                      title={language === 'en' ? 'Save to Wishlist' : 'ወደ ተወዳጆች ያስቀምጡ'}
                      onClick={(e) => handleToggleFavorite(quickBuyProduct.id, e)}
                      className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95 ${
                        favorites.includes(quickBuyProduct.id)
                          ? 'bg-orange-50 dark:bg-orange-950/90 text-orange-500 dark:text-orange-400 border border-orange-300 dark:border-orange-800'
                          : 'bg-white/90 dark:bg-zinc-900/90 text-gray-500 hover:text-orange-500 border border-white/80 dark:border-zinc-700'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${favorites.includes(quickBuyProduct.id) ? 'fill-orange-500 text-orange-500' : ''}`} />
                    </button>
                  </div>

                  {/* Thumbnail Gallery Switcher */}
                  {(() => {
                    const gallery = getProductGallery(quickBuyProduct);
                    if (gallery.length <= 1) return null;
                    return (
                      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                        {gallery.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setQuickViewImageIndex(idx)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-gray-100 dark:bg-zinc-900 ${
                              quickViewImageIndex === idx
                                ? 'border-[#0052FF] scale-105 shadow-xs'
                                : 'border-gray-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <LazyImage src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Trust & Guarantee Badges (Desktop View) */}
                  <div className="hidden md:block p-3 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-150 dark:border-zinc-850 space-y-2 mt-1">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{language === 'en' ? '100% Authentic Quality Guarantee' : '100% ኦሪጅናል ጥራት ዋስትና'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 text-[11px] font-bold">
                      <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{language === 'en' ? 'Fast Express Delivery in Addis Ababa' : 'ፈጣን ኤክስፕረስ ማድረሻ በአዲስ አበባ'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 text-[11px] font-bold">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{language === 'en' ? 'Easy Return & Protection' : 'ቀላል ተመላሽ እና ጥበቃ'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Title, Specs, Options, Pricing & CTAs */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-3.5 sm:space-y-4 text-left min-w-0">
                  <div className="space-y-3 min-w-0">
                    
                    {/* Brand & Rating Row (Desktop View) */}
                    <div className="hidden md:flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                        <Tag className="w-3 h-3 inline mr-1" />
                        {quickBuyProduct.brand}
                      </span>

                      {/* Star Rating Capsule */}
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 px-2.5 py-1 rounded-full text-amber-800 dark:text-amber-300 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>4.8</span>
                        <span className="text-gray-400 font-normal text-[10px]">
                          ({quickBuyProduct.reviews?.length || 18} {language === 'en' ? 'reviews' : 'ግምገማዎች'})
                        </span>
                      </div>
                    </div>

                    {/* Title in English and Amharic (Desktop View) */}
                    <div className="hidden md:block">
                      <h2 className="text-base sm:text-lg font-black text-gray-950 dark:text-white leading-snug">
                        {language === 'en' ? quickBuyProduct.nameEn : quickBuyProduct.nameAm}
                      </h2>
                      {language === 'en' ? (
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{quickBuyProduct.nameAm}</p>
                      ) : (
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{quickBuyProduct.nameEn}</p>
                      )}
                    </div>

                    {/* Price Banner */}
                    <div className="p-3 sm:p-3.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 rounded-2xl border border-blue-100/80 dark:border-zinc-800 flex items-center justify-between gap-2.5">
                      <div>
                        <span className="text-[9px] uppercase font-extrabold text-gray-400 tracking-wider block">
                          {language === 'en' ? 'Calculated Price' : 'የተሰላ ዋጋ'}
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="font-mono text-lg sm:text-xl font-black text-[#0052FF] dark:text-blue-400">
                            {((quickBuyVariant ? quickBuyProduct.price + quickBuyVariant.priceOffset : quickBuyProduct.price) * quickBuyQuantity).toLocaleString()} ETB
                          </span>
                          {quickBuyQuantity > 1 && (
                            <span className="text-[10px] text-gray-500 font-bold font-mono">
                              ({(quickBuyVariant ? quickBuyProduct.price + quickBuyVariant.priceOffset : quickBuyProduct.price).toLocaleString()} ETB / {language === 'en' ? 'unit' : 'ፍሬ'})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Status Badge */}
                      <div>
                        {(() => {
                          const activeStock = quickBuyVariant ? quickBuyVariant.onHand : quickBuyProduct.variants.reduce((a, v) => a + v.onHand, 0);
                          if (activeStock <= 0) {
                            return (
                              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl font-black text-[11px] sm:text-xs whitespace-nowrap">
                                {language === 'en' ? 'Out of Stock' : 'አልቋል'}
                              </span>
                            );
                          } else if (activeStock <= 3) {
                            return (
                              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl font-black text-[11px] sm:text-xs flex items-center gap-1 whitespace-nowrap">
                                <Flame className="w-3 h-3 fill-current" />
                                {language === 'en' ? `Low Stock (${activeStock})` : `ጥቂት ቀርቷል (${activeStock})`}
                              </span>
                            );
                          } else {
                            return (
                              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl font-black text-[11px] sm:text-xs whitespace-nowrap">
                                ✓ {language === 'en' ? `In Stock (${activeStock})` : `አለ (${activeStock})`}
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </div>

                    {/* Product Description Snippet */}
                    <div className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed bg-gray-50/50 dark:bg-zinc-950/50 p-2.5 sm:p-3 rounded-2xl border border-gray-100 dark:border-zinc-800/80 line-clamp-2 sm:line-clamp-3">
                      {language === 'en' ? quickBuyProduct.descriptionEn : quickBuyProduct.descriptionAm}
                    </div>

                    {/* Variant Selection Grid */}
                    {quickBuyProduct.variants && quickBuyProduct.variants.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                          {language === 'en' ? 'Select Variant / Color' : 'አማራጭ / ቀለም ይምረጡ'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {quickBuyProduct.variants.map((v) => {
                            const isSelected = quickBuyVariant?.sku === v.sku;
                            const totalCost = quickBuyProduct.price + v.priceOffset;
                            return (
                              <button
                                key={v.sku}
                                type="button"
                                onClick={() => {
                                  setQuickBuyVariant(v);
                                  setQuickBuyQuantity(1);
                                }}
                                className={`p-2 sm:p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-[#0052FF] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#0052FF]'
                                    : 'border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-extrabold text-gray-950 dark:text-white truncate">
                                    {v.name}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400">
                                    {totalCost.toLocaleString()} ETB
                                  </span>
                                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-md ${v.onHand > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                                    {v.onHand > 0 ? `${v.onHand} in stock` : 'Out'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quantity Controller */}
                    <div className="flex items-center justify-between p-2.5 sm:p-3 border border-gray-150 dark:border-zinc-800 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                          {language === 'en' ? 'Select Quantity' : 'ብዛት ይምረጡ'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-zinc-950 p-1 sm:p-1.5 rounded-xl border border-gray-200/60 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setQuickBuyQuantity(prev => Math.max(1, prev - 1))}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-black text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-lg shadow-xs hover:bg-gray-50 transition-colors cursor-pointer select-none text-sm"
                        >
                          −
                        </button>
                        <span className="font-mono text-xs sm:text-sm font-black text-gray-950 dark:text-white px-1 sm:px-2">
                          {quickBuyQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const maxStock = quickBuyVariant ? quickBuyVariant.onHand : 99;
                            if (quickBuyQuantity + 1 > maxStock) {
                              showToast(language === 'en' 
                                ? `Cannot select more than ${maxStock} items.` 
                                : `ከ ${maxStock} በላይ መምረጥ አይቻልም።`, 
                                'warning'
                              );
                            } else {
                              setQuickBuyQuantity(prev => prev + 1);
                            }
                          }}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-black text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-lg shadow-xs hover:bg-gray-50 transition-colors cursor-pointer select-none text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Primary Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        disabled={!quickBuyVariant || quickBuyVariant.onHand <= 0}
                        onClick={() => {
                          if (!quickBuyVariant) return;
                          addToCart(quickBuyProduct, quickBuyVariant, quickBuyQuantity);
                          setQuickBuyProduct(null);
                          showToast(language === 'en' 
                            ? `Added ${quickBuyQuantity}x ${quickBuyProduct.nameEn} to your cart!` 
                            : `${quickBuyQuantity}x ${quickBuyProduct.nameAm} ወደ ሱቅ ጋሪዎ ተጨምሯል!`,
                            'success'
                          );
                        }}
                        className={`py-3 px-3 sm:px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                          !quickBuyVariant || quickBuyVariant.onHand <= 0
                            ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                            : 'bg-[#0052FF] hover:bg-blue-600 text-white hover:shadow-md active:scale-98'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{language === 'en' ? 'Add To Cart' : 'ወደ ጋሪ אסገባ'}</span>
                      </button>

                      {/* Instant Buy Button */}
                      <button
                        type="button"
                        disabled={!quickBuyVariant || quickBuyVariant.onHand <= 0}
                        onClick={() => {
                          if (!quickBuyVariant) return;
                          addToCart(quickBuyProduct, quickBuyVariant, quickBuyQuantity);
                          setQuickBuyProduct(null);
                          setIsCartOpen(true);
                          showToast(language === 'en' 
                            ? 'Proceeding to checkout...' 
                            : 'ወደ ክፍያ በመሄድ ላይ...',
                            'info'
                          );
                        }}
                        className={`py-3 px-3 sm:px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          !quickBuyVariant || quickBuyVariant.onHand <= 0
                            ? 'bg-gray-100 dark:bg-zinc-800 border-transparent text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                            : 'bg-amber-400 hover:bg-amber-500 text-black border-amber-500 hover:shadow-md active:scale-98'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-black" />
                        <span>{language === 'en' ? 'Buy Now' : 'አሁኑኑ ግዛ'}</span>
                      </button>
                    </div>

                    {/* Compact Mobile Trust Ribbon */}
                    <div className="md:hidden flex items-center justify-center flex-wrap gap-2 text-[9.5px] text-gray-500 dark:text-zinc-400 font-bold pt-1.5 border-t border-gray-100 dark:border-zinc-800/80">
                      <span>🛡️ 100% Authentic</span>
                      <span>·</span>
                      <span>🚚 Express Delivery</span>
                      <span>·</span>
                      <span>🔄 Easy Returns</span>
                    </div>

                    {/* View Full Page & Reviews button */}
                    <button
                      type="button"
                      onClick={() => {
                        const prod = quickBuyProduct;
                        setQuickBuyProduct(null);
                        handleOpenProduct(prod);
                      }}
                      className="w-full py-2 bg-gray-50 dark:bg-zinc-850 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-150 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{language === 'en' ? 'View Full Page & Reviews' : 'ሙሉ ገጽ እና ግምገማዎችን እይ'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Cart Slider Drawer / Mobile Fullscreen Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full md:max-w-md h-[100dvh] flex flex-col shadow-2xl relative animate-slide-in border-l border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 overflow-hidden">
            
            {/* 1. Header (Fixed top) */}
            <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 text-gray-950 dark:text-white border-b border-gray-150 dark:border-zinc-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="md:hidden text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 p-1.5 rounded-full cursor-pointer mr-0.5"
                  title="Back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-[#0052FF]" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#0052FF] text-white text-[9px] font-mono font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-gray-950 dark:text-white">
                    {language === 'en' ? 'My Shopping Cart' : 'የእኔ ሱቅ ጋሪ'}
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                    {cart.length === 0 
                      ? (language === 'en' ? '0 items' : '0 እቃዎች')
                      : cart.length === 1 
                      ? (language === 'en' ? '1 unique item' : '1 ልዩ እቃ') 
                      : (language === 'en' ? `${cart.length} unique items` : `${cart.length} ልዩ እቃዎች`)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsShareCartModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#0052FF] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                    title="Share Cart Link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{language === 'en' ? 'Share Cart' : 'ጋሪ አጋራ'}</span>
                  </button>
                )}
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-1.5 w-8 h-8 flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 2. Scrollable Body: Cart Items & Promo Codes */}
            <div className="flex-grow overflow-y-auto p-3.5 sm:p-5 space-y-3.5 scrollbar-thin bg-gray-50/70 dark:bg-zinc-950/70">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-gray-400 dark:text-zinc-500 py-16">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-3 border border-gray-200 dark:border-zinc-700/50 shadow-inner">
                    <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-zinc-600" />
                  </div>
                  <p className="font-extrabold text-base text-gray-700 dark:text-zinc-300">
                    {language === 'en' ? 'Your cart is empty' : 'ጋሪዎ ባዶ ነው'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed">
                    {language === 'en' ? 'Explore our high quality products and add them to get started.' : 'እባክዎን ምርቶችን ይጎብኙና ወደ ጋሪ ያስገቡ።'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 px-6 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    {language === 'en' ? 'Start Shopping' : 'ግዢ ጀምር'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Free Express Shipping Progress Bar */}
                  {(() => {
                    const freeShippingThreshold = 25000;
                    const amountLeft = Math.max(0, freeShippingThreshold - cartSubtotal);
                    const progress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
                    return (
                      <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 dark:from-amber-500/20 dark:via-blue-500/20 dark:to-indigo-500/20 p-3 rounded-2xl border border-blue-200/60 dark:border-blue-800/50 shadow-2xs space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 text-[11px] sm:text-xs">
                            <Truck className="w-4 h-4 text-[#0052FF] shrink-0" />
                            {amountLeft > 0 ? (
                              language === 'en' ? (
                                <span>Add <span className="font-mono text-[#0052FF] dark:text-blue-400 font-black">{amountLeft.toLocaleString()} ETB</span> for FREE Express Shipping</span>
                              ) : (
                                <span>ነፃ ኤክስፕረስ ማጓጓዣ ለማግኘት <span className="font-mono text-[#0052FF] font-black">{amountLeft.toLocaleString()} ብር</span> ጨምሩ</span>
                              )
                            ) : (
                              language === 'en' ? '🎉 You unlocked FREE Kasma Express Shipping!' : '🎉 ነፃ የካስማ ኤክስፕረስ ማጓጓዣ አግኝተዋል!'
                            )}
                          </span>
                          <span className="text-[10px] font-mono font-black text-[#0052FF] dark:text-blue-400 shrink-0 ml-1">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Share Cart Quick Banner */}
                  <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 p-2.5 sm:p-3 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0 w-full xs:w-auto">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0052FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-[11px] sm:text-xs text-gray-900 dark:text-zinc-100 truncate leading-snug">
                          {language === 'en' ? 'Share Cart with Friends' : 'ጋሪዎን ለጓደኞችዎ ያጋሩ'}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-zinc-400 truncate leading-none mt-0.5">
                          {language === 'en' ? 'Generate a shareable link' : 'የጋሪዎን ዕቃዎች በሊንክ ይላኩ'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end xs:self-center w-full xs:w-auto justify-end">
                      <button
                        type="button"
                        onClick={handleCopyCartLink}
                        className="px-2.5 py-1.5 bg-[#0052FF] hover:bg-blue-600 active:scale-95 text-white text-[11px] font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSharedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>{language === 'en' ? 'Copied!' : 'ተቀድቷል!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{language === 'en' ? 'Copy Link' : 'ሊንክ ቅዳ'}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsShareCartModalOpen(true)}
                        className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 rounded-xl transition-all cursor-pointer"
                        title="Share Options"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-2.5 sm:space-y-3">
                    {cart.map((item) => {
                      const isRemoving = removingSkus.includes(item.sku);
                      const isRecentlyAdded = recentlyAddedSkus.includes(item.sku);
                      const isRecentlyUpdated = recentlyUpdatedSku === item.sku;

                      return (
                        <div 
                          key={item.sku} 
                          className={`p-3 sm:p-4 rounded-2xl border flex gap-3 relative shadow-xs transition-all duration-300 transform-gpu ${
                            isRemoving 
                              ? 'opacity-0 scale-90 -translate-x-6 max-h-0 py-0 my-0 border-transparent overflow-hidden pointer-events-none' 
                              : isRecentlyAdded
                              ? 'bg-blue-50/90 dark:bg-blue-950/40 border-[#0052FF] shadow-md scale-[1.02] ring-2 ring-[#0052FF]/30 animate-in fade-in slide-in-from-right-6 duration-300'
                              : isRecentlyUpdated
                              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400/60 scale-[1.01] shadow-xs'
                              : 'bg-white dark:bg-zinc-850/80 border-gray-150 dark:border-zinc-800 hover:border-gray-250 dark:hover:border-zinc-700 animate-in fade-in slide-in-from-right-4 duration-250'
                          }`}
                        >
                          <img 
                            src={item.product.image} 
                            alt={item.product.nameEn} 
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-xl shrink-0 border border-gray-150 dark:border-zinc-800"
                          />
                          <div className="flex-grow min-w-0 pr-6">
                            <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider">{item.product.brand}</p>
                            <h5 className="font-extrabold text-gray-950 dark:text-white text-xs sm:text-sm truncate">
                              {language === 'en' ? item.product.nameEn : item.product.nameAm}
                            </h5>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-400 font-medium mt-0.5 truncate">{item.variantName}</p>
                            <p className="text-xs sm:text-sm font-black text-[#0052FF] dark:text-blue-400 font-mono mt-1">
                              {(item.price * item.quantity).toLocaleString()} ETB
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal ml-1">
                                  ({item.price.toLocaleString()} x {item.quantity})
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Absolute Top-Right Remove Button */}
                          <button 
                            onClick={() => handleRemoveFromCart(item.sku)} 
                            title="Remove item"
                            className="absolute top-2.5 right-2.5 text-gray-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                          >
                            ✕
                          </button>

                          {/* Bottom-Right Quantity Selector */}
                          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 border border-gray-200 dark:border-zinc-750 bg-gray-50 dark:bg-zinc-900 rounded-xl p-0.5">
                            <button 
                              onClick={() => updateCartQty(item.sku, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              -
                            </button>
                            <span className={`text-xs font-black w-5 text-center text-gray-950 dark:text-white font-mono transition-transform ${isRecentlyUpdated ? 'scale-125 text-[#0052FF]' : ''}`}>
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateCartQty(item.sku, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code Input & Discount Coupons Block */}
                  <div className="bg-white dark:bg-zinc-900 p-3 sm:p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800 space-y-2.5 shadow-xs">
                    <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                      {language === 'en' ? '🏷️ PROMO CODE / DISCOUNT COUPON' : '🏷️ የቅናሽ ኩፖን ኮድ'}
                    </span>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={language === 'en' ? 'e.g. KASMA10' : 'ምሳሌ KASMA10'}
                        value={promoCodeInput}
                        onChange={(e) => {
                          setPromoCodeInput(e.target.value);
                          setPromoError(null);
                        }}
                        disabled={!!appliedPromo}
                        className="flex-grow border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF] uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400 disabled:bg-gray-100 dark:disabled:bg-zinc-850 disabled:text-gray-400"
                      />
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          {language === 'en' ? 'Remove' : 'አስወግድ'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyPromo()}
                          className="bg-[#0052FF] hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
                        >
                          {language === 'en' ? 'Apply' : 'አስገባ'}
                        </button>
                      )}
                    </div>

                    {promoError && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold px-1">{promoError}</p>
                    )}

                    {promoSuccessMessage && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-1 leading-relaxed">{promoSuccessMessage}</p>
                    )}

                    {/* Available Offers Accordion */}
                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <details className="group">
                        <summary className="list-none flex items-center justify-between text-[10px] font-black text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white cursor-pointer select-none">
                          <span>{language === 'en' ? 'View Active Offers 💡' : 'የሚገኙ ልዩ ቅናሾች 💡'}</span>
                          <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform text-gray-450" />
                        </summary>
                        <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {promoCodes.map((promo) => {
                            const isEligible = !promo.minSubtotal || cartSubtotal >= promo.minSubtotal;
                            const minSub = promo.minSubtotal || 0;
                            return (
                              <div 
                                key={promo.code} 
                                onClick={() => {
                                  if (isEligible && !appliedPromo) {
                                    setPromoCodeInput(promo.code);
                                    handleApplyPromo(promo.code);
                                  } else if (!isEligible) {
                                    showToast(
                                      language === 'en'
                                        ? `Minimum order of ${minSub.toLocaleString()} ETB required for ${promo.code}`
                                        : `ለ${promo.code} ቢያንስ ${minSub.toLocaleString()} ብር ግዢ ያስፈልጋል`,
                                      'warning'
                                    );
                                  }
                                }}
                                className={`p-2 rounded-xl border transition-all text-left text-[11px] flex justify-between items-center ${
                                  appliedPromo?.code === promo.code
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                    : isEligible
                                    ? 'bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-850 border-gray-150 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:text-black cursor-pointer'
                                    : 'bg-gray-50/40 dark:bg-zinc-950/20 border-gray-100 dark:border-zinc-850 text-gray-400 dark:text-zinc-600 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <div className="min-w-0 pr-1">
                                  <span className="font-mono font-black border border-dashed border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[9px] mr-1 text-gray-950 dark:text-white">
                                    {promo.code}
                                  </span>
                                  <span className="font-medium text-[10px] text-gray-600 dark:text-zinc-400 block mt-1">
                                    {language === 'en' ? promo.descriptionEn : promo.descriptionAm}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 shrink-0 whitespace-nowrap">
                                  {promo.minSubtotal ? `${promo.minSubtotal} ETB` : ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* Recommended Add-Ons Section */}
                  {approvedProducts.filter(p => !cart.some(c => c.product.id === p.id)).length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 p-3 sm:p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800 space-y-2.5 shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                          {language === 'en' ? '✨ YOU MIGHT ALSO LIKE' : '✨ እነዚህንም ሊወዱ ይችላሉ'}
                        </span>
                        <span className="text-[9px] text-[#0052FF] dark:text-blue-400 font-bold uppercase tracking-wider">
                          {language === 'en' ? 'Quick Add' : 'ቀጥታ ጨምር'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {approvedProducts
                          .filter(p => !cart.some(c => c.product.id === p.id))
                          .slice(0, 3)
                          .map(product => {
                            const defaultVariant = product.variants[0];
                            if (!defaultVariant) return null;
                            const itemPrice = (product.price || 0) + (defaultVariant.priceOffset || 0);
                            return (
                              <div 
                                key={product.id}
                                className="flex items-center justify-between p-2 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/60 hover:bg-gray-100/70 dark:hover:bg-zinc-850/70 transition-all gap-2"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img 
                                    src={product.image} 
                                    alt={product.nameEn} 
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-150 dark:border-zinc-800"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-[11px] text-gray-900 dark:text-zinc-100 truncate">
                                      {language === 'en' ? product.nameEn : product.nameAm}
                                    </p>
                                    <p className="text-[10px] font-mono font-bold text-[#0052FF] dark:text-blue-400 leading-none mt-0.5">
                                      {itemPrice.toLocaleString()} ETB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addToCart(product, defaultVariant, 1)}
                                  className="px-2.5 py-1 bg-[#0052FF]/10 hover:bg-[#0052FF] text-[#0052FF] hover:text-white border border-[#0052FF]/20 text-[10px] font-extrabold rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-0.5"
                                >
                                  <span>+</span>
                                  <span>{language === 'en' ? 'Add' : 'ጨምር'}</span>
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Guarantee & Trust Badges Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-800 shadow-2xs">
                      <div className="text-base mb-0.5">🛡️</div>
                      <p className="text-[9px] font-bold text-gray-800 dark:text-zinc-300 uppercase tracking-tight">{language === 'en' ? 'Escrow Protected' : 'ኤስክሮው የተጠበቀ'}</p>
                      <p className="text-[8px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Inspected On Delivery' : 'በፍተሻ የሚለቀቅ'}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-800 shadow-2xs">
                      <div className="text-base mb-0.5">⚡</div>
                      <p className="text-[9px] font-bold text-gray-800 dark:text-zinc-300 uppercase tracking-tight">{language === 'en' ? '1-2 Hr Express' : 'ፈጣን ማድረሻ'}</p>
                      <p className="text-[8px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Addis Ababa Wide' : 'በአዲስ አበባ አቀፍ'}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-800 shadow-2xs">
                      <div className="text-base mb-0.5">🔄</div>
                      <p className="text-[9px] font-bold text-gray-800 dark:text-zinc-300 uppercase tracking-tight">{language === 'en' ? '7-Day Return' : '7-ቀን መመለሻ'}</p>
                      <p className="text-[8px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Money Back Guarantee' : 'ሙሉ ዋስትና'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 3. Sticky Footer: Price Breakdown & Prominent Checkout Button */}
            {cart.length > 0 && (
              <div className="p-3.5 sm:p-5 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800/80 space-y-3 shrink-0 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                    <span>{language === 'en' ? 'Subtotal' : 'ከፊል ድምር'}</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-zinc-200">{cartSubtotal.toLocaleString()} ETB</span>
                  </div>
                  {activeDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{language === 'en' ? `Discount (${appliedPromo?.code})` : `የቅናሽ መጠን (${appliedPromo?.code})`}</span>
                      <span className="font-mono">-{activeDiscount.toLocaleString()} ETB</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                    <span>{language === 'en' ? 'Shipping (Kasma Express)' : 'የማጓጓዣ ዋጋ (ካስማ ኤክስፕረስ)'}</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-zinc-200">{shippingFee.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-gray-950 dark:text-white text-sm pt-1.5 border-t border-gray-200 dark:border-zinc-800/80">
                    <span>{language === 'en' ? 'Grand Total' : 'ጠቅላላ ድምር'}</span>
                    <span className="text-[#0052FF] dark:text-blue-400 font-mono font-black text-base">{cartTotal.toLocaleString()} ETB</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-[#0052FF] hover:bg-blue-600 active:scale-[0.99] text-white py-3 sm:py-3.5 px-3.5 sm:px-5 rounded-2xl transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left min-w-0">
                    <span className="bg-white/20 text-white font-mono text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0">
                      {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-black text-white truncate">
                      {cartTotal.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider shrink-0 pl-2">
                    <span>{language === 'en' ? 'Checkout' : 'ወደ መክፈያ'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Slider Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md h-full flex flex-col shadow-2xl relative animate-slide-in border-l border-gray-150 dark:border-zinc-850">
            <div className="p-5 bg-white dark:bg-zinc-900 text-black dark:text-white border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? 'My Wishlist' : 'የእኔ ምኞት ዝርዝር'}
                </h3>
              </div>
              <button onClick={() => setIsWishlistOpen(false)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>

            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {favorites.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-gray-400 dark:text-zinc-500">
                  <Heart className="w-16 h-16 text-gray-200 dark:text-zinc-800 mb-2" />
                  <p className="font-bold">{language === 'en' ? 'Your wishlist is empty' : 'ምኞት ዝርዝርዎ ባዶ ነው'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'en' ? 'Tap the heart icon on products to save them here.' : 'ምርቶችን እዚህ ለማስቀመጥ በምርቶቹ ላይ ያለውን የልብ ምልክት ይጫኑ።'}
                  </p>
                </div>
              ) : (
                products
                  .filter((p) => favorites.includes(p.id))
                  .map((product) => {
                    const defaultVariant = product.variants[0];
                    const isOutOfStock = product.variants.every(v => v.onHand <= 0);
                    return (
                      <div key={product.id} className="bg-white dark:bg-zinc-850 p-4 rounded-2xl border border-gray-150 dark:border-zinc-800 flex gap-3 relative shadow-xs">
                        <img 
                          src={product.image} 
                          alt={product.nameEn} 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded-xl shrink-0 border border-gray-100 dark:border-zinc-800"
                        />
                        <div className="flex-grow min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{product.brand}</p>
                            <h5 className="font-bold text-gray-950 dark:text-white text-xs truncate">
                              {language === 'en' ? product.nameEn : product.nameAm}
                            </h5>
                            <p className="text-xs font-semibold text-kasma-gold font-mono mt-1">{product.price.toLocaleString()} ETB</p>
                          </div>

                          {/* Quick Add To Cart inside wishlist */}
                          <button
                            disabled={isOutOfStock}
                            onClick={() => {
                              if (defaultVariant) {
                                addToCart(product, defaultVariant);
                              }
                            }}
                            className={`mt-2 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                              isOutOfStock
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-750 cursor-not-allowed'
                                : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 border-transparent'
                            }`}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>{isOutOfStock ? (language === 'en' ? 'Out of Stock' : 'ክምችት አልቋል') : (language === 'en' ? 'Add To Cart' : 'ወደ ጋሪ አስገባ')}</span>
                          </button>
                        </div>

                        {/* Remove button */}
                        <button 
                          onClick={(e) => handleToggleFavorite(product.id, e)} 
                          className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-colors text-xs cursor-pointer"
                          title={language === 'en' ? 'Remove from Wishlist' : 'ከምኞት ዝርዝር አስወግድ'}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
              )}
            </div>

            {favorites.length > 0 && (
              <div className="p-5 bg-gray-50 dark:bg-zinc-950 border-t border-gray-150 dark:border-zinc-800">
                <button 
                  onClick={() => {
                    // Add all available wishlisted items to cart
                    const wishlistProducts = products.filter(p => favorites.includes(p.id));
                    let addedCount = 0;
                    wishlistProducts.forEach(product => {
                      const defaultVariant = product.variants[0];
                      const isOutOfStock = product.variants.every(v => v.onHand <= 0);
                      if (defaultVariant && !isOutOfStock) {
                        addToCart(product, defaultVariant);
                        addedCount++;
                      }
                    });
                    
                    if (addedCount > 0) {
                      setIsWishlistOpen(false);
                      setIsCartOpen(true);
                    } else {
                      showToast(
                        language === 'en'
                          ? 'No items could be added (out of stock).'
                          : 'ምንም ምርት ማከል አልተቻለም (ክምችት አልቋል)።',
                        'warning'
                      );
                    }
                  }}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-3.5 rounded-full transition-all shadow-xs text-center block cursor-pointer"
                >
                  {language === 'en' ? 'Add All To Cart 🚀' : 'ሁሉንም ወደ ጋሪ አስገባ 🚀'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Alerts Drawer */}
      {isPriceAlertsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-xs transition-opacity duration-300 animate-in fade-in">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsPriceAlertsOpen(false)} />
          
          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 border-l border-gray-150 dark:border-zinc-800">
            {/* Header */}
            <div className="p-5 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between bg-amber-500/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Bell className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-950 dark:text-white">
                    {language === 'en' ? 'Price Watch List' : 'የዋጋ ክትትል ዝርዝር'}
                  </h3>
                  <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
                    {language === 'en' 
                      ? 'Monitored items with target prices' 
                      : 'የተመረጡ እቃዎች ከዒላማ ዋጋ ጋር'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPriceAlertsOpen(false)} 
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {priceAlerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="p-5 bg-amber-500/[0.04] rounded-full text-amber-500 max-w-max mx-auto shadow-xs">
                    <Bell className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
                      {language === 'en' ? 'No Price Alerts Configured' : 'ምንም የዋጋ ማንቂያ አልተዋቀረም'}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-xs leading-relaxed">
                      {language === 'en' 
                        ? 'Tap the bell icon on any product card or quick view to get notified of price drops!' 
                        : 'ዋጋ ሲቀንስ ማንቂያ ለማግኘት በማንኛውም ምርት ካርድ ወይም ፈጣን እይታ ላይ የደወል ምልክቱን ይጫኑ!'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {priceAlerts.map(alert => {
                    const product = products.find(p => p.id === alert.productId);
                    if (!product) return null;
                    
                    const percentOfBase = Math.round((alert.thresholdPrice / product.price) * 100);
                    const isBelowThreshold = product.price <= alert.thresholdPrice;

                    return (
                      <div 
                        key={alert.productId}
                        className="p-4 bg-gray-50/50 dark:bg-zinc-950/30 rounded-2xl border border-gray-150 dark:border-zinc-800/40 relative flex flex-col gap-3 group transition-all"
                      >
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-150 dark:border-zinc-850 shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.nameEn} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-gray-900 dark:text-zinc-100 truncate">
                              {language === 'en' ? product.nameEn : product.nameAm}
                            </h4>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                              {product.brand}
                            </p>
                            
                            {/* Current vs Target Price Indicator */}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <div>
                                <span className="text-[8px] text-gray-400 dark:text-zinc-500 uppercase font-black tracking-wider block">
                                  {language === 'en' ? 'Current' : 'የአሁኑ'}
                                </span>
                                <span className="font-mono font-bold text-xs text-gray-900 dark:text-zinc-100">
                                  {product.price.toLocaleString()} ETB
                                </span>
                              </div>
                              <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800" />
                              <div>
                                <span className="text-[8px] text-gray-400 dark:text-zinc-500 uppercase font-black tracking-wider block">
                                  {language === 'en' ? 'Threshold' : 'ገደብ ዋጋ'}
                                </span>
                                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                                  {alert.thresholdPrice.toLocaleString()} ETB
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Slider */}
                        <div className="pt-2 border-t border-gray-150 dark:border-zinc-800/60 space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            <span>{language === 'en' ? 'Adjust Target' : 'ዒላማ አስተካክል'}:</span>
                            <span className="font-mono text-amber-550">{percentOfBase}% of current</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={Math.floor(product.price * 0.5)}
                              max={product.price}
                              step={10}
                              value={alert.thresholdPrice}
                              onChange={(e) => handleUpdateThresholdPrice(product.id, Number(e.target.value))}
                              className="flex-grow accent-amber-500 h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Footer Status & Actions */}
                        <div className="flex justify-between items-center gap-2 pt-1">
                          {isBelowThreshold ? (
                            <span className="bg-green-500/10 dark:bg-green-500/5 text-green-600 dark:text-green-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                              {language === 'en' ? 'Price Met! 🎉' : 'ዋጋ ደርሷል! 🎉'}
                            </span>
                          ) : (
                            <span className="bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {language === 'en' ? 'Waiting for Drop' : 'ቅናሽ በመጠባበቅ ላይ'}
                            </span>
                          )}

                          <div className="flex gap-2">
                            {/* View Product Detailed */}
                            <button
                              onClick={() => {
                                handleOpenProduct(product);
                                setIsPriceAlertsOpen(false);
                              }}
                              className="px-2.5 py-1.5 bg-gray-950 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                            >
                              {language === 'en' ? 'View Details' : 'ዝርዝር እይ'}
                            </button>

                            {/* Remove Alert */}
                            <button
                              onClick={() => handleTogglePriceAlert(product)}
                              className="p-1.5 bg-gray-100 hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 border border-gray-150 dark:border-zinc-700/60 rounded-lg transition-all cursor-pointer"
                              title={language === 'en' ? 'Remove Alert' : 'ማንቂያ አስወግድ'}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Screen with Chapa / Telebirr Simulation */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 relative animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-900 dark:text-white">{language === 'en' ? 'Secure Checkout Portal' : 'ደህንነቱ የተጠበቀ መክፈያ'}</h3>
                <p className="text-[10px] text-gray-400 dark:text-zinc-400 mt-0.5">{language === 'en' ? 'Powered by Kasma Gateway Services' : 'በካስማ የክፍያ አገልግሎት የሚሰራ'}</p>
              </div>
              {paymentStep !== 'GATEWAY' && paymentStep !== 'OTP' && (
                <button 
                  onClick={closeCheckoutFlow} 
                  className="text-gray-400 hover:text-black dark:text-zinc-400 dark:hover:text-white font-bold p-1 rounded-full transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Steps Rendering */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 touch-pan-y overscroll-contain space-y-4">
              {paymentStep === 'FORM' && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                    <h4 className="font-bold text-gray-900 dark:text-zinc-200 text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0052FF]" />
                      <span>{language === 'en' ? '1. Recipient & Ethiopian Delivery Address' : '1. የተቀባይ እና የአድራሻ መረጃ'}</span>
                    </h4>
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/50">
                      {language === 'en' ? 'Landmark-Based' : 'በመለያ ቦታ የሚላክ'}
                    </span>
                  </div>

                  {paymentApiError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{paymentApiError}</span>
                    </div>
                  )}

                  {/* Row 1: Full Name and Mobile Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                        <span>{language === 'en' ? 'Recipient Full Name *' : 'ሙሉ ስም *'}</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={language === 'en' ? 'e.g. Dawit Abera' : 'ለምሳሌ ዳዊት አበራ'}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest">
                        <span>{language === 'en' ? 'Ethiopian Mobile Phone *' : 'የስልክ ቁጥር *'}</span>
                        {customerPhone.startsWith('+2519') || customerPhone.startsWith('09') ? (
                          <span className="text-[8.5px] font-extrabold text-emerald-600 dark:text-emerald-400">Ethio telecom (Telebirr)</span>
                        ) : customerPhone.startsWith('+2517') || customerPhone.startsWith('07') ? (
                          <span className="text-[8.5px] font-extrabold text-blue-600 dark:text-blue-400">Safaricom (M-PESA)</span>
                        ) : null}
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="+251912345678 or 0912345678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Row 2: Sub-City Selection (Required Dropdown) & Estimated Delivery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                        <span>{language === 'en' ? 'Sub-City / Area (Addis Ababa) *' : 'ክፍለ ከተማ / አካባቢ *'}</span>
                        <span className="text-[#0052FF] font-bold">
                          +{SUB_CITIES.find(sc => sc.id === selectedSubCity)?.fee || 100} ETB
                        </span>
                      </label>
                      <select
                        required
                        value={selectedSubCity}
                        onChange={(e) => setSelectedSubCity(e.target.value)}
                        className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all font-bold cursor-pointer"
                      >
                        {SUB_CITIES.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {language === 'en' ? sc.nameEn : sc.nameAm} (+{sc.fee} ETB • {language === 'en' ? sc.timeEn : sc.timeAm})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest">
                        {language === 'en' ? 'Estimated Courier Dispatch' : 'ግምታዊ የማድረሻ ጊዜ'}
                      </label>
                      <div className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 font-bold flex items-center justify-between h-[34px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Truck className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                          <span className="truncate">
                            {SUB_CITIES.find(sc => sc.id === selectedSubCity)?.nameEn.split(' ')[0]} Express
                          </span>
                        </div>
                        <span className="font-mono text-[#0052FF] text-[11px] shrink-0">
                          {language === 'en' 
                            ? (SUB_CITIES.find(sc => sc.id === selectedSubCity)?.timeEn || '1-2 Hours') 
                            : (SUB_CITIES.find(sc => sc.id === selectedSubCity)?.timeAm || 'ከ1-2 ሰዓት')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Prominent Landmark / Specific Area (Required) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{language === 'en' ? 'Prominent Landmark / Area Description *' : 'የሚታወቅ መለያ ቦታ / አካባቢ *'}</span>
                      </label>
                      <span className="text-[8.5px] text-gray-400">Required for Ethiopian courier</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={language === 'en' 
                        ? 'e.g. Behind Edna Mall, Near Bole Medhanialem Church, Beside CBE Atlas Branch' 
                        : 'ለምሳሌ፡ ከኤድና ሞል ጀርባ፣ ከመድኃኔዓለም ቤተክርስቲያን አጠገብ፣ ከአትላስ ሲቢኢ ቅርንጫፍ ጎን'}
                      value={customerLandmark}
                      onChange={(e) => setCustomerLandmark(e.target.value)}
                      className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all font-semibold"
                    />
                    <p className="text-[8.5px] text-gray-400 leading-tight">
                      {language === 'en'
                        ? 'Our delivery dispatchers navigate using prominent landmarks, banks, commercial malls, or churches.'
                        : 'አድራሾቻችን የሚታወቁ ሕንጻዎችን፣ ባንኮችን ወይም ታዋቂ ቦታዎችን ተጠቅመው በቀላሉ ያደርሳሉ።'}
                    </p>
                  </div>

                  {/* Row 4: Specific Door / Street / Floor Notes (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                      <span>{language === 'en' ? 'House #, Floor or Delivery Instructions (Optional)' : 'የቤት ቁጥር፣ ፎቅ ወይም ተጨማሪ መመሪያ (አማራጭ)'}</span>
                    </label>
                    <textarea
                      placeholder={language === 'en' ? 'e.g. Building 4B, 3rd Floor, Office 302 / Call upon arrival' : 'ምሳሌ፡ ሕንጻ 4B፣ 3ኛ ፎቅ፣ ቢሮ 302 / ሲደርሱ ይደውሉ'}
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white transition-all"
                    />
                  </div>

                  {/* Section 2: Integrated Payment Methods */}
                  <h4 className="font-bold text-gray-900 dark:text-zinc-200 text-[10px] border-b border-gray-100 dark:border-zinc-800 pb-2 uppercase tracking-widest pt-2">
                    {language === 'en' ? '2. Integrated Payment Methods & Gateways' : '2. የተቀናጁ የክፍያ መንገዶች'}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {/* Telebirr */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TELEBIRR')}
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'TELEBIRR' 
                          ? 'border-[#004C61] bg-[#004C61]/10 dark:bg-[#004C61]/25 ring-2 ring-[#004C61]/30 shadow-xs' 
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#003B4A] via-[#005B73] to-[#00A3E0] text-white font-mono font-black text-xs flex items-center justify-center shadow-xs border border-white/30">
                        <span className="text-[#FFD23F] font-black">t</span>
                        <span className="text-white font-black">b</span>
                      </div>
                      <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">telebirr</span>
                      <span className="text-[8.5px] text-gray-400 dark:text-zinc-400 font-medium">*127# Push</span>
                    </button>

                    {/* CBE Birr */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CBE_BIRR')}
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'CBE_BIRR' 
                          ? 'border-purple-800 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-600/30 shadow-xs' 
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-amber-300 font-mono font-black text-[9px] flex items-center justify-center shadow-xs border border-amber-400/40">
                        CBE
                      </div>
                      <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">CBE Birr</span>
                      <span className="text-[8.5px] text-purple-700 dark:text-purple-300 font-medium">*847# Chapa</span>
                    </button>

                    {/* Chapa Gateway */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CHAPA')}
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'CHAPA' 
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-600/30 shadow-xs' 
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-500 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs border border-white/30">
                        <span className="text-[#00FF9D] tracking-tighter font-extrabold">Ch</span>
                      </div>
                      <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">Chapa (ጫፓ)</span>
                      <span className="text-[8.5px] text-gray-400 dark:text-zinc-400 font-medium">Cards & Banks</span>
                    </button>

                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'COD' 
                          ? 'border-[#229ED9] bg-[#229ED9]/10 dark:bg-[#229ED9]/25 ring-2 ring-[#229ED9]/30 shadow-xs' 
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#229ED9] via-sky-600 to-blue-700 text-white font-black text-xs flex items-center justify-center shadow-xs border border-white/30">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">Cash / CoD</span>
                      <span className="text-[8.5px] text-gray-400 dark:text-zinc-400 font-medium">Courier PIN</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500 dark:text-zinc-400 font-medium">
                      <span>{language === 'en' ? 'Cart Subtotal:' : 'የእቃዎች ድምር:'}</span>
                      <span className="font-mono text-gray-900 dark:text-zinc-200 font-bold">{cartSubtotal.toLocaleString()} ETB</span>
                    </div>
                    {activeDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>{language === 'en' ? `Promo discount (${appliedPromo?.code}):` : `የቅናሽ መጠን (${appliedPromo?.code}):`}</span>
                        <span className="font-mono">-{activeDiscount.toLocaleString()} ETB</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500 dark:text-zinc-400 font-medium">
                      <span>{language === 'en' ? 'Shipping Fee:' : 'የማጓጓዣ ዋጋ:'}</span>
                      <span className="font-mono text-gray-900 dark:text-zinc-200 font-bold">{shippingFee.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-gray-900 dark:text-white text-sm pt-2 border-t border-gray-100 dark:border-zinc-800 items-center">
                      <span>{language === 'en' ? 'Total Payable:' : 'ጠቅላላ ክፍያ:'}</span>
                      <span className="text-lg font-black text-[#0052FF] dark:text-blue-400 font-mono">{cartTotal.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isInitializingPayment}
                    className="w-full bg-[#0052FF] hover:bg-blue-600 active:scale-[0.99] text-white font-black py-3.5 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-60"
                  >
                    {isInitializingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>{language === 'en' ? 'Connecting to Payment API...' : 'ከክፍያ ጌትዌይ ጋር በመገናኘት ላይ...'}</span>
                      </>
                    ) : paymentMethod === 'COD' ? (
                      <>
                        <Truck className="w-4 h-4 text-white" />
                        <span>{language === 'en' ? 'Confirm Cash on Delivery Order' : 'በትዕዛዝ ማረጋገጫ ይቀጥሉ'}</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-white" />
                        <span>{language === 'en' ? `Initialize ${paymentMethod === 'CBE_BIRR' ? 'CBE Birr' : paymentMethod === 'TELEBIRR' ? 'Telebirr' : paymentMethod} Payment API` : `ወደ ${paymentMethod} የክፍያ ገፅ ይቀጥሉ`}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {paymentStep === 'GATEWAY' && (
                <div className="py-2 space-y-5 text-left">
                  <div className="space-y-4">
                      {/* Mode Selector Tabs: QR Code vs Direct Push / USSD */}
                      <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl border border-gray-200/70 dark:border-zinc-700">
                        <button
                          type="button"
                          onClick={() => setGatewayPaymentTab('QR')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            gatewayPaymentTab === 'QR'
                              ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-xs border border-gray-200/80 dark:border-zinc-700 font-black'
                              : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          <QrCode className="w-4 h-4 text-[#0052FF]" />
                          <span>{language === 'en' ? 'Scan QR Code' : 'የQR ኮድ ስካን'}</span>
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Instant</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGatewayPaymentTab('DIRECT')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            gatewayPaymentTab === 'DIRECT'
                              ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-xs border border-gray-200/80 dark:border-zinc-700 font-black'
                              : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          <span>{language === 'en' ? 'Direct Mobile / USSD' : 'የስልክ / USSD ክፍያ'}</span>
                        </button>
                      </div>

                      {gatewayPaymentTab === 'QR' ? (
                        <div className="space-y-4">
                          {/* Brand Header Banner */}
                          <div className={`p-4 rounded-2xl text-white shadow-xs relative overflow-hidden ${
                            paymentMethod === 'TELEBIRR'
                              ? 'bg-gradient-to-r from-[#004C61] via-[#00607A] to-[#0D1F2D]'
                              : paymentMethod === 'CBE_BIRR'
                              ? 'bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950'
                              : 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950'
                          }`}>
                            <div className="flex justify-between items-center relative z-10">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                                  <QrCode className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-black text-sm text-white uppercase tracking-wider">
                                      {paymentMethod === 'TELEBIRR' 
                                        ? 'telebirr Quick QR Pay' 
                                        : paymentMethod === 'CBE_BIRR'
                                        ? 'CBE Birr Instant QR Pay'
                                        : 'Chapa Unified Gateway'}
                                    </h4>
                                    <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold">API CONNECTED</span>
                                  </div>
                                  <p className="text-[10px] text-white/80">
                                    {paymentMethod === 'TELEBIRR' 
                                      ? (language === 'en' ? 'Scan with ethio telecom telebirr SuperApp' : 'በቴሌብር ሞባይል አፕ ስካን ያድርጉ')
                                      : paymentMethod === 'CBE_BIRR'
                                      ? (language === 'en' ? 'Commercial Bank of Ethiopia (CBE Birr via Chapa/ArifPay)' : 'በሲቢኢ ብር ሞባይል አፕ ወይም *847# ስካን ያድርጉ')
                                      : (language === 'en' ? 'Supports Telebirr, CBE Birr & Debit Cards' : 'በቴሌብር፣ ሲቢኢ ብር እና ባንክ ካርዶች የሚሰራ')
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="text-right font-mono">
                                <span className="text-[9px] text-white/70 block uppercase font-bold">{language === 'en' ? 'Total Amount' : 'ጠቅላላ ዋጋ'}</span>
                                <span className="text-base font-black text-white">{cartTotal.toLocaleString()} ETB</span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive QR Display Card */}
                          <div className="bg-gray-50/70 dark:bg-zinc-800/50 border border-gray-200/80 dark:border-zinc-700/70 rounded-3xl p-5 text-center space-y-4 relative overflow-hidden">
                            {/* Visual Payment Provider Partner Icons Strip */}
                            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-gray-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                <span>{language === 'en' ? 'Active Gateway Rails' : 'ገቢር የክፍያ መንገዶች'}</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Chapa / ArifPay Integrated</span>
                                </span>
                              </div>

                              <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
                                {/* Telebirr Visual Provider Badge */}
                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                                  paymentMethod === 'TELEBIRR'
                                    ? 'bg-[#004C61]/10 border-[#004C61] ring-1 ring-[#004C61]/30 text-[#004C61] font-black'
                                    : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 opacity-70'
                                }`}>
                                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#003B4A] via-[#005B73] to-[#00A3E0] text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0 border border-white/20">
                                    <span className="text-[#FFD23F] font-black">t</span>
                                    <span className="text-white font-black">b</span>
                                  </div>
                                  <span className="text-[11px] font-extrabold tracking-tight">telebirr</span>
                                  {paymentMethod === 'TELEBIRR' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#004C61] animate-pulse" />
                                  )}
                                </div>

                                {/* CBE Birr Partner Badge */}
                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                                  paymentMethod === 'CBE_BIRR'
                                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-800 ring-1 ring-purple-600/30 text-purple-900 dark:text-purple-300 font-black'
                                    : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 opacity-70'
                                }`}>
                                  <div className="w-5 h-5 rounded-lg bg-purple-900 text-amber-400 font-mono font-black text-[8px] flex items-center justify-center shrink-0 border border-purple-700">
                                    CBE
                                  </div>
                                  <span className="text-[11px] font-extrabold tracking-tight">CBE Birr</span>
                                  {paymentMethod === 'CBE_BIRR' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                                  )}
                                </div>

                                {/* Chapa Visual Provider Badge */}
                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                                  paymentMethod === 'CHAPA'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 ring-1 ring-emerald-600/30 text-emerald-800 dark:text-emerald-300 font-black'
                                    : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 opacity-70'
                                }`}>
                                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-500 text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0 border border-white/20">
                                    <span className="text-[#00FF9D] tracking-tighter font-black">Ch</span>
                                  </div>
                                  <span className="text-[11px] font-extrabold tracking-tight">Chapa</span>
                                  {paymentMethod === 'CHAPA' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  )}
                                </div>

                                {/* Visa / Mastercard Cards Badge */}
                                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-[10.5px] font-bold">
                                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Cards</span>
                                </div>
                              </div>
                            </div>

                            {/* Scanning beam visual effect */}
                            <div className="relative inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-200/90 group">
                              {/* Generated SVG QR Code */}
                              <QRCodeSVG
                                value={activePaymentSession?.qrPayload || (paymentMethod === 'TELEBIRR'
                                  ? `telebirr://pay?merchant=KASMA_ENTERPRISE&amount=${cartTotal}&ref=${qrReferenceTx}&phone=${encodeURIComponent(customerPhone)}`
                                  : paymentMethod === 'CBE_BIRR'
                                  ? `cbebirr://pay?merchant=KASMA_SHOP&amount=${cartTotal}&ref=${qrReferenceTx}`
                                  : `https://checkout.chapa.co/pay/ch_tx_${qrReferenceTx}?amount=${cartTotal}&currency=ETB&email=getchze1221%40gmail.com`
                                )}
                                size={185}
                                level="H"
                                includeMargin={true}
                                fgColor={paymentMethod === 'TELEBIRR' ? '#004C61' : paymentMethod === 'CBE_BIRR' ? '#3B0764' : '#047857'}
                                bgColor="#FFFFFF"
                              />

                              {/* Center Brand Badge */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-9 h-9 bg-white rounded-full shadow-md border-2 border-gray-800 flex items-center justify-center p-1">
                                  {paymentMethod === 'TELEBIRR' ? (
                                    <span className="text-[10px] font-black text-[#004C61] tracking-tighter">tb</span>
                                  ) : paymentMethod === 'CBE_BIRR' ? (
                                    <span className="text-[9px] font-black text-purple-900 tracking-tighter">CBE</span>
                                  ) : (
                                    <span className="text-[10px] font-black text-emerald-700 tracking-tighter">Ch</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Pulse indicator */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-zinc-300 font-semibold bg-white/90 dark:bg-zinc-900 py-1.5 px-3 rounded-full border border-gray-200/60 dark:border-zinc-700 max-w-xs mx-auto shadow-2xs">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              <span className="text-[11px] truncate">
                                {language === 'en' ? 'Awaiting camera scan / mobile authorization...' : 'የስልክ ስካን / ፈቃድ በመጠባበቅ ላይ...'}
                              </span>
                            </div>

                            {/* QR Details Chips */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-200/70 dark:border-zinc-800 text-left">
                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase font-bold">{language === 'en' ? 'Merchant / Rail' : 'የነጋዴ ስም'}</span>
                                <span className="font-extrabold text-gray-900 dark:text-white truncate block">
                                  {paymentMethod === 'CBE_BIRR' ? 'KASMA CBE BIRR PAY' : 'KASMA SHOP ENTERPRISE'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase font-bold">{language === 'en' ? 'Transaction Ref' : 'መለያ ቁጥር'}</span>
                                <span className="font-mono font-black text-[#0052FF] dark:text-blue-400 truncate block">
                                  {activePaymentSession?.txRef || qrReferenceTx}
                                </span>
                              </div>
                            </div>

                            {/* Quick Link & Copy Actions */}
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const payload = activePaymentSession?.checkoutUrl || activePaymentSession?.directPaymentUrl || (paymentMethod === 'TELEBIRR'
                                    ? `telebirr://pay?merchant=KASMA_ENTERPRISE&amount=${cartTotal}&ref=${qrReferenceTx}`
                                    : paymentMethod === 'CBE_BIRR'
                                    ? `https://checkout.chapa.co/pay/cbe_${qrReferenceTx}?amount=${cartTotal}&currency=ETB`
                                    : `https://checkout.chapa.co/pay/ch_tx_${qrReferenceTx}?amount=${cartTotal}`);
                                  navigator.clipboard.writeText(payload);
                                  setCopiedQrLink(true);
                                  showToast(
                                    language === 'en' ? 'Payment Session Link copied to clipboard!' : 'የክፍያ ሊንኩ ተቀድቷል!',
                                    'success'
                                  );
                                  setTimeout(() => setCopiedQrLink(false), 2500);
                                }}
                                className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 text-gray-700 dark:text-zinc-200 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                {copiedQrLink ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{language === 'en' ? 'Copied!' : 'ተቀድቷል!'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    <span>{language === 'en' ? 'Copy Pay Link' : 'ሊንኩን ቅዳ'}</span>
                                  </>
                                )}
                              </button>

                              {/* Dial USSD Button */}
                              {(paymentMethod === 'TELEBIRR' || paymentMethod === 'CBE_BIRR') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const ussd = paymentMethod === 'TELEBIRR' ? '*127#' : '*847#';
                                    navigator.clipboard.writeText(ussd);
                                    showToast(
                                      language === 'en' ? `USSD ${ussd} copied! Dial in your Phone App.` : `USSD ${ussd} ተቀድቷል! በስልክዎ ይደውሉ`,
                                      'info'
                                    );
                                  }}
                                  className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-[10px] font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Dial {paymentMethod === 'TELEBIRR' ? '*127#' : '*847#'}</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const link = activePaymentSession?.checkoutUrl || activePaymentSession?.directPaymentUrl || (paymentMethod === 'TELEBIRR'
                                    ? `https://telebirr.ethiotelecom.et/checkout?ref=${qrReferenceTx}&amount=${cartTotal}`
                                    : paymentMethod === 'CBE_BIRR'
                                    ? `https://checkout.chapa.co/pay/cbe_${qrReferenceTx}?amount=${cartTotal}&currency=ETB`
                                    : `https://checkout.chapa.co/pay/ch_tx_${qrReferenceTx}?amount=${cartTotal}`);
                                  window.open(link, '_blank');
                                }}
                                className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 text-gray-700 dark:text-zinc-200 text-[10px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                                <span>{language === 'en' ? 'Open App Checkout' : 'በአፕሊኬሽን ክፈት'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-3.5 rounded-2xl text-[11px] text-amber-950 dark:text-amber-200 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                              <span>{language === 'en' ? 'Payment Authorization Steps:' : 'የክፍያ ማረጋገጫ ቅደም-ተከተል፡'}</span>
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-amber-900/80 dark:text-amber-200/80 font-medium text-[10.5px] leading-relaxed">
                              <li>
                                {paymentMethod === 'TELEBIRR'
                                  ? (language === 'en' ? 'Open Telebirr SuperApp and approve the push notification prompt, or dial *127#.' : 'የቴሌብር አፕሊኬሽን ይክፈቱ ወይም በስልክዎ *127# ይደውሉ።')
                                  : paymentMethod === 'CBE_BIRR'
                                  ? (language === 'en' ? 'Open CBE Birr app or dial *847# on your mobile phone to approve the payment.' : 'የሲቢኢ ብር አፕሊኬሽን ይክፈቱ ወይም በስልክዎ *847# በመደወል ያረጋግጡ።')
                                  : (language === 'en' ? 'Scan QR or proceed on Chapa hosted checkout.' : 'በስክሪኑ ላይ ያለውን የQR ኮድ ስካን ያድርጉ ወይም ጫፓን ይጠቀሙ።')}
                              </li>
                              <li>
                                {language === 'en'
                                  ? `Confirm total amount of ${cartTotal.toLocaleString()} ETB, then click "Verify with Payment Gateway API" below.`
                                  : `የ${cartTotal.toLocaleString()} ብር ክፍያውን ካረጋገጡ በኋላ ከታች ያለውን "በክፍያ ጌትዌይ አረጋግጥ" ይጫኑ።`}
                              </li>
                            </ol>
                          </div>
                        </div>
                      ) : (
                        /* DIRECT PUSH & USSD MODE */
                        <div className="space-y-4">
                          {paymentMethod === 'TELEBIRR' ? (
                            <div className="space-y-4 text-center">
                              <div className="bg-[#2563EB]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                                <Phone className="w-8 h-8 text-[#2563EB] animate-pulse" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-[#2563EB] text-lg">telebirr Direct Push Gateway</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Secure instant connection to ethio telecom mobile payment system.
                                </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 text-left text-xs space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Merchant Name:</span>
                                  <span className="font-bold">KASMA SHOP LTD</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Payer Phone:</span>
                                  <span className="font-bold font-mono">{customerPhone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">USSD Direct Code:</span>
                                  <span className="font-mono font-bold text-[#0052FF]">*127# (Option 3: Pay Merchant)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Amount (ETB):</span>
                                  <span className="font-bold text-black dark:text-white font-mono">{cartTotal.toLocaleString()} ETB</span>
                                </div>
                              </div>
                            </div>
                          ) : paymentMethod === 'CBE_BIRR' ? (
                            <div className="space-y-4 text-center">
                              <div className="bg-purple-100 dark:bg-purple-950/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-purple-200">
                                <Building2 className="w-8 h-8 text-purple-700 animate-pulse" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-purple-900 dark:text-purple-300 text-lg">CBE Birr Instant Direct Gateway</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Commercial Bank of Ethiopia payment rail via Chapa/ArifPay API.
                                </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 text-left text-xs space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">CBE Birr Merchant:</span>
                                  <span className="font-bold">KASMA SHOP LTD (CBE Pay)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Payer Phone:</span>
                                  <span className="font-bold font-mono">{customerPhone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">CBE USSD Code:</span>
                                  <span className="font-mono font-bold text-purple-700">*847# (Pay Bill / Merchant)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Total Payable:</span>
                                  <span className="font-black text-purple-900 dark:text-purple-300 font-mono">{cartTotal.toLocaleString()} ETB</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 text-center">
                              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                                <CreditCard className="w-8 h-8 text-emerald-600 animate-pulse" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-emerald-700 text-lg">Chapa (ጫፓ) Gateway</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Supports CBE Birr, Awash Bank, and international credit cards.
                                </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 text-left text-xs space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Chapa Reference:</span>
                                  <span className="font-mono font-semibold">{activePaymentSession?.txRef || qrReferenceTx}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Total Amount:</span>
                                  <span className="font-black text-emerald-700 font-mono">{cartTotal.toLocaleString()} ETB</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Customer Delivery:</span>
                                  <span className="font-semibold">{selectedSubCity} • {customerLandmark}</span>
                                </div>
                              </div>
                            </div>
                        </div>
                      )}
                    </div>

                  {/* Shared Gateway Action Footer Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setPaymentStep('FORM')}
                      className="px-5 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                    >
                      {language === 'en' ? 'Back to Address' : 'ወደ አድራሻ ተመለስ'}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleVerifyPaymentApi}
                      className="px-6 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white rounded-full text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-60"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{language === 'en' ? 'Verifying with Payment API...' : 'ከክፍያ ጌትዌይ ጋር በማረጋገጥ ላይ...'}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>{language === 'en' ? 'Verify with Payment Gateway API ✔' : 'በክፍያ ጌትዌይ አረጋግጥ ✔'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'OTP' && (
                <div className="text-center py-6 space-y-5">
                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-zinc-600 text-xs text-left">
                    📱 <span className="font-bold text-black">Telebirr SMS OTP Sent!</span> We have dispatched a 6-digit verification code to <span className="font-mono font-bold text-black">{customerPhone}</span>.
                  </div>
                  <div className="space-y-1 text-left max-w-xs mx-auto">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center mb-1">
                      Enter 6-Digit Telebirr OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 840294"
                      value={telebirrOtp}
                      onChange={(e) => setTelebirrOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-[#0052FF] focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      onClick={() => setPaymentStep('GATEWAY')}
                      className="px-5 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      disabled={isProcessingPayment}
                      onClick={handleVerifyOtp}
                      className="px-6 py-2 bg-black hover:bg-zinc-950 text-white rounded-full text-xs font-bold flex items-center gap-1.5 justify-center"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <span>Confirm Payment 🔒</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'SUCCESS' && (
                <div className="printable-receipt-modal text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mx-auto text-black">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-950 dark:text-white text-base">{language === 'en' ? 'Payment Confirmed Successfully!' : 'ክፍያዎ በስኬት ተጠናቋል!'}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {language === 'en' 
                        ? 'Your payment was authorized and processed securely. Order is logged into system dispatch queues.' 
                        : 'ክፍያዎ ተረጋግጧል፤ ትዕዛዝዎ ወደ ስርጭት ሂደት ገብቷል።'}
                    </p>
                  </div>

                  {lastPlacedOrderId && (
                    <div className="bg-kasma-blue/5 dark:bg-kasma-blue/10 border border-kasma-blue/15 rounded-2xl p-4 text-center space-y-2">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {language === 'en' ? 'Your Order Reference' : 'የእርስዎ ትዕዛዝ ቁጥር'}
                      </p>
                      <p className="text-xl font-mono font-black text-kasma-blue tracking-widest">{lastPlacedOrderId}</p>
                      <div className="no-print-action flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                          title={language === 'en' ? 'Print Official Order Receipt' : 'የገበያ ደረሰኝ አትም'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Print Receipt' : 'ደረሰኝ አትም'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setTrackOrderId(lastPlacedOrderId);
                            const found = allOrders.find(o => o.id === lastPlacedOrderId);
                            setTrackedOrder(found || null);
                            setHasSearchedOrder(true);
                            setIsCheckoutOpen(false);
                            setIsOrderStatusOpen(true);
                          }}
                          className="px-4 py-1.5 bg-[#0052FF] text-white hover:bg-[#003ecf] font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Track Shipment' : 'ጭነቱን ይከታተሉ'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsCheckoutOpen(false);
                            setIsMyOrdersOpen(true);
                          }}
                          className="px-4 py-1.5 bg-gray-900 text-white hover:bg-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'en' ? 'View My Orders' : 'የእኔን ትዕዛዞች ይመልከቱ'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Approximate Courier Location Mini-Map for Addis Ababa Orders */}
                  <div className="no-print-action text-left">
                    <OrderCourierMiniMap
                      language={language}
                      shippingAddress={shippingAddress || 'Addis Ababa'}
                      subCity={selectedSubCity}
                      orderId={lastPlacedOrderId || 'KS-EXP'}
                      customerName={customerName}
                      onOpenFullMap={() => {
                        if (lastPlacedOrderId) {
                          setTrackOrderId(lastPlacedOrderId);
                          const found = allOrders.find(o => o.id === lastPlacedOrderId);
                          setTrackedOrder(found || null);
                          setHasSearchedOrder(true);
                          setIsCheckoutOpen(false);
                          setIsOrderStatusOpen(true);
                        }
                      }}
                    />
                  </div>

                  {/* Telegram Notification Banner */}
                  <div className="no-print-action bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-500/30 dark:border-sky-500/40 rounded-2xl p-3.5 text-left flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-sky-800 dark:text-sky-300 block">
                        {language === 'en' ? '📲 Telegram Receipt & Live Tracking Dispatched!' : '📲 የቴሌግራም ደረሰኝ እና የትራንስፖርት መከታተያ ተልኳል!'}
                      </span>
                      <p className="text-gray-600 dark:text-zinc-400 text-[11px] leading-tight">
                        {language === 'en' 
                          ? `Order #${lastPlacedOrderId || 'latest'} receipt & live dispatch link sent to your Telegram via @KasmaShopBot.` 
                          : `የትዕዛዝ #${lastPlacedOrderId || 'እነሆ'} ማረጋገጫ በቴሌግራም ቦት @KasmaShopBot ተልኳል።`}
                      </p>
                    </div>
                  </div>

                  {/* Kasma Admin Telegram & WhatsApp Quick Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href="https://t.me/kasma_admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#229ED9] hover:bg-[#1d8ebd] text-white font-bold py-3 px-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      <Send className="w-4 h-4 text-white shrink-0" />
                      <span className="truncate">{language === 'en' ? 'Telegram Admin' : 'በቴሌግራም ያግኙ'}</span>
                    </a>
                    <a
                      href={generateWhatsAppCustomerWelcomeUrl(cart, language, '251911223344', 'Order Confirmation Support')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
                      <span className="truncate">{language === 'en' ? 'Chat on WhatsApp' : 'በዋትስአፕ ያወሩን'}</span>
                    </a>
                  </div>

                  {/* Stock alerting indicator */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 text-left flex gap-2 leading-relaxed">
                    <span className="shrink-0 text-black">📢</span>
                    <p>
                      <strong>Order Placed:</strong> Product inventory was updated, and your order has been dispatched for delivery.
                    </p>
                  </div>

                  <button
                    onClick={closeCheckoutFlow}
                    className="w-full bg-black hover:bg-zinc-950 text-white font-bold py-3.5 rounded-full text-xs transition-all shadow-xs"
                  >
                    {language === 'en' ? 'Return to Store' : 'ወደ ገበያ ይመለሱ'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Order Status Tracking Modal */}
      {isOrderStatusOpen && (
        <div className="order-status-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 text-left relative">
            
            {/* Close button */}
            <button
              onClick={() => setIsOrderStatusOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Header */}
            <div className="space-y-1.5 pr-8">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-kasma-blue" />
                <h3 className="text-lg font-black tracking-tight text-gray-950 dark:text-white">
                  {language === 'en' ? 'Track Shipment Status' : 'የትዕዛዝዎን ጭነት መከታተያ'}
                </h3>
              </div>
              <p className="text-xs text-gray-400">
                {language === 'en' 
                  ? 'Enter your Kasma order reference number to view real-time transit telemetry.' 
                  : 'ትዕዛዝዎ የደረሰበትን ደረጃ ለማወቅ የእቃ መለያ ቁጥሩን ያስገቡ።'}
              </p>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'Enter Order Reference (e.g. KS-3829)' : 'የትዕዛዝ መለያ ያስገቡ (ለምሳሌ KS-3829)'}
                    value={trackOrderId}
                    onChange={(e) => setTrackOrderId(e.target.value.toUpperCase())}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/50 rounded-xl text-sm font-mono focus:outline-none focus:ring-1.5 focus:ring-kasma-blue focus:border-kasma-blue text-gray-900 dark:text-zinc-100"
                  />
                  <Package className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
                </div>
                <button
                  onClick={() => {
                    setHasSearchedOrder(true);
                    const cleanedId = trackOrderId.trim();
                    const found = allOrders.find(o => o.id === cleanedId);
                    setTrackedOrder(found || null);
                  }}
                  className="px-6 py-3 bg-black hover:bg-zinc-950 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {language === 'en' ? 'Track' : 'ፈልግ'}
                </button>
              </div>

              {/* Suggestions / Recent orders helper - Visual Order History & Progress */}
              {allOrders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                      {language === 'en' ? 'Your Order History' : 'የእርስዎ የትዕዛዝ ታሪክ'}
                    </p>
                    <span className="text-[9px] bg-kasma-blue/15 text-kasma-blue px-2 py-0.5 rounded-full font-bold">
                      {allOrders.length} {language === 'en' ? 'Orders Found' : 'ትዕዛዞች'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allOrders.slice(0, 4).map((ord) => {
                      const isSelected = trackOrderId === ord.id;
                      const isOfflinePending = offlineOrders.some(o => o.id === ord.id);
                      
                      // Calculate step progress percentage for simple visualization
                      let progressPercent = 0;
                      let stepName = language === 'en' ? 'Processing' : 'በዝግጅት ላይ';
                      if (isOfflinePending) {
                        progressPercent = 0;
                        stepName = language === 'en' ? 'Offline (Pending Sync)' : 'ከመስመር ውጭ (ለመመሳሰል በመጠባበቅ ላይ)';
                      } else if (['PENDING_PAYMENT', 'PAID'].includes(ord.status)) {
                        progressPercent = 15;
                        stepName = language === 'en' ? 'Processing (Addis Hub)' : 'በዝግጅት ላይ (አዲስ አበባ)';
                      } else if (ord.status === 'PROCESSING') {
                        progressPercent = 45;
                        stepName = language === 'en' ? 'Dispatched' : 'በጉዞ ላይ';
                      } else if (ord.status === 'SHIPPED') {
                        progressPercent = 75;
                        stepName = language === 'en' ? 'Out for Delivery (Addis)' : 'ለመድረስ በጉዞ ላይ (አዲስ)';
                      } else if (ord.status === 'DELIVERED') {
                        progressPercent = 100;
                        stepName = language === 'en' ? 'Delivered' : 'ደርሷል';
                      }

                      return (
                        <button
                          key={ord.id}
                          onClick={() => {
                            setTrackOrderId(ord.id);
                            setTrackedOrder(ord);
                            setHasSearchedOrder(true);
                          }}
                          className={`w-full p-3.5 rounded-2xl text-left border transition-all space-y-3 cursor-pointer ${
                            isSelected
                              ? 'border-kasma-blue bg-kasma-blue/[0.03] dark:bg-kasma-blue/[0.01] ring-1.5 ring-kasma-blue shadow-sm'
                              : 'border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-850/30 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <p className="font-mono font-black text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${ord.status === 'DELIVERED' ? 'bg-green-500' : isOfflinePending ? 'bg-amber-500 animate-pulse' : 'bg-kasma-blue animate-pulse'}`} />
                                {ord.id}
                              </p>
                              <p className="text-[9px] text-gray-400 font-medium">
                                {new Date(ord.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right space-y-0.5">
                              <p className="font-mono font-extrabold text-[11px] text-gray-950 dark:text-white">
                                {ord.total.toLocaleString()} ETB
                              </p>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                isOfflinePending ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                ord.status === 'DELIVERED' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                ord.status === 'SHIPPED' ? 'bg-kasma-blue/10 text-kasma-blue dark:text-blue-400' :
                                ord.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600' :
                                'bg-amber-500/10 text-kasma-gold'
                              }`}>
                                {isOfflinePending ? (language === 'en' ? 'Offline Pending' : 'ከመስመር ውጭ በመጠባበቅ ላይ') :
                                 ord.status === 'DELIVERED' ? (language === 'en' ? 'Delivered' : 'ደርሷል') :
                                 ord.status === 'SHIPPED' ? (language === 'en' ? 'In Transit' : 'በጉዞ ላይ') :
                                 ord.status === 'PROCESSING' ? (language === 'en' ? 'Processing' : 'በዝግጅት ላይ') :
                                 ord.status === 'CANCELLED' ? (language === 'en' ? 'Cancelled' : 'ተሰርዟል') :
                                 (language === 'en' ? 'Paid' : 'ተከፍሏል')}
                              </span>
                            </div>
                          </div>

                          {/* Simple Progress Bar step-tracker */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-gray-400">
                              <span>{language === 'en' ? 'Progress' : 'ሂደት'}</span>
                              <span className="text-kasma-blue font-black font-mono">{stepName}</span>
                            </div>
                            <div className="h-1 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-kasma-blue rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${progressPercent}%` }} 
                              />
                            </div>
                            <div className="flex justify-between text-[7.5px] text-gray-400 font-bold uppercase tracking-widest">
                              <span>{language === 'en' ? 'Processing' : 'በማሸግ ላይ'}</span>
                              <span className="text-center">{language === 'en' ? 'Transit' : 'በጉዞ ላይ'}</span>
                              <span>{language === 'en' ? 'Out For Delivery' : 'ለመድረስ በጉዞ'}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            {hasSearchedOrder && (
              <div className="border-t border-gray-150 dark:border-zinc-800 pt-5 space-y-6">
                {trackedOrder ? (
                  <div className="space-y-6">
                    
                    {/* Compact Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/50 dark:bg-zinc-850 p-4 rounded-2xl border border-gray-150/40 dark:border-zinc-800/40 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{language === 'en' ? 'Recipient' : 'ተቀባይ'}</span>
                        <p className="font-extrabold text-gray-900 dark:text-white truncate">{trackedOrder.customerName}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{language === 'en' ? 'Phone' : 'ስልክ ቁጥር'}</span>
                        <p className="font-mono text-gray-600 dark:text-zinc-300">{trackedOrder.customerPhone}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{language === 'en' ? 'Total Amount' : 'ጠቅላላ ዋጋ'}</span>
                        <p className="font-mono font-extrabold text-kasma-gold">{trackedOrder.total.toLocaleString()} ETB</p>
                      </div>
                      <div className="space-y-0.5 col-span-2 md:col-span-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{language === 'en' ? 'Destination' : 'የመድረሻ አድራሻ'}</span>
                        <p className="text-gray-900 dark:text-white truncate font-medium" title={trackedOrder.shippingAddress}>{trackedOrder.shippingAddress}</p>
                      </div>
                    </div>

                    {/* Order Status Alerts (Cancelled / Refunded) */}
                    {trackedOrder.status === 'CANCELLED' ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center space-y-1">
                        <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{language === 'en' ? 'Order Cancelled' : 'ትዕዛዙ ተሰርዟል'}</p>
                        <p className="text-[11px] text-gray-400">{language === 'en' ? 'This order was cancelled and will not be dispatched.' : 'ይህ ትዕዛዝ ስለተሰረዘ ወደ ስርጭት አይወጣም።'}</p>
                      </div>
                    ) : trackedOrder.status === 'REFUNDED' ? (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center space-y-1">
                        <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{language === 'en' ? 'Order Refunded' : 'ክፍያ ተመላሽ ተደርጓል'}</p>
                        <p className="text-[11px] text-gray-400">{language === 'en' ? 'A full refund has been credited back to your payment method.' : 'ሙሉ ክፍያው ወደ መክፈያ ካርድዎ ተመላሽ ተደርጓል።'}</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {offlineOrders.some(o => o.id === trackedOrder.id) && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                            <div className="flex gap-3">
                              <span className="text-base leading-none shrink-0">⚠️</span>
                              <div>
                                <p className="font-extrabold uppercase tracking-wide text-[10px] mb-0.5">
                                  {language === 'en' ? 'Offline Cache Active' : 'ከመስመር ውጭ ካሽ ገቢር ነው'}
                                </p>
                                <p>
                                  {language === 'en' 
                                    ? 'This order was placed while connection was simulated offline. It is safely cached in your local browser and will start tracking once synchronization is forced or connection is restored.' 
                                    : 'ይህ ትዕዛዝ የተላለፈው ከመስመር ውጭ ሁነታ ላይ በነበሩበት ጊዜ ነው። በአሳሽዎ ውስጥ በሰላም የተቀመጠ ሲሆን አመሳስል ሲጫኑ ወደ ስርጭት ሂደት ይገባል።'}
                                </p>
                              </div>
                            </div>
                            {onForceSync && (
                              <button
                                type="button"
                                onClick={() => onForceSync()}
                                disabled={isSyncing}
                                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                                <span>{language === 'en' ? 'Sync Data Now' : 'አሁኑኑ አመሳስል'}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Dedicated Interactive Tracking Visualizer Component */}
                        <OrderTrackingVisualizer 
                          order={trackedOrder} 
                          language={language} 
                          onStatusChange={handleUpdateTrackedOrderStatus} 
                        />

                        {/* Live Delivery Dispatch Status Widget */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-[#0052FF]" />
                              <span>{language === 'en' ? 'Live Courier Dispatch Status' : 'የቀጥታ መልዕክተኞች ሁኔታ'}</span>
                            </h4>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{language === 'en' ? 'Live Dispatch' : 'ገቢር'}</span>
                            </span>
                          </div>
                          
                          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-zinc-100">
                                {trackedOrder?.courierName || (language === 'en' ? 'Express Addis Courier' : 'ፈጣን የአዲስ አበባ መልዕክተኛ')}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {trackedOrder?.courierPhone ? `📞 ${trackedOrder.courierPhone}` : (language === 'en' ? 'Addis Ababa City Fleet' : 'የአዲስ አበባ መልዕክተኞች')}
                              </p>
                            </div>
                            {trackedOrder && (
                              <a
                                href={`/tracking/${trackedOrder.id}`}
                                className="px-3 py-1.5 rounded-xl bg-[#0052FF] text-white font-bold text-xs"
                              >
                                {language === 'en' ? 'Track' : 'መከታተያ'}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Beautiful Telemetry Timeline Progress Indicator */}
                        <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {language === 'en' ? 'Real-Time Transit Progress' : 'የጭነት መከታተያ ሂደት'}
                        </h4>
                        
                        <div className="relative pl-6 border-l-2 border-gray-150 dark:border-zinc-800 space-y-6">
                          
                          {/* Step 1: Placed */}
                          <div className="relative">
                            <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-green-500 border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs" />
                            <div className="space-y-1">
                              <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <span>{language === 'en' ? 'Order Placed' : 'ትዕዛዝ ተመዝግቧል'}</span>
                                <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                  {language === 'en' ? 'Completed' : 'ተጠናቋል'}
                                </span>
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {language === 'en' ? 'Payment was successfully verified and order is queued for processing.' : 'ክፍያው ተረጋግጦ ትዕዛዙ ለመዘጋጀት ተመዝግቧል።'}
                              </p>
                              <p className="text-[9px] text-gray-400/80 font-mono">
                                {new Date(trackedOrder.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Step 2: Processing */}
                          {(() => {
                            const isCompleted = ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(trackedOrder.status);
                            const isActive = trackedOrder.status === 'PAID';
                            return (
                              <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs ${
                                  isCompleted ? 'bg-green-500' : isActive ? 'bg-kasma-blue animate-pulse' : 'bg-gray-200 dark:bg-zinc-800'
                                }`} />
                                <div className="space-y-1">
                                  <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>{language === 'en' ? 'Processing & Packaging' : 'ዝግጅት እና ማሸግ'}</span>
                                    {isCompleted ? (
                                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                        {language === 'en' ? 'Completed' : 'ተጠናቋል'}
                                      </span>
                                    ) : isActive ? (
                                      <span className="bg-kasma-blue/15 text-kasma-blue dark:text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded animate-pulse">
                                        {language === 'en' ? 'In Progress' : 'በዝግጅት ላይ'}
                                      </span>
                                    ) : (
                                      <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                        {language === 'en' ? 'Pending' : 'በጥበቃ ላይ'}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-gray-400">
                                    {language === 'en' ? 'Merchant is packing the products and preparing secure delivery stickers.' : 'ሻጩ እቃውን በማዘጋጀት እና ጥራት ባለው ማሸጊያ እያዘጋጀው ነው።'}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Step 3: Shipped */}
                          {(() => {
                            const isCompleted = ['SHIPPED', 'DELIVERED'].includes(trackedOrder.status);
                            const isActive = trackedOrder.status === 'PROCESSING';
                            return (
                              <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs ${
                                  isCompleted ? 'bg-green-500' : isActive ? 'bg-kasma-blue animate-pulse' : 'bg-gray-200 dark:bg-zinc-800'
                                }`} />
                                <div className="space-y-1">
                                  <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>{language === 'en' ? 'Dispatched & In Transit' : 'በጉዞ ላይ'}</span>
                                    {isCompleted ? (
                                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                        {language === 'en' ? 'Completed' : 'ተጠናቋል'}
                                      </span>
                                    ) : isActive ? (
                                      <span className="bg-kasma-blue/15 text-kasma-blue dark:text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded animate-pulse">
                                        {language === 'en' ? 'In Progress' : 'በጉዞ ላይ'}
                                      </span>
                                    ) : (
                                      <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                        {language === 'en' ? 'Pending' : 'በጥበቃ ላይ'}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-gray-400">
                                    {language === 'en' ? 'Shipment was dispatched and is currently in transit with Kasma Express.' : 'ዕቃው በካስማ የትራንስፖርት አገልግሎት ተጭኖ ወደ መድረሻው በመጓዝ ላይ ይገኛል።'}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Step 4: Arrived */}
                          {(() => {
                            const isCompleted = trackedOrder.status === 'DELIVERED';
                            const isActive = trackedOrder.status === 'SHIPPED';
                            return (
                              <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs ${
                                  isCompleted ? 'bg-green-500' : isActive ? 'bg-kasma-blue animate-pulse' : 'bg-gray-200 dark:bg-zinc-800'
                                }`} />
                                <div className="space-y-1">
                                  <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>{language === 'en' ? 'Safely Arrived & Delivered' : 'በስኬት ደርሷል'}</span>
                                    {isCompleted ? (
                                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                        {language === 'en' ? 'Delivered' : 'ደርሷል'}
                                      </span>
                                    ) : isActive ? (
                                      <span className="bg-kasma-blue/15 text-kasma-blue dark:text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded animate-pulse">
                                        {language === 'en' ? 'Out For Delivery' : 'ለመድረስ ጥቂት ቀርቷል'}
                                      </span>
                                    ) : (
                                      <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                        {language === 'en' ? 'Pending' : 'በጥበቃ ላይ'}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-gray-400">
                                    {language === 'en' ? 'The courier has successfully delivered the parcel to your designated address.' : 'መልዕክተኛው እቃውን በተፈለገው አድራሻ ላይ በጥንቃቄ አስረክቧል።'}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    </div>
                  )}

                    {/* Order Items List Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {language === 'en' ? 'Items Ordered' : 'የታዘዙ ምርቶች ዝርዝር'}
                      </h4>
                      <div className="border border-gray-150/55 dark:border-zinc-800/55 rounded-2xl divide-y divide-gray-150/40 dark:divide-zinc-800/40 overflow-hidden">
                        {trackedOrder.items.map((item, idx) => (
                          <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50/50 dark:hover:bg-zinc-850/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.product.image} 
                                alt={item.product.nameEn} 
                                className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-zinc-800 shrink-0"
                              />
                              <div className="text-left space-y-0.5">
                                <p className="font-bold text-gray-950 dark:text-white">
                                  {language === 'en' ? item.product.nameEn : item.product.nameAm}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono">
                                  {item.variantName} • {item.sku}
                                </p>
                              </div>
                            </div>
                            <div className="text-right space-y-0.5 shrink-0">
                              <p className="font-mono font-extrabold text-gray-900 dark:text-white">{(item.price * item.quantity).toLocaleString()} ETB</p>
                              <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2.5 text-gray-500">
                    <span className="text-3xl">🔍</span>
                    <p className="text-xs font-bold text-gray-950 dark:text-white">
                      {language === 'en' ? 'Order Reference Not Found' : 'የትዕዛዝ መለያ ቁጥሩ አልተገኘም'}
                    </p>
                    <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {language === 'en' 
                        ? 'We could not match that reference code to our delivery records. Please double-check spelling or try again.' 
                        : 'ያስገቡት የትዕዛዝ መለያ ቁጥር አልተገኘም። እባክዎን በትክክል መጻፉን ያረጋግጡ ወይም እንደገና ይሞክሩ።'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Back to store button */}
            <button
              onClick={() => setIsOrderStatusOpen(false)}
              className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              {language === 'en' ? 'Close Tracker' : 'መከታተያውን ዝጋ'}
            </button>

          </div>
        </div>
      )}

      {/* Floating Product Comparison Bar */}
      {comparedProductIds.length > 0 && (
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
      )}

      {/* Side-by-Side Product Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 transition-colors p-6 md:p-8">
            <button 
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute top-4 right-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-500 dark:text-zinc-400 rounded-full p-2 text-sm font-bold w-9 h-9 flex items-center justify-center z-50 transition-all border border-gray-150 dark:border-zinc-800 cursor-pointer"
              title="Close Comparison"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-kasma-blue text-white p-2.5 rounded-2xl">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-wider">
                  {language === 'en' ? 'Product Comparison Matrix' : 'የምርቶች ማነጻጸሪያ ማትሪክስ'}
                </h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                  {language === 'en' 
                    ? 'Review technical specifications and prices side-by-side' 
                    : 'ዝርዝር መግለጫዎችን እና ዋጋዎችን ጎን ለጎን ያነጻጽሩ'}
                </p>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-150 dark:border-zinc-850">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-850/50 border-b border-gray-150 dark:border-zinc-850">
                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 dark:text-zinc-500 tracking-wider w-1/4">
                      {language === 'en' ? 'Feature Specification' : 'የምርት ዝርዝር መግለጫ'}
                    </th>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      return (
                        <th key={index} className="p-4 w-1/4 border-l border-gray-150 dark:border-zinc-850 relative align-top">
                          {prod ? (
                            <div className="space-y-3 relative group">
                              <button
                                onClick={() => setComparedProductIds(comparedProductIds.filter(id => id !== prod.id))}
                                className="absolute -top-2 -right-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black border border-rose-200 cursor-pointer shadow-sm z-10"
                                title="Remove item"
                              >
                                ✕
                              </button>
                              <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850">
                                <LazyImage src={prod.image} alt={prod.nameEn} className="w-full h-full object-cover" />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-kasma-gold uppercase tracking-widest block">
                                  {prod.brand}
                                </span>
                                <h4 className="text-xs font-extrabold text-gray-950 dark:text-white line-clamp-1 truncate min-h-[18px] leading-tight">
                                  {language === 'en' ? prod.nameEn : prod.nameAm}
                                </h4>
                                <p className="text-sm font-black text-black dark:text-white font-mono">
                                  {prod.price.toLocaleString()} ETB
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl min-h-[140px] space-y-2">
                              <span className="text-xl text-gray-300">📦</span>
                              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                                {language === 'en' ? 'Empty Slot' : 'ባዶ ቦታ'}
                              </p>
                              <select
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    setComparedProductIds([...comparedProductIds, val]);
                                  }
                                }}
                                className="bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-600 dark:text-zinc-400 focus:outline-none w-full"
                                value=""
                              >
                                <option value="">{language === 'en' ? '+ Choose Product' : '+ ምርት ይምረጡ'}</option>
                                {products
                                  .filter(p => p.status === 'APPROVED' && !comparedProductIds.includes(p.id))
                                  .map(p => (
                                    <option key={p.id} value={p.id}>
                                      {language === 'en' ? p.nameEn : p.nameAm} ({p.price.toLocaleString()} ETB)
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 dark:text-zinc-300 divide-y divide-gray-150 dark:divide-zinc-850">
                  {/* Category */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Category' : 'ምድብ'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      const catName = prod ? (categories.find(c => c.id === prod.category)?.[language === 'en' ? 'nameEn' : 'nameAm'] || prod.category) : '-';
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 font-semibold">
                          {catName}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Brand */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Brand' : 'ብራንድ'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 font-bold text-gray-900 dark:text-white">
                          {prod ? prod.brand : '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Merchant Store */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Seller / Merchant' : 'ሻጭ / ነጋዴ'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 font-medium">
                          {prod ? prod.merchantName : '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Rating Info */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Customer Rating' : 'የደንበኞች ደረጃ'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                      const { avg, count } = getProductRatingInfo(prod);
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">
                          {count > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <div className="flex text-amber-500">
                                {[...Array(Math.round(avg))].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current shrink-0" />
                                ))}
                              </div>
                              <span className="font-bold text-gray-900 dark:text-white">{avg} ({count})</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px] italic">
                              {language === 'en' ? 'No reviews yet' : 'እስካሁን ግምገማ የለም'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Stock Availability */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'In-Stock Status' : 'የክምችት ሁኔታ'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                      const totalStock = prod.variants.reduce((sum, v) => sum + v.onHand, 0);
                      const isOut = totalStock <= 0;
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">
                          {isOut ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold uppercase text-[9px] bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/40">
                              {language === 'en' ? 'Out of Stock' : 'ክምችት አልቋል'}
                            </span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase text-[9px] bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
                              {language === 'en' ? `${totalStock} units available` : `${totalStock} ዕቃዎች አሉ`}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Key Features */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Key Features' : 'ዋና ዋና ባህሪያት'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                      const features = getProductFeatures(prod);
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 space-y-1.5 align-top">
                          {features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-1.5 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                              <span className="text-[#0052FF] text-xs shrink-0 select-none">✦</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Technical Specifications */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Technical Specs' : 'ቴክኒካዊ መግለጫዎች'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                      const specs = getProductSpecs(prod);
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 space-y-2.5 align-top">
                          {specs.map((spec, sIdx) => (
                            <div key={sIdx} className="border-b border-gray-100 dark:border-zinc-850/60 pb-2 last:border-0 last:pb-0">
                              <span className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">
                                {language === 'en' ? spec.labelEn : spec.labelAm}
                              </span>
                              <span className="block text-[11px] font-black text-gray-800 dark:text-zinc-200 mt-0.5 leading-snug">
                                {language === 'en' ? spec.valueEn : spec.valueAm}
                              </span>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Variants */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Available Variants' : 'የሚገኙ አይነቶች'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 space-y-2 align-top">
                          {prod.variants.map((v) => (
                            <div key={v.sku} className="text-[10px] bg-gray-50 dark:bg-zinc-850 p-2 rounded-xl border border-gray-100 dark:border-zinc-800/80 flex items-center justify-between font-medium gap-2">
                              <div className="min-w-0 flex-1">
                                <span className="block truncate font-bold text-gray-900 dark:text-white leading-tight">{v.name}</span>
                                <span className="block text-[8px] font-mono text-gray-450 mt-0.5">
                                  {v.sku} • {v.priceOffset > 0 ? `+${v.priceOffset} ETB` : v.priceOffset < 0 ? `${v.priceOffset} ETB` : 'Base Price'}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  addToCart(prod, v, 1);
                                }}
                                className="p-1 px-2.5 bg-indigo-50 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-zinc-750 text-[#0052FF] dark:text-blue-400 font-extrabold text-[9px] uppercase rounded-lg border border-blue-150/50 dark:border-zinc-700/80 transition-all shrink-0 cursor-pointer"
                                title={language === 'en' ? `Add ${v.name} to Cart` : `ቅርጫት ውስጥ አስገባ`}
                              >
                                + Add
                              </button>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Descriptions */}
                  <tr>
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Product Description' : 'የምርት መግለጫ'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      const desc = prod ? (language === 'en' ? prod.descriptionEn : prod.descriptionAm) : '';
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 text-gray-500 dark:text-zinc-400 leading-relaxed text-[11px] align-top max-w-xs">
                          <p className="line-clamp-6">{desc || '-'}</p>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Action Buttons */}
                  <tr className="bg-gray-50/50 dark:bg-zinc-850/20">
                    <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      {language === 'en' ? 'Quick Actions' : 'ፈጣን ተግባራት'}
                    </td>
                    {[0, 1, 2].map((index) => {
                      const pId = comparedProductIds[index];
                      const prod = pId ? products.find(p => p.id === pId) : null;
                      if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850"></td>;
                      return (
                        <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 space-y-2">
                          <button
                            onClick={() => {
                              setIsCompareModalOpen(false);
                              handleOpenProduct(prod);
                            }}
                            className="w-full bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-gray-800 dark:text-zinc-200 border border-gray-250 dark:border-zinc-700 font-extrabold uppercase text-[10px] tracking-wider py-2.5 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#0052FF]" />
                            <span>{language === 'en' ? 'Quick View' : 'ፈጣን እይታ'}</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              const defaultVariant = prod.variants[0];
                              if (defaultVariant) {
                                addToCart(prod, defaultVariant, 1);
                              }
                            }}
                            className="w-full bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold uppercase text-[10px] tracking-wider py-2.5 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                            <span>{language === 'en' ? 'Add Default' : 'ቅርጫት ውስጥ አስገባ'}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Feed */}
      <div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-5 z-[9999] flex flex-col gap-2 max-w-sm w-auto pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded-xl border shadow-xl flex items-center justify-between text-xs pointer-events-auto transition-all duration-300 transform translate-x-0 ${
              t.type === 'success' 
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

      {/* REAL TRANSACTION PRIVACY-SAFE COMPACT POPUP */}
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

      {/* My Orders Modal View */}
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

      {/* User Profile Vault Modal View */}
      <UserProfileView
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        initialAuthMode={profileAuthMode}
        isLoggedIn={isLoggedIn}
        onLogin={(phone, name) => {
          setIsLoggedIn(true);
          if (phone) setCustomerPhone(phone);
          if (name) setCustomerName(name);
        }}
        onLogout={() => {
          setIsLoggedIn(false);
        }}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onOpenTrackShipment={() => {
          setHasSearchedOrder(false);
          setTrackedOrder(null);
          setTrackOrderId('');
          setIsOrderStatusOpen(true);
        }}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        addresses={addresses}
        onAddAddress={handleAddAddress}
        onDeleteAddress={handleDeleteAddress}
        onSetDefaultAddress={handleSetDefaultAddress}
        paymentMethods={paymentMethods}
        onAddPaymentMethod={handleAddPaymentMethod}
        onDeletePaymentMethod={handleDeletePaymentMethod}
        onSetDefaultPaymentMethod={handleSetDefaultPaymentMethod}
        kasmaPoints={kasmaPoints}
        onAddPoints={handleAddPoints}
        pointsLogs={pointsLogs}
        onRedeemReward={handleRedeemReward}
        showToast={showToast}
        orders={orders}
      />

      {/* Dedicated Flash Deals & Offers Hub Modal View */}
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
      />

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      <nav 
        id="mobile-bottom-nav-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1 flex items-center justify-around select-none min-h-[56px]"
      >
        {/* 1. HOME TAB */}
        <button
          type="button"
          onClick={() => {
            setIsProfileOpen(false);
            setIsMyOrdersOpen(false);
            setIsCartOpen(false);
            setIsWishlistOpen(false);
            setIsFlashDealsOpen(false);
            setSelectedProduct(null);
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] relative ${
            !isProfileOpen && !isMyOrdersOpen && !isCartOpen && !isWishlistOpen && !isFlashDealsOpen && !selectedProduct
              ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 scale-102 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight">{language === 'en' ? 'Home' : 'ዋና ገጽ'}</span>
        </button>

        {/* 2. SEARCH TAB */}
        <button
          type="button"
          onClick={() => {
            setIsProfileOpen(false);
            setIsMyOrdersOpen(false);
            setIsCartOpen(false);
            setIsWishlistOpen(false);
            setIsFlashDealsOpen(false);
            setSelectedProduct(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              const searchInput = document.getElementById('mobile-search-input') || document.querySelector('input[type="text"]');
              if (searchInput) {
                (searchInput as HTMLInputElement).focus();
              }
            }, 100);
          }}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium"
        >
          <Search className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight">{language === 'en' ? 'Search' : 'ፈልግ'}</span>
        </button>

        {/* 3. DEALS / OFFERS TAB */}
        <button
          type="button"
          onClick={() => {
            setIsProfileOpen(false);
            setIsMyOrdersOpen(false);
            setIsCartOpen(false);
            setIsWishlistOpen(false);
            setIsFlashDealsOpen(true);
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] relative ${
            isFlashDealsOpen
              ? 'text-amber-500 dark:text-amber-400 font-black bg-amber-50/80 dark:bg-amber-950/60 scale-102 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-amber-500 before:rounded-full'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
          }`}
        >
          <Flame className="w-5 h-5 mb-0.5 text-amber-500 fill-amber-500/20 animate-pulse stroke-[2.2px]" />
          <span className="text-[10px] tracking-tight">{language === 'en' ? 'Deals' : 'ቅናሾች'}</span>
        </button>

        {/* 4. CART TAB */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] relative ${
            isCartOpen
              ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 scale-102 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[9px] font-mono font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white dark:border-zinc-900 animate-bounce">
                {totalCartItems > 99 ? '99+' : totalCartItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{language === 'en' ? 'Cart' : 'ጋሪ'}</span>
        </button>

        {/* 5. PROFILE / ACCOUNT TAB */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] relative ${
            isProfileOpen
              ? 'text-[#0052FF] dark:text-blue-400 font-black bg-blue-50/80 dark:bg-blue-950/60 scale-102 before:absolute before:-top-1 before:w-6 before:h-1 before:bg-[#0052FF] before:rounded-full'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 font-medium'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5 stroke-[2.2px]" />
            {isLoggedIn && (
              <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-zinc-900 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">{language === 'en' ? 'Profile' : 'መለያ'}</span>
        </button>
      </nav>

      {/* SHARE CART MODAL DIALOG */}
      <AnimatePresence>
        {isShareCartModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 text-gray-900 dark:text-zinc-100 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/40">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-950 dark:text-white tracking-tight">
                      {language === 'en' ? 'Share Shopping Cart' : 'የገበያ ጋሪዎን ያጋሩ'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {language === 'en' 
                        ? `Unique link with ${cart.length} item${cart.length > 1 ? 's' : ''}` 
                        : `${cart.length} እቃዎችን የያዘ ልዩ ሊንክ`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareCartModalOpen(false)}
                  className="text-gray-400 hover:text-gray-950 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Generated Link Input Box & Copy Button */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  {language === 'en' ? 'Shareable Cart URL' : 'የጋሪው ሊንክ'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow min-w-0">
                    <input
                      type="text"
                      readOnly
                      value={generateShareableCartUrl(cart)}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 dark:text-zinc-300 font-mono focus:outline-none truncate select-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCartLink}
                    className="bg-[#0052FF] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedSharedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>{language === 'en' ? 'Copied!' : 'ተቀድቷል!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{language === 'en' ? 'Copy Link' : 'ሊንክ ቅዳ'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Messaging Share Channels */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(generateShareableCartUrl(cart))}&text=${encodeURIComponent(language === 'en' ? 'Check out my Kasma shopping cart!' : 'የእኔን ካስማ የገበያ ጋሪ ይመልከቱ!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-900/40 transition-all text-blue-600 dark:text-blue-400 cursor-pointer group"
                >
                  <Send className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-extrabold">{language === 'en' ? 'Telegram' : 'ቴሌግራም'}</span>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent((language === 'en' ? 'Check out my Kasma shopping cart: ' : 'የካስማ የገበያ ጋሪዬን ይመልከቱ፡ ') + generateShareableCartUrl(cart))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-900/40 transition-all text-emerald-600 dark:text-emerald-400 cursor-pointer group"
                >
                  <MessageCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-extrabold">{language === 'en' ? 'WhatsApp' : 'ዋትስአፕ'}</span>
                </a>

                <button
                  type="button"
                  onClick={handleNativeShareCart}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-750 border border-gray-200 dark:border-zinc-700 transition-all text-gray-700 dark:text-zinc-200 cursor-pointer group"
                >
                  <Share2 className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-extrabold">{language === 'en' ? 'Native Share' : 'ማጋሪያ'}</span>
                </button>
              </div>

              {/* Items Summary list preview */}
              <div className="bg-gray-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800/80 space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  <span>{language === 'en' ? 'Cart Preview' : 'የጋሪ እቃዎች'}</span>
                  <span className="font-mono">{cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()} ETB</span>
                </div>
                <div className="space-y-1.5">
                  {cart.map((item) => (
                    <div key={item.sku} className="flex items-center justify-between text-xs py-1 border-b border-gray-150 dark:border-zinc-850/60 last:border-0">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <img src={item.product.image} alt={item.product.nameEn} className="w-7 h-7 object-cover rounded-lg shrink-0 border border-gray-200 dark:border-zinc-800" />
                        <span className="font-bold text-gray-900 dark:text-zinc-200 truncate">{language === 'en' ? item.product.nameEn : item.product.nameAm}</span>
                        <span className="text-[10px] text-gray-400">x{item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-[#0052FF] shrink-0">{(item.price * item.quantity).toLocaleString()} ETB</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Behavioral Signals & Recommendation Breakdown Modal */}
      <AnimatePresence>
        {isSignalsModalOpen && (
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
                  onClick={() => setIsSignalsModalOpen(false)}
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
                onClick={() => setIsSignalsModalOpen(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer mt-2"
              >
                {language === 'en' ? 'Got It' : 'ተረድቻለሁ'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Support Button with Delayed Fade-in & Optimized Clearance */}
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

    </div>
  );
}

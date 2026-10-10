import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  Product, 
  Merchant, 
  Order, 
  Review,
  StockMovementLog, 
  AuditLog, 
  TelegramAlert, 
  CartItem, 
  PriceAlert, 
  PromoCode,
  DeliveryAddress,
  SavedPaymentMethod,
  KasmaPointsLog,
  KasmaPointsReward,
  DigitalWarrantyPass,
  WarrantyClaim
} from '../types';
import { createDigitalWarrantyPass } from '../lib/warrantyService';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_MERCHANTS, 
  INITIAL_ORDERS,
  INITIAL_STOCK_LOGS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_TELEGRAM_ALERTS 
} from '../mockData';
import { initTelegramMiniApp } from '../utils/telegramWebApp';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ShopContextType {
  // Catalog & State
  products: Product[];
  categories: { id: string; nameEn: string; nameAm: string; }[];
  merchants: Merchant[];
  orders: Order[];
  auditLogs: AuditLog[];
  alerts: TelegramAlert[];
  isInitializing: boolean;
  refreshState: () => Promise<void>;

  // Localization & Theme
  language: 'en' | 'am';
  setLanguage: (lang: 'en' | 'am') => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  // Cart
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product, variantSku?: string, qty?: number) => void;
  removeFromCart: (sku: string) => void;
  updateCartQuantity: (sku: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Favorites / Wishlist
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFavorite: (productId: string) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Alerts, Guided Tour & Overlays
  priceAlerts: PriceAlert[];
  setPriceAlerts: React.Dispatch<React.SetStateAction<PriceAlert[]>>;
  isPriceAlertsOpen: boolean;
  setIsPriceAlertsOpen: (open: boolean) => void;
  isQrScannerOpen: boolean;
  setIsQrScannerOpen: (open: boolean) => void;
  isProductTourOpen: boolean;
  setIsProductTourOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;

  // Sync & Offline State
  offlineOrders: Order[];
  setOfflineOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  isOfflineSimulated: boolean;
  setIsOfflineSimulated: (sim: boolean) => void;
  isSyncing: boolean;
  handleForceSync: () => Promise<void>;

  // Tech Specs Comparison
  comparedProductIds: string[];
  toggleCompare: (productId: string, e?: React.MouseEvent) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  openCompareWith: (productIds: string[]) => void;

  // Promo Codes & Discounts
  promoCodes: PromoCode[];
  appliedPromo: PromoCode | null;
  applyPromoCode: (codeStr: string) => boolean;
  removePromoCode: () => void;
  discountAmount: number;

  // Orders & Stock
  addOrder: (order: Order) => void;
  updateProductStock: (productId: string, sku: string, qtyChange: number, reason: string) => void;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  updateCourierOrderStatus: (
    orderId: string,
    newStatus: Order['status'],
    details?: {
      courierName?: string;
      courierPhone?: string;
      trackingNotes?: string;
      deliveredAt?: string;
      gateNotes?: string;
    }
  ) => Promise<boolean>;

  // Toast System
  toasts: ToastNotification[];
  showToast: (message: string, type?: ToastNotification['type']) => void;

  // User Profile & Addresses
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  isCustomerLoggedIn: boolean;
  loginCustomer: (phone: string, name?: string) => void;
  logoutCustomer: () => void;
  addresses: DeliveryAddress[];
  addAddress: (addr: Omit<DeliveryAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;

  // Admin / Merchant Approvals
  approveProduct: (id: string) => Promise<void>;
  rejectProduct: (id: string) => Promise<void>;
  approveMerchantKyc: (merchantId: string) => Promise<void>;
  toggleMerchantStatus: (merchantId: string) => Promise<void>;
  approvePayout: (merchantId: string, payoutId: string) => Promise<void>;

  // Post-Delivery Reviews
  addProductReview: (params: {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
    reviewerName?: string;
    reviewerPhone?: string;
    deliveryRating?: number;
    tags?: string[];
  }) => Promise<boolean>;

  // Digital Warranty & Serial Claims
  submitWarrantyClaim: (params: {
    orderId: string;
    warrantyId: string;
    productId: string;
    productName: string;
    serialNumber: string;
    customerName: string;
    customerPhone: string;
    issueType: WarrantyClaim['issueType'];
    description: string;
    serviceMethod: WarrantyClaim['serviceMethod'];
  }) => Promise<WarrantyClaim>;
  getOrderWarranties: (order: Order) => DigitalWarrantyPass[];
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [alerts, setAlerts] = useState<TelegramAlert[]>(INITIAL_TELEGRAM_ALERTS);
  const [isInitializing, setIsInitializing] = useState(true);

  // Localization & Theme
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('kasma_theme') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  // Search & Category
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kasma_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kasma_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Drawer & Overlay UI states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isPriceAlertsOpen, setIsPriceAlertsOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Price Alerts with LocalStorage
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('kasma_price_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kasma_price_alerts', JSON.stringify(priceAlerts));
    } catch {}
  }, [priceAlerts]);

  // Offline Simulation & Data Sync
  const [offlineOrders, setOfflineOrders] = useState<Order[]>([]);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Tech Specs Comparison State (Up to 2 devices side-by-side)
  const [comparedProductIds, setComparedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kasma_compared_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('kasma_compared_products', JSON.stringify(comparedProductIds));
    } catch {}
  }, [comparedProductIds]);

  // Promo Codes
  const [promoCodes] = useState<PromoCode[]>([
    {
      code: 'KASMA2026',
      type: 'PERCENTAGE',
      value: 10,
      minSubtotal: 2000,
      descriptionEn: '10% off on orders above 2,000 ETB',
      descriptionAm: 'ከ 2,000 ብር በላይ ትዕዛዞች ላይ 10% ቅናሽ'
    },
    {
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 150,
      minSubtotal: 3500,
      descriptionEn: 'Free Express Shipping in Addis Ababa',
      descriptionAm: 'በአዲስ አበባ ውስጥ ነፃ ፈጣን ማጓጓዣ'
    },
    {
      code: 'TECH500',
      type: 'FLAT',
      value: 500,
      minSubtotal: 15000,
      descriptionEn: '500 ETB instant discount on flagship electronics',
      descriptionAm: 'በከፍተኛ የኤሌክትሮኒክስ እቃዎች ላይ 500 ብር ቅናሽ'
    }
  ]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // User Profile
  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('kasma_customer_name') || 'Getachew Zemene';
  });
  const [customerPhone, setCustomerPhone] = useState<string>(() => {
    return localStorage.getItem('kasma_customer_phone') || '+251 91 123 4567';
  });
  const [customerEmail, setCustomerEmail] = useState<string>(() => {
    return localStorage.getItem('kasma_customer_email') || 'customer@kasma.et';
  });
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('kasma_customer_logged_in') === 'true';
  });
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([
    {
      id: 'addr-1',
      label: 'HOME',
      fullName: 'Getachew Zemene',
      phone: '+251 91 123 4567',
      subCity: 'Bole',
      woreda: 'Woreda 03',
      streetAddress: 'Around Edna Mall, House 204',
      isDefault: true
    }
  ]);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback((message: string, type: ToastNotification['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Save Cart & Favorites
  useEffect(() => {
    try {
      localStorage.setItem('kasma_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('kasma_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('kasma_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  // TMA auto-init
  useEffect(() => {
    const tma = initTelegramMiniApp();
    if (tma && tma.user) {
      if (tma.colorScheme === 'dark') setTheme('dark');
      if (tma.user.first_name) setCustomerName(tma.user.first_name);
    }
  }, []);

  // Backend state fetcher
  const refreshState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) setProducts(data.products);
        if (data.merchants && Array.isArray(data.merchants)) setMerchants(data.merchants);
        if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) setOrders(data.orders);
        if (data.auditLogs && Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
        if (data.alerts && Array.isArray(data.alerts)) setAlerts(data.alerts);
      }
    } catch (err) {
      console.warn('API state sync fallback to offline store:', err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleForceSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await refreshState();
      showToast(language === 'en' ? 'Data synchronized successfully!' : 'ዳታ በተሳካ ሁኔታ ተመሳስሏል!', 'success');
    } catch (e) {
      showToast(language === 'en' ? 'Sync failed. Working in offline mode.' : 'ማመሳሰል አልተሳካም።', 'warning');
    } finally {
      setIsSyncing(false);
    }
  }, [language, refreshState, showToast]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Cart operations
  const addToCart = useCallback((product: Product, variantSku?: string, qty = 1) => {
    const selectedVariant = variantSku 
      ? product.variants.find(v => v.sku === variantSku) || product.variants[0]
      : product.variants[0];

    const sku = selectedVariant?.sku || `SKU-${product.id}`;
    const variantName = selectedVariant?.name || 'Standard';
    const price = product.price + (selectedVariant?.priceOffset || 0);

    setCart(prev => {
      const existing = prev.find(item => item.sku === sku);
      if (existing) {
        return prev.map(item =>
          item.sku === sku ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { product, sku, variantName, quantity: qty, price }];
    });

    showToast(
      language === 'en' ? `Added ${product.nameEn} to cart` : `${product.nameAm} ወደ ጋሪ ታክሏል`,
      'success'
    );
  }, [language, showToast]);

  const removeFromCart = useCallback((sku: string) => {
    setCart(prev => prev.filter(item => item.sku !== sku));
  }, []);

  const updateCartQuantity = useCallback((sku: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(sku);
      return;
    }
    setCart(prev => prev.map(item => item.sku === sku ? { ...item, quantity: qty } : item));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Favorites toggle
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(
        exists 
          ? (language === 'en' ? 'Removed from Wishlist' : 'ከምኞት ዝርዝር ተወግዷል')
          : (language === 'en' ? 'Saved to Wishlist' : 'ወደ ምኞት ዝርዝር ተቀምጧል'),
        'info'
      );
      return updated;
    });
  }, [language, showToast]);

  // Tech Specs Comparison Handlers (Side-by-Side comparison of 2 devices)
  const toggleCompare = useCallback((productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setComparedProductIds(prev => {
      if (prev.includes(productId)) {
        const next = prev.filter(id => id !== productId);
        showToast(language === 'en' ? 'Removed from Comparison' : 'ከማነጻጸሪያው ተወግዷል', 'info');
        return next;
      }
      if (prev.length >= 2) {
        // Swap 2nd slot to allow effortless replacement
        const next = [prev[0], productId];
        showToast(
          language === 'en'
            ? 'Side-by-side comparison slot updated'
            : 'የጎን ለጎን ማነጻጸሪያው ተዘምኗል',
          'success'
        );
        return next;
      }
      const next = [...prev, productId];
      showToast(
        language === 'en'
          ? 'Added to Tech Specs Comparison'
          : 'ወደ ቴክኖሎጂ ዝርዝር ማነጻጸሪያ ታክሏል',
        'success'
      );
      return next;
    });
  }, [language, showToast]);

  const removeFromCompare = useCallback((productId: string) => {
    setComparedProductIds(prev => prev.filter(id => id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setComparedProductIds([]);
    showToast(language === 'en' ? 'Comparison cleared' : 'ማነጻጸሪያው ጸድቷል', 'info');
  }, [language, showToast]);

  const openCompareWith = useCallback((productIds: string[]) => {
    setComparedProductIds(productIds.slice(0, 2));
    setIsCompareModalOpen(true);
  }, []);

  // Promo code calculation
  const applyPromoCode = useCallback((codeStr: string): boolean => {
    const found = promoCodes.find(p => p.code.toUpperCase() === codeStr.trim().toUpperCase());
    if (!found) {
      showToast(language === 'en' ? 'Invalid promo code' : 'ትክክለኛ ያልሆነ የቅናሽ ኮድ', 'warning');
      return false;
    }
    if (found.minSubtotal && cartSubtotal < found.minSubtotal) {
      showToast(
        language === 'en'
          ? `Minimum order of ${found.minSubtotal.toLocaleString()} ETB required for this code`
          : `ይህንን ኮድ ለመጠቀም ቢያንስ ${found.minSubtotal.toLocaleString()} ብር ማዘዝ ያስፈልጋል`,
        'warning'
      );
      return false;
    }
    setAppliedPromo(found);
    showToast(
      language === 'en' ? `Promo code "${found.code}" applied!` : `የቅናሽ ኮድ "${found.code}" ተተግብሯል!`,
      'success'
    );
    return true;
  }, [cartSubtotal, language, promoCodes, showToast]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  const discountAmount = appliedPromo
    ? appliedPromo.type === 'PERCENTAGE'
      ? Math.round((cartSubtotal * appliedPromo.value) / 100)
      : appliedPromo.value
    : 0;

  // Orders
  const addOrder = useCallback((order: Order) => {
    const warranties = order.warranties && order.warranties.length > 0
      ? order.warranties
      : order.items.map(item => createDigitalWarrantyPass(order, item));

    const enrichedOrder: Order = {
      ...order,
      warranties
    };

    setOrders(prev => [enrichedOrder, ...prev]);
    clearCart();
    setAppliedPromo(null);
  }, [clearCart]);

  // Helper to obtain admin token headers
  const getAdminAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  // Helper to obtain merchant or admin token headers
  const getMerchantAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem('kasma_merchant_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  const updateProductStock = useCallback(async (productId: string, sku: string, qtyChange: number, reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        variants: p.variants.map(v => v.sku === sku ? { ...v, onHand: Math.max(0, v.onHand + qtyChange) } : v)
      };
    }));
    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getMerchantAuthHeaders()
        },
        body: JSON.stringify({ sku, change: qtyChange, reason })
      });
    } catch {}
  }, [getMerchantAuthHeaders]);

  const updateOrderStatus = useCallback((orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  }, []);

  const updateCourierOrderStatus = useCallback(async (
    orderId: string,
    newStatus: Order['status'],
    details?: {
      courierName?: string;
      courierPhone?: string;
      trackingNotes?: string;
      deliveredAt?: string;
      gateNotes?: string;
    }
  ): Promise<boolean> => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status: newStatus,
        courierName: details?.courierName || o.courierName || 'Ermias Berhanu',
        courierPhone: details?.courierPhone || o.courierPhone || '+251 91 199 8877',
        trackingNotes: details?.trackingNotes || o.trackingNotes,
        gateNotes: details?.gateNotes !== undefined ? details.gateNotes : o.gateNotes,
        shippedAt: newStatus === 'SHIPPED' ? (o.shippedAt || now) : o.shippedAt,
        deliveredAt: newStatus === 'DELIVERED' ? (details?.deliveredAt || now) : o.deliveredAt
      };
    }));

    try {
      await fetch(`/api/courier/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          courierName: details?.courierName || 'Ermias Berhanu',
          courierPhone: details?.courierPhone || '+251 91 199 8877',
          trackingNotes: details?.trackingNotes,
          deliveredAt: details?.deliveredAt || now
        })
      });
    } catch {}

    const statusMessage = 
      newStatus === 'DELIVERED'
        ? (language === 'en' ? `Order #${orderId} delivered & confirmed!` : `ትዕዛዝ #${orderId} በተሳካ ሁኔታ ደርሷል!`)
        : newStatus === 'SHIPPED'
        ? (language === 'en' ? `Order #${orderId} is out for delivery!` : `ትዕዛዝ #${orderId} በጉዞ ላይ ነው!`)
        : (language === 'en' ? `Order #${orderId} updated to ${newStatus}` : `ትዕዛዝ #${orderId} ወደ ${newStatus} ተዘምኗል`);

    showToast(statusMessage, 'success');
    return true;
  }, [language, showToast]);

  // Customer Auth
  const loginCustomer = useCallback((phone: string, name?: string) => {
    setCustomerPhone(phone);
    if (name) setCustomerName(name);
    setIsCustomerLoggedIn(true);
    localStorage.setItem('kasma_customer_phone', phone);
    if (name) localStorage.setItem('kasma_customer_name', name);
    localStorage.setItem('kasma_customer_logged_in', 'true');
  }, []);

  const logoutCustomer = useCallback(() => {
    setIsCustomerLoggedIn(false);
    localStorage.removeItem('kasma_customer_logged_in');
    localStorage.removeItem('kasma_auth_token');
    localStorage.removeItem('kasma_auth_user');
  }, []);

  const addAddress = useCallback((addr: Omit<DeliveryAddress, 'id'>) => {
    const newAddr: DeliveryAddress = { ...addr, id: `addr-${Date.now()}` };
    setAddresses(prev => [...prev, newAddr]);
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  }, []);

  // Admin Actions with RBAC Bearer Headers
  const approveProduct = useCallback(async (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
    try {
      const res = await fetch(`/api/products/${id}/approve`, {
        method: 'PUT',
        headers: getAdminAuthHeaders()
      });
      if (res.ok) {
        showToast('Product listing approved', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to approve product', 'warning');
      }
    } catch {}
  }, [getAdminAuthHeaders, showToast]);

  const rejectProduct = useCallback(async (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p));
    try {
      const res = await fetch(`/api/products/${id}/reject`, {
        method: 'PUT',
        headers: getAdminAuthHeaders()
      });
      if (res.ok) {
        showToast('Product listing rejected', 'info');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to reject product', 'warning');
      }
    } catch {}
  }, [getAdminAuthHeaders, showToast]);

  const approveMerchantKyc = useCallback(async (merchantId: string) => {
    setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, kycStatus: 'APPROVED', status: 'ACTIVE' } : m));
    try {
      const res = await fetch(`/api/merchants/${merchantId}/kyc/approve`, {
        method: 'PUT',
        headers: getAdminAuthHeaders()
      });
      if (res.ok) {
        showToast('Merchant KYC approved', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to approve KYC', 'warning');
      }
    } catch {}
  }, [getAdminAuthHeaders, showToast]);

  const toggleMerchantStatus = useCallback(async (merchantId: string) => {
    let nextStatus: 'ACTIVE' | 'SUSPENDED' = 'ACTIVE';
    setMerchants(prev => prev.map(m => {
      if (m.id !== merchantId) return m;
      nextStatus = m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      return { ...m, status: nextStatus };
    }));
    try {
      await fetch(`/api/merchants/${merchantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders()
        },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {}
  }, [getAdminAuthHeaders]);

  const approvePayout = useCallback(async (merchantId: string, payoutId: string) => {
    setMerchants(prev => prev.map(m => {
      if (m.id !== merchantId) return m;
      return {
        ...m,
        payouts: m.payouts.map(p => p.id === payoutId ? { ...p, status: 'COMPLETED' } : p)
      };
    }));
    try {
      const res = await fetch(`/api/merchants/${merchantId}/payout/${payoutId}/approve`, {
        method: 'PUT',
        headers: getAdminAuthHeaders()
      });
      if (res.ok) {
        showToast('Payout approved and wire settlement confirmed', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to approve payout', 'warning');
      }
    } catch {}
  }, [getAdminAuthHeaders, showToast]);

  // Post-Delivery Review Handler
  const addProductReview = useCallback(async (params: {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
    reviewerName?: string;
    reviewerPhone?: string;
    deliveryRating?: number;
    tags?: string[];
  }): Promise<boolean> => {
    const { orderId, productId, rating, comment, reviewerName, reviewerPhone, deliveryRating, tags } = params;

    const order = orders.find(o => o.id === orderId);
    if (!order) {
      showToast(language === 'en' ? 'Order record not found.' : 'የትዕዛዝ መረጃ አልተገኘም።', 'error');
      return false;
    }

    if (order.status !== 'DELIVERED') {
      showToast(
        language === 'en' 
          ? 'Reviews can only be submitted for completed orders in DELIVERED status.' 
          : 'ግምገማ መስጠት የሚቻለው የደረሱ ትዕዛዞች ላይ ብቻ ነው።', 
        'warning'
      );
      return false;
    }

    const cleanAuthor = (reviewerName || order.customerName || customerName || 'Verified Customer').trim();
    const cleanComment = comment.trim();

    if (!cleanComment) {
      showToast(language === 'en' ? 'Please provide feedback comments.' : 'እባክዎ አስተያየትዎን ይጻፉ።', 'warning');
      return false;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      rating,
      comment: cleanComment,
      reviewerName: cleanAuthor,
      reviewerPhone: reviewerPhone || order.customerPhone || customerPhone,
      orderId,
      productId,
      merchantId: order.items.find(i => i.product.id === productId)?.product.merchantId,
      deliveryRating: deliveryRating || rating,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      verifiedPurchase: true,
    };

    // Update Product Reviews state locally
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id === productId) {
          const currentReviews = p.reviews || [];
          const updatedReviews = [newReview, ...currentReviews];
          const newAvg = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
            return {
              ...p,
              reviews: updatedReviews,
              reviewsCount: (p.reviewsCount || currentReviews.length) + 1,
              rating: newAvg
            };
        }
        return p;
      });
    });

    // Mark Order as reviewed
    setOrders(prevOrders => {
      return prevOrders.map(o => {
        if (o.id === orderId) {
          const prevOrderReviews = o.orderReviews || [];
          return {
            ...o,
            reviewed: true,
            reviewedAt: new Date().toISOString(),
            orderReviews: [
              ...prevOrderReviews,
              { productId, rating, comment: cleanComment, createdAt: new Date().toISOString() }
            ]
          };
        }
        return o;
      });
    });

    // Persist to backend API
    try {
      await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: cleanComment,
          reviewerName: cleanAuthor,
          reviewerPhone: reviewerPhone || order.customerPhone,
          orderId
        })
      });
    } catch (err) {
      console.warn('Backend review persistence notice:', err);
    }

    showToast(
      language === 'en'
        ? `⭐ Thank you! Your verified ${rating}-star review has been published.`
        : `⭐ እናመሰግናለን! የእርስዎ ባለ ${rating}-ኮከብ ግምገማ ታትሟል።`,
      'success'
    );
    return true;
  }, [orders, customerName, customerPhone, language, showToast]);

  const getOrderWarranties = useCallback((order: Order): DigitalWarrantyPass[] => {
    if (order.warranties && order.warranties.length > 0) {
      return order.warranties;
    }
    return order.items.map(item => createDigitalWarrantyPass(order, item));
  }, []);

  const submitWarrantyClaim = useCallback(async (params: {
    orderId: string;
    warrantyId: string;
    productId: string;
    productName: string;
    serialNumber: string;
    customerName: string;
    customerPhone: string;
    issueType: WarrantyClaim['issueType'];
    description: string;
    serviceMethod: WarrantyClaim['serviceMethod'];
  }): Promise<WarrantyClaim> => {
    const claimId = `CLM-ET-${Date.now().toString().slice(-6)}`;
    const newClaim: WarrantyClaim = {
      id: claimId,
      warrantyId: params.warrantyId,
      orderId: params.orderId,
      productId: params.productId,
      productName: params.productName,
      serialNumber: params.serialNumber,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      issueType: params.issueType,
      description: params.description,
      serviceMethod: params.serviceMethod,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update local state orders
    setOrders(prev => prev.map(o => {
      if (o.id !== params.orderId) return o;
      const existingClaims = o.warrantyClaims || [];
      const updatedWarranties = (o.warranties || []).map(w => 
        w.id === params.warrantyId ? { ...w, status: 'CLAIM_PENDING' as const } : w
      );
      return {
        ...o,
        warranties: updatedWarranties,
        warrantyClaims: [newClaim, ...existingClaims]
      };
    }));

    // Post to backend API
    try {
      await fetch('/api/warranties/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim)
      });
    } catch (err) {
      console.warn('Backend warranty claim persistence notice:', err);
    }

    showToast(
      language === 'en'
        ? `🛡️ Warranty Claim #${claimId} submitted. Bole Hub team notified!`
        : `🛡️ የዋስትና ጥያቄ #${claimId} ተመዝግቧል። የቦሌ ማዕከል ቡድናችን ይደውላል!`,
      'success'
    );

    return newClaim;
  }, [language, showToast]);

  return (
    <ShopContext.Provider
      value={{
        products,
        categories: INITIAL_CATEGORIES,
        merchants,
        orders,
        auditLogs,
        alerts,
        isInitializing,
        refreshState,

        language,
        setLanguage,
        theme,
        setTheme,

        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,

        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,

        favorites,
        setFavorites,
        toggleFavorite,
        isWishlistOpen,
        setIsWishlistOpen,

        priceAlerts,
        setPriceAlerts,
        isPriceAlertsOpen,
        setIsPriceAlertsOpen,
        isQrScannerOpen,
        setIsQrScannerOpen,
        isProductTourOpen,
        setIsProductTourOpen,
        selectedProduct,
        setSelectedProduct,

        offlineOrders,
        setOfflineOrders,
        isOfflineSimulated,
        setIsOfflineSimulated,
        isSyncing,
        handleForceSync,

        comparedProductIds,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        openCompareWith,

        promoCodes,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        discountAmount,

        addOrder,
        updateProductStock,
        updateOrderStatus,
        updateCourierOrderStatus,

        toasts,
        showToast,

        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        customerEmail,
        setCustomerEmail,
        isCustomerLoggedIn,
        loginCustomer,
        logoutCustomer,
        addresses,
        addAddress,
        deleteAddress,

        approveProduct,
        rejectProduct,
        approveMerchantKyc,
        toggleMerchantStatus,
        approvePayout,

        addProductReview,
        submitWarrantyClaim,
        getOrderWarranties
      }}
    >
      {children}

      {/* Floating Global Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border flex items-center gap-2.5 transition-all transform animate-bounce-short ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : t.type === 'warning'
                ? 'bg-amber-500 text-black border-amber-400'
                : t.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-zinc-900 text-white border-zinc-700'
            }`}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

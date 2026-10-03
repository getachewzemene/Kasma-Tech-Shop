import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, Merchant, Order, StockMovementLog, AuditLog, TelegramAlert, CartItem, PriceAlert, PromoCode } from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS,
  INITIAL_MERCHANTS,
  INITIAL_STOCK_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TELEGRAM_ALERTS
} from './mockData';
import { CustomerWebSkeleton, MerchantPortalSkeleton, AdminDashboardSkeleton } from './components/Skeletons';
import { parseSharedCartUrl } from './utils/cartSharing';
import { generateWhatsAppCustomerWelcomeUrl } from './utils/whatsappNotifications';
import { sendTelegramShippingUpdate } from './utils/telegramBot';
import { initTelegramMiniApp, isTelegramMiniApp } from './utils/telegramWebApp';

import CustomerWeb from './components/CustomerWeb';
import MerchantPortal from './components/MerchantPortal';
import AdminDashboard from './components/AdminDashboard';
import SocialFooterSection from './components/SocialFooterSection';
import { MerchantTelegramQrLogin } from './components/merchant/MerchantTelegramQrLogin';
import ThemeToggle from './components/ThemeToggle';
import QrCodeScannerOverlay from './components/QrCodeScannerOverlay';
import ProductTour from './components/ProductTour';
import { saveCatalogToCache, getCatalogFromCache, CatalogCacheMeta } from './utils/offlineCatalogCache';
import { ShoppingBag, Store, Briefcase, ShieldAlert, Lock, CheckCircle, AlertCircle, ShoppingCart, Sun, Moon, Search, Heart, Wifi, WifiOff, RefreshCw, Database, Bell, TrendingUp, Clock, Mail, Phone, MapPin, ArrowRight, Globe, ShieldCheck, ChevronUp, FileText, HelpCircle, X, RotateCcw, FileCheck, Instagram, MessageCircle, Share2, ExternalLink, Menu, ChevronDown, Laptop, Gamepad2, Watch, Smartphone, Headphones, Camera, Cpu, Sparkles, Package, User, Truck, Mic, SlidersHorizontal, Award, QrCode, Send } from 'lucide-react';

export default function App() {
  // Primary unified states driven by the Node Express server (with graceful offline mock data fallback)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockLogs, setStockLogs] = useState<StockMovementLog[]>(INITIAL_STOCK_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [alerts, setAlerts] = useState<TelegramAlert[]>(INITIAL_TELEGRAM_ALERTS);
  const [isInitializing, setIsInitializing] = useState(true);

  // QR Code Scanner Overlay State
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // URL path-based routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Guided Product Tour Popover State
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);

  useEffect(() => {
    try {
      const tourCompleted = localStorage.getItem('kasma_tour_completed');
      if (!tourCompleted && currentPath === '/') {
        const timer = setTimeout(() => {
          setIsProductTourOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('LocalStorage tour check failed:', e);
    }
  }, [currentPath]);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    try {
      return sessionStorage.getItem('kasmashop_search_query') || '';
    } catch {
      return '';
    }
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('kasmashop_search_query', searchQuery);
    } catch (e) {
      console.error(e);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Telegram Mini App (TMA) auto-initialization
  useEffect(() => {
    const tma = initTelegramMiniApp();
    if (tma && tma.user) {
      console.log('✅ Launched inside Telegram Mini App as:', tma.user.first_name, tma.user.username);
      if (tma.colorScheme === 'dark') {
        setTheme('dark');
      }
    }
  }, []);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kasmashop_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const addToSearchHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(x => x.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Keep last 5
      localStorage.setItem('kasmashop_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromSearchHistory = (term: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(x => x !== term);
      localStorage.setItem('kasmashop_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('kasmashop_recent_searches');
  };

  // Comprehensive Sitemap & Policy Modal state (Privacy, Terms, Returns, FAQ, Escrow, Shipping)
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'terms' | 'refunds' | 'faq' | 'escrow' | 'shipping' | null>(null);

  // Global Toast Notification State & Helper
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight || !highlight.trim()) {
      return <span>{text}</span>;
    }
    try {
      const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${escapedHighlight})`, 'gi');
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, idx) => 
            regex.test(part) ? (
              <mark key={idx} className="bg-amber-100 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 px-0.5 rounded font-semibold transition-all">
                {part}
              </mark>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </>
      );
    } catch {
      return <span>{text}</span>;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDeptOpen, setIsMobileDeptOpen] = useState(true);

  // Price Alert monitoring states
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('kasma_price_alerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [isPriceAlertsOpen, setIsPriceAlertsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('kasma_price_alerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  // Admin Authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('kasma_admin_logged_in') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('kasma-admin');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  // Handle HTML5 pushState & popState for smooth routing
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = adminUsername.trim().toLowerCase();
    const cleanPasscode = adminPasscode.trim();

    const validUsernames = ['kasma-admin', 'kasma_admin', 'admin', 'admin@kasma.et', 'kasmaadmin'];
    const validPasscodes = ['kasma_admin123', 'kasma-admin123', 'admin123', 'kasma_admin', 'admin'];

    if (validUsernames.includes(cleanUsername) && validPasscodes.includes(cleanPasscode)) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('kasma_admin_logged_in', 'true');
      setAdminAuthError('');
      setAdminPasscode('');
    } else {
      setAdminAuthError(
        language === 'en' 
          ? 'Invalid administrator credentials. Name must be kasma-admin and password kasma_admin123.' 
          : 'የተሳሳተ የአስተዳዳሪ መለያ ስም ወይም ማለፊያ ቃል ገብቷል።'
      );
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('kasma_admin_logged_in');
  };

  // Merchant Authentication & Registration state
  const [isMerchantAuthenticated, setIsMerchantAuthenticated] = useState(() => {
    return sessionStorage.getItem('kasma_merchant_logged_in') === 'true';
  });
  const [merchantTabMode, setMerchantTabMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [merchantAuthMethod, setMerchantAuthMethod] = useState<'PASSWORD' | 'TELEGRAM_QR'>('PASSWORD');
  const [merchantLoginIdentifier, setMerchantLoginIdentifier] = useState('');
  const [merchantPasscode, setMerchantPasscode] = useState('');
  const [merchantAuthError, setMerchantAuthError] = useState('');
  const [merchantRegSuccess, setMerchantRegSuccess] = useState('');

  const handleTelegramQrLoginSuccess = (targetMerchant: Merchant) => {
    setIsMerchantAuthenticated(true);
    sessionStorage.setItem('kasma_merchant_logged_in', 'true');
    sessionStorage.setItem('kasma_merchant_id', targetMerchant.id);
    setMerchantAuthError('');
    setMerchantRegSuccess('');
    setMerchantPasscode('');
  };

  // Merchant Registration state
  const [regStoreName, setRegStoreName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regKycDoc, setRegKycDoc] = useState('');

  const handleMerchantRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStoreName.trim() || !regOwnerName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setMerchantAuthError(language === 'en' ? 'Please fill in all required registration fields.' : 'እባክዎ ሁሉንም አስፈላጊ መረጃዎች ይሙሉ');
      return;
    }

    const newMerchant: Merchant = {
      id: `m_${Date.now()}`,
      storeName: regStoreName.trim(),
      ownerName: regOwnerName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || '+251911000000',
      password: regPassword,
      status: 'PENDING_APPROVAL',
      kycStatus: 'PENDING_VERIFICATION',
      kycDocument: regKycDoc.trim() || `${regStoreName.trim().replace(/\s+/g, '_')}_License.pdf`,
      balance: 0,
      payouts: []
    };

    setMerchants(prev => [newMerchant, ...prev]);
    setMerchantLoginIdentifier(regEmail.trim());
    setMerchantAuthError('');
    setMerchantRegSuccess(
      language === 'en'
        ? `Registration submitted successfully for "${regStoreName}"! Account status: PENDING APPROVAL. Please ask Admin (kasma-admin) to verify and approve your store.`
        : `ምዝገባዎ ለ "${regStoreName}" በተሳካ ሁኔታ ተልኳል! መለያዎ ፍቃድ እየጠበቀ ነው። እባክዎ ከመግባትዎ በፊት አስተዳዳሪው (kasma-admin) እንዲያረጋግጥሎት ይጠይቁ።`
    );

    // Clear reg fields and switch to login tab
    setRegStoreName('');
    setRegOwnerName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegKycDoc('');
    setMerchantTabMode('LOGIN');
  };

  const handleMerchantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = merchantLoginIdentifier.trim().toLowerCase();

    if (!query) {
      setMerchantAuthError(
        language === 'en'
          ? 'Please enter your registered store email or store name.'
          : 'እባክዎ የተመዘገበ ኢሜይል ወይም የመደብር ስም ያስገቡ።'
      );
      return;
    }

    const targetMerchant = merchants.find(m => 
      m.email.toLowerCase() === query ||
      m.storeName.toLowerCase() === query ||
      m.ownerName.toLowerCase() === query ||
      (m.phone && m.phone.toLowerCase() === query)
    );

    if (!targetMerchant) {
      setMerchantAuthError(
        language === 'en' 
          ? 'No merchant account found matching that email or store name.' 
          : 'በዚያ ኢሜይል ወይም የመደብር ስም የተመዘገበ የነጋዴ መለያ አልተገኘም።'
      );
      return;
    }

    // Require registered password
    const expectedPassword = targetMerchant.password || 'merchant123';
    if (merchantPasscode !== expectedPassword) {
      setMerchantAuthError(
        language === 'en' 
          ? 'Invalid password for this merchant account.' 
          : 'ለዚህ የነጋዴ መለያ የተሳሳተ ማለፊያ ቃል ገብቷል።'
      );
      return;
    }

    // Block if status is PENDING_APPROVAL
    if (targetMerchant.status === 'PENDING_APPROVAL') {
      setMerchantAuthError(
        language === 'en'
          ? 'ACCOUNT PENDING VERIFICATION: Your merchant account has not been approved by Admin yet. Please ask Admin (kasma-admin) to verify your registration.'
          : 'መለያዎ ገና በአስተዳዳሪ አልተረጋገጠም፡ እባክዎ አስተዳዳሪው (kasma-admin) እንዲያረጋግጥሎት ይጠይቁ።'
      );
      return;
    }

    // Block if SUSPENDED
    if (targetMerchant.status === 'SUSPENDED') {
      setMerchantAuthError(
        language === 'en'
          ? 'ACCOUNT SUSPENDED: This merchant store is suspended. Please contact Admin.'
          : 'መለያዎ ታግዷል፡ እባክዎ የአስተዳዳሪውን ድጋፍ ያግኙ።'
      );
      return;
    }

    // Successful login
    setIsMerchantAuthenticated(true);
    sessionStorage.setItem('kasma_merchant_logged_in', 'true');
    sessionStorage.setItem('kasma_merchant_id', targetMerchant.id);
    setMerchantAuthError('');
    setMerchantRegSuccess('');
    setMerchantPasscode('');
  };

  const handleMerchantLogout = () => {
    setIsMerchantAuthenticated(false);
    sessionStorage.removeItem('kasma_merchant_logged_in');
    sessionStorage.removeItem('kasma_merchant_id');
  };

  // Offline orders queue state
  const [offlineOrders, setOfflineOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('kasma_offline_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Simulated offline toggle
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(() => {
    return localStorage.getItem('kasma_offline_mode') === 'true';
  });

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem('kasma_offline_orders', JSON.stringify(offlineOrders));
  }, [offlineOrders]);

  useEffect(() => {
    localStorage.setItem('kasma_offline_mode', isOfflineSimulated ? 'true' : 'false');
  }, [isOfflineSimulated]);

  // Shared customer shopping state & footer accordion control
  const [openFooterAccordion, setOpenFooterAccordion] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Auto-restore shared cart state from URL query parameter on load
  useEffect(() => {
    if (products && products.length > 0) {
      const restoredCart = parseSharedCartUrl(products);
      if (restoredCart && restoredCart.length > 0) {
        setCart(restoredCart);
        setIsCartOpen(true);
        try {
          const url = new URL(window.location.href);
          if (url.searchParams.has('sharedCart')) {
            url.searchParams.delete('sharedCart');
            window.history.replaceState({}, '', url.toString());
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [products]);

  // Promo codes state and handlers (LIFETIME SYNCHRONIZATION)
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('kasma_promo_codes');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [
      {
        code: 'KASMA10',
        type: 'PERCENTAGE',
        value: 10,
        descriptionEn: '10% OFF on all items!',
        descriptionAm: '10% ቅናሽ በሁሉም ዕቃዎች ላይ!'
      },
      {
        code: 'KASMA500',
        type: 'FLAT',
        value: 500,
        minSubtotal: 2000,
        descriptionEn: '500 ETB OFF on orders over 2,000 ETB',
        descriptionAm: 'ከ2,000 ብር በላይ ለሆኑ ትዕዛዞች 500 ብር ቅናሽ'
      },
      {
        code: 'ADDISFREE',
        type: 'FREE_SHIPPING',
        value: 150,
        minSubtotal: 500,
        descriptionEn: 'Free shipping on orders over 500 ETB',
        descriptionAm: 'ከ500 ብር በላይ ለሆኑ ትዕዛዞች ነፃ ማጓጓዣ'
      },
      {
        code: 'WELCOME5',
        type: 'PERCENTAGE',
        value: 5,
        descriptionEn: '5% OFF welcome discount',
        descriptionAm: '5% የደስታ መግቢያ ቅናሽ'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('kasma_promo_codes', JSON.stringify(promoCodes));
  }, [promoCodes]);

  const handleAddPromoCode = (promo: PromoCode) => {
    setPromoCodes(prev => [...prev, promo]);
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      actor: 'Admin Console',
      action: 'PROMO_CREATE',
      details: `Created new promo code: "${promo.code}" (${promo.type} - Value: ${promo.value})`,
      severity: 'INFO',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleRemovePromoCode = (code: string) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code));
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      actor: 'Admin Console',
      action: 'PROMO_DELETE',
      details: `Revoked promo code: "${code}"`,
      severity: 'WARNING',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Offline Catalog Metadata State (IndexedDB)
  const [offlineCatalogMeta, setOfflineCatalogMeta] = useState<CatalogCacheMeta | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchAllData();
      showToast(
        language === 'en' 
          ? '🌐 Internet connection restored! Auto-syncing queued offline orders...' 
          : '🌐 ኢንተርኔት ተመልሷል! የተቀመጡ ትዕዛዞች በራስ-ሰር በመላክ ላይ...',
        'info'
      );
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast(
        language === 'en' 
          ? '📡 Browser offline. Orders will be queued locally.' 
          : '📡 ኢንተርኔት ተቋርጧል። ትዕዛዞች በካሽ ውስጥ ይቀመጣሉ።',
        'warning'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language]);

  // Consolidated server-state polling mechanism with IndexedDB catalog persistence
  const fetchAllData = async () => {
    // If simulated offline mode is ON, load directly from IndexedDB catalog cache
    if (isOfflineSimulated) {
      try {
        const { products: cachedProds, meta } = await getCatalogFromCache();
        if (cachedProds && cachedProds.length > 0) {
          setProducts(cachedProds);
          setOfflineCatalogMeta(meta);
        }
      } catch (e) {
        console.warn('Failed to load catalog from IndexedDB offline store:', e);
      } finally {
        setIsInitializing(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          // Persist product catalog into IndexedDB & Cache API for offline readiness
          saveCatalogToCache(data.products);
        }
        setMerchants(data.merchants || []);
        setOrders(data.orders || []);
        setStockLogs(data.stockLogs || []);
        setAuditLogs(data.auditLogs || []);
        setAlerts(data.alerts || []);
      } else {
        console.warn("Backend state returned unsuccessful status, utilizing resilient offline client-side state.");
        const { products: cachedProds, meta } = await getCatalogFromCache();
        if (cachedProds && cachedProds.length > 0) {
          setProducts(cachedProds);
          setOfflineCatalogMeta(meta);
        }
      }
    } catch (err) {
      // Offline fallback to IndexedDB catalog cache
      try {
        const { products: cachedProds, meta } = await getCatalogFromCache();
        if (cachedProds && cachedProds.length > 0) {
          setProducts(cachedProds);
          setOfflineCatalogMeta(meta);
        }
      } catch {
        // preserve existing products
      }
      console.warn("Express server is starting or offline; seamlessly using offline-first state engine.", err);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll state every 3 seconds to keep all portals fully synchronized
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, []);

  // REST API Handlers representing the service layer proxy
  const handleUpdateProductStock = async (productId: string, sku: string, qtyChange: number, reason: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sku, 
          change: qtyChange, 
          reason, 
          actor: reason.includes('Manual') ? 'Merchant Action' : 'System Automation' 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Stock adjustment RPC failed:", err);
    }
  };

  const handleBulkUpdateProductStock = async (adjustments: { productId: string; sku: string; qtyChange: number; reason: string }[]) => {
    try {
      const res = await fetch('/api/products/bulk-stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustments: adjustments.map(adj => ({
            productId: adj.productId,
            sku: adj.sku,
            change: adj.qtyChange,
            reason: adj.reason,
            actor: 'Merchant Bulk Action'
          }))
        })
      });
      if (res.ok) {
        await fetchAllData();
        return { success: true };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Failed to update stock.' };
      }
    } catch (err) {
      console.error("Bulk stock adjustment RPC failed:", err);
      return { success: false, error: 'Network error or server offline.' };
    }
  };

  const handleUpdateProductThreshold = async (productId: string, threshold: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/threshold`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          threshold, 
          actor: 'Merchant Action' 
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Stock threshold adjustment RPC failed:", err);
    }
  };

  const handleAddOrder = async (order: Order) => {
    if (isOfflineSimulated) {
      setOfflineOrders(prev => [...prev, order]);
      addAuditLog('Offline Client', 'Queue Order', `Order #${order.id} queued offline due to simulated offline mode.`, 'WARNING');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        setOfflineOrders(prev => [...prev, order]);
        addAuditLog('Offline Client', 'Queue Order Fallback', `Server returned error, cached Order #${order.id} offline.`, 'WARNING');
      }
    } catch (err) {
      console.error("Order transaction settlement failed, auto-queuing offline:", err);
      setOfflineOrders(prev => [...prev, order]);
      addAuditLog('Offline Client', 'Queue Order Fallback', `Server unreachable, cached Order #${order.id} offline.`, 'WARNING');
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    const matched = orders.find(o => o.id === orderId);
    sendTelegramShippingUpdate(
      orderId, 
      status, 
      matched?.customerName || 'Valued Customer', 
      matched?.shippingAddress || 'Addis Ababa', 
      language
    ).catch(err => {
      console.warn("Telegram status update alert failed:", err);
    });
    addAuditLog('Admin Dispatcher', 'Update Order Status', `Order #${orderId} status changed to ${status} with Telegram notification.`, 'INFO');
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Catalog addition failed:", err);
    }
  };

  const handleBulkUpdateProducts = async (updates: {
    productId: string;
    status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
    priceChangePct?: number;
    flatPrice?: number;
    lowStockThreshold?: number;
    category?: string;
    featured?: boolean;
  }[]) => {
    try {
      const res = await fetch('/api/products/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, actor: 'Merchant Catalog Bulk Action' })
      });
      if (res.ok) {
        await fetchAllData();
        return { success: true };
      } else {
        const data = await res.json();
        // Fallback update in local state if server returned error
        setProducts(prev => prev.map(p => {
          const match = updates.find(u => u.productId === p.id);
          if (!match) return p;
          let newPrice = p.price;
          if (match.priceChangePct !== undefined) {
            newPrice = Math.max(1, Math.round(p.price * (1 + match.priceChangePct / 100)));
          } else if (match.flatPrice !== undefined && match.flatPrice > 0) {
            newPrice = Math.round(match.flatPrice);
          }
          return {
            ...p,
            status: match.status !== undefined ? match.status : p.status,
            price: newPrice,
            lowStockThreshold: match.lowStockThreshold !== undefined ? match.lowStockThreshold : p.lowStockThreshold,
            category: match.category !== undefined ? match.category : p.category,
            featured: match.featured !== undefined ? match.featured : p.featured,
          };
        }));
        return { success: true };
      }
    } catch (err: any) {
      console.error("Bulk update products failed:", err);
      // Local state fallback update
      setProducts(prev => prev.map(p => {
        const match = updates.find(u => u.productId === p.id);
        if (!match) return p;
        let newPrice = p.price;
        if (match.priceChangePct !== undefined) {
          newPrice = Math.max(1, Math.round(p.price * (1 + match.priceChangePct / 100)));
        } else if (match.flatPrice !== undefined && match.flatPrice > 0) {
          newPrice = Math.round(match.flatPrice);
        }
        return {
          ...p,
          status: match.status !== undefined ? match.status : p.status,
          price: newPrice,
          lowStockThreshold: match.lowStockThreshold !== undefined ? match.lowStockThreshold : p.lowStockThreshold,
          category: match.category !== undefined ? match.category : p.category,
          featured: match.featured !== undefined ? match.featured : p.featured,
        };
      }));
      return { success: true };
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/approve`, { method: 'PUT' });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Catalog approval failed:", err);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/reject`, { method: 'PUT' });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Catalog rejection failed:", err);
    }
  };

  const handleApproveMerchantKyc = async (merchantId: string) => {
    // Update local state immediately so pending merchant becomes approved & active
    setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, kycStatus: 'APPROVED', status: 'ACTIVE' } : m));
    try {
      const res = await fetch(`/api/merchants/${merchantId}/kyc/approve`, { method: 'PUT' });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("KYC verification approval failed:", err);
    }
  };

  const handleToggleMerchantStatus = async (merchantId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, status } : m));
    try {
      const res = await fetch(`/api/merchants/${merchantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Merchant status toggle failed:", err);
    }
  };

  const handleRequestPayout = async (merchantId: string, amount: number, bank: string, accountNumber: string) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, bank, account: accountNumber })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Payout settlement queue failed:", err);
    }
  };

  const handleUpdateMerchantKyc = async (
    merchantId: string, 
    status: 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'APPROVED', 
    docName?: string
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/kyc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docUrl: docName || 'Commercial_Registry_License_Kasma.pdf' })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("KYC upload transaction failed:", err);
    }
  };

  const handleApprovePayout = async (merchantId: string, payoutId: string) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/payout/${payoutId}/approve`, { method: 'PUT' });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error("Payout bank wire authorization failed:", err);
    }
  };

  const handleSyncOfflineOrders = async (queuedOrders: Order[]) => {
    try {
      const res = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queuedOrders })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchAllData();
        return { syncedCount: data.syncedCount, errors: data.errors };
      }
      throw new Error("HTTP sync protocol failed.");
    } catch (err: any) {
      console.error("WatermelonDB sync conflict:", err);
      return { syncedCount: 0, errors: [err?.message || "Sync connection failed."] };
    }
  };

  // Core unified background & manual order queue sync executor
  const executeOrderSync = useCallback(async (isAutomatic = false) => {
    if (isSyncing) return;

    let currentQueued = offlineOrders;
    if (!currentQueued || currentQueued.length === 0) {
      try {
        const saved = localStorage.getItem('kasma_offline_orders');
        if (saved) currentQueued = JSON.parse(saved);
      } catch {
        // ignore
      }
    }

    if (!currentQueued || currentQueued.length === 0) {
      if (!isAutomatic) {
        await fetchAllData();
        addAuditLog('System Sync', 'Manual Data Refresh', 'Refreshed and synchronized database state with server.', 'INFO');
        showToast(
          language === 'en' ? 'Data synchronized with server!' : 'ዳታው ከአገልጋዩ ጋር ተመሳስሏል!',
          'success'
        );
      }
      return;
    }

    setIsSyncing(true);

    if (isAutomatic) {
      showToast(
        language === 'en'
          ? `🌐 Background Sync: Re-uploading ${currentQueued.length} offline queued order(s)...`
          : `🌐 ባክግራውንድ ሲንክ፡ ${currentQueued.length} የተቀመጡ ትዕዛዞችን በራስ-ሰር በመላክ ላይ...`,
        'info'
      );
    }

    try {
      const res = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queuedOrders: currentQueued })
      });

      if (res.ok) {
        const data = await res.json();
        const count = data.syncedCount || currentQueued.length;

        setOfflineOrders([]);
        localStorage.removeItem('kasma_offline_orders');
        await fetchAllData();

        addAuditLog(
          'Background Sync Engine',
          isAutomatic ? 'Auto Re-Upload On Reconnect' : 'Manual Force Sync',
          `Successfully synchronized ${count} queued offline order(s) to the backend database.`,
          'INFO'
        );

        showToast(
          language === 'en'
            ? `✅ Background Sync Complete! ${count} offline order(s) uploaded to server.`
            : `✅ ባክግራውንድ ሲንክ ተጠናቋል! ${count} የተቀመጡ ትዕዛዞች በተሳካ ሁኔታ ተልከዋል።`,
          'success'
        );
      } else {
        throw new Error("HTTP sync protocol failed.");
      }
    } catch (err: any) {
      console.error("Background sync error:", err);
      addAuditLog('System Offline Cache', 'Sync Failed', `Sync failed: ${err?.message || 'Connection failure.'}`, 'CRITICAL');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, offlineOrders, language]);

  const handleForceSync = async () => {
    await executeOrderSync(false);
  };

  // Connection State Transition Trigger: Auto-upload when changing from Offline -> Online
  const wasConnectedRef = useRef<boolean>(navigator.onLine && !isOfflineSimulated);

  useEffect(() => {
    const isConnectedNow = isOnline && !isOfflineSimulated;
    const wasOffline = !wasConnectedRef.current;

    if (wasOffline && isConnectedNow && offlineOrders.length > 0 && !isSyncing) {
      console.log(`[Background Sync] Offline -> Online transition detected! Re-uploading ${offlineOrders.length} orders...`);
      executeOrderSync(true);
    }

    wasConnectedRef.current = isConnectedNow;
  }, [isOnline, isOfflineSimulated, offlineOrders.length, isSyncing, executeOrderSync]);

  // Periodic Background Auto-Retry Timer for unsynced queued orders when connected
  useEffect(() => {
    if (!isOnline || isOfflineSimulated || offlineOrders.length === 0 || isSyncing) {
      return;
    }

    const interval = setInterval(() => {
      console.log('[Background Sync] Periodic background sync check running...');
      executeOrderSync(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [isOnline, isOfflineSimulated, offlineOrders.length, isSyncing, executeOrderSync]);

  // Service Worker Background Sync Registration (if browser supports SyncManager)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window && offlineOrders.length > 0) {
      navigator.serviceWorker.ready.then((reg: any) => {
        if (reg && reg.sync) {
          reg.sync.register('sync-queued-orders').catch((err: any) => {
            console.log('[ServiceWorker Sync] Background Sync registration fallback:', err);
          });
        }
      }).catch(() => {});
    }
  }, [offlineOrders.length]);

  // Backwards-compatible local log overrides for client-driven simulations
  const addAuditLog = (actor: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    const newLog: AuditLog = {
      id: `al-client-${Date.now()}`,
      actor,
      action,
      details,
      severity,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addTelegramAlert = (alert: TelegramAlert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const autocompleteSuggestions = searchQuery.trim() !== ''
    ? products
        .filter(p => p.status === 'APPROVED')
        .filter(p => {
          const query = searchQuery.toLowerCase().trim();
          const name = language === 'en' ? p.nameEn.toLowerCase() : p.nameAm.toLowerCase();
          const desc = language === 'en' ? p.descriptionEn.toLowerCase() : p.descriptionAm.toLowerCase();
          const brand = p.brand.toLowerCase();
          const cat = p.category.toLowerCase();
          return name.includes(query) || desc.includes(query) || brand.includes(query) || cat.includes(query);
        })
        .slice(0, 6)
    : [];

  // Lock html & body scroll when mobile navigation drawer or modal overlay is open to prevent background scrolling
  useEffect(() => {
    if (isMobileMenuOpen || activePolicyModal || isQrScannerOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, activePolicyModal, isQrScannerOpen]);

  const isDev = (import.meta as any).env?.DEV || (import.meta as any).env?.MODE === 'development';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 w-full max-w-full ${
      theme === 'dark' ? 'dark bg-[#08090B] text-zinc-100' : 'bg-[#EFF1F5] text-[#111827]'
    }`}>
      
      {/* Multi-Portal Header Bar */}
      {/* Unified Premium Header - Only displayed in Storefront */}
      {currentPath === '/' && (
        <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-gray-900 dark:text-zinc-100 border-b border-gray-150 dark:border-zinc-800 sticky top-0 z-50 px-3.5 sm:px-4 md:px-8 py-2 sm:py-3 shrink-0 shadow-md">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          
          {/* Top Row on Mobile (< md) / Left Section on Desktop (Logo + Mobile Actions) */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
            {/* Logo & Brand Identity */}
            <div className="flex items-center gap-2 cursor-pointer select-none group" onClick={() => navigateTo('/')}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black rounded-xl flex items-center justify-center font-black text-base sm:text-lg tracking-tight shadow-md border border-zinc-800/80 transition-transform group-hover:scale-105 duration-200">
                <span className="text-kasma-blue">K</span>
                <span className="text-kasma-gold -ml-0.5">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-widest text-gray-950 dark:text-white leading-none font-sans uppercase">
                  Kasma <span className="text-kasma-gold font-bold">Shop</span>
                </span>
                <span className="hidden sm:block text-[7px] sm:text-[8px] text-gray-400 dark:text-zinc-500 tracking-wider font-extrabold uppercase leading-none mt-0.5 sm:mt-1">
                  {language === 'en' ? 'Premium Marketplace' : 'ፕሪሚየም የገበያ ቦታ'}
                </span>
              </div>
            </div>

            {/* Mobile Action Icons (Visible on Mobile & Tablet < md) */}
            <div className="flex md:hidden items-center gap-1 sm:gap-1.5">
              
              {/* Cart Button */}
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  if (currentPath !== '/') navigateTo('/');
                }}
                className="relative p-1.5 text-gray-600 hover:text-gray-950 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title={language === 'en' ? 'Shopping Cart' : 'የገበያ ጋሪ'}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {cart.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-kasma-blue text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => {
                  setIsWishlistOpen(true);
                  if (currentPath !== '/') navigateTo('/');
                }}
                className="relative p-1.5 text-gray-600 hover:text-gray-950 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title={language === 'en' ? 'Wishlist' : 'ምኞት ዝርዝር'}
              >
                <Heart className="w-4.5 h-4.5 text-rose-500" />
                {favorites.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Price Alerts / Notification Button */}
              <button
                onClick={() => {
                  setIsPriceAlertsOpen(true);
                  if (currentPath !== '/') navigateTo('/');
                }}
                className="relative p-1.5 text-gray-600 hover:text-gray-950 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title={language === 'en' ? 'Notifications & Price Alerts' : 'የዋጋ ማንቂያዎች'}
              >
                <Bell className="w-4.5 h-4.5 text-amber-500" />
                {priceAlerts.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-amber-500 text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                    {priceAlerts.length}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 text-gray-700 hover:text-gray-950 dark:text-zinc-200 dark:hover:text-white rounded-lg bg-gray-100 dark:bg-zinc-800 transition-all cursor-pointer border border-gray-200 dark:border-zinc-700 shrink-0 ml-1"
                title={language === 'en' ? 'Open Navigation Menu' : 'የአሰሳ ማውጫ ክፈት'}
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Global Search Field in the middle of Header */}
          <div ref={searchContainerRef} className="w-full md:flex-grow md:max-w-lg relative mx-0 md:mx-4">
            <div className="relative flex items-center">
              <input
                id="mobile-search-input"
                type="text"
                placeholder={language === 'en' ? 'Search smartphones, Arctis, PS5...' : 'ምርቶችን፣ ስልኮችን፣ ማዳመጫዎችን ይፈልጉ...'}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addToSearchHistory(searchQuery);
                    setIsSearchFocused(false);
                    if (currentPath !== '/') navigateTo('/');
                    if (autocompleteSuggestions.length === 1) {
                      setSelectedProduct(autocompleteSuggestions[0]);
                    }
                    setTimeout(() => {
                      const el = document.getElementById('products-grid-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentPath !== '/') {
                    navigateTo('/');
                  }
                }}
                className="w-full pl-8 sm:pl-9 pr-14 sm:pr-28 py-2 sm:py-2.5 rounded-2xl border border-gray-200/90 dark:border-zinc-700/80 bg-gray-50 dark:bg-zinc-800/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/30 focus:border-[#0052FF] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-zinc-100 transition-all shadow-2xs"
              />
              <Search className="absolute left-2.5 sm:left-3 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
              
              {/* Right Action Icons: Clear, QR Tag Scanner, Camera Search (Desktop/Tablet), Voice Mic Search (Desktop/Tablet) */}
              <div className="absolute right-2.5 flex items-center gap-1 text-gray-400">
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-950 dark:hover:text-white text-xs font-bold rounded-lg cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                ) : null}

                {/* QR Code Scanner Overlay Button */}
                <button
                  id="tour-qr-scanner"
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="p-1.5 bg-[#0052FF]/10 dark:bg-blue-500/20 text-[#0052FF] dark:text-blue-400 hover:bg-[#0052FF] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center"
                  title={language === 'en' ? 'Scan Product QR Tag' : 'የምርት QR ኮድ ያንብቡ'}
                >
                  <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Camera / Visual Image Search Button (Tablet/Desktop) */}
                <button
                  type="button"
                  onClick={() => {
                    const sampleQuery = 'Galaxy S24';
                    setSearchQuery(sampleQuery);
                    addToSearchHistory(sampleQuery);
                    showToast(
                      language === 'en' ? '📷 Image Search activated: Matches for "Galaxy S24"' : '📷 የምስል ፍለጋ ተከናውኗል!',
                      'info'
                    );
                  }}
                  className="hidden sm:inline-flex p-1.5 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 text-gray-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                  title={language === 'en' ? 'Search by Image / Camera' : 'በምስል ይፈልጉ'}
                >
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Voice Search Mic Button (Tablet/Desktop) */}
                <button
                  type="button"
                  onClick={() => {
                    const sampleQuery = 'Arctis Nova';
                    setSearchQuery(sampleQuery);
                    addToSearchHistory(sampleQuery);
                    showToast(
                      language === 'en' ? '🎙️ Listening... Recognized "Arctis Nova"' : '🎙️ ድምፅ ተሰምቷል፡ "Arctis Nova"',
                      'info'
                    );
                  }}
                  className="hidden sm:inline-flex p-1.5 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 text-gray-500 hover:text-[#0052FF] dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                  title={language === 'en' ? 'Search by Voice' : 'በድምፅ ይፈልጉ'}
                >
                  <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Enhanced Dropdown of 'Trending Searches' and 'Recent Search History' */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden py-4 transition-all animate-in fade-in duration-100">
                {searchQuery.trim() !== '' ? (
                  <div>
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100 dark:border-zinc-800/60 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-bold font-sans">
                        {language === 'en' ? 'Product Suggestions' : 'የሚመከሩ ምርቶች'}
                      </span>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded-full font-mono">
                        {autocompleteSuggestions.length} {language === 'en' ? 'found' : 'ተገኝቷል'}
                      </span>
                    </div>

                    {autocompleteSuggestions.length > 0 ? (
                      <div className="space-y-1 px-2 max-h-[320px] overflow-y-auto">
                        {autocompleteSuggestions.map((p) => {
                          const name = language === 'en' ? p.nameEn : p.nameAm;
                          return (
                            <div 
                              key={p.id}
                              onClick={() => {
                                setSearchQuery(name);
                                addToSearchHistory(name);
                                setIsSearchFocused(false);
                                setSelectedProduct(p);
                                if (currentPath !== '/') navigateTo('/');
                                setTimeout(() => {
                                  const el = document.getElementById('products-grid-section');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/60 cursor-pointer group transition-colors border border-transparent hover:border-gray-150/40 dark:hover:border-zinc-800"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 flex items-center justify-center shrink-0">
                                  <img src={p.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="text-left">
                                  <h5 className="text-xs font-bold text-gray-800 dark:text-zinc-200 group-hover:text-gray-950 dark:group-hover:text-white transition-colors line-clamp-1">
                                    {highlightText(name, searchQuery)}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                                      {p.brand}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
                                    <span className="text-[9px] font-semibold text-gray-400 dark:text-zinc-500 capitalize">
                                      {p.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-4">
                                <span className="text-xs font-bold text-gray-950 dark:text-white font-mono">
                                  {p.price.toLocaleString()} ETB
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-xs text-gray-400 dark:text-zinc-500 italic font-sans">
                          {language === 'en' 
                            ? `No products found matching "${searchQuery}"` 
                            : `ከ"${searchQuery}" ጋር የሚዛመድ ምርት አልተገኘም`}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Recent Searches Section */}
                    {recentSearches.length > 0 ? (
                      <div className="mb-4">
                        <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100 dark:border-zinc-800/60 mb-2">
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-bold font-sans">
                            {language === 'en' ? 'Recent Searches' : 'የቅርብ ጊዜ ፍለጋዎች'}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSearchHistory();
                            }}
                            className="text-[10px] text-gray-400 dark:text-zinc-500 hover:text-red-500 font-black tracking-wider uppercase cursor-pointer"
                          >
                            {language === 'en' ? 'Clear All' : 'ሁሉንም አጽዳ'}
                          </button>
                        </div>
                        <div className="space-y-1 px-2">
                          {recentSearches.map((term) => (
                            <div 
                              key={term}
                              onClick={() => {
                                setSearchQuery(term);
                                addToSearchHistory(term);
                                setIsSearchFocused(false);
                                if (currentPath !== '/') navigateTo('/');
                                const matched = products.find(p => p.status === 'APPROVED' && ((language === 'en' ? p.nameEn : p.nameAm).toLowerCase().includes(term.toLowerCase()) || p.brand.toLowerCase().includes(term.toLowerCase())));
                                if (matched) {
                                  setSelectedProduct(matched);
                                }
                                setTimeout(() => {
                                  const el = document.getElementById('products-grid-section');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/60 cursor-pointer group transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-gray-400 group-hover:text-kasma-blue transition-colors" />
                                <span className="text-xs text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white font-sans">
                                  {term}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromSearchHistory(term);
                                }}
                                className="text-gray-300 hover:text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                title={language === 'en' ? 'Delete' : 'አጥፋ'}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 px-4 py-1">
                        <p className="text-[11px] text-gray-400 dark:text-zinc-500 italic font-sans">
                          {language === 'en' ? 'No recent searches' : 'ምንም የቅርብ ጊዜ ፍለጋዎች የሉም'}
                        </p>
                      </div>
                    )}

                    {/* Trending Searches Section */}
                    <div>
                      <div className="px-4 pb-2 border-b border-gray-100 dark:border-zinc-800/60 mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-bold font-sans">
                          {language === 'en' ? 'Trending Searches' : 'ታዋቂ ፍለጋዎች'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 px-3">
                        {[
                          { en: 'Bose', am: 'ቦስ' },
                          { en: 'Galaxy S24', am: 'ሳምሰንግ' },
                          { en: 'Wireless', am: 'ገመድ አልባ' },
                          { en: 'Headset', am: 'ማዳመጫ' },
                          { en: 'Camera', am: 'ካሜራ' },
                          { en: 'Titanium', am: 'ቲታኒየም' }
                        ].map((trend) => {
                          const trendText = language === 'en' ? trend.en : trend.am;
                          return (
                            <button
                              key={trend.en}
                              onClick={() => {
                                setSearchQuery(trendText);
                                addToSearchHistory(trendText);
                                setIsSearchFocused(false);
                                if (currentPath !== '/') navigateTo('/');
                              }}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 dark:border-zinc-800/60 hover:border-kasma-blue/40 hover:bg-indigo-50/25 dark:hover:bg-indigo-950/10 text-left cursor-pointer transition-all duration-200 group"
                            >
                              <TrendingUp className="w-3 h-3 text-amber-500 group-hover:scale-110 transition-transform" />
                              <span className="text-xs text-gray-700 dark:text-zinc-300 group-hover:text-gray-950 dark:group-hover:text-white font-medium font-sans">
                                {trendText}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Desktop Actions on right side (Hidden on < md) */}
          <div className="hidden md:flex items-center gap-3.5 shrink-0">
            
            {/* Cart, Theme toggle, Language Switch */}
            <div className="flex items-center gap-2">
              
              {/* Cart Button with badge */}
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  if (currentPath !== '/') {
                    navigateTo('/');
                  }
                }}
                className="relative p-2 text-gray-500 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title={language === 'en' ? 'Shopping Cart' : 'የገበያ ጋሪ'}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 bg-kasma-blue text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Wishlist Button with badge */}
              <button
                onClick={() => {
                  setIsWishlistOpen(true);
                  if (currentPath !== '/') {
                    navigateTo('/');
                  }
                }}
                className="relative p-2 text-gray-500 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title={language === 'en' ? 'Wishlist' : 'ምኞት ዝርዝር'}
              >
                <Heart className="w-4.5 h-4.5" />
                {favorites.length > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Price Alerts Button with badge */}
              <button
                onClick={() => {
                  setIsPriceAlertsOpen(true);
                  if (currentPath !== '/') {
                    navigateTo('/');
                  }
                }}
                className="relative p-2 text-gray-500 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title={language === 'en' ? 'Price Alerts' : 'የዋጋ ማንቂያዎች'}
              >
                <Bell className="w-4.5 h-4.5" />
                {priceAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
                    {priceAlerts.length}
                  </span>
                )}
              </button>

              {/* Theme Toggle Switch */}
              <ThemeToggle 
                theme={theme} 
                onToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
                language={language}
                size="md"
              />

              {/* Language Switch */}
              <div className="flex bg-gray-50 dark:bg-zinc-800 p-0.5 rounded-lg border border-gray-150 dark:border-zinc-700 shrink-0">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                    language === 'en' ? 'bg-white dark:bg-zinc-700 text-gray-950 dark:text-zinc-100 shadow-xs' : 'text-gray-400 hover:text-gray-950 dark:hover:text-zinc-100'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                    language === 'am' ? 'bg-white dark:bg-zinc-700 text-gray-950 dark:text-zinc-100 shadow-xs' : 'text-gray-400 hover:text-gray-950 dark:hover:text-zinc-100'
                  }`}
                >
                  አማ
                </button>
              </div>

              {/* Visual Sync Status Indicator & Manual Refresh Button */}
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800/90 p-1 rounded-2xl border border-gray-200/80 dark:border-zinc-700/80 shadow-2xs ml-1 shrink-0">
                {/* Sync Status Badge Toggle */}
                <button
                  type="button"
                  onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isOfflineSimulated
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/80'
                  }`}
                  title={
                    isOfflineSimulated
                      ? (language === 'en' ? 'Offline Mode Active. Click to reconnect' : 'ከመስመር ውጭ። መስመር ላይ ለመቀየር ይጫኑ')
                      : (language === 'en' ? 'Connected to Server. Click to simulate Offline mode' : 'ተገናኝቷል። ከመስመር ውጭ ለማድረግ ይጫኑ')
                  }
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOfflineSimulated ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isOfflineSimulated ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </span>
                  {isOfflineSimulated ? (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{language === 'en' ? 'Offline' : 'ከመስመር ውጭ'}</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'en' ? 'Connected' : 'የተገናኘ'}</span>
                    </>
                  )}
                </button>

                {/* Manual 'Sync Data' Button */}
                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    offlineOrders.length > 0
                      ? 'bg-[#0052FF] hover:bg-blue-600 text-white shadow-xs animate-pulse'
                      : 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-650 border border-gray-200 dark:border-zinc-600'
                  }`}
                  title={language === 'en' ? 'Push queued orders and sync with server' : 'የተቀመጡ ትዕዛዞችን ላክ እና ዳታ አድስ'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#0052FF]' : ''}`} />
                  <span>{language === 'en' ? 'Sync Data' : 'ዳታ አመሳስል'}</span>
                  {offlineOrders.length > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono">
                      {offlineOrders.length}
                    </span>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

      </header>
      )}

      {/* Mobile Hamburger Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Overlay Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Content Container */}
          <div className="relative w-[85%] max-w-xs bg-white dark:bg-zinc-900 h-full max-h-[100dvh] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-gray-150 dark:border-zinc-800">
            
            {/* Drawer Header */}
            <div className="shrink-0 p-4 bg-gray-50 dark:bg-zinc-950/80 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm border border-zinc-800">
                  <span className="text-kasma-blue">K</span>
                  <span className="text-kasma-gold -ml-0.5">S</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-zinc-100 uppercase tracking-wide">
                    Kasma Shop
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold">
                    {language === 'en' ? 'Navigation Menu' : 'የአሰሳ ማውጫ'}
                  </p>
                </div>
              </div>

              {/* Prominent Top Language Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-200/80 dark:bg-zinc-800 p-0.5 rounded-lg border border-gray-200 dark:border-zinc-700">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-[#0052FF] text-white shadow-2xs'
                        : 'text-gray-600 dark:text-zinc-400 hover:text-gray-950 dark:hover:text-zinc-100'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('am')}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                      language === 'am'
                        ? 'bg-[#0052FF] text-white shadow-2xs'
                        : 'text-gray-600 dark:text-zinc-400 hover:text-gray-950 dark:hover:text-zinc-100'
                    }`}
                  >
                    አማ
                  </button>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body - Single Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Customer Activity & Personal Hub */}
              <div className="space-y-1.5">
                <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2">
                  {language === 'en' ? 'My Customer Hub' : 'የእኔ ገበያ ማዕከል'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {/* Wishlist Button */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsWishlistOpen(true);
                      if (currentPath !== '/') navigateTo('/');
                    }}
                    className="p-3 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex flex-col items-start gap-1 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20 group-hover:scale-110 transition-transform" />
                      {favorites.length > 0 && (
                        <span className="bg-rose-500 text-white font-mono font-black text-[9px] px-1.5 py-0.2 rounded-full">
                          {favorites.length}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-rose-950 dark:text-rose-200">
                      {language === 'en' ? 'My Wishlist' : 'ምኞት ዝርዝር'}
                    </span>
                  </button>

                  {/* Price Alerts / Notifications Button */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsPriceAlertsOpen(true);
                      if (currentPath !== '/') navigateTo('/');
                    }}
                    className="p-3 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex flex-col items-start gap-1 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                      {priceAlerts.length > 0 && (
                        <span className="bg-amber-500 text-white font-mono font-black text-[9px] px-1.5 py-0.2 rounded-full">
                          {priceAlerts.length}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      {language === 'en' ? 'Price Alerts' : 'የዋጋ ማንቂያዎች'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Track Shipment */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActivePolicyModal('shipping');
                    }}
                    className="p-3 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 rounded-2xl flex flex-col items-start gap-1 transition-all cursor-pointer text-left group"
                  >
                    <Truck className="w-4 h-4 text-[#0052FF] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-gray-900 dark:text-zinc-200">
                      {language === 'en' ? 'Track & Delivery' : 'የማድረሻ መመሪያዎች'}
                    </span>
                  </button>

                  {/* WhatsApp Support Chat */}
                  <a
                    href={generateWhatsAppCustomerWelcomeUrl(cart, language)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex flex-col items-start gap-1 transition-all cursor-pointer text-left group"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      {language === 'en' ? 'WhatsApp Help' : 'የዋትስአፕ እርዳታ'}
                    </span>
                  </a>
                </div>
              </div>

              {/* Shop By Category Accordion */}
              <div className="space-y-2 border-t border-gray-150 dark:border-zinc-800 pt-4">
                <button
                  onClick={() => setIsMobileDeptOpen(!isMobileDeptOpen)}
                  className="w-full px-3.5 py-2.5 bg-[#0052FF] hover:bg-[#003ecf] text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-between transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Menu className="w-4 h-4" />
                    <span>{language === 'en' ? 'Shop By Category' : 'በምድብ ይገብዩ'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMobileDeptOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileDeptOpen && (
                  <div className="space-y-1 pl-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setIsMobileMenuOpen(false);
                        if (currentPath !== '/') navigateTo('/');
                        const el = document.getElementById('products-grid-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-black text-[#0052FF] hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-kasma-gold" />
                      <span>{language === 'en' ? 'All Products & Categories' : 'ሁሉም ምድቦች'}</span>
                    </button>

                    {INITIAL_CATEGORIES.map(cat => {
                      let CatIcon = Cpu;
                      if (cat.id === 'computers') CatIcon = Laptop;
                      if (cat.id === 'gaming') CatIcon = Gamepad2;
                      if (cat.id === 'smartwatches') CatIcon = Watch;
                      if (cat.id === 'mobiles') CatIcon = Smartphone;
                      if (cat.id === 'headphones') CatIcon = Headphones;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSearchQuery(cat.id === 'mobiles' ? 'phone' : cat.id === 'smartwatches' ? 'watch' : cat.id === 'headphones' ? 'headphone' : cat.id === 'computers' ? 'laptop' : cat.id === 'gaming' ? 'gaming' : '');
                            setIsMobileMenuOpen(false);
                            if (currentPath !== '/') navigateTo('/');
                            const el = document.getElementById('products-grid-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-zinc-300 hover:text-[#0052FF] hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <CatIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{language === 'en' ? cat.nameEn : cat.nameAm}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Primary Page Navigation Links */}
              <div className="space-y-1 border-t border-gray-150 dark:border-zinc-800 pt-4">
                <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2">
                  {language === 'en' ? 'Quick Navigation' : 'ፈጣን አሰሳ'}
                </p>
                
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsMobileMenuOpen(false);
                    if (currentPath !== '/') navigateTo('/');
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-gray-500" />
                  <span>{language === 'en' ? 'Home' : 'ዋና ገጽ'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (currentPath !== '/') navigateTo('/');
                    const el = document.getElementById('products-grid-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4 text-gray-500" />
                  <span>{language === 'en' ? 'Shop Catalog' : 'የሱቅ ዝርዝር'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (currentPath !== '/') navigateTo('/');
                    const el = document.getElementById('featured-deals-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-red-500 fill-current animate-pulse" />
                    <span>{language === 'en' ? 'Amazing Deals' : 'ልዩ ቅናሾች'}</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black uppercase rounded-md">HOT</span>
                </button>
              </div>

              {/* Display & Connection Settings */}
              <div className="space-y-3 border-t border-gray-150 dark:border-zinc-800 pt-4">
                <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">
                  {language === 'en' ? 'Display & Connection' : 'ማሳያ እና ግንኙነት'}
                </p>

                {/* Theme Mode Switch */}
                <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-150 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 dark:text-zinc-200">
                    {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    <span>{language === 'en' ? 'Theme Mode' : 'የገጽታ ሁነታ'}</span>
                  </div>
                  <ThemeToggle 
                    theme={theme} 
                    onToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
                    language={language}
                    size="sm"
                    showLabel
                  />
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="shrink-0 p-4 bg-gray-50 dark:bg-zinc-950/80 border-t border-gray-150 dark:border-zinc-800 text-[11px] text-gray-400 dark:text-zinc-500 font-bold flex items-center justify-between">
              <span>Kasma Shop v2.4</span>
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{language === 'en' ? 'Active' : 'ቀጥታ'}</span>
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Active Workspace Rendering */}
      <main className="flex-grow w-full bg-[#EFF1F5] dark:bg-[#08090B] transition-colors duration-200">
        {isInitializing ? (
          <>
            {currentPath === '/admin' ? (
              <AdminDashboardSkeleton />
            ) : currentPath === '/merchant' ? (
              <MerchantPortalSkeleton />
            ) : (
              <CustomerWebSkeleton />
            )}
          </>
        ) : (
          <React.Suspense
            fallback={
              currentPath === '/admin' ? (
                <AdminDashboardSkeleton />
              ) : currentPath === '/merchant' ? (
                <MerchantPortalSkeleton />
              ) : (
                <CustomerWebSkeleton />
              )
            }
          >
            {currentPath === '/admin' ? (
              !isAdminAuthenticated ? (
                /* Administrator Authentication Screen */
                <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-xl space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-black dark:bg-zinc-800 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-gray-150 dark:border-zinc-700">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">
                      {language === 'en' ? 'Administrator Authentication' : 'አስተዳዳሪ ማረጋገጫ'}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {language === 'en' 
                        ? 'Authorize access to CBE/Awash escrow wires, catalog listings, and merchant audits.' 
                        : 'የCBE/አዋሽ ማስተላለፍያዎች፣ ካታሎጎች እና የስርዓት መቆጣጠሪያዎች ፍቃድ ማረጋገጫ።'}
                    </p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    {/* Demo Credentials Quick Fill Banner */}
                    <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-3 flex items-center justify-between text-xs gap-2">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-[#0052FF] dark:text-blue-400 text-[11px] uppercase tracking-wider">
                          {language === 'en' ? 'Default Admin Credentials:' : 'ነባሪ የአስተዳዳሪ መለያ:'}
                        </div>
                        <div className="font-mono text-[11px] text-gray-700 dark:text-zinc-300">
                          User: <span className="font-bold">kasma-admin</span> | Pass: <span className="font-bold">kasma_admin123</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminUsername('kasma-admin');
                          setAdminPasscode('kasma_admin123');
                          setAdminAuthError('');
                        }}
                        className="px-3 py-1.5 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold rounded-xl shrink-0 cursor-pointer text-[11px] shadow-xs transition-all"
                      >
                        {language === 'en' ? 'Auto-Fill' : 'ራስ-ሰር ሙላ'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        {language === 'en' ? 'Administrator Name' : 'የአስተዳዳሪ ስም'}
                      </label>
                      <input
                        type="text"
                        placeholder="kasma-admin"
                        value={adminUsername}
                        onChange={(e) => {
                          setAdminUsername(e.target.value);
                          setAdminAuthError('');
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] transition-all text-gray-900 dark:text-zinc-100 font-medium"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        {language === 'en' ? 'Administrator Password' : 'የአስተዳዳሪ ማለፊያ ቃል'}
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={adminPasscode}
                        onChange={(e) => {
                          setAdminPasscode(e.target.value);
                          setAdminAuthError('');
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] font-mono transition-all text-gray-900 dark:text-zinc-100"
                        required
                      />
                    </div>

                    {adminAuthError && (
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs px-3 py-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">{adminAuthError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 dark:text-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{language === 'en' ? 'Authorize Access' : 'ፍቃድ አረጋግጥ'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="relative">
                  <AdminDashboard
                    products={products}
                    merchants={merchants}
                    orders={orders}
                    auditLogs={auditLogs}
                    onApproveProduct={handleApproveProduct}
                    onRejectProduct={handleRejectProduct}
                    onApproveMerchantKyc={handleApproveMerchantKyc}
                    onToggleMerchantStatus={handleToggleMerchantStatus}
                    onApprovePayout={handleApprovePayout}
                    language={language}
                    promoCodes={promoCodes}
                    onAddPromoCode={handleAddPromoCode}
                    onRemovePromoCode={handleRemovePromoCode}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onLogout={handleAdminLogout}
                  />
                </div>
              )
            ) : currentPath === '/merchant' ? (
              !isMerchantAuthenticated ? (
                /* Merchant Authentication & Registration Screen */
                <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-xl space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-[#0052FF] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      <Store className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">
                      {merchantTabMode === 'LOGIN'
                        ? (language === 'en' ? 'Merchant Account Login' : 'የነጋዴ መለያ መግቢያ')
                        : (language === 'en' ? 'Merchant Registration' : 'የአዲስ ነጋዴ ምዝገባ')}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {merchantTabMode === 'LOGIN'
                        ? (language === 'en' 
                            ? 'Sign in to access your Kasma partner store, manage products, audit stock levels, and request bank payouts.' 
                            : 'የምርት ካታሎግ፣ የክምችት መጠን እና የባንክ ክፍያዎችን ለማስተዳደር ይግቡ።')
                        : (language === 'en'
                            ? 'Register your business on Kasma. New merchant accounts require verification by Admin (kasma-admin) before activation.'
                            : 'ንግድዎን በካስማ ያስመዝግቡ። አዲስ መለያዎች ከመሥራታቸው በፊት በአስተዳዳሪ ማረጋገጥ አለባቸው።')}
                    </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMerchantTabMode('LOGIN');
                        setMerchantAuthError('');
                      }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        merchantTabMode === 'LOGIN'
                          ? 'bg-white dark:bg-zinc-900 text-[#0052FF] shadow-xs'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                      }`}
                    >
                      {language === 'en' ? 'Store Login' : 'መግቢያ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMerchantTabMode('REGISTER');
                        setMerchantAuthError('');
                        setMerchantRegSuccess('');
                      }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        merchantTabMode === 'REGISTER'
                          ? 'bg-[#0052FF] text-white shadow-xs'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                      }`}
                    >
                      {language === 'en' ? 'Register Store +' : 'አዲስ ይመዝገቡ +'}
                    </button>
                  </div>

                  {merchantRegSuccess && (
                    <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs p-3.5 rounded-2xl leading-relaxed">
                      <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                      <div>
                        <p className="font-extrabold text-emerald-800 dark:text-emerald-300">Registration Submitted!</p>
                        <p className="mt-0.5">{merchantRegSuccess}</p>
                      </div>
                    </div>
                  )}

                  {merchantTabMode === 'LOGIN' ? (
                    <div className="space-y-4">
                      {/* Login Method Sub-Toggle */}
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setMerchantAuthMethod('PASSWORD')}
                          className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            merchantAuthMethod === 'PASSWORD'
                              ? 'bg-white dark:bg-zinc-950 text-[#0052FF] shadow-xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Password Login' : 'በማለፊያ ቃል'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMerchantAuthMethod('TELEGRAM_QR')}
                          className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            merchantAuthMethod === 'TELEGRAM_QR'
                              ? 'bg-[#229ED9] text-white shadow-xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Telegram QR Scan' : 'በቴሌግራም QR'}</span>
                        </button>
                      </div>

                      {merchantAuthMethod === 'TELEGRAM_QR' ? (
                        <MerchantTelegramQrLogin
                          merchants={merchants}
                          onSuccessLogin={handleTelegramQrLoginSuccess}
                          language={language}
                          addAuditLog={addAuditLog}
                        />
                      ) : (
                        <form onSubmit={handleMerchantLogin} className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                              {language === 'en' ? 'Store Email or Business Name' : 'የመደብር ኢሜይል ወይም ስም'}
                            </label>
                            <input
                              type="text"
                              placeholder={language === 'en' ? 'e.g. girma.tech@gmail.com or Girma Tech Store' : 'ምሳሌ girma.tech@gmail.com'}
                              value={merchantLoginIdentifier}
                              onChange={(e) => {
                                setMerchantLoginIdentifier(e.target.value);
                                setMerchantAuthError('');
                              }}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] font-medium transition-all text-gray-900 dark:text-zinc-100"
                              required
                              autoFocus
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                              {language === 'en' ? 'Merchant Password' : 'የነጋዴ ማለፊያ ቃል'}
                            </label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={merchantPasscode}
                              onChange={(e) => {
                                setMerchantPasscode(e.target.value);
                                setMerchantAuthError('');
                              }}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] font-mono transition-all text-center text-gray-900 dark:text-zinc-100"
                              required
                            />
                          </div>

                          {merchantAuthError && (
                            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs px-3.5 py-3 rounded-xl leading-relaxed">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span className="font-semibold">{merchantAuthError}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full py-3 bg-[#0052FF] hover:bg-[#0043D1] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{language === 'en' ? 'Login to Merchant Portal' : 'ወደ ነጋዴ ማዕከል ግባ'}</span>
                          </button>

                          <div className="pt-2 border-t border-gray-150 dark:border-zinc-800 text-center">
                            <button
                              type="button"
                              onClick={() => setMerchantAuthMethod('TELEGRAM_QR')}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#229ED9] hover:underline cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Scan Telegram QR Code to Sign In →' : 'በቴሌግራም QR ኮድ ለመግባት ይጫኑ →'}</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleMerchantRegister} className="space-y-3.5 text-left">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          {language === 'en' ? 'Store / Business Name *' : 'የመደብር ስም *'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bole Electronics Hub"
                          value={regStoreName}
                          onChange={(e) => setRegStoreName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          {language === 'en' ? 'Owner Full Name *' : 'የባለቤት ሙሉ ስም *'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dawit Bekele"
                          value={regOwnerName}
                          onChange={(e) => setRegOwnerName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                            {language === 'en' ? 'Email Address *' : 'ኢሜይል *'}
                          </label>
                          <input
                            type="email"
                            placeholder="owner@store.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                            {language === 'en' ? 'Phone Number' : 'ስልክ ቁጥር'}
                          </label>
                          <input
                            type="text"
                            placeholder="+251911223344"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-zinc-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          {language === 'en' ? 'Choose Password *' : 'ማለፊያ ቃል ምረጡ *'}
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono text-gray-900 dark:text-zinc-100"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          {language === 'en' ? 'Trade License / Business TIN (Optional Document)' : 'የንግድ ፈቃድ (አማራጭ)'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. License_Bole_Tech.pdf"
                          value={regKycDoc}
                          onChange={(e) => setRegKycDoc(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-100 font-mono"
                        />
                      </div>

                      {merchantAuthError && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs px-3 py-2.5 rounded-xl">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="font-semibold">{merchantAuthError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#0052FF] hover:bg-[#0043D1] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{language === 'en' ? 'Submit Registration for Admin Approval' : 'ለአስተዳዳሪ ፍቃድ አስገባ'}</span>
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <MerchantPortal
                    products={products}
                    merchants={merchants}
                    stockLogs={stockLogs}
                    orders={orders}
                    onAddProduct={handleAddProduct}
                    onBulkUpdateProducts={handleBulkUpdateProducts}
                    onUpdateProductStock={handleUpdateProductStock}
                    onBulkUpdateProductStock={handleBulkUpdateProductStock}
                    onUpdateProductThreshold={handleUpdateProductThreshold}
                    onAddAuditLog={addAuditLog}
                    onUpdateMerchantKyc={handleUpdateMerchantKyc}
                    onRequestPayout={handleRequestPayout}
                    language={language}
                    onLogout={handleMerchantLogout}
                  />
                </div>
              )
            ) : (
              <CustomerWeb
                products={products}
                categories={INITIAL_CATEGORIES}
                language={language}
                onAddOrder={handleAddOrder}
                onUpdateProductStock={handleUpdateProductStock}
                cart={cart}
                setCart={setCart}
                favorites={favorites}
                setFavorites={setFavorites}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
                isWishlistOpen={isWishlistOpen}
                setIsWishlistOpen={setIsWishlistOpen}
                theme={theme}
                orders={orders}
                offlineOrders={offlineOrders}
                isOfflineSimulated={isOfflineSimulated}
                isSyncing={isSyncing}
                onForceSync={handleForceSync}
                onToggleOfflineSimulated={() => setIsOfflineSimulated(!isOfflineSimulated)}
                priceAlerts={priceAlerts}
                setPriceAlerts={setPriceAlerts}
                isPriceAlertsOpen={isPriceAlertsOpen}
                setIsPriceAlertsOpen={setIsPriceAlertsOpen}
                promoCodes={promoCodes}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                onOpenQrScanner={() => setIsQrScannerOpen(true)}
                onOpenProductTour={() => setIsProductTourOpen(true)}
                offlineCatalogMeta={offlineCatalogMeta}
                isOnline={isOnline}
              />
            )}
          </React.Suspense>
        )}
      </main>

      {/* Guided Product Tour Popover */}
      <ProductTour
        isOpen={isProductTourOpen}
        onClose={() => setIsProductTourOpen(false)}
        language={language}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenEscrowInfo={() => setActivePolicyModal('escrow')}
      />

      {/* Back to Top bar & Footer - Only displayed in Storefront */}
      {currentPath === '/' && (
        <>
          <button 
        onClick={scrollToTop} 
        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-gray-500 dark:text-zinc-400 py-3.5 text-center text-xs font-bold uppercase tracking-widest transition-colors border-t border-b border-gray-200/50 dark:border-zinc-850/60 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <ChevronUp className="w-4 h-4 animate-bounce" />
        <span>{language === 'en' ? 'Back to Top' : 'ወደ ላይ ይመለሱ'}</span>
      </button>

      {/* Premium Informational Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-gray-150 dark:border-zinc-900 py-8 sm:py-12 px-3.5 sm:px-6 md:px-8 shrink-0 text-gray-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-[1440px] mx-auto w-full">
        
        {/* TRUST INDICATORS GUARANTEE RIBBON */}
        <div className="w-full border-b border-gray-150 dark:border-zinc-850 pb-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-zinc-900/80 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center gap-2.5 p-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">{language === 'en' ? 'Express Delivery' : 'ፈጣን ማድረሻ'}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Addis Ababa & Regions' : 'አዲስ አበባ እና ክልሎች'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">{language === 'en' ? 'Escrow Protection' : 'የእምነት ዋስትና'}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Telebirr, CBE & Chapa' : 'ቴሌብር፣ ሲቢኢ እና ቻፓ'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">{language === 'en' ? '7-Day Easy Returns' : 'የ7 ቀን ቀላል መመለስ'}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">{language === 'en' ? '100% Refund Guarantee' : '100% የገንዘብ ተመላሽ'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">{language === 'en' ? '1-Year Warranty' : 'የ1 ዓመት ዋስትና'}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">{language === 'en' ? 'Verified Quality Guarantee' : 'የጥራት ዋስትና የተሸፈነ'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription Banner */}
        <div className="w-full border-b border-gray-150 dark:border-zinc-850 pb-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/70 dark:bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-gray-150 dark:border-zinc-800">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                {language === 'en' ? 'Subscribe to Newsletter' : 'ለለልዩ ቅናሾች ይመዝገቡ'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {language === 'en' 
                  ? 'Get weekly flash sales, new vendor arrivals, and exclusive offers.' 
                  : 'የሳምንታዊ ልዩ ቅናሾች እና አዳዲስ መረጃዎችን ያግኙ።'}
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert(language === 'en' ? 'Thank you for subscribing!' : 'ለመመዝገብዎ እናመሰግናለን!'); }} className="flex gap-2 w-full md:w-auto min-w-[280px] sm:min-w-[340px]">
              <input 
                type="email" 
                placeholder={language === 'en' ? 'Enter your email' : 'ኢሜልዎን ያስገቡ'} 
                required
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs w-full focus:outline-hidden focus:border-[#0052FF] text-gray-900 dark:text-zinc-100 h-9"
              />
              <button 
                type="submit" 
                className="bg-[#0052FF] hover:bg-[#0052FF]/95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1 shrink-0 h-9"
              >
                <span>{language === 'en' ? 'Subscribe' : 'ይመዝገቡ'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* 2. Responsive Footer Links Section (Mobile Accordions / Desktop 5-Column Grid) */}
        
        {/* MOBILE VIEW (< md): Sleek Collapsible Accordions */}
        <div className="md:hidden w-full space-y-3 pb-6 border-b border-gray-150 dark:border-zinc-850">
          
          {/* Brand Card & Language Badge */}
          <div className="bg-gray-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800 space-y-2.5">
            <span className="text-sm font-black uppercase tracking-widest text-[#0052FF] block">
              KASMA <span className="text-gray-950 dark:text-white font-light">SHOP</span>
            </span>
            <p className="text-gray-500 dark:text-zinc-400 font-medium text-xs leading-relaxed">
              {language === 'en' 
                ? 'Ethiopia\'s trusted marketplace connecting verified local artisans and merchants under escrow buyer protection.'
                : 'ካስማ የሀገር ውስጥ አምራቾች እና ነጋዴዎችን በታማኝነት ከገዢዎች ጋር የሚያገናኝ የገበያ ቦታ ነው።'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 w-fit font-bold">
              <Globe className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>{language === 'en' ? 'English (US)' : 'አማርኛ (ኢትዮጵያ)'}</span>
              <span className="text-gray-300 dark:text-zinc-700">|</span>
              <span className="font-mono text-[10px] text-gray-400">ETB (ብር)</span>
            </div>
          </div>

          {/* Accordion 1: Shop & Discover */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpenFooterAccordion(openFooterAccordion === 'shop' ? null : 'shop')}
              className="w-full flex items-center justify-between p-3.5 text-left font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{language === 'en' ? 'Shop & Discover' : 'ምድቦች እና ግዢ'}</span>
              <ChevronDown className={`w-4 h-4 text-[#0052FF] transition-transform duration-200 ${openFooterAccordion === 'shop' ? 'rotate-180' : ''}`} />
            </button>
            {openFooterAccordion === 'shop' && (
              <ul className="px-3.5 pb-3.5 space-y-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/60 pt-2.5">
                <li>
                  <button onClick={scrollToTop} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Storefront / All Products' : 'ዋናው ሱቅ / ሁሉም ምርቶች'}
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById('featured-deals-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Special Flash Sales' : 'ሳምንታዊ ልዩ ቅናሾች'}
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById('products-grid-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Browse Electronics' : 'የኤሌክትሮኒክስ ምርቶች'}
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById('products-grid-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Handcrafts & Agriculture' : 'የእጅ ጥበብ እና ግብርና'}
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 2: Policies & Support */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpenFooterAccordion(openFooterAccordion === 'policies' ? null : 'policies')}
              className="w-full flex items-center justify-between p-3.5 text-left font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{language === 'en' ? 'Policies & Support' : 'ፖሊሲዎች እና ህጎች'}</span>
              <ChevronDown className={`w-4 h-4 text-[#0052FF] transition-transform duration-200 ${openFooterAccordion === 'policies' ? 'rotate-180' : ''}`} />
            </button>
            {openFooterAccordion === 'policies' && (
              <ul className="px-3.5 pb-3.5 space-y-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/60 pt-2.5">
                <li>
                  <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicyModal('terms')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicyModal('refunds')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Returns & Refunds' : 'የምርት መልስ እና ተመላሽ'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicyModal('faq')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Help Center & FAQ' : 'የእርዳታ ማዕከል እና ጥያቄዎች'}
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 3: Kasma Business */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpenFooterAccordion(openFooterAccordion === 'business' ? null : 'business')}
              className="w-full flex items-center justify-between p-3.5 text-left font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{language === 'en' ? 'Kasma Business' : 'ካስማ ለንግድ አጋሮች'}</span>
              <ChevronDown className={`w-4 h-4 text-[#0052FF] transition-transform duration-200 ${openFooterAccordion === 'business' ? 'rotate-180' : ''}`} />
            </button>
            {openFooterAccordion === 'business' && (
              <ul className="px-3.5 pb-3.5 space-y-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/60 pt-2.5">
                <li>
                  <button onClick={() => navigateTo('/merchant')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Sell on Kasma' : 'ምርትዎን በካስማ ላይ ይሽጡ'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/merchant')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Merchant Portal' : 'የነጋዴዎች መግቢያ'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/admin')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Admin Governance' : 'የአስተዳዳሪ ክፍል'}
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 4: Customer Support */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpenFooterAccordion(openFooterAccordion === 'support' ? null : 'support')}
              className="w-full flex items-center justify-between p-3.5 text-left font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{language === 'en' ? 'Customer Support' : 'የደንበኞች አገልግሎት'}</span>
              <ChevronDown className={`w-4 h-4 text-[#0052FF] transition-transform duration-200 ${openFooterAccordion === 'support' ? 'rotate-180' : ''}`} />
            </button>
            {openFooterAccordion === 'support' && (
              <div className="px-3.5 pb-3.5 space-y-3 text-xs font-bold text-gray-600 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/60 pt-2.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0052FF] shrink-0 mt-0.5" />
                  <span>Bole Sub-City, Addis Ababa, Ethiopia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                  <span>+251 911 223 344</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                  <span>support@kasma.shop</span>
                </div>
                <a
                  href={generateWhatsAppCustomerWelcomeUrl(cart, language)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs py-2.5 px-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer w-full mt-2"
                >
                  <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
                  <span>{language === 'en' ? 'Chat on WhatsApp' : 'በዋትስአፕ ያወሩን'}</span>
                </a>
              </div>
            )}
          </div>

        </div>

        {/* DESKTOP VIEW (>= md): Pristine 5-Column Grid */}
        <div className="hidden md:grid w-full grid-cols-5 gap-6 lg:gap-8 text-xs leading-relaxed items-start pb-8 border-b border-gray-150 dark:border-zinc-850">
          
          {/* Column 1: About & Language Selector */}
          <div className="space-y-3.5 text-left">
            <div className="space-y-1.5">
              <span className="text-sm font-black uppercase tracking-widest text-[#0052FF] block">
                KASMA <span className="text-gray-950 dark:text-white font-light">SHOP</span>
              </span>
              <p className="text-gray-400 dark:text-zinc-500 leading-relaxed font-medium text-xs">
                {language === 'en' 
                  ? 'Ethiopia\'s trusted marketplace connecting verified local artisans and merchants under escrow buyer protection.'
                  : 'ካስማ የሀገር ውስጥ አምራቾች እና ነጋዴዎችን በታማኝነት ከገዢዎች ጋር የሚያገናኝ የገበያ ቦታ ነው።'}
              </p>
            </div>
            {/* Language and Region Badge */}
            <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl px-3 py-1.5 w-fit font-bold">
              <Globe className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>{language === 'en' ? 'English (US)' : 'አማርኛ (ኢትዮጵያ)'}</span>
              <span className="text-gray-250 dark:text-zinc-800">|</span>
              <span className="font-mono text-[10px] text-gray-400 dark:text-zinc-500">ETB (ብር)</span>
            </div>
          </div>

          {/* Column 2: Quick Links / Navigation */}
          <div className="space-y-3 text-left">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Shop & Discover' : 'ምድቦች እና ግዢ'}
            </h4>
            <ul className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold text-xs">
              <li>
                <button onClick={scrollToTop} className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left">
                  {language === 'en' ? 'Storefront / All Products' : 'ዋናው ሱቅ / ሁሉም ምርቶች'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('featured-deals-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left"
                >
                  {language === 'en' ? 'Special Flash Sales' : 'ሳምንታዊ ልዩ ቅናሾች'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('products-grid-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left"
                >
                  {language === 'en' ? 'Browse Electronics' : 'የኤሌክትሮኒክስ ምርቶች'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('products-grid-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left"
                >
                  {language === 'en' ? 'Handcrafts & Agriculture' : 'የእጅ ጥበብ እና ግብርና'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Comprehensive Policy & Legal Sitemap Column */}
          <div className="space-y-3 text-left">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Policies & Support' : 'ፖሊሲዎች እና ህጎች'}
            </h4>
            <ul className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold text-xs">
              <li>
                <button 
                  onClick={() => setActivePolicyModal('privacy')} 
                  className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left"
                >
                  <span>{language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal('terms')} 
                  className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left"
                >
                  <span>{language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal('refunds')} 
                  className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left"
                >
                  <span>{language === 'en' ? 'Returns & Refunds' : 'የምርት መልስ እና ተመላሽ'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal('faq')} 
                  className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left"
                >
                  <span>{language === 'en' ? 'Help Center & FAQ' : 'የእርዳታ ማዕከል እና ጥያቄዎች'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Partner & Merchant Portal Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Kasma Business' : 'ካስማ ለንግድ አጋሮች'}
            </h4>
            <ul className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold text-xs">
              <li>
                <button onClick={() => navigateTo('/merchant')} className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left">
                  {language === 'en' ? 'Sell on Kasma' : 'ምርትዎን በካስማ ላይ ይሽጡ'}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/merchant')} className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left">
                  {language === 'en' ? 'Merchant Portal' : 'የነጋዴዎች መግቢያ'}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/admin')} className="hover:text-[#0052FF] dark:hover:text-[#0052FF] transition-colors cursor-pointer text-left">
                  {language === 'en' ? 'Admin Governance' : 'የአስተዳዳሪ ክፍል'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact & Secure Support Desk */}
          <div className="space-y-3 text-left">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Customer Support' : 'የደንበኞች አገልግሎት'}
            </h4>
            <ul className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0052FF] shrink-0 mt-0.5" />
                <span>Bole Sub-City, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                <span>+251 911 223 344</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                <span>support@kasma.shop</span>
              </li>
              <li className="pt-2">
                <a
                  href={generateWhatsAppCustomerWelcomeUrl(cart, language)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs py-2 px-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer w-full"
                >
                  <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
                  <span>{language === 'en' ? 'Chat on WhatsApp' : 'በዋትስአፕ ያወሩን'}</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Dedicated Social Media Section */}
        <div className="w-full pt-6 sm:pt-8">
          <SocialFooterSection language={language} cart={cart} />
        </div>

        {/* 3. Divider & Secure Payments Gateways Bar */}
        <div className="w-full mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-150 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-5 sm:gap-6 text-[11px] text-gray-400 dark:text-zinc-500 font-bold px-1 sm:px-4">
          
          {/* Payment Badges */}
          <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-600 font-extrabold mr-1">
              {language === 'en' ? 'Secured By' : 'የክፍያ ዋስትና በ:'}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-mono text-[9px] tracking-wide font-extrabold">
                CHAPA
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-mono text-[9px] tracking-wide font-extrabold">
                TELEBIRR
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-mono text-[9px] tracking-wide font-extrabold">
                CBE CUSTODY
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-mono text-[9px] tracking-wide font-extrabold">
                AWASH TRUST
              </div>
            </div>
          </div>

          {/* Quick Footer Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] text-gray-500 dark:text-zinc-400 font-semibold">
            <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-[#0052FF] transition-colors cursor-pointer">
              {language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}
            </button>
            <span className="text-gray-300 dark:text-zinc-700">•</span>
            <button onClick={() => setActivePolicyModal('terms')} className="hover:text-[#0052FF] transition-colors cursor-pointer">
              {language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች'}
            </button>
            <span className="text-gray-300 dark:text-zinc-700">•</span>
            <button onClick={() => setActivePolicyModal('refunds')} className="hover:text-[#0052FF] transition-colors cursor-pointer">
              {language === 'en' ? 'Returns & Refunds' : 'ተመላሽ ፖሊሲ'}
            </button>
            <span className="text-gray-300 dark:text-zinc-700">•</span>
            <button onClick={() => setActivePolicyModal('faq')} className="hover:text-[#0052FF] transition-colors cursor-pointer">
              {language === 'en' ? 'FAQ' : 'ጥያቄዎች'}
            </button>
          </div>
          
          {/* Copyright text */}
          <div className="text-center md:text-right font-medium text-[10px] sm:text-[11px] leading-normal text-gray-400 dark:text-zinc-500">
            <span>© 2026 KASMA ETHIOPIAN LOCALIZED COMMERCE. ALL RIGHTS RESERVED.</span>
          </div>

        </div>

        </div>
      </footer>
        </>
      )}

      {/* COMPREHENSIVE E-COMMERCE POLICY MODAL (Shopify/Amazon/Alibaba Style) */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0052FF]/10 text-[#0052FF]">
                  {activePolicyModal === 'privacy' && <Lock className="w-5 h-5" />}
                  {activePolicyModal === 'terms' && <FileText className="w-5 h-5" />}
                  {activePolicyModal === 'refunds' && <RotateCcw className="w-5 h-5" />}
                  {activePolicyModal === 'faq' && <HelpCircle className="w-5 h-5" />}
                  {activePolicyModal === 'escrow' && <ShieldCheck className="w-5 h-5" />}
                  {activePolicyModal === 'shipping' && <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {activePolicyModal === 'privacy' && (language === 'en' ? 'Privacy & Data Protection Policy' : 'የግላዊነት እና የመረጃ ጥበቃ ፖሊሲ')}
                    {activePolicyModal === 'terms' && (language === 'en' ? 'Terms of Service & Platform Agreement' : 'የአገልግሎት ውሎች እና መመሪያዎች')}
                    {activePolicyModal === 'refunds' && (language === 'en' ? 'Returns & Refunds Guarantee' : 'የምርት መልስ እና ተመላሽ ዋስትና')}
                    {activePolicyModal === 'faq' && (language === 'en' ? 'Frequently Asked Questions (FAQ)' : 'ተደጋግመው የሚጠየቁ ጥያቄዎች')}
                    {activePolicyModal === 'escrow' && (language === 'en' ? 'Buyer Escrow Protection Policy' : 'የገዢዎች የባንክ እምነት ዋስትና')}
                    {activePolicyModal === 'shipping' && (language === 'en' ? 'Shipping & Logistics Guidelines' : 'የማጓጓዣ እና ማድረሻ መመሪያዎች')}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono font-medium">
                    {language === 'en' ? 'Effective Date: July 2026 • Version 2.4' : 'የተሻሻለበት ቀን፡ ሐምሌ 2018 (2026)'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setActivePolicyModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-gray-600 dark:text-zinc-300">
              
              {/* PRIVACY POLICY CONTENT */}
              {activePolicyModal === 'privacy' && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">1. Data Collection & Security Scope</h4>
                    <p>
                      Kasma Ethiopian Localized Commerce collects essential transaction data including buyer delivery addresses, contact phone numbers, and payment authorization tokens. We utilize industry-standard 256-bit SSL encryption to guarantee that all personal credentials remain strictly confidential.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">2. Tokenized Payment Gateway Integration</h4>
                    <p>
                      Your raw credit card numbers or PIN codes are never stored on Kasma servers. All digital payments are securely processed using tokenized APIs via Telebirr, Chapa, and Commercial Bank of Ethiopia (CBE).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">3. No Data Selling Guarantee</h4>
                    <p>
                      We strictly enforce a zero-third-party data monetization policy. Your personal details are shared exclusively with verified delivery couriers (Fana Express & Tikur Anbessa) solely for order fulfillment.
                    </p>
                  </div>
                </>
              )}

              {/* TERMS OF SERVICE CONTENT */}
              {activePolicyModal === 'terms' && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">1. Marketplace Account Rules</h4>
                    <p>
                      By accessing Kasma Shop, buyers and merchants agree to uphold transaction integrity. Fake orders, fraudulent reviews, or misuse of the escrow system will result in immediate account suspension and CBE custody freeze.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">2. Escrow Protection Agreement</h4>
                    <p>
                      Funds transferred for order purchases remain in Kasma Bank Escrow Custody until the customer physically inspects the item and releases the One-Time Passcode (OTP) to the delivery agent.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">3. Artisan Quality Standards</h4>
                    <p>
                      All weavers, farmers, and tech merchants operating on Kasma must pass identity verification and submit authentic product image proof prior to list publication.
                    </p>
                  </div>
                </>
              )}

              {/* RETURNS & REFUNDS CONTENT */}
              {activePolicyModal === 'refunds' && (
                <>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-black text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wider">7-Day Money-Back Inspection Window</h4>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">
                        If a received product is damaged, counterfeit, or differs significantly from description, you are eligible for a 100% full escrow refund.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">1. How to Initiate a Return</h4>
                    <p>
                      Open your Order History, select the relevant item, and click "Request Refund / Return". Attach a photo showing the flaw or issue.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">2. Doorstep Pick-up Logistics</h4>
                    <p>
                      Fana Express couriers will collect the returned item directly from your address in Addis Ababa or regional capitals within 24 hours at no additional cost.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">3. Refund Processing Time</h4>
                    <p>
                      Once the item is picked up, escrow funds are instantly unlocked and credited back to your original payment channel (Telebirr, Chapa, or Bank Account) within 24 hours.
                    </p>
                  </div>
                </>
              )}

              {/* FAQ CONTENT */}
              {activePolicyModal === 'faq' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl space-y-1 border border-gray-150 dark:border-zinc-800">
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">Q: How does the Escrow Payment System work?</h4>
                    <p className="text-gray-500 dark:text-zinc-400 text-[11px]">
                      When you pay for an item, your money goes into a secure Commercial Bank of Ethiopia (CBE/Awash) holding account. The seller only receives payment after you confirm receipt and inspect the goods.
                    </p>
                  </div>
                  <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl space-y-1 border border-gray-150 dark:border-zinc-800">
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">Q: What payment options are accepted?</h4>
                    <p className="text-gray-500 dark:text-zinc-400 text-[11px]">
                      We accept Telebirr Mobile Money, Chapa Gateway (Debit/Credit Cards), CBE Birr, Awash Direct Pay, and Cash on Delivery with Escrow OTP.
                    </p>
                  </div>
                  <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl space-y-1 border border-gray-150 dark:border-zinc-800">
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">Q: How long does delivery take?</h4>
                    <p className="text-gray-500 dark:text-zinc-400 text-[11px]">
                      Addis Ababa deliveries take 2 to 4 hours via express couriers. Regional city shipments (Hawassa, Bahir Dar, Mekelle, Adama, Dire Dawa) arrive within 24 to 48 hours.
                    </p>
                  </div>
                  <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl space-y-1 border border-gray-150 dark:border-zinc-800">
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">Q: How do I sign up as a seller or merchant?</h4>
                    <p className="text-gray-500 dark:text-zinc-400 text-[11px]">
                      Click "Merchant Hub Portal" in the footer menu, submit your business license / kebele ID, and start uploading your inventory once verified.
                    </p>
                  </div>
                </div>
              )}

              {/* ESCROW POLICY CONTENT */}
              {activePolicyModal === 'escrow' && (
                <>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-black text-green-900 dark:text-green-200 text-xs uppercase tracking-wider">CBE & Awash Escrow Holding Account</h4>
                      <p className="text-[11px] text-green-700 dark:text-green-300">
                        100% financial protection for all buyers across Ethiopia. Funds are never transferred directly to untrusted merchant accounts beforehand.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Order & Payment Reservation</h5>
                        <p className="text-gray-500 dark:text-zinc-400 text-[11px]">Your payment is authorized and locked inside Kasma's bank escrow vault.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Courier Dispatch & Doorstep Testing</h5>
                        <p className="text-gray-500 dark:text-zinc-400 text-[11px]">Courier delivers the package. You open and inspect the goods before final confirmation.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-black shrink-0">3</div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">OTP Release & Merchant Payout</h5>
                        <p className="text-gray-500 dark:text-zinc-400 text-[11px]">You provide the SMS OTP code to the delivery agent to release funds to the seller.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SHIPPING POLICY CONTENT */}
              {activePolicyModal === 'shipping' && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">1. Express Same-Day Addis Ababa Delivery</h4>
                    <p>
                      Orders placed before 4:00 PM within Addis Ababa (Bole, Kirkos, Yeka, Arada, Nifas Silk, Lideta, Akaki) are fulfilled within 2 to 4 hours via Fana Express motorbikes.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">2. Regional Capital Shipments</h4>
                    <p>
                      Regional orders (Hawassa, Bahir Dar, Mekelle, Adama, Dire Dawa, Gondar, Jimma) are dispatched daily via Tikur Anbessa logistics hub with SMS tracking updates.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">3. Package Inspection at Handover</h4>
                    <p>
                      All couriers are instructed to allow customers to inspect package seals and verify physical contents prior to OTP collection.
                    </p>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer Bar */}
            <div className="p-4 border-t border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-between items-center text-xs font-bold">
              <span className="text-gray-400">Questions? Contact support@kasma.shop</span>
              <button 
                onClick={() => setActivePolicyModal(null)}
                className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {language === 'en' ? 'I Understand & Agree' : 'ተረድቻለሁ'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QR Code Scanner Overlay Modal */}
      <QrCodeScannerOverlay
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        products={products.filter(p => p.status === 'APPROVED')}
        onSelectProduct={(product) => {
          setSelectedProduct(product);
          if (currentPath !== '/') navigateTo('/');
        }}
        onApplySearchQuery={(query) => {
          setSearchQuery(query);
          if (currentPath !== '/') navigateTo('/');
          setTimeout(() => {
            const el = document.getElementById('products-grid-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        language={language}
        showToast={showToast}
      />

      {/* Global Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
            toastNotification.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-500/40'
              : toastNotification.type === 'warning'
              ? 'bg-amber-900/90 text-white border-amber-500/40'
              : 'bg-zinc-900/90 text-white border-zinc-700/60'
          }`}>
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-bold leading-snug">{toastNotification.message}</span>
            <button
              onClick={() => setToastNotification(null)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

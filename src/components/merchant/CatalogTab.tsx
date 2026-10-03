import React, { useState, useMemo } from 'react';
import { Product, Variant, Merchant } from '../../types';
import { 
  Plus, 
  Trash2, 
  UploadCloud, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Tag, 
  FileCheck, 
  Package,
  Search,
  SlidersHorizontal,
  Check,
  X,
  Eye,
  EyeOff,
  Percent,
  FolderOpen,
  ArrowUpDown,
  QrCode,
  Printer,
  AlertTriangle,
  PackageCheck,
  FileSpreadsheet,
  FileUp,
  Edit3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ListFilter,
  CheckCircle2,
  Settings,
  RefreshCw,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CsvProductImportModal from './CsvProductImportModal';

interface CatalogTabProps {
  products: Product[];
  currentMerchant: Merchant;
  onAddProduct: (p: Product) => void;
  onBulkUpdateProducts?: (updates: {
    productId: string;
    status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
    priceChangePct?: number;
    flatPrice?: number;
    lowStockThreshold?: number;
    category?: string;
    featured?: boolean;
  }[]) => Promise<{ success: boolean; error?: string }>;
  onAddAuditLog: (actor: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => void;
  language: 'en' | 'am';
  onNavigateToTab: (tab: 'DASHBOARD' | 'CATALOG' | 'STOCK' | 'PAYOUT' | 'KYC') => void;
}

export default function CatalogTab({
  products,
  currentMerchant,
  onAddProduct,
  onBulkUpdateProducts,
  onAddAuditLog,
  language,
  onNavigateToTab
}: CatalogTabProps) {
  // Navigation: Sub-tabs within Catalog
  const [catalogSubTab, setCatalogSubTab] = useState<'LIST' | 'CREATE'>('LIST');

  // CSV Batch Product Import Modal State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Search and Filter state for products list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW_STOCK'>('ALL');

  // Checkbox Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkIsSubmitting, setBulkIsSubmitting] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState<number>(10);

  // Advanced Bulk Manager Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'STATUS' | 'PRICE_PCT' | 'PRICE_FLAT' | 'CATEGORY' | 'STOCK_THRESHOLD' | 'FEATURED'>('STATUS');
  const [bulkStatusTarget, setBulkStatusTarget] = useState<'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED'>('APPROVED');
  const [bulkPricePct, setBulkPricePct] = useState<number>(-10);
  const [bulkFlatPrice, setBulkFlatPrice] = useState<number>(1000);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>('traditional');
  const [bulkStockThreshold, setBulkStockThreshold] = useState<number>(5);
  const [bulkFeaturedTarget, setBulkFeaturedTarget] = useState<boolean>(true);

  // QR Generation State
  const [selectedQrProduct, setSelectedQrProduct] = useState<Product | null>(null);
  const [selectedPrintVariant, setSelectedPrintVariant] = useState<{ product: Product; variant: Variant } | null>(null);

  // New Product Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAm, setDescAm] = useState('');
  const [price, setPrice] = useState(1000);
  const [category, setCategory] = useState('traditional');
  const [brand, setBrand] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [variantsList, setVariantsList] = useState<{ sku: string; name: string; priceOffset: number; onHand: number; }[]>([
    { sku: '', name: 'Standard Option', priceOffset: 0, onHand: 10 }
  ]);

  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' }[]>([]);
  
  const showLocalToast = (message: string, type: 'success' | 'warning' = 'success') => {
    const id = `${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Filter products for this merchant
  const merchantProducts = useMemo(() => {
    return products.filter(p => p.merchantId === currentMerchant.id);
  }, [products, currentMerchant.id]);

  // Apply Search & Filters to merchant's products
  const filteredProducts = useMemo(() => {
    return merchantProducts.filter(p => {
      const matchesSearch = 
        p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nameAm.includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

      const totalOnHand = p.variants.reduce((acc, v) => acc + v.onHand, 0);
      const isLowStock = totalOnHand <= p.lowStockThreshold || p.variants.some(v => v.onHand <= p.lowStockThreshold);
      const matchesStock = stockFilter === 'ALL' || (stockFilter === 'LOW_STOCK' && isLowStock);

      return matchesSearch && matchesStatus && matchesCategory && matchesStock;
    });
  }, [merchantProducts, searchTerm, statusFilter, categoryFilter, stockFilter]);

  // Master Checkbox Toggle
  const isAllSelected = filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length;
  const isSomeSelected = selectedProductIds.length > 0 && selectedProductIds.length < filteredProducts.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Bulk visibility change logic
  const handleBulkVisibilityChange = async (newStatus: 'APPROVED' | 'PENDING_APPROVAL') => {
    if (selectedProductIds.length === 0) return;
    setBulkIsSubmitting(true);
    
    const updates = selectedProductIds.map(pId => ({
      productId: pId,
      status: newStatus
    }));

    try {
      if (onBulkUpdateProducts) {
        const res = await onBulkUpdateProducts(updates);
        if (res.success) {
          showLocalToast(
            language === 'en'
              ? `Successfully updated visibility for ${selectedProductIds.length} products.`
              : `${selectedProductIds.length} ምርቶች ታይነታቸው በተሳካ ሁኔታ ተቀይሯል።`,
            'success'
          );
          setSelectedProductIds([]);
        } else {
          showLocalToast(`Error: ${res.error || 'Failed bulk update'}`, 'warning');
        }
      } else {
        showLocalToast('Bulk updates are simulated sequentially in preview.', 'success');
        setSelectedProductIds([]);
      }
    } catch (err: any) {
      showLocalToast(`Action failed: ${err.message}`, 'warning');
    } finally {
      setBulkIsSubmitting(false);
    }
  };

  // Bulk discount change logic
  const handleBulkDiscountChange = async (discountPercent: number) => {
    if (selectedProductIds.length === 0) return;
    setBulkIsSubmitting(true);

    const updates = selectedProductIds.map(pId => ({
      productId: pId,
      // discount percent is e.g. 10, meaning a -10% price change offset
      priceChangePct: -discountPercent
    }));

    try {
      if (onBulkUpdateProducts) {
        const res = await onBulkUpdateProducts(updates);
        if (res.success) {
          showLocalToast(
            language === 'en'
              ? `Applied -${discountPercent}% discount to ${selectedProductIds.length} products.`
              : `በ${selectedProductIds.length} ምርቶች ላይ -${discountPercent}% ቅናሽ በተሳካ ሁኔታ ተተግብሯል።`,
            'success'
          );
          
          // Log Audit Log for bulk discount action
          onAddAuditLog(
            `${currentMerchant.storeName} (Merchant)`,
            'BULK_DISCOUNT_APPLIED',
            `Applied -${discountPercent}% promotional price discount across ${selectedProductIds.length} catalog items.`,
            'INFO'
          );

          setSelectedProductIds([]);
        } else {
          showLocalToast(`Error: ${res.error || 'Failed discount application'}`, 'warning');
        }
      } else {
        showLocalToast('Promo discount application completed sequentially!', 'success');
        setSelectedProductIds([]);
      }
    } catch (err: any) {
      showLocalToast(`Discount application failed: ${err.message}`, 'warning');
    } finally {
      setBulkIsSubmitting(false);
    }
  };

  // Comprehensive Bulk Manager Modal Apply Handler
  const handleApplyBulkModal = async () => {
    if (selectedProductIds.length === 0) return;
    setBulkIsSubmitting(true);

    const updates = selectedProductIds.map(pId => {
      const up: any = { productId: pId };
      if (bulkActionType === 'STATUS') {
        up.status = bulkStatusTarget;
      } else if (bulkActionType === 'PRICE_PCT') {
        up.priceChangePct = bulkPricePct;
      } else if (bulkActionType === 'PRICE_FLAT') {
        up.flatPrice = bulkFlatPrice;
      } else if (bulkActionType === 'CATEGORY') {
        up.category = bulkCategoryTarget;
      } else if (bulkActionType === 'STOCK_THRESHOLD') {
        up.lowStockThreshold = bulkStockThreshold;
      } else if (bulkActionType === 'FEATURED') {
        up.featured = bulkFeaturedTarget;
      }
      return up;
    });

    try {
      if (onBulkUpdateProducts) {
        const res = await onBulkUpdateProducts(updates);
        if (res.success) {
          const detailMsg = 
            bulkActionType === 'STATUS' ? `Set status to ${bulkStatusTarget === 'APPROVED' ? 'Active / Published' : bulkStatusTarget === 'PENDING_APPROVAL' ? 'Inactive / Draft' : 'Suspended'}` :
            bulkActionType === 'PRICE_PCT' ? `Adjusted price by ${bulkPricePct >= 0 ? '+' : ''}${bulkPricePct}%` :
            bulkActionType === 'PRICE_FLAT' ? `Set flat price to ${bulkFlatPrice.toLocaleString()} ETB` :
            bulkActionType === 'CATEGORY' ? `Updated category to ${bulkCategoryTarget}` :
            bulkActionType === 'STOCK_THRESHOLD' ? `Set low stock alert to ${bulkStockThreshold} units` :
            `Set featured status to ${bulkFeaturedTarget ? 'Featured' : 'Standard'}`;

          showLocalToast(
            language === 'en'
              ? `Bulk updated ${selectedProductIds.length} products: ${detailMsg}`
              : `${selectedProductIds.length} ምርቶች በአጠቃላይ ተሻሽለዋል: ${detailMsg}`,
            'success'
          );

          onAddAuditLog(
            `${currentMerchant.storeName} (Merchant)`,
            'BULK_PRODUCT_UPDATE',
            `Bulk operation (${bulkActionType}): ${detailMsg} across ${selectedProductIds.length} catalog items.`,
            'INFO'
          );

          setSelectedProductIds([]);
          setIsBulkModalOpen(false);
        } else {
          showLocalToast(`Error: ${res.error || 'Failed bulk update'}`, 'warning');
        }
      } else {
        showLocalToast('Bulk update applied sequentially in preview mode!', 'success');
        setSelectedProductIds([]);
        setIsBulkModalOpen(false);
      }
    } catch (err: any) {
      showLocalToast(`Bulk update failed: ${err.message}`, 'warning');
    } finally {
      setBulkIsSubmitting(false);
    }
  };

  const addVariantRow = () => {
    const bPart = brand ? brand.substring(0, 3).toUpperCase() : 'SKU';
    const num = Math.floor(100 + Math.random() * 900);
    const mockSku = `${bPart}-${num}`;
    setVariantsList([...variantsList, { sku: mockSku, name: '', priceOffset: 0, onHand: 5 }]);
  };

  const removeVariantRow = (index: number) => {
    if (variantsList.length <= 1) {
      showLocalToast(
        language === 'en' 
          ? '⚠️ You must keep at least one variant.' 
          : '⚠️ ቢያንስ አንድ የምርት አይነት ማካተት አለብዎት።', 
        'warning'
      );
      return;
    }
    setVariantsList(variantsList.filter((_, idx) => idx !== index));
  };

  const updateVariantRow = (index: number, field: string, val: any) => {
    setVariantsList(variantsList.map((item, i) => i === index ? { ...item, [field]: val } : item));
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAm || !brand) {
      showLocalToast(
        language === 'en'
          ? 'Please fill out both English and Amharic titles, and artisan/brand name.'
          : 'እባክዎን የእንግሊዝኛ እና የአማርኛ አርዕስት እንዲሁም የአምራች ስም ያስገቡ።',
        'warning'
      );
      return;
    }

    const validVariants: Variant[] = variantsList
      .filter(v => v.sku.trim().length > 0)
      .map(v => ({
        sku: v.sku.trim().toUpperCase(),
        name: v.name || 'Standard Option',
        priceOffset: Number(v.priceOffset) || 0,
        onHand: Number(v.onHand) || 0,
        reserved: 0
      }));

    if (validVariants.length === 0) {
      showLocalToast(language === 'en' ? 'Provide at least one variant with a unique SKU.' : 'ቢያንስ አንድ ልዩ SKU ያለው አይነት ያስገቡ።', 'warning');
      return;
    }

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      nameEn,
      nameAm,
      descriptionEn: descEn || 'No description provided.',
      descriptionAm: descAm || 'መግለጫ አልተሰጠም።',
      price: Number(price),
      category,
      brand,
      image,
      variants: validVariants,
      status: 'PENDING_APPROVAL',
      lowStockThreshold: Number(lowStockThreshold),
      merchantId: currentMerchant.id,
      merchantName: currentMerchant.storeName
    };

    onAddProduct(newProduct);
    onAddAuditLog(
      `${currentMerchant.storeName} (Merchant)`,
      'PRODUCT_CREATED_PENDING',
      `Submitted new product "${nameEn}" with SKU code sequence [${validVariants.map(v => v.sku).join(', ')}] for Admin review.`,
      'INFO'
    );

    // Reset Form
    setNameEn('');
    setNameAm('');
    setDescEn('');
    setDescAm('');
    setPrice(1000);
    setBrand('');
    setVariantsList([{ sku: '', name: 'Standard Option', priceOffset: 0, onHand: 10 }]);
    setCatalogSubTab('LIST');
    alert(
      language === 'en'
        ? 'Product catalog listing draft successfully dispatched to Administration audits!'
        : 'የምርት ካታሎግ ረቂቅ ለአስተዳዳሪው ለኦዲት በተሳካ ሁኔታ ተልኳል!'
    );
  };

  const handleSelectDemoImage = (url: string) => {
    setImage(url);
    showLocalToast(language === 'en' ? 'Product graphic selected!' : 'የምርት ምስል ተመርጧል!');
  };

  const demoImages = [
    { name: 'Pottery Clay', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Ethiopian Coffee', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80' },
    { name: 'Saba Tilet Apparel', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80' },
    { name: 'Organic Spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation: Active Listings vs Submit New Product */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div className="flex bg-gray-100/50 dark:bg-zinc-850/40 p-1.5 rounded-xl border border-gray-200/50 dark:border-zinc-800/80 w-full sm:max-w-md">
          <button
            onClick={() => setCatalogSubTab('LIST')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              catalogSubTab === 'LIST'
                ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
            }`}
          >
            {language === 'en' ? 'Active Listings Catalog' : 'የእቃዎች ካታሎግ ዝርዝር'}
          </button>
          <button
            onClick={() => setCatalogSubTab('CREATE')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              catalogSubTab === 'CREATE'
                ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
            }`}
          >
            {language === 'en' ? 'Submit New Product' : 'አዲስ ምርት ማስገቢያ'}
          </button>
        </div>

        {catalogSubTab === 'LIST' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'en' ? 'Import CSV' : 'በCSV አስገባ'}</span>
            </button>

            <button
              onClick={() => setCatalogSubTab('CREATE')}
              className="px-4 py-2 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'en' ? 'Add Product' : 'ምርት ጨምር'}</span>
            </button>
          </div>
        )}
      </div>

      {catalogSubTab === 'LIST' ? (
        <div className="space-y-6">
          
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'en' ? "Search by product title, brand, category..." : "በምርት ስም፣ አምራች ወይም ምድብ ፈልግ..."}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-850 dark:text-white focus:outline-none focus:border-[#0052FF] font-semibold"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Filters' : 'ማጣሪያዎች'}</span>
                </div>

                {/* Category selector */}
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none text-gray-800 dark:text-zinc-200"
                >
                  <option value="ALL">Category: All</option>
                  <option value="traditional">Traditional & Cultural</option>
                  <option value="staples">Food Staples & Coffee</option>
                  <option value="electronics">Electronics & Gadgets</option>
                  <option value="apparel">Fashion & Apparel</option>
                </select>

                {/* Status Selector */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none text-gray-800 dark:text-zinc-200"
                >
                  <option value="ALL">Status: All</option>
                  <option value="APPROVED">Live / Approved</option>
                  <option value="PENDING_APPROVAL">Pending / Draft</option>
                  <option value="REJECTED">Suspended / Rejected</option>
                </select>

                {/* Stock Level Filter */}
                <select
                  value={stockFilter}
                  onChange={e => setStockFilter(e.target.value as any)}
                  className={`border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none transition-all ${
                    stockFilter === 'LOW_STOCK'
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      : 'border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 text-gray-800 dark:text-zinc-200'
                  }`}
                >
                  <option value="ALL">Stock: All Levels</option>
                  <option value="LOW_STOCK">⚠️ Low Stock Warnings Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Products Table */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-zinc-850/30 text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-200 dark:border-zinc-850">
                    <th className="px-5 py-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={el => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#0052FF] focus:ring-[#0052FF] cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-4">{language === 'en' ? 'Product Detail' : 'የምርት መረጃ'}</th>
                    <th className="px-5 py-4">{language === 'en' ? 'Category' : 'ምድብ'}</th>
                    <th className="px-5 py-4 text-center">{language === 'en' ? 'Stock Level' : 'የክምችት መጠን'}</th>
                    <th className="px-5 py-4 text-right">{language === 'en' ? 'Base Price' : 'መነሻ ዋጋ'}</th>
                    <th className="px-5 py-4 text-center">{language === 'en' ? 'SLA Status' : 'ሁኔታ'}</th>
                    <th className="px-5 py-4 text-center">{language === 'en' ? 'Variants' : 'ዓይነቶች'}</th>
                    <th className="px-5 py-4 text-right">{language === 'en' ? 'Actions' : 'ድርጊቶች'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-zinc-850">
                  {filteredProducts.map(p => {
                    const isSelected = selectedProductIds.includes(p.id);
                    const totalOnHand = p.variants.reduce((acc, v) => acc + v.onHand, 0);
                    const isLowStock = totalOnHand <= p.lowStockThreshold || p.variants.some(v => v.onHand <= p.lowStockThreshold);

                    return (
                      <tr 
                        key={p.id} 
                        className={`transition-colors hover:bg-gray-50/40 dark:hover:bg-zinc-850/10 ${
                          isSelected ? 'bg-[#0052FF]/[0.02] dark:bg-blue-950/10' : ''
                        } ${isLowStock ? 'bg-red-50/10 dark:bg-red-950/5' : ''}`}
                      >
                        <td className="px-5 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectProduct(p.id)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#0052FF] focus:ring-[#0052FF] cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img 
                                src={p.image} 
                                alt={p.nameEn} 
                                className={`w-12 h-12 object-cover rounded-xl border ${
                                  isLowStock ? 'border-red-300 dark:border-red-800' : 'border-gray-100 dark:border-zinc-850'
                                }`}
                                referrerPolicy="no-referrer"
                              />
                              {isLowStock && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white dark:border-zinc-900 animate-pulse" title="Low Stock Warning">
                                  <AlertTriangle className="w-3 h-3 text-white" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-sm space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-extrabold text-gray-900 dark:text-white leading-tight text-xs truncate">
                                  {language === 'en' ? p.nameEn : p.nameAm}
                                </p>
                                {isLowStock && (
                                  <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-950/90 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse shrink-0">
                                    <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                                    {language === 'en' ? 'Low Stock' : 'ዝቅተኛ ክምችት'} ({totalOnHand})
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                                {p.brand}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            p.category === 'traditional'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                              : p.category === 'staples'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : p.category === 'electronics'
                              ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
                              : 'bg-purple-50 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400'
                          }`}>
                            {p.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isLowStock ? (
                            <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-xl text-xs font-bold font-mono shadow-xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                              <span>{totalOnHand} units</span>
                              <span className="text-[9px] font-sans font-extrabold uppercase bg-red-200/60 dark:bg-red-900/80 px-1.5 py-0.2 rounded text-red-800 dark:text-red-200">
                                &le; {p.lowStockThreshold} min
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl text-xs font-bold font-mono">
                              <PackageCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{totalOnHand} units</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-gray-900 dark:text-white text-xs">
                          {p.price.toLocaleString()} ETB
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            p.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400'
                              : p.status === 'PENDING_APPROVAL'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                          }`}>
                            {p.status === 'APPROVED' ? (language === 'en' ? 'Live' : 'በቀጥታ ስርጭት') : p.status === 'PENDING_APPROVAL' ? (language === 'en' ? 'Draft' : 'ረቂቅ') : (language === 'en' ? 'Suspended' : 'የታገደ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-mono text-[10px] text-gray-400 font-bold">
                          {p.variants.length} options
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedQrProduct(p)}
                              title={language === 'en' ? 'Generate QR Label' : 'የQR መለያ ፍጠር'}
                              className="p-1.5 rounded-lg border border-gray-150 dark:border-zinc-800 text-[#0052FF] hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                handleToggleSelectProduct(p.id);
                                handleBulkVisibilityChange(p.status === 'APPROVED' ? 'PENDING_APPROVAL' : 'APPROVED');
                              }}
                              title={p.status === 'APPROVED' ? 'Hide listing' : 'Publish listing'}
                              className="p-1.5 rounded-lg border border-gray-150 dark:border-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              {p.status === 'APPROVED' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-24 text-gray-400 dark:text-zinc-500 font-medium">
                        <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p>{language === 'en' ? 'No catalog products match current filters.' : 'ከማጣሪያው ጋር የሚዛመድ ምርት አልተገኘም።'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* FLOATING BULK ACTION TOOLBAR */}
            <AnimatePresence>
              {selectedProductIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-black border border-[#C5A059] rounded-2xl py-3.5 px-6 shadow-2xl flex flex-col sm:flex-row items-center gap-4 z-50 max-w-4xl w-[90%] pointer-events-auto"
                >
                  <div className="flex items-center gap-2.5 sm:border-r border-zinc-800 pr-4 shrink-0">
                    <span className="w-5 h-5 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                      {selectedProductIds.length}
                    </span>
                    <p className="text-xs font-bold text-white tracking-tight">
                      {language === 'en' ? 'Items Selected' : 'እቃዎች ተመርጠዋል'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full justify-between sm:justify-start">
                    
                    {/* Change Visibility Actions */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider hidden lg:inline">
                        {language === 'en' ? 'Visibility' : 'ታይነት'}:
                      </span>
                      <button
                        onClick={() => handleBulkVisibilityChange('APPROVED')}
                        disabled={bulkIsSubmitting}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>{language === 'en' ? 'Publish' : 'አሳታም'}</span>
                      </button>
                      <button
                        onClick={() => handleBulkVisibilityChange('PENDING_APPROVAL')}
                        disabled={bulkIsSubmitting}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <EyeOff className="w-3 h-3 text-amber-400" />
                        <span>{language === 'en' ? 'Hide / Draft' : 'ረቂቅ አድርግ'}</span>
                      </button>
                    </div>

                    {/* Change Discounts Actions */}
                    <div className="flex items-center gap-1.5 sm:border-l border-zinc-800 sm:pl-3.5">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider hidden lg:inline">
                        {language === 'en' ? 'Bulk Discount' : 'አጠቃላይ ቅናሽ'}:
                      </span>
                      
                      {/* Predefined percentage buttons */}
                      {[-10, -20, -30].map(pct => (
                        <button
                          key={pct}
                          onClick={() => handleBulkDiscountChange(Math.abs(pct))}
                          disabled={bulkIsSubmitting}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-[#0052FF] text-white font-mono font-black text-[10px] rounded-lg transition-all cursor-pointer"
                        >
                          {pct}%
                        </button>
                      ))}

                      {/* Custom discount input */}
                      <div className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-lg">
                        <input
                          type="number"
                          min="1"
                          max="95"
                          value={customDiscountValue}
                          onChange={e => setCustomDiscountValue(Math.max(1, Math.min(95, Number(e.target.value))))}
                          className="w-10 bg-transparent text-white font-mono font-bold text-center text-[10px] focus:outline-none border-b border-zinc-700"
                        />
                        <span className="text-[10px] text-zinc-500 font-bold">%</span>
                        <button
                          onClick={() => handleBulkDiscountChange(customDiscountValue)}
                          disabled={bulkIsSubmitting}
                          className="p-1 hover:text-white text-[#C5A059] cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Advanced Batch Operations Button */}
                    <div className="sm:border-l border-zinc-800 sm:pl-3.5">
                      <button
                        onClick={() => setIsBulkModalOpen(true)}
                        disabled={bulkIsSubmitting}
                        className="px-3.5 py-1.5 bg-[#0052FF] hover:bg-blue-600 text-white font-black text-[10px] rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Advanced Batch Operations' : 'አጠቃላይ ማሻሻያ ስቱዲዮ'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProductIds([])}
                    className="text-zinc-500 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-all cursor-pointer shrink-0 ml-auto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateProductSubmit} className="space-y-6">
          
          {/* CSV Batch Import Promo Banner */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                  {language === 'en' ? 'Have multiple products to upload?' : 'ብዙ ምርቶችን በአንድ ጊዜ ማስገባት ይፈልጋሉ?'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                  {language === 'en'
                    ? 'Upload a CSV spreadsheet to import dozens of products and variants instantly.'
                    : 'በCSV ፋይል ብዙ ምርቶችን በአንድ ጊዜ በፍጥነት ይጫኑ'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCsvModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>{language === 'en' ? 'Batch Import via CSV' : 'በCSV ፋይል አስገባ'}</span>
            </button>
          </div>
          
          {/* Core Product Details card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <Tag className="w-4 h-4 text-[#0052FF]" />
              <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                1. {language === 'en' ? 'Identity & Localization' : 'የምርት መለያ መረጃ'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                  <span>Product Name (English) *</span>
                  <span className="text-[9px] bg-blue-50 dark:bg-zinc-800 text-[#0052FF] px-1.5 py-0.5 rounded">Required</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Painted Jebena Pot"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white transition-all font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                  <span>የምርት ስም (አማርኛ) *</span>
                  <span className="text-[9px] bg-amber-50 dark:bg-zinc-800 text-[#C5A059] px-1.5 py-0.5 rounded">ግዴታ</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ምሳሌ፡ በእጅ የተቀባ ባህላዊ የሸክላ ጀበና"
                  value={nameAm}
                  onChange={e => setNameAm(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white transition-all font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the materials used, historical craft significance, care directions, and dimensions..."
                  value={descEn}
                  onChange={e => setDescEn(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white transition-all leading-relaxed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  መግለጫ (አማርኛ)
                </label>
                <textarea
                  rows={3}
                  placeholder="ስለ ምርቱ አሰራር፣ ጥራት፣ መጠን እና አጠቃቀም ዝርዝር መረጃዎችን ያስገቡ..."
                  value={descAm}
                  onChange={e => setDescAm(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Pricing, Metrics, & Inventory Limits */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <Tag className="w-4 h-4 text-[#C5A059]" />
              <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                2. {language === 'en' ? 'Pricing & Warehousing Config' : 'የዋጋ እና የክምችት ማዋቀሪያ'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  {language === 'en' ? 'Base Price (ETB)' : 'መነሻ ዋጋ (ETB)'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={e => setPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white transition-all font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  {language === 'en' ? 'Category' : 'ምድብ'}
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white transition-all font-bold"
                >
                  <option value="traditional">Traditional & Cultural</option>
                  <option value="staples">Food Staples & Coffee</option>
                  <option value="electronics">Electronics & Gadgets</option>
                  <option value="apparel">Fashion & Apparel</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  {language === 'en' ? 'Brand / Artisan Store' : 'የአምራች/ባለሙያ ስም'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Awassa Clay Works"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white transition-all font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  {language === 'en' ? 'Low Stock Threshold' : 'ማስጠንቀቂያ መነሻ መጠን'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Math.max(0, Number(e.target.value)))}
                  className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white transition-all font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Media & Upload Section */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <UploadCloud className="w-4 h-4 text-sky-500" />
              <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                3. {language === 'en' ? 'Product Graphics & Media' : 'የምርት ምስል እና ሚዲያ'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    {language === 'en' ? 'Custom Product Image URL' : 'የምስል ሊንክ/URL'}
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#0052FF] focus:bg-white text-gray-900 dark:text-white transition-all font-mono"
                  />
                </div>

                {/* Demo presets */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {language === 'en' ? 'Or Select Studio Presets:' : 'ወይም የናሙና ምስል ይምረጡ፡'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {demoImages.map(img => (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => handleSelectDemoImage(img.url)}
                        className={`p-1.5 rounded-xl border text-[10px] font-bold text-left transition-all hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer flex flex-col gap-1.5 items-center ${
                          image === img.url 
                            ? 'border-[#0052FF] bg-blue-50/20 text-[#0052FF]' 
                            : 'border-gray-200 dark:border-zinc-800'
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <span className="truncate w-full text-center">{img.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Card Preview */}
              <div className="md:col-span-4 flex flex-col justify-center">
                <div className="border border-gray-150 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-zinc-850/15 space-y-3 shadow-xs">
                  <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-center border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                    Live Store Preview
                  </p>
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
                    <div className="relative h-28 bg-gray-100 dark:bg-zinc-800">
                      <img 
                        src={image || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80'} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 right-2 bg-black/60 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-xs">
                        {category}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {language === 'en' ? (nameEn || 'Untitled Product') : (nameAm || 'ያልተሰየመ ምርት')}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate font-semibold">
                        {brand || 'Artisan Brand'}
                      </p>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-100/60 dark:border-zinc-850/40">
                        <span className="text-[#0052FF] font-black text-xs font-mono">{price.toLocaleString()} ETB</span>
                        <span className="text-[9px] bg-amber-100/60 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Draft</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Generator Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  4. {language === 'en' ? 'SKU Variant Configuration' : 'SKU እና መጠን ማዋቀሪያ'}
                </h4>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="text-[11px] font-black bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 
                {language === 'en' ? 'Add Variant SKU' : 'አዲስ አይነት SKU ጨምር'}
              </button>
            </div>

            <div className="space-y-3.5">
              {variantsList.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 bg-gray-50/50 dark:bg-zinc-850/10 rounded-2xl border border-gray-150 dark:border-zinc-800/80 items-end">
                  
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest block">SKU Code (Unique) *</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JB-BROWN"
                      value={row.sku}
                      onChange={e => updateVariantRow(idx, 'sku', e.target.value)}
                      className="w-full border border-gray-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl px-3 py-2 text-xs uppercase font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest block">Option Name</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Medium Brown / Saba Design"
                      value={row.name}
                      onChange={e => updateVariantRow(idx, 'name', e.target.value)}
                      className="w-full border border-gray-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest block">Price Offset (ETB)</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={row.priceOffset}
                      onChange={e => updateVariantRow(idx, 'priceOffset', Number(e.target.value))}
                      className="w-full border border-gray-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest block">Initial Inventory</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="10"
                      value={row.onHand}
                      onChange={e => updateVariantRow(idx, 'onHand', Number(e.target.value))}
                      className="w-full border border-gray-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end pb-1.5">
                    <button
                      type="button"
                      onClick={() => removeVariantRow(idx)}
                      className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-4 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-sm rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-5 h-5" />
              <span>
                {language === 'en' ? 'Submit New Listing for Audit' : 'አዲስ እቃ ለመገምገም ላክ'} Review
              </span>
            </button>
          </div>

        </form>
      )}

      {/* Floating local notifications feed */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded-xl border shadow-xl flex items-center justify-between text-xs pointer-events-auto transition-all duration-300 transform translate-y-0 bg-zinc-950 border-zinc-850 text-white`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{t.type === 'success' ? '✓' : '⚠️'}</span>
              <p className="font-semibold leading-relaxed">{t.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="ml-3 font-bold hover:opacity-80 opacity-50 shrink-0 cursor-pointer text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* QR SELECTOR MODAL */}
      <AnimatePresence>
        {selectedQrProduct && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-left"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#0052FF]" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white">
                    {language === 'en' ? 'Product Variant QR Labels' : 'የምርት ዓይነቶች የQR መለያዎች'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedQrProduct(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white cursor-pointer text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  {selectedQrProduct.brand}
                </p>
                <h5 className="font-extrabold text-base text-gray-950 dark:text-white leading-tight">
                  {language === 'en' ? selectedQrProduct.nameEn : selectedQrProduct.nameAm}
                </h5>
                <p className="text-xs text-gray-400 dark:text-zinc-550 leading-relaxed">
                  {language === 'en' 
                    ? 'Select a variant SKU to print physical product tags, or simulate an inventory barcode scan. To perform real stock adjustments, use the QR Scanner inside the Stock tab.'
                    : 'መለያዎችን ለማተም ወይም የባርኮድ ስካን ለመምሰል ከታች ካሉት አማራጮች አንዱን ይምረጡ። የምርት ክምችት ለማስተካከል በክምችት ገጽ ላይ ያለውን የQR ስካነር ይጠቀሙ።'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {selectedQrProduct.variants.map((v) => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(v.sku)}`;
                  return (
                    <div 
                      key={v.sku} 
                      className="border border-gray-150 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between bg-gray-50/20 dark:bg-zinc-850/20 hover:shadow-md transition-all"
                    >
                      <div className="flex gap-3 text-left">
                        <div className="w-20 h-20 bg-white p-1.5 rounded-xl border border-gray-200 shrink-0 flex items-center justify-center relative group">
                          <img 
                            src={qrUrl} 
                            alt={`QR for ${v.sku}`} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-[10px] font-mono font-black text-[#0052FF]">{v.sku}</p>
                          <h6 className="font-extrabold text-xs text-gray-900 dark:text-white leading-tight truncate">{v.name}</h6>
                          <p className="text-[10px] text-gray-400 font-bold">
                            Stock: {v.onHand} units
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPrintVariant({ product: selectedQrProduct, variant: v })}
                          className="flex-1 py-1.5 bg-white dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{language === 'en' ? 'Print' : 'አትም'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Sound beep
                            try {
                              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                              const oscillator = audioCtx.createOscillator();
                              const gainNode = audioCtx.createGain();
                              oscillator.connect(gainNode);
                              gainNode.connect(audioCtx.destination);
                              oscillator.type = 'sine';
                              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                              gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
                              oscillator.start();
                              setTimeout(() => {
                                oscillator.stop();
                                audioCtx.close();
                              }, 120);
                            } catch (err) {}
                            
                            // Show redirect instructions toast
                            setToasts(prev => [
                              ...prev,
                              {
                                id: Date.now().toString(),
                                type: 'success',
                                message: `SKU Scan Simulated! To adjust ${v.sku} stock, head to Stock tab -> "QR Labels & Scanner".`
                              }
                            ]);
                          }}
                          className="py-1.5 px-3 bg-black dark:bg-white text-white dark:text-black font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>{language === 'en' ? 'Scan SKU' : 'ስካን'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedQrProduct(null)}
                  className="px-5 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'አቋርጥ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT TICKET MODAL OVERLAY */}
      <AnimatePresence>
        {selectedPrintVariant && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-zinc-950 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl relative text-left"
            >
              <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-900">
                  {language === 'en' ? 'Rapid-Scan Stock Tag Print Label' : 'የክምችት መለያ ማተሚያ'}
                </h4>
                <button
                  onClick={() => setSelectedPrintVariant(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-zinc-500 hover:text-black cursor-pointer text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {/* Physical Print Ticket container */}
              <div id="catalog-physical-printed-label" className="border-4 border-dashed border-zinc-950 p-6 bg-white flex flex-col items-center text-center space-y-4 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-zinc-950 text-white font-mono text-[8px] font-black tracking-widest px-2.5 py-0.5 uppercase rounded-br-lg">
                  KASMA VERIFIED SECURE
                </div>
                
                <div className="pt-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {selectedPrintVariant.product.brand}
                  </p>
                  <h5 className="font-extrabold text-sm text-zinc-950 leading-tight">
                    {selectedPrintVariant.product.nameEn}
                  </h5>
                  <p className="text-[10px] font-bold text-zinc-600 mt-1">
                    {selectedPrintVariant.variant.name}
                  </p>
                </div>

                {/* QR Code */}
                <div className="w-36 h-36 bg-white p-3 rounded-2xl border-2 border-zinc-950 flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedPrintVariant.variant.sku)}`} 
                    alt="Printed Code" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-[11px] font-black tracking-widest text-zinc-900">
                    SKU: {selectedPrintVariant.variant.sku}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Price: {selectedPrintVariant.product.price.toLocaleString()} ETB
                  </p>
                </div>

                <div className="w-full border-t border-dashed border-zinc-400 pt-3 flex justify-between items-center text-[8px] font-mono text-gray-450">
                  <span>DISPATCH: CBE EXCLUSIVE</span>
                  <span>VERIFIED ORIGINAL</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('catalog-physical-printed-label')?.outerHTML;
                    if (printContents) {
                      try {
                        const win = window.open('', '_blank');
                        if (win) {
                          win.document.write(`
                            <html>
                              <head>
                                <title>KASMA Stock Label - ${selectedPrintVariant.variant.sku}</title>
                                <style>
                                  body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
                                  .print-area { width: 320px; }
                                </style>
                              </head>
                              <body>
                                <div class="print-area">${printContents}</div>
                                <script>window.onload = function() { window.print(); }</script>
                              </body>
                            </html>
                          `);
                          win.document.close();
                        } else {
                          alert("Label ready! Enable popups to trigger automatic label printing.");
                        }
                      } catch (e) {
                        alert("To print, right-click the sticker label and save or print directly!");
                      }
                    }
                  }}
                  className="flex-1 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'en' ? 'Open Print Window' : 'ማተሚያ ገጽ ክፈት'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPrintVariant(null)}
                  className="py-2.5 px-5 bg-gray-100 hover:bg-gray-250 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'አቋርጥ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADVANCED BULK UPDATE MODAL */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-150 dark:border-zinc-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] rounded-2xl border border-blue-100 dark:border-blue-900/40">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">
                        {language === 'en' ? 'Batch Product Updates Studio' : 'የምርቶች አጠቃላይ ማሻሻያ ስቱዲዮ'}
                      </h3>
                      <span className="bg-[#0052FF] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {selectedProductIds.length} {language === 'en' ? 'Selected' : 'ተመርጠዋል'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      {language === 'en' 
                        ? 'Batch change statuses (e.g. set to inactive/draft), update price percentages, or modify stock thresholds across selected items.'
                        : 'የምርቶች ሁኔታዎችን በቡድን ይቀይሩ (ለምሳሌ፡ ረቂቅ/የታገደ አድርግ)፣ የዋጋ በመቶኛ ይጨምሩ/ይቀንሱ ወይም የማስጠንቀቂያ መጠን ያስካክሉ።'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Products Preview Chips */}
              <div className="bg-gray-50 dark:bg-zinc-850/50 p-3.5 rounded-2xl border border-gray-200/60 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-gray-700 dark:text-zinc-300">
                  <span>{language === 'en' ? 'Target Products Preview:' : 'የተመረጡ ምርቶች ዝርዝር:'}</span>
                  <span className="text-gray-400 font-mono text-[11px]">
                    {language === 'en' ? 'Total Value:' : 'ጠቅላላ ዋጋ:'}{' '}
                    {merchantProducts
                      .filter(p => selectedProductIds.includes(p.id))
                      .reduce((acc, p) => acc + p.price, 0)
                      .toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 max-h-24 overflow-y-auto pr-1">
                  {merchantProducts
                    .filter(p => selectedProductIds.includes(p.id))
                    .map(p => (
                      <div key={p.id} className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-2xs text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                        <img src={p.image} alt={p.nameEn} className="w-4 h-4 rounded-md object-cover" />
                        <span className="max-w-[120px] truncate">{language === 'en' ? p.nameEn : p.nameAm}</span>
                        <span className="text-[10px] font-mono text-gray-400">({p.price.toLocaleString()} ETB)</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Operation Tabs */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  {language === 'en' ? 'Select Operation Type' : 'የማሻሻያ አይነት ይምረጡ'}
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBulkActionType('STATUS')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      bulkActionType === 'STATUS'
                        ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/30 text-[#0052FF] dark:text-blue-400 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <EyeOff className="w-4 h-4" />
                      {bulkActionType === 'STATUS' && <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">{language === 'en' ? 'Batch Status Change' : 'የምርት ሁኔታ ይቀይሩ'}</p>
                      <p className="text-[10px] opacity-75">{language === 'en' ? 'Set Active / Inactive / Draft' : 'በቀጥታ / ረቂቅ / የታገደ'}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkActionType('PRICE_PCT')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      bulkActionType === 'PRICE_PCT'
                        ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/30 text-[#0052FF] dark:text-blue-400 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Percent className="w-4 h-4" />
                      {bulkActionType === 'PRICE_PCT' && <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">{language === 'en' ? 'Price Adjustment %' : 'የዋጋ መቶኛ (+/- %)'}</p>
                      <p className="text-[10px] opacity-75">{language === 'en' ? 'Discount or markup %' : 'ቅናሽ ወይም ጭማሪ %'}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkActionType('PRICE_FLAT')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      bulkActionType === 'PRICE_FLAT'
                        ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/30 text-[#0052FF] dark:text-blue-400 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <DollarSign className="w-4 h-4" />
                      {bulkActionType === 'PRICE_FLAT' && <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">{language === 'en' ? 'Flat Base Price' : 'ቋሚ ዋጋ በብር'}</p>
                      <p className="text-[10px] opacity-75">{language === 'en' ? 'Override base ETB price' : 'አንድ አይነት ዋጋ መደደብ'}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkActionType('CATEGORY')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      bulkActionType === 'CATEGORY'
                        ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/30 text-[#0052FF] dark:text-blue-400 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <FolderOpen className="w-4 h-4" />
                      {bulkActionType === 'CATEGORY' && <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">{language === 'en' ? 'Category Reassign' : 'ምድብ መቀየሪያ'}</p>
                      <p className="text-[10px] opacity-75">{language === 'en' ? 'Batch move to category' : 'ወደ አዲስ ምድብ ውሰድ'}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkActionType('STOCK_THRESHOLD')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      bulkActionType === 'STOCK_THRESHOLD'
                        ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/30 text-[#0052FF] dark:text-blue-400 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <AlertTriangle className="w-4 h-4" />
                      {bulkActionType === 'STOCK_THRESHOLD' && <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">{language === 'en' ? 'Stock Warning Limit' : 'የክምችት መጠን ገደብ'}</p>
                      <p className="text-[10px] opacity-75">{language === 'en' ? 'Alert threshold' : 'ዝቅተኛ ክምችት ማስጠንቀቂያ'}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkActionType('FEATURED')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      bulkActionType === 'FEATURED'
                        ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/30 text-[#0052FF] dark:text-blue-400 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Star className="w-4 h-4" />
                      {bulkActionType === 'FEATURED' && <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">{language === 'en' ? 'Featured Tag' : 'የተመረጡ እቃዎች'}</p>
                      <p className="text-[10px] opacity-75">{language === 'en' ? 'Highlight on storefront' : 'በዋናው ገፅ ላይ አሳይ'}</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Controls Configuration Box */}
              <div className="bg-gray-50/80 dark:bg-zinc-850/40 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 space-y-4">
                
                {/* 1. STATUS CONFIG */}
                {bulkActionType === 'STATUS' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200">
                      {language === 'en' ? 'Select Target Status for All Selected Products:' : 'የሚቀየረውን ሁኔታ ይምረጡ:'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setBulkStatusTarget('APPROVED')}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          bulkStatusTarget === 'APPROVED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                            : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                          <Eye className="w-4 h-4 text-emerald-600" />
                          <span>{language === 'en' ? 'Active / Live' : 'በቀጥታ ስርጭት (የሚታይ)'}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1">{language === 'en' ? 'Visible to customers' : 'ለደንበኞች በሱቁ ላይ የሚታይ'}</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkStatusTarget('PENDING_APPROVAL')}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          bulkStatusTarget === 'PENDING_APPROVAL'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                            : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                          <EyeOff className="w-4 h-4 text-amber-600" />
                          <span>{language === 'en' ? 'Inactive / Draft' : 'ረቂቅ (የማይታይ)'}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1">{language === 'en' ? 'Hidden from store' : 'ከሱቁ ለጊዜው የተሸሸገ'}</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkStatusTarget('REJECTED')}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          bulkStatusTarget === 'REJECTED'
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300 font-bold shadow-xs'
                            : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                          <X className="w-4 h-4 text-red-600" />
                          <span>{language === 'en' ? 'Suspended' : 'የታገደ'}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1">{language === 'en' ? 'Marked suspended' : 'ለጊዜው የታገደ'}</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. PRICE PERCENT CONFIG */}
                {bulkActionType === 'PRICE_PCT' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                        {language === 'en' ? 'Percentage Adjustment:' : 'የዋጋ ቅናሽ/ጭማሪ መቶኛ:'}
                      </label>
                      <span className={`text-sm font-black font-mono px-3 py-1 rounded-xl ${
                        bulkPricePct < 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {bulkPricePct > 0 ? `+${bulkPricePct}%` : `${bulkPricePct}%`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400">-50%</span>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        step="1"
                        value={bulkPricePct}
                        onChange={e => setBulkPricePct(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#0052FF]"
                      />
                      <span className="text-xs font-bold text-gray-400">+50%</span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{language === 'en' ? 'Presets:' : 'ቅድመ-ቅብብል:'}</span>
                      {[-30, -20, -15, -10, -5, +5, +10, +15, +20].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBulkPricePct(val)}
                          className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                            bulkPricePct === val
                              ? 'bg-[#0052FF] text-white border-[#0052FF]'
                              : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {val > 0 ? `+${val}%` : `${val}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. FLAT PRICE CONFIG */}
                {bulkActionType === 'PRICE_FLAT' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200">
                      {language === 'en' ? 'Set Exact Base Price (ETB):' : 'ቋሚ የምርት መነሻ ዋጋ (በብር):'}
                    </label>
                    <div className="relative max-w-sm">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">ETB</span>
                      <input
                        type="number"
                        min="1"
                        value={bulkFlatPrice}
                        onChange={e => setBulkFlatPrice(Math.max(1, Number(e.target.value)))}
                        className="w-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl pl-12 pr-4 py-2.5 text-sm font-mono font-extrabold focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 4. CATEGORY CONFIG */}
                {bulkActionType === 'CATEGORY' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200">
                      {language === 'en' ? 'Select New Category:' : 'አዲስ ምድብ ይምረጡ:'}
                    </label>
                    <select
                      value={bulkCategoryTarget}
                      onChange={e => setBulkCategoryTarget(e.target.value)}
                      className="w-full max-w-sm border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF]"
                    >
                      <option value="traditional">Traditional & Cultural Apparel</option>
                      <option value="staples">Food Staples & Ethiopian Coffee</option>
                      <option value="electronics">Electronics & Smart Devices</option>
                      <option value="apparel">Fashion & Leather Goods</option>
                    </select>
                  </div>
                )}

                {/* 5. LOW STOCK CONFIG */}
                {bulkActionType === 'STOCK_THRESHOLD' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200">
                      {language === 'en' ? 'Minimum Stock Warning Level (Units):' : 'አነስተኛ የክምችት መጠን ማስጠንቀቂያ (በቁጥር):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={bulkStockThreshold}
                      onChange={e => setBulkStockThreshold(Math.max(1, Number(e.target.value)))}
                      className="w-full max-w-xs border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>
                )}

                {/* 6. FEATURED CONFIG */}
                {bulkActionType === 'FEATURED' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-800 dark:text-zinc-200">
                      {language === 'en' ? 'Set Storefront Highlight Status:' : 'በዋናው ገፅ ላይ የማሳየት ሁኔታ:'}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setBulkFeaturedTarget(true)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                          bulkFeaturedTarget
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300'
                            : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>{language === 'en' ? 'Feature on Storefront' : 'የተመረጡ እቃዎች ያድርጉ'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkFeaturedTarget(false)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                          !bulkFeaturedTarget
                            ? 'bg-gray-200 dark:bg-zinc-700 border-gray-400 text-gray-900 dark:text-white'
                            : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                        }`}
                      >
                        <span>{language === 'en' ? 'Standard Listing' : 'መደበኛ ዝርዝር'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* LIVE SIMULATION PREVIEW TABLE */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === 'en' ? 'Live Before & After Preview' : 'የለውጥ ቅድመ-ዕይታ'}</span>
                </h4>

                <div className="border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100/70 dark:bg-zinc-800/60 text-gray-500 dark:text-zinc-400 font-bold text-[9px] uppercase tracking-wider border-b border-gray-200 dark:border-zinc-800">
                        <th className="p-3">{language === 'en' ? 'Product Name' : 'የምርት ስም'}</th>
                        <th className="p-3 text-center">{language === 'en' ? 'Current Value' : 'የአሁኑ ዋጋ/ሁኔታ'}</th>
                        <th className="p-3 text-center">{language === 'en' ? 'Updated Expected' : 'አዲሱ ዋጋ/ሁኔታ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-zinc-800">
                      {merchantProducts
                        .filter(p => selectedProductIds.includes(p.id))
                        .slice(0, 6)
                        .map(p => {
                          let nextPrice = p.price;
                          if (bulkActionType === 'PRICE_PCT') {
                            nextPrice = Math.max(1, Math.round(p.price * (1 + bulkPricePct / 100)));
                          } else if (bulkActionType === 'PRICE_FLAT') {
                            nextPrice = bulkFlatPrice;
                          }

                          return (
                            <tr key={p.id} className="bg-white dark:bg-zinc-900">
                              <td className="p-3 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <img src={p.image} alt="" className="w-6 h-6 rounded-md object-cover" />
                                <span className="truncate max-w-xs">{language === 'en' ? p.nameEn : p.nameAm}</span>
                              </td>
                              <td className="p-3 text-center font-mono font-semibold text-gray-500">
                                {bulkActionType === 'STATUS' 
                                  ? p.status 
                                  : bulkActionType === 'CATEGORY' 
                                  ? p.category 
                                  : `${p.price.toLocaleString()} ETB`}
                              </td>
                              <td className="p-3 text-center font-mono font-extrabold text-[#0052FF] dark:text-blue-400">
                                {bulkActionType === 'STATUS' ? (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    bulkStatusTarget === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : bulkStatusTarget === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {bulkStatusTarget}
                                  </span>
                                ) : bulkActionType === 'CATEGORY' ? (
                                  <span>{bulkCategoryTarget}</span>
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    <span>{nextPrice.toLocaleString()} ETB</span>
                                    {nextPrice !== p.price && (
                                      <span className={`text-[9px] px-1 rounded font-bold ${nextPrice < p.price ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                        ({nextPrice < p.price ? '-' : '+'}{Math.abs(Math.round(((nextPrice - p.price) / p.price) * 100))}%)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 font-bold text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'ሰርዝ'}
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkModal}
                  disabled={bulkIsSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {bulkIsSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {language === 'en' 
                      ? `Confirm Batch Update (${selectedProductIds.length})` 
                      : `ማሻሻያውን አረጋግጥ (${selectedProductIds.length})`}
                  </span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV Batch Product Import Modal */}
      <CsvProductImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        currentMerchant={currentMerchant}
        onAddProduct={onAddProduct}
        onAddAuditLog={onAddAuditLog}
        language={language}
        onSuccessImport={(count) => {
          showLocalToast(
            language === 'en'
              ? `Successfully imported ${count} products into catalog!`
              : `${count} ምርቶች ወደ ካታሎግ በተሳካ ሁኔታ ተመዝግበዋል!`,
            'success'
          );
          setCatalogSubTab('LIST');
        }}
      />

    </div>
  );
}

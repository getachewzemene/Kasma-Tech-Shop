import React, { useState, useMemo } from 'react';
import { Product, Merchant, StockMovementLog, Order } from '../../types';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Clock,
  UserCheck,
  Cpu,
  Package,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  X,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface StockActivityTabProps {
  products: Product[];
  currentMerchant: Merchant;
  stockLogs: StockMovementLog[];
  orders: Order[];
  language: 'en' | 'am';
  onUpdateProductStock?: (productId: string, sku: string, qtyChange: number, reason: string) => void;
  onNavigateToTab?: (tab: 'DASHBOARD' | 'CATALOG' | 'STOCK' | 'STOCK_ACTIVITY' | 'FORECAST' | 'PERFORMANCE' | 'PAYOUT' | 'KYC') => void;
}

export default function StockActivityTab({
  products,
  currentMerchant,
  stockLogs,
  orders,
  language,
  onUpdateProductStock,
  onNavigateToTab
}: StockActivityTabProps) {
  // State variables for search, filtering & sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'MANUAL' | 'AUTOMATED' | 'RESTOCK' | 'DECREMENT'>('ALL');
  const [selectedSku, setSelectedSku] = useState<string>('ALL');
  const [selectedReason, setSelectedReason] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'ALL' | 'TODAY' | '7D' | '30D'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'DIFF_HIGH' | 'DIFF_LOW'>('NEWEST');
  
  // Modal states
  const [selectedLog, setSelectedLog] = useState<StockMovementLog | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Manual Adjustment Form state inside modal
  const [adjProductId, setAdjProductId] = useState('');
  const [adjSku, setAdjSku] = useState('');
  const [adjQty, setAdjQty] = useState<number>(0);
  const [adjReason, setAdjReason] = useState('Manual Inventory Audit Adjustment');
  const [isSubmittingAdj, setIsSubmittingAdj] = useState(false);

  // Filter merchant products & SKUs
  const merchantProducts = useMemo(() => {
    return products.filter(p => p.merchantId === currentMerchant.id);
  }, [products, currentMerchant.id]);

  const allMerchantVariants = useMemo(() => {
    const list: { sku: string; name: string; productNameEn: string; productId: string; image: string }[] = [];
    merchantProducts.forEach(p => {
      p.variants.forEach(v => {
        list.push({
          sku: v.sku,
          name: v.name,
          productNameEn: p.nameEn,
          productId: p.id,
          image: p.image
        });
      });
    });
    return list;
  }, [merchantProducts]);

  // Filter logs belonging to current merchant
  const merchantStockLogs = useMemo(() => {
    return stockLogs.filter(log => {
      // Check if this log SKU belongs to merchant or product matches merchant name
      return allMerchantVariants.some(v => v.sku === log.sku) || 
        merchantProducts.some(p => p.nameEn.toLowerCase() === log.productName.toLowerCase());
    });
  }, [stockLogs, allMerchantVariants, merchantProducts]);

  // Extract unique reason entries from logs for dropdown filter
  const uniqueReasons = useMemo(() => {
    const set = new Set<string>();
    merchantStockLogs.forEach(log => {
      if (log.reason && log.reason.trim()) {
        set.add(log.reason.trim());
      }
    });
    return Array.from(set);
  }, [merchantStockLogs]);

  // Compute Summary KPI Stats
  const kpiStats = useMemo(() => {
    let totalInboundQty = 0;
    let totalInboundCount = 0;
    let totalOutboundQty = 0;
    let totalOutboundCount = 0;
    let manualCount = 0;
    let automatedCount = 0;

    merchantStockLogs.forEach(log => {
      if (log.difference > 0) {
        totalInboundQty += log.difference;
        totalInboundCount++;
      } else if (log.difference < 0) {
        totalOutboundQty += Math.abs(log.difference);
        totalOutboundCount++;
      }

      const isAuto = log.actor.toLowerCase().includes('system') || 
                     log.reason.toLowerCase().includes('auto') || 
                     log.reason.toLowerCase().includes('fulfilment') ||
                     log.reason.toLowerCase().includes('#ord');
      if (isAuto) {
        automatedCount++;
      } else {
        manualCount++;
      }
    });

    return {
      totalLogs: merchantStockLogs.length,
      totalInboundQty,
      totalInboundCount,
      totalOutboundQty,
      totalOutboundCount,
      manualCount,
      automatedCount
    };
  }, [merchantStockLogs]);

  // Quick Date Range Preset helper
  const applyDatePreset = (preset: 'TODAY' | '7D' | '30D' | 'THIS_MONTH' | 'CLEAR') => {
    const now = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'TODAY') {
      const todayStr = formatDate(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
      setTimeframe('ALL');
    } else if (preset === '7D') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      setStartDate(formatDate(d));
      setEndDate(formatDate(now));
      setTimeframe('ALL');
    } else if (preset === '30D') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      setStartDate(formatDate(d));
      setEndDate(formatDate(now));
      setTimeframe('ALL');
    } else if (preset === 'THIS_MONTH') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDate(d));
      setEndDate(formatDate(now));
      setTimeframe('ALL');
    } else if (preset === 'CLEAR') {
      setStartDate('');
      setEndDate('');
      setTimeframe('ALL');
    }
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedSku('ALL');
    setSelectedReason('ALL');
    setStartDate('');
    setEndDate('');
    setTimeframe('ALL');
    setSortBy('NEWEST');
  };

  // Count active filters
  const activeFiltersCount = 
    (searchTerm.trim() ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (selectedSku !== 'ALL' ? 1 : 0) +
    (selectedReason !== 'ALL' ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0) +
    (timeframe !== 'ALL' ? 1 : 0);

  // Filter & Sort stock logs
  const processedLogs = useMemo(() => {
    const now = new Date();

    let list = merchantStockLogs.filter(log => {
      // SKU Filter
      if (selectedSku !== 'ALL' && log.sku !== selectedSku) {
        return false;
      }

      // Reason Filter
      if (selectedReason !== 'ALL') {
        if (!log.reason.toLowerCase().includes(selectedReason.toLowerCase())) {
          return false;
        }
      }

      // Search term (SKU, product name, reason, actor)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesSku = log.sku.toLowerCase().includes(q);
        const matchesProduct = log.productName.toLowerCase().includes(q);
        const matchesReason = log.reason.toLowerCase().includes(q);
        const matchesActor = log.actor.toLowerCase().includes(q);
        if (!matchesSku && !matchesProduct && !matchesReason && !matchesActor) {
          return false;
        }
      }

      // Category filter
      const isAuto = log.actor.toLowerCase().includes('system') || 
                     log.reason.toLowerCase().includes('auto') || 
                     log.reason.toLowerCase().includes('#ord');

      if (selectedCategory === 'MANUAL' && isAuto) return false;
      if (selectedCategory === 'AUTOMATED' && !isAuto) return false;
      if (selectedCategory === 'RESTOCK' && log.difference <= 0) return false;
      if (selectedCategory === 'DECREMENT' && log.difference >= 0) return false;

      // Start Date filter
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00');
        const logDate = new Date(log.timestamp);
        if (!isNaN(start.getTime()) && !isNaN(logDate.getTime()) && logDate < start) {
          return false;
        }
      }

      // End Date filter
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59.999');
        const logDate = new Date(log.timestamp);
        if (!isNaN(end.getTime()) && !isNaN(logDate.getTime()) && logDate > end) {
          return false;
        }
      }

      // Timeframe filter (if no custom start/end date overrides)
      if (!startDate && !endDate && timeframe !== 'ALL') {
        const logDate = new Date(log.timestamp);
        if (!isNaN(logDate.getTime())) {
          const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
          if (timeframe === 'TODAY' && diffDays > 1) return false;
          if (timeframe === '7D' && diffDays > 7) return false;
          if (timeframe === '30D' && diffDays > 30) return false;
        }
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();

      if (sortBy === 'NEWEST') return timeB - timeA;
      if (sortBy === 'OLDEST') return timeA - timeB;
      if (sortBy === 'DIFF_HIGH') return b.difference - a.difference;
      if (sortBy === 'DIFF_LOW') return a.difference - b.difference;
      return 0;
    });

    return list;
  }, [merchantStockLogs, selectedSku, selectedReason, searchTerm, selectedCategory, startDate, endDate, timeframe, sortBy]);

  // Handle Manual Adjustment submit
  const handlePerformAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjProductId || !adjSku || adjQty === 0) {
      alert(language === 'en' ? 'Select a valid product, variant SKU, and non-zero quantity diff.' : 'እባክዎን ትክክለኛ ምርት፣ SKU እና መጠን ያስገቡ።');
      return;
    }

    setIsSubmittingAdj(true);
    if (onUpdateProductStock) {
      onUpdateProductStock(adjProductId, adjSku, adjQty, adjReason);
    }

    setTimeout(() => {
      setIsSubmittingAdj(false);
      setIsAdjustModalOpen(false);
      setAdjQty(0);
      setAdjReason('Manual Inventory Audit Adjustment');
    }, 400);
  };

  // CSV Audit Log Exporter
  const exportAuditCsv = () => {
    const headers = ['Log ID', 'Timestamp (UTC)', 'SKU Code', 'Product Name', 'Previous Qty', 'New Qty', 'Difference', 'Action Type', 'Reason / Reference', 'Actor / Operator'];
    const rows = processedLogs.map(log => {
      const isAuto = log.actor.toLowerCase().includes('system') || log.reason.toLowerCase().includes('auto');
      const actionType = log.difference > 0 ? 'RESTOCK_INBOUND' : isAuto ? 'AUTOMATED_SALE_DECREMENT' : 'MANUAL_ADJUSTMENT';

      return [
        log.id,
        `"${log.timestamp}"`,
        `"${log.sku}"`,
        `"${log.productName.replace(/"/g, '""')}"`,
        log.previousQty,
        log.newQty,
        log.difference > 0 ? `+${log.difference}` : log.difference,
        actionType,
        `"${log.reason.replace(/"/g, '""')}"`,
        `"${log.actor.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kasma_stock_activity_audit_${currentMerchant.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Audit Report
  const handlePrintAuditTrail = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {language === 'en' ? 'Stock Ledger & Audit Trail' : 'የኦዲት እና እንቅስቃሴ መዝገብ'}
              </span>
              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {processedLogs.length} {language === 'en' ? 'Audit Entries' : 'የተመዘገቡ እንቅስቃሴዎች'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <History className="w-6 h-6 text-[#0052FF]" />
              {language === 'en' ? 'Stock Activity & Movement Log' : 'የክምችት እንቅስቃሴ እና የታሪክ ኦዲት'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium max-w-2xl">
              {language === 'en'
                ? 'Comprehensive real-time ledger of all historical manual stock adjustments, automated order sales decrements, restocks, and cycle counts sorted chronologically.'
                : 'በእጅ የተደረጉ የክምችት ማሻሻያዎች፣ የራስ-ሰር የትዕዛዝ ሽያጭ ቅናሾች እና የዕቃ ግዢዎች ሙሉ ታሪክ መዝገብ።'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Action: Execute Adjustment Modal Trigger */}
            <button
              onClick={() => setIsAdjustModalOpen(true)}
              className="bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'en' ? 'Record Adjustment' : 'ማስተካከያ መዝግብ'}</span>
            </button>

            {/* Action: Export CSV */}
            <button
              onClick={exportAuditCsv}
              className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-extrabold text-xs px-3.5 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>{language === 'en' ? 'Export CSV' : 'ኦዲት አውርድ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Movements */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-2 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              {language === 'en' ? 'Total Audit Records' : 'ጠቅላላ የኦዲት መዝገብ'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {kpiStats.totalLogs} <span className="text-xs font-semibold text-gray-400">{language === 'en' ? 'events' : 'ክስተቶች'}</span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-semibold pt-1">
              {kpiStats.manualCount} {language === 'en' ? 'manual' : 'በእጅ'} • {kpiStats.automatedCount} {language === 'en' ? 'auto' : 'በሲስተም'}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0052FF] to-blue-400" />
        </div>

        {/* KPI 2: Total Restock Inbound */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-2 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              {language === 'en' ? 'Total Restock Additions (+)' : 'አጠቃላይ የተጨመረ ክምችት (+)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              +{kpiStats.totalInboundQty.toLocaleString()} <span className="text-xs font-semibold text-gray-400">pcs</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              {language === 'en' ? 'Across' : 'በ'} {kpiStats.totalInboundCount} {language === 'en' ? 'restock events' : 'የእቃ መሙላት ክስተቶች'}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* KPI 3: Total Outbound Sales / Decrements */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-2 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              {language === 'en' ? 'Total Sales Outbound (-)' : 'አጠቃላይ የተሸጠ / የተቀነሰ (-)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-red-600 dark:text-red-400 font-mono tracking-tight">
              -{kpiStats.totalOutboundQty.toLocaleString()} <span className="text-xs font-semibold text-gray-400">pcs</span>
            </h3>
            <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold pt-1">
              {language === 'en' ? 'Across' : 'በ'} {kpiStats.totalOutboundCount} {language === 'en' ? 'fulfillment sales' : 'የሽያጭ ቅናሾች'}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-amber-500" />
        </div>

        {/* KPI 4: Audit Integrity Status */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-2 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              {language === 'en' ? 'Audit Ledger Health' : 'የኦዲት መዝገብ ሁኔታ'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{language === 'en' ? 'Verified 100%' : 'የተረጋገጠ 100%'}</span>
            </h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold pt-1">
              {language === 'en' ? 'Zero unrecorded discrepancy' : 'ምንም የጠፋ ወይም ያልተመዘገበ የለም'}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-500" />
        </div>

      </div>

      {/* Main Stock Activity Audit Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-xs">
        
        {/* Table Filters & Toolbar */}
        <div className="space-y-4 border-b border-gray-100 dark:border-zinc-800 pb-5">
          
          {/* Row 1: Primary Search, Reason Filter, SKU & Movement Type Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search Input */}
              <div className="relative min-w-[240px] flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search reason, SKU, product, actor...' : 'ምክንያት፣ SKU፣ ምርት፣ ተዋናይ ፈልግ...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white p-0.5 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Reason Dropdown Filter */}
              <div className="relative min-w-[180px]">
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                >
                  <option value="ALL">{language === 'en' ? 'Filter by Reason (All)' : 'በምክንያት አጣራ (ሁሉም)'}</option>
                  <option value="Manual Inventory Audit">{language === 'en' ? 'Audit Adjustment' : 'የክምችት ኦዲት ማስተካከያ'}</option>
                  <option value="Order Sales Fulfillment">{language === 'en' ? 'Sales Order Decrement' : 'የትዕዛዝ ሽያጭ'}</option>
                  <option value="Restock">{language === 'en' ? 'Restock / Inbound' : 'የክምችት ጭማሪ'}</option>
                  {uniqueReasons.map(r => (
                    <option key={r} value={r}>
                      {r.length > 35 ? r.substring(0, 35) + '...' : r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter Pills */}
              <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl flex items-center text-[11px] font-bold">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {language === 'en' ? 'All' : 'ሁሉንም'}
                </button>
                <button
                  onClick={() => setSelectedCategory('RESTOCK')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === 'RESTOCK'
                      ? 'bg-white dark:bg-zinc-950 text-emerald-600 shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {language === 'en' ? 'Restocks (+)' : 'ተጨመረ (+)'}
                </button>
                <button
                  onClick={() => setSelectedCategory('DECREMENT')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === 'DECREMENT'
                      ? 'bg-white dark:bg-zinc-950 text-red-600 shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {language === 'en' ? 'Sales (-)' : 'ተቀነሰ (-)'}
                </button>
                <button
                  onClick={() => setSelectedCategory('MANUAL')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === 'MANUAL'
                      ? 'bg-white dark:bg-zinc-950 text-purple-600 shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {language === 'en' ? 'Manual' : 'በእጅ'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* SKU Selector Dropdown */}
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="px-3 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              >
                <option value="ALL">{language === 'en' ? 'Filter by All SKUs' : 'ሁሉም SKU'}</option>
                {allMerchantVariants.map(v => (
                  <option key={v.sku} value={v.sku}>
                    {v.sku} - {v.productNameEn}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Row 2: Date Range Controls & Presets */}
          <div className="bg-gray-50/80 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Start & End Date Pickers */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700 dark:text-zinc-300">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider pr-1">
                <Calendar className="w-3.5 h-3.5 text-[#0052FF]" />
                <span>{language === 'en' ? 'Date Range:' : 'የቀን ገደብ:'}</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setTimeframe('ALL');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF]"
                />
                <span className="text-gray-400 font-bold">➔</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setTimeframe('ALL');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              {/* Quick Range Presets */}
              <div className="flex items-center gap-1 pl-1">
                <button
                  type="button"
                  onClick={() => applyDatePreset('TODAY')}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Today' : 'ዛሬ'}
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('7D')}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all cursor-pointer"
                >
                  7D
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('30D')}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all cursor-pointer"
                >
                  30D
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset('THIS_MONTH')}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all cursor-pointer"
                >
                  {language === 'en' ? 'This Month' : 'በዚህ ወር'}
                </button>
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => applyDatePreset('CLEAR')}
                    className="px-2 py-1 rounded-lg text-[10px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>{language === 'en' ? 'Clear' : 'አጥፋ'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Timeframe Select & Sort Toggle */}
            <div className="flex items-center gap-2">
              <select
                value={timeframe}
                onChange={(e) => {
                  setTimeframe(e.target.value as any);
                  if (e.target.value !== 'ALL') {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF]"
              >
                <option value="ALL">{language === 'en' ? 'All Time Preset' : 'ሁሉንም ጊዜ'}</option>
                <option value="TODAY">{language === 'en' ? 'Last 24 Hours' : 'የመጨረሻ 24 ሰዓታት'}</option>
                <option value="7D">{language === 'en' ? 'Last 7 Days' : 'የመጨረሻ 7 ቀናት'}</option>
                <option value="30D">{language === 'en' ? 'Last 30 Days' : 'የመጨረሻ 30 ቀናት'}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#0052FF]"
              >
                <option value="NEWEST">{language === 'en' ? 'Sort: Newest First' : 'ቀን፡ ከአዲሱ ጀምሮ'}</option>
                <option value="OLDEST">{language === 'en' ? 'Sort: Oldest First' : 'ቀን፡ ከቀደመው ጀምሮ'}</option>
                <option value="DIFF_HIGH">{language === 'en' ? 'Quantity: Highest +' : 'መጠን፡ ከፍተኛ +'}</option>
                <option value="DIFF_LOW">{language === 'en' ? 'Quantity: Highest -' : 'መጠን፡ ከፍተኛ -'}</option>
              </select>
            </div>

          </div>

          {/* Active Filter Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 px-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  {language === 'en' ? 'Active Filters:' : 'ተግባራዊ የተደረጉ ማጣሪያዎች:'}
                </span>

                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 text-[#0052FF] dark:text-blue-400 px-2.5 py-1 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900/50">
                    <span>{language === 'en' ? 'Search:' : 'ፍለጋ:'} "{searchTerm}"</span>
                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedReason !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-xl text-xs font-bold border border-purple-200 dark:border-purple-900/50">
                    <span>{language === 'en' ? 'Reason:' : 'ምክንያት:'} {selectedReason}</span>
                    <button onClick={() => setSelectedReason('ALL')} className="hover:text-purple-900 dark:hover:text-purple-100 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(startDate || endDate) && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-900/50">
                    <span>📅 {startDate || '...'} ➔ {endDate || '...'}</span>
                    <button onClick={() => { setStartDate(''); setEndDate(''); }} className="hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedSku !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-900/50">
                    <span>SKU: {selectedSku}</span>
                    <button onClick={() => setSelectedSku('ALL')} className="hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCategory !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-900/50">
                    <span>{language === 'en' ? 'Category:' : 'አይነት:'} {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('ALL')} className="hover:text-indigo-900 dark:hover:text-indigo-100 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 font-mono">
                  {language === 'en' ? `Showing ${processedLogs.length} of ${merchantStockLogs.length} entries` : `${processedLogs.length} ከ ${merchantStockLogs.length} ውጤቶች ታይተዋል`}
                </span>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-black text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                >
                  {language === 'en' ? 'Reset All Filters' : 'ሁሉንም ማጣሪያዎች አጽዳ'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                <th className="py-3 px-3">{language === 'en' ? 'Timestamp & Date' : 'ቀን እና ሰዓት'}</th>
                <th className="py-3 px-3">{language === 'en' ? 'Product & SKU' : 'ምርት እና SKU'}</th>
                <th className="py-3 px-3">{language === 'en' ? 'Adjustment Type' : 'የማስተካከያ አይነት'}</th>
                <th className="py-3 px-3 text-right">{language === 'en' ? 'Delta' : 'ለውጥ'}</th>
                <th className="py-3 px-3 text-right">{language === 'en' ? 'Previous ➔ New' : 'የነበረው ➔ አዲስ'}</th>
                <th className="py-3 px-3">{language === 'en' ? 'Reason / Reference' : 'ምክንያት / ማጣቀሻ'}</th>
                <th className="py-3 px-3">{language === 'en' ? 'Actor / Initiator' : 'ተዋናይ / አካል'}</th>
                <th className="py-3 px-3 text-center">{language === 'en' ? 'Audit' : 'ዝርዝር'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 font-medium">
              {processedLogs.map((log) => {
                const isAuto = log.actor.toLowerCase().includes('system') || 
                               log.reason.toLowerCase().includes('auto') || 
                               log.reason.toLowerCase().includes('#ord');
                const isPositive = log.difference > 0;
                
                // Match image from merchant product catalog
                const matchingVariant = allMerchantVariants.find(v => v.sku === log.sku);

                return (
                  <tr key={log.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-gray-900 dark:text-white text-[11px]">
                        {new Date(log.timestamp).toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    {/* Product & SKU */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        {matchingVariant?.image ? (
                          <img 
                            src={matchingVariant.image} 
                            alt={log.productName} 
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-zinc-800 shrink-0" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]" title={log.productName}>
                            {log.productName}
                          </p>
                          <span className="inline-block font-mono text-[9.5px] font-extrabold text-[#0052FF] bg-[#0052FF]/10 px-1.5 py-0.5 rounded">
                            {log.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Adjustment Type Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {isPositive ? (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>{language === 'en' ? 'Restock Addition' : 'ተጨመረ'}</span>
                        </span>
                      ) : isAuto ? (
                        <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                          <ArrowDownRight className="w-3 h-3" />
                          <span>{language === 'en' ? 'Order Fulfillment' : 'የሽያጭ ቅናሽ'}</span>
                        </span>
                      ) : (
                        <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                          <UserCheck className="w-3 h-3" />
                          <span>{language === 'en' ? 'Manual Audit' : 'በእጅ ተስተካከለ'}</span>
                        </span>
                      )}
                    </td>

                    {/* Delta */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span className={`font-mono font-black text-xs ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isPositive ? `+${log.difference}` : log.difference} pcs
                      </span>
                    </td>

                    {/* Previous -> New */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-xs">
                      <span className="text-gray-400">{log.previousQty}</span>
                      <span className="text-gray-300 dark:text-zinc-600 mx-1">➔</span>
                      <span className="font-bold text-gray-900 dark:text-white">{log.newQty} pcs</span>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-3 max-w-[220px]">
                      <p className="text-xs text-gray-800 dark:text-zinc-200 truncate font-medium" title={log.reason}>
                        {log.reason}
                      </p>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-400 font-semibold">
                        {isAuto ? (
                          <Cpu className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span className="truncate max-w-[130px]">{log.actor}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="View Detailed Log Card"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}

              {processedLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                    <History className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-zinc-700" />
                    <p>{language === 'en' ? 'No stock movement logs match your current filter.' : 'ምንም የክምችት እንቅስቃሴ አልተገኘም።'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0052FF]" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  {language === 'en' ? 'Stock Audit Record Detail' : 'የክምችት ኦዲት መዝገብ ዝርዝር'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-200/50 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  <span>Log Reference ID: {selectedLog.id}</span>
                  <span>{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <h4 className="font-black text-sm text-gray-900 dark:text-white">{selectedLog.productName}</h4>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded">
                    SKU: {selectedLog.sku}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 dark:bg-zinc-950 p-3 rounded-2xl border border-gray-200/50 dark:border-zinc-800">
                  <span className="text-[9px] font-extrabold uppercase text-gray-400 block">Previous Stock</span>
                  <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{selectedLog.previousQty} pcs</span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-950 p-3 rounded-2xl border border-gray-200/50 dark:border-zinc-800">
                  <span className="text-[9px] font-extrabold uppercase text-gray-400 block">Quantity Delta</span>
                  <span className={`font-mono font-black text-sm ${selectedLog.difference > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedLog.difference > 0 ? `+${selectedLog.difference}` : selectedLog.difference} pcs
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-950 p-3 rounded-2xl border border-gray-200/50 dark:border-zinc-800">
                  <span className="text-[9px] font-extrabold uppercase text-gray-400 block">New Ledger Stock</span>
                  <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{selectedLog.newQty} pcs</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">Reason Description</span>
                  <p className="font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-950 p-3 rounded-xl border border-gray-200/50 dark:border-zinc-800">
                    {selectedLog.reason}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block">Executing Actor / Source</span>
                  <p className="font-semibold text-gray-700 dark:text-zinc-300">
                    {selectedLog.actor}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-gray-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                {language === 'en' ? 'Close Window' : 'ዝጋ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Trigger Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#0052FF]" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  {language === 'en' ? 'Record Stock Adjustment Transaction' : 'የክምችት ማስተካከያ መዝግብ'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePerformAdjustment} className="space-y-4 text-xs">
              
              {/* Product Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">
                  {language === 'en' ? 'Select Merchant Product' : 'ምርቱን ይምረጡ'}
                </label>
                <select
                  value={adjProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setAdjProductId(pid);
                    const prod = merchantProducts.find(p => p.id === pid);
                    if (prod && prod.variants.length > 0) {
                      setAdjSku(prod.variants[0].sku);
                    } else {
                      setAdjSku('');
                    }
                  }}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                >
                  <option value="">{language === 'en' ? '-- Select Product --' : '-- ምርት ይምረጡ --'}</option>
                  {merchantProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.nameEn}</option>
                  ))}
                </select>
              </div>

              {/* SKU Selection */}
              {adjProductId && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">
                    {language === 'en' ? 'Select Variant SKU' : 'SKU ይምረጡ'}
                  </label>
                  <select
                    value={adjSku}
                    onChange={(e) => setAdjSku(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                  >
                    {merchantProducts.find(p => p.id === adjProductId)?.variants.map(v => (
                      <option key={v.sku} value={v.sku}>
                        {v.sku} - {v.name} (Current: {v.onHand} pcs)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity Diff Offset */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">
                  {language === 'en' ? 'Quantity Adjustment Offset (+ or -)' : 'የመጠን ማስተካከያ (አዎንታዊ ወይም አሉታዊ)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjQty}
                    onChange={(e) => setAdjQty(Number(e.target.value))}
                    required
                    placeholder="+10 or -2"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 font-mono font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAdjQty(10)}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-lg hover:bg-emerald-100"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjQty(-1)}
                      className="px-2.5 py-1 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100"
                    >
                      -1
                    </button>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">
                  {language === 'en' ? 'Adjustment Audit Reason' : 'የማስተካከያው ምክንያት'}
                </label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  required
                  placeholder="e.g. Supplier Air Freight Restock Batch #2"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-500 font-extrabold hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'ሰርዝ'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdj || !adjProductId || !adjSku || adjQty === 0}
                  className="bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdj ? 'Recording...' : language === 'en' ? 'Submit Stock Adjustment' : 'ማስተካከያውን አስገባ'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

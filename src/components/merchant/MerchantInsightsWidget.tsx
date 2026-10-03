import React, { useState, useMemo } from 'react';
import { Product, Merchant, Order } from '../../types';
import {
  TrendingUp,
  BarChart3,
  Award,
  Package,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Filter,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';

interface MerchantInsightsWidgetProps {
  products: Product[];
  currentMerchant: Merchant;
  orders: Order[];
  language: 'en' | 'am';
}

export default function MerchantInsightsWidget({
  products,
  currentMerchant,
  orders,
  language
}: MerchantInsightsWidgetProps) {
  // View mode & metric state
  const [metricType, setMetricType] = useState<'UNITS' | 'REVENUE'>('UNITS');
  const [viewTab, setViewTab] = useState<'ALL' | 'DAILY_TREND' | 'TOP_SKUS'>('ALL');
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0); // 0 = Current Month, -1 = Previous Month
  const [searchSKU, setSearchSKU] = useState<string>('');

  // Target merchant products
  const merchantProducts = useMemo(() => {
    return products.filter(p => p.merchantId === currentMerchant.id);
  }, [products, currentMerchant.id]);

  // Target month calculations
  const monthInfo = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedMonthOffset);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
    
    // Total days in target month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const monthName = d.toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', {
      month: 'long',
      year: 'numeric'
    });

    const isCurrentMonth = selectedMonthOffset === 0;
    const currentDayOfMonth = isCurrentMonth ? new Date().getDate() : totalDays;

    return {
      year,
      month,
      totalDays,
      monthName,
      isCurrentMonth,
      currentDayOfMonth
    };
  }, [selectedMonthOffset, language]);

  // 1. Daily Sales Volume & Revenue Data for the target month
  const dailySalesData = useMemo(() => {
    const { year, month, totalDays, currentDayOfMonth } = monthInfo;
    const baseSalesFactor = currentMerchant.id === 'm1' ? 1.4 : currentMerchant.id === 'm2' ? 0.85 : currentMerchant.id === 'm3' ? 2.2 : 0.6;

    // Collect all SKUs for merchant
    const allMerchantSKUs = merchantProducts.flatMap(p => 
      p.variants.map(v => ({ sku: v.sku, name: v.name, productName: p.nameEn, price: p.price + v.priceOffset }))
    );

    const data = [];

    for (let day = 1; day <= totalDays; day++) {
      // Build ISO date standard YYYY-MM-DD
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Filter real orders for this merchant on this day
      const dayOrders = orders.filter(order => {
        const orderDate = order.createdAt.split('T')[0];
        const hasMerchantItem = order.items.some(item => item.product.merchantId === currentMerchant.id);
        return orderDate === dateStr && hasMerchantItem;
      });

      let actualUnits = 0;
      let actualRevenue = 0;
      let actualOrderCount = dayOrders.length;
      const skuCounts: Record<string, number> = {};

      dayOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.product.merchantId === currentMerchant.id) {
            actualUnits += item.quantity;
            actualRevenue += item.price * item.quantity;
            skuCounts[item.sku] = (skuCounts[item.sku] || 0) + item.quantity;
          }
        });
      });

      // Realistic baseline seed data generation so charts look vivid even with sparse mock orders
      const dayOfWeek = new Date(year, month, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMult = isWeekend ? 1.45 : 0.92;
      const wave = Math.sin(day / 3.2) * 0.25 + Math.cos(day / 7.0) * 0.15 + 1.0;
      const randomSeed = Math.sin(day * 13 + month * 5) * 0.2 + 1.0;

      const baseUnits = Math.max(1, Math.round(12 * baseSalesFactor * weekendMult * wave * randomSeed));
      const avgItemPrice = currentMerchant.id === 'm3' ? 1450 : currentMerchant.id === 'm1' ? 18500 : 3200;
      const baseRev = Math.round(baseUnits * avgItemPrice);
      const baseOrders = Math.max(1, Math.round(baseUnits / 1.6));

      // Don't generate future data for current month
      const isFutureDay = monthInfo.isCurrentMonth && day > currentDayOfMonth;

      const finalUnits = isFutureDay ? 0 : (actualUnits > 0 ? actualUnits : baseUnits);
      const finalRevenue = isFutureDay ? 0 : (actualRevenue > 0 ? actualRevenue : baseRev);
      const finalOrders = isFutureDay ? 0 : (actualOrderCount > 0 ? actualOrderCount : baseOrders);

      // Find top SKU of the day
      let topSkuCode = allMerchantSKUs[day % (allMerchantSKUs.length || 1)]?.sku || 'N/A';
      if (Object.keys(skuCounts).length > 0) {
        topSkuCode = Object.keys(skuCounts).reduce((a, b) => skuCounts[a] > skuCounts[b] ? a : b);
      }

      data.push({
        day,
        dateStr,
        formattedDate: new Date(year, month, day).toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', {
          month: 'short',
          day: 'numeric'
        }),
        shortDay: `${day}`,
        unitsSold: finalUnits,
        revenue: finalRevenue,
        orderCount: finalOrders,
        topSkuOfToday: topSkuCode,
        isFutureDay
      });
    }

    return data;
  }, [monthInfo, currentMerchant.id, merchantProducts, orders, language]);

  // Month totals from daily data
  const monthTotals = useMemo(() => {
    const activeDays = dailySalesData.filter(d => !d.isFutureDay);
    const totalUnits = activeDays.reduce((sum, d) => sum + d.unitsSold, 0);
    const totalRevenue = activeDays.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = activeDays.reduce((sum, d) => sum + d.orderCount, 0);
    const avgDailyUnits = activeDays.length > 0 ? Math.round(totalUnits / activeDays.length) : 0;
    const avgDailyRevenue = activeDays.length > 0 ? Math.round(totalRevenue / activeDays.length) : 0;

    return {
      totalUnits,
      totalRevenue,
      totalOrders,
      avgDailyUnits,
      avgDailyRevenue,
      activeDaysCount: activeDays.length
    };
  }, [dailySalesData]);

  // 2. Top-Performing SKUs calculation for current month
  const topSKUsPerformance = useMemo(() => {
    const skuMap: Record<string, {
      sku: string;
      variantName: string;
      productNameEn: string;
      productNameAm: string;
      productId: string;
      category: string;
      unitPrice: number;
      onHand: number;
      lowThreshold: number;
      unitsSoldMonth: number;
      revenueMonth: number;
      orderCountMonth: number;
    }> = {};

    // Initialize map from merchant variants
    merchantProducts.forEach(p => {
      p.variants.forEach(v => {
        const fullPrice = p.price + v.priceOffset;
        skuMap[v.sku] = {
          sku: v.sku,
          variantName: v.name,
          productNameEn: p.nameEn,
          productNameAm: p.nameAm,
          productId: p.id,
          category: p.category,
          unitPrice: fullPrice,
          onHand: v.onHand,
          lowThreshold: p.lowStockThreshold,
          unitsSoldMonth: 0,
          revenueMonth: 0,
          orderCountMonth: 0
        };
      });
    });

    // Populate actual order volumes for current month
    const activeDaysDateStrs = new Set(dailySalesData.filter(d => !d.isFutureDay).map(d => d.dateStr));

    orders.forEach(order => {
      const orderDateStr = order.createdAt.split('T')[0];
      if (activeDaysDateStrs.has(orderDateStr)) {
        order.items.forEach(item => {
          if (item.product.merchantId === currentMerchant.id && skuMap[item.sku]) {
            skuMap[item.sku].unitsSoldMonth += item.quantity;
            skuMap[item.sku].revenueMonth += item.price * item.quantity;
            skuMap[item.sku].orderCountMonth += 1;
          }
        });
      }
    });

    // Seed realistic fallback volume distribution if zero orders were logged in mock state
    const allSKUList = Object.values(skuMap);
    const hasAnyRealOrder = allSKUList.some(s => s.unitsSoldMonth > 0);

    if (!hasAnyRealOrder && allSKUList.length > 0) {
      allSKUList.forEach((s, idx) => {
        // Generate a proportional distribution of monthly sales per SKU
        const rankWeight = Math.pow(0.72, idx);
        const seededUnits = Math.max(3, Math.round((monthTotals.totalUnits * rankWeight * 0.4)));
        s.unitsSoldMonth = seededUnits;
        s.revenueMonth = seededUnits * s.unitPrice;
        s.orderCountMonth = Math.max(1, Math.round(seededUnits / 1.5));
      });
    }

    // Filter by search query if present
    let filteredList = allSKUList;
    if (searchSKU.trim()) {
      const q = searchSKU.toLowerCase();
      filteredList = filteredList.filter(s =>
        s.sku.toLowerCase().includes(q) ||
        s.productNameEn.toLowerCase().includes(q) ||
        s.variantName.toLowerCase().includes(q)
      );
    }

    // Sort descending by selected metric
    filteredList.sort((a, b) => {
      if (metricType === 'UNITS') {
        return b.unitsSoldMonth - a.unitsSoldMonth;
      }
      return b.revenueMonth - a.revenueMonth;
    });

    // Total monthly volume across all SKUs for % share calculations
    const grandUnits = allSKUList.reduce((sum, s) => sum + s.unitsSoldMonth, 0) || 1;
    const grandRev = allSKUList.reduce((sum, s) => sum + s.revenueMonth, 0) || 1;

    return filteredList.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      volumeSharePct: Number(((item.unitsSoldMonth / grandUnits) * 100).toFixed(1)),
      revenueSharePct: Number(((item.revenueMonth / grandRev) * 100).toFixed(1)),
      isLowStock: item.onHand <= item.lowThreshold
    }));
  }, [merchantProducts, dailySalesData, orders, currentMerchant.id, monthTotals.totalUnits, searchSKU, metricType]);

  const topPerformingSKU = topSKUsPerformance[0] || null;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,SKU,Product Name,Variant,Price (ETB),Units Sold (Month),Revenue (ETB),Volume Share (%)\n";
    
    topSKUsPerformance.forEach(sku => {
      csvContent += `${sku.rank},"${sku.sku}","${sku.productNameEn}","${sku.variantName}",${sku.unitPrice},${sku.unitsSoldMonth},${sku.revenueMonth},${sku.volumeSharePct}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Merchant_Insights_${currentMerchant.id}_${monthInfo.monthName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm relative overflow-hidden transition-all">
      
      {/* Decorative top ambient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0052FF] via-emerald-500 to-[#C5A059]" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 dark:border-zinc-800/80 pb-5 pt-1">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#0052FF]/10 text-[#0052FF] dark:bg-[#0052FF]/20 dark:text-blue-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                {language === 'en' ? 'Merchant Insights' : 'የነጋዴ ትንተናዎች'}
                <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {monthInfo.monthName}
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                {language === 'en'
                  ? 'Daily sales volume tracking & top-performing SKU leaderboards for the current month'
                  : 'የወሩ የእለት ተእለት የሽያጭ መጠን እና በከፍተኛ ሁኔታ የተሸጡ SKUs መከታተያ ማዕከል'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Month Selector */}
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setSelectedMonthOffset(0)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMonthOffset === 0
                  ? 'bg-white dark:bg-zinc-900 text-[#0052FF] dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {language === 'en' ? 'Current Month' : 'ወቅታዊ ወር'}
            </button>
            <button
              onClick={() => setSelectedMonthOffset(-1)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMonthOffset === -1
                  ? 'bg-white dark:bg-zinc-900 text-[#0052FF] dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {language === 'en' ? 'Prev Month' : 'ያለፈው ወር'}
            </button>
          </div>

          {/* Metric Selector (Units vs Revenue) */}
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setMetricType('UNITS')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                metricType === 'UNITS'
                  ? 'bg-[#0052FF] text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              {language === 'en' ? 'Sales Volume (Units)' : 'የሽያጭ መጠን (እቃዎች)'}
            </button>
            <button
              onClick={() => setMetricType('REVENUE')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                metricType === 'REVENUE'
                  ? 'bg-[#0052FF] text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              {language === 'en' ? 'Revenue (ETB)' : 'ጠቅላላ ገቢ (ብር)'}
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download Insights CSV Report"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">{language === 'en' ? 'Export CSV' : 'ሪፖርት አውርድ'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Sales Volume Card */}
        <div className="bg-gray-50/70 dark:bg-zinc-850/40 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl relative overflow-hidden space-y-2">
          <div className="flex justify-between items-center text-gray-400 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              {language === 'en' ? 'Monthly Sales Volume' : 'የወሩ አጠቃላይ የሽያጭ መጠን'}
            </span>
            <span className="p-1.5 bg-[#0052FF]/10 text-[#0052FF] rounded-lg">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {monthTotals.totalUnits.toLocaleString()} <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-medium">units</span>
            </p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +18.4%
            </span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500">
            {language === 'en' ? 'Daily Avg: ' : 'የእለት አማካይ፡ '}
            <strong className="text-gray-700 dark:text-zinc-300 font-mono">{monthTotals.avgDailyUnits} units/day</strong>
          </p>
        </div>

        {/* Monthly Gross Revenue Card */}
        <div className="bg-gray-50/70 dark:bg-zinc-850/40 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl relative overflow-hidden space-y-2">
          <div className="flex justify-between items-center text-gray-400 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              {language === 'en' ? 'Monthly Gross Revenue' : 'የወሩ ጠቅላላ ገቢ'}
            </span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {monthTotals.totalRevenue.toLocaleString()} <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-medium">ETB</span>
            </p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +22.1%
            </span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500">
            {language === 'en' ? 'Daily Avg: ' : 'የእለት አማካይ፡ '}
            <strong className="text-gray-700 dark:text-zinc-300 font-mono">{monthTotals.avgDailyRevenue.toLocaleString()} ETB</strong>
          </p>
        </div>

        {/* Top SKU Highlight Card */}
        <div className="bg-gray-50/70 dark:bg-zinc-850/40 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl relative overflow-hidden space-y-2">
          <div className="flex justify-between items-center text-gray-400 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              {language === 'en' ? 'Top SKU of Month' : 'የወሩ ከፍተኛ ተፈላጊ SKU'}
            </span>
            <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 dark:text-white truncate font-mono">
              {topPerformingSKU ? topPerformingSKU.sku : 'N/A'}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
              {topPerformingSKU ? topPerformingSKU.productNameEn : 'No sales'}
            </p>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-zinc-500 pt-1 border-t border-gray-200/50 dark:border-zinc-800">
            <span>{language === 'en' ? 'Volume Share:' : 'የድርሻ መጠን፡'}</span>
            <strong className="text-amber-600 dark:text-amber-400 font-mono">{topPerformingSKU ? `${topPerformingSKU.volumeSharePct}%` : '0%'}</strong>
          </div>
        </div>

        {/* Active Order Count Card */}
        <div className="bg-gray-50/70 dark:bg-zinc-850/40 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl relative overflow-hidden space-y-2">
          <div className="flex justify-between items-center text-gray-400 dark:text-zinc-500">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">
              {language === 'en' ? 'Completed Orders' : 'የተከናወኑ ትዕዛዞች'}
            </span>
            <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {monthTotals.totalOrders} <span className="text-xs font-sans text-gray-500 dark:text-zinc-400 font-medium">checkouts</span>
            </p>
            <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 bg-gray-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              {monthInfo.currentDayOfMonth} days
            </span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500">
            {language === 'en' ? 'Basket Size: ' : 'አማካይ በክፍያ፡ '}
            <strong className="text-gray-700 dark:text-zinc-300 font-mono">
              {(monthTotals.totalUnits / (monthTotals.totalOrders || 1)).toFixed(1)} items
            </strong>
          </p>
        </div>

      </div>

      {/* Sub-View Tabs Switcher */}
      <div className="flex border-b border-gray-100 dark:border-zinc-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setViewTab('ALL')}
          className={`pb-3 transition-all cursor-pointer relative ${
            viewTab === 'ALL'
              ? 'text-[#0052FF] dark:text-white border-b-2 border-[#0052FF]'
              : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300'
          }`}
        >
          {language === 'en' ? 'Combined Overview' : 'አጠቃላይ እይታ'}
        </button>
        <button
          onClick={() => setViewTab('DAILY_TREND')}
          className={`pb-3 transition-all cursor-pointer relative ${
            viewTab === 'DAILY_TREND'
              ? 'text-[#0052FF] dark:text-white border-b-2 border-[#0052FF]'
              : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300'
          }`}
        >
          {language === 'en' ? 'Daily Sales Volume Chart' : 'የእለት የሽያጭ መጠን ገበታ'}
        </button>
        <button
          onClick={() => setViewTab('TOP_SKUS')}
          className={`pb-3 transition-all cursor-pointer relative ${
            viewTab === 'TOP_SKUS'
              ? 'text-[#0052FF] dark:text-white border-b-2 border-[#0052FF]'
              : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300'
          }`}
        >
          {language === 'en' ? 'Top-Performing SKUs Leaderboard' : 'የከፍተኛ SKUs ዝርዝር መሪዎች'}
        </button>
      </div>

      {/* SECTION 1: DAILY SALES VOLUME CHART */}
      {(viewTab === 'ALL' || viewTab === 'DAILY_TREND') && (
        <div className="bg-gray-50/50 dark:bg-zinc-850/20 border border-gray-150 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0052FF]" />
                {language === 'en'
                  ? `Daily ${metricType === 'UNITS' ? 'Sales Volume (Units)' : 'Revenue (ETB)'} — ${monthInfo.monthName}`
                  : `የእለት ${metricType === 'UNITS' ? 'የሽያጭ መጠን (በእቃዎች)' : 'የሽያጭ ገቢ (በብር)'} — ${monthInfo.monthName}`}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                {language === 'en'
                  ? 'Day-by-day sales velocity across all inventory variants in the current month'
                  : 'በወቅታዊው ወር የእለት ተእለት የሽያጭ ፍጥነት መከታተያ'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0052FF]" />
                {metricType === 'UNITS' ? 'Daily Units Sold' : 'Daily Revenue'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-amber-500" />
                {language === 'en' ? 'Daily Average' : 'የእለት አማካይ'}
              </span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySalesData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="insightsSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0052FF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-zinc-800/60" />
                <XAxis 
                  dataKey="shortDay" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => metricType === 'REVENUE' ? `${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}` : `${val}`}
                  tick={{ fill: '#888888', fontSize: 10, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c0d0e', 
                    border: '1px solid #27272a', 
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontFamily: 'sans-serif'
                  }}
                  formatter={(value: any, name: any) => [
                    metricType === 'UNITS' ? `${value} units` : `${Number(value).toLocaleString()} ETB`,
                    metricType === 'UNITS' ? (language === 'en' ? 'Units Sold' : 'የተሸጡ እቃዎች') : (language === 'en' ? 'Revenue' : 'ገቢ')
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return `${d.formattedDate} • ${d.topSkuOfToday !== 'N/A' ? 'Top SKU: ' + d.topSkuOfToday : ''}`;
                    }
                    return `Day ${label}`;
                  }}
                />
                <ReferenceLine 
                  y={metricType === 'UNITS' ? monthTotals.avgDailyUnits : monthTotals.avgDailyRevenue} 
                  stroke="#C5A059" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                />
                <Area 
                  type="monotone" 
                  dataKey={metricType === 'UNITS' ? 'unitsSold' : 'revenue'} 
                  stroke="#0052FF" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#insightsSalesGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SECTION 2: TOP-PERFORMING SKUS VISUALIZATION & LEADERBOARD */}
      {(viewTab === 'ALL' || viewTab === 'TOP_SKUS') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                {language === 'en' ? 'Top-Performing SKUs Breakdown' : 'ከፍተኛ ተፈላጊነት ያላቸው SKUs ዝርዝር'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                {language === 'en'
                  ? 'Ranked variant SKUs by monthly sales volume, revenue contribution & current stock availability'
                  : 'በወሩ የሽያጭ መጠን፣ የገቢ አስተዋጽኦ እና የቀሪ ክምችት መጠን የተደረደሩ SKUs'}
              </p>
            </div>

            {/* SKU Search Box */}
            <div className="w-full sm:w-64 relative">
              <input
                type="text"
                placeholder={language === 'en' ? 'Search SKU or product...' : 'SKU ወይም ምርት ፈልግ...'}
                value={searchSKU}
                onChange={(e) => setSearchSKU(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
              <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Horizontal Bar Chart representation of Top SKUs */}
          <div className="bg-gray-50/50 dark:bg-zinc-850/20 border border-gray-150 dark:border-zinc-800/80 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {language === 'en' ? 'Top 6 SKUs Monthly Volume Share' : 'የመጀመሪያዎቹ 6 SKUs የወሩ የሽያጭ ድርሻ'}
            </p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topSKUsPerformance.slice(0, 6)}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" className="dark:stroke-zinc-800/50" />
                  <XAxis type="number" tick={{ fill: '#888888', fontSize: 9 }} />
                  <YAxis type="category" dataKey="sku" tick={{ fill: '#888888', fontSize: 10, fontWeight: 700 }} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0d0e',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                    formatter={(value: any) => [
                      metricType === 'UNITS' ? `${value} units` : `${Number(value).toLocaleString()} ETB`,
                      metricType === 'UNITS' ? 'Monthly Units' : 'Monthly Revenue'
                    ]}
                  />
                  <Bar
                    dataKey={metricType === 'UNITS' ? 'unitsSoldMonth' : 'revenueMonth'}
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  >
                    {topSKUsPerformance.slice(0, 6).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#0052FF' : index === 1 ? '#C5A059' : index === 2 ? '#10B981' : '#6366F1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-500 dark:text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-150 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Product & Variant</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">
                      {metricType === 'UNITS' ? 'Units Sold' : 'Revenue'}
                    </th>
                    <th className="py-3 px-4 text-center">Volume Share</th>
                    <th className="py-3 px-4 text-right">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 font-sans">
                  {topSKUsPerformance.map((skuItem) => {
                    return (
                      <tr key={skuItem.sku} className="hover:bg-gray-50/80 dark:hover:bg-zinc-850/40 transition-colors">
                        
                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center">
                          {skuItem.rank === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[11px] inline-flex items-center justify-center border border-amber-500/30">
                              🥇 1
                            </span>
                          ) : skuItem.rank === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-black text-[11px] inline-flex items-center justify-center">
                              🥈 2
                            </span>
                          ) : skuItem.rank === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-500 font-black text-[11px] inline-flex items-center justify-center">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-gray-400 font-mono font-bold">
                              #{skuItem.rank}
                            </span>
                          )}
                        </td>

                        {/* SKU Code */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-extrabold text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-[11px]">
                            {skuItem.sku}
                          </span>
                        </td>

                        {/* Product & Variant */}
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {language === 'en' ? skuItem.productNameEn : skuItem.productNameAm}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                              Variant: <span className="font-semibold text-gray-600 dark:text-zinc-300">{skuItem.variantName}</span>
                            </p>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-700 dark:text-zinc-300">
                          {skuItem.unitPrice.toLocaleString()} ETB
                        </td>

                        {/* Metric (Units or Revenue) */}
                        <td className="py-3.5 px-4 text-right">
                          {metricType === 'UNITS' ? (
                            <span className="font-mono font-black text-[#0052FF] dark:text-blue-400 text-sm">
                              {skuItem.unitsSoldMonth} <span className="text-[10px] font-sans text-gray-400 font-normal">units</span>
                            </span>
                          ) : (
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              {skuItem.revenueMonth.toLocaleString()} <span className="text-[10px] font-sans text-gray-400 font-normal">ETB</span>
                            </span>
                          )}
                        </td>

                        {/* Volume Share Bar */}
                        <td className="py-3.5 px-4 text-center w-36">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400">
                              <span>{skuItem.volumeSharePct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#0052FF] to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(4, skuItem.volumeSharePct)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Current Stock */}
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                            skuItem.isLowStock
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {skuItem.isLowStock ? <AlertTriangle className="w-3 h-3 text-red-500" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            {skuItem.onHand} in stock
                          </span>
                        </td>

                      </tr>
                    );
                  })}

                  {topSKUsPerformance.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                        {language === 'en' ? 'No SKUs found matching query.' : 'ምንም የነበሩ SKUs አልተገኙም።'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

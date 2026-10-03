import React, { useState, useMemo } from 'react';
import { Product, Merchant, Order, StockMovementLog } from '../../types';
import MerchantInsightsWidget from './MerchantInsightsWidget';
import SalesVelocityTrendWidget from './SalesVelocityTrendWidget';
import Visual30DayDashboardWidget from './Visual30DayDashboardWidget';
import MerchantTelegramNotificationCard from './MerchantTelegramNotificationCard';
import { 
  TrendingUp, 
  BarChart3, 
  PackageCheck, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Layers, 
  Activity, 
  Users, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { dispatchBulkWhatsAppLowStockAlert } from '../../utils/whatsappNotifications';
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
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { motion } from 'motion/react';

interface DashboardTabProps {
  products: Product[];
  currentMerchant: Merchant;
  stockLogs: StockMovementLog[];
  orders: Order[];
  language: 'en' | 'am';
  onNavigateToTab: (tab: 'DASHBOARD' | 'CATALOG' | 'STOCK' | 'FORECAST' | 'PERFORMANCE' | 'PAYOUT' | 'KYC') => void;
}

export default function DashboardTab({
  products,
  currentMerchant,
  stockLogs,
  orders,
  language,
  onNavigateToTab
}: DashboardTabProps) {
  const [chartMetric, setChartMetric] = useState<'REVENUE' | 'TURNOVER'>('REVENUE');

  const merchantProducts = useMemo(() => {
    return products.filter(p => p.merchantId === currentMerchant.id);
  }, [products, currentMerchant.id]);

  const totalStockItems = useMemo(() => {
    return merchantProducts.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.onHand, 0), 0);
  }, [merchantProducts]);

  const lowStockItemsCount = useMemo(() => {
    return merchantProducts.filter(p => p.variants.some(v => v.onHand <= p.lowStockThreshold)).length;
  }, [merchantProducts]);

  // 7-day sales and turnover patterns
  const salesHistoryData = useMemo(() => {
    const dates = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      return d.toISOString().split('T')[0];
    }).reverse();

    const baseSalesFactor = currentMerchant.id === 'm1' ? 1.5 : currentMerchant.id === 'm2' ? 0.8 : currentMerchant.id === 'm3' ? 2.5 : 0.5;

    return dates.map((date, idx) => {
      const dayOrders = orders.filter(order => order.createdAt.split('T')[0] === date);

      let actualRevenue = 0;
      let actualUnitsSold = 0;

      dayOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.product.merchantId === currentMerchant.id) {
            actualRevenue += item.price * item.quantity;
            actualUnitsSold += item.quantity;
          }
        });
      });

      const dayOfWeek = new Date(date).getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.45 : 0.95;
      const seedRandom = Math.sin(idx + 5) * 0.25 + 1.0; 
      const baseRev = Math.round(1500 * baseSalesFactor * weekendMultiplier * seedRandom);
      const baseUnits = Math.max(1, Math.round(baseRev / (currentMerchant.id === 'm3' ? 1200 : 2500)));

      const finalRevenue = actualRevenue > 0 ? actualRevenue : baseRev;
      const finalUnitsSold = actualUnitsSold > 0 ? actualUnitsSold : baseUnits;

      const averageStock = totalStockItems > 0 ? totalStockItems : 50;
      const turnoverRate = Number(((finalUnitsSold / (averageStock + finalUnitsSold)) * 100).toFixed(2));

      return {
        date: new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', { month: 'short', day: 'numeric' }),
        revenue: finalRevenue,
        unitsSold: finalUnitsSold,
        turnoverRate: turnoverRate
      };
    });
  }, [currentMerchant.id, orders, totalStockItems, language]);

  const totalPeriodRevenue = useMemo(() => {
    return salesHistoryData.reduce((sum, item) => sum + item.revenue, 0);
  }, [salesHistoryData]);

  const avgTurnoverRate = useMemo(() => {
    const sum = salesHistoryData.reduce((sum, item) => sum + item.turnoverRate, 0);
    return Number((sum / salesHistoryData.length).toFixed(2));
  }, [salesHistoryData]);

  // 30-day analytics data
  const salesHistory30DayData = useMemo(() => {
    const dates = Array.from({ length: 30 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      return d.toISOString().split('T')[0];
    }).reverse();

    const baseSalesFactor = currentMerchant.id === 'm1' ? 1.5 : currentMerchant.id === 'm2' ? 0.8 : currentMerchant.id === 'm3' ? 2.5 : 0.5;

    return dates.map((date, idx) => {
      const dayOrders = orders.filter(order => order.createdAt.split('T')[0] === date);

      let actualRevenue = 0;
      let actualUnitsSold = 0;
      let actualOrderVolume = 0;

      dayOrders.forEach(order => {
        let hasMerchantProduct = false;
        order.items.forEach(item => {
          if (item.product.merchantId === currentMerchant.id) {
            actualRevenue += item.price * item.quantity;
            actualUnitsSold += item.quantity;
            hasMerchantProduct = true;
          }
        });
        if (hasMerchantProduct) {
          actualOrderVolume += 1;
        }
      });

      const dayOfWeek = new Date(date).getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.35 : 0.95;
      const wave = Math.sin(idx / 3.0) * 0.18 + Math.cos(idx / 6.0) * 0.12 + 1.0;
      const seedRandom = Math.sin(idx + 15) * 0.2 + 1.0;

      const baseRev = Math.round(1600 * baseSalesFactor * weekendMultiplier * wave * seedRandom);
      const baseUnits = Math.max(1, Math.round(baseRev / (currentMerchant.id === 'm3' ? 1200 : 2500)));
      const baseOrderVol = Math.max(1, Math.round(baseUnits / 1.5));

      const finalRevenue = actualRevenue > 0 ? actualRevenue : baseRev;
      const finalUnitsSold = actualUnitsSold > 0 ? actualUnitsSold : baseUnits;
      const finalOrderVolume = actualOrderVolume > 0 ? actualOrderVolume : baseOrderVol;

      return {
        date,
        formattedDate: new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', { month: 'short', day: 'numeric' }),
        revenue: finalRevenue,
        unitsSold: finalUnitsSold,
        orderVolume: finalOrderVolume,
      };
    });
  }, [currentMerchant.id, orders, language]);

  const total30DayRevenue = useMemo(() => {
    return salesHistory30DayData.reduce((sum, item) => sum + item.revenue, 0);
  }, [salesHistory30DayData]);

  const total30DayOrders = useMemo(() => {
    return salesHistory30DayData.reduce((sum, item) => sum + item.orderVolume, 0);
  }, [salesHistory30DayData]);

  const total30DayUnits = useMemo(() => {
    return salesHistory30DayData.reduce((sum, item) => sum + item.unitsSold, 0);
  }, [salesHistory30DayData]);

  // Heatmap calculation
  const heatmapData = useMemo(() => {
    const days = [
      { name: language === 'en' ? 'Mon' : 'ሰኞ', index: 1 },
      { name: language === 'en' ? 'Tue' : 'ማክሰኞ', index: 2 },
      { name: language === 'en' ? 'Wed' : 'ረቡዕ', index: 3 },
      { name: language === 'en' ? 'Thu' : 'ሐሙስ', index: 4 },
      { name: language === 'en' ? 'Fri' : 'አርብ', index: 5 },
      { name: language === 'en' ? 'Sat' : 'ቅዳሜ', index: 6 },
      { name: language === 'en' ? 'Sun' : 'እሁድ', index: 0 },
    ];

    const timeSlots = [
      { name: language === 'en' ? 'Morning (06-12)' : 'ጠዋት (06-12)', index: 0, minHour: 6, maxHour: 11 },
      { name: language === 'en' ? 'Afternoon (12-18)' : 'ከሰዓት (12-18)', index: 1, minHour: 12, maxHour: 17 },
      { name: language === 'en' ? 'Evening (18-00)' : 'ማታ (18-00)', index: 2, minHour: 18, maxHour: 23 },
      { name: language === 'en' ? 'Night (00-06)' : 'ሌሊት (00-06)', index: 3, minHour: 0, maxHour: 5 },
    ];

    const seedMultiplier = currentMerchant.id === 'm1' ? 1.2 : currentMerchant.id === 'm2' ? 0.85 : currentMerchant.id === 'm3' ? 1.7 : 0.6;
    const cells: any[] = [];

    days.forEach((day, dIdx) => {
      timeSlots.forEach((slot, tIdx) => {
        const matchingOrders = orders.filter(order => {
          const hasMerchantProduct = order.items.some(item => item.product.merchantId === currentMerchant.id);
          if (!hasMerchantProduct) return false;

          const date = new Date(order.createdAt);
          return date.getDay() === day.index && date.getHours() >= slot.minHour && date.getHours() <= slot.maxHour;
        });

        const isWeekend = day.index === 0 || day.index === 6;
        const isPeakTime = tIdx === 1 || tIdx === 2;

        let baseValue = 20;
        if (isWeekend && isPeakTime) baseValue = 80;
        else if (isWeekend) baseValue = 50;
        else if (isPeakTime) baseValue = 60;
        else baseValue = 30;

        const variance = Math.sin(dIdx * 4 + tIdx * 5) * 12;
        let finalDensity = Math.max(5, Math.min(100, Math.round((baseValue + variance) * seedMultiplier)));

        if (matchingOrders.length > 0) {
          finalDensity = Math.min(100, finalDensity + matchingOrders.length * 15);
        }

        cells.push({
          day: day.name,
          timeSlot: slot.name,
          value: finalDensity,
          ordersCount: matchingOrders.length,
          dayIdx: dIdx,
          timeIdx: tIdx
        });
      });
    });

    return cells;
  }, [currentMerchant.id, orders, language]);

  const RenderHeatmapCell = (props: any) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined) return null;
    
    const value = payload?.value || 0;
    
    let fill = 'rgba(0, 82, 255, 0.05)';
    if (value >= 80) fill = '#0052FF';
    else if (value >= 60) fill = 'rgba(0, 82, 255, 0.7)';
    else if (value >= 40) fill = 'rgba(0, 82, 255, 0.4)';
    else if (value >= 20) fill = 'rgba(0, 82, 255, 0.15)';

    return (
      <g>
        <rect
          x={cx - 15}
          y={cy - 11}
          width={30}
          height={22}
          rx={5}
          fill={fill}
          className="transition-all duration-200 hover:stroke-kasma-gold hover:stroke-2 hover:opacity-90 cursor-pointer"
        />
      </g>
    );
  };

  const CustomHeatmapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      let recommendation = '';
      if (data.value >= 75) {
        recommendation = language === 'en' 
          ? '🔥 Peak turnover. Restock immediately to avoid stockouts!' 
          : '🔥 ከፍተኛ ዝውውር። የእቃ እጥረት ለመከላከል በአስቸኳይ ይተኩ!';
      } else if (data.value >= 50) {
        recommendation = language === 'en'
          ? '📈 High velocity. Schedule replenishment within 48 hours.'
          : '📈 ከፍተኛ ፍጥነት። በ48 ሰዓታት ውስጥ ክምችት ለመተካት ያቅዱ።';
      } else if (data.value >= 20) {
        recommendation = language === 'en'
          ? '✓ Stable movement. Keep standard buffer inventory.'
          : '✓ መካከለኛ እንቅስቃሴ። መደበኛ ተጨማሪ ክምችት ይያዙ።';
      } else {
        recommendation = language === 'en'
          ? '💤 Low movement. Replenishment can be delayed.'
          : '💤 ዝቅተኛ እንቅስቃሴ። ክምችት መተካት ለጊዜው ሊቆይ ይችላል።';
      }

      return (
        <div className="bg-zinc-950 text-white p-3 border border-zinc-800 rounded-xl shadow-xl max-w-[240px] text-xs space-y-2 font-sans">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1 gap-4">
            <p className="font-extrabold text-[#C5A059]">{data.day} • {data.timeSlot.split(' ')[0]}</p>
            <span className="bg-[#0052FF]/20 text-[#0052FF] px-2 py-0.5 rounded text-[10px] font-mono font-black">
              {data.value}%
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400">
              {language === 'en' ? 'Turnover Rate' : 'የዝውውር ፍጥነት'}: <span className="text-white font-extrabold">{data.value}%</span>
            </p>
            <p className="text-[10px] text-gray-400">
              {language === 'en' ? 'Orders (Slot)' : 'ትዕዛዞች (ሰዓት)'}: <span className="text-white font-bold">{data.ordersCount}</span>
            </p>
          </div>
          <p className="text-[9px] text-zinc-300 bg-zinc-900/60 p-2 rounded border border-zinc-800/40 leading-relaxed font-semibold">
            {recommendation}
          </p>
        </div>
      );
    }
    return null;
  };

  const currentMerchantProducts = products.filter(p => p.merchantId === currentMerchant.id);
  const activeStockLogs = stockLogs.filter(l => currentMerchantProducts.some(p => p.variants.some(v => v.sku === l.sku)));

  return (
    <div className="space-y-6">
      
      {/* 4 Bento-Style Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Wallet Balance Widget */}
        <div className="bg-[#08090B] text-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-800 relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[130px] sm:min-h-[140px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0052FF]/10 to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-1">
              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                {language === 'en' ? 'Escrow Wallet' : 'የነጋዴው የሂሳብ ቀሪ'}
              </span>
              <span className="p-1 sm:p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-400 shrink-0">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black font-mono tracking-tight text-white pt-1 truncate">
              {currentMerchant.balance.toLocaleString()} <span className="text-[10px] sm:text-xs text-gray-400 font-sans font-medium">ETB</span>
            </h3>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2.5 mt-2 gap-1">
            <span className="text-[8.5px] sm:text-[9px] text-gray-450 font-bold flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <span className="truncate">{language === 'en' ? 'Settled' : 'ተረጋገጠ'}</span>
            </span>
            <button 
              onClick={() => onNavigateToTab('PAYOUT')}
              className="text-[9px] sm:text-[9.5px] font-black text-[#0052FF] hover:text-blue-400 transition-colors uppercase tracking-wider flex items-center gap-0.5 cursor-pointer shrink-0"
            >
              {language === 'en' ? 'Withdraw' : 'ላክ'} →
            </button>
          </div>
        </div>

        {/* Catalog Health */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs flex flex-col justify-between min-h-[130px] sm:min-h-[140px]">
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                {language === 'en' ? 'Catalog Health' : 'የካታሎግ ሁኔታ'}
              </span>
              <span className="p-1 sm:p-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-150 dark:border-zinc-700/60 rounded-lg text-[#0052FF] shrink-0">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black font-mono tracking-tight text-gray-900 dark:text-white pt-1">
              {merchantProducts.filter(p => p.status === 'APPROVED').length} / {merchantProducts.length}
            </h3>
          </div>
          <div className="space-y-1.5 mt-2.5">
            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0052FF] to-blue-500 transition-all duration-700"
                style={{ width: `${merchantProducts.length > 0 ? (merchantProducts.filter(p => p.status === 'APPROVED').length / merchantProducts.length) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[8.5px] sm:text-[9px] text-gray-400 font-bold uppercase gap-1">
              <span className="truncate">{language === 'en' ? 'Approved' : 'የፀደቁ'}</span>
              <span className="text-gray-900 dark:text-white font-mono shrink-0">
                {merchantProducts.length > 0 ? Math.round((merchantProducts.filter(p => p.status === 'APPROVED').length / merchantProducts.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* SKU Volume */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs flex flex-col justify-between min-h-[130px] sm:min-h-[140px]">
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                {language === 'en' ? 'SKU Inventory' : 'የክምችት መጠን'}
              </span>
              <span className="p-1 sm:p-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-150 dark:border-zinc-700/60 rounded-lg text-[#C5A059] shrink-0">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black font-mono tracking-tight text-gray-900 dark:text-white pt-1 truncate">
              {totalStockItems} <span className="text-[10px] sm:text-xs text-gray-500 dark:text-zinc-400 font-sans font-medium">units</span>
            </h3>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800/60 pt-2.5 mt-2 gap-1">
            <span className="text-[8.5px] sm:text-[9px] text-gray-400 font-medium truncate">
              {language === 'en' ? 'Avg.' : 'አማካይ፡'} <strong className="text-gray-700 dark:text-zinc-300 font-mono">{merchantProducts.length > 0 ? Math.round(totalStockItems / merchantProducts.length) : 0}</strong>/item
            </span>
            <button 
              onClick={() => onNavigateToTab('STOCK')}
              className="text-[9px] sm:text-[9.5px] font-black text-gray-900 dark:text-white hover:underline uppercase tracking-wider shrink-0 cursor-pointer"
            >
              {language === 'en' ? 'Audit' : 'አዘምን'} →
            </button>
          </div>
        </div>

        {/* Dynamic Alerts Card */}
        {lowStockItemsCount > 0 ? (
          <div className="bg-red-50/40 dark:bg-red-950/10 border border-red-100 dark:border-red-950/40 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs flex flex-col justify-between min-h-[130px] sm:min-h-[140px] animate-pulse">
            <div className="space-y-1">
              <div className="flex justify-between items-center gap-1">
                <span className="text-[9px] sm:text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest truncate">
                  {language === 'en' ? 'Urgent Alerts' : 'ማስጠንቀቂያዎች'}
                </span>
                <span className="p-1 sm:p-1.5 bg-red-100 dark:bg-red-950 rounded-lg text-red-600 dark:text-red-400 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black font-mono tracking-tight text-red-700 dark:text-red-400 pt-1 truncate">
                {lowStockItemsCount} {language === 'en' ? 'Low SKUs' : 'ዝቅተኛ'}
              </h3>
            </div>
            <div className="flex items-center justify-between border-t border-red-100/60 dark:border-red-950/30 pt-2.5 mt-2 gap-1.5 flex-wrap">
              <span className="text-[8.5px] sm:text-[9.5px] text-red-700 dark:text-red-400 font-bold uppercase tracking-wider truncate">
                {language === 'en' ? 'Replenish' : 'ክምችት ይጎድላል'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const lowStockItems = merchantProducts.flatMap(p => 
                      p.variants
                        .filter(v => v.onHand <= p.lowStockThreshold)
                        .map(v => ({
                          productName: p.nameEn,
                          sku: v.sku,
                          onHand: v.onHand,
                          threshold: p.lowStockThreshold,
                          storeName: currentMerchant.storeName
                        }))
                    );
                    dispatchBulkWhatsAppLowStockAlert(lowStockItems, currentMerchant.storeName, currentMerchant.phone, language);
                  }}
                  className="text-[8.5px] sm:text-[9.5px] font-black bg-[#25D366] hover:bg-[#20bd5a] text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-all uppercase tracking-wider shrink-0 cursor-pointer flex items-center gap-1"
                  title="Send Low Stock Alert via WhatsApp"
                >
                  <MessageCircle className="w-3 h-3 fill-current shrink-0" />
                  <span>WhatsApp</span>
                </button>
                <button 
                  onClick={() => onNavigateToTab('STOCK')}
                  className="text-[8.5px] sm:text-[9.5px] font-black bg-red-600 hover:bg-red-700 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-all uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  {language === 'en' ? 'Restock' : 'ሙላ'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/40 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs flex flex-col justify-between min-h-[130px] sm:min-h-[140px]">
            <div className="space-y-1">
              <div className="flex justify-between items-center gap-1">
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest truncate">
                  {language === 'en' ? 'Warehouse SLA' : 'የመጋዘን ሁኔታ'}
                </span>
                <span className="p-1 sm:p-1.5 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-400 pt-1 truncate">
                {language === 'en' ? '100% Healthy' : '100% ጤናማ'}
              </h3>
            </div>
            <div className="border-t border-emerald-100/60 dark:border-emerald-950/30 pt-2.5 mt-2 text-[8.5px] sm:text-[9px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
              ✓ {language === 'en' ? 'All quantities optimal.' : 'ሁሉም ክምችቶች ተስማሚ ናቸው።'}
            </div>
          </div>
        )}

      </div>

      {/* 30-Day Merchant Visual Dashboard - Line Chart for Daily Sales Trends & Bar Chart for Stock Velocity */}
      <Visual30DayDashboardWidget
        products={products}
        currentMerchant={currentMerchant}
        orders={orders}
        stockLogs={stockLogs}
        language={language}
        onNavigateToStock={() => onNavigateToTab('STOCK')}
      />

      {/* Daily Sales Trends & Stock Movement Velocity Analyzer Widget */}
      <SalesVelocityTrendWidget
        products={products}
        currentMerchant={currentMerchant}
        orders={orders}
        stockLogs={stockLogs}
        language={language}
        onNavigateToStock={() => onNavigateToTab('STOCK')}
      />

      {/* Automatic Merchant Telegram Order Notification Card */}
      <MerchantTelegramNotificationCard
        merchant={currentMerchant}
        orders={orders}
        language={language}
      />

      {/* Merchant Insights Widget - Daily Sales Volume & Top-Performing SKUs */}
      <MerchantInsightsWidget
        products={products}
        currentMerchant={currentMerchant}
        orders={orders}
        language={language}
      />

      {/* 7-Day Performance Charts Area */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800/80 pb-5">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0052FF]" />
              {language === 'en' ? 'Performance Analytics' : 'የአፈጻጸም ትንተና'}
            </h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              {language === 'en' 
                ? 'Real-time sales velocity and inventory turnover health' 
                : 'የሽያጭ ፍጥነት እና የእቃ ክምችት ለውጥ ሁኔታ'}
            </p>
          </div>
          <div className="flex bg-gray-50 dark:bg-zinc-800/80 p-1 rounded-xl border border-gray-200 dark:border-zinc-700/60 self-stretch sm:self-auto justify-between">
            <button
              onClick={() => setChartMetric('REVENUE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMetric === 'REVENUE'
                  ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {language === 'en' ? 'Revenue' : 'ገቢ'}
            </button>
            <button
              onClick={() => setChartMetric('TURNOVER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMetric === 'TURNOVER'
                  ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              {language === 'en' ? 'Stock Turnover' : 'የክምችት ዝውውር'}
            </button>
          </div>
        </div>

        {/* Stats Summary Panel inside Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50/50 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? '7-Day Revenue' : 'የ7 ቀን አጠቃላይ ገቢ'}
            </p>
            <p className="text-xl font-extrabold text-[#0052FF] dark:text-white mt-1.5 font-mono">
              {totalPeriodRevenue.toLocaleString()} <span className="text-xs text-gray-550 dark:text-zinc-400 font-normal">ETB</span>
            </p>
            <p className="text-[9px] text-green-600 font-bold mt-1.5 flex items-center gap-1">
              <span>↑ 14.2%</span>
              <span className="text-gray-400 font-normal">{language === 'en' ? 'vs baseline week' : 'ከባለፈው ሳምንት'}</span>
            </p>
          </div>

          <div className="bg-gray-50/50 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? 'Avg. Daily Turnover' : 'አማካይ የእቃ ክምችት ዝውውር'}
            </p>
            <p className="text-xl font-extrabold text-[#C5A059] mt-1.5 font-mono">
              {avgTurnoverRate}%
            </p>
            <p className="text-[9px] text-gray-505 dark:text-zinc-450 mt-1.5">
              {language === 'en' ? 'Health Status: Optimal velocity' : 'የጤና ሁኔታ፡ እጅግ በጣም ጥሩ ፍጥነት'}
            </p>
          </div>

          <div className="bg-gray-50/50 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? 'Total Volume Sold' : 'በድምሩ የተሸጡ እቃዎች'}
            </p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1.5 font-mono">
              {salesHistoryData.reduce((sum, item) => sum + item.unitsSold, 0)} <span className="text-xs text-gray-550 dark:text-zinc-400 font-normal">units</span>
            </p>
            <p className="text-[9px] text-gray-450 mt-1.5">
              {language === 'en' ? 'Tracked across all variant SKUs' : 'በሁሉም የምርት አይነቶች የተሸጡ'}
            </p>
          </div>
        </div>

        {/* Chart Stage */}
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'REVENUE' ? (
              <AreaChart
                data={salesHistoryData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0052FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-zinc-800/50" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                  tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c0d0e', 
                    border: '1px solid #1f2937', 
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  formatter={(value: any) => [`${value.toLocaleString()} ETB`, language === 'en' ? 'Store Revenue' : 'የሱቅ ገቢ']}
                  labelStyle={{ fontWeight: 'bold', color: '#C5A059', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0052FF" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#revenueGrad)" 
                />
              </AreaChart>
            ) : (
              <BarChart
                data={salesHistoryData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-zinc-800/50" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c0d0e', 
                    border: '1px solid #1f2937', 
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  formatter={(value: any) => [`${value}%`, language === 'en' ? 'Stock Turnover Rate' : 'የክምችት ዝውውር ፍጥነት']}
                  labelStyle={{ fontWeight: 'bold', color: '#0052FF', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="turnoverRate" 
                  fill="#C5A059" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-Day Sales Trend & Order Volume Side by Side */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0052FF]" />
                {language === 'en' ? '30-Day Sales Performance' : 'የ30 ቀናት የሽያጭ አፈጻጸም'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                {language === 'en' 
                  ? 'Past 30 days of daily order volume and revenue generation patterns' 
                  : 'ያለፉት 30 ቀናት የእለት ተእለት የትዕዛዝ መጠን እና የገቢ ሁኔታ መከታተያ'}
              </p>
            </div>
            <span className="bg-[#0052FF]/10 dark:bg-zinc-800 text-[#0052FF] dark:text-zinc-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#0052FF]/10 dark:border-zinc-700">
              {language === 'en' ? 'Last 30 Days' : 'ያለፉት 30 ቀናት'}
            </span>
          </div>
        </div>

        {/* 30-Day Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50/50 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? '30-Day Revenue' : 'የ30 ቀን ጠቅላላ ገቢ'}
            </p>
            <p className="text-lg font-extrabold text-[#0052FF] dark:text-white mt-1 font-mono">
              {total30DayRevenue.toLocaleString()} <span className="text-xs text-gray-550 dark:text-zinc-400 font-normal">ETB</span>
            </p>
            <span className="text-[8.5px] text-gray-400 font-medium">
              {language === 'en' ? 'Daily Avg: ' : 'የእለት አማካይ፡ '}
              <span className="font-bold text-gray-700 dark:text-zinc-300 font-mono">
                {Math.round(total30DayRevenue / 30).toLocaleString()} ETB
              </span>
            </span>
          </div>

          <div className="bg-gray-50/50 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? '30-Day Orders' : 'የ30 ቀን ጠቅላላ ትዕዛዞች'}
            </p>
            <p className="text-lg font-extrabold text-[#C5A059] mt-1 font-mono">
              {total30DayOrders} <span className="text-xs text-gray-550 dark:text-zinc-400 font-normal">orders</span>
            </p>
            <span className="text-[8.5px] text-gray-400 font-medium">
              {language === 'en' ? 'Daily Volume: ' : 'የእለት መጠን፡ '}
              <span className="font-bold text-gray-700 dark:text-zinc-300 font-mono">
                {(total30DayOrders / 30).toFixed(1)} / day
              </span>
            </span>
          </div>

          <div className="bg-gray-50/50 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? '30-Day Units Sold' : 'የተሸጡ እቃዎች ብዛት'}
            </p>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 font-mono">
              {total30DayUnits} <span className="text-xs text-gray-550 dark:text-zinc-400 font-normal font-sans">units</span>
            </p>
            <span className="text-[8.5px] text-gray-400 font-medium">
              {language === 'en' ? 'Avg Order Size: ' : 'አማካይ የትዕዛዝ መጠን፡ '}
              <span className="font-bold text-gray-700 dark:text-zinc-300 font-mono">
                {(total30DayUnits / (total30DayOrders || 1)).toFixed(1)} units
              </span>
            </span>
          </div>

          <div className="bg-gray-50/50 dark:bg-zinc-850/30 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? 'Avg Ticket Value' : 'አማካይ የትዕዛዝ ዋጋ'}
            </p>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {Math.round(total30DayRevenue / (total30DayOrders || 1)).toLocaleString()} <span className="text-xs text-gray-550 dark:text-zinc-400 font-normal font-sans">ETB</span>
            </p>
            <span className="text-[8.5px] text-gray-400 font-medium">
              {language === 'en' ? 'Per customer checkout' : 'በእያንዳንዱ ክፍያ'}
            </span>
          </div>
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50/20 dark:bg-zinc-850/10 border border-gray-100 dark:border-zinc-800/60 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100/50 dark:border-zinc-800/40">
              <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-350 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse" />
                {language === 'en' ? 'Daily Revenue (30 Days)' : 'የእለት ገቢ ሁኔታ (30 ቀናት)'}
              </h4>
              <span className="text-[10px] font-mono text-gray-400">{language === 'en' ? 'Line View' : 'መስመር እይታ'}</span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesHistory30DayData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenue30Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0052FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-zinc-800/50" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#888888', fontSize: 9, fontWeight: 500 }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                    tick={{ fill: '#888888', fontSize: 9, fontWeight: 500 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0c0d0e', 
                      border: '1px solid #1f2937', 
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    formatter={(value: any) => [`${value.toLocaleString()} ETB`, language === 'en' ? 'Revenue' : 'ገቢ']}
                    labelStyle={{ fontWeight: 'bold', color: '#C5A059', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0052FF" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#revenue30Grad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-50/20 dark:bg-zinc-850/10 border border-gray-150 dark:border-zinc-800/60 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100/50 dark:border-zinc-800/40">
              <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-350 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                {language === 'en' ? 'Daily Orders (30 Days)' : 'የእለት የትዕዛዝ መጠን (30 ቀናት)'}
              </h4>
              <span className="text-[10px] font-mono text-gray-400">{language === 'en' ? 'Bar View' : 'ባር እይታ'}</span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesHistory30DayData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-zinc-800/50" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#888888', fontSize: 9, fontWeight: 500 }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#888888', fontSize: 9, fontWeight: 500 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0c0d0e', 
                      border: '1px solid #1f2937', 
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    formatter={(value: any) => [`${value} orders`, language === 'en' ? 'Order Volume' : 'የትዕዛዝ መጠን']}
                    labelStyle={{ fontWeight: 'bold', color: '#0052FF', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="orderVolume" 
                    fill="#C5A059" 
                    radius={[3, 3, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Inventory Turnover Heatmap */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#C5A059]" />
            {language === 'en' ? 'Weekly Inventory Turnover Density' : 'የሳምንቱ የክምችት ዝውውር ጥግግት'}
          </h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
            {language === 'en' 
              ? 'Interactive heat distribution of stock demand velocity. Hover over cells to see stock replenishment recommendations.' 
              : 'የእቃ ክምችት ፍላጎት ፍጥነት መስተጋብራዊ የሙቀት ስርጭት። የአክሲዮን መተኪያ ምክሮችን ለማየት ክፍሎቹ ላይ ያንዣብቡ።'}
          </p>
        </div>

        <div className="h-[250px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 15, right: 10, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-zinc-800/40" />
              <XAxis 
                type="category" 
                dataKey="day" 
                name="Day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#888888', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                type="category" 
                dataKey="timeSlot" 
                name="Time"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#888888', fontSize: 10, fontWeight: 600 }}
                width={language === 'en' ? 115 : 95}
              />
              <ZAxis type="number" dataKey="value" range={[150, 150]} />
              <Tooltip content={<CustomHeatmapTooltip />} cursor={{ strokeDasharray: '3 3', strokeOpacity: 0.5 }} />
              <Scatter 
                name="Turnover Density" 
                data={heatmapData} 
                shape={RenderHeatmapCell} 
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-100 dark:border-zinc-800/80 pt-4">
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <span>{language === 'en' ? 'Turnover Density:' : 'የዝውውር ጥግግት፡'}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-100 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/40" />
                <span>&lt; 20%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#0052FF]/15" />
                <span>20% - 40%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#0052FF]/40" />
                <span>40% - 60%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#0052FF]/70" />
                <span>60% - 80%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#0052FF]" />
                <span>80% +</span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium italic">
            {language === 'en' 
              ? '💡 Pro-tip: Schedule restock deliveries 24 hours prior to peak windows.'
              : '💡 ጠቃሚ ምክር፡ ከፍተኛ የዝውውር ሰዓት ከመድረሱ 24 ሰዓት በፊት ክምችት ያቅርቡ።'}
          </div>
        </div>
      </div>

      {/* Localized Active listings & Audit Logs preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-2 flex justify-between items-center">
            <h4 className="font-bold text-gray-950 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0052FF]" />
              {language === 'en' ? 'My Store Listings' : 'የእኔ ንቁ እቃዎች'}
            </h4>
            <button 
              onClick={() => onNavigateToTab('CATALOG')}
              className="text-[10px] font-bold text-[#0052FF] hover:underline uppercase"
            >
              {language === 'en' ? 'Manage Catalog' : 'ካታሎግ ማዕከል'} →
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {merchantProducts.map(p => (
              <div key={p.id} className="flex justify-between items-center text-xs p-3 bg-gray-50/50 dark:bg-zinc-850/20 border border-gray-100 dark:border-zinc-800/60 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{language === 'en' ? p.nameEn : p.nameAm}</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                    {p.price.toLocaleString()} ETB • Status: <span className={`font-black uppercase text-[9px] px-1.5 py-0.5 rounded ${p.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'}`}>{p.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-gray-900 dark:text-white font-mono">{p.variants.reduce((s,v)=>s+v.onHand, 0)} items</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">SKUs: {p.variants.length}</p>
                </div>
              </div>
            ))}
            {merchantProducts.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-10">No products submitted. Create listings under Product Catalog.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-2 flex justify-between items-center">
            <h4 className="font-bold text-gray-950 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
              {language === 'en' ? 'Recent Inventory Logs' : 'የክምችት እንቅስቃሴ ምዝግብ'}
            </h4>
            <button 
              onClick={() => onNavigateToTab('STOCK')}
              className="text-[10px] font-bold text-[#C5A059] hover:underline uppercase"
            >
              {language === 'en' ? 'Full Log Ledger' : 'ሙሉ ምዝግብ እይታ'} →
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 font-mono text-[10px]">
            {activeStockLogs.map(log => (
              <div key={log.id} className="p-3 border-l-2 border-[#C5A059] bg-gray-50/50 dark:bg-zinc-850/20 rounded-r-xl space-y-1">
                <div className="flex justify-between text-gray-450 text-[9px] font-bold">
                  <span>SKU: {log.sku}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-800 dark:text-zinc-200 font-sans text-xs font-semibold leading-relaxed">{log.reason}</p>
                <div className="flex justify-between items-center text-[9px] font-sans text-gray-400">
                  <span>Actor: {log.actor}</span>
                  <span className={`font-mono font-bold ${log.difference > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {log.difference > 0 ? `+${log.difference}` : log.difference} units
                  </span>
                </div>
              </div>
            ))}
            {activeStockLogs.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-10 font-sans">No stock alterations recorded.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

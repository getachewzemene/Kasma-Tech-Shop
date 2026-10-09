import React, { useState, useMemo } from 'react';
import { Product, Variant, Order, StockMovementLog, Merchant } from '../../types';
import StockMovementTrendsWidget from './StockMovementTrendsWidget';
import { 
  ClipboardList, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  Download,
  UploadCloud,
  Layers,
  Search,
  Sliders,
  Check,
  Sparkles,
  TrendingUp,
  Gauge,
  Lightbulb,
  Zap,
  Calendar,
  Shield,
  QrCode,
  Printer,
  Camera,
  MessageCircle,
  Send
} from 'lucide-react';
import { sendTelegramLowStockAlert } from '../../utils/telegramBot';
import { dispatchWhatsAppLowStockAlert, dispatchBulkWhatsAppLowStockAlert } from '../../utils/whatsappNotifications';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  Line,
  Legend
} from 'recharts';

interface StockTabProps {
  products: Product[];
  currentMerchant: Merchant;
  stockLogs: StockMovementLog[];
  orders?: Order[];
  onUpdateProductStock: (productId: string, sku: string, qtyChange: number, reason: string) => void;
  onBulkUpdateProductStock?: (adjustments: { productId: string; sku: string; qtyChange: number; reason: string }[]) => Promise<{ success: boolean; error?: string }>;
  onUpdateProductThreshold?: (productId: string, threshold: number) => void;
  language: 'en' | 'am';
}

export default function StockTab({
  products,
  currentMerchant,
  stockLogs,
  orders = [],
  onUpdateProductStock,
  onBulkUpdateProductStock,
  onUpdateProductThreshold,
  language
}: StockTabProps) {
  const [stockSubTab, setStockSubTab] = useState<'TRENDS' | 'SINGLE' | 'BULK' | 'LEDGER' | 'PREDICTIVE' | 'QR_CODES'>('TRENDS');
  const [searchTerm, setSearchTerm] = useState('');

  // QR Code States
  const [selectedPrintVariant, setSelectedPrintVariant] = useState<{ product: Product; variant: Variant } | null>(null);
  const [activeScanSku, setActiveScanSku] = useState<string>('');
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [scannedVariant, setScannedVariant] = useState<{ product: Product; variant: Variant } | null>(null);
  const [scanAdjustQty, setScanAdjustQty] = useState<number>(0);
  const [scanAdjustReason, setScanAdjustReason] = useState<string>('Rapid QR Code label scan adjust');
  const [recentScans, setRecentScans] = useState<Array<{ timestamp: Date; sku: string; productName: string; prevQty: number; newQty: number; delta: number }>>([]);

  // Machine Learning Stock Planner & Prediction States
  const [leadTime, setLeadTime] = useState(7);
  const [serviceLevel, setServiceLevel] = useState(95);
  const [simulateMissing, setSimulateMissing] = useState(true);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isPredictLoading, setIsPredictLoading] = useState(false);
  const [activePredictSku, setActivePredictSku] = useState('');
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({});
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [applyingThresholdSku, setApplyingThresholdSku] = useState<string | null>(null);
  const [appliedThresholdSkus, setAppliedThresholdSkus] = useState<Set<string>>(new Set());

  const fetchPredictions = async () => {
    setIsPredictLoading(true);
    try {
      const token = localStorage.getItem('kasma_merchant_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/predict/reorder-points', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          merchantId: currentMerchant.id,
          leadTime,
          serviceLevel,
          simulateMissing
        })
      });
      const data = await response.json();
      if (data.success) {
        setPredictions(data.predictions);
        if (data.predictions.length > 0) {
          const exists = data.predictions.some((p: any) => p.sku === activePredictSku);
          if (!exists) {
            setActivePredictSku(data.predictions[0].sku);
          }
        }
      } else {
        alert('Prediction error: ' + data.error);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsPredictLoading(false);
    }
  };

  const fetchInsightForSku = async (prediction: any) => {
    if (!prediction) return;
    setIsInsightLoading(true);
    try {
      const token = localStorage.getItem('kasma_merchant_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/predict/insights', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prediction,
          leadTime,
          serviceLevel
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiInsights(prev => ({
          ...prev,
          [prediction.sku]: data.insight
        }));
      } else {
        console.error('Insight error:', data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInsightLoading(false);
    }
  };

  const handleApplyThreshold = async (productId: string, sku: string, threshold: number) => {
    setApplyingThresholdSku(sku);
    try {
      if (onUpdateProductThreshold) {
        await onUpdateProductThreshold(productId, threshold);
        setAppliedThresholdSkus(prev => {
          const next = new Set(prev);
          next.add(sku);
          return next;
        });
      } else {
        alert(language === 'en' ? 'Threshold update function not connected.' : 'የማንቂያ ደረጃ ማሻሻያ አገልግሎት አልተገናኘም።');
      }
    } catch (err: any) {
      alert('Failed to update threshold: ' + err.message);
    } finally {
      setApplyingThresholdSku(null);
    }
  };

  React.useEffect(() => {
    if (stockSubTab === 'PREDICTIVE' && predictions.length === 0 && !isPredictLoading) {
      fetchPredictions();
    }
  }, [stockSubTab, currentMerchant.id]);

  const activePrediction = useMemo(() => {
    return predictions.find(p => p.sku === activePredictSku);
  }, [predictions, activePredictSku]);

  React.useEffect(() => {
    if (activePrediction && !aiInsights[activePredictSku] && !isInsightLoading) {
      fetchInsightForSku(activePrediction);
    }
  }, [activePredictSku, activePrediction]);

  const chartData = useMemo(() => {
    if (!activePrediction) return [];
    const data: any[] = [];
    
    // Add historical data
    activePrediction.historicalData.forEach((h: any) => {
      data.push({
        name: `Day ${h.day}`,
        date: h.date,
        sales: h.sales,
        forecast: null,
        lower: null,
        upper: null
      });
    });

    // Add last day of history to forecast to make a continuous line
    const lastHistory = activePrediction.historicalData[activePrediction.historicalData.length - 1];
    if (lastHistory) {
      data.push({
        name: `Day ${lastHistory.day}`,
        date: lastHistory.date,
        sales: lastHistory.sales,
        forecast: lastHistory.sales,
        lower: lastHistory.sales,
        upper: lastHistory.sales
      });
    }

    // Add forecast data
    activePrediction.forecastData.forEach((f: any) => {
      data.push({
        name: `Day ${f.day}`,
        date: f.date,
        sales: null,
        forecast: f.sales,
        lower: f.lowerCI,
        upper: f.upperCI
      });
    });

    return data;
  }, [activePrediction]);

  // Single adjustment state
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustSku, setAdjustSku] = useState('');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Periodic inventory count verification');

  // Bulk editor spreadsheet state
  const [bulkRows, setBulkRows] = useState<Record<string, { qtyChange: string; reason: string }>>({});
  const [bulkIsSubmitting, setBulkIsSubmitting] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvReason, setCsvReason] = useState('Bulk CSV replenishment dispatch');
  const [csvMessage, setCsvMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const merchantProducts = useMemo(() => {
    return products.filter(p => p.merchantId === currentMerchant.id);
  }, [products, currentMerchant.id]);

  const allVariants = useMemo(() => {
    const list: { product: Product; variant: Variant }[] = [];
    merchantProducts.forEach(p => {
      p.variants.forEach(v => {
        list.push({ product: p, variant: v });
      });
    });
    return list;
  }, [merchantProducts]);

  // Pre-fill fields when selecting product
  const activeProduct = useMemo(() => {
    return merchantProducts.find(p => p.id === adjustProductId);
  }, [merchantProducts, adjustProductId]);

  const handleProductSelect = (id: string) => {
    setAdjustProductId(id);
    const prod = merchantProducts.find(p => p.id === id);
    if (prod && prod.variants.length > 0) {
      setAdjustSku(prod.variants[0].sku);
    } else {
      setAdjustSku('');
    }
  };

  const handleSingleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || !adjustSku || adjustQty === 0) {
      alert(language === 'en' ? 'Provide a valid product, SKU, and non-zero quantity offset.' : 'እባክዎን ትክክለኛ ምርት፣ SKU እና ዜሮ ያልሆነ መጠን ያስገቡ።');
      return;
    }

    onUpdateProductStock(adjustProductId, adjustSku, adjustQty, adjustReason);
    setAdjustQty(0);
    alert(
      language === 'en' 
        ? `Successfully adjusted inventory for SKU ${adjustSku} by ${adjustQty > 0 ? '+' : ''}${adjustQty} units.` 
        : `ለSKU ${adjustSku} የክምችት መጠን በ ${adjustQty > 0 ? '+' : ''}${adjustQty} በተሳካ ሁኔታ ተስተካክሏል።`
    );
  };

  // Bulk operations
  const handleBulkCellChange = (sku: string, qtyChange: string) => {
    setBulkRows(prev => ({
      ...prev,
      [sku]: {
        qtyChange,
        reason: prev[sku]?.reason || 'Standard bulk cycle review'
      }
    }));
  };

  const handleBulkReasonChange = (sku: string, reason: string) => {
    setBulkRows(prev => ({
      ...prev,
      [sku]: {
        qtyChange: prev[sku]?.qtyChange || '',
        reason
      }
    }));
  };

  const handleCommitBulkGrid = async () => {
    const adjustments: { productId: string; sku: string; qtyChange: number; reason: string }[] = [];
    
    allVariants.forEach(item => {
      const cell = bulkRows[item.variant.sku];
      if (cell && cell.qtyChange.trim() !== '') {
        const offset = Number(cell.qtyChange);
        if (!isNaN(offset) && offset !== 0) {
          adjustments.push({
            productId: item.product.id,
            sku: item.variant.sku,
            qtyChange: offset,
            reason: cell.reason || 'Bulk grid sheet adjustment'
          });
        }
      }
    });

    if (adjustments.length === 0) {
      alert(language === 'en' ? 'No valid inventory changes detected in spreadsheet rows.' : 'ምንም አይነት ትክክለኛ የክምችት ለውጦች አልተገኙም።');
      return;
    }

    setBulkIsSubmitting(true);
    try {
      if (onBulkUpdateProductStock) {
        const res = await onBulkUpdateProductStock(adjustments);
        if (res.success) {
          setBulkRows({});
          alert(language === 'en' ? 'Bulk quantities locked and committed!' : 'አጠቃላይ የክምችት መጠኖች በተሳካ ሁኔታ ጸድቀዋል!');
        } else {
          alert(`Error: ${res.error}`);
        }
      } else {
        // Fallback to sequential calls if parent prop is missing
        adjustments.forEach(adj => {
          onUpdateProductStock(adj.productId, adj.sku, adj.qtyChange, adj.reason);
        });
        setBulkRows({});
        alert(language === 'en' ? 'Bulk adjustments completed sequentially!' : 'ሁሉም የክምችት መጠኖች በተሳካ ሁኔታ ተስተካክለዋል!');
      }
    } catch (err: any) {
      alert(`Adjustment failure: ${err.message}`);
    } finally {
      setBulkIsSubmitting(false);
    }
  };

  const handleLoadCSVSample = () => {
    if (allVariants.length === 0) return;
    const header = "sku,quantity_offset\n";
    const body = allVariants.slice(0, 3).map((item, idx) => {
      const offset = idx % 2 === 0 ? 15 : -3;
      return `${item.variant.sku},${offset}`;
    }).join("\n");
    setCsvText(header + body);
    setCsvMessage({
      type: 'success',
      text: language === 'en' ? 'Demo CSV loaded. Click Process to parse.' : 'የሙከራ CSV ተጭኗል። ለመተንተን "አካሂድ" የሚለውን ይጫኑ።'
    });
  };

  const handleProcessCSV = async () => {
    if (!csvText.trim()) {
      setCsvMessage({ type: 'error', text: language === 'en' ? 'CSV source text is empty.' : 'የCSV ፅሁፍ ባዶ ነው።' });
      return;
    }

    const lines = csvText.split('\n');
    const adjustments: { productId: string; sku: string; qtyChange: number; reason: string }[] = [];
    let errorLines: string[] = [];

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('sku')) return; // skip header
      if (!line.trim()) return;

      const parts = line.split(',');
      if (parts.length >= 2) {
        const rawSku = parts[0].trim().toUpperCase();
        const rawQty = Number(parts[1].trim());

        const match = allVariants.find(item => item.variant.sku.toUpperCase() === rawSku);
        if (match && !isNaN(rawQty) && rawQty !== 0) {
          adjustments.push({
            productId: match.product.id,
            sku: match.variant.sku,
            qtyChange: rawQty,
            reason: csvReason || 'Bulk CSV file processing upload'
          });
        } else {
          errorLines.push(`Line ${index + 1}: SKU "${rawSku}" unrecognized or offset invalid.`);
        }
      } else {
        errorLines.push(`Line ${index + 1}: Invalid layout formatting.`);
      }
    });

    if (adjustments.length === 0) {
      setCsvMessage({
        type: 'error',
        text: language === 'en' 
          ? 'Failed to parse any matching SKUs. Make sure the SKU codes exist.' 
          : 'ምንም አይነት ተዛማጅ SKU ማግኘት አልተቻለም። SKU ኮዶች መኖራቸውን ያረጋግጡ።'
      });
      return;
    }

    setBulkIsSubmitting(true);
    try {
      if (onBulkUpdateProductStock) {
        const res = await onBulkUpdateProductStock(adjustments);
        if (res.success) {
          setCsvText('');
          setCsvMessage({
            type: 'success',
            text: language === 'en'
              ? `Successfully processed CSV! Synced ${adjustments.length} SKU adjustments.`
              : `CSV በተሳካ ሁኔታ ተተንትኗል! ${adjustments.length} የምርት መጠኖች ተስተካክለዋል።`
          });
        } else {
          setCsvMessage({ type: 'error', text: res.error || 'Failed bulk process' });
        }
      } else {
        adjustments.forEach(adj => {
          onUpdateProductStock(adj.productId, adj.sku, adj.qtyChange, adj.reason);
        });
        setCsvText('');
        setCsvMessage({
          type: 'success',
          text: language === 'en' ? `Adjusted ${adjustments.length} SKUs sequentially.` : `${adjustments.length} የምርት መጠኖች ተስተካክለዋል።`
        });
      }
    } catch (err: any) {
      setCsvMessage({ type: 'error', text: err.message });
    } finally {
      setBulkIsSubmitting(false);
    }
  };

  // Filter logs based on search
  const filteredLogs = useMemo(() => {
    const list = stockLogs.filter(log => {
      // Check if this log belongs to this merchant's variants
      const belongs = allVariants.some(item => item.variant.sku === log.sku);
      if (!belongs) return false;

      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        log.sku.toLowerCase().includes(s) ||
        log.reason.toLowerCase().includes(s) ||
        log.actor.toLowerCase().includes(s) ||
        log.productName.toLowerCase().includes(s)
      );
    });

    return [...list].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [stockLogs, allVariants, searchTerm]);

  // Compute products/variants running below threshold
  const lowStockItems = useMemo(() => {
    const list: Array<{
      product: Product;
      variant: Variant;
      threshold: number;
      isOutOfStock: boolean;
    }> = [];

    merchantProducts.forEach(prod => {
      const threshold = prod.lowStockThreshold || currentMerchant.lowStockThreshold || 3;
      prod.variants.forEach(v => {
        if (v.onHand <= threshold) {
          list.push({
            product: prod,
            variant: v,
            threshold,
            isOutOfStock: v.onHand <= 0
          });
        }
      });
    });

    return list.sort((a, b) => a.variant.onHand - b.variant.onHand);
  }, [merchantProducts, currentMerchant]);

  const [dispatchingTelegramSku, setDispatchingTelegramSku] = useState<string | null>(null);
  const [telegramAlertSuccessSku, setTelegramAlertSuccessSku] = useState<string | null>(null);

  const handleSendTelegramStockAlert = async (product: Product, variant: Variant, threshold: number) => {
    setDispatchingTelegramSku(variant.sku);
    try {
      const token = localStorage.getItem('kasma_merchant_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/products/${product.id}/telegram-stock-alert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sku: variant.sku })
      });
      if (res.ok) {
        setTelegramAlertSuccessSku(variant.sku);
        setTimeout(() => setTelegramAlertSuccessSku(null), 3000);
      }
      // Also dispatch to local client feed
      await sendTelegramLowStockAlert(
        product,
        variant,
        threshold,
        currentMerchant.storeName,
        language
      );
    } catch (err) {
      console.error('Failed to trigger Telegram stock alert:', err);
    } finally {
      setDispatchingTelegramSku(null);
    }
  };

  const handleQuickRestock = (productId: string, sku: string, qty: number) => {
    onUpdateProductStock(productId, sku, qty, `Quick Restock (+${qty} units via Low-Stock Alert Hub)`);
  };

  return (
    <div className="space-y-6">
      
      {/* 🚨 Automated Low-Stock Telegram Alerts & Quick Restock Hub */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    {language === 'en' ? '🚨 Low-Stock Telegram Alerts & Quick Restock' : '🚨 የዝቅተኛ ክምችት የቴሌግራም ማንቂያ እና ፈጣን ማሟያ'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                    {lowStockItems.length} {language === 'en' ? 'SKUs Critical' : 'ወሳኝ እቃዎች'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                  {language === 'en'
                    ? 'These high-velocity items are running below your safety threshold. Alert your Telegram channel or execute 1-click restocks.'
                    : 'እነዚህ እቃዎች ከደህንነት ገደብዎ በታች ናቸው። ወደ ቴሌግራም ማሳወቂያ ይላኩ ወይም በ1-ጠቅታ ክምችት ይጨምሩ።'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={async () => {
                  for (const item of lowStockItems.slice(0, 5)) {
                    await handleSendTelegramStockAlert(item.product, item.variant, item.threshold);
                  }
                }}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Send All to Telegram Bot' : 'ሁሉንም በቴሌግራም ላክ'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {lowStockItems.map((item, idx) => {
              const isDispatched = telegramAlertSuccessSku === item.variant.sku;
              const isDispatching = dispatchingTelegramSku === item.variant.sku;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-3.5 border border-amber-300/60 dark:border-amber-900/40 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.nameEn}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-zinc-800 shrink-0 border border-gray-150 dark:border-zinc-800"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {language === 'en' ? item.product.nameEn : item.product.nameAm}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-mono">
                          SKU: {item.variant.sku}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                      item.isOutOfStock 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.isOutOfStock 
                        ? (language === 'en' ? 'OUT OF STOCK' : 'አልቋል') 
                        : `${item.variant.onHand} ${language === 'en' ? 'left' : 'ቀሪ'}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100 dark:border-zinc-800">
                    <span>{language === 'en' ? 'Threshold:' : 'ገደብ:'} <strong className="text-gray-700 dark:text-zinc-300">{item.threshold}</strong></span>
                    <span>{language === 'en' ? 'Price:' : 'ዋጋ:'} <strong className="text-gray-900 dark:text-white">{(item.product.price + (item.variant.priceOffset || 0)).toLocaleString()} ETB</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSendTelegramStockAlert(item.product, item.variant, item.threshold)}
                      disabled={isDispatching}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isDispatched
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                      }`}
                      title="Send alert to linked Telegram bot"
                    >
                      {isDispatching ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : isDispatched ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Send className="w-3 h-3 text-sky-500" />
                      )}
                      <span>{isDispatched ? (language === 'en' ? 'Sent!' : 'ተልኳል!') : (language === 'en' ? 'Telegram' : 'ቴሌግራም')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickRestock(item.product.id, item.variant.sku, 5)}
                      className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      title="Quick add 5 units to inventory"
                    >
                      +5
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickRestock(item.product.id, item.variant.sku, 10)}
                      className="py-1.5 px-2 bg-[#0052FF] hover:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                      title="Quick add 10 units to inventory"
                    >
                      +10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub tabs layout navigation */}
      <div className="flex bg-gray-100/50 dark:bg-zinc-850/40 p-1.5 rounded-xl border border-gray-200/50 dark:border-zinc-800/80 max-w-4xl flex-wrap gap-1 md:flex-nowrap">
        <button
          onClick={() => setStockSubTab('TRENDS')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            stockSubTab === 'TRENDS'
              ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>{language === 'en' ? 'Stock Movement Trends' : 'የእቃ ገበታ እንቅስቃሴ'}</span>
        </button>
        <button
          onClick={() => setStockSubTab('SINGLE')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            stockSubTab === 'SINGLE'
              ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          {language === 'en' ? 'Single SKU Mod' : 'የነጠላ እቃ መጠን'}
        </button>
        <button
          onClick={() => setStockSubTab('BULK')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            stockSubTab === 'BULK'
              ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          {language === 'en' ? 'Interactive Bulk Grid' : 'የተመን ሉህ/አጠቃላይ ማስተካከያ'}
        </button>
        <button
          onClick={() => setStockSubTab('LEDGER')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            stockSubTab === 'LEDGER'
              ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          {language === 'en' ? 'Audit Logs Ledger' : 'የክምችት እንቅስቃሴ ታሪክ'}
        </button>
        <button
          onClick={() => setStockSubTab('PREDICTIVE')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            stockSubTab === 'PREDICTIVE'
              ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>{language === 'en' ? 'AI Stock Planner' : 'የኤአይ እቅድ'}</span>
        </button>
        <button
          onClick={() => setStockSubTab('QR_CODES')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            stockSubTab === 'QR_CODES'
              ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-[#0052FF]" />
          <span>{language === 'en' ? 'QR Labels & Scanner' : 'የQR መለያ እና ስካነር'}</span>
        </button>
      </div>

      {stockSubTab === 'TRENDS' && (
        <StockMovementTrendsWidget
          products={products}
          currentMerchant={currentMerchant}
          stockLogs={stockLogs}
          orders={orders}
          language={language}
        />
      )}

      {stockSubTab === 'SINGLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main adjustment panel form */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
                {language === 'en' ? 'Execute Stock Adjustment Transaction' : 'የነጠላ እቃ ክምችት ማሻሻያ'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'en' ? 'Increments or decrements active variant stock ledger lines.' : 'በእጅዎ ያሉትን የምርት መጠኖች ለመጨመር ወይም ለመቀነስ ይህንን ቅፅ ይጠቀሙ።'}
              </p>
            </div>

            <form onSubmit={handleSingleAdjustmentSubmit} className="space-y-4 pt-1">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  {language === 'en' ? 'Select Product' : 'ምርቱን ይምረጡ'}
                </label>
                <select
                  required
                  value={adjustProductId}
                  onChange={e => handleProductSelect(e.target.value)}
                  className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-black font-semibold"
                >
                  <option value="">-- Select Product --</option>
                  {merchantProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {language === 'en' ? p.nameEn : p.nameAm} ({p.brand})
                    </option>
                  ))}
                </select>
              </div>

              {activeProduct && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                      {language === 'en' ? 'Select SKU Variant' : 'የእቃውን አይነት/SKU ይምረጡ'}
                    </label>
                    <select
                      required
                      value={adjustSku}
                      onChange={e => setAdjustSku(e.target.value)}
                      className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-black font-mono font-bold"
                    >
                      {activeProduct.variants.map(v => (
                        <option key={v.sku} value={v.sku}>
                          {v.sku} • {v.name} (On-Hand: {v.onHand})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex justify-between">
                      <span>{language === 'en' ? 'Quantity Delta Offset' : 'የመጠን ለውጥ'}</span>
                      <span className="text-[9px] font-mono text-gray-450">{language === 'en' ? 'Use negative value to reduce' : 'ለመቀነስ በቅነሳ (-) ምልክት ያስገቡ'}</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 25 or -5"
                      value={adjustQty || ''}
                      onChange={e => setAdjustQty(Number(e.target.value))}
                      className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-black text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  {language === 'en' ? 'Audit Log Reason / Notes' : 'ምክንያት / ማስታወሻ'}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Completed manual bin recount, adjusting discrepancies..."
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-black font-medium leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'en' ? 'Commit Adjustment' : 'መጠን አዘምን'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Quick SKU reference panel on the right */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-2 flex justify-between items-center gap-2">
              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                {language === 'en' ? 'Current Stock Summary' : 'አሁን ያለ የክምችት መጠን'}
              </h4>
              {allVariants.some(i => i.variant.onHand <= i.product.lowStockThreshold) && (
                <button
                  onClick={() => {
                    const lowItems = allVariants
                      .filter(i => i.variant.onHand <= i.product.lowStockThreshold)
                      .map(i => ({
                        productName: i.product.nameEn,
                        sku: i.variant.sku,
                        onHand: i.variant.onHand,
                        threshold: i.product.lowStockThreshold,
                        storeName: currentMerchant.storeName
                      }));
                    dispatchBulkWhatsAppLowStockAlert(lowItems, currentMerchant.storeName, currentMerchant.phone, language);
                  }}
                  className="text-[9px] font-black bg-[#25D366] hover:bg-[#20bd5a] text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  title="Send All Low Stock SKUs via WhatsApp"
                >
                  <MessageCircle className="w-3 h-3 fill-current shrink-0" />
                  <span>WhatsApp Report</span>
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {allVariants.map(item => {
                const isLow = item.variant.onHand <= item.product.lowStockThreshold;
                return (
                  <div key={item.variant.sku} className={`flex justify-between items-center p-3 text-xs rounded-xl border transition-all ${isLow ? 'bg-red-50/20 border-red-200 dark:bg-red-950/20 dark:border-red-900/40' : 'bg-gray-50/40 border-gray-100 dark:bg-zinc-850/10 dark:border-zinc-800/40'}`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono text-[10px] font-bold text-[#0052FF] dark:text-blue-400">{item.variant.sku}</p>
                        {isLow && (
                          <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 text-[8.5px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {language === 'en' ? 'Low Stock' : 'ዝቅተኛ'}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{item.variant.name}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className={`font-mono font-black text-sm ${isLow ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{item.variant.onHand} pcs</p>
                        <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{isLow ? `≤ ${item.product.lowStockThreshold} threshold` : 'Optimal level'}</p>
                      </div>
                      {isLow && (
                        <button
                          onClick={() => {
                            dispatchWhatsAppLowStockAlert({
                              productName: item.product.nameEn,
                              sku: item.variant.sku,
                              onHand: item.variant.onHand,
                              threshold: item.product.lowStockThreshold,
                              storeName: currentMerchant.storeName,
                              merchantPhone: currentMerchant.phone
                            }, currentMerchant.phone, language);
                          }}
                          className="p-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded-lg transition-all cursor-pointer shrink-0"
                          title="Notify Supplier / Restock via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {allVariants.length === 0 && (
                <p className="text-xs text-center py-10 text-gray-400">No SKUs listed. Add variants in Catalog first.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {stockSubTab === 'BULK' && (
        <div className="space-y-6">
          
          {/* Interactive spreadsheet style editor */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
                  {language === 'en' ? 'Interactive Bulk Quantity Spreadsheet' : 'በተመን ሉህ መልክ የክምችት ማስተካከያ'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {language === 'en' 
                    ? 'Enter adjustment values directly inside cells. Shift offsets appear in real-time as you type.' 
                    : 'መጠን ለውጦቹን በቀጥታ ሰንጠረዡ ውስጥ ያስገቡ። የክምችት ለውጦች በቅጽበት ይታያሉ።'}
                </p>
              </div>
              <button
                onClick={handleCommitBulkGrid}
                disabled={bulkIsSubmitting}
                className="px-6 py-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {bulkIsSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{language === 'en' ? 'Commit Bulk Changes' : 'ለውጦችን መዝግብ'}</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-zinc-850/30 text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-200 dark:border-zinc-850">
                    <th className="px-4 py-3.5 w-1/4">SKU Code</th>
                    <th className="px-4 py-3.5 w-1/4">Variant Name / Product</th>
                    <th className="px-4 py-3.5 text-center w-1/12">On Hand</th>
                    <th className="px-4 py-3.5 text-center w-1/12">Reserved</th>
                    <th className="px-4 py-3.5 w-1/6">Qty Change Offset</th>
                    <th className="px-4 py-3.5">Specific Audit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-zinc-850">
                  {allVariants.map(item => {
                    const rowState = bulkRows[item.variant.sku] || { qtyChange: '', reason: '' };
                    const changeNum = Number(rowState.qtyChange);
                    const isNonZero = !isNaN(changeNum) && changeNum !== 0;

                    return (
                      <tr 
                        key={item.variant.sku} 
                        className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-zinc-850/15 ${
                          isNonZero ? 'bg-[#0052FF]/[0.02] dark:bg-blue-950/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-[#0052FF] dark:text-blue-400">{item.variant.sku}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{item.variant.name}</p>
                            {item.variant.onHand <= item.product.lowStockThreshold && (
                              <span className="bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider inline-flex items-center gap-0.5 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                {language === 'en' ? 'Low Stock' : 'ዝቅተኛ ክምችት'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-none mt-1">{language === 'en' ? item.product.nameEn : item.product.nameAm}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-gray-900 dark:text-white">{item.variant.onHand}</td>
                        <td className="px-4 py-3 text-center font-mono text-gray-400">{item.variant.reserved}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="e.g. +10 or -3"
                              value={rowState.qtyChange}
                              onChange={e => handleBulkCellChange(item.variant.sku, e.target.value)}
                              className={`w-24 border text-center font-mono font-bold py-1 px-1.5 rounded-lg text-xs focus:outline-none transition-all ${
                                isNonZero 
                                  ? changeNum > 0
                                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600 dark:text-emerald-400'
                                    : 'border-red-500 bg-red-50/20 text-red-600 dark:text-red-450'
                                  : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black'
                              }`}
                            />
                            {isNonZero && (
                              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                                changeNum > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {changeNum > 0 ? '↑' : '↓'} {Math.round(item.variant.onHand + changeNum)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="Standard cycle check"
                            value={rowState.reason}
                            onChange={e => handleBulkReasonChange(item.variant.sku, e.target.value)}
                            className="w-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-2.5 py-1 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-black font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* CSV File simulation parser */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
                  {language === 'en' ? 'CSV Inventory Replenishment Loader' : 'በCSV ፋይል አጠቃላይ ክምችት ማዘመኛ'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {language === 'en' 
                    ? 'Upload standard format CSV tables to synchronize massive stock changes instantly.' 
                    : 'ባለብዙ ምርት መጠኖችን በአንድ ጊዜ ማዘመኛ የCSV ቅርጸቶችን መጫን ይችላሉ።'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadCSVSample}
                className="text-[10px] font-black border border-gray-200 dark:border-zinc-700 text-[#0052FF] dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                {language === 'en' ? 'Load Demo CSV Table' : 'የሙከራ CSV ሰንጠረዥ ጫን'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
              <div className="lg:col-span-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex justify-between">
                    <span>CSV Code Plaintext</span>
                    <span className="text-[9px] text-gray-450 font-mono">Format: sku,quantity_offset</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="sku,quantity_offset&#10;JB-BROWN,15&#10;JB-SMALL,-3"
                    value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                    className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-black text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                      {language === 'en' ? 'Consolidated Ledger Note' : 'የአጠቃላይ ምዝግብ ማስታወሻ'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bulk CBE arrival restock shipment"
                      value={csvReason}
                      onChange={e => setCsvReason(e.target.value)}
                      className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-black font-semibold"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleProcessCSV}
                      disabled={bulkIsSubmitting}
                      className="w-full py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{language === 'en' ? 'Process and Parse CSV' : 'አካሂድ እና አዘምን'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-center">
                {csvMessage ? (
                  <div className={`p-4 border rounded-xl text-xs space-y-2 leading-relaxed ${
                    csvMessage.type === 'success' 
                      ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-950/30 dark:text-emerald-400' 
                      : 'bg-red-50/40 border-red-100 text-red-800 dark:bg-red-950/10 dark:border-red-950/30 dark:text-red-400'
                  }`}>
                    <div className="flex items-center gap-2 font-bold">
                      <span>{csvMessage.type === 'success' ? '✓' : '⚠️'}</span>
                      <p>{csvMessage.type === 'success' ? 'Succeeded' : 'Error Alert'}</p>
                    </div>
                    <p className="font-medium text-gray-600 dark:text-zinc-300">{csvMessage.text}</p>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-6 text-center text-xs text-gray-400 space-y-1 bg-gray-50/20 dark:bg-zinc-850/5">
                    <p className="font-bold uppercase tracking-wider text-[10px]">{language === 'en' ? 'Verification Status' : 'የማረጋገጫ ሁኔታ'}</p>
                    <p>{language === 'en' ? 'No batch upload processed yet.' : 'ምንም የቡድን ሰነድ አልተጫነም።'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {stockSubTab === 'LEDGER' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
                {language === 'en' ? 'Full Warehousing Ledger History' : 'ሙሉ የምርት ክምችት እንቅስቃሴ ታሪክ'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'en' 
                  ? 'Complete traceability audit logs of positive and negative SKU movements.' 
                  : 'የእቃዎች መጠን መጨመር እና መቀነስ ዝርዝር ኦዲት ታሪክ።'}
              </p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'en' ? "Search SKU, reason, actor..." : "SKU፣ ምክንያት፣ ተዋናይ ፈልግ..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-850 dark:text-white focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-zinc-850/30 text-gray-450 font-bold uppercase tracking-wider text-[9px] border-b border-gray-200 dark:border-zinc-850">
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">SKU Code</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5 text-center">Prev Qty</th>
                  <th className="px-4 py-3.5 text-center">New Qty</th>
                  <th className="px-4 py-3.5 text-center">Delta</th>
                  <th className="px-4 py-3.5">Reason / Log Detail</th>
                  <th className="px-4 py-3.5">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-zinc-850">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-850/10 transition-colors">
                    <td className="px-4 py-3 text-[10px] text-gray-400 font-semibold">{new Date(log.timestamp).toLocaleString(language === 'en' ? 'en-US' : 'am-ET')}</td>
                    <td className="px-4 py-3 font-bold text-[#0052FF] dark:text-blue-400">{log.sku}</td>
                    <td className="px-4 py-3 font-sans text-gray-900 dark:text-zinc-200 font-bold truncate max-w-[150px]">{log.productName}</td>
                    <td className="px-4 py-3 text-center font-bold text-gray-450">{log.previousQty}</td>
                    <td className="px-4 py-3 text-center font-bold text-gray-850 dark:text-white">{log.newQty}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-black font-mono text-[10px] px-2 py-0.5 rounded-full ${
                        log.difference > 0 
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {log.difference > 0 ? `+${log.difference}` : log.difference}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-gray-700 dark:text-zinc-350 font-semibold leading-normal">{log.reason}</td>
                    <td className="px-4 py-3 font-sans text-gray-500 dark:text-zinc-400 font-semibold">{log.actor}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center font-sans py-16 text-gray-400 dark:text-zinc-500">No matching stock movement logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stockSubTab === 'PREDICTIVE' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight uppercase">
                    {language === 'en' ? 'AI Inventory Planner & Predictive ML Engine' : 'የኤአይ ምርት ክምችት እቅድ እና የትንበያ ሞተር'}
                  </h4>
                </div>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                  {language === 'en' 
                    ? 'Applies linear regression and localized seasonal factors (Bega, Belg, Kiremt cycles) over 90 days of sales velocity to calculate optimal safety stocks and reorder points.'
                    : 'ምርጥ የደህንነት ክምችት መጠኖችን እና የማዘዣ ነጥቦችን ለማስላት በ90 ቀናት የሽያጭ ፍጥነት ላይ የመስመር ሬግሬሽን እና የአካባቢ ወቅታዊ ሁኔታዎችን ይተገብራል።'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
                  {language === 'en' ? 'ML Model v2.4 Active' : 'ኤምኤል ሞዴል v2.4 ንቁ'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Sidebar Controls & SKU selection */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Parameters Panel */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
                  <Sliders className="w-4 h-4 text-gray-400" />
                  <h5 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                    {language === 'en' ? 'Forecast Parameters' : 'የትንበያ መለኪያዎች'}
                  </h5>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Lead Time Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-500 dark:text-zinc-400">{language === 'en' ? 'Logistics Lead Time' : 'የሎጂስቲክስ ጊዜ (እርሳስ ጊዜ)'}</span>
                      <span className="font-mono text-[#0052FF] dark:text-blue-400">{leadTime} {language === 'en' ? 'days' : 'ቀናት'}</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={21}
                      value={leadTime}
                      onChange={e => setLeadTime(Number(e.target.value))}
                      className="w-full accent-[#0052FF]"
                    />
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {language === 'en' 
                        ? 'Expected days from placing order with Bole Hub wholesalers until physical receiving.' 
                        : 'የግዢ ትዕዛዝ ከተላለፈበት ጊዜ ጀምሮ እቃው መጋዘን እስኪደርስ የሚፈጅበት ቀናት።'}
                    </p>
                  </div>

                  {/* Service Level Factor */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-500 dark:text-zinc-400">{language === 'en' ? 'Target Stockout Protection (Service Level)' : 'የክምችት ማለቅ መከላከያ ዋስትና'}</label>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {[90, 95, 99].map(sl => (
                        <button
                          key={sl}
                          type="button"
                          onClick={() => setServiceLevel(sl)}
                          className={`py-1.5 px-2 rounded-lg font-black text-[10px] border transition-all cursor-pointer ${
                            serviceLevel === sl
                              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                              : 'bg-transparent border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-black hover:border-black'
                          }`}
                        >
                          {sl}% {sl === 90 ? 'Low' : sl === 95 ? 'Standard' : 'Maximum'}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {language === 'en'
                        ? `A higher service level creates larger safety stock buffers (Z-Score: ${serviceLevel === 90 ? '1.28' : serviceLevel === 95 ? '1.65' : '2.33'}).`
                        : `ከፍተኛ የጥበቃ ደረጃ ትልቅ የደህንነት ክምችት እንዲኖር ያደርጋል።`}
                    </p>
                  </div>

                  {/* Simulator option */}
                  <div className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[11px] text-gray-900 dark:text-white">{language === 'en' ? 'Simulate Seasonal Demand' : 'የወቅታዊ ፍላጎት አስመሳይ'}</p>
                      <p className="text-[9px] text-gray-400">{language === 'en' ? 'Generates mock history if orders are < 15' : 'ትዕዛዞች ከ 15 በታች ከሆኑ የሙከራ ታሪክ ይፈጥራል'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={simulateMissing}
                      onChange={e => setSimulateMissing(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#0052FF]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchPredictions}
                    disabled={isPredictLoading}
                    className="w-full py-2.5 bg-[#0052FF] hover:bg-blue-600 disabled:bg-blue-300 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${isPredictLoading ? 'animate-spin' : ''}`} />
                    <span>{isPredictLoading ? (language === 'en' ? 'Analyzing demand...' : 'ሽያጭ ታሪክ በመተንተን ላይ...') : (language === 'en' ? 'Analyze & Run Models' : 'አካሂድ እና እቅድ አውጣ')}</span>
                  </button>
                </div>
              </div>

              {/* SKU Selector Grid */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
                  <h5 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                    {language === 'en' ? 'Select SKU to Visualize' : 'ለመመልከት SKU ይምረጡ'}
                  </h5>
                  <span className="text-[9px] font-mono font-bold bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-500">
                    {predictions.length} {language === 'en' ? 'SKUs' : 'እቃዎች'}
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {predictions.map(p => {
                    const active = p.sku === activePredictSku;
                    const isAlert = p.currentStock <= p.recommendedReorderPoint;
                    return (
                      <button
                        key={p.sku}
                        onClick={() => setActivePredictSku(p.sku)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${
                          active
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md'
                            : 'bg-gray-50/40 hover:bg-gray-100/40 border-gray-100 dark:bg-zinc-850/10 dark:hover:bg-zinc-850/20 dark:border-zinc-800/40'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className={`font-mono text-[9px] font-bold ${active ? 'text-purple-300 dark:text-purple-700' : 'text-[#0052FF] dark:text-blue-400'}`}>{p.sku}</p>
                          <p className={`font-bold text-xs truncate ${active ? 'text-white dark:text-black' : 'text-gray-900 dark:text-white'}`}>{p.variantName}</p>
                          <p className="text-[9px] opacity-60 truncate">{language === 'en' ? p.productNameEn : p.productNameAm}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block font-mono font-black text-xs px-1.5 py-0.5 rounded-md ${
                            isAlert 
                              ? active 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                              : active
                                ? 'bg-zinc-800 text-zinc-200'
                                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}>
                            {p.currentStock} pcs
                          </span>
                          <p className="text-[8px] opacity-60 mt-1 uppercase font-bold tracking-wider">
                            {isAlert ? (language === 'en' ? 'Reorder' : 'ማዘዝ') : (language === 'en' ? 'Secure' : 'ደህንነቱ የተጠበቀ')}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {predictions.length === 0 && !isPredictLoading && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="font-bold uppercase tracking-wider text-[10px]">{language === 'en' ? 'No Analysis Loaded' : 'ትንበያ አልተጫነም'}</p>
                      <p className="text-[10px] mt-1">{language === 'en' ? 'Click "Analyze & Run Models" to calculate recommendations.' : 'ትንበያዎችን ለማስላት "አካሂድ" የሚለውን ይጫኑ።'}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Main Interactive Dashboard */}
            <div className="xl:col-span-8 space-y-6">
              
              {activePrediction ? (
                <div className="space-y-6">
                  
                  {/* Selected SKU Header Row */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#0052FF]/10 text-[#0052FF] dark:bg-blue-950/20 dark:text-blue-400 text-[10px] font-black font-mono px-2 py-0.5 rounded-md uppercase">
                          {activePrediction.brand}
                        </span>
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400 text-[10px] font-black font-mono px-2 py-0.5 rounded-md uppercase">
                          {activePrediction.category}
                        </span>
                      </div>
                      <h4 className="font-black text-base text-gray-900 dark:text-white mt-1.5 leading-tight">
                        {activePrediction.variantName}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 font-semibold">
                        {language === 'en' ? activePrediction.productNameEn : activePrediction.productNameAm} — SKU: <span className="font-mono font-bold text-gray-600 dark:text-zinc-300">{activePrediction.sku}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest">{language === 'en' ? 'Projected stockout' : 'ክምችት የሚያልቅበት ጊዜ'}</p>
                      <p className={`font-black font-mono text-xl leading-none mt-1 ${activePrediction.daysUntilStockout <= 10 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
                        {activePrediction.daysUntilStockout === 999 ? '90+ ' : `${activePrediction.daysUntilStockout} `}
                        <span className="text-xs font-bold font-sans text-gray-400">{language === 'en' ? 'days left' : 'ቀናት ቀሩት'}</span>
                      </p>
                      {activePrediction.daysUntilStockout <= leadTime && (
                        <p className="text-[9px] text-red-500 font-bold uppercase mt-1">⚠️ {language === 'en' ? 'Lead time breach risk!' : 'ከሎጂስቲክስ ጊዜ ያነሰ ቀናት ቀሩት!'}</p>
                      )}
                    </div>
                  </div>

                  {/* Core Supply Chain Statistics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <div className="flex justify-between items-start text-gray-400">
                        <TrendingUp className="w-4 h-4 text-[#0052FF]" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider">{language === 'en' ? 'Velocity' : 'ፍጥነት'}</span>
                      </div>
                      <p className="font-mono font-black text-lg text-gray-900 dark:text-white mt-1.5">{activePrediction.averageDailyVelocity} <span className="text-xs font-bold font-sans text-gray-400">/day</span></p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 leading-tight">{language === 'en' ? 'Average daily units sold.' : 'አማካይ የዕለት ሽያጭ መጠን።'}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <div className="flex justify-between items-start text-gray-400">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider">{language === 'en' ? 'Safety Stock' : 'ደህንነት ክምችት'}</span>
                      </div>
                      <p className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400 mt-1.5">{activePrediction.calculatedSafetyStock} <span className="text-xs font-bold font-sans text-gray-400">pcs</span></p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 leading-tight">{language === 'en' ? 'Buffer for transit delays.' : 'ለሎጂስቲክስ መዘግየት መጠባበቂያ።'}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <div className="flex justify-between items-start text-gray-400">
                        <Gauge className="w-4 h-4 text-purple-500" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider">{language === 'en' ? 'Reorder Point' : 'የማዘዣ ነጥብ (ROP)'}</span>
                      </div>
                      <p className="font-mono font-black text-lg text-purple-600 dark:text-purple-400 mt-1.5">{activePrediction.recommendedReorderPoint} <span className="text-xs font-bold font-sans text-gray-400">pcs</span></p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 leading-tight">{language === 'en' ? 'Reorder alert trigger limit.' : 'ትዕዛዝ ለማዘዝ ማስጠንቀቂያ ደረጃ።'}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <div className="flex justify-between items-start text-gray-400">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider">{language === 'en' ? 'Peak Day Demand' : 'ከፍተኛ የዕለት ፍላጎት'}</span>
                      </div>
                      <p className="font-mono font-black text-lg text-amber-600 dark:text-amber-400 mt-1.5">{activePrediction.peakDailyDemand} <span className="text-xs font-bold font-sans text-gray-400">pcs</span></p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 leading-tight">{language === 'en' ? 'Max recorded sales in a day.' : 'በአንድ ቀን ከፍተኛ የሽያጭ መጠን።'}</p>
                    </div>

                  </div>

                  {/* Recharts Timeline Visualizer */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <h5 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                          {language === 'en' ? '90-Day History vs. 30-Day ML Projected Forecast' : 'የ90 ቀናት ሽያጭ ታሪክ እና የ30 ቀናት ኤምኤል ትንበያ'}
                        </h5>
                      </div>
                      <div className="flex gap-4 text-[9px] font-bold text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-2.5 h-2.5 bg-[#0052FF]/25 border border-[#0052FF] rounded-xs"></span>
                          <span>History</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-2.5 h-0.5 bg-purple-500 border-t border-purple-500 border-dashed"></span>
                          <span>ML Forecast</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-2.5 h-2 bg-purple-200 opacity-50 rounded-xs"></span>
                          <span>Confidence Interval</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="historyGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0052FF" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0052FF" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="name" 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 'bold' }} 
                            interval={15}
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 'bold' }} 
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: 'none', 
                              borderRadius: '12px',
                              padding: '10px 14px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                            labelStyle={{ color: '#9ca3af', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}
                            itemStyle={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                          />
                          {/* Confidence interval shadow */}
                          <Area 
                            type="monotone" 
                            dataKey="lower" 
                            stroke="none" 
                            fill="none" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="upper" 
                            stroke="none" 
                            fill="#d8b4fe" 
                            fillOpacity={0.25}
                          />
                          {/* Historical sales */}
                          <Area 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#0052FF" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#historyGrad)" 
                          />
                          {/* Projected sales */}
                          <Line 
                            type="monotone" 
                            dataKey="forecast" 
                            stroke="#8b5cf6" 
                            strokeWidth={2.5}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                          {/* Reference lines */}
                          <ReferenceLine 
                            y={activePrediction.recommendedReorderPoint} 
                            stroke="#ef4444" 
                            strokeDasharray="3 3" 
                            strokeWidth={1.5}
                          />
                          <ReferenceLine 
                            y={activePrediction.calculatedSafetyStock} 
                            stroke="#f59e0b" 
                            strokeDasharray="3 3" 
                            strokeWidth={1.5}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap justify-between gap-4 text-[10px] text-gray-400 bg-gray-50/50 dark:bg-zinc-850/10 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                        <span>{language === 'en' ? `Reorder Point (ROP): ${activePrediction.recommendedReorderPoint} units` : `የማዘዣ ነጥብ፡ ${activePrediction.recommendedReorderPoint} እቃዎች`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                        <span>{language === 'en' ? `Safety Stock Buffer: ${activePrediction.calculatedSafetyStock} units` : `የደህንነት ክምችት መጠባበቂያ፡ ${activePrediction.calculatedSafetyStock} እቃዎች`}</span>
                      </div>
                      <p className="text-gray-400 dark:text-zinc-500 italic">
                        {language === 'en' ? '*Dashed bands represent a 95% Model Confidence Boundary' : '*ባለ ነጥብ መስመሮቹ የሞዴሉን የትንበያ ወሰን ያሳያሉ'}
                      </p>
                    </div>
                  </div>

                  {/* Gemini AI Advisors Panel */}
                  <div className="relative overflow-hidden bg-gradient-to-tr from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-200/50 dark:border-purple-950/40 rounded-2xl p-6 space-y-4 shadow-xs">
                    
                    {/* Glowing aesthetic backdrop */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

                    <div className="flex justify-between items-center border-b border-purple-100/30 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500 animate-bounce" />
                        <h5 className="font-extrabold text-xs text-purple-800 dark:text-purple-400 uppercase tracking-widest">
                          {language === 'en' ? 'AI Supply Chain Consultant Advisory Report' : 'የኤአይ አቅርቦት ሰንሰለት አማካሪ ሪፖርት'}
                        </h5>
                      </div>
                      <button
                        onClick={() => fetchInsightForSku(activePrediction)}
                        disabled={isInsightLoading}
                        className="text-[9px] font-black uppercase text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isInsightLoading ? 'animate-spin' : ''}`} />
                        <span>{language === 'en' ? 'Recalculate AI Report' : 'ሪፖርት እንደገና አሻሽል'}</span>
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {isInsightLoading ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="py-6 space-y-3"
                        >
                          <div className="h-3.5 bg-purple-100 dark:bg-zinc-800 rounded-md w-full animate-pulse"></div>
                          <div className="h-3.5 bg-purple-100 dark:bg-zinc-800 rounded-md w-11/12 animate-pulse"></div>
                          <div className="h-3.5 bg-purple-50 dark:bg-zinc-800/80 rounded-md w-5/6 animate-pulse"></div>
                          <div className="flex items-center gap-2 pt-2">
                            <span className="inline-block w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                            <span className="text-[10px] text-purple-500 font-mono font-bold uppercase tracking-wider animate-pulse">
                              Consulting Addis Ababa logistics SLA models...
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <div className="text-xs font-semibold leading-relaxed text-gray-700 dark:text-zinc-300 space-y-3 whitespace-pre-line">
                            {aiInsights[activePrediction.sku] || (
                              language === 'en' 
                                ? 'No report generated. Click "Recalculate AI Report" to query Gemini.' 
                                : 'የኤአይ ሪፖርት አልተፈጠረም። ሪፖርቱን ለመፍጠር "ሪፖርት እንደገና አሻሽል" የሚለውን ይጫኑ።'
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick Warning badge */}
                    {activePrediction.currentStock <= activePrediction.recommendedReorderPoint && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-200/50 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-[10px] text-red-800 dark:text-red-400 font-bold uppercase tracking-wider">
                          {language === 'en' 
                            ? 'Warning: Active inventory level is BELOW the calculated critical reorder point!' 
                            : 'ማስጠንቀቂያ፡ በእጅዎ ያለው የምርት መጠን ከተሰላው ዝቅተኛ ደረጃ በታች ነው!'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Apply live threshold panel */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                        {language === 'en' ? 'Sync Recommendation with System Alert System' : 'ውጤቱን ከማንቂያ ደውል ስርዓት ጋር አገናኝ'}
                      </p>
                      <p className="text-[11px] text-gray-400 leading-normal max-w-xl">
                        {language === 'en' 
                          ? `Updates the low-stock alarm threshold for this variant in the live database from its default to ${activePrediction.recommendedReorderPoint} units.` 
                          : `በቀጥታ የውሂብ ጎታ ውስጥ ለዚህ ምርት ዝቅተኛ የክምችት መጠን ማስጠንቀቂያ ገደብን ወደ ${activePrediction.recommendedReorderPoint} እቃዎች ያስተካክላል።`}
                      </p>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                      {appliedThresholdSkus.has(activePrediction.sku) ? (
                        <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-850 p-2.5 rounded-xl flex items-center gap-2 justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                            {language === 'en' ? 'Threshold Applied & Synced!' : 'ገደብ በተሳካ ሁኔታ ተተግብሯል!'}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyThreshold(activePrediction.productId, activePrediction.sku, activePrediction.recommendedReorderPoint)}
                          disabled={applyingThresholdSku === activePrediction.sku}
                          className="w-full md:w-auto px-6 py-3 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {applyingThresholdSku === activePrediction.sku ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Database className="w-4 h-4" />
                          )}
                          <span>
                            {language === 'en' 
                              ? `Apply Recommended Threshold (${activePrediction.recommendedReorderPoint} pcs)` 
                              : `ገደቡን ተግብር (${activePrediction.recommendedReorderPoint} እቃዎች)`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-16 text-center space-y-4 shadow-xs">
                  <div className="mx-auto w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                      {language === 'en' ? 'No SKU Selected for Analysis' : 'ለመተንተን የተመረጠ SKU የለም'}
                    </h5>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {language === 'en' 
                        ? 'Click "Analyze & Run Models" in the parameters card, then select any variant SKU from the selector list to visualize forecasts.' 
                        : 'እባክዎን በግራ በኩል "አካሂድ" የሚለውን ይጫኑ፣ በመቀጠል ማንኛውንም SKU በመምረጥ የወደፊት ፍላጎቱን ይተንትኑ።'}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {stockSubTab === 'QR_CODES' && (
        <div className="space-y-6">
          {/* Welcome/Description Banner */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#0052FF]" />
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight uppercase">
                    {language === 'en' ? 'Merchant QR Label Generator & Laser Scanner' : 'የQR መለያ መፍጠሪያ እና ሌዘር ስካነር'}
                  </h4>
                </div>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                  {language === 'en'
                    ? 'Generate and print physical stock label tags encoded with unique variant SKUs. Use the high-fidelity simulated barcode laser scanner to rapidly count, restock, and adjust inventory levels in real-time.'
                    : 'ለእያንዳንዱ የምርት አይነት ልዩ SKU የያዙ የQR ኮድ መለያዎችን ይፍጠሩ እና ያትሙ። ፈጣን የክምችት ማስተካከያ ለማድረግ በተዘጋጀው የሌዘር ስካነር ሲሙሌተር በመጠቀም በቅጽበት የእቃዎችን መጠን ያዘምኑ።'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: QR Labels Catalog & Print Actions */}
            <div className="xl:col-span-7 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
                <h5 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  {language === 'en' ? 'Printable QR Stock Labels' : 'ሊታተሙ የሚችሉ የQR መለያዎች'}
                </h5>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/20 text-[#0052FF] font-black border border-blue-150 px-2.5 py-1 rounded uppercase tracking-wider">
                  {allVariants.length} {language === 'en' ? 'Active SKUs' : 'ንቁ SKUዎች'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {allVariants.map((item) => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.variant.sku)}`;
                  const isLow = item.variant.onHand <= item.product.lowStockThreshold;

                  return (
                    <div 
                      key={item.variant.sku} 
                      className={`border rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all ${
                        isLow 
                          ? 'border-red-200 bg-red-50/10 dark:border-red-950/50' 
                          : 'border-gray-150 bg-gray-50/20 dark:border-zinc-800/60 dark:bg-zinc-850/10'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* QR Code Graphic representation */}
                        <div className="w-24 h-24 bg-white p-2 rounded-xl border border-gray-200 shrink-0 flex items-center justify-center relative group">
                          <img 
                            src={qrUrl} 
                            alt={`QR for ${item.variant.sku}`} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-wider">
                            {language === 'en' ? 'Printable' : 'የሚታተም'}
                          </div>
                        </div>

                        {/* Product/SKU stats */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-[10px] font-mono font-black text-[#0052FF] dark:text-blue-400">
                            {item.variant.sku}
                          </p>
                          <h6 className="font-extrabold text-xs text-gray-900 dark:text-white leading-tight truncate">
                            {language === 'en' ? item.product.nameEn : item.product.nameAm}
                          </h6>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold truncate">
                            {item.variant.name}
                          </p>

                          <div className="pt-1.5 flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                              isLow ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                            }`}>
                              {item.variant.onHand} {language === 'en' ? 'on hand' : 'በእጅ ያለ'}
                            </span>
                            {isLow && (
                              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 shadow-xs animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 text-white" />
                                {language === 'en' ? 'Low Stock' : 'ዝቅተኛ'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-150/60 dark:border-zinc-800 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPrintVariant(item)}
                          className="flex-1 py-1.5 bg-white border border-gray-250 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3 animate-pulse" />
                          <span>{language === 'en' ? 'Print Label' : 'መለያ አትም'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Trigger laser beep and open adjustment form
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
                            setActiveScanSku(item.variant.sku);
                            setScanSuccess(true);
                            setScannedVariant(item);
                            setScanAdjustQty(0);
                            setTimeout(() => setScanSuccess(false), 800);
                          }}
                          className="py-1.5 px-3 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3 h-3 text-[#0052FF]" />
                          <span>{language === 'en' ? 'Simulate Scan' : 'ስካን አድርግ'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Laser Scan Simulator */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* Scan Console Frame */}
              <div className="bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
                {/* Visual Scanner Camera view screen */}
                <div className="relative h-44 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center overflow-hidden">
                  
                  {/* Neon active grid markings */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#0052FF]"></div>
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#0052FF]"></div>
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#0052FF]"></div>
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#0052FF]"></div>

                  {/* Pulsing visual red scanning laser */}
                  <div className="absolute left-0 right-0 h-0.5 bg-red-500 opacity-80 shadow-[0_0_12px_#ef4444] animate-bounce" style={{ animationDuration: '3s' }}></div>

                  {/* Green Flash overlay when scanned successfully */}
                  <AnimatePresence>
                    {scanSuccess && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.85 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-emerald-500/35 z-10 flex items-center justify-center"
                      >
                        <div className="bg-emerald-600/90 text-white font-mono text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
                          <Check className="w-4 h-4" /> BEEP! SCAN SUCCESS
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Camera overlay text or scanned item */}
                  <div className="text-center space-y-1.5 z-0 px-4">
                    <Camera className="w-8 h-8 text-zinc-600 mx-auto animate-pulse" />
                    <p className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
                      KASMA LASER SENSOR v4.0 ACTIVE
                    </p>
                    {activeScanSku ? (
                      <p className="font-mono text-xs text-emerald-400 font-extrabold tracking-tight animate-pulse">
                        SKU LOCKED: {activeScanSku}
                      </p>
                    ) : (
                      <p className="font-mono text-[10px] text-zinc-450">
                        {language === 'en' ? 'Position printed QR code label' : 'የታተመውን QR መለያ ያስቀምጡ'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Simulated Tray Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500 block">
                    {language === 'en' ? 'Simulation Quick Scan Selector' : 'የማስመሰያ ፈጣን ስካን መምረጫ'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto bg-zinc-900/60 p-2 rounded-xl border border-zinc-805">
                    {allVariants.map((item) => (
                      <button
                        key={item.variant.sku}
                        type="button"
                        onClick={() => {
                          // Beep sound
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
                          setActiveScanSku(item.variant.sku);
                          setScanSuccess(true);
                          setScannedVariant(item);
                          setScanAdjustQty(0);
                          setTimeout(() => setScanSuccess(false), 800);
                        }}
                        className={`py-1.5 px-2.5 rounded-lg border transition-all text-left text-[10px] font-mono truncate cursor-pointer ${
                          activeScanSku === item.variant.sku
                            ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        ⚡ Scan {item.variant.sku}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scanned product stock controller drawer */}
                <AnimatePresence mode="wait">
                  {scannedVariant ? (
                    <motion.form
                      key={scannedVariant.variant.sku}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (scanAdjustQty === 0) return;
                        onUpdateProductStock(
                          scannedVariant.product.id,
                          scannedVariant.variant.sku,
                          scanAdjustQty,
                          scanAdjustReason
                        );

                        setRecentScans(prev => [
                          {
                            timestamp: new Date(),
                            sku: scannedVariant.variant.sku,
                            productName: scannedVariant.product.nameEn,
                            prevQty: scannedVariant.variant.onHand,
                            newQty: scannedVariant.variant.onHand + scanAdjustQty,
                            delta: scanAdjustQty
                          },
                          ...prev
                        ]);

                        setScannedVariant(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            variant: {
                              ...prev.variant,
                              onHand: prev.variant.onHand + scanAdjustQty
                            }
                          };
                        });
                        
                        alert(
                          language === 'en'
                            ? `Rapid Stock Sync Completed! Adjusted SKU ${scannedVariant.variant.sku} by ${scanAdjustQty > 0 ? '+' : ''}${scanAdjustQty} units.`
                            : `የክምችት ማመሳሰል ተጠናቋል! ለSKU ${scannedVariant.variant.sku} በ ${scanAdjustQty > 0 ? '+' : ''}${scanAdjustQty} ተስተካክሏል።`
                        );
                        setScanAdjustQty(0);
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200"
                    >
                      <div className="flex justify-between items-start border-b border-zinc-800 pb-2">
                        <div>
                          <p className="text-[10px] font-mono font-bold text-[#0052FF]">{scannedVariant.variant.sku}</p>
                          <h6 className="font-bold text-xs text-white leading-tight mt-0.5">
                            {language === 'en' ? scannedVariant.product.nameEn : scannedVariant.product.nameAm}
                          </h6>
                          <p className="text-[10px] text-zinc-500 font-medium">{scannedVariant.variant.name}</p>
                        </div>
                        <span className="text-xs font-bold text-[#C5A059] font-mono shrink-0">
                          {scannedVariant.variant.onHand} {language === 'en' ? 'on-hand' : 'በእጅ ያለ'}
                        </span>
                      </div>

                      {/* Delta adjust adjustments */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                          {language === 'en' ? 'Adjustment Offset Amount' : 'የማስተካከያ መጠን'}
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setScanAdjustQty(prev => prev - 1)}
                            className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold hover:bg-zinc-700 text-white cursor-pointer"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => setScanAdjustQty(prev => prev - 5)}
                            className="w-10 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold hover:bg-zinc-700 text-white cursor-pointer"
                          >
                            -5
                          </button>
                          <input
                            type="number"
                            required
                            value={scanAdjustQty || ''}
                            onChange={(e) => setScanAdjustQty(Number(e.target.value))}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg h-8 text-center font-mono font-bold text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                            placeholder="0"
                          />
                          <button
                            type="button"
                            onClick={() => setScanAdjustQty(prev => prev + 5)}
                            className="w-10 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold hover:bg-zinc-700 text-white cursor-pointer"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => setScanAdjustQty(prev => prev + 1)}
                            className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold hover:bg-zinc-700 text-white cursor-pointer"
                          >
                            +1
                          </button>
                        </div>
                      </div>

                      {/* Reason input */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                          {language === 'en' ? 'Adjustment Audit Note' : 'የማስተካከያ ምክንያት'}
                        </label>
                        <input
                          type="text"
                          required
                          value={scanAdjustReason}
                          onChange={(e) => setScanAdjustReason(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-zinc-700"
                        />
                      </div>

                      {/* Confirm submit button */}
                      <button
                        type="submit"
                        disabled={scanAdjustQty === 0}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-[11px] rounded-xl tracking-wide uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Submit Rapid Sync' : 'ለውጦችን መዝግብ'}</span>
                      </button>
                    </motion.form>
                  ) : (
                    <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs">
                      {language === 'en' ? 'Scan a QR code label on the left to begin rapid stock adjustment.' : 'የክምችት መጠን ለማስተካከል በግራ በኩል ያለውን መለያ ስካን ያድርጉ።'}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Scans Session History */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">
                  {language === 'en' ? 'Scan-and-Adjust Session History' : 'የስካን እና ማስተካከያ ታሪክ'}
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {recentScans.map((log, index) => (
                    <div key={index} className="flex justify-between items-center text-[10px] border-b border-gray-50 dark:border-zinc-850 pb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-[#0052FF]">{log.sku}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-450">{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="font-bold text-gray-850 dark:text-zinc-300 truncate mt-0.5">{log.productName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-mono font-black px-1.5 py-0.5 rounded-md ${
                          log.delta > 0 
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                        }`}>
                          {log.delta > 0 ? `+${log.delta}` : log.delta}
                        </span>
                        <p className="text-[8px] text-gray-400 mt-1 font-bold">
                          {log.prevQty} → {log.newQty} pcs
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentScans.length === 0 && (
                    <p className="text-xs text-center text-gray-400 py-6">
                      {language === 'en' ? 'No scanner operations performed in this session.' : 'በዚህ ክፍለ ጊዜ ምንም አይነት ስካን አልተደረገም።'}
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* PRINT PREVIEW OVERLAY MODAL */}
      <AnimatePresence>
        {selectedPrintVariant && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-zinc-950 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl relative"
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
              <div id="physical-printed-label" className="border-4 border-dashed border-zinc-950 p-6 bg-white flex flex-col items-center text-center space-y-4 rounded-xl relative overflow-hidden">
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
                    const printContents = document.getElementById('physical-printed-label')?.outerHTML;
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

    </div>
  );
}

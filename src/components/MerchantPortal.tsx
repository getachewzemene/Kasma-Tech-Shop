import React, { useState, useEffect, useMemo } from 'react';
import { Product, Merchant, StockMovementLog, Order } from '../types';
import { jsPDF } from 'jspdf';
import { 
  Store, 
  DollarSign, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  Layers, 
  FileText, 
  CheckCircle, 
  Plus, 
  ClipboardList, 
  ArrowUpRight, 
  TrendingUp, 
  BarChart3, 
  PackageCheck, 
  Package, 
  Bell, 
  X, 
  Sparkles, 
  Building, 
  Wallet, 
  History, 
  UserCheck, 
  ShieldAlert, 
  UploadCloud, 
  Check, 
  Edit3, 
  PlusCircle, 
  Download, 
  LayoutDashboard,
  Percent,
  Calendar,
  Globe,
  Briefcase,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  dispatchWhatsAppLowStockAlert, 
  dispatchBulkWhatsAppLowStockAlert, 
  LowStockItemInfo 
} from '../utils/whatsappNotifications';

// Modular Imports
import DashboardTab from './merchant/DashboardTab';
import OrdersTab from './merchant/OrdersTab';
import CatalogTab from './merchant/CatalogTab';
import StockTab from './merchant/StockTab';
import PayoutTab from './merchant/PayoutTab';
import KycTab from './merchant/KycTab';
import ForecastTab from './merchant/ForecastTab';
import PerformanceTab from './merchant/PerformanceTab';
import StockActivityTab from './merchant/StockActivityTab';

interface MerchantPortalProps {
  products: Product[];
  merchants: Merchant[];
  stockLogs: StockMovementLog[];
  orders: Order[];
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
  onUpdateProductStock: (productId: string, sku: string, qtyChange: number, reason: string) => void;
  onBulkUpdateProductStock?: (adjustments: { productId: string; sku: string; qtyChange: number; reason: string }[]) => Promise<{ success: boolean; error?: string }>;
  onUpdateProductThreshold?: (productId: string, threshold: number) => void;
  onAddAuditLog: (actor: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => void;
  onUpdateMerchantKyc: (merchantId: string, status: 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'APPROVED', docName?: string) => void;
  onRequestPayout: (merchantId: string, amount: number, bank: string, account: string) => void;
  language: 'en' | 'am';
  onLogout?: () => void;
  onOrderUpdated?: (order: Order) => void;
}

export default function MerchantPortal({
  products,
  merchants,
  stockLogs,
  orders,
  onAddProduct,
  onBulkUpdateProducts,
  onUpdateProductStock,
  onBulkUpdateProductStock,
  onUpdateProductThreshold,
  onAddAuditLog,
  onUpdateMerchantKyc,
  onRequestPayout,
  language,
  onLogout,
  onOrderUpdated
}: MerchantPortalProps) {
  // Simulator State: Select active merchant (Default to Selam Agricultural or stored session)
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(() => {
    return sessionStorage.getItem('kasma_merchant_id') || 'm3';
  });
  const currentMerchant = useMemo(() => {
    return merchants.find(m => m.id === selectedMerchantId) || merchants[0];
  }, [merchants, selectedMerchantId]);

  // Main navigation tab & Collapsible Sidebar State
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'CATALOG' | 'STOCK' | 'STOCK_ACTIVITY' | 'FORECAST' | 'PERFORMANCE' | 'PAYOUT' | 'KYC'>('DASHBOARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Low stock background alarm system
  const [activeAlerts, setActiveAlerts] = useState<{ id: string; productId: string; productName: string; sku: string; onHand: number; threshold: number; timestamp: string; dismissed: boolean }[]>([]);
  const [prevTriggerKey, setPrevTriggerKey] = useState<string>('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Local notifications toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const merchantProducts = useMemo(() => {
    return products.filter(p => p.merchantId === currentMerchant.id);
  }, [products, currentMerchant.id]);

  const totalStockItems = useMemo(() => {
    return merchantProducts.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.onHand, 0), 0);
  }, [merchantProducts]);

  const lowStockItemsCount = useMemo(() => {
    return merchantProducts.filter(p => p.variants.some(v => v.onHand <= p.lowStockThreshold)).length;
  }, [merchantProducts]);

  const merchantOrders = useMemo(() => {
    return orders.filter(order =>
      order.items.some(item => item.product.merchantId === currentMerchant.id)
    );
  }, [orders, currentMerchant.id]);

  const merchantStockLogs = useMemo(() => {
    return stockLogs.filter(l =>
      merchantProducts.some(p => p.variants.some(v => v.sku === l.sku))
    );
  }, [stockLogs, merchantProducts]);

  // Automated low stock alert scanner
  useEffect(() => {
    const lowStockVariants = merchantProducts.flatMap(p => 
      p.variants
        .filter(v => v.onHand <= p.lowStockThreshold)
        .map(v => ({
          productId: p.id,
          productName: p.nameEn,
          sku: v.sku,
          onHand: v.onHand,
          threshold: p.lowStockThreshold
        }))
    );

    const triggerKey = lowStockVariants.map(v => `${v.sku}:${v.onHand}:${v.threshold}`).join('|');
    
    if (triggerKey !== prevTriggerKey) {
      setPrevTriggerKey(triggerKey);

      setActiveAlerts(prev => {
        const nextAlerts = lowStockVariants.map(v => {
          const existing = prev.find(a => a.sku === v.sku);
          return {
            id: existing?.id || `alert-${v.sku}-${Date.now()}`,
            productId: v.productId,
            productName: v.productName,
            sku: v.sku,
            onHand: v.onHand,
            threshold: v.threshold,
            timestamp: existing?.timestamp || new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'am-ET', { hour: '2-digit', minute: '2-digit' }),
            dismissed: existing ? existing.dismissed : false
          };
        });

        // Fire single toast notification for newly reached levels
        lowStockVariants.forEach(v => {
          const alreadyExisted = prev.some(a => a.sku === v.sku);
          if (!alreadyExisted) {
            showToast(
              language === 'en'
                ? `⚠️ Low Stock Warning: SKU ${v.sku} has fallen to ${v.onHand} units.`
                : `⚠️ የአክሲዮን ማስጠንቀቂያ፡ SKU ${v.sku} ወደ ${v.onHand} ዝቅ ብሏል።`,
              'warning'
            );
          }
        });

        return nextAlerts;
      });
    }
  }, [products, currentMerchant.id, language, prevTriggerKey, merchantProducts]);

  // Downloadable report printing handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [0, 82, 255]; // Kasma Blue: #0052FF
    const secondaryColor = [197, 160, 89]; // Kasma Gold: #C5A059
    const textColor = [33, 37, 41];
    const grayColor = [100, 110, 120];
    const lightGray = [240, 242, 245];

    let y = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let pageNum = 1;

    const drawPageHeader = (pNum: number) => {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 5, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("KASMAShop - MERCHANT AUDIT PORTAL", 14, 11);
      doc.text(`Page ${pNum}`, pageWidth - 25, 11);
      
      doc.setDrawColor(230, 230, 230);
      doc.line(14, 13, pageWidth - 14, 13);
    };

    const checkSpace = (needed: number) => {
      if (y + needed > pageHeight - 15) {
        doc.addPage();
        pageNum++;
        drawPageHeader(pageNum);
        y = 22;
      }
    };

    drawPageHeader(pageNum);
    y = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Merchant Activity & Audit Summary", 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const generatedAt = new Date().toLocaleString(language === 'en' ? 'en-US' : 'am-ET');
    doc.text(`Report Generated On: ${generatedAt}`, 14, y);
    y += 10;

    // Profile Card
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(14, y, pageWidth - 28, 38, 3, 3, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(currentMerchant.storeName, 18, y + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    doc.text(`Merchant ID: ${currentMerchant.id}`, 18, y + 13);
    doc.text(`Account Status: ${currentMerchant.status}`, 18, y + 19);
    doc.text(`KYC Standing: ${currentMerchant.kycStatus}`, 18, y + 25);
    doc.text(`Escrow Balance: ${currentMerchant.balance.toLocaleString()} ETB`, 18, y + 31);

    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY STATISTICS", pageWidth - 100, y + 6);
    doc.setFont("helvetica", "normal");
    doc.text(`• Active Catalog Items: ${merchantProducts.length} items`, pageWidth - 100, y + 13);
    doc.text(`• Total Inventory Stock: ${totalStockItems} units`, pageWidth - 100, y + 19);
    doc.text(`• Low Stock Alerts: ${lowStockItemsCount} items`, pageWidth - 100, y + 25);
    doc.text(`• Total Orders Count: ${merchantOrders.length}`, pageWidth - 100, y + 31);
    
    y += 48;

    // Recent orders table
    checkSpace(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(language === 'en' ? "Recent Orders History" : "የቅርብ ጊዜ ትዕዛዞች ታሪክ", 14, y);
    y += 4;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    if (merchantOrders.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("No orders recorded for your products yet.", 16, y);
      y += 10;
    } else {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("Order ID", 16, y + 5);
      doc.text("Customer", 38, y + 5);
      doc.text("Phone", 70, y + 5);
      doc.text("Date", 100, y + 5);
      doc.text("Items & Quantities", 132, y + 5);
      doc.text("Merchant Share", pageWidth - 42, y + 5);
      y += 7;

      merchantOrders.forEach((order, idx) => {
        checkSpace(14);
        
        if (idx % 2 === 0) {
          doc.setFillColor(250, 251, 253);
          doc.rect(14, y, pageWidth - 28, 12, 'F');
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(14, y, pageWidth - 28, 12, 'F');
        }

        doc.setDrawColor(240, 240, 240);
        doc.line(14, y + 12, pageWidth - 14, y + 12);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(order.id, 16, y + 5);

        doc.setFont("helvetica", "normal");
        doc.text(order.customerName, 38, y + 5, { maxWidth: 30 });
        doc.text(order.customerPhone, 70, y + 5);
        
        const dateStr = new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET');
        doc.text(dateStr, 100, y + 5);

        const merchItems = order.items.filter(item => item.product.merchantId === currentMerchant.id);
        const merchShare = merchItems.reduce((s, item) => s + (item.price * item.quantity), 0);
        const itemsStr = merchItems.map(item => `${item.product.nameEn} (x${item.quantity})`).join(', ');

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(itemsStr, 132, y + 5, { maxWidth: pageWidth - 132 - 45 });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${merchShare.toLocaleString()} ETB`, pageWidth - 42, y + 5);
        
        y += 12;
      });
      y += 6;
    }

    // Stock logs table
    checkSpace(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(language === 'en' ? "Product Stock Movement Logs" : "የምርት ክምችት እንቅስቃሴ ምዝግብ ማስታወሻዎች", 14, y);
    y += 4;
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    if (merchantStockLogs.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("No stock movement events recorded for your products yet.", 16, y);
      y += 10;
    } else {
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("Timestamp", 16, y + 5);
      doc.text("SKU / Product Variant", 50, y + 5);
      doc.text("Delta / Shift", 110, y + 5);
      doc.text("Reason", 132, y + 5);
      doc.text("Actor", pageWidth - 32, y + 5);
      y += 7;

      merchantStockLogs.forEach((log, idx) => {
        checkSpace(14);

        if (idx % 2 === 0) {
          doc.setFillColor(253, 251, 248);
          doc.rect(14, y, pageWidth - 28, 12, 'F');
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(14, y, pageWidth - 28, 12, 'F');
        }

        doc.setDrawColor(240, 240, 240);
        doc.line(14, y + 12, pageWidth - 14, y + 12);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        const timeStr = new Date(log.timestamp).toLocaleString(language === 'en' ? 'en-US' : 'am-ET');
        doc.text(timeStr, 16, y + 5, { maxWidth: 32 });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(log.sku, 50, y + 5);

        doc.setFont("helvetica", "bold");
        const changeStr = log.difference > 0 ? `+${log.difference}` : `${log.difference}`;
        if (log.difference > 0) {
          doc.setTextColor(40, 167, 69);
        } else {
          doc.setTextColor(220, 53, 69);
        }
        doc.text(changeStr, 110, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(log.reason, 132, y + 5, { maxWidth: pageWidth - 132 - 35 });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(log.actor, pageWidth - 32, y + 5);

        y += 12;
      });
    }

    checkSpace(35);
    y += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("KASMAShop Auditing Compliance Certification", 14, y);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("This report serves as an official immutable audit record of live warehouse operations, inventory stock shifts,", 14, y + 4);
    doc.text("and recent customer payment transactions matching this registered merchant profile. Subject to CBE verification.", 14, y + 7);

    doc.save(`KasmaShop_Merchant_Summary_${currentMerchant.storeName.replace(/\s+/g, '_')}.pdf`);
    showToast(language === 'en' ? 'PDF Audit Summary downloaded successfully!' : 'የፒዲኤፍ የኦዲት ማጠቃለያ በተሳካ ሁኔታ ወርዷል!', 'success');
  };

  const activeAlertsCount = activeAlerts.filter(a => !a.dismissed).length;

  return (
    <div className="min-h-screen bg-[#EFF1F5] dark:bg-[#08090B] text-gray-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      
      {/* Desktop Sidebar Command Console */}
      <aside className={`hidden lg:flex lg:flex-col ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} bg-white dark:bg-zinc-950 border-r border-gray-150 dark:border-zinc-900 shrink-0 transition-all duration-300 ease-in-out`}>
        
        {/* Sidebar Header: Kasma Identity */}
        <div className={`p-4 border-b border-gray-100 dark:border-zinc-900 flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#0052FF] text-white rounded-xl shadow-xs shrink-0">
              <Store className="w-5 h-5" />
            </span>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="font-black text-sm tracking-wider uppercase text-gray-950 dark:text-white">
                  KASMA<span className="text-[#0052FF]">Hub</span>
                </h1>
                <span className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest block">
                  {language === 'en' ? 'Merchant Portal' : 'የነጋዴዎች ማዕከል'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {!isSidebarCollapsed && (
              <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[8.5px] font-black tracking-widest px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-950/40">
                LIVE
              </span>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? (language === 'en' ? 'Expand Sidebar' : 'ምናሌ አብራ') : (language === 'en' ? 'Shrink Sidebar' : 'ምናሌ አጥብብ')}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4.5 h-4.5 text-[#0052FF]" /> : <PanelLeftClose className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Merchant Active Profile Card */}
        <div className={`p-4 border-b border-gray-100 dark:border-zinc-900 bg-gray-50/40 dark:bg-zinc-950/40 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0052FF] to-blue-500 flex items-center justify-center font-black text-sm text-white uppercase shadow-xs shrink-0" title={currentMerchant.storeName}>
              {currentMerchant.storeName.charAt(0)}
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate min-w-0">
                <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">{currentMerchant.storeName}</p>
                <p className="text-[10px] text-gray-400 font-semibold truncate flex items-center gap-1.5 pt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentMerchant.kycStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {currentMerchant.kycStatus === 'APPROVED' ? (language === 'en' ? 'Verified Partner' : 'የተረጋገጠ አጋር') : (language === 'en' ? 'Verification Pending' : 'ማረጋገጫ በመጠባበቅ ላይ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Tabs Links */}
        <nav className="p-3 space-y-1.5 flex-1">
          
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            title={language === 'en' ? 'Command Center' : 'የቁጥጥር ማዕከል'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DASHBOARD'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Command Center' : 'የቁጥጥር ማዕከል'}</span>}
            </span>
            {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            title={language === 'en' ? 'Orders & Fulfillment' : 'ትዕዛዞች & ማድረስ'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ORDERS'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Package className="w-4.5 h-4.5 shrink-0 text-[#0052FF]" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Orders & Fulfillment' : 'ትዕዛዞች & ማድረስ'}</span>}
            </span>
            {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
          </button>

          <button
            onClick={() => setActiveTab('CATALOG')}
            title={language === 'en' ? 'Product Catalog' : 'የምርት ካታሎግ'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CATALOG'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <PlusCircle className="w-4.5 h-4.5 shrink-0" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Product Catalog' : 'የምርት ካታሎግ'}</span>}
            </span>
            {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
          </button>

          <button
            onClick={() => setActiveTab('STOCK')}
            title={language === 'en' ? 'Stock & SKU Audit' : 'የክምችት ኦዲት'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3 relative' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STOCK'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ClipboardList className="w-4.5 h-4.5 shrink-0" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Stock & SKU Audit' : 'የክምችት ኦዲት'}</span>}
            </span>
            {lowStockItemsCount > 0 && (
              isSidebarCollapsed ? (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              ) : (
                <span className="bg-red-500 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full animate-bounce">
                  {lowStockItemsCount}
                </span>
              )
            )}
          </button>

          <button
            onClick={() => setActiveTab('STOCK_ACTIVITY')}
            title={language === 'en' ? 'Stock Activity & Log' : 'የክምችት እንቅስቃሴ'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STOCK_ACTIVITY'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <History className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Stock Activity' : 'የክምችት እንቅስቃሴ'}</span>}
            </span>
            {!isSidebarCollapsed && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
                LOGS
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('FORECAST')}
            title={language === 'en' ? 'Reorder Forecast' : 'የመሙላት ትንበያ'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'FORECAST'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Reorder Forecast' : 'የመሙላት ትንበያ'}</span>}
            </span>
            {!isSidebarCollapsed && (
              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] px-1.5 py-0.5 rounded font-black">
                OLS
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PERFORMANCE')}
            title={language === 'en' ? 'Product Performance' : 'የምርት አፈጻጸም'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PERFORMANCE'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BarChart3 className="w-4.5 h-4.5 text-blue-500 shrink-0" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Product Performance' : 'የምርት አፈጻጸም'}</span>}
            </span>
            {!isSidebarCollapsed && (
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
                30D
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PAYOUT')}
            title={language === 'en' ? 'Bank Payouts' : 'የባንክ ክፍያዎች'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PAYOUT'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Wallet className="w-4.5 h-4.5 shrink-0" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Bank Payouts' : 'የባንክ ክፍያዎች'}</span>}
            </span>
            {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
          </button>

          <button
            onClick={() => setActiveTab('KYC')}
            title={language === 'en' ? 'Seller Verification' : 'ነጋዴ ማረጋገጫ'}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'KYC'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <UserCheck className="w-4.5 h-4.5 shrink-0" />
              {!isSidebarCollapsed && <span>{language === 'en' ? 'Seller Verification' : 'ነጋዴ ማረጋገጫ'}</span>}
            </span>
            {!isSidebarCollapsed && (
              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                currentMerchant.kycStatus === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500 animate-pulse'
              }`}>
                {currentMerchant.kycStatus}
              </span>
            )}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title={language === 'en' ? 'Log Out Account' : 'ከመለያ ውጣ'}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl text-xs font-bold transition-all cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 mt-4 border border-red-100 dark:border-red-900/30`}
            >
              <span className="flex items-center gap-2.5">
                <LogOut className="w-4.5 h-4.5 shrink-0" />
                {!isSidebarCollapsed && <span>{language === 'en' ? 'Log Out Account' : 'ከመለያ ውጣ'}</span>}
              </span>
            </button>
          )}

        </nav>

        {/* Sidebar Footer */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-gray-100 dark:border-zinc-900 text-center text-[10px] text-gray-400 font-semibold space-y-0.5 bg-gray-50/20 dark:bg-zinc-950/40">
            <p>© 2026 Kasma Technologies LLC.</p>
            <p>Federal Revenues Partner ID: 39401</p>
          </div>
        )}

      </aside>

      {/* Mobile Top Header & Navigation Bar */}
      <div className="lg:hidden bg-white dark:bg-zinc-950 border-b border-gray-150 dark:border-zinc-900 sticky top-0 z-30 shrink-0">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-[#0052FF] text-white rounded-lg shadow-xs shrink-0">
              <Store className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h1 className="font-black text-xs tracking-wider uppercase text-gray-950 dark:text-white leading-tight">
                KASMA<span className="text-[#0052FF]">Hub</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-500 truncate">{currentMerchant.storeName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
              currentMerchant.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-50 text-amber-600'
            }`}>
              {currentMerchant.kycStatus === 'APPROVED' ? 'Verified' : 'Pending'}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title={language === 'en' ? 'Log Out' : 'ውጣ'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Horizontal Pill Tabs for Mobile */}
        <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DASHBOARD'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Dashboard' : 'ዳሽቦርድ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ORDERS'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#0052FF]" />
            <span>{language === 'en' ? 'Orders' : 'ትዕዛዞች'}</span>
          </button>

          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CATALOG'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Catalog' : 'ካታሎግ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'STOCK'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Stock Audit' : 'ክምችት'}</span>
            {lowStockItemsCount > 0 && (
              <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full">
                {lowStockItemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('FORECAST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'FORECAST'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>{language === 'en' ? 'Forecast' : 'ትንበያ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('PAYOUT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PAYOUT'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Payouts' : 'ክፍያዎች'}</span>
          </button>

          <button
            onClick={() => setActiveTab('KYC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'KYC'
                ? 'bg-black text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Verification' : 'ማረጋገጫ'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Workspace Container */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Workspace Controls */}
        <header className="h-14 lg:h-16 bg-white dark:bg-zinc-950 border-b border-gray-150 dark:border-zinc-900 px-4 sm:px-8 flex items-center justify-between shrink-0">
          
          {/* Desktop Toggle Button & Breadcrumbs / Profile summary */}
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              title={isSidebarCollapsed ? (language === 'en' ? 'Expand Sidebar' : 'ምናሌ አብራ') : (language === 'en' ? 'Shrink Sidebar' : 'ምናሌ አጥብብ')}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4.5 h-4.5 text-[#0052FF]" /> : <PanelLeftClose className="w-4.5 h-4.5" />}
            </button>
            <span className="hidden sm:inline">{currentMerchant.storeName}</span>
            <ChevronRight className="w-3 h-3 text-gray-300 hidden sm:inline" />
            <span className="text-gray-950 dark:text-white uppercase tracking-wider text-[10.5px]">
              {activeTab}
            </span>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-4">
            
            {/* Download summary button */}
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 border border-gray-250 dark:border-zinc-800 hover:border-black dark:hover:border-white rounded-xl text-xs font-bold transition-all text-gray-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer bg-white dark:bg-zinc-900"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'Export Audit Report' : 'የኦዲት ሪፖርት አውርድ'}
              </span>
            </button>

            {/* Notification Alert Bell icon */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-600 dark:text-zinc-350 cursor-pointer relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
                    {activeAlertsCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown dialog */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-2xl shadow-xl z-50 overflow-hidden text-xs"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-zinc-900 flex justify-between items-center gap-2">
                        <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-[10px] shrink-0">
                          {language === 'en' ? 'SLA Alert Center' : 'የማስጠንቀቂያዎች ማዕከል'} ({activeAlertsCount})
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {activeAlertsCount > 0 && (
                            <button
                              onClick={() => {
                                const items: LowStockItemInfo[] = activeAlerts.filter(a => !a.dismissed).map(a => ({
                                  productName: a.productName,
                                  sku: a.sku,
                                  onHand: a.onHand,
                                  threshold: a.threshold,
                                  storeName: currentMerchant.storeName
                                }));
                                dispatchBulkWhatsAppLowStockAlert(items, currentMerchant.storeName, currentMerchant.phone, language);
                                showToast(language === 'en' ? 'Dispatched WhatsApp bulk low-stock report' : 'የዋትስአፕ አጠቃላይ ሪፖርት ተከፍቷል', 'success');
                              }}
                              className="text-[8.5px] font-black bg-[#25D366] hover:bg-[#20bd5a] text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
                              title="Send Bulk WhatsApp Low Stock Report"
                            >
                              <MessageCircle className="w-3 h-3 fill-current shrink-0" />
                              <span>WhatsApp</span>
                            </button>
                          )}
                          <button 
                            onClick={() => setIsNotificationOpen(false)}
                            className="p-1 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg text-gray-400"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-900">
                        {activeAlerts.filter(a => !a.dismissed).map(alert => (
                          <div key={alert.id} className="p-3.5 space-y-1.5 hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded">
                                {alert.sku}
                              </span>
                              <span className="text-[8px] text-gray-400 font-bold">{alert.timestamp}</span>
                            </div>
                            <p className="font-bold text-gray-800 dark:text-zinc-200 leading-normal">
                              {language === 'en' 
                                ? `Stock depleted to ${alert.onHand} units (Threshold: ${alert.threshold}).`
                                : `የክምችት መጠን ወደ ${alert.onHand} ዝቅ ብሏል (ገደብ፡ ${alert.threshold})።`}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">{alert.productName}</p>
                            
                            <div className="flex items-center justify-between pt-1 gap-2">
                              <button
                                onClick={() => {
                                  dispatchWhatsAppLowStockAlert({
                                    productName: alert.productName,
                                    sku: alert.sku,
                                    onHand: alert.onHand,
                                    threshold: alert.threshold,
                                    storeName: currentMerchant.storeName,
                                    merchantPhone: currentMerchant.phone
                                  }, currentMerchant.phone, language);
                                  showToast(language === 'en' ? 'Opened WhatsApp low stock alert template' : 'የዋትስአፕ ማስታወቂያ ተከፍቷል', 'info');
                                }}
                                className="text-[8.5px] font-black text-[#25D366] hover:bg-[#25D366]/10 border border-[#25D366]/30 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <MessageCircle className="w-3 h-3 fill-current shrink-0" />
                                <span>WhatsApp Alert</span>
                              </button>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setActiveAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, dismissed: true } : a));
                                  }}
                                  className="text-[9px] font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                  {language === 'en' ? 'Mute' : 'ደብቅ'}
                                </button>
                                <button
                                  onClick={() => {
                                    setIsNotificationOpen(false);
                                    setActiveTab('STOCK');
                                  }}
                                  className="text-[9px] font-black text-[#0052FF]"
                                >
                                  {language === 'en' ? 'Replenish' : 'ክምችት ሙላ'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {activeAlertsCount === 0 && (
                          <div className="p-8 text-center text-gray-400 space-y-1.5">
                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-600 mx-auto font-bold">✓</div>
                            <p className="font-bold text-gray-800 dark:text-zinc-200">
                              {language === 'en' ? 'Warehouse SLA optimal' : 'ሁሉም እቃዎች ተስማሚ መጠን አላቸው'}
                            </p>
                            <p className="text-[10px] text-gray-400">No low stock items detected.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>

        </header>

        {/* Content Workspace Frame */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {activeTab === 'DASHBOARD' && (
                <DashboardTab
                  products={products}
                  currentMerchant={currentMerchant}
                  stockLogs={stockLogs}
                  orders={orders}
                  language={language}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === 'ORDERS' && (
                <OrdersTab
                  orders={orders}
                  currentMerchant={currentMerchant}
                  language={language}
                  onOrderUpdated={onOrderUpdated}
                  showToast={showToast}
                />
              )}

              {activeTab === 'CATALOG' && (
                <CatalogTab
                  products={products}
                  currentMerchant={currentMerchant}
                  onAddProduct={onAddProduct}
                  onBulkUpdateProducts={onBulkUpdateProducts}
                  onAddAuditLog={onAddAuditLog}
                  language={language}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === 'STOCK' && (
                <StockTab
                  products={products}
                  currentMerchant={currentMerchant}
                  stockLogs={stockLogs}
                  orders={orders}
                  onUpdateProductStock={onUpdateProductStock}
                  onBulkUpdateProductStock={onBulkUpdateProductStock}
                  onUpdateProductThreshold={onUpdateProductThreshold}
                  language={language}
                />
              )}

              {activeTab === 'STOCK_ACTIVITY' && (
                <StockActivityTab
                  products={products}
                  currentMerchant={currentMerchant}
                  stockLogs={stockLogs}
                  orders={orders}
                  language={language}
                  onUpdateProductStock={onUpdateProductStock}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === 'FORECAST' && (
                <ForecastTab
                  products={products}
                  currentMerchant={currentMerchant}
                  orders={orders}
                  stockLogs={stockLogs}
                  onUpdateProductStock={onUpdateProductStock}
                  language={language}
                />
              )}

              {activeTab === 'PERFORMANCE' && (
                <PerformanceTab
                  products={products}
                  currentMerchant={currentMerchant}
                  orders={orders}
                  language={language}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === 'PAYOUT' && (
                <PayoutTab
                  currentMerchant={currentMerchant}
                  onRequestPayout={onRequestPayout}
                  language={language}
                />
              )}

              {activeTab === 'KYC' && (
                <KycTab
                  currentMerchant={currentMerchant}
                  onUpdateMerchantKyc={onUpdateMerchantKyc}
                  language={language}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </div>

      </main>

      {/* Floating global notifications alerts */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded-xl border shadow-xl flex items-center justify-between text-xs pointer-events-auto transition-all duration-300 transform translate-y-0 bg-zinc-950 border-zinc-850 text-white`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">
                {t.type === 'success' ? '✓' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
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

    </div>
  );
}

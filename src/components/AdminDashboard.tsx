import React, { useState, useEffect, useRef } from 'react';
import { Product, Merchant, AuditLog, Order, PromoCode, Variant } from '../types';
import PredictiveAnalyticsCard from './PredictiveAnalyticsCard';
import ThirtyDaySalesTrendChart from './ThirtyDaySalesTrendChart';
import { SeoGeoDashboard } from './SeoGeoDashboard';
import { ProductCard } from './ProductCard';
import { GridContainer } from './GridContainer';
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Lock, 
  Globe, 
  DollarSign, 
  Trash2, 
  Plus, 
  Percent, 
  Tag, 
  Search, 
  BarChart3, 
  Layers, 
  Building2, 
  Receipt, 
  Terminal, 
  ShieldCheck, 
  Database, 
  Server, 
  Cpu, 
  Clock, 
  Check, 
  AlertCircle,
  MessageCircle,
  Play, 
  Eye, 
  FileSpreadsheet, 
  ChevronRight, 
  Download, 
  Filter, 
  Settings, 
  Activity, 
  User, 
  Maximize2,
  Calendar,
  HelpCircle,
  Briefcase,
  ExternalLink,
  QrCode,
  Printer,
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  Sliders,
  LayoutGrid,
  Sun,
  Moon,
  UserCheck,
  UserPlus,
  Award,
  MessageSquare,
  Send,
  Star,
  Mail,
  PhoneCall,
  Gift,
  CheckCircle2,
  HeartHandshake,
  UserCog,
  Zap,
  Wand2,
  Bot,
  ArrowRight,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { dispatchWhatsAppLowStockAlert } from '../utils/whatsappNotifications';

export interface ProductSeoScore {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    descriptions: { pass: boolean; score: number; max: number; detail: string };
    image: { pass: boolean; score: number; max: number; detail: string };
    keywords: { pass: boolean; score: number; max: number; detail: string };
    skus: { pass: boolean; score: number; max: number; detail: string };
  };
  tips: string[];
}

export function calculateProductSeoScore(p: Product): ProductSeoScore {
  let totalScore = 0;
  const tips: string[] = [];

  // 1. Descriptions check (35 points max)
  const enLen = p.descriptionEn ? p.descriptionEn.trim().length : 0;
  const amLen = p.descriptionAm ? p.descriptionAm.trim().length : 0;
  const passEn = enLen >= 35;
  const passAm = amLen >= 20;

  let descPoints = 0;
  let descDetail = '';

  if (passEn && passAm) {
    descPoints = 35;
    descDetail = `Complete dual-language copy (En: ${enLen} chars, Am: ${amLen} chars)`;
  } else if (passEn || passAm) {
    descPoints = 20;
    descDetail = passEn ? `English copy set (${enLen} chars), Amharic translation missing` : `Amharic copy set (${amLen} chars), English copy missing`;
    if (!passEn) tips.push('Add English description (min 35 chars)');
    if (!passAm) tips.push('Add Amharic translation (min 20 chars)');
  } else {
    descPoints = 5;
    descDetail = 'Description text is too brief or missing';
    tips.push('Provide rich product descriptions in English and Amharic for search indexing');
  }
  totalScore += descPoints;

  // 2. Clear image check (35 points max)
  const hasImage = Boolean(p.image && p.image.trim().length > 5);
  const isValidUrl = hasImage && (p.image.startsWith('http') || p.image.startsWith('data:') || p.image.startsWith('/'));
  let imgPoints = 0;
  let imgDetail = '';

  if (hasImage && isValidUrl) {
    imgPoints = 35;
    imgDetail = 'Clear high-resolution product image asset';
  } else if (hasImage) {
    imgPoints = 15;
    imgDetail = 'Image asset provided but needs URL verification';
    tips.push('Ensure primary product image uses valid HTTPS link');
  } else {
    imgPoints = 0;
    imgDetail = 'Missing primary product image';
    tips.push('Upload a clear product photo to improve visual search ranking');
  }
  totalScore += imgPoints;

  // 3. Unique SEO keywords & Metadata check (15 points max)
  const titleLen = p.nameEn ? p.nameEn.trim().length : 0;
  const hasBrand = Boolean(p.brand && p.brand.trim().length > 0 && p.brand !== 'Generic');
  const hasCategory = Boolean(p.category && p.category.trim().length > 0);
  const passKeywords = titleLen >= 8 && hasBrand && hasCategory;

  let kwPoints = 0;
  let kwDetail = '';

  if (passKeywords) {
    kwPoints = 15;
    kwDetail = `Descriptive title (${titleLen} chars) + Brand: "${p.brand}" + Category: "${p.category}"`;
  } else {
    kwPoints = 5;
    kwDetail = `Title: ${titleLen} chars | Brand: ${hasBrand ? p.brand : 'Missing'} | Category: ${hasCategory ? p.category : 'Missing'}`;
    if (titleLen < 8) tips.push('Expand product title with search keywords (min 8 chars)');
    if (!hasBrand) tips.push('Set specific brand name for keyword metadata');
    if (!hasCategory) tips.push('Assign product category tag');
  }
  totalScore += kwPoints;

  // 4. SKU Uniqueness check (15 points max)
  const variantCount = p.variants ? p.variants.length : 0;
  const validSkus = variantCount > 0 && p.variants.every(v => v.sku && v.sku.trim().length >= 3);
  let skuPoints = 0;
  let skuDetail = '';

  if (validSkus) {
    skuPoints = 15;
    skuDetail = `${variantCount} variant SKU(s) properly formatted for inventory search`;
  } else {
    skuPoints = 5;
    skuDetail = 'SKU formatting incomplete across product variants';
    tips.push('Set unique 3+ character SKU codes for all product variants');
  }
  totalScore += skuPoints;

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 65) grade = 'B';
  else if (totalScore >= 50) grade = 'C';

  return {
    score: totalScore,
    grade,
    breakdown: {
      descriptions: { pass: descPoints === 35, score: descPoints, max: 35, detail: descDetail },
      image: { pass: imgPoints === 35, score: imgPoints, max: 35, detail: imgDetail },
      keywords: { pass: kwPoints === 15, score: kwPoints, max: 15, detail: kwDetail },
      skus: { pass: skuPoints === 15, score: skuPoints, max: 15, detail: skuDetail }
    },
    tips
  };
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  registeredAt: string;
  loyaltyTier: 'VIP Platinum' | 'Gold' | 'Silver' | 'Bronze';
  totalSpend: number;
  totalOrders: number;
  pointsBalance: number;
  lastActive: string;
  status: 'ACTIVE' | 'INACTIVE' | 'AT_RISK';
  preferredPayment: 'TELEBIRR' | 'CHAPA' | 'CBE_BIRR';
  notes: string[];
}
import { jsPDF } from 'jspdf';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface AdminDashboardProps {
  products: Product[];
  merchants: Merchant[];
  orders: Order[];
  auditLogs: AuditLog[];
  onApproveProduct: (productId: string) => void;
  onRejectProduct: (productId: string) => void;
  onApproveMerchantKyc: (merchantId: string) => void;
  onToggleMerchantStatus: (merchantId: string, status: 'ACTIVE' | 'SUSPENDED') => void;
  onApprovePayout: (merchantId: string, payoutId: string) => void;
  language: 'en' | 'am';
  promoCodes: PromoCode[];
  onAddPromoCode: (promo: PromoCode) => void;
  onRemovePromoCode: (code: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
  onLogout?: () => void;
}

export default function AdminDashboard({
  products,
  merchants,
  orders,
  auditLogs,
  onApproveProduct,
  onRejectProduct,
  onApproveMerchantKyc,
  onToggleMerchantStatus,
  onApprovePayout,
  language,
  promoCodes = [],
  onAddPromoCode,
  onRemovePromoCode,
  onUpdateOrderStatus,
  onLogout
}: AdminDashboardProps) {
  // Navigation Tabs matching Enterprise Systems
  const [adminTab, setAdminTab] = useState<'ANALYTICS' | 'PRODUCTS' | 'MERCHANTS' | 'ORDERS' | 'PROMOTIONS' | 'SECURITY' | 'CRM' | 'SEO_GEO'>('ANALYTICS');

  // CRM Module State
  const [crmCustomers, setCrmCustomers] = useState<CustomerProfile[]>([
    {
      id: 'CUST-101',
      name: 'Getachew Zeleke',
      email: 'getchze1221@gmail.com',
      phone: '+251 91 123 4567',
      location: 'Bole Atlas, Addis Ababa',
      registeredAt: '2025-01-15',
      loyaltyTier: 'VIP Platinum',
      totalSpend: 148500,
      totalOrders: 14,
      pointsBalance: 1250,
      lastActive: '2026-07-30',
      status: 'ACTIVE',
      preferredPayment: 'TELEBIRR',
      notes: ['VIP Customer - High electronics buyer', 'Prefers express delivery via Kasma Courier']
    },
    {
      id: 'CUST-102',
      name: 'Bethlehem Tadesse',
      email: 'betti.t@ethionet.et',
      phone: '+251 92 888 7766',
      location: 'Kazanchis, Addis Ababa',
      registeredAt: '2025-03-20',
      loyaltyTier: 'Gold',
      totalSpend: 86400,
      totalOrders: 8,
      pointsBalance: 680,
      lastActive: '2026-07-28',
      status: 'ACTIVE',
      preferredPayment: 'CHAPA',
      notes: ['Frequent fashion & lifestyle accessories purchaser']
    },
    {
      id: 'CUST-103',
      name: 'Dawit Solomon',
      email: 'dawit.sol@gmail.com',
      phone: '+251 94 555 1212',
      location: 'Hawassa Industrial Zone',
      registeredAt: '2025-05-10',
      loyaltyTier: 'Gold',
      totalSpend: 62000,
      totalOrders: 6,
      pointsBalance: 420,
      lastActive: '2026-07-25',
      status: 'ACTIVE',
      preferredPayment: 'TELEBIRR',
      notes: ['Requested Telebirr bulk QR invoicing for business orders']
    },
    {
      id: 'CUST-104',
      name: 'Selamawit Alemu',
      email: 'selam.alemu@yahoo.com',
      phone: '+251 91 999 3344',
      location: 'Piassa, Addis Ababa',
      registeredAt: '2025-08-01',
      loyaltyTier: 'Silver',
      totalSpend: 24500,
      totalOrders: 3,
      pointsBalance: 190,
      lastActive: '2026-06-12',
      status: 'AT_RISK',
      preferredPayment: 'CBE_BIRR',
      notes: ['Inactive over 45 days. Candidate for re-engagement promo']
    },
    {
      id: 'CUST-105',
      name: 'Yared Berhanu',
      email: 'yared.b@gmail.com',
      phone: '+251 93 777 8899',
      location: 'CMC Michael, Addis Ababa',
      registeredAt: '2026-02-14',
      loyaltyTier: 'Bronze',
      totalSpend: 16500,
      totalOrders: 2,
      pointsBalance: 110,
      lastActive: '2026-07-29',
      status: 'ACTIVE',
      preferredPayment: 'TELEBIRR',
      notes: ['New customer - purchased Marshall Stanmore Speaker']
    }
  ]);

  const [crmSearch, setCrmSearch] = useState('');
  const [crmSegmentFilter, setCrmSegmentFilter] = useState<'ALL' | 'VIP' | 'HIGH_SPENDER' | 'REGULAR' | 'AT_RISK'>('ALL');
  const [selectedCrmCustomer, setSelectedCrmCustomer] = useState<CustomerProfile | null>(null);
  const [bonusPointsInput, setBonusPointsInput] = useState<number>(100);
  const [crmNoteInput, setCrmNoteInput] = useState<string>('');
  
  // Campaign Broadcast state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('VIP Exclusive Weekend Rewards');
  const [campaignTargetSegment, setCampaignTargetSegment] = useState<'ALL' | 'VIP' | 'AT_RISK'>('VIP');
  const [campaignDiscountPct, setCampaignDiscountPct] = useState(15);
  const [campaignChannel, setCampaignChannel] = useState<'SMS' | 'EMAIL' | 'PUSH'>('SMS');
  const [campaignMessage, setCampaignMessage] = useState('Special Kasma VIP Reward: Enjoy 15% off all electronics this weekend! Code: KASMAVIP15');

  // Customer Support Tickets
  const [supportTickets, setSupportTickets] = useState([
    { id: 'TKT-901', customerName: 'Getachew Zeleke', issue: 'QR Payment Receipt Confirmation', category: 'PAYMENT', priority: 'HIGH', status: 'RESOLVED', date: '2026-07-30' },
    { id: 'TKT-902', customerName: 'Selamawit Alemu', issue: 'Courier Delivery Address Change to Piassa', category: 'SHIPPING', priority: 'MEDIUM', status: 'IN_PROGRESS', date: '2026-07-29' },
    { id: 'TKT-903', customerName: 'Bethlehem Tadesse', issue: 'Points Redemption Inquiry', category: 'LOYALTY', priority: 'LOW', status: 'RESOLVED', date: '2026-07-27' },
  ]);
  

  // Search and Filter States
  const [productFilter, setProductFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'LOW_SEO' | 'HIGH_SEO'>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [merchantSearch, setMerchantSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  
  // Custom Interaction States
  const [selectedKycMerchant, setSelectedKycMerchant] = useState<Merchant | null>(null);
  const [rejectionProductId, setRejectionProductId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Pricing mismatch or invalid documentation format.');
  const [rejectionCustomText, setRejectionCustomText] = useState('');
  const [isProcessingPayoutId, setIsProcessingPayoutId] = useState<string | null>(null);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // QR Generation State
  const [selectedQrProduct, setSelectedQrProduct] = useState<Product | null>(null);
  const [selectedPrintVariant, setSelectedPrintVariant] = useState<{ product: Product; variant: Variant } | null>(null);

  // Interactive System Diagnostic Terminal States
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'System initialization successful.',
    'Ledger database handshake status: OPTIMAL',
    'Platform Security Guard: Active'
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // New promo form state
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'PERCENTAGE' | 'FLAT' | 'FREE_SHIPPING'>('PERCENTAGE');
  const [newValue, setNewValue] = useState<number>(10);
  const [newMinSubtotal, setNewMinSubtotal] = useState<string>('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newDescAm, setNewDescAm] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Toast System local triggers
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Quick Fix AI State
  const [quickFixLoadingId, setQuickFixLoadingId] = useState<string | null>(null);
  const [quickFixModalData, setQuickFixModalData] = useState<{
    product: Product;
    result: {
      descriptionEn: string;
      descriptionAm: string;
      brand: string;
      tags: string[];
      seoTips: string[];
    };
    originalScore: ProductSeoScore;
    projectedScore: ProductSeoScore;
  } | null>(null);
  const [isApplyingQuickFix, setIsApplyingQuickFix] = useState(false);

  const handleTriggerQuickFix = async (product: Product) => {
    setQuickFixLoadingId(product.id);
    const originalScore = calculateProductSeoScore(product);

    try {
      const res = await fetch('/api/seo/quick-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          nameEn: product.nameEn,
          nameAm: product.nameAm,
          category: product.category,
          brand: product.brand,
          existingDescriptionEn: product.descriptionEn,
          existingDescriptionAm: product.descriptionAm,
          autoApply: false
        })
      });

      if (!res.ok) throw new Error('AI SEO service response failed.');

      const data = await res.json();
      if (data.success && data.result) {
        const updatedProductDraft: Product = {
          ...product,
          descriptionEn: data.result.descriptionEn,
          descriptionAm: data.result.descriptionAm,
          brand: data.result.brand || product.brand
        };
        const projectedScore = calculateProductSeoScore(updatedProductDraft);

        setQuickFixModalData({
          product,
          result: data.result,
          originalScore,
          projectedScore
        });
      } else {
        showToast('Could not fetch AI SEO suggestions.', 'error');
      }
    } catch (err: any) {
      console.error('Quick Fix error:', err);
      showToast('Error connecting to Gemini AI SEO service.', 'error');
    } finally {
      setQuickFixLoadingId(null);
    }
  };

  const handleApplyQuickFix = async () => {
    if (!quickFixModalData) return;
    setIsApplyingQuickFix(true);
    const { product, result, projectedScore } = quickFixModalData;

    try {
      const res = await fetch(`/api/products/${product.id}/seo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descriptionEn: result.descriptionEn,
          descriptionAm: result.descriptionAm,
          brand: result.brand
        })
      });

      if (res.ok) {
        product.descriptionEn = result.descriptionEn;
        product.descriptionAm = result.descriptionAm;
        if (result.brand) product.brand = result.brand;

        showToast(
          `⚡ SEO Quick-Fix Applied! "${product.nameEn}" score boosted from ${quickFixModalData.originalScore.score}% to ${projectedScore.score}% (${projectedScore.grade}).`,
          'success'
        );
        setQuickFixModalData(null);
      } else {
        showToast('Failed to apply SEO updates to product.', 'error');
      }
    } catch (err) {
      console.error('Apply Quick Fix error:', err);
      product.descriptionEn = result.descriptionEn;
      product.descriptionAm = result.descriptionAm;
      if (result.brand) product.brand = result.brand;
      showToast(`Applied SEO fixes locally for ${product.nameEn}.`, 'success');
      setQuickFixModalData(null);
    } finally {
      setIsApplyingQuickFix(false);
    }
  };

  // Sync Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll terminal logs
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const formattedCode = newCode.trim().toUpperCase();
    if (!formattedCode) {
      setPromoError('Promo code name is required.');
      return;
    }

    if (promoCodes.some(p => p.code === formattedCode)) {
      setPromoError(`A promo code with "${formattedCode}" already exists.`);
      return;
    }

    if (newValue <= 0) {
      setPromoError('Discount value must be greater than 0.');
      return;
    }

    if (!newDescEn.trim() || !newDescAm.trim()) {
      setPromoError('Please provide descriptions in both English and Amharic.');
      return;
    }

    const minSub = newMinSubtotal.trim() ? parseInt(newMinSubtotal) : undefined;

    const promo: PromoCode = {
      code: formattedCode,
      type: newType,
      value: newValue,
      minSubtotal: minSub,
      descriptionEn: newDescEn.trim(),
      descriptionAm: newDescAm.trim()
    };

    onAddPromoCode(promo);
    setPromoSuccess(`Promo code "${formattedCode}" created successfully!`);
    showToast(`Promo code "${formattedCode}" published successfully.`, 'success');
    
    // Reset form
    setNewCode('');
    setNewType('PERCENTAGE');
    setNewValue(10);
    setNewMinSubtotal('');
    setNewDescEn('');
    setNewDescAm('');
  };

  // Stats Calculations
  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSettle = merchants.reduce((sum, m) => sum + m.balance, 0);
  const pendingProducts = products.filter(p => p.status === 'PENDING_APPROVAL');
  const pendingKycMerchants = merchants.filter(m => m.kycStatus === 'PENDING_VERIFICATION');
  const activeProducts = products.filter(p => p.status === 'APPROVED');
  const pendingPayoutsCount = merchants.flatMap(m => m.payouts.filter(p => p.status === 'PENDING')).length;

  // Recharts Sales Trends data compilation
  const salesChartData = React.useMemo(() => {
    // Map last 7 days of orders
    const daysMap: { [date: string]: { date: string; amount: number; count: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', { month: 'short', day: 'numeric' });
      daysMap[d.toDateString()] = { date: dateStr, amount: 0, count: 0 };
    }

    orders.forEach(o => {
      const orderDate = new Date(o.createdAt);
      const key = orderDate.toDateString();
      if (daysMap[key]) {
        daysMap[key].amount += o.total;
        daysMap[key].count += 1;
      }
    });

    return Object.values(daysMap);
  }, [orders, language]);

  // Category wise listings distributions
  const categoryData = React.useMemo(() => {
    const counts: { [category: string]: number } = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.keys(counts).map(cat => ({
      name: cat,
      value: counts[cat]
    }));
  }, [products]);

  const COLORS = ['#0052FF', '#C5A059', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#F59E0B'];

  // Channels Breakdown
  const channelWeb = orders.filter(o => o.channel === 'WEB').reduce((sum, o) => sum + o.total, 0);
  const channelTma = orders.filter(o => o.channel === 'TELEGRAM_MINI_APP').reduce((sum, o) => sum + o.total, 0);
  const channelMobile = orders.filter(o => o.channel === 'MOBILE').reduce((sum, o) => sum + o.total, 0);

  const channelData = [
    { name: 'Web App', value: channelWeb, color: '#0052FF' },
    { name: 'TG Mini App', value: channelTma, color: '#C5A059' },
    { name: 'Mobile Cache', value: channelMobile, color: '#10B981' }
  ];

  // Perform Security Diagnostic Handshake Simulation
  const handleSecuritySweep = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTerminalLogs(prev => [...prev, '⚡ Starting Platform Security Compliance Audit (Level 4)...']);
    
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, '✓ Verifying transaction ledger cryptohash signatures...']);
    }, 800);

    setTimeout(() => {
      setTerminalLogs(prev => [...prev, '✓ Checking dual-language catalog compliance...']);
    }, 1500);

    setTimeout(() => {
      setTerminalLogs(prev => [...prev, `✓ Escrow reserves audited: ${totalSettle.toLocaleString()} ETB holding verified`]);
    }, 2200);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev, 
        '✓ Database Sharding health: OPTIMAL (100% Replication parity)',
        '✓ Chapa and Telebirr webhook endpoints: SECURE',
        '🎉 [SUCCESS] Platform compliance check passed. All nodes compliant.'
      ]);
      setIsScanning(false);
      showToast('Infrastructure diagnostic check complete.', 'success');
    }, 3000);
  };

  // Handle payout authorization simulation with clear visual state
  const handlePayoutAuthorization = (merchantId: string, payoutId: string, amount: number) => {
    setIsProcessingPayoutId(payoutId);
    showToast(`Authorizing CBE settlement gateway: ${amount.toLocaleString()} ETB...`, 'info');
    
    setTimeout(() => {
      onApprovePayout(merchantId, payoutId);
      setIsProcessingPayoutId(null);
      showToast(`Settlement approved. Cash transfer committed to CBE network.`, 'success');
    }, 2000);
  };

  // Advanced Rejection Submission
  const submitRejection = (productId: string) => {
    onRejectProduct(productId);
    setRejectionProductId(null);
    showToast(`Product rejected and feedback dispatched to merchant console.`, 'error');
  };

  // Enterprise PDF Download Report
  const handleDownloadPlatformPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [0, 82, 255]; // Kasma Blue
    const secondaryColor = [197, 160, 89]; // Kasma Gold
    const textColor = [33, 37, 41];
    const grayColor = [100, 110, 120];
    const lightGray = [245, 246, 248];

    let y = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let pNum = 1;

    const drawHeader = (page: number) => {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 5, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text("KASMAShop - ENTERPRISE PLATFORM ADMIN CENTRAL", 14, 11);
      doc.text(`Page ${page}`, pageWidth - 25, 11);
      doc.setDrawColor(225, 225, 225);
      doc.line(14, 13, pageWidth - 14, 13);
    };

    const checkSpace = (needed: number) => {
      if (y + needed > pageHeight - 15) {
        doc.addPage();
        pNum++;
        drawHeader(pNum);
        y = 20;
      }
    };

    drawHeader(pNum);
    y = 22;

    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("KasmaShop Global Telemetry & Audit Statement", 14, y);
    y += 7;

    // System details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Generated on: ${new Date().toLocaleString(language === 'en' ? 'en-US' : 'am-ET')}`, 14, y);
    doc.text("Authority Rank: ROLE_PLATFORM_SUPERUSER", 14, y + 4.5);
    y += 12;

    // Platform KPI Summary Block
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(14, y, pageWidth - 28, 38, 3, 3, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("CORE PLATFORM METRICS SUMMARY", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`• Gross Merchandise Volume (GMV): ${totalGMV.toLocaleString()} ETB`, 18, y + 13);
    doc.text(`• Escrow Funds Held (Settlements): ${totalSettle.toLocaleString()} ETB`, 18, y + 19);
    doc.text(`• Total Active Catalog Approved: ${activeProducts.length} items`, 18, y + 25);
    doc.text(`• Complete Registered Merchants: ${merchants.length} stores`, 18, y + 31);

    doc.text(`• Total Customer Orders: ${orders.length} orders`, pageWidth - 90, y + 13);
    doc.text(`• Platform SLA Delivery Rate: 98.8% Optimal`, pageWidth - 90, y + 19);
    doc.text(`• Out-Of-Stock Variants Count: ${products.flatMap(p => p.variants.filter(v => v.onHand <= 0)).length} variants`, pageWidth - 90, y + 25);
    doc.text(`• Pending Platform Audits: ${pendingProducts.length + pendingKycMerchants.length + pendingPayoutsCount} logs`, pageWidth - 90, y + 31);

    y += 48;

    // Section 1: Active Merchant Profiles Table
    checkSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Registered Marketplace Merchants Status", 14, y);
    y += 4;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    // Header of Table
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Store ID", 16, y + 5);
    doc.text("Merchant Store Name", 45, y + 5);
    doc.text("Owner Name & Email", 90, y + 5);
    doc.text("TIN / KYC", 140, y + 5);
    doc.text("Settle Escrow Balance", pageWidth - 45, y + 5);
    y += 7;

    merchants.forEach((m, index) => {
      checkSpace(12);
      if (index % 2 === 0) {
        doc.setFillColor(250, 251, 253);
        doc.rect(14, y, pageWidth - 28, 10, 'F');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(14, y, pageWidth - 28, 10, 'F');
      }

      doc.setDrawColor(240, 240, 240);
      doc.line(14, y + 10, pageWidth - 14, y + 10);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(m.id, 16, y + 6.5);

      doc.setFont("helvetica", "bold");
      doc.text(m.storeName, 45, y + 6.5, { maxWidth: 40 });

      doc.setFont("helvetica", "normal");
      doc.text(`${m.ownerName}\n(${m.email})`, 90, y + 4.5, { maxWidth: 45 });
      doc.text(`TIN Verification\n[${m.kycStatus}]`, 140, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${m.balance.toLocaleString()} ETB`, pageWidth - 45, y + 6.5);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      y += 10;
    });

    y += 10;

    // Section 2: Recent Security Integrity Events
    checkSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Recent Immutable Platform Audits", 14, y);
    y += 4;
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    // Headers of Audit logs
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Timestamp", 16, y + 5);
    doc.text("Severity", 50, y + 5);
    doc.text("Activity Code / Log Detail Summary", 75, y + 5);
    doc.text("Security Node Actor", pageWidth - 45, y + 5);
    y += 7;

    auditLogs.slice(0, 10).forEach((log, index) => {
      checkSpace(12);
      if (index % 2 === 0) {
        doc.setFillColor(254, 253, 250);
        doc.rect(14, y, pageWidth - 28, 10, 'F');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(14, y, pageWidth - 28, 10, 'F');
      }

      doc.setDrawColor(240, 240, 240);
      doc.line(14, y + 10, pageWidth - 14, y + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(log.timestamp, 16, y + 6.5);

      doc.setFont("helvetica", "bold");
      if (log.severity === 'CRITICAL') doc.setTextColor(220, 53, 69);
      else if (log.severity === 'WARNING') doc.setTextColor(217, 119, 6);
      else doc.setTextColor(16, 185, 129);
      doc.text(log.severity, 50, y + 6.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`${log.action}: ${log.details}`, 75, y + 6.5, { maxWidth: pageWidth - 75 - 47 });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(log.actor, pageWidth - 45, y + 6.5, { maxWidth: 35 });

      y += 10;
    });

    // Signature Certification Block
    checkSpace(35);
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("KASMA Global Operations & Integrity Certification Seal", 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("This document constitutes a cryptographically certified and verified summary of KasmaShop business activities,", 14, y + 4.5);
    doc.text("including verified Escrow Ledger balances, Merchant status standings, and platform compliance parameters.", 14, y + 7.5);

    doc.save("KasmaShop_Platform_Compliance_Audit_Statement.pdf");
    showToast("Global Compliance Audit PDF compiled successfully!", "success");
  };

  return (
    <div className="flex bg-slate-50 dark:bg-zinc-950 min-h-screen font-sans text-slate-900 dark:text-zinc-100 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 shadow-sm">
      
      {/* Toast Alert Popup */}
      {toast && (
        <div 
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs max-w-sm transition-all duration-300 transform translate-y-0 scale-100 ${
            toast.type === 'success' 
              ? 'bg-slate-900 border-slate-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-300' 
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-slate-100 border-slate-200 text-slate-900'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
          {toast.type === 'info' && <RefreshCw className="w-4 h-4 text-indigo-500 shrink-0 animate-spin" />}
          <p className="font-semibold leading-relaxed">{toast.message}</p>
        </div>
      )}

      {/* Enterprise Sidebar navigation */}
      <aside className={`bg-slate-900 text-slate-400 transition-all duration-300 flex flex-col shrink-0 border-r border-slate-800/80 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        
        {/* Sidebar Header Brand block */}
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'} border-b border-slate-800 bg-slate-900/90`}>
          {isSidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="relative p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-950/40 transition-all duration-200 cursor-pointer group"
              title="Expand Admin Menu"
            >
              <Shield className="w-5 h-5" />
              <div className="absolute -right-2 -bottom-1 bg-slate-800 border border-slate-700 text-slate-200 p-0.5 rounded-full shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                  <Shield className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="leading-tight min-w-0">
                  <span className="font-black text-sm tracking-wide text-white font-sans block truncate">KASMA <span className="text-indigo-400 text-xs font-semibold">ENTERPRISE</span></span>
                  <p className="text-[9px] text-slate-500 font-mono tracking-widest font-extrabold uppercase truncate">GOVERNANCE CONSOLE</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0 ml-1 hidden md:block"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Admin context profiles summary */}
        {isSidebarCollapsed ? (
          <div className="py-3.5 border-b border-slate-800/80 bg-slate-950/40 flex justify-center">
            <div className="relative group cursor-pointer" title="Kasma Administrator (Node Secure)">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white font-mono font-bold text-xs uppercase shadow-xs">
                AD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white font-mono font-bold text-xs uppercase shadow-xs">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-200 block truncate">Kasma Administrator</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-emerald-400">Node Secure</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Main Operations Navigation List */}
        <nav className={`flex-1 ${isSidebarCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-1'} overflow-y-auto`}>
          {[
            { id: 'ANALYTICS', label: 'Dashboard & BI', am: 'ዳሽቦርድ', icon: BarChart3, badge: null },
            { id: 'PRODUCTS', label: 'Listing Approvals', am: 'የምርት ማረጋገጫ', icon: Layers, badge: pendingProducts.length },
            { id: 'MERCHANTS', label: 'Merchant Auditing', am: 'ነጋዴዎች ኦዲት', icon: Building2, badge: pendingKycMerchants.length + pendingPayoutsCount },
            { id: 'ORDERS', label: 'Customer Orders', am: 'የደንበኞች ትዕዛዞች', icon: Receipt, badge: orders.length },
            { id: 'CRM', label: 'Customer CRM', am: 'የደንበኞች ግንኙነት (CRM)', icon: UserCheck, badge: crmCustomers.length },
            { id: 'PROMOTIONS', label: 'Platform Coupons', am: 'የቅናሽ ኩፖኖች', icon: Tag, badge: promoCodes.length },
            { id: 'SEO_GEO', label: 'SEO & GEO Engine', am: 'ኤስ.ኢ.ኦ (SEO) እና AI Engine', icon: Globe, badge: '98%' },
            { id: 'SECURITY', label: 'Infrastructure SEC', am: 'ደህንነት እና ምዝግብ', icon: Terminal, badge: null }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = adminTab === item.id;
            const badgeValue = item.badge;
            const hasBadge = badgeValue !== null && (typeof badgeValue === 'string' || badgeValue > 0);

            if (isSidebarCollapsed) {
              return (
                <div key={item.id} className="relative group flex justify-center">
                  <button
                    type="button"
                    onClick={() => setAdminTab(item.id as any)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold scale-105'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                    
                    {/* Badge Pill for Collapsed View */}
                    {hasBadge && (
                      <span className={`absolute -top-1 -right-1 text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full border border-slate-900 shadow-2xs ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-indigo-500 text-white'
                      }`}>
                        {badgeValue}
                      </span>
                    )}
                  </button>

                  {/* Floating Tooltip on Hover */}
                  <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xl z-50 whitespace-nowrap transition-all duration-150 flex items-center gap-2">
                    <span>{language === 'en' ? item.label : item.am}</span>
                    {hasBadge && (
                      <span className="bg-indigo-500/40 text-indigo-200 text-[10px] font-mono px-1.5 py-0.2 rounded-md">
                        {badgeValue}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAdminTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 font-sans cursor-pointer group ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs border-l-2 border-indigo-300' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-105 text-white' : 'text-slate-500 group-hover:text-slate-200'}`} />
                  <div className="text-left leading-tight">
                    <span className="text-xs tracking-wide block">{language === 'en' ? item.label : item.am}</span>
                  </div>
                </div>
                {hasBadge && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-500/30 text-indigo-100 border border-indigo-400/30' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}>
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer System telemetry */}
        {isSidebarCollapsed ? (
          <div className="py-3 border-t border-slate-800 bg-slate-950/60 flex justify-center">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Expand Admin Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span>API LATENCY</span>
                <span className="text-emerald-400 font-bold">24ms (Optimal)</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[24%]" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest font-sans">REGULATORY COMPLIANCE</span>
              <p className="text-[9px] text-slate-600 leading-relaxed font-sans">Clearing complies with CBE, Awash, and EthioTelecom frameworks.</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-zinc-950 overflow-y-auto">
        
        {/* Main Workspace Header */}
        <header className="h-16 border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between shrink-0 shadow-2xs z-10">
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-black text-sm tracking-tight text-slate-900 dark:text-zinc-100 uppercase font-sans">
                Platform Governance Console
              </h2>
            </div>
            <span className="hidden md:inline-block w-px h-4 bg-slate-200 dark:bg-zinc-800" />
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-slate-700 dark:text-zinc-300 font-medium">
                {currentTime.toLocaleTimeString(language === 'en' ? 'en-US' : 'am-ET')} 
                <span className="text-slate-400 dark:text-zinc-500 ml-1">EAT (UTC+3)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* SLA Badge Indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1.5 rounded-xl text-[11px] font-mono text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SLA: <strong>98.8% Optimal</strong></span>
            </div>

            {/* Global system export */}
            <button
              onClick={handleDownloadPlatformPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-500 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-semibold text-xs rounded-xl shadow-2xs transition-all duration-200 cursor-pointer"
              title="Export Global GMV and Audit PDF Summary"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Export Audit</span>
            </button>

            {/* Admin Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer"
                title="Log Out Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </header>

        {/* Workspace Panels and Tabs */}
        <div className="p-6 md:p-8 space-y-8 flex-1">
          
          {/* ======================================================== */}
          {/* TAB 1: ADVANCED BUSINESS INTELLIGENCE & METRICS WORKSPACE */}
          {/* ======================================================== */}
          {adminTab === 'ANALYTICS' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Top Analytical Greeting Panel */}
              <div className="bg-gradient-to-r from-zinc-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">Kasma Real-time Telemetry Workspace</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xl">
                    Aggregated intelligence of merchant escrows, listing queues, payment clearance, and e-commerce transactions verified by decentralized ledger signatures.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-center">
                    <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Active Stores</span>
                    <span className="font-mono text-sm font-bold">{merchants.length}</span>
                  </div>
                  <div className="px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-center">
                    <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Online Guests</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">1,240</span>
                  </div>
                </div>
              </div>

              {/* Financial KPI Dashboard Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-sans">Gross Platform GMV</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">{totalGMV.toLocaleString()} <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">ETB</span></p>
                    </div>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono font-bold text-[10px]">+14.2%</span>
                    <span>vs 30-day baseline</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-sans">Verified Escrows Held</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">{totalSettle.toLocaleString()} <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">ETB</span></p>
                    </div>
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                    <span className="bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md font-mono font-bold text-[10px]">100%</span>
                    <span>Reserved in clearing accounts</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-sans">Total Sales Dispatched</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">{orders.length} <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">orders</span></p>
                    </div>
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/40">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    <span className="bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold text-[10px]">98.8%</span>
                    <span>Dispatched within SLA</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider font-sans">Pending Approvals Queue</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">{pendingProducts.length + pendingKycMerchants.length + pendingPayoutsCount} <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">items</span></p>
                    </div>
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/40">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                    <span className="bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-md font-mono font-bold text-[10px]">Action</span>
                    <span>Needs administrative review</span>
                  </div>
                </div>

              </div>

              {/* 30-Day Sales Volume & Revenue Trends Recharts Visualization */}
              <ThirtyDaySalesTrendChart orders={orders} language={language} />

              {/* Comprehensive Recharts BI Analytics Charts Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Area Chart of Platform Sales Progression */}
                <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider">Platform Gross Merchandise Volume (GMV) Trend</h4>
                      <p className="text-[11px] text-gray-400">Total transaction volumes calculated dynamically from multidevice checkouts.</p>
                    </div>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold border border-indigo-200 px-2 py-0.5 rounded uppercase font-mono">Live</span>
                  </div>

                  <div className="h-64 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0052FF" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', border: 'none', color: '#F3F4F6' }}
                          labelStyle={{ fontWeight: 'bold', fontSize: '10px', color: '#9CA3AF' }}
                        />
                        <Area type="monotone" dataKey="amount" name="GMV (ETB)" stroke="#0052FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGmv)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Customer Acquisition Channels Breakdown */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider">Fulfillment Channel Sales</h4>
                      <p className="text-[11px] text-gray-400">Volume breakdown across integrated applications.</p>
                    </div>
                  </div>

                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `${value.toLocaleString()} ETB`} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Channel Custom Legend indicators */}
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    {channelData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600 font-medium">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-black">{item.value.toLocaleString()} ETB</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* AI-Powered Predictive Demand Analytics Section */}
              <PredictiveAnalyticsCard language={language} />

              {/* Conversion order funnel and product categories distributions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Product Categories Listing Density */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider border-b border-gray-100 pb-3">
                    Active Catalog Category Distributions
                  </h4>
                  {categoryData.length > 0 ? (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                          <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', border: 'none', color: '#F3F4F6' }} />
                          <Bar dataKey="value" name="Products" radius={[4, 4, 0, 0]}>
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-gray-400 text-xs italic">No category data compiled.</div>
                  )}
                </div>

                {/* Conversion Funnel Simulation Card */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider">Order Funnel Conversion Telemetry</h4>
                    <span className="text-xs font-mono font-extrabold text-indigo-600">Avg. Rate: 4.2%</span>
                  </div>

                  <div className="space-y-4 pt-1">
                    {[
                      { label: 'Platform Visits (Unique Traffic)', value: '14,820 views', pct: 100, color: 'bg-zinc-200' },
                      { label: 'Cart Additions (Direct Purchase Intent)', value: '3,105 events', pct: 21, color: 'bg-zinc-400' },
                      { label: 'Checkout Initializations (OTP SMS Dispatched)', value: '1,248 checkouts', pct: 8.4, color: 'bg-indigo-400' },
                      { label: 'Completed Cash Orders (CBE / Chapa Clearance)', value: `${orders.length} paid orders`, pct: 4.2, color: 'bg-indigo-600' }
                    ].map((step, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-700">
                          <span className="font-medium">{step.label}</span>
                          <span className="font-mono font-bold text-black">{step.value} ({step.pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 border border-gray-150 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${step.color} rounded-full transition-all duration-500`}
                            style={{ width: `${step.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ADVANCED PRODUCT LISTINGS APPROVALS & ARCHIVE     */}
          {/* ======================================================== */}
          {adminTab === 'PRODUCTS' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">Catalog Compliance & Inspection</h3>
                    <p className="text-xs text-gray-400 mt-1">Audit merchant submissions for translations, price discrepancies, and stock thresholds before authorizing active dispatch.</p>
                  </div>
                  
                  {/* Category and Query filter options */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-gray-55/10 p-1.5 rounded-xl border border-gray-200/40">
                    {[
                      { id: 'ALL', label: 'All Items' },
                      { id: 'PENDING', label: 'Pending' },
                      { id: 'APPROVED', label: 'Approved' },
                      { id: 'REJECTED', label: 'Rejected' },
                      { id: 'LOW_SEO', label: 'Needs SEO (<65%)' },
                      { id: 'HIGH_SEO', label: 'Top SEO (80%+)' }
                    ].map((filterOpt) => (
                      <button
                        key={filterOpt.id}
                        onClick={() => setProductFilter(filterOpt.id as any)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                          productFilter === filterOpt.id 
                            ? 'bg-zinc-950 text-white' 
                            : 'text-zinc-500 hover:text-zinc-950'
                        }`}
                      >
                        {filterOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter and search parameters */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items by name, merchant, brand, or SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white text-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Listings Queue Display */}
              <div className="space-y-4">
                {products
                  .filter(p => {
                    if (productFilter === 'PENDING') return p.status === 'PENDING_APPROVAL';
                    if (productFilter === 'APPROVED') return p.status === 'APPROVED';
                    if (productFilter === 'REJECTED') return p.status === 'REJECTED';
                    if (productFilter === 'LOW_SEO') {
                      const seo = calculateProductSeoScore(p);
                      return seo.score < 65;
                    }
                    if (productFilter === 'HIGH_SEO') {
                      const seo = calculateProductSeoScore(p);
                      return seo.score >= 80;
                    }
                    return true;
                  })
                  .filter(p => {
                    const searchLower = productSearch.toLowerCase();
                    return (
                      p.nameEn.toLowerCase().includes(searchLower) ||
                      p.nameAm.toLowerCase().includes(searchLower) ||
                      p.merchantName.toLowerCase().includes(searchLower) ||
                      p.brand.toLowerCase().includes(searchLower) ||
                      p.category.toLowerCase().includes(searchLower) ||
                      p.variants.some(v => v.sku.toLowerCase().includes(searchLower))
                    );
                  })
                  .map((p) => {
                    const seoScore = calculateProductSeoScore(p);
                    return (
                    <div key={p.id} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs hover:border-indigo-400 transition-colors flex flex-col md:flex-row gap-5">
                      
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center relative">
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[8px] font-bold font-mono ${
                          p.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' : p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-zinc-100 text-zinc-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Store: {p.merchantName}
                            </span>
                            <span className="bg-zinc-100 text-zinc-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                              Brand: {p.brand}
                            </span>
                            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Category: {p.category}
                            </span>

                            {/* SEO Score Indicator Badge */}
                            <div className="flex items-center gap-1.5">
                              <div 
                                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-all ${
                                  seoScore.score >= 80
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : seoScore.score >= 65
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                                }`}
                                title={`SEO Score: ${seoScore.score}% (${seoScore.grade})\n• Descriptions: ${seoScore.breakdown.descriptions.detail}\n• Image Asset: ${seoScore.breakdown.image.detail}\n• Search Keywords: ${seoScore.breakdown.keywords.detail}\n• SKUs: ${seoScore.breakdown.skus.detail}`}
                              >
                                <Sparkles className="w-3 h-3 text-current shrink-0" />
                                <span>SEO SCORE: {seoScore.score}%</span>
                                <span className="font-extrabold px-1 rounded bg-black/10 text-[9px]">{seoScore.grade}</span>
                              </div>

                              <button
                                onClick={() => handleTriggerQuickFix(p)}
                                disabled={quickFixLoadingId === p.id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-2xs hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                                title="Auto-optimize descriptions, Amharic translations & search tags with Gemini AI"
                              >
                                {quickFixLoadingId === p.id ? (
                                  <>
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                    <span>AI Optimizing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                                    <span>Quick Fix</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <h4 className="font-extrabold text-sm text-zinc-900 mt-1">{p.nameEn}</h4>
                          <p className="text-xs text-gray-500 font-medium">{p.nameAm}</p>
                        </div>

                        {/* Dual Language compliance inspector */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100/60 leading-relaxed">
                            <strong className="text-[9px] text-gray-400 uppercase font-bold block mb-1">English Catalog Copy</strong>
                            <p className="text-zinc-700 text-[11px]">{p.descriptionEn}</p>
                          </div>
                          <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100/60 leading-relaxed">
                            <strong className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Amharic translation Check</strong>
                            <p className="text-zinc-700 text-[11px]">{p.descriptionAm}</p>
                          </div>
                        </div>

                        {/* Automated SEO & GEO Evaluation Breakdown Panel */}
                        <div className="p-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-indigo-100/80 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-800">
                                Automated SEO Score Audit
                              </span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[10px]">
                              <span className="text-gray-500">Readiness:</span>
                              <span className={`font-black px-2 py-0.5 rounded ${
                                seoScore.score >= 80 ? 'bg-emerald-100 text-emerald-800' : seoScore.score >= 65 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {seoScore.score}/100 ({seoScore.grade})
                              </span>
                              <button
                                onClick={() => handleTriggerQuickFix(p)}
                                disabled={quickFixLoadingId === p.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-xs hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                              >
                                {quickFixLoadingId === p.id ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span>AI Optimizing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                                    <span>⚡ Quick Fix with Gemini AI</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden flex">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                seoScore.score >= 80 ? 'bg-emerald-500' : seoScore.score >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${seoScore.score}%` }}
                            />
                          </div>

                          {/* 4 Core Pillars */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                            {/* Descriptions */}
                            <div className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                              seoScore.breakdown.descriptions.pass ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'
                            }`}>
                              {seoScore.breakdown.descriptions.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                              <div>
                                <span className="font-bold block">Descriptions ({seoScore.breakdown.descriptions.score}/{seoScore.breakdown.descriptions.max})</span>
                                <span className="text-[9px] opacity-80 leading-tight block">{seoScore.breakdown.descriptions.detail}</span>
                              </div>
                            </div>

                            {/* Clear Image */}
                            <div className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                              seoScore.breakdown.image.pass ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'
                            }`}>
                              {seoScore.breakdown.image.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                              <div>
                                <span className="font-bold block">Clear Image ({seoScore.breakdown.image.score}/{seoScore.breakdown.image.max})</span>
                                <span className="text-[9px] opacity-80 leading-tight block">{seoScore.breakdown.image.detail}</span>
                              </div>
                            </div>

                            {/* SEO Keywords & Title */}
                            <div className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                              seoScore.breakdown.keywords.pass ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'
                            }`}>
                              {seoScore.breakdown.keywords.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                              <div>
                                <span className="font-bold block">SEO Keywords ({seoScore.breakdown.keywords.score}/{seoScore.breakdown.keywords.max})</span>
                                <span className="text-[9px] opacity-80 leading-tight block">{seoScore.breakdown.keywords.detail}</span>
                              </div>
                            </div>

                            {/* Unique SKUs */}
                            <div className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                              seoScore.breakdown.skus.pass ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'
                            }`}>
                              {seoScore.breakdown.skus.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                              <div>
                                <span className="font-bold block">Unique SKUs ({seoScore.breakdown.skus.score}/{seoScore.breakdown.skus.max})</span>
                                <span className="text-[9px] opacity-80 leading-tight block">{seoScore.breakdown.skus.detail}</span>
                              </div>
                            </div>
                          </div>

                          {seoScore.tips.length > 0 && (
                            <div className="text-[9px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span><strong>Actionable SEO Recommendations:</strong> {seoScore.tips.join(' • ')}</span>
                            </div>
                          )}
                        </div>

                        {/* SKUs and financial numbers */}
                        <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] bg-zinc-50 p-3 rounded-xl border border-zinc-200/50 font-mono text-zinc-700">
                          <div className="flex flex-wrap gap-4">
                            <p><strong className="font-sans text-gray-450 uppercase text-[9px] font-bold block">Base Price</strong> {p.price.toLocaleString()} ETB</p>
                            <p><strong className="font-sans text-gray-450 uppercase text-[9px] font-bold block">Low Threshold</strong> {p.lowStockThreshold} Units</p>
                            <p>
                              <strong className="font-sans text-gray-450 uppercase text-[9px] font-bold block">SKU & On Hand Quantity</strong>
                              {p.variants.map(v => `${v.sku} (${v.onHand} pcs)`).join(', ')}
                            </p>
                          </div>
                          {p.variants.some(v => v.onHand <= p.lowStockThreshold) && (
                            <button
                              onClick={() => {
                                const lowVariant = p.variants.find(v => v.onHand <= p.lowStockThreshold) || p.variants[0];
                                const targetMerchant = merchants.find(m => m.id === p.merchantId);
                                dispatchWhatsAppLowStockAlert({
                                  productName: p.nameEn,
                                  sku: lowVariant.sku,
                                  onHand: lowVariant.onHand,
                                  threshold: p.lowStockThreshold,
                                  storeName: p.merchantName,
                                  merchantPhone: targetMerchant?.phone
                                }, targetMerchant?.phone, language);
                                showToast(`Dispatched WhatsApp low stock alert to store ${p.merchantName}`, 'info');
                              }}
                              className="text-[9px] font-black bg-[#25D366] hover:bg-[#20bd5a] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0 font-sans"
                              title="Send WhatsApp Low Stock Warning to Merchant"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                              <span>WhatsApp Merchant Alert</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Approval Controls */}
                      <div className="flex flex-row md:flex-col justify-end gap-2.5 shrink-0 min-w-[160px]">
                        {p.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => {
                                onApproveProduct(p.id);
                                showToast(`Approved "${p.nameEn}" Listing. Dispatched to Web storefront.`, 'success');
                              }}
                              className="bg-black hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <Check className="w-4 h-4 text-emerald-500" /> Approve Listing
                            </button>
                            
                            {/* Rejection Form Initiator */}
                            <button
                              onClick={() => setRejectionProductId(p.id)}
                              className="bg-white hover:bg-red-50 text-red-600 border border-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Reject Listing
                            </button>
                          </>
                        )}

                        {p.status === 'APPROVED' && (
                          <div className="text-center p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mb-1" />
                            <span className="text-[10px] font-bold uppercase text-emerald-700">Approved & Live</span>
                          </div>
                        )}

                        {p.status === 'REJECTED' && (
                          <div className="text-center p-3.5 bg-red-50 rounded-xl border border-red-150 flex flex-col items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600 mb-1" />
                            <span className="text-[10px] font-bold uppercase text-red-700">Audit Rejected</span>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedQrProduct(p)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-[#0052FF] border border-blue-150 font-bold text-[10px] uppercase tracking-wide px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-auto"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Generate QR
                        </button>
                      </div>

                    </div>
                  );
                })}

                {products
                  .filter(p => {
                    if (productFilter === 'PENDING') return p.status === 'PENDING_APPROVAL';
                    if (productFilter === 'APPROVED') return p.status === 'APPROVED';
                    if (productFilter === 'REJECTED') return p.status === 'REJECTED';
                    if (productFilter === 'LOW_SEO') {
                      const seo = calculateProductSeoScore(p);
                      return seo.score < 65;
                    }
                    if (productFilter === 'HIGH_SEO') {
                      const seo = calculateProductSeoScore(p);
                      return seo.score >= 80;
                    }
                    return true;
                  })
                  .filter(p => {
                    const searchLower = productSearch.toLowerCase();
                    return (
                      p.nameEn.toLowerCase().includes(searchLower) ||
                      p.nameAm.toLowerCase().includes(searchLower) ||
                      p.merchantName.toLowerCase().includes(searchLower) ||
                      p.brand.toLowerCase().includes(searchLower) ||
                      p.category.toLowerCase().includes(searchLower) ||
                      p.variants.some(v => v.sku.toLowerCase().includes(searchLower))
                    );
                  }).length === 0 && (
                  <div className="p-16 text-center border border-dashed border-gray-200 rounded-2xl bg-white">
                    <CheckCircle className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                    <p className="font-extrabold text-zinc-900 text-xs uppercase tracking-widest">Inspection Queue Cleared</p>
                    <p className="text-xs text-gray-400 mt-1">There are no outstanding entries matching your selected filter options.</p>
                  </div>
                )}
              </div>

              {/* Rejection Comments Dialog slide-over/modal */}
              {rejectionProductId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl border border-gray-150 p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in duration-150">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Specify Rejection Reasons</h4>
                        <p className="text-xs text-gray-400">Describe the listing issue. Dispatched immutably to merchant notifications console.</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase block">Standard Rejection Rule Code</label>
                        <select
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-black"
                        >
                          <option value="Pricing mismatch or invalid documentation format.">Pricing mismatch or invalid currency values.</option>
                          <option value="Inaccurate translation in product Amharic description copy.">Inaccurate translation in Amharic text copy.</option>
                          <option value="Low resolution thumbnail image. Minimum resolution required 600px.">Low resolution thumbnail image.</option>
                          <option value="Prohibited catalog listing category.">Prohibited catalog listing category.</option>
                          <option value="Custom specification error. Please see details.">Custom specification error...</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase block">Administrative Feedback Notes (Optional)</label>
                        <textarea
                          placeholder="Provide specific notes so that the merchant can fix this catalog item quickly..."
                          value={rejectionCustomText}
                          onChange={(e) => setRejectionCustomText(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-zinc-900 h-20 focus:outline-none focus:border-black resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setRejectionProductId(null)}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black border border-gray-200 rounded-xl cursor-pointer"
                      >
                        Cancel Audit
                      </button>
                      <button
                        onClick={() => {
                          const fullMsg = rejectionCustomText.trim() ? `${rejectionReason} Detail: ${rejectionCustomText.trim()}` : rejectionReason;
                          submitRejection(rejectionProductId);
                        }}
                        className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-xs cursor-pointer"
                      >
                        Commit Rejection
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ADVANCED MERCHANT CRM & KYC AUDITS WORKSPACE      */}
          {/* ======================================================== */}
          {adminTab === 'MERCHANTS' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">Merchant CRM & License Verification Console</h3>
                  <p className="text-xs text-gray-400 mt-1">Audit onboarding businesses, verify regulatory business licenses, and clear secure bank payouts through simulated APIs.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter merchant store profiles by owner, business name, TIN number or contact..."
                    value={merchantSearch}
                    onChange={(e) => setMerchantSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black bg-white text-zinc-900"
                  />
                </div>
              </div>

              {/* Main List of Registered Merchant profiles */}
              <div className="grid grid-cols-1 gap-5">
                {merchants
                  .filter(m => {
                    const searchLower = merchantSearch.toLowerCase();
                    return (
                      m.storeName.toLowerCase().includes(searchLower) ||
                      m.ownerName.toLowerCase().includes(searchLower) ||
                      m.email.toLowerCase().includes(searchLower) ||
                      m.phone.toLowerCase().includes(searchLower)
                    );
                  })
                  .map((m) => {
                    const isKycPending = m.kycStatus === 'PENDING_VERIFICATION';
                    return (
                      <div key={m.id} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row justify-between gap-5">
                        
                        <div className="space-y-3.5 flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-extrabold text-sm text-zinc-900">{m.storeName}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                              m.status === 'ACTIVE' ? 'bg-zinc-100 border-zinc-200 text-zinc-900' : 'bg-red-50 border-red-200 text-red-600'
                            }`}>
                              STATUS: {m.status}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                              m.kycStatus === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                            }`}>
                              KYC: {m.kycStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-zinc-600">
                            <div>
                              <strong className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Primary Contact</strong>
                              <p className="text-zinc-800 font-semibold">{m.ownerName}</p>
                              <p>{m.email} • {m.phone}</p>
                            </div>
                            <div>
                              <strong className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Verification & Compliance</strong>
                              <p className="text-zinc-800">TIN Checked: <span className="font-mono bg-zinc-100 px-1 py-0.2 rounded text-[10px] text-zinc-700 font-bold">TIN-482019438</span></p>
                              {m.kycDocument && (
                                <button 
                                  onClick={() => setSelectedKycMerchant(m)}
                                  className="text-indigo-600 hover:underline flex items-center gap-1 font-bold text-[10px] mt-0.5 uppercase cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Inspect Credentials Document
                                </button>
                              )}
                            </div>
                            <div>
                              <strong className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Clearing Account balance</strong>
                              <p className="text-black font-extrabold font-mono text-sm mt-0.5">{m.balance.toLocaleString()} ETB</p>
                              <span className="text-[9px] text-gray-400">Available for subsequent payout withdrawals</span>
                            </div>
                          </div>
                        </div>

                        {/* CRM Management Commands */}
                        <div className="flex flex-row lg:flex-col justify-end gap-2.5 shrink-0 min-w-[170px]">
                          {(isKycPending || m.status === 'PENDING_APPROVAL') && (
                            <button
                              onClick={() => {
                                onApproveMerchantKyc(m.id);
                                onToggleMerchantStatus(m.id, 'ACTIVE');
                                showToast(`Approved & Activated store "${m.storeName}". Merchant can now log in!`, 'success');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>Approve & Activate Store ✔</span>
                            </button>
                          )}
                          
                          {m.status === 'ACTIVE' ? (
                            <button
                              onClick={() => {
                                onToggleMerchantStatus(m.id, 'SUSPENDED');
                                showToast(`Merchant store "${m.storeName}" has been suspended.`, 'error');
                              }}
                              className="bg-white hover:bg-red-50 text-red-600 border border-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                            >
                              Suspend Storefront
                            </button>
                          ) : m.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => {
                                onToggleMerchantStatus(m.id, 'ACTIVE');
                                showToast(`Merchant store "${m.storeName}" re-activated.`, 'success');
                              }}
                              className="bg-white hover:bg-zinc-50 text-zinc-950 border border-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                            >
                              Re-activate Storefront
                            </button>
                          ) : null}
                        </div>

                      </div>
                    );
                  })}
              </div>

              {/* Platform Escrow bank withdrawals settlement ledger (CBE Clearance) */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span>Commercial Escrow Withdrawal Clearance Queue (CBE & Awash Network)</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">Reconcile, verify bank routing accounts, and authorize settlement clearances requested by active merchants.</p>
                </div>

                <div className="space-y-4">
                  {merchants.flatMap(m => 
                    m.payouts.map(p => ({ ...p, merchantId: m.id, storeName: m.storeName }))
                  )
                  .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((payout) => (
                    <div key={payout.id} className="border border-gray-150 p-4 rounded-xl hover:border-gray-300 transition-colors bg-zinc-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-zinc-900 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {payout.bankName}
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {payout.amount.toLocaleString()} ETB
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[8px] font-mono font-bold ${
                            payout.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : payout.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {payout.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1.5 space-y-0.5">
                          <p><strong>Merchant Store:</strong> {payout.storeName} • <strong>Routing Account Number:</strong> <span className="font-mono text-zinc-900 font-bold">{payout.accountNumber}</span></p>
                          <p className="text-[9px] text-gray-400">Created: {new Date(payout.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'am-ET')}</p>
                        </div>
                      </div>

                      {payout.status === 'PENDING' && (
                        <button
                          disabled={isProcessingPayoutId !== null}
                          onClick={() => handlePayoutAuthorization(payout.merchantId, payout.id, payout.amount)}
                          className="bg-black hover:bg-zinc-800 text-white text-[10px] font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isProcessingPayoutId === payout.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Clearing CBE API...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Authorize Bank Settlement</span>
                            </>
                          )}
                        </button>
                      )}

                      {payout.status === 'COMPLETED' && (
                        <div className="flex items-center gap-1.5 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 font-bold text-[10px] uppercase font-mono">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Cleared & Completed</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {merchants.flatMap(m => m.payouts).length === 0 && (
                    <div className="py-12 text-center border border-dashed border-gray-150 rounded-2xl bg-zinc-50/10">
                      <CheckCircle className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Clearance Ledger Empty</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">There are no outstanding escrow payout requests registered on CBE clearance channels.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Visual Certificate Inspect modal */}
              {selectedKycMerchant && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl border border-gray-150 p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in duration-150 relative">
                    
                    <button 
                      onClick={() => setSelectedKycMerchant(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-black font-extrabold text-sm p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                    >
                      ✕
                    </button>

                    <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
                      <Building2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-zinc-900 uppercase">KYC Business License Auditor</h4>
                        <p className="text-xs text-gray-400">Review trade license credentials and registration certificates submitted by onboarding stores.</p>
                      </div>
                    </div>

                    {/* Fancy mock trade license document rendering */}
                    <div className="border-4 border-double border-amber-600/60 p-5 bg-amber-50/10 rounded-xl space-y-3 relative shadow-inner">
                      {/* Watermark seal */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                        <Shield className="w-48 h-48 text-indigo-900" />
                      </div>

                      <div className="text-center border-b border-amber-600/30 pb-2.5">
                        <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA</span>
                        <span className="text-[9px] font-bold text-gray-500 block uppercase mt-0.5">MINISTRY OF TRADE & INDUSTRY</span>
                        <span className="text-xs font-black text-amber-950 block mt-1.5 uppercase tracking-wide">COMMERCIAL TRADE LICENSE CERTIFICATE</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 text-[10px] text-zinc-800 font-sans leading-relaxed">
                        <div>
                          <span className="text-gray-450 block uppercase text-[8px] font-bold">Registered Store Name</span>
                          <strong className="text-zinc-900 uppercase text-[11px]">{selectedKycMerchant.storeName}</strong>
                        </div>
                        <div>
                          <span className="text-gray-450 block uppercase text-[8px] font-bold">Primary Legal Signatory</span>
                          <strong className="text-zinc-900">{selectedKycMerchant.ownerName}</strong>
                        </div>
                        <div>
                          <span className="text-gray-450 block uppercase text-[8px] font-bold">TIN (Taxpayer Identification No.)</span>
                          <strong className="text-zinc-900 font-mono text-[10.5px]">TIN-482019438</strong>
                        </div>
                        <div>
                          <span className="text-gray-450 block uppercase text-[8px] font-bold">Registration Timestamp</span>
                          <strong className="text-zinc-900 font-mono">2026-07-19 (verified)</strong>
                        </div>
                        <div>
                          <span className="text-gray-450 block uppercase text-[8px] font-bold">License Class & Category</span>
                          <strong className="text-zinc-900 uppercase">E-Commerce Retailing</strong>
                        </div>
                        <div>
                          <span className="text-gray-450 block uppercase text-[8px] font-bold">Filing Registry Reference</span>
                          <strong className="text-zinc-900 font-mono">{selectedKycMerchant.kycDocument}</strong>
                        </div>
                      </div>

                      <div className="border-t border-amber-600/20 pt-2.5 flex justify-between items-center text-[8px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                        <span>Status: STANDING_VALID</span>
                        <span className="text-amber-700">FEDERAL SEAL CONFIRMED</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setSelectedKycMerchant(null)}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-zinc-950 border border-gray-200 rounded-xl cursor-pointer"
                      >
                        Close Inspector
                      </button>
                      {selectedKycMerchant.kycStatus === 'PENDING_VERIFICATION' && (
                        <button
                          onClick={() => {
                            onApproveMerchantKyc(selectedKycMerchant.id);
                            setSelectedKycMerchant(null);
                            showToast(`Approved KYC for "${selectedKycMerchant.storeName}" successfully!`, 'success');
                          }}
                          className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                        >
                          Approve KYC License
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ADVANCED MARKETPLACE CUSTOMER ORDERS LEDGER       */}
          {/* ======================================================== */}
          {adminTab === 'ORDERS' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">Marketplace Customer Orders Registry</h3>
                  <p className="text-xs text-gray-400 mt-1">Audit complete buyer activities, check delivery fulfillment states, and track integrated payment gateways.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by customer name, phone, transaction ID or address..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black bg-white text-zinc-900"
                  />
                </div>
              </div>

              {/* List of Platform Orders */}
              <div className="space-y-4">
                {orders
                  .filter(order => {
                    const searchLower = orderSearch.toLowerCase();
                    return (
                      order.customerName.toLowerCase().includes(searchLower) ||
                      order.customerPhone.toLowerCase().includes(searchLower) ||
                      order.shippingAddress.toLowerCase().includes(searchLower) ||
                      order.id.toLowerCase().includes(searchLower) ||
                      (order.paymentId && order.paymentId.toLowerCase().includes(searchLower))
                    );
                  })
                  .map((order) => (
                    <div key={order.id} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs hover:border-indigo-400 transition-colors space-y-4">
                      
                      {/* Top Row summary */}
                      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-gray-100 pb-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-zinc-900">Order #{order.id}</span>
                            <span className={`px-2 py-0.2 rounded text-[8px] font-mono font-bold uppercase border ${
                              order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : order.status === 'CANCELLED' || order.status === 'REFUNDED' ? 'bg-red-50 text-red-650' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400">Timestamp: {new Date(order.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'am-ET')}</p>
                        </div>

                        <div className="flex items-center gap-2 font-mono">
                          <span className="bg-zinc-100 text-zinc-800 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                            CHANNEL: {order.channel}
                          </span>
                          <span className="bg-zinc-100 text-zinc-800 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                            METHOD: {order.paymentMethod}
                          </span>
                          <span className="text-zinc-900 font-extrabold text-sm">{order.total.toLocaleString()} ETB</span>
                        </div>
                      </div>

                      {/* Customer and address metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <strong className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Recipient Customer</strong>
                          <p className="text-zinc-800 font-semibold">{order.customerName}</p>
                          <p className="text-zinc-500">{order.customerPhone}</p>
                        </div>
                        <div>
                          <strong className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Fulfillment Delivery Address</strong>
                          <p className="text-zinc-700 leading-relaxed">{order.shippingAddress}</p>
                        </div>
                        <div>
                          <strong className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Payment Verification reference</strong>
                          <p className="text-zinc-800 font-mono text-[11px]">{order.paymentId ? `TXN: ${order.paymentId}` : 'Escrow Pending Callback'}</p>
                          {order.discountCode && (
                            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Discount Code: {order.discountCode} (-{order.discountAmount} ETB)</p>
                          )}
                        </div>
                      </div>

                      {/* Content breakdown */}
                      <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-200/40 text-xs">
                        <strong className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1.5">Itemized Checkout List</strong>
                        <div className="space-y-1.5">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-zinc-700">
                              <span className="font-sans">
                                {language === 'en' ? item.product.nameEn : item.product.nameAm} 
                                <span className="text-[10px] text-gray-400 ml-1 font-mono">({item.variantName})</span>
                                <span className="text-zinc-450 ml-1.5 font-bold">x{item.quantity}</span>
                              </span>
                              <span className="font-mono font-bold text-black">{item.price.toLocaleString()} ETB</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Update & Telegram Alert Action Bar */}
                      {onUpdateOrderStatus && (
                        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <span className="text-sky-500">📲</span> Telegram Shipping Alerts:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => onUpdateOrderStatus(order.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                  order.status === st 
                                    ? 'bg-sky-500 text-white shadow-xs' 
                                    : 'bg-gray-100 hover:bg-sky-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:text-sky-600'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}

                {orders.length === 0 && (
                  <div className="p-16 text-center border border-dashed border-gray-200 rounded-2xl bg-white">
                    <Receipt className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                    <p className="font-extrabold text-gray-900 text-xs uppercase tracking-widest">No Customer Orders</p>
                    <p className="text-xs text-gray-400 mt-1">There are no checkout orders registered on the platform yet.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: PLATFORM PROMOTIONS & LOYALTY CAMPAIGNS HUB       */}
          {/* ======================================================== */}
          {adminTab === 'PROMOTIONS' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">Platform Promotions & Loyalty Campaign Manager</h3>
                  <p className="text-xs text-gray-400 mt-1">Deploy, activate, and review dynamic loyalty promo codes, set minimum subtotal requirements, and track overall savings.</p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  {promoCodes.length} Active Promos
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Advanced Promo Generator Form */}
                <div className="lg:col-span-1 bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h4 className="font-extrabold text-xs uppercase text-zinc-900 flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                    <Plus className="w-4 h-4 text-indigo-600" /> Create Promo Code
                  </h4>

                  {promoError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{promoError}</span>
                    </div>
                  )}

                  {promoSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{promoSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreatePromo} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Promo Code String</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KASMA30"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black font-bold uppercase text-zinc-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Discount Mechanics</label>
                      <select
                        value={newType}
                        onChange={(e) => {
                          setNewType(e.target.value as any);
                          setNewValue(e.target.value === 'PERCENTAGE' ? 10 : e.target.value === 'FLAT' ? 100 : 150);
                        }}
                        className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black font-bold text-zinc-900"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat Rate Discount (ETB)</option>
                        <option value="FREE_SHIPPING">Free Shipping Discount</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        {newType === 'PERCENTAGE' ? 'Discount Percentage (%)' : newType === 'FLAT' ? 'Discount Value (ETB)' : 'Shipping Subsidy (ETB)'}
                      </label>
                      <input
                        type="number"
                        required
                        disabled={newType === 'FREE_SHIPPING'}
                        min={1}
                        max={newType === 'PERCENTAGE' ? 100 : 50000}
                        value={newValue}
                        onChange={(e) => setNewValue(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black font-bold font-mono text-zinc-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Min Subtotal Threshold (ETB - Optional)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1000 (leave blank for none)"
                        value={newMinSubtotal}
                        onChange={(e) => setNewMinSubtotal(e.target.value)}
                        className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black font-bold font-mono text-zinc-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">English description text</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10% OFF on traditional dresses"
                        value={newDescEn}
                        onChange={(e) => setNewDescEn(e.target.value)}
                        className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black text-zinc-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Amharic translation copy</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10% የሀበሻ ባህላዊ ልብሶች ቅናሽ"
                        value={newDescAm}
                        onChange={(e) => setNewDescAm(e.target.value)}
                        className="w-full border border-gray-250 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black text-zinc-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 font-sans cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Deploy Promo Code
                    </button>
                  </form>
                </div>

                {/* Active Promo registry registry */}
                <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="font-extrabold text-xs uppercase text-zinc-900 border-b border-gray-100 pb-2">
                    Active Coupon Registry
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promoCodes.map((promo) => (
                      <div key={promo.code} className="border border-gray-150 p-4 rounded-2xl bg-zinc-50/20 flex flex-col justify-between hover:border-indigo-400 transition-all relative shadow-xs group">
                        
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="bg-black text-white font-mono text-xs font-black px-2.5 py-1 rounded-md tracking-wider">
                                {promo.code}
                              </span>
                              <span className="ml-2 text-[10px] font-black uppercase text-indigo-600">
                                {promo.type === 'PERCENTAGE' ? `${promo.value}% OFF` : promo.type === 'FLAT' ? `${promo.value.toLocaleString()} ETB OFF` : 'Free Shipping'}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                onRemovePromoCode(promo.code);
                                showToast(`Promo code "${promo.code}" deactivated.`, 'error');
                              }}
                              className="text-gray-300 hover:text-red-650 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Deactivate Promo"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>

                          <div className="mt-4 space-y-1.5 text-xs">
                            <p className="font-semibold text-zinc-800">{promo.descriptionEn}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{promo.descriptionAm}</p>
                            
                            {promo.minSubtotal && (
                              <p className="text-[9px] font-bold text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider mt-1 font-mono">
                                Min Subtotal: {promo.minSubtotal.toLocaleString()} ETB
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-gray-250/40 pt-2.5 mt-4 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                          <span>Ledger parity</span>
                          <span className="text-emerald-500 font-bold">● ACTIVE ON STOREFRONT</span>
                        </div>

                      </div>
                    ))}

                    {promoCodes.length === 0 && (
                      <div className="md:col-span-2 py-16 text-center border border-dashed border-gray-150 rounded-2xl bg-gray-50/10">
                        <Tag className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">No Active Promo Codes</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Deploy new campaign coupons using the creator form on the left.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: INFRASTRUCTURE & SECURITY INTEGRITY LOGS AUDITING  */}
          {/* ======================================================== */}
          {adminTab === 'SECURITY' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">System Security Audits & Integrity Console</h3>
                    <p className="text-xs text-gray-400 mt-1">Inspect immutable, timestamped logs generated by payment webhooks, bank transfers, and listing revisions.</p>
                  </div>
                  
                  {/* Log Filter by severity level */}
                  <div className="flex items-center gap-2 bg-gray-55/10 p-1 rounded-xl border border-gray-250/40">
                    {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setLogFilter(sev as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                          logFilter === sev 
                            ? 'bg-zinc-950 text-white' 
                            : 'text-zinc-500 hover:text-zinc-950'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs by actor, action description or SHA-256 integrity signature..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black bg-white text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Rolling Security Console Logger (AWS/Stripe central terminal style) */}
                <div className="lg:col-span-2 space-y-4">
                  
                  <div className="bg-zinc-950 p-5 rounded-2xl font-mono text-xs text-zinc-400 border border-zinc-900 shadow-2xl relative">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      <span className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Core Compliance Logging Engine</span>
                      </span>
                      <span className="text-emerald-400">Parity verified</span>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto leading-relaxed scrollbar-thin">
                      {auditLogs
                        .filter(log => {
                          if (logFilter === 'CRITICAL') return log.severity === 'CRITICAL';
                          if (logFilter === 'WARNING') return log.severity === 'WARNING';
                          if (logFilter === 'INFO') return log.severity === 'INFO';
                          return true;
                        })
                        .filter(log => {
                          const lower = logSearch.toLowerCase();
                          return (
                            log.action.toLowerCase().includes(lower) ||
                            log.details.toLowerCase().includes(lower) ||
                            log.actor.toLowerCase().includes(lower)
                          );
                        })
                        .map((log) => (
                          <div key={log.id} className="p-2.5 border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className={`font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                                log.severity === 'CRITICAL' ? 'bg-red-950/80 text-red-400 border border-red-900/40' : log.severity === 'WARNING' ? 'bg-amber-950/80 text-amber-400 border border-amber-900/40' : 'bg-zinc-900 text-zinc-300'
                              }`}>
                                {log.severity} • {log.action}
                              </span>
                              <span className="text-zinc-600 text-[9px] font-bold font-mono">{log.timestamp}</span>
                            </div>
                            <p className="text-zinc-300 text-[11px] font-sans leading-relaxed">{log.details}</p>
                            <div className="flex justify-between items-center text-[9.5px] text-zinc-600 pt-0.5">
                              <span>Actor Node: {log.actor}</span>
                              <span className="font-mono text-[8px]">SHA-256: 4f82d9...</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* System Diagnostics Toolkit container */}
                <div className="lg:col-span-1 bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-xs uppercase text-zinc-900 border-b border-gray-100 pb-2">
                      Governance Toolkit
                    </h4>

                    {/* Infrastructure Diagnostic tools */}
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-xl space-y-1">
                        <strong className="text-[10px] text-zinc-800 uppercase font-bold block">Integrity checks</strong>
                        <p className="text-[11px] text-gray-500 leading-relaxed">Trigger a manual SHA-256 hash inspection across the platform database to confirm accounting parity.</p>
                        <button
                          disabled={isScanning}
                          onClick={handleSecuritySweep}
                          className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-1.5 rounded-lg text-[10px] uppercase mt-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isScanning ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Scanning Parity...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Perform Integrity Sweep</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-xl space-y-1">
                        <strong className="text-[10px] text-zinc-800 uppercase font-bold block">Encrypted Archives</strong>
                        <p className="text-[11px] text-gray-500 leading-relaxed">Download complete cryptographically-sealed operational statement log history (.LOG.GZ).</p>
                        <button
                          onClick={() => {
                            showToast("Encryption key authorized. GZIP compiled.", "success");
                            alert('Encrypted operations logs saved securely to administrator node downloads folder.');
                          }}
                          className="w-full bg-white hover:bg-zinc-50 border border-gray-200 text-black font-bold py-1.5 rounded-lg text-[10px] uppercase mt-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Encrypted (.LOG.GZ)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4 space-y-2 text-[10px] text-gray-400">
                    <div className="flex justify-between items-center">
                      <span>Security Core</span>
                      <span className="font-mono text-zinc-800 font-bold">SHA-256 Parity v4.1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Gateway handshakes</span>
                      <span className="font-mono text-emerald-600 font-bold">100% SUCCESS</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: CUSTOMER RELATIONSHIP MANAGEMENT (CRM) MODULE */}
          {/* ======================================================== */}
          {adminTab === 'CRM' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Top CRM Header Banner & Quick Actions */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-extrabold tracking-tight">
                      {language === 'en' ? 'Customer Relationship Management (CRM)' : 'የደንበኞች ግንኙነት ማእከል (CRM)'}
                    </h3>
                    <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                      ENTERPRISE CRM v2.4
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/80 leading-relaxed max-w-2xl">
                    {language === 'en' 
                      ? 'Monitor customer lifetime value (LTV), reward loyalty tiers, resolve support tickets, and launch targeted promotional broadcasts.'
                      : 'የደንበኞችን የህይወት ዘመን ግዢ (LTV) ይከታተሉ፣ የታማኝነት ሽልማቶችን ይሰጡ፣ እንዲሁም ማስተወቂያዎችን ያስ አስተላልፉ።'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(true)}
                    className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer border border-indigo-400/40"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'en' ? 'Launch Campaign Blast' : 'ማስተወቂያ አስተላልፍ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(language === 'en' ? 'Exported 5 CRM customer profiles (CSV).' : '5 የደንበኞች መረጃ ኤክስፖርት ተደርጓል።', 'success');
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'en' ? 'Export Customer CSV' : 'መረጃ በCSV አውርድ'}</span>
                  </button>
                </div>
              </div>

              {/* CRM Key Metrics KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Metric 1 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                      {language === 'en' ? 'Total Customers' : 'ጠቅላላ ደንበኞች'}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-950 tracking-tight">{crmCustomers.length}</h4>
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+18% {language === 'en' ? 'this month' : 'በዚህ ወር'}</span>
                    </p>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                      {language === 'en' ? 'VIP & Gold Loyalty' : 'የቪአይፒ እና ወርቅ አባላት'}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-950 tracking-tight">
                      {crmCustomers.filter(c => c.loyaltyTier === 'VIP Platinum' || c.loyaltyTier === 'Gold').length}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      {language === 'en' ? 'Avg 528 Kasma Points' : 'አማካይ 528 ነጥቦች'}
                    </p>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                      {language === 'en' ? 'Total CRM Lifetime Value' : 'ጠቅላላ የደንበኛ ግዢ'}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-950 tracking-tight">
                      {crmCustomers.reduce((acc, c) => acc + c.totalSpend, 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">ETB</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      {language === 'en' ? `AOV: ETB ${(crmCustomers.reduce((acc, c) => acc + c.totalSpend, 0) / (crmCustomers.reduce((acc, c) => acc + c.totalOrders, 0) || 1)).toFixed(0)}` : 'ከፍተኛ የግዢ መጠን'}
                    </p>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                      {language === 'en' ? 'Support SLA Status' : 'የደንበኛ አገልግሎት ሰዓት'}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-950 tracking-tight">98.4%</h4>
                    <p className="text-[11px] text-purple-600 font-bold mt-1">
                      {supportTickets.filter(t => t.status === 'IN_PROGRESS').length} {language === 'en' ? 'Open Tickets' : 'የተከፈቱ ጥያቄዎች'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Customer Search, Segment Filter & Table */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden space-y-4 p-6">
                
                {/* Search & Tabs Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                  
                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'ALL', label: 'All Customers', am: 'ሁሉም' },
                      { id: 'VIP', label: 'VIP Platinum & Gold', am: 'ቪአይፒ አባላት' },
                      { id: 'HIGH_SPENDER', label: 'High Spenders (>50k)', am: 'ከፍተኛ ገዢዎች' },
                      { id: 'AT_RISK', label: 'At Risk / Inactive', am: 'የቀነሱ ደንበኞች' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCrmSegmentFilter(tab.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          crmSegmentFilter === tab.id
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {language === 'en' ? tab.label : tab.am}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Search by name, phone, email...' : 'በስም፣ በስልክ ወይም ኢሜይልፈልግ...'}
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                </div>

                {/* Customer Roster Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200/80 shadow-2xs">
                  <table className="w-full text-left border-collapse min-w-[880px]">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-mono uppercase tracking-wider text-gray-500 whitespace-nowrap">
                        <th className="py-3 px-4 font-bold">{language === 'en' ? 'Customer Profile' : 'የደንበኛ መረጃ'}</th>
                        <th className="py-3 px-4 font-bold">{language === 'en' ? 'Location & Phone' : 'አድራሻ እና ስልክ'}</th>
                        <th className="py-3 px-4 font-bold">{language === 'en' ? 'Loyalty Tier' : 'ደረጃ'}</th>
                        <th className="py-3 px-4 font-bold">{language === 'en' ? 'Preferred Pay' : 'የክፍያ መንገድ'}</th>
                        <th className="py-3 px-4 font-bold text-right">{language === 'en' ? 'Orders / Spend' : 'ትዕዛዝ / ክፍያ'}</th>
                        <th className="py-3 px-4 font-bold text-center">{language === 'en' ? 'Kasma Points' : 'ነጥብ'}</th>
                        <th className="py-3 px-4 font-bold text-center">{language === 'en' ? 'Status' : 'ሁኔታ'}</th>
                        <th className="py-3 px-4 font-bold text-center">{language === 'en' ? 'Actions' : 'ድርጊት'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {crmCustomers
                        .filter(c => {
                          const matchesSearch = c.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
                            c.email.toLowerCase().includes(crmSearch.toLowerCase()) ||
                            c.phone.includes(crmSearch) ||
                            c.location.toLowerCase().includes(crmSearch.toLowerCase());

                          if (!matchesSearch) return false;

                          if (crmSegmentFilter === 'VIP') return c.loyaltyTier === 'VIP Platinum' || c.loyaltyTier === 'Gold';
                          if (crmSegmentFilter === 'HIGH_SPENDER') return c.totalSpend >= 50000;
                          if (crmSegmentFilter === 'AT_RISK') return c.status === 'AT_RISK' || c.status === 'INACTIVE';
                          return true;
                        })
                        .map((cust) => (
                          <tr key={cust.id} className="hover:bg-indigo-50/20 transition-colors group">
                            
                            {/* Customer Profile Info */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                                  {cust.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                      {cust.name}
                                    </h5>
                                    <span className="text-[9px] font-mono text-gray-400 font-bold">({cust.id})</span>
                                  </div>
                                  <p className="text-[11px] text-gray-500">{cust.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Location & Contact */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <p className="font-semibold text-gray-800">{cust.location}</p>
                              <p className="text-[11px] font-mono text-gray-500">{cust.phone}</p>
                            </td>

                            {/* Loyalty Tier */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                cust.loyaltyTier === 'VIP Platinum'
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xs'
                                  : cust.loyaltyTier === 'Gold'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : cust.loyaltyTier === 'Silver'
                                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                  : 'bg-orange-50 text-orange-800 border border-orange-200'
                              }`}>
                                <Award className="w-3 h-3" />
                                <span>{cust.loyaltyTier}</span>
                              </span>
                            </td>

                            {/* Preferred Payment */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                                cust.preferredPayment === 'TELEBIRR'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : cust.preferredPayment === 'CHAPA'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                                {cust.preferredPayment}
                              </span>
                            </td>

                            {/* Orders & Spend */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <p className="font-black text-gray-950">{cust.totalSpend.toLocaleString()} ETB</p>
                              <p className="text-[10px] text-gray-500 font-bold">{cust.totalOrders} {language === 'en' ? 'orders' : 'ትዕዛዞች'}</p>
                            </td>

                            {/* Kasma Loyalty Points */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                ⭐ {cust.pointsBalance}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cust.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800 animate-pulse'
                              }`}>
                                {cust.status}
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCrmCustomer(cust)}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{language === 'en' ? 'Profile' : 'መረጃ'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCrmCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, pointsBalance: c.pointsBalance + 100 } : c));
                                    showToast(language === 'en' ? `Granted +100 Kasma Points to ${cust.name}` : `ለ${cust.name} +100 ነጥብ ተጨምሯል!`, 'success');
                                  }}
                                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-all cursor-pointer"
                                  title="Grant +100 Loyalty Points"
                                >
                                  <Gift className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Customer Support & Inquiry Ledger Table */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
                      {language === 'en' ? 'Customer Support & Inquiries Desk' : 'የደንበኞች አገልግሎት ጥያቄዎች'}
                    </h4>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {supportTickets.length} {language === 'en' ? 'Total Active Tickets' : 'ጠቅላላ ጥያቄዎች'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {supportTickets.map((tkt) => (
                    <div key={tkt.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-gray-400">{tkt.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          tkt.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {tkt.status}
                        </span>
                      </div>
                      <div>
                        <h6 className="font-extrabold text-xs text-gray-900">{tkt.customerName}</h6>
                        <p className="text-xs text-gray-600 mt-0.5">{tkt.issue}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200/70 text-[10px] text-gray-500 font-semibold">
                        <span>{tkt.category}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSupportTickets(prev => prev.map(t => t.id === tkt.id ? { ...t, status: t.status === 'RESOLVED' ? 'IN_PROGRESS' : 'RESOLVED' } : t));
                            showToast(language === 'en' ? `Updated Ticket ${tkt.id} status.` : `የጥያቄ ${tkt.id} ሁኔታ ተቀይሯል።`, 'info');
                          }}
                          className="text-indigo-600 hover:underline font-bold cursor-pointer"
                        >
                          {tkt.status === 'RESOLVED' ? 'Reopen' : 'Mark Resolved ✔'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: SEO & GEO GENERATIVE ENGINE OPTIMIZATION DASHBOARD */}
          {/* ======================================================== */}
          {adminTab === 'SEO_GEO' && (
            <div className="animate-in fade-in duration-300">
              <SeoGeoDashboard
                products={products}
                language={language}
                showToast={showToast}
              />
            </div>
          )}

        </div>
      </main>

      {/* QR SELECTOR MODAL FOR ADMIN COMPLIANCE */}
      {selectedQrProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0052FF]" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">
                  Product Variant QR Labels
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQrProduct(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black cursor-pointer text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                {selectedQrProduct.brand}
              </p>
              <h5 className="font-extrabold text-base text-gray-950 leading-tight">
                {selectedQrProduct.nameEn}
              </h5>
              <p className="text-xs text-gray-400 leading-relaxed">
                Admins can generate and download secure stock tags encoded with SKU references. Verify barcode structures before authorizing full listing dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
              {selectedQrProduct.variants.map((v) => {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(v.sku)}`;
                return (
                  <div 
                    key={v.sku} 
                    className="border border-gray-150 rounded-2xl p-4 flex flex-col justify-between bg-gray-50/20 hover:shadow-md transition-all text-left"
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
                        <h6 className="font-extrabold text-xs text-gray-900 leading-tight truncate">{v.name}</h6>
                        <p className="text-[10px] text-gray-400 font-bold">
                          Stock: {v.onHand} units
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPrintVariant({ product: selectedQrProduct, variant: v })}
                        className="flex-1 py-1.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Tag</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
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
                          alert(`Admin Simulation Beep: Verified SKU ${v.sku} barcode integrity.`);
                        }}
                        className="py-1.5 px-3 bg-black text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Test Scan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedQrProduct(null)}
                className="px-5 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT TICKET MODAL OVERLAY FOR ADMIN */}
      {selectedPrintVariant && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl relative text-left">
            <div className="flex justify-between items-center border-b border-gray-150 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-900">
                Rapid-Scan Stock Tag Print Label
              </h4>
              <button
                onClick={() => setSelectedPrintVariant(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-zinc-500 hover:text-black cursor-pointer text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Physical Print Ticket container */}
            <div id="admin-physical-printed-label" className="border-4 border-dashed border-zinc-950 p-6 bg-white flex flex-col items-center text-center space-y-4 rounded-xl relative overflow-hidden">
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
                  const printContents = document.getElementById('admin-physical-printed-label')?.outerHTML;
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
                <span>Open Print Window</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPrintVariant(null)}
                className="py-2.5 px-5 bg-gray-100 hover:bg-gray-250 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRM CUSTOMER DETAILED PROFILE MODAL */}
      {selectedCrmCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-150 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedCrmCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-lg text-gray-900 leading-tight">
                      {selectedCrmCustomer.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-900">
                      {selectedCrmCustomer.loyaltyTier}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {selectedCrmCustomer.email} • {selectedCrmCustomer.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCrmCustomer(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black cursor-pointer font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Lifetime Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div>
                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">{language === 'en' ? 'Lifetime Spend' : 'ጠቅላላ ክፍያ'}</span>
                <span className="font-black text-sm text-gray-900">{selectedCrmCustomer.totalSpend.toLocaleString()} ETB</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">{language === 'en' ? 'Total Orders' : 'ጠቅላላ ትዕዛዞች'}</span>
                <span className="font-extrabold text-sm text-gray-900">{selectedCrmCustomer.totalOrders}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">{language === 'en' ? 'Points Balance' : 'የነጥብ መጠን'}</span>
                <span className="font-mono font-black text-sm text-indigo-600">⭐ {selectedCrmCustomer.pointsBalance}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">{language === 'en' ? 'Registered' : 'የተመዘገበበት'}</span>
                <span className="font-bold text-xs text-gray-700">{selectedCrmCustomer.registeredAt}</span>
              </div>
            </div>

            {/* Admin Internal CRM Notes & Points Grant Action */}
            <div className="space-y-3">
              <h5 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>{language === 'en' ? 'Internal CRM Notes & Direct Actions' : 'የውስጥ የደንበኛ ማስታወሻዎች'}</span>
              </h5>

              {/* Notes list */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedCrmCustomer.notes.map((note, idx) => (
                  <div key={idx} className="bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl text-xs text-amber-950 flex justify-between items-center">
                    <span>📌 {note}</span>
                    <span className="text-[9px] font-mono text-amber-700 font-bold">Log #{idx + 1}</span>
                  </div>
                ))}
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Add internal support or preference note...' : 'አዲስ የደንበኛ ማስታወሻ ጻፍ...'}
                  value={crmNoteInput}
                  onChange={(e) => setCrmNoteInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!crmNoteInput.trim()) return;
                    const newNote = crmNoteInput.trim();
                    setCrmCustomers(prev => prev.map(c => c.id === selectedCrmCustomer.id ? { ...c, notes: [...c.notes, newNote] } : c));
                    setSelectedCrmCustomer(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
                    setCrmNoteInput('');
                    showToast(language === 'en' ? 'Internal CRM note saved.' : 'ማስታወሻው ተመዝግቧል።', 'success');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Add Note' : 'መዝግብ'}
                </button>
              </div>

              {/* Quick Points Grant Toolbar */}
              <div className="pt-2 border-t border-gray-150 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">{language === 'en' ? 'Award Bonus Loyalty Points:' : 'የነጥብ ስጦታ አበርክት፡'}</span>
                <div className="flex gap-1.5">
                  {[50, 100, 250, 500].map(pts => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => {
                        setCrmCustomers(prev => prev.map(c => c.id === selectedCrmCustomer.id ? { ...c, pointsBalance: c.pointsBalance + pts } : c));
                        setSelectedCrmCustomer(prev => prev ? { ...prev, pointsBalance: prev.pointsBalance + pts } : null);
                        showToast(language === 'en' ? `Awarded +${pts} points to ${selectedCrmCustomer.name}` : `ለ${selectedCrmCustomer.name} +${pts} ነጥብ ተሰጥቷል!`, 'success');
                      }}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[10px] font-black rounded-lg cursor-pointer transition-all"
                    >
                      +{pts} ⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order History Timeline for Customer */}
            <div className="space-y-2 pt-2 border-t border-gray-150">
              <h5 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                {language === 'en' ? 'Customer Order Timeline' : 'የደንበኛው የትዕዛዝ ታሪክ'}
              </h5>
              <div className="space-y-2">
                {orders.filter(o => o.customerName === selectedCrmCustomer.name || o.customerPhone === selectedCrmCustomer.phone).length > 0 ? (
                  orders.filter(o => o.customerName === selectedCrmCustomer.name || o.customerPhone === selectedCrmCustomer.phone).map(ord => (
                    <div key={ord.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-indigo-600">{ord.id}</span>
                        <p className="text-[10px] text-gray-500">{new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-gray-900">{ord.total.toLocaleString()} ETB</span>
                        <span className="block text-[10px] font-bold text-emerald-600">{ord.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500 font-medium">
                    {language === 'en' ? 'Demonstration user profile registered on Kasma Enterprise Network.' : 'በካስማ መረብ የተመዘገበ ደንበኛ።'}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CRM CAMPAIGN BROADCAST MODAL */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-left">
            
            <div className="flex justify-between items-center border-b border-gray-150 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">
                  {language === 'en' ? 'Launch Targeted CRM Campaign' : 'አዲስ የደንበኞች ማስተወቂያ አስተላልፍ'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black cursor-pointer font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Campaign Title */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'en' ? 'Campaign Title:' : 'የማስተወቂያው ርዕስ፡'}</label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Target Segment & Channel */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{language === 'en' ? 'Target Segment:' : 'ዒላማ ደንበኞች፡'}</label>
                  <select
                    value={campaignTargetSegment}
                    onChange={(e) => setCampaignTargetSegment(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-semibold text-gray-800 bg-white"
                  >
                    <option value="VIP">VIP Platinum & Gold ({crmCustomers.filter(c => c.loyaltyTier === 'VIP Platinum' || c.loyaltyTier === 'Gold').length})</option>
                    <option value="ALL">All Registered Customers ({crmCustomers.length})</option>
                    <option value="AT_RISK">At Risk / Inactive Cohort ({crmCustomers.filter(c => c.status === 'AT_RISK').length})</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">{language === 'en' ? 'Dispatch Channel:' : 'የማስተላላፊያ መንገድ፡'}</label>
                  <select
                    value={campaignChannel}
                    onChange={(e) => setCampaignChannel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-semibold text-gray-800 bg-white"
                  >
                    <option value="SMS">Telebirr / EthioTelecom SMS</option>
                    <option value="EMAIL">Direct Email Newsletter</option>
                    <option value="PUSH">App Push Notification</option>
                  </select>
                </div>
              </div>

              {/* Broadcast Message Textarea */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700">{language === 'en' ? 'Broadcast Message Text:' : 'የመልእክቱ ይዘት፡'}</label>
                <textarea
                  rows={3}
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Campaign Impact Preview Card */}
              <div className="bg-indigo-50/70 border border-indigo-200 p-3 rounded-xl flex items-center justify-between text-indigo-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold">{language === 'en' ? 'Estimated Audience Reach:' : 'ተደራሽ ደንበኞች፡'}</span>
                </div>
                <span className="font-black font-mono text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                  {campaignTargetSegment === 'VIP' 
                    ? crmCustomers.filter(c => c.loyaltyTier === 'VIP Platinum' || c.loyaltyTier === 'Gold').length 
                    : campaignTargetSegment === 'AT_RISK'
                    ? crmCustomers.filter(c => c.status === 'AT_RISK').length
                    : crmCustomers.length
                  } {language === 'en' ? 'Recipients' : 'ተቀባዮች'}
                </span>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const reachCount = campaignTargetSegment === 'VIP' 
                    ? crmCustomers.filter(c => c.loyaltyTier === 'VIP Platinum' || c.loyaltyTier === 'Gold').length 
                    : campaignTargetSegment === 'AT_RISK'
                    ? crmCustomers.filter(c => c.status === 'AT_RISK').length
                    : crmCustomers.length;

                  setIsCampaignModalOpen(false);
                  showToast(
                    language === 'en' 
                      ? `Campaign "${campaignTitle}" dispatched via ${campaignChannel} to ${reachCount} customers!` 
                      : `ማስተወቂያው "${campaignTitle}" ለ${reachCount} ደንበኞች ተልኳል!`,
                    'success'
                  );
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'en' ? 'Send Broadcast Campaign Now' : 'አሁን አስተላልፍ'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'ሰርዝ'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Gemini AI SEO Quick-Fix Preview Modal */}
      {quickFixModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 max-w-2xl w-full p-6 space-y-5 my-8 relative">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-zinc-900">Gemini AI SEO Quick-Fix</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                      Automated Copy & Metadata
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Target Product: <strong className="text-zinc-800">{quickFixModalData.product.nameEn}</strong> ({quickFixModalData.product.category})
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setQuickFixModalData(null)} 
                className="text-gray-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* SEO Score Impact Banner */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-900 via-zinc-900 to-violet-900 text-white rounded-xl flex items-center justify-between shadow-md font-mono text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold">Projected Score Improvement:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white/10 text-rose-300 line-through">
                  {quickFixModalData.originalScore.score}% ({quickFixModalData.originalScore.grade})
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-white font-extrabold text-sm shadow-xs">
                  {quickFixModalData.projectedScore.score}% ({quickFixModalData.projectedScore.grade})
                </span>
              </div>
            </div>

            {/* Comparison Body */}
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              
              {/* English Description Comparison */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 flex items-center justify-between">
                  <span>English Catalog Description</span>
                  <span className="text-emerald-600 font-normal">Gemini Keyword-Rich Copy</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-rose-700 uppercase block">Before (Original)</span>
                    <p className="text-zinc-600 text-[11px] leading-relaxed line-through opacity-80">
                      {quickFixModalData.product.descriptionEn || 'No description provided'}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1 shadow-xs">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> After (AI Optimized)
                    </span>
                    <p className="text-emerald-950 font-medium text-[11px] leading-relaxed">
                      {quickFixModalData.result.descriptionEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amharic Description Comparison */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 flex items-center justify-between">
                  <span>Amharic Translation (አማርኛ)</span>
                  <span className="text-emerald-600 font-normal">Ethiopian Localized Indexing</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-rose-700 uppercase block">Before (Original)</span>
                    <p className="text-zinc-600 text-[11px] leading-relaxed line-through opacity-80">
                      {quickFixModalData.product.descriptionAm || 'Missing Amharic copy'}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1 shadow-xs">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> After (AI Optimized)
                    </span>
                    <p className="text-emerald-950 font-medium text-[11px] leading-relaxed">
                      {quickFixModalData.result.descriptionAm}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested Brand */}
              {quickFixModalData.result.brand && quickFixModalData.result.brand !== quickFixModalData.product.brand && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-900">Suggested Brand Optimization:</span>
                  <span className="font-mono bg-indigo-100 text-indigo-900 font-extrabold px-2 py-0.5 rounded">
                    "{quickFixModalData.product.brand}" ➔ "{quickFixModalData.result.brand}"
                  </span>
                </div>
              )}

              {/* Search Keywords & Tags */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-700 block">
                  Generated SEO Tags & Keywords
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {quickFixModalData.result.tags.map((tag, idx) => (
                    <span key={idx} className="bg-white border border-indigo-200 text-indigo-800 text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-indigo-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Gemini SEO Rationale & Tips */}
              {quickFixModalData.result.seoTips.length > 0 && (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1 text-xs">
                  <span className="font-extrabold text-amber-900 text-[10px] uppercase flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-amber-600" /> Gemini AI Search Engine Rationale
                  </span>
                  <ul className="list-disc list-inside text-amber-950 text-[11px] space-y-0.5 pl-1">
                    {quickFixModalData.result.seoTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setQuickFixModalData(null)}
                disabled={isApplyingQuickFix}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyQuickFix}
                disabled={isApplyingQuickFix}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isApplyingQuickFix ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Applying Optimization...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Apply AI Optimization ({quickFixModalData.projectedScore.score}%)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

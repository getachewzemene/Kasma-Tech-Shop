import React, { useState, useMemo } from 'react';
import { Order, Merchant, DigitalWarrantyPass, WarrantyClaim } from '../../types';
import { 
  ShieldCheck, 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Download, 
  User, 
  Phone, 
  Clock, 
  Wrench, 
  RefreshCw, 
  Camera, 
  Sparkles,
  Layers,
  Calendar,
  Building,
  Check,
  Send,
  HelpCircle
} from 'lucide-react';
import { 
  getWarrantyCoverageStatus, 
  downloadDigitalWarrantyCertificatePDF 
} from '../../lib/warrantyService';

interface WarrantyDeskTabProps {
  orders: Order[];
  currentMerchant: Merchant;
  language: 'en' | 'am';
  onOrderUpdated?: (order: Order) => void;
  showToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export default function WarrantyDeskTab({
  orders,
  currentMerchant,
  language,
  onOrderUpdated,
  showToast
}: WarrantyDeskTabProps) {
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeWarranty, setActiveWarranty] = useState<DigitalWarrantyPass | null>(null);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [existingClaims, setExistingClaims] = useState<WarrantyClaim[]>([]);
  const [scanMode, setScanMode] = useState<'INPUT' | 'QR_SCANNER'>('INPUT');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Service Intake & Action Form State
  const [serviceAction, setServiceAction] = useState<'APPROVED_REPAIR' | 'APPROVED_REPLACEMENT' | 'UNDER_REVIEW' | 'REJECTED'>('APPROVED_REPAIR');
  const [issueCategory, setIssueCategory] = useState<WarrantyClaim['issueType']>('SCREEN_DISPLAY');
  const [technicianName, setTechnicianName] = useState('Dawit M. (Kasma Senior Hardware Specialist)');
  const [resolutionNotes, setResolutionNotes] = useState('Replaced certified display panel and tested touch digitizer latency. 100% genuine factory component.');
  const [replacementSerial, setReplacementSerial] = useState('');
  const [isLoggingService, setIsLoggingService] = useState(false);

  // Extract serial numbers from current merchant's orders for quick 1-click test pills
  const sampleSerials = useMemo(() => {
    const list: { serial: string; name: string }[] = [];
    orders.forEach(order => {
      if (order.warranties) {
        order.warranties.forEach(w => {
          if (w.serialNumber && !list.some(s => s.serial === w.serialNumber)) {
            list.push({ serial: w.serialNumber, name: w.productNameEn });
          }
        });
      }
      order.items.forEach(item => {
        if (item.serialNumber && !list.some(s => s.serial === item.serialNumber)) {
          list.push({ serial: item.serialNumber, name: item.product.nameEn });
        }
      });
    });

    if (list.length === 0) {
      list.push(
        { serial: 'SN-APPL-948201-M3P', name: 'MacBook Pro 16"' },
        { serial: 'SN-SAMS-481920-S24', name: 'Samsung Galaxy S24' },
        { serial: 'SN-SONY-739102-WH5', name: 'Sony WH-1000XM5' }
      );
    }
    return list.slice(0, 4);
  }, [orders]);

  // Execute Serial or QR lookup
  const handlePerformLookup = async (queryToSearch?: string) => {
    const query = (queryToSearch || lookupQuery).trim();
    if (!query) {
      showToast?.(language === 'en' ? 'Please enter a serial number, IMEI, or scan a QR pass.' : 'እባክዎን መለያ ቁጥር ወይም QR ኮድ ያስገቡ።', 'warning');
      return;
    }

    setIsSearching(true);
    try {
      // Clean query if it was a full QR verification URL
      let cleanQuery = query;
      if (query.includes('serial=')) {
        const urlParams = new URLSearchParams(query.split('?')[1] || query);
        cleanQuery = urlParams.get('serial') || cleanQuery;
      }

      const res = await fetch(`/api/warranties/verify?serial=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.warranty) {
        throw new Error(data.error || 'No matching digital warranty pass found.');
      }

      setActiveWarranty(data.warranty);
      setExistingClaims(data.claims || []);

      // Locate corresponding order in orders list if available
      const order = orders.find(o => o.id === data.orderId || o.warranties?.some(w => w.id === data.warranty.id));
      setMatchedOrder(order || null);

      showToast?.(
        language === 'en' 
          ? `✓ Verified! Valid ${data.warranty.warrantyMonths}M Kasma Care Pass found for ${data.warranty.productNameEn}.` 
          : `✓ ተረጋግጧል! የ ${data.warranty.warrantyMonths} ወር ዋስትና ለ ${data.warranty.productNameEn} ተገኝቷል።`,
        'success'
      );
    } catch (err: any) {
      showToast?.(err.message || 'Warranty lookup failed. Check serial number format.', 'warning');
    } finally {
      setIsSearching(false);
    }
  };

  // Submit repair / replacement service action
  const handleSubmitServiceAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWarranty) return;

    if (!resolutionNotes.trim()) {
      showToast?.(language === 'en' ? 'Please enter diagnostic and resolution notes.' : 'እባክዎን የጥገና ማስታወሻ ያስገቡ።', 'warning');
      return;
    }

    if (serviceAction === 'APPROVED_REPLACEMENT' && !replacementSerial.trim()) {
      showToast?.(language === 'en' ? 'Please specify the replacement unit serial number.' : 'እባክዎን አዲሱን የመለያ ቁጥር ያስገቡ።', 'warning');
      return;
    }

    setIsLoggingService(true);
    try {
      const token = localStorage.getItem('kasma_merchant_token') || 
                    localStorage.getItem('kasma_auth_token') || 
                    localStorage.getItem('kasma_admin_token');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/merchants/warranties/service-action', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          serialNumber: activeWarranty.serialNumber,
          warrantyId: activeWarranty.id,
          orderId: matchedOrder?.id || activeWarranty.orderId,
          action: serviceAction,
          issueType: issueCategory,
          resolutionNotes,
          technicianName,
          replacementSerial: serviceAction === 'APPROVED_REPLACEMENT' ? replacementSerial.trim() : undefined,
          merchantStoreName: currentMerchant.storeName
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit service action.');
      }

      if (data.claim) {
        setExistingClaims(prev => [data.claim, ...prev.filter(c => c.id !== data.claim.id)]);
      }

      if (data.warranty) {
        setActiveWarranty(data.warranty);
      }

      showToast?.(
        language === 'en'
          ? `✓ Warranty service logged: ${serviceAction} for S/N ${activeWarranty.serialNumber}. Customer notified!`
          : `✓ የዋስትና ጥገና ተመዝግቧል፡ ${serviceAction}. ለደንበኛው መልእክት ተልኳል!`,
        'success'
      );

      // Reset replacement serial
      setReplacementSerial('');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to log service action.', 'warning');
    } finally {
      setIsLoggingService(false);
    }
  };

  const coverage = activeWarranty ? getWarrantyCoverageStatus(activeWarranty) : null;

  return (
    <div className="space-y-6">
      {/* Header & Desk Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-150 dark:border-zinc-850">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#0052FF]" />
            <span>{language === 'en' ? 'Digital Warranty & Claims Desk' : 'የዲጂታል ዋስትና እና የይገባኛል ማዕከል'}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'en'
              ? 'Scan customer QR warranty passes or enter hardware serial numbers to verify validity and log repairs/replacements.'
              : 'የደንበኞችን የዋስትና QR ኮድ ይቃኙ ወይም መለያ ቁጥር በማስገባት ትክክለኛነቱን ያረጋግጡ፣ የጥገና እና የመተካት ስራዎችን ይመዝግቡ።'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setScanMode(scanMode === 'QR_SCANNER' ? 'INPUT' : 'QR_SCANNER');
              setIsCameraActive(!isCameraActive);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              scanMode === 'QR_SCANNER'
                ? 'bg-gradient-to-r from-[#0052FF] to-blue-600 text-white'
                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{scanMode === 'QR_SCANNER' ? (language === 'en' ? 'Close Scanner' : 'ስካነር ዝጋ') : (language === 'en' ? 'Live QR Scanner' : 'የካሜራ ስካነር')}</span>
          </button>
        </div>
      </div>

      {/* QR Scanner Mode Viewfinder */}
      {scanMode === 'QR_SCANNER' && (
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#0052FF]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {language === 'en' ? 'Addis Ababa Bole Hub QR Pass Camera Viewfinder' : 'የዋስትና ሰነድ QR ኮድ መቃኛ'}
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{language === 'en' ? 'Optical Sensor Active' : 'ስካነር ዝግጁ ነው'}</span>
            </span>
          </div>

          <div className="relative max-w-sm mx-auto h-56 rounded-2xl border-2 border-dashed border-[#0052FF]/60 bg-zinc-900/80 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#0052FF] to-transparent shadow-[0_0_12px_#0052FF] animate-bounce top-1/3 pointer-events-none" />

            <QrCode className="w-16 h-16 text-zinc-700 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-zinc-300">
              {language === 'en' ? 'Point customer smartphone QR pass towards camera' : 'የደንበኛውን ስልክ QR ኮድ ወደ ካሜራው ያቅርቡ'}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Supports official Kasma Care Tamper-Evident QR Seals & Certificates
            </p>

            {/* Quick Demo Scan Buttons */}
            <div className="pt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const demo = sampleSerials[0]?.serial || 'SN-APPL-948201-M3P';
                  setLookupQuery(demo);
                  handlePerformLookup(demo);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0052FF] hover:bg-blue-600 text-white text-[10px] font-bold cursor-pointer"
              >
                ⚡ {language === 'en' ? 'Simulate QR Scan (Apple MacBook)' : 'የአፕል ዋስትና ናሙና ቅኝት'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Search Bar & Quick Sample Serials */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 space-y-3 shadow-xs">
        <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
          {language === 'en' ? 'Lookup by Serial Number, IMEI, or Certificate Pass ID' : 'በመለያ ቁጥር (S/N)፣ IMEI ወይም የዋስትና ቁጥር ይፈልጉ'}
        </label>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. SN-KASM-849201 or 358920194820194 or KASMA-WAR-..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handlePerformLookup()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-mono font-bold uppercase outline-none focus:border-[#0052FF]"
            />
          </div>

          <button
            type="button"
            disabled={isSearching}
            onClick={() => handlePerformLookup()}
            className="px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all shrink-0"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isSearching ? (language === 'en' ? 'Verifying...' : 'በማረጋገጥ ላይ...') : (language === 'en' ? 'Verify Warranty' : 'ዋስትና አረጋግጥ')}</span>
          </button>
        </div>

        {/* Quick Test Serials from Orders */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[9.5px]">
            {language === 'en' ? 'Store Recent Units:' : 'የቅርብ ጊዜ እቃዎች:'}
          </span>
          {sampleSerials.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setLookupQuery(s.serial);
                handlePerformLookup(s.serial);
              }}
              className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-700 dark:text-zinc-300 font-mono text-[10px] font-bold border border-gray-200 dark:border-zinc-700 cursor-pointer transition-colors"
            >
              {s.serial} ({s.name.slice(0, 14)}...)
            </button>
          ))}
        </div>
      </div>

      {/* Main Verification & Action Workspace */}
      {activeWarranty && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Verified Digital Warranty Pass Profile */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 shadow-sm space-y-5">
              
              {/* Status Header */}
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      activeWarranty.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : activeWarranty.status === 'CLAIM_PENDING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        : activeWarranty.status === 'REPLACED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                    }`}>
                      {coverage?.statusLabelEn || activeWarranty.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {activeWarranty.coverageType === 'FULL_HARDWARE_REPLACEMENT' ? '★ Full Replacement Tier' : '✓ Parts & Labor'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-950 dark:text-white mt-1.5">
                    {language === 'en' ? activeWarranty.productNameEn : activeWarranty.productNameAm}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {activeWarranty.brand} • SKU: {activeWarranty.sku} • Variant: {activeWarranty.variantName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => downloadDigitalWarrantyCertificatePDF(activeWarranty, { language })}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0052FF] dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title="Download Official PDF Certificate"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'PDF Pass' : 'ሰነድ አውርድ'}</span>
                </button>
              </div>

              {/* Coverage Progress Bar */}
              {coverage && (
                <div className="space-y-1.5 bg-gray-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-gray-100 dark:border-zinc-850">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500">{language === 'en' ? 'Coverage Validity:' : 'የዋስትና ጊዜ:'}</span>
                    <span className="font-mono text-[#0052FF]">
                      {coverage.daysRemaining} {language === 'en' ? 'Days Left' : 'ቀናት ቀርተዋል'} ({coverage.percentageRemaining}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        coverage.percentageRemaining > 30 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${coverage.percentageRemaining}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-0.5">
                    <span>Issued: {new Date(activeWarranty.issueDate).toLocaleDateString()}</span>
                    <span>Expires: {new Date(activeWarranty.expiryDate).toLocaleDateString()} ({activeWarranty.warrantyMonths}M)</span>
                  </div>
                </div>
              )}

              {/* Hardware Identifiers & Serial Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Serial Number (S/N)
                  </span>
                  <span className="font-mono font-black text-xs text-gray-900 dark:text-zinc-100 block truncate">
                    {activeWarranty.serialNumber}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Cellular IMEI / Hardware ID
                  </span>
                  <span className="font-mono font-black text-xs text-gray-900 dark:text-zinc-100 block truncate">
                    {activeWarranty.imei || 'N/A (Wi-Fi Unit)'}
                  </span>
                </div>
              </div>

              {/* Customer & Origin Order Info */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Registered Customer & Purchase Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-800 dark:text-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-bold">{activeWarranty.customerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <a href={`tel:${activeWarranty.customerPhone}`} className="hover:underline font-mono font-semibold">
                      {activeWarranty.customerPhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Order: #{activeWarranty.orderId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Store: {activeWarranty.merchantName}</span>
                  </div>
                </div>
              </div>

              {/* Tamper-Proof Cryptographic Hash Seal */}
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between text-[10.5px]">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 block">Cryptographic Hash Seal:</span>
                    <span className="font-mono text-gray-500 truncate block">{activeWarranty.tamperProofHash}</span>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓ Valid</span>
              </div>
            </div>

            {/* Claims & Repair History Ledger for this Device */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#0052FF]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 dark:text-white">
                    {language === 'en' ? 'Device Service & Repair History' : 'የዚህ እቃ የጥገና እና የይገባኛል ታሪክ'}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-gray-400">
                  {existingClaims.length} {language === 'en' ? 'Record(s)' : 'ምዝገባዎች'}
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {existingClaims.map((claim) => (
                  <div 
                    key={claim.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#0052FF]">#{claim.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        claim.status === 'APPROVED_REPAIR'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : claim.status === 'APPROVED_REPLACEMENT'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          : claim.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <p className="font-bold text-gray-800 dark:text-zinc-200">
                      Issue: {claim.issueType}
                    </p>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 italic">
                      "{claim.resolutionNotes || claim.description}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-200/50 dark:border-zinc-800/50">
                      <span>Tech: {claim.technicianName || 'Kasma Care Tech'}</span>
                      <span>{new Date(claim.updatedAt || claim.createdAt).toLocaleDateString()}</span>
                    </div>

                    {claim.replacementSerial && (
                      <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                        Replacement S/N: {claim.replacementSerial}
                      </div>
                    )}
                  </div>
                ))}

                {existingClaims.length === 0 && (
                  <p className="text-center py-6 text-xs text-gray-400 italic">
                    {language === 'en' ? 'No prior claims or repairs logged for this hardware unit.' : 'ለዚህ እቃ እስካሁን ምንም የተመዘገበ የጥገና ታሪክ የለም።'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Log Repair / Replacement Intake Form */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleSubmitServiceAction} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <Wrench className="w-4 h-4 text-[#0052FF]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 dark:text-white">
                  {language === 'en' ? 'Log Repair / Replacement Service Action' : 'የጥገና ወይም የመተካት እርምጃ መዝግብ'}
                </h4>
              </div>

              {/* Service Action Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {language === 'en' ? 'Service Resolution Action *' : 'የተወሰደው የጥገና እርምጃ *'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setServiceAction('APPROVED_REPAIR')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      serviceAction === 'APPROVED_REPAIR'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    <span>🔧 Repair Device</span>
                    <span className="block text-[10px] font-normal opacity-80">Repaired under warranty</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceAction('APPROVED_REPLACEMENT')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      serviceAction === 'APPROVED_REPLACEMENT'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-800 dark:text-blue-300'
                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    <span>🔄 Replace Unit</span>
                    <span className="block text-[10px] font-normal opacity-80">Issue new serialized device</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceAction('UNDER_REVIEW')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      serviceAction === 'UNDER_REVIEW'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300'
                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    <span>⏳ Diagnostics</span>
                    <span className="block text-[10px] font-normal opacity-80">Bench testing in progress</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceAction('REJECTED')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      serviceAction === 'REJECTED'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300'
                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    <span>✗ Void / Reject</span>
                    <span className="block text-[10px] font-normal opacity-80">Water/impact damage</span>
                  </button>
                </div>
              </div>

              {/* If replacement, require new serial */}
              {serviceAction === 'APPROVED_REPLACEMENT' && (
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
                  <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    {language === 'en' ? 'New Replacement Unit Serial Number (S/N) *' : 'የአዲሱ ምትክ እቃ መለያ ቁጥር (S/N) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-KASM-982103-REP"
                    value={replacementSerial}
                    onChange={(e) => setReplacementSerial(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-800 text-xs font-mono font-bold outline-none focus:border-[#0052FF]"
                  />
                  <p className="text-[10px] text-blue-700 dark:text-blue-400">
                    The digital warranty certificate will be updated to track this replacement hardware serial.
                  </p>
                </div>
              )}

              {/* Issue Category */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                  {language === 'en' ? 'Hardware Defect Category' : 'የችግሩ አይነት'}
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-semibold outline-none focus:border-[#0052FF]"
                >
                  <option value="SCREEN_DISPLAY">Screen Display / OLED Panel / Dead Pixels</option>
                  <option value="BATTERY_CHARGING">Battery Degradation / Charging Port / Power IC</option>
                  <option value="MOTHERBOARD_POWER">Motherboard Failure / Bootloop / Chipset</option>
                  <option value="AUDIO_SPEAKER">Audio Speaker / Microphone / Earpiece</option>
                  <option value="ACCESSORY_DEFECT">Factory Cable / Charging Brick Defect</option>
                  <option value="OTHER">General Diagnostics / Firmware / Other</option>
                </select>
              </div>

              {/* Technician Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                  {language === 'en' ? 'Assigned Hardware Technician' : 'የቴክኒሻን ስም'}
                </label>
                <input
                  type="text"
                  required
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="e.g. Dawit M. (Senior Tech)"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-semibold outline-none focus:border-[#0052FF]"
                />
              </div>

              {/* Resolution & Diagnostic Notes */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                  {language === 'en' ? 'Diagnostic Findings & Parts Replaced *' : 'የተገኙ ችግሮች እና የተተኩ እቃዎች *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail test results, genuine parts used, and calibration checks..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs font-semibold outline-none focus:border-[#0052FF]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingService}
                className="w-full py-3 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all"
              >
                {isLoggingService ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isLoggingService
                    ? (language === 'en' ? 'Recording Service Action...' : 'በመመዝገብ ላይ...')
                    : (language === 'en' ? 'Log Service Action & Update Customer' : 'እርምጃውን መዝግብ እና ለደንበኛ አሳውቅ')}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Smartphone, 
  Calendar, 
  Building2, 
  Sparkles,
  ArrowRight,
  FileBadge,
  Lock
} from 'lucide-react';
import { Product, DigitalWarrantyPass } from '../../types';
import { generateDeviceSerial, generateTamperProofHash } from '../../lib/warrantyService';

export interface SerialCoverageCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  language?: 'en' | 'am';
  onViewPass?: (pass: DigitalWarrantyPass) => void;
}

export const SerialCoverageCheckerModal: React.FC<SerialCoverageCheckerModalProps> = ({
  isOpen,
  onClose,
  product,
  language = 'en',
  onViewPass
}) => {
  const [inputVal, setInputVal] = useState('');
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    pass?: DigitalWarrantyPass;
    message?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  // Generate demo sample serial for this product
  const sampleSerial = product 
    ? generateDeviceSerial(product.brand, product.category).serial
    : 'SN-APPL-849201-X9';

  const handleTestSample = () => {
    setInputVal(sampleSerial);
    performCheck(sampleSerial);
  };

  const performCheck = (queryStr: string) => {
    const q = queryStr.trim().toUpperCase();
    if (!q) return;

    setIsChecking(true);
    setSearchResult(null);

    setTimeout(() => {
      // Simulate verification against Kasma Hardware Registry
      const isClean = q.length >= 6;
      if (!isClean) {
        setSearchResult({
          found: false,
          message: language === 'en'
            ? 'Serial or IMEI format unrecognized. Please enter at least 6 alphanumeric characters.'
            : 'መለያ ቁጥሩ ወይም IMEI አልተገኘም። እባክዎ ቢያንስ 6 ፊደላት ወይም ቁጥሮች ያስገቡ።'
        });
        setIsChecking(false);
        return;
      }

      const brand = product?.brand || (q.includes('APPL') ? 'Apple' : q.includes('SENN') ? 'Sennheiser' : 'Kasma Tech');
      const prodNameEn = product?.nameEn || `${brand} Certified Device`;
      const prodNameAm = product?.nameAm || `${brand} የተረጋገጠ እቃ`;
      const warrantyMonths = product?.warrantyMonths || 12;

      const issueDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
      const expiryDateObj = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
      expiryDateObj.setMonth(expiryDateObj.getMonth() + warrantyMonths);
      const expiryDate = expiryDateObj.toISOString();

      const pass: DigitalWarrantyPass = {
        id: `KASMA-REG-${Math.floor(10000 + Math.random() * 90000)}`,
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        productId: product?.id || 'p-verified',
        productNameEn: prodNameEn,
        productNameAm: prodNameAm,
        brand,
        sku: product?.variants?.[0]?.sku || 'SKU-CERT-01',
        variantName: product?.variants?.[0]?.name || 'Factory Standard',
        serialNumber: q.startsWith('35') ? `SN-${brand.slice(0, 4).toUpperCase()}-948201` : q,
        imei: q.startsWith('35') ? q : (product?.category === 'mobiles' ? '358920194820194' : undefined),
        customerName: 'Verified Kasma Shopper',
        customerPhone: '+251 91 **** 4567',
        merchantName: product?.merchantName || 'Kasma Authorized Partner',
        issueDate,
        expiryDate,
        warrantyMonths,
        status: 'ACTIVE',
        coverageType: 'FULL_HARDWARE_REPLACEMENT',
        qrVerificationUrl: `https://kasma.et/verify-warranty?serial=${encodeURIComponent(q)}`,
        tamperProofHash: generateTamperProofHash(q)
      };

      setSearchResult({
        found: true,
        pass
      });
      setIsChecking(false);
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performCheck(inputVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Cryptographic Accent */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-150 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-zinc-100 tracking-tight">
                {language === 'en' ? 'Serial / IMEI Coverage Verification' : 'የመለያ ቁጥር / IMEI ዋስትና ማረጋገጫ'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {language === 'en' ? 'Official Kasma Care National Registry' : 'የካስማ ኬር ብሔራዊ የመረጃ ቋት'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Lookup Input Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              {language === 'en' ? 'Enter Device Serial (S/N) or 15-Digit IMEI:' : 'የእቃውን መለያ ቁጥር (S/N) ወይም 15-ዲጂት IMEI ያስገቡ፡'}
            </label>

            <div className="relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. SN-APPL-849201-X9 or 358920194820194"
                className="w-full pl-10 pr-24 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono font-bold text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF] uppercase"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />

              <button
                type="submit"
                disabled={isChecking || !inputVal.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isChecking ? '...' : (language === 'en' ? 'Verify' : 'አረጋግጥ')}
              </button>
            </div>

            {/* Quick Demo Button */}
            {product && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px]">
                  {language === 'en' ? 'Testing before purchase?' : 'ከመግዛትዎ በፊት ማረጋገጥ ይፈልጋሉ?'}
                </span>
                <button
                  type="button"
                  onClick={handleTestSample}
                  className="text-[11px] font-bold text-[#0052FF] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{language === 'en' ? 'Sample Test This Model' : 'የዚህን እቃ ናሙና ፈትሽ'}</span>
                </button>
              </div>
            )}
          </form>

          {/* Verification Results */}
          {searchResult && (
            <div className="pt-2 animate-fade-in">
              {searchResult.found && searchResult.pass ? (
                <div className="space-y-4">
                  {/* Verified Card */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          {language === 'en' ? 'Genuine Unit Verified' : 'ትክክለኛ እቃ መሆኑ ተረጋግጧል'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase">
                        {language === 'en' ? 'Active Coverage' : 'ገቢር ዋስትና'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
                        {searchResult.pass.productNameEn}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-zinc-300 font-mono">
                        S/N: {searchResult.pass.serialNumber}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase">
                          {language === 'en' ? 'Warranty Term' : 'የዋስትና ጊዜ'}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-zinc-100">
                          {searchResult.pass.warrantyMonths} {language === 'en' ? 'Months Official' : 'ወራት ኦፊሴላዊ'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase">
                          {language === 'en' ? 'Expires On' : 'የሚያበቃበት ቀን'}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">
                          {new Date(searchResult.pass.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono bg-white/70 dark:bg-zinc-900/70 p-2 rounded-xl">
                      <Lock className="w-3 h-3 text-[#0052FF]" />
                      <span className="truncate">Seal: {searchResult.pass.tamperProofHash}</span>
                    </div>
                  </div>

                  {/* Button to open complete certificate pass */}
                  {onViewPass && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewPass(searchResult.pass!);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <FileBadge className="w-4 h-4" />
                      <span>{language === 'en' ? 'View Full Digital Warranty Pass' : 'ሙሉውን የዋስትና ሰነድ ተመልከት'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{language === 'en' ? 'Registry Lookup Failed' : 'ምንም መረጃ አልተገኘም'}</span>
                  </div>
                  <p className="text-gray-600 dark:text-zinc-400">
                    {searchResult.message}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Authentic Guarantee Explainer */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 space-y-2 text-xs">
            <h5 className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'Why Serial & IMEI Verification Matters' : 'የመለያ ቁጥር እና IMEI ማረጋገጫ ለምን አስፈለገ?'}</span>
            </h5>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {language === 'en'
                ? 'Every premium phone, laptop, and console sold on Kasma Tech is recorded in our tamper-evident registry. This protects you against refurbished grey-market units and ensures 100% authorized Bole service center repairs.'
                : 'በካስማ ሾፕ የሚሸጡ ሁሉም ስልኮች፣ ላፕቶፖች እና ጌሚንግ እቃዎች በደህንነት መዝገብ ውስጥ ተመዝግበው ይያዛሉ። ይህ ትክክለኛ የፋብሪካ እቃ መሆኑን እና በቦሌ ማዕከል ሙሉ ዋስትና ማግኘቱን ያረጋግጣል።'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

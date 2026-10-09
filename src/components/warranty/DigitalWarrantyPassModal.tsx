import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  X, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  Cpu, 
  Calendar, 
  MapPin, 
  Phone, 
  Lock,
  Sparkles,
  FileBadge
} from 'lucide-react';
import { DigitalWarrantyPass } from '../../types';
import { 
  getWarrantyCoverageStatus, 
  downloadDigitalWarrantyCertificatePDF 
} from '../../lib/warrantyService';

export interface DigitalWarrantyPassModalProps {
  warranty: DigitalWarrantyPass | null;
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'am';
  onRequestClaim?: (warranty: DigitalWarrantyPass) => void;
}

export const DigitalWarrantyPassModal: React.FC<DigitalWarrantyPassModalProps> = ({
  warranty,
  isOpen,
  onClose,
  language = 'en',
  onRequestClaim
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !warranty) return null;

  const coverage = getWarrantyCoverageStatus(warranty);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      downloadDigitalWarrantyCertificatePDF(warranty, { language: language === 'am' ? 'am' : 'en' });
    } catch (err) {
      console.error('Error generating warranty certificate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Cryptographic Bar */}
        <div className="h-2.5 bg-gradient-to-r from-[#0052FF] via-indigo-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-150 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center font-black">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-gray-900 dark:text-zinc-100 tracking-tight">
                  KASMA CARE™ DIGITAL PASS
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[#0052FF] dark:text-blue-300">
                  {language === 'en' ? 'Verified' : 'የተረጋገጠ'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                PASS ID: {warranty.id}
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
          
          {/* Certificate Card Pass Visual */}
          <div className="relative rounded-2xl p-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-blue-950 text-white shadow-xl border border-zinc-800 overflow-hidden">
            {/* Background Decorative Watermark */}
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-[#0052FF]/10 blur-2xl pointer-events-none" />
            <div className="absolute top-3 right-4 opacity-15 pointer-events-none font-mono text-[9px] uppercase tracking-widest text-right">
              TAMPER-EVIDENT SEAL<br />
              ETHIOPIA COMMERCE PLC
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-[280px]">
                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? coverage.statusLabelEn : coverage.statusLabelAm}</span>
                </span>
                <h4 className="font-black text-base sm:text-lg tracking-tight text-white line-clamp-1">
                  {language === 'en' ? warranty.productNameEn : warranty.productNameAm}
                </h4>
                <p className="text-xs text-zinc-300 font-mono">
                  {warranty.brand} • {warranty.variantName}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-2.5 bg-white rounded-2xl shadow-lg shrink-0 self-center sm:self-auto flex flex-col items-center">
                <QRCodeSVG
                  value={warranty.qrVerificationUrl}
                  size={84}
                  level="M"
                  includeMargin={false}
                />
                <span className="text-[8px] font-mono text-zinc-500 font-bold mt-1 tracking-wider uppercase">
                  SCAN TO VERIFY
                </span>
              </div>
            </div>

            {/* Days Remaining Meter */}
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-400">
                  {language === 'en' ? 'Coverage Validity' : 'የዋስትናው ጊዜ'}:
                </span>
                <span className="font-bold text-white font-mono">
                  {coverage.isExpired 
                    ? (language === 'en' ? 'Expired' : 'አብቅቷል')
                    : `${coverage.daysRemaining} ${language === 'en' ? 'days remaining' : 'ቀናት ቀርተዋል'} (${warranty.warrantyMonths} ${language === 'en' ? 'Months' : 'ወራት'})`}
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    coverage.isExpired 
                      ? 'bg-rose-500' 
                      : coverage.daysRemaining <= 30 
                      ? 'bg-amber-400' 
                      : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                  }`}
                  style={{ width: `${coverage.percentageRemaining}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>{new Date(warranty.issueDate).toLocaleDateString()}</span>
                <span>{new Date(warranty.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Hardware Identifiers Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>{language === 'en' ? 'Hardware Identifiers & Serial Registry' : 'የመሳሪያው መለያ እና የመመዝገቢያ ቁጥሮች'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Serial Number */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {language === 'en' ? 'Serial Number (S/N)' : 'መለያ ቁጥር (S/N)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(warranty.serialNumber, 'serial')}
                    className="p-1 rounded-lg text-gray-400 hover:text-[#0052FF] transition-colors"
                    title="Copy Serial"
                  >
                    {copiedField === 'serial' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="font-mono font-bold text-xs text-gray-900 dark:text-zinc-100 select-all truncate">
                  {warranty.serialNumber}
                </p>
                <span className="text-[9.5px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{language === 'en' ? 'Kasma Certified Genuine' : 'የተረጋገጠ ትክክለኛ'}</span>
                </span>
              </div>

              {/* IMEI if available */}
              {warranty.imei ? (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {language === 'en' ? 'Cellular IMEI 1' : 'ሴሉላር IMEI 1'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(warranty.imei!, 'imei')}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#0052FF] transition-colors"
                      title="Copy IMEI"
                    >
                      {copiedField === 'imei' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="font-mono font-bold text-xs text-gray-900 dark:text-zinc-100 select-all truncate">
                    {warranty.imei}
                  </p>
                  <span className="text-[9.5px] text-blue-600 font-semibold flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>{language === 'en' ? 'Ethio Telecom Registered' : 'የኢትዮ ቴሌኮም ምዝገባ'}</span>
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {language === 'en' ? 'Merchant Source' : 'የነጋዴው ምንጭ'}
                  </span>
                  <p className="font-bold text-xs text-gray-900 dark:text-zinc-100 truncate">
                    {warranty.merchantName}
                  </p>
                  <span className="text-[9.5px] text-purple-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{language === 'en' ? 'Kasma Escrow Backed' : 'በካስማ ዋስትና የተጠበቀ'}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Tamper-Evident Hash Seal */}
            <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <Lock className="w-4 h-4 text-[#0052FF] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    {language === 'en' ? 'Cryptographic Tamper-Proof Seal' : 'የማይቀየር የደህንነት ማረጋገጫ ቁጥር'}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-gray-800 dark:text-zinc-200 truncate select-all">
                    {warranty.tamperProofHash}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(warranty.tamperProofHash, 'hash')}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shrink-0"
                title="Copy Hash"
              >
                {copiedField === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Scope of Coverage & Ethiopia Service Protocol */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-2.5 text-xs">
            <h5 className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'en' ? 'Ethiopian Warranty Service Protection' : 'በኢትዮጵያ ውስጥ የዋስትና አገልግሎት ጥበቃ'}</span>
            </h5>
            
            <ul className="space-y-1.5 text-[11px] text-gray-600 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'en' 
                    ? '100% Genuine factory replacement for hardware defects & motherboard faults.' 
                    : '100% ኦሪጅናል የመለዋወጫ እቃዎች ለፋብሪካ እና ለማዘርቦርድ ብልሽቶች።'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'en'
                    ? 'Free courier pickup service in Addis Ababa (Bole, Kazanchis, Piassa, CMC) for active claims.'
                    : 'በአዲስ አበባ ውስጥ ለዋስትና ጥያቄዎች ነፃ የኩሪየር ማድረሻ እና መቀበያ አገልግሎት።'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'en'
                    ? 'Direct walk-in diagnostics at Kasma Tech Center (Bole Medhanealem Hub).'
                    : 'በቦሌ መድኃኔዓለም በሚገኘው የካስማ ቴክ ማዕከል ፈጣን ፍተሻ እና አገልግሎት።'}
                </span>
              </li>
            </ul>

            <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#0052FF]" />
                <span>+251 91 123 4567</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>Bole Medhanealem, Addis Ababa</span>
              </span>
            </div>
          </div>

          {/* Action Buttons: PDF Download & Claim Submission */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-gray-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#0052FF]" />
              <span>
                {isDownloading
                  ? (language === 'en' ? 'Generating PDF...' : 'በማመንጨት ላይ...')
                  : (language === 'en' ? 'Official PDF Pass' : 'ኦፊሴላዊ ሰነድ አውርድ')}
              </span>
            </button>

            {onRequestClaim && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestClaim(warranty);
                }}
                disabled={coverage.isExpired}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0052FF] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Wrench className="w-4 h-4" />
                <span>
                  {coverage.isExpired
                    ? (language === 'en' ? 'Coverage Expired' : 'ዋስትናው አልቋል')
                    : (language === 'en' ? 'File Warranty Claim' : 'የዋስትና ጥያቄ አስገባ')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

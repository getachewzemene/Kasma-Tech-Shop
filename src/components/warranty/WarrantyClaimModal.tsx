import React, { useState } from 'react';
import { 
  Wrench, 
  X, 
  CheckCircle2, 
  Truck, 
  Building2, 
  AlertCircle, 
  Smartphone, 
  Cpu, 
  Send,
  HelpCircle
} from 'lucide-react';
import { DigitalWarrantyPass, WarrantyClaim } from '../../types';

export interface WarrantyClaimModalProps {
  warranty: DigitalWarrantyPass | null;
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'am';
  onSubmitClaim: (claim: {
    warrantyId: string;
    orderId: string;
    productId: string;
    productName: string;
    serialNumber: string;
    customerName: string;
    customerPhone: string;
    issueType: WarrantyClaim['issueType'];
    description: string;
    serviceMethod: WarrantyClaim['serviceMethod'];
  }) => Promise<WarrantyClaim | boolean>;
}

export const WarrantyClaimModal: React.FC<WarrantyClaimModalProps> = ({
  warranty,
  isOpen,
  onClose,
  language = 'en',
  onSubmitClaim
}) => {
  const [issueType, setIssueType] = useState<WarrantyClaim['issueType']>('SCREEN_DISPLAY');
  const [description, setDescription] = useState('');
  const [serviceMethod, setServiceMethod] = useState<WarrantyClaim['serviceMethod']>('COURIER_PICKUP');
  const [customerName, setCustomerName] = useState(warranty?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(warranty?.customerPhone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<WarrantyClaim | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !warranty) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg(
        language === 'en'
          ? 'Please provide a detailed description of the hardware defect (at least 10 characters).'
          : 'እባክዎ ስለ ችግሩ ቢያንስ 10 ፊደላት የያዘ ዝርዝር መግለጫ ይጻፉ።'
      );
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg(language === 'en' ? 'Contact phone number is required.' : 'የእውቂያ ስልክ ቁጥር ያስፈልጋል።');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await onSubmitClaim({
        warrantyId: warranty.id,
        orderId: warranty.orderId,
        productId: warranty.productId,
        productName: warranty.productNameEn,
        serialNumber: warranty.serialNumber,
        customerName: customerName || warranty.customerName,
        customerPhone: customerPhone || warranty.customerPhone,
        issueType,
        description: description.trim(),
        serviceMethod
      });

      if (typeof res === 'object' && res !== null && 'id' in res) {
        setSubmittedClaim(res as WarrantyClaim);
      } else {
        setSubmittedClaim({
          id: `CLM-ET-${Date.now().toString().slice(-6)}`,
          warrantyId: warranty.id,
          orderId: warranty.orderId,
          productId: warranty.productId,
          productName: warranty.productNameEn,
          serialNumber: warranty.serialNumber,
          customerName: customerName || warranty.customerName,
          customerPhone: customerPhone || warranty.customerPhone,
          issueType,
          description: description.trim(),
          serviceMethod,
          status: 'SUBMITTED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (language === 'en' ? 'Failed to submit warranty claim. Please try again.' : 'የዋስትና ጥያቄውን ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedClaim(null);
    setDescription('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-150 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-zinc-100 tracking-tight">
                {language === 'en' ? 'Kasma Care Hardware Claim' : 'የካስማ ኬር የዋስትና ጥያቄ'}
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                S/N: {warranty.serialNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          {submittedClaim ? (
            /* Success confirmation screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  {language === 'en' ? 'Claim Registered' : 'ጥያቄዎ ተመዝግቧል'}
                </span>
                <h4 className="text-lg font-black text-gray-900 dark:text-zinc-100 mt-2">
                  {language === 'en' ? 'Warranty Claim Successfully Submitted!' : 'የዋስትና ጥያቄዎ በተሳካ ሁኔታ ቀርቧል!'}
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {language === 'en'
                    ? 'Our certified hardware diagnostics team at Bole Hub will contact you within 2 business hours to arrange device intake.'
                    : 'በቦሌ ማዕከል የሚገኙ የቴክኒክ ባለሙያዎቻችን በ2 ሰዓታት ውስጥ ደውለው መሳሪያውን የመረከብ ሂደት ያመቻቻሉ።'}
                </p>
              </div>

              {/* Claim Reference Badge */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{language === 'en' ? 'Claim Reference ID:' : 'የጥያቄው መለያ ቁጥር:'}</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-zinc-100">{submittedClaim.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{language === 'en' ? 'Registered S/N:' : 'የተመዘገበው መለያ ቁጥር:'}</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-zinc-100">{submittedClaim.serialNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{language === 'en' ? 'Service Method:' : 'የአገልግሎት አይነት:'}</span>
                  <span className="font-bold text-[#0052FF]">
                    {submittedClaim.serviceMethod === 'COURIER_PICKUP'
                      ? (language === 'en' ? '🛵 Free Courier Pickup (Addis Ababa)' : '🛵 የኩሪየር መቀበያ (አዲስ አበባ)')
                      : (language === 'en' ? '🏢 Bole Hub Walk-in' : '🏢 ቦሌ መድኃኔዓለም ማዕከል')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{language === 'en' ? 'Status:' : 'ሁኔታ:'}</span>
                  <span className="font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md text-[10px]">
                    {language === 'en' ? 'Under Review' : 'በግምገማ ላይ'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {language === 'en' ? 'Done / Back to Order' : 'ተጠናቋል / ወደ ትዕዛዝ ተመለስ'}
              </button>
            </div>
          ) : (
            /* Filing Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Device Quick Info */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-zinc-100">{warranty.productNameEn}</p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {warranty.brand} • {warranty.variantName}
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800 text-[#0052FF] font-bold">
                  {warranty.serialNumber}
                </span>
              </div>

              {/* Defect Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  {language === 'en' ? 'Select Hardware Defect Category:' : 'የብልሽት ዓይነት ይምረጡ፡'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'SCREEN_DISPLAY', en: 'Screen / Display', am: 'ስክሪን / ማሳያ' },
                    { id: 'BATTERY_CHARGING', en: 'Battery / Charging', am: 'ባትሪ / ቻርጀር' },
                    { id: 'MOTHERBOARD_POWER', en: 'Motherboard / Power', am: 'ማዘርቦርድ / ኃይል' },
                    { id: 'AUDIO_SPEAKER', en: 'Audio / Speaker', am: 'ድምጽ / ማይክሮፎን' },
                    { id: 'ACCESSORY_DEFECT', en: 'Cable / In-Box Defect', am: 'መለዋወጫ / ገመድ' },
                    { id: 'OTHER', en: 'Other Factory Issue', am: 'ሌላ የፋብሪካ ጉድለት' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setIssueType(cat.id as WarrantyClaim['issueType'])}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        issueType === cat.id
                          ? 'border-[#0052FF] bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] ring-2 ring-blue-500/20'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{language === 'en' ? cat.en : cat.am}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Symptom Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  {language === 'en' ? 'Defect Symptoms & Problem Description:' : 'የችግሩ ዝርዝር መግለጫ፡'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Describe what happened (e.g. screen flickering, device restarts unexpectedly, battery drains in 30 minutes)...'
                      : 'የተፈጠረውን ችግር በዝርዝር ይግለጹ (ለምሳሌ ስክሪን ብልጭ ይላል፣ ቶሎ ይጠፋል፣ ቻርጅ አይዝም)...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>

              {/* Service Logistics Method */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  {language === 'en' ? 'Preferred Service Handover Method:' : 'የመሳሪያው ርክክብ መንገድ፡'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceMethod('COURIER_PICKUP')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      serviceMethod === 'COURIER_PICKUP'
                        ? 'border-[#0052FF] bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] ring-2 ring-blue-500/20 font-bold'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#0052FF]" />
                      <span className="text-xs font-bold">{language === 'en' ? 'Courier Pickup' : 'የኩሪየር መቀበያ'}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {language === 'en' ? 'Free door pickup within Addis Ababa' : 'በአዲስ አበባ ውስጥ ከደጃፍዎ በነጻ መውሰድ'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceMethod('SERVICE_CENTER_WALKIN')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      serviceMethod === 'SERVICE_CENTER_WALKIN'
                        ? 'border-[#0052FF] bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] ring-2 ring-blue-500/20 font-bold'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold">{language === 'en' ? 'Bole Hub Walk-In' : 'ቦሌ ማዕከል መሄድ'}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {language === 'en' ? 'Immediate diagnostics at Bole Medhanealem' : 'በቦሌ መድኃኔዓለም ማዕከል ፈጣን ፍተሻ'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Contact Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    {language === 'en' ? 'Contact Name:' : 'ስም፡'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    {language === 'en' ? 'Phone Number:' : 'ስልክ ቁጥር፡'}
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (language === 'en' ? 'Submitting Claim...' : 'ጥያቄውን በማስገባት ላይ...')
                      : (language === 'en' ? 'Submit Official Claim' : 'ጥያቄውን አስገባ')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

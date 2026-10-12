import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  DollarSign, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  AlertTriangle,
  KeyRound,
  Check,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  PackageCheck,
  Zap,
  Info
} from 'lucide-react';
import { DeliveryStop, getOrderHandoverPin } from './courierTypes';

interface DeliveryCompletionModalProps {
  stop: DeliveryStop;
  language: 'en' | 'am';
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelivery: (details: { 
    recipientName: string; 
    codCollected: boolean; 
    notes: string;
    handoverPin: string;
    deviceInspectionConfirmed: boolean;
  }) => void;
}

export const DeliveryCompletionModal: React.FC<DeliveryCompletionModalProps> = ({
  stop,
  language,
  isOpen,
  onClose,
  onConfirmDelivery
}) => {
  const expectedPin = getOrderHandoverPin(stop.order);

  // Form states
  const [recipientName, setRecipientName] = useState(stop.order.customerName);
  const [codCollected, setCodCollected] = useState(!stop.isCod);
  const [notes, setNotes] = useState('Device physical inspection completed and approved at gate.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);

  // Device inspection criteria
  const [boxSealChecked, setBoxSealChecked] = useState(false);
  const [powerOnChecked, setPowerOnChecked] = useState(false);
  const [warrantyChecked, setWarrantyChecked] = useState(false);

  // 4-digit Handover PIN state
  const [enteredPin, setEnteredPin] = useState('');
  const [pinTouched, setPinTouched] = useState(false);

  if (!isOpen) return null;

  const isInspectionComplete = boxSealChecked && powerOnChecked && warrantyChecked;
  const isPinMatch = enteredPin.length === 4 && enteredPin === expectedPin;
  const isPinMismatch = enteredPin.length === 4 && !isPinMatch;

  const handleSelectAllInspection = () => {
    const allChecked = boxSealChecked && powerOnChecked && warrantyChecked;
    setBoxSealChecked(!allChecked);
    setPowerOnChecked(!allChecked);
    setWarrantyChecked(!allChecked);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setEnteredPin(val);
    setPinTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isInspectionComplete) {
      alert(language === 'en' 
        ? 'Please complete all physical device inspection requirements before releasing escrow.' 
        : 'እባክዎ ገንዘቡ ከመለቀቁ በፊት ሁሉንም የእቃ ፍተሻ መስፈርቶች ያረጋግጡ።');
      return;
    }

    if (!isPinMatch) {
      alert(language === 'en'
        ? 'Incorrect Handover PIN. Ask the customer to check their Kasma Tracking screen or SMS.'
        : 'የተሳሳተ ሚስጥር ቁጥር። ደንበኛው ከትዕዛዝ መከታተያ ገጻቸው ወይም ከኤስኤምኤስ እንዲያረጋግጡ ይጠይቁ።');
      return;
    }

    if (stop.isCod && !codCollected) {
      alert(language === 'en' 
        ? 'Please verify cash/telebirr collection before completing delivery.' 
        : 'እባክዎ የገንዘብ ክፍያ መሰብሰቡን ያረጋግጡ።');
      return;
    }

    setIsSubmitting(true);
    setIsCelebration(true);

    // Give visual celebration feedback before closing
    setTimeout(() => {
      onConfirmDelivery({
        recipientName: recipientName.trim() || stop.order.customerName,
        codCollected,
        notes: notes.trim(),
        handoverPin: enteredPin,
        deviceInspectionConfirmed: true
      });
      setIsSubmitting(false);
      setIsCelebration(false);
      onClose();
    }, 1400);
  };

  const merchantName = stop.order.items[0]?.product?.merchantName || 'Girma Tech Store';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-white animate-in zoom-in-95 duration-200 my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Celebration State Overlay */}
        {isCelebration ? (
          <div className="p-8 sm:p-10 text-center space-y-4 bg-gradient-to-b from-emerald-950/80 via-slate-900 to-slate-950">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                {language === 'en' ? '🔐 Escrow Funds Released!' : '🔐 የባንክ እግድ ተለቋል!'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {stop.order.total.toLocaleString()} ETB
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {language === 'en'
                  ? `Successfully settled to merchant "${merchantName}". Handover PIN verified.`
                  : `ክፍያው በቀጥታ ለነጋዴው "${merchantName}" ተላልፏል። ሚስጥር ቁጥር ተረጋግጧል።`}
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
                Order #{stop.order.id} • Handover Complete ✓
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {language === 'en' ? 'Device Inspection & Escrow Release' : 'የእቃ ምርመራ & የገንዘብ መልቀቂያ'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Stop #{stop.stopNumber} • Order #{stop.order.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Escrow Status Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-[#131C2E] border border-blue-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      {language === 'en' ? 'Kasma Protected Escrow' : 'በካስማ እግድ የተያዘ ሂሳብ'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white">
                      {stop.order.total.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {language === 'en' ? 'Held in Escrow' : 'በእግድ የተያዘ'}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {language === 'en' ? 'Release upon PIN match' : 'በፒን ማረጋገጫ የሚለቀቅ'}
                  </p>
                </div>
              </div>

              {/* 1. Device Physical Inspection Checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-200 uppercase tracking-wider">
                    <PackageCheck className="w-4 h-4 text-amber-400" />
                    <span>{language === 'en' ? 'Step 1: Physical Device Inspection' : 'ደረጃ 1፡ የእቃው አካላዊ ምርመራ'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllInspection}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    {isInspectionComplete 
                      ? (language === 'en' ? 'Deselect All' : 'ሁሉንም አትምረጥ') 
                      : (language === 'en' ? 'Select All Passed' : 'ሁሉንም አረጋግጥ')}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {language === 'en'
                    ? 'Verify physical condition with the customer in Addis Ababa before requesting their PIN:'
                    : 'ሚስጥር ቁጥሩን ከመቀበልዎ በፊት ከደንበኛው ጋር በአካል ይፈትሹ፡'}
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  {/* Criteria 1: Box Seal */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={boxSealChecked}
                      onChange={(e) => setBoxSealChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800 shrink-0"
                    />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-white block">
                        {language === 'en' ? 'Box Seal & Serial Number' : 'የእቃው ማሸጊያ እና ሰሪያል ቁጥር'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {language === 'en' 
                          ? 'Packaging is intact; hardware serial matches customer invoice.'
                          : 'ማሸጊያው ያልተበረዘ መሆኑ እና ሰሪያል ቁጥሩ ከደረሰኙ ጋር መመሳሰሉ ተረጋግጧል።'}
                      </span>
                    </div>
                  </label>

                  {/* Criteria 2: Power-on Test */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={powerOnChecked}
                      onChange={(e) => setPowerOnChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800 shrink-0"
                    />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-white block">
                        {language === 'en' ? 'Power-On & Screen Inspection' : 'የስራ ሁኔታና የስክሪን ምርመራ'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {language === 'en'
                          ? 'Device powers on; screen has no physical cracks or display defects.'
                          : 'መሳሪያው በትክክል ይበራል፤ ስክሪኑ ምንም መሰበር ወይም ብልሽት የለበትም።'}
                      </span>
                    </div>
                  </label>

                  {/* Criteria 3: Warranty card */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={warrantyChecked}
                      onChange={(e) => setWarrantyChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800 shrink-0"
                    />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-white block">
                        {language === 'en' ? 'Official Warranty Pass & Accessories' : 'ኦፊሴላዊ የዋስትና ሰነድ & መለዋወጫዎች'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {language === 'en'
                          ? 'Charger, accessories, and Kasma digital warranty card included.'
                          : 'ቻርጀር፣ ገመድ እና የካስማ ዋስትና ሰነድ ሙሉ በሙሉ ተረክቧል።'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. 4-Digit Handover PIN Verification */}
              <div className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                isPinMatch
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                  : isPinMismatch
                  ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-950 border-amber-500/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>{language === 'en' ? 'Step 2: 4-Digit Handover PIN' : 'ደረጃ 2፡ ባለ 4-አሃዝ የማስረከቢያ ፒን'}</span>
                  </div>
                  {isPinMatch ? (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{language === 'en' ? 'PIN Verified' : 'ፒን ተረጋግጧል'}</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400">
                      {language === 'en' ? 'From Customer Screen' : 'ከደንበኛው ስክሪን'}
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 leading-tight">
                  {language === 'en'
                    ? 'Ask the buyer for the 4-digit PIN displayed on their Kasma order tracking screen or confirmation SMS:'
                    : 'ደንበኛው በትዕዛዝ መከታተያ ገጻቸው ወይም በኤስኤምኤስ የተቀበሉትን 4-አሃዝ ሚስጥር ቁጥር ያስገቡ፡'}
                </p>

                {/* PIN Input Box */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={enteredPin}
                    onChange={handlePinChange}
                    placeholder="••••"
                    className={`w-44 py-2.5 px-3 rounded-2xl text-center text-2xl font-black font-mono tracking-[0.4em] bg-slate-900 border-2 transition-all focus:outline-none ${
                      isPinMatch
                        ? 'border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30'
                        : isPinMismatch
                        ? 'border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                        : 'border-slate-700 text-white focus:border-amber-400'
                    }`}
                  />
                </div>

                {/* Dynamic Status Feedback */}
                {isPinMatch ? (
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-300 font-bold">
                    <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {language === 'en'
                        ? `Valid Handover PIN! ${stop.order.total.toLocaleString()} ETB escrow authorized for release.`
                        : `ትክክለኛ ፒን! ${stop.order.total.toLocaleString()} ብር እግድ እንዲለቀቅ ተፈቅዷል።`}
                    </span>
                  </div>
                ) : isPinMismatch ? (
                  <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-[11px] text-rose-300 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>
                      {language === 'en'
                        ? 'Incorrect PIN. Ask buyer to open /tracking or check their SMS message.'
                        : 'የተሳሳተ ፒን። ደንበኛው ከትዕዛዝ መከታተያ ገጻቸው ወይም ከኤስኤምኤስ እንዲያረጋግጡ ይጠይቁ።'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                    <span>{enteredPin.length}/4 digits</span>
                    <span>Expected on customer order #{stop.order.id}</span>
                  </div>
                )}
              </div>

              {/* 3. COD Payment Collection Verification Banner (if COD) */}
              {stop.isCod ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <DollarSign className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        {language === 'en' ? 'Step 3: Cash On Delivery Collection' : 'ደረጃ 3፡ የገንዘብ ክፍያ መሰብሰብ'}
                      </h4>
                      <p className="text-base font-black text-amber-200 mt-0.5">
                        {stop.codAmount.toLocaleString()} ETB
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 pt-2 border-t border-amber-500/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={codCollected}
                      onChange={(e) => setCodCollected(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800 shrink-0"
                    />
                    <span className="text-xs font-bold text-amber-200">
                      {language === 'en' 
                        ? `I have collected ${stop.codAmount.toLocaleString()} ETB via Cash / Telebirr` 
                        : `${stop.codAmount.toLocaleString()} ብር በጥሬ ገንዘብ ወይም በቴሌብር ተቀብያለሁ`}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    {language === 'en' 
                      ? `Pre-paid via ${stop.order.paymentMethod}. Do NOT collect cash from buyer.` 
                      : `በ${stop.order.paymentMethod} አስቀድሞ የተከፈለ። ጥሬ ገንዘብ አይቀበሉ።`}
                  </span>
                </div>
              )}

              {/* Recipient Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'en' ? 'Recipient Full Name' : 'የተረካቢው ሙሉ ስም'}</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder={stop.order.customerName}
                  required
                />
              </div>

              {/* Handover / Proof Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>{language === 'en' ? 'Handover Notes' : 'የማስረከቢያ ማስታወሻ'}</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  placeholder="e.g. Device inspected and verified at gate."
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'ይቅር'}
                </button>

                <button
                  type="submit"
                  disabled={!isInspectionComplete || !isPinMatch || (stop.isCod && !codCollected) || isSubmitting}
                  className={`flex-2 py-3 rounded-2xl text-white text-xs font-black tracking-wide transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                    isInspectionComplete && isPinMatch && (!stop.isCod || codCollected) && !isSubmitting
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Unlock className="w-4 h-4 shrink-0" />
                  <span>
                    {isSubmitting 
                      ? (language === 'en' ? 'Releasing Escrow...' : 'እግዱ በመለቀቅ ላይ...')
                      : (language === 'en' ? 'Verify PIN & Release Escrow' : 'ፒን አረጋግጥ & ክፍያ ልቀቅ')}
                  </span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

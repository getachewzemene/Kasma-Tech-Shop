import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  DollarSign, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { DeliveryStop } from './courierTypes';

interface DeliveryCompletionModalProps {
  stop: DeliveryStop;
  language: 'en' | 'am';
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelivery: (details: { recipientName: string; codCollected: boolean; notes: string }) => void;
}

export const DeliveryCompletionModal: React.FC<DeliveryCompletionModalProps> = ({
  stop,
  language,
  isOpen,
  onClose,
  onConfirmDelivery
}) => {
  const [recipientName, setRecipientName] = useState(stop.order.customerName);
  const [codCollected, setCodCollected] = useState(!stop.isCod);
  const [notes, setNotes] = useState('Handed directly to recipient at compound gate.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stop.isCod && !codCollected) {
      alert(language === 'en' ? 'Please verify cash/telebirr collection before completing delivery.' : 'እባክዎ የገንዘብ ክፍያ መሰብሰቡን ያረጋግጡ።');
      return;
    }
    setIsSubmitting(true);
    onConfirmDelivery({
      recipientName: recipientName.trim() || stop.order.customerName,
      codCollected,
      notes: notes.trim()
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-white animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {language === 'en' ? 'Confirm Delivery Handover' : 'እቃው መድረሱን ያረጋግጡ'}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Customer Summary */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{language === 'en' ? 'Customer:' : 'ደንበኛ:'}</span>
              <span className="font-bold text-white">{stop.order.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{language === 'en' ? 'Location:' : 'ቦታ:'}</span>
              <span className="font-medium text-slate-300 truncate max-w-[200px]">
                {language === 'en' ? stop.landmark.nameEn : stop.landmark.nameAm}
              </span>
            </div>
          </div>

          {/* COD Payment Collection Verification Banner */}
          {stop.isCod ? (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 space-y-2">
              <div className="flex items-start gap-2.5">
                <DollarSign className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    {language === 'en' ? 'Cash On Delivery Collection' : 'በእጅ ወይም በቴሌብር የሚሰበሰብ ክፍያ'}
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
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800"
                />
                <span className="text-xs font-bold text-amber-200">
                  {language === 'en' 
                    ? `I have collected ${stop.codAmount.toLocaleString()} ETB via Cash / Telebirr` 
                    : `${stop.codAmount.toLocaleString()} ብር በጥሬ ገንዘብ ወይም በቴሌብር ተቀብያለሁ`}
                </span>
              </label>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                {language === 'en' 
                  ? `Pre-paid via ${stop.order.paymentMethod}. Do NOT collect cash.` 
                  : `በ${stop.order.paymentMethod} አስቀድሞ የተከፈለ። ጥሬ ገንዘብ አይቀበሉ።`}
              </span>
            </div>
          )}

          {/* Recipient Name Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'en' ? 'Received By (Full Name)' : 'የተረካቢው ሙሉ ስም'}</span>
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder={stop.order.customerName}
              required
            />
          </div>

          {/* Handover / Proof Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'en' ? 'Delivery Handover Notes' : 'የማስረከቢያ ማስታወሻ'}</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              placeholder="e.g. Handed to customer at gate / compound security approved"
            />
          </div>

          {/* Submit Action */}
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
              disabled={isSubmitting || (stop.isCod && !codCollected)}
              className="flex-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black tracking-wide transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'en' ? 'Complete Delivery (ደርሷል)' : 'ማድረሱን አረጋግጥ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

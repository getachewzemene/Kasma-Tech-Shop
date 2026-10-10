import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Clock, 
  Car, 
  PhoneOff, 
  Lock, 
  CloudRain,
  Send
} from 'lucide-react';
import { DeliveryStop } from './courierTypes';

interface CourierDelayModalProps {
  stop: DeliveryStop;
  language: 'en' | 'am';
  isOpen: boolean;
  onClose: () => void;
  onSubmitDelay: (reason: string, extraNote: string) => void;
}

export const CourierDelayModal: React.FC<CourierDelayModalProps> = ({
  stop,
  language,
  isOpen,
  onClose,
  onSubmitDelay
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('TRAFFIC');
  const [extraNote, setExtraNote] = useState('');

  if (!isOpen) return null;

  const reasons = [
    {
      id: 'TRAFFIC',
      icon: Car,
      labelEn: 'Heavy Traffic on Ring Road / Corridor',
      labelAm: 'ከፍተኛ የትራፊክ መጨናነቅ በመንገድ ላይ'
    },
    {
      id: 'PHONE_UNANSWERED',
      icon: PhoneOff,
      labelEn: 'Customer Phone Not Answering / Busy',
      labelAm: 'የደንበኛው ስልክ አይነሳም / አይሰራም'
    },
    {
      id: 'GATE_LOCKED',
      icon: Lock,
      labelEn: 'Compound Gate Locked / Guard Absent',
      labelAm: 'የግቢው በር ተቆልፏል / ዘበኛ የለም'
    },
    {
      id: 'WEATHER',
      icon: CloudRain,
      labelEn: 'Heavy Rain / Weather Delay',
      labelAm: 'ከባድ ዝናብ / የአየር ሁኔታ መስተጓጎል'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonObj = reasons.find(r => r.id === selectedReason);
    const reasonText = language === 'en' 
      ? (reasonObj?.labelEn || 'Delivery Delay')
      : (reasonObj?.labelAm || 'የማድረስ መዘግየት');

    onSubmitDelay(reasonText, extraNote.trim());
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
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {language === 'en' ? 'Report Route Delay' : 'የመዘግየት ችግር ሪፖርት ያድርጉ'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Stop #{stop.stopNumber} • {stop.order.customerName}
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
          <p className="text-xs text-slate-300">
            {language === 'en'
              ? 'Select reason to update tracking and automatically notify dispatch support:'
              : 'የመዘግየቱን ምክንያት በመምረጥ ለስርጭት አስተዳዳሪው ያሳውቁ:'}
          </p>

          {/* Quick Choice Buttons */}
          <div className="space-y-2">
            {reasons.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedReason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReason(r.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold leading-snug">
                    {language === 'en' ? r.labelEn : r.labelAm}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Additional Details */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'en' ? 'Additional Notes / Estimated Delay (mins)' : 'ተጨማሪ ማብራሪያ / የሚፈጀው ተጨማሪ ደቂቃ'}
            </label>
            <input
              type="text"
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              placeholder={language === 'en' ? 'e.g. Ring road blocked near Gotera, delay ~15 mins' : 'ለምሳሌ፡ ጎተራ ማሳለጫ አካባቢ መዘጋጋት አለ፣ ~15 ደቂቃ ይዘገያል'}
            />
          </div>

          {/* Action Buttons */}
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
              className="flex-2 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-black text-xs font-black tracking-wide transition-all shadow-lg shadow-amber-950 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'en' ? 'Report Delay' : 'ሪፖርት ላክ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

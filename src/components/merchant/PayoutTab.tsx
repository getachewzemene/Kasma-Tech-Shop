import React, { useState } from 'react';
import { Merchant, Payout } from '../../types';
import { 
  DollarSign, 
  Wallet, 
  Building, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  History, 
  ExternalLink,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface PayoutTabProps {
  currentMerchant: Merchant;
  onRequestPayout: (merchantId: string, amount: number, bank: string, account: string) => void;
  language: 'en' | 'am';
}

export default function PayoutTab({
  currentMerchant,
  onRequestPayout,
  language
}: PayoutTabProps) {
  const [amount, setAmount] = useState<number>(0);
  const [bank, setBank] = useState('Commercial Bank of Ethiopia (CBE)');
  const [account, setAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !account.trim()) {
      alert(language === 'en' ? 'Provide a valid transfer amount and receiving bank account.' : 'እባክዎን ትክክለኛ የገንዘብ መጠን እና የባንክ ሂሳብ ቁጥር ያስገቡ።');
      return;
    }

    if (amount > currentMerchant.balance) {
      alert(
        language === 'en'
          ? `⚠️ Requested withdrawal of ${amount.toLocaleString()} ETB exceeds your current settled balance of ${currentMerchant.balance.toLocaleString()} ETB.`
          : `⚠️ የጠየቁት የ ${amount.toLocaleString()} ETB ማስተላለፊያ አሁን ካለዎት የ ${currentMerchant.balance.toLocaleString()} ETB ቀሪ ሂሳብ ይበልጣል።`
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onRequestPayout(currentMerchant.id, amount, bank, account);
      setAmount(0);
      setAccount('');
      setIsSubmitting(false);
      alert(
        language === 'en'
          ? 'Payout request queued! Auditing team will verify compliance within 4 business hours.'
          : 'የገንዘብ ማስተላለፊያ ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል! በአራት የሥራ ሰዓታት ውስጥ ሂሳብዎ ይተላለፋል።'
      );
    }, 1200);
  };

  const handleQuickPreFill = (pct: number) => {
    const val = Math.floor(currentMerchant.balance * pct);
    setAmount(val);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Split layout: Transfer Form vs History timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Bank disbursement Form */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
                {language === 'en' ? 'Bank Remittance Request' : 'የገንዘብ ማስተላለፊያ ጥያቄ'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'en' ? 'Transfer secure settled escrow balance to local Ethiopian accounts.' : 'በመድረኩ የተረጋገጠውን ቀሪ ሂሳብዎን ወደ ባንክ አካውንትዎ ያስተላልፉ።'}
              </p>
            </div>
            <span className="p-2 bg-blue-50 dark:bg-zinc-800 rounded-xl text-[#0052FF]">
              <Wallet className="w-5 h-5" />
            </span>
          </div>

          <div className="bg-gray-50/50 dark:bg-zinc-850/15 border border-gray-150 dark:border-zinc-800 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
              {language === 'en' ? 'Settled Ledger Balance' : 'ለመውጣት የተዘጋጀ ቀሪ ሂሳብ'}
            </span>
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white">
              {currentMerchant.balance.toLocaleString()} <span className="text-xs text-gray-550 dark:text-zinc-400 font-sans font-normal">ETB</span>
            </p>
          </div>

          <form onSubmit={handleRequestSubmit} className="space-y-4 pt-1">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex justify-between">
                <span>{language === 'en' ? 'Withdrawal Amount (ETB)' : 'የሚወጣው የገንዘብ መጠን'}</span>
                <span className="text-[9px] text-[#0052FF] font-black">{language === 'en' ? 'SLA: Zero commission' : 'ያለ ምንም ኮሚሽን'}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="50"
                  max={currentMerchant.balance}
                  placeholder="Minimum 50 ETB"
                  value={amount || ''}
                  onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-black text-gray-900 dark:text-white font-mono font-bold"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-400">ETB</span>
              </div>
              
              {/* Percent prefill shortcuts */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickPreFill(0.25)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-gray-150 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 hover:text-black cursor-pointer"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreFill(0.5)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-gray-150 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 hover:text-black cursor-pointer"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreFill(1)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-[#0052FF]/20 bg-blue-50/20 text-[#0052FF] rounded-lg hover:bg-blue-50/40 cursor-pointer"
                >
                  {language === 'en' ? 'Max Balance' : 'ሁሉንም ቀሪ ሂሳብ'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                {language === 'en' ? 'Select Destination Local Bank' : 'ተቀባይ የባንክ አይነት'}
              </label>
              <select
                value={bank}
                onChange={e => setBank(e.target.value)}
                className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-black font-semibold"
              >
                <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                <option value="Awash International Bank">Awash International Bank</option>
                <option value="Dashen Bank">Dashen Bank</option>
                <option value="Telebirr Merchant Wallet">Telebirr Merchant Wallet</option>
                <option value="Cooperative Bank of Oromia (Coop)">Cooperative Bank of Oromia (Coop)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                {language === 'en' ? 'Destination Bank Account Number *' : 'የባንክ ሂሳብ ቁጥር *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1000293849182"
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-black text-gray-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || amount <= 0}
                className="w-full py-3.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Audit Remittance...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{language === 'en' ? 'Request Immediate CBE Transfer' : 'የገንዘብ ማስተላለፊያ ጠይቅ'}</span>
                  </>
                )}
              </button>
            </div>

          </form>

          <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-50/50 dark:bg-zinc-850/20 p-3 rounded-lg border border-gray-150 dark:border-zinc-800/40 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
            <p>
              {language === 'en'
                ? 'All transactions are monitored by National Bank of Ethiopia regulatory compliance guidelines.'
                : 'ሁሉም ማስተላለፊያዎች በኢትዮጵያ ብሔራዊ ባንክ ደንቦች መሠረት ቁጥጥር ይደረግባቸዋል።'}
            </p>
          </div>
        </div>

        {/* Right Column: Transaction History Timeline */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-2 flex justify-between items-center">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#C5A059]" />
              {language === 'en' ? 'Disbursement Ledger History' : 'የክፍያ ታሪክ ምዝግብ'}
            </h4>
            <span className="text-[10px] font-mono text-gray-400">Compliance Audit: Clear</span>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {currentMerchant.payouts && currentMerchant.payouts.map(payout => {
              const dateObj = new Date(payout.createdAt);
              const isComp = payout.status === 'COMPLETED';
              const isPend = payout.status === 'PENDING';

              return (
                <div key={payout.id} className="relative pl-6 border-l-2 border-gray-100 dark:border-zinc-800/80 last:border-0 pb-4 space-y-1">
                  {/* Timeline dot */}
                  <span className={`absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full ${isComp ? 'bg-emerald-500' : isPend ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs font-black text-gray-900 dark:text-white">
                        {payout.amount.toLocaleString()} <span className="text-[10px] text-gray-500 font-sans font-normal">ETB</span>
                      </p>
                      <p className="text-[9.5px] text-gray-400 font-bold flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        {payout.bankName} • AC: {payout.accountNumber.substring(0, 4)}***
                      </p>
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isComp 
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : isPend
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse'
                          : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      {payout.status}
                    </span>
                  </div>

                  <p className="text-[9px] text-gray-400 font-semibold font-mono">
                    ID: {payout.id} • {dateObj.toLocaleString(language === 'en' ? 'en-US' : 'am-ET')}
                  </p>
                </div>
              );
            })}

            {(!currentMerchant.payouts || currentMerchant.payouts.length === 0) && (
              <div className="text-center py-16 text-gray-400 text-xs space-y-2">
                <p>{language === 'en' ? 'No payout request files generated.' : 'ምንም የክፍያ ታሪክ ምዝግብ የለም።'}</p>
                <button 
                  onClick={() => setAmount(Math.floor(currentMerchant.balance * 0.5))}
                  className="text-[#0052FF] font-bold hover:underline"
                >
                  {language === 'en' ? 'Request first transfer' : 'የመጀመሪያ ክፍያ ለመጠየቅ እዚህ ይጫኑ'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

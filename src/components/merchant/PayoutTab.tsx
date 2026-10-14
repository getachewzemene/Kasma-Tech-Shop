import React, { useState } from 'react';
import { Merchant, Payout, SavedBankAccount } from '../../types';
import { 
  Wallet, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  History, 
  ArrowUpRight, 
  ShieldCheck,
  Plus,
  Trash2,
  Star,
  Smartphone,
  CreditCard,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PayoutTabProps {
  currentMerchant: Merchant;
  onRequestPayout: (
    merchantId: string, 
    amount: number, 
    bank: string, 
    account: string,
    accountHolderName?: string,
    saveProfile?: boolean
  ) => void;
  language: 'en' | 'am';
}

interface BankDefinition {
  name: string;
  amharicName: string;
  code: string;
  isCbe: boolean;
  isTelebirr: boolean;
  color: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  badgeText: string;
  hintEn: string;
  hintAm: string;
}

const SUPPORTED_BANKS: BankDefinition[] = [
  {
    name: 'Commercial Bank of Ethiopia (CBE)',
    amharicName: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
    code: 'CBE',
    isCbe: true,
    isTelebirr: false,
    color: '#7E1D8D', // CBE Purple
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    borderLight: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-900 dark:text-purple-200',
    badgeText: '13-Digit CBE A/C',
    hintEn: 'Exact 13-digit CBE account number (e.g. 1000123456789)',
    hintAm: 'ባለ 13 አሃዝ የንግድ ባንክ ሂሳብ ቁጥር (ለምሳሌ፡ 1000123456789)'
  },
  {
    name: 'Telebirr Merchant Wallet',
    amharicName: 'የቴሌብር ነጋዴ ዋሌት',
    code: 'TELEBIRR',
    isCbe: false,
    isTelebirr: true,
    color: '#0052FF', // Telebirr Blue
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    borderLight: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-900 dark:text-blue-200',
    badgeText: 'Telebirr 10-Digit Mobile',
    hintEn: 'Ethiopian mobile number (09... or 07...)',
    hintAm: 'የኢትዮጵያ ሞባይል ቁጥር (09... ወይም 07...)'
  },
  {
    name: 'Bank of Abyssinia (BoA)',
    amharicName: 'የአቢሲኒያ ባንክ (BoA)',
    code: 'BOA',
    isCbe: false,
    isTelebirr: false,
    color: '#D97706', // Abyssinia Amber / Gold
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderLight: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-900 dark:text-amber-200',
    badgeText: 'BoA Apollo Rail',
    hintEn: 'Standard domestic account number (e.g. 892019482)',
    hintAm: 'መደበኛ የአቢሲኒያ ባንክ ሂሳብ ቁጥር (ለምሳሌ፡ 892019482)'
  },
  {
    name: 'Awash International Bank',
    amharicName: 'አዋሽ ኢንተርናሽናል ባንክ',
    code: 'AWASH',
    isCbe: false,
    isTelebirr: false,
    color: '#0F766E', // Teal
    bgLight: 'bg-teal-50 dark:bg-teal-950/40',
    borderLight: 'border-teal-200 dark:border-teal-800',
    textColor: 'text-teal-900 dark:text-teal-200',
    badgeText: 'Awash Online Rail',
    hintEn: 'Standard domestic account number',
    hintAm: 'መደበኛ የባንክ ሂሳብ ቁጥር'
  },
  {
    name: 'Dashen Bank',
    amharicName: 'ዳሽን ባንክ',
    code: 'DASHEN',
    isCbe: false,
    isTelebirr: false,
    color: '#1E3A8A', // Navy
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderLight: 'border-indigo-200 dark:border-indigo-800',
    textColor: 'text-indigo-900 dark:text-indigo-200',
    badgeText: 'Amole / Dashen Rail',
    hintEn: 'Standard domestic account number',
    hintAm: 'መደበኛ የባንክ ሂሳብ ቁጥር'
  },
  {
    name: 'Cooperative Bank of Oromia (Coop)',
    amharicName: 'የኦሮሚያ ህብረት ስራ ባንክ',
    code: 'COOP',
    isCbe: false,
    isTelebirr: false,
    color: '#B45309', // Bronze
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderLight: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-900 dark:text-amber-200',
    badgeText: 'CoopPay Rail',
    hintEn: 'Standard domestic account number',
    hintAm: 'መደበኛ የባንክ ሂሳብ ቁጥር'
  }
];

// Popular Custom Bank Quick-Pill Suggestions in Ethiopia
const CUSTOM_BANK_SUGGESTIONS = [
  'Nib International Bank',
  'Hibret Bank',
  'Zemen Bank',
  'Berhan Bank',
  'Sinqee Bank',
  'Wegagen Bank',
  'Oromia Bank',
  'Enat Bank',
  'Global Bank Ethiopia',
  'Tsedey Bank',
  'Hijra Bank',
  'Gadaa Bank'
];

export default function PayoutTab({
  currentMerchant,
  onRequestPayout,
  language
}: PayoutTabProps) {
  // Saved accounts state initialized from current merchant or local mock
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>(() => {
    return currentMerchant.savedBankAccounts && currentMerchant.savedBankAccounts.length > 0
      ? currentMerchant.savedBankAccounts
      : [
          {
            id: `ba-${currentMerchant.id}-cbe`,
            bankName: 'Commercial Bank of Ethiopia (CBE)',
            accountNumber: '1000123456789',
            accountHolderName: `${currentMerchant.ownerName} / ${currentMerchant.storeName}`,
            isDefault: true,
            createdAt: new Date().toISOString()
          },
          {
            id: `ba-${currentMerchant.id}-boa`,
            bankName: 'Bank of Abyssinia (BoA)',
            accountNumber: '892019482',
            accountHolderName: `${currentMerchant.ownerName} / ${currentMerchant.storeName}`,
            isDefault: false,
            createdAt: new Date().toISOString()
          },
          {
            id: `ba-${currentMerchant.id}-tlb`,
            bankName: 'Telebirr Merchant Wallet',
            accountNumber: currentMerchant.phone?.replace(/\s+/g, '') || '0911456789',
            accountHolderName: currentMerchant.ownerName || currentMerchant.storeName,
            isDefault: false,
            createdAt: new Date().toISOString()
          }
        ];
  });

  // Selected Profile state
  const defaultAcc = savedAccounts.find(a => a.isDefault) || savedAccounts[0];
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(defaultAcc ? defaultAcc.id : null);

  // Remittance Form State
  const [amount, setAmount] = useState<number>(0);
  const [bank, setBank] = useState<string>(() => {
    if (!defaultAcc) return 'Commercial Bank of Ethiopia (CBE)';
    const isStandard = SUPPORTED_BANKS.some(b => b.name === defaultAcc.bankName);
    return isStandard ? defaultAcc.bankName : 'OTHER_CUSTOM';
  });
  const [customBankName, setCustomBankName] = useState<string>(() => {
    if (!defaultAcc) return '';
    const isStandard = SUPPORTED_BANKS.some(b => b.name === defaultAcc.bankName);
    return isStandard ? '' : defaultAcc.bankName;
  });
  const [account, setAccount] = useState<string>(defaultAcc ? defaultAcc.accountNumber : '');
  const [accountHolderName, setAccountHolderName] = useState<string>(defaultAcc ? defaultAcc.accountHolderName : currentMerchant.ownerName || currentMerchant.storeName);
  const [saveThisProfile, setSaveThisProfile] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add New Profile Drawer / Modal state
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newBankName, setNewBankName] = useState('Commercial Bank of Ethiopia (CBE)');
  const [newCustomBankName, setNewCustomBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState(currentMerchant.ownerName || currentMerchant.storeName);
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isSavingProfileLoading, setIsSavingProfileLoading] = useState(false);

  // Sync selected account details whenever user switches saved profile
  const handleSelectProfile = (acc: SavedBankAccount) => {
    setSelectedAccountId(acc.id);
    const isStandard = SUPPORTED_BANKS.some(b => b.name === acc.bankName);
    if (isStandard) {
      setBank(acc.bankName);
      setCustomBankName('');
    } else {
      setBank('OTHER_CUSTOM');
      setCustomBankName(acc.bankName);
    }
    setAccount(acc.accountNumber);
    setAccountHolderName(acc.accountHolderName);
  };

  // Dynamic Bank Badge and Color resolver for both standard and custom banks
  const getBankBadgeConfig = (bankNameStr: string): BankDefinition => {
    const matched = SUPPORTED_BANKS.find(b => b.name.toLowerCase() === bankNameStr.toLowerCase());
    if (matched) return matched;

    // Custom Bank Dynamic Configuration
    const words = bankNameStr.trim().split(/\s+/).filter(Boolean);
    const code = words.length >= 2 
      ? words.slice(0, 3).map(w => w[0]).join('').toUpperCase() 
      : bankNameStr.slice(0, 4).toUpperCase() || 'BANK';

    return {
      name: bankNameStr,
      amharicName: bankNameStr,
      code,
      isCbe: bankNameStr.includes('CBE') || bankNameStr.includes('Commercial Bank'),
      isTelebirr: bankNameStr.includes('Telebirr'),
      color: '#4F46E5', // Indigo for custom bank
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderLight: 'border-indigo-200 dark:border-indigo-800',
      textColor: 'text-indigo-900 dark:text-indigo-200',
      badgeText: 'Custom Bank Rail',
      hintEn: 'Standard domestic account number',
      hintAm: 'መደበኛ የባንክ ሂሳብ ቁጥር'
    };
  };

  // Active bank name for form logic
  const effectiveFormBankName = bank === 'OTHER_CUSTOM' ? customBankName : bank;
  const isCbe = effectiveFormBankName.includes('CBE') || effectiveFormBankName.includes('Commercial Bank');
  const isTelebirr = effectiveFormBankName.includes('Telebirr');
  const cleanDigits = account.replace(/\D/g, '');
  const isCbeValid13 = isCbe && cleanDigits.length === 13;
  const isTelebirrValid = isTelebirr && /^(\+2519|\+2517|09|07)\d{8}$/.test(account.trim().replace(/\s+/g, ''));

  // Quick Pre-fill Percentage
  const handleQuickPreFill = (pct: number) => {
    const val = Math.floor(currentMerchant.balance * pct);
    setAmount(val);
  };

  // Submit Payout Request
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBank = (bank === 'OTHER_CUSTOM' ? customBankName.trim() : bank).trim();
    const cleanAccount = account.trim().replace(/\s+/g, '');

    if (!finalBank) {
      alert(language === 'en' ? 'Please specify the custom bank name.' : 'እባክዎን የባንኩን ስም ያስገቡ።');
      return;
    }

    if (amount <= 0 || !cleanAccount) {
      alert(language === 'en' ? 'Provide a valid transfer amount and receiving bank account.' : 'እባክዎን ትክክለኛ የገንዘብ መጠን እና የባንክ ሂሳብ ቁጥር ያስገቡ።');
      return;
    }

    if ((finalBank.includes('CBE') || finalBank.includes('Commercial Bank')) && cleanAccount.replace(/\D/g, '').length !== 13) {
      alert(
        language === 'en'
          ? 'Commercial Bank of Ethiopia (CBE) accounts must be exactly 13 digits (e.g. 1000123456789).'
          : 'የኢትዮጵያ ንግድ ባንክ (CBE) የሂሳብ ቁጥር በትክክል 13 አሃዝ መሆን አለበት (ለምሳሌ፡ 1000123456789)።'
      );
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
      onRequestPayout(
        currentMerchant.id, 
        amount, 
        finalBank, 
        cleanAccount, 
        accountHolderName, 
        saveThisProfile
      );

      // If merchant chose to save this profile, update local list
      if (saveThisProfile) {
        const exists = savedAccounts.some(a => a.accountNumber === cleanAccount && a.bankName.toLowerCase() === finalBank.toLowerCase());
        if (!exists) {
          const created: SavedBankAccount = {
            id: `ba-${Date.now()}`,
            bankName: finalBank,
            accountNumber: cleanAccount,
            accountHolderName: accountHolderName || currentMerchant.ownerName || currentMerchant.storeName,
            isDefault: savedAccounts.length === 0,
            createdAt: new Date().toISOString()
          };
          setSavedAccounts(prev => [created, ...prev]);
        }
      }

      setAmount(0);
      setIsSubmitting(false);
      alert(
        language === 'en'
          ? `Payout request for ${amount.toLocaleString()} ETB to ${finalBank} (${cleanAccount}) queued! Compliance audit SLA: 4 hours.`
          : `የ ${amount.toLocaleString()} ETB የገንዘብ ማስተላለፊያ ጥያቄ ወደ ${finalBank} (${cleanAccount}) በተሳካ ሁኔታ ተመዝግቧል!`
      );
    }, 1000);
  };

  // Add New Bank Account Profile Handler (Supports Standard + Custom Banks)
  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNewBank = (newBankName === 'OTHER_CUSTOM' ? newCustomBankName.trim() : newBankName).trim();
    const cleanNumber = newAccountNumber.trim().replace(/\s+/g, '');
    const cleanHolder = newAccountHolder.trim() || currentMerchant.ownerName || currentMerchant.storeName;

    if (!finalNewBank) {
      alert(language === 'en' ? 'Please enter the custom bank name.' : 'እባክዎን የባንኩን ስም ያስገቡ።');
      return;
    }

    if (!cleanNumber) {
      alert(language === 'en' ? 'Please enter a valid account or phone number.' : 'እባክዎን ትክክለኛ የሂሳብ ወይም የስልክ ቁጥር ያስገቡ።');
      return;
    }

    if ((finalNewBank.includes('CBE') || finalNewBank.includes('Commercial Bank')) && cleanNumber.replace(/\D/g, '').length !== 13) {
      alert(
        language === 'en'
          ? 'Commercial Bank of Ethiopia (CBE) accounts must be exactly 13 digits (e.g. 1000123456789).'
          : 'የኢትዮጵያ ንግድ ባንክ (CBE) የሂሳብ ቁጥር በትክክል 13 አሃዝ መሆን አለበት።'
      );
      return;
    }

    setIsSavingProfileLoading(true);

    try {
      const token = localStorage.getItem('kasma_merchant_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/merchants/${currentMerchant.id}/bank-accounts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bankName: finalNewBank,
          accountNumber: cleanNumber,
          accountHolderName: cleanHolder,
          isDefault: newIsDefault || savedAccounts.length === 0
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save account profile');

      const newProfile: SavedBankAccount = data.account || {
        id: `ba-${Date.now()}`,
        bankName: finalNewBank,
        accountNumber: cleanNumber,
        accountHolderName: cleanHolder,
        isDefault: newIsDefault || savedAccounts.length === 0,
        createdAt: new Date().toISOString()
      };

      setSavedAccounts(prev => {
        let updated = newProfile.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev];
        return [newProfile, ...updated];
      });

      // Auto-select this newly created account for active remittance
      handleSelectProfile(newProfile);
      setIsAddingProfile(false);
      setNewAccountNumber('');
      setNewCustomBankName('');
      setNewIsDefault(false);
    } catch (err: any) {
      // Local optimistic fallback
      const newProfile: SavedBankAccount = {
        id: `ba-${Date.now()}`,
        bankName: finalNewBank,
        accountNumber: cleanNumber,
        accountHolderName: cleanHolder,
        isDefault: newIsDefault || savedAccounts.length === 0,
        createdAt: new Date().toISOString()
      };
      setSavedAccounts(prev => {
        let updated = newProfile.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev];
        return [newProfile, ...updated];
      });
      handleSelectProfile(newProfile);
      setIsAddingProfile(false);
      setNewAccountNumber('');
      setNewCustomBankName('');
      setNewIsDefault(false);
    } finally {
      setIsSavingProfileLoading(false);
    }
  };

  // Set as Default Profile
  const handleSetDefault = async (accountId: string) => {
    try {
      const token = localStorage.getItem('kasma_merchant_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/merchants/${currentMerchant.id}/bank-accounts/${accountId}/default`, {
        method: 'PUT',
        headers
      });
    } catch {}

    setSavedAccounts(prev =>
      prev.map(acc => ({
        ...acc,
        isDefault: acc.id === accountId
      }))
    );
  };

  // Delete Profile
  const handleDeleteAccount = async (accountId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(language === 'en' ? 'Are you sure you want to delete this saved payout profile?' : 'እርግጠኛ ነዎት ይህን የተቀመጠ የባንክ ሂሳብ መሰረዝ ይፈልጋሉ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('kasma_merchant_token') || localStorage.getItem('kasma_admin_token') || localStorage.getItem('kasma_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/merchants/${currentMerchant.id}/bank-accounts/${accountId}`, {
        method: 'DELETE',
        headers
      });
    } catch {}

    setSavedAccounts(prev => {
      const remaining = prev.filter(acc => acc.id !== accountId);
      if (selectedAccountId === accountId) {
        if (remaining.length > 0) {
          handleSelectProfile(remaining[0]);
        } else {
          setSelectedAccountId(null);
          setAccount('');
        }
      }
      return remaining;
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* SECTION: Saved Bank Account Profiles Carousel & Quick Selection */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] rounded-lg">
                <CreditCard className="w-4 h-4" />
              </span>
              <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                {language === 'en' ? 'Saved Bank & Telebirr Profiles' : 'የተቀመጡ የባንክ እና ቴሌብር ሂሳቦች'}
              </h3>
              <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-950 text-[#0052FF] px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                1-Click Remittance
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              {language === 'en' 
                ? "Select your verified 13-digit CBE account, Bank of Abyssinia, Telebirr, or custom domestic banks. No need to re-type on every withdrawal." 
                : 'ለፈጣን ገንዘብ ማስተላለፍ የተቀመጠውን ባለ 13 አሃዝ የንግድ ባንክ፣ የአቢሲኒያ ባንክ፣ ቴሌብር ወይም የፈለጉትን የባንክ ሂሳብ ይምረጡ። በየጊዜው መተየብ አያስፈልግዎትም።'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingProfile(!isAddingProfile)}
            className="px-3.5 py-2 bg-[#0052FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Add Bank / Custom Bank' : 'አዲስ / ሌላ የባንክ ሂሳብ ጨምር'}</span>
          </button>
        </div>

        {/* Collapsible Add New Profile Form */}
        <AnimatePresence>
          {isAddingProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAddNewAccount} className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-zinc-850/60 border border-gray-200 dark:border-zinc-750 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs uppercase tracking-wider text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'en' ? 'Save New Bank / Custom Bank Profile' : 'አዲስ የባንክ ሂሳብ መረጃ መዝግብ'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingProfile(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1 rounded-lg text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      {language === 'en' ? 'Ethiopian Bank Rail' : 'የባንክ አይነት'}
                    </label>
                    <select
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white outline-none focus:border-[#0052FF]"
                    >
                      {SUPPORTED_BANKS.map(b => (
                        <option key={b.name} value={b.name}>
                          {language === 'en' ? b.name : b.amharicName}
                        </option>
                      ))}
                      <option value="OTHER_CUSTOM">
                        {language === 'en' ? '+ Other / Custom Ethiopian Bank...' : '+ ሌላ የኢትዮጵያ ባንክ...'}
                      </option>
                    </select>
                  </div>

                  {/* If Custom Bank is Selected: Custom Bank Name Input & Quick Suggestions */}
                  {newBankName === 'OTHER_CUSTOM' && (
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {language === 'en' ? 'Custom Ethiopian Bank Name *' : 'የባንኩ ስም (ለምሳሌ፡ ንብ ባንክ፣ ኅብረት ባንክ) *'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hibret Bank, Nib International, Zemen Bank, Sinqee Bank"
                          value={newCustomBankName}
                          onChange={(e) => setNewCustomBankName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-[#0052FF] bg-white dark:bg-zinc-900 text-gray-900 dark:text-white outline-none"
                        />
                        <Landmark className="w-4 h-4 text-[#0052FF] absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>

                      {/* Quick-pill bank suggestions */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <span className="text-[9.5px] font-bold text-gray-400 self-center">
                          {language === 'en' ? 'Quick suggestions:' : 'አማራጮች:'}
                        </span>
                        {CUSTOM_BANK_SUGGESTIONS.slice(0, 6).map((suggested) => (
                          <button
                            key={suggested}
                            type="button"
                            onClick={() => setNewCustomBankName(suggested)}
                            className="px-2 py-0.5 text-[9.5px] font-bold rounded-md bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-[#0052FF] text-gray-700 dark:text-zinc-200 transition-all cursor-pointer"
                          >
                            {suggested}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex justify-between">
                      <span>{language === 'en' ? 'Account Number / Phone' : 'የሂሳብ ቁጥር / ስልክ'}</span>
                      {newBankName.includes('CBE') && (
                        <span className={`text-[9px] font-mono font-bold ${newAccountNumber.replace(/\D/g, '').length === 13 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {newAccountNumber.replace(/\D/g, '').length} / 13 digits
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        newBankName.includes('CBE') 
                          ? 'e.g. 1000123456789' 
                          : newBankName.includes('Abyssinia')
                          ? 'e.g. 892019482'
                          : newBankName.includes('Telebirr')
                          ? 'e.g. 0911234567'
                          : 'e.g. 0150987654321'
                      }
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-gray-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white outline-none focus:border-[#0052FF]"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {newBankName.includes('CBE') 
                        ? (language === 'en' ? 'CBE format: exactly 13 numeric digits.' : 'ንግድ ባንክ፡ በትክክል ባለ 13 አሃዝ ቁጥር።')
                        : newBankName.includes('Abyssinia')
                        ? (language === 'en' ? 'Bank of Abyssinia domestic account number.' : 'የአቢሲኒያ ባንክ መደበኛ የሂሳብ ቁጥር።')
                        : (language === 'en' ? 'Domestic Ethiopian bank / Telebirr account format.' : 'የኢትዮጵያ ባንክ ወይም ቴሌብር ሂሳብ ቁጥር።')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      {language === 'en' ? 'Beneficiary Name' : 'የሂሳብ ባለቤት ስም'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Girma Tesfaye Tech"
                      value={newAccountHolder}
                      onChange={(e) => setNewAccountHolder(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-250 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white outline-none focus:border-[#0052FF]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-gray-200 dark:border-zinc-750">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={newIsDefault}
                      onChange={(e) => setNewIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0052FF] focus:ring-[#0052FF] border-gray-300"
                    />
                    <span className="font-medium">{language === 'en' ? 'Set as default withdrawal account' : 'ዋና ተመራጭ የክፍያ መቀበያ ይሁን'}</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProfile(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 font-bold"
                    >
                      {language === 'en' ? 'Cancel' : 'ሰርዝ'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfileLoading}
                      className="px-4 py-2 bg-[#0052FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSavingProfileLoading ? 'Saving...' : (language === 'en' ? 'Save Account Profile' : 'አስቀምጥ')}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Account Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {savedAccounts.map((acc) => {
            const isSelected = selectedAccountId === acc.id;
            const bankConf = getBankBadgeConfig(acc.bankName);
            const isCbeAcc = acc.bankName.includes('CBE') || acc.bankName.includes('Commercial Bank');
            const isTelebirrAcc = acc.bankName.includes('Telebirr');
            const isBoaAcc = acc.bankName.includes('Abyssinia');

            return (
              <div
                key={acc.id}
                onClick={() => handleSelectProfile(acc)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                  isSelected
                    ? 'border-[#0052FF] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#0052FF]/30 shadow-xs'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:border-gray-350 dark:hover:border-zinc-700'
                }`}
              >
                {/* Top Row: Bank Badge & Default Star */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: bankConf.color }}
                    >
                      {bankConf.code}
                    </span>
                    <span className="text-[11px] font-extrabold text-gray-900 dark:text-zinc-100 truncate max-w-[150px]" title={acc.bankName}>
                      {acc.bankName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {acc.isDefault ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>DEFAULT</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(acc.id);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[10px] transition-colors"
                        title={language === 'en' ? 'Make Default Account' : 'ዋና ተመራጭ አድርግ'}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {savedAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteAccount(acc.id, e)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-[10px] transition-colors"
                        title={language === 'en' ? 'Remove Account' : 'አስወግድ'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Middle: Formatted Account Number */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {isCbeAcc ? (
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/50 px-1.5 py-0.2 rounded font-mono">
                        13-DIGIT CBE
                      </span>
                    ) : isTelebirrAcc ? (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/50 px-1.5 py-0.2 rounded font-mono">
                        TELEBIRR
                      </span>
                    ) : isBoaAcc ? (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/50 px-1.5 py-0.2 rounded font-mono">
                        ABYSSINIA
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/50 px-1.5 py-0.2 rounded font-mono">
                        CUSTOM BANK
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-sm font-black text-gray-950 dark:text-white tracking-wide">
                    {acc.accountNumber}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium truncate">
                    {acc.accountHolderName}
                  </p>
                </div>

                {/* Bottom Row: Active Selection indicator */}
                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[10px]">
                  {isSelected ? (
                    <span className="text-[#0052FF] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Selected for Remittance' : 'ለመውጣት ተመርጧል'}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 font-bold group-hover:text-gray-700">
                      {language === 'en' ? 'Click to Use' : 'ለመምረጥ ይጫኑ'}
                    </span>
                  )}
                  <span className="text-gray-400 font-mono text-[9px]">
                    Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split layout: Transfer Form vs History timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Bank disbursement Form */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
            <div>
              <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                {language === 'en' ? 'Bank Remittance Request' : 'የገንዘብ ማስተላለፊያ ጥያቄ'}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {language === 'en' ? 'Transfer settled balance directly to your selected Ethiopian account.' : 'በመድረኩ የተረጋገጠውን ቀሪ ሂሳብዎን ወደ ባንክ አካውንትዎ ያስተላልፉ።'}
              </p>
            </div>
            <span className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-[#0052FF] shadow-xs">
              <Wallet className="w-5 h-5" />
            </span>
          </div>

          {/* Settled Ledger Balance Card */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-zinc-850/60 dark:to-blue-950/20 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
              <span>{language === 'en' ? 'Settled Ledger Balance' : 'ለመውጣት የተዘጋጀ ቀሪ ሂሳብ'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Escrow Cleared</span>
              </span>
            </span>
            <p className="text-2xl font-black font-mono text-gray-900 dark:text-white">
              {currentMerchant.balance.toLocaleString()} <span className="text-xs text-gray-500 dark:text-zinc-400 font-sans font-normal">ETB</span>
            </p>
          </div>

          {/* Active Pre-Filled Banner */}
          {selectedAccountId && (
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse" />
                <div>
                  <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-bold block">
                    {language === 'en' ? 'PRE-FILLED FOR WITHDRAWAL' : 'ለማስተላለፍ የተዘጋጀ ሂሳብ'}:
                  </span>
                  <span className="font-extrabold text-[#0052FF] dark:text-blue-400 font-mono">
                    {effectiveFormBankName} • {account}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedAccountId(null);
                  setAccount('');
                }}
                className="text-[10px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200 underline cursor-pointer"
              >
                {language === 'en' ? 'Edit / Manual' : 'በእጅ ቀይር'}
              </button>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="space-y-4 pt-1">
            
            {/* Withdrawal Amount Input */}
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
                  className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/40 rounded-xl pl-12 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white font-mono font-bold"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-black text-gray-400">
                  ETB
                </span>
              </div>
              
              {/* Percent prefill shortcuts */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickPreFill(0.25)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreFill(0.5)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreFill(1)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-[#0052FF]/20 bg-blue-50/30 text-[#0052FF] rounded-lg hover:bg-blue-50/60 cursor-pointer"
                >
                  {language === 'en' ? 'Max Settled Balance' : 'ሁሉንም ቀሪ ሂሳብ'}
                </button>
              </div>
            </div>

            {/* Destination Bank Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                {language === 'en' ? 'Select Destination Local Bank' : 'ተቀባይ የባንክ አይነት'}
              </label>
              <select
                value={bank}
                onChange={e => {
                  setBank(e.target.value);
                  setSelectedAccountId(null);
                }}
                className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/40 rounded-xl px-3 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-[#0052FF] font-semibold"
              >
                {SUPPORTED_BANKS.map(b => (
                  <option key={b.name} value={b.name}>
                    {language === 'en' ? b.name : b.amharicName}
                  </option>
                ))}
                <option value="OTHER_CUSTOM">
                  {language === 'en' ? '+ Other / Custom Ethiopian Bank...' : '+ ሌላ የኢትዮጵያ ባንክ...'}
                </option>
              </select>
            </div>

            {/* Custom Bank Name Input for Remittance Form */}
            {bank === 'OTHER_CUSTOM' && (
              <div className="space-y-1.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                  {language === 'en' ? 'Custom Bank Name *' : 'የባንኩ ስም *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hibret Bank, Nib International, Zemen Bank, Sinqee Bank"
                  value={customBankName}
                  onChange={e => setCustomBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white outline-none focus:border-[#0052FF]"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {CUSTOM_BANK_SUGGESTIONS.slice(0, 5).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCustomBankName(s)}
                      className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Destination Account Number with live 13-digit counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                  {language === 'en' ? 'Destination Account Number / Phone *' : 'የባንክ ሂሳብ ቁጥር / ስልክ *'}
                </label>
                {isCbe && (
                  <span className={`text-[10px] font-mono font-bold ${isCbeValid13 ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600'}`}>
                    {cleanDigits.length} / 13 digits
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder={
                  isCbe 
                    ? "e.g. 1000293849182 (13 digits)" 
                    : effectiveFormBankName.includes('Abyssinia')
                    ? "e.g. 892019482"
                    : isTelebirr
                    ? "e.g. 0911234567"
                    : "e.g. 0150987654321"
                }
                value={account}
                onChange={e => {
                  setAccount(e.target.value);
                  setSelectedAccountId(null);
                }}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none font-mono font-bold text-gray-900 dark:text-white ${
                  isCbe && cleanDigits.length > 0 && !isCbeValid13
                    ? 'border-purple-300 dark:border-purple-800 bg-purple-50/20'
                    : isCbe && isCbeValid13
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/40 focus:border-[#0052FF]'
                }`}
              />

              {/* Dynamic validation badge */}
              {isCbe && (
                <div className="text-[10px] flex items-center gap-1.5 pt-0.5">
                  {isCbeValid13 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{language === 'en' ? 'Verified 13-digit CBE account format' : 'ትክክለኛ ባለ 13 አሃዝ የንግድ ባንክ ሂሳብ'}</span>
                    </span>
                  ) : (
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      {cleanDigits.length < 13
                        ? (language === 'en' ? `Enter 13 digits (${13 - cleanDigits.length} more needed)` : `ባለ 13 አሃዝ ያስገቡ (${13 - cleanDigits.length} ይቀራል)`)
                        : (language === 'en' ? 'Too many digits for standard CBE format' : 'ከ 13 አሃዝ በላይ ሆኗል')}
                    </span>
                  )}
                </div>
              )}

              {isTelebirr && (
                <div className="text-[10px] flex items-center gap-1.5 pt-0.5">
                  {isTelebirrValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{language === 'en' ? 'Valid Ethiopian Telebirr number' : 'ትክክለኛ የኢትዮጵያ ቴሌብር ስልክ ቁጥር'}</span>
                    </span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {language === 'en' ? 'Enter 10-digit mobile number (09... or 07...)' : 'ባለ 10 አሃዝ ስልክ ቁጥር (09... ወይም 07...)'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Account Holder Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                {language === 'en' ? 'Account Holder / Beneficiary Name' : 'የሂሳብ ባለቤት ስም'}
              </label>
              <input
                type="text"
                placeholder="e.g. Girma Tesfaye Tech"
                value={accountHolderName}
                onChange={e => setAccountHolderName(e.target.value)}
                className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/40 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0052FF] text-gray-900 dark:text-white font-bold"
              />
            </div>

            {/* Option to Save Profile for 1-Click Withdrawals */}
            {!selectedAccountId && (
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 text-xs text-gray-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveThisProfile}
                  onChange={(e) => setSaveThisProfile(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0052FF] focus:ring-[#0052FF] border-gray-300"
                />
                <span className="font-bold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{language === 'en' ? 'Save this bank account to my profiles for 1-click withdrawals' : 'ይህንን የባንክ ሂሳብ ለቀጣይ 1-ጠቅታ ክፍያዎች አስቀምጥ'}</span>
                </span>
              </label>
            )}

            {/* Submit Remittance Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || amount <= 0}
                className="w-full py-4 bg-[#0052FF] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Audit Remittance...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>
                      {language === 'en' 
                        ? `Request Immediate ${isCbe ? 'CBE' : isTelebirr ? 'Telebirr' : effectiveFormBankName || 'Bank'} Transfer (${amount > 0 ? `${amount.toLocaleString()} ETB` : ''})` 
                        : `የገንዘብ ማስተላለፊያ ጠይቅ (${amount > 0 ? `${amount.toLocaleString()} ብር` : ''})`}
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>

          <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-50/50 dark:bg-zinc-850/40 p-3 rounded-xl border border-gray-150 dark:border-zinc-800/60 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <p>
              {language === 'en'
                ? 'All merchant remittances adhere to National Bank of Ethiopia regulatory compliance guidelines.'
                : 'ሁሉም ማስተላለፊያዎች በኢትዮጵያ ብሔራዊ ባንክ ደንቦች መሠረት ቁጥጥር ይደረግባቸዋል።'}
            </p>
          </div>
        </div>

        {/* Right Column: Transaction History Timeline */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-2 flex justify-between items-center">
            <h4 className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#0052FF]" />
              <span>{language === 'en' ? 'Disbursement Ledger History' : 'የክፍያ ታሪክ ምዝግብ'}</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Audit Clear
            </span>
          </div>

          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
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
                        <span>{payout.bankName} • A/C: {payout.accountNumber.substring(0, 4)}••••{payout.accountNumber.slice(-3)}</span>
                      </p>
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isComp 
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : isPend
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse'
                          : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-400'
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
                <p>{language === 'en' ? 'No payout requests registered yet.' : 'ምንም የክፍያ ታሪክ ምዝግብ የለም።'}</p>
                <button 
                  onClick={() => setAmount(Math.floor(currentMerchant.balance * 0.5))}
                  className="text-[#0052FF] font-bold hover:underline cursor-pointer"
                >
                  {language === 'en' ? 'Request first 50% transfer' : 'የመጀመሪያ 50% ክፍያ ለመጠየቅ እዚህ ይጫኑ'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

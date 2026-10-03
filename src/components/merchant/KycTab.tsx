import React, { useState } from 'react';
import { Merchant } from '../../types';
import { 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  UploadCloud, 
  CheckCircle,
  Building,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface KycTabProps {
  currentMerchant: Merchant;
  onUpdateMerchantKyc: (merchantId: string, status: 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'APPROVED', docName?: string) => void;
  language: 'en' | 'am';
}

export default function KycTab({
  currentMerchant,
  onUpdateMerchantKyc,
  language
}: KycTabProps) {
  const [tin, setTin] = useState('');
  const [businessType, setBusinessType] = useState('Sole Proprietorship');
  const [docName, setDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const kycStatus = currentMerchant.kycStatus;
  const isApproved = kycStatus === 'APPROVED';
  const isPending = kycStatus === 'PENDING_VERIFICATION';
  const isNotSub = kycStatus === 'NOT_SUBMITTED';

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tin.trim() || !docName.trim()) {
      alert(language === 'en' ? 'Provide a valid TIN registry number and mock uploaded trade document.' : 'እባክዎን ትክክለኛ የTIN ምዝገባ ቁጥር እና የንግድ ሰነድ ያስገቡ።');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      onUpdateMerchantKyc(currentMerchant.id, 'PENDING_VERIFICATION', docName);
      setIsUploading(false);
      alert(
        language === 'en' 
          ? 'Corporate KYC compliance documents successfully dispatched to legal auditors!' 
          : 'የድርጅትዎ የKYC ማረጋገጫ ሰነዶች ለህግ ኦዲተሮች በተሳካ ሁኔታ ተልከዋል!'
      );
    }, 1500);
  };

  const handleMockUploadFile = (name: string) => {
    setDocName(name);
  };

  const tradeLicensesList = [
    'Trade_License_2026_Certified.pdf',
    'Ethiopia_TIN_Registration_Active.pdf',
    'Addis_Ababa_Trade_Bureau_Certificate.pdf'
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Upper Progress tracker cards */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
            {language === 'en' ? 'Seller Compliance & Corporate Registry' : 'የነጋዴ ማንነት እና የህግ ማረጋገጫ'}
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'en' 
              ? 'Merchant verification is mandatory under National Bank of Ethiopia fintech security rules.' 
              : 'የነጋዴዎች የህግ ማረጋገጫ በኢትዮጵያ ብሔራዊ ባንክ ደንቦች መሰረት ግዴታ ነው።'}
          </p>
        </div>

        {/* Milestone Steps chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          
          <div className={`p-4 rounded-xl border flex gap-3 items-start relative ${
            isApproved || isPending 
              ? 'bg-emerald-50/10 border-emerald-100/60 dark:border-emerald-950/40' 
              : 'bg-blue-50/10 border-blue-100/60'
          }`}>
            <span className="w-6 h-6 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-gray-900 dark:text-white">{language === 'en' ? 'Establish Profile' : 'የመለያ ምዝገባ'}</h5>
              <p className="text-[10px] text-gray-400">{language === 'en' ? 'Store details configured successfully.' : 'የሱቅ መረጃዎች በተሳካ ሁኔታ ተመዝግበዋል።'}</p>
            </div>
            <span className="absolute top-4 right-4 text-emerald-600 text-xs font-bold">✓</span>
          </div>

          <div className={`p-4 rounded-xl border flex gap-3 items-start relative ${
            isApproved 
              ? 'bg-emerald-50/10 border-emerald-100/60 dark:border-emerald-950/40' 
              : isPending
                ? 'bg-amber-50/20 border-amber-200 dark:border-amber-950/40 animate-pulse'
                : 'bg-gray-50/50 border-gray-150 dark:bg-zinc-850/10 dark:border-zinc-800/40'
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isApproved || isPending ? 'bg-[#0052FF] text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400'
            }`}>2</span>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-gray-900 dark:text-white">{language === 'en' ? 'License Verification' : 'የንግድ ፈቃድ ማረጋገጫ'}</h5>
              <p className="text-[10px] text-gray-400">
                {isApproved 
                  ? (language === 'en' ? 'Legally certified.' : 'የጸደቀ ንግድ።') 
                  : isPending 
                    ? (language === 'en' ? 'Under compliance audit.' : 'ምርመራ ላይ ያለ።')
                    : (language === 'en' ? 'Awaiting TIN & License.' : 'TIN እና ፈቃድ ይጠበቃል።')}
              </p>
            </div>
            {isApproved && <span className="absolute top-4 right-4 text-emerald-600 text-xs font-bold">✓</span>}
            {isPending && <span className="absolute top-4 right-4 text-amber-600 text-xs font-black">⚙</span>}
          </div>

          <div className={`p-4 rounded-xl border flex gap-3 items-start relative ${
            isApproved 
              ? 'bg-emerald-50/10 border-emerald-100/60 dark:border-emerald-950/40' 
              : 'bg-gray-50/50 border-gray-150 dark:bg-zinc-850/10 dark:border-zinc-800/40'
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isApproved ? 'bg-[#0052FF] text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400'
            }`}>3</span>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-gray-900 dark:text-white">{language === 'en' ? 'Live Verification' : 'ባለሙሉ መብት ማረጋገጫ'}</h5>
              <p className="text-[10px] text-gray-400">
                {isApproved 
                  ? (language === 'en' ? 'Approved merchant status.' : 'ንቁ የህግ ባለቤትነት የተረጋገጠ።') 
                  : (language === 'en' ? 'Draft restrictions active.' : 'ረቂቅ ገደቦች ይተገበራሉ።')}
              </p>
            </div>
            {isApproved && <span className="absolute top-4 right-4 text-emerald-600 text-xs font-bold">✓</span>}
          </div>

        </div>
      </div>

      {/* Main Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form or Approved visual state */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xs">
          
          {isApproved ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h5 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
                  {language === 'en' ? 'Certified Compliance Secured!' : 'ማንነትዎ በህግ ተረጋግጧል!'}
                </h5>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  {language === 'en'
                    ? 'Awassa Federal Trade Bureau has certified AW-TIN-829384. Your store is authorized for unrestricted payouts and premium storefront exposure.'
                    : 'የፌደራል ንግድ ቢሮ የድርጅትዎን መረጃ አረጋግጧል። ሱቅዎ ያለምንም ገደብ ገንዘብ ማውጣት እና ሙሉ አገልግሎት መጠቀም ይችላል።'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-850/20 p-4 rounded-xl border border-gray-150 dark:border-zinc-800 max-w-sm mx-auto text-left space-y-1 text-xs">
                <p className="text-gray-450 text-[10px] uppercase font-bold tracking-wider">Active Certificate Document:</p>
                <p className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#C5A059]" />
                  {currentMerchant.kycDocument || 'Corporate_License_Federal_Audit.pdf'}
                </p>
              </div>
            </div>
          ) : isPending ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto text-amber-600 animate-pulse">
                <RefreshCw className="w-10 h-10 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h5 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
                  {language === 'en' ? 'Auditing compliance files...' : 'ሰነዶች መገምገም ላይ ናቸው...'}
                </h5>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  {language === 'en'
                    ? 'Legal experts are cross-referencing your submitted TIN file with the National Ministry of Revenues database. Safe processing takes up to 4 hours.'
                    : 'የህግ ባለሙያዎች ያስገቡትን የTIN ሰነድ ከገቢዎች ሚኒስቴር ዳታቤዝ ጋር እያነጻጸሩት ነው። እስከ 4 ሰዓት ሊወስድ ይችላል።'}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-850/20 p-4 rounded-xl border border-gray-150 dark:border-zinc-800 max-w-sm mx-auto text-left space-y-1 text-xs">
                <p className="text-gray-450 text-[10px] uppercase font-bold tracking-wider">Submitted Document Under Audit:</p>
                <p className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0052FF]" />
                  {currentMerchant.kycDocument || 'Submitted_Trade_License.pdf'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-2">
                <h5 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#0052FF]" />
                  {language === 'en' ? 'Compliance Dispatch Panel' : 'ሰነዶችን ለመላክ መሙያ ቅፅ'}
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    {language === 'en' ? 'Registry TIN Code *' : 'የTIN መለያ ቁጥር *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0039281938"
                    value={tin}
                    onChange={e => setTin(e.target.value)}
                    className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-black font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    {language === 'en' ? 'Business Registration Type' : 'የድርጅት አይነት'}
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full border border-gray-250 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-xl px-3 py-2.5 text-xs text-gray-950 dark:text-white focus:outline-none focus:border-black font-semibold"
                  >
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Private Limited Company (PLC)">Private Limited Company (PLC)</option>
                    <option value="Artisan Cooperative">Artisan Cooperative</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone mockup */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">
                  {language === 'en' ? 'Upload Business License (PDF / Scanned Image)' : 'የንግድ ፈቃድ ሰነድ ይጫኑ (PDF / ምስል)'}
                </span>
                
                {docName ? (
                  <div className="border border-dashed border-[#0052FF] rounded-xl p-6 bg-blue-50/10 text-center space-y-2">
                    <p className="text-xs font-bold text-[#0052FF] flex items-center justify-center gap-1.5">
                      <FileText className="w-5 h-5" />
                      {docName}
                    </p>
                    <button 
                      type="button" 
                      onClick={() => setDocName('')}
                      className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Remove and Select other
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-8 text-center bg-gray-55/20 dark:bg-zinc-850/5 space-y-2.5">
                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">Drag & drop scanned license, or select presets below</p>
                      <p className="text-[10px] text-gray-400">Accepted formats: PDF, JPEG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Or Click Preset File for immediate submission:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {tradeLicensesList.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleMockUploadFile(name)}
                      className={`p-2.5 rounded-lg border text-[10px] font-bold text-left transition-all truncate hover:bg-gray-50 dark:hover:bg-zinc-850 cursor-pointer ${
                        docName === name 
                          ? 'border-[#0052FF] bg-blue-50/20 text-[#0052FF]' 
                          : 'border-gray-200 dark:border-zinc-800/80'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading || !tin.trim() || !docName.trim()}
                  className="w-full py-3.5 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading to secure registry files...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'en' ? 'Submit Credentials to Federal Audit' : 'ሰነዶችን ለምርመራ ላክ'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Right Column: Regulations check list */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-2">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#C5A059]" />
              {language === 'en' ? 'Legal Audit checklist' : 'የኦዲት መስፈርቶች መመሪያ'}
            </h4>
          </div>
          
          <ul className="space-y-3.5 text-xs text-gray-650 dark:text-zinc-300 leading-relaxed font-semibold">
            <li className="flex gap-2.5 items-start">
              <span className="text-emerald-500 text-xs mt-0.5">✓</span>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Registry Validation' : 'TIN ምዝገባ ማረጋገጫ'}</p>
                <p className="text-[10.5px] text-gray-400 font-medium">TIN code sequence must strictly contain 10 numeric indexes.</p>
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-emerald-500 text-xs mt-0.5">✓</span>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Document Certification' : 'የንግድ ሰነድ ህጋዊነት'}</p>
                <p className="text-[10.5px] text-gray-400 font-medium"> Scanned trade license must have official state seals visible.</p>
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-emerald-500 text-xs mt-0.5">✓</span>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Escrow Limitations' : 'የገንዘብ ገደብ ማስጠንቀቂያ'}</p>
                <p className="text-[10.5px] text-gray-400 font-medium">Unverified merchants are capped at 5,000 ETB maximum daily payouts.</p>
              </div>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}

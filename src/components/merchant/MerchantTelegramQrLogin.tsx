import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  Camera, 
  ShieldCheck, 
  Zap,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { Merchant } from '../../types';

interface MerchantTelegramQrLoginProps {
  merchants: Merchant[];
  onSuccessLogin: (merchant: Merchant) => void;
  language: 'en' | 'am';
  addAuditLog?: (actor: string, action: string, details: string, severity?: 'INFO' | 'WARNING' | 'CRITICAL') => void;
}

export const MerchantTelegramQrLogin: React.FC<MerchantTelegramQrLoginProps> = ({
  merchants,
  onSuccessLogin,
  language,
  addAuditLog
}) => {
  const isEn = language === 'en';

  // Session Token State
  const [sessionToken, setSessionToken] = useState(() => 
    `kasma_tg_auth_${Math.random().toString(36).substring(2, 10)}`
  );
  const [timeLeft, setTimeLeft] = useState(180); // 3-minute expiration timer
  const [authStatus, setAuthStatus] = useState<'WAITING' | 'VERIFYING' | 'SUCCESS' | 'EXPIRED' | 'ERROR'>('WAITING');
  const [authError, setAuthError] = useState<string>('');
  const [authorizedMerchant, setAuthorizedMerchant] = useState<Merchant | null>(null);
  
  // Interactive Controls
  const [copiedLink, setCopiedLink] = useState(false);
  const [scanMethod, setScanMethod] = useState<'QR_CODE' | 'CAMERA_VIEWFINDER' | 'SIMULATOR'>('QR_CODE');
  const [selectedDemoMerchantId, setSelectedDemoMerchantId] = useState<string>(
    merchants.find(m => m.status === 'ACTIVE')?.id || merchants[0]?.id || ''
  );

  // Camera simulator viewfinder state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraScanning, setCameraScanning] = useState(false);

  // Expiration Timer Effect
  useEffect(() => {
    if (authStatus === 'SUCCESS' || authStatus === 'VERIFYING') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setAuthStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authStatus]);

  // Generate new QR token
  const handleRegenerateToken = () => {
    const newToken = `kasma_tg_auth_${Math.random().toString(36).substring(2, 10)}`;
    setSessionToken(newToken);
    setTimeLeft(180);
    setAuthStatus('WAITING');
    setAuthError('');
    setAuthorizedMerchant(null);
  };

  // Telegram Bot Deep Link URL
  const telegramBotDeepLink = `https://t.me/KasmaShopBot?start=${sessionToken}`;

  // Copy Deep Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(telegramBotDeepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Perform Merchant Authorization from a given Merchant record
  const executeTelegramAuth = (targetMerchant: Merchant) => {
    setAuthStatus('VERIFYING');
    setAuthError('');

    setTimeout(() => {
      // Validate account status
      if (targetMerchant.status === 'PENDING_APPROVAL') {
        setAuthStatus('ERROR');
        setAuthError(
          isEn 
            ? `ACCOUNT PENDING APPROVAL: ${targetMerchant.storeName} is awaiting admin verification.` 
            : `መለያዎ ፍቃድ እየጠበቀ ነው፡ ${targetMerchant.storeName} በቅርቡ ይረጋገጣል።`
        );
        return;
      }

      if (targetMerchant.status === 'SUSPENDED') {
        setAuthStatus('ERROR');
        setAuthError(
          isEn 
            ? `ACCOUNT SUSPENDED: ${targetMerchant.storeName} has been suspended.` 
            : `መለያዎ ታግዷል፡ ${targetMerchant.storeName} ታግዷል።`
        );
        return;
      }

      // Success!
      setAuthorizedMerchant(targetMerchant);
      setAuthStatus('SUCCESS');

      if (addAuditLog) {
        addAuditLog(
          targetMerchant.storeName,
          'Telegram QR Login',
          `Merchant authenticated via Telegram QR Code scan (${targetMerchant.telegramUsername || targetMerchant.email})`,
          'INFO'
        );
      }

      // Auto login after brief success banner
      setTimeout(() => {
        onSuccessLogin(targetMerchant);
      }, 1200);

    }, 1500);
  };

  // Handle Camera Viewfinder Scan Simulation
  const handleSimulateCameraScan = () => {
    setIsCameraActive(true);
    setCameraScanning(true);

    setTimeout(() => {
      setCameraScanning(false);
      setIsCameraActive(false);

      const demoMerchant = merchants.find(m => m.id === selectedDemoMerchantId) || merchants[0];
      if (demoMerchant) {
        executeTelegramAuth(demoMerchant);
      }
    }, 2000);
  };

  const activeDemoMerchant = merchants.find(m => m.id === selectedDemoMerchantId);

  return (
    <div className="space-y-4 text-left">
      
      {/* Sub-Header & Selector Tabs */}
      <div className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-150 dark:border-sky-900/40 p-3 rounded-2xl flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
          <div className="w-7 h-7 rounded-xl bg-[#229ED9] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Send className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <p className="font-extrabold text-[12px] leading-snug">
              {isEn ? 'Telegram QR Auth' : 'በቴሌግራም QR ኮድ ግባ'}
            </p>
            <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
              {isEn ? 'Instant passwordless sign-in for verified stores' : 'ያለ ማለፊያ ቃል በቴሌግራም መለያዎ በደቂቃ ይግቡ'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>{isEn ? '2FA Secure' : '2FA ጥበቃ'}</span>
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setScanMethod('QR_CODE')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            scanMethod === 'QR_CODE'
              ? 'bg-white dark:bg-zinc-950 text-[#0052FF] shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{isEn ? 'Display QR' : 'QR አሳይ'}</span>
        </button>

        <button
          type="button"
          onClick={() => setScanMethod('CAMERA_VIEWFINDER')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            scanMethod === 'CAMERA_VIEWFINDER'
              ? 'bg-white dark:bg-zinc-950 text-[#0052FF] shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isEn ? 'Scan Camera' : 'ካሜራ ስካን'}</span>
        </button>

        <button
          type="button"
          onClick={() => setScanMethod('SIMULATOR')}
          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            scanMethod === 'SIMULATOR'
              ? 'bg-white dark:bg-zinc-950 text-[#0052FF] shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEn ? 'Quick Demo' : 'ፈጣን ሞካሪ'}</span>
        </button>
      </div>

      {/* MODE 1: DISPLAY QR CODE */}
      {scanMethod === 'QR_CODE' && (
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-3.5 shadow-2xs">
          
          {authStatus === 'SUCCESS' ? (
            <div className="py-6 flex flex-col items-center space-y-2 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h4 className="font-black text-gray-900 dark:text-white text-base">
                {isEn ? 'Telegram Auth Confirmed!' : 'የቴሌግራም ፍቃድ ተረጋገጠ!'}
              </h4>
              <p className="text-xs text-gray-500 font-semibold">
                {authorizedMerchant?.storeName} ({authorizedMerchant?.ownerName})
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0052FF] pt-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isEn ? 'Opening Merchant Portal...' : 'ወደ ነጋዴ ዳሽቦርድ በመግባት ላይ...'}</span>
              </div>
            </div>
          ) : authStatus === 'VERIFYING' ? (
            <div className="py-8 flex flex-col items-center space-y-3">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-[#229ED9]/20 animate-ping" />
                <div className="w-14 h-14 rounded-full border-4 border-[#229ED9] border-t-transparent animate-spin flex items-center justify-center">
                  <Send className="w-6 h-6 text-[#229ED9] fill-current" />
                </div>
              </div>
              <p className="font-extrabold text-xs text-gray-900 dark:text-white">
                {isEn ? 'Verifying Telegram Cryptographic Signature...' : 'የቴሌግራም ዲጂታል ፊርማ በማረጋገጥ ላይ...'}
              </p>
              <p className="text-[11px] text-gray-500">
                {isEn ? 'Authenticating store credentials securely' : 'የመደብሩን መለያ በጥንቃቄ በማረጋገጥ ላይ'}
              </p>
            </div>
          ) : authStatus === 'EXPIRED' ? (
            <div className="py-6 flex flex-col items-center space-y-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="font-bold text-xs">{isEn ? 'QR Code Session Expired' : 'የQR ኮድ ጊዜው አልፏል'}</p>
              <button
                type="button"
                onClick={handleRegenerateToken}
                className="mt-2 px-4 py-2 bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isEn ? 'Generate New QR Code' : 'አዲስ QR ኮድ አውጣ'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Interactive QR Display Card */}
              <div className="relative p-3 bg-white rounded-2xl border-2 border-gray-150 dark:border-zinc-800 shadow-md group">
                <QRCodeSVG
                  value={telegramBotDeepLink}
                  size={160}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
                
                {/* Laser scan line overlay effect */}
                <div className="absolute inset-2 border-2 border-[#229ED9]/40 rounded-xl pointer-events-none overflow-hidden">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#229ED9] to-transparent shadow-[0_0_8px_#229ED9] animate-pulse" />
                </div>
              </div>

              {/* Countdown Timer Badge */}
              <div className="flex items-center justify-between w-full text-xs font-mono font-bold px-2 text-gray-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{isEn ? 'Live QR Session:' : 'የQR ጊዜ:'}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-lg border text-[11px] ${
                  timeLeft < 30 
                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-900' 
                    : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700'
                }`}>
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 dark:bg-zinc-900/80 p-3 rounded-xl text-left text-[11px] space-y-1.5 border border-gray-150 dark:border-zinc-800 w-full">
                <p className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>{isEn ? 'How to Sign In:' : 'እንዴት መግባት እንደሚቻል:'}</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-zinc-300 font-medium leading-relaxed pl-1">
                  <li>{isEn ? 'Open Telegram app on your phone' : 'በስልክዎ ላይ የቴሌግራም አፕሊኬሽን ይክፈቱ'}</li>
                  <li>{isEn ? 'Point phone camera or Telegram QR scanner at this code' : 'ካሜራዎን ወደዚህ QR ኮድ ያላምዱ'}</li>
                  <li>{isEn ? 'Tap "Confirm Merchant Login" inside @KasmaShopBot' : 'በ @KasmaShopBot ውስጥ "Confirm Merchant Login" ይጫኑ'}</li>
                </ol>
              </div>

              {/* Direct Deep Link & Copy Buttons */}
              <div className="flex items-center gap-2 w-full pt-1">
                <a
                  href={telegramBotDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-[#229ED9] hover:bg-[#1d82b3] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  <span>{isEn ? 'Open Telegram App' : 'ቴሌግራም አፕ ክፈት'}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-1 border border-gray-200 dark:border-zinc-700 cursor-pointer transition-all"
                  title={isEn ? 'Copy Auth Link' : 'ሊንክ ቅዳ'}
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}

        </div>
      )}

      {/* MODE 2: CAMERA VIEWFINDER SCANNER */}
      {scanMethod === 'CAMERA_VIEWFINDER' && (
        <div className="bg-zinc-950 rounded-2xl p-4 text-center space-y-3 text-white border border-zinc-800 shadow-md">
          <div className="relative w-full h-48 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
            
            {/* Viewfinder Reticle Overlay */}
            <div className="absolute inset-6 border-2 border-dashed border-[#0052FF] rounded-xl flex items-center justify-center pointer-events-none">
              <div className="w-full h-0.5 bg-[#0052FF] shadow-[0_0_10px_#0052FF] animate-bounce" />
            </div>

            {cameraScanning ? (
              <div className="flex flex-col items-center gap-2 text-xs font-bold text-blue-400 z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-[#0052FF]" />
                <span>{isEn ? 'Scanning Telegram Merchant QR...' : 'የቴሌግራም QR ኮድ በማንበብ ላይ...'}</span>
              </div>
            ) : isCameraActive ? (
              <div className="flex flex-col items-center gap-2 text-xs font-bold text-emerald-400 z-10">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span>{isEn ? 'QR Code Detected!' : 'QR ኮድ ተገኝቷል!'}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-xs text-zinc-400 z-10 p-4">
                <Camera className="w-8 h-8 text-zinc-500" />
                <p className="font-semibold">
                  {isEn ? 'Position Telegram Merchant QR code within frame' : 'የቴሌግራም ነጋዴ QR ኮድ በካሜራው ፍሬም ውስጥ ያስገቡ'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-left space-y-1">
              <label className="block text-[10px] font-black uppercase text-zinc-400">
                {isEn ? 'Select Merchant to Simulate Scan:' : 'የሚቃኝ ነጋዴ ይምረጡ:'}
              </label>
              <select
                value={selectedDemoMerchantId}
                onChange={(e) => setSelectedDemoMerchantId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#0052FF]"
              >
                {merchants.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.storeName} ({m.telegramUsername || m.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSimulateCameraScan}
              disabled={cameraScanning}
              className="w-full py-2.5 bg-[#0052FF] hover:bg-blue-600 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isEn ? 'Trigger Camera QR Scan' : 'በካሜራ QR ስካን አድርግ'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: QUICK DEMO SIMULATOR */}
      {scanMethod === 'SIMULATOR' && (
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 text-xs">
          
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
            <p className="text-[11px] font-semibold leading-relaxed">
              {isEn 
                ? 'Select a registered merchant store below to simulate instant 1-click authorization via Telegram.' 
                : 'በቴሌግራም አውቶማቲክ መግቢያን ለመሞከር ከታች ካሉት ነጋዴዎች አንዱን ይምረጡ።'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {isEn ? 'Select Merchant Account:' : 'የነጋዴ መለያ ይምረጡ:'}
            </label>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {merchants.map(m => {
                const isSelected = m.id === selectedDemoMerchantId;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedDemoMerchantId(m.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#0052FF] bg-blue-50/60 dark:bg-blue-950/40 text-gray-900 dark:text-white shadow-2xs font-extrabold'
                        : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{m.storeName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {m.telegramUsername || m.email} • Owner: {m.ownerName}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      m.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeDemoMerchant) {
                executeTelegramAuth(activeDemoMerchant);
              }
            }}
            disabled={authStatus === 'VERIFYING'}
            className="w-full py-3 bg-[#229ED9] hover:bg-[#1d82b3] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>
              {isEn 
                ? `Simulate Telegram Auth as ${activeDemoMerchant?.storeName || 'Merchant'}` 
                : `በ ${activeDemoMerchant?.storeName || 'ነጋዴ'} ስም በቴሌግራም ግባ`}
            </span>
          </button>

        </div>
      )}

      {/* Error Message Display */}
      {authError && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span className="font-bold">{authError}</span>
        </div>
      )}

    </div>
  );
};
export default MerchantTelegramQrLogin;

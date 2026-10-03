import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Bot, 
  QrCode, 
  Copy, 
  RefreshCw, 
  Bell, 
  Package, 
  Truck, 
  Tag, 
  Sparkles, 
  ExternalLink, 
  Smartphone, 
  Check, 
  AlertCircle, 
  Trash2, 
  Zap,
  SlidersHorizontal,
  MessageSquare,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { TelegramUserSettings, TelegramMessageLog } from '../types';
import { 
  getTelegramSettings, 
  saveTelegramSettings, 
  generateNewPairingCode, 
  getTelegramLogs, 
  sendTelegramTestAlert 
} from '../utils/telegramBot';
import { 
  isTelegramWebApp, 
  getTelegramUser, 
  triggerHaptic, 
  showTelegramMainButton, 
  hideTelegramMainButton, 
  showTelegramAlert, 
  showTelegramPopup, 
  sendTelegramData 
} from '../utils/telegramWebApp';

export interface TelegramIntegrationModuleProps {
  language: 'en' | 'am';
  showToast?: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  onClose?: () => void;
  compactMode?: boolean;
}

export const TelegramIntegrationModule: React.FC<TelegramIntegrationModuleProps> = ({
  language,
  showToast,
  compactMode = false
}) => {
  const isEn = language === 'en';
  const [settings, setSettings] = useState<TelegramUserSettings>(getTelegramSettings);
  const [logs, setLogs] = useState<TelegramMessageLog[]>(getTelegramLogs);
  const [isCopied, setIsCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeLogTab, setActiveLogTab] = useState<'ALL' | 'ORDERS' | 'SHIPPING'>('ALL');

  useEffect(() => {
    saveTelegramSettings(settings);
  }, [settings]);

  const refreshLogs = () => {
    setLogs(getTelegramLogs());
  };

  const handleToggle = (key: keyof TelegramUserSettings) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      saveTelegramSettings(updated);
      return updated;
    });
    if (showToast) {
      showToast(isEn ? 'Telegram preferences updated' : 'የቴሌግራም ምርጫዎች ተዘምነዋል', 'success');
    }
  };

  const handleRegeneratePairingCode = () => {
    const newCode = generateNewPairingCode();
    setSettings(prev => ({ ...prev, pairingCode: newCode }));
    if (showToast) {
      showToast(isEn ? `New Bot Pairing PIN generated: ${newCode}` : `አዲስ የቦት ማገናኛ ፒን ተፈጥሯል: ${newCode}`, 'info');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`/start ${settings.pairingCode}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    if (showToast) {
      showToast(isEn ? 'Bot pair command copied to clipboard!' : 'የቦት ማገናኛ ትእዛዝ ተቀድቷል!', 'success');
    }
  };

  const handleSendTest = async (type: 'ORDER' | 'SHIPPING' | 'PRICE') => {
    setIsTesting(true);
    await sendTelegramTestAlert(type, language);
    refreshLogs();
    setIsTesting(false);
    if (showToast) {
      showToast(
        isEn ? `Test ${type} Telegram alert sent!` : `የሙከራ ${type} ቴሌግራም መልዕክት ተልኳል!`, 
        'success'
      );
    }
  };

  const handleClearLogs = () => {
    localStorage.removeItem('kasma_telegram_logs');
    setLogs([]);
    if (showToast) {
      showToast(isEn ? 'Telegram log history cleared' : 'የቴሌግራም ታሪክ ተሰርዟል', 'info');
    }
  };

  const filteredLogs = logs.filter(l => {
    if (activeLogTab === 'ORDERS') return l.type === 'ORDER_CONFIRMATION';
    if (activeLogTab === 'SHIPPING') return l.type === 'SHIPPING_UPDATE';
    return true;
  });

  return (
    <div className="w-full space-y-6 text-gray-900 dark:text-zinc-100 transition-colors">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        {/* Background decorative bot icons */}
        <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
          <Send className="w-48 h-48 text-white transform -rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/30 text-white shadow-xs">
              <Bot className="w-4 h-4 text-sky-200" />
              <span>{isEn ? 'Kasma Automated Messenger Integration' : 'የካስማ አውቶሜትድ ቴሌግራም ማገናኛ'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {isEn ? 'Real-Time Telegram Order & Shipping Alerts' : 'የቀጥታ ቴሌግራም የትዕዛዝ እና ትራንስፖርት መረጃዎች'}
            </h2>
            
            <p className="text-sm text-sky-100/90 font-medium leading-relaxed">
              {isEn 
                ? 'Connect your Telegram account to get instant order receipts, live courier tracking links, and price drop notifications directly in Telegram messenger.' 
                : 'የቴሌግራም መለያዎን በማገናኘት የትዕዛዝ ደረሰኞችን እና የቀጥታ ትራንስፖርት መረጃዎችን ወዲያውኑ በቴሌግራምዎ ያግኙ።'}
            </p>
          </div>

          {/* Connection Status Badge */}
          <div className="shrink-0 bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-4 text-center sm:text-right space-y-2 min-w-[200px] shadow-lg">
            <div className="text-xs uppercase tracking-wider font-bold text-sky-200">
              {isEn ? 'Bot Connection Status' : 'የቦት ግንኙነት ሁኔታ'}
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <span className={`w-3 h-3 rounded-full ${settings.isConnected ? 'bg-emerald-400 ring-4 ring-emerald-400/30' : 'bg-rose-400'}`}></span>
              <span className="font-extrabold text-base tracking-tight text-white">
                {settings.isConnected 
                  ? (isEn ? 'CONNECTED' : 'ተያይዟል') 
                  : (isEn ? 'NOT CONNECTED' : 'ልተያያዘም')}
              </span>
            </div>
            <div className="text-xs text-sky-100 font-mono bg-black/20 px-2.5 py-1 rounded-lg border border-white/10 inline-block">
              {settings.telegramUsername || `@KasmaShopBot`}
            </div>
          </div>
        </div>
      </div>

      {/* BOT PAIRING & SETUP CARD */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100">
                {isEn ? 'Bot Pairing & Telegram Account' : 'የቦት ማገናኛ እና ቴሌግራም መለያ'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400">
                {isEn ? 'Pair with official @KasmaShopBot in 1-Click' : 'ከኦፊሴላዊው @KasmaShopBot ጋር በአንድ ጠቅታ ይገናኙ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggle('isConnected')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                settings.isConnected 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100' 
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{settings.isConnected ? (isEn ? 'Bot Active' : 'ቦት ክፍት ነው') : (isEn ? 'Enable Bot' : 'ቦት ክፈት')}</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Pairing Steps */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Quick Connect Actions */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-sky-700 dark:text-sky-400 tracking-wider">
                  {isEn ? 'Step 1: Launch Telegram Bot' : 'ደረጃ 1: ቴሌግራም ቦት ይክፈቱ'}
                </span>
                <span className="text-xs font-mono font-semibold bg-white dark:bg-zinc-800 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-md border border-sky-200 dark:border-zinc-700">
                  @KasmaShopBot
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`https://t.me/KasmaShopBot?start=bind_${settings.pairingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEn ? 'Open @KasmaShopBot in Telegram' : 'በቴሌግራም @KasmaShopBot ይክፈቱ'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <QrCode className="w-4 h-4 text-sky-500" />
                  <span>{isEn ? 'Scan QR Code' : 'QR ኮድቃኝ'}</span>
                </button>
              </div>
            </div>

            {/* Pairing Code Generator */}
            <div className="bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-600 dark:text-zinc-400">
                  {isEn ? 'Step 2: Send Pairing PIN to Bot' : 'ደረጃ 2: የማገናኛ ፒን ወደ ቦቱ ይላኩ'}
                </span>
                <button
                  onClick={handleRegeneratePairingCode}
                  className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold text-xs cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isEn ? 'New PIN' : 'አዲስ ፒን'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-lg font-black tracking-wider text-sky-600 dark:text-sky-400 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-3.5 py-2 rounded-xl text-center shadow-inner">
                  /start {settings.pairingCode}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-zinc-100 text-white dark:text-gray-900 font-bold text-xs hover:bg-black dark:hover:bg-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? (isEn ? 'Copied!' : 'ተቀድቷል!') : (isEn ? 'Copy Command' : 'ትእዛዝ ቅዳ')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Settings Inputs */}
          <div className="md:col-span-5 space-y-3 bg-gray-50/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-gray-200/80 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              {isEn ? 'Telegram Account Details' : 'የቴሌግራም መለያ መረጃዎች'}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {isEn ? 'Telegram Username / Handle' : 'የቴሌግራም ተጠቃሚ ስም'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    value={settings.telegramUsername.replace(/^@/, '')}
                    onChange={(e) => setSettings({ ...settings, telegramUsername: `@${e.target.value.trim()}` })}
                    placeholder="ethio_shopper"
                    className="w-full pl-7 pr-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {isEn ? 'Telegram Chat ID (Optional)' : 'የቴሌግራም ቻት አይዲ (አማራጭ)'}
                </label>
                <input
                  type="text"
                  value={settings.chatId}
                  onChange={(e) => setSettings({ ...settings, chatId: e.target.value.trim() })}
                  placeholder="849201948"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {isEn ? 'End-to-end encrypted bot routing' : 'የተጠበቀ የቦት ማገናኛ'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TELEGRAM WEB APP SDK LIVE DIAGNOSTICS & CONTROL PANEL */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-950 text-white shadow-lg space-y-4 border border-sky-800/60">
          <div className="flex items-center justify-between border-b border-sky-800/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#229ED9] text-white flex items-center justify-center font-bold shrink-0">
                <Send className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>{isEn ? 'Telegram Web Apps SDK v1.0 Inspector' : 'የቴሌግራም ዌብ አፕ ኤስዲኬ v1.0 መፈተሻ'}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isTelegramWebApp() ? 'bg-emerald-500 text-white' : 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                  }`}>
                    {isTelegramWebApp() ? 'LIVE TMA VIEWPORT' : 'BROWSER / SIMULATED'}
                  </span>
                </h4>
                <p className="text-[11px] text-sky-200">
                  {isEn 
                    ? 'Native Telegram WebApp runtime context, haptic engine, and native buttons' 
                    : 'የቴሌግራም አፕ የውስጥ አሰራር፣ ሃፕቲክ እና ነባሪ ቁልፎች'}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-sky-300 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800">
              window.Telegram.WebApp
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-800/40">
              <span className="text-[10px] text-sky-400 block uppercase font-sans font-bold">Client User:</span>
              <span className="font-extrabold text-white">
                {getTelegramUser() ? `${getTelegramUser()?.first_name} (@${getTelegramUser()?.username || 'no_handle'})` : 'Girma (Simulated)'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-800/40">
              <span className="text-[10px] text-sky-400 block uppercase font-sans font-bold">Platform / Ver:</span>
              <span className="font-extrabold text-white">
                {typeof window !== 'undefined' && window.Telegram?.WebApp?.platform 
                  ? `${window.Telegram.WebApp.platform} (v${window.Telegram.WebApp.version || '7.0'})` 
                  : 'Web / Desktop (v7.0)'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-800/40">
              <span className="text-[10px] text-sky-400 block uppercase font-sans font-bold">Color Theme:</span>
              <span className="font-extrabold text-white capitalize">
                {typeof window !== 'undefined' && window.Telegram?.WebApp?.colorScheme 
                  ? window.Telegram.WebApp.colorScheme 
                  : 'light (Synchronized)'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-sky-800/40 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('success');
                showTelegramAlert(isEn ? 'Telegram WebApp Native Alert: Action Confirmed!' : 'የቴሌግራም ኤስዲኬ ማሳወቂያ፡ ተግባሩ ተረጋግጧል!');
              }}
              className="px-3 py-1.5 bg-[#229ED9] hover:bg-[#1d88bb] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isEn ? 'Test Native Alert & Haptic' : 'ኤስዲኬ ሃፕቲክ ሞክር'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                showTelegramMainButton(
                  isEn ? '🛒 PROCEED TO CHECKOUT (ETB 12,500)' : '🛒 ወደ ክፍያ ሂድ (ብር 12,500)',
                  () => {
                    triggerHaptic('success');
                    showTelegramAlert(isEn ? 'MainButton Tapped inside Telegram Mini App!' : 'በቴሌግራም ሜይን በረን ተጫነ!');
                    hideTelegramMainButton();
                  }
                );
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isEn ? 'Show Telegram MainButton' : 'ቴሌግራም ሜይን በረን አሳይ'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                hideTelegramMainButton();
                triggerHaptic('light');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <span>{isEn ? 'Hide MainButton' : 'ሜይን በረን ደብቅ'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('heavy');
                sendTelegramData({ action: 'CHECKOUT_COMPLETE', orderId: 'ORD-9821', total: 12500 });
                showTelegramPopup(
                  isEn ? 'Data Sent to Telegram Bot' : 'መረጃው ወደ ቦት ተልኳል',
                  isEn ? 'Cart payload dispatched via window.Telegram.WebApp.sendData()' : 'የትዕዛዝ መረጃ በዌብአፕ ተልኳል'
                );
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? 'Send Data to Bot' : 'መረጃ ወደ ቦት ላክ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AUTOMATED NOTIFICATION TOGGLES MATRIX */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-500" />
              <span>{isEn ? 'Automated Telegram Notification Triggers' : 'አውቶሜትድ የቴሌግራም የማሳወቂያ መቆጣጠሪያዎች'}</span>
            </h3>
            <p className="text-xs text-gray-400 dark:text-zinc-400 mt-0.5">
              {isEn ? 'Select which events trigger instant notifications to your Telegram messenger' : 'የትኞቹ ክስተቶች ወደ ቴሌግራምዎ ማሳወቂያ እንዲልኩ እንደሚፈልጉ ይምረጡ'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Order Confirmations Toggle */}
          <div className="bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-sky-300 dark:hover:border-sky-800 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                <Package className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs text-gray-900 dark:text-zinc-100 block">
                  {isEn ? 'Order Confirmations & Invoices' : 'የትዕዛዝ ማረጋገጫ እና ደረሰኝ'}
                </span>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 leading-tight">
                  {isEn ? 'Instant Telegram digital receipt & item breakdown upon checkout' : 'ትዕዛዝ ሲያዙ የዲጂታል ደረሰኝ እና የእቃዎች ዝርዝር ያግኙ'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('orderConfirmations')}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                settings.orderConfirmations ? 'bg-sky-500' : 'bg-gray-300 dark:bg-zinc-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                settings.orderConfirmations ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Shipping Updates Toggle */}
          <div className="bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-sky-300 dark:hover:border-sky-800 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-800">
                <Truck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs text-gray-900 dark:text-zinc-100 block">
                  {isEn ? 'Shipping & Dispatch Status' : 'የትራንስፖርት እና ማድረሻ መረጃ'}
                </span>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 leading-tight">
                  {isEn ? 'Real-time alerts when status changes to Processing, Shipped, or Delivered' : 'እቃው ሲላክ ወይም ሲደርስ የቀጥታ ማሳወቂያ ያግኙ'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('shippingUpdates')}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                settings.shippingUpdates ? 'bg-sky-500' : 'bg-gray-300 dark:bg-zinc-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                settings.shippingUpdates ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Price Drops Toggle */}
          <div className="bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-sky-300 dark:hover:border-sky-800 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200 dark:border-amber-800">
                <Tag className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs text-gray-900 dark:text-zinc-100 block">
                  {isEn ? 'Price Drops & Restock Alerts' : 'የዋጋ ቅናሽ እና አዲስ እቃዎች'}
                </span>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 leading-tight">
                  {isEn ? 'Get notified when saved wishlist items drop in price or come back to stock' : 'በምኞት ዝርዝርዎ ላይ ያሉ እቃዎች ሲቀንሱ ማሳወቂያ ይደርስዎታል'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('priceDropAlerts')}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                settings.priceDropAlerts ? 'bg-sky-500' : 'bg-gray-300 dark:bg-zinc-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                settings.priceDropAlerts ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Exclusive Telegram Deals Toggle */}
          <div className="bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-sky-300 dark:hover:border-sky-800 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs text-gray-900 dark:text-zinc-100 block">
                  {isEn ? 'Exclusive Telegram VIP Deals' : 'ልዩ የቴሌግራም ቅናሾች'}
                </span>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 leading-tight">
                  {isEn ? 'Daily promo codes and secret discount drops delivered to Telegram' : 'የእለት ተእለት የቅናሽ ኮዶችን በቴሌግራም ያግኙ'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('telegramDeals')}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                settings.telegramDeals ? 'bg-sky-500' : 'bg-gray-300 dark:bg-zinc-700'
              }`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                settings.telegramDeals ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* TEST SUITE CONTROLS */}
        <div className="pt-3 border-t border-gray-150 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            {isEn ? 'Interactive Bot Testing Sandbox:' : 'የቴሌግራም ቦት የሙከራ ሳጥን:'}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSendTest('ORDER')}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isEn ? '⚡ Test Order Receipt' : '⚡ የትዕዛዝ ደረሰኝ ሞክር'}
            </button>

            <button
              onClick={() => handleSendTest('SHIPPING')}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isEn ? '⚡ Test Shipping Alert' : '⚡ የትራንስፖርት መረጃ ሞክር'}
            </button>

            <button
              onClick={() => handleSendTest('PRICE')}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isEn ? '⚡ Test Price Drop' : '⚡ የዋጋ ቅናሽ ሞክር'}
            </button>
          </div>
        </div>
      </div>

      {/* LIVE TELEGRAM MESSENGER LOGS & CHAT PREVIEW FEED */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100">
                {isEn ? 'Telegram Live Message Feed' : 'የቴሌግራም መልዕክት የቀጥታ ማሳያ'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400">
                {isEn ? 'Real-time preview of notifications sent to @KasmaShopBot chat' : 'ወደ @KasmaShopBot የተላኩ መልዕክቶች የቀጥታ ታሪክ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveLogTab('ALL')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLogTab === 'ALL' ? 'bg-white dark:bg-zinc-900 shadow-xs text-sky-600 dark:text-sky-400' : 'text-gray-500'
                }`}
              >
                {isEn ? 'All' : 'ሁሉም'}
              </button>
              <button
                onClick={() => setActiveLogTab('ORDERS')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLogTab === 'ORDERS' ? 'bg-white dark:bg-zinc-900 shadow-xs text-sky-600 dark:text-sky-400' : 'text-gray-500'
                }`}
              >
                {isEn ? 'Orders' : 'ትዕዛዞች'}
              </button>
              <button
                onClick={() => setActiveLogTab('SHIPPING')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLogTab === 'SHIPPING' ? 'bg-white dark:bg-zinc-900 shadow-xs text-sky-600 dark:text-sky-400' : 'text-gray-500'
                }`}
              >
                {isEn ? 'Shipping' : 'ትራንስፖርት'}
              </button>
            </div>

            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                title="Clear Logs"
                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* TELEGRAM SIMULATED CHAT UI BUBBLES */}
        <div className="bg-[#0f172a] dark:bg-[#090d16] rounded-2xl p-4 sm:p-6 border border-slate-800 max-h-[460px] overflow-y-auto space-y-4 font-sans shadow-inner">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Bot className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
              <p className="text-xs text-slate-400 font-medium">
                {isEn ? 'No Telegram messages dispatched yet.' : 'እስካሁን ምንም የቴሌግራም መልዕክት አልተላከም።'}
              </p>
              <button
                onClick={() => handleSendTest('ORDER')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-sky-600"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isEn ? 'Send First Test Notification' : 'የመጀመሪያ የሙከራ መልዕክት ላክ'}</span>
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-3 max-w-2xl mx-auto">
                {/* Bot Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0 border border-sky-400/40">
                  <Bot className="w-5 h-5" />
                </div>

                {/* Telegram Message Box */}
                <div className="flex-1 bg-slate-800/90 text-slate-100 rounded-2xl rounded-tl-xs p-4 border border-slate-700/80 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sky-400">@KasmaShopBot</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                      <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">BOT</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div 
                    className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap space-y-1 font-mono"
                    dangerouslySetInnerHTML={{ __html: log.formattedText }}
                  />

                  {/* Inline Action Buttons */}
                  {log.buttons && log.buttons.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/60 flex flex-wrap gap-2">
                      {log.buttons.map((btn, idx) => (
                        <a
                          key={idx}
                          href={btn.actionUrl || '#'}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-medium text-[11px] transition-colors flex items-center gap-1"
                        >
                          <span>{btn.label}</span>
                          <ChevronRight className="w-3 h-3 opacity-70" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR CODE POPUP MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto border border-sky-200 dark:border-sky-800">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-zinc-100">
                {isEn ? 'Scan to Connect Telegram' : 'ለማገናኘት QR ኮዱን ይቃኙ'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 mt-1">
                {isEn ? 'Point your mobile phone camera to start @KasmaShopBot instantly' : 'የስልክዎን ካሜራ ወደ QR ኮዱ በመምራት @KasmaShopBot ይክፈቱ'}
              </p>
            </div>

            {/* SVG Rendered QR Code Placeholder */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-inner max-w-[200px] mx-auto relative group">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect width="100" height="100" fill="#ffffff" />
                {/* Outer corners */}
                <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                {/* Data pattern pixels */}
                <rect x="35" y="10" width="6" height="6" fill="#0284c7" />
                <rect x="45" y="15" width="6" height="6" fill="#0f172a" />
                <rect x="55" y="10" width="6" height="6" fill="#0284c7" />
                
                <rect x="10" y="35" width="6" height="6" fill="#0f172a" />
                <rect x="20" y="45" width="6" height="6" fill="#0284c7" />
                <rect x="35" y="35" width="10" height="10" fill="#0f172a" />
                
                <rect x="70" y="35" width="8" height="8" fill="#0f172a" />
                <rect x="85" y="45" width="6" height="6" fill="#0284c7" />
                <rect x="65" y="55" width="8" height="8" fill="#0f172a" />
                
                <rect x="35" y="70" width="8" height="8" fill="#0284c7" />
                <rect x="50" y="75" width="6" height="6" fill="#0f172a" />
                <rect x="65" y="70" width="8" height="8" fill="#0284c7" />
                <rect x="80" y="80" width="10" height="10" fill="#0f172a" />
              </svg>

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md border-2 border-white">
                  <Send className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 py-1.5 px-3 rounded-xl border border-sky-200 dark:border-sky-800">
              PIN: {settings.pairingCode}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-zinc-100 text-white dark:text-gray-900 font-bold text-xs hover:bg-black dark:hover:bg-white transition-all cursor-pointer"
            >
              {isEn ? 'Close Window' : 'ዝጋ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

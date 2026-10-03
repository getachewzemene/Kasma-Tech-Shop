import React, { useState } from 'react';
import { Merchant, Order } from '../../types';
import { 
  Send, 
  Bot, 
  Bell, 
  CheckCircle2, 
  MessageSquare, 
  Smartphone, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink,
  Check,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MerchantTelegramNotificationCardProps {
  merchant: Merchant;
  orders: Order[];
  language: 'en' | 'am';
  onUpdateTelegramSettings?: (updated: { telegramUsername?: string; telegramChatId?: string; telegramNotificationsEnabled?: boolean }) => void;
}

export default function MerchantTelegramNotificationCard({
  merchant,
  orders,
  language,
  onUpdateTelegramSettings
}: MerchantTelegramNotificationCardProps) {
  const isEn = language === 'en';
  const [username, setUsername] = useState(merchant.telegramUsername || '@ethio_merchant');
  const [chatId, setChatId] = useState(merchant.telegramChatId || '849201948');
  const [enabled, setEnabled] = useState(merchant.telegramNotificationsEnabled !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedBot, setCopiedBot] = useState(false);

  // Merchant-specific order history
  const merchantOrders = orders.filter(o => 
    o.items.some(item => item.product.merchantId === merchant.id)
  );

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/merchants/${merchant.id}/telegram`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUsername: username,
          telegramChatId: chatId,
          telegramNotificationsEnabled: enabled
        })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        if (onUpdateTelegramSettings) {
          onUpdateTelegramSettings({
            telegramUsername: username,
            telegramChatId: chatId,
            telegramNotificationsEnabled: enabled
          });
        }
      }
    } catch (err) {
      console.error('Failed to save merchant Telegram settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/merchants/${merchant.id}/test-telegram`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.alert || 'Test alert dispatched successfully!');
      }
    } catch (err) {
      console.error('Failed to send test Telegram alert:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const copyBotHandle = () => {
    navigator.clipboard.writeText('@KasmaMerchantOrderBot');
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isEn ? 'Automatic Merchant Order Telegram Notifications' : 'የነጋዴ አውቶማቲክ ትዕዛዝ ቴሌግራም ማሳወቂያዎች'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-3 h-3" />
                {isEn ? 'Real-Time Integration' : 'የቀጥታ ስርጭት'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              {isEn 
                ? 'Receive instant Telegram alerts whenever a customer purchases your store’s specific products.' 
                : 'ደንበኛ የእርስዎን ምርት በገዛ ቁጥር ወዲያውኑ በቴሌግራም ማሳወቂያ ያግኙ።'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleTestNotification}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-sky-400 border border-sky-500/30 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Bot className="w-4 h-4 text-sky-400" />
            )}
            <span>{isEn ? 'Send Test Alert' : 'የሙከራ ማሳወቂያ ላክ'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-5 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              {isEn ? 'Bot Credentials & Channel' : 'የቦት መረጃ እና ቻናል'}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              {isEn ? 'Active' : 'ንቁ'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {isEn ? 'Merchant Telegram Username' : 'የነጋዴው የቴሌግራም ተጠቃሚ ስም'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-mono">@</span>
                <input
                  type="text"
                  value={username.replace(/^@/, '')}
                  onChange={(e) => setUsername(`@${e.target.value.replace(/^@/, '')}`)}
                  placeholder="girma_tech"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {isEn ? 'Telegram Chat ID / Channel ID' : 'የቴሌግራም ቻት ID'}
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="849201948"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {isEn ? 'Obtain your Chat ID by messaging @userinfobot on Telegram.' : 'ቻት ID ለማግኘት በቴሌግራም @userinfobot ን ያነጋግሩ።'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  {isEn ? 'Auto Order Notifications' : 'አውቶማቲክ የትዕዛዝ ማሳወቂያ'}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {isEn ? 'Notify upon new order containing store items' : 'የእርስዎ ምርት ሲታዘዝ ወዲያውኑ ማሳወቂያ ላክ'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${enabled ? 'bg-sky-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-medium text-xs rounded-lg transition-all flex items-center gap-2 shadow-sm"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{isEn ? 'Save Integration Settings' : 'መረጃውን አስቀምጥ'}</span>
            </button>

            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                {isEn ? 'Saved!' : 'ተቀምጧል!'}
              </span>
            )}
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Bot className="w-4 h-4 text-sky-400" />
              <span>Official Bot: <strong className="text-slate-200 font-mono">@KasmaMerchantOrderBot</strong></span>
            </div>
            <button
              onClick={copyBotHandle}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              title="Copy bot handle"
            >
              {copiedBot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Real-Time Preview & Activity Feed */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                {isEn ? 'Live Telegram Notification Payload Preview' : 'የቴሌግራም መልእክት ቅድመ እይታ'}
              </span>
              <span className="text-[11px] font-mono text-sky-400/90 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                HTML Format
              </span>
            </div>

            {/* Simulated Telegram Chat Bubble */}
            <div className="bg-[#17212b] p-4 rounded-xl border border-[#2b394a] shadow-inner font-sans text-xs text-slate-200 space-y-2 relative">
              <div className="flex items-center justify-between border-b border-[#2b394a] pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold">
                    K
                  </div>
                  <div>
                    <span className="font-semibold text-white block leading-none">Kasma Merchant Order Bot</span>
                    <span className="text-[10px] text-sky-400">bot</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <AnimatePresence mode="wait">
                {testResult ? (
                  <motion.div 
                    key="test"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-pre-line leading-relaxed font-mono text-[11px] text-sky-200 bg-slate-900/60 p-3 rounded-lg border border-sky-500/30"
                  >
                    {testResult}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-pre-line leading-relaxed text-slate-300 font-sans text-[12px]"
                  >
                    <span className="font-bold text-sky-300">🛍️ NEW SALE NOTIFICATION FOR STORE: {merchant.storeName.toUpperCase()}</span>{'\n'}
                    <strong>Order ID:</strong> #ORD-8921 | <strong>Channel:</strong> WEB{'\n'}
                    <strong>Customer:</strong> Getachew Zeleke (📞 +251911889900){'\n'}
                    <strong>Shipping Address:</strong> 📍 Bole Subcity, Woreda 03, Addis Ababa{'\n\n'}
                    <span className="font-semibold text-white">YOUR STORE'S ORDERED PRODUCTS:</span>{'\n'}
                    • Samsung Galaxy S24 Ultra x1 @ 95,000 ETB = 95,000 ETB{'\n\n'}
                    <strong>Store Subtotal:</strong> 95,000 ETB{'\n'}
                    <strong>Net Settlement (97%):</strong> 💰 <span className="text-emerald-400 font-bold">92,150 ETB</span>{'\n'}
                    <strong>Payment Method:</strong> Telebirr Instant{'\n'}
                    <span className="text-sky-400 text-[11px] font-medium mt-1 inline-block">⚡ Dispatch SLA: Active (Dispatch within 24 Hours)</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Orders Activity Counter */}
          <div className="bg-slate-950/40 rounded-xl border border-slate-800 p-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>
                {isEn ? 'Total Store Orders Tracked:' : 'አጠቃላይ የታዘዙ ምርቶች:'}{' '}
                <strong className="text-white font-mono">{merchantOrders.length} orders</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {isEn ? 'Auto-sync active across Cloud SQL' : 'ከ Cloud SQL ጋር በቅጽበት የተሳሰረ'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

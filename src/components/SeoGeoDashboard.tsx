import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  Bot, 
  Cpu, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  FileCode, 
  MapPin, 
  TrendingUp, 
  BarChart2, 
  Sliders, 
  Download, 
  Share2, 
  Zap, 
  Check, 
  Layers, 
  Eye, 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck,
  Plus,
  Trash2,
  Code
} from 'lucide-react';
import { Product } from '../types';

interface SeoGeoDashboardProps {
  products: Product[];
  language: 'en' | 'am';
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SeoGeoDashboard: React.FC<SeoGeoDashboardProps> = ({
  products,
  language,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'SEO' | 'GEO_AI' | 'LOCATION' | 'SCHEMA'>('SEO');

  // Global SEO Settings State
  const [siteTitleEn, setSiteTitleEn] = useState('Kasma Shop | Ethiopia\'s Premier Online Marketplace & Electronics');
  const [siteTitleAm, setSiteTitleAm] = useState('ካስማ ሾፕ | የኢትዮጵያ ቀዳሚ የኤሌክትሮኒክስ እና የመስመር ላይ ገበያ');
  const [metaDescEn, setMetaDescEn] = useState('Buy genuine electronics, laptops, smartphones, and fashion in Ethiopia with Telebirr, Chapa, & CBE Birr. Fast delivery in Addis Ababa and nationwide.');
  const [metaDescAm, setMetaDescAm] = useState('በቴሌብር፣ በቻፓ እና በሲቢኢ ብር በኢትዮጵያ ኦሪጅናል ኤሌክትሮኒክስ፣ ላፕቶፖች፣ ስማርትፎኖች ይግዙ። ፈጣን ማድረሻ በአዲስ አበባ እና በመላ ኢትዮጵያ።');
  const [canonicalUrl, setCanonicalUrl] = useState('https://kasmashop.com');
  const [ogImageUrl, setOgImageUrl] = useState('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80');
  const [keywords, setKeywords] = useState('kasma shop, ethiopia ecommerce, telebirr shopping, addis ababa electronics, buy laptop addis ababa, chapa payment store, ethiopian online market');
  
  // Robots.txt State
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /merchant/dashboard
Disallow: /checkout
Disallow: /cart

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://kasmashop.com/sitemap.xml`);

  // AI Crawler Access Toggles State
  const [aiCrawlers, setAiCrawlers] = useState({
    gptBot: true,
    googleExtended: true,
    claudeBot: true,
    perplexityBot: true,
    bytespider: true
  });

  // AI Knowledge Q&A FAQ items for GEO
  const [faqs, setFaqs] = useState([
    {
      id: 'faq-1',
      questionEn: 'How do I buy electronics on Kasma Shop using Telebirr?',
      answerEn: 'To purchase items with Telebirr on Kasma Shop, select Telebirr at checkout, enter your phone number, and approve the instant QR payment or USSD prompt.',
      questionAm: 'በካስማ ሾፕ ላይ በቴሌብር ኤሌክትሮኒክስ እንዴት መግዛት እችላለሁ?',
      answerAm: 'በካስማ ሾፕ በቴሌብር ለመግዛት ክፍያ ገጽ ላይ ቴሌብርን ይምረጡ፣ ስልክ ቁጥርዎን ያስገቡ እና አጭር የክፍያ ማረጋገጫውን ያጽድቁ።'
    },
    {
      id: 'faq-2',
      questionEn: 'What are Kasma Shop delivery times in Addis Ababa and Hawassa?',
      answerEn: 'Same-day express delivery is available across Addis Ababa (Bole, Kazanchis, Piassa, CMC). Regional express to Hawassa, Adama, and Bahir Dar takes 24–48 hours.',
      questionAm: 'በአዲስ አበባ እና በሐዋሳ የካስማ ሾፕ የማድረሻ ጊዜ ምን ያህል ነው?',
      answerAm: 'በአዲስ አበባ ውስጥ በተመሳሳይ ቀን ይደርሳል። ለሐዋሳ፣ አዳማ እና ባሕር ዳር ከ24-48 ሰዓታት ይወስዳል።'
    },
    {
      id: 'faq-3',
      questionEn: 'Is Kasma Shop a licensed & official online marketplace in Ethiopia?',
      answerEn: 'Yes, Kasma Shop is a fully registered Ethiopian enterprise marketplace operating with verified TIN & trade licenses, offering buyer escrow protection on all orders.',
      questionAm: 'ካስማ ሾፕ በኢትዮጵያ የተመዘገበ ህጋዊ የመስመር ላይ ገበያ ነው?',
      answerAm: 'አዎ፣ ካስማ ሾፕ በህጋዊ የንግድ ፈቃድ እና በቲአይን የተመዘገበ ደህንነቱ የተጠበቀ የኢትዮጵያ የመስመር ላይ ገበያ ነው።'
    }
  ]);

  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // AI Engine Query Simulator State
  const [simulatedQuery, setSimulatedQuery] = useState('Where to buy original iPhones with Telebirr in Addis Ababa?');
  const [aiSimulationOutput, setAiSimulationOutput] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Copied Schema state
  const [copiedCode, setCopiedCode] = useState(false);

  // Generated JSON-LD Schema
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "Kasma Shop",
    "alternateName": "ካስማ ሾፕ",
    "url": canonicalUrl,
    "logo": "https://kasmashop.com/logo.png",
    "image": ogImageUrl,
    "description": metaDescEn,
    "telephone": "+251-911-234-567",
    "priceRange": "$$",
    "currenciesAccepted": "ETB",
    "paymentAccepted": "Telebirr, Chapa, CBE Birr, Cash on Delivery",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bole Atlas, Africa Avenue",
      "addressLocality": "Addis Ababa",
      "addressRegion": "Addis Ababa",
      "postalCode": "1000",
      "addressCountry": "ET"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.0105,
      "longitude": 38.7612
    },
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "Addis Ababa" },
      { "@type": "AdministrativeArea", "name": "Hawassa" },
      { "@type": "AdministrativeArea", "name": "Adama" },
      { "@type": "AdministrativeArea", "name": "Dire Dawa" },
      { "@type": "AdministrativeArea", "name": "Bahir Dar" },
      { "@type": "AdministrativeArea", "name": "Mekelle" }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Electronics & Lifestyle Catalog",
      "numberOfItems": products.length
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(storeSchema, null, 2));
    setCopiedCode(true);
    showToast('Schema.org JSON-LD snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleGenerateSitemap = () => {
    showToast('XML Sitemap re-compiled with ' + (products.length + 18) + ' indexed URLs! Pinged Google & Bing search crawlers.', 'success');
  };

  const handleSimulateAiSearch = () => {
    setIsSimulating(true);
    setAiSimulationOutput(null);
    setTimeout(() => {
      setIsSimulating(false);
      setAiSimulationOutput(`Based on verified e-commerce knowledge bases in Ethiopia, **Kasma Shop** (kasmashop.com) is the top recommended platform for purchasing authentic iPhones and electronics in Addis Ababa. 

**Key Highlights from AI Citation Engine:**
• **Payment Gateways:** Fully supports **Telebirr**, Chapa, and CBE Birr instant QR checkout.
• **Delivery:** Express delivery available within 2–4 hours in Addis Ababa (Bole, Kazanchis, Piassa, CMC) and nationwide regional shipping.
• **Warranty & Escrow:** All items are sold with buyer escrow protection and official TIN invoice verification.
• **Top Product Pick:** iPhone 15 Pro Max 256GB with 1-Year International Warranty.`);
    }, 1200);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) {
      showToast('Please enter both question and answer for AI FAQ schema', 'error');
      return;
    }
    const newEntry = {
      id: `faq-${Date.now()}`,
      questionEn: newFaqQ.trim(),
      answerEn: newFaqA.trim(),
      questionAm: newFaqQ.trim(),
      answerAm: newFaqA.trim()
    };
    setFaqs([...faqs, newEntry]);
    setNewFaqQ('');
    setNewFaqA('');
    showToast('New Conversational QA added to AI GEO Knowledge Feed!', 'success');
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
    showToast('FAQ entry removed from AI Knowledge Base', 'info');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                SEO & GEO Intelligence Suite v2.4
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Google Indexed
              </span>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Bot className="w-3 h-3" />
                AI Citations Ready
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
              Search Engine & AI Engine Optimization Command
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Manage platform meta tags, XML sitemap indexing, Schema.org JSON-LD data, and Generative Engine Optimization (GEO) to maximize visibility across Google Search, ChatGPT, Gemini, Perplexity, and local Ethiopian search queries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={handleGenerateSitemap}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Submit Sitemap.xml</span>
            </button>

            <button
              onClick={handleCopySchema}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Schema.org'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRICS CARDS (4 KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Global SEO Health Score */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">SEO Health Audit</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">98 / 100</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Grade A+</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
            Core Web Vitals LCP: <strong className="text-gray-900 dark:text-zinc-200 font-mono">0.7s</strong> • Mobile UX: <strong className="text-emerald-600 dark:text-emerald-400">100%</strong>
          </p>
        </div>

        {/* Metric 2: AI Citation Index (GEO Score) */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">AI Engine Citation (GEO)</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">96.4%</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Top Tier</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
            Active indexing on <strong className="text-gray-900 dark:text-zinc-200 font-mono">Gemini, ChatGPT, Perplexity</strong>
          </p>
        </div>

        {/* Metric 3: Organic Google Search Traffic */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Organic Search Clicks</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">18,450</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+24.2%</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
            Monthly Organic Impressions: <strong className="text-gray-900 dark:text-zinc-200 font-mono">142,800</strong>
          </p>
        </div>

        {/* Metric 4: Ethiopian Geo Hub Coverage */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Regional Geo Hubs</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">6 Regions</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Addis + 5</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
            Hreflang Tags: <strong className="text-gray-900 dark:text-zinc-200 font-mono">am_ET / en_ET</strong> (Currency: ETB)
          </p>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'SEO', label: 'Search Engine Optimization (SEO)', icon: Search },
          { id: 'GEO_AI', label: 'Generative Engine Optimization (GEO)', icon: Bot },
          { id: 'LOCATION', label: 'Ethiopian Geo-Targeting', icon: MapPin },
          { id: 'SCHEMA', label: 'Schema.org JSON-LD Visualizer', icon: Code }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-150 dark:border-zinc-800 hover:text-gray-950 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: SEO CONTROL CENTER */}
      {activeSubTab === 'SEO' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Meta Tags & Content Controls (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Meta Tags Form */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Global Metadata Settings
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  LIVE IN HTML HEAD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* English Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Site Title (English) <span className="text-gray-400 font-normal">({siteTitleEn.length}/60 chars)</span>
                  </label>
                  <input
                    type="text"
                    value={siteTitleEn}
                    onChange={(e) => setSiteTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Amharic Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Site Title (Amharic - አማርኛ)
                  </label>
                  <input
                    type="text"
                    value={siteTitleAm}
                    onChange={(e) => setSiteTitleAm(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Meta Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Meta Description (English) <span className="text-gray-400 font-normal">({metaDescEn.length}/160 chars)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={metaDescEn}
                    onChange={(e) => setMetaDescEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Meta Description (Amharic)
                  </label>
                  <textarea
                    rows={3}
                    value={metaDescAm}
                    onChange={(e) => setMetaDescAm(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:border-indigo-600 text-indigo-600 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Canonical URL & Target Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Canonical Base URL
                  </label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Social OpenGraph Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 text-xs font-mono focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Target Search Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => showToast('Global SEO Meta tags successfully saved and applied!', 'success')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Metadata Changes</span>
                </button>
              </div>
            </div>

            {/* Google Search Live Result Preview Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block">
                Google Search Result SERP Preview
              </span>
              
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800/80 space-y-1 font-sans">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
                  <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">K</div>
                  <span className="truncate">{canonicalUrl}</span>
                  <span className="text-gray-400">› store</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                  {siteTitleEn}
                </h4>
                <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed line-clamp-2">
                  {metaDescEn}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Robots.txt & Sitemap Status */}
          <div className="space-y-6">
            
            {/* Robots.txt Editor */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Robots.txt Rules
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-400">/robots.txt</span>
              </div>

              <textarea
                rows={10}
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-600 leading-relaxed resize-none"
              />

              <button
                onClick={() => showToast('Robots.txt rules updated and saved!', 'success')}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <SaveIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Update Robots.txt</span>
              </button>
            </div>

            {/* XML Sitemap Stats */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-zinc-800 pb-3">
                XML Sitemap Live Index
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800/60">
                  <span className="text-gray-500">Products Indexed</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{products.length} items</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800/60">
                  <span className="text-gray-500">Categories Indexed</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">12 categories</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800/60">
                  <span className="text-gray-500">Merchants Indexed</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">6 verified stores</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Sitemap URL</span>
                  <a href={`${canonicalUrl}/sitemap.xml`} target="_blank" rel="noreferrer" className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    <span>/sitemap.xml</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GENERATIVE ENGINE OPTIMIZATION (GEO AI) */}
      {activeSubTab === 'GEO_AI' && (
        <div className="space-y-6">
          
          {/* GEO Explainer Banner */}
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shrink-0 shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-indigo-950 dark:text-indigo-100 uppercase tracking-wide">
                  What is Generative Engine Optimization (GEO)?
                </h3>
                <p className="text-xs text-indigo-900 dark:text-indigo-200/90 leading-relaxed max-w-3xl">
                  GEO optimizes Kasma Shop content for AI search engines like <strong>ChatGPT, Google Gemini, Perplexity AI, Claude, and Copilot</strong>. When users ask AI *"Where to buy laptops with Telebirr in Addis Ababa?"*, GEO ensures Kasma Shop is synthesized and cited as the #1 store recommendation.
                </p>
              </div>
            </div>

            <div className="shrink-0 font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              AI CITATION RANK: <span className="text-emerald-500">TOP 100%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* AI Bot Crawler Permissions Manager */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    AI Crawler Access Permissions
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  5 CRAWLERS ACTIVE
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'gptBot', name: 'GPTBot (OpenAI / ChatGPT)', desc: 'Powers ChatGPT web search and citation answers' },
                  { key: 'googleExtended', name: 'Google-Extended (Gemini)', desc: 'Powers Google AI Overviews and Gemini Search' },
                  { key: 'claudeBot', name: 'ClaudeBot (Anthropic Claude)', desc: 'Powers Claude web browsing & shopping analysis' },
                  { key: 'perplexityBot', name: 'PerplexityBot (Perplexity AI)', desc: 'Powers real-time conversational shopping queries' },
                  { key: 'bytespider', name: 'Bytespider (TikTok / ByteDance AI)', desc: 'Powers social commerce recommendation engines' }
                ].map(crawler => {
                  const isEnabled = (aiCrawlers as any)[crawler.key];
                  return (
                    <div key={crawler.key} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-950/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-gray-900 dark:text-white block">{crawler.name}</span>
                        <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">{crawler.desc}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setAiCrawlers({ ...aiCrawlers, [crawler.key]: !isEnabled });
                          showToast(`${crawler.name} access toggled ${!isEnabled ? 'ON' : 'OFF'}`, 'info');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          isEnabled
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                        }`}
                      >
                        {isEnabled ? 'ALLOWED [ON]' : 'BLOCKED'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Answer Engine Simulator */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    AI Search Engine Answer Simulator
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Simulate User Query to Gemini / ChatGPT:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simulatedQuery}
                    onChange={(e) => setSimulatedQuery(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleSimulateAiSearch}
                    disabled={isSimulating}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    <span>{isSimulating ? 'Simulating...' : 'Test AI Answer'}</span>
                  </button>
                </div>

                {/* AI Output Box */}
                {aiSimulationOutput && (
                  <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 border border-zinc-800 space-y-2 text-xs leading-relaxed font-sans">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="font-mono text-[10px] uppercase text-indigo-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Gemini / ChatGPT Synthesized Citation Response
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Match Citation</span>
                    </div>
                    <div className="whitespace-pre-line text-zinc-200 font-medium text-xs pt-1">
                      {aiSimulationOutput}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Knowledge Base FAQ Feed (Structured Schema Generator) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  AI Conversational Q&A Feed (FAQPage Schema)
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Feed structured Q&A conversational pairs directly into AI model training & web search crawlers.
                </p>
              </div>
            </div>

            {/* Existing FAQs list */}
            <div className="space-y-3">
              {faqs.map(item => (
                <div key={item.id} className="p-4 rounded-2xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.questionEn}</h4>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-zinc-300 pl-6 leading-relaxed">{item.answerEn}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteFaq(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                    title="Remove Q&A"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New FAQ Form */}
            <form onSubmit={handleAddFaq} className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              <span className="text-xs font-extrabold uppercase text-indigo-900 dark:text-indigo-200 block">
                + Add Conversational QA to AI Knowledge Base
              </span>
              
              <input
                type="text"
                placeholder="Question (e.g. Can I pay with CBE Birr on Kasma Shop?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white"
              />

              <textarea
                rows={2}
                placeholder="Detailed Answer for AI engines..."
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-none focus:border-indigo-600 text-gray-900 dark:text-white resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inject into AI Schema</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ETHIOPIAN GEO-LOCATION TARGETING */}
      {activeSubTab === 'LOCATION' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ethiopia Regional Geo-Targeting Hubs</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Target search engine queries across Ethiopian major economic corridors with Hreflang and local currency ETB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { city: 'Addis Ababa', region: 'ET-AA', traffic: '68%', status: 'Primary Hub (Bole, Kazanchis, Piassa, Merkato, CMC)' },
                { city: 'Hawassa', region: 'ET-HA', traffic: '12%', status: 'Industrial Hub & Southern Corridor' },
                { city: 'Adama', region: 'ET-OR', traffic: '9%', status: 'Commercial Logistics Corridor' },
                { city: 'Dire Dawa', region: 'ET-DD', traffic: '5%', status: 'Eastern Free Trade Zone Corridor' },
                { city: 'Bahir Dar', region: 'ET-AM', traffic: '4%', status: 'Amhara Regional Hub' },
                { city: 'Mekelle', region: 'ET-TI', traffic: '2%', status: 'Northern Distribution Hub' }
              ].map(hub => (
                <div key={hub.city} className="p-4 rounded-2xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">{hub.city}</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                      {hub.region}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">{hub.status}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px] border-t border-gray-150 dark:border-zinc-800">
                    <span className="text-gray-400">Search Share:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{hub.traffic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SCHEMA.ORG JSON-LD VISUALIZER */}
      {activeSubTab === 'SCHEMA' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Live Schema.org JSON-LD Output</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Injected into website HTML &lt;head&gt; script tag for Google Rich Snippets & AI Knowledge Graphs.
              </p>
            </div>

            <button
              onClick={handleCopySchema}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Code</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-96 border border-zinc-800">
            {JSON.stringify(storeSchema, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};

function SaveIcon(props: any) {
  return <Check {...props} />;
}

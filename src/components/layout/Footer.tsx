import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { SocialFooterSection } from '../SocialFooterSection';
import { generateWhatsAppCustomerWelcomeUrl } from '../../utils/whatsappNotifications';
import { 
  Truck, 
  Lock, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  ChevronDown, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  ExternalLink,
  X,
  CheckCircle2
} from 'lucide-react';

type PolicyModalType = 'privacy' | 'terms' | 'refunds' | 'faq' | 'escrow' | 'shipping' | null;

export const Footer: React.FC = () => {
  const { language, cart, showToast } = useShop();
  const navigate = useNavigate();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [openFooterAccordion, setOpenFooterAccordion] = useState<string | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyModalType>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    showToast(
      language === 'en' 
        ? 'Thank you for subscribing to Kasma flash deals & drops!' 
        : 'የካስማ ልዩ ቅናሾች መረጃዎችን ለማግኘት ስለተመዘገቡ እናመሰግናለን!',
      'success'
    );
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-gray-150 dark:border-zinc-900 py-8 sm:py-12 px-3.5 sm:px-6 md:px-8 shrink-0 text-gray-500 dark:text-zinc-400 transition-colors">
      <div className="max-w-[1440px] mx-auto w-full">
        
        {/* 1. TRUST INDICATORS GUARANTEE RIBBON */}
        <div className="w-full border-b border-gray-150 dark:border-zinc-850 pb-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-zinc-900/80 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs">
            
            <div className="flex items-center gap-2.5 p-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">
                  {language === 'en' ? 'Express Delivery' : 'ፈጣን ማድረሻ'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  {language === 'en' ? 'Addis Ababa & Regions' : 'አዲስ አበባ እና ክልሎች'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">
                  {language === 'en' ? 'Escrow Protection' : 'የእምነት ዋስትና'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  {language === 'en' ? 'Telebirr, CBE & Chapa' : 'ቴሌብር፣ ሲቢኢ እና ቻፓ'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">
                  {language === 'en' ? '7-Day Easy Returns' : 'የ7 ቀን ቀላል መመለስ'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  {language === 'en' ? '100% Refund Guarantee' : '100% የገንዘብ ተመላሽ'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-1">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block">
                  {language === 'en' ? '1-Year Warranty' : 'የ1 ዓመት ዋስትና'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  {language === 'en' ? 'Verified Quality Guarantee' : 'የጥራት ዋስትና የተሸፈነ'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. NEWSLETTER SUBSCRIPTION BANNER */}
        <div className="w-full border-b border-gray-150 dark:border-zinc-850 pb-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/70 dark:bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-gray-150 dark:border-zinc-800">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                {language === 'en' ? 'SUBSCRIBE TO NEWSLETTER' : 'ለልዩ ቅናሾች ይመዝገቡ'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {language === 'en' 
                  ? 'Get weekly flash sales, new vendor arrivals, and exclusive offers.' 
                  : 'የሳምንታዊ ልዩ ቅናሾች እና አዳዲስ መረጃዎችን ያግኙ።'}
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto min-w-[280px] sm:min-w-[340px]">
              <input 
                type="email" 
                placeholder={language === 'en' ? 'Enter your email' : 'ኢሜልዎን ያስገቡ'} 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs w-full focus:outline-hidden focus:border-[#0052FF] text-gray-900 dark:text-zinc-100 h-9"
              />
              <button 
                type="submit" 
                className="bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shrink-0 h-9"
              >
                {newsletterSubscribed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Subscribed!' : 'ተመዝግበዋል!'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'en' ? 'Subscribe' : 'ይመዝገቡ'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 3. MOBILE VIEW (< md): Sleek Collapsible Accordions */}
        <div className="md:hidden w-full space-y-3 pb-6 border-b border-gray-150 dark:border-zinc-850">
          
          {/* Brand Card & Language Badge */}
          <div className="bg-gray-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-gray-150 dark:border-zinc-800 space-y-2.5">
            <span className="text-sm font-black uppercase tracking-widest text-[#0052FF] block">
              KASMA <span className="text-gray-950 dark:text-white font-light">SHOP</span>
            </span>
            <p className="text-gray-500 dark:text-zinc-400 font-medium text-xs leading-relaxed">
              {language === 'en' 
                ? "Ethiopia's trusted marketplace connecting verified local artisans and merchants under escrow buyer protection."
                : 'ካስማ የሀገር ውስጥ አምራቾች እና ነጋዴዎችን በታማኝነት ከገዢዎች ጋር የሚያገናኝ የገበያ ቦታ ነው።'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 w-fit font-bold">
              <Globe className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>{language === 'en' ? 'English (US)' : 'አማርኛ (ኢትዮጵያ)'}</span>
              <span className="text-gray-300 dark:text-zinc-700">|</span>
              <span className="font-mono text-[10px] text-gray-400">ETB (ብር)</span>
            </div>
          </div>

          {/* Accordion 1: Shop & Discover */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpenFooterAccordion(openFooterAccordion === 'shop' ? null : 'shop')}
              className="w-full flex items-center justify-between p-3.5 text-left font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{language === 'en' ? 'Shop & Discover' : 'ምድቦች እና ግዢ'}</span>
              <ChevronDown className={`w-4 h-4 text-[#0052FF] transition-transform duration-200 ${openFooterAccordion === 'shop' ? 'rotate-180' : ''}`} />
            </button>
            {openFooterAccordion === 'shop' && (
              <ul className="px-3.5 pb-3.5 space-y-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/60 pt-2.5">
                <li>
                  <Link to="/" onClick={scrollToTop} className="hover:text-[#0052FF] transition-colors block w-full">
                    {language === 'en' ? 'Storefront / All Products' : 'ዋናው ሱቅ / ሁሉም ምርቶች'}
                  </Link>
                </li>
                <li>
                  <button onClick={() => { navigate('/'); setTimeout(() => { const el = document.getElementById('featured-deals-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Special Flash Sales' : 'ሳምንታዊ ልዩ ቅናሾች'}
                  </button>
                </li>
                <li>
                  <button onClick={() => { navigate('/'); setTimeout(() => { const el = document.getElementById('products-grid-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Browse Electronics' : 'የኤሌክትሮኒክስ ምርቶች'}
                  </button>
                </li>
                <li>
                  <button onClick={() => { navigate('/'); setTimeout(() => { const el = document.getElementById('products-grid-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Handcrafts & Agriculture' : 'የእጅ ጥበብ እና ግብርና'}
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 2: Policies & Support */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpenFooterAccordion(openFooterAccordion === 'policies' ? null : 'policies')}
              className="w-full flex items-center justify-between p-3.5 text-left font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{language === 'en' ? 'Policies & Support' : 'ፖሊሲዎች እና ህጎች'}</span>
              <ChevronDown className={`w-4 h-4 text-[#0052FF] transition-transform duration-200 ${openFooterAccordion === 'policies' ? 'rotate-180' : ''}`} />
            </button>
            {openFooterAccordion === 'policies' && (
              <ul className="px-3.5 pb-3.5 space-y-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/60 pt-2.5">
                <li>
                  <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicyModal('terms')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicyModal('refunds')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Returns & Refunds' : 'የምርት መልስ እና ተመላሽ'}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicyModal('faq')} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block w-full">
                    {language === 'en' ? 'Help Center & FAQ' : 'የእርዳታ ማዕከል እና ጥያቄዎች'}
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 3: Kasma Business */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpenFooterAccordion(openFooterAccordion === 'business' ? null : 'business')}
              className="w-full flex items-center justify-between p-3.5 text-left font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white cursor-pointer"
            >
              <span>{language === 'en' ? 'Kasma Business' : 'ካስማ ለንግድ አጋሮች'}</span>
              <ChevronDown className={`w-4 h-4 text-[#0052FF] transition-transform duration-200 ${openFooterAccordion === 'business' ? 'rotate-180' : ''}`} />
            </button>
            {openFooterAccordion === 'business' && (
              <ul className="px-3.5 pb-3.5 space-y-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/60 pt-2.5">
                <li>
                  <Link to="/merchant" className="hover:text-[#0052FF] transition-colors block w-full">
                    {language === 'en' ? 'Sell on Kasma' : 'ምርትዎን በካስማ ላይ ይሽጡ'}
                  </Link>
                </li>
                <li>
                  <Link to="/merchant" className="hover:text-[#0052FF] transition-colors block w-full">
                    {language === 'en' ? 'Merchant Portal' : 'የነጋዴዎች መግቢያ'}
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-[#0052FF] transition-colors block w-full">
                    {language === 'en' ? 'Admin Governance' : 'የአስተዳዳሪ ክፍል'}
                  </Link>
                </li>
                <li>
                  <Link to="/courier" className="hover:text-[#0052FF] text-amber-600 dark:text-amber-400 font-extrabold transition-colors block w-full">
                    {language === 'en' ? 'Addis Courier Portal (🛵)' : 'የአዲስ አበባ አሽከርካሪዎች (🛵)'}
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 4: Customer Support */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 p-3.5 space-y-2.5 text-xs">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'Customer Support' : 'የደንበኞች አገልግሎት'}
            </h4>
            <div className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0052FF] shrink-0 mt-0.5" />
                <span>Bole Sub-City, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                <a href="tel:+251911223344" className="hover:underline">+251 911 223 344</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                <a href="mailto:support@kasma.shop" className="hover:underline">support@kasma.shop</a>
              </div>
              <div className="pt-2">
                <a
                  href={generateWhatsAppCustomerWelcomeUrl(cart, language)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs py-2 px-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer w-full"
                >
                  <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
                  <span>{language === 'en' ? 'Chat on WhatsApp' : 'በዋትስአፕ ያወሩን'}</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* 4. DESKTOP VIEW (>= md): Pristine 5-Column Grid */}
        <div className="hidden md:grid w-full grid-cols-5 gap-6 lg:gap-8 text-xs leading-relaxed items-start pb-8 border-b border-gray-150 dark:border-zinc-850">
          
          {/* Column 1: About & Language Selector */}
          <div className="space-y-3.5 text-left">
            <div className="space-y-1.5">
              <span className="text-sm font-black uppercase tracking-widest text-[#0052FF] block">
                KASMA <span className="text-gray-950 dark:text-white font-light">SHOP</span>
              </span>
              <p className="text-gray-400 dark:text-zinc-500 leading-relaxed font-medium text-xs">
                {language === 'en' 
                  ? "Ethiopia's trusted marketplace connecting verified local artisans and merchants under escrow buyer protection."
                  : 'ካስማ የሀገር ውስጥ አምራቾች እና ነጋዴዎችን በታማኝነት ከገዢዎች ጋር የሚያገናኝ የገበያ ቦታ ነው።'}
              </p>
            </div>
            {/* Language and Region Badge */}
            <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl px-3 py-1.5 w-fit font-bold">
              <Globe className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>{language === 'en' ? 'English (US)' : 'አማርኛ (ኢትዮጵያ)'}</span>
              <span className="text-gray-250 dark:text-zinc-800">|</span>
              <span className="font-mono text-[10px] text-gray-400 dark:text-zinc-500">ETB (ብር)</span>
            </div>
          </div>

          {/* Column 2: Quick Links / Navigation */}
          <div className="space-y-3 text-left">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'SHOP & DISCOVER' : 'ምድቦች እና ግዢ'}
            </h4>
            <ul className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold text-xs">
              <li>
                <Link to="/" onClick={scrollToTop} className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block">
                  {language === 'en' ? 'Storefront / All Products' : 'ዋናው ሱቅ / ሁሉም ምርቶች'}
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('featured-deals-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block"
                >
                  {language === 'en' ? 'Special Flash Sales' : 'ሳምንታዊ ልዩ ቅናሾች'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('products-grid-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block"
                >
                  {language === 'en' ? 'Browse Electronics' : 'የኤሌክትሮኒክስ ምርቶች'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('products-grid-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block"
                >
                  {language === 'en' ? 'Handcrafts & Agriculture' : 'የእጅ ጥበብ እና ግብርና'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Policies */}
          <div className="space-y-3 text-left">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'POLICIES & SUPPORT' : 'ፖሊሲዎች እና ህጎች'}
            </h4>
            <ul className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold text-xs">
              <li>
                <button 
                  onClick={() => setActivePolicyModal('privacy')} 
                  className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block"
                >
                  <span>{language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal('terms')} 
                  className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block"
                >
                  <span>{language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal('refunds')} 
                  className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block"
                >
                  <span>{language === 'en' ? 'Returns & Refunds' : 'የምርት መልስ እና ተመላሽ'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePolicyModal('faq')} 
                  className="hover:text-[#0052FF] transition-colors cursor-pointer text-left block"
                >
                  <span>{language === 'en' ? 'Help Center & FAQ' : 'የእርዳታ ማዕከል እና ጥያቄዎች'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Partner & Merchant Portal Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'KASMA BUSINESS' : 'ካስማ ለንግድ አጋሮች'}
            </h4>
            <ul className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold text-xs">
              <li>
                <Link to="/merchant" className="hover:text-[#0052FF] transition-colors block">
                  {language === 'en' ? 'Sell on Kasma' : 'ምርትዎን በካስማ ላይ ይሽጡ'}
                </Link>
              </li>
              <li>
                <Link to="/merchant" className="hover:text-[#0052FF] transition-colors block">
                  {language === 'en' ? 'Merchant Portal' : 'የነጋዴዎች መግቢያ'}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#0052FF] transition-colors block">
                  {language === 'en' ? 'Admin Governance' : 'የአስተዳዳሪ ክፍል'}
                </Link>
              </li>
              <li>
                <Link to="/courier" className="hover:text-[#0052FF] text-amber-600 dark:text-amber-400 font-extrabold transition-colors block">
                  {language === 'en' ? 'Addis Courier Portal (🛵)' : 'የአዲስ አበባ አሽከርካሪዎች (🛵)'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact & Secure Support Desk */}
          <div className="space-y-3 text-left">
            <h4 className="font-black text-gray-950 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'en' ? 'CUSTOMER SUPPORT' : 'የደንበኞች አገልግሎት'}
            </h4>
            <ul className="space-y-2 text-gray-500 dark:text-zinc-400 font-bold text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0052FF] shrink-0 mt-0.5" />
                <span>Bole Sub-City, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                <a href="tel:+251911223344" className="hover:underline">+251 911 223 344</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
                <a href="mailto:support@kasma.shop" className="hover:underline">support@kasma.shop</a>
              </li>
              <li className="pt-2">
                <a
                  href={generateWhatsAppCustomerWelcomeUrl(cart, language)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs py-2 px-3.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer w-full"
                >
                  <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
                  <span>{language === 'en' ? 'Chat on WhatsApp' : 'በዋትስአፕ ያወሩን'}</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* 5. DEDICATED SOCIAL MEDIA SECTION */}
        <div className="w-full pt-6 sm:pt-8">
          <SocialFooterSection language={language} cart={cart} />
        </div>

        {/* 6. DIVIDER & SECURE PAYMENTS GATEWAYS BAR */}
        <div className="w-full mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-150 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-5 sm:gap-6 text-[11px] text-gray-400 dark:text-zinc-500 font-bold px-1 sm:px-4">
          
          {/* Payment Badges */}
          <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-600 font-extrabold mr-1">
              {language === 'en' ? 'SECURED BY' : 'የክፍያ ዋስትና በ:'}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-mono text-[9px] tracking-wide font-extrabold">
                CHAPA
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-mono text-[9px] tracking-wide font-extrabold">
                TELEBIRR
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-mono text-[9px] tracking-wide font-extrabold">
                CBE CUSTODY
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-gray-700 dark:text-zinc-300 font-mono text-[9px] tracking-wide font-extrabold">
                AWASH TRUST
              </div>
            </div>
          </div>

          {/* Quick Legal Links */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500 dark:text-zinc-400 flex-wrap justify-center">
            <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-[#0052FF] transition-colors cursor-pointer">
              {language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}
            </button>
            <span>•</span>
            <button onClick={() => setActivePolicyModal('terms')} className="hover:text-[#0052FF] transition-colors cursor-pointer">
              {language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች'}
            </button>
            <span>•</span>
            <button onClick={() => setActivePolicyModal('refunds')} className="hover:text-[#0052FF] transition-colors cursor-pointer">
              {language === 'en' ? 'Returns & Refunds' : 'የተመላሽ ፖሊሲ'}
            </button>
            <span>•</span>
            <button onClick={() => setActivePolicyModal('faq')} className="hover:text-[#0052FF] transition-colors cursor-pointer">
              {language === 'en' ? 'FAQ' : 'ጥያቄዎች'}
            </button>
          </div>

          {/* Copyright */}
          <div className="text-[10px] text-gray-400 dark:text-zinc-500 tracking-wider uppercase font-semibold text-center md:text-right">
            © {new Date().getFullYear()} KASMA ETHIOPIAN LOCALIZED COMMERCE. ALL RIGHTS RESERVED.
          </div>

        </div>

      </div>

      {/* 7. POLICY MODAL DIALOGS */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-left max-h-[85vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {activePolicyModal === 'privacy' && (language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ')}
                {activePolicyModal === 'terms' && (language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች')}
                {activePolicyModal === 'refunds' && (language === 'en' ? 'Returns & Refunds' : 'የምርት መልስ እና ተመላሽ')}
                {activePolicyModal === 'faq' && (language === 'en' ? 'Help Center & Frequently Asked Questions' : 'የእርዳታ ማዕከል እና ተደጋጋሚ ጥያቄዎች')}
                {activePolicyModal === 'escrow' && (language === 'en' ? 'Verified Escrow Guarantee' : 'የተረጋገጠ የክፍያ ዋስትና')}
                {activePolicyModal === 'shipping' && (language === 'en' ? 'Express Delivery Guidelines' : 'የፈጣን ማጓጓዣ መመሪያዎች')}
              </h3>
              <button 
                onClick={() => setActivePolicyModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-600 dark:text-zinc-300 space-y-3 leading-relaxed">
              {activePolicyModal === 'privacy' && (
                <>
                  <p>
                    Kasma Shop places paramount emphasis on securing personal identification and transaction records for all Ethiopian users.
                  </p>
                  <p>
                    <strong>Data Encryption:</strong> All phone numbers, delivery addresses, and payment tokens are encrypted using AES-256 protocols.
                  </p>
                  <p>
                    <strong>No Third-Party Sharing:</strong> We do not sell or rent consumer data to external advertising networks. Merchant partners receive delivery coordinates only upon confirmed purchase.
                  </p>
                </>
              )}

              {activePolicyModal === 'terms' && (
                <>
                  <p>
                    By placing an order or registering a vendor store on Kasma Shop, you agree to our localized escrow commerce terms:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    <li>All electronics products must be factory sealed and genuine.</li>
                    <li>Payments are routed via Chapa / Telebirr bank escrow custody until item handover.</li>
                    <li>Merchants must maintain stock accuracy and dispatch orders within 2 hours of customer placement.</li>
                  </ul>
                </>
              )}

              {activePolicyModal === 'refunds' && (
                <>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs">
                    🛡️ <strong>7-Day Risk-Free Return Guarantee:</strong> If a sealed electronics item has hardware defects or does not match specifications, customers are eligible for a 100% money-back refund.
                  </div>
                  <p>
                    To request a return, contact our support team at <strong>+251 911 223 344</strong> or via WhatsApp. The item must be in original condition with box serials matching invoice data.
                  </p>
                </>
              )}

              {activePolicyModal === 'faq' && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
                    <h5 className="font-bold text-gray-900 dark:text-white">Q: What payment methods are supported?</h5>
                    <p className="text-gray-500 dark:text-zinc-400">Telebirr, CBE Birr, Chapa (Mastercard / Visa), and Cash on Delivery with Escrow OTP.</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
                    <h5 className="font-bold text-gray-900 dark:text-white">Q: How fast is Addis Ababa delivery?</h5>
                    <p className="text-gray-500 dark:text-zinc-400">Orders across all 11 sub-cities are dispatched via express couriers and arrive in 2 to 4 hours.</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl space-y-1">
                    <h5 className="font-bold text-gray-900 dark:text-white">Q: How can merchants register?</h5>
                    <p className="text-gray-500 dark:text-zinc-400">Visit the Merchant Portal link in the footer to register your store and upload your inventory.</p>
                  </div>
                </div>
              )}

              {activePolicyModal === 'escrow' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-300">
                    <strong>100% Escrow Protection:</strong> Funds remain securely vaulted until you receive and verify the device at your doorstep.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-150 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="px-4 py-2 bg-[#0052FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                {language === 'en' ? 'Close' : 'ዝጋ'}
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
};

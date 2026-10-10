import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { ShieldCheck, Truck, RefreshCw, Phone, Mail, MapPin, ExternalLink, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useShop();

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-gray-150 dark:border-zinc-800 transition-colors">
      {/* Trust Badges */}
      <div className="border-b border-gray-150 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? 'Addis Express Delivery' : 'ፈጣን የአዲስ አበባ ማድረሻ'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {language === 'en' ? 'Direct dispatch to your doorstep within 2 to 4 hours.' : 'በ2 እስከ 4 ሰዓት ውስጥ ደጃፍዎ ድረስ እናደርሳለን።'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? '100% Genuine Tech' : '100% ኦሪጅናል እቃዎች'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {language === 'en' ? 'Official brand warranty with serial number verification.' : 'ኦፊሴላዊ የፋብሪካ ዋስትና ከመለያ ቁጥር ጋር።'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? 'Verified Escrow Guarantee' : 'የተረጋገጠ የክፍያ ዋስትና'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {language === 'en' ? 'Funds released to merchant only upon confirmed delivery.' : 'እቃው መድረሱ እስኪረጋገጥ ድረስ ገንዘብዎ የተጠበቀ ነው።'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  {language === 'en' ? 'Local Payment Rails' : 'ሀገር በቀል የክፍያ መንገዶች'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {language === 'en' ? 'Telebirr, CBE Birr, Chapa & Cash on Delivery.' : 'ቴሌብር፣ ሲቢኢ ብር፣ ቻፓ እና በእጅ ክፍያ (COD)።'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm">
                K
              </div>
              <span className="font-black text-base tracking-tight text-gray-900 dark:text-zinc-100">KASMA SHOP</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              {language === 'en'
                ? 'Ethiopia’s high-velocity multi-channel electronics marketplace. Dedicated to bringing authentic consumer technology, seamless mobile payments, and express delivery.'
                : 'የኢትዮጵያ ቀዳሚ የቴክኖሎጂ እና ኤሌክትሮኒክስ መገበያያ። ትክክለኛ እቃዎችን በቴሌብር፣ በሲቢኢ ብር ክፍያ እና በፈጣን ማጓጓዣ እናቀርባለን።'}
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-gray-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0052FF]" />
                <span>Bole Atlas, Addis Ababa</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0052FF]" />
                <span>+251 91 123 4567</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-100">
              {language === 'en' ? 'Store & Catalog' : 'መደብር እና ካታሎግ'}
            </h5>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-zinc-400">
              <li><Link to="/" className="hover:text-[#0052FF] transition-colors">Smartphones</Link></li>
              <li><Link to="/" className="hover:text-[#0052FF] transition-colors">Laptops & PCs</Link></li>
              <li><Link to="/" className="hover:text-[#0052FF] transition-colors">Audio & ANC</Link></li>
              <li><Link to="/" className="hover:text-[#0052FF] transition-colors">Smartwatches</Link></li>
              <li><Link to="/" className="hover:text-[#0052FF] transition-colors">Gaming Consoles</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-100">
              {language === 'en' ? 'Orders & Services' : 'ትዕዛዞች እና አገልግሎቶች'}
            </h5>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-zinc-400">
              <li><Link to="/tracking" className="hover:text-[#0052FF] transition-colors">{language === 'en' ? 'Track Live Order' : 'ትዕዛዝ መከታተያ'}</Link></li>
              <li><Link to="/cart" className="hover:text-[#0052FF] transition-colors">{language === 'en' ? 'Shopping Cart' : 'የግዢ ጋሪ'}</Link></li>
              <li><Link to="/checkout" className="hover:text-[#0052FF] transition-colors">{language === 'en' ? 'Express Checkout' : 'ክፍያ መፈጸሚያ'}</Link></li>
            </ul>
          </div>

          {/* Business & Portals */}
          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-100">
              {language === 'en' ? 'Partner Ecosystem' : 'የአጋርነት መድረኮች'}
            </h5>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-zinc-400">
              <li>
                <Link to="/merchant" className="hover:text-[#0052FF] transition-colors flex items-center gap-1">
                  <span>{language === 'en' ? 'Merchant Portal' : 'የነጋዴ መግቢያ'}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#0052FF] transition-colors flex items-center gap-1">
                  <span>{language === 'en' ? 'Admin Governance' : 'የአስተዳዳሪ ክፍል'}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </Link>
              </li>
              <li>
                <Link to="/courier" className="hover:text-[#0052FF] transition-colors flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <span>{language === 'en' ? 'Addis Courier Portal (🛵)' : 'የአዲስ አበባ አሽከርካሪዎች (🛵)'}</span>
                  <ExternalLink className="w-3 h-3 text-amber-500" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-gray-150 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} Kasma Enterprise Technologies S.C. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Powered by Telebirr & Chapa Rails</span>
            <span>•</span>
            <span>Made with ❤️ in Addis Ababa</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

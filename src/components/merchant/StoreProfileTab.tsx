import React, { useState } from 'react';
import { Merchant } from '../../types';
import { 
  Store, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Building, 
  CheckCircle2, 
  Save, 
  Navigation, 
  AlertCircle,
  Eye,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface StoreProfileTabProps {
  currentMerchant: Merchant;
  onProfileUpdated?: () => Promise<void> | void;
  language: 'en' | 'am';
  showToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

const ADDIS_SUBCITIES = [
  'Bole',
  'Kirkos',
  'Yeka',
  'Arada',
  'Lideta',
  'Nifas Silk-Lafto',
  'Kolfe Keranio',
  'Gullele',
  'Addis Ketema',
  'Akaky Kaliti',
  'Lemi Kura'
];

export default function StoreProfileTab({
  currentMerchant,
  onProfileUpdated,
  language,
  showToast
}: StoreProfileTabProps) {
  const [storeName, setStoreName] = useState(currentMerchant.storeName || '');
  const [ownerName, setOwnerName] = useState(currentMerchant.ownerName || '');
  const [phone, setPhone] = useState(currentMerchant.phone || '');
  const [email, setEmail] = useState(currentMerchant.email || '');

  // Addis Ababa Physical Store Details
  const [subCity, setSubCity] = useState(currentMerchant.subCity || 'Bole');
  const [woreda, setWoreda] = useState(currentMerchant.woreda || 'Woreda 03');
  const [building, setBuilding] = useState(currentMerchant.building || 'Edna Mall / Medhanialem Center');
  const [shopNumber, setShopNumber] = useState(currentMerchant.shopNumber || 'Shop #204 (2nd Floor)');
  const [landmark, setLandmark] = useState(currentMerchant.landmark || 'Opposite Medhanialem Cathedral, Gate 2');
  const [openingHours, setOpeningHours] = useState(currentMerchant.openingHours || 'Mon - Sat: 9:00 AM - 8:00 PM');
  const [pickupInstructions, setPickupInstructions] = useState(
    currentMerchant.pickupInstructions || 'Customers and couriers: Call on arrival. Device testing bench available at counter #2.'
  );
  const [allowCustomerPickup, setAllowCustomerPickup] = useState(
    currentMerchant.allowCustomerPickup !== false
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('kasma_merchant_token') || 
                    localStorage.getItem('kasma_auth_token') || 
                    localStorage.getItem('kasma_admin_token');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const fullLocationString = `${building}, ${shopNumber}, ${subCity} (${woreda}), Addis Ababa`;

      const payload = {
        storeName,
        ownerName,
        phone,
        email,
        subCity,
        woreda,
        building,
        shopNumber,
        landmark,
        locationAddress: fullLocationString,
        openingHours,
        pickupInstructions,
        allowCustomerPickup
      };

      const res = await fetch(`/api/merchants/${currentMerchant.id}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update store profile');
      }

      if (onProfileUpdated) {
        await onProfileUpdated();
      }

      showToast?.(
        language === 'en'
          ? 'Physical store & pickup location updated successfully!'
          : 'የሱቅ አድራሻ እና የደንበኞች መውሰጃ ቦታ በተሳካ ሁኔታ ተስተካክሏል!',
        'success'
      );
    } catch (err: any) {
      console.error('Store profile update failed:', err);
      showToast?.(err.message || 'Failed to save store profile.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-400/30 flex items-center gap-1">
                <Store className="w-3 h-3" />
                <span>{language === 'en' ? 'Verified Addis Retailer' : 'የተረጋገጠ የአዲስ አበባ ሱቅ'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                {allowCustomerPickup ? (language === 'en' ? 'Pickup Active' : 'መውሰድ ይቻላል') : (language === 'en' ? 'Delivery Only' : 'ማድረስ ብቻ')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'en' ? 'Store Profile & Physical Pickup Location' : 'የሱቅ መረጃ እና የደንበኛ እቃ መውሰጃ አድራሻ'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {language === 'en'
                ? 'Configure your physical storefront location in Addis Ababa so couriers can collect orders promptly and customers can opt for in-store pickup.'
                : 'ተላላኪዎች ትዕዛዞችን በፍጥነት እንዲረከቡ እና ደንበኞች በግል መጥተው መውሰድ እንዲችሉ የሱቅዎን ትክክለኛ አድራሻ ያዘጋጁ።'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center sm:text-right shrink-0">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
              {language === 'en' ? 'Current Storefront' : 'የተመዘገበ ሱቅ'}
            </span>
            <span className="font-extrabold text-base text-white block mt-0.5">
              {storeName || currentMerchant.storeName}
            </span>
            <span className="text-xs text-blue-300 font-mono block">
              📍 {subCity}, Addis Ababa
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Basic Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <Store className="w-4 h-4 text-[#0052FF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'en' ? '1. Store Identity & Contact' : '1. የሱቅ ስም እና አድራሻ'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {language === 'en' ? 'Store Public Name *' : 'የሱቅ መጠሪያ ስም *'}
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {language === 'en' ? 'Store Manager / Contact Person' : 'የሱቅ ሥራ አስኪያጅ ሙሉ ስም'}
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {language === 'en' ? 'Store Contact Phone *' : 'የሱቅ ስልክ ቁጥር *'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+251 91 122 3344"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {language === 'en' ? 'Store Support Email' : 'የሱቅ ድጋፍ ኢሜይል'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="support@store.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Addis Ababa Physical Location */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <MapPin className="w-4 h-4 text-[#0052FF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'en' ? '2. Physical Shop Location in Addis Ababa' : '2. በአዲስ አበባ የሚገኘው ትክክለኛ የሱቅ አድራሻ'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {language === 'en' ? 'Sub-City (ክፍለ ከተማ) *' : 'ክፍለ ከተማ *'}
                  </label>
                  <select
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                  >
                    {ADDIS_SUBCITIES.map((sc) => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {language === 'en' ? 'Woreda (ወረዳ)' : 'ወረዳ'}
                  </label>
                  <input
                    type="text"
                    value={woreda}
                    onChange={(e) => setWoreda(e.target.value)}
                    placeholder="e.g. Woreda 03"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {language === 'en' ? 'Building / Mall / Center Name *' : 'የሕንፃው ወይም የገበያ ማዕከሉ ስም *'}
                  </label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    required
                    placeholder="e.g. Edna Mall / Morning Star Mall / Dembel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {language === 'en' ? 'Shop Number & Floor *' : 'የሱቅ ቁጥር እና ፎቅ *'}
                  </label>
                  <input
                    type="text"
                    value={shopNumber}
                    onChange={(e) => setShopNumber(e.target.value)}
                    required
                    placeholder="e.g. Shop #204, 2nd Floor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Prominent Landmark (for delivery couriers)' : 'ታዋቂ መለያ ወይም ምልክት (ለተላላኪዎች)'}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Next to Medhanialem Church Gate 2, near Telebirr agent"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                />
              </div>
            </div>

            {/* Section 3: In-Store Pickup & Operating Hours */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <Clock className="w-4 h-4 text-[#0052FF]" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'en' ? '3. Customer Pickup & Working Hours' : '3. የደንበኞች መውሰጃ እና የሥራ ሰዓት'}
                </h3>
              </div>

              {/* In-Store Pickup Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    {language === 'en' ? 'Allow Customer In-Store Pickup' : 'ደንበኞች ሱቅ መጥተው እንዲረከቡ ፍቀድ'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {language === 'en'
                      ? 'Shoppers can select "Pick up at Bole Store" during checkout and skip shipping fees.'
                      : 'ደንበኞች በክፍያ ወቅት "ሱቅ መጥቼ እወስዳለሁ" የሚለውን በመምረጥ የማድረሻ ክፍያ መቆጠብ ይችላሉ።'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCustomerPickup}
                    onChange={(e) => setAllowCustomerPickup(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052FF]" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Store Operating Hours' : 'የሱቅ የሥራ ሰዓት'}
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM | Sun: 1:00 PM - 7:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Pickup Notes for Customers & Couriers' : 'ለደንበኞች እና ተላላኪዎች የሚሰጥ ማስታወሻ'}
                </label>
                <textarea
                  rows={2}
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  placeholder="e.g. Device testing bench available at counter #2. Please present Order # and 4-digit PIN."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-white outline-none focus:border-[#0052FF]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#0052FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSaving
                    ? (language === 'en' ? 'Saving Store Profile...' : 'በማስቀመጥ ላይ...')
                    : (language === 'en' ? 'Save Store & Pickup Location' : 'የሱቅ አድራሻውን መዝግብ')}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Shopper Storefront Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
              <Eye className="w-4 h-4 text-[#0052FF]" />
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                {language === 'en' ? 'Customer Storefront Preview' : 'በደንበኞች ዘንድ የሚታይበት ገጽታ'}
              </h4>
            </div>

            {/* Storefront Card Simulation */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0052FF] text-white flex items-center justify-center font-black text-sm shadow-md">
                    {storeName ? storeName.charAt(0).toUpperCase() : 'K'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {storeName || 'Your Store Name'}
                      </h5>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      📍 {subCity}, Addis Ababa
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Badge */}
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-[11px] space-y-1">
                <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{building}</span>
                </div>
                <div className="text-slate-500 dark:text-zinc-400 pl-4.5 text-[10px]">
                  {shopNumber} • {woreda}
                </div>
                {landmark && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 pl-4.5 font-medium">
                    📍 {landmark}
                  </div>
                )}
              </div>

              {/* Status and Working Hours */}
              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold">{language === 'en' ? 'In-Store Pickup:' : 'በአካል መውሰድ:'}</span>
                  <span className={`font-bold ${allowCustomerPickup ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {allowCustomerPickup ? '✓ Available (0 ETB fee)' : '✗ Not Available'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold">{language === 'en' ? 'Hours:' : 'ሰዓት:'}</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300 truncate max-w-[150px]">
                    {openingHours}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold">{language === 'en' ? 'Direct Phone:' : 'ስልክ:'}</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300">
                    {phone || '+251 91 122 3344'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/40 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <span className="font-bold text-[#0052FF] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Addis Courier Integration' : 'የአዲስ አበባ ተላላኪዎች'}</span>
              </span>
              <p className="text-[10px] leading-relaxed">
                {language === 'en'
                  ? 'When customers place orders, Kasma express couriers will navigate directly to this address for swift package dispatch.'
                  : 'ደንበኞች ትዕዛዝ ሲሰጡ የካስማ ፈጣን ተላላኪዎች እቃውን ለመረከብ በቀጥታ ወደዚህ የተመዘገበ አድራሻ ይጓዛሉ።'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

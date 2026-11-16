/**
 * Kasma Tech Shop - Official Store & Support Contacts (V1 MVP)
 * Configurable via Vite environment variables with production defaults for Addis Ababa, Ethiopia.
 */

export const KASMA_CONTACTS = {
  // Brand details
  storeNameEn: 'Kasma Tech Shop',
  storeNameAm: 'ካስማ ቴክ ሾፕ',
  companyLegalName: 'Kasma Tech Shop Enterprise PLC',
  taxIdentificationNumber: 'TIN-0098418291',

  // Customer Support & Sales
  supportPhone: import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER || '+251911223344',
  displayPhone: '+251 911 223 344',
  supportEmail: 'support@kasmatech.et',
  salesEmail: 'sales@kasmatech.et',

  // Messaging Channels (V1 Notification Rails)
  telegramSupportUsername: import.meta.env.VITE_TELEGRAM_SUPPORT_USERNAME || 'KasmaTechSupport',
  telegramBotUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'KasmaTechBot',
  telegramMiniAppShortName: 'app',
  telegramChannel: 'kasmatech',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER || '251911223344',

  // Physical Headquarters & Fulfillment Hub
  headquarters: {
    country: 'Ethiopia',
    city: 'Addis Ababa',
    subCityEn: 'Bole Sub-City, Woreda 03',
    subCityAm: 'ቦሌ ክፍለ ከተማ፣ ወረዳ 03',
    buildingEn: 'Edna Mall / Medhanialem Commercial Center, 3rd Floor, Suite 304',
    buildingAm: 'ኤድና ሞል / መድሃኒዓለም የገበያ ማዕከል፣ 3ኛ ፎቅ፣ ቢሮ ቁጥር 304',
    workingHoursEn: 'Mon - Sat: 8:30 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM',
    workingHoursAm: 'ከሰኞ - ቅዳሜ፡ ከጠዋቱ 2:30 - ከምሽቱ 2:00 | እሁድ፡ ከጠዋቱ 4:00 - ከቀኑ 11:00'
  }
};

/**
 * Official Kasma Bank Accounts for Manual Bank Wire & Telebirr Transfer
 */
export const KASMA_BANK_ACCOUNTS = [
  {
    id: 'CBE',
    nameEn: 'Commercial Bank of Ethiopia (CBE)',
    nameAm: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
    account: '1000 1234 56789',
    holder: 'Kasma Tech Shop Enterprise PLC',
    badge: 'Fastest Local Clear'
  },
  {
    id: 'TELEBIRR',
    nameEn: 'Telebirr SuperApp / Wallet',
    nameAm: 'ቴሌብር (Telebirr)',
    account: '0911 223 344',
    holder: 'Kasma Tech Shop Enterprise',
    badge: 'Instant Verification'
  },
  {
    id: 'AWASH',
    nameEn: 'Awash Bank',
    nameAm: 'አዋሽ ባንክ (Awash Bank)',
    account: '0130 4567 89012',
    holder: 'Kasma Tech Shop Enterprise PLC',
    badge: 'Direct Wire'
  }
];

/**
 * Returns a direct WhatsApp chat URL pre-filled with customer support message
 */
export const getWhatsAppDirectUrl = (text: string = ''): string => {
  const cleanPhone = KASMA_CONTACTS.whatsappNumber.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

/**
 * Returns a direct Telegram URL (either support chat or URL sharing)
 */
export const getTelegramSupportUrl = (text: string = ''): string => {
  const username = KASMA_CONTACTS.telegramSupportUsername.replace(/^@/, '');
  if (text) {
    return `https://t.me/${username}?start=${encodeURIComponent(text.slice(0, 60))}`;
  }
  return `https://t.me/${username}`;
};

/**
 * Returns a direct Telegram Mini App deep-link (opens this app directly inside Telegram)
 */
export const getTelegramMiniAppDirectUrl = (startParam?: string): string => {
  const botUsername = KASMA_CONTACTS.telegramBotUsername.replace(/^@/, '');
  const appName = KASMA_CONTACTS.telegramMiniAppShortName;
  if (startParam) {
    return `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(startParam)}`;
  }
  return `https://t.me/${botUsername}/${appName}`;
};


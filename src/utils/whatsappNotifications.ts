/**
 * Kasma Shop - WhatsApp Low Stock Notification Engine
 * Utility for formatting and dispatching automated low-stock alerts to merchants, admins, or suppliers via WhatsApp.
 */

export interface LowStockItemInfo {
  productName: string;
  sku: string;
  onHand: number;
  threshold: number;
  storeName?: string;
  merchantPhone?: string;
  category?: string;
}

/**
 * Format a phone number for WhatsApp wa.me link
 * Strips +, spaces, dashes, and ensures international format (defaults to Ethiopia +251 if leading 0)
 */
export const formatPhoneForWhatsApp = (rawPhone?: string): string => {
  if (!rawPhone) return '251911223344'; // Default Kasma Sales / Restock hotline
  let cleaned = rawPhone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.substring(1);
  }
  return cleaned.length > 0 ? cleaned : '251911223344';
};

/**
 * Generate a WhatsApp deep-link URL for a single low stock SKU alert
 */
export const generateWhatsAppLowStockUrl = (
  item: LowStockItemInfo,
  recipientPhone?: string,
  language: 'en' | 'am' = 'en'
): string => {
  const phone = formatPhoneForWhatsApp(recipientPhone || item.merchantPhone);

  const text = language === 'en'
    ? `🚨 *KASMA SHOP - LOW STOCK ALERT* 🚨\n\n` +
      `🏬 *Store:* ${item.storeName || 'Kasma Merchant Partner'}\n` +
      `📦 *Product:* ${item.productName}\n` +
      `🏷️ *SKU Code:* ${item.sku}\n` +
      `📊 *Current Stock:* ${item.onHand} pcs\n` +
      `⚠️ *Min. Threshold:* ${item.threshold} pcs\n\n` +
      `Urgent action required: Quantity has dipped below safety levels. Please confirm restock dispatch.\n\n` +
      `🌐 *Managed via Kasma Inventory Engine*`
    : `🚨 *ካስማ ሾፕ - ዝቅተኛ የአክሲዮን ማስጠንቀቂያ* 🚨\n\n` +
      `🏬 *መደብር:* ${item.storeName || 'የካስማ ነጋዴ'}\n` +
      `📦 *ምርት:* ${item.productName}\n` +
      `🏷️ *SKU ኮድ:* ${item.sku}\n` +
      `📊 *አሁን ያለው ክምችት:* ${item.onHand} ፍሬ\n` +
      `⚠️ *አነስተኛ ገደብ:* ${item.threshold} ፍሬ\n\n` +
      `አስቸኳይ እርምጃ፡ የክምችት መጠን ከደህንነት ገደብ በታች ወርዷል። እባክዎ ተጨማሪ ክምችት ያዝዙ።\n\n` +
      `🌐 *በካስማ መቆጣጠሪያ የተላከ*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

/**
 * Generate a WhatsApp deep-link URL for a bulk low stock summary report
 */
export const generateBulkWhatsAppLowStockUrl = (
  items: LowStockItemInfo[],
  storeName: string = 'Kasma Partner Store',
  recipientPhone?: string,
  language: 'en' | 'am' = 'en'
): string => {
  const phone = formatPhoneForWhatsApp(recipientPhone);
  const nowStr = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemListFormatted = items.slice(0, 15).map((it, idx) => 
    `${idx + 1}. *${it.productName}* (${it.sku})\n` +
    `   • On Hand: *${it.onHand} pcs* (Threshold: ${it.threshold})`
  ).join('\n\n');

  const overflowNote = items.length > 15 ? `\n\n_...and ${items.length - 15} more low stock SKUs._` : '';

  const text = language === 'en'
    ? `🚨 *KASMA SHOP - BULK LOW STOCK REPORT* 🚨\n` +
      `🏬 *Store:* ${storeName}\n` +
      `📅 *Date:* ${nowStr}\n\n` +
      `Below are the ${items.length} SKU(s) currently below safety inventory threshold:\n\n` +
      `${itemListFormatted}${overflowNote}\n\n` +
      `⚠️ Please initiate supplier restock dispatch for the listed items.\n\n` +
      `📱 *Kasma Inventory Management Engine*`
    : `🚨 *ካስማ ሾፕ - የአክሲዮን እጥረት ሪፖርት* 🚨\n` +
      `🏬 *መደብር:* ${storeName}\n` +
      `📅 *ቀን:* ${nowStr}\n\n` +
      `ዝቅተኛ የክምችት መጠን ያላቸው ${items.length} እቃዎች ዝርዝር:\n\n` +
      `${itemListFormatted}${overflowNote}\n\n` +
      `⚠️ እባክዎ ለተዘረዘሩት እቃዎች አቅርቦት ይላኩ።\n\n` +
      `📱 *ካስማ መቆጣጠሪያ ስርዓት*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

/**
 * Dispatch low stock alert via WhatsApp (opens in new browser tab)
 */
export const dispatchWhatsAppLowStockAlert = (
  item: LowStockItemInfo,
  recipientPhone?: string,
  language: 'en' | 'am' = 'en'
): void => {
  const url = generateWhatsAppLowStockUrl(item, recipientPhone, language);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Dispatch bulk low stock report via WhatsApp (opens in new browser tab)
 */
export const dispatchBulkWhatsAppLowStockAlert = (
  items: LowStockItemInfo[],
  storeName: string = 'Kasma Partner Store',
  recipientPhone?: string,
  language: 'en' | 'am' = 'en'
): void => {
  if (items.length === 0) return;
  const url = generateBulkWhatsAppLowStockUrl(items, storeName, recipientPhone, language);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Generate a WhatsApp deep-link URL pre-populated with active shopping cart items for automated welcome messaging
 */
export const generateWhatsAppCustomerWelcomeUrl = (
  cart: Array<{ product?: { nameEn: string; nameAm: string; price: number }; variant?: { name: string; sku: string; priceOffset: number }; quantity: number; price?: number }> = [],
  language: 'en' | 'am' = 'en',
  recipientPhone: string = '251911223344',
  customContext?: string
): string => {
  const phone = formatPhoneForWhatsApp(recipientPhone);

  if (cart && cart.length > 0) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalETB = cart.reduce((sum, item) => {
      const itemPrice = item.price ?? ((item.product?.price ?? 0) + (item.variant?.priceOffset ?? 0));
      return sum + (itemPrice * item.quantity);
    }, 0);

    const itemListFormatted = cart.map((item, idx) => {
      const pName = language === 'en' ? (item.product?.nameEn || 'Product') : (item.product?.nameAm || 'ምርት');
      const vName = item.variant?.name || 'Standard';
      const sku = item.variant?.sku || 'SKU';
      const unitPrice = item.price ?? ((item.product?.price ?? 0) + (item.variant?.priceOffset ?? 0));
      const lineTotal = unitPrice * item.quantity;

      return `${idx + 1}. *${pName}*\n` +
             `   • ${language === 'en' ? 'Option' : 'አማራጭ'}: ${vName} (${sku})\n` +
             `   • ${language === 'en' ? 'Qty' : 'ብዛት'}: ${item.quantity} x ${unitPrice.toLocaleString()} ETB = *${lineTotal.toLocaleString()} ETB*`;
    }).join('\n\n');

    const contextPrefix = customContext ? `[${customContext}]\n\n` : '';

    const text = language === 'en'
      ? `👋 *Welcome to Kasma Customer Support!*\n\n` +
        `${contextPrefix}Hello Kasma Team! I am reaching out from Kasma Shop. Here are the items currently in my active shopping cart (${totalCount} item${totalCount > 1 ? 's' : ''}):\n\n` +
        `${itemListFormatted}\n\n` +
        `💰 *Estimated Total:* *${totalETB.toLocaleString()} ETB*\n\n` +
        `I would like assistance with item availability, delivery options, or completing my order. Thank you!`
      : `👋 *እንኳን ወደ ካስማ ደንበኞች ድጋፍ በደህና መጡ!*\n\n` +
        `${contextPrefix}ሰላም የካስማ ቡድን! በካስማ ሾፕ ላይ በጋሪዬ የያዝኳቸው ${totalCount} እቃዎች ዝርዝር የሚከተለው ነው:\n\n` +
        `${itemListFormatted}\n\n` +
        `💰 *ጠቅላላ የጋሪ ዋጋ:* *${totalETB.toLocaleString()} ETB*\n\n` +
        `እባክዎ የምርቶቹን መኖር፣ የማድረሻ ሁኔታ ወይም የክፍያ ሂደቱን እንድጨርስ ይረዱኝ። አመሰግናለሁ!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  } else {
    const text = language === 'en'
      ? `👋 *Welcome to Kasma Customer Support!*\n\n` +
        `Hello Kasma Sales & Support Team! I'm browsing Kasma Shop and would like to ask a question regarding your products, prices, or delivery services. Thank you!`
      : `👋 *እንኳን ወደ ካስማ ደንበኞች ድጋፍ በደህና መጡ!*\n\n` +
        `ሰላም የካስማ የሽያጭ እና ድጋፍ ቡድን! በካስማ ሾፕ እየጎበኘሁ ነው፤ ስለ እቃዎች፣ ዋጋዎች ወይም የማድረሻ አገልግሎቶች መጠየቅ እፈልጋለሁ። አመሰግናለሁ!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
};

/**
 * Open WhatsApp customer support welcome link directly in new tab
 */
export const dispatchWhatsAppCustomerWelcome = (
  cart: Array<{ product?: { nameEn: string; nameAm: string; price: number }; variant?: { name: string; sku: string; priceOffset: number }; quantity: number; price?: number }> = [],
  language: 'en' | 'am' = 'en',
  recipientPhone: string = '251911223344',
  customContext?: string
): void => {
  const url = generateWhatsAppCustomerWelcomeUrl(cart, language, recipientPhone, customContext);
  window.open(url, '_blank', 'noopener,noreferrer');
};

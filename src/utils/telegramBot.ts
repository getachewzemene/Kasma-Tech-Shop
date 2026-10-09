import { Order, Product, TelegramUserSettings, TelegramMessageLog } from '../types';

const STORAGE_KEY_SETTINGS = 'kasma_telegram_settings';
const STORAGE_KEY_LOGS = 'kasma_telegram_logs';

export const DEFAULT_TELEGRAM_SETTINGS: TelegramUserSettings = {
  isConnected: true,
  telegramUsername: '@ethio_shopper',
  chatId: '849201948',
  pairingCode: 'KASMA-7829',
  orderConfirmations: true,
  shippingUpdates: true,
  priceDropAlerts: true,
  telegramDeals: true,
  lowStockAlerts: true,
  lowStockThreshold: 3,
  botToken: '',
};

export function getTelegramSettings(): TelegramUserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_TELEGRAM_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load Telegram settings from storage', e);
  }
  return DEFAULT_TELEGRAM_SETTINGS;
}

export function saveTelegramSettings(settings: TelegramUserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save Telegram settings to storage', e);
  }
}

export function generateNewPairingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `KASMA-${num}`;
}

export function getTelegramLogs(): TelegramMessageLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load Telegram logs', e);
  }
  // Initial seed logs for a rich interactive demo experience
  const initialLogs: TelegramMessageLog[] = [
    {
      id: 'log-1',
      type: 'ORDER_CONFIRMATION',
      title: '📦 Order Confirmation #ORD-8921',
      formattedText: `<b>🎉 KASMA SHOP - ORDER CONFIRMED!</b>\n\n<b>Order ID:</b> #ORD-8921\n<b>Customer:</b> Getachew Zeleke (@ethio_shopper)\n<b>Total Amount:</b> ETB 45,900.00\n<b>Payment:</b> Telebirr (Verified ✅)\n\n<b>Items:</b>\n• Samsung Galaxy S24 Ultra (x1) - ETB 45,000\n• Kasma Armor Shield Case (x1) - ETB 900\n\n<b>Delivery Address:</b> Bole Subcity, Woreda 03, Addis Ababa\n<b>ETA:</b> Today by 5:30 PM`,
      buttons: [
        { label: '📦 Track Package', actionUrl: '#/orders' },
        { label: '📄 Invoice PDF', actionUrl: '#/invoice' }
      ],
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED'
    },
    {
      id: 'log-2',
      type: 'SHIPPING_UPDATE',
      title: '🚚 Shipping Dispatch Update',
      formattedText: `<b>🚚 LIVE DISPATCH ALERT</b>\n\nOrder <b>#ORD-8921</b> has been handed over to Express Courier!\n\n<b>Status:</b> IN TRANSIT 📦\n<b>Courier:</b> Abebe K. (📞 +251911002233)\n<b>Current Zone:</b> Ring Road Expressway, Bole\n<b>Estimated Arrival:</b> 25-35 minutes`,
      buttons: [
        { label: '📍 View Courier Map', actionUrl: '#/track' },
        { label: '💬 Call Driver', actionUrl: 'tel:+251911002233' }
      ],
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED'
    }
  ];
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(initialLogs));
  } catch (e) {}
  return initialLogs;
}

export function addTelegramLog(log: Omit<TelegramMessageLog, 'id' | 'timestamp' | 'status'>): TelegramMessageLog {
  const current = getTelegramLogs();
  const newLog: TelegramMessageLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'DELIVERED'
  };
  const updated = [newLog, ...current].slice(0, 30); // Keep last 30 logs
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist Telegram log', e);
  }
  return newLog;
}

export async function dispatchTelegramNotification(
  title: string,
  formattedText: string,
  type: TelegramMessageLog['type'],
  buttons?: { label: string; actionUrl?: string; actionType?: string }[]
): Promise<{ success: boolean; simulated: boolean }> {
  const settings = getTelegramSettings();
  
  // Always log to local interactive feed
  addTelegramLog({
    type,
    title,
    formattedText,
    buttons
  });

  // If real Bot Token and Chat ID are configured, perform real Telegram Bot API call
  if (settings.botToken && settings.chatId && settings.botToken.length > 10) {
    try {
      const inlineKeyboard = buttons?.map(b => [{ text: b.label, url: b.actionUrl || 'https://t.me/KasmaShopBot' }]);
      const res = await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.chatId,
          text: `${title}\n\n${formattedText.replace(/<[^>]*>?/gm, '')}`,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard ? { inline_keyboard: inlineKeyboard } : undefined
        })
      });
      if (res.ok) {
        return { success: true, simulated: false };
      }
    } catch (err) {
      console.warn('Real Telegram Bot API dispatch failed, falling back to simulation mode:', err);
    }
  }

  return { success: true, simulated: true };
}

export async function sendTelegramOrderConfirmation(
  order: Order,
  language: 'en' | 'am' = 'en'
): Promise<{ success: boolean; message: string }> {
  const settings = getTelegramSettings();
  if (!settings.isConnected || !settings.orderConfirmations) {
    return { success: false, message: 'Telegram order notifications are currently disabled.' };
  }

  const isEn = language === 'en';
  const title = isEn ? `📦 Order Confirmed #${order.id}` : `📦 ትዕዛዝ ተረጋግጧል #${order.id}`;

  const itemsList = order.items
    .map(i => `• ${i.product[isEn ? 'nameEn' : 'nameAm']} (${i.variantName}) x${i.quantity} - ETB ${i.price.toLocaleString()}`)
    .join('\n');

  const text = isEn 
    ? `<b>🎉 KASMA SHOP - ORDER CONFIRMED</b>\n\n<b>Order ID:</b> #${order.id}\n<b>Customer:</b> ${order.customerName} (${settings.telegramUsername || order.customerPhone})\n<b>Payment Method:</b> ${order.paymentMethod}\n<b>Total Paid:</b> ETB ${order.total.toLocaleString()}\n\n<b>Purchased Items:</b>\n${itemsList}\n\n<b>Delivery Address:</b> ${order.shippingAddress}\n<b>Estimated Delivery:</b> Within 24 Hours`
    : `<b>🎉 ካስማ ሾፕ - ትዕዛዝዎ ተረጋግጧል</b>\n\n<b>የትዕዛዝ ቁጥር:</b> #${order.id}\n<b>ደንበኛ:</b> ${order.customerName}\n<b>ክፍያ ዓይነት:</b> ${order.paymentMethod}\n<b>ጠቅላላ ክፍያ:</b> ETB ${order.total.toLocaleString()}\n\n<b>የተገዙ እቃዎች:</b>\n${itemsList}\n\n<b>የማድረሻ አድራሻ:</b> ${order.shippingAddress}`;

  await dispatchTelegramNotification(
    title,
    text,
    'ORDER_CONFIRMATION',
    [
      { label: isEn ? '📦 Track Order' : '📦 ትዕዛዝ ተከታተል', actionUrl: '#/orders' },
      { label: isEn ? '💬 Support Bot' : '💬 ድጋፍ ለማግኘት', actionUrl: `https://t.me/KasmaShopBot` }
    ]
  );

  return { 
    success: true, 
    message: isEn 
      ? `Order confirmation sent to Telegram (${settings.telegramUsername || settings.chatId})` 
      : `የትዕዛዝ ማረጋገጫ ወደ ቴሌግራም ተልኳል` 
  };
}

export async function sendTelegramShippingUpdate(
  orderId: string,
  newStatus: Order['status'],
  customerName: string = 'Valued Customer',
  address: string = 'Addis Ababa',
  language: 'en' | 'am' = 'en',
  targetChatId?: string,
  orderItems?: { name: string; quantity: number; price: number }[]
): Promise<{ success: boolean; message: string }> {
  const settings = getTelegramSettings();
  if (!settings.isConnected || !settings.shippingUpdates) {
    return { success: false, message: 'Shipping updates are disabled in Telegram settings.' };
  }

  const isEn = language === 'en';
  let statusEmoji = '🛍️';
  let statusTextEn = 'NEW ORDER CONFIRMED';
  let statusTextAm = 'አዲስ ትዕዛዝ ተረጋግጧል';
  let detailMessage = 'A new customer order was placed and confirmed for store fulfillment.';

  if (newStatus === 'SHIPPED') {
    statusEmoji = '🚚';
    statusTextEn = 'DISPATCHED & EN ROUTE';
    statusTextAm = 'ተልኳል';
    detailMessage = 'Order has been handed to express courier. Driver is currently on route to customer destination.';
  } else if (newStatus === 'DELIVERED') {
    statusEmoji = '✅';
    statusTextEn = 'DELIVERED SUCCESSFULLY';
    statusTextAm = 'ደረሰ';
    detailMessage = 'Package delivered and signed by customer. Settlement released to merchant balance.';
  } else if (newStatus === 'CANCELLED') {
    statusEmoji = '❌';
    statusTextEn = 'ORDER CANCELLED';
    statusTextAm = 'ተሰርዟል';
    detailMessage = 'Order was cancelled. Any reserved stock has been restored to merchant inventory.';
  } else if (newStatus === 'PENDING_PAYMENT' || newStatus === 'PAID' || newStatus === 'PROCESSING') {
    statusEmoji = '🛍️';
    statusTextEn = 'REAL-TIME ORDER CONFIRMATION';
    statusTextAm = 'የእውነተኛ ጊዜ ትዕዛዝ ማረጋገጫ';
    detailMessage = 'New customer order placed! Real-time notification dispatched to merchant Telegram channel.';
  }

  const itemsListText = orderItems && orderItems.length > 0
    ? `\n<b>Ordered Items:</b>\n` + orderItems.map(i => `• ${i.name} (x${i.quantity}) @ ETB ${i.price.toLocaleString()}`).join('\n') + `\n`
    : '';

  const title = `${statusEmoji} Order #${orderId} - ${statusTextEn}`;
  const text = isEn
    ? `<b>${statusEmoji} KASMA MERCHANT TELEGRAM NOTIFICATION</b>\n\n<b>Order ID:</b> #${orderId}\n<b>Status:</b> <b>${statusTextEn}</b>\n<b>Customer:</b> ${customerName}\n<b>Destination:</b> ${address}${itemsListText}\n<b>Update Note:</b> ${detailMessage}\n<b>Timestamp:</b> ${new Date().toLocaleString()}`
    : `<b>${statusEmoji} የካስማ ነጋዴ ቴሌግራም ማሳወቂያ</b>\n\n<b>የትዕዛዝ ቁጥር:</b> #${orderId}\n<b>ሁኔታ:</b> <b>${statusTextAm}</b>\n<b>ደንበኛ:</b> ${customerName}\n<b>መድረሻ:</b> ${address}${itemsListText}\n<b>መረጃ:</b> ${detailMessage}`;

  // Dispatch to system log stream / bot
  await dispatchTelegramNotification(
    title,
    text,
    'SHIPPING_UPDATE',
    [
      { label: isEn ? '📦 View Order' : '📦 ትዕዛዝ ተከታተል', actionUrl: '#/orders' },
      { label: isEn ? '📍 Courier Map' : '📍 መከታተያ', actionUrl: '#/track' }
    ]
  );

  // If a specific merchant private channel ID is provided, send direct HTTP API request
  if (targetChatId || settings.chatId) {
    const destChat = targetChatId || settings.chatId;
    if (settings.botToken && settings.botToken.length > 10) {
      try {
        await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: destChat,
            text: `${title}\n\n${text.replace(/<[^>]*>?/gm, '')}`,
            parse_mode: 'HTML'
          })
        });
      } catch (err) {
        console.warn('Failed direct Telegram API send to channel:', err);
      }
    }
  }

  return { success: true, message: `Telegram notification dispatched for Order #${orderId}` };
}

export async function sendStoreOwnerTelegramNotification(
  order: Order,
  channelId?: string,
  language: 'en' | 'am' = 'en'
): Promise<{ success: boolean; message: string }> {
  const settings = getTelegramSettings();
  const targetChannel = channelId || settings.chatId || '849201948';
  const isEn = language === 'en';

  const itemsList = order.items
    .map(i => `• ${i.product[isEn ? 'nameEn' : 'nameAm']} (${i.variantName || 'Standard'}) x${i.quantity} @ ETB ${i.price.toLocaleString()} = ETB ${(i.quantity * i.price).toLocaleString()}`)
    .join('\n');

  const title = `🛍️ NEW ORDER ALERT FOR STORE OWNER #${order.id}`;
  const formattedText = isEn
    ? `<b>🛍️ STORE OWNER NOTIFICATION - NEW ORDER PLACED</b>\n\n` +
      `<b>Order ID:</b> #${order.id}\n` +
      `<b>Customer Name:</b> ${order.customerName}\n` +
      `<b>Customer Phone:</b> ${order.customerPhone}\n` +
      `<b>Delivery Address:</b> 📍 ${order.shippingAddress}\n` +
      `<b>Payment Method:</b> ${order.paymentMethod}\n\n` +
      `<b>PURCHASED ITEMS:</b>\n${itemsList}\n\n` +
      `<b>ORDER TOTAL:</b> 💰 <b>ETB ${order.total.toLocaleString()}</b>\n` +
      `<b>Timestamp:</b> ${new Date().toLocaleString()}`
    : `<b>🛍️ የሱቅ ባለቤት ማሳወቂያ - አዲስ ትዕዛዝ ደርሷል</b>\n\n` +
      `<b>የትዕዛዝ ቁጥር:</b> #${order.id}\n` +
      `<b>የደንበኛ ስም:</b> ${order.customerName}\n` +
      `<b>ስልክ ቁጥር:</b> ${order.customerPhone}\n` +
      `<b>ማድረሻ አድራሻ:</b> 📍 ${order.shippingAddress}\n` +
      `<b>የክፍያ መንገድ:</b> ${order.paymentMethod}\n\n` +
      `<b>የተገዙ እቃዎች:</b>\n${itemsList}\n\n` +
      `<b>ጠቅላላ сумма:</b> 💰 <b>ETB ${order.total.toLocaleString()}</b>\n` +
      `<b>ጊዜ:</b> ${new Date().toLocaleString()}`;

  // Log to local interactive feed
  await dispatchTelegramNotification(
    title,
    formattedText,
    'ORDER_CONFIRMATION',
    [
      { label: isEn ? '📦 Manage Order' : '📦 ትዕዛዝ አስተዳድር', actionUrl: '#/merchant' },
      { label: isEn ? '📍 View Delivery' : '📍 አድራሻ ተመልከት', actionUrl: '#/track' }
    ]
  );

  // Send direct Telegram Bot API HTTP request to owner's channel
  if (settings.botToken && settings.botToken.length > 10 && targetChannel) {
    try {
      await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChannel,
          text: `${title}\n\n${formattedText.replace(/<[^>]*>?/gm, '')}`,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.warn('Failed to dispatch store owner Telegram alert via API:', err);
    }
  }

  return {
    success: true,
    message: `Formatted store owner notification sent to channel ${targetChannel} for Order #${order.id}`
  };
}

export const sendTelegramStoreOwnerOrderAlert = sendStoreOwnerTelegramNotification;

export async function sendTelegramLowStockAlert(
  product: Product,
  variant: { sku: string; name: string; onHand: number },
  threshold: number = 3,
  merchantStoreName: string = 'Kasma Merchant',
  language: 'en' | 'am' = 'en'
): Promise<{ success: boolean; message: string }> {
  const isEn = language === 'en';
  const isOutOfStock = variant.onHand <= 0;
  const emoji = isOutOfStock ? '🚨' : '⚠️';
  const title = isEn 
    ? `${emoji} INVENTORY ALERT: ${variant.sku}` 
    : `${emoji} የክምችት ማሳወቂያ: ${variant.sku}`;

  const formattedText = isEn
    ? `<b>${emoji} INVENTORY ALERT — ${merchantStoreName.toUpperCase()}</b>\n\n` +
      `<b>Product:</b> ${product.nameEn}\n` +
      `<b>Variant:</b> ${variant.name} (<code>${variant.sku}</code>)\n` +
      `<b>Status:</b> ${isOutOfStock ? '<b>OUT OF STOCK</b> ❌' : `<b>CRITICAL LOW STOCK</b> (Only <b>${variant.onHand}</b> left)`}\n` +
      `<b>Threshold:</b> ${threshold} units\n` +
      `<b>Price:</b> ETB ${product.price.toLocaleString()}\n\n` +
      `<i>Immediate restock recommended to prevent checkout failures on Kasma.</i>`
    : `<b>${emoji} የክምችት ማሳወቂያ — ${merchantStoreName}</b>\n\n` +
      `<b>እቃ:</b> ${product.nameAm}\n` +
      `<b>አይነት:</b> ${variant.name} (<code>${variant.sku}</code>)\n` +
      `<b>ቀሪ መጠን:</b> <b>${variant.onHand} ብቻ</b>\n` +
      `<b>ዝቅተኛ ገደብ:</b> ${threshold}\n\n` +
      `<i>እባክዎ እቃውን በፍጥነት ይሙሉ!</i>`;

  await dispatchTelegramNotification(
    title,
    formattedText,
    isOutOfStock ? 'OUT_OF_STOCK' : 'LOW_STOCK',
    [
      { label: isEn ? '⚡ Quick Restock' : '⚡ ክምችት ጨምር', actionUrl: '#/merchant' },
      { label: isEn ? '📦 Product Page' : '📦 የምርት ገፅ', actionUrl: `#/product/${product.id}` }
    ]
  );

  return {
    success: true,
    message: isEn ? `Low-stock Telegram alert dispatched for SKU ${variant.sku}` : `የቴሌግራም ዝቅተኛ ክምችት ማሳወቂያ ተልኳል`
  };
}

export async function sendTelegramTestAlert(type: 'ORDER' | 'SHIPPING' | 'PRICE' | 'LOW_STOCK', language: 'en' | 'am' = 'en'): Promise<void> {
  const isEn = language === 'en';
  if (type === 'ORDER') {
    await dispatchTelegramNotification(
      isEn ? '📦 TEST: Order Confirmation #ORD-TEST99' : '📦 ሙከራ: የትዕዛዝ ማረጋገጫ',
      isEn 
        ? '<b>🎉 TEST TELEGRAM ORDER NOTIFICATION</b>\n\nThis is a simulated instant Telegram order confirmation message from @KasmaShopBot!\n\n<b>Order ID:</b> #ORD-TEST99\n<b>Status:</b> VERIFIED ✅\n<b>Total:</b> ETB 12,500'
        : '<b>🎉 የቴሌግራም የሙከራ መልዕክት</b>\n\nይህ ከካስማ ሾፕ የተላከ የሙከራ ማረጋገጫ መልዕክት ነው!',
      'ORDER_CONFIRMATION',
      [{ label: '📦 View Order', actionUrl: '#/orders' }]
    );
  } else if (type === 'SHIPPING') {
    await dispatchTelegramNotification(
      isEn ? '🚚 TEST: Live Courier Update #ORD-TEST99' : '🚚 ሙከራ: የትራንስፖርት መረጃ',
      isEn 
        ? '<b>🚚 TEST SHIPPING DISPATCH ALERT</b>\n\nYour test order is currently in transit with Express Courier.\n<b>Location:</b> Kazanchis Grand Palace, Addis Ababa\n<b>ETA:</b> 15 Minutes'
        : '<b>🚚 የትራንስፖርት የሙከራ መልዕክት</b>\n\nእቃዎ በመንገድ ላይ ይገኛል!',
      'SHIPPING_UPDATE',
      [{ label: '📍 Courier GPS', actionUrl: '#/track' }]
    );
  } else if (type === 'LOW_STOCK') {
    await dispatchTelegramNotification(
      isEn ? '⚠️ TEST: Inventory Low-Stock Alert' : '⚠️ ሙከራ: ዝቅተኛ የክምችት ማሳወቂያ',
      isEn
        ? '<b>⚠️ CRITICAL LOW STOCK ALERT!</b>\n\nYour store inventory is running low for high-velocity items!\n\n<b>Product:</b> Apple MacBook Pro 16" M3 Max\n<b>SKU:</b> MBP16-M3M-SLV\n<b>Remaining Units:</b> <b>1 unit left!</b>\n<b>Threshold:</b> 3 units\n\n<i>Restock promptly via the Merchant Portal.</i>'
        : '<b>⚠️ ዝቅተኛ የክምችት ማሳወቂያ!</b>\n\nበመደብርዎ ውስጥ ያለው እቃ ሊያልቅ ተቃርቧል!\n\n<b>እቃ:</b> አፕል ማክቡክ ፕሮ 16"\n<b>ቀሪ መጠን:</b> 1 ብቻ\n<b>ዝቅተኛ ገደብ:</b> 3',
      'LOW_STOCK',
      [
        { label: isEn ? '⚡ Restock in Portal' : '⚡ ክምችት ጨምር', actionUrl: '#/merchant' },
        { label: isEn ? '📦 View Catalog' : '📦 ካታሎግ እይ', actionUrl: '#/merchant' }
      ]
    );
  } else {
    await dispatchTelegramNotification(
      isEn ? '🏷️ TEST: Price Drop Alert' : '🏷️ ሙከራ: የዋጋ ቅናሽ',
      isEn
        ? '<b>🔥 PRICE DROP ALERT!</b>\n\nAn item on your wishlist just dropped in price by <b>20%</b>!\n\n<b>Product:</b> Mac M3 Pro 16"\n<b>Old Price:</b> ETB 180,000\n<b>New Price:</b> ETB 144,000 (Save ETB 36,000)'
        : '<b>🔥 የዋጋ ቅናሽ መልዕክት!</b>\n\nበምኞት ዝርዝርዎ ላይ ያለ እቃ የ20% ቅናሽ አድርጓል!',
      'PRICE_DROP',
      [{ label: '🛒 Buy Now', actionUrl: '#/' }]
    );
  }
}

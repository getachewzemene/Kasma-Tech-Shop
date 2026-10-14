import { Order, Product, Variant } from '../types';

export interface TelegramInlineButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface SendTelegramMessageParams {
  chatId?: string;
  text: string;
  parseMode?: 'HTML' | 'MarkdownV2';
  buttons?: TelegramInlineButton[][];
}

export interface TelegramDispatchResult {
  success: boolean;
  delivered: boolean;
  messageId?: number;
  error?: string;
  simulated?: boolean;
}

/**
 * Sends a real message to Telegram via the Telegram Bot API (https://api.telegram.org/bot<TOKEN>/sendMessage).
 * If TELEGRAM_BOT_TOKEN or chatId is omitted, it gracefully records the notification as simulated.
 */
export async function sendTelegramMessage(params: SendTelegramMessageParams): Promise<TelegramDispatchResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const defaultChatId = process.env.TELEGRAM_CHAT_ID || '849201948';
  const targetChatId = params.chatId || defaultChatId;

  if (!token || token.trim() === '' || token.startsWith('mock_')) {
    return {
      success: true,
      delivered: false,
      simulated: true,
      error: 'TELEGRAM_BOT_TOKEN not configured; dispatched to mock alert engine'
    };
  }

  try {
    const inlineKeyboard = params.buttons && params.buttons.length > 0 ? {
      inline_keyboard: params.buttons
    } : undefined;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s network timeout

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        chat_id: targetChatId,
        text: params.text,
        parse_mode: params.parseMode || 'HTML',
        reply_markup: inlineKeyboard,
        disable_web_page_preview: false
      })
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      console.warn(`[TELEGRAM API ERROR] Code ${response.status}:`, data.description || 'Unknown error');
      return {
        success: false,
        delivered: false,
        error: data.description || `HTTP ${response.status}`
      };
    }

    return {
      success: true,
      delivered: true,
      messageId: data.result?.message_id
    };
  } catch (err: any) {
    console.warn('[TELEGRAM DISPATCH EXCEPTION]', err.message);
    return {
      success: false,
      delivered: false,
      error: err.message
    };
  }
}

/**
 * Dispatches an order alert to Merchant and Admin upon new purchase
 * with instant inline action buttons: Accept Order, View Customer Location, Call Customer, View Tracking.
 */
export async function sendOrderAlertToTelegram(
  order: Order,
  merchantStoreName: string = 'Kasma Merchant',
  merchantChatId?: string,
  appUrl: string = process.env.APP_URL || 'http://localhost:3000'
): Promise<TelegramDispatchResult> {
  const isCOD = order.paymentMethod === 'COD';
  const paymentBadge = isCOD ? '💵 Cash on Delivery (COD)' : `💳 ${order.paymentMethod} (Prepaid Verified ✅)`;
  
  const itemsText = order.items
    .map(i => `  • <b>${i.product.nameEn}</b> (${i.variantName || 'Standard'}) x${i.quantity} — <code>${(i.price * i.quantity).toLocaleString()} ETB</code>`)
    .join('\n');

  const trackingLink = `${appUrl}/tracking/${order.id}`;
  const merchantPortalLink = `${appUrl}/merchant?orderId=${order.id}&tab=ORDERS`;
  const courierPortalLink = `${appUrl}/courier/${order.id}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shippingAddress}, Addis Ababa, Ethiopia`)}`;
  const cleanPhone = order.customerPhone.replace(/[\s\-\(\)]/g, '');

  const text = 
    `🛍️ <b>NEW ORDER ALERT — ${merchantStoreName.toUpperCase()}</b>\n\n` +
    `<b>Order ID:</b> <code>#${order.id}</code>\n` +
    `<b>Payment:</b> ${paymentBadge}\n` +
    `<b>Customer:</b> ${order.customerName} (📞 <code>${order.customerPhone}</code>)\n` +
    `<b>Destination:</b> 📍 ${order.shippingAddress}${order.subCity ? ` (${order.subCity})` : ''}\n` +
    (order.landmark ? `<b>Landmark:</b> 🏛️ ${order.landmark}\n` : '') +
    `\n<b>Items Ordered:</b>\n${itemsText}\n\n` +
    `<b>Subtotal:</b> ${order.subtotal.toLocaleString()} ETB\n` +
    `<b>Delivery Fee:</b> ${order.shippingFee.toLocaleString()} ETB\n` +
    `<b>Total:</b> <b>${order.total.toLocaleString()} ETB</b>\n\n` +
    `⚡ <i>Fulfillment SLA: Requires packing within 24 hours. Click "Accept Order" below to confirm.</i>`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: '⚡ Accept Order', url: merchantPortalLink },
      { text: '📍 View Customer Location', url: mapsLink }
    ],
    [
      { text: '🛵 Courier Dispatch', url: courierPortalLink },
      { text: `📞 Call (${cleanPhone})`, url: `tel:${cleanPhone}` }
    ],
    [
      { text: '📦 View Order Tracking', url: trackingLink }
    ]
  ];

  return await sendTelegramMessage({
    chatId: merchantChatId,
    text,
    parseMode: 'HTML',
    buttons
  });
}

export interface MerchantPickupLocationInfo {
  storeName?: string;
  phone?: string;
  subCity?: string;
  woreda?: string;
  building?: string;
  shopNumber?: string;
  landmark?: string;
  locationAddress?: string;
  pickupInstructions?: string;
  coordinates?: { lat: number; lng: number };
}

/**
 * Dispatches an automated Fleet / Dispatch Group Alert to Telegram
 * Alerting motorcycle & van couriers in Addis Ababa for fast delivery pickup
 * with the merchant's physical storefront GPS coordinates and navigation links.
 */
export async function sendDispatchGroupAlertToTelegram(
  order: Order,
  merchantStoreName: string = 'Kasma Partner Merchant',
  dispatchChatId?: string,
  appUrl: string = process.env.APP_URL || 'http://localhost:3000',
  pickupLocation?: MerchantPickupLocationInfo
): Promise<TelegramDispatchResult> {
  const isCOD = order.paymentMethod === 'COD';
  const paymentBadge = isCOD 
    ? `💵 Cash on Delivery (Collect: <b>${order.total.toLocaleString()} ETB</b>)`
    : `💳 Prepaid via ${order.paymentMethod} (✅ Do NOT collect cash)`;

  const itemsSummary = order.items
    .map(i => `  • ${i.product.nameEn} (x${i.quantity})`)
    .join('\n');

  const courierPortalLink = `${appUrl}/courier/${order.id}`;
  const cleanCustomerPhone = order.customerPhone.replace(/[\s\-\(\)]/g, '');
  const trackingLink = `${appUrl}/tracking/${order.id}`;

  const storeName = pickupLocation?.storeName || merchantStoreName;
  const storePhone = pickupLocation?.phone || '';
  const cleanStorePhone = storePhone.replace(/[\s\-\(\)]/g, '');

  const storeAddressParts = [
    pickupLocation?.building,
    pickupLocation?.shopNumber,
    pickupLocation?.subCity,
    pickupLocation?.woreda
  ].filter(Boolean);
  const storeAddress = storeAddressParts.length > 0
    ? storeAddressParts.join(', ')
    : (pickupLocation?.locationAddress || 'Bole, Addis Ababa');

  const storeGps = pickupLocation?.coordinates || order.dispatchPickupCoordinates || { lat: 8.9953, lng: 38.7885 };
  const storeGpsLink = `https://www.google.com/maps/dir/?api=1&destination=${storeGps.lat},${storeGps.lng}`;
  const customerMapsLink = order.coordinates 
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.coordinates.lat},${order.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shippingAddress}, Addis Ababa, Ethiopia`)}`;

  const text =
    `🛵 <b>⚡ KASMA FLEET DISPATCH PING — ADDIS ABABA</b>\n\n` +
    `<b>Order ID:</b> <code>#${order.id}</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏪 <b>STORE PICKUP STATION:</b>\n` +
    `• <b>Store:</b> 🏬 ${storeName}\n` +
    `• <b>Address:</b> 📍 ${storeAddress}\n` +
    (pickupLocation?.landmark ? `• <b>Store Landmark:</b> 🏛️ ${pickupLocation.landmark}\n` : '') +
    (storePhone ? `• <b>Store Phone:</b> 📞 <code>${storePhone}</code>\n` : '') +
    `• <b>Pickup GPS:</b> 🧭 <code>${storeGps.lat.toFixed(5)}° N, ${storeGps.lng.toFixed(5)}° E</code>\n` +
    (pickupLocation?.pickupInstructions ? `• <b>Pickup Note:</b> 📝 <i>${pickupLocation.pickupInstructions}</i>\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>CUSTOMER DROPOFF DESTINATION:</b>\n` +
    `• <b>Dropoff:</b> ${order.shippingAddress}${order.subCity ? ` (${order.subCity})` : ''}\n` +
    (order.landmark ? `• <b>Customer Landmark:</b> 🏛️ ${order.landmark}\n` : '') +
    `• <b>Customer:</b> ${order.customerName} (📞 <code>${order.customerPhone}</code>)\n` +
    `• <b>Payment Mode:</b> ${paymentBadge}\n` +
    `• <b>Courier Payout:</b> 🛵 <b>${(order.shippingFee || 150).toLocaleString()} ETB</b>\n\n` +
    `📦 <b>Package Items:</b>\n${itemsSummary}\n\n` +
    `⚡ <i>Target SLA: Collect from shop & deliver in 1 - 2 hours across Addis Ababa.</i>`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: '⚡ Accept Delivery Run', url: courierPortalLink },
      { text: '🗺️ Store Pickup GPS (ወደ ሱቁ)', url: storeGpsLink }
    ],
    [
      { text: '📍 Customer Dropoff (ወደ ደንበኛ)', url: customerMapsLink },
      ...(cleanStorePhone ? [{ text: `📞 Call Shop (${cleanStorePhone})`, url: `tel:${cleanStorePhone}` }] : [])
    ],
    [
      { text: `📞 Call Customer (${cleanCustomerPhone})`, url: `tel:${cleanCustomerPhone}` },
      { text: '🔍 Live Tracking', url: trackingLink }
    ]
  ];

  const targetGroupChatId = dispatchChatId || process.env.TELEGRAM_DISPATCH_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  return await sendTelegramMessage({
    chatId: targetGroupChatId,
    text,
    parseMode: 'HTML',
    buttons
  });
}

/**
 * Dispatches fulfillment state update (PACKED, SHIPPED, DELIVERED)
 */
export async function sendFulfillmentTelegramUpdate(
  order: Order,
  event: 'PACKED' | 'SHIPPED' | 'DELIVERED',
  courierInfo?: { name?: string; phone?: string; notes?: string },
  recipientChatId?: string,
  appUrl: string = process.env.APP_URL || 'http://localhost:3000'
): Promise<TelegramDispatchResult> {
  const trackingLink = `${appUrl}/tracking/${order.id}`;
  let emoji = '📦';
  let title = 'ORDER STATUS UPDATE';
  let note = '';

  if (event === 'PACKED') {
    emoji = '📦';
    title = 'ORDER PACKED & QUALITY VERIFIED';
    note = `Merchant has inspected serial numbers and packed Order #${order.id} in tamper-evident Kasma packaging. Awaiting courier handover.`;
  } else if (event === 'SHIPPED') {
    emoji = '🚚';
    title = 'ORDER DISPATCHED & OUT FOR DELIVERY';
    const courierStr = courierInfo?.name ? `\n<b>Courier:</b> ${courierInfo.name} ${courierInfo.phone ? `(📞 <code>${courierInfo.phone}</code>)` : ''}` : '';
    const courierNote = courierInfo?.notes ? `\n<b>Courier Notes:</b> ${courierInfo.notes}` : '';
    note = `Your package is on route to ${order.shippingAddress}!${courierStr}${courierNote}`;
  } else if (event === 'DELIVERED') {
    emoji = '✅';
    title = 'ORDER DELIVERED & COMPLETED';
    note = `Order #${order.id} was successfully delivered and accepted. Warranty coverage is now active. Thank you for shopping with Kasma Tech!`;
  }

  const text = 
    `${emoji} <b>${title}</b>\n\n` +
    `<b>Order ID:</b> <code>#${order.id}</code>\n` +
    `<b>Customer:</b> ${order.customerName}\n` +
    `<b>Status:</b> <b>${order.status}</b>\n` +
    `<b>Destination:</b> 📍 ${order.shippingAddress}\n\n` +
    `ℹ️ <i>${note}</i>\n\n` +
    `🕒 <i>Updated at: ${new Date().toLocaleString()}</i>`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: '📍 Live Tracking Page', url: trackingLink }
    ]
  ];

  if (courierInfo?.phone) {
    buttons.push([
      { text: `📞 Call Courier (${courierInfo.phone})`, url: `tel:${courierInfo.phone.replace(/\s+/g, '')}` }
    ]);
  }

  return await sendTelegramMessage({
    chatId: recipientChatId || order.customerId,
    text,
    parseMode: 'HTML',
    buttons
  });
}

/**
 * Dispatches an automated Low-Stock or Out-of-Stock alert to the Merchant via Telegram
 */
export async function sendLowStockAlertToTelegram(
  product: Product,
  variant: Variant,
  currentStock: number,
  threshold: number,
  merchantStoreName: string = 'Kasma Merchant',
  merchantChatId?: string,
  appUrl: string = process.env.APP_URL || 'http://localhost:3000'
): Promise<TelegramDispatchResult> {
  const isOutOfStock = currentStock <= 0;
  const emoji = isOutOfStock ? '🚨' : '⚠️';
  const statusBadge = isOutOfStock 
    ? '<b>OUT OF STOCK</b> ❌' 
    : `<b>CRITICAL LOW STOCK</b> (Only <b>${currentStock}</b> left)`;

  const merchantPortalLink = `${appUrl}/merchant`;
  const productCatalogLink = `${appUrl}/product/${product.id}`;

  const text = 
    `${emoji} <b>INVENTORY TELEGRAM ALERT — ${merchantStoreName.toUpperCase()}</b>\n\n` +
    `<b>Item:</b> <b>${product.nameEn}</b>\n` +
    `<b>Variant / SKU:</b> <code>${variant.sku}</code> (${variant.name})\n` +
    `<b>Status:</b> ${statusBadge}\n` +
    `<b>Current On-Hand:</b> <b>${currentStock} units</b>\n` +
    `<b>Alert Threshold:</b> ${threshold} units\n` +
    `<b>Retail Price:</b> ${(product.price + (variant.priceOffset || 0)).toLocaleString()} ETB\n\n` +
    (isOutOfStock 
      ? `<i>Immediate action required: Customers can no longer place orders for this item on Kasma. Please replenish stock or update listings immediately.</i>`
      : `<i>Notice: High conversion rate detected in Addis Ababa. Inventory is nearing depletion. Please restock soon to avoid lost sales.</i>`) +
    `\n\n🕒 <i>Alert timestamp: ${new Date().toLocaleString()}</i>`;

  const buttons: TelegramInlineButton[][] = [
    [
      { text: '⚡ Restock in Merchant Portal', url: merchantPortalLink },
      { text: '🔍 View on Kasma Shop', url: productCatalogLink }
    ]
  ];

  return await sendTelegramMessage({
    chatId: merchantChatId,
    text,
    parseMode: 'HTML',
    buttons
  });
}

import { relations } from 'drizzle-orm';
import { boolean, integer, json, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users Table (Linked to Firebase Auth UID / Phone)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or internal ID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').default('customer').notNull(), // 'customer' | 'merchant' | 'admin'
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Merchants Table
export const merchants = pgTable('merchants', {
  id: text('id').primaryKey(),
  storeName: text('store_name').notNull(),
  ownerName: text('owner_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  status: text('status').default('APPROVED').notNull(), // 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
  tier: text('tier').default('Verified Merchant').notNull(),
  rating: real('rating').default(5.0).notNull(),
  commissionRate: real('commission_rate').default(0.08).notNull(),
  totalSalesEtb: real('total_sales_etb').default(0).notNull(),
  pendingPayoutEtb: real('pending_payout_etb').default(0).notNull(),
  balance: real('balance').default(0).notNull(),
  passwordHash: text('password_hash'),
  kycStatus: text('kyc_status').default('APPROVED').notNull(), // 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'APPROVED'
  kycDocument: text('kyc_document'),
  telegramUsername: text('telegram_username'),
  telegramChatId: text('telegram_chat_id'),
  telegramNotificationsEnabled: boolean('telegram_notifications_enabled').default(true),
  payoutHistory: json('payout_history').$type<any[]>().default([]),
  payouts: json('payouts').$type<any[]>().default([]),
  kyc: json('kyc').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Products Table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  nameEn: text('name_en').notNull(),
  nameAm: text('name_am').notNull(),
  category: text('category').notNull(),
  priceEtb: real('price_etb').notNull(),
  brand: text('brand').notNull(),
  status: text('status').default('APPROVED').notNull(), // 'APPROVED' | 'PENDING' | 'REJECTED'
  inStock: boolean('in_stock').default(true).notNull(),
  rating: real('rating').default(4.8).notNull(),
  reviewsCount: integer('reviews_count').default(0).notNull(),
  merchantId: text('merchant_id').default('MERCH-001').notNull(),
  merchantName: text('merchant_name').default('Kasma Express Tech').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionAm: text('description_am').notNull(),
  image: text('image').notNull(),
  sku: text('sku').notNull(),
  reorderThreshold: integer('reorder_threshold').default(5).notNull(),
  condition: text('condition').default('SEALED').notNull(),
  conditionTextEn: text('condition_text_en').default('Factory Sealed'),
  conditionTextAm: text('condition_text_am').default('በፋብሪካው የታሸገ'),
  warrantyMonths: integer('warranty_months').default(12).notNull(),
  warrantyTextEn: text('warranty_text_en').default('12 Months Official Warranty'),
  warrantyTextAm: text('warranty_text_am').default('የ12 ወራት ኦፊሴላዊ ዋስትና'),
  specifications: json('specifications').$type<Record<string, string>>().default({}),
  variants: json('variants').$type<any[]>().default([]),
  reviews: json('reviews').$type<any[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Orders Table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id'),
  customerUid: text('customer_uid'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerCity: text('customer_city').default('Addis Ababa').notNull(),
  subCity: text('sub_city'),
  landmark: text('landmark'),
  shippingAddress: text('shipping_address').notNull(),
  items: json('items').$type<any[]>().notNull(),
  subtotal: real('subtotal').default(0).notNull(),
  shippingFee: real('shipping_fee').default(0).notNull(),
  totalAmountEtb: real('total_amount_etb').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'COD'
  paymentStatus: text('payment_status').default('COMPLETED').notNull(),
  orderStatus: text('order_status').default('PROCESSING').notNull(),
  txRef: text('tx_ref').notNull(),
  channel: text('channel').default('WEB').notNull(), // 'WEB' | 'TELEGRAM_MINI_APP' | 'MOBILE'
  discountCode: text('discount_code'),
  discountAmount: real('discount_amount').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Stock Movement Logs Table
export const stockLogs = pgTable('stock_logs', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  sku: text('sku').notNull(),
  change: integer('change').notNull(),
  previousQty: integer('previous_qty').notNull(),
  newQty: integer('new_qty').notNull(),
  reason: text('reason').notNull(),
  actor: text('actor').notNull(),
  timestamp: text('timestamp').notNull(),
});

// 6. Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  severity: text('severity').notNull(), // 'INFO' | 'WARNING' | 'CRITICAL'
  timestamp: text('timestamp').notNull(),
});

// 7. Telegram Alerts Table
export const telegramAlerts = pgTable('telegram_alerts', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  read: boolean('read').default(false).notNull(),
  orderId: text('order_id'),
  chatId: text('chat_id'),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one }) => ({
  merchant: one(merchants, {
    fields: [products.merchantId],
    references: [merchants.id],
  }),
}));

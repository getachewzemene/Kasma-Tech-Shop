import { relations } from 'drizzle-orm';
import { boolean, integer, json, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users Table (Linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('customer').notNull(), // 'customer' | 'merchant' | 'admin'
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
  payoutHistory: json('payout_history').$type<any[]>().default([]),
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
  specifications: json('specifications').$type<Record<string, string>>().default({}),
  variants: json('variants').$type<any[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Orders Table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customerUid: text('customer_uid'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerCity: text('customer_city').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  items: json('items').$type<any[]>().notNull(),
  totalAmountEtb: real('total_amount_etb').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'COD'
  paymentStatus: text('payment_status').default('COMPLETED').notNull(),
  orderStatus: text('order_status').default('PROCESSING').notNull(),
  txRef: text('tx_ref').notNull(),
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

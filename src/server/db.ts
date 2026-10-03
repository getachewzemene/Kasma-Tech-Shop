import fs from 'fs';
import path from 'path';
import { Product, Merchant, Order, StockMovementLog, AuditLog, TelegramAlert, Payout } from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_MERCHANTS, 
  INITIAL_STOCK_LOGS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_TELEGRAM_ALERTS 
} from '../mockData';
import { CloudSqlProductService } from '../db/products.ts';

// API Traffic Log entry interface for the Live Traffic Console
export interface ApiTrafficLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  latencyMs: number;
  body?: string;
  response?: string;
}

// Senior architecture: Centralized In-Memory Database with automatic Local FS Backup
export class Database {
  public products: Product[] = [];
  public merchants: Merchant[] = [];
  public orders: Order[] = [];
  public stockLogs: StockMovementLog[] = [];
  public auditLogs: AuditLog[] = [];
  public alerts: TelegramAlert[] = [];
  public apiLogs: ApiTrafficLog[] = [];

  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'src', 'server', 'db.json');
    this.initializeData();
    this.hydrateFromCloudSql();
  }

  private async hydrateFromCloudSql() {
    try {
      const sqlProducts = await CloudSqlProductService.getAllProducts();
      if (sqlProducts && sqlProducts.length > 0) {
        this.products = sqlProducts;
      }
      const sqlOrders = await CloudSqlProductService.getAllOrders();
      if (sqlOrders && sqlOrders.length > 0) {
        this.orders = sqlOrders;
      }
      console.log(`[CLOUD_SQL] Hydrated ${this.products.length} products and ${this.orders.length} orders from PostgreSQL.`);
    } catch (err) {
      console.warn('[CLOUD_SQL] Hydration warning:', err);
    }
  }

  private initializeData() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        const data = JSON.parse(fileContent);
        this.products = data.products || [];
        this.merchants = data.merchants || [];
        this.orders = data.orders || [];
        this.stockLogs = data.stockLogs || [];
        this.auditLogs = data.auditLogs || [];
        this.alerts = data.alerts || [];
        this.apiLogs = data.apiLogs || [];

        // Dynamic compliance auto-migration to enforce only electronic tech products
        const hasLegacy = this.products.some(p => 
          !['computers', 'smartwatches', 'gaming', 'mobiles', 'headphones', 'accessories', 'cameras'].includes(p.category)
        );
        if (hasLegacy || this.products.length === 0) {
          console.log('[AUTO-MIGRATION] Legacy non-electronic products detected. Purging database state and resetting to pure tech catalog.');
          this.products = [...INITIAL_PRODUCTS];
          this.merchants = [...INITIAL_MERCHANTS];
          this.stockLogs = [...INITIAL_STOCK_LOGS];
          this.auditLogs = [...INITIAL_AUDIT_LOGS];
          this.alerts = [...INITIAL_TELEGRAM_ALERTS];
          this.orders = [];
          this.apiLogs = [];
          this.save();
        }
      } else {
        // Seed with initial datasets
        this.products = [...INITIAL_PRODUCTS];
        this.merchants = [...INITIAL_MERCHANTS];
        this.stockLogs = [...INITIAL_STOCK_LOGS];
        this.auditLogs = [...INITIAL_AUDIT_LOGS];
        this.alerts = [...INITIAL_TELEGRAM_ALERTS];
        this.orders = [];
        this.apiLogs = [];
        this.save();
      }
    } catch (error) {
      console.error('Database initialization failed, fallback to memory state:', error);
      this.products = [...INITIAL_PRODUCTS];
      this.merchants = [...INITIAL_MERCHANTS];
      this.stockLogs = [...INITIAL_STOCK_LOGS];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.alerts = [...INITIAL_TELEGRAM_ALERTS];
    }
  }

  public save() {
    try {
      const payload = {
        products: this.products,
        merchants: this.merchants,
        orders: this.orders,
        stockLogs: this.stockLogs,
        auditLogs: this.auditLogs,
        alerts: this.alerts,
        apiLogs: this.apiLogs
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to backup database state to local file:', error);
    }
  }

  // Log automated system audits
  public logAudit(actor: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') {
    const newLog: AuditLog = {
      id: `al-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      actor,
      action,
      details,
      severity,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    CloudSqlProductService.logAudit(actor, action, details, severity).catch(() => {});
    this.save();
  }

  // Log active traffic
  public logTraffic(log: ApiTrafficLog) {
    this.apiLogs.unshift(log);
    // limit traffic log to last 100 entries to prevent memory overflow
    if (this.apiLogs.length > 100) {
      this.apiLogs.pop();
    }
    this.save();
  }

  // Log Telegram warnings & merchant order notifications
  public logTelegramAlert(type: TelegramAlert['type'], message: string, orderId?: string, chatId?: string) {
    const alert: TelegramAlert = {
      id: `ta-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      orderId,
      chatId
    };
    this.alerts.unshift(alert);
    this.save();
  }
}

// Global context DB
export const db = new Database();

/* =========================================================================
   SERVICE LAYERS (Senior Domain Logic Services)
   ========================================================================= */

// 1. PRODUCT & INVENTORY SERVICE
export class ProductService {
  public static getProducts(): Product[] {
    return db.products;
  }

  public static createProduct(newProd: Product): Product {
    // Basic verification
    newProd.status = 'PENDING_APPROVAL';
    db.products.push(newProd);
    
    db.logAudit(
      `Merchant: ${newProd.merchantName}`,
      'CATALOG_PRODUCT_DRAFT_CREATED',
      `Submitted product listing draft: "${newProd.nameEn}" / "${newProd.nameAm}" awaiting compliance approval.`,
      'INFO'
    );
    
    db.save();
    CloudSqlProductService.saveProduct(newProd).catch(() => {});
    return newProd;
  }

  public static approveProduct(productId: string): Product | null {
    const product = db.products.find(p => p.id === productId);
    if (!product) return null;

    product.status = 'APPROVED';
    db.logAudit(
      'System Administrator',
      'PRODUCT_APPROVED',
      `Compliance approved product listing: "${product.nameEn}" submitted by ${product.merchantName}. Listing went Live.`,
      'INFO'
    );
    db.save();
    CloudSqlProductService.saveProduct(product).catch(() => {});
    return product;
  }

  public static rejectProduct(productId: string): Product | null {
    const product = db.products.find(p => p.id === productId);
    if (!product) return null;

    product.status = 'REJECTED';
    db.logAudit(
      'System Administrator',
      'PRODUCT_REJECTED',
      `Compliance rejected product listing: "${product.nameEn}" submitted by ${product.merchantName}. Status: Blocked.`,
      'WARNING'
    );
    db.save();
    CloudSqlProductService.saveProduct(product).catch(() => {});
    return product;
  }

  public static updateProductSeo(productId: string, updates: Partial<Product>): Product | null {
    const product = db.products.find(p => p.id === productId);
    if (!product) return null;

    if (updates.descriptionEn !== undefined) product.descriptionEn = updates.descriptionEn;
    if (updates.descriptionAm !== undefined) product.descriptionAm = updates.descriptionAm;
    if (updates.brand !== undefined && updates.brand.trim().length > 0) product.brand = updates.brand;
    if (updates.nameEn !== undefined && updates.nameEn.trim().length > 0) product.nameEn = updates.nameEn;
    if (updates.nameAm !== undefined && updates.nameAm.trim().length > 0) product.nameAm = updates.nameAm;

    db.logAudit(
      'Gemini AI SEO Engine',
      'PRODUCT_SEO_QUICK_FIX_APPLIED',
      `Applied Gemini AI Quick-Fix SEO optimizations to product: "${product.nameEn}" (${productId}).`,
      'INFO'
    );

    db.save();
    CloudSqlProductService.saveProduct(product).catch(() => {});
    return product;
  }

  public static adjustStock(productId: string, sku: string, qtyChange: number, reason: string, actor: string): boolean {
    const product = db.products.find(p => p.id === productId);
    if (!product) return false;

    const variant = product.variants.find(v => v.sku === sku);
    if (!variant) return false;

    const previousQty = variant.onHand;
    const newQty = Math.max(0, variant.onHand + qtyChange);
    const actualDiff = newQty - previousQty;

    variant.onHand = newQty;

    // Record Stock movement log
    const movement: StockMovementLog = {
      id: `sl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku,
      productName: product.nameEn,
      previousQty,
      newQty,
      difference: actualDiff,
      reason,
      actor,
      timestamp: new Date().toISOString()
    };
    db.stockLogs.unshift(movement);

    // Audit Log
    db.logAudit(
      actor,
      'INVENTORY_STOCK_CHANGE',
      `Adjusted SKU: ${sku} (${product.nameEn}) from ${previousQty} to ${newQty}. Difference: ${actualDiff > 0 ? '+' : ''}${actualDiff}. Reason: ${reason}`,
      actualDiff < 0 && newQty <= product.lowStockThreshold ? 'WARNING' : 'INFO'
    );

    // System Alerting rules
    if (newQty === 0) {
      db.logTelegramAlert(
        'OUT_OF_STOCK',
        `🚨 INVENTORY OUT OF STOCK: SKU ${sku} (${product.nameEn}) depleted. Immediate restock recommended!`
      );
    } else if (newQty <= product.lowStockThreshold) {
      db.logTelegramAlert(
        'LOW_STOCK',
        `⚠️ INVENTORY LOW STOCK: SKU ${sku} (${product.nameEn}) dipped to ${newQty} items (Threshold is ${product.lowStockThreshold}).`
      );
    }

    db.save();
    return true;
  }

  public static addReview(productId: string, review: { rating: number; comment: string; reviewerName: string; reviewerPhone?: string }) {
    const product = db.products.find(p => p.id === productId);
    if (!product) return null;

    if (!product.reviews) {
      product.reviews = [];
    }

    const newReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      rating: review.rating,
      comment: review.comment,
      reviewerName: review.reviewerName,
      reviewerPhone: review.reviewerPhone,
      createdAt: new Date().toISOString()
    };

    product.reviews.unshift(newReview);
    
    db.logAudit(
      review.reviewerName,
      'PRODUCT_REVIEW_SUBMITTED',
      `Submitted a ${review.rating}-star review for product "${product.nameEn}" / "${product.nameAm}".`,
      'INFO'
    );

    db.save();
    return product;
  }

  public static updateThreshold(productId: string, lowStockThreshold: number, actor: string): boolean {
    const product = db.products.find(p => p.id === productId);
    if (!product) return false;

    const previousThreshold = product.lowStockThreshold;
    product.lowStockThreshold = lowStockThreshold;

    db.logAudit(
      actor,
      'PRODUCT_THRESHOLD_UPDATED',
      `Updated low-stock threshold for "${product.nameEn}" from ${previousThreshold} to ${lowStockThreshold}.`,
      'INFO'
    );

    db.save();
    return true;
  }

  public static bulkUpdateProducts(
    updates: { 
      productId: string; 
      status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'; 
      priceChangePct?: number;
      flatPrice?: number;
      lowStockThreshold?: number;
      category?: string;
      featured?: boolean;
    }[],
    actor: string
  ): boolean {
    for (const update of updates) {
      const product = db.products.find(p => p.id === update.productId);
      if (!product) continue;

      if (update.status) {
        const prevStatus = product.status;
        product.status = update.status;
        db.logAudit(
          actor,
          'PRODUCT_STATUS_UPDATED',
          `Bulk updated product "${product.nameEn}" status from ${prevStatus} to ${update.status}.`,
          'INFO'
        );
      }

      if (update.priceChangePct !== undefined) {
        const prevPrice = product.price;
        const multiplier = 1 + (update.priceChangePct / 100);
        product.price = Math.max(1, Math.round(product.price * multiplier));
        db.logAudit(
          actor,
          'PRODUCT_PRICE_UPDATED',
          `Bulk applied ${update.priceChangePct >= 0 ? '+' : ''}${update.priceChangePct}% price adjustment to product "${product.nameEn}". Price adjusted from ${prevPrice} to ${product.price} ETB.`,
          'INFO'
        );
      }

      if (update.flatPrice !== undefined && update.flatPrice > 0) {
        const prevPrice = product.price;
        product.price = Math.round(update.flatPrice);
        db.logAudit(
          actor,
          'PRODUCT_PRICE_UPDATED',
          `Bulk updated product "${product.nameEn}" price from ${prevPrice} to ${product.price} ETB.`,
          'INFO'
        );
      }

      if (update.lowStockThreshold !== undefined && update.lowStockThreshold >= 0) {
        product.lowStockThreshold = update.lowStockThreshold;
      }

      if (update.category) {
        product.category = update.category;
      }

      if (update.featured !== undefined) {
        product.featured = update.featured;
      }
    }
    db.save();
    return true;
  }
}

// 2. ORDER PROCESSING & ESCROW SERVICE
export class OrderService {
  public static getOrders(): Order[] {
    return db.orders;
  }

  // Core Transactional Checkout Method
  public static processCheckout(order: Order): Order {
    // 1. Double check / Decrement stock for all purchase variants
    for (const item of order.items) {
      const prod = db.products.find(p => p.id === item.product.id);
      if (prod) {
        const variant = prod.variants.find(v => v.sku === item.sku);
        if (variant) {
          // Adjust stock via service
          ProductService.adjustStock(
            prod.id, 
            variant.sku, 
            -item.quantity, 
            `Order Checkout #${order.id}`, 
            'Transactional Engine'
          );
        }
      }
    }

    // 2. Record Order
    db.orders.unshift(order);
    CloudSqlProductService.saveOrder(order).catch(() => {});

    // 3. Split Commission, Update Merchant Balance & Dispatch Automatic Telegram Notifications
    const uniqueMerchIds = Array.from(new Set(order.items.map(item => item.product.merchantId || 'm1')));
    for (const mId of uniqueMerchIds) {
      const merchant = db.merchants.find(m => m.id === mId);
      const merchantItems = order.items.filter(item => (item.product.merchantId || 'm1') === mId);
      if (merchantItems.length === 0) continue;

      const merchantTotal = merchantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const netSettlement = Math.round(merchantTotal * 0.97);
      const retainedFee = merchantTotal - netSettlement;

      if (merchant) {
        merchant.balance += netSettlement;

        db.logAudit(
          'Escrow Ledger',
          'ESCROW_SETTLEMENT_POSTED',
          `Credited store "${merchant.storeName}" with ${netSettlement.toLocaleString()} ETB (97% of ${merchantTotal.toLocaleString()} ETB). Kasma retained ${retainedFee.toLocaleString()} ETB commission fees.`,
          'INFO'
        );
      }

      // Format automatic merchant Telegram alert message
      const storeName = merchant?.storeName || merchantItems[0]?.product.merchantName || 'Kasma Merchant';
      const telegramUser = merchant?.telegramUsername || '@merchant';
      const chatId = merchant?.telegramChatId || '849201948';

      const itemsListText = merchantItems
        .map(i => `• ${i.product.nameEn} (${i.variantName || 'Standard'}) x${i.quantity} @ ${i.price.toLocaleString()} ETB = ${(i.quantity * i.price).toLocaleString()} ETB`)
        .join('\n');

      const merchantAlertMessage = 
        `🛍️ NEW SALE NOTIFICATION FOR STORE: ${storeName.toUpperCase()}\n` +
        `Order ID: #${order.id} | Channel: ${order.channel || 'WEB'}\n` +
        `Customer: ${order.customerName} (📞 ${order.customerPhone})\n` +
        `Shipping Address: 📍 ${order.shippingAddress}\n\n` +
        `YOUR STORE'S ORDERED PRODUCTS:\n${itemsListText}\n\n` +
        `Store Subtotal: ${merchantTotal.toLocaleString()} ETB\n` +
        `Net Settlement (97%): 💰 ${netSettlement.toLocaleString()} ETB\n` +
        `Payment Method: ${order.paymentMethod}\n` +
        `Dispatch SLA: Active (24h fulfillment required)`;

      // Log Telegram alert specifically for this order & merchant
      db.logTelegramAlert('ORDER_NEW', merchantAlertMessage, order.id, chatId);

      // Log audit entry confirming automated dispatch
      db.logAudit(
        'Telegram Merchant Notifier',
        'AUTOMATIC_MERCHANT_TELEGRAM_DISPATCHED',
        `Dispatched automatic Telegram notification to merchant "${storeName}" (${telegramUser}) for ${merchantItems.length} product(s) in Order #${order.id} totaling ${merchantTotal.toLocaleString()} ETB.`,
        'INFO'
      );

      // Send live Telegram HTTP API call if BOT token is provided
      if (process.env.TELEGRAM_BOT_TOKEN) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: merchantAlertMessage
          })
        }).catch(err => console.error(`Failed live Telegram send to merchant ${storeName}:`, err));
      }
    }

    // 4. Audit Log
    db.logAudit(
      'Payment Broker',
      'TRANSACTION_SETTLED',
      `Processed Order #${order.id} via channel ${order.channel}. Total paid: ${order.total.toLocaleString()} ETB via ${order.paymentMethod}. Broker Ref: ${order.paymentId}`,
      'INFO'
    );

    // 5. Fire Telegram Bot Alarm for Real-Time Dispatch Alerts
    db.logTelegramAlert(
      'ORDER_NEW',
      `🛍️ NEW SALE REGISTERED: Order #${order.id} completed via ${order.channel}. Total: ${order.total.toLocaleString()} ETB. Payer: ${order.customerName} (${order.customerPhone}). Shipping Address: ${order.shippingAddress}. Dispatch SLA: Active.`
    );

    db.save();
    return order;
  }

  // Batch SQLite Sync for Offline-first checkout client (WatermelonDB model reconciliation)
  public static reconcileOfflineSync(queuedOrders: Order[]): { syncedCount: number; errors: string[] } {
    let syncedCount = 0;
    const errors: string[] = [];

    db.logAudit(
      'WatermelonDB Reconciler',
      'SYNC_PROTOCOL_STARTED',
      `Began processing ${queuedOrders.length} cached offline transactions uploaded from WatermelonDB local client.`,
      'INFO'
    );

    for (const order of queuedOrders) {
      try {
        // Prevent duplicate processing if order exists
        if (db.orders.some(o => o.id === order.id)) {
          continue;
        }

        // Validate stock beforehand
        let stockSufficient = true;
        for (const item of order.items) {
          const prod = db.products.find(p => p.id === item.product.id);
          const v = prod?.variants.find(varObj => varObj.sku === item.sku);
          if (!v || v.onHand < item.quantity) {
            stockSufficient = false;
            errors.push(`Order #${order.id} SKU ${item.sku} failed: Insufficient onHand stock (${v ? v.onHand : 0} left).`);
            break;
          }
        }

        if (stockSufficient) {
          this.processCheckout(order);
          syncedCount++;
        } else {
          db.logAudit(
            'WatermelonDB Reconciler',
            'SYNC_CONFLICT',
            `Reconciliation conflict for Order #${order.id}: Stock depletion during offline period. Transaction skipped.`,
            'WARNING'
          );
          db.logTelegramAlert(
            'PAYMENT_FAILED',
            `⚠️ TRANSACTION SYNC WARNING: Order #${order.id} failed stock check during WatermelonDB SQLite reconciliation.`
          );
        }
      } catch (err: any) {
        errors.push(`Error parsing transaction #${order.id}: ${err?.message || 'Unknown'}`);
      }
    }

    db.logAudit(
      'WatermelonDB Reconciler',
      'SYNC_PROTOCOL_FINISHED',
      `Finished offline sync. Successfully reconciled ${syncedCount} of ${queuedOrders.length} uploads. Conflict/Failures: ${errors.length}.`,
      errors.length > 0 ? 'WARNING' : 'INFO'
    );

    db.save();
    return { syncedCount, errors };
  }
}

// 3. MERCHANT MANAGEMENT & TRUST SERVICE
export class MerchantService {
  public static getMerchants(): Merchant[] {
    return db.merchants;
  }

  public static requestPayout(merchantId: string, amount: number, bankName: string, accountNumber: string): boolean {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return false;

    if (merchant.balance < amount || amount <= 0) return false;

    // Append payout
    const newPayout: Payout = {
      id: `py-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      amount,
      bankName,
      accountNumber,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    merchant.payouts.unshift(newPayout);
    db.logAudit(
      `Merchant: ${merchant.storeName}`,
      'PAYOUT_REQUESTED',
      `Queued CBE/Awash bank transfer payout of ${amount.toLocaleString()} ETB to account ${accountNumber} (${bankName}). Awaiting escrow compliance approval.`,
      'INFO'
    );

    db.save();
    return true;
  }

  public static approvePayout(merchantId: string, payoutId: string): boolean {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return false;

    const payout = merchant.payouts.find(p => p.id === payoutId);
    if (!payout || payout.status !== 'PENDING') return false;

    if (merchant.balance < payout.amount) {
      payout.status = 'FAILED';
      db.save();
      return false;
    }

    // Deduct balance and approve
    merchant.balance -= payout.amount;
    payout.status = 'COMPLETED';

    db.logAudit(
      'Financial Risk Desk',
      'PAYOUT_COMPLETED',
      `Authorized CBE/Awash wire payout of ${payout.amount.toLocaleString()} ETB for "${merchant.storeName}". Balance adjusted to ${merchant.balance.toLocaleString()} ETB.`,
      'INFO'
    );

    db.save();
    return true;
  }

  public static updateKyc(merchantId: string, docUrl: string): boolean {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return false;

    merchant.kycStatus = 'PENDING_VERIFICATION';
    merchant.kycDocument = docUrl;

    db.logAudit(
      `Merchant: ${merchant.storeName}`,
      'KYC_DOCUMENTS_SUBMITTED',
      `Uploaded commercial license / ID document: "${docUrl}". Registration review initiated.`,
      'INFO'
    );

    db.save();
    return true;
  }

  public static approveKyc(merchantId: string): boolean {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return false;

    merchant.kycStatus = 'APPROVED';
    db.logAudit(
      'Compliance Officer',
      'KYC_APPROVED',
      `Validated trust verification & commercial license registry for "${merchant.storeName}". Withdrawals unlocked.`,
      'INFO'
    );

    db.save();
    return true;
  }

  public static toggleMerchantStatus(merchantId: string, status: 'ACTIVE' | 'SUSPENDED'): boolean {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return false;

    merchant.status = status;
    db.logAudit(
      'Trust & Safety Admin',
      `MERCHANT_STATUS_${status}`,
      `Merchant store "${merchant.storeName}" has been ${status === 'ACTIVE' ? 'activated' : 'suspended'} under compliance directives.`,
      status === 'SUSPENDED' ? 'CRITICAL' : 'INFO'
    );

    db.save();
    return true;
  }
}

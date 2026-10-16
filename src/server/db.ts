import fs from 'fs';
import path from 'path';
import { Product, Merchant, Order, StockMovementLog, AuditLog, TelegramAlert, Payout, DigitalWarrantyPass, WarrantyClaim, SavedBankAccount, FlashDealNomination } from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_MERCHANTS, 
  INITIAL_ORDERS,
  INITIAL_STOCK_LOGS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_TELEGRAM_ALERTS,
  INITIAL_FLASH_DEALS
} from '../mockData';
import { CloudSqlProductService } from '../db/products.ts';
import { sendOrderAlertToTelegram, sendDispatchGroupAlertToTelegram, sendFulfillmentTelegramUpdate, sendLowStockAlertToTelegram } from '../lib/telegram.ts';

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
  public flashDeals: FlashDealNomination[] = [];

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
      const sqlMerchants = await CloudSqlProductService.getAllMerchants();
      if (sqlMerchants && sqlMerchants.length > 0) {
        this.merchants = sqlMerchants;
      }
      const sqlOrders = await CloudSqlProductService.getAllOrders();
      if (sqlOrders && sqlOrders.length > 0) {
        this.orders = sqlOrders;
      }
      const sqlStockLogs = await CloudSqlProductService.getAllStockLogs();
      if (sqlStockLogs && sqlStockLogs.length > 0) {
        this.stockLogs = sqlStockLogs;
      }
      const sqlAuditLogs = await CloudSqlProductService.getAllAuditLogs();
      if (sqlAuditLogs && sqlAuditLogs.length > 0) {
        this.auditLogs = sqlAuditLogs;
      }
      const sqlAlerts = await CloudSqlProductService.getAllAlerts();
      if (sqlAlerts && sqlAlerts.length > 0) {
        this.alerts = sqlAlerts;
      }
      console.log(`[POSTGRES] Fully hydrated state from PostgreSQL: ${this.products.length} products, ${this.merchants.length} merchants, ${this.orders.length} orders.`);
    } catch (err) {
      console.warn('[POSTGRES] Hydration warning:', err);
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
        this.flashDeals = data.flashDeals && data.flashDeals.length > 0 ? data.flashDeals : [...INITIAL_FLASH_DEALS];

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
          this.flashDeals = [...INITIAL_FLASH_DEALS];
          this.orders = [];
          this.apiLogs = [];
          this.save();
        } else {
          // Guarantee distinct condition, warranty, and tech specs on all existing products
          const existingIds = new Set(this.products.map(p => p.id));
          INITIAL_PRODUCTS.forEach(initP => {
            if (!existingIds.has(initP.id)) {
              this.products.push({ ...initP });
            } else {
              const prod = this.products.find(p => p.id === initP.id);
              if (prod) {
                if (initP.specs) prod.specs = initP.specs;
                if (initP.rating && !prod.rating) prod.rating = initP.rating;
                if (initP.reviewsCount && !prod.reviewsCount) prod.reviewsCount = initP.reviewsCount;
                if (initP.reviews && (!prod.reviews || prod.reviews.length === 0)) {
                  prod.reviews = initP.reviews;
                }
              }
            }
          });

          const defaultRatings: Record<string, { rating: number; reviewsCount: number }> = {
            p8: { rating: 4.9, reviewsCount: 128 },
            p1: { rating: 4.8, reviewsCount: 115 },
            p2: { rating: 4.8, reviewsCount: 245 },
            p3: { rating: 4.9, reviewsCount: 194 },
            p4: { rating: 4.7, reviewsCount: 86 },
            p5: { rating: 4.6, reviewsCount: 52 },
            p6: { rating: 4.8, reviewsCount: 173 },
            p7: { rating: 4.9, reviewsCount: 310 },
            p10: { rating: 4.9, reviewsCount: 280 },
            p11: { rating: 5.0, reviewsCount: 96 },
            p12: { rating: 4.7, reviewsCount: 64 },
            p13: { rating: 4.8, reviewsCount: 88 },
            p9: { rating: 4.8, reviewsCount: 142 }
          };

          this.products = this.products.map(p => {
            const rInfo = defaultRatings[p.id];
            const rating = rInfo ? rInfo.rating : (p.rating || 4.8);
            const reviewsCount = rInfo ? rInfo.reviewsCount : (p.reviewsCount || 65);
            let condition = p.condition;
            if (!condition || condition === 'BRAND_NEW_SEALED') {
              condition = (p.category === 'mobiles' || p.category === 'smartwatches' || p.category === 'gaming' || p.category === 'computers') ? 'SEALED' : 'BRAND_NEW';
            }
            const conditionTextEn = condition === 'SEALED' ? 'Factory Sealed' : condition === 'BRAND_NEW' ? 'Brand New' : condition === 'OPEN_BOX' ? 'Open Box' : 'Certified Refurbished';
            const conditionTextAm = condition === 'SEALED' ? 'በፋብሪካው የታሸገ' : condition === 'BRAND_NEW' ? 'አዲስ' : condition === 'OPEN_BOX' ? 'ክፍት ሳጥን' : 'የታደሰ';
            const warrantyMonths = p.warrantyMonths || (p.category === 'mobiles' || p.category === 'cameras' || p.category === 'smartwatches' || p.category === 'computers' ? 24 : 12);
            return {
              ...p,
              rating,
              reviewsCount,
              condition,
              conditionTextEn,
              conditionTextAm,
              warrantyMonths,
              warrantyTextEn: p.warrantyTextEn || `${warrantyMonths} Months Official Warranty`,
              warrantyTextAm: p.warrantyTextAm || `የ${warrantyMonths} ወራት ኦፊሴላዊ ዋስትና`
            };
          });
          if (!this.orders) {
            this.orders = [];
          }
          const existingOrderIds = new Set(this.orders.map(o => o.id));
          INITIAL_ORDERS.forEach(initO => {
            if (!existingOrderIds.has(initO.id)) {
              this.orders.push({ ...initO });
            }
          });
          this.save();
        }
      } else {
        // Seed with initial datasets
        this.products = [...INITIAL_PRODUCTS];
        this.merchants = [...INITIAL_MERCHANTS];
        this.stockLogs = [...INITIAL_STOCK_LOGS];
        this.auditLogs = [...INITIAL_AUDIT_LOGS];
        this.alerts = [...INITIAL_TELEGRAM_ALERTS];
        this.orders = [...INITIAL_ORDERS];
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
      this.flashDeals = [...INITIAL_FLASH_DEALS];
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
        apiLogs: this.apiLogs,
        flashDeals: this.flashDeals
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
    return db.products.map(p => {
      let condition = p.condition;
      if (!condition || condition === 'BRAND_NEW_SEALED') {
        condition = (p.category === 'mobiles' || p.category === 'smartwatches' || p.category === 'gaming') ? 'SEALED' : 'BRAND_NEW';
      }
      const conditionTextEn = condition === 'SEALED' ? 'Factory Sealed' : condition === 'BRAND_NEW' ? 'Brand New' : condition === 'OPEN_BOX' ? 'Open Box' : 'Certified Refurbished';
      const conditionTextAm = condition === 'SEALED' ? 'በፋብሪካው የታሸገ' : condition === 'BRAND_NEW' ? 'አዲስ' : condition === 'OPEN_BOX' ? 'ክፍት ሳጥን' : 'የታደሰ';
      const warrantyMonths = p.warrantyMonths || (p.category === 'mobiles' || p.category === 'cameras' || p.category === 'smartwatches' ? 24 : 12);
      return {
        ...p,
        condition,
        conditionTextEn,
        conditionTextAm,
        warrantyMonths,
        warrantyTextEn: p.warrantyTextEn || `${warrantyMonths} Months Official Warranty`,
        warrantyTextAm: p.warrantyTextAm || `የ${warrantyMonths} ወራት ኦፊሴላዊ ዋስትና`
      };
    });
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

  public static deleteProduct(productId: string): boolean {
    const idx = db.products.findIndex(p => p.id === productId);
    if (idx === -1) return false;

    const prod = db.products[idx];
    db.products.splice(idx, 1);
    db.logAudit(
      'Merchant / Admin',
      'PRODUCT_DELETED',
      `Permanently deleted product listing: "${prod.nameEn}" (${productId}).`,
      'WARNING'
    );
    db.save();
    CloudSqlProductService.deleteProduct(productId).catch(() => {});
    return true;
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

    // System Alerting rules & Automated Merchant Telegram Dispatch
    const threshold = product.lowStockThreshold !== undefined ? product.lowStockThreshold : 3;
    if (newQty === 0) {
      db.logTelegramAlert(
        'OUT_OF_STOCK',
        `🚨 INVENTORY OUT OF STOCK: SKU ${sku} (${product.nameEn}) depleted. Immediate restock recommended!`
      );
    } else if (newQty <= threshold) {
      db.logTelegramAlert(
        'LOW_STOCK',
        `⚠️ INVENTORY LOW STOCK: SKU ${sku} (${product.nameEn}) dipped to ${newQty} items (Threshold is ${threshold}).`
      );
    }

    // Auto-dispatch live Telegram alert to product's merchant
    const merchant = db.merchants.find(m => m.id === product.merchantId);
    if (merchant && merchant.telegramNotificationsEnabled !== false && merchant.telegramLowStockAlerts !== false) {
      if (newQty <= threshold) {
        sendLowStockAlertToTelegram(
          product,
          variant,
          newQty,
          threshold,
          merchant.storeName,
          merchant.telegramChatId
        ).catch(err => console.warn('Failed to dispatch low-stock Telegram alert to merchant:', err));
      }
    }

    db.save();
    CloudSqlProductService.saveProduct(product).catch(() => {});
    CloudSqlProductService.saveStockLog(movement, product.id).catch(() => {});
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
        CloudSqlProductService.saveMerchant(merchant).catch(() => {});
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

      // Send live Telegram HTTP API call with inline buttons
      sendOrderAlertToTelegram(order, storeName, chatId)
        .catch(err => console.warn(`Failed live Telegram send to merchant ${storeName}:`, err));
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

    // 6. Send Live Telegram Dispatch Fleet Notification with One-Click Accept & Location
    const primaryMerchantName = db.merchants.find(m => m.id === (order.items[0]?.product?.merchantId))?.storeName || 'Kasma Electronics Hub';
    sendDispatchGroupAlertToTelegram(order, primaryMerchantName)
      .catch(err => console.warn('[DISPATCH TELEGRAM ALERT ERROR]:', err));

    db.save();
    return order;
  }

  // Merchant Fulfillment Workflow Action: PACK, SHIP, DELIVER
  public static updateFulfillment(
    orderId: string,
    status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED',
    details?: { courierName?: string; courierPhone?: string; trackingNotes?: string; actor?: string }
  ): { success: boolean; order?: Order; error?: string } {
    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    order.status = status;
    const now = new Date().toISOString();

    if (status === 'PROCESSING') {
      order.packedAt = now;
    } else if (status === 'SHIPPED') {
      order.shippedAt = now;
      if (details?.courierName) order.courierName = details.courierName;
      if (details?.courierPhone) order.courierPhone = details.courierPhone;
      if (details?.trackingNotes) order.trackingNotes = details.trackingNotes;
    } else if (status === 'DELIVERED') {
      order.deliveredAt = now;
    }

    db.save();
    CloudSqlProductService.saveOrder(order).catch(() => {});

    const actor = details?.actor || 'Merchant Fulfillment Hub';
    db.logAudit(
      actor,
      `ORDER_FULFILLMENT_${status}`,
      `Order #${order.id} state updated to ${status}. Courier: ${order.courierName || 'In-House Courier'} (${order.courierPhone || 'N/A'}).`,
      'INFO'
    );

    const eventName = status === 'PROCESSING' ? 'PACKED' : (status as 'SHIPPED' | 'DELIVERED');
    db.logTelegramAlert(
      `ORDER_${eventName}`,
      `📦 FULFILLMENT UPDATE: Order #${order.id} is now ${status}. Handled by: ${actor}. Courier: ${order.courierName || 'In-House'} (${order.courierPhone || 'N/A'}).`
    );

    // Real Telegram Bot message dispatch
    sendFulfillmentTelegramUpdate(
      order,
      eventName,
      {
        name: order.courierName,
        phone: order.courierPhone,
        notes: order.trackingNotes
      }
    ).catch(err => console.warn('Telegram fulfillment notification dispatch warning:', err));

    return { success: true, order };
  }

  // One-Click Platform Courier Dispatch Fleet Request
  public static requestDispatchFleet(
    orderId: string,
    merchantId: string,
    pickupInfo?: {
      storeName?: string;
      phone?: string;
      locationAddress?: string;
      subCity?: string;
      woreda?: string;
      building?: string;
      shopNumber?: string;
      landmark?: string;
      pickupInstructions?: string;
      coordinates?: { lat: number; lng: number };
    }
  ): { success: boolean; order?: Order; error?: string } {
    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    const merchant = db.merchants.find(m => m.id === merchantId);
    const storeName = pickupInfo?.storeName || merchant?.storeName || 'Kasma Partner Merchant';
    const now = new Date().toISOString();

    order.dispatchRequested = true;
    order.dispatchRequestedAt = now;

    // Auto-advance to PROCESSING (Packed & ready for fleet collection) if in PENDING state
    if (order.status === 'PENDING_PAYMENT' || order.status === 'PAID') {
      order.status = 'PROCESSING';
      order.packedAt = now;
    }

    if (pickupInfo?.coordinates) {
      order.dispatchPickupCoordinates = pickupInfo.coordinates;
    } else if (merchant?.latitude && merchant?.longitude) {
      order.dispatchPickupCoordinates = { lat: merchant.latitude, lng: merchant.longitude };
    }

    if (pickupInfo?.locationAddress) {
      order.dispatchPickupAddress = pickupInfo.locationAddress;
    } else if (merchant?.locationAddress) {
      order.dispatchPickupAddress = merchant.locationAddress;
    }

    db.save();
    CloudSqlProductService.saveOrder(order).catch(() => {});

    const coordsStr = order.dispatchPickupCoordinates 
      ? `GPS: ${order.dispatchPickupCoordinates.lat.toFixed(4)}, ${order.dispatchPickupCoordinates.lng.toFixed(4)}`
      : 'Bole Hub GPS';

    db.logAudit(
      storeName,
      'KASMA_FLEET_DISPATCH_REQUESTED',
      `Merchant requested Kasma Express Motorcycle & Van Fleet for Order #${order.id}. Store Pickup: ${order.dispatchPickupAddress || storeName} (${coordsStr}). Payout to Courier: ${(order.shippingFee || 150).toLocaleString()} ETB.`,
      'INFO'
    );

    db.logTelegramAlert(
      'DISPATCH_REQUESTED',
      `🛵 KASMA DISPATCH FLEET PING: Order #${order.id} pickup requested by ${storeName} at ${order.dispatchPickupAddress || 'Addis Ababa'}. ${coordsStr}.`,
      order.id
    );

    return { success: true, order };
  }

  // Digital Warranty Repair & Replacement Logging Action
  public static processWarrantyServiceAction(params: {
    serialNumber: string;
    action: 'APPROVED_REPAIR' | 'APPROVED_REPLACEMENT' | 'UNDER_REVIEW' | 'REJECTED';
    issueType: 'SCREEN_DISPLAY' | 'BATTERY_CHARGING' | 'MOTHERBOARD_POWER' | 'AUDIO_SPEAKER' | 'ACCESSORY_DEFECT' | 'OTHER';
    resolutionNotes: string;
    technicianName: string;
    replacementSerial?: string;
    claimId?: string;
    orderId?: string;
    warrantyId?: string;
    merchantStoreName?: string;
  }): { success: boolean; claim: WarrantyClaim; warranty?: DigitalWarrantyPass; error?: string } {
    const q = params.serialNumber.trim().toUpperCase();
    const now = new Date().toISOString();

    // Find matching order containing this serial number or orderId
    let order = db.orders.find(o => 
      (params.orderId && o.id === params.orderId) ||
      o.items.some(i => i.serialNumber?.toUpperCase() === q || i.imei === q) ||
      (o.warranties && o.warranties.some(w => w.serialNumber.toUpperCase() === q || w.id === params.warrantyId))
    );

    let warranty: DigitalWarrantyPass | undefined;

    if (order) {
      if (order.warranties) {
        warranty = order.warranties.find(w => w.serialNumber.toUpperCase() === q || w.id === params.warrantyId);
      }
      if (!warranty) {
        const item = order.items.find(i => i.serialNumber?.toUpperCase() === q || i.imei === q) || order.items[0];
        if (item) {
          warranty = {
            id: `KASMA-WAR-${order.id.slice(-5)}-${Math.floor(100 + Math.random() * 900)}`,
            orderId: order.id,
            productId: item.product.id,
            productNameEn: item.product.nameEn,
            productNameAm: item.product.nameAm,
            brand: item.product.brand || 'Kasma Certified',
            sku: item.sku,
            variantName: item.variantName || 'Standard',
            serialNumber: params.serialNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            merchantName: params.merchantStoreName || item.product.merchantName || 'Kasma Partner',
            issueDate: order.createdAt,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            warrantyMonths: 12,
            status: 'ACTIVE',
            coverageType: 'FULL_HARDWARE_REPLACEMENT',
            qrVerificationUrl: `https://kasma.et/verify-warranty?serial=${encodeURIComponent(params.serialNumber)}`,
            tamperProofHash: `ET-WAR-${Math.floor(100000 + Math.random() * 900000)}`
          };
          if (!order.warranties) order.warranties = [];
          order.warranties.push(warranty);
        }
      }
    }

    // Update warranty status based on action
    if (warranty) {
      if (params.action === 'APPROVED_REPAIR') {
        warranty.status = 'ACTIVE';
      } else if (params.action === 'APPROVED_REPLACEMENT') {
        warranty.status = 'REPLACED';
        if (params.replacementSerial) {
          warranty.serialNumber = `${warranty.serialNumber} (Replaced with: ${params.replacementSerial})`;
        }
      } else if (params.action === 'REJECTED') {
        warranty.status = 'VOIDED';
      } else if (params.action === 'UNDER_REVIEW') {
        warranty.status = 'CLAIM_PENDING';
      }
    }

    // Find or create claim
    const claimId = params.claimId || `CLM-ET-${Date.now().toString().slice(-6)}`;
    let claim: WarrantyClaim | undefined;

    if (order && order.warrantyClaims) {
      claim = order.warrantyClaims.find(c => c.id === params.claimId || c.serialNumber.toUpperCase() === q);
    }

    if (claim) {
      claim.status = params.action;
      claim.issueType = params.issueType;
      claim.resolutionNotes = params.resolutionNotes;
      claim.technicianName = params.technicianName;
      claim.replacementSerial = params.replacementSerial;
      claim.updatedAt = now;
    } else {
      claim = {
        id: claimId,
        warrantyId: warranty?.id || params.warrantyId || `WAR-${Date.now()}`,
        orderId: order?.id || params.orderId || 'ORD-IN-STORE',
        productId: warranty?.productId || 'p-gen',
        productName: warranty?.productNameEn || 'Hardware Device',
        serialNumber: params.serialNumber,
        customerName: warranty?.customerName || order?.customerName || 'In-Store Customer',
        customerPhone: warranty?.customerPhone || order?.customerPhone || '+251 91 100 0000',
        issueType: params.issueType,
        description: `Service Desk Diagnostic: ${params.resolutionNotes}`,
        serviceMethod: 'SERVICE_CENTER_WALKIN',
        status: params.action,
        createdAt: now,
        updatedAt: now,
        resolutionNotes: params.resolutionNotes,
        technicianName: params.technicianName,
        replacementSerial: params.replacementSerial
      };

      if (order) {
        if (!order.warrantyClaims) order.warrantyClaims = [];
        order.warrantyClaims.unshift(claim);
      }
    }

    db.save();
    if (order) {
      CloudSqlProductService.saveOrder(order).catch(() => {});
    }

    const actionText = params.action === 'APPROVED_REPAIR'
      ? 'REPAIR COMPLETED'
      : params.action === 'APPROVED_REPLACEMENT'
      ? `DEVICE REPLACED (New S/N: ${params.replacementSerial || 'Assigned'})`
      : params.action === 'REJECTED'
      ? 'CLAIM REJECTED / VOIDED'
      : 'DIAGNOSTIC BENCH REVIEW';

    db.logAudit(
      params.technicianName || 'Warranty Service Specialist',
      'WARRANTY_SERVICE_ACTION_LOGGED',
      `Device S/N: ${params.serialNumber}. Status: ${actionText}. Category: ${params.issueType}. Notes: ${params.resolutionNotes}.`,
      params.action === 'REJECTED' ? 'WARNING' : 'INFO'
    );

    db.logTelegramAlert(
      'CLAIM_NEW',
      `🛡️ WARRANTY SERVICE DESK: S/N ${params.serialNumber} — ${actionText}. Technician: ${params.technicianName}. Notes: "${params.resolutionNotes}".`
    );

    return { success: true, claim, warranty };
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

  public static requestPayout(
    merchantId: string, 
    amount: number, 
    bankName: string, 
    accountNumber: string, 
    options?: { accountHolderName?: string; saveProfile?: boolean }
  ): boolean {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return false;

    if (merchant.balance < amount || amount <= 0) return false;

    const cleanAccount = accountNumber.trim().replace(/\s+/g, '');

    // Optionally auto-save bank profile for 1-click withdrawals
    if (options?.saveProfile) {
      if (!merchant.savedBankAccounts) merchant.savedBankAccounts = [];
      const alreadySaved = merchant.savedBankAccounts.some(
        ba => ba.accountNumber.replace(/\s+/g, '') === cleanAccount && ba.bankName.toLowerCase() === bankName.toLowerCase()
      );
      if (!alreadySaved) {
        merchant.savedBankAccounts.push({
          id: `ba-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          bankName,
          accountNumber: cleanAccount,
          accountHolderName: options.accountHolderName?.trim() || merchant.ownerName || merchant.storeName,
          isDefault: merchant.savedBankAccounts.length === 0,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Append payout
    const newPayout: Payout = {
      id: `py-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      amount,
      bankName,
      accountNumber: cleanAccount,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    merchant.payouts.unshift(newPayout);
    db.logAudit(
      `Merchant: ${merchant.storeName}`,
      'PAYOUT_REQUESTED',
      `Queued CBE/Awash bank transfer payout of ${amount.toLocaleString()} ETB to account ${cleanAccount} (${bankName}). Awaiting escrow compliance approval.`,
      'INFO'
    );

    db.save();
    CloudSqlProductService.saveMerchant(merchant).catch(() => {});
    return true;
  }

  public static getSavedBankAccounts(merchantId: string): SavedBankAccount[] {
    const merchant = db.merchants.find(m => m.id === merchantId);
    return merchant?.savedBankAccounts || [];
  }

  public static addSavedBankAccount(
    merchantId: string, 
    accountData: { bankName: string; accountNumber: string; accountHolderName: string; isDefault?: boolean }
  ): { success: boolean; account?: SavedBankAccount; error?: string } {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return { success: false, error: 'Merchant not found' };

    const cleanAccount = accountData.accountNumber.trim().replace(/\s+/g, '');
    const cleanHolder = accountData.accountHolderName.trim() || merchant.ownerName || merchant.storeName;

    if (!cleanAccount) {
      return { success: false, error: 'Account number or mobile phone is required.' };
    }

    // 13-digit CBE validation
    if (accountData.bankName.includes('CBE') || accountData.bankName.includes('Commercial Bank')) {
      if (!/^\d{13}$/.test(cleanAccount)) {
        return { success: false, error: 'Commercial Bank of Ethiopia (CBE) account numbers must be exactly 13 digits (e.g. 1000123456789).' };
      }
    }

    // Telebirr validation
    if (accountData.bankName.includes('Telebirr')) {
      const isEthPhone = /^(\+2519|\+2517|09|07)\d{8}$/.test(cleanAccount);
      if (!isEthPhone) {
        return { success: false, error: 'Telebirr merchant wallet must be a valid Ethiopian phone number (+2519..., 09..., or 07...).' };
      }
    }

    if (!merchant.savedBankAccounts) {
      merchant.savedBankAccounts = [];
    }

    // If marked default or first account, clear other defaults
    const shouldBeDefault = accountData.isDefault || merchant.savedBankAccounts.length === 0;
    if (shouldBeDefault) {
      merchant.savedBankAccounts.forEach(acc => acc.isDefault = false);
    }

    const newAccount: SavedBankAccount = {
      id: `ba-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      bankName: accountData.bankName.trim(),
      accountNumber: cleanAccount,
      accountHolderName: cleanHolder,
      isDefault: shouldBeDefault,
      createdAt: new Date().toISOString()
    };

    merchant.savedBankAccounts.unshift(newAccount);

    db.logAudit(
      `Merchant: ${merchant.storeName}`,
      'BANK_PROFILE_SAVED',
      `Saved ${newAccount.bankName} profile (A/C: ${newAccount.accountNumber}) for ${newAccount.accountHolderName}. Default: ${newAccount.isDefault ? 'YES' : 'NO'}.`,
      'INFO'
    );

    db.save();
    CloudSqlProductService.saveMerchant(merchant).catch(() => {});
    return { success: true, account: newAccount };
  }

  public static setDefaultBankAccount(merchantId: string, accountId: string): { success: boolean; error?: string } {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant || !merchant.savedBankAccounts) return { success: false, error: 'Merchant or bank accounts not found' };

    let found = false;
    merchant.savedBankAccounts.forEach(acc => {
      if (acc.id === accountId) {
        acc.isDefault = true;
        found = true;
      } else {
        acc.isDefault = false;
      }
    });

    if (!found) return { success: false, error: 'Bank account profile not found' };

    db.logAudit(
      `Merchant: ${merchant.storeName}`,
      'DEFAULT_BANK_PROFILE_UPDATED',
      `Updated default payout bank account to ${accountId}.`,
      'INFO'
    );

    db.save();
    CloudSqlProductService.saveMerchant(merchant).catch(() => {});
    return { success: true };
  }

  public static deleteSavedBankAccount(merchantId: string, accountId: string): { success: boolean; error?: string } {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant || !merchant.savedBankAccounts) return { success: false, error: 'Merchant not found' };

    const initialLength = merchant.savedBankAccounts.length;
    merchant.savedBankAccounts = merchant.savedBankAccounts.filter(acc => acc.id !== accountId);

    if (merchant.savedBankAccounts.length === initialLength) {
      return { success: false, error: 'Bank account not found' };
    }

    // If deleted account was default and accounts remain, set the first as default
    if (merchant.savedBankAccounts.length > 0 && !merchant.savedBankAccounts.some(acc => acc.isDefault)) {
      merchant.savedBankAccounts[0].isDefault = true;
    }

    db.logAudit(
      `Merchant: ${merchant.storeName}`,
      'BANK_PROFILE_DELETED',
      `Removed saved bank account profile ${accountId}.`,
      'INFO'
    );

    db.save();
    CloudSqlProductService.saveMerchant(merchant).catch(() => {});
    return { success: true };
  }

  public static approvePayout(merchantId: string, payoutId: string): boolean {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return false;

    const payout = merchant.payouts.find(p => p.id === payoutId);
    if (!payout || payout.status !== 'PENDING') return false;

    if (merchant.balance < payout.amount) {
      payout.status = 'FAILED';
      db.save();
      CloudSqlProductService.saveMerchant(merchant).catch(() => {});
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
    CloudSqlProductService.saveMerchant(merchant).catch(() => {});
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
    CloudSqlProductService.saveMerchant(merchant).catch(() => {});
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
    CloudSqlProductService.saveMerchant(merchant).catch(() => {});
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

  public static updateStoreProfile(merchantId: string, profileData: Partial<Merchant>): { success: boolean; merchant?: Merchant; error?: string } {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return { success: false, error: 'Merchant not found' };

    if (profileData.storeName !== undefined) merchant.storeName = profileData.storeName.trim();
    if (profileData.ownerName !== undefined) merchant.ownerName = profileData.ownerName.trim();
    if (profileData.phone !== undefined) merchant.phone = profileData.phone.trim();
    if (profileData.email !== undefined) merchant.email = profileData.email.trim();
    if (profileData.locationAddress !== undefined) merchant.locationAddress = profileData.locationAddress;
    if (profileData.subCity !== undefined) merchant.subCity = profileData.subCity;
    if (profileData.woreda !== undefined) merchant.woreda = profileData.woreda;
    if (profileData.building !== undefined) merchant.building = profileData.building;
    if (profileData.shopNumber !== undefined) merchant.shopNumber = profileData.shopNumber;
    if (profileData.landmark !== undefined) merchant.landmark = profileData.landmark;
    if (profileData.openingHours !== undefined) merchant.openingHours = profileData.openingHours;
    if (profileData.pickupInstructions !== undefined) merchant.pickupInstructions = profileData.pickupInstructions;
    if (profileData.allowCustomerPickup !== undefined) merchant.allowCustomerPickup = Boolean(profileData.allowCustomerPickup);
    if (profileData.latitude !== undefined) merchant.latitude = profileData.latitude;
    if (profileData.longitude !== undefined) merchant.longitude = profileData.longitude;

    db.logAudit(
      `Merchant: ${merchant.storeName}`,
      'STORE_PROFILE_UPDATED',
      `Updated physical pickup location: ${merchant.subCity || 'Addis Ababa'}, Building: ${merchant.building || 'N/A'}, Shop: ${merchant.shopNumber || 'N/A'}. In-Store Pickup: ${merchant.allowCustomerPickup ? 'ENABLED' : 'DISABLED'}.`,
      'INFO'
    );

    db.save();
    CloudSqlProductService.saveMerchant(merchant).catch(() => {});
    return { success: true, merchant };
  }
}

// Service handling Merchant Flash Deals Nominations for Kasma Homepage Banner
export class FlashDealService {
  public static getFlashDeals(onlyActive = false): FlashDealNomination[] {
    if (onlyActive) {
      const now = new Date().toISOString();
      return db.flashDeals.filter(d => d.status === 'ACTIVE' && (!d.endDate || d.endDate >= now));
    }
    return db.flashDeals;
  }

  public static getMerchantFlashDeals(merchantId: string): FlashDealNomination[] {
    return db.flashDeals.filter(d => d.merchantId === merchantId);
  }

  public static nominateFlashDeal(merchantId: string, data: {
    productId: string;
    discountPct: number;
    dealStock: number;
    durationHours?: number;
    bannerTag?: string;
    campaignTitle?: string;
    notes?: string;
  }): { success: boolean; flashDeal?: FlashDealNomination; error?: string } {
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) return { success: false, error: 'Merchant not found' };

    const product = db.products.find(p => p.id === data.productId && p.merchantId === merchantId);
    if (!product) return { success: false, error: 'Product not found in merchant catalog' };

    const discountPct = Number(data.discountPct);
    if (isNaN(discountPct) || discountPct < 5 || discountPct > 75) {
      return { success: false, error: 'Discount percentage must be between 5% and 75%' };
    }

    const dealStock = Number(data.dealStock);
    const totalOnHand = product.variants.reduce((sum, v) => sum + (v.onHand || 0), 0);
    if (isNaN(dealStock) || dealStock < 1) {
      return { success: false, error: 'Deal allocation quantity must be at least 1 unit' };
    }
    if (dealStock > totalOnHand) {
      return { success: false, error: `Deal allocation (${dealStock}) exceeds total available inventory (${totalOnHand})` };
    }

    const durationHours = Number(data.durationHours) || 48;
    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString();

    const flashPrice = Math.round(product.price * (1 - discountPct / 100));

    // Cancel any previous active flash deal for the same product to prevent duplication
    db.flashDeals.forEach(d => {
      if (d.productId === product.id && d.status === 'ACTIVE') {
        d.status = 'EXPIRED';
      }
    });

    const newDeal: FlashDealNomination = {
      id: `fd-nom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: product.id,
      merchantId: merchant.id,
      merchantName: merchant.storeName,
      productNameEn: product.nameEn,
      productNameAm: product.nameAm,
      productImage: product.image,
      category: product.category,
      originalPrice: product.price,
      discountPct,
      flashPrice,
      dealStock,
      claimedStock: 0,
      durationHours,
      startDate,
      endDate,
      status: 'ACTIVE', // Automatically activated on Kasma's homepage Flash Deals banner
      bannerTag: data.bannerTag || `${discountPct}% OFF FLASH`,
      campaignTitle: data.campaignTitle || `${discountPct}% Off Flash Deal Nomination`,
      notes: data.notes || '',
      createdAt: startDate
    };

    db.flashDeals.unshift(newDeal);
    product.flashDeal = newDeal;

    if (!merchant.flashDealNominations) {
      merchant.flashDealNominations = [];
    }
    merchant.flashDealNominations.unshift(newDeal);

    db.logAudit(
      `Merchant: ${merchant.storeName}`,
      'FLASH_DEAL_NOMINATION_SUBMITTED',
      `Submitted ${discountPct}% off Flash Deal for "${product.nameEn}". Flash Price: ${flashPrice.toLocaleString()} ETB (Regular: ${product.price.toLocaleString()} ETB). Deal Stock: ${dealStock} units. Featured live on Kasma homepage Flash Deals banner.`,
      'INFO'
    );

    db.save();
    return { success: true, flashDeal: newDeal };
  }

  public static cancelFlashDeal(merchantId: string, dealId: string): { success: boolean; error?: string } {
    const deal = db.flashDeals.find(d => d.id === dealId && d.merchantId === merchantId);
    if (!deal) return { success: false, error: 'Flash deal nomination not found' };

    deal.status = 'CANCELLED';

    const product = db.products.find(p => p.id === deal.productId);
    if (product && product.flashDeal?.id === deal.id) {
      delete product.flashDeal;
    }

    db.logAudit(
      `Merchant: ${deal.merchantName}`,
      'FLASH_DEAL_NOMINATION_CANCELLED',
      `Cancelled flash deal nomination ${dealId} for product "${deal.productNameEn}".`,
      'INFO'
    );

    db.save();
    return { success: true };
  }

  public static approveFlashDeal(dealId: string): { success: boolean; error?: string } {
    const deal = db.flashDeals.find(d => d.id === dealId);
    if (!deal) return { success: false, error: 'Deal not found' };

    deal.status = 'ACTIVE';
    db.logAudit(
      'Kasma Marketing Desk',
      'FLASH_DEAL_APPROVED',
      `Approved flash deal nomination ${dealId} for "${deal.productNameEn}" (${deal.discountPct}% OFF). Active on Homepage banner.`,
      'INFO'
    );
    db.save();
    return { success: true };
  }
}


import { db } from './index.ts';
import { products, merchants, orders, stockLogs, auditLogs, telegramAlerts } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { Product, Merchant, Order, StockMovementLog, AuditLog, TelegramAlert } from '../types.ts';

export class PostgresService {
  // 1. PRODUCTS
  public static async getAllProducts(): Promise<Product[]> {
    try {
      const rows = await db.select().from(products);
      return rows.map((r) => ({
        id: r.id,
        nameEn: r.nameEn,
        nameAm: r.nameAm,
        category: r.category,
        price: r.priceEtb,
        brand: r.brand,
        status: r.status as any,
        lowStockThreshold: r.reorderThreshold,
        merchantId: r.merchantId,
        merchantName: r.merchantName,
        descriptionEn: r.descriptionEn,
        descriptionAm: r.descriptionAm,
        image: r.image,
        variants: (r.variants as any[]) || [],
        specifications: (r.specifications as any) || {},
        rating: r.rating,
        reviewsCount: r.reviewsCount,
        condition: (r.condition as any) || 'SEALED',
        conditionTextEn: r.conditionTextEn || 'Factory Sealed',
        conditionTextAm: r.conditionTextAm || 'በፋብሪካው የታሸገ',
        warrantyMonths: r.warrantyMonths || 12,
        warrantyTextEn: r.warrantyTextEn || '12 Months Official Warranty',
        warrantyTextAm: r.warrantyTextAm || 'የ12 ወራት ኦፊሴላዊ ዋስትና',
        reviews: (r.reviews as any[]) || [],
        featured: true,
      }));
    } catch (error) {
      console.error('Error fetching products from PostgreSQL:', error);
      return [];
    }
  }

  public static async saveProduct(p: Product): Promise<void> {
    try {
      await db
        .insert(products)
        .values({
          id: p.id,
          nameEn: p.nameEn,
          nameAm: p.nameAm,
          category: p.category,
          priceEtb: p.price,
          brand: p.brand || 'Generic',
          status: p.status || 'APPROVED',
          inStock: p.variants ? p.variants.some((v) => v.onHand > 0) : true,
          merchantId: p.merchantId || 'MERCH-001',
          merchantName: p.merchantName || 'Kasma Express Tech',
          descriptionEn: p.descriptionEn || '',
          descriptionAm: p.descriptionAm || '',
          image: p.image || '',
          sku: p.variants && p.variants[0] ? p.variants[0].sku : `SKU-${p.id}`,
          reorderThreshold: p.lowStockThreshold || 5,
          condition: (p.condition as any) || 'SEALED',
          conditionTextEn: p.conditionTextEn || 'Factory Sealed',
          conditionTextAm: p.conditionTextAm || 'በፋብሪካው የታሸገ',
          warrantyMonths: p.warrantyMonths || 12,
          warrantyTextEn: p.warrantyTextEn || `${p.warrantyMonths || 12} Months Official Warranty`,
          warrantyTextAm: p.warrantyTextAm || `የ${p.warrantyMonths || 12} ወራት ኦፊሴላዊ ዋስትና`,
          variants: p.variants || [],
          specifications: (p as any).specifications || {},
          reviews: p.reviews || [],
        })
        .onConflictDoUpdate({
          target: products.id,
          set: {
            nameEn: p.nameEn,
            nameAm: p.nameAm,
            category: p.category,
            priceEtb: p.price,
            brand: p.brand || 'Generic',
            status: p.status || 'APPROVED',
            merchantId: p.merchantId || 'MERCH-001',
            merchantName: p.merchantName || 'Kasma Express Tech',
            descriptionEn: p.descriptionEn || '',
            descriptionAm: p.descriptionAm || '',
            image: p.image || '',
            variants: p.variants || [],
            specifications: (p as any).specifications || {},
            reviews: p.reviews || [],
            condition: (p.condition as any) || 'SEALED',
            warrantyMonths: p.warrantyMonths || 12,
          },
        });
    } catch (error) {
      console.error('Error saving product to PostgreSQL:', error);
    }
  }

  // 2. MERCHANTS
  public static async getAllMerchants(): Promise<Merchant[]> {
    try {
      const rows = await db.select().from(merchants);
      return rows.map((r) => ({
        id: r.id,
        storeName: r.storeName,
        ownerName: r.ownerName,
        email: r.email,
        phone: r.phone,
        status: r.status as any,
        kycStatus: r.kycStatus as any,
        kycDocument: r.kycDocument || undefined,
        telegramUsername: r.telegramUsername || undefined,
        telegramChatId: r.telegramChatId || undefined,
        telegramNotificationsEnabled: r.telegramNotificationsEnabled ?? true,
        balance: r.balance,
        payouts: (r.payouts as any[]) || [],
      }));
    } catch (error) {
      console.error('Error fetching merchants from PostgreSQL:', error);
      return [];
    }
  }

  public static async saveMerchant(m: Merchant): Promise<void> {
    try {
      await db
        .insert(merchants)
        .values({
          id: m.id,
          storeName: m.storeName,
          ownerName: m.ownerName,
          email: m.email,
          phone: m.phone,
          status: m.status || 'APPROVED',
          tier: (m as any).tier || 'Verified Merchant',
          rating: (m as any).rating || 5.0,
          commissionRate: 0.08,
          balance: m.balance || 0,
          kycStatus: m.kycStatus || 'APPROVED',
          kycDocument: m.kycDocument || null,
          telegramUsername: m.telegramUsername || null,
          telegramChatId: m.telegramChatId || null,
          telegramNotificationsEnabled: m.telegramNotificationsEnabled ?? true,
          payouts: m.payouts || [],
        })
        .onConflictDoUpdate({
          target: merchants.id,
          set: {
            storeName: m.storeName,
            ownerName: m.ownerName,
            email: m.email,
            phone: m.phone,
            status: m.status || 'APPROVED',
            balance: m.balance || 0,
            kycStatus: m.kycStatus || 'APPROVED',
            kycDocument: m.kycDocument || null,
            telegramUsername: m.telegramUsername || null,
            telegramChatId: m.telegramChatId || null,
            telegramNotificationsEnabled: m.telegramNotificationsEnabled ?? true,
            payouts: m.payouts || [],
          },
        });
    } catch (error) {
      console.error('Error saving merchant to PostgreSQL:', error);
    }
  }

  // 3. ORDERS
  public static async getAllOrders(): Promise<Order[]> {
    try {
      const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
      return rows.map((r) => ({
        id: r.id,
        customerId: r.customerId || 'cust-1',
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        shippingAddress: r.shippingAddress,
        subCity: r.subCity || undefined,
        landmark: r.landmark || undefined,
        items: (r.items as any[]) || [],
        subtotal: r.subtotal,
        shippingFee: r.shippingFee,
        total: r.totalAmountEtb,
        paymentMethod: r.paymentMethod as any,
        paymentId: r.txRef,
        status: r.orderStatus as any,
        channel: (r.channel as any) || 'WEB',
        discountCode: r.discountCode || undefined,
        discountAmount: r.discountAmount || 0,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching orders from PostgreSQL:', error);
      return [];
    }
  }

  public static async saveOrder(o: Order): Promise<void> {
    try {
      await db
        .insert(orders)
        .values({
          id: o.id,
          customerId: o.customerId || `cust-${Date.now()}`,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerCity: 'Addis Ababa',
          subCity: o.subCity || null,
          landmark: o.landmark || null,
          shippingAddress: o.shippingAddress,
          items: o.items || [],
          subtotal: o.subtotal || o.total,
          shippingFee: o.shippingFee || 0,
          totalAmountEtb: o.total,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.status === 'PAID' ? 'COMPLETED' : 'PENDING',
          orderStatus: o.status || 'PROCESSING',
          txRef: o.paymentId || `TX-${o.id}`,
          channel: o.channel || 'WEB',
          discountCode: o.discountCode || null,
          discountAmount: o.discountAmount || 0,
        })
        .onConflictDoUpdate({
          target: orders.id,
          set: {
            orderStatus: o.status || 'PROCESSING',
            paymentStatus: o.status === 'PAID' ? 'COMPLETED' : 'PENDING',
          },
        });
    } catch (error) {
      console.error('Error saving order to PostgreSQL:', error);
    }
  }

  // 4. STOCK LOGS
  public static async getAllStockLogs(): Promise<StockMovementLog[]> {
    try {
      const rows = await db.select().from(stockLogs).orderBy(desc(stockLogs.timestamp));
      return rows.map((r) => ({
        id: r.id,
        sku: r.sku,
        productName: r.productId,
        previousQty: r.previousQty,
        newQty: r.newQty,
        difference: r.change,
        reason: r.reason,
        actor: r.actor,
        timestamp: r.timestamp,
      }));
    } catch (error) {
      console.error('Error fetching stock logs from PostgreSQL:', error);
      return [];
    }
  }

  public static async saveStockLog(log: StockMovementLog, productId: string): Promise<void> {
    try {
      await db.insert(stockLogs).values({
        id: log.id,
        productId,
        sku: log.sku,
        change: log.difference,
        previousQty: log.previousQty,
        newQty: log.newQty,
        reason: log.reason,
        actor: log.actor,
        timestamp: log.timestamp,
      });
    } catch (error) {
      console.error('Error saving stock log to PostgreSQL:', error);
    }
  }

  // 5. AUDIT LOGS
  public static async getAllAuditLogs(): Promise<AuditLog[]> {
    try {
      const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
      return rows.map((r) => ({
        id: r.id,
        actor: r.actor,
        action: r.action,
        details: r.details,
        severity: r.severity as any,
        timestamp: r.timestamp,
      }));
    } catch (error) {
      console.error('Error fetching audit logs from PostgreSQL:', error);
      return [];
    }
  }

  public static async logAudit(actor: string, action: string, details: string, severity: string): Promise<void> {
    try {
      const id = `al-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.insert(auditLogs).values({
        id,
        actor,
        action,
        details,
        severity,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error writing audit log to PostgreSQL:', error);
    }
  }

  // 6. TELEGRAM ALERTS
  public static async getAllAlerts(): Promise<TelegramAlert[]> {
    try {
      const rows = await db.select().from(telegramAlerts).orderBy(desc(telegramAlerts.timestamp));
      return rows.map((r) => ({
        id: r.id,
        type: r.type as any,
        message: r.message,
        timestamp: r.timestamp,
        read: r.read,
        orderId: r.orderId || undefined,
        chatId: r.chatId || undefined,
      }));
    } catch (error) {
      console.error('Error fetching alerts from PostgreSQL:', error);
      return [];
    }
  }

  public static async saveAlert(alert: TelegramAlert): Promise<void> {
    try {
      await db.insert(telegramAlerts).values({
        id: alert.id,
        type: alert.type,
        message: alert.message,
        timestamp: alert.timestamp,
        read: alert.read,
        orderId: alert.orderId || null,
        chatId: alert.chatId || null,
      });
    } catch (error) {
      console.error('Error saving alert to PostgreSQL:', error);
    }
  }
}

// Backwards-compatible alias for existing imports
export const CloudSqlProductService = PostgresService;

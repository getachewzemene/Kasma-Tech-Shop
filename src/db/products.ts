import { db } from './index.ts';
import { products, merchants, orders, stockLogs, auditLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { Product, Merchant, Order, StockMovementLog, AuditLog } from '../types.ts';

export class CloudSqlProductService {
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
        featured: true,
      }));
    } catch (error) {
      console.error('Error fetching products from Cloud SQL:', error);
      throw new Error('Failed to fetch products from Cloud SQL.', { cause: error });
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
          variants: p.variants || [],
          specifications: (p as any).specifications || {},
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
          },
        });
    } catch (error) {
      console.error('Error saving product to Cloud SQL:', error);
      throw new Error('Failed to save product in Cloud SQL.', { cause: error });
    }
  }

  public static async getAllOrders(): Promise<Order[]> {
    try {
      const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
      return rows.map((r) => ({
        id: r.id,
        customerId: (r as any).customerId || 'c1',
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        shippingAddress: r.shippingAddress,
        items: (r.items as any[]) || [],
        subtotal: r.totalAmountEtb,
        shippingFee: 0,
        total: r.totalAmountEtb,
        paymentMethod: r.paymentMethod as any,
        paymentId: r.txRef,
        status: r.orderStatus as any,
        channel: 'WEB',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching orders from Cloud SQL:', error);
      return [];
    }
  }

  public static async saveOrder(o: Order): Promise<void> {
    try {
      await db
        .insert(orders)
        .values({
          id: o.id,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerCity: 'Addis Ababa',
          shippingAddress: o.shippingAddress,
          items: o.items || [],
          totalAmountEtb: o.total,
          paymentMethod: o.paymentMethod,
          paymentStatus: 'COMPLETED',
          orderStatus: o.status || 'PROCESSING',
          txRef: o.paymentId || `TX-${o.id}`,
        })
        .onConflictDoUpdate({
          target: orders.id,
          set: {
            orderStatus: o.status || 'PROCESSING',
            paymentStatus: 'COMPLETED',
          },
        });
    } catch (error) {
      console.error('Error saving order to Cloud SQL:', error);
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
      console.error('Error writing audit log to Cloud SQL:', error);
    }
  }
}

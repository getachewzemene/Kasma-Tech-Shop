import { db } from './index.ts';
import { products, merchants, auditLogs, stockLogs } from './schema.ts';
import { INITIAL_PRODUCTS, INITIAL_MERCHANTS, INITIAL_AUDIT_LOGS, INITIAL_STOCK_LOGS } from '../mockData.ts';

async function seed() {
  console.log('Seeding Cloud SQL PostgreSQL database...');

  try {
    // 1. Seed Merchants
    for (const m of INITIAL_MERCHANTS) {
      await db.insert(merchants).values({
        id: m.id,
        storeName: m.storeName,
        ownerName: m.ownerName,
        email: m.email,
        phone: m.phone,
        status: m.status,
        tier: (m as any).tier || 'Verified Merchant',
        rating: (m as any).rating || 5.0,
        commissionRate: (m as any).commissionRate || 0.08,
        totalSalesEtb: (m as any).totalSalesEtb || 0,
        pendingPayoutEtb: (m as any).pendingPayoutEtb || 0,
        payoutHistory: (m as any).payoutHistory || [],
        kyc: (m as any).kyc || null,
      }).onConflictDoNothing();
    }
    console.log('Merchants seeded successfully.');

    // 2. Seed Products
    for (const p of INITIAL_PRODUCTS) {
      await db.insert(products).values({
        id: p.id,
        nameEn: p.nameEn,
        nameAm: p.nameAm,
        category: p.category,
        priceEtb: p.price,
        brand: p.brand || 'Generic',
        status: p.status || 'APPROVED',
        inStock: true,
        merchantId: p.merchantId || 'MERCH-001',
        merchantName: p.merchantName || 'Kasma Express Tech',
        descriptionEn: p.descriptionEn || '',
        descriptionAm: p.descriptionAm || '',
        image: p.image || '',
        sku: p.variants && p.variants[0] ? p.variants[0].sku : `SKU-${p.id}`,
        reorderThreshold: p.lowStockThreshold || 5,
        variants: p.variants || [],
        specifications: (p as any).specifications || {},
      }).onConflictDoNothing();
    }
    console.log('Products seeded successfully.');

    // 3. Seed Audit Logs
    for (const a of INITIAL_AUDIT_LOGS) {
      await db.insert(auditLogs).values({
        id: a.id,
        actor: a.actor,
        action: a.action,
        details: a.details,
        severity: a.severity,
        timestamp: a.timestamp,
      }).onConflictDoNothing();
    }
    console.log('Audit logs seeded successfully.');

    // 4. Seed Stock Movement Logs
    for (const s of INITIAL_STOCK_LOGS) {
      const changeVal = (s as any).qtyChange !== undefined ? (s as any).qtyChange : (s.newQty - s.previousQty);
      await db.insert(stockLogs).values({
        id: s.id,
        productId: 'p1',
        sku: s.sku,
        change: changeVal,
        previousQty: s.previousQty,
        newQty: s.newQty,
        reason: s.reason,
        actor: s.actor,
        timestamp: s.timestamp,
      }).onConflictDoNothing();
    }
    console.log('Stock movement logs seeded successfully.');

    console.log('Cloud SQL PostgreSQL seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Cloud SQL failed:', err);
    process.exit(1);
  }
}

seed();

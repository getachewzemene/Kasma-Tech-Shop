import { PostgresService } from './products.ts';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_MERCHANTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_STOCK_LOGS,
  INITIAL_TELEGRAM_ALERTS
} from '../mockData.ts';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🚀 Starting PostgreSQL migration & seed to Neon...');

  try {
    // 1. Seed Merchants
    console.log(`📦 Seeding ${INITIAL_MERCHANTS.length} merchants...`);
    for (const m of INITIAL_MERCHANTS) {
      await PostgresService.saveMerchant(m);
    }
    console.log('✅ Merchants seeded successfully.');

    // 2. Seed Products
    console.log(`📦 Seeding ${INITIAL_PRODUCTS.length} products with variants and warranty...`);
    for (const p of INITIAL_PRODUCTS) {
      await PostgresService.saveProduct(p);
    }
    console.log('✅ Products seeded successfully.');

    // 3. Seed Audit Logs
    console.log(`📦 Seeding ${INITIAL_AUDIT_LOGS.length} audit logs...`);
    for (const a of INITIAL_AUDIT_LOGS) {
      await PostgresService.logAudit(a.actor, a.action, a.details, a.severity);
    }
    console.log('✅ Audit logs seeded successfully.');

    // 4. Seed Stock Logs
    console.log(`📦 Seeding ${INITIAL_STOCK_LOGS.length} stock movement logs...`);
    for (const s of INITIAL_STOCK_LOGS) {
      await PostgresService.saveStockLog(s, 'p1');
    }
    console.log('✅ Stock logs seeded successfully.');

    // 5. Seed Telegram Alerts
    console.log(`📦 Seeding ${INITIAL_TELEGRAM_ALERTS.length} telegram alerts...`);
    for (const alert of INITIAL_TELEGRAM_ALERTS) {
      await PostgresService.saveAlert(alert);
    }
    console.log('✅ Telegram alerts seeded successfully.');

    // 6. Migrate any existing orders from db.json if present
    const dbJsonPath = path.join(process.cwd(), 'src', 'server', 'db.json');
    if (fs.existsSync(dbJsonPath)) {
      try {
        const raw = fs.readFileSync(dbJsonPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.orders && Array.isArray(parsed.orders) && parsed.orders.length > 0) {
          console.log(`📦 Migrating ${parsed.orders.length} orders from db.json...`);
          for (const order of parsed.orders) {
            await PostgresService.saveOrder(order);
          }
          console.log('✅ Existing orders from db.json migrated.');
        }
      } catch (err) {
        console.warn('Could not read existing db.json orders:', err);
      }
    }

    console.log('🎉 Neon PostgreSQL migration & seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();

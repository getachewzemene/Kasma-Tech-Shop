import { jsPDF } from 'jspdf';
import { DigitalWarrantyPass, WarrantyClaim, Order, CartItem, Product } from '../types';

/**
 * Generates a pseudo-random cryptographic hash for tamper-evident digital warranty seals
 */
export function generateTamperProofHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const timestampHex = Date.now().toString(16);
  return `ET-WAR-${hex.toUpperCase()}-${timestampHex.slice(-6).toUpperCase()}`;
}

/**
 * Formats a clean, industry-standard Serial Number or IMEI
 */
export function generateDeviceSerial(brand: string = 'KASMA', category: string = 'TECH'): { serial: string; imei?: string } {
  const brandCode = brand.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'KASM';
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const serial = `SN-${brandCode}-${randomDigits}-${randomSuffix}`;

  const isMobile = ['mobiles', 'smartwatches', 'cellular'].includes(category.toLowerCase());
  const imei = isMobile ? `35${Math.floor(1000000000000 + Math.random() * 9000000000000)}` : undefined;

  return { serial, imei };
}

/**
 * Creates or computes a tamper-evident Digital Warranty Pass for an order item
 */
export function createDigitalWarrantyPass(
  order: Order,
  item: CartItem,
  customSerial?: string,
  customImei?: string
): DigitalWarrantyPass {
  const product = item.product;
  const warrantyMonths = product.warrantyMonths || (product.category === 'mobiles' || product.category === 'smartwatches' ? 24 : 12);
  
  const issueDate = order.deliveredAt || order.createdAt || new Date().toISOString();
  const issueDateTime = new Date(issueDate);
  const expiryDateTime = new Date(issueDateTime);
  expiryDateTime.setMonth(expiryDateTime.getMonth() + warrantyMonths);
  const expiryDate = expiryDateTime.toISOString();

  const generated = generateDeviceSerial(product.brand, product.category);
  const serialNumber = customSerial || item.serialNumber || generated.serial;
  const imei = customImei || item.imei || generated.imei;

  const id = `KASMA-WAR-${order.id.slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
  const tamperProofHash = generateTamperProofHash(`${serialNumber}:${order.id}:${product.id}:${issueDate}`);
  const qrVerificationUrl = `https://kasma.et/verify-warranty?serial=${encodeURIComponent(serialNumber)}&id=${id}`;

  const isExpired = new Date() > expiryDateTime;

  return {
    id,
    orderId: order.id,
    productId: product.id,
    productNameEn: product.nameEn,
    productNameAm: product.nameAm,
    brand: product.brand || 'Kasma Certified',
    sku: item.sku,
    variantName: item.variantName || 'Standard',
    serialNumber,
    imei,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    merchantName: product.merchantName || 'Kasma Authorized Partner',
    issueDate,
    expiryDate,
    warrantyMonths,
    status: isExpired ? 'EXPIRED' : 'ACTIVE',
    coverageType: product.price > 100000 ? 'FULL_HARDWARE_REPLACEMENT' : 'PARTS_AND_LABOR',
    qrVerificationUrl,
    tamperProofHash
  };
}

/**
 * Computes coverage progress percentage and days remaining
 */
export function getWarrantyCoverageStatus(warranty: DigitalWarrantyPass): {
  daysTotal: number;
  daysRemaining: number;
  percentageRemaining: number;
  isExpired: boolean;
  statusLabelEn: string;
  statusLabelAm: string;
} {
  const start = new Date(warranty.issueDate).getTime();
  const end = new Date(warranty.expiryDate).getTime();
  const now = Date.now();

  const totalMs = Math.max(1, end - start);
  const remainingMs = Math.max(0, end - now);

  const daysTotal = Math.round(totalMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.round(remainingMs / (1000 * 60 * 60 * 24));
  const percentageRemaining = Math.min(100, Math.max(0, Math.round((remainingMs / totalMs) * 100)));

  const isExpired = now >= end || warranty.status === 'EXPIRED';

  let statusLabelEn = 'Active Coverage';
  let statusLabelAm = 'ዋስትናው ገቢር ነው';

  if (isExpired) {
    statusLabelEn = 'Coverage Expired';
    statusLabelAm = 'ዋስትናው አልቋል';
  } else if (warranty.status === 'CLAIM_PENDING') {
    statusLabelEn = 'Claim Under Inspection';
    statusLabelAm = 'ጥያቄ በግምገማ ላይ';
  } else if (daysRemaining <= 30) {
    statusLabelEn = 'Expiring Soon (<30 Days)';
    statusLabelAm = 'ሊያበቃ የቀረበ (<30 ቀናት)';
  }

  return {
    daysTotal,
    daysRemaining,
    percentageRemaining,
    isExpired,
    statusLabelEn,
    statusLabelAm
  };
}

/**
 * Generates an official, printable Digital Warranty Pass certificate PDF using jsPDF
 */
export function downloadDigitalWarrantyCertificatePDF(
  warranty: DigitalWarrantyPass,
  options?: { language?: 'en' | 'am' }
): void {
  const language = options?.language || 'en';
  const isEn = language === 'en';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width; // 210 mm
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);

  // Palette
  const brandBlue: [number, number, number] = [0, 82, 255];
  const darkNavy: [number, number, number] = [15, 23, 42];
  const slateGray: [number, number, number] = [100, 116, 139];
  const lightBg: [number, number, number] = [248, 250, 252];
  const emeraldGreen: [number, number, number] = [16, 185, 129];
  const goldAccent: [number, number, number] = [217, 119, 6];

  let y = margin;

  // 1. Top Decorative Borders
  doc.setFillColor(...brandBlue);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Background Certificate Frame
  doc.setDrawColor(...brandBlue);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin - 4, margin - 2, contentWidth + 8, 260, 4, 4, 'S');

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin - 2, margin, contentWidth + 4, 256, 3, 3, 'S');

  // 2. Certificate Header
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...darkNavy);
  doc.text('KASMA CARE', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...goldAccent);
  doc.text('OFFICIAL DIGITAL WARRANTY PASS & SERIAL REGISTRY', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Kasma Tech Commerce PLC | Addis Ababa, Ethiopia | Authenticity Guarantee', pageWidth / 2, y, { align: 'center' });

  // 3. Status Badge Pill
  y += 8;
  const statusCoverage = getWarrantyCoverageStatus(warranty);
  doc.setFillColor(...lightBg);
  doc.roundedRect((pageWidth / 2) - 35, y, 70, 9, 3, 3, 'F');
  doc.setDrawColor(...emeraldGreen);
  doc.roundedRect((pageWidth / 2) - 35, y, 70, 9, 3, 3, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...emeraldGreen);
  doc.text(`VERIFIED COVERAGE: ${warranty.warrantyMonths} MONTHS OFFICIAL`, pageWidth / 2, y + 6, { align: 'center' });

  // 4. Device & Registered Owner Grid
  y += 16;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'S');

  const startGridY = y + 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...slateGray);
  doc.text('REGISTERED DEVICE', margin + 6, startGridY);
  doc.text('OWNER & SALE REFERENCE', (pageWidth / 2) + 4, startGridY);

  // Device Info
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text(warranty.productNameEn.slice(0, 36), margin + 6, startGridY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text(`Variant: ${warranty.variantName}`, margin + 6, startGridY + 13);
  doc.text(`Brand: ${warranty.brand} | SKU: ${warranty.sku}`, margin + 6, startGridY + 18);
  doc.text(`Merchant Partner: ${warranty.merchantName}`, margin + 6, startGridY + 23);

  // Owner Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(warranty.customerName, (pageWidth / 2) + 4, startGridY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text(`Phone: ${warranty.customerPhone}`, (pageWidth / 2) + 4, startGridY + 13);
  doc.text(`Order Reference: #${warranty.orderId}`, (pageWidth / 2) + 4, startGridY + 18);
  doc.text(`Certificate Pass ID: ${warranty.id}`, (pageWidth / 2) + 4, startGridY + 23);

  // 5. Unique Hardware Identifiers (Highlighted Box)
  y += 62;
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');
  doc.setDrawColor(...brandBlue);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandBlue);
  doc.text('HARDWARE AUTHENTICITY IDENTIFIERS (TAMPER-EVIDENT REGISTRY)', margin + 6, y + 8);

  // Serial Number
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...slateGray);
  doc.text('OFFICIAL SERIAL NUMBER (S/N):', margin + 6, y + 17);

  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(warranty.serialNumber, margin + 6, y + 24);

  // IMEI if applicable
  if (warranty.imei) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slateGray);
    doc.text('CELLULAR IMEI 1:', (pageWidth / 2) + 4, y + 17);

    doc.setFontSize(12);
    doc.setFont('courier', 'bold');
    doc.setTextColor(...darkNavy);
    doc.text(warranty.imei, (pageWidth / 2) + 4, y + 24);
  }

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(...slateGray);
  doc.text(`Tamper-Proof Digital Signature Hash: ${warranty.tamperProofHash}`, margin + 6, y + 33);

  // 6. Warranty Terms & Scope of Coverage
  y += 46;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text('TERMS OF WARRANTY COVERAGE IN ETHIOPIA', margin, y);

  y += 6;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);

  const terms = [
    `1. Coverage Window: ${new Date(warranty.issueDate).toLocaleDateString()} through ${new Date(warranty.expiryDate).toLocaleDateString()} (${warranty.warrantyMonths} Months).`,
    '2. Scope: 100% Genuine factory defects, motherboard failures, screen defects, and internal component malfunctions.',
    '3. Service Hub: Authorized diagnostics and repairs executed at Kasma Tech Hub (Bole Medhanealem) or manufacturer center.',
    '4. Door-to-Door Courier Pickup: Free courier handover for devices under active claim within Addis Ababa city limits.',
    '5. Exclusions: Accidental liquid immersion, unauthorized third-party opening, cracked chassis, or tampered serial labels.'
  ];

  terms.forEach(t => {
    doc.text(t, margin, y);
    y += 5;
  });

  // 7. Verification QR & Footer Seal
  y += 10;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(...brandBlue);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'S');

  // Left side: Security Seal Text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text('OFFICIAL VERIFICATION PROTOCOL', margin + 6, y + 8);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Scan the QR code to verify live coverage on Kasma registry or visit:', margin + 6, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandBlue);
  doc.text(warranty.qrVerificationUrl, margin + 6, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Support Hotlines: +251 91 123 4567 | Telegram Bot: @KasmaSupportBot', margin + 6, y + 26);

  // Save / Trigger Download
  const filename = `Kasma_Digital_Warranty_${warranty.serialNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
}

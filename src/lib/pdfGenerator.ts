import { jsPDF } from 'jspdf';
import { Order } from '../types';

/**
 * Generates and downloads an Official Ethiopian Commercial Tax Invoice & Warranty Certificate (PDF)
 * Suitable for customer records, business accounting, and warranty claims across Addis Ababa.
 */
export function generateCustomerReceiptPDF(order: Order, options?: { language?: 'en' | 'am' }): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width; // 210 mm
  const pageHeight = doc.internal.pageSize.height; // 297 mm
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Brand Palette
  const primaryColor: [number, number, number] = [0, 82, 255]; // #0052FF Kasma Electric Blue
  const darkColor: [number, number, number] = [24, 24, 27]; // #18181B
  const grayColor: [number, number, number] = [100, 116, 139]; // #64748B
  const lightBg: [number, number, number] = [248, 250, 252]; // #F8FAFC
  const borderColor: [number, number, number] = [226, 232, 240]; // #E2E8F0

  let y = margin;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // 2. Header: Logo & Commercial Registration
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...darkColor);
  doc.text('KASMA TECH SHOP', margin, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  y += 5;
  doc.text('Ethiopian Premier Consumer Electronics & Tech Marketplace', margin, y);
  y += 4;
  doc.text('TIN: 0098471201 | VAT Reg: 84920194 | Bole Sub-City, Addis Ababa, Ethiopia', margin, y);
  y += 4;
  doc.text('Web: kasma.et | Tel: +251 91 123 4567 | Telegram: @KasmaSupport', margin, y);

  // Right-aligned Invoice Badge
  doc.setFillColor(...lightBg);
  doc.roundedRect(pageWidth - margin - 60, margin + 4, 60, 22, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(pageWidth - margin - 60, margin + 4, 60, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('TAX INVOICE & WARRANTY', pageWidth - margin - 30, margin + 10, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text(`Ref: #${order.id}`, pageWidth - margin - 30, margin + 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`Date: ${formattedDate}`, pageWidth - margin - 30, margin + 20, { align: 'center' });

  // Divider line
  y += 8;
  doc.setDrawColor(...borderColor);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // 3. Information Cards: Customer & Shipping | Payment & Transaction
  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 36;

  // Left Card: Customer & Delivery Destination
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('CUSTOMER & DELIVERY DESTINATION', margin + 4, y + 6);

  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(order.customerName || 'Valued Shopper', margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Phone: ${order.customerPhone || 'N/A'}`, margin + 4, y + 17);
  doc.text(`Sub-City: ${order.subCity || 'Bole'}, Addis Ababa`, margin + 4, y + 22);

  const addressText = doc.splitTextToSize(`Address: ${order.shippingAddress || 'Bole, Addis Ababa'}`, cardWidth - 8);
  doc.text(addressText, margin + 4, y + 27);

  // Right Card: Payment & Escrow Settlement
  const rightCardX = margin + cardWidth + 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(rightCardX, y, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(rightCardX, y, cardWidth, cardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('PAYMENT & ESCROW SETTLEMENT', rightCardX + 4, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text(`Payment Rail: ${order.paymentMethod || 'TELEBIRR'}`, rightCardX + 4, y + 12);

  const isPaid = order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED';
  doc.text(`Payment Status: ${isPaid ? 'PAID / SETTLED' : 'CASH ON DELIVERY (PENDING)'}`, rightCardX + 4, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Tx Reference: ${order.paymentId || order.id}`, rightCardX + 4, y + 22);
  doc.text(`Channel: ${order.channel || 'WEB_APP'} (Kasma Secure Escrow)`, rightCardX + 4, y + 27);
  if ((order as any).codVerificationPin) {
    doc.text(`COD Verification PIN: ${(order as any).codVerificationPin}`, rightCardX + 4, y + 32);
  }

  y += cardHeight + 8;

  // 4. Line Items Table
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 3, y + 4.8);
  doc.text('ITEM DESCRIPTION', margin + 12, y + 4.8);
  doc.text('VARIANT / SKU', margin + 95, y + 4.8);
  doc.text('QTY', margin + 130, y + 4.8, { align: 'center' });
  doc.text('UNIT PRICE', margin + 155, y + 4.8, { align: 'right' });
  doc.text('TOTAL (ETB)', margin + contentWidth - 3, y + 4.8, { align: 'right' });

  y += 7;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  order.items.forEach((item, index) => {
    const isAlt = index % 2 === 1;
    if (isAlt) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }

    doc.setDrawColor(...borderColor);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    doc.setTextColor(...grayColor);
    doc.text(`${index + 1}`, margin + 3, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    const title = item.product.nameEn.length > 40 ? item.product.nameEn.slice(0, 38) + '...' : item.product.nameEn;
    doc.text(title, margin + 12, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    const variantDesc = item.variantName || item.sku || 'Standard';
    doc.text(variantDesc.length > 20 ? variantDesc.slice(0, 18) + '..' : variantDesc, margin + 95, y + 5.5);

    doc.text(`${item.quantity}`, margin + 130, y + 5.5, { align: 'center' });
    doc.text(`${item.price.toLocaleString()} ETB`, margin + 155, y + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    const itemTotal = item.price * item.quantity;
    doc.text(`${itemTotal.toLocaleString()} ETB`, margin + contentWidth - 3, y + 5.5, { align: 'right' });

    y += 8;
  });

  y += 4;

  // 5. Financial Summary Totals (Right Side)
  const summaryBoxWidth = 75;
  const summaryX = margin + contentWidth - summaryBoxWidth;

  const drawSummaryLine = (label: string, value: string, isBold: boolean = false, isAccent: boolean = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 9 : 8);
    if (isAccent) {
      doc.setTextColor(...primaryColor);
    } else {
      doc.setTextColor(isBold ? darkColor[0] : grayColor[0], isBold ? darkColor[1] : grayColor[1], isBold ? darkColor[2] : grayColor[2]);
    }
    doc.text(label, summaryX, y);
    doc.text(value, margin + contentWidth - 3, y, { align: 'right' });
    y += 5;
  };

  drawSummaryLine('Items Subtotal:', `${order.subtotal.toLocaleString()} ETB`);
  drawSummaryLine('Express Addis Delivery:', `${order.shippingFee.toLocaleString()} ETB`);
  if (order.discountAmount && order.discountAmount > 0) {
    drawSummaryLine('Promotional Discount:', `-${order.discountAmount.toLocaleString()} ETB`);
  }

  // Grand Total Box
  doc.setFillColor(...lightBg);
  doc.roundedRect(summaryX - 3, y - 2, summaryBoxWidth + 3, 9, 1.5, 1.5, 'F');
  doc.setDrawColor(...primaryColor);
  doc.roundedRect(summaryX - 3, y - 2, summaryBoxWidth + 3, 9, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL AMOUNT:', summaryX, y + 4.5);
  doc.text(`${order.total.toLocaleString()} ETB`, margin + contentWidth - 3, y + 4.5, { align: 'right' });

  y += 18;

  // 6. Warranty Terms & Official Seal Box
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('1-YEAR KASMA OFFICIAL WARRANTY & SATISFACTION POLICY', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('1. All electronics listed on Kasma Tech Shop carry a 12-month distributor warranty for manufacturing defects.', margin + 4, y + 11);
  doc.text('2. 7-day hassle-free replacement guarantee: return item in original box for immediate exchange or escrow refund.', margin + 4, y + 15);
  doc.text('3. Official service center locations: Bole Edna Mall, Kazanchis Commercial Center, and Piassa Branch.', margin + 4, y + 19);
  doc.text('4. Keep this document or show your Order Reference ID to claim warranty repairs and dispatch assistance.', margin + 4, y + 23);

  // Digital Stamp Box
  doc.setDrawColor(...primaryColor);
  doc.roundedRect(pageWidth - margin - 48, y + 4, 44, 24, 1.5, 1.5, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...primaryColor);
  doc.text('KASMA ENTERPRISE ET', pageWidth - margin - 26, y + 10, { align: 'center' });
  doc.text('OFFICIALLY VERIFIED', pageWidth - margin - 26, y + 15, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setTextColor(...grayColor);
  doc.text('ELECTRONIC TAX COMPLIANCE', pageWidth - margin - 26, y + 20, { align: 'center' });
  doc.text(`SECURE ID: #${order.id.slice(0, 10)}`, pageWidth - margin - 26, y + 24, { align: 'center' });

  // 7. Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 170, 180);
  doc.text('Thank you for shopping with Kasma Tech Shop - Connecting Ethiopia to Genuine Technology.', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Download PDF file
  const fileName = `Kasma-Receipt-${order.id}.pdf`;
  doc.save(fileName);
}

/**
 * Generates and downloads a Courier Delivery Waybill & Merchant Packing Slip (PDF).
 * Specially formatted for physical package attachment and courier dispatch verification.
 */
export function generateCourierWaybillPDF(order: Order, options?: { merchantStoreName?: string }): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  const primaryColor: [number, number, number] = [0, 82, 255];
  const darkColor: [number, number, number] = [24, 24, 27];
  const grayColor: [number, number, number] = [100, 116, 139];
  const lightBg: [number, number, number] = [248, 250, 252];
  const borderColor: [number, number, number] = [200, 210, 220];
  const alertBg: [number, number, number] = [254, 243, 199]; // Amber
  const alertBorder: [number, number, number] = [245, 158, 11];

  let y = margin;

  // 1. COD or Prepaid Collection Warning Banner across top
  const isCod = order.paymentMethod === 'COD';
  if (isCod) {
    doc.setFillColor(...alertBg);
    doc.rect(0, 0, pageWidth, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text(`ATTENTION COURIER: CASH ON DELIVERY ORDER - COLLECT ${order.total.toLocaleString()} ETB BEFORE HANDOVER`, pageWidth / 2, 6.5, { align: 'center' });
  } else {
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.rect(0, 0, pageWidth, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(4, 120, 87);
    doc.text('PREPAID ESCROW ORDER - DO NOT COLLECT CASH - VERIFY RECIPIENT PHONE AT HANDOVER', pageWidth / 2, 6.5, { align: 'center' });
  }

  y += 4;

  // 2. Header
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...darkColor);
  doc.text('KASMA EXPRESS LOGISTICS', margin, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  y += 5;
  doc.text('Addis Ababa Express Dispatch Network | Same-Day Delivery Fleet', margin, y);

  // Large Order ID for warehouse scanners
  doc.setFillColor(...lightBg);
  doc.roundedRect(pageWidth - margin - 65, y - 8, 65, 18, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(pageWidth - margin - 65, y - 8, 65, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('WAYBILL TRACKING #', pageWidth - margin - 32.5, y - 3, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(`#${order.id}`, pageWidth - margin - 32.5, y + 4, { align: 'center' });

  y += 8;
  doc.setDrawColor(...borderColor);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // 3. Highlighted Recipient Delivery Box (Large & High Visibility for Driver)
  doc.setFillColor(239, 246, 255); // Soft blue
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'S');
  doc.setLineWidth(0.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('RECIPIENT & DELIVERY DESTINATION (DRIVER INSTRUCTIONS)', margin + 4, y + 6);

  doc.setFontSize(13);
  doc.setTextColor(...darkColor);
  doc.text(order.customerName || 'Customer', margin + 4, y + 13);

  // Big, readable telephone number for motorbike courier
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`PHONE: ${order.customerPhone || 'N/A'}`, margin + 4, y + 20);

  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(`Sub-City: ${order.subCity || 'Bole'}, Addis Ababa`, margin + 4, y + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  const instructions = order.deliveryInstructions 
    ? `Landmark/Instructions: ${order.deliveryInstructions}` 
    : `Address: ${order.shippingAddress}`;
  doc.text(doc.splitTextToSize(instructions, contentWidth - 8), margin + 4, y + 32);

  y += 44;

  // 4. Two Column Info: Dispatch Origin vs Assigned Courier
  const colW = (contentWidth - 6) / 2;
  const colH = 30;

  // Origin (Merchant)
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, colW, colH, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, colW, colH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text('DISPATCH ORIGIN (MERCHANT)', margin + 4, y + 6);

  const merchantName = options?.merchantStoreName || order.items[0]?.product.merchantName || 'Kasma Certified Merchant';
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text(merchantName, margin + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Hub: Central Addis Electronics Warehouse', margin + 4, y + 19);
  doc.text(`Dispatched: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, margin + 4, y + 24);

  // Assigned Courier
  const col2X = margin + colW + 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(col2X, y, colW, colH, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(col2X, y, colW, colH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text('ASSIGNED COURIER / DRIVER', col2X + 4, y + 6);

  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(order.courierName || 'Addis Express Motorbike Courier', col2X + 4, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Courier Tel: ${order.courierPhone || '+251 91 100 2233'}`, col2X + 4, y + 19);
  doc.text(`Status: ${order.status} (${order.status === 'SHIPPED' ? 'Out for Delivery' : 'In Fulfillment'})`, col2X + 4, y + 24);

  y += colH + 8;

  // 5. Package Contents Checklist
  doc.setFillColor(...darkColor);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('CHECK', margin + 3, y + 4.8);
  doc.text('SKU CODE', margin + 20, y + 4.8);
  doc.text('ITEM SPECIFICATION', margin + 55, y + 4.8);
  doc.text('QTY', margin + 140, y + 4.8, { align: 'center' });
  doc.text('PACKAGE STATUS', margin + contentWidth - 3, y + 4.8, { align: 'right' });

  y += 7;

  order.items.forEach((item, idx) => {
    doc.setFillColor(idx % 2 === 1 ? 250 : 255, idx % 2 === 1 ? 250 : 255, idx % 2 === 1 ? 250 : 255);
    doc.rect(margin, y, contentWidth, 8, 'F');

    doc.setDrawColor(...borderColor);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    // Checkbox box for physical inspection
    doc.setDrawColor(...grayColor);
    doc.rect(margin + 4, y + 2, 4, 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(item.sku || `SKU-${idx + 1}`, margin + 20, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    const itemName = item.product.nameEn.length > 42 ? item.product.nameEn.slice(0, 40) + '..' : item.product.nameEn;
    doc.text(itemName, margin + 55, y + 5.5);

    doc.text(`${item.quantity} pcs`, margin + 140, y + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129); // green
    doc.text('Sealed & Verified', margin + contentWidth - 3, y + 5.5, { align: 'right' });

    y += 8;
  });

  y += 6;

  // Settlement Banner
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(`Payment Method: ${order.paymentMethod}`, margin + 6, y + 7.5);

  if (isCod) {
    doc.setTextColor(180, 83, 9);
    doc.text(`AMOUNT TO COLLECT: ${order.total.toLocaleString()} ETB`, margin + contentWidth - 6, y + 7.5, { align: 'right' });
  } else {
    doc.setTextColor(4, 120, 87);
    doc.text(`PREPAID TOTAL: ${order.total.toLocaleString()} ETB (COLLECT 0 ETB)`, margin + contentWidth - 6, y + 7.5, { align: 'right' });
  }

  y += 20;

  // 6. Tri-Part Handover Signoff Blocks (Warehouse -> Courier -> Customer)
  const signColW = (contentWidth - 8) / 3;
  const signColH = 34;

  const drawSignBox = (xPos: string | number, title: string, subtitle: string) => {
    const x = typeof xPos === 'number' ? xPos : parseFloat(xPos);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, signColW, signColH, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryColor);
    doc.text(title, x + 3, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...grayColor);
    doc.text(subtitle, x + 3, y + 10);

    // Signature line
    doc.setDrawColor(...borderColor);
    doc.line(x + 4, y + 25, x + signColW - 4, y + 25);
    doc.text('Signature & Date Stamp', x + 4, y + 29);
  };

  drawSignBox(margin, '1. WAREHOUSE DISPATCH', 'Package sealed & handed to driver');
  drawSignBox(margin + signColW + 4, '2. COURIER ACCEPTANCE', 'Driver confirms package condition');
  drawSignBox(margin + (signColW * 2) + 8, '3. CUSTOMER HANDOVER', 'Customer received package & OTP');

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(160, 170, 180);
  doc.text('Kasma Logistics - Bole Dispatch Hub, Addis Ababa | Hotline: +251 91 123 4567', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Download PDF file
  const fileName = `Kasma-Waybill-${order.id}.pdf`;
  doc.save(fileName);
}

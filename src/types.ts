export interface Product {
  id: string;
  nameEn: string;
  nameAm: string;
  descriptionEn: string;
  descriptionAm: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  variants: Variant[];
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  lowStockThreshold: number;
  merchantId: string;
  merchantName: string;
  merchantTelegram?: string;
  rating?: number;
  featured?: boolean;
  createdAt?: string;
  reviews?: Review[];
  condition?: 'SEALED' | 'BRAND_NEW' | 'OPEN_BOX' | 'CERTIFIED_REFURBISHED' | 'BRAND_NEW_SEALED';
  conditionTextEn?: string;
  conditionTextAm?: string;
  warrantyMonths?: number;
  warrantyTextEn?: string;
  warrantyTextAm?: string;
  specs?: TechSpecs;
}

export interface TechSpecs {
  ram?: string;
  cpu?: string;
  gpu?: string;
  battery?: string;
  storage?: string;
  display?: string;
  os?: string;
  weight?: string;
  camera?: string;
  charging?: string;
  connectivity?: string;
  ports?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerPhone?: string;
  orderId?: string;
  productId?: string;
  merchantId?: string;
  deliveryRating?: number;
  tags?: string[];
  createdAt: string;
  verifiedPurchase?: boolean;
}

export interface Variant {
  sku: string;
  name: string;
  priceOffset: number;
  onHand: number;
  reserved: number;
}

export interface DigitalWarrantyPass {
  id: string; // e.g. "KASMA-WAR-84920"
  orderId: string;
  productId: string;
  productNameEn: string;
  productNameAm: string;
  brand: string;
  sku: string;
  variantName: string;
  serialNumber: string;
  imei?: string;
  customerName: string;
  customerPhone: string;
  merchantName: string;
  issueDate: string; // ISO date
  expiryDate: string; // ISO date
  warrantyMonths: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIM_PENDING' | 'REPLACED' | 'VOIDED';
  coverageType: 'FULL_HARDWARE_REPLACEMENT' | 'PARTS_AND_LABOR' | 'MANUFACTURER_WARRANTY';
  qrVerificationUrl: string;
  tamperProofHash: string;
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  orderId: string;
  productId: string;
  productName: string;
  serialNumber: string;
  customerName: string;
  customerPhone: string;
  issueType: 'SCREEN_DISPLAY' | 'BATTERY_CHARGING' | 'MOTHERBOARD_POWER' | 'AUDIO_SPEAKER' | 'ACCESSORY_DEFECT' | 'OTHER';
  description: string;
  serviceMethod: 'COURIER_PICKUP' | 'SERVICE_CENTER_WALKIN';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'INSPECTION_SCHEDULED' | 'APPROVED_REPAIR' | 'APPROVED_REPLACEMENT' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

export interface CartItem {
  product: Product;
  sku: string;
  variantName: string;
  quantity: number;
  price: number;
  serialNumber?: string;
  imei?: string;
  warrantyCertificateId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: 'TELEBIRR' | 'CHAPA' | 'COD' | 'CBE_BIRR';
  paymentId?: string;
  shippingAddress: string;
  subCity?: string;
  landmark?: string;
  coordinates?: { lat: number; lng: number };
  gateNotes?: string;
  createdAt: string;
  channel: 'WEB' | 'TELEGRAM_MINI_APP' | 'MOBILE';
  discountCode?: string;
  discountAmount?: number;
  codVerificationPin?: string;
  codPhoneConfirmed?: boolean;
  chapaReference?: string;
  chapaMethod?: string;
  courierName?: string;
  courierPhone?: string;
  trackingNotes?: string;
  packedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  reviewed?: boolean;
  reviewedAt?: string;
  orderReviews?: { productId: string; rating: number; comment: string; createdAt: string }[];
  warranties?: DigitalWarrantyPass[];
  warrantyClaims?: WarrantyClaim[];
  deliveryInstructions?: string;
}

export interface StockMovementLog {
  id: string;
  sku: string;
  productName: string;
  previousQty: number;
  newQty: number;
  difference: number;
  reason: string;
  actor: string;
  timestamp: string;
}

export interface Merchant {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  password?: string;
  telegramUsername?: string;
  telegramChatId?: string;
  telegramNotificationsEnabled?: boolean;
  telegramLowStockAlerts?: boolean;
  lowStockThreshold?: number;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';
  kycStatus: 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'APPROVED';
  kycDocument?: string;
  balance: number;
  payouts: Payout[];
}

export interface Payout {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export interface TelegramAlert {
  id: string;
  type: 'ORDER_NEW' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DAILY_SUMMARY' | 'WEEKLY_SUMMARY' | 'PAYMENT_FAILED' | 'ORDER_CONFIRMATION' | 'SHIPPING_UPDATE' | 'PRICE_DROP' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_PACKED' | 'ORDER_DELAYED' | 'CLAIM_NEW';
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  chatId?: string;
}

export interface TelegramUserSettings {
  isConnected: boolean;
  telegramUsername: string;
  chatId: string;
  pairingCode: string;
  orderConfirmations: boolean;
  shippingUpdates: boolean;
  priceDropAlerts: boolean;
  telegramDeals: boolean;
  lowStockAlerts?: boolean;
  lowStockThreshold?: number;
  botToken?: string;
}

export interface TelegramMessageLog {
  id: string;
  type: 'ORDER_CONFIRMATION' | 'SHIPPING_UPDATE' | 'PRICE_DROP' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'TEST';
  title: string;
  formattedText: string;
  buttons?: { label: string; actionUrl?: string; actionType?: string }[];
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
}

export interface PriceAlert {
  productId: string;
  thresholdPrice: number;
}

export interface PromoCode {
  code: string;
  type: 'PERCENTAGE' | 'FLAT' | 'FREE_SHIPPING';
  value: number;
  minSubtotal?: number;
  descriptionEn: string;
  descriptionAm: string;
}

export interface DeliveryAddress {
  id: string;
  label: 'HOME' | 'OFFICE' | 'OTHER';
  fullName: string;
  phone: string;
  subCity: string;
  woreda?: string;
  streetAddress: string;
  isDefault: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  type: 'TELEBIRR' | 'CHAPA' | 'BANK_CARD' | 'CBE_BIRR';
  title: string;
  accountMasked: string;
  encryptedToken: string;
  isDefault: boolean;
  expiryDate?: string;
}

export interface KasmaPointsReward {
  id: string;
  titleEn: string;
  titleAm: string;
  pointsCost: number;
  discountValue: number;
  type: 'FLAT_DISCOUNT' | 'FREE_SHIPPING';
  code: string;
}

export interface KasmaPointsLog {
  id: string;
  titleEn: string;
  titleAm: string;
  points: number;
  timestamp: string;
  type: 'EARNED' | 'REDEEMED' | 'BONUS';
}



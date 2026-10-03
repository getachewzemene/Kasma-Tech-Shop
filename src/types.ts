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
  featured?: boolean;
  createdAt?: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerPhone?: string;
  createdAt: string;
}

export interface Variant {
  sku: string;
  name: string;
  priceOffset: number;
  onHand: number;
  reserved: number;
}

export interface CartItem {
  product: Product;
  sku: string;
  variantName: string;
  quantity: number;
  price: number;
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
  paymentMethod: 'TELEBIRR' | 'CHAPA' | 'METAMASK' | 'COD';
  paymentId?: string;
  shippingAddress: string;
  createdAt: string;
  channel: 'WEB' | 'TELEGRAM_MINI_APP' | 'MOBILE';
  discountCode?: string;
  discountAmount?: number;
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
  type: 'ORDER_NEW' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DAILY_SUMMARY' | 'WEEKLY_SUMMARY' | 'PAYMENT_FAILED' | 'ORDER_CONFIRMATION' | 'SHIPPING_UPDATE' | 'PRICE_DROP';
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
  botToken?: string;
}

export interface TelegramMessageLog {
  id: string;
  type: 'ORDER_CONFIRMATION' | 'SHIPPING_UPDATE' | 'PRICE_DROP' | 'TEST';
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
  type: 'TELEBIRR' | 'CHAPA' | 'BANK_CARD' | 'CBE_BIRR' | 'METAMASK';
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



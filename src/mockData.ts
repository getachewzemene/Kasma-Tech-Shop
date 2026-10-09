import { Product, Merchant, AuditLog, StockMovementLog, TelegramAlert } from './types';

export const INITIAL_CATEGORIES = [
  { id: 'computers', nameEn: 'Computer & Laptop', nameAm: 'ኮምፒውተር እና ላፕቶፕ' },
  { id: 'smartwatches', nameEn: 'Smartwatches', nameAm: 'ስማርት ሰዓቶች' },
  { id: 'gaming', nameEn: 'Gaming & Consoles', nameAm: 'የቪዲዮ ጌም ኮንሶሎች' },
  { id: 'mobiles', nameEn: 'Mobile & Tablets', nameAm: 'ሞባይል እና ታብሌቶች' },
  { id: 'headphones', nameEn: 'Headphones & Audio', nameAm: 'ጆሮ ማዳመጫ እና ኦዲዮ' },
  { id: 'accessories', nameEn: 'Accessories', nameAm: 'መለዋወጫዎች' },
  { id: 'cameras', nameEn: 'Cameras & Security', nameAm: 'ካሜራ እና ሴኪውሪቲ' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p8',
    nameEn: 'Sennheiser Momentum True Wireless 4 Earbuds',
    nameAm: 'ሴንሃይዘር ሞመንተም ትሩ ዋየርለስ 4 ብሉቱዝ',
    descriptionEn: 'Audiophile-quality wireless earbuds with personalized adaptive noise cancellation and next-generation lossless audio technology.',
    descriptionAm: 'እጅግ ጥራት ያለው የሙዚቃ ድምፅ የሚሰጥ ብሉቱዝ ማዳመጫ፣ ከራስዎ ፍላጎት ጋር የሚስማማ የድምፅ መከላከያ እና አዲስ ትውልድ የኦዲዮ ቴክኖሎጂ ያለው።',
    price: 18500,
    category: 'headphones',
    brand: 'Sennheiser',
    image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=800&q=80',
    lowStockThreshold: 3,
    merchantId: 'm1',
    merchantName: 'Girma Tech Store',
    status: 'APPROVED',
    variants: [
      { sku: 'SEN-MT4-BLK', name: 'Black Copper', priceOffset: 0, onHand: 4, reserved: 0 },
      { sku: 'SEN-MT4-SLV', name: 'Metallic Silver', priceOffset: 0, onHand: 3, reserved: 0 }
    ],
    featured: true,
    condition: 'SEALED',
    conditionTextEn: 'Factory Sealed',
    conditionTextAm: 'በፋብሪካው የታሸገ',
    warrantyMonths: 12,
    warrantyTextEn: '12 Months Official Warranty',
    warrantyTextAm: 'የ12 ወራት   ዋስትና'
  },
  {
    id: 'p1',
    nameEn: 'SteelSeries Arctis Nova Pro Wireless Headset',
    nameAm: 'ስቲልሲሪስ አርክቲክስ ኖቫ ፕሮ ገመድ አልባ የጌሚንግ ማዳመጫ',
    descriptionEn: 'Premium high-fidelity gaming headset featuring Active Noise Cancellation, dual-system connection, and hot-swappable dual battery system.',
    descriptionAm: 'ምርጥ ጥራት ያለው የጌሚንግ ማዳመጫ ከግርግር መከላከያ (Active Noise Cancellation)፣ ሁለት ሲስተም በአንድ ጊዜ የማገናኘት ብቃት እና ተለዋዋጭ ባትሪዎች ያሉት።',
    price: 19500,
    category: 'gaming',
    brand: 'SteelSeries',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 5,
    merchantId: 'm1',
    merchantName: 'Girma Tech Store',
    status: 'APPROVED',
    variants: [
      { sku: 'SS-ANP-BLK', name: 'Charcoal Black', priceOffset: 0, onHand: 18, reserved: 0 },
      { sku: 'SS-ANP-WHT', name: 'White Edition', priceOffset: 1200, onHand: 12, reserved: 1 }
    ],
    featured: true,
    condition: 'SEALED',
    conditionTextEn: 'Factory Sealed',
    conditionTextAm: 'በፋብሪካው የታሸገ',
    warrantyMonths: 12,
    warrantyTextEn: '12 Months Official Warranty',
    warrantyTextAm: 'የ12 ወራት ዋስትና'
  },
  {
    id: 'p2',
    nameEn: 'Sony WF-1000XM5 True Wireless Earbuds',
    nameAm: 'ሶኒ WF-1000XM5 ገመድ አልባ ብሉቱዝ ኢርበድስ',
    descriptionEn: 'Industry-leading noise cancelling wireless earbuds with rich, spatial audio, crystal-clear call quality, and high-res audio support.',
    descriptionAm: 'በከፍተኛ የድምጽ ማደሻ እና ድምጽ መከላከያ ቴክኖሎጂ ቀዳሚ የሆነው ሶኒ ብሉቱዝ ኢርበድስ፣ እጅግ ግልጽ የስልክ ጥሪ እና ሰፊ የድምፅ ጥራት ያለው።',
    price: 16500,
    category: 'headphones',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 3,
    merchantId: 'm2',
    merchantName: 'Abebe Gadget Hub',
    status: 'APPROVED',
    variants: [
      { sku: 'SNY-XM5-BLK', name: 'Matte Black', priceOffset: 0, onHand: 8, reserved: 0 },
      { sku: 'SNY-XM5-SLV', name: 'Platinum Silver', priceOffset: 500, onHand: 4, reserved: 0 }
    ],
    featured: true,
    condition: 'BRAND_NEW',
    conditionTextEn: 'Brand New',
    conditionTextAm: 'አዲስ (ያልተከፈተ)',
    warrantyMonths: 12,
    warrantyTextEn: '12 Months Official Warranty',
    warrantyTextAm: 'የ12 ወራት   ዋስትና'
  },
  {
    id: 'p3',
    nameEn: 'Apple Watch Ultra 2 GPS + Cellular Titanium',
    nameAm: 'አፕል ዎች አልትራ 2 የስማርት ሰዓት',
    descriptionEn: 'The ultimate sports and adventure smartwatch. Features a robust aerospace-grade titanium case, precision dual-frequency GPS, and up to 36 hours of battery life.',
    descriptionAm: 'ለስፖርት እና ለጀብዱ የተነደፈ የመጨረሻው ስማርት ሰዓት። ጠንካራ የቲታኒየም አካል፣ እጅግ ትክክለኛ ጂፒኤስ እና እስከ 36 ሰዓታት የሚቆይ ባትሪ ያለው።',
    price: 68000,
    category: 'smartwatches',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 4,
    merchantId: 'm3',
    merchantName: 'Kasma Authorized Reseller',
    status: 'APPROVED',
    variants: [
      { sku: 'AWU2-49', name: '49mm Titanium Case', priceOffset: 0, onHand: 15, reserved: 2 }
    ],
    featured: true,
    condition: 'SEALED',
    conditionTextEn: 'Factory Sealed',
    conditionTextAm: 'በፋብሪካው የታሸገ',
    warrantyMonths: 24,
    warrantyTextEn: '24 Months Official Warranty',
    warrantyTextAm: 'የ24 ወራት   ዋስትና'
  },
  {
    id: 'p4',
    nameEn: 'Marshall Stanmore III Bluetooth Speaker',
    nameAm: 'ማርሻል ስታንሞር III ብሉቱዝ ስፒከር',
    descriptionEn: 'Bring your home to life with room-filling, legendary Marshall signature sound, redesigned for an even wider and more immersive soundstage.',
    descriptionAm: 'ያለዎትን ሰፊ ቦታ በሚያናውጥ እና በሚያምር ድምፅ በሚታወቀው ማርሻል ስፒከር ቤቶን ያድምቁት። አዲስ እና ሰፊ የድምጽ ስርጭት ያለው።',
    price: 31500,
    category: 'headphones',
    brand: 'Marshall',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 4,
    merchantId: 'm2',
    merchantName: 'Abebe Gadget Hub',
    status: 'APPROVED',
    variants: [
      { sku: 'MS-STN3-BLK', name: 'Black Gold Classic', priceOffset: 0, onHand: 10, reserved: 1 },
      { sku: 'MS-STN3-BRW', name: 'Vintage Brown', priceOffset: 1200, onHand: 6, reserved: 0 }
    ],
    featured: true,
    condition: 'BRAND_NEW',
    conditionTextEn: 'Brand New',
    conditionTextAm: 'አዲስ',
    warrantyMonths: 12,
    warrantyTextEn: '12 Months Official Warranty',
    warrantyTextAm: 'የ12 ወራት   ዋስትና'
  },
  {
    id: 'p5',
    nameEn: 'Hikvision PTZ Smart Outdoor CCTV Camera 4K',
    nameAm: 'ሃይክቪዥን PTZ ስማርት የውጭ CCTV ካሜራ 4K',
    descriptionEn: 'Professional-grade 4K security camera with intelligent AI human detection, 360-degree pan-tilt-zoom, and color night vision.',
    descriptionAm: 'የባለሙያ ደረጃ 4K የደህንነት ካሜራ ከስማርት የሰው ልጅ መለያ AI፣ በ360 ዲግሪ መዞርና ማጉላት የሚችል፣ እንዲሁም በምሽት ባለቀለም ምስል የሚያሳይ።',
    price: 14800,
    category: 'cameras',
    brand: 'Hikvision',
    image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 4,
    merchantId: 'm4',
    merchantName: 'Abyssinia Electronics',
    status: 'APPROVED',
    variants: [
      { sku: 'HK-PTZ-4K', name: '4K Outdoor PTZ Camera', priceOffset: 0, onHand: 14, reserved: 0 }
    ],
    featured: true,
    condition: 'BRAND_NEW',
    conditionTextEn: 'Brand New',
    conditionTextAm: 'አዲስ',
    warrantyMonths: 24,
    warrantyTextEn: '24 Months Official Warranty',
    warrantyTextAm: 'የ24 ወራት   ዋስትና'
  },
  {
    id: 'p6',
    nameEn: 'Bose QuietComfort Ultra Wireless Headset',
    nameAm: 'ቦስ ኩዊትኮምፎርት አልትራ ገመድ አልባ ማዳመጫ',
    descriptionEn: 'World-class noise cancelling over-ear headphones with custom spatial audio profiles and premium comfort cushions for long sessions.',
    descriptionAm: 'ከፍተኛ ደረጃ ያለው የድምጽ መከላከያ (Noise Cancelling) ማዳመጫ፣ በቦታ የሚስማማ ስማርት ኦዲዮ እና ለረጅም ሰዓት አገልግሎት የሚመች ለስላሳ ፓድ ያለው።',
    price: 26000,
    category: 'headphones',
    brand: 'Bose',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 3,
    merchantId: 'm1',
    merchantName: 'Girma Tech Store',
    status: 'APPROVED',
    variants: [
      { sku: 'BSE-QCU-BLK', name: 'Triple Black', priceOffset: 0, onHand: 5, reserved: 1 },
      { sku: 'BSE-QCU-WHT', name: 'White Smoke', priceOffset: 1500, onHand: 2, reserved: 0 }
    ],
    featured: true,
    condition: 'OPEN_BOX',
    conditionTextEn: 'Open Box',
    conditionTextAm: 'ክፍት ሳጥን',
    warrantyMonths: 12,
    warrantyTextEn: '12 Months Official Warranty',
    warrantyTextAm: 'የ12 ወራት   ዋስትና'
  },
  {
    id: 'p7',
    nameEn: 'Samsung Galaxy S24 Ultra - 512GB Titanium',
    nameAm: 'ሳምሰንግ ጋላክሲ S24 አልትራ - 512ጂቢ ቲታኒየም',
    descriptionEn: 'Premium titanium smartphone with built-in S Pen, cutting-edge Galaxy AI camera translation features, and 200MP quad-lens system.',
    descriptionAm: 'ምርጥ የቲታኒየም ስማርት ስልክ አብሮ ከተሰራ ኤስ-ፔን፣ አዲሱ የጋላክሲ AI ካሜራ ትርጉምና 200MP ባለአራት ሌንስ ካሜራ ሲስተም ጋር።',
    price: 95000,
    category: 'mobiles',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 2,
    merchantId: 'm4',
    merchantName: 'Abyssinia Electronics',
    status: 'APPROVED',
    variants: [
      { sku: 'S24U-TIT-BLK', name: 'Titanium Black 512GB', priceOffset: 0, onHand: 5, reserved: 1 },
      { sku: 'S24U-TIT-GRY', name: 'Titanium Gray 512GB', priceOffset: 3000, onHand: 2, reserved: 0 }
    ],
    featured: true,
    condition: 'SEALED',
    conditionTextEn: 'Factory Sealed',
    conditionTextAm: 'በፋብሪካው የታሸገ',
    warrantyMonths: 24,
    warrantyTextEn: '24 Months Official Warranty',
    warrantyTextAm: 'የ24 ወራት   ዋስትና'
  },
  {
    id: 'p9',
    nameEn: 'Anker Prime 20,000mAh Smart Power Bank',
    nameAm: 'አንከር ፕራይም 20,000mAh ስማርት ፓወርባንክ',
    descriptionEn: 'High-capacity 200W rapid-charging smart power bank with dynamic digital display. Crucial for tech continuity in Ethiopian urban centers.',
    descriptionAm: 'ከፍተኛ አቅም ያለው ባለ 200W ፈጣን ቻርጀር እና ዲጂታል ማሳያ ያለው ስማርት ፓወር ባንክ። በኢትዮጵያ ከተሞች የኃይል መቆራረጥ ሲያጋጥም አስተማማኝ አጋር።',
    price: 5400,
    category: 'accessories',
    brand: 'Anker',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 4,
    merchantId: 'm4',
    merchantName: 'Abyssinia Electronics',
    status: 'APPROVED',
    variants: [
      { sku: 'ANK-PM-BLK', name: 'Anker Prime Matte Black', priceOffset: 0, onHand: 3, reserved: 0 }
    ],
    featured: true,
    condition: 'BRAND_NEW',
    conditionTextEn: 'Brand New',
    conditionTextAm: 'አዲስ',
    warrantyMonths: 18,
    warrantyTextEn: '18 Months Official Warranty',
    warrantyTextAm: 'የ18 ወራት   ዋስትና'
  }
];

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    storeName: 'Girma Tech Store',
    ownerName: 'Girma Tesfaye',
    email: 'girma.tech@gmail.com',
    phone: '+251911456789',
    password: 'girma_pass123',
    telegramUsername: '@girma_tech',
    telegramChatId: '89101234',
    telegramNotificationsEnabled: true,
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    kycDocument: 'Trade_License_Girma_Tech.pdf',
    balance: 142500,
    payouts: [
      { id: 'py1', amount: 35000, bankName: 'Commercial Bank of Ethiopia (CBE)', accountNumber: '1000123456789', status: 'COMPLETED', createdAt: '2026-06-20T10:12:00Z' }
    ]
  },
  {
    id: 'm2',
    storeName: 'Abebe Gadget Hub',
    ownerName: 'Abebe Girmay',
    email: 'abebe.gadgets@yahoo.com',
    phone: '+251912654321',
    password: 'abebe_pass123',
    telegramUsername: '@abebe_gadgets',
    telegramChatId: '89105678',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    kycDocument: 'Business_Reg_Abebe.pdf',
    balance: 88400,
    payouts: []
  },
  {
    id: 'm3',
    storeName: 'Kasma Authorized Reseller',
    ownerName: 'Yared Kebede',
    email: 'yared.kebede@kasmatech.com',
    phone: '+251920112233',
    password: 'yared_pass123',
    telegramUsername: '@yared_kasma',
    telegramChatId: '89109012',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    kycDocument: 'MOU_Kasma_Authorized.pdf',
    balance: 224300,
    payouts: [
      { id: 'py2', amount: 80000, bankName: 'Awash Bank', accountNumber: '0150987654321', status: 'COMPLETED', createdAt: '2026-06-15T14:30:00Z' },
      { id: 'py3', amount: 45000, bankName: 'Awash Bank', accountNumber: '0150987654321', status: 'PENDING', createdAt: '2026-06-23T09:00:00Z' }
    ]
  },
  {
    id: 'm4',
    storeName: 'Abyssinia Electronics',
    ownerName: 'Tsion Amare',
    email: 'tsion.amare@abyssinia-tech.com',
    phone: '+251944889900',
    password: 'tsion_pass123',
    telegramUsername: '@abyssinia_tech',
    telegramChatId: '89109999',
    status: 'PENDING_APPROVAL',
    kycStatus: 'PENDING_VERIFICATION',
    kycDocument: 'Tech_License_Abyssinia.pdf',
    balance: 0,
    payouts: []
  }
];

export const INITIAL_STOCK_LOGS: StockMovementLog[] = [
  {
    id: 'sl1',
    sku: 'SS-ANP-BLK',
    productName: 'SteelSeries Arctis Nova Pro Wireless Headset',
    previousQty: 10,
    newQty: 18,
    difference: 8,
    reason: 'Restock Event - Air freight shipment arrived from Dubai',
    actor: 'Girma Tesfaye (Merchant)',
    timestamp: '2026-09-04T02:14:00Z'
  },
  {
    id: 'sl2',
    sku: 'AWU2-49',
    productName: 'Apple Watch Ultra 2 GPS + Cellular Titanium',
    previousQty: 5,
    newQty: 1,
    difference: -4,
    reason: 'Sales order fulfilment (Auto-decrement #ORD-9820)',
    actor: 'System Integration',
    timestamp: '2026-09-03T21:40:00Z'
  },
  {
    id: 'sl3',
    sku: 'ANK-PM-BLK',
    productName: 'Anker Prime 20,000mAh Smart Power Bank',
    previousQty: 5,
    newQty: 0,
    difference: -5,
    reason: 'Sales order fulfilment (Auto-decrement #ORD-9815)',
    actor: 'System Integration',
    timestamp: '2026-09-03T18:22:15Z'
  },
  {
    id: 'sl4',
    sku: 'MBP16-M3M-SLV',
    productName: 'MacBook Pro 16-inch M3 Max 36GB 1TB',
    previousQty: 12,
    newQty: 20,
    difference: 8,
    reason: 'Supplier Batch Delivery - Tikur Anbessa Hub Restock',
    actor: 'Abebe Tadesse (Store Admin)',
    timestamp: '2026-09-02T14:10:00Z'
  },
  {
    id: 'sl5',
    sku: 'S24U-512-GRY',
    productName: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
    previousQty: 8,
    newQty: 6,
    difference: -2,
    reason: 'Store Demo Unit Allocation & Inspection',
    actor: 'Abebe Tadesse (Store Admin)',
    timestamp: '2026-09-01T11:05:30Z'
  },
  {
    id: 'sl6',
    sku: 'IP15PM-256-NT',
    productName: 'iPhone 15 Pro Max 256GB Natural Titanium',
    previousQty: 25,
    newQty: 20,
    difference: -5,
    reason: 'Sales order fulfilment (Auto-decrement #ORD-9780)',
    actor: 'System Integration',
    timestamp: '2026-08-31T16:45:00Z'
  },
  {
    id: 'sl7',
    sku: 'DJI-AV2-CBO',
    productName: 'DJI Avata 2 Fly More Combo Drone',
    previousQty: 3,
    newQty: 2,
    difference: -1,
    reason: 'Manual Inventory Audit - Damaged packaging write-off',
    actor: 'Mulugeta Alemu (Quality Inspector)',
    timestamp: '2026-08-30T09:15:20Z'
  },
  {
    id: 'sl8',
    sku: 'SONY-WH1000XM5-BLK',
    productName: 'Sony WH-1000XM5 Wireless Headphones Black',
    previousQty: 14,
    newQty: 30,
    difference: 16,
    reason: 'Bulk CSV Inventory Import & Reconciliation',
    actor: 'System Integration',
    timestamp: '2026-08-28T13:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'al1',
    actor: 'System Security Engine',
    action: 'TELEGRAM_INIT_DATA_VERIFIED',
    details: 'Validated webhook payload signature from Telegram client user ID 4859302',
    severity: 'INFO',
    timestamp: '2026-06-24T08:45:10-07:00'
  },
  {
    id: 'al2',
    actor: 'Admin (getchze1221@gmail.com)',
    action: 'MERCHANT_KYC_APPROVED',
    details: 'Approved trade license documentation for Kasma Authorized Reseller',
    severity: 'INFO',
    timestamp: '2026-06-24T06:10:00-07:00'
  },
  {
    id: 'al3',
    actor: 'System Payment Gateway',
    action: 'CHAPA_WEBHOOK_RECEIVED',
    details: 'Verified Chapa checkout tx_ref ID: ch_tx_904828. Amount: 18500 ETB. Validated hash match.',
    severity: 'INFO',
    timestamp: '2026-06-24T01:30:22-07:00'
  }
];

export const INITIAL_TELEGRAM_ALERTS: TelegramAlert[] = [
  {
    id: 'ta1',
    type: 'OUT_OF_STOCK',
    message: '⚠️ OUT OF STOCK: SKU: ANK-PM-BLK (Anker Prime Smart Power Bank) has reached 0 available on-hand stock.',
    timestamp: '2026-06-23T18:22:15Z',
    read: false
  },
  {
    id: 'ta2',
    type: 'LOW_STOCK',
    message: '🚨 LOW STOCK ALERT: SKU: AWU2-49 (Apple Watch Ultra 2 GPS + Cellular Titanium) stock level is at 1 (Threshold: 4). Restock immediately to prevent delisting.',
    timestamp: '2026-06-24T03:40:00Z',
    read: false
  }
];

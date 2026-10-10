import { Product, Merchant, Order, AuditLog, StockMovementLog, TelegramAlert } from './types';

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
    warrantyTextAm: 'የ24 ወራት   ዋስትና',
    specs: {
      ram: '12GB LPDDR5X',
      cpu: 'Snapdragon 8 Gen 3 for Galaxy (4nm Octa-Core up to 3.39GHz)',
      gpu: 'Qualcomm Adreno 750 (Hardware Ray Tracing)',
      battery: '5,000 mAh (45W Super Fast Charging 2.0, 15W Wireless)',
      storage: '512GB UFS 4.0 High-Speed',
      display: '6.8" Dynamic AMOLED 2X QHD+ (120Hz LTPO, 2,600 nits, Gorilla Armor)',
      os: 'Android 14 (One UI 6.1 with Galaxy AI)',
      weight: '232g',
      camera: '200MP Main + 50MP Periscope (5x) + 10MP Telephoto (3x) + 12MP Ultrawide',
      charging: '45W Wired (65% in 30 mins) / 15W Qi Wireless',
      connectivity: '5G Dual SIM, Wi-Fi 7, Bluetooth 5.3, UWB, USB-C 3.2 Gen 1'
    }
  },
  {
    id: 'p10',
    nameEn: 'Apple iPhone 15 Pro Max - 256GB Natural Titanium',
    nameAm: 'አፕል አይፎን 15 ፕሮ ማክስ - 256ጂቢ ናቹራል ቲታኒየም',
    descriptionEn: 'Forged in titanium with aerospace-grade strength, revolutionary A17 Pro gaming chip, customized Action button, and 5x optical teleprism zoom.',
    descriptionAm: 'ከጠንካራ ቲታኒየም የተሰራ፣ አብዮታዊ የA17 ፕሮ ቺፕ፣ የሚስተካከል አክሽን በተን እና 5x ኦፕቲካል ዙም ካሜራ ያለው ምርጥ ስማርት ስልክ።',
    price: 112000,
    category: 'mobiles',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 3,
    merchantId: 'm3',
    merchantName: 'Kasma Authorized Reseller',
    status: 'APPROVED',
    variants: [
      { sku: 'IP15PM-NAT-256', name: 'Natural Titanium 256GB', priceOffset: 0, onHand: 6, reserved: 1 },
      { sku: 'IP15PM-BLK-256', name: 'Black Titanium 256GB', priceOffset: 0, onHand: 4, reserved: 0 },
      { sku: 'IP15PM-BLU-512', name: 'Blue Titanium 512GB', priceOffset: 16000, onHand: 3, reserved: 0 }
    ],
    featured: true,
    condition: 'SEALED',
    conditionTextEn: 'Factory Sealed',
    conditionTextAm: 'በፋብሪካው የታሸገ',
    warrantyMonths: 24,
    warrantyTextEn: '24 Months Official Warranty',
    warrantyTextAm: 'የ24 ወራት ኦፊሴላዊ ዋስትና',
    specs: {
      ram: '8GB LPDDR5 Unified',
      cpu: 'Apple A17 Pro (3nm, 6-Core: 2 Performance + 4 Efficiency)',
      gpu: 'Apple 6-Core Pro GPU (Hardware Ray Tracing & MetalFX)',
      battery: '4,441 mAh (Up to 29 hours Video Playback, 25W MagSafe)',
      storage: '256GB NVMe High-Speed',
      display: '6.7" Super Retina XDR OLED (120Hz ProMotion, Always-On, 2,000 nits)',
      os: 'iOS 17 (Apple Intelligence Ready)',
      weight: '221g',
      camera: '48MP Main + 12MP 5x Tetraprism Telephoto + 12MP Ultrawide',
      charging: '25W MagSafe Wireless / USB-C 3.0 (10Gbps fast data)',
      connectivity: '5G Dual eSIM/Physical SIM, Wi-Fi 6E, Bluetooth 5.3, Thread, UWB 2'
    }
  },
  {
    id: 'p11',
    nameEn: 'Apple MacBook Pro 16" M3 Max - 36GB RAM / 1TB SSD',
    nameAm: 'አፕል ማክቡክ ፕሮ 16" M3 Max - 36ጂቢ ራም / 1ቲቢ ኤስኤስዲ',
    descriptionEn: 'The most powerful pro laptop in Ethiopia. Powered by the M3 Max chip with 14-core CPU and 30-core GPU, Liquid Retina XDR display, and up to 22 hours of battery life.',
    descriptionAm: 'እጅግ ከፍተኛ ብቃት ያለው ፕሮ ላፕቶፕ። በM3 Max ቺፕ (ባለ 14 ኮር ሲፒዩ እና 30 ኮር ጂፒዩ)፣ ሊኩዊድ ሬቲና XDR ስክሪን እና እስከ 22 ሰዓት ባትሪ ቆይታ ያለው።',
    price: 185000,
    category: 'computers',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 2,
    merchantId: 'm3',
    merchantName: 'Kasma Authorized Reseller',
    status: 'APPROVED',
    variants: [
      { sku: 'MBP16-M3M-SLV', name: 'Silver 36GB / 1TB', priceOffset: 0, onHand: 3, reserved: 0 },
      { sku: 'MBP16-M3M-SPC', name: 'Space Black 36GB / 1TB', priceOffset: 2500, onHand: 4, reserved: 1 }
    ],
    featured: true,
    condition: 'SEALED',
    conditionTextEn: 'Factory Sealed',
    conditionTextAm: 'በፋብሪካው የታሸገ',
    warrantyMonths: 24,
    warrantyTextEn: '24 Months Official Warranty',
    warrantyTextAm: 'የ24 ወራት ኦፊሴላዊ ዋስትና',
    specs: {
      ram: '36GB Unified Memory (300GB/s bandwidth)',
      cpu: 'Apple M3 Max (14-Core: 10 Performance + 4 Efficiency)',
      gpu: '30-Core Apple GPU (Hardware Ray Tracing & Mesh Shading)',
      battery: '100Wh Lithium-Polymer (Up to 22 Hours Battery Life)',
      storage: '1TB Ultra-Fast PCIe Gen4 SSD (up to 7.4GB/s)',
      display: '16.2" Liquid Retina XDR (3456x2234, 120Hz ProMotion, 1,600 nits HDR)',
      os: 'macOS Sonoma',
      weight: '2.14 kg',
      camera: '1080p FaceTime HD Camera with Studio Mics',
      charging: '140W USB-C MagSafe 3 Fast Charging',
      connectivity: '3x Thunderbolt 4 / USB-C, HDMI 2.1, SDXC slot, Wi-Fi 6E, Bluetooth 5.3',
      ports: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3, 3.5mm Headphone'
    }
  },
  {
    id: 'p12',
    nameEn: 'Dell XPS 15 9530 OLED - Intel i9 / RTX 4070 / 32GB RAM / 1TB SSD',
    nameAm: 'ዴል XPS 15 9530 OLED - ኢንቴል i9 / RTX 4070 / 32ጂቢ ራም / 1ቲቢ',
    descriptionEn: 'Flagship creator laptop featuring breathtaking 3.5K OLED touch display, 13th Gen Intel Core i9 processor, NVIDIA RTX 4070 studio graphics, and machined aluminum chassis.',
    descriptionAm: 'አስደናቂ 3.5K OLED ንክኪ ስክሪን፣ 13ኛ ትውልድ ኢንቴል ኮር i9 ፕሮሰሰር፣ NVIDIA RTX 4070 ግራፊክስ እና ከአልሙኒየም የተሰራ ፕሪሚየም ላፕቶፕ።',
    price: 168000,
    category: 'computers',
    brand: 'Dell',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 2,
    merchantId: 'm1',
    merchantName: 'Girma Tech Store',
    status: 'APPROVED',
    variants: [
      { sku: 'DELL-XPS15-OLED', name: 'Platinum Silver / Black Carbon 32GB', priceOffset: 0, onHand: 4, reserved: 0 }
    ],
    featured: true,
    condition: 'SEALED',
    conditionTextEn: 'Factory Sealed',
    conditionTextAm: 'በፋብሪካው የታሸገ',
    warrantyMonths: 12,
    warrantyTextEn: '12 Months Official Warranty',
    warrantyTextAm: 'የ12 ወራት ኦፊሴላዊ ዋስትና',
    specs: {
      ram: '32GB Dual-Channel DDR5 4800MHz (Upgradable)',
      cpu: 'Intel Core i9-13900H (14 Cores: 6P + 8E, up to 5.4GHz Turbo)',
      gpu: 'NVIDIA GeForce RTX 4070 Laptop GPU (8GB GDDR6, 40W)',
      battery: '86Wh 6-Cell Integrated Battery (Up to 11 Hours Battery Life)',
      storage: '1TB M.2 PCIe Gen4 NVMe SSD',
      display: '15.6" 3.5K (3456x2160) OLED Touch Display (400 nits, 100% DCI-P3)',
      os: 'Windows 11 Pro',
      weight: '1.92 kg',
      camera: '720p HD Camera with Dual Digital Array Mics',
      charging: '130W Type-C AC Adapter (USB-PD)',
      connectivity: '2x Thunderbolt 4 / USB-C, 1x USB 3.2 Gen 2 Type-C, Full-size SD, Wi-Fi 6E',
      ports: '2x Thunderbolt 4, 1x USB-C 3.2 Gen 2, SD Card Reader, 3.5mm Combo Audio'
    }
  },
  {
    id: 'p13',
    nameEn: 'Lenovo Legion Pro 7i Gen 8 - Intel i9 / RTX 4080 / 32GB RAM / 1TB SSD',
    nameAm: 'ሌኖቮ ሌጅን ፕሮ 7i - ኢንቴል i9 / RTX 4080 / 32ጂቢ ራም / 1ቲቢ',
    descriptionEn: 'Unrivaled AI-tuned gaming powerhouse with 240Hz WQXGA PureSight gaming display, NVIDIA GeForce RTX 4080 175W, and Legion Coldfront 5.0 vapor chamber cooling.',
    descriptionAm: 'ከፍተኛ የጌሚንግ እና ኢንጂነሪንግ ላፕቶፕ ከ240Hz WQXGA ስክሪን፣ NVIDIA RTX 4080 175W ግራፊክስ እና የላቀ የቀዝቃዛ ቴክኖሎጂ ጋር።',
    price: 178000,
    category: 'computers',
    brand: 'Lenovo',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
    lowStockThreshold: 2,
    merchantId: 'm1',
    merchantName: 'Girma Tech Store',
    status: 'APPROVED',
    variants: [
      { sku: 'LEN-LEG7-4080', name: 'Onyx Grey 32GB / 1TB', priceOffset: 0, onHand: 3, reserved: 0 }
    ],
    featured: true,
    condition: 'SEALED',
    conditionTextEn: 'Factory Sealed',
    conditionTextAm: 'በፋብሪካው የታሸገ',
    warrantyMonths: 12,
    warrantyTextEn: '12 Months Official Warranty',
    warrantyTextAm: 'የ12 ወራት ኦፊሴላዊ ዋስትና',
    specs: {
      ram: '32GB Overclocked DDR5 5600MHz (Dual-Channel)',
      cpu: 'Intel Core i9-13900HX (24 Cores: 8P + 16E, 32 Threads, up to 5.4GHz)',
      gpu: 'NVIDIA GeForce RTX 4080 Laptop GPU (12GB GDDR6, 175W Max TGP)',
      battery: '99.99Wh 4-Cell Battery (Up to 7.5 Hours, Super Rapid Charge 330W)',
      storage: '1TB M.2 PCIe Gen4 NVMe SSD (Dual M.2 Slots)',
      display: '16" WQXGA (2560x1600) IPS 240Hz 500 nits (100% sRGB, G-SYNC)',
      os: 'Windows 11 Home',
      weight: '2.80 kg',
      camera: '1080p FHD Camera with E-shutter',
      charging: '330W Slim Tip AC Adapter (0 to 80% in 30 mins)',
      connectivity: 'Thunderbolt 4, USB-C 3.2 Gen 2 (140W PD), 4x USB-A 3.2, HDMI 2.1, RJ-45, Wi-Fi 6E',
      ports: '1x Thunderbolt 4, 1x USB-C (PD), 4x USB-A 3.2, HDMI 2.1, RJ45 Ethernet, 3.5mm Audio'
    }
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

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-ADDIS-101',
    customerId: 'cust-solomon',
    customerName: 'Solomon Tesfaye',
    customerPhone: '+251912345678',
    subCity: 'Bole',
    landmark: 'edna_mall',
    shippingAddress: 'Bole Atlas, Cameroon St, Behind Mafi Mall, Compound 4',
    coordinates: { lat: 8.9972, lng: 38.7877 },
    gateNotes: 'Blue metal gate #4 opposite Mafi Cinema, buzzer 02, ask guard for Ato Solomon',
    deliveryInstructions: 'Please call 5 mins before reaching Edna Mall taxi stand',
    status: 'SHIPPED',
    paymentMethod: 'COD',
    codVerificationPin: '4819',
    codPhoneConfirmed: true,
    courierName: 'Ermias Berhanu',
    courierPhone: '+251911998877',
    trackingNotes: 'Motorbike dispatch out for delivery on Bole-Atlas corridor',
    shippedAt: '2026-10-10T09:30:00Z',
    channel: 'WEB',
    subtotal: 19500,
    shippingFee: 150,
    total: 19650,
    createdAt: '2026-10-10T08:15:00Z',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        sku: 'SS-ANP-BLK',
        variantName: 'Charcoal Black',
        quantity: 1,
        price: 19500
      }
    ]
  },
  {
    id: 'ORD-ADDIS-102',
    customerId: 'cust-bethlehem',
    customerName: 'Bethlehem Haile',
    customerPhone: '+251911883344',
    subCity: 'Kirkos',
    landmark: 'kazanchis_eca',
    shippingAddress: 'Kazanchis UNECA Staff Housing, Block C, 3rd Floor Apt 302',
    coordinates: { lat: 9.0182, lng: 38.7663 },
    gateNotes: 'Opposite Radisson Blu, UN security gate pass required, guard will dial intercom 302',
    deliveryInstructions: 'Pre-paid via Telebirr. Leave at reception desk if not in office',
    status: 'PROCESSING',
    paymentMethod: 'TELEBIRR',
    paymentId: 'TB-884920194',
    courierName: 'Ermias Berhanu',
    courierPhone: '+251911998877',
    trackingNotes: 'Packed & ready for courier bike loading at Kasma Hub',
    packedAt: '2026-10-10T10:15:00Z',
    channel: 'TELEGRAM_MINI_APP',
    subtotal: 115000,
    shippingFee: 100,
    total: 115100,
    createdAt: '2026-10-10T09:00:00Z',
    items: [
      {
        product: INITIAL_PRODUCTS[4],
        sku: 'MBA-M3-15-SPG',
        variantName: 'Space Gray 16GB/512GB',
        quantity: 1,
        price: 115000
      }
    ]
  },
  {
    id: 'ORD-ADDIS-103',
    customerId: 'cust-dawit',
    customerName: 'Dawit Alemayehu',
    customerPhone: '+251922557799',
    subCity: 'Lemi Kura',
    landmark: 'cmc_michael',
    shippingAddress: 'CMC Michael, Sunshine Real Estate Villa 42, Addis Ababa',
    coordinates: { lat: 9.0235, lng: 38.8350 },
    gateNotes: 'Behind St. Michael Church, Sunshine gate 2, gray steel gate with CCTV camera',
    deliveryInstructions: 'Please inspect original seal box before payment',
    status: 'PROCESSING',
    paymentMethod: 'COD',
    codVerificationPin: '7215',
    codPhoneConfirmed: true,
    courierName: 'Ermias Berhanu',
    courierPhone: '+251911998877',
    trackingNotes: 'Scheduled for afternoon run 2 to CMC / Ayat corridor',
    packedAt: '2026-10-10T09:45:00Z',
    channel: 'WEB',
    subtotal: 87500,
    shippingFee: 150,
    total: 87650,
    createdAt: '2026-10-10T08:45:00Z',
    items: [
      {
        product: INITIAL_PRODUCTS[3],
        sku: 'AWU2-49',
        variantName: '49mm Titanium Case',
        quantity: 1,
        price: 68000
      },
      {
        product: INITIAL_PRODUCTS[0],
        sku: 'SEN-MT4-BLK',
        variantName: 'Black Copper',
        quantity: 1,
        price: 19500
      }
    ]
  },
  {
    id: 'ORD-ADDIS-104',
    customerId: 'cust-selam',
    customerName: 'Selamawit Tadesse',
    customerPhone: '+251933441122',
    subCity: 'Arada',
    landmark: 'piassa',
    shippingAddress: 'Piassa Churchill Ave, Next to historic Taitu Hotel, 3rd Floor',
    coordinates: { lat: 9.0345, lng: 38.7518 },
    gateNotes: 'Commercial building next to Commercial Bank Piassa branch, elevator available',
    deliveryInstructions: 'Delivered to front desk reception',
    status: 'DELIVERED',
    paymentMethod: 'CBE_BIRR',
    paymentId: 'CBE-TX-984210',
    courierName: 'Ermias Berhanu',
    courierPhone: '+251911998877',
    trackingNotes: 'Handed to Selamawit Tadesse with confirmed digital receipt',
    shippedAt: '2026-10-10T08:30:00Z',
    deliveredAt: '2026-10-10T11:20:00Z',
    channel: 'WEB',
    subtotal: 98000,
    shippingFee: 120,
    total: 98120,
    createdAt: '2026-10-10T07:30:00Z',
    items: [
      {
        product: INITIAL_PRODUCTS[5],
        sku: 'SGS24U-512-TI',
        variantName: 'Titanium Gray',
        quantity: 1,
        price: 98000
      }
    ]
  },
  {
    id: 'ORD-ADDIS-105',
    customerId: 'cust-yohannes',
    customerName: 'Yohannes Kebede',
    customerPhone: '+251944882233',
    subCity: 'Nifas Silk-Lafto',
    landmark: 'sarbet',
    shippingAddress: 'Sarbet Karl Square, Opposite ICS International Community School',
    coordinates: { lat: 9.0018, lng: 38.7360 },
    gateNotes: 'Residential green gate #18, opposite ICS sports stadium gate',
    deliveryInstructions: 'Will pay with Telebirr transfer upon courier arrival',
    status: 'SHIPPED',
    paymentMethod: 'COD',
    codVerificationPin: '9140',
    codPhoneConfirmed: true,
    courierName: 'Ermias Berhanu',
    courierPhone: '+251911998877',
    trackingNotes: 'In transit on Sarbet / Old Airport road',
    shippedAt: '2026-10-10T11:00:00Z',
    channel: 'MOBILE',
    subtotal: 58000,
    shippingFee: 150,
    total: 58150,
    createdAt: '2026-10-10T10:00:00Z',
    items: [
      {
        product: INITIAL_PRODUCTS[6],
        sku: 'PS5-SLM-DIG',
        variantName: '1TB Digital Edition',
        quantity: 1,
        price: 58000
      }
    ]
  }
];

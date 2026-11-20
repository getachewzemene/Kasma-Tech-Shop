import { Product } from '../types';

export interface SpecDetail {
  labelEn: string;
  labelAm: string;
  valueEn: string;
  valueAm: string;
}

export function getProductSpecs(p: Product): SpecDetail[] {
  switch (p.id) {
    case 'p1':
      return [
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Unlimited (Hot-Swap dual battery)', valueAm: 'ያልተገደበ (ሁለት ባትሪ መቀያየሪያ ያለው)' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: '2.4GHz Wireless & Bluetooth 5.0 Dual', valueAm: '2.4GHz ገመድ አልባ እና ብሉቱዝ 5.0' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '339g', valueAm: '339 ግራም' },
        { labelEn: 'Drivers', labelAm: 'ድምፅ ማጉያ', valueEn: '40mm Neodymium Drivers', valueAm: '40ሚሜ ኒዮዲሚየም ድራይቨሮች' },
        { labelEn: 'Active Noise Cancellation', labelAm: 'የውጭ ድምፅ መከላከያ', valueEn: 'Yes (4-mic hybrid)', valueAm: 'አለው (ባለ 4-ማይክ ዲቃላ)' }
      ];
    case 'p2':
      return [
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Up to 24 hours (with case)', valueAm: 'እስከ 24 ሰዓት (ከቻርጅ ማድረጊያው ጋር)' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: 'Bluetooth 5.3 (Multipoint)', valueAm: 'ብሉቱዝ 5.3 (ብዙ መሳሪያዎች በአንድ ጊዜ)' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '5.9g (per earbud)', valueAm: '5.9 ግራም (እያንዳንዱ)' },
        { labelEn: 'Water Resistance', labelAm: 'የውሃ መከላከያ', valueEn: 'IPX4 Splash-proof', valueAm: 'IPX4 የውሃ መርጨት መቋቋም' },
        { labelEn: 'Active Noise Cancellation', labelAm: 'የውጭ ድምፅ መከላከያ', valueEn: 'Yes (Dual Processor V2)', valueAm: 'አለው (ባለ ሁለት ፕሮሰሰር V2)' }
      ];
    case 'p3':
      return [
        { labelEn: 'Display', labelAm: 'ማሳያ', valueEn: 'Retina LTPO OLED (3000 nits)', valueAm: 'ሬቲና OLED (3000 ኒትስ)' },
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Up to 36 hours (72 hours in low power)', valueAm: 'እስከ 36 ሰዓት (በሃይል ቆጣቢ 72 ሰዓት)' },
        { labelEn: 'Water Resistance', labelAm: 'የውሃ መከላከያ', valueEn: '100m Water Resistant, IP6X dust', valueAm: '100 ሜትር ውሃ መቋቋም፣ IP6X አቧራ መከላከያ' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '61.4g', valueAm: '61.4 ግራም' },
        { labelEn: 'Sensing/Health', labelAm: 'የጤና መከታተያ', valueEn: 'ECG, Blood Oxygen, Temp, Depth', valueAm: 'የልብ ምት፣ የደም ኦክስጅን፣ ሙቀት፣ ጥልቀት' }
      ];
    case 'p4':
      return [
        { labelEn: 'Power Output', labelAm: 'የኃይል መጠን', valueEn: '80 Watts (Class D amplifier)', valueAm: '80 ዋት (ክፍል D ድምፅ ማጉያ)' },
        { labelEn: 'Frequency Range', labelAm: 'የሞገድ ክልል', valueEn: '47–20,000 Hz', valueAm: '47-20,000 ኸርትዝ' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: 'Bluetooth 5.2, RCA, 3.5mm Aux', valueAm: 'ብሉቱዝ 5.2፣ RCA፣ 3.5ሚሜ Aux' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '4.25 kg', valueAm: '4.25 ኪሎግራም' },
        { labelEn: 'Mains Voltage', labelAm: 'ቮልቴጅ', valueEn: '100–240 V (A/C Power)', valueAm: '100–240 ቮልት (ኤሌክትሪክ ያስፈልገዋል)' }
      ];
    case 'p5':
      return [
        { labelEn: 'Resolution', labelAm: 'ጥራት', valueEn: '4K Ultra HD (8 Megapixel)', valueAm: '4K አልትራ HD (8 ሜጋፒክስል)' },
        { labelEn: 'Night Vision', labelAm: 'የምሽት እይታ', valueEn: 'Color night vision up to 30m', valueAm: 'የሌሊት ባለቀለም ምስል እስከ 30 ሜትር' },
        { labelEn: 'Water Resistance', labelAm: 'የውሃ መከላከያ', valueEn: 'IP66 Weather-proof', valueAm: 'IP66 የአየር ሁኔታ መቋቋም' },
        { labelEn: 'PTZ Range', labelAm: 'የመዞር ክልል', valueEn: '350° Pan, 90° Tilt, 5x Digital Zoom', valueAm: '350° መዞር፣ 90° ማዘንበል፣ 5x ማጉላት' },
        { labelEn: 'AI Capability', labelAm: 'የAI ብቃት', valueEn: 'Human & Vehicle Smart Tracking', valueAm: 'ሰው እና ተሽከርካሪን የመለየት ብቃት' }
      ];
    case 'p6':
      return [
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Up to 24 hours', valueAm: 'እስከ 24 ሰዓት' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: 'Bluetooth 5.3 (Multipoint support)', valueAm: 'ብሉቱዝ 5.3 (ብዙ ማገናኛ ያለው)' },
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: '250g', valueAm: '250 ግራም' },
        { labelEn: 'Active Noise Cancellation', labelAm: 'የውጭ ድምፅ መከላከያ', valueEn: 'Yes (CustomTune Technology)', valueAm: 'አለው (CustomTune ቴክኖሎጂ)' },
        { labelEn: 'Spatial Audio', labelAm: 'ቦታ ኦዲዮ', valueEn: 'Bose Immersive Audio', valueAm: 'ቦስ እውነተኛ የድምፅ ስርጭት' }
      ];
    case 'p7':
      return [
        { labelEn: 'Display', labelAm: 'ማሳያ', valueEn: '6.7" Dynamic AMOLED 2X (120Hz)', valueAm: '6.7 ኢንች ዳይናሚክ AMOLED 2X (120Hz)' },
        { labelEn: 'Camera', labelAm: 'ካሜራ', valueEn: '64MP 8K Pro Triple Camera System', valueAm: '64MP 8K ፕሮ ባለሶስት ካሜራ' },
        { labelEn: 'Battery', labelAm: 'ባትሪ', valueEn: '4800 mAh All-Day Intelligent Battery', valueAm: '4800 mAh ሙሉ ቀን የሚቆይ ባትሪ' },
        { labelEn: 'Network', labelAm: 'ኔትዎርክ', valueEn: 'Ultra-Fast 5G Dual SIM & WiFi 6', valueAm: 'ፈጣን 5G ባለ ሁለት ሲም እና ዋይፋይ 6' },
        { labelEn: 'Build', labelAm: 'ግንባታ', valueEn: 'Gorilla Glass Victus & IP68 Water Resistant', valueAm: 'የጎሪላ መስታወት እና IP68 የውሃ መቋቋም' }
      ];
    case 'p8':
      return [
        { labelEn: 'Battery Life', labelAm: 'የባትሪ ቆይታ', valueEn: 'Up to 30 hours (with case)', valueAm: 'እስከ 30 ሰዓት (ከቻርጅ ማድረጊያው ጋር)' },
        { labelEn: 'Connection', labelAm: 'ግንኙነት', valueEn: 'Bluetooth 5.4, Auracast, LE Audio', valueAm: 'ብሉቱዝ 5.4፣ Auracast፣ LE Audio' },
        { labelEn: 'Audio Codecs', labelAm: 'የድምጽ ኮዴክ', valueEn: 'aptX Adaptive, AAC, SBC, LC3', valueAm: 'aptX Adaptive, AAC, SBC, LC3' },
        { labelEn: 'Water Resistance', labelAm: 'የውሃ መከላከያ', valueEn: 'IP54 Dust & Splash-resistant', valueAm: 'IP54 አቧራ እና ውሃ መርጨት መቋቋም' },
        { labelEn: 'Active Noise Cancellation', labelAm: 'የውጭ ድምፅ መከላከያ', valueEn: 'Yes (Adaptive hybrid ANC)', valueAm: 'አለው (ተስማሚ ዲቃላ ANC)' }
      ];
    case 'p9':
      return [
        { labelEn: 'Capacity', labelAm: 'አቅም', valueEn: '20,000 mAh', valueAm: '20,000 ሚሊአምፔር ሰዓት' },
        { labelEn: 'Total Power Output', labelAm: 'የኃይል መጠን', valueEn: '200W Maximum Rapid Charging', valueAm: '200W ከፍተኛ ፈጣን ኃይል መሙያ' },
        { labelEn: 'Display', labelAm: 'ማሳያ', valueEn: 'Smart Digital Display (Watts, %)', valueAm: 'ስማርት ዲጂታል ማሳያ (ዋትስ፣ %)' },
        { labelEn: 'Input/Output Ports', labelAm: 'የመግቢያና መውጫ ፖርቶች', valueEn: '2x USB-C, 1x USB-A', valueAm: '2x USB-C, 1x USB-A' },
        { labelEn: 'Protection', labelAm: 'ደህንነት ጥበቃ', valueEn: 'ActiveShield 2.0 temperature monitoring', valueAm: 'ActiveShield 2.0 የሙቀት መቆጣጠሪያ' }
      ];
    default:
      return [
        { labelEn: 'Weight', labelAm: 'ክብደት', valueEn: 'Compact / Lightweight', valueAm: 'ቀላል / ተንቀሳቃሽ' },
        { labelEn: 'Warranty', labelAm: 'ዋስትና', valueEn: '1-Year Local Warranty', valueAm: 'የ 1 ዓመት የአገር ውስጥ ዋስትና' },
        { labelEn: 'Quality Stamp', labelAm: 'የጥራት ደረጃ', valueEn: 'Verified Premium', valueAm: 'የተረጋገጠ ምርጥ ጥራት' }
      ];
  }
}

export function getProductFeatures(p: Product): string[] {
  switch (p.id) {
    case 'p1':
      return ['Hot-Swappable Dual Battery', 'Multi-System Connection', 'Active Noise Cancellation (ANC)', 'Hi-Res Audio Certified', 'ClearCast Gen 2 Retractable Mic'];
    case 'p2':
      return ['Dynamic Driver X', 'Dual Processor V2 Noise Cancelling', 'Bone Conduction Sensor Calls', 'High-Res Lossless LDAC Codec', '360 Spatial Audio with Head Tracking'];
    case 'p3':
      return ['Military Grade Titanium Build', 'Dual Frequency GPS L1 + L5', 'Up to 36-Hour Battery life', 'ECG Heart Monitoring App', 'Emergency Siren and Fall Detection'];
    case 'p4':
      return ['Marshall Signature Sound Stage', 'Vintage Aesthetics and Brass Accents', 'Dynamic Loudness Sound Balance', 'RCA, AUX & Bluetooth Inputs', 'Sustainable Vegan PVC-Free Build'];
    case 'p5':
      return ['Ultra High Definition 4K Sensors', 'AI Person & Vehicle Auto Tracking', '360° Panoramic Pan and Tilt Rotation', 'Super Bright Color Night Vision LEDs', 'Two-Way Intercom Mic and Speaker'];
    case 'p6':
      return ['CustomTune Audio Adaptation', 'Bose Immersive Spatial Audio', 'World-Class Quiet/Aware Modes', 'Wind Block Active Filtering', 'Premium Leatherette Ultra Comfort Plushes'];
    case 'p7':
      return ['Dynamic AMOLED 2X 120Hz Display', '64MP 8K Pro Triple Camera', '4800mAh All-Day Battery', 'Super Fast Charging & Wireless PowerShare', 'IP68 Water & Dust Resistant'];
    case 'p8':
      return ['Personalized Adaptive ANC', 'Lossless Audio High Fidelity Streaming', 'Auracast & LE Next-Gen Bluetooth 5.4', 'Comfort Fit Sound Isolation Sleeves', 'Dual-Mic Speech Clarity Array'];
    case 'p9':
      return ['200W Combined Power Output', 'Dynamic Status Digital Monitor Screen', 'Ultra Compact Space-saving Build', 'Smart Power Distribution Control', 'ActiveShield 2.0 Temperature Guard'];
    default:
      return ['Original Premium Warranty', 'Verified Secure Dispatch packaging', 'Authenticity Certified Stamps', 'Ethiopian Standard Power Adaptor Included'];
  }
}

export function getProductGallery(p: Product): string[] {
  const images = [p.image];
  if (p.category === 'gaming' || p.category === 'computers') {
    images.push(
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80'
    );
  } else if (p.category === 'smartwatches' || p.category === 'mobiles') {
    images.push(
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'
    );
  } else if (p.category === 'headphones') {
    images.push(
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80'
    );
  } else if (p.category === 'cameras' || p.category === 'accessories') {
    images.push(
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502920917128-1fc500664abb?auto=format&fit=crop&w=600&q=80'
    );
  } else {
    images.push(
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'
    );
  }
  return images;
}

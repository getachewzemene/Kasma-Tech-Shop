import { Order } from '../../types';
import { 
  ADDIS_LANDMARKS, 
  SUB_CITIES, 
  AddisLandmark, 
  SubCityOption, 
  calculateDistanceKm, 
  findNearestLandmark 
} from '../../constants/locations';

export interface CourierDriver {
  id: string;
  name: string;
  nameAm: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
  totalDeliveries: number;
  completedToday: number;
  isOnline: boolean;
  batteryLevel: number;
  currentSpeedKmH: number;
  currentLocation: {
    lat: number;
    lng: number;
    labelEn: string;
    labelAm: string;
  };
}

export const DEFAULT_COURIER_DRIVER: CourierDriver = {
  id: 'drv-ermias',
  name: 'Ermias Berhanu',
  nameAm: 'ኤርሚያስ ብርሃኑ',
  phone: '+251 91 199 8877',
  vehicleType: 'Honda CG125 Motorbike',
  vehiclePlate: 'AA 3-B 98214',
  rating: 4.94,
  totalDeliveries: 428,
  completedToday: 3,
  isOnline: true,
  batteryLevel: 88,
  currentSpeedKmH: 26,
  currentLocation: {
    lat: 9.0125,
    lng: 38.7720,
    labelEn: 'Meskel Flower / Olympia Corridor',
    labelAm: 'መስቀል ፍላወር / ኦሊምፒያ መስመር'
  }
};

export const KASMA_CENTRAL_HUB = {
  id: 'kasma_hub',
  nameEn: 'Kasma Central Logistics Hub (Kazanchis)',
  nameAm: 'የካስማ ማዕከላዊ ሎጅስቲክስ መጋዘን (ካዛንቺስ)',
  lat: 9.0182,
  lng: 38.7663,
  point: { x: 260, y: 140 }
};

export interface DeliveryStop {
  stopNumber: number;
  order: Order;
  landmark: AddisLandmark;
  subCity: SubCityOption;
  distanceKm: number;
  estimatedMins: number;
  status: 'PENDING_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';
  isCod: boolean;
  codAmount: number;
  gateNotes: string;
  deliveryInstructions: string;
  landmarkHintEn: string;
  landmarkHintAm: string;
  coordinates: { lat: number; lng: number };
  mapPoint: { x: number; y: number };
}

// Transform GPS coordinates (lat, lng) to vector SVG canvas space
export function projectAddisCoords(
  lat: number, 
  lng: number, 
  width = 600, 
  height = 360, 
  padding = 45
): { x: number; y: number } {
  // Addis Ababa bounding coordinates
  const minLat = 8.875;
  const maxLat = 9.065;
  const minLng = 38.705;
  const maxLng = 38.865;

  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
  const clampedLng = Math.max(minLng, Math.min(maxLng, lng));

  // Normalized (0 -> 1)
  const normX = (clampedLng - minLng) / (maxLng - minLng);
  // Lat increases northward, SVG Y increases downward
  const normY = (maxLat - clampedLat) / (maxLat - minLat);

  return {
    x: Math.round(padding + normX * (width - 2 * padding)),
    y: Math.round(padding + normY * (height - 2 * padding))
  };
}

// Convert orders to unified courier dispatch stops
export function buildCourierStops(
  orders: Order[],
  driverCoords: { lat: number; lng: number }
): DeliveryStop[] {
  // Sort sequence: Active/In Transit first, then Pending Pickup, then Delivered
  const sortedOrders = [...orders].sort((a, b) => {
    const score = (st: Order['status']) => {
      if (st === 'SHIPPED') return 1;
      if (st === 'PROCESSING') return 2;
      if (st === 'PAID' || st === 'PENDING_PAYMENT') return 3;
      if (st === 'DELIVERED') return 4;
      return 5;
    };
    return score(a.status) - score(b.status);
  });

  return sortedOrders.map((order, idx) => {
    // 1. Identify Landmark
    let landmark: AddisLandmark | undefined;
    if (order.landmark) {
      landmark = ADDIS_LANDMARKS.find(l => l.id === order.landmark || l.nameEn.toLowerCase() === order.landmark?.toLowerCase());
    }
    if (!landmark && order.coordinates) {
      const nearest = findNearestLandmark(order.coordinates.lat, order.coordinates.lng);
      if (nearest) landmark = nearest.landmark;
    }
    if (!landmark) {
      // Find by matching subCity or address text
      const addrLower = (order.shippingAddress || '').toLowerCase();
      const subLower = (order.subCity || '').toLowerCase();
      landmark = ADDIS_LANDMARKS.find(l => 
        addrLower.includes(l.id) || 
        addrLower.includes(l.nameEn.toLowerCase()) ||
        l.subCityId.toLowerCase() === subLower
      ) || ADDIS_LANDMARKS[0];
    }

    // 2. Identify SubCity
    const subCity = SUB_CITIES.find(s => s.id === landmark?.subCityId) || 
      SUB_CITIES.find(s => s.nameEn.toLowerCase() === (order.subCity || '').toLowerCase()) ||
      SUB_CITIES[0];

    // 3. Resolve Lat/Lng coordinates
    const lat = order.coordinates?.lat || landmark.lat;
    const lng = order.coordinates?.lng || landmark.lng;

    // 4. Distance and ETA from driver's current position
    const distanceKm = calculateDistanceKm(driverCoords.lat, driverCoords.lng, lat, lng);
    // Addis city traffic average: ~22 km/h motorbike speed
    const estimatedMins = Math.max(5, Math.round((distanceKm / 22) * 60));

    // 5. COD logic
    const isCod = order.paymentMethod === 'COD';
    const codAmount = isCod ? order.total : 0;

    // 6. Stop Status
    let stopStatus: DeliveryStop['status'] = 'IN_TRANSIT';
    if (order.status === 'DELIVERED') {
      stopStatus = 'DELIVERED';
    } else if (order.status === 'SHIPPED') {
      stopStatus = 'IN_TRANSIT';
    } else {
      stopStatus = 'PENDING_PICKUP';
    }

    const mapPoint = projectAddisCoords(lat, lng, 600, 360, 45);

    return {
      stopNumber: idx + 1,
      order,
      landmark,
      subCity,
      distanceKm,
      estimatedMins,
      status: stopStatus,
      isCod,
      codAmount,
      gateNotes: order.gateNotes || 'Compound entry gate. Inquire with building security / guard.',
      deliveryInstructions: order.deliveryInstructions || 'Call upon arrival at the landmark.',
      landmarkHintEn: landmark.hintEn || 'Main access avenue',
      landmarkHintAm: landmark.hintAm || 'ዋናው መንገድ አጠገብ',
      coordinates: { lat, lng },
      mapPoint
    };
  });
}

// 1-Tap Calling Protocol
export function getCleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '');
}

export function generateCustomerCallUrl(phone: string): string {
  return `tel:${getCleanPhoneNumber(phone)}`;
}

// Telegram Customer Communication
export function generateTelegramDriverChatUrl(order: Order, driver: CourierDriver, language: 'en' | 'am' = 'en'): string {
  const cleanPhone = getCleanPhoneNumber(order.customerPhone).replace('+', '');
  const greeting = language === 'en'
    ? `Hello ${order.customerName}! This is ${driver.name}, your Kasma Tech Shop express motorbike courier. I am en route with your package #${order.id} near ${order.landmark || order.subCity || 'your area'}. Estimated arrival in 10-15 mins.`
    : `ሰላም ${order.customerName}! ከካስማ ቴክ ሾፕ እቃዎትን የያዝኩት አሽከርካሪ ${driver.nameAm} ነኝ። ትዕዛዝ #${order.id} ይዤ ወደ ${order.subCity || 'አካባቢዎ'} በመጓዝ ላይ ነኝ። ከ10-15 ደቂቃ ውስጥ እደርሳለሁ።`;
  
  return `https://t.me/+${cleanPhone}?text=${encodeURIComponent(greeting)}`;
}

// WhatsApp Customer Communication
export function generateWhatsAppDriverChatUrl(order: Order, driver: CourierDriver, language: 'en' | 'am' = 'en'): string {
  const cleanPhone = getCleanPhoneNumber(order.customerPhone).replace('+', '');
  const greeting = language === 'en'
    ? `Hello ${order.customerName}! This is ${driver.name} from Kasma Tech Shop. I am your delivery courier for Order #${order.id}. Please be ready at your gate.`
    : `ሰላም ${order.customerName}! ከካስማ ቴክ ሾፕ እቃዎትን ለማድረስ በመጓዝ ላይ ነኝ። ትዕዛዝ #${order.id} ይዤ ደርሻለሁ፣ እባክዎ በስልክ ይጠብቁኝ።`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
}

// SMS ETA Generator
export function generateSmsEtaUrl(order: Order, driver: CourierDriver, etaMins: number, language: 'en' | 'am' = 'en'): string {
  const cleanPhone = getCleanPhoneNumber(order.customerPhone);
  const body = language === 'en'
    ? `Kasma Tech Express: Courier ${driver.name} is arriving in ~${etaMins} mins for Order #${order.id}. ${order.paymentMethod === 'COD' ? `Collect: ${order.total.toLocaleString()} ETB.` : 'Pre-paid.'}`
    : `ካስማ ቴክ ማጓጓዣ፡ አሽከርካሪ ${driver.nameAm} ትዕዛዝ #${order.id} ይዞ በ~${etaMins} ደቂቃ ውስጥ ይደርሳል። ${order.paymentMethod === 'COD' ? `የሚከፈል፡ ${order.total.toLocaleString()} ብር።` : 'የተከፈለ።'}`;

  return `sms:${cleanPhone}?body=${encodeURIComponent(body)}`;
}

// Turn-by-Turn Navigation Launchers
export function generateGoogleMapsDirUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export function generateWazeDirUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

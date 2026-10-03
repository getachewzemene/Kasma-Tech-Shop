export interface DeliveryLocationOption {
  id: string;
  nameEn: string;
  nameAm: string;
  subcityOrRegion: string;
  category: 'INNER_ADDIS' | 'OUTER_ADDIS' | 'REGIONAL';
  distanceKm: number; // Distance relative to Megenagna Central Hub
  deliveryTimeEn: string;
  deliveryTimeAm: string;
  badgeEn: string;
  badgeAm: string;
  feeEtb: number;
  carrierEn: string;
  carrierAm: string;
}

export const MEGENAGNA_HUB = {
  nameEn: 'Megenagna Hub (Addis Ababa)',
  nameAm: 'መገናኛ ማዕከል (አዲስ አበባ)',
  lat: 9.0222,
  lng: 38.8020
};

export const DELIVERY_LOCATION_OPTIONS: DeliveryLocationOption[] = [
  {
    id: 'megenagna',
    nameEn: 'Megenagna (Central Hub)',
    nameAm: 'መገናኛ (ዋና ማዕከል)',
    subcityOrRegion: 'Yeka / Bole Border',
    category: 'INNER_ADDIS',
    distanceKm: 0.5,
    deliveryTimeEn: 'Fast delivery in 2-4 hours',
    deliveryTimeAm: 'በ 2-4 ሰዓታት ውስጥ ፈጣን ማድረሻ',
    badgeEn: 'Express Hub Pickup / Direct Bike',
    badgeAm: 'በሞተር ብስክሌት ፈጣን ማድረሻ',
    feeEtb: 100,
    carrierEn: 'Kasma Express Motorbike Fleet',
    carrierAm: 'የካስማ ፈጣን የሞተር አቅርቦት'
  },
  {
    id: 'bole',
    nameEn: 'Bole, Addis Ababa',
    nameAm: 'ቦሌ፣ አዲስ አበባ',
    subcityOrRegion: 'Bole Subcity',
    category: 'INNER_ADDIS',
    distanceKm: 3.2,
    deliveryTimeEn: 'Fast delivery in 2-4 hours',
    deliveryTimeAm: 'በ 2-4 ሰዓታት ውስጥ ፈጣን ማድረሻ',
    badgeEn: 'Express Bike Dispatch',
    badgeAm: 'የከተማ ውስጥ ፈጣን ማድረሻ',
    feeEtb: 150,
    carrierEn: 'Kasma Express Motorbike Fleet',
    carrierAm: 'የካስማ ፈጣን የሞተር አቅርቦት'
  },
  {
    id: 'kazanchis',
    nameEn: 'Kirkos / Kazanchis, Addis Ababa',
    nameAm: 'ቂርቆስ / ካዛንቺስ፣ አዲስ አበባ',
    subcityOrRegion: 'Kirkos Subcity',
    category: 'INNER_ADDIS',
    distanceKm: 4.5,
    deliveryTimeEn: 'Fast delivery in 2-4 hours',
    deliveryTimeAm: 'በ 2-4 ሰዓታት ውስጥ ፈጣን ማድረሻ',
    badgeEn: 'Express Bike Dispatch',
    badgeAm: 'የከተማ ውስጥ ፈጣን ማድረሻ',
    feeEtb: 150,
    carrierEn: 'Kasma Express Motorbike Fleet',
    carrierAm: 'የካስማ ፈጣን የሞተር አቅርቦት'
  },
  {
    id: 'yeka',
    nameEn: 'Yeka / CMC, Addis Ababa',
    nameAm: 'የካ / ሲኤምሲ፣ አዲስ አበባ',
    subcityOrRegion: 'Yeka Subcity',
    category: 'INNER_ADDIS',
    distanceKm: 5.1,
    deliveryTimeEn: 'Fast delivery in 2-4 hours',
    deliveryTimeAm: 'በ 2-4 ሰዓታት ውስጥ ፈጣን ማድረሻ',
    badgeEn: 'Express Bike Dispatch',
    badgeAm: 'የከተማ ውስጥ ፈጣን ማድረሻ',
    feeEtb: 160,
    carrierEn: 'Kasma Express Motorbike Fleet',
    carrierAm: 'የካስማ ፈጣን የሞተር አቅርቦት'
  },
  {
    id: 'arada',
    nameEn: 'Arada / Piazza, Addis Ababa',
    nameAm: 'አራዳ / ፒያሳ፣ አዲስ አበባ',
    subcityOrRegion: 'Arada Subcity',
    category: 'INNER_ADDIS',
    distanceKm: 6.2,
    deliveryTimeEn: 'Fast delivery in 2-4 hours',
    deliveryTimeAm: 'በ 2-4 ሰዓታት ውስጥ ፈጣን ማድረሻ',
    badgeEn: 'Express Bike Dispatch',
    badgeAm: 'የከተማ ውስጥ ፈጣን ማድረሻ',
    feeEtb: 180,
    carrierEn: 'Kasma Express Motorbike Fleet',
    carrierAm: 'የካስማ ፈጣን የሞተር አቅርቦት'
  },
  {
    id: 'nifas_silk',
    nameEn: 'Nifas Silk Lafto, Addis Ababa',
    nameAm: 'ንፋስ ስልክ ላፍቶ፣ አዲስ አበባ',
    subcityOrRegion: 'Nifas Silk Subcity',
    category: 'OUTER_ADDIS',
    distanceKm: 12.8,
    deliveryTimeEn: 'Same-day delivery in 4-8 hours',
    deliveryTimeAm: 'በዕለቱ በ 4-8 ሰዓታት ውስጥ ማድረሻ',
    badgeEn: 'Same-Day City Route',
    badgeAm: 'በዕለቱ የሚደርስ',
    feeEtb: 250,
    carrierEn: 'Kasma Logistics Express Van',
    carrierAm: 'የካስማ ሎጅስቲክስ ቫን'
  },
  {
    id: 'akaki',
    nameEn: 'Akaki Kality, Addis Ababa',
    nameAm: 'አቃቂ ቃሊቲ፣ አዲስ አበባ',
    subcityOrRegion: 'Akaki Kality Subcity',
    category: 'OUTER_ADDIS',
    distanceKm: 19.4,
    deliveryTimeEn: 'Same-day delivery in 4-8 hours',
    deliveryTimeAm: 'በዕለቱ በ 4-8 ሰዓታት ውስጥ ማድረሻ',
    badgeEn: 'Same-Day City Route',
    badgeAm: 'በዕለቱ የሚደርስ',
    feeEtb: 300,
    carrierEn: 'Kasma Logistics Express Van',
    carrierAm: 'የካስማ ሎጅስቲክስ ቫን'
  },
  {
    id: 'kolfe',
    nameEn: 'Kolfe Keraniyo, Addis Ababa',
    nameAm: 'ኮልፌ ቀራኒዮ፣ አዲስ አበባ',
    subcityOrRegion: 'Kolfe Keraniyo Subcity',
    category: 'OUTER_ADDIS',
    distanceKm: 14.1,
    deliveryTimeEn: 'Same-day delivery in 4-8 hours',
    deliveryTimeAm: 'በዕለቱ በ 4-8 ሰዓታት ውስጥ ማድረሻ',
    badgeEn: 'Same-Day City Route',
    badgeAm: 'በዕለቱ የሚደርስ',
    feeEtb: 260,
    carrierEn: 'Kasma Logistics Express Van',
    carrierAm: 'የካስማ ሎጅስቲክስ ቫን'
  },
  {
    id: 'adama',
    nameEn: 'Adama / Nazret',
    nameAm: 'አዳማ / ናዝሬት',
    subcityOrRegion: 'Oromia Region',
    category: 'REGIONAL',
    distanceKm: 98.0,
    deliveryTimeEn: 'Nationwide shipping available',
    deliveryTimeAm: 'አገር አቀፍ ማድረሻ ይገኛል',
    badgeEn: 'Nationwide Express (1-2 Days)',
    badgeAm: 'አገር አቀፍ ማድረሻ (1-2 ቀናት)',
    feeEtb: 450,
    carrierEn: 'Selam Bus / EMS Cargo Freight',
    carrierAm: 'ሰላም ባስ / ኢኤምኤስ ካርጎ'
  },
  {
    id: 'hawassa',
    nameEn: 'Hawassa City',
    nameAm: 'ሀዋሳ ከተማ',
    subcityOrRegion: 'Sidama Region',
    category: 'REGIONAL',
    distanceKm: 275.0,
    deliveryTimeEn: 'Nationwide shipping available',
    deliveryTimeAm: 'አገር አቀፍ ማድረሻ ይገኛል',
    badgeEn: 'Nationwide Express (1-2 Days)',
    badgeAm: 'አገር አቀፍ ማድረሻ (1-2 ቀናት)',
    feeEtb: 550,
    carrierEn: 'Ethiopian Post / Kasma Regional Cargo',
    carrierAm: 'የኢትዮጵያ ፖስታ / ካስማ ካርጎ'
  },
  {
    id: 'bahir_dar',
    nameEn: 'Bahir Dar',
    nameAm: 'ባሕር ዳር',
    subcityOrRegion: 'Amhara Region',
    category: 'REGIONAL',
    distanceKm: 560.0,
    deliveryTimeEn: 'Nationwide shipping available',
    deliveryTimeAm: 'አገር አቀፍ ማድረሻ ይገኛል',
    badgeEn: 'Nationwide Express (2-3 Days)',
    badgeAm: 'አገር አቀፍ ማድረሻ (2-3 ቀናት)',
    feeEtb: 650,
    carrierEn: 'Ethiopian Air Cargo / EMS',
    carrierAm: 'የኢትዮጵያ አየር መንገድ ካርጎ'
  },
  {
    id: 'dire_dawa',
    nameEn: 'Dire Dawa',
    nameAm: 'ድሬዳዋ',
    subcityOrRegion: 'Dire Dawa Chartered City',
    category: 'REGIONAL',
    distanceKm: 515.0,
    deliveryTimeEn: 'Nationwide shipping available',
    deliveryTimeAm: 'አገር አቀፍ ማድረሻ ይገኛል',
    badgeEn: 'Nationwide Express (2-3 Days)',
    badgeAm: 'አገር አቀፍ ማድረሻ (2-3 ቀናት)',
    feeEtb: 650,
    carrierEn: 'Ethiopian Air Cargo / EMS',
    carrierAm: 'የኢትዮጵያ አየር መንገድ ካርጎ'
  }
];

// Haversine formula to calculate distance in km from lat/lng to Megenagna Hub
export function calculateDistanceFromMegenagna(lat: number, lng: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat - MEGENAGNA_HUB.lat) * (Math.PI / 180);
  const dLng = (lng - MEGENAGNA_HUB.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(MEGENAGNA_HUB.lat * (Math.PI / 180)) *
      Math.cos(lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getDeliveryEstimateForDistance(distKm: number): {
  category: 'INNER_ADDIS' | 'OUTER_ADDIS' | 'REGIONAL';
  deliveryTimeEn: string;
  deliveryTimeAm: string;
  badgeEn: string;
  badgeAm: string;
  feeEtb: number;
  carrierEn: string;
  carrierAm: string;
} {
  if (distKm <= 8.5) {
    return {
      category: 'INNER_ADDIS',
      deliveryTimeEn: 'Fast delivery in 2-4 hours',
      deliveryTimeAm: 'በ 2-4 ሰዓታት ውስጥ ፈጣን ማድረሻ',
      badgeEn: 'Express Bike Dispatch',
      badgeAm: 'የከተማ ውስጥ ፈጣን ማድረሻ',
      feeEtb: Math.min(100 + Math.round(distKm * 15), 200),
      carrierEn: 'Kasma Express Motorbike Fleet',
      carrierAm: 'የካስማ ፈጣን የሞተር አቅርቦት'
    };
  } else if (distKm <= 25) {
    return {
      category: 'OUTER_ADDIS',
      deliveryTimeEn: 'Same-day delivery in 4-8 hours',
      deliveryTimeAm: 'በዕለቱ በ 4-8 ሰዓታት ውስጥ ማድረሻ',
      badgeEn: 'Same-Day City Route',
      badgeAm: 'በዕለቱ የሚደርስ',
      feeEtb: Math.min(220 + Math.round((distKm - 8.5) * 10), 350),
      carrierEn: 'Kasma Logistics Express Van',
      carrierAm: 'የካስማ ሎጅስቲክስ ቫን'
    };
  } else {
    return {
      category: 'REGIONAL',
      deliveryTimeEn: 'Nationwide shipping available',
      deliveryTimeAm: 'አገር አቀፍ ማድረሻ ይገኛል',
      badgeEn: 'Nationwide Express (1-3 Days)',
      badgeAm: 'አገር አቀፍ ማድረሻ (1-3 ቀናት)',
      feeEtb: Math.min(400 + Math.round(distKm * 0.8), 850),
      carrierEn: 'Ethiopian Air Cargo / Selam Bus Freight',
      carrierAm: 'የኢትዮጵያ አየር መንገድ ካርጎ / ሰላም ባስ'
    };
  }
}

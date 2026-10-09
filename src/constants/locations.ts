export interface SubCityOption {
  id: string;
  nameEn: string;
  nameAm: string;
  fee: number;
  timeEn: string;
  timeAm: string;
  center: [number, number]; // [lat, lng]
}

export interface AddisLandmark {
  id: string;
  nameEn: string;
  nameAm: string;
  subCityId: string;
  lat: number;
  lng: number;
  category: 'mall' | 'transport' | 'church' | 'institution' | 'square' | 'residential' | 'commercial';
  hintEn?: string;
  hintAm?: string;
}

export const SUB_CITIES: SubCityOption[] = [
  { id: 'bole', nameEn: 'Bole', nameAm: 'ቦሌ', fee: 100, timeEn: '1-2 Hours', timeAm: 'ከ1-2 ሰዓት', center: [8.9953, 38.7885] },
  { id: 'yeka', nameEn: 'Yeka', nameAm: 'የካ', fee: 120, timeEn: '1-2 Hours', timeAm: 'ከ1-2 ሰዓት', center: [9.0201, 38.7997] },
  { id: 'kirkos', nameEn: 'Kirkos', nameAm: 'ኪርቆስ', fee: 100, timeEn: '1-2 Hours', timeAm: 'ከ1-2 ሰዓት', center: [9.0182, 38.7663] },
  { id: 'arada', nameEn: 'Arada', nameAm: 'አራዳ', fee: 120, timeEn: '1-2 Hours', timeAm: 'ከ1-2 ሰዓት', center: [9.0345, 38.7518] },
  { id: 'lemi_kura', nameEn: 'Lemi Kura', nameAm: 'ለሚ ኩራ', fee: 150, timeEn: '2-3 Hours', timeAm: 'ከ2-3 ሰዓት', center: [9.0235, 38.8350] },
  { id: 'nifas_silk', nameEn: 'Nifas Silk-Lafto', nameAm: 'ነፋስ ስልክ ላፍቶ', fee: 130, timeEn: '2-3 Hours', timeAm: 'ከ2-3 ሰዓት', center: [9.0018, 38.7360] },
  { id: 'kolfe', nameEn: 'Kolfe Keranio', nameAm: 'ኮልፌ ቀራኒዮ', fee: 140, timeEn: '2-3 Hours', timeAm: 'ከ2-3 ሰዓት', center: [9.0076, 38.7231] },
  { id: 'gullele', nameEn: 'Gullele', nameAm: 'ጉለሌ', fee: 130, timeEn: '2-3 Hours', timeAm: 'ከ2-3 ሰዓት', center: [9.0558, 38.7610] },
  { id: 'addis_ketema', nameEn: 'Addis Ketema', nameAm: 'አዲስ ከተማ', fee: 110, timeEn: '1-2 Hours', timeAm: 'ከ1-2 ሰዓት', center: [9.0321, 38.7335] },
  { id: 'akaki_kality', nameEn: 'Akaki Kality', nameAm: 'አቃቂ ቃሊቲ', fee: 180, timeEn: '3-4 Hours', timeAm: 'ከ3-4 ሰዓት', center: [8.8920, 38.7645] },
];

export const ADDIS_LANDMARKS: AddisLandmark[] = [
  // Bole
  { id: 'edna_mall', nameEn: 'Edna Mall / Cameroon St', nameAm: 'ኤድና ሞል / ካሜሩን ጎዳና', subCityId: 'bole', lat: 8.9972, lng: 38.7877, category: 'mall', hintEn: 'Near Medhanialem Cinema & Mafi City Mall', hintAm: 'ከመድኃኔዓለም ሲኒማ እና ማፊ ሲቲ ሞል አጠገብ' },
  { id: 'bole_medhanialem', nameEn: 'Bole Medhanialem Cathedral', nameAm: 'ቦሌ መድኃኔዓለም ቤተክርስቲያን', subCityId: 'bole', lat: 8.9953, lng: 38.7885, category: 'church', hintEn: 'Taxi stand & Commercial hub', hintAm: 'ታክሲ ተራ እና ንግድ ማዕከል' },
  { id: 'bole_atlas', nameEn: 'Bole Atlas / Shala Park', nameAm: 'ቦሌ አትላስ / ሻላ ፓርክ', subCityId: 'bole', lat: 9.0118, lng: 38.7845, category: 'square', hintEn: 'Near Atlas Hotel & Chane Gourmet', hintAm: 'ከአትላስ ሆቴል አጠገብ' },
  { id: 'bole_rwanda', nameEn: 'Rwanda Embassy / Brass Hospital', nameAm: 'ሩዋንዳ ኤምባሲ / ብራስ ሆስፒታል', subCityId: 'bole', lat: 8.9880, lng: 38.7820, category: 'institution', hintEn: 'Near Japanese Embassy & Brass', hintAm: 'ከጃፓን ኤምባሲ እና ብራስ አጠገብ' },
  { id: 'gerji_imperial', nameEn: 'Gerji Imperial / Roba Bakery', nameAm: 'ገርጂ ኢምፔሪያል / ሮባ ዳቦ', subCityId: 'bole', lat: 9.0035, lng: 38.8020, category: 'residential', hintEn: 'Near Unity University & Imperial Hotel', hintAm: 'ከዩኒቲ ዩኒቨርሲቲ እና ኢምፔሪያል ሆቴል' },

  // Kirkos
  { id: 'kazanchis_eca', nameEn: 'Kazanchis / UNECA & Intercontinental', nameAm: 'ካዛንቺስ / የተመድ ኢሲኤ እና ኢንተርኮንቲኔንታል', subCityId: 'kirkos', lat: 9.0182, lng: 38.7663, category: 'institution', hintEn: 'Opposite Radisson Blu & UNECA Gate', hintAm: 'ከራዲሰን ብሉ እና ከኢሲኤ በር ፊት ለፊት' },
  { id: 'meskel_square', nameEn: 'Meskel Square / Stadium', nameAm: 'መስቀል አደባባይ / ስታዲየም', subCityId: 'kirkos', lat: 9.0105, lng: 38.7615, category: 'square', hintEn: 'Central LRT Station & Exhibition Center', hintAm: 'ቀላል ባቡር ጣቢያ እና ኤግዚቢሽን ማዕከል' },
  { id: 'mexico_square', nameEn: 'Mexico Square / Tegbare-ed', nameAm: 'ሜክሲኮ አደባባይ / ተግብረዕድ', subCityId: 'kirkos', lat: 9.0105, lng: 38.7445, category: 'square', hintEn: 'Near CBE Head Office & Kotebe College', hintAm: 'ከኢትዮጵያ ንግድ ባንክ ዋና መሥሪያ ቤት አጠገብ' },
  { id: 'gotera', nameEn: 'Gotera Interchange / Pepsi Plant', nameAm: 'ጎተራ ማሳለጫ / ፔፕሲ ፋብሪካ', subCityId: 'kirkos', lat: 8.9875, lng: 38.7580, category: 'transport', hintEn: 'Debre Zeit Road Intersection', hintAm: 'ደብረ ዘይት መንገድ መገናኛ' },
  { id: 'olympia', nameEn: 'Olympia / Wollo Sefer', nameAm: 'ኦሊምፒያ / ወሎ ሰፈር', subCityId: 'kirkos', lat: 9.0010, lng: 38.7710, category: 'commercial', hintEn: 'Near Dembel City Center', hintAm: 'ከደምበል ሲቲ ሴንተር አጠገብ' },

  // Arada
  { id: 'piassa', nameEn: 'Piassa De Gaulle / Taitu Hotel', nameAm: 'ፒያሳ ደጎል አደባባይ / ጣይቱ ሆቴል', subCityId: 'arada', lat: 9.0345, lng: 38.7518, category: 'square', hintEn: 'Churchill Ave & Gold Market area', hintAm: 'ቸርችል ጎዳና እና ወርቅ ተራ' },
  { id: 'arat_kilo', nameEn: '4 Kilo / AAU Science Campus & Parliament', nameAm: '4 ኪሎ / አአዩ ሳይንስ እና ፓርላማ', subCityId: 'arada', lat: 9.0356, lng: 38.7634, category: 'institution', hintEn: 'Near Ministry of Education & Palace', hintAm: 'ከትምህርት ሚኒስቴር እና ቤተመንግስት አጠገብ' },
  { id: 'sidist_kilo', nameEn: '6 Kilo / Yekatit 12 Monument', nameAm: '6 ኪሎ / የካቲት 12 ሀውልት', subCityId: 'arada', lat: 9.0440, lng: 38.7610, category: 'square', hintEn: 'Main AAU Campus Gate', hintAm: 'አዲስ አበባ ዩኒቨርሲቲ ዋናው ግቢ በር' },

  // Yeka
  { id: 'megenagna', nameEn: 'Megenagna Diaspora Square / Zefmesh Mall', nameAm: 'መገናኛ ዲያስፖራ አደባባይ / ዘፍመሽ ሞል', subCityId: 'yeka', lat: 9.0201, lng: 38.7997, category: 'mall', hintEn: 'Hub for transport to CMC and Ayat', hintAm: 'የሲኤምሲ እና አያት መጓጓዣ መናኸሪያ' },
  { id: 'signal', nameEn: 'Signal / British Embassy', nameAm: 'ሲግናል / የእንግሊዝ ኤምባሲ', subCityId: 'yeka', lat: 9.0315, lng: 38.8078, category: 'institution', hintEn: 'Near Lem Hotel & Signal junction', hintAm: 'ከልም ሆቴል እና ሲግናል መታጠፊያ' },
  { id: 'kotebe', nameEn: 'Kotebe 02 / Metropolitan College', nameAm: 'ኮተቤ 02 / ሜትሮፖሊታን', subCityId: 'yeka', lat: 9.0270, lng: 38.8250, category: 'residential', hintEn: 'Near Kotebe Teachers College', hintAm: 'ከኮተቤ መምህራን ኮሌጅ አጠገብ' },

  // Lemi Kura
  { id: 'cmc_michael', nameEn: 'CMC Michael / Sunshine Real Estate', nameAm: 'ሲኤምሲ ሚካኤል / ሰንሻይን ሪል እስቴት', subCityId: 'lemi_kura', lat: 9.0235, lng: 38.8350, category: 'residential', hintEn: 'Near St. Michael Church & Tsehay', hintAm: 'ከቅዱስ ሚካኤል ቤተክርስቲያን እና ፀሐይ ሪል እስቴት' },
  { id: 'ayat_square', nameEn: 'Ayat Square / 49 Mazoriya', nameAm: 'አያት አደባባይ / 49 ማዞሪያ', subCityId: 'lemi_kura', lat: 9.0287, lng: 38.8680, category: 'square', hintEn: 'End of Light Rail Line & Ayat Zone 3', hintAm: 'የቀላል ባቡር መጨረሻ ጣቢያ እና አያት ዞን 3' },
  { id: 'summit', nameEn: 'Summit Condominium / Safari', nameAm: 'ሰሚት ኮንዶሚኒየም / ሳፋሪ', subCityId: 'lemi_kura', lat: 9.0190, lng: 38.8520, category: 'residential', hintEn: 'Summit Pepsi & Soft Drink factory', hintAm: 'ሰሚት ፔፕሲ ፋብሪካ አጠገብ' },

  // Nifas Silk-Lafto
  { id: 'sarbet', nameEn: 'Sarbet / Canadian Embassy & Vatican', nameAm: 'ሳርቤት / የካናዳ ኤምባሲ እና ቫቲካን', subCityId: 'nifas_silk', lat: 9.0018, lng: 38.7360, category: 'square', hintEn: 'Near Karl Square, ICS & Old Airport', hintAm: 'ከካርል አደባባይ እና አይሲኤስ አጠገብ' },
  { id: 'bisrate_gabriel', nameEn: 'Bisrate Gabriel / Laphto Mall', nameAm: 'ብስrate ገብርኤል / ላፍቶ ሞል', subCityId: 'nifas_silk', lat: 8.9890, lng: 38.7345, category: 'mall', hintEn: 'Near Laphto Bowling & Gabriel Church', hintAm: 'ከላፍቶ ቦውሊንግ እና ገብርኤል ቤተክርስቲያን' },
  { id: 'jemo_1', nameEn: 'Jemo 1 / Glass Factory', nameAm: 'ጀሞ 1 / መስታወት ፋብሪካ', subCityId: 'nifas_silk', lat: 8.9550, lng: 38.7210, category: 'residential', hintEn: 'Jemo Condominiums Main Gate', hintAm: 'የጀሞ ኮንዶሚኒየም ዋና መግቢያ' },

  // Kolfe Keranio
  { id: 'tor_hailoch', nameEn: 'Tor Hailoch / Total Square', nameAm: 'ጦር ኃይሎች / ቶታል አደባባይ', subCityId: 'kolfe', lat: 9.0076, lng: 38.7231, category: 'transport', hintEn: 'Near Armed Forces Hospital & LRT', hintAm: 'ከጦር ኃይሎች ሆስፒታል እና ባቡር ጣቢያ' },
  { id: 'ayer_tena', nameEn: 'Ayer Tena Square / Roundabout', nameAm: 'አየር ጤና አደባባይ', subCityId: 'kolfe', lat: 8.9920, lng: 38.7050, category: 'square', hintEn: 'Near Commercial Bank & Mosque', hintAm: 'ከንግድ ባንክ እና መስጊድ አጠገብ' },

  // Gullele
  { id: 'shiromeda', nameEn: 'Shiromeda / US Embassy & Cultural Clothes', nameAm: 'ሽሮሜዳ / የአሜሪካ ኤምባሲ እና የባህል ልብስ', subCityId: 'gullele', lat: 9.0558, lng: 38.7610, category: 'institution', hintEn: 'Near Entoto road & US Embassy gate', hintAm: 'ወደ እንጦጦ መውጫ እና ከአሜሪካ ኤምባሲ በር' },
  { id: 'addisu_gebeya', nameEn: 'Addisu Gebeya / Semen Hotel', nameAm: 'አዲሱ ገበያ / ሰሜን ሆቴል', subCityId: 'gullele', lat: 9.0490, lng: 38.7420, category: 'commercial', hintEn: 'Near St. Paul Hospital junction', hintAm: 'ከቅዱስ ጳውሎስ ሆስፒታል መታጠፊያ' },

  // Addis Ketema
  { id: 'merkato', nameEn: 'Merkato / Grand Anwar Mosque', nameAm: 'መርካቶ / ታላቁ አንዋር መስጊድ', subCityId: 'addis_ketema', lat: 9.0321, lng: 38.7335, category: 'church', hintEn: 'Military Tera & Cinema Ras', hintAm: 'ሚሊተሪ ተራ እና ሲኒማ ራስ' },
  { id: 'autobis_tera', nameEn: 'Autobis Tera / Long Distance Terminal', nameAm: 'አውቶቢስ ተራ / የሀገር አቋራጭ መናኸሪያ', subCityId: 'addis_ketema', lat: 9.0360, lng: 38.7290, category: 'transport', hintEn: 'Central intercity bus terminal', hintAm: 'ዋናው የሀገር አቋራጭ አውቶቢስ መናኸሪያ' },

  // Akaki Kality
  { id: 'kality_square', nameEn: 'Kality Square / Crown Hotel', nameAm: 'ቃሊቲ አደባባይ / ክራውን ሆቴል', subCityId: 'akaki_kality', lat: 8.8920, lng: 38.7645, category: 'square', hintEn: 'Near Driver Training & Customs', hintAm: 'ከመንጃ ፍቃድ ማሰልጠኛ እና ጉምሩክ' },
  { id: 'tulu_dimtu', nameEn: 'Tulu Dimtu Interchange / Toll Gate', nameAm: 'ቱሉ ዲምቱ / የፍጥነት መንገድ መግቢያ', subCityId: 'akaki_kality', lat: 8.8450, lng: 38.7950, category: 'transport', hintEn: 'Expressway toll station entrance', hintAm: 'የአዲስ-አዳማ የፍጥነት መንገድ መግቢያ' }
];

// Helper: Calculate distance in kilometers between two coordinates (Haversine formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// Helper: Find nearest landmark to any lat/lng in Addis Ababa
export function findNearestLandmark(lat: number, lng: number): { landmark: AddisLandmark; distanceKm: number } | null {
  if (ADDIS_LANDMARKS.length === 0) return null;
  let nearest = ADDIS_LANDMARKS[0];
  let minDistance = calculateDistanceKm(lat, lng, nearest.lat, nearest.lng);

  for (let i = 1; i < ADDIS_LANDMARKS.length; i++) {
    const dist = calculateDistanceKm(lat, lng, ADDIS_LANDMARKS[i].lat, ADDIS_LANDMARKS[i].lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = ADDIS_LANDMARKS[i];
    }
  }

  return { landmark: nearest, distanceKm: minDistance };
}

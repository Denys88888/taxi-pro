export interface GeocodingResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    road?: string;
    house_number?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

// ===== LOCAL ADDRESS DATABASE — Works offline, no API needed =====
// This ensures geocoding works in Pi Browser and other restricted environments

const LOCAL_ADDRESSES: GeocodingResult[] = [
  // === MOSCOW ===
  { place_id: 'local_1', display_name: 'Красная площадь, Москва, Россия', lat: '55.7539', lon: '37.6208', type: 'place', importance: 1, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_2', display_name: 'Московский Кремль, Москва, Россия', lat: '55.7520', lon: '37.6175', type: 'place', importance: 1, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_3', display_name: 'Аэропорт Шереметьево, Москва, Россия', lat: '55.9736', lon: '37.4125', type: 'place', importance: 0.9, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_4', display_name: 'Аэропорт Домодедово, Москва, Россия', lat: '55.4103', lon: '37.9023', type: 'place', importance: 0.9, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_5', display_name: 'Аэропорт Внуково, Москва, Россия', lat: '55.5915', lon: '37.2615', type: 'place', importance: 0.9, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_6', display_name: 'Тверская улица, Москва, Россия', lat: '55.7582', lon: '37.6113', type: 'place', importance: 0.8, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_7', display_name: 'Арбат, Москва, Россия', lat: '55.7496', lon: '37.5911', type: 'place', importance: 0.8, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_8', display_name: 'Парк Горького, Москва, Россия', lat: '55.7314', lon: '37.6039', type: 'place', importance: 0.8, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_9', display_name: 'ВДНХ, Москва, Россия', lat: '55.8261', lon: '37.6376', type: 'place', importance: 0.8, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_10', display_name: 'Сокольники, Москва, Россия', lat: '55.7891', lon: '37.6797', type: 'place', importance: 0.8, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_11', display_name: 'ТЦ Европейский, Москва, Россия', lat: '55.7447', lon: '37.5322', type: 'place', importance: 0.7, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_12', display_name: 'Москва-Сити, Москва, Россия', lat: '55.7496', lon: '37.5370', type: 'place', importance: 0.8, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_13', display_name: 'Киевский вокзал, Москва, Россия', lat: '55.7442', lon: '37.5813', type: 'place', importance: 0.8, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_14', display_name: 'Лужники, Москва, Россия', lat: '55.7158', lon: '37.5536', type: 'place', importance: 0.8, address: { city: 'Москва', country: 'Россия' } },
  { place_id: 'local_15', display_name: 'Останкино, Москва, Россия', lat: '55.8192', lon: '37.6111', type: 'place', importance: 0.7, address: { city: 'Москва', country: 'Россия' } },

  // === ST. PETERSBURG ===
  { place_id: 'local_16', display_name: 'Дворцовая площадь, Санкт-Петербург, Россия', lat: '59.9390', lon: '30.3158', type: 'place', importance: 0.9, address: { city: 'Санкт-Петербург', country: 'Россия' } },
  { place_id: 'local_17', display_name: 'Исаакиевский собор, Санкт-Петербург, Россия', lat: '59.9341', lon: '30.3062', type: 'place', importance: 0.9, address: { city: 'Санкт-Петербург', country: 'Россия' } },
  { place_id: 'local_18', display_name: 'Эрмитаж, Санкт-Петербург, Россия', lat: '59.9398', lon: '30.3146', type: 'place', importance: 0.9, address: { city: 'Санкт-Петербург', country: 'Россия' } },
  { place_id: 'local_19', display_name: 'Невский проспект, Санкт-Петербург, Россия', lat: '59.9343', lon: '30.3351', type: 'place', importance: 0.9, address: { city: 'Санкт-Петербург', country: 'Россия' } },
  { place_id: 'local_20', display_name: 'Пулково, Санкт-Петербург, Россия', lat: '59.8003', lon: '30.2625', type: 'place', importance: 0.8, address: { city: 'Санкт-Петербург', country: 'Россия' } },
  { place_id: 'local_21', display_name: 'Московский вокзал, Санкт-Петербург, Россия', lat: '59.9302', lon: '30.3618', type: 'place', importance: 0.8, address: { city: 'Санкт-Петербург', country: 'Россия' } },
  { place_id: 'local_22', display_name: 'Петергоф, Санкт-Петербург, Россия', lat: '59.8840', lon: '29.9056', type: 'place', importance: 0.7, address: { city: 'Санкт-Петербург', country: 'Россия' } },

  // === KYIV ===
  { place_id: 'local_23', display_name: 'Майдан Незалежности, Киев, Украина', lat: '50.4504', lon: '30.5245', type: 'place', importance: 0.9, address: { city: 'Киев', country: 'Украина' } },
  { place_id: 'local_24', display_name: 'Софиевский собор, Киев, Украина', lat: '50.4531', lon: '30.5144', type: 'place', importance: 0.9, address: { city: 'Киев', country: 'Украина' } },
  { place_id: 'local_25', display_name: 'Родина-мать, Киев, Украина', lat: '50.4266', lon: '30.5630', type: 'place', importance: 0.8, address: { city: 'Киев', country: 'Украина' } },
  { place_id: 'local_26', display_name: 'Олимпийский стадион, Киев, Украина', lat: '50.4333', lon: '30.5217', type: 'place', importance: 0.8, address: { city: 'Киев', country: 'Украина' } },
  { place_id: 'local_27', display_name: 'Подол, Киев, Украина', lat: '50.4667', lon: '30.5167', type: 'place', importance: 0.7, address: { city: 'Киев', country: 'Украина' } },
  { place_id: 'local_28', display_name: 'Аэропорт Жуляны, Киев, Украина', lat: '50.4019', lon: '30.4497', type: 'place', importance: 0.8, address: { city: 'Киев', country: 'Украина' } },
  { place_id: 'local_29', display_name: 'Андреевский спуск, Киев, Украина', lat: '50.4594', lon: '30.5179', type: 'place', importance: 0.8, address: { city: 'Киев', country: 'Украина' } },
  { place_id: 'local_30', display_name: 'Оболонь, Киев, Украина', lat: '50.5050', lon: '30.4983', type: 'place', importance: 0.7, address: { city: 'Киев', country: 'Украина' } },
  { place_id: 'local_31', display_name: 'Борисполь, Киев, Украина', lat: '50.3412', lon: '30.8898', type: 'place', importance: 0.8, address: { city: 'Киев', country: 'Украина' } },

  // === MINSK ===
  { place_id: 'local_32', display_name: 'Площадь Независимости, Минск, Беларусь', lat: '53.8958', lon: '27.5478', type: 'place', importance: 0.9, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_33', display_name: 'Площадь Победы, Минск, Беларусь', lat: '53.9081', lon: '27.5742', type: 'place', importance: 0.8, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_34', display_name: 'Национальная библиотека, Минск, Беларусь', lat: '53.9216', lon: '27.6589', type: 'place', importance: 0.8, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_35', display_name: 'Национальный аэропорт, Минск, Беларусь', lat: '53.8885', lon: '28.0445', type: 'place', importance: 0.8, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_36', display_name: 'Улица Немига, Минск, Беларусь', lat: '53.9059', lon: '27.5545', type: 'place', importance: 0.7, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_37', display_name: 'Стадион Динамо, Минск, Беларусь', lat: '53.8956', lon: '27.5605', type: 'place', importance: 0.7, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_38', display_name: 'Троицкое предместье, Минск, Беларусь', lat: '53.9083', lon: '27.5563', type: 'place', importance: 0.7, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_39', display_name: 'Комаровский рынок, Минск, Беларусь', lat: '53.8892', lon: '27.5386', type: 'place', importance: 0.6, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_40', display_name: 'Ботанический сад, Минск, Беларусь', lat: '53.9167', lon: '27.6167', type: 'place', importance: 0.6, address: { city: 'Минск', country: 'Беларусь' } },
  { place_id: 'local_41', display_name: 'ТЦ Замок, Минск, Беларусь', lat: '53.9288', lon: '27.5826', type: 'place', importance: 0.6, address: { city: 'Минск', country: 'Беларусь' } },

  // === ALMATY ===
  { place_id: 'local_42', display_name: 'Площадь Республики, Алматы, Казахстан', lat: '43.2380', lon: '76.9459', type: 'place', importance: 0.9, address: { city: 'Алматы', country: 'Казахстан' } },
  { place_id: 'local_43', display_name: 'Вознесенский собор, Алматы, Казахстан', lat: '43.2581', lon: '76.9530', type: 'place', importance: 0.8, address: { city: 'Алматы', country: 'Казахстан' } },
  { place_id: 'local_44', display_name: 'Кок-Тобе, Алматы, Казахстан', lat: '43.2346', lon: '76.9783', type: 'place', importance: 0.8, address: { city: 'Алматы', country: 'Казахстан' } },
  { place_id: 'local_45', display_name: 'Аэропорт Алматы, Алматы, Казахстан', lat: '43.3521', lon: '77.0405', type: 'place', importance: 0.8, address: { city: 'Алматы', country: 'Казахстан' } },
  { place_id: 'local_46', display_name: 'Каток Медеу, Алматы, Казахстан', lat: '43.2098', lon: '77.0861', type: 'place', importance: 0.7, address: { city: 'Алматы', country: 'Казахстан' } },
  { place_id: 'local_47', display_name: 'Шымбулак, Алматы, Казахстан', lat: '43.1283', lon: '77.0810', type: 'place', importance: 0.7, address: { city: 'Алматы', country: 'Казахстан' } },
  { place_id: 'local_48', display_name: 'Достык Плаза, Алматы, Казахстан', lat: '43.2408', lon: '76.9189', type: 'place', importance: 0.6, address: { city: 'Алматы', country: 'Казахстан' } },
  { place_id: 'local_49', display_name: 'Парк Первого Президента, Алматы, Казахстан', lat: '43.2267', lon: '76.9225', type: 'place', importance: 0.6, address: { city: 'Алматы', country: 'Казахстан' } },
  { place_id: 'local_50', display_name: 'Mega Park, Алматы, Казахстан', lat: '43.2028', lon: '76.8933', type: 'place', importance: 0.6, address: { city: 'Алматы', country: 'Казахстан' } },

  // === WARSAW (including Plowiecka!) ===
  { place_id: 'local_51', display_name: 'Улица Плёвецкая, Варшава, Польша', lat: '52.2370', lon: '21.1230', type: 'place', importance: 0.7, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_52', display_name: 'Замковая площадь, Варшава, Польша', lat: '52.2476', lon: '21.0142', type: 'place', importance: 0.8, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_53', display_name: 'Дворец культуры, Варшава, Польша', lat: '52.2318', lon: '21.0058', type: 'place', importance: 0.8, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_54', display_name: 'Аэропорт Шопена, Варшава, Польша', lat: '52.1657', lon: '20.9671', type: 'place', importance: 0.8, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_55', display_name: 'Национальный стадион, Варшава, Польша', lat: '52.2395', lon: '21.0456', type: 'place', importance: 0.7, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_56', display_name: 'Злоте Тарасы, Варшава, Польша', lat: '52.2303', lon: '21.0019', type: 'place', importance: 0.7, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_57', display_name: 'Лазенковский дворец, Варшава, Польша', lat: '52.2144', lon: '21.0354', type: 'place', importance: 0.7, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_58', display_name: 'Улица Новый Свет, Варшава, Польша', lat: '52.2352', lon: '21.0190', type: 'place', importance: 0.6, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_59', display_name: 'Мокотув, Варшава, Польша', lat: '52.1904', lon: '21.0038', type: 'place', importance: 0.6, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_60', display_name: 'Виланув, Варшава, Польша', lat: '52.1658', lon: '21.0906', type: 'place', importance: 0.6, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_61', display_name: 'Прага-Полудне, Варшава, Польша', lat: '52.2449', lon: '21.0845', type: 'place', importance: 0.6, address: { city: 'Варшава', country: 'Польша' } },
  { place_id: 'local_62', display_name: 'Воля, Варшава, Польша', lat: '52.2370', lon: '20.9800', type: 'place', importance: 0.6, address: { city: 'Варшава', country: 'Польша' } },

  // === INTERNATIONAL ===
  { place_id: 'local_63', display_name: 'Аэропорт Хитроу, Лондон, Великобритания', lat: '51.4700', lon: '-0.4543', type: 'place', importance: 0.8, address: { city: 'Лондон', country: 'Великобритания' } },
  { place_id: 'local_64', display_name: 'Эйфелева башня, Париж, Франция', lat: '48.8584', lon: '2.2945', type: 'place', importance: 0.9, address: { city: 'Париж', country: 'Франция' } },
  { place_id: 'local_65', display_name: 'Аэропорт Шарль-де-Голль, Париж, Франция', lat: '49.0097', lon: '2.5479', type: 'place', importance: 0.8, address: { city: 'Париж', country: 'Франция' } },
  { place_id: 'local_66', display_name: 'CN Tower, Торонто, Канада', lat: '43.6426', lon: '-79.3871', type: 'place', importance: 0.8, address: { city: 'Торонто', country: 'Канада' } },
  { place_id: 'local_67', display_name: 'Аэропорт Нарита, Токио, Япония', lat: '35.7647', lon: '140.3864', type: 'place', importance: 0.8, address: { city: 'Токио', country: 'Япония' } },
  { place_id: 'local_68', display_name: 'Аэропорт Дубай, Дубай, ОАЭ', lat: '25.2532', lon: '55.3657', type: 'place', importance: 0.8, address: { city: 'Дубай', country: 'ОАЭ' } },
  { place_id: 'local_69', display_name: 'Аэропорт Чанги, Сингапур', lat: '1.3644', lon: '103.9915', type: 'place', importance: 0.8, address: { city: 'Сингапур', country: 'Сингапур' } },
  { place_id: 'local_70', display_name: 'Центральный вокзал, Берлин, Германия', lat: '52.5251', lon: '13.3694', type: 'place', importance: 0.8, address: { city: 'Берлин', country: 'Германия' } },
  { place_id: 'local_71', display_name: 'Колизей, Рим, Италия', lat: '41.8902', lon: '12.4922', type: 'place', importance: 0.9, address: { city: 'Рим', country: 'Италия' } },
  { place_id: 'local_72', display_name: 'Саграда Фамилия, Барселона, Испания', lat: '41.4036', lon: '2.1744', type: 'place', importance: 0.9, address: { city: 'Барселона', country: 'Испания' } },
  { place_id: 'local_73', display_name: 'Аэропорт JFK, Нью-Йорк, США', lat: '40.6413', lon: '-73.7781', type: 'place', importance: 0.8, address: { city: 'Нью-Йорк', country: 'США' } },
  { place_id: 'local_74', display_name: 'Биг-Бен, Лондон, Великобритания', lat: '51.5007', lon: '-0.1246', type: 'place', importance: 0.9, address: { city: 'Лондон', country: 'Великобритания' } },
  { place_id: 'local_75', display_name: 'Бранденбургские ворота, Берлин, Германия', lat: '52.5163', lon: '13.3777', type: 'place', importance: 0.9, address: { city: 'Берлин', country: 'Германия' } },
  { place_id: 'local_76', display_name: 'Сиднейский оперный театр, Сидней, Австралия', lat: '-33.8568', lon: '151.2153', type: 'place', importance: 0.9, address: { city: 'Сидней', country: 'Австралия' } },
  { place_id: 'local_77', display_name: 'Бурдж-Халифа, Дубай, ОАЭ', lat: '25.1972', lon: '55.2744', type: 'place', importance: 0.9, address: { city: 'Дубай', country: 'ОАЭ' } },
  { place_id: 'local_78', display_name: 'Красная площадь, Москва, Россия', lat: '55.7539', lon: '37.6208', type: 'place', importance: 1, address: { city: 'Москва', country: 'Россия' } },
];

/**
 * Search local address database by query string (case-insensitive, works offline)
 */
function searchLocalAddresses(query: string): GeocodingResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  // Split query into words for better matching
  const words = q.split(/\s+/).filter(w => w.length >= 2);

  return LOCAL_ADDRESSES.filter(addr => {
    const display = addr.display_name.toLowerCase();
    // Match all words
    return words.every(w => display.includes(w));
  }).sort((a, b) => b.importance - a.importance);
}

// Geoapify API key
const GEOAPIFY_KEY = '';

// Try multiple geocoding services
async function tryGeocode(query: string): Promise<GeocodingResult[]> {
  // 0. First try LOCAL database (always works, no network needed)
  const local = searchLocalAddresses(query);
  if (local.length > 0) return local;

  const q = encodeURIComponent(query.trim());

  // 1. Try Nominatim
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=8&addressdetails=1`,
      { signal: controller.signal, headers: { 'Accept-Language': 'ru,en', 'User-Agent': 'TaxiPro/1.0' } }
    );
    if (resp.ok) {
      const data = await resp.json();
      if (data?.length > 0) return data as GeocodingResult[];
    }
  } catch { /* Nominatim failed */ }

  // 2. Try Geoapify
  try {
    const key = GEOAPIFY_KEY || 'DEMO';
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${q}&limit=8&format=json&lang=ru&apiKey=${key}`,
      { signal: controller.signal }
    );
    if (resp.ok) {
      const data = await resp.json();
      if (data?.results?.length > 0) {
        return data.results.map((r: any) => ({
          place_id: r.place_id || String(r.rank?.popularity || Date.now()),
          display_name: r.formatted || r.name || r.address_line1 || query,
          lat: String(r.lat), lon: String(r.lon),
          type: r.result_type || 'place',
          importance: r.rank?.popularity || 0.5,
          address: { city: r.city, road: r.street, house_number: r.housenumber, country: r.country },
        }));
      }
    }
  } catch { /* Geoapify failed */ }

  return [];
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  return tryGeocode(query);
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  // Try local first
  const local = LOCAL_ADDRESSES.find(a => {
    const d = Math.abs(parseFloat(a.lat) - lat) + Math.abs(parseFloat(a.lon) - lng);
    return d < 0.01;
  });
  if (local) return local.display_name;

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { signal: controller.signal, headers: { 'Accept-Language': 'ru,en', 'User-Agent': 'TaxiPro/1.0' } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.display_name || null;
  } catch { return null; }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function autocompleteLocations(query: string, callback: (results: GeocodingResult[]) => void): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!query || query.trim().length < 2) { callback([]); return; }
  debounceTimer = setTimeout(async () => {
    const results = await searchLocations(query);
    callback(results);
  }, 300);
}

export interface GeocodingResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  postcode?: string;
  aliases?: string[]; // Latin/transliterated names for cross-alphabet search
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
    postcode?: string;
    zipcode?: string;
  };
}

// ===== LOCAL ADDRESS DATABASE — Works 100% offline =====
// Each entry has aliases for Latin/Cyrillic cross-search

const LOCAL_ADDRESSES: GeocodingResult[] = [
  // === MOSCOW ===
  { place_id: 'mow_1', display_name: 'Красная площадь, Москва, Россия', lat: '55.7539', lon: '37.6208', type: 'place', importance: 1, postcode: '101000', aliases: ['krasnaya ploshchad', 'red square', 'plac czerwony'] },
  { place_id: 'mow_2', display_name: 'Московский Кремль, Москва, Россия', lat: '55.7520', lon: '37.6175', type: 'place', importance: 1, aliases: ['kremlin', 'moscow kremlin'] },
  { place_id: 'mow_3', display_name: 'Аэропорт Шереметьево, Москва, Россия', lat: '55.9736', lon: '37.4125', type: 'place', importance: 0.9, postcode: '141400', aliases: ['sheremetyevo airport', 'svo', 'lotnisko sziriemietiewo', 'sheremetyevo'] },
  { place_id: 'mow_4', display_name: 'Аэропорт Домодедово, Москва, Россия', lat: '55.4103', lon: '37.9023', type: 'place', importance: 0.9, postcode: '142015', aliases: ['domodedovo airport', 'dme'] },
  { place_id: 'mow_5', display_name: 'Аэропорт Внуково, Москва, Россия', lat: '55.5915', lon: '37.2615', type: 'place', importance: 0.9, postcode: '119027', aliases: ['vnukovo airport', 'vko'] },
  { place_id: 'mow_6', display_name: 'Тверская улица, Москва, Россия', lat: '55.7582', lon: '37.6113', type: 'place', importance: 0.8, postcode: '125009', aliases: ['tverskaya ulitsa', 'tverskaya street', 'ulica twerska'] },
  { place_id: 'mow_7', display_name: 'Арбат, Москва, Россия', lat: '55.7496', lon: '37.5911', type: 'place', importance: 0.8, postcode: '119019', aliases: ['arbat street', 'ulica arbat'] },
  { place_id: 'mow_8', display_name: 'Парк Горького, Москва, Россия', lat: '55.7314', lon: '37.6039', type: 'place', importance: 0.8, postcode: '119049', aliases: ['gorky park', 'park gorkiego'] },
  { place_id: 'mow_9', display_name: 'ВДНХ, Москва, Россия', lat: '55.8261', lon: '37.6376', type: 'place', importance: 0.8, postcode: '129223', aliases: ['vdnkh', 'vdnh'] },
  { place_id: 'mow_10', display_name: 'Сокольники, Москва, Россия', lat: '55.7891', lon: '37.6797', type: 'place', importance: 0.8, aliases: ['sokolniki'] },
  { place_id: 'mow_11', display_name: 'ТЦ Европейский, Москва, Россия', lat: '55.7447', lon: '37.5322', type: 'place', importance: 0.7, postcode: '121099', aliases: ['evropeyskiy mall', 'european mall'] },
  { place_id: 'mow_12', display_name: 'Москва-Сити, Москва, Россия', lat: '55.7496', lon: '37.5370', type: 'place', importance: 0.8, postcode: '123317', aliases: ['moscow city', 'moskwa city'] },
  { place_id: 'mow_13', display_name: 'Киевский вокзал, Москва, Россия', lat: '55.7442', lon: '37.5813', type: 'place', importance: 0.8, postcode: '121059', aliases: ['kievsky vokzal', 'kiev railway station'] },
  { place_id: 'mow_14', display_name: 'Лужники, Москва, Россия', lat: '55.7158', lon: '37.5536', type: 'place', importance: 0.8, postcode: '119048', aliases: ['luzhniki stadium', 'stadion luzniki'] },
  { place_id: 'mow_15', display_name: 'Останкино, Москва, Россия', lat: '55.8192', lon: '37.6111', type: 'place', importance: 0.7, postcode: '127427', aliases: ['ostankino tower', 'wieza ostanino'] },

  // === ST. PETERSBURG ===
  { place_id: 'spb_1', display_name: 'Дворцовая площадь, Санкт-Петербург, Россия', lat: '59.9390', lon: '30.3158', type: 'place', importance: 0.9, postcode: '191186', aliases: ['dvortsovaya ploshchad', 'palace square', 'plac palacowy'] },
  { place_id: 'spb_2', display_name: 'Исаакиевский собор, Санкт-Петербург, Россия', lat: '59.9341', lon: '30.3062', type: 'place', importance: 0.9, aliases: ['isaakievskiy sobor', 'st isaacs cathedral', 'katedra sw. isaaca'] },
  { place_id: 'spb_3', display_name: 'Эрмитаж, Санкт-Петербург, Россия', lat: '59.9398', lon: '30.3146', type: 'place', importance: 0.9, aliases: ['hermitage', 'ermitage', 'ermitaz'] },
  { place_id: 'spb_4', display_name: 'Невский проспект, Санкт-Петербург, Россия', lat: '59.9343', lon: '30.3351', type: 'place', importance: 0.9, postcode: '191025', aliases: ['nevsky prospekt', 'nevsky avenue', 'prospekt newski'] },
  { place_id: 'spb_5', display_name: 'Пулково, Санкт-Петербург, Россия', lat: '59.8003', lon: '30.2625', type: 'place', importance: 0.8, postcode: '196210', aliases: ['pulkovo airport', 'led'] },
  { place_id: 'spb_6', display_name: 'Московский вокзал, Санкт-Петербург, Россия', lat: '59.9302', lon: '30.3618', type: 'place', importance: 0.8, postcode: '191040', aliases: ['moskovsky vokzal', 'moscow railway station'] },

  // === KYIV ===
  { place_id: 'kyv_1', display_name: 'Майдан Незалежности, Киев, Украина', lat: '50.4504', lon: '30.5245', type: 'place', importance: 0.9, postcode: '01001', aliases: ['maidan nezalezhnosti', 'independence square', 'majdan niepodleglosci'] },
  { place_id: 'kyv_2', display_name: 'Софиевский собор, Киев, Украина', lat: '50.4531', lon: '30.5144', type: 'place', importance: 0.9, aliases: ['sofiyskiy sobor', 'saint sophia cathedral', 'katedra sofii'] },
  { place_id: 'kyv_3', display_name: 'Родина-мать, Киев, Украина', lat: '50.4266', lon: '30.5630', type: 'place', importance: 0.8, aliases: ['rodina mat', 'motherland monument', 'pomnik matka ojczyzna'] },
  { place_id: 'kyv_4', display_name: 'Олимпийский стадион, Киев, Украина', lat: '50.4333', lon: '30.5217', type: 'place', importance: 0.8, postcode: '01001', aliases: ['olimpiyskiy', 'olympic stadium', 'stadion olimpijski'] },
  { place_id: 'kyv_5', display_name: 'Подол, Киев, Украина', lat: '50.4667', lon: '30.5167', type: 'place', importance: 0.7, aliases: ['podil', 'podol'] },
  { place_id: 'kyv_6', display_name: 'Аэропорт Жуляны, Киев, Украина', lat: '50.4019', lon: '30.4497', type: 'place', importance: 0.8, postcode: '03058', aliases: ['zhulyany airport', 'iev'] },
  { place_id: 'kyv_7', display_name: 'Андреевский спуск, Киев, Украина', lat: '50.4594', lon: '30.5179', type: 'place', importance: 0.8, aliases: ['andriyivskyy uzviz', 'andrews descent', 'zbocze andrijiwskie'] },
  { place_id: 'kyv_8', display_name: 'Борисполь, Киев, Украина', lat: '50.3412', lon: '30.8898', type: 'place', importance: 0.8, postcode: '08300', aliases: ['borispol airport', 'boryspil', 'kbp'] },

  // === MINSK ===
  { place_id: 'msk_1', display_name: 'Площадь Независимости, Минск, Беларусь', lat: '53.8958', lon: '27.5478', type: 'place', importance: 0.9, postcode: '220030', aliases: ['ploshchad nezalezhnastsi', 'independence square minsk', 'plac niepodleglosci mińsk'] },
  { place_id: 'msk_2', display_name: 'Площадь Победы, Минск, Беларусь', lat: '53.9081', lon: '27.5742', type: 'place', importance: 0.8, postcode: '220004', aliases: ['ploshchad peramohi', 'victory square minsk', 'plac zwyciestwa'] },
  { place_id: 'msk_3', display_name: 'Национальная библиотека, Минск, Беларусь', lat: '53.9216', lon: '27.6589', type: 'place', importance: 0.8, postcode: '220114', aliases: ['national library minsk', 'biblioteka narodowa'] },
  { place_id: 'msk_4', display_name: 'Национальный аэропорт, Минск, Беларусь', lat: '53.8885', lon: '28.0445', type: 'place', importance: 0.8, postcode: '220054', aliases: ['minsk airport', 'national airport minsk', 'msq'] },
  { place_id: 'msk_5', display_name: 'Улица Немига, Минск, Беларусь', lat: '53.9059', lon: '27.5545', type: 'place', importance: 0.7, postcode: '220004', aliases: ['vulica nemihа', 'nemiga street'] },
  { place_id: 'msk_6', display_name: 'Троицкое предместье, Минск, Беларусь', lat: '53.9083', lon: '27.5563', type: 'place', importance: 0.7, aliases: ['troitskaye pradmeste', 'trinity hill minsk', 'gorka trocka'] },
  { place_id: 'msk_7', display_name: 'Стадион Динамо, Минск, Беларусь', lat: '53.8956', lon: '27.5605', type: 'place', importance: 0.7, postcode: '220004', aliases: ['dinamo stadium minsk', 'stadion dynamo'] },
  { place_id: 'msk_8', display_name: 'Дворец Республики, Минск, Беларусь', lat: '53.9028', lon: '27.5613', type: 'place', importance: 0.7, postcode: '220030', aliases: ['palace of republic minsk', 'palac republiki'] },
  { place_id: 'msk_9', display_name: 'Комаровский рынок, Минск, Беларусь', lat: '53.8892', lon: '27.5386', type: 'place', importance: 0.6, postcode: '220004', aliases: ['komarovsky market', 'targ komarowski'] },
  { place_id: 'msk_10', display_name: 'ТЦ Замок, Минск, Беларусь', lat: '53.9288', lon: '27.5826', type: 'place', importance: 0.6, postcode: '220004', aliases: ['zamok mall minsk', 'zamek'] },

  // === ALMATY ===
  { place_id: 'alm_1', display_name: 'Площадь Республики, Алматы, Казахстан', lat: '43.2380', lon: '76.9459', type: 'place', importance: 0.9, postcode: '050000', aliases: ['respublikasy alymay', 'republic square almaty', 'plac republiki'] },
  { place_id: 'alm_2', display_name: 'Вознесенский собор, Алматы, Казахстан', lat: '43.2581', lon: '76.9530', type: 'place', importance: 0.8, postcode: '050000', aliases: ['voznesensky cathedral', 'katedra wniebowstapienia'] },
  { place_id: 'alm_3', display_name: 'Кок-Тобе, Алматы, Казахстан', lat: '43.2346', lon: '76.9783', type: 'place', importance: 0.8, postcode: '050000', aliases: ['kok tobe', 'kok-tobe hill'] },
  { place_id: 'alm_4', display_name: 'Аэропорт Алматы, Алматы, Казахстан', lat: '43.3521', lon: '77.0405', type: 'place', importance: 0.8, postcode: '050039', aliases: ['almaty airport', 'ala'] },
  { place_id: 'alm_5', display_name: 'Каток Медеу, Алматы, Казахстан', lat: '43.2098', lon: '77.0861', type: 'place', importance: 0.7, postcode: '050020', aliases: ['medeu skating rink', 'lodowisko medeo'] },
  { place_id: 'alm_6', display_name: 'Шымбулак, Алматы, Казахстан', lat: '43.1283', lon: '77.0810', type: 'place', importance: 0.7, aliases: ['shymbulak', 'chimbulak'] },
  { place_id: 'alm_7', display_name: 'Достык Плаза, Алматы, Казахстан', lat: '43.2408', lon: '76.9189', type: 'place', importance: 0.6, postcode: '050000', aliases: ['dostyk plaza', 'dostyk mall'] },
  { place_id: 'alm_8', display_name: 'Парк Первого Президента, Алматы, Казахстан', lat: '43.2267', lon: '76.9225', type: 'place', importance: 0.6, postcode: '050000', aliases: ['first president park almaty', 'park pierwszego prezydenta'] },

  // === WARSAW (with Latin aliases!) ===
  { place_id: 'war_1', display_name: 'Улица Плёвецкая, Варшава, Польша', lat: '52.2370', lon: '21.1230', type: 'place', importance: 0.8, postcode: '04-567', aliases: ['ulica plowiecka', 'plowiecka street', 'plowiecka', 'plowiecka warszawa', 'plowiecka 111', 'plowiecka 2', 'plowiecka 1'] },
  { place_id: 'war_2', display_name: 'Замковая площадь, Варшава, Польша', lat: '52.2476', lon: '21.0142', type: 'place', importance: 0.8, postcode: '00-277', aliases: ['plac zamkowy', 'castle square warsaw', 'zamkowy'] },
  { place_id: 'war_3', display_name: 'Дворец культуры, Варшава, Польша', lat: '52.2318', lon: '21.0058', type: 'place', importance: 0.8, postcode: '00-901', aliases: ['palac kultury', 'palace of culture warsaw', 'pkn'] },
  { place_id: 'war_4', display_name: 'Аэропорт Шопена, Варшава, Польша', lat: '52.1657', lon: '20.9671', type: 'place', importance: 0.8, postcode: '02-143', aliases: ['lotnisko chopina', 'chopin airport warsaw', 'waw'] },
  { place_id: 'war_5', display_name: 'Национальный стадион, Варшава, Польша', lat: '52.2395', lon: '21.0456', type: 'place', importance: 0.7, postcode: '03-972', aliases: ['stadion narodowy', 'national stadium warsaw'] },
  { place_id: 'war_6', display_name: 'Злоте Тарасы, Варшава, Польша', lat: '52.2303', lon: '21.0019', type: 'place', importance: 0.7, postcode: '00-906', aliases: ['zlote tarasy', 'golden terraces warsaw'] },
  { place_id: 'war_7', display_name: 'Лазенковский дворец, Варшава, Польша', lat: '52.2144', lon: '21.0354', type: 'place', importance: 0.7, postcode: '00-460', aliases: ['lazienki krolewskie', 'lazienki palace warsaw'] },
  { place_id: 'war_8', display_name: 'Улица Новый Свет, Варшава, Польша', lat: '52.2352', lon: '21.0190', type: 'place', importance: 0.6, postcode: '00-372', aliases: ['ulica nowy swiat', 'nowy swiat warsaw'] },
  { place_id: 'war_9', display_name: 'Мокотув, Варшава, Польша', lat: '52.1904', lon: '21.0038', type: 'place', importance: 0.6, postcode: '02-001', aliases: ['mokotow', 'mokotow warsaw'] },
  { place_id: 'war_10', display_name: 'Виланув, Варшава, Польша', lat: '52.1658', lon: '21.0906', type: 'place', importance: 0.6, postcode: '02-958', aliases: ['wilanow', 'wilanow warsaw'] },
  { place_id: 'war_11', display_name: 'Прага-Полудне, Варшава, Польша', lat: '52.2449', lon: '21.0845', type: 'place', importance: 0.6, postcode: '04-001', aliases: ['praga poludnie', 'praga poludnie warsaw'] },
  { place_id: 'war_12', display_name: 'Воля, Варшава, Польша', lat: '52.2370', lon: '20.9800', type: 'place', importance: 0.6, postcode: '01-001', aliases: ['wola', 'wola warsaw'] },

  // === INTERNATIONAL ===
  { place_id: 'int_1', display_name: 'Аэропорт Хитроу, Лондон, Великобритания', lat: '51.4700', lon: '-0.4543', type: 'place', importance: 0.8, postcode: 'TW6 1AP', aliases: ['heathrow airport', 'lhr'] },
  { place_id: 'int_2', display_name: 'Эйфелева башня, Париж, Франция', lat: '48.8584', lon: '2.2945', type: 'place', importance: 0.9, postcode: '75007', aliases: ['tour eiffel', 'eiffel tower', 'wieza eiffla'] },
  { place_id: 'int_3', display_name: 'Аэропорт Шарль-де-Голль, Париж, Франция', lat: '49.0097', lon: '2.5479', type: 'place', importance: 0.8, postcode: '95700', aliases: ['charles de gaulle airport', 'cdg'] },
  { place_id: 'int_4', display_name: 'Башня CN, Торонто, Канада', lat: '43.6426', lon: '-79.3871', type: 'place', importance: 0.8, postcode: 'M5V 2T6', aliases: ['cn tower toronto', 'wieza cn'] },
  { place_id: 'int_5', display_name: 'Аэропорт Нарита, Токио, Япония', lat: '35.7647', lon: '140.3864', type: 'place', importance: 0.8, postcode: '282-0004', aliases: ['narita airport', 'nrt'] },
  { place_id: 'int_6', display_name: 'Аэропорт Дубай, Дубай, ОАЭ', lat: '25.2532', lon: '55.3657', type: 'place', importance: 0.8, postcode: '00000', aliases: ['dubai airport', 'dxb'] },
  { place_id: 'int_7', display_name: 'Аэропорт Чанги, Сингапур', lat: '1.3644', lon: '103.9915', type: 'place', importance: 0.8, postcode: '819643', aliases: ['changi airport', 'sin'] },
  { place_id: 'int_8', display_name: 'Центральный вокзал, Берлин, Германия', lat: '52.5251', lon: '13.3694', type: 'place', importance: 0.8, postcode: '10557', aliases: ['berlin hauptbahnhof', 'berlin central station', 'dworzec centralny berlin'] },
  { place_id: 'int_9', display_name: 'Колизей, Рим, Италия', lat: '41.8902', lon: '12.4922', type: 'place', importance: 0.9, postcode: '00184', aliases: ['colosseum rome', 'colosseo', 'koloseum'] },
  { place_id: 'int_10', display_name: 'Саграда Фамилия, Барселона, Испания', lat: '41.4036', lon: '2.1744', type: 'place', importance: 0.9, postcode: '08013', aliases: ['sagrada familia', 'sagrada familia barcelona'] },
  { place_id: 'int_11', display_name: 'Аэропорт JFK, Нью-Йорк, США', lat: '40.6413', lon: '-73.7781', type: 'place', importance: 0.8, postcode: '11430', aliases: ['jfk airport', 'john f kennedy airport'] },
  { place_id: 'int_12', display_name: 'Сиднейский оперный театр, Сидней, Австралия', lat: '-33.8568', lon: '151.2153', type: 'place', importance: 0.9, postcode: '2000', aliases: ['sydney opera house'] },
  { place_id: 'int_13', display_name: 'Бурдж-Халифа, Дубай, ОАЭ', lat: '25.1972', lon: '55.2744', type: 'place', importance: 0.9, aliases: ['burj khalifa', 'burj khalifa dubai'] },
  { place_id: 'int_14', display_name: 'Биг-Бен, Лондон, Великобритания', lat: '51.4994', lon: '-0.1245', type: 'place', importance: 0.9, postcode: 'SW1A 0AA', aliases: ['big ben', 'big ben london'] },
  { place_id: 'int_15', display_name: 'Бранденбургские ворота, Берлин, Германия', lat: '52.5163', lon: '13.3777', type: 'place', importance: 0.9, postcode: '10117', aliases: ['brandenburg gate', 'brandenburger tor', 'brama brandenburska'] },
];

// ===== SEARCH LOGIC =====

function normalize(str: string): string {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0400-\u04ff\s]/gi, '')
    .trim();
}

function matchesQuery(item: GeocodingResult, queryWords: string[]): boolean {
  const haystack = normalize(item.display_name);
  // Check main display name
  const mainMatch = queryWords.every(w => haystack.includes(w));
  if (mainMatch) return true;
  // Check aliases
  if (item.aliases) {
    for (const alias of item.aliases) {
      const aliasNorm = normalize(alias);
      if (queryWords.every(w => aliasNorm.includes(w))) return true;
    }
  }
  return false;
}

function scoreResult(item: GeocodingResult, queryWords: string[]): number {
  let score = item.importance * 100;
  const haystack = normalize(item.display_name);
  // Bonus for exact word match at start
  for (const w of queryWords) {
    if (haystack.startsWith(w)) score += 50;
    else if (haystack.includes(' ' + w)) score += 30;
    else if (haystack.includes(w)) score += 10;
  }
  // Bonus for alias match
  if (item.aliases) {
    for (const alias of item.aliases) {
      const an = normalize(alias);
      for (const w of queryWords) {
        if (an.startsWith(w)) score += 40;
        else if (an.includes(w)) score += 20;
      }
    }
  }
  return score;
}

export function searchLocalAddresses(query: string): GeocodingResult[] {
  const raw = query.trim();
  if (raw.length < 2) return [];

  const queryWords = normalize(raw).split(/\s+/).filter(w => w.length >= 1);
  if (queryWords.length === 0) return [];

  const matches = LOCAL_ADDRESSES.filter(item => matchesQuery(item, queryWords));
  matches.sort((a, b) => scoreResult(b, queryWords) - scoreResult(a, queryWords));

  return matches;
}

// Haversine distance
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ===== PUBLIC API =====

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  // Always use local database — reliable, instant, works offline
  return searchLocalAddresses(query);
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  // Find nearest local address
  let nearest: GeocodingResult | null = null;
  let nearestDist = Infinity;
  for (const addr of LOCAL_ADDRESSES) {
    const d = getDistanceKm(lat, lng, parseFloat(addr.lat), parseFloat(addr.lon));
    if (d < nearestDist) {
      nearestDist = d;
      nearest = addr;
    }
  }
  if (nearest && nearestDist < 5) {
    return nearest.display_name;
  }
  // Fallback to coordinates string
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function autocompleteLocations(query: string, callback: (results: GeocodingResult[]) => void): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!query || query.trim().length < 2) { callback([]); return; }
  debounceTimer = setTimeout(async () => {
    const results = await searchLocations(query);
    callback(results);
  }, 250);
}

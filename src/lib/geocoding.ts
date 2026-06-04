export interface GeocodingResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  postcode?: string;
  aliases?: string[];
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

// ===== LOCAL ADDRESS DATABASE — 290 addresses, works 100% offline =====
const LOCAL_ADDRESSES: GeocodingResult[] = [
// --- MOSCOW (47) ---
  { place_id: 'mow_0', display_name: 'Красная площадь, Москва, Россия', lat: '55.7539', lon: '37.6208', type: 'place', importance: 0.7, postcode: '101000', aliases: ['krasnaya ploshchad', 'red square'] },
  { place_id: 'mow_1', display_name: 'Московский Кремль, Москва, Россия', lat: '55.7520', lon: '37.6175', type: 'place', importance: 0.7, postcode: '101000', aliases: ['kremlin'] },
  { place_id: 'mow_2', display_name: 'Аэропорт Шереметьево, Москва, Россия', lat: '55.9736', lon: '37.4125', type: 'place', importance: 0.7, postcode: '141400', aliases: ['sheremetyevo', 'svo'] },
  { place_id: 'mow_3', display_name: 'Аэропорт Домодедово, Москва, Россия', lat: '55.4103', lon: '37.9023', type: 'place', importance: 0.7, postcode: '142015', aliases: ['domodedovo', 'dme'] },
  { place_id: 'mow_4', display_name: 'Аэропорт Внуково, Москва, Россия', lat: '55.5915', lon: '37.2615', type: 'place', importance: 0.7, postcode: '119027', aliases: ['vnukovo', 'vko'] },
  { place_id: 'mow_5', display_name: 'Тверская улица, Москва, Россия', lat: '55.7582', lon: '37.6113', type: 'place', importance: 0.7, postcode: '125009', aliases: ['tverskaya'] },
  { place_id: 'mow_6', display_name: 'Арбат, Москва, Россия', lat: '55.7496', lon: '37.5911', type: 'place', importance: 0.7, postcode: '119019', aliases: ['arbat'] },
  { place_id: 'mow_7', display_name: 'Парк Горького, Москва, Россия', lat: '55.7314', lon: '37.6035', type: 'place', importance: 0.7, postcode: '119049', aliases: ['gorky park'] },
  { place_id: 'mow_8', display_name: 'ВДНХ, Москва, Россия', lat: '55.8261', lon: '37.6376', type: 'place', importance: 0.7, postcode: '129223', aliases: ['vdnh'] },
  { place_id: 'mow_9', display_name: 'Сокольники, Москва, Россия', lat: '55.7891', lon: '37.6797', type: 'place', importance: 0.7, postcode: '107014', aliases: ['sokolniki'] },
  { place_id: 'mow_10', display_name: 'Москва-Сити, Москва, Россия', lat: '55.7495', lon: '37.5373', type: 'place', importance: 0.7, postcode: '123317', aliases: ['moscow city'] },
  { place_id: 'mow_11', display_name: 'Киевский вокзал, Москва, Россия', lat: '55.7442', lon: '37.5813', type: 'place', importance: 0.7, postcode: '121059', aliases: ['kievsky vokzal'] },
  { place_id: 'mow_12', display_name: 'Лужники, Москва, Россия', lat: '55.7158', lon: '37.5536', type: 'place', importance: 0.7, postcode: '119048', aliases: ['luzhniki'] },
  { place_id: 'mow_13', display_name: 'Останкинская башня, Москва, Россия', lat: '55.8197', lon: '37.6119', type: 'place', importance: 0.7, postcode: '127427', aliases: ['ostankino'] },
  { place_id: 'mow_14', display_name: 'Театральная площадь, Москва, Россия', lat: '55.7607', lon: '37.6176', type: 'place', importance: 0.7, postcode: '109012', aliases: ['teatralnaya'] },
  { place_id: 'mow_15', display_name: 'Большой театр, Москва, Россия', lat: '55.7601', lon: '37.6186', type: 'place', importance: 0.7, postcode: '125009', aliases: ['bolshoi'] },
  { place_id: 'mow_16', display_name: 'Третьяковская галерея, Москва, Россия', lat: '55.7413', lon: '37.6208', type: 'place', importance: 0.7, postcode: '119017', aliases: ['tretyakov'] },
  { place_id: 'mow_17', display_name: 'Парк Зарядье, Москва, Россия', lat: '55.7513', lon: '37.6278', type: 'place', importance: 0.7, postcode: '109012', aliases: ['zaryadye'] },
  { place_id: 'mow_18', display_name: 'Стадион Спартак, Москва, Россия', lat: '55.8176', lon: '37.4404', type: 'place', importance: 0.7, postcode: '125252', aliases: ['spartak'] },
  { place_id: 'mow_19', display_name: 'Марьино, Москва, Россия', lat: '55.6500', lon: '37.7333', type: 'place', importance: 0.7, postcode: '109341', aliases: ['maryino'] },
  { place_id: 'mow_20', display_name: 'Бибирево, Москва, Россия', lat: '55.8833', lon: '37.6000', type: 'place', importance: 0.7, postcode: '127549', aliases: ['bibirevo'] },
  { place_id: 'mow_21', display_name: 'Медведково, Москва, Россия', lat: '55.8833', lon: '37.6667', type: 'place', importance: 0.7, postcode: '127282', aliases: ['medvedkovo'] },
  { place_id: 'mow_22', display_name: 'Чертаново, Москва, Россия', lat: '55.5833', lon: '37.6000', type: 'place', importance: 0.7, postcode: '117209', aliases: ['chertanovo'] },
  { place_id: 'mow_23', display_name: 'Ясенево, Москва, Россия', lat: '55.6000', lon: '37.5333', type: 'place', importance: 0.7, postcode: '117342', aliases: ['yasenevo'] },
  { place_id: 'mow_24', display_name: 'Теплый Стан, Москва, Россия', lat: '55.6167', lon: '37.5000', type: 'place', importance: 0.7, postcode: '117465', aliases: ['teply stan'] },
  { place_id: 'mow_25', display_name: 'Бутово, Москва, Россия', lat: '55.5500', lon: '37.5500', type: 'place', importance: 0.7, postcode: '142717', aliases: ['butovo'] },
  { place_id: 'mow_26', display_name: 'Щелково, Москва, Россия', lat: '55.9167', lon: '38.0000', type: 'place', importance: 0.7, postcode: '141100', aliases: ['shchyolkovo'] },
  { place_id: 'mow_27', display_name: 'Королёв, Москва, Россия', lat: '55.9167', lon: '37.8167', type: 'place', importance: 0.7, postcode: '141060', aliases: ['korolyov'] },
  { place_id: 'mow_28', display_name: 'Химки, Москва, Россия', lat: '55.9000', lon: '37.4333', type: 'place', importance: 0.7, postcode: '141400', aliases: ['khimki'] },
  { place_id: 'mow_29', display_name: 'Мытищи, Москва, Россия', lat: '55.9167', lon: '37.7333', type: 'place', importance: 0.7, postcode: '141006', aliases: ['mytishchi'] },
  { place_id: 'mow_30', display_name: 'Одинцово, Москва, Россия', lat: '55.6667', lon: '37.2667', type: 'place', importance: 0.7, postcode: '143000', aliases: ['odintsovo'] },
  { place_id: 'mow_31', display_name: 'Подольск, Москва, Россия', lat: '55.4333', lon: '37.5500', type: 'place', importance: 0.7, postcode: '142100', aliases: ['podolsk'] },
  { place_id: 'mow_32', display_name: 'Люберцы, Москва, Россия', lat: '55.6833', lon: '37.9000', type: 'place', importance: 0.7, postcode: '140000', aliases: ['lyubertsy'] },
  { place_id: 'mow_33', display_name: 'Балашиха, Москва, Россия', lat: '55.8000', lon: '37.9333', type: 'place', importance: 0.7, postcode: '143900', aliases: ['balashikha'] },
  { place_id: 'mow_34', display_name: 'Реутов, Москва, Россия', lat: '55.7667', lon: '37.8667', type: 'place', importance: 0.7, postcode: '143960', aliases: ['reutov'] },
  { place_id: 'mow_35', display_name: 'Красногорск, Москва, Россия', lat: '55.8167', lon: '37.3333', type: 'place', importance: 0.7, postcode: '143400', aliases: ['krasnogorsk'] },
  { place_id: 'mow_36', display_name: 'Волоколамск, Москва, Россия', lat: '56.0333', lon: '35.9667', type: 'place', importance: 0.7, postcode: '143600', aliases: ['volokolamsk'] },
  { place_id: 'mow_37', display_name: 'Можайск, Москва, Россия', lat: '55.5000', lon: '36.0167', type: 'place', importance: 0.7, postcode: '143200', aliases: ['mozhaisk'] },
  { place_id: 'mow_38', display_name: 'Нахабино, Москва, Россия', lat: '55.8333', lon: '37.1833', type: 'place', importance: 0.7, postcode: '143430', aliases: ['nahabino'] },
  { place_id: 'mow_39', display_name: 'Апрелевка, Москва, Россия', lat: '55.5333', lon: '37.0667', type: 'place', importance: 0.7, postcode: '143360', aliases: ['aprelevka'] },
  { place_id: 'mow_40', display_name: 'Наро-Фоминск, Москва, Россия', lat: '55.3833', lon: '36.7333', type: 'place', importance: 0.7, postcode: '143300', aliases: ['naro-fominsk'] },
  { place_id: 'mow_41', display_name: 'Серпухов, Москва, Россия', lat: '54.9167', lon: '37.4167', type: 'place', importance: 0.7, postcode: '142200', aliases: ['serpukhov'] },
  { place_id: 'mow_42', display_name: 'Чехов, Москва, Россия', lat: '55.1500', lon: '37.4667', type: 'place', importance: 0.7, postcode: '142300', aliases: ['chekhov'] },
  { place_id: 'mow_43', display_name: 'Железнодорожный, Москва, Россия', lat: '55.7500', lon: '38.0167', type: 'place', importance: 0.7, postcode: '143980', aliases: ['zheleznodorozhny'] },
  { place_id: 'mow_44', display_name: 'Долгопрудный, Москва, Россия', lat: '55.9333', lon: '37.5000', type: 'place', importance: 0.7, postcode: '141700', aliases: ['dolgoprudny'] },
  { place_id: 'mow_45', display_name: 'Зеленоград, Москва, Россия', lat: '55.9833', lon: '37.1833', type: 'place', importance: 0.7, postcode: '124365', aliases: ['zelenograd'] },
  { place_id: 'mow_46', display_name: 'Солнцево, Москва, Россия', lat: '55.6500', lon: '37.4000', type: 'place', importance: 0.7, postcode: '119620', aliases: ['solntsevo'] },
// --- ST. PETERSBURG (30) ---
  { place_id: 'spb_0', display_name: 'Дворцовая площадь, Санкт-Петербург, Россия', lat: '59.9390', lon: '30.3158', type: 'place', importance: 0.7, postcode: '191186', aliases: ['dvortsovaya'] },
  { place_id: 'spb_1', display_name: 'Исаакиевский собор, Санкт-Петербург, Россия', lat: '59.9341', lon: '30.3062', type: 'place', importance: 0.7, postcode: '190000', aliases: ['isaakievskiy'] },
  { place_id: 'spb_2', display_name: 'Эрмитаж, Санкт-Петербург, Россия', lat: '59.9398', lon: '30.3146', type: 'place', importance: 0.7, postcode: '190000', aliases: ['hermitage'] },
  { place_id: 'spb_3', display_name: 'Невский проспект, Санкт-Петербург, Россия', lat: '59.9343', lon: '30.3351', type: 'place', importance: 0.7, postcode: '191025', aliases: ['nevsky'] },
  { place_id: 'spb_4', display_name: 'Аэропорт Пулково, Санкт-Петербург, Россия', lat: '59.8003', lon: '30.2625', type: 'place', importance: 0.7, postcode: '196210', aliases: ['pulkovo'] },
  { place_id: 'spb_5', display_name: 'Московский вокзал, Санкт-Петербург, Россия', lat: '59.9302', lon: '30.3618', type: 'place', importance: 0.7, postcode: '191040', aliases: ['moskovsky vokzal'] },
  { place_id: 'spb_6', display_name: 'Казанский собор, Санкт-Петербург, Россия', lat: '59.9343', lon: '30.3245', type: 'place', importance: 0.7, postcode: '191186', aliases: ['kazansky'] },
  { place_id: 'spb_7', display_name: 'Храм Спаса на Крови, Санкт-Петербург, Россия', lat: '59.9400', lon: '30.3289', type: 'place', importance: 0.7, postcode: '191186', aliases: ['spas na krovi'] },
  { place_id: 'spb_8', display_name: 'Петергоф, Санкт-Петербург, Россия', lat: '59.8840', lon: '29.9056', type: 'place', importance: 0.7, postcode: '198516', aliases: ['peterhof'] },
  { place_id: 'spb_9', display_name: 'Царское Село, Санкт-Петербург, Россия', lat: '59.7167', lon: '30.4167', type: 'place', importance: 0.7, postcode: '196601', aliases: ['tsarskoye selo'] },
  { place_id: 'spb_10', display_name: 'Кронштадт, Санкт-Петербург, Россия', lat: '60.0000', lon: '29.7667', type: 'place', importance: 0.7, postcode: '197760', aliases: ['kronshtadt'] },
  { place_id: 'spb_11', display_name: 'Васильевский остров, Санкт-Петербург, Россия', lat: '59.9400', lon: '30.2900', type: 'place', importance: 0.7, postcode: '199034', aliases: ['vasilyevsky'] },
  { place_id: 'spb_12', display_name: 'Петропавловская крепость, Санкт-Петербург, Россия', lat: '59.9500', lon: '30.3167', type: 'place', importance: 0.7, postcode: '197046', aliases: ['petropavlovka'] },
  { place_id: 'spb_13', display_name: 'Мариинский театр, Санкт-Петербург, Россия', lat: '59.9258', lon: '30.2966', type: 'place', importance: 0.7, postcode: '190000', aliases: ['mariinsky'] },
  { place_id: 'spb_14', display_name: 'Стадион Газпром Арена, Санкт-Петербург, Россия', lat: '59.9730', lon: '30.2200', type: 'place', importance: 0.7, postcode: '197110', aliases: ['gazprom arena'] },
  { place_id: 'spb_15', display_name: 'Летний сад, Санкт-Петербург, Россия', lat: '59.9461', lon: '30.3364', type: 'place', importance: 0.7, postcode: '191186', aliases: ['letny sad'] },
  { place_id: 'spb_16', display_name: 'Финляндский вокзал, Санкт-Петербург, Россия', lat: '59.9553', lon: '30.3558', type: 'place', importance: 0.7, postcode: '194100', aliases: ['finlyandsky'] },
  { place_id: 'spb_17', display_name: 'Варшавский вокзал, Санкт-Петербург, Россия', lat: '59.9070', lon: '30.3580', type: 'place', importance: 0.7, postcode: '190020', aliases: ['varshavsky'] },
  { place_id: 'spb_18', display_name: 'Балтийский вокзал, Санкт-Петербург, Россия', lat: '59.9070', lon: '30.2950', type: 'place', importance: 0.7, postcode: '190103', aliases: ['baltiysky'] },
  { place_id: 'spb_19', display_name: 'Ладожский вокзал, Санкт-Петербург, Россия', lat: '59.9290', lon: '30.4400', type: 'place', importance: 0.7, postcode: '195213', aliases: ['ladozhsky'] },
  { place_id: 'spb_20', display_name: 'Всеволожск, Санкт-Петербург, Россия', lat: '60.0167', lon: '30.6500', type: 'place', importance: 0.7, postcode: '188640', aliases: ['vsevolozhsk'] },
  { place_id: 'spb_21', display_name: 'Колпино, Санкт-Петербург, Россия', lat: '59.7500', lon: '30.5833', type: 'place', importance: 0.7, postcode: '196650', aliases: ['kolpino'] },
  { place_id: 'spb_22', display_name: 'Пушкин, Санкт-Петербург, Россия', lat: '59.7167', lon: '30.4167', type: 'place', importance: 0.7, postcode: '196601', aliases: ['pushkin'] },
  { place_id: 'spb_23', display_name: 'Павловск, Санкт-Петербург, Россия', lat: '59.6833', lon: '30.4333', type: 'place', importance: 0.7, postcode: '196621', aliases: ['pavlovsk'] },
  { place_id: 'spb_24', display_name: 'Гатчина, Санкт-Петербург, Россия', lat: '59.5667', lon: '30.1333', type: 'place', importance: 0.7, postcode: '188300', aliases: ['gatchina'] },
  { place_id: 'spb_25', display_name: 'Выборг, Санкт-Петербург, Россия', lat: '60.7000', lon: '28.7333', type: 'place', importance: 0.7, postcode: '188800', aliases: ['vyborg'] },
  { place_id: 'spb_26', display_name: 'Сосновый Бор, Санкт-Петербург, Россия', lat: '59.9000', lon: '29.0833', type: 'place', importance: 0.7, postcode: '188540', aliases: ['sosnovy bor'] },
  { place_id: 'spb_27', display_name: 'Сертолово, Санкт-Петербург, Россия', lat: '60.1500', lon: '30.2167', type: 'place', importance: 0.7, postcode: '188650', aliases: ['sertolovo'] },
  { place_id: 'spb_28', display_name: 'Тихвин, Санкт-Петербург, Россия', lat: '59.6333', lon: '33.5000', type: 'place', importance: 0.7, postcode: '187550', aliases: ['tikhvin'] },
  { place_id: 'spb_29', display_name: 'Шлиссельбург, Санкт-Петербург, Россия', lat: '59.9500', lon: '31.0333', type: 'place', importance: 0.7, postcode: '187320', aliases: ['shlisselburg'] },
// --- WARSAW + POLAND (20) ---
  { place_id: 'war_0', display_name: 'Улица Плёвецкая, Варшава, Польша', lat: '52.2370', lon: '21.1230', type: 'place', importance: 0.7, postcode: '04-567', aliases: ['plowiecka', 'plowiecka street', 'plowiecka 1', 'plowiecka 10', 'plowiecka 100', 'plowiecka 2', 'plowiecka 60', 'plowiecka 111'] },
  { place_id: 'war_1', display_name: 'Замковая площадь, Варшава, Польша', lat: '52.2476', lon: '21.0142', type: 'place', importance: 0.7, postcode: '00-277', aliases: ['plac zamkowy', 'zamkowy'] },
  { place_id: 'war_2', display_name: 'Дворец культуры, Варшава, Польша', lat: '52.2318', lon: '21.0058', type: 'place', importance: 0.7, postcode: '00-901', aliases: ['palac kultury'] },
  { place_id: 'war_3', display_name: 'Аэропорт Шопена, Варшава, Польша', lat: '52.1657', lon: '20.9671', type: 'place', importance: 0.7, postcode: '02-143', aliases: ['chopin airport'] },
  { place_id: 'war_4', display_name: 'Национальный стадион, Варшава, Польша', lat: '52.2395', lon: '21.0456', type: 'place', importance: 0.7, postcode: '03-972', aliases: ['stadion narodowy'] },
  { place_id: 'war_5', display_name: 'Злоте Тарасы, Варшава, Польша', lat: '52.2303', lon: '21.0019', type: 'place', importance: 0.7, postcode: '00-906', aliases: ['zlote tarasy'] },
  { place_id: 'war_6', display_name: 'Лазенковский дворец, Варшава, Польша', lat: '52.2144', lon: '21.0354', type: 'place', importance: 0.7, postcode: '00-460', aliases: ['lazienki'] },
  { place_id: 'war_7', display_name: 'Улица Новый Свет, Варшава, Польша', lat: '52.2352', lon: '21.0190', type: 'place', importance: 0.7, postcode: '00-372', aliases: ['nowy swiat'] },
  { place_id: 'war_8', display_name: 'Мокотув, Варшава, Польша', lat: '52.1904', lon: '21.0038', type: 'place', importance: 0.7, postcode: '02-001', aliases: ['mokotow'] },
  { place_id: 'war_9', display_name: 'Виланув, Варшава, Польша', lat: '52.1658', lon: '21.0906', type: 'place', importance: 0.7, postcode: '02-958', aliases: ['wilanow'] },
  { place_id: 'war_10', display_name: 'Краков, Варшава, Польша', lat: '50.0647', lon: '19.9450', type: 'place', importance: 0.7, postcode: '30-001', aliases: ['krakow'] },
  { place_id: 'war_11', display_name: 'Вроцлав, Варшава, Польша', lat: '51.1079', lon: '17.0385', type: 'place', importance: 0.7, postcode: '50-001', aliases: ['wroclaw'] },
  { place_id: 'war_12', display_name: 'Гданьск, Варшава, Польша', lat: '54.3523', lon: '18.6491', type: 'place', importance: 0.7, postcode: '80-001', aliases: ['gdansk'] },
  { place_id: 'war_13', display_name: 'Лодзь, Варшава, Польша', lat: '51.7592', lon: '19.4560', type: 'place', importance: 0.7, postcode: '90-001', aliases: ['lodz'] },
  { place_id: 'war_14', display_name: 'Познань, Варшава, Польша', lat: '52.4064', lon: '16.9252', type: 'place', importance: 0.7, postcode: '60-001', aliases: ['poznan'] },
  { place_id: 'war_15', display_name: 'Катовице, Варшава, Польша', lat: '50.2649', lon: '19.0238', type: 'place', importance: 0.7, postcode: '40-001', aliases: ['katowice'] },
  { place_id: 'war_16', display_name: 'Щецин, Варшава, Польша', lat: '53.4285', lon: '14.5528', type: 'place', importance: 0.7, postcode: '70-001', aliases: ['szczecin'] },
  { place_id: 'war_17', display_name: 'Люблин, Варшава, Польша', lat: '51.2465', lon: '22.5684', type: 'place', importance: 0.7, postcode: '20-001', aliases: ['lublin'] },
  { place_id: 'war_18', display_name: 'Белосток, Варшава, Польша', lat: '53.1325', lon: '23.1688', type: 'place', importance: 0.7, postcode: '15-001', aliases: ['bialystok'] },
  { place_id: 'war_19', display_name: 'Сопот, Варшава, Польша', lat: '54.4416', lon: '18.5601', type: 'place', importance: 0.7, postcode: '81-001', aliases: ['sopot'] },
// --- KYIV (20) ---
  { place_id: 'kyv_0', display_name: 'Майдан Незалежности, Киев, Украина', lat: '50.4504', lon: '30.5245', type: 'place', importance: 0.7, postcode: '01001', aliases: ['maidan'] },
  { place_id: 'kyv_1', display_name: 'Софиевский собор, Киев, Украина', lat: '50.4531', lon: '30.5144', type: 'place', importance: 0.7, postcode: '01001', aliases: ['sofia'] },
  { place_id: 'kyv_2', display_name: 'Родина-мать, Киев, Украина', lat: '50.4266', lon: '30.5630', type: 'place', importance: 0.7, postcode: '01001', aliases: ['rodina mat'] },
  { place_id: 'kyv_3', display_name: 'Олимпийский стадион, Киев, Украина', lat: '50.4333', lon: '30.5217', type: 'place', importance: 0.7, postcode: '01001', aliases: ['olimpiyskiy'] },
  { place_id: 'kyv_4', display_name: 'Подол, Киев, Украина', lat: '50.4667', lon: '30.5167', type: 'place', importance: 0.7, postcode: '04070', aliases: ['podol'] },
  { place_id: 'kyv_5', display_name: 'Аэропорт Жуляны, Киев, Украина', lat: '50.4019', lon: '30.4497', type: 'place', importance: 0.7, postcode: '03058', aliases: ['zhulyany'] },
  { place_id: 'kyv_6', display_name: 'Андреевский спуск, Киев, Украина', lat: '50.4594', lon: '30.5179', type: 'place', importance: 0.7, postcode: '04070', aliases: ['andreevskiy'] },
  { place_id: 'kyv_7', display_name: 'Борисполь, Киев, Украина', lat: '50.3412', lon: '30.8898', type: 'place', importance: 0.7, postcode: '08300', aliases: ['borispol'] },
  { place_id: 'kyv_8', display_name: 'Оболонь, Киев, Украина', lat: '50.5050', lon: '30.4983', type: 'place', importance: 0.7, postcode: '04205', aliases: ['obolon'] },
  { place_id: 'kyv_9', display_name: 'Троещина, Киев, Украина', lat: '50.4833', lon: '30.6000', type: 'place', importance: 0.7, postcode: '02225', aliases: ['troeshchina'] },
  { place_id: 'kyv_10', display_name: 'Печерск, Киев, Украина', lat: '50.4167', lon: '30.5500', type: 'place', importance: 0.7, postcode: '01133', aliases: ['pechersk'] },
  { place_id: 'kyv_11', display_name: 'Шуляавка, Киев, Украина', lat: '50.4500', lon: '30.4667', type: 'place', importance: 0.7, postcode: '03057', aliases: ['shulyavka'] },
  { place_id: 'kyv_12', display_name: 'Теремки, Киев, Украина', lat: '50.3667', lon: '30.4667', type: 'place', importance: 0.7, postcode: '03057', aliases: ['teremky'] },
  { place_id: 'kyv_13', display_name: 'Бровары, Киев, Украина', lat: '50.5000', lon: '30.7833', type: 'place', importance: 0.7, postcode: '07400', aliases: ['brovary'] },
  { place_id: 'kyv_14', display_name: 'Ирпень, Киев, Украина', lat: '50.5167', lon: '30.2333', type: 'place', importance: 0.7, postcode: '08200', aliases: ['irpen'] },
  { place_id: 'kyv_15', display_name: 'Буча, Киев, Украина', lat: '50.5500', lon: '30.2167', type: 'place', importance: 0.7, postcode: '08292', aliases: ['bucha'] },
  { place_id: 'kyv_16', display_name: 'Вишгород, Киев, Украина', lat: '50.5833', lon: '30.5000', type: 'place', importance: 0.7, postcode: '07300', aliases: ['vyshgorod'] },
  { place_id: 'kyv_17', display_name: 'Боярка, Киев, Украина', lat: '50.3167', lon: '30.2833', type: 'place', importance: 0.7, postcode: '08150', aliases: ['boyarka'] },
  { place_id: 'kyv_18', display_name: 'Васильков, Киев, Украина', lat: '50.1833', lon: '30.3167', type: 'place', importance: 0.7, postcode: '08600', aliases: ['vasilkov'] },
  { place_id: 'kyv_19', display_name: 'Фастов, Киев, Украина', lat: '50.0833', lon: '29.9167', type: 'place', importance: 0.7, postcode: '08500', aliases: ['fastov'] },
// --- MINSK + BELARUS (20) ---
  { place_id: 'msk_0', display_name: 'Площадь Независимости, Минск, Беларусь', lat: '53.8958', lon: '27.5478', type: 'place', importance: 0.7, postcode: '220030', aliases: ['nezalezhnastsi'] },
  { place_id: 'msk_1', display_name: 'Площадь Победы, Минск, Беларусь', lat: '53.9081', lon: '27.5742', type: 'place', importance: 0.7, postcode: '220004', aliases: ['peramohi'] },
  { place_id: 'msk_2', display_name: 'Национальная библиотека, Минск, Беларусь', lat: '53.9216', lon: '27.6589', type: 'place', importance: 0.7, postcode: '220114', aliases: ['national library'] },
  { place_id: 'msk_3', display_name: 'Национальный аэропорт, Минск, Беларусь', lat: '53.8885', lon: '28.0445', type: 'place', importance: 0.7, postcode: '220054', aliases: ['minsk airport'] },
  { place_id: 'msk_4', display_name: 'Улица Немига, Минск, Беларусь', lat: '53.9059', lon: '27.5545', type: 'place', importance: 0.7, postcode: '220004', aliases: ['nemiga'] },
  { place_id: 'msk_5', display_name: 'Троицкое предместье, Минск, Беларусь', lat: '53.9083', lon: '27.5563', type: 'place', importance: 0.7, postcode: '220004', aliases: ['troitskaye'] },
  { place_id: 'msk_6', display_name: 'Стадион Динамо, Минск, Беларусь', lat: '53.8956', lon: '27.5605', type: 'place', importance: 0.7, postcode: '220004', aliases: ['dinamo stadium'] },
  { place_id: 'msk_7', display_name: 'Дворец Республики, Минск, Беларусь', lat: '53.9028', lon: '27.5613', type: 'place', importance: 0.7, postcode: '220030', aliases: ['palace of republic'] },
  { place_id: 'msk_8', display_name: 'Комаровский рынок, Минск, Беларусь', lat: '53.8892', lon: '27.5386', type: 'place', importance: 0.7, postcode: '220004', aliases: ['komarovsky'] },
  { place_id: 'msk_9', display_name: 'ТЦ Замок, Минск, Беларусь', lat: '53.9288', lon: '27.5826', type: 'place', importance: 0.7, postcode: '220004', aliases: ['zamok'] },
  { place_id: 'msk_10', display_name: 'Могилёв, Минск, Беларусь', lat: '53.9167', lon: '30.3500', type: 'place', importance: 0.7, postcode: '212000', aliases: ['mogilev'] },
  { place_id: 'msk_11', display_name: 'Гомель, Минск, Беларусь', lat: '52.4453', lon: '31.0142', type: 'place', importance: 0.7, postcode: '246000', aliases: ['gomel'] },
  { place_id: 'msk_12', display_name: 'Витебск, Минск, Беларусь', lat: '55.1833', lon: '30.1667', type: 'place', importance: 0.7, postcode: '210000', aliases: ['vitebsk'] },
  { place_id: 'msk_13', display_name: 'Гродно, Минск, Беларусь', lat: '53.6833', lon: '23.8333', type: 'place', importance: 0.7, postcode: '230000', aliases: ['grodno'] },
  { place_id: 'msk_14', display_name: 'Брест, Минск, Беларусь', lat: '52.1000', lon: '23.7000', type: 'place', importance: 0.7, postcode: '224000', aliases: ['brest'] },
  { place_id: 'msk_15', display_name: 'Бобруйск, Минск, Беларусь', lat: '53.1333', lon: '29.2333', type: 'place', importance: 0.7, postcode: '213800', aliases: ['bobruisk'] },
  { place_id: 'msk_16', display_name: 'Барановичи, Минск, Беларусь', lat: '53.1333', lon: '26.0333', type: 'place', importance: 0.7, postcode: '225300', aliases: ['baranovichi'] },
  { place_id: 'msk_17', display_name: 'Пинск, Минск, Беларусь', lat: '52.1167', lon: '26.0833', type: 'place', importance: 0.7, postcode: '225700', aliases: ['pinsk'] },
  { place_id: 'msk_18', display_name: 'Орша, Минск, Беларусь', lat: '54.5167', lon: '30.4167', type: 'place', importance: 0.7, postcode: '211000', aliases: ['orsha'] },
  { place_id: 'msk_19', display_name: 'Молодечно, Минск, Беларусь', lat: '54.3167', lon: '26.8500', type: 'place', importance: 0.7, postcode: '222300', aliases: ['molodechno'] },
// --- ALMATY + KAZAKHSTAN (20) ---
  { place_id: 'alm_0', display_name: 'Площадь Республики, Алматы, Казахстан', lat: '43.2380', lon: '76.9459', type: 'place', importance: 0.7, postcode: '050000', aliases: ['respubliki'] },
  { place_id: 'alm_1', display_name: 'Вознесенский собор, Алматы, Казахстан', lat: '43.2581', lon: '76.9530', type: 'place', importance: 0.7, postcode: '050000', aliases: ['voznesensky'] },
  { place_id: 'alm_2', display_name: 'Кок-Тобе, Алматы, Казахстан', lat: '43.2346', lon: '76.9783', type: 'place', importance: 0.7, postcode: '050000', aliases: ['kok tobe'] },
  { place_id: 'alm_3', display_name: 'Аэропорт Алматы, Алматы, Казахстан', lat: '43.3521', lon: '77.0405', type: 'place', importance: 0.7, postcode: '050039', aliases: ['almaty airport'] },
  { place_id: 'alm_4', display_name: 'Каток Медеу, Алматы, Казахстан', lat: '43.2098', lon: '77.0861', type: 'place', importance: 0.7, postcode: '050020', aliases: ['medeu'] },
  { place_id: 'alm_5', display_name: 'Шымбулак, Алматы, Казахстан', lat: '43.1283', lon: '77.0810', type: 'place', importance: 0.7, postcode: '050020', aliases: ['shymbulak'] },
  { place_id: 'alm_6', display_name: 'Достык Плаза, Алматы, Казахстан', lat: '43.2408', lon: '76.9189', type: 'place', importance: 0.7, postcode: '050000', aliases: ['dostyk'] },
  { place_id: 'alm_7', display_name: 'Парк Первого Президента, Алматы, Казахстан', lat: '43.2267', lon: '76.9225', type: 'place', importance: 0.7, postcode: '050000', aliases: ['first president'] },
  { place_id: 'alm_8', display_name: 'Нур-Султан, Байтерек, Казахстан', lat: '51.1284', lon: '71.4306', type: 'place', importance: 0.7, postcode: '010000', aliases: ['bayterek'] },
  { place_id: 'alm_9', display_name: 'Нур-Султан, Хан Шатыр, Казахстан', lat: '51.1333', lon: '71.4167', type: 'place', importance: 0.7, postcode: '010000', aliases: ['khan shatyr'] },
  { place_id: 'alm_10', display_name: 'Шымкент, Алматы, Казахстан', lat: '42.3000', lon: '69.6000', type: 'place', importance: 0.7, postcode: '160000', aliases: ['shymkent'] },
  { place_id: 'alm_11', display_name: 'Караганда, Алматы, Казахстан', lat: '49.8000', lon: '73.1167', type: 'place', importance: 0.7, postcode: '100000', aliases: ['karaganda'] },
  { place_id: 'alm_12', display_name: 'Актобе, Алматы, Казахстан', lat: '50.2833', lon: '57.1667', type: 'place', importance: 0.7, postcode: '030000', aliases: ['aktobe'] },
  { place_id: 'alm_13', display_name: 'Павлодар, Алматы, Казахстан', lat: '52.3000', lon: '76.9500', type: 'place', importance: 0.7, postcode: '140000', aliases: ['pavlodar'] },
  { place_id: 'alm_14', display_name: 'Усть-Каменогорск, Алматы, Казахстан', lat: '49.9500', lon: '82.6167', type: 'place', importance: 0.7, postcode: '070000', aliases: ['oskemen'] },
  { place_id: 'alm_15', display_name: 'Семей, Алматы, Казахстан', lat: '50.4000', lon: '80.2333', type: 'place', importance: 0.7, postcode: '070000', aliases: ['semey'] },
  { place_id: 'alm_16', display_name: 'Атырау, Алматы, Казахстан', lat: '47.1167', lon: '51.8833', type: 'place', importance: 0.7, postcode: '060000', aliases: ['atyrau'] },
  { place_id: 'alm_17', display_name: 'Костанай, Алматы, Казахстан', lat: '53.2000', lon: '63.5500', type: 'place', importance: 0.7, postcode: '110000', aliases: ['kostanay'] },
  { place_id: 'alm_18', display_name: 'Кызылорда, Алматы, Казахстан', lat: '44.8500', lon: '65.5167', type: 'place', importance: 0.7, postcode: '120000', aliases: ['kyzylorda'] },
  { place_id: 'alm_19', display_name: 'Тараз, Алматы, Казахстан', lat: '42.9000', lon: '71.3667', type: 'place', importance: 0.7, postcode: '080000', aliases: ['taraz'] },
// --- EUROPE MAJOR (50) ---
  { place_id: 'eur_0', display_name: 'Аэропорт Хитроу, Лондон, Великобритания', lat: '51.4700', lon: '-0.4543', type: 'place', importance: 0.7, postcode: 'TW6 1AP', aliases: ['heathrow'] },
  { place_id: 'eur_1', display_name: 'Биг-Бен, Лондон, Великобритания', lat: '51.4994', lon: '-0.1245', type: 'place', importance: 0.7, postcode: 'SW1A 0AA', aliases: ['big ben'] },
  { place_id: 'eur_2', display_name: 'Трафальгарская площадь, Лондон, Великобритания', lat: '51.5080', lon: '-0.1281', type: 'place', importance: 0.7, postcode: 'WC2N 5DN', aliases: ['trafalgar'] },
  { place_id: 'eur_3', display_name: 'Тауэр, Лондон, Великобритания', lat: '51.5081', lon: '-0.0759', type: 'place', importance: 0.7, postcode: 'EC3N 4AB', aliases: ['tower'] },
  { place_id: 'eur_4', display_name: 'Букингемский дворец, Лондон, Великобритания', lat: '51.5014', lon: '-0.1419', type: 'place', importance: 0.7, postcode: 'SW1A 1AA', aliases: ['buckingham'] },
  { place_id: 'eur_5', display_name: 'Вестминстер, Лондон, Великобритания', lat: '51.4993', lon: '-0.1273', type: 'place', importance: 0.7, postcode: 'SW1A 0AA', aliases: ['westminster'] },
  { place_id: 'eur_6', display_name: 'Аэропорт Гатвик, Лондон, Великобритания', lat: '51.1537', lon: '-0.1821', type: 'place', importance: 0.7, postcode: 'RH6 0NP', aliases: ['gatwick'] },
  { place_id: 'eur_7', display_name: 'Эйфелева башня, Париж, Франция', lat: '48.8584', lon: '2.2945', type: 'place', importance: 0.7, postcode: '75007', aliases: ['eiffel'] },
  { place_id: 'eur_8', display_name: 'Аэропорт Шарль-де-Голль, Париж, Франция', lat: '49.0097', lon: '2.5479', type: 'place', importance: 0.7, postcode: '95700', aliases: ['charles de gaulle'] },
  { place_id: 'eur_9', display_name: 'Лувр, Париж, Франция', lat: '48.8606', lon: '2.3376', type: 'place', importance: 0.7, postcode: '75001', aliases: ['louvre'] },
  { place_id: 'eur_10', display_name: 'Триумфальная арка, Париж, Франция', lat: '48.8738', lon: '2.2950', type: 'place', importance: 0.7, postcode: '75008', aliases: ['arc de triomphe'] },
  { place_id: 'eur_11', display_name: 'Нотр-Дам, Париж, Франция', lat: '48.8530', lon: '2.3499', type: 'place', importance: 0.7, postcode: '75004', aliases: ['notre dame'] },
  { place_id: 'eur_12', display_name: 'Монмартр, Париж, Франция', lat: '48.8867', lon: '2.3431', type: 'place', importance: 0.7, postcode: '75018', aliases: ['montmartre'] },
  { place_id: 'eur_13', display_name: 'Бранденбургские ворота, Берлин, Германия', lat: '52.5163', lon: '13.3777', type: 'place', importance: 0.7, postcode: '10117', aliases: ['brandenburg'] },
  { place_id: 'eur_14', display_name: 'Центральный вокзал, Берлин, Германия', lat: '52.5251', lon: '13.3694', type: 'place', importance: 0.7, postcode: '10557', aliases: ['hauptbahnhof'] },
  { place_id: 'eur_15', display_name: 'Александрплатц, Берлин, Германия', lat: '52.5219', lon: '13.4132', type: 'place', importance: 0.7, postcode: '10178', aliases: ['alexanderplatz'] },
  { place_id: 'eur_16', display_name: 'Рейхстаг, Берлин, Германия', lat: '52.5186', lon: '13.3761', type: 'place', importance: 0.7, postcode: '11011', aliases: ['reichstag'] },
  { place_id: 'eur_17', display_name: 'Колизей, Рим, Италия', lat: '41.8902', lon: '12.4922', type: 'place', importance: 0.7, postcode: '00184', aliases: ['colosseum'] },
  { place_id: 'eur_18', display_name: 'Ватикан, Рим, Италия', lat: '41.9029', lon: '12.4534', type: 'place', importance: 0.7, postcode: '00120', aliases: ['vatican'] },
  { place_id: 'eur_19', display_name: 'Треви, Рим, Италия', lat: '41.9009', lon: '12.4833', type: 'place', importance: 0.7, postcode: '00187', aliases: ['trevi'] },
  { place_id: 'eur_20', display_name: 'Пантеон, Рим, Италия', lat: '41.8986', lon: '12.4768', type: 'place', importance: 0.7, postcode: '00186', aliases: ['pantheon'] },
  { place_id: 'eur_21', display_name: 'Саграда Фамилия, Барселона, Испания', lat: '41.4036', lon: '2.1744', type: 'place', importance: 0.7, postcode: '08013', aliases: ['sagrada familia'] },
  { place_id: 'eur_22', display_name: 'Парк Гуэль, Барселона, Испания', lat: '41.4145', lon: '2.1527', type: 'place', importance: 0.7, postcode: '08024', aliases: ['park guell'] },
  { place_id: 'eur_23', display_name: 'Ла Рамбла, Барселона, Испания', lat: '41.3808', lon: '2.1228', type: 'place', importance: 0.7, postcode: '08002', aliases: ['las ramblas'] },
  { place_id: 'eur_24', display_name: 'Айя-София, Стамбул, Турция', lat: '41.0086', lon: '28.9802', type: 'place', importance: 0.7, postcode: '34122', aliases: ['hagia sophia'] },
  { place_id: 'eur_25', display_name: 'Голубая мечеть, Стамбул, Турция', lat: '41.0054', lon: '28.9768', type: 'place', importance: 0.7, postcode: '34122', aliases: ['blue mosque'] },
  { place_id: 'eur_26', display_name: 'Гранд-базар, Стамбул, Турция', lat: '41.0107', lon: '28.9681', type: 'place', importance: 0.7, postcode: '34126', aliases: ['grand bazaar'] },
  { place_id: 'eur_27', display_name: 'Тaksim, Стамбул, Турция', lat: '41.0369', lon: '28.9857', type: 'place', importance: 0.7, postcode: '34435', aliases: ['taksim'] },
  { place_id: 'eur_28', display_name: 'Староместская площадь, Прага, Чехия', lat: '50.0875', lon: '14.4213', type: 'place', importance: 0.7, postcode: '110 00', aliases: ['old town square'] },
  { place_id: 'eur_29', display_name: 'Карлов мост, Прага, Чехия', lat: '50.0865', lon: '14.4116', type: 'place', importance: 0.7, postcode: '110 00', aliases: ['charles bridge'] },
  { place_id: 'eur_30', display_name: 'Пражский Град, Прага, Чехия', lat: '50.0911', lon: '14.4016', type: 'place', importance: 0.7, postcode: '119 08', aliases: ['prague castle'] },
  { place_id: 'eur_31', display_name: 'Штефансдом, Вена, Австрия', lat: '48.2085', lon: '16.3721', type: 'place', importance: 0.7, postcode: '1010', aliases: ['stephansdom'] },
  { place_id: 'eur_32', display_name: 'Шёнбрунн, Вена, Австрия', lat: '48.1845', lon: '16.3119', type: 'place', importance: 0.7, postcode: '1130', aliases: ['schonbrunn'] },
  { place_id: 'eur_33', display_name: 'Дам-площадь, Амстердам, Нидерланды', lat: '52.3731', lon: '4.8922', type: 'place', importance: 0.7, postcode: '1012', aliases: ['dam square'] },
  { place_id: 'eur_34', display_name: 'Музей Анны Франк, Амстердам, Нидерланды', lat: '52.3752', lon: '4.8839', type: 'place', importance: 0.7, postcode: '1016', aliases: ['anne frank'] },
  { place_id: 'eur_35', display_name: 'Пласа-Майор, Мадрид, Испания', lat: '40.4155', lon: '-3.7074', type: 'place', importance: 0.7, postcode: '28012', aliases: ['plaza mayor'] },
  { place_id: 'eur_36', display_name: 'Прадо, Мадрид, Испания', lat: '40.4138', lon: '-3.6921', type: 'place', importance: 0.7, postcode: '28014', aliases: ['prado'] },
  { place_id: 'eur_37', display_name: 'Парламент, Будапешт, Венгрия', lat: '47.5074', lon: '19.0463', type: 'place', importance: 0.7, postcode: '1055', aliases: ['parliament'] },
  { place_id: 'eur_38', display_name: 'Цепной мост, Будапешт, Венгрия', lat: '47.4990', lon: '19.0438', type: 'place', importance: 0.7, postcode: '1011', aliases: ['chain bridge'] },
  { place_id: 'eur_39', display_name: 'Акрополь, Афины, Греция', lat: '37.9715', lon: '23.7257', type: 'place', importance: 0.7, postcode: '105 58', aliases: ['acropolis'] },
  { place_id: 'eur_40', display_name: 'Старый город, Стокгольм, Швеция', lat: '59.3251', lon: '18.0711', type: 'place', importance: 0.7, postcode: '111 29', aliases: ['gamla stan'] },
  { place_id: 'eur_41', display_name: 'Королевский дворец, Стокгольм, Швеция', lat: '59.3268', lon: '18.0717', type: 'place', importance: 0.7, postcode: '111 30', aliases: ['royal palace'] },
  { place_id: 'eur_42', display_name: 'Нюхавн, Копенгаген, Дания', lat: '55.6761', lon: '12.5683', type: 'place', importance: 0.7, postcode: '1218', aliases: ['nyhavn'] },
  { place_id: 'eur_43', display_name: 'Сенатская площадь, Хельсинки, Финляндия', lat: '60.1699', lon: '24.9534', type: 'place', importance: 0.7, postcode: '00170', aliases: ['senate square'] },
  { place_id: 'eur_44', display_name: 'Тринити-колледж, Дублин, Ирландия', lat: '53.3438', lon: '-6.2546', type: 'place', importance: 0.7, postcode: 'D02 PQ63', aliases: ['trinity college'] },
  { place_id: 'eur_45', display_name: 'Торриш-де-Белен, Лиссабон, Португалия', lat: '38.6916', lon: '-9.2160', type: 'place', importance: 0.7, postcode: '1400-038', aliases: ['belem tower'] },
  { place_id: 'eur_46', display_name: 'Мариенплатц, Мюнхен, Германия', lat: '48.1374', lon: '11.5755', type: 'place', importance: 0.7, postcode: '80331', aliases: ['marienplatz'] },
  { place_id: 'eur_47', display_name: 'Дуомо, Милан, Италия', lat: '45.4642', lon: '9.1900', type: 'place', importance: 0.7, postcode: '20121', aliases: ['duomo'] },
  { place_id: 'eur_48', display_name: 'Цюрих, Центральная площадь, Швейцария', lat: '47.3769', lon: '8.5417', type: 'place', importance: 0.7, postcode: '8001', aliases: ['zurich'] },
  { place_id: 'eur_49', display_name: 'Женева, Фонтан, Швейцария', lat: '46.2044', lon: '6.1432', type: 'place', importance: 0.7, postcode: '1204', aliases: ['jet d\'eau'] },
// --- ASIA (30) ---
  { place_id: 'asia_0', display_name: 'Сибуя, Токио, Япония', lat: '35.6595', lon: '139.7004', type: 'place', importance: 0.7, postcode: '150-0001', aliases: ['shibuya'] },
  { place_id: 'asia_1', display_name: 'Акихабара, Токио, Япония', lat: '35.6984', lon: '139.7730', type: 'place', importance: 0.7, postcode: '101-0021', aliases: ['akihabara'] },
  { place_id: 'asia_2', display_name: 'Сенсо-дзи, Токио, Япония', lat: '35.7148', lon: '139.7967', type: 'place', importance: 0.7, postcode: '111-0032', aliases: ['sensoji'] },
  { place_id: 'asia_3', display_name: 'Аэропорт Нарита, Токио, Япония', lat: '35.7647', lon: '140.3864', type: 'place', importance: 0.7, postcode: '282-0004', aliases: ['narita'] },
  { place_id: 'asia_4', display_name: 'Аэропорт Ханеда, Токио, Япония', lat: '35.5494', lon: '139.7798', type: 'place', importance: 0.7, postcode: '144-0041', aliases: ['haneda'] },
  { place_id: 'asia_5', display_name: 'Кванхакмун, Сеул, Южная Корея', lat: '37.5700', lon: '126.9769', type: 'place', importance: 0.7, postcode: '03177', aliases: ['gwanghwamun'] },
  { place_id: 'asia_6', display_name: 'Мёндон, Сеул, Южная Корея', lat: '37.5635', lon: '126.9850', type: 'place', importance: 0.7, postcode: '04536', aliases: ['myeongdong'] },
  { place_id: 'asia_7', display_name: 'Тондэмун, Сеул, Южная Корея', lat: '37.5663', lon: '127.0095', type: 'place', importance: 0.7, postcode: '04562', aliases: ['dongdaemun'] },
  { place_id: 'asia_8', display_name: 'Большой дворец, Бангкок, Таиланд', lat: '13.7501', lon: '100.4922', type: 'place', importance: 0.7, postcode: '10200', aliases: ['grand palace'] },
  { place_id: 'asia_9', display_name: 'Ват Арун, Бангкок, Таиланд', lat: '13.7437', lon: '100.4886', type: 'place', importance: 0.7, postcode: '10600', aliases: ['wat arun'] },
  { place_id: 'asia_10', display_name: 'Каосан, Бангкок, Таиланд', lat: '13.7589', lon: '100.4974', type: 'place', importance: 0.7, postcode: '10200', aliases: ['khaosan'] },
  { place_id: 'asia_11', display_name: 'Марина-Бэй, Сингапур', lat: '1.2834', lon: '103.8607', type: 'place', importance: 0.7, postcode: '018956', aliases: ['marina bay'] },
  { place_id: 'asia_12', display_name: 'Сентоза, Сингапур', lat: '1.2494', lon: '103.8303', type: 'place', importance: 0.7, postcode: '098830', aliases: ['sentosa'] },
  { place_id: 'asia_13', display_name: 'Аэропорт Чанги, Сингапур', lat: '1.3644', lon: '103.9915', type: 'place', importance: 0.7, postcode: '819643', aliases: ['changi'] },
  { place_id: 'asia_14', display_name: 'Бурдж-Халифа, Дубай, ОАЭ', lat: '25.1972', lon: '55.2744', type: 'place', importance: 0.7, postcode: '00000', aliases: ['burj khalifa'] },
  { place_id: 'asia_15', display_name: 'Аэропорт Дубай, Дубай, ОАЭ', lat: '25.2532', lon: '55.3657', type: 'place', importance: 0.7, postcode: '00000', aliases: ['dubai airport'] },
  { place_id: 'asia_16', display_name: 'Пальма Джумейра, Дубай, ОАЭ', lat: '25.1172', lon: '55.1383', type: 'place', importance: 0.7, postcode: '00000', aliases: ['palm jumeirah'] },
  { place_id: 'asia_17', display_name: 'Дубай-Молл, Дубай, ОАЭ', lat: '25.1972', lon: '55.2792', type: 'place', importance: 0.7, postcode: '00000', aliases: ['dubai mall'] },
  { place_id: 'asia_18', display_name: 'Ворота Индии, Мумбаи, Индия', lat: '18.9220', lon: '72.8347', type: 'place', importance: 0.7, postcode: '400001', aliases: ['gateway of india'] },
  { place_id: 'asia_19', display_name: 'Красный форт, Дели, Индия', lat: '28.6562', lon: '77.2410', type: 'place', importance: 0.7, postcode: '110006', aliases: ['red fort'] },
  { place_id: 'asia_20', display_name: 'Хумаюн, Дели, Индия', lat: '28.5933', lon: '77.2507', type: 'place', importance: 0.7, postcode: '110013', aliases: ['humayun tomb'] },
  { place_id: 'asia_21', display_name: 'Запретный город, Пекин, Китай', lat: '39.9163', lon: '116.3972', type: 'place', importance: 0.7, postcode: '100006', aliases: ['forbidden city'] },
  { place_id: 'asia_22', display_name: 'Тяньаньмэнь, Пекин, Китай', lat: '39.9055', lon: '116.3976', type: 'place', importance: 0.7, postcode: '100006', aliases: ['tiananmen'] },
  { place_id: 'asia_23', display_name: 'Великая стена, Бадалин, Китай', lat: '40.3590', lon: '116.0200', type: 'place', importance: 0.7, postcode: '102102', aliases: ['great wall'] },
  { place_id: 'asia_24', display_name: 'Набережная, Шанхай, Китай', lat: '31.2304', lon: '121.4737', type: 'place', importance: 0.7, postcode: '200002', aliases: ['the bund'] },
  { place_id: 'asia_25', display_name: 'ТВ-башня, Шанхай, Китай', lat: '31.2397', lon: '121.4998', type: 'place', importance: 0.7, postcode: '200120', aliases: ['oriental pearl'] },
  { place_id: 'asia_26', display_name: 'Виктория-Пик, Гонконг', lat: '22.2754', lon: '114.1455', type: 'place', importance: 0.7, postcode: '00000', aliases: ['victoria peak'] },
  { place_id: 'asia_27', display_name: 'Петронас, Куала-Лумпур, Малайзия', lat: '3.1579', lon: '101.7116', type: 'place', importance: 0.7, postcode: '50088', aliases: ['petronas'] },
  { place_id: 'asia_28', display_name: 'Монас, Джакарта, Индонезия', lat: '-6.1754', lon: '106.8272', type: 'place', importance: 0.7, postcode: '10110', aliases: ['monas'] },
  { place_id: 'asia_29', display_name: 'Интрамурос, Манила, Филиппины', lat: '14.5896', lon: '120.9749', type: 'place', importance: 0.7, postcode: '1002', aliases: ['intramuros'] },
// --- AMERICAS (31) ---
  { place_id: 'amer_0', display_name: 'Times Square, Нью-Йорк, США', lat: '40.7580', lon: '-73.9855', type: 'place', importance: 0.7, postcode: '10036', aliases: ['times square'] },
  { place_id: 'amer_1', display_name: 'Центральный парк, Нью-Йорк, США', lat: '40.7851', lon: '-73.9683', type: 'place', importance: 0.7, postcode: '10024', aliases: ['central park'] },
  { place_id: 'amer_2', display_name: 'Статуя Свободы, Нью-Йорк, США', lat: '40.6892', lon: '-74.0445', type: 'place', importance: 0.7, postcode: '10004', aliases: ['statue of liberty'] },
  { place_id: 'amer_3', display_name: 'Аэропорт JFK, Нью-Йорк, США', lat: '40.6413', lon: '-73.7781', type: 'place', importance: 0.7, postcode: '11430', aliases: ['jfk'] },
  { place_id: 'amer_4', display_name: 'Аэропорт Newark, Нью-Йорк, США', lat: '40.6895', lon: '-74.1745', type: 'place', importance: 0.7, postcode: '07114', aliases: ['newark'] },
  { place_id: 'amer_5', display_name: 'Голливуд, Лос-Анджелес, США', lat: '34.0928', lon: '-118.3287', type: 'place', importance: 0.7, postcode: '90028', aliases: ['hollywood'] },
  { place_id: 'amer_6', display_name: 'Санта-Моника, Лос-Анджелес, США', lat: '34.0195', lon: '-118.4912', type: 'place', importance: 0.7, postcode: '90401', aliases: ['santa monica'] },
  { place_id: 'amer_7', display_name: 'LAX, Лос-Анджелес, США', lat: '33.9416', lon: '-118.4085', type: 'place', importance: 0.7, postcode: '90045', aliases: ['lax'] },
  { place_id: 'amer_8', display_name: 'Golden Gate, Сан-Франциско, США', lat: '37.8199', lon: '-122.4783', type: 'place', importance: 0.7, postcode: '94129', aliases: ['golden gate'] },
  { place_id: 'amer_9', display_name: 'Пир 39, Сан-Франциско, США', lat: '37.8087', lon: '-122.4098', type: 'place', importance: 0.7, postcode: '94133', aliases: ['pier 39'] },
  { place_id: 'amer_10', display_name: 'Миллениум-парк, Чикаго, США', lat: '41.8826', lon: '-87.6226', type: 'place', importance: 0.7, postcode: '60601', aliases: ['millennium park'] },
  { place_id: 'amer_11', display_name: 'Уиллис-тауэр, Чикаго, США', lat: '41.8789', lon: '-87.6359', type: 'place', importance: 0.7, postcode: '60606', aliases: ['willis tower'] },
  { place_id: 'amer_12', display_name: 'Саус-Бич, Майами, США', lat: '25.7907', lon: '-80.1300', type: 'place', importance: 0.7, postcode: '33139', aliases: ['south beach'] },
  { place_id: 'amer_13', display_name: 'CN Tower, Торонто, Канада', lat: '43.6426', lon: '-79.3871', type: 'place', importance: 0.7, postcode: 'M5V 2T6', aliases: ['cn tower'] },
  { place_id: 'amer_14', display_name: 'Ниагара, Торонто, Канада', lat: '43.0896', lon: '-79.0849', type: 'place', importance: 0.7, postcode: 'L2E 6T2', aliases: ['niagara falls'] },
  { place_id: 'amer_15', display_name: 'Стэнли-парк, Ванкувер, Канада', lat: '49.3043', lon: '-123.1443', type: 'place', importance: 0.7, postcode: 'V6G 3E2', aliases: ['stanley park'] },
  { place_id: 'amer_16', display_name: 'Сокало, Мехико, Мексика', lat: '19.4326', lon: '-99.1332', type: 'place', importance: 0.7, postcode: '06000', aliases: ['zocalo'] },
  { place_id: 'amer_17', display_name: 'Фрида-Кало, Мехико, Мексика', lat: '19.3553', lon: '-99.1623', type: 'place', importance: 0.7, postcode: '04100', aliases: ['frida kahlo'] },
  { place_id: 'amer_18', display_name: 'Авенида-Паулиста, Сан-Паулу, Бразилия', lat: '-23.5617', lon: '-46.6560', type: 'place', importance: 0.7, postcode: '01310-000', aliases: ['paulista'] },
  { place_id: 'amer_19', display_name: 'Копакабана, Рио-де-Жанейро, Бразилия', lat: '-22.9719', lon: '-43.1850', type: 'place', importance: 0.7, postcode: '22070-011', aliases: ['copacabana'] },
  { place_id: 'amer_20', display_name: 'Сахарная голова, Рио-де-Жанейро, Бразилия', lat: '-22.9493', lon: '-43.1546', type: 'place', importance: 0.7, postcode: '22291-170', aliases: ['sugarloaf'] },
  { place_id: 'amer_21', display_name: 'Христос, Рио-де-Жанейро, Бразилия', lat: '-22.9519', lon: '-43.2105', type: 'place', importance: 0.7, postcode: '22241-370', aliases: ['christ redeemer'] },
  { place_id: 'amer_22', display_name: 'Обелиск, Буэнос-Айрес, Аргентина', lat: '-34.6037', lon: '-58.3816', type: 'place', importance: 0.7, postcode: 'C1043', aliases: ['obelisco'] },
  { place_id: 'amer_23', display_name: 'Ла-Бока, Буэнос-Айрес, Аргентина', lat: '-34.6345', lon: '-58.3634', type: 'place', importance: 0.7, postcode: '1166', aliases: ['la boca'] },
  { place_id: 'amer_24', display_name: 'Пласа-де-Армас, Лима, Перу', lat: '-12.0464', lon: '-77.0428', type: 'place', importance: 0.7, postcode: '15001', aliases: ['plaza de armas'] },
  { place_id: 'amer_25', display_name: 'Канделария, Богота, Колумбия', lat: '4.5981', lon: '-74.0760', type: 'place', importance: 0.7, postcode: '110321', aliases: ['candelaria'] },
  { place_id: 'amer_26', display_name: 'Пласа-де-Армас, Сантьяго, Чили', lat: '-33.4378', lon: '-70.6505', type: 'place', importance: 0.7, postcode: '8320190', aliases: ['plaza de armas'] },
  { place_id: 'amer_27', display_name: 'Малекон, Гавана, Куба', lat: '23.1403', lon: '-82.3575', type: 'place', importance: 0.7, postcode: '10100', aliases: ['malecon'] },
  { place_id: 'amer_28', display_name: 'Стрип, Лас-Вегас, США', lat: '36.1147', lon: '-115.1728', type: 'place', importance: 0.7, postcode: '89109', aliases: ['the strip'] },
  { place_id: 'amer_29', display_name: 'Спейс-Нидл, Сиэтл, США', lat: '47.6205', lon: '-122.3493', type: 'place', importance: 0.7, postcode: '98109', aliases: ['space needle'] },
  { place_id: 'amer_30', display_name: 'Фридом-трейл, Бостон, США', lat: '42.3601', lon: '-71.0589', type: 'place', importance: 0.7, postcode: '02108', aliases: ['freedom trail'] },
// --- AUSTRALIA + AFRICA + MIDDLE EAST (21) ---
  { place_id: 'auaf_0', display_name: 'Оперный театр, Сидней, Австралия', lat: '-33.8568', lon: '151.2153', type: 'place', importance: 0.7, postcode: '2000', aliases: ['sydney opera'] },
  { place_id: 'auaf_1', display_name: 'Харбор-бридж, Сидней, Австралия', lat: '-33.8523', lon: '151.2108', type: 'place', importance: 0.7, postcode: '2000', aliases: ['harbour bridge'] },
  { place_id: 'auaf_2', display_name: 'Бондай, Сидней, Австралия', lat: '-33.8915', lon: '151.2767', type: 'place', importance: 0.7, postcode: '2026', aliases: ['bondi beach'] },
  { place_id: 'auaf_3', display_name: 'Флиндерс, Мельбурн, Австралия', lat: '-37.8178', lon: '144.9681', type: 'place', importance: 0.7, postcode: '3000', aliases: ['flinders'] },
  { place_id: 'auaf_4', display_name: 'Скай-тауэр, Окленд, Новая Зеландия', lat: '-36.8485', lon: '174.7633', type: 'place', importance: 0.7, postcode: '1010', aliases: ['sky tower'] },
  { place_id: 'auaf_5', display_name: 'Столовая гора, Кейптаун, ЮАР', lat: '-33.9628', lon: '18.4108', type: 'place', importance: 0.7, postcode: '8001', aliases: ['table mountain'] },
  { place_id: 'auaf_6', display_name: 'Пирамиды Гизы, Каир, Египет', lat: '29.9792', lon: '31.1342', type: 'place', importance: 0.7, postcode: '12556', aliases: ['pyramids'] },
  { place_id: 'auaf_7', display_name: 'Египетский музей, Каир, Египет', lat: '30.0478', lon: '31.2336', type: 'place', importance: 0.7, postcode: '11511', aliases: ['egyptian museum'] },
  { place_id: 'auaf_8', display_name: 'Джемаа-эль-Фна, Марракеш, Марокко', lat: '31.6295', lon: '-7.9811', type: 'place', importance: 0.7, postcode: '40000', aliases: ['jemaa el fna'] },
  { place_id: 'auaf_9', display_name: 'Карфаген, Тунис, Тунис', lat: '36.8528', lon: '10.3233', type: 'place', importance: 0.7, postcode: '2016', aliases: ['carthage'] },
  { place_id: 'auaf_10', display_name: 'Национальный парк, Найроби, Кения', lat: '-1.3733', lon: '36.8582', type: 'place', importance: 0.7, postcode: '00100', aliases: ['nairobi park'] },
  { place_id: 'auaf_11', display_name: 'Виктория-Айленд, Лагос, Нигерия', lat: '6.4281', lon: '3.4219', type: 'place', importance: 0.7, postcode: '101241', aliases: ['victoria island'] },
  { place_id: 'auaf_12', display_name: 'Соуэто, Йоханнесбург, ЮАР', lat: '-26.2678', lon: '27.8585', type: 'place', importance: 0.7, postcode: '1809', aliases: ['soweto'] },
  { place_id: 'auaf_13', display_name: 'Шейх-Зайд, Абу-Даби, ОАЭ', lat: '24.4539', lon: '54.3773', type: 'place', importance: 0.7, postcode: '00000', aliases: ['sheikh zayed'] },
  { place_id: 'auaf_14', display_name: 'Королевская башня, Эр-Рияд, Саудовская Аравия', lat: '24.7117', lon: '46.6753', type: 'place', importance: 0.7, postcode: '11321', aliases: ['kingdom tower'] },
  { place_id: 'auaf_15', display_name: 'Корниш, Доха, Катар', lat: '25.2854', lon: '51.5310', type: 'place', importance: 0.7, postcode: '00000', aliases: ['corniche'] },
  { place_id: 'auaf_16', display_name: 'Башни, Эль-Кувейт, Кувейт', lat: '29.3759', lon: '47.9774', type: 'place', importance: 0.7, postcode: '00000', aliases: ['kuwait towers'] },
  { place_id: 'auaf_17', display_name: 'Султан-Кабус, Маскат, Оман', lat: '23.5859', lon: '58.4059', type: 'place', importance: 0.7, postcode: '100', aliases: ['sultan qaboos'] },
  { place_id: 'auaf_18', display_name: 'Старый город, Тбилиси, Грузия', lat: '41.6938', lon: '44.8015', type: 'place', importance: 0.7, postcode: '0105', aliases: ['tbilisi old town'] },
  { place_id: 'auaf_19', display_name: 'Каскад, Ереван, Армения', lat: '40.1920', lon: '44.5152', type: 'place', importance: 0.7, postcode: '0010', aliases: ['cascade'] },
  { place_id: 'auaf_20', display_name: 'Старый город, Баку, Азербайджан', lat: '40.3661', lon: '49.8352', type: 'place', importance: 0.7, postcode: '1000', aliases: ['baku old city'] },
];

// ===== SEARCH LOGIC =====

function normalize(str: string): string {
  return str.toLowerCase()
    // Polish chars
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0400-\u04ff\s]/gi, '')
    .trim();
}

// Extract text words (remove pure numbers like house numbers)
function textWords(words: string[]): string[] {
  return words.filter(w => !/^\d+$/.test(w) && w.length >= 2);
}

function matchesQuery(item: GeocodingResult, queryWords: string[]): boolean {
  // Try full match first
  const haystack = normalize(item.display_name);
  if (queryWords.every(w => haystack.includes(w))) return true;
  if (item.aliases) {
    for (const alias of item.aliases) {
      if (queryWords.every(w => normalize(alias).includes(w))) return true;
    }
  }
  // Fallback: ignore house numbers
  const texts = textWords(queryWords);
  if (texts.length === 0) return false;
  if (texts.every(w => haystack.includes(w))) return true;
  if (item.aliases) {
    for (const alias of item.aliases) {
      if (texts.every(w => normalize(alias).includes(w))) return true;
    }
  }
  return false;
}

function scoreResult(item: GeocodingResult, queryWords: string[]): number {
  let score = item.importance * 100;
  const haystack = normalize(item.display_name);
  for (const w of queryWords) {
    if (haystack.startsWith(w)) score += 50;
    else if (haystack.includes(' ' + w)) score += 30;
    else if (haystack.includes(w)) score += 10;
  }
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
  return searchLocalAddresses(query);
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  let nearest: GeocodingResult | null = null;
  let nearestDist = Infinity;
  for (const addr of LOCAL_ADDRESSES) {
    const d = getDistanceKm(lat, lng, parseFloat(addr.lat), parseFloat(addr.lon));
    if (d < nearestDist) { nearestDist = d; nearest = addr; }
  }
  if (nearest && nearestDist < 5) return nearest.display_name;
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

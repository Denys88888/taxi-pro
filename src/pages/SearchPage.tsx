import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Clock, Star, Navigation } from 'lucide-react';
import { autocompleteLocations } from '@/lib/geocoding';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import type { GeocodingResult } from '@/lib/geocoding';

interface LocationItem {
  name: string;
  address: string;
  lat: string;
  lng: string;
}

const LOCAL_FALLBACK: LocationItem[] = [
  // Moscow (12)
  { name: 'Красная площадь', address: 'Москва, Россия', lat: '55.7539', lng: '37.6208' },
  { name: 'Кремль', address: 'Москва, Россия', lat: '55.7520', lng: '37.6175' },
  { name: 'Москва-Сити', address: 'Москва, Россия', lat: '55.7495', lng: '37.5373' },
  { name: 'Аэропорт Шереметьево', address: 'Москва, Россия', lat: '55.9736', lng: '37.4125' },
  { name: 'Аэропорт Домодедово', address: 'Москва, Россия', lat: '55.4103', lng: '37.9023' },
  { name: 'ВДНХ', address: 'Москва, Россия', lat: '55.8261', lng: '37.6376' },
  { name: 'Улица Арбат', address: 'Москва, Россия', lat: '55.7521', lng: '37.5952' },
  { name: 'Парк Горького', address: 'Москва, Россия', lat: '55.7314', lng: '37.6035' },
  { name: 'Стадион Лужники', address: 'Москва, Россия', lat: '55.7158', lng: '37.5536' },
  { name: 'Останкинская башня', address: 'Москва, Россия', lat: '55.8197', lng: '37.6119' },
  { name: 'Сокольники', address: 'Москва, Россия', lat: '55.7891', lng: '37.6797' },
  { name: 'Тверская улица', address: 'Москва, Россия', lat: '55.7648', lng: '37.6063' },
  // Saint Petersburg (12)
  { name: 'Дворцовая площадь', address: 'Санкт-Петербург, Россия', lat: '59.9402', lng: '30.3159' },
  { name: 'Эрмитаж', address: 'Санкт-Петербург, Россия', lat: '59.9398', lng: '30.3146' },
  { name: 'Невский проспект', address: 'Санкт-Петербург, Россия', lat: '59.9343', lng: '30.3351' },
  { name: 'Петропавловская крепость', address: 'Санкт-Петербург, Россия', lat: '59.9500', lng: '30.3167' },
  { name: 'Аэропорт Пулково', address: 'Санкт-Петербург, Россия', lat: '59.8003', lng: '30.2625' },
  { name: 'Исаакиевский собор', address: 'Санкт-Петербург, Россия', lat: '59.9341', lng: '30.3062' },
  { name: 'Казанский собор', address: 'Санкт-Петербург, Россия', lat: '59.9343', lng: '30.3245' },
  { name: 'Храм Спаса на Крови', address: 'Санкт-Петербург, Россия', lat: '59.9400', lng: '30.3289' },
  { name: 'Летний сад', address: 'Санкт-Петербург, Россия', lat: '59.9461', lng: '30.3364' },
  { name: 'Мариинский театр', address: 'Санкт-Петербург, Россия', lat: '59.9258', lng: '30.2966' },
  { name: 'Васильевский остров', address: 'Санкт-Петербург, Россия', lat: '59.9400', lng: '30.2900' },
  { name: 'Финляндский вокзал', address: 'Санкт-Петербург, Россия', lat: '59.9553', lng: '30.3558' },
  // Kyiv (12)
  { name: 'Майдан Незалежности', address: 'Киев, Украина', lat: '50.4504', lng: '30.5245' },
  { name: 'Киево-Печерская Лавра', address: 'Киев, Украина', lat: '50.4343', lng: '30.5592' },
  { name: 'Аэропорт Борисполь', address: 'Киев, Украина', lat: '50.3450', lng: '30.8947' },
  { name: 'Золотые ворота', address: 'Киев, Украина', lat: '50.4484', lng: '30.5133' },
  { name: 'Улица Крещатик', address: 'Киев, Украина', lat: '50.4475', lng: '30.5221' },
  { name: 'Софиевский собор', address: 'Киев, Украина', lat: '50.4531', lng: '30.5144' },
  { name: 'Родина-мать', address: 'Киев, Украина', lat: '50.4266', lng: '30.5630' },
  { name: 'Олимпийский стадион', address: 'Киев, Украина', lat: '50.4333', lng: '30.5217' },
  { name: 'Подол', address: 'Киев, Украина', lat: '50.4667', lng: '30.5167' },
  { name: 'Аэропорт Жуляны', address: 'Киев, Украина', lat: '50.4019', lng: '30.4497' },
  { name: 'Андреевский спуск', address: 'Киев, Украина', lat: '50.4594', lng: '30.5179' },
  { name: 'Оболонь', address: 'Киев, Украина', lat: '50.5050', lng: '30.4983' },
  // Minsk (12)
  { name: 'Площадь Независимости', address: 'Минск, Беларусь', lat: '53.8958', lng: '27.5478' },
  { name: 'Площадь Победы', address: 'Минск, Беларусь', lat: '53.9081', lng: '27.5742' },
  { name: 'Национальная библиотека', address: 'Минск, Беларусь', lat: '53.9216', lng: '27.6589' },
  { name: 'Национальный аэропорт', address: 'Минск, Беларусь', lat: '53.8885', lng: '28.0445' },
  { name: 'Парк Горького', address: 'Минск, Беларусь', lat: '53.9023', lng: '27.5736' },
  { name: 'Улица Немига', address: 'Минск, Беларусь', lat: '53.9059', lng: '27.5545' },
  { name: 'Стадион Динамо', address: 'Минск, Беларусь', lat: '53.8956', lng: '27.5605' },
  { name: 'Троицкое предместье', address: 'Минск, Беларусь', lat: '53.9083', lng: '27.5563' },
  { name: 'Дворец Республики', address: 'Минск, Беларусь', lat: '53.9028', lng: '27.5613' },
  { name: 'Комаровский рынок', address: 'Минск, Беларусь', lat: '53.8892', lng: '27.5386' },
  { name: 'Ботанический сад', address: 'Минск, Беларусь', lat: '53.9167', lng: '27.6167' },
  { name: 'ТЦ Замок', address: 'Минск, Беларусь', lat: '53.9288', lng: '27.5826' },
  // Almaty (12)
  { name: 'Площадь Республики', address: 'Алматы, Казахстан', lat: '43.2380', lng: '76.9459' },
  { name: 'Вознесенский собор', address: 'Алматы, Казахстан', lat: '43.2581', lng: '76.9530' },
  { name: 'Кок-Тобе', address: 'Алматы, Казахстан', lat: '43.2346', lng: '76.9783' },
  { name: 'Аэропорт Алматы', address: 'Алматы, Казахстан', lat: '43.3521', lng: '77.0405' },
  { name: 'Каток Медеу', address: 'Алматы, Казахстан', lat: '43.2098', lng: '77.0861' },
  { name: 'Шымбулак', address: 'Алматы, Казахстан', lat: '43.1283', lng: '77.0810' },
  { name: 'Улица Арбат', address: 'Алматы, Казахстан', lat: '43.2567', lng: '76.9533' },
  { name: 'Достык Плаза', address: 'Алматы, Казахстан', lat: '43.2408', lng: '76.9189' },
  { name: 'Парк Первого Президента', address: 'Алматы, Казахстан', lat: '43.2267', lng: '76.9225' },
  { name: 'Mega Park Алматы', address: 'Алматы, Казахстан', lat: '43.2028', lng: '76.8933' },
  { name: 'Театр оперы имени Абая', address: 'Алматы, Казахстан', lat: '43.2414', lng: '76.9194' },
  { name: 'Дворец Рахат', address: 'Алматы, Казахстан', lat: '43.2450', lng: '76.9167' },
  // International (12+)
  { name: 'Таймс-сквер', address: 'New York City, USA', lat: '40.7580', lng: '-73.9855' },
  { name: 'Центральный парк', address: 'New York City, USA', lat: '40.7829', lng: '-73.9654' },
  { name: 'Аэропорт JFK', address: 'Нью-Йорк, США', lat: '40.6413', lng: '-73.7781' },
  { name: 'Биг-Бен', address: 'London, United Kingdom', lat: '51.4994', lng: '-0.1245' },
  { name: 'Аэропорт Хитроу', address: 'Лондон, Великобритания', lat: '51.4700', lng: '-0.4543' },
  { name: 'Эйфелева башня', address: 'Париж, Франция', lat: '48.8584', lng: '2.2945' },
  { name: 'Аэропорт Шарль-де-Голль', address: 'Париж, Франция', lat: '49.0097', lng: '2.5479' },
  { name: 'Токийская башня', address: 'Токио, Япония', lat: '35.6586', lng: '139.7454' },
  { name: 'Аэропорт Нарита', address: 'Токио, Япония', lat: '35.7647', lng: '140.3864' },
  { name: 'Бурдж-Халифа', address: 'Дубай, ОАЭ', lat: '25.1972', lng: '55.2744' },
  { name: 'Аэропорт Дубай', address: 'Дубай, ОАЭ', lat: '25.2532', lng: '55.3657' },
  { name: 'Аэропорт Чанги', address: 'Сингапур', lat: '1.3644', lng: '103.9915' },
  { name: 'Сиднейский оперный театр', address: 'Сидней, Австралия', lat: '-33.8568', lng: '151.2153' },
  { name: 'Центральный вокзал', address: 'Берлин, Германия', lat: '52.5251', lng: '13.3694' },
  { name: 'Колизей', address: 'Рим, Италия', lat: '41.8902', lng: '12.4922' },
  { name: 'Саграда Фамилия', address: 'Барселона, Испания', lat: '41.4036', lng: '2.1744' },
  { name: 'Башня CN', address: 'Торонто, Канада', lat: '43.6426', lng: '-79.3871' },
  // Warsaw (12)
  { name: 'Замковая площадь', address: 'Варшава, Польша', lat: '52.2476', lng: '21.0142' },
  { name: 'Аэропорт Шопена', address: 'Варшава, Польша', lat: '52.1657', lng: '20.9671' },
  { name: 'Дворец культуры', address: 'Варшава, Польша', lat: '52.2318', lng: '21.0058' },
  { name: 'Улица Плёвецкая', address: 'Варшава, Польша', lat: '52.2370', lng: '21.1230' },

  { name: 'Национальный стадион', address: 'Варшава, Польша', lat: '52.2395', lng: '21.0456' },
  { name: 'Злоте Тарасы', address: 'Варшава, Польша', lat: '52.2303', lng: '21.0019' },
  { name: 'Лазенковский дворец', address: 'Варшава, Польша', lat: '52.2144', lng: '21.0354' },
  { name: 'Улица Новый Свет', address: 'Варшава, Польша', lat: '52.2352', lng: '21.0190' },
  { name: 'Мокотув', address: 'Варшава, Польша', lat: '52.1904', lng: '21.0038' },
  { name: 'Виланув', address: 'Варшава, Польша', lat: '52.1658', lng: '21.0906' },
  { name: 'Прага-Полудне', address: 'Варшава, Польша', lat: '52.2449', lng: '21.0845' },
  { name: 'Воля', address: 'Варшава, Польша', lat: '52.2370', lng: '20.9800' },
];

function convertGeocodingToItem(result: GeocodingResult): LocationItem {
  return {
    name: result.display_name.split(',')[0],
    address: result.display_name,
    lat: result.lat,
    lng: result.lon,
  };
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { setDestination, setPickup } = useApp();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);

    autocompleteLocations(searchQuery, (data) => {
      if (data.length === 0) {
        // Fallback: search local database
        const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const fallback = LOCAL_FALLBACK.filter(
          (loc) =>
            loc.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
            loc.address.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
        );
        setResults(fallback);
      } else {
        setResults(data.map(convertGeocodingToItem));
      }
      setLoading(false);
    });
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    doSearch(value);
  }, [doSearch]);

  const handleSelect = useCallback((item: LocationItem) => {
    setDestination({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lng),
      address: item.address,
      name: item.name,
    });
    navigate('/book');
  }, [setDestination, navigate]);

  const handleCurrentLocation = useCallback(() => {
    const saved = localStorage.getItem('taxipro_gps_pickup');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPickup({
          lat: parsed.lat ?? 0,
          lng: parsed.lng ?? 0,
          address: parsed.address ?? 'Текущее местоположение',
          name: parsed.name ?? 'Мое местоположение',
        });
        navigate('/book');
      } catch {
        // ignore parse errors
      }
    }
  }, [setPickup, navigate]);

  const hasGpsPickup = !!localStorage.getItem('taxipro_gps_pickup');

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-bg-elevated/50 backdrop-blur-xl border-b border-white/5">
        <motion.button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-surface active:bg-bg-elevated"
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><ArrowLeft size={18} color="#FFFFFF"/></div>
        </motion.button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={t('searchLocation')}
            className="w-full h-11 bg-bg-surface rounded-full px-4 pl-10 text-text-primary placeholder:text-text-tertiary text-base outline-none focus:ring-2 focus:ring-primary/40 border border-white/5"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {query.trim().length >= 2 ? (
            /* Search Results */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-1"
            >
              {loading ? (
                /* Skeleton loading */
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-piride-md">
                    <div className="w-10 h-10 rounded-full shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 shimmer rounded" />
                      <div className="h-3 w-1/2 shimmer rounded" />
                    </div>
                  </div>
                ))
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin size={40} color="#333333" className="mx-auto mb-3" />
                  <p className="text-text-tertiary text-sm">{t('noLocationsFound')}</p>
                </div>
              ) : (
                results.map((item, idx) => (
                  <motion.button
                    key={`${item.name}-${idx}`}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSelect(item)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} color="#00C853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{item.address}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          ) : (
            /* Recent + Saved + Current Location */
            <motion.div
              key="recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {/* Current Location quick button */}
              {hasGpsPickup && (
                <>
                  <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">{t('nearby')}</h3>
                  <motion.button
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors mb-2"
                    onClick={handleCurrentLocation}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Navigation size={18} color="#00C853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{t('myLocation')}</p>
                      <p className="text-text-tertiary text-xs truncate">{t('currentLocation')}</p>
                    </div>
                  </motion.button>
                </>
              )}

              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">{t('popularPlaces')}</h3>
              <div className="space-y-1">
                {LOCAL_FALLBACK.slice(0, 6).map((loc, idx) => (
                  <motion.button
                    key={loc.name}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSelect(loc)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center shrink-0">
                      <Clock size={18} color="#A0A0A0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{loc.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{loc.address}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-6 mb-3 px-1">{t('saved')}</h3>
              <div className="space-y-1">
                {LOCAL_FALLBACK.slice(6, 12).map((loc, idx) => (
                  <motion.button
                    key={loc.name}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSelect(loc)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-piPurple/10 flex items-center justify-center shrink-0">
                      <Star size={18} color="#6700C2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{loc.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{loc.address}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

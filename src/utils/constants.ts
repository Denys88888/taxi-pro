import type { VehicleType } from '../types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:10000';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:10000';
export const PI_SANDBOX = import.meta.env.VITE_PI_SANDBOX !== 'false';

export const TOKEN_KEY = 'taxipro_token';
export const USER_KEY = 'taxipro_user';
export const THEME_KEY = 'taxipro_theme';
export const LANG_KEY = 'taxipro_lang';

export interface VehicleOption {
  type: VehicleType;
  labelKey: string;
  icon: string;
  basePrice: number;
}

// Display metadata for the vehicle selector. Prices are indicative; the server
// computes the authoritative fare.
export const VEHICLE_OPTIONS: VehicleOption[] = [
  { type: 'economy', labelKey: 'vehicle.economy', icon: '🚗', basePrice: 1.0 },
  { type: 'comfort', labelKey: 'vehicle.comfort', icon: '🚙', basePrice: 1.5 },
  { type: 'business', labelKey: 'vehicle.business', icon: '🚘', basePrice: 2.5 },
  { type: 'xl', labelKey: 'vehicle.xl', icon: '🚐', basePrice: 2.0 },
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
] as const;

export const RTL_LANGUAGES = ['ar'];

export const QUICK_TEMPLATE_KEYS = [
  'templates.0',
  'templates.1',
  'templates.2',
  'templates.3',
  'templates.4',
];

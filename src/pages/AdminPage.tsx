import { useState } from 'react';
import {
  Car,
  DollarSign,
  Users,
  Activity,
  LayoutDashboard,
  Settings,
  ChevronRight,
  Circle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type Tab = 'dashboard' | 'rides' | 'drivers' | 'settings';

const dailyRevenue = [
  { day: 'Пн', value: 45, label: '45π' },
  { day: 'Вт', value: 68, label: '68π' },
  { day: 'Ср', value: 124, label: '124π' },
  { day: 'Чт', value: 52, label: '52π' },
  { day: 'Пт', value: 156, label: '156π' },
  { day: 'Сб', value: 203, label: '203π' },
  { day: 'Вс', value: 89, label: '89π' },
];

const maxRevenue = Math.max(...dailyRevenue.map((d) => d.value));

const mockRides = [
  { id: '#4821', passenger: 'Анна Смирнова', driver: 'Алексей П.', from: 'Красная площадь', to: 'Шереметьево', price: 24.5, status: 'completed' as const, date: '2025-06-04' },
  { id: '#4820', passenger: 'Борис Иванов', driver: 'Мария К.', from: 'Тверская улица', to: 'ТЦ Европейский', price: 12.8, status: 'completed' as const, date: '2025-06-04' },
  { id: '#4819', passenger: 'Виктория Петрова', driver: 'Дмитрий С.', from: 'Киевский вокзал', to: 'Сити', price: 18.0, status: 'in_progress' as const, date: '2025-06-04' },
  { id: '#4818', passenger: 'Григорий Сидоров', driver: 'Елена В.', from: 'Арбат', to: 'Кремль', price: 9.5, status: 'completed' as const, date: '2025-06-03' },
  { id: '#4817', passenger: 'Дарья Козлова', driver: 'Алексей П.', from: 'Парк Горького', to: 'Лужники', price: 31.2, status: 'cancelled' as const, date: '2025-06-03' },
  { id: '#4816', passenger: 'Евгений Новиков', driver: 'Мария К.', from: 'ВДНХ', to: 'Останкино', price: 15.6, status: 'completed' as const, date: '2025-06-03' },
  { id: '#4815', passenger: 'Жанна Морозова', driver: 'Дмитрий С.', from: 'Сокольники', to: 'Красная площадь', price: 22.3, status: 'completed' as const, date: '2025-06-02' },
  { id: '#4814', passenger: 'Игорь Волков', driver: 'Елена В.', from: 'Домодедово', to: 'Тверская', price: 28.0, status: 'in_progress' as const, date: '2025-06-02' },
  { id: '#4813', passenger: 'Ксения Лебедева', driver: 'Алексей П.', from: 'Москва-Сити', to: 'Киевский вокзал', price: 14.4, status: 'completed' as const, date: '2025-06-02' },
  { id: '#4812', passenger: 'Леонид Соловьёв', driver: 'Мария К.', from: 'Кремль', to: 'Парк Горького', price: 19.8, status: 'cancelled' as const, date: '2025-06-01' },
];

const mockDrivers = [
  { id: '#D101', name: 'Алексей Петров', rating: 4.9, rides: 342, earnings: 4250, status: 'online' as const, documents: 3 },
  { id: '#D102', name: 'Мария Кузнецова', rating: 4.8, rides: 289, earnings: 3680, status: 'busy' as const, documents: 3 },
  { id: '#D103', name: 'Дмитрий Смирнов', rating: 4.7, rides: 198, earnings: 2450, status: 'online' as const, documents: 2 },
  { id: '#D104', name: 'Елена Васильева', rating: 4.9, rides: 415, earnings: 5120, status: 'offline' as const, documents: 3 },
  { id: '#D105', name: 'Иван Козлов', rating: 4.6, rides: 156, earnings: 1890, status: 'online' as const, documents: 3 },
  { id: '#D106', name: 'Ольга Попова', rating: 4.8, rides: 267, earnings: 3340, status: 'busy' as const, documents: 3 },
  { id: '#D107', name: 'Сергей Сидоров', rating: 4.5, rides: 124, earnings: 1520, status: 'offline' as const, documents: 1 },
  { id: '#D108', name: 'Наталья Новикова', rating: 4.9, rides: 378, earnings: 4680, status: 'online' as const, documents: 3 },
];

function StatusBadge({ status }: { status: 'completed' | 'cancelled' | 'in_progress' }) {
  const styles = {
    completed: { bg: '#E8F5E9', text: '#2E7D32', label: 'Завершена' },
    cancelled: { bg: '#FFEBEE', text: '#C62828', label: 'Отменена' },
    in_progress: { bg: '#E3F2FD', text: '#1565C0', label: 'В пути' },
  };
  const s = styles[status];
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.text }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
    >
      {status === 'completed' && <CheckCircle size={12} />}
      {status === 'cancelled' && <XCircle size={12} />}
      {status === 'in_progress' && <Clock size={12} />}
      {s.label}
    </span>
  );
}

function DriverStatusDot({ status }: { status: 'online' | 'offline' | 'busy' }) {
  const colors = {
    online: '#00C853',
    offline: '#9E9E9E',
    busy: '#FF9800',
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Circle size={10} fill={colors[status]} color={colors[status]} />
      <span className="capitalize">{status}</span>
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '15' }}
      >
        <Icon size={24} color={color} />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
      </div>
    </div>
  );
}

function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const { t } = useTranslation();
  const items: { key: Tab; icon: typeof LayoutDashboard; label: string }[] = [
    { key: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { key: 'rides', icon: Car, label: t('rides') },
    { key: 'drivers', icon: Users, label: t('drivers') },
    { key: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#448AFF' }}>
            <Car size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Taxi Pro</h1>
            <p className="text-xs text-gray-400">Админ</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
              style={{
                backgroundColor: isActive ? '#448AFF' : 'transparent',
                color: isActive ? '#FFFFFF' : '#64748B',
              }}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-600">АД</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Администратор</p>
            <p className="text-xs text-gray-400 truncate">admin@taxipro.pi</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DashboardView() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Car} label={t('totalRides')} value="1,247" color="#448AFF" />
        <StatCard icon={DollarSign} label={t('totalRevenue')} value="4,582π" color="#00C853" />
        <StatCard icon={Users} label={t('activeDrivers')} value="89" color="#FF9800" />
        <StatCard icon={Activity} label={t('onlineNow')} value="12" color="#448AFF" />
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-6">Доход — Последние 7 дней</h3>
        <div className="flex items-end gap-3 h-48">
          {dailyRevenue.map((d) => {
            const heightPct = (d.value / maxRevenue) * 100;
            const barBlocks = Math.ceil(heightPct / 12.5);
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-mono text-gray-500">{d.label}</span>
                <div className="flex flex-col-reverse gap-[2px] w-full items-center">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full rounded-sm transition-opacity"
                      style={{
                        height: '8px',
                        backgroundColor: i < barBlocks ? '#448AFF' : '#F1F5F9',
                        opacity: i < barBlocks ? 1 : 0.5,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} color="#00C853" />
            <span className="text-sm font-medium text-gray-700">Процент завершения</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">94.2%</p>
          <p className="text-xs text-gray-400 mt-1">+1.5% с прошлой недели</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} color="#448AFF" />
            <span className="text-sm font-medium text-gray-700">Среднее время поездки</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">14.3 min</p>
          <p className="text-xs text-gray-400 mt-1">-0.8 мин с прошлой недели</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={16} color="#FF9800" />
            <span className="text-sm font-medium text-gray-700">Средний чек</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">18.6π</p>
          <p className="text-xs text-gray-400 mt-1">+2.1π с прошлой недели</p>
        </div>
      </div>
    </div>
  );
}

function RidesView() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{t('recentRides')}</h3>
        <span className="text-xs text-gray-400 font-mono">{mockRides.length} поездок</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 text-left font-medium">{t('rideId')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('passenger')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('driver')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('from')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('to')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('price')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('status')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('date')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockRides.map((ride) => (
              <tr key={ride.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5 font-mono text-xs text-gray-500">{ride.id}</td>
                <td className="px-6 py-3.5 font-medium text-gray-900">{ride.passenger}</td>
                <td className="px-6 py-3.5 text-gray-600">{ride.driver}</td>
                <td className="px-6 py-3.5 text-gray-600">{ride.from}</td>
                <td className="px-6 py-3.5 text-gray-600">{ride.to}</td>
                <td className="px-6 py-3.5 font-mono font-medium text-gray-900">{ride.price.toFixed(1)}π</td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={ride.status} />
                </td>
                <td className="px-6 py-3.5 text-gray-500">{ride.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DriversView() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{t('drivers')}</h3>
        <span className="text-xs text-gray-400 font-mono">{mockDrivers.length} водителей</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 text-left font-medium">ID</th>
              <th className="px-6 py-3 text-left font-medium">{t('driver')}</th>
              <th className="px-6 py-3 text-left font-medium">Рейтинг</th>
              <th className="px-6 py-3 text-left font-medium">{t('rides')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('earnings')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('status')}</th>
              <th className="px-6 py-3 text-left font-medium">{t('documents')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5 font-mono text-xs text-gray-500">{driver.id}</td>
                <td className="px-6 py-3.5 font-medium text-gray-900">{driver.name}</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-1 font-mono text-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="text-gray-700">{driver.rating}</span>
                  </span>
                </td>
                <td className="px-6 py-3.5 font-mono text-gray-600">{driver.rides}</td>
                <td className="px-6 py-3.5 font-mono font-medium text-gray-900">{driver.earnings.toLocaleString()}π</td>
                <td className="px-6 py-3.5">
                  <DriverStatusDot status={driver.status} />
                </td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <FileText size={14} />
                    <span className="font-mono">{driver.documents}/3</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsView() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
      <h3 className="text-base font-semibold text-gray-900 mb-6">{t('settings')}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Commission Rate</p>
            <p className="text-xs text-gray-400">Platform fee taken from each ride</p>
          </div>
          <span className="font-mono text-sm font-medium text-gray-700">2%</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Minimum Fare</p>
            <p className="text-xs text-gray-400">Lowest possible ride price</p>
          </div>
          <span className="font-mono text-sm font-medium text-gray-700">3.0π</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Base Fare</p>
            <p className="text-xs text-gray-400">Starting price for every ride</p>
          </div>
          <span className="font-mono text-sm font-medium text-gray-700">2.5π</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Price per km</p>
            <p className="text-xs text-gray-400">Distance-based pricing</p>
          </div>
          <span className="font-mono text-sm font-medium text-gray-700">1.2π</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Price per min</p>
            <p className="text-xs text-gray-400">Time-based pricing</p>
          </div>
          <span className="font-mono text-sm font-medium text-gray-700">0.3π</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Cancellation Fee</p>
            <p className="text-xs text-gray-400">Fee after free cancellation window</p>
          </div>
          <span className="font-mono text-sm font-medium text-gray-700">50%</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'dashboard' && t('adminDashboard')}
              {activeTab === 'rides' && t('recentRides')}
              {activeTab === 'drivers' && t('drivers')}
              {activeTab === 'settings' && t('settings')}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <LayoutDashboard size={14} />
              <ChevronRight size={14} />
              <span className="text-gray-600 capitalize">
                {activeTab === 'dashboard' && t('dashboard')}
                {activeTab === 'rides' && t('rides')}
                {activeTab === 'drivers' && t('drivers')}
                {activeTab === 'settings' && t('settings')}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'rides' && <RidesView />}
          {activeTab === 'drivers' && <DriversView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>
      </div>
  );
}

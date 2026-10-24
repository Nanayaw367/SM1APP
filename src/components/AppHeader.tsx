import React from 'react';
import { 
  Menu, 
  Moon, 
  Sun, 
  QrCode, 
  FileSpreadsheet, 
  Tablet, 
  Clock, 
  Wrench, 
  Package, 
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';
import { InventoryStats } from '../types/inventory';

interface AppHeaderProps {
  activeTab: string;
  stats: InventoryStats;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onOpenMobileMenu: () => void;
  onOpenScanner: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenAndroidOfflineModal: () => void;
  isOnline: boolean;
  canInstall?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  stats,
  isNightMode,
  onToggleNightMode,
  onOpenMobileMenu,
  onOpenScanner,
  onNavigateTab,
  onOpenAndroidOfflineModal,
  isOnline,
  canInstall,
}) => {
  const getTabInfo = (tab: string) => {
    switch (tab) {
      case 'tablets':
        return {
          title: 'Tablets & Assignees',
          subtitle: 'Active 1:1 KATON SM1 devices, student assignments, and class rosters',
          icon: Tablet,
          badgeText: `${stats.totalTablets} Total Units`
        };
      case 'loans':
        return {
          title: 'Loan Status Register',
          subtitle: 'Track active temporary bridge loaners and standard full-term loans',
          icon: Clock,
          badgeText: `${stats.onLoanCount} On Loan`
        };
      case 'repairs':
        return {
          title: 'Repairs & Technical Service',
          subtitle: 'Hardware diagnostics, broken screens, chassis damage & missing kits',
          icon: Wrench,
          badgeText: `${stats.openRepairsCount} Open Tickets`
        };
      case 'accessories':
        return {
          title: 'Accessories & Peripherals',
          subtitle: 'Stock balances for power banks, chargers, USB-C cables, and keyboard cases',
          icon: Package,
          badgeText: `${stats.lowStockAccessoriesCount} Alerts`
        };
      case 'csv':
        return {
          title: 'Bulk CSV Deployment & Export Center',
          subtitle: 'Import student registries and export filtered rosters by Year Level & Class',
          icon: FileSpreadsheet,
          badgeText: 'Batch Tools'
        };
      case 'dashboard':
      default:
        return {
          title: 'Fleet Depot Analytics',
          subtitle: 'Executive KPIs, deployment rates, student residence breakdown & health',
          icon: BarChart3,
          badgeText: 'Live Metrics'
        };
    }
  };

  const tabInfo = getTabInfo(activeTab);
  const TabIcon = tabInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 hidden sm:flex border border-blue-200 dark:border-blue-900/50">
            <TabIcon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">
                {tabInfo.title}
              </h1>
              <span className="hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {tabInfo.badgeText}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              {tabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Actions & Night Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Android Offline App & Local DB Trigger */}
          <button
            onClick={onOpenAndroidOfflineModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900 border border-orange-300 dark:border-orange-800 transition cursor-pointer shadow-2xs"
            title="Open Android App info, offline IndexedDB stats, backup & APK packaging"
          >
            <Smartphone className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span className="hidden sm:inline">Android App</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-700">
              {isOnline ? 'DB' : 'OFFLINE'}
            </span>
          </button>

          {/* Quick Scanner Shortcut */}
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Scan or search tablet by IMEI or Serial Number"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="hidden md:inline">Scan / Lookup</span>
          </button>

          {/* Quick CSV Deploy Link if not on CSV tab */}
          {activeTab !== 'csv' && (
            <button
              onClick={() => onNavigateTab('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Bulk CSV</span>
            </button>
          )}

          {/* Header Night Mode Display Option Toggle Button */}
          <button
            onClick={onToggleNightMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer shadow-xs ${
              isNightMode
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700/80 hover:bg-indigo-900'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title={isNightMode ? 'Switch to Daylight Display' : 'Switch to Night Mode Display'}
            aria-label="Toggle Night Mode Display"
          >
            {isNightMode ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Night Mode:</span>
                <span className="font-bold text-indigo-300">ON</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Night Mode:</span>
                <span className="font-bold text-slate-500">OFF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

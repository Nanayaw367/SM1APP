import React from 'react';
import { 
  Tablet, 
  Wrench, 
  Package, 
  FileSpreadsheet, 
  QrCode, 
  BarChart3, 
  RefreshCw, 
  ShieldCheck,
  Clock,
  Moon,
  Sun,
  Plus,
  X,
  Layers,
  Sparkles,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { InventoryStats } from '../types/inventory';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: InventoryStats;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onOpenScanner: () => void;
  onOpenAddNewTabletModal: () => void;
  onResetData: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAndroidOfflineModal: () => void;
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  isNightMode,
  onToggleNightMode,
  onOpenScanner,
  onOpenAddNewTabletModal,
  onResetData,
  isMobileOpen,
  onCloseMobile,
  onOpenAndroidOfflineModal,
  isOnline,
  isInstalled,
  canInstall,
}) => {
  // Group 1: Core Fleet Management (Requested: Tablets & Assignees, Loan Status, Repair & Service)
  const coreFleetItems = [
    { 
      id: 'tablets', 
      label: 'Tablets & Assignees', 
      description: 'Fleet inventory, student roster & classes',
      icon: Tablet, 
      badge: stats.totalTablets,
      badgeColor: 'blue'
    },
    { 
      id: 'loans', 
      label: 'Loan Status', 
      description: 'Active 1:1 loans & bridge loaners',
      icon: Clock, 
      badge: stats.onLoanCount > 0 ? stats.onLoanCount : undefined,
      badgeColor: 'amber'
    },
    { 
      id: 'repairs', 
      label: 'Repair & Service', 
      description: 'Hardware tickets & service workbench',
      icon: Wrench, 
      badge: stats.openRepairsCount > 0 ? stats.openRepairsCount : undefined, 
      alert: stats.criticalRepairsCount > 0,
      badgeColor: 'rose'
    },
  ];

  // Group 2: Other Services & Utilities (Requested: "and other")
  const otherItems = [
    { 
      id: 'accessories', 
      label: 'Accessories & Kits', 
      description: 'Chargers, power banks, cables, cases',
      icon: Package, 
      badge: stats.lowStockAccessoriesCount > 0 ? 'Low Stock' : undefined, 
      alert: stats.lowStockAccessoriesCount > 0,
      badgeColor: 'purple'
    },
    { 
      id: 'csv', 
      label: 'Bulk CSV Deploy & Export', 
      description: 'Batch upload & Year/Class scope exports',
      icon: FileSpreadsheet, 
      highlight: true 
    },
    { 
      id: 'dashboard', 
      label: 'Analytics & Overview', 
      description: 'Depot metrics & program distribution',
      icon: BarChart3 
    },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Left Side Panel Container */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20 shrink-0">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  EduTab
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-300 border border-blue-700/60 uppercase tracking-wider">
                  KATON
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                High School Fleet Depot
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fleet MDM Status Strip */}
        <div className="px-4 py-2 bg-slate-950/60 dark:bg-black/50 border-b border-slate-800/70 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KATON MDM Enforced</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400 font-semibold">
            {stats.assignedCount + stats.onLoanCount}/{stats.totalTablets} Active
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {/* SECTION 1: CORE FLEET MANAGEMENT */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Fleet Operations</span>
              <span className="text-[9px] font-normal text-slate-500 lowercase">core modules</span>
            </div>

            <div className="space-y-1">
              {coreFleetItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group relative ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                              item.alert
                                ? 'bg-rose-500 text-white animate-pulse'
                                : isActive
                                ? 'bg-blue-800 text-blue-100 border border-blue-500'
                                : item.badgeColor === 'amber'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: OTHER SERVICES & UTILITIES */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Other Services</span>
              <span className="text-[9px] font-normal text-slate-500 lowercase">tools & kits</span>
            </div>

            <div className="space-y-1">
              {otherItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group relative ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                              item.alert
                                ? 'bg-rose-500 text-white animate-pulse'
                                : isActive
                                ? 'bg-blue-800 text-blue-100 border border-blue-500'
                                : 'bg-purple-950 text-purple-300 border border-purple-800/80'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.highlight && !isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            CSV
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ANDROID OFFLINE APP & LOCAL DB CARD */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-orange-950/40 to-slate-900 border border-orange-500/30 text-white space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-600/30 text-orange-400 border border-orange-500/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Android App</p>
                  <p className="text-[10px] text-orange-300/80">IndexedDB Engine</p>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                isInstalled
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-orange-950 text-orange-300 border-orange-800'
              }`}>
                {isInstalled ? 'Installed' : (isOnline ? 'Offline Ready' : 'Offline')}
              </span>
            </div>

            <button
              onClick={() => {
                onOpenAndroidOfflineModal();
                onCloseMobile();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Offline Database & APK</span>
            </button>
          </div>

          {/* SECTION 3: QUICK DEPOT ACTIONS */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Actions
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onOpenScanner();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Audit Scan / IMEI Lookup</span>
              </button>

              <button
                onClick={() => {
                  onOpenAddNewTabletModal();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Register Single Tablet</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: NIGHT MODE DISPLAY OPTION */}
        <div className="p-3 bg-slate-950/80 dark:bg-black/60 border-t border-slate-800/90 space-y-2.5">
          {/* Night Mode Display Option Interactive Card */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isNightMode 
                    ? 'bg-indigo-950 text-indigo-400 ring-1 ring-indigo-500/40' 
                    : 'bg-amber-950/70 text-amber-400 ring-1 ring-amber-500/30'
                }`}>
                  {isNightMode ? (
                    <Moon className="w-3.5 h-3.5" />
                  ) : (
                    <Sun className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-100">
                      Night Mode
                    </p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      isNightMode
                        ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-700'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isNightMode ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {isNightMode ? 'Dark OLED display' : 'Daylight theme'}
                  </p>
                </div>
              </div>

              {/* Interactive Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isNightMode}
                onClick={onToggleNightMode}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isNightMode ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                title="Toggle Night Mode display option"
              >
                <span className="sr-only">Toggle Night Mode Display Option</span>
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isNightMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Segmented Display Mode Buttons */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800/80 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  if (isNightMode) onToggleNightMode();
                }}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md font-medium transition cursor-pointer ${
                  !isNightMode
                    ? 'bg-slate-800 text-amber-300 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Daylight</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isNightMode) onToggleNightMode();
                }}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-md font-medium transition cursor-pointer ${
                  isNightMode
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Night Mode</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data & Meta */}
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <button
              onClick={onResetData}
              className="hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
              title="Reset inventory to original demo state"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono">
              KATON SM1 • v2.4
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

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
  Sparkles
} from 'lucide-react';
import { InventoryStats } from '../types/inventory';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: InventoryStats;
  onOpenScanner: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  onOpenScanner,
  onResetData,
}) => {
  const navItems = [
    { id: 'tablets', label: 'Tablets & Assignees', icon: Tablet, badge: stats.totalTablets },
    { id: 'loans', label: 'Loan Status', icon: Clock, badge: stats.onLoanCount > 0 ? stats.onLoanCount : undefined },
    { id: 'repairs', label: 'Repairs & Service', icon: Wrench, badge: stats.openRepairsCount > 0 ? stats.openRepairsCount : undefined, alert: stats.criticalRepairsCount > 0 },
    { id: 'accessories', label: 'Accessories', icon: Package, badge: stats.lowStockAccessoriesCount > 0 ? 'Low' : undefined, alert: stats.lowStockAccessoriesCount > 0 },
    { id: 'csv', label: 'Bulk CSV Deploy', icon: FileSpreadsheet, highlight: true },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  EduTab <span className="text-blue-400 font-semibold text-xs px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/80">KATON SM1 Fleet</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3" /> KATON MDM Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                High School Student 1:1 KATON SM1 Tablet & Accessories Inventory System
              </p>
            </div>
          </div>

          {/* Quick Actions & Audit Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm cursor-pointer"
              title="Quickly search or scan serial/IMEI"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Audit Scanner / Lookup</span>
            </button>

            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Reset data to sample high school dataset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            {/* Quick deployment pill button */}
            <button
              onClick={() => setActiveTab('csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bulk Deploy CSV</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      item.alert
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

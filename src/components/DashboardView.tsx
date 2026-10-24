import React, { useMemo } from 'react';
import { 
  TabletDevice, 
  RepairTicket, 
  AccessoryItem, 
  InventoryStats 
} from '../types/inventory';
import { 
  Tablet, 
  Wrench, 
  Clock, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  PieChart, 
  TrendingUp, 
  Building2, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Moon,
  Sun,
  Layers,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  tablets: TabletDevice[];
  repairs: RepairTicket[];
  accessories: AccessoryItem[];
  stats: InventoryStats;
  onNavigateTab: (tab: string) => void;
  onSelectTablet: (tablet: TabletDevice) => void;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tablets,
  repairs,
  accessories,
  stats,
  onNavigateTab,
  onSelectTablet,
  isNightMode = false,
  onToggleNightMode,
}) => {
  // Count tablets in repair that have maintained student assignees
  const inRepairAssignedCount = useMemo(() => {
    return tablets.filter(t => t.status === 'In Repair' && t.currentStudentName).length;
  }, [tablets]);

  // Academic program distribution (includes assigned, loaner, and in-repair with student)
  const programCounts = useMemo(() => {
    const map: Record<string, number> = {};
    tablets.forEach((t) => {
      if (t.status === 'Assigned' || t.status === 'On Loan' || (t.status === 'In Repair' && t.currentStudentName)) {
        const prog = t.currentStudentProgram || 'Other';
        map[prog] = (map[prog] || 0) + 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [tablets]);

  // Residence distribution (includes assigned, loaner, and in-repair with student)
  const residenceCounts = useMemo(() => {
    let boarding = 0;
    let day = 0;
    let hostel = 0;
    tablets.forEach((t) => {
      if (t.status === 'Assigned' || t.status === 'On Loan' || (t.status === 'In Repair' && t.currentStudentName)) {
        if (t.currentResidenceStatus === 'Boarding') boarding++;
        else if (t.currentResidenceStatus === 'Hostel') hostel++;
        else day++;
      }
    });
    return { boarding, day, hostel };
  }, [tablets]);

  // Active repairs requiring attention
  const urgentRepairs = useMemo(() => {
    return repairs
      .filter((r) => r.status !== 'Resolved' && r.status !== 'Decommissioned')
      .slice(0, 4);
  }, [repairs]);

  // Low stock accessories
  const lowAccessories = useMemo(() => {
    return accessories.filter((a) => a.availableQuantity <= a.minimumThreshold);
  }, [accessories]);

  const deploymentRate = stats.totalTablets > 0
    ? Math.round(((stats.assignedCount + stats.onLoanCount) / stats.totalTablets) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Header with Night Mode Display Option */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              KATON SM1 Campus Fleet & Peripherals Analytics
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Left Panel Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time deployment health for KATON SM1 tablets (Manufactured by KATON), active loaners, repair turnaround, and student residence distribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Night Mode Display Option Toggle in Dashboard */}
          {onToggleNightMode && (
            <button
              onClick={onToggleNightMode}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer shadow-xs ${
                isNightMode
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700/80 hover:bg-indigo-900'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Toggle Night Mode display theme"
            >
              {isNightMode ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Night Mode: <strong className="text-indigo-200">Active</strong></span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Night Mode: <strong className="text-slate-600">Daylight</strong></span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onNavigateTab('csv')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Bulk CSV Deploy</span>
          </button>
        </div>
      </div>

      {/* Left Side Panel Modules Quick Access Hub */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Left Side Panel Modules Quick Navigation
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click any section to switch depot views
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Module 1: Tablets & Assignees */}
          <button
            onClick={() => onNavigateTab('tablets')}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer text-left group shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Tablet className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Tablets & Assignees
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {stats.totalTablets} devices enrolled • {stats.assignedCount} assigned to students
            </p>
          </button>

          {/* Module 2: Loan Status */}
          <button
            onClick={() => onNavigateTab('loans')}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-amber-50/50 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition cursor-pointer text-left group shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  Loan Status
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {stats.onLoanCount} temporary loaners • {stats.availableCount} available pool
            </p>
          </button>

          {/* Module 3: Repair & Service */}
          <button
            onClick={() => onNavigateTab('repairs')}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-rose-50/50 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 transition cursor-pointer text-left group shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
                  Repair & Service
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {stats.openRepairsCount} open tickets • {inRepairAssignedCount} assignees retained
            </p>
          </button>

          {/* Module 4: Other Services (Accessories & CSV) */}
          <button
            onClick={() => onNavigateTab('accessories')}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-purple-50/50 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer text-left group shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Other Services
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {stats.totalAccessories} accessories in catalog • CSV batch tool
            </p>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tablets */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Enrolled Fleet</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Tablet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTablets}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{deploymentRate}% deployed</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${deploymentRate}%` }} />
          </div>
        </div>

        {/* Active Deployments & Loans */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Student Deployments</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.assignedCount}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">+{stats.onLoanCount} temporary</span>
            {inRepairAssignedCount > 0 && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold" title="Student assignees retained during repair">
                +{inRepairAssignedCount} in repair
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {stats.availableCount} available in depot storage
          </p>
        </div>

        {/* Repair Workshop */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Open Repair Tickets</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.openRepairsCount}</span>
            {stats.criticalRepairsCount > 0 && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                {stats.criticalRepairsCount} critical
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Hardware maintenance workbench
          </p>
        </div>

        {/* Low Stock Buffer */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Accessory Stock Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lowStockAccessoriesCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">categories below buffer</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {stats.totalAccessories} total units in catalog
          </p>
        </div>
      </div>

      {/* Program Breakdown and Residence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Program Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Tablets Deployed by Academic Program
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Total: {stats.assignedCount + stats.onLoanCount + inRepairAssignedCount}
            </span>
          </div>

          <div className="space-y-3">
            {programCounts.map(([program, count]) => {
              const totalActive = stats.assignedCount + stats.onLoanCount + inRepairAssignedCount || 1;
              const max = Math.max(...programCounts.map(p => p[1]), 1);
              const pct = Math.round((count / totalActive) * 100);

              return (
                <div key={program} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{program}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{count} tablets ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Residence Status Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Student Residence Demographics
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">Boarding vs Day Students</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center space-y-1">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 block">Boarders</span>
              <span className="text-2xl font-bold text-indigo-950 dark:text-indigo-100">{residenceCounts.boarding}</span>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">On-Campus Halls</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Day Students</span>
              <span className="text-2xl font-bold text-slate-950 dark:text-slate-100">{residenceCounts.day}</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Commuting Daily</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center space-y-1">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 block">Hostellers</span>
              <span className="text-2xl font-bold text-purple-950 dark:text-purple-100">{residenceCounts.hostel}</span>
              <p className="text-[10px] text-purple-600 dark:text-purple-400">Affiliated Lodging</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Knox MDM Location Policy
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Boarding tablets are enrolled in evening curfew sleep-mode profiles (10:00 PM - 5:30 AM). Day students possess external Wi-Fi bypass profiles.
            </p>
          </div>
        </div>
      </div>

      {/* Urgent Action Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Repairs Feed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              Active Maintenance Workbench ({urgentRepairs.length})
            </h3>
            <button
              onClick={() => onNavigateTab('repairs')}
              className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Repairs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentRepairs.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No active repair tickets pending.</p>
          ) : (
            <div className="space-y-2">
              {urgentRepairs.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{r.serialNumber}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        {r.issueType}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Student: {r.studentName || 'Unassigned'} • Tech: {r.technicianName || 'Pending'}
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700/80 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-600">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Accessories Feed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Accessories Alerts ({lowAccessories.length})
            </h3>
            <button
              onClick={() => onNavigateTab('accessories')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowAccessories.length === 0 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 py-4 text-center font-medium">
              All accessory inventory stocks are healthy and above minimum thresholds.
            </p>
          ) : (
            <div className="space-y-2">
              {lowAccessories.map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-amber-950 dark:text-amber-200">{a.name}</p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-400">Bin: {a.storageBin} • Compatibility: {a.modelCompatibility}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 block">
                      {a.availableQuantity} left
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Min buffer: {a.minimumThreshold}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

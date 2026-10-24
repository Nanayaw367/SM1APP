import React, { useState, useMemo } from 'react';
import { TabletDevice } from '../types/inventory';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRightLeft, 
  Calendar, 
  User, 
  Tablet, 
  Search, 
  Plus, 
  ShieldCheck, 
  FileSpreadsheet,
  Wrench,
  UserX,
  Trash2
} from 'lucide-react';
import { downloadCsvFile } from '../utils/csvUtils';
import { SCHOOL_CLASSES, SCHOOL_YEAR_LEVELS, inferYearLevelFromClass } from '../data/mockData';

interface LoanStatusViewProps {
  tablets: TabletDevice[];
  onSelectTablet: (tablet: TabletDevice) => void;
  onOpenAssignModal: (tablet: TabletDevice) => void;
  onOpenCheckInModal: (tablet: TabletDevice) => void;
  onRemoveAssignee?: (tabletId: string) => void;
}

export const LoanStatusView: React.FC<LoanStatusViewProps> = ({
  tablets,
  onSelectTablet,
  onOpenAssignModal,
  onOpenCheckInModal,
  onRemoveAssignee,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'temporary' | 'standard' | 'available' | 'inRepair'>('all');
  const [yearLevelFilter, setYearLevelFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const availableClasses = useMemo(() => {
    const classSet = new Set<string>(SCHOOL_CLASSES);
    tablets.forEach((t) => {
      if (t.currentStudentClass) classSet.add(t.currentStudentClass);
    });
    return Array.from(classSet).sort((a, b) => a.localeCompare(b));
  }, [tablets]);

  const loanStats = useMemo(() => {
    const assigned = tablets.filter(t => t.status === 'Assigned');
    const onLoan = tablets.filter(t => t.status === 'On Loan');
    const available = tablets.filter(t => t.status === 'Available');
    const inRepair = tablets.filter(t => t.status === 'In Repair');
    const inRepairWithStudent = inRepair.filter(t => t.currentStudentName);

    return {
      totalActiveDeployments: assigned.length + onLoan.length + inRepairWithStudent.length,
      assignedCount: assigned.length,
      temporaryLoanersCount: onLoan.length,
      availablePoolCount: available.length,
      inRepairCount: inRepair.length,
      inRepairWithStudentCount: inRepairWithStudent.length,
    };
  }, [tablets]);

  const loanList = useMemo(() => {
    return tablets.filter((t) => {
      if (filterType === 'temporary') return t.status === 'On Loan';
      if (filterType === 'standard') return t.status === 'Assigned';
      if (filterType === 'available') return t.status === 'Available';
      if (filterType === 'inRepair') return t.status === 'In Repair';
      // 'all' includes assigned, on loan, available, and in repair
      return true;
    }).filter((t) => {
      if (yearLevelFilter !== 'all') {
        const y = t.currentStudentYearLevel || inferYearLevelFromClass(t.currentStudentClass);
        if (yearLevelFilter === 'none') {
          if (t.currentStudentName) return false;
        } else {
          if (y !== yearLevelFilter) return false;
        }
      }
      return true;
    }).filter((t) => {
      if (classFilter !== 'all') {
        if (classFilter === 'none') {
          if (t.currentStudentClass) return false;
        } else {
          if (t.currentStudentClass !== classFilter) return false;
        }
      }
      return true;
    }).filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const resolvedYear = t.currentStudentYearLevel || inferYearLevelFromClass(t.currentStudentClass);
      return (
        t.serialNumber.toLowerCase().includes(q) ||
        t.imeiNumber.toLowerCase().includes(q) ||
        (t.currentStudentName && t.currentStudentName.toLowerCase().includes(q)) ||
        (resolvedYear && resolvedYear.toLowerCase().includes(q)) ||
        (t.currentStudentClass && t.currentStudentClass.toLowerCase().includes(q)) ||
        (t.currentStudentProgram && t.currentStudentProgram.toLowerCase().includes(q)) ||
        t.model.toLowerCase().includes(q)
      );
    });
  }, [tablets, filterType, yearLevelFilter, classFilter, searchQuery]);

  const exportLoanReport = () => {
    const headers = [
      'Loan Type',
      'Student Name',
      'Year Level',
      'Program',
      'Class',
      'Residence Status',
      'Serial Number',
      'IMEI Number',
      'Model',
      'Assigned Date',
      'Expected Return',
      'Accessories Issued',
      'Status'
    ];

    const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
    const rows = loanList.map(t => [
      escape(t.status === 'On Loan' ? 'Temporary Loaner' : t.status === 'Assigned' ? 'Standard 1:1 Deployment' : 'In Storage Pool'),
      escape(t.currentStudentName || '—'),
      escape(t.currentStudentYearLevel || inferYearLevelFromClass(t.currentStudentClass) || '—'),
      escape(t.currentStudentProgram || '—'),
      escape(t.currentStudentClass || '—'),
      escape(t.currentResidenceStatus || '—'),
      escape(t.serialNumber),
      escape(t.imeiNumber),
      escape(t.model),
      escape(t.assignedDate || '—'),
      escape(t.expectedReturnDate || '—'),
      escape(t.assignedAccessories?.join('; ') || 'None'),
      escape(t.status)
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsvFile(csv, `loan_status_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Student Tablet Loan Status & Dispatch
            <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
              {loanStats.totalActiveDeployments} Active Loans
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor active 1:1 tablet deployments, temporary bridge loaners, and inventory pool availability.
          </p>
        </div>

        <button
          onClick={exportLoanReport}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Export Loan Report (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Standard Deployments
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{loanStats.assignedCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Full-term student assignments</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Temporary Loaners
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{loanStats.temporaryLoanersCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Bridge units during repair</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Tablet className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Available Pool
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{loanStats.availablePoolCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">In depot ready for checkout</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" /> Units Under Service
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{loanStats.inRepairCount}</span>
            {loanStats.inRepairWithStudentCount > 0 && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">({loanStats.inRepairWithStudentCount} assigned)</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Student assignees maintained</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between transition-colors">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Deployments ({loanStats.totalActiveDeployments + loanStats.availablePoolCount})
          </button>
          <button
            onClick={() => setFilterType('standard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterType === 'standard'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Standard Deployments ({loanStats.assignedCount})
          </button>
          <button
            onClick={() => setFilterType('temporary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterType === 'temporary'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Temporary Loaners ({loanStats.temporaryLoanersCount})
          </button>
          <button
            onClick={() => setFilterType('inRepair')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterType === 'inRepair'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Under Repair ({loanStats.inRepairCount})
          </button>
          <button
            onClick={() => setFilterType('available')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterType === 'available'
                ? 'bg-slate-850 dark:bg-slate-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Available Pool ({loanStats.availablePoolCount})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <select
            value={yearLevelFilter}
            onChange={(e) => setYearLevelFilter(e.target.value)}
            className="w-full sm:w-36 py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-medium"
          >
            <option value="all">All Year Levels</option>
            <option value="none">No Year / Pool</option>
            {SCHOOL_YEAR_LEVELS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full sm:w-44 py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-medium"
          >
            <option value="all">All Student Classes</option>
            <option value="none">No Class Assigned</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <div className="w-full sm:w-60 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, serial, IMEI..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Grid of Loan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loanList.map((tablet) => {
          const isTemp = tablet.status === 'On Loan';
          const isStandard = tablet.status === 'Assigned';
          const isAvail = tablet.status === 'Available';
          const isRepair = tablet.status === 'In Repair';

          return (
            <div
              key={tablet.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-2xs space-y-3 transition hover:shadow-md ${
                isTemp
                  ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-100 dark:ring-amber-950'
                  : isStandard
                  ? 'border-slate-200 dark:border-slate-800'
                  : isRepair
                  ? 'border-orange-300 dark:border-orange-800/80 bg-orange-50/15 dark:bg-orange-950/20 ring-1 ring-orange-100 dark:ring-orange-950'
                  : 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isTemp
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : isStandard
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : isRepair
                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                  }`}
                >
                  {isTemp
                    ? 'Temporary Loan'
                    : isStandard
                    ? 'Active 1:1 Loan'
                    : isRepair
                    ? `In Repair ${tablet.currentStudentName ? '(Assignee Retained)' : '(Pool)'}`
                    : 'Available in Depot'}
                </span>

                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                  {tablet.assetTag}
                </span>
              </div>

              {/* Student Information */}
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {isRepair && tablet.currentStudentName ? 'Maintained Student Assignee:' : 'Borrower / Student:'}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {tablet.currentStudentName || 'Available in Inventory Pool'}
                  </p>
                  {isRepair && tablet.currentStudentName && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                      Retained in Repair
                    </span>
                  )}
                </div>
                {tablet.currentStudentClass && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {tablet.currentStudentYearLevel || inferYearLevelFromClass(tablet.currentStudentClass) || 'Year 1'}
                    </span>
                    <span>
                      {tablet.currentStudentClass} • {tablet.currentStudentProgram} ({tablet.currentResidenceStatus})
                    </span>
                  </div>
                )}
              </div>

              {/* Hardware specifications */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between font-sans">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{tablet.model || 'KATON SM1'}</p>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                    KATON
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">S/N: {tablet.serialNumber}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">IMEI: {tablet.imeiNumber}</p>
              </div>

              {/* Dates */}
              {tablet.assignedDate && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Issued: {tablet.assignedDate}</span>
                  <span>Return: {tablet.expectedReturnDate || 'Academic Year'}</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onSelectTablet(tablet)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  View Details & History
                </button>

                {isAvail ? (
                  <button
                    onClick={() => onOpenAssignModal(tablet)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Issue Loan
                  </button>
                ) : isRepair ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 inline-flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                    Under Service
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenCheckInModal(tablet)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Check In / Return
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

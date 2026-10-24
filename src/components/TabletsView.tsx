import React, { useState, useMemo } from 'react';
import { 
  TabletDevice, 
  TabletStatus, 
  ResidenceStatus 
} from '../types/inventory';
import { SCHOOL_PROGRAMS, SCHOOL_CLASSES, SCHOOL_YEAR_LEVELS, inferYearLevelFromClass } from '../data/mockData';
import { 
  Search, 
  Filter, 
  Plus, 
  FileSpreadsheet, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  UserPlus, 
  RotateCcw, 
  Copy, 
  Check, 
  ChevronDown, 
  HelpCircle,
  Hash,
  Layers,
  ArrowUpDown,
  GraduationCap,
  X,
  Download,
  Trash2,
  UserX,
  AlertCircle
} from 'lucide-react';
import { downloadCsvFile, generateDeploymentsCsv } from '../utils/csvUtils';

interface TabletsViewProps {
  tablets: TabletDevice[];
  onSelectTablet: (tablet: TabletDevice) => void;
  onOpenAssignModal: (tablet: TabletDevice) => void;
  onOpenCheckInModal: (tablet: TabletDevice) => void;
  onOpenNewRepairModal: (tablet: TabletDevice) => void;
  onOpenAddNewTabletModal: () => void;
  onOpenCsvHub: () => void;
  onDeleteTablet?: (tabletId: string) => void;
  onBulkDeleteTablets?: (tabletIds: string[]) => void;
  onRemoveAssignee?: (tabletId: string) => void;
  onBulkRemoveAssignees?: (tabletIds: string[]) => void;
}

export const TabletsView: React.FC<TabletsViewProps> = ({
  tablets,
  onSelectTablet,
  onOpenAssignModal,
  onOpenCheckInModal,
  onOpenNewRepairModal,
  onOpenAddNewTabletModal,
  onOpenCsvHub,
  onDeleteTablet,
  onBulkDeleteTablets,
  onRemoveAssignee,
  onBulkRemoveAssignees,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearLevelFilter, setYearLevelFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [residenceFilter, setResidenceFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'serial' | 'class' | 'status'>('serial');
  
  // Confirmation states for delete and remove assignee operations
  const [tabletToDelete, setTabletToDelete] = useState<TabletDevice | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [tabletToRemoveAssignee, setTabletToRemoveAssignee] = useState<TabletDevice | null>(null);
  const [showBulkRemoveAssigneeConfirm, setShowBulkRemoveAssigneeConfirm] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const selectedWithAssigneeCount = useMemo(() => {
    return tablets.filter(t => selectedIds.has(t.id) && Boolean(t.currentStudentName)).length;
  }, [tablets, selectedIds]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract all unique classes sorted
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>(SCHOOL_CLASSES);
    tablets.forEach((t) => {
      if (t.currentStudentClass) classSet.add(t.currentStudentClass);
    });
    return Array.from(classSet).sort((a, b) => a.localeCompare(b));
  }, [tablets]);

  // Filtered tablets
  const filteredTablets = useMemo(() => {
    return tablets.filter((tablet) => {
      const resolvedYear = tablet.currentStudentYearLevel || inferYearLevelFromClass(tablet.currentStudentClass);

      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tablet.serialNumber.toLowerCase().includes(q) ||
        tablet.imeiNumber.toLowerCase().includes(q) ||
        (tablet.currentStudentName && tablet.currentStudentName.toLowerCase().includes(q)) ||
        (resolvedYear && resolvedYear.toLowerCase().includes(q)) ||
        (tablet.currentStudentClass && tablet.currentStudentClass.toLowerCase().includes(q)) ||
        (tablet.currentStudentProgram && tablet.currentStudentProgram.toLowerCase().includes(q)) ||
        tablet.model.toLowerCase().includes(q) ||
        tablet.assetTag.toLowerCase().includes(q);

      // Status
      const matchesStatus =
        statusFilter === 'all' || tablet.status === statusFilter;

      // Year Level Filter
      const matchesYear =
        yearLevelFilter === 'all'
          ? true
          : yearLevelFilter === 'none'
          ? !tablet.currentStudentName
          : resolvedYear === yearLevelFilter;

      // Program
      const matchesProgram =
        programFilter === 'all' ||
        (tablet.currentStudentProgram && tablet.currentStudentProgram === programFilter);

      // Class Filter
      const matchesClass =
        classFilter === 'all'
          ? true
          : classFilter === 'none'
          ? !tablet.currentStudentClass
          : tablet.currentStudentClass === classFilter;

      // Residence
      const matchesResidence =
        residenceFilter === 'all' ||
        (tablet.currentResidenceStatus && tablet.currentResidenceStatus === residenceFilter);

      return matchesSearch && matchesStatus && matchesYear && matchesProgram && matchesClass && matchesResidence;
    }).sort((a, b) => {
      let fieldA = '';
      let fieldB = '';
      if (sortBy === 'name') {
        fieldA = a.currentStudentName || 'ZZZ';
        fieldB = b.currentStudentName || 'ZZZ';
      } else if (sortBy === 'serial') {
        fieldA = a.serialNumber;
        fieldB = b.serialNumber;
      } else if (sortBy === 'class') {
        fieldA = a.currentStudentClass || 'ZZZ';
        fieldB = b.currentStudentClass || 'ZZZ';
      } else if (sortBy === 'status') {
        fieldA = a.status;
        fieldB = b.status;
      }

      return sortOrder === 'asc'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    });
  }, [tablets, searchQuery, statusFilter, yearLevelFilter, programFilter, classFilter, residenceFilter, sortBy, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTablets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTablets.map(t => t.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const exportSelectedCsv = () => {
    const toExport = tablets.filter(t => selectedIds.has(t.id));
    if (toExport.length === 0) return;
    const csv = generateDeploymentsCsv(toExport);
    downloadCsvFile(csv, `selected_tablets_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportAllFilteredCsv = () => {
    let suffix = 'filtered';
    if (yearLevelFilter !== 'all') {
      suffix += `_${yearLevelFilter.replace(/\s+/g, '_').toLowerCase()}`;
    }
    if (classFilter !== 'all') {
      suffix += `_class_${classFilter.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    }
    const csv = generateDeploymentsCsv(filteredTablets);
    downloadCsvFile(csv, `tablets_export_${suffix}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getStatusBadge = (status: TabletStatus) => {
    switch (status) {
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Assigned
          </span>
        );
      case 'On Loan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Temporary Loan
          </span>
        );
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> In Stock
          </span>
        );
      case 'In Repair':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <Wrench className="w-3 h-3 text-orange-600" /> In Repair
          </span>
        );
      case 'Lost/Stolen':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Lost / Stolen
          </span>
        );
      case 'Decommissioned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Decommissioned
          </span>
        );
    }
  };

  const getResidenceBadge = (res?: ResidenceStatus) => {
    if (!res) return null;
    if (res === 'Boarding') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          Boarding
        </span>
      );
    }
    if (res === 'Hostel') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Hostel
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        Day Student
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Tablet Deployments & Inventories
            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              {filteredTablets.length} {filteredTablets.length === 1 ? 'Device' : 'Devices'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track student assignments, IMEI/Serial registry, loan status, and historical maintenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCsvHub}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>CSV Import / Export</span>
          </button>

          <button
            onClick={exportAllFilteredCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Download CSV for currently filtered scope (respects Year Level and Class filters)"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export Filtered ({filteredTablets.length})</span>
          </button>

          <button
            onClick={onOpenAddNewTabletModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Tablet</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 md:col-span-3 xl:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, IMEI, serial number, class..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Loan Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Loan Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="On Loan">Temporary Loan</option>
              <option value="Available">In Stock (Available)</option>
              <option value="In Repair">In Repair</option>
              <option value="Lost/Stolen">Lost / Stolen</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>

          {/* Year Level Filter */}
          <div>
            <select
              value={yearLevelFilter}
              onChange={(e) => setYearLevelFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="all">All Year Levels</option>
              <option value="none">No Year (Depot Pool)</option>
              {SCHOOL_YEAR_LEVELS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Programs</option>
              {SCHOOL_PROGRAMS.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Classes / Forms</option>
              <option value="none">No Class Assigned (Depot)</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Residence Filter */}
          <div>
            <select
              value={residenceFilter}
              onChange={(e) => setResidenceFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Residence Status</option>
              <option value="Boarding">Boarding</option>
              <option value="Day">Day Student</option>
              <option value="Hostel">Hostel</option>
            </select>
          </div>
        </div>

        {/* Active filter badges / reset */}
        {(searchQuery || statusFilter !== 'all' || yearLevelFilter !== 'all' || programFilter !== 'all' || classFilter !== 'all' || residenceFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Filtered by:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {yearLevelFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                Year: {yearLevelFilter === 'none' ? 'No Year (Depot)' : yearLevelFilter}
                <button onClick={() => setYearLevelFilter('all')} className="hover:text-indigo-900 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {programFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Program: {programFilter}
                <button onClick={() => setProgramFilter('all')} className="hover:text-blue-900 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {classFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                Class: {classFilter === 'none' ? 'No Class Assigned' : classFilter}
                <button onClick={() => setClassFilter('all')} className="hover:text-purple-900 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {residenceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Residence: {residenceFilter}
                <button onClick={() => setResidenceFilter('all')} className="hover:text-blue-900 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setYearLevelFilter('all');
                setProgramFilter('all');
                setClassFilter('all');
                setResidenceFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold ml-auto cursor-pointer hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Batch selection bar if any selected */}
        {selectedIds.size > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{selectedIds.size}</span> tablets selected
              {selectedWithAssigneeCount > 0 && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ({selectedWithAssigneeCount} assigned)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={exportSelectedCsv}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer"
              >
                Export CSV
              </button>

              {selectedWithAssigneeCount > 0 && onBulkRemoveAssignees && (
                <button
                  type="button"
                  onClick={() => setShowBulkRemoveAssigneeConfirm(true)}
                  className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/70 dark:hover:bg-amber-900/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-medium transition cursor-pointer flex items-center gap-1"
                  title="Completely remove student assignees from selected tablets"
                >
                  <UserX className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Remove Assignees ({selectedWithAssigneeCount})</span>
                </button>
              )}

              {onBulkDeleteTablets && (
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium transition cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Permanently remove selected tablets from database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.size})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 font-medium cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Tablets Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredTablets.length > 0 &&
                      selectedIds.size === filteredTablets.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'serial') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('serial'); setSortOrder('asc'); }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Serial & IMEI</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">Device & Specs</th>
                <th
                  onClick={() => {
                    if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('name'); setSortOrder('asc'); }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Current Assignee</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'class') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('class'); setSortOrder('asc'); }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Year, Class & Program</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'status') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('status'); setSortOrder('asc'); }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Loan Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">Accessories</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTablets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-semibold text-slate-700 dark:text-slate-200">No tablets match your filters</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search criteria or clear your current filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setYearLevelFilter('all');
                          setClassFilter('all');
                          setProgramFilter('all');
                          setResidenceFilter('all');
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline pt-1 cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTablets.map((tablet) => {
                  const isSelected = selectedIds.has(tablet.id);
                  const isAssigned =
                    tablet.status === 'Assigned' || tablet.status === 'On Loan';
                  const hasAssignee = Boolean(tablet.currentStudentName);

                  return (
                    <tr
                      key={tablet.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isSelected ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(tablet.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Serial & IMEI */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-900 dark:text-white">
                            <span>{tablet.serialNumber}</span>
                            <button
                              onClick={() => handleCopy(tablet.serialNumber, `s-${tablet.id}`)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title="Copy Serial Number"
                            >
                              {copiedId === `s-${tablet.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <span>IMEI: {tablet.imeiNumber}</span>
                            <button
                              onClick={() => handleCopy(tablet.imeiNumber, `i-${tablet.id}`)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title="Copy IMEI Number"
                            >
                              {copiedId === `i-${tablet.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">
                            Tag: {tablet.assetTag}
                          </span>
                        </div>
                      </td>

                      {/* Device & Specs */}
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{tablet.model || 'KATON SM1'}</p>
                            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                              KATON
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{tablet.storage}</span>
                            <span>•</span>
                            <span
                              className={`font-medium ${
                                tablet.condition === 'Excellent'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : tablet.condition === 'Good'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : tablet.condition === 'Fair'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {tablet.condition}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Current Assignee (Student Name & Residence - Maintained even in repair) */}
                      <td className="p-3">
                        {hasAssignee ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {tablet.currentStudentName}
                              </p>
                              {tablet.status === 'In Repair' && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                                  title="Tablet currently undergoing repairs; student assignment retained"
                                >
                                  <Wrench className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400" />
                                  In Repair
                                </span>
                              )}
                            </div>
                            <div>{getResidenceBadge(tablet.currentResidenceStatus)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Unassigned (Pool)</span>
                        )}
                      </td>

                      {/* Program & Class */}
                      <td className="p-3">
                        {hasAssignee ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {tablet.currentStudentYearLevel || inferYearLevelFromClass(tablet.currentStudentClass) || 'Year 1'}
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {tablet.currentStudentClass || '—'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {tablet.currentStudentProgram || '—'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <div className="space-y-1">
                          {getStatusBadge(tablet.status)}
                          {tablet.assignedDate && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              Since {tablet.assignedDate}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Accessories */}
                      <td className="p-3">
                        {tablet.assignedAccessories && tablet.assignedAccessories.length > 0 ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                              <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              {tablet.assignedAccessories.length === 5 ? (
                                <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                  5-Piece Kit Complete
                                </span>
                              ) : (
                                <span>{tablet.assignedAccessories.length} items</span>
                              )}
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]" title={tablet.assignedAccessories.join(', ')}>
                              {tablet.assignedAccessories.join(' • ')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Depot / None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectTablet(tablet)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition cursor-pointer"
                            title="View tablet history, repairs and specs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {tablet.status === 'Available' && (
                            <button
                              onClick={() => onOpenAssignModal(tablet)}
                              className="px-2 py-1 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                              title="Assign tablet to student"
                            >
                              Assign
                            </button>
                          )}

                          {isAssigned && (
                            <button
                              onClick={() => onOpenCheckInModal(tablet)}
                              className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                              title="Check-in / Return tablet"
                            >
                              Return
                            </button>
                          )}

                          {tablet.status === 'In Repair' && (
                            <button
                              onClick={() => onSelectTablet(tablet)}
                              className="px-2 py-1 text-xs font-semibold rounded bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-800 transition cursor-pointer inline-flex items-center gap-1"
                              title={`In workshop repair (Student assignee retained: ${tablet.currentStudentName || 'Pool'})`}
                            >
                              <Wrench className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                              <span>In Repair</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenNewRepairModal(tablet)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/60 rounded-lg transition cursor-pointer"
                            title="Log Repair Ticket"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>

                          {hasAssignee && onRemoveAssignee && (
                            <button
                              type="button"
                              onClick={() => setTabletToRemoveAssignee(tablet)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition cursor-pointer"
                              title={`Remove student assignee (${tablet.currentStudentName})`}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}

                          {onDeleteTablet && (
                            <button
                              type="button"
                              onClick={() => setTabletToDelete(tablet)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                              title={`Delete tablet ${tablet.serialNumber} from database`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <span>
            Showing <strong className="text-slate-800 dark:text-white">{filteredTablets.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-white">{tablets.length}</strong> total tablet records
          </span>
          <button
            onClick={exportAllFilteredCsv}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Download filtered view as CSV
          </button>
        </div>
      </div>

      {/* CONFIRM MODAL 1: Single Tablet Deletion */}
      {tabletToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Tablet from Database?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This will permanently remove this tablet and its historical logs from the local database.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p><strong>Device:</strong> {tabletToDelete.model || 'KATON SM1'}</p>
              <p><strong>Serial Number:</strong> <span className="font-mono">{tabletToDelete.serialNumber}</span></p>
              <p><strong>IMEI:</strong> <span className="font-mono">{tabletToDelete.imeiNumber}</span></p>
              <p><strong>Asset Tag:</strong> <span className="font-mono">{tabletToDelete.assetTag}</span></p>
              {tabletToDelete.currentStudentName && (
                <p className="text-amber-700 dark:text-amber-400">
                  <strong>Assigned to:</strong> {tabletToDelete.currentStudentName} ({tabletToDelete.currentStudentClass})
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTabletToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTablet) {
                    onDeleteTablet(tabletToDelete.id);
                  }
                  setTabletToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Tablet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL 2: Bulk Tablet Deletion */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Permanently Delete {selectedIds.size} Tablets?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You are about to permanently delete <strong className="text-rose-600 dark:text-rose-400">{selectedIds.size}</strong> tablet devices and their associated records.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 bg-rose-50/50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
              This action cannot be undone. All selected hardware devices and history will be completely purged from your offline database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onBulkDeleteTablets) {
                    onBulkDeleteTablets(Array.from(selectedIds));
                  }
                  setSelectedIds(new Set());
                  setShowBulkDeleteConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedIds.size} Tablets</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL 3: Single Remove Assignee */}
      {tabletToRemoveAssignee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-amber-200 dark:border-amber-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Student Assignee?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Completely remove the current assignee record from this tablet.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs space-y-1">
              <p><strong>Student:</strong> {tabletToRemoveAssignee.currentStudentName}</p>
              <p><strong>Class:</strong> {tabletToRemoveAssignee.currentStudentClass} • {tabletToRemoveAssignee.currentStudentProgram}</p>
              <p><strong>Device Serial:</strong> <span className="font-mono">{tabletToRemoveAssignee.serialNumber}</span></p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                The tablet will be unassigned and immediately placed back in the <span className="font-bold text-emerald-600 dark:text-emerald-400">Available</span> fleet pool.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTabletToRemoveAssignee(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRemoveAssignee) {
                    onRemoveAssignee(tabletToRemoveAssignee.id);
                  }
                  setTabletToRemoveAssignee(null);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Remove Assignee</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL 4: Bulk Remove Assignees */}
      {showBulkRemoveAssigneeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-amber-200 dark:border-amber-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Assignees for {selectedWithAssigneeCount} Tablets?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Completely clear student assignment data from all selected units.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
              This will unassign <strong className="text-amber-800 dark:text-amber-300">{selectedWithAssigneeCount}</strong> students from their tablets and mark the devices as Available in your local inventory database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkRemoveAssigneeConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onBulkRemoveAssignees) {
                    onBulkRemoveAssignees(Array.from(selectedIds));
                  }
                  setShowBulkRemoveAssigneeConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Remove Assignees</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

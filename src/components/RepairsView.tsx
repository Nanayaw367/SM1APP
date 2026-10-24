import React, { useState, useMemo } from 'react';
import { 
  RepairTicket, 
  RepairStatus, 
  RepairPriority, 
  TabletDevice,
  RepairIssueType
} from '../types/inventory';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  DollarSign, 
  Filter, 
  User, 
  Tablet, 
  ChevronRight, 
  Send,
  FileSpreadsheet,
  PackageX,
  Edit3,
  ShieldAlert,
  Zap,
  BatteryCharging,
  Smartphone,
  Volume2,
  Camera,
  Wifi,
  Droplets,
  HelpCircle,
  CheckSquare,
  Square,
  Check,
  X,
  Layers,
  ListChecks
} from 'lucide-react';
import { downloadCsvFile } from '../utils/csvUtils';
import { EditRepairModal } from './EditRepairModal';
import { SCHOOL_CLASSES, SCHOOL_YEAR_LEVELS, inferYearLevelFromClass } from '../data/mockData';

interface RepairsViewProps {
  repairs: RepairTicket[];
  tablets: TabletDevice[];
  onUpdateRepairStatus: (ticketId: string, status: RepairStatus, techNotes?: string, cost?: number) => void;
  onBulkUpdateRepairStatus?: (ticketIds: string[], status: RepairStatus, techNotes?: string) => void;
  onUpdateTicket?: (updatedTicket: RepairTicket) => void;
  onOpenNewRepairModal: (preselectedTablet?: TabletDevice) => void;
  onSelectTablet: (tablet: TabletDevice) => void;
}

export const RepairsView: React.FC<RepairsViewProps> = ({
  repairs,
  tablets,
  onUpdateRepairStatus,
  onBulkUpdateRepairStatus,
  onUpdateTicket,
  onOpenNewRepairModal,
  onSelectTablet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [yearLevelFilter, setYearLevelFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [hardwareIssueFilter, setHardwareIssueFilter] = useState<string>('all');
  const [missingAccessoryFilter, setMissingAccessoryFilter] = useState<string>('all');
  
  // Bulk selection state
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<RepairStatus>('Resolved');
  const [bulkTechNotes, setBulkTechNotes] = useState('');
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);

  // State for editing a ticket's hardware issues and missing accessories
  const [editingTicket, setEditingTicket] = useState<RepairTicket | null>(null);

  const availableClasses = useMemo(() => {
    const classSet = new Set<string>(SCHOOL_CLASSES);
    repairs.forEach((r) => {
      if (r.studentClass) classSet.add(r.studentClass);
    });
    tablets.forEach((t) => {
      if (t.currentStudentClass) classSet.add(t.currentStudentClass);
    });
    return Array.from(classSet).sort((a, b) => a.localeCompare(b));
  }, [repairs, tablets]);

  const stats = useMemo(() => {
    const total = repairs.length;
    const open = repairs.filter(r => r.status !== 'Resolved' && r.status !== 'Decommissioned').length;
    const inRepair = repairs.filter(r => r.status === 'In Repair' || r.status === 'In Progress' || r.status === 'In Diagnosis').length;
    const awaitingParts = repairs.filter(r => r.status === 'Awaiting Parts').length;
    const withMissingAccessories = repairs.filter(r => r.missingAccessories && r.missingAccessories.length > 0).length;
    const totalHwCost = repairs.reduce((acc, curr) => acc + (curr.repairCost || 0), 0);
    const totalAccCost = repairs.reduce((acc, curr) => acc + (curr.accessoryReplacementCost || 0), 0);
    const totalCost = totalHwCost + totalAccCost;

    return { total, open, inRepair, awaitingParts, withMissingAccessories, totalCost };
  }, [repairs]);

  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      const resolvedYear = r.studentYearLevel || inferYearLevelFromClass(r.studentClass);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.serialNumber.toLowerCase().includes(q) ||
        r.imeiNumber.toLowerCase().includes(q) ||
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (resolvedYear && resolvedYear.toLowerCase().includes(q)) ||
        (r.studentClass && r.studentClass.toLowerCase().includes(q)) ||
        (r.issueType && r.issueType.toLowerCase().includes(q)) ||
        (r.hardwareIssues && r.hardwareIssues.some(i => i.toLowerCase().includes(q))) ||
        (r.missingAccessories && r.missingAccessories.some(a => a.toLowerCase().includes(q))) ||
        r.description.toLowerCase().includes(q) ||
        (r.technicianName && r.technicianName.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        r.status === statusFilter ||
        (statusFilter === 'In Progress' && (r.status === 'In Progress' || r.status === 'In Repair')) ||
        (statusFilter === 'In Repair' && (r.status === 'In Repair' || r.status === 'In Progress'));
      const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;

      // Filter by student year level
      const matchesYear =
        yearLevelFilter === 'all'
          ? true
          : yearLevelFilter === 'none'
          ? !r.studentName
          : resolvedYear === yearLevelFilter;

      // Filter by student class
      const matchesClass =
        classFilter === 'all'
          ? true
          : classFilter === 'none'
          ? !r.studentClass
          : r.studentClass === classFilter;

      // Filter by specific hardware issue
      const matchesHardware = 
        hardwareIssueFilter === 'all' || 
        (r.hardwareIssues && r.hardwareIssues.includes(hardwareIssueFilter as RepairIssueType)) ||
        (r.issueType && r.issueType.toLowerCase().includes(hardwareIssueFilter.toLowerCase()));

      // Filter by missing accessory
      const matchesMissingAccessory = 
        missingAccessoryFilter === 'all' ||
        (missingAccessoryFilter === 'any_missing' && r.missingAccessories && r.missingAccessories.length > 0) ||
        (missingAccessoryFilter === 'none_missing' && (!r.missingAccessories || r.missingAccessories.length === 0)) ||
        (r.missingAccessories && r.missingAccessories.includes(missingAccessoryFilter));

      return matchesSearch && matchesStatus && matchesPriority && matchesYear && matchesClass && matchesHardware && matchesMissingAccessory;
    });
  }, [repairs, searchQuery, statusFilter, priorityFilter, yearLevelFilter, classFilter, hardwareIssueFilter, missingAccessoryFilter]);

  const isAllFilteredSelected = filteredRepairs.length > 0 && filteredRepairs.every(r => selectedTicketIds.includes(r.id));
  const someFilteredSelected = filteredRepairs.some(r => selectedTicketIds.includes(r.id)) && !isAllFilteredSelected;

  const toggleSelectTicket = (ticketId: string) => {
    setSelectedTicketIds(prev => 
      prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredRepairs.map(r => r.id));
      setSelectedTicketIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const newSelected = new Set(selectedTicketIds);
      filteredRepairs.forEach(r => newSelected.add(r.id));
      setSelectedTicketIds(Array.from(newSelected));
    }
  };

  const handleClearSelection = () => {
    setSelectedTicketIds([]);
  };

  const handleBulkStatusTransition = (status: RepairStatus, customNotes?: string) => {
    if (selectedTicketIds.length === 0) return;

    if (onBulkUpdateRepairStatus) {
      onBulkUpdateRepairStatus(selectedTicketIds, status, customNotes);
    } else {
      selectedTicketIds.forEach(id => {
        onUpdateRepairStatus(id, status, customNotes);
      });
    }

    const count = selectedTicketIds.length;
    setBulkSuccessMessage(
      `Successfully transitioned ${count} ticket${count > 1 ? 's' : ''} to "${status}"!`
    );
    setSelectedTicketIds([]);
    setBulkModalOpen(false);
    setBulkTechNotes('');

    setTimeout(() => {
      setBulkSuccessMessage(null);
    }, 4500);
  };

  const exportRepairsCsv = () => {
    const headers = [
      'Ticket ID',
      'Serial Number',
      'IMEI Number',
      'Model',
      'Student Name',
      'Year Level',
      'Class',
      'Hardware Issues',
      'Missing Accessories',
      'Priority',
      'Status',
      'Reported Date',
      'Resolved Date',
      'Hardware Repair Cost ($)',
      'Accessory Replacement Cost ($)',
      'Total Cost ($)',
      'Technician',
      'Technician Notes',
      'Loaner Unit'
    ];

    const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = filteredRepairs.map(r => {
      const hwIssues = r.hardwareIssues && r.hardwareIssues.length > 0 
        ? r.hardwareIssues.join('; ') 
        : (r.issueType || 'General Service');
      const missingAcc = r.missingAccessories && r.missingAccessories.length > 0 
        ? r.missingAccessories.join('; ') 
        : 'None';
      const hwCost = r.repairCost || 0;
      const accCost = r.accessoryReplacementCost || 0;
      const total = hwCost + accCost;

      return [
        escape(r.id),
        escape(r.serialNumber),
        escape(r.imeiNumber),
        escape(r.model),
        escape(r.studentName),
        escape(r.studentYearLevel || inferYearLevelFromClass(r.studentClass) || '—'),
        escape(r.studentClass),
        escape(hwIssues),
        escape(missingAcc),
        escape(r.priority),
        escape(r.status),
        escape(r.reportedDate),
        escape(r.resolvedDate),
        escape(hwCost.toFixed(2)),
        escape(accCost.toFixed(2)),
        escape(total.toFixed(2)),
        escape(r.technicianName),
        escape(r.technicianNotes),
        escape(r.loanerTabletSerial)
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsvFile(csv, `edutab_repairs_service_log_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getPriorityBadge = (priority: RepairPriority) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-300">Critical</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700 border border-orange-300">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-100 text-amber-700 border border-amber-300">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-100 text-slate-700 border border-slate-300">Low</span>;
    }
  };

  const getHardwareIcon = (issue: string) => {
    const l = issue.toLowerCase();
    if (l.includes('screen') || l.includes('digitizer')) return <Smartphone className="w-3.5 h-3.5 text-orange-600" />;
    if (l.includes('charging') || l.includes('port')) return <Zap className="w-3.5 h-3.5 text-amber-600" />;
    if (l.includes('battery')) return <BatteryCharging className="w-3.5 h-3.5 text-yellow-600" />;
    if (l.includes('water') || l.includes('liquid')) return <Droplets className="w-3.5 h-3.5 text-sky-600" />;
    if (l.includes('audio') || l.includes('mic') || l.includes('speaker')) return <Volume2 className="w-3.5 h-3.5 text-purple-600" />;
    if (l.includes('camera')) return <Camera className="w-3.5 h-3.5 text-indigo-600" />;
    if (l.includes('wi-fi') || l.includes('connectivity')) return <Wifi className="w-3.5 h-3.5 text-blue-600" />;
    if (l.includes('chassis') || l.includes('frame')) return <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />;
    return <Wrench className="w-3.5 h-3.5 text-slate-600" />;
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Tablet Repairs & Service Log
            <span className="text-xs font-semibold bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
              {stats.open} Active Tickets
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Admin console for tracking student hardware tickets, selecting multiple faults, logging missing accessories, and technician repairs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportRepairsCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Export Repairs CSV</span>
          </button>

          <button
            onClick={() => onOpenNewRepairModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Repair Issue</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" /> Open Tickets
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.open}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Require technician action</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-500" /> On Workbench
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inRepair}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Active diagnosis or repair</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <PackageX className="w-3.5 h-3.5 text-rose-500" /> Missing Accessories
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.withMissingAccessories}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Tickets with unreturned items</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Incurred Costs
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalCost.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Hardware parts + missing fees</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search serial, student, faults, accessories, tech..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer font-medium"
            >
              <option value="all">All Ticket Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress (Active Work)</option>
              <option value="In Repair">In Repair</option>
              <option value="In Diagnosis">In Diagnosis</option>
              <option value="Awaiting Parts">Awaiting Parts</option>
              <option value="Repaired & Testing">Repaired & Testing</option>
              <option value="Resolved">Resolved</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={yearLevelFilter}
              onChange={(e) => setYearLevelFilter(e.target.value)}
              className="py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer font-medium"
            >
              <option value="all">All Year Levels</option>
              <option value="none">No Year Level</option>
              {SCHOOL_YEAR_LEVELS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Student Classes</option>
              <option value="none">No Class Assigned</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={hardwareIssueFilter}
              onChange={(e) => setHardwareIssueFilter(e.target.value)}
              className="py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Hardware Issues</option>
              <option value="Cracked Screen">Cracked Screen</option>
              <option value="Charging Port Fault">Charging Port Fault</option>
              <option value="Battery Depleted / Not Charging">Battery / Power</option>
              <option value="Software / OS Bootloop">Software / Bootloop</option>
              <option value="Physical Chassis Damage">Chassis Damage</option>
              <option value="Audio / Microphone Failure">Audio / Mic</option>
              <option value="Camera Malfunction">Camera</option>
              <option value="Wi-Fi / Connectivity Issue">Wi-Fi / Modem</option>
              <option value="Water Damage">Water Damage</option>
            </select>

            <select
              value={missingAccessoryFilter}
              onChange={(e) => setMissingAccessoryFilter(e.target.value)}
              className="py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Accessories Status</option>
              <option value="any_missing">⚠️ Has Missing Accessories</option>
              <option value="none_missing">✓ All Accessories Intact</option>
              <option value="Power Bank">Missing Power Bank</option>
              <option value="Earpiece">Missing Earpiece</option>
              <option value="USB Type-C Cable">Missing USB Cable</option>
              <option value="Keyboard Case">Missing Keyboard Case</option>
              <option value="Charger">Missing Charger</option>
            </select>
          </div>
        </div>

        {/* Active filters row */}
        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || yearLevelFilter !== 'all' || classFilter !== 'all' || hardwareIssueFilter !== 'all' || missingAccessoryFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Filtered by:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-medium">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-orange-900 dark:hover:text-orange-100 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-medium">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="hover:text-orange-900 dark:hover:text-orange-100 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-medium">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter('all')} className="hover:text-orange-900 dark:hover:text-orange-100 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {yearLevelFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                Year: {yearLevelFilter === 'none' ? 'No Year' : yearLevelFilter}
                <button onClick={() => setYearLevelFilter('all')} className="hover:text-indigo-900 dark:hover:text-indigo-100 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {classFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium">
                Class: {classFilter === 'none' ? 'No Class' : classFilter}
                <button onClick={() => setClassFilter('all')} className="hover:text-purple-900 dark:hover:text-purple-100 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {hardwareIssueFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-medium">
                Fault: {hardwareIssueFilter}
                <button onClick={() => setHardwareIssueFilter('all')} className="hover:text-orange-900 dark:hover:text-orange-100 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            {missingAccessoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
                Accessory: {missingAccessoryFilter}
                <button onClick={() => setMissingAccessoryFilter('all')} className="hover:text-amber-900 dark:hover:text-amber-100 ml-0.5 cursor-pointer">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setYearLevelFilter('all');
                setClassFilter('all');
                setHardwareIssueFilter('all');
                setMissingAccessoryFilter('all');
              }}
              className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 font-semibold ml-auto cursor-pointer hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Bulk Status Update Success Notification Banner */}
      {bulkSuccessMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 p-3.5 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{bulkSuccessMessage}</span>
          </div>
          <button
            onClick={() => setBulkSuccessMessage(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Action Header & Master Selection Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllFilteredSelected}
              ref={el => {
                if (el) el.indeterminate = someFilteredSelected;
              }}
              onChange={handleSelectAllFiltered}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAllFilteredSelected
                ? `All ${filteredRepairs.length} Tickets Selected`
                : `Select All (${filteredRepairs.length} Visible Tickets)`}
            </span>
          </label>

          {selectedTicketIds.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
              <CheckSquare className="w-3.5 h-3.5" />
              {selectedTicketIds.length} Selected
            </span>
          )}
        </div>

        {selectedTicketIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
              Simultaneous Status:
            </span>

            {/* Direct Transition to In Progress */}
            <button
              type="button"
              onClick={() => handleBulkStatusTransition('In Progress')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition cursor-pointer active:scale-95"
              title="Transition all selected tickets to 'In Progress'"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mark In Progress</span>
            </button>

            {/* Direct Transition to Resolved */}
            <button
              type="button"
              onClick={() => handleBulkStatusTransition('Resolved')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer active:scale-95"
              title="Transition all selected tickets to 'Resolved'"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>

            {/* With Notes / Other Status Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                setBulkTargetStatus('In Progress');
                setBulkModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              title="Add technician log notes or choose another status"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>More Options & Notes</span>
            </button>

            {/* Deselect All */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              title="Clear selection"
            >
              Deselect
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Select multiple tickets using checkboxes to update them simultaneously</span>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar for easy access while scrolling */}
      {selectedTicketIds.length > 0 && (
        <div className="sticky top-2 z-20 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-xl shadow-xl border border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              {selectedTicketIds.length} {selectedTicketIds.length === 1 ? 'ticket' : 'tickets'} selected for bulk update
            </span>
            <span className="text-slate-500">|</span>
            <button
              onClick={handleSelectAllFiltered}
              className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
            >
              {isAllFilteredSelected ? 'Deselect all' : `Select all (${filteredRepairs.length})`}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatusTransition('In Progress')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition cursor-pointer active:scale-95 shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>To 'In Progress'</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkStatusTransition('Resolved')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer active:scale-95 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>To 'Resolved'</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBulkTargetStatus('Resolved');
                setBulkModalOpen(true);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Add technician log note"
            >
              <span>Notes...</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-3.5">
        {filteredRepairs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 transition-colors">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No repair tickets found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">All registered devices are in healthy condition or match no filters.</p>
          </div>
        ) : (
          filteredRepairs.map((ticket) => {
            const linkedTablet = tablets.find(t => t.id === ticket.tabletId || t.serialNumber === ticket.serialNumber);
            const isSelected = selectedTicketIds.includes(ticket.id);

            // Compute hardware issues list (support both array and legacy comma string)
            const issues: string[] = 
              ticket.hardwareIssues && ticket.hardwareIssues.length > 0 
                ? ticket.hardwareIssues 
                : ticket.issueType
                ? ticket.issueType.split(',').map(s => s.trim()).filter(Boolean)
                : ['Hardware Inspection'];

            const missingAccs = ticket.missingAccessories || [];
            const hwCost = ticket.repairCost || 0;
            const accCost = ticket.accessoryReplacementCost || 0;
            const totalCost = hwCost + accCost;

            return (
              <div
                key={ticket.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition shadow-2xs overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-orange-500 border-orange-500 dark:border-orange-500 bg-orange-50/15 dark:bg-orange-950/20'
                    : ticket.status === 'Resolved'
                    ? 'border-slate-200 dark:border-slate-800 opacity-90'
                    : ticket.priority === 'Critical'
                    ? 'border-red-300 dark:border-red-800/80 ring-1 ring-red-200 dark:ring-red-950'
                    : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700'
                }`}
              >
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Top Line: Selection Checkbox, Ticket ID, Serial, IMEI, Priority & Status Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Checkbox for bulk status selection */}
                      <label className="flex items-center gap-1.5 cursor-pointer mr-1 group">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTicket(ticket.id)}
                          className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                          aria-label={`Select ticket ${ticket.id}`}
                        />
                      </label>

                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {ticket.id.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        Device: {ticket.serialNumber}
                      </span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        IMEI: {ticket.imeiNumber}
                      </span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {ticket.model || 'KATON SM1'}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-400 font-medium">Status:</label>
                      <select
                        value={ticket.status}
                        onChange={(e) => onUpdateRepairStatus(ticket.id, e.target.value as RepairStatus)}
                        className={`text-xs font-semibold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-none ${
                          ticket.status === 'Resolved'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : (ticket.status === 'In Repair' || ticket.status === 'In Progress')
                            ? 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800'
                            : ticket.status === 'Awaiting Parts'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <option value="Reported">Reported</option>
                        <option value="In Progress">In Progress (Active Workbench)</option>
                        <option value="In Repair">In Repair</option>
                        <option value="In Diagnosis">In Diagnosis</option>
                        <option value="Awaiting Parts">Awaiting Parts</option>
                        <option value="Repaired & Testing">Repaired & Testing</option>
                        <option value="Resolved">Resolved (Back in Service)</option>
                        <option value="Decommissioned">Decommissioned (Scrapped)</option>
                      </select>
                    </div>
                  </div>

                  {/* Middle Content: Hardware Issues Chips & Missing Accessories */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-3">
                      {/* MULTIPLE HARDWARE ISSUES DISPLAY */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-orange-500" />
                            Hardware Faults ({issues.length} Identified):
                          </span>
                          <span className="text-[11px] text-slate-400">Reported on {ticket.reportedDate}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {issues.map((issueName, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-950/70 text-orange-900 dark:text-orange-200 border border-orange-200/80 dark:border-orange-800/80 shadow-2xs"
                            >
                              {getHardwareIcon(issueName)}
                              <span>{issueName}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* MULTIPLE MISSING ACCESSORIES DISPLAY */}
                      {missingAccs.length > 0 ? (
                        <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                              <PackageX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              Missing Student Accessories ({missingAccs.length} Unreturned)
                            </span>
                            <span className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-300">
                              Billed: ${accCost.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {missingAccs.map((acc, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 shadow-2xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                {acc}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>All 5 standard accessories returned intact (Power Bank, Earpiece, USB-C Cable, Keyboard Case, Charger)</span>
                        </div>
                      )}

                      {/* Description & Technician Log */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        {ticket.description}
                      </p>

                      {ticket.technicianNotes && (
                        <div className="text-xs bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/60">
                          <strong>Technician Log:</strong> {ticket.technicianNotes}
                        </div>
                      )}
                    </div>

                    {/* Right column: Student details, Technician info & Cost Breakdown */}
                    <div className="space-y-2 text-xs bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Affected Student:</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                          {ticket.studentName || 'Unassigned / Depot Pool'}
                        </span>
                        {ticket.studentClass && (
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {ticket.studentYearLevel || inferYearLevelFromClass(ticket.studentClass) || 'Year 1'}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 text-xs">
                              {ticket.studentClass}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Lead Technician:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {ticket.technicianName || 'Unassigned'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Cost Accounting:</span>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                          <span>Hardware Parts:</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">${hwCost.toFixed(2)}</span>
                        </div>
                        {accCost > 0 && (
                          <div className="flex justify-between text-rose-600 dark:text-rose-400 text-[11px]">
                            <span>Missing Accessories:</span>
                            <span className="font-mono">+${accCost.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span>Total Incurred:</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">${totalCost.toFixed(2)}</span>
                        </div>
                      </div>

                      {ticket.loanerTabletSerial && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400">
                          <span className="text-[10px] uppercase font-bold tracking-wider block">Bridge Loaner:</span>
                          <span className="font-mono font-bold">{ticket.loanerTabletSerial}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">
                    <div className="flex items-center gap-3">
                      {linkedTablet ? (
                        <button
                          onClick={() => onSelectTablet(linkedTablet)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Tablet className="w-3.5 h-3.5" />
                          <span>Inspect Full Device Record</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">Device record</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* BUTTON TO SELECT/EDIT MULTIPLE HARDWARE ISSUES & MISSING ACCESSORIES */}
                      <button
                        onClick={() => setEditingTicket(ticket)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        <span>Manage Issues & Accessories</span>
                      </button>

                      {/* QUICK STATUS TRANSITION: In Progress */}
                      {ticket.status !== 'In Progress' && ticket.status !== 'In Repair' && ticket.status !== 'Resolved' && (
                        <button
                          onClick={() => onUpdateRepairStatus(ticket.id, 'In Progress')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-900 border border-orange-300 dark:border-orange-800 transition cursor-pointer flex items-center gap-1"
                          title="Transition ticket to In Progress"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress</span>
                        </button>
                      )}

                      {/* QUICK STATUS TRANSITION: Resolved */}
                      {ticket.status !== 'Resolved' && (
                        <button
                          onClick={() => onUpdateRepairStatus(ticket.id, 'Resolved')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1"
                          title="Transition ticket to Resolved"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BULK STATUS UPDATE MODAL WITH NOTES */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  Bulk Status Update ({selectedTicketIds.length} Tickets)
                </h3>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Transition all <strong>{selectedTicketIds.length}</strong> selected tickets simultaneously to the chosen service status.
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
                  {selectedTicketIds.map(id => {
                    const ticket = repairs.find(r => r.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-200"
                      >
                        {id.toUpperCase()} • {ticket?.serialNumber || 'Device'}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Service Status *
                </label>
                <select
                  value={bulkTargetStatus}
                  onChange={(e) => setBulkTargetStatus(e.target.value as RepairStatus)}
                  className="w-full p-2.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="Resolved">Resolved (Ready for return / Back in Service)</option>
                  <option value="In Progress">In Progress (Active Bench Work / Servicing)</option>
                  <option value="In Repair">In Repair (Component replacement)</option>
                  <option value="In Diagnosis">In Diagnosis (Bench inspection)</option>
                  <option value="Awaiting Parts">Awaiting Parts (Vendor shipment)</option>
                  <option value="Repaired & Testing">Repaired & Testing (QA stage)</option>
                  <option value="Reported">Reported (Intake desk queue)</option>
                  <option value="Decommissioned">Decommissioned (Scrapped / salvaged)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Technician Log Note (Optional)
                </label>
                <textarea
                  value={bulkTechNotes}
                  onChange={(e) => setBulkTechNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Batch servicing completed. Diagnostics passed and hardware recalibrated."
                  className="w-full p-2.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This note will be recorded into each selected ticket's technician log.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkStatusTransition(bulkTargetStatus, bulkTechNotes || undefined)}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition cursor-pointer shadow-xs ${
                    bulkTargetStatus === 'Resolved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  Apply to {selectedTicketIds.length} Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Repair Modal for Updating Hardware Issues and Missing Accessories */}
      {editingTicket && (
        <EditRepairModal
          ticket={editingTicket}
          tablets={tablets}
          onClose={() => setEditingTicket(null)}
          onSave={(updated) => {
            if (onUpdateTicket) {
              onUpdateTicket(updated);
            } else {
              onUpdateRepairStatus(updated.id, updated.status, updated.technicianNotes, updated.repairCost);
            }
          }}
        />
      )}
    </div>
  );
};

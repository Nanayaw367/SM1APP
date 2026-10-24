import React, { useState } from 'react';
import { 
  TabletDevice, 
  RepairTicket, 
  AssignmentRecord,
  TabletStatus, 
  DeviceCondition,
  ResidenceStatus
} from '../types/inventory';
import { 
  X, 
  Tablet, 
  User, 
  History, 
  Wrench, 
  Package, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  Printer, 
  FileEdit,
  ArrowRight,
  Trash2,
  UserX,
  AlertCircle
} from 'lucide-react';

interface TabletDetailModalProps {
  tablet: TabletDevice | null;
  repairs: RepairTicket[];
  onClose: () => void;
  onOpenAssign: (tablet: TabletDevice) => void;
  onOpenCheckIn: (tablet: TabletDevice) => void;
  onOpenRepair: (tablet: TabletDevice) => void;
  onUpdateTabletNotes: (tabletId: string, notes: string) => void;
  onDeleteTablet?: (tabletId: string, deleteRelatedRepairs?: boolean) => void;
  onRemoveAssignee?: (tabletId: string) => void;
  onDeleteAssignmentHistoryRecord?: (tabletId: string, recordId: string) => void;
  onClearAllAssignmentHistory?: (tabletId: string) => void;
}

export const TabletDetailModal: React.FC<TabletDetailModalProps> = ({
  tablet,
  repairs,
  onClose,
  onOpenAssign,
  onOpenCheckIn,
  onOpenRepair,
  onUpdateTabletNotes,
  onDeleteTablet,
  onRemoveAssignee,
  onDeleteAssignmentHistoryRecord,
  onClearAllAssignmentHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'repairs' | 'barcode'>('overview');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Confirmation states for permanent removals
  const [showDeleteTabletModal, setShowDeleteTabletModal] = useState(false);
  const [deleteRepairsToo, setDeleteRepairsToo] = useState(true);
  const [showRemoveAssigneeModal, setShowRemoveAssigneeModal] = useState(false);
  const [historyRecordToDelete, setHistoryRecordToDelete] = useState<AssignmentRecord | null>(null);
  const [showClearAllHistoryModal, setShowClearAllHistoryModal] = useState(false);

  if (!tablet) return null;

  const tabletRepairs = repairs.filter(
    (r) => r.tabletId === tablet.id || r.serialNumber === tablet.serialNumber
  );

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNotes = () => {
    onUpdateTabletNotes(tablet.id, notesDraft);
    setIsEditingNotes(false);
  };

  const isAssigned = tablet.status === 'Assigned' || tablet.status === 'On Loan';
  const hasAssignee = Boolean(tablet.currentStudentName);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {tablet.model || 'KATON SM1'}
                </h2>
                <span className="text-xs font-mono bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700">
                  KATON
                </span>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {tablet.serialNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Manufacturer: <strong className="text-slate-300">KATON</strong></span>
                <span>•</span>
                <span>Model: <strong className="text-slate-300">SM1</strong></span>
                <span>•</span>
                <span>Asset Tag: <strong className="text-slate-300">{tablet.assetTag}</strong></span>
                <span>•</span>
                <span>IMEI: <strong className="text-slate-300">{tablet.imeiNumber}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Current Assignment & Specs</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Assignment History</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {tablet.assignmentHistory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('repairs')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'repairs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Repairs & Service</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                tabletRepairs.some(r => r.status !== 'Resolved')
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tabletRepairs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('barcode')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'barcode'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Asset Label</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Top Status & Specs Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <p className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Current Status</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {tablet.status === 'Assigned' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    {tablet.status === 'On Loan' && <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                    {tablet.status === 'In Repair' && <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                    {tablet.status === 'Available' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                    {tablet.status}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Physical Condition: <strong className="text-slate-700 dark:text-slate-200">{tablet.condition}</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <p className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Serial & Storage</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{tablet.serialNumber}</p>
                    <button
                      onClick={() => handleCopy(tablet.serialNumber, 'modal-serial')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {copiedField === 'modal-serial' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Capacity: <strong className="text-slate-700 dark:text-slate-200">{tablet.storage}</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <p className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">IMEI Registration</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{tablet.imeiNumber}</p>
                    <button
                      onClick={() => handleCopy(tablet.imeiNumber, 'modal-imei')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {copiedField === 'modal-imei' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cellular MDM Lock Enabled
                  </p>
                </div>
              </div>

              {/* Current Assignee Section - Maintained even in repair */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Current Student Assignment Details
                  </h3>
                  {tablet.status === 'In Repair' && hasAssignee && (
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-orange-600" />
                      In Repair (Assignee Maintained)
                    </span>
                  )}
                </div>

                {hasAssignee && tablet.currentStudentName ? (
                  <div className="space-y-3">
                    {tablet.status === 'In Repair' && (
                      <div className="p-3 rounded-lg bg-orange-50/80 border border-orange-200 text-xs text-orange-950 flex items-start gap-2.5">
                        <Wrench className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Device Currently Under Repair</p>
                          <p className="text-[11px] text-orange-900 mt-0.5 leading-relaxed">
                            <strong>{tablet.currentStudentName}</strong> ({tablet.currentStudentClass}) remains the designated student assignee during maintenance. Resolving the repair ticket will automatically restore active assignment.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Student Name</p>
                        <p className="text-sm font-bold text-slate-900">{tablet.currentStudentName}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Residence Status</p>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          tablet.currentResidenceStatus === 'Boarding'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : tablet.currentResidenceStatus === 'Hostel'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {tablet.currentResidenceStatus || 'Day Student'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Year Level</p>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {tablet.currentStudentYearLevel || 'Year 1'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Academic Program</p>
                        <p className="text-xs font-semibold text-slate-800">{tablet.currentStudentProgram || '—'}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Class / Form</p>
                        <p className="text-xs font-semibold text-slate-800">{tablet.currentStudentClass || '—'}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Deployment Date</p>
                        <p className="text-xs font-medium text-slate-700">{tablet.assignedDate || '—'}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Expected Return Term</p>
                        <p className="text-xs font-medium text-slate-700">{tablet.expectedReturnDate || 'End of Academic Year (June 2026)'}</p>
                      </div>
                    </div>

                    {onRemoveAssignee && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Completely unassign this student and return device to the Available pool
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowRemoveAssigneeModal(true)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Remove Assignee Record</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg text-center space-y-2">
                    <p className="text-xs text-slate-500">This tablet is currently unassigned and in storage.</p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAssign(tablet);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                    >
                      Assign Tablet to Student
                    </button>
                  </div>
                )}
              </div>

              {/* Assigned Accessories */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Student Peripherals & Accessories Kit (5 Items)
                  </h3>
                  {tablet.assignedAccessories && tablet.assignedAccessories.length === 5 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Full Kit Verified
                    </span>
                  )}
                </div>

                {tablet.assignedAccessories && tablet.assignedAccessories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {tablet.assignedAccessories.map((acc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{acc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No accessories currently issued to this tablet (depot unit).</p>
                )}
              </div>

              {/* Administrative Notes */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-blue-600" />
                    Admin Notes & Audit Remarks
                  </h3>
                  {!isEditingNotes && (
                    <button
                      onClick={() => {
                        setNotesDraft(tablet.notes || '');
                        setIsEditingNotes(true);
                      }}
                      className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      Edit Notes
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Add administrative notes, student accommodation requirements, or maintenance warnings..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {tablet.notes || 'No administrative notes entered.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNMENT HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historical Deployment Record</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track all past students who have borrowed or been assigned this tablet.
                  </p>
                </div>
                {tablet.assignmentHistory.length > 0 && onClearAllAssignmentHistory && (
                  <button
                    type="button"
                    onClick={() => setShowClearAllHistoryModal(true)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All History</span>
                  </button>
                )}
              </div>

              {tablet.assignmentHistory.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                  <History className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No prior assignment history logged</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When this device is returned and re-issued to future academic terms, complete historical logs will be preserved here.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {tablet.assignmentHistory.map((rec) => (
                    <div key={rec.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900 border border-blue-400"></span>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-2xs space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {rec.studentName}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                              ({rec.yearLevel ? `${rec.yearLevel} • ` : ''}{rec.classGroup} • {rec.program})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {rec.assignedDate} → {rec.returnedDate || 'Present'}
                            </span>
                            {onDeleteAssignmentHistoryRecord && (
                              <button
                                type="button"
                                onClick={() => setHistoryRecordToDelete(rec)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition cursor-pointer"
                                title="Delete this historical assignee record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <span className="text-slate-400 block">Residence:</span>
                            <strong className="text-slate-700">{rec.residenceStatus}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Out Condition:</span>
                            <strong className="text-slate-700">{rec.conditionAtCheckout}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Return Condition:</span>
                            <strong className="text-slate-700">{rec.conditionAtReturn || '—'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Logged By:</span>
                            <strong className="text-slate-700 truncate block">{rec.issuedBy}</strong>
                          </div>
                        </div>

                        {rec.returnNotes && (
                          <p className="text-xs text-slate-600 bg-amber-50/60 p-2 rounded border border-amber-200/60">
                            <strong className="text-amber-800">Return Inspection Note: </strong>
                            {rec.returnNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REPAIRS */}
          {activeTab === 'repairs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Repairs & Maintenance Log</h3>
                  <p className="text-xs text-slate-500">Hardware repairs, screen replacements, and OS maintenance tickets.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenRepair(tablet);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Log New Repair Ticket</span>
                </button>
              </div>

              {tabletRepairs.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No repair issues reported</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    This tablet has never undergone hardware maintenance or reported faults.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tabletRepairs.map((ticket) => {
                    const issues = ticket.hardwareIssues && ticket.hardwareIssues.length > 0
                      ? ticket.hardwareIssues
                      : ticket.issueType
                      ? ticket.issueType.split(',').map(s => s.trim()).filter(Boolean)
                      : ['Hardware Inspection'];

                    const missingAccs = ticket.missingAccessories || [];
                    const hwCost = ticket.repairCost || 0;
                    const accCost = ticket.accessoryReplacementCost || 0;

                    return (
                      <div key={ticket.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              ticket.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : ticket.status === 'In Repair'
                                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {ticket.status}
                            </span>
                            <span className="font-mono text-xs text-slate-500 font-bold">
                              {ticket.id.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            Reported: {ticket.reportedDate}
                          </span>
                        </div>

                        {/* Multiple Hardware Issues Badges */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Hardware Faults ({issues.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {issues.map((issueName, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200"
                              >
                                🔧 {issueName}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing Accessories Banner if any */}
                        {missingAccs.length > 0 && (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold text-rose-900">
                              <span>⚠️ Missing Student Accessories:</span>
                              <span className="font-mono">+${accCost.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {missingAccs.map((acc, idx) => (
                                <span key={idx} className="px-1.5 py-0.2 rounded bg-white text-rose-700 border border-rose-300 font-semibold text-[11px]">
                                  {acc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {ticket.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 gap-2">
                          <div>
                            Tech: <strong className="text-slate-700">{ticket.technicianName || 'Pending Assignment'}</strong>
                          </div>
                          <div>
                            Cost: <strong className="text-slate-900 font-mono">${(hwCost + accCost).toFixed(2)}</strong>
                            {accCost > 0 && (
                              <span className="text-slate-400 text-[10px] ml-1">(Parts: ${hwCost.toFixed(2)} + Acc: ${accCost.toFixed(2)})</span>
                            )}
                          </div>
                          {ticket.loanerTabletSerial && (
                            <div className="text-blue-600 font-medium font-mono">
                              Loaner Issued: {ticket.loanerTabletSerial}
                            </div>
                          )}
                        </div>

                        {ticket.technicianNotes && (
                          <div className="text-xs bg-blue-50/70 p-2 rounded border border-blue-200/80 text-blue-900">
                            <strong>Technician Notes:</strong> {ticket.technicianNotes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BARCODE & ASSET LABEL */}
          {activeTab === 'barcode' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Asset Tag Label Preview</h3>
                  <p className="text-xs text-slate-500">Official sticker format for physical tablet labeling.</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Label</span>
                </button>
              </div>

              {/* Printable Label Simulation Card */}
              <div className="max-w-md mx-auto p-5 bg-white border-2 border-slate-900 rounded-xl shadow-md text-slate-900 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <div>
                    <p className="text-xs font-black tracking-widest uppercase">HIGH SCHOOL IT ASSET</p>
                    <p className="text-[10px] text-slate-500">ST. JUDE DIGITAL CAMPUS</p>
                  </div>
                  <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    {tablet.assetTag}
                  </span>
                </div>

                <div className="text-center py-2 space-y-1">
                  {/* Simulated Barcode lines */}
                  <div className="h-12 flex items-center justify-center gap-0.5 overflow-hidden">
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4].map((w, i) => (
                      <span
                        key={i}
                        className="h-full bg-slate-900"
                        style={{ width: `${w * 2.5}px` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold tracking-widest">{tablet.serialNumber}</p>
                </div>

                <div className="text-[10px] space-y-0.5 border-t border-slate-300 pt-2 text-slate-700">
                  <p><strong>DEVICE:</strong> KATON SM1 ({tablet.storage}) • <strong>MFR:</strong> KATON</p>
                  <p><strong>IMEI:</strong> {tablet.imeiNumber}</p>
                  {tablet.currentStudentName && (
                    <p><strong>STUDENT:</strong> {tablet.currentStudentName} ({tablet.currentStudentClass})</p>
                  )}
                  <p className="text-[9px] text-slate-500 italic mt-1">Property of High School. KATON Education Fleet.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Quick Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ID: {tablet.id}
            </span>
            {onDeleteTablet && (
              <button
                type="button"
                onClick={() => setShowDeleteTabletModal(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer flex items-center gap-1.5"
                title="Permanently remove tablet from database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Tablet</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {tablet.status === 'In Repair' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 font-semibold rounded-lg bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-orange-600" />
                  <span>In Workshop Repair {hasAssignee ? `(Assigned: ${tablet.currentStudentName})` : '(Pool)'}</span>
                </span>
                {hasAssignee && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCheckIn(tablet);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer"
                  >
                    Check In / Return
                  </button>
                )}
              </div>
            ) : isAssigned ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckIn(tablet);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer"
              >
                Check In / Return Tablet
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAssign(tablet);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
              >
                Assign to Student
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* DIALOG 1: Confirm Delete Tablet */}
        {showDeleteTabletModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Permanently Delete Tablet?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    This action will permanently purge this tablet and its historical records from the fleet database.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <p><strong>Model:</strong> {tablet.model || 'KATON SM1'}</p>
                <p><strong>Serial Number:</strong> <span className="font-mono">{tablet.serialNumber}</span></p>
                <p><strong>IMEI:</strong> <span className="font-mono">{tablet.imeiNumber}</span></p>
                <p><strong>Asset Tag:</strong> <span className="font-mono">{tablet.assetTag}</span></p>
                {tablet.currentStudentName && (
                  <p className="text-amber-700 dark:text-amber-400">
                    <strong>Currently Assigned:</strong> {tablet.currentStudentName} ({tablet.currentStudentClass})
                  </p>
                )}
              </div>

              {tabletRepairs.length > 0 && (
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteRepairsToo}
                    onChange={(e) => setDeleteRepairsToo(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Also delete {tabletRepairs.length} associated repair ticket(s)</span>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeleteTabletModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteTablet) {
                      onDeleteTablet(tablet.id, deleteRepairsToo);
                    }
                    setShowDeleteTabletModal(false);
                    onClose();
                  }}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Tablet Permanently</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIALOG 2: Confirm Remove Assignee Record */}
        {showRemoveAssigneeModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-amber-200 dark:border-amber-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Remove Student Assignee Record?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Completely remove current student assignment without logging a return inspection.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs space-y-1">
                <p><strong>Student:</strong> {tablet.currentStudentName}</p>
                <p><strong>Class:</strong> {tablet.currentStudentClass} • {tablet.currentStudentProgram}</p>
                <p><strong>Device Status:</strong> Will be reset to <span className="font-bold text-emerald-600 dark:text-emerald-400">Available</span> pool</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRemoveAssigneeModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onRemoveAssignee) {
                      onRemoveAssignee(tablet.id);
                    }
                    setShowRemoveAssigneeModal(false);
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

        {/* DIALOG 3: Confirm Delete Single Historical Record */}
        {historyRecordToDelete && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Delete Assignment History Record?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Permanently delete this specific deployment log entry from this tablet's timeline.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <p><strong>Student:</strong> {historyRecordToDelete.studentName}</p>
                <p><strong>Class:</strong> {historyRecordToDelete.classGroup} ({historyRecordToDelete.program})</p>
                <p><strong>Deployment Period:</strong> {historyRecordToDelete.assignedDate} → {historyRecordToDelete.returnedDate || 'Present'}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setHistoryRecordToDelete(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteAssignmentHistoryRecord) {
                      onDeleteAssignmentHistoryRecord(tablet.id, historyRecordToDelete.id);
                    }
                    setHistoryRecordToDelete(null);
                  }}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIALOG 4: Confirm Clear All History */}
        {showClearAllHistoryModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Clear All Assignment History?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Permanently delete all {tablet.assignmentHistory.length} historical deployment log(s) for this tablet.
                  </p>
                </div>
              </div>

              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                This action cannot be undone. All past student loan records and return notes for this tablet will be wiped.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClearAllHistoryModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onClearAllAssignmentHistory) {
                      onClearAllAssignmentHistory(tablet.id);
                    }
                    setShowClearAllHistoryModal(false);
                  }}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

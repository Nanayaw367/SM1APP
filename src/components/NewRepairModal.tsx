import React, { useState } from 'react';
import { 
  TabletDevice, 
  RepairIssueType, 
  RepairPriority, 
  RepairTicket 
} from '../types/inventory';
import { inferYearLevelFromClass } from '../data/mockData';
import { 
  X, 
  Wrench, 
  AlertTriangle, 
  Tablet, 
  CheckSquare, 
  Square, 
  PackageX, 
  Check, 
  DollarSign, 
  Layers,
  CheckCircle2
} from 'lucide-react';

interface NewRepairModalProps {
  preselectedTablet?: TabletDevice | null;
  tablets: TabletDevice[];
  onClose: () => void;
  onCreateTicket: (ticket: Omit<RepairTicket, 'id' | 'reportedDate'>) => void;
}

const HARDWARE_ISSUES_LIST: { type: RepairIssueType; label: string; iconDesc: string }[] = [
  { type: 'Cracked Screen', label: 'Cracked Screen / Digitizer', iconDesc: 'Glass shattered or touch unresponsive' },
  { type: 'Charging Port Fault', label: 'Charging Port Pin / Loose Port', iconDesc: 'USB-C port damaged or not charging' },
  { type: 'Battery Depleted / Not Charging', label: 'Battery Degradation / No Power', iconDesc: 'Battery drains rapidly or swollen' },
  { type: 'Software / OS Bootloop', label: 'Software / OS Bootloop', iconDesc: 'Stuck on boot logo or system crashed' },
  { type: 'Physical Chassis Damage', label: 'Physical Chassis / Frame Dent', iconDesc: 'Bent casing, loose frame, or cracked bezel' },
  { type: 'Audio / Microphone Failure', label: 'Speaker / Microphone Fault', iconDesc: 'No audio output or student mic distorted' },
  { type: 'Camera Malfunction', label: 'Camera Lens / Sensor Fault', iconDesc: 'Front or rear camera black screen / blurry' },
  { type: 'Wi-Fi / Connectivity Issue', label: 'Wi-Fi / Cellular Modem Fault', iconDesc: 'Fails to connect to school access points' },
  { type: 'Water Damage', label: 'Water / Liquid Ingress', iconDesc: 'Spill or liquid indicator triggered' },
  { type: 'Other', label: 'Other Hardware Failure', iconDesc: 'Button, volume rocker, or power switch fault' },
];

const STUDENT_ACCESSORIES_LIST: { name: string; replacementFee: number }[] = [
  { name: 'Power Bank', replacementFee: 18.00 },
  { name: 'Earpiece', replacementFee: 3.50 },
  { name: 'USB Type-C Cable', replacementFee: 3.00 },
  { name: 'Keyboard Case', replacementFee: 28.00 },
  { name: 'Charger', replacementFee: 8.50 },
];

export const NewRepairModal: React.FC<NewRepairModalProps> = ({
  preselectedTablet,
  tablets,
  onClose,
  onCreateTicket,
}) => {
  const [selectedTabletId, setSelectedTabletId] = useState<string>(
    preselectedTablet ? preselectedTablet.id : tablets[0]?.id || ''
  );

  // Multi-select Hardware Issues
  const [selectedHardwareIssues, setSelectedHardwareIssues] = useState<RepairIssueType[]>([
    'Cracked Screen'
  ]);

  // Multi-select Missing Accessories
  const [selectedMissingAccessories, setSelectedMissingAccessories] = useState<string[]>([]);

  const [priority, setPriority] = useState<RepairPriority>('High');
  const [description, setDescription] = useState('');
  const [technicianName, setTechnicianName] = useState('Kwame Antwi (Lead Tech)');
  const [hardwareRepairCost, setHardwareRepairCost] = useState('40.00');
  const [selectedLoanerSerial, setSelectedLoanerSerial] = useState<string>('');

  const currentSelectedTablet = tablets.find((t) => t.id === selectedTabletId);
  const availableLoaners = tablets.filter((t) => t.status === 'Available');

  // Calculate missing accessories fee
  const accessoryReplacementTotal = selectedMissingAccessories.reduce((acc, name) => {
    const item = STUDENT_ACCESSORIES_LIST.find(i => i.name === name);
    return acc + (item ? item.replacementFee : 5.00);
  }, 0);

  const toggleHardwareIssue = (issue: RepairIssueType) => {
    if (selectedHardwareIssues.includes(issue)) {
      if (selectedHardwareIssues.length === 1) {
        // Must keep at least one issue selected
        return;
      }
      setSelectedHardwareIssues(selectedHardwareIssues.filter(i => i !== issue));
    } else {
      setSelectedHardwareIssues([...selectedHardwareIssues, issue]);
    }
  };

  const toggleMissingAccessory = (acc: string) => {
    if (selectedMissingAccessories.includes(acc)) {
      setSelectedMissingAccessories(selectedMissingAccessories.filter(a => a !== acc));
    } else {
      setSelectedMissingAccessories([...selectedMissingAccessories, acc]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedTablet || selectedHardwareIssues.length === 0) return;

    const baseCost = hardwareRepairCost ? parseFloat(hardwareRepairCost) : 0;
    const finalDescription = description.trim() || 
      `Reported hardware issues: ${selectedHardwareIssues.join(', ')}. ${
        selectedMissingAccessories.length > 0 
          ? `Missing student accessories: ${selectedMissingAccessories.join(', ')}.` 
          : 'All accessories present.'
      }`;

    onCreateTicket({
      tabletId: currentSelectedTablet.id,
      serialNumber: currentSelectedTablet.serialNumber,
      imeiNumber: currentSelectedTablet.imeiNumber,
      model: currentSelectedTablet.model || 'KATON SM1',
      studentName: currentSelectedTablet.currentStudentName,
      studentYearLevel: currentSelectedTablet.currentStudentYearLevel || inferYearLevelFromClass(currentSelectedTablet.currentStudentClass),
      studentClass: currentSelectedTablet.currentStudentClass,
      issueType: selectedHardwareIssues.join(', '),
      hardwareIssues: selectedHardwareIssues,
      missingAccessories: selectedMissingAccessories,
      description: finalDescription,
      priority,
      status: 'Reported',
      technicianName: technicianName.trim(),
      repairCost: baseCost,
      accessoryReplacementCost: accessoryReplacementTotal,
      loanerTabletSerial: selectedLoanerSerial || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Log New Repair & Service Ticket
              </h3>
              <p className="text-[11px] text-slate-400">
                Select multiple hardware issues and missing accessories per student
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. Device Selection & Student Info */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Select Device to Service *
            </label>
            <select
              value={selectedTabletId}
              onChange={(e) => setSelectedTabletId(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer font-mono font-medium"
            >
              {tablets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.serialNumber} • {t.model || 'KATON SM1'} ({t.currentStudentName ? `Student: ${t.currentStudentName} • ${t.currentStudentClass}` : 'In Stock'})
                </option>
              ))}
            </select>
          </div>

          {currentSelectedTablet && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Student Assignee:</span>
                <strong className="text-slate-800 truncate block">
                  {currentSelectedTablet.currentStudentName || 'Depot Pool (Unassigned)'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Year Level & Class:</span>
                <span className="text-slate-700 truncate block font-medium">
                  {currentSelectedTablet.currentStudentYearLevel ? `${currentSelectedTablet.currentStudentYearLevel} • ` : ''}{currentSelectedTablet.currentStudentClass || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">IMEI:</span>
                <span className="font-mono text-slate-700">{currentSelectedTablet.imeiNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Status:</span>
                <span className="font-semibold text-slate-800">{currentSelectedTablet.status}</span>
              </div>
              {currentSelectedTablet.currentStudentName && (
                <div className="col-span-2 sm:col-span-4 mt-1 pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Current student assignment (<strong>{currentSelectedTablet.currentStudentName}</strong>) will be maintained during repair.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 2. Multiple Hardware Issues Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-orange-600" />
                Select Hardware Faults / Issues *
                <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.2 rounded-full border border-orange-200">
                  {selectedHardwareIssues.length} selected
                </span>
              </label>
              <span className="text-[11px] text-slate-400">Multiple can be checked</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
              {HARDWARE_ISSUES_LIST.map((item) => {
                const isChecked = selectedHardwareIssues.includes(item.type);
                return (
                  <div
                    key={item.type}
                    onClick={() => toggleHardwareIssue(item.type)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                      isChecked
                        ? 'bg-orange-50 border-orange-300 text-orange-950 ring-1 ring-orange-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{item.label}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.iconDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Missing Accessories Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <PackageX className="w-3.5 h-3.5 text-rose-600" />
                Missing Student Accessories Checklist
                {selectedMissingAccessories.length > 0 ? (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.2 rounded-full border border-rose-200">
                    {selectedMissingAccessories.length} Missing
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                    All 5 Present
                  </span>
                )}
              </label>
              {selectedMissingAccessories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedMissingAccessories([])}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Clear missing
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
              {STUDENT_ACCESSORIES_LIST.map((acc) => {
                const isMissing = selectedMissingAccessories.includes(acc.name);
                return (
                  <div
                    key={acc.name}
                    onClick={() => toggleMissingAccessory(acc.name)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                      isMissing
                        ? 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isMissing ? (
                        <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-semibold text-[11px]">{acc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      +${acc.replacementFee.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedMissingAccessories.length > 0 && (
              <p className="text-[11px] text-rose-700 bg-rose-50/80 p-2 rounded-lg border border-rose-200 flex items-center justify-between">
                <span>
                  Missing replacement cost will be billed to student account:
                </span>
                <strong className="font-mono">${accessoryReplacementTotal.toFixed(2)}</strong>
              </p>
            )}
          </div>

          {/* 4. Priority & Malfunction Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RepairPriority)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              >
                <option value="Critical">Critical (Immediate exam / class block)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technician Notes / Detailed Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Broken digitizer after locker drop, student also reported missing USB-C cable."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Costs & Technician Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lead Technician
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="Technician name"
                className="w-full p-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hardware Repair Quote ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={hardwareRepairCost}
                onChange={(e) => setHardwareRepairCost(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Estimated Cost ($)
              </label>
              <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 flex items-center justify-between">
                <span>Total:</span>
                <span>${((parseFloat(hardwareRepairCost) || 0) + accessoryReplacementTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 6. Issue Temporary Loaner Tablet */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Temporary Replacement Loaner (Optional)
            </label>
            <select
              value={selectedLoanerSerial}
              onChange={(e) => setSelectedLoanerSerial(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer font-mono"
            >
              <option value="">No loaner needed / Student will wait</option>
              {availableLoaners.map((loaner) => (
                <option key={loaner.id} value={loaner.serialNumber}>
                  {loaner.serialNumber} • KATON SM1 (Available in Depot)
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {selectedHardwareIssues.length} fault(s) • {selectedMissingAccessories.length} missing accessory(ies)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>File Repair & Service Ticket</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

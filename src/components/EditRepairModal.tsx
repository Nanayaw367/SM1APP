import React, { useState } from 'react';
import { 
  RepairTicket, 
  RepairIssueType, 
  RepairPriority, 
  RepairStatus, 
  TabletDevice 
} from '../types/inventory';
import { 
  X, 
  Wrench, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  PackageX, 
  Check, 
  DollarSign, 
  User, 
  Tablet, 
  Clock, 
  Save, 
  Sparkles 
} from 'lucide-react';

interface EditRepairModalProps {
  ticket: RepairTicket;
  tablets: TabletDevice[];
  onClose: () => void;
  onSave: (updatedTicket: RepairTicket) => void;
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

export const EditRepairModal: React.FC<EditRepairModalProps> = ({
  ticket,
  tablets,
  onClose,
  onSave,
}) => {
  // Initialize multi-select hardware issues
  const initialHardwareIssues: RepairIssueType[] = 
    ticket.hardwareIssues && ticket.hardwareIssues.length > 0
      ? ticket.hardwareIssues
      : ticket.issueType
      ? (ticket.issueType.split(',').map(s => s.trim()) as RepairIssueType[]).filter(Boolean)
      : ['Cracked Screen'];

  const [selectedHardwareIssues, setSelectedHardwareIssues] = useState<RepairIssueType[]>(initialHardwareIssues);

  // Initialize multi-select missing accessories
  const [selectedMissingAccessories, setSelectedMissingAccessories] = useState<string[]>(
    ticket.missingAccessories || []
  );

  const [status, setStatus] = useState<RepairStatus>(ticket.status);
  const [priority, setPriority] = useState<RepairPriority>(ticket.priority);
  const [description, setDescription] = useState(ticket.description || '');
  const [technicianName, setTechnicianName] = useState(ticket.technicianName || 'Kwame Antwi (Lead Tech)');
  const [technicianNotes, setTechnicianNotes] = useState(ticket.technicianNotes || '');
  const [hardwareRepairCost, setHardwareRepairCost] = useState(
    ticket.repairCost !== undefined ? ticket.repairCost.toString() : '40.00'
  );
  const [loanerSerial, setLoanerSerial] = useState(ticket.loanerTabletSerial || '');

  const availableLoaners = tablets.filter(
    (t) => t.status === 'Available' || t.serialNumber === ticket.loanerTabletSerial
  );

  // Calculate accessory fee
  const accessoryReplacementTotal = selectedMissingAccessories.reduce((acc, name) => {
    const item = STUDENT_ACCESSORIES_LIST.find(i => i.name === name);
    return acc + (item ? item.replacementFee : 5.00);
  }, 0);

  const toggleHardwareIssue = (issue: RepairIssueType) => {
    if (selectedHardwareIssues.includes(issue)) {
      if (selectedHardwareIssues.length === 1) {
        // Keep at least one issue selected
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
    if (selectedHardwareIssues.length === 0) return;

    const baseCost = hardwareRepairCost ? parseFloat(hardwareRepairCost) : 0;
    const today = new Date().toISOString().split('T')[0];

    const updatedTicket: RepairTicket = {
      ...ticket,
      hardwareIssues: selectedHardwareIssues,
      missingAccessories: selectedMissingAccessories,
      issueType: selectedHardwareIssues.join(', '),
      description: description.trim() || `Hardware issues: ${selectedHardwareIssues.join(', ')}`,
      priority,
      status,
      technicianName: technicianName.trim(),
      technicianNotes: technicianNotes.trim(),
      repairCost: isNaN(baseCost) ? 0 : baseCost,
      accessoryReplacementCost: accessoryReplacementTotal,
      loanerTabletSerial: loanerSerial || undefined,
      resolvedDate: status === 'Resolved' && !ticket.resolvedDate ? today : ticket.resolvedDate,
    };

    onSave(updatedTicket);
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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Manage Service Log: {ticket.id.toUpperCase()}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {ticket.serialNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Select multiple hardware issues and missing accessories for this student
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Student & Device Summary Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px]">Student Assignee:</span>
              <strong className="text-slate-800 truncate block">
                {ticket.studentName || 'Depot Pool (Unassigned)'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Year Level & Class:</span>
              <span className="text-slate-700 truncate block font-medium">
                {ticket.studentYearLevel ? `${ticket.studentYearLevel} • ` : ''}{ticket.studentClass || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Tablet Model:</span>
              <span className="font-mono text-slate-700">{ticket.model || 'KATON SM1'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">IMEI:</span>
              <span className="font-mono text-slate-700">{ticket.imeiNumber}</span>
            </div>
          </div>

          {/* 1. Multiple Hardware Issues Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-orange-600" />
                Select Hardware Faults & Issues *
                <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.2 rounded-full border border-orange-200">
                  {selectedHardwareIssues.length} Selected
                </span>
              </label>
              <span className="text-[11px] text-slate-400">Click to toggle issues</span>
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

          {/* 2. Multiple Missing Accessories Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <PackageX className="w-3.5 h-3.5 text-rose-600" />
                Missing Student Accessories
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
                  Clear all missing
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
              <div className="text-[11px] text-rose-700 bg-rose-50/80 p-2.5 rounded-lg border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Missing Accessories Billed to Student:</span>
                  <span className="text-slate-600 text-[10px]">{selectedMissingAccessories.join(', ')}</span>
                </div>
                <strong className="font-mono text-sm">${accessoryReplacementTotal.toFixed(2)}</strong>
              </div>
            )}
          </div>

          {/* 3. Ticket Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ticket Service Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RepairStatus)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer font-semibold"
              >
                <option value="Reported">Reported (Logged at Service Desk)</option>
                <option value="In Progress">In Progress (Active Bench Work)</option>
                <option value="In Diagnosis">In Diagnosis (Bench testing)</option>
                <option value="Awaiting Parts">Awaiting Parts (Vendor shipment)</option>
                <option value="In Repair">In Repair (Under active repair)</option>
                <option value="Repaired & Testing">Repaired & Testing (QA stage)</option>
                <option value="Resolved">Resolved (Ready for pickup / returned)</option>
                <option value="Decommissioned">Decommissioned (Scrapped / written off)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RepairPriority)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              >
                <option value="Critical">Critical (Immediate exam / classroom need)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* 4. Fault Description & Technician Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reported Malfunction / Intake Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of damage..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technician Diagnostic Notes & Repair Actions Taken
              </label>
              <textarea
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Replaced display panel and calibrated touchscreen. Tested charging current at 1.8A."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Costs & Technician Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lead Technician
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hardware Repair Cost ($)
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
                Total Incurred Cost ($)
              </label>
              <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 flex items-center justify-between">
                <span>Total:</span>
                <span>${((parseFloat(hardwareRepairCost) || 0) + accessoryReplacementTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 6. Loaner Tablet Serial */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Active Temporary Loaner Tablet
            </label>
            <select
              value={loanerSerial}
              onChange={(e) => setLoanerSerial(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer font-mono"
            >
              <option value="">No loaner issued</option>
              {availableLoaners.map((loaner) => (
                <option key={loaner.id} value={loaner.serialNumber}>
                  {loaner.serialNumber} • KATON SM1 ({loaner.status === 'Available' ? 'Depot Pool' : 'Assigned to Ticket'})
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              {selectedHardwareIssues.length} Hardware Issue(s) • {selectedMissingAccessories.length} Missing Accessory(ies)
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
                <Save className="w-3.5 h-3.5" />
                <span>Save Ticket Updates</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

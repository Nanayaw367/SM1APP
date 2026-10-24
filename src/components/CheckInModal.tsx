import React, { useState } from 'react';
import { TabletDevice, DeviceCondition, RepairIssueType } from '../types/inventory';
import { 
  X, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Wrench, 
  PackageX, 
  CheckSquare, 
  Square 
} from 'lucide-react';

interface CheckInModalProps {
  tablet: TabletDevice | null;
  onClose: () => void;
  onCheckIn: (
    tabletId: string,
    returnCondition: DeviceCondition,
    returnNotes: string,
    returnedAccessories: string[],
    createRepairTicket?: boolean,
    selectedHardwareIssues?: RepairIssueType[],
    missingAccessories?: string[]
  ) => void;
}

const COMMON_HARDWARE_ISSUES: { type: RepairIssueType; label: string }[] = [
  { type: 'Cracked Screen', label: 'Cracked Screen / Digitizer' },
  { type: 'Charging Port Fault', label: 'Charging Port Fault' },
  { type: 'Battery Depleted / Not Charging', label: 'Battery / No Power' },
  { type: 'Software / OS Bootloop', label: 'OS Bootloop / Frozen' },
  { type: 'Physical Chassis Damage', label: 'Chassis / Frame Dent' },
  { type: 'Audio / Microphone Failure', label: 'Speaker / Mic Failure' },
  { type: 'Camera Malfunction', label: 'Camera Malfunction' },
  { type: 'Wi-Fi / Connectivity Issue', label: 'Wi-Fi / Modem Fault' },
  { type: 'Water Damage', label: 'Water / Liquid Damage' },
  { type: 'Other', label: 'Other Hardware Issue' },
];

export const CheckInModal: React.FC<CheckInModalProps> = ({
  tablet,
  onClose,
  onCheckIn,
}) => {
  const [returnCondition, setReturnCondition] = useState<DeviceCondition>('Good');
  const [returnNotes, setReturnNotes] = useState('');
  const standardAccessories = (tablet?.assignedAccessories && tablet.assignedAccessories.length > 0)
    ? tablet.assignedAccessories
    : ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'];

  const [returnedAccessories, setReturnedAccessories] = useState<string[]>(standardAccessories);
  const [createRepair, setCreateRepair] = useState(false);
  const [selectedHardwareIssues, setSelectedHardwareIssues] = useState<RepairIssueType[]>([
    'Physical Chassis Damage'
  ]);

  if (!tablet) return null;

  const missingAccessories = standardAccessories.filter(a => !returnedAccessories.includes(a));

  const toggleAccessory = (acc: string) => {
    if (returnedAccessories.includes(acc)) {
      setReturnedAccessories(returnedAccessories.filter(a => a !== acc));
    } else {
      setReturnedAccessories([...returnedAccessories, acc]);
    }
  };

  const toggleHardwareIssue = (issue: RepairIssueType) => {
    if (selectedHardwareIssues.includes(issue)) {
      if (selectedHardwareIssues.length === 1) return;
      setSelectedHardwareIssues(selectedHardwareIssues.filter(i => i !== issue));
    } else {
      setSelectedHardwareIssues([...selectedHardwareIssues, issue]);
    }
  };

  const handleConditionChange = (cond: DeviceCondition) => {
    setReturnCondition(cond);
    if (cond === 'Damaged') {
      setCreateRepair(true);
      if (!selectedHardwareIssues.includes('Cracked Screen')) {
        setSelectedHardwareIssues(['Cracked Screen', 'Physical Chassis Damage']);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckIn(
      tablet.id,
      returnCondition,
      returnNotes.trim(),
      returnedAccessories,
      createRepair || returnCondition === 'Damaged' || missingAccessories.length > 0,
      selectedHardwareIssues,
      missingAccessories
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Check In & Inspection: Return Tablet
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {tablet.serialNumber} • {tablet.model || 'KATON SM1'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Current Assignee info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Returning Student:</span>
              <strong className="text-slate-900">{tablet.currentStudentName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Program & Class:</span>
              <span className="text-slate-700">{tablet.currentStudentClass} ({tablet.currentStudentProgram})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Residence Status:</span>
              <span className="text-slate-700">{tablet.currentResidenceStatus}</span>
            </div>
          </div>

          {/* Return Condition Assessment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Physical Condition Inspection Assessment *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Excellent', 'Good', 'Fair', 'Damaged'] as DeviceCondition[]).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => handleConditionChange(cond)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                    returnCondition === cond
                      ? cond === 'Damaged'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                        : 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                5-Piece Accessory Return Verification
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {returnedAccessories.length} of {standardAccessories.length} accounted for
              </span>
            </div>
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
              {standardAccessories.map((acc) => {
                const isReturned = returnedAccessories.includes(acc);
                return (
                  <label
                    key={acc}
                    className="flex items-center justify-between cursor-pointer hover:bg-white p-1 rounded transition"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isReturned}
                        onChange={() => toggleAccessory(acc)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={isReturned ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                        {acc}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isReturned ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {isReturned ? 'Returned' : 'Missing'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Missing Accessories Notice */}
          {missingAccessories.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                <PackageX className="w-4 h-4 text-rose-600" />
                <span>{missingAccessories.length} Accessory(ies) Flagged Missing</span>
              </div>
              <p className="text-rose-700 text-[11px]">
                Student will be billed for missing items: {missingAccessories.join(', ')}.
              </p>
            </div>
          )}

          {/* Hardware Issues Multi-Selection (If Damaged or Repair Checked) */}
          {(returnCondition === 'Damaged' || createRepair) && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-orange-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-orange-600" />
                  Select Hardware Faults Detected:
                </span>
                <span className="text-[11px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded-full border border-orange-200">
                  {selectedHardwareIssues.length} Selected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pt-1">
                {COMMON_HARDWARE_ISSUES.map((item) => {
                  const isChecked = selectedHardwareIssues.includes(item.type);
                  return (
                    <div
                      key={item.type}
                      onClick={() => toggleHardwareIssue(item.type)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-white border-orange-400 text-orange-950 font-semibold ring-1 ring-orange-300'
                          : 'bg-orange-50/50 border-orange-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Damaged Alert & Auto Repair Ticket Checkbox */}
          {returnCondition !== 'Damaged' && (
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                id="createRepairOpt"
                checked={createRepair}
                onChange={(e) => setCreateRepair(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="createRepairOpt" className="cursor-pointer font-medium">
                Route tablet to IT workshop repair desk upon check-in
              </label>
            </div>
          )}

          {/* Inspection Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Return Inspection Notes & Remarks
            </label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Returned with original charger. Minor chassis scuffs. Cleaned and reset."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Repair Routing Notice: Maintains Student Assignee */}
          {(returnCondition === 'Damaged' || createRepair) && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 flex items-start gap-2.5">
              <Wrench className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-900">Student Assignee Maintained During Repair</p>
                <p className="text-[11px] text-orange-800 mt-0.5 leading-relaxed">
                  <strong>{tablet.currentStudentName}</strong> ({tablet.currentStudentClass}) will remain designated as this tablet's assignee while undergoing repairs.
                </p>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 text-xs font-bold rounded-lg text-white shadow-xs transition cursor-pointer ${
                returnCondition === 'Damaged' || createRepair
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {returnCondition === 'Damaged' || createRepair
                ? 'Send to Repair (Maintain Assignee)'
                : 'Confirm Check-in & Return to Storage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TabletDevice, DeviceCondition, TabletStatus, ResidenceStatus } from '../types/inventory';
import { SCHOOL_PROGRAMS, SCHOOL_CLASSES } from '../data/mockData';
import { X, Tablet, Plus, Check } from 'lucide-react';

interface AddNewTabletModalProps {
  onClose: () => void;
  onAddTablet: (tablet: TabletDevice) => void;
  existingSerials: Set<string>;
}

export const AddNewTabletModal: React.FC<AddNewTabletModalProps> = ({
  onClose,
  onAddTablet,
  existingSerials,
}) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [imeiNumber, setImeiNumber] = useState('');
  const [assetTag, setAssetTag] = useState(`NHS-TAB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [model, setModel] = useState('KATON SM1');
  const [storage, setStorage] = useState('64GB');
  const [condition, setCondition] = useState<DeviceCondition>('Excellent');
  const [status, setStatus] = useState<TabletStatus>('Available');

  // Optional student assignment
  const [studentName, setStudentName] = useState('');
  const [program, setProgram] = useState(SCHOOL_PROGRAMS[0]);
  const [classGroup, setClassGroup] = useState(SCHOOL_CLASSES[0]);
  const [residenceStatus, setResidenceStatus] = useState<ResidenceStatus>('Day');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSerial = serialNumber.trim().toUpperCase();
    const cleanImei = imeiNumber.replace(/[^0-9]/g, '');

    if (!cleanSerial) {
      setError('Serial number is required');
      return;
    }
    if (existingSerials.has(cleanSerial)) {
      setError(`Serial number "${cleanSerial}" already exists in the inventory`);
      return;
    }
    if (!cleanImei || cleanImei.length < 14) {
      setError('IMEI number must be at least 14-15 digits');
      return;
    }

    const isAssigned = (status === 'Assigned' || status === 'On Loan') && Boolean(studentName.trim());
    const today = new Date().toISOString().split('T')[0];

    const newDevice: TabletDevice = {
      id: `tab-man-${Date.now()}`,
      serialNumber: cleanSerial,
      imeiNumber: cleanImei,
      assetTag: assetTag.trim() || `NHS-TAB-${Math.floor(1000 + Math.random() * 9000)}`,
      model: model || 'KATON SM1',
      manufacturer: 'KATON',
      storage,
      condition,
      status: isAssigned ? status : 'Available',
      currentStudentName: isAssigned ? studentName.trim() : undefined,
      currentStudentProgram: isAssigned ? program : undefined,
      currentStudentClass: isAssigned ? classGroup : undefined,
      currentResidenceStatus: isAssigned ? residenceStatus : undefined,
      assignedDate: isAssigned ? today : undefined,
      expectedReturnDate: isAssigned ? '2026-06-30' : undefined,
      assignedAccessories: isAssigned
        ? ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
        : [],
      notes: notes.trim() || 'Individually registered KATON SM1 device with 5-piece student kit.',
      lastAuditedDate: today,
      assignmentHistory: isAssigned
        ? [
            {
              id: `hist-man-${Date.now()}`,
              studentName: studentName.trim(),
              program,
              classGroup,
              residenceStatus,
              assignedDate: today,
              conditionAtCheckout: condition,
              issuedBy: 'IT Administrator',
              accessoriesIssued: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
            }
          ]
        : []
    };

    onAddTablet(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Register New Tablet Device
              </h3>
              <p className="text-[11px] text-slate-400">
                Enroll a new unit into high school asset database
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Model & Storage */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tablet Model *
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              >
                <option value="KATON SM1">KATON SM1 (Standard Education Model)</option>
                <option value="KATON SM1 Pro">KATON SM1 Pro (128GB)</option>
              </select>
              <p className="text-[10px] text-blue-600 mt-0.5 font-medium">Manufacturer: KATON (KA Technologies)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storage
              </label>
              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              >
                <option value="64GB">64GB</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
              </select>
            </div>
          </div>

          {/* Serial Number & IMEI */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. TAB-2024-0301"
                className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                IMEI Number (15 digits) *
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={imeiNumber}
                onChange={(e) => setImeiNumber(e.target.value)}
                placeholder="e.g. 864720048192001"
                className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Asset Tag & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asset Tag
              </label>
              <input
                type="text"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full p-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as DeviceCondition)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>

          {/* Initial Deployment Status */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Initial Assignment (Optional)
              </span>
              <span className="text-[11px] text-slate-400">Leave blank to keep in storage pool</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Mary Asamoah (leave blank for depot pool)"
                className="w-full p-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            {studentName.trim() && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full p-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    {SCHOOL_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Class</label>
                  <select
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full p-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Residence</label>
                  <select
                    value={residenceStatus}
                    onChange={(e) => setResidenceStatus(e.target.value as ResidenceStatus)}
                    className="w-full p-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="Day">Day Student</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Grant funded 2026 roll-out"
              className="w-full p-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
            >
              Save Device to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

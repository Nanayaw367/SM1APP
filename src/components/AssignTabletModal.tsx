import React, { useState } from 'react';
import { TabletDevice, ResidenceStatus } from '../types/inventory';
import { SCHOOL_PROGRAMS, SCHOOL_CLASSES, SCHOOL_YEAR_LEVELS, inferYearLevelFromClass } from '../data/mockData';
import { X, UserPlus, Tablet, CheckSquare, Square, Calendar } from 'lucide-react';

interface AssignTabletModalProps {
  tablet: TabletDevice | null;
  onClose: () => void;
  onAssign: (
    tabletId: string,
    studentName: string,
    program: string,
    classGroup: string,
    residenceStatus: ResidenceStatus,
    isLoaner: boolean,
    accessories: string[],
    notes?: string,
    yearLevel?: string
  ) => void;
}

export const AssignTabletModal: React.FC<AssignTabletModalProps> = ({
  tablet,
  onClose,
  onAssign,
}) => {
  const [studentName, setStudentName] = useState('');
  const [program, setProgram] = useState(SCHOOL_PROGRAMS[0]);
  const [classGroup, setClassGroup] = useState(SCHOOL_CLASSES[0]);
  const [yearLevel, setYearLevel] = useState(() => inferYearLevelFromClass(SCHOOL_CLASSES[0]) || 'Year 1');
  const [residenceStatus, setResidenceStatus] = useState<ResidenceStatus>('Day');
  const [isLoaner, setIsLoaner] = useState(false);
  const [notes, setNotes] = useState('');

  const [accessories, setAccessories] = useState<string[]>([
    'Power Bank',
    'Earpiece',
    'USB Type-C Cable',
    'Keyboard Case',
    'Charger'
  ]);

  if (!tablet) return null;

  const availableAccessories = [
    'Power Bank',
    'Earpiece',
    'USB Type-C Cable',
    'Keyboard Case',
    'Charger'
  ];

  const toggleAccessory = (acc: string) => {
    if (accessories.includes(acc)) {
      setAccessories(accessories.filter(a => a !== acc));
    } else {
      setAccessories([...accessories, acc]);
    }
  };

  const handleClassChange = (selectedClass: string) => {
    setClassGroup(selectedClass);
    const inferred = inferYearLevelFromClass(selectedClass);
    if (inferred) {
      setYearLevel(inferred);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    onAssign(
      tablet.id,
      studentName.trim(),
      program,
      classGroup,
      residenceStatus,
      isLoaner,
      accessories,
      notes.trim(),
      yearLevel
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {isLoaner ? 'Issue Temporary Loaner Tablet' : 'Assign Tablet to Student'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {tablet.serialNumber} • IMEI: {tablet.imeiNumber}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Assignment Type Selector */}
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsLoaner(false)}
              className={`flex-1 py-1.5 rounded-md text-center transition cursor-pointer ${
                !isLoaner ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard 1:1 Deployment (Full Term)
            </button>
            <button
              type="button"
              onClick={() => setIsLoaner(true)}
              className={`flex-1 py-1.5 rounded-md text-center transition cursor-pointer ${
                isLoaner ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temporary Bridge Loaner
            </button>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Kwabena Acheampong"
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Program, Year Level & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Program
              </label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              >
                {SCHOOL_PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer font-semibold text-blue-700"
              >
                {SCHOOL_YEAR_LEVELS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class / Form
              </label>
              <select
                value={classGroup}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Residence Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Residence Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Day', 'Boarding', 'Hostel'] as ResidenceStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setResidenceStatus(status)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                    residenceStatus === status
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {status === 'Day' ? 'Day Scholar' : status === 'Boarding' ? 'Boarder (Campus)' : 'Hostel'}
                </button>
              ))}
            </div>
          </div>

          {/* Associated Accessories */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Issued Student Accessories (5-Piece Standard Kit)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAccessories([...availableAccessories])}
                  className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Select All 5
                </button>
              </div>
            </div>
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {availableAccessories.map((acc) => {
                const checked = accessories.includes(acc);
                return (
                  <div
                    key={acc}
                    onClick={() => toggleAccessory(acc)}
                    className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900 select-none"
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{acc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes / Special Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Science textbook package installed. Parent guardian contract signed."
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer actions */}
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
              Confirm Assignment & Check Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

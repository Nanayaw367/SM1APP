import React, { useState } from 'react';
import { TabletDevice } from '../types/inventory';
import { 
  X, 
  QrCode, 
  Search, 
  Tablet, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Wrench, 
  RotateCcw 
} from 'lucide-react';

interface ScannerModalProps {
  tablets: TabletDevice[];
  onClose: () => void;
  onSelectTablet: (tablet: TabletDevice) => void;
  onOpenCheckIn: (tablet: TabletDevice) => void;
  onOpenRepair: (tablet: TabletDevice) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  tablets,
  onClose,
  onSelectTablet,
  onOpenCheckIn,
  onOpenRepair,
}) => {
  const [query, setQuery] = useState('');
  const [scannedResult, setScannedResult] = useState<TabletDevice | null>(null);
  const [scanMode, setScanMode] = useState<'laser' | 'manual'>('laser');

  const handleSearch = (val: string) => {
    setQuery(val);
    const clean = val.trim().toLowerCase();
    if (!clean) {
      setScannedResult(null);
      return;
    }

    const found = tablets.find(
      (t) =>
        t.serialNumber.toLowerCase() === clean ||
        t.imeiNumber.toLowerCase() === clean ||
        t.assetTag.toLowerCase() === clean ||
        (t.currentStudentName && t.currentStudentName.toLowerCase().includes(clean))
    );

    setScannedResult(found || null);
  };

  const handleSimulateScan = (tablet: TabletDevice) => {
    setQuery(tablet.serialNumber);
    setScannedResult(tablet);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Audit Scanner & Rapid Device Lookup
              </h3>
              <p className="text-[11px] text-slate-400">
                Scan barcode or query Serial / IMEI during inspections
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Simulated Viewfinder */}
          <div className="relative bg-slate-950 rounded-xl p-6 text-center text-white overflow-hidden border border-slate-800">
            {/* Viewfinder brackets */}
            <div className="absolute inset-4 pointer-events-none border-2 border-dashed border-blue-500/40 rounded-lg"></div>
            {/* Scanning laser line animation */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-pulse"></div>

            <QrCode className="w-12 h-12 text-slate-600 mx-auto opacity-40 mb-2" />
            <p className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
              {scannedResult ? 'DEVICE IDENTIFIED & VERIFIED' : 'ALIGN BARCODE / SCANNER READY'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Simulated optical scanner module active
            </p>
          </div>

          {/* Quick Query Bar */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Enter Barcode / Serial / IMEI Number
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="e.g. TAB-2024-0101 or 864720048192031..."
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setScannedResult(null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Simulation chips for testing */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Test Scans (Click to simulate scanning):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tablets.slice(0, 4).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSimulateScan(t)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] transition cursor-pointer"
                >
                  {t.serialNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          {scannedResult ? (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Asset Matched in Database
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-blue-200 text-blue-800">
                  {scannedResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Model:</span>
                  <strong className="text-slate-800">{scannedResult.model}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Serial:</span>
                  <strong className="text-slate-800 font-mono">{scannedResult.serialNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">IMEI:</span>
                  <span className="text-slate-800 font-mono text-[11px]">{scannedResult.imeiNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Assignee:</span>
                  <strong className="text-slate-800">
                    {scannedResult.currentStudentName || 'In Depot Pool'}
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onSelectTablet(scannedResult);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect History</span>
                </button>

                {scannedResult.status === 'Assigned' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCheckIn(scannedResult);
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Quick Return</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onOpenRepair(scannedResult);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-300 flex items-center gap-1 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Log Issue</span>
                </button>
              </div>
            </div>
          ) : query ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
              <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No device found with query "{query}"</p>
              <p className="text-[11px] text-slate-400">Verify serial or register this tablet into inventory.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

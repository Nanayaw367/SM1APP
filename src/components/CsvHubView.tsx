import React, { useState, useRef, useMemo } from 'react';
import { TabletDevice, CsvBulkRow } from '../types/inventory';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Clipboard, 
  Sparkles, 
  Layers, 
  Check, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  GraduationCap,
  School,
  Building2,
  Users
} from 'lucide-react';
import { 
  parseBulkDeploymentCsv, 
  convertRowToTabletDevice, 
  downloadCsvFile, 
  generateDeploymentsCsv, 
  generateSampleCsvContent 
} from '../utils/csvUtils';
import { 
  SCHOOL_CLASSES, 
  SCHOOL_YEAR_LEVELS, 
  inferYearLevelFromClass 
} from '../data/mockData';

interface CsvHubViewProps {
  tablets: TabletDevice[];
  onCommitImport: (newTablets: TabletDevice[]) => void;
  onNavigateToTablets: () => void;
}

export const CsvHubView: React.FC<CsvHubViewProps> = ({
  tablets,
  onCommitImport,
  onNavigateToTablets,
}) => {
  const [activeMode, setActiveMode] = useState<'import' | 'export'>('import');
  const [inputMethod, setInputMethod] = useState<'file' | 'paste'>('file');
  const [rawPastedText, setRawPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Parsed result state
  const [parsedRows, setParsedRows] = useState<CsvBulkRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export scope filters: all, assigned, year, class, boarding, day
  const [exportScope, setExportScope] = useState<'all' | 'assigned' | 'year' | 'class' | 'boarding' | 'day'>('all');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('Year 1');
  const [selectedClass, setSelectedClass] = useState<string>(SCHOOL_CLASSES[0]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text);
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const processCsvText = (text: string) => {
    const result = parseBulkDeploymentCsv(text, tablets);
    setParsedRows(result.rows);
    setValidCount(result.validCount);
    setErrorsCount(result.errorsCount);
  };

  const handlePasteSubmit = () => {
    if (!rawPastedText.trim()) return;
    setIsProcessing(true);
    processCsvText(rawPastedText);
    setIsProcessing(false);
  };

  const handleDownloadTemplate = () => {
    const sample = generateSampleCsvContent();
    downloadCsvFile(sample, 'high_school_tablet_deployment_template.csv');
  };

  const handleCommit = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const newDevices = validRows.map((row, idx) => convertRowToTabletDevice(row, idx));
    onCommitImport(newDevices);

    setImportSuccessMessage(`Successfully imported and deployed ${newDevices.length} tablets to the student roster!`);
    setParsedRows([]);
    setFileName(null);
    setRawPastedText('');
  };

  // Available classes across current inventory & curriculum
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>(SCHOOL_CLASSES);
    tablets.forEach(t => {
      if (t.currentStudentClass) classSet.add(t.currentStudentClass);
    });
    return Array.from(classSet).sort((a, b) => a.localeCompare(b));
  }, [tablets]);

  // Counts by Year Level
  const yearLevelCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Year 1': 0, 'Year 2': 0, 'Year 3': 0 };
    tablets.forEach(t => {
      const yr = t.currentStudentYearLevel || inferYearLevelFromClass(t.currentStudentClass);
      if (yr && counts[yr] !== undefined) {
        counts[yr]++;
      }
    });
    return counts;
  }, [tablets]);

  // Counts by Class
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tablets.forEach(t => {
      if (t.currentStudentClass) {
        counts[t.currentStudentClass] = (counts[t.currentStudentClass] || 0) + 1;
      }
    });
    return counts;
  }, [tablets]);

  // Devices filtered by the active export scope
  const devicesToExport = useMemo(() => {
    switch (exportScope) {
      case 'assigned':
        return tablets.filter(t => t.status === 'Assigned' || t.status === 'On Loan');
      case 'year':
        return tablets.filter(t => {
          const yr = t.currentStudentYearLevel || inferYearLevelFromClass(t.currentStudentClass);
          return yr === selectedYearLevel;
        });
      case 'class':
        return tablets.filter(t => t.currentStudentClass === selectedClass);
      case 'boarding':
        return tablets.filter(t => t.currentResidenceStatus === 'Boarding');
      case 'day':
        return tablets.filter(t => t.currentResidenceStatus === 'Day');
      case 'all':
      default:
        return tablets;
    }
  }, [tablets, exportScope, selectedYearLevel, selectedClass]);

  const handleExport = () => {
    let filenameSuffix: string = exportScope;
    if (exportScope === 'year') {
      filenameSuffix = `${selectedYearLevel.replace(/\s+/g, '_').toLowerCase()}_register`;
    } else if (exportScope === 'class') {
      filenameSuffix = `class_${selectedClass.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_roster`;
    }

    const csvData = generateDeploymentsCsv(devicesToExport);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsvFile(csvData, `student_tablets_${filenameSuffix}_${dateStr}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Bulk CSV Deployment & Export Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deploy KATON SM1 tablets (Manufactured by KATON) in bulk to students with attributes: <strong>Name, Program, Class, Residence Status, IMEI Number, Serial Number</strong>.
          </p>
        </div>

        {/* Tab switch Import vs Export */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveMode('import')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeMode === 'import'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bulk CSV Import
          </button>
          <button
            onClick={() => setActiveMode('export')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeMode === 'export'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            CSV Data Export
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {importSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-900">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{importSuccessMessage}</span>
          </div>
          <button
            onClick={onNavigateToTablets}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <span>View Deployed Tablets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* IMPORT MODE */}
      {activeMode === 'import' && (
        <div className="space-y-6">
          {/* Required Attributes Guide Box */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                  Required Deployment Specification
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Bulk Student Tablet Attributes
                </h3>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-sm shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV Template</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
              {[
                { name: 'Name', desc: 'Student Full Name' },
                { name: 'Year Level', desc: 'Year 1, Year 2, Year 3' },
                { name: 'Program', desc: 'Science, Arts, Business' },
                { name: 'Class', desc: 'e.g. Form 1 Sci 1' },
                { name: 'Residence Status', desc: 'Boarding, Day, Hostel' },
                { name: 'IMEI Number', desc: '15-digit Cellular ID' },
                { name: 'Serial Number', desc: 'Hardware Serial Tag' },
              ].map((item) => (
                <div key={item.name} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                  <div className="flex items-center gap-1 text-emerald-300 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Input Method Selector */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Upload CSV or Paste Records
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setInputMethod('file')}
                  className={`px-3 py-1 rounded-md font-medium cursor-pointer ${
                    inputMethod === 'file'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  File Upload (.csv)
                </button>
                <button
                  onClick={() => setInputMethod('paste')}
                  className={`px-3 py-1 rounded-md font-medium cursor-pointer ${
                    inputMethod === 'paste'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Paste CSV Text
                </button>
              </div>
            </div>

            {inputMethod === 'file' ? (
              <div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/30 space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {fileName ? fileName : 'Click to select or drag & drop student deployment CSV'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports comma-separated values exported from Excel, Google Sheets, or school SIS.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
                  >
                    Select File
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={rawPastedText}
                  onChange={(e) => setRawPastedText(e.target.value)}
                  rows={6}
                  placeholder={`"Name","Year Level","Program","Class","Residence Status","IMEI Number","Serial Number"\n"Akua Afriyie","Year 1","General Science","Form 1 Sci 1","Boarding","864720048192077","TAB-2024-0991"`}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setRawPastedText(generateSampleCsvContent());
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    Load Sample Text
                  </button>
                  <button
                    onClick={handlePasteSubmit}
                    disabled={!rawPastedText.trim()}
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    Parse Pasted Text
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Validation & Preview Table */}
          {parsedRows.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    CSV Pre-Import Verification Table
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review parsed rows before committing devices to active inventory.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {validCount} Ready to Import
                  </span>
                  {errorsCount > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      {errorsCount} Invalid
                    </span>
                  )}
                  <button
                    onClick={handleCommit}
                    disabled={validCount === 0}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Commit & Deploy ({validCount})</span>
                  </button>
                </div>
              </div>

              {/* Table of Parsed Rows */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Year Level</th>
                      <th className="p-2.5">Program</th>
                      <th className="p-2.5">Class</th>
                      <th className="p-2.5">Residence Status</th>
                      <th className="p-2.5">IMEI Number</th>
                      <th className="p-2.5">Serial Number</th>
                      <th className="p-2.5">Validation Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 ${
                          !row.isValid ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-900">
                          {row.name || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {row.yearLevel || 'Year 1'}
                          </span>
                        </td>
                        <td className="p-2.5">{row.program}</td>
                        <td className="p-2.5 font-medium">{row.classGroup}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            row.residenceStatus === 'Boarding'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.residenceStatus}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px]">
                          {row.imeiNumber || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="p-2.5 font-mono font-semibold text-[11px]">
                          {row.serialNumber || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="p-2.5 text-[11px]">
                          {row.errors && row.errors.length > 0 ? (
                            <ul className="text-rose-600 list-disc list-inside space-y-0.5">
                              {row.errors.map((err, eIdx) => (
                                <li key={eIdx}>{err}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-emerald-600 font-medium">Ready for deployment</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXPORT MODE */}
      {activeMode === 'export' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Export Tablets & Student Deployment Registers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate CSV documents scoped by Year Level, School Class, deployment status, or residential boarding rolls.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {devicesToExport.length} {devicesToExport.length === 1 ? 'Device' : 'Devices'} in Export Scope
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filter selection - 7 cols */}
            <div className="lg:col-span-7 space-y-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Export Scope
              </label>

              <div className="space-y-2.5">
                {/* 1. Complete Roster */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    exportScope === 'all'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'all'}
                    onChange={() => setExportScope('all')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Complete Master Roster</p>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {tablets.length} total
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Export all registered tablets across all statuses (assigned, in repair, loaners, available storage pool).
                    </p>
                  </div>
                </label>

                {/* 2. Active Deployments */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    exportScope === 'assigned'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'assigned'}
                    onChange={() => setExportScope('assigned')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Active Student Deployments Only</p>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {tablets.filter(t => t.status === 'Assigned' || t.status === 'On Loan').length} devices
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Export only tablets currently checked out to active students (standard 1:1 and bridge loaners).
                    </p>
                  </div>
                </label>

                {/* 3. Scope by Year Level */}
                <div
                  className={`p-3 rounded-xl border transition ${
                    exportScope === 'year'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'year'}
                      onChange={() => setExportScope('year')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Scope by Student Year Level</p>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {selectedYearLevel}: {devicesToExport.length} devices
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Filter export for a specific academic cohort (Year 1, Year 2, or Year 3).
                      </p>
                    </div>
                  </label>

                  {/* Year level selector pills */}
                  {exportScope === 'year' && (
                    <div className="mt-3 pt-3 border-t border-blue-100 dark:border-slate-800 pl-7 space-y-2">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Choose Year Level Cohort:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {SCHOOL_YEAR_LEVELS.map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setSelectedYearLevel(yr)}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition text-center cursor-pointer ${
                              selectedYearLevel === yr
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span className="block font-bold">{yr}</span>
                            <span className="text-[10px] opacity-80 block">
                              {yearLevelCounts[yr] || 0} students
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Scope by Class / Form */}
                <div
                  className={`p-3 rounded-xl border transition ${
                    exportScope === 'class'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'class'}
                      onChange={() => setExportScope('class')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-purple-600" />
                          <p className="text-xs font-bold text-slate-900">Scope by Class / Form</p>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded border border-purple-200">
                          {selectedClass}: {devicesToExport.length} devices
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Export an individual class register roster (e.g. Form 1 Sci 1, Form 2 Arts 1, Form 3 Bus 1).
                      </p>
                    </div>
                  </label>

                  {/* Class dropdown */}
                  {exportScope === 'class' && (
                    <div className="mt-3 pt-3 border-t border-purple-100 pl-7 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                        Select Target Class / Form:
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full p-2 text-xs border border-purple-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                      >
                        {availableClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls} — ({classCounts[cls] || 0} tablets assigned)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 5. Boarding Students */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    exportScope === 'boarding'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-950 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'boarding'}
                    onChange={() => setExportScope('boarding')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <p className="text-xs font-bold text-slate-900">Boarding Students Register</p>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {tablets.filter(t => t.currentResidenceStatus === 'Boarding').length} devices
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Export residential students staying in campus halls and boarding houses.
                    </p>
                  </div>
                </label>

                {/* 6. Day Students */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    exportScope === 'day'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-950 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'day'}
                    onChange={() => setExportScope('day')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-600" />
                        <p className="text-xs font-bold text-slate-900">Day Scholars Register</p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {tablets.filter(t => t.currentResidenceStatus === 'Day').length} devices
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Export day students commuting daily from off-campus residences.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Right side - Columns Included & Actions - 5 cols */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Columns Included in Export CSV
                  </h4>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    13 Attributes
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every export automatically includes students' <strong>Year Level</strong> and <strong>Class</strong> alongside hardware and tracking tags:
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">1. Name</span>
                  <span className="p-1.5 bg-blue-50 rounded border border-blue-200 font-mono text-blue-800 font-bold text-[11px]">2. Year Level ★</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">3. Program</span>
                  <span className="p-1.5 bg-purple-50 rounded border border-purple-200 font-mono text-purple-800 font-bold text-[11px]">4. Class ★</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">5. Residence Status</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">6. IMEI Number</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">7. Serial Number</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">8. Model</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">9. Condition</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">10. Status</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">11. Asset Tag</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px]">12. Assigned Date</span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 font-mono text-slate-800 text-[11px] col-span-2">13. Deployment Notes</span>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Exporting Records:</span>
                    <strong className="text-slate-900">{devicesToExport.length} tablets</strong>
                  </div>

                  <button
                    onClick={handleExport}
                    disabled={devicesToExport.length === 0}
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Scoped CSV ({devicesToExport.length})</span>
                  </button>
                </div>
              </div>

              {/* Sample preview of export records */}
              {devicesToExport.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Export Sample Preview
                  </p>
                  <div className="space-y-1.5">
                    {devicesToExport.slice(0, 3).map((tab) => (
                      <div key={tab.id} className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{tab.currentStudentName || 'Available Pool'}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                            <span className="text-blue-700 font-semibold">{tab.currentStudentYearLevel || inferYearLevelFromClass(tab.currentStudentClass) || 'Year 1'}</span>
                            <span>•</span>
                            <span className="text-purple-700 font-medium">{tab.currentStudentClass || 'Unassigned'}</span>
                            <span>•</span>
                            <span>{tab.currentResidenceStatus || 'Depot'}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{tab.serialNumber}</span>
                      </div>
                    ))}
                    {devicesToExport.length > 3 && (
                      <p className="text-[10px] text-center text-slate-400 italic">
                        + {devicesToExport.length - 3} more records will be included in the file
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

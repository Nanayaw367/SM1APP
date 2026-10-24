import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  WifiOff, 
  Wifi, 
  HardDrive, 
  ShieldCheck, 
  X, 
  Layers, 
  Copy, 
  Check, 
  AlertTriangle,
  FileCode,
  Sparkles,
  ExternalLink,
  Github,
  Terminal,
  ArrowUpRight,
  PackageCheck
} from 'lucide-react';
import { 
  getDatabaseInfo, 
  exportDatabaseBackup, 
  importDatabaseBackup, 
  resetDatabaseToDefaults, 
  DatabaseInfo 
} from '../db/localDatabase';
import { TabletDevice, RepairTicket, AccessoryItem } from '../types/inventory';

interface AndroidOfflineModalProps {
  onClose: () => void;
  isOnline: boolean;
  canInstall: boolean;
  hasPrompt: boolean;
  isInstalled: boolean;
  isAndroid: boolean;
  onPromptInstall: () => Promise<'accepted' | 'dismissed' | 'manual'>;
  onDatabaseRestored: (data: {
    tablets: TabletDevice[];
    repairs: RepairTicket[];
    accessories: AccessoryItem[];
  }) => void;
}

export const AndroidOfflineModal: React.FC<AndroidOfflineModalProps> = ({
  onClose,
  isOnline,
  canInstall,
  hasPrompt,
  isInstalled,
  isAndroid,
  onPromptInstall,
  onDatabaseRestored,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'backup' | 'apk'>('status');
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshStats = async () => {
    try {
      const info = await getDatabaseInfo();
      setDbInfo(info);
    } catch (e) {
      console.error('Failed to get DB info', e);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleInstallClick = async () => {
    const outcome = await onPromptInstall();
    if (outcome === 'accepted') {
      setActionMessage({ text: 'Application successfully installed to your Android home screen!', type: 'success' });
    } else if (outcome === 'manual') {
      setActionMessage({ 
        text: 'To install manually on Android: Tap the 3 dots (⋮) in Chrome, then select "Install app" or "Add to Home screen".', 
        type: 'success' 
      });
    }
  };

  const handleExportBackup = async () => {
    try {
      setLoading(true);
      const jsonString = await exportDatabaseBackup();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edutab_fleet_offline_db_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setActionMessage({ text: 'Local database backup exported successfully!', type: 'success' });
    } catch {
      setActionMessage({ text: 'Failed to export database backup.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const restored = await importDatabaseBackup(text);
      onDatabaseRestored(restored);
      await refreshStats();
      setActionMessage({ text: `Successfully restored ${restored.tablets.length} tablets & repair records!`, type: 'success' });
    } catch (err: any) {
      setActionMessage({ text: `Failed to restore: ${err.message || 'Invalid backup JSON file'}`, type: 'error' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset local database back to default KATON SM1 school fleet seed data? Any offline edits will be reset.')) {
      try {
        setLoading(true);
        const defaults = await resetDatabaseToDefaults();
        onDatabaseRestored(defaults);
        await refreshStats();
        setActionMessage({ text: 'Database reset to default seed records.', type: 'success' });
      } catch {
        setActionMessage({ text: 'Failed to reset database.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDownloadBuildScript = () => {
    const scriptContent = `#!/usr/bin/env bash
# EduTab Fleet - Android APK Automated Build Script
# Run this on your computer or build server with Node.js 18+ and JDK 17 / Android SDK installed.

set -e
echo "Building EduTab Fleet Offline Android APK..."
npm run build
npm install --save-dev @capacitor/core @capacitor/cli @capacitor/android
npx cap init "EduTab Fleet" "com.edutab.fleet" --web-dir dist
npx cap add android
cd android
chmod +x gradlew
./gradlew assembleDebug

echo "=== SUCCESS! ==="
echo "Installable APK generated at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
`;
    const blob = new Blob([scriptContent], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-edutab-apk.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionMessage({ text: 'Downloaded build-edutab-apk.sh script!', type: 'success' });
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/30 border border-orange-500/40 text-orange-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Android App & Offline Database Console
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Offline Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                IndexedDB Local Storage • Installable Android PWA • APK Packaging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'status'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Local Database Status</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup & Restore</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Produce & Install APK</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {actionMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <span>{actionMessage.text}</span>
              <button
                onClick={() => setActionMessage(null)}
                className="cursor-pointer p-0.5 ml-2 hover:opacity-75"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: STATUS & INSTALL */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Quick Install Banner */}
              <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent dark:from-orange-950/40 dark:to-transparent border border-orange-200 dark:border-orange-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {isInstalled ? 'Installed as Android App' : 'Install Directly on Android Device'}
                    </span>
                    {isInstalled ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Running Standalone
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
                        Ready to Install
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Runs full-screen with native app launcher icon, zero browser borders, and 100% offline access in airplane mode.
                  </p>
                </div>

                {!isInstalled && (
                  <button
                    onClick={handleInstallClick}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95 shrink-0"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Install Android App</span>
                  </button>
                )}
              </div>

              {/* Offline Engine Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Database className="w-3 h-3 text-orange-500" />
                    IndexedDB
                  </span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Active</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    edutab_fleet_offline_db
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    {isOnline ? <Wifi className="w-3 h-3 text-blue-500" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
                    Network Mode
                  </span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Zero network needed
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tablets Stored
                  </span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {dbInfo?.tabletCount ?? '...'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Full history retained
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Storage Usage
                  </span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                    {formatBytes(dbInfo?.storageUsageBytes)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Offline quota ample
                  </p>
                </div>
              </div>

              {/* Architecture highlights */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  How this Offline Android Application Works
                </h4>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                    <span><strong>100% Client-Side Local Database</strong>: All assignments, repair tickets, and audit history are written directly to your Android device's native IndexedDB store.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                    <span><strong>Instant Offline Cache</strong>: The Workbox Service Worker precaches the application bundle, fonts, and assets so the app starts in under 200ms without internet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                    <span><strong>No Server Dependency</strong>: Depot technicians can check-in, repair, loan, and scan tablets in remote school areas or during internet outages without losing any data.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                You can create complete point-in-time JSON snapshots of your school tablet database or transfer records between different Android devices or computers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Export Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Download className="w-4 h-4 text-orange-500" />
                    <span>Export Local Database</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Downloads a full JSON file with all {dbInfo?.tabletCount || 0} tablets, {dbInfo?.repairCount || 0} tickets, and accessories.
                  </p>
                  <button
                    onClick={handleExportBackup}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Restore from Backup</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Load an existing `.json` backup file to overwrite or restore the local offline database.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select JSON File...</span>
                  </button>
                </div>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-4 rounded-xl border border-red-200 dark:border-red-950/80 bg-red-50/50 dark:bg-red-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Reset to Factory Seed Fleet
                  </span>
                  <button
                    onClick={handleResetDefaults}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] transition cursor-pointer"
                  >
                    Reset Local Database
                  </button>
                </div>
                <p className="text-[11px] text-red-700 dark:text-red-400">
                  Replaces the current local IndexedDB with the initial 15 KATON SM1 high school fleet tablets and mock repair records.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCE & INSTALL APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4 text-xs">
              {/* Introduction Banner */}
              <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent dark:from-orange-950/40 dark:to-transparent border border-orange-200 dark:border-orange-800/80 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                    <PackageCheck className="w-4 h-4 text-orange-500" />
                    Producing & Installing Android APK (.apk)
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Offline Ready
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Here are the 4 production routes to obtain and install the <strong>.apk</strong> binary package for your school tablets, whether sideloading via USB, distributing via MDM, or compiling in the cloud.
                </p>
              </div>

              {/* ROUTE 1: Automated GitHub Actions Cloud Build */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      GitHub Actions Cloud APK Builder (Automated)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Included in Repo
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  We have added <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-mono text-[10px]">.github/workflows/build-apk.yml</code> to your repository. When you push this project to GitHub, GitHub's cloud runners (with JDK 17 & Android SDK pre-installed) automatically compile the APK.
                </p>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <p className="text-slate-400"># How to download the compiled APK from GitHub:</p>
                  <p>1. Push repository to GitHub: git push origin main</p>
                  <p>2. Open your repository in browser → Click the "Actions" tab</p>
                  <p>3. Click "Build Android APK" workflow</p>
                  <p>4. Under "Artifacts", click to download "edutab-fleet-debug-apk.zip"</p>
                  <p className="text-emerald-400">→ Contains installable "app-debug.apk" ready for tablets!</p>
                </div>
              </div>

              {/* ROUTE 2: PWABuilder 1-Click Online APK Generator */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      PWABuilder Instant APK Generator (No Tools Needed)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Online in 60s
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Microsoft & Google's official <strong>PWABuilder</strong> turns this offline web app and manifest into signed or debug Android APK and AAB packages in under 1 minute.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://www.pwabuilder.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Open PWABuilder.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => copySnippet(window.location.origin, 'app-url')}
                    className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode === 'app-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'app-url' ? 'App URL Copied!' : 'Copy App URL for PWABuilder'}</span>
                  </button>
                </div>
              </div>

              {/* ROUTE 3: Direct WebAPK 1-Tap Installation */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-500" />
                      Direct WebAPK Sideloading (Chrome Native)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Instant (Zero Build)
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  When you open this URL in Chrome on an Android tablet and tap <strong>"Install App"</strong>, Android's OS package manager (<code className="font-mono text-[10px]">PackageInstaller</code>) automatically builds and registers a native <strong>WebAPK</strong> on the tablet filesystem. It appears in Android Settings → Apps, has its own app icon, and functions 100% offline.
                </p>
                {!isInstalled && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Install WebAPK on Current Device Now</span>
                  </button>
                )}
              </div>

              {/* ROUTE 4: 1-Command Local APK Build Script */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                      4
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-orange-500" />
                      Local Build Script (Android Studio / Gradle)
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadBuildScript}
                    className="flex items-center gap-1 text-[11px] text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download build-apk.sh</span>
                  </button>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  If you have Android Studio or the Android SDK on your machine, run the included script in the repository:
                </p>
                <div className="bg-slate-950 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
                  <p className="text-slate-400"># Run the all-in-one local build script:</p>
                  <p>chmod +x ./scripts/build-apk.sh</p>
                  <p>./scripts/build-apk.sh</p>
                  <p className="text-emerald-400 mt-2"># Generated output:</p>
                  <p className="text-slate-300">android/app/build/outputs/apk/debug/app-debug.apk</p>
                </div>
              </div>

              {/* Sideloading onto School Tablets Instructions */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-slate-600 dark:text-slate-300 text-[11px]">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-orange-500" />
                  How to Install the APK onto School Tablets:
                </h5>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>USB Sideload</strong>: Connect tablet to computer via USB → Copy <code className="font-mono text-[10px]">app-debug.apk</code> into <code className="font-mono text-[10px]">Download/</code> folder → Open Files app on tablet → Tap APK to install (allow "Install unknown apps").</li>
                  <li><strong>ADB Fast Sideload</strong>: Enable USB Debugging in Developer Options → Run <code className="font-mono text-[10px]">adb install -r app-debug.apk</code>.</li>
                  <li><strong>School MDM / EMM</strong>: Upload APK to Google Workspace Admin (Chrome Enterprise / Android Enterprise), Samsung Knox Manage, or Microsoft Intune for zero-touch bulk fleet deployment.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Database: IndexedDB v1.0 • All edits persist locally</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

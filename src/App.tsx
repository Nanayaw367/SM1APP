/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TabletDevice, 
  RepairTicket, 
  AccessoryItem, 
  TabletStatus, 
  DeviceCondition, 
  ResidenceStatus, 
  RepairStatus,
  RepairIssueType
} from './types/inventory';
import { 
  loadTabletsFromStorage, 
  saveTabletsToStorage, 
  loadRepairsFromStorage, 
  saveRepairsToStorage, 
  loadAccessoriesFromStorage, 
  saveAccessoriesToStorage, 
  resetAllToDefault, 
  calculateInventoryStats 
} from './utils/storage';
import { 
  initLocalDatabase, 
  saveAllTablets, 
  saveAllRepairs, 
  saveAllAccessories,
  deleteTablet,
  deleteTablets
} from './db/localDatabase';
import { usePWAInstall } from './hooks/usePWAInstall';

import { Sidebar } from './components/Sidebar';
import { AppHeader } from './components/AppHeader';
import { inferYearLevelFromClass } from './data/mockData';
import { TabletsView } from './components/TabletsView';
import { LoanStatusView } from './components/LoanStatusView';
import { RepairsView } from './components/RepairsView';
import { AccessoriesView } from './components/AccessoriesView';
import { CsvHubView } from './components/CsvHubView';
import { DashboardView } from './components/DashboardView';

import { TabletDetailModal } from './components/TabletDetailModal';
import { AssignTabletModal } from './components/AssignTabletModal';
import { CheckInModal } from './components/CheckInModal';
import { NewRepairModal } from './components/NewRepairModal';
import { AddNewTabletModal } from './components/AddNewTabletModal';
import { ScannerModal } from './components/ScannerModal';
import { AndroidOfflineModal } from './components/AndroidOfflineModal';
import { Smartphone, X } from 'lucide-react';

export default function App() {
  const [tablets, setTablets] = useState<TabletDevice[]>(() => loadTabletsFromStorage());
  const [repairs, setRepairs] = useState<RepairTicket[]>(() => loadRepairsFromStorage());
  const [accessories, setAccessories] = useState<AccessoryItem[]>(() => loadAccessoriesFromStorage());

  // Android PWA & Offline Hook
  const { 
    isOnline, 
    canInstall, 
    hasPrompt, 
    isInstalled, 
    isAndroid, 
    promptInstall 
  } = usePWAInstall();

  const [isAndroidOfflineModalOpen, setIsAndroidOfflineModalOpen] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('tablets');

  // Night Mode display state
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('edutab_night_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Mobile sidebar drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hydrate from native IndexedDB local database on startup
  useEffect(() => {
    initLocalDatabase()
      .then((data) => {
        if (data.tablets && data.tablets.length > 0) {
          setTablets(data.tablets);
        }
        if (data.repairs && data.repairs.length > 0) {
          setRepairs(data.repairs);
        }
        if (data.accessories && data.accessories.length > 0) {
          setAccessories(data.accessories);
        }
      })
      .catch((err) => {
        console.warn('Could not initialize IndexedDB, falling back to localStorage:', err);
      });
  }, []);

  // Apply dark mode class to html element and save to localStorage
  useEffect(() => {
    localStorage.setItem('edutab_night_mode', String(isNightMode));
    if (isNightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isNightMode]);

  const toggleNightMode = () => {
    setIsNightMode(prev => !prev);
  };

  // Modal states
  const [selectedTablet, setSelectedTablet] = useState<TabletDevice | null>(null);
  const [assigningTablet, setAssigningTablet] = useState<TabletDevice | null>(null);
  const [checkingInTablet, setCheckingInTablet] = useState<TabletDevice | null>(null);
  const [repairingTablet, setRepairingTablet] = useState<TabletDevice | null>(null);
  const [isAddingNewTablet, setIsAddingNewTablet] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Dual sync: save to both IndexedDB and localStorage whenever state updates
  useEffect(() => {
    saveTabletsToStorage(tablets);
    saveAllTablets(tablets).catch((e) => console.error('IndexedDB save tablets error:', e));
  }, [tablets]);

  useEffect(() => {
    saveRepairsToStorage(repairs);
    saveAllRepairs(repairs).catch((e) => console.error('IndexedDB save repairs error:', e));
  }, [repairs]);

  useEffect(() => {
    saveAccessoriesToStorage(accessories);
    saveAllAccessories(accessories).catch((e) => console.error('IndexedDB save accessories error:', e));
  }, [accessories]);

  // Global inventory stats
  const stats = useMemo(() => {
    return calculateInventoryStats(tablets, repairs, accessories);
  }, [tablets, repairs, accessories]);

  // Keep selectedTablet in sync if updated
  useEffect(() => {
    if (selectedTablet) {
      const refreshed = tablets.find(t => t.id === selectedTablet.id);
      if (refreshed) {
        setSelectedTablet(refreshed);
      }
    }
  }, [tablets]);

  // Handlers
  const handleAssignTablet = (
    tabletId: string,
    studentName: string,
    program: string,
    classGroup: string,
    residenceStatus: ResidenceStatus,
    isLoaner: boolean,
    accessoriesIssued: string[],
    notes?: string,
    yearLevel?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const resolvedYear = yearLevel || inferYearLevelFromClass(classGroup) || 'Year 1';

    setTablets(prev =>
      prev.map(tab => {
        if (tab.id !== tabletId) return tab;

        const newRecord = {
          id: `hist-${Date.now()}`,
          studentName,
          yearLevel: resolvedYear,
          program,
          classGroup,
          residenceStatus,
          assignedDate: today,
          conditionAtCheckout: tab.condition,
          issuedBy: 'IT Administrator',
          accessoriesIssued,
        };

        return {
          ...tab,
          status: isLoaner ? ('On Loan' as TabletStatus) : ('Assigned' as TabletStatus),
          currentStudentName: studentName,
          currentStudentYearLevel: resolvedYear,
          currentStudentProgram: program,
          currentStudentClass: classGroup,
          currentResidenceStatus: residenceStatus,
          assignedDate: today,
          expectedReturnDate: isLoaner ? '2026-10-31' : '2026-06-30',
          assignedAccessories: accessoriesIssued,
          notes: notes || tab.notes,
          lastAuditedDate: today,
          assignmentHistory: [newRecord, ...tab.assignmentHistory],
        };
      })
    );
  };

  const handleCheckInTablet = (
    tabletId: string,
    returnCondition: DeviceCondition,
    returnNotes: string,
    returnedAccessories: string[],
    createRepairTicket?: boolean,
    selectedHardwareIssues?: RepairIssueType[],
    missingAccessories?: string[]
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const targetTablet = tablets.find(t => t.id === tabletId);
    if (!targetTablet) return;

    // If tablet is damaged or routed to repair, maintain the current student assignee!
    const isGoingToRepair = returnCondition === 'Damaged' || createRepairTicket;
    const nextStatus: TabletStatus = isGoingToRepair ? 'In Repair' : 'Available';

    // Update assignment history's latest record: keep history open if student assignment is retained during repair
    const updatedHistory = targetTablet.assignmentHistory.map((hist, idx) => {
      if (idx === 0 && !hist.returnedDate) {
        if (isGoingToRepair) {
          return {
            ...hist,
            conditionAtReturn: returnCondition,
            returnNotes: returnNotes
              ? `${returnNotes} (Servicing at IT desk - Student assignment retained)`
              : 'Servicing at IT desk - Student assignment retained',
          };
        }
        return {
          ...hist,
          returnedDate: today,
          conditionAtReturn: returnCondition,
          returnNotes: returnNotes || 'Checked in at depot desk.',
        };
      }
      return hist;
    });

    // Update tablet record: retain student info if going into repair
    setTablets(prev =>
      prev.map(tab => {
        if (tab.id !== tabletId) return tab;
        return {
          ...tab,
          status: nextStatus,
          condition: returnCondition,
          currentStudentName: isGoingToRepair ? tab.currentStudentName : undefined,
          currentStudentYearLevel: isGoingToRepair ? tab.currentStudentYearLevel : undefined,
          currentStudentProgram: isGoingToRepair ? tab.currentStudentProgram : undefined,
          currentStudentClass: isGoingToRepair ? tab.currentStudentClass : undefined,
          currentResidenceStatus: isGoingToRepair ? tab.currentResidenceStatus : undefined,
          assignedDate: isGoingToRepair ? tab.assignedDate : undefined,
          expectedReturnDate: isGoingToRepair ? tab.expectedReturnDate : undefined,
          assignedAccessories: isGoingToRepair ? returnedAccessories : [],
          notes: returnNotes ? `Return Note: ${returnNotes}` : tab.notes,
          assignmentHistory: updatedHistory,
          lastAuditedDate: today,
        };
      })
    );

    // Auto-create repair ticket if requested, damaged, or accessories missing
    const hasIssues = (selectedHardwareIssues && selectedHardwareIssues.length > 0) || returnCondition === 'Damaged';
    const hasMissing = missingAccessories && missingAccessories.length > 0;

    if (createRepairTicket || hasIssues || hasMissing) {
      const hwIssues: RepairIssueType[] = 
        selectedHardwareIssues && selectedHardwareIssues.length > 0
          ? selectedHardwareIssues
          : returnCondition === 'Damaged'
          ? ['Physical Chassis Damage']
          : [];

      // Calculate missing accessory replacement fees
      const accessoryFeeMap: Record<string, number> = {
        'Power Bank': 18.00,
        'Earpiece': 3.50,
        'USB Type-C Cable': 3.00,
        'Keyboard Case': 28.00,
        'Charger': 8.50,
      };

      const missingList = missingAccessories || [];
      const accessoryFee = missingList.reduce((sum, item) => sum + (accessoryFeeMap[item] || 5.00), 0);

      const issueSummary = hwIssues.length > 0 
        ? hwIssues.join(', ') 
        : missingList.length > 0 
        ? `Missing Accessories: ${missingList.join(', ')}`
        : 'Inspection Service';

      const newTicket: RepairTicket = {
        id: `rep-${Date.now().toString().slice(-4)}`,
        tabletId: targetTablet.id,
        serialNumber: targetTablet.serialNumber,
        imeiNumber: targetTablet.imeiNumber,
        model: targetTablet.model || 'KATON SM1',
        studentName: targetTablet.currentStudentName,
        studentYearLevel: targetTablet.currentStudentYearLevel || inferYearLevelFromClass(targetTablet.currentStudentClass),
        studentClass: targetTablet.currentStudentClass,
        issueType: issueSummary,
        hardwareIssues: hwIssues,
        missingAccessories: missingList,
        description: returnNotes || `Check-in intake log: ${hwIssues.join(', ')}${missingList.length > 0 ? `. Missing accessories: ${missingList.join(', ')}` : ''}`,
        priority: returnCondition === 'Damaged' ? 'High' : 'Medium',
        status: 'Reported',
        reportedDate: today,
        technicianName: 'Kwame Antwi (Lead Tech)',
        repairCost: hwIssues.length > 0 ? 35.00 : 0.00,
        accessoryReplacementCost: accessoryFee,
      };

      setRepairs(prev => [newTicket, ...prev]);
    }
  };

  const handleUpdateTicket = (updatedTicket: RepairTicket) => {
    setRepairs(prev =>
      prev.map(r => (r.id === updatedTicket.id ? updatedTicket : r))
    );

    // If marked resolved, ensure tablet condition and status reflect ready state
    if (updatedTicket.status === 'Resolved') {
      setTablets(prev =>
        prev.map(tab => {
          if (tab.id !== updatedTicket.tabletId && tab.serialNumber !== updatedTicket.serialNumber) {
            return tab;
          }
          return {
            ...tab,
            condition: 'Good',
            status: tab.currentStudentName ? 'Assigned' : 'Available',
          };
        })
      );
    }
  };

  const handleUpdateRepairStatus = (
    ticketId: string,
    status: RepairStatus,
    techNotes?: string,
    cost?: number
  ) => {
    const today = new Date().toISOString().split('T')[0];
    let resolvedTabletId: string | null = null;

    setRepairs(prev =>
      prev.map(r => {
        if (r.id !== ticketId) return r;
        if (status === 'Resolved' && r.status !== 'Resolved') {
          resolvedTabletId = r.tabletId;
        }
        return {
          ...r,
          status,
          resolvedDate: status === 'Resolved' ? today : r.resolvedDate,
          technicianNotes: techNotes !== undefined ? techNotes : r.technicianNotes,
          repairCost: cost !== undefined ? cost : r.repairCost,
        };
      })
    );

    // If marked resolved, update tablet condition back to Good / Available if it was in repair
    if (resolvedTabletId) {
      setTablets(prev =>
        prev.map(tab => {
          if (tab.id !== resolvedTabletId) return tab;
          return {
            ...tab,
            condition: 'Good',
            status: tab.currentStudentName ? 'Assigned' : 'Available',
          };
        })
      );
    }
  };

  const handleBulkUpdateRepairStatus = (
    ticketIds: string[],
    status: RepairStatus,
    techNotes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const resolvedTabletIds = new Set<string>();

    setRepairs(prev =>
      prev.map(r => {
        if (!ticketIds.includes(r.id)) return r;
        if (status === 'Resolved' && r.status !== 'Resolved') {
          resolvedTabletIds.add(r.tabletId);
        }
        return {
          ...r,
          status,
          resolvedDate: status === 'Resolved' ? today : (status === 'In Progress' || status === 'In Repair' ? undefined : r.resolvedDate),
          technicianNotes: techNotes
            ? (r.technicianNotes ? `${r.technicianNotes} | ${techNotes}` : techNotes)
            : r.technicianNotes,
        };
      })
    );

    // If marked resolved, update linked tablets condition & status
    if (resolvedTabletIds.size > 0) {
      setTablets(prev =>
        prev.map(tab => {
          if (!resolvedTabletIds.has(tab.id)) return tab;
          return {
            ...tab,
            condition: 'Good',
            status: tab.currentStudentName ? 'Assigned' : 'Available',
          };
        })
      );
    }
  };

  const handleCreateRepairTicket = (ticketData: Omit<RepairTicket, 'id' | 'reportedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `rep-${Date.now().toString().slice(-4)}`;
    const newTicket: RepairTicket = {
      ...ticketData,
      id: newId,
      reportedDate: today,
    };

    setRepairs(prev => [newTicket, ...prev]);

    // Mark the device as In Repair while strictly preserving current student assignee
    setTablets(prev =>
      prev.map(tab => {
        if (tab.id === ticketData.tabletId) {
          return {
            ...tab,
            status: 'In Repair',
            condition: 'Damaged',
            currentStudentName: tab.currentStudentName || ticketData.studentName,
            currentStudentYearLevel: tab.currentStudentYearLevel || ticketData.studentYearLevel || inferYearLevelFromClass(ticketData.studentClass),
            currentStudentClass: tab.currentStudentClass || ticketData.studentClass,
          };
        }
        // If a loaner unit was assigned to student
        if (ticketData.loanerTabletSerial && tab.serialNumber === ticketData.loanerTabletSerial) {
          return {
            ...tab,
            status: 'On Loan',
            currentStudentName: ticketData.studentName,
            currentStudentYearLevel: ticketData.studentYearLevel || inferYearLevelFromClass(ticketData.studentClass),
            currentStudentClass: ticketData.studentClass,
            assignedDate: today,
            notes: `Temporary replacement loaner for repair ticket ${newId}.`,
          };
        }
        return tab;
      })
    );
  };

  const handleCommitCsvImport = (newDevices: TabletDevice[]) => {
    setTablets(prev => {
      const existingSerials = new Set(prev.map(t => t.serialNumber.toUpperCase()));
      const filteredNew = newDevices.filter(d => !existingSerials.has(d.serialNumber.toUpperCase()));
      // Also update any matching serials
      const updated = prev.map(t => {
        const matchingImport = newDevices.find(
          d => d.serialNumber.toUpperCase() === t.serialNumber.toUpperCase()
        );
        if (matchingImport) {
          return {
            ...t,
            currentStudentName: matchingImport.currentStudentName,
            currentStudentProgram: matchingImport.currentStudentProgram,
            currentStudentClass: matchingImport.currentStudentClass,
            currentResidenceStatus: matchingImport.currentResidenceStatus,
            imeiNumber: matchingImport.imeiNumber || t.imeiNumber,
            status: matchingImport.status,
            assignedDate: matchingImport.assignedDate,
          };
        }
        return t;
      });

      return [...updated, ...filteredNew];
    });
  };

  const handleUpdateAccessoryQuantity = (accessoryId: string, delta: number) => {
    setAccessories(prev =>
      prev.map(item => {
        if (item.id !== accessoryId) return item;
        const newAvail = Math.max(0, item.availableQuantity + delta);
        const newTotal = delta > 0 ? item.totalQuantity + delta : item.totalQuantity;
        return {
          ...item,
          availableQuantity: newAvail,
          totalQuantity: newTotal,
        };
      })
    );
  };

  const handleAddAccessory = (newItem: Omit<AccessoryItem, 'id'>) => {
    const item: AccessoryItem = {
      ...newItem,
      id: `acc-${Date.now()}`,
    };
    setAccessories(prev => [item, ...prev]);
  };

  const handleUpdateTabletNotes = (tabletId: string, notes: string) => {
    setTablets(prev =>
      prev.map(tab => (tab.id === tabletId ? { ...tab, notes } : tab))
    );
  };

  // Completely remove tablet from fleet database
  const handleDeleteTablet = (tabletId: string, deleteRelatedRepairs: boolean = true) => {
    setTablets(prev => prev.filter(t => t.id !== tabletId));
    if (deleteRelatedRepairs) {
      setRepairs(prev => prev.filter(r => r.tabletId !== tabletId));
    }
    if (selectedTablet && selectedTablet.id === tabletId) {
      setSelectedTablet(null);
    }
    deleteTablet(tabletId).catch(e => console.error('Error deleting tablet from DB:', e));
  };

  // Bulk remove multiple tablets from fleet database
  const handleBulkDeleteTablets = (tabletIds: string[], deleteRelatedRepairs: boolean = true) => {
    const idSet = new Set(tabletIds);
    setTablets(prev => prev.filter(t => !idSet.has(t.id)));
    if (deleteRelatedRepairs) {
      setRepairs(prev => prev.filter(r => !idSet.has(r.tabletId)));
    }
    if (selectedTablet && idSet.has(selectedTablet.id)) {
      setSelectedTablet(null);
    }
    deleteTablets(tabletIds).catch(e => console.error('Error bulk deleting tablets from DB:', e));
  };

  // Completely remove assignee record from a tablet (clearing student data and setting to Available)
  const handleRemoveAssignee = (tabletId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setTablets(prev =>
      prev.map(tab => {
        if (tab.id !== tabletId) return tab;
        return {
          ...tab,
          status: 'Available' as TabletStatus,
          currentStudentName: undefined,
          currentStudentYearLevel: undefined,
          currentStudentProgram: undefined,
          currentStudentClass: undefined,
          currentResidenceStatus: undefined,
          assignedDate: undefined,
          expectedReturnDate: undefined,
          assignedAccessories: [],
          lastAuditedDate: today,
        };
      })
    );
  };

  // Bulk remove assignees from multiple tablets
  const handleBulkRemoveAssignees = (tabletIds: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    const idSet = new Set(tabletIds);
    setTablets(prev =>
      prev.map(tab => {
        if (!idSet.has(tab.id)) return tab;
        return {
          ...tab,
          status: 'Available' as TabletStatus,
          currentStudentName: undefined,
          currentStudentYearLevel: undefined,
          currentStudentProgram: undefined,
          currentStudentClass: undefined,
          currentResidenceStatus: undefined,
          assignedDate: undefined,
          expectedReturnDate: undefined,
          assignedAccessories: [],
          lastAuditedDate: today,
        };
      })
    );
  };

  // Delete a specific historical assignment record
  const handleDeleteAssignmentHistoryRecord = (tabletId: string, recordId: string) => {
    setTablets(prev =>
      prev.map(tab => {
        if (tab.id !== tabletId) return tab;
        return {
          ...tab,
          assignmentHistory: tab.assignmentHistory.filter(h => h.id !== recordId),
        };
      })
    );
  };

  // Clear all assignment history for a tablet
  const handleClearAllAssignmentHistory = (tabletId: string) => {
    setTablets(prev =>
      prev.map(tab => {
        if (tab.id !== tabletId) return tab;
        return {
          ...tab,
          assignmentHistory: [],
        };
      })
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset all tablets, repairs, and accessories to original high school demo state?')) {
      const reset = resetAllToDefault();
      setTablets(reset.tablets);
      setRepairs(reset.repairs);
      setAccessories(reset.accessories);
    }
  };

  const existingSerialsSet = useMemo(() => {
    return new Set(tablets.map(t => t.serialNumber.toUpperCase()));
  }, [tablets]);

  return (
    <div className={`min-h-screen ${isNightMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'} flex transition-colors duration-200 antialiased font-sans`}>
      {/* Left Side Panel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        isNightMode={isNightMode}
        onToggleNightMode={toggleNightMode}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAddNewTabletModal={() => setIsAddingNewTablet(true)}
        onResetData={handleResetData}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenAndroidOfflineModal={() => setIsAndroidOfflineModalOpen(true)}
        isOnline={isOnline}
        isInstalled={isInstalled}
        canInstall={canInstall}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppHeader
          activeTab={activeTab}
          stats={stats}
          isNightMode={isNightMode}
          onToggleNightMode={toggleNightMode}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onNavigateTab={setActiveTab}
          onOpenAndroidOfflineModal={() => setIsAndroidOfflineModalOpen(true)}
          isOnline={isOnline}
          canInstall={canInstall}
        />

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Android In-App Install & Offline Ready Notification Banner */}
          {!isInstalled && showInstallBanner && (
            <div className="mb-5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-3.5 sm:p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-xs sm:text-sm">
                      Install EduTab Android App • 100% Offline Local Database
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white uppercase tracking-wider">
                      Standalone APK Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-100 mt-0.5">
                    Launch directly from home screen without browser bars. All tablet checks, loans, and repairs save directly to device IndexedDB.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={async () => {
                    const res = await promptInstall();
                    if (res === 'manual') setIsAndroidOfflineModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-orange-950 font-bold text-xs hover:bg-orange-50 transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                  <span>Install App</span>
                </button>
                <button
                  onClick={() => setIsAndroidOfflineModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Database Info
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tablets' && (
            <TabletsView
              tablets={tablets}
              onSelectTablet={(t) => setSelectedTablet(t)}
              onOpenAssignModal={(t) => setAssigningTablet(t)}
              onOpenCheckInModal={(t) => setCheckingInTablet(t)}
              onOpenNewRepairModal={(t) => setRepairingTablet(t)}
              onOpenAddNewTabletModal={() => setIsAddingNewTablet(true)}
              onOpenCsvHub={() => setActiveTab('csv')}
              onDeleteTablet={handleDeleteTablet}
              onBulkDeleteTablets={handleBulkDeleteTablets}
              onRemoveAssignee={handleRemoveAssignee}
              onBulkRemoveAssignees={handleBulkRemoveAssignees}
            />
          )}

          {activeTab === 'loans' && (
            <LoanStatusView
              tablets={tablets}
              onSelectTablet={(t) => setSelectedTablet(t)}
              onOpenAssignModal={(t) => setAssigningTablet(t)}
              onOpenCheckInModal={(t) => setCheckingInTablet(t)}
              onRemoveAssignee={handleRemoveAssignee}
            />
          )}

          {activeTab === 'repairs' && (
            <RepairsView
              repairs={repairs}
              tablets={tablets}
              onUpdateRepairStatus={handleUpdateRepairStatus}
              onBulkUpdateRepairStatus={handleBulkUpdateRepairStatus}
              onUpdateTicket={handleUpdateTicket}
              onOpenNewRepairModal={(preselected) => setRepairingTablet(preselected || tablets[0] || null)}
              onSelectTablet={(t) => setSelectedTablet(t)}
            />
          )}

          {activeTab === 'accessories' && (
            <AccessoriesView
              accessories={accessories}
              onUpdateQuantity={handleUpdateAccessoryQuantity}
              onAddAccessory={handleAddAccessory}
            />
          )}

          {activeTab === 'csv' && (
            <CsvHubView
              tablets={tablets}
              onCommitImport={handleCommitCsvImport}
              onNavigateToTablets={() => setActiveTab('tablets')}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              tablets={tablets}
              repairs={repairs}
              accessories={accessories}
              stats={stats}
              onNavigateTab={setActiveTab}
              onSelectTablet={(t) => setSelectedTablet(t)}
              isNightMode={isNightMode}
              onToggleNightMode={toggleNightMode}
            />
          )}
        </main>

        {/* FOOTER */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              EduTab Asset Management System • High School 1:1 KATON SM1 Tablet Fleet (Manufactured by KATON)
            </p>
            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
              <span>Attributes: Name • Year Level • Class • Program • Residence • IMEI • Serial</span>
            </div>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {selectedTablet && (
        <TabletDetailModal
          tablet={selectedTablet}
          repairs={repairs}
          onClose={() => setSelectedTablet(null)}
          onOpenAssign={(t) => setAssigningTablet(t)}
          onOpenCheckIn={(t) => setCheckingInTablet(t)}
          onOpenRepair={(t) => setRepairingTablet(t)}
          onUpdateTabletNotes={handleUpdateTabletNotes}
          onDeleteTablet={handleDeleteTablet}
          onRemoveAssignee={handleRemoveAssignee}
          onDeleteAssignmentHistoryRecord={handleDeleteAssignmentHistoryRecord}
          onClearAllAssignmentHistory={handleClearAllAssignmentHistory}
        />
      )}

      {assigningTablet && (
        <AssignTabletModal
          tablet={assigningTablet}
          onClose={() => setAssigningTablet(null)}
          onAssign={handleAssignTablet}
        />
      )}

      {checkingInTablet && (
        <CheckInModal
          tablet={checkingInTablet}
          onClose={() => setCheckingInTablet(null)}
          onCheckIn={handleCheckInTablet}
        />
      )}

      {repairingTablet && (
        <NewRepairModal
          preselectedTablet={repairingTablet}
          tablets={tablets}
          onClose={() => setRepairingTablet(null)}
          onCreateTicket={handleCreateRepairTicket}
        />
      )}

      {isAddingNewTablet && (
        <AddNewTabletModal
          onClose={() => setIsAddingNewTablet(false)}
          onAddTablet={(t) => setTablets(prev => [t, ...prev])}
          existingSerials={existingSerialsSet}
        />
      )}

      {isScannerOpen && (
        <ScannerModal
          tablets={tablets}
          onClose={() => setIsScannerOpen(false)}
          onSelectTablet={(t) => {
            setIsScannerOpen(false);
            setSelectedTablet(t);
          }}
          onOpenCheckIn={(t) => {
            setIsScannerOpen(false);
            setCheckingInTablet(t);
          }}
          onOpenRepair={(t) => {
            setIsScannerOpen(false);
            setRepairingTablet(t);
          }}
        />
      )}

      {/* Android Offline App & Database Modal */}
      {isAndroidOfflineModalOpen && (
        <AndroidOfflineModal
          onClose={() => setIsAndroidOfflineModalOpen(false)}
          isOnline={isOnline}
          canInstall={canInstall}
          hasPrompt={hasPrompt}
          isInstalled={isInstalled}
          isAndroid={isAndroid}
          onPromptInstall={promptInstall}
          onDatabaseRestored={(restored) => {
            setTablets(restored.tablets);
            setRepairs(restored.repairs);
            setAccessories(restored.accessories);
          }}
        />
      )}
    </div>
  );
}

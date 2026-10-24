import { TabletDevice, RepairTicket, AccessoryItem, InventoryStats } from '../types/inventory';
import { INITIAL_TABLETS, INITIAL_REPAIR_TICKETS, INITIAL_ACCESSORIES } from '../data/mockData';

const STORAGE_KEYS = {
  TABLETS: 'edutab_tablets_katon_v3',
  REPAIRS: 'edutab_repairs_katon_v4',
  ACCESSORIES: 'edutab_accessories_katon_v3',
};

const STANDARD_5_ACCESSORIES = [
  'Power Bank',
  'Earpiece',
  'USB Type-C Cable',
  'Keyboard Case',
  'Charger'
];

export function loadTabletsFromStorage(): TabletDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TABLETS);
    if (raw) {
      const parsed: TabletDevice[] = JSON.parse(raw);
      // Ensure all models are KATON SM1 and assigned units have the standard 5 accessories
      return parsed.map(t => {
        const isAssigned = t.status === 'Assigned' || t.status === 'On Loan';
        return {
          ...t,
          model: 'KATON SM1',
          manufacturer: 'KATON',
          assignedAccessories: isAssigned ? STANDARD_5_ACCESSORIES : (t.assignedAccessories || [])
        };
      });
    }
  } catch (err) {
    console.error('Error loading tablets from storage:', err);
  }
  return INITIAL_TABLETS;
}

export function saveTabletsToStorage(tablets: TabletDevice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TABLETS, JSON.stringify(tablets));
  } catch (err) {
    console.error('Error saving tablets to storage:', err);
  }
}

export function deleteTabletFromStorage(tabletId: string): TabletDevice[] {
  const current = loadTabletsFromStorage();
  const filtered = current.filter(t => t.id !== tabletId);
  saveTabletsToStorage(filtered);
  return filtered;
}

export function deleteTabletsFromStorage(tabletIds: string[]): TabletDevice[] {
  const current = loadTabletsFromStorage();
  const idSet = new Set(tabletIds);
  const filtered = current.filter(t => !idSet.has(t.id));
  saveTabletsToStorage(filtered);
  return filtered;
}

export function loadRepairsFromStorage(): RepairTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPAIRS);
    if (raw) {
      const parsed: RepairTicket[] = JSON.parse(raw);
      return parsed.map(r => ({
        ...r,
        model: 'KATON SM1',
        hardwareIssues: r.hardwareIssues && r.hardwareIssues.length > 0 ? r.hardwareIssues : [r.issueType as any || 'Cracked Screen'],
        missingAccessories: r.missingAccessories || []
      }));
    }
  } catch (err) {
    console.error('Error loading repairs from storage:', err);
  }
  return INITIAL_REPAIR_TICKETS;
}

export function saveRepairsToStorage(repairs: RepairTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  } catch (err) {
    console.error('Error saving repairs to storage:', err);
  }
}

export function loadAccessoriesFromStorage(): AccessoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCESSORIES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading accessories from storage:', err);
  }
  return INITIAL_ACCESSORIES;
}

export function saveAccessoriesToStorage(accessories: AccessoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESSORIES, JSON.stringify(accessories));
  } catch (err) {
    console.error('Error saving accessories to storage:', err);
  }
}

export function resetAllToDefault(): {
  tablets: TabletDevice[];
  repairs: RepairTicket[];
  accessories: AccessoryItem[];
} {
  saveTabletsToStorage(INITIAL_TABLETS);
  saveRepairsToStorage(INITIAL_REPAIR_TICKETS);
  saveAccessoriesToStorage(INITIAL_ACCESSORIES);
  return {
    tablets: INITIAL_TABLETS,
    repairs: INITIAL_REPAIR_TICKETS,
    accessories: INITIAL_ACCESSORIES,
  };
}

export function calculateInventoryStats(
  tablets: TabletDevice[],
  repairs: RepairTicket[],
  accessories: AccessoryItem[]
): InventoryStats {
  const totalTablets = tablets.length;
  let assignedCount = 0;
  let availableCount = 0;
  let onLoanCount = 0;
  let inRepairCount = 0;
  let decommissionedCount = 0;
  let lostCount = 0;

  tablets.forEach(t => {
    switch (t.status) {
      case 'Assigned':
        assignedCount++;
        break;
      case 'Available':
        availableCount++;
        break;
      case 'On Loan':
        onLoanCount++;
        break;
      case 'In Repair':
        inRepairCount++;
        break;
      case 'Decommissioned':
        decommissionedCount++;
        break;
      case 'Lost/Stolen':
        lostCount++;
        break;
    }
  });

  const totalAccessories = accessories.reduce((acc, curr) => acc + curr.totalQuantity, 0);
  const lowStockAccessoriesCount = accessories.filter(
    a => a.availableQuantity <= a.minimumThreshold
  ).length;

  const openRepairs = repairs.filter(
    r => r.status !== 'Resolved' && r.status !== 'Decommissioned'
  );
  const openRepairsCount = openRepairs.length;
  const criticalRepairsCount = openRepairs.filter(
    r => r.priority === 'Critical' || r.priority === 'High'
  ).length;

  return {
    totalTablets,
    assignedCount,
    availableCount,
    onLoanCount,
    inRepairCount,
    decommissionedCount,
    lostCount,
    totalAccessories,
    lowStockAccessoriesCount,
    openRepairsCount,
    criticalRepairsCount,
  };
}

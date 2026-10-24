import { 
  TabletDevice, 
  RepairTicket, 
  AccessoryItem 
} from '../types/inventory';
import { 
  INITIAL_TABLETS, 
  INITIAL_REPAIR_TICKETS, 
  INITIAL_ACCESSORIES 
} from '../data/mockData';

const DB_NAME = 'edutab_fleet_offline_db';
const DB_VERSION = 1;

export interface DatabaseBackup {
  version: number;
  exportedAt: string;
  tablets: TabletDevice[];
  repairs: RepairTicket[];
  accessories: AccessoryItem[];
  meta: Record<string, any>;
}

export interface DatabaseInfo {
  name: string;
  version: number;
  tabletCount: number;
  repairCount: number;
  accessoryCount: number;
  lastUpdated: string;
  storageUsageBytes?: number;
  storageQuotaBytes?: number;
  isOfflineReady: boolean;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Open or initialize the IndexedDB instance
 */
export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this runtime environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Tablets store
      if (!db.objectStoreNames.contains('tablets')) {
        const tabletStore = db.createObjectStore('tablets', { keyPath: 'id' });
        tabletStore.createIndex('serialNumber', 'serialNumber', { unique: true });
        tabletStore.createIndex('status', 'status', { unique: false });
        tabletStore.createIndex('currentStudentClass', 'currentStudentClass', { unique: false });
      }

      // 2. Repairs store
      if (!db.objectStoreNames.contains('repairs')) {
        const repairStore = db.createObjectStore('repairs', { keyPath: 'id' });
        repairStore.createIndex('tabletId', 'tabletId', { unique: false });
        repairStore.createIndex('serialNumber', 'serialNumber', { unique: false });
        repairStore.createIndex('status', 'status', { unique: false });
      }

      // 3. Accessories store
      if (!db.objectStoreNames.contains('accessories')) {
        const accessoryStore = db.createObjectStore('accessories', { keyPath: 'id' });
        accessoryStore.createIndex('category', 'category', { unique: false });
      }

      // 4. Metadata store
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Initialize and auto-seed database on first startup
 */
export async function initLocalDatabase(): Promise<{
  tablets: TabletDevice[];
  repairs: RepairTicket[];
  accessories: AccessoryItem[];
}> {
  const db = await openDatabase();

  // Check if database was already seeded
  const seeded = await getMeta('is_seeded');

  if (!seeded) {
    console.info('[EduTab LocalDB] Initializing and seeding offline database with school fleet data...');
    await saveAllTablets(INITIAL_TABLETS);
    await saveAllRepairs(INITIAL_REPAIR_TICKETS);
    await saveAllAccessories(INITIAL_ACCESSORIES);
    await setMeta('is_seeded', true);
    await setMeta('seeded_at', new Date().toISOString());
    await setMeta('last_updated', new Date().toISOString());

    return {
      tablets: INITIAL_TABLETS,
      repairs: INITIAL_REPAIR_TICKETS,
      accessories: INITIAL_ACCESSORIES,
    };
  }

  // Retrieve existing local database contents
  const [tablets, repairs, accessories] = await Promise.all([
    getAllTablets(),
    getAllRepairs(),
    getAllAccessories(),
  ]);

  // Fallback in case a store was empty
  const resolvedTablets = tablets.length > 0 ? tablets : INITIAL_TABLETS;
  const resolvedRepairs = repairs.length > 0 ? repairs : INITIAL_REPAIR_TICKETS;
  const resolvedAccessories = accessories.length > 0 ? accessories : INITIAL_ACCESSORIES;

  return {
    tablets: resolvedTablets,
    repairs: resolvedRepairs,
    accessories: resolvedAccessories,
  };
}

// ==========================================
// METADATA STORE
// ==========================================
export async function getMeta(key: string): Promise<any> {
  const db = await openDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction('meta', 'readonly');
    const store = tx.objectStore('meta');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => resolve(null);
  });
}

export async function setMeta(key: string, value: any): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meta', 'readwrite');
    const store = tx.objectStore('meta');
    store.put({ key, value, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ==========================================
// TABLETS OPERATIONS
// ==========================================
export async function getAllTablets(): Promise<TabletDevice[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tablets', 'readonly');
    const store = tx.objectStore('tablets');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTablet(tablet: TabletDevice): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tablets', 'meta'], 'readwrite');
    const store = tx.objectStore('tablets');
    store.put(tablet);
    tx.objectStore('meta').put({ key: 'last_updated', value: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAllTablets(tablets: TabletDevice[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tablets', 'meta'], 'readwrite');
    const store = tx.objectStore('tablets');
    store.clear();
    for (const item of tablets) {
      store.put(item);
    }
    tx.objectStore('meta').put({ key: 'last_updated', value: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteTablet(tabletId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tablets', 'meta'], 'readwrite');
    const store = tx.objectStore('tablets');
    store.delete(tabletId);
    tx.objectStore('meta').put({ key: 'last_updated', value: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteTablets(tabletIds: string[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tablets', 'meta'], 'readwrite');
    const store = tx.objectStore('tablets');
    for (const id of tabletIds) {
      store.delete(id);
    }
    tx.objectStore('meta').put({ key: 'last_updated', value: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ==========================================
// REPAIRS OPERATIONS
// ==========================================
export async function getAllRepairs(): Promise<RepairTicket[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('repairs', 'readonly');
    const store = tx.objectStore('repairs');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRepair(repair: RepairTicket): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['repairs', 'meta'], 'readwrite');
    const store = tx.objectStore('repairs');
    store.put(repair);
    tx.objectStore('meta').put({ key: 'last_updated', value: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAllRepairs(repairs: RepairTicket[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['repairs', 'meta'], 'readwrite');
    const store = tx.objectStore('repairs');
    store.clear();
    for (const item of repairs) {
      store.put(item);
    }
    tx.objectStore('meta').put({ key: 'last_updated', value: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ==========================================
// ACCESSORIES OPERATIONS
// ==========================================
export async function getAllAccessories(): Promise<AccessoryItem[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('accessories', 'readonly');
    const store = tx.objectStore('accessories');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAllAccessories(accessories: AccessoryItem[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['accessories', 'meta'], 'readwrite');
    const store = tx.objectStore('accessories');
    store.clear();
    for (const item of accessories) {
      store.put(item);
    }
    tx.objectStore('meta').put({ key: 'last_updated', value: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ==========================================
// BACKUP, RESTORE & STATS
// ==========================================
export async function exportDatabaseBackup(): Promise<string> {
  const [tablets, repairs, accessories, seededAt, lastUpdated] = await Promise.all([
    getAllTablets(),
    getAllRepairs(),
    getAllAccessories(),
    getMeta('seeded_at'),
    getMeta('last_updated'),
  ]);

  const backup: DatabaseBackup = {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    tablets,
    repairs,
    accessories,
    meta: {
      seededAt,
      lastUpdated: lastUpdated || new Date().toISOString(),
      appName: 'EduTab Fleet Manager',
      platform: 'Android Offline PWA',
    },
  };

  return JSON.stringify(backup, null, 2);
}

export async function importDatabaseBackup(jsonString: string): Promise<{
  tablets: TabletDevice[];
  repairs: RepairTicket[];
  accessories: AccessoryItem[];
}> {
  const data: DatabaseBackup = JSON.parse(jsonString);

  if (!Array.isArray(data.tablets)) {
    throw new Error('Invalid backup file: tablets array not found.');
  }

  await saveAllTablets(data.tablets);
  if (Array.isArray(data.repairs)) {
    await saveAllRepairs(data.repairs);
  }
  if (Array.isArray(data.accessories)) {
    await saveAllAccessories(data.accessories);
  }

  await setMeta('last_updated', new Date().toISOString());
  await setMeta('last_restored_at', new Date().toISOString());

  return {
    tablets: data.tablets,
    repairs: data.repairs || [],
    accessories: data.accessories || [],
  };
}

export async function resetDatabaseToDefaults(): Promise<{
  tablets: TabletDevice[];
  repairs: RepairTicket[];
  accessories: AccessoryItem[];
}> {
  await saveAllTablets(INITIAL_TABLETS);
  await saveAllRepairs(INITIAL_REPAIR_TICKETS);
  await saveAllAccessories(INITIAL_ACCESSORIES);
  await setMeta('is_seeded', true);
  await setMeta('last_updated', new Date().toISOString());

  return {
    tablets: INITIAL_TABLETS,
    repairs: INITIAL_REPAIR_TICKETS,
    accessories: INITIAL_ACCESSORIES,
  };
}

export async function getDatabaseInfo(): Promise<DatabaseInfo> {
  const [tablets, repairs, accessories, lastUpdated] = await Promise.all([
    getAllTablets(),
    getAllRepairs(),
    getAllAccessories(),
    getMeta('last_updated'),
  ]);

  let storageUsageBytes: number | undefined;
  let storageQuotaBytes: number | undefined;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      storageUsageBytes = estimate.usage;
      storageQuotaBytes = estimate.quota;
    } catch {
      // Storage estimation not available in some WebViews
    }
  }

  return {
    name: DB_NAME,
    version: DB_VERSION,
    tabletCount: tablets.length,
    repairCount: repairs.length,
    accessoryCount: accessories.length,
    lastUpdated: lastUpdated || new Date().toISOString(),
    storageUsageBytes,
    storageQuotaBytes,
    isOfflineReady: true,
  };
}

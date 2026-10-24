export type ResidenceStatus = 'Boarding' | 'Day' | 'Hostel';

export type TabletStatus = 
  | 'Assigned' 
  | 'Available' 
  | 'On Loan' 
  | 'In Repair' 
  | 'Decommissioned' 
  | 'Lost/Stolen';

export type DeviceCondition = 'Excellent' | 'Good' | 'Fair' | 'Damaged';

export interface AssignmentRecord {
  id: string;
  studentName: string;
  studentId?: string;
  yearLevel?: string; // e.g. 'Year 1', 'Year 2', 'Year 3'
  program: string;
  classGroup: string;
  residenceStatus: ResidenceStatus;
  assignedDate: string;
  returnedDate?: string | null;
  conditionAtCheckout: DeviceCondition;
  conditionAtReturn?: DeviceCondition;
  returnNotes?: string;
  issuedBy: string;
  accessoriesIssued: string[];
}

export interface TabletDevice {
  id: string;
  serialNumber: string;
  imeiNumber: string;
  assetTag: string;
  model: string;
  manufacturer?: string;
  storage: string;
  condition: DeviceCondition;
  status: TabletStatus;
  
  // Current assignment details (if assigned or on loan)
  currentStudentName?: string;
  currentStudentYearLevel?: string; // e.g. 'Year 1', 'Year 2', 'Year 3'
  currentStudentProgram?: string;
  currentStudentClass?: string;
  currentResidenceStatus?: ResidenceStatus;
  assignedDate?: string;
  expectedReturnDate?: string;
  assignedAccessories?: string[];
  
  // Histories
  assignmentHistory: AssignmentRecord[];
  notes?: string;
  lastAuditedDate?: string;
}

export type RepairStatus = 
  | 'Reported' 
  | 'In Diagnosis' 
  | 'Awaiting Parts' 
  | 'In Progress'
  | 'In Repair' 
  | 'Repaired & Testing' 
  | 'Resolved' 
  | 'Decommissioned';

export type RepairPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type RepairIssueType = 
  | 'Cracked Screen' 
  | 'Charging Port Fault' 
  | 'Battery Depleted / Not Charging' 
  | 'Software / OS Bootloop' 
  | 'Physical Chassis Damage' 
  | 'Audio / Microphone Failure' 
  | 'Camera Malfunction' 
  | 'Wi-Fi / Connectivity Issue'
  | 'Water Damage'
  | 'Other';

export interface RepairTicket {
  id: string;
  tabletId: string;
  serialNumber: string;
  imeiNumber: string;
  model: string;
  studentName?: string;
  studentYearLevel?: string;
  studentClass?: string;
  issueType?: string; // Summary label or primary issue
  hardwareIssues: RepairIssueType[]; // Multiple hardware faults selected
  missingAccessories?: string[]; // Multiple missing accessories selected
  description: string;
  priority: RepairPriority;
  status: RepairStatus;
  reportedDate: string;
  resolvedDate?: string | null;
  technicianName?: string;
  technicianNotes?: string;
  repairCost?: number;
  accessoryReplacementCost?: number;
  loanerTabletSerial?: string;
}

export type AccessoryCategory = 
  | 'Power Bank' 
  | 'Earpiece' 
  | 'USB Type-C Cable' 
  | 'Keyboard Case' 
  | 'Charger' 
  | 'Stylus Pen' 
  | 'Tempered Glass Protector';

export interface AccessoryItem {
  id: string;
  name: string;
  category: AccessoryCategory;
  modelCompatibility: string;
  totalQuantity: number;
  assignedQuantity: number;
  availableQuantity: number;
  minimumThreshold: number;
  unitCost: number;
  storageBin: string;
  lastRestockedDate: string;
}

export interface CsvBulkRow {
  name: string;
  yearLevel?: string;
  program: string;
  classGroup: string;
  residenceStatus: string;
  imeiNumber: string;
  serialNumber: string;
  model?: string;
  condition?: string;
  status?: string;
  notes?: string;
  isValid?: boolean;
  errors?: string[];
}

export interface InventoryStats {
  totalTablets: number;
  assignedCount: number;
  availableCount: number;
  onLoanCount: number;
  inRepairCount: number;
  decommissionedCount: number;
  lostCount: number;
  totalAccessories: number;
  lowStockAccessoriesCount: number;
  openRepairsCount: number;
  criticalRepairsCount: number;
}

import { TabletDevice, RepairTicket, AccessoryItem } from '../types/inventory';

export const STANDARD_STUDENT_ACCESSORIES = [
  'Power Bank',
  'Earpiece',
  'USB Type-C Cable',
  'Keyboard Case',
  'Charger'
];

export const INITIAL_TABLETS: TabletDevice[] = [
  {
    id: 'tab-001',
    serialNumber: 'TAB-2024-0101',
    imeiNumber: '864720048192031',
    assetTag: 'NHS-TAB-1001',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Excellent',
    status: 'Assigned',
    currentStudentName: 'Kofi Mensah',
    currentStudentProgram: 'General Science',
    currentStudentClass: 'Form 2 Sci 1',
    currentResidenceStatus: 'Boarding',
    assignedDate: '2025-09-08',
    expectedReturnDate: '2026-06-30',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'Issued with full 5-piece student kit: Power Bank, earpiece, USB Type-c cable, keyboard case, and charger. Boarding student in Hall A.',
    lastAuditedDate: '2026-09-15',
    assignmentHistory: [
      {
        id: 'hist-001-a',
        studentName: 'Emmanuel Ansah',
        program: 'General Science',
        classGroup: 'Form 3 Sci 2',
        residenceStatus: 'Day',
        assignedDate: '2024-09-10',
        returnedDate: '2025-06-20',
        conditionAtCheckout: 'Excellent',
        conditionAtReturn: 'Good',
        returnNotes: 'Returned at end of academic year with all 5 accessories intact (Power Bank, earpiece, cable, keyboard case, charger).',
        issuedBy: 'Mr. P. Owusu (IT Admin)',
        accessoriesIssued: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
      }
    ]
  },
  {
    id: 'tab-002',
    serialNumber: 'TAB-2024-0102',
    imeiNumber: '358941098273612',
    assetTag: 'NHS-TAB-1002',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Good',
    status: 'Assigned',
    currentStudentName: 'Amina Bello',
    currentStudentProgram: 'General Arts',
    currentStudentClass: 'Form 1 Arts 2',
    currentResidenceStatus: 'Day',
    assignedDate: '2025-09-10',
    expectedReturnDate: '2026-06-30',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'Literature curriculum textbooks preloaded on KATON SM1. Full accessory package issued.',
    lastAuditedDate: '2026-09-18',
    assignmentHistory: []
  },
  {
    id: 'tab-003',
    serialNumber: 'TAB-2024-0103',
    imeiNumber: '869234057819441',
    assetTag: 'NHS-TAB-1003',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Damaged',
    status: 'In Repair',
    currentStudentName: 'Chukwudi Eze',
    currentStudentProgram: 'Business',
    currentStudentClass: 'Form 3 Bus 1',
    currentResidenceStatus: 'Boarding',
    assignedDate: '2025-09-05',
    assignedAccessories: ['Keyboard Case'],
    notes: 'Sent to KATON certified workshop due to cracked display glass from locker drop. Student issued temporary loaner TAB-2024-0112.',
    lastAuditedDate: '2026-10-02',
    assignmentHistory: [
      {
        id: 'hist-003-a',
        studentName: 'Chukwudi Eze',
        program: 'Business',
        classGroup: 'Form 2 Bus 1',
        residenceStatus: 'Boarding',
        assignedDate: '2024-09-12',
        returnedDate: '2025-06-22',
        conditionAtCheckout: 'Excellent',
        conditionAtReturn: 'Good',
        returnNotes: 'Completed accounting projects without issue. Re-issued in Form 3.',
        issuedBy: 'Mrs. H. Darko',
        accessoriesIssued: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
      }
    ]
  },
  {
    id: 'tab-004',
    serialNumber: 'TAB-2024-0104',
    imeiNumber: '861198034567890',
    assetTag: 'NHS-TAB-1004',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Excellent',
    status: 'Assigned',
    currentStudentName: 'Nana Ama Serwaa',
    currentStudentProgram: 'Visual Arts',
    currentStudentClass: 'Form 2 Visual',
    currentResidenceStatus: 'Boarding',
    assignedDate: '2025-09-08',
    expectedReturnDate: '2026-06-30',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'Configured with vector design & sketching tools. Full 5-piece accessory pack verified.',
    lastAuditedDate: '2026-09-20',
    assignmentHistory: []
  },
  {
    id: 'tab-005',
    serialNumber: 'TAB-2024-0105',
    imeiNumber: '354890123847561',
    assetTag: 'NHS-TAB-1005',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Fair',
    status: 'In Repair',
    currentStudentName: 'Daniel Osei',
    currentStudentProgram: 'Home Economics',
    currentStudentClass: 'Form 1 HomeEcon',
    currentResidenceStatus: 'Day',
    assignedDate: '2025-09-12',
    assignedAccessories: ['Keyboard Case', 'Charger'],
    notes: 'Charging port pin bent on KATON SM1; device intermittently stops charging.',
    lastAuditedDate: '2026-10-05',
    assignmentHistory: []
  },
  {
    id: 'tab-006',
    serialNumber: 'TAB-2024-0106',
    imeiNumber: '863920194857201',
    assetTag: 'NHS-TAB-1006',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Excellent',
    status: 'Available',
    lastAuditedDate: '2026-10-01',
    assignmentHistory: [
      {
        id: 'hist-006-a',
        studentName: 'Blessing Gyasi',
        program: 'General Arts',
        classGroup: 'Form 3 Arts 1',
        residenceStatus: 'Boarding',
        assignedDate: '2024-09-15',
        returnedDate: '2025-06-25',
        conditionAtCheckout: 'Excellent',
        conditionAtReturn: 'Excellent',
        returnNotes: 'Student graduated. All 5 accessories returned (Power Bank, earpiece, USB-C cable, keyboard case, charger).',
        issuedBy: 'Mr. P. Owusu (IT Admin)',
        accessoriesIssued: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
      }
    ],
    notes: 'Depot spare pool. Fully boxed with full accessory kit.'
  },
  {
    id: 'tab-007',
    serialNumber: 'TAB-2024-0107',
    imeiNumber: '357291048201934',
    assetTag: 'NHS-TAB-1007',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Good',
    status: 'Assigned',
    currentStudentName: 'Tariq Al-Mansoor',
    currentStudentProgram: 'General Science',
    currentStudentClass: 'Form 3 Sci 1',
    currentResidenceStatus: 'Hostel',
    assignedDate: '2025-09-06',
    expectedReturnDate: '2026-06-30',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'Physics laboratory interactive simulator pack. Full accessories kit issued.',
    lastAuditedDate: '2026-09-22',
    assignmentHistory: []
  },
  {
    id: 'tab-008',
    serialNumber: 'TAB-2024-0108',
    imeiNumber: '865819203847192',
    assetTag: 'NHS-TAB-1008',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Good',
    status: 'Assigned',
    currentStudentName: 'Grace Addo',
    currentStudentProgram: 'Business',
    currentStudentClass: 'Form 2 Bus 2',
    currentResidenceStatus: 'Day',
    assignedDate: '2025-09-09',
    expectedReturnDate: '2026-06-30',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'Spreadsheet business suite installed on KATON SM1. 5 accessories active.',
    lastAuditedDate: '2026-09-25',
    assignmentHistory: []
  },
  {
    id: 'tab-009',
    serialNumber: 'TAB-2024-0109',
    imeiNumber: '359182736450192',
    assetTag: 'NHS-TAB-1009',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Good',
    status: 'Assigned',
    currentStudentName: 'Samuel Kwakye',
    currentStudentProgram: 'Technical',
    currentStudentClass: 'Form 1 Tech A',
    currentResidenceStatus: 'Boarding',
    assignedDate: '2025-09-14',
    expectedReturnDate: '2026-06-30',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'CAD viewer and electronic circuit workbench loaded.',
    lastAuditedDate: '2026-09-27',
    assignmentHistory: []
  },
  {
    id: 'tab-010',
    serialNumber: 'TAB-2024-0110',
    imeiNumber: '862910485729103',
    assetTag: 'NHS-TAB-1010',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Excellent',
    status: 'Assigned',
    currentStudentName: 'Fatima Zarah',
    currentStudentProgram: 'General Science',
    currentStudentClass: 'Form 1 Sci 2',
    currentResidenceStatus: 'Boarding',
    assignedDate: '2025-09-10',
    expectedReturnDate: '2026-06-30',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'KATON SM1 assigned with student ID NHS-STU-2025-412. All 5 accessories verified at distribution.',
    lastAuditedDate: '2026-09-19',
    assignmentHistory: []
  },
  {
    id: 'tab-011',
    serialNumber: 'TAB-2024-0111',
    imeiNumber: '868192038475620',
    assetTag: 'NHS-TAB-1011',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Good',
    status: 'Assigned',
    currentStudentName: 'Kevin Boateng',
    currentStudentProgram: 'Visual Arts',
    currentStudentClass: 'Form 3 Visual',
    currentResidenceStatus: 'Day',
    assignedDate: '2025-09-07',
    expectedReturnDate: '2026-06-30',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'Senior year animation project assignment on KATON SM1.',
    lastAuditedDate: '2026-09-21',
    assignmentHistory: []
  },
  {
    id: 'tab-012',
    serialNumber: 'TAB-2024-0112',
    imeiNumber: '352910485720194',
    assetTag: 'NHS-LOAN-001',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Good',
    status: 'On Loan',
    currentStudentName: 'Chukwudi Eze',
    currentStudentProgram: 'Business',
    currentStudentClass: 'Form 3 Bus 1',
    currentResidenceStatus: 'Boarding',
    assignedDate: '2026-10-02',
    expectedReturnDate: '2026-10-20',
    assignedAccessories: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger'],
    notes: 'Temporary KATON SM1 loaner issued while TAB-2024-0103 screen is repaired at service center.',
    lastAuditedDate: '2026-10-03',
    assignmentHistory: [
      {
        id: 'hist-012-a',
        studentName: 'Abena Mansa',
        program: 'General Arts',
        classGroup: 'Form 2 Arts 1',
        residenceStatus: 'Day',
        assignedDate: '2025-03-10',
        returnedDate: '2025-03-24',
        conditionAtCheckout: 'Excellent',
        conditionAtReturn: 'Good',
        returnNotes: 'Returned after two-week battery inspection loan with all accessories.',
        issuedBy: 'Mr. P. Owusu (IT Admin)',
        accessoriesIssued: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
      }
    ]
  },
  {
    id: 'tab-013',
    serialNumber: 'TAB-2024-0113',
    imeiNumber: '864019283746501',
    assetTag: 'NHS-TAB-1013',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Excellent',
    status: 'Available',
    lastAuditedDate: '2026-10-08',
    assignmentHistory: [],
    notes: 'KATON SM1 unit ready in main IT storage vault, Shelf B-2.'
  },
  {
    id: 'tab-014',
    serialNumber: 'TAB-2024-0114',
    imeiNumber: '356719284019283',
    assetTag: 'NHS-TAB-1014',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Fair',
    status: 'Lost/Stolen',
    currentStudentName: 'Michael Quarshie',
    currentStudentProgram: 'General Science',
    currentStudentClass: 'Form 2 Sci 2',
    currentResidenceStatus: 'Day',
    assignedDate: '2025-09-08',
    assignedAccessories: ['Keyboard Case'],
    notes: 'Reported stolen from school bus stop on 2026-09-28. KATON MDM Guard remotely locked and serial blacklisted.',
    lastAuditedDate: '2026-09-29',
    assignmentHistory: []
  },
  {
    id: 'tab-015',
    serialNumber: 'TAB-2024-0115',
    imeiNumber: '869018273645102',
    assetTag: 'NHS-TAB-1015',
    model: 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: 'Damaged',
    status: 'Decommissioned',
    lastAuditedDate: '2026-08-30',
    assignmentHistory: [
      {
        id: 'hist-015-a',
        studentName: 'Felix Appiah',
        program: 'Technical',
        classGroup: 'Form 3 Tech B',
        residenceStatus: 'Boarding',
        assignedDate: '2024-09-10',
        returnedDate: '2025-05-18',
        conditionAtCheckout: 'Good',
        conditionAtReturn: 'Damaged',
        returnNotes: 'Severe water immersion damage during laboratory pipe burst.',
        issuedBy: 'Mr. P. Owusu (IT Admin)',
        accessoriesIssued: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
      }
    ],
    notes: 'Scrapped for spare components (housing & buttons salvaged for KATON SM1 depot).'
  }
];

export const INITIAL_REPAIR_TICKETS: RepairTicket[] = [
  {
    id: 'rep-101',
    tabletId: 'tab-003',
    serialNumber: 'TAB-2024-0103',
    imeiNumber: '869234057819441',
    model: 'KATON SM1',
    studentName: 'Chukwudi Eze',
    studentClass: 'Form 3 Bus 1',
    issueType: 'Cracked Screen, Physical Chassis Damage',
    hardwareIssues: ['Cracked Screen', 'Physical Chassis Damage'],
    missingAccessories: ['USB Type-C Cable'],
    description: 'Display digitizer shattered across top right corner and top-left corner bumper dented after slipping out of backpack. In-line USB cable also lost.',
    priority: 'High',
    status: 'Awaiting Parts',
    reportedDate: '2026-10-02',
    technicianName: 'Kwame Antwi (Lead Tech)',
    technicianNotes: 'Replacement OEM KATON SM1 10.1-inch IPS LCD panel ordered from KATON distribution center. New Type-C cable allocated.',
    repairCost: 40.00,
    accessoryReplacementCost: 3.00,
    loanerTabletSerial: 'TAB-2024-0112'
  },
  {
    id: 'rep-102',
    tabletId: 'tab-005',
    serialNumber: 'TAB-2024-0105',
    imeiNumber: '354890123847561',
    model: 'KATON SM1',
    studentName: 'Daniel Osei',
    studentClass: 'Form 1 HomeEcon',
    issueType: 'Charging Port Fault, Battery Depleted / Not Charging',
    hardwareIssues: ['Charging Port Fault', 'Battery Depleted / Not Charging'],
    missingAccessories: ['Earpiece', 'Power Bank'],
    description: 'USB-C receptacle pins recessed; cable requires jiggling to initiate charge. Battery currently at 12%. Student also reported misplaced earpiece and power bank at hostel.',
    priority: 'Medium',
    status: 'In Repair',
    reportedDate: '2026-10-05',
    technicianName: 'Kwame Antwi (Lead Tech)',
    technicianNotes: 'Disassembled KATON SM1 sub-board. Replacing daughter USB-C charging ribbon module. Invoicing missing hostel power bank and earpiece.',
    repairCost: 15.00,
    accessoryReplacementCost: 21.50
  },
  {
    id: 'rep-103',
    tabletId: 'tab-001',
    serialNumber: 'TAB-2024-0101',
    imeiNumber: '864720048192031',
    model: 'KATON SM1',
    studentName: 'Emmanuel Ansah',
    studentClass: 'Form 3 Sci 2',
    issueType: 'Software / OS Bootloop',
    hardwareIssues: ['Software / OS Bootloop'],
    missingAccessories: [],
    description: 'Tablet repeatedly crashed to recovery screen following interrupted education ROM update.',
    priority: 'Medium',
    status: 'Resolved',
    reportedDate: '2025-02-14',
    resolvedDate: '2025-02-16',
    technicianName: 'Patricia Yeboah',
    technicianNotes: 'Reflashed official KATON SM1 school enterprise ROM, restored security certificates. Passed QA.',
    repairCost: 0.00,
    accessoryReplacementCost: 0.00
  }
];

export const INITIAL_ACCESSORIES: AccessoryItem[] = [
  {
    id: 'acc-001',
    name: 'KATON 10,000mAh Portable Power Bank',
    category: 'Power Bank',
    modelCompatibility: 'KATON SM1 & Universal Type-C',
    totalQuantity: 250,
    assignedQuantity: 215,
    availableQuantity: 35,
    minimumThreshold: 30,
    unitCost: 18.00,
    storageBin: 'Bin PB-101',
    lastRestockedDate: '2026-09-01'
  },
  {
    id: 'acc-002',
    name: 'Student Stereo Wired Earpiece with In-Line Mic',
    category: 'Earpiece',
    modelCompatibility: 'KATON SM1 3.5mm / Type-C Audio',
    totalQuantity: 300,
    assignedQuantity: 260,
    availableQuantity: 40,
    minimumThreshold: 35,
    unitCost: 3.50,
    storageBin: 'Drawer EP-02',
    lastRestockedDate: '2026-09-12'
  },
  {
    id: 'acc-003',
    name: 'Reinforced Heavy-Duty USB Type-C Cable (1.5m)',
    category: 'USB Type-C Cable',
    modelCompatibility: 'KATON SM1 Standard Fast Charge',
    totalQuantity: 350,
    assignedQuantity: 295,
    availableQuantity: 55,
    minimumThreshold: 40,
    unitCost: 3.00,
    storageBin: 'Bin CB-305',
    lastRestockedDate: '2026-09-15'
  },
  {
    id: 'acc-004',
    name: 'KATON SM1 Magnetic Keyboard Case (Folio Stand)',
    category: 'Keyboard Case',
    modelCompatibility: 'KATON SM1 Dedicated',
    totalQuantity: 220,
    assignedQuantity: 198,
    availableQuantity: 22,
    minimumThreshold: 25,
    unitCost: 28.00,
    storageBin: 'Cabinet KB-01',
    lastRestockedDate: '2026-08-20'
  },
  {
    id: 'acc-005',
    name: 'KATON 20W PD USB-C Fast Wall Charger',
    category: 'Charger',
    modelCompatibility: 'KATON SM1 Standard Power Adapter',
    totalQuantity: 280,
    assignedQuantity: 245,
    availableQuantity: 35,
    minimumThreshold: 30,
    unitCost: 8.50,
    storageBin: 'Bin CH-201',
    lastRestockedDate: '2026-09-05'
  }
];

export const SCHOOL_PROGRAMS = [
  'General Science',
  'General Arts',
  'Business',
  'Visual Arts',
  'Home Economics',
  'Technical',
  'Agricultural Science'
];

export const SCHOOL_CLASSES = [
  'Form 1 Sci 1',
  'Form 1 Sci 2',
  'Form 1 Arts 1',
  'Form 1 Arts 2',
  'Form 1 Bus 1',
  'Form 1 HomeEcon',
  'Form 1 Tech A',
  'Form 2 Sci 1',
  'Form 2 Sci 2',
  'Form 2 Arts 1',
  'Form 2 Bus 1',
  'Form 2 Bus 2',
  'Form 2 Visual',
  'Form 3 Sci 1',
  'Form 3 Sci 2',
  'Form 3 Arts 1',
  'Form 3 Bus 1',
  'Form 3 Visual'
];

export const SCHOOL_YEAR_LEVELS = [
  'Year 1',
  'Year 2',
  'Year 3'
];

export function inferYearLevelFromClass(classGroup?: string): string {
  if (!classGroup) return '';
  const m = classGroup.match(/(?:Form|Year|Grade|Level)\s*(\d+)/i);
  if (m) {
    return `Year ${m[1]}`;
  }
  return '';
}

// Auto-populate year level on initial mock data
INITIAL_TABLETS.forEach(tab => {
  if (tab.currentStudentClass && !tab.currentStudentYearLevel) {
    tab.currentStudentYearLevel = inferYearLevelFromClass(tab.currentStudentClass);
  }
  tab.assignmentHistory.forEach(hist => {
    if (hist.classGroup && !hist.yearLevel) {
      hist.yearLevel = inferYearLevelFromClass(hist.classGroup);
    }
  });
});

INITIAL_REPAIR_TICKETS.forEach(rep => {
  if (rep.studentClass && !rep.studentYearLevel) {
    rep.studentYearLevel = inferYearLevelFromClass(rep.studentClass);
  }
});



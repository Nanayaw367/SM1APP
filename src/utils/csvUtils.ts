import { CsvBulkRow, TabletDevice, ResidenceStatus, TabletStatus, DeviceCondition } from '../types/inventory';
import { inferYearLevelFromClass } from '../data/mockData';

export function parseCsvText(rawText: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some(val => val.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(val => val.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseBulkDeploymentCsv(
  csvContent: string,
  existingTablets: TabletDevice[] = []
): { rows: CsvBulkRow[]; errorsCount: number; validCount: number } {
  const parsed = parseCsvText(csvContent);
  if (parsed.length < 2) {
    return { rows: [], errorsCount: 0, validCount: 0 };
  }

  const headerRow = parsed[0];
  const headerMap: Record<string, number> = {};

  headerRow.forEach((col, idx) => {
    const normalized = normalizeHeader(col);
    headerMap[normalized] = idx;
  });

  // Find column index helper with common variations
  const findCol = (...candidates: string[]): number => {
    for (const c of candidates) {
      const norm = normalizeHeader(c);
      if (headerMap[norm] !== undefined) return headerMap[norm];
    }
    return -1;
  };

  const nameIdx = findCol('Name', 'Student Name', 'Student', 'FullName');
  const yearLevelIdx = findCol('Year Level', 'Year', 'YearLevel', 'Form Level', 'Grade Level', 'Level', 'Academic Year');
  const programIdx = findCol('Program', 'Student Program', 'Course', 'Department');
  const classIdx = findCol('Class', 'Class Group', 'Form', 'Grade', 'Section');
  const residenceIdx = findCol('Residence Status', 'Residence', 'Residential Status', 'Boarding Status');
  const imeiIdx = findCol('IMEI Number', 'IMEI', 'IMEI1', 'Device IMEI');
  const serialIdx = findCol('Serial Number', 'Serial', 'SerialNumber', 'Device Serial', 'S/N');
  
  // Optional columns
  const modelIdx = findCol('Model', 'Tablet Model', 'Device Model');
  const conditionIdx = findCol('Condition', 'Device Condition');
  const statusIdx = findCol('Status', 'Tablet Status', 'Loan Status');
  const notesIdx = findCol('Notes', 'Remark', 'Comments');

  const rows: CsvBulkRow[] = [];
  const seenSerials = new Set<string>();
  const seenImeis = new Set<string>();

  const existingSerials = new Set(existingTablets.map(t => t.serialNumber.trim().toUpperCase()));
  const existingImeis = new Set(existingTablets.map(t => t.imeiNumber.trim()));

  let errorsCount = 0;
  let validCount = 0;

  for (let i = 1; i < parsed.length; i++) {
    const rawCols = parsed[i];
    const getVal = (idx: number) => (idx >= 0 && rawCols[idx] !== undefined ? rawCols[idx].trim() : '');

    const name = getVal(nameIdx);
    const rawYear = getVal(yearLevelIdx);
    const program = getVal(programIdx) || 'General Studies';
    const classGroup = getVal(classIdx) || 'Form 1';
    let residenceStatus = getVal(residenceIdx) || 'Day';
    const imeiNumber = getVal(imeiIdx).replace(/[^0-9]/g, '');
    const serialNumber = getVal(serialIdx).toUpperCase();
    const model = getVal(modelIdx) || 'KATON SM1';
    const condition = getVal(conditionIdx) || 'Excellent';
    const status = getVal(statusIdx) || 'Assigned';
    const notes = getVal(notesIdx);

    // Normalize Year Level: use explicit CSV value if provided, otherwise infer from class
    let yearLevel = rawYear;
    if (!yearLevel) {
      yearLevel = inferYearLevelFromClass(classGroup) || 'Year 1';
    } else {
      const match = yearLevel.match(/(?:Form|Year|Grade|Level)?\s*(\d+)/i);
      if (match) {
        yearLevel = `Year ${match[1]}`;
      }
    }

    const rowErrors: string[] = [];

    // Normalize residence
    const normRes = residenceStatus.toLowerCase();
    if (normRes.includes('board')) {
      residenceStatus = 'Boarding';
    } else if (normRes.includes('hostel')) {
      residenceStatus = 'Hostel';
    } else {
      residenceStatus = 'Day';
    }

    // Validations
    if (!name) {
      rowErrors.push('Student Name is required');
    }
    if (!serialNumber) {
      rowErrors.push('Serial Number is required');
    } else if (seenSerials.has(serialNumber)) {
      rowErrors.push(`Duplicate Serial Number "${serialNumber}" in CSV file`);
    } else if (existingSerials.has(serialNumber)) {
      rowErrors.push(`Serial Number "${serialNumber}" already exists in inventory (will update existing device)`);
    } else {
      seenSerials.add(serialNumber);
    }

    if (!imeiNumber) {
      rowErrors.push('IMEI Number is required');
    } else if (imeiNumber.length < 14 || imeiNumber.length > 16) {
      rowErrors.push(`IMEI must be 15 digits (got ${imeiNumber.length})`);
    } else if (seenImeis.has(imeiNumber)) {
      rowErrors.push(`Duplicate IMEI "${imeiNumber}" in CSV file`);
    } else if (existingImeis.has(imeiNumber)) {
      rowErrors.push(`IMEI "${imeiNumber}" already registered in database`);
    } else {
      seenImeis.add(imeiNumber);
    }

    const isRowValid = rowErrors.filter(e => !e.includes('will update')).length === 0;

    if (isRowValid) {
      validCount++;
    } else {
      errorsCount++;
    }

    rows.push({
      name,
      yearLevel,
      program,
      classGroup,
      residenceStatus,
      imeiNumber,
      serialNumber,
      model,
      condition,
      status,
      notes,
      isValid: isRowValid,
      errors: rowErrors
    });
  }

  return { rows, errorsCount, validCount };
}

export function convertRowToTabletDevice(row: CsvBulkRow, index: number): TabletDevice {
  const today = new Date().toISOString().split('T')[0];
  const serialClean = row.serialNumber.trim();
  const imeiClean = row.imeiNumber.trim();

  // Normalize condition
  let cond: DeviceCondition = 'Good';
  const c = (row.condition || '').toLowerCase();
  if (c.includes('excel')) cond = 'Excellent';
  else if (c.includes('fair')) cond = 'Fair';
  else if (c.includes('damag')) cond = 'Damaged';

  // Normalize status
  let stat: TabletStatus = 'Assigned';
  const s = (row.status || '').toLowerCase();
  if (s.includes('avail')) stat = 'Available';
  else if (s.includes('loan')) stat = 'On Loan';
  else if (s.includes('repair')) stat = 'In Repair';
  else if (s.includes('decom')) stat = 'Decommissioned';
  else if (s.includes('lost') || s.includes('stolen')) stat = 'Lost/Stolen';

  const isAssigned = stat === 'Assigned' || stat === 'On Loan';
  const resolvedYearLevel = row.yearLevel || inferYearLevelFromClass(row.classGroup) || 'Year 1';

  return {
    id: `tab-imp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
    serialNumber: serialClean,
    imeiNumber: imeiClean,
    assetTag: `NHS-TAB-${Math.floor(2000 + Math.random() * 8000)}`,
    model: row.model || 'KATON SM1',
    manufacturer: 'KATON',
    storage: '64GB',
    condition: cond,
    status: stat,
    currentStudentName: isAssigned ? row.name : undefined,
    currentStudentYearLevel: isAssigned ? resolvedYearLevel : undefined,
    currentStudentProgram: isAssigned ? row.program : undefined,
    currentStudentClass: isAssigned ? row.classGroup : undefined,
    currentResidenceStatus: isAssigned ? (row.residenceStatus as ResidenceStatus) : undefined,
    assignedDate: isAssigned ? today : undefined,
    expectedReturnDate: isAssigned ? '2026-06-30' : undefined,
    assignedAccessories: isAssigned
      ? ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
      : [],
    notes: row.notes || 'Bulk imported via deployment CSV with standard 5-piece accessory kit.',
    lastAuditedDate: today,
    assignmentHistory: isAssigned
      ? [
          {
            id: `hist-${Date.now()}-${index}`,
            studentName: row.name,
            yearLevel: resolvedYearLevel,
            program: row.program,
            classGroup: row.classGroup,
            residenceStatus: row.residenceStatus as ResidenceStatus,
            assignedDate: today,
            conditionAtCheckout: cond,
            issuedBy: 'Admin (CSV Bulk Deployment)',
            accessoriesIssued: ['Power Bank', 'Earpiece', 'USB Type-C Cable', 'Keyboard Case', 'Charger']
          }
        ]
      : []
  };
}

export function generateDeploymentsCsv(tablets: TabletDevice[]): string {
  // Ordered attributes: Name, Year Level, Program, Class, Residence Status, IMEI Number, Serial Number...
  const headers = [
    'Name',
    'Year Level',
    'Program',
    'Class',
    'Residence Status',
    'IMEI Number',
    'Serial Number',
    'Model',
    'Condition',
    'Status',
    'Asset Tag',
    'Assigned Date',
    'Notes'
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = tablets.map(t => [
    escapeCsv(t.currentStudentName || ''),
    escapeCsv(t.currentStudentYearLevel || inferYearLevelFromClass(t.currentStudentClass) || ''),
    escapeCsv(t.currentStudentProgram || ''),
    escapeCsv(t.currentStudentClass || ''),
    escapeCsv(t.currentResidenceStatus || ''),
    escapeCsv(t.imeiNumber || ''),
    escapeCsv(t.serialNumber || ''),
    escapeCsv(t.model || ''),
    escapeCsv(t.condition || ''),
    escapeCsv(t.status || ''),
    escapeCsv(t.assetTag || ''),
    escapeCsv(t.assignedDate || ''),
    escapeCsv(t.notes || '')
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function generateSampleCsvContent(): string {
  const headers = [
    'Name',
    'Year Level',
    'Program',
    'Class',
    'Residence Status',
    'IMEI Number',
    'Serial Number',
    'Model',
    'Condition',
    'Status',
    'Notes'
  ];

  const sampleData = [
    [
      'Kwame Mensah-Bonsu',
      'Year 1',
      'General Science',
      'Form 1 Sci 1',
      'Boarding',
      '864720048192099',
      'TAB-2024-0201',
      'KATON SM1',
      'Excellent',
      'Assigned',
      'Physics and Chemistry textbooks synced'
    ],
    [
      'Abena Osei Poku',
      'Year 2',
      'Business',
      'Form 2 Bus 1',
      'Day',
      '358941098273677',
      'TAB-2024-0202',
      'KATON SM1',
      'Good',
      'Assigned',
      'Accounting spreadsheet package installed'
    ],
    [
      'Abdul Rahman Sani',
      'Year 1',
      'General Arts',
      'Form 1 Arts 2',
      'Boarding',
      '869234057819433',
      'TAB-2024-0203',
      'KATON SM1',
      'Excellent',
      'Assigned',
      'English & French audio modules'
    ],
    [
      'Priscilla Antwiwaa',
      'Year 2',
      'Visual Arts',
      'Form 2 Visual',
      'Day',
      '861198034567822',
      'TAB-2024-0204',
      'KATON SM1',
      'Good',
      'Assigned',
      'Issued with active drawing stylus'
    ],
    [
      'Samuel Ekow Dadzie',
      'Year 1',
      'Technical',
      'Form 1 Tech A',
      'Hostel',
      '354890123847588',
      'TAB-2024-0205',
      'KATON SM1',
      'Good',
      'Assigned',
      'Drafting & Circuit simulation tools'
    ]
  ];

  const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

  return [
    headers.join(','),
    ...sampleData.map(r => r.map(escapeCsv).join(','))
  ].join('\n');
}

export function downloadCsvFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

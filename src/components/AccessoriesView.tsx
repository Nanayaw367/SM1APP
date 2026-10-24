import React, { useState } from 'react';
import { 
  AccessoryItem, 
  AccessoryCategory 
} from '../types/inventory';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Search, 
  CheckCircle2, 
  Boxes, 
  FileSpreadsheet, 
  Tag, 
  Layers
} from 'lucide-react';
import { downloadCsvFile } from '../utils/csvUtils';

interface AccessoriesViewProps {
  accessories: AccessoryItem[];
  onUpdateQuantity: (accessoryId: string, delta: number) => void;
  onAddAccessory: (newItem: Omit<AccessoryItem, 'id'>) => void;
}

export const AccessoriesView: React.FC<AccessoriesViewProps> = ({
  accessories,
  onUpdateQuantity,
  onAddAccessory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New accessory form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AccessoryCategory>('Power Bank');
  const [newModelCompat, setNewModelCompat] = useState('KATON SM1');
  const [newTotalQty, setNewTotalQty] = useState(50);
  const [newMinThreshold, setNewMinThreshold] = useState(15);
  const [newUnitCost, setNewUnitCost] = useState(12.50);
  const [newStorageBin, setNewStorageBin] = useState('Bin A-202');

  const filteredAccessories = accessories.filter((acc) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      acc.name.toLowerCase().includes(q) ||
      acc.category.toLowerCase().includes(q) ||
      acc.modelCompatibility.toLowerCase().includes(q) ||
      acc.storageBin.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === 'all' || acc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const lowStockItems = accessories.filter(a => a.availableQuantity <= a.minimumThreshold);

  const exportAccessoriesCsv = () => {
    const headers = [
      'Accessory Name',
      'Category',
      'Compatibility',
      'Total Stock',
      'Assigned',
      'Available In Stock',
      'Min Threshold',
      'Unit Cost ($)',
      'Storage Bin',
      'Last Restocked'
    ];

    const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
    const rows = filteredAccessories.map(a => [
      escape(a.name),
      escape(a.category),
      escape(a.modelCompatibility),
      escape(a.totalQuantity),
      escape(a.assignedQuantity),
      escape(a.availableQuantity),
      escape(a.minimumThreshold),
      escape(a.unitCost.toFixed(2)),
      escape(a.storageBin),
      escape(a.lastRestockedDate)
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsvFile(csv, `edutab_accessories_inventory_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddAccessory({
      name: newName.trim(),
      category: newCategory,
      modelCompatibility: newModelCompat.trim(),
      totalQuantity: Number(newTotalQty) || 1,
      assignedQuantity: 0,
      availableQuantity: Number(newTotalQty) || 1,
      minimumThreshold: Number(newMinThreshold) || 10,
      unitCost: Number(newUnitCost) || 0,
      storageBin: newStorageBin.trim() || 'General Bin',
      lastRestockedDate: new Date().toISOString().split('T')[0]
    });

    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Peripherals & Accessories Inventory
            <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
              {accessories.length} Categories
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage the standard student accessories package: <strong>Power Bank, earpiece, USB Type-c cable, keyboard case, and charger</strong> per KATON SM1 tablet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAccessoriesCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Export Accessories (CSV)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Accessory Batch</span>
          </button>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Low Stock Warning ({lowStockItems.length} items below minimum safety buffer)
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {lowStockItems.map(i => `${i.name} (${i.availableQuantity} left, min ${i.minimumThreshold})`).join(' • ')}
            </p>
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between transition-colors">
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accessories or bins..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Accessory Categories</option>
            <option value="Power Bank">Power Bank</option>
            <option value="Earpiece">Earpiece</option>
            <option value="USB Type-C Cable">USB Type-C Cable</option>
            <option value="Keyboard Case">Keyboard Case</option>
            <option value="Charger">Charger</option>
            <option value="Stylus Pen">Stylus Pen</option>
            <option value="Tempered Glass Protector">Tempered Glass Protector</option>
          </select>
        </div>
      </div>

      {/* Accessories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccessories.map((item) => {
          const isLowStock = item.availableQuantity <= item.minimumThreshold;
          const assignedPercent = Math.min(100, Math.round((item.assignedQuantity / item.totalQuantity) * 100));

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-2xs space-y-3 transition hover:shadow-md ${
                isLowStock ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-100 dark:ring-amber-950' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    {item.name}
                  </h3>
                </div>
                {isLowStock ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Low Stock
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Healthy
                  </span>
                )}
              </div>

              {/* Specs & Location */}
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Compatibility:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{item.modelCompatibility}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Bin Location:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{item.storageBin}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Unit Replacement Cost:</span>
                  <strong className="text-slate-800 dark:text-slate-200">${item.unitCost.toFixed(2)}</strong>
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">
                    Available: <strong className="text-slate-900 dark:text-white">{item.availableQuantity}</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Assigned: {item.assignedQuantity} / {item.totalQuantity} ({assignedPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isLowStock ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${assignedPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Buffer Threshold: Alert if available &le; {item.minimumThreshold} units
                </p>
              </div>

              {/* Quick Adjust Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Restocked: {item.lastRestockedDate}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    disabled={item.availableQuantity <= 0}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
                    title="Deduct 1 unit (used or checked out)"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center transition cursor-pointer"
                    title="Add 1 returned or restocked unit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 10)}
                    className="px-2 h-7 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-[11px] font-semibold flex items-center justify-center transition cursor-pointer"
                    title="Restock +10 units"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Accessory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base">Add New Accessory Batch</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Accessory Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. 20W PD Type-C Fast Charger"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AccessoryCategory)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="Power Bank">Power Bank</option>
                    <option value="Earpiece">Earpiece</option>
                    <option value="USB Type-C Cable">USB Type-C Cable</option>
                    <option value="Keyboard Case">Keyboard Case</option>
                    <option value="Charger">Charger</option>
                    <option value="Stylus Pen">Stylus Pen</option>
                    <option value="Tempered Glass Protector">Tempered Glass Protector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Device Compatibility
                  </label>
                  <input
                    type="text"
                    value={newModelCompat}
                    onChange={(e) => setNewModelCompat(e.target.value)}
                    placeholder="e.g. KATON SM1"
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTotalQty}
                    onChange={(e) => setNewTotalQty(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Min Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newUnitCost}
                    onChange={(e) => setNewUnitCost(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Storage Bin / Shelf Location
                </label>
                <input
                  type="text"
                  value={newStorageBin}
                  onChange={(e) => setNewStorageBin(e.target.value)}
                  placeholder="e.g. Bin C-104 or Cabinet 2"
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

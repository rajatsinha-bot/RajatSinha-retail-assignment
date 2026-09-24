import React from 'react';
import { Filter, RotateCcw, Search, Upload, X } from 'lucide-react';
import { DashboardFilters, MergedRetailRecord } from '../types/retail';

interface FilterBarProps {
  filters: DashboardFilters;
  onChangeFilters: (newFilters: DashboardFilters) => void;
  onResetFilters: () => void;
  dataset: MergedRetailRecord[];
  filteredCount: number;
  totalCount: number;
  onOpenDataModal?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  dataset,
  filteredCount,
  totalCount,
  onOpenDataModal,
}) => {
  // Extract distinct option values dynamically from the loaded dataset
  const options = React.useMemo(() => {
    const weeks = new Set<string>();
    const regions = new Set<string>();
    const stores = new Map<string, string>(); // store_id -> store_name
    const cities = new Set<string>();
    const formats = new Set<string>();
    const categories = new Set<string>();

    dataset.forEach((r) => {
      if (r.week) weeks.add(r.week);
      if (r.region) regions.add(r.region);
      if (r.store_id) stores.set(r.store_id, r.store_name);
      if (r.city) cities.add(r.city);
      if (r.store_format) formats.add(r.store_format);
      if (r.category) categories.add(r.category);
    });

    const sortedWeeks = Array.from(weeks).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB || a.localeCompare(b);
    });

    return {
      weeks: sortedWeeks,
      regions: Array.from(regions).sort(),
      stores: Array.from(stores.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
      cities: Array.from(cities).sort(),
      formats: Array.from(formats).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [dataset]);

  // Count active non-default filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.week !== 'ALL') count++;
    if (filters.region !== 'ALL') count++;
    if (filters.store_id !== 'ALL') count++;
    if (filters.city !== 'ALL') count++;
    if (filters.store_format !== 'ALL') count++;
    if (filters.category !== 'ALL') count++;
    if (filters.searchQuery.trim() !== '') count++;
    return count;
  }, [filters]);

  const handleSelectChange = (key: keyof DashboardFilters, value: string) => {
    onChangeFilters({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Dynamic Filters
            </span>
            {activeFilterCount > 0 && (
              <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {activeFilterCount} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Showing <strong className="text-slate-800">{filteredCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} records
            </span>
            {onOpenDataModal && (
              <button
                onClick={onOpenDataModal}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1 px-2 rounded hover:bg-blue-50 transition-colors"
                title="Upload or change datasets"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Data</span>
              </button>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-rose-600 transition-colors py-1 px-2 rounded hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* Week Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Week
            </label>
            <select
              value={filters.week}
              onChange={(e) => handleSelectChange('week', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Weeks</option>
              {options.weeks.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Region
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleSelectChange('region', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Regions</option>
              {options.regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Store Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Store
            </label>
            <select
              value={filters.store_id}
              onChange={(e) => handleSelectChange('store_id', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 truncate"
            >
              <option value="ALL">All Stores</option>
              {options.stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => handleSelectChange('city', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Cities</option>
              {options.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Store Format Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Store Format
            </label>
            <select
              value={filters.store_format}
              onChange={(e) => handleSelectChange('store_format', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Formats</option>
              {options.formats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Product Category Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleSelectChange('category', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              {options.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => handleSelectChange('searchQuery', e.target.value)}
                placeholder="Store, city..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded pl-8 pr-7 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => handleSelectChange('searchQuery', '')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

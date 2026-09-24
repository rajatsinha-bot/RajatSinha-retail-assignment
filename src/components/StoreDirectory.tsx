import React, { useState } from 'react';
import { ArrowUpDown, ExternalLink, Search, Store } from 'lucide-react';
import { MergedRetailRecord } from '../types/retail';
import { computeStoreLeaderboard, formatCurrency, formatFullCurrency } from '../utils/kpiCalculations';

interface StoreDirectoryProps {
  filteredData: MergedRetailRecord[];
  onSelectStore: (storeId: string) => void;
}

export const StoreDirectory: React.FC<StoreDirectoryProps> = ({
  filteredData,
  onSelectStore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'netSales' | 'achievementPct' | 'atv' | 'returnRatePct'>('netSales');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { allStores } = React.useMemo(
    () => computeStoreLeaderboard(filteredData, 100),
    [filteredData]
  );

  const filteredStores = React.useMemo(() => {
    let result = allStores.filter(
      (s) =>
        s.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.store_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.store_format.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [allStores, searchTerm, sortField, sortOrder]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">
              Store Master Directory & Comprehensive Performance
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full ledger of active retail locations with operational metrics
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search stores, cities, regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <th className="py-2.5 px-4">Store Name & ID</th>
              <th className="py-2.5 px-3">Region</th>
              <th className="py-2.5 px-3">City</th>
              <th className="py-2.5 px-3">Format</th>
              <th
                onClick={() => handleSort('netSales')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Net Sales</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Target Sales</th>
              <th
                onClick={() => handleSort('achievementPct')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Achievement %</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('atv')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>ATV ($)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('returnRatePct')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Return Rate</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStores.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No stores match the current filter and search query.
                </td>
              </tr>
            ) : (
              filteredStores.map((store) => (
                <tr key={store.store_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{store.store_name}</div>
                    <span className="text-[10px] font-mono text-slate-400">{store.store_id}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{store.region}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{store.city}</td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{store.store_format}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    {formatFullCurrency(store.netSales)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {formatFullCurrency(store.targetSales)}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        store.achievementPct >= 100
                          ? 'text-emerald-700'
                          : store.achievementPct >= 90
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {store.achievementPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                    ${store.atv.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                    <span
                      className={
                        store.returnRatePct > 5.0 ? 'text-rose-700 font-semibold' : 'text-slate-600'
                      }
                    >
                      {store.returnRatePct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onSelectStore(store.store_id)}
                      className="px-2 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <span>Filter Store</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

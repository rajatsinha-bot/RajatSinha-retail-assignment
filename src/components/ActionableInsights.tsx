import React from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  HelpCircle,
  Layers,
  MapPin,
  RotateCcw,
  Sparkles,
  Store,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { MergedRetailRecord } from '../types/retail';
import {
  computeHighReturnCategories,
  computeRegionPerformance,
  computeStoresMissingTargets,
  formatCurrency,
  formatFullCurrency,
  formatPct,
} from '../utils/kpiCalculations';

interface ActionableInsightsProps {
  filteredData: MergedRetailRecord[];
  onFilterByRegion: (region: string) => void;
  onFilterByStore: (storeId: string) => void;
  onFilterByCategory: (category: string) => void;
}

export const ActionableInsights: React.FC<ActionableInsightsProps> = ({
  filteredData,
  onFilterByRegion,
  onFilterByStore,
  onFilterByCategory,
}) => {
  const regions = React.useMemo(() => computeRegionPerformance(filteredData), [filteredData]);
  const missingStores = React.useMemo(() => computeStoresMissingTargets(filteredData), [filteredData]);
  const highReturnCategories = React.useMemo(() => computeHighReturnCategories(filteredData, 5.0), [filteredData]);

  const topRegion = regions.length > 0 ? regions[0] : null;
  const bottomRegion = regions.length > 1 ? regions[regions.length - 1] : null;

  const totalShortfall = missingStores.reduce((acc, s) => acc + s.shortfallAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span>Actionable Business Insights & Exception Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time automated diagnostic scans flagging revenue shortfalls, return anomalies, and regional variance
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {missingStores.length} stores missing budget · {highReturnCategories.length} categories high return
        </div>
      </div>

      {/* Insight Pillar 1: Top & Bottom Performing Regions */}
      <div>
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
          01. Regional Variance & Territory Poles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Region Card */}
          {topRegion ? (
            <div className="bg-white border border-slate-200 rounded-lg p-4 relative overflow-hidden transition-all hover:border-slate-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Top Performing Region
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-500">{topRegion.storeCount} Stores</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mt-2">
                    {topRegion.region} Region
                  </h4>
                </div>
                <div className="w-9 h-9 rounded bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Net Sales</span>
                  <span className="font-mono tabular-nums text-base font-bold text-slate-900">
                    {formatFullCurrency(topRegion.netSales)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Achievement</span>
                  <span className="font-mono tabular-nums text-base font-bold text-emerald-700">
                    {topRegion.achievementPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">
                  Budget Surplus:{' '}
                  <strong className="text-emerald-700 font-mono">
                    +{formatCurrency(topRegion.netSales - topRegion.targetSales)}
                  </strong>
                </span>
                <button
                  onClick={() => onFilterByRegion(topRegion.region)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Filter this region</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-400">
              No regional data available for the active selection.
            </div>
          )}

          {/* Bottom Region Card */}
          {bottomRegion ? (
            <div className="bg-white border border-slate-200 rounded-lg p-4 relative overflow-hidden transition-all hover:border-slate-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Bottom Performing Region
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-500">{bottomRegion.storeCount} Stores</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mt-2">
                    {bottomRegion.region} Region
                  </h4>
                </div>
                <div className="w-9 h-9 rounded bg-rose-50 flex items-center justify-center text-rose-700">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Net Sales</span>
                  <span className="font-mono tabular-nums text-base font-bold text-slate-900">
                    {formatFullCurrency(bottomRegion.netSales)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Achievement</span>
                  <span className="font-mono tabular-nums text-base font-bold text-rose-700">
                    {bottomRegion.achievementPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">
                  Budget Shortfall:{' '}
                  <strong className="text-rose-700 font-mono">
                    -{formatCurrency(bottomRegion.targetSales - bottomRegion.netSales)}
                  </strong>
                </span>
                <button
                  onClick={() => onFilterByRegion(bottomRegion.region)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Filter this region</span>
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-400">
              Only single region selected or no bottom region found.
            </div>
          )}
        </div>
      </div>

      {/* Insight Pillar 2: List of Stores Missing Their Sales Targets */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              02. Stores Missing Sales Targets (Target Achievement &lt; 100%)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked in order of dollar shortfall magnitude requiring district manager intervention
            </p>
          </div>
          <div className="text-xs font-mono text-rose-700 font-semibold bg-rose-50 px-2 py-1 rounded border border-rose-200">
            Total Revenue Shortfall: {formatFullCurrency(totalShortfall)}
          </div>
        </div>

        {missingStores.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-semibold text-emerald-900 text-sm">All Stores Reached 100%+ Target</h4>
            <p className="text-emerald-700 mt-1">
              There are currently zero underperforming stores in the filtered cohort.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2.5 px-4">Store & ID</th>
                    <th className="py-2.5 px-3">Region / City</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3 text-right">Target Sales</th>
                    <th className="py-2.5 px-3 text-right">Net Sales</th>
                    <th className="py-2.5 px-3 text-right">Shortfall ($)</th>
                    <th className="py-2.5 px-4 text-right">Achievement %</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {missingStores.map((store) => (
                    <tr key={store.store_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div>{store.store_name}</div>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">
                          {store.store_id}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {store.region} · {store.city}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {store.store_format}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {formatFullCurrency(store.targetSales)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 font-medium whitespace-nowrap">
                        {formatFullCurrency(store.netSales)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-700 font-bold whitespace-nowrap">
                        -{formatFullCurrency(store.shortfallAmount)}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono tabular-nums font-semibold ${
                            store.achievementPct < 85
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {store.achievementPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onFilterByStore(store.store_id)}
                          className="px-2 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        >
                          Drill Down
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Insight Pillar 3: Product Categories with High Return Rates (> 5%) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              03. Categories with High Return Rates (Return Rate &gt; 5.0%)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Categories exceeding the 5.0% return rate ceiling that erode bottom-line margins
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Benchmark Threshold: &le; 5.0% of Net Sales
          </div>
        </div>

        {highReturnCategories.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center text-xs">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
            <h4 className="font-semibold text-emerald-900">All Categories Under 5.0% Return Threshold</h4>
            <p className="text-emerald-700 mt-0.5">
              No product divisions are currently experiencing anomalous return volumes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highReturnCategories.map((cat) => {
              const variancePct = cat.returnRatePct - 5.0;
              return (
                <div
                  key={cat.category}
                  className="bg-white border border-rose-200 rounded-lg p-4 relative transition-all hover:border-rose-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          High Return Alert
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-mono text-rose-600 font-medium">
                          +{variancePct.toFixed(1)}% above tolerance
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-2">
                        {cat.category}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-600">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Return Rate</span>
                      <span className="font-mono tabular-nums font-bold text-rose-700 text-sm">
                        {cat.returnRatePct.toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Returned Dollars</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-800 text-sm">
                        {formatCurrency(cat.returnAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Net Sales</span>
                      <span className="font-mono tabular-nums text-slate-700 text-sm">
                        {formatCurrency(cat.netSales)}
                      </span>
                    </div>
                  </div>

                  {/* Operational recommendation */}
                  <div className="mt-3 text-xs text-slate-600 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      {cat.category.toLowerCase().includes('apparel')
                        ? 'Apparel return drivers: Sizing inconsistency and fit mismatches. Audit garment fit spec sheets and enhance in-store fitting guidance.'
                        : cat.category.toLowerCase().includes('sports')
                        ? 'Sports gear return drivers: Technical equipment failure or post-event buyer remorse. Enforce packaging inspection & pre-sale demo.'
                        : 'Review merchandise defect logs, supplier warranties, and customer feedback surveys to isolate quality batch issues.'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => onFilterByCategory(cat.category)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Filter category</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

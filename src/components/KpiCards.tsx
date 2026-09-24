import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  ShoppingCart,
  RotateCcw,
  Tag,
  Package,
  Layers,
  Store as StoreIcon,
} from 'lucide-react';
import { KpiSummary } from '../types/retail';
import { formatCurrency, formatFullCurrency } from '../utils/kpiCalculations';

interface KpiCardsProps {
  kpi: KpiSummary;
  activeStoreCount: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpi, activeStoreCount }) => {
  const isTargetAchieved = kpi.targetAchievementPct >= 100;
  const targetVarianceAmount = kpi.netSales - kpi.targetSales;
  const isHighReturn = kpi.returnRatePct > 5.0;

  return (
    <div className="space-y-4">
      {/* 5 Primary Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Net Sales ($) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-600">Net Sales</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {formatFullCurrency(kpi.netSales)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Budget</span>
            <span className="font-mono tabular-nums text-slate-700">
              {formatCurrency(kpi.targetSales)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Variance</span>
            <span
              className={`font-mono tabular-nums font-medium ${
                targetVarianceAmount >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {targetVarianceAmount >= 0 ? '+' : ''}
              {formatCurrency(targetVarianceAmount)}
            </span>
          </div>
        </div>

        {/* KPI 2: Target Achievement (%) = (Net Sales / Target Sales) * 100 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-600">Target Achievement</span>
            <Target
              className={`w-4 h-4 ${
                isTargetAchieved ? 'text-emerald-600' : 'text-amber-600'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
                isTargetAchieved ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {kpi.targetAchievementPct.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              (Net / Target) * 100
            </span>
          </div>

          {/* Progress bar visual indicator */}
          <div className="mt-2.5">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isTargetAchieved
                    ? 'bg-emerald-600'
                    : kpi.targetAchievementPct >= 90
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, kpi.targetAchievementPct))}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-2 pt-1.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Status</span>
            <span
              className={`font-medium ${
                isTargetAchieved
                  ? 'text-emerald-700'
                  : kpi.targetAchievementPct >= 90
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {isTargetAchieved
                ? 'Target Met'
                : `${(100 - kpi.targetAchievementPct).toFixed(1)}% Shortfall`}
            </span>
          </div>
        </div>

        {/* KPI 3: Average Transaction Value ($) = Net Sales / Total Transactions */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-600">Avg Transaction Value</span>
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            ${kpi.avgTransactionValue.toFixed(2)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Transactions</span>
            <span className="font-mono tabular-nums text-slate-700">
              {kpi.totalTransactions.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Units / Order</span>
            <span className="font-mono tabular-nums text-slate-700">
              {kpi.totalTransactions > 0
                ? (kpi.unitsSold / kpi.totalTransactions).toFixed(2)
                : '0.00'}{' '}
              units
            </span>
          </div>
        </div>

        {/* KPI 4: Return Rate (%) = (Return Amount / Net Sales) * 100 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-600">Return Rate</span>
            <RotateCcw
              className={`w-4 h-4 ${
                isHighReturn ? 'text-rose-600' : 'text-slate-500'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
                isHighReturn ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {kpi.returnRatePct.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              (Return / Net) * 100
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Returned Value</span>
            <span className="font-mono tabular-nums text-rose-700">
              {formatCurrency(kpi.returnAmount)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Benchmark Limit</span>
            <span
              className={`font-mono tabular-nums ${
                isHighReturn ? 'text-rose-600 font-semibold' : 'text-emerald-700'
              }`}
            >
              {isHighReturn ? 'Exceeds 5.0% threshold' : 'Optimal (≤ 5%)'}
            </span>
          </div>
        </div>

        {/* KPI 5: Discount Rate (%) = (Discount Amount / Gross Sales) * 100 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-600">Discount Rate</span>
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
              {kpi.discountRatePct.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              (Disc / Gross) * 100
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Promotions Given</span>
            <span className="font-mono tabular-nums text-slate-700">
              {formatCurrency(kpi.discountAmount)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Gross Sales</span>
            <span className="font-mono tabular-nums text-slate-700">
              {formatCurrency(kpi.grossSales)}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Operational Summary Metrics Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <StoreIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Active Stores:</span>
          <strong className="text-slate-900 font-mono tabular-nums">
            {activeStoreCount}
          </strong>
        </div>
        <span className="text-slate-300 hidden sm:inline">|</span>

        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Units Sold:</span>
          <strong className="text-slate-900 font-mono tabular-nums">
            {kpi.unitsSold.toLocaleString()}
          </strong>
        </div>
        <span className="text-slate-300 hidden sm:inline">|</span>

        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          <span>Gross Revenue:</span>
          <strong className="text-slate-900 font-mono tabular-nums">
            {formatCurrency(kpi.grossSales)}
          </strong>
        </div>
        <span className="text-slate-300 hidden sm:inline">|</span>

        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-slate-400" />
          <span>Avg Stockout Rate:</span>
          <strong
            className={`font-mono tabular-nums ${
              kpi.avgStockoutRatePct > 8
                ? 'text-rose-700'
                : kpi.avgStockoutRatePct > 5
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {kpi.avgStockoutRatePct.toFixed(1)}%
          </strong>
        </div>
        <span className="text-slate-300 hidden sm:inline">|</span>

        <div className="flex items-center gap-1.5">
          <span>Net Realization:</span>
          <strong className="text-slate-900 font-mono tabular-nums">
            {kpi.grossSales > 0
              ? `${((kpi.netSales / kpi.grossSales) * 100).toFixed(1)}%`
              : '0.0%'}
          </strong>
        </div>
      </div>
    </div>
  );
};

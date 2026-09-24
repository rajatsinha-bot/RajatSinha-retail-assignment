import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ShieldAlert,
  Store,
} from 'lucide-react';
import {
  MergedRetailRecord,
  StockoutRiskStore,
} from '../types/retail';
import {
  computeCategoryPerformance,
  computeRegionPerformance,
  computeStockoutRisks,
  computeStoreLeaderboard,
  computeWeeklyTrend,
  formatCurrency,
  formatFullCurrency,
} from '../utils/kpiCalculations';

interface VisualAnalyticsProps {
  filteredData: MergedRetailRecord[];
  onSelectStore?: (storeId: string) => void;
  onSelectRegion?: (region: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({
  filteredData,
  onSelectStore,
  onSelectRegion,
  onSelectCategory,
}) => {
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const regionChartRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const storeChartRef = useRef<HTMLCanvasElement | null>(null);

  const lineChartInstance = useRef<Chart | null>(null);
  const regionChartInstance = useRef<Chart | null>(null);
  const categoryChartInstance = useRef<Chart | null>(null);
  const storeChartInstance = useRef<Chart | null>(null);

  const [storeViewMode, setStoreViewMode] = useState<'top' | 'bottom'>('top');

  // Compute aggregations
  const weeklyData = React.useMemo(() => computeWeeklyTrend(filteredData), [filteredData]);
  const regionalData = React.useMemo(() => computeRegionPerformance(filteredData), [filteredData]);
  const categoryData = React.useMemo(() => computeCategoryPerformance(filteredData), [filteredData]);
  const storeLeaderboard = React.useMemo(() => computeStoreLeaderboard(filteredData, 8), [filteredData]);
  const stockoutRiskInfo = React.useMemo(() => computeStockoutRisks(filteredData), [filteredData]);

  // Chart 1: Weekly Sales Trend (Line Chart)
  useEffect(() => {
    if (!lineChartRef.current) return;

    if (lineChartInstance.current) {
      lineChartInstance.current.destroy();
    }

    const ctx = lineChartRef.current.getContext('2d');
    if (!ctx) return;

    lineChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeklyData.labels,
        datasets: [
          {
            label: 'Net Sales',
            data: weeklyData.netSales,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            fill: true,
            tension: 0.28,
            borderWidth: 2.5,
            pointBackgroundColor: '#2563eb',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Target Budget',
            data: weeklyData.targetSales,
            borderColor: '#94a3b8',
            borderDash: [5, 5],
            fill: false,
            tension: 0.28,
            borderWidth: 2,
            pointBackgroundColor: '#94a3b8',
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'Returns ($)',
            data: weeklyData.returnAmount,
            borderColor: '#e11d48',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            tension: 0.28,
            pointBackgroundColor: '#e11d48',
            pointRadius: 3,
            hidden: true, // User can toggle on in chart legend
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 11, family: 'system-ui' },
              color: '#475569',
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y ?? 0;
                return ` ${label}: $${val.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#64748b' },
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              font: { size: 11 },
              color: '#64748b',
              callback: (value) => formatCurrency(Number(value)),
            },
          },
        },
      },
    });

    return () => {
      lineChartInstance.current?.destroy();
    };
  }, [weeklyData]);

  // Chart 2: Net Sales by Region (Bar Chart)
  useEffect(() => {
    if (!regionChartRef.current) return;

    if (regionChartInstance.current) {
      regionChartInstance.current.destroy();
    }

    const ctx = regionChartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = regionalData.map((r) => r.region);
    const netSales = regionalData.map((r) => r.netSales);
    const targetSales = regionalData.map((r) => r.targetSales);

    regionChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Net Sales',
            data: netSales,
            backgroundColor: '#3b82f6',
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 36,
          },
          {
            label: 'Target Sales',
            data: targetSales,
            backgroundColor: '#cbd5e1',
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              color: '#475569',
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y ?? 0;
                return ` ${label}: $${val.toLocaleString()}`;
              },
              afterBody: (items) => {
                const idx = items[0]?.dataIndex;
                if (idx !== undefined && regionalData[idx]) {
                  const ach = regionalData[idx].achievementPct;
                  return [`Target Achieved: ${ach.toFixed(1)}%`];
                }
                return [];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#64748b' },
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              font: { size: 11 },
              color: '#64748b',
              callback: (value) => formatCurrency(Number(value)),
            },
          },
        },
      },
    });

    return () => {
      regionChartInstance.current?.destroy();
    };
  }, [regionalData]);

  // Chart 3: Category Performance (Donut Chart)
  useEffect(() => {
    if (!categoryChartRef.current) return;

    if (categoryChartInstance.current) {
      categoryChartInstance.current.destroy();
    }

    const ctx = categoryChartRef.current.getContext('2d');
    if (!ctx) return;

    const colors = [
      '#2563eb', // Indigo / Blue
      '#059669', // Emerald
      '#d97706', // Amber
      '#7c3aed', // Purple
      '#e11d48', // Rose
      '#0891b2', // Cyan
      '#475569', // Slate
    ];

    categoryChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryData.map((c) => c.category),
        datasets: [
          {
            data: categoryData.map((c) => c.netSales),
            backgroundColor: colors.slice(0, categoryData.length),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: {
            display: false, // We render a refined custom tabular legend below the chart
          },
          tooltip: {
            backgroundColor: '#0f172a',
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const val = context.parsed ?? 0;
                const total = context.dataset.data.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0) as number;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                return ` ${label}: $${val.toLocaleString()} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      categoryChartInstance.current?.destroy();
    };
  }, [categoryData]);

  // Chart 4: Top Store Leaderboard (Horizontal Bar Chart)
  useEffect(() => {
    if (!storeChartRef.current) return;

    if (storeChartInstance.current) {
      storeChartInstance.current.destroy();
    }

    const ctx = storeChartRef.current.getContext('2d');
    if (!ctx) return;

    const storesToShow =
      storeViewMode === 'top'
        ? storeLeaderboard.topStores
        : storeLeaderboard.bottomStores;

    const labels = storesToShow.map((s) => s.store_name);
    const data = storesToShow.map((s) => s.netSales);
    const achievements = storesToShow.map((s) => s.achievementPct);

    // Color bars based on target achievement
    const barColors = achievements.map((ach) =>
      ach >= 100 ? '#10b981' : ach >= 90 ? '#f59e0b' : '#f43f5e'
    );

    storeChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Net Sales ($)',
            data,
            backgroundColor: barColors,
            borderRadius: 4,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            callbacks: {
              label: (context) => {
                const val = context.parsed.x ?? 0;
                const idx = context.dataIndex;
                const store = storesToShow[idx];
                return [
                  ` Net Sales: $${val.toLocaleString()}`,
                  ` Target: $${store.targetSales.toLocaleString()}`,
                  ` Achievement: ${store.achievementPct.toFixed(1)}%`,
                  ` Region: ${store.region} (${store.store_format})`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              font: { size: 10 },
              color: '#64748b',
              callback: (value) => formatCurrency(Number(value)),
            },
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              color: '#334155',
              callback: function (val, index) {
                const label = labels[index] || '';
                return label.length > 20 ? label.slice(0, 18) + '...' : label;
              },
            },
          },
        },
      },
    });

    return () => {
      storeChartInstance.current?.destroy();
    };
  }, [storeLeaderboard, storeViewMode]);

  return (
    <div className="space-y-6">
      {/* 2-Column Grid: Weekly Trend & Net Sales by Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Analytics 1: Weekly Sales Trend */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <LineIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Weekly Sales Trend vs Target
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {weeklyData.labels.length} Periods
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pacing of net sales vs target budget over selected fiscal weeks
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full relative">
            <canvas ref={lineChartRef} />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Net Sales</span>
            <span className="font-mono tabular-nums font-medium text-slate-800">
              {weeklyData.netSales.length > 0
                ? formatFullCurrency(Math.max(...weeklyData.netSales))
                : '$0'}
            </span>
          </div>
        </div>

        {/* Visual Analytics 2: Net Sales by Region */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Net Sales by Region
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {regionalData.length} Territories
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Regional sales distribution compared against assigned target targets
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full relative">
            <canvas ref={regionChartRef} />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Leading Territory</span>
            <span className="font-mono tabular-nums font-medium text-slate-800">
              {regionalData[0]
                ? `${regionalData[0].region}: ${formatCurrency(regionalData[0].netSales)} (${regionalData[0].achievementPct.toFixed(1)}%)`
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Category Performance (Donut) & Top Store Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Analytics 3: Category Performance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Category Performance & Revenue Share
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {categoryData.length} Categories
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Contribution share of net sales by merchandise division
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-56 w-full relative flex items-center justify-center">
              <canvas ref={categoryChartRef} />
            </div>

            {/* Custom refined tabular legend */}
            <div className="space-y-2 text-xs">
              {categoryData.map((c, idx) => {
                const colors = [
                  'bg-blue-600',
                  'bg-emerald-600',
                  'bg-amber-600',
                  'bg-purple-600',
                  'bg-rose-600',
                  'bg-cyan-600',
                  'bg-slate-600',
                ];
                return (
                  <div
                    key={c.category}
                    onClick={() => onSelectCategory?.(c.category)}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[idx % colors.length]}`} />
                      <span className="truncate text-slate-700 font-medium">{c.category}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {c.sharePct.toFixed(1)}%
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] block">
                        {formatCurrency(c.netSales)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dominant Category</span>
            <span className="font-mono tabular-nums font-medium text-slate-800">
              {categoryData[0] ? `${categoryData[0].category} (${categoryData[0].sharePct.toFixed(1)}%)` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Visual Analytics 4: Top Store Leaderboard */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Store Sales Leaderboard
                </h3>
              </div>

              {/* Toggle Top vs Bottom */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded text-xs">
                <button
                  onClick={() => setStoreViewMode('top')}
                  className={`px-2.5 py-1 rounded transition-colors font-medium ${
                    storeViewMode === 'top'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Top Stores
                </button>
                <button
                  onClick={() => setStoreViewMode('bottom')}
                  className={`px-2.5 py-1 rounded transition-colors font-medium ${
                    storeViewMode === 'bottom'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lagging Stores
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Net sales ranking with target health (Green: ≥100%, Amber: 90-99%, Rose: &lt;90%)
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full relative">
            <canvas ref={storeChartRef} />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ranking Count</span>
            <span className="font-mono tabular-nums text-slate-700">
              Showing {storeViewMode === 'top' ? 'Top' : 'Bottom'} {Math.min(8, storeLeaderboard.allStores.length)} of {storeLeaderboard.allStores.length} stores
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics 5: Stockout Risk Indicator (Status List / Visual Gauge) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Stockout Risk Indicator & Inventory Health
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active inventory availability monitoring and revenue at risk from empty shelves
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Estimated Lost Revenue
              </span>
              <span className="text-sm font-bold font-mono tabular-nums text-rose-700">
                {formatFullCurrency(stockoutRiskInfo.totalRevenueAtRisk)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Visual Gauge: Overall Inventory Health Gauge Meter */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Inventory Health Score
            </span>

            {/* Circular / Semi-gauge visual */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={
                    stockoutRiskInfo.overallHealthScore >= 80
                      ? '#10b981'
                      : stockoutRiskInfo.overallHealthScore >= 60
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * stockoutRiskInfo.overallHealthScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                  {stockoutRiskInfo.overallHealthScore}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                {stockoutRiskInfo.overallHealthScore >= 80 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span
                  className={
                    stockoutRiskInfo.overallHealthScore >= 80
                      ? 'text-emerald-700'
                      : stockoutRiskInfo.overallHealthScore >= 60
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }
                >
                  {stockoutRiskInfo.overallHealthScore >= 80
                    ? 'Healthy Availability'
                    : stockoutRiskInfo.overallHealthScore >= 60
                    ? 'Moderate Stockout Pressure'
                    : 'Critical Stockout Deficit'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Average across all active store-category pairs is{' '}
                <strong className="font-mono text-slate-700">
                  {stockoutRiskInfo.overallStockoutRate.toFixed(1)}%
                </strong>{' '}
                unfulfilled SKUs.
              </p>
            </div>
          </div>

          {/* Status List of Stores & Categories with Stockout Risk */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
              <span>High Priority Stockout Incidents</span>
              <span>Stockout Rate · Revenue at Risk</span>
            </div>

            {stockoutRiskInfo.riskStoreList.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                All monitored categories currently meet the minimum 95% in-stock threshold.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stockoutRiskInfo.riskStoreList.map((item, idx) => (
                  <div
                    key={`${item.store_id}-${item.category}-${idx}`}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded transition-colors text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {item.store_name}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">{item.category}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            item.riskLevel === 'high'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.riskLevel === 'high' ? 'High Risk' : 'Warning'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.stockoutItems} of {item.totalSkus} SKUs unavailable ({item.region} Region)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono tabular-nums font-bold text-slate-900">
                        {item.stockoutRatePct.toFixed(1)}% OOS
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-rose-600">
                        ~{formatCurrency(item.estimatedRevenueAtRisk)} at risk
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import {
  DashboardFilters,
  HighReturnCategory,
  KpiSummary,
  MergedRetailRecord,
  RegionPerformance,
  StockoutRiskStore,
  StoreMissingTarget,
} from '../types/retail';

/**
 * Filter dataset based on active dashboard filters
 */
export function applyFilters(
  records: MergedRetailRecord[],
  filters: DashboardFilters
): MergedRetailRecord[] {
  return records.filter((rec) => {
    if (filters.week && filters.week !== 'ALL' && rec.week !== filters.week) {
      return false;
    }
    if (filters.region && filters.region !== 'ALL' && rec.region !== filters.region) {
      return false;
    }
    if (filters.store_id && filters.store_id !== 'ALL' && rec.store_id !== filters.store_id) {
      return false;
    }
    if (filters.city && filters.city !== 'ALL' && rec.city !== filters.city) {
      return false;
    }
    if (filters.store_format && filters.store_format !== 'ALL' && rec.store_format !== filters.store_format) {
      return false;
    }
    if (filters.category && filters.category !== 'ALL' && rec.category !== filters.category) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        rec.store_name.toLowerCase().includes(q) ||
        rec.store_id.toLowerCase().includes(q) ||
        rec.city.toLowerCase().includes(q) ||
        rec.region.toLowerCase().includes(q) ||
        rec.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

/**
 * Compute aggregate KPIs for the current dataset
 */
export function computeKpiSummary(records: MergedRetailRecord[]): KpiSummary {
  if (!records || records.length === 0) {
    return {
      netSales: 0,
      targetSales: 0,
      grossSales: 0,
      discountAmount: 0,
      returnAmount: 0,
      totalTransactions: 0,
      unitsSold: 0,
      targetAchievementPct: 0,
      avgTransactionValue: 0,
      returnRatePct: 0,
      discountRatePct: 0,
      avgStockoutRatePct: 0,
      totalRecordsCount: 0,
    };
  }

  let netSales = 0;
  let targetSales = 0;
  let grossSales = 0;
  let discountAmount = 0;
  let returnAmount = 0;
  let totalTransactions = 0;
  let unitsSold = 0;
  let totalStockoutItems = 0;
  let totalSkus = 0;

  for (const r of records) {
    netSales += r.net_sales;
    targetSales += r.target_sales;
    grossSales += r.gross_sales;
    discountAmount += r.discount_amount;
    returnAmount += r.return_amount;
    totalTransactions += r.total_transactions;
    unitsSold += r.units_sold;
    totalStockoutItems += r.stockout_items || 0;
    totalSkus += r.total_skus || 0;
  }

  const targetAchievementPct = targetSales > 0 ? (netSales / targetSales) * 100 : 0;
  const avgTransactionValue = totalTransactions > 0 ? netSales / totalTransactions : 0;
  const returnRatePct = netSales > 0 ? (returnAmount / netSales) * 100 : 0;
  const discountRatePct = grossSales > 0 ? (discountAmount / grossSales) * 100 : 0;
  const avgStockoutRatePct = totalSkus > 0 ? (totalStockoutItems / totalSkus) * 100 : 0;

  return {
    netSales,
    targetSales,
    grossSales,
    discountAmount,
    returnAmount,
    totalTransactions,
    unitsSold,
    targetAchievementPct,
    avgTransactionValue,
    returnRatePct,
    discountRatePct,
    avgStockoutRatePct,
    totalRecordsCount: records.length,
  };
}

/**
 * Weekly Sales Trend (Line Chart data)
 */
export function computeWeeklyTrend(records: MergedRetailRecord[]) {
  const weekMap = new Map<string, { netSales: number; targetSales: number; returnAmount: number; discountAmount: number }>();

  records.forEach((r) => {
    const existing = weekMap.get(r.week) || {
      netSales: 0,
      targetSales: 0,
      returnAmount: 0,
      discountAmount: 0,
    };
    existing.netSales += r.net_sales;
    existing.targetSales += r.target_sales;
    existing.returnAmount += r.return_amount;
    existing.discountAmount += r.discount_amount;
    weekMap.set(r.week, existing);
  });

  // Sort weeks numerically/alphabetically
  const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
    const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
    return numA - numB || a.localeCompare(b);
  });

  return {
    labels: sortedWeeks,
    netSales: sortedWeeks.map((w) => Math.round(weekMap.get(w)!.netSales)),
    targetSales: sortedWeeks.map((w) => Math.round(weekMap.get(w)!.targetSales)),
    returnAmount: sortedWeeks.map((w) => Math.round(weekMap.get(w)!.returnAmount)),
    achievementPct: sortedWeeks.map((w) => {
      const data = weekMap.get(w)!;
      return data.targetSales > 0 ? Number(((data.netSales / data.targetSales) * 100).toFixed(1)) : 100;
    }),
  };
}

/**
 * Net Sales by Region (Bar Chart data & Regional insights)
 */
export function computeRegionPerformance(records: MergedRetailRecord[]): RegionPerformance[] {
  const regionMap = new Map<
    string,
    { netSales: number; targetSales: number; storeIds: Set<string> }
  >();

  records.forEach((r) => {
    const reg = r.region || 'Unassigned';
    const curr = regionMap.get(reg) || {
      netSales: 0,
      targetSales: 0,
      storeIds: new Set<string>(),
    };
    curr.netSales += r.net_sales;
    curr.targetSales += r.target_sales;
    curr.storeIds.add(r.store_id);
    regionMap.set(reg, curr);
  });

  const list: RegionPerformance[] = Array.from(regionMap.entries()).map(([region, data]) => ({
    region,
    netSales: Math.round(data.netSales),
    targetSales: Math.round(data.targetSales),
    achievementPct: data.targetSales > 0 ? (data.netSales / data.targetSales) * 100 : 0,
    storeCount: data.storeIds.size,
  }));

  // Sort by net sales descending
  return list.sort((a, b) => b.netSales - a.netSales);
}

/**
 * Category Performance (Donut Chart & Breakdown)
 */
export function computeCategoryPerformance(records: MergedRetailRecord[]) {
  const catMap = new Map<
    string,
    {
      netSales: number;
      targetSales: number;
      returnAmount: number;
      discountAmount: number;
      grossSales: number;
      transactions: number;
      units: number;
    }
  >();

  let totalSales = 0;

  records.forEach((r) => {
    totalSales += r.net_sales;
    const curr = catMap.get(r.category) || {
      netSales: 0,
      targetSales: 0,
      returnAmount: 0,
      discountAmount: 0,
      grossSales: 0,
      transactions: 0,
      units: 0,
    };
    curr.netSales += r.net_sales;
    curr.targetSales += r.target_sales;
    curr.returnAmount += r.return_amount;
    curr.discountAmount += r.discount_amount;
    curr.grossSales += r.gross_sales;
    curr.transactions += r.total_transactions;
    curr.units += r.units_sold;
    catMap.set(r.category, curr);
  });

  const items = Array.from(catMap.entries()).map(([category, val]) => ({
    category,
    netSales: Math.round(val.netSales),
    targetSales: Math.round(val.targetSales),
    returnAmount: Math.round(val.returnAmount),
    discountAmount: Math.round(val.discountAmount),
    grossSales: Math.round(val.grossSales),
    sharePct: totalSales > 0 ? (val.netSales / totalSales) * 100 : 0,
    returnRatePct: val.netSales > 0 ? (val.returnAmount / val.netSales) * 100 : 0,
    discountRatePct: val.grossSales > 0 ? (val.discountAmount / val.grossSales) * 100 : 0,
    atv: val.transactions > 0 ? val.netSales / val.transactions : 0,
  }));

  return items.sort((a, b) => b.netSales - a.netSales);
}

/**
 * Store Leaderboard (Top stores by Net Sales)
 */
export function computeStoreLeaderboard(records: MergedRetailRecord[], limit = 10) {
  const storeMap = new Map<
    string,
    {
      store_id: string;
      store_name: string;
      region: string;
      city: string;
      store_format: string;
      netSales: number;
      targetSales: number;
      transactions: number;
      returns: number;
      discounts: number;
    }
  >();

  records.forEach((r) => {
    const curr = storeMap.get(r.store_id) || {
      store_id: r.store_id,
      store_name: r.store_name,
      region: r.region,
      city: r.city,
      store_format: r.store_format,
      netSales: 0,
      targetSales: 0,
      transactions: 0,
      returns: 0,
      discounts: 0,
    };
    curr.netSales += r.net_sales;
    curr.targetSales += r.target_sales;
    curr.transactions += r.total_transactions;
    curr.returns += r.return_amount;
    curr.discounts += r.discount_amount;
    storeMap.set(r.store_id, curr);
  });

  const allStores = Array.from(storeMap.values()).map((s) => ({
    ...s,
    netSales: Math.round(s.netSales),
    targetSales: Math.round(s.targetSales),
    achievementPct: s.targetSales > 0 ? (s.netSales / s.targetSales) * 100 : 0,
    atv: s.transactions > 0 ? s.netSales / s.transactions : 0,
    returnRatePct: s.netSales > 0 ? (s.returns / s.netSales) * 100 : 0,
  }));

  allStores.sort((a, b) => b.netSales - a.netSales);

  return {
    topStores: allStores.slice(0, limit),
    bottomStores: [...allStores].reverse().slice(0, limit),
    allStores,
  };
}

/**
 * Actionable insight: List of stores missing their sales targets (< 100%)
 */
export function computeStoresMissingTargets(records: MergedRetailRecord[]): StoreMissingTarget[] {
  const storeMap = new Map<
    string,
    {
      store_id: string;
      store_name: string;
      region: string;
      city: string;
      store_format: string;
      netSales: number;
      targetSales: number;
    }
  >();

  records.forEach((r) => {
    const curr = storeMap.get(r.store_id) || {
      store_id: r.store_id,
      store_name: r.store_name,
      region: r.region,
      city: r.city,
      store_format: r.store_format,
      netSales: 0,
      targetSales: 0,
    };
    curr.netSales += r.net_sales;
    curr.targetSales += r.target_sales;
    storeMap.set(r.store_id, curr);
  });

  const missing: StoreMissingTarget[] = [];

  for (const s of storeMap.values()) {
    if (s.netSales < s.targetSales) {
      const shortfallAmount = Math.round(s.targetSales - s.netSales);
      const achievementPct = (s.netSales / s.targetSales) * 100;
      missing.push({
        store_id: s.store_id,
        store_name: s.store_name,
        region: s.region,
        city: s.city,
        store_format: s.store_format,
        netSales: Math.round(s.netSales),
        targetSales: Math.round(s.targetSales),
        shortfallAmount,
        achievementPct,
      });
    }
  }

  // Sort by shortfall amount descending (biggest misses first)
  return missing.sort((a, b) => b.shortfallAmount - a.shortfallAmount);
}

/**
 * Actionable insight: Product categories with high return rates (> 5%)
 */
export function computeHighReturnCategories(
  records: MergedRetailRecord[],
  thresholdPct = 5.0
): HighReturnCategory[] {
  const catMap = new Map<
    string,
    { returnAmount: number; netSales: number; grossSales: number }
  >();

  records.forEach((r) => {
    const curr = catMap.get(r.category) || {
      returnAmount: 0,
      netSales: 0,
      grossSales: 0,
    };
    curr.returnAmount += r.return_amount;
    curr.netSales += r.net_sales;
    curr.grossSales += r.gross_sales;
    catMap.set(r.category, curr);
  });

  const highReturns: HighReturnCategory[] = [];

  for (const [category, val] of catMap.entries()) {
    const returnRatePct = val.netSales > 0 ? (val.returnAmount / val.netSales) * 100 : 0;
    if (returnRatePct > thresholdPct) {
      highReturns.push({
        category,
        returnRatePct,
        returnAmount: Math.round(val.returnAmount),
        netSales: Math.round(val.netSales),
        grossSales: Math.round(val.grossSales),
      });
    }
  }

  // Sort descending by return rate
  return highReturns.sort((a, b) => b.returnRatePct - a.returnRatePct);
}

/**
 * Stockout Risk Indicator & Status List
 */
export function computeStockoutRisks(records: MergedRetailRecord[]): {
  overallStockoutRate: number;
  overallHealthScore: number;
  totalSkusAtRisk: number;
  totalRevenueAtRisk: number;
  riskStoreList: StockoutRiskStore[];
} {
  const groupMap = new Map<
    string,
    {
      store_id: string;
      store_name: string;
      region: string;
      category: string;
      stockoutItems: number;
      totalSkus: number;
      netSales: number;
    }
  >();

  let grandStockoutItems = 0;
  let grandTotalSkus = 0;

  records.forEach((r) => {
    const key = `${r.store_id}__${r.category}`;
    const curr = groupMap.get(key) || {
      store_id: r.store_id,
      store_name: r.store_name,
      region: r.region,
      category: r.category,
      stockoutItems: 0,
      totalSkus: 0,
      netSales: 0,
    };
    curr.stockoutItems += r.stockout_items || 0;
    curr.totalSkus += r.total_skus || 0;
    curr.netSales += r.net_sales;
    groupMap.set(key, curr);

    grandStockoutItems += r.stockout_items || 0;
    grandTotalSkus += r.total_skus || 0;
  });

  const list: StockoutRiskStore[] = [];
  let totalRevenueAtRisk = 0;
  let totalSkusAtRisk = 0;

  for (const item of groupMap.values()) {
    const stockoutRatePct = item.totalSkus > 0 ? (item.stockoutItems / item.totalSkus) * 100 : 0;
    // Estimated lost sales opportunity due to stockout
    const estimatedRev = Math.round(item.netSales * (stockoutRatePct / 100) * 0.35);

    let riskLevel: 'high' | 'warning' | 'safe' = 'safe';
    if (stockoutRatePct >= 10) {
      riskLevel = 'high';
      totalRevenueAtRisk += estimatedRev;
      totalSkusAtRisk += item.stockoutItems;
    } else if (stockoutRatePct >= 5) {
      riskLevel = 'warning';
      totalRevenueAtRisk += Math.round(estimatedRev * 0.5);
    }

    if (stockoutRatePct >= 5) {
      list.push({
        store_id: item.store_id,
        store_name: item.store_name,
        region: item.region,
        category: item.category,
        stockoutRatePct,
        stockoutItems: item.stockoutItems,
        totalSkus: item.totalSkus,
        estimatedRevenueAtRisk: estimatedRev,
        riskLevel,
      });
    }
  }

  // Sort by stockout rate descending
  list.sort((a, b) => b.stockoutRatePct - a.stockoutRatePct);

  const overallStockoutRate = grandTotalSkus > 0 ? (grandStockoutItems / grandTotalSkus) * 100 : 0;
  // Inventory Health Score (0 - 100, where 100 is 0% stockout)
  const overallHealthScore = Math.max(0, Math.min(100, Math.round(100 - overallStockoutRate * 3.5)));

  return {
    overallStockoutRate,
    overallHealthScore,
    totalSkusAtRisk,
    totalRevenueAtRisk,
    riskStoreList: list.slice(0, 8),
  };
}

/**
 * Format currency helper
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatFullCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPct(val: number): string {
  return `${val.toFixed(1)}%`;
}

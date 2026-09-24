export interface StoreMaster {
  store_id: string;
  store_name: string;
  region: string;
  city: string;
  store_format: string;
  manager_name?: string;
  sqft?: number;
}

export interface WeeklySaleRecord {
  sale_id?: string;
  store_id: string;
  week: string; // e.g. "W01", "W02"
  category: string;
  net_sales: number;
  target_sales: number;
  gross_sales: number;
  discount_amount: number;
  return_amount: number;
  total_transactions: number;
  units_sold: number;
  stockout_items?: number;
  total_skus?: number;
}

export interface MergedRetailRecord extends WeeklySaleRecord {
  store_name: string;
  region: string;
  city: string;
  store_format: string;
  manager_name?: string;
  sqft?: number;
  // Computed fields
  target_achievement_pct: number;
  return_rate_pct: number;
  discount_rate_pct: number;
  avg_transaction_value: number;
  stockout_rate_pct: number;
}

export interface DashboardFilters {
  week: string;
  region: string;
  store_id: string;
  city: string;
  store_format: string;
  category: string;
  searchQuery: string;
}

export interface KpiSummary {
  netSales: number;
  targetSales: number;
  grossSales: number;
  discountAmount: number;
  returnAmount: number;
  totalTransactions: number;
  unitsSold: number;
  targetAchievementPct: number;
  avgTransactionValue: number;
  returnRatePct: number;
  discountRatePct: number;
  avgStockoutRatePct: number;
  totalRecordsCount: number;
}

export interface RegionPerformance {
  region: string;
  netSales: number;
  targetSales: number;
  achievementPct: number;
  storeCount: number;
}

export interface StoreMissingTarget {
  store_id: string;
  store_name: string;
  region: string;
  city: string;
  store_format: string;
  netSales: number;
  targetSales: number;
  shortfallAmount: number;
  achievementPct: number;
}

export interface HighReturnCategory {
  category: string;
  returnRatePct: number;
  returnAmount: number;
  netSales: number;
  grossSales: number;
}

export interface StockoutRiskStore {
  store_id: string;
  store_name: string;
  region: string;
  category: string;
  stockoutRatePct: number;
  stockoutItems: number;
  totalSkus: number;
  estimatedRevenueAtRisk: number;
  riskLevel: 'high' | 'warning' | 'safe';
}

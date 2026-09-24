import * as XLSX from 'xlsx';
import {
  MergedRetailRecord,
  StoreMaster,
  WeeklySaleRecord,
} from '../types/retail';
import { SAMPLE_STORE_MASTER, generateSampleWeeklySales } from '../data/sampleData';

/**
 * Normalizes an object key to lowercase alphanumeric for robust fuzzy matching
 */
function cleanKey(key: string): string {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Maps arbitrary raw row keys to the standard StoreMaster model
 */
export function normalizeStoreMasterRow(row: Record<string, any>): StoreMaster | null {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[cleanKey(key)] = value;
  }

  const storeId =
    normalized['storeid'] ||
    normalized['storecode'] ||
    normalized['storeno'] ||
    normalized['storenum'] ||
    normalized['storenumber'] ||
    normalized['storenbr'] ||
    normalized['strid'] ||
    normalized['id'] ||
    normalized['siteid'] ||
    normalized['store'] ||
    '';

  if (!storeId) return null;

  return {
    store_id: String(storeId).trim(),
    store_name: String(
      normalized['storename'] ||
      normalized['storetitle'] ||
      normalized['storelabel'] ||
      normalized['store'] ||
      normalized['locationname'] ||
      normalized['name'] ||
      `Store ${storeId}`
    ).trim(),
    region: String(
      normalized['region'] ||
      normalized['storeregion'] ||
      normalized['territory'] ||
      normalized['zone'] ||
      normalized['division'] ||
      normalized['district'] ||
      normalized['area'] ||
      'Other'
    ).trim(),
    city: String(
      normalized['city'] ||
      normalized['storecity'] ||
      normalized['town'] ||
      normalized['location'] ||
      normalized['metro'] ||
      normalized['market'] ||
      'Unassigned'
    ).trim(),
    store_format: String(
      normalized['storeformat'] ||
      normalized['format'] ||
      normalized['storetype'] ||
      normalized['channel'] ||
      normalized['type'] ||
      normalized['sizeclass'] ||
      'Standard'
    ).trim(),
    manager_name: normalized['managername'] || normalized['manager'] || normalized['storedirector'] || normalized['generalmanager'] ? String(normalized['managername'] || normalized['manager'] || normalized['storedirector'] || normalized['generalmanager']).trim() : undefined,
    sqft: Number(normalized['sqft'] || normalized['squarefeet'] || normalized['areasqft'] || normalized['salesareasqft'] || 0) || undefined,
  };
}

/**
 * Maps arbitrary raw row keys to standard WeeklySaleRecord model
 */
export function normalizeWeeklySaleRow(row: Record<string, any>, index: number): WeeklySaleRecord | null {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[cleanKey(key)] = value;
  }

  const storeId =
    normalized['storeid'] ||
    normalized['storecode'] ||
    normalized['storeno'] ||
    normalized['storenum'] ||
    normalized['storenumber'] ||
    normalized['storenbr'] ||
    normalized['strid'] ||
    normalized['siteid'] ||
    normalized['id'] ||
    normalized['store'] ||
    '';

  if (!storeId) return null;

  // Helper to parse numbers even if formatted like "$12,345.67" or "(120.50)"
  const parseNum = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const str = String(val).replace(/[\$, ]/g, '').trim();
    if (str.startsWith('(') && str.endsWith(')')) {
      return -Math.abs(parseFloat(str.slice(1, -1)) || 0);
    }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const netSales = parseNum(
    normalized['netsales'] ??
    normalized['netrevenue'] ??
    normalized['actualsales'] ??
    normalized['actualrevenue'] ??
    normalized['salesamt'] ??
    normalized['salesamount'] ??
    normalized['sales'] ??
    normalized['revenue'] ??
    0
  );

  const targetSales = parseNum(
    normalized['targetsales'] ??
    normalized['targetrevenue'] ??
    normalized['salestarget'] ??
    normalized['target'] ??
    normalized['budgetsales'] ??
    normalized['budgetrevenue'] ??
    normalized['plan'] ??
    normalized['budget'] ??
    netSales
  );

  const discountAmount = parseNum(
    normalized['discountamount'] ??
    normalized['discountamt'] ??
    normalized['discounts'] ??
    normalized['markdown'] ??
    normalized['markdowns'] ??
    normalized['promo'] ??
    normalized['promotions'] ??
    normalized['discount'] ??
    0
  );

  const returnAmount = parseNum(
    normalized['returnamount'] ??
    normalized['returnamt'] ??
    normalized['returns'] ??
    normalized['refunds'] ??
    normalized['refundamount'] ??
    normalized['returnvalue'] ??
    0
  );

  const grossSales = parseNum(
    normalized['grosssales'] ??
    normalized['grossrevenue'] ??
    normalized['totalsales'] ??
    (netSales + discountAmount + returnAmount)
  );

  const totalTransactions = Math.max(
    1,
    Math.round(
      parseNum(
        normalized['totaltransactions'] ??
        normalized['transactions'] ??
        normalized['transcount'] ??
        normalized['transactioncount'] ??
        normalized['footfall'] ??
        normalized['ticketcount'] ??
        normalized['orders'] ??
        normalized['bills'] ??
        Math.round(Math.max(1, netSales / 65))
      )
    )
  );

  const unitsSold = Math.max(
    0,
    Math.round(
      parseNum(
        normalized['unitssold'] ??
        normalized['units'] ??
        normalized['qty'] ??
        normalized['quantity'] ??
        normalized['itemssold'] ??
        Math.round(totalTransactions * 2.2)
      )
    )
  );

  const totalSkus = Math.max(
    1,
    Math.round(
      parseNum(
        normalized['totalskus'] ??
        normalized['skus'] ??
        normalized['activeskus'] ??
        normalized['totalitems'] ??
        normalized['assortmentsize'] ??
        250
      )
    )
  );

  const stockoutItems = Math.max(
    0,
    Math.round(
      parseNum(
        normalized['stockoutitems'] ??
        normalized['stockouts'] ??
        normalized['oositems'] ??
        normalized['oos'] ??
        normalized['outofstock'] ??
        0
      )
    )
  );

  return {
    sale_id: normalized['saleid'] || normalized['id'] || normalized['rowid'] ? String(normalized['saleid'] || normalized['id'] || normalized['rowid']) : `SAL-${index + 1}`,
    store_id: String(storeId).trim(),
    week: String(
      normalized['week'] ||
      normalized['weeknum'] ||
      normalized['weeknumber'] ||
      normalized['fiscalweek'] ||
      normalized['fw'] ||
      normalized['wk'] ||
      normalized['period'] ||
      normalized['weekname'] ||
      'Week 01'
    ).trim(),
    category: String(
      normalized['category'] ||
      normalized['productcategory'] ||
      normalized['catname'] ||
      normalized['dept'] ||
      normalized['department'] ||
      normalized['merchandisedivision'] ||
      normalized['division'] ||
      'General'
    ).trim(),
    net_sales: Math.max(0, netSales),
    target_sales: Math.max(0, targetSales),
    gross_sales: Math.max(0, grossSales),
    discount_amount: Math.max(0, discountAmount),
    return_amount: Math.max(0, returnAmount),
    total_transactions: Math.max(1, totalTransactions),
    units_sold: Math.max(0, unitsSold),
    stockout_items: Math.max(0, stockoutItems),
    total_skus: Math.max(1, totalSkus),
  };
}

/**
 * Merges weekly sales and store master on store_id
 */
export function mergeDatasets(
  sales: WeeklySaleRecord[],
  stores: StoreMaster[]
): {
  merged: MergedRetailRecord[];
  matchedStoreCount: number;
  unmatchedSalesCount: number;
} {
  const storeMap = new Map<string, StoreMaster>();
  stores.forEach((s) => {
    storeMap.set(s.store_id.trim().toUpperCase(), s);
  });

  let matchedCount = 0;
  let unmatchedSales = 0;
  const matchedStoreIds = new Set<string>();

  const merged: MergedRetailRecord[] = sales.map((sale) => {
    const key = sale.store_id.trim().toUpperCase();
    const store = storeMap.get(key);

    if (store) {
      matchedStoreIds.add(key);
      matchedCount++;
    } else {
      unmatchedSales++;
    }

    const netSales = sale.net_sales;
    const targetSales = sale.target_sales;
    const grossSales = sale.gross_sales;
    const returnAmount = sale.return_amount;
    const discountAmount = sale.discount_amount;
    const totalTransactions = sale.total_transactions;
    const totalSkus = sale.total_skus || 1;
    const stockoutItems = sale.stockout_items || 0;

    const target_achievement_pct = targetSales > 0 ? (netSales / targetSales) * 100 : 100;
    const return_rate_pct = netSales > 0 ? (returnAmount / netSales) * 100 : 0;
    const discount_rate_pct = grossSales > 0 ? (discountAmount / grossSales) * 100 : 0;
    const avg_transaction_value = totalTransactions > 0 ? netSales / totalTransactions : 0;
    const stockout_rate_pct = totalSkus > 0 ? (stockoutItems / totalSkus) * 100 : 0;

    return {
      ...sale,
      store_name: store?.store_name || `Store ${sale.store_id}`,
      region: store?.region || 'Unassigned',
      city: store?.city || 'Unassigned',
      store_format: store?.store_format || 'Standard',
      manager_name: store?.manager_name,
      sqft: store?.sqft,
      target_achievement_pct,
      return_rate_pct,
      discount_rate_pct,
      avg_transaction_value,
      stockout_rate_pct,
    };
  });

  return {
    merged,
    matchedStoreCount: matchedStoreIds.size,
    unmatchedSalesCount: unmatchedSales,
  };
}

/**
 * Parses XLSX or CSV file buffer/content using SheetJS
 */
export async function parseFileToObjects(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve([]);
          return;
        }

        const workbook = XLSX.read(data, {
          type: file.name.endsWith('.csv') ? 'binary' : 'array',
          raw: false,
        });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve([]);
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
          defval: '',
          blankrows: false,
        });

        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);

    if (file.name.endsWith('.csv')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

/**
 * Export records as CSV
 */
export function exportToCsv(data: MergedRetailRecord[], filename = 'retail_filtered_data.csv') {
  if (!data || data.length === 0) return;

  const headers = [
    'Store ID',
    'Store Name',
    'Region',
    'City',
    'Store Format',
    'Week',
    'Category',
    'Net Sales ($)',
    'Target Sales ($)',
    'Gross Sales ($)',
    'Discount Amount ($)',
    'Return Amount ($)',
    'Transactions',
    'Units Sold',
    'Stockout Items',
    'Total SKUs',
    'Target Achievement (%)',
    'Return Rate (%)',
    'Discount Rate (%)',
    'Average Transaction Value ($)',
    'Stockout Rate (%)',
  ];

  const rows = data.map((d) => [
    `"${d.store_id}"`,
    `"${d.store_name.replace(/"/g, '""')}"`,
    `"${d.region}"`,
    `"${d.city}"`,
    `"${d.store_format}"`,
    `"${d.week}"`,
    `"${d.category}"`,
    d.net_sales.toFixed(2),
    d.target_sales.toFixed(2),
    d.gross_sales.toFixed(2),
    d.discount_amount.toFixed(2),
    d.return_amount.toFixed(2),
    d.total_transactions,
    d.units_sold,
    d.stockout_items || 0,
    d.total_skus || 0,
    d.target_achievement_pct.toFixed(2),
    d.return_rate_pct.toFixed(2),
    d.discount_rate_pct.toFixed(2),
    d.avg_transaction_value.toFixed(2),
    d.stockout_rate_pct.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export records as JSON
 */
export function exportToJson(data: MergedRetailRecord[], filename = 'retail_filtered_data.json') {
  if (!data || data.length === 0) return;

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download sample template CSV files for user convenience
 */
export function downloadSampleStoreMasterCsv() {
  const headers = ['store_id', 'store_name', 'region', 'city', 'store_format', 'manager_name', 'sqft'];
  const rows = SAMPLE_STORE_MASTER.map((s) => [
    s.store_id,
    `"${s.store_name}"`,
    s.region,
    s.city,
    s.store_format,
    `"${s.manager_name || ''}"`,
    s.sqft || 0,
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'store_master_sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSampleWeeklySalesCsv() {
  const sales = generateSampleWeeklySales();
  const headers = [
    'sale_id',
    'store_id',
    'week',
    'category',
    'net_sales',
    'target_sales',
    'gross_sales',
    'discount_amount',
    'return_amount',
    'total_transactions',
    'units_sold',
    'stockout_items',
    'total_skus',
  ];
  const rows = sales.slice(0, 100).map((s) => [
    s.sale_id,
    s.store_id,
    s.week,
    `"${s.category}"`,
    s.net_sales,
    s.target_sales,
    s.gross_sales,
    s.discount_amount,
    s.return_amount,
    s.total_transactions,
    s.units_sold,
    s.stockout_items,
    s.total_skus,
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'retail_weekly_sales_sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

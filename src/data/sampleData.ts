import { StoreMaster, WeeklySaleRecord } from '../types/retail';

export const SAMPLE_STORE_MASTER: StoreMaster[] = [
  {
    store_id: 'STR-101',
    store_name: 'Manhattan 5th Ave Flagship',
    region: 'North',
    city: 'New York',
    store_format: 'Flagship',
    manager_name: 'Elena Rostova',
    sqft: 28500,
  },
  {
    store_id: 'STR-102',
    store_name: 'Boston Back Bay Superstore',
    region: 'North',
    city: 'Boston',
    store_format: 'Superstore',
    manager_name: 'Marcus Vance',
    sqft: 22000,
  },
  {
    store_id: 'STR-103',
    store_name: 'Center City Philadelphia',
    region: 'North',
    city: 'Philadelphia',
    store_format: 'Express',
    manager_name: 'Sarah Kim',
    sqft: 9800,
  },
  {
    store_id: 'STR-104',
    store_name: 'Pittsburgh Ross Park Mall',
    region: 'North',
    city: 'Pittsburgh',
    store_format: 'Mall',
    manager_name: 'Thomas Wright',
    sqft: 14200,
  },
  {
    store_id: 'STR-201',
    store_name: 'Atlanta Buckhead Flagship',
    region: 'South',
    city: 'Atlanta',
    store_format: 'Flagship',
    manager_name: 'Jasmine Reynolds',
    sqft: 26000,
  },
  {
    store_id: 'STR-202',
    store_name: 'Miami Brickell Superstore',
    region: 'South',
    city: 'Miami',
    store_format: 'Superstore',
    manager_name: 'Carlos Mendez',
    sqft: 21500,
  },
  {
    store_id: 'STR-203',
    store_name: 'Charlotte Uptown Express',
    region: 'South',
    city: 'Charlotte',
    store_format: 'Express',
    manager_name: 'Brianna Hayes',
    sqft: 9200,
  },
  {
    store_id: 'STR-204',
    store_name: 'Orlando International Premium',
    region: 'South',
    city: 'Orlando',
    store_format: 'Outlet',
    manager_name: 'Derek Scott',
    sqft: 16800,
  },
  {
    store_id: 'STR-301',
    store_name: 'Los Angeles Beverly Flagship',
    region: 'West',
    city: 'Los Angeles',
    store_format: 'Flagship',
    manager_name: 'Aiden Patel',
    sqft: 31000,
  },
  {
    store_id: 'STR-302',
    store_name: 'San Francisco Union Square',
    region: 'West',
    city: 'San Francisco',
    store_format: 'Superstore',
    manager_name: 'Rachel Sterling',
    sqft: 24000,
  },
  {
    store_id: 'STR-303',
    store_name: 'Seattle Westlake Center',
    region: 'West',
    city: 'Seattle',
    store_format: 'Express',
    manager_name: 'Liam Zhang',
    sqft: 10500,
  },
  {
    store_id: 'STR-304',
    store_name: 'Denver Cherry Creek Mall',
    region: 'West',
    city: 'Denver',
    store_format: 'Mall',
    manager_name: 'Hannah Brooks',
    sqft: 15400,
  },
  {
    store_id: 'STR-401',
    store_name: 'Chicago Michigan Ave Flagship',
    region: 'Central',
    city: 'Chicago',
    store_format: 'Flagship',
    manager_name: 'Omar Farooq',
    sqft: 29000,
  },
  {
    store_id: 'STR-402',
    store_name: 'Dallas NorthPark Superstore',
    region: 'Central',
    city: 'Dallas',
    store_format: 'Superstore',
    manager_name: 'Chloe Bennett',
    sqft: 23500,
  },
  {
    store_id: 'STR-403',
    store_name: 'Houston Galleria Express',
    region: 'Central',
    city: 'Houston',
    store_format: 'Express',
    manager_name: 'Travis Cole',
    sqft: 11000,
  },
  {
    store_id: 'STR-404',
    store_name: 'Minneapolis Mall of America',
    region: 'Central',
    city: 'Minneapolis',
    store_format: 'Mall',
    manager_name: 'Ingrid Larsen',
    sqft: 18500,
  },
];

export const CATEGORIES = [
  'Apparel & Footwear',
  'Consumer Electronics',
  'Home & Living',
  'Beauty & Wellness',
  'Food & Gourmet',
  'Sports & Outdoors',
] as const;

export const WEEKS = [
  'Week 01',
  'Week 02',
  'Week 03',
  'Week 04',
  'Week 05',
  'Week 06',
  'Week 07',
  'Week 08',
];

// Helper deterministic pseudo-random generator based on seed
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateSampleWeeklySales(): WeeklySaleRecord[] {
  const records: WeeklySaleRecord[] = [];
  let rowId = 1;

  SAMPLE_STORE_MASTER.forEach((store, storeIdx) => {
    // Determine store performance profile
    // Flagships generally do high volume, some stores underperform to provide rich business insights
    const isUnderperformer = store.store_id === 'STR-103' || store.store_id === 'STR-404' || store.store_id === 'STR-203';
    const isTopPerformer = store.store_id === 'STR-301' || store.store_id === 'STR-101' || store.store_id === 'STR-401';

    const baseStoreMultiplier = isTopPerformer ? 1.35 : isUnderperformer ? 0.76 : 1.0;

    WEEKS.forEach((week, weekIdx) => {
      // Seasonal weekly growth factor
      const weekMultiplier = 1 + (weekIdx * 0.035) + (Math.sin(weekIdx * 0.8) * 0.05);

      CATEGORIES.forEach((category, catIdx) => {
        const seed = storeIdx * 1000 + weekIdx * 100 + catIdx * 10 + 17;
        const r1 = seededRandom(seed);
        const r2 = seededRandom(seed + 1);
        const r3 = seededRandom(seed + 2);
        const r4 = seededRandom(seed + 3);

        // Category base volumes & prices
        let baseNetSales = 12000;
        let baseATV = 65;
        let expectedReturnRate = 0.03;
        let expectedDiscountRate = 0.10;
        let baseSkus = 180;

        switch (category) {
          case 'Apparel & Footwear':
            baseNetSales = 24000;
            baseATV = 72;
            expectedReturnRate = 0.074; // High return (>5%)
            expectedDiscountRate = 0.14;
            baseSkus = 350;
            break;
          case 'Consumer Electronics':
            baseNetSales = 38000;
            baseATV = 210;
            expectedReturnRate = 0.038;
            expectedDiscountRate = 0.08;
            baseSkus = 120;
            break;
          case 'Home & Living':
            baseNetSales = 18000;
            baseATV = 95;
            expectedReturnRate = 0.046;
            expectedDiscountRate = 0.11;
            baseSkus = 220;
            break;
          case 'Beauty & Wellness':
            baseNetSales = 15000;
            baseATV = 48;
            expectedReturnRate = 0.024;
            expectedDiscountRate = 0.15;
            baseSkus = 280;
            break;
          case 'Food & Gourmet':
            baseNetSales = 16000;
            baseATV = 32;
            expectedReturnRate = 0.012;
            expectedDiscountRate = 0.06;
            baseSkus = 450;
            break;
          case 'Sports & Outdoors':
            baseNetSales = 21000;
            baseATV = 88;
            expectedReturnRate = 0.062; // High return (>5%)
            expectedDiscountRate = 0.12;
            baseSkus = 200;
            break;
        }

        // Format multiplier
        let formatMultiplier = 1.0;
        if (store.store_format === 'Flagship') formatMultiplier = 1.6;
        else if (store.store_format === 'Superstore') formatMultiplier = 1.25;
        else if (store.store_format === 'Express') formatMultiplier = 0.65;
        else if (store.store_format === 'Outlet') formatMultiplier = 0.95;

        // Target Sales
        const targetMultiplier = isUnderperformer ? 1.18 : isTopPerformer ? 0.92 : 1.02;
        const netSales = Math.round(baseNetSales * baseStoreMultiplier * formatMultiplier * weekMultiplier * (0.92 + r1 * 0.16));
        const targetSales = Math.round(netSales * targetMultiplier * (0.95 + r2 * 0.1));

        // Returns and discounts
        const returnAmount = Math.round(netSales * (expectedReturnRate * (0.85 + r3 * 0.3)));
        const grossSales = Math.round((netSales + returnAmount) * (1 + expectedDiscountRate * (0.9 + r4 * 0.2)));
        const discountAmount = Math.round(grossSales * (expectedDiscountRate * (0.9 + r4 * 0.2)));

        const atv = baseATV * (0.9 + r2 * 0.2);
        const totalTransactions = Math.max(10, Math.round(netSales / atv));
        const unitsSold = Math.round(totalTransactions * (1.6 + r3 * 0.8));

        // Stockout items
        // Underperformer or specific category shortages
        const isStockoutHotspot = (store.store_id === 'STR-404' && category === 'Consumer Electronics') ||
          (store.store_id === 'STR-103' && category === 'Apparel & Footwear') ||
          (store.store_id === 'STR-202' && category === 'Sports & Outdoors') ||
          (weekIdx >= 5 && category === 'Consumer Electronics');

        const totalSkus = Math.round(baseSkus * (formatMultiplier * 0.8 + 0.4));
        const stockoutRateBase = isStockoutHotspot ? 0.14 + r1 * 0.08 : 0.025 + r1 * 0.045;
        const stockoutItems = Math.min(totalSkus, Math.round(totalSkus * stockoutRateBase));

        records.push({
          sale_id: `SAL-${rowId++}`,
          store_id: store.store_id,
          week,
          category,
          net_sales: netSales,
          target_sales: targetSales,
          gross_sales: grossSales,
          discount_amount: discountAmount,
          return_amount: returnAmount,
          total_transactions: totalTransactions,
          units_sold: unitsSold,
          stockout_items: stockoutItems,
          total_skus: totalSkus,
        });
      });
    });
  });

  return records;
}

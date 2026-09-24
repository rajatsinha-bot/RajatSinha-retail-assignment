/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  SAMPLE_STORE_MASTER,
  generateSampleWeeklySales,
} from './data/sampleData';
import {
  DashboardFilters,
  MergedRetailRecord,
  StoreMaster,
  WeeklySaleRecord,
} from './types/retail';
import {
  exportToCsv,
  exportToJson,
  mergeDatasets,
} from './utils/dataParser';
import {
  applyFilters,
  computeKpiSummary,
} from './utils/kpiCalculations';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KpiCards } from './components/KpiCards';
import { VisualAnalytics } from './components/VisualAnalytics';
import { ActionableInsights } from './components/ActionableInsights';
import { DataIntegrationModal } from './components/DataIntegrationModal';
import { StoreDirectory } from './components/StoreDirectory';

export default function App() {
  // 1. Initial State with rich sample benchmark data preloaded
  const [rawStores, setRawStores] = useState<StoreMaster[]>(SAMPLE_STORE_MASTER);
  const [rawSales, setRawSales] = useState<WeeklySaleRecord[]>(() => generateSampleWeeklySales());
  const [isCustomDataLoaded, setIsCustomDataLoaded] = useState<boolean>(false);

  // 2. Merged dataset (auto-joined on store_id)
  const mergedData = useMemo(() => {
    const { merged } = mergeDatasets(rawSales, rawStores);
    return merged;
  }, [rawSales, rawStores]);

  // 3. Global Dynamic Filters State
  const initialFilters: DashboardFilters = {
    week: 'ALL',
    region: 'ALL',
    store_id: 'ALL',
    city: 'ALL',
    store_format: 'ALL',
    category: 'ALL',
    searchQuery: '',
  };

  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);

  // 4. Dynamically Filtered Data
  const filteredData = useMemo(() => {
    return applyFilters(mergedData, filters);
  }, [mergedData, filters]);

  // 5. Computed KPI Summary
  const kpiSummary = useMemo(() => {
    return computeKpiSummary(filteredData);
  }, [filteredData]);

  // Active stores count in current filtered slice
  const activeStoreCount = useMemo(() => {
    const storeSet = new Set<string>();
    filteredData.forEach((d) => storeSet.add(d.store_id));
    return storeSet.size;
  }, [filteredData]);

  // Reset filters handler
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Click-to-filter handlers from cards/insights
  const handleFilterByRegion = (region: string) => {
    setFilters((prev) => ({
      ...prev,
      region,
      store_id: 'ALL', // reset store so it shows all stores in that region
      city: 'ALL',
    }));
  };

  const handleFilterByStore = (storeId: string) => {
    setFilters((prev) => ({
      ...prev,
      store_id: storeId,
    }));
  };

  const handleFilterByCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category,
    }));
  };

  // Merge callback when user uploads custom XLSX or CSV files
  const handleDatasetsMerged = (
    merged: MergedRetailRecord[],
    sales: WeeklySaleRecord[],
    stores: StoreMaster[]
  ) => {
    setRawSales(sales);
    setRawStores(stores);
    setIsCustomDataLoaded(true);
    setIsDataModalOpen(false);
    handleResetFilters();
  };

  // Reset to default sample benchmark
  const handleResetToSample = () => {
    setRawStores(SAMPLE_STORE_MASTER);
    setRawSales(generateSampleWeeklySales());
    setIsCustomDataLoaded(false);
    handleResetFilters();
  };

  // Export handlers
  const handleExportCsv = () => {
    exportToCsv(filteredData, `retail_sales_export_${Date.now()}.csv`);
  };

  const handleExportJson = () => {
    exportToJson(filteredData, `retail_sales_export_${Date.now()}.json`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Universal Top Bar */}
      <Header
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onResetToSample={handleResetToSample}
        isCustomDataLoaded={isCustomDataLoaded}
        totalRecords={mergedData.length}
        filteredRecordsCount={filteredData.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Global Dynamic Filter Controls Bar */}
      <FilterBar
        filters={filters}
        onChangeFilters={setFilters}
        onResetFilters={handleResetFilters}
        dataset={mergedData}
        filteredCount={filteredData.length}
        totalCount={mergedData.length}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Empty state if filters yielded 0 records */}
        {filteredData.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              0
            </div>
            <h3 className="text-base font-semibold text-slate-900">No Matching Sales Records</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Your active combination of filters (Week: {filters.week}, Region: {filters.region}, Category: {filters.category}) does not match any transactions.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* View 1: Overview & Primary KPI Cards */}
            {(activeTab === 'overview' || activeTab === 'visuals') && (
              <section aria-label="Key Performance Indicators">
                <KpiCards kpi={kpiSummary} activeStoreCount={activeStoreCount} />
              </section>
            )}

            {/* View 2: Visual Analytics (Chart.js Line, Bar, Donut, Horizontal Bar & Stockout Gauge) */}
            {(activeTab === 'overview' || activeTab === 'visuals') && (
              <section aria-label="Visual Analytics Charts">
                <VisualAnalytics
                  filteredData={filteredData}
                  onSelectStore={handleFilterByStore}
                  onSelectRegion={handleFilterByRegion}
                  onSelectCategory={handleFilterByCategory}
                />
              </section>
            )}

            {/* View 3: Actionable Business Insights Summary */}
            {(activeTab === 'overview' || activeTab === 'insights') && (
              <section aria-label="Actionable Business Insights">
                <ActionableInsights
                  filteredData={filteredData}
                  onFilterByRegion={handleFilterByRegion}
                  onFilterByStore={handleFilterByStore}
                  onFilterByCategory={handleFilterByCategory}
                />
              </section>
            )}

            {/* View 4: Inventory Health Tab */}
            {activeTab === 'inventory' && (
              <section aria-label="Inventory Health Focused View">
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      Stockout Risk & Inventory Health Focus
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Detailed diagnostic monitoring across active store-product combinations
                    </p>
                    <VisualAnalytics
                      filteredData={filteredData}
                      onSelectStore={handleFilterByStore}
                      onSelectRegion={handleFilterByRegion}
                      onSelectCategory={handleFilterByCategory}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* View 5: Store Master Directory */}
            {(activeTab === 'overview' || activeTab === 'stores') && (
              <section aria-label="Store Directory and Performance">
                <StoreDirectory
                  filteredData={filteredData}
                  onSelectStore={handleFilterByStore}
                />
              </section>
            )}
          </>
        )}
      </main>

      {/* Dataset Integration & Upload Modal */}
      <DataIntegrationModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDatasetsMerged={handleDatasetsMerged}
        onResetToSample={handleResetToSample}
        isCustomDataLoaded={isCustomDataLoaded}
        currentStoresCount={rawStores.length}
        currentSalesCount={rawSales.length}
      />

      {/* Quiet Corporate Footer (Anti-slop compliant) */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">RetailPulse Intelligence</span>
            <span>·</span>
            <span>Enterprise Sales Performance Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Formulas: Net = Gross - Disc - Ret · Target Ach = (Net/Target)*100</span>
            <span>·</span>
            <span>Auto-joined on store_id</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

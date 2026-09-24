import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import {
  downloadSampleStoreMasterCsv,
  downloadSampleWeeklySalesCsv,
  mergeDatasets,
  normalizeStoreMasterRow,
  normalizeWeeklySaleRow,
  parseFileToObjects,
} from '../utils/dataParser';
import { StoreMaster, WeeklySaleRecord, MergedRetailRecord } from '../types/retail';

interface DataIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetsMerged: (
    merged: MergedRetailRecord[],
    sales: WeeklySaleRecord[],
    stores: StoreMaster[]
  ) => void;
  onResetToSample: () => void;
  isCustomDataLoaded: boolean;
  currentStoresCount: number;
  currentSalesCount: number;
}

export const DataIntegrationModal: React.FC<DataIntegrationModalProps> = ({
  isOpen,
  onClose,
  onDatasetsMerged,
  onResetToSample,
  isCustomDataLoaded,
  currentStoresCount,
  currentSalesCount,
}) => {
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [storesFile, setStoresFile] = useState<File | null>(null);
  const [parsedStores, setParsedStores] = useState<StoreMaster[] | null>(null);
  const [parsedSales, setParsedSales] = useState<WeeklySaleRecord[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mergeStats, setMergeStats] = useState<{
    totalSalesRows: number;
    totalStores: number;
    matchedStores: number;
    unmatchedSales: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleSalesFileUpload = async (file: File) => {
    setSalesFile(file);
    setErrorMessage(null);
    try {
      const rows = await parseFileToObjects(file);
      const normalized = rows
        .map((r, i) => normalizeWeeklySaleRow(r, i))
        .filter((r): r is WeeklySaleRecord => r !== null);

      if (normalized.length === 0) {
        setErrorMessage(
          `Could not identify valid sales rows in "${file.name}". Please ensure columns include store_id, week, net_sales, etc.`
        );
        return;
      }

      setParsedSales(normalized);
    } catch (err: any) {
      setErrorMessage(`Error reading ${file.name}: ${err?.message || 'Invalid file format'}`);
    }
  };

  const handleStoresFileUpload = async (file: File) => {
    setStoresFile(file);
    setErrorMessage(null);
    try {
      const rows = await parseFileToObjects(file);
      const normalized = rows
        .map((r) => normalizeStoreMasterRow(r))
        .filter((r): r is StoreMaster => r !== null);

      if (normalized.length === 0) {
        setErrorMessage(
          `Could not identify valid store rows in "${file.name}". Please ensure columns include store_id, store_name, region, etc.`
        );
        return;
      }

      setParsedStores(normalized);
    } catch (err: any) {
      setErrorMessage(`Error reading ${file.name}: ${err?.message || 'Invalid file format'}`);
    }
  };

  const handleExecuteMerge = () => {
    if (!parsedSales || parsedSales.length === 0) {
      setErrorMessage('Please upload retail_weekly_sales.xlsx or CSV first.');
      return;
    }

    if (!parsedStores || parsedStores.length === 0) {
      setErrorMessage('Please upload store_master.xlsx or CSV first.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = mergeDatasets(parsedSales, parsedStores);
      setMergeStats({
        totalSalesRows: parsedSales.length,
        totalStores: parsedStores.length,
        matchedStores: result.matchedStoreCount,
        unmatchedSales: result.unmatchedSalesCount,
      });

      onDatasetsMerged(result.merged, parsedSales, parsedStores);
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
    } catch (err: any) {
      setErrorMessage(`Merge failed: ${err?.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Data Integration & Dataset Merger
              </h3>
              <p className="text-xs text-slate-500">
                Upload custom spreadsheets or download standardized templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Active Dataset Status Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCustomDataLoaded ? 'bg-blue-600' : 'bg-emerald-600'
                }`}
              />
              <span className="font-semibold text-slate-800">
                Current Active Source:
              </span>
              <span className="text-slate-600">
                {isCustomDataLoaded ? 'Custom Uploaded Data' : 'Preloaded Benchmark Dataset'}
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-slate-500">
                {currentSalesCount.toLocaleString()} sales rows / {currentStoresCount} stores
              </span>
            </div>

            {isCustomDataLoaded && (
              <button
                onClick={() => {
                  onResetToSample();
                  setSalesFile(null);
                  setStoresFile(null);
                  setParsedSales(null);
                  setParsedStores(null);
                  setMergeStats(null);
                }}
                className="text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Revert to Sample Benchmark</span>
              </button>
            )}
          </div>

          {/* Dual File Upload Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: retail_weekly_sales */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      1. retail_weekly_sales
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">.xlsx / .csv</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Must contain: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">store_id</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">week</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">category</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">net_sales</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">target_sales</code>
                </p>
              </div>

              {/* Upload Input Area */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleSalesFileUpload(file);
                }}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors block ${
                  parsedSales
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSalesFileUpload(file);
                  }}
                />
                <Upload className={`w-5 h-5 mx-auto mb-1.5 ${parsedSales ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-800 block">
                  {salesFile ? salesFile.name : 'Click to Browse or Drag & Drop'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {parsedSales ? `✓ Successfully parsed ${parsedSales.length.toLocaleString()} rows` : 'Accepts .csv or .xlsx (retail_weekly_sales)'}
                </span>
              </label>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-400 text-[11px]">Need sample?</span>
                <button
                  type="button"
                  onClick={downloadSampleWeeklySalesCsv}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-medium flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            </div>

            {/* Box 2: store_master */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      2. store_master
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">.xlsx / .csv</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Must contain: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">store_id</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">store_name</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">region</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">city</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">store_format</code>
                </p>
              </div>

              {/* Upload Input Area */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleStoresFileUpload(file);
                }}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors block ${
                  parsedStores
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleStoresFileUpload(file);
                  }}
                />
                <Upload className={`w-5 h-5 mx-auto mb-1.5 ${parsedStores ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-800 block">
                  {storesFile ? storesFile.name : 'Click to Browse or Drag & Drop'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {parsedStores ? `✓ Successfully parsed ${parsedStores.length} stores` : 'Accepts .csv or .xlsx (store_master)'}
                </span>
              </label>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-400 text-[11px]">Need sample?</span>
                <button
                  type="button"
                  onClick={downloadSampleStoreMasterCsv}
                  className="text-emerald-700 hover:text-emerald-900 text-[11px] font-medium flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Typical Retail & Store File Structure Reference Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Typical Retail & Store Master File Schemas (Auto-Detected)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Case & Format Insensitive</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-semibold text-blue-700">weekly_sales file columns:</div>
                <div className="text-slate-600 font-mono text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100 overflow-x-auto whitespace-nowrap">
                  store_id, week, category, net_sales, target_sales, gross_sales, discount_amount, return_amount, total_transactions, units_sold, stockout_items, total_skus
                </div>
                <p className="text-slate-500 text-[10px] leading-tight">
                  Aliases recognized: <code className="text-slate-700">store_id / store_code / store_number / store_no</code>, <code className="text-slate-700">net_sales / actual_sales / revenue</code>, <code className="text-slate-700">target_sales / budget / plan</code>, etc.
                </p>
              </div>

              <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-semibold text-emerald-700">store_master file columns:</div>
                <div className="text-slate-600 font-mono text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100 overflow-x-auto whitespace-nowrap">
                  store_id, store_name, region, city, store_format, manager_name, sqft
                </div>
                <p className="text-slate-500 text-[10px] leading-tight">
                  Aliases recognized: <code className="text-slate-700">store_id / store_code / id</code>, <code className="text-slate-700">region / territory / zone / division</code>, <code className="text-slate-700">store_format / format / type / channel</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Merge Diagnostics Output */}
          {mergeStats && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs text-emerald-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Datasets Merged Successfully on store_id</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Matched <strong>{mergeStats.matchedStores}</strong> of {mergeStats.totalStores} stores. Joined {mergeStats.totalSalesRows.toLocaleString()} weekly sales lines.
                {mergeStats.unmatchedSales > 0
                  ? ` (${mergeStats.unmatchedSales} sales records assigned fallback store names)`
                  : ' 100% relational integrity verified.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 rounded transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            disabled={!parsedSales || !parsedStores || isProcessing}
            onClick={handleExecuteMerge}
            className={`px-5 py-2 text-xs font-medium text-white rounded transition-colors flex items-center gap-2 ${
              !parsedSales || !parsedStores || isProcessing
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Joining on store_id...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>Parse, Join & Update Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

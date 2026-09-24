import React from 'react';
import { Download, RefreshCw, Upload, Database } from 'lucide-react';

interface HeaderProps {
  onOpenDataModal: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onResetToSample: () => void;
  isCustomDataLoaded: boolean;
  totalRecords: number;
  filteredRecordsCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDataModal,
  onExportCsv,
  onExportJson,
  onResetToSample,
  isCustomDataLoaded,
  totalRecords,
  filteredRecordsCount,
  activeTab,
  setActiveTab,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
              RP
            </div>
            <a href="/" className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              RetailPulse Intelligence
            </a>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
              · Executive Analytics
            </span>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition-colors text-left ${
                activeTab === 'overview'
                  ? 'text-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Overview & KPIs
            </button>
            <button
              onClick={() => setActiveTab('visuals')}
              className={`transition-colors text-left ${
                activeTab === 'visuals'
                  ? 'text-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Visual Analytics
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`transition-colors text-left ${
                activeTab === 'insights'
                  ? 'text-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Business Insights
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`transition-colors text-left ${
                activeTab === 'inventory'
                  ? 'text-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Stockout Health
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`transition-colors text-left ${
                activeTab === 'stores'
                  ? 'text-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Store Directory
            </button>
          </nav>

          {/* Zone 3: Primary action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Prominent Upload CSV / Excel Trigger */}
            <button
              onClick={onOpenDataModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs rounded transition-colors whitespace-nowrap"
              title="Upload retail_weekly_sales and store_master files (CSV or Excel)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV / Excel</span>
            </button>

            {/* Dataset status badge */}
            <button
              onClick={onOpenDataModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors"
              title="View active dataset status"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCustomDataLoaded ? 'bg-blue-600' : 'bg-emerald-600'
                }`}
              />
              <span className="text-[11px] text-slate-600">
                {isCustomDataLoaded ? 'Custom Data' : 'Sample Benchmark'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                ({totalRecords.toLocaleString()} rows)
              </span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded shadow-lg border border-slate-200 py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 text-slate-400 font-medium border-b border-slate-100">
                    Export Filtered ({filteredRecordsCount} rows)
                  </div>
                  <button
                    onClick={() => {
                      onExportCsv();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Download as CSV</span>
                    <span className="font-mono text-slate-400 text-[10px]">.csv</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportJson();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Download as JSON</span>
                    <span className="font-mono text-slate-400 text-[10px]">.json</span>
                  </button>
                  {isCustomDataLoaded && (
                    <button
                      onClick={() => {
                        onResetToSample();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-amber-700 hover:bg-amber-50 border-t border-slate-100 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset to Benchmark Data</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-4 py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap pb-1 ${
              activeTab === 'overview' ? 'text-slate-900 border-b-2 border-slate-900' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('visuals')}
            className={`whitespace-nowrap pb-1 ${
              activeTab === 'visuals' ? 'text-slate-900 border-b-2 border-slate-900' : ''
            }`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`whitespace-nowrap pb-1 ${
              activeTab === 'insights' ? 'text-slate-900 border-b-2 border-slate-900' : ''
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`whitespace-nowrap pb-1 ${
              activeTab === 'inventory' ? 'text-slate-900 border-b-2 border-slate-900' : ''
            }`}
          >
            Stockouts
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`whitespace-nowrap pb-1 ${
              activeTab === 'stores' ? 'text-slate-900 border-b-2 border-slate-900' : ''
            }`}
          >
            Stores
          </button>
        </div>
      </div>
    </header>
  );
};

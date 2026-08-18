import React, { useState, useRef } from 'react';
import { parseSpreadsheetBuffer, parseCSVText, ParsedDataset } from '../../utils/dataEngine';
import {
  LayoutDashboard,
  Upload,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  FileSpreadsheet,
  Filter,
  BarChart3,
  PieChart,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '../../context/ToastContext';

const SAMPLE_EXCEL_CSV = `Order_ID,Product_Category,Region,Sales_Amount,Units_Sold,Profit,Customer_Segment
1001,Electronics,North,1250,5,320,Consumer
1002,Furniture,South,890,2,180,Corporate
1003,Software,West,2400,10,950,Enterprise
1004,Office Supplies,East,450,15,120,Consumer
1005,Electronics,West,1800,7,490,Corporate
1006,Furniture,North,1100,3,230,Consumer
1007,Software,East,3200,12,1400,Enterprise
1008,Office Supplies,South,600,20,160,Corporate
1009,Electronics,East,2100,8,600,Enterprise
1010,Software,North,1950,6,750,Consumer`;

export const ExcelDashboardStudio: React.FC = () => {
  const { showDownloadToast, showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [dataset, setDataset] = useState<ParsedDataset>(() => parseCSVText(SAMPLE_EXCEL_CSV));
  const [selectedCategoryCol, setSelectedCategoryCol] = useState<string>('Product_Category');
  const [selectedMetricCol, setSelectedMetricCol] = useState<string>('Sales_Amount');
  const [activeFilterValue, setActiveFilterValue] = useState<string>('all');
  const [fileName, setFileName] = useState<string>('Sample_Sales_Analytics.xlsx');
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();

      if (file.name.endsWith('.csv')) {
        reader.onload = (evt) => {
          const text = evt.target?.result as string;
          const parsed = parseCSVText(text);
          setDataset(parsed);
          if (parsed.categoricalColumns.length > 0) setSelectedCategoryCol(parsed.categoricalColumns[0]);
          if (parsed.numericColumns.length > 0) setSelectedMetricCol(parsed.numericColumns[0]);
        };
        reader.readAsText(file);
      } else {
        reader.onload = (evt) => {
          const buffer = evt.target?.result as ArrayBuffer;
          const parsed = parseSpreadsheetBuffer(buffer);
          setDataset(parsed);
          if (parsed.categoricalColumns.length > 0) setSelectedCategoryCol(parsed.categoricalColumns[0]);
          if (parsed.numericColumns.length > 0) setSelectedMetricCol(parsed.numericColumns[0]);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  };

  // Filter rows
  const filteredRows = dataset.rows.filter((row) => {
    if (activeFilterValue === 'all') return true;
    return String(row[selectedCategoryCol]) === activeFilterValue;
  });

  // Calculate Metrics dynamically
  const metricValues = filteredRows.map((r) => Number(r[selectedMetricCol]) || 0);
  const totalValue = metricValues.reduce((a, b) => a + b, 0);
  const avgValue = metricValues.length > 0 ? totalValue / metricValues.length : 0;
  const maxValue = metricValues.length > 0 ? Math.max(...metricValues) : 0;

  // Breakdown by Category
  const categoryMap: Record<string, number> = {};
  filteredRows.forEach((row) => {
    const cat = String(row[selectedCategoryCol] || 'Uncategorized');
    const val = Number(row[selectedMetricCol]) || 0;
    categoryMap[cat] = (categoryMap[cat] || 0) + val;
  });

  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const highestCategoryVal = Math.max(...categoryEntries.map((e) => e[1]), 1);

  // Export Dashboard to PDF
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text('EXECUTIVE EXCEL BI DASHBOARD', 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated from ${fileName} • Dimension: ${selectedCategoryCol} • Metric: ${selectedMetricCol}`, 14, 27);
      doc.text(`Export Timestamp: ${new Date().toLocaleString()}`, 14, 33);

      doc.setDrawColor(203, 213, 225);
      doc.line(14, 37, 196, 37);

      // KPI Summary Box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 42, 182, 30, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total ${selectedMetricCol}: ${totalValue.toLocaleString()}`, 20, 52);
      doc.text(`Average: ${avgValue.toFixed(1)}`, 20, 60);
      doc.text(`Max Peak: ${maxValue.toLocaleString()}`, 110, 52);
      doc.text(`Data Volume: ${filteredRows.length} records`, 110, 60);

      // Breakdown Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Category Breakdown & Share', 14, 85);

      let startY = 93;
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('Category', 14, startY);
      doc.text('Metric Value', 100, startY);
      doc.text('Share of Total', 150, startY);

      startY += 4;
      doc.line(14, startY, 196, startY);

      categoryEntries.slice(0, 15).forEach(([cat, val]) => {
        startY += 8;
        const share = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0';
        doc.setFont('helvetica', 'normal');
        doc.text(cat.slice(0, 35), 14, startY);
        doc.text(val.toLocaleString(), 100, startY);
        doc.text(`${share}%`, 150, startY);
      });

      const outFileName = `Executive_Dashboard_${fileName.replace(/\.[^/.]+$/, '')}.pdf`;
      doc.save(outFileName);

      showDownloadToast(outFileName, {
        format: 'PDF',
        toolName: 'Excel BI Dashboard',
        message: `Executive BI Dashboard for ${dataset.rowCount} rows saved as high-resolution PDF.`,
      });
    } catch (e: any) {
      console.error('Failed to export PDF dashboard', e);
      showErrorToast(e.message || 'Failed to export PDF', 'Export Error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Studio Header */}
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Excel Dashboard Studio</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                  Instant BI Analytics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Transform any XLSX, XLS, or CSV spreadsheet into an interactive executive BI dashboard in seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <Upload className="h-4 w-4 text-emerald-600" />
              <span>Load Sheet</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Controls & Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-white/70 p-4 border border-white/80 backdrop-blur-md shadow-sm">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Group by Category Dimension
          </label>
          <select
            value={selectedCategoryCol}
            onChange={(e) => {
              setSelectedCategoryCol(e.target.value);
              setActiveFilterValue('all');
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none shadow-sm"
          >
            {dataset.categoricalColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Aggregate Metric
          </label>
          <select
            value={selectedMetricCol}
            onChange={(e) => setSelectedMetricCol(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none shadow-sm"
          >
            {dataset.numericColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Interactive Filter
          </label>
          <select
            value={activeFilterValue}
            onChange={(e) => setActiveFilterValue(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none shadow-sm"
          >
            <option value="all">All ({dataset.rows.length} rows)</option>
            {Array.from(new Set(dataset.rows.map((r) => String(r[selectedCategoryCol])))).map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-md shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total {selectedMetricCol}</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalValue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Sum of active dataset</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-md shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Average per Unit</span>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {avgValue.toFixed(1)}
          </div>
          <div className="text-[11px] text-slate-400">Mean distribution</div>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-md shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Peak Metric Value</span>
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {maxValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Highest single record</div>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-md shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Data Volume</span>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {filteredRows.length}
          </div>
          <div className="text-[11px] text-slate-400">Active records filtered</div>
        </div>
      </div>

      {/* VISUAL CHARTS & BREAKDOWN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown Bars (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/80 bg-white/80 p-6 backdrop-blur-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {selectedMetricCol} by {selectedCategoryCol}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Ranked</span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryEntries.map(([cat, val], idx) => {
              const pct = (val / highestCategoryVal) * 100;
              const share = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0';
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="truncate max-w-[200px]">{cat}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span>{val.toLocaleString()}</span>
                      <span className="text-[11px] text-slate-400">({share}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Table Matrix (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/80 bg-white/80 p-6 backdrop-blur-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Raw Sheet Records ({filteredRows.length})
            </span>
            <span className="text-xs text-emerald-700 font-mono font-semibold">Live Reactive Filter</span>
          </div>

          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl bg-white shadow-inner scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-2.5 font-bold">{selectedCategoryCol}</th>
                  <th className="p-2.5 font-bold text-right">{selectedMetricCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.slice(0, 30).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 truncate font-medium">{String(r[selectedCategoryCol])}</td>
                    <td className="p-2.5 text-right font-mono text-emerald-700 font-semibold">
                      {Number(r[selectedMetricCol])?.toLocaleString() || r[selectedMetricCol]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { parseCSVText, ParsedDataset } from '../../utils/dataEngine';
import {
  BarChart3,
  LineChart,
  PieChart,
  Upload,
  Download,
  Palette,
  Sliders,
  FileCode,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '../../context/ToastContext';

const DEFAULT_CSV = `Month,Revenue,Expenses,Active_Users,Growth_Rate
Jan,45000,28000,1200,12
Feb,52000,31000,1450,15
Mar,61000,34000,1800,22
Apr,58000,32000,1750,18
May,74000,39000,2300,28
Jun,89000,42000,2900,35
Jul,98000,45000,3400,40`;

export const DataVisualizerStudio: React.FC = () => {
  const { showDownloadToast, showErrorToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawText, setRawText] = useState(DEFAULT_CSV);
  const [dataset, setDataset] = useState<ParsedDataset>(() => parseCSVText(DEFAULT_CSV));
  
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut' | 'area'>('bar');
  const [chartTitle, setChartTitle] = useState('Financial & Growth Performance');
  const [labelColumn, setLabelColumn] = useState('Month');
  const [valueColumn, setValueColumn] = useState('Revenue');
  const [colorScheme, setColorScheme] = useState<'blue' | 'crimson' | 'emerald' | 'purple' | 'rainbow'>('blue');

  const handleTextChange = (text: string) => {
    setRawText(text);
    const parsed = parseCSVText(text);
    setDataset(parsed);
    if (parsed.categoricalColumns.length > 0 && !parsed.categoricalColumns.includes(labelColumn)) {
      setLabelColumn(parsed.categoricalColumns[0]);
    }
    if (parsed.numericColumns.length > 0 && !parsed.numericColumns.includes(valueColumn)) {
      setValueColumn(parsed.numericColumns[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        handleTextChange(text);
      };
      reader.readAsText(file);
    }
  };

  // Render Canvas Chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Chart Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
    ctx.fillText(chartTitle, 30, 40);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillText(`${labelColumn} vs ${valueColumn} (${dataset.rows.length} data points)`, 30, 60);

    const labels = dataset.rows.map((r) => String(r[labelColumn] || ''));
    const values = dataset.rows.map((r) => Number(r[valueColumn]) || 0);
    const maxVal = Math.max(...values, 1);

    const paletteColors: Record<string, string[]> = {
      blue: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8'],
      crimson: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#b91c1c'],
      emerald: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#047857'],
      purple: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#6d28d9'],
      rainbow: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    };

    const colors = paletteColors[colorScheme] || paletteColors.blue;

    const plotX = 70;
    const plotY = 90;
    const plotW = width - 110;
    const plotH = height - 150;

    if (chartType === 'bar') {
      const barWidth = (plotW / values.length) * 0.65;
      const gap = (plotW / values.length) * 0.35;

      // Draw Grid Lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = plotY + plotH - (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(plotX, y);
        ctx.lineTo(plotX + plotW, y);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Helvetica, Arial, sans-serif';
        ctx.fillText(Math.round((maxVal / 4) * i).toLocaleString(), 20, y + 3);
      }

      // Draw Bars
      values.forEach((val, i) => {
        const x = plotX + i * (barWidth + gap) + gap / 2;
        const barH = (val / maxVal) * plotH;
        const y = plotY + plotH - barH;

        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Label
        ctx.fillStyle = '#475569';
        ctx.font = '10px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i]?.slice(0, 8), x + barWidth / 2, plotY + plotH + 18);
        ctx.fillText(val.toLocaleString(), x + barWidth / 2, y - 6);
      });
      ctx.textAlign = 'left';
    } else if (chartType === 'line' || chartType === 'area') {
      // Draw Grid Lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = plotY + plotH - (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(plotX, y);
        ctx.lineTo(plotX + plotW, y);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Helvetica, Arial, sans-serif';
        ctx.fillText(Math.round((maxVal / 4) * i).toLocaleString(), 20, y + 3);
      }

      const stepX = plotW / Math.max(values.length - 1, 1);

      // Area fill
      if (chartType === 'area') {
        ctx.beginPath();
        ctx.moveTo(plotX, plotY + plotH);
        values.forEach((val, i) => {
          const x = plotX + i * stepX;
          const y = plotY + plotH - (val / maxVal) * plotH;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(plotX + (values.length - 1) * stepX, plotY + plotH);
        ctx.closePath();
        ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.fill();
      }

      // Line Stroke
      ctx.beginPath();
      values.forEach((val, i) => {
        const x = plotX + i * stepX;
        const y = plotY + plotH - (val / maxVal) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 3;
      ctx.stroke();

      // Points & Labels
      values.forEach((val, i) => {
        const x = plotX + i * stepX;
        const y = plotY + plotH - (val / maxVal) * plotH;

        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = colors[0];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '10px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i]?.slice(0, 8), x, plotY + plotH + 18);
      });
      ctx.textAlign = 'left';
    } else if (chartType === 'pie' || chartType === 'doughnut') {
      const centerX = width / 2;
      const centerY = height / 2 + 10;
      const radius = Math.min(plotW, plotH) / 2.2;
      const total = values.reduce((a, b) => a + b, 0);

      let startAngle = -Math.PI / 2;

      values.forEach((val, i) => {
        const sliceAngle = (val / total) * (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle += sliceAngle;
      });

      if (chartType === 'doughnut') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
  }, [dataset, chartType, chartTitle, labelColumn, valueColumn, colorScheme]);

  // Download Chart as PNG
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fileName = `Chart_${chartTitle.replace(/\s+/g, '_')}.png`;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showDownloadToast(fileName, {
      format: 'PNG',
      toolName: 'Data Visualizer',
      message: `Rendered high-resolution chart graphic saved to downloads.`,
    });
  };

  // Download Chart as PDF
  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const fileName = `Chart_${chartTitle.replace(/\s+/g, '_')}.pdf`;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 15, 15, 267, 150);
      pdf.save(fileName);

      showDownloadToast(fileName, {
        format: 'PDF',
        toolName: 'Data Visualizer',
        message: `High-resolution printable landscape chart saved as PDF.`,
      });
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to export PDF chart', 'Export Error');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Studio Header */}
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Data Visualization Studio</h1>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                  Vector Chart Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Generate high-resolution interactive charts from raw CSV text or spreadsheets. Export to PNG & PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>Export PNG</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Data CSV & Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Chart Configurations */}
          <div className="rounded-3xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Chart Settings & Dimensions
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600">Chart Title</label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-600">X-Axis (Labels)</label>
                <select
                  value={labelColumn}
                  onChange={(e) => setLabelColumn(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm mt-1"
                >
                  {dataset.categoricalColumns.concat(dataset.numericColumns).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600">Y-Axis (Metrics)</label>
                <select
                  value={valueColumn}
                  onChange={(e) => setValueColumn(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm mt-1"
                >
                  {dataset.numericColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chart Types */}
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1.5">Chart Type</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['bar', 'line', 'area', 'pie', 'doughnut'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`rounded-xl border py-2 text-xs font-bold capitalize transition-all ${
                      chartType === t
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1.5">Color Palette</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['blue', 'emerald', 'crimson', 'purple', 'rainbow'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setColorScheme(p)}
                    className={`rounded-xl border py-1.5 text-[11px] font-bold capitalize transition-all ${
                      colorScheme === p
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Raw CSV Text Editor */}
          <div className="rounded-3xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Live Data CSV Editor
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Upload CSV File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none shadow-inner leading-relaxed"
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Live Canvas Visualizer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 backdrop-blur-xl shadow-xl shadow-slate-200/50 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 text-xs font-bold text-slate-500">
              <span>High-Res 2D Canvas Renderer</span>
              <span className="font-mono">800 × 500 px</span>
            </div>

            <div className="w-full rounded-2xl border border-slate-200 overflow-hidden shadow-md bg-white">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

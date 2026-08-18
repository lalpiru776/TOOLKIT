import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PassportPhotoSettings } from '../../types';
import { PASSPORT_PRESETS, processPassportPhoto, generatePassportPrintSheet } from '../../utils/passportPhotoEngine';
import {
  Camera,
  Download,
  Upload,
  RefreshCw,
  Maximize2,
  FileDown,
  CheckCircle2,
  Lock,
  Unlock,
  Layers,
  Info,
  Sliders,
  HardDrive,
  Sparkles,
  Gauge,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

// Default demo portrait so user sees instant live calculations
const createSamplePortraitDataUrl = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 600, 750);

  // Soft gradient backdrop
  const grad = ctx.createLinearGradient(0, 0, 0, 750);
  grad.addColorStop(0, '#e2e8f0');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 750);

  // Body / Suit
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(300, 750, 240, 220, 0, 0, Math.PI * 2);
  ctx.fill();

  // White Shirt Collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(250, 530);
  ctx.lineTo(300, 630);
  ctx.lineTo(350, 530);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#e2a77b';
  ctx.fillRect(265, 450, 70, 100);

  // Head / Face
  ctx.fillStyle = '#f5c6a5';
  ctx.beginPath();
  ctx.ellipse(300, 360, 120, 155, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.ellipse(300, 260, 130, 90, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(190, 330, 25, 60, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(410, 330, 25, 60, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(250, 350, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(350, 350, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(250, 335, 20, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(350, 335, 20, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = '#d99066';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 350);
  ctx.lineTo(300, 395);
  ctx.lineTo(312, 395);
  ctx.stroke();

  // Smile
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 420, 24, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.95);
};

export const PassportPhotoStudio: React.FC = () => {
  const { theme } = useTheme();
  const { showDownloadToast, showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSizeKB, setResultSizeKB] = useState<number>(0);
  const [aspectLocked, setAspectLocked] = useState(true);

  // Compression unit state: 'KB' | 'MB' | 'none'
  const [compressionUnit, setCompressionUnit] = useState<'KB' | 'MB' | 'none'>('KB');
  const [compressionTargetValue, setCompressionTargetValue] = useState<number>(50);

  // Settings State
  const [settings, setSettings] = useState<PassportPhotoSettings>({
    countryPreset: 'india',
    widthPx: 413,
    heightPx: 531,
    targetMaxKB: 50,
    targetMaxMB: 0,
    exactUnit: 'px',
    bgColor: '#ffffff',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpness: 0,
    gridSheetType: 'single',
    copies: 8,
  });

  const [activeTab, setActiveTab] = useState<'size' | 'preset' | 'background' | 'print'>('size');

  // Initialize with sample portrait on mount if empty
  useEffect(() => {
    if (!imageSrc) {
      const sample = createSamplePortraitDataUrl();
      setImageSrc(sample);
    }
  }, []);

  // Sync compression unit & target value with settings
  const handleCompressionUnitChange = (unit: 'KB' | 'MB' | 'none') => {
    setCompressionUnit(unit);
    if (unit === 'KB') {
      const val = compressionTargetValue > 1000 ? 50 : compressionTargetValue || 50;
      setCompressionTargetValue(val);
      setSettings((s) => ({ ...s, targetMaxKB: val, targetMaxMB: 0 }));
    } else if (unit === 'MB') {
      const val = compressionTargetValue > 50 ? 1 : Math.max(1, compressionTargetValue) || 1;
      setCompressionTargetValue(val);
      setSettings((s) => ({ ...s, targetMaxMB: val, targetMaxKB: 0 }));
    } else {
      setSettings((s) => ({ ...s, targetMaxKB: 0, targetMaxMB: 0 }));
    }
  };

  const handleCompressionValueChange = (val: number) => {
    setCompressionTargetValue(val);
    if (compressionUnit === 'KB') {
      setSettings((s) => ({ ...s, targetMaxKB: val, targetMaxMB: 0 }));
    } else if (compressionUnit === 'MB') {
      setSettings((s) => ({ ...s, targetMaxMB: val, targetMaxKB: 0 }));
    }
  };

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  // Preset Selection
  const applyPreset = (presetKey: string) => {
    const preset = PASSPORT_PRESETS[presetKey];
    if (!preset) return;

    setCompressionUnit('KB');
    setCompressionTargetValue(preset.defaultKB);

    setSettings((prev) => ({
      ...prev,
      countryPreset: presetKey as any,
      widthPx: preset.width,
      heightPx: preset.height,
      targetMaxKB: preset.defaultKB,
      targetMaxMB: 0,
    }));
  };

  // Re-render processed photo whenever settings or source image change
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      setIsProcessing(true);
      try {
        const result = await processPassportPhoto(img, settings);
        setResultDataUrl(result.dataUrl);
        setResultBlob(result.blob);
        setResultSizeKB(result.finalSizeKB);
      } catch (err) {
        console.error('Passport photo processing error:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    img.src = imageSrc;
  }, [imageSrc, settings]);

  // Calculated Real-Time Metrics
  const calculatedMetrics = useMemo(() => {
    const sizeInKB = resultSizeKB;
    const sizeInMB = (resultSizeKB / 1024).toFixed(3);
    const sizeInBytes = resultBlob?.size || resultSizeKB * 1024;
    const megapixels = ((settings.widthPx * settings.heightPx) / 1000000).toFixed(2);
    const aspectRatio = (settings.widthPx / settings.heightPx).toFixed(2);

    let targetLimitKB = 0;
    if (compressionUnit === 'KB') {
      targetLimitKB = compressionTargetValue;
    } else if (compressionUnit === 'MB') {
      targetLimitKB = compressionTargetValue * 1024;
    }

    const isUnderLimit = targetLimitKB > 0 ? sizeInKB <= targetLimitKB : true;
    const limitUsagePct = targetLimitKB > 0 ? Math.min(100, Math.round((sizeInKB / targetLimitKB) * 100)) : 0;

    return {
      sizeInKB,
      sizeInMB,
      sizeInBytes,
      megapixels,
      aspectRatio,
      targetLimitKB,
      isUnderLimit,
      limitUsagePct,
    };
  }, [resultSizeKB, resultBlob, settings.widthPx, settings.heightPx, compressionUnit, compressionTargetValue]);

  // Download Handler
  const handleDownload = async (sheetType: 'single' | '4x6' | 'a4' = 'single') => {
    if (!resultBlob) return;

    if (sheetType === 'single') {
      const fileName = `passport_photo_${settings.widthPx}x${settings.heightPx}_${resultSizeKB}kb.jpg`;
      const link = document.createElement('a');
      link.href = resultDataUrl!;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showDownloadToast(fileName, {
        size: `${calculatedMetrics.sizeInKB} KB`,
        format: 'JPG',
        toolName: 'Passport Photo Resizer',
        message: `Saved ${settings.widthPx}×${settings.heightPx}px photo (${calculatedMetrics.sizeInKB} KB) to your device.`,
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } else {
      setIsProcessing(true);
      try {
        const sheet = await generatePassportPrintSheet(
          resultBlob,
          sheetType,
          settings.widthPx,
          settings.heightPx
        );
        const fileName = `passport_print_sheet_${sheetType}_${Date.now()}.jpg`;
        const link = document.createElement('a');
        link.href = sheet.dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const photoCount = sheetType === '4x6' ? 8 : 32;
        showDownloadToast(fileName, {
          format: 'JPG',
          toolName: 'Passport Print Sheet',
          message: `Saved ${sheetType.toUpperCase()} print sheet with ${photoCount} photos formatted for standard printing.`,
        });

        confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
      } catch (e: any) {
        console.error('Print sheet generation failed', e);
        showErrorToast(e.message || 'Failed to generate print sheet', 'Print Sheet Error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Studio Header */}
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Passport Photo Studio</h1>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                  Exact KB & Pixel Resizer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Configure exact target dimensions in pixels and select compression limits (KB / MB) with real-time size calculations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all shrink-0"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Your Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Size Configuration & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 rounded-2xl bg-white/60 p-1.5 border border-white/80 text-xs font-medium backdrop-blur-md shadow-sm">
            <button
              onClick={() => setActiveTab('size')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                activeTab === 'size'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Size Configuration</span>
            </button>

            <button
              onClick={() => setActiveTab('preset')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                activeTab === 'preset'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Country Presets</span>
            </button>

            <button
              onClick={() => setActiveTab('background')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                activeTab === 'background'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Backdrop & Filters</span>
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
                activeTab === 'print'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Print Sheets</span>
            </button>
          </div>

          {/* TAB 1: SIZE CONFIGURATION SECTION */}
          {activeTab === 'size' && (
            <div className="space-y-4">
              
              {/* SIZE CONFIGURATION CARD */}
              <div className="rounded-3xl border border-white/80 bg-white/70 p-5 space-y-5 backdrop-blur-xl shadow-sm">
                
                {/* 1. Target Dimensions (Pixels) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Target Dimensions (Pixels)
                      </label>
                    </div>

                    <button
                      onClick={() => setAspectLocked(!aspectLocked)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        aspectLocked
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {aspectLocked ? <Lock className="h-3 w-3 text-blue-600" /> : <Unlock className="h-3 w-3 text-slate-400" />}
                      <span>{aspectLocked ? 'Aspect Ratio Locked' : 'Free Aspect Ratio'}</span>
                    </button>
                  </div>

                  {/* Width and Height Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-inner">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                        <span>Target Width</span>
                        <span className="font-mono text-slate-400 text-[11px]">pixels (px)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="50"
                          max="3000"
                          value={settings.widthPx}
                          onChange={(e) => {
                            const w = parseInt(e.target.value, 10) || 50;
                            setSettings((s) => ({
                              ...s,
                              widthPx: w,
                              heightPx: aspectLocked ? Math.round(w * (s.heightPx / s.widthPx || 531 / 413)) : s.heightPx,
                            }));
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-slate-900 font-mono focus:border-blue-500 focus:bg-white focus:outline-none shadow-sm transition-all"
                        />
                        <span className="text-xs font-bold text-slate-400">px</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-inner">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                        <span>Target Height</span>
                        <span className="font-mono text-slate-400 text-[11px]">pixels (px)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="50"
                          max="4000"
                          value={settings.heightPx}
                          onChange={(e) => {
                            const h = parseInt(e.target.value, 10) || 50;
                            setSettings((s) => ({
                              ...s,
                              heightPx: h,
                              widthPx: aspectLocked ? Math.round(h * (s.widthPx / s.heightPx || 413 / 531)) : s.widthPx,
                            }));
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-slate-900 font-mono focus:border-blue-500 focus:bg-white focus:outline-none shadow-sm transition-all"
                        />
                        <span className="text-xs font-bold text-slate-400">px</span>
                      </div>
                    </div>
                  </div>

                  {/* Preset Dimension Quick-Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">Quick Sizes:</span>
                    {[
                      { label: '413 × 531 px', w: 413, h: 531, tag: '35×45mm' },
                      { label: '600 × 600 px', w: 600, h: 600, tag: '2×2 in' },
                      { label: '350 × 450 px', w: 350, h: 450, tag: 'SSC / UPSC' },
                      { label: '590 × 826 px', w: 590, h: 826, tag: 'Canada' },
                      { label: '300 × 300 px', w: 300, h: 300, tag: 'Square' },
                    ].map((dim) => {
                      const isSelected = settings.widthPx === dim.w && settings.heightPx === dim.h;
                      return (
                        <button
                          key={dim.label}
                          onClick={() =>
                            setSettings((s) => ({
                              ...s,
                              widthPx: dim.w,
                              heightPx: dim.h,
                            }))
                          }
                          className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all border ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          <span>{dim.label}</span>
                          <span className={`ml-1 text-[9px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            ({dim.tag})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-200/70 pt-4">
                  {/* 2. Target Compression Output Format & Limits */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
                        <HardDrive className="h-3.5 w-3.5" />
                      </div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Compression Output Format & File Size Limit
                      </label>
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {compressionUnit === 'none'
                        ? 'No Size Limit (Standard Quality)'
                        : `Target Limit: < ${compressionTargetValue} ${compressionUnit}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center mb-3">
                    {/* Format Dropdown Selector */}
                    <div className="sm:col-span-5">
                      <label className="text-[11px] font-medium text-slate-500 block mb-1">
                        Compression Output Unit
                      </label>
                      <select
                        value={compressionUnit}
                        onChange={(e) => handleCompressionUnitChange(e.target.value as 'KB' | 'MB' | 'none')}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none shadow-sm"
                      >
                        <option value="KB">Kilobytes (KB) — Govt Exams, Passports & Forms</option>
                        <option value="MB">Megabytes (MB) — High Resolution Archival</option>
                        <option value="none">No Limit — Maximum Quality JPG/PNG</option>
                      </select>
                    </div>

                    {/* Numeric Target Input */}
                    {compressionUnit !== 'none' && (
                      <div className="sm:col-span-7">
                        <label className="text-[11px] font-medium text-slate-500 block mb-1">
                          Max Target Size ({compressionUnit})
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={compressionUnit === 'KB' ? 5 : 0.1}
                            max={compressionUnit === 'KB' ? 10000 : 50}
                            step={compressionUnit === 'KB' ? 5 : 0.5}
                            value={compressionTargetValue}
                            onChange={(e) => handleCompressionValueChange(parseFloat(e.target.value) || 0)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 font-mono focus:border-blue-500 focus:outline-none shadow-sm"
                            placeholder={compressionUnit === 'KB' ? 'e.g. 50' : 'e.g. 1'}
                          />
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-2 rounded-xl">
                            {compressionUnit}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preset Values for Active Unit */}
                  {compressionUnit === 'KB' && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] font-semibold text-slate-400">KB Presets:</span>
                      {[20, 30, 45, 50, 100, 200, 500].map((kb) => (
                        <button
                          key={kb}
                          onClick={() => handleCompressionValueChange(kb)}
                          className={`rounded-xl border px-2.5 py-1 text-xs font-bold transition-all ${
                            compressionTargetValue === kb
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                          }`}
                        >
                          &lt; {kb} KB
                        </button>
                      ))}
                    </div>
                  )}

                  {compressionUnit === 'MB' && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] font-semibold text-slate-400">MB Presets:</span>
                      {[0.5, 1, 2, 5, 10].map((mb) => (
                        <button
                          key={mb}
                          onClick={() => handleCompressionValueChange(mb)}
                          className={`rounded-xl border px-2.5 py-1 text-xs font-bold transition-all ${
                            compressionTargetValue === mb
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                          }`}
                        >
                          &lt; {mb} MB
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* REAL-TIME CALCULATED FILE SIZE PREVIEW CARD */}
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 space-y-3 backdrop-blur-xl shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Real-Time Calculated Size Preview
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isProcessing ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Calculating...</span>
                      </span>
                    ) : calculatedMetrics.isUnderLimit ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>Within Limit</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Adjusting...
                      </span>
                    )}
                  </div>
                </div>

                {/* 3 Real-time Metric Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Calculated KB
                    </span>
                    <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                      {calculatedMetrics.sizeInKB} KB
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {calculatedMetrics.sizeInBytes.toLocaleString()} bytes
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Calculated MB
                    </span>
                    <div className="text-xl font-black text-blue-600 font-mono mt-0.5">
                      {calculatedMetrics.sizeInMB} MB
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Target: {compressionUnit === 'MB' ? `< ${compressionTargetValue} MB` : 'Dynamic'}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Pixel Matrix & MP
                    </span>
                    <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">
                      {settings.widthPx} × {settings.heightPx}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {calculatedMetrics.megapixels} MP ({calculatedMetrics.aspectRatio}:1)
                    </span>
                  </div>
                </div>

                {/* Size Gauge / Usage Bar */}
                {calculatedMetrics.targetLimitKB > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>File Size vs Limit Allocation:</span>
                      <span className="font-mono text-slate-900">
                        {calculatedMetrics.sizeInKB} KB / {calculatedMetrics.targetLimitKB} KB ({calculatedMetrics.limitUsagePct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          calculatedMetrics.limitUsagePct <= 90
                            ? 'bg-emerald-500'
                            : calculatedMetrics.limitUsagePct <= 100
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${calculatedMetrics.limitUsagePct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: COUNTRY STANDARDS PRESETS */}
          {activeTab === 'preset' && (
            <div className="rounded-3xl border border-white/80 bg-white/70 p-5 space-y-3 backdrop-blur-xl shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Official Passport & Visa Template
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(PASSPORT_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      settings.countryPreset === key
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 shadow-sm'
                        : 'border-slate-200 bg-white/60 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{preset.label}</span>
                      <span className="text-[10px] rounded bg-white px-1.5 py-0.5 text-slate-600 font-mono border border-slate-200">
                        {preset.width}×{preset.height} px
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{preset.desc}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-blue-600 font-semibold">
                      <span>Limit: &lt; {preset.defaultKB} KB</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BACKGROUND COLOR & LIGHTING */}
          {activeTab === 'background' && (
            <div className="rounded-3xl border border-white/80 bg-white/70 p-5 space-y-4 backdrop-blur-xl shadow-sm">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-2">
                  Official Background Backdrop
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'Studio White', color: '#ffffff' },
                    { label: 'Sky Blue', color: '#0066cc' },
                    { label: 'Light Blue', color: '#38bdf8' },
                    { label: 'Off-White', color: '#f1f5f9' },
                    { label: 'Crimson Red', color: '#dc2626' },
                    { label: 'Transparent', color: 'transparent' },
                  ].map((bg) => (
                    <button
                      key={bg.label}
                      onClick={() => setSettings((s) => ({ ...s, bgColor: bg.color }))}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                        settings.bgColor === bg.color
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50'
                          : 'border-slate-200 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div
                        className="h-6 w-6 rounded-full border border-slate-300 shadow-sm"
                        style={{ backgroundColor: bg.color }}
                      />
                      <span className="mt-1 text-[10px] text-slate-700 font-medium">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>Brightness</span>
                    <span className="font-mono font-semibold">{settings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={settings.brightness}
                    onChange={(e) => setSettings((s) => ({ ...s, brightness: Number(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>Contrast</span>
                    <span className="font-mono font-semibold">{settings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={settings.contrast}
                    onChange={(e) => setSettings((s) => ({ ...s, contrast: Number(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>Saturation</span>
                    <span className="font-mono font-semibold">{settings.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.saturation}
                    onChange={(e) => setSettings((s) => ({ ...s, saturation: Number(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRINT SHEETS */}
          {activeTab === 'print' && (
            <div className="rounded-3xl border border-white/80 bg-white/70 p-5 space-y-4 backdrop-blur-xl shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Generate Printable Grid Sheets (With Cut Lines)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload('4x6')}
                  className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-left hover:bg-blue-50 transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-900">4 × 6 Inch Print Sheet</span>
                    <Download className="h-4 w-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">8 Photos formatted for standard 4x6 photo paper.</p>
                </button>

                <button
                  onClick={() => handleDownload('a4')}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-left hover:bg-white transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">A4 Full Sheet Paper</span>
                    <Download className="h-4 w-4 text-slate-600 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">32 Photos formatted for A4 standard color printing.</p>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live Photo Preview & Real-Time Stats (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 backdrop-blur-xl flex flex-col items-center text-center shadow-xl shadow-slate-200/50">
            
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Photo Preview
              </span>
              {resultSizeKB > 0 && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                  {calculatedMetrics.sizeInKB} KB ({calculatedMetrics.sizeInMB} MB)
                </span>
              )}
            </div>

            {/* Photo Canvas Container */}
            <div className="relative w-full max-w-[260px] aspect-[3.5/4.5] rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100 flex items-center justify-center">
              {resultDataUrl ? (
                <img
                  src={resultDataUrl}
                  alt="Passport Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 text-slate-400 cursor-pointer hover:text-blue-600"
                >
                  <Camera className="h-12 w-12 stroke-[1.5] mb-2 text-blue-500" />
                  <span className="text-xs font-bold text-slate-700">Click to Upload Photo</span>
                  <span className="text-[10px] text-slate-400 mt-1">JPG, PNG, or WebP</span>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Live Size & Dimension Badge */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                {settings.widthPx} × {settings.heightPx} px
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {calculatedMetrics.sizeInKB} KB
              </span>
            </div>

            {/* Compliance Guarantee */}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 w-full text-left">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                Formatted according to ICAO standard. Real-time compression engine active.
              </span>
            </div>

            {/* Main Single Download Button */}
            <button
              onClick={() => handleDownload('single')}
              disabled={!resultBlob || isProcessing}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>
                Download Photo ({calculatedMetrics.sizeInKB} KB / {calculatedMetrics.sizeInMB} MB)
              </span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

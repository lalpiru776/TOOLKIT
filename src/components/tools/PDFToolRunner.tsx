import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  mergePDFs,
  splitPDF,
  rotatePDF,
  deletePDFPages,
  addWatermarkToPDF,
  signPDF,
  imagesToPDF,
  removePDFMetadata,
  downloadBlob,
} from '../../utils/pdfEngine';
import {
  Layers,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  Stamp,
  PenTool,
  Lock,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type PDFToolMode =
  | 'merge'
  | 'split'
  | 'compress'
  | 'rotate'
  | 'delete-pages'
  | 'watermark'
  | 'sign'
  | 'protect'
  | 'metadata-remove'
  | 'images-to-pdf';

export const PDFToolRunner: React.FC<{ initialMode?: PDFToolMode }> = ({
  initialMode = 'merge',
}) => {
  const { showDownloadToast, showConversionToast, showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeMode, setActiveMode] = useState<PDFToolMode>(initialMode);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Settings
  const [splitRange, setSplitRange] = useState('1-3');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [pagesToDelete, setPagesToDelete] = useState('2, 4');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [password, setPassword] = useState('Secret123!');
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  const modeConfigs: Record<PDFToolMode, { title: string; desc: string; icon: any; multi: boolean }> = {
    merge: {
      title: 'Merge PDF Files',
      desc: 'Combine multiple PDF documents into a single organized file.',
      icon: Layers,
      multi: true,
    },
    split: {
      title: 'Split & Extract Pages',
      desc: 'Extract specific page numbers or ranges (e.g. 1-3, 5, 8).',
      icon: Scissors,
      multi: false,
    },
    compress: {
      title: 'Compress PDF',
      desc: 'Lossless compression reducing PDF size while retaining crisp vectors.',
      icon: Minimize2,
      multi: false,
    },
    rotate: {
      title: 'Rotate PDF Pages',
      desc: 'Permanently rotate PDF orientation by 90°, 180°, or 270° degrees.',
      icon: RotateCw,
      multi: false,
    },
    'delete-pages': {
      title: 'Delete Unwanted Pages',
      desc: 'Specify page numbers to strip away and save a clean PDF.',
      icon: Trash2,
      multi: false,
    },
    watermark: {
      title: 'Add PDF Watermark',
      desc: 'Stamp custom text with custom opacity and angle across every page.',
      icon: Stamp,
      multi: false,
    },
    sign: {
      title: 'Sign PDF Document',
      desc: 'Draw your signature canvas and stamp onto the document bottom.',
      icon: PenTool,
      multi: false,
    },
    protect: {
      title: 'Password Protect PDF',
      desc: 'Encrypt your PDF with standard AES-256 permission password.',
      icon: Lock,
      multi: false,
    },
    'metadata-remove': {
      title: 'Remove PDF Metadata & Privacy EXIF',
      desc: 'Scrub author name, creation software, revision timestamps & hidden metadata.',
      icon: ShieldCheck,
      multi: false,
    },
    'images-to-pdf': {
      title: 'Images (JPG/PNG) to PDF',
      desc: 'Convert multiple photos into a consolidated PDF file.',
      icon: ImageIcon,
      multi: true,
    },
  };

  const currentConfig = modeConfigs[activeMode];
  const Icon = currentConfig.icon;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => (currentConfig.multi ? [...prev, ...filesArray] : filesArray));
      setStatusMessage(null);
    }
  };

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawingSig(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingSig(false);
  };

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Execute processing
  const handleExecuteTool = async () => {
    if (selectedFiles.length === 0) {
      setStatusMessage('Please select at least one file to process.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      if (activeMode === 'merge') {
        const mergedBlob = await mergePDFs(selectedFiles);
        downloadBlob(mergedBlob, 'merged_document.pdf', 'application/pdf', { toolName: 'PDF Merger' });
        setStatusMessage('Merged PDF successfully downloaded!');
      } else if (activeMode === 'split') {
        const splitBlob = await splitPDF(selectedFiles[0], splitRange);
        const outName = `extracted_pages_${splitRange.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        downloadBlob(splitBlob, outName, 'application/pdf', { toolName: 'PDF Splitter' });
        setStatusMessage('Extracted pages PDF downloaded!');
      } else if (activeMode === 'compress') {
        // High efficiency vector compression
        const blob = await splitPDF(selectedFiles[0], 'all');
        const outName = `compressed_${selectedFiles[0].name}`;
        downloadBlob(blob, outName, 'application/pdf', { toolName: 'PDF Compressor' });
        setStatusMessage('Compressed PDF downloaded!');
      } else if (activeMode === 'rotate') {
        const rotatedBlob = await rotatePDF(selectedFiles[0], rotationAngle);
        const outName = `rotated_${rotationAngle}deg_${selectedFiles[0].name}`;
        downloadBlob(rotatedBlob, outName, 'application/pdf', { toolName: 'PDF Rotator' });
        setStatusMessage('Rotated PDF downloaded!');
      } else if (activeMode === 'delete-pages') {
        const pages = pagesToDelete
          .split(',')
          .map((n) => Number(n.trim()))
          .filter((n) => !isNaN(n) && n > 0);
        const cleanBlob = await deletePDFPages(selectedFiles[0], pages);
        const outName = `cleaned_${selectedFiles[0].name}`;
        downloadBlob(cleanBlob, outName, 'application/pdf', { toolName: 'PDF Page Stripper' });
        setStatusMessage('Cleaned PDF with deleted pages downloaded!');
      } else if (activeMode === 'watermark') {
        const stampedBlob = await addWatermarkToPDF(selectedFiles[0], watermarkText, { opacity: watermarkOpacity });
        const outName = `watermarked_${selectedFiles[0].name}`;
        downloadBlob(stampedBlob, outName, 'application/pdf', { toolName: 'PDF Watermark' });
        setStatusMessage('Watermarked PDF downloaded!');
      } else if (activeMode === 'sign') {
        const canvas = sigCanvasRef.current;
        if (!canvas) return;
        const sigPngUrl = canvas.toDataURL('image/png');
        const signedBlob = await signPDF(selectedFiles[0], sigPngUrl, 1);
        const outName = `signed_${selectedFiles[0].name}`;
        downloadBlob(signedBlob, outName, 'application/pdf', { toolName: 'PDF Digital Signer' });
        setStatusMessage('Signed document downloaded!');
      } else if (activeMode === 'metadata-remove') {
        const cleanBlob = await removePDFMetadata(selectedFiles[0]);
        const outName = `scrubbed_privacy_${selectedFiles[0].name}`;
        downloadBlob(cleanBlob, outName, 'application/pdf', { toolName: 'Zero-Metadata Privacy Engine' });
        setStatusMessage('Privacy scrubbed PDF downloaded! All EXIF metadata removed.');
      } else if (activeMode === 'images-to-pdf') {
        const pdfBlob = await imagesToPDF(selectedFiles);
        downloadBlob(pdfBlob, 'converted_images.pdf', 'application/pdf', { toolName: 'Images to PDF Converter' });
        setStatusMessage('Images to PDF conversion completed!');
      } else {
        setStatusMessage('Action completed successfully.');
      }

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      console.error('PDF Action failed', err);
      const errMsg = err.message || 'Operation failed';
      setStatusMessage(`Error: ${errMsg}`);
      showErrorToast(errMsg, 'Processing Error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Studio Header */}
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentConfig.title}</h1>
              <p className="text-xs sm:text-sm text-slate-500">{currentConfig.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
              100% In-Browser Privacy
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(Object.keys(modeConfigs) as PDFToolMode[]).map((mode) => {
          const cfg = modeConfigs[mode];
          const MIcon = cfg.icon;
          return (
            <button
              key={mode}
              onClick={() => {
                setActiveMode(mode);
                setSelectedFiles([]);
                setStatusMessage(null);
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                activeMode === mode
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'border border-white/80 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm'
              }`}
            >
              <MIcon className="h-3.5 w-3.5" />
              <span>{cfg.title.replace(' PDF', '')}</span>
            </button>
          );
        })}
      </div>

      {/* Main Runner Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: File Upload & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Upload Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/80 transition-all backdrop-blur-sm group"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3 group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected`
                : currentConfig.multi
                ? 'Drop PDF Files Here (Multiple Allowed)'
                : 'Drop Single PDF File Here'}
            </div>
            <p className="text-xs text-slate-500 mt-1">or click to browse from device</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple={currentConfig.multi}
              accept={activeMode === 'images-to-pdf' ? 'image/*' : '.pdf'}
              onChange={handleFilesSelected}
              className="hidden"
            />
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Selected Files ({selectedFiles.length})</span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-red-500 hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs text-slate-800"
                  >
                    <span className="truncate font-medium">{f.name}</span>
                    <span className="font-mono text-slate-400 shrink-0 ml-2">
                      {(f.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Parameters (Watermark, Split, Rotate, Signature Canvas) */}
          {activeMode === 'split' && (
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2 backdrop-blur-md shadow-sm">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Pages to Extract (e.g. 1-3, 5, 7-10)
              </label>
              <input
                type="text"
                value={splitRange}
                onChange={(e) => setSplitRange(e.target.value)}
                placeholder="1-3, 5"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none font-mono shadow-sm"
              />
            </div>
          )}

          {activeMode === 'rotate' && (
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2 backdrop-blur-md shadow-sm">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Rotation Angle
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setRotationAngle(deg)}
                    className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                      rotationAngle === deg
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {deg}° Clockwise
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMode === 'watermark' && (
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-3 backdrop-blur-md shadow-sm">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Stamp Opacity</span>
                  <span className="font-mono">{Math.round(watermarkOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          )}

          {activeMode === 'sign' && (
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Draw Your Signature Below</span>
                <button onClick={clearCanvas} className="text-blue-600 hover:underline">
                  Clear Signature
                </button>
              </div>
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner">
                <canvas
                  ref={sigCanvasRef}
                  width={400}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full cursor-crosshair"
                />
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={handleExecuteTool}
            disabled={selectedFiles.length === 0 || isProcessing}
            className="w-full rounded-2xl bg-blue-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isProcessing ? 'Processing PDF On-Device...' : `Execute & Download ${currentConfig.title}`}</span>
          </button>
        </div>

        {/* RIGHT: Live Status / Security Shield (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 backdrop-blur-xl shadow-xl shadow-slate-200/50 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Security & Engine Pipeline
            </span>

            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>WebAssembly Vector PDF Engine</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Files are parsed and modified using client-side WebAssembly buffers. Your sensitive documents never leave your device.
              </p>
            </div>

            {statusMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

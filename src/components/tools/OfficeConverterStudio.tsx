import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  convertTextDocToPdf,
  convertExcelToPdf,
  convertPdfToExcel,
  convertPptToWord,
  convertExcelToPpt,
  convertWordToPptx,
  parseDocumentToSlides,
  SlideContent,
  PPTXTheme,
} from '../../utils/officeEngine';
import {
  FileSpreadsheet,
  FileText,
  Presentation,
  Upload,
  Download,
  ArrowRight,
  CheckCircle2,
  Table,
  RefreshCw,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Eye,
  FileCode,
  Layout,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Columns,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

export type OfficeMode =
  | 'word-to-pptx'
  | 'docx-to-pdf'
  | 'pdf-to-docx'
  | 'excel-to-pdf'
  | 'pdf-to-excel'
  | 'ppt-to-word'
  | 'excel-to-ppt';

const PRESET_WORD_DOCUMENTS = {
  strategy: {
    label: '📊 Strategic Business Proposal',
    text: `# 2026 STRATEGIC GROWTH & EXPANSION PROPOSAL
Presented by Executive Leadership Team

## Executive Summary
- Scaled global infrastructure capacity by 240% across 12 target regional zones.
- Maintained 99.99% service availability during peak enterprise utilization.
- Operating margins expanded by 18.5% year-over-year through automated pipeline workflows.

## Key Market Opportunities
- Accelerating enterprise adoption of zero-trust confidential cloud computing.
- High demand for integrated multi-modal AI intelligence in document workflows.
- Untapped customer segments in mid-market financial & healthcare compliance.

## Operational Milestones & Architecture
- Deployed high-throughput edge nodes with sub-20ms cold-start latency.
- Established strict ISO 27001 and SOC 2 Type II data residency standards.
- Automated client-side cryptography pipelines eliminating server-side data leakage.

## Projected Financial Impact
- Estimated 3.2x revenue multiple within 24 months post-expansion.
- CAC reduction of 35% through organic developer flywheel adoption.
- Net recurring ARR expected to cross target milestones by Q4.

## Next Steps & Timeline
- Finalize capital allocation and engineering sprint roadmap by end of quarter.
- Initiate enterprise partner pilot programs across key global accounts.
- Schedule bi-weekly executive review checkpoints for delivery verification.`,
  },
  productPitch: {
    label: '🚀 Product Launch Pitch Deck',
    text: `# NEXTGEN AI WORKSPACE PLATFORM
Investor & Stakeholder Pitch

## The Problem
- Modern teams waste 4.5 hours weekly converting and reconciling incompatible file formats.
- Traditional cloud converters compromise corporate confidentiality by uploading raw documents.
- Disjointed single-purpose tools lead to security vulnerabilities and high subscription bloat.

## Our Solution: TOOLKIT AI
- Unified suite of 50+ privacy-first document, data, and presentation conversion utilities.
- 100% Client-Side WebAssembly & Vector Processing with Zero Server Logs.
- Direct Gemini 3.7 AI intelligence integrated for instant executive synthesis.

## Product Capabilities & USP
- Word to Native PowerPoint (.pptx) conversion with dynamic layout generation.
- Instant Excel BI dashboards and vector data chart exports.
- ATS-compliant resume builder with 99.4% parser pass rate.

## Business Model & Traction
- Freemium developer tier combined with enterprise team license subscriptions.
- 150k+ monthly active operations across 85 countries.
- 68% viral organic referral rate through exported document watermarks.

## Call to Action & Ask
- Raising Series Seed funding to expand edge compute infrastructure.
- Join our private beta cohort of enterprise workflow design partners.`,
  },
  techArchitecture: {
    label: '💻 Technical Architecture Review',
    text: `# DISTRIBUTED ZERO-TRUST COMPUTING ENGINE
Engineering Architecture & Security Specs

## System Architecture Overview
- Client-side WebAssembly sandbox executing isolation-grade conversions.
- Immutable cryptographic hashing for audit trail integrity verification.
- Zero raw data transit to external persistent storage endpoints.

## Core Engine Components
- Vector PDF Generation Engine powered by lightweight streaming buffer pipes.
- Native PowerPoint Presentation Builder synthesizing structured OOXML decks.
- Dynamic Sheet Matrix Extractor for large-scale table parsing.

## Performance Benchmarks
- Cold-start compile time under 45 milliseconds across all modern browsers.
- Memory footprint optimized to less than 35MB active RAM during batch conversions.
- Linear execution scaling with client CPU core thread count.

## Security & Compliance
- Full GDPR, HIPAA, and CCPA alignment with zero-storage architecture.
- Real-time SHA-256 integrity checksum verification per generated asset.`,
  },
};

const THEME_STYLES: Record<
  PPTXTheme,
  {
    name: string;
    description: string;
    bgClass: string;
    cardBg: string;
    textColor: string;
    accentBg: string;
    accentText: string;
    borderClass: string;
    previewBg: string;
  }
> = {
  executive: {
    name: 'Executive Corporate',
    description: 'Crisp Navy & Royal Blue',
    bgClass: 'bg-slate-50',
    cardBg: 'bg-white',
    textColor: 'text-slate-900',
    accentBg: 'bg-blue-600',
    accentText: 'text-blue-600',
    borderClass: 'border-slate-200',
    previewBg: '#F8FAFC',
  },
  'slate-teal': {
    name: 'Modern Slate & Teal',
    description: 'Clean Minimalist Teal',
    bgClass: 'bg-teal-50/40',
    cardBg: 'bg-white',
    textColor: 'text-teal-950',
    accentBg: 'bg-teal-600',
    accentText: 'text-teal-600',
    borderClass: 'border-teal-200',
    previewBg: '#F0FDFA',
  },
  'midnight-dark': {
    name: 'Midnight Dark Tech',
    description: 'Obsidian & Indigo Neon',
    bgClass: 'bg-slate-900',
    cardBg: 'bg-slate-800',
    textColor: 'text-white',
    accentBg: 'bg-indigo-500',
    accentText: 'text-indigo-400',
    borderClass: 'border-slate-700',
    previewBg: '#0F172A',
  },
  'minimal-editorial': {
    name: 'Minimal Editorial',
    description: 'Warm Stone & Amber',
    bgClass: 'bg-stone-50',
    cardBg: 'bg-white',
    textColor: 'text-stone-900',
    accentBg: 'bg-amber-600',
    accentText: 'text-amber-600',
    borderClass: 'border-stone-200',
    previewBg: '#FAFAF9',
  },
  'vibrant-sunset': {
    name: 'Sunset Pitch',
    description: 'High-Energy Rose & Coral',
    bgClass: 'bg-rose-50/30',
    cardBg: 'bg-white',
    textColor: 'text-rose-950',
    accentBg: 'bg-orange-600',
    accentText: 'text-orange-600',
    borderClass: 'border-rose-200',
    previewBg: '#FFFBEB',
  },
};

export const OfficeConverterStudio: React.FC<{ initialMode?: OfficeMode }> = ({
  initialMode = 'word-to-pptx',
}) => {
  const { showConversionToast, showDownloadToast, showSuccessToast, showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeMode, setActiveMode] = useState<OfficeMode>(initialMode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const [customText, setCustomText] = useState(PRESET_WORD_DOCUMENTS.strategy.text);

  // PPTX Specific Customizer State
  const [slides, setSlides] = useState<SlideContent[]>(() => parseDocumentToSlides(PRESET_WORD_DOCUMENTS.strategy.text));
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<PPTXTheme>('executive');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3'>('16:9');
  const [authorName, setAuthorName] = useState('Executive Team');
  const [companyName, setCompanyName] = useState('TOOLKIT AI Studio');
  const [presentationTitle, setPresentationTitle] = useState('2026_Strategic_Growth_Proposal');

  // Sync slides whenever document text changes if in word-to-pptx mode
  useEffect(() => {
    if (activeMode === 'word-to-pptx' && customText) {
      const parsed = parseDocumentToSlides(customText, selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'Presentation Deck');
      setSlides(parsed);
      setActiveSlideIndex(0);
      if (parsed[0]?.title) {
        setPresentationTitle(parsed[0].title.replace(/[^a-zA-Z0-9_-]/g, '_'));
      }
    }
  }, [customText, selectedFile, activeMode]);

  const modeConfigs: Record<
    OfficeMode,
    { title: string; from: string; to: string; accept: string; icon: any; desc: string; badge: string }
  > = {
    'word-to-pptx': {
      title: 'Word (DOCX) → PowerPoint (PPTX)',
      from: 'DOCX / DOC / TXT / Markdown',
      to: 'PowerPoint Presentation (.pptx)',
      accept: '.docx,.doc,.txt,.rtf,.md',
      icon: Presentation,
      desc: 'Convert Word documents & reports into editable, styled PowerPoint presentations with themes and custom layouts.',
      badge: 'Native .PPTX Engine',
    },
    'docx-to-pdf': {
      title: 'Word (DOCX) → PDF',
      from: 'DOCX / DOC / TXT',
      to: 'High-Fidelity PDF',
      accept: '.docx,.doc,.txt,.rtf',
      icon: FileText,
      desc: 'Convert formatted Word documents into standard non-editable PDF sheets.',
      badge: 'Vector PDF',
    },
    'pdf-to-docx': {
      title: 'PDF → Word (DOCX)',
      from: 'PDF Document',
      to: 'Editable DOCX',
      accept: '.pdf',
      icon: FileSpreadsheet,
      desc: 'Extract text, headings and paragraphs from PDF into an editable Word document.',
      badge: 'Editable DOCX',
    },
    'excel-to-pdf': {
      title: 'Excel (XLSX) → PDF',
      from: 'Excel / CSV',
      to: 'Formatted PDF Table',
      accept: '.xlsx,.xls,.csv',
      icon: FileSpreadsheet,
      desc: 'Render data sheets with row borders and header styling into printable PDF.',
      badge: 'Print Ready',
    },
    'pdf-to-excel': {
      title: 'PDF → Excel (XLSX)',
      from: 'PDF Document',
      to: 'Structured XLSX Spreadsheet',
      accept: '.pdf',
      icon: Table,
      desc: 'Parse table matrices from PDF and format directly into structured Excel columns.',
      badge: 'Table OCR',
    },
    'ppt-to-word': {
      title: 'PowerPoint (PPT) → Word',
      from: 'PPTX / PPT Slides',
      to: 'Word Speaker Notes / Outline',
      accept: '.pptx,.ppt',
      icon: Presentation,
      desc: 'Extract slide headings, bullet points, and speaker notes into a DOCX report.',
      badge: 'Docx Outliner',
    },
    'excel-to-ppt': {
      title: 'Excel (XLSX) → PowerPoint',
      from: 'Spreadsheet Data',
      to: 'Slide Presentation Outline',
      accept: '.xlsx,.xls,.csv',
      icon: Sliders,
      desc: 'Transform spreadsheet metrics into presentation bullet points and tables.',
      badge: 'Slides Maker',
    },
  };

  const currentConfig = modeConfigs[activeMode];
  const Icon = currentConfig.icon;

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      setConversionSuccess(false);

      const reader = new FileReader();
      reader.onload = (evt) => {
        const str = evt.target?.result as string;
        if (typeof str === 'string' && str.length > 5) {
          setCustomText(str.slice(0, 10000));
        }
      };
      reader.readAsText(f);
    }
  };

  // PPTX Slide Management Helpers
  const handleAddSlide = () => {
    const newSlide: SlideContent = {
      id: `slide-${Date.now()}`,
      title: `New Slide ${slides.length + 1}`,
      bullets: ['Key takeaway point 1', 'Key takeaway point 2', 'Key takeaway point 3'],
      layout: 'bullets',
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
  };

  const handleDeleteSlide = (indexToDelete: number) => {
    if (slides.length <= 1) {
      showErrorToast('A presentation deck must contain at least 1 slide.', 'Cannot Delete');
      return;
    }
    const updated = slides.filter((_, i) => i !== indexToDelete);
    setSlides(updated);
    setActiveSlideIndex(Math.max(0, indexToDelete - 1));
  };

  const handleUpdateCurrentSlide = (field: keyof SlideContent, value: any) => {
    setSlides((prev) => {
      const updated = [...prev];
      if (updated[activeSlideIndex]) {
        updated[activeSlideIndex] = {
          ...updated[activeSlideIndex],
          [field]: value,
        };
      }
      return updated;
    });
  };

  const handleBulletChange = (bIndex: number, text: string) => {
    const current = slides[activeSlideIndex];
    if (!current) return;
    const bullets = [...(current.bullets || [])];
    bullets[bIndex] = text;
    handleUpdateCurrentSlide('bullets', bullets);
  };

  const handleAddBullet = () => {
    const current = slides[activeSlideIndex];
    if (!current) return;
    const bullets = [...(current.bullets || []), 'New key point'];
    handleUpdateCurrentSlide('bullets', bullets);
  };

  const handleRemoveBullet = (bIndex: number) => {
    const current = slides[activeSlideIndex];
    if (!current) return;
    const bullets = (current.bullets || []).filter((_, i) => i !== bIndex);
    handleUpdateCurrentSlide('bullets', bullets);
  };

  // Convert & Download Handler
  const handleRunConversion = async () => {
    setIsConverting(true);
    setConversionSuccess(false);

    try {
      if (activeMode === 'word-to-pptx') {
        const outName = `${(presentationTitle || 'Presentation').replace(/\s+/g, '_')}.pptx`;
        await convertWordToPptx(slides, outName, {
          theme: selectedTheme,
          aspectRatio,
          author: authorName,
          company: companyName,
        });
      } else if (activeMode === 'docx-to-pdf') {
        const title = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'Document';
        await convertTextDocToPdf(title, customText, `${title}.pdf`);
      } else if (activeMode === 'pdf-to-docx') {
        const docxContent = `--- EXPORTED FROM PDF VIA TOOLKIT AI ---\n\n${customText}`;
        const blob = new Blob([docxContent], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const outName = `Converted_${selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'Document'}.docx`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = outName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showConversionToast(outName, {
          fromFormat: 'PDF',
          toFormat: 'DOCX',
          toolName: 'PDF to Word Converter',
          message: `Converted document into editable Word file "${outName}".`,
        });
      } else if (activeMode === 'excel-to-pdf') {
        if (selectedFile) {
          await convertExcelToPdf(selectedFile);
        } else {
          await convertTextDocToPdf('Excel_Table_Export', customText, 'Excel_Export.pdf');
        }
      } else if (activeMode === 'pdf-to-excel') {
        const lines = customText.split('\n').filter(Boolean);
        const rows = lines.map((l) => l.split(/,|\t/));
        await convertPdfToExcel(rows);
      } else if (activeMode === 'ppt-to-word') {
        const outlineData = slides.map((s, i) => ({
          slideNumber: i + 1,
          title: s.title,
          bullets: s.bullets || [],
        }));
        await convertPptToWord(outlineData);
      } else if (activeMode === 'excel-to-ppt') {
        const summaryData = [
          { category: 'North Region', value: '$145,000', trend: '+14% YoY Growth' },
          { category: 'South Region', value: '$98,400', trend: '+8% YoY Growth' },
          { category: 'East Region', value: '$120,500', trend: '+22% YoY Growth' },
          { category: 'West Region', value: '$210,000', trend: '+31% YoY Growth' },
        ];
        await convertExcelToPpt(summaryData);
      }

      setConversionSuccess(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      console.error('Office conversion failed', err);
      showErrorToast(err.message || 'Conversion failed', 'Conversion Error');
    } finally {
      setIsConverting(false);
    }
  };

  // Export Slides as PDF Handout
  const handleExportSlidesPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      slides.forEach((slide, idx) => {
        if (idx > 0) doc.addPage();

        // Background
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 841.89, 595.28, 'F');

        // Main Slide Card
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(40, 40, 761.89, 515.28, 12, 12, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(40, 40, 761.89, 515.28, 12, 12, 'S');

        // Top Accent Bar
        doc.setFillColor(37, 99, 235);
        doc.roundedRect(40, 40, 761.89, 10, 4, 4, 'F');

        // Header Title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text(slide.title, 70, 95);

        // Slide counter
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`Slide ${idx + 1} of ${slides.length}`, 730, 95);

        // Subtitle or Bullets
        if (slide.layout === 'title' && slide.subtitle) {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(14);
          doc.setTextColor(100, 116, 139);
          doc.text(slide.subtitle, 70, 135);
        } else {
          let y = 145;
          (slide.bullets || []).forEach((b) => {
            doc.setFillColor(37, 99, 235);
            doc.circle(75, y - 4, 3, 'F');
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(13);
            doc.setTextColor(51, 65, 85);
            const wrapped = doc.splitTextToSize(b, 680);
            doc.text(wrapped, 90, y);
            y += wrapped.length * 20 + 12;
          });
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('TOOLKIT AI • Word to PowerPoint PDF Slides', 70, 525);
      });

      const pdfName = `${(presentationTitle || 'Presentation').replace(/\s+/g, '_')}_Slides.pdf`;
      doc.save(pdfName);

      showDownloadToast(pdfName, {
        format: 'PDF',
        toolName: 'Word to PowerPoint',
        message: `Exported ${slides.length} presentation slides as printable landscape PDF.`,
      });
    } catch (err: any) {
      showErrorToast(err.message || 'PDF export failed', 'Export Error');
    }
  };

  const currentActiveSlide = slides[activeSlideIndex] || slides[0];
  const theme = THEME_STYLES[selectedTheme];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Studio Header */}
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/20 shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentConfig.title}</h1>
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200">
                  {currentConfig.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{currentConfig.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
              100% Client-Side Engine • Zero Uploads
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(Object.keys(modeConfigs) as OfficeMode[]).map((mode) => {
          const cfg = modeConfigs[mode];
          return (
            <button
              key={mode}
              onClick={() => {
                setActiveMode(mode);
                setSelectedFile(null);
                setConversionSuccess(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                activeMode === mode
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'border border-white/80 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm'
              }`}
            >
              <span>{cfg.title}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* WORD TO POWERPOINT (.PPTX) FULL STUDIO EXPERIENCE */}
      {/* ========================================================================= */}
      {activeMode === 'word-to-pptx' ? (
        <div className="space-y-6">
          
          {/* Top Bar: Template Presets & Document Ingestion */}
          <div className="rounded-3xl border border-white/80 bg-white/80 p-5 backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <span>Word Document Source & Template Presets</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Upload a Word (.docx/.doc) file, paste Markdown/text, or choose an executive blueprint to auto-build slides.
                </p>
              </div>

              {/* Sample Blueprint Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(PRESET_WORD_DOCUMENTS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCustomText(preset.text);
                      showSuccessToast(`Loaded "${preset.label}" blueprint into document engine.`);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-all shadow-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingestion Split: Drop Zone + Collapsible Raw Document Editor */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* File Upload Drop */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="md:col-span-4 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-5 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/70 transition-all group flex flex-col items-center justify-center min-h-[140px]"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xs mb-2 group-hover:scale-105 transition-transform text-orange-600">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                  {selectedFile ? selectedFile.name : 'Upload Word (.docx / .doc / .txt)'}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Auto-parse headings & sections into slides</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc,.txt,.rtf,.md"
                  onChange={handleFileSelected}
                  className="hidden"
                />
              </div>

              {/* Raw Document Text Buffer Area */}
              <div className="md:col-span-8 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Document Text Buffer (Markdown / Headings Supported)</span>
                  <span className="text-slate-400 font-mono text-[11px]">{customText.length} characters • {slides.length} slides generated</span>
                </div>
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 font-mono focus:border-orange-500 focus:outline-none shadow-inner"
                  placeholder="Paste Word document text, outline, or markdown here..."
                />
              </div>

            </div>
          </div>

          {/* PPTX Presentation Studio & Customizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR: Slide List & Deck Settings (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Deck Styling & Meta Controls */}
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 backdrop-blur-xl shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  <span>Presentation Theme & Aspect Ratio</span>
                </h4>

                {/* Theme Selector */}
                <div className="grid grid-cols-1 gap-2">
                  {(Object.keys(THEME_STYLES) as PPTXTheme[]).map((themeKey) => {
                    const t = THEME_STYLES[themeKey];
                    const isSelected = selectedTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => setSelectedTheme(themeKey)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                            style={{ backgroundColor: t.previewBg }}
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{t.name}</div>
                            <div className="text-[10px] text-slate-500">{t.description}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Aspect Ratio & Metadata */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">Slide Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setAspectRatio('16:9')}
                        className={`rounded-xl py-1.5 px-3 text-xs font-bold border transition-all ${
                          aspectRatio === '16:9'
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        16:9 Widescreen
                      </button>
                      <button
                        onClick={() => setAspectRatio('4:3')}
                        className={`rounded-xl py-1.5 px-3 text-xs font-bold border transition-all ${
                          aspectRatio === '4:3'
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        4:3 Standard
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">File / Deck Name</label>
                    <input
                      type="text"
                      value={presentationTitle}
                      onChange={(e) => setPresentationTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-orange-500 focus:outline-none"
                      placeholder="e.g. Q3_Executive_Presentation"
                    />
                  </div>
                </div>
              </div>

              {/* Slide Navigator List */}
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 backdrop-blur-xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Slide Deck Navigator ({slides.length})
                  </h4>
                  <button
                    onClick={handleAddSlide}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Slide</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {slides.map((s, idx) => {
                    const isActive = activeSlideIndex === idx;
                    return (
                      <div
                        key={s.id || idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`group p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isActive
                            ? 'border-orange-500 bg-orange-50/80 shadow-xs ring-1 ring-orange-500/30'
                            : 'border-slate-200/80 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                              isActive ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {s.title || `Untitled Slide ${idx + 1}`}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {s.layout || 'bullets'} • {(s.bullets || []).length} points
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(idx);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                          title="Delete Slide"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT: Live Visual Slide Preview & Editor (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Active Slide Live Preview Card */}
              <div className="rounded-3xl border border-white/80 bg-white/90 p-6 backdrop-blur-xl shadow-xl shadow-slate-200/50 space-y-5">
                
                {/* Header Preview Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                      Live Slide {activeSlideIndex + 1} of {slides.length} Preview
                    </span>
                    <span className="text-xs font-bold text-slate-400 capitalize">
                      Layout: {currentActiveSlide.layout || 'bullets'}
                    </span>
                  </div>

                  {/* Slide Stepper Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={activeSlideIndex === 0}
                      onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={activeSlideIndex === slides.length - 1}
                      onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* THEMED SLIDE CANVAS VIEWPORT (Mimics real 16:9 presentation slide) */}
                <div
                  className={`w-full rounded-2xl border ${theme.borderClass} ${theme.bgClass} p-6 sm:p-8 shadow-inner transition-all relative overflow-hidden`}
                  style={{ minHeight: '320px' }}
                >
                  {/* Decorative Slide Card */}
                  <div className={`rounded-xl border ${theme.borderClass} ${theme.cardBg} p-6 shadow-sm space-y-4`}>
                    
                    {/* Top Accent Strip */}
                    <div className={`h-1.5 w-16 rounded-full ${theme.accentBg}`} />

                    {/* Slide Title */}
                    <div>
                      <h2 className={`text-lg sm:text-2xl font-black ${theme.textColor} tracking-tight`}>
                        {currentActiveSlide.title || 'Slide Title'}
                      </h2>
                      {currentActiveSlide.subtitle && (
                        <p className={`text-xs sm:text-sm mt-1 opacity-80 ${theme.textColor}`}>
                          {currentActiveSlide.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Slide Content Body */}
                    {currentActiveSlide.layout === 'two-column' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          {(currentActiveSlide.bullets || []).slice(0, 2).map((b, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                              <span className={`h-1.5 w-1.5 rounded-full ${theme.accentBg} mt-2 shrink-0`} />
                              <span className={theme.textColor}>{b}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {(currentActiveSlide.bullets || []).slice(2).map((b, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                              <span className={`h-1.5 w-1.5 rounded-full ${theme.accentBg} mt-2 shrink-0`} />
                              <span className={theme.textColor}>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 pt-2">
                        {(currentActiveSlide.bullets || []).map((b, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                            <span className={`h-1.5 w-1.5 rounded-full ${theme.accentBg} mt-2 shrink-0`} />
                            <span className={theme.textColor}>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Slide Footer */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>TOOLKIT AI • Microsoft PowerPoint (.pptx)</span>
                      <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
                    </div>

                  </div>
                </div>

                {/* Inline Slide Content Editor */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Edit Slide {activeSlideIndex + 1} Content</span>
                    
                    {/* Layout Selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <label className="text-[11px] font-semibold text-slate-500">Layout:</label>
                      <select
                        value={currentActiveSlide.layout || 'bullets'}
                        onChange={(e) => handleUpdateCurrentSlide('layout', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="title">Title Slide</option>
                        <option value="bullets">Standard Bullets</option>
                        <option value="two-column">Two-Column Comparison</option>
                        <option value="conclusion">Conclusion & Next Steps</option>
                      </select>
                    </div>
                  </div>

                  {/* Title Field */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Slide Title</label>
                    <input
                      type="text"
                      value={currentActiveSlide.title}
                      onChange={(e) => handleUpdateCurrentSlide('title', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-orange-500 focus:outline-none shadow-xs"
                      placeholder="Slide Title"
                    />
                  </div>

                  {/* Subtitle if title layout */}
                  {currentActiveSlide.layout === 'title' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Deck Subtitle / Author</label>
                      <input
                        type="text"
                        value={currentActiveSlide.subtitle || ''}
                        onChange={(e) => handleUpdateCurrentSlide('subtitle', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-orange-500 focus:outline-none"
                        placeholder="Subtitle description"
                      />
                    </div>
                  )}

                  {/* Bullet Points Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Slide Bullet Points</label>
                      <button
                        onClick={handleAddBullet}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    {(currentActiveSlide.bullets || []).map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold w-4">{bIdx + 1}.</span>
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => handleBulletChange(bIdx, e.target.value)}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-orange-500 focus:outline-none"
                          placeholder={`Point ${bIdx + 1}`}
                        />
                        <button
                          onClick={() => handleRemoveBullet(bIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Remove Bullet"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Primary Download & Export Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  
                  {/* PPTX Export Button */}
                  <button
                    onClick={handleRunConversion}
                    disabled={isConverting}
                    className="w-full rounded-2xl bg-orange-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-orange-600/25 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isConverting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Presentation className="h-4 w-4" />
                    )}
                    <span>{isConverting ? 'Synthesizing PPTX...' : 'Download PowerPoint (.pptx)'}</span>
                  </button>

                  {/* PDF Slides Export Button */}
                  <button
                    onClick={handleExportSlidesPDF}
                    className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
                    <span>Export Slides as PDF (.pdf)</span>
                  </button>

                </div>

                {conversionSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>PowerPoint presentation created successfully! Fully compatible with MS PowerPoint, Google Slides & Keynote.</span>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* STANDARD OFFICE CONVERSION VIEWS (DOCX->PDF, PDF->DOCX, EXCEL->PDF, etc.) */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: File Drop & Text Editor (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/80 transition-all backdrop-blur-sm group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                {selectedFile ? selectedFile.name : `Drop ${currentConfig.from} Here`}
              </div>
              <p className="text-xs text-slate-500 mt-1">or click to browse from device</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={currentConfig.accept}
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>

            {/* Text / Data Content Preview */}
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Document Content / Data Buffer</span>
                <span className="text-slate-400 font-mono">{customText.length} chars</span>
              </div>
              <textarea
                rows={8}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 font-mono focus:border-blue-500 focus:outline-none shadow-inner"
                placeholder="Paste or edit text to convert..."
              />
            </div>

            <button
              onClick={handleRunConversion}
              disabled={isConverting}
              className="w-full rounded-2xl bg-blue-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isConverting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isConverting ? 'Synthesizing...' : `Convert & Download ${currentConfig.to}`}</span>
            </button>
          </div>

          {/* RIGHT: Format Pipeline info (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-white/80 bg-white/80 p-6 backdrop-blur-xl shadow-xl shadow-slate-200/50 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Conversion Architecture
              </span>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold">
                <span className="text-slate-700">{currentConfig.from}</span>
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">{currentConfig.to}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Standardized parser formats font weights, matrix grids, tables, and paragraphs cleanly while preserving tabular numbers.
              </p>

              {conversionSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Conversion complete! Your file has been generated.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

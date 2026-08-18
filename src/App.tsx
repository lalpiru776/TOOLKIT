import React, { useState, useMemo } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ThreeBackground } from './components/ThreeBackground';
import { Header } from './components/Header';
import { PricingModal } from './components/PricingModal';
import { SmartWorkspace } from './components/SmartWorkspace';
import { PassportPhotoStudio } from './components/tools/PassportPhotoStudio';
import { ExcelDashboardStudio } from './components/tools/ExcelDashboardStudio';
import { DataVisualizerStudio } from './components/tools/DataVisualizerStudio';
import { ResumeMakerStudio } from './components/tools/ResumeMakerStudio';
import { OfficeConverterStudio, OfficeMode } from './components/tools/OfficeConverterStudio';
import { AIToolStudio, AIMode } from './components/tools/AIToolStudio';
import { PDFToolRunner, PDFToolMode } from './components/tools/PDFToolRunner';
import { TOOLS_LIST, CATEGORIES, ToolItem } from './data/toolsList';
import {
  Sparkles,
  ArrowLeft,
  Search,
  Zap,
  Shield,
  Layers,
  Crown,
  Camera,
  FileSpreadsheet,
  BarChart3,
  Network,
  Lock,
  ChevronRight,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  Stamp,
  PenTool,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  Presentation,
  Table,
  Sliders,
  MessageSquare,
  HelpCircle,
  Award,
  Languages,
  FileSearch,
  Mic,
  Film,
  Unlock,
} from 'lucide-react';

const renderToolIcon = (iconName: string) => {
  switch (iconName) {
    case 'Layers': return <Layers className="h-5 w-5 text-blue-600" />;
    case 'Scissors': return <Scissors className="h-5 w-5 text-blue-600" />;
    case 'Minimize2': return <Minimize2 className="h-5 w-5 text-blue-600" />;
    case 'RotateCw': return <RotateCw className="h-5 w-5 text-blue-600" />;
    case 'Trash2': return <Trash2 className="h-5 w-5 text-red-500" />;
    case 'Stamp': return <Stamp className="h-5 w-5 text-amber-500" />;
    case 'PenTool': return <PenTool className="h-5 w-5 text-blue-600" />;
    case 'Lock': return <Lock className="h-5 w-5 text-emerald-600" />;
    case 'Unlock': return <Unlock className="h-5 w-5 text-emerald-600" />;
    case 'ShieldCheck': return <ShieldCheck className="h-5 w-5 text-emerald-600" />;
    case 'Image': case 'ImageIcon': case 'FileImage': return <ImageIcon className="h-5 w-5 text-indigo-600" />;
    case 'Camera': return <Camera className="h-5 w-5 text-orange-500" />;
    case 'FileText': return <FileText className="h-5 w-5 text-blue-600" />;
    case 'FileSpreadsheet': case 'LayoutDashboard': return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
    case 'Presentation': return <Presentation className="h-5 w-5 text-orange-600" />;
    case 'Table': return <Table className="h-5 w-5 text-emerald-600" />;
    case 'Sliders': return <Sliders className="h-5 w-5 text-indigo-600" />;
    case 'BarChart3': case 'BarChart2': return <BarChart3 className="h-5 w-5 text-blue-600" />;
    case 'Network': return <Network className="h-5 w-5 text-pink-600" />;
    case 'MessageSquare': return <MessageSquare className="h-5 w-5 text-blue-600" />;
    case 'Sparkles': return <Sparkles className="h-5 w-5 text-purple-600" />;
    case 'Award': case 'CheckCircle2': return <Award className="h-5 w-5 text-emerald-600" />;
    case 'HelpCircle': return <HelpCircle className="h-5 w-5 text-amber-600" />;
    case 'Languages': return <Languages className="h-5 w-5 text-blue-600" />;
    case 'FileSearch': return <FileSearch className="h-5 w-5 text-blue-600" />;
    case 'Mic': return <Mic className="h-5 w-5 text-purple-600" />;
    case 'Film': return <Film className="h-5 w-5 text-blue-600" />;
    default: return <Zap className="h-5 w-5 text-blue-600" />;
  }
};

function AppContent() {
  const { theme, isProUser, setPricingModalOpen } = useTheme();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Navigation & Search State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<'catalog' | 'smart-workspace' | 'tool'>('catalog');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  // Sub-modes for nested tool studios
  const [officeMode, setOfficeMode] = useState<OfficeMode>('docx-to-pdf');
  const [aiMode, setAiMode] = useState<AIMode>('chat');
  const [pdfMode, setPdfMode] = useState<PDFToolMode>('merge');

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    return TOOLS_LIST.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Open a specific tool by ID
  const handleOpenTool = (toolId: string) => {
    setActiveToolId(toolId);
    setActiveView('tool');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Map specific tool IDs to studio configurations
    if (
      toolId === 'word-to-pptx' ||
      toolId === 'word-to-powerpoint' ||
      toolId === 'docx-to-pptx' ||
      toolId === 'docx-to-ppt' ||
      toolId === 'word-to-slides'
    )
      setOfficeMode('word-to-pptx');
    else if (toolId === 'docx-to-pdf' || toolId === 'word-to-pdf') setOfficeMode('docx-to-pdf');
    else if (toolId === 'pdf-to-docx' || toolId === 'pdf-to-word') setOfficeMode('pdf-to-docx');
    else if (toolId === 'excel-to-pdf') setOfficeMode('excel-to-pdf');
    else if (toolId === 'pdf-to-excel') setOfficeMode('pdf-to-excel');
    else if (toolId === 'ppt-to-word' || toolId === 'ppt-to-pdf' || toolId === 'pdf-to-ppt') setOfficeMode('ppt-to-word');
    else if (toolId === 'excel-to-ppt') setOfficeMode('excel-to-ppt');
    else if (toolId === 'ai-search-grounding' || toolId === 'ai-search-research' || toolId === 'google-search-data') setAiMode('search');
    else if (toolId === 'ai-pdf-chat') setAiMode('chat');
    else if (toolId === 'ai-pdf-summarizer' || toolId === 'ai-summarize') setAiMode('summarize');
    else if (toolId === 'ai-quiz-maker' || toolId === 'ai-quiz-generator') setAiMode('quiz');
    else if (toolId === 'ai-resume-ats' || toolId === 'ai-resume-analyzer') setAiMode('resume');
    else if (toolId === 'ai-doc-translate' || toolId === 'ai-translator') setAiMode('translate');
    else if (toolId === 'ai-transcribe' || toolId === 'audio-transcribe') setAiMode('transcribe');
    else if (toolId === 'ai-video' || toolId === 'video-generator') setAiMode('video');
    else if (toolId === 'pdf-merge' || toolId === 'merge-pdf') setPdfMode('merge');
    else if (toolId === 'pdf-split' || toolId === 'split-pdf') setPdfMode('split');
    else if (toolId === 'pdf-compress' || toolId === 'compress-pdf') setPdfMode('compress');
    else if (toolId === 'pdf-rotate' || toolId === 'rotate-pdf') setPdfMode('rotate');
    else if (toolId === 'pdf-delete-pages') setPdfMode('delete-pages');
    else if (toolId === 'pdf-watermark' || toolId === 'watermark-pdf') setPdfMode('watermark');
    else if (toolId === 'pdf-sign' || toolId === 'sign-pdf') setPdfMode('sign');
    else if (toolId === 'pdf-protect' || toolId === 'protect-pdf') setPdfMode('protect');
    else if (toolId === 'pdf-metadata-remover') setPdfMode('metadata-remove');
    else if (toolId === 'jpg-to-pdf' || toolId === 'image-to-pdf') setPdfMode('images-to-pdf');
  };

  const handleNavigateHome = () => {
    setActiveView('catalog');
    setActiveToolId(null);
  };

  // Find active tool metadata for the top breadcrumb
  const currentToolItem = useMemo(() => {
    return TOOLS_LIST.find((t) => t.id === activeToolId);
  }, [activeToolId]);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
      
      {/* Ambient Diffused Frosted Gradient Orbs */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20 z-0" />
      <div className="pointer-events-none fixed -bottom-20 -left-20 w-80 h-80 bg-red-500 rounded-full blur-[80px] opacity-10 z-0" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[140px] opacity-40 z-0" />

      {/* 3D Dynamic WebGL Particle Background */}
      <ThreeBackground />

      {/* Navigation Top Bar */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenSmartWorkspace={() => setActiveView('smart-workspace')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
        
        {/* VIEW 1: TOOL STUDIO VIEW */}
        {activeView === 'tool' && (
          <div className="space-y-6">
            
            {/* Back to Catalog Breadcrumb */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleNavigateHome}
                className="inline-flex items-center gap-2 rounded-xl bg-white/70 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white hover:text-blue-600 border border-white/80 shadow-sm transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to All 50+ Tools</span>
              </button>

              {currentToolItem && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/70 shadow-sm">
                  <span className="capitalize">{currentToolItem.category}</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-900 font-bold">{currentToolItem.name}</span>
                </div>
              )}
            </div>

            {/* Dynamic Tool Renderer */}
            {(activeToolId === 'passport-photo' ||
              activeToolId === 'passport-photo-maker' ||
              activeToolId === 'image-resize') && (
              <PassportPhotoStudio />
            )}

            {(activeToolId === 'excel-dashboard' ||
              activeToolId === 'excel-dashboard-maker' ||
              activeToolId === 'excel-bi') && (
              <ExcelDashboardStudio />
            )}

            {(activeToolId === 'data-visualizer' || activeToolId === 'data-charts') && (
              <DataVisualizerStudio />
            )}

            {(activeToolId === 'ats-resume-maker' ||
              activeToolId === 'resume-maker' ||
              activeToolId === 'resume-builder') && (
              <ResumeMakerStudio />
            )}

            {(activeToolId?.startsWith('office-') ||
              activeToolId?.includes('docx') ||
              activeToolId?.includes('word-to-pptx') ||
              activeToolId?.includes('word-to-powerpoint') ||
              activeToolId?.includes('word-to-slides') ||
              activeToolId?.includes('excel-to-pdf') ||
              activeToolId?.includes('pdf-to-excel') ||
              activeToolId?.includes('word-to-pdf') ||
              activeToolId?.includes('pdf-to-word') ||
              activeToolId?.includes('ppt')) && (
              <OfficeConverterStudio initialMode={officeMode} />
            )}

            {(activeToolId?.startsWith('ai-') ||
              activeToolId === 'audio-transcribe' ||
              activeToolId === 'video-generator') && (
              <AIToolStudio initialMode={aiMode} />
            )}

            {(activeToolId?.startsWith('pdf-') ||
              activeToolId?.endsWith('-pdf') ||
              activeToolId === 'jpg-to-pdf' ||
              activeToolId === 'image-to-pdf') &&
              !activeToolId?.startsWith('office-') &&
              !activeToolId?.startsWith('ai-') &&
              activeToolId !== 'excel-to-pdf' &&
              activeToolId !== 'word-to-pdf' &&
              activeToolId !== 'ppt-to-pdf' && (
              <PDFToolRunner initialMode={pdfMode} />
            )}
          </div>
        )}

        {/* VIEW 2: SMART UNIFIED WORKSPACE VIEW */}
        {activeView === 'smart-workspace' && (
          <div className="space-y-6">
            <button
              onClick={handleNavigateHome}
              className="inline-flex items-center gap-2 rounded-xl bg-white/70 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white hover:text-blue-600 border border-white/80 shadow-sm transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tool Catalog</span>
            </button>
            <SmartWorkspace onOpenTool={handleOpenTool} />
          </div>
        )}

        {/* VIEW 3: CATALOG & MAIN DASHBOARD VIEW */}
        {activeView === 'catalog' && (
          <div className="space-y-8">
            
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
              {isAuthenticated && user ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-md">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Welcome back, {user.name} ({user.plan.toUpperCase()} Client Workspace Active)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>50+ Privacy-First File Tools • 100% Client-Side + Gemini 3.7 AI</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                All Your File Tools{' '}
                <span className="text-blue-600">
                  in One Place
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Merge PDFs, convert Office docs, resize passport photos to exact KB limits, generate live Excel BI dashboards & synthesize documents with AI.
              </p>

              {/* Fast Action CTA */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveView('smart-workspace')}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Smart Workspace</span>
                </button>

                <button
                  onClick={() => handleOpenTool('passport-photo')}
                  className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-white hover:text-blue-600 transition-all backdrop-blur-md shadow-sm"
                >
                  <Camera className="h-4 w-4 text-blue-600" />
                  <span>Passport Resizer (&lt;50KB)</span>
                </button>

                <button
                  onClick={() => handleOpenTool('excel-dashboard')}
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-5 py-3 text-xs sm:text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-all backdrop-blur-md shadow-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Excel Dashboard Maker</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none justify-start sm:justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'border border-white/80 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 shadow-sm backdrop-blur-sm'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Tools Grid Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {searchQuery ? `Search Results for "${searchQuery}"` : `${activeCategory.toUpperCase()} TOOLS`} ({filteredTools.length})
                </span>
                <span className="text-xs text-slate-500 font-medium">Zero Server Storage Shield</span>
              </div>

              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTools.map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => handleOpenTool(tool.id)}
                      className="group relative rounded-2xl border border-white/80 bg-white/60 p-5 backdrop-blur-md hover:border-blue-300 hover:bg-white/80 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md"
                    >
                      {tool.popular && (
                        <span className="absolute top-4 right-4 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                          {tool.badge || 'Popular'}
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-xl group-hover:scale-105 group-hover:bg-blue-100/80 transition-all">
                          {renderToolIcon(tool.icon)}
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400 capitalize">
                          {tool.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                          <span>Open</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/40 p-12 text-center space-y-3 backdrop-blur-md">
                  <p className="text-sm text-slate-500">No tools matched your search query "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Pricing / Pro Upgrade Modal */}
      <PricingModal />

      {/* Client Sign In & Sign Up Modal */}
      <AuthModal />

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-white/60 backdrop-blur-md py-8 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>
              <strong>Zero-Storage Guarantee:</strong> All file conversions and PDF edits execute on-device in your browser.
            </span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <button
              onClick={() => setPricingModalOpen(true)}
              className="text-red-500 hover:text-red-600 font-bold"
            >
              Go Pro
            </button>
            <span>•</span>
            <button onClick={() => setActiveView('smart-workspace')} className="hover:text-blue-600">
              Smart Workspace
            </button>
            <span>•</span>
            <span className="text-slate-400">TOOLKIT AI © 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

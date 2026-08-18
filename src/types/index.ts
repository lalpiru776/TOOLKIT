export type ToolCategory =
  | 'all'
  | 'pdf'
  | 'image'
  | 'document'
  | 'data'
  | 'ai'
  | 'privacy'
  | 'workflows';

export type AppTheme = 'cyber-blue' | 'studio-white' | 'crimson-red' | 'midnight-dark';

export interface ToolItem {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string;
  badge?: string;
  popular?: boolean;
  priority?: number;
  inputFormats: string[];
  outputFormats?: string[];
  tags: string[];
}

export interface UploadedFileState {
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  textContext?: string;
  pageCount?: number;
  dimensions?: { width: number; height: number };
  createdAt: Date;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar' | 'scatter';
  title: string;
  labelColumn: string;
  valueColumns: string[];
  colorScheme: 'blue' | 'emerald' | 'crimson' | 'purple' | 'amber' | 'rainbow';
  showLegend: boolean;
  showGrid: boolean;
}

export interface PassportPhotoSettings {
  countryPreset: 'india' | 'us' | 'uk' | 'schengen' | 'canada' | 'custom';
  widthPx: number;
  heightPx: number;
  targetMaxKB: number; // 0 means no limit
  targetMaxMB?: number;
  exactUnit: 'px' | 'mm' | 'cm' | 'inch';
  bgColor: string; // 'white' | '#0066cc' | '#f0f0f0' | 'red' | 'transparent' | custom
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  gridSheetType: 'single' | '4x6' | 'a4';
  copies: number;
}

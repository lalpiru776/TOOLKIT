import * as XLSX from 'xlsx';

export interface ParsedDataset {
  headers: string[];
  rows: any[][];
  numericColumns: string[];
  categoricalColumns: string[];
  totalRows: number;
  summaryStats: Record<string, { sum: number; avg: number; min: number; max: number; count: number }>;
  categoryDistributions: Record<string, { label: string; count: number; percentage: number }[]>;
}

export function parseSpreadsheetBuffer(buffer: ArrayBuffer): ParsedDataset {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rawRows.length === 0) {
    return createEmptyDataset();
  }

  const headers = (rawRows[0] || []).map((h, i) => String(h || `Column_${i + 1}`).trim());
  const dataRows = rawRows.slice(1).filter((r) => r.length > 0 && r.some((c) => c !== undefined && c !== null && String(c).trim() !== ''));

  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];
  const summaryStats: Record<string, { sum: number; avg: number; min: number; max: number; count: number }> = {};
  const categoryDistributions: Record<string, { label: string; count: number; percentage: number }[]> = {};

  headers.forEach((header, colIdx) => {
    const values = dataRows.map((r) => r[colIdx]).filter((v) => v !== undefined && v !== null && v !== '');
    
    // Check if mostly numeric
    const numericValues = values
      .map((v) => {
        if (typeof v === 'number') return v;
        const cleaned = String(v).replace(/[^0-9.-]/g, '');
        return cleaned ? parseFloat(cleaned) : NaN;
      })
      .filter((v) => !isNaN(v));

    if (numericValues.length > values.length * 0.5 && numericValues.length > 0) {
      numericColumns.push(header);
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const avg = sum / numericValues.length;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      summaryStats[header] = { sum, avg, min, max, count: numericValues.length };
    } else {
      categoricalColumns.push(header);
      const countMap: Record<string, number> = {};
      values.forEach((v) => {
        const str = String(v).trim();
        countMap[str] = (countMap[str] || 0) + 1;
      });

      const dist = Object.entries(countMap)
        .map(([label, count]) => ({
          label,
          count,
          percentage: (count / (values.length || 1)) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      categoryDistributions[header] = dist;
    }
  });

  return {
    headers,
    rows: dataRows,
    numericColumns,
    categoricalColumns,
    totalRows: dataRows.length,
    summaryStats,
    categoryDistributions,
  };
}

export function parseCSVText(csvText: string): ParsedDataset {
  const workbook = XLSX.read(csvText, { type: 'string' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rawRows.length === 0) return createEmptyDataset();

  const headers = (rawRows[0] || []).map((h, i) => String(h || `Column_${i + 1}`).trim());
  const dataRows = rawRows.slice(1).filter((r) => r.length > 0);

  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];
  const summaryStats: Record<string, any> = {};
  const categoryDistributions: Record<string, any> = {};

  headers.forEach((header, colIdx) => {
    const values = dataRows.map((r) => r[colIdx]).filter((v) => v !== undefined && v !== null && v !== '');
    const numericValues = values
      .map((v) => {
        if (typeof v === 'number') return v;
        const cleaned = String(v).replace(/[^0-9.-]/g, '');
        return cleaned ? parseFloat(cleaned) : NaN;
      })
      .filter((v) => !isNaN(v));

    if (numericValues.length > values.length * 0.5 && numericValues.length > 0) {
      numericColumns.push(header);
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const avg = sum / (numericValues.length || 1);
      summaryStats[header] = { sum, avg, min: Math.min(...numericValues), max: Math.max(...numericValues), count: numericValues.length };
    } else {
      categoricalColumns.push(header);
      const countMap: Record<string, number> = {};
      values.forEach((v) => {
        const str = String(v).trim();
        countMap[str] = (countMap[str] || 0) + 1;
      });
      categoryDistributions[header] = Object.entries(countMap)
        .map(([label, count]) => ({
          label,
          count,
          percentage: (count / (values.length || 1)) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    }
  });

  return {
    headers,
    rows: dataRows,
    numericColumns,
    categoricalColumns,
    totalRows: dataRows.length,
    summaryStats,
    categoryDistributions,
  };
}

export function createEmptyDataset(): ParsedDataset {
  return {
    headers: [],
    rows: [],
    numericColumns: [],
    categoricalColumns: [],
    totalRows: 0,
    summaryStats: {},
    categoryDistributions: {},
  };
}

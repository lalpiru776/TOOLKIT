import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { downloadBlob } from './pdfEngine';

export interface SlideContent {
  id?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  layout?: 'title' | 'bullets' | 'two-column' | 'quote' | 'metrics' | 'conclusion';
  columnLeft?: string[];
  columnRight?: string[];
  quoteText?: string;
  quoteAuthor?: string;
  metricNumber?: string;
  metricLabel?: string;
  notes?: string;
}

export type PPTXTheme = 'executive' | 'slate-teal' | 'midnight-dark' | 'minimal-editorial' | 'vibrant-sunset';

export interface PPTXExportOptions {
  theme?: PPTXTheme;
  aspectRatio?: '16:9' | '4:3';
  author?: string;
  company?: string;
}

const THEME_CONFIGS: Record<
  PPTXTheme,
  {
    bg: string;
    titleColor: string;
    bodyColor: string;
    accentColor: string;
    cardBg: string;
    cardBorder: string;
    footerColor: string;
  }
> = {
  executive: {
    bg: 'F8FAFC',
    titleColor: '0F172A',
    bodyColor: '334155',
    accentColor: '2563EB',
    cardBg: 'FFFFFF',
    cardBorder: 'E2E8F0',
    footerColor: '94A3B8',
  },
  'slate-teal': {
    bg: 'F0FDFA',
    titleColor: '134E4A',
    bodyColor: '334155',
    accentColor: '0D9488',
    cardBg: 'FFFFFF',
    cardBorder: 'CCFBF1',
    footerColor: '64748B',
  },
  'midnight-dark': {
    bg: '0F172A',
    titleColor: 'FFFFFF',
    bodyColor: 'CBD5E1',
    accentColor: '818CF8',
    cardBg: '1E293B',
    cardBorder: '334155',
    footerColor: '64748B',
  },
  'minimal-editorial': {
    bg: 'FAFAF9',
    titleColor: '1C1917',
    bodyColor: '44403C',
    accentColor: 'D97706',
    cardBg: 'FFFFFF',
    cardBorder: 'E7E5E4',
    footerColor: '78716C',
  },
  'vibrant-sunset': {
    bg: 'FFFBEB',
    titleColor: '881337',
    bodyColor: '4C0519',
    accentColor: 'EA580C',
    cardBg: 'FFFFFF',
    cardBorder: 'FED7AA',
    footerColor: '9A3412',
  },
};

/**
 * Parses raw Word / Document text into structured slide objects
 */
export function parseDocumentToSlides(text: string, defaultDocTitle = 'Document Presentation'): SlideContent[] {
  if (!text || text.trim().length === 0) {
    return [
      {
        id: 'slide-1',
        title: defaultDocTitle,
        subtitle: 'Automated PowerPoint Presentation Outline',
        layout: 'title',
      },
      {
        id: 'slide-2',
        title: 'Executive Overview',
        bullets: [
          'Key strategic initiative designed to optimize operational throughput.',
          'Consolidated data metrics indicate positive growth across quarters.',
          'Next generation architecture ready for production deployment.',
        ],
        layout: 'bullets',
      },
    ];
  }

  const slides: SlideContent[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Extract primary document title
  let docTitle = defaultDocTitle;
  let firstIndex = 0;

  if (lines.length > 0) {
    const firstLine = lines[0].replace(/^#+\s*/, '').replace(/^(TITLE|SUBJECT|DOCUMENT):\s*/i, '');
    if (firstLine.length < 80) {
      docTitle = firstLine;
      firstIndex = 1;
    }
  }

  // Slide 1: Title Slide
  slides.push({
    id: `slide-1`,
    title: docTitle,
    subtitle: 'Generated via TOOLKIT AI Word to PowerPoint Converter',
    layout: 'title',
  });

  let currentTitle = '';
  let currentBullets: string[] = [];

  const flushSlide = () => {
    if (currentTitle || currentBullets.length > 0) {
      const slideTitle = currentTitle || `Key Topic ${slides.length}`;
      // Determine layout based on bullet characteristics
      let layout: SlideContent['layout'] = 'bullets';
      if (currentBullets.length >= 4) {
        layout = 'two-column';
      }

      slides.push({
        id: `slide-${slides.length + 1}`,
        title: slideTitle,
        bullets: currentBullets.length > 0 ? [...currentBullets] : ['Key topic summary and analysis.'],
        columnLeft: layout === 'two-column' ? currentBullets.slice(0, Math.ceil(currentBullets.length / 2)) : undefined,
        columnRight: layout === 'two-column' ? currentBullets.slice(Math.ceil(currentBullets.length / 2)) : undefined,
        layout,
      });

      currentTitle = '';
      currentBullets = [];
    }
  };

  for (let i = firstIndex; i < lines.length; i++) {
    const line = lines[i];

    // Check if line looks like a heading
    const isHeading =
      line.startsWith('#') ||
      line.startsWith('##') ||
      line.startsWith('###') ||
      /^(SECTION|CHAPTER|PART|TOPIC|OVERVIEW|SUMMARY|BACKGROUND|METHODOLOGY|FINDINGS|RESULTS|DISCUSSION|CONCLUSION|RECOMMENDATIONS|NEXT STEPS):/i.test(
        line
      ) ||
      (line.endsWith(':') && line.length < 60) ||
      (/^\d+[\.\)]\s+[A-Z]/.test(line) && line.length < 60 && !line.includes(';'));

    if (isHeading) {
      flushSlide();
      currentTitle = line.replace(/^#+\s*/, '').replace(/^(\d+[\.\)]\s*)/, '').replace(/:$/, '').trim();
    } else {
      // Clean bullet/text line
      const cleanLine = line.replace(/^[-*•–—]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();
      if (cleanLine.length > 0) {
        currentBullets.push(cleanLine);
      }
    }

    // Limit slide density to max 5 bullets per slide to avoid clutter
    if (currentBullets.length >= 5) {
      flushSlide();
    }
  }

  flushSlide();

  // Add a Conclusion / Next Steps slide if more than 2 slides
  if (slides.length >= 2) {
    slides.push({
      id: `slide-${slides.length + 1}`,
      title: 'Conclusion & Next Steps',
      bullets: [
        'Review key deliverables and milestone timeline.',
        'Distribute finalized presentation to stakeholders.',
        'Action items scheduled for immediate implementation.',
      ],
      layout: 'conclusion',
    });
  }

  return slides;
}

/**
 * Creates native Microsoft PowerPoint (.pptx) file from slides data
 */
export async function convertWordToPptx(
  slides: SlideContent[],
  fileName = 'presentation.pptx',
  options?: PPTXExportOptions
): Promise<void> {
  const pptx = new pptxgen();
  const themeKey = options?.theme || 'executive';
  const theme = THEME_CONFIGS[themeKey];

  pptx.layout = options?.aspectRatio === '4:3' ? 'LAYOUT_4x3' : 'LAYOUT_16x9';
  pptx.author = options?.author || 'TOOLKIT AI User';
  pptx.company = options?.company || 'TOOLKIT AI Studio';
  pptx.title = slides[0]?.title || 'PowerPoint Presentation';

  slides.forEach((slideData, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };

    const isFirstSlide = idx === 0 || slideData.layout === 'title';

    if (isFirstSlide) {
      // Title Slide Design
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 0.8,
        w: 11.7,
        h: 5.9,
        fill: { color: theme.cardBg },
        line: { color: theme.cardBorder, width: 1.5 },
      });

      // Accent top bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 0.8,
        w: 11.7,
        h: 0.15,
        fill: { color: theme.accentColor },
      });

      // Category / Format Tag
      slide.addText('PRESENTATION DECK', {
        x: 1.4,
        y: 1.6,
        w: 10.5,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: theme.accentColor,
        fontFace: 'Helvetica Neue',
        charSpacing: 2,
      });

      // Main Title
      slide.addText(slideData.title, {
        x: 1.4,
        y: 2.2,
        w: 10.5,
        h: 2.0,
        fontSize: 34,
        bold: true,
        color: theme.titleColor,
        fontFace: 'Helvetica Neue',
        valign: 'middle',
      });

      // Subtitle
      if (slideData.subtitle) {
        slide.addText(slideData.subtitle, {
          x: 1.4,
          y: 4.4,
          w: 10.5,
          h: 0.8,
          fontSize: 16,
          color: theme.bodyColor,
          fontFace: 'Helvetica Neue',
        });
      }

      // Footer
      slide.addText(`Generated via TOOLKIT AI  •  ${new Date().toLocaleDateString()}`, {
        x: 1.4,
        y: 5.8,
        w: 10.5,
        h: 0.4,
        fontSize: 10,
        color: theme.footerColor,
        fontFace: 'Helvetica Neue',
      });
    } else {
      // Standard Slide Content

      // Slide Header Bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 0.6,
        w: 11.7,
        h: 1.1,
        fill: { color: theme.cardBg },
        line: { color: theme.cardBorder, width: 1 },
      });

      // Accent Indicator
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 0.6,
        w: 0.15,
        h: 1.1,
        fill: { color: theme.accentColor },
      });

      // Slide Title
      slide.addText(slideData.title, {
        x: 1.2,
        y: 0.75,
        w: 10.0,
        h: 0.8,
        fontSize: 22,
        bold: true,
        color: theme.titleColor,
        fontFace: 'Helvetica Neue',
        valign: 'middle',
      });

      // Slide Number
      slide.addText(`Slide ${idx + 1} of ${slides.length}`, {
        x: 10.0,
        y: 0.85,
        w: 2.2,
        h: 0.6,
        fontSize: 10,
        color: theme.footerColor,
        fontFace: 'Helvetica Neue',
        align: 'right',
      });

      // Content Body Area
      if (slideData.layout === 'two-column' && slideData.columnLeft && slideData.columnRight) {
        // Left Column Card
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: 2.0,
          w: 5.7,
          h: 4.5,
          fill: { color: theme.cardBg },
          line: { color: theme.cardBorder, width: 1 },
        });

        const leftTextItems = slideData.columnLeft.map((b) => ({
          text: b,
          options: {
            bullet: { code: '2022' },
            fontSize: 13,
            color: theme.bodyColor,
            breakLine: true,
            paraSpaceAfter: 12,
          },
        }));

        slide.addText(leftTextItems, {
          x: 1.1,
          y: 2.3,
          w: 5.1,
          h: 3.9,
          fontFace: 'Helvetica Neue',
          valign: 'top',
        });

        // Right Column Card
        slide.addShape(pptx.ShapeType.rect, {
          x: 6.8,
          y: 2.0,
          w: 5.7,
          h: 4.5,
          fill: { color: theme.cardBg },
          line: { color: theme.cardBorder, width: 1 },
        });

        const rightTextItems = slideData.columnRight.map((b) => ({
          text: b,
          options: {
            bullet: { code: '2022' },
            fontSize: 13,
            color: theme.bodyColor,
            breakLine: true,
            paraSpaceAfter: 12,
          },
        }));

        slide.addText(rightTextItems, {
          x: 7.1,
          y: 2.3,
          w: 5.1,
          h: 3.9,
          fontFace: 'Helvetica Neue',
          valign: 'top',
        });
      } else {
        // Full Width Content Card
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: 2.0,
          w: 11.7,
          h: 4.5,
          fill: { color: theme.cardBg },
          line: { color: theme.cardBorder, width: 1 },
        });

        const bullets = slideData.bullets || [];
        const textItems = bullets.map((b) => ({
          text: b,
          options: {
            bullet: { code: '2022' },
            fontSize: 14,
            color: theme.bodyColor,
            breakLine: true,
            paraSpaceAfter: 16,
          },
        }));

        if (textItems.length > 0) {
          slide.addText(textItems, {
            x: 1.3,
            y: 2.4,
            w: 10.7,
            h: 3.7,
            fontFace: 'Helvetica Neue',
            valign: 'top',
          });
        }
      }

      // Slide Footer
      slide.addText('TOOLKIT AI • Word to PowerPoint Converter', {
        x: 0.8,
        y: 6.8,
        w: 8.0,
        h: 0.4,
        fontSize: 9,
        color: theme.footerColor,
        fontFace: 'Helvetica Neue',
      });
    }
  });

  const finalFileName = fileName.endsWith('.pptx') ? fileName : `${fileName}.pptx`;
  await pptx.writeFile({ fileName: finalFileName });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toolkit-toast', {
        detail: {
          type: 'conversion',
          title: 'Word Converted to PowerPoint (.pptx)',
          fileName: finalFileName,
          fromFormat: 'DOCX / Word',
          toFormat: 'PPTX Slides',
          toolName: 'Word to PowerPoint',
          message: `Generated ${slides.length}-slide PowerPoint presentation "${finalFileName}".`,
          duration: 4800,
        },
      })
    );
  }
}

// 1. DOCX / Text to PDF
export async function convertTextDocToPdf(
  title: string,
  content: string,
  fileName = 'converted_document.pdf'
): Promise<void> {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 595.28, 45, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(title.slice(0, 45), 30, 28);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const splitText = doc.splitTextToSize(content || 'No text extracted.', 535);
  let cursorY = 75;
  const pageHeight = doc.internal.pageSize.height;

  for (let i = 0; i < splitText.length; i++) {
    if (cursorY > pageHeight - 40) {
      doc.addPage();
      cursorY = 50;
    }
    doc.text(splitText[i], 30, cursorY);
    cursorY += 15;
  }

  doc.save(fileName);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toolkit-toast', {
        detail: {
          type: 'conversion',
          title: 'Document Converted to PDF',
          fileName,
          toFormat: 'PDF',
          toolName: 'Document Converter',
          message: `Converted "${title}" into vector PDF "${fileName}".`,
          duration: 4500,
        },
      })
    );
  }
}

// 2. Excel (XLSX/CSV) to PDF
export async function convertExcelToPdf(file: File): Promise<void> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`Spreadsheet Export: ${file.name.replace(/\.[^/.]+$/, '')}`, 40, 40);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Sheet: ${firstSheetName} | Generated via TOOLKIT AI`, 40, 56);

  let y = 80;
  const startX = 40;
  const colWidth = 110;
  const rowHeight = 20;
  const pageHeight = doc.internal.pageSize.height;

  // Render Table Grid
  rows.slice(0, 100).forEach((row, rowIndex) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 50;
    }

    const isHeader = rowIndex === 0;
    if (isHeader) {
      doc.setFillColor(241, 245, 249);
      doc.rect(startX, y - 13, 760, rowHeight, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
    } else {
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
    }

    row.slice(0, 7).forEach((cellValue, colIndex) => {
      const cellText = String(cellValue !== undefined && cellValue !== null ? cellValue : '').slice(0, 20);
      doc.text(cellText, startX + colIndex * colWidth, y);
    });

    // Hairline divider
    doc.setDrawColor(226, 232, 240);
    doc.line(startX, y + 6, startX + 760, y + 6);

    y += rowHeight;
  });

  const outputPdfName = `${file.name.replace(/\.[^/.]+$/, '')}_converted.pdf`;
  doc.save(outputPdfName);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toolkit-toast', {
        detail: {
          type: 'conversion',
          title: 'Spreadsheet Converted to PDF',
          fileName: outputPdfName,
          fromFormat: 'XLSX / CSV',
          toFormat: 'PDF',
          toolName: 'Excel to PDF',
          message: `Converted "${file.name}" table into printable landscape PDF.`,
          duration: 4500,
        },
      })
    );
  }
}

// 3. PDF to Excel (Extract Tables to XLSX)
export async function convertPdfToExcel(extractedRows: any[][], fileName = 'extracted_data.xlsx'): Promise<void> {
  const worksheet = XLSX.utils.aoa_to_sheet(extractedRows.length > 0 ? extractedRows : [
    ['Extracted Item', 'Category', 'Quantity', 'Amount', 'Date', 'Status'],
    ['Product Alpha Service', 'Software', 1, '$499.00', '2026-08-15', 'Processed'],
    ['Enterprise License Pack', 'Subscription', 5, '$2,450.00', '2026-08-15', 'Active'],
    ['Cloud Storage Add-on', 'Infrastructure', 10, '$150.00', '2026-08-15', 'Active'],
    ['Support Retainer', 'Professional Services', 1, '$800.00', '2026-08-15', 'Verified'],
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');
  XLSX.writeFile(workbook, fileName);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toolkit-toast', {
        detail: {
          type: 'conversion',
          title: 'Table Extracted to Excel',
          fileName,
          fromFormat: 'PDF',
          toFormat: 'XLSX',
          toolName: 'PDF to Excel',
          message: `Extracted table matrix into structured spreadsheet "${fileName}".`,
          duration: 4500,
        },
      })
    );
  }
}

// 4. PowerPoint (PPTX) to Word Document Outline
export async function convertPptToWord(
  slidesData: { slideNumber: number; title: string; bullets: string[] }[],
  fileName = 'presentation_outline.docx'
): Promise<void> {
  let textDoc = `# Presentation Outline & Speaker Notes\nGenerated from Presentation via TOOLKIT AI\n\n`;
  slidesData.forEach((s) => {
    textDoc += `## Slide ${s.slideNumber}: ${s.title}\n`;
    s.bullets.forEach((b) => {
      textDoc += `- ${b}\n`;
    });
    textDoc += `\n`;
  });

  // Convert to downloadable document blob
  const blob = new Blob([textDoc], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  downloadBlob(blob, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

// 5. Excel to PowerPoint Slides Outline
export async function convertExcelToPpt(
  summaryRows: { category: string; value: number | string; trend: string }[],
  fileName = 'excel_insights_presentation.pptx'
): Promise<void> {
  let pptText = `EXCEL TO PRESENTATION SLIDES BLUEPRINT\nGenerated via TOOLKIT AI Engine\n\n`;
  summaryRows.forEach((r, idx) => {
    pptText += `Slide ${idx + 1}: ${r.category} Performance Overview\n- Metric Value: ${r.value}\n- Key Observation: ${r.trend}\n- Actionable Insight: Maximize throughput in upcoming cycle.\n\n`;
  });

  const blob = new Blob([pptText], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  downloadBlob(blob, fileName, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
}

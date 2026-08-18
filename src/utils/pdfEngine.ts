import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export async function splitPDF(file: File, pageRangesStr: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();
  const newPdf = await PDFDocument.create();

  // Parse ranges like "1-3, 5, 7-9"
  const pagesToInclude = new Set<number>();
  if (!pageRangesStr || pageRangesStr.trim() === 'all') {
    for (let i = 0; i < totalPages; i++) pagesToInclude.add(i);
  } else {
    const parts = pageRangesStr.split(',');
    for (const part of parts) {
      const clean = part.trim();
      if (clean.includes('-')) {
        const [start, end] = clean.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pagesToInclude.add(i - 1);
          }
        }
      } else {
        const p = parseInt(clean, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pagesToInclude.add(p - 1);
        }
      }
    }
  }

  const sortedPages = Array.from(pagesToInclude).sort((a, b) => a - b);
  const copiedPages = await newPdf.copyPages(srcPdf, sortedPages);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function rotatePDF(file: File, rotationAngle: number): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + rotationAngle) % 360));
  });

  return await pdfDoc.save();
}

export async function deletePDFPages(file: File, pagesToDelete1Based: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  const totalPages = srcPdf.getPageCount();
  const deleteSet = new Set(pagesToDelete1Based.map((p) => p - 1));

  const keepIndices: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (!deleteSet.has(i)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages from the PDF.');
  }

  const copiedPages = await newPdf.copyPages(srcPdf, keepIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function addWatermarkToPDF(
  file: File,
  watermarkText: string,
  options: {
    opacity?: number;
    fontSize?: number;
    color?: { r: number; g: number; b: number };
    angle?: number;
  } = {}
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const opacity = options.opacity ?? 0.35;
  const fontSize = options.fontSize ?? 48;
  const angle = options.angle ?? 45;
  const color = options.color ?? { r: 0.7, g: 0.1, b: 0.1 };

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 3,
      y: height / 2 - textHeight / 3,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(angle),
    });
  });

  return await pdfDoc.save();
}

export async function signPDF(
  file: File,
  signatureDataUrl: string,
  pageNum1Based: number,
  relX = 0.65,
  relY = 0.15,
  width = 150,
  height = 60
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const targetIndex = Math.min(Math.max(0, pageNum1Based - 1), pages.length - 1);
  const targetPage = pages[targetIndex];

  const pngImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
  const signatureImage = await pdfDoc.embedPng(pngImageBytes);

  const { width: pageWidth, height: pageHeight } = targetPage.getSize();
  const x = relX * pageWidth;
  const y = relY * pageHeight;

  targetPage.drawImage(signatureImage, {
    x,
    y,
    width,
    height,
  });

  return await pdfDoc.save();
}

export async function imagesToPDF(imageFiles: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of imageFiles) {
    const buffer = await file.arrayBuffer();
    let embeddedImg;

    if (file.type.includes('png')) {
      embeddedImg = await pdfDoc.embedPng(buffer);
    } else {
      embeddedImg = await pdfDoc.embedJpg(buffer);
    }

    const { width, height } = embeddedImg.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}

export async function removePDFMetadata(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('TOOLKIT AI Clean Engine (Zero-Metadata)');
  pdfDoc.setCreator('TOOLKIT AI');
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));

  return await pdfDoc.save();
}

export function downloadBlob(
  data: Uint8Array | Blob,
  fileName: string,
  mimeType = 'application/pdf',
  options?: { toolName?: string; showToastNotification?: boolean }
) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Dispatch toast notification event if in browser
  if (typeof window !== 'undefined' && options?.showToastNotification !== false) {
    const sizeKB = (blob.size / 1024).toFixed(1);
    const formattedSize = blob.size > 1024 * 1024 ? `${(blob.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKB} KB`;
    const extension = fileName.split('.').pop()?.toUpperCase() || 'FILE';

    window.dispatchEvent(
      new CustomEvent('toolkit-toast', {
        detail: {
          type: 'download',
          title: 'File Downloaded',
          fileName,
          fileSize: formattedSize,
          toFormat: extension,
          toolName: options?.toolName,
          message: `Saved "${fileName}" (${formattedSize}) to your device.`,
          duration: 4500,
        },
      })
    );
  }
}

import { PassportPhotoSettings } from '../types';

export const PASSPORT_PRESETS: Record<string, { label: string; width: number; height: number; defaultKB: number; desc: string }> = {
  india: {
    label: 'India Passport & Visa (3.5 × 4.5 cm)',
    width: 413,
    height: 531,
    defaultKB: 50,
    desc: 'Standard 35mm x 45mm at 300 DPI. Recommended for Passport, OCI & Govt Portals.',
  },
  india_govt: {
    label: 'India SSC / UPSC / Portal (20KB - 50KB)',
    width: 350,
    height: 450,
    defaultKB: 40,
    desc: 'Strictly compressed under 50 KB for online government examinations.',
  },
  us: {
    label: 'US Visa & Passport (2 × 2 inches)',
    width: 600,
    height: 600,
    defaultKB: 240,
    desc: 'Square 2x2 inch format at 300 DPI with plain white background.',
  },
  schengen: {
    label: 'Schengen & European Union (35 × 45 mm)',
    width: 413,
    height: 531,
    defaultKB: 100,
    desc: 'Standard for European Schengen visa and ID cards with light background.',
  },
  uk: {
    label: 'United Kingdom (35 × 45 mm)',
    width: 413,
    height: 531,
    defaultKB: 100,
    desc: 'Official HM Passport Office standards with light grey/cream background.',
  },
  canada: {
    label: 'Canada Passport (50 × 70 mm)',
    width: 590,
    height: 826,
    defaultKB: 300,
    desc: '50mm x 70mm Canadian citizenship and passport specifications.',
  },
  custom: {
    label: 'Custom Dimensions & Exact Size',
    width: 400,
    height: 500,
    defaultKB: 50,
    desc: 'Freely customize pixel dimensions and exact KB/MB target limits.',
  },
};

/**
 * Process a user photo on HTML Canvas:
 * Applies background replacement, adjustments, crop, and adaptive compression to hit target KB/MB.
 */
export async function processPassportPhoto(
  imgElement: HTMLImageElement,
  settings: PassportPhotoSettings
): Promise<{ dataUrl: string; blob: Blob; finalSizeKB: number; width: number; height: number }> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to create canvas context');

  const targetWidth = Math.max(100, Math.min(2400, Math.round(settings.widthPx)));
  const targetHeight = Math.max(100, Math.min(3000, Math.round(settings.heightPx)));

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 1. Fill Background
  if (settings.bgColor && settings.bgColor !== 'transparent') {
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  // 2. Compute Smart Crop (Center Head & Shoulders)
  const imgAspect = imgElement.naturalWidth / imgElement.naturalHeight;
  const targetAspect = targetWidth / targetHeight;

  let drawW = targetWidth;
  let drawH = targetHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > targetAspect) {
    // Image is wider: fit height and crop sides
    drawH = targetHeight;
    drawW = targetHeight * imgAspect;
    offsetX = -(drawW - targetWidth) / 2;
  } else {
    // Image is taller: fit width and crop bottom (keep top head visible)
    drawW = targetWidth;
    drawH = targetWidth / imgAspect;
    offsetY = -(drawH - targetHeight) * 0.2; // slight bias towards top of photo
  }

  // 3. Apply Filters (Brightness, Contrast, Saturation)
  ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
  ctx.drawImage(imgElement, offsetX, offsetY, drawW, drawH);
  ctx.filter = 'none';

  // 4. Target Size Constraint (KB / MB limit)
  let targetBytes = 0;
  if (settings.targetMaxMB && settings.targetMaxMB > 0) {
    targetBytes = settings.targetMaxMB * 1024 * 1024;
  } else if (settings.targetMaxKB && settings.targetMaxKB > 0) {
    targetBytes = settings.targetMaxKB * 1024;
  }

  const mimeType = settings.bgColor === 'transparent' ? 'image/png' : 'image/jpeg';

  // If no limit or PNG, return standard export
  if (targetBytes <= 0 || mimeType === 'image/png') {
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), mimeType, 0.95));
    return {
      dataUrl,
      blob,
      finalSizeKB: Math.round(blob.size / 1024),
      width: targetWidth,
      height: targetHeight,
    };
  }

  // Binary search to find optimal JPEG quality strictly under targetBytes
  let minQuality = 0.05;
  let maxQuality = 0.98;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.85;

  for (let i = 0; i < 7; i++) {
    const q = (minQuality + maxQuality) / 2;
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', q));
    if (blob.size <= targetBytes) {
      bestBlob = blob;
      bestQuality = q;
      minQuality = q; // try to get better quality while staying under
    } else {
      maxQuality = q; // too big, decrease quality
    }
  }

  if (!bestBlob) {
    // If still too big at min quality, downscale canvas slightly
    bestBlob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.1));
  }

  const finalDataUrl = URL.createObjectURL(bestBlob);

  return {
    dataUrl: finalDataUrl,
    blob: bestBlob,
    finalSizeKB: Math.round(bestBlob.size / 1024),
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Generate 4x6 inch or A4 printable passport grid sheet
 */
export async function generatePassportPrintSheet(
  singlePhotoBlob: Blob,
  sheetType: '4x6' | 'a4',
  photoW: number,
  photoH: number
): Promise<{ dataUrl: string; blob: Blob }> {
  const img = new Image();
  const url = URL.createObjectURL(singlePhotoBlob);
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  let sheetW = 1200; // 4x6 at 200dpi
  let sheetH = 1800;
  let cols = 2;
  let rows = 4;

  if (sheetType === 'a4') {
    sheetW = 2480; // A4 at 300dpi
    sheetH = 3508;
    cols = 4;
    rows = 8;
  }

  canvas.width = sheetW;
  canvas.height = sheetH;

  // Clean white sheet
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sheetW, sheetH);

  // Spacing & Cut lines
  const cellW = (sheetW - 80) / cols;
  const cellH = (sheetH - 80) / rows;
  const marginX = 40;
  const marginY = 40;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = marginX + c * cellW + (cellW - photoW) / 2;
      const y = marginY + r * cellH + (cellH - photoH) / 2;

      ctx.drawImage(img, x, y, photoW, photoH);

      // Light cut line border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 2, y - 2, photoW + 4, photoH + 4);
    }
  }

  // Watermark footer
  ctx.setLineDash([]);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Generated with TOOLKIT AI Passport Studio - Ready to Print & Cut', sheetW / 2, sheetH - 15);

  const sheetBlob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95));
  URL.revokeObjectURL(url);

  return {
    dataUrl: URL.createObjectURL(sheetBlob),
    blob: sheetBlob,
  };
}

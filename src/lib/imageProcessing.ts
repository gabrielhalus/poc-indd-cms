import type { AspectRatio } from '../types/schema';

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
}

/** Crop rectangle in source image pixel coordinates. */
export interface CropRectPx {
  sx: number;
  sy: number;
  width: number;
  height: number;
}

export interface CropOptions {
  /** Optional explicit crop rectangle in source image coordinates. */
  cropRect?: CropRectPx;
  /** Max dimension (width/height) of the output image, preserving aspect ratio. */
  maxSize?: number;
}

function parseAspectRatio(ratio: AspectRatio): number {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return 1;
  return w / h;
}

export async function cropToAspectRatio(
  file: File,
  ratio: AspectRatio,
  options: CropOptions = {},
): Promise<ProcessedImage> {
  const { maxSize = 1600, cropRect } = options;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = dataUrl;
  });

  const aspect = parseAspectRatio(ratio);
  let cropWidth: number;
  let cropHeight: number;
  let sx: number;
  let sy: number;

  if (cropRect) {
    // Use the provided crop rectangle but make sure it matches the desired aspect ratio.
    const rectAspect = cropRect.width / cropRect.height;
    if (Math.abs(rectAspect - aspect) > 0.01) {
      // Adjust height to enforce aspect ratio while keeping width.
      cropWidth = cropRect.width;
      cropHeight = cropRect.width / aspect;
    } else {
      cropWidth = cropRect.width;
      cropHeight = cropRect.height;
    }
    sx = cropRect.sx;
    sy = cropRect.sy;
  } else {
    // Fallback to centered crop with desired aspect ratio.
    cropWidth = img.width;
    cropHeight = img.height;

    if (img.width / img.height > aspect) {
      cropWidth = img.height * aspect;
    } else {
      cropHeight = img.width / aspect;
    }

    sx = (img.width - cropWidth) / 2;
    sy = (img.height - cropHeight) / 2;
  }

  let targetWidth = cropWidth;
  let targetHeight = cropHeight;

  if (targetWidth > maxSize || targetHeight > maxSize) {
    const scale = Math.min(maxSize / targetWidth, maxSize / targetHeight);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(
    img,
    sx,
    sy,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error('Failed to create image blob'));
        } else {
          resolve(b);
        }
      },
      'image/jpeg',
      0.9,
    );
  });

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
  };
}



/**
 * Image compression and optimization utilities
 */

export interface CompressedImage {
  dataUrl: string;
  size: number;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  maxWidth: number = 1000,
  quality: number = 0.7,
  maxSizeKB: number = 500
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      const mimeType = 'image/webp';
      const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

      const encodeAttempt = (targetMaxWidth: number, q: number) => {
        let width = img.width;
        let height = img.height;

        if (width > targetMaxWidth) {
          const ratio = targetMaxWidth / width;
          width = targetMaxWidth;
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(mimeType, q);
        const sizeInKB = Math.round((dataUrl.length * 3) / 4 / 1024);
        return { dataUrl, sizeInKB, width, height };
      };

      // Progressive compression: adjust quality then width until <= maxSizeKB
      let currentMaxWidth = maxWidth;
      let currentQuality = clamp(quality, 0.4, 0.9);

      // Try a few quality steps first at the same width
      for (let i = 0; i < 6; i++) {
        const attempt = encodeAttempt(currentMaxWidth, currentQuality);
        if (attempt.sizeInKB <= maxSizeKB) {
          resolve({ dataUrl: attempt.dataUrl, size: attempt.sizeInKB, width: attempt.width, height: attempt.height });
          return;
        }
        currentQuality = clamp(currentQuality - 0.08, 0.4, 0.9);
      }

      // If still too large, reduce width and retry quality ramp
      for (let wStep = 0; wStep < 5; wStep++) {
        currentMaxWidth = Math.max(480, Math.round(currentMaxWidth * 0.85));
        currentQuality = clamp(quality, 0.4, 0.9);
        for (let qStep = 0; qStep < 6; qStep++) {
          const attempt = encodeAttempt(currentMaxWidth, currentQuality);
          if (attempt.sizeInKB <= maxSizeKB) {
            resolve({ dataUrl: attempt.dataUrl, size: attempt.sizeInKB, width: attempt.width, height: attempt.height });
            return;
          }
          currentQuality = clamp(currentQuality - 0.08, 0.4, 0.9);
        }
      }

      const last = encodeAttempt(currentMaxWidth, 0.4);
      reject(new Error(`File terlalu besar setelah kompresi: ${last.sizeInKB}KB (maks: ${maxSizeKB}KB). Coba gunakan gambar dengan resolusi lebih kecil atau fitur unggah lain.`));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

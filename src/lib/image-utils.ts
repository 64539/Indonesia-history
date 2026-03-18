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
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Try WebP first, fallback to JPEG
      const mimeType = 'image/webp';
      const dataUrl = canvas.toDataURL(mimeType, quality);
      
      // Check size
      const sizeInKB = Math.round((dataUrl.length * 3) / 4 / 1024);
      
      if (sizeInKB > maxSizeKB) {
        reject(new Error(`File too large: ${sizeInKB}KB (max: ${maxSizeKB}KB)`));
        return;
      }

      resolve({
        dataUrl,
        size: sizeInKB,
        width,
        height
      });
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

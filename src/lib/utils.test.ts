import { describe, it, expect } from 'vitest';
import { cn, getYouTubeId } from './utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active', !isActive && 'hidden')).toBe('base active');
    });

    it('should merge tailwind conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
  });

  describe('getYouTubeId', () => {
    it('should extract ID from standard URL', () => {
      expect(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from short URL', () => {
      expect(getYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from embed URL', () => {
      expect(getYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      expect(getYouTubeId('https://example.com')).toBeNull();
      expect(getYouTubeId('')).toBeNull();
    });
  });
});

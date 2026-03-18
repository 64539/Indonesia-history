import { describe, it, expect, vi } from 'vitest'
import { compressImage, isValidImageFile, formatFileSize } from './image-utils'

// Mock canvas and image for testing
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
  })),
  toDataURL: vi.fn(() => 'data:image/webp;base64,mockdata'),
}

const mockImage = {
  onload: null as any,
  onerror: null as any,
  src: '',
}

// Mock DOM APIs
global.document = {
  createElement: vi.fn(() => mockCanvas),
} as any

global.Image = vi.fn(() => mockImage) as any

global.URL = {
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn(),
} as any

describe('Image Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('compressImage', () => {
    it('should compress image successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // Simulate successful image load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload()
      }, 0)

      const result = await compressImage(file, 1000, 0.7, 500)

      expect(result).toEqual({
        dataUrl: 'data:image/webp;base64,mockdata',
        size: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
      })
    })

    it('should reject if file is too large', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // Mock large file size
      mockCanvas.toDataURL = vi.fn(() => 'x'.repeat(600 * 1024 / 3 * 4)) // 600KB
      
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload()
      }, 0)

      await expect(compressImage(file, 1000, 0.7, 500))
        .rejects.toThrow('File too large')
    })

    it('should handle image load error', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror()
      }, 0)

      await expect(compressImage(file))
        .rejects.toThrow('Failed to load image')
    })
  })

  describe('isValidImageFile', () => {
    it('should accept valid image types', () => {
      expect(isValidImageFile(new File([''], 'test.jpg', { type: 'image/jpeg' }))).toBe(true)
      expect(isValidImageFile(new File([''], 'test.png', { type: 'image/png' }))).toBe(true)
      expect(isValidImageFile(new File([''], 'test.webp', { type: 'image/webp' }))).toBe(true)
    })

    it('should reject invalid image types', () => {
      expect(isValidImageFile(new File([''], 'test.pdf', { type: 'application/pdf' }))).toBe(false)
      expect(isValidImageFile(new File([''], 'test.txt', { type: 'text/plain' }))).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1048576)).toBe('1.0 MB')
    })
  })
})

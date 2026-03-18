/**
 * URL validation utilities for image links
 */

export function isValidDirectImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  // Check for Base64 data URLs
  if (url.startsWith('data:image/')) return true
  
  try {
    const urlObj = new URL(url)
    
    // Block Google Drive/Share URLs
    if (urlObj.hostname.includes('drive.google.com') || 
        urlObj.hostname.includes('docs.google.com') ||
        urlObj.hostname.includes('share.google.com')) {
      return false
    }
    
    // Block other common non-image URLs
    const blockedHosts = [
      'facebook.com',
      'instagram.com', 
      'twitter.com',
      'linkedin.com',
      'youtube.com',
      'tiktok.com'
    ]
    
    if (blockedHosts.some(host => urlObj.hostname.includes(host))) {
      return false
    }
    
    // Allow common image hosting and direct URLs
    const allowedPatterns = [
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i, // Direct image files
      /img\.youtube\.com/, // YouTube thumbnails
      /i\.ytimg\.com/, // YouTube images
      /upload\.wikimedia\.org/, // Wikipedia images
      /coresg-normal\.trae\.ai/, // Existing allowed host
      /unsplash\.com/,
      /pexels\.com/,
      /pixabay\.com/
    ]
    
    return allowedPatterns.some(pattern => pattern.test(url))
    
  } catch {
    return false
  }
}

export function getInvalidUrlType(url: string): 'google-drive' | 'social-media' | 'invalid' | null {
  if (!url || typeof url !== 'string') return 'invalid'
  
  try {
    const urlObj = new URL(url)
    
    if (urlObj.hostname.includes('drive.google.com') || 
        urlObj.hostname.includes('docs.google.com') ||
        urlObj.hostname.includes('share.google.com')) {
      return 'google-drive'
    }
    
    const socialHosts = [
      'facebook.com',
      'instagram.com', 
      'twitter.com',
      'linkedin.com',
      'youtube.com',
      'tiktok.com'
    ]
    
    if (socialHosts.some(host => urlObj.hostname.includes(host))) {
      return 'social-media'
    }
    
    return 'invalid'
    
  } catch {
    return 'invalid'
  }
}

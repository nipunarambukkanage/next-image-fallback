/**
 * Image utility functions for next-image-fallback
 * @module utils
 */

/**
 * Checks if a URL is valid and properly formatted
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Check for empty strings or whitespace only
  if (url.trim() === '') return false;
  
  // Check for common image data URLs
  if (url.startsWith('data:image/')) return true;
  
  // Check for relative paths
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return true;
  
  // Check for absolute URLs
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Supported image extensions
 */
export const IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico', '.bmp', '.tiff'
] as const;

/**
 * Checks if a URL points to a supported image format
 * @param url - The URL to check
 * @returns boolean indicating if the URL has a supported image extension
 */
export const hasImageExtension = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Handle data URLs
  if (url.startsWith('data:image/')) return true;
  
  const lowerUrl = url.toLowerCase();
  
  // Remove query parameters and hash for extension check
  const cleanUrl = lowerUrl.split('?')[0].split('#')[0];
  
  return IMAGE_EXTENSIONS.some(ext => cleanUrl.endsWith(ext));
};

/**
 * Extracts the file extension from a URL
 * @param url - The URL to extract extension from
 * @returns The file extension including the dot, or empty string if not found
 */
export const getImageExtension = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  // Handle data URLs
  if (url.startsWith('data:image/')) {
    const match = url.match(/^data:image\/(\w+)/);
    return match ? `.${match[1]}` : '';
  }
  
  // Remove query parameters and hash
  const cleanUrl = url.toLowerCase().split('?')[0].split('#')[0];
  
  const found = IMAGE_EXTENSIONS.find(ext => cleanUrl.endsWith(ext));
  return found || '';
};

/**
 * Generates a placeholder color based on a string (useful for consistent avatar colors)
 * @param str - Input string to generate color from
 * @returns A hex color string
 */
export const generateColorFromString = (str: string): string => {
  if (!str) return '#6366f1';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash >> 8) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash >> 16) % 15); // 45-60%
  
  return hslToHex(hue, saturation, lightness);
};

/**
 * Converts HSL color values to hex
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  const toHex = (val: number): string => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Determines if a color is light or dark
 * @param hexColor - Hex color string (with or without #)
 * @returns 'light' or 'dark'
 */
export const getColorBrightness = (hexColor: string): 'light' | 'dark' => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? 'light' : 'dark';
};

/**
 * Gets a contrasting text color (black or white) for a given background
 * @param backgroundColor - Background color in hex format
 * @returns '#000000' or '#ffffff'
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  return getColorBrightness(backgroundColor) === 'light' ? '#000000' : '#ffffff';
};

/**
 * Preloads an image and returns a promise
 * @param src - Image source URL
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Promise that resolves when image loads or rejects on error/timeout
 */
export const preloadImage = (src: string, timeout: number = 10000): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    const timeoutId = setTimeout(() => {
      reject(new Error(`Image load timeout: ${src}`));
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
};

/**
 * Checks if an image URL is accessible (can be loaded)
 * @param src - Image source URL
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns Promise<boolean> indicating if image is accessible
 */
export const isImageAccessible = async (src: string, timeout: number = 5000): Promise<boolean> => {
  try {
    await preloadImage(src, timeout);
    return true;
  } catch {
    return false;
  }
};

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidImageUrl,
  IMAGE_EXTENSIONS,
  hasImageExtension,
  getImageExtension,
  generateColorFromString,
  hslToHex,
  getColorBrightness,
  getContrastingTextColor,
  preloadImage,
  isImageAccessible,
} from '../src/utils';

describe('isValidImageUrl', () => {
  it('returns false for null or undefined', () => {
    expect(isValidImageUrl(null)).toBe(false);
    expect(isValidImageUrl(undefined)).toBe(false);
  });

  it('returns false for empty strings', () => {
    expect(isValidImageUrl('')).toBe(false);
    expect(isValidImageUrl('   ')).toBe(false);
  });

  it('returns true for data URLs', () => {
    expect(isValidImageUrl('data:image/png;base64,abc123')).toBe(true);
    expect(isValidImageUrl('data:image/jpeg;base64,xyz')).toBe(true);
    expect(isValidImageUrl('data:image/svg+xml,<svg></svg>')).toBe(true);
  });

  it('returns true for relative paths', () => {
    expect(isValidImageUrl('/images/photo.jpg')).toBe(true);
    expect(isValidImageUrl('./assets/logo.png')).toBe(true);
    expect(isValidImageUrl('../images/banner.webp')).toBe(true);
  });

  it('returns true for valid http/https URLs', () => {
    expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
    expect(isValidImageUrl('http://cdn.example.com/photo.png')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidImageUrl('not-a-url')).toBe(false);
    expect(isValidImageUrl('ftp://example.com/file')).toBe(false);
    expect(isValidImageUrl('file:///local/path')).toBe(false);
  });
});

describe('IMAGE_EXTENSIONS', () => {
  it('includes common image formats', () => {
    expect(IMAGE_EXTENSIONS).toContain('.jpg');
    expect(IMAGE_EXTENSIONS).toContain('.jpeg');
    expect(IMAGE_EXTENSIONS).toContain('.png');
    expect(IMAGE_EXTENSIONS).toContain('.gif');
    expect(IMAGE_EXTENSIONS).toContain('.webp');
    expect(IMAGE_EXTENSIONS).toContain('.avif');
    expect(IMAGE_EXTENSIONS).toContain('.svg');
  });
});

describe('hasImageExtension', () => {
  it('returns false for invalid inputs', () => {
    expect(hasImageExtension('')).toBe(false);
    expect(hasImageExtension(null as any)).toBe(false);
    expect(hasImageExtension(undefined as any)).toBe(false);
  });

  it('returns true for data URLs', () => {
    expect(hasImageExtension('data:image/png;base64,abc')).toBe(true);
  });

  it('returns true for URLs with image extensions', () => {
    expect(hasImageExtension('/images/photo.jpg')).toBe(true);
    expect(hasImageExtension('https://example.com/logo.PNG')).toBe(true);
    expect(hasImageExtension('/banner.webp')).toBe(true);
  });

  it('ignores query parameters and hashes', () => {
    expect(hasImageExtension('/image.jpg?size=large')).toBe(true);
    expect(hasImageExtension('/photo.png#section')).toBe(true);
    expect(hasImageExtension('/img.webp?v=1#top')).toBe(true);
  });

  it('returns false for non-image extensions', () => {
    expect(hasImageExtension('/document.pdf')).toBe(false);
    expect(hasImageExtension('/video.mp4')).toBe(false);
    expect(hasImageExtension('/style.css')).toBe(false);
  });
});

describe('getImageExtension', () => {
  it('returns empty string for invalid inputs', () => {
    expect(getImageExtension('')).toBe('');
    expect(getImageExtension(null as any)).toBe('');
  });

  it('extracts extension from data URLs', () => {
    expect(getImageExtension('data:image/png;base64,abc')).toBe('.png');
    expect(getImageExtension('data:image/jpeg;base64,xyz')).toBe('.jpeg');
  });

  it('extracts extension from regular URLs', () => {
    expect(getImageExtension('/images/photo.jpg')).toBe('.jpg');
    expect(getImageExtension('https://example.com/logo.PNG')).toBe('.png');
    expect(getImageExtension('/banner.webp')).toBe('.webp');
  });

  it('ignores query parameters', () => {
    expect(getImageExtension('/image.jpg?size=large')).toBe('.jpg');
  });

  it('returns empty string for non-image URLs', () => {
    expect(getImageExtension('/document.pdf')).toBe('');
    expect(getImageExtension('/no-extension')).toBe('');
  });
});

describe('generateColorFromString', () => {
  it('returns default color for empty input', () => {
    expect(generateColorFromString('')).toBe('#6366f1');
  });

  it('generates consistent colors for same input', () => {
    const color1 = generateColorFromString('test-user');
    const color2 = generateColorFromString('test-user');
    expect(color1).toBe(color2);
  });

  it('generates different colors for different inputs', () => {
    const color1 = generateColorFromString('alice');
    const color2 = generateColorFromString('bob');
    expect(color1).not.toBe(color2);
  });

  it('returns valid hex color format', () => {
    const color = generateColorFromString('any-string');
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('hslToHex', () => {
  it('converts red correctly', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000');
  });

  it('converts green correctly', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00ff00');
  });

  it('converts blue correctly', () => {
    expect(hslToHex(240, 100, 50)).toBe('#0000ff');
  });

  it('converts white correctly', () => {
    expect(hslToHex(0, 0, 100)).toBe('#ffffff');
  });

  it('converts black correctly', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
  });
});

describe('getColorBrightness', () => {
  it('identifies light colors', () => {
    expect(getColorBrightness('#ffffff')).toBe('light');
    expect(getColorBrightness('#ffff00')).toBe('light');
    expect(getColorBrightness('f0f0f0')).toBe('light');
  });

  it('identifies dark colors', () => {
    expect(getColorBrightness('#000000')).toBe('dark');
    expect(getColorBrightness('#0000ff')).toBe('dark');
    expect(getColorBrightness('333333')).toBe('dark');
  });
});

describe('getContrastingTextColor', () => {
  it('returns black for light backgrounds', () => {
    expect(getContrastingTextColor('#ffffff')).toBe('#000000');
    expect(getContrastingTextColor('#f0f0f0')).toBe('#000000');
  });

  it('returns white for dark backgrounds', () => {
    expect(getContrastingTextColor('#000000')).toBe('#ffffff');
    expect(getContrastingTextColor('#333333')).toBe('#ffffff');
  });
});

describe('preloadImage', () => {
  let originalImage: typeof Image;
  
  beforeEach(() => {
    originalImage = global.Image;
  });

  afterEach(() => {
    global.Image = originalImage;
  });

  it('resolves when image loads successfully', async () => {
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
    };
    
    global.Image = vi.fn(() => mockImage) as any;
    
    const promise = preloadImage('https://example.com/image.jpg');
    
    // Trigger onload
    mockImage.onload?.();
    
    const result = await promise;
    expect(result).toBe(mockImage);
  });

  it('rejects when image fails to load', async () => {
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
    };
    
    global.Image = vi.fn(() => mockImage) as any;
    
    const promise = preloadImage('https://example.com/broken.jpg');
    
    // Trigger onerror
    mockImage.onerror?.();
    
    await expect(promise).rejects.toThrow('Failed to load image');
  });

  it('rejects on timeout', async () => {
    vi.useFakeTimers();
    
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
    };
    
    global.Image = vi.fn(() => mockImage) as any;
    
    const promise = preloadImage('https://example.com/slow.jpg', 1000);
    
    // Fast forward past timeout
    vi.advanceTimersByTime(1001);
    
    await expect(promise).rejects.toThrow('Image load timeout');
    
    vi.useRealTimers();
  });
});

describe('isImageAccessible', () => {
  let originalImage: typeof Image;
  
  beforeEach(() => {
    originalImage = global.Image;
  });

  afterEach(() => {
    global.Image = originalImage;
  });

  it('returns true for accessible images', async () => {
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
    };
    
    global.Image = vi.fn(() => mockImage) as any;
    
    const promise = isImageAccessible('https://example.com/image.jpg');
    
    mockImage.onload?.();
    
    const result = await promise;
    expect(result).toBe(true);
  });

  it('returns false for inaccessible images', async () => {
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
    };
    
    global.Image = vi.fn(() => mockImage) as any;
    
    const promise = isImageAccessible('https://example.com/broken.jpg');
    
    mockImage.onerror?.();
    
    const result = await promise;
    expect(result).toBe(false);
  });
});

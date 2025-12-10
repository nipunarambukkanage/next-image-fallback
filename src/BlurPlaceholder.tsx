import React, { CSSProperties } from 'react';

/**
 * Props for the BlurPlaceholder component
 */
export interface BlurPlaceholderProps {
  /** Width of the placeholder */
  width: number | string;
  /** Height of the placeholder */
  height: number | string;
  /** Base64 encoded blur data URL or a small image URL */
  blurDataURL?: string;
  /** Background color when no blurDataURL is provided */
  backgroundColor?: string;
  /** Blur intensity in pixels */
  blurAmount?: number;
  /** Border radius of the placeholder */
  borderRadius?: number | string;
  /** Additional className for custom styling */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
}

/**
 * Default blur placeholder settings
 */
const DEFAULT_BACKGROUND_COLOR = '#f0f0f0';
const DEFAULT_BLUR_AMOUNT = 20;

/**
 * Generates a simple gradient blur data URL
 */
export const generateBlurDataURL = (
  primaryColor: string = '#e0e0e0',
  secondaryColor: string = '#f5f5f5'
): string => {
  // Create a simple SVG with gradient as blur placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width="100" height="100" fill="url(#grad)" filter="url(#blur)" />
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generates inline styles for blur placeholder
 */
const getBlurStyles = (
  width: number | string,
  height: number | string,
  backgroundColor: string,
  blurAmount: number,
  borderRadius: number | string,
  blurDataURL?: string
): CSSProperties => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: typeof height === 'number' ? `${height}px` : height,
  backgroundColor,
  backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: `blur(${blurAmount}px)`,
  borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  overflow: 'hidden',
  transform: 'scale(1.1)', // Slightly scale up to hide blur edges
});

/**
 * Generates wrapper styles to contain the scaled blur
 */
const getWrapperStyles = (
  width: number | string,
  height: number | string,
  borderRadius: number | string
): CSSProperties => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: typeof height === 'number' ? `${height}px` : height,
  overflow: 'hidden',
  borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  position: 'relative',
});

/**
 * BlurPlaceholder component - A blurred image placeholder
 * 
 * @example
 * ```tsx
 * // With auto-generated blur
 * <BlurPlaceholder width={200} height={200} />
 * 
 * // With custom blur data URL
 * <BlurPlaceholder 
 *   width={200} 
 *   height={200} 
 *   blurDataURL="data:image/jpeg;base64,..." 
 * />
 * ```
 */
export const BlurPlaceholder: React.FC<BlurPlaceholderProps> = ({
  width,
  height,
  blurDataURL,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  blurAmount = DEFAULT_BLUR_AMOUNT,
  borderRadius = 4,
  className,
  alt = 'Loading image placeholder',
}) => {
  const effectiveBlurDataURL = blurDataURL || generateBlurDataURL();

  return (
    <div 
      className={className}
      style={getWrapperStyles(width, height, borderRadius)}
      role="img"
      aria-label={alt}
    >
      <div
        style={getBlurStyles(width, height, backgroundColor, blurAmount, borderRadius, effectiveBlurDataURL)}
        aria-hidden="true"
      />
    </div>
  );
};

/**
 * Hook to generate blur placeholder styles
 */
export const useBlurPlaceholder = (
  width: number | string,
  height: number | string,
  options?: {
    blurDataURL?: string;
    backgroundColor?: string;
    blurAmount?: number;
    borderRadius?: number | string;
  }
): {
  wrapperStyles: CSSProperties;
  blurStyles: CSSProperties;
  blurDataURL: string;
} => {
  const {
    blurDataURL,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
    blurAmount = DEFAULT_BLUR_AMOUNT,
    borderRadius = 4,
  } = options || {};

  const effectiveBlurDataURL = blurDataURL || generateBlurDataURL();

  return {
    wrapperStyles: getWrapperStyles(width, height, borderRadius),
    blurStyles: getBlurStyles(width, height, backgroundColor, blurAmount, borderRadius, effectiveBlurDataURL),
    blurDataURL: effectiveBlurDataURL,
  };
};

export default BlurPlaceholder;

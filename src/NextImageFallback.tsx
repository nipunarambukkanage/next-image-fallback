import Image, { type ImageProps } from 'next/image';
import React, { useEffect, useState, CSSProperties } from 'react';

/**
 * Alternative fallback type options for when both primary and fallback images fail
 */
export type AlternativeFallbackType = 'gradient' | 'waves' | 'mono';

/**
 * Alternative fallback constants for easy reference
 */
export const ALTERNATIVE_FALLBACK = {
  GRADIENT: 'gradient' as const,
  WAVES: 'waves' as const,
  MONO: 'mono' as const,
};

export interface NextImageFallbackProps extends ImageProps {
  /** Alternative image source to display when the primary one fails */
  fallbackSrc?: ImageProps['src'];
  /** Callback fired exactly once when switching to the fallback source */
  onFallback?: () => void;
  /** 
   * Alternative fallback type to display when both primary and fallback images fail.
   * Options: 'gradient' | 'waves' | 'mono'
   */
  alternativeFallback?: AlternativeFallbackType;
  /** Primary color for the alternative fallback background (supports hex, rgb, or named colors) */
  primaryAltColor?: string;
  /** Secondary color for the alternative fallback background (supports hex, rgb, or named colors) */
  secondaryAltColor?: string;
  /** Custom error message to display on the alternative fallback */
  altErrorMessage?: string;
  /** Text color for the error message (supports hex, rgb, or named colors) */
  altTextColor?: string;
  /** Callback fired when the alternative fallback is shown */
  onAlternativeFallback?: () => void;
}

/**
 * Default colors and messages for alternative fallbacks
 */
const DEFAULT_PRIMARY_COLOR = '#6366f1';
const DEFAULT_SECONDARY_COLOR = '#8b5cf6';
const DEFAULT_ERROR_MESSAGE = 'Image unavailable';
const DEFAULT_TEXT_COLOR = '#ffffff';

/**
 * Generates inline styles for gradient fallback
 */
const getGradientStyles = (
  primaryColor: string,
  secondaryColor: string,
  width: number | string,
  height: number | string
): CSSProperties => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: typeof height === 'number' ? `${height}px` : height,
  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  position: 'relative',
  overflow: 'hidden',
});

/**
 * Generates inline styles for waves fallback
 */
const getWavesStyles = (
  primaryColor: string,
  secondaryColor: string,
  width: number | string,
  height: number | string
): CSSProperties => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: typeof height === 'number' ? `${height}px` : height,
  background: `
    radial-gradient(ellipse at 50% 0%, ${primaryColor} 0%, transparent 50%),
    radial-gradient(ellipse at 100% 50%, ${secondaryColor} 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%, ${primaryColor} 0%, transparent 50%),
    radial-gradient(ellipse at 50% 100%, ${secondaryColor} 0%, transparent 50%),
    linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)
  `,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  position: 'relative',
  overflow: 'hidden',
});

/**
 * Generates inline styles for mono fallback
 */
const getMonoStyles = (
  primaryColor: string,
  width: number | string,
  height: number | string
): CSSProperties => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: typeof height === 'number' ? `${height}px` : height,
  backgroundColor: primaryColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  position: 'relative',
  overflow: 'hidden',
});

/**
 * Generates inline styles for error text
 */
const getTextStyles = (textColor: string, containerWidth: number | string): CSSProperties => ({
  color: textColor,
  fontSize: typeof containerWidth === 'number' && containerWidth < 100 ? '10px' : '14px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textAlign: 'center',
  padding: '8px',
  wordBreak: 'break-word',
  maxWidth: '90%',
  lineHeight: '1.4',
  fontWeight: 500,
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
});

/**
 * Generates inline styles for the icon
 */
const getIconStyles = (): CSSProperties => ({
  marginBottom: '4px',
  opacity: 0.8,
});

/**
 * Alternative Fallback Placeholder Component
 */
const AlternativeFallbackPlaceholder: React.FC<{
  type: AlternativeFallbackType;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  errorMessage: string;
  width: number | string;
  height: number | string;
}> = ({ type, primaryColor, secondaryColor, textColor, errorMessage, width, height }) => {
  const getContainerStyles = (): CSSProperties => {
    switch (type) {
      case 'gradient':
        return getGradientStyles(primaryColor, secondaryColor, width, height);
      case 'waves':
        return getWavesStyles(primaryColor, secondaryColor, width, height);
      case 'mono':
        return getMonoStyles(primaryColor, width, height);
      default:
        return getGradientStyles(primaryColor, secondaryColor, width, height);
    }
  };

  const showIcon = typeof width === 'number' ? width >= 60 : true;
  const showText = typeof width === 'number' ? width >= 80 : true;

  return (
    <div style={getContainerStyles()} role="img" aria-label={errorMessage}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {showIcon && (
          <svg
            aria-hidden="true"
            style={getIconStyles()}
            width={typeof width === 'number' && width < 100 ? '16' : '24'}
            height={typeof width === 'number' && width < 100 ? '16' : '24'}
            viewBox="0 0 24 24"
            fill="none"
            stroke={textColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        )}
        {showText && (
          <span style={getTextStyles(textColor, width)}>{errorMessage}</span>
        )}
      </div>
    </div>
  );
};

export const NextImageFallback: React.FC<NextImageFallbackProps> = (props) => {
  const {
    src,
    fallbackSrc,
    onFallback,
    onError,
    onLoadingComplete,
    alternativeFallback,
    primaryAltColor = DEFAULT_PRIMARY_COLOR,
    secondaryAltColor = DEFAULT_SECONDARY_COLOR,
    altErrorMessage = DEFAULT_ERROR_MESSAGE,
    altTextColor = DEFAULT_TEXT_COLOR,
    onAlternativeFallback,
    width,
    height,
    ...rest
  } = props;

  const [currentSrc, setCurrentSrc] = useState<ImageProps['src']>(src);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [showAlternativeFallback, setShowAlternativeFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasTriedFallback(false);
    setShowAlternativeFallback(false);
  }, [src]);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    if (fallbackSrc && !hasTriedFallback && currentSrc !== fallbackSrc) {
      // Try the fallback image first
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
      if (onFallback) onFallback();
    } else if (hasTriedFallback && alternativeFallback) {
      // Both primary and fallback failed, show alternative fallback
      setShowAlternativeFallback(true);
      if (onAlternativeFallback) onAlternativeFallback();
    } else if (!fallbackSrc && alternativeFallback) {
      // No fallback provided but alternative fallback is set
      setShowAlternativeFallback(true);
      if (onAlternativeFallback) onAlternativeFallback();
    }

    if (onError) {
      onError(event);
    }
  };

  const handleLoadingComplete = (result: { naturalWidth: number; naturalHeight: number }) => {
    if (
      result.naturalWidth === 0 &&
      fallbackSrc &&
      !hasTriedFallback &&
      currentSrc !== fallbackSrc
    ) {
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
      if (onFallback) onFallback();
      return;
    }

    if (
      result.naturalWidth === 0 &&
      hasTriedFallback &&
      alternativeFallback
    ) {
      setShowAlternativeFallback(true);
      if (onAlternativeFallback) onAlternativeFallback();
      return;
    }

    if (onLoadingComplete) {
      onLoadingComplete(result as any);
    }
  };

  // Show alternative fallback placeholder if both images failed
  if (showAlternativeFallback && alternativeFallback) {
    return (
      <AlternativeFallbackPlaceholder
        type={alternativeFallback}
        primaryColor={primaryAltColor}
        secondaryColor={secondaryAltColor}
        textColor={altTextColor}
        errorMessage={altErrorMessage}
        width={width || 100}
        height={height || 100}
      />
    );
  }

  return (
    <Image
      {...rest}
      src={currentSrc}
      width={width}
      height={height}
      onError={handleError}
      onLoadingComplete={handleLoadingComplete}
    />
  );
};

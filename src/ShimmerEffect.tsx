import React, { CSSProperties } from 'react';

/**
 * Props for the ShimmerEffect component
 */
export interface ShimmerEffectProps {
  /** Width of the shimmer placeholder */
  width: number | string;
  /** Height of the shimmer placeholder */
  height: number | string;
  /** Base color of the shimmer effect */
  baseColor?: string;
  /** Highlight color of the shimmer animation */
  highlightColor?: string;
  /** Duration of the shimmer animation in seconds */
  duration?: number;
  /** Border radius of the shimmer placeholder */
  borderRadius?: number | string;
  /** Additional className for custom styling */
  className?: string;
}

/**
 * Default shimmer colors
 */
const DEFAULT_BASE_COLOR = '#e0e0e0';
const DEFAULT_HIGHLIGHT_COLOR = '#f5f5f5';
const DEFAULT_DURATION = 1.5;

/**
 * Generates keyframe animation styles for shimmer effect
 */
const getShimmerKeyframes = (): string => `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

/**
 * Generates inline styles for shimmer container
 */
const getShimmerStyles = (
  width: number | string,
  height: number | string,
  baseColor: string,
  highlightColor: string,
  duration: number,
  borderRadius: number | string
): CSSProperties => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: typeof height === 'number' ? `${height}px` : height,
  background: `linear-gradient(
    90deg,
    ${baseColor} 0%,
    ${baseColor} 40%,
    ${highlightColor} 50%,
    ${baseColor} 60%,
    ${baseColor} 100%
  )`,
  backgroundSize: '200% 100%',
  animation: `shimmer ${duration}s infinite linear`,
  borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  overflow: 'hidden',
});

/**
 * ShimmerEffect component - A loading placeholder with shimmer animation
 * 
 * @example
 * ```tsx
 * <ShimmerEffect width={200} height={200} />
 * ```
 */
export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  width,
  height,
  baseColor = DEFAULT_BASE_COLOR,
  highlightColor = DEFAULT_HIGHLIGHT_COLOR,
  duration = DEFAULT_DURATION,
  borderRadius = 4,
  className,
}) => {
  return (
    <>
      <style>{getShimmerKeyframes()}</style>
      <div
        className={className}
        style={getShimmerStyles(width, height, baseColor, highlightColor, duration, borderRadius)}
        role="progressbar"
        aria-label="Loading image"
        aria-busy="true"
      />
    </>
  );
};

/**
 * Hook to get shimmer styles for custom implementations
 */
export const useShimmerStyles = (
  width: number | string,
  height: number | string,
  options?: {
    baseColor?: string;
    highlightColor?: string;
    duration?: number;
    borderRadius?: number | string;
  }
): { styles: CSSProperties; keyframes: string } => {
  const {
    baseColor = DEFAULT_BASE_COLOR,
    highlightColor = DEFAULT_HIGHLIGHT_COLOR,
    duration = DEFAULT_DURATION,
    borderRadius = 4,
  } = options || {};

  return {
    styles: getShimmerStyles(width, height, baseColor, highlightColor, duration, borderRadius),
    keyframes: getShimmerKeyframes(),
  };
};

export default ShimmerEffect;

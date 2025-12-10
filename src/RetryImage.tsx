'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

/**
 * Configuration options for retry behavior
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;
  
  /**
   * Whether to use exponential backoff for retry delays
   * @default true
   */
  exponentialBackoff?: boolean;
  
  /**
   * Maximum delay between retries when using exponential backoff (in ms)
   * @default 10000
   */
  maxDelay?: number;
}

/**
 * State information for retry status
 */
export interface RetryState {
  /** Current number of retry attempts */
  attempts: number;
  /** Whether a retry is currently in progress */
  isRetrying: boolean;
  /** Whether the image has successfully loaded */
  hasLoaded: boolean;
  /** Whether all retries have been exhausted */
  hasExhaustedRetries: boolean;
}

export interface RetryImageProps extends Omit<ImageProps, 'onError'> {
  /**
   * Retry configuration options
   */
  retryConfig?: RetryConfig;
  
  /**
   * Fallback image source to use after all retries are exhausted
   */
  fallbackSrc?: string;
  
  /**
   * Callback when the image fails to load (called on each failure)
   */
  onError?: (error: Error, retryState: RetryState) => void;
  
  /**
   * Callback when retry is triggered
   */
  onRetry?: (attempt: number, maxRetries: number) => void;
  
  /**
   * Callback when all retries are exhausted
   */
  onRetriesExhausted?: () => void;
  
  /**
   * Callback when the image finally loads successfully
   */
  onSuccess?: (attemptNumber: number) => void;
  
  /**
   * Custom loading component to show while retrying
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Whether to show retry indicator
   * @default true
   */
  showRetryIndicator?: boolean;
  
  /**
   * Custom retry indicator component
   */
  retryIndicator?: (state: RetryState) => React.ReactNode;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  maxDelay: 10000,
};

/**
 * Calculates the delay for a retry attempt
 */
const calculateDelay = (
  attempt: number,
  baseDelay: number,
  exponential: boolean,
  maxDelay: number
): number => {
  if (!exponential) return baseDelay;
  const delay = baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, maxDelay);
};

/**
 * RetryImage component that automatically retries loading failed images
 * with configurable retry logic and exponential backoff support.
 */
export const RetryImage: React.FC<RetryImageProps> = ({
  src,
  alt,
  fallbackSrc,
  retryConfig = {},
  onError,
  onRetry,
  onRetriesExhausted,
  onSuccess,
  loadingComponent,
  showRetryIndicator = true,
  retryIndicator,
  ...props
}) => {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(
    typeof src === 'string' ? src : undefined
  );
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasExhaustedRetries, setHasExhaustedRetries] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originalSrc = useRef(typeof src === 'string' ? src : undefined);
  
  // Update original src when prop changes
  useEffect(() => {
    const newSrc = typeof src === 'string' ? src : undefined;
    if (newSrc !== originalSrc.current) {
      originalSrc.current = newSrc;
      setCurrentSrc(newSrc);
      setAttempts(0);
      setHasLoaded(false);
      setHasExhaustedRetries(false);
      setIsRetrying(false);
    }
  }, [src]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const getRetryState = useCallback((): RetryState => ({
    attempts,
    isRetrying,
    hasLoaded,
    hasExhaustedRetries,
  }), [attempts, isRetrying, hasLoaded, hasExhaustedRetries]);
  
  const handleError = useCallback(() => {
    const newAttempts = attempts + 1;
    const retryState: RetryState = {
      attempts: newAttempts,
      isRetrying: false,
      hasLoaded: false,
      hasExhaustedRetries: newAttempts >= config.maxRetries,
    };
    
    // Call onError callback
    onError?.(new Error(`Image failed to load: ${currentSrc}`), retryState);
    
    if (newAttempts < config.maxRetries) {
      // Schedule retry
      setAttempts(newAttempts);
      setIsRetrying(true);
      
      const delay = calculateDelay(
        newAttempts,
        config.retryDelay,
        config.exponentialBackoff,
        config.maxDelay
      );
      
      onRetry?.(newAttempts, config.maxRetries);
      
      timeoutRef.current = setTimeout(() => {
        setIsRetrying(false);
        // Force image reload by appending timestamp
        const separator = originalSrc.current?.includes('?') ? '&' : '?';
        setCurrentSrc(`${originalSrc.current}${separator}_retry=${Date.now()}`);
      }, delay);
    } else {
      // All retries exhausted
      setAttempts(newAttempts);
      setHasExhaustedRetries(true);
      onRetriesExhausted?.();
      
      // Switch to fallback if provided
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    }
  }, [
    attempts,
    config.maxRetries,
    config.retryDelay,
    config.exponentialBackoff,
    config.maxDelay,
    currentSrc,
    fallbackSrc,
    onError,
    onRetry,
    onRetriesExhausted,
  ]);
  
  const handleLoad = useCallback(() => {
    setHasLoaded(true);
    setIsRetrying(false);
    onSuccess?.(attempts);
  }, [attempts, onSuccess]);
  
  // Render retry indicator
  const renderRetryIndicator = () => {
    if (!showRetryIndicator || !isRetrying) return null;
    
    if (retryIndicator) {
      return retryIndicator(getRetryState());
    }
    
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          fontSize: '14px',
          zIndex: 1,
        }}
        role="status"
        aria-label={`Retrying image load, attempt ${attempts} of ${config.maxRetries}`}
      >
        <span>Retrying... ({attempts}/{config.maxRetries})</span>
      </div>
    );
  };
  
  // Show loading component while retrying
  if (isRetrying && loadingComponent) {
    return <>{loadingComponent}</>;
  }
  
  // Handle non-string src (StaticImageData)
  const imageSrc = currentSrc || src;
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
      />
      {renderRetryIndicator()}
    </div>
  );
};

/**
 * Custom hook for managing image retry logic
 * Can be used independently of the RetryImage component
 */
export const useImageRetry = (
  initialSrc: string,
  config: RetryConfig = {}
) => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  const [src, setSrc] = useState(initialSrc);
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasExhaustedRetries, setHasExhaustedRetries] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const originalSrc = useRef(initialSrc);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const reset = useCallback(() => {
    setSrc(originalSrc.current);
    setAttempts(0);
    setIsRetrying(false);
    setHasLoaded(false);
    setHasExhaustedRetries(false);
    setError(null);
  }, []);
  
  const retry = useCallback(() => {
    const newAttempts = attempts + 1;
    
    if (newAttempts >= finalConfig.maxRetries) {
      setHasExhaustedRetries(true);
      return false;
    }
    
    setAttempts(newAttempts);
    setIsRetrying(true);
    
    const delay = calculateDelay(
      newAttempts,
      finalConfig.retryDelay,
      finalConfig.exponentialBackoff,
      finalConfig.maxDelay
    );
    
    timeoutRef.current = setTimeout(() => {
      setIsRetrying(false);
      const separator = originalSrc.current.includes('?') ? '&' : '?';
      setSrc(`${originalSrc.current}${separator}_retry=${Date.now()}`);
    }, delay);
    
    return true;
  }, [attempts, finalConfig]);
  
  const handleError = useCallback((err?: Error) => {
    setError(err || new Error('Image failed to load'));
    retry();
  }, [retry]);
  
  const handleLoad = useCallback(() => {
    setHasLoaded(true);
    setIsRetrying(false);
    setError(null);
  }, []);
  
  return {
    src,
    attempts,
    isRetrying,
    hasLoaded,
    hasExhaustedRetries,
    error,
    reset,
    retry,
    handleError,
    handleLoad,
    maxRetries: finalConfig.maxRetries,
  };
};

export default RetryImage;

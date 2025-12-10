import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { RetryImage, useImageRetry, RetryConfig, RetryState } from '../src/RetryImage';
import React from 'react';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, onError, onLoad, ...props }: any) => (
    <img
      src={typeof src === 'string' ? src : src?.src}
      alt={alt}
      onError={onError}
      onLoad={onLoad}
      data-testid="next-image"
      {...props}
    />
  ),
}));

describe('RetryImage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders image with correct src and alt', () => {
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const img = screen.getByTestId('next-image') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://example.com/image.jpg');
    expect(img.getAttribute('alt')).toBe('Test image');
  });

  it('retries on image error with default config', async () => {
    const onRetry = vi.fn();
    
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        onRetry={onRetry}
      />
    );

    const img = screen.getByTestId('next-image');
    
    // Trigger error
    await act(async () => {
      fireEvent.error(img);
    });

    expect(onRetry).toHaveBeenCalledWith(1, 3);
    
    // Fast forward past retry delay
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Image src should be updated with retry parameter
    expect(img.getAttribute('src')).toContain('_retry=');
  });

  it('calls onError callback with retry state', async () => {
    const onError = vi.fn();
    
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        onError={onError}
      />
    );

    const img = screen.getByTestId('next-image');
    
    await act(async () => {
      fireEvent.error(img);
    });

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        attempts: 1,
        hasLoaded: false,
      })
    );
  });

  it('uses exponential backoff by default', async () => {
    const onRetry = vi.fn();
    
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        retryConfig={{ maxRetries: 4 }}
        onRetry={onRetry}
      />
    );

    const img = screen.getByTestId('next-image');
    
    // First error - 1000ms delay
    await act(async () => {
      fireEvent.error(img);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    
    // Second error - 2000ms delay
    await act(async () => {
      fireEvent.error(img);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    
    // Third error - 4000ms delay
    await act(async () => {
      fireEvent.error(img);
    });
    
    expect(onRetry).toHaveBeenCalledTimes(3);
  });

  it('calls onRetriesExhausted when max retries reached', async () => {
    const onRetriesExhausted = vi.fn();
    
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        retryConfig={{ maxRetries: 2 }}
        onRetriesExhausted={onRetriesExhausted}
      />
    );

    const img = screen.getByTestId('next-image');
    
    // First error
    await act(async () => {
      fireEvent.error(img);
      vi.advanceTimersByTime(1000);
    });
    
    // Second error - exhausts retries
    await act(async () => {
      fireEvent.error(img);
    });

    expect(onRetriesExhausted).toHaveBeenCalled();
  });

  it('switches to fallback after retries exhausted', async () => {
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        retryConfig={{ maxRetries: 1 }}
        fallbackSrc="https://example.com/fallback.jpg"
      />
    );

    const img = screen.getByTestId('next-image') as HTMLImageElement;
    
    // Exhaust retries
    await act(async () => {
      fireEvent.error(img);
    });

    expect(img.getAttribute('src')).toBe('https://example.com/fallback.jpg');
  });

  it('calls onSuccess when image loads', async () => {
    const onSuccess = vi.fn();
    
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        onSuccess={onSuccess}
      />
    );

    const img = screen.getByTestId('next-image');
    
    await act(async () => {
      fireEvent.load(img);
    });

    expect(onSuccess).toHaveBeenCalledWith(0);
  });

  it('shows retry indicator when retrying', async () => {
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        showRetryIndicator={true}
      />
    );

    const img = screen.getByTestId('next-image');
    
    await act(async () => {
      fireEvent.error(img);
    });

    expect(screen.getByText(/Retrying/)).toBeTruthy();
  });

  it('hides retry indicator when showRetryIndicator is false', async () => {
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        showRetryIndicator={false}
      />
    );

    const img = screen.getByTestId('next-image');
    
    await act(async () => {
      fireEvent.error(img);
    });

    expect(screen.queryByText(/Retrying/)).toBeNull();
  });

  it('uses custom retry indicator when provided', async () => {
    const customIndicator = (state: RetryState) => (
      <div data-testid="custom-indicator">
        Custom: Attempt {state.attempts}
      </div>
    );
    
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        retryIndicator={customIndicator}
      />
    );

    const img = screen.getByTestId('next-image');
    
    await act(async () => {
      fireEvent.error(img);
    });

    expect(screen.getByTestId('custom-indicator')).toBeTruthy();
    expect(screen.getByText(/Custom: Attempt 1/)).toBeTruthy();
  });

  it('shows loading component while retrying', async () => {
    const LoadingComponent = () => <div data-testid="loading">Loading...</div>;
    
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        loadingComponent={<LoadingComponent />}
      />
    );

    const img = screen.getByTestId('next-image');
    
    await act(async () => {
      fireEvent.error(img);
    });

    expect(screen.getByTestId('loading')).toBeTruthy();
  });

  it('respects custom retry config', async () => {
    const onRetry = vi.fn();
    
    render(
      <RetryImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
        retryConfig={{
          maxRetries: 5,
          retryDelay: 500,
          exponentialBackoff: false,
        }}
        onRetry={onRetry}
      />
    );

    const img = screen.getByTestId('next-image');
    
    await act(async () => {
      fireEvent.error(img);
    });

    expect(onRetry).toHaveBeenCalledWith(1, 5);
    
    // With exponentialBackoff: false, delay should always be 500ms
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(img.getAttribute('src')).toContain('_retry=');
  });

  it('resets state when src prop changes', async () => {
    const { rerender } = render(
      <RetryImage
        src="https://example.com/image1.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const img = screen.getByTestId('next-image');
    
    // Trigger error
    await act(async () => {
      fireEvent.error(img);
    });
    
    // Change src
    rerender(
      <RetryImage
        src="https://example.com/image2.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    // Should not show retry indicator for new src
    expect(screen.queryByText(/Retrying/)).toBeNull();
  });
});

describe('useImageRetry hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const TestComponent = ({ config }: { config?: RetryConfig }) => {
    const {
      src,
      attempts,
      isRetrying,
      hasLoaded,
      hasExhaustedRetries,
      handleError,
      handleLoad,
      reset,
    } = useImageRetry('https://example.com/image.jpg', config);

    return (
      <div>
        <img
          src={src}
          alt="test"
          data-testid="hook-image"
          onError={() => handleError()}
          onLoad={handleLoad}
        />
        <span data-testid="attempts">{attempts}</span>
        <span data-testid="is-retrying">{isRetrying.toString()}</span>
        <span data-testid="has-loaded">{hasLoaded.toString()}</span>
        <span data-testid="exhausted">{hasExhaustedRetries.toString()}</span>
        <button onClick={reset} data-testid="reset">Reset</button>
      </div>
    );
  };

  it('provides initial state correctly', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('attempts').textContent).toBe('0');
    expect(screen.getByTestId('is-retrying').textContent).toBe('false');
    expect(screen.getByTestId('has-loaded').textContent).toBe('false');
    expect(screen.getByTestId('exhausted').textContent).toBe('false');
  });

  it('updates state on error', async () => {
    render(<TestComponent />);

    const img = screen.getByTestId('hook-image');
    
    await act(async () => {
      fireEvent.error(img);
    });

    expect(screen.getByTestId('attempts').textContent).toBe('1');
    expect(screen.getByTestId('is-retrying').textContent).toBe('true');
  });

  it('updates state on load', async () => {
    render(<TestComponent />);

    const img = screen.getByTestId('hook-image');
    
    await act(async () => {
      fireEvent.load(img);
    });

    expect(screen.getByTestId('has-loaded').textContent).toBe('true');
  });

  it('resets state when reset is called', async () => {
    render(<TestComponent />);

    const img = screen.getByTestId('hook-image');
    
    await act(async () => {
      fireEvent.error(img);
    });

    expect(screen.getByTestId('attempts').textContent).toBe('1');

    await act(async () => {
      fireEvent.click(screen.getByTestId('reset'));
    });

    expect(screen.getByTestId('attempts').textContent).toBe('0');
    expect(screen.getByTestId('is-retrying').textContent).toBe('false');
  });

  it('marks exhausted after max retries', async () => {
    render(<TestComponent config={{ maxRetries: 2 }} />);

    const img = screen.getByTestId('hook-image');
    
    // First error
    await act(async () => {
      fireEvent.error(img);
      vi.advanceTimersByTime(1000);
    });

    // Second error - exhausts retries
    await act(async () => {
      fireEvent.error(img);
    });

    expect(screen.getByTestId('exhausted').textContent).toBe('true');
  });
});

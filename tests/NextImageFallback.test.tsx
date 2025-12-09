import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { NextImageFallback, ALTERNATIVE_FALLBACK } from '../src/NextImageFallback';

vi.mock('next/image', () => {
  return {
    __esModule: true,
    default: ({ onLoadingComplete, onLoad, ...props }: any) => (
      <img
        {...props}
        onLoad={(event) => {
          const target = event.currentTarget as HTMLImageElement;
          if (onLoadingComplete) {
            onLoadingComplete({
              naturalWidth: target.naturalWidth,
              naturalHeight: target.naturalHeight,
            });
          }
          if (onLoad) onLoad(event);
        }}
      />
    ),
  };
});

describe('NextImageFallback', () => {
  it('renders with initial src', () => {
    const { getByRole } = render(<NextImageFallback src="/primary.png" alt="test" width={100} height={100} />);
    const img = getByRole('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toContain('/primary.png');
  });

  it('switches to fallback on error and calls onFallback', async () => {
    const onFallback = vi.fn();
    const { getByRole } = render(
      <NextImageFallback
        src="/primary.png"
        fallbackSrc="/fallback.png"
        alt="test"
        width={100}
        height={100}
        onFallback={onFallback}
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    fireEvent.error(img);

    await waitFor(() => expect(img.getAttribute('src')).toContain('/fallback.png'));
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  it('stays on original src when no fallback provided', async () => {
    const { getByRole } = render(<NextImageFallback src="/primary.png" alt="test" width={100} height={100} />);
    const img = getByRole('img') as HTMLImageElement;

    fireEvent.error(img);

    await waitFor(() => expect(img.getAttribute('src')).toContain('/primary.png'));
  });

  it('resets when src prop changes', async () => {
    const { getByRole, rerender } = render(
      <NextImageFallback
        src="/primary.png"
        fallbackSrc="/fallback.png"
        alt="test"
        width={100}
        height={100}
      />
    );
    const img = getByRole('img') as HTMLImageElement;

    fireEvent.error(img);
    await waitFor(() => expect(img.getAttribute('src')).toContain('/fallback.png'));

    rerender(
      <NextImageFallback
        src="/new.png"
        fallbackSrc="/fallback.png"
        alt="test"
        width={100}
        height={100}
      />
    );

    await waitFor(() => expect(img.getAttribute('src')).toContain('/new.png'));
  });

  it('does not flip infinitely when fallback also fails', async () => {
    const onFallback = vi.fn();
    const { getByRole } = render(
      <NextImageFallback
        src="/primary.png"
        fallbackSrc="/fallback.png"
        alt="test"
        width={100}
        height={100}
        onFallback={onFallback}
      />
    );
    const img = getByRole('img') as HTMLImageElement;

    fireEvent.error(img);
    await waitFor(() => expect(img.getAttribute('src')).toContain('/fallback.png'));

    fireEvent.error(img);
    await waitFor(() => expect(img.getAttribute('src')).toContain('/fallback.png'));
    expect(onFallback).toHaveBeenCalledTimes(1);
  });
});

describe('NextImageFallback - Alternative Fallback', () => {
  it('shows gradient alternative fallback when both primary and fallback fail', async () => {
    const onAlternativeFallback = vi.fn();
    const { getByRole, container } = render(
      <NextImageFallback
        src="/primary.png"
        fallbackSrc="/fallback.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback="gradient"
        onAlternativeFallback={onAlternativeFallback}
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    // First error - switches to fallback
    fireEvent.error(img);
    await waitFor(() => expect(img.getAttribute('src')).toContain('/fallback.png'));

    // Second error - shows alternative fallback
    fireEvent.error(img);
    
    await waitFor(() => {
      const placeholder = container.querySelector('[role="img"]') as HTMLElement;
      expect(placeholder).toBeTruthy();
      expect(placeholder.style.background).toContain('linear-gradient');
    });
    expect(onAlternativeFallback).toHaveBeenCalledTimes(1);
  });

  it('shows waves alternative fallback with custom colors', async () => {
    const { getByRole, container } = render(
      <NextImageFallback
        src="/primary.png"
        fallbackSrc="/fallback.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback="waves"
        primaryAltColor="#ff0000"
        secondaryAltColor="#00ff00"
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    await waitFor(() => expect(img.getAttribute('src')).toContain('/fallback.png'));

    fireEvent.error(img);
    
    await waitFor(() => {
      const placeholder = container.querySelector('[role="img"]') as HTMLElement;
      expect(placeholder).toBeTruthy();
      // Waves uses radial-gradient - check the placeholder rendered correctly
      expect(placeholder.style.width).toBe('200px');
      expect(placeholder.style.height).toBe('200px');
    });
  });

  it('shows mono alternative fallback', async () => {
    const { getByRole, container } = render(
      <NextImageFallback
        src="/primary.png"
        fallbackSrc="/fallback.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback="mono"
        primaryAltColor="#333333"
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    await waitFor(() => expect(img.getAttribute('src')).toContain('/fallback.png'));

    fireEvent.error(img);
    
    await waitFor(() => {
      const placeholder = container.querySelector('[role="img"]') as HTMLElement;
      expect(placeholder).toBeTruthy();
      expect(placeholder.style.backgroundColor).toBe('rgb(51, 51, 51)');
    });
  });

  it('displays custom error message on alternative fallback', async () => {
    const customMessage = 'Custom error message';
    const { getByRole, getByText } = render(
      <NextImageFallback
        src="/primary.png"
        fallbackSrc="/fallback.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback="gradient"
        altErrorMessage={customMessage}
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    fireEvent.error(img);
    
    await waitFor(() => {
      expect(getByText(customMessage)).toBeTruthy();
    });
  });

  it('shows alternative fallback immediately when no fallbackSrc provided', async () => {
    const onAlternativeFallback = vi.fn();
    const { getByRole, container } = render(
      <NextImageFallback
        src="/primary.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback="gradient"
        onAlternativeFallback={onAlternativeFallback}
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    
    await waitFor(() => {
      const placeholder = container.querySelector('[role="img"]') as HTMLElement;
      expect(placeholder).toBeTruthy();
      expect(placeholder.style.background).toContain('linear-gradient');
    });
    expect(onAlternativeFallback).toHaveBeenCalledTimes(1);
  });

  it('uses ALTERNATIVE_FALLBACK constants', async () => {
    const { getByRole, container } = render(
      <NextImageFallback
        src="/primary.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback={ALTERNATIVE_FALLBACK.GRADIENT}
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    
    await waitFor(() => {
      const placeholder = container.querySelector('[role="img"]') as HTMLElement;
      expect(placeholder).toBeTruthy();
    });
  });

  it('applies custom text color to error message', async () => {
    const { getByRole, getByText } = render(
      <NextImageFallback
        src="/primary.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback="gradient"
        altTextColor="#ffcc00"
        altErrorMessage="Test message"
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    
    await waitFor(() => {
      const textElement = getByText('Test message');
      expect(textElement.style.color).toBe('rgb(255, 204, 0)');
    });
  });

  it('respects width and height props for alternative fallback', async () => {
    const { getByRole, container } = render(
      <NextImageFallback
        src="/primary.png"
        alt="test"
        width={300}
        height={150}
        alternativeFallback="gradient"
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    
    await waitFor(() => {
      const placeholder = container.querySelector('[role="img"]') as HTMLElement;
      expect(placeholder.style.width).toBe('300px');
      expect(placeholder.style.height).toBe('150px');
    });
  });

  it('resets alternative fallback when src changes', async () => {
    const { getByRole, container, rerender } = render(
      <NextImageFallback
        src="/primary.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback="gradient"
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    
    await waitFor(() => {
      const placeholder = container.querySelector('[role="img"]') as HTMLElement;
      expect(placeholder.style.background).toContain('linear-gradient');
    });

    rerender(
      <NextImageFallback
        src="/new.png"
        alt="test"
        width={200}
        height={200}
        alternativeFallback="gradient"
      />
    );

    await waitFor(() => {
      const newImg = getByRole('img') as HTMLImageElement;
      expect(newImg.getAttribute('src')).toContain('/new.png');
    });
  });

  it('hides text on small width placeholders', async () => {
    const { getByRole, container, queryByText } = render(
      <NextImageFallback
        src="/primary.png"
        alt="test"
        width={50}
        height={50}
        alternativeFallback="gradient"
        altErrorMessage="This should be hidden"
      />
    );

    const img = getByRole('img') as HTMLImageElement;
    
    fireEvent.error(img);
    
    await waitFor(() => {
      const placeholder = container.querySelector('[role="img"]') as HTMLElement;
      expect(placeholder).toBeTruthy();
    });
    
    expect(queryByText('This should be hidden')).toBeNull();
  });
});

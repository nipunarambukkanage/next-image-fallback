import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { NextImageFallback } from '../src/NextImageFallback';

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

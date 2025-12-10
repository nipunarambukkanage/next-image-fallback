import { render } from '@testing-library/react';
import React from 'react';
import { ShimmerEffect, useShimmerStyles } from '../src/ShimmerEffect';

describe('ShimmerEffect', () => {
  it('renders with default props', () => {
    const { container } = render(<ShimmerEffect width={200} height={200} />);
    const shimmer = container.querySelector('[role="progressbar"]');
    expect(shimmer).toBeTruthy();
    expect(shimmer?.getAttribute('aria-busy')).toBe('true');
  });

  it('applies correct dimensions', () => {
    const { container } = render(<ShimmerEffect width={300} height={150} />);
    const shimmer = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(shimmer.style.width).toBe('300px');
    expect(shimmer.style.height).toBe('150px');
  });

  it('applies custom colors', () => {
    const { container } = render(
      <ShimmerEffect
        width={200}
        height={200}
        baseColor="#cccccc"
        highlightColor="#ffffff"
      />
    );
    const shimmer = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(shimmer.style.background).toContain('#cccccc');
    expect(shimmer.style.background).toContain('#ffffff');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ShimmerEffect width={200} height={200} className="custom-shimmer" />
    );
    const shimmer = container.querySelector('.custom-shimmer');
    expect(shimmer).toBeTruthy();
  });

  it('handles string dimensions', () => {
    const { container } = render(<ShimmerEffect width="100%" height="50vh" />);
    const shimmer = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(shimmer.style.width).toBe('100%');
    expect(shimmer.style.height).toBe('50vh');
  });

  it('applies custom border radius', () => {
    const { container } = render(<ShimmerEffect width={200} height={200} borderRadius={8} />);
    const shimmer = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(shimmer.style.borderRadius).toBe('8px');
  });

  it('injects keyframe styles', () => {
    const { container } = render(<ShimmerEffect width={200} height={200} />);
    const style = container.querySelector('style');
    expect(style?.textContent).toContain('@keyframes shimmer');
  });
});

describe('useShimmerStyles', () => {
  it('returns styles and keyframes', () => {
    const TestComponent = () => {
      const { styles, keyframes } = useShimmerStyles(200, 200);
      return (
        <div>
          <div data-testid="styles">{JSON.stringify(styles)}</div>
          <div data-testid="keyframes">{keyframes}</div>
        </div>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    const styles = JSON.parse(getByTestId('styles').textContent || '{}');
    expect(styles.width).toBe('200px');
    expect(styles.height).toBe('200px');
    expect(getByTestId('keyframes').textContent).toContain('@keyframes shimmer');
  });

  it('accepts custom options', () => {
    const TestComponent = () => {
      const { styles } = useShimmerStyles(200, 200, {
        baseColor: '#000000',
        highlightColor: '#111111',
        duration: 2,
        borderRadius: 10,
      });
      return <div data-testid="styles">{JSON.stringify(styles)}</div>;
    };

    const { getByTestId } = render(<TestComponent />);
    const styles = JSON.parse(getByTestId('styles').textContent || '{}');
    expect(styles.background).toContain('#000000');
    expect(styles.borderRadius).toBe('10px');
  });
});

import { render } from '@testing-library/react';
import React from 'react';
import { BlurPlaceholder, useBlurPlaceholder, generateBlurDataURL } from '../src/BlurPlaceholder';

describe('BlurPlaceholder', () => {
  it('renders with default props', () => {
    const { container } = render(<BlurPlaceholder width={200} height={200} />);
    const placeholder = container.querySelector('[role="img"]');
    expect(placeholder).toBeTruthy();
  });

  it('applies correct dimensions', () => {
    const { container } = render(<BlurPlaceholder width={300} height={150} />);
    const wrapper = container.querySelector('[role="img"]') as HTMLElement;
    expect(wrapper.style.width).toBe('300px');
    expect(wrapper.style.height).toBe('150px');
  });

  it('applies custom blur amount', () => {
    const { container } = render(<BlurPlaceholder width={200} height={200} blurAmount={30} />);
    const blurDiv = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(blurDiv.style.filter).toBe('blur(30px)');
  });

  it('applies custom className', () => {
    const { container } = render(
      <BlurPlaceholder width={200} height={200} className="custom-blur" />
    );
    const placeholder = container.querySelector('.custom-blur');
    expect(placeholder).toBeTruthy();
  });

  it('handles string dimensions', () => {
    const { container } = render(<BlurPlaceholder width="100%" height="50vh" />);
    const wrapper = container.querySelector('[role="img"]') as HTMLElement;
    expect(wrapper.style.width).toBe('100%');
    expect(wrapper.style.height).toBe('50vh');
  });

  it('applies custom border radius', () => {
    const { container } = render(<BlurPlaceholder width={200} height={200} borderRadius={16} />);
    const wrapper = container.querySelector('[role="img"]') as HTMLElement;
    expect(wrapper.style.borderRadius).toBe('16px');
  });

  it('uses custom alt text', () => {
    const { container } = render(
      <BlurPlaceholder width={200} height={200} alt="Custom loading text" />
    );
    const placeholder = container.querySelector('[role="img"]');
    expect(placeholder?.getAttribute('aria-label')).toBe('Custom loading text');
  });

  it('applies custom background color', () => {
    const { container } = render(
      <BlurPlaceholder width={200} height={200} backgroundColor="#cccccc" />
    );
    const blurDiv = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(blurDiv.style.backgroundColor).toBe('rgb(204, 204, 204)');
  });

  it('uses provided blurDataURL', () => {
    const customDataURL = 'data:image/png;base64,test';
    const { container } = render(
      <BlurPlaceholder width={200} height={200} blurDataURL={customDataURL} />
    );
    const blurDiv = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(blurDiv.style.backgroundImage).toContain(customDataURL);
  });
});

describe('generateBlurDataURL', () => {
  it('generates a valid data URL', () => {
    const dataURL = generateBlurDataURL();
    expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('accepts custom colors', () => {
    const dataURL = generateBlurDataURL('#ff0000', '#00ff00');
    expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});

describe('useBlurPlaceholder', () => {
  it('returns styles and blurDataURL', () => {
    const TestComponent = () => {
      const { wrapperStyles, blurStyles, blurDataURL } = useBlurPlaceholder(200, 200);
      return (
        <div>
          <div data-testid="wrapper">{JSON.stringify(wrapperStyles)}</div>
          <div data-testid="blur">{JSON.stringify(blurStyles)}</div>
          <div data-testid="url">{blurDataURL}</div>
        </div>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    const wrapperStyles = JSON.parse(getByTestId('wrapper').textContent || '{}');
    expect(wrapperStyles.width).toBe('200px');
    expect(getByTestId('url').textContent).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('accepts custom options', () => {
    const TestComponent = () => {
      const { blurStyles } = useBlurPlaceholder(200, 200, {
        blurAmount: 30,
        borderRadius: 10,
      });
      return <div data-testid="blur">{JSON.stringify(blurStyles)}</div>;
    };

    const { getByTestId } = render(<TestComponent />);
    const blurStyles = JSON.parse(getByTestId('blur').textContent || '{}');
    expect(blurStyles.filter).toBe('blur(30px)');
    expect(blurStyles.borderRadius).toBe('10px');
  });
});

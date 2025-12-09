# next-image-fallback

Drop-in replacement for `next/image` with automatic fallback support.

[![npm version](https://img.shields.io/npm/v/next-image-fallback.svg)](https://www.npmjs.com/package/next-image-fallback)
[![npm downloads](https://img.shields.io/npm/dm/next-image-fallback.svg)](https://www.npmjs.com/package/next-image-fallback)
[![GitHub stars](https://img.shields.io/github/stars/nipunarambukkanage/next-image-fallback.svg?style=social&label=Star)](https://github.com/nipunarambukkanage/next-image-fallback)

## Install

```bash
npm install next-image-fallback
# or
yarn add next-image-fallback
# or
pnpm add next-image-fallback
```

## Usage

### Basic Usage

```tsx
import { NextImageFallback } from 'next-image-fallback';

export default function AvatarExample() {
  return (
    <NextImageFallback
      src="https://example.com/avatars/user-123.png"
      fallbackSrc="/images/avatar-placeholder.png"
      alt="User avatar"
      width={128}
      height={128}
    />
  );
}
```

### Alternative Fallback (New Feature!)

When both primary and fallback images fail, you can display a beautiful CSS-based placeholder instead of a broken image icon:

```tsx
import { NextImageFallback, ALTERNATIVE_FALLBACK } from 'next-image-fallback';

export default function AvatarExample() {
  return (
    <NextImageFallback
      src="https://example.com/avatars/user-123.png"
      fallbackSrc="/images/avatar-placeholder.png"
      alt="User avatar"
      width={128}
      height={128}
      // Alternative fallback options
      alternativeFallback="gradient"  // 'gradient' | 'waves' | 'mono'
      primaryAltColor="#6366f1"       // Primary color (hex, rgb, or named)
      secondaryAltColor="#8b5cf6"     // Secondary color for gradient/waves
      altErrorMessage="Image unavailable"  // Custom error message
      altTextColor="#ffffff"          // Text color
      onAlternativeFallback={() => console.log('Showing placeholder')}
    />
  );
}
```

#### Using Constants

```tsx
import { NextImageFallback, ALTERNATIVE_FALLBACK } from 'next-image-fallback';

// Use predefined constants
<NextImageFallback
  src="/image.png"
  alt="test"
  width={200}
  height={200}
  alternativeFallback={ALTERNATIVE_FALLBACK.GRADIENT}  // or WAVES, MONO
/>
```

#### Alternative Fallback Types

| Type | Description |
|------|-------------|
| `gradient` | Smooth diagonal gradient from primary to secondary color |
| `waves` | Multi-layered radial gradient creating a wave-like effect |
| `mono` | Solid single-color background using primary color |

#### Custom Color Examples

```tsx
// Using hex colors
<NextImageFallback
  src="/image.png"
  alt="test"
  width={200}
  height={200}
  alternativeFallback="gradient"
  primaryAltColor="#ff6b6b"
  secondaryAltColor="#4ecdc4"
/>

// Using RGB colors
<NextImageFallback
  src="/image.png"
  alt="test"
  width={200}
  height={200}
  alternativeFallback="waves"
  primaryAltColor="rgb(99, 102, 241)"
  secondaryAltColor="rgb(139, 92, 246)"
/>

// Using named colors
<NextImageFallback
  src="/image.png"
  alt="test"
  width={200}
  height={200}
  alternativeFallback="mono"
  primaryAltColor="slategray"
/>
```

## Props

### Standard Props
- All standard `next/image` props are supported (`ImageProps`).

### Fallback Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fallbackSrc` | `ImageProps['src']` | - | Alternative image to display when the primary one fails |
| `onFallback` | `() => void` | - | Callback fired exactly once when switching to the fallback source |

### Alternative Fallback Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `alternativeFallback` | `'gradient' \| 'waves' \| 'mono'` | - | Placeholder type to display when both images fail |
| `primaryAltColor` | `string` | `'#6366f1'` | Primary color (supports hex, rgb, or named colors) |
| `secondaryAltColor` | `string` | `'#8b5cf6'` | Secondary color for gradient/waves |
| `altErrorMessage` | `string` | `'Image unavailable'` | Custom error message displayed on placeholder |
| `altTextColor` | `string` | `'#ffffff'` | Text color for the error message |
| `onAlternativeFallback` | `() => void` | - | Callback fired when the alternative fallback is shown |

## How it works

- The component keeps an internal `currentSrc` state starting with `src`.
- On load error it switches to `fallbackSrc` (if provided and not already used) and calls `onFallback`.
- Also checks `naturalWidth === 0` in `onLoadingComplete` for environments where broken images still trigger completion.
- User-supplied `onError` and `onLoadingComplete` handlers are invoked as well.
- If both original and fallback fail, it will not loop; the fallback is attempted only once per `src` change.
- **New:** When `alternativeFallback` is set and both images fail, a CSS-based placeholder is rendered with customizable colors and error message.

## Why?

`next/image` does not support fallbacks out of the box. Handling `onError` manually across a codebase is noisy, and broken image URLs are common in user-generated content or expired remote assets. `next-image-fallback` provides a lightweight, reusable wrapper so you can add a single `fallbackSrc` prop and move on.

**New:** The alternative fallback feature ensures users never see ugly broken image icons – they see a beautiful, branded placeholder instead.

## Next.js support (App Router & Pages Router)

The component works in both App Router and Pages Router projects on Next.js 13+. It simply wraps `next/image`, so static imports, remote patterns configured in `next.config.js`, `width`/`height`, and `fill` all work as usual.

Server rendering is unaffected; fallback logic only runs in the browser once the image loads or errors.

## Limitations

- The fallback is attempted only once per `src` change to avoid infinite loops.
- Image optimization rules from your `next.config.js` still apply; ensure the fallback source is allowed (static asset, public folder, or configured remote).
- This package targets React 18+ and Next.js 13+.
- The alternative fallback placeholder uses CSS, so it won't work in contexts where CSS is not supported.

## TypeScript Support

The package is fully typed. Import types as needed:

```tsx
import type { 
  NextImageFallbackProps, 
  AlternativeFallbackType 
} from 'next-image-fallback';
```

## Developed by 

nipunarambukkanage

## License

MIT © 2025 Nipuna Rambukkanage

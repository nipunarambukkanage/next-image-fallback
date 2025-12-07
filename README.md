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

## Props

- All standard `next/image` props are supported (`ImageProps`).
- `fallbackSrc?: ImageProps['src']` — alternative image to display when the primary one fails.
- `onFallback?: () => void` — callback fired exactly once when switching to the fallback source.

## How it works

- The component keeps an internal `currentSrc` state starting with `src`.
- On load error it switches to `fallbackSrc` (if provided and not already used) and calls `onFallback`.
- Also checks `naturalWidth === 0` in `onLoadingComplete` for environments where broken images still trigger completion.
- User-supplied `onError` and `onLoadingComplete` handlers are invoked as well.
- If both original and fallback fail, it will not loop; the fallback is attempted only once per `src` change.

## Why?

`next/image` does not support fallbacks out of the box. Handling `onError` manually across a codebase is noisy, and broken image URLs are common in user-generated content or expired remote assets. `next-image-fallback` provides a lightweight, reusable wrapper so you can add a single `fallbackSrc` prop and move on.

## Next.js support (App Router & Pages Router)

The component works in both App Router and Pages Router projects on Next.js 13+. It simply wraps `next/image`, so static imports, remote patterns configured in `next.config.js`, `width`/`height`, and `fill` all work as usual.

Server rendering is unaffected; fallback logic only runs in the browser once the image loads or errors.

## Limitations

- The fallback is attempted only once per `src` change to avoid infinite loops.
- Image optimization rules from your `next.config.js` still apply; ensure the fallback source is allowed (static asset, public folder, or configured remote).
- This package targets React 18+ and Next.js 13+.

## License

MIT © 2025 Nipuna Rambukkanage

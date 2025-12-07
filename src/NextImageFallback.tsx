import Image, { type ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';

export interface NextImageFallbackProps extends ImageProps {
  fallbackSrc?: ImageProps['src'];
  onFallback?: () => void;
}

export const NextImageFallback: React.FC<NextImageFallbackProps> = (props) => {
  const { src, fallbackSrc, onFallback, onError, onLoadingComplete, ...rest } = props;

  const [currentSrc, setCurrentSrc] = useState<ImageProps['src']>(src);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasTriedFallback(false);
  }, [src]);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    if (fallbackSrc && !hasTriedFallback && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
      if (onFallback) onFallback();
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

    if (onLoadingComplete) {
      onLoadingComplete(result as any);
    }
  };

  return (
    <Image
      {...rest}
      src={currentSrc}
      onError={handleError}
      onLoadingComplete={handleLoadingComplete}
    />
  );
};

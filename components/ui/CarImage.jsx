'use client';
import Image from 'next/image';
import { useState } from 'react';
import { PHOTO_FALLBACK } from '@/lib/photos';

/**
 * next/image wrapper (concept #16). Fills its (position: relative) parent and
 * swaps to a local fallback illustration if the photo fails to load.
 */
export default function CarImage({ src, alt, sizes = '(max-width: 620px) 100vw, (max-width: 1024px) 50vw, 380px', priority = false }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const shown = !src || failedSrc === src ? PHOTO_FALLBACK : src;
  return (
    <Image
      src={shown}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailedSrc(src)}
    />
  );
}

import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  /** 'cover' recorta para llenar (tarjetas); 'contain' muestra el producto completo (modal). */
  fit?: 'cover' | 'contain';
}

/** Deterministic floral gradient used as a fallback when no image loads. */
function gradientFor(seed: string): string {
  const palettes = [
    'from-bloom-200 to-bloom-400',
    'from-bloom-100 to-leaf-100',
    'from-bloom-300 to-bloom-500',
    'from-bloom-100 to-bloom-300',
    'from-leaf-100 to-bloom-200',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return palettes[hash % palettes.length];
}

/** Product image that gracefully falls back to a branded gradient + flower glyph. */
export function ProductImage({ src, alt, className = '', fit = 'cover' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  if (showFallback) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${gradientFor(alt)} ${className}`}
        aria-label={alt}
        role="img"
      >
        <span className="text-5xl drop-shadow-sm" aria-hidden>
          🌸
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${fitClass} ${className}`}
    />
  );
}

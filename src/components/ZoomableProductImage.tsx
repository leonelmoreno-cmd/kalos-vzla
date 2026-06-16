import { useState } from 'react';
import { ProductImage } from './ProductImage';

interface ZoomableProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fit?: 'cover' | 'contain';
  zoomLevel?: number;
}

/**
 * Product image with zoom effect on hover.
 * Scales up smoothly when cursor enters, resets on exit.
 * Useful for e-commerce product cards to inspect details.
 */
export function ZoomableProductImage({
  src,
  alt,
  className = '',
  fit = 'cover',
  zoomLevel = 1.15,
}: ZoomableProductImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="overflow-hidden" onMouseEnter={() => setIsZoomed(true)} onMouseLeave={() => setIsZoomed(false)}>
      <div
        className={`transition-transform duration-300 ${isZoomed ? `scale-[${zoomLevel}]` : 'scale-100'}`}
        style={{
          transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
        }}
      >
        <ProductImage src={src} alt={alt} className={className} fit={fit} />
      </div>
    </div>
  );
}

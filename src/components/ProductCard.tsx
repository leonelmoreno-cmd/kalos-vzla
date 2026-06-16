import type { Product } from '@/types';
import { formatPrice } from '@/lib/format';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="card group flex flex-col overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full transition group-hover:scale-[1.03]"
        />
        {product.category && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-bloom-700 shadow-sm">
            {product.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-bloom-700">
            {product.options && product.options.length > 0
              ? `${product.options[0].choices.length} opciones`
              : formatPrice(product.basePrice)}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-bloom-100 px-3 py-1.5 text-xs font-semibold text-bloom-700 transition group-hover:bg-bloom-700 group-hover:text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Agregar
          </span>
        </div>
      </div>
    </button>
  );
}

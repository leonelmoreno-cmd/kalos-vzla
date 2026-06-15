import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { getProductRepository } from '@/repositories/productRepository';
import { formatPrice } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { Button } from '@/components/ui/Button';

export function ProductListPage() {
  const repo = getProductRepository();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    repo
      .list()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAvailable = async (product: Product) => {
    setBusyId(product.id);
    await repo.update(product.id, { available: !product.available });
    setBusyId(null);
    load();
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setBusyId(product.id);
    await repo.remove(product.id);
    setBusyId(null);
    load();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Productos</h1>
          <p className="text-sm text-gray-500">{products.length} producto(s) en tu catálogo.</p>
        </div>
        <Link to="/admin/products/new">
          <Button>+ Nuevo producto</Button>
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-400">Cargando…</p>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-500">Aún no hay productos.</p>
          <Link to="/admin/products/new" className="mt-4 inline-block">
            <Button>Agregar primer producto</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="card flex items-center gap-3 p-3">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="h-14 w-14 flex-shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-400">
                  {formatPrice(product.basePrice)}
                  {product.category && <span> · {product.category}</span>}
                </p>
              </div>

              <button
                onClick={() => toggleAvailable(product)}
                disabled={busyId === product.id}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  product.available
                    ? 'bg-leaf-100 text-leaf-700 hover:bg-leaf-100/70'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title="Cambiar disponibilidad"
              >
                {product.available ? 'Disponible' : 'Oculto'}
              </button>

              <Link to={`/admin/products/${product.id}`}>
                <Button variant="secondary" size="sm">
                  Editar
                </Button>
              </Link>
              <button
                onClick={() => handleDelete(product)}
                disabled={busyId === product.id}
                aria-label="Eliminar producto"
                className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

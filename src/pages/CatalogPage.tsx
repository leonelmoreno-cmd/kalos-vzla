import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types';
import { getProductRepository } from '@/repositories/productRepository';
import { ProductCard } from '@/components/ProductCard';
import { ProductCustomizeModal } from '@/components/ProductCustomizeModal';
const TODOS = 'Todos';

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(TODOS);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let active = true;
    getProductRepository()
      .listAvailable()
      .then((list) => { if (active) setProducts(list); })
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Error al cargar los productos.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return [TODOS, ...Array.from(set)];
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = category === TODOS || p.category === category;
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, category, query]);

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="py-8 sm:py-12">
        {/* Título centrado */}
        <div className="mb-6 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-bloom-700">
            Maracaibo, Venezuela
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-bloom-800 sm:text-4xl">
            kalos<span className="text-bloom-700">.vzla</span>
          </h1>
          <p className="mt-1 text-base font-medium text-gray-500">
            Cuadros · Fotos · Regalos · Flores · Arreglos
          </p>
        </div>

        {/* Dos columnas: tagline | cómo pedir */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          {/* Tagline */}
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-bloom-700 px-6 py-5 text-center">
            <p className="text-sm leading-relaxed text-white/90">
              Hemos ayudado a más de 2000 personas a dar regalos inolvidables,
              haciendo todo con amor y excelencia 💚{' '}
              <span className="italic opacity-70">(1 Co 16:14)</span>
            </p>
          </div>

          {/* Cómo pedir */}
          <div className="flex-1 rounded-2xl bg-white px-5 py-4 ring-1 ring-bloom-100">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-bloom-700">¿Cómo pedir?</p>
            <ol className="space-y-2.5">
              {[
                { icon: '🛍️', step: 'Elige tu regalo', desc: 'Explora el catálogo y toca el que te guste' },
                { icon: '🛒', step: 'Agrégalo al carrito', desc: 'Personaliza opciones y añade un mensaje si quieres' },
                { icon: '📋', step: 'Completa tus datos', desc: 'Nombre, dirección y cómo vas a pagar' },
                { icon: '💬', step: 'Confirma por WhatsApp', desc: 'Te enviamos el resumen y coordinamos la entrega' },
              ].map(({ icon, step, desc }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bloom-50 text-base">
                    {icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-bloom-800">{step}</p>
                    <p className="text-xs text-gray-500 leading-snug">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Búsqueda y filtros */}
      <div className="mb-6 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar regalo…"
          className="input-base"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === cat
                  ? 'bg-bloom-700 text-white'
                  : 'bg-white text-gray-600 ring-1 ring-bloom-100 hover:bg-bloom-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square w-full rounded-t-2xl bg-bloom-50" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 rounded bg-bloom-50" />
                <div className="h-3 w-full rounded bg-bloom-50/60" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="py-12 text-center text-red-500">{error}</p>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-gray-400">Ningún producto coincide con tu búsqueda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={setSelected} />
          ))}
        </div>
      )}

      <ProductCustomizeModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

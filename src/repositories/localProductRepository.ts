import type { Product } from '@/types';
import { seedProducts } from '@/data/seedProducts';
import type { ProductInput, ProductRepository } from './productRepository';

const STORAGE_KEY = 'kalos.products.v1';

/** Generate a URL-friendly id from a product name, with a short uniqueness suffix. */
function makeId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug || 'product'}-${suffix}`;
}

/**
 * Product repository backed by `localStorage`, seeded from `seedProducts` on first run.
 * Used in the first iteration so the storefront and admin work with zero backend.
 */
export class LocalProductRepository implements ProductRepository {
  private read(): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Product[];
    } catch {
      // fall through to seeding
    }
    this.write(seedProducts);
    return seedProducts;
  }

  private write(products: Product[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  async list(): Promise<Product[]> {
    return this.read();
  }

  async listAvailable(): Promise<Product[]> {
    return this.read().filter((p) => p.available);
  }

  async get(id: string): Promise<Product | null> {
    return this.read().find((p) => p.id === id) ?? null;
  }

  async create(input: ProductInput): Promise<Product> {
    const products = this.read();
    const product: Product = { ...input, id: makeId(input.name) };
    this.write([product, ...products]);
    return product;
  }

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const products = this.read();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Product "${id}" not found.`);
    const updated: Product = { ...products[index], ...input, id };
    products[index] = updated;
    this.write(products);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const products = this.read().filter((p) => p.id !== id);
    this.write(products);
  }
}

import type { Product } from '@/types';
import { LocalProductRepository } from './localProductRepository';
import { SupabaseProductRepository } from './supabaseProductRepository';

/** Fields a merchant can set when creating/updating a product. */
export type ProductInput = Omit<Product, 'id'>;

/**
 * Abstraction over the product data source. The whole app depends on this interface,
 * so the storage backend can change (localStorage → Supabase → REST API) without
 * touching components.
 */
export interface ProductRepository {
  list(): Promise<Product[]>;
  /** Only products with `available === true`, for the storefront. */
  listAvailable(): Promise<Product[]>;
  get(id: string): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: Partial<ProductInput>): Promise<Product>;
  remove(id: string): Promise<void>;
}

let instance: ProductRepository | null = null;

/**
 * Returns the active product repository based on `VITE_DATA_SOURCE`.
 * Defaults to the local (browser) repository.
 */
export function getProductRepository(): ProductRepository {
  if (instance) return instance;
  const source = (import.meta.env.VITE_DATA_SOURCE as string | undefined) ?? 'local';
  instance = source === 'supabase' ? new SupabaseProductRepository() : new LocalProductRepository();
  return instance;
}

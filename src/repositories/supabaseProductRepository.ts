import type { Product } from '@/types';
import { requireSupabase } from '@/lib/supabaseClient';
import type { ProductInput, ProductRepository } from './productRepository';

/**
 * Supabase-backed product repository.
 *
 * Activated when VITE_DATA_SOURCE=supabase. Assumes a `products` table matching
 * `docs/supabase-schema.sql`. The mapping helpers convert between the DB's snake_case
 * columns and the app's camelCase `Product` type.
 *
 * This is intentionally a thin, working starting point for the Supabase migration.
 */

const TABLE = 'products';

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromRow(row: any): Product {
  // Parse options if it's a string (from Supabase JSON column)
  let options = row.options;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch {
      options = undefined;
    }
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    basePrice: Number(row.base_price),
    imageUrl: row.image_url ?? '',
    available: !!row.available,
    category: row.category ?? undefined,
    options: options ?? undefined,
    allowCardMessage: !!row.allow_card_message,
    requiresPhotos: !!row.requires_photos,
    note: row.note ?? undefined,
  };
}

function toRow(input: Partial<ProductInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.description !== undefined) row.description = input.description;
  if (input.basePrice !== undefined) row.base_price = input.basePrice;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.available !== undefined) row.available = input.available;
  if (input.category !== undefined) row.category = input.category;
  if (input.options !== undefined) row.options = input.options;
  if (input.allowCardMessage !== undefined) row.allow_card_message = input.allowCardMessage;
  if (input.requiresPhotos !== undefined) row.requires_photos = input.requiresPhotos;
  if (input.note !== undefined) row.note = input.note;
  return row;
}

export class SupabaseProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .select('*')
      .order('name');
    if (error) throw error;
    return (data ?? []).map(fromRow);
  }

  async listAvailable(): Promise<Product[]> {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .select('*')
      .eq('available', true)
      .order('name');
    if (error) throw error;
    return (data ?? []).map(fromRow);
  }

  async get(id: string): Promise<Product | null> {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data) : null;
  }

  async create(input: ProductInput): Promise<Product> {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .insert(toRow(input))
      .select('*')
      .single();
    if (error) throw error;
    return fromRow(data);
  }

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .update(toRow(input))
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return fromRow(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await requireSupabase().from(TABLE).delete().eq('id', id);
    if (error) throw error;
  }
}

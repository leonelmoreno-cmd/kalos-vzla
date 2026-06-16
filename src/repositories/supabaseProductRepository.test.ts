import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProductInput } from './productRepository';

/* eslint-disable @typescript-eslint/no-explicit-any */
const { mock } = vi.hoisted(() => {
  const calls: any[] = [];
  let result: any = { data: null, error: null };
  const builder: any = {
    from(t: string) { calls.push(['from', t]); return builder; },
    insert(v: any) { calls.push(['insert', v]); return builder; },
    update(v: any) { calls.push(['update', v]); return builder; },
    delete() { calls.push(['delete']); return builder; },
    select(v?: any) { calls.push(['select', v]); return builder; },
    eq(k: string, val: any) { calls.push(['eq', k, val]); return builder; },
    order(k: string, o?: any) { calls.push(['order', k, o]); return builder; },
    single() { calls.push(['single']); return builder; },
    maybeSingle() { calls.push(['maybeSingle']); return builder; },
    then(onF: any, onR?: any) { return Promise.resolve(result).then(onF, onR); },
  };
  return {
    mock: {
      from: builder.from,
      calls,
      setResult(r: any) { result = r; },
      reset() { calls.length = 0; result = { data: null, error: null }; },
    },
  };
});

vi.mock('@/lib/supabaseClient', () => ({
  requireSupabase: () => mock,
  supabase: mock,
}));

import { SupabaseProductRepository } from './supabaseProductRepository';

function findCall(op: string) {
  return mock.calls.find((c: any) => c[0] === op);
}

const row = {
  id: 'kit-01',
  name: 'Kit Papá',
  description: 'Caja con regalos',
  base_price: '25.00',
  image_url: 'https://x/kit-01.png',
  category: 'Kits de Regalos',
  available: true,
  allow_card_message: true,
  options: '[]',
};

const input: ProductInput = {
  name: 'Nuevo',
  description: 'desc',
  basePrice: 30,
  imageUrl: 'https://x/n.png',
  available: true,
  category: 'Cuadros',
  allowCardMessage: false,
  options: [],
};

beforeEach(() => mock.reset());

describe('SupabaseProductRepository.list', () => {
  it('selecciona todos los productos ordenados por nombre', async () => {
    mock.setResult({ data: [row], error: null });
    const repo = new SupabaseProductRepository();
    const products = await repo.list();

    expect(findCall('from')).toEqual(['from', 'products']);
    expect(findCall('select')).toEqual(['select', '*']);
    expect(findCall('order')).toEqual(['order', 'name', undefined]);
    expect(products[0].basePrice).toBe(25);
    expect(products[0].name).toBe('Kit Papá');
  });

  it('propaga error de select', async () => {
    mock.setResult({ data: null, error: new Error('select denied') });
    const repo = new SupabaseProductRepository();
    await expect(repo.list()).rejects.toThrow('select denied');
  });
});

describe('SupabaseProductRepository.listAvailable', () => {
  it('filtra available = true', async () => {
    mock.setResult({ data: [row], error: null });
    const repo = new SupabaseProductRepository();
    await repo.listAvailable();
    expect(findCall('eq')).toEqual(['eq', 'available', true]);
  });
});

describe('SupabaseProductRepository.get', () => {
  it('filtra por id y usa maybeSingle', async () => {
    mock.setResult({ data: row, error: null });
    const repo = new SupabaseProductRepository();
    const product = await repo.get('kit-01');
    expect(findCall('eq')).toEqual(['eq', 'id', 'kit-01']);
    expect(findCall('maybeSingle')).toEqual(['maybeSingle']);
    expect(product?.id).toBe('kit-01');
  });

  it('devuelve null cuando no existe', async () => {
    mock.setResult({ data: null, error: null });
    const repo = new SupabaseProductRepository();
    expect(await repo.get('zzz')).toBeNull();
  });

  it('parsea options cuando viene como string JSON', async () => {
    mock.setResult({
      data: { ...row, options: JSON.stringify([{ id: 'luz', label: 'Luz', choices: [{ id: 'led', label: 'LED' }] }]) },
      error: null,
    });
    const repo = new SupabaseProductRepository();
    const product = await repo.get('kit-01');
    expect(Array.isArray(product?.options)).toBe(true);
    expect(product?.options?.[0].id).toBe('luz');
  });
});

describe('SupabaseProductRepository.create', () => {
  it('inserta mapeando camelCase → snake_case', async () => {
    mock.setResult({ data: { ...row, id: 'new' }, error: null });
    const repo = new SupabaseProductRepository();
    await repo.create(input);

    const payload = findCall('insert')![1];
    expect(payload.name).toBe('Nuevo');
    expect(payload.base_price).toBe(30);
    expect(payload.image_url).toBe('https://x/n.png');
    expect(payload.allow_card_message).toBe(false);
  });

  it('propaga error de insert', async () => {
    mock.setResult({ data: null, error: new Error('insert denied') });
    const repo = new SupabaseProductRepository();
    await expect(repo.create(input)).rejects.toThrow('insert denied');
  });
});

describe('SupabaseProductRepository.update', () => {
  it('actualiza filtrando por id', async () => {
    mock.setResult({ data: row, error: null });
    const repo = new SupabaseProductRepository();
    await repo.update('kit-01', { basePrice: 99 });
    expect(findCall('update')![1]).toMatchObject({ base_price: 99 });
    expect(findCall('eq')).toEqual(['eq', 'id', 'kit-01']);
  });
});

describe('SupabaseProductRepository.remove', () => {
  it('elimina filtrando por id', async () => {
    mock.setResult({ error: null });
    const repo = new SupabaseProductRepository();
    await repo.remove('kit-01');
    expect(findCall('delete')).toEqual(['delete']);
    expect(findCall('eq')).toEqual(['eq', 'id', 'kit-01']);
  });

  it('propaga error de delete', async () => {
    mock.setResult({ error: new Error('delete denied') });
    const repo = new SupabaseProductRepository();
    await expect(repo.remove('kit-01')).rejects.toThrow('delete denied');
  });
});

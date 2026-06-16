import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CartItem, CheckoutForm, Product } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock del cliente Supabase (hoisted para que vi.mock lo capture).
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

// Import DESPUÉS del mock para que el repo use el cliente simulado.
import { SupabaseOrderRepository } from './supabaseOrderRepository';

const product: Product = {
  id: 'kit-01',
  name: 'Kit Papá',
  description: '',
  basePrice: 25,
  imageUrl: '',
  available: true,
};

const items: CartItem[] = [
  { id: 'kit-01', product, quantity: 2, selectedOptions: {}, unitPrice: 25 },
];

const form: CheckoutForm = {
  fullName: 'María González',
  phone: '+58 424 4707676',
  shipping: 'delivery',
  address: 'Av. Las Delicias',
  payment: 'zelle',
  notes: 'Entregar a las 3pm',
};

/** Busca la primera llamada de un tipo dado. */
function findCall(op: string) {
  return mock.calls.find((c) => c[0] === op);
}

beforeEach(() => mock.reset());

describe('SupabaseOrderRepository.create', () => {
  it('inserta en la tabla orders con los campos mapeados a snake_case', async () => {
    mock.setResult({
      data: {
        id: 'uuid-1',
        order_number: 'KLS-0001',
        created_at: '2026-06-16T12:00:00Z',
        status: 'pendiente',
        items, form,
        subtotal: 50, delivery_price: 3, total: 53,
        admin_notes: null,
      },
      error: null,
    });

    const repo = new SupabaseOrderRepository();
    const order = await repo.create({ items, form, deliveryPrice: 3 });

    // Operó sobre la tabla correcta
    expect(findCall('from')).toEqual(['from', 'orders']);

    // El payload del insert mapea correctamente
    const insert = findCall('insert')!;
    const payload = insert[1];
    expect(payload.customer_name).toBe('María González');
    expect(payload.customer_phone).toBe('+58 424 4707676');
    expect(payload.shipping_method).toBe('delivery');
    expect(payload.address).toBe('Av. Las Delicias');
    expect(payload.delivery_price).toBe(3);
    expect(payload.payment_method).toBe('zelle');
    expect(payload.subtotal).toBe(50);
    expect(payload.total).toBe(53);
    expect(payload.customer_notes).toBe('Entregar a las 3pm');
    expect(payload.status).toBe('pendiente');
    // NO debe enviar order_number (lo genera la secuencia de la BD)
    expect(payload.order_number).toBeUndefined();

    // Devuelve el pedido mapeado desde la fila
    expect(order.orderNumber).toBe('KLS-0001');
    expect(order.total).toBe(53);
  });

  it('calcula subtotal y total a partir del carrito y el delivery', async () => {
    mock.setResult({
      data: {
        id: 'u', order_number: 'KLS-0002', created_at: 'x', status: 'pendiente',
        items, form, subtotal: 50, delivery_price: 0, total: 50,
      },
      error: null,
    });
    const repo = new SupabaseOrderRepository();
    await repo.create({ items, form, deliveryPrice: 0 });
    const payload = findCall('insert')![1];
    expect(payload.subtotal).toBe(50);
    expect(payload.total).toBe(50);
  });

  it('propaga el error si el insert falla', async () => {
    mock.setResult({ data: null, error: new Error('insert denied') });
    const repo = new SupabaseOrderRepository();
    await expect(repo.create({ items, form, deliveryPrice: 0 })).rejects.toThrow('insert denied');
  });
});

describe('SupabaseOrderRepository.list', () => {
  it('selecciona todos los pedidos ordenados por fecha ascendente', async () => {
    mock.setResult({
      data: [
        { id: 'a', order_number: 'KLS-0001', created_at: 'x', status: 'pendiente', items: '[]', form: '{}', subtotal: 10, delivery_price: 0, total: 10 },
      ],
      error: null,
    });
    const repo = new SupabaseOrderRepository();
    const orders = await repo.list();

    expect(findCall('from')).toEqual(['from', 'orders']);
    expect(findCall('select')).toEqual(['select', '*']);
    expect(findCall('order')).toEqual(['order', 'created_at', { ascending: true }]);
    expect(orders).toHaveLength(1);
  });

  it('parsea items y form cuando vienen como string JSON', async () => {
    mock.setResult({
      data: [
        {
          id: 'a', order_number: 'KLS-0001', created_at: 'x', status: 'pendiente',
          items: JSON.stringify(items),
          form: JSON.stringify(form),
          subtotal: 50, delivery_price: 3, total: 53,
        },
      ],
      error: null,
    });
    const repo = new SupabaseOrderRepository();
    const [order] = await repo.list();
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items[0].product.name).toBe('Kit Papá');
    expect(order.form.fullName).toBe('María González');
  });
});

describe('SupabaseOrderRepository.updateStatus', () => {
  it('actualiza status filtrando por order_number', async () => {
    mock.setResult({ error: null });
    const repo = new SupabaseOrderRepository();
    await repo.updateStatus('KLS-0001', 'entregado');

    expect(findCall('update')).toEqual(['update', { status: 'entregado' }]);
    expect(findCall('eq')).toEqual(['eq', 'order_number', 'KLS-0001']);
  });

  it('propaga error de update', async () => {
    mock.setResult({ error: new Error('update denied') });
    const repo = new SupabaseOrderRepository();
    await expect(repo.updateStatus('KLS-0001', 'listo')).rejects.toThrow('update denied');
  });
});

describe('SupabaseOrderRepository.updateAdminNotes', () => {
  it('actualiza admin_notes filtrando por order_number', async () => {
    mock.setResult({ error: null });
    const repo = new SupabaseOrderRepository();
    await repo.updateAdminNotes('KLS-0007', 'Pago confirmado');

    expect(findCall('update')).toEqual(['update', { admin_notes: 'Pago confirmado' }]);
    expect(findCall('eq')).toEqual(['eq', 'order_number', 'KLS-0007']);
  });
});

describe('SupabaseOrderRepository.remove', () => {
  it('elimina filtrando por order_number', async () => {
    mock.setResult({ error: null });
    const repo = new SupabaseOrderRepository();
    await repo.remove('KLS-0009');

    expect(findCall('delete')).toEqual(['delete']);
    expect(findCall('eq')).toEqual(['eq', 'order_number', 'KLS-0009']);
  });

  it('propaga error de delete', async () => {
    mock.setResult({ error: new Error('delete denied') });
    const repo = new SupabaseOrderRepository();
    await expect(repo.remove('KLS-0009')).rejects.toThrow('delete denied');
  });
});

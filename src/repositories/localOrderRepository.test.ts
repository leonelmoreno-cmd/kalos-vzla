import { describe, it, expect, beforeEach } from 'vitest';
import type { CartItem, CheckoutForm, Product } from '@/types';
import { LocalOrderRepository } from './localOrderRepository';

// Mínimo localStorage en memoria para ejecutar en entorno node.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  setItem(k: string, v: string) { this.store.set(k, v); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();
});

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
  fullName: 'María',
  phone: '+58 424 4707676',
  shipping: 'delivery',
  payment: 'cash',
};

describe('LocalOrderRepository', () => {
  it('creates an order with a correlative number and correct totals', async () => {
    const repo = new LocalOrderRepository();
    const order = await repo.create({ items, form, deliveryPrice: 3 });
    expect(order.orderNumber).toBe('KLS-0001');
    expect(order.subtotal).toBe(50);
    expect(order.total).toBe(53);
    expect(order.status).toBe('pendiente');
  });

  it('increments the order number on each create', async () => {
    const repo = new LocalOrderRepository();
    const a = await repo.create({ items, form, deliveryPrice: 0 });
    const b = await repo.create({ items, form, deliveryPrice: 0 });
    expect(a.orderNumber).toBe('KLS-0001');
    expect(b.orderNumber).toBe('KLS-0002');
  });

  it('lists persisted orders', async () => {
    const repo = new LocalOrderRepository();
    await repo.create({ items, form, deliveryPrice: 0 });
    await repo.create({ items, form, deliveryPrice: 0 });
    expect(await repo.list()).toHaveLength(2);
  });

  it('updates status and admin notes', async () => {
    const repo = new LocalOrderRepository();
    const order = await repo.create({ items, form, deliveryPrice: 0 });
    await repo.updateStatus(order.orderNumber, 'entregado');
    await repo.updateAdminNotes(order.orderNumber, 'Pago confirmado');
    const [stored] = await repo.list();
    expect(stored.status).toBe('entregado');
    expect(stored.adminNotes).toBe('Pago confirmado');
  });

  it('removes an order', async () => {
    const repo = new LocalOrderRepository();
    const order = await repo.create({ items, form, deliveryPrice: 0 });
    await repo.remove(order.orderNumber);
    expect(await repo.list()).toHaveLength(0);
  });
});

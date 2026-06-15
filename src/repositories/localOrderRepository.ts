import type { Order, OrderStatus } from '@/types';
import { cartTotal } from '@/lib/cart';
import type { NewOrderInput, OrderRepository } from './orderRepository';

const COUNTER_KEY = 'kalos.order_counter.v1';
const ORDERS_KEY = 'kalos.orders.v1';

/** Genera el próximo número correlativo tipo "KLS-0001". */
function nextOrderNumber(): string {
  const current = parseInt(localStorage.getItem(COUNTER_KEY) ?? '0', 10);
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return `KLS-${String(next).padStart(4, '0')}`;
}

function readAll(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {
    /* ignore */
  }
  return [];
}

function writeAll(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

/** Repositorio de pedidos respaldado por localStorage (modo offline). */
export class LocalOrderRepository implements OrderRepository {
  async create({ items, form, deliveryPrice }: NewOrderInput): Promise<Order> {
    const subtotal = cartTotal(items);
    const order: Order = {
      orderNumber: nextOrderNumber(),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
      items,
      form,
      subtotal,
      deliveryPrice,
      total: subtotal + deliveryPrice,
    };
    const orders = readAll();
    orders.push(order);
    writeAll(orders);
    return order;
  }

  async list(): Promise<Order[]> {
    return readAll();
  }

  async updateStatus(orderNumber: string, status: OrderStatus): Promise<void> {
    const orders = readAll();
    const idx = orders.findIndex((o) => o.orderNumber === orderNumber);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], status };
      writeAll(orders);
    }
  }

  async updateAdminNotes(orderNumber: string, adminNotes: string): Promise<void> {
    const orders = readAll();
    const idx = orders.findIndex((o) => o.orderNumber === orderNumber);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], adminNotes };
      writeAll(orders);
    }
  }

  async remove(orderNumber: string): Promise<void> {
    writeAll(readAll().filter((o) => o.orderNumber !== orderNumber));
  }
}

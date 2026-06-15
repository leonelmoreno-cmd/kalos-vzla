import type { CartItem, CheckoutForm, Order, OrderStatus } from '@/types';
import { cartTotal } from './cart';

const COUNTER_KEY = 'kalos.order_counter.v1';
const ORDERS_KEY = 'kalos.orders.v1';

/** Genera el próximo número de pedido tipo "KLS-0001". */
export function nextOrderNumber(): string {
  const current = parseInt(localStorage.getItem(COUNTER_KEY) ?? '0', 10);
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return `KLS-${String(next).padStart(4, '0')}`;
}

/** Guarda un pedido en localStorage y devuelve el objeto creado. */
export function saveOrder(
  orderNumber: string,
  items: CartItem[],
  form: CheckoutForm,
  deliveryPrice: number,
): Order {
  const subtotal = cartTotal(items);
  const total = subtotal + deliveryPrice;
  const order: Order = {
    orderNumber,
    createdAt: new Date().toISOString(),
    status: 'pendiente',
    items,
    form,
    subtotal,
    deliveryPrice,
    total,
  };
  const orders = loadOrders();
  orders.unshift(order); // más reciente primero
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return order;
}

/** Carga todos los pedidos almacenados. */
export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {
    /* ignore */
  }
  return [];
}

/** Actualiza el estado de un pedido por número. */
export function updateOrderStatus(orderNumber: string, status: OrderStatus): void {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.orderNumber === orderNumber);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], status };
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
}

/** Guarda notas internas del admin en un pedido. */
export function updateOrderAdminNotes(orderNumber: string, adminNotes: string): void {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.orderNumber === orderNumber);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], adminNotes };
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
}

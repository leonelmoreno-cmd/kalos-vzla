import type { CartItem, CheckoutForm, Order, OrderStatus } from '@/types';
import { LocalOrderRepository } from './localOrderRepository';
import { SupabaseOrderRepository } from './supabaseOrderRepository';

/** Datos necesarios para registrar un pedido nuevo. */
export interface NewOrderInput {
  items: CartItem[];
  form: CheckoutForm;
  deliveryPrice: number;
}

/**
 * Abstracción sobre el almacén de pedidos. Permite cambiar el backend
 * (localStorage ↔ Supabase) sin tocar páginas ni componentes.
 */
export interface OrderRepository {
  /** Crea y persiste un pedido; devuelve el pedido con su número asignado. */
  create(input: NewOrderInput): Promise<Order>;
  /** Todos los pedidos, del más antiguo al más reciente. */
  list(): Promise<Order[]>;
  updateStatus(orderNumber: string, status: OrderStatus): Promise<void>;
  updateAdminNotes(orderNumber: string, adminNotes: string): Promise<void>;
  remove(orderNumber: string): Promise<void>;
}

let instance: OrderRepository | null = null;

/** Devuelve el repositorio de pedidos activo según `VITE_DATA_SOURCE`. */
export function getOrderRepository(): OrderRepository {
  if (instance) return instance;
  const source = (import.meta.env.VITE_DATA_SOURCE as string | undefined) ?? 'local';
  instance = source === 'supabase' ? new SupabaseOrderRepository() : new LocalOrderRepository();
  return instance;
}

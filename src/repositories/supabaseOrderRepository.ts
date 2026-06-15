import type { CartItem, CheckoutForm, Order, OrderStatus } from '@/types';
import { requireSupabase } from '@/lib/supabaseClient';
import { cartTotal } from '@/lib/cart';
import type { NewOrderInput, OrderRepository } from './orderRepository';

const TABLE = 'orders';

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function fromRow(row: any): Order {
  const form = parseJson<CheckoutForm>(row.form, {} as CheckoutForm);
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    items: parseJson<CartItem[]>(row.items, []),
    form,
    subtotal: Number(row.subtotal),
    deliveryPrice: Number(row.delivery_price),
    total: Number(row.total),
    adminNotes: row.admin_notes ?? undefined,
  };
}

/** Repositorio de pedidos respaldado por Supabase (PostgreSQL en la nube). */
export class SupabaseOrderRepository implements OrderRepository {
  async create({ items, form, deliveryPrice }: NewOrderInput): Promise<Order> {
    const subtotal = cartTotal(items);
    const total = subtotal + deliveryPrice;

    // order_number lo genera la base de datos vía secuencia (default).
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .insert({
        status: 'pendiente',
        customer_name: form.fullName,
        customer_phone: form.phone,
        shipping_method: form.shipping,
        address: form.address ?? null,
        delivery_price: deliveryPrice,
        payment_method: form.payment,
        subtotal,
        total,
        items,
        form,
        customer_notes: form.notes ?? null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return fromRow(data);
  }

  async list(): Promise<Order[]> {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  }

  async updateStatus(orderNumber: string, status: OrderStatus): Promise<void> {
    const { error } = await requireSupabase()
      .from(TABLE)
      .update({ status })
      .eq('order_number', orderNumber);
    if (error) throw error;
  }

  async updateAdminNotes(orderNumber: string, adminNotes: string): Promise<void> {
    const { error } = await requireSupabase()
      .from(TABLE)
      .update({ admin_notes: adminNotes })
      .eq('order_number', orderNumber);
    if (error) throw error;
  }

  async remove(orderNumber: string): Promise<void> {
    const { error } = await requireSupabase()
      .from(TABLE)
      .delete()
      .eq('order_number', orderNumber);
    if (error) throw error;
  }
}

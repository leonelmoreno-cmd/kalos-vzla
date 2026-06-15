import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '@/types';
import { loadOrders } from '@/lib/orders';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatPrice } from '@/lib/format';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  colorClass: string;
}

function StatCard({ label, value, icon, colorClass }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{label}</p>
          <p className="mt-1 text-3xl font-extrabold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${ORDER_STATUS_COLORS[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

const STATUS_RING: Record<OrderStatus, string> = {
  pendiente:      'bg-amber-50 ring-1 ring-amber-200',
  en_preparacion: 'bg-blue-50 ring-1 ring-blue-200',
  listo:          'bg-purple-50 ring-1 ring-purple-200',
  enviado:        'bg-cyan-50 ring-1 ring-cyan-200',
  entregado:      'bg-bloom-50 ring-1 ring-bloom-200',
  cancelado:      'bg-red-50 ring-1 ring-red-200',
};

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { setOrders(loadOrders()); }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const active = orders.filter((o) => o.status !== 'cancelado');
    return {
      pendientes:  orders.filter((o) => o.status === 'pendiente').length,
      enPrep:      orders.filter((o) => o.status === 'en_preparacion').length,
      hoy:         orders.filter((o) => new Date(o.createdAt).toDateString() === today).length,
      ingresos:    active.reduce((s, o) => s + o.total, 0),
      total:       orders.length,
    };
  }, [orders]);

  const byStatus = useMemo<Record<OrderStatus, number>>(() => {
    const counts = {} as Record<OrderStatus, number>;
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return counts;
  }, [orders]);

  const recent = useMemo(() => [...orders].reverse().slice(0, 6), [orders]);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bloom-800">Panel de control</h1>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Pendientes"
          value={stats.pendientes}
          icon="⏳"
          colorClass="bg-amber-50 text-amber-900"
        />
        <StatCard
          label="En preparación"
          value={stats.enPrep}
          icon="🔧"
          colorClass="bg-blue-50 text-blue-900"
        />
        <StatCard
          label="Pedidos hoy"
          value={stats.hoy}
          icon="📅"
          colorClass="bg-bloom-50 text-bloom-900"
        />
        <StatCard
          label="Ingresos totales"
          value={formatPrice(stats.ingresos)}
          icon="💰"
          colorClass="bg-purple-50 text-purple-900"
        />
      </div>

      {/* Distribución por estado */}
      {orders.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Pedidos por estado
          </h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => {
              const count = byStatus[s] ?? 0;
              if (count === 0) return null;
              return (
                <div key={s} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${STATUS_RING[s]}`}>
                  <StatusBadge status={s} />
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Últimos pedidos */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Últimos pedidos</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-bloom-700 hover:underline">
            Ver todos ({stats.total}) →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl bg-white py-10 text-center ring-1 ring-bloom-100 shadow-sm">
            <p className="text-3xl">📋</p>
            <p className="mt-2 text-sm text-gray-400">Aún no hay pedidos registrados.</p>
            <p className="text-xs text-gray-400">Aparecerán aquí cuando los clientes finalicen su pedido.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-bloom-100 shadow-sm">
            {recent.map((order, i) => (
              <div
                key={order.orderNumber}
                className={`flex items-center justify-between gap-3 px-4 py-3 ${
                  i !== 0 ? 'border-t border-bloom-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 font-mono text-sm font-bold text-bloom-700">
                    {order.orderNumber}
                  </span>
                  <span className="hidden truncate text-sm text-gray-600 sm:block">
                    {order.form.fullName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('es-VE', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">{formatPrice(order.total)}</span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-bloom-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-bloom-800"
          >
            + Nuevo producto
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl bg-bloom-100 px-4 py-2.5 text-sm font-semibold text-bloom-700 transition hover:bg-bloom-200"
          >
            Gestionar catálogo
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 rounded-xl bg-bloom-100 px-4 py-2.5 text-sm font-semibold text-bloom-700 transition hover:bg-bloom-200"
          >
            Ver pedidos
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 ring-1 ring-bloom-100 transition hover:bg-bloom-50"
          >
            Abrir tienda ↗
          </a>
        </div>
      </div>
    </div>
  );
}

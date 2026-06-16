import { useEffect, useMemo, useState } from 'react';
import type { Order } from '@/types';
import { getOrderRepository } from '@/repositories/orderRepository';
import { formatPrice } from '@/lib/format';

interface DayReport {
  /** Clave ISO YYYY-MM-DD para ordenar. */
  key: string;
  /** Fecha legible en español. */
  label: string;
  orders: number;
  units: number;
  revenue: number;
}

/** Un pedido cuenta como venta si no fue cancelado. */
function isSale(order: Order): boolean {
  return order.status !== 'cancelado';
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('es-VE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function unitsOf(order: Order): number {
  return order.items.reduce((s, i) => s + i.quantity, 0);
}

export function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getOrderRepository()
      .list()
      .then((list) => { if (active) setOrders(list); })
      .catch(() => { /* tolera vacío */ })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  // Agrupa por día (solo ventas no canceladas para ingresos)
  const days = useMemo<DayReport[]>(() => {
    const map = new Map<string, DayReport>();
    for (const order of orders) {
      if (!isSale(order)) continue;
      const key = dayKey(order.createdAt);
      const existing = map.get(key);
      if (existing) {
        existing.orders += 1;
        existing.units += unitsOf(order);
        existing.revenue += order.total;
      } else {
        map.set(key, {
          key,
          label: dayLabel(order.createdAt),
          orders: 1,
          units: unitsOf(order),
          revenue: order.total,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [orders]);

  // Totales por periodo
  const totals = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start7 = new Date(startOfToday);
    start7.setDate(start7.getDate() - 6);
    const start30 = new Date(startOfToday);
    start30.setDate(start30.getDate() - 29);

    let today = 0, week = 0, month = 0, all = 0;
    let countAll = 0;
    for (const order of orders) {
      if (!isSale(order)) continue;
      const d = new Date(order.createdAt);
      all += order.total;
      countAll += 1;
      if (d >= startOfToday) today += order.total;
      if (d >= start7) week += order.total;
      if (d >= start30) month += order.total;
    }
    return { today, week, month, all, countAll };
  }, [orders]);

  const exportCsv = () => {
    const header = 'Fecha,Pedidos,Unidades,Ingresos USD';
    const rows = days.map((d) => `${d.key},${d.orders},${d.units},${d.revenue.toFixed(2)}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kalos-ventas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-bloom-300 border-t-transparent" />
        <p className="mt-3 text-sm">Cargando reportes…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bloom-800">Reportes de ventas</h1>
        {days.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-bloom-100 px-3 py-2 text-sm font-semibold text-bloom-700 transition hover:bg-bloom-200"
          >
            ⬇️ Exportar CSV
          </button>
        )}
      </div>

      {/* Totales por periodo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-bloom-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hoy</p>
          <p className="mt-1 text-2xl font-extrabold text-bloom-800">{formatPrice(totals.today)}</p>
        </div>
        <div className="rounded-2xl bg-bloom-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Últimos 7 días</p>
          <p className="mt-1 text-2xl font-extrabold text-bloom-800">{formatPrice(totals.week)}</p>
        </div>
        <div className="rounded-2xl bg-bloom-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Últimos 30 días</p>
          <p className="mt-1 text-2xl font-extrabold text-bloom-800">{formatPrice(totals.month)}</p>
        </div>
        <div className="rounded-2xl bg-purple-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Histórico</p>
          <p className="mt-1 text-2xl font-extrabold text-purple-900">{formatPrice(totals.all)}</p>
          <p className="text-xs text-gray-400">{totals.countAll} ventas</p>
        </div>
      </div>

      {/* Tabla por día */}
      {days.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center ring-1 ring-bloom-100">
          <p className="text-3xl">📊</p>
          <p className="mt-2 text-sm text-gray-400">Aún no hay ventas registradas.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-bloom-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bloom-100 bg-bloom-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Día</th>
                <th className="px-4 py-3 text-center">Pedidos</th>
                <th className="px-4 py-3 text-center">Unidades</th>
                <th className="px-4 py-3 text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => (
                <tr key={d.key} className={i !== 0 ? 'border-t border-bloom-50' : ''}>
                  <td className="px-4 py-3 capitalize text-gray-700">{d.label}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{d.orders}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{d.units}</td>
                  <td className="px-4 py-3 text-right font-semibold text-bloom-700">
                    {formatPrice(d.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Los pedidos cancelados no cuentan como ventas. Los ingresos incluyen el delivery.
      </p>
    </div>
  );
}

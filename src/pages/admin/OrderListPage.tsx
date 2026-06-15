import { useEffect, useMemo, useState } from 'react';
import type { Order, OrderStatus } from '@/types';
import { getOrderRepository } from '@/repositories/orderRepository';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, STORE } from '@/lib/constants';
import { formatPrice } from '@/lib/format';

const ALL = 'todos' as const;
type Filter = typeof ALL | OrderStatus;

const STATUS_FILTERS: { value: Filter; label: string }[] = [
  { value: ALL, label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_preparacion', label: 'En preparación' },
  { value: 'listo', label: 'Listos' },
  { value: 'enviado', label: 'Enviados' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'cancelado', label: 'Cancelados' },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_COLORS[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function OrderListPage() {
  const repo = getOrderRepository();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(ALL);
  const [search, setSearch] = useState('');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const reload = async () => {
    const all = await repo.list();
    setOrders(all);
    const draft: Record<string, string> = {};
    all.forEach((o) => { draft[o.orderNumber] = o.adminNotes ?? ''; });
    setNotesDraft(draft);
    setLoading(false);
  };

  useEffect(() => { void reload(); }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...orders].reverse().filter((o) => {
      const matchFilter = filter === ALL || o.status === filter;
      const matchSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.form.fullName.toLowerCase().includes(q) ||
        o.form.phone.includes(q);
      return matchFilter && matchSearch;
    });
  }, [orders, filter, search]);

  const handleStatus = async (orderNumber: string, status: OrderStatus) => {
    await repo.updateStatus(orderNumber, status);
    await reload();
  };

  const handleSaveNotes = async (orderNumber: string) => {
    await repo.updateAdminNotes(orderNumber, notesDraft[orderNumber] ?? '');
    setSavedNotes((prev) => ({ ...prev, [orderNumber]: true }));
    setTimeout(() => setSavedNotes((prev) => ({ ...prev, [orderNumber]: false })), 2000);
  };

  const handleDelete = async (orderNumber: string) => {
    const ok = window.confirm(
      `¿Eliminar el pedido ${orderNumber}? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;
    setDeleting(orderNumber);
    try {
      await repo.remove(orderNumber);
      await reload();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bloom-800">Pedidos</h1>
        <span className="rounded-full bg-bloom-100 px-3 py-0.5 text-sm font-medium text-bloom-700">
          {orders.length} total
        </span>
      </div>

      {/* Búsqueda */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por # de pedido, nombre o teléfono…"
        className="input-base"
      />

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count =
            value === ALL
              ? orders.length
              : orders.filter((o) => o.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === value
                  ? 'bg-bloom-700 text-white'
                  : 'bg-white text-gray-600 ring-1 ring-bloom-100 hover:bg-bloom-50'
              }`}
            >
              {label} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Cargando */}
      {loading && (
        <div className="py-16 text-center text-gray-400">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-bloom-300 border-t-transparent" />
          <p className="mt-3 text-sm">Cargando pedidos…</p>
        </div>
      )}

      {/* Lista vacía */}
      {!loading && visible.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl">📋</p>
          <p className="mt-3 text-base font-medium">
            {orders.length === 0
              ? 'No hay pedidos registrados todavía.'
              : 'Ningún pedido coincide con el filtro.'}
          </p>
        </div>
      )}

      {/* Tarjetas de pedido */}
      {visible.map((order) => {
        const isOpen = expanded === order.orderNumber;
        return (
          <div
            key={order.orderNumber}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-bloom-100"
          >
            {/* Cabecera — siempre visible */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : order.orderNumber)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-bloom-50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-bloom-800">{order.orderNumber}</span>
                <StatusBadge status={order.status} />
                <span className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString('es-VE', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-sm text-gray-500 sm:block">{order.form.fullName}</span>
                <span className="font-semibold text-bloom-700">{formatPrice(order.total)}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {/* Detalle expandido */}
            {isOpen && (
              <div className="space-y-5 border-t border-bloom-50 px-4 py-5">
                {/* Cliente + pago */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Cliente
                    </p>
                    <p className="text-sm font-medium text-gray-800">{order.form.fullName}</p>
                    <p className="text-sm text-gray-500">{order.form.phone}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Método de pago
                    </p>
                    <p className="text-sm text-gray-700">{order.form.payment}</p>
                  </div>
                </div>

                {/* Entrega */}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Entrega
                  </p>
                  {order.form.shipping === 'delivery' && (
                    <div className="space-y-0.5 text-sm text-gray-700">
                      <p>🚗 Delivery — {formatPrice(order.deliveryPrice)}</p>
                      {order.form.address && (
                        <p className="text-gray-500">{order.form.address}</p>
                      )}
                    </div>
                  )}
                  {order.form.shipping === 'pickup' && (
                    <p className="text-sm text-gray-700">
                      🏪 Retiro en tienda — {STORE.address}
                    </p>
                  )}
                  {order.form.shipping === 'national_mrw' && order.form.mrw && (
                    <div className="space-y-0.5 text-sm text-gray-700">
                      <p>📦 Envío Nacional MRW</p>
                      <p className="text-gray-500">
                        Agencia: {order.form.mrw.agency} · Cédula: {order.form.mrw.cedula}
                      </p>
                      <p className="text-gray-500">
                        {order.form.mrw.recipientName} — {order.form.mrw.recipientPhone}
                      </p>
                    </div>
                  )}
                </div>

                {/* Productos */}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Productos
                  </p>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}× {item.product.name}
                          {item.cardMessage && (
                            <span className="ml-1 text-xs text-gray-400 italic">
                              💌 "{item.cardMessage}"
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-gray-500">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex justify-between border-t border-bloom-50 pt-2 text-sm font-bold text-bloom-800">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Nota del cliente */}
                {order.form.notes && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Nota del cliente
                    </p>
                    <p className="text-sm text-gray-600">{order.form.notes}</p>
                  </div>
                )}

                {/* Notas internas (admin) */}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Notas internas del equipo
                  </p>
                  <textarea
                    rows={2}
                    value={notesDraft[order.orderNumber] ?? ''}
                    onChange={(e) =>
                      setNotesDraft((prev) => ({
                        ...prev,
                        [order.orderNumber]: e.target.value,
                      }))
                    }
                    placeholder="Ej: Coordinado entrega 3pm, pago confirmado…"
                    className="input-base resize-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveNotes(order.orderNumber)}
                    className="mt-1.5 rounded-lg bg-bloom-100 px-3 py-1.5 text-xs font-semibold text-bloom-700 transition hover:bg-bloom-200"
                  >
                    {savedNotes[order.orderNumber] ? '✓ Nota guardada' : 'Guardar nota'}
                  </button>
                </div>

                {/* Actualizar estado */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Actualizar estado
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'pendiente',
                        'en_preparacion',
                        'listo',
                        'enviado',
                        'entregado',
                        'cancelado',
                      ] as OrderStatus[]
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleStatus(order.orderNumber, s)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          order.status === s
                            ? ORDER_STATUS_COLORS[s]
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eliminar pedido */}
                <div className="border-t border-bloom-50 pt-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(order.orderNumber)}
                    disabled={deleting === order.orderNumber}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting === order.orderNumber ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        Eliminando…
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Eliminar pedido
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

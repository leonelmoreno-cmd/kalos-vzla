import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { describeOptions, lineTotal } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { ZoomableProductImage } from './ZoomableProductImage';
import { QuantityStepper } from './ui/QuantityStepper';
import { Button } from './ui/Button';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Carrito lateral deslizable. */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, setQuantity, remove } = useCart();
  const navigate = useNavigate();

  const goToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel lateral */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-bloom-50 shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b border-bloom-100 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Tu carrito</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-gray-500">
            <span className="text-5xl" aria-hidden>
              🛒
            </span>
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="text-sm">Agrega algunas flores hermosas para comenzar.</p>
            <Button variant="secondary" onClick={onClose}>
              Ver flores
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => {
                const opts = describeOptions(item);
                return (
                  <div key={item.id} className="card flex gap-3 p-3">
                    <ZoomableProductImage
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-20 w-20 flex-shrink-0 rounded-xl"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-medium text-gray-800">{item.product.name}</p>
                        <button
                          onClick={() => remove(item.id)}
                          aria-label="Eliminar producto"
                          className="text-gray-300 hover:text-red-500"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                      {opts && <p className="text-xs text-gray-400">{opts}</p>}
                      {item.cardMessage && (
                        <p className="truncate text-xs italic text-gray-400">"{item.cardMessage}"</p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(q) => setQuantity(item.id, q)}
                        />
                        <span className="font-semibold text-bloom-700">
                          {formatPrice(lineTotal(item))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-bloom-100 bg-white px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-xl font-bold text-bloom-700">{formatPrice(total)}</span>
              </div>
              <Button onClick={goToCheckout} size="lg" className="w-full">
                Finalizar pedido
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

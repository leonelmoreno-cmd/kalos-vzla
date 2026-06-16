import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { useCart } from '@/context/CartContext';

/** Shell principal: cabecera, página, pie, carrito lateral y botón WhatsApp flotante. */
export function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { addSignal } = useCart();

  // Muestra un aviso transitorio cada vez que se agrega un producto.
  useEffect(() => {
    if (addSignal === 0) return;
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 4500);
    return () => clearTimeout(t);
  }, [addSignal]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppFloat />

      {/* Aviso "agregado al carrito" */}
      {showToast && !cartOpen && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <button
            type="button"
            onClick={() => {
              setShowToast(false);
              setCartOpen(true);
            }}
            className="flex items-center gap-3 rounded-2xl bg-bloom-800 px-4 py-3 text-left text-white shadow-lg ring-1 ring-bloom-900/20 transition hover:bg-bloom-900 animate-[fadeInUp_0.25s_ease-out]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bloom-600 text-base">
              ✓
            </span>
            <span className="text-sm font-semibold">Agregado · Ver carrito →</span>
          </button>
        </div>
      )}
    </div>
  );
}

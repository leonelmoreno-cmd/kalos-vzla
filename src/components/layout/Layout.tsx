import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';

/** Shell principal: cabecera, página, pie, carrito lateral y botón WhatsApp flotante. */
export function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppFloat />
    </div>
  );
}

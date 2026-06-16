import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-30 border-b border-bloom-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-2.5 leading-none">
          <img src="/logo.png" alt="kalos.vzla" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-bloom-800">
              kalos<span className="text-bloom-700">.vzla</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-gray-400">
              Cuadros · Fotos · Regalos · Flores · Arreglos
            </span>
          </div>
        </Link>

        {/* Carrito */}
        <button
          onClick={onCartClick}
          className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-white transition-all ${
            count > 0
              ? 'bg-bloom-600 shadow-lg shadow-bloom-400/50 hover:bg-bloom-700 hover:shadow-bloom-400/70'
              : 'bg-bloom-700 text-sm hover:bg-bloom-800'
          }`}
          aria-label="Abrir carrito"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.6" />
            <circle cx="18" cy="20" r="1.6" />
          </svg>
          <span className={`hidden sm:inline ${count > 0 ? 'text-base font-bold' : 'text-sm'}`}>
            {count > 0 ? 'Ir a pagar' : 'Carrito'}
          </span>
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-black text-white shadow-md animate-pulse">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminLoginPage } from './AdminLoginPage';

export function AdminLayout() {
  const { isAuthed, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAuthed) return <AdminLoginPage />;

  return (
    <div className="flex min-h-screen flex-col bg-bloom-50">
      <header className="border-b border-bloom-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🌸
            </span>
            <span className="font-bold text-bloom-700">Administración</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-gray-500 hover:text-bloom-600">
              Ver tienda
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/admin');
              }}
              className="font-medium text-bloom-700 hover:text-bloom-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-bloom-100 bg-white">
        <div className="mx-auto flex max-w-4xl gap-1 px-4">
          {[
            { to: '/admin', label: 'Inicio', end: true },
            { to: '/admin/products', label: 'Productos', end: false },
            { to: '/admin/orders', label: 'Pedidos', end: false },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-bloom-700 text-bloom-700'
                    : 'border-transparent text-gray-500 hover:text-bloom-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Field, TextInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(passcode)) {
      setError('Contraseña incorrecta.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bloom-50 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <span className="text-3xl" aria-hidden>
            🌸
          </span>
          <h1 className="mt-2 text-xl font-bold text-bloom-800">Panel de administración</h1>
          <p className="mt-1 text-sm text-gray-500">Ingresa tu contraseña para gestionar productos.</p>
        </div>
        <Field label="Contraseña" error={error}>
          <div className="relative">
            <TextInput
              type={showPassword ? 'text' : 'password'}
              value={passcode}
              hasError={!!error}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(undefined);
              }}
              placeholder="••••••••"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
        </Field>
        <Button type="submit" size="lg" className="mt-4 w-full">
          Ingresar
        </Button>
        <Link
          to="/"
          className="mt-4 block text-center text-xs text-gray-400 hover:text-bloom-600"
        >
          Volver a la tienda
        </Link>
      </form>
    </div>
  );
}

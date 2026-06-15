import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Field, TextInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | undefined>();

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
          <TextInput
            type="password"
            value={passcode}
            hasError={!!error}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError(undefined);
            }}
            placeholder="••••••••"
            autoFocus
          />
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

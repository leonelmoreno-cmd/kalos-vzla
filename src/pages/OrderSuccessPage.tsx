import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { WA_CONTACT_URL } from '@/lib/constants';

export function OrderSuccessPage() {
  const { state } = useLocation();
  const orderNumber: string | undefined = (state as { orderNumber?: string } | null)?.orderNumber;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bloom-100 text-4xl">
        💚
      </div>
      <h1 className="mt-6 text-2xl font-bold text-bloom-800">¡Recibimos tu pedido!</h1>
      {orderNumber && (
        <p className="mt-2 rounded-xl bg-bloom-50 px-4 py-2 text-sm font-semibold text-bloom-700 ring-1 ring-bloom-200">
          Número de pedido: <span className="font-extrabold">{orderNumber}</span>
        </p>
      )}
      <p className="mt-4 text-gray-500 leading-relaxed">
        Abrimos WhatsApp con los detalles de tu pedido. Envía el mensaje y nuestro equipo
        te confirmará todo a la brevedad 💚
      </p>
      <p className="mt-3 text-sm text-gray-400 leading-relaxed">
        ¿No se abrió WhatsApp?{' '}
        <a
          href={WA_CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bloom-600 underline"
        >
          Toca aquí para escribirnos
        </a>{' '}
        y menciónanos tu número de teléfono y tu número de pedido.
      </p>
      <Link to="/" className="mt-8">
        <Button size="lg">Volver a la tienda</Button>
      </Link>
    </div>
  );
}

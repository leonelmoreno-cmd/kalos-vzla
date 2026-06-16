import { WA_CONTACT_URL } from '@/lib/constants';

/**
 * Botón flotante de WhatsApp siempre visible.
 * "¿Tienes alguna pregunta? Presiona aquí para escribirle a kalos.vzla"
 */
export function WhatsAppFloat() {
  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2">
      {/* Burbuja de texto */}
      <a
        href={WA_CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-[220px] rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-xs font-medium text-gray-700 shadow-lg ring-1 ring-gray-200 hover:ring-bloom-300 transition"
      >
¿Dudas? <span className="font-semibold text-bloom-600">Escríbenos por WhatsApp</span>
      </a>

      {/* Botón verde de WhatsApp */}
      <a
        href={WA_CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp a kalos.vzla"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-xl transition hover:scale-105 hover:bg-[#1faa52] active:scale-95"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.38-.49.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.57-.36.76-.36l.55.01c.18 0 .41-.07.64.49.24.57.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.62 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.64-.15.26.1 1.66.78 1.94.93.29.15.48.22.55.34.07.12.07.71-.17 1.39Z" />
        </svg>
      </a>
    </div>
  );
}

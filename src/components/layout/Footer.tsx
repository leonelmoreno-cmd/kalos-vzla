import { Link } from 'react-router-dom';
import { STORE, WA_CONTACT_URL } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-bloom-100 bg-bloom-900 text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Marca */}
          <div>
            <p className="text-xl font-extrabold tracking-tight">
              kalos<span className="text-bloom-400">.vzla</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Cuadros · Fotos · Regalos · Flores · Arreglos
            </p>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Hemos ayudado a más de 2000 personas a dar regalos inolvidables,
              haciendo todo con amor y excelencia 💚
            </p>
            <p className="mt-1 text-xs text-gray-500 italic">(1 Co 16:14)</p>
          </div>

          {/* Ubicación y horarios */}
          <div>
            <p className="text-sm font-semibold text-bloom-300 mb-2">📍 Dónde encontrarnos</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Av. Padilla (Calle 93), frente al CC Ciudad Chinita<br />
              Torres del Saladillo<br />
              Maracaibo, Zulia
            </p>
            <p className="mt-3 text-sm font-semibold text-bloom-300 mb-1">🚗 Delivery</p>
            <p className="text-sm text-gray-300">
              A cualquier zona de Maracaibo
            </p>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-sm font-semibold text-bloom-300 mb-2">💬 Escríbenos</p>
            <a
              href={WA_CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1faa52] transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.38-.49.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.57-.36.76-.36l.55.01c.18 0 .41-.07.64.49.24.57.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.62 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.64-.15.26.1 1.66.78 1.94.93.29.15.48.22.55.34.07.12.07.71-.17 1.39Z" />
              </svg>
              WhatsApp: {STORE.whatsappDisplay}
            </a>
            <p className="mt-3 text-xs text-gray-400">{STORE.instagram}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-bloom-800 pt-6 text-xs text-gray-500">
          <p>© 2026 kalos.vzla — Maracaibo, Venezuela</p>
          <Link to="/admin" className="hover:text-bloom-300 transition">
            Administración
          </Link>
        </div>
      </div>
    </footer>
  );
}

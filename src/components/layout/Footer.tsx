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
            <p className="text-sm font-semibold text-bloom-300 mb-3">💬 Escríbenos</p>
            <div className="flex flex-col items-start gap-3">
              <a
                href={WA_CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1faa52] transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.38-.49.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.57-.36.76-.36l.55.01c.18 0 .41-.07.64.49.24.57.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.62 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.64-.15.26.1 1.66.78 1.94.93.29.15.48.22.55.34.07.12.07.71-.17 1.39Z" />
                </svg>
                WhatsApp
              </a>
              <a
                href="https://www.instagram.com/kalos.vzla/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-pink-600 hover:to-rose-600 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                </svg>
                Instagram
              </a>
              <p className="text-xs text-gray-400">{STORE.whatsappDisplay} · {STORE.instagram}</p>
            </div>
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

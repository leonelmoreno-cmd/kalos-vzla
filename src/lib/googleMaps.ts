/**
 * Carga perezosa del SDK de Google Maps (JavaScript API + Places).
 *
 * El token se configura en la variable de entorno VITE_GOOGLE_MAPS_API_KEY.
 * Si no está configurada, `hasGoogleMaps()` devuelve false y la app usa el
 * fallback de Nominatim (OpenStreetMap) para geocodificar direcciones.
 *
 * Para activarlo:
 *   1. Crea una API key en Google Cloud Console.
 *   2. Habilita "Maps JavaScript API" y "Places API".
 *   3. Restringe la key por dominio (kalos-vzla.vercel.app, localhost).
 *   4. Define VITE_GOOGLE_MAPS_API_KEY en Vercel y en tu .env local.
 */

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

let loadPromise: Promise<void> | null = null;

/** ¿Hay token de Google Maps configurado? */
export function hasGoogleMaps(): boolean {
  return Boolean(KEY && KEY.trim());
}

/** Carga el script de Google Maps una sola vez. */
export function loadGoogleMaps(): Promise<void> {
  if (!hasGoogleMaps()) {
    return Promise.reject(new Error('Google Maps API key no configurada'));
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    // Ya cargado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${KEY}` +
      '&libraries=places&language=es&region=VE&loading=async';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

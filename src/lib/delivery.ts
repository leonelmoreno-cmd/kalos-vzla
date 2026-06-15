import { STORE } from './constants';

/** Convierte grados a radianes. */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Distancia Haversine entre dos puntos (lat/lng en grados). Resultado en km.
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Calcula el precio del delivery dado el número de km. */
export function deliveryPrice(km: number): number {
  const calculated = km * STORE.deliveryRatePerKm;
  return Math.max(STORE.deliveryMinPrice, Math.round(calculated * 100) / 100);
}

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Geocodifica una dirección en Maracaibo usando Nominatim (sin API key).
 * Usa búsqueda estructurada para mejor precisión.
 */
export async function geocodeAddress(address: string): Promise<GeoResult> {
  // Limpia la dirección y la divide por comas
  const trimmed = address.trim();

  // Construye la URL con búsqueda estructurada
  // Nominatim Doc: https://nominatim.org/release-docs/latest/api/Search/
  const params = new URLSearchParams({
    street: trimmed,
    city: 'Maracaibo',
    state: 'Zulia',
    country: 'Venezuela',
    format: 'json',
    limit: '3',
    countrycodes: 've',
    // Prioriza resultados cercanos a Maracaibo (viewbox)
    viewbox: '-72.5,10.5,-71.5,11.0',
    bounded: '1',
  });

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  const resp = await fetch(url, {
    headers: {
      'Accept-Language': 'es',
      'User-Agent': 'kalos.vzla-store/1.0',
    },
  });

  if (!resp.ok) {
    throw new Error('Error de conexión al buscar la dirección');
  }

  const data = (await resp.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    importance?: number;
  }>;

  if (!data.length) {
    throw new Error(
      'No se encontró la dirección. Intenta con: "Av. Nombre, Edif. X, piso Y, apto Z"',
    );
  }

  // Toma el resultado con mayor importancia (relevancia)
  const best = data.reduce((prev, curr) =>
    ((curr.importance ?? 0) > (prev.importance ?? 0) ? curr : prev)
  );

  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    displayName: best.display_name,
  };
}

/**
 * Calcula el precio de delivery a partir de coordenadas GPS del cliente.
 * Uso principal: resultado de navigator.geolocation.getCurrentPosition().
 */
export function deliveryPriceFromCoords(
  userLat: number,
  userLng: number,
): { price: number; km: number } {
  const km = haversineKm(STORE.lat, STORE.lng, userLat, userLng);
  return { price: deliveryPrice(km), km: Math.round(km * 10) / 10 };
}

/**
 * Calcula el precio de delivery para una dirección escrita (fallback sin GPS).
 */
export async function calculateDeliveryPrice(
  address: string,
): Promise<{ price: number; km: number; displayName: string }> {
  const geo = await geocodeAddress(address);
  const km = haversineKm(STORE.lat, STORE.lng, geo.lat, geo.lng);
  return { price: deliveryPrice(km), km: Math.round(km * 10) / 10, displayName: geo.displayName };
}

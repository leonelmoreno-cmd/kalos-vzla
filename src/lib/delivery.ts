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
 * Lanza un error si no encuentra resultados.
 */
export async function geocodeAddress(address: string): Promise<GeoResult> {
  const query = encodeURIComponent(`${address}, Maracaibo, Venezuela`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ve`;

  const resp = await fetch(url, {
    headers: { 'Accept-Language': 'es', 'User-Agent': 'kalos.vzla-store/1.0' },
  });
  if (!resp.ok) throw new Error('Error de red al calcular distancia');

  const data = (await resp.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!data.length) throw new Error('No se encontró la dirección en Maracaibo');

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
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

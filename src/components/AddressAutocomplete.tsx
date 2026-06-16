import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/googleMaps';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PlaceResult {
  lat: number;
  lng: number;
  formatted: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  /** Se dispara cuando el usuario elige una dirección de las sugerencias. */
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
  /** Notifica si Google Maps no pudo cargar (para activar el fallback). */
  onUnavailable?: () => void;
}

/**
 * Campo de dirección con autocompletado de Google Places, sesgado a Maracaibo
 * y restringido a Venezuela. Al elegir una sugerencia entrega lat/lng exactos
 * para calcular el delivery con precisión.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  onUnavailable,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !inputRef.current) return;
        const g = (window as any).google;

        const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 've' },
          fields: ['geometry', 'formatted_address', 'name'],
          types: ['geocode'],
        });

        // Sesgar resultados hacia Maracaibo
        const bounds = new g.maps.LatLngBounds(
          new g.maps.LatLng(10.5, -72.0),
          new g.maps.LatLng(10.9, -71.3),
        );
        autocomplete.setBounds(bounds);

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const loc = place?.geometry?.location;
          if (!loc) return;
          const formatted = place.formatted_address || place.name || '';
          onChange(formatted);
          onSelect({ lat: loc.lat(), lng: loc.lng(), formatted });
        });

        setReady(true);
      })
      .catch(() => {
        if (!cancelled) onUnavailable?.();
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Empieza a escribir la dirección…'}
        className="input-base"
        autoComplete="off"
      />
      {ready && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          🔎 Google
        </span>
      )}
    </div>
  );
}

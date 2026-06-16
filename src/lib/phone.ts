/**
 * Helpers para teléfonos.
 */

/**
 * Normaliza un número de teléfono: agrega "+58" si no tiene código de país.
 *
 * - "424 4707676" → "+58 424 4707676"
 * - "+58 424 4707676" → "+58 424 4707676" (sin cambios)
 * - "+1 234 5678" → "+1 234 5678" (otro código, sin cambios)
 * - "" → "" (vacío, sin cambios)
 */
export function normalizePhone(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('+')) return trimmed;
  return `+58 ${trimmed}`;
}

/**
 * Helpers para normalizar datos (homologar etiquetas, etc).
 */

/**
 * Normaliza una etiqueta: lowercase, trim, espacios múltiples → uno solo.
 * Útil para detectar duplicados ("Rojo", "rojo ", "ROJO" → "rojo").
 */
export function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Detecta duplicados en una lista de labels (después de normalizar).
 * Retorna los labels normalizados que aparecen más de una vez.
 */
export function findDuplicateLabels(labels: string[]): string[] {
  const normalized = labels.map(normalizeLabel);
  const seen = new Set<string>();
  const dupes = new Set<string>();

  normalized.forEach((n) => {
    if (seen.has(n)) {
      dupes.add(n);
    }
    seen.add(n);
  });

  return Array.from(dupes);
}

/**
 * Helpers para la subida de comprobantes de pago al Storage de Supabase.
 */

/**
 * Construye una ruta segura dentro de la carpeta `receipts/`.
 *
 * Limpia el nombre original del archivo para evitar fallos de subida por
 * espacios, acentos o caracteres especiales en la clave del objeto, y le
 * antepone una marca de tiempo para que sea único.
 */
export function receiptPath(fileName: string, now: number = Date.now()): string {
  const dot = fileName.lastIndexOf('.');
  const rawExt = dot > 0 ? fileName.slice(dot + 1) : '';
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  const safeExt = ext ? `.${ext}` : '';
  return `receipts/${now}-comprobante${safeExt}`;
}

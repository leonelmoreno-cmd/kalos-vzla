-- =====================================================================
-- kalos.vzla — Comprobantes de pago (Storage RLS)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
--
-- PROBLEMA QUE RESUELVE:
--   Al finalizar el pedido, el cliente (anónimo, sin cuenta) sube su
--   comprobante de pago al bucket "products" en la carpeta "receipts/".
--   Las políticas originales del bucket solo permiten subir a usuarios
--   AUTENTICADOS (el admin), por lo que el cliente recibía el error:
--       "new row violates row-level security policy"
--
-- SOLUCIÓN:
--   Permitir que cualquiera (rol anon/público) pueda SUBIR archivos
--   ÚNICAMENTE dentro de la carpeta "receipts/" del bucket "products".
--   El resto del bucket (imágenes del catálogo) sigue protegido: solo el
--   admin autenticado puede escribir ahí. La lectura ya es pública.
--
--   Es idempotente: se puede ejecutar varias veces sin error.
-- =====================================================================

-- Asegura que el bucket exista y sea público (lectura).
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- El cliente anónimo puede SUBIR su comprobante solo a "receipts/".
DROP POLICY IF EXISTS "receipts_public_insert" ON storage.objects;
CREATE POLICY "receipts_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = 'receipts'
  );

-- Permitir UPDATE en "receipts/" para que `upsert: true` funcione si por
-- casualidad se repite el nombre del archivo.
DROP POLICY IF EXISTS "receipts_public_update" ON storage.objects;
CREATE POLICY "receipts_public_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = 'receipts'
  )
  WITH CHECK (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = 'receipts'
  );

-- La lectura pública ya está cubierta por "products_images_public_read"
-- (USING bucket_id = 'products'), así que el comprobante queda accesible
-- por su URL para adjuntarlo en WhatsApp.

-- ─────────────────────────────────────────────────────────────────────
-- Verificación:
-- SELECT policyname, cmd FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects'
--   AND policyname LIKE 'receipts_%';
-- =====================================================================

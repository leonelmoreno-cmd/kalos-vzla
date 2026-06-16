-- =====================================================================
-- kalos.vzla — Agregar columna receipt_url a la tabla orders
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
--
-- PROBLEMA:
--   El URL del comprobante de pago está guardado dentro del JSON `form`,
--   lo que lo hace difícil de ver/filtrar en el dashboard de Supabase.
--
-- SOLUCIÓN:
--   Agregar una columna explícita `receipt_url TEXT` para que sea fácil
--   acceder, filtrar y ver en el admin panel. El código seguirá guardando
--   el comprobante en ambos sitios (JSON + columna) para compatibilidad.
-- =====================================================================

-- Agregar columna si no existe (idempotente)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Migración retroactiva: copiar receiptUrl del JSON a la columna
-- (solo las órdenes que ya lo tienen guardado)
UPDATE orders
SET receipt_url = (form ->> 'receiptUrl')
WHERE form ->> 'receiptUrl' IS NOT NULL
  AND receipt_url IS NULL;

-- ─────────────────────────────────────────────────────────────────────
-- Verificación:
-- SELECT order_number, receipt_url FROM orders WHERE receipt_url IS NOT NULL LIMIT 5;
-- =====================================================================

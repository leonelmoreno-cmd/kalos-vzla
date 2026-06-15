-- =====================================================================
-- kalos.vzla — Migración de la tabla ORDERS (pedidos)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
--
-- Esta versión usa una SECUENCIA para generar el número de pedido
-- (KLS-0001, KLS-0002…) de forma atómica en la base de datos, y guarda
-- el carrito y el formulario completos como JSONB.
--
-- ⚠️ Si ya tienes una tabla `orders` vieja y vacía, este script la
--    reemplaza. Si tiene pedidos que quieres conservar, haz un respaldo.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Secuencia para el número correlativo de pedido
CREATE SEQUENCE IF NOT EXISTS kls_order_seq START 1;

-- Reemplazar tabla orders
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT          UNIQUE NOT NULL
                  DEFAULT ('KLS-' || lpad(nextval('kls_order_seq')::text, 4, '0')),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  status          TEXT          NOT NULL DEFAULT 'pendiente'
                  CHECK (status IN (
                    'pendiente', 'en_preparacion', 'listo',
                    'enviado', 'entregado', 'cancelado'
                  )),

  -- Datos del cliente
  customer_name   TEXT          NOT NULL,
  customer_phone  TEXT          NOT NULL,
  customer_notes  TEXT,

  -- Entrega
  shipping_method TEXT          NOT NULL,
  address         TEXT,
  delivery_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method  TEXT          NOT NULL,

  -- Totales
  subtotal        NUMERIC(10,2) NOT NULL,
  total           NUMERIC(10,2) NOT NULL,

  -- Snapshots completos
  items           JSONB         NOT NULL DEFAULT '[]',
  form            JSONB         NOT NULL DEFAULT '{}',

  -- Notas internas del equipo (no visibles al cliente)
  admin_notes     TEXT
);

CREATE INDEX orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX orders_status_idx     ON orders (status);

-- ─────────────────────────────────────────────────────────────────────
-- RLS: el cliente (anónimo) puede CREAR pedidos; solo el admin
-- autenticado puede leer, actualizar y borrar.
-- Para la fase actual (sin Supabase Auth en el panel) usamos políticas
-- permisivas para que el dashboard funcione con la publishable key.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_insert_anon"  ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "orders_select_anon"  ON orders FOR SELECT TO public USING (true);
CREATE POLICY "orders_update_anon"  ON orders FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete_anon"  ON orders FOR DELETE TO public USING (true);

-- Verificación:
-- SELECT order_number, customer_name, total, status FROM orders ORDER BY created_at DESC;

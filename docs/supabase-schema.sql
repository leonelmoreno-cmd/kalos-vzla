-- =====================================================================
-- kalos.vzla — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────────────
-- TABLA: products
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT          NOT NULL,
  description        TEXT          NOT NULL DEFAULT '',
  base_price         NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  image_url          TEXT          NOT NULL DEFAULT '',
  category           TEXT,
  available          BOOLEAN       NOT NULL DEFAULT true,
  allow_card_message BOOLEAN       NOT NULL DEFAULT false,
  requires_photos    BOOLEAN       NOT NULL DEFAULT false,
  note               TEXT,
  -- Variantes: [{id, label, choices: [{id, label, priceDelta?}]}]
  options            JSONB         NOT NULL DEFAULT '[]',
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────
-- TABLA: orders
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT          UNIQUE NOT NULL,   -- KLS-0001, KLS-0002…
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),

  status           TEXT          NOT NULL DEFAULT 'pendiente'
                   CHECK (status IN (
                     'pendiente', 'en_preparacion', 'listo',
                     'enviado', 'entregado', 'cancelado'
                   )),

  -- Snapshot del carrito: [{id, product, quantity, selectedOptions, cardMessage, unitPrice}]
  items            JSONB         NOT NULL DEFAULT '[]',

  -- Datos del cliente
  customer_name    TEXT          NOT NULL,
  customer_phone   TEXT          NOT NULL,
  customer_notes   TEXT,

  -- Envío
  shipping_method  TEXT          NOT NULL
                   CHECK (shipping_method IN ('delivery', 'pickup', 'national_mrw')),
  shipping_address TEXT,
  delivery_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_km      NUMERIC(8,2),

  -- Datos MRW (solo si shipping_method = 'national_mrw')
  -- {agency, cedula, recipientPhone, recipientName}
  mrw_data         JSONB,

  -- Pago
  payment_method   TEXT          NOT NULL,

  -- Totales
  subtotal         NUMERIC(10,2) NOT NULL,
  total            NUMERIC(10,2) NOT NULL,

  -- Notas internas del equipo — NO visibles al cliente
  admin_notes      TEXT
);

-- ─────────────────────────────────────────────────────────────────────
-- TRIGGER: auto-actualizar updated_at
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: catálogo público → cualquiera puede leer
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (true);

-- PRODUCTS: solo admin autenticado puede escribir
CREATE POLICY "products_admin_insert"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "products_admin_update"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "products_admin_delete"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- ORDERS: cliente anónimo puede insertar (hace el pedido sin cuenta)
CREATE POLICY "orders_anon_insert"
  ON orders FOR INSERT
  WITH CHECK (true);

-- ORDERS: solo admin autenticado puede leer y modificar
CREATE POLICY "orders_admin_read"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────
-- ÍNDICES (mejoran búsquedas en el panel admin)
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS orders_status_idx      ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx  ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS products_category_idx  ON products (category);
CREATE INDEX IF NOT EXISTS products_available_idx ON products (available);

-- ─────────────────────────────────────────────────────────────────────
-- STORAGE: bucket "products" para imágenes del catálogo
-- También se puede crear desde: Dashboard → Storage → New bucket
-- Nombre: "products", activar "Public bucket"
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública de imágenes
CREATE POLICY "products_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Solo admin puede subir/editar/borrar imágenes
CREATE POLICY "products_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "products_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "products_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────
-- Verificación (ejecutar por separado para confirmar)
-- ─────────────────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN ('products', 'orders');

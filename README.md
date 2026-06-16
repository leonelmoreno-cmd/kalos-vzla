# 🎁 kalos.vzla

Progressive Web App (PWA) de regalos para **Maracaibo y toda Venezuela**: cuadros, fotos,
regalos, flores y arreglos. Los clientes exploran el catálogo, personalizan, arman su
carrito y finalizan el pedido por **WhatsApp** con un mensaje pre-formateado — sin app que
descargar, sin pasarela de pago, sin comisiones.

El panel de **administración** permite a la dueña gestionar catálogo, pedidos y ver
reportes de ventas desde cualquier dispositivo, sin tocar código.

## Tecnologías

| Capa | Tecnología | Dónde corre |
| --- | --- | --- |
| Frontend / PWA | React 18 + Vite 5 + TypeScript + Tailwind CSS 3 | Vercel |
| Datos | Repositorio intercambiable (localStorage ↔ Supabase) | Supabase Cloud |
| Imágenes | Supabase Storage | Supabase Cloud |
| Checkout | Enlace profundo de WhatsApp (`wa.me`) | — |
| Direcciones | Google Maps Places API (con fallback a Nominatim/OpenStreetMap) | — |
| Tests / CI | Vitest + GitHub Actions | GitHub |

## Inicio rápido

```bash
npm install
cp .env.example .env      # edita los valores
npm run dev
```

Abre la URL local de Vite. La tienda está en `/`, el panel de administración en `/admin`.

### Variables de entorno (`.env`)

| Variable | Propósito |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` | Número de WhatsApp del negocio, **solo dígitos** (ej. `584246263545`). |
| `VITE_DATA_SOURCE` | `local` (localStorage) o `supabase`. |
| `VITE_ADMIN_PASSCODE` | Contraseña del panel de administración. |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (modo `supabase`). |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (publishable/anon) de Supabase. |
| `VITE_GOOGLE_MAPS_API_KEY` | *(Opcional)* activa el autocompletado de direcciones en el checkout. |

## Cómo funciona

1. **Explora** — `CatalogPage` muestra los productos del repositorio activo (18 reales del catálogo Día del Padre).
2. **Personaliza y agrega** — `ProductCustomizeModal` recoge opciones y mensaje de tarjeta; la línea va al carrito (`CartContext`, persistido en `localStorage`). Un aviso invita a finalizar.
3. **Checkout** — `CheckoutPage` valida nombre y teléfono internacional, método de entrega (Delivery con GPS o dirección / Retiro / MRW nacional) y pago. El punto de referencia exacto es opcional.
4. **Pedido** — se registra en Supabase (tabla `orders`, número `KLS-XXXX` automático) y se abre `wa.me/<número>` con el resumen.

### Delivery — cálculo de distancia

- **GPS:** el navegador da las coordenadas del cliente → distancia Haversine desde la tienda.
- **Dirección escrita:** con `VITE_GOOGLE_MAPS_API_KEY`, autocompletado de Google Places
  (coordenadas exactas). Sin token, fallback a Nominatim (OpenStreetMap).
- Precio: `km × $0.50`, mínimo `$1.50` (interno, no se muestra al cliente).

## Panel de administración (`/admin`)

Protegido con `VITE_ADMIN_PASSCODE` (sesión en `sessionStorage`).

- **Inicio** — estadísticas, últimos pedidos, accesos rápidos.
- **Productos** — crear/editar/eliminar, subir foto (a Supabase Storage), opciones y disponibilidad.
- **Pedidos** — buscar, filtrar por estado, agregar notas internas, cambiar estado y **eliminar**.
- **Reportes** — ventas por día, totales (hoy / 7 / 30 días / histórico) y exportación a CSV.

> ⚠️ La contraseña es provisional. Reemplazar con **Supabase Auth + roles** antes de escalar.

## Supabase

1. Crea el proyecto y ejecuta en el SQL Editor:
   - `docs/supabase-schema.sql` (tabla `products` + Storage).
   - `docs/supabase-orders-migration.sql` (tabla `orders` con secuencia `KLS-XXXX`).
2. Carga el catálogo: `node scripts/seed-supabase.mjs` (sube imágenes + inserta 18 productos).
3. Configura `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y `VITE_DATA_SOURCE=supabase`.

El repositorio se intercambia solo — sin cambios en los componentes.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Verifica tipos y construye para producción. |
| `npm run preview` | Vista previa del build. |
| `npm run lint` | Solo verificación de tipos. |
| `npm test` | Ejecuta los tests (Vitest). |
| `npm run test:watch` | Tests en modo watch. |

## Tests y CI/CD

- **Vitest** cubre la lógica pura: carrito, delivery (Haversine/precio), validación,
  mensaje de WhatsApp, formato y el repositorio local de pedidos.
- **GitHub Actions** (`.github/workflows/ci.yml`) corre en cada push y PR:
  type-check → tests → build. Si algo falla, el deploy no se da por bueno.

## Despliegue (Vercel)

Framework **Vite**, build `npm run build`, salida `dist`. Agrega las variables `VITE_*`
en el dashboard de Vercel. Cada push a `main` dispara un deploy automático.

## Hoja de ruta

- Supabase Auth + roles para el panel.
- Backend Node.js en Render: webhooks, notificaciones automáticas por WhatsApp, emails.
- Seguimiento de pedidos en tiempo real y fidelización.

---

Para entender el proyecto en profundidad → [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)

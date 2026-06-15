# 🌸 JungleClickFlower

Una Progressive Web App (PWA) para una florería. Los clientes exploran el catálogo, personalizan arreglos, construyen su carrito y finalizan el pedido a través de **WhatsApp** con un mensaje pre-formateado — sin descargar ninguna app, sin pasarela de pago, sin comisiones.

El panel de **administración** permite gestionar productos desde cualquier dispositivo.

## Tecnologías

| Capa        | Tecnología                           |
| ----------- | ------------------------------------ |
| Frontend/PWA | React + Vite + TypeScript + Tailwind |
| Datos        | Repositorio intercambiable (localStorage → Supabase) |
| Checkout     | Enlace profundo de WhatsApp (`wa.me`) |

> La primera iteración corre **solo en el frontend**: los productos viven en el navegador
> (`localStorage`, inicializados desde `src/data/seedProducts.ts`). El conector de Supabase
> está preparado — ver [Migrar a Supabase](#migrar-a-supabase).

## Inicio rápido

```bash
npm install
cp .env.example .env      # edita los valores
npm run dev
```

Abre la URL local que imprime Vite. La tienda está en `/`, el panel de administración en `/admin`.

### Variables de entorno (`.env`)

| Variable               | Propósito                                                                 |
| ---------------------- | ------------------------------------------------------------------------- |
| `VITE_WHATSAPP_NUMBER` | Número de WhatsApp del negocio, **solo dígitos** (ej. `584244707676`).    |
| `VITE_DATA_SOURCE`     | `local` (por defecto) o `supabase`.                                       |
| `VITE_ADMIN_PASSCODE`  | Contraseña provisional del panel de administración.                       |
| `VITE_SUPABASE_URL`    | URL del proyecto Supabase (solo en modo `supabase`).                      |
| `VITE_SUPABASE_ANON_KEY` | Clave anon de Supabase (solo en modo `supabase`).                       |

## Cómo funciona

1. **Explora** — `CatalogPage` muestra los productos disponibles del repositorio activo.
2. **Personaliza y agrega** — `ProductCustomizeModal` recoge opciones (talla/color, mensaje en tarjeta) y agrega la línea al carrito (`CartContext`, persistido en `localStorage`).
3. **Checkout** — `CheckoutPage` valida los datos del cliente (nombre, teléfono internacional), el método de entrega (delivery/retiro) y el método de pago.
4. **WhatsApp** — `buildOrderMessage()` formatea el pedido y abre `wa.me/<número>`.

## Panel de administración (`/admin`)

La puerta usa `VITE_ADMIN_PASSCODE`. Permite crear, editar, eliminar productos y cambiar disponibilidad. Los cambios persisten en `localStorage` y aparecen en la tienda de inmediato.

> ⚠️ La contraseña es un marcador temporal. Reemplaza con **Supabase Auth + roles** antes de producción.

## Migrar a Supabase

1. Crea un proyecto en Supabase y ejecuta `docs/supabase-schema.sql`.
2. Configura `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_DATA_SOURCE=supabase`.
3. El repositorio se intercambia automáticamente — sin cambios en los componentes.

## Scripts

| Comando           | Descripción                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo.     |
| `npm run build`   | Verifica tipos y construye para prod. |
| `npm run preview` | Vista previa del build de producción. |
| `npm run lint`    | Solo verificación de tipos.           |

## Despliegue

Optimizado para **Vercel** (SPA estático + PWA). Comando de build: `npm run build`, salida: `dist`. Agrega las variables `VITE_*` en el dashboard de Vercel. Configura el fallback de SPA para que las rutas (`/admin/...`) resuelvan a `index.html`.

## Hoja de ruta (pendiente)

- Conexión real a Supabase (inventario en tiempo real, RLS, Auth + roles).
- API Node/Express en Render para pedidos validados en el servidor y webhooks.
- Clonación de sucursales (benchmark PideFácil).
- Seguimiento de estado de pedidos y fidelización (benchmark Flavoo).

---

Para entender el proyecto en profundidad → [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)

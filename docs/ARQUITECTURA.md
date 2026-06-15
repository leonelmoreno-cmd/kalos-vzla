# kalos.vzla — Arquitectura completa

> Guía técnica y operativa del proyecto. Cubre arquitectura, despliegue en producción,
> configuración de Supabase y todo lo necesario para lanzar y mantener la tienda en línea.

---

## ¿Qué es kalos.vzla?

Tienda online de Cuadros, Fotos, Regalos, Flores y Arreglos en Maracaibo, Venezuela.
El proceso de venta cierra en WhatsApp — no hay pasarela de cobro ni comisiones.

**Flujo del cliente:**
```
Abre el enlace → Elige su regalo → Llena el formulario → WhatsApp abre con el pedido listo
```

**Flujo de la dueña:**
```
Recibe mensaje en WhatsApp → Confirma → Prepara → Entrega
```

El panel de administración (`/admin`) le permite gestionar el catálogo y los pedidos
desde cualquier navegador sin tocar código.

---

## Stack tecnológico

| Capa | Tecnología | Dónde corre |
|---|---|---|
| **Frontend** | React 18 + Vite 5 + TypeScript + Tailwind CSS 3 | Vercel |
| **PWA** | vite-plugin-pwa (service worker, manifest, offline) | Vercel |
| **Base de datos** | Supabase (PostgreSQL) | Supabase Cloud |
| **Archivos / Imágenes** | Supabase Storage | Supabase Cloud |
| **Auth admin** | Supabase Auth (email + password) | Supabase Cloud |
| **Backend** | Node.js (Fase 3, aún no implementado) | Render |
| **Control de versiones** | GitHub | GitHub |

---

## Vista de alto nivel

```
┌────────────────────────────────────────────────────────┐
│               NAVEGADOR (Cliente / Admin)               │
│                                                        │
│   React + Vite + Tailwind  (PWA instalable)            │
│   ─────────────────────────────────────────            │
│   Tienda   ──►  Checkout  ──►  WhatsApp                │
│                                                        │
│   Panel Admin  /admin  (solo dueña)                    │
│     · Dashboard con estadísticas de pedidos            │
│     · Editar catálogo (foto, título, precio, opciones) │
│     · Gestionar pedidos (estado, notas internas)       │
└──────────────────┬─────────────────────────────────────┘
                   │  HTTPS (Supabase JS client)
                   ▼
┌────────────────────────────────────────────────────────┐
│                    SUPABASE                            │
│                                                        │
│   PostgreSQL  ─── tablas: products, orders             │
│   Storage     ─── bucket: products (imágenes)          │
│   Auth        ─── email/password para admin            │
│   RLS         ─── reglas de acceso por rol             │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│            BACKEND Node.js (Fase 3 — futuro)           │
│                                                        │
│   API-first, rutas modulares (api/handlers/)           │
│   Webhooks, notificaciones WhatsApp automáticas        │
│   Emails de confirmación                               │
│   Desplegado en Render                                 │
└────────────────────────────────────────────────────────┘
```

**Fase actual (1):** localStorage para pedidos + catálogo. Supabase listo para conectar.

---

## Estructura de carpetas

```
JungleClickFlower/
│
├── public/
│   ├── logo.png              ← Logo de kalos.vzla
│   ├── products/             ← Imágenes del catálogo (seed inicial)
│   └── icons/                ← Íconos PWA
│
├── src/
│   ├── types/index.ts        ← Tipos TypeScript: Product, Order, CartItem, etc.
│   ├── data/seedProducts.ts  ← Catálogo inicial (carga si localStorage está vacío)
│   ├── lib/
│   │   ├── constants.ts      ← Datos de la tienda, métodos de pago/envío
│   │   ├── delivery.ts       ← GPS (Haversine) + Nominatim para precio de delivery
│   │   ├── orders.ts         ← CRUD de pedidos en localStorage
│   │   ├── whatsapp.ts       ← Construye el mensaje y URL de WhatsApp
│   │   ├── validation.ts     ← Validación del formulario de checkout
│   │   ├── cart.ts           ← Cálculo de precios y totales del carrito
│   │   ├── format.ts         ← formatPrice() → "$25.00"
│   │   └── supabaseClient.ts ← Cliente Supabase (activo cuando se configuren las credenciales)
│   ├── repositories/
│   │   ├── productRepository.ts          ← Interfaz + factory getProductRepository()
│   │   ├── localProductRepository.ts     ← localStorage (actual)
│   │   └── supabaseProductRepository.ts  ← Supabase (listo para activar)
│   ├── context/
│   │   ├── CartContext.tsx       ← Estado global del carrito
│   │   └── AdminAuthContext.tsx  ← Sesión de la administradora
│   ├── components/
│   │   ├── layout/           ← Header, Footer, Layout
│   │   ├── ui/               ← Button, Input, RadioGroup, QuantityStepper, Modal
│   │   ├── ProductCard.tsx
│   │   ├── ProductCustomizeModal.tsx
│   │   ├── CartDrawer.tsx
│   │   └── WhatsAppFloat.tsx  ← Botón flotante de WhatsApp
│   └── pages/
│       ├── CatalogPage.tsx        ← Inicio / Tienda
│       ├── CheckoutPage.tsx       ← Formulario de pedido
│       ├── OrderSuccessPage.tsx   ← Confirmación post-pedido
│       └── admin/
│           ├── AdminLayout.tsx       ← Guard de auth + navegación
│           ├── AdminLoginPage.tsx    ← Login con contraseña (→ Supabase Auth en Fase 2)
│           ├── AdminDashboardPage.tsx ← Panel: stats, últimos pedidos, accesos rápidos
│           ├── ProductListPage.tsx   ← Lista, ocultar, eliminar productos
│           ├── ProductEditPage.tsx   ← Crear/editar producto (foto, título, precio, opciones)
│           └── OrderListPage.tsx     ← Gestión de pedidos: filtros, notas, estado
│
├── docs/
│   ├── ARQUITECTURA.md       ← Este archivo
│   └── supabase-schema.sql   ← Schema SQL listo para ejecutar en Supabase
│
├── .env                      ← Variables de entorno (no subir a GitHub)
├── .env.example              ← Plantilla de variables
├── tailwind.config.js        ← Paleta de colores bloom (#005919 / #edf2e3)
└── vite.config.ts            ← Vite + PWA plugin
```

---

## Las secciones de la app

### 1. 🛍️ Tienda (lo que ve el cliente)

#### Catálogo (`/`)
Pantalla de inicio. Muestra el "¿Cómo pedir?" en 4 pasos con íconos, buscador, filtros
por categoría y grilla responsiva. Al tocar una tarjeta abre el modal de personalización.

#### Carrito (drawer lateral)
Permite agregar, cambiar cantidad y eliminar. Persiste en `localStorage` entre sesiones.

#### Checkout (`/checkout`)
Formulario validado. Recoge:

| Campo | Regla |
|---|---|
| Nombre | Requerido, ≥ 2 chars |
| Teléfono | Con `+código país`, sin cero inicial |
| Entrega | Delivery (GPS) / Retiro / MRW |
| Dirección | Solo si eligió Delivery |
| Precio delivery | Calculado por km via GPS/Haversine |
| Datos MRW | Agencia, cédula, destinatario |
| Pago | Efectivo, Binance Pay, Zelle, Pago Móvil |
| Notas | Opcional |

Al confirmar:
1. Genera número `KLS-XXXX`
2. Guarda pedido en `localStorage`
3. Construye mensaje WhatsApp
4. Redirige a WhatsApp
5. Limpia carrito
6. Muestra pantalla de confirmación

#### Cálculo de delivery
Cuando el cliente elige Delivery:
1. El navegador pide permiso de ubicación GPS
2. Se toman las coordenadas GPS del cliente
3. Se calcula la distancia en km con Haversine desde la tienda (Torres del Saladillo)
4. Precio: `km × $0.50`, mínimo `$1.50` (dato interno, no se muestra al cliente)
5. Si se niega el GPS, puede ingresar su dirección manualmente → Nominatim la geocodifica

---

### 2. 🔧 Panel de Administración (`/admin`)

Protegido con contraseña (`VITE_ADMIN_PASSCODE`). La sesión dura mientras esté abierta la pestaña.

#### Dashboard (`/admin`)
- Tarjetas de estadísticas: pedidos pendientes, en preparación, hoy, ingresos totales
- Distribución de pedidos por estado
- Últimos 6 pedidos con estado
- Accesos rápidos: nuevo producto, catálogo, pedidos

#### Productos (`/admin/products`)
- Lista con miniatura, nombre, precio, disponibilidad
- Toggle disponible/oculto
- Editar / Eliminar (con confirmación)

#### Editar producto (`/admin/products/:id`)
Diseñado para usuario no técnico:
- Zona de foto: click o drag & drop → vista previa inmediata
- Nombre, descripción, precio USD, categoría
- Opciones/variantes con precios adicionales
- "Permite mensaje de tarjeta"
- La imagen se guarda en base64 (sin servidor — Fase 2: Supabase Storage)

#### Pedidos (`/admin/orders`)
- Búsqueda por número, nombre o teléfono
- Filtros por estado (tabs)
- Por cada pedido: cliente, entrega, productos, nota del cliente
- **Notas internas**: campo privado para el equipo, no lo ve el cliente
- **Cambio de estado**: botones directos (Pendiente → En preparación → Listo → Enviado → Entregado)

---

### 3. 🗄️ Capa de datos (Repositorio)

```
getProductRepository()
      │
      ├── VITE_DATA_SOURCE=local    →  LocalProductRepository
      │                                (usa localStorage)
      │
      └── VITE_DATA_SOURCE=supabase →  SupabaseProductRepository
                                       (base de datos en la nube)
```

Cambiar de `local` a `supabase` es un cambio de una variable de entorno. Ningún componente de UI cambia.

---

## 🚀 Despliegue en producción

### Paso 1 — Subir el código a GitHub

```bash
# En el directorio del proyecto
git init
git add .
git commit -m "kalos.vzla v1.0"

# Crear repo en github.com/new (sin README, sin .gitignore)
git remote add origin https://github.com/TU_USUARIO/kalos-vzla.git
git branch -M main
git push -u origin main
```

> **Importante:** el `.gitignore` ya excluye `.env` para que las credenciales nunca suban a GitHub.

---

### Paso 2 — Configurar Supabase

#### 2a. Crear proyecto
1. Ir a [supabase.com](https://supabase.com) → New project
2. Nombre: `kalos-vzla`
3. Región: **South America (São Paulo)** — la más cercana a Venezuela
4. Contraseña de la base de datos: guardarla en un lugar seguro

#### 2b. Ejecutar el schema SQL
1. Supabase Dashboard → **SQL Editor** → New query
2. Copiar y pegar el contenido de `docs/supabase-schema.sql`
3. Ejecutar (botón Run o Ctrl+Enter)

#### 2c. Crear bucket de imágenes
1. Supabase Dashboard → **Storage** → New bucket
2. Nombre: `products`
3. Marcar como **Public bucket** (las imágenes son públicas)
4. En Policies del bucket, agregar:
   - **SELECT**: `true` (lectura pública)
   - **INSERT/UPDATE/DELETE**: `auth.role() = 'authenticated'` (solo admin)

#### 2d. Crear usuario administrador
1. Supabase Dashboard → **Authentication** → Users → Invite user
2. Email: el de la dueña de la tienda
3. Ella recibirá un correo para crear su contraseña

#### 2e. Obtener credenciales
1. Supabase Dashboard → **Settings** → API
2. Copiar:
   - `Project URL` → esto será `VITE_SUPABASE_URL`
   - `anon / public` key → esto será `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### Paso 3 — Desplegar en Vercel

1. Ir a [vercel.com](https://vercel.com) → Add New → Project
2. Conectar con GitHub → seleccionar `kalos-vzla`
3. Vercel detecta automáticamente Vite — las settings correctas son:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. En **Environment Variables**, agregar:

| Variable | Valor |
|---|---|
| `VITE_WHATSAPP_NUMBER` | `584246263545` |
| `VITE_ADMIN_PASSCODE` | `contraseña-segura-aqui` |
| `VITE_DATA_SOURCE` | `supabase` |
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJ...` (la clave anon de Supabase) |

5. Click **Deploy** → en 1-2 minutos la tienda estará en `https://kalos-vzla.vercel.app`

#### Dominio personalizado (opcional)
1. Vercel → Project → Settings → Domains → Add
2. Ingresar tu dominio (ej. `kalos.vzla` o `tienda.kalosregalo.com`)
3. Seguir las instrucciones DNS que Vercel indica

#### Auto-deploy
Cada `git push` a `main` dispara un nuevo deploy automáticamente en Vercel.

---

### Paso 4 — Activar Supabase en el código

En `.env` (local) y en Vercel Environment Variables:
```bash
VITE_DATA_SOURCE=supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

Los productos se leerán de Supabase, los pedidos se guardarán en Supabase, y la
dueña podrá acceder al panel desde cualquier dispositivo y las imágenes no tendrán
límite de tamaño.

---

## 🗃️ Schema de base de datos (Supabase)

El archivo completo está en `docs/supabase-schema.sql`. Resumen:

### Tabla `products`
```
id            UUID (PK)
name          TEXT
description   TEXT
base_price    NUMERIC(10,2)
image_url     TEXT             ← URL en Supabase Storage
category      TEXT
available     BOOLEAN
allow_card_message  BOOLEAN
requires_photos     BOOLEAN
note          TEXT
options       JSONB            ← array de {id, label, choices[]}
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ
```

### Tabla `orders`
```
id              UUID (PK)
order_number    TEXT UNIQUE      ← KLS-0001, KLS-0002…
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
status          TEXT             ← pendiente|en_preparacion|listo|enviado|entregado|cancelado
items           JSONB            ← snapshot del carrito
customer_name   TEXT
customer_phone  TEXT
customer_notes  TEXT
shipping_method TEXT             ← delivery|pickup|national_mrw
shipping_address TEXT
delivery_price  NUMERIC(10,2)
delivery_km     NUMERIC(8,2)
mrw_data        JSONB            ← {agency, cedula, recipientPhone, recipientName}
payment_method  TEXT
subtotal        NUMERIC(10,2)
total           NUMERIC(10,2)
admin_notes     TEXT             ← notas internas, NO visibles al cliente
```

### Reglas de acceso (RLS)
| Tabla | Quién puede | Qué |
|---|---|---|
| `products` | Cualquiera (anónimo) | Leer |
| `products` | Admin autenticado | Crear, editar, eliminar |
| `orders` | Cualquiera (anónimo) | Insertar (crear pedido) |
| `orders` | Admin autenticado | Leer y actualizar |

---

## Variables de entorno

Copiar `.env.example` a `.env` y rellenar:

```bash
# WhatsApp — sin +, sin espacios (Venezuela: 58 424 626-3545 → 584246263545)
VITE_WHATSAPP_NUMBER=584246263545

# Contraseña del panel de admin (cambiará por Supabase Auth en Fase 2)
VITE_ADMIN_PASSCODE=contraseña-segura

# Fuente de datos: "local" (localStorage) o "supabase"
VITE_DATA_SOURCE=local

# Solo necesario si VITE_DATA_SOURCE=supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

---

## Flujo completo de datos (Fase 1 — localStorage)

```
seedProducts.ts
      │  (primera vez → escribe en localStorage kalos.products.v1)
      ▼
LocalProductRepository.listAvailable()
      ▼
CatalogPage → ProductCard → ProductCustomizeModal
                                    │ add()
                                    ▼
                              CartContext (localStorage)
                                    │
                                    ▼
                              CheckoutPage
                                    ├── GPS → Haversine → precioDelivery
                                    │
                                    │ validateCheckout() ✓
                                    ▼
                              nextOrderNumber() → KLS-0001
                                    │
                                    ├── saveOrder() → kalos.orders.v1
                                    │
                                    ├── buildOrderMessage()
                                    ▼
                              buildWhatsAppUrl()
                                    ▼
                              window.location.href = wa.me/...
                                    ▼
                              clear() CartContext
                                    ▼
                              OrderSuccessPage (muestra KLS-0001)

─── Admin ────────────────────────────────────────────────

loadOrders() → AdminDashboardPage (stats)
loadOrders() → OrderListPage (gestión + notas + estado)
updateOrderStatus() / updateOrderAdminNotes()
```

---

## Estado global (Context)

### CartContext
`items`, `count`, `total`, `add()`, `setQuantity()`, `remove()`, `clear()`
El carrito persiste en `localStorage`. El cliente puede cerrar y volver.

### AdminAuthContext
Compara la contraseña contra `VITE_ADMIN_PASSCODE`. Guarda en `sessionStorage`
(se cierra al cerrar la pestaña). En Fase 2 se reemplaza con Supabase Auth.

---

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `bloom-50` | `#edf2e3` | Fondo general de la app |
| `bloom-100` | `#d3e9bc` | Tarjetas, bordes suaves |
| `bloom-200` | `#add58e` | Bordes de inputs, rings |
| `bloom-700` | `#005919` | **PRIMARY** — botones, CTA, links activos |
| `bloom-800` | `#003f12` | Headings, navbar |
| `bloom-900` | `#002a0d` | Footer |

---

## Comandos

```bash
npm install        # instalar dependencias (solo la primera vez)
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # compilar para producción (genera dist/)
npm run preview    # previsualizar la versión compilada localmente
```

---

## Limitación actual del localStorage

Los datos (productos editados, fotos, pedidos) viven **en el navegador del dispositivo**.

- Limpiar caché → se pierden los cambios y vuelve al catálogo original
- Otro dispositivo → ve el catálogo original, no los cambios
- Pedidos del cliente → solo visibles en el navegador donde hizo el pedido

**Solución:** activar Supabase (cambiar `VITE_DATA_SOURCE=supabase` + ejecutar el schema).

---

## Hoja de ruta

```
✅ Fase 1 (actual)
   └─► PWA React/Vite/Tailwind + localStorage
       Catálogo real con imágenes
       Checkout con GPS + delivery + MRW
       Admin: catálogo, pedidos, notas, dashboard

🔜 Fase 2 — Supabase
   └─► Conectar Supabase PostgreSQL
       Productos e imágenes en la nube (Supabase Storage)
       Pedidos en la nube (admin desde cualquier dispositivo)
       Supabase Auth para reemplazar la contraseña de texto plano

🔜 Fase 3 — Backend Node.js en Render
   └─► API-first con rutas modulares (api/handlers/)
       Webhooks de pedidos
       Notificaciones automáticas por WhatsApp (Twilio / meta-wa)
       Emails de confirmación al cliente
       Lógica de negocio que no puede vivir en el frontend

🔜 Fase 4 — Escalar
   └─► Seguimiento de pedidos en tiempo real
       Programa de fidelización
       Múltiples sucursales
       Dashboard de analíticas
```

---

## Glosario

| Término | Significado |
|---|---|
| **Repositorio** | Clase que abstrae el acceso a datos. Intercambiable sin tocar los componentes. |
| **Seed** | Catálogo inicial que carga la primera vez para que la tienda no aparezca vacía. |
| **localStorage** | Almacenamiento en el navegador, persiste entre sesiones pero solo en ese dispositivo. |
| **sessionStorage** | Como localStorage pero se borra al cerrar la pestaña. Usado para la sesión del admin. |
| **PWA** | Progressive Web App — instalable desde el navegador, sin pasar por tiendas de apps. |
| **Base64** | Convierte una imagen en texto largo. Permite guardar fotos sin servidor. Temporal hasta Supabase Storage. |
| **Haversine** | Fórmula para calcular distancias en km entre dos coordenadas GPS. |
| **Nominatim** | API gratuita de OpenStreetMap que convierte texto de dirección en coordenadas GPS. |
| **RLS** | Row Level Security — reglas de Supabase que controlan quién puede leer o escribir cada fila. |
| **KLS-XXXX** | Formato del número de pedido de kalos.vzla. Correlativo y automático. |
| **Vercel** | Plataforma de hosting para el frontend. Auto-deploys desde GitHub. |
| **Render** | Plataforma para el backend Node.js (Fase 3). |

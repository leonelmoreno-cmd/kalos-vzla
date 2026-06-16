import type { Product } from '@/types';

/**
 * Catálogo kalos.vzla — Día del Padre 2026.
 * Estructura tomada del catálogo oficial en PDF (18 opciones, 4 partes):
 *   Parte 1 — Kits de Regalos        (Opción 1–4)
 *   Parte 2 — Regalos Especiales     (Opción 5–11)
 *   Parte 3 — Arreglos con Regalos   (Opción 12–15)
 *   Parte 4 — Cuadros                (Opción 16–18)
 * Imágenes en /public/products/ (extraídas del PDF oficial).
 */

// ─── Opción de luz para cuadros ──────────────────────────────────────────────
const TIPO_LUZ = {
  id: 'luz',
  label: 'Iluminación',
  choices: [
    { id: 'normal', label: 'Normal (sin luz)', priceDelta: 0 },
    { id: 'led', label: 'Con luz LED', priceDelta: 0 },
  ],
};

const CAT = {
  kits: 'Kits de Regalos',
  especiales: 'Regalos Especiales',
  arreglos: 'Arreglos con Regalos',
  cuadros: 'Cuadros',
  corporativos: 'Corporativos',
} as const;

// ─── Opción de cantidad para regalos corporativos ────────────────────────────
// El precio unitario es basePrice; cada tier de cantidad fija el precio total
// (delta = precio del tier − basePrice), por lo que unitPrice × 1 = precio del tier.
function cantidadOptions(unidad: number, docena: number, cincuenta: number, cien: number) {
  return [
    {
      id: 'cantidad',
      label: 'Cantidad',
      choices: [
        { id: 'unidad', label: 'Unidad', priceDelta: 0 },
        { id: 'docena', label: 'Docena (12 uds)', priceDelta: docena - unidad },
        { id: 'cincuenta', label: '50 unidades', priceDelta: cincuenta - unidad },
        { id: 'cien', label: '100 unidades', priceDelta: cien - unidad },
      ],
    },
  ];
}

export const seedProducts: Product[] = [
  // ── PARTE 1: KITS DE REGALOS ───────────────────────────────────────────────
  {
    id: 'kit-01-billetera-reloj',
    name: 'Kit Papá — Opción 1',
    description:
      'Caja de madera con reloj de pulso, billetera de cuero y surtido de chocolates americanos (Snickers, Almond Joy, M&M\'s, MilkyWay). Incluye tarjeta personalizada.',
    basePrice: 25,
    imageUrl: '/products/kit-01-billetera-reloj.png',
    available: true,
    category: CAT.kits,
    allowCardMessage: true,
  },
  {
    id: 'kit-02-billetera-mms',
    name: 'Kit Papá — Opción 2',
    description:
      'Caja de madera con reloj de pulso dorado, billetera texturizada y selección de chocolates (MilkyWay, M&M\'s, Almond Joy). Incluye tarjeta personalizada.',
    basePrice: 28,
    imageUrl: '/products/kit-02-billetera-mms.png',
    available: true,
    category: CAT.kits,
    allowCardMessage: true,
  },
  {
    id: 'kit-03-ejecutivo',
    name: 'Kit Papá — Opción 3',
    description:
      'Caja de madera con correa de cuero, reloj de pulso, billetera y chocolates (Snickers, Hershey\'s, MilkyWay). Incluye tarjeta personalizada.',
    basePrice: 34,
    imageUrl: '/products/kit-03-ejecutivo.png',
    available: true,
    category: CAT.kits,
    allowCardMessage: true,
  },
  {
    id: 'kit-04-tumbler-papa',
    name: 'Kit Papá — Opción 4',
    description:
      'Caja de madera con correa de cuero, tumbler personalizado PAPÁ y chocolates (Snickers, MilkyWay, Almond Joy, Hershey\'s). Incluye tarjeta personalizada.',
    basePrice: 35,
    imageUrl: '/products/kit-04-tumbler-papa.png',
    available: true,
    category: CAT.kits,
    allowCardMessage: true,
  },

  // ── PARTE 2: REGALOS ESPECIALES ────────────────────────────────────────────
  {
    id: 'regalo-05-caja-especial',
    name: 'Sorpresa Marvel Papá — Opción 5',
    description:
      'Caja temática Marvel con cuadro PAPÁ de fotos, billetera de cuero y chocolates (M&M\'s, Reese\'s, Almond Joy). "Sorpresa para el mejor papá".',
    basePrice: 40,
    imageUrl: '/products/regalo-05-caja-especial.png',
    available: true,
    category: CAT.especiales,
    requiresPhotos: true,
    allowCardMessage: true,
  },
  {
    id: 'regalo-06-album-panini',
    name: 'Álbum FIFA 2026 versión PAPÁ',
    description:
      'Álbum personalizado "Nuestro Héroe #1 Papá" con cromos de fotos familiares. Incluye su caja de regalo más dos chocolates ✨💙',
    note: 'La personalización incluye SOLO FOTOS💙 (no podemos modificar los textos) 💙',
    basePrice: 17,
    imageUrl: '/products/regalo-06-album-panini.png',
    available: true,
    category: CAT.especiales,
    requiresPhotos: true,
    allowCardMessage: true,
    options: [
      {
        id: 'tamano',
        label: 'Elige tu opción',
        choices: [
          { id: 'opcion-1', label: 'Opción #1 — 12 barajitas y 12 espacios', priceDelta: 0 },
          { id: 'opcion-2', label: 'Opción #2 — 26 barajitas y 26 espacios', priceDelta: 13 },
          { id: 'opcion-3', label: 'Opción #3 — 40 barajitas y 40 espacios', priceDelta: 23 },
        ],
      },
    ],
  },
  {
    id: 'regalo-07-cuadro-cromo',
    name: 'Cromo Panini Enmarcado — Opción 7',
    description:
      'Marco con cromo Panini personalizado: "El Mejor Papá, eres nuestro jugador favorito del equipo de nuestro corazón".',
    basePrice: 18,
    imageUrl: '/products/regalo-07-cuadro-cromo.png',
    available: true,
    category: CAT.especiales,
    requiresPhotos: true,
    allowCardMessage: false,
  },
  {
    id: 'regalo-08-kit-fifa',
    name: 'Kit FIFA World Cup — Opción 8',
    description:
      'Caja temática FIFA World Cup 2026 con tumbler negro/dorado FIFA, adorno de la copa y M&M\'s. "¡Feliz Día Papá!".',
    basePrice: 28,
    imageUrl: '/products/regalo-08-kit-fifa.png',
    available: true,
    category: CAT.especiales,
    allowCardMessage: true,
  },
  {
    id: 'regalo-09-kit-barcelona',
    name: 'Kit FC Barcelona — Opción 9',
    description:
      'Caja FC Barcelona con tumbler FCB grabado, llavero "Papá Team" y surtido de chocolates. Para el papá culé.',
    basePrice: 26,
    imageUrl: '/products/regalo-09-kit-barcelona.png',
    available: true,
    category: CAT.especiales,
    allowCardMessage: true,
  },
  {
    id: 'regalo-10-kit-real-madrid',
    name: 'Kit Real Madrid — Opción 10',
    description:
      'Caja Real Madrid con tumbler RM grabado en dorado, llavero "Papá Team" y surtido de chocolates. Para el papá merengue.',
    basePrice: 26,
    imageUrl: '/products/regalo-10-kit-real-madrid.png',
    available: true,
    category: CAT.especiales,
    allowCardMessage: true,
  },
  {
    id: 'regalo-11-placa-acrilica',
    name: 'Placa Acrílica Mejor Papá — Opción 11',
    description:
      'Caja "Hay algo especial para ti aquí" con placa acrílica personalizada "Mejor Papá certificado por", con foto recortada y base dorada.',
    basePrice: 26,
    imageUrl: '/products/regalo-11-placa-acrilica.png',
    available: true,
    category: CAT.especiales,
    requiresPhotos: true,
    allowCardMessage: true,
  },

  // ── PARTE 3: ARREGLOS CON REGALOS ──────────────────────────────────────────
  {
    id: 'arreglo-12-sombrero',
    name: 'Arreglo de Chocolates — Opción 12',
    description:
      'Arreglo de chocolates variados (M&M\'s, Hershey\'s, Snickers, Twix, MilkyWay) con globo estrella, en caja "Feliz Día del Padre".',
    basePrice: 18,
    imageUrl: '/products/arreglo-12-sombrero.png',
    available: true,
    category: CAT.arreglos,
    allowCardMessage: true,
  },
  {
    id: 'arreglo-13-papa-reloj',
    name: 'Arreglo Papá con Reloj — Opción 13',
    description:
      'Arreglo PAPÁ con reloj de pulso, Ferrero Rocher, chocolates (Snickers, M&M\'s) y globo estrella dorado "Feliz Día", en caja cilíndrica.',
    basePrice: 28,
    imageUrl: '/products/arreglo-13-papa-reloj.png',
    available: true,
    category: CAT.arreglos,
    allowCardMessage: true,
  },
  {
    id: 'arreglo-14-papa-billetera',
    name: 'Arreglo Papá con Billetera — Opción 14',
    description:
      'Arreglo PAPÁ con billetera de cuero, Ferrero Rocher, chocolates (Snickers, MilkyWay, M&M\'s) y globo estrella, en caja cilíndrica.',
    basePrice: 23,
    imageUrl: '/products/arreglo-14-papa-billetera.png',
    available: true,
    category: CAT.arreglos,
    allowCardMessage: true,
  },
  {
    id: 'arreglo-15-papa-perfume',
    name: 'Arreglo Papá con Perfume — Opción 15',
    description:
      'Arreglo "Feliz Día" con perfume Insuperabile Azul, chocolates (Snickers, Hershey\'s, MilkyWay, Almond Joy) y globos estrella, en caja cilíndrica.',
    basePrice: 20,
    imageUrl: '/products/arreglo-15-papa-perfume.png',
    available: true,
    category: CAT.arreglos,
    allowCardMessage: true,
  },

  // ── PARTE 4: CUADROS ───────────────────────────────────────────────────────
  {
    id: 'cuadro-16-collage',
    name: 'Cuadro Collage de Fotos — Opción 16',
    description:
      'Cuadro collage de fotos personalizado "Feliz Día Papá". Envíanos tus fotos favoritas y elegimos el diseño juntos.',
    basePrice: 20,
    imageUrl: '/products/cuadro-16-collage.png',
    available: true,
    category: CAT.cuadros,
    requiresPhotos: true,
    allowCardMessage: true,
  },
  {
    id: 'cuadro-17-papa-letras',
    name: 'Cuadro PAPÁ con Fotos — Opción 17',
    description:
      'Cuadro PAPÁ con letras rellenas de fotos y mensaje personalizado. Disponible normal o con luz LED para un efecto espectacular de noche.',
    basePrice: 28,
    imageUrl: '/products/cuadro-17-papa-letras.png',
    available: true,
    category: CAT.cuadros,
    requiresPhotos: true,
    allowCardMessage: true,
    options: [TIPO_LUZ],
  },
  {
    id: 'cuadro-18-caja-ferrero',
    name: 'Caja Foto + Ferrero — Opción 18',
    description:
      'Caja "Feliz Día del Padre" con cuadro tira de 3 fotos personalizadas y 6 Ferrero Rocher. Elegante y delicioso.',
    basePrice: 32,
    imageUrl: '/products/cuadro-18-caja-ferrero.png',
    available: true,
    category: CAT.cuadros,
    requiresPhotos: true,
    allowCardMessage: true,
  },

  // ── REGALOS CORPORATIVOS — Día del Padre 2026 ──────────────────────────────
  // Personalización con logo de empresa sin costo adicional a partir de 24 uds.
  {
    id: 'corp-llaveros-fifa',
    name: 'Tag + Llaveros FIFA',
    description: 'Llavero FIFA World Cup 26 con tag personalizable "¡Hoy te deseamos un feliz día, Papá!". Ideal para detalles corporativos del Día del Padre.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 3.7,
    imageUrl: '/products/corp-llaveros-fifa.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(3.7, 45, 185, 370),
  },
  {
    id: 'corp-perfume',
    name: 'Tag + Perfume',
    description: 'Perfume 2i2 VIP Men con tag personalizable "¡Hoy te deseamos un feliz día, Papá!". Detalle corporativo elegante para el Día del Padre.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 3.0,
    imageUrl: '/products/corp-perfume.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(3.0, 36, 150, 300),
  },
  {
    id: 'corp-medias',
    name: 'Tag + Medias',
    description: 'Par de medias con banda "Papá, te deseamos un feliz día" y tag personalizable. Detalle práctico y cómodo para el equipo.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 1.65,
    imageUrl: '/products/corp-medias.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(1.65, 20, 83, 165),
  },
  {
    id: 'corp-boligrafo',
    name: 'Tag + Bolígrafo',
    description: 'Bolígrafo con tag personalizable "¡Hoy te deseamos un feliz día, Papá!". Económico y útil para entregas masivas.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 1.5,
    imageUrl: '/products/corp-boligrafo.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(1.5, 18, 75, 150),
  },
  {
    id: 'corp-chocolate',
    name: 'Tag + 1 Chocolate',
    description: 'Chocolate individual (Twix o Hershey\'s) con tag personalizable "¡Hoy te deseamos un feliz día, Papá!". El detalle corporativo más económico.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 1.3,
    imageUrl: '/products/corp-chocolate.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(1.3, 15, 63, 126),
  },
  {
    id: 'corp-kit-chocolates',
    name: 'Kit de Chocolates',
    description: 'Bolsa con surtido de chocolates (M&M\'s, MilkyWay, Reese\'s) y tag "Papá, te deseamos un feliz día" con moño azul. Presentación lista para regalar.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 3.0,
    imageUrl: '/products/corp-kit-chocolates.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(3.0, 36, 149, 297),
  },
  {
    id: 'corp-cesta-mani',
    name: 'Cesta de Maní',
    description: 'Cestica individual de maní salado con etiqueta "Papá, te deseamos un feliz día". Detalle sencillo y delicioso para el equipo.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 2.0,
    imageUrl: '/products/corp-cesta-mani.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(2.0, 24, 100, 200),
  },
  {
    id: 'corp-ferreros',
    name: 'Tag + Ferreros',
    description: 'Ferrero Rocher individual con tag personalizable "¡Hoy te deseamos un feliz día, Papá!". Clásico y siempre bien recibido.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 1.85,
    imageUrl: '/products/corp-ferreros.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(1.85, 22, 92, 184),
  },
  {
    id: 'corp-moneda-chocolate',
    name: 'Tag + Moneda de Chocolate',
    description: 'Moneda de chocolate dorada con tag personalizable "¡Hoy te deseamos un feliz día, Papá!". El detalle corporativo más accesible.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 0.85,
    imageUrl: '/products/corp-moneda-chocolate.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(0.85, 10, 41, 82),
  },
  {
    id: 'corp-llavero-impreso',
    name: 'Tag + Llavero Impreso',
    description: 'Llavero acrílico impreso "Eres el mejor padre de la galaxia" con tag personalizable. Personalización del llavero incluida sin costo.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 1.75,
    imageUrl: '/products/corp-llavero-impreso.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(1.75, 21, 88, 175),
  },
  {
    id: 'corp-llavero-rotulado',
    name: 'Tag + Llavero Rotulado',
    description: 'Llavero acrílico "Feliz Día Papá" con tag personalizable. Personalización del llavero incluida sin costo.',
    note: 'Personaliza con el logo de tu empresa sin costo adicional a partir de 24 unidades.',
    basePrice: 3.6,
    imageUrl: '/products/corp-llavero-rotulado.png',
    available: true,
    category: CAT.corporativos,
    options: cantidadOptions(3.6, 43, 179, 357),
  },
];

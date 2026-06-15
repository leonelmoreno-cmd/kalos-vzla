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
} as const;

export const seedProducts: Product[] = [
  // ── PARTE 1: KITS DE REGALOS ───────────────────────────────────────────────
  {
    id: 'kit-01-billetera-reloj',
    name: 'Kit Papá — Opción 1',
    description:
      'Caja de madera con reloj Casio, billetera de cuero y surtido de chocolates americanos (Snickers, Almond Joy, M&M\'s, MilkyWay). Incluye tarjeta personalizada.',
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
      'Caja de madera con reloj Casio dorado, billetera texturizada y selección de chocolates (MilkyWay, M&M\'s, Almond Joy). Incluye tarjeta personalizada.',
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
      'Caja de madera con correa de cuero, reloj Casio, billetera y chocolates (Snickers, Hershey\'s, MilkyWay). Incluye tarjeta personalizada.',
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
    name: 'Álbum Panini Nuestro Héroe — Opción 6',
    description:
      'Álbum Panini personalizado "Nuestro Héroe #1 Papá" con cromos de fotos familiares y chocolates. Una colección única del mejor papá.',
    basePrice: 17,
    imageUrl: '/products/regalo-06-album-panini.png',
    available: true,
    category: CAT.especiales,
    requiresPhotos: true,
    allowCardMessage: true,
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
      'Arreglo PAPÁ con reloj Casio, Ferrero Rocher, chocolates (Snickers, M&M\'s) y globo estrella dorado "Feliz Día", en caja cilíndrica.',
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
];

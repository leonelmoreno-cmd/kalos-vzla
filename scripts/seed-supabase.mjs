#!/usr/bin/env node
/**
 * Seed de Supabase — Catálogo kalos.vzla (Día del Padre 2026, 18 opciones).
 *
 * Uso:
 *   node scripts/seed-supabase.mjs
 *
 * Qué hace:
 *   1. Borra TODOS los productos existentes (estado limpio)
 *   2. Sube cada imagen a Supabase Storage (bucket "products")
 *   3. Inserta los 18 productos en la tabla `products`
 *
 * Requisitos en .env:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_SERVICE_KEY   (recomendado, evita RLS)
 *   o VITE_SUPABASE_PUBLISHABLE_KEY (fallback)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta VITE_SUPABASE_URL y una key (SERVICE o PUBLISHABLE) en .env');
  process.exit(1);
}

console.log(
  process.env.VITE_SUPABASE_SERVICE_KEY
    ? '✅ Usando Service Role Key (admin)\n'
    : '⚠️  Usando Publishable Key (puede fallar por RLS)\n',
);

const supabase = createClient(supabaseUrl, supabaseKey);

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
};

// 18 productos reales del catálogo PDF.
const PRODUCTS = [
  { id: 'kit-01-billetera-reloj', name: 'Kit Papá — Opción 1', description: 'Caja de madera con reloj Casio, billetera de cuero y surtido de chocolates americanos (Snickers, Almond Joy, M&M\'s, MilkyWay). Incluye tarjeta personalizada.', basePrice: 25, imageUrl: '/products/kit-01-billetera-reloj.png', category: CAT.kits, allowCardMessage: true },
  { id: 'kit-02-billetera-mms', name: 'Kit Papá — Opción 2', description: 'Caja de madera con reloj Casio dorado, billetera texturizada y selección de chocolates (MilkyWay, M&M\'s, Almond Joy). Incluye tarjeta personalizada.', basePrice: 28, imageUrl: '/products/kit-02-billetera-mms.png', category: CAT.kits, allowCardMessage: true },
  { id: 'kit-03-ejecutivo', name: 'Kit Papá — Opción 3', description: 'Caja de madera con correa de cuero, reloj Casio, billetera y chocolates (Snickers, Hershey\'s, MilkyWay). Incluye tarjeta personalizada.', basePrice: 34, imageUrl: '/products/kit-03-ejecutivo.png', category: CAT.kits, allowCardMessage: true },
  { id: 'kit-04-tumbler-papa', name: 'Kit Papá — Opción 4', description: 'Caja de madera con correa de cuero, tumbler personalizado PAPÁ y chocolates (Snickers, MilkyWay, Almond Joy, Hershey\'s). Incluye tarjeta personalizada.', basePrice: 35, imageUrl: '/products/kit-04-tumbler-papa.png', category: CAT.kits, allowCardMessage: true },

  { id: 'regalo-05-caja-especial', name: 'Sorpresa Marvel Papá — Opción 5', description: 'Caja temática Marvel con cuadro PAPÁ de fotos, billetera de cuero y chocolates (M&M\'s, Reese\'s, Almond Joy). "Sorpresa para el mejor papá".', basePrice: 40, imageUrl: '/products/regalo-05-caja-especial.png', category: CAT.especiales, requiresPhotos: true, allowCardMessage: true },
  { id: 'regalo-06-album-panini', name: 'Álbum Panini Nuestro Héroe — Opción 6', description: 'Álbum Panini personalizado "Nuestro Héroe #1 Papá" con cromos de fotos familiares y chocolates. Una colección única del mejor papá.', basePrice: 17, imageUrl: '/products/regalo-06-album-panini.png', category: CAT.especiales, requiresPhotos: true, allowCardMessage: true },
  { id: 'regalo-07-cuadro-cromo', name: 'Cromo Panini Enmarcado — Opción 7', description: 'Marco con cromo Panini personalizado: "El Mejor Papá, eres nuestro jugador favorito del equipo de nuestro corazón".', basePrice: 18, imageUrl: '/products/regalo-07-cuadro-cromo.png', category: CAT.especiales, requiresPhotos: true, allowCardMessage: false },
  { id: 'regalo-08-kit-fifa', name: 'Kit FIFA World Cup — Opción 8', description: 'Caja temática FIFA World Cup 2026 con tumbler negro/dorado FIFA, adorno de la copa y M&M\'s. "¡Feliz Día Papá!".', basePrice: 28, imageUrl: '/products/regalo-08-kit-fifa.png', category: CAT.especiales, allowCardMessage: true },
  { id: 'regalo-09-kit-barcelona', name: 'Kit FC Barcelona — Opción 9', description: 'Caja FC Barcelona con tumbler FCB grabado, llavero "Papá Team" y surtido de chocolates. Para el papá culé.', basePrice: 26, imageUrl: '/products/regalo-09-kit-barcelona.png', category: CAT.especiales, allowCardMessage: true },
  { id: 'regalo-10-kit-real-madrid', name: 'Kit Real Madrid — Opción 10', description: 'Caja Real Madrid con tumbler RM grabado en dorado, llavero "Papá Team" y surtido de chocolates. Para el papá merengue.', basePrice: 26, imageUrl: '/products/regalo-10-kit-real-madrid.png', category: CAT.especiales, allowCardMessage: true },
  { id: 'regalo-11-placa-acrilica', name: 'Placa Acrílica Mejor Papá — Opción 11', description: 'Caja "Hay algo especial para ti aquí" con placa acrílica personalizada "Mejor Papá certificado por", con foto recortada y base dorada.', basePrice: 26, imageUrl: '/products/regalo-11-placa-acrilica.png', category: CAT.especiales, requiresPhotos: true, allowCardMessage: true },

  { id: 'arreglo-12-sombrero', name: 'Arreglo de Chocolates — Opción 12', description: 'Arreglo de chocolates variados (M&M\'s, Hershey\'s, Snickers, Twix, MilkyWay) con globo estrella, en caja "Feliz Día del Padre".', basePrice: 18, imageUrl: '/products/arreglo-12-sombrero.png', category: CAT.arreglos, allowCardMessage: true },
  { id: 'arreglo-13-papa-reloj', name: 'Arreglo Papá con Reloj — Opción 13', description: 'Arreglo PAPÁ con reloj Casio, Ferrero Rocher, chocolates (Snickers, M&M\'s) y globo estrella dorado "Feliz Día", en caja cilíndrica.', basePrice: 28, imageUrl: '/products/arreglo-13-papa-reloj.png', category: CAT.arreglos, allowCardMessage: true },
  { id: 'arreglo-14-papa-billetera', name: 'Arreglo Papá con Billetera — Opción 14', description: 'Arreglo PAPÁ con billetera de cuero, Ferrero Rocher, chocolates (Snickers, MilkyWay, M&M\'s) y globo estrella, en caja cilíndrica.', basePrice: 23, imageUrl: '/products/arreglo-14-papa-billetera.png', category: CAT.arreglos, allowCardMessage: true },
  { id: 'arreglo-15-papa-perfume', name: 'Arreglo Papá con Perfume — Opción 15', description: 'Arreglo "Feliz Día" con perfume Insuperabile Azul, chocolates (Snickers, Hershey\'s, MilkyWay, Almond Joy) y globos estrella, en caja cilíndrica.', basePrice: 20, imageUrl: '/products/arreglo-15-papa-perfume.png', category: CAT.arreglos, allowCardMessage: true },

  { id: 'cuadro-16-collage', name: 'Cuadro Collage de Fotos — Opción 16', description: 'Cuadro collage de fotos personalizado "Feliz Día Papá". Envíanos tus fotos favoritas y elegimos el diseño juntos.', basePrice: 20, imageUrl: '/products/cuadro-16-collage.png', category: CAT.cuadros, requiresPhotos: true, allowCardMessage: true },
  { id: 'cuadro-17-papa-letras', name: 'Cuadro PAPÁ con Fotos — Opción 17', description: 'Cuadro PAPÁ con letras rellenas de fotos y mensaje personalizado. Disponible normal o con luz LED para un efecto espectacular de noche.', basePrice: 28, imageUrl: '/products/cuadro-17-papa-letras.png', category: CAT.cuadros, requiresPhotos: true, allowCardMessage: true, options: [TIPO_LUZ] },
  { id: 'cuadro-18-caja-ferrero', name: 'Caja Foto + Ferrero — Opción 18', description: 'Caja "Feliz Día del Padre" con cuadro tira de 3 fotos personalizadas y 6 Ferrero Rocher. Elegante y delicioso.', basePrice: 32, imageUrl: '/products/cuadro-18-caja-ferrero.png', category: CAT.cuadros, requiresPhotos: true, allowCardMessage: true },
];

async function uploadImage(imagePath) {
  const fileName = path.basename(imagePath);
  const fullPath = path.join(__dirname, '../public', imagePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠️  Imagen no encontrada: ${imagePath}`);
    return null;
  }
  const fileBuffer = fs.readFileSync(fullPath);
  const storagePath = `products/${fileName}`;
  const { error } = await supabase.storage
    .from('products')
    .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true });
  if (error) {
    console.error(`  ❌ Error subiendo imagen: ${error.message}`);
    return null;
  }
  const { data } = supabase.storage.from('products').getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  console.log('🌱 Seed kalos.vzla — 18 productos\n');

  // 1. Limpiar productos existentes
  console.log('🧹 Borrando productos anteriores…');
  const { error: delError } = await supabase
    .from('products')
    .delete()
    .neq('id', '__none__'); // borra todas las filas
  if (delError) {
    console.error('❌ No se pudieron borrar:', delError.message);
    process.exit(1);
  }
  console.log('   ✅ Tabla limpia\n');

  let ok = 0;
  let fail = 0;

  for (const p of PRODUCTS) {
    console.log(`📦 ${p.name}`);
    const imageUrl = (await uploadImage(p.imageUrl)) ?? p.imageUrl;

    const { error } = await supabase.from('products').insert({
      id: p.id,
      name: p.name,
      description: p.description,
      base_price: p.basePrice,
      image_url: imageUrl,
      category: p.category ?? null,
      available: true,
      allow_card_message: p.allowCardMessage ?? false,
      requires_photos: p.requiresPhotos ?? false,
      options: JSON.stringify(p.options ?? []),
    });

    if (error) {
      console.error(`  ❌ ${error.message}\n`);
      fail++;
    } else {
      console.log('  ✅ Guardado\n');
      ok++;
    }
  }

  console.log(`\n✨ Listo: ${ok} insertados${fail ? `, ${fail} con error` : ''}.`);
  console.log('   La tienda en Vercel (VITE_DATA_SOURCE=supabase) ya muestra el catálogo real.');
}

main().catch((e) => {
  console.error('❌ Error fatal:', e.message);
  process.exit(1);
});

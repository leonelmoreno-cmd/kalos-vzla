#!/usr/bin/env node
/**
 * Seed de Supabase — Catálogo kalos.vzla.
 *
 * Uso:
 *   node scripts/seed-supabase.mjs
 *
 * Qué hace:
 *   1. Borra TODOS los productos existentes (estado limpio)
 *   2. Sube cada imagen a Supabase Storage (bucket "products")
 *   3. Inserta el catálogo completo en la tabla `products`
 *
 * El catálogo se importa directamente de src/data/seedProducts.ts (única fuente
 * de verdad) en lugar de mantener una copia separada que pueda desincronizarse.
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
import { seedProducts } from '../src/data/seedProducts.ts';

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

const PRODUCTS = seedProducts;

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
  console.log(`🌱 Seed kalos.vzla — ${PRODUCTS.length} productos\n`);

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
      note: p.note ?? null,
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

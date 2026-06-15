#!/usr/bin/env node
/**
 * Script: Seed Supabase con productos del catálogo
 *
 * Uso:
 *   node scripts/seed-supabase.js
 *
 * Qué hace:
 *   1. Lee los productos de src/data/seedProducts.ts
 *   2. Sube cada imagen a Supabase Storage
 *   3. Inserta los productos en la tabla `products`
 *
 * Requisitos:
 *   - .env configurado con VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
 *   - Las imágenes deben existir en public/products/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY no están configuradas en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Importar seedProducts dinámicamente
async function loadSeedProducts() {
  const seedPath = path.join(__dirname, '../src/data/seedProducts.ts');
  // Leer y parsear el archivo TypeScript
  const content = fs.readFileSync(seedPath, 'utf-8');

  // Extraer la exportación (búsqueda simple)
  const match = content.match(/export const seedProducts[\s\S]*?\] as const;/);
  if (!match) {
    throw new Error('No se pudo encontrar seedProducts en el archivo');
  }

  // Evaluar el contenido (cuidado en producción)
  // Para este caso es seguro porque es un archivo local controlado
  const seedContent = match[0]
    .replace('export const seedProducts', 'const seedProducts')
    .replace('] as const;', '];');

  // Crear un módulo temporal para evaluarlo
  const tempModule = `
    ${seedContent}
    module.exports = seedProducts;
  `;

  // Alternativa: parsear el JSON manualmente
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No se pudo extraer JSON de seedProducts');

  try {
    // Limpiar comentarios y hacer parse
    const jsonStr = jsonMatch[0]
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*\]/g, ']')
      .replace(/,\s*\}/g, '}');

    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Error parsing seedProducts:', e.message);
    throw e;
  }
}

async function uploadImageToStorage(imagePath, fileName) {
  try {
    const fullPath = path.join(__dirname, '../public', imagePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`  ⚠️  Imagen no encontrada: ${fullPath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const storagePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: publicUrl } = supabase.storage
      .from('products')
      .getPublicUrl(storagePath);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error(`  ❌ Error subiendo imagen ${imagePath}:`, error.message);
    return null;
  }
}

async function insertProduct(product, imageUrl) {
  try {
    const { error } = await supabase
      .from('products')
      .upsert({
        id: product.id,
        name: product.name,
        description: product.description,
        base_price: product.basePrice,
        image_url: imageUrl || '',
        category: product.category || null,
        available: product.available ?? true,
        allow_card_message: product.allowCardMessage ?? false,
        requires_photos: product.requiresPhotos ?? false,
        note: product.note || null,
        options: product.options ? JSON.stringify(product.options) : '[]',
      }, {
        onConflict: 'id',
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`  ❌ Error insertando ${product.name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🌱 Iniciando seed de Supabase...\n');

  try {
    const products = await loadSeedProducts();
    console.log(`✅ Se encontraron ${products.length} productos\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const product of products) {
      console.log(`📦 ${product.name}`);

      // Subir imagen
      let imageUrl = '';
      if (product.imageUrl) {
        console.log(`  🖼️  Subiendo imagen...`);
        imageUrl = await uploadImageToStorage(
          product.imageUrl,
          path.basename(product.imageUrl)
        );
        if (imageUrl) {
          console.log(`  ✅ Imagen subida`);
        } else {
          console.log(`  ⚠️  Usando URL original`);
          imageUrl = product.imageUrl;
        }
      }

      // Insertar producto
      console.log(`  💾 Insertando en BD...`);
      const success = await insertProduct(product, imageUrl);

      if (success) {
        console.log(`  ✅ Producto guardado\n`);
        successCount++;
      } else {
        skipCount++;
        console.log(`  ⏭️  Producto saltado\n`);
      }
    }

    console.log(`\n✨ Seed completado:`);
    console.log(`  ✅ ${successCount} productos insertados`);
    if (skipCount > 0) {
      console.log(`  ⚠️  ${skipCount} productos con errores`);
    }
    console.log(`\n🎉 Puedes cambiar VITE_DATA_SOURCE=supabase en Vercel`);

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

main();

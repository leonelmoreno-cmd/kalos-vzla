#!/usr/bin/env node
/**
 * Script: Seed Supabase con productos del catálogo
 *
 * Uso:
 *   npx tsx scripts/seed-supabase.mjs
 *   O
 *   node scripts/seed-supabase.mjs (si tienes compilado seedProducts)
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
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL y VITE_SUPABASE_SERVICE_KEY no están en .env');
  console.error('   (o VITE_SUPABASE_PUBLISHABLE_KEY como fallback)');
  process.exit(1);
}

if (process.env.VITE_SUPABASE_SERVICE_KEY) {
  console.log('✅ Usando Service Role Key (admin permissions)\n');
} else {
  console.log('⚠️  Usando Publishable Key (pueden fallar uploads)\n');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Productos hardcodeados (simplificación para evitar parsear TypeScript)
// Estos están extraídos de seedProducts.ts
const SEED_PRODUCTS = [
  {
    id: 'kit-01-billetera-reloj',
    name: 'Kit Papá — Opción 1',
    description: 'Caja de madera con reloj, billetera y surtido de chocolates americanos. Incluye tarjeta personalizada.',
    basePrice: 25,
    imageUrl: '/products/kit-01-billetera-reloj.png',
    available: true,
    category: 'Kits de Regalos',
    allowCardMessage: true,
  },
  {
    id: 'kit-02-billetera-mms',
    name: 'Kit Papá — Opción 2',
    description: 'Caja de madera con reloj dorado, billetera texturizada y selección de chocolates. Incluye tarjeta.',
    basePrice: 28,
    imageUrl: '/products/kit-02-billetera-mms.png',
    available: true,
    category: 'Kits de Regalos',
    allowCardMessage: true,
  },
  {
    id: 'kit-03-ejecutivo',
    name: 'Kit Ejecutivo',
    description: 'Portafolio premium con cartera de cuero, reloj clásico y accesorios ejecutivos.',
    basePrice: 45,
    imageUrl: '/products/kit-03-ejecutivo.png',
    available: true,
    category: 'Kits de Regalos',
    allowCardMessage: false,
  },
  {
    id: 'kit-04-tumbler-papa',
    name: 'Kit Papá — Tumbler',
    description: 'Tumbler personalizado con frase para papá + calcetines + chocolates.',
    basePrice: 22,
    imageUrl: '/products/kit-04-tumbler-papa.png',
    available: true,
    category: 'Kits de Regalos',
    allowCardMessage: true,
  },
  {
    id: 'cuadro-16-collage',
    name: 'Cuadro Collage Fotos',
    description: 'Cuadro personalizado con un collage de tus fotos favoritas (hasta 6 fotos).',
    basePrice: 35,
    imageUrl: '/products/cuadro-16-collage.png',
    available: true,
    category: 'Cuadros y Fotos',
    requiresPhotos: true,
    allowCardMessage: false,
  },
  {
    id: 'cuadro-17-papa-letras',
    name: 'Cuadro PAPÁ — Letras 3D',
    description: 'Cuadro decorativo con letras 3D PAPÁ en colores vibrantes. Disponible con o sin luz LED.',
    basePrice: 30,
    imageUrl: '/products/cuadro-17-papa-letras.png',
    available: true,
    category: 'Cuadros y Fotos',
    allowCardMessage: false,
  },
  {
    id: 'cuadro-17b-papa-led',
    name: 'Cuadro PAPÁ — Letras LED',
    description: 'Cuadro PAPÁ con luz LED blanca cálida. Ideal para decorar la habitación.',
    basePrice: 40,
    imageUrl: '/products/cuadro-17b-papa-led.png',
    available: true,
    category: 'Cuadros y Fotos',
    allowCardMessage: false,
  },
  {
    id: 'regalo-05-caja-especial',
    name: 'Caja de Regalos Especial',
    description: 'Caja de regalo premium con chocolates gourmet, frutos secos y decoración festiva.',
    basePrice: 18,
    imageUrl: '/products/regalo-05-caja-especial.png',
    available: true,
    category: 'Regalos Especiales',
    allowCardMessage: true,
  },
  {
    id: 'regalo-06-album-panini',
    name: 'Álbum Panini',
    description: 'Álbum oficial Panini para coleccionar figuritas. Perfecto para coleccionistas.',
    basePrice: 12,
    imageUrl: '/products/regalo-06-album-panini.png',
    available: true,
    category: 'Regalos Especiales',
    allowCardMessage: false,
  },
  {
    id: 'arreglo-12-sombrero',
    name: 'Arreglo Floral — Sombrero',
    description: 'Arreglo floral en forma de sombrero con flores variadas y decoraciones.',
    basePrice: 32,
    imageUrl: '/products/arreglo-12-sombrero.png',
    available: true,
    category: 'Arreglos Florales',
    allowCardMessage: true,
  },
  {
    id: 'arreglo-13-papa-reloj',
    name: 'Arreglo Papá — Con Reloj',
    description: 'Arreglo floral + reloj de bolsillo decorativo para papá.',
    basePrice: 38,
    imageUrl: '/products/arreglo-13-papa-reloj.png',
    available: true,
    category: 'Arreglos Florales',
    allowCardMessage: true,
  },
  {
    id: 'corp-boligrafo',
    name: 'Bolígrafo Personalizado',
    description: 'Bolígrafo ejecutivo con grabado personalizado. Disponible en cantidades corporativas.',
    basePrice: 5,
    imageUrl: '/products/corp-boligrafo.png',
    available: true,
    category: 'Corporativo',
    allowCardMessage: false,
  },
  {
    id: 'corp-chocolate',
    name: 'Chocolate Gourmet Corporativo',
    description: 'Chocolate premium para regalos corporativos. Disponible en diferentes cantidades.',
    basePrice: 8,
    imageUrl: '/products/corp-chocolate.png',
    available: true,
    category: 'Corporativo',
    allowCardMessage: false,
  },
];

async function uploadImageToStorage(imagePath, fileName) {
  try {
    const fullPath = path.join(__dirname, '../public', imagePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`  ⚠️  Imagen no encontrada: ${imagePath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const storagePath = `products/${fileName}`;

    // Primero intenta eliminar si existe
    await supabase.storage.from('products').remove([storagePath]).catch(() => {});

    // Sube la imagen
    const { error } = await supabase.storage
      .from('products')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) throw error;

    // Obtiene URL pública
    const { data: publicUrl } = supabase.storage
      .from('products')
      .getPublicUrl(storagePath);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error(`  ❌ Error subiendo imagen: ${error.message}`);
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
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`  ❌ Error insertando: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🌱 Iniciando seed de Supabase...\n');

  try {
    console.log(`✅ Se encontraron ${SEED_PRODUCTS.length} productos\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const product of SEED_PRODUCTS) {
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
          console.log(`  ⚠️  Usando URL local`);
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
    console.log(`\n🎉 Ahora puedes:`);
    console.log(`   1. Cambiar VITE_DATA_SOURCE=supabase en Vercel Environment Variables`);
    console.log(`   2. Redeploy en Vercel`);
    console.log(`   3. Tu tienda cargará los productos desde Supabase`);

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

main();

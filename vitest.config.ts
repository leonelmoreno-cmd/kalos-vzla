import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

// Configuración de pruebas (Vitest). Reutiliza el alias "@" del proyecto.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});

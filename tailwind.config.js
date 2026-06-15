/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta kalos.vzla — ancla oscuro #005919 | ancla claro #f3f8e9
        bloom: {
          50:  '#edf2e3',   // secundario — fondo general de la app
          100: '#d3e9bc',   // tarjetas, bordes suaves
          200: '#add58e',   // bordes de inputs, rings
          300: '#7bb860',   // acentos claros
          400: '#4f9a32',   // verde medio
          500: '#2c7c1a',   // verde vibrante
          600: '#146610',   // hover sobre secundario
          700: '#005919',   // PRIMARY — botones, CTA, links activos
          800: '#003f12',   // headings, navbar oscuro
          900: '#002a0d',   // footer (más oscuro)
        },
        // Verde brillante para badges de disponibilidad
        leaf: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

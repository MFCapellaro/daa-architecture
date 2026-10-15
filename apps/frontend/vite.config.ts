import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const frontendRoot = dirname(fileURLToPath(import.meta.url));
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, frontendRoot, 'VITE_');
const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY
  || env.VITE_GOOGLE_MAPS_API_KEY
  || process.env.VITE_GOOGLE_MAPS_BROWSER_KEY
  || env.VITE_GOOGLE_MAPS_BROWSER_KEY
  || process.env.GOOGLE_MAPS_BROWSER_KEY
  || '';

export default {
  plugins: react(),
  define: { 'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(googleMapsApiKey) },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Reemplaza 3000 por el puerto real de tu backend Express
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
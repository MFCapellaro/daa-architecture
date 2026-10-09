import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
});
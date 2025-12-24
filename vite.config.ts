import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Chemin relatif pour FiveM NUI
  build: {
    outDir: 'html',
    emptyOutDir: true,
    // Optimisations pour FiveM
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprime les console.log en production
      },
    },
    rollupOptions: {
      output: {
        // Assets dans le même dossier pour FiveM
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // Pour le développement local
    port: 3000,
    open: true,
  },
});

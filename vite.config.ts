import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-core': ['react', 'react-dom', 'react-router-dom', 'zustand', 'zod'],
          'vendor-ui': ['lucide-react'],
          'vendor-charts': ['recharts', 'd3-sankey'],
          'vendor-xlsx': ['xlsx'],
        },
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Ensure JSON files are properly served
  assetsInclude: ['**/*.json'],
  // Configure the server to properly serve JSON files
  server: {
    fs: {
      // Allow serving files from one level up the project root
      allow: ['..'],
    },
  },
});

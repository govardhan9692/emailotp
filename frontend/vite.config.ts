// NOTE: Run "npm install @vitejs/plugin-react" to install this missing package
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add base path for production build
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Improve build output
    sourcemap: false,
    outDir: 'dist',
    // Handle environment variables
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://emailotp-phi.vercel.app',
        changeOrigin: true,
      },
      '/send-email': {
        target: 'https://emailotp-phi.vercel.app',
        changeOrigin: true,
      }
    }
  }
});

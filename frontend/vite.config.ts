// NOTE: Run "npm install @vitejs/plugin-react" to install this missing package
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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

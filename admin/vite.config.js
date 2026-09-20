import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    maxHeaderSize: 500000, // Increase max header size to 500KB to accommodate large Supabase JWT auth tokens
    port: 5174,
    proxy: {
      '/supabase-api': {
        target: 'https://gnonqfdyufszdymynftq.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase-api/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Strip localhost browser cookies to reduce header size
            proxyReq.removeHeader('cookie');
          });
        }
      }
    }
  }
});

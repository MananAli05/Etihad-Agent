import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      // Dev-only hop to Supabase. Kept because direct requests from this
      // machine have shown connection resets; production talks to Supabase
      // directly (see src/lib/supabase.js).
      '/supabase-api': {
        target: 'https://gnonqfdyufszdymynftq.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase-api/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Browser cookies for localhost are irrelevant to Supabase and
            // only add weight to the forwarded request.
            proxyReq.removeHeader('cookie');
          });
        }
      }
    }
  }
});

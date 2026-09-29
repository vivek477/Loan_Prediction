import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  }
});

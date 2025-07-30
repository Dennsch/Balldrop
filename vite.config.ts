import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist-react',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index-react.html'
    }
  },
  preview: {
    port: 8080,
    open: true,
  },
  server: {
    port: 3001,
    open: true,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
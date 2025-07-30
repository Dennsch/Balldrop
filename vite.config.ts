import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: "assets",
  build: {
    outDir: "dist-react",
    emptyOutDir: true,
    rollupOptions: {
      input: "index-react.html",
    },
  },
  preview: {
    port: 8080,
    open: true,
  },
  server: {
    port: 3001,
    host: "0.0.0.0",
    open: true,
    strictPort: true,
    allowedHosts:
      "635e5260-0b92-4fe5-a4fe-1c05755d670a-00-21i45pxrurrkt.worf.replit.dev",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});

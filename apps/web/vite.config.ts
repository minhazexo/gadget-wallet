import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Bind to 0.0.0.0 and honor the workspace-injected PORT so the Freebuff
    // preview is reachable; falls back to 5173 for plain local development.
    host: true,
    port: Number(process.env.PORT) || 5173,
    proxy: {
      "/api": {
        // Use 127.0.0.1 (IPv4), not "localhost": on Windows, Node resolves
        // localhost to ::1 (IPv6) first, and the API binds IPv4 only — which
        // makes proxied requests hang and products fail to load.
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into their own cached chunks so the
        // storefront's first load is smaller and repeat visits hit cache.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom", "react-hook-form"],
          "vendor-animation": ["framer-motion"],
          "vendor-state": ["zustand", "axios", "@hookform/resolvers"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
});

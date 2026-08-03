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
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3000",
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

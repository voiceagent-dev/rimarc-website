import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development the API runs on the Node server.
    proxy: { "/api": { target: "http://localhost:8080", changeOrigin: false } },
  },
  build: {
    target: "es2022",
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: { react: ["react", "react-dom", "react-router"] },
      },
    },
  },
});

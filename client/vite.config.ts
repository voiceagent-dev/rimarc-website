import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ isSsrBuild }) => ({
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
        // The build-time pre-render bundle (--ssr) keeps React as an external package instead.
        manualChunks: isSsrBuild ? undefined : { react: ["react", "react-dom", "react-router"] },
      },
    },
  },
}));

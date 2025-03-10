import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "public",
  server: {
    // proxy: {
    //   "/api": "http://localhost:3000",
    // },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  preview: {
    port: 5173,
  },
});

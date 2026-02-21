import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isVercelBuild = process.env.VERCEL === "1";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: isVercelBuild ? "dist" : "../backend/static",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/diagnose": "http://127.0.0.1:8080",
    },
  },
});

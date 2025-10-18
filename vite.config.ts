import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://192.168.192.138:5000",
        // target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
    hmr: {
      host: "192.168.192.138", // your laptop's ZeroTier IP
      port: 5173,
    },
    headers: {
      "Content-Security-Policy":
        process.env.NODE_ENV === "development"
          ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com;"
          : "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com;",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "client", "src", "assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    assetsDir: "assets",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "client", "index.html"),
      },
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "framer-motion"],
          ui: ["@radix-ui/react-aspect-ratio", "lucide-react"],
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name) {
            const info = assetInfo.name.split(".");
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/[name][extname]`;
            }
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  assetsInclude: ["**/*.JPG", "**/*.jpg", "**/*.png", "**/*.gif", "**/*.svg"],
});

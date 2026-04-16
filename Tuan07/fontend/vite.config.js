import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
      "/food": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
      "/orders": {
        target: "http://localhost:8083",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
      "/payments": {
        target: "http://localhost:8084",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
    },
  },
});
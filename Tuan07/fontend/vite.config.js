import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "http://10.62.245.189:3001",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
      "/food": {
        target: "http://10.62.245.240:3000",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
      "/orders": {
        target: "http://10.62.245.15:8083",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
      "/payments": {
        target: "http://10.62.245.189:3000",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
    },
  },
});
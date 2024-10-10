import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        external: ["js-cookie"],
      },
    },
    define: {
      "process.env": process.env,
    },
    server: {
      proxy: {
        "/api": {
          target: isProduction ? "https://toolly.fr" : "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});

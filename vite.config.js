import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
    include: ["src/**/*.test.{js,jsx,ts,tsx}"],
    testTimeout: 30000,
  },
});

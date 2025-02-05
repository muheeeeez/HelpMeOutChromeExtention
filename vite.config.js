// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"), // Your main entry
        offscreen: resolve(__dirname, "src/offscreen.js"),
        recorder: resolve(__dirname, "src/recorder.js"), // Offscreen entry point
      },
      output: {
        // Force entry files into the assets folder
        entryFileNames: "assets/[name].js",
      },
    },
  },
});

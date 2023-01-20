// vite.config.js

import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  build: {
    outDir: '../dist',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
})

// vite.config.js

import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: './dist',
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
})

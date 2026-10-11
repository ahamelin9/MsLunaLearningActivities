import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const src = fileURLToPath(new URL('./src', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@/utils/audio` from anywhere in TypeScript; stylesheets use loadPaths below
    alias: { '@': src }
  },
  css: {
    // every page, game and lesson styles itself with a CSS module (DES-18b)
    modules: { localsConvention: 'camelCaseOnly' },
    // `@use 'styles/mixins'` from any depth
    preprocessorOptions: { scss: { loadPaths: [src] } }
  }
})

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
  build: {
    // the app, and the password page the Worker shows until a device signs in (OPS-14)
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        gate: fileURLToPath(new URL('./gate.html', import.meta.url))
      }
    }
  },
  css: {
    // every page, game and lesson styles itself with a CSS module (DES-18b)
    modules: { localsConvention: 'camelCaseOnly' },
    // `@use 'styles/mixins'` from any depth
    preprocessorOptions: { scss: { loadPaths: [src] } }
  }
})

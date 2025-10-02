import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
  ],
  rootDir: '.',
  future: {
    compatibilityVersion: 4,
  },
  gel: {
    auth: true,
    oauth: true,
    dbschemaDir: 'dbschema/',
  },
  compatibilityDate: '2025-08-23',
  devtools: { enabled: true },
  tailwindcss: {
    viewer: false,
  },
})

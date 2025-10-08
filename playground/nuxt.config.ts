import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  srcDir: 'app',
  modules: ['../src/module', '@nuxt/ui', '@nuxt/scripts'],
  css: ['~/assets/css/main.css'],
  rootDir: '.',
  future: {
    compatibilityVersion: 4,
  },
  gel: {
    auth: true,
    oauth: true,
    // Enable runtime injection of Gel DSN + URLs during dev
    injectDbCredentials: true,
    dbschemaDir: 'dbschema/',
  },
  compatibilityDate: '2025-08-23',
  devtools: { enabled: true },
  fonts: {
    // simplest: use only Google for now
    provider: 'google',
    // or, keep automatic provider selection but *disable* bunny:
    // providers: { bunny: false }
  },
})

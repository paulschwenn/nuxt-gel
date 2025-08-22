export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
  ],
  edgeDb: {
    auth: true,
    oauth: true,
  },
  compatibilityDate: '2025-08-23',
  devtools: { enabled: true },
  tailwindcss: {
    viewer: false,
  },
})

export default defineNuxtConfig({

  // @nuxt/ui registra automaticamente anche @nuxt/icon e @nuxt/fonts
  // (Inter e JetBrains Mono vengono caricati dalle font-family in main.css).
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/eslint'],

  // App dashboard dietro login su dati mock: SPA pura.
  // Evita problemi SSR con localStorage (sessione), drag&drop e Chart.js.
  ssr: false,

  app: {
    head: {
      link: [
        // Fallback per browser che richiedono il formato ICO.
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-07-14',

  typescript: {
    strict: true,
  },

  eslint: {
    config: {
      // Regole di formattazione gestite da ESLint stylistic: niente Prettier.
      stylistic: true,
    },
  },
})

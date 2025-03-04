// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss',"@pinia/nuxt",'pinia-plugin-persistedstate/nuxt','@nuxt/icon'],
  plugins: [
    { src: '~/plugins/matomo.client.js', mode: 'client' },
  ],
  runtimeConfig: {
    public: {
      BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
      BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
      matomo_host: "https://matomo.srv630927.hstgr.cloud/",
      matomo_site_id: 8,
    },
  },
})
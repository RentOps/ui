// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ],
      script: [
        { src: 'https://cdn.tailwindcss.com' }
      ]
    }
  }
})

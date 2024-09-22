// @ts-ignore
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || 'https://localhost:1337',
    },
  },

  routeRules: {
    '/api/**': {
      proxy: `${process.env.BASE_URL}/api/**`
    },
    '/uploads/**': {
      proxy: `${process.env.BASE_URL}/uploads/**`
    }
  },

  devServer: {
    host: 'localhost',
    port: 3000,
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
})

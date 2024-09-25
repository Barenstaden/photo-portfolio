// @ts-ignore
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseURL: process.env.STRAPI_URL || 'https://localhost:1337',
      strapi: { // nuxt/strapi options available client-side
        url: process.env.STRAPI_URL || 'https://localhost:1337'
      }
    },
  },

  routeRules: {
    '/uploads/**': {
      proxy: `${process.env.STRAPI_URL}/uploads/**`
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
  },

  modules: ['@nuxtjs/strapi'],
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    prefix: '/api',
    admin: '/admin',
    version: 'v4',
    cookie: {
      path: '/',
      maxAge: 14 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === 'production',
      sameSite: true
    },
    auth: {
      populate: ['role']
    },
    cookieName: 'strapi_jwt'
  }
})

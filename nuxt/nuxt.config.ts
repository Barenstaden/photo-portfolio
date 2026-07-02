// @ts-ignore
const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337'
const publicStrapiUrl = process.env.STRAPI_PUBLIC_URL || strapiUrl

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseURL: publicStrapiUrl,
      strapi: { // nuxt/strapi options available client-side
        url: publicStrapiUrl
      }
    },
  },

  routeRules: {
    '/api': {
      proxy: `${strapiUrl}/api`
    },
    '/api/**': {
      proxy: `${strapiUrl}/api/**`
    },
    '/admin': {
      proxy: `${strapiUrl}/admin`
    },
    '/admin/**': {
      proxy: `${strapiUrl}/admin/**`
    },
    '/content-manager/**': {
      proxy: `${strapiUrl}/content-manager/**`
    },
    '/content-type-builder/**': {
      proxy: `${strapiUrl}/content-type-builder/**`
    },
    '/email/**': {
      proxy: `${strapiUrl}/email/**`
    },
    '/i18n/**': {
      proxy: `${strapiUrl}/i18n/**`
    },
    '/upload/**': {
      proxy: `${strapiUrl}/upload/**`
    },
    '/users-permissions/**': {
      proxy: `${strapiUrl}/users-permissions/**`
    },
    '/uploads/**': {
      proxy: `${strapiUrl}/uploads/**`
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
    url: publicStrapiUrl,
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

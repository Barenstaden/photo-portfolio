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

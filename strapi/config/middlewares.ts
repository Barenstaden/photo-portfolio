export default [
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            `https://portfolio-pappa.ams3.cdn.digitaloceanspaces.com/`,
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            `https://portfolio-pappa.ams3.cdn.digitaloceanspaces.com`,
          ],
        },
      },
    },
  },
    'strapi::logger',
    'strapi::errors',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public'
  ];

module.exports = ({env}) => ({
  upload: {
    limits: {
      filesize: 2000000,
    },
    provider: env('UPLOAD_PROVIDER', 'local'),
    providerOptions: env('DO_SPACE_ACCESS_KEY', false) &&  {
      sizeLimit: 2000000,
      key: env('DO_SPACE_ACCESS_KEY'),
      secret: env('DO_SPACE_SECRET_KEY'),
      endpoint: env('DO_SPACE_ENDPOINT'),
      space: env('DO_SPACE_BUCKET'),
      directory: env('DO_SPACE_DIRECTORY'),
      cdn: env('DO_SPACE_CDN'),
    },
  },
});

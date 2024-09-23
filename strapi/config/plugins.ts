export default ({env}) => ({
  upload: {
    config: {
      provider: env('UPLOAD_PROVIDER', 'local'),
      providerOptions: env('UPLOAD_PROVIDER') && {
        baseUrl: env('DO_CDN'),
        rootPath: env('DO_FOLDER'),
        s3Options: {
          credentials: {
            accessKeyId: env('DO_ACCESS_KEY'),
            secretAccessKey: env('DO_SECRET_KEY'),
          },
          region: env('DO_REGION'),
          params: {
            Bucket: env('DO_BUCKET'),
          },
          endpoint: env('DO_ENDPOINT')
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});

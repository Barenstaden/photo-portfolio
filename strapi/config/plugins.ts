export default ({ env }) => {
  const provider = env('UPLOAD_PROVIDER', 'local');

  return {
    upload: {
      config: {
        provider,
        providerOptions:
          provider === 'aws-s3'
            ? {
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
                  endpoint: env('DO_ENDPOINT'),
                },
              }
            : {},
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};

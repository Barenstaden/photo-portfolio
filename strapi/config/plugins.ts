module.exports = ({ env }) => ({
  upload: {
    limits: {
      filesize: 2000000, // 2 MB
    },
    provider: 'local',
    providerOptions: {
      sizeLimit: 2000000, // 2 MB
    },
  },
});

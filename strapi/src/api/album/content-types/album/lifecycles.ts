module.exports = {
  async beforeCreate(event) {
    event.params.data.url = await strapi.service('plugin::content-manager.uid').generateUIDField({
      contentTypeUID: "api::album.album",
      field: "url",
      data: event.params.data
    })
  },
};

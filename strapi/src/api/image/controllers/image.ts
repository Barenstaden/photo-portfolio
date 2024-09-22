/**
 * album controller
 */

import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::image.image', ({strapi}) => ({
  async find(ctx) {
    return await super.find({
      ...ctx,
      query: {
        ...ctx.query
      }
    });
  },
  async findOne(ctx) {
    const res = await super.find({
      ...ctx,
      query: {
        filters: {
          url: {
            $eq: ctx.params.id
          }
        },
        populate: {
          image: {
            populate: 'media'
          },
          comments: true,
          album: {
            populate: {
              images: {
                populate: {
                  image: {
                    populate: 'media'
                  }
                },
                orderBy: 'id'
              }
            },
          }
        }
      }
    });
    return {
      ...res,
      data: res.data?.[0]
    };
  },
}));

/**
 * album controller
 */

import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::album.album', ({strapi}) => ({
  async find(ctx) {
    return await super.find({
      ...ctx,
      query: {
        ...ctx.query,
        populate: {
          cover: {
            populate: ['image']
          }
        }
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
          cover: {
            populate: ['image']
          },
          images: {
            populate: ['image'],
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

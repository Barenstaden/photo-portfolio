FROM node:22-bookworm-slim AS build

WORKDIR /app

ARG STRAPI_URL=https://api.oyvindbjornstad.no
ARG STRAPI_PUBLIC_URL=https://api.oyvindbjornstad.no
ENV STRAPI_URL=${STRAPI_URL}
ENV STRAPI_PUBLIC_URL=${STRAPI_PUBLIC_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app
ENV HOST=0.0.0.0
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV NODE_ENV=production
ENV PORT=3000
ENV STRAPI_URL=https://api.oyvindbjornstad.no
ENV STRAPI_PUBLIC_URL=https://api.oyvindbjornstad.no

COPY --from=build /app/.output ./.output

CMD ["node", ".output/server/index.mjs"]

FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app ./
RUN chmod +x scripts/fly-start.sh

CMD ["sh", "scripts/fly-start.sh"]

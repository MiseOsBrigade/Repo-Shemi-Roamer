FROM node:20.18.1-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml tsconfig.base.json eslint.config.js ./
COPY apps ./apps
COPY packages ./packages
COPY registry ./registry
RUN pnpm install --no-frozen-lockfile
RUN pnpm build
FROM node:20.18.1-alpine AS runtime
ENV NODE_ENV=production MISEOS_HOST=0.0.0.0 MISEOS_PORT=8787
RUN addgroup -S miseos && adduser -S miseos -G miseos
WORKDIR /app
COPY --from=build /app /app
USER miseos
EXPOSE 8787
CMD ["node","apps/api/dist/server.js"]

FROM node:20-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY apps/collab/package.json ./apps/collab/
RUN npm install -g pnpm@10.22.0
RUN pnpm fetch

FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm install -r --offline --frozen-lockfile
WORKDIR /app/apps/collab
RUN pnpm build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV COLLAB_PORT=1234

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 yjs

COPY --from=builder --chown=yjs:nodejs /app/apps/collab/dist ./dist
COPY --from=builder --chown=yjs:nodejs /app/apps/collab/node_modules ./node_modules

USER yjs

EXPOSE 1234

CMD ["node", "dist/index.js"]

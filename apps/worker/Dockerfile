FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/worker/package.json ./apps/worker/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=dependencies /app/packages ./packages

# Copy source
COPY apps/worker ./apps/worker
COPY apps/api/src/db ./apps/api/src/db

# Build
WORKDIR /app/apps/worker
RUN pnpm build

FROM base AS runtime
WORKDIR /app

# Copy built application
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=build /app/apps/worker/node_modules ./node_modules
COPY --from=build /app/apps/api/src/db ./db

# Set environment
ENV NODE_ENV=production

# Run the worker
CMD ["node", "dist/index.js"]

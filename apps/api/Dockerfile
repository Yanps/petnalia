# syntax=docker/dockerfile:1
# PetNalia API (NestJS). Build from the repo root:
#   docker build -f apps/api/Dockerfile -t petnalia-api .
#   docker build -f apps/api/Dockerfile --target migrate -t petnalia-api-migrate .
# Configuration comes from the environment at runtime (validated on startup, see .env.example).

FROM node:22-bookworm-slim AS base
# OpenSSL for the Prisma query engine.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --filter "@petnalia/api..."
RUN pnpm --filter @petnalia/api prisma:generate \
  && pnpm --filter "@petnalia/api..." run build
# Self-contained production tree (prod deps only, workspace packages copied in), then the
# Prisma client generated inside it.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm --filter @petnalia/api deploy --prod --legacy /out \
  && cd /out && /app/apps/api/node_modules/.bin/prisma generate --schema prisma/schema.prisma

# One-off job: apply pending migrations before rolling out a new API version.
# DIRECT_URL is the non-pooled connection Prisma uses for migrations (same as
# DATABASE_URL when there is no connection pooler in front of Postgres).
#   docker run --rm -e DATABASE_URL=... -e DIRECT_URL=... petnalia-api-migrate
FROM build AS migrate
WORKDIR /app/apps/api
CMD ["pnpm", "prisma:migrate:deploy"]

FROM base AS runtime
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=build --chown=node:node /out/package.json ./package.json
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/dist ./dist
COPY --from=build --chown=node:node /out/prisma ./prisma
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main"]

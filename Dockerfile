FROM node:20-alpine AS base

# ─── Dependencies (production only) ─────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Dependencies (all, for build) ──────────────────────────────────────────
FROM base AS dev-deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── Generate Prisma Client ─────────────────────────────────────────────────
FROM dev-deps AS prisma
WORKDIR /app
COPY prisma ./prisma
RUN npx prisma generate

# ─── Build Next.js ───────────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=dev-deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ARG NEXTAUTH_SECRET="build-secret"
ARG NEXTAUTH_URL="http://localhost:3000"

RUN npm run build

# ─── Production Runner ───────────────────────────────────────────────────────
FROM base AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma CLI + client for db push to work at runtime
COPY --from=dev-deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=dev-deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nextjs:nodejs prisma ./prisma

# Create the .bin symlink so `npx prisma` and direct calls work
RUN mkdir -p node_modules/.bin && \
    ln -sf ../prisma/build/index.js node_modules/.bin/prisma

# Copy package.json
COPY --chown=nextjs:nodejs package.json ./

# Copy entrypoint script
COPY --chown=nextjs:nodejs scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]

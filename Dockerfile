FROM node:20-alpine AS base

# ─── Dependencies ────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Also install dev deps for build
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

# ─── Build ───────────────────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=dev-deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build needs these at build time (can be dummy values)
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

# Copy Prisma files for migrations
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --chown=nextjs:nodejs prisma ./prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]

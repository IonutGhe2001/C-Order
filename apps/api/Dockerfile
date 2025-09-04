FROM node:20-alpine
RUN corepack enable
WORKDIR /app

COPY apps/api/package.json apps/api/pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY apps/api ./
RUN pnpm prisma:generate && pnpm build

EXPOSE 3001
CMD sh -c "pnpm prisma migrate deploy && node dist/main.js"
FROM node:20-alpine
RUN corepack enable
WORKDIR /app

COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
# folosește no-frozen-lockfile ca să nu pice dacă lockfile-ul nu e sincron
RUN pnpm install --no-frozen-lockfile

COPY apps/web ./
RUN pnpm build

EXPOSE 5173
CMD ["pnpm","preview","--host","0.0.0.0","--port","5173"]
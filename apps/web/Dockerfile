FROM node:20-alpine
WORKDIR /app
RUN corepack enable

# lockfile + workspace config din root
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# copiem monorepo-ul (filtrează ce nu-ți trebuie prin .dockerignore)
COPY apps ./apps

# instalează DOAR dep-urile pt web
RUN pnpm install --filter ./apps/web... --frozen-lockfile

# build
WORKDIR /app/apps/web
RUN pnpm build

EXPOSE 5173
CMD ["pnpm","preview","--host","0.0.0.0","--port","5173"]
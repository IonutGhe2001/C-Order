
# API
Run:
1. copy `.env.example` to `.env` and adjust
2. pnpm i
3. pnpm prisma:generate
4. pnpm prisma migrate dev --name init
5. pnpm prisma db seed
6. pnpm start:dev

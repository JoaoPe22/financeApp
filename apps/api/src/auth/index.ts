// Instância do better-auth usada pelo middleware src/http/middlewares/auth.ts
// para validar sessões (auth.api.getSession) nas rotas Fastify autenticadas.
// Quem cria/loga usuários de fato é o Next.js (apps/web/src/auth/index.ts) —
// esta instância aqui só lê a mesma tabela de sessão para confirmar quem é o usuário.
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'

import { db } from '@/database'
import { env } from '@/lib/env'

import { ac, ADMIN, AUXILIAR, SUPERVISOR } from './permissions'

const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: 'AUXILIAR',
      ac,
      roles: {
        ADMIN,
        SUPERVISOR,
        AUXILIAR,
      },
    }),
  ],
})

export { auth }

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { v7 as uuidv7 } from 'uuid'

import { db } from '@/database'
import { env } from '@/lib/env'

// Instância "somente leitura" do better-auth: só existe pra validar sessão
// (auth.api.getSession, ver http/middlewares/auth.ts) nas rotas da API.
// A instância "fonte da verdade" — que emite sessão, cadastra, faz login,
// reset de senha, rate limit e envia e-mail — é a do apps/web
// (apps/web/src/auth/index.ts). As duas apontam pro mesmo banco e usam o
// mesmo BETTER_AUTH_SECRET, então uma sessão criada pelo web é válida aqui.
// Configurações como emailAndPassword, rateLimit e hooks só precisam existir
// do lado que emite a sessão (web) — não precisam ser duplicadas aqui.
const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  session: {
    expiresIn: 60 * 60 * 4,
    updateAge: 60 * 5,
  },
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
})

export { auth }

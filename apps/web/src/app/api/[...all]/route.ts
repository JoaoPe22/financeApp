// Ponte entre o better-auth (src/auth/index.ts) e o Next.js: expõe todas as rotas
// de autenticação (sign-in, sign-up, sign-out, sessão, admin/*...) em /api/auth/*.
// É essa rota que o authClient chama por baixo dos panos.
import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/auth'

export const { GET, POST } = toNextJsHandler(auth)

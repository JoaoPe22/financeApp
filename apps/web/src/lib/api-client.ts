import ky from 'ky'

import { env } from '@/lib/env'

// Client HTTP único usado por todos os hooks de src/hooks pra falar com a API
// Fastify (apps/api, ver src/http/server.ts). credentials: 'include' manda o
// cookie de sessão do better-auth em toda chamada — sem isso as rotas
// protegidas (preHandler: authenticate) responderiam 401. O CORS do lado da
// API (fastifyCors em server.ts) precisa liberar exatamente essa origem com
// credentials: true pro navegador aceitar enviar o cookie.
const apiClient = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  retry: 0,
})

export { apiClient }

import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { auth } from '@/auth'

// preHandler usado por toda rota protegida (ver `preHandler: authenticate` nos
// arquivos de rota). Repassa os headers da requisição pro better-auth validar
// o cookie de sessão — o mesmo cookie emitido pela instância "fonte da
// verdade" do apps/web (ver apps/web/src/auth/index.ts) — e pendura o usuário
// autenticado em request.user/request.session pro handler da rota usar.
const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  })

  if (!session) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  request.user = session.user
  request.session = session.session
}

export { authenticate }

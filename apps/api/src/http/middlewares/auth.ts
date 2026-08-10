import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { auth } from '@/auth'

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

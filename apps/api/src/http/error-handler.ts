import type { FastifyInstance } from 'fastify'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { ForbiddenError } from '@/http/routes/_errors/forbidden-error'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

const errorHandler: FastifyErrorHandler = async (error, request, reply) => {
  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof ForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    })
  }

  console.error(error)

  return reply.status(500).send({
    message: 'Erro interno do servidor.',
  })
}

export { errorHandler }

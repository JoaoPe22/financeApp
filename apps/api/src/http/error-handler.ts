// Handler global de erros do Fastify (registrado em src/http/server.ts).
// Converte cada tipo de erro conhecido no status HTTP correspondente;
// qualquer erro não mapeado vira 500 (sem vazar detalhes internos).
import type { FastifyError, FastifyInstance } from 'fastify'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

const errorHandler: FastifyErrorHandler = async (error, _request, reply) => {
  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  // Erro de validação do schema Zod da rota (querystring/body/params inválidos)
  const fastifyError = error as FastifyError
  if (fastifyError.code === 'FST_ERR_VALIDATION' && fastifyError.statusCode) {
    return reply.status(fastifyError.statusCode).send({
      message: fastifyError.message,
      validation: fastifyError.validation,
    })
  }

  console.error(error)

  return reply.status(500).send({
    message: 'Erro interno do servidor.',
  })
}

export { errorHandler }

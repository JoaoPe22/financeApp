import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, reserva } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { reservaBodySchema } from './schema'

const cadastrarReserva = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/reservas',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Reservas'],
        summary: 'Cadastrar reserva',
        description:
          'Endpoint para cadastrar uma nova reserva (emergência ou objetivo guardado).',
        body: reservaBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body } = request
      const userId = request.user!.id

      const [novaReserva] = await db
        .insert(reserva)
        .values({
          userId,
          instituicao: body.instituicao,
          valor: body.valor.toString(),
          rentabilidade: body.rentabilidade.toString(),
        })
        .returning({ id: reserva.id })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'reserva',
        entidadeId: novaReserva.id,
        acao: 'CADASTRAR',
        descricao: `Reserva em "${body.instituicao}" cadastrada com sucesso`,
      })

      return reply.status(201).send({ id: novaReserva.id })
    },
  )
}

export { cadastrarReserva }

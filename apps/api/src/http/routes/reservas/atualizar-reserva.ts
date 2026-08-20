import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, reserva } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { reservaBodySchema } from './schema'

const atualizarReserva = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/reservas/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Reservas'],
        summary: 'Atualizar reserva',
        description: 'Endpoint para atualizar uma reserva já cadastrada.',
        params: z.object({ id: z.uuid() }),
        body: reservaBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [reservaExistente] = await db
        .select({ id: reserva.id })
        .from(reserva)
        .where(and(eq(reserva.id, params.id), eq(reserva.userId, userId)))
        .limit(1)

      if (!reservaExistente) {
        throw new BadRequestError('Reserva não encontrada')
      }

      await db
        .update(reserva)
        .set({
          instituicao: body.instituicao,
          valor: body.valor.toString(),
          rentabilidade: body.rentabilidade.toString(),
        })
        .where(eq(reserva.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'reserva',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Reserva em "${body.instituicao}" atualizada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarReserva }

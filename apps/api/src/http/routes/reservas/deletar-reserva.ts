import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, reserva } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const deletarReserva = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/reservas/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Reservas'],
        summary: 'Deletar reserva',
        description: 'Endpoint para deletar uma reserva já cadastrada.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [reservaExistente] = await db
        .select({ id: reserva.id, instituicao: reserva.instituicao })
        .from(reserva)
        .where(and(eq(reserva.id, params.id), eq(reserva.userId, userId)))
        .limit(1)

      if (!reservaExistente) {
        throw new BadRequestError('Reserva não encontrada')
      }

      await db.delete(reserva).where(eq(reserva.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'reserva',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Reserva em "${reservaExistente.instituicao}" deletada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarReserva }

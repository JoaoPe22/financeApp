import { and, desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { reserva, reservaHistorico } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const reservaHistoricoResponseSchema = z.object({
  id: z.uuid(),
  valor: z.number(),
  variacao: z.number(),
  observacao: z.string().nullable(),
  data: z.string(),
})

const listarHistoricoReserva = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/reservas/:id/historico',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Reservas'],
        summary: 'Listar histórico de uma reserva',
        description:
          'Lista as atualizações de valor registradas para uma reserva, da mais recente para a mais antiga.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.array(reservaHistoricoResponseSchema),
        },
      },
    },
    async (request) => {
      const { params } = request
      const userId = request.user!.id

      const [reservaExistente] = await db
        .select({ id: reserva.id })
        .from(reserva)
        .where(and(eq(reserva.id, params.id), eq(reserva.userId, userId)))
        .limit(1)

      if (!reservaExistente) {
        throw new BadRequestError('Reserva não encontrada')
      }

      const historico = await db
        .select({
          id: reservaHistorico.id,
          valor: reservaHistorico.valor,
          variacao: reservaHistorico.variacao,
          observacao: reservaHistorico.observacao,
          data: reservaHistorico.data,
        })
        .from(reservaHistorico)
        .where(eq(reservaHistorico.reservaId, params.id))
        .orderBy(desc(reservaHistorico.data), desc(reservaHistorico.createdAt))

      return historico.map((item) => ({
        ...item,
        valor: Number(item.valor),
        variacao: Number(item.variacao),
      }))
    },
  )
}

export { listarHistoricoReserva }

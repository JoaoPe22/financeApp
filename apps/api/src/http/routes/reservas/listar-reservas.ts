import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { reserva } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const reservaResponseSchema = z.object({
  id: z.uuid(),
  instituicao: z.string(),
  valor: z.number(),
  rentabilidade: z.number(),
})

const listarReservas = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/reservas',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Reservas'],
        summary: 'Listar reservas',
        description: 'Lista as reservas do usuário autenticado.',
        response: {
          200: z.array(reservaResponseSchema),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      const reservas = await db
        .select({
          id: reserva.id,
          instituicao: reserva.instituicao,
          valor: reserva.valor,
          rentabilidade: reserva.rentabilidade,
        })
        .from(reserva)
        .where(eq(reserva.userId, userId))
        .orderBy(reserva.instituicao)

      return reservas.map((item) => ({
        ...item,
        valor: Number(item.valor),
        rentabilidade: Number(item.rentabilidade),
      }))
    },
  )
}

export { listarReservas }

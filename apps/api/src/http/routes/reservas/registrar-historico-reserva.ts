import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, reserva, reservaHistorico } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { reservaHistoricoBodySchema } from './schema'

const registrarHistoricoReserva = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/reservas/:id/historico',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Reservas'],
        summary: 'Registrar atualização de valor da reserva',
        description:
          'Salva o novo valor da reserva com data e observação, mantendo o histórico de evolução.',
        params: z.object({ id: z.uuid() }),
        body: reservaHistoricoBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [reservaExistente] = await db
        .select({
          id: reserva.id,
          instituicao: reserva.instituicao,
          valor: reserva.valor,
        })
        .from(reserva)
        .where(and(eq(reserva.id, params.id), eq(reserva.userId, userId)))
        .limit(1)

      if (!reservaExistente) {
        throw new BadRequestError('Reserva não encontrada')
      }

      const variacao = body.valor - Number(reservaExistente.valor)

      const [registro] = await db
        .insert(reservaHistorico)
        .values({
          reservaId: params.id,
          valor: body.valor.toString(),
          variacao: variacao.toFixed(2),
          observacao: body.observacao ?? null,
          data: body.data,
        })
        .returning({ id: reservaHistorico.id })

      await db
        .update(reserva)
        .set({ valor: body.valor.toString() })
        .where(eq(reserva.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'reserva',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Valor da reserva em "${reservaExistente.instituicao}" atualizado para ${body.valor}`,
      })

      return reply.status(201).send({ id: registro.id })
    },
  )
}

export { registrarHistoricoReserva }

import { and, asc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { parcela, parcelamento } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const parcelaResponseSchema = z.object({
  id: z.uuid(),
  numero: z.number(),
  valor: z.number(),
  status: z.string(),
  dataVencimento: z.string(),
  dataPagamento: z.string().nullable(),
})

const listarParcelas = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/parcelamentos/:id/parcelas',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Parcelamentos'],
        summary: 'Listar parcelas de um parcelamento',
        description: 'Lista todas as parcelas geradas para um parcelamento.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.array(parcelaResponseSchema),
        },
      },
    },
    async (request) => {
      const { params } = request
      const userId = request.user!.id

      const [parcelamentoExistente] = await db
        .select({ id: parcelamento.id })
        .from(parcelamento)
        .where(and(eq(parcelamento.id, params.id), eq(parcelamento.userId, userId)))
        .limit(1)

      if (!parcelamentoExistente) {
        throw new BadRequestError('Parcelamento não encontrado')
      }

      const parcelas = await db
        .select({
          id: parcela.id,
          numero: parcela.numero,
          valor: parcela.valor,
          status: parcela.status,
          dataVencimento: parcela.dataVencimento,
          dataPagamento: parcela.dataPagamento,
        })
        .from(parcela)
        .where(eq(parcela.parcelamentoId, params.id))
        .orderBy(asc(parcela.numero))

      return parcelas.map((item) => ({
        ...item,
        valor: Number(item.valor),
      }))
    },
  )
}

export { listarParcelas }

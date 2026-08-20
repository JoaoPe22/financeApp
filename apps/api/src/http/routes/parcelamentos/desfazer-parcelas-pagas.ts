import { and, desc, eq, inArray } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, parcela, parcelamento } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const desfazerParcelasPagasBodySchema = z.object({
  quantidade: z.coerce.number().int().min(1),
})

const desfazerParcelasPagas = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/parcelamentos/:id/desfazer-pagamento',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Parcelamentos'],
        summary: 'Desfazer pagamento de parcelas',
        description:
          'Volta para pendente a quantidade informada de parcelas pagas, começando pela mais recente. Corrige o caso de marcar parcela paga por engano.',
        params: z.object({ id: z.uuid() }),
        body: desfazerParcelasPagasBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [parcelamentoExistente] = await db
        .select({ id: parcelamento.id, descricao: parcelamento.descricao })
        .from(parcelamento)
        .where(
          and(eq(parcelamento.id, params.id), eq(parcelamento.userId, userId)),
        )
        .limit(1)

      if (!parcelamentoExistente) {
        throw new BadRequestError('Parcelamento não encontrado')
      }

      // Da mais recente para trás: desfazer a última paga é o caso real de engano
      const parcelasPagas = await db
        .select({ id: parcela.id })
        .from(parcela)
        .where(
          and(
            eq(parcela.parcelamentoId, params.id),
            eq(parcela.status, 'PAGA'),
          ),
        )
        .orderBy(desc(parcela.numero))
        .limit(body.quantidade)

      if (parcelasPagas.length < body.quantidade) {
        throw new BadRequestError(
          `Só existem ${parcelasPagas.length} parcela(s) paga(s)`,
        )
      }

      await db
        .update(parcela)
        .set({ status: 'PENDENTE', dataPagamento: null })
        .where(
          inArray(
            parcela.id,
            parcelasPagas.map((item) => item.id),
          ),
        )

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'parcelamento',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Pagamento de ${body.quantidade} parcela(s) de "${parcelamentoExistente.descricao}" desfeito`,
      })

      return reply.status(200).send()
    },
  )
}

export { desfazerParcelasPagas }

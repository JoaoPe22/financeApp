import { and, asc, eq, inArray } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, parcela, parcelamento } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'
import { hoje } from '@/lib/dayjs'

import { BadRequestError } from '../_errors/bad-request-error'

const marcarParcelasPagasBodySchema = z.object({
  quantidade: z.coerce.number().int().min(1),
})

const marcarParcelasPagas = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/parcelamentos/:id/pagar',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Parcelamentos'],
        summary: 'Marcar parcelas como pagas',
        description:
          'Marca como paga a quantidade informada de parcelas pendentes, começando pela mais antiga.',
        params: z.object({ id: z.uuid() }),
        body: marcarParcelasPagasBodySchema,
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
        .where(and(eq(parcelamento.id, params.id), eq(parcelamento.userId, userId)))
        .limit(1)

      if (!parcelamentoExistente) {
        throw new BadRequestError('Parcelamento não encontrado')
      }

      const parcelasPendentes = await db
        .select({ id: parcela.id })
        .from(parcela)
        .where(
          and(
            eq(parcela.parcelamentoId, params.id),
            // ATRASADA também precisa ser pagável, senão parcela vencida trava
            inArray(parcela.status, ['PENDENTE', 'ATRASADA']),
          ),
        )
        .orderBy(asc(parcela.numero))
        .limit(body.quantidade)

      if (parcelasPendentes.length < body.quantidade) {
        throw new BadRequestError(
          `Só existem ${parcelasPendentes.length} parcela(s) pendente(s)`,
        )
      }

      const idsParaPagar = parcelasPendentes.map((item) => item.id)

      await db
        .update(parcela)
        .set({
          status: 'PAGA',
          dataPagamento: hoje(),
        })
        .where(inArray(parcela.id, idsParaPagar))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'parcelamento',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `${body.quantidade} parcela(s) de "${parcelamentoExistente.descricao}" marcada(s) como paga(s)`,
      })

      return reply.status(200).send()
    },
  )
}

export { marcarParcelasPagas }

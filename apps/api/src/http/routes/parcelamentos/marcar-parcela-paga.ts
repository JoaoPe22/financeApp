import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, parcela, parcelamento } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'
import { hoje } from '@/lib/dayjs'

import { BadRequestError } from '../_errors/bad-request-error'

const marcarParcelaPaga = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/parcelamentos/:parcelamentoId/parcelas/:parcelaId/pagar',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Parcelamentos'],
        summary: 'Marcar uma parcela específica como paga',
        description:
          'Marca como paga a parcela informada, independentemente da posição dela na sequência do parcelamento. Usado na tela de Planejamento, onde o usuário paga a parcela do mês que está vendo.',
        params: z.object({
          parcelamentoId: z.uuid(),
          parcelaId: z.uuid(),
        }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [parcelaExistente] = await db
        .select({
          id: parcela.id,
          status: parcela.status,
          numero: parcela.numero,
          descricao: parcelamento.descricao,
        })
        .from(parcela)
        .innerJoin(parcelamento, eq(parcelamento.id, parcela.parcelamentoId))
        .where(
          and(
            eq(parcela.id, params.parcelaId),
            eq(parcela.parcelamentoId, params.parcelamentoId),
            eq(parcelamento.userId, userId),
          ),
        )
        .limit(1)

      if (!parcelaExistente) {
        throw new BadRequestError('Parcela não encontrada')
      }

      if (
        parcelaExistente.status !== 'PENDENTE' &&
        parcelaExistente.status !== 'ATRASADA'
      ) {
        throw new BadRequestError('Parcela já está paga')
      }

      await db
        .update(parcela)
        .set({ status: 'PAGA', dataPagamento: hoje() })
        .where(eq(parcela.id, params.parcelaId))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'parcelamento',
        entidadeId: params.parcelamentoId,
        acao: 'ATUALIZAR',
        descricao: `Parcela ${parcelaExistente.numero} de "${parcelaExistente.descricao}" marcada como paga`,
      })

      return reply.status(200).send()
    },
  )
}

export { marcarParcelaPaga }

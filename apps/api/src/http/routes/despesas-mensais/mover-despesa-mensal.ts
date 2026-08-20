import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { despesaMensal, log, planejamentoMensal } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'
import { dayjs } from '@/lib/dayjs'
import { encontrarOuCriarPlanejamentoMensal } from '@/lib/planejamento-mensal'

import { BadRequestError } from '../_errors/bad-request-error'

const moverDespesaMensalBodySchema = z.object({
  dataVencimento: z.iso.date(),
})

const moverDespesaMensal = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/despesas-mensais/:id/mover',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Mensais'],
        summary: 'Mover despesa mensal para outra data',
        description:
          'Move a despesa para a data informada, podendo cair em outro mês/ano — nesse caso a despesa passa a pertencer ao planejamento mensal de destino (criando-o se ainda não existir). Útil para casos de despesa não paga ou cadastrada no mês errado.',
        params: z.object({ id: z.uuid() }),
        body: moverDespesaMensalBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [despesaMensalExistente] = await db
        .select({
          id: despesaMensal.id,
          descricao: despesaMensal.descricao,
        })
        .from(despesaMensal)
        .innerJoin(
          planejamentoMensal,
          eq(planejamentoMensal.id, despesaMensal.planejamentoMensalId),
        )
        .where(
          and(
            eq(despesaMensal.id, params.id),
            eq(planejamentoMensal.userId, userId),
          ),
        )
        .limit(1)

      if (!despesaMensalExistente) {
        throw new BadRequestError('Despesa mensal não encontrada')
      }

      const dataVencimento = dayjs(body.dataVencimento)

      await db.transaction(async (tx) => {
        const planejamentoMensalId = await encontrarOuCriarPlanejamentoMensal(
          tx,
          userId,
          dataVencimento.month() + 1,
          dataVencimento.year(),
        )

        await tx
          .update(despesaMensal)
          .set({
            dataVencimento: body.dataVencimento,
            planejamentoMensalId,
          })
          .where(eq(despesaMensal.id, params.id))

        await tx.insert(log).values({
          usuarioId: userId,
          entidade: 'despesa_mensal',
          entidadeId: params.id,
          acao: 'ATUALIZAR',
          descricao: `Despesa "${despesaMensalExistente.descricao}" movida para ${dataVencimento.format('DD/MM/YYYY')}`,
        })
      })

      return reply.status(200).send()
    },
  )
}

export { moverDespesaMensal }

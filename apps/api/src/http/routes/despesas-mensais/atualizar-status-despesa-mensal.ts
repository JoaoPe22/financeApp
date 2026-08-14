import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { despesaMensal, log, planejamentoMensal } from '@/database/schema'
import { statusParcelaEnum } from '@/database/schema/enums'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const atualizarStatusDespesaMensalBodySchema = z.object({
  status: statusParcelaEnum,
})

const atualizarStatusDespesaMensal = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/despesas-mensais/:id/status',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Mensais'],
        summary: 'Atualizar status da despesa mensal',
        description:
          'Marca uma despesa do mês como paga, pendente ou atrasada. Ao marcar como paga, registra a data de pagamento; ao sair de paga, limpa a data.',
        params: z.object({ id: z.uuid() }),
        body: atualizarStatusDespesaMensalBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [despesaMensalExistente] = await db
        .select({ id: despesaMensal.id, descricao: despesaMensal.descricao })
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

      await db
        .update(despesaMensal)
        .set({
          status: body.status,
          dataPagamento:
            body.status === 'PAGA'
              ? new Date().toISOString().slice(0, 10)
              : null,
        })
        .where(eq(despesaMensal.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'despesa_mensal',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Despesa mensal "${despesaMensalExistente.descricao}" marcada como ${body.status}`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarStatusDespesaMensal }

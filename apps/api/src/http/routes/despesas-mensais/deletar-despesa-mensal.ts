import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { despesaMensal, log, planejamentoMensal } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const deletarDespesaMensal = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/despesas-mensais/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Mensais'],
        summary: 'Deletar despesa mensal',
        description:
          'Remove uma despesa daquele mês específico. Se ela tiver vindo de uma despesa fixa, o modelo fixo não é afetado.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
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

      await db.delete(despesaMensal).where(eq(despesaMensal.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'despesa_mensal',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Despesa mensal "${despesaMensalExistente.descricao}" deletada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarDespesaMensal }

import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, planejamentoMensal } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { atualizarSalarioRecebidoBodySchema } from './schema'

const atualizarSalarioRecebido = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/planejamentos-mensais/:id/salario',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Planejamentos Mensais'],
        summary: 'Atualizar salário recebido',
        description: 'Registra o salário líquido efetivamente recebido no mês.',
        params: z.object({ id: z.uuid() }),
        body: atualizarSalarioRecebidoBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [planejamentoExistente] = await db
        .select({ id: planejamentoMensal.id })
        .from(planejamentoMensal)
        .where(
          and(
            eq(planejamentoMensal.id, params.id),
            eq(planejamentoMensal.userId, userId),
          ),
        )
        .limit(1)

      if (!planejamentoExistente) {
        throw new BadRequestError('Planejamento mensal não encontrado')
      }

      await db
        .update(planejamentoMensal)
        .set({ salarioRecebido: body.salarioRecebido.toString() })
        .where(eq(planejamentoMensal.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'planejamento_mensal',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Salário recebido atualizado para ${body.salarioRecebido}`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarSalarioRecebido }

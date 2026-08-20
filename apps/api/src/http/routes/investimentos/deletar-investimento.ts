import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { investimento, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const deletarInvestimento = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/investimentos/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Investimentos'],
        summary: 'Deletar investimento',
        description: 'Endpoint para deletar um investimento já cadastrado.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [investimentoExistente] = await db
        .select({ id: investimento.id, descricao: investimento.descricao })
        .from(investimento)
        .where(
          and(eq(investimento.id, params.id), eq(investimento.userId, userId)),
        )
        .limit(1)

      if (!investimentoExistente) {
        throw new BadRequestError('Investimento não encontrado')
      }

      await db.delete(investimento).where(eq(investimento.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'investimento',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Investimento "${investimentoExistente.descricao}" deletado com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarInvestimento }

import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { despesaFixa, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const deletarDespesaFixa = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/despesas-fixas/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Fixas'],
        summary: 'Deletar despesa fixa',
        description: 'Endpoint para deletar uma despesa fixa já cadastrada.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [despesaFixaExistente] = await db
        .select({ id: despesaFixa.id, descricao: despesaFixa.descricao })
        .from(despesaFixa)
        .where(
          and(eq(despesaFixa.id, params.id), eq(despesaFixa.userId, userId)),
        )
        .limit(1)

      if (!despesaFixaExistente) {
        throw new BadRequestError('Despesa fixa não encontrada')
      }

      await db.delete(despesaFixa).where(eq(despesaFixa.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'despesa_fixa',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Despesa fixa "${despesaFixaExistente.descricao}" deletada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarDespesaFixa }

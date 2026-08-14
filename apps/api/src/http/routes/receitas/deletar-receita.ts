import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, receita } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const deletarReceita = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/receitas/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Receitas'],
        summary: 'Deletar receita',
        description: 'Endpoint para deletar uma receita já lançada.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [receitaExistente] = await db
        .select({ id: receita.id, descricao: receita.descricao })
        .from(receita)
        .where(and(eq(receita.id, params.id), eq(receita.userId, userId)))
        .limit(1)

      if (!receitaExistente) {
        throw new BadRequestError('Receita não encontrada')
      }

      await db.delete(receita).where(eq(receita.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'receita',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Receita "${receitaExistente.descricao}" deletada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarReceita }

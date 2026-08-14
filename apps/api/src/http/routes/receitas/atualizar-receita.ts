import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, log, receita } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { receitaBodySchema } from './schema'

const atualizarReceita = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/receitas/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Receitas'],
        summary: 'Atualizar receita',
        description: 'Endpoint para atualizar uma receita já lançada.',
        params: z.object({ id: z.uuid() }),
        body: receitaBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [receitaExistente] = await db
        .select({ id: receita.id })
        .from(receita)
        .where(and(eq(receita.id, params.id), eq(receita.userId, userId)))
        .limit(1)

      if (!receitaExistente) {
        throw new BadRequestError('Receita não encontrada')
      }

      const [categoriaExistente] = await db
        .select({ id: categoria.id })
        .from(categoria)
        .where(
          and(
            eq(categoria.id, body.categoriaId),
            eq(categoria.userId, userId),
            eq(categoria.tipo, 'RECEITA'),
          ),
        )
        .limit(1)

      if (!categoriaExistente) {
        throw new BadRequestError('Categoria de receita inválida')
      }

      await db
        .update(receita)
        .set({
          categoriaId: body.categoriaId,
          descricao: body.descricao,
          valorBruto: body.valorBruto != null ? body.valorBruto.toString() : null,
          valorLiquido: body.valorLiquido.toString(),
          dataRecebimento: body.dataRecebimento,
          observacao: body.observacao ?? null,
        })
        .where(eq(receita.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'receita',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Receita "${body.descricao}" atualizada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarReceita }

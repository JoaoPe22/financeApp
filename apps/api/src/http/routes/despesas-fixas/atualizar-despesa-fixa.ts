import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, despesaFixa, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { despesaFixaBodySchema } from './schema'

const atualizarDespesaFixa = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/despesas-fixas/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Fixas'],
        summary: 'Atualizar despesa fixa',
        description: 'Endpoint para atualizar uma despesa fixa já cadastrada.',
        params: z.object({ id: z.uuid() }),
        body: despesaFixaBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [despesaFixaExistente] = await db
        .select({ id: despesaFixa.id })
        .from(despesaFixa)
        .where(
          and(eq(despesaFixa.id, params.id), eq(despesaFixa.userId, userId)),
        )
        .limit(1)

      if (!despesaFixaExistente) {
        throw new BadRequestError('Despesa fixa não encontrada')
      }

      const [categoriaExistente] = await db
        .select({ id: categoria.id })
        .from(categoria)
        .where(
          and(
            eq(categoria.id, body.categoriaId),
            eq(categoria.userId, userId),
            eq(categoria.tipo, 'DESPESA'),
          ),
        )
        .limit(1)

      if (!categoriaExistente) {
        throw new BadRequestError('Categoria de despesa inválida')
      }

      await db
        .update(despesaFixa)
        .set({
          categoriaId: body.categoriaId,
          descricao: body.descricao,
          valor: body.valor.toString(),
          diaVencimento: body.diaVencimento,
          obrigatoria: body.obrigatoria,
          ativa: body.ativa,
        })
        .where(eq(despesaFixa.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'despesa_fixa',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Despesa fixa "${body.descricao}" atualizada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarDespesaFixa }

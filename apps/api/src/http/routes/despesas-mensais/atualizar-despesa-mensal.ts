import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import {
  categoria,
  despesaMensal,
  log,
  planejamentoMensal,
} from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { despesaMensalBodySchema } from './schema'

const atualizarDespesaMensal = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/despesas-mensais/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Mensais'],
        summary: 'Atualizar despesa mensal',
        description:
          'Endpoint para atualizar uma despesa de um mês específico (não altera a despesa fixa de origem, se houver).',
        params: z.object({ id: z.uuid() }),
        body: despesaMensalBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [despesaMensalExistente] = await db
        .select({ id: despesaMensal.id })
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
        .update(despesaMensal)
        .set({
          categoriaId: body.categoriaId,
          descricao: body.descricao,
          valor: body.valor.toString(),
          dataVencimento: body.dataVencimento,
          observacao: body.observacao ?? null,
        })
        .where(eq(despesaMensal.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'despesa_mensal',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Despesa mensal "${body.descricao}" atualizada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarDespesaMensal }

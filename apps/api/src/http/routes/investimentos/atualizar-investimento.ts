import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, investimento, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { investimentoBodySchema } from './schema'

const atualizarInvestimento = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/investimentos/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Investimentos'],
        summary: 'Atualizar investimento',
        description: 'Endpoint para atualizar um investimento já cadastrado.',
        params: z.object({ id: z.uuid() }),
        body: investimentoBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [investimentoExistente] = await db
        .select({ id: investimento.id })
        .from(investimento)
        .where(
          and(eq(investimento.id, params.id), eq(investimento.userId, userId)),
        )
        .limit(1)

      if (!investimentoExistente) {
        throw new BadRequestError('Investimento não encontrado')
      }

      const [categoriaExistente] = await db
        .select({ id: categoria.id })
        .from(categoria)
        .where(
          and(
            eq(categoria.id, body.categoriaId),
            eq(categoria.userId, userId),
            eq(categoria.tipo, 'INVESTIMENTO'),
          ),
        )
        .limit(1)

      if (!categoriaExistente) {
        throw new BadRequestError('Categoria de investimento inválida')
      }

      await db
        .update(investimento)
        .set({
          categoriaId: body.categoriaId,
          instituicaoFinanceira: body.instituicaoFinanceira,
          descricao: body.descricao,
          valorAplicado: body.valorAplicado.toString(),
          rentabilidade: body.rentabilidade.toString(),
          indexador: body.indexador,
          liquidez: body.liquidez,
          dataAplicacao: body.dataAplicacao,
          dataVencimento: body.dataVencimento,
        })
        .where(eq(investimento.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'investimento',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Investimento "${body.descricao}" atualizado com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarInvestimento }

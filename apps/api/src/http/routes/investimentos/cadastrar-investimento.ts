import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, investimento, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { investimentoBodySchema } from './schema'

const cadastrarInvestimento = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/investimentos',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Investimentos'],
        summary: 'Cadastrar investimento',
        description: 'Endpoint para cadastrar um novo investimento.',
        body: investimentoBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body } = request
      const userId = request.user!.id

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

      const [novoInvestimento] = await db
        .insert(investimento)
        .values({
          userId,
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
        .returning({ id: investimento.id })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'investimento',
        entidadeId: novoInvestimento.id,
        acao: 'CADASTRAR',
        descricao: `Investimento "${body.descricao}" cadastrado com sucesso`,
      })

      return reply.status(201).send({ id: novoInvestimento.id })
    },
  )
}

export { cadastrarInvestimento }

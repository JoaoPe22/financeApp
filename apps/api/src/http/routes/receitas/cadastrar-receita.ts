import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, log, planejamentoMensal, receita } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { receitaBodySchema } from './schema'

const cadastrarReceitaBodySchema = receitaBodySchema.extend({
  planejamentoMensalId: z.uuid(),
})

const cadastrarReceita = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/receitas',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Receitas'],
        summary: 'Cadastrar receita',
        description: 'Endpoint para lançar uma receita em um mês já aberto.',
        body: cadastrarReceitaBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body } = request
      const userId = request.user!.id

      const [planejamentoExistente] = await db
        .select({ id: planejamentoMensal.id })
        .from(planejamentoMensal)
        .where(
          and(
            eq(planejamentoMensal.id, body.planejamentoMensalId),
            eq(planejamentoMensal.userId, userId),
          ),
        )
        .limit(1)

      if (!planejamentoExistente) {
        throw new BadRequestError('Planejamento mensal não encontrado')
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

      const [novaReceita] = await db
        .insert(receita)
        .values({
          userId,
          categoriaId: body.categoriaId,
          planejamentoMensalId: body.planejamentoMensalId,
          descricao: body.descricao,
          valorBruto:
            body.valorBruto != null ? body.valorBruto.toString() : null,
          valorLiquido: body.valorLiquido.toString(),
          dataRecebimento: body.dataRecebimento,
          observacao: body.observacao ?? null,
        })
        .returning({ id: receita.id })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'receita',
        entidadeId: novaReceita.id,
        acao: 'CADASTRAR',
        descricao: `Receita "${body.descricao}" cadastrada com sucesso`,
      })

      return reply.status(201).send({ id: novaReceita.id })
    },
  )
}

export { cadastrarReceita }

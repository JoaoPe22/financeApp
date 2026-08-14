import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, despesaFixa, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { despesaFixaBodySchema } from './schema'

const cadastrarDespesaFixa = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/despesas-fixas',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Fixas'],
        summary: 'Cadastrar despesa fixa',
        description: 'Endpoint para cadastrar uma nova despesa fixa.',
        body: despesaFixaBodySchema,
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
            eq(categoria.tipo, 'DESPESA'),
          ),
        )
        .limit(1)

      if (!categoriaExistente) {
        throw new BadRequestError('Categoria de despesa inválida')
      }

      const [novaDespesaFixa] = await db
        .insert(despesaFixa)
        .values({
          userId,
          categoriaId: body.categoriaId,
          descricao: body.descricao,
          valor: body.valor.toString(),
          diaVencimento: body.diaVencimento,
          obrigatoria: body.obrigatoria,
          ativa: body.ativa,
        })
        .returning({ id: despesaFixa.id })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'despesa_fixa',
        entidadeId: novaDespesaFixa.id,
        acao: 'CADASTRAR',
        descricao: `Despesa fixa "${body.descricao}" cadastrada com sucesso`,
      })

      return reply.status(201).send({ id: novaDespesaFixa.id })
    },
  )
}

export { cadastrarDespesaFixa }

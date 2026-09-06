import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { contaBancaria, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { contaBancariaBodySchema } from './schema'

const atualizarContaBancaria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/contas-bancarias/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Contas Bancárias'],
        summary: 'Atualizar conta bancária',
        description: 'Endpoint para atualizar uma conta bancária cadastrada.',
        params: z.object({ id: z.uuid() }),
        body: contaBancariaBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [contaExistente] = await db
        .select({ id: contaBancaria.id })
        .from(contaBancaria)
        .where(
          and(
            eq(contaBancaria.id, params.id),
            eq(contaBancaria.userId, userId),
          ),
        )
        .limit(1)

      if (!contaExistente) {
        throw new BadRequestError('Conta bancária não encontrada')
      }

      await db
        .update(contaBancaria)
        .set({
          banco: body.banco,
          agencia: body.agencia ?? null,
          conta: body.conta ?? null,
          apelido: body.apelido ?? null,
        })
        .where(eq(contaBancaria.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'conta_bancaria',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Conta bancária "${body.banco}" atualizada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarContaBancaria }

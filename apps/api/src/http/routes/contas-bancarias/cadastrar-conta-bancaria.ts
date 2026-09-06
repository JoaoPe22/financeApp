import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { contaBancaria, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { contaBancariaBodySchema } from './schema'

const cadastrarContaBancaria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/contas-bancarias',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Contas Bancárias'],
        summary: 'Cadastrar conta bancária',
        description:
          'Endpoint para cadastrar a conta/agência a que um cartão de crédito pertence.',
        body: contaBancariaBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body } = request
      const userId = request.user!.id

      const [novaContaBancaria] = await db
        .insert(contaBancaria)
        .values({
          userId,
          banco: body.banco,
          agencia: body.agencia ?? null,
          conta: body.conta ?? null,
          apelido: body.apelido ?? null,
        })
        .returning({ id: contaBancaria.id })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'conta_bancaria',
        entidadeId: novaContaBancaria.id,
        acao: 'CADASTRAR',
        descricao: `Conta bancária "${body.banco}" cadastrada com sucesso`,
      })

      return reply.status(201).send({ id: novaContaBancaria.id })
    },
  )
}

export { cadastrarContaBancaria }

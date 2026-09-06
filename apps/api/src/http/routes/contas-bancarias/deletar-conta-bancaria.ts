import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { contaBancaria, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const deletarContaBancaria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/contas-bancarias/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Contas Bancárias'],
        summary: 'Deletar conta bancária',
        description:
          'Endpoint para deletar uma conta bancária. As despesas que a referenciam ficam sem conta vinculada.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [contaExistente] = await db
        .select({ id: contaBancaria.id, banco: contaBancaria.banco })
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

      await db.delete(contaBancaria).where(eq(contaBancaria.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'conta_bancaria',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Conta bancária "${contaExistente.banco}" deletada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarContaBancaria }

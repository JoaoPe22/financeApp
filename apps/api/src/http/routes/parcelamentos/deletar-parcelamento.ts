import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, parcelamento } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const deletarParcelamento = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/parcelamentos/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Parcelamentos'],
        summary: 'Deletar parcelamento',
        description:
          'Deleta um parcelamento e todas as suas parcelas (mesmo as já pagas).',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [parcelamentoExistente] = await db
        .select({ id: parcelamento.id, descricao: parcelamento.descricao })
        .from(parcelamento)
        .where(
          and(eq(parcelamento.id, params.id), eq(parcelamento.userId, userId)),
        )
        .limit(1)

      if (!parcelamentoExistente) {
        throw new BadRequestError('Parcelamento não encontrado')
      }

      await db.delete(parcelamento).where(eq(parcelamento.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'parcelamento',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Parcelamento "${parcelamentoExistente.descricao}" deletado com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarParcelamento }

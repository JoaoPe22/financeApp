import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, objetivo } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const deletarObjetivo = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/objetivos/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Objetivos'],
        summary: 'Deletar objetivo',
        description: 'Endpoint para deletar um objetivo já cadastrado.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [objetivoExistente] = await db
        .select({ id: objetivo.id, titulo: objetivo.titulo })
        .from(objetivo)
        .where(and(eq(objetivo.id, params.id), eq(objetivo.userId, userId)))
        .limit(1)

      if (!objetivoExistente) {
        throw new BadRequestError('Objetivo não encontrado')
      }

      await db.delete(objetivo).where(eq(objetivo.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'objetivo',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Objetivo "${objetivoExistente.titulo}" deletado com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarObjetivo }

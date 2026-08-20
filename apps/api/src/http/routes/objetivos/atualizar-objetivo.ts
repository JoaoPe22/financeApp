import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, objetivo } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { objetivoBodySchema } from './schema'

const atualizarObjetivo = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/objetivos/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Objetivos'],
        summary: 'Atualizar objetivo',
        description: 'Endpoint para atualizar um objetivo já cadastrado.',
        params: z.object({ id: z.uuid() }),
        body: objetivoBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [objetivoExistente] = await db
        .select({ id: objetivo.id })
        .from(objetivo)
        .where(and(eq(objetivo.id, params.id), eq(objetivo.userId, userId)))
        .limit(1)

      if (!objetivoExistente) {
        throw new BadRequestError('Objetivo não encontrado')
      }

      await db
        .update(objetivo)
        .set({
          titulo: body.titulo,
          descricao: body.descricao ?? null,
          valorMeta: body.valorMeta.toString(),
          valorAtual: body.valorAtual.toString(),
          prazo: body.prazo,
          status: body.status,
        })
        .where(eq(objetivo.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'objetivo',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Objetivo "${body.titulo}" atualizado com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarObjetivo }

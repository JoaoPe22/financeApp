import { and, desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { objetivo, objetivoHistorico } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const objetivoHistoricoResponseSchema = z.object({
  id: z.uuid(),
  valorAtual: z.number(),
  variacao: z.number(),
  observacao: z.string().nullable(),
  data: z.string(),
})

const listarHistoricoObjetivo = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/objetivos/:id/historico',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Objetivos'],
        summary: 'Listar histórico de um objetivo',
        description:
          'Lista as atualizações de estado registradas para um objetivo, da mais recente para a mais antiga.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.array(objetivoHistoricoResponseSchema),
        },
      },
    },
    async (request) => {
      const { params } = request
      const userId = request.user!.id

      const [objetivoExistente] = await db
        .select({ id: objetivo.id })
        .from(objetivo)
        .where(and(eq(objetivo.id, params.id), eq(objetivo.userId, userId)))
        .limit(1)

      if (!objetivoExistente) {
        throw new BadRequestError('Objetivo não encontrado')
      }

      const historico = await db
        .select({
          id: objetivoHistorico.id,
          valorAtual: objetivoHistorico.valorAtual,
          variacao: objetivoHistorico.variacao,
          observacao: objetivoHistorico.observacao,
          data: objetivoHistorico.data,
        })
        .from(objetivoHistorico)
        .where(eq(objetivoHistorico.objetivoId, params.id))
        .orderBy(
          desc(objetivoHistorico.data),
          desc(objetivoHistorico.createdAt),
        )

      return historico.map((item) => ({
        ...item,
        valorAtual: Number(item.valorAtual),
        variacao: Number(item.variacao),
      }))
    },
  )
}

export { listarHistoricoObjetivo }

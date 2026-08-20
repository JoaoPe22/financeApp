import { asc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { objetivo } from '@/database/schema'
import { statusObjetivoEnum } from '@/database/schema/enums'
import { authenticate } from '@/http/middlewares/auth'

const objetivoResponseSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  descricao: z.string().nullable(),
  valorMeta: z.number(),
  valorAtual: z.number(),
  prazo: z.string(),
  status: statusObjetivoEnum,
})

const listarObjetivos = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/objetivos',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Objetivos'],
        summary: 'Listar objetivos',
        description: 'Lista os objetivos financeiros do usuário autenticado.',
        response: {
          200: z.array(objetivoResponseSchema),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      const objetivos = await db
        .select({
          id: objetivo.id,
          titulo: objetivo.titulo,
          descricao: objetivo.descricao,
          valorMeta: objetivo.valorMeta,
          valorAtual: objetivo.valorAtual,
          prazo: objetivo.prazo,
          status: objetivo.status,
        })
        .from(objetivo)
        .where(eq(objetivo.userId, userId))
        .orderBy(asc(objetivo.prazo))

      return objetivos.map((item) => ({
        ...item,
        valorMeta: Number(item.valorMeta),
        valorAtual: Number(item.valorAtual),
      }))
    },
  )
}

export { listarObjetivos }

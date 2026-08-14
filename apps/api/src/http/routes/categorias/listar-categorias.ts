import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria } from '@/database/schema'
import { tipoCategoriaEnum } from '@/database/schema/enums'
import { authenticate } from '@/http/middlewares/auth'

const categoriaResponseSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  tipo: z.string(),
  cor: z.string(),
  icone: z.string(),
})

const listarCategorias = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/categorias',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Categorias'],
        summary: 'Listar categorias',
        description:
          'Lista as categorias do usuário autenticado, opcionalmente filtradas por tipo.',
        querystring: z.object({
          tipo: tipoCategoriaEnum.optional(),
        }),
        response: {
          200: z.array(categoriaResponseSchema),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id
      const { tipo } = request.query

      return db
        .select({
          id: categoria.id,
          nome: categoria.nome,
          tipo: categoria.tipo,
          cor: categoria.cor,
          icone: categoria.icone,
        })
        .from(categoria)
        .where(
          tipo
            ? and(eq(categoria.userId, userId), eq(categoria.tipo, tipo))
            : eq(categoria.userId, userId),
        )
        .orderBy(categoria.nome)
    },
  )
}

export { listarCategorias }

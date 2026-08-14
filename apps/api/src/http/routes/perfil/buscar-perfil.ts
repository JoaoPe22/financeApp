import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { perfil } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const perfilResponseSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  dataNascimento: z.string(),
  cep: z.string(),
  estado: z.string(),
  cidade: z.string(),
  bairro: z.string(),
  logradouro: z.string(),
  numero: z.string(),
  complemento: z.string().nullable(),
  tipoRenda: z.string(),
  salarioFixo: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const buscarPerfil = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/perfil',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Perfil'],
        summary: 'Buscar perfil',
        description:
          'Retorna o perfil do usuário autenticado, ou null se ainda não cadastrou.',
        response: {
          200: perfilResponseSchema.nullable(),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      const [perfilExistente] = await db
        .select()
        .from(perfil)
        .where(eq(perfil.userId, userId))
        .limit(1)

      if (!perfilExistente) {
        return null
      }

      return {
        ...perfilExistente,
        salarioFixo: perfilExistente.salarioFixo
          ? Number(perfilExistente.salarioFixo)
          : null,
      }
    },
  )
}

export { buscarPerfil }

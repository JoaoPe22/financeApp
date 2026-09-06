import { asc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { contaBancaria } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const contaBancariaResponseSchema = z.object({
  id: z.uuid(),
  banco: z.string(),
  agencia: z.string().nullable(),
  conta: z.string().nullable(),
  apelido: z.string().nullable(),
})

const listarContasBancarias = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/contas-bancarias',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Contas Bancárias'],
        summary: 'Listar contas bancárias',
        description:
          'Lista as contas bancárias do usuário autenticado, usadas para vincular pagamentos no crédito.',
        response: {
          200: z.array(contaBancariaResponseSchema),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      return db
        .select({
          id: contaBancaria.id,
          banco: contaBancaria.banco,
          agencia: contaBancaria.agencia,
          conta: contaBancaria.conta,
          apelido: contaBancaria.apelido,
        })
        .from(contaBancaria)
        .where(eq(contaBancaria.userId, userId))
        .orderBy(asc(contaBancaria.banco))
    },
  )
}

export { listarContasBancarias }

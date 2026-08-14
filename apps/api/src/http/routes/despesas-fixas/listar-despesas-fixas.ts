import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, despesaFixa } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const despesaFixaResponseSchema = z.object({
  id: z.uuid(),
  categoriaId: z.uuid(),
  categoriaNome: z.string(),
  categoriaCor: z.string(),
  descricao: z.string(),
  valor: z.number(),
  diaVencimento: z.number(),
  obrigatoria: z.boolean(),
  ativa: z.boolean(),
})

const listarDespesasFixas = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/despesas-fixas',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Fixas'],
        summary: 'Listar despesas fixas',
        description: 'Lista as despesas fixas do usuário autenticado.',
        response: {
          200: z.array(despesaFixaResponseSchema),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      const despesasFixas = await db
        .select({
          id: despesaFixa.id,
          categoriaId: despesaFixa.categoriaId,
          categoriaNome: categoria.nome,
          categoriaCor: categoria.cor,
          descricao: despesaFixa.descricao,
          valor: despesaFixa.valor,
          diaVencimento: despesaFixa.diaVencimento,
          obrigatoria: despesaFixa.obrigatoria,
          ativa: despesaFixa.ativa,
        })
        .from(despesaFixa)
        .innerJoin(categoria, eq(categoria.id, despesaFixa.categoriaId))
        .where(eq(despesaFixa.userId, userId))
        .orderBy(despesaFixa.diaVencimento)

      return despesasFixas.map((despesa) => ({
        ...despesa,
        valor: Number(despesa.valor),
      }))
    },
  )
}

export { listarDespesasFixas }

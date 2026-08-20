import { desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, investimento } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const investimentoResponseSchema = z.object({
  id: z.uuid(),
  categoriaId: z.uuid(),
  categoriaNome: z.string(),
  categoriaCor: z.string(),
  instituicaoFinanceira: z.string(),
  descricao: z.string(),
  valorAplicado: z.number(),
  rentabilidade: z.number(),
  indexador: z.string(),
  liquidez: z.string(),
  dataAplicacao: z.string(),
  dataVencimento: z.string(),
})

const listarInvestimentos = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/investimentos',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Investimentos'],
        summary: 'Listar investimentos',
        description: 'Lista os investimentos do usuário autenticado.',
        response: {
          200: z.array(investimentoResponseSchema),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      const investimentos = await db
        .select({
          id: investimento.id,
          categoriaId: investimento.categoriaId,
          categoriaNome: categoria.nome,
          categoriaCor: categoria.cor,
          instituicaoFinanceira: investimento.instituicaoFinanceira,
          descricao: investimento.descricao,
          valorAplicado: investimento.valorAplicado,
          rentabilidade: investimento.rentabilidade,
          indexador: investimento.indexador,
          liquidez: investimento.liquidez,
          dataAplicacao: investimento.dataAplicacao,
          dataVencimento: investimento.dataVencimento,
        })
        .from(investimento)
        .innerJoin(categoria, eq(categoria.id, investimento.categoriaId))
        .where(eq(investimento.userId, userId))
        .orderBy(desc(investimento.dataAplicacao))

      return investimentos.map((item) => ({
        ...item,
        valorAplicado: Number(item.valorAplicado),
        rentabilidade: Number(item.rentabilidade),
      }))
    },
  )
}

export { listarInvestimentos }

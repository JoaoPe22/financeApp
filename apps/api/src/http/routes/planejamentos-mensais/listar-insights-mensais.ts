import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/auth'
import { gerarInsights } from '@/lib/regras-insights'
import { montarResumoFinanceiro } from '@/lib/resumo-financeiro'

const insightResponseSchema = z.object({
  tipo: z.enum(['ALERTA', 'SUGESTAO', 'INFO']),
  titulo: z.string(),
  descricao: z.string(),
})

const listarInsightsMensais = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/planejamentos-mensais/:mes/:ano/insights',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Planejamentos Mensais'],
        summary: 'Listar insights do mês',
        description:
          'Calcula, sob demanda e sem persistir nada, sugestões de apoio à decisão financeira com base no perfil e nos dados do mês/ano informado e do mês seguinte.',
        params: z.object({
          mes: z.coerce.number().int().min(1).max(12),
          ano: z.coerce.number().int().min(2000).max(2100),
        }),
        response: {
          200: z.object({ insights: z.array(insightResponseSchema) }),
        },
      },
    },
    async (request) => {
      const { mes, ano } = request.params
      const userId = request.user!.id

      const resumo = await montarResumoFinanceiro(userId, mes, ano)

      return { insights: gerarInsights(resumo) }
    },
  )
}

export { listarInsightsMensais }

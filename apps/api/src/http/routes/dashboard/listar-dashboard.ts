import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/auth'
import { montarDashboard } from '@/lib/dashboard'

const dashboardResponseSchema = z.object({
  historicoSaldo: z.array(
    z.object({ mes: z.number(), ano: z.number(), saldo: z.number() }),
  ),
  gastosPorCategoria: z.array(
    z.object({ categoriaNome: z.string(), categoriaCor: z.string(), valor: z.number() }),
  ),
  parcelamentos: z.array(
    z.object({ descricao: z.string(), totalPago: z.number(), totalPendente: z.number() }),
  ),
  metaReserva: z
    .object({ totalReservado: z.number(), meta: z.number() })
    .nullable(),
  despesasPesadas: z.array(
    z.object({ descricao: z.string(), categoriaNome: z.string(), valor: z.number() }),
  ),
  receitaVsDespesa: z.object({
    totalReceitas: z.number(),
    totalDespesas: z.number(),
    salario: z.number(),
  }),
  lembretes: z.array(
    z.object({
      descricao: z.string(),
      valor: z.number(),
      dataVencimento: z.string(),
      tipo: z.enum(['DESPESA', 'PARCELA']),
    }),
  ),
  avisos: z.array(
    z.object({
      tipo: z.enum(['ALERTA', 'SUGESTAO', 'INFO']),
      titulo: z.string(),
      descricao: z.string(),
    }),
  ),
})

const listarDashboard = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/dashboard',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Dashboard'],
        summary: 'Buscar dados do dashboard',
        description:
          'Agrega os dados financeiros do usuário (histórico de saldo, gastos por categoria, parcelamentos, meta de reserva, despesas mais pesadas, lembretes de vencimento e avisos) para o mês atual.',
        response: {
          200: dashboardResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      return montarDashboard(userId)
    },
  )
}

export { listarDashboard }

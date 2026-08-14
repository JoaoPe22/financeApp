import { z } from 'zod'

const planejamentoMensalParamsSchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(2000).max(2100),
})

const abrirPlanejamentoMensalBodySchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(2000).max(2100),
})

const atualizarSalarioRecebidoBodySchema = z.object({
  salarioRecebido: z.coerce.number().min(0),
})

export {
  abrirPlanejamentoMensalBodySchema,
  atualizarSalarioRecebidoBodySchema,
  planejamentoMensalParamsSchema,
}

import { z } from 'zod'

const reservaBodySchema = z.object({
  instituicao: z.string().nonempty(),
  valor: z.coerce.number().min(0),
  rentabilidade: z.coerce.number().min(0),
})

const reservaHistoricoBodySchema = z.object({
  valor: z.coerce.number().min(0),
  observacao: z.string().nullable().optional(),
  data: z.iso.date(),
})

export { reservaBodySchema, reservaHistoricoBodySchema }

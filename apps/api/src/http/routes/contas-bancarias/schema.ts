import { z } from 'zod'

const contaBancariaBodySchema = z.object({
  banco: z.string().nonempty(),
  agencia: z.string().nullable().optional(),
  conta: z.string().nullable().optional(),
  apelido: z.string().nullable().optional(),
})

export { contaBancariaBodySchema }

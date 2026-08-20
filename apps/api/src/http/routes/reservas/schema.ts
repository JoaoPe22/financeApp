import { z } from 'zod'

const reservaBodySchema = z.object({
  instituicao: z.string().nonempty(),
  valor: z.coerce.number().min(0),
  rentabilidade: z.coerce.number().min(0),
})

export { reservaBodySchema }

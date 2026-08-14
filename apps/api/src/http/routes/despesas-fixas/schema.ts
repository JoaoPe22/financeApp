import { z } from 'zod'

const despesaFixaBodySchema = z.object({
  categoriaId: z.uuid(),
  descricao: z.string().nonempty(),
  valor: z.coerce.number().min(0),
  diaVencimento: z.coerce.number().int().min(1).max(31),
  obrigatoria: z.boolean().default(true),
  ativa: z.boolean().default(true),
})

export { despesaFixaBodySchema }

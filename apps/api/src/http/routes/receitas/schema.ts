import { z } from 'zod'

const receitaBodySchema = z.object({
  categoriaId: z.uuid(),
  descricao: z.string().nonempty(),
  valorBruto: z.coerce.number().min(0).nullable().optional(),
  valorLiquido: z.coerce.number().min(0),
  dataRecebimento: z.iso.date(),
  observacao: z.string().nullable().optional(),
})

export { receitaBodySchema }

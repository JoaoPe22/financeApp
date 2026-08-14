import { z } from 'zod'

const despesaMensalBodySchema = z.object({
  categoriaId: z.uuid(),
  descricao: z.string().nonempty(),
  valor: z.coerce.number().min(0),
  dataVencimento: z.iso.date(),
  observacao: z.string().nullable().optional(),
})

export { despesaMensalBodySchema }

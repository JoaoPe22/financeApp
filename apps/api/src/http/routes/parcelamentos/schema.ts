import { z } from 'zod'

const parcelamentoBodySchema = z.object({
  categoriaId: z.uuid(),
  descricao: z.string().nonempty(),
  valorTotal: z.coerce.number().min(0),
  valorEntrada: z.coerce.number().min(0).nullable().optional(),
  quantidadeParcelas: z.coerce.number().int().min(1),
  dataPrimeiraParcela: z.iso.date(),
})

export { parcelamentoBodySchema }

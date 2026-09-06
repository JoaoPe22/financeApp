import { z } from 'zod'

import { formaPagamentoEnum } from '@/database/schema/enums'

const despesaMensalBodySchema = z.object({
  categoriaId: z.uuid(),
  descricao: z.string().nonempty(),
  valor: z.coerce.number().min(0),
  dataVencimento: z.iso.date(),
  formaPagamento: formaPagamentoEnum.nullable().optional(),
  contaBancariaId: z.uuid().nullable().optional(),
  observacao: z.string().nullable().optional(),
})

export { despesaMensalBodySchema }

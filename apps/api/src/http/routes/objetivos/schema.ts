import { z } from 'zod'

import { statusObjetivoEnum } from '@/database/schema/enums'

const objetivoBodySchema = z.object({
  titulo: z.string().nonempty(),
  descricao: z.string().nullable().optional(),
  valorMeta: z.coerce.number().min(0),
  valorAtual: z.coerce.number().min(0).default(0),
  prazo: z.iso.date(),
  status: statusObjetivoEnum.default('ATIVO'),
})

export { objetivoBodySchema }

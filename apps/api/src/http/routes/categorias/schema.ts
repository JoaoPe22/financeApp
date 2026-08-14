import { z } from 'zod'

import { tipoCategoriaEnum } from '@/database/schema/enums'

const categoriaBodySchema = z.object({
  nome: z.string().nonempty(),
  tipo: tipoCategoriaEnum,
  cor: z.string().nonempty(),
  icone: z.string().nonempty(),
})

export { categoriaBodySchema }

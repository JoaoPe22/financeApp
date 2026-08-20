import { z } from 'zod'

const investimentoBodySchema = z
  .object({
    categoriaId: z.uuid(),
    instituicaoFinanceira: z.string().nonempty(),
    descricao: z.string().nonempty(),
    valorAplicado: z.coerce.number().min(0),
    rentabilidade: z.coerce.number().min(0),
    indexador: z.string().nonempty(),
    liquidez: z.string().nonempty(),
    dataAplicacao: z.iso.date(),
    dataVencimento: z.iso.date(),
  })
  .refine((data) => data.dataVencimento >= data.dataAplicacao, {
    message: 'A data de vencimento não pode ser anterior à data de aplicação',
    path: ['dataVencimento'],
  })

export { investimentoBodySchema }

import { z } from 'zod'

import { tipoRendaEnum } from '@/database/schema/enums'

const perfilBodySchema = z
  .object({
    dataNascimento: z.iso.date(),
    cep: z.string().nonempty(),
    estado: z.string().nonempty(),
    cidade: z.string().nonempty(),
    bairro: z.string().nonempty(),
    logradouro: z.string().nonempty(),
    numero: z.string().nonempty(),
    complemento: z.string().nullable().optional(),
    tipoRenda: tipoRendaEnum,
    salarioFixo: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) => {
      const maiorDeIdade = new Date()
      maiorDeIdade.setFullYear(maiorDeIdade.getFullYear() - 18)
      return new Date(data.dataNascimento) <= maiorDeIdade
    },
    {
      message: 'É necessário ter pelo menos 18 anos',
      path: ['dataNascimento'],
    },
  )

export { perfilBodySchema }

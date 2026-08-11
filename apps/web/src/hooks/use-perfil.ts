import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { tipoRendaEnum } from '@/types/perfil'

const ufEnum = z.enum([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
])

const perfilSchema = z.object({
  dataNascimento: z.iso.date({ message: 'Data de nascimento inválida' }),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  estado: ufEnum,
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().max(255).optional(),
  tipoRenda: tipoRendaEnum,
  salarioFixo: z.coerce.number().min(0).optional(),
}).refine((data) => {
  const maiorDeIdade = new Date()
  maiorDeIdade.setFullYear(maiorDeIdade.getFullYear() - 18)
  return new Date(data.dataNascimento) <= maiorDeIdade
}, { message: 'É necessário ter pelo menos 18 anos', path: ['dataNascimento'] })

type PerfilFormData = z.infer<typeof perfilSchema>

const useSavePerfil = () =>
  useMutation<void, Error, PerfilFormData>({
    mutationFn: (data) => apiClient.post('perfil', { json: data }).json(),
    onSuccess: () => {
      toast.success('Perfil salvo com sucesso!')
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })

export { perfilSchema, useSavePerfil }
export type { PerfilFormData }

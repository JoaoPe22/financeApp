import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import { toast } from 'sonner'
import { z } from 'zod'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'

const tipoRendaEnum = z.enum(['SALARIO', 'AUTONOMO', 'RENDIMENTO', 'OUTRO'])

const perfilSchema = z.object({
  dataNascimento: z.iso.date(),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  estado: z.string().length(2),
  cidade: z.string().min(1),
  bairro: z.string().min(1),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  complemento: z.string().optional(),
  tipoRenda: tipoRendaEnum,
  salarioFixo: z.number().min(0).optional(),
}).refine((data) => {
  const eighteenYearsAgo = new Date()
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18)
  return new Date(data.dataNascimento) <= eighteenYearsAgo
}, { message: 'É necessário ter pelo menos 18 anos', path: ['dataNascimento'] })

type PerfilFormData = z.infer<typeof perfilSchema>
type Perfil = PerfilFormData & { userId: string; createdAt: string; updatedAt: string }

const PERFIL_QUERY_KEY = ['perfil'] as const

const usePerfil = () =>
  useQuery<Perfil | null>({
    queryKey: PERFIL_QUERY_KEY,
    queryFn: async () => {
      try {
        return await apiClient.get('perfil').json<Perfil>()
      } catch (error) {
        if (error instanceof HTTPError && error.response.status === 404) {
          return null
        }
        throw error
      }
    },
  })

const useSavePerfil = () => {
  const queryClient = useQueryClient()

  return useMutation<Perfil, Error, PerfilFormData>({
    mutationFn: (data) => apiClient.put('perfil', { json: data }).json<Perfil>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFIL_QUERY_KEY })
      toast.success('Perfil salvo com sucesso!')
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export { perfilSchema, usePerfil, useSavePerfil }
export type { PerfilFormData }

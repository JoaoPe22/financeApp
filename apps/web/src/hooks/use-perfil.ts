import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { Perfil } from '@/types/perfil'

interface PerfilPayload {
  dataNascimento: string
  cep: string
  estado: string
  cidade: string
  bairro: string
  logradouro: string
  numero: string
  complemento?: string | null
  tipoRenda: string
  salarioFixo?: number
}

const usePerfil = () =>
  useQuery({
    queryKey: ['perfil'],
    queryFn: () => apiClient.get('perfil').json<Perfil | null>(),
  })

const useSavePerfil = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, PerfilPayload>({
    mutationFn: (data) => apiClient.post('perfil', { json: data }).json(),
    onSuccess: () => {
      toast.success('Perfil salvo com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['perfil'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useUpdatePerfil = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, PerfilPayload>({
    mutationFn: (data) => apiClient.patch('perfil', { json: data }).json(),
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['perfil'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export { usePerfil, useSavePerfil, useUpdatePerfil }

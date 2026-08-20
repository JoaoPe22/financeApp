import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { Objetivo, StatusObjetivo } from '@/types/objetivo'

interface ObjetivoPayload {
  titulo: string
  descricao?: string | null
  valorMeta: number
  valorAtual: number
  prazo: string
  status: StatusObjetivo
}

const useObjetivos = () =>
  useQuery({
    queryKey: ['objetivos'],
    queryFn: () => apiClient.get('objetivos').json<Objetivo[]>(),
  })

const useSalvarObjetivo = () => {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, ObjetivoPayload>({
    mutationFn: (data) => apiClient.post('objetivos', { json: data }).json(),
    onSuccess: () => {
      toast.success('Objetivo criado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['objetivos'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarObjetivo = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ObjetivoPayload & { id: string }>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`objetivos/${id}`, { json: data }).json(),
    onSuccess: () => {
      toast.success('Objetivo atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['objetivos'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDeletarObjetivo = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`objetivos/${id}`).json(),
    onSuccess: () => {
      toast.success('Objetivo removido com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['objetivos'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export {
  useAtualizarObjetivo,
  useDeletarObjetivo,
  useObjetivos,
  useSalvarObjetivo,
}

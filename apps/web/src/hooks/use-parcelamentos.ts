import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { Parcela, Parcelamento } from '@/types/parcelamento'

interface ParcelamentoPayload {
  categoriaId: string
  descricao: string
  valorTotal: number
  valorEntrada?: number | null
  quantidadeParcelas: number
  dataPrimeiraParcela: string
}

const useParcelamentos = () =>
  useQuery({
    queryKey: ['parcelamentos'],
    queryFn: () => apiClient.get('parcelamentos').json<Parcelamento[]>(),
  })

const useParcelas = (parcelamentoId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['parcelamentos', parcelamentoId, 'parcelas'],
    queryFn: () =>
      apiClient.get(`parcelamentos/${parcelamentoId}/parcelas`).json<Parcela[]>(),
    enabled,
  })

const useSalvarParcelamento = () => {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, ParcelamentoPayload>({
    mutationFn: (data) => apiClient.post('parcelamentos', { json: data }).json(),
    onSuccess: () => {
      toast.success('Parcelamento criado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['parcelamentos'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useMarcarParcelasPagas = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; quantidade: number }>({
    mutationFn: ({ id, quantidade }) =>
      apiClient.patch(`parcelamentos/${id}/pagar`, { json: { quantidade } }).json(),
    onSuccess: (_data, { id }) => {
      toast.success('Parcelas marcadas como pagas!')
      queryClient.invalidateQueries({ queryKey: ['parcelamentos'] })
      queryClient.invalidateQueries({ queryKey: ['parcelamentos', id, 'parcelas'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDeletarParcelamento = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`parcelamentos/${id}`).json(),
    onSuccess: () => {
      toast.success('Parcelamento removido com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['parcelamentos'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export {
  useDeletarParcelamento,
  useMarcarParcelasPagas,
  useParcelamentos,
  useParcelas,
  useSalvarParcelamento,
}

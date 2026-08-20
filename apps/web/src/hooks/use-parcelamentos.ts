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
      // Parcelas aparecem também no planejamento mensal (qualquer mês em que
      // caiam) — invalida todas as queries de planejamento pra refletir lá também.
      queryClient.invalidateQueries({ queryKey: ['planejamento-mensal'] })
      queryClient.invalidateQueries({ queryKey: ['insights-mensais'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarParcelamento = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ParcelamentoPayload & { id: string }>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`parcelamentos/${id}`, { json: data }).json(),
    onSuccess: () => {
      toast.success('Parcelamento atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['parcelamentos'] })
      // As parcelas são regeradas: os meses afetados mudam junto
      queryClient.invalidateQueries({ queryKey: ['planejamento-mensal'] })
      queryClient.invalidateQueries({ queryKey: ['insights-mensais'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDesfazerParcelasPagas = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string, quantidade: number }>({
    mutationFn: ({ id, quantidade }) =>
      apiClient
        .patch(`parcelamentos/${id}/desfazer-pagamento`, { json: { quantidade } })
        .json(),
    onSuccess: (_data, { id }) => {
      toast.success('Pagamento desfeito!')
      queryClient.invalidateQueries({ queryKey: ['parcelamentos'] })
      queryClient.invalidateQueries({ queryKey: ['parcelamentos', id, 'parcelas'] })
      queryClient.invalidateQueries({ queryKey: ['planejamento-mensal'] })
      queryClient.invalidateQueries({ queryKey: ['insights-mensais'] })
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
  useAtualizarParcelamento,
  useDeletarParcelamento,
  useDesfazerParcelasPagas,
  useMarcarParcelasPagas,
  useParcelamentos,
  useParcelas,
  useSalvarParcelamento,
}

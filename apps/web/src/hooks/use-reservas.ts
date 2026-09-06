import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { Reserva, ReservaHistorico } from '@/types/reserva'

interface ReservaPayload {
  instituicao: string
  valor: number
  rentabilidade: number
}

interface ReservaHistoricoPayload {
  id: string
  valor: number
  observacao?: string | null
  data: string
}

const useReservas = () =>
  useQuery({
    queryKey: ['reservas'],
    queryFn: () => apiClient.get('reservas').json<Reserva[]>(),
  })

const useSalvarReserva = () => {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, ReservaPayload>({
    mutationFn: (data) => apiClient.post('reservas', { json: data }).json(),
    onSuccess: () => {
      toast.success('Reserva criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarReserva = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ReservaPayload & { id: string }>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`reservas/${id}`, { json: data }).json(),
    onSuccess: () => {
      toast.success('Reserva atualizada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDeletarReserva = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`reservas/${id}`).json(),
    onSuccess: () => {
      toast.success('Reserva removida com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useHistoricoReserva = (reservaId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['reservas', reservaId, 'historico'],
    queryFn: () =>
      apiClient.get(`reservas/${reservaId}/historico`).json<ReservaHistorico[]>(),
    enabled,
  })

const useRegistrarHistoricoReserva = () => {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, ReservaHistoricoPayload>({
    mutationFn: ({ id, ...data }) =>
      apiClient.post(`reservas/${id}/historico`, { json: data }).json(),
    onSuccess: (_data, { id }) => {
      toast.success('Valor da reserva atualizado!')
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      queryClient.invalidateQueries({ queryKey: ['reservas', id, 'historico'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export {
  useAtualizarReserva,
  useDeletarReserva,
  useHistoricoReserva,
  useRegistrarHistoricoReserva,
  useReservas,
  useSalvarReserva,
}

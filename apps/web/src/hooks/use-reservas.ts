import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { Reserva } from '@/types/reserva'

interface ReservaPayload {
  instituicao: string
  valor: number
  rentabilidade: number
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

export {
  useAtualizarReserva,
  useDeletarReserva,
  useReservas,
  useSalvarReserva,
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { DespesaFixa } from '@/types/despesa-fixa'

interface DespesaFixaPayload {
  categoriaId: string
  descricao: string
  valor: number
  diaVencimento: number
  obrigatoria: boolean
  ativa: boolean
}

const useDespesasFixas = () =>
  useQuery({
    queryKey: ['despesas-fixas'],
    queryFn: () => apiClient.get('despesas-fixas').json<DespesaFixa[]>(),
  })

const useSalvarDespesaFixa = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DespesaFixaPayload>({
    mutationFn: (data) =>
      apiClient.post('despesas-fixas', { json: data }).json(),
    onSuccess: () => {
      toast.success('Despesa fixa criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['despesas-fixas'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarDespesaFixa = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DespesaFixaPayload & { id: string }>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`despesas-fixas/${id}`, { json: data }).json(),
    onSuccess: () => {
      toast.success('Despesa fixa atualizada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['despesas-fixas'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDeletarDespesaFixa = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`despesas-fixas/${id}`).json(),
    onSuccess: () => {
      toast.success('Despesa fixa removida com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['despesas-fixas'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export {
  useAtualizarDespesaFixa,
  useDeletarDespesaFixa,
  useDespesasFixas,
  useSalvarDespesaFixa,
}

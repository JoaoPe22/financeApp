import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { ContaBancaria } from '@/types/conta-bancaria'

interface ContaBancariaPayload {
  banco: string
  agencia?: string | null
  conta?: string | null
  apelido?: string | null
}

const useContasBancarias = () =>
  useQuery({
    queryKey: ['contas-bancarias'],
    queryFn: () => apiClient.get('contas-bancarias').json<ContaBancaria[]>(),
  })

const useSalvarContaBancaria = () => {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, ContaBancariaPayload>({
    mutationFn: (data) =>
      apiClient.post('contas-bancarias', { json: data }).json(),
    onSuccess: () => {
      toast.success('Conta bancária criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['contas-bancarias'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarContaBancaria = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ContaBancariaPayload & { id: string }>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`contas-bancarias/${id}`, { json: data }).json(),
    onSuccess: () => {
      toast.success('Conta bancária atualizada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['contas-bancarias'] })
      // As despesas mostram o nome da conta junto — recarrega o mês também
      queryClient.invalidateQueries({ queryKey: ['planejamento-mensal'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDeletarContaBancaria = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`contas-bancarias/${id}`).json(),
    onSuccess: () => {
      toast.success('Conta bancária removida com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['contas-bancarias'] })
      // As despesas que apontavam pra ela ficam sem conta vinculada
      queryClient.invalidateQueries({ queryKey: ['planejamento-mensal'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export {
  useAtualizarContaBancaria,
  useContasBancarias,
  useDeletarContaBancaria,
  useSalvarContaBancaria,
}

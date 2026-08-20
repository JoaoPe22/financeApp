import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import { Investimento } from '@/types/investimento'

interface InvestimentoPayload {
  categoriaId: string
  instituicaoFinanceira: string
  descricao: string
  valorAplicado: number
  rentabilidade: number
  indexador: string
  liquidez: string
  dataAplicacao: string
  dataVencimento: string
}

const useInvestimentos = () =>
  useQuery({
    queryKey: ['investimentos'],
    queryFn: () => apiClient.get('investimentos').json<Investimento[]>(),
  })

const useSalvarInvestimento = () => {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, InvestimentoPayload>({
    mutationFn: (data) =>
      apiClient.post('investimentos', { json: data }).json(),
    onSuccess: () => {
      toast.success('Investimento criado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['investimentos'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarInvestimento = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, InvestimentoPayload & { id: string }>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`investimentos/${id}`, { json: data }).json(),
    onSuccess: () => {
      toast.success('Investimento atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['investimentos'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDeletarInvestimento = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`investimentos/${id}`).json(),
    onSuccess: () => {
      toast.success('Investimento removido com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['investimentos'] })
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export {
  useAtualizarInvestimento,
  useDeletarInvestimento,
  useInvestimentos,
  useSalvarInvestimento,
}

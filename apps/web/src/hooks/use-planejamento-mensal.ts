import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api-client'
import { extractErrorMessage } from '@/lib/error-handler'
import {
  PlanejamentoMensalResponse,
  StatusDespesaMensal,
} from '@/types/planejamento-mensal'

interface DespesaMensalPayload {
  categoriaId: string
  descricao: string
  valor: number
  dataVencimento: string
  observacao?: string | null
}

const planejamentoMensalQueryKey = (mes: number, ano: number) => [
  'planejamento-mensal',
  mes,
  ano,
]

const usePlanejamentoMensal = (mes: number, ano: number) =>
  useQuery({
    queryKey: planejamentoMensalQueryKey(mes, ano),
    queryFn: () =>
      apiClient
        .get(`planejamentos-mensais/${mes}/${ano}`)
        .json<PlanejamentoMensalResponse>(),
  })

const useInvalidarPlanejamentoMensal = (mes: number, ano: number) => {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: planejamentoMensalQueryKey(mes, ano),
    })
}

const useAbrirPlanejamentoMensal = (mes: number, ano: number) => {
  const invalidar = useInvalidarPlanejamentoMensal(mes, ano)

  return useMutation<{ id: string }, Error, void>({
    mutationFn: () =>
      apiClient
        .post('planejamentos-mensais/abrir', { json: { mes, ano } })
        .json(),
    onSuccess: () => {
      toast.success('Despesas fixas puxadas para o mês com sucesso!')
      invalidar()
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarSalarioRecebido = (mes: number, ano: number) => {
  const invalidar = useInvalidarPlanejamentoMensal(mes, ano)

  return useMutation<void, Error, { id: string; salarioRecebido: number }>({
    mutationFn: ({ id, salarioRecebido }) =>
      apiClient
        .patch(`planejamentos-mensais/${id}/salario`, {
          json: { salarioRecebido },
        })
        .json(),
    onSuccess: () => {
      toast.success('Salário recebido atualizado com sucesso!')
      invalidar()
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useSalvarDespesaMensal = (mes: number, ano: number) => {
  const invalidar = useInvalidarPlanejamentoMensal(mes, ano)

  return useMutation<
    void,
    Error,
    DespesaMensalPayload & { planejamentoMensalId: string }
  >({
    mutationFn: (data) =>
      apiClient.post('despesas-mensais', { json: data }).json(),
    onSuccess: () => {
      toast.success('Despesa adicionada com sucesso!')
      invalidar()
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarDespesaMensal = (mes: number, ano: number) => {
  const invalidar = useInvalidarPlanejamentoMensal(mes, ano)

  return useMutation<void, Error, DespesaMensalPayload & { id: string }>({
    mutationFn: ({ id, ...data }) =>
      apiClient.patch(`despesas-mensais/${id}`, { json: data }).json(),
    onSuccess: () => {
      toast.success('Despesa atualizada com sucesso!')
      invalidar()
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useAtualizarStatusDespesaMensal = (mes: number, ano: number) => {
  const invalidar = useInvalidarPlanejamentoMensal(mes, ano)

  return useMutation<void, Error, { id: string; status: StatusDespesaMensal }>({
    mutationFn: ({ id, status }) =>
      apiClient
        .patch(`despesas-mensais/${id}/status`, { json: { status } })
        .json(),
    onSuccess: invalidar,
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

const useDeletarDespesaMensal = (mes: number, ano: number) => {
  const invalidar = useInvalidarPlanejamentoMensal(mes, ano)

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`despesas-mensais/${id}`).json(),
    onSuccess: () => {
      toast.success('Despesa removida com sucesso!')
      invalidar()
    },
    async onError(error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    },
  })
}

export {
  useAbrirPlanejamentoMensal,
  useAtualizarDespesaMensal,
  useAtualizarSalarioRecebido,
  useAtualizarStatusDespesaMensal,
  useDeletarDespesaMensal,
  usePlanejamentoMensal,
  useSalvarDespesaMensal,
}

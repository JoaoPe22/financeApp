import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { Insight } from '@/types/insight'

const useInsightsMensais = (mes: number, ano: number) =>
  useQuery({
    queryKey: ['insights-mensais', mes, ano],
    queryFn: () =>
      apiClient
        .get(`planejamentos-mensais/${mes}/${ano}/insights`)
        .json<{ insights: Insight[] }>(),
  })

export { useInsightsMensais }
